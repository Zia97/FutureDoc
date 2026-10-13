# Performance analyser

Implementation prepared on 13 October 2026. The database migrations and edge
function have **not been applied to the live project**.

## Student experience

The Analytics tab becomes Performance. Everyone sees animated marks rings, a
question count and a four-section breakdown, with separate practice and timed
views. The Pro card opens the existing purchase flow.

Pro adds 41 skill breakdowns, up to three evidence-backed priorities, six weeks
of interactive progress bars, practice/timed comparisons and median answer time.
Each skill links to an existing technique lesson and offers a focused session of
up to eight fresh practice questions or previously missed practice questions.
The existing question screens provide their normal explanations, tools and
telemetry. A completion screen returns to the skill analysis.

Rings and numbers animate into place, bars grow, cards reveal in sequence and
buttons respond to presses. Animations respect reduced-motion settings. Both
light and dark themes use the existing premium theme system.

## Reviewed tagging coverage

All question items in the read-only live corpus snapshot have metadata. A DM
statement group is one question item. The original question bank is unchanged.

| Section | Practice | Timed | Skills | Excluded pending content review |
| --- | ---: | ---: | ---: | ---: |
| VR | 452 | 220 | 9 | 10 |
| DM | 354 | 175 | 10 | 8 |
| QR | 450 | 180 | 11 | 3 |
| SJ | 365 | 345 | 11 | 20 |
| Total | 1,621 | 920 | 41 | 41 |

Accepted metadata lives in `src/data/performance/{vr,dm,qr,sj}-tags.json`.
Each item has a primary skill, up to two secondary skills, classification
confidence, rationale, source difficulty, parent context ID, scoring metadata
and a content fingerprint. Primary skills drive the report so the same question
does not inflate several skill scores. Secondary labels are retained for future
use. Every skill has a description, practical tip and validated lesson route.

The tag mapping received independent metadata review. This was not an exhaustive
blind re-solve of every existing question. During review, 41 existing content
issues were identified and excluded from this analyser's scoring and practice
recommendations. Reasons and question IDs are recorded in `excludedReason` in
the tag files. This includes 19 timed SJ items whose displayed rating scale
does not contain the stored answer. Exclusion does not repair or remove those
items from the original practice/test screens; they remain a content-review
backlog. Existing mock results can consequently differ from the analyser.

## How the numbers work

- Practice uses the first recorded response to each question/DM statement.
  Latest responses determine which practice mistakes still need review.
- SJ uses the existing partial-credit rules. Complete five-statement DM questions
  earn two marks for all correct and one for four correct. Statement telemetry is
  reconstructed into one question; repeated whole-question timings are counted
  once. Incomplete statement records do not produce a scored diagnosis.
- Priorities need at least ten distinct questions across three different parent
  sets, marks below 80%, and some first-response evidence within the last 28 days.
  The headline skill percentage uses all available first responses, not only the
  recent window. Small samples are labelled Early signal; older evidence is
  labelled Check again. These thresholds are product heuristics, not calibrated
  psychometric mastery estimates.
- Trend indicators compare the previous and current 14-day windows only within
  matching difficulty levels with at least five questions in each. Weekly bars
  remain descriptive: different weeks can contain different question mixes.
- Timing ignores missing values and values outside 0.5–600 seconds. It includes
  reading shared material and is not a diagnosis of the reason for a mistake.
- Only synced practice telemetry and saved submitted timed tests are available.
  Local-only/offline answers are not backfilled. Existing timed storage retains
  one saved result per test; resetting and retaking a test replaces that result.
  This release does not reconstruct overwritten attempts or add a retake archive.
- Fresh drills use only unseen practice items. They never reveal unseen timed
  test items. Low-confidence classifications do not drive skill recommendations.
- No predicted UCAT score, percentile, promised score gain or inferred clinical
  judgement is presented.

## Access and data boundaries

`supabase/functions/performance-analysis/index.ts` authenticates the bearer token
and filters every student query by that authenticated user's ID. It ignores
caller-supplied user IDs and Pro flags. Cursor pagination reads beyond 1,000 rows.
The only shared cache is question metadata, lasting at most 60 seconds.

Pro is verified using the existing `REVENUECAT_SECRET_KEY` and entitlement
`UCAT Genius AI Pro`. If that secret is absent, the server uses the protected
`user_profiles.is_premium` mirror and its expiry. Admins retain access. A
RevenueCat error does not fall back to an unverified client claim. Basic reports
do not require a RevenueCat request.

Free responses have `details: null`; they contain no skill results or practice
selections. The new metadata tables deny direct anon/authenticated access. The
app also gates deep links and hides stale reports when identity or entitlement
changes. Reports are marked `Cache-Control: no-store`.

Source-question, parent-context and DM child-table triggers invalidate reviewed
tags after content changes. A re-review and a new metadata migration are needed
to reactivate them. The catalogue cache can take up to 60 seconds to reflect an
invalidation. Newly added questions require tagging before skill analysis.

## Validation

Run from the repository root:

```powershell
npm run test:performance
npm run performance:validate-tags
node scripts/validate-performance-tags.mjs --corpus-dir content-authoring/cache/performance-build
npx --yes deno check --no-lock supabase/functions/performance-analysis/index.ts
npx expo export --platform ios --platform android --output-dir .expo/performance-build --no-bytecode
```

The 22 automated tests cover scoring, first responses/retries, sparse/stale
evidence, matched-difficulty trends, exclusions, pagination, retained parent
context, entitlement expiry, actual handler authentication, forged access/user
IDs, per-user isolation and RevenueCat failure handling.

Local additional checks passed: PostgreSQL-compatible PGlite applied both
migrations (41 skills/2,541 tags), rejected authenticated direct reads and
exercised question/DM child invalidation; mocked-native React rendering checked
the paywall, skill/lesson navigation, subscription revocation, targeted-session
selection and completion; a 390px React Native Web harness displayed the actual
overview, lock card, skill list and detail layouts with no page errors or
horizontal overflow. Those harnesses use synthetic student responses and live
only under ignored `.expo/performance-tools`. They are not physical-device or
live-purchase verification.

## Rollout

The question-pipeline skill requires a separate explicit live-write request
after review. Until then, keep these changes local.

1. Immediately before release, refresh the read-only corpus into a fresh folder
   and validate the fingerprints. For example:

   ```powershell
   node .codex/skills/ucat-question-pipeline/scripts/export-vr-corpus.mjs --source remote --output content-authoring/cache/performance-release/vr-corpus.json
   node .codex/skills/ucat-question-pipeline/scripts/export-section-corpus.mjs --section dm --source remote --output content-authoring/cache/performance-release/dm-corpus.json
   node .codex/skills/ucat-question-pipeline/scripts/export-section-corpus.mjs --section qr --source remote --output content-authoring/cache/performance-release/qr-corpus.json
   node .codex/skills/ucat-question-pipeline/scripts/export-section-corpus.mjs --section sj --source remote --output content-authoring/cache/performance-release/sj-corpus.json
   node scripts/validate-performance-tags.mjs --corpus-dir content-authoring/cache/performance-release
   ```

   A mismatch requires re-review. Do not regenerate hashes to bypass it. Avoid
   concurrent content edits between this validation and metadata installation.

2. Review the linked project's pending migrations with
   `supabase db push --linked --dry-run`. Once live writes are explicitly
   authorised, apply `20261013170000_performance_analyser.sql` followed by
   `20261013170100_seed_performance_tags.sql`. Do not include unrelated pending
   migrations without reviewing them.
3. Confirm the server RevenueCat secret is configured, then deploy
   `supabase functions deploy performance-analysis --use-api`. Existing Supabase
   URL/service-role secrets are used automatically; no secret goes in the app.
4. Smoke-test free, active Pro, expired Pro and admin accounts; submit a practice
   response and a timed test, check the report, open a lesson and complete a
   focused session. Test reduced motion and large text on iOS and Android.
5. Release the app only after the backend is ready. Before deployment the new
   screen shows a retryable loading error because its endpoint does not exist.

For later tagging revisions, update the JSON, validate against fresh content and
generate a **new** migration with
`node scripts/build-performance-tag-migration.mjs supabase/migrations/<timestamp>_update_performance_tags.sql`.
Do not rerun an old seed to clear invalidations: it can restore obsolete answer
metadata. The generator only writes local SQL and never contacts Supabase.

If an app rollout must be reverted, restore the previous app build. The new
tables and function are additive and do not need to be dropped to roll back the
UI. No source questions or student attempt records are rewritten by this release.
