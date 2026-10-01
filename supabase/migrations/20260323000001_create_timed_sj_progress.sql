-- ============================================================
-- Timed Situational Judgement exam progress tracking
-- Answers are written in bulk on exam submission and are
-- immutable afterwards (no UPDATE policy). Users may delete
-- their own progress to reset.
-- ============================================================

-- ── 1. Exam attempts ────────────────────────────────────────
-- One row per (user, test_id). Absence = not yet submitted.
-- Created once when the student ends the exam.
CREATE TABLE timed_situational_judgement_exam_attempts (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id             SMALLINT    NOT NULL,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds  INT,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_situational_judgement_exam_attempts_user ON timed_situational_judgement_exam_attempts (user_id);

-- ── 2. Question answers ─────────────────────────────────────
-- One row per question per attempt. Written in bulk at submission.
-- is_correct is computed at write time to avoid re-joining content
-- tables on every results screen load.
CREATE TABLE timed_situational_judgement_question_answers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID        NOT NULL REFERENCES timed_situational_judgement_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES timed_situational_judgement_questions(id) ON DELETE CASCADE,
  scenario_id     UUID        NOT NULL REFERENCES timed_situational_judgement_scenarios(id) ON DELETE CASCADE,
  selected_answer    TEXT        NOT NULL,
  is_correct         BOOLEAN     NOT NULL,
  time_taken_seconds SMALLINT    NOT NULL,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_situational_judgement_answers_attempt ON timed_situational_judgement_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_situational_judgement_answers_user    ON timed_situational_judgement_question_answers (user_id);

-- ── 3. RLS ──────────────────────────────────────────────────
-- No UPDATE policy on either table — answers are locked after submission.

ALTER TABLE timed_situational_judgement_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own exam attempts"
  ON timed_situational_judgement_exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own exam attempts"
  ON timed_situational_judgement_exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own exam attempts"
  ON timed_situational_judgement_exam_attempts FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE timed_situational_judgement_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own question answers"
  ON timed_situational_judgement_question_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own question answers"
  ON timed_situational_judgement_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own question answers"
  ON timed_situational_judgement_question_answers FOR DELETE
  USING (auth.uid() = user_id);
