-- Reemplaza el ticket emitido por un plugin Moodle por el mecanismo disponible
-- en Consultas PPS: FilterCodes en una etiqueta + cruce estricto contra padrón.

create or replace function exam_private.normalize_identity_name(p_value text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select btrim(regexp_replace(
    translate(
      lower(p_value),
      'áéíóúüñàèìòùäëïöüç',
      'aeiouunaeiouaeiouc'
    ),
    '[^a-z0-9]+',
    ' ',
    'g'
  ));
$$;

revoke all on function exam_private.normalize_identity_name(text) from public, anon, authenticated;

create table exam_private.course_roster (
  id bigint generated always as identity primary key,
  course_id text not null,
  dni bigint not null,
  first_name text not null,
  last_name text not null,
  first_name_normalized text generated always as (
    exam_private.normalize_identity_name(first_name)
  ) stored,
  last_name_normalized text generated always as (
    exam_private.normalize_identity_name(last_name)
  ) stored,
  display_name text generated always as (
    btrim(first_name || ' ' || last_name)
  ) stored,
  moodle_user_id bigint,
  linked_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint course_roster_course_valid check (length(btrim(course_id)) between 1 and 80),
  constraint course_roster_dni_valid check (dni between 100000 and 999999999),
  constraint course_roster_first_name_valid check (length(first_name_normalized) between 1 and 120),
  constraint course_roster_last_name_valid check (length(last_name_normalized) between 1 and 120),
  constraint course_roster_moodle_user_valid check (moodle_user_id is null or moodle_user_id > 0),
  constraint course_roster_course_dni_unique unique (course_id, dni)
);

create unique index course_roster_course_moodle_user_unique
  on exam_private.course_roster (course_id, moodle_user_id)
  where moodle_user_id is not null;

create index course_roster_active_lookup_idx
  on exam_private.course_roster (course_id, dni)
  where active = true;

alter table exam_private.course_roster enable row level security;
alter table exam_private.course_roster force row level security;
revoke all on exam_private.course_roster from public, anon, authenticated;
revoke all on sequence exam_private.course_roster_id_seq from public, anon, authenticated;

alter table exam_private.attempts
  add column roster_id bigint references exam_private.course_roster(id) on delete restrict;

create unique index attempts_exam_roster_attempt_unique
  on exam_private.attempts (exam_id, roster_id, attempt_number)
  where roster_id is not null;

create index attempts_roster_id_idx
  on exam_private.attempts (roster_id)
  where roster_id is not null;

drop function if exists public.exam_launch(uuid, text, text, text, text, text);
drop table if exists exam_private.consumed_tickets;

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

  -- Todas las aperturas toman los bloqueos en el mismo orden para evitar carreras.
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
