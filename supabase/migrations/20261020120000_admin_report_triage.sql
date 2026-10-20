-- Private investigation API. No changes to student policies or question content.
-- Only the Edge Function's service role may execute these RPCs.
create schema if not exists admin;
revoke all on schema admin from public, anon, authenticated;
grant usage on schema admin to service_role;

create table admin.report_reviews (
  source text not null check (source in ('question','lesson','support','forum','ai')),
  source_id text not null,
  state text not null default 'new' check (state in ('new','reviewing','resolved','dismissed')),
  conclusion text not null default 'unconfirmed' check (conclusion in ('unconfirmed','confirmed_error','no_error')),
  evidence_revision text not null,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid not null,
  primary key (source, source_id)
);
create table admin.report_audit (
  id bigint generated always as identity primary key,
  issue_key text not null,
  source text not null,
  source_id text not null,
  actor uuid not null,
  action text not null,
  old_state text not null,
  new_state text not null,
  conclusion text not null,
  note text not null default '',
  created_at timestamptz not null default clock_timestamp()
);
create index report_audit_issue_idx on admin.report_audit(issue_key, created_at desc, id desc);
alter table admin.report_reviews enable row level security;
alter table admin.report_audit enable row level security;
revoke all on admin.report_reviews, admin.report_audit from public, anon, authenticated;
grant select, insert, update on admin.report_reviews to service_role;
grant select, insert on admin.report_audit to service_role;
grant usage on sequence admin.report_audit_id_seq to service_role;

-- One row per piece of evidence. OR conditions deliberately avoid multiplying AI logs.
-- Legacy success=false was backfilled in September: it alone is NOT proof of failure.
-- Requests still in flight are excluded; unfinished v2+ requests appear after 15 minutes.
create view admin.report_evidence as
with raw as (
  select 'question'::text source, q.id::text source_id, q.section,
    case when q.is_timed then 'timed' else 'practice' end mode,
    q.question_id::text content_id, 'question'::text kind, q.status::text source_status,
    coalesce(nullif(q.comment,''), array_to_string(q.reasons, ', '), 'Question report') summary,
    q.created_at, q.created_at evidence_at, to_jsonb(q) raw,
    q.reasons::text[] flags
  from public.question_reports q
  union all
  select 'lesson', l.id::text, l.section, null, l.lesson_id, 'lesson', l.status,
    coalesce(l.comment,l.lesson_title,'Lesson report'), l.created_at, l.created_at, to_jsonb(l), l.reasons
  from public.lesson_reports l
  union all
  select 'support', s.id::text, null, null, s.id::text, 'support', s.status,
    s.subject || ': ' || s.message, s.created_at, s.created_at, to_jsonb(s),
    case when s.email_error is not null then array['email_delivery_error'] else array[]::text[] end
  from public.support_messages s
  union all
  select 'forum', f.id::text, null, null, f.target_id::text, 'forum_' || f.target_type::text, f.status::text,
    f.reason || coalesce(': ' || f.details,''), f.created_at, f.created_at, to_jsonb(f), array[f.reason]
  from public.forum_reports f
  union all
  select 'ai', a.id::text,
    case lower(a.section)
      when 'verbal_reasoning' then 'vr' when 'verbal reasoning' then 'vr'
      when 'decision_making' then 'dm' when 'decision making' then 'dm'
      when 'quantitative_reasoning' then 'qr' when 'quantitative reasoning' then 'qr'
      when 'situational_judgement' then 'sj' when 'situational judgement' then 'sj'
      else lower(a.section) end,
    case when (to_jsonb(a)->>'is_preview')::boolean is true then 'preview'
         when (to_jsonb(a)->>'is_demo')::boolean is true then 'demo'
         when a.is_timed is true then 'timed'
         when a.is_timed is false then 'practice' else 'unknown' end,
    nullif(a.question_id,''), case when nullif(a.question_id,'') is null then 'ai' else 'question' end,
    'new', coalesce(nullif(a.record_concern,''), nullif(a.error_code,''), nullif(a.message,''), 'Tutor feedback'),
    a.created_at, greatest(a.created_at, a.feedback_at), to_jsonb(a),
    array_remove(array[
      case when a.record_status = 'possible_error' then 'possible_error' end,
      case when a.feedback = 'not_helpful' then 'not_helpful' end,
      case when a.error_code is not null then 'failed_request'
           when a.success = false and a.prompt_version is not null
                and a.created_at < now() - interval '15 minutes' then 'incomplete_request' end
    ], null)
  from public.ai_tutor_logs a
  where a.record_status = 'possible_error' or a.feedback = 'not_helpful'
     or a.error_code is not null
     or (a.success = false and a.prompt_version is not null and a.created_at < now() - interval '15 minutes')
)
select r.*,
  case when r.kind = 'question' then 'question:' || coalesce(r.section,'unknown') || ':' || r.mode || ':' || r.content_id
       when r.kind = 'lesson' then 'lesson:' || r.section || ':' || r.content_id
       when r.kind like 'forum_%' then r.kind || ':' || r.content_id
       else r.source || ':' || r.source_id end issue_key,
  case when r.source = 'ai' then case when v.evidence_revision=md5(r.raw::text) then v.state else 'new' end
       when r.source_status = 'fixed' then 'resolved' else r.source_status end state,
  case when r.source='ai' and v.evidence_revision is distinct from md5(r.raw::text)
    then 'unconfirmed' else coalesce(v.conclusion,'unconfirmed') end conclusion,
  md5(r.raw::text || coalesce(v.updated_at::text,'')) revision
from raw r left join admin.report_reviews v on v.source=r.source and v.source_id=r.source_id;
revoke all on admin.report_evidence from public, anon, authenticated;
grant select on admin.report_evidence to service_role;

create function admin.require_report_admin(p_actor uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_actor is null or not exists (
    select 1 from public.user_profiles where user_id=p_actor and is_admin is true
  ) then raise exception 'forbidden' using errcode='42501'; end if;
end $$;
revoke all on function admin.require_report_admin(uuid) from public, anon, authenticated;

create function public.admin_reports_list(p_actor uuid, p_filter jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
  page_num int := greatest(1, least(1000000, coalesce((p_filter->>'page')::int,1)));
  page_size int := greatest(1, least(100, coalesce((p_filter->>'pageSize')::int,20)));
begin
  perform admin.require_report_admin(p_actor);
  with grouped as (
    select issue_key, max(kind) kind, max(content_id) content_id, max(section) section, max(mode) mode,
      case when bool_or(state='new') then 'new' when bool_or(state='reviewing') then 'reviewing'
           when bool_or(state='resolved') then 'resolved' else 'dismissed' end state,
      count(*) report_count, count(*) filter (where state in ('new','reviewing')) open_count,
      max(evidence_at) last_reported_at, min(created_at) first_reported_at,
      (array_agg(summary order by evidence_at desc, source, source_id))[1] summary,
      array_agg(distinct source) sources,
      bool_or('possible_error'=any(flags)) possible_error,
      bool_or('not_helpful'=any(flags)) not_helpful,
      bool_or('failed_request'=any(flags) or 'incomplete_request'=any(flags) or 'email_delivery_error'=any(flags)) technical,
      bool_or(conclusion='confirmed_error') confirmed_error,
      string_agg(summary || ' ' || source_id || ' ' || raw::text, ' ') search_text
    from admin.report_evidence group by issue_key
  ), filtered as (
    select * from grouped g
    where (coalesce(p_filter->>'status','all')='all'
           or (p_filter->>'status'='open' and g.open_count>0)
           or g.state=p_filter->>'status')
      and (coalesce(p_filter->>'source','all')='all' or p_filter->>'source'=any(g.sources))
      and (coalesce(p_filter->>'section','all')='all' or g.section=p_filter->>'section')
      and (coalesce(p_filter->>'mode','all')='all' or g.mode=p_filter->>'mode')
      and (coalesce(p_filter->>'signal','all')='all'
           or (p_filter->>'signal'='possible_error' and g.possible_error)
           or (p_filter->>'signal'='not_helpful' and g.not_helpful)
           or (p_filter->>'signal'='technical' and g.technical)
           or (p_filter->>'signal'='confirmed_error' and g.confirmed_error))
      and (coalesce(p_filter->>'search','')='' or position(lower(p_filter->>'search') in lower(g.search_text || ' ' || g.issue_key))>0)
  ), paged as (
    select to_jsonb(f)-'search_text' item from filtered f
    order by last_reported_at desc, issue_key
    limit page_size offset ((page_num-1)*page_size)
  )
  select jsonb_build_object('items',coalesce((select jsonb_agg(item) from paged),'[]'::jsonb),
    'total',(select count(*) from filtered),'page',page_num,'pageSize',page_size,
    'counts',(select jsonb_build_object('all',count(*),'new',count(*) filter(where state='new'),
      'reviewing',count(*) filter(where state='reviewing'),'resolved',count(*) filter(where state='resolved'),
      'dismissed',count(*) filter(where state='dismissed'),
      'possible_error',count(*) filter(where possible_error and open_count>0)) from grouped))
  into result;
  return result;
end $$;

create function public.admin_reports_detail(p_actor uuid, p_issue text, p_page int default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  perform admin.require_report_admin(p_actor);
  if length(p_issue)>500 or p_page<1 or p_page>1000000 then raise exception 'invalid_request'; end if;
  select jsonb_build_object('issue_key',p_issue,
    'total',(select count(*) from admin.report_evidence where issue_key=p_issue),
    'evidence',coalesce((select jsonb_agg(to_jsonb(e)) from (
      select * from admin.report_evidence where issue_key=p_issue
      order by evidence_at desc,source,source_id limit 50 offset (p_page-1)*50
    ) e),'[]'::jsonb),
    'audit',coalesce((select jsonb_agg(to_jsonb(a)) from (
      select * from admin.report_audit where issue_key=p_issue order by created_at desc,id desc limit 100
    ) a),'[]'::jsonb),
    'audit_total',(select count(*) from admin.report_audit where issue_key=p_issue),
    'page',p_page) into result;
  return result;
end $$;

create function public.admin_reports_review(
  p_actor uuid, p_issue text, p_items jsonb, p_action text,
  p_note text default '', p_conclusion text default 'unconfirmed'
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare item jsonb; evidence record; target_state text; source_table text; changed int := 0;
begin
  perform admin.require_report_admin(p_actor);
  if p_action not in ('start','resolve','dismiss','reopen','note')
     or p_conclusion not in ('unconfirmed','confirmed_error','no_error')
     or p_note is null or length(p_note)>5000
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 500
     or (p_action='note' and length(btrim(p_note))=0)
     or (p_action in ('resolve','dismiss') and length(btrim(p_note))=0)
  then raise exception 'invalid_review' using errcode='22023'; end if;
  if (select count(*) from jsonb_array_elements(p_items)) <>
     (select count(distinct (v->>'source',v->>'source_id')) from jsonb_array_elements(p_items) v)
  then raise exception 'duplicate_evidence' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_issue,0));
  for item in select * from jsonb_array_elements(p_items) order by value->>'source',value->>'source_id'
  loop
    source_table := case item->>'source' when 'question' then 'question_reports'
      when 'lesson' then 'lesson_reports' when 'support' then 'support_messages'
      when 'forum' then 'forum_reports' when 'ai' then 'ai_tutor_logs' end;
    if source_table is null then raise exception 'invalid_source' using errcode='22023'; end if;
    -- Lock the actual row as well: student feedback may change while an admin reviews it.
    execute format('select id from public.%I where id::text=$1 for update',source_table) using item->>'source_id';
    select * into evidence from admin.report_evidence
      where source=item->>'source' and source_id=item->>'source_id' and issue_key=p_issue;
    if not found or evidence.revision is distinct from item->>'revision'
      then raise exception 'stale_evidence' using errcode='40001'; end if;
    target_state := case p_action when 'start' then 'reviewing' when 'resolve' then 'resolved'
      when 'dismiss' then 'dismissed' when 'reopen' then 'new' else evidence.state end;
    insert into admin.report_reviews(source,source_id,state,conclusion,updated_by,evidence_revision)
    values(evidence.source,evidence.source_id,target_state,
      case when p_action='note' then evidence.conclusion else p_conclusion end,p_actor,md5(evidence.raw::text))
    on conflict(source,source_id) do update set state=excluded.state,conclusion=excluded.conclusion,
      updated_at=clock_timestamp(),updated_by=p_actor,evidence_revision=excluded.evidence_revision;
    if evidence.source<>'ai' and p_action<>'note' then
      if evidence.source='forum' then
        update public.forum_reports set status=target_state::public.forum_report_status,
          reviewed_at=now(),reviewed_by=p_actor where id::text=evidence.source_id;
      else
        execute format('update public.%I set status=$1, reviewed_at=now() where id::text=$2',source_table)
        using case when evidence.source in ('question','lesson') and target_state='resolved'
                   then 'fixed' else target_state end, evidence.source_id;
      end if;
    end if;
    insert into admin.report_audit(issue_key,source,source_id,actor,action,old_state,new_state,conclusion,note)
    values(p_issue,evidence.source,evidence.source_id,p_actor,p_action,evidence.state,target_state,
      case when p_action='note' then evidence.conclusion else p_conclusion end,btrim(p_note));
    changed := changed+1;
  end loop;
  return jsonb_build_object('changed',changed);
end $$;

create function public.admin_reports_activity(p_actor uuid, p_issue text, p_page int default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform admin.require_report_admin(p_actor);
  if p_issue is null or length(p_issue)>500 or p_page not between 1 and 1000000
    then raise exception 'invalid_request' using errcode='22023'; end if;
  return jsonb_build_object(
    'items',coalesce((select jsonb_agg(to_jsonb(a)) from (
      select * from admin.report_audit where issue_key=p_issue
      order by created_at desc,id desc limit 100 offset (p_page-1)*100
    ) a),'[]'::jsonb),
    'total',(select count(*) from admin.report_audit where issue_key=p_issue),
    'page',p_page);
end $$;

revoke all on function public.admin_reports_list(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.admin_reports_detail(uuid,text,int) from public,anon,authenticated;
revoke all on function public.admin_reports_review(uuid,text,jsonb,text,text,text) from public,anon,authenticated;
grant execute on function public.admin_reports_list(uuid,jsonb) to service_role;
grant execute on function public.admin_reports_detail(uuid,text,int) to service_role;
grant execute on function public.admin_reports_review(uuid,text,jsonb,text,text,text) to service_role;
revoke all on function public.admin_reports_activity(uuid,text,int) from public,anon,authenticated;
grant execute on function public.admin_reports_activity(uuid,text,int) to service_role;
