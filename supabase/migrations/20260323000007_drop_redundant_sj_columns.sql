-- total_questions is always derivable from the test content — score_percent already stored.
-- is_correct is never read back from DB; correctness is recalculated at runtime from
-- selected_answer vs the question's correct_answer.

ALTER TABLE timed_situational_judgement_exam_attempts
  DROP COLUMN total_questions;

ALTER TABLE timed_situational_judgement_question_answers
  DROP COLUMN is_correct;
