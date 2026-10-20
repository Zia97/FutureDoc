set lock_timeout = '3s';
set statement_timeout = '60s';

create or replace function public.forum_admin_get_queue_page(p_offset integer default 0)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.forum_is_admin(auth.uid()) then jsonb_build_object(
    'pending', coalesce((select jsonb_agg(x order by x->>'createdAt') from (select x from (
      select jsonb_build_object('type','post','id',p.id,'title',p.title,'body',p.body,'createdAt',p.created_at,
        'moderationMessage',p.moderation_message,'memberId',p.author_member_id) x
      from public.forum_posts p where p.status = 'pending_review'
      union all
      select jsonb_build_object('type','reply','id',r.id,'title','Reply','body',r.body,'createdAt',r.created_at,
        'moderationMessage',r.moderation_message,'memberId',r.author_member_id) x
      from public.forum_replies r where r.status = 'pending_review'
      ) candidates
      order by x->>'createdAt',x->>'id' limit 50 offset greatest(0,least(p_offset,100000))
    ) q), '[]'::jsonb),
    'reports', coalesce((select jsonb_agg(jsonb_build_object('id',fr.id,'targetType',fr.target_type,
      'targetId',fr.target_id,'reason',fr.reason,'details',fr.details,'status',fr.status,'createdAt',fr.created_at,
      'postId',case when fr.target_type='post' then fr.target_id when fr.target_type='reply' then (select r.post_id from public.forum_replies r where r.id=fr.target_id) else null end,
      'memberId',case when fr.target_type='member' then fr.target_id when fr.target_type='post' then (select p.author_member_id from public.forum_posts p where p.id=fr.target_id) when fr.target_type='reply' then (select r.author_member_id from public.forum_replies r where r.id=fr.target_id) else null end,
      'preview',case when fr.target_type='post' then (select p.title from public.forum_posts p where p.id=fr.target_id) when fr.target_type='reply' then (select left(r.body,180) from public.forum_replies r where r.id=fr.target_id) else (select m.display_name || '#' || m.forum_tag from public.forum_members m where m.id=fr.target_id) end)
      order by fr.created_at desc) from (select * from public.forum_reports where status in ('new','reviewing') order by created_at desc,id limit 50 offset greatest(0,least(p_offset,100000))) fr), '[]'::jsonb)
  ) else null end
$$;
revoke all on function public.forum_admin_get_queue_page(integer) from public,anon;
grant execute on function public.forum_admin_get_queue_page(integer) to authenticated;
