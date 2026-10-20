set lock_timeout = '3s';
set statement_timeout = '60s';

-- Keep only the plan fields actually used by plan-history tools. Avoid a new
-- history row when opening the hub changes only the generation date or counts.
create function public.compact_coach_plan() returns trigger
language plpgsql security definer set search_path = '' as $$
declare previous jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text || ':plan',0));
  new.profile := jsonb_build_object('plan',new.profile->'plan','milestones',new.profile->'milestones');
  select profile into previous from public.coach_plans where user_id=new.user_id order by created_at desc,id desc limit 1;
  if previous is not null and previous->'plan'=new.profile->'plan'
    and previous->'milestones'=new.profile->'milestones' then return null; end if;
  return new;
end $$;
create trigger compact_coach_plan before insert on public.coach_plans
for each row execute function public.compact_coach_plan();
revoke all on function public.compact_coach_plan() from public,anon,authenticated;
create index coach_plans_user_created on public.coach_plans(user_id,created_at desc,id desc);

-- Atomic deltas keep popular threads from recounting all replies on every edit.
create or replace function public.forum_refresh_reply_count() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op <> 'INSERT' and old.status='published' then
    update public.forum_posts set reply_count=greatest(0,reply_count-1) where id=old.post_id;
  end if;
  if tg_op <> 'DELETE' and new.status='published' then
    update public.forum_posts set reply_count=reply_count+1,updated_at=now() where id=new.post_id;
  end if;
  if tg_op='DELETE' then return old; else return new; end if;
end $$;

-- Enforce the quota at object creation, including uploads which are never
-- registered as attachments. Existing app versions keep their upload protocol.
create function public.forum_allow_media_upload(p_name text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); post uuid;
begin
  if uid is null or p_name !~ ('^'||uid::text||'/[0-9a-f-]{36}/[A-Za-z0-9._-]+$') then return false; end if;
  post := split_part(p_name,'/',2)::uuid;
  perform pg_advisory_xact_lock(hashtextextended(uid::text||':media-upload',0));
  if not public.forum_owns_pending_post(post) then return false; end if;
  if (select count(*) from storage.objects where bucket_id='forum-media'
    and name like uid::text||'/'||post::text||'/%') >= 2 then return false; end if;
  perform public.forum_take_rate_limit(uid,'storage_upload',interval '24 hours',10,10);
  return true;
end $$;
revoke all on function public.forum_allow_media_upload(text) from public,anon;
grant execute on function public.forum_allow_media_upload(text) to authenticated;
drop policy if exists forum_media_upload on storage.objects;
create policy forum_media_upload on storage.objects for insert to authenticated
with check(bucket_id='forum-media' and public.forum_allow_media_upload(name));
-- Registration must serialize its two-attachment check as well.
do $$
declare definition text;
begin
  select pg_get_functiondef('public.forum_register_attachment(uuid,text,text,integer,integer,integer)'::regprocedure) into definition;
  definition := replace(definition,'perform public.forum_assert_can_post(v_uid);',
    'perform public.forum_assert_can_post(v_uid); perform 1 from public.forum_posts where id=p_post_id for update;');
  execute definition;
end $$;

create index forum_rate_events_expiry on public.forum_rate_limit_events(created_at);
create index forum_notification_expiry on public.forum_reply_notifications(created_at);
create index tutor_operational_expiry on public.ai_tutor_logs(created_at)
  where (is_demo or is_preview or error_code is not null) and feedback is null
    and coalesce(record_status,'') <> 'possible_error';

create function public.database_maintenance() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare rates integer; logs integer; compacted integer;
begin
  if not pg_try_advisory_xact_lock(20102026,1) then return '{"busy":true}'; end if;
  delete from public.forum_rate_limit_events where id in (
    select id from public.forum_rate_limit_events where created_at < now()-interval '2 days'
    order by created_at limit 1000);
  get diagnostics rates=row_count;
  -- Legacy success=false alone is NOT evidence of a failed request.
  delete from public.ai_tutor_logs where id in (
    select id from public.ai_tutor_logs where created_at < now()-interval '30 days'
      and (is_demo or is_preview or error_code is not null) and feedback is null
      and coalesce(record_status,'') <> 'possible_error'
    order by created_at limit 500);
  get diagnostics logs=row_count;
  compacted := public.compact_evidence_batch(500);
  return jsonb_build_object('rateEvents',rates,'operationalLogs',logs,'compactedEvidence',compacted);
end $$;
revoke all on function public.database_maintenance() from public,anon,authenticated;
grant execute on function public.database_maintenance() to service_role;

-- Storage API removes the blobs; this RPC only selects bounded candidates.
create function public.forum_media_cleanup_candidates(p_limit integer default 100)
returns table(path text) language sql stable security definer set search_path = '' as $$
  select o.name from storage.objects o
  left join public.forum_attachments a on a.storage_path=o.name
  left join public.forum_posts p on p.id=a.post_id
  where o.bucket_id='forum-media' and o.created_at < now()-interval '48 hours'
    and (a.id is null or a.removed_at is not null or p.status in ('deleted','rejected'))
  order by o.created_at,o.name limit least(greatest(p_limit,1),100);
$$;
revoke all on function public.forum_media_cleanup_candidates(integer) from public,anon,authenticated;
grant execute on function public.forum_media_cleanup_candidates(integer) to service_role;
