import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function headers() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: headers() });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: headers() });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user }, error: authError } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: headers() });

  // Remove binary screenshots before the auth row is deleted. Database
  // triggers then anonymise public discussion text and cascade private data.
  const { data: posts } = await admin.from('forum_posts').select('id').eq('author_user_id', user.id);
  const postIds = (posts ?? []).map((post) => post.id);
  if (postIds.length) {
    const { data: attachments, error: attachmentError } = await admin
      .from('forum_attachments').select('storage_path').in('post_id', postIds);
    if (attachmentError) {
      return new Response(JSON.stringify({ error: 'forum_cleanup_failed' }), { status: 500, headers: headers() });
    }
    const paths = (attachments ?? []).map((row) => row.storage_path);
    if (paths.length) {
      const { error: storageError } = await admin.storage.from('forum-media').remove(paths);
      if (storageError) return new Response(JSON.stringify({ error: 'forum_media_cleanup_failed' }), { status: 500, headers: headers() });
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return new Response(JSON.stringify({ error: 'account_delete_failed' }), { status: 500, headers: headers() });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: headers() });
});
