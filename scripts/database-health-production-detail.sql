-- Aggregate-only investigation after confirming the initial production sizes.
-- No application RPCs, EXPLAIN ANALYZE, personal identifiers, or text content.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '20s';
SET LOCAL lock_timeout = '1s';
WITH statements AS MATERIALIZED (
  SELECT queryid::text AS queryid, calls, total_exec_time, mean_exec_time, max_exec_time, rows,
    shared_blks_hit, shared_blks_read, temp_blks_written, temp_blks_read, wal_bytes,
    CASE WHEN query ~* '^\s*(select|with)' THEN 'select_or_with_wrapper'
         WHEN query ~* '^\s*(insert|update|delete)' THEN 'dml'
         ELSE 'other' END AS query_kind,
    ARRAY(SELECT marker FROM unnest(ARRAY[
      'pg_timezone_names','pg_stat','pg_catalog','information_schema','auth.',
      'realtime','storage.','coach_evidence','practice_question_attempts',
      'lesson_progress','bump_lesson_time','get_performance_cohort',
      'performance_question_tags','performance_cohort_cache','coach_sessions',
      'coach_profiles','coach_plans','coach_messages','ai_tutor_logs',
      'ai_learning_history','ai_support_summary','question_stats','forum_',
      'timed_','submit_timed_','user_profiles','content_versions',
      'schema_migrations','http_request_queue'
    ]) AS marker WHERE strpos(lower(query),marker)>0) AS markers
  FROM extensions.pg_stat_statements
  WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database())
)
SELECT jsonb_build_object(
  'measured_at', now(),
  'query_stats_info', (SELECT to_jsonb(i) FROM extensions.pg_stat_statements_info i),
  'top_total_time', (SELECT jsonb_agg(to_jsonb(s)) FROM
    (SELECT * FROM statements ORDER BY total_exec_time DESC LIMIT 20) s),
  'top_temp_writes', (SELECT jsonb_agg(to_jsonb(s)) FROM
    (SELECT * FROM statements WHERE temp_blks_written>0 ORDER BY temp_blks_written DESC LIMIT 12) s),
  'top_calls', (SELECT jsonb_agg(to_jsonb(s)) FROM
    (SELECT * FROM statements ORDER BY calls DESC LIMIT 15) s),
  'recent_migrations', (SELECT jsonb_agg(to_jsonb(s)) FROM
    (SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 22) s),
  'deployed_functions', (
    SELECT jsonb_agg(jsonb_build_object(
      'function',p.proname,'definition_hash',md5(pg_get_functiondef(p.oid)),
      'archives_tags',strpos(pg_get_functiondef(p.oid),'jsonb_build_object(''tag'',tag)')>0,
      'has_coach_candidates',strpos(pg_get_functiondef(p.oid),'coach_candidates')>0,
      'has_submission_id',strpos(pg_get_functiondef(p.oid),'p_submission_id')>0,
      'has_contribution_ledger',strpos(pg_get_functiondef(p.oid),'contribution')>0
    ))
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'coach_archive_attempt','roll_up_question_stats','get_performance_cohort',
      'submit_timed_vr_exam','coach_reserve_message','coach_complete_message'
    )
  ),
  'evidence_by_mode', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT payload->>'mode' AS mode,count(*) AS rows,
      min(recorded_at) AS first_recorded_at,max(recorded_at) AS last_recorded_at,
      round(avg(pg_column_size(payload)),1) AS mean_stored_payload_bytes,
      round(avg(octet_length((payload->'tag')::text)),1) AS mean_tag_text_bytes
    FROM public.coach_evidence GROUP BY payload->>'mode'
  ) s),
  'evidence_recorded_by_day', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT (recorded_at AT TIME ZONE 'UTC')::date AS day,count(*) AS rows
    FROM public.coach_evidence GROUP BY 1 ORDER BY 1 DESC LIMIT 14
  ) s),
  'practice_by_day', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT (answered_at AT TIME ZONE 'UTC')::date AS day,count(*) AS rows,
      count(DISTINCT user_id) AS students
    FROM public.practice_question_attempts WHERE answered_at>=now()-interval '30 days'
    GROUP BY 1 ORDER BY 1 DESC
  ) s),
  'evidence_per_student', (SELECT jsonb_build_object(
    'students',count(*),'max_rows',max(n),'median_rows',percentile_cont(0.5) WITHIN GROUP (ORDER BY n),
    'p95_rows',percentile_cont(0.95) WITHIN GROUP (ORDER BY n)
  ) FROM (SELECT count(*) AS n FROM public.coach_evidence GROUP BY user_id) s),
  'storage_by_bucket', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT bucket_id,count(*) AS objects,
      sum(CASE WHEN metadata->>'size' ~ '^[0-9]+$' THEN (metadata->>'size')::numeric ELSE 0 END) AS recorded_bytes
    FROM storage.objects GROUP BY bucket_id
  ) s),
  'replication_slots', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT slot_name,slot_type,active,wal_status,
      CASE WHEN restart_lsn IS NOT NULL THEN pg_wal_lsn_diff(pg_current_wal_lsn(),restart_lsn) END AS retained_wal_bytes
    FROM pg_replication_slots
  ) s),
  'cohort_cache', (SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT computed_at,pg_column_size(payload) AS stored_payload_bytes,
      octet_length(payload::text) AS json_text_bytes
    FROM public.performance_cohort_cache
  ) s)
) AS detail;
COMMIT;
