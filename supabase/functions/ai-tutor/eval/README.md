# AI tutor evaluation

This ten-case regression suite checks the main reasoning patterns before a tutor
prompt or model is released. It is deliberately separate from live student
traffic and does not modify the database.

Run it with Deno after setting a development OpenAI API key:

```powershell
$env:OPENAI_API_KEY = 'development-key'
deno run --allow-env=OPENAI_API_KEY --allow-net=api.openai.com supabase/functions/ai-tutor/eval/run.ts
```

The automated checks are a safety net, not a complete quality score. Review the
printed explanations for correctness, teaching clarity, lesson vocabulary, and
false answer-record disputes. Add anonymised failure patterns from production as
new cases; never copy a student's identity or unrelated personal information.

Useful production queries after the observability migration:

```sql
-- Daily quality, latency, and cost by section.
select
  date_trunc('day', created_at) as day,
  section,
  count(*) filter (where success) as successful_answers,
  round(avg(latency_ms) filter (where success)) as average_latency_ms,
  round(sum(estimated_cost_usd) filter (where success), 4) as estimated_cost_usd,
  count(*) filter (where feedback = 'helpful') as helpful,
  count(*) filter (where feedback = 'not_helpful') as not_helpful
from ai_tutor_logs
where created_at >= now() - interval '30 days'
group by 1, 2
order by 1 desc, 2;

-- Items the tutor flagged for human review.
select created_at, section, question_id, record_concern
from ai_tutor_logs
where record_status = 'possible_error'
order by created_at desc;
```
