# FutureDoc database growth audit

20 October 2026

Implementation update: see [the deployed fixes, maintenance schedules, verification and remaining scaling work](DATABASE_FIXES_2026-10-20.md). The measurements and findings below describe the original audit baseline.

Production measurement confirms that duplicated coaching evidence is the largest storage consumer and the cohort-statistics RPC is already slow. The database is currently 130.9 MiB; the sampled connections showed no blocking or saturation. Optimising these paths and lesson telemetry has substantially more immediate value than deleting the small operational log tables.

The code analysis covers the current working tree, including uncommitted coaching/performance changes. Production measurements were collected on 20 October 2026 between approximately 13:11 and 13:16 Europe/London time, after CLI access became available. Production migration history ends at `20261017000004`; the three local migrations dated 20 October are not recorded as applied. The deployed cohort function is the earlier definition. Edge Function inventory was inspected, but deployed bundle contents were not downloaded or compared with local edits.

The [single-result snapshot SQL](../scripts/database-health-snapshot.sql) collects catalogue/statistics measurements without modifying application data and works with the CLI. The [health audit SQL](../scripts/database-health-audit.sql) provides individual queries for the SQL Editor. The [local reproduction script](../scripts/database-audit-reproduction.mjs) demonstrates three correctness problems using the repository's actual trigger and RPC definitions with a disposable supporting schema.

**Measured production findings**

| Measurement | Production result | Meaning |
| --- | --- | --- |
| Database size | 130.86 MiB, including its tables/indexes/catalogues | A baseline, not the entire provisioned disk or billing allocation |
| `coach_evidence` | 77.26 MiB; 50,985 rows | 59.0% of database size; first storage target |
| `practice_question_attempts` | 8.94 MiB; 34,130 rows | Main raw practice history |
| `lesson_progress` | 2.75 MiB; about 4,578 live rows | Small row count but substantial update/index activity |
| Tutor logs | 333 rows; 200 KiB | Not currently a meaningful storage problem |
| Forum rate-limit events | 12 rows; 48 KiB allocated; all older than 48 hours | Cleanup is valid, but would recover almost no space |
| Supabase Storage metadata | No objects recorded | Forum-media growth is a future risk; missing metadata cannot establish whether physical orphan objects exist |
| WAL directory | Approximately 80 MiB | Separate from `pg_database_size`; no replication slots were present |
| Default temporary-file directory | Zero files/bytes at the final check | Historical temporary I/O is not currently retained disk space |
| Connections | Four idle PostgREST connections; eight client sessions including the diagnostic connection | No sampled connection pressure; configured PostgreSQL maximum is 60, with reserved capacity |
| Blocking/deadlocks | Zero blocked sessions; zero recorded deadlocks | No sign of a lock incident in this sample |
| Autovacuum | Enabled | No reason to disable it or schedule disruptive full-table rewrites |
| Cron | No `pg_cron` extension or `cron.job` relation in this database | No database-local cron cleanup is configured; global platform worker processes do not imply installed jobs here |

Sizes include allocated space and indexes, so they are not precise live-payload sizes. Row counts for the archive, practice, tutor logs, and rate events were checked with aggregates; other table counts are PostgreSQL estimates.

The archive contains **34,097 practice records, 16,840 timed records, and only 48 coaching assessment records**. Its size is therefore mostly duplicated ordinary practice/timed evidence, rather than a large volume of coached sessions. Tags embedded in these payloads total about **36.18 MiB as JSON text**. That is an indication of repeated content, not a promise of an equal physical-disk saving.

**The archive's recent size jump is mostly a backfill.** Exactly 50,474 of its 50,985 retained rows share the original 17 October backfill timestamp, approximately 99.0%. Only 511 retained archive rows have other recording timestamps. It would be incorrect to extrapolate 50,000 new events every three days from this migration. Archive rows span 616 students; the median student has 29.5 rows, the 95th percentile 344.25, and the largest history 1,699 rows.

There were **537 practice attempt rows dated 13–19 October**, the last seven complete UTC days, averaging about 77/day. Daily distinct practice students ranged from three to nine in that period; the daily counts must not be summed to estimate unique weekly users. Today had 90 rows when sampled. These are event timestamps, which can differ from ingestion time for offline uploads, and are not a complete measure of all app activity. A 24–72 hour follow-up remains useful for actual physical growth and write-rate deltas.

The strongest measured latency finding is `get_performance_cohort`: **11 service-role RPC calls since 13 October, averaging 3,867.84 ms, maximum 6,864.82 ms**. They wrote approximately 98.17 MiB of temporary blocks in total. The cache last computed at 12:19 BST on 19 October. This supports moving refreshes out of user requests now, even though it has only been invoked infrequently. It does not prove that production currently rebuilds 288 times/day; that is only the five-minute design's possible frequency under sustained demand.

| Recorded app query family | Calls | Mean database execution time | Total database execution time |
| --- | ---: | ---: | ---: |
| Practice inserts | 35,828 | 68.10 ms | 40.7 minutes |
| Lesson heartbeat RPC | 55,969 | 19.76 ms | 18.4 minutes |
| Question-statistics queries | 10,162 | 13.89 ms | 2.35 minutes |
| Performance catalogue queries | 942 | 85.12 ms | 80.2 seconds |
| Coaching-evidence queries | 122 | 152.94 ms | 18.7 seconds |
| Cohort RPC | 11 | 3,867.84 ms | 42.5 seconds |

These counters cover each statement's recorded lifetime, not today's activity, and are database execution timings rather than end-to-end app latency or CPU time. The global statement-statistics reset is 16 March; individual newer query entries started later. Group means combine related query shapes. They cannot establish p95/p99 latency. In particular, most practice inserts predate the coaching archive, so their historical mean does not isolate the archive trigger's current cost.

Lesson progress has **62,878 recorded updates but only three HOT updates**, meaning almost all updates required new index entries. Its indexes occupy 2.09 MiB compared with 0.66 MiB for the table including TOAST. This backs the recommendation to reduce checkpoint writes and reassess the frequently changing indexed timestamp. It does not justify dropping the index without checking its readers.

The database's historical `temp_bytes` counter is approximately **2.4 TB since 12 February**. It is cumulative bytes written, not a 2.4 TB database. Available statement records attribute their largest temporary spills to function/migration introspection and also show the cohort spill above. Those statement records have a different reset date and do not reconcile the full database-level total. Temporary writes rose by about 108 MiB during this inspection, whose diagnostic queries also contribute to counters; that interval cannot isolate normal app traffic. The final default temp directory was empty. Investigate a representative observation window before attributing this historic total to any app feature or changing memory settings.

The deployed archive function still embeds tags; the timed RPC has no submission-ID parameter; and the statistics trigger has no durable contribution ledger. Thus the structural causes of the local retry/retention reproductions are present in production. No replay or deletion reproduction was performed against real student data.

**Revised production priority:** move the slow cohort rebuild off requests; introduce compact, versioned evidence and stable submission receipts; reduce lesson heartbeat activity; then add small operational cleanup jobs. Tutor logs, forum records, and messages are currently too small for deletion to materially affect database size. Preserve their semantics while designing retention. Verify the local/production migration difference before releasing the newer analysis code.

Measurement sources: [baseline catalogue snapshot](database-health/2026-10-20-baseline.json), [aggregate detail](database-health/2026-10-20-detail.json), [query and growth follow-up](database-health/2026-10-20-followup.json), [WAL and temporary files](database-health/2026-10-20-files.json), and [deployed function inventory](database-health/2026-10-20-functions.json). The following sections explain the code-level risks and proposed changes; descriptions of the latest local cohort implementation must not be read as its current production deployment state.

**Priorities**

| Priority | Finding | Main consequence | Recommended response |
| --- | --- | --- | --- |
| First | Every ordinary answer is also copied into `coach_evidence`, including question metadata | Storage and write amplification for all users | Store compact answer facts and reference immutable metadata versions |
| First | Timed submission retries create fresh archived answers | Duplicate history and extra writes after lost acknowledgements | Stable submission ID enforced in the database |
| First | Coach, tutor, and performance endpoints read lifetime evidence | More reads and slower requests as students study | Shared summaries, evidence revisions, and bounded history retrieval |
| First | Cohort cache rebuild scans population history in the request path | Periodic latency, CPU, I/O, and connection pressure | Serve the last good snapshot; rebuild asynchronously, then incrementally |
| First | Practice insert and media upload paths lack effective resource limits at the write boundary | Faulty or modified clients can amplify growth | Server validation, byte/count limits, and upload reservations |
| Next | Lesson updates every 15 seconds plus an Auth lookup | Avoidable network and database activity | Durable local timing with 60-second checkpoints |
| Next | Tutor logs double as learning memory; coach plans store full profiles | Large text/JSON retention without a bound | Separate operational retention from durable learning state |
| Next | Forum threads/admin queues return all matching rows | A large discussion or backlog creates large responses | Cursor pagination and incremental counters |
| Next | Media cleanup depends on a successful client follow-up | Abandoned or failed deletions leave stored files | Scheduled reconciliation through the Storage API |
| Later | Repeated metadata lookups, index overlap, device and event history | Smaller recurring overhead | Shared caches, measured index changes, targeted retention |

**How user activity reaches the database**

| Activity | Current interaction | Existing protection or limitation |
| --- | --- | --- |
| Open a practice section | Read local content, check content version; download the section if changed | Persistent content cache; content versions avoid routine full downloads |
| Answer a practice question | Save locally, queue one `practice_question_attempts` insert, execute archive and statistics triggers | Stable practice row UUID handles a lost acknowledgement; each DM statement is a separate attempt |
| Study a lesson | Start upsert and timestamp update; every 15 seconds validate Auth and update lesson time | One progress row per user/lesson, but frequent updates |
| Take a timed test | In-progress work is local; submit an attempt and all answers through one RPC | Atomic submission; one current result per user/test; archive retains previous answers |
| Open or return to Coaching | Show local cache, flush pending work, call `hub`, read catalogue/evidence, derive profile, attempt milestone/plan writes | Local cache improves display latency but does not suppress the hub network fetch on focus |
| Save a coaching session | Save locally; sync dirty progress every 60 seconds and on transitions/backgrounding | Version checks and a single active session; not a database write every timer tick |
| Open performance views | Reuse local snapshot or fetch all modes together after invalidation/refresh | Shared in-flight request, persisted snapshot, five-minute manual refresh cooldown in the ordinary cache-hit case |
| Send a tutor message | Auth/config/profile/usage checks; catalogue/evidence/memory reads; log insert/update; insight update | Bounded request and transcript fields; full evidence reads are still unbounded |
| Read forum feed | Paginated posts plus likes and signed image URLs | Feed limited to at most 30 posts per call |
| Open forum thread | Fetch post and every visible reply, including like counts | No reply pagination |
| Create forum content | Rate-limit records, content writes, moderation records, status/counter updates, optional notification records | Transactional posting limits; media upload limits are enforced too late |

Sources: [database queries](../src/lib/dbQueries.js), [practice queue](../src/services/practiceAttemptQueue.js), [lesson telemetry](../src/hooks/useLessonTelemetry.js), [coach hub](../src/screens/coaching/CoachHubScreen.js), [coach session](../src/screens/coaching/CoachSessionScreen.js), [performance cache](../src/lib/performance/cache.js), and [forum RPCs](../supabase/migrations/20260929000001_add_forum_likes_and_reply_threads.sql).

**1. Answer duplication is the main predictable storage multiplier**

`coach_archive_attempt` runs after every practice insert and every timed answer insert. It creates another row in `coach_evidence` with the answer, time, identifying fields, and the question's full performance metadata. It runs regardless of whether the student uses coaching. A qualifying first practice answer also updates `question_stats`.

That means one qualifying answer can produce three row modifications, plus their index and write-ahead-log work. A timed submission containing N answers inserts N current answers and N archived answers, and performs per-answer metadata and exam lookups inside the trigger. Retakes delete the current answers but intentionally retain the archive.

The local performance-tag seed contains 2,541 question records. Their serialised metadata averages **702 bytes**, with a median of 650 and a 95th percentile of 1,026. This is just the copied tag, before the answer payload, row overhead, indexes, and WAL. It is a measurement of repository JSON, not compressed production storage.

Illustrative load: **1,000 daily students × 100 attempt rows = 100,000 attempts/day**. Over 30 days that creates approximately **3 million practice rows plus 3 million evidence rows**. Repeated metadata alone would represent about **2.1 GB of uncompressed JSON** if the activity mix matched the seed average. DM statement questions can create several attempt rows per question, so count statements when forecasting.

Use an immutable question/tag version table keyed by content/version identity and reference that version from compact answer records. A pointer to the current mutable tag is insufficient: historical scoring must survive content corrections. Preserve stable event IDs, original timestamps, mode, statement index, and grading conditions.

Move toward one authoritative answer-event store with derived summaries and compatibility views. A smaller first step is removing repeated metadata from the archive while keeping existing readers working. Large coach session `questions` snapshots can similarly reference immutable content versions, while retaining the historical review experience.

Sources: [coaching tables and archive trigger](../supabase/migrations/20261017000001_ai_coaching.sql), [performance metadata](../supabase/migrations/20261013170000_performance_analyser.sql), [practice telemetry schema](../supabase/migrations/20260506000001_create_tester_telemetry.sql).

**2. Timed submission retries are atomic but not idempotent**

The submission RPC deletes the prior current attempt, inserts a new attempt, and inserts answers with new UUIDs. The client queue has an operation identifier, but the RPC receives no stable submission identifier. The archive deduplicates by answer-row ID, so retrying the same logical submission archives it again.

This can happen when the transaction commits and the response is lost, including around the client's 15-second timeout. It does not require deliberate repeated submission.

Local reproduction: two identical one-answer submissions produced **one current exam, one current answer, and two archived answers**. This verifies a storage/history issue; it does not establish that every derived score double-counts the records, because some calculations collapse first encounters.

Generate a submission UUID when the result is first saved locally. Enforce uniqueness per user/submission in the database, return the prior result on retries, and keep a durable receipt even when a later retake replaces the current result. A genuine retake gets a new UUID. Serialise conflicting submissions for the same user/test.

Sources: [atomic submission RPCs](../supabase/migrations/20260701000001_atomic_timed_exam_submit.sql), [timed queue](../src/services/timedExamQueueCore.js), [RPC transport and timeout](../src/lib/dbQueries.js), [reproduction](../scripts/database-audit-reproduction.mjs).

**3. Lifetime reads affect the coach, tutor, and performance views**

The shared `readEvidence` loads every archived row for a user in pages of 500 and retains the full result in memory. Coaching `hub`, `start`, and `chat` use it. The tutor also uses it through `readTutorLearnerContext`, even if the student only wants help with one question.

The shared catalogue reader fetches all skills and question metadata for those calls. The checked-in question tags alone contain approximately **1.78 MB of serialised JSON**. The performance endpoint has a 60-second worker-local catalogue cache; the shared coach/tutor reader has none.

The performance endpoint independently reads raw practice history, current timed records, and the archive, then builds four report modes. Some records are fetched in both raw and archived form. First/latest collapse can prevent duplicate marks, but does not remove the network, parsing, and sorting cost. Building each report repeats common preprocessing.

For a user with exactly 10,000 practice rows and 10,000 corresponding archive rows, those two reads alone require **42 page requests**, including the final empty pages, before timed records, catalogue, cohort, or entitlement checks. Cursor pagination avoids a truncation bug but does not bound total work.

Maintain shared per-user performance summaries and an evidence revision. Serve a cached summary when the revision, content version, scoring version, settings, and relevant calendar period have not changed. Update summaries in bounded batches, with per-user coordination to avoid many concurrent rebuilds. For tutor prompts, load only the relevant skill summary and a small recent history.

Keep full history accessible through cursor pagination when requested. Preserve exact first/latest answers, statement completion, historical scoring versions, time distributions needed for medians, first-seen status, and review candidates. Replacing these with simple totals alone would change existing results.

The coach currently fetches its hub on every focus despite displaying cached data first. Add a shared in-flight hub request and revision-based freshness; continue displaying cached data immediately. The performance cache already has useful controls, but invalidation deliberately bypasses normal reuse and unavailable cohort data can bypass the manual cooldown. Client caching is not a server resource limit.

Sources: [shared evidence reader](../supabase/functions/_shared/coaching-data.ts), [tutor memory](../supabase/functions/_shared/learner-memory.ts), [coach endpoint](../supabase/functions/ai-coach/index.ts), [performance endpoint](../supabase/functions/performance-analysis/index.ts), [pagination](../src/lib/performance/pagination.js), [report engine](../src/lib/performance/engine.js).

**4. Population statistics rebuild inside a user request**

`get_performance_cohort()` has a five-minute cache and an advisory lock, which usefully prevents simultaneous rebuilds. On expiry, however, a requesting user performs the rebuild. A cold cache can also make other requests wait for that rebuild.

The latest local migration, not yet applied in production, scans practice history, four timed answer/attempt pairs, and coaching evidence; extracts JSON fields; sorts first attempts; groups answer distributions; and writes the result as one large JSON value. Both ordinary archived answers and their current/raw counterparts are considered. Production's earlier implementation reads practice and timed histories without the newer archive/coaching branches and is already slow as measured above. Work grows with population history even though the cache has only one row.

Under sustained requests it can rebuild roughly **288 times/day**. This is an upper frequency implied by the TTL, not an observed production rate. Scheduling the exact same full rebuild every five minutes would move latency out of requests but would not reduce the work.

First, serve the last successful snapshot immediately and refresh in a separate bounded job. A 30–60 minute refresh is a reasonable initial proposal for population comparisons, while individual progress remains current. Show cohort freshness in its detail view where needed. Measure runtime before choosing the interval.

Next, maintain durable first-attempt facts and update affected distributions incrementally, preserving distinct-student counts and separate assessment/practice/review conditions. Avoid global counter updates on every answer if they become a contention point; process event batches. Retain the advisory lock and a last-good snapshot, and avoid repeatedly rebuilding unchanged data.

Sources: [original cohort cache](../supabase/migrations/20261014120000_performance_cohort_cache.sql), [latest cohort definition](../supabase/migrations/20261020000003_performance_coaching_cohort.sql).

**5. Lesson telemetry has an inexpensive reduction available**

The 15-second heartbeat makes approximately **240 database updates and 240 Auth `getUser()` requests per active lesson-hour**, excluding start/completion. `lesson_progress` is bounded to one row per user/lesson, but its indexed `last_seen_at` changes on every heartbeat, adding index churn as well as row versions and WAL.

Use local timing and durable pending checkpoints, synchronising every 60 seconds plus backgrounding, leaving, and completion. That reduces periodic database updates by **75%**, without making the visible timer less responsive. Use the existing local session identity in the client; keep authentication and ownership enforcement at the server.

Do not merely change the interval: the current hook clears pending seconds before the remote acknowledgement, and telemetry functions report errors without restoring them. Persist an acknowledged sequence or monotonic per-device counter so retries neither lose nor double-add time. Also ensure telemetry follows screen focus: its current foreground check is app-wide, and a lesson remaining mounted behind another screen can still be considered active.

Combine lesson initialisation and its timestamp update into one RPC. Reassess whether continuously indexing `last_seen_at` is necessary after measuring the admin queries.

Sources: [heartbeat lifecycle](../src/hooks/useLessonTelemetry.js), [Auth and write calls](../src/lib/userTelemetry.js), [time accumulator](../supabase/migrations/20260506000002_add_lesson_time_rpc.sql).

**6. Practice first-attempt statistics prevent naive deletion**

The statistics trigger determines whether a student has already contributed by searching `practice_question_attempts`. It does not use a separate durable contribution record. Deleting all older rows for a user/question makes a later answer look new while the old contribution remains in `question_stats`.

Local reproduction: one student answered, their raw history was deleted, and they answered again. `total_first_attempts` became **2**.

A unique contribution record keyed by user/section/question/normalised statement index must survive raw-history expiry. Insert it atomically and only update the aggregate when that insert succeeds. This also addresses the potential race between simultaneous first attempts. Preserve the intended rule for ungradable or implausibly fast attempts: the current historical-existence check sees those rows too, despite the comment describing a first gradable attempt.

Batching also needs this correction. In a local reproduction, inserting two answers for the same new user/question in one statement produced **zero aggregate rows**: each AFTER INSERT trigger saw the other answer and skipped its contribution. A batch RPC must select the intended earliest eligible event deterministically and handle out-of-order offline uploads; simply replacing single inserts with an array insert can change statistics.

The current trigger has no matching composite user/question/statement index in the repository. A temporary supporting index is a candidate if measurements show this lookup is expensive; the durable contribution design is the better long-term fix.

Sources: [statistics trigger](../supabase/migrations/20260508000001_create_question_stats.sql), [local reproduction](../scripts/database-audit-reproduction.mjs).

**7. Tutor text and coach snapshots need separate retention policies**

Tutor calls insert a log and then update it with the result. Saved text can include up to 2,000 message characters, 4,000 question characters, 6,000 response characters, and 1,000 answer characters, plus diagnostics. Limits bound each row, not the number of rows. Failed calls are logged too.

Successful logs also feed `ai_learning_history` and `ai_support_summary`. Deleting them changes the tutor/coach's memory. The support-summary RPC aggregates the user's eligible history, and history search performs a substring search over a computed text expression. A small returned result does not make the aggregation or search cheap.

Separate short-lived request diagnostics from compact learning facts and any intentionally retained conversations. Maintain topic counts/recent summaries incrementally and use indexed, paginated retrieval for older conversations. Keep unresolved content-error evidence until reviewed. Existing coach chat is already ephemeral in the latest migration: new transcript fields are null, so it should not be described as saving every conversation. Older stored transcripts may still exist because that migration does not purge them.

`coach_plans` stores a full profile on a new combination of evidence count, calendar day, and settings. Opening the hub can therefore create a new snapshot even without a meaningful plan change. Store the current derived profile once, and retain compact plan changes only when the plan changes. `get_plan_history` currently uses only the plan and milestones from each stored profile.

`user_ai_context` is one row per user, but its JSON misconception keys come from model-generated text and can accumulate. Its update still runs although the shared memory reader uses the newer history/summary path. Confirm consumers, then retire the redundant write or use a bounded taxonomy.

Sources: [tutor endpoint](../supabase/functions/ai-tutor/index.ts), [learning-history view and summary](../supabase/migrations/20261017000002_shared_ai_learning_memory.sql), [ephemeral coach chat](../supabase/migrations/20261017000004_ai_coach_ephemeral_chat.sql), [insight writer](../supabase/migrations/20260929000002_ai_tutor_observability.sql).

**8. Resource limits must apply before expensive work**

Practice telemetry accepts direct authenticated inserts with ownership and basic field checks. There is no application-level server rate limit, finite question validation, or answer-text length limit on that path. RLS protects ownership; it does not cap how many rows a client creates. Each insert also invokes the archive/statistics triggers.

The tutor exempts premium users from the usage cap and skips the usage RPC for a client-supplied demo flag. No server-enforced per-user concurrency gate or request-id receipt is visible for tutor generation. The coach has a daily chat cap, but it reads the catalogue/evidence and builds a profile before reserving the message or rejecting it for quota. Performance and coach hub requests likewise have no visible server cooldown.

Add lightweight rate/concurrency checks and request receipts before evidence reads or provider calls. Validate answer sizes and known question identities on the server. Permit legitimate offline queues to upload bounded batches; count submitted events as well as requests so batching cannot bypass the limit. Choose generous limits from actual study activity rather than restricting ordinary students.

Forum Storage allows uploads under an owned pending post. The two-image and daily-image checks happen when registering an attachment, after the file is uploaded. A client can leave unregistered files without passing those checks; the 5 MiB bucket limit only bounds each file.

Reserve at most two upload slots under a server lock before upload, with byte budgets, short-lived upload authorisation, and expiry. Remove the unrestricted pending-post upload route when the reservation flow is deployed.

Sources: [practice RLS and fields](../supabase/migrations/20260506000001_create_tester_telemetry.sql), [tutor usage](../supabase/functions/ai-tutor/index.ts), [coach request order](../supabase/functions/ai-coach/index.ts), [forum registration and Storage policies](../supabase/migrations/20260928000001_create_forum.sql).

**9. Forum media and discussion growth need different treatment**

Images occupy Storage object bytes separately from PostgreSQL table bytes. A modest illustrative rate of 500 images/day at 200 KB/image adds about 3 GB/month. The configured per-file maximum is 5 MiB, not an estimate of typical image size.

`cleanup-forum-media` handles a particular deleted/rejected post after an authenticated request. It is not a scheduled sweeper. Closing the app, a failed follow-up request, or an upload interrupted before attachment registration can leave objects behind. The `removed_at` marker can be set before the file is successfully removed; it is not proof that the object is gone.

The account-deletion function fetches posts and attachment paths without pagination. Large accounts can exceed response limits, and unregistered uploads are absent from those attachment results. It also does not check the first post query's error before continuing. Use paginated cleanup and durable retry jobs before finalising account removal.

Add scheduled reconciliation for expired upload reservations, unregistered objects past a grace period, and media on removed posts. Delete through the Storage API and record success afterwards. Direct SQL deletion from `storage.objects` removes metadata without deleting the underlying file. [Supabase Storage guidance](https://supabase.com/docs/guides/storage/schema/design).

Thread and admin-queue RPCs aggregate all replies or all pending cases into one JSON result. The reply-count trigger recounts a thread's published replies and updates its parent post on each insertion/deletion/status change. Large or popular threads therefore increase read work and serialize updates on the same parent row. Add cursor pagination, bounded admin queues, and count deltas on actual visibility transitions, with occasional reconciliation.

Keep useful published discussions unless an explicit content-retention policy says otherwise. Soft-deleted text, moderation provider records, and resolved reports are separate cleanup candidates.

Sources: [media cleanup](../supabase/functions/cleanup-forum-media/index.ts), [account deletion](../supabase/functions/delete-account/index.ts), [forum tables and count trigger](../supabase/migrations/20260928000001_create_forum.sql), [thread RPC](../supabase/migrations/20260929000001_add_forum_likes_and_reply_threads.sql).

**10. Smaller reads and index costs worth addressing**

- `useQuestionStats` fetches an entire section on every screen mount and has no pagination. Fetch/cache the current question set, or maintain a shared section cache with pagination. The local API configuration has a 1,000-row cap; confirm production's cap. DM statements increase the row count independently of question count.
- Content hooks perform their own version checks as well as the app's foreground version check. Share an in-flight version request and short freshness window; retain immediate local rendering and explicit refresh.
- The tutor-availability cache is used to render promptly, but its hook still refreshes on each mount/foreground event. A shared cache and request deduplication can reduce repeated checks without weakening the server kill switch.
- Practice queue flushing is sequential, one HTTP insert per row. After correcting the contribution logic described above, batch a bounded number of already-persisted events and deduplicate by event UUID on the server. The current flush takes a snapshot of local keys; entries added during it need a later trigger to drain. A drain-until-empty loop with a work budget avoids delayed updates and repeated whole-key scans.
- Retain jittered backoff and retry budgets for transient failures; current generic retries use fixed exponential delays without jitter or error classification.
- `coach_plans` is read by user and descending `created_at` but has no matching history index. `coach_evidence(user_id,id)` already matches its cursor reads. Other history/expiry indexes should follow actual access paths.
- The timed schema has separate user indexes alongside unique `(user_id,test_id)` indexes, and separate exam-attempt indexes alongside unique `(exam_attempt_id,question_id)` indexes. Some may be redundant, but remove them only after checking live usage and plans.
- Foreign-key columns lacking supporting indexes can make account deletion or content replacement expensive. Inspect the generated candidate list, including notification recipients and content references, rather than adding indexes indiscriminately.
- The old `loadPracticeAnalytics` path reads unpaginated attempts. Its view appears unused by the current navigation; treat it as legacy correctness debt, not a measured active hotspot.

Sources: [question stats hook](../src/hooks/queries/useQuestionStats.js), [content version service](../src/services/contentUpdateService.js), [availability hook](../src/hooks/ai/useAITutorAvailability.js), [practice queue](../src/services/practiceAttemptQueue.js), [retry helper](../src/lib/withRetry.js), [timed schema](../supabase/migrations/20260411000001_recreate_timed_exam_attempts.sql).

**Proposed retention and scheduled work**

These periods are engineering starting points. Rows supporting current results, unresolved reports, quotas, deduplication, or active sessions need their dependencies resolved first.

| Data | Proposed retention/job | Required condition |
| --- | --- | --- |
| `forum_rate_limit_events` | Daily deletion of records older than 48 hours | Current windows are at most 24 hours; ensure future configured windows remain covered. Existing cleanup only runs when that user posts again |
| Cron execution history | Daily; keep 7–14 days of finished runs | Preserve running jobs and emit failure metrics |
| Unregistered/abandoned media | Hourly reconciliation after a 24–48 hour grace period | Confirm no live upload reservation or retained attachment; remove via Storage API |
| Media on deleted/rejected posts | Retry cleanup hourly; compact metadata after success | Respect any pending review hold; `removed_at` alone is insufficient |
| Failed/demo/preview tutor diagnostics | 30 days, with daily aggregate usage/cost metrics | Exclude unresolved reports and useful investigations |
| Successful tutor conversations | Consider 90 days of readily accessible raw text | First preserve durable learning summaries and define retrieval of older conversations; no blind deletion |
| Full coach plan snapshots | Keep current; consider 90 days of compact plan changes | Preserve the coach's plan-history function; avoid writing unchanged profiles |
| Coach message request metadata | Consider 30–90 days | Transfer free-credit usage atomically to durable counters, retain current-day limits, and define the retry/replay horizon |
| `forum_reply_notifications` | Retain initially | Deleting the deduplication row can permit an old reply to send another notification; require a maximum send age before expiry |
| Stale push devices | Consider 90–180 days | Reliable registration refresh and notification recovery; remove known invalid tokens sooner |
| Raw repeated attempts | Consider 180 days in fast storage after redesign | Preserve first/latest facts, needed time distributions, first-seen and retry receipts, review history, and older history access |
| Learning evidence, baseline, active sessions | No age-based deletion now | These are product state, not disposable logs |
| Resolved support/content reports and moderation details | Consider 180–365 days | Resolve first, retain necessary investigation evidence, and define the moderation record policy |
| Profiles, preferences, lesson progress, usage counters, trial ledger | Keep compact records while needed | Trial ledger deliberately survives account deletion; deleting it restores trial eligibility |
| Published forum posts and replies | No automatic expiry initially | Product/content decision, not a database emergency measure |

No `pg_cron` schedule is present in the repository, and production has neither the extension installed in this database nor the `cron.job` relation. Supabase records every cron run in `cron.job_run_details` and does not automatically expire that history, so new cleanup jobs need their own log-retention job. [Cron quickstart](https://supabase.com/docs/guides/cron/quickstart).

Start with small indexed batches, for example 500–2,000 eligible rows per invocation, and tune from measured duration. Commit each batch separately; a loop inside one function call still holds a single transaction. Use a short statement/lock timeout, prevent overlapping workers, and record rows/bytes processed. Pace backlog removal over several runs so a cleanup does not create an I/O or replication spike. Stagger schedules and specify UTC explicitly. Supabase recommends at most eight concurrent jobs and durations below ten minutes; this app's routine cleanup should target much shorter work. [Cron guidance](https://supabase.com/docs/guides/cron).

**Connections and physical storage**

The app uses one Supabase JS client and HTTP `.from()`/`.rpc()` requests. No app-level Realtime channel subscriptions or direct PostgreSQL driver connections were found. A thousand signed-in users therefore do not imply a thousand dedicated database connections. PostgREST serves HTTP traffic through a reusable connection pool. Slow queries and concurrent request fan-out can still occupy that pool and cause queuing. [PostgREST connection pool](https://docs.postgrest.org/en/stable/references/connection_pool.html).

Do not treat the local `db.pooler.enabled = false` setting as evidence that production pooling is disabled. Measure connection use by database role, active versus idle state, wait events, query duration, and pool waits. Shorten work before increasing pool size.

Deleting rows does not normally shrink the physical database immediately. PostgreSQL retains dead row versions until vacuum can reclaim reusable space. Regular `VACUUM` generally makes space reusable inside the table; `VACUUM FULL` rewrites and exclusively locks the table and requires extra space. Do not schedule `VACUUM FULL` as routine cleanup. Keep autovacuum enabled and tune individual busy tables only with evidence of falling behind. [PostgreSQL vacuum guidance](https://www.postgresql.org/docs/17/routine-vacuuming.html).

Monitor database table/index/TOAST bytes, object Storage bytes, WAL retention, dead tuples, and provisioned disk separately. A cache with one large rewritten JSON row can cause churn without adding many live rows. A stalled replication slot can retain WAL independently of table growth.

**Measurement and implementation order**

1. The 20 October production baseline is saved. Repeat [database-health-snapshot.sql](../scripts/database-health-snapshot.sql) after 24–72 hours, including a busy study period, or use [database-health-audit.sql](../scripts/database-health-audit.sql) for individual SQL Editor queries. The CLI returns only the final query result, so use the single-result snapshot script when exporting all metrics through the CLI.
2. Reconcile the verified migration gap and compare deployed Edge Function contents before implementing newer local changes. Record table/index bytes, daily insert/update/delete deltas, top queries by total execution time and calls, active/waiting connections, and Storage growth. Compare counters only across intervals without a statistics reset.
3. Fix timed retry identities and put resource checks ahead of expensive reads/uploads. These prevent avoidable growth without removing students' records.
4. Consolidate catalogue/hub caches, correct first-attempt contribution handling before batching practice uploads, and make lesson timing durable before reducing checkpoint frequency. Preserve immediate local UI updates and reliable offline recovery.
5. Move cohort work off user requests. Introduce shared summaries and immutable metadata references, compare their outputs against the current calculations, and then switch readers.
6. Add the operational cleanup jobs. Compact/archive learning history only after first-attempt, quota, retry, and history dependencies have migrated.
7. Add or remove indexes from observed query plans and representative usage. Consider monthly partitioning only once event volumes and retention justify it; partition keys complicate the current global UUID/idempotency constraints.

Use representative large histories in staging: 10,000 and 100,000 answer events per student, concurrent submissions, lost acknowledgements, offline replay, a large forum thread, and a moderation backlog. Compare p95/p99 latency and correctness for answering, timed submission, coach hub, and tutor first response. Production `EXPLAIN ANALYZE` runs the query; use plain `EXPLAIN` first and run expensive analysed plans on staging or a controlled replica.

Track growth per active student and forecast days to the available storage limit. Initial operational alerts can target sustained connection use above 70–80%, worsening wait time, stale cohort snapshots, accumulating dead tuples, failed cleanup batches, and unexpectedly growing orphan candidates; tune those thresholds to the project's compute and baseline. An app can remain quick with a larger database if requests do bounded work. Deleting useful history while keeping repeated full scans would not provide that guarantee.

**Validation performed**

- Ran `node scripts/database-audit-reproduction.mjs`: reproduced duplicate timed archival after replay, first-attempt inflation after deleting raw practice history, and missing aggregate contributions when batching repeated answers under the existing trigger.
- Executed the health script's main read-only block in local PGlite/PostgreSQL: all 15 statement results completed. Ran it against production and confirmed that the CLI exposes only its final result; added and executed the single-result snapshot script to retain all metrics.
- Collected production catalogue/statistics snapshots and bounded aggregate queries in read-only transactions. Inspected deployed function metadata, storage-object metadata counts, WAL directory size, and temporary-file size.
- Reviewed migrations, triggers, RLS, active readers/writers, caches, retry paths, account deletion, and forum media lifecycle.
- Changes are confined to this report, diagnostic scripts, and aggregate snapshots. No application code, student records, database settings, deletion jobs, or migrations were changed.
