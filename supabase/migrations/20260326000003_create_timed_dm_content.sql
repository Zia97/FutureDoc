-- ============================================================
-- Timed Decision Making content tables
-- Questions grouped by test_id, with nested options and statements.
-- ============================================================

-- ── 1. Tests metadata ────────────────────────────────────────
CREATE TABLE timed_decision_making_tests (
  id           SMALLINT    PRIMARY KEY,
  title        TEXT        NOT NULL,
  time_minutes SMALLINT    NOT NULL DEFAULT 37,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Questions ─────────────────────────────────────────────
CREATE TABLE timed_decision_making_questions (
  id               UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id          SMALLINT         NOT NULL REFERENCES timed_decision_making_tests(id) ON DELETE CASCADE,
  title            TEXT             NOT NULL,
  type             dm_question_type NOT NULL,
  stem             TEXT             NOT NULL,
  table_data       JSONB,
  stimulus_diagram JSONB,
  correct_answer   TEXT,
  answer_reason    TEXT,
  order_index      SMALLINT         NOT NULL,
  created_at       TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_dm_questions_test_id ON timed_decision_making_questions (test_id);

-- ── 3. Options (MCQ types) ───────────────────────────────────
CREATE TABLE timed_decision_making_question_options (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID        NOT NULL REFERENCES timed_decision_making_questions(id) ON DELETE CASCADE,
  label       CHAR(1)     NOT NULL,
  option_text TEXT        NOT NULL,
  option_data JSONB,
  order_index SMALLINT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_dm_options_question_id ON timed_decision_making_question_options (question_id);

-- ── 4. Statements (Yes/No types) ────────────────────────────
CREATE TABLE timed_decision_making_question_statements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    UUID        NOT NULL REFERENCES timed_decision_making_questions(id) ON DELETE CASCADE,
  statement_text TEXT        NOT NULL,
  correct_answer TEXT        NOT NULL,
  answer_reason  TEXT,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_dm_statements_question_id ON timed_decision_making_question_statements (question_id);

-- ── 5. RLS (read-only for all authenticated users) ───────────
ALTER TABLE timed_decision_making_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed dm tests"
  ON timed_decision_making_tests FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_decision_making_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed dm questions"
  ON timed_decision_making_questions FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_decision_making_question_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed dm question options"
  ON timed_decision_making_question_options FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_decision_making_question_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed dm question statements"
  ON timed_decision_making_question_statements FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 6. Content version entry ─────────────────────────────────
INSERT INTO content_versions (section, version)
VALUES ('timed_decision_making', 1)
ON CONFLICT (section) DO NOTHING;
