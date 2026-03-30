-- Add difficulty column to all question tables
-- Values: 'normal' (default) or 'hard'

-- Untimed practice questions
ALTER TABLE verbal_reasoning_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

ALTER TABLE decision_making_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

ALTER TABLE situational_judgement_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

ALTER TABLE quantitative_reasoning_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

-- Timed test questions
ALTER TABLE timed_verbal_reasoning_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

ALTER TABLE timed_decision_making_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));

ALTER TABLE timed_situational_judgement_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));
