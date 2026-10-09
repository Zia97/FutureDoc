-- Run in the Supabase SQL Editor as an admin.
-- Ranked by recorded content time: lessons + practice answers + submitted tests.
-- This is not total app-open time; the database has no app session timer.
-- Timed test retakes replace earlier saved attempts.
-- is_premium means current premium access, including trials or grants; it does
-- not prove a paid subscription was purchased.

WITH recorded_time AS (
  SELECT user_id, sum(time_spent_seconds)::numeric AS seconds
  FROM public.lesson_progress
  GROUP BY user_id

  UNION ALL

  SELECT user_id, sum(time_spent_ms)::numeric / 1000 AS seconds
  FROM public.practice_question_attempts
  -- One DM submission writes a row per statement with the same question time.
  WHERE statement_index IS NULL OR statement_index = 0
  GROUP BY user_id

  UNION ALL

  SELECT user_id, sum(time_taken_seconds)::numeric AS seconds
  FROM public.timed_verbal_reasoning_exam_attempts
  GROUP BY user_id

  UNION ALL

  SELECT user_id, sum(time_taken_seconds)::numeric AS seconds
  FROM public.timed_decision_making_exam_attempts
  GROUP BY user_id

  UNION ALL

  SELECT user_id, sum(time_taken_seconds)::numeric AS seconds
  FROM public.timed_quantitative_reasoning_exam_attempts
  GROUP BY user_id

  UNION ALL

  SELECT user_id, sum(time_taken_seconds)::numeric AS seconds
  FROM public.timed_situational_judgement_exam_attempts
  GROUP BY user_id
), totals AS (
  SELECT user_id, round(sum(seconds), 1) AS total_seconds
  FROM recorded_time
  GROUP BY user_id
)
SELECT coalesce(
         nullif(btrim(p.display_name), ''),
         nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
         nullif(btrim(u.raw_user_meta_data->>'name'), '')
       ) AS user_name,
       u.id AS user_id,
       u.email,
       coalesce(t.total_seconds, 0) AS total_seconds,
       concat(
         floor(coalesce(t.total_seconds, 0) / 3600)::bigint,
         'h ',
         lpad(floor(mod(coalesce(t.total_seconds, 0), 3600) / 60)::int::text, 2, '0'),
         'm'
       ) AS total_hours_minutes,
       coalesce(p.is_premium, false) AS is_premium
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
LEFT JOIN totals t ON t.user_id = u.id
ORDER BY total_seconds DESC, u.id;
