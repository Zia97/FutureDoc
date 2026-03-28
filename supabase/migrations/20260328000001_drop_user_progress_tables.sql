-- Drop all user answer/progress tables and related enum types.
-- Children (answer rows) first, then parent attempts/progress, then enums.

-- 1. Timed exam question answers
DROP TABLE IF EXISTS timed_situational_judgement_question_answers CASCADE;
DROP TABLE IF EXISTS timed_verbal_reasoning_question_answers CASCADE;
DROP TABLE IF EXISTS timed_decision_making_question_answers CASCADE;

-- 2. Timed exam attempts
DROP TABLE IF EXISTS timed_situational_judgement_exam_attempts CASCADE;
DROP TABLE IF EXISTS timed_verbal_reasoning_exam_attempts CASCADE;
DROP TABLE IF EXISTS timed_decision_making_exam_attempts CASCADE;

-- 3. Practice-mode passage/set/scenario progress
DROP TABLE IF EXISTS verbal_reasoning_passage_progress CASCADE;
DROP TABLE IF EXISTS quantitative_reasoning_set_progress CASCADE;
DROP TABLE IF EXISTS situational_judgement_scenario_progress CASCADE;

-- 4. Practice-mode question attempts
DROP TABLE IF EXISTS verbal_reasoning_question_attempts CASCADE;
DROP TABLE IF EXISTS quantitative_reasoning_question_attempts CASCADE;
DROP TABLE IF EXISTS situational_judgement_question_attempts CASCADE;
DROP TABLE IF EXISTS decision_making_question_attempts CASCADE;

-- 5. Enum types
DROP TYPE IF EXISTS verbal_reasoning_passage_status CASCADE;
DROP TYPE IF EXISTS quantitative_reasoning_set_status CASCADE;
DROP TYPE IF EXISTS situational_judgement_scenario_status CASCADE;
