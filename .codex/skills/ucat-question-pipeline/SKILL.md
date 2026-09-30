---
name: ucat-question-pipeline
description: Generate, screen, independently validate, revise, and prepare novel UCAT question batches for FutureDoc. Use when creating or reviewing practice or timed question content, checking it against existing Supabase content, or converting approved question JSON into a migration. Default to the fast local-authoring path; run the full release audit only when preview/release/SQL preparation is requested.
---

# UCAT question pipeline

Keep generation, validation, and release as separate stages. Never write to the live database or run `supabase db push` without an explicit request made after the user sees the validated content.

## Operating modes

Use the fast authoring path by default. It keeps the quality gates that catch structural, arithmetic-key, and semantic problems, but avoids unnecessary full-test generation, repeated corpus refreshes, sidecar search files, preview writes, and verbose evidence in Git-visible folders.

Switch to the release audit path only when the user explicitly asks to install a preview, prepare a release, create SQL, or otherwise requests release evidence. Release audit retains the complete blind/revealed review record and requires a full fresh validation after substantive revisions.

If a request explicitly asks for both practice and timed content in one section, treat them as one authoring run: refresh that section's corpus once, share one inventory and `corpus_run_id`, and validate the two candidates independently in parallel where possible.

## Simple request contract

Treat a request such as `Generate 20 DM practice questions` as a complete local-authoring instruction. Do not require the user to remember the workflow or repeat safety language.

When the request supplies a section and count, use fast authoring unless the user asks for release/preview handling:

1. Default to `practice` unless the user explicitly asks for a timed test.
2. Refresh the remote practice + timed corpus once per section run so duplicate screening uses the current database, not an old cache.
3. Run generation, deterministic preflight, and one independent blind/revealed validation pass. Do not generate a full timed test unless requested.
4. Keep intermediate candidates, packets, manifests, reports, and topic searches under the ignored run directory described below. Promote only the accepted candidate and final report when release evidence is requested.
5. Do not install a preview or create SQL in fast authoring. Those are explicit release actions.

Fast authoring still blocks on deterministic failure and unresolved validator blockers. It does not silently accept draft content.

If the remote corpus refresh fails, do not claim complete duplicate protection or install the batch automatically. Explain that the preview fallback is incomplete and wait for the user to choose whether to continue with that limitation.

If section or count is missing, ask only for the missing value. Recognise `VR`, `verbal`; `DM`, `decision`; `QR`, `quantitative`; and `SJ`, `situational` as section names. If a VR practice count is not divisible by four, ask for a valid count rather than silently changing it. Never install a failed, unresolved, or merely draft candidate. Respect an explicit request not to install the preview.

## Route the request

Choose the section first. Always read its content spec and JSON contract:

- VR: [content spec](references/vr-content-spec.md), [JSON](references/vr-json-contracts.md), [generator](references/vr-generator.md), [validator](references/vr-validator.md).
- DM: [content spec](references/dm-content-spec.md), [JSON](references/dm-json-contracts.md), [generator](references/dm-generator.md), [validator](references/dm-validator.md).
- QR: [content spec](references/qr-content-spec.md), [JSON](references/qr-json-contracts.md), [generator](references/qr-generator.md), [validator](references/qr-validator.md).
- SJ: [content spec](references/sj-content-spec.md), [JSON](references/sj-json-contracts.md), [generator](references/sj-generator.md), [validator](references/sj-validator.md).

For generation or revision, read the generator reference. For review, read the validator reference. Do not load other sections' detailed references unless the request spans them.
- For commands and handoff locations, read [references/runbook.md](references/runbook.md).

## Workflow

1. Confirm `section`, `mode` (`practice` or `timed`), and question count. Full timed counts are fixed: VR 44/22 minutes, DM 35/37, QR 36/26, SJ 69/26. Otherwise default to practice. VR practice totals must be divisible by four.
2. Refresh that section's read-only corpus once per run. If remote access fails, use the preview fallback and label the run as potentially incomplete.
3. Generate one compact inventory. Record nearest matches inline in the manifest rather than creating one sidecar file per topic. For QR practice, inspect `src/dev/preview-qr.json` only when the batch will be installed or when local preview novelty is part of the request.
4. Create a generation brief under the run directory. Copy the current corpus `run_id`; set exact unit/question counts, type/format and difficulty allocations, exclusions, and output paths before generating.
5. Use an isolated generator context to produce candidate JSON and a provenance manifest. Give it the brief, generator references, inventory, and nearest relevant matches. Do not give it permission to create a migration.
6. Run deterministic preflight before blind review. In addition to schema/allocation/corpus/novelty checks, verify every answer key against its option text and manifest verification ledger, all chart/table/geometry dimensions, and all question/set ID collisions. These checks exist to prevent an avoidable full blind rerun.
7. Create one answer-free blind packet and response form. Use a different validator context to solve every item before seeing supplied answers or explanations. Keep the packet and response in the ignored run directory.
8. Reveal only after the blind response is committed. The validator checks answer agreement, ambiguity, explanation quality, factual support, and semantic novelty, then writes one concise report. Do not create separate nearest-match or post-install files unless they are needed to explain a blocker.
9. If revision is required, revise only the reported blocker while preserving earlier versions in the same ignored run directory. A changed answer, option, stem, stimulus, calculation, or semantic context requires a fresh full blind/revealed pass. A metadata-only correction (path, timestamp, provenance wording, or formatting) needs deterministic recheck but not a new arithmetic blind pass.
10. In fast authoring, present the accepted candidate and concise report without installing it. In release audit, install only after acceptance; for QR practice use `--append`, and back up the existing preview. Preview installation is not database approval.
11. Generate SQL only after separate explicit approval. Generating SQL is not permission to apply it.

## Authoring evidence and run layout

Use a unique run directory such as `content-authoring/cache/runs/<run_id>/` for briefs, candidates, manifests, deterministic reports, blind packets/responses, validation reports, and nearest-match notes. The run directory is ignored by Git. Never put credentials, user records, or attempt data in it. If a release record is needed, copy only the final accepted candidate and final validation report to a user-requested tracked location.

When multiple sections are authored concurrently, give each section its own run directory and do not let agents rewrite another section's preview or evidence. A single orchestrator should fan out corpus sync, generation, deterministic checks, and independent validators where possible.

If delegation is unavailable, perform generation and validation in separate contexts and disclose that independence is reduced. Do not trade away the blind answer check merely to save time.

For a 20-question practice run, prefer the section-specific `dm-practice-20-brief.template.json`, `qr-practice-20-brief.template.json`, or `sj-practice-20-brief.template.json`. They provide reproducible default allocations. Change them only when the user requests a different mix.

For DM, preserve the Venn variety constraints when adapting a brief to another count. The DM generator and validator references define the qualitative mix and diagram checks; the brief and deterministic checker gate the measurable parts. An explicit user preference for a different Venn mix takes precedence.

For review-only requests, use the original brief and manifest when available. If either is missing, still run structural/count/corpus screening with `--expected-questions`, but label provenance and allocation validation incomplete; do not reconstruct a post-hoc brief and present it as original evidence.

## Release rules

- Machine checks cannot establish answer correctness or semantic originality; independent review is mandatory.
- Compare against practice content, timed content, and the pending batch.
- Preserve candidate and report versions in the ignored run directory rather than overwriting evidence from earlier passes or leaving every intermediate file in the normal Git diff.
- Never place credentials, user records, or attempt data in authoring artifacts.
- Treat the Supabase corpus as current only when the generation brief records the same corpus `run_id`.
- Stop before migration creation unless the user has approved the validated candidate.
- Preview mode must mark content as preview, make it locally accessible, and suppress remote practice telemetry and timed cloud submission/queueing.
