-- Add per-statement answer reasoning for syllogism and interpreting_info questions.
-- Nullable so existing rows are not broken; populated via seed updates.
ALTER TABLE decision_making_question_statements
  ADD COLUMN answer_reason TEXT;
