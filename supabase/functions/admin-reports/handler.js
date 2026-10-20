import { resolveContent, sentryLink, unwrap } from './content.js';

const errorStatus = (error) => ({'42501':403,'40001':409,'22023':400,'22P02':400}[error?.code] || 500);
const safeError = (error) => error?.code==='40001' ? 'Evidence changed. Refresh the report before saving.' :
  error?.code==='42501' ? 'Admin access required.' :
  ['22023','22P02'].includes(error?.code) ? 'Invalid request.' : 'The admin service could not complete this request.';
export function createHandler({client, origins, catalogue, sentryUrl=''}) {
  const allowed=new Set(origins);
  return async function handler(req) {
    const origin=req.headers.get('origin');
    const headers={
      'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',
      'X-Content-Type-Options':'nosniff',
      ...(origin && allowed.has(origin) ? {
        'Access-Control-Allow-Origin':origin,
        'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info',
        'Access-Control-Allow-Methods':'POST, OPTIONS',
      }:{}),
    };
    const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
    if (origin && !allowed.has(origin)) return json({error:'Origin not allowed.'},403);
    if (req.method==='OPTIONS') return new Response(null,{status:204,headers});
    if (req.method!=='POST') return json({error:'Method not allowed.'},405);
    const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return json({error:'Sign in required.'},401);
    try {
      // Always verify with Auth; never trust a decoded JWT or a client-provided actor.
      const {data,error}=await client.auth.getUser(token);
      if (error || !data?.user) return json({error:'Session expired. Sign in again.'},401);
      const user=data.user;
      const profile=unwrap(await client.from('user_profiles').select('is_admin').eq('user_id',user.id).maybeSingle());
      if (profile?.is_admin!==true) return json({error:'Admin access required.'},403);
      if (Number(req.headers.get('content-length'))>131072) return json({error:'Request too large.'},413);
      const bodyText=await req.text();
      if (bodyText.length>131072) return json({error:'Request too large.'},413);
      let body; try { body=JSON.parse(bodyText); } catch { return json({error:'Invalid JSON.'},400); }
      if (!body || typeof body!=='object') return json({error:'Invalid request.'},400);
      if (body.action==='session') return json({user:{id:user.id,email:user.email}});
      if (body.action==='delete_preview') {
        const selected=Array.isArray(body.issues)&&body.issues.length>0&&body.issues.length<=1000&&body.issues.every(i=>typeof i==='string'&&i.length<=500);
        const filtered=body.allMatching===true&&body.filter&&typeof body.filter==='object'&&!Array.isArray(body.filter);
        if ((!selected&&!filtered)||(selected&&filtered))return json({error:'Select reports or all matching issues.'},400);
        return json(unwrap(await client.rpc('admin_reports_delete_preview',{
          p_actor:user.id,p_issues:selected?body.issues:null,p_filter:filtered?body.filter:null,
        })));
      }
      if (body.action==='delete') {
        if(typeof body.id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.id)||body.confirm!==true)
          return json({error:'Confirm the deletion preview.'},400);
        return json(unwrap(await client.rpc('admin_reports_delete',{p_actor:user.id,p_id:body.id})));
      }
      if (body.action?.startsWith('announcement_')) {
        if (body.action==='announcement_preview' || body.action==='announcement_history') {
          if (typeof body.issue!=='string' || !/^question:(vr|dm|qr|sj):(practice|timed):[0-9a-f-]{36}$/i.test(body.issue))
            return json({error:'An exact practice or timed question is required.'},400);
          if (body.action==='announcement_history') {
            if (body.page!=null && (!Number.isInteger(body.page)||body.page<1||body.page>1000000))
              return json({error:'Invalid page.'},400);
            return json(unwrap(await client.rpc('admin_announcements_history',{p_actor:user.id,p_issue:body.issue,p_page:body.page||1})));
          }
          if (!['reporters','attempters','both'].includes(body.audience) || typeof body.title!=='string' ||
            !body.title.trim() || body.title.length>100 || typeof body.message!=='string' || !body.message.trim() || body.message.length>2000)
            return json({error:'Enter a title, message and audience.'},400);
          // Resolve using the same exact section/mode/ID resolver as the report preview.
          const [,section,mode,content_id]=body.issue.split(':');
          const content=await resolveContent(client,{kind:'question',section,mode,content_id},catalogue);
          if (!content?.available) return json({error:'Question unavailable. Delivery requires a resolvable question.'},400);
          return json(unwrap(await client.rpc('admin_announcements_preview',{p_actor:user.id,p_issue:body.issue,
            p_audience:body.audience,p_title:body.title,p_message:body.message})));
        }
        if (['announcement_send','announcement_cancel'].includes(body.action)) {
          if (typeof body.id!=='string'||!/^[0-9a-f-]{36}$/i.test(body.id))return json({error:'Invalid preview.'},400);
          return json(unwrap(await client.rpc(body.action==='announcement_send'?'admin_announcements_send':'admin_announcements_cancel',
            {p_actor:user.id,p_id:body.id})));
        }
        return json({error:'Unknown announcement action.'},400);
      }
      if (body.action==='list') {
        const f=body.filter || {};
        const choices={status:['all','open','new','reviewing','resolved','dismissed'],source:['all','question','lesson','support','forum','ai'],
          section:['all','vr','dm','qr','sj'],mode:['all','practice','timed','demo','preview','unknown'],
          signal:['all','possible_error','not_helpful','technical','confirmed_error']};
        if (Object.entries(choices).some(([key,values])=>f[key]!=null && !values.includes(f[key])) ||
          (f.search!=null && (typeof f.search!=='string' || f.search.length>200)) ||
          (f.page!=null && (!Number.isInteger(f.page) || f.page<1 || f.page>1000000)) ||
          (f.pageSize!=null && (!Number.isInteger(f.pageSize) || f.pageSize<1 || f.pageSize>100))) return json({error:'Invalid filters.'},400);
        return json(unwrap(await client.rpc('admin_reports_list',{p_actor:user.id,p_filter:f})));
      }
      if (body.action==='detail') {
        if (typeof body.issue!=='string' || body.issue.length>500 || (body.page!=null && (!Number.isInteger(body.page) || body.page<1))) return json({error:'Invalid report.'},400);
        const detail=unwrap(await client.rpc('admin_reports_detail',{p_actor:user.id,p_issue:body.issue,p_page:body.page || 1}));
        if (!detail?.total) return json({error:'Report no longer available.'},404);
        const first=detail.evidence[0];
        if (!first) return json({error:'Evidence page is no longer available.'},404);
        const content=await resolveContent(client,first,catalogue);
        return json({...detail,content,sentryUrl:sentryLink(first,sentryUrl)});
      }
      if (body.action==='review') {
        if (typeof body.issue!=='string' || body.issue.length>500 || !Array.isArray(body.items) ||
          typeof body.reviewAction!=='string' || (body.note!=null && typeof body.note!=='string') ||
          (body.conclusion!=null && typeof body.conclusion!=='string')) return json({error:'Invalid review.'},400);
        return json(unwrap(await client.rpc('admin_reports_review',{
          p_actor:user.id,p_issue:body.issue,p_items:body.items,p_action:body.reviewAction,
          p_note:body.note || '',p_conclusion:body.conclusion || 'unconfirmed',
        })));
      }
      if (body.action==='activity') {
        if (typeof body.issue!=='string' || body.issue.length>500 ||
          (body.page!=null && (!Number.isInteger(body.page) || body.page<1 || body.page>1000000))) return json({error:'Invalid activity page.'},400);
        return json(unwrap(await client.rpc('admin_reports_activity',{p_actor:user.id,p_issue:body.issue,p_page:body.page || 1})));
      }
      if (body.action==='media') {
        if (typeof body.attachmentId!=='string' || !/^[0-9a-f-]{36}$/i.test(body.attachmentId)) return json({error:'Invalid attachment.'},400);
        const attachment=unwrap(await client.from('forum_attachments').select('storage_path,mime_type,removed_at').eq('id',body.attachmentId).maybeSingle());
        if (!attachment || attachment.removed_at) return json({error:'Attachment unavailable.'},404);
        if (!['image/jpeg','image/png','image/webp'].includes(attachment.mime_type)) return json({error:'Unsupported attachment.'},400);
        const blob=unwrap(await client.storage.from('forum-media').download(attachment.storage_path));
        if (blob.size>5242880) return json({error:'Attachment too large.'},413);
        let binary=''; for (const byte of new Uint8Array(await blob.arrayBuffer())) binary+=String.fromCharCode(byte);
        return json({dataUrl:`data:${attachment.mime_type};base64,${btoa(binary)}`});
      }
      return json({error:'Unknown action.'},400);
    } catch (error) {
      // Do not log complaint bodies, tokens, email addresses or raw SQL errors.
      console.error('[admin-reports]',error?.code || 'request_failed');
      return json({error:safeError(error)},errorStatus(error));
    }
  };
}
