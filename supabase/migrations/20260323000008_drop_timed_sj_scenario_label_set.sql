-- label_set was added to timed_situational_judgement_questions in 20260322000003,
-- making the scenario-level column redundant. All code now reads label_set from
-- the question row directly.
ALTER TABLE timed_situational_judgement_scenarios
  DROP COLUMN label_set;
