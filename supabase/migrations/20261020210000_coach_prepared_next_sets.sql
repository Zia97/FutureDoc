-- Download the next set without changing the current session or its evidence.
create table public.coach_next_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_session_id uuid not null,
  session jsonb,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index coach_next_set_per_previous on public.coach_next_sets(user_id, previous_session_id) where claimed_at is null;
create index coach_next_sets_user on public.coach_next_sets(user_id, created_at);
alter table public.coach_next_sets enable row level security;
revoke all on public.coach_next_sets from anon, authenticated;
grant all on public.coach_next_sets to service_role;

create function public.coach_prepare_next_set(p_user uuid, p_previous uuid, p_session jsonb, p_pro boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare profile public.coach_profiles; prepared public.coach_next_sets;
begin
  select * into profile from public.coach_profiles where user_id = p_user for update;
  if not found or profile.baseline_session_id is null then raise exception 'assessment_required'; end if;
  if p_pro is not true then raise exception 'pro_required'; end if;
  if not exists(select 1 from public.coach_sessions where id = p_previous and user_id = p_user and kind <> 'assessment')
    and not exists(select 1 from public.coach_next_sets where id = p_previous and user_id = p_user and session is not null)
    then raise exception 'session_not_found'; end if;
  select * into prepared from public.coach_next_sets where user_id = p_user and previous_session_id = p_previous and claimed_at is null;
  if found then return to_jsonb(prepared); end if;
  if p_session->>'kind' <> 'practice' or jsonb_array_length(p_session->'questions') < 1 then raise exception 'invalid_request'; end if;
  insert into public.coach_next_sets(user_id, previous_session_id, session) values(p_user, p_previous, p_session) returning * into prepared;
  return to_jsonb(prepared);
end $$;

create function public.coach_activate_next_set(p_user uuid, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare prepared public.coach_next_sets; existing public.coach_sessions;
begin
  perform 1 from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where id = p_id and user_id = p_user;
  if found then return to_jsonb(existing); end if;
  select * into prepared from public.coach_next_sets where id = p_id and user_id = p_user for update;
  if not found or prepared.session is null then raise exception 'session_not_found'; end if;
  if not exists(select 1 from public.coach_sessions where id = prepared.previous_session_id and user_id = p_user and status = 'completed')
    then raise exception 'previous_incomplete'; end if;
  if exists(select 1 from public.coach_sessions where user_id = p_user and status = 'active') then raise exception 'session_in_progress'; end if;
  insert into public.coach_sessions(id, user_id, kind, title, form_version, time_multiplier, questions, budgets, progress)
    values(prepared.id, p_user, 'practice', prepared.session->>'title', prepared.session->>'form_version',
      (prepared.session->>'time_multiplier')::numeric, prepared.session->'questions', prepared.session->'budgets', prepared.session->'progress') returning * into existing;
  -- Keep only the reservation metadata once its content is in coach_sessions.
  update public.coach_next_sets set claimed_at = now(), session = null where id = p_id;
  return to_jsonb(existing);
end $$;

create function public.coach_clear_next_sets() returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.coach_next_sets where user_id = old.user_id;
  return old;
end $$;
create trigger coach_clear_next_sets_on_reset after delete on public.coach_sessions for each row execute function public.coach_clear_next_sets();

revoke all on function public.coach_prepare_next_set(uuid,uuid,jsonb,boolean) from public, anon, authenticated;
revoke all on function public.coach_activate_next_set(uuid,uuid) from public, anon, authenticated;
revoke all on function public.coach_clear_next_sets() from public, anon, authenticated;
grant execute on function public.coach_prepare_next_set(uuid,uuid,jsonb,boolean) to service_role;
grant execute on function public.coach_activate_next_set(uuid,uuid) to service_role;
