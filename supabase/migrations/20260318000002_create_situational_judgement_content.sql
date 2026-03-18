-- SJT scenarios
-- label_set determines the fixed answer options shown in the UI:
--   1 = "Very important" / "Important" / "Of minor importance" / "Not important at all"
--   2 = "A very appropriate thing to do" / "Appropriate, but not ideal" /
--       "Inappropriate, but not awful" / "A very inappropriate thing to do"
-- Options are not stored per question — they are fixed per label_set and handled in the app.
CREATE TABLE situational_judgement_scenarios (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label_set   SMALLINT    NOT NULL CHECK (label_set IN (1, 2)),
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SJT questions — one row per item within a scenario
CREATE TABLE situational_judgement_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id    UUID        NOT NULL REFERENCES situational_judgement_scenarios(id) ON DELETE CASCADE,
  question_text  TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,  -- e.g. "Very important", "A very appropriate thing to do"
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sjt_questions_scenario_id ON situational_judgement_questions (scenario_id);
