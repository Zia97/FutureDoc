-- UCAT Genius community forum
--
-- Public content is always read through SECURITY DEFINER RPCs. Direct table
-- writes are intentionally unavailable to mobile clients. A submission is
-- inserted as `pending` so its author can render it immediately; an Edge
-- Function then promotes it to `published`, moves it to `pending_review`, or
-- rejects it. Other students can only receive `published` rows.

create extension if not exists pg_trgm;

insert into public.app_kill_switches (key, enabled, notes)
values
  ('forum_read_enabled', true, 'Disable to hide the community forum.'),
  ('forum_posting_enabled', true, 'Disable to make the community forum read-only.'),
  ('forum_moderation_enabled', true, 'Disable only during moderation-provider maintenance; submissions stay pending.')
on conflict (key) do nothing;

create table public.forum_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.forum_settings (key, value)
values
  ('guidelines_version', '"2026-09-28"'::jsonb),
  ('post_limits', '{"hour":3,"day":10,"cooldown_seconds":60}'::jsonb),
  ('reply_limits', '{"ten_minutes":10,"day":50,"cooldown_seconds":12}'::jsonb),
  ('report_limits', '{"hour":10,"day":50}'::jsonb),
  ('media_limits', '{"max_images":2,"daily_images":10,"max_bytes":5242880,"max_dimension":5000}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

alter table public.forum_settings enable row level security;
revoke all on public.forum_settings from public, anon, authenticated;

create table public.forum_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 40),
  forum_tag char(5) not null check (forum_tag ~ '^[0-9]{5}$'),
  is_anonymised boolean not null default false,
  forum_banned_permanently boolean not null default false,
  forum_banned_until timestamptz,
  forum_ban_reason text,
  forum_banned_at timestamptz,
  forum_banned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index forum_members_public_handle_uq
  on public.forum_members (lower(regexp_replace(btrim(display_name), '\s+', ' ', 'g')), forum_tag)
  where is_anonymised = false;
create index forum_members_user_idx on public.forum_members(user_id) where user_id is not null;

create type public.forum_content_status as enum (
  'pending',
  'moderating',
  'pending_review',
  'published',
  'rejected',
  'deleted'
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_member_id uuid not null references public.forum_members(id),
  author_user_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 5 and 120),
  body text not null check (char_length(btrim(body)) between 10 and 5000),
  status public.forum_content_status not null default 'pending',
  moderation_message text,
  moderation_started_at timestamptz,
  moderation_completed_at timestamptz,
  is_locked boolean not null default false,
  reply_count integer not null default 0 check (reply_count >= 0),
  deleted_reason text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored
);

create index forum_posts_published_created_idx
  on public.forum_posts(created_at desc, id desc) where status = 'published';
create index forum_posts_author_idx on public.forum_posts(author_user_id, created_at desc);
create index forum_posts_search_idx on public.forum_posts using gin(search_vector);
create index forum_posts_title_trgm_idx on public.forum_posts using gin(title gin_trgm_ops);

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  author_member_id uuid not null references public.forum_members(id),
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  status public.forum_content_status not null default 'pending',
  moderation_message text,
  moderation_started_at timestamptz,
  moderation_completed_at timestamptz,
  deleted_reason text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forum_replies_post_created_idx on public.forum_replies(post_id, created_at, id);
create index forum_replies_author_idx on public.forum_replies(author_user_id, created_at desc);

create table public.forum_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  uploader_user_id uuid references auth.users(id) on delete set null,
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size integer not null check (byte_size between 1 and 5242880),
  width integer not null check (width between 1 and 5000),
  height integer not null check (height between 1 and 5000),
  created_at timestamptz not null default now(),
  removed_at timestamptz
);

create index forum_attachments_post_idx on public.forum_attachments(post_id) where removed_at is null;

create table public.forum_guideline_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, version)
);

create table public.forum_user_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_member_id uuid not null references public.forum_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_member_id)
);

create type public.forum_report_target as enum ('post', 'reply', 'member');
create type public.forum_report_status as enum ('new', 'reviewing', 'resolved', 'dismissed');

create table public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  target_type public.forum_report_target not null,
  target_id uuid not null,
  reason text not null check (reason in ('harassment', 'hate', 'sexual', 'violence', 'self_harm', 'personal_information', 'spam', 'copyright', 'other')),
  details text check (details is null or char_length(details) <= 1000),
  status public.forum_report_status not null default 'new',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewer_notes text,
  created_at timestamptz not null default now()
);

create unique index forum_reports_one_per_target_uq
  on public.forum_reports(reporter_user_id, target_type, target_id)
  where reporter_user_id is not null;
create index forum_reports_status_idx on public.forum_reports(status, created_at desc);

create table public.forum_moderation_events (
  id bigint generated always as identity primary key,
  target_type text not null check (target_type in ('post', 'reply', 'display_name')),
  target_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  model text not null,
  outcome text not null check (outcome in ('published', 'rejected', 'pending_review', 'error')),
  categories jsonb not null default '{}'::jsonb,
  category_scores jsonb not null default '{}'::jsonb,
  provider_request_id text,
  error_code text,
  created_at timestamptz not null default now()
);

create index forum_moderation_events_target_idx
  on public.forum_moderation_events(target_type, target_id, created_at desc);

create table public.forum_moderation_actions (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('post', 'reply', 'member', 'report')),
  target_id uuid not null,
  action text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index forum_moderation_actions_target_idx
  on public.forum_moderation_actions(target_type, target_id, created_at desc);

create table public.forum_rate_limit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('post', 'reply', 'report', 'upload')),
  created_at timestamptz not null default now()
);

create index forum_rate_limit_events_lookup_idx
  on public.forum_rate_limit_events(user_id, action, created_at desc);

alter table public.forum_members enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;
alter table public.forum_attachments enable row level security;
alter table public.forum_guideline_acceptances enable row level security;
alter table public.forum_user_blocks enable row level security;
alter table public.forum_reports enable row level security;
alter table public.forum_moderation_events enable row level security;
alter table public.forum_moderation_actions enable row level security;
alter table public.forum_rate_limit_events enable row level security;

revoke all on public.forum_members, public.forum_posts, public.forum_replies,
  public.forum_attachments, public.forum_guideline_acceptances,
  public.forum_user_blocks, public.forum_reports, public.forum_moderation_events,
  public.forum_moderation_actions, public.forum_rate_limit_events
  from public, anon, authenticated;

-- Internal helpers ---------------------------------------------------------

create or replace function public.forum_is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.user_profiles where user_id = p_user_id), false)
$$;

create or replace function public.forum_current_guidelines_version()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select value #>> '{}' from public.forum_settings where key = 'guidelines_version'
$$;

create or replace function public.forum_feature_enabled(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select enabled from public.app_kill_switches where key = p_key), false)
$$;

create or replace function public.forum_setting_int(p_key text, p_field text, p_default integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select (value ->> p_field)::integer from public.forum_settings where key = p_key), p_default)
$$;

create or replace function public.forum_is_banned(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select forum_banned_permanently
      or (forum_banned_until is not null and forum_banned_until > now())
    from public.forum_members where user_id = p_user_id
  ), false)
$$;

create or replace function public.forum_ensure_member_internal(p_user_id uuid)
returns public.forum_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.forum_members;
  v_name text;
  v_tag text;
  v_attempt integer := 0;
begin
  select * into v_member from public.forum_members where user_id = p_user_id;
  if found then return v_member; end if;

  select regexp_replace(btrim(display_name), '\s+', ' ', 'g')
    into v_name from public.user_profiles where user_id = p_user_id;
  if v_name is null or char_length(v_name) not between 2 and 40 then
    raise exception using errcode = 'P0001', message = 'display_name_required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select * into v_member from public.forum_members where user_id = p_user_id;
  if found then return v_member; end if;

  loop
    v_attempt := v_attempt + 1;
    v_tag := lpad(floor(random() * 100000)::integer::text, 5, '0');
    begin
      insert into public.forum_members(user_id, display_name, forum_tag)
      values (p_user_id, v_name, v_tag)
      returning * into v_member;
      return v_member;
    exception when unique_violation then
      if v_attempt >= 20 then
        raise exception using errcode = 'P0001', message = 'forum_handle_unavailable';
      end if;
    end;
  end loop;
end;
$$;

create or replace function public.forum_take_rate_limit(
  p_user_id uuid,
  p_action text,
  p_short_window interval,
  p_short_limit integer,
  p_daily_limit integer,
  p_cooldown interval default interval '0 seconds'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_latest timestamptz;
  v_short_count integer;
  v_day_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_action, 0));
  delete from public.forum_rate_limit_events
   where user_id = p_user_id and created_at < now() - interval '2 days';
  select max(created_at),
         count(*) filter (where created_at > now() - p_short_window),
         count(*) filter (where created_at > now() - interval '24 hours')
    into v_latest, v_short_count, v_day_count
    from public.forum_rate_limit_events
   where user_id = p_user_id and action = p_action;

  if v_latest is not null and v_latest > now() - p_cooldown then
    raise exception using errcode = 'P0001', message = 'rate_limit_cooldown';
  end if;
  if v_short_count >= p_short_limit or v_day_count >= p_daily_limit then
    raise exception using errcode = 'P0001', message = 'rate_limit_reached';
  end if;
  insert into public.forum_rate_limit_events(user_id, action) values (p_user_id, p_action);
end;
$$;

create or replace function public.forum_assert_can_post(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    raise exception using errcode = 'P0001', message = 'not_authenticated';
  end if;
  if not public.forum_feature_enabled('forum_posting_enabled') then
    raise exception using errcode = 'P0001', message = 'forum_read_only';
  end if;
  if public.forum_is_banned(p_user_id) then
    raise exception using errcode = 'P0001', message = 'forum_banned';
  end if;
  if not exists (
    select 1 from public.forum_guideline_acceptances
     where user_id = p_user_id and version = public.forum_current_guidelines_version()
  ) then
    raise exception using errcode = 'P0001', message = 'guidelines_required';
  end if;
end;
$$;

-- Profile display-name changes are reflected across the forum while the tag
-- remains stable. In the rare same-name/same-tag collision, only the tag is
-- rotated. Existing malformed legacy profile names remain untouched until the
-- user edits them.
alter table public.user_profiles
  add constraint user_profiles_display_name_forum_safe
  check (
    display_name is null or (
      char_length(btrim(display_name)) between 2 and 40
      and display_name !~ '[[:cntrl:]]'
    )
  ) not valid;

create or replace function public.forum_sync_member_display_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_attempt integer := 0;
begin
  if new.display_name is not distinct from old.display_name then return new; end if;
  if new.display_name is null then return new; end if;
  v_name := regexp_replace(btrim(new.display_name), '\s+', ' ', 'g');
  loop
    begin
      update public.forum_members
         set display_name = v_name, updated_at = now()
       where user_id = new.user_id;
      return new;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      update public.forum_members
         set forum_tag = lpad(floor(random() * 100000)::integer::text, 5, '0')
       where user_id = new.user_id;
      if v_attempt >= 20 then
        raise exception using errcode = 'P0001', message = 'forum_handle_unavailable';
      end if;
    end;
  end loop;
end;
$$;

drop trigger if exists forum_sync_member_display_name on public.user_profiles;
create trigger forum_sync_member_display_name
  after update of display_name on public.user_profiles
  for each row execute function public.forum_sync_member_display_name();

create or replace function public.forum_anonymise_deleted_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.user_id is not null and new.user_id is null then
    new.display_name := 'Deleted user';
    new.is_anonymised := true;
    new.forum_banned_permanently := false;
    new.forum_banned_until := null;
    new.forum_ban_reason := null;
    new.updated_at := now();
    update public.forum_attachments a
       set removed_at = coalesce(removed_at, now())
      from public.forum_posts p
     where a.post_id = p.id and p.author_member_id = old.id;
  end if;
  return new;
end;
$$;

create trigger forum_anonymise_deleted_member
  before update of user_id on public.forum_members
  for each row execute function public.forum_anonymise_deleted_member();

-- Client RPCs --------------------------------------------------------------

create or replace function public.forum_accept_guidelines(p_version text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_version <> public.forum_current_guidelines_version() then
    raise exception using errcode = 'P0001', message = 'guidelines_version_outdated';
  end if;
  insert into public.forum_guideline_acceptances(user_id, version)
  values (auth.uid(), p_version) on conflict do nothing;
end;
$$;

create or replace function public.forum_get_my_state()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.forum_members;
  v_version text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  v_member := public.forum_ensure_member_internal(auth.uid());
  v_version := public.forum_current_guidelines_version();
  return jsonb_build_object(
    'memberId', v_member.id,
    'displayName', v_member.display_name,
    'tag', v_member.forum_tag,
    'handle', v_member.display_name || '#' || v_member.forum_tag,
    'isAdmin', public.forum_is_admin(auth.uid()),
    'guidelinesVersion', v_version,
    'hasAcceptedGuidelines', exists(
      select 1 from public.forum_guideline_acceptances
       where user_id = auth.uid() and version = v_version
    ),
    'isBanned', public.forum_is_banned(auth.uid()),
    'banReason', v_member.forum_ban_reason,
    'banUntil', v_member.forum_banned_until,
    'readEnabled', public.forum_feature_enabled('forum_read_enabled'),
    'postingEnabled', public.forum_feature_enabled('forum_posting_enabled')
  );
end;
$$;

create or replace function public.forum_create_pending_post(p_title text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_member public.forum_members;
  v_post public.forum_posts;
  v_title text := regexp_replace(btrim(coalesce(p_title, '')), '\s+', ' ', 'g');
  v_body text := btrim(coalesce(p_body, ''));
begin
  perform public.forum_assert_can_post(v_uid);
  if char_length(v_title) not between 5 and 120 then
    raise exception using errcode = 'P0001', message = 'invalid_title';
  end if;
  if char_length(v_body) not between 10 and 5000 then
    raise exception using errcode = 'P0001', message = 'invalid_body';
  end if;
  v_member := public.forum_ensure_member_internal(v_uid);
  perform public.forum_take_rate_limit(
    v_uid, 'post', interval '1 hour',
    public.forum_setting_int('post_limits','hour',3),
    public.forum_setting_int('post_limits','day',10),
    make_interval(secs => public.forum_setting_int('post_limits','cooldown_seconds',60))
  );
  insert into public.forum_posts(author_member_id, author_user_id, title, body)
  values (v_member.id, v_uid, v_title, v_body)
  returning * into v_post;
  return jsonb_build_object(
    'id', v_post.id, 'title', v_post.title, 'body', v_post.body,
    'status', v_post.status, 'createdAt', v_post.created_at,
    'replyCount', 0, 'isLocked', false,
    'author', jsonb_build_object('id', v_member.id, 'displayName', v_member.display_name, 'tag', v_member.forum_tag),
    'images', '[]'::jsonb
  );
end;
$$;

create or replace function public.forum_register_attachment(
  p_post_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_byte_size integer,
  p_width integer,
  p_height integer
)
returns uuid
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  perform public.forum_assert_can_post(v_uid);
  if not exists (
    select 1 from public.forum_posts
     where id = p_post_id and author_user_id = v_uid and status = 'pending'
  ) then raise exception using errcode = 'P0001', message = 'pending_post_not_found'; end if;
  if p_storage_path !~ ('^' || v_uid::text || '/' || p_post_id::text || '/[A-Za-z0-9._-]+$') then
    raise exception using errcode = 'P0001', message = 'invalid_storage_path';
  end if;
  if p_mime_type not in ('image/jpeg', 'image/png', 'image/webp')
     or p_byte_size not between 1 and 5242880
     or p_width not between 1 and 5000 or p_height not between 1 and 5000 then
    raise exception using errcode = 'P0001', message = 'invalid_image';
  end if;
  if (select count(*) from public.forum_attachments where post_id = p_post_id and removed_at is null) >= 2 then
    raise exception using errcode = 'P0001', message = 'image_limit_reached';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = 'forum-media' and name = p_storage_path) then
    raise exception using errcode = 'P0001', message = 'image_upload_missing';
  end if;
  perform public.forum_take_rate_limit(v_uid, 'upload', interval '24 hours', 10,
    public.forum_setting_int('media_limits','daily_images',10));
  insert into public.forum_attachments(post_id, uploader_user_id, storage_path, mime_type, byte_size, width, height)
  values (p_post_id, v_uid, p_storage_path, p_mime_type, p_byte_size, p_width, p_height)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.forum_create_pending_reply(p_post_id uuid, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_member public.forum_members;
  v_reply public.forum_replies;
  v_body text := btrim(coalesce(p_body, ''));
begin
  perform public.forum_assert_can_post(v_uid);
  if char_length(v_body) not between 1 and 2000 then
    raise exception using errcode = 'P0001', message = 'invalid_reply';
  end if;
  if not exists (select 1 from public.forum_posts where id = p_post_id and status = 'published' and not is_locked) then
    raise exception using errcode = 'P0001', message = 'thread_unavailable';
  end if;
  v_member := public.forum_ensure_member_internal(v_uid);
  perform public.forum_take_rate_limit(
    v_uid, 'reply', interval '10 minutes',
    public.forum_setting_int('reply_limits','ten_minutes',10),
    public.forum_setting_int('reply_limits','day',50),
    make_interval(secs => public.forum_setting_int('reply_limits','cooldown_seconds',12))
  );
  insert into public.forum_replies(post_id, author_member_id, author_user_id, body)
  values (p_post_id, v_member.id, v_uid, v_body)
  returning * into v_reply;
  return jsonb_build_object(
    'id', v_reply.id, 'postId', v_reply.post_id, 'body', v_reply.body,
    'status', v_reply.status, 'createdAt', v_reply.created_at,
    'author', jsonb_build_object('id', v_member.id, 'displayName', v_member.display_name, 'tag', v_member.forum_tag)
  );
end;
$$;

create or replace function public.forum_list_posts(
  p_query text default null,
  p_before timestamptz default null,
  p_limit integer default 20
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with visible as (
    select p.*, m.display_name, m.forum_tag, m.is_anonymised,
      exists(select 1 from public.user_profiles up where up.user_id = p.author_user_id and up.is_admin) as author_is_admin
    from public.forum_posts p
    join public.forum_members m on m.id = p.author_member_id
    where public.forum_feature_enabled('forum_read_enabled')
      and (p.status = 'published' or (p.author_user_id = auth.uid() and p.status in ('pending', 'moderating', 'pending_review')))
      and (p_before is null or p.created_at < p_before)
      and not exists (
        select 1 from public.forum_user_blocks b
         where b.blocker_user_id = auth.uid() and b.blocked_member_id = p.author_member_id
      )
      and (
        nullif(btrim(p_query), '') is null
        or p.search_vector @@ websearch_to_tsquery('english', btrim(p_query))
        or p.title % btrim(p_query)
      )
    order by p.created_at desc, p.id desc
    limit greatest(1, least(coalesce(p_limit, 20), 30))
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id, 'title', v.title, 'body', v.body, 'status', v.status,
    'moderationMessage', v.moderation_message, 'createdAt', v.created_at,
    'updatedAt', v.updated_at, 'replyCount', v.reply_count, 'isLocked', v.is_locked,
    'author', jsonb_build_object('id', v.author_member_id, 'displayName', v.display_name,
      'tag', v.forum_tag, 'isAdmin', v.author_is_admin, 'isAnonymised', v.is_anonymised),
    'images', coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id, 'path', a.storage_path, 'width', a.width, 'height', a.height
    ) order by a.created_at) from public.forum_attachments a
      where a.post_id = v.id and a.removed_at is null), '[]'::jsonb)
  ) order by v.created_at desc), '[]'::jsonb) from visible v
$$;

create or replace function public.forum_get_thread(p_post_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.forum_feature_enabled('forum_read_enabled') then return null; end if;
  select jsonb_build_object(
    'post', jsonb_build_object(
      'id', p.id, 'title', p.title, 'body', p.body, 'status', p.status,
      'moderationMessage', p.moderation_message, 'createdAt', p.created_at,
      'updatedAt', p.updated_at, 'replyCount', p.reply_count, 'isLocked', p.is_locked,
      'author', jsonb_build_object('id', m.id, 'displayName', m.display_name,
        'tag', m.forum_tag, 'isAdmin', coalesce(up.is_admin, false), 'isAnonymised', m.is_anonymised),
      'images', coalesce((select jsonb_agg(jsonb_build_object(
        'id', a.id, 'path', a.storage_path, 'width', a.width, 'height', a.height
      ) order by a.created_at) from public.forum_attachments a
        where a.post_id = p.id and a.removed_at is null), '[]'::jsonb)
    ),
    'replies', coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'postId', r.post_id, 'body', r.body, 'status', r.status,
      'moderationMessage', r.moderation_message, 'createdAt', r.created_at,
      'author', jsonb_build_object('id', rm.id, 'displayName', rm.display_name,
        'tag', rm.forum_tag, 'isAdmin', coalesce(rup.is_admin, false), 'isAnonymised', rm.is_anonymised)
    ) order by r.created_at, r.id)
      from public.forum_replies r
      join public.forum_members rm on rm.id = r.author_member_id
      left join public.user_profiles rup on rup.user_id = r.author_user_id
      where r.post_id = p.id
        and (r.status = 'published' or (r.author_user_id = auth.uid() and r.status in ('pending', 'moderating', 'pending_review')))
        and not exists (select 1 from public.forum_user_blocks b
          where b.blocker_user_id = auth.uid() and b.blocked_member_id = r.author_member_id)
    ), '[]'::jsonb)
  ) into v_result
  from public.forum_posts p
  join public.forum_members m on m.id = p.author_member_id
  left join public.user_profiles up on up.user_id = p.author_user_id
  where p.id = p_post_id
    and (p.status = 'published' or (p.author_user_id = auth.uid() and p.status in ('pending', 'moderating', 'pending_review')))
    and not exists (select 1 from public.forum_user_blocks b
      where b.blocker_user_id = auth.uid() and b.blocked_member_id = p.author_member_id);
  return v_result;
end;
$$;

create or replace function public.forum_report_content(
  p_target_type public.forum_report_target,
  p_target_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_reason not in ('harassment', 'hate', 'sexual', 'violence', 'self_harm', 'personal_information', 'spam', 'copyright', 'other') then
    raise exception using errcode = 'P0001', message = 'invalid_report_reason';
  end if;
  if char_length(coalesce(p_details, '')) > 1000 then raise exception 'report_too_long'; end if;
  if (p_target_type = 'post' and not exists(select 1 from public.forum_posts where id = p_target_id and status = 'published'))
    or (p_target_type = 'reply' and not exists(select 1 from public.forum_replies where id = p_target_id and status = 'published'))
    or (p_target_type = 'member' and not exists(select 1 from public.forum_members where id = p_target_id)) then
    raise exception using errcode = 'P0001', message = 'report_target_not_found';
  end if;
  perform public.forum_take_rate_limit(
    auth.uid(), 'report', interval '1 hour',
    public.forum_setting_int('report_limits','hour',10),
    public.forum_setting_int('report_limits','day',50)
  );
  insert into public.forum_reports(reporter_user_id, target_type, target_id, reason, details)
  values (auth.uid(), p_target_type, p_target_id, p_reason, nullif(btrim(p_details), ''))
  on conflict (reporter_user_id, target_type, target_id) where reporter_user_id is not null
  do update set reason = excluded.reason, details = excluded.details, status = 'new', created_at = now()
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.forum_block_member(p_member_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if exists(select 1 from public.forum_members where id = p_member_id and user_id = auth.uid()) then
    raise exception using errcode = 'P0001', message = 'cannot_block_self';
  end if;
  insert into public.forum_user_blocks(blocker_user_id, blocked_member_id)
  values(auth.uid(), p_member_id) on conflict do nothing;
end;
$$;

create or replace function public.forum_unblock_member(p_member_id uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.forum_user_blocks where blocker_user_id = auth.uid() and blocked_member_id = p_member_id
$$;

create or replace function public.forum_list_blocked_members()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'memberId',m.id,'displayName',m.display_name,'tag',m.forum_tag,'blockedAt',b.created_at
  ) order by b.created_at desc), '[]'::jsonb)
  from public.forum_user_blocks b join public.forum_members m on m.id=b.blocked_member_id
  where b.blocker_user_id=auth.uid()
$$;

create or replace function public.forum_delete_own_content(p_target_type text, p_target_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_target_type = 'post' then
    update public.forum_posts set status = 'deleted', deleted_at = now(), deleted_reason = 'Deleted by author', updated_at = now()
     where id = p_target_id and author_user_id = auth.uid() and status <> 'deleted';
    if not found then raise exception 'content_not_found'; end if;
    update public.forum_attachments set removed_at = coalesce(removed_at, now()) where post_id = p_target_id;
  elsif p_target_type = 'reply' then
    update public.forum_replies set status = 'deleted', deleted_at = now(), deleted_reason = 'Deleted by author', updated_at = now()
     where id = p_target_id and author_user_id = auth.uid() and status <> 'deleted';
    if not found then raise exception 'content_not_found'; end if;
  else raise exception 'invalid_target_type'; end if;
end;
$$;

-- Admin RPCs ---------------------------------------------------------------

create or replace function public.forum_admin_get_queue()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.forum_is_admin(auth.uid()) then jsonb_build_object(
    'pending', coalesce((select jsonb_agg(x order by x->>'createdAt') from (
      select jsonb_build_object('type','post','id',p.id,'title',p.title,'body',p.body,'createdAt',p.created_at,
        'moderationMessage',p.moderation_message,'memberId',p.author_member_id) x
      from public.forum_posts p where p.status = 'pending_review'
      union all
      select jsonb_build_object('type','reply','id',r.id,'title','Reply','body',r.body,'createdAt',r.created_at,
        'moderationMessage',r.moderation_message,'memberId',r.author_member_id) x
      from public.forum_replies r where r.status = 'pending_review'
    ) q), '[]'::jsonb),
    'reports', coalesce((select jsonb_agg(jsonb_build_object('id',fr.id,'targetType',fr.target_type,
      'targetId',fr.target_id,'reason',fr.reason,'details',fr.details,'status',fr.status,'createdAt',fr.created_at,
      'postId',case when fr.target_type='post' then fr.target_id when fr.target_type='reply' then (select r.post_id from public.forum_replies r where r.id=fr.target_id) else null end,
      'memberId',case when fr.target_type='member' then fr.target_id when fr.target_type='post' then (select p.author_member_id from public.forum_posts p where p.id=fr.target_id) when fr.target_type='reply' then (select r.author_member_id from public.forum_replies r where r.id=fr.target_id) else null end,
      'preview',case when fr.target_type='post' then (select p.title from public.forum_posts p where p.id=fr.target_id) when fr.target_type='reply' then (select left(r.body,180) from public.forum_replies r where r.id=fr.target_id) else (select m.display_name || '#' || m.forum_tag from public.forum_members m where m.id=fr.target_id) end)
      order by fr.created_at desc) from public.forum_reports fr where fr.status in ('new','reviewing')), '[]'::jsonb)
  ) else null end
$$;

create or replace function public.forum_admin_search_members(p_query text default null, p_limit integer default 30)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.forum_is_admin(auth.uid()) then coalesce(jsonb_agg(jsonb_build_object(
    'memberId',m.id,'displayName',m.display_name,'tag',m.forum_tag,'email',up.email,
    'isBanned',m.forum_banned_permanently or (m.forum_banned_until is not null and m.forum_banned_until > now()),
    'banReason',m.forum_ban_reason,'banUntil',m.forum_banned_until,'permanent',m.forum_banned_permanently,
    'postCount',(select count(*) from public.forum_posts p where p.author_member_id=m.id),
    'replyCount',(select count(*) from public.forum_replies r where r.author_member_id=m.id)
  ) order by m.created_at desc), '[]'::jsonb) else null end
  from (
    select * from public.forum_members m0
    where m0.user_id is not null and (
      nullif(btrim(p_query),'') is null
      or m0.display_name ilike '%' || btrim(p_query) || '%'
      or m0.forum_tag = btrim(p_query)
      or exists(select 1 from public.user_profiles u0 where u0.user_id=m0.user_id and u0.email ilike '%' || btrim(p_query) || '%')
    )
    order by m0.created_at desc limit greatest(1,least(coalesce(p_limit,30),50))
  ) m
  left join public.user_profiles up on up.user_id=m.user_id
$$;

create or replace function public.forum_admin_moderate_content(
  p_target_type text, p_target_id uuid, p_action text, p_reason text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare v_status public.forum_content_status;
begin
  if not public.forum_is_admin(auth.uid()) then raise exception 'forbidden'; end if;
  if p_action not in ('publish','delete','lock','unlock') then raise exception 'invalid_action'; end if;
  if p_target_type = 'post' then
    if p_action = 'publish' then v_status := 'published';
    elsif p_action = 'delete' then v_status := 'deleted'; end if;
    if p_action in ('lock','unlock') then
      update public.forum_posts set is_locked = (p_action = 'lock'), updated_at = now() where id = p_target_id;
    else
      update public.forum_posts set status = v_status, deleted_at = case when v_status='deleted' then now() else null end,
        deleted_by = case when v_status='deleted' then auth.uid() else null end, deleted_reason = p_reason, updated_at = now()
       where id = p_target_id;
      if v_status = 'deleted' then update public.forum_attachments set removed_at = coalesce(removed_at, now()) where post_id = p_target_id; end if;
    end if;
  elsif p_target_type = 'reply' then
    if p_action = 'publish' then v_status := 'published'; elsif p_action='delete' then v_status := 'deleted'; else raise exception 'invalid_reply_action'; end if;
    update public.forum_replies set status=v_status, deleted_at=case when v_status='deleted' then now() else null end,
      deleted_by=case when v_status='deleted' then auth.uid() else null end, deleted_reason=p_reason, updated_at=now()
     where id=p_target_id;
  else raise exception 'invalid_target_type'; end if;
  if not found then raise exception 'content_not_found'; end if;
  insert into public.forum_moderation_actions(actor_user_id,target_type,target_id,action,reason)
  values(auth.uid(),p_target_type,p_target_id,p_action,p_reason);
end;
$$;

create or replace function public.forum_admin_set_ban(
  p_member_id uuid, p_permanent boolean, p_until timestamptz default null, p_reason text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.forum_is_admin(auth.uid()) then raise exception 'forbidden'; end if;
  if exists(
    select 1 from public.forum_members m join public.user_profiles up on up.user_id=m.user_id
    where m.id=p_member_id and up.is_admin
  ) then raise exception using errcode='P0001', message='cannot_ban_admin'; end if;
  update public.forum_members set forum_banned_permanently=p_permanent,
    forum_banned_until=case when p_permanent then null else p_until end,
    forum_ban_reason=p_reason, forum_banned_at=case when p_permanent or p_until > now() then now() else null end,
    forum_banned_by=case when p_permanent or p_until > now() then auth.uid() else null end, updated_at=now()
   where id=p_member_id and user_id is not null;
  if not found then raise exception 'member_not_found'; end if;
  insert into public.forum_moderation_actions(actor_user_id,target_type,target_id,action,reason,metadata)
  values(auth.uid(),'member',p_member_id,case when p_permanent or p_until > now() then 'ban' else 'unban' end,p_reason,
    jsonb_build_object('permanent',p_permanent,'until',p_until));
end;
$$;

create or replace function public.forum_admin_resolve_report(
  p_report_id uuid, p_status public.forum_report_status, p_notes text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.forum_is_admin(auth.uid()) then raise exception 'forbidden'; end if;
  update public.forum_reports set status=p_status, reviewer_notes=p_notes, reviewed_by=auth.uid(), reviewed_at=now()
   where id=p_report_id;
  if not found then raise exception 'report_not_found'; end if;
  insert into public.forum_moderation_actions(actor_user_id,target_type,target_id,action,reason)
  values(auth.uid(),'report',p_report_id,p_status::text,p_notes);
end;
$$;

-- Reply-count maintenance counts only published replies.
create or replace function public.forum_refresh_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_post_id uuid;
begin
  if tg_op = 'DELETE' then
    v_post_id := old.post_id;
    update public.forum_posts
       set reply_count=(select count(*) from public.forum_replies where post_id=v_post_id and status='published')
     where id=v_post_id;
    return old;
  end if;
  v_post_id := new.post_id;
  update public.forum_posts
     set reply_count=(select count(*) from public.forum_replies where post_id=v_post_id and status='published'),
         updated_at=case when new.status='published' then now() else updated_at end
   where id=v_post_id;
  return new;
end;
$$;

create trigger forum_replies_refresh_count
after insert or delete or update of status on public.forum_replies
for each row execute function public.forum_refresh_reply_count();

-- Storage ------------------------------------------------------------------

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('forum-media','forum-media',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.forum_owns_pending_post(p_post_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.forum_posts where id=p_post_id and author_user_id=auth.uid() and status='pending')
$$;

create or replace function public.forum_can_read_media(p_path text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.forum_attachments a join public.forum_posts p on p.id=a.post_id
    where a.storage_path=p_path and a.removed_at is null
      and (p.status='published' or (p.author_user_id=auth.uid() and p.status in ('pending','moderating','pending_review')) or public.forum_is_admin(auth.uid()))
      and not exists(select 1 from public.forum_user_blocks b where b.blocker_user_id=auth.uid() and b.blocked_member_id=p.author_member_id)
  )
$$;

drop policy if exists forum_media_upload on storage.objects;
create policy forum_media_upload on storage.objects for insert to authenticated
with check (
  bucket_id='forum-media'
  and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}/[A-Za-z0-9._-]+$')
  and public.forum_owns_pending_post((split_part(name,'/',2))::uuid)
);

drop policy if exists forum_media_read on storage.objects;
create policy forum_media_read on storage.objects for select to authenticated
using (bucket_id='forum-media' and public.forum_can_read_media(name));

drop policy if exists forum_media_cancel_upload on storage.objects;
create policy forum_media_cancel_upload on storage.objects for delete to authenticated
using (
  bucket_id='forum-media'
  and name ~ ('^' || auth.uid()::text || '/[0-9a-f-]{36}/[A-Za-z0-9._-]+$')
  and public.forum_owns_pending_post((split_part(name,'/',2))::uuid)
);

-- Only the intended RPC entry points are callable by the mobile role. Revoke
-- helper execution explicitly; never alter permissions on unrelated app RPCs.
revoke all on function public.forum_is_admin(uuid) from public, anon, authenticated;
revoke all on function public.forum_current_guidelines_version() from public, anon, authenticated;
revoke all on function public.forum_feature_enabled(text) from public, anon, authenticated;
revoke all on function public.forum_setting_int(text,text,integer) from public, anon, authenticated;
revoke all on function public.forum_is_banned(uuid) from public, anon, authenticated;
revoke all on function public.forum_ensure_member_internal(uuid) from public, anon, authenticated;
revoke all on function public.forum_take_rate_limit(uuid,text,interval,integer,integer,interval) from public, anon, authenticated;
revoke all on function public.forum_assert_can_post(uuid) from public, anon, authenticated;
revoke all on function public.forum_owns_pending_post(uuid) from public, anon, authenticated;
revoke all on function public.forum_can_read_media(text) from public, anon, authenticated;

revoke all on function public.forum_accept_guidelines(text) from public, anon;
revoke all on function public.forum_get_my_state() from public, anon;
revoke all on function public.forum_create_pending_post(text,text) from public, anon;
revoke all on function public.forum_register_attachment(uuid,text,text,integer,integer,integer) from public, anon;
revoke all on function public.forum_create_pending_reply(uuid,text) from public, anon;
revoke all on function public.forum_list_posts(text,timestamptz,integer) from public, anon;
revoke all on function public.forum_get_thread(uuid) from public, anon;
revoke all on function public.forum_report_content(public.forum_report_target,uuid,text,text) from public, anon;
revoke all on function public.forum_block_member(uuid) from public, anon;
revoke all on function public.forum_unblock_member(uuid) from public, anon;
revoke all on function public.forum_list_blocked_members() from public, anon;
revoke all on function public.forum_delete_own_content(text,uuid) from public, anon;
revoke all on function public.forum_admin_get_queue() from public, anon;
revoke all on function public.forum_admin_search_members(text,integer) from public, anon;
revoke all on function public.forum_admin_moderate_content(text,uuid,text,text) from public, anon;
revoke all on function public.forum_admin_set_ban(uuid,boolean,timestamptz,text) from public, anon;
revoke all on function public.forum_admin_resolve_report(uuid,public.forum_report_status,text) from public, anon;

grant execute on function public.forum_accept_guidelines(text) to authenticated;
grant execute on function public.forum_get_my_state() to authenticated;
grant execute on function public.forum_create_pending_post(text,text) to authenticated;
grant execute on function public.forum_register_attachment(uuid,text,text,integer,integer,integer) to authenticated;
grant execute on function public.forum_create_pending_reply(uuid,text) to authenticated;
grant execute on function public.forum_list_posts(text,timestamptz,integer) to authenticated;
grant execute on function public.forum_get_thread(uuid) to authenticated;
grant execute on function public.forum_report_content(public.forum_report_target,uuid,text,text) to authenticated;
grant execute on function public.forum_block_member(uuid) to authenticated;
grant execute on function public.forum_unblock_member(uuid) to authenticated;
grant execute on function public.forum_list_blocked_members() to authenticated;
grant execute on function public.forum_delete_own_content(text,uuid) to authenticated;
grant execute on function public.forum_admin_get_queue() to authenticated;
grant execute on function public.forum_admin_search_members(text,integer) to authenticated;
grant execute on function public.forum_admin_moderate_content(text,uuid,text,text) to authenticated;
grant execute on function public.forum_admin_set_ban(uuid,boolean,timestamptz,text) to authenticated;
grant execute on function public.forum_admin_resolve_report(uuid,public.forum_report_status,text) to authenticated;
-- Storage RLS evaluates these auth-scoped boolean helpers as the mobile role.
grant execute on function public.forum_owns_pending_post(uuid) to authenticated;
grant execute on function public.forum_can_read_media(text) to authenticated;

grant execute on function public.forum_is_admin(uuid) to service_role;
grant execute on function public.forum_feature_enabled(text) to service_role;
