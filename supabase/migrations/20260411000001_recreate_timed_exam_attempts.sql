-- ============================================================
-- Recreate timed exam attempts + answers for all 4 sections.
--
-- The previous tables were dropped on 2026-03-28
-- (20260328000001_drop_user_progress_tables.sql). We are
-- bringing them back so timed mock test results can be synced
-- to the cloud and survive reinstall / device switch.
--
-- Practice-mode progress remains local-only by design — only
-- timed exam results are valuable enough to persist.
--
-- Conventions:
--  • One attempt row per (user, test). UNIQUE constraint blocks
--    duplicate submissions; clients must DELETE then INSERT to
--    retake a test (matches the existing reset-to-retake flow).
--  • Answers written in bulk on submission, immutable afterwards
--    (no UPDATE policy). Correctness recomputed at runtime from
--    selected_answer vs the question's correct_answer, so no
--    is_correct column is stored.
--  • flags column on the attempt row preserves the user's
--    in-test "revisit later" markers for the review screen.
--  • DM has no parent grouping (no passage/scenario/set), and
--    its selected_answer is JSONB to handle both MCQ strings and
--    Yes/No statement objects.
-- ============================================================


-- ── Verbal Reasoning ────────────────────────────────────────
CREATE TABLE timed_verbal_reasoning_exam_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id            SMALLINT    NOT NULL REFERENCES timed_verbal_reasoning_tests(id) ON DELETE CASCADE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INT,
  correct_count      SMALLINT    NOT NULL DEFAULT 0,
  score_percent      SMALLINT    NOT NULL DEFAULT 0 CHECK (score_percent BETWEEN 0 AND 100),
  flags              JSONB       NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_vr_exam_attempts_user ON timed_verbal_reasoning_exam_attempts (user_id);

CREATE TABLE timed_verbal_reasoning_question_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID NOT NULL REFERENCES timed_verbal_reasoning_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES timed_verbal_reasoning_questions(id) ON DELETE CASCADE,
  passage_id      UUID NOT NULL REFERENCES timed_verbal_reasoning_passages(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_vr_answers_attempt ON timed_verbal_reasoning_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_vr_answers_user    ON timed_verbal_reasoning_question_answers (user_id);

ALTER TABLE timed_verbal_reasoning_exam_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timed_verbal_reasoning_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own vr exam attempts"   ON timed_verbal_reasoning_exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own vr exam attempts" ON timed_verbal_reasoning_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own vr exam attempts" ON timed_verbal_reasoning_exam_attempts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "users read own vr answers"   ON timed_verbal_reasoning_question_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own vr answers" ON timed_verbal_reasoning_question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own vr answers" ON timed_verbal_reasoning_question_answers FOR DELETE USING (auth.uid() = user_id);


-- ── Decision Making ─────────────────────────────────────────
CREATE TABLE timed_decision_making_exam_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id            SMALLINT    NOT NULL REFERENCES timed_decision_making_tests(id) ON DELETE CASCADE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INT,
  correct_count      SMALLINT    NOT NULL DEFAULT 0,
  score_percent      SMALLINT    NOT NULL DEFAULT 0 CHECK (score_percent BETWEEN 0 AND 100),
  flags              JSONB       NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_dm_exam_attempts_user ON timed_decision_making_exam_attempts (user_id);

-- selected_answer is JSONB: string for MCQ, object for Yes/No statements.
CREATE TABLE timed_decision_making_question_answers (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID  NOT NULL REFERENCES timed_decision_making_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID  NOT NULL REFERENCES timed_decision_making_questions(id) ON DELETE CASCADE,
  selected_answer JSONB NOT NULL,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_dm_answers_attempt ON timed_decision_making_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_dm_answers_user    ON timed_decision_making_question_answers (user_id);

ALTER TABLE timed_decision_making_exam_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timed_decision_making_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own dm exam attempts"   ON timed_decision_making_exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own dm exam attempts" ON timed_decision_making_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own dm exam attempts" ON timed_decision_making_exam_attempts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "users read own dm answers"   ON timed_decision_making_question_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own dm answers" ON timed_decision_making_question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own dm answers" ON timed_decision_making_question_answers FOR DELETE USING (auth.uid() = user_id);


-- ── Quantitative Reasoning ──────────────────────────────────
CREATE TABLE timed_quantitative_reasoning_exam_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id            SMALLINT    NOT NULL REFERENCES timed_quantitative_reasoning_tests(id) ON DELETE CASCADE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INT,
  correct_count      SMALLINT    NOT NULL DEFAULT 0,
  score_percent      SMALLINT    NOT NULL DEFAULT 0 CHECK (score_percent BETWEEN 0 AND 100),
  flags              JSONB       NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_qr_exam_attempts_user ON timed_quantitative_reasoning_exam_attempts (user_id);

CREATE TABLE timed_quantitative_reasoning_question_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID NOT NULL REFERENCES timed_quantitative_reasoning_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES timed_quantitative_reasoning_questions(id) ON DELETE CASCADE,
  set_id          UUID NOT NULL REFERENCES timed_quantitative_reasoning_sets(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_qr_answers_attempt ON timed_quantitative_reasoning_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_qr_answers_user    ON timed_quantitative_reasoning_question_answers (user_id);

ALTER TABLE timed_quantitative_reasoning_exam_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timed_quantitative_reasoning_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own qr exam attempts"   ON timed_quantitative_reasoning_exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own qr exam attempts" ON timed_quantitative_reasoning_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own qr exam attempts" ON timed_quantitative_reasoning_exam_attempts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "users read own qr answers"   ON timed_quantitative_reasoning_question_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own qr answers" ON timed_quantitative_reasoning_question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own qr answers" ON timed_quantitative_reasoning_question_answers FOR DELETE USING (auth.uid() = user_id);


-- ── Situational Judgement ───────────────────────────────────
CREATE TABLE timed_situational_judgement_exam_attempts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id            SMALLINT    NOT NULL REFERENCES timed_situational_judgement_tests(id) ON DELETE CASCADE,
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_taken_seconds INT,
  correct_count      SMALLINT    NOT NULL DEFAULT 0,
  score_percent      SMALLINT    NOT NULL DEFAULT 0 CHECK (score_percent BETWEEN 0 AND 100),
  flags              JSONB       NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE (user_id, test_id)
);

CREATE INDEX idx_timed_sj_exam_attempts_user ON timed_situational_judgement_exam_attempts (user_id);

CREATE TABLE timed_situational_judgement_question_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_attempt_id UUID NOT NULL REFERENCES timed_situational_judgement_exam_attempts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES timed_situational_judgement_questions(id) ON DELETE CASCADE,
  scenario_id     UUID NOT NULL REFERENCES timed_situational_judgement_scenarios(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  UNIQUE (exam_attempt_id, question_id)
);

CREATE INDEX idx_timed_sj_answers_attempt ON timed_situational_judgement_question_answers (exam_attempt_id);
CREATE INDEX idx_timed_sj_answers_user    ON timed_situational_judgement_question_answers (user_id);

ALTER TABLE timed_situational_judgement_exam_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timed_situational_judgement_question_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own sj exam attempts"   ON timed_situational_judgement_exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own sj exam attempts" ON timed_situational_judgement_exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own sj exam attempts" ON timed_situational_judgement_exam_attempts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "users read own sj answers"   ON timed_situational_judgement_question_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own sj answers" ON timed_situational_judgement_question_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own sj answers" ON timed_situational_judgement_question_answers FOR DELETE USING (auth.uid() = user_id);
