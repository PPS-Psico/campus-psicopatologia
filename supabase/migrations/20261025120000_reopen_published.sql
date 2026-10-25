-- Volver a corregir un parcial ya publicado.
--
-- La coordinación puede reabrir una corrección cerrada (revisada, lista o
-- publicada): vuelve a «en corrección», tomada por quien la reabre, y se
-- corrige como cualquier otra (marcas, comentarios, devolución, resultado y
-- nota). Al publicarla de nuevo se crea una versión nueva de la devolución.
--
-- Mientras tanto el estudiante sigue viendo la última versión publicada: la
-- devolución y la lista de notas del curso salen de las versiones publicadas,
-- no del estado actual de la corrección.

create or replace function public.grading_reopen(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint
)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare
  v_grader exam_private.grader_profiles%rowtype;
  v_attempt exam_private.attempts%rowtype;
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);
  if v_grader.role <> 'coordinator' then
    raise exception using errcode = '42501', message = 'coordinator_required';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.grading_status not in ('reviewed', 'ready_to_publish', 'published') then
    raise exception using errcode = 'P0001', message = 'attempt_not_editable';
  end if;
  if v_attempt.grading_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'grading_version_conflict';
  end if;

  update exam_private.grading_assignments
  set released_at = clock_timestamp(), release_reason = 'Reabierta para volver a corregir'
  where attempt_id = v_attempt.id and released_at is null and completed_at is null;

  insert into exam_private.grading_assignments (attempt_id, grader_user_id)
  values (v_attempt.id, p_actor_user_id);

  update exam_private.attempts
  set grading_status = 'in_review',
      grading_version = grading_version + 1
  where id = v_attempt.id;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'reopened',
    jsonb_build_object(
      'fromStatus', v_attempt.grading_status,
      'result', v_attempt.result,
      'finalScore', v_attempt.final_score
    )
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$function$;

revoke all on function public.grading_reopen(uuid, uuid, bigint) from public, anon, authenticated;
grant execute on function public.grading_reopen(uuid, uuid, bigint) to service_role;

-- La lista de notas del curso: lo último publicado de cada entrega, aunque
-- en este momento se la esté volviendo a corregir.
create or replace function exam_private.course_grades_json(p_course_id text)
 returns jsonb
 language sql
 stable
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'examTitle', e.title,
      'studentName', a.display_name,
      'finalScore', coalesce((fr.snapshot->>'finalScore')::numeric, (fr.snapshot->>'totalScore')::numeric),
      'result', fr.snapshot->>'result'
    ) order by e.opens_at, cr.last_name_normalized, cr.first_name_normalized
  ), '[]'::jsonb)
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  join exam_private.course_roster cr on cr.id = a.roster_id
  join lateral (
    select f.snapshot
    from exam_private.feedback_releases f
    where f.attempt_id = a.id
    order by f.version desc
    limit 1
  ) fr on true
  where e.course_id = p_course_id;
$function$;

create or replace function public.feedback_get(p_session_token_hash text)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare
  v_session exam_private.student_feedback_sessions%rowtype;
  v_roster exam_private.course_roster%rowtype;
  v_now timestamptz := clock_timestamp();
  v_releases jsonb;
begin
  if p_session_token_hash is null
     or p_session_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_feedback_session';
  end if;

  select * into v_session
  from exam_private.student_feedback_sessions
  where token_hash = p_session_token_hash
    and revoked_at is null
    and expires_at > v_now
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_feedback_session';
  end if;

  update exam_private.student_feedback_sessions
  set last_used_at = v_now
  where id = v_session.id;

  select * into v_roster
  from exam_private.course_roster
  where id = v_session.roster_id and active = true;

  if not found then
    raise exception using errcode = 'P0001', message = 'identity_not_registered';
  end if;

  -- La última versión publicada de cada entrega, aunque se la esté volviendo
  -- a corregir: hasta que se publique la nueva, el estudiante ve la anterior.
  select coalesce(
    jsonb_agg(recent.payload order by recent.published_at desc),
    '[]'::jsonb
  ) into v_releases
  from (
    select distinct on (a.id)
      a.id,
      fr.published_at,
      fr.snapshot || jsonb_build_object(
        'releaseId', fr.public_id,
        'releaseVersion', fr.version,
        'publishedAt', fr.published_at
      ) as payload
    from exam_private.attempts a
    join exam_private.exams e on e.id = a.exam_id
    join exam_private.feedback_releases fr on fr.attempt_id = a.id
    where a.roster_id = v_roster.id
      and e.course_id = v_roster.course_id
    order by a.id, fr.version desc
  ) recent;

  return jsonb_build_object(
    'studentName', v_roster.display_name,
    'courseId', v_roster.course_id,
    'releases', v_releases,
    'courseGrades', exam_private.course_grades_json(v_roster.course_id)
  );
end;
$function$;
