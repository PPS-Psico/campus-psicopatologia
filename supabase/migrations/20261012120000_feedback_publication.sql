-- Publicación de la devolución del parcial.
--
-- Cada entrega guarda su resultado (aprobado / desaprobado) y su nota final:
-- no siempre coincide con la suma de puntos (un desaprobado de Blas lleva 2).
-- La devolución que lee el estudiante suma la opción múltiple pregunta por
-- pregunta (con su respuesta y la correcta, en el orden en que vio las
-- opciones) y una lista general con las notas publicadas del curso.
-- Para revisar antes de publicar, la estación tiene una vista de todas las
-- notas y una vista previa de la devolución de cada estudiante.

alter table exam_private.attempts
  add column result text,
  add column final_score numeric(4, 2);

alter table exam_private.attempts
  add constraint attempts_result_valid check (result is null or result in ('aprobado', 'desaprobado')),
  add constraint attempts_final_score_valid check (final_score is null or final_score between 0 and 10);

create or replace function exam_private.feedback_snapshot_json(p_attempt_id bigint)
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
    'submittedAt', a.submitted_at,
    'objectiveScore', a.objective_score,
    'objectiveMaxScore', a.objective_max_score,
    'manualScore', a.manual_score,
    'manualMaxScore', a.manual_max_score,
    'totalScore', a.total_score,
    'maxScore', coalesce(a.objective_max_score, 0) + coalesce(a.manual_max_score, 0),
    'result', a.result,
    'finalScore', a.final_score,
    'multipleChoice', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'position', ai.position,
          'prompt', q.prompt,
          'points', q.points,
          'answered', r.selected_option_id is not null,
          'correct', coalesce(sel.is_correct, false),
          'options', (
            select jsonb_agg(
              jsonb_build_object(
                'label', qo.label,
                'chosen', qo.id = r.selected_option_id,
                'correct', qo.is_correct
              ) order by oo.ord
            )
            from exam_private.option_order(a.id, ai.id) oo
            join exam_private.question_options qo on qo.id = oo.option_id
          )
        ) order by ai.position
      )
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id and q.kind = 'single_choice'
      left join exam_private.responses r on r.attempt_item_id = ai.id
      left join exam_private.question_options sel on sel.id = r.selected_option_id
      where ai.attempt_id = a.id
    ), '[]'::jsonb),
    'essays', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'itemId', ai.public_id,
          'position', ai.position,
          'prompt', q.prompt,
          'maxPoints', q.points,
          'response', coalesce(r.essay_text, ''),
          'score', eg.score,
          'generalFeedback', coalesce(eg.general_feedback, ''),
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
                'kind', annotation.kind,
                'startOffset', annotation.start_offset,
                'endOffset', annotation.end_offset,
                'selectedText', annotation.selected_text,
                'suggestion', annotation.suggestion,
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
      join exam_private.questions q on q.id = ai.question_id and q.kind = 'essay'
      left join exam_private.responses r on r.attempt_item_id = ai.id
      left join exam_private.essay_grades eg on eg.attempt_item_id = ai.id
      where ai.attempt_id = a.id
    ), '[]'::jsonb)
  )
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.id = p_attempt_id;
$function$;

-- La lista general: sólo las entregas ya publicadas del curso del estudiante.
create or replace function exam_private.course_grades_json(p_course_id text)
 returns jsonb
 language sql
 stable
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'examTitle', e.title,
      'studentName', a.display_name,
      'finalScore', coalesce(a.final_score, a.total_score),
      'result', a.result
    ) order by e.opens_at, cr.last_name_normalized, cr.first_name_normalized
  ), '[]'::jsonb)
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  join exam_private.course_roster cr on cr.id = a.roster_id
  where e.course_id = p_course_id
    and a.grading_status = 'published';
$function$;

revoke all on function exam_private.course_grades_json(text) from public, anon, authenticated;
grant execute on function exam_private.course_grades_json(text) to service_role;

create or replace function public.feedback_get(p_session_token_hash text)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare
  v_session exam_private.student_feedback_sessions%rowtype;
  v_roster exam_private.course_roster%rowtype;
  v_now timestamptz := clock_timestamp();
  v_releases jsonb;
begin
  if p_session_token_hash is null
     or p_session_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid_feedback_session';
  end if;

  select * into v_session
  from exam_private.student_feedback_sessions
  where token_hash = p_session_token_hash
    and revoked_at is null
    and expires_at > v_now
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_feedback_session';
  end if;

  update exam_private.student_feedback_sessions
  set last_used_at = v_now
  where id = v_session.id;

  select * into v_roster
  from exam_private.course_roster
  where id = v_session.roster_id and active = true;

  if not found then
    raise exception using errcode = 'P0001', message = 'identity_not_registered';
  end if;

  select coalesce(
    jsonb_agg(recent.payload order by recent.published_at desc),
    '[]'::jsonb
  ) into v_releases
  from (
    select distinct on (a.id)
      a.id,
      fr.published_at,
      fr.snapshot || jsonb_build_object(
        'releaseId', fr.public_id,
        'releaseVersion', fr.version,
        'publishedAt', fr.published_at
      ) as payload
    from exam_private.attempts a
    join exam_private.exams e on e.id = a.exam_id
    join exam_private.feedback_releases fr on fr.attempt_id = a.id
    where a.roster_id = v_roster.id
      and e.course_id = v_roster.course_id
      and a.grading_status = 'published'
    order by a.id, fr.version desc
  ) recent;

  return jsonb_build_object(
    'studentName', v_roster.display_name,
    'courseId', v_roster.course_id,
    'releases', v_releases,
    'courseGrades', exam_private.course_grades_json(v_roster.course_id)
  );
end;
$function$;

-- Vista de todas las notas para el equipo docente, publicadas o no.
create or replace function public.grading_overview(p_actor_user_id uuid, p_exam_public_id uuid)
 returns jsonb
 language plpgsql
 stable
 set search_path to ''
as $function$
declare
  v_exam exam_private.exams%rowtype;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  select * into v_exam
  from exam_private.exams
  where public_id = p_exam_public_id and grading_enabled = true;
  if not found then
    raise exception using errcode = 'P0001', message = 'exam_not_available';
  end if;

  return jsonb_build_object(
    'examId', v_exam.public_id,
    'examTitle', v_exam.title,
    'attempts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'attemptId', a.public_id,
          'studentName', a.display_name,
          'objectiveScore', a.objective_score,
          'manualScore', a.manual_score,
          'totalScore', a.total_score,
          'finalScore', coalesce(a.final_score, a.total_score),
          'result', a.result,
          'gradingStatus', a.grading_status,
          'grader', (
            select gp.display_name
            from exam_private.grading_assignments ga
            join exam_private.grader_profiles gp on gp.user_id = ga.grader_user_id
            where ga.attempt_id = a.id and ga.released_at is null
            order by ga.claimed_at desc
            limit 1
          )
        ) order by cr.last_name_normalized, cr.first_name_normalized
      )
      from exam_private.attempts a
      left join exam_private.course_roster cr on cr.id = a.roster_id
      where a.exam_id = v_exam.id
        and a.submitted_at is not null
    ), '[]'::jsonb)
  );
end;
$function$;

-- Lo mismo que va a leer el estudiante, antes de publicarlo.
create or replace function public.grading_feedback_preview(p_actor_user_id uuid, p_attempt_public_id uuid)
 returns jsonb
 language plpgsql
 stable
 set search_path to ''
as $function$
declare
  v_attempt_id bigint;
begin
  perform exam_private.assert_active_grader(p_actor_user_id);

  select a.id into v_attempt_id
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.public_id = p_attempt_public_id
    and e.grading_enabled = true
    and a.submitted_at is not null;
  if not found then
    raise exception using errcode = 'P0001', message = 'attempt_not_available';
  end if;

  return exam_private.feedback_snapshot_json(v_attempt_id);
end;
$function$;

revoke all on function public.grading_overview(uuid, uuid) from public, anon, authenticated;
grant execute on function public.grading_overview(uuid, uuid) to service_role;
revoke all on function public.grading_feedback_preview(uuid, uuid) from public, anon, authenticated;
grant execute on function public.grading_feedback_preview(uuid, uuid) to service_role;
