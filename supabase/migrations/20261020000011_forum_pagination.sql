set lock_timeout = '3s';
set statement_timeout = '60s';

create or replace function public.forum_get_thread_page(p_post_id uuid,p_after_at timestamptz default null,p_after_id uuid default null)
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
    ) order by r.created_at, r.id) from (select * from public.forum_replies candidate
      where candidate.post_id=p_post_id
        and (candidate.status='published' or (candidate.author_user_id=auth.uid() and candidate.status in ('pending','moderating','pending_review')))
        and not exists(select 1 from public.forum_user_blocks b where b.blocker_user_id=auth.uid() and b.blocked_member_id=candidate.author_member_id)
        and (p_after_at is null or (candidate.created_at,candidate.id)>(p_after_at,p_after_id))
      order by candidate.created_at,candidate.id limit 30) r join public.forum_members rm on rm.id = r.author_member_id left join public.user_profiles rup on rup.user_id = r.author_user_id
      where r.post_id = p.id and (r.status = 'published' or (r.author_user_id = auth.uid() and r.status in ('pending', 'moderating', 'pending_review')))
        and not exists (select 1 from public.forum_user_blocks b where b.blocker_user_id = auth.uid() and b.blocked_member_id = r.author_member_id)
    ), '[]'::jsonb)
  ) into v_result
  from public.forum_posts p join public.forum_members m on m.id = p.author_member_id left join public.user_profiles up on up.user_id = p.author_user_id
  where p.id = p_post_id and (p.status = 'published' or (p.author_user_id = auth.uid() and p.status in ('pending', 'moderating', 'pending_review')))
    and not exists (select 1 from public.forum_user_blocks b where b.blocker_user_id = auth.uid() and b.blocked_member_id = p.author_member_id);
  if jsonb_array_length(v_result->'replies')=30 then
    v_result := v_result || jsonb_build_object('nextCursor',jsonb_build_object(
      'createdAt',v_result->'replies'->29->>'createdAt','id',v_result->'replies'->29->>'id'));
  end if;
  return v_result;
end;
$$;
revoke all on function public.forum_get_thread_page(uuid,timestamptz,uuid) from public,anon;
grant execute on function public.forum_get_thread_page(uuid,timestamptz,uuid) to authenticated;
create function public.forum_user_media_paths(p_user uuid)
returns table(path text) language sql stable security definer set search_path='' as $$
select name from storage.objects where bucket_id='forum-media' and name like p_user::text||'/%' order by name limit 100;
$$;
revoke all on function public.forum_user_media_paths(uuid) from public,anon,authenticated;
grant execute on function public.forum_user_media_paths(uuid) to service_role;
