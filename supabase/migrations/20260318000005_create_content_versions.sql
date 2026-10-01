CREATE TABLE content_versions (
  section     TEXT        PRIMARY KEY,
  version     INTEGER     NOT NULL DEFAULT 1,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO content_versions (section, version) VALUES
  ('verbal_reasoning', 1),
  ('decision_making', 1),
  ('quantitative_reasoning', 1),
  ('situational_judgement', 1);
