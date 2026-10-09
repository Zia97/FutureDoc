-- Run each numbered SELECT separately in the Supabase SQL Editor with an
-- admin connection, so each result grid is visible.
-- Replace the UUID in each query to inspect another user.
-- Times below are recorded content time, not total app session time.

-- 1. Overview: keep each source separate before adding totals, so joins cannot
-- multiply lesson, practice, or test rows.
WITH target AS (
  SELECT 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid AS user_id
), lessons AS (
  SELECT count(*) AS lessons_opened,
         count(*) FILTER (WHERE completed_at IS NOT NULL) AS lessons_completed,
         coalesce(sum(time_spent_seconds), 0) AS lesson_seconds
  FROM public.lesson_progress WHERE user_id = (SELECT user_id FROM target)
), practice AS (
  SELECT count(*) AS answer_rows,
         count(DISTINCT (section, question_id)) AS distinct_questions,
         -- DM statement answers repeat the question timer on every statement.
         -- Count it on statement 0 only; other sections have a NULL index.
         coalesce(sum(time_spent_ms) FILTER (
           WHERE statement_index IS NULL OR statement_index = 0
         ), 0) AS practice_ms
  FROM public.practice_question_attempts
  WHERE user_id = (SELECT user_id FROM target)
), tests AS (
  SELECT time_taken_seconds FROM public.timed_verbal_reasoning_exam_attempts
    WHERE user_id = (SELECT user_id FROM target)
  UNION ALL
  SELECT time_taken_seconds FROM public.timed_decision_making_exam_attempts
    WHERE user_id = (SELECT user_id FROM target)
  UNION ALL
  SELECT time_taken_seconds FROM public.timed_quantitative_reasoning_exam_attempts
    WHERE user_id = (SELECT user_id FROM target)
  UNION ALL
  SELECT time_taken_seconds FROM public.timed_situational_judgement_exam_attempts
    WHERE user_id = (SELECT user_id FROM target)
), test_totals AS (
  SELECT count(*) AS tests_submitted,
         coalesce(sum(time_taken_seconds), 0) AS test_seconds
  FROM tests
)
SELECT t.user_id, (u.id IS NOT NULL) AS account_found, u.email,
       u.created_at AS signed_up_at, u.last_sign_in_at,
       coalesce(ai.lifetime_count, 0) AS ai_tutor_calls,
       l.lessons_opened, l.lessons_completed, l.lesson_seconds,
       p.answer_rows AS practice_answer_rows,
       p.distinct_questions AS distinct_practice_questions,
       round(p.practice_ms / 1000.0, 1) AS practice_seconds,
       x.tests_submitted, x.test_seconds,
       round(l.lesson_seconds + p.practice_ms / 1000.0 + x.test_seconds, 1)
         AS recorded_content_seconds,
       round((l.lesson_seconds + p.practice_ms / 1000.0 + x.test_seconds) / 3600.0, 2)
         AS recorded_content_hours
FROM target t
LEFT JOIN auth.users u ON u.id = t.user_id
LEFT JOIN public.user_ai_usage ai ON ai.user_id = t.user_id
CROSS JOIN lessons l
CROSS JOIN practice p
CROSS JOIN test_totals x;

-- 2. Lessons opened or completed. Lesson titles live in app code, so the DB
-- only has lesson IDs.
SELECT section, lesson_id, started_at, completed_at, last_seen_at,
       time_spent_seconds, platform, app_version
FROM public.lesson_progress
WHERE user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
ORDER BY last_seen_at DESC;

-- 3. Every saved practice answer, including repeat attempts. DM statement
-- questions produce several rows for one submission.
SELECT p.section, p.question_id, p.statement_index,
       coalesce(vr.question_text, dm.stem, qr.question_text, sj.question_text)
         AS question_text,
       p.selected_answer, p.is_correct,
       round(p.time_spent_ms / 1000.0, 1) AS recorded_seconds,
       p.answered_at, p.platform, p.app_version
FROM public.practice_question_attempts p
LEFT JOIN public.verbal_reasoning_questions vr
  ON p.section = 'vr' AND vr.id = p.question_id
LEFT JOIN public.decision_making_questions dm
  ON p.section = 'dm' AND dm.id = p.question_id
LEFT JOIN public.quantitative_reasoning_questions qr
  ON p.section = 'qr' AND qr.id = p.question_id
LEFT JOIN public.situational_judgement_questions sj
  ON p.section = 'sj' AND sj.id = p.question_id
WHERE p.user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
ORDER BY p.answered_at DESC;

-- 4. Submitted timed tests. A retake replaces the previous attempt for the
-- same user, section, and test ID.
WITH tests AS (
  SELECT 'vr' AS section, test_id, submitted_at, time_taken_seconds,
         correct_count, score_percent
  FROM public.timed_verbal_reasoning_exam_attempts
  WHERE user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'dm', test_id, submitted_at, time_taken_seconds,
         correct_count, score_percent
  FROM public.timed_decision_making_exam_attempts
  WHERE user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'qr', test_id, submitted_at, time_taken_seconds,
         correct_count, score_percent
  FROM public.timed_quantitative_reasoning_exam_attempts
  WHERE user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'sj', test_id, submitted_at, time_taken_seconds,
         correct_count, score_percent
  FROM public.timed_situational_judgement_exam_attempts
  WHERE user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
)
SELECT t.*, coalesce(vr.title, dm.title, qr.title, sj.title) AS test_title
FROM tests t
LEFT JOIN public.timed_verbal_reasoning_tests vr
  ON t.section = 'vr' AND vr.id = t.test_id
LEFT JOIN public.timed_decision_making_tests dm
  ON t.section = 'dm' AND dm.id = t.test_id
LEFT JOIN public.timed_quantitative_reasoning_tests qr
  ON t.section = 'qr' AND qr.id = t.test_id
LEFT JOIN public.timed_situational_judgement_tests sj
  ON t.section = 'sj' AND sj.id = t.test_id
ORDER BY t.submitted_at DESC;

-- 5. Questions answered within those timed tests. Rows are only uploaded for
-- answered questions; time_ms can be NULL for older submissions.
WITH answers AS (
  SELECT 'vr' AS section, e.test_id, e.submitted_at, a.question_id,
         a.selected_answer::text AS selected_answer, a.time_ms
  FROM public.timed_verbal_reasoning_question_answers a
  JOIN public.timed_verbal_reasoning_exam_attempts e ON e.id = a.exam_attempt_id
  WHERE e.user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'dm', e.test_id, e.submitted_at, a.question_id,
         a.selected_answer::text, a.time_ms
  FROM public.timed_decision_making_question_answers a
  JOIN public.timed_decision_making_exam_attempts e ON e.id = a.exam_attempt_id
  WHERE e.user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'qr', e.test_id, e.submitted_at, a.question_id,
         a.selected_answer::text, a.time_ms
  FROM public.timed_quantitative_reasoning_question_answers a
  JOIN public.timed_quantitative_reasoning_exam_attempts e ON e.id = a.exam_attempt_id
  WHERE e.user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
  UNION ALL
  SELECT 'sj', e.test_id, e.submitted_at, a.question_id,
         a.selected_answer::text, a.time_ms
  FROM public.timed_situational_judgement_question_answers a
  JOIN public.timed_situational_judgement_exam_attempts e ON e.id = a.exam_attempt_id
  WHERE e.user_id = 'abffd173-d239-4b19-b68e-7943e5c39c5a'::uuid
)
SELECT a.section, a.test_id, a.question_id,
       coalesce(vr.question_text, dm.stem, qr.stem, sj.question_text)
         AS question_text,
       a.selected_answer, round(a.time_ms / 1000.0, 1) AS recorded_seconds,
       a.submitted_at
FROM answers a
LEFT JOIN public.timed_verbal_reasoning_questions vr
  ON a.section = 'vr' AND vr.id = a.question_id
LEFT JOIN public.timed_decision_making_questions dm
  ON a.section = 'dm' AND dm.id = a.question_id
LEFT JOIN public.timed_quantitative_reasoning_questions qr
  ON a.section = 'qr' AND qr.id = a.question_id
LEFT JOIN public.timed_situational_judgement_questions sj
  ON a.section = 'sj' AND sj.id = a.question_id
ORDER BY a.submitted_at DESC, a.section, a.test_id, a.question_id;
