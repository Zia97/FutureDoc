-- QR sets — each set has one stimulus (chart, table, graph etc.) and multiple questions
-- stimulus is stored as JSONB because it varies by type:
--   bar_chart, line_graph, table, etc. — each with its own shape
-- set_ref preserves the original JSON identifier e.g. "qr_001" for traceability during seeding
CREATE TABLE quantitative_reasoning_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_ref     TEXT        NOT NULL UNIQUE,  -- e.g. "qr_001"
  title       TEXT        NOT NULL,
  stimulus    JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QR questions — each belongs to one set
-- options stored as JSONB array: [{"label": "A", "text": "..."}, ...]
-- correct_answer is the label e.g. "C"
-- question_ref preserves the original JSON id e.g. "qr_001_q1" for traceability during seeding
CREATE TABLE quantitative_reasoning_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id         UUID        NOT NULL REFERENCES quantitative_reasoning_sets(id) ON DELETE CASCADE,
  question_ref   TEXT        NOT NULL UNIQUE,  -- e.g. "qr_001_q1"
  question_text  TEXT        NOT NULL,
  options        JSONB       NOT NULL,
  correct_answer TEXT        NOT NULL,
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qr_questions_set_id ON quantitative_reasoning_questions (set_id);
