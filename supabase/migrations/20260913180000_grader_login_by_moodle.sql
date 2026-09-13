-- La corrección se abre con la misma identidad que el parcial: el Campus.
--
-- Obligar a Blas y Guadalupe a crear una cuenta aparte agregaba una contraseña
-- más que recordar y un padrón más que mantener, para proteger los mismos datos
-- que ya protege su cuenta institucional. En vez de eso, el panel reconoce sus
-- DNI a través de FilterCodes, igual que a los estudiantes, y sólo esos dos
-- documentos habilitan el espacio.
--
-- El precio, explícito: quien pueda entrar a Moodle como ellos puede corregir.
-- Es la misma superficie que ya protege el resto de su cuenta docente.

-- El perfil deja de depender de Supabase Auth. Se conserva user_id como
-- identificador interno porque es lo que reciben todas las funciones de
-- corrección ya escritas; lo que se va es la obligación de que exista una
-- cuenta detrás.
alter table exam_private.grader_profiles
  drop constraint grader_profiles_user_id_fkey;

alter table exam_private.grader_profiles
  alter column user_id set default gen_random_uuid(),
  add column course_id text,
  add column dni bigint,
  add column moodle_user_id bigint,
  add constraint grader_profiles_dni_valid
    check (dni is null or dni between 100000 and 999999999),
  add constraint grader_profiles_moodle_user_valid
    check (moodle_user_id is null or moodle_user_id > 0);

create unique index grader_profiles_course_dni_unique
  on exam_private.grader_profiles (course_id, dni)
  where dni is not null;

create unique index grader_profiles_course_moodle_unique
  on exam_private.grader_profiles (course_id, moodle_user_id)
  where moodle_user_id is not null;

create table exam_private.grader_sessions (
  id bigint generated always as identity primary key,
  grader_user_id uuid not null references exam_private.grader_profiles(user_id) on delete cascade,
  token_hash text not null unique,
  issued_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint grader_sessions_token_valid check (length(token_hash) = 64),
  constraint grader_sessions_window_valid check (expires_at > issued_at)
);

create index grader_sessions_grader_idx
  on exam_private.grader_sessions (grader_user_id);
create index grader_sessions_live_idx
  on exam_private.grader_sessions (expires_at)
  where revoked_at is null;

alter table exam_private.grader_sessions enable row level security;
alter table exam_private.grader_sessions force row level security;
revoke all on exam_private.grader_sessions from public, anon, authenticated;
revoke all on sequence exam_private.grader_sessions_id_seq from public, anon, authenticated;

-- Abre sesión docente desde el contexto de Moodle. El nombre se compara
-- normalizado, igual que en el padrón estudiantil, para tolerar tildes.
create or replace function public.grading_login_by_identity(
  p_course_id text,
  p_moodle_user_id bigint,
  p_dni bigint,
  p_first_name text,
  p_last_name text,
  p_token_hash text,
  p_ttl_seconds integer default 28800
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grader exam_private.grader_profiles%rowtype;
  v_now timestamptz := clock_timestamp();
  v_expires timestamptz;
begin
  if p_token_hash is null or length(p_token_hash) <> 64
     or p_ttl_seconds is null or p_ttl_seconds not between 300 and 43200 then
    raise exception using errcode = '22023', message = 'invalid_grader_session';
  end if;
  if p_moodle_user_id is null or p_moodle_user_id <= 0
     or p_dni is null or p_dni not between 100000 and 999999999 then
    raise exception using errcode = '22023', message = 'invalid_moodle_context';
  end if;

  select * into v_grader
  from exam_private.grader_profiles
  where course_id = p_course_id
    and dni = p_dni
    and active = true
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'not_a_grader';
  end if;

  if v_grader.moodle_user_id is not null
     and v_grader.moodle_user_id <> p_moodle_user_id then
    raise exception using errcode = 'P0001', message = 'moodle_account_conflict';
  end if;

  if v_grader.moodle_user_id is null then
    update exam_private.grader_profiles
    set moodle_user_id = p_moodle_user_id, updated_at = v_now
    where user_id = v_grader.user_id
    returning * into v_grader;
  end if;

  -- Una sesión nueva reemplaza a la anterior del mismo docente: si entra desde
  -- otro equipo, el acceso viejo deja de servir.
  update exam_private.grader_sessions
  set revoked_at = v_now
  where grader_user_id = v_grader.user_id and revoked_at is null;

  v_expires := v_now + make_interval(secs => p_ttl_seconds);

  insert into exam_private.grader_sessions (grader_user_id, token_hash, expires_at)
  values (v_grader.user_id, p_token_hash, v_expires);

  return jsonb_build_object(
    'serverNow', v_now,
    'expiresAt', v_expires,
    'displayName', v_grader.display_name,
    'role', v_grader.role
  );
end;
$$;

create or replace function public.grading_session_actor(p_token_hash text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
begin
  select grader_user_id into v_actor
  from exam_private.grader_sessions
  where token_hash = p_token_hash
    and revoked_at is null
    and expires_at > clock_timestamp();

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_grader_session';
  end if;
  return v_actor;
end;
$$;

create or replace function public.grading_logout(p_token_hash text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update exam_private.grader_sessions
  set revoked_at = clock_timestamp()
  where token_hash = p_token_hash and revoked_at is null;
end;
$$;

revoke all on function public.grading_login_by_identity(text, bigint, bigint, text, text, text, integer)
  from public, anon, authenticated;
revoke all on function public.grading_session_actor(text) from public, anon, authenticated;
revoke all on function public.grading_logout(text) from public, anon, authenticated;

grant execute on function public.grading_login_by_identity(text, bigint, bigint, text, text, text, integer)
  to service_role;
grant execute on function public.grading_session_actor(text) to service_role;
grant execute on function public.grading_logout(text) to service_role;
