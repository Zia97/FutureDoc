-- VR passages — UUID preserved from questions.json
CREATE TABLE verbal_reasoning_passages (
  id          UUID        PRIMARY KEY,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VR questions — UUID preserved from questions.json
CREATE TABLE verbal_reasoning_questions (
  id             UUID        PRIMARY KEY,
  passage_id     UUID        NOT NULL REFERENCES verbal_reasoning_passages(id) ON DELETE CASCADE,
  question_text  TEXT        NOT NULL,
  options        TEXT[]      NOT NULL,  -- ordered array e.g. {"True","False","Can't tell"}
  correct_answer TEXT        NOT NULL,  -- matches one value in options[]
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vr_questions_passage_id ON verbal_reasoning_questions (passage_id);

ALTER TABLE verbal_reasoning_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON verbal_reasoning_passages FOR SELECT USING (true);

ALTER TABLE verbal_reasoning_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON verbal_reasoning_questions FOR SELECT USING (true);
