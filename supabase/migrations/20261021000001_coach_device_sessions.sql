-- Idempotently register sessions created from bundled/downloaded content.
-- Only the Edge Function can call this with server-validated question snapshots.
create function public.coach_import_session(p_user uuid, p_session jsonb, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; existing public.coach_sessions; created public.coach_sessions;
begin
  insert into public.coach_profiles(user_id) values(p_user) on conflict do nothing;
  select * into profile from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where id = (p_session->>'id')::uuid and user_id = p_user;
  if found then return to_jsonb(existing); end if;
  if exists(select 1 from public.coach_sessions where user_id = p_user and status = 'active') then
    raise exception 'session_in_progress';
  end if;
  if p_session->>'kind' = 'assessment' then
    if profile.baseline_session_id is not null then raise exception 'assessment_already_completed'; end if;
  elsif p_session->>'kind' in ('practice', 'review', 'timed_check') then
    if profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
    if p_pro is not true and profile.preview_session_id is not null then raise exception 'pro_required'; end if;
  else
    raise exception 'invalid_request';
  end if;
  insert into public.coach_sessions(id, user_id, kind, title, form_version, time_multiplier, questions, budgets, progress)
  values((p_session->>'id')::uuid, p_user, p_session->>'kind', p_session->>'title', p_session->>'form_version',
    (p_session->>'time_multiplier')::numeric, p_session->'questions', p_session->'budgets', p_session->'progress') returning * into created;
  if created.kind <> 'assessment' and p_pro is not true then
    update public.coach_profiles set preview_session_id = created.id, updated_at = now() where user_id = p_user;
  end if;
  return to_jsonb(created);
end $$;

revoke all on function public.coach_import_session(uuid,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.coach_import_session(uuid,jsonb,boolean) to service_role;
