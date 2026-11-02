-- Generado por scripts/parcial-2/generar_sql.py. No editar a mano.
begin;

insert into exam_private.exams (
  slug, course_id, title, instructions, opens_at, closes_at,
  duration_minutes, max_attempts, published, grading_enabled, essays_to_answer
) values (
  'parcial-2-2026', '12209', 'Segundo parcial · Unidades 3 y 4', 'Segundo parcial de Psicopatología I: clases 6 a 8. Tenés un solo intento y tiempo hasta las 10:30, contado por el servidor: si entrás más tarde, tenés menos tiempo. Primero hay cinco preguntas de opción múltiple, con una sola respuesta correcta cada una (0,5 puntos cada una). Al final hay tres consignas para desarrollar: elegí dos y dejá la otra en blanco (3,75 puntos cada una). Para aprobar no alcanza con la opción múltiple: se aprueba con una consigna muy bien desarrollada o con las dos desarrolladas de manera aceptable. Todo se guarda solo mientras escribís: si se corta internet o recargás, volvés a encontrar tus respuestas. Cuando termines, presioná «Entregar» y confirmá.',
  '2026-11-02 08:35:00-03', '2026-11-02 10:30:00-03', 120, 1, false, true, 2
);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'single_choice', '¿Qué hace el desplazamiento en la formación del síntoma obsesivo?', 0.5, 1);
insert into exam_private.question_options (question_id, label, is_correct, position)
select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos
from (values
  ('Separa la representación de su afecto y la deja sin conexiones con el resto de los pensamientos', false, 1),
  ('Reemplaza la moción hostil por la actitud opuesta, como la escrupulosidad o la compasión', false, 2),
  ('Hace como si lo ocurrido no hubiera sucedido, mediante un segundo acto que cancela al primero', false, 3),
  ('Traslada la intensidad afectiva de la representación conflictiva a otra en apariencia insignificante', true, 4)
) as o(label, is_correct, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'single_choice', '¿Cómo caracteriza Freud la ambivalencia en la neurosis obsesiva?', 0.5, 2);
insert into exam_private.question_options (question_id, label, is_correct, position)
select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos
from (values
  ('Como un amor y un odio dirigidos a dos personas distintas, el padre y la dama, que el yo no logra unificar', false, 1),
  ('Como un odio consciente hacia el padre que encubre un amor reprimido hacia él', false, 2),
  ('Como un amor intenso y un odio igual de intenso hacia la misma persona, en el que el amor mantiene reprimido al odio', true, 3),
  ('Como una oscilación entre el deseo y la prohibición que se resuelve en la duda, sin intervención del odio', false, 4)
) as o(label, is_correct, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'single_choice', 'En «Inhibición, síntoma y angustia», ¿cuál es el peligro frente al cual el yo de Juanito produce la angustia?', 0.5, 3);
insert into exam_private.question_options (question_id, label, is_correct, position)
select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos
from (values
  ('La pérdida del amor del objeto, la situación de peligro que Freud asocia con la histeria', false, 1),
  ('La castración, que en la fobia aparece desfigurada como ser mordido por el caballo', true, 2),
  ('La angustia frente al superyó, que en Juanito ya funciona como en el obsesivo', false, 3),
  ('Una acumulación de excitación libidinal insatisfecha que se descarga como angustia', false, 4)
) as o(label, is_correct, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'single_choice', 'En el análisis de Schreber, Freud deriva las formas de la paranoia de distintas maneras de contradecir la frase «yo (un hombre) lo amo (a un hombre)». ¿Cuál corresponde a la erotomanía?', 0.5, 4);
insert into exam_private.question_options (question_id, label, is_correct, position)
select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos
from (values
  ('«Yo no lo amo, lo odio», que por proyección se vuelve «él me odia»', false, 1),
  ('«No soy yo quien ama al hombre, es ella quien lo ama»', false, 2),
  ('«No lo amo a él, la amo a ella», que por proyección se vuelve «ella me ama»', true, 3),
  ('«No amo en absoluto, no amo a nadie», que desemboca en «sólo me amo a mí»', false, 4)
) as o(label, is_correct, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'single_choice', '¿Quién ocupa en el delirio de Schreber el lugar de primer perseguidor?', 0.5, 5);
insert into exam_private.question_options (question_id, label, is_correct, position)
select currval(pg_get_serial_sequence('exam_private.questions', 'id')), label, is_correct, pos
from (values
  ('Su padre, el médico y pedagogo Moritz Schreber', false, 1),
  ('Dios, que lo persigue desde el comienzo de la enfermedad', false, 2),
  ('Su hermano mayor, que había muerto antes de la primera enfermedad', false, 3),
  ('El profesor Flechsig, su médico, cuyo lugar ocupa después Dios', true, 4)
) as o(label, is_correct, pos);

insert into exam_private.rubrics (exam_id, title, version, is_active)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'Rúbrica del segundo parcial', 1, true);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'essay', 'Consigna 1 · De 1909 a 1926: el síntoma obsesivo. En el historial del Hombre de las Ratas (1909) y en «Inhibición, síntoma y angustia» (1926) Freud explica el síntoma obsesivo de dos maneras distintas. Explicá qué cambia en 1926: qué papel tienen la regresión, el superyó y la angustia en la formación del síntoma. Ilustrá con un episodio del Hombre de las Ratas.', 3.75, 6);
insert into exam_private.rubric_criteria (rubric_id, question_id, title, description, max_points, position)
select (select id from exam_private.rubrics where exam_id = (select id from exam_private.exams where slug = 'parcial-2-2026') and is_active), currval(pg_get_serial_sequence('exam_private.questions', 'id')), title, description, pts, pos
from (values
  ('La explicación de 1909', 'Ambivalencia amor-odio, represión del odio, desplazamiento a lo nimio, duda y compulsión.', 0.75, 1),
  ('La regresión', 'La regresión a la fase anal-sádica como primer paso de la defensa en 1926.', 0.75, 2),
  ('Superyó y angustia', 'El superyó especialmente severo y la angustia del yo ante el superyó (culpa) como motor de la defensa.', 1, 3),
  ('Síntoma y técnicas', 'El síntoma como formación de compromiso que satisface lo mismo que prohíbe; nombra al menos una técnica (aislamiento o anulación).', 0.75, 4),
  ('El caso', 'Ilustra con un episodio del caso correctamente articulado.', 0.5, 5)
) as c(title, description, pts, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'essay', 'Consigna 2 · Angustia y represión, de 1895 a 1926. En 1926 Freud invierte su tesis anterior sobre la relación entre angustia y represión. Explicá en qué consistía la primera teoría de la angustia, qué afirma la nueva y qué es la angustia señal. Aplicalo a la fobia de Juanito: ¿qué produce la angustia y qué produce la represión?', 3.75, 7);
insert into exam_private.rubric_criteria (rubric_id, question_id, title, description, max_points, position)
select (select id from exam_private.rubrics where exam_id = (select id from exam_private.exams where slug = 'parcial-2-2026') and is_active), currval(pg_get_serial_sequence('exam_private.questions', 'id')), title, description, pts, pos
from (values
  ('La primera teoría', 'La angustia como libido reprimida que se transforma.', 0.75, 1),
  ('La inversión', 'La angustia no surge de la represión sino que la produce.', 0.75, 2),
  ('La angustia señal', 'El yo anticipa una situación de peligro y pone en marcha la defensa.', 0.75, 3),
  ('Juanito', 'La angustia de castración frente al padre, la represión de la moción hostil y el desplazamiento al caballo.', 1, 4),
  ('Angustia, síntoma, inhibición', 'Distingue en el caso la angustia del síntoma (miedo al caballo) o de la inhibición (no salir a la calle).', 0.5, 5)
) as c(title, description, pts, pos);

insert into exam_private.questions (exam_id, kind, prompt, points, position)
values ((select id from exam_private.exams where slug = 'parcial-2-2026'), 'essay', 'Consigna 3 · Dos salidas frente a un mismo peligro. Juanito y el Hombre de las Ratas responden de maneras distintas a un mismo peligro. Según «Inhibición, síntoma y angustia», ¿cuál es ese peligro y qué hace con él cada neurosis? Compará la solución fóbica con la obsesiva: dónde se ubica el peligro, qué mecanismos intervienen y qué lugar tiene la angustia en cada una.', 3.75, 8);
insert into exam_private.rubric_criteria (rubric_id, question_id, title, description, max_points, position)
select (select id from exam_private.rubrics where exam_id = (select id from exam_private.exams where slug = 'parcial-2-2026') and is_active), currval(pg_get_serial_sequence('exam_private.questions', 'id')), title, description, pts, pos
from (values
  ('El peligro común', 'La castración, y la angustia señal como punto de partida de la defensa en las dos.', 0.75, 1),
  ('La salida fóbica', 'Desplazamiento a un objeto externo (el caballo) y evitación; la angustia queda ligada a una zona que se puede esquivar.', 1, 2),
  ('La salida obsesiva', 'Regresión anal-sádica, superyó severo y angustia transformada en culpa; el conflicto se libra en el pensamiento.', 1, 3),
  ('Mecanismos', 'Al menos un mecanismo obsesivo (aislamiento, anulación o formación reactiva) en contraste con el desplazamiento fóbico.', 0.5, 4),
  ('Comparación', 'La respuesta compara, no sólo describe cada caso por separado.', 0.5, 5)
) as c(title, description, pts, pos);

select public_id from exam_private.exams where slug = 'parcial-2-2026';

commit;
