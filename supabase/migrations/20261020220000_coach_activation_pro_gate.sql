-- A downloaded reservation does not grant a new session after Pro expires.
-- Remove the old ungated signature, including for service-role callers.
drop function public.coach_activate_next_set(uuid,uuid);

create function public.coach_activate_next_set(p_user uuid, p_id uuid, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare prepared public.coach_next_sets; existing public.coach_sessions;
begin
  perform 1 from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where id = p_id and user_id = p_user;
  -- Finishing or retrying a session already started never needs another credit.
  if found then return to_jsonb(existing); end if;
  select * into prepared from public.coach_next_sets where id = p_id and user_id = p_user for update;
  if not found or prepared.session is null then raise exception 'session_not_found'; end if;
  if p_pro is not true then raise exception 'pro_required'; end if;
  if not exists(select 1 from public.coach_sessions where id = prepared.previous_session_id and user_id = p_user and status = 'completed')
    then raise exception 'previous_incomplete'; end if;
  if exists(select 1 from public.coach_sessions where user_id = p_user and status = 'active') then raise exception 'session_in_progress'; end if;
  insert into public.coach_sessions(id, user_id, kind, title, form_version, time_multiplier, questions, budgets, progress)
    values(prepared.id, p_user, 'practice', prepared.session->>'title', prepared.session->>'form_version',
      (prepared.session->>'time_multiplier')::numeric, prepared.session->'questions', prepared.session->'budgets', prepared.session->'progress') returning * into existing;
  update public.coach_next_sets set claimed_at = now(), session = null where id = p_id;
  return to_jsonb(existing);
end $$;

revoke all on function public.coach_activate_next_set(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.coach_activate_next_set(uuid,uuid,boolean) to service_role;
