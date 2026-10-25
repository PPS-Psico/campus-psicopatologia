select a.public_id::text as attempt_id, a.display_name, a.result, a.final_score, a.grading_status,
  (select jsonb_agg(jsonb_build_object('itemId', ai.public_id, 'position', ai.position, 'text', coalesce(r.essay_text, '')))
   from exam_private.attempt_items ai join exam_private.questions q on q.id = ai.question_id
   left join exam_private.responses r on r.attempt_item_id = ai.id
   where ai.attempt_id = a.id and q.kind = 'essay') as items,
  (select f.snapshot from exam_private.feedback_releases f where f.attempt_id = a.id order by f.version desc limit 1) as snapshot
from exam_private.attempts a
where a.public_id in (:ids);  -- reemplazar :ids por los attemptId entre comillas
