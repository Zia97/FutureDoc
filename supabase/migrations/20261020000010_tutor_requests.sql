set lock_timeout = '3s';
set statement_timeout = '60s';

create table public.tutor_request_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  status text not null default 'pending' check(status in ('pending','completed','failed')),
  is_demo boolean not null,
  response jsonb,
  attempts integer not null default 1,
  claimed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
alter table public.tutor_request_receipts enable row level security;
revoke all on public.tutor_request_receipts from public,anon,authenticated;
create index tutor_request_recent on public.tutor_request_receipts(user_id,created_at desc);
create index tutor_request_expiry on public.tutor_request_receipts(created_at);

create function public.reserve_tutor_request(p_user uuid,p_request uuid,p_created_at timestamptz,p_demo boolean,p_unlimited boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare existing public.tutor_request_receipts; used integer; recent integer; today integer; demos integer;
begin
  if p_request is null or p_created_at is null or p_created_at < now()-interval '7 days'
    or p_created_at > now()+interval '5 minutes' then raise exception 'request_expired'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text||':tutor',0));
  select * into existing from public.tutor_request_receipts where user_id=p_user and request_id=p_request;
  if found then
    if existing.status='completed' then return jsonb_build_object('response',existing.response); end if;
    if existing.status='pending' and existing.claimed_at > now()-interval '3 minutes' then raise exception 'message_in_progress'; end if;
    if existing.attempts>=3 then raise exception 'daily_limit_reached'; end if;
    if exists(select 1 from public.tutor_request_receipts where user_id=p_user and request_id<>p_request
      and status='pending' and claimed_at>now()-interval '3 minutes') then raise exception 'message_in_progress'; end if;
    -- A failed provider request can be retried without a second free-credit debit.
    update public.tutor_request_receipts set status='pending',attempts=attempts+1,claimed_at=now()
      where user_id=p_user and request_id=p_request;
    return '{"reserved":true}';
  end if;
  select count(*) filter(where created_at>now()-interval '10 minutes'),
    count(*),count(*) filter(where is_demo) into recent,today,demos
  from public.tutor_request_receipts where user_id=p_user and created_at>now()-interval '24 hours';
  if recent>=30 or today>=300 or (p_demo and demos>=20) then raise exception 'daily_limit_reached'; end if;
  if exists(select 1 from public.tutor_request_receipts where user_id=p_user and status='pending'
    and claimed_at>now()-interval '3 minutes') then raise exception 'message_in_progress'; end if;
  if not p_demo then
    used := public.increment_ai_usage(p_user,5,p_unlimited);
    if used=-1 then raise exception 'lifetime_limit_reached'; end if;
  end if;
  insert into public.tutor_request_receipts(user_id,request_id,is_demo) values(p_user,p_request,p_demo);
  return '{"reserved":true}';
end $$;

create function public.finish_tutor_request(p_user uuid,p_request uuid,p_response jsonb default null)
returns void language sql security definer set search_path = '' as $$
  update public.tutor_request_receipts set status=case when p_response is null then 'failed' else 'completed' end,
    response=p_response where user_id=p_user and request_id=p_request and status='pending';
$$;
revoke all on function public.reserve_tutor_request(uuid,uuid,timestamptz,boolean,boolean) from public,anon,authenticated;
revoke all on function public.finish_tutor_request(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_tutor_request(uuid,uuid,timestamptz,boolean,boolean) to service_role;
grant execute on function public.finish_tutor_request(uuid,uuid,jsonb) to service_role;
