import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { buildCoachProfile } from '../src/lib/coaching/engine.js';

test('coaching reset repairs and preserves practice and all timed histories with compact storage', async () => {
  const db = new PGlite();
  const alice = crypto.randomUUID(), bob = crypto.randomUUID();
  const sections = [['vr', 'verbal_reasoning'], ['dm', 'decision_making'],
    ['qr', 'quantitative_reasoning'], ['sj', 'situational_judgement']];
  const migration = (name) => db.exec(fs.readFileSync(`supabase/migrations/${name}.sql`, 'utf8'));
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create table performance_question_tags(id text primary key, question_id uuid, section text, mode text, metadata jsonb);
      create table practice_question_attempts(id uuid primary key, user_id uuid references auth.users(id) on delete cascade,
        section text, question_id uuid, statement_index integer, selected_answer text, time_spent_ms integer, answered_at timestamptz);`);
    for (const [, base] of sections) {
      await db.exec(`create table timed_${base}_exam_attempts(id uuid primary key, user_id uuid references auth.users(id) on delete cascade,
          test_id integer, submitted_at timestamptz);
        create table timed_${base}_question_answers(id uuid primary key, user_id uuid references auth.users(id) on delete cascade,
          exam_attempt_id uuid references timed_${base}_exam_attempts(id) on delete cascade, question_id uuid,
          selected_answer ${base === 'decision_making' ? 'jsonb' : 'text'}, time_ms integer);`);
    }
    await db.query('insert into auth.users values($1),($2)', [alice, bob]);
    for (const name of ['20261017000001_ai_coaching', '20261017000003_coach_reset_progress',
      '20261020000002_coach_plan_introduction', '20261020000005_compact_evidence', '20261020000008_evidence_revision']) await migration(name);

    const question = crypto.randomUUID();
    await db.query('insert into performance_question_tags values($1,$2,$3,$4,$5)',
      ['practice', question, 'vr', 'practice', { answer: 'A', confidence: 'high' }]);
    for (const [user, date] of [[alice, '2026-10-01'], [bob, '2026-09-01']]) {
      await db.query('insert into practice_question_attempts values($1,$2,$3,$4,null,$5,1000,$6)',
        [crypto.randomUUID(), user, 'vr', question, 'A', `${date}T12:00:00Z`]);
    }
    for (const [section, base] of sections) {
      const q = crypto.randomUUID(), exam = crypto.randomUUID();
      const tag = section === 'dm' ? { statementAnswers: ['Yes', 'No'] } : { answer: 'A', options: ['A', 'B', 'C', 'D'] };
      await db.query('insert into performance_question_tags values($1,$2,$3,$4,$5)',
        [section, q, section, 'timed', { ...tag, confidence: 'high' }]);
      await db.query(`insert into timed_${base}_exam_attempts values($1,$2,1,$3)`, [exam, alice, '2026-10-02T12:00:00Z']);
      await db.query(`insert into timed_${base}_question_answers values($1,$2,$3,$4,$5,1000)`,
        [crypto.randomUUID(), alice, exam, q, section === 'dm' ? { 0: 'Yes', 1: 'No' } : 'A']);
    }
    const rows = async (user) => (await db.query('select source_key,payload from coach_evidence where user_id=$1 order by source_key', [user])).rows;
    const bobBefore = await rows(bob);
    await db.query('select coach_reset_progress($1)', [alice]);
    assert.deepEqual(await rows(alice), [], 'reproduces the old reset losing the chart archive');
    assert.equal((await db.query('select count(*)::int n from practice_question_attempts where user_id=$1', [alice])).rows[0].n, 1);
    const revisionBefore = (await db.query('select coach_evidence_revision($1) r', [alice])).rows[0].r;

    await migration('20261021000000_coach_preserve_external_history');
    const restored = await rows(alice);
    assert.equal(restored.length, 5, 'practice and each of the four timed formats are repaired');
    assert.deepEqual(await rows(bob), bobBefore, 'existing snapshots remain unchanged');
    assert.notEqual((await db.query('select coach_evidence_revision($1) r', [alice])).rows[0].r, revisionBefore,
      'restored history invalidates the evidence cache');
    const profile = () => buildCoachProfile({ catalogue: { skills: [], questions: [] },
      rawEvidence: restored.map((r) => r.payload), now: Date.parse('2026-10-21T23:00:00Z') });
    assert.deepEqual(profile().overallHistory, [
      { date: '2026-10-01', accuracy: 100 }, { date: '2026-10-02', accuracy: 100 },
    ], 'practice before the mini mock contributes a real earlier point');
    assert.equal(profile().sections.find((s) => s.section === 'dm').earned, 2, 'DM statement answers survive repair');
    assert.equal((await db.query('select count(*)::int n from coach_evidence_records where user_id=$1 and tag_id is not null and not (payload ? \'tag\')', [alice])).rows[0].n, 5,
      'backfill uses compact tag storage');

    // Timed reset can remove the original exam while its first attempt remains
    // in the chart. A later coaching reset must preserve that archive too.
    await db.query('delete from timed_verbal_reasoning_exam_attempts where user_id=$1', [alice]);
    const session = (await db.query('select coach_start_session($1,$2,false) s', [alice, {
      kind: 'assessment', title: 'Mini mock', form_version: 'test', time_multiplier: 1,
      questions: [], budgets: {}, progress: { phase: 'instructions' },
    }])).rows[0].s;
    await db.query('insert into coach_evidence_records(user_id,source_key,payload) values($1,$2,$3)',
      [alice, `coach:${session.id}:question`, { mode: 'coach', questionId: question }]);
    await db.query('insert into coach_plans(user_id,evidence_count,plan_key,profile) values($1,1,$2,$3)', [alice, 'test', {}]);
    await db.query('insert into coach_milestones(user_id,key,label) values($1,$2,$3)', [alice, 'test', 'Test']);
    await db.query('insert into coach_messages(user_id,request_id,user_text) values($1,$2,$3)', [alice, crypto.randomUUID(), 'Test']);
    await db.query('select coach_reset_progress($1)', [alice]);
    assert.deepEqual(await rows(alice), restored, 'only coaching evidence is deleted');
    assert.deepEqual(await rows(bob), bobBefore, 'another account is unaffected');
    for (const table of ['coach_sessions', 'coach_plans', 'coach_milestones', 'coach_messages']) {
      assert.equal((await db.query(`select count(*)::int n from ${table} where user_id=$1`, [alice])).rows[0].n, 0, `${table} is still reset`);
    }
    await db.query('select coach_reset_progress($1)', [alice]);
    assert.deepEqual(await rows(alice), restored, 'repeated resets retain external history');
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select coach_reset_progress($1)', [alice]), /permission denied/);
    await db.exec('reset role');
    await db.query('delete from auth.users where id=$1', [alice]);
    assert.deepEqual(await rows(alice), [], 'account deletion still removes the archive');
  } finally { await db.close(); }
});
