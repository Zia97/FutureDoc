-- In-app question notices. No score, answer, report or access-policy writes.
create table admin.question_announcements (
  id uuid primary key default gen_random_uuid(),
  issue_key text not null,
  section text not null check(section in ('vr','dm','qr','sj')),
  mode text not null check(mode in ('practice','timed')),
  question_id uuid not null,
  audience text not null check(audience in ('reporters','attempters','both')),
  title text not null check(length(title) between 1 and 100),
  message text not null check(length(message) between 1 and 2000),
  sender uuid not null,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid
);
create index question_announcements_issue on admin.question_announcements(issue_key,created_at desc);
create table admin.announcement_recipients (
  announcement_id uuid not null references admin.question_announcements(id) on delete cascade,
  -- Retain the opaque recipient ID for audit after account deletion. Never retain email.
  user_id uuid not null,
  reported boolean not null,
  attempted boolean not null,
  excluded_at timestamptz,
  delivered_at timestamptz,
  displayed_at timestamptz,
  acknowledged_at timestamptz,
  cancelled_at timestamptz,
  primary key(announcement_id,user_id)
);
create index announcement_recipient_pending on admin.announcement_recipients(user_id,announcement_id)
  where acknowledged_at is null and cancelled_at is null and excluded_at is null;
create table admin.announcement_audit (
  id bigint generated always as identity primary key,
  announcement_id uuid not null references admin.question_announcements(id) on delete cascade,
  actor uuid not null,
  action text not null,
  affected integer not null,
  created_at timestamptz not null default clock_timestamp()
);
alter table admin.question_announcements enable row level security;
alter table admin.announcement_recipients enable row level security;
alter table admin.announcement_audit enable row level security;
revoke all on admin.question_announcements,admin.announcement_recipients,admin.announcement_audit from public,anon,authenticated;
grant select on admin.question_announcements,admin.announcement_recipients,admin.announcement_audit to service_role;

create function admin.announcement_account_available(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from auth.users u join public.user_profiles p on p.user_id=u.id
    where u.id=p_user and u.deleted_at is null and u.is_anonymous is not true
      and (u.banned_until is null or u.banned_until<=now()) and not p.is_suspended)
$$;
-- Recursively distinguish a saved answer from skipped/empty DM statement answers.
create function admin.announcement_answered(p_answer jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare item jsonb;
begin
  if p_answer is null or p_answer='null'::jsonb then return false; end if;
  if jsonb_typeof(p_answer)='object' then
    for item in select value from jsonb_each(p_answer) loop
      if admin.announcement_answered(item) then return true; end if;
    end loop;
    return false;
  elsif jsonb_typeof(p_answer)='array' then
    for item in select value from jsonb_array_elements(p_answer) loop
      if admin.announcement_answered(item) then return true; end if;
    end loop;
    return false;
  end if;
  return btrim(p_answer #>> '{}') not in ('','null','unanswered','skipped');
end $$;

create function admin.announcement_audience(p_section text,p_mode text,p_question uuid)
returns table(user_id uuid,reported boolean,attempted boolean)
language plpgsql security definer set search_path='' as $$
declare base text; answer_table text;
begin
  base := case p_section when 'vr' then 'verbal_reasoning' when 'dm' then 'decision_making'
    when 'qr' then 'quantitative_reasoning' when 'sj' then 'situational_judgement' end;
  if base is null or p_mode not in ('practice','timed') then raise exception 'invalid_question' using errcode='22023'; end if;
  answer_table := case when p_mode='practice' then 'practice_question_attempts' else 'timed_'||base||'_question_answers' end;
  return query execute format($query$
    with candidates as (
      select r.user_id,true reported,false attempted from public.question_reports r
        where r.section=$1 and r.is_timed=($2='timed') and r.question_id=$3 and r.user_id is not null
      union all
      select a.user_id,false,true from public.%I a
        where a.question_id=$3 %s and admin.announcement_answered(to_jsonb(a.selected_answer))
      union all
      select e.user_id,false,true from public.coach_evidence e
        where e.payload->>'section'=$1 and (
          e.payload->>'mode'=$2 or (
            e.payload->>'mode'='coach' and e.payload#>>'{tag,mode}'=$2
            and e.payload#>>'{tag,section}'=$1 and e.payload#>>'{tag,id}'=$3::text
          ))
          and e.payload->>'questionId'=$3::text and admin.announcement_answered(e.payload->'selectedAnswer')
    )
    select c.user_id,bool_or(c.reported),bool_or(c.attempted) from candidates c
      where admin.announcement_account_available(c.user_id) group by c.user_id
  $query$,answer_table,case when p_mode='practice' then 'and a.section=$1' else '' end)
  using p_section,p_mode,p_question;
end $$;
-- Index archived evidence without changing its payload or retention behaviour.
create index announcement_archived_question on public.coach_evidence_records
  ((payload->>'section'),(payload->>'questionId'),(payload->>'mode'));

create function public.admin_announcements_preview(p_actor uuid,p_issue text,p_audience text,p_title text,p_message text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b admin.question_announcements; parts text[]; n integer;
begin
  perform admin.require_report_admin(p_actor);
  parts:=string_to_array(p_issue,':');
  if array_length(parts,1)<>4 or parts[1]<>'question' or parts[2] not in ('vr','dm','qr','sj')
    or parts[3] not in ('practice','timed') or p_audience is null or p_audience not in ('reporters','attempters','both')
    or p_title is null or length(btrim(p_title)) not between 1 and 100
    or p_message is null or length(btrim(p_message)) not between 1 and 2000
  then raise exception 'invalid_announcement' using errcode='22023'; end if;
  -- An AI concern alone is never confirmation.
  if not exists(select 1 from admin.report_evidence where issue_key=p_issue and conclusion='confirmed_error')
    then raise exception 'confirmed_finding_required' using errcode='22023'; end if;
  -- Drafts are short-lived recipient snapshots; abandoned previews are not sent.
  delete from admin.question_announcements where sent_at is null and created_at<now()-interval '1 day';
  insert into admin.question_announcements(issue_key,section,mode,question_id,audience,title,message,sender)
    values(p_issue,parts[2],parts[3],parts[4]::uuid,p_audience,btrim(p_title),btrim(p_message),p_actor) returning * into b;
  insert into admin.announcement_recipients(announcement_id,user_id,reported,attempted)
    select b.id,a.user_id,a.reported,a.attempted from admin.announcement_audience(b.section,b.mode,b.question_id) a
    where p_audience='both' or (p_audience='reporters' and a.reported) or (p_audience='attempters' and a.attempted);
  get diagnostics n=row_count;
  return jsonb_build_object('id',b.id,'title',b.title,'message',b.message,'audience',b.audience,
    'count',n,'expires_at',b.created_at+interval '30 minutes',
    'reporters',(select count(*) from admin.announcement_recipients where announcement_id=b.id and reported),
    'attempters',(select count(*) from admin.announcement_recipients where announcement_id=b.id and attempted));
end $$;

create function public.admin_announcements_send(p_actor uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b admin.question_announcements; n integer;
begin
  perform admin.require_report_admin(p_actor);
  select * into b from admin.question_announcements where id=p_id for update;
  if not found or b.sender<>p_actor then raise exception 'invalid_preview' using errcode='22023'; end if;
  -- The preview ID is the immutable send idempotency key. Retries return the existing send.
  if b.sent_at is null then
    if b.created_at<now()-interval '30 minutes' or b.cancelled_at is not null
      then raise exception 'preview_expired' using errcode='22023'; end if;
    if not exists(select 1 from admin.report_evidence where issue_key=b.issue_key and conclusion='confirmed_error')
      then raise exception 'confirmed_finding_required' using errcode='22023'; end if;
    update admin.announcement_recipients set excluded_at=clock_timestamp()
      where announcement_id=b.id and not admin.announcement_account_available(user_id);
    select count(*) into n from admin.announcement_recipients where announcement_id=b.id and excluded_at is null;
    if n=0 then raise exception 'no_recipients' using errcode='22023'; end if;
    update admin.question_announcements set sent_at=clock_timestamp() where id=b.id returning * into b;
    insert into admin.announcement_audit(announcement_id,actor,action,affected) values(b.id,p_actor,'send',n);
  end if;
  return jsonb_build_object('id',b.id,'sent_at',b.sent_at,'count',
    (select count(*) from admin.announcement_recipients where announcement_id=b.id and excluded_at is null));
end $$;

create function public.admin_announcements_cancel(p_actor uuid,p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare b admin.question_announcements; n integer;
begin
  perform admin.require_report_admin(p_actor);
  select * into b from admin.question_announcements where id=p_id and sent_at is not null for update;
  if not found then raise exception 'invalid_announcement' using errcode='22023'; end if;
  update admin.announcement_recipients set cancelled_at=clock_timestamp()
    where announcement_id=b.id and displayed_at is null and cancelled_at is null and excluded_at is null;
  get diagnostics n=row_count;
  if b.cancelled_at is null then
    update admin.question_announcements set cancelled_at=clock_timestamp(),cancelled_by=p_actor where id=b.id;
    insert into admin.announcement_audit(announcement_id,actor,action,affected) values(b.id,p_actor,'cancel_unseen',n);
  end if;
  return jsonb_build_object('cancelled',n);
end $$;

create function public.admin_announcements_history(p_actor uuid,p_issue text,p_page integer default 1)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  perform admin.require_report_admin(p_actor);
  return jsonb_build_object(
    'confirmed',exists(select 1 from admin.report_evidence where issue_key=p_issue and conclusion='confirmed_error'),
    'total',(select count(*) from admin.question_announcements where issue_key=p_issue and sent_at is not null),
    'items',coalesce((select jsonb_agg(to_jsonb(x)) from (
      select b.*,
        count(r.*) filter(where r.excluded_at is null) recipients,
        count(r.*) filter(where r.delivered_at is not null) delivered,
        count(r.*) filter(where r.displayed_at is not null) displayed,
        count(r.*) filter(where r.acknowledged_at is not null) acknowledged,
        count(r.*) filter(where r.cancelled_at is not null) cancelled,
        count(r.*) filter(where r.excluded_at is null and r.cancelled_at is null and r.displayed_at is null) unseen
      from admin.question_announcements b join admin.announcement_recipients r on r.announcement_id=b.id
      where b.issue_key=p_issue and b.sent_at is not null group by b.id
      order by b.sent_at desc,b.id limit 20 offset (greatest(1,least(p_page,1000000))-1)*20
    ) x),'[]'::jsonb));
end $$;

-- Students get no table grants or arbitrary user parameter. All ownership comes from auth.uid().
create function public.student_announcements(p_action text default 'pending',p_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); r admin.announcement_recipients; b admin.question_announcements; result jsonb;
begin
  if actor is null or not admin.announcement_account_available(actor) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_action='pending' then
    -- Fetching counts as delivery, not display. Cancellation still applies until display.
    with next as (
      select a.id from admin.question_announcements a join admin.announcement_recipients rr on rr.announcement_id=a.id
      where rr.user_id=actor and a.sent_at is not null and rr.excluded_at is null
        and rr.cancelled_at is null and rr.acknowledged_at is null order by a.sent_at,a.id limit 20
    ), delivered as (
      update admin.announcement_recipients rr set delivered_at=coalesce(rr.delivered_at,clock_timestamp())
        where rr.user_id=actor and rr.announcement_id in (select id from next) returning rr.announcement_id
    ) select jsonb_agg(jsonb_build_object('id',a.id,'title',a.title,'message',a.message) order by a.sent_at,a.id) into result
      from admin.question_announcements a join delivered d on d.announcement_id=a.id;
    return coalesce(result,'[]'::jsonb);
  end if;
  if p_action not in ('display','acknowledge') or p_action is null then raise exception 'invalid_action' using errcode='22023'; end if;
  -- Serialize display authorization with admin cancellation. An offline cache cannot bypass it.
  select a.* into b from admin.question_announcements a
    join admin.announcement_recipients rr on rr.announcement_id=a.id and rr.user_id=actor
    where a.id=p_id and a.sent_at is not null for update of a;
  if not found then return null; end if;
  select * into r from admin.announcement_recipients where announcement_id=p_id and user_id=actor for update;
  if r.excluded_at is not null or r.cancelled_at is not null then return null; end if;
  if p_action='acknowledge' then
    if r.displayed_at is null then return null; end if;
    update admin.announcement_recipients set acknowledged_at=coalesce(acknowledged_at,clock_timestamp())
      where announcement_id=p_id and user_id=actor;
    return jsonb_build_object('acknowledged',true);
  end if;
  if r.acknowledged_at is not null then return null; end if;
  update admin.announcement_recipients set delivered_at=coalesce(delivered_at,clock_timestamp()),
    displayed_at=coalesce(displayed_at,clock_timestamp()) where announcement_id=p_id and user_id=actor;
  return jsonb_build_object('id',b.id,'title',b.title,'message',b.message);
end $$;

revoke all on function admin.announcement_account_available(uuid),admin.announcement_answered(jsonb),
  admin.announcement_audience(text,text,uuid) from public,anon,authenticated;
revoke all on function public.admin_announcements_preview(uuid,text,text,text,text),
  public.admin_announcements_send(uuid,uuid),public.admin_announcements_cancel(uuid,uuid),
  public.admin_announcements_history(uuid,text,integer),public.student_announcements(text,uuid) from public,anon,authenticated;
grant execute on function public.admin_announcements_preview(uuid,text,text,text,text),
  public.admin_announcements_send(uuid,uuid),public.admin_announcements_cancel(uuid,uuid),
  public.admin_announcements_history(uuid,text,integer) to service_role;
grant execute on function public.student_announcements(text,uuid) to authenticated;
