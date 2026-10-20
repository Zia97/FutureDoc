set statement_timeout = '60s';
set lock_timeout = '2s';
select public.refresh_performance_cohort()->>'computedAt' as computed_at;
