-- Resultado y nota final decididos por quien corrige.
--
-- En el primer parcial la estación sólo tenía puntajes: el resultado salía
-- después de un corte numérico sobre la suma, y con la opción múltiple casi
-- nadie quedaba por debajo de 4 aunque los desarrollos estuvieran en 0. Desde
-- ahora la corrección lleva su resultado (aprobado / desaprobado) y su nota
-- final, que no tiene que coincidir con la suma: la decide quien corrige.
--
-- - grading_save_draft recibe el resultado y la nota junto con las consignas.
-- - grading_mark_reviewed no deja cerrar una corrección sin resultado y nota,
--   y exige que sean coherentes: por debajo de 4 es desaprobado.
-- - grading_set_outcome deja a la coordinación cambiar el resultado y la nota
--   después de revisada, incluso ya publicada: en ese caso publica una versión
--   nueva de la devolución, que es la que pasa a leer el estudiante.

alter table exam_private.grading_audit
  drop constraint grading_audit_event_valid;
alter table exam_private.grading_audit
  add constraint grading_audit_event_valid check (event_type in (
    'objective_graded', 'claimed', 'released', 'draft_saved',
    'reviewed', 'ready_to_publish', 'published', 'reopened',
    'outcome_changed'
  ));

create or replace function exam_private.grading_attempt_json(p_attempt_id bigint)
 returns jsonb
 language sql
 stable
 set search_path to ''
as $function$
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
    'result', a.result,
    'finalScore', a.final_score,
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
                'kind', annotation.kind,
                'startOffset', annotation.start_offset,
                'endOffset', annotation.end_offset,
                'selectedText', annotation.selected_text,
                'suggestion', annotation.suggestion,
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
$function$;

-- Valida un resultado y una nota. En el borrador pueden faltar (se decide al
-- final); si están los dos, tienen que ser coherentes.
create or replace function exam_private.assert_outcome(p_result text, p_final_score numeric, p_complete boolean)
 returns void
 language plpgsql
 immutable
 set search_path to ''
as $function$
begin
  if p_result is not null and p_result not in ('aprobado', 'desaprobado') then
    raise exception using errcode = '22023', message = 'invalid_outcome';
  end if;
  if p_final_score is not null and (p_final_score < 0 or p_final_score > 10) then
    raise exception using errcode = '22023', message = 'invalid_outcome';
  end if;
  if p_complete and (p_result is null or p_final_score is null) then
    raise exception using errcode = 'P0001', message = 'outcome_required';
  end if;
  if p_result = 'aprobado' and p_final_score < 4
     or p_result = 'desaprobado' and p_final_score >= 4 then
    raise exception using errcode = 'P0001', message = 'outcome_inconsistent';
  end if;
end;
$function$;

revoke all on function exam_private.assert_outcome(text, numeric, boolean) from public, anon, authenticated;

drop function if exists public.grading_save_draft(uuid, uuid, bigint, jsonb);

create or replace function public.grading_save_draft(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint,
  p_essays jsonb,
  p_outcome jsonb default null
)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
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
  v_kind text;
  v_suggestion text;
  v_seen_items uuid[] := array[]::uuid[];
  v_saved integer := 0;
  v_new_version bigint;
  v_result text;
  v_final numeric(4, 2);
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
       or jsonb_array_length(v_annotations) > 400 then
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
      v_kind := coalesce(nullif(v_annotation->>'kind', ''), 'comment');
      v_suggestion := nullif(btrim(coalesce(v_annotation->>'suggestion', '')), '');

      if v_start < 0 or v_end <= v_start
         or v_end > length(v_item.response_text)
         or substring(v_item.response_text from v_start + 1 for v_end - v_start) <> v_selected then
        raise exception using errcode = '22023', message = 'annotation_text_mismatch';
      end if;

      if v_kind not in ('comment', 'spelling', 'accent')
         or length(v_comment) > 4000
         or (v_kind = 'comment' and length(btrim(v_comment)) < 1)
         or (v_kind <> 'comment' and (v_suggestion is null or length(v_suggestion) > 200)) then
        raise exception using errcode = '22023', message = 'invalid_annotation_entry';
      end if;

      insert into exam_private.essay_annotations (
        essay_grade_id, grader_user_id, start_offset, end_offset,
        selected_text, comment, visible_to_student, kind, suggestion
      ) values (
        v_grade_id,
        p_actor_user_id,
        v_start,
        v_end,
        v_selected,
        v_comment,
        coalesce((v_annotation->>'visibleToStudent')::boolean, true),
        v_kind,
        case when v_kind = 'comment' then null else v_suggestion end
      );
    end loop;

    v_saved := v_saved + 1;
  end loop;

  -- El resultado y la nota viajan con la corrección. Sin p_outcome (un cliente
  -- viejo) quedan como estaban; con p_outcome, se guarda lo que diga, aunque
  -- sea vacío: en el borrador todavía se puede no haber decidido.
  if p_outcome is not null then
    if jsonb_typeof(p_outcome) <> 'object'
       or jsonb_typeof(coalesce(p_outcome->'result', 'null'::jsonb)) not in ('string', 'null')
       or jsonb_typeof(coalesce(p_outcome->'finalScore', 'null'::jsonb)) not in ('number', 'null') then
      raise exception using errcode = '22023', message = 'invalid_outcome';
    end if;
    v_result := nullif(p_outcome->>'result', '');
    v_final := case when jsonb_typeof(p_outcome->'finalScore') = 'number'
      then round((p_outcome->>'finalScore')::numeric, 2) else null end;
    perform exam_private.assert_outcome(v_result, v_final, false);
    update exam_private.attempts
    set result = v_result, final_score = v_final
    where id = v_attempt.id;
  end if;

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
    jsonb_build_object(
      'savedEssays', v_saved,
      'version', v_new_version,
      'result', v_result,
      'finalScore', v_final
    )
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$function$;

revoke all on function public.grading_save_draft(uuid, uuid, bigint, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.grading_save_draft(uuid, uuid, bigint, jsonb, jsonb)
  to service_role;

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

  -- La rúbrica sólo se exige cuando existe.
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

  -- Sin resultado y nota final no se cierra la corrección: la decisión es de
  -- quien corrige, no de la suma.
  perform exam_private.assert_outcome(v_attempt.result, v_attempt.final_score, true);

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
    jsonb_build_object(
      'manualScore', v_manual_score,
      'result', v_attempt.result,
      'finalScore', v_attempt.final_score
    )
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$function$;

-- La coordinación cambia el resultado y la nota de una corrección ya cerrada:
-- después de una revisión, de un coloquio o de un error. Si la devolución ya
-- estaba publicada, se publica una versión nueva con la nota cambiada.
create or replace function public.grading_set_outcome(
  p_actor_user_id uuid,
  p_attempt_public_id uuid,
  p_expected_version bigint,
  p_result text,
  p_final_score numeric
)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare
  v_grader exam_private.grader_profiles%rowtype;
  v_attempt exam_private.attempts%rowtype;
  v_final numeric(4, 2) := round(p_final_score, 2);
  v_snapshot jsonb;
  v_release_version integer;
  v_release_public_id uuid;
begin
  v_grader := exam_private.assert_active_grader(p_actor_user_id);
  if v_grader.role <> 'coordinator' then
    raise exception using errcode = '42501', message = 'coordinator_required';
  end if;

  select * into v_attempt
  from exam_private.attempts
  where public_id = p_attempt_public_id
  for update;

  if not found or v_attempt.grading_status not in ('reviewed', 'ready_to_publish', 'published') then
    raise exception using errcode = 'P0001', message = 'attempt_not_editable';
  end if;
  if v_attempt.grading_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'grading_version_conflict';
  end if;

  perform exam_private.assert_outcome(p_result, v_final, true);

  update exam_private.attempts
  set result = p_result,
      final_score = v_final,
      grading_version = grading_version + 1
  where id = v_attempt.id;

  if v_attempt.grading_status = 'published' then
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
      v_attempt.id, v_release_version, p_actor_user_id, v_snapshot, clock_timestamp()
    )
    returning public_id into v_release_public_id;

    update exam_private.attempts
    set feedback_published_at = clock_timestamp()
    where id = v_attempt.id;
  end if;

  insert into exam_private.grading_audit (
    attempt_id, actor_user_id, event_type, details
  ) values (
    v_attempt.id,
    p_actor_user_id,
    'outcome_changed',
    jsonb_build_object(
      'from', jsonb_build_object('result', v_attempt.result, 'finalScore', v_attempt.final_score),
      'to', jsonb_build_object('result', p_result, 'finalScore', v_final),
      'releaseVersion', v_release_version
    )
  );

  return exam_private.grading_attempt_json(v_attempt.id);
end;
$function$;

revoke all on function public.grading_set_outcome(uuid, uuid, bigint, text, numeric)
  from public, anon, authenticated;
grant execute on function public.grading_set_outcome(uuid, uuid, bigint, text, numeric)
  to service_role;
