-- Add hide_labels flag to practice DM questions table (mirrors timed table).
-- When true, the VennDiagramKey (shape legend) is not shown.

ALTER TABLE decision_making_questions
  ADD COLUMN hide_labels BOOLEAN NOT NULL DEFAULT false;
