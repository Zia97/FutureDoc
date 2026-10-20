set lock_timeout = '3s';
set statement_timeout = '60s';

-- An index-only-sized history signature is cheaper than repeatedly transferring
-- all answer payloads. Include deletions and insertion ties in invalidation.
create function public.coach_evidence_revision(p_user uuid) returns text
language sql stable security definer set search_path = '' as $$
  select md5(count(*)::text || ':' || coalesce(max(recorded_at)::text,'') || ':' ||
    coalesce(max(id::text),'')) from public.coach_evidence_records where user_id=p_user;
$$;
revoke all on function public.coach_evidence_revision(uuid) from public,anon,authenticated;
grant execute on function public.coach_evidence_revision(uuid) to service_role;
