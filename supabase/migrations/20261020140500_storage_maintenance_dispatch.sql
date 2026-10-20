set lock_timeout = '3s';
set statement_timeout = '60s';

create function public.dispatch_storage_maintenance() returns bigint
language sql security definer set search_path='' as $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='futuredoc_maintenance_url'),
    headers := jsonb_build_object('Content-Type','application/json','x-maintenance-key',
      (select decrypted_secret from vault.decrypted_secrets where name='futuredoc_maintenance_key')),
    body := '{}'::jsonb,timeout_milliseconds := 30000)
  where exists(select 1 from vault.decrypted_secrets where name='futuredoc_maintenance_url')
    and exists(select 1 from vault.decrypted_secrets where name='futuredoc_maintenance_key');
$$;
revoke all on function public.dispatch_storage_maintenance() from public,anon,authenticated;
grant execute on function public.dispatch_storage_maintenance() to service_role;
select cron.schedule('futuredoc-storage','41 * * * *','select public.dispatch_storage_maintenance();');
