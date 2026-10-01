-- ============================================================
-- Verbal Reasoning progress tracking
-- Status: no row = not_attempted | in_progress | completed
-- ============================================================

-- ── 1. Question attempts ────────────────────────────────────
-- One row per (user, question). Re-answering updates the row.
CREATE TABLE verbal_reasoning_question_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES verbal_reasoning_questions(id) ON DELETE CASCADE,
  passage_id      UUID        NOT NULL REFERENCES verbal_reasoning_passages(id) ON DELETE CASCADE,
  selected_answer TEXT        NOT NULL,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_verbal_reasoning_attempts_user_passage ON verbal_reasoning_question_attempts (user_id, passage_id);

-- ── 2. Passage progress ─────────────────────────────────────
-- Absence of a row means the passage has not been attempted.
CREATE TYPE verbal_reasoning_passage_status AS ENUM ('in_progress', 'completed');

CREATE TABLE verbal_reasoning_passage_progress (
  id              UUID                           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  passage_id      UUID                           NOT NULL REFERENCES verbal_reasoning_passages(id) ON DELETE CASCADE,
  status          verbal_reasoning_passage_status NOT NULL DEFAULT 'in_progress',
  answered_count  SMALLINT                       NOT NULL DEFAULT 0,
  total_questions SMALLINT                       NOT NULL,
  updated_at      TIMESTAMPTZ                    NOT NULL DEFAULT now(),
  UNIQUE (user_id, passage_id)
);

CREATE INDEX idx_verbal_reasoning_progress_user ON verbal_reasoning_passage_progress (user_id);

-- ── 3. RLS ──────────────────────────────────────────────────
ALTER TABLE verbal_reasoning_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own attempts"
  ON verbal_reasoning_question_attempts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE verbal_reasoning_passage_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own progress"
  ON verbal_reasoning_passage_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
