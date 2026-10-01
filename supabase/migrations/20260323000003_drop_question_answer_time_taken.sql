-- Remove time_taken_seconds from question answers — not reliably measurable in-app.
ALTER TABLE timed_situational_judgement_question_answers
  DROP COLUMN time_taken_seconds;
