-- Session completion and its evidence must share the database timestamp.
-- The edge function's clock can precede the saved completion, excluding the
-- whole mini mock from the running accuracy window.
create or replace function public.coach_save_session(p_user uuid, p_id uuid, p_version integer, p_progress jsonb, p_report jsonb default null, p_evidence jsonb default '[]')
returns jsonb language plpgsql security definer set search_path = public as $$
declare existing public.coach_sessions; item jsonb;
begin
  perform 1 from public.coach_profiles where user_id = p_user for update;
  select * into existing from public.coach_sessions where id = p_id and user_id = p_user for update;
  if not found then raise exception 'session_not_found'; end if;
  if existing.status = 'completed' then return to_jsonb(existing); end if;
  if existing.version <> p_version then raise exception 'version_conflict'; end if;
  if p_report is not null and p_progress->>'phase' <> 'finished' then raise exception 'incomplete_assessment'; end if;
  update public.coach_sessions set progress = p_progress, version = version + 1, updated_at = now(),
    status = case when p_report is not null then 'completed' else 'active' end,
    report = p_report, completed_at = case when p_report is not null then now() else null end
    where id = p_id returning * into existing;
  if p_report is not null then
    if existing.kind = 'assessment' then
      update public.coach_profiles set baseline_session_id = p_id, updated_at = now() where user_id = p_user;
    end if;
    for item in select value from jsonb_array_elements(p_evidence) loop
      insert into public.coach_evidence(user_id, source_key, payload)
      values(p_user, 'coach:' || p_id || ':' || (item->>'questionId'),
        jsonb_set(item, '{answeredAt}', to_jsonb(existing.completed_at)))
      on conflict(user_id, source_key) do nothing;
    end loop;
  end if;
  return to_jsonb(existing);
end $$;

revoke all on function public.coach_save_session(uuid,uuid,integer,jsonb,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.coach_save_session(uuid,uuid,integer,jsonb,jsonb,jsonb) to service_role;

-- Repair completed sessions too, so students do not need to retake the mock.
update public.coach_evidence e
set payload = jsonb_set(e.payload, '{answeredAt}', to_jsonb(s.completed_at))
from public.coach_sessions s
where s.user_id = e.user_id and s.status = 'completed' and s.completed_at is not null
  and e.source_key = 'coach:' || s.id || ':' || (e.payload->>'questionId')
  and e.payload->>'answeredAt' is distinct from to_jsonb(s.completed_at) #>> '{}';
