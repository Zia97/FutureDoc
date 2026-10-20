-- Read-only catalogue snapshot in a single result, suitable for the Supabase
-- Management API/CLI (which returns only the last query's result).
-- No student content, query text, credentials, or client IPs are returned.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '20s';
SET LOCAL lock_timeout = '1s';
SELECT jsonb_build_object(
  'measured_at', now(),
  'database_bytes', pg_database_size(current_database()),
  'server_version', current_setting('server_version'),
  'database_stats', (
    SELECT to_jsonb(s) FROM (
      SELECT stats_reset, xact_commit, xact_rollback, blks_read, blks_hit,
        tup_returned, tup_fetched, tup_inserted, tup_updated, tup_deleted,
        temp_files, temp_bytes, deadlocks, blk_read_time, blk_write_time
      FROM pg_stat_database WHERE datname = current_database()
    ) s
  ),
  'tables', (
    SELECT jsonb_agg(to_jsonb(s) ORDER BY total_bytes DESC) FROM (
      SELECT t.schemaname, t.relname, t.n_live_tup, t.n_dead_tup,
        pg_total_relation_size(t.relid) AS total_bytes,
        pg_table_size(t.relid) AS table_bytes,
        pg_indexes_size(t.relid) AS main_index_bytes,
        CASE WHEN c.reltoastrelid <> 0 THEN pg_total_relation_size(c.reltoastrelid) ELSE 0 END AS toast_bytes,
        t.seq_scan, t.seq_tup_read, t.idx_scan, t.idx_tup_fetch,
        t.n_tup_ins, t.n_tup_upd, t.n_tup_del, t.n_tup_hot_upd,
        t.last_autovacuum, t.last_autoanalyze, t.autovacuum_count, t.autoanalyze_count
      FROM pg_stat_user_tables t JOIN pg_class c ON c.oid=t.relid
    ) s
  ),
  'indexes', (
    SELECT jsonb_agg(to_jsonb(s) ORDER BY index_bytes DESC) FROM (
      SELECT t.schemaname, t.relname, t.indexrelname,
        pg_relation_size(t.indexrelid) AS index_bytes, t.idx_scan,
        i.indisprimary, i.indisunique, i.indisvalid,
        pg_get_indexdef(t.indexrelid) AS definition
      FROM pg_stat_user_indexes t JOIN pg_index i ON i.indexrelid=t.indexrelid
    ) s
  ),
  'connections', (
    SELECT jsonb_agg(to_jsonb(s)) FROM (
      SELECT backend_type, usename AS database_role, application_name, state,
        wait_event_type, wait_event, count(*) AS connections,
        max(now()-xact_start) AS oldest_transaction_age,
        max(now()-query_start) FILTER (WHERE state='active') AS longest_active_query_age
      FROM pg_stat_activity WHERE datname=current_database()
      GROUP BY backend_type,usename,application_name,state,wait_event_type,wait_event
    ) s
  ),
  'blocked_sessions', (
    SELECT count(*) FROM pg_stat_activity
    WHERE datname=current_database() AND cardinality(pg_blocking_pids(pid))>0
  ),
  'settings', (
    SELECT jsonb_agg(to_jsonb(s)) FROM (
      SELECT name,setting,unit,source FROM pg_settings WHERE name IN (
        'max_connections','superuser_reserved_connections','autovacuum',
        'autovacuum_vacuum_threshold','autovacuum_vacuum_scale_factor',
        'autovacuum_analyze_threshold','autovacuum_analyze_scale_factor',
        'idle_in_transaction_session_timeout','track_io_timing','max_slot_wal_keep_size'
      )
    ) s
  ),
  'extensions', (
    SELECT jsonb_agg(to_jsonb(s)) FROM (
      SELECT extname,extversion,extnamespace::regnamespace::text AS installed_schema
      FROM pg_extension WHERE extname IN ('pg_stat_statements','pg_cron','pg_net')
    ) s
  ),
  'optional_relations', jsonb_build_object(
    'cron_jobs',to_regclass('cron.job'),
    'cron_run_history',to_regclass('cron.job_run_details'),
    'migration_history',to_regclass('supabase_migrations.schema_migrations')
  )
) AS snapshot;
COMMIT;
