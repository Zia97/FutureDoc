-- Marketing tools are a separate, expiring permission; never an admin role.
alter table public.user_profiles add column marketing_tester_expires_at timestamptz;
comment on column public.user_profiles.marketing_tester_expires_at is
  'Marketing demo permission expiry. Pro remains a separate RevenueCat entitlement.';

create function public.protect_marketing_tester_access() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or auth.role() = 'service_role' or current_user in ('postgres', 'supabase_admin') then return new; end if;
  if tg_op = 'INSERT' then new.marketing_tester_expires_at := null;
  else new.marketing_tester_expires_at := old.marketing_tester_expires_at; end if;
  return new;
end;
$$;
create trigger protect_marketing_tester_access before insert or update on public.user_profiles
for each row execute function public.protect_marketing_tester_access();

create table public.marketing_tester_access_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.marketing_tester_access_log enable row level security;
revoke all on public.marketing_tester_access_log from public, anon, authenticated;
grant all on public.marketing_tester_access_log to service_role;
grant usage, select on sequence public.marketing_tester_access_log_id_seq to service_role;

create function public.set_marketing_tester_access(p_actor uuid, p_user uuid, p_until timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists(select 1 from public.user_profiles where user_id = p_actor and is_admin is true) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_until is not null and (p_until <= now() or p_until > now() + interval '366 days') then
    raise exception 'invalid_expiry';
  end if;
  update public.user_profiles set marketing_tester_expires_at = p_until where user_id = p_user and is_admin is false;
  if not found then raise exception 'tester_not_found'; end if;
  insert into public.marketing_tester_access_log(actor_id, user_id, expires_at) values(p_actor, p_user, p_until);
end;
$$;
revoke all on function public.set_marketing_tester_access(uuid, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.set_marketing_tester_access(uuid, uuid, timestamptz) to service_role;
