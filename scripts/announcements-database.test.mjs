import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const migration=fs.readFileSync(new URL('../supabase/migrations/20261020150000_question_announcements.sql',import.meta.url),'utf8');
const id=n=>`20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const admin=id(1),q=id(90),issue=`question:qr:practice:${q}`;

test('announcement SQL: exact audience, immutable preview, retry safety, cancellation and student isolation',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
      create schema auth;create schema admin;
      create table auth.users(id uuid primary key,deleted_at timestamptz,is_anonymous boolean default false,banned_until timestamptz);
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create table user_profiles(user_id uuid primary key,is_admin boolean default false,is_suspended boolean default false);
      create table question_reports(question_id uuid,section text,is_timed boolean,user_id uuid);
      create table practice_question_attempts(user_id uuid,question_id uuid,section text,selected_answer text);
      create table coach_evidence_records(user_id uuid,payload jsonb);
      create view coach_evidence as select * from coach_evidence_records;
      create table admin.report_evidence(issue_key text,conclusion text);
      grant usage on schema public,auth to anon,authenticated,service_role;
      revoke all on schema admin from public,anon,authenticated;
      create function admin.require_report_admin(p_actor uuid) returns void language plpgsql security definer set search_path='' as $$
      begin if p_actor is null or not exists(select 1 from public.user_profiles where user_id=p_actor and is_admin)
        then raise exception 'forbidden' using errcode='42501';end if;end $$;`);
    for(const name of ['verbal_reasoning','decision_making','quantitative_reasoning','situational_judgement'])
      await db.exec(`create table timed_${name}_question_answers(user_id uuid,question_id uuid,selected_answer ${name==='decision_making'?'jsonb':'text'});`);
    for(let n=1;n<=10;n++){
      await db.query('insert into auth.users(id) values($1)',[id(n)]);
      await db.query('insert into user_profiles(user_id,is_admin) values($1,$2)',[id(n),n===1]);
    }
    await db.exec(migration);
    const rpc=async(name,args=[])=>(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) result`,args)).rows[0].result;
    const preview=(audience='both',target=issue,actor=admin)=>rpc('admin_announcements_preview',[actor,target,audience,'Question correction','<script>alert(1)</script>\nA plain-text notice.']);
    const student=async(user,action='pending',announcement=null)=>{
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role authenticated');
      try{return await rpc('student_announcements',[action,announcement]);}finally{await db.exec('reset role');}
    };
    await assert.rejects(preview(),/confirmed_finding_required/);
    await db.query("insert into admin.report_evidence values($1,'confirmed_error')",[issue]);
    for(const n of [2,2,3,4,5,6,7,8,10])
      await db.query('insert into question_reports values($1,$2,false,$3)',[q,'qr',id(n)]);
    await db.query("insert into question_reports values($1,'qr',false,null)",[q]);
    await db.query('update auth.users set deleted_at=now() where id=$1',[id(4)]);
    await db.query('update auth.users set banned_until=now()+interval \'1 day\' where id=$1',[id(5)]);
    await db.query('update user_profiles set is_suspended=true where user_id=$1',[id(6)]);
    await db.query('update auth.users set is_anonymous=true where id=$1',[id(7)]);
    await db.query('delete from auth.users where id=$1',[id(8)]);
    await db.query('delete from user_profiles where user_id=$1',[id(10)]);
    await db.query("insert into practice_question_attempts values($1,$2,'qr','A'),($1,$2,'qr','B'),($3,$2,'vr','A')",[id(2),q,id(9)]);
    await db.query("insert into timed_quantitative_reasoning_question_answers values($1,$2,'A')",[id(9),q]);
    await db.query("insert into coach_evidence_records values($1,$2)",[id(9),{section:'qr',mode:'practice',questionId:q,selectedAnswer:{0:'',1:null}}]);
    await db.query("insert into coach_evidence_records values($1,$2)",[id(3),{section:'qr',mode:'practice',questionId:q,selectedAnswer:'B'}]);
    await assert.rejects(preview('both',issue,id(2)),/forbidden/);
    await assert.rejects(preview('both',issue.replace('practice','timed')),/confirmed_finding_required/);
    const reporters=await preview('reporters'),attempters=await preview('attempters'),both=await preview();
    assert.equal(reporters.count,2);assert.equal(attempters.count,2);assert.equal(both.count,2);
    assert.equal(both.reporters,2);assert.equal(both.attempters,2);
    // New attempts after preview do not silently expand the reviewed audience.
    await db.query("insert into practice_question_attempts values($1,$2,'qr','C')",[id(9),q]);
    await assert.rejects(rpc('admin_announcements_send',[id(2),both.id]),/forbidden/);
    assert.deepEqual(await rpc('admin_announcements_send',[admin,both.id]),await rpc('admin_announcements_send',[admin,both.id]));
    assert.equal((await rpc('admin_announcements_history',[admin,issue,1])).items[0].recipients,2);
    assert.equal((await db.query("select count(*)::int n from admin.announcement_audit where action='send'")).rows[0].n,1);
    assert.equal((await student(id(9))).length,0,'new attempter absent from frozen snapshot');
    assert.equal(await student(id(9),'display',both.id),null,'cannot read another recipient by ID');
    assert.equal(await student(id(9),'acknowledge',both.id),null,'cannot acknowledge another recipient');
    assert.equal(await student(id(3),'acknowledge',both.id),null,'cannot ack before display');
    const received=await student(id(2));
    assert.equal(received.length,1);assert.ok(received[0].message.startsWith('<script>'),'stored as plain text');
    assert.ok(await student(id(2),'display',both.id));
    assert.equal((await rpc('admin_announcements_cancel',[admin,both.id])).cancelled,1);
    assert.equal((await student(id(3))).length,0,'cancelled even if message had been fetched');
    assert.equal(await student(id(3),'display',both.id),null);
    assert.ok(await student(id(2),'acknowledge',both.id));
    assert.ok(await student(id(2),'acknowledge',both.id),'ack retry is idempotent');
    assert.equal((await student(id(2))).length,0);
    assert.equal((await rpc('admin_announcements_cancel',[admin,both.id])).cancelled,0);
    const history=await rpc('admin_announcements_history',[admin,issue,1]);
    assert.equal(history.items[0].acknowledged,1);assert.equal(history.items[0].cancelled,1);
    // Account becoming unavailable between preview and send is excluded.
    const later=await preview();
    await db.query('update auth.users set deleted_at=now() where id=$1',[id(9)]);
    assert.equal((await rpc('admin_announcements_send',[admin,later.id])).count,2);
    // Expired/withdrawn confirmation previews cannot be sent, but prior send retries still work.
    await db.query("update admin.question_announcements set created_at=now()-interval '31 minutes' where id=$1",[reporters.id]);
    await assert.rejects(rpc('admin_announcements_send',[admin,reporters.id]),/preview_expired/);
    await db.exec("update admin.report_evidence set conclusion='unconfirmed'");
    await assert.rejects(rpc('admin_announcements_send',[admin,attempters.id]),/confirmed_finding_required/);
    assert.equal((await rpc('admin_announcements_send',[admin,both.id])).count,2);
    // RPC grants, not just UI visibility, enforce all privileged actions.
    for(const role of ['anon','authenticated']){
      await db.exec(`set role ${role}`);
      for(const [name,args] of [['admin_announcements_preview',[admin,issue,'both','T','M']],['admin_announcements_send',[admin,both.id]],
        ['admin_announcements_cancel',[admin,both.id]],['admin_announcements_history',[admin,issue,1]]])
        await assert.rejects(rpc(name,args),/permission denied/);
      await assert.rejects(db.query('select * from admin.announcement_recipients'),/permission denied/);
      if(role==='anon')await assert.rejects(rpc('student_announcements',['pending',null]),/permission denied/);
      await db.exec('reset role');
    }
    assert.equal((await db.query('select count(*)::int n from practice_question_attempts')).rows[0].n,4,'attempt history unchanged');
    // All four source tables and both modes, including coach snapshots with an exact source tag.
    for(const [section,base] of Object.entries({vr:'verbal_reasoning',dm:'decision_making',qr:'quantitative_reasoning',sj:'situational_judgement'})){
      for(const mode of ['practice','timed']){
        const question=id(200+Object.keys({vr:1,dm:1,qr:1,sj:1}).indexOf(section)*2+(mode==='timed'?1:0));
        await db.query('insert into question_reports values($1,$2,$3,$4)',[question,section,mode!=='timed',admin]);
        if(mode==='practice')await db.query('insert into practice_question_attempts values($1,$2,$3,$4)',[id(2),question,section,'A']);
        else await db.query(`insert into timed_${base}_question_answers values($1,$2,$3)`,[id(2),question,section==='dm'?JSON.stringify({0:'Yes',1:null}):'A']);
        await db.query('insert into coach_evidence_records values($1,$2)',[id(3),{section,mode:'coach',questionId:question,selectedAnswer:'B',tag:{id:question,section,mode}}]);
        await db.query('insert into coach_evidence_records values($1,$2)',[admin,{section,mode:'coach',questionId:question,selectedAnswer:'B',tag:{id:question,section,mode:mode==='practice'?'timed':'practice'}}]);
        const audience=(await db.query('select * from admin.announcement_audience($1,$2,$3)',[section,mode,question])).rows;
        assert.deepEqual(audience.map(a=>a.user_id).sort(),[id(2),id(3)],`${section}/${mode} preserves exact source mode`);
      }
    }
  } finally { await db.close(); }
});
