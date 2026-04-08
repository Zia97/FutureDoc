-- Question Reports
-- Lets users flag questions they think are wrong, ambiguous, or broken.
-- The question_id is intentionally NOT a foreign key — it can reference
-- ids in any of: decision_making_questions, quantitative_reasoning_*,
-- situational_judgement_*, verbal_reasoning_*, or their timed_* equivalents.
-- The (question_id, section) pair is the logical key for triage.

CREATE TABLE IF NOT EXISTS question_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was reported
  question_id     UUID NOT NULL,
  section         TEXT NOT NULL CHECK (section IN ('dm', 'qr', 'sj', 'vr')),
  test_id         INTEGER,                 -- nullable: only set for timed-test reports
  is_timed        BOOLEAN NOT NULL DEFAULT FALSE,

  -- Who reported it (FK to auth.users so we can join for email/contact info).
  -- ON DELETE SET NULL keeps the report row alive even if the user deletes
  -- their account — useful for question-quality stats.
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Why
  reasons         TEXT[] NOT NULL DEFAULT '{}',
  comment         TEXT,

  -- Triage workflow (for the team, not the user)
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'reviewing', 'fixed', 'dismissed')),
  reviewed_at     TIMESTAMPTZ,
  reviewer_notes  TEXT,

  -- Debugging context
  platform        TEXT,                    -- 'ios' | 'android' | 'web'
  app_version     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_section     ON question_reports(section);
CREATE INDEX IF NOT EXISTS idx_question_reports_status      ON question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_created_at  ON question_reports(created_at DESC);

-- ── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- Any user (signed-in or anonymous) may submit a report.
-- If they're signed in, the row's user_id must match auth.uid().
DROP POLICY IF EXISTS "Anyone can submit reports" ON question_reports;
CREATE POLICY "Anyone can submit reports"
  ON question_reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- No SELECT/UPDATE/DELETE policies → only the service role (Supabase dashboard,
-- SQL editor, server-side) can read or triage reports. This is intentional.

-- ── Triage helper view ──────────────────────────────────────────────────────
-- Aggregates reports per question so you can quickly see the worst offenders
-- in the Supabase Table Editor. Open `question_report_summary` and sort by
-- `open_reports` DESC.
CREATE OR REPLACE VIEW question_report_summary AS
WITH unrolled AS (
  SELECT
    id,
    question_id,
    section,
    status,
    created_at,
    unnest(
      CASE WHEN cardinality(reasons) = 0 THEN ARRAY['(none)']::TEXT[] ELSE reasons END
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

-- ── Reports joined with reporter contact info ───────────────────────────────
-- One row per report, enriched with the reporter's email so you can reply.
-- Read this in the Supabase Table Editor when you want to triage individual
-- reports and contact the person who flagged the question.
CREATE OR REPLACE VIEW question_reports_with_user AS
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
  u.email          AS user_email,
  u.last_sign_in_at AS user_last_sign_in,
  u.created_at      AS user_signed_up_at
FROM question_reports r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.created_at DESC;
