-- Las consignas a desarrollar van siempre al final del intento.
--
-- Hasta acá todas las preguntas se mezclaban juntas, así que la escrita caía en
-- cualquier posición: en el simulacro de la clase 5 apareció primera para unos y
-- quinta u onceava para otros, mientras las instrucciones decían «la última es
-- para desarrollar». Ahora la opción múltiple se sigue mezclando por intento y
-- las escritas quedan detrás, en el orden en que las cargó el equipo docente.
-- Sólo afecta a los intentos que se abran después de aplicar esta migración.

create or replace function exam_private.open_attempt(
  p_exam_id bigint,
  p_roster_id bigint,
  p_moodle_user_id bigint,
  p_attempt_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam exam_private.exams%rowtype;
  v_roster exam_private.course_roster%rowtype;
  v_attempt exam_private.attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_deadline timestamptz;
  v_event text := 'resumed';
begin
  select * into v_exam from exam_private.exams where id = p_exam_id;
  select * into v_roster from exam_private.course_roster where id = p_roster_id;

  select * into v_attempt
  from exam_private.attempts
  where exam_id = v_exam.id
    and roster_id = v_roster.id
    and attempt_number = 1
  for update;

  if not found then
    v_deadline := least(
      v_now + make_interval(mins => v_exam.duration_minutes),
      v_exam.closes_at
    );

    insert into exam_private.attempts (
      exam_id, roster_id, moodle_user_id, display_name,
      deadline_at, attempt_token_hash
    ) values (
      v_exam.id, v_roster.id, p_moodle_user_id::text, v_roster.display_name,
      v_deadline, p_attempt_token_hash
    ) returning * into v_attempt;

    insert into exam_private.attempt_items (attempt_id, question_id, position)
    select v_attempt.id, picked.id,
           (row_number() over (order by picked.group_key, picked.sort_key))::smallint
    from (
      select q.id,
             case when q.kind = 'essay' then 1 else 0 end as group_key,
             case when q.kind = 'essay'
                  then lpad(q.position::text, 6, '0')
                  else md5(q.id::text || ':' || v_attempt.id::text)
             end as sort_key
      from exam_private.questions q
      where q.exam_id = v_exam.id and q.active = true
      order by group_key, sort_key
      limit coalesce(v_exam.selection_count, 32767)
    ) picked;

    if not exists (
      select 1 from exam_private.attempt_items where attempt_id = v_attempt.id
    ) then
      raise exception using errcode = 'P0001', message = 'exam_has_no_questions';
    end if;

    v_event := 'launched';
  else
    update exam_private.attempts
    set attempt_token_hash = p_attempt_token_hash,
        moodle_user_id = p_moodle_user_id::text,
        display_name = v_roster.display_name
    where id = v_attempt.id
    returning * into v_attempt;
  end if;

  if v_attempt.status = 'in_progress' and v_now >= v_attempt.deadline_at then
    update exam_private.attempts
    set status = 'timed_out', submitted_at = deadline_at
    where id = v_attempt.id
    returning * into v_attempt;
    v_event := 'timed_out';
  end if;

  insert into exam_private.events (attempt_id, event_type)
  values (v_attempt.id, v_event);

  return exam_private.state_json(v_attempt.id);
end;
$$;

revoke all on function exam_private.open_attempt(bigint, bigint, bigint, text)
  from public, anon, authenticated;
