-- Herramientas de soporte para el día del parcial.
--
-- Ninguna API las expone: se ejecutan desde la consola de la base, a pedido
-- del equipo docente, y cada una deja registro. Todas actúan sobre el examen
-- vigente: el último publicado y marcado para corrección.
--
--   select * from exam_private.soporte_estado();
--   select exam_private.soporte_dar_tiempo(<dni>, <minutos>, '<motivo>');
--   select exam_private.soporte_reabrir(<dni>, <minutos>, '<motivo>');
--   select exam_private.soporte_agregar(<dni>, '<nombre>', '<apellido>');
--
-- Nombre y apellido para soporte_agregar: exactamente como figuran en el
-- perfil de Moodle; el sistema compara sin tildes ni mayúsculas.

alter table exam_private.events drop constraint events_type_valid;
alter table exam_private.events add constraint events_type_valid check (event_type in (
  'launched', 'resumed', 'saved', 'submitted', 'timed_out',
  'window_hidden', 'window_visible', 'client_error',
  'support_extended', 'support_reopened'
));

create or replace function exam_private.soporte_examen()
returns bigint
language sql
stable
set search_path = ''
as $$
  select id from exam_private.exams
  where grading_enabled and published
  order by opens_at desc
  limit 1;
$$;

-- Si el nuevo plazo pasa el cierre del examen, se corre el cierre: sin eso el
-- estudiante no puede volver a entrar desde el Campus después de las 10:30.
create or replace function exam_private.soporte_correr_cierre(p_exam_id bigint, p_hasta timestamptz)
returns void
language sql
set search_path = ''
as $$
  update exam_private.exams set closes_at = p_hasta
  where id = p_exam_id and closes_at < p_hasta;
$$;

create or replace function exam_private.soporte_dar_tiempo(p_dni bigint, p_minutos integer, p_motivo text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam bigint := exam_private.soporte_examen();
  v_att exam_private.attempts%rowtype;
  v_nuevo timestamptz;
begin
  if p_minutos is null or p_minutos not between 1 and 120 then
    raise exception 'Los minutos tienen que estar entre 1 y 120.';
  end if;
  if p_motivo is null or length(btrim(p_motivo)) < 3 then
    raise exception 'Falta el motivo.';
  end if;

  select a.* into v_att
  from exam_private.attempts a
  join exam_private.course_roster r on r.id = a.roster_id
  where a.exam_id = v_exam and r.dni = p_dni
  for update of a;

  if not found then
    raise exception 'El DNI % no tiene intento en el parcial: todavía no entró.', p_dni;
  end if;
  if v_att.status <> 'in_progress' then
    raise exception 'Ese intento ya terminó (%). Para volver a abrirlo: soporte_reabrir.', v_att.status;
  end if;

  v_nuevo := greatest(v_att.deadline_at, clock_timestamp()) + make_interval(mins => p_minutos);
  update exam_private.attempts set deadline_at = v_nuevo where id = v_att.id;
  perform exam_private.soporte_correr_cierre(v_exam, v_nuevo);

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_att.id, 'support_extended',
          jsonb_build_object('minutos', p_minutos, 'motivo', btrim(p_motivo), 'hasta', v_nuevo));

  return format('%s: ahora tiene hasta las %s.', v_att.display_name,
                to_char(v_nuevo at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'));
end;
$$;

create or replace function exam_private.soporte_reabrir(p_dni bigint, p_minutos integer, p_motivo text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam bigint := exam_private.soporte_examen();
  v_att exam_private.attempts%rowtype;
  v_nuevo timestamptz;
begin
  if p_minutos is null or p_minutos not between 1 and 120 then
    raise exception 'Los minutos tienen que estar entre 1 y 120.';
  end if;
  if p_motivo is null or length(btrim(p_motivo)) < 3 then
    raise exception 'Falta el motivo.';
  end if;

  select a.* into v_att
  from exam_private.attempts a
  join exam_private.course_roster r on r.id = a.roster_id
  where a.exam_id = v_exam and r.dni = p_dni
  for update of a;

  if not found then
    raise exception 'El DNI % no tiene intento en el parcial.', p_dni;
  end if;
  if v_att.status = 'in_progress' then
    raise exception 'Ese intento sigue abierto. Para darle tiempo: soporte_dar_tiempo.';
  end if;
  if v_att.grading_status in ('reviewed', 'ready_to_publish', 'published') then
    raise exception 'Ese parcial ya fue corregido (%): no se reabre.', v_att.grading_status;
  end if;

  -- La entrega vuelve a no tener correctora; al entregarse de nuevo se reparte otra vez.
  update exam_private.grading_assignments
  set released_at = clock_timestamp(), release_reason = 'Reabierto: ' || btrim(p_motivo)
  where attempt_id = v_att.id and released_at is null and completed_at is null;

  v_nuevo := clock_timestamp() + make_interval(mins => p_minutos);
  update exam_private.attempts
  set status = 'in_progress',
      submitted_at = null,
      deadline_at = v_nuevo,
      objective_score = null,
      objective_graded_at = null,
      manual_score = null,
      total_score = null,
      grading_status = 'not_ready',
      grading_version = grading_version + 1
  where id = v_att.id;
  perform exam_private.soporte_correr_cierre(v_exam, v_nuevo);

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_att.id, 'support_reopened',
          jsonb_build_object('minutos', p_minutos, 'motivo', btrim(p_motivo), 'hasta', v_nuevo,
                             'estadoAnterior', v_att.status));
  insert into exam_private.grading_audit (attempt_id, event_type, details)
  values (v_att.id, 'reopened', jsonb_build_object('motivo', btrim(p_motivo), 'minutos', p_minutos));

  return format('%s: parcial reabierto hasta las %s. Tiene que volver a entrar desde el Campus; encuentra sus respuestas.',
                v_att.display_name,
                to_char(v_nuevo at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'));
end;
$$;

create or replace function exam_private.soporte_agregar(p_dni bigint, p_nombre text, p_apellido text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam bigint := exam_private.soporte_examen();
  v_course text;
begin
  select course_id into v_course from exam_private.exams where id = v_exam;
  if exists (select 1 from exam_private.course_roster where course_id = v_course and dni = p_dni) then
    update exam_private.course_roster set active = true, updated_at = now()
    where course_id = v_course and dni = p_dni;
    return format('El DNI %s ya estaba en el padrón; quedó activo.', p_dni);
  end if;

  insert into exam_private.course_roster (course_id, dni, first_name, last_name, active)
  values (v_course, p_dni, btrim(p_nombre), btrim(p_apellido), true);

  -- Sin cuenta de Moodle vinculada, la fila se vincula en su primer ingreso.
  update exam_private.exams set identity_linking_enabled = true where id = v_exam;

  return format('%s %s agregado al padrón. Puede entrar desde el Campus.', btrim(p_nombre), btrim(p_apellido));
end;
$$;

create or replace function exam_private.soporte_estado()
returns table (estudiante text, estado text, detalle text)
language sql
stable
security definer
set search_path = ''
as $$
  with ex as (select id, course_id from exam_private.exams where id = exam_private.soporte_examen()),
  pases as (
    select lp.roster_id, count(*) as n, max(lp.issued_at) as ultimo
    from exam_private.launch_passes lp join ex on ex.id = lp.exam_id
    group by lp.roster_id
  )
  select r.display_name,
         case
           when a.id is null and p.roster_id is null then '1 · no abrió la página'
           when a.id is null then '2 · pidió acceso y no llegó'
           when a.status = 'in_progress' then '3 · rindiendo'
           when a.status = 'submitted' then '4 · entregó'
           else '5 · se le venció el tiempo'
         end,
         case
           when a.id is null and p.roster_id is not null then
             format('%s pedidos de acceso; el último a las %s. Safe Exam Browser no llegó al servidor.',
                    p.n, to_char(p.ultimo at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'))
           when a.status = 'in_progress' then
             format('le quedan %s min · último guardado %s',
                    greatest(0, round(extract(epoch from (a.deadline_at - clock_timestamp())) / 60)),
                    coalesce(to_char(a.last_saved_at at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'), 'nunca'))
           when a.status in ('submitted', 'timed_out') then
             format('a las %s · opción múltiple %s/%s',
                    to_char(a.submitted_at at time zone 'America/Argentina/Buenos_Aires', 'HH24:MI'),
                    a.objective_score, a.objective_max_score)
           else ''
         end
  from exam_private.course_roster r
  join ex on ex.course_id = r.course_id
  left join exam_private.attempts a on a.roster_id = r.id and a.exam_id = ex.id
  left join pases p on p.roster_id = r.id
  where r.active
  order by 2, 1;
$$;

revoke all on function exam_private.soporte_examen() from public, anon, authenticated;
revoke all on function exam_private.soporte_correr_cierre(bigint, timestamptz) from public, anon, authenticated;
revoke all on function exam_private.soporte_dar_tiempo(bigint, integer, text) from public, anon, authenticated;
revoke all on function exam_private.soporte_reabrir(bigint, integer, text) from public, anon, authenticated;
revoke all on function exam_private.soporte_agregar(bigint, text, text) from public, anon, authenticated;
revoke all on function exam_private.soporte_estado() from public, anon, authenticated;
