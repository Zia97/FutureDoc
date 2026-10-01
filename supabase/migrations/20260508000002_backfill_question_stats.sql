-- One-shot backfill of question_stats from existing practice_question_attempts.
--
-- The trigger added in 20260508000001 only fires on NEW inserts. Anyone who
-- answered practice questions before that migration ran has no cohort data,
-- so the Practice analytics "You vs cohort" charts come up empty.
--
-- Safe to re-run: truncates question_stats first, then rebuilds from the
-- earliest gradable attempt per (user, question, statement_index). Same
-- first-attempt + time clamp logic as the trigger.

TRUNCATE TABLE question_stats;

INSERT INTO question_stats (
  question_id,
  statement_index,
  section,
  total_first_attempts,
  total_correct_first_attempts,
  sum_time_ms,
  updated_at
)
SELECT
  question_id,
  statement_index_norm AS statement_index,
  section,
  COUNT(*),
  COUNT(*) FILTER (WHERE is_correct),
  SUM(time_spent_ms)::BIGINT,
  now()
FROM (
  -- Earliest gradable attempt per (user, question, statement) — matches the
  -- trigger's first-attempt guard.
  SELECT DISTINCT ON (user_id, question_id, COALESCE(statement_index, -1))
    user_id,
    question_id,
    COALESCE(statement_index, -1)::SMALLINT AS statement_index_norm,
    section,
    is_correct,
    time_spent_ms
  FROM practice_question_attempts
  WHERE is_correct IS NOT NULL
    AND time_spent_ms BETWEEN 500 AND 600000
  ORDER BY user_id, question_id, COALESCE(statement_index, -1), answered_at ASC
) first_attempts
GROUP BY question_id, statement_index_norm, section;
