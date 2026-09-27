-- Reparte la respuesta correcta entre las letras, estudiante por estudiante.
--
-- Hasta acá cada pregunta mezclaba sus opciones por separado. En total la
-- correcta quedaba pareja entre A, B, C y D, pero a cada estudiante le podían
-- tocar muchas en la misma letra: al simular el primer parcial para los 61 del
-- padrón, a 15 les tocaban 5 correctas en una sola letra. Eso siembra dudas
-- durante el examen («¿tantas C?») aunque no sea un error.
--
-- Ahora, dentro de cada intento, las preguntas de opción múltiple se ordenan al
-- azar y la correcta de cada una va a la letra que le toca en esa ronda: con
-- diez preguntas y cuatro opciones, ninguna letra tiene más de tres correctas.
-- Qué pregunta cae en qué letra depende del intento, así que no hay un patrón
-- que se pueda deducir. Las incorrectas se mezclan en los lugares restantes.
-- Todo es determinístico por intento: recargar no cambia el orden.

create or replace function exam_private.option_order(
  p_attempt_id bigint,
  p_attempt_item_id bigint
)
returns table (option_id bigint, ord int)
language sql
stable
security definer
set search_path = ''
as $$
  with item as (
    select ai.question_id
    from exam_private.attempt_items ai
    where ai.id = p_attempt_item_id
  ),
  opts as (
    select qo.id, qo.is_correct, count(*) over () as k
    from exam_private.question_options qo
    join item on qo.question_id = item.question_id
  ),
  -- Orden al azar, propio de este intento, de sus preguntas de opción múltiple.
  ronda as (
    select ai.id,
           row_number() over (order by md5(ai.id::text || ':letra:' || p_attempt_id::text)) as r
    from exam_private.attempt_items ai
    join exam_private.questions q on q.id = ai.question_id and q.kind = 'single_choice'
    where ai.attempt_id = p_attempt_id
  ),
  destino as (
    select (
      (ronda.r - 1
        + ((('x' || substr(md5(p_attempt_id::text || ':desplazamiento'), 1, 8))::bit(32)::int) & 3)
      ) % (select max(k) from opts)
    ) + 1 as slot
    from ronda
    where ronda.id = p_attempt_item_id
  ),
  incorrectas as (
    select o.id,
           row_number() over (order by md5(o.id::text || ':' || p_attempt_id::text)) as w
    from opts o
    where not o.is_correct
  )
  select o.id, coalesce((select slot from destino), 1)::int
  from opts o
  where o.is_correct
  union all
  select i.id,
         (i.w + case when i.w >= coalesce((select slot from destino), 1) then 1 else 0 end)::int
  from incorrectas i;
$$;

revoke all on function exam_private.option_order(bigint, bigint)
  from public, anon, authenticated;

create or replace function exam_private.state_json(p_attempt_id bigint)
returns jsonb
language sql
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'serverNow', clock_timestamp(),
    'exam', jsonb_build_object(
      'id', e.public_id,
      'title', e.title,
      'instructions', e.instructions,
      'durationMinutes', e.duration_minutes
    ),
    'attempt', jsonb_build_object(
      'id', a.public_id,
      'studentName', a.display_name,
      'status', a.status,
      'startedAt', a.started_at,
      'deadlineAt', a.deadline_at,
      'submittedAt', a.submitted_at,
      'lastSavedAt', a.last_saved_at,
      'serverVersion', a.server_version
    ),
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ai.public_id,
          'position', ai.position,
          'kind', q.kind,
          'prompt', q.prompt,
          'points', q.points,
          'options', case when q.kind = 'single_choice' then (
            select coalesce(jsonb_agg(
              jsonb_build_object('id', qo.public_id, 'label', qo.label)
              order by oo.ord, qo.id
            ), '[]'::jsonb)
            from exam_private.option_order(a.id, ai.id) oo
            join exam_private.question_options qo on qo.id = oo.option_id
          ) else '[]'::jsonb end,
          'response', case when r.id is null then null else jsonb_build_object(
            'selectedOptionId', so.public_id,
            'essayText', r.essay_text,
            'clientRevision', r.client_revision,
            'savedAt', r.saved_at
          ) end
        ) order by ai.position
      )
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id
      left join exam_private.responses r on r.attempt_item_id = ai.id
      left join exam_private.question_options so on so.id = r.selected_option_id
      where ai.attempt_id = a.id
    ), '[]'::jsonb)
  )
  from exam_private.attempts a
  join exam_private.exams e on e.id = a.exam_id
  where a.id = p_attempt_id;
$function$;
