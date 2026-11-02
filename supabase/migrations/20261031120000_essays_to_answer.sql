-- Consignas optativas: «elegí dos de las tres».
--
-- En el segundo parcial se muestran tres consignas para desarrollar y cada
-- estudiante responde dos. El máximo de las escritas se calculaba sumando todas
-- las consignas del intento, así que la devolución habría dicho «de 11,25»
-- en vez de «de 7,5». Con essays_to_answer el máximo suma sólo las N consignas
-- de mayor puntaje; la que queda en blanco se corrige con 0 y no cambia nada.
-- Sin el dato (null) todo sigue como antes: se responden todas.

alter table exam_private.exams
  add column essays_to_answer smallint,
  add constraint exams_essays_to_answer_valid
    check (essays_to_answer is null or essays_to_answer > 0);

create or replace function exam_private.grade_objective_on_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_objective_score numeric(7, 2);
  v_objective_max numeric(7, 2);
  v_manual_max numeric(7, 2);
  v_essays_to_answer smallint;
begin
  if new.status not in ('submitted', 'timed_out')
     or old.status is not distinct from new.status then
    return new;
  end if;

  select
    coalesce(sum(
      case
        when q.kind = 'single_choice' and qo.is_correct then q.points
        else 0
      end
    ), 0),
    coalesce(sum(q.points) filter (where q.kind = 'single_choice'), 0),
    coalesce(sum(q.points) filter (where q.kind = 'essay'), 0)
  into v_objective_score, v_objective_max, v_manual_max
  from exam_private.attempt_items ai
  join exam_private.questions q on q.id = ai.question_id
  left join exam_private.responses r on r.attempt_item_id = ai.id
  left join exam_private.question_options qo on qo.id = r.selected_option_id
  where ai.attempt_id = new.id;

  select e.essays_to_answer into v_essays_to_answer
  from exam_private.exams e
  where e.id = new.exam_id;

  -- Si se eligen N consignas, el máximo es el de las N que más valen.
  if v_essays_to_answer is not null then
    select coalesce(sum(chosen.points), 0) into v_manual_max
    from (
      select q.points
      from exam_private.attempt_items ai
      join exam_private.questions q on q.id = ai.question_id
      where ai.attempt_id = new.id
        and q.kind = 'essay'
      order by q.points desc
      limit v_essays_to_answer
    ) chosen;
  end if;

  new.objective_score := v_objective_score;
  new.objective_max_score := v_objective_max;
  new.objective_graded_at := clock_timestamp();
  new.manual_max_score := v_manual_max;
  new.manual_score := case when v_manual_max = 0 then 0 else null end;
  new.total_score := case when v_manual_max = 0 then v_objective_score else null end;
  new.grading_status := case when v_manual_max = 0 then 'ready_to_publish' else 'unassigned' end;
  new.grading_version := new.grading_version + 1;

  insert into exam_private.grading_audit (attempt_id, event_type, details)
  values (
    new.id,
    'objective_graded',
    jsonb_build_object(
      'score', v_objective_score,
      'maxScore', v_objective_max,
      'manualMaxScore', v_manual_max
    )
  );
  return new;
end;
$$;
