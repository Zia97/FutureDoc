// Local, disposable PostgreSQL reproductions for the database audit.
// No network, credentials, production database, or persistent data directory.
// Run: node scripts/database-growth-regression.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';

const db = new PGlite({ extensions: { pg_trgm } });
const user = crypto.randomUUID();
const question = crypto.randomUUID();
const migration = async (name) => db.exec(fs.readFileSync(
  new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));

try {
  // Minimal supporting schema; the RPC and trigger definitions below are the
  // repository's real migrations. This checks behaviour, not production speed.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select current_setting('audit.user_id')::uuid $$;
    create table performance_question_tags (
      id text primary key, question_id uuid, section text, mode text, metadata jsonb
    );
    create table practice_question_attempts (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) on delete cascade,
      section text, question_id uuid, statement_index smallint,
      selected_answer text, is_correct boolean, time_spent_ms integer,
      answered_at timestamptz default now()
    );
  `);
  await db.query('insert into auth.users values ($1)', [user]);
  await db.query("select set_config('audit.user_id', $1, false)", [user]);
  for (const base of ['verbal_reasoning', 'decision_making', 'quantitative_reasoning', 'situational_judgement']) {
    await db.exec(`
      create table timed_${base}_exam_attempts (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references auth.users(id) on delete cascade,
        test_id smallint, submitted_at timestamptz default now(),
        score_percent smallint, correct_count smallint, time_taken_seconds integer,
        flags jsonb, analytics_summary jsonb, unique(user_id, test_id)
      );
      create table timed_${base}_question_answers (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references auth.users(id) on delete cascade,
        exam_attempt_id uuid references timed_${base}_exam_attempts(id) on delete cascade,
        question_id uuid, passage_id uuid, scenario_id uuid, set_id uuid,
        selected_answer ${base === 'decision_making' ? 'jsonb' : 'text'},
        time_ms integer, unique(exam_attempt_id, question_id)
      );
    `);
  }
  await db.exec('alter table practice_question_attempts add column platform text, add column app_version text');
  await migration('20260508000001_create_question_stats.sql');
  await migration('20261017000001_ai_coaching.sql');
  await migration('20260701000001_atomic_timed_exam_submit.sql');
  await db.query('insert into performance_question_tags values ($1,$2,$3,$4,$5)',
    ['vr:timed:audit', question, 'vr', 'timed', { answer: 'True', primarySkillId: 'vr.test' }]);

  const answers = [{ question_id: question, passage_id: crypto.randomUUID(), selected_answer: 'True', time_ms: 5000 }];
  const submit = () => db.query(
    "select submit_timed_vr_exam(1::smallint,100::smallint,1::smallint,5,'[]'::jsonb,$1::jsonb,null)",
    [JSON.stringify(answers)]);
  await submit();
  await submit(); // Same payload, as after a lost acknowledgement.
  const retry = (await db.query(`
    select
      (select count(*)::int from timed_verbal_reasoning_exam_attempts) as current_exams,
      (select count(*)::int from timed_verbal_reasoning_question_answers) as current_answers,
      (select count(*)::int from coach_evidence where payload->>'mode' = 'timed') as archived_answers
  `)).rows[0];
  assert.deepEqual(retry, { current_exams: 1, current_answers: 1, archived_answers: 2 });
  console.log('Identical timed submission twice:', JSON.stringify(retry));

  const practice = () => db.query(`
    insert into practice_question_attempts(user_id,section,question_id,selected_answer,is_correct,time_spent_ms)
    values($1,'vr',$2,'True',true,5000)
  `, [user, question]);
  await practice();
  await db.query('delete from practice_question_attempts where user_id=$1', [user]);
  await practice();
  const retention = (await db.query(
    'select total_first_attempts from question_stats where question_id=$1', [question])).rows[0];
  assert.equal(retention.total_first_attempts, 2);
  console.log('One student, delete raw history, answer again:', JSON.stringify(retention));

  // Naively batching repeated answers under the existing AFTER INSERT trigger
  // is not safe either: both rows can see the other and skip their contribution.
  const batchQuestion = crypto.randomUUID();
  await db.query(`
    insert into practice_question_attempts(user_id,section,question_id,selected_answer,is_correct,time_spent_ms)
    values($1,'vr',$2,'True',true,5000),($1,'vr',$2,'False',false,6000)
  `, [user, batchQuestion]);
  const batch = (await db.query(
    'select count(*)::int as aggregate_rows from question_stats where question_id=$1', [batchQuestion])).rows[0];
  assert.equal(batch.aggregate_rows, 0);
  console.log('Two first-time rows for the same question in one insert:', JSON.stringify(batch));

  await migration('20261014120000_performance_cohort_cache.sql');
  await migration('20261020000003_performance_coaching_cohort.sql');
  await migration('20261020000004_database_write_safety.sql');
  await migration('20261020000005_compact_evidence.sql');
  await migration('20261020135900_database_compaction_integrity.sql');
  await migration('20261020000006_background_cohort.sql');
  await migration('20261020000008_evidence_revision.sql');
  await migration('20261020000014_write_guards.sql');
  const newQuestion = crypto.randomUUID();
  const rows = [true,false].map((correct) => ({id:crypto.randomUUID(),user_id:user,section:'vr',question_id:newQuestion,selected_answer:correct?'A':'B',is_correct:correct,time_spent_ms:5000,answered_at:new Date().toISOString()}));
  await db.query('select upload_practice_attempts($1::jsonb)',[JSON.stringify(rows)]);
  await db.query('select upload_practice_attempts($1::jsonb)',[JSON.stringify(rows)]);
  assert.equal((await db.query('select total_first_attempts from question_stats where question_id=$1',[newQuestion])).rows[0].total_first_attempts,1);
  await db.query('delete from practice_question_attempts where question_id=$1',[newQuestion]);
  rows[0].id=crypto.randomUUID();
  await db.query('select upload_practice_attempts($1::jsonb)',[JSON.stringify([rows[0]])]);
  assert.equal((await db.query('select total_first_attempts from question_stats where question_id=$1',[newQuestion])).rows[0].total_first_attempts,1);
  const upload = (receipt) => db.query("select submit_timed_exam_v2($1,'vr',1::smallint,100::smallint,1::smallint,5,'[]'::jsonb,$2::jsonb,null) id",[receipt,JSON.stringify(answers)]);
  const a=(await upload('first')).rows[0].id;
  assert.equal((await upload('first')).rows[0].id,a);
  const b=(await upload('retake')).rows[0].id;
  assert.notEqual(b,a);
  assert.equal((await upload('first')).rows[0].id,a);
  assert.equal((await db.query('select id from timed_verbal_reasoning_exam_attempts')).rows[0].id,b);
  const before=(await db.query('select id,payload from coach_evidence order by id')).rows;
  while ((await db.query('select compact_evidence_batch(2) n')).rows[0].n) {}
  assert.deepEqual((await db.query('select id,payload from coach_evidence order by id')).rows,before);
  assert.equal((await db.query("select count(*)::int n from coach_evidence_records where payload ? 'tag'")).rows[0].n,0);
  assert.equal((await db.query('select count(*)::int n from coach_evidence_tags')).rows[0].n,2);
  await db.exec("create table lesson_progress(user_id uuid,lesson_id text,section text,time_spent_seconds integer default 0,completed_at timestamptz,last_seen_at timestamptz default now(),platform text,app_version text,unique(user_id,lesson_id))");
  await migration('20261020000007_lesson_checkpoints.sql');
  const device=crypto.randomUUID();
  const checkpoint = (n,complete=false) => db.query("select save_lesson_checkpoint($1,'lesson-1','vr',$2,$3)",[device,n,complete]);
  await checkpoint(60); await checkpoint(60); await checkpoint(120,true); await checkpoint(60);
  assert.equal((await db.query('select time_spent_seconds n from lesson_progress')).rows[0].n,120);
  assert.ok((await db.query('select completed_at from lesson_progress')).rows[0].completed_at);

  await db.exec("create table user_profiles(user_id uuid primary key,display_name text,email text,is_admin boolean default false); create table app_kill_switches(key text primary key,enabled boolean,notes text); create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,created_at timestamptz default now()); alter table storage.objects enable row level security;");
  await migration('20260928000001_create_forum.sql');
  await migration('20260929000001_add_forum_likes_and_reply_threads.sql');
  await migration('20261009000001_notification_preferences.sql');
  await db.exec("create table ai_tutor_logs(user_id uuid,assistant_response text,id bigint generated by default as identity primary key,created_at timestamptz default now(),is_demo boolean default false,is_preview boolean default false,error_code text,feedback text,record_status text)");
  await migration('20261020000009_operational_limits.sql');
  await migration('20261020000017_storage_rate_action.sql');
  await migration('20261020000011_forum_pagination.sql');
  await migration('20261020000013_admin_pagination.sql');
  await db.query("insert into user_profiles(user_id,display_name,is_admin) values($1,'Test user',true)",[user]);
  await db.query("insert into forum_guideline_acceptances(user_id,version) values($1,'2026-09-28')",[user]);
  const post=(await db.query("select forum_create_pending_post('Test discussion','A test discussion for pagination.') p")).rows[0].p;
  await db.query("update forum_posts set status='published' where id=$1",[post.id]);
  const member=(await db.query('select id from forum_members where user_id=$1',[user])).rows[0].id;
  await db.query("insert into forum_replies(post_id,author_user_id,author_member_id,body,status) select $1,$2,$3,'Reply '||n,'published' from generate_series(1,35) n",[post.id,user,member]);
  assert.equal((await db.query('select forum_admin_get_queue_page(0) p')).rows[0].p.pending.length,0);
  const page=(await db.query('select forum_get_thread_page($1) p',[post.id])).rows[0].p;
  assert.equal(page.replies.length,30); assert.ok(page.nextCursor);
  const next=(await db.query('select forum_get_thread_page($1,$2,$3) p',[post.id,page.nextCursor.createdAt,page.nextCursor.id])).rows[0].p;
  assert.equal(next.replies.length,5); assert.equal(new Set([...page.replies,...next.replies].map(x=>x.id)).size,35);
  assert.equal((await db.query('select reply_count from forum_posts where id=$1',[post.id])).rows[0].reply_count,35);
  await db.query("update forum_replies set status='deleted' where id=$1",[page.replies[0].id]);
  assert.equal((await db.query('select reply_count from forum_posts where id=$1',[post.id])).rows[0].reply_count,34);
  await db.exec("insert into ai_tutor_logs(created_at,is_demo) values(now()-interval '31 days',true); insert into ai_tutor_logs(created_at) values(now()-interval '31 days')");
  await db.query('select database_maintenance()');
  assert.equal((await db.query('select count(*)::int n from ai_tutor_logs')).rows[0].n,1,'ordinary legacy history retained');
  await db.exec("create table usage_counts(user_id uuid primary key,n int default 0); create function increment_ai_usage(p_user_id uuid,p_limit integer,p_unlimited boolean) returns integer language plpgsql set search_path=public as $body$ declare used int; begin insert into usage_counts values(p_user_id,1) on conflict(user_id) do update set n=usage_counts.n+1 returning n into used; return case when used>p_limit and not p_unlimited then -1 else used end; end $body$;");
  await migration('20261020000010_tutor_requests.sql');
  await migration('20261020000015_compact_tutor_receipts.sql');
  const request=crypto.randomUUID(); const created=new Date().toISOString();
  const reserve=()=>db.query('select reserve_tutor_request($1,$2,$3,false,false) r',[user,request,created]);
  assert.ok((await reserve()).rows[0].r.reserved);
  await assert.rejects(reserve(),/message_in_progress/);
  await db.query('select finish_tutor_request($1,$2,null)',[user,request]);
  await reserve();
  assert.equal((await db.query('select n from usage_counts')).rows[0].n,1);
  await db.query('select finish_tutor_request($1,$2,$3)',[user,request,{content:'Saved answer'}]);
  assert.equal((await reserve()).rows[0].r.response.content,'Saved answer');
  await assert.rejects(db.query("select reserve_tutor_request($1,$2,now()-interval '9 days',false,true)",[user,crypto.randomUUID()]),/request_expired/);
  assert.equal((await db.query('select count(*)::int n from performance_cohort_cache')).rows[0].n,0);
  await db.query('select get_performance_cohort()');
  assert.equal((await db.query('select count(*)::int n from performance_cohort_cache')).rows[0].n,0,'interactive RPC never rebuilds');
  await db.query('select refresh_performance_cohort()');
  assert.equal((await db.query('select count(*)::int n from performance_cohort_cache')).rows[0].n,1);
  await db.exec("create schema cron; create function cron.schedule(text,text,text) returns bigint language sql as 'select 1::bigint'");
  await db.exec(fs.readFileSync('supabase/migrations/20261020000012_scheduled_maintenance.sql','utf8').replace(/^create extension.*$/gm,''));
  await migration('20261020000016_growth_monitoring.sql');
  await db.exec("create schema net; create schema vault; create table vault.decrypted_secrets(name text,decrypted_secret text); insert into vault.decrypted_secrets values('futuredoc_maintenance_url','https://test.invalid/maintenance'),('futuredoc_maintenance_key','fake-test-secret'); create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language sql as 'select 42::bigint'");
  await migration('20261020140500_storage_maintenance_dispatch.sql');
  assert.equal((await db.query('select dispatch_storage_maintenance() n')).rows[0].n,42);

  await db.query('select capture_database_health()'); await db.query('select capture_database_health()');
  assert.equal((await db.query('select count(*)::int n from database_health_daily')).rows[0].n,1);
  await db.query("insert into tutor_request_receipts(user_id,request_id,is_demo,created_at) values($1,$2,true,now()-interval '9 days')",[user,crypto.randomUUID()]);
  await db.query('select expire_operational_receipts()');
  assert.equal((await db.query("select count(*)::int n from tutor_request_receipts where created_at<now()-interval '8 days'")).rows[0].n,0);
  const pendingPost=crypto.randomUUID();
  await db.query("insert into forum_posts(id,author_user_id,author_member_id,title,body,status) values($1,$2,$3,'Pending post','Images attached here','pending')",[pendingPost,user,member]);
  for (const suffix of ['one','two']) {
    const path=user+'/'+pendingPost+'/'+suffix+'.jpg';
    assert.equal((await db.query('select forum_allow_media_upload($1) ok',[path])).rows[0].ok,true);
    await db.query("insert into storage.objects(bucket_id,name,created_at) values('forum-media',$1,now()-interval '3 days')",[path]);
  }
  assert.equal((await db.query('select forum_allow_media_upload($1) ok',[user+'/'+pendingPost+'/third.jpg'])).rows[0].ok,false);
  assert.equal((await db.query('select count(*)::int n from forum_media_cleanup_candidates()')).rows[0].n,2);
  await db.exec('set role authenticated');
  await assert.rejects(db.query('select * from coach_evidence'), /permission denied/);
  await assert.rejects(db.query('select * from timed_submission_receipts'), /permission denied/);
  console.log('Fixed regressions: batch statistics, retention, retry after retake, lossless evidence compaction, lesson retries and access controls.');

} finally {
  await db.close();
}
