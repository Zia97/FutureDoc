-- Statement-based DM question types (syllogism, interpreting_info) now store
-- answer reasoning per statement rather than as a single blob on the question.
-- Make answer_reason nullable so statement-based questions do not require it.
-- MCQ types (logic_puzzle, strongest_argument, probabilistic, venn_diagram)
-- continue to populate this column for their explanation cards.

ALTER TABLE decision_making_questions
  ALTER COLUMN answer_reason DROP NOT NULL;
