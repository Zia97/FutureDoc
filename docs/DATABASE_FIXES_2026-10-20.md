# Database changes — 20 October 2026

Implementation following [the database audit](DATABASE_GROWTH_AUDIT.md).

The database migrations and seven edge functions have been deployed to `dvykcokcsdrfdupqqdzp`. Mobile changes are in this working tree and require the next app release. Existing app builds remain compatible with the database and edge APIs.

## Measured result

| Measurement | Result |
| --- | --- |
| Archive answer payload plus shared metadata | 16,053,749 bytes, versus 52,814,647 bytes of payload before compaction: approximately 70% less logical JSON storage. |
| Archive records awaiting compaction | Zero. |
| Allocated database files | Approximately 143 MiB after rollout. Allocation increased during rewriting and creation of the durable ledgers/indexes; this is not a claim that disk allocation fell by 70%. |
| Cached cohort database read | 34 ms in the verification query. The original user-facing rebuild averaged 3.9 seconds. |
| Background cohort rebuild | 17.2 seconds after avoiding repeated JSON reconstruction, versus 27 seconds in the first scheduled rebuild after compaction. These are individual observations, not a sustained benchmark. |
| Storage worker | Actual `pg_net` dispatch returned HTTP 200 and `{"removed":0}`. |
| Validation | 115 automated tests passed, the PostgreSQL regression script passed, the additional compact-source cohort equivalence check passed, and the Android production bundle exported. |

The full pre/post archive checksum cannot be claimed unchanged: the baseline contained 50,992 records, whereas the final archive contains 50,944. The 48 coaching records present initially are absent, and coaching sessions fell from one to zero while another workstream was changing production. This is consistent with concurrent coaching-reset activity; it is not an attributable compaction deletion. No maintenance function introduced here deletes learning evidence. Exact local payload-equality checks and the final production batches' before-commit integrity checks passed.

## Storage and correctness

| Area | Change |
| --- | --- |
| Answer archive | Identical historical question metadata is stored once in `coach_evidence_tags`. `coach_evidence_records` keeps each answer and a reference to its immutable snapshot. The `coach_evidence` compatibility view returns the original payload shape. |
| Existing archive | Migrated in independently committed batches. Production I/O measurements led to a maximum of 200 records per batch. The final batch implementation compares the original and hydrated payload fingerprints before committing. |
| Timed retries | Persistent submission IDs and durable receipts prevent acknowledgement retries from creating new attempts. Replaying an older upload after a genuine retake returns its original receipt without overwriting the newer attempt. Legacy and new submit functions share a concurrency lock. Requires the new app queue for retry identification. |
| Practice statistics | A durable participation ledger prevents raw-row deletion from allowing a second contribution. Batches and concurrent attempts claim participation once. Existing published aggregates and first-accepted-event semantics are preserved; this does not retrospectively recalculate historical scores. |
| Practice uploads | Up to 50 saved answers per request, stable IDs, account-bound authorization, and draining of work added during upload. New-row payload size constraints also protect the legacy insertion path. |
| Lesson telemetry | Local checkpoints every five seconds; network uploads normally every 60 seconds and on backgrounding, leaving the screen, or completion. A cumulative counter per installation/lesson makes retries safe. Focused foreground time only; account identity is captured by the hook. |
| Coach plans | Store only the plan and milestones used by the history tool. Suppress consecutive identical plans instead of writing a fresh full profile each day or after every answer. |
| Tutor requests | Reserve before history/model work; retries reuse the response and free-credit debit. Completed receipts normally reference the existing tutor log instead of duplicating its response text. Stop writing the unused, growing `user_ai_context` JSON counters. |

The tutor gate permits at most 30 new requests per ten minutes, 300 per rolling day, and 20 demo requests per day. Provider failures can retry the same request up to three attempts without another lifetime-credit debit. Request IDs expire after seven days; receipts are retained for eight. The free lifetime allowance remains five.

## Reads and connections

- Interactive cohort reads return the last successful snapshot. The existing aggregate builder runs in the background every 30 minutes. A failed refresh leaves the previous snapshot intact.
- The aggregate builder reads compact answer fields and shared metadata directly, avoiding repeated reconstruction of a full JSON snapshot for each referenced field.
- Question catalogues share bounded caches and concurrent loads share one promise.
- Coaching/tutor evidence and performance attempt inputs are cached by authenticated user and archive revision, with bounded retained memory and a 60-second TTL. Authorization and subscription checks still run per request.
- Coach quota checks run before expensive history reads. Existing coach profiles avoid a redundant upsert; milestone writes are batched.
- Question statistics are paginated and cached for five minutes. Content-version reads share one short-lived result. Tutor availability respects its existing 90-second cache.
- Forum threads return 30 replies per page. Admin queues return 50 items per collection per page, with load-more controls.
- Retry backoff includes jitter and stops for recognized permanent errors.
- Notification tokens are renewed at most daily unless the token/account changes. Invalid tokens are removed even when every push ticket fails.

No connection-pool setting was changed: the measured production pool was not saturated. The application continues using Supabase HTTP APIs rather than opening a direct database connection per user.

## Scheduled maintenance

Schedules are UTC and are visible under Supabase Cron.

| Job | Schedule | Work |
| --- | --- | --- |
| `futuredoc-cohort` | Minute 17 and 47 each hour | Refresh the cohort snapshot, with a 60-second statement timeout. |
| `futuredoc-maintenance` | Every five minutes | Delete up to 1,000 forum rate events older than two days; up to 500 eligible tutor operational logs older than 30 days; compact up to 200 remaining archive records. |
| `futuredoc-receipts` | Hourly, minute 23 | Bounded expiry of tutor receipts after eight days, notification receipts after seven days, and device tokens inactive for a year. |
| `futuredoc-storage` | Hourly, minute 41 | Remove up to 100 eligible files through the Storage API, with a 48-hour grace period. |
| `futuredoc-cron-history` | Daily, 03:33 | Remove up to 10,000 completed cron-history entries older than seven days. |
| `futuredoc-health` | Daily, 01:11 | Capture database/table sizes, dead-row estimates, connection count and cohort age. Keep the current day and 35 preceding days. |

Tutor-log expiry applies to demos, previews, or explicitly recorded failures. Records with feedback or a possible content error are retained. Legacy `success = false` alone never qualifies a record for deletion. Successful ordinary tutor conversations remain available to learner memory.

Storage limits apply at object creation, including unregistered uploads: two objects per pending post, ten uploads per user per day, with the existing five-MiB object limit. Attachment registration is serialized. Cleanup handles unregistered old files and files belonging to removed posts. Account deletion pages through the entire user prefix, checks errors, and only deletes the account after file cleanup succeeds.

The storage worker uses a dedicated secret stored in Vault and edge-function configuration. Secret values are absent from migrations and cron command text. A deployed authenticated worker check returned `{"removed":0}`.

The first scheduled storage run exposed an argument-syntax error in its SQL dispatch. Migration `20261020140500_storage_maintenance_dispatch.sql` replaced that command with a tested dispatcher function; its actual database-to-edge request returned HTTP 200. The earlier failed cron-history entry remains visible for audit rather than being removed.

Notification sending now rejects replies older than 48 hours, allowing seven-day notification receipts to expire without enabling old-reply replays.

## Verification

- PostgreSQL regression script executes the repository's real migrations in disposable PGlite databases. It checks timed retry/retake ordering, practice batching and retention, lossless snapshot compaction, lesson retry totals, private-table access, cohort read/refresh separation, forum pagination/counts/upload limits, operational retention, tutor retry charging, and bounded daily monitoring.
- Client regression tests cover concurrent cache loads, user isolation, cache eviction, lost lesson acknowledgements, writes during upload and account changes.
- Coaching, performance, report and client regression suites pass: 115 tests. Run `npm run test:database` for the new SQL/client checks. The Android production JavaScript/Hermes export builds successfully.
- Production aggregate measurements are saved under `docs/database-health/`. No student answer text or credentials are included in those reports.

## Operational limits and remaining scaling work

These changes remove redundant metadata and unnecessary repeated work; they do not impose a fixed maximum database size. Genuine learning history still grows with use. No raw-answer, coaching-session, successful ordinary tutor-history, trial-claim or durable first-attempt/timed-retry purge was enabled.

On a cache miss or evidence change, personal analysis still reads the retained history. The scheduled cohort rebuild also still scans its source history. Incremental learner/cohort projections and cold storage for old raw attempts remain architectural follow-ups, requiring additional equivalence tests for first/latest attempts, DM statement grouping, time distributions, reset behavior and historical tools. Arbitrarily deleting those rows would change existing product behavior.

Old app builds retain their older write cadence and do not send timed/tutor retry IDs. Release the mobile changes to activate those client improvements. Desktop SQL tests and a bundle export are not a substitute for testing the release on real devices.

Compaction makes freed database pages reusable; it does not promise an immediate reduction in allocated disk. No blocking `VACUUM FULL` was run. Daily health history now provides a basis for measuring sustained growth instead of extrapolating from the original one-time archive backfill.

Ordinary `VACUUM (ANALYZE, TRUNCATE FALSE, INDEX_CLEANUP ON)` completed after compaction. Disabling truncation avoids the exclusive-lock step used to return empty tail pages to the filesystem.

The final production check at 14:07 UTC recorded zero archive dead rows, zero pending compaction records, six active scheduled jobs and a successful HTTP 200 storage dispatch.

## Concurrent migration work

Another workstream added `20261020000018_fix_sj_timed_test_5_title.sql` and `20261020120000_admin_report_triage.sql` during rollout. A version collision stopped the bulk deployment. The already-applied compaction update was moved to `20261020135900_database_compaction_integrity.sql`, and only its matching production migration-history entry was renamed. The other workstream's files were preserved and were not deliberately deployed as part of this task. Review any pending earlier-version migrations before using `db push --include-all`.
