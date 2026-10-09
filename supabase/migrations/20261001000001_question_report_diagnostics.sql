-- Context for reproducing display and interaction reports. Existing clients
-- continue to insert reports without diagnostics.
ALTER TABLE public.question_reports
  ADD COLUMN IF NOT EXISTS diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.question_reports.diagnostics IS
  'App/device layout, cached content version, network state and reported question state; no credentials or device identifiers.';
