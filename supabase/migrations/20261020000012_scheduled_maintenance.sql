set lock_timeout = '3s';
set statement_timeout = '60s';

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create function public.expire_operational_receipts() returns void
language plpgsql security definer set search_path='' as $$
begin
  delete from public.tutor_request_receipts where (user_id,request_id) in (
    select user_id,request_id from public.tutor_request_receipts where created_at<now()-interval '8 days'
    order by created_at limit 1000);
  -- Sending is refused for replies older than 48 hours by the edge function.
  delete from public.forum_reply_notifications where (reply_id,recipient_id) in (
    select reply_id,recipient_id from public.forum_reply_notifications where created_at<now()-interval '7 days'
    order by created_at limit 1000);
  delete from public.notification_devices where token in (
    select token from public.notification_devices where updated_at<now()-interval '365 days'
    order by updated_at limit 1000);
end $$;
revoke all on function public.expire_operational_receipts() from public,anon,authenticated;
create index notification_devices_expiry on public.notification_devices(updated_at);

select cron.schedule('futuredoc-cohort','17,47 * * * *',
  'set statement_timeout = ''60s''; set lock_timeout = ''2s''; select public.refresh_performance_cohort();');
select cron.schedule('futuredoc-maintenance','*/5 * * * *',
  'set statement_timeout = ''20s''; set lock_timeout = ''2s''; select public.database_maintenance();');
select cron.schedule('futuredoc-receipts','23 * * * *',
  'set statement_timeout = ''20s''; set lock_timeout = ''2s''; select public.expire_operational_receipts();');
select cron.schedule('futuredoc-cron-history','33 3 * * *',
  $$delete from cron.job_run_details where runid in (
    select runid from cron.job_run_details where end_time<now()-interval '7 days'
    order by end_time limit 10000);$$);
-- The rollout configures these two Vault entries without putting secrets in
-- source control or cron.job's visible command text.
select cron.schedule('futuredoc-storage','41 * * * *', $job$
  select net.http_post(
    url=(select decrypted_secret from vault.decrypted_secrets where name='futuredoc_maintenance_url'),
    headers=jsonb_build_object('Content-Type','application/json','x-maintenance-key',
      (select decrypted_secret from vault.decrypted_secrets where name='futuredoc_maintenance_key')),
    body='{}'::jsonb,timeout_milliseconds=30000)
  where exists(select 1 from vault.decrypted_secrets where name='futuredoc_maintenance_url')
    and exists(select 1 from vault.decrypted_secrets where name='futuredoc_maintenance_key');
$job$);
