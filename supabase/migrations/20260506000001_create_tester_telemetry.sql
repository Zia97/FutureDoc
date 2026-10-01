-- Tester / user telemetry for the Learning Pathway and practice questions.
--
-- Goal: give admins (service role) visibility into how testers are using the
-- app — which lessons they touched, how long they spent, which practice
-- questions they attempted, and how fast they answered. The latter is the
-- primary anti-rush signal for paid testers.
--
-- Scope: practice-only. Timed-exam telemetry already exists in
--   timed_*_exam_attempts + timed_*_question_answers (which carry time_ms).
--
-- Two tables:
--   lesson_progress             — upserted, one row per (user, lesson_id)
--   practice_question_attempts  — append-only, one row per attempt
--
-- RLS pattern matches question_reports: users can write their own rows and
-- read their own rows (so we can layer cross-device sync later without a
-- new migration). Admin reads happen via service role through the companion
-- `*_with_user` views and the `tester_activity_summary` rollup.

-- ─── lesson_progress ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 'vr' | 'dm' | 'qr' | 'sj' (matches question_reports.section convention)
  section             TEXT NOT NULL CHECK (section IN ('vr', 'dm', 'qr', 'sj')),

  -- Lesson identifier from the app (e.g. 'vr-introduction', 'dm-syllogisms-1').
  -- Lessons live in src/data/learn/, not the DB, so this is intentionally TEXT
  -- with no FK. Already namespaced by section prefix.
  lesson_id           TEXT NOT NULL,

  -- Lifecycle
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,                              -- null while in progress
  last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT now(),       -- heartbeat / last write

  -- Active time the user actually spent in the lesson (excludes idle).
  -- Client accumulates this and ships it on each upsert.
  time_spent_seconds  INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),

  -- Debugging / cohort context
  platform            TEXT,                                     -- 'ios' | 'android' | 'web'
  app_version         TEXT,

  -- Upsert key: one row per user × lesson
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_last_seen
  ON lesson_progress (user_id, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_section
  ON lesson_progress (section);

-- ─── practice_question_attempts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practice_question_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  section         TEXT NOT NULL CHECK (section IN ('vr', 'dm', 'qr', 'sj')),

  -- Practice question id. Lives in one of:
  --   verbal_reasoning_questions, decision_making_questions,
  --   quantitative_reasoning_questions, situational_judgement_questions.
  -- Intentionally NOT a FK (same trick as question_reports.question_id).
  question_id     UUID NOT NULL,

  -- For DM statement-based questions, an attempt is over a single statement.
  -- The app may run multiple statements per question; statement_index lets
  -- each statement be its own row. Null for option-based questions.
  statement_index SMALLINT,

  -- The user's answer. Flexible string so it works for:
  --   'A'..'D'          (option-based DM, QR)
  --   'True'/'False'/'Cant tell' (VR)
  --   'Yes'/'No'        (DM statements, SJ Yes/No questions)
  --   ratings 1..4      (SJ rating questions)
  selected_answer TEXT,

  -- Null when correctness is not gradable client-side (rare, but keep flexible).
  is_correct      BOOLEAN,

  -- Milliseconds for precision — matches the existing *_question_answers.time_ms
  -- columns used by timed exams.
  time_spent_ms   INTEGER NOT NULL CHECK (time_spent_ms >= 0),

  answered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  platform        TEXT,
  app_version     TEXT
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_answered
  ON practice_question_attempts (user_id, answered_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_section
  ON practice_question_attempts (user_id, section);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_question
  ON practice_question_attempts (question_id, section);

-- ─── RLS — lesson_progress ───────────────────────────────────────────────────
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own lesson progress" ON lesson_progress;
CREATE POLICY "Users read own lesson progress"
  ON lesson_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own lesson progress" ON lesson_progress;
CREATE POLICY "Users insert own lesson progress"
  ON lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own lesson progress" ON lesson_progress;
CREATE POLICY "Users update own lesson progress"
  ON lesson_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- No DELETE policy — users cannot wipe their telemetry. Service role still can.

-- ─── RLS — practice_question_attempts ────────────────────────────────────────
ALTER TABLE practice_question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own practice attempts" ON practice_question_attempts;
CREATE POLICY "Users read own practice attempts"
  ON practice_question_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own practice attempts" ON practice_question_attempts;
CREATE POLICY "Users insert own practice attempts"
  ON practice_question_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE / DELETE policies — append-only from the client.

-- ─── Admin views (read via service role / Supabase dashboard) ────────────────

-- Lesson progress enriched with reporter email + active-time ratio.
-- active_pct = time_spent_seconds / wallclock_seconds. A low ratio on a
-- "completed" lesson is a strong rush signal (e.g. opened, walked away,
-- marked done) provided you also see a normal time_spent value elsewhere.
CREATE OR REPLACE VIEW lesson_progress_with_user AS
SELECT
  lp.id,
  lp.user_id,
  u.email                                 AS user_email,
  lp.section,
  lp.lesson_id,
  lp.started_at,
  lp.completed_at,
  lp.last_seen_at,
  lp.time_spent_seconds,
  CASE
    WHEN lp.completed_at IS NOT NULL
      THEN GREATEST(EXTRACT(EPOCH FROM (lp.completed_at - lp.started_at))::INT, 0)
  END                                     AS wallclock_seconds,
  lp.platform,
  lp.app_version
FROM lesson_progress lp
LEFT JOIN auth.users u ON u.id = lp.user_id
ORDER BY lp.last_seen_at DESC;

-- Practice attempts enriched with reporter email.
CREATE OR REPLACE VIEW practice_attempts_with_user AS
SELECT
  pqa.id,
  pqa.user_id,
  u.email                  AS user_email,
  pqa.section,
  pqa.question_id,
  pqa.statement_index,
  pqa.selected_answer,
  pqa.is_correct,
  pqa.time_spent_ms,
  pqa.answered_at,
  pqa.platform,
  pqa.app_version
FROM practice_question_attempts pqa
LEFT JOIN auth.users u ON u.id = pqa.user_id
ORDER BY pqa.answered_at DESC;

-- One-row-per-user rollup for the tester-monitoring dashboard.
-- `rushed_attempts_under_5s` is the headline anti-rush signal — anything
-- north of ~30% of total attempts means they're spamming options.
CREATE OR REPLACE VIEW tester_activity_summary AS
SELECT
  u.id                                                                          AS user_id,
  u.email,
  u.created_at                                                                  AS signed_up_at,
  u.last_sign_in_at,

  -- Lessons
  COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed_at IS NOT NULL)        AS lessons_completed,
  COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed_at IS NULL)            AS lessons_in_progress,
  COALESCE(SUM(lp.time_spent_seconds), 0)                                        AS total_lesson_seconds,

  -- Practice (subqueries to avoid double-counting from the lesson_progress join)
  (SELECT COUNT(*)
     FROM practice_question_attempts
     WHERE user_id = u.id)                                                       AS practice_attempts,

  (SELECT ROUND(AVG(time_spent_ms) / 1000.0, 1)
     FROM practice_question_attempts
     WHERE user_id = u.id)                                                       AS avg_practice_seconds,

  (SELECT ROUND(100.0 * AVG(CASE WHEN is_correct THEN 1 ELSE 0 END), 1)
     FROM practice_question_attempts
     WHERE user_id = u.id AND is_correct IS NOT NULL)                            AS practice_accuracy_pct,

  (SELECT COUNT(*)
     FROM practice_question_attempts
     WHERE user_id = u.id AND time_spent_ms < 5000)                              AS rushed_attempts_under_5s,

  (SELECT MAX(answered_at)
     FROM practice_question_attempts
     WHERE user_id = u.id)                                                       AS last_practice_at

FROM auth.users u
LEFT JOIN lesson_progress lp ON lp.user_id = u.id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at
ORDER BY u.created_at DESC;
