# UCAT question-content pipeline

This repository now has a reusable generate → screen → blind validate → preview → release workflow for VR, DM, QR and SJ. It reads the existing Supabase question tables directly, so you do not need to download tables or paste them into a chat.

The everyday instruction is simply:

> Generate 20 DM practice questions.

Substitute VR, QR or SJ and choose the count. That short request refreshes the current live corpus, generates and independently validates the batch, revises failures, preserves the reports, and installs only the accepted batch into the matching local practice-preview JSON. SQL and Supabase changes remain separate opt-in actions.

“Current” means the corpus is refreshed at the beginning of each generation run. If Supabase cannot be read, the workflow stops before automatic installation rather than pretending its duplicate check is complete.

## Safety boundaries

- Corpus sync is read-only and exports question content only—not users, attempts, payments or credentials.
- The full practice + timed corpus is used for duplicate screening. Preview JSON is only an explicitly labelled offline fallback.
- Generation and validation use separate agents/contexts. The validator commits independent answers before seeing the supplied key.
- Installing a local preview never updates Supabase.
- SQL generation writes a reviewable file only. Applying it requires a separate explicit command.

## First-time and routine commands

```powershell
npm install                                # Install the existing project dependencies.
npm run questions:test                    # Run every local pipeline test without contacting Supabase.
npm run questions:sync:vr                 # Refresh the live VR practice + timed duplicate-check corpus.
npm run questions:sync:dm                 # Refresh the live DM practice + timed duplicate-check corpus.
npm run questions:sync:qr                 # Refresh the live QR practice + timed duplicate-check corpus.
npm run questions:sync:sj                 # Refresh the live SJ practice + timed duplicate-check corpus.
```

The ignored live snapshots are stored at `content-authoring/cache/<section>-corpus.json`. Versioned candidates belong in `content-authoring/candidates/`; briefs, provenance, blind responses and validation reports belong in `content-authoring/reports/`.

## Ask Codex to run it

Example request:

> Use `$ucat-question-pipeline` to create 20 new practice QR questions. Refresh the live corpus, use separate generator and validator agents, install the accepted JSON in the QR developer preview after I approve it, and stop before SQL.

The generation brief pins the corpus `run_id`, exact count, type/skill and difficulty allocations, exclusions and output paths. A stale or mismatched corpus run is a validation failure.

## Check and blind-review a candidate

```powershell
npm run questions:check:qr -- content-authoring/candidates/qr-practice-20-v1.json -- --mode practice --expected-questions 20 --brief content-authoring/reports/qr-practice-20.brief.json --report content-authoring/reports/qr-practice-20-v1.deterministic.json
# Validate the app contract and compare the candidate with all existing practice + timed QR content.

npm run questions:blind-review:qr -- content-authoring/candidates/qr-practice-20-v1.json -- --output content-authoring/reports/qr-practice-20-v1.blind.json --response-output content-authoring/reports/qr-practice-20-v1.blind-response.json
# Create the answer-free packet and the validator response form.
```

Deterministic `PASS` means only that machine-checkable structure and lexical screening passed. It does not prove arithmetic, logic, ethical judgement, factual support or semantic originality.

## Test on a phone in Developer mode

```powershell
npm run questions:preview:install -- content-authoring/candidates/qr-practice-20-approved.json -- --section qr --mode practice --brief content-authoring/reports/qr-practice-20.brief.json
# Dry run: validate and show the destination without changing it.

npm run questions:preview:install -- content-authoring/candidates/qr-practice-20-approved.json -- --section qr --mode practice --brief content-authoring/reports/qr-practice-20.brief.json --write
# Back up the current QR practice preview and install the approved JSON.

npm start                                  # Start Metro so the development phone can load the changed JSON bundle.
```

On the phone, open Profile > Developer, enable the QR preview and reload the app. Substitute `vr`, `dm` or `sj` as needed. The phone must run Expo Go or a development build connected to Metro; Developer controls are absent from release/TestFlight builds. One section toggle switches both practice and timed content. Preview attempts are kept local and suppressed from remote telemetry/cloud queues.

## Release after a separate approval

```powershell
npm run questions:migration:qr -- content-authoring/candidates/qr-practice-20-approved.json -- --brief content-authoring/reports/qr-practice-20.brief.json --expected-questions 20 --output supabase/migrations/YYYYMMDDHHMMSS_add_qr_practice_batch.sql
# Revalidate and create a fail-fast practice migration file; do not apply it.

supabase db push                           # Change the linked database only after explicit approval and SQL review.
```

See `.codex/skills/ucat-question-pipeline/references/runbook.md` for all section commands and local paths.
