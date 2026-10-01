-- Add pre-computed venn diagram geometry to both practice and timed DM tables.
--
-- venn_geometry stores { canvas, shapes, labels } — the resolved coordinates and
-- font sizes output by computeLayout(). Loading this column means the renderer
-- never needs to re-run polygon clipping or label placement at runtime.
--
-- Nullable: non-venn rows leave this null; venn rows are backfilled separately.

-- Practice: option geometry (SELECT venn — one geometry per option diagram)
ALTER TABLE decision_making_question_options
  ADD COLUMN venn_geometry JSONB;

-- Practice: stimulus geometry (INTERPRET venn — single diagram per question)
ALTER TABLE decision_making_questions
  ADD COLUMN venn_geometry JSONB;

-- Timed: option geometry
ALTER TABLE timed_decision_making_question_options
  ADD COLUMN venn_geometry JSONB;

-- Timed: stimulus geometry
ALTER TABLE timed_decision_making_questions
  ADD COLUMN venn_geometry JSONB;
