set lock_timeout = '3s';
set statement_timeout = '60s';

-- A cumulative counter per installation and lesson makes retries idempotent
-- without creating a receipt row for every heartbeat.
create table public.lesson_device_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null,
  lesson_id text not null,
  seconds bigint not null default 0 check(seconds >= 0),
  primary key(user_id,device_id,lesson_id)
);
alter table public.lesson_device_counters enable row level security;
revoke all on public.lesson_device_counters from public,anon,authenticated;
create function public.save_lesson_checkpoint(
  p_device_id uuid,p_lesson_id text,p_section text,p_seconds bigint,
  p_complete boolean default false,p_platform text default null,p_app_version text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); previous bigint; delta bigint;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if p_device_id is null or p_lesson_id is null or length(p_lesson_id) not between 1 and 200
    or p_section is null or p_section not in ('vr','dm','qr','sj')
    or p_seconds is null or p_seconds < 0 or p_seconds > 2147483647
    or length(p_platform)>40 or length(p_app_version)>80
  then raise exception 'invalid_checkpoint'; end if;
  insert into public.lesson_device_counters(user_id,device_id,lesson_id)
    values(uid,p_device_id,p_lesson_id) on conflict do nothing;
  select seconds into previous from public.lesson_device_counters
    where user_id=uid and device_id=p_device_id and lesson_id=p_lesson_id for update;
  delta := greatest(p_seconds-previous,0);
  if delta > 0 then
    update public.lesson_device_counters set seconds=p_seconds
      where user_id=uid and device_id=p_device_id and lesson_id=p_lesson_id;
  end if;
  insert into public.lesson_progress(user_id,section,lesson_id,time_spent_seconds,completed_at,platform,app_version)
  values(uid,p_section,p_lesson_id,delta,case when p_complete then now() end,p_platform,p_app_version)
  on conflict(user_id,lesson_id) do update set
    time_spent_seconds=least(2147483647,public.lesson_progress.time_spent_seconds::bigint+delta),
    completed_at=coalesce(public.lesson_progress.completed_at,excluded.completed_at),
    last_seen_at=now()
  where delta > 0 or (p_complete and public.lesson_progress.completed_at is null)
    or public.lesson_progress.last_seen_at < now()-interval '1 minute';
end $$;
revoke all on function public.save_lesson_checkpoint(uuid,text,text,bigint,boolean,text,text) from public,anon;
grant execute on function public.save_lesson_checkpoint(uuid,text,text,bigint,boolean,text,text) to authenticated;
