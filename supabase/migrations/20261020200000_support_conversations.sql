-- Conversations augment the original reports. Old app clients still create tickets
-- through the insert triggers; internal reviewer notes are never copied to messages.
create schema if not exists support_private;
revoke all on schema support_private from public, anon, authenticated;

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  source text not null check (source in ('support', 'question', 'lesson')),
  source_id uuid not null,
  kind text not null check (kind in ('support', 'bug', 'question', 'lesson')),
  subject text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  section text,
  question_id text,
  is_timed boolean not null default false,
  test_id integer,
  reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message text not null default '',
  last_message_id bigint not null default 0,
  last_user_message_id bigint not null default 0,
  last_admin_message_id bigint not null default 0,
  user_read_id bigint not null default 0,
  admin_read_id bigint not null default 0,
  unique(source, source_id)
);
create index support_tickets_owner_updated on public.support_tickets(owner_id, updated_at desc, id);
create index support_tickets_status_updated on public.support_tickets(status, updated_at desc, id);
create index support_tickets_updated on public.support_tickets(updated_at desc, id);

create table public.support_ticket_messages (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_role text not null check (author_role in ('user', 'admin', 'system')),
  body text not null check (length(btrim(body)) between 1 and 4000),
  request_id text,
  created_at timestamptz not null default now(),
  unique(ticket_id, author_id, request_id)
);
create index support_ticket_messages_thread on public.support_ticket_messages(ticket_id, id desc);
alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;
revoke all on public.support_tickets, public.support_ticket_messages from public, anon, authenticated;
revoke all on sequence public.support_ticket_messages_id_seq from public, anon, authenticated;
grant all on public.support_tickets, public.support_ticket_messages to service_role;
grant usage, select on sequence public.support_ticket_messages_id_seq to service_role;

alter table public.support_messages add column client_request_id text;
create unique index support_messages_client_request on public.support_messages(user_id, client_request_id);

create function support_private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.user_profiles where user_id = auth.uid() and is_admin is true) $$;

create function support_private.require_ticket(p_ticket uuid, p_admin boolean)
returns public.support_tickets language plpgsql security definer set search_path = ''
as $$
declare t public.support_tickets;
begin
  if auth.uid() is null or p_admin is null then raise exception 'forbidden' using errcode='42501'; end if;
  if p_admin and not support_private.is_admin() then raise exception 'forbidden' using errcode='42501'; end if;
  select * into t from public.support_tickets where id=p_ticket;
  if t.id is null or (not p_admin and t.owner_id is distinct from auth.uid()) then
    raise exception 'ticket_unavailable' using errcode='42501';
  end if;
  return t;
end $$;

create function support_private.import_report(p_source text, r jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare tid uuid; mid bigint; original text; state text;
begin
  state := case r->>'status' when 'reviewing' then 'reviewing'
    when 'resolved' then 'resolved' when 'fixed' then 'resolved'
    when 'dismissed' then 'resolved' else 'open' end;
  insert into public.support_tickets(owner_id,source,source_id,kind,subject,status,section,
    question_id,is_timed,test_id,reasons,created_at,updated_at)
  values ((r->>'user_id')::uuid,p_source,(r->>'id')::uuid,p_source,
    case p_source when 'support' then r->>'subject'
      when 'question' then upper(r->>'section') || ' question report'
      else coalesce(nullif(r->>'lesson_title',''),upper(r->>'section') || ' lesson report') end,
    state,r->>'section',r->>'question_id',coalesce((r->>'is_timed')::boolean,false),
    (r->>'test_id')::integer,
    array(select jsonb_array_elements_text(coalesce(r->'reasons','[]'::jsonb))),
    (r->>'created_at')::timestamptz,(r->>'created_at')::timestamptz)
  on conflict(source,source_id) do nothing returning id into tid;
  if tid is null then
    select id into tid from public.support_tickets where source=p_source and source_id=(r->>'id')::uuid;
    return tid;
  end if;
  original := coalesce(nullif(btrim(case when p_source='support' then r->>'message' else r->>'comment' end),''),
    nullif(array_to_string(array(select jsonb_array_elements_text(coalesce(r->'reasons','[]'::jsonb))),', '),''),
    'Report submitted');
  insert into public.support_ticket_messages(ticket_id,author_id,author_role,body,created_at)
    values(tid,(r->>'user_id')::uuid,'user',left(original,4000),(r->>'created_at')::timestamptz)
    returning id into mid;
  update public.support_tickets set last_message=left(original,240),last_message_id=mid,
    last_user_message_id=mid,user_read_id=mid,admin_read_id=case when state='resolved' then mid else 0 end
    where id=tid;
  return tid;
end $$;

create function support_private.sync_report() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare state text;
begin
  if TG_OP='INSERT' then
    perform support_private.import_report(TG_ARGV[0],to_jsonb(new));
  elsif new.status is distinct from old.status then
    state := case new.status when 'reviewing' then 'reviewing'
      when 'resolved' then 'resolved' when 'fixed' then 'resolved'
      when 'dismissed' then 'resolved' else 'open' end;
    update public.support_tickets set status=state,updated_at=now()
      where source=TG_ARGV[0] and source_id=new.id and status<>state;
  end if;
  return new;
end $$;
create trigger support_message_ticket after insert or update of status on public.support_messages
  for each row execute function support_private.sync_report('support');
create trigger question_report_ticket after insert or update of status on public.question_reports
  for each row execute function support_private.sync_report('question');
create trigger lesson_report_ticket after insert or update of status on public.lesson_reports
  for each row execute function support_private.sync_report('lesson');

do $$
declare r record;
begin
  for r in select to_jsonb(s) data from public.support_messages s order by created_at,id loop
    perform support_private.import_report('support',r.data);
  end loop;
  for r in select to_jsonb(q) data from public.question_reports q order by created_at,id loop
    perform support_private.import_report('question',r.data);
  end loop;
  for r in select to_jsonb(l) data from public.lesson_reports l order by created_at,id loop
    perform support_private.import_report('lesson',r.data);
  end loop;
end $$;

create function public.support_inbox_counts() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare admin boolean := support_private.is_admin();
begin
  if auth.uid() is null then raise exception 'forbidden' using errcode='42501'; end if;
  return jsonb_build_object('is_admin',admin,
    'unread',(select count(*) from public.support_tickets where owner_id=auth.uid() and last_admin_message_id>user_read_id),
    'admin_unread',case when admin then (select count(*) from public.support_tickets where last_user_message_id>admin_read_id) else 0 end);
end $$;

create function public.support_list_tickets(p_admin boolean default false, p_status text default 'all',
  p_kind text default 'all', p_page integer default 0) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare result jsonb;
begin
  if auth.uid() is null or p_admin is null or (p_admin and not support_private.is_admin()) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  if p_status is null or p_status not in ('all','open','reviewing','resolved','unread')
    or p_kind is null or p_kind not in ('all','support','bug','question','lesson')
    or p_page is null or p_page<0 or p_page>100000 then raise exception 'invalid_filter'; end if;
  with matches as (
    select t.id,t.kind,t.subject,t.status,t.section,t.is_timed,t.created_at,t.updated_at,t.last_message,
      case when p_admin then t.last_user_message_id>t.admin_read_id else t.last_admin_message_id>t.user_read_id end unread,
      case when p_admin then coalesce(p.display_name,'Deleted account') end requester
    from public.support_tickets t left join public.user_profiles p on p.user_id=t.owner_id
    where (p_admin or t.owner_id=auth.uid())
      and (p_kind='all' or t.kind=p_kind)
      and (p_status='all' or (p_status='open' and t.status in ('open','reviewing')) or t.status=p_status
        or (p_status='unread' and case when p_admin then t.last_user_message_id>t.admin_read_id else t.last_admin_message_id>t.user_read_id end))
  ), page as (select * from matches order by updated_at desc,id limit 30 offset p_page*30)
  select jsonb_build_object('tickets',coalesce((select jsonb_agg(to_jsonb(page) order by updated_at desc,id) from page),'[]'::jsonb),
    'total',(select count(*) from matches)) into result;
  return result;
end $$;

create function public.support_get_ticket(p_ticket uuid, p_admin boolean default false, p_before bigint default null)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare t public.support_tickets; messages jsonb; earliest bigint;
begin
  t := support_private.require_ticket(p_ticket,p_admin);
  with page as (select id,author_role,body,created_at from public.support_ticket_messages
    where ticket_id=t.id and (p_before is null or id<p_before) order by id desc limit 50)
  select coalesce(jsonb_agg(to_jsonb(page) order by id),'[]'::jsonb),min(id) into messages,earliest from page;
  return jsonb_build_object('ticket',jsonb_build_object(
    'id',t.id,'subject',t.subject,'kind',t.kind,'status',t.status,'section',t.section,
    'question_id',t.question_id,'is_timed',t.is_timed,'test_id',t.test_id,'reasons',t.reasons,
    'created_at',t.created_at,'last_message_id',t.last_message_id,'can_reply',t.owner_id is not null,
    'requester',case when p_admin then (select display_name from public.user_profiles where user_id=t.owner_id) end),
    'messages',messages,'has_older',exists(select 1 from public.support_ticket_messages where ticket_id=t.id and id<earliest));
end $$;

create function public.support_mark_read(p_ticket uuid, p_through bigint, p_admin boolean default false)
returns void language plpgsql security definer set search_path = ''
as $$
declare t public.support_tickets;
begin
  t := support_private.require_ticket(p_ticket,p_admin);
  if p_through is null or p_through<0 then raise exception 'invalid_cursor'; end if;
  update public.support_tickets set
    user_read_id=case when not p_admin then greatest(user_read_id,least(p_through,last_message_id)) else user_read_id end,
    admin_read_id=case when p_admin then greatest(admin_read_id,least(p_through,last_message_id)) else admin_read_id end
  where id=t.id;
end $$;

create function public.support_create_ticket(p_subject text,p_message text,p_kind text,p_request_id text,
  p_platform text default null,p_app_version text default null) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare sid uuid; tid uuid;
begin
  if auth.uid() is null then raise exception 'forbidden' using errcode='42501'; end if;
  if p_kind is null or p_kind not in ('support','bug')
    or coalesce(length(btrim(p_subject)),0) not between 1 and 120
    or coalesce(length(btrim(p_message)),0) not between 1 and 4000
    or coalesce(length(p_request_id),0) not between 1 and 100 then raise exception 'invalid_message'; end if;
  insert into public.support_messages(user_id,user_email,display_name,subject,message,platform,app_version,client_request_id)
    select auth.uid(),u.email,p.display_name,btrim(p_subject),btrim(p_message),left(p_platform,40),left(p_app_version,40),p_request_id
    from auth.users u left join public.user_profiles p on p.user_id=u.id where u.id=auth.uid()
    on conflict(user_id,client_request_id) do nothing returning id into sid;
  if sid is null then
    select id into sid from public.support_messages where user_id=auth.uid() and client_request_id=p_request_id;
  end if;
  update public.support_tickets set kind=p_kind where source='support' and source_id=sid returning id into tid;
  return tid;
end $$;

create function support_private.set_source_status(t public.support_tickets) returns void
language plpgsql security definer set search_path = ''
as $$
declare table_name text; source_status text;
begin
  table_name := case t.source when 'support' then 'support_messages'
    when 'question' then 'question_reports' when 'lesson' then 'lesson_reports' end;
  source_status := case t.status when 'open' then 'new' when 'resolved' then
    case when t.source='support' then 'resolved' else 'fixed' end else 'reviewing' end;
  execute format('update public.%I set status=$1,reviewed_at=now() where id=$2 and status<>$1',table_name)
    using source_status,t.source_id;
end $$;

create function public.support_reply(p_ticket uuid,p_body text,p_request_id text,p_admin boolean default false)
returns bigint language plpgsql security definer set search_path = ''
as $$
declare t public.support_tickets; mid bigint; role_name text;
begin
  t := support_private.require_ticket(p_ticket,p_admin);
  if t.owner_id is null then raise exception 'account_deleted'; end if;
  if coalesce(length(btrim(p_body)),0) not between 1 and 4000
    or coalesce(length(p_request_id),0) not between 1 and 100 then raise exception 'invalid_message'; end if;
  select * into t from public.support_tickets where id=t.id for update;
  role_name := case when p_admin then 'admin' else 'user' end;
  select id into mid from public.support_ticket_messages
    where ticket_id=t.id and author_id=auth.uid() and request_id=p_request_id;
  if mid is not null then return mid; end if;
  insert into public.support_ticket_messages(ticket_id,author_id,author_role,body,request_id)
    values(t.id,auth.uid(),role_name,btrim(p_body),p_request_id) returning id into mid;
  update public.support_tickets set last_message=left(btrim(p_body),240),last_message_id=mid,
    last_user_message_id=case when p_admin then last_user_message_id else mid end,
    last_admin_message_id=case when p_admin then mid else last_admin_message_id end,
    status=case when p_admin then 'reviewing' else 'open' end,updated_at=now()
    where id=t.id returning * into t;
  perform support_private.set_source_status(t);
  return mid;
end $$;

create function public.support_set_status(p_ticket uuid,p_status text) returns void
language plpgsql security definer set search_path = ''
as $$
declare t public.support_tickets; mid bigint; message text;
begin
  t := support_private.require_ticket(p_ticket,true);
  if p_status is null or p_status not in ('open','reviewing','resolved') then raise exception 'invalid_status'; end if;
  select * into t from public.support_tickets where id=t.id for update;
  if t.status=p_status then return; end if;
  message := case p_status when 'resolved' then 'Ticket resolved' when 'open' then 'Ticket reopened' else 'Ticket under review' end;
  insert into public.support_ticket_messages(ticket_id,author_id,author_role,body)
    values(t.id,auth.uid(),'system',message) returning id into mid;
  update public.support_tickets set status=p_status,updated_at=now(),last_message_id=mid,
    last_admin_message_id=mid,last_message=message where id=t.id returning * into t;
  perform support_private.set_source_status(t);
end $$;

revoke all on all functions in schema support_private from public,anon,authenticated;
revoke all on function public.support_inbox_counts() from public,anon;
revoke all on function public.support_list_tickets(boolean,text,text,integer) from public,anon;
revoke all on function public.support_get_ticket(uuid,boolean,bigint) from public,anon;
revoke all on function public.support_mark_read(uuid,bigint,boolean) from public,anon;
revoke all on function public.support_create_ticket(text,text,text,text,text,text) from public,anon;
revoke all on function public.support_reply(uuid,text,text,boolean) from public,anon;
revoke all on function public.support_set_status(uuid,text) from public,anon;
grant execute on function public.support_inbox_counts(), public.support_list_tickets(boolean,text,text,integer),
  public.support_get_ticket(uuid,boolean,bigint), public.support_mark_read(uuid,bigint,boolean),
  public.support_create_ticket(text,text,text,text,text,text), public.support_reply(uuid,text,text,boolean),
  public.support_set_status(uuid,text) to authenticated;
notify pgrst, 'reload schema';
