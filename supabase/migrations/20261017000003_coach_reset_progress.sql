-- A student can start coaching again without touching their account's
-- separate practice, timed-test or AI tutor records. Used free credits remain
-- consumed so deleting coaching history cannot repeatedly unlock the preview.
alter table public.coach_profiles
  add column free_chat_used integer not null default 0 check (free_chat_used >= 0),
  add column chat_day date,
  add column chat_day_used integer not null default 0 check (chat_day_used >= 0);

create function public.coach_reset_progress(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Start, save and chat reservation take this same row lock. A reset therefore
  -- cannot interleave with a coaching session or message reservation.
  insert into public.coach_profiles(user_id) values(p_user) on conflict do nothing;
  perform 1 from public.coach_profiles where user_id = p_user for update;

  update public.coach_profiles set
    free_chat_used = free_chat_used + (select count(*) from public.coach_messages where user_id = p_user and status = 'completed' and free_credit_used),
    chat_day_used = (case when chat_day = current_date then chat_day_used else 0 end)
      + (select count(*) from public.coach_messages where user_id = p_user and created_at >= date_trunc('day', now())),
    chat_day = current_date,
    baseline_session_id = null,
    preview_session_id = case when preview_session_id is null then null else gen_random_uuid() end,
    exam_date = null, time_multiplier = 1, updated_at = now()
    where user_id = p_user;

  delete from public.coach_messages where user_id = p_user;
  delete from public.coach_milestones where user_id = p_user;
  delete from public.coach_plans where user_id = p_user;
  delete from public.coach_evidence where user_id = p_user;
  delete from public.coach_sessions where user_id = p_user;
end $$;

revoke all on function public.coach_reset_progress(uuid) from public, anon, authenticated;
grant execute on function public.coach_reset_progress(uuid) to service_role;

create or replace function public.coach_reserve_message(p_user uuid, p_request uuid, p_text text, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; existing public.coach_messages; count_today integer; count_all integer;
begin
  select * into profile from public.coach_profiles where user_id = p_user for update;
  if not found or profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
  select * into existing from public.coach_messages where user_id = p_user and request_id = p_request;
  if found then return jsonb_build_object('reserved', false, 'message', to_jsonb(existing)); end if;
  select count(*) filter (where free_credit_used), count(*) filter (where created_at >= date_trunc('day', now())) into count_all, count_today
    from public.coach_messages where user_id = p_user;
  if not p_pro and count_all + profile.free_chat_used >= 5 then raise exception 'pro_required'; end if;
  if count_today + (case when profile.chat_day = current_date then profile.chat_day_used else 0 end) >= 100 then raise exception 'daily_limit'; end if;
  if exists(select 1 from public.coach_messages where user_id = p_user and status = 'pending' and created_at > now() - interval '2 minutes') then
    raise exception 'message_in_progress';
  end if;
  insert into public.coach_messages(user_id, request_id, user_text, free_credit_used) values(p_user, p_request, p_text, not p_pro) returning * into existing;
  return jsonb_build_object('reserved', true, 'message', to_jsonb(existing));
end $$;
