-- Pase de un solo uso para entrar al parcial desde Safe Exam Browser.
--
-- SEB abre un navegador con perfil limpio, así que la sesión de Moodle del
-- navegador habitual no viaja con él. En vez de pedirle al estudiante que
-- vuelva a iniciar sesión adentro de SEB, el Campus —donde FilterCodes ya lo
-- identificó— emite un pase corto y se lo pasa a SEB por el parámetro de
-- consulta del enlace sebs://, que SEB agrega a la URL de inicio sin alterar
-- la Browser Exam Key. El estudiante no escribe nada.

create table exam_private.launch_passes (
  id bigint generated always as identity primary key,
  exam_id bigint not null references exam_private.exams(id) on delete cascade,
  roster_id bigint not null references exam_private.course_roster(id) on delete restrict,
  moodle_user_id bigint not null,
  token_hash text not null unique,
  issued_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  constraint launch_passes_token_hash_valid check (length(token_hash) = 64),
  constraint launch_passes_window_valid check (expires_at > issued_at),
  constraint launch_passes_moodle_user_valid check (moodle_user_id > 0)
);

create index launch_passes_exam_roster_idx
  on exam_private.launch_passes (exam_id, roster_id);

-- Sólo se buscan pases vigentes; los vencidos quedan como rastro de auditoría.
create index launch_passes_live_idx
  on exam_private.launch_passes (expires_at)
  where consumed_at is null;

alter table exam_private.launch_passes enable row level security;
alter table exam_private.launch_passes force row level security;
revoke all on exam_private.launch_passes from public, anon, authenticated;
revoke all on sequence exam_private.launch_passes_id_seq from public, anon, authenticated;

-- Abre o recupera el intento de un alumno del padrón. Lo comparten las dos
-- puertas de entrada —contexto de Moodle y pase— para que no se separen.
create or replace function exam_private.open_attempt(
  p_exam_id bigint,
  p_roster_id bigint,
  p_moodle_user_id bigint,
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
  select * into v_exam from exam_private.exams where id = p_exam_id;
  select * into v_roster from exam_private.course_roster where id = p_roster_id;

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

-- Valida el contexto de Moodle contra el padrón y devuelve la fila habilitada.
-- No abre intento: la usan tanto el ingreso directo como la emisión del pase.
create or replace function exam_private.resolve_identity(
  p_exam_public_id uuid,
  p_course_id text,
  p_moodle_user_id bigint,
  p_dni bigint,
  p_first_name text,
  p_last_name text,
  out o_exam_id bigint,
  out o_roster_id bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  o_exam exam_private.exams%rowtype;
  o_roster exam_private.course_roster%rowtype;
begin
  if p_moodle_user_id is null or p_moodle_user_id <= 0
     or p_dni is null or p_dni not between 100000 and 999999999
     or p_first_name is null or length(btrim(p_first_name)) = 0
     or p_last_name is null or length(btrim(p_last_name)) = 0 then
    raise exception using errcode = '22023', message = 'invalid_moodle_context';
  end if;

  select * into o_exam
  from exam_private.exams
  where public_id = p_exam_public_id
    and course_id = p_course_id
    and published = true
  for share;

  if not found then
    raise exception using errcode = 'P0001', message = 'exam_not_available';
  end if;
  if v_now < o_exam.opens_at then
    raise exception using errcode = 'P0001', message = 'exam_not_open';
  end if;
  if v_now >= o_exam.closes_at then
    raise exception using errcode = 'P0001', message = 'exam_closed';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_course_id || ':moodle:' || p_moodle_user_id::text, 0)
  );
  perform pg_advisory_xact_lock(
    hashtextextended(p_course_id || ':dni:' || p_dni::text, 0)
  );

  select * into o_roster
  from exam_private.course_roster
  where course_id = p_course_id
    and dni = p_dni
    and active = true
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'identity_not_registered';
  end if;

  if o_roster.first_name_normalized <> exam_private.normalize_identity_name(p_first_name)
     or o_roster.last_name_normalized <> exam_private.normalize_identity_name(p_last_name) then
    raise exception using errcode = 'P0001', message = 'identity_mismatch';
  end if;

  if o_roster.moodle_user_id is not null
     and o_roster.moodle_user_id <> p_moodle_user_id then
    raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
  end if;

  if o_roster.moodle_user_id is null then
    if not o_exam.identity_linking_enabled then
      raise exception using errcode = 'P0001', message = 'identity_not_verified';
    end if;

    if exists (
      select 1
      from exam_private.course_roster other
      where other.course_id = p_course_id
        and other.moodle_user_id = p_moodle_user_id
        and other.id <> o_roster.id
    ) then
      raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
    end if;

    update exam_private.course_roster
    set moodle_user_id = p_moodle_user_id,
        linked_at = v_now,
        updated_at = v_now
    where id = o_roster.id
    returning * into o_roster;
  end if;

  o_exam_id := o_exam.id;
  o_roster_id := o_roster.id;
end;
$$;

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
  v_exam_id bigint;
  v_roster_id bigint;
begin
  if p_attempt_token_hash is null or length(p_attempt_token_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_moodle_context';
  end if;

  select o_exam_id, o_roster_id into v_exam_id, v_roster_id
  from exam_private.resolve_identity(
    p_exam_public_id, p_course_id, p_moodle_user_id, p_dni, p_first_name, p_last_name
  );

  return exam_private.open_attempt(
    v_exam_id, v_roster_id, p_moodle_user_id, p_attempt_token_hash
  );
end;
$$;

-- Emite el pase desde el Campus. Corre en el navegador habitual del estudiante,
-- sin Safe Exam Browser: lo único que autoriza es el contexto de Moodle.
create or replace function public.exam_issue_pass(
  p_exam_public_id uuid,
  p_course_id text,
  p_moodle_user_id bigint,
  p_dni bigint,
  p_first_name text,
  p_last_name text,
  p_token_hash text,
  p_ttl_seconds integer default 900
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam exam_private.exams%rowtype;
  v_roster exam_private.course_roster%rowtype;
  v_exam_id bigint;
  v_roster_id bigint;
  v_now timestamptz := clock_timestamp();
  v_expires timestamptz;
  v_attempt exam_private.attempts%rowtype;
begin
  if p_token_hash is null or length(p_token_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_pass';
  end if;
  if p_ttl_seconds is null or p_ttl_seconds not between 60 and 3600 then
    raise exception using errcode = '22023', message = 'invalid_pass';
  end if;

  select o_exam_id, o_roster_id into v_exam_id, v_roster_id
  from exam_private.resolve_identity(
    p_exam_public_id, p_course_id, p_moodle_user_id, p_dni, p_first_name, p_last_name
  );

  select * into v_exam from exam_private.exams where id = v_exam_id;
  select * into v_roster from exam_private.course_roster where id = v_roster_id;

  -- Un pase nuevo invalida los anteriores sin usar: si el estudiante vuelve a
  -- pedir el acceso, el enlace viejo deja de servir.
  update exam_private.launch_passes
  set consumed_at = v_now
  where exam_id = v_exam.id
    and roster_id = v_roster.id
    and consumed_at is null;

  v_expires := v_now + make_interval(secs => p_ttl_seconds);

  insert into exam_private.launch_passes (
    exam_id, roster_id, moodle_user_id, token_hash, expires_at
  ) values (
    v_exam.id, v_roster.id, p_moodle_user_id, p_token_hash, v_expires
  );

  select * into v_attempt
  from exam_private.attempts
  where exam_id = v_exam.id and roster_id = v_roster.id and attempt_number = 1;

  return jsonb_build_object(
    'serverNow', v_now,
    'expiresAt', v_expires,
    'studentName', v_roster.display_name,
    'exam', jsonb_build_object(
      'id', v_exam.public_id,
      'title', v_exam.title,
      'durationMinutes', v_exam.duration_minutes,
      'opensAt', v_exam.opens_at,
      'closesAt', v_exam.closes_at
    ),
    'attempt', case when v_attempt.id is null then null else jsonb_build_object(
      'status', v_attempt.status,
      'startedAt', v_attempt.started_at,
      'submittedAt', v_attempt.submitted_at
    ) end
  );
end;
$$;

-- Canjea el pase dentro de Safe Exam Browser. Un solo uso.
create or replace function public.exam_launch_by_pass(
  p_token_hash text,
  p_attempt_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pass exam_private.launch_passes%rowtype;
  v_exam exam_private.exams%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if p_token_hash is null or length(p_token_hash) <> 64
     or p_attempt_token_hash is null or length(p_attempt_token_hash) <> 64 then
    raise exception using errcode = '22023', message = 'invalid_pass';
  end if;

  select * into v_pass
  from exam_private.launch_passes
  where token_hash = p_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_pass';
  end if;
  if v_pass.consumed_at is not null then
    raise exception using errcode = 'P0001', message = 'pass_already_used';
  end if;
  if v_now >= v_pass.expires_at then
    raise exception using errcode = 'P0001', message = 'pass_expired';
  end if;

  select * into v_exam from exam_private.exams where id = v_pass.exam_id for share;
  if v_now < v_exam.opens_at then
    raise exception using errcode = 'P0001', message = 'exam_not_open';
  end if;
  if v_now >= v_exam.closes_at then
    raise exception using errcode = 'P0001', message = 'exam_closed';
  end if;

  update exam_private.launch_passes
  set consumed_at = v_now
  where id = v_pass.id;

  return exam_private.open_attempt(
    v_pass.exam_id, v_pass.roster_id, v_pass.moodle_user_id, p_attempt_token_hash
  );
end;
$$;

revoke all on function exam_private.open_attempt(bigint, bigint, bigint, text)
  from public, anon, authenticated;
revoke all on function public.exam_issue_pass(uuid, text, bigint, bigint, text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.exam_launch_by_pass(text, text)
  from public, anon, authenticated;

grant execute on function public.exam_issue_pass(uuid, text, bigint, bigint, text, text, text, integer)
  to service_role;
grant execute on function public.exam_launch_by_pass(text, text) to service_role;
