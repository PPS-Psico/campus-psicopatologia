-- Las respuestas a desarrollar no tienen límite de extensión en el parcial.
-- El tope técnico pasa de 8.000 a 20.000 caracteres (unas 3.000 palabras):
-- queda como resguardo contra un envío anómalo, no como límite para quien
-- escribe, porque en 90 minutos nadie llega.
alter table exam_private.responses
  drop constraint responses_essay_length_valid;

alter table exam_private.responses
  add constraint responses_essay_length_valid
  check (essay_text is null or length(essay_text) <= 20000);
