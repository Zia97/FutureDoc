set lock_timeout = '3s';
set statement_timeout = '60s';
-- Reuse the durable tutor response instead of storing a second transcript in each receipt.
create or replace function public.reserve_tutor_request(p_user uuid,p_request uuid,p_created_at timestamptz,p_demo boolean,p_unlimited boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare cached_response jsonb; existing public.tutor_request_receipts; used integer; recent integer; today integer; demos integer;
begin
  if p_request is null or p_created_at is null or p_created_at < now()-interval '7 days'
    or p_created_at > now()+interval '5 minutes' then raise exception 'request_expired'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text||':tutor',0));
  select * into existing from public.tutor_request_receipts where user_id=p_user and request_id=p_request;
  if found then
    if existing.status='completed' then
      if existing.response ? 'content' then return jsonb_build_object('response',existing.response); end if;
      select jsonb_build_object('content',assistant_response,'messageId',id) into cached_response
        from public.ai_tutor_logs where user_id=p_user and id=(existing.response->>'messageId')::bigint;
      if cached_response is null then raise exception 'request_expired'; end if;
      return jsonb_build_object('response',cached_response);
    end if;
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

create or replace function public.finish_tutor_request(p_user uuid,p_request uuid,p_response jsonb default null)
returns void language sql security definer set search_path = '' as $body$
  update public.tutor_request_receipts set status=case when p_response is null then 'failed' else 'completed' end,
    response=case when p_response is not null and exists(
      select 1 from public.ai_tutor_logs where user_id=p_user and id=(p_response->>'messageId')::bigint
        and assistant_response=p_response->>'content'
    ) then jsonb_build_object('messageId',p_response->'messageId') else p_response end
  where user_id=p_user and request_id=p_request and status='pending';
$body$;
