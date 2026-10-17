# AI coaching implementation and release

Coaching is accessible from Home in the updated app. Every student completes the saved assessment before personalised practice or coach chat. The backend was activated on 17 October 2026 on the linked Supabase project `dvykcokcsdrfdupqqdzp`; use the matching local development app to test the new screens.

## Activation record — 17 October 2026

- Applied `20261017000001_ai_coaching.sql` and `20261017000002_shared_ai_learning_memory.sql`. The second migration also adds missing legacy tutor-log columns (`question_type`, `question_text`, `user_answer`) safely with `IF NOT EXISTS`; the compatibility case passed the local Postgres regression check before retrying.
- Deployed `ai-coach` version 1 and `ai-tutor` version 46. Both report ACTIVE with JWT verification enabled. The existing provider and entitlement secrets were present; no secret values were changed.
- Verified all three assessment forms still have 48 eligible live question tags each. Confirmed six coaching tables, five archive triggers, the shared-history view and summary function, and private/service-only memory access.
- Final migration dry run reports the remote database is up to date. Live anonymous requests reached both handlers and returned 401 as expected, without AI calls or student account changes. Signed-in coaching, explanations and device behaviour still need an in-app smoke test.

## Student experience

- New sessions use the private `coach-intro-v2` assessment: 48 newly authored questions, 12 per section. It preserves three VR passages, twelve DM questions covering six types, three QR sets and four SJ scenarios. Both SJ rating scales include all four rating levels. Questions are separate from the ordinary practice/timed bank. Previously started sessions and completed baselines retain their frozen content.
- The assessment is four mini timed tests using the same `TimedQuestionPanel` as the four existing timed-test screens. It also reuses their instruction, navigation, answer, flag, notes, calculator, pause and review components. There is no AI tutor during the assessment. Numbering and navigation reset within each section; finishing a section opens the next section's instructions.
- Working times: VR 6:00, DM 12:40, QR 8:40, SJ 4:30. Allow roughly three minutes for instructions. Optional 25% or 50% extra time is fixed at session creation. Each instruction screen starts its section after 45 seconds, or the student can tap Start Test sooner; its countdown does not consume working time.
- Answers, flags and active time are checkpointed locally and synced. Backgrounding pauses the session. Interruptions are recorded without reducing marks. Finished sections cannot be changed. The service withholds keys and explanations until the whole session is complete.
- Results show marks, timing, completion and a starting practice estimate. The hub shows up to six strengths and six areas to build, with evidence counts and early-signal labels.
- Practice is open ended: complete a short set, review it, continue, switch focus or finish. Select a section/skill, review mistakes, or take a fresh timed check. Selection uses eligible practice questions and preserves unseen timed mocks.
- The assessment, report, one coached set and five successful coach replies are free. Existing Pro trial and AI Tutor counters are untouched. Further sets/chat require verified Pro. Earned reports remain available and started sessions remain resumable after expiry. Chat has a 100-request daily limit. Provider failures return saved fallback text without spending a free reply.

## Scoring limits

Grading is deterministic, including DM statement-group partial credit and SJ adjacent-answer credit. Neither subscriptions nor pauses affect marks or estimates. The starting assessment is immutable. Easier, repeated or untimed drills cannot inflate its estimate.

The cognitive estimate reuses the app's existing approximate conversion functions. Its range illustrates the effect of changing two questions' worth of marks in each cognitive section. **This is not a calibrated confidence interval or a prediction of real exam results.** The report states this beside the number. SJ shows marks without an unsupported band prediction. Empirical calibration is needed before stronger predictive claims. The scoring module's real-exam SEM is not used for this assessment.

The new question batch was screened against refreshed live practice and timed corpuses using the UCAT question pipeline. Independent reviewers answered key-free packets before reading authored answers, then reviewed explanations, ambiguity, canonical skill mappings and novelty. DM Venn diagrams also received geometry and phone-layout checks. This is independent model-assisted content review; it is not empirical psychometric calibration or a claim of external expert accreditation. Twelve questions per section sample skills and cannot establish mastery of every question type.

## Architecture and memory

`src/lib/coaching/engine.js` owns grading, evidence aggregation, recommendations, progress validation and the public session projection. `sessionState.js` owns timer transitions. Review time consumes the section clock without being assigned to the last question. Screens share the timed question panel and existing DM/QR renderers, answer options and calculator.

`supabase/functions/ai-coach/assessment-v2.json` holds the private, independently accepted question snapshots and grading metadata. It is imported only by the edge function, never bundled with the mobile app. `content.ts` validates the release and canonical skills, loads private assessment snapshots without querying the general bank, and retains ordinary bank loading for coached practice. The public projection withholds keys and explanations until completion. This content revision requires an updated `ai-coach` deployment; no database migration or AI-tutor deployment is needed. The earlier activation record describes version 1, before this local content/UI revision.

The authenticated `ai-coach` edge function owns selection, grading and access. Each session freezes content, tags and keys. Clients cannot directly read/write coaching tables or supply scores, entitlement or selected bank IDs. Service-only RPCs lock the account and use optimistic versions to prevent duplicate previews and conflicting writes.

| Table | Persistent information |
| --- | --- |
| `coach_profiles` | Exam date, time allowance, baseline ID and free-credit use markers |
| `coach_sessions` | Frozen content, progress, reports, lifecycle/version |
| `coach_evidence` | Append-only answer archive with grading snapshots |
| `coach_plans` | Plan snapshots when the day, evidence or preferences change |
| `coach_milestones` | Permanently earned achievements |
| `coach_messages` | Request IDs and quota metadata only; chat text stays in the active app session |

Students can reset coaching from **Coaching → Coach settings → Delete coaching data**. A destructive confirmation explains that the initial assessment, session answers/reports, coaching evidence, plans, milestones and coach chat are erased; the student must then resit the initial assessment. Separate practice, timed-test and AI tutor records remain. The reset runs in one database transaction for the authenticated account and clears only that account's local coaching checkpoints. Free coaching preview and chat use remain consumed after a reset. Activate this feature by applying `20261017000003_coach_reset_progress.sql` and deploying the updated `ai-coach` function.

Archive triggers cover practice submissions and all four timed-answer tables. Existing stored attempts are backfilled. Subsequent timed resets preserve the archive; results deleted before this migration cannot be recovered. Account deletion cascades through all coaching tables and clears local uploads/checkpoints.

Ordinary practice now has an account-scoped, idempotent offline queue. Existing timed sync is retained. Coaching checkpoints and date edits retry on foreground/reconnect and hub opening. Cross-device conflicts require an explicit reload. A force-kill can lose approximately the last second since the most recent checkpoint; local storage failures are shown in the runner.

First encounters drive skill evidence. Retakes remain retrievable without counting as fresh improvement. DM statements are reconstructed into whole responses. Practice and uninterrupted timed evidence are separated; trends require sufficient matched difficulty groups. Mixed-question weekly charts are descriptive.

## Coach agent

`agent.ts` implements one tool-using coach through the Responses API. It reads the computed profile first, then can retrieve skill details, old attempts, conversations and earlier plans. Every retrieval is scoped to the authenticated account. Postgres holds long-term memory; it is retrieved in pages rather than placing every historical record into every prompt.

The model explains evidence and suggests next steps. It cannot alter scores, grant Pro, choose arbitrary questions or write preferences. Instructions require encouraging language, restraint with sparse evidence and no purchase pressure. Tools are read only, calls/output are bounded, and provider response storage is disabled. Deterministic coaching continues when the model is unavailable.

## Shared tutor and coach memory

The tutor and coach share an encouraging mentor voice and private learning context without changing their screens. The coach chat behaves like the AI Tutor: messages and short-term conversation context stay in app memory while the chat is open, then clear when it closes. The database stores request IDs and quota metadata only; coach text is not written to `coach_messages` or copied to `ai_tutor_logs`.

`ai_support_summary` aggregates tutor conversations by section and reviewed skill/topic, including recent requests and distinct questions. Counts show engagement only: curiosity, interest in a passage or debate must not be interpreted as a need for extra help. For example, five questions about one VR passage do not establish difficulty with VR. Explicit requests for support can guide explanations; measured weaknesses still require performance evidence. Asking again does not reduce marks, alter confidence, or create a weakness. Model-labelled misconceptions in legacy analytics are not treated as confirmed learning facts. Question-tag metadata supplies canonical skill labels; untagged questions remain unclassified by skill.

The tutor reads the same current performance calculation as coaching, including relevant skill evidence, timing conditions, confidence, exam date and the current plan when an assessment has been completed. It receives relevant earlier explanations and coaching conversations. The coach receives the help-topic summary alongside its performance profile. Both can use the authenticated `get_learning_history` tool to search or page older conversations. Relevant data is supplied as untrusted context; prior messages cannot grant access or override instructions. Earlier explanations flagged as possible content errors must not be reused as teaching authority.

Demo lessons, developer JSON previews, failed tutor requests, pending coach replies and coach fallbacks are excluded from shared memory. Optional memory failures leave ordinary question explanations and coach fallbacks available. Retrieval never spends another tutor credit or coaching preview. No additional API key or feature flag is required.

## Release configuration

1. Ensure performance migrations `20261013170000_performance_analyser.sql` and `20261013170100_seed_performance_tags.sql` are present. Coaching reads their reviewed metadata and respects content-change exclusions.
2. Review/apply `20261017000001_ai_coaching.sql`, `20261017000002_shared_ai_learning_memory.sql` and `20261017000004_ai_coach_central_logs.sql` through the normal migration process. The shared-memory migration also requires the existing tutor observability migration `20260929000002_ai_tutor_observability.sql`. Review other pending migrations before a general database push.
3. Configure `OPENAI_API_KEY` as a Supabase edge secret. `COACH_MODEL` defaults to the existing tutor model, `gpt-6-luna`; confirm account availability before release. Existing `REVENUECAT_SECRET_KEY` enables live verification; without it the protected premium profile mirror is used.
4. Deploy the updated `ai-coach` and `ai-tutor` functions with the project's JWT convention after the migrations. Both handlers independently validate bearer tokens with Supabase Auth. Keys stay on the server.
5. Smoke-test free, existing, Pro and expired accounts, purchase/restore, and offline assessments on physical iOS/Android devices against the deployed service.

`COACH_ENABLED=false` disables the service. `COACH_AI_ENABLED=false` disables model calls while retaining deterministic workflows and fallbacks.

## Developer sample results on a phone

In a development build, enable **Profile → Developer → Coaching sample results**, then open Home → Coaching before completing the assessment and tap **Developer: preview sample results**. It opens a clearly labelled synthetic report using the real question selection and grading code. It does not save a session, affect the profile, or consume a free preview. The toggle and button are compiled out of production builds. The endpoint independently requires the signed-in account to have `user_profiles.is_admin = true`. Your phone must use the development app configuration pointing to a Supabase project with the coaching migration, question tags and updated edge function. If the button is unavailable, make sure the toggle is on, you launched with the development build/Metro, and you have not already created an assessment.

`npm run coaching:build-assessment -- <accepted-release.json>` packages four independently accepted pipeline candidates into the private edge-function asset. It checks PASS reports against the exact candidate SHA-256 hashes, question counts, canonical mappings and answer/option compatibility. The accepted release inputs and review reports are under `content-authoring/cache/runs/20261017-coach-intro-v2/`. Review the generated package and validation reports before releasing new content. Existing sessions retain their snapshots; a release with missing skills fails closed. `coaching:build-forms` and `forms.json` preserve the historical bank-backed v1 forms and do not select new assessments.

## Verification

The local assessment revision passed 37 coaching tests, 8 existing timed-test/report regression tests, strict TypeScript checking of the coach function with local Deno/Supabase declarations, and iOS/Android bundle exports. A phone-sized browser harness exercised all 48 new questions, both themes, answer selection, notes, calculator, flags, navigation, review timing, pause/resume and section completion. The saved tables and Venn screenshots were inspected. No private assessment question IDs appear in either mobile bundle. These checks used the accepted VR v1, DM v3, QR v1 and SJ v4 candidates; their independent PASS report hashes are recorded in the package.

```sh
npm run test:coaching
npm run test:performance
npm run performance:validate-tags
deno check --no-lock supabase/functions/ai-coach/index.ts
npx expo export --platform ios --platform android --output-dir .expo/coaching-build --no-bytecode
```

Tests cover the actual handler, mocked model tool loop, storage recovery, scoring/selection and SQL in PGlite Postgres. They verify ownership, RPC permissions, preview reservation, completion retries, archives after resets, quotas and account deletion. Assessment checks cover section transitions, review timing, private-content selection, canonical evidence, grading and key withholding. Browser checks exercise real screens/renderers with mocked navigation/backend/native wrappers, including phone widths, themes, notes, calculator, flags, review and pause/resume.

Shared-memory regression checks additionally exercise the SQL view and summary, both tutor and coach tool loops, tutor handler integration, account isolation, unchanged performance despite frequent help, demo/preview exclusions and unavailable memory. Model responses are mocked; natural teaching quality still needs live review.

Native bundle exports and these checks do not replace physical-device testing or a live OpenAI/RevenueCat/Supabase smoke test. Backend deployment and live schema checks are recorded above; signed-in teaching quality still needs an in-app review.
