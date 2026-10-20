-- FutureDoc database measurements. Run in the production Supabase SQL Editor
-- as a database administrator. The executable section only reads catalogues
-- and statistics; it does not read student answers, messages, or credentials.
-- Save results twice, at least 24 hours apart, to measure growth and activity.
-- The CLI/Management API returns only the final query result. For a complete
-- CLI export use database-health-snapshot.sql, which returns one JSON object.
-- Counters are cumulative since reset, not per-day values.
-- A timeout aborts this transaction: run ROLLBACK before retrying a smaller block.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '15s';
SET LOCAL lock_timeout = '1s';

-- 1. Database size and counter baseline. This excludes Storage object bytes
-- and is not a measurement of the entire provisioned disk or its WAL files.
SELECT now() AS measured_at, current_database() AS database_name,
       current_setting('server_version') AS server_version,
       pg_database_size(current_database()) AS database_bytes,
       pg_size_pretty(pg_database_size(current_database())) AS database_size;
SELECT stats_reset, xact_commit, xact_rollback, blks_read, blks_hit,
       round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 2) AS block_cache_hit_pct,
       tup_returned, tup_fetched, tup_inserted, tup_updated, tup_deleted,
       temp_files, temp_bytes, deadlocks, blk_read_time, blk_write_time
FROM pg_stat_database WHERE datname = current_database();

-- 2. Largest tables, including indexes and TOAST (large-value storage).
-- Estimated rows can be stale; byte counts include reusable/dead space.
SELECT s.schemaname, s.relname, s.n_live_tup AS estimated_live_rows,
       pg_total_relation_size(s.relid) AS total_bytes,
       pg_table_size(s.relid) AS table_bytes_including_toast,
       pg_indexes_size(s.relid) AS main_index_bytes,
       CASE WHEN c.reltoastrelid <> 0 THEN pg_total_relation_size(c.reltoastrelid) ELSE 0 END AS toast_total_bytes,
       pg_size_pretty(pg_total_relation_size(s.relid)) AS total_size,
       round(pg_total_relation_size(s.relid)::numeric / nullif(s.n_live_tup, 0), 1) AS estimated_total_bytes_per_live_row
FROM pg_stat_user_tables s JOIN pg_class c ON c.oid = s.relid
ORDER BY pg_total_relation_size(s.relid) DESC LIMIT 60;

-- 3. Read/write activity and vacuum health. Dead tuples are an estimate,
-- not a precise bloat measurement. HOT updates avoid new index entries.
SELECT schemaname, relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch,
       n_tup_ins, n_tup_upd, n_tup_del, n_tup_hot_upd, n_live_tup, n_dead_tup,
       round(100.0 * n_dead_tup / greatest(n_live_tup + n_dead_tup, 1), 2) AS estimated_dead_pct,
       last_autovacuum, last_autoanalyze, autovacuum_count, autoanalyze_count
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC LIMIT 60;

-- 4. Index cost and usage. Zero scans alone is NOT permission to remove
-- an index: constraints, rare jobs, resets and short observation windows matter.
SELECT s.schemaname, s.relname, s.indexrelname,
       pg_relation_size(s.indexrelid) AS index_bytes,
       s.idx_scan, s.idx_tup_read, s.idx_tup_fetch,
       i.indisprimary, i.indisunique, i.indisvalid,
       pg_get_indexdef(s.indexrelid) AS definition
FROM pg_stat_user_indexes s JOIN pg_index i ON i.indexrelid = s.indexrelid
ORDER BY pg_relation_size(s.indexrelid) DESC LIMIT 100;

-- 5. Foreign keys lacking a valid, nonpartial B-tree with the FK columns
-- as its leading keys (any order). Candidates for investigation, not automatic DDL.
SELECT ns.nspname AS schema_name, c.relname AS table_name, con.conname,
       con.confrelid::regclass AS referenced_table,
       pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace ns ON ns.oid = c.relnamespace
WHERE con.contype = 'f' AND ns.nspname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    JOIN pg_class ic ON ic.oid = i.indexrelid
    JOIN pg_am am ON am.oid = ic.relam
    WHERE i.indrelid = con.conrelid AND i.indisvalid
      AND i.indpred IS NULL AND am.amname = 'btree'
      AND i.indnkeyatts >= cardinality(con.conkey)
      AND (i.indkey::smallint[])[0:cardinality(con.conkey)-1] @> con.conkey
  )
ORDER BY ns.nspname, c.relname, con.conname;

-- 6. Connections and waits. Intentionally excludes SQL text and client IPs.
SELECT backend_type, usename AS database_role, application_name, state,
       wait_event_type, wait_event, count(*) AS connections,
       max(now() - xact_start) AS oldest_transaction_age,
       max(now() - query_start) FILTER (WHERE state = 'active') AS longest_active_query_age
FROM pg_stat_activity WHERE datname = current_database()
GROUP BY backend_type, usename, application_name, state, wait_event_type, wait_event
ORDER BY count(*) DESC;
SELECT count(*) AS blocked_sessions,
       max(now() - query_start) AS longest_blocked_query_age
FROM pg_stat_activity
WHERE datname = current_database() AND cardinality(pg_blocking_pids(pid)) > 0;

-- 7. Settings and available optional diagnostics.
SELECT name, setting, unit, source FROM pg_settings
WHERE name IN (
  'max_connections', 'superuser_reserved_connections', 'autovacuum',
  'autovacuum_vacuum_threshold', 'autovacuum_vacuum_scale_factor',
  'autovacuum_analyze_threshold', 'autovacuum_analyze_scale_factor',
  'idle_in_transaction_session_timeout', 'statement_timeout',
  'track_io_timing', 'max_slot_wal_keep_size'
) ORDER BY name;
SELECT extname, extversion, extnamespace::regnamespace AS installed_schema
FROM pg_extension WHERE extname IN ('pg_stat_statements', 'pg_cron', 'pg_net');
SELECT to_regclass('cron.job') AS cron_jobs,
       to_regclass('cron.job_run_details') AS cron_run_history,
       to_regclass('supabase_migrations.schema_migrations') AS migration_history,
       to_regclass('public.coach_evidence') AS coaching_archive,
       to_regclass('public.performance_cohort_cache') AS cohort_cache;
COMMIT;

-- OPTIONAL BLOCKS: run separately after confirming the listed relations exist.
-- Each block is read-only. No application RPC is called: some SELECT RPCs
-- (notably get_performance_cohort) also write data or rebuild large aggregates.

/*
-- A. Migration verification; a deployed Edge Function can differ from local code.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SELECT version FROM supabase_migrations.schema_migrations
ORDER BY version DESC LIMIT 20;
SELECT p.proname, md5(pg_get_functiondef(p.oid)) AS definition_hash
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN (
  'coach_archive_attempt', 'roll_up_question_stats', 'get_performance_cohort',
  'submit_timed_vr_exam', 'coach_reserve_message', 'coach_complete_message'
);
COMMIT;
*/

/*
-- B. Slow/frequent queries. Adjust "extensions" to installed_schema from above.
-- Inspect the query IDs privately in Query Performance if text is needed.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SELECT queryid, calls, round(total_exec_time::numeric, 1) AS total_ms,
       round(mean_exec_time::numeric, 2) AS mean_ms,
       round(max_exec_time::numeric, 2) AS max_ms, rows,
       shared_blks_hit, shared_blks_read, temp_blks_written, wal_bytes
FROM extensions.pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname=current_database())
ORDER BY total_exec_time DESC LIMIT 30;
COMMIT;
*/

/*
-- C. Cron metadata. Do not export job commands: they can contain secrets.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
SELECT jobid, status, count(*) AS runs, min(start_time) AS oldest_run,
       max(start_time) AS newest_run,
       max(end_time-start_time) AS longest_finished_run
FROM cron.job_run_details GROUP BY jobid,status ORDER BY jobid,status;
COMMIT;
*/

/*
-- D. Replication slots can retain WAL independently of application row counts.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SELECT slot_name, slot_type, active, wal_status, restart_lsn,
       CASE WHEN restart_lsn IS NOT NULL
         THEN pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) END AS retained_wal_bytes
FROM pg_replication_slots;
COMMIT;
*/

/*
-- E. Bounded sample of archive payloads; returns sizes only.
-- A SYSTEM sample is block-biased, can miss a small table, and is NOT a
-- reliable estimate of rare users or the exact on-disk size after compression.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
WITH sampled AS (
  SELECT payload FROM public.coach_evidence TABLESAMPLE SYSTEM (1) LIMIT 1000
)
SELECT count(*) AS sampled_rows,
       round(avg(pg_column_size(payload)),1) AS mean_stored_payload_bytes,
       round(avg(octet_length(payload::text)),1) AS mean_json_text_bytes,
       round(avg(octet_length((payload->'tag')::text)),1) AS mean_tag_text_bytes
FROM sampled;
COMMIT;
*/

/*
-- F. Storage size and orphan candidates. This may scan storage metadata;
-- use off-peak. These are counts ONLY, not instructions to delete anything.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '15s';
SELECT bucket_id, count(*) AS objects,
       sum(CASE WHEN metadata->>'size' ~ '^[0-9]+$'
                THEN (metadata->>'size')::numeric ELSE 0 END) AS recorded_object_bytes,
       count(*) FILTER (WHERE metadata->>'size' IS NULL) AS objects_missing_size
FROM storage.objects GROUP BY bucket_id;
SELECT count(*) AS unregistered_forum_objects_older_than_48h
FROM storage.objects o
WHERE o.bucket_id='forum-media' AND o.created_at < now()-interval '48 hours'
  AND NOT EXISTS (SELECT 1 FROM public.forum_attachments a WHERE a.storage_path=o.name);
COMMIT;
*/
