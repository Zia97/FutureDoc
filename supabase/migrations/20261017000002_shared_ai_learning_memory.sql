-- Tutor and coach read the same durable conversations. Help requests are
-- deliberately separate from coach_evidence: asking for help is not a mark.
alter table public.ai_tutor_logs
  -- Older hosted tables predate the CREATE TABLE IF NOT EXISTS definition
  -- containing these fields; the tutor's successful telemetry needs all three.
  add column if not exists question_type text,
  add column if not exists question_text text,
  add column if not exists user_answer text,
  add column if not exists is_demo boolean not null default false,
  add column if not exists is_preview boolean not null default false;

create view public.ai_learning_history with (security_invoker = true) as
select 'tutor:' || l.id::text as id, l.user_id, 'tutor'::text as source,
  l.created_at, lower(l.section) as section, lower(l.question_id) as question_id,
  left(l.question_type, 80) as question_type,
  t.metadata->>'primarySkillId' as skill_id,
  s.metadata->>'label' as topic,
  left(l.question_text, 4000) as question_text,
  left(l.message, 2000) as user_text,
  left(l.assistant_response, 6000) as assistant_text,
  left(l.teaching_skill, 240) as teaching_skill,
  l.record_status,
  concat_ws(' ', l.message, l.assistant_response, l.question_text, l.teaching_skill, s.metadata->>'label') as search_text
from public.ai_tutor_logs l
left join public.performance_question_tags t
  on t.question_id = case when l.question_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then l.question_id::uuid end and t.section = lower(l.section)
  and t.mode = case when l.is_timed then 'timed' else 'practice' end
  and t.metadata->>'excludedReason' is null
  and coalesce(t.metadata->>'confidence', '') <> 'low'
left join public.performance_skills s on s.id = t.metadata->>'primarySkillId'
where l.success and not l.is_demo and not l.is_preview
  and nullif(btrim(l.assistant_response), '') is not null
  -- Historical in-lesson demos have non-bank IDs and predate is_demo.
  and l.question_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
union all
select 'coach:' || m.id::text, m.user_id, 'coach'::text,
  m.created_at, null::text, null::text, null::text, null::text,
  null::text, null::text, left(m.user_text, 2000), left(m.assistant_text, 6000),
  null::text, null::text, concat_ws(' ', m.user_text, m.assistant_text)
from public.coach_messages m
where m.status = 'completed' and nullif(btrim(m.assistant_text), '') is not null
  and not coalesce((m.evidence->>'fallback')::boolean, false);

revoke all on public.ai_learning_history from public, anon, authenticated;
grant select on public.ai_learning_history to service_role;

-- All-time aggregates stay small in the model context; complete conversations
-- remain searchable and paginated through the authenticated edge functions.
create function public.ai_support_summary(p_user uuid)
returns jsonb language sql stable security invoker set search_path = public as $$
  with help as (
    select * from public.ai_learning_history where user_id = p_user and source = 'tutor'
  ), topics as (
    select section, skill_id, coalesce(topic, question_type, 'Unclassified question') as topic,
      count(*) as requests, count(distinct question_id) as questions,
      count(*) filter (where created_at >= now() - interval '30 days') as recent_requests,
      max(created_at) as last_asked_at
    from help group by section, skill_id, coalesce(topic, question_type, 'Unclassified question')
  )
  select jsonb_build_object(
    'classification', 'help_requests_not_performance',
    'totalRequests', (select count(*) from help),
    'distinctQuestions', (select count(distinct question_id) from help),
    'topics', coalesce((select jsonb_agg(jsonb_build_object(
      'section', section, 'skillId', skill_id, 'topic', topic,
      'requests', requests, 'questions', questions, 'recentRequests', recent_requests,
      'lastAskedAt', last_asked_at) order by recent_requests desc, last_asked_at desc)
      from (select * from topics order by recent_requests desc, last_asked_at desc limit 20) ranked), '[]'::jsonb)
  );
$$;
revoke all on function public.ai_support_summary(uuid) from public, anon, authenticated;
grant execute on function public.ai_support_summary(uuid) to service_role;

comment on view public.ai_learning_history is
  'Private shared tutor/coach conversations. Topic frequency shows engagement, which may reflect curiosity or debate; it establishes neither a support need nor poor performance. Sources retain their account-deletion cascades.';
comment on column public.user_ai_context.struggles is
  'Legacy help-topic counts; asking for help is not evidence of a weakness. Shared AI context uses ai_support_summary instead.';
