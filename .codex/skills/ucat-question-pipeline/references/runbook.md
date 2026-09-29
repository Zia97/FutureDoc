# Command runbook

Run commands from the repository root. The comment beside each command says what it does. With this Windows/npm setup, named script options need the second `--` shown below.

## Short requests

The normal user instruction can be as short as:

> Generate 20 DM practice questions.

This means: refresh the live DM corpus, generate, screen for duplicates, blind-validate, revise until accepted, preserve the candidate and reports, back up the old DM practice preview, and install the accepted JSON. It never means create SQL or update Supabase. The same shorthand works with VR, QR, or SJ and any valid practice count; VR counts must be divisible by four.

## Refresh the duplicate-check corpus

```powershell
npm run questions:sync:vr                 # Read all live VR practice + timed content into the ignored local cache.
npm run questions:sync:dm                 # Read all live DM practice + timed content into the ignored local cache.
npm run questions:sync:qr                 # Read all live QR practice + timed content into the ignored local cache.
npm run questions:sync:sj                 # Read all live SJ practice + timed content into the ignored local cache.

npm run questions:inventory:dm            # Create a compact DM planning inventory from the latest cache.
npm run questions:inventory:qr            # Create a compact QR planning inventory from the latest cache.
npm run questions:inventory:sj            # Create a compact SJ planning inventory from the latest cache.

npm run questions:inventory:qr -- -- --query "currency conversion" --output content-authoring/reports/qr-topic-search.json
# Save the nearest existing QR sets for a proposed topic before generation starts.
```

If Supabase cannot be reached, replace `sync:<section>` with `sync:<section>:preview`. That fallback is incomplete and must be recorded as such in the brief.

## Validate a candidate

Replace `dm` with `qr` or `sj` in the following commands.

```powershell
npm run questions:check:dm -- content-authoring/candidates/dm-practice-20-v1.json -- --mode practice --expected-questions 20 --brief content-authoring/reports/dm-practice-20.brief.json --report content-authoring/reports/dm-practice-20-v1.deterministic.json
# Check the DM app schema, exact count, IDs, ordering, allocations, and overlap with all live practice + timed content.

npm run questions:blind-review:dm -- content-authoring/candidates/dm-practice-20-v1.json -- --output content-authoring/reports/dm-practice-20-v1.blind.json --response-output content-authoring/reports/dm-practice-20-v1.blind-response.json
# Hide answers/explanations and create the independent validator's response form.
```

The validator commits the response form before seeing the original candidate. After reveal, it writes a separate report and never edits the candidate. Revisions get a new candidate version and a complete new validation pass.

## Put approved JSON into the phone preview

The first command is a dry run. It performs deterministic validation and shows the target but changes nothing. The second command replaces the static preview JSON and saves the old file under the ignored cache.

```powershell
npm run questions:preview:install -- content-authoring/candidates/dm-practice-20-approved.json -- --section dm --mode practice --brief content-authoring/reports/dm-practice-20.brief.json
# Dry-run validation for the DM practice preview; no file is changed.

npm run questions:preview:install -- content-authoring/candidates/dm-practice-20-approved.json -- --section dm --mode practice --brief content-authoring/reports/dm-practice-20.brief.json --write
# Back up src/dev/preview-dm.json and install the approved candidate for local device testing.
```

Use `qr` or `sj` for those sections. Use `--mode timed` only for a complete timed wrapper (DM 35, QR 36, SJ 69). In the development app, open Profile > Developer, toggle the section, then reload so Metro rebundles the static JSON. One section toggle controls both its practice and timed preview files.

The Developer controls exist only in `__DEV__`. The phone must be using Expo Go/a development build connected to this computer's Metro server. A standalone/TestFlight/release build cannot read newly edited workstation JSON without a rebuild or update.

Preview content is marked free and local. Practice preview answers stay in local storage but do not write practice telemetry; timed preview results stay local and do not submit or queue cloud writes.

For QR practice, append each accepted batch to the same `src/dev/preview-qr.json` file after screening it against the existing preview. Repeating an install of an identical batch is a no-op; a reused set ID with changed content is rejected. The installer checks the combined preview and backs up the current file before a write:

```powershell
npm run questions:preview:install -- content-authoring/candidates/qr-practice-20-v3.json -- --section qr --mode practice --brief content-authoring/reports/qr-practice-20-v3.brief.json --append
npm run questions:preview:install -- content-authoring/candidates/qr-practice-20-v3.json -- --section qr --mode practice --brief content-authoring/reports/qr-practice-20-v3.brief.json --append --write
```

The versioned candidate and validation files are the review record. Only `src/dev/preview-qr.json` is loaded by QR developer mode.

## Create SQL only after approval

```powershell
npm run questions:migration:dm -- content-authoring/candidates/dm-practice-20-approved.json -- --brief content-authoring/reports/dm-practice-20.brief.json --expected-questions 20 --output supabase/migrations/YYYYMMDDHHMMSS_add_dm_practice_batch.sql
# Revalidate the approved practice JSON and write fail-fast SQL; this does not contact Supabase.

supabase db push                            # Apply reviewed migrations; run only after explicit approval to change Supabase.
```

The practice converter also supports `qr` and `sj`. Timed migration conversion remains a separate, deliberate release task because it must allocate a new test ID. Never edit `content_versions` manually; database triggers update it.

## Artifact locations

- Live cache: `content-authoring/cache/<section>-corpus.json` (ignored by Git).
- Versioned candidates: `content-authoring/candidates/`.
- Briefs, manifests, blind responses and reports: `content-authoring/reports/`.
- Local phone preview JSON: `src/dev/preview-<section>.json` and `preview-<section>-timed.json`.
- Approved migration files: `supabase/migrations/`.
