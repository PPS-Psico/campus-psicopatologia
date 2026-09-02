-- Borradores versionados, cierre de correccion y publicacion inmutable.

grant insert, update on table exam_private.essay_grades to service_role;
grant insert, update, delete on table
  exam_private.essay_grade_criteria,
  exam_private.essay_annotations
to service_role;
grant insert on table exam_private.feedback_releases to service_role;
grant usage, select on sequence
  exam_private.essay_grades_id_seq,
  exam_private.essay_grade_criteria_id_seq,
  exam_private.essay_annotations_id_seq,
  exam_private.feedback_releases_id_seq
to service_role;

create or replace function exam_private.feedback_snapshot_json(p_attempt_id bigint)
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
    'submittedAt', a.submitted_at,
    'objectiveScore', a.objective_score,
    'objectiveMaxScore', a.objective_max_score,
    'manualScore', a.manual_score,
    'manualMaxScore', a.manual_max_score,
    'totalScore', a.total_score,
    'maxScore', coalesce(a.objective_max_score, 0) + coalesce(a.manual_max_score, 0),
    'essays', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', ai.public_id,
          'position', ai.position,
          'prompt', q.prompt,
          'maxPoints', q.points,
          'response', coalesce(r.essay_text, ''),
          'score', eg.score,
          'generalFeedback', eg.general_feedback,
          'criteria', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'title', rc.title,
                'description', rc.description,
                'maxPoints', rc.max_points,
                'score', egc.score,
                'comment', egc.comment
              ) order by rc.position
            )
            from exam_private.rubrics rubric
            join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
            join exam_private.essay_grade_criteria egc
              on egc.criterion_id = rc.id and egc.essay_grade_id = eg.id
            where rubric.exam_id = a.exam_id
              and rubric.is_active = true
              and rc.question_id = q.id
          ), '[]'::jsonb),
          'annotations', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'startOffset', annotation.start_offset,
                'endOffset', annotation.end_offset,
                'selectedText', annotation.selected_text,
                'comment', annotation.comment
              ) order by annotation.start_offset, annotation.id
            )
            from exam_private.essay_annotations annotation
            where annotation.essay_grade_id = eg.id
              and annotation.visible_to_student = true
          ), '[]'::jsonb)
        ) order by ai.position
      )
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id
      join exam_private.responses r on r.attempt_item_id = ai.id
      join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
      where ai.attempt_id = a.id and q.kind = 'essay'
    ), '[]'::jsonb)
  )
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.id = p_attempt_id;
$$;

revoke all on function exam_private.feedback_snapshot_json(bigint)
  from public, anon, authenticated;
grant execute on function exam_private.feedback_snapshot_json(bigint)
  to service_role;

create or replace function public.grading_save_draft(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint,
  p_essays jsonb
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
  v_entry jsonb;
  v_criterion jsonb;
  v_annotation jsonb;
  v_item record;
  v_grade_id bigint;
  v_score numeric(7, 2);
  v_feedback text;
  v_internal_note text;
  v_criteria jsonb;
  v_annotations jsonb;
  v_criterion_id bigint;
  v_criterion_score numeric(7, 2);
  v_start integer;
  v_end integer;
  v_selected text;
  v_comment text;
  v_seen_items uuid[] := array[]::uuid[];
  v_saved integer := 0;
  v_new_version bigint;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  if jsonb_typeof(p_essays) <> 'array'
     or jsonb_array_length(p_essays) not between 1 and 10 then
    raise exception using errcode = '22023', message = 'invalid_essay_batch';
  end if;

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

  for v_entry in select value from jsonb_array_elements(p_essays)
  loop
    if jsonb_typeof(v_entry) <> 'object'
       or nullif(v_entry->>'itemId', '') is null then
      raise exception using errcode = '22023', message = 'invalid_essay_entry';
    end if;

    if (v_entry->>'itemId')::uuid = any(v_seen_items) then
      raise exception using errcode = '22023', message = 'duplicate_essay_item';
    end if;
    v_seen_items := array_append(v_seen_items, (v_entry->>'itemId')::uuid);

    select
      ai.id,
      ai.question_id,
      q.points,
      coalesce(r.essay_text, '') as response_text
    into v_item
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id
    left join exam_private.responses r on r.attempt_item_id = ai.id
    where ai.public_id = (v_entry->>'itemId')::uuid
      and ai.attempt_id = v_attempt.id
      and q.kind = 'essay';

    if not found then
      raise exception using errcode = '22023', message = 'invalid_essay_item';
    end if;

    if v_entry ? 'score' and jsonb_typeof(v_entry->'score') not in ('number', 'null') then
      raise exception using errcode = '22023', message = 'invalid_essay_score';
    end if;
    v_score := case
      when jsonb_typeof(v_entry->'score') = 'number' then (v_entry->>'score')::numeric
      else null
    end;
    if v_score is not null and (v_score < 0 or v_score > v_item.points) then
      raise exception using errcode = '22023', message = 'invalid_essay_score';
    end if;

    v_feedback := coalesce(v_entry->>'generalFeedback', '');
    v_internal_note := coalesce(v_entry->>'internalNote', '');
    if length(v_feedback) > 8000 or length(v_internal_note) > 8000 then
      raise exception using errcode = '22023', message = 'grading_text_too_long';
    end if;

    insert into exam_private.essay_grades (
      attempt_id, attempt_item_id, grader_user_id, score,
      general_feedback, internal_note, revision
    ) values (
      v_attempt.id, v_item.id, p_actor_user_id, v_score,
      v_feedback, v_internal_note, 1
    )
    on conflict (attempt_item_id) do update
    set grader_user_id = excluded.grader_user_id,
        score = excluded.score,
        general_feedback = excluded.general_feedback,
        internal_note = excluded.internal_note,
        revision = exam_private.essay_grades.revision + 1,
        saved_at = clock_timestamp(),
        reviewed_at = null
    returning id into v_grade_id;

    v_criteria := coalesce(v_entry->'criteria', '[]'::jsonb);
    if jsonb_typeof(v_criteria) <> 'array' or jsonb_array_length(v_criteria) > 50 then
      raise exception using errcode = '22023', message = 'invalid_criteria_batch';
    end if;

    delete from exam_private.essay_grade_criteria
    where essay_grade_id = v_grade_id;

    for v_criterion in select value from jsonb_array_elements(v_criteria)
    loop
      if jsonb_typeof(v_criterion) <> 'object'
         or jsonb_typeof(v_criterion->'score') <> 'number' then
        raise exception using errcode = '22023', message = 'invalid_criterion_entry';
      end if;

      select rc.id into v_criterion_id
      from exam_private.rubric_criteria rc
      join exam_private.rubrics rubric on rubric.id = rc.rubric_id
      where rc.public_id = (v_criterion->>'criterionId')::uuid
        and rc.question_id = v_item.question_id
        and rubric.exam_id = v_attempt.exam_id
        and rubric.is_active = true;

      if not found then
        raise exception using errcode = '22023', message = 'invalid_rubric_criterion';
      end if;

      v_criterion_score := (v_criterion->>'score')::numeric;
      v_comment := coalesce(v_criterion->>'comment', '');
      if length(v_comment) > 4000 then
        raise exception using errcode = '22023', message = 'grading_text_too_long';
      end if;

      insert into exam_private.essay_grade_criteria (
        essay_grade_id, criterion_id, score, comment
      ) values (
        v_grade_id, v_criterion_id, v_criterion_score, v_comment
      );
    end loop;

    v_annotations := coalesce(v_entry->'annotations', '[]'::jsonb);
    if jsonb_typeof(v_annotations) <> 'array'
       or jsonb_array_length(v_annotations) > 100 then
      raise exception using errcode = '22023', message = 'invalid_annotation_batch';
    end if;

    delete from exam_private.essay_annotations
    where essay_grade_id = v_grade_id;

    for v_annotation in select value from jsonb_array_elements(v_annotations)
    loop
      if jsonb_typeof(v_annotation) <> 'object' then
        raise exception using errcode = '22023', message = 'invalid_annotation_entry';
      end if;

      v_start := (v_annotation->>'startOffset')::integer;
      v_end := (v_annotation->>'endOffset')::integer;
      v_selected := coalesce(v_annotation->>'selectedText', '');
      v_comment := coalesce(v_annotation->>'comment', '');

      if v_start < 0 or v_end <= v_start
         or v_end > length(v_item.response_text)
         or substring(v_item.response_text from v_start + 1 for v_end - v_start) <> v_selected
         or length(v_comment) not between 1 and 4000 then
        raise exception using errcode = '22023', message = 'annotation_text_mismatch';
      end if;

      insert into exam_private.essay_annotations (
        essay_grade_id, grader_user_id, start_offset, end_offset,
        selected_text, comment, visible_to_student
      ) values (
        v_grade_id,
        p_actor_user_id,
        v_start,
        v_end,
        v_selected,
        v_comment,
        coalesce((v_annotation->>'visibleToStudent')::boolean, true)
      );
    end loop;

    v_saved := v_saved + 1;
  end loop;

  update exam_private.attempts
  set grading_version = grading_version + 1
  where id = v_attempt.id
  returning grading_version into v_new_version;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'draft_saved',
    jsonb_build_object('savedEssays', v_saved, 'version', v_new_version)
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$$;

create or replace function public.grading_mark_reviewed(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint
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

  if exists (
    select 1
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id
    join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
    where ai.attempt_id = v_attempt.id
      and q.kind = 'essay'
      and (
        not exists (
          select 1
          from exam_private.rubrics rubric
          join exam_private.rubric_criteria rc on rc.rubric_id = rubric.id
          where rubric.exam_id = v_attempt.exam_id
            and rubric.is_active = true
            and rc.question_id = q.id
        )
        or exists (
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
$$;

create or replace function public.grading_mark_ready(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint
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
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);
  if v_grader.role <> 'coordinator' then
    raise exception using errcode = '42501', message = 'coordinator_required';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.grading_status <> 'reviewed' then
    raise exception using errcode = 'P0001', message = 'attempt_not_reviewed';
  end if;
  if v_attempt.grading_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'grading_version_conflict';
  end if;

  update exam_private.attempts
  set grading_status = 'ready_to_publish',
      grading_version = grading_version + 1
  where id = v_attempt.id;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type
  ) values (v_attempt.id, p_actor_user_id, 'ready_to_publish');

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$$;

create or replace function public.grading_publish(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint
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
  v_release_id bigint;
  v_release_public_id uuid;
  v_release_version integer;
  v_published_at timestamptz := clock_timestamp();
  v_snapshot jsonb;
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);
  if v_grader.role <> 'coordinator' then
    raise exception using errcode = '42501', message = 'coordinator_required';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.grading_status <> 'ready_to_publish'
     or v_attempt.total_score is null then
    raise exception using errcode = 'P0001', message = 'attempt_not_ready_to_publish';
  end if;
  if v_attempt.grading_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'grading_version_conflict';
  end if;

  v_snapshot := exam_private.feedback_snapshot_json(v_attempt.id);
  if v_snapshot is null then
    raise exception using errcode = 'P0001', message = 'feedback_snapshot_failed';
  end if;

  select coalesce(max(version), 0) + 1 into v_release_version
  from exam_private.feedback_releases
  where attempt_id = v_attempt.id;

  insert into exam_private.feedback_releases (
    attempt_id, version, published_by, snapshot, published_at
  ) values (
    v_attempt.id, v_release_version, p_actor_user_id, v_snapshot, v_published_at
  )
  returning id, public_id into v_release_id, v_release_public_id;

  update exam_private.attempts
  set grading_status = 'published',
      feedback_published_at = v_published_at,
      grading_version = grading_version + 1
  where id = v_attempt.id;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'published',
    jsonb_build_object(
      'releaseId', v_release_public_id,
      'releaseVersion', v_release_version
    )
  );

  return jsonb_build_object(
    'attemptId', v_attempt.public_id,
    'gradingStatus', 'published',
    'gradingVersion', v_attempt.grading_version + 1,
    'releaseId', v_release_public_id,
    'releaseVersion', v_release_version,
    'publishedAt', v_published_at
  );
end;
$$;

revoke all on function public.grading_save_draft(uuid, uuid, bigint, jsonb)
  from public, anon, authenticated;
revoke all on function public.grading_mark_reviewed(uuid, uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.grading_mark_ready(uuid, uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.grading_publish(uuid, uuid, bigint)
  from public, anon, authenticated;

grant execute on function public.grading_save_draft(uuid, uuid, bigint, jsonb)
  to service_role;
grant execute on function public.grading_mark_reviewed(uuid, uuid, bigint)
  to service_role;
grant execute on function public.grading_mark_ready(uuid, uuid, bigint)
  to service_role;
grant execute on function public.grading_publish(uuid, uuid, bigint)
  to service_role;
