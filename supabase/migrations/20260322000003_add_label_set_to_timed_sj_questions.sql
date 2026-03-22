-- Add label_set to timed questions so mixed-type scenarios are handled correctly.
-- (Some timed scenarios contain both importance and appropriateness items.)
ALTER TABLE timed_situational_judgement_questions
  ADD COLUMN label_set SMALLINT NOT NULL DEFAULT 1 CHECK (label_set IN (1, 2));
