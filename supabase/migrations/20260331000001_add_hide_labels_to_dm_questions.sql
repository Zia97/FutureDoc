-- Add hide_labels flag for unlabelled Venn diagram questions.
-- When true, the VennDiagramKey (shape legend) is not shown,
-- forcing the student to deduce which shape represents which category.

ALTER TABLE timed_decision_making_questions
  ADD COLUMN hide_labels BOOLEAN NOT NULL DEFAULT false;
