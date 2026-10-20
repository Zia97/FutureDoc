import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.2';
import { createHandler } from './handler.js';
import catalogue from './catalogue.json' with { type: 'json' };

const url=Deno.env.get('SUPABASE_URL');
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const origins=(Deno.env.get('ADMIN_ALLOWED_ORIGINS') || '').split(',').map(v=>v.trim()).filter(Boolean);
if (!url || !key || !origins.length) throw new Error('Admin backend configuration is incomplete.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
Deno.serve(createHandler({client,origins,catalogue,sentryUrl:Deno.env.get('ADMIN_SENTRY_ISSUES_URL') || ''}));
