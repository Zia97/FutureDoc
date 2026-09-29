---
name: ucat-question-pipeline
description: Generate, screen, independently validate, revise, and prepare novel UCAT question batches for FutureDoc. Use when creating or reviewing practice or timed question content, checking it against existing Supabase content, or converting approved question JSON into a migration.
---

# UCAT question pipeline

Keep generation, validation, and release as separate stages. Never write to the live database or run `supabase db push` without an explicit request made after the user sees the validated content.

## Simple request contract

Treat a request such as `Generate 20 DM practice questions` as a complete local-authoring instruction. Do not require the user to remember the workflow or repeat safety language.

When the request supplies a section and count:

1. Default to `practice` unless the user explicitly asks for a timed test.
2. Refresh the remote practice + timed corpus on every run so duplicate screening uses the current database, not an old cache.
3. Run the complete generation, deterministic screening, blind independent validation, and revision workflow below.
4. Only after the batch is accepted, retain the versioned candidate and reports, run the preview installer with its brief, back up the current preview, and write the accepted batch to `src/dev/preview-<section>.json`.
5. Stop before SQL or any database write. Those always require a later explicit request.

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
2. Refresh that section's read-only corpus from Supabase. If remote access fails, use the preview fallback and label the run as potentially incomplete.
3. Generate the compact corpus inventory, search it for the proposed topics, and record the nearest existing matches. For QR practice, also inspect `src/dev/preview-qr.json` so a new batch does not duplicate accepted questions still in the local preview.
4. Create a generation brief. Use `assets/generation-brief.template.json` for VR or `assets/section-generation-brief.template.json` for DM/QR/SJ. Copy the current corpus `run_id`; set exact unit/question counts, type/format and difficulty allocations, exclusions, and output paths before generating.
5. Use an isolated generator agent/context to produce candidate JSON and a provenance manifest. Use `assets/generation-manifest.template.json` for VR or `assets/section-generation-manifest.template.json` for DM/QR/SJ. Give it the brief, generator references, corpus inventory, and nearest relevant matches. Do not give it permission to create a migration.
6. Run the deterministic checker with `--brief`. Schema, allocation, corpus-run, or high-similarity failures return to the generator/reviser before qualitative review.
7. Create a blind-review packet and separate response form. Use a different validator agent/context to fill and save the response form before it sees the supplied answers or explanations.
8. After the blind response is committed, reveal the original candidate, provenance, deterministic report, and nearest matches. The validator checks answer agreement, ambiguity, explanation quality, factual support, and semantic novelty. It writes a structured report using the VR or section validation-report template and does not edit the candidate.
9. If revision is required, the generator/reviser writes a new version. A fresh validator pass repeats the full workflow; do not validate only the changed lines.
10. Present the accepted JSON and report to the user. For a simple generation request covered by the contract above, install it into the local developer preview automatically after acceptance; otherwise install only when requested. For QR practice, use the preview installer's `--append` option so accepted batches accumulate in one app-loaded JSON file. Preview installation is not database approval.
11. Generate SQL only after a separate explicit approval. Generating SQL is not permission to apply it.

If delegation is unavailable, perform generation and validation in separate contexts and disclose that independence is reduced.

For a 20-question practice run, prefer the section-specific `dm-practice-20-brief.template.json`, `qr-practice-20-brief.template.json`, or `sj-practice-20-brief.template.json`. They provide reproducible default allocations. Change them only when the user requests a different mix.

For DM, preserve the Venn variety constraints when adapting a brief to another count. The DM generator and validator references define the qualitative mix and diagram checks; the brief and deterministic checker gate the measurable parts. An explicit user preference for a different Venn mix takes precedence.

For review-only requests, use the original brief and manifest when available. If either is missing, still run structural/count/corpus screening with `--expected-questions`, but label provenance and allocation validation incomplete; do not reconstruct a post-hoc brief and present it as original evidence.

## Release rules

- Machine checks cannot establish answer correctness or semantic originality; independent review is mandatory.
- Compare against practice content, timed content, and the pending batch.
- Preserve candidate and report versions rather than overwriting evidence from earlier passes.
- Never place credentials, user records, or attempt data in authoring artifacts.
- Treat the Supabase corpus as current only when the generation brief records the same corpus `run_id`.
- Stop before migration creation unless the user has approved the validated candidate.
- Preview mode must mark content as preview, make it locally accessible, and suppress remote practice telemetry and timed cloud submission/queueing.
