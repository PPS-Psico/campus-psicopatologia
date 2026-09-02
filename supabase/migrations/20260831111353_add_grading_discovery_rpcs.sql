-- Datos iniciales del panel docente. Estas funciones no confian en un ID
-- enviado libremente por el navegador: la Edge Function toma el UUID del JWT.

create or replace function public.grading_me(p_actor_user_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_grader exam_private.grader_profiles%rowtype;
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);

  return jsonb_build_object(
    'userId', v_grader.user_id,
    'displayName', v_grader.display_name,
    'role', v_grader.role
  );
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
      group by e.id
    ) row_data
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.grading_me(uuid)
  from public, anon, authenticated;
revoke all on function public.grading_exams(uuid)
  from public, anon, authenticated;

grant execute on function public.grading_me(uuid) to service_role;
grant execute on function public.grading_exams(uuid) to service_role;
