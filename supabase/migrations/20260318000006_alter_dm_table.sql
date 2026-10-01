ALTER TYPE dm_question_type ADD VALUE 'probabilistic';

ALTER TABLE decision_making_questions ADD COLUMN stimulus_diagram JSONB;
