-- Step 2: Update all existing questions to use the new enum value.
-- Runs in a separate transaction after the enum value was added in the prior migration.
UPDATE timed_decision_making_questions
SET type = 'recognising_assumptions'
WHERE type = 'strongest_argument';
