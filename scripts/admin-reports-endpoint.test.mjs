import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/admin-reports/handler.js';
const origin='https://admin.example.test';
const request=(action,token='valid',extra={})=>new Request(origin,{method:'POST',headers:{origin,...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({action,...extra})});
function setup({admin=true,auth=true,profileError=false,missingProfile=false}={}) {
  const calls=[];
  const state={admin};
  const client={auth:{getUser:async(token)=>{calls.push(['auth',token]);return {data:{user:auth&&token==='valid'?{id:'verified-admin',email:'admin@example.test'}:null},error:null};}},
    from(table){calls.push(['table',table]);return {select(){return this},eq(){return this},async maybeSingle(){return {data:missingProfile?null:{is_admin:state.admin},error:profileError?{code:'database_down'}:null}}}},
    async rpc(name,args){calls.push(['rpc',name,args]);return {data:{changed:1,items:[],total:0},error:null}}};
  return {calls,state,handler:createHandler({client,origins:[origin],catalogue:{}})};
}
test('every privileged action rejects missing, expired, forged and non-admin sessions',async()=>{
  for(const action of ['session','list','detail','review','media','activity','announcement_preview','announcement_send','announcement_cancel','announcement_history','delete_preview','delete']) {
    for(const token of [null,'expired','forged']) {
      const {calls,handler}=setup();
      assert.equal((await handler(request(action,token))).status,401,action);
      assert.equal(calls.filter(c=>c[0]==='table'||c[0]==='rpc').length,0);
    }
    const {calls,handler}=setup({admin:false});
    assert.equal((await handler(request(action))).status,403,action);
    assert.deepEqual(calls.filter(c=>c[0]==='table').map(c=>c[1]),['user_profiles']);
    assert.equal(calls.filter(c=>c[0]==='rpc').length,0);
  }
});
test('deletion requires explicit confirmation and uses the verified actor',async()=>{
  const {handler,calls}=setup();
  assert.equal((await handler(request('delete','valid',{id:'00000000-0000-4000-8000-000000000001'}))).status,400);
  assert.equal((await handler(request('delete_preview','valid',{issues:[]}))).status,400);
  assert.equal((await handler(request('delete_preview','valid',{issues:['question:qr:practice:x'],allMatching:true,filter:{}}))).status,400);
  assert.equal((await handler(request('delete_preview','valid',{issues:['question:qr:practice:x'],actor:'attacker'}))).status,200);
  assert.equal((await handler(request('delete','valid',{id:'00000000-0000-4000-8000-000000000001',confirm:true,actor:'attacker'}))).status,200);
  assert.ok(calls.filter(c=>c[0]==='rpc').every(c=>c[2].p_actor==='verified-admin'));
});
test('only database boolean true grants access; missing profiles and revoked flags fail closed',async()=>{
  for(const admin of [false,null,'true',1]){
    assert.equal((await setup({admin}).handler(request('session'))).status,403);
  }
  assert.equal((await setup({missingProfile:true}).handler(request('session'))).status,403);
  const {handler,state,calls}=setup();
  assert.equal((await handler(request('session'))).status,200);
  state.admin=false;
  assert.equal((await handler(request('list','valid',{is_admin:true,role:'admin'}))).status,403);
  assert.equal(calls.filter(c=>c[0]==='rpc').length,0,'revocation blocks the next request before data access');
});
test('server chooses actor, validates origin and filters, fails closed, and disables caching',async()=>{
  const {handler,calls}=setup();
  const response=await handler(request('review','valid',{actor:'attacker',issue:'question:vr:practice:x',items:[{source:'question',source_id:'x',revision:'v'}],reviewAction:'start'}));
  assert.equal(response.status,200);
  assert.equal(calls.find(c=>c[0]==='rpc')[2].p_actor,'verified-admin');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal(response.headers.get('access-control-allow-origin'),origin);
  const evil=new Request(origin,{method:'POST',headers:{origin:'https://evil.example'},body:'{}'});
  assert.equal((await handler(evil)).status,403);
  assert.equal((await handler(new Request(origin,{method:'GET'}))).status,405);
  assert.equal((await handler(request('list','valid',{filter:{page:0}}))).status,400);
  assert.equal((await handler(request('list','valid',{filter:{source:'auth.users'}}))).status,400);
  assert.equal((await handler(request('detail','valid',{issue:22}))).status,400);
  assert.equal((await handler(request('media','valid',{attachmentId:'../../secret'}))).status,400);
  assert.equal((await setup({profileError:true}).handler(request('list'))).status,500);
});
