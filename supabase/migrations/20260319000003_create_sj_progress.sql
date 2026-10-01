-- ============================================================
-- Situational Judgement progress tracking
-- Status: no row = not_attempted | in_progress | completed
-- ============================================================

CREATE TABLE situational_judgement_question_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID        NOT NULL REFERENCES situational_judgement_questions(id) ON DELETE CASCADE,
  scenario_id     UUID        NOT NULL REFERENCES situational_judgement_scenarios(id) ON DELETE CASCADE,
  selected_answer TEXT        NOT NULL,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX idx_sj_attempts_user_scenario ON situational_judgement_question_attempts (user_id, scenario_id);

CREATE TYPE situational_judgement_scenario_status AS ENUM ('in_progress', 'completed');

CREATE TABLE situational_judgement_scenario_progress (
  id              UUID                                 PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID                                 NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id     UUID                                 NOT NULL REFERENCES situational_judgement_scenarios(id) ON DELETE CASCADE,
  status          situational_judgement_scenario_status NOT NULL DEFAULT 'in_progress',
  answered_count  SMALLINT                             NOT NULL DEFAULT 0,
  total_questions SMALLINT                             NOT NULL,
  updated_at      TIMESTAMPTZ                          NOT NULL DEFAULT now(),
  UNIQUE (user_id, scenario_id)
);

CREATE INDEX idx_sj_scenario_progress_user ON situational_judgement_scenario_progress (user_id);

ALTER TABLE situational_judgement_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own attempts"
  ON situational_judgement_question_attempts
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE situational_judgement_scenario_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own progress"
  ON situational_judgement_scenario_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
