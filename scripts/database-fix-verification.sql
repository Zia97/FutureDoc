set statement_timeout='30s';
with evidence as materialized (
select count(*) as rows,sum(hashtextextended(payload::text,0)::numeric)::text as fingerprint from public.coach_evidence where recorded_at<='2026-10-20T13:27:58.944837+00:00'::timestamptz
), started as materialized (select clock_timestamp() at), cached as materialized (
select public.get_performance_cohort() payload,started.at from started
)
select jsonb_build_object(
'capturedAt',now(),'baselineCutoff','2026-10-20T13:27:58.944837+00:00',
'baselineEvidenceRows',(select rows from evidence),'baselineEvidenceFingerprint',(select fingerprint from evidence),
'evidenceRows',(select count(*) from public.coach_evidence_records),
'pendingCompaction',(select count(*) from public.coach_evidence_records where payload ? 'tag'),
'compactPayloadBytes',(select sum(octet_length(payload::text)) from public.coach_evidence_records),
'uniqueTagBytes',(select sum(octet_length(payload::text)) from public.coach_evidence_tags),
'uniqueTags',(select count(*) from public.coach_evidence_tags),
'databaseBytes',pg_database_size(current_database()),
'evidencePhysicalBytes',pg_total_relation_size('public.coach_evidence_records'),
'cohortComputedAt',(select computed_at from public.performance_cohort_cache where singleton),
'cohortReadMs',(select extract(epoch from clock_timestamp()-at)*1000 from cached),
'authenticatedCanReadEvidence',has_table_privilege('authenticated','public.coach_evidence','select'),
'authenticatedCanReadReceipts',has_table_privilege('authenticated','public.timed_submission_receipts','select'),
'jobs',(select jsonb_agg(jsonb_build_object('name',jobname,'schedule',schedule,'active',active)) from cron.job where jobname like 'futuredoc-%'),
'recentJobs',(select jsonb_agg(r) from (select j.jobname,d.status,d.return_message,d.end_time from cron.job_run_details d join cron.job j using(jobid) where j.jobname like 'futuredoc-%' order by d.start_time desc limit 10) r),
'latestMigration',(select max(version) from supabase_migrations.schema_migrations)
) as verification;
