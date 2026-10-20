# Admin report dashboard backend

The frontend lives in the sibling `ucatgenius-web` repository at `/admin/`. Its `ADMIN-DASHBOARD.md` contains the full local preview, configuration, deployment and rendering verification guide.

No migrations or production data changes are required to open the frontend's fixture preview.

## Backend files

- `supabase/functions/admin-reports/index.ts`: service client and Deno entry point.
- `handler.js`: token verification, current admin permission, exact-origin CORS, request validation and response handling.
- `content.js`: exact section/mode question lookup, parents/children, lessons, forum content and Sentry links.
- `catalogue.json`: private, generated snapshot of bundled lessons, demos and worked examples, with source hashes.
- `supabase/migrations/20261020120000_admin_report_triage.sql`: private unified view, review state, immutable audit and service-role-only RPCs.

## Regenerate and test

```powershell
node scripts/export-admin-catalogue.mjs
node --test scripts/admin-reports-*.test.mjs
```

The exporter reads literal source data without executing app screens or contacting Supabase. The database test uses an isolated PGlite database and existing report-table migrations. It does not use `.env.local`, linked Supabase credentials or production data.

## Configuration

The hosted function uses automatic `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets, plus:

```text
ADMIN_ALLOWED_ORIGINS=https://ucatgenius.com,http://127.0.0.1:4173
ADMIN_SENTRY_ISSUES_URL=https://YOUR_ORG.sentry.io/issues/?project=YOUR_PROJECT_ID
```

The Sentry URL is optional. Set only the origins you intend to use. Keep deployment env files ignored, e.g. `.env.admin.local`.

The browser needs only the project URL and a publishable/anon key. All privileged reads/writes verify `auth.getUser(token)` and the current `user_profiles.is_admin` flag. RPCs recheck the verified actor and grant execution only to `service_role`. Existing student RLS, entitlements, forum storage policies and AI logs are unchanged.

Apply the admin triage migration and 20261020150000_question_announcements.sql to staging through the established migration process, after checking the compacted coaching evidence dependencies, then deploy only the admin function:

```powershell
supabase functions deploy admin-reports --project-ref STAGING_REF --no-verify-jwt
```

The function implements its own Auth verification before any privileged request, including media and activity. `--no-verify-jwt` disables only the gateway's legacy check. Local serving uses the same flag:

```powershell
supabase functions serve admin-reports --no-verify-jwt --env-file .env.admin.local
```

Review existing migration history before applying anything; this repository contains other pending work. This task did not deploy functions, apply migrations, grant admin privileges, or modify production reports.

## Review guarantees

Source report statuses remain authoritative. The dashboard maps `resolved` to `fixed` for questions/lessons and keeps support/forum status vocabulary. AI review state is separate and tied to the original evidence revision. Subsequent feedback reopens the AI row. Old `success=false` migration defaults do not automatically become failed requests.

Every mutation is atomic across the explicitly selected rows. Source locks, per-issue locking and revision checks reject stale reviews; fresh reports cannot be closed by an earlier selection. Each action records actor UUID, time, old/new status, finding and note. Historical notes are preserved. The service role cannot update/delete audit entries.

Unknown section/mode or unpublished preview IDs fail safely. Missing parents, questions and forum content are reported explicitly. The catalogue is the deployed source snapshot, not a reconstruction of an older student's app version.


## In-app question announcements

See [ANNOUNCEMENTS.md](ANNOUNCEMENTS.md) for audience resolution, private delivery RPCs, app lifecycle integration, the local demonstration and release checks. Production delivery requires releasing the updated app. No native push or score changes are included.
