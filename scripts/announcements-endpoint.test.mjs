import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../supabase/functions/admin-reports/handler.js';
const origin='http://127.0.0.1:4173',id='20000000-0000-4000-8000-000000000090';
const request=(body,token='valid')=>new Request(origin,{method:'POST',headers:{origin,Authorization:`Bearer ${token}`},body:JSON.stringify(body)});
function setup(admin=true){
  const calls=[];
  const client={auth:{getUser:async t=>({data:{user:t==='valid'?{id:'server-actor'}:null}})},
    from(table){calls.push(table);return {select(){return this;},eq(){return this;},maybeSingle:async()=>({data:table==='user_profiles'?{is_admin:admin}:{id,question_text:'Question',options:[]}})};},
    rpc:async(name,args)=>{calls.push({name,args});return {data:{id,count:2}};}};
  return {calls,handler:createHandler({client,origins:[origin],catalogue:{}})};
}
test('announcement endpoint authenticates every action, resolves exact question and fixes the actor',async()=>{
  for(const action of ['announcement_preview','announcement_history','announcement_send','announcement_cancel']){
    assert.equal((await setup().handler(request({action},'forged'))).status,401);
    const denied=setup(false);assert.equal((await denied.handler(request({action}))).status,403);
    assert.deepEqual(denied.calls,['user_profiles']);
  }
  const {handler,calls}=setup();
  assert.equal((await handler(request({action:'announcement_preview',issue:`question:qr:timed:${id}`,
    title:'Correction',message:'Plain text',audience:'both',actor:'forged'}))).status,200);
  assert.ok(calls.includes('timed_quantitative_reasoning_questions'));
  assert.equal(calls.at(-1).args.p_actor,'server-actor');
  assert.equal((await handler(request({action:'announcement_preview',issue:`question:qr:demo:${id}`}))).status,400);
  assert.equal((await handler(request({action:'announcement_send',id,actor:'forged'}))).status,200);
  assert.deepEqual(calls.at(-1),{name:'admin_announcements_send',args:{p_actor:'server-actor',p_id:id}});
});
