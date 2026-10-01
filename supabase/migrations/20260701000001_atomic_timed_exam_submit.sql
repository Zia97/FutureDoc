-- ============================================================
-- Atomic timed-exam submission RPCs (VR / DM / QR / SJ).
--
-- Previously the client did DELETE attempt → INSERT attempt →
-- INSERT answers as three separate PostgREST requests. A failure
-- (or dropped connection) between the attempt insert and the
-- answers insert left an attempt row with a score but ZERO answer
-- rows — which the review screen renders as 0/scaled-300.
--
-- These functions perform the same delete + insert-attempt +
-- insert-answers as ONE transaction (a plpgsql function body is
-- atomic), so a submission is all-or-nothing.
--
-- Conventions:
--  • SECURITY INVOKER (default): the caller's JWT is used, so the
--    existing RLS policies on each table still apply.
--  • user_id is taken from auth.uid() inside the function — the
--    client cannot spoof another user's id.
--  • p_answers is a JSON array of per-question objects; the column
--    shape differs per section (see each function).
--  • Returns the new attempt id (uuid).
-- ============================================================

-- ── Verbal Reasoning ────────────────────────────────────────
CREATE OR REPLACE FUNCTION submit_timed_vr_exam(
  p_test_id            SMALLINT,
  p_score_percent      SMALLINT,
  p_correct_count      SMALLINT,
  p_time_taken_seconds INT,
  p_flags              JSONB DEFAULT '[]'::jsonb,
  p_answers            JSONB DEFAULT '[]'::jsonb,
  p_analytics          JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM timed_verbal_reasoning_exam_attempts
   WHERE user_id = v_user_id AND test_id = p_test_id;

  INSERT INTO timed_verbal_reasoning_exam_attempts
    (user_id, test_id, score_percent, correct_count, time_taken_seconds, flags, analytics_summary)
  VALUES
    (v_user_id, p_test_id, p_score_percent, p_correct_count, p_time_taken_seconds,
     COALESCE(p_flags, '[]'::jsonb), p_analytics)
  RETURNING id INTO v_attempt_id;

  INSERT INTO timed_verbal_reasoning_question_answers
    (exam_attempt_id, user_id, question_id, passage_id, selected_answer, time_ms)
  SELECT v_attempt_id, v_user_id, a.question_id, a.passage_id, a.selected_answer, a.time_ms
  FROM jsonb_to_recordset(COALESCE(p_answers, '[]'::jsonb))
    AS a(question_id UUID, passage_id UUID, selected_answer TEXT, time_ms INT);

  RETURN v_attempt_id;
END;
$$;

-- ── Decision Making ─────────────────────────────────────────
-- selected_answer is JSONB (string for MCQ, object for Yes/No statements).
CREATE OR REPLACE FUNCTION submit_timed_dm_exam(
  p_test_id            SMALLINT,
  p_score_percent      SMALLINT,
  p_correct_count      SMALLINT,
  p_time_taken_seconds INT,
  p_flags              JSONB DEFAULT '[]'::jsonb,
  p_answers            JSONB DEFAULT '[]'::jsonb,
  p_analytics          JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM timed_decision_making_exam_attempts
   WHERE user_id = v_user_id AND test_id = p_test_id;

  INSERT INTO timed_decision_making_exam_attempts
    (user_id, test_id, score_percent, correct_count, time_taken_seconds, flags, analytics_summary)
  VALUES
    (v_user_id, p_test_id, p_score_percent, p_correct_count, p_time_taken_seconds,
     COALESCE(p_flags, '[]'::jsonb), p_analytics)
  RETURNING id INTO v_attempt_id;

  INSERT INTO timed_decision_making_question_answers
    (exam_attempt_id, user_id, question_id, selected_answer, time_ms)
  SELECT v_attempt_id, v_user_id, a.question_id, a.selected_answer, a.time_ms
  FROM jsonb_to_recordset(COALESCE(p_answers, '[]'::jsonb))
    AS a(question_id UUID, selected_answer JSONB, time_ms INT);

  RETURN v_attempt_id;
END;
$$;

-- ── Quantitative Reasoning ──────────────────────────────────
CREATE OR REPLACE FUNCTION submit_timed_qr_exam(
  p_test_id            SMALLINT,
  p_score_percent      SMALLINT,
  p_correct_count      SMALLINT,
  p_time_taken_seconds INT,
  p_flags              JSONB DEFAULT '[]'::jsonb,
  p_answers            JSONB DEFAULT '[]'::jsonb,
  p_analytics          JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM timed_quantitative_reasoning_exam_attempts
   WHERE user_id = v_user_id AND test_id = p_test_id;

  INSERT INTO timed_quantitative_reasoning_exam_attempts
    (user_id, test_id, score_percent, correct_count, time_taken_seconds, flags, analytics_summary)
  VALUES
    (v_user_id, p_test_id, p_score_percent, p_correct_count, p_time_taken_seconds,
     COALESCE(p_flags, '[]'::jsonb), p_analytics)
  RETURNING id INTO v_attempt_id;

  INSERT INTO timed_quantitative_reasoning_question_answers
    (exam_attempt_id, user_id, question_id, set_id, selected_answer, time_ms)
  SELECT v_attempt_id, v_user_id, a.question_id, a.set_id, a.selected_answer, a.time_ms
  FROM jsonb_to_recordset(COALESCE(p_answers, '[]'::jsonb))
    AS a(question_id UUID, set_id UUID, selected_answer TEXT, time_ms INT);

  RETURN v_attempt_id;
END;
$$;

-- ── Situational Judgement ───────────────────────────────────
CREATE OR REPLACE FUNCTION submit_timed_sj_exam(
  p_test_id            SMALLINT,
  p_score_percent      SMALLINT,
  p_correct_count      SMALLINT,
  p_time_taken_seconds INT,
  p_flags              JSONB DEFAULT '[]'::jsonb,
  p_answers            JSONB DEFAULT '[]'::jsonb,
  p_analytics          JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  DELETE FROM timed_situational_judgement_exam_attempts
   WHERE user_id = v_user_id AND test_id = p_test_id;

  INSERT INTO timed_situational_judgement_exam_attempts
    (user_id, test_id, score_percent, correct_count, time_taken_seconds, flags, analytics_summary)
  VALUES
    (v_user_id, p_test_id, p_score_percent, p_correct_count, p_time_taken_seconds,
     COALESCE(p_flags, '[]'::jsonb), p_analytics)
  RETURNING id INTO v_attempt_id;

  INSERT INTO timed_situational_judgement_question_answers
    (exam_attempt_id, user_id, question_id, scenario_id, selected_answer, time_ms)
  SELECT v_attempt_id, v_user_id, a.question_id, a.scenario_id, a.selected_answer, a.time_ms
  FROM jsonb_to_recordset(COALESCE(p_answers, '[]'::jsonb))
    AS a(question_id UUID, scenario_id UUID, selected_answer TEXT, time_ms INT);

  RETURN v_attempt_id;
END;
$$;
