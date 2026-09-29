# AI Tutor v2 rollout

This release moves every tutor section to GPT-6 Luna with medium reasoning and
adds targeted teaching cards, a QR calculator, structured diagnostics, learner
misconception memory, cost/latency telemetry, and student helpfulness feedback.

## What changes in plain English

| Change | Plain-English reason |
| --- | --- |
| GPT-6 Luna through the Responses API | The tutor can reason and use tools while remaining suitable for high-volume questions. |
| One shared tutor contract plus section/type cards | Each question receives the relevant mini lesson plan instead of every rule in the curriculum. |
| Explicit prompt caching | Repeated instructions can be reused; changing student content is not unnecessarily written to cache. |
| QR calculator tool | Luna chooses the mathematical setup, while code performs the arithmetic exactly. |
| Structured diagnostic fields | The student sees a natural answer; the app separately records the skill, likely misconception, and possible content-record issue. |
| Learner memory | Repeated misconceptions can influence later explanations without exposing internal tracking to the student. |
| Telemetry and feedback | We can compare quality, speed, token usage, estimated cost, and Helpful/Not helpful ratings rather than guessing. |

## Safe deployment order

The repository is linked to Supabase project `dvykcokcsdrfdupqqdzp`. Confirm that
this is the intended production project before running either mutating command.

1. Apply the additive database migration:

   ```powershell
   supabase db push --linked
   ```

2. Deploy the Edge Function after the new columns and RPC exist:

   ```powershell
   supabase functions deploy ai-tutor --use-api
   ```

3. Smoke-test one real attempted question from VR, DM, QR, and SJ. For QR, use
   a question that requires arithmetic. Submit Helpful/Not helpful on at least
   one response.

4. Release the app build containing the feedback UI and specific QR/SJ question
   type labels. The upgraded server remains compatible with older app builds,
   but only the new build exposes ratings.

5. Run the monitoring queries in
   `supabase/functions/ai-tutor/eval/README.md` after the first traffic arrives.

## Pre-release quality check

Run the ten representative tutor cases with a development OpenAI key:

```powershell
$env:OPENAI_API_KEY = 'development-key'
deno run --allow-env=OPENAI_API_KEY --allow-net=api.openai.com supabase/functions/ai-tutor/eval/run.ts
```

The key is intentionally not stored in the repository. A live model evaluation
was not run during implementation because no local development key was present.

## Emergency stop and rollback

Disable tutor calls immediately without an app release:

```sql
update app_kill_switches
set enabled = false, updated_at = now()
where key = 'ai_tutor_enabled';
```

If needed, redeploy the previous `ai-tutor` function from version control. The
database migration is additive, so its unused columns can safely remain during
a function rollback. Re-enable the switch only after smoke tests pass.

## Cost interpretation

`estimated_cost_usd` uses GPT-6 Luna Standard short-context rates. It includes
uncached input, cached reads, cache writes, and output/reasoning tokens. Compare
the sum of this field with the OpenAI billing dashboard; the application value
is operational telemetry, while the provider invoice remains authoritative.
