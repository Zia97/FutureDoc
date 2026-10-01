-- Timed test SJT scenarios
-- Mirrors situational_judgement_scenarios with an added test_id column
-- to identify which timed test a scenario belongs to (e.g. 1, 2, 3...)
CREATE TABLE timed_sj_scenarios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     SMALLINT    NOT NULL,
  label_set   SMALLINT    NOT NULL CHECK (label_set IN (1, 2)),
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_sj_scenarios_test_id ON timed_sj_scenarios (test_id);

-- Timed test SJT questions — one row per item within a scenario
-- Mirrors situational_judgement_questions, referencing timed_sj_scenarios
CREATE TABLE timed_sj_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id    UUID        NOT NULL REFERENCES timed_sj_scenarios(id) ON DELETE CASCADE,
  question_text  TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_sj_questions_scenario_id ON timed_sj_questions (scenario_id);
