-- Move label_set from scenario level to question level for practice SJ,
-- matching the pattern already used for timed SJ questions.

-- Step 1: add column to questions (default 1, will be backfilled)
ALTER TABLE situational_judgement_questions
  ADD COLUMN label_set SMALLINT NOT NULL DEFAULT 1 CHECK (label_set IN (1, 2));

-- Step 2: backfill each question from its parent scenario
UPDATE situational_judgement_questions q
SET label_set = s.label_set
FROM situational_judgement_scenarios s
WHERE q.scenario_id = s.id;

-- Step 3: drop from scenarios — no longer needed there
ALTER TABLE situational_judgement_scenarios
  DROP COLUMN label_set;
