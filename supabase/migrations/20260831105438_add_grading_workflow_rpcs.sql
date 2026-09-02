-- Operaciones iniciales del panel docente.
-- Las funciones publicas usan los privilegios del invocador. Solo service_role
-- puede ejecutarlas y la Edge Function debe validar primero el JWT docente.

grant usage on schema exam_private to service_role;

grant select on table
  exam_private.exams,
  exam_private.questions,
  exam_private.question_options,
  exam_private.attempts,
  exam_private.attempt_items,
  exam_private.responses,
  exam_private.course_roster,
  exam_private.grader_profiles,
  exam_private.rubrics,
  exam_private.rubric_criteria,
  exam_private.grading_assignments,
  exam_private.essay_grades,
  exam_private.essay_grade_criteria,
  exam_private.essay_annotations,
  exam_private.grading_audit,
  exam_private.feedback_releases
to service_role;

grant update on table exam_private.attempts to service_role;
grant insert, update on table exam_private.grading_assignments to service_role;
grant insert on table exam_private.grading_audit to service_role;
grant usage, select on sequence
  exam_private.grading_assignments_id_seq,
  exam_private.grading_audit_id_seq
to service_role;

grant execute on function exam_private.assert_active_grader(uuid) to service_role;

create or replace function exam_private.grading_attempt_json(p_attempt_id bigint)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'attemptId', a.public_id,
    'examId', e.public_id,
    'examTitle', e.title,
    'studentName', a.display_name,
    'status', a.status,
    'submittedAt', a.submitted_at,
    'gradingStatus', a.grading_status,
    'gradingVersion', a.grading_version,
    'objectiveScore', a.objective_score,
    'objectiveMaxScore', a.objective_max_score,
    'manualScore', a.manual_score,
    'manualMaxScore', a.manual_max_score,
    'totalScore', a.total_score,
    'assignedTo', (
      select jsonb_build_object(
        'userId', gp.user_id,
        'displayName', gp.display_name,
        'claimedAt', ga.claimed_at
      )
      from exam_private.grading_assignments ga
      join exam_private.grader_profiles gp on gp.user_id = ga.grader_user_id
      where ga.attempt_id = a.id
        and ga.released_at is null
        and ga.completed_at is null
      limit 1
    ),
    'essays', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', ai.public_id,
          'questionId', q.public_id,
          'position', ai.position,
          'prompt', q.prompt,
          'maxPoints', q.points,
          'response', coalesce(r.essay_text, ''),
          'grade', case when eg.id is null then null else jsonb_build_object(
            'gradeId', eg.public_id,
            'score', eg.score,
            'generalFeedback', eg.general_feedback,
            'internalNote', eg.internal_note,
            'revision', eg.revision,
            'savedAt', eg.saved_at,
            'reviewedAt', eg.reviewed_at
          ) end,
          'criteria', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'criterionId', rc.public_id,
                'title', rc.title,
                'description', rc.description,
                'maxPoints', rc.max_points,
                'position', rc.position,
                'score', egc.score,
                'comment', coalesce(egc.comment, '')
              ) order by rc.position
            )
            from exam_private.rubrics rubric
            join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
            left join exam_private.essay_grade_criteria egc
              on egc.criterion_id = rc.id and egc.essay_grade_id = eg.id
            where rubric.exam_id = a.exam_id
              and rubric.is_active = true
              and rc.question_id = q.id
          ), '[]'::jsonb),
          'annotations', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'annotationId', annotation.public_id,
                'startOffset', annotation.start_offset,
                'endOffset', annotation.end_offset,
                'selectedText', annotation.selected_text,
                'comment', annotation.comment,
                'visibleToStudent', annotation.visible_to_student
              ) order by annotation.start_offset, annotation.id
            )
            from exam_private.essay_annotations annotation
            where annotation.essay_grade_id = eg.id
          ), '[]'::jsonb)
        ) order by ai.position
      )
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id
      left join exam_private.responses r on r.attempt_item_id = ai.id
      left join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
      where ai.attempt_id = a.id and q.kind = 'essay'
    ), '[]'::jsonb)
  )
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.id = p_attempt_id;
$$;

revoke all on function exam_private.grading_attempt_json(bigint)
  from public, anon, authenticated;
grant execute on function exam_private.grading_attempt_json(bigint)
  to service_role;

create or replace function public.grading_queue(
  p_actor_user_id uuid,
  p_exam_public_id uuid,
  p_status text default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_exam_id bigint;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  if p_status is not null and p_status not in (
    'unassigned', 'in_review', 'reviewed', 'ready_to_publish', 'published'
  ) then
    raise exception using errcode = '22023', message = 'invalid_grading_status';
  end if;
  if p_limit not between 1 and 200 then
    raise exception using errcode = '22023', message = 'invalid_page_limit';
  end if;

  select id into v_exam_id
  from exam_private.exams
  where public_id = p_exam_public_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'exam_not_available';
  end if;

  return jsonb_build_object(
    'counts', (
      select jsonb_build_object(
        'unassigned', count(*) filter (where a.grading_status = 'unassigned'),
        'inReview', count(*) filter (where a.grading_status = 'in_review'),
        'reviewed', count(*) filter (where a.grading_status = 'reviewed'),
        'readyToPublish', count(*) filter (where a.grading_status = 'ready_to_publish'),
        'published', count(*) filter (where a.grading_status = 'published')
      )
      from exam_private.attempts a
      where a.exam_id = v_exam_id
        and a.status in ('submitted', 'timed_out')
    ),
    'attempts', coalesce((
      select jsonb_agg(row_data.payload order by row_data.submitted_at, row_data.attempt_id)
      from (
        select
          a.submitted_at,
          a.id as attempt_id,
          jsonb_build_object(
            'attemptId', a.public_id,
            'studentName', a.display_name,
            'submittedAt', a.submitted_at,
            'attemptStatus', a.status,
            'gradingStatus', a.grading_status,
            'gradingVersion', a.grading_version,
            'objectiveScore', a.objective_score,
            'objectiveMaxScore', a.objective_max_score,
            'manualScore', a.manual_score,
            'manualMaxScore', a.manual_max_score,
            'totalScore', a.total_score,
            'assignedTo', case when gp.user_id is null then null else jsonb_build_object(
              'userId', gp.user_id,
              'displayName', gp.display_name,
              'claimedAt', ga.claimed_at
            ) end
          ) as payload
        from exam_private.attempts a
        left join exam_private.grading_assignments ga
          on ga.attempt_id = a.id
          and ga.released_at is null
          and ga.completed_at is null
        left join exam_private.grader_profiles gp on gp.user_id = ga.grader_user_id
        where a.exam_id = v_exam_id
          and a.status in ('submitted', 'timed_out')
          and (p_status is null or a.grading_status = p_status)
        order by a.submitted_at, a.id
        limit p_limit
      ) row_data
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.grading_get_attempt(
  p_actor_user_id uuid,
  p_attempt_public_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_attempt_id bigint;
  v_result jsonb;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  select id into v_attempt_id
  from exam_private.attempts
  where public_id = p_attempt_public_id
    and status in ('submitted', 'timed_out');

  if not found then
    raise exception using errcode = 'P0001', message = 'attempt_not_available';
  end if;

  v_result := exam_private.grading_attempt_json(v_attempt_id);
  if v_result is null then
    raise exception using errcode = 'P0001', message = 'attempt_not_available';
  end if;
  return v_result;
end;
$$;

create or replace function public.grading_claim_attempt(
  p_actor_user_id uuid,
  p_attempt_public_id uuid
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_attempt exam_private.attempts%rowtype;
  v_assignment exam_private.grading_assignments%rowtype;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.status not in ('submitted', 'timed_out') then
    raise exception using errcode = 'P0001', message = 'attempt_not_available';
  end if;
  if v_attempt.grading_status in ('ready_to_publish', 'published') then
    raise exception using errcode = 'P0001', message = 'attempt_not_claimable';
  end if;

  select * into v_assignment
  from exam_private.grading_assignments
  where attempt_id = v_attempt.id
    and released_at is null
    and completed_at is null
  for update;

  if found and v_assignment.grader_user_id <> p_actor_user_id then
    raise exception using errcode = 'P0001', message = 'attempt_already_claimed';
  end if;

  if not found then
    insert into exam_private.grading_assignments (attempt_id, grader_user_id)
    values (v_attempt.id, p_actor_user_id)
    returning * into v_assignment;

    update exam_private.attempts
    set grading_status = 'in_review',
        grading_version = grading_version + 1
    where id = v_attempt.id;

    insert into exam_private.grading_audit (
      attempt_id, actor_user_id, event_type, details
    ) values (
      v_attempt.id,
      p_actor_user_id,
      'claimed',
      jsonb_build_object('assignmentId', v_assignment.id)
    );
  end if;

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$$;

create or replace function public.grading_release_attempt(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_grader exam_private.grader_profiles%rowtype;
  v_attempt exam_private.attempts%rowtype;
  v_assignment exam_private.grading_assignments%rowtype;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);

  if length(v_reason) not between 3 and 500 then
    raise exception using errcode = '22023', message = 'invalid_release_reason';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'attempt_not_available';
  end if;

  select * into v_assignment
  from exam_private.grading_assignments
  where attempt_id = v_attempt.id
    and released_at is null
    and completed_at is null
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'attempt_not_claimed';
  end if;
  if v_assignment.grader_user_id <> p_actor_user_id
     and v_grader.role <> 'coordinator' then
    raise exception using errcode = '42501', message = 'assignment_owned_by_other_grader';
  end if;

  update exam_private.grading_assignments
  set released_at = clock_timestamp(),
      release_reason = v_reason
  where id = v_assignment.id;

  update exam_private.attempts
  set grading_status = 'unassigned',
      grading_version = grading_version + 1
  where id = v_attempt.id;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'released',
    jsonb_build_object(
      'assignmentId', v_assignment.id,
      'reason', v_reason,
      'previousGraderUserId', v_assignment.grader_user_id
    )
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$$;

revoke all on function public.grading_queue(uuid, uuid, text, integer)
  from public, anon, authenticated;
revoke all on function public.grading_get_attempt(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.grading_claim_attempt(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.grading_release_attempt(uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.grading_queue(uuid, uuid, text, integer)
  to service_role;
grant execute on function public.grading_get_attempt(uuid, uuid)
  to service_role;
grant execute on function public.grading_claim_attempt(uuid, uuid)
  to service_role;
grant execute on function public.grading_release_attempt(uuid, uuid, text)
  to service_role;
