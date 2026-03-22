-- Add score columns to timed_situational_judgement_exam_attempts.
-- Computed once at exam submission; read directly on the test list screen.
ALTER TABLE timed_situational_judgement_exam_attempts
  ADD COLUMN correct_count   SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN total_questions SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN score_percent   SMALLINT NOT NULL DEFAULT 0
    CHECK (score_percent BETWEEN 0 AND 100);
