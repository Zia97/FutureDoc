-- ============================================================
-- Revert the premium-content RLS gate added in
-- 20260501000002_security_hardening.sql (#5).
--
-- Reason: the gate hid every row from anon and free-tier users
-- because no content has is_free = true. The product intent is
-- the opposite — free users should *see* premium questions
-- (with a lock) so they're prompted to subscribe. Premium
-- enforcement is handled client-side. Re-opens public read on
-- all gated tables.
-- ============================================================

DO $$
DECLARE
  t TEXT;
  gated_tables TEXT[] := ARRAY[
    'verbal_reasoning_passages',
    'decision_making_questions',
    'quantitative_reasoning_sets',
    'situational_judgement_scenarios',
    'timed_verbal_reasoning_tests',
    'timed_decision_making_tests',
    'timed_quantitative_reasoning_tests',
    'timed_situational_judgement_tests'
  ];
BEGIN
  FOREACH t IN ARRAY gated_tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS "free_or_premium_read" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_read" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "public_read" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
      t
    );
  END LOOP;
END$$;
