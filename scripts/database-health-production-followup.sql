-- Aggregate-only production follow-up. Does not execute application functions.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '15s';
SET LOCAL lock_timeout = '1s';
WITH app_queries AS MATERIALIZED (
  SELECT queryid::text AS query_id,userid::regrole::text AS database_role,
    calls,total_exec_time,mean_exec_time,max_exec_time,rows,temp_blks_written,wal_bytes,
    to_jsonb(s)->>'stats_since' AS stats_since,
    CASE
      WHEN query LIKE '%get_performance_cohort%' THEN 'cohort'
      WHEN query LIKE '%bump_lesson_time%' THEN 'lesson heartbeat'
      WHEN query LIKE '%practice_question_attempts%' AND query LIKE '%INSERT INTO%' THEN 'practice insert'
      WHEN query LIKE '%practice_question_attempts%' THEN 'practice read'
      WHEN query LIKE '%coach_evidence%' THEN 'coaching evidence'
      WHEN query LIKE '%performance_question_tags%' THEN 'performance catalogue'
      WHEN query LIKE '%coach_sessions%' THEN 'coach sessions'
      WHEN query LIKE '%coach_plans%' THEN 'coach plans'
      WHEN query LIKE '%ai_support_summary%' THEN 'support summary'
      WHEN query LIKE '%ai_learning_history%' THEN 'learning history'
      WHEN query LIKE '%ai_tutor_logs%' THEN 'tutor logs'
      WHEN query LIKE '%question_stats%' THEN 'question statistics'
      ELSE 'other'
    END AS feature
  FROM extensions.pg_stat_statements s
  WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database())
    AND query LIKE 'WITH pgrst_source%'
),
fk_candidates AS (
  SELECT c.relname AS table_name,con.conname,
    con.confrelid::regclass::text AS referenced_table,pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid
  JOIN pg_namespace ns ON ns.oid=c.relnamespace
  WHERE con.contype='f' AND ns.nspname='public'
    AND NOT EXISTS (
      SELECT 1 FROM pg_index i JOIN pg_class ic ON ic.oid=i.indexrelid
      JOIN pg_am am ON am.oid=ic.relam
      WHERE i.indrelid=con.conrelid AND i.indisvalid AND i.indpred IS NULL
        AND am.amname='btree' AND i.indnkeyatts>=cardinality(con.conkey)
        AND (i.indkey::smallint[])[0:cardinality(con.conkey)-1] @> con.conkey
    )
)
SELECT jsonb_build_object(
  'measured_at',now(),
  'app_query_groups',(SELECT jsonb_agg(to_jsonb(s)) FROM (
    SELECT feature,sum(calls) AS calls,round(sum(total_exec_time)::numeric,1) AS total_ms,
      round((sum(total_exec_time)/nullif(sum(calls),0))::numeric,2) AS weighted_mean_ms,
      round(max(max_exec_time)::numeric,2) AS max_ms,
      sum(temp_blks_written) AS temp_blocks_written
    FROM app_queries WHERE feature<>'other' GROUP BY feature ORDER BY sum(total_exec_time) DESC
  ) s),
  'cohort_queries',(SELECT jsonb_agg(to_jsonb(q)) FROM app_queries q WHERE feature='cohort'),
  'foreign_key_index_candidates',(SELECT jsonb_agg(to_jsonb(f)) FROM fk_candidates f),
  'practice_summary',(
    SELECT jsonb_build_object('exact_rows',count(*),'students',count(DISTINCT user_id),
      'first_answered_at',min(answered_at),'last_answered_at',max(answered_at))
    FROM public.practice_question_attempts
  ),
  'tutor_summary',(
    SELECT jsonb_build_object('exact_rows',count(*),'success_rows',count(*) FILTER (WHERE success),
      'demo_rows',count(*) FILTER (WHERE is_demo),'preview_rows',count(*) FILTER (WHERE is_preview))
    FROM public.ai_tutor_logs
  ),
  'rate_events',(
    SELECT jsonb_build_object('exact_rows',count(*),'older_than_48h',count(*) FILTER (WHERE created_at<now()-interval '48 hours'))
    FROM public.forum_rate_limit_events
  ),
  'evidence_backfill',(
    SELECT jsonb_build_object('rows_in_original_backfill',count(*) FILTER (WHERE recorded_at='2026-10-17T15:33:41.47403Z'),
      'total_rows',count(*),'payload_bytes',sum(pg_column_size(payload)),
      'tag_json_text_bytes',sum(octet_length((payload->'tag')::text)))
    FROM public.coach_evidence
  ),
  'stats_followup',(
    SELECT jsonb_build_object('stats_reset',stats_reset,'temp_files',temp_files,
      'temp_bytes',temp_bytes,'deadlocks',deadlocks,'database_bytes',pg_database_size(current_database()))
    FROM pg_stat_database WHERE datname=current_database()
  ),
  'query_stats_totals',(
    SELECT jsonb_build_object('temp_blocks_written',sum(temp_blks_written),
      'recorded_statement_entries',count(*),'block_size',current_setting('block_size'))
    FROM extensions.pg_stat_statements WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database())
  )
) AS followup;
COMMIT;
