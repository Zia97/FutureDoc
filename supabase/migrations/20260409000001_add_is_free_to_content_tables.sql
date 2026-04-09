-- ============================================================
-- Add is_free column to timed test and practice question tables
-- Default is false (premium). Mark specific rows as free manually.
-- ============================================================

-- ── Timed test tables ────────────────────────────────────────
ALTER TABLE timed_verbal_reasoning_tests
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE timed_decision_making_tests
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE timed_quantitative_reasoning_tests
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE timed_situational_judgement_tests
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

-- ── Practice question parent tables ──────────────────────────
-- VR: gate at passage level (each passage has multiple questions)
ALTER TABLE verbal_reasoning_passages
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

-- DM: gate at question level (flat questions)
ALTER TABLE decision_making_questions
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

-- QR: gate at set level (each set has multiple questions)
ALTER TABLE quantitative_reasoning_sets
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;

-- SJ: gate at scenario level (each scenario has multiple questions)
ALTER TABLE situational_judgement_scenarios
  ADD COLUMN is_free BOOLEAN NOT NULL DEFAULT false;
