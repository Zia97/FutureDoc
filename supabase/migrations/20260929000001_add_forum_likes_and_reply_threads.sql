-- Community reactions and reply-to-reply conversations.

alter table public.forum_replies
  add column parent_reply_id uuid references public.forum_replies(id) on delete set null;

create index forum_replies_parent_idx
  on public.forum_replies(post_id, parent_reply_id, created_at, id);

create table public.forum_likes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.forum_posts(id) on delete cascade,
  reply_id uuid references public.forum_replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint forum_likes_one_target check (
    (post_id is not null and reply_id is null)
    or (post_id is null and reply_id is not null)
  )
);

-- These partial unique indexes enforce one like per user for each target.
create unique index forum_likes_post_user_uq on public.forum_likes(user_id, post_id)
  where post_id is not null;
create unique index forum_likes_reply_user_uq on public.forum_likes(user_id, reply_id)
  where reply_id is not null;
create index forum_likes_post_idx on public.forum_likes(post_id) where post_id is not null;
create index forum_likes_reply_idx on public.forum_likes(reply_id) where reply_id is not null;

alter table public.forum_likes enable row level security;
revoke all on public.forum_likes from public, anon, authenticated;

drop function if exists public.forum_create_pending_reply(uuid, text);
create function public.forum_create_pending_reply(
  p_post_id uuid,
  p_body text,
  p_parent_reply_id uuid default null
)
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
  if p_parent_reply_id is not null and not exists (
    select 1 from public.forum_replies
     where id = p_parent_reply_id and post_id = p_post_id and status = 'published'
  ) then
    raise exception using errcode = 'P0001', message = 'reply_unavailable';
  end if;
  v_member := public.forum_ensure_member_internal(v_uid);
  perform public.forum_take_rate_limit(
    v_uid, 'reply', interval '10 minutes',
    public.forum_setting_int('reply_limits','ten_minutes',10),
    public.forum_setting_int('reply_limits','day',50),
    make_interval(secs => public.forum_setting_int('reply_limits','cooldown_seconds',12))
  );
  insert into public.forum_replies(post_id, parent_reply_id, author_member_id, author_user_id, body)
  values (p_post_id, p_parent_reply_id, v_member.id, v_uid, v_body)
  returning * into v_reply;
  return jsonb_build_object(
    'id', v_reply.id, 'postId', v_reply.post_id, 'parentReplyId', v_reply.parent_reply_id,
    'body', v_reply.body, 'status', v_reply.status, 'createdAt', v_reply.created_at,
    'likeCount', 0, 'likedByMe', false,
    'author', jsonb_build_object('id', v_member.id, 'displayName', v_member.display_name, 'tag', v_member.forum_tag)
  );
end;
$$;

create or replace function public.forum_toggle_like(p_target_type text, p_target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_liked boolean;
  v_count integer;
begin
  if auth.uid() is null then raise exception using errcode = 'P0001', message = 'not_authenticated'; end if;
  if not public.forum_feature_enabled('forum_read_enabled') then raise exception using errcode = 'P0001', message = 'thread_unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || p_target_type || ':' || p_target_id::text, 0));

  if p_target_type = 'post' then
    if not exists (select 1 from public.forum_posts where id = p_target_id and status = 'published') then
      raise exception using errcode = 'P0001', message = 'like_target_not_found';
    end if;
    delete from public.forum_likes where user_id = auth.uid() and post_id = p_target_id;
    if found then v_liked := false;
    else
      insert into public.forum_likes(user_id, post_id) values (auth.uid(), p_target_id);
      v_liked := true;
    end if;
    select count(*) into v_count from public.forum_likes where post_id = p_target_id;
  elsif p_target_type = 'reply' then
    if not exists (select 1 from public.forum_replies where id = p_target_id and status = 'published') then
      raise exception using errcode = 'P0001', message = 'like_target_not_found';
    end if;
    delete from public.forum_likes where user_id = auth.uid() and reply_id = p_target_id;
    if found then v_liked := false;
    else
      insert into public.forum_likes(user_id, reply_id) values (auth.uid(), p_target_id);
      v_liked := true;
    end if;
    select count(*) into v_count from public.forum_likes where reply_id = p_target_id;
  else
    raise exception using errcode = 'P0001', message = 'invalid_like_target';
  end if;
  return jsonb_build_object('liked', v_liked, 'likeCount', v_count);
end;
$$;

create or replace function public.forum_list_posts(
  p_query text default null,
  p_before timestamptz default null,
  p_limit integer default 20
)
returns jsonb language sql stable security definer set search_path = public as $$
  with visible as (
    select p.*, m.display_name, m.forum_tag, m.is_anonymised,
      exists(select 1 from public.user_profiles up where up.user_id = p.author_user_id and up.is_admin) as author_is_admin
    from public.forum_posts p join public.forum_members m on m.id = p.author_member_id
    where public.forum_feature_enabled('forum_read_enabled')
      and (p.status = 'published' or (p.author_user_id = auth.uid() and p.status in ('pending', 'moderating', 'pending_review')))
      and (p_before is null or p.created_at < p_before)
      and not exists (select 1 from public.forum_user_blocks b where b.blocker_user_id = auth.uid() and b.blocked_member_id = p.author_member_id)
      and (nullif(btrim(p_query), '') is null or p.search_vector @@ websearch_to_tsquery('english', btrim(p_query)) or p.title % btrim(p_query))
    order by p.created_at desc, p.id desc limit greatest(1, least(coalesce(p_limit, 20), 30))
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id, 'title', v.title, 'body', v.body, 'status', v.status, 'moderationMessage', v.moderation_message,
    'createdAt', v.created_at, 'updatedAt', v.updated_at, 'replyCount', v.reply_count, 'isLocked', v.is_locked,
    'likeCount', (select count(*) from public.forum_likes l where l.post_id = v.id),
    'likedByMe', exists(select 1 from public.forum_likes l where l.post_id = v.id and l.user_id = auth.uid()),
    'author', jsonb_build_object('id', v.author_member_id, 'displayName', v.display_name, 'tag', v.forum_tag, 'isAdmin', v.author_is_admin, 'isAnonymised', v.is_anonymised),
    'images', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'path', a.storage_path, 'width', a.width, 'height', a.height) order by a.created_at) from public.forum_attachments a where a.post_id = v.id and a.removed_at is null), '[]'::jsonb)
  ) order by v.created_at desc), '[]'::jsonb) from visible v
$$;

create or replace function public.forum_get_thread(p_post_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb;
begin
  if not public.forum_feature_enabled('forum_read_enabled') then return null; end if;
  select jsonb_build_object(
    'post', jsonb_build_object(
      'id', p.id, 'title', p.title, 'body', p.body, 'status', p.status, 'moderationMessage', p.moderation_message,
      'createdAt', p.created_at, 'updatedAt', p.updated_at, 'replyCount', p.reply_count, 'isLocked', p.is_locked,
      'likeCount', (select count(*) from public.forum_likes l where l.post_id = p.id),
      'likedByMe', exists(select 1 from public.forum_likes l where l.post_id = p.id and l.user_id = auth.uid()),
      'author', jsonb_build_object('id', m.id, 'displayName', m.display_name, 'tag', m.forum_tag, 'isAdmin', coalesce(up.is_admin, false), 'isAnonymised', m.is_anonymised),
      'images', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'path', a.storage_path, 'width', a.width, 'height', a.height) order by a.created_at) from public.forum_attachments a where a.post_id = p.id and a.removed_at is null), '[]'::jsonb)
    ),
    'replies', coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'postId', r.post_id, 'parentReplyId', r.parent_reply_id, 'body', r.body, 'status', r.status,
      'moderationMessage', r.moderation_message, 'createdAt', r.created_at,
      'likeCount', (select count(*) from public.forum_likes l where l.reply_id = r.id),
      'likedByMe', exists(select 1 from public.forum_likes l where l.reply_id = r.id and l.user_id = auth.uid()),
      'author', jsonb_build_object('id', rm.id, 'displayName', rm.display_name, 'tag', rm.forum_tag, 'isAdmin', coalesce(rup.is_admin, false), 'isAnonymised', rm.is_anonymised)
    ) order by r.created_at, r.id) from public.forum_replies r join public.forum_members rm on rm.id = r.author_member_id left join public.user_profiles rup on rup.user_id = r.author_user_id
      where r.post_id = p.id and (r.status = 'published' or (r.author_user_id = auth.uid() and r.status in ('pending', 'moderating', 'pending_review')))
        and not exists (select 1 from public.forum_user_blocks b where b.blocker_user_id = auth.uid() and b.blocked_member_id = r.author_member_id)
    ), '[]'::jsonb)
  ) into v_result
  from public.forum_posts p join public.forum_members m on m.id = p.author_member_id left join public.user_profiles up on up.user_id = p.author_user_id
  where p.id = p_post_id and (p.status = 'published' or (p.author_user_id = auth.uid() and p.status in ('pending', 'moderating', 'pending_review')))
    and not exists (select 1 from public.forum_user_blocks b where b.blocker_user_id = auth.uid() and b.blocked_member_id = p.author_member_id);
  return v_result;
end;
$$;

revoke all on function public.forum_create_pending_reply(uuid,text,uuid) from public, anon;
revoke all on function public.forum_toggle_like(text,uuid) from public, anon;
grant execute on function public.forum_create_pending_reply(uuid,text,uuid) to authenticated;
grant execute on function public.forum_toggle_like(text,uuid) to authenticated;
