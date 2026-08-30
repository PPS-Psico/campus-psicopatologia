create or replace function public.exam_record_event(
  p_attempt_token_hash text,
  p_event_type text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_id bigint;
  v_attempt_status text;
  v_deadline_at timestamptz;
begin
  if p_event_type not in ('window_hidden', 'window_visible', 'client_error') then
    raise exception using errcode = '22023', message = 'invalid_event_type';
  end if;
  if jsonb_typeof(p_details) <> 'object' or pg_column_size(p_details) > 4096 then
    raise exception using errcode = '22023', message = 'invalid_event_details';
  end if;

  select id, status, deadline_at
  into v_attempt_id, v_attempt_status, v_deadline_at
  from exam_private.attempts
  where attempt_token_hash = p_attempt_token_hash
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_attempt_session';
  end if;

  if v_attempt_status <> 'in_progress' or clock_timestamp() >= v_deadline_at then
    return;
  end if;

  if exists (
    select 1
    from exam_private.events
    where attempt_id = v_attempt_id
      and occurred_at >= clock_timestamp() - interval '1 second'
  ) then
    return;
  end if;

  insert into exam_private.events (attempt_id, event_type, details)
  values (v_attempt_id, p_event_type, p_details);
end;
$$;

revoke all on function public.exam_record_event(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.exam_record_event(text, text, jsonb)
  to service_role;
