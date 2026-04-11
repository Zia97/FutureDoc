-- Per-question time tracking for QR timed exam answers.
--
-- Mirrors the column added for VR in 20260411000002. Stored as
-- milliseconds for precision; analytics aggregates into average
-- seconds per question.
--
-- Nullable: prior attempts were submitted without timing data, so we
-- can't backfill them. Analytics treats NULL as "no data" and excludes
-- the row from time-based breakdowns.
--
-- Tracking semantics are identical to VR — see
-- src/hooks/ui/useQuestionTimeTracker.js.

ALTER TABLE timed_quantitative_reasoning_question_answers
  ADD COLUMN time_ms INT;
