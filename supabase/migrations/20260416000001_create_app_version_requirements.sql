-- App version gating. One row per platform.
-- To force an update: UPDATE app_version_requirements SET min_supported_version = 'X.Y.Z' WHERE platform = 'ios' | 'android';
-- The app fetches the row matching Platform.OS on startup and blocks if Constants.expoConfig.version < min_supported_version.

create table if not exists public.app_version_requirements (
  platform text primary key check (platform in ('ios', 'android')),
  min_supported_version text not null,
  store_url text not null,
  notes text,
  updated_at timestamptz not null default now()
);

alter table public.app_version_requirements enable row level security;

-- Anyone (including anon auth) can read; nobody can write without service role.
drop policy if exists "app_version_requirements_read" on public.app_version_requirements;
create policy "app_version_requirements_read"
  on public.app_version_requirements
  for select
  using (true);

insert into public.app_version_requirements (platform, min_supported_version, store_url, notes)
values
  ('ios', '1.0.0', 'https://apps.apple.com/app/id0000000000', 'Replace store_url with real App Store URL once live.'),
  ('android', '1.0.0', 'https://play.google.com/store/apps/details?id=com.qhz123.ucatgeniusai', null)
on conflict (platform) do nothing;
