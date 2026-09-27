-- Sólo se corrigen los exámenes marcados para corrección.
--
-- El simulacro y las prácticas fueron de prueba: no se corrigen. Sin esta
-- marca, el reparto automático también asignaba sus entregas, y la estación
-- las mostraba mezcladas con el parcial. Ahora grading_enabled decide las dos
-- cosas: qué exámenes aparecen en la estación y cuáles se reparten solos.
-- Para el segundo parcial y el recuperatorio hay que ponerla en true.

alter table exam_private.exams
  add column grading_enabled boolean not null default false;

update exam_private.exams set grading_enabled = true where slug = 'parcial-1-2026';

create or replace function exam_private.assign_grader_on_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course text;
  v_enabled boolean;
  v_grader uuid;
  v_assignment bigint;
begin
  if new.status not in ('submitted', 'timed_out')
     or old.status is not distinct from new.status
     or new.grading_status is distinct from 'unassigned' then
    return null;
  end if;

  select course_id, grading_enabled into v_course, v_enabled
  from exam_private.exams where id = new.exam_id;
  if not v_enabled then
    return null;
  end if;
  -- Dos entregas simultáneas no pueden leer el mismo conteo y caer juntas.
  perform pg_advisory_xact_lock(hashtext('reparto:' || new.exam_id::text));

  select gp.user_id into v_grader
  from exam_private.grader_profiles gp
  where gp.active and gp.course_id = v_course
  order by (
      select count(*)
      from exam_private.grading_assignments ga
      join exam_private.attempts a on a.id = ga.attempt_id
      where ga.grader_user_id = gp.user_id
        and a.exam_id = new.exam_id
        and ga.released_at is null
    ),
    md5(new.id::text || ':' || gp.user_id::text)
  limit 1;

  if v_grader is null then
    return null;
  end if;

  insert into exam_private.grading_assignments (attempt_id, grader_user_id)
  values (new.id, v_grader)
  returning id into v_assignment;

  update exam_private.attempts
  set grading_status = 'in_review',
      grading_version = grading_version + 1
  where id = new.id;

  insert into exam_private.grading_audit (attempt_id, actor_user_id, event_type, details)
  values (new.id, v_grader, 'claimed',
          jsonb_build_object('assignmentId', v_assignment, 'automatic', true));
  return null;
end;
$$;

create or replace function public.grading_exams(p_actor_user_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  return coalesce((
    select jsonb_agg(row_data.payload order by row_data.opens_at desc, row_data.exam_id desc)
    from (
      select
        e.id as exam_id,
        e.opens_at,
        jsonb_build_object(
          'examId', e.public_id,
          'courseId', e.course_id,
          'title', e.title,
          'opensAt', e.opens_at,
          'closesAt', e.closes_at,
          'published', e.published,
          'rubricReady', exists (
            select 1
            from exam_private.rubrics rubric
            where rubric.exam_id = e.id and rubric.is_active = true
          ),
          'submittedCount', count(a.id) filter (
            where a.status in ('submitted', 'timed_out')
          ),
          'pendingCount', count(a.id) filter (
            where a.status in ('submitted', 'timed_out')
              and a.grading_status <> 'published'
          ),
          'publishedCount', count(a.id) filter (
            where a.status in ('submitted', 'timed_out')
              and a.grading_status = 'published'
          )
        ) as payload
      from exam_private.exams e
      left join exam_private.attempts a on a.exam_id = e.id
      where e.grading_enabled
      group by e.id
    ) row_data
  ), '[]'::jsonb);
end;
$$;
