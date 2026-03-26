-- ============================================================
-- Timed Decision Making exam progress tracking
-- Answers are written in bulk on exam submission and are
-- immutable afterwards (no UPDATE policy). Users may delete
-- their own progress to reset.
-- ============================================================

-- ── 1. Exam attempts ────────────────────────────────────────
-- One row per (user, test_id). Absence = not yet submitted.
CREATE TABLE timed_decision_making_exam_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id            SMALLINT    NOT NULL REFERENCES timed_decision_making_tests(id) ON DELETE CASCADE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INT,
  correct_count      SMALLINT    NOT NULL DEFAULT 0,
  score_percent      SMALLINT    NOT NULL DEFAULT 0,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_dm_exam_attempts_user ON timed_decision_making_exam_attempts (user_id);

-- ── 2. Question answers ─────────────────────────────────────
-- One row per question per attempt. Written in bulk at submission.
-- selected_answer is JSONB to support both MCQ (string) and
-- statement-based (object mapping index → "Yes"/"No") answer types.
CREATE TABLE timed_decision_making_question_answers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID        NOT NULL REFERENCES timed_decision_making_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES timed_decision_making_questions(id) ON DELETE CASCADE,
  selected_answer JSONB       NOT NULL,
  is_correct      BOOLEAN     NOT NULL DEFAULT false,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_dm_answers_attempt ON timed_decision_making_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_dm_answers_user    ON timed_decision_making_question_answers (user_id);

-- ── 3. RLS ──────────────────────────────────────────────────
ALTER TABLE timed_decision_making_exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own dm exam attempts"
  ON timed_decision_making_exam_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own dm exam attempts"
  ON timed_decision_making_exam_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own dm exam attempts"
  ON timed_decision_making_exam_attempts FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE timed_decision_making_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own dm question answers"
  ON timed_decision_making_question_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own dm question answers"
  ON timed_decision_making_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own dm question answers"
  ON timed_decision_making_question_answers FOR DELETE
  USING (auth.uid() = user_id);
