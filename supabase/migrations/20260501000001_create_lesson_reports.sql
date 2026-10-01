-- Lesson Reports
-- Lets users flag inaccurate, unclear, or broken lesson content.

-- New question reports must include comments. NOT VALID preserves any older
-- rows that were submitted before comments became required.
ALTER TABLE question_reports
  DROP CONSTRAINT IF EXISTS question_reports_comment_required;

ALTER TABLE question_reports
  ADD CONSTRAINT question_reports_comment_required
  CHECK (comment IS NOT NULL AND length(btrim(comment)) > 0) NOT VALID;

CREATE TABLE IF NOT EXISTS lesson_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was reported
  lesson_id       TEXT NOT NULL,
  lesson_title    TEXT,
  section         TEXT NOT NULL CHECK (section IN ('dm', 'qr', 'sj', 'vr')),

  -- Who reported it
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Why
  reasons         TEXT[] NOT NULL DEFAULT '{}',
  comment         TEXT NOT NULL CHECK (length(btrim(comment)) > 0),

  -- Triage workflow
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'reviewing', 'fixed', 'dismissed')),
  reviewed_at     TIMESTAMPTZ,
  reviewer_notes  TEXT,

  -- Debugging context
  platform        TEXT,
  app_version     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_reports_lesson_id  ON lesson_reports(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_section    ON lesson_reports(section);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_status     ON lesson_reports(status);
CREATE INDEX IF NOT EXISTS idx_lesson_reports_created_at ON lesson_reports(created_at DESC);

ALTER TABLE lesson_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit lesson reports" ON lesson_reports;
CREATE POLICY "Anyone can submit lesson reports"
  ON lesson_reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- No SELECT/UPDATE/DELETE policies: only service role/admin paths can triage.

CREATE OR REPLACE VIEW lesson_report_summary AS
WITH unrolled AS (
  SELECT
    id,
    lesson_id,
    lesson_title,
    section,
    status,
    created_at,
    unnest(
      CASE WHEN cardinality(reasons) = 0 THEN ARRAY['(none)']::TEXT[] ELSE reasons END
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

CREATE OR REPLACE VIEW lesson_reports_with_user AS
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
  u.email            AS user_email,
  u.last_sign_in_at  AS user_last_sign_in,
  u.created_at       AS user_signed_up_at
FROM lesson_reports r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.created_at DESC;
