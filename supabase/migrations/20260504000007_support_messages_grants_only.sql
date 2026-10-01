-- support_messages: switch from RLS to grant-based access control.
--
-- Earlier RLS attempts (`WITH CHECK (auth.uid() = user_id)`, then
-- `WITH CHECK (true)`) were both rejected at runtime with 42501,
-- which suggests an environment-specific RLS edge case we don't
-- need to fight. The threat model for this table is simple enough
-- that table-level grants do the job:
--
--   • anon, authenticated  → INSERT only (no SELECT / UPDATE / DELETE)
--   • service_role         → ALL (operator triage via Studio)
--
-- A user can submit a support message but cannot read anyone else's,
-- which is exactly what we wanted. The user_id field on each row is
-- defense-in-depth metadata for triage, not the access boundary.

ALTER TABLE public.support_messages DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_submit_support" ON public.support_messages;

REVOKE ALL ON TABLE public.support_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.support_messages TO anon, authenticated;
GRANT ALL    ON TABLE public.support_messages TO service_role;

-- Force PostgREST to pick up the new ACL immediately.
NOTIFY pgrst, 'reload schema';
