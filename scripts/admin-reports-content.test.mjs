import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveContent,SECTIONS,sentryLink} from '../supabase/functions/admin-reports/content.js';
const id='10000000-0000-4000-8000-000000000001',parentId='10000000-0000-4000-8000-000000000002';
function mock(tables) {
  const calls=[];
  return {calls,from(table){calls.push(table);let field,value,start=0,end=499;
    const query={select(){return this},eq(f,v){field=f;value=v;return this},order(){return this},range(s,e){start=s;end=e;return this},
      async maybeSingle(){return {data:(tables[table]||[]).find(r=>r[field]===value)||null,error:null}},
      then(resolve,reject){return Promise.resolve({data:(tables[table]||[]).filter(r=>r[field]===value).slice(start,end+1),error:null}).then(resolve,reject)}};
    return query;
  }};
}
test('all sections resolve by exact mode, including parent data and full DM children',async()=>{
  for(const mode of ['practice','timed'])for(const section of Object.keys(SECTIONS)) {
    const base=`${mode==='timed'?'timed_':''}${SECTIONS[section]}`;
    const q={id,question_text:'Question',stem:'Stem',correct_answer:'B',answer_reason:'Complete explanation',options:[{label:'A',text:'One'},{label:'B',text:'Two'}],type:'venn_diagram',stimulus_diagram:{sets:[],regions:{}},hide_labels:true};
    const tables={[`${base}_questions`]:[q]};
    if(section==='dm') {
      tables[`${base}_question_options`]=[{id:'second',question_id:id,order_index:2,label:'B',option_text:'Two',option_data:{shape:'fixture'},venn_geometry:{canvas:{width:10,height:10}}},{id:'first',question_id:id,order_index:1,label:'A',option_text:'One'}];
      tables[`${base}_question_statements`]=[{id:'statement',question_id:id,statement_text:'Statement',correct_answer:'Yes',answer_reason:'Statement explanation',order_index:0}];
    }else{
      const [suffix,fk]=section==='vr'?['passages','passage_id']:section==='qr'?['sets','set_id']:['scenarios','scenario_id'];
      q[fk]=parentId;tables[`${base}_${suffix}`]=[{id:parentId,body:'Complete passage/scenario',stimulus:{type:'table',data:{headers:['A'],rows:[[1]]}},test_id:9}];
    }
    const client=mock(tables),result=await resolveContent(client,{kind:'question',section,mode,content_id:id});
    assert.equal(result.available,true);
    assert.equal(result.question.answer,'B');assert.equal(result.question.explanation,'Complete explanation');
    assert.ok(client.calls.every(t=>mode==='timed'?t.startsWith('timed_'):!t.startsWith('timed_')));
    if(section==='dm') {assert.equal(result.question.options[0].label,'A');assert.equal(result.question.options[1].vennConfig.shape,'fixture');assert.equal(result.question.statements[0].reason,'Statement explanation');}
    else if(section==='qr')assert.equal(result.question.stimulus.type,'table');
    else assert.equal(result.question.context,'Complete passage/scenario');
  }
});
test('missing, unknown, preview and non-UUID content cannot silently resolve a different question',async()=>{
  const client=mock({});
  assert.equal((await resolveContent(client,{kind:'question',section:'vr',mode:'practice',content_id:id})).available,false);
  for(const overrides of [{section:'invalid'},{mode:'unknown'},{mode:'preview'},{content_id:'demo-unknown'}]) {
    const before=client.calls.length;
    assert.equal((await resolveContent(client,{kind:'question',section:'vr',mode:'practice',content_id:id,...overrides})).available,false);
    assert.equal(client.calls.length,before);
  }
});
test('bundled catalogue includes full lessons and demo/worked questions; forum fetches complete thread',async()=>{
  const catalogue=JSON.parse(fs.readFileSync(new URL('../supabase/functions/admin-reports/catalogue.json',import.meta.url)));
  assert.ok(Object.keys(catalogue.lessons).length>=140);assert.ok(Object.keys(catalogue.questions).length>=37);
  const lesson=await resolveContent(mock({}),{kind:'lesson',section:'vr',content_id:'what-vr-tests'},catalogue);
  assert.equal(lesson.available,true);assert.ok(lesson.lesson.steps.length>1);
  const demo=await resolveContent(mock({}),{kind:'question',section:'dm',content_id:'demo-dm-tutor',mode:'demo'},catalogue);
  assert.equal(demo.available,true);assert.equal(demo.question.options.length,4);
  const client=mock({forum_replies:[{id,post_id:parentId,body:'Reported reply'},{id:'other',post_id:parentId,body:'Other reply'}],forum_posts:[{id:parentId,body:'Full parent'}],forum_attachments:[{id:'image',post_id:parentId,storage_path:'private/image.png'}]});
  const forum=await resolveContent(client,{kind:'forum_reply',content_id:id});
  assert.equal(forum.target.body,'Reported reply');assert.equal(forum.post.body,'Full parent');assert.equal(forum.replies.length,2);assert.equal(forum.attachments.length,1);
});
test('Sentry links are optional, HTTPS-only and restricted to Sentry',()=>{
  assert.equal(sentryLink({},''),null);assert.equal(sentryLink({},'https://sentry.io.evil.test/issues/'),null);
  assert.equal(sentryLink({},'javascript:alert(1)'),null);
  assert.match(sentryLink({content_id:id},'https://example.sentry.io/issues/'),/query=/);
});
