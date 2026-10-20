set lock_timeout = '3s';
set statement_timeout = '60s';

-- Interactive requests only read the last successful snapshot. Refresh failures
-- leave it intact. The scheduler invokes the existing, tested aggregate builder.
alter function public.get_performance_cohort() rename to refresh_performance_cohort;
create function public.get_performance_cohort() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce((select payload from public.performance_cohort_cache where singleton),
    '{"status":"unavailable","rows":[],"groups":[]}'::jsonb);
$$;
revoke all on function public.get_performance_cohort() from public,anon,authenticated;
grant execute on function public.get_performance_cohort() to service_role;
revoke all on function public.refresh_performance_cohort() from public,anon,authenticated;
grant execute on function public.refresh_performance_cohort() to service_role;
