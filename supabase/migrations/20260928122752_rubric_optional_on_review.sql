create or replace function public.grading_mark_reviewed(p_actor_user_id uuid, p_attempt_public_id uuid, p_expected_version bigint)
returns jsonb
language plpgsql
set search_path to ''
as $function$
declare
  v_attempt exam_private.attempts%rowtype;
  v_assignment exam_private.grading_assignments%rowtype;
  v_manual_score numeric(7, 2);
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.grading_status <> 'in_review' then
    raise exception using errcode = 'P0001', message = 'attempt_not_editable';
  end if;
  if v_attempt.grading_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'grading_version_conflict';
  end if;

  select * into v_assignment
  from exam_private.grading_assignments
  where attempt_id = v_attempt.id
    and released_at is null
    and completed_at is null
  for update;

  if not found or v_assignment.grader_user_id <> p_actor_user_id then
    raise exception using errcode = '42501', message = 'attempt_not_owned';
  end if;

  if exists (
    select 1
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id
    left join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
    where ai.attempt_id = v_attempt.id
      and q.kind = 'essay'
      and eg.score is null
  ) then
    raise exception using errcode = 'P0001', message = 'essay_grades_incomplete';
  end if;

  -- La rúbrica sólo se exige cuando existe. El primer parcial (28/09) se
  -- corrige con puntaje y devolución por consigna, sin rúbrica cargada, y la
  -- versión anterior rechazaba toda revisión con rubric_grades_incomplete.
  if exists (
    select 1
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id
    join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
    where ai.attempt_id = v_attempt.id
      and q.kind = 'essay'
      and exists (
        select 1
        from exam_private.rubrics rubric
        join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
        where rubric.exam_id = v_attempt.exam_id
          and rubric.is_active = true
          and rc.question_id = q.id
      )
      and (
        exists (
          select 1
          from exam_private.rubrics rubric
          join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
          left join exam_private.essay_grade_criteria egc
            on egc.criterion_id = rc.id and egc.essay_grade_id = eg.id
          where rubric.exam_id = v_attempt.exam_id
            and rubric.is_active = true
            and rc.question_id = q.id
            and egc.id is null
        )
        or eg.score <> coalesce((
          select sum(egc.score)
          from exam_private.rubrics rubric
          join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
          join exam_private.essay_grade_criteria egc
            on egc.criterion_id = rc.id and egc.essay_grade_id = eg.id
          where rubric.exam_id = v_attempt.exam_id
            and rubric.is_active = true
            and rc.question_id = q.id
        ), -1)
      )
  ) then
    raise exception using errcode = 'P0001', message = 'rubric_grades_incomplete';
  end if;

  select coalesce(sum(eg.score), 0) into v_manual_score
  from exam_private.essay_grades eg
  where eg.attempt_id = v_attempt.id;

  if v_manual_score > v_attempt.manual_max_score then
    raise exception using errcode = 'P0001', message = 'manual_score_exceeds_maximum';
  end if;

  update exam_private.essay_grades
  set reviewed_at = clock_timestamp()
  where attempt_id = v_attempt.id;

  update exam_private.grading_assignments
  set completed_at = clock_timestamp()
  where id = v_assignment.id;

  update exam_private.attempts
  set manual_score = v_manual_score,
      total_score = coalesce(objective_score, 0) + v_manual_score,
      grading_status = 'reviewed',
      grading_version = grading_version + 1
  where id = v_attempt.id;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'reviewed',
    jsonb_build_object('manualScore', v_manual_score)
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$function$;
