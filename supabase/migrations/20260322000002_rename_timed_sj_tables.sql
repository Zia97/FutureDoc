-- Drop old timed SJT tables (questions first due to FK dependency)
DROP TABLE IF EXISTS timed_sj_questions;
DROP TABLE IF EXISTS timed_sj_scenarios;

-- Timed test SJT scenarios (full name)
CREATE TABLE timed_situational_judgement_scenarios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     SMALLINT    NOT NULL,
  label_set   SMALLINT    NOT NULL CHECK (label_set IN (1, 2)),
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_sj_scenarios_test_id ON timed_situational_judgement_scenarios (test_id);

-- Timed test SJT questions (full name)
CREATE TABLE timed_situational_judgement_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id    UUID        NOT NULL REFERENCES timed_situational_judgement_scenarios(id) ON DELETE CASCADE,
  question_text  TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_sj_questions_scenario_id ON timed_situational_judgement_questions (scenario_id);
