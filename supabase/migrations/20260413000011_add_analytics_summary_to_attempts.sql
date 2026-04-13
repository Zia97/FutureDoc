-- ============================================================
-- Add analytics_summary JSONB column to all 4 timed exam
-- attempts tables. This stores pre-aggregated breakdown data
-- (difficulty, question type/stimulus type/marks, pacing,
-- completion) computed at submission time so the analytics
-- screen can render without joining answer rows.
-- ============================================================

ALTER TABLE timed_verbal_reasoning_exam_attempts
  ADD COLUMN analytics_summary JSONB;

ALTER TABLE timed_decision_making_exam_attempts
  ADD COLUMN analytics_summary JSONB;

ALTER TABLE timed_quantitative_reasoning_exam_attempts
  ADD COLUMN analytics_summary JSONB;

ALTER TABLE timed_situational_judgement_exam_attempts
  ADD COLUMN analytics_summary JSONB;
