-- The AI tutor observability migration adds columns used immediately by the
-- Edge Function. Explicitly refresh every PostgREST worker so newly deployed
-- functions do not encounter a stale schema cache after the migration.
NOTIFY pgrst, 'reload schema';
