-- Coach chat stays in the active app session. Keep only operational request
-- metadata needed for quotas and duplicate request protection.
alter table public.coach_messages alter column user_text drop not null;

create or replace function public.coach_reserve_message(p_user uuid, p_request uuid, p_text text, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; existing public.coach_messages; count_today integer; count_all integer;
begin
  select * into profile from public.coach_profiles where user_id = p_user for update;
  if not found or profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
  select * into existing from public.coach_messages where user_id = p_user and request_id = p_request;
  if found then
    if existing.status = 'completed' then raise exception 'message_already_completed'; end if;
    return jsonb_build_object('reserved', false, 'message', jsonb_build_object('id', existing.id, 'request_id', existing.request_id, 'status', existing.status, 'created_at', existing.created_at));
  end if;
  select count(*) filter (where free_credit_used), count(*) filter (where created_at >= date_trunc('day', now())) into count_all, count_today
    from public.coach_messages where user_id = p_user;
  if not p_pro and count_all + profile.free_chat_used >= 5 then raise exception 'pro_required'; end if;
  if count_today + (case when profile.chat_day = current_date then profile.chat_day_used else 0 end) >= 100 then raise exception 'daily_limit'; end if;
  if exists(select 1 from public.coach_messages where user_id = p_user and status = 'pending' and created_at > now() - interval '2 minutes') then
    raise exception 'message_in_progress';
  end if;
  insert into public.coach_messages(user_id, request_id, user_text, free_credit_used)
    values(p_user, p_request, null, not p_pro) returning * into existing;
  return jsonb_build_object('reserved', true, 'message', jsonb_build_object('id', existing.id, 'request_id', existing.request_id, 'status', existing.status, 'created_at', existing.created_at));
end $$;

create or replace function public.coach_complete_message(
  p_user uuid, p_request uuid, p_assistant text, p_success boolean,
  p_free_credit_used boolean, p_provider text, p_model text, p_response_id text,
  p_tool_calls integer, p_evidence jsonb
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare existing public.coach_messages;
begin
  select * into existing from public.coach_messages
    where user_id = p_user and request_id = p_request for update;
  if not found then raise exception 'message_not_found'; end if;
  if nullif(btrim(p_assistant), '') is null then raise exception 'invalid_message'; end if;
  if existing.status = 'pending' then
    update public.coach_messages set status = 'completed', user_text = null, assistant_text = null,
      free_credit_used = p_free_credit_used,
      evidence = jsonb_build_object('transcript_saved', false, 'fallback', not p_success)
      where id = existing.id returning * into existing;
  end if;
  return jsonb_build_object('id', existing.id, 'request_id', existing.request_id,
    'created_at', existing.created_at, 'status', existing.status);
end $$;

revoke all on function public.coach_reserve_message(uuid,uuid,text,boolean) from public, anon, authenticated;
grant execute on function public.coach_reserve_message(uuid,uuid,text,boolean) to service_role;
revoke all on function public.coach_complete_message(uuid,uuid,text,boolean,boolean,text,text,text,integer,jsonb) from public, anon, authenticated;
grant execute on function public.coach_complete_message(uuid,uuid,text,boolean,boolean,text,text,text,integer,jsonb) to service_role;
