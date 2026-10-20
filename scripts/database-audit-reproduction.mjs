// Local, disposable PostgreSQL reproductions for the database audit.
// No network, credentials, production database, or persistent data directory.
// Run: node scripts/database-audit-reproduction.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
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
  console.log('All three audit scenarios reproduced with repository SQL.');
} finally {
  await db.close();
}
