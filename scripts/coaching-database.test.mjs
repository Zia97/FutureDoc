import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { buildCoachProfile } from '../src/lib/coaching/engine.js';

test('Postgres: lifecycle, quotas, archival, RLS and account deletion', async () => {
  const db = new PGlite();
  const alice = crypto.randomUUID(), bob = crypto.randomUUID(), question = crypto.randomUUID(), exam = crypto.randomUUID();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create table performance_question_tags(id text primary key,question_id uuid,section text,mode text,metadata jsonb);
      create table practice_question_attempts(id uuid primary key,user_id uuid references auth.users(id) on delete cascade,section text,question_id uuid,statement_index integer,selected_answer text,time_spent_ms integer,answered_at timestamptz default now());`);
    for (const base of ['verbal_reasoning', 'decision_making', 'quantitative_reasoning', 'situational_judgement']) {
      await db.exec(`create table timed_${base}_exam_attempts(id uuid primary key,user_id uuid references auth.users(id) on delete cascade,test_id integer,submitted_at timestamptz default now());
        create table timed_${base}_question_answers(id uuid primary key,user_id uuid references auth.users(id) on delete cascade,exam_attempt_id uuid references timed_${base}_exam_attempts(id) on delete cascade,question_id uuid,selected_answer ${base === 'decision_making' ? 'jsonb' : 'text'},time_ms integer);`);
    }
    await db.query('insert into auth.users values($1),($2)', [alice, bob]);
    await db.query('insert into performance_question_tags values($1,$2,$3,$4,$5)', ['vr:practice:test', question, 'vr', 'practice', { primarySkillId: 'vr.test', answer: 'True' }]);
    await db.query('insert into practice_question_attempts(id,user_id,section,question_id,selected_answer,time_spent_ms) values($1,$2,$3,$4,$5,$6)', [crypto.randomUUID(), alice, 'vr', question, 'True', 5000]);
    await db.query('insert into timed_verbal_reasoning_exam_attempts(id,user_id,test_id) values($1,$2,1)', [exam, alice]);
    await db.query('insert into timed_verbal_reasoning_question_answers values($1,$2,$3,$4,$5,$6)', [crypto.randomUUID(), alice, exam, question, 'False', 6000]);
    await db.exec(fs.readFileSync('supabase/migrations/20261017000001_ai_coaching.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/migrations/20261017000003_coach_reset_progress.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/migrations/20261020000002_coach_plan_introduction.sql', 'utf8'));
    assert.equal((await db.query('select count(*)::int n from coach_evidence')).rows[0].n, 2, 'existing evidence is backfilled');
    await db.query('insert into practice_question_attempts(id,user_id,section,question_id,selected_answer,time_spent_ms) values($1,$2,$3,$4,$5,$6)', [crypto.randomUUID(), alice, 'vr', question, 'False', 10000]);
    await db.query('insert into timed_verbal_reasoning_question_answers values($1,$2,$3,$4,$5,$6)', [crypto.randomUUID(), alice, exam, question, 'True', 7000]);
    for (const [section, base] of [['dm','decision_making'],['qr','quantitative_reasoning'],['sj','situational_judgement']]) {
      const id = crypto.randomUUID();
      await db.query(`insert into timed_${base}_exam_attempts(id,user_id,test_id) values($1,$2,1)`, [id, alice]);
      await db.query(`insert into timed_${base}_question_answers values($1,$2,$3,$4,$5,$6)`, [crypto.randomUUID(), alice, id, question, section === 'dm' ? { 0: 'Yes' } : 'A', 1000]);
      await db.query(`delete from timed_${base}_exam_attempts where id=$1`, [id]);
    }
    await db.query('delete from timed_verbal_reasoning_exam_attempts where id=$1', [exam]);
    assert.equal((await db.query('select count(*)::int n from coach_evidence')).rows[0].n, 7, 'all four timed formats survive reset');
    const source = (await db.query("select payload from coach_evidence where payload->>'mode'='practice' limit 1")).rows[0].payload;
    assert.equal(source.tag.answer, 'True', 'grading snapshot retained');
    const session = { kind: 'assessment', title: 'Assessment', form_version: 'test', time_multiplier: 1, questions: [], budgets: {}, progress: { phase: 'instructions' } };
    const start = async (user, data = session, pro = false) => (await db.query('select coach_start_session($1,$2,$3) s', [user, data, pro])).rows[0].s;
    await assert.rejects(start(bob, { ...session, kind: 'practice' }, true), /assessment_required/);
    const [one, two] = await Promise.all([start(alice), start(alice)]); assert.equal(one.id, two.id, 'concurrent starts reuse active assessment');
    const tag = { id: question, section: 'vr', mode: 'practice', parentId: question, primarySkillId: 'vr.test', answer: 'True' };
    const save = async (user, s, version, complete = false) => (await db.query('select coach_save_session($1,$2,$3,$4,$5,$6) s', [user, s.id, version, { phase: complete ? 'finished' : 'paused' }, complete ? { sections: [] } : null, complete ? [{ questionId: question, section: 'vr', mode: 'coach', kind: s.kind,
      sessionId: s.id, tag, selectedAnswer: 'True', answeredAt: '2026-01-01T00:00:00Z' }] : []])).rows[0].s;
    await assert.rejects(save(bob, one, 0), /session_not_found/);
    const paused = await save(alice, one, 0); assert.equal(paused.version, 1);
    await assert.rejects(save(alice, one, 0), /version_conflict/);
    const completed = await save(alice, one, 1, true); assert.equal(completed.status, 'completed');
    const baselineEvidence = async () => (await db.query('select payload from coach_evidence where user_id=$1 and source_key=$2', [alice, `coach:${one.id}:${question}`])).rows[0].payload;
    const running = (evidence) => buildCoachProfile({ catalogue: { skills: [], questions: [tag] },
      rawEvidence: [evidence], baselineCompletedAt: completed.completed_at }).runningSections[0];
    assert.equal(running(await baselineEvidence()).accuracy, null, 'reproduces edge timestamp excluding the completed mini mock');
    const repair = fs.readFileSync('supabase/migrations/20261020000001_coach_completion_evidence_time.sql', 'utf8');
    await db.exec(repair);
    const repaired = await baselineEvidence();
    assert.equal(Date.parse(repaired.answeredAt), Date.parse(completed.completed_at));
    assert.equal(running(repaired).accuracy, 100, 'existing mini mock contributes to running accuracy after repair');
    assert.equal(running(repaired).questions, 1);
    assert.deepEqual((await db.query("select payload from coach_evidence where payload->>'mode'='practice' limit 1")).rows[0].payload, source,
      'repair leaves separate practice evidence unchanged');
    await db.exec(repair);
    assert.deepEqual(await baselineEvidence(), repaired, 'repair is idempotent');
    assert.equal((await save(alice, one, 1, true)).id, one.id, 'completion is idempotent');
    assert.equal((await start(alice)).id, one.id, 'baseline cannot be replaced');
    await db.query('update coach_profiles set plan_intro_session_id=$1 where user_id=$2', [one.id, alice]);
    assert.equal((await db.query('select plan_intro_session_id from coach_profiles where user_id=$1', [alice])).rows[0].plan_intro_session_id, one.id);
    const trial = await start(alice, { ...session, kind: 'practice' });
    const trialCompleted = await save(alice, trial, 0, true);
    const trialEvidence = (await db.query('select payload from coach_evidence where user_id=$1 and source_key=$2', [alice, `coach:${trial.id}:${question}`])).rows[0].payload;
    assert.equal(Date.parse(trialEvidence.answeredAt), Date.parse(trialCompleted.completed_at), 'future completions use the database timestamp');
    await assert.rejects(start(alice, { ...session, kind: 'practice' }), /pro_required/);
    const paid = await start(alice, { ...session, kind: 'review' }, true); assert.equal(paid.kind, 'review');
    const reserve = async (id = crypto.randomUUID(), pro = false) => (await db.query('select coach_reserve_message($1,$2,$3,$4) r', [alice, id, 'How am I doing?', pro])).rows[0].r;
    const request = crypto.randomUUID(); const first = await reserve(request);
    assert.equal(first.reserved, true); assert.equal((await reserve(request)).reserved, false);
    await assert.rejects(reserve(), /message_in_progress/);
    for (let i = 0; i < 5; i++) {
      await db.query("update coach_messages set status='completed' where user_id=$1", [alice]);
      if (i < 4) assert.equal((await reserve()).reserved, true);
    }
    await assert.rejects(reserve(), /pro_required/); assert.equal((await reserve(crypto.randomUUID(), true)).reserved, true);
    const bobAssessment = await start(bob);
    await db.query('insert into coach_plans(user_id,evidence_count,plan_key,profile) values($1,7,$2,$3)', [alice, 'before-reset', { plan: [] }]);
    await db.query('insert into coach_milestones(user_id,key,label) values($1,$2,$3)', [alice, 'first_step', 'First step']);
    await db.query('select coach_reset_progress($1)', [alice]);
    for (const table of ['coach_sessions','coach_evidence','coach_plans','coach_messages','coach_milestones']) {
      assert.equal((await db.query(`select count(*)::int n from ${table} where user_id=$1`, [alice])).rows[0].n, 0, `${table} reset`);
    }
    const resetProfile = (await db.query('select * from coach_profiles where user_id=$1', [alice])).rows[0];
    assert.equal(resetProfile.baseline_session_id, null);
    assert.equal(resetProfile.plan_intro_session_id, null, 'a new mini mock gets a new introduction after reset');
    assert.ok(resetProfile.preview_session_id && resetProfile.preview_session_id !== trial.id, 'free coached set remains used without retaining its old session ID');
    assert.equal(resetProfile.free_chat_used, 5, 'free chat remains used');
    assert.equal(resetProfile.chat_day_used, 6, 'daily chat limit remains used');
    assert.equal((await db.query('select count(*)::int n from practice_question_attempts where user_id=$1', [alice])).rows[0].n, 2, 'separate practice history stays');
    assert.equal((await db.query('select id from coach_sessions where user_id=$1', [bob])).rows[0].id, bobAssessment.id, 'another student is unaffected');
    await assert.rejects(save(alice, paid, 0), /session_not_found/, 'old session cannot be restored');
    const retake = await start(alice);
    assert.notEqual(retake.id, one.id, 'initial assessment can be retaken');
    await save(alice, retake, 0, true);
    await assert.rejects(start(alice, { ...session, kind: 'practice' }), /pro_required/, 'reset does not restore the free coached set');
    await assert.rejects(reserve(), /pro_required/, 'reset does not restore free chat');
    await db.query('update coach_profiles set chat_day_used=100 where user_id=$1', [alice]);
    await assert.rejects(reserve(crypto.randomUUID(), true), /daily_limit/, 'reset does not bypass the daily chat cap');
    await db.exec('set role authenticated');
    for (const table of ['coach_profiles','coach_sessions','coach_evidence','coach_plans','coach_messages','coach_milestones']) await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
    await assert.rejects(db.query('select coach_start_session($1,$2,true)', [bob, session]), /permission denied/);
    await assert.rejects(db.query('select coach_reset_progress($1)', [bob]), /permission denied/);
    await db.exec('reset role');
    await db.query('delete from auth.users where id=$1', [alice]);
    for (const table of ['coach_profiles','coach_sessions','coach_evidence','coach_plans','coach_messages','coach_milestones']) assert.equal((await db.query(`select count(*)::int n from ${table} where user_id=$1`, [alice])).rows[0].n, 0, `${table} erased on account deletion`);
  } finally { await db.close(); }
});
