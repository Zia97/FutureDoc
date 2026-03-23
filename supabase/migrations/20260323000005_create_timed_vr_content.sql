-- ============================================================
-- Timed Verbal Reasoning content tables
-- Passages and questions grouped by test_id.
-- ============================================================

-- ── 1. Tests metadata ────────────────────────────────────────
-- Lightweight lookup for test list screen metadata.
CREATE TABLE timed_verbal_reasoning_tests (
  id          SMALLINT    PRIMARY KEY,
  title       TEXT        NOT NULL,
  time_minutes SMALLINT   NOT NULL DEFAULT 22,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Passages ─────────────────────────────────────────────
CREATE TABLE timed_verbal_reasoning_passages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     SMALLINT    NOT NULL REFERENCES timed_verbal_reasoning_tests(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  order_index SMALLINT    NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_verbal_reasoning_passages_test_id ON timed_verbal_reasoning_passages (test_id);

-- ── 3. Questions ─────────────────────────────────────────────
CREATE TABLE timed_verbal_reasoning_questions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  passage_id      UUID        NOT NULL REFERENCES timed_verbal_reasoning_passages(id) ON DELETE CASCADE,
  question_text   TEXT        NOT NULL,
  options         TEXT[]      NOT NULL DEFAULT ARRAY['True', 'False', 'Can''t tell'],
  correct_answer  TEXT        NOT NULL,
  answer_reason   TEXT        NOT NULL DEFAULT '',
  order_index     SMALLINT    NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_verbal_reasoning_questions_passage_id ON timed_verbal_reasoning_questions (passage_id);

-- ── 4. RLS (read-only for all authenticated users) ───────────
ALTER TABLE timed_verbal_reasoning_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed vr tests"
  ON timed_verbal_reasoning_tests FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_verbal_reasoning_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed vr passages"
  ON timed_verbal_reasoning_passages FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_verbal_reasoning_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed vr questions"
  ON timed_verbal_reasoning_questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 5. Content version entry ─────────────────────────────────
INSERT INTO content_versions (section, version)
VALUES ('timed_verbal_reasoning', 1)
ON CONFLICT (section) DO NOTHING;
