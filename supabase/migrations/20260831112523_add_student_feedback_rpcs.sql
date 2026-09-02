-- Sesion de devoluciones iniciada desde el contexto que FilterCodes inserta
-- en Moodle. El navegador recibe un token aleatorio; la base guarda solo SHA-256.

grant select on table
  exam_private.course_roster,
  exam_private.attempts,
  exam_private.feedback_releases,
  exam_private.student_feedback_sessions
to service_role;
grant insert, update on table exam_private.student_feedback_sessions to service_role;
grant usage, select on sequence exam_private.student_feedback_sessions_id_seq
  to service_role;
grant execute on function exam_private.normalize_identity_name(text)
  to service_role;

create or replace function public.feedback_launch_by_identity(
  p_course_id text,
  p_moodle_user_id bigint,
  p_dni bigint,
  p_first_name text,
  p_last_name text,
  p_session_token_hash text
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_roster exam_private.course_roster%rowtype;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
  v_published_count integer;
begin
  if p_course_id is null or length(btrim(p_course_id)) not between 1 and 80
     or p_moodle_user_id is null or p_moodle_user_id <= 0
     or p_dni is null or p_dni not between 100000 and 999999999
     or p_first_name is null or length(btrim(p_first_name)) = 0
     or p_last_name is null or length(btrim(p_last_name)) = 0
     or p_session_token_hash is null
     or p_session_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_moodle_context';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_course_id || ':feedback:' || p_moodle_user_id::text, 0)
  );

  select * into v_roster
  from exam_private.course_roster
  where course_id = p_course_id
    and dni = p_dni
    and active = true;

  if not found then
    raise exception using errcode = 'P0001', message = 'identity_not_registered';
  end if;
  if v_roster.first_name_normalized
       <> exam_private.normalize_identity_name(p_first_name)
     or v_roster.last_name_normalized
       <> exam_private.normalize_identity_name(p_last_name) then
    raise exception using errcode = 'P0001', message = 'identity_mismatch';
  end if;
  if v_roster.moodle_user_id is null then
    raise exception using errcode = 'P0001', message = 'identity_not_verified';
  end if;
  if v_roster.moodle_user_id <> p_moodle_user_id then
    raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
  end if;

  update exam_private.student_feedback_sessions
  set revoked_at = v_now
  where roster_id = v_roster.id
    and revoked_at is null
    and expires_at > v_now;

  insert into exam_private.student_feedback_sessions (
    token_hash, roster_id, expires_at
  ) values (
    p_session_token_hash, v_roster.id, v_expires_at
  );

  select count(distinct a.id)::integer into v_published_count
  from exam_private.attempts a
  join exam_private.feedback_releases fr on fr.attempt_id = a.id
  join exam_private.exams e on e.id = a.exam_id
  where a.roster_id = v_roster.id
    and e.course_id = p_course_id
    and a.grading_status = 'published';

  return jsonb_build_object(
    'studentName', v_roster.display_name,
    'courseId', v_roster.course_id,
    'expiresAt', v_expires_at,
    'publishedCount', v_published_count
  );
end;
$$;

create or replace function public.feedback_get(p_session_token_hash text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
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
      and a.grading_status = 'published'
    order by a.id, fr.version desc
  ) recent;

  return jsonb_build_object(
    'studentName', v_roster.display_name,
    'courseId', v_roster.course_id,
    'releases', v_releases
  );
end;
$$;

create or replace function public.feedback_logout(p_session_token_hash text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_revoked integer;
begin
  if p_session_token_hash is null
     or p_session_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_feedback_session';
  end if;

  update exam_private.student_feedback_sessions
  set revoked_at = clock_timestamp()
  where token_hash = p_session_token_hash
    and revoked_at is null;
  get diagnostics v_revoked = row_count;

  return jsonb_build_object('ok', true, 'revoked', v_revoked > 0);
end;
$$;

revoke all on function public.feedback_launch_by_identity(
  text, bigint, bigint, text, text, text
) from public, anon, authenticated;
revoke all on function public.feedback_get(text)
  from public, anon, authenticated;
revoke all on function public.feedback_logout(text)
  from public, anon, authenticated;

grant execute on function public.feedback_launch_by_identity(
  text, bigint, bigint, text, text, text
) to service_role;
grant execute on function public.feedback_get(text) to service_role;
grant execute on function public.feedback_logout(text) to service_role;
