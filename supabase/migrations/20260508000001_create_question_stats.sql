-- Aggregate per-question stats for practice questions.
--
-- Powers the "your time vs avg time" + "% of students correct" bullets shown
-- inside the answer-explanation box on each practice question.
--
-- Source of truth: `practice_question_attempts` (append-only telemetry). We
-- only count each user's FIRST gradable attempt at a given (question, statement)
-- so users can't poison the average by resetting practice progress and
-- re-answering instantly.
--
-- DM statement-based questions (syllogism, interpreting_info) emit one
-- attempt row per statement; we therefore key the stats on
-- (question_id, statement_index). statement_index is null for everything
-- else (option-based DM, VR, QR, SJ).
--
-- Time clamp: attempts with time_spent_ms < 500 or > 600000 are NOT counted
-- in the aggregate (they still get inserted into practice_question_attempts —
-- this only filters the stats roll-up).
--
-- is_correct IS NULL attempts are also ignored (rare; not gradable).

-- ─── question_stats ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_stats (
  question_id                  UUID NOT NULL,
  statement_index              SMALLINT NOT NULL DEFAULT -1, -- -1 sentinel = "no statement" so we can use it in PK
  section                      TEXT NOT NULL CHECK (section IN ('vr', 'dm', 'qr', 'sj')),

  total_first_attempts         INTEGER NOT NULL DEFAULT 0,
  total_correct_first_attempts INTEGER NOT NULL DEFAULT 0,
  sum_time_ms                  BIGINT  NOT NULL DEFAULT 0,

  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (question_id, statement_index)
);

CREATE INDEX IF NOT EXISTS idx_question_stats_section
  ON question_stats (section);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE question_stats ENABLE ROW LEVEL SECURITY;

-- Public read: every authed user needs to see the aggregate to render bullets.
DROP POLICY IF EXISTS "question_stats public read" ON question_stats;
CREATE POLICY "question_stats public read"
  ON question_stats FOR SELECT
  TO authenticated, anon
  USING (true);

-- No INSERT / UPDATE / DELETE policy — only the trigger (SECURITY DEFINER)
-- writes here.

-- ─── Trigger function ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION roll_up_question_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stmt_idx SMALLINT;
  v_already_counted BOOLEAN;
BEGIN
  -- Skip ungradable rows.
  IF NEW.is_correct IS NULL THEN
    RETURN NEW;
  END IF;

  -- Server-side time sanity clamp.
  IF NEW.time_spent_ms IS NULL
     OR NEW.time_spent_ms < 500
     OR NEW.time_spent_ms > 600000 THEN
    RETURN NEW;
  END IF;

  -- Normalize NULL statement_index to -1 sentinel so PK comparisons work.
  v_stmt_idx := COALESCE(NEW.statement_index, -1);

  -- First-attempt guard: has this user already contributed for this
  -- (question, statement)? Look back at any earlier rows from the same user.
  SELECT EXISTS (
    SELECT 1
    FROM practice_question_attempts
    WHERE user_id = NEW.user_id
      AND question_id = NEW.question_id
      AND COALESCE(statement_index, -1) = v_stmt_idx
      AND id <> NEW.id
  ) INTO v_already_counted;

  IF v_already_counted THEN
    RETURN NEW;
  END IF;

  -- Bump aggregate atomically.
  INSERT INTO question_stats (
    question_id, statement_index, section,
    total_first_attempts, total_correct_first_attempts, sum_time_ms,
    updated_at
  ) VALUES (
    NEW.question_id, v_stmt_idx, NEW.section,
    1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END, NEW.time_spent_ms,
    now()
  )
  ON CONFLICT (question_id, statement_index) DO UPDATE
    SET total_first_attempts         = question_stats.total_first_attempts + 1,
        total_correct_first_attempts = question_stats.total_correct_first_attempts
                                       + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
        sum_time_ms                  = question_stats.sum_time_ms + NEW.time_spent_ms,
        updated_at                   = now();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION roll_up_question_stats() FROM PUBLIC;

DROP TRIGGER IF EXISTS practice_question_attempts_roll_up_stats
  ON practice_question_attempts;

CREATE TRIGGER practice_question_attempts_roll_up_stats
  AFTER INSERT ON practice_question_attempts
  FOR EACH ROW
  EXECUTE FUNCTION roll_up_question_stats();
