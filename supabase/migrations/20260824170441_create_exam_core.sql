create schema if not exists exam_private;

revoke all on schema exam_private from public, anon, authenticated;
alter default privileges in schema exam_private revoke execute on functions from public;

create table exam_private.exams (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  slug text not null unique,
  course_id text not null,
  title text not null,
  instructions text not null default '',
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  duration_minutes smallint not null,
  max_attempts smallint not null default 1,
  selection_count smallint,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint exams_window_valid check (closes_at > opens_at),
  constraint exams_duration_valid check (duration_minutes between 1 and 480),
  constraint exams_attempts_valid check (max_attempts between 1 and 10),
  constraint exams_selection_valid check (selection_count is null or selection_count > 0),
  constraint exams_slug_valid check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$')
);

create table exam_private.questions (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  exam_id bigint not null references exam_private.exams(id) on delete cascade,
  kind text not null,
  prompt text not null,
  points numeric(7, 2) not null default 1,
  position smallint not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint questions_kind_valid check (kind in ('single_choice', 'essay')),
  constraint questions_points_valid check (points > 0),
  constraint questions_position_valid check (position > 0),
  constraint questions_prompt_valid check (length(btrim(prompt)) >= 8),
  constraint questions_exam_position_unique unique (exam_id, position)
);

create index questions_exam_id_idx on exam_private.questions (exam_id);
create index questions_exam_active_position_idx
  on exam_private.questions (exam_id, position)
  where active = true;

create table exam_private.question_options (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  question_id bigint not null references exam_private.questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  position smallint not null,
  constraint question_options_position_valid check (position > 0),
  constraint question_options_label_valid check (length(btrim(label)) > 0),
  constraint question_options_question_position_unique unique (question_id, position)
);

create index question_options_question_id_idx
  on exam_private.question_options (question_id);

create unique index question_options_one_correct_idx
  on exam_private.question_options (question_id)
  where is_correct = true;

create table exam_private.attempts (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  exam_id bigint not null references exam_private.exams(id) on delete restrict,
  moodle_user_id text not null,
  display_name text not null,
  attempt_number smallint not null default 1,
  status text not null default 'in_progress',
  started_at timestamptz not null default clock_timestamp(),
  deadline_at timestamptz not null,
  submitted_at timestamptz,
  last_saved_at timestamptz,
  server_version bigint not null default 0,
  attempt_token_hash text not null unique,
  created_at timestamptz not null default now(),
  constraint attempts_status_valid check (status in ('in_progress', 'submitted', 'timed_out', 'cancelled')),
  constraint attempts_number_valid check (attempt_number > 0),
  constraint attempts_deadline_valid check (deadline_at >= started_at),
  constraint attempts_student_attempt_unique unique (exam_id, moodle_user_id, attempt_number)
);

create index attempts_exam_id_idx on exam_private.attempts (exam_id);
create index attempts_exam_student_idx
  on exam_private.attempts (exam_id, moodle_user_id);
create index attempts_active_deadline_idx
  on exam_private.attempts (deadline_at)
  where status = 'in_progress';

create table exam_private.consumed_tickets (
  id bigint generated always as identity primary key,
  nonce_hash text not null unique,
  exam_id bigint not null references exam_private.exams(id) on delete cascade,
  moodle_user_id text not null,
  consumed_at timestamptz not null default clock_timestamp()
);

create index consumed_tickets_exam_id_idx
  on exam_private.consumed_tickets (exam_id);

create table exam_private.attempt_items (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  attempt_id bigint not null references exam_private.attempts(id) on delete cascade,
  question_id bigint not null references exam_private.questions(id) on delete restrict,
  position smallint not null,
  constraint attempt_items_position_valid check (position > 0),
  constraint attempt_items_attempt_question_unique unique (attempt_id, question_id),
  constraint attempt_items_attempt_position_unique unique (attempt_id, position)
);

create index attempt_items_attempt_id_idx
  on exam_private.attempt_items (attempt_id);
create index attempt_items_question_id_idx
  on exam_private.attempt_items (question_id);

create table exam_private.responses (
  id bigint generated always as identity primary key,
  attempt_item_id bigint not null unique references exam_private.attempt_items(id) on delete cascade,
  selected_option_id bigint references exam_private.question_options(id) on delete restrict,
  essay_text text,
  client_revision bigint not null default 0,
  saved_at timestamptz not null default clock_timestamp(),
  constraint responses_revision_valid check (client_revision >= 0),
  constraint responses_payload_valid check (
    selected_option_id is not null
    or essay_text is not null
  )
);

create index responses_selected_option_id_idx
  on exam_private.responses (selected_option_id)
  where selected_option_id is not null;

create table exam_private.events (
  id bigint generated always as identity primary key,
  attempt_id bigint not null references exam_private.attempts(id) on delete cascade,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default clock_timestamp(),
  constraint events_type_valid check (event_type in (
    'launched', 'resumed', 'saved', 'submitted', 'timed_out',
    'window_hidden', 'window_visible', 'client_error'
  )),
  constraint events_details_object check (jsonb_typeof(details) = 'object')
);

create index events_attempt_occurred_idx
  on exam_private.events (attempt_id, occurred_at);

alter table exam_private.exams enable row level security;
alter table exam_private.exams force row level security;
alter table exam_private.questions enable row level security;
alter table exam_private.questions force row level security;
alter table exam_private.question_options enable row level security;
alter table exam_private.question_options force row level security;
alter table exam_private.attempts enable row level security;
alter table exam_private.attempts force row level security;
alter table exam_private.consumed_tickets enable row level security;
alter table exam_private.consumed_tickets force row level security;
alter table exam_private.attempt_items enable row level security;
alter table exam_private.attempt_items force row level security;
alter table exam_private.responses enable row level security;
alter table exam_private.responses force row level security;
alter table exam_private.events enable row level security;
alter table exam_private.events force row level security;

revoke all on all tables in schema exam_private from public, anon, authenticated;
revoke all on all sequences in schema exam_private from public, anon, authenticated;

create or replace function exam_private.state_json(p_attempt_id bigint)
returns jsonb
language sql
volatile
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'serverNow', clock_timestamp(),
    'exam', jsonb_build_object(
      'id', e.public_id,
      'title', e.title,
      'instructions', e.instructions,
      'durationMinutes', e.duration_minutes
    ),
    'attempt', jsonb_build_object(
      'id', a.public_id,
      'studentName', a.display_name,
      'status', a.status,
      'startedAt', a.started_at,
      'deadlineAt', a.deadline_at,
      'submittedAt', a.submitted_at,
      'lastSavedAt', a.last_saved_at,
      'serverVersion', a.server_version
    ),
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ai.public_id,
          'position', ai.position,
          'kind', q.kind,
          'prompt', q.prompt,
          'points', q.points,
          'options', case when q.kind = 'single_choice' then (
            select coalesce(jsonb_agg(
              jsonb_build_object('id', qo.public_id, 'label', qo.label)
              order by md5(qo.id::text || ':' || a.id::text)
            ), '[]'::jsonb)
            from exam_private.question_options qo
            where qo.question_id = q.id
          ) else '[]'::jsonb end,
          'response', case when r.id is null then null else jsonb_build_object(
            'selectedOptionId', so.public_id,
            'essayText', r.essay_text,
            'clientRevision', r.client_revision,
            'savedAt', r.saved_at
          ) end
        ) order by ai.position
      )
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id
      left join exam_private.responses r on r.attempt_item_id = ai.id
      left join exam_private.question_options so on so.id = r.selected_option_id
      where ai.attempt_id = a.id
    ), '[]'::jsonb)
  )
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.id = p_attempt_id;
$$;

revoke all on function exam_private.state_json(bigint) from public, anon, authenticated;

create or replace function public.exam_launch(
  p_exam_public_id uuid,
  p_course_id text,
  p_moodle_user_id text,
  p_display_name text,
  p_ticket_nonce_hash text,
  p_attempt_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam exam_private.exams%rowtype;
  v_attempt exam_private.attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_deadline timestamptz;
  v_event text := 'resumed';
begin
  if p_moodle_user_id is null or btrim(p_moodle_user_id) = ''
     or p_display_name is null or btrim(p_display_name) = '' then
    raise exception using errcode = '22023', message = 'invalid_identity';
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

  -- Serializa dos aperturas simultáneas del mismo alumno sin bloquear a los demás.
  perform pg_advisory_xact_lock(
    hashtextextended(v_exam.id::text || ':' || p_moodle_user_id, 0)
  );

  insert into exam_private.consumed_tickets (nonce_hash, exam_id, moodle_user_id)
  values (p_ticket_nonce_hash, v_exam.id, p_moodle_user_id);

  select * into v_attempt
  from exam_private.attempts
  where exam_id = v_exam.id
    and moodle_user_id = p_moodle_user_id
    and attempt_number = 1
  for update;

  if not found then
    v_deadline := least(
      v_now + make_interval(mins => v_exam.duration_minutes),
      v_exam.closes_at
    );

    insert into exam_private.attempts (
      exam_id, moodle_user_id, display_name, deadline_at, attempt_token_hash
    ) values (
      v_exam.id, p_moodle_user_id, btrim(p_display_name), v_deadline, p_attempt_token_hash
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
        display_name = btrim(p_display_name)
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
exception
  when unique_violation then
    raise exception using errcode = 'P0001', message = 'ticket_already_used';
end;
$$;

create or replace function public.exam_get_state(p_attempt_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt exam_private.attempts%rowtype;
begin
  select * into v_attempt
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  if v_attempt.status = 'in_progress' and clock_timestamp() >= v_attempt.deadline_at then
    update exam_private.attempts
    set status = 'timed_out', submitted_at = deadline_at
    where id = v_attempt.id
    returning * into v_attempt;
    insert into exam_private.events (attempt_id, event_type)
    values (v_attempt.id, 'timed_out');
  end if;

  return exam_private.state_json(v_attempt.id);
end;
$$;

create or replace function public.exam_save(
  p_attempt_token_hash text,
  p_responses jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt exam_private.attempts%rowtype;
  v_entry jsonb;
  v_item record;
  v_selected_option_id bigint;
  v_revision bigint;
  v_accepted integer := 0;
begin
  if jsonb_typeof(p_responses) <> 'array' or jsonb_array_length(p_responses) > 200 then
    raise exception using errcode = '22023', message = 'invalid_response_batch';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  if v_attempt.status = 'in_progress' and clock_timestamp() >= v_attempt.deadline_at then
    update exam_private.attempts
    set status = 'timed_out', submitted_at = deadline_at
    where id = v_attempt.id
    returning * into v_attempt;
    insert into exam_private.events (attempt_id, event_type)
    values (v_attempt.id, 'timed_out');
  end if;

  if v_attempt.status <> 'in_progress' then
    return jsonb_build_object(
      'serverNow', clock_timestamp(),
      'status', v_attempt.status,
      'deadlineAt', v_attempt.deadline_at,
      'accepted', 0,
      'serverVersion', v_attempt.server_version
    );
  end if;

  for v_entry in select value from jsonb_array_elements(p_responses)
  loop
    select ai.*, q.kind as question_kind into v_item
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id
    where ai.public_id = (v_entry->>'itemId')::uuid
      and ai.attempt_id = v_attempt.id;

    if not found then
      raise exception using errcode = '22023', message = 'invalid_attempt_item';
    end if;

    v_revision := coalesce((v_entry->>'clientRevision')::bigint, 0);
    v_selected_option_id := null;

    if v_item.question_kind = 'single_choice' then
      if nullif(v_entry->>'selectedOptionId', '') is not null then
        select qo.id into v_selected_option_id
        from exam_private.question_options qo
        where qo.public_id = (v_entry->>'selectedOptionId')::uuid
          and qo.question_id = v_item.question_id;
        if not found then
          raise exception using errcode = '22023', message = 'invalid_question_option';
        end if;
      else
        continue;
      end if;
    end if;

    insert into exam_private.responses (
      attempt_item_id, selected_option_id, essay_text, client_revision
    ) values (
      v_item.id,
      v_selected_option_id,
      case when v_item.question_kind = 'essay' then coalesce(v_entry->>'essayText', '') else null end,
      v_revision
    )
    on conflict (attempt_item_id) do update
    set selected_option_id = excluded.selected_option_id,
        essay_text = excluded.essay_text,
        client_revision = excluded.client_revision,
        saved_at = clock_timestamp()
    where excluded.client_revision >= exam_private.responses.client_revision;

    if found then
      v_accepted := v_accepted + 1;
    end if;
  end loop;

  update exam_private.attempts
  set server_version = server_version + 1,
      last_saved_at = clock_timestamp()
  where id = v_attempt.id
  returning * into v_attempt;

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_attempt.id, 'saved', jsonb_build_object('accepted', v_accepted));

  return jsonb_build_object(
    'serverNow', clock_timestamp(),
    'status', v_attempt.status,
    'deadlineAt', v_attempt.deadline_at,
    'lastSavedAt', v_attempt.last_saved_at,
    'accepted', v_accepted,
    'serverVersion', v_attempt.server_version
  );
end;
$$;

create or replace function public.exam_submit(p_attempt_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt exam_private.attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_event text;
begin
  select * into v_attempt
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  if v_attempt.status = 'in_progress' then
    if v_now >= v_attempt.deadline_at then
      update exam_private.attempts
      set status = 'timed_out', submitted_at = deadline_at
      where id = v_attempt.id
      returning * into v_attempt;
      v_event := 'timed_out';
    else
      update exam_private.attempts
      set status = 'submitted', submitted_at = v_now
      where id = v_attempt.id
      returning * into v_attempt;
      v_event := 'submitted';
    end if;

    insert into exam_private.events (attempt_id, event_type)
    values (v_attempt.id, v_event);
  end if;

  return exam_private.state_json(v_attempt.id);
end;
$$;

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
begin
  if p_event_type not in ('window_hidden', 'window_visible', 'client_error') then
    raise exception using errcode = '22023', message = 'invalid_event_type';
  end if;
  if jsonb_typeof(p_details) <> 'object' or pg_column_size(p_details) > 4096 then
    raise exception using errcode = '22023', message = 'invalid_event_details';
  end if;

  select id into v_attempt_id
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_attempt_id, p_event_type, p_details);
end;
$$;

revoke all on function public.exam_launch(uuid, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.exam_get_state(text) from public, anon, authenticated;
revoke all on function public.exam_save(text, jsonb) from public, anon, authenticated;
revoke all on function public.exam_submit(text) from public, anon, authenticated;
revoke all on function public.exam_record_event(text, text, jsonb) from public, anon, authenticated;

grant execute on function public.exam_launch(uuid, text, text, text, text, text) to service_role;
grant execute on function public.exam_get_state(text) to service_role;
grant execute on function public.exam_save(text, jsonb) to service_role;
grant execute on function public.exam_submit(text) to service_role;
grant execute on function public.exam_record_event(text, text, jsonb) to service_role;
