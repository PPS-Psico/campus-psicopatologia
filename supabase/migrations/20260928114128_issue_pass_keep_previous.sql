create or replace function public.exam_issue_pass(p_exam_public_id uuid, p_course_id text, p_moodle_user_id bigint, p_dni bigint, p_first_name text, p_last_name text, p_token_hash text, p_ttl_seconds integer default 900)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
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

  -- Un pase nuevo ya no anula los anteriores. En el parcial del 28/09, quien
  -- recargaba la página mientras Safe Exam Browser abría llegaba con un pase
  -- anulado y quedaba afuera. Cada pase sigue siendo de un solo uso y vence
  -- solo; todos abren el mismo intento, así que tener dos vigentes no suma nada.

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
$function$;
