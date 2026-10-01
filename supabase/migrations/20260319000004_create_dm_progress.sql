-- ============================================================
-- Decision Making progress tracking
-- DM questions are standalone (no parent grouping).
-- answer is JSONB to handle both MCQ (string) and Yes/No (object).
-- ============================================================

CREATE TABLE decision_making_question_attempts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id  UUID        NOT NULL REFERENCES decision_making_questions(id) ON DELETE CASCADE,
  answer       JSONB       NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_dm_attempts_user ON decision_making_question_attempts (user_id);

ALTER TABLE decision_making_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own attempts"
  ON decision_making_question_attempts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
