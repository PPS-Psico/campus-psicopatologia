-- Reparto automático de las entregas entre las correctoras, y cierre de los
-- intentos abandonados.
--
-- 1. Cuando un intento termina (entregado o vencido) y tiene consignas a
--    desarrollar, queda asignado de inmediato a la correctora activa del curso
--    con menos entregas de ese examen. Empate: se decide al azar por intento.
--    Con dos correctoras, el parcial queda partido al medio sin que nadie
--    tenga que tomar nada. Soltar una entrega la devuelve a «sin asignar».
--    Probado con 60 entregas simuladas: 30 y 30.
--
-- 2. Un intento que nadie entrega y cuyo estudiante no vuelve a entrar
--    quedaba «en curso» para siempre y nunca llegaba a corrección. Pasó en el
--    simulacro (un intento del 25/09). grading_expire_overdue los cierra como
--    vencidos con lo que tenían guardado; grader-api la llama al abrir la
--    estación y al pedir la lista.

create or replace function exam_private.assign_grader_on_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course text;
  v_grader uuid;
  v_assignment bigint;
begin
  if new.status not in ('submitted', 'timed_out')
     or old.status is not distinct from new.status
     or new.grading_status is distinct from 'unassigned' then
    return null;
  end if;

  select course_id into v_course from exam_private.exams where id = new.exam_id;
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

create trigger attempts_assign_grader
after update of status on exam_private.attempts
for each row execute function exam_private.assign_grader_on_completion();

create or replace function public.grading_expire_overdue()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n integer;
begin
  with vencidos as (
    update exam_private.attempts a
    set status = 'timed_out', submitted_at = a.deadline_at
    where a.status = 'in_progress' and a.deadline_at <= clock_timestamp()
    returning a.id
  ), registro as (
    insert into exam_private.events (attempt_id, event_type)
    select id, 'timed_out' from vencidos
    returning attempt_id
  )
  select count(*) into v_n from registro;
  return v_n;
end;
$$;

revoke all on function exam_private.assign_grader_on_completion() from public, anon, authenticated;
revoke all on function public.grading_expire_overdue() from public, anon, authenticated;
grant execute on function public.grading_expire_overdue() to service_role;
