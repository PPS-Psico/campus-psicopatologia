alter table exam_private.exams
  add column identity_linking_enabled boolean not null default false;

comment on column exam_private.exams.identity_linking_enabled is
  'Permite asociar por primera vez una cuenta Moodle al padrón. Activar sólo durante el simulacro técnico y mantener desactivado en parciales reales.';

create or replace function public.exam_launch_by_identity(
  p_exam_public_id uuid,
  p_course_id text,
  p_moodle_user_id bigint,
  p_dni bigint,
  p_first_name text,
  p_last_name text,
  p_attempt_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam exam_private.exams%rowtype;
  v_roster exam_private.course_roster%rowtype;
  v_attempt exam_private.attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_deadline timestamptz;
  v_event text := 'resumed';
begin
  if p_moodle_user_id is null or p_moodle_user_id <= 0
     or p_dni is null or p_dni not between 100000 and 999999999
     or p_first_name is null or length(btrim(p_first_name)) = 0
     or p_last_name is null or length(btrim(p_last_name)) = 0
     or p_attempt_token_hash is null or length(p_attempt_token_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_moodle_context';
  end if;

  select * into v_exam
  from exam_private.exams
  where public_id = p_exam_public_id
    and course_id = p_course_id
    and published = true
  for share;

  if not found then
    raise exception using errcode = 'P0001', message = 'exam_not_available';
  end if;
  if v_now < v_exam.opens_at then
    raise exception using errcode = 'P0001', message = 'exam_not_open';
  end if;
  if v_now >= v_exam.closes_at then
    raise exception using errcode = 'P0001', message = 'exam_closed';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_course_id || ':moodle:' || p_moodle_user_id::text, 0)
  );
  perform pg_advisory_xact_lock(
    hashtextextended(p_course_id || ':dni:' || p_dni::text, 0)
  );

  select * into v_roster
  from exam_private.course_roster
  where course_id = p_course_id
    and dni = p_dni
    and active = true
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'identity_not_registered';
  end if;

  if v_roster.first_name_normalized <> exam_private.normalize_identity_name(p_first_name)
     or v_roster.last_name_normalized <> exam_private.normalize_identity_name(p_last_name) then
    raise exception using errcode = 'P0001', message = 'identity_mismatch';
  end if;

  if v_roster.moodle_user_id is not null
     and v_roster.moodle_user_id <> p_moodle_user_id then
    raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
  end if;

  if v_roster.moodle_user_id is null then
    if not v_exam.identity_linking_enabled then
      raise exception using errcode = 'P0001', message = 'identity_not_verified';
    end if;

    if exists (
      select 1
      from exam_private.course_roster other
      where other.course_id = p_course_id
        and other.moodle_user_id = p_moodle_user_id
        and other.id <> v_roster.id
    ) then
      raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
    end if;

    update exam_private.course_roster
    set moodle_user_id = p_moodle_user_id,
        linked_at = v_now,
        updated_at = v_now
    where id = v_roster.id
    returning * into v_roster;
  end if;

  select * into v_attempt
  from exam_private.attempts
  where exam_id = v_exam.id
    and roster_id = v_roster.id
    and attempt_number = 1
  for update;

  if not found then
    v_deadline := least(
      v_now + make_interval(mins => v_exam.duration_minutes),
      v_exam.closes_at
    );

    insert into exam_private.attempts (
      exam_id, roster_id, moodle_user_id, display_name,
      deadline_at, attempt_token_hash
    ) values (
      v_exam.id, v_roster.id, p_moodle_user_id::text, v_roster.display_name,
      v_deadline, p_attempt_token_hash
    ) returning * into v_attempt;

    insert into exam_private.attempt_items (attempt_id, question_id, position)
    select v_attempt.id, picked.id, (row_number() over (order by picked.sort_key))::smallint
    from (
      select q.id, md5(q.id::text || ':' || v_attempt.id::text) as sort_key
      from exam_private.questions q
      where q.exam_id = v_exam.id and q.active = true
      order by sort_key
      limit coalesce(v_exam.selection_count, 32767)
    ) picked;

    if not exists (
      select 1 from exam_private.attempt_items where attempt_id = v_attempt.id
    ) then
      raise exception using errcode = 'P0001', message = 'exam_has_no_questions';
    end if;

    v_event := 'launched';
  else
    update exam_private.attempts
    set attempt_token_hash = p_attempt_token_hash,
        moodle_user_id = p_moodle_user_id::text,
        display_name = v_roster.display_name
    where id = v_attempt.id
    returning * into v_attempt;
  end if;

  if v_attempt.status = 'in_progress' and v_now >= v_attempt.deadline_at then
    update exam_private.attempts
    set status = 'timed_out', submitted_at = deadline_at
    where id = v_attempt.id
    returning * into v_attempt;
    v_event := 'timed_out';
  end if;

  insert into exam_private.events (attempt_id, event_type)
  values (v_attempt.id, v_event);

  return exam_private.state_json(v_attempt.id);
end;
$$;

revoke all on function public.exam_launch_by_identity(
  uuid, text, bigint, bigint, text, text, text
) from public, anon, authenticated;
grant execute on function public.exam_launch_by_identity(
  uuid, text, bigint, bigint, text, text, text
) to service_role;

alter table exam_private.responses
  add constraint responses_essay_length_valid
  check (essay_text is null or length(essay_text) <= 8000);

create or replace function public.exam_record_event(
  p_attempt_token_hash text,
  p_event_type text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_id bigint;
  v_attempt_status text;
  v_deadline_at timestamptz;
begin
  if p_event_type not in ('window_hidden', 'window_visible', 'client_error') then
    raise exception using errcode = '22023', message = 'invalid_event_type';
  end if;
  if jsonb_typeof(p_details) <> 'object' or pg_column_size(p_details) > 4096 then
    raise exception using errcode = '22023', message = 'invalid_event_details';
  end if;

  select id, status, deadline_at
  into v_attempt_id, v_attempt_status, v_deadline_at
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  if v_attempt_status <> 'in_progress' or clock_timestamp() >= v_deadline_at then
    return;
  end if;

  if exists (
    select 1
    from exam_private.events
    where attempt_id = v_attempt_id
      and event_type = p_event_type
      and occurred_at >= clock_timestamp() - interval '1 second'
  ) then
    return;
  end if;

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_attempt_id, p_event_type, p_details);
end;
$$;

revoke all on function public.exam_record_event(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.exam_record_event(text, text, jsonb)
  to service_role;
