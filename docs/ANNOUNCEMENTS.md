# Question announcements

Implemented in both repositories. No production migration, deployment or message send was performed.

## Local demonstration

Run `npm.cmd run dev:admin` in `ucatgenius-web`, then open:

http://127.0.0.1:4173/admin/#report=question%3Aqr%3Apractice%3A10000000-0000-4000-8000-000000000001

1. In **Review**, choose **Confirmed error** and apply the review. An AI `possible_error` flag alone cannot enable sending.
2. Under **Notify affected students**, choose **Compose announcement**. Enter a title/message and select reporters, attempters or both.
3. Choose **Preview recipients**. The initial question has two identifiable reporters and two attempters, with one overlap: **three recipients** for both groups. Deleted/suspended accounts and a different-mode attempt are excluded.
4. Inspect the actual app card in the phone preview, then explicitly choose **Send to 3 students**.
5. **Development student demo** opens below the sent history. Alex receives the popup. Choose **Dismiss** to acknowledge it.
6. Select Bea or Chris to inspect the other recipients. Select **Active timed exam** before switching students to demonstrate deferral, then return to **Home**. **Offline** permits a durable local dismissal; reconnecting sends the acknowledgement.
7. **Cancel unseen deliveries** prevents other recipients from displaying the message, including recipients who fetched it during a timed test.

All fixture recipients, reports and attempts are synthetic. The browser demo uses the app's `AnnouncementCard` and `announcementQueue`, with a simulated server. It is not a running native app or hosted Supabase end-to-end test. **Preview tools → Reset fixtures** restores the dataset. Browser state uses `ucat-admin-fixtures-v2`; per-student demo acknowledgement outboxes use `announcement_ack_v1:fixture-*`.

## Recipient evidence

Every audience uses the exact `(section, practice/timed mode, question UUID)` tuple.

| Source | Inclusion |
|---|---|
| `question_reports` | Matching `section`, `is_timed`, `question_id`, non-null `user_id`. Reporter selection includes historical fixed/dismissed reports too. |
| `practice_question_attempts` | Matching section/question ID and a nonempty saved answer. DM statement rows deduplicate to one account. |
| Four `timed_*_question_answers` tables | Exact section table/question ID, nonempty answer; nested empty/null DM answers do not count. A skipped question is not treated as an attempt. |
| `coach_evidence` compatibility view | Archived practice/timed answers preserve the exact tuple even when timed attempts are reset. Completed coaching answers with `mode=coach` also qualify when `tag.id`, `tag.section`, `tag.mode` identify that same source question. Ambiguous/missing tags are excluded. |
| `ai_tutor_logs` | Can supply the reviewed problem, but an AI flag or a tutor request does not prove a student reported or attempted the question. It does not independently add recipients. |

Recipients must still exist in `auth.users`, have a profile, and not be soft-deleted, anonymous, Auth-banned or app-suspended. The union deduplicates by user UUID. The send transaction rechecks availability, so its final count can be smaller than the preview. It never adds students after the snapshot.

Historical limits:

- Practice telemetry begins with the May 2026 telemetry schema; older views/answers without identifiable saved evidence cannot be recovered.
- The October 2026 coaching archive migration backfills surviving answers and archives later writes. Timed resets before that archive, account deletion and coaching reset/deletion can remove evidence permanently.
- Unsynced offline attempts, unfinished coaching sessions, anonymous reports, unavailable profiles and activity from older clients that never recorded attempts are absent.
- Archived evidence is used through the compacted compatibility view, not guessed from scores, aggregate analytics, question views, emails or support text.

## Send, cancellation and audit

`admin.question_announcements` stores the immutable title/message, exact question tuple, audience, sender UUID, creation/send times and cancellation actor/time. `admin.announcement_recipients` stores each recipient UUID, whether they reported/attempted, exclusion, delivery, display-authorization, acknowledgement and cancellation times. Recipient UUIDs remain in the private audit record after account deletion; emails are not copied. `admin.announcement_audit` records send/cancel actions and counts.

Preview creates a frozen server-side snapshot with a 30-minute expiry. Abandoned drafts are removed on later preview requests after one day. Sending requires the preview creator and a still-confirmed finding. The preview UUID is the send idempotency key: repeated clicks, retries or a lost response cannot create a second send for that preview. The UI retains a pending preview in session storage across reloads and clears it after successful send/sign-out. Editing the message or audience invalidates the preview. Creating and explicitly sending a new preview is a new announcement.

Cancellation and display authorization lock the same announcement row. A fetched message remains cancellable until a fresh online `display` request authorizes its popup at a safe app screen. Already acknowledged or cancelled recipients cannot display it again.

**Display authorization is not proof a human read the message.** There is a small interval between the server authorizing display and the native UI presenting it. A crash, lost response or route change in that interval can leave an authorized recipient whose popup has not appeared. Cancellation conservatively does not recall authorized deliveries; the dashboard labels this count **display-authorized**. The next safe online check can resume an unacknowledged authorized message. The explicit dismissal is the acknowledgement.

This feature writes only announcement records. It does not regrade, edit questions, change scores, modify attempt history, close reports or send native push/email.

## App behaviour and security

`AnnouncementHost` mounts behind the existing authentication, onboarding, version and suspension gates. It checks on authenticated launch, foreground, reconnect and safe route changes, and retries every 30 seconds while safe/online. Only Home/tab landing pages and completed timed review/analytics screens are safe. Timed tests, coach sessions, practice questions and unknown future routes are deferred. Existing What's New and trial dialogs take priority.

One message is shown at a time. Pending messages are fetched in chronological batches of 20. New popups require online authorization, so an offline cache cannot display a cancelled message. A visible popup can be dismissed offline: an account-scoped AsyncStorage acknowledgement outbox is saved before closing and retried on reconnect/launch. A disk-write failure keeps the popup open with a retry message. Account changes stop the old queue; requests pin the matching user's token.

Administrator messages render only through React Native `Text`; there is no Markdown, HTML, link parsing or executable content. Long bodies scroll while the Dismiss button stays outside the scroll area.

All admin actions use the existing `admin-reports` function's verified Auth user and admin check, plus database admin checks. Private announcement tables have RLS and no student table grants. `student_announcements` is the only authenticated student RPC; it derives the recipient from `auth.uid()` and takes no user ID. It only lists/updates that account's records. Anonymous callers have no execute grant. Existing content, subscription and report policies are unchanged.

## Connect and release

No new provider keys or push credentials are needed.

1. Use a local or staging Supabase project first. Ensure its schema includes the current practice/timed answer tables, user admin/suspension fields, coaching archive and compacted `coach_evidence` view/`coach_evidence_records` table.
2. Apply `FutureDoc/supabase/migrations/20261020120000_admin_report_triage.sql` if not already present, then `20261020150000_question_announcements.sql`. Review dependencies and other pending migrations; do not push the whole unrelated working tree. The archive lookup index needs a planned migration window on large datasets.
3. Deploy the updated `admin-reports` function to that project using the steps in [ADMIN-DASHBOARD.md](ADMIN_DASHBOARD.md). It needs server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_ALLOWED_ORIGINS`. `ADMIN_SENTRY_ISSUES_URL` remains optional.
4. Configure the admin frontend with `mode=live`, `supabaseUrl`, `supabasePublishableKey`, `functionName=admin-reports`. Use an existing Auth account with `user_profiles.is_admin=true`. For the app build, set its existing `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to the same project's URL and public anon key. Never use the service-role key in either frontend.
5. Run a staging native app build containing `AnnouncementHost`, `AnnouncementCard`, `announcementQueue` and the navigator/modal changes. With two ordinary test users, verify the full send/display/dismiss flow, cross-account denial, timed deferral, cancellation, offline restart and large text.
6. After staging verification, explicitly deploy the migrations/function and publish the admin assets through the established processes. **Production delivery requires releasing the app update. Existing installed app versions will not fetch or display these announcements.** Release the app update before relying on this channel; sent notices remain pending for recipients until an updated client connects.

## Validation

From the website repository:

```powershell
npm.cmd run test:admin
npm.cmd run test:announcements:native
# With the local preview running:
node scripts/announcements-browser-check.mjs
```

The actual FutureDoc SQL is executed in isolated PGlite with synthetic source schemas. Tests cover all four sections and both source modes, archived coaching tags, account exclusion, empty answers, snapshot immutability, expiry, confirmation, idempotency, cancellation, RPC/table permissions and ownership. Shared queue tests cover serial display, offline acknowledgement/restart, late network responses, safe routes and storage failure. The endpoint tests cover authentication, actor spoofing and exact content resolution. Expo's installed Babel preset validates the six changed native modules.

Edge browser checks cover compose → preview → send → popup → offline dismiss → server acknowledgement, recipient choices, preview restoration, cancellation, timed deferral, plain text and desktop/390px/320px layouts. Screenshots are in `.admin-preview/`.

Remaining release checks: native Modal lifecycle, iOS/Android font metrics, safe areas, long-message scroll, OS text scaling, screen-reader focus, Android back dismissal, account switching during in-flight requests and foreground timing on real devices. The browser uses the same card styles through the existing native adapter; it cannot prove native rendering or OS lifecycle parity. Hosted Auth/Edge and an actual native build were not run against a database during this task.
