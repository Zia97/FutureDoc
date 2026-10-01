-- Step 1: Add the new enum value.
-- This must be in its own transaction — PostgreSQL cannot use a newly added
-- enum value within the same transaction that created it.
ALTER TYPE dm_question_type ADD VALUE IF NOT EXISTS 'recognising_assumptions';
