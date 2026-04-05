-- ============================================================
-- Timed Quantitative Reasoning content tables
-- Structure: tests → sets (with stimulus) → questions (with options)
-- Mirrors the practice QR set-based layout but grouped by test.
-- ============================================================

-- ── 1. Tests metadata ────────────────────────────────────────
CREATE TABLE timed_quantitative_reasoning_tests (
  id           SMALLINT    PRIMARY KEY,
  title        TEXT        NOT NULL,
  time_minutes SMALLINT    NOT NULL DEFAULT 26,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Sets (each has one stimulus shared across its questions) ─
CREATE TABLE timed_quantitative_reasoning_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id     SMALLINT    NOT NULL REFERENCES timed_quantitative_reasoning_tests(id) ON DELETE CASCADE,
  set_ref     TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  stimulus    JSONB       NOT NULL,
  order_index SMALLINT    NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_qr_sets_test_id ON timed_quantitative_reasoning_sets (test_id);

-- ── 3. Questions ─────────────────────────────────────────────
CREATE TABLE timed_quantitative_reasoning_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id         UUID        NOT NULL REFERENCES timed_quantitative_reasoning_sets(id) ON DELETE CASCADE,
  question_ref   TEXT        NOT NULL UNIQUE,
  stem           TEXT        NOT NULL,
  options        JSONB       NOT NULL,
  correct_answer TEXT        NOT NULL,
  answer_reason  TEXT        NOT NULL,
  order_index    SMALLINT    NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timed_qr_questions_set_id ON timed_quantitative_reasoning_questions (set_id);

-- ── 4. RLS (read-only for all authenticated users) ───────────
ALTER TABLE timed_quantitative_reasoning_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed qr tests"
  ON timed_quantitative_reasoning_tests FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_quantitative_reasoning_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed qr sets"
  ON timed_quantitative_reasoning_sets FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE timed_quantitative_reasoning_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated users can read timed qr questions"
  ON timed_quantitative_reasoning_questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── 5. Content version entry ─────────────────────────────────
INSERT INTO content_versions (section, version)
VALUES ('timed_quantitative_reasoning', 1)
ON CONFLICT (section) DO NOTHING;
