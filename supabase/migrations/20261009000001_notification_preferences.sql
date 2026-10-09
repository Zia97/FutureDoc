create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak_reminders boolean not null default false,
  forum_replies boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.notification_devices (
  token text primary key check (token ~ '^ExponentPushToken\[[A-Za-z0-9_-]+\]$|^ExpoPushToken\[[A-Za-z0-9_-]+\]$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);
create index notification_devices_user_idx on public.notification_devices(user_id);

create table public.forum_reply_notifications (
  reply_id uuid not null references public.forum_replies(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reply_id, recipient_id)
);

alter table public.notification_preferences enable row level security;
alter table public.notification_devices enable row level security;
alter table public.forum_reply_notifications enable row level security;

create policy notification_preferences_own_select on public.notification_preferences
  for select to authenticated using (user_id = auth.uid());
create policy notification_preferences_own_insert on public.notification_preferences
  for insert to authenticated with check (user_id = auth.uid());
create policy notification_preferences_own_update on public.notification_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_devices_own_select on public.notification_devices
  for select to authenticated using (user_id = auth.uid());
create policy notification_devices_own_insert on public.notification_devices
  for insert to authenticated with check (user_id = auth.uid());
create policy notification_devices_own_update on public.notification_devices
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notification_devices_own_delete on public.notification_devices
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;
grant select, insert, update, delete on public.notification_devices to authenticated;
revoke all on public.forum_reply_notifications from public, anon, authenticated;
grant all on public.notification_preferences, public.notification_devices, public.forum_reply_notifications to service_role;
