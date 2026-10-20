set lock_timeout = '3s';
set statement_timeout = '60s';

-- Small, bounded daily measurements make actual growth visible over time.
create table public.database_health_daily (
  day date primary key,
  captured_at timestamptz not null default now(),
  database_bytes bigint not null,
  table_bytes bigint not null,
  dead_rows bigint not null,
  client_connections integer not null,
  cohort_age_seconds bigint,
  largest_tables jsonb not null
);
alter table public.database_health_daily enable row level security;
revoke all on public.database_health_daily from public,anon,authenticated;
grant select on public.database_health_daily to service_role;
create function public.capture_database_health() returns void
language plpgsql security definer set search_path='' as $$
begin
  insert into public.database_health_daily
    (day,database_bytes,table_bytes,dead_rows,client_connections,cohort_age_seconds,largest_tables)
  select current_date,pg_database_size(current_database()),
    (select coalesce(sum(pg_total_relation_size(relid)),0) from pg_stat_user_tables where schemaname='public'),
    (select coalesce(sum(n_dead_tup),0) from pg_stat_user_tables where schemaname='public'),
    (select count(*) from pg_stat_activity where datname=current_database() and backend_type='client backend'),
    (select extract(epoch from now()-computed_at)::bigint from public.performance_cohort_cache where singleton),
    (select coalesce(jsonb_agg(t),'[]'::jsonb) from (
      select relname,pg_total_relation_size(relid) bytes,n_live_tup,n_dead_tup
      from pg_stat_user_tables where schemaname='public' order by pg_total_relation_size(relid) desc limit 10
    ) t)
  on conflict(day) do update set captured_at=now(),database_bytes=excluded.database_bytes,
    table_bytes=excluded.table_bytes,dead_rows=excluded.dead_rows,client_connections=excluded.client_connections,
    cohort_age_seconds=excluded.cohort_age_seconds,largest_tables=excluded.largest_tables;
  delete from public.database_health_daily where day<current_date-35;
end $$;
revoke all on function public.capture_database_health() from public,anon,authenticated;
grant execute on function public.capture_database_health() to service_role;
select cron.schedule('futuredoc-health','11 1 * * *',
  'set statement_timeout = ''20s''; select public.capture_database_health();');
