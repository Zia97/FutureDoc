import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnnouncementQueue,announcementSafeRoute} from '../src/services/announcementQueue.js';
test('student queue: safe points, plain payloads, serial display, offline ack, restart and retry',async()=>{
  const disk=new Map(),messages=[{id:'a',title:'First',message:'Plain <b>text</b>'},{id:'b',title:'Second',message:'Second'}],ack=new Set();
  let safe=false,online=true,shown=null,displays=0;
  const options={userId:'student-a',storage:{getItem:async k=>disk.get(k),setItem:async(k,v)=>disk.set(k,v)},
    canDisplay:()=>safe,
    onChange:m=>{shown=m;},
    rpc:async(action,id)=>{
      if(!online)throw Error('offline');
      if(action==='pending')return messages.filter(m=>!ack.has(m.id));
      if(action==='display'){displays++;return messages.find(m=>m.id===id);}
      if(action==='acknowledge'){ack.add(id);return {acknowledged:true};}
    }};
  let queue=createAnnouncementQueue(options);
  await queue.poll();assert.equal(shown,null);assert.equal(displays,0);
  safe=true;await Promise.all([queue.poll(),queue.poll()]);
  assert.equal(shown.id,'a');assert.equal(displays,1);
  await queue.poll();assert.equal(displays,1,'does not stack');
  online=false;await queue.dismiss();assert.equal(shown,null);
  assert.deepEqual(JSON.parse(disk.get('announcement_ack_v1:student-a')),{a:true});
  queue.stop();queue=createAnnouncementQueue(options);
  await assert.rejects(queue.poll(),/offline/);assert.equal(shown,null);
  online=true;await queue.poll();assert.ok(ack.has('a'));assert.equal(shown.id,'b');
  await queue.dismiss();await queue.poll();assert.equal(shown,null);assert.equal(ack.size,2);
  for(const route of ['TimedVRTest','TimedDMTest','TimedQRTest','TimedSJTest','CoachSession','PerformancePractice','QRQuestion',undefined])
    assert.equal(announcementSafeRoute(route),false,route);
  for(const route of ['Home','Community','TimedQRTestReview'])assert.equal(announcementSafeRoute(route),true);
});
test('late authorization cannot display after navigation/signout; failed disk write keeps message open',async()=>{
  let safe=true,resolveDisplay,shown=null;
  const queue=createAnnouncementQueue({userId:'a',storage:{getItem:async()=>null,setItem:async()=>{throw Error('disk full');}},
    canDisplay:()=>safe,onChange:m=>shown=m,rpc:async(action)=>action==='pending'?[{id:'a'}]:new Promise(r=>resolveDisplay=r)});
  const first=queue.poll();await new Promise(r=>setImmediate(r));safe=false;resolveDisplay({id:'a'});
  await first;assert.equal(shown,null);
  safe=true;const second=queue.poll();await new Promise(r=>setImmediate(r));resolveDisplay({id:'a'});await second;
  await assert.rejects(queue.dismiss(),/disk full/);assert.equal(shown.id,'a');
  queue.stop();await queue.poll();
});
