-- Add the difficulty column to timed_quantitative_reasoning_questions.
--
-- Background: 20260330000001_add_difficulty_to_questions.sql added a
-- 'difficulty' column to all question tables that existed at the time
-- (VR, DM, SJ — both practice and timed — and the practice QR table).
-- Timed QR was created later in 20260405000001_create_timed_qr_content.sql
-- and was never backfilled. The QR analytics query reads this column to
-- power the "Accuracy by difficulty" card; without it, the analytics
-- screen fails with `42703 column ... does not exist`.

ALTER TABLE timed_quantitative_reasoning_questions
  ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'normal'
  CHECK (difficulty IN ('normal', 'hard'));
