-- Contenido exclusivamente demostrativo para el entorno local.
-- Las preguntas definitivas deben importarse y revisarse antes de publicar.
do $$
declare
  v_exam_id bigint;
  v_question_id bigint;
begin
  insert into exam_private.exams (
    public_id, slug, course_id, title, instructions, opens_at, closes_at,
    duration_minutes, published, identity_linking_enabled
  ) values (
    '11111111-1111-4111-8111-111111111111',
    'parcial-demo',
    '12209',
    'Primer parcial · demostración',
    'Material de prueba. Respondé todas las consignas y entregá antes de que finalice el tiempo.',
    '2026-01-01 00:00:00-03',
    '2027-12-31 23:59:59-03',
    90,
    true,
    true
  )
  on conflict (slug) do update
  set title = excluded.title,
      instructions = excluded.instructions,
      opens_at = excluded.opens_at,
      closes_at = excluded.closes_at,
      duration_minutes = excluded.duration_minutes,
      published = excluded.published,
      identity_linking_enabled = excluded.identity_linking_enabled
  returning id into v_exam_id;

  insert into exam_private.course_roster (
    course_id, dni, first_name, last_name
  ) values (
    '12209', 30111222, 'Estudiante', 'de prueba'
  )
  on conflict (course_id, dni) do update
  set first_name = excluded.first_name,
      last_name = excluded.last_name,
      active = true,
      updated_at = now();

  if not exists (
    select 1 from exam_private.questions
    where exam_id = v_exam_id and position = 1
  ) then
    insert into exam_private.questions (exam_id, kind, prompt, points, position)
    values (
      v_exam_id,
      'single_choice',
      'Pregunta demostrativa: ¿qué criterio debe determinar el tiempo restante de un intento?',
      1,
      1
    ) returning id into v_question_id;

    insert into exam_private.question_options (question_id, label, is_correct, position)
    values
      (v_question_id, 'El reloj del dispositivo del estudiante', false, 1),
      (v_question_id, 'La hora y el vencimiento registrados por el servidor', true, 2),
      (v_question_id, 'La duración de la videollamada', false, 3),
      (v_question_id, 'La última vez que se recargó la página', false, 4);
  end if;

  if not exists (
    select 1 from exam_private.questions
    where exam_id = v_exam_id and position = 2
  ) then
    insert into exam_private.questions (exam_id, kind, prompt, points, position)
    values (
      v_exam_id,
      'single_choice',
      'Pregunta demostrativa: ¿qué acción confirma definitivamente la entrega?',
      1,
      2
    ) returning id into v_question_id;

    insert into exam_private.question_options (question_id, label, is_correct, position)
    values
      (v_question_id, 'Cambiar de pregunta', false, 1),
      (v_question_id, 'Cerrar la pestaña', false, 2),
      (v_question_id, 'Presionar «Entregar parcial» y confirmar', true, 3),
      (v_question_id, 'Esperar el autoguardado', false, 4);
  end if;

  if not exists (
    select 1 from exam_private.questions
    where exam_id = v_exam_id and position = 3
  ) then
    insert into exam_private.questions (exam_id, kind, prompt, points, position)
    values (
      v_exam_id,
      'essay',
      'Consigna demostrativa: explicá brevemente cómo comprobarías que tu respuesta quedó guardada.',
      3,
      3
    );
  end if;
end;
$$;
