begin;
select plan(76);

insert into auth.users (id, email)
values
  ('10000000-0000-4000-8000-000000000001', 'coordinator.local@example.test'),
  ('10000000-0000-4000-8000-000000000002', 'grader.local@example.test');

insert into exam_private.grader_profiles (user_id, display_name, role)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Coordinador local',
    'coordinator'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Correctora local',
    'grader'
  );

insert into exam_private.exams (
  public_id, slug, course_id, title, opens_at, closes_at,
  duration_minutes, published
) values (
  '20000000-0000-4000-8000-000000000001',
  'grading-test',
  'grading-test-course',
  'Parcial para probar correccion',
  clock_timestamp() - interval '1 hour',
  clock_timestamp() + interval '1 hour',
  60,
  true
);

insert into exam_private.questions (
  public_id, exam_id, kind, prompt, points, position
) values
  (
    '30000000-0000-4000-8000-000000000001',
    (select id from exam_private.exams where slug = 'grading-test'),
    'single_choice', 'Primera pregunta objetiva de prueba', 2, 1
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    (select id from exam_private.exams where slug = 'grading-test'),
    'single_choice', 'Segunda pregunta objetiva de prueba', 3, 2
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    (select id from exam_private.exams where slug = 'grading-test'),
    'essay', 'Consigna escrita para probar la rubrica', 5, 3
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    (select id from exam_private.exams where slug = 'grading-test'),
    'essay', 'Segunda consigna escrita para probar la correccion', 5, 4
  );

insert into exam_private.question_options (
  public_id, question_id, label, is_correct, position
) values
  (
    '40000000-0000-4000-8000-000000000001',
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000001'),
    'Correcta uno', true, 1
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000001'),
    'Incorrecta uno', false, 2
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000002'),
    'Correcta dos', true, 1
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000002'),
    'Incorrecta dos', false, 2
  );

insert into exam_private.course_roster (
  course_id, dni, first_name, last_name, moodle_user_id
) values (
  'grading-test-course', 30999888, 'Estudiante', 'Correccion', 900001
);

insert into exam_private.attempts (
  public_id, exam_id, roster_id, moodle_user_id, display_name,
  deadline_at, attempt_token_hash
) values (
  '50000000-0000-4000-8000-000000000001',
  (select id from exam_private.exams where slug = 'grading-test'),
  (select id from exam_private.course_roster where course_id = 'grading-test-course' and dni = 30999888),
  '900001',
  'Estudiante Correccion',
  clock_timestamp() + interval '45 minutes',
  repeat('a', 64)
);

insert into exam_private.attempt_items (
  public_id, attempt_id, question_id, position
) values
  (
    '60000000-0000-4000-8000-000000000001',
    (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000001'),
    1
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000002'),
    2
  ),
  (
    '60000000-0000-4000-8000-000000000003',
    (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000003'),
    3
  ),
  (
    '60000000-0000-4000-8000-000000000004',
    (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000004'),
    4
  );

insert into exam_private.responses (
  attempt_item_id, selected_option_id, essay_text, client_revision
) values
  (
    (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000001'),
    (select id from exam_private.question_options where public_id = '40000000-0000-4000-8000-000000000001'),
    null, 1
  ),
  (
    (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000002'),
    (select id from exam_private.question_options where public_id = '40000000-0000-4000-8000-000000000004'),
    null, 1
  ),
  (
    (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000003'),
    null, 'Una respuesta escrita de prueba para corregir.', 1
  ),
  (
    (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000004'),
    null, 'Otra respuesta escrita que relaciona teoria y caso.', 1
  );

update exam_private.attempts
set status = 'submitted', submitted_at = clock_timestamp()
where public_id = '50000000-0000-4000-8000-000000000001';

select diag(
  'Claves foraneas sin indice completo: ' || coalesce((
    select string_agg(c.conrelid::regclass::text || '.' || a.attname, ', ' order by 1)
    from pg_constraint c
    cross join unnest(c.conkey) as key(attnum)
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = key.attnum
    where c.contype = 'f'
      and c.connamespace = 'exam_private'::regnamespace
      and not exists (
        select 1
        from pg_index i
        where i.indrelid = c.conrelid
          and i.indpred is null
          and key.attnum = any(i.indkey)
      )
  ), 'ninguna')
);

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'exam_private'
      and c.relname in (
        'grader_profiles', 'rubrics', 'rubric_criteria', 'grading_assignments',
        'essay_grades', 'essay_grade_criteria', 'essay_annotations',
        'grading_audit', 'feedback_releases', 'student_feedback_sessions'
      )
      and (not c.relrowsecurity or not c.relforcerowsecurity)
  ),
  'todas las tablas nuevas tienen RLS forzada'
);

select is(
  (
    select count(*)::integer
    from (values
      ('grader_profiles'), ('rubrics'), ('rubric_criteria'), ('grading_assignments'),
      ('essay_grades'), ('essay_grade_criteria'), ('essay_annotations'),
      ('grading_audit'), ('feedback_releases'), ('student_feedback_sessions')
    ) tables(name)
    where has_table_privilege('anon', 'exam_private.' || name, 'select,insert,update,delete')
  ),
  0,
  'anon no tiene privilegios sobre tablas de correccion'
);

select is(
  (
    select count(*)::integer
    from (values
      ('grader_profiles'), ('rubrics'), ('rubric_criteria'), ('grading_assignments'),
      ('essay_grades'), ('essay_grade_criteria'), ('essay_annotations'),
      ('grading_audit'), ('feedback_releases'), ('student_feedback_sessions')
    ) tables(name)
    where has_table_privilege('authenticated', 'exam_private.' || name, 'select,insert,update,delete')
  ),
  0,
  'authenticated no accede directamente a tablas privadas'
);

select ok(
  not exists (
    select 1
    from pg_constraint c
    cross join unnest(c.conkey) as key(attnum)
    where c.contype = 'f'
      and c.connamespace = 'exam_private'::regnamespace
      and not exists (
        select 1
        from pg_index i
        where i.indrelid = c.conrelid
          and i.indpred is null
          and key.attnum = any(i.indkey)
      )
  ),
  'todas las claves foraneas privadas cuentan con indice completo'
);

select is(
  (select objective_score from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  2.00::numeric,
  'la entrega calcula automaticamente el puntaje objetivo'
);

select is(
  (select objective_max_score from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  5.00::numeric,
  'la entrega conserva el maximo objetivo'
);

select is(
  (select manual_max_score from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  10.00::numeric,
  'la entrega calcula el maximo de desarrollo'
);

select is(
  (select grading_status from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  'unassigned',
  'un intento con desarrollo ingresa a la cola sin asignar'
);

select is(
  (select grading_version from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  1::bigint,
  'la entrega inicia el control de version de correccion'
);

select is(
  (
    select count(*)::integer
    from exam_private.grading_audit ga
    join exam_private.attempts a on a.id = ga.attempt_id
    where a.public_id = '50000000-0000-4000-8000-000000000001'
      and ga.event_type = 'objective_graded'
  ),
  1,
  'la correccion objetiva queda registrada en auditoria'
);

select throws_ok(
  $$select exam_private.assert_active_grader('10000000-0000-4000-8000-000000000099')$$,
  '42501',
  'grader_not_authorized',
  'un usuario no autorizado no puede actuar como corrector'
);

select is(
  (select (exam_private.assert_active_grader('10000000-0000-4000-8000-000000000001')).role),
  'coordinator',
  'el perfil autorizado conserva su rol'
);

insert into exam_private.rubrics (
  public_id, exam_id, title, version, is_active, created_by
) values (
  '70000000-0000-4000-8000-000000000001',
  (select id from exam_private.exams where slug = 'grading-test'),
  'Rubrica de prueba', 1, true,
  '10000000-0000-4000-8000-000000000001'
);

select throws_ok(
  $$insert into exam_private.rubric_criteria (
      rubric_id, question_id, title, max_points, position
    ) values (
      (select id from exam_private.rubrics where public_id = '70000000-0000-4000-8000-000000000001'),
      (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000001'),
      'Criterio invalido', 2, 1
    )$$,
  '23514',
  'rubric_criterion_requires_essay',
  'una pregunta objetiva no admite rubrica manual'
);

insert into exam_private.rubric_criteria (
  public_id, rubric_id, question_id, title, max_points, position
) values
  (
    '71000000-0000-4000-8000-000000000001',
    (select id from exam_private.rubrics where public_id = '70000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000003'),
    'Articulacion conceptual', 5, 1
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    (select id from exam_private.rubrics where public_id = '70000000-0000-4000-8000-000000000001'),
    (select id from exam_private.questions where public_id = '30000000-0000-4000-8000-000000000004'),
    'Aplicacion al caso', 5, 1
  );

select is(
  (select count(*)::integer from exam_private.rubric_criteria where public_id = '71000000-0000-4000-8000-000000000001'),
  1,
  'una consigna escrita admite criterios'
);

select throws_ok(
  $$insert into exam_private.essay_grades (
      attempt_id, attempt_item_id, grader_user_id, score
    ) values (
      (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
      (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000001'),
      '10000000-0000-4000-8000-000000000001', 1
    )$$,
  '23514',
  'invalid_essay_grade_item',
  'no se puede corregir manualmente una pregunta objetiva'
);

insert into exam_private.essay_grades (
  public_id, attempt_id, attempt_item_id, grader_user_id, score,
  general_feedback, internal_note, revision
) values (
  '80000000-0000-4000-8000-000000000001',
  (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  (select id from exam_private.attempt_items where public_id = '60000000-0000-4000-8000-000000000003'),
  '10000000-0000-4000-8000-000000000001',
  4.5, 'Buen desarrollo.', 'Revisar cita.', 1
);

select is(
  (select score from exam_private.essay_grades where public_id = '80000000-0000-4000-8000-000000000001'),
  4.50::numeric,
  'la correccion escrita respeta el maximo de la pregunta'
);

select throws_ok(
  $$insert into exam_private.essay_grade_criteria (
      essay_grade_id, criterion_id, score
    ) values (
      (select id from exam_private.essay_grades where public_id = '80000000-0000-4000-8000-000000000001'),
      (select id from exam_private.rubric_criteria where public_id = '71000000-0000-4000-8000-000000000001'),
      5.5
    )$$,
  '23514',
  'criterion_score_exceeds_maximum',
  'un criterio no puede superar su puntaje maximo'
);

insert into exam_private.essay_grade_criteria (
  essay_grade_id, criterion_id, score, comment
) values (
  (select id from exam_private.essay_grades where public_id = '80000000-0000-4000-8000-000000000001'),
  (select id from exam_private.rubric_criteria where public_id = '71000000-0000-4000-8000-000000000001'),
  4.5, 'Relaciona los conceptos centrales.'
);

select is(
  (select score from exam_private.essay_grade_criteria limit 1),
  4.50::numeric,
  'el puntaje valido del criterio queda guardado'
);

select throws_ok(
  $$insert into exam_private.essay_annotations (
      essay_grade_id, grader_user_id, start_offset, end_offset,
      selected_text, comment
    ) values (
      (select id from exam_private.essay_grades where public_id = '80000000-0000-4000-8000-000000000001'),
      '10000000-0000-4000-8000-000000000001',
      8, 3, 'texto', 'Comentario'
    )$$,
  '23514',
  null,
  'una anotacion exige un rango de texto valido'
);

insert into exam_private.feedback_releases (
  attempt_id, version, published_by, snapshot
) values (
  (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  1,
  '10000000-0000-4000-8000-000000000001',
  '{"totalScore": 6.5}'::jsonb
);

select throws_ok(
  $$update exam_private.feedback_releases set snapshot = '{}'::jsonb$$,
  '55000',
  'immutable_record',
  'una devolucion publicada es inmutable'
);

insert into exam_private.grading_audit (
  attempt_id, actor_user_id, event_type, details
) values (
  (select id from exam_private.attempts where public_id = '50000000-0000-4000-8000-000000000001'),
  '10000000-0000-4000-8000-000000000001',
  'draft_saved',
  '{"version": 1}'::jsonb
);

select throws_ok(
  $$delete from exam_private.grading_audit$$,
  '55000',
  'immutable_record',
  'la auditoria no se puede borrar'
);

select throws_ok(
  $$insert into exam_private.student_feedback_sessions (
      token_hash, roster_id, expires_at
    ) values (
      'token-invalido',
      (select id from exam_private.course_roster where course_id = 'grading-test-course' and dni = 30999888),
      clock_timestamp() + interval '15 minutes'
    )$$,
  '23514',
  null,
  'los tokens de devolucion exigen un hash seguro'
);

select throws_ok(
  $$update exam_private.attempts
    set grading_status = 'published', feedback_published_at = null
    where public_id = '50000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'publicar exige registrar la fecha de publicacion'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.grading_queue(uuid,uuid,text,integer)',
    'execute'
  ),
  'authenticated no puede ejecutar la cola docente'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.grading_queue(uuid,uuid,text,integer)',
    'execute'
  ),
  'solo el servidor puede ejecutar el flujo docente'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.grading_me(uuid)',
    'execute'
  ),
  'authenticated no puede consultar perfiles docentes directamente'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.grading_exams(uuid)',
    'execute'
  ),
  'authenticated no puede listar parciales docentes directamente'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.feedback_launch_by_identity(text,bigint,bigint,text,text,text)',
    'execute'
  ),
  'authenticated no puede iniciar devoluciones sin pasar por la API'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.feedback_get(text)',
    'execute'
  ),
  'authenticated no puede leer devoluciones directamente'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.feedback_logout(text)',
    'execute'
  ),
  'authenticated no puede alterar sesiones de devolucion directamente'
);

set local role service_role;

select is(
  public.grading_me('10000000-0000-4000-8000-000000000001')->>'role',
  'coordinator',
  'el inicio del panel reconoce el rol docente'
);

select is(
  jsonb_array_length(
    public.grading_exams('10000000-0000-4000-8000-000000000001')
  ),
  1,
  'el panel descubre los parciales disponibles'
);

select is(
  (
    public.grading_exams('10000000-0000-4000-8000-000000000001')
      ->0->>'submittedCount'
  )::integer,
  1,
  'el listado de parciales informa las entregas recibidas'
);

select throws_ok(
  $$select public.grading_queue(
      '10000000-0000-4000-8000-000000000099',
      '20000000-0000-4000-8000-000000000001'
    )$$,
  '42501',
  'grader_not_authorized',
  'la cola rechaza un actor no autorizado'
);

select is(
  (
    public.grading_queue(
      '10000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000001'
    )->'counts'->>'unassigned'
  )::integer,
  1,
  'la cola cuenta los intentos sin asignar'
);

select is(
  jsonb_array_length(
    public.grading_queue(
      '10000000-0000-4000-8000-000000000002',
      '20000000-0000-4000-8000-000000000001'
    )->'attempts'
  ),
  1,
  'la cola lista el intento entregado'
);

select is(
  jsonb_array_length(
    public.grading_get_attempt(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001'
    )->'essays'
  ),
  2,
  'el detalle docente incluye los dos desarrollos y sus rubricas'
);

select is(
  public.grading_claim_attempt(
    '10000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000001'
  )->'assignedTo'->>'userId',
  '10000000-0000-4000-8000-000000000002',
  'una correctora puede tomar un intento libre'
);

select throws_ok(
  $$select public.grading_claim_attempt(
      '10000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001'
    )$$,
  'P0001',
  'attempt_already_claimed',
  'otra persona no puede tomar el mismo intento'
);

select is(
  public.grading_release_attempt(
    '10000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000001',
    'Cambio de correctora'
  )->>'gradingStatus',
  'unassigned',
  'la dueña puede liberar su asignacion'
);

select is(
  public.grading_claim_attempt(
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001'
  )->'assignedTo'->>'userId',
  '10000000-0000-4000-8000-000000000001',
  'coordinacion puede tomar el intento liberado'
);

select throws_ok(
  $$select public.grading_release_attempt(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001',
      'Intento ajeno'
    )$$,
  '42501',
  'assignment_owned_by_other_grader',
  'una correctora no puede liberar la asignacion ajena'
);

select is(
  public.grading_release_attempt(
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    'Reorganizacion de la cola'
  )->>'gradingStatus',
  'unassigned',
  'coordinacion puede liberar una asignacion'
);

select is(
  (
    select count(*)::integer
    from exam_private.grading_audit
    where event_type in ('claimed', 'released')
  ),
  4,
  'tomar y liberar intentos deja una auditoria completa'
);

select is(
  (
    select grading_version
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  5::bigint,
  'cada cambio de asignacion incrementa la version'
);

select is(
  (
    public.grading_claim_attempt(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001'
    )->>'gradingVersion'
  )::bigint,
  6::bigint,
  'la correctora vuelve a tomar el intento para editarlo'
);

select throws_ok(
  $$select public.grading_save_draft(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001',
      99,
      jsonb_build_array(jsonb_build_object(
        'itemId', '60000000-0000-4000-8000-000000000003',
        'score', 4
      ))
    )$$,
  '40001',
  'grading_version_conflict',
  'un borrador viejo no puede sobrescribir una version nueva'
);

select throws_ok(
  $$select public.grading_save_draft(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001',
      6,
      jsonb_build_array(jsonb_build_object(
        'itemId', '60000000-0000-4000-8000-000000000003',
        'score', 4,
        'annotations', jsonb_build_array(jsonb_build_object(
          'startOffset', 4,
          'endOffset', 13,
          'selectedText', 'otro texto',
          'comment', 'No coincide'
        ))
      ))
    )$$,
  '22023',
  'annotation_text_mismatch',
  'una anotacion no puede apuntar a otro fragmento'
);

select is(
  (
    public.grading_save_draft(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001',
      6,
      jsonb_build_array(
        jsonb_build_object(
          'itemId', '60000000-0000-4000-8000-000000000003',
          'score', 4,
          'generalFeedback', 'Relaciona correctamente los conceptos.',
          'internalNote', 'Nota privada para coordinacion.',
          'criteria', jsonb_build_array(jsonb_build_object(
            'criterionId', '71000000-0000-4000-8000-000000000001',
            'score', 4,
            'comment', 'Articulacion clara.'
          )),
          'annotations', jsonb_build_array(jsonb_build_object(
            'startOffset', 4,
            'endOffset', 13,
            'selectedText', 'respuesta',
            'comment', 'Buen punto de partida.',
            'visibleToStudent', true
          ))
        ),
        jsonb_build_object(
          'itemId', '60000000-0000-4000-8000-000000000004',
          'score', 3,
          'generalFeedback', 'La aplicacion al caso es pertinente.',
          'internalNote', '',
          'criteria', jsonb_build_array(jsonb_build_object(
            'criterionId', '71000000-0000-4000-8000-000000000002',
            'score', 3,
            'comment', 'Puede profundizar la justificacion.'
          )),
          'annotations', '[]'::jsonb
        )
      )
    )->'essays'->0->'grade'->>'score'
  )::numeric,
  4.00::numeric,
  'el borrador guarda el puntaje escrito'
);

select is(
  jsonb_array_length(
    public.grading_get_attempt(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001'
    )->'essays'->0->'annotations'
  ),
  1,
  'el borrador conserva las anotaciones sobre el texto'
);

select is(
  (
    select internal_note
    from exam_private.essay_grades
    where public_id = '80000000-0000-4000-8000-000000000001'
  ),
  'Nota privada para coordinacion.',
  'la nota interna queda disponible para el equipo docente'
);

select is(
  (
    select grading_version
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  7::bigint,
  'guardar el borrador incrementa la version una vez'
);

select is(
  public.grading_mark_reviewed(
    '10000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000001',
    7
  )->>'gradingStatus',
  'reviewed',
  'la correctora puede cerrar una rubrica completa'
);

select is(
  (
    select manual_score
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  7.00::numeric,
  'cerrar la correccion calcula el puntaje manual'
);

select is(
  (
    select total_score
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  9.00::numeric,
  'cerrar la correccion suma la parte objetiva y manual'
);

select is(
  (
    select count(*)::integer
    from exam_private.grading_assignments ga
    join exam_private.attempts a on a.id = ga.attempt_id
    where a.public_id = '50000000-0000-4000-8000-000000000001'
      and ga.completed_at is not null
  ),
  1,
  'la asignacion queda completada al cerrar la correccion'
);

select throws_ok(
  $$select public.grading_mark_ready(
      '10000000-0000-4000-8000-000000000002',
      '50000000-0000-4000-8000-000000000001',
      8
    )$$,
  '42501',
  'coordinator_required',
  'solo coordinacion puede preparar la publicacion'
);

select is(
  public.grading_mark_ready(
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    8
  )->>'gradingStatus',
  'ready_to_publish',
  'coordinacion deja la devolucion lista para publicar'
);

select throws_ok(
  $$select public.grading_publish(
      '10000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      8
    )$$,
  '40001',
  'grading_version_conflict',
  'publicar tambien exige la ultima version'
);

select is(
  public.grading_publish(
    '10000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    9
  )->>'gradingStatus',
  'published',
  'coordinacion publica una devolucion lista'
);

select ok(
  position('Nota privada para coordinacion.' in (
    select snapshot::text
    from exam_private.feedback_releases fr
    join exam_private.attempts a on a.id = fr.attempt_id
    where a.public_id = '50000000-0000-4000-8000-000000000001'
    order by fr.version desc
    limit 1
  )) = 0,
  'la devolucion publicada excluye las notas internas'
);

select ok(
  position('Buen punto de partida.' in (
    select snapshot::text
    from exam_private.feedback_releases fr
    join exam_private.attempts a on a.id = fr.attempt_id
    where a.public_id = '50000000-0000-4000-8000-000000000001'
    order by fr.version desc
    limit 1
  )) > 0,
  'la devolucion publicada incluye la anotacion visible'
);

select is(
  (
    select count(*)::integer
    from exam_private.grading_audit
    where event_type = 'published'
  ),
  1,
  'la publicacion queda auditada'
);

select is(
  (
    select grading_version
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  10::bigint,
  'la publicacion deja una nueva version final'
);

select is(
  (
    select feedback_published_at is not null
    from exam_private.attempts
    where public_id = '50000000-0000-4000-8000-000000000001'
  ),
  true,
  'el intento conserva la fecha de publicacion'
);

select throws_ok(
  $$select public.feedback_launch_by_identity(
      'grading-test-course', 900001, 30999888,
      'Otra', 'Persona', repeat('c', 64)
    )$$,
  'P0001',
  'identity_mismatch',
  'la devolucion rechaza un nombre ajeno al padron'
);

select throws_ok(
  $$select public.feedback_launch_by_identity(
      'grading-test-course', 900099, 30999888,
      'Estudiante', 'Correccion', repeat('c', 64)
    )$$,
  'P0001',
  'moodle_account_conflict',
  'la devolucion rechaza otra cuenta Moodle'
);

select is(
  public.feedback_launch_by_identity(
    'grading-test-course', 900001, 30999888,
    'Estudiante', 'Correccion', repeat('c', 64)
  )->>'studentName',
  'Estudiante Correccion',
  'la sesion reconoce al estudiante vinculado'
);

select is(
  (
    public.feedback_launch_by_identity(
      'grading-test-course', 900001, 30999888,
      'Estudiante', 'Correccion', repeat('d', 64)
    )->>'publishedCount'
  )::integer,
  1,
  'el inicio informa cuantas devoluciones hay publicadas'
);

select is(
  (
    select count(*)::integer
    from exam_private.student_feedback_sessions
    where roster_id = (
      select id from exam_private.course_roster
      where course_id = 'grading-test-course' and dni = 30999888
    )
      and revoked_at is null
  ),
  1,
  'iniciar una sesion revoca la anterior'
);

select throws_ok(
  $$select public.feedback_get(repeat('e', 64))$$,
  'P0001',
  'invalid_feedback_session',
  'un token desconocido no permite leer devoluciones'
);

select is(
  public.feedback_get(repeat('d', 64))->>'studentName',
  'Estudiante Correccion',
  'la sesion devuelve solo la identidad vinculada'
);

select is(
  jsonb_array_length(public.feedback_get(repeat('d', 64))->'releases'),
  1,
  'el estudiante recibe una devolucion por intento'
);

select is(
  (
    public.feedback_get(repeat('d', 64))
      ->'releases'->0->>'releaseVersion'
  )::integer,
  2,
  'la consulta devuelve solamente la version publicada mas reciente'
);

select is(
  (
    select last_used_at is not null
    from exam_private.student_feedback_sessions
    where token_hash = repeat('d', 64)
  ),
  true,
  'el uso de la devolucion queda registrado'
);

select is(
  public.feedback_logout(repeat('d', 64))->>'revoked',
  'true',
  'el estudiante puede cerrar su sesion de devolucion'
);

select throws_ok(
  $$select public.feedback_get(repeat('d', 64))$$,
  'P0001',
  'invalid_feedback_session',
  'una sesion cerrada no puede volver a usarse'
);

reset role;

select * from finish();
rollback;
