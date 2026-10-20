-- Include coaching with separate conditions and retain section samples even when exact-question overlap is sparse.
CREATE OR REPLACE FUNCTION public.get_performance_cohort()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  cached public.performance_cohort_cache%ROWTYPE;
  result JSONB;
  cutoff TIMESTAMPTZ := now();
BEGIN
  SELECT * INTO cached FROM public.performance_cohort_cache WHERE singleton;
  IF cached.computed_at > cutoff - interval '5 minutes' THEN RETURN cached.payload; END IF;
  -- Serialise refreshes across edge workers. A warm stale snapshot is usable
  -- while another worker rebuilds it; a cold load waits for that one rebuild.
  IF NOT pg_try_advisory_xact_lock(14102026, 1) THEN
    IF cached.payload IS NOT NULL THEN RETURN cached.payload; END IF;
    PERFORM pg_advisory_xact_lock(14102026, 1);
  END IF;
  SELECT * INTO cached FROM public.performance_cohort_cache WHERE singleton;
  IF cached.computed_at > cutoff - interval '5 minutes' THEN RETURN cached.payload; END IF;

  WITH first_practice AS (
    SELECT DISTINCT ON (a.user_id, a.section, a.question_id, COALESCE(a.statement_index, -1))
      a.user_id, a.section, a.question_id, a.statement_index, a.selected_answer, a.answered_at
    FROM public.practice_question_attempts a
    WHERE a.answered_at <= cutoff
    ORDER BY a.user_id, a.section, a.question_id, COALESCE(a.statement_index, -1), a.answered_at, a.id
  ), practice AS (
    SELECT a.user_id, a.section, 'practice'::text AS mode, a.question_id, to_jsonb(a.selected_answer) AS answer, a.answered_at
    FROM first_practice a
    JOIN public.performance_question_tags t ON t.section = a.section AND t.mode = 'practice' AND t.question_id = a.question_id
    WHERE a.statement_index IS NULL AND t.metadata->>'excludedReason' IS NULL
      AND COALESCE(jsonb_array_length(t.metadata->'statementAnswers'), 0) = 0
    UNION ALL
    SELECT a.user_id, a.section, 'practice', a.question_id,
      jsonb_object_agg(a.statement_index::text, a.selected_answer ORDER BY a.statement_index), max(a.answered_at)
    FROM first_practice a
    JOIN public.performance_question_tags t ON t.section = a.section AND t.mode = 'practice' AND t.question_id = a.question_id
    WHERE a.section = 'dm' AND t.metadata->>'excludedReason' IS NULL
      AND a.statement_index >= 0 AND a.statement_index < jsonb_array_length(t.metadata->'statementAnswers')
      AND a.selected_answer IS NOT NULL AND a.selected_answer <> ''
    GROUP BY a.user_id, a.section, a.question_id, t.metadata
    HAVING count(*) = jsonb_array_length(t.metadata->'statementAnswers')
  ), timed_rows AS (
    SELECT a.user_id, 'vr'::text AS section, a.question_id, to_jsonb(a.selected_answer) AS answer, e.submitted_at, a.id
    FROM public.timed_verbal_reasoning_question_answers a
    JOIN public.timed_verbal_reasoning_exam_attempts e ON e.id = a.exam_attempt_id AND e.user_id = a.user_id
    UNION ALL
    SELECT a.user_id, 'dm', a.question_id, to_jsonb(a.selected_answer), e.submitted_at, a.id
    FROM public.timed_decision_making_question_answers a
    JOIN public.timed_decision_making_exam_attempts e ON e.id = a.exam_attempt_id AND e.user_id = a.user_id
    UNION ALL
    SELECT a.user_id, 'qr', a.question_id, to_jsonb(a.selected_answer), e.submitted_at, a.id
    FROM public.timed_quantitative_reasoning_question_answers a
    JOIN public.timed_quantitative_reasoning_exam_attempts e ON e.id = a.exam_attempt_id AND e.user_id = a.user_id
    UNION ALL
    SELECT a.user_id, 'sj', a.question_id, to_jsonb(a.selected_answer), e.submitted_at, a.id
    FROM public.timed_situational_judgement_question_answers a
    JOIN public.timed_situational_judgement_exam_attempts e ON e.id = a.exam_attempt_id AND e.user_id = a.user_id
  ), timed AS (
    SELECT DISTINCT ON (a.user_id, a.section, a.question_id)
      a.user_id, a.section, 'timed'::text AS mode, a.question_id, a.answer, a.submitted_at AS answered_at
    FROM timed_rows a
    JOIN public.performance_question_tags t ON t.section = a.section AND t.mode = 'timed' AND t.question_id = a.question_id
    WHERE a.submitted_at <= cutoff AND t.metadata->>'excludedReason' IS NULL
    ORDER BY a.user_id, a.section, a.question_id, a.submitted_at, a.id
  ), coach_candidates AS (
    SELECT e.user_id, e.payload->>'section' AS section,
      CASE e.payload->>'kind' WHEN 'assessment' THEN 'assessment' WHEN 'timed_check' THEN 'coach_timed'
        WHEN 'review' THEN 'coach_review' ELSE 'coach_practice' END AS mode,
      e.payload->>'questionId' AS question_id, e.payload->'selectedAnswer' AS answer,
      e.payload->'tag' AS tag, e.payload->>'answeredAt' AS answered_at, e.id
    FROM public.coach_evidence e
    WHERE e.payload->>'mode' = 'coach' AND (e.payload->>'answeredAt')::timestamptz <= cutoff
      AND COALESCE((e.payload->>'interrupted')::boolean, false) = false
      AND e.payload->'tag'->>'excludedReason' IS NULL
      AND COALESCE(e.payload->'tag'->>'confidence', 'high') <> 'low'
  ), coach AS (
    SELECT DISTINCT ON (user_id, section, mode, question_id) * FROM coach_candidates
    ORDER BY user_id, section, mode, question_id, answered_at, id
  ), coach_tags AS (
    SELECT DISTINCT ON (section, mode, question_id) section, mode, question_id, tag FROM coach
    ORDER BY section, mode, question_id, answered_at, id
  ), archived_candidates AS (
    SELECT e.user_id, e.payload->>'section' AS section, e.payload->>'mode' AS mode,
      e.payload->>'questionId' AS question_id, (e.payload->>'statementIndex')::int AS statement_index,
      e.payload->'selectedAnswer' AS answer, e.payload->'tag' AS tag,
      (e.payload->>'answeredAt')::timestamptz AS answered_at, e.id
    FROM public.coach_evidence e
    WHERE e.payload->>'mode' IN ('practice', 'timed')
      AND (e.payload->>'answeredAt')::timestamptz <= cutoff
      AND e.payload->'tag'->>'excludedReason' IS NULL
  ), first_archived AS (
    SELECT DISTINCT ON (user_id, section, mode, question_id, COALESCE(statement_index, -1)) *
    FROM archived_candidates
    ORDER BY user_id, section, mode, question_id, COALESCE(statement_index, -1), answered_at, id
  ), archived AS (
    SELECT user_id, section, mode, question_id, answer, answered_at FROM first_archived
    WHERE mode = 'timed' OR (statement_index IS NULL AND COALESCE(jsonb_array_length(tag->'statementAnswers'), 0) = 0)
    UNION ALL
    SELECT user_id, section, mode, question_id,
      jsonb_object_agg(statement_index::text, answer ORDER BY statement_index), max(answered_at)
    FROM first_archived
    WHERE mode = 'practice' AND section = 'dm'
      AND statement_index >= 0 AND statement_index < jsonb_array_length(tag->'statementAnswers')
      AND answer IS NOT NULL AND answer <> 'null'::jsonb AND answer <> '""'::jsonb
    GROUP BY user_id, section, mode, question_id, tag
    HAVING count(*) = jsonb_array_length(tag->'statementAnswers')
  ), ordinary_candidates AS (
    SELECT user_id, section, mode, question_id::text, answer, answered_at FROM practice
    UNION ALL SELECT user_id, section, mode, question_id::text, answer, answered_at FROM timed
    UNION ALL SELECT user_id, section, mode, question_id, answer, answered_at FROM archived
  ), ordinary AS (
    SELECT DISTINCT ON (user_id, section, mode, question_id) user_id, section, mode, question_id, answer
    FROM ordinary_candidates ORDER BY user_id, section, mode, question_id, answered_at
  ), all_answers AS (
    SELECT * FROM ordinary UNION ALL SELECT user_id, section, mode, question_id, answer FROM coach
  ), frequencies AS (
    SELECT section, mode, question_id, answer, count(*) AS attempts
    FROM all_answers GROUP BY section, mode, question_id, answer
  ), grouped AS (
    SELECT section, mode, question_id,
      jsonb_agg(jsonb_build_object('answer', answer, 'count', attempts)) AS answers
    FROM frequencies GROUP BY section, mode, question_id

  )
  SELECT jsonb_build_object('computedAt', cutoff, 'groups', (
    SELECT COALESCE(jsonb_agg(g), '[]'::jsonb) FROM (
      SELECT section, mode, count(DISTINCT user_id) AS students FROM all_answers GROUP BY section, mode
    ) g), 'rows', COALESCE(jsonb_agg(
    jsonb_build_object('section', section, 'mode', mode, 'questionId', grouped.question_id, 'answers', answers, 'tag', (SELECT t.tag FROM coach_tags t WHERE t.section = grouped.section AND t.mode = grouped.mode AND t.question_id = grouped.question_id))
  ), '[]'::jsonb)) INTO result FROM grouped;

  INSERT INTO public.performance_cohort_cache (singleton, computed_at, payload)
    VALUES (true, cutoff, result)
    ON CONFLICT (singleton) DO UPDATE SET computed_at = EXCLUDED.computed_at, payload = EXCLUDED.payload;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_performance_cohort() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_performance_cohort() TO service_role;

DELETE FROM public.performance_cohort_cache;
