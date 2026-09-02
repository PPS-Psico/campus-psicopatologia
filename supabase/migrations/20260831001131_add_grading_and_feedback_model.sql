-- Modelo privado para correccion compartida y devoluciones.
-- No se expone ninguna tabla al navegador: las Edge Functions acceden mediante
-- RPCs concedidas exclusivamente a service_role.

alter table exam_private.attempts
  add column objective_score numeric(7, 2),
  add column objective_max_score numeric(7, 2),
  add column objective_graded_at timestamptz,
  add column manual_score numeric(7, 2),
  add column manual_max_score numeric(7, 2),
  add column total_score numeric(7, 2),
  add column grading_status text not null default 'not_ready',
  add column grading_version bigint not null default 0,
  add column feedback_published_at timestamptz,
  add constraint attempts_objective_score_valid check (
    objective_score is null
    or (objective_score >= 0 and objective_score <= objective_max_score)
  ),
  add constraint attempts_manual_score_valid check (
    manual_score is null
    or (manual_score >= 0 and manual_score <= manual_max_score)
  ),
  add constraint attempts_total_score_valid check (
    total_score is null
    or (
      total_score >= 0
      and total_score <= coalesce(objective_max_score, 0) + coalesce(manual_max_score, 0)
    )
  ),
  add constraint attempts_grading_status_valid check (grading_status in (
    'not_ready', 'unassigned', 'in_review', 'reviewed',
    'ready_to_publish', 'published'
  )),
  add constraint attempts_grading_version_valid check (grading_version >= 0),
  add constraint attempts_feedback_publication_valid check (
    (grading_status = 'published' and feedback_published_at is not null)
    or (grading_status <> 'published')
  );

create index attempts_grading_queue_idx
  on exam_private.attempts (exam_id, grading_status, submitted_at)
  where status in ('submitted', 'timed_out');

-- Los indices historicos de estas FK eran parciales. Sirven para busquedas de
-- la aplicacion, pero no alcanzan para validar DELETE/UPDATE de la fila padre.
create index attempts_roster_fk_idx on exam_private.attempts (roster_id);
create index responses_selected_option_fk_idx
  on exam_private.responses (selected_option_id);

create table exam_private.grader_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null,
  role text not null default 'grader',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grader_profiles_display_name_valid check (
    length(btrim(display_name)) between 2 and 120
  ),
  constraint grader_profiles_role_valid check (role in ('grader', 'coordinator'))
);

create table exam_private.rubrics (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  exam_id bigint not null references exam_private.exams(id) on delete restrict,
  title text not null,
  version integer not null default 1,
  is_active boolean not null default false,
  created_by uuid references exam_private.grader_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint rubrics_title_valid check (length(btrim(title)) between 3 and 160),
  constraint rubrics_version_valid check (version > 0),
  constraint rubrics_exam_version_unique unique (exam_id, version)
);

create unique index rubrics_one_active_per_exam_idx
  on exam_private.rubrics (exam_id)
  where is_active = true;

create index rubrics_created_by_idx
  on exam_private.rubrics (created_by);

create table exam_private.rubric_criteria (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  rubric_id bigint not null references exam_private.rubrics(id) on delete cascade,
  question_id bigint not null references exam_private.questions(id) on delete restrict,
  title text not null,
  description text not null default '',
  max_points numeric(7, 2) not null,
  position smallint not null,
  constraint rubric_criteria_title_valid check (length(btrim(title)) between 2 and 160),
  constraint rubric_criteria_description_valid check (length(description) <= 2000),
  constraint rubric_criteria_points_valid check (max_points > 0),
  constraint rubric_criteria_position_valid check (position > 0),
  constraint rubric_criteria_position_unique unique (rubric_id, question_id, position)
);

create index rubric_criteria_question_idx
  on exam_private.rubric_criteria (question_id, position);

create table exam_private.grading_assignments (
  id bigint generated always as identity primary key,
  attempt_id bigint not null references exam_private.attempts(id) on delete restrict,
  grader_user_id uuid not null references exam_private.grader_profiles(user_id) on delete restrict,
  claimed_at timestamptz not null default clock_timestamp(),
  released_at timestamptz,
  completed_at timestamptz,
  release_reason text,
  constraint grading_assignments_release_reason_valid check (
    release_reason is null or length(btrim(release_reason)) between 3 and 500
  ),
  constraint grading_assignments_dates_valid check (
    (released_at is null or released_at >= claimed_at)
    and (completed_at is null or completed_at >= claimed_at)
  )
);

create unique index grading_assignments_one_active_idx
  on exam_private.grading_assignments (attempt_id)
  where released_at is null and completed_at is null;

create index grading_assignments_attempt_idx
  on exam_private.grading_assignments (attempt_id);

create index grading_assignments_grader_idx
  on exam_private.grading_assignments (grader_user_id);

create index grading_assignments_grader_active_idx
  on exam_private.grading_assignments (grader_user_id, claimed_at)
  where released_at is null and completed_at is null;

create table exam_private.essay_grades (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  attempt_id bigint not null references exam_private.attempts(id) on delete restrict,
  attempt_item_id bigint not null references exam_private.attempt_items(id) on delete restrict,
  grader_user_id uuid not null references exam_private.grader_profiles(user_id) on delete restrict,
  score numeric(7, 2),
  general_feedback text not null default '',
  internal_note text not null default '',
  revision bigint not null default 0,
  saved_at timestamptz not null default clock_timestamp(),
  reviewed_at timestamptz,
  constraint essay_grades_item_unique unique (attempt_item_id),
  constraint essay_grades_score_valid check (score is null or score >= 0),
  constraint essay_grades_feedback_valid check (length(general_feedback) <= 8000),
  constraint essay_grades_internal_note_valid check (length(internal_note) <= 8000),
  constraint essay_grades_revision_valid check (revision >= 0)
);

create index essay_grades_attempt_idx on exam_private.essay_grades (attempt_id);
create index essay_grades_grader_idx on exam_private.essay_grades (grader_user_id);

create table exam_private.essay_grade_criteria (
  id bigint generated always as identity primary key,
  essay_grade_id bigint not null references exam_private.essay_grades(id) on delete cascade,
  criterion_id bigint not null references exam_private.rubric_criteria(id) on delete restrict,
  score numeric(7, 2) not null,
  comment text not null default '',
  constraint essay_grade_criteria_unique unique (essay_grade_id, criterion_id),
  constraint essay_grade_criteria_score_valid check (score >= 0),
  constraint essay_grade_criteria_comment_valid check (length(comment) <= 4000)
);

create index essay_grade_criteria_criterion_idx
  on exam_private.essay_grade_criteria (criterion_id);

create table exam_private.essay_annotations (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  essay_grade_id bigint not null references exam_private.essay_grades(id) on delete cascade,
  grader_user_id uuid not null references exam_private.grader_profiles(user_id) on delete restrict,
  start_offset integer not null,
  end_offset integer not null,
  selected_text text not null,
  comment text not null,
  visible_to_student boolean not null default true,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  constraint essay_annotations_offsets_valid check (
    start_offset >= 0 and end_offset > start_offset
  ),
  constraint essay_annotations_selected_text_valid check (
    length(selected_text) between 1 and 2000
  ),
  constraint essay_annotations_comment_valid check (
    length(btrim(comment)) between 1 and 4000
  )
);

create index essay_annotations_grade_idx
  on exam_private.essay_annotations (essay_grade_id, start_offset);
create index essay_annotations_grader_idx
  on exam_private.essay_annotations (grader_user_id);

create table exam_private.grading_audit (
  id bigint generated always as identity primary key,
  attempt_id bigint not null references exam_private.attempts(id) on delete restrict,
  actor_user_id uuid references exam_private.grader_profiles(user_id) on delete restrict,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default clock_timestamp(),
  constraint grading_audit_event_valid check (event_type in (
    'objective_graded', 'claimed', 'released', 'draft_saved',
    'reviewed', 'ready_to_publish', 'published', 'reopened'
  )),
  constraint grading_audit_details_valid check (
    jsonb_typeof(details) = 'object' and pg_column_size(details) <= 16384
  )
);

create index grading_audit_attempt_time_idx
  on exam_private.grading_audit (attempt_id, occurred_at);
create index grading_audit_actor_idx
  on exam_private.grading_audit (actor_user_id);

create table exam_private.feedback_releases (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  attempt_id bigint not null references exam_private.attempts(id) on delete restrict,
  version integer not null,
  published_by uuid not null references exam_private.grader_profiles(user_id) on delete restrict,
  snapshot jsonb not null,
  published_at timestamptz not null default clock_timestamp(),
  constraint feedback_releases_version_valid check (version > 0),
  constraint feedback_releases_snapshot_valid check (
    jsonb_typeof(snapshot) = 'object' and pg_column_size(snapshot) <= 262144
  ),
  constraint feedback_releases_attempt_version_unique unique (attempt_id, version)
);

create index feedback_releases_latest_idx
  on exam_private.feedback_releases (attempt_id, version desc);
create index feedback_releases_publisher_idx
  on exam_private.feedback_releases (published_by);

create table exam_private.student_feedback_sessions (
  id bigint generated always as identity primary key,
  token_hash text not null unique,
  roster_id bigint not null references exam_private.course_roster(id) on delete restrict,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  constraint student_feedback_sessions_hash_valid check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint student_feedback_sessions_expiry_valid check (expires_at > created_at),
  constraint student_feedback_sessions_revoked_valid check (
    revoked_at is null or revoked_at >= created_at
  )
);

create index student_feedback_sessions_lookup_idx
  on exam_private.student_feedback_sessions (token_hash, expires_at)
  where revoked_at is null;
create index student_feedback_sessions_roster_idx
  on exam_private.student_feedback_sessions (roster_id);

do $security$
declare
  v_table text;
begin
  foreach v_table in array array[
    'grader_profiles', 'rubrics', 'rubric_criteria', 'grading_assignments',
    'essay_grades', 'essay_grade_criteria', 'essay_annotations',
    'grading_audit', 'feedback_releases', 'student_feedback_sessions'
  ]
  loop
    execute format('alter table exam_private.%I enable row level security', v_table);
    execute format('alter table exam_private.%I force row level security', v_table);
    execute format(
      'revoke all on table exam_private.%I from public, anon, authenticated',
      v_table
    );
  end loop;
end;
$security$;

revoke all on all sequences in schema exam_private from public, anon, authenticated;

create or replace function exam_private.validate_rubric_criterion()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_rubric_exam_id bigint;
  v_question_exam_id bigint;
  v_question_kind text;
begin
  select exam_id into v_rubric_exam_id
  from exam_private.rubrics
  where id = new.rubric_id;

  select exam_id, kind into v_question_exam_id, v_question_kind
  from exam_private.questions
  where id = new.question_id;

  if v_question_kind <> 'essay' then
    raise exception using errcode = '23514', message = 'rubric_criterion_requires_essay';
  end if;
  if v_rubric_exam_id <> v_question_exam_id then
    raise exception using errcode = '23514', message = 'rubric_question_exam_mismatch';
  end if;
  return new;
end;
$$;

create trigger rubric_criteria_validate
before insert or update of rubric_id, question_id
on exam_private.rubric_criteria
for each row execute function exam_private.validate_rubric_criterion();

create or replace function exam_private.validate_essay_grade()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_item_attempt_id bigint;
  v_question_kind text;
  v_max_points numeric(7, 2);
begin
  select ai.attempt_id, q.kind, q.points
  into v_item_attempt_id, v_question_kind, v_max_points
  from exam_private.attempt_items ai
  join exam_private.questions q on q.id = ai.question_id
  where ai.id = new.attempt_item_id;

  if v_item_attempt_id <> new.attempt_id or v_question_kind <> 'essay' then
    raise exception using errcode = '23514', message = 'invalid_essay_grade_item';
  end if;
  if new.score is not null and new.score > v_max_points then
    raise exception using errcode = '23514', message = 'essay_score_exceeds_question_points';
  end if;
  return new;
end;
$$;

create trigger essay_grades_validate
before insert or update of attempt_id, attempt_item_id, score
on exam_private.essay_grades
for each row execute function exam_private.validate_essay_grade();

create or replace function exam_private.validate_criterion_score()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_max_points numeric(7, 2);
  v_grade_question_id bigint;
  v_criterion_question_id bigint;
begin
  select max_points, question_id
  into v_max_points, v_criterion_question_id
  from exam_private.rubric_criteria
  where id = new.criterion_id;

  select ai.question_id into v_grade_question_id
  from exam_private.essay_grades eg
  join exam_private.attempt_items ai on ai.id = eg.attempt_item_id
  where eg.id = new.essay_grade_id;

  if v_grade_question_id <> v_criterion_question_id then
    raise exception using errcode = '23514', message = 'criterion_question_mismatch';
  end if;
  if new.score > v_max_points then
    raise exception using errcode = '23514', message = 'criterion_score_exceeds_maximum';
  end if;
  return new;
end;
$$;

create trigger essay_grade_criteria_validate
before insert or update of essay_grade_id, criterion_id, score
on exam_private.essay_grade_criteria
for each row execute function exam_private.validate_criterion_score();

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

create trigger attempts_grade_objective
before update of status on exam_private.attempts
for each row execute function exam_private.grade_objective_on_completion();

create or replace function exam_private.prevent_immutable_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using errcode = '55000', message = 'immutable_record';
end;
$$;

create trigger grading_audit_immutable
before update or delete on exam_private.grading_audit
for each row execute function exam_private.prevent_immutable_change();

create trigger feedback_releases_immutable
before update or delete on exam_private.feedback_releases
for each row execute function exam_private.prevent_immutable_change();

create or replace function exam_private.assert_active_grader(p_user_id uuid)
returns exam_private.grader_profiles
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_grader exam_private.grader_profiles%rowtype;
begin
  select * into v_grader
  from exam_private.grader_profiles
  where user_id = p_user_id and active = true;

  if not found then
    raise exception using errcode = '42501', message = 'grader_not_authorized';
  end if;
  return v_grader;
end;
$$;

revoke all on function exam_private.validate_rubric_criterion() from public, anon, authenticated;
revoke all on function exam_private.validate_essay_grade() from public, anon, authenticated;
revoke all on function exam_private.validate_criterion_score() from public, anon, authenticated;
revoke all on function exam_private.grade_objective_on_completion() from public, anon, authenticated;
revoke all on function exam_private.prevent_immutable_change() from public, anon, authenticated;
revoke all on function exam_private.assert_active_grader(uuid) from public, anon, authenticated;
