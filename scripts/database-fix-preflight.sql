select jsonb_build_object(
  'capturedAt',now(),
  'latestMigration',(select max(version) from supabase_migrations.schema_migrations),
  'databaseBytes',pg_database_size(current_database()),
  'evidenceRows',(select count(*) from public.coach_evidence),
  'evidenceFingerprint',(select sum(hashtextextended(payload::text,0)::numeric)::text from public.coach_evidence),
  'evidencePayloadBytes',(select sum(octet_length(payload::text)) from public.coach_evidence),
  'evidenceTagBytes',(select sum(octet_length((payload->'tag')::text)) from public.coach_evidence),
  'cohortAgeSeconds',(select extract(epoch from now()-computed_at) from public.performance_cohort_cache where singleton),
  'extensions',(select jsonb_agg(extname) from pg_extension where extname in ('pg_cron','pg_net','supabase_vault')),
  'maintenanceVaultConfigured',(select count(*) from vault.secrets where name in ('futuredoc_maintenance_key','futuredoc_maintenance_url'))
) as preflight;
