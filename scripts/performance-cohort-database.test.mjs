import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { buildPerformanceReport } from '../src/lib/performance/engine.js';

test('Postgres cohort retains sparse section data, counts students once and includes separate coaching conditions', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create table performance_question_tags(section text, mode text, question_id uuid, metadata jsonb);
      create table practice_question_attempts(id uuid primary key, user_id uuid, section text, question_id uuid, statement_index int, selected_answer text, answered_at timestamptz default now());
      create table coach_evidence(id uuid primary key, user_id uuid, payload jsonb);`);
    for (const name of ['verbal_reasoning', 'decision_making', 'quantitative_reasoning', 'situational_judgement']) {
      await db.exec(`create table timed_${name}_exam_attempts(id uuid primary key, user_id uuid, submitted_at timestamptz);
        create table timed_${name}_question_answers(id uuid primary key, user_id uuid, exam_attempt_id uuid, question_id uuid, selected_answer ${name === 'decision_making' ? 'jsonb' : 'text'});`);
    }
    const students = Array.from({ length: 5 }, () => crypto.randomUUID());
    const qs = Array.from({ length: 3 }, () => crypto.randomUUID());
    for (const id of qs) await db.query('insert into performance_question_tags values($1,$2,$3,$4)', ['vr', 'practice', id, { section: 'vr', answer: 'A' }]);
    for (let i = 0; i < students.length; i++) {
      await db.query('insert into practice_question_attempts values($1,$2,$3,$4,null,$5,now())', [crypto.randomUUID(), students[i], 'vr', qs[i % 3], 'A']);
      for (const mode of ['practice', 'timed']) await db.query('insert into coach_evidence values($1,$2,$3)', [crypto.randomUUID(), students[i], {
        id: crypto.randomUUID(), mode, questionId: qs[i % 3], section: 'vr', selectedAnswer: 'A', answeredAt: '2026-01-01T00:00:00Z',
        tag: { section: 'vr', answer: 'A' },
      }]);
      for (const id of qs) await db.query('insert into coach_evidence values($1,$2,$3)', [crypto.randomUUID(), students[i], {
        mode: 'coach', kind: 'assessment', questionId: `private-${id}`, section: 'dm', selectedAnswer: 'B', answeredAt: '2026-01-01T00:00:00Z',
        tag: { section: 'dm', answer: 'A', primarySkillId: 'dm.logic', confidence: 'high' },
      }]);
    }
    await db.query('insert into coach_evidence values($1,$2,$3)', [crypto.randomUUID(), students[0], {
      mode: 'coach', kind: 'assessment', questionId: `private-${qs[0]}`, section: 'dm', selectedAnswer: 'A', answeredAt: '2026-01-02T00:00:00Z',
      tag: { section: 'dm', answer: 'A' },
    }]);
    await db.query('insert into coach_evidence values($1,$2,$3)', [crypto.randomUUID(), crypto.randomUUID(), {
      mode: 'coach', kind: 'assessment', questionId: 'interrupted', section: 'dm', interrupted: true, selectedAnswer: 'A', answeredAt: '2026-01-01T00:00:00Z', tag: { section: 'dm', answer: 'A' },
    }]);
    await db.exec(fs.readFileSync('supabase/migrations/20261014120000_performance_cohort_cache.sql', 'utf8'));
    const old = (await db.query('select get_performance_cohort() c')).rows[0].c;
    assert.equal(old.rows.length, 0, 'old query hid all data despite five students across three questions');
    await db.exec(fs.readFileSync('supabase/migrations/20261020000003_performance_coaching_cohort.sql', 'utf8'));
    const cohort = (await db.query('select get_performance_cohort() c')).rows[0].c;
    assert.equal(cohort.groups.find((group) => group.section === 'vr' && group.mode === 'practice').students, 5);
    assert.equal(cohort.groups.find((group) => group.section === 'vr' && group.mode === 'timed').students, 5, 'archived timed results survive test resets');
    assert.equal(cohort.rows.filter((row) => row.mode === 'practice' && row.section === 'vr').reduce((sum, row) => sum + row.answers.reduce((n, answer) => n + answer.count, 0), 0), 5,
      'live and archived copies are not counted twice');
    assert.equal(cohort.groups.find((group) => group.section === 'dm').students, 5);
    assert.equal(cohort.rows.filter((row) => row.mode === 'assessment').length, 3);
    assert.ok(cohort.rows.filter((row) => row.mode === 'assessment').every((row) => row.answers.length === 1 && row.answers[0].count === 5));
    const result = buildPerformanceReport({ catalogue: { skills: [], questions: qs.map((id) => ({ id, mode: 'practice', section: 'vr', answer: 'A' })) }, attempts: [], cohort });
    assert.equal(result.overview.sections[0].cohort.cohortAccuracy, 100);
    assert.equal(result.overview.sections[0].cohort.basis, 'section');
    assert.ok(!JSON.stringify(result).includes('private-'), 'question snapshots never leave the server report');
    // The optimized rebuild must retain exactly the same cohort distributions
    // after snapshots move into the shared metadata table.
    await db.exec(`alter table coach_evidence add column source_key text default gen_random_uuid()::text,
      add column recorded_at timestamptz default now();`);
    for (const migration of [
      '20261020000005_compact_evidence.sql',
      '20261020000006_background_cohort.sql',
      '20261020135900_database_compaction_integrity.sql',
      '20261020141000_cohort_compact_sources.sql',
    ]) await db.exec(fs.readFileSync(`supabase/migrations/${migration}`, 'utf8'));
    while ((await db.query('select compact_evidence_batch(200) n')).rows[0].n) {}
    await db.exec('delete from performance_cohort_cache');
    const rebuilt = (await db.query('select refresh_performance_cohort() c')).rows[0].c;
    const canonical = (value) => Array.isArray(value) ? value.map(canonical).sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
      : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'computedAt').map(([key,v]) => [key,canonical(v)])) : value;
    assert.deepEqual(canonical(rebuilt), canonical(cohort), 'compact-source query preserves every cohort distribution');
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select * from performance_cohort_cache'), /permission denied/);
    await assert.rejects(db.query('select get_performance_cohort()'), /permission denied/);
  } finally { await db.close(); }
});
