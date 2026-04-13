-- Per-question time tracking for DM timed exam answers.
--
-- Mirrors the column added for VR in 20260411000002 and QR in
-- 20260411000003. Stored as milliseconds for precision; analytics
-- aggregates into average seconds per question.
--
-- Nullable: prior attempts were submitted without timing data, so we
-- can't backfill them. Analytics treats NULL as "no data" and excludes
-- the row from time-based breakdowns.

ALTER TABLE timed_decision_making_question_answers
  ADD COLUMN time_ms INT;
