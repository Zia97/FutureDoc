-- Operational kill switches for live features.
--
-- Flip a row from Supabase Studio (set enabled = false) to instantly disable
-- the feature for all clients within ~2 minutes (edge function caches reads
-- for 60s, client hook for 90s + foreground refresh).
--
-- Current keys:
--   ai_tutor_enabled       — global AI tutor (paid + demo). Disable for
--                            provider outages, runaway cost, or emergency.
--   ai_tutor_demo_enabled  — only the in-lesson free demo. Disable if the
--                            demo is being abused but paid users should keep
--                            unlimited access.
--
-- To re-enable: UPDATE public.app_kill_switches SET enabled = true,
--   updated_at = now() WHERE key = 'ai_tutor_demo_enabled';

create table if not exists public.app_kill_switches (
  key text primary key,
  enabled boolean not null default true,
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.app_kill_switches enable row level security;

-- Public read so the client hook can fetch without elevated permissions.
-- No write policy — only the service role (Edge Functions, Studio, admin
-- tools) can flip a switch.
drop policy if exists "app_kill_switches_read" on public.app_kill_switches;
create policy "app_kill_switches_read"
  on public.app_kill_switches
  for select
  to anon, authenticated
  using (true);

insert into public.app_kill_switches (key, enabled, notes)
values
  ('ai_tutor_enabled', true, 'Global AI tutor kill switch. Set false to disable AI tutor (paid + demo) for everyone.'),
  ('ai_tutor_demo_enabled', true, 'Free in-lesson AI tutor demo. Set false to disable the unauthenticated/demo flow only; paid AI tutor stays on.')
on conflict (key) do nothing;
