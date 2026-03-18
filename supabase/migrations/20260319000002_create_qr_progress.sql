-- ============================================================
-- Quantitative Reasoning progress tracking
-- Status: no row = not_attempted | in_progress | completed
-- ============================================================

CREATE TABLE quantitative_reasoning_question_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES quantitative_reasoning_questions(id) ON DELETE CASCADE,
  set_id          UUID        NOT NULL REFERENCES quantitative_reasoning_sets(id) ON DELETE CASCADE,
  selected_answer TEXT        NOT NULL,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_qr_attempts_user_set ON quantitative_reasoning_question_attempts (user_id, set_id);

CREATE TYPE quantitative_reasoning_set_status AS ENUM ('in_progress', 'completed');

CREATE TABLE quantitative_reasoning_set_progress (
  id              UUID                              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  set_id          UUID                              NOT NULL REFERENCES quantitative_reasoning_sets(id) ON DELETE CASCADE,
  status          quantitative_reasoning_set_status NOT NULL DEFAULT 'in_progress',
  answered_count  SMALLINT                          NOT NULL DEFAULT 0,
  total_questions SMALLINT                          NOT NULL,
  updated_at      TIMESTAMPTZ                       NOT NULL DEFAULT now(),
  UNIQUE (user_id, set_id)
);

CREATE INDEX idx_qr_set_progress_user ON quantitative_reasoning_set_progress (user_id);

ALTER TABLE quantitative_reasoning_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own attempts"
  ON quantitative_reasoning_question_attempts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE quantitative_reasoning_set_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own progress"
  ON quantitative_reasoning_set_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
