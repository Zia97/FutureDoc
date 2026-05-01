-- ============================================================
-- Security hardening
--
-- Closes four issues found in the pre-launch security audit:
--
--   #1 user_profiles privilege escalation
--      The "users own profile" policy let any authenticated user
--      UPDATE their own row, including is_premium / is_admin /
--      ai_banned. A trigger now snaps those columns back to their
--      previous values unless the writer is the service role.
--
--   #3 Atomic AI usage increment
--      Replaces the SELECT-then-UPSERT pattern in the ai-tutor
--      edge function with a single SQL operation that increments
--      and returns the new lifetime_count, refusing the increment
--      when the cap is hit.
--
--   #4 Reporter email leak
--      Moves the *_with_user / *_summary views out of the public
--      schema (where PostgREST auto-exposes them) into a private
--      "admin" schema only the service role can read.
--
--   #5 Premium content RLS gate
--      Replaces "anyone can read all questions" with "free rows
--      are public; paid rows require is_premium or is_admin".
-- ============================================================


-- ─── #1: Lock down is_premium / is_admin / ai_banned ─────────
--
-- Trigger-based approach: keeps the existing user-write path
-- working for display_name (and any future user-editable
-- column) but freezes the privileged columns to whatever the
-- service role last set them to.

CREATE OR REPLACE FUNCTION public.user_profiles_protect_privileged_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Service role bypasses the trigger entirely (RevenueCat
  -- webhook, Studio, admin tooling).
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  NEW.is_premium := OLD.is_premium;
  NEW.is_admin   := OLD.is_admin;
  NEW.ai_banned  := OLD.ai_banned;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_profiles_protect_privileged_columns
  ON public.user_profiles;

CREATE TRIGGER user_profiles_protect_privileged_columns
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.user_profiles_protect_privileged_columns();


-- ─── #3: Atomic AI usage increment RPC ───────────────────────
--
-- Returns -1 when the cap is hit, otherwise the new lifetime_count.
-- The edge function should call this instead of read-then-upsert.

CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id    UUID,
  p_limit      INT,
  p_unlimited  BOOLEAN
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INT;
BEGIN
  IF p_unlimited THEN
    INSERT INTO user_ai_usage (user_id, lifetime_count, daily_count, daily_reset_at)
    VALUES (p_user_id, 1, 1, current_date)
    ON CONFLICT (user_id) DO UPDATE
      SET lifetime_count = user_ai_usage.lifetime_count + 1,
          daily_count    = user_ai_usage.daily_count + 1
    RETURNING lifetime_count INTO new_count;
    RETURN new_count;
  END IF;

  INSERT INTO user_ai_usage (user_id, lifetime_count, daily_count, daily_reset_at)
  VALUES (p_user_id, 1, 0, current_date)
  ON CONFLICT (user_id) DO UPDATE
    SET lifetime_count = user_ai_usage.lifetime_count + 1
    WHERE user_ai_usage.lifetime_count < p_limit
  RETURNING lifetime_count INTO new_count;

  IF new_count IS NULL THEN
    RETURN -1;
  END IF;
  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_ai_usage(UUID, INT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(UUID, INT, BOOLEAN) TO service_role;


-- ─── #4: Move report-triage views to private admin schema ────
--
-- PostgREST only exposes objects in schemas listed in the
-- project's exposed-schemas setting. By moving these views into
-- "admin" we make them invisible to anon/authenticated tokens
-- while staying queryable from Supabase Studio (which connects
-- as the postgres role).

CREATE SCHEMA IF NOT EXISTS admin;

DROP VIEW IF EXISTS public.question_reports_with_user;
DROP VIEW IF EXISTS public.question_report_summary;
DROP VIEW IF EXISTS public.lesson_reports_with_user;
DROP VIEW IF EXISTS public.lesson_report_summary;

CREATE VIEW admin.question_reports_with_user AS
SELECT
  r.id,
  r.created_at,
  r.status,
  r.section,
  r.is_timed,
  r.test_id,
  r.question_id,
  r.reasons,
  r.comment,
  r.reviewed_at,
  r.reviewer_notes,
  r.platform,
  r.user_id,
  u.email           AS user_email,
  u.last_sign_in_at AS user_last_sign_in,
  u.created_at      AS user_signed_up_at
FROM question_reports r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.created_at DESC;

CREATE VIEW admin.question_report_summary AS
WITH unrolled AS (
  SELECT
    id, question_id, section, status, created_at,
    unnest(
      CASE WHEN cardinality(reasons) = 0
           THEN ARRAY['(none)']::TEXT[]
           ELSE reasons END
    ) AS reason
  FROM question_reports
)
SELECT
  question_id,
  section,
  COUNT(DISTINCT id) AS total_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'new')        AS open_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'reviewing')  AS reviewing_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'fixed')      AS fixed_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'dismissed')  AS dismissed_reports,
  array_agg(DISTINCT reason) AS reasons_seen,
  MAX(created_at) AS last_reported_at
FROM unrolled
GROUP BY question_id, section
ORDER BY open_reports DESC, total_reports DESC;

CREATE VIEW admin.lesson_reports_with_user AS
SELECT
  r.id,
  r.created_at,
  r.status,
  r.section,
  r.lesson_id,
  r.lesson_title,
  r.reasons,
  r.comment,
  r.reviewed_at,
  r.reviewer_notes,
  r.platform,
  r.user_id,
  u.email           AS user_email,
  u.last_sign_in_at AS user_last_sign_in,
  u.created_at      AS user_signed_up_at
FROM lesson_reports r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.created_at DESC;

CREATE VIEW admin.lesson_report_summary AS
WITH unrolled AS (
  SELECT
    id, lesson_id, lesson_title, section, status, created_at,
    unnest(
      CASE WHEN cardinality(reasons) = 0
           THEN ARRAY['(none)']::TEXT[]
           ELSE reasons END
    ) AS reason
  FROM lesson_reports
)
SELECT
  lesson_id,
  MAX(lesson_title) AS lesson_title,
  section,
  COUNT(DISTINCT id) AS total_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'new')        AS open_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'reviewing')  AS reviewing_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'fixed')      AS fixed_reports,
  COUNT(DISTINCT id) FILTER (WHERE status = 'dismissed')  AS dismissed_reports,
  array_agg(DISTINCT reason) AS reasons_seen,
  MAX(created_at) AS last_reported_at
FROM unrolled
GROUP BY lesson_id, section
ORDER BY open_reports DESC, total_reports DESC;

REVOKE ALL ON SCHEMA admin FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA admin FROM PUBLIC, anon, authenticated;


-- ─── #5: Premium content RLS gate ────────────────────────────
--
-- Replaces the "public_read" policy on every gated content
-- table with a policy that lets free rows through to anyone but
-- requires a premium / admin profile for paid rows. Tables
-- without an is_free column (passages/scenarios/sets that
-- inherit the gate from their parent test) are read through
-- their parent's policy via the embedded select, so they keep
-- the open public_read policy.

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
    EXECUTE format('DROP POLICY IF EXISTS "public_read" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "free_or_premium_read" ON public.%I
         FOR SELECT TO anon, authenticated
         USING (
           is_free = true
           OR EXISTS (
             SELECT 1 FROM public.user_profiles p
             WHERE p.user_id = auth.uid()
               AND (p.is_premium = true OR p.is_admin = true)
           )
         )',
      t
    );
  END LOOP;
END$$;
