-- Lock down the four admin-only views flagged by the Supabase Security
-- Advisor:
--   - lesson_progress_with_user
--   - practice_attempts_with_user
--   - support_messages_with_user
--   - tester_activity_summary
--
-- Fixes two findings each:
--   1. "Security Definer View" — views default to running with the creator's
--      privileges, bypassing RLS. Setting `security_invoker = on` makes
--      them respect the calling role, so anon/authenticated can't read past
--      RLS even if they somehow get SELECT on the view.
--   2. "Exposed Auth Users" — PostgREST exposes views in `public` to
--      anon/authenticated by default. These views are read via Supabase
--      Studio (postgres / service_role) so we revoke SELECT from the API
--      roles entirely.

-- ── lesson_progress_with_user ────────────────────────────────────────────
ALTER VIEW public.lesson_progress_with_user SET (security_invoker = on);
REVOKE SELECT ON public.lesson_progress_with_user FROM anon, authenticated;

-- ── practice_attempts_with_user ──────────────────────────────────────────
ALTER VIEW public.practice_attempts_with_user SET (security_invoker = on);
REVOKE SELECT ON public.practice_attempts_with_user FROM anon, authenticated;

-- ── support_messages_with_user ───────────────────────────────────────────
ALTER VIEW public.support_messages_with_user SET (security_invoker = on);
REVOKE SELECT ON public.support_messages_with_user FROM anon, authenticated;

-- ── tester_activity_summary ──────────────────────────────────────────────
ALTER VIEW public.tester_activity_summary SET (security_invoker = on);
REVOKE SELECT ON public.tester_activity_summary FROM anon, authenticated;
