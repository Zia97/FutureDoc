-- Per-question time tracking for VR timed exam answers.
--
-- Stored as milliseconds for precision; analytics buckets into seconds
-- (e.g. <15s rushed / 15–30s considered / >30s slow).
--
-- Nullable: prior attempts were submitted without timing data, so we
-- can't backfill them. Analytics treats NULL as "no data" and excludes
-- the row from time-based breakdowns.
--
-- Tracking semantics (client-side, src/hooks/ui/useQuestionTimeTracker.js):
--   • Accumulates time the user is actively viewing a given question.
--   • Pauses while the test timer is paused or the app is backgrounded.
--   • Adds across revisits — going back to a question increases its total.

ALTER TABLE timed_verbal_reasoning_question_answers
  ADD COLUMN time_ms INT;
