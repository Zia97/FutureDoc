import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCoachProfile, buildSessionReport, initialProgress, localSessionResult, normaliseEvidence, practiceEstimate, publicSession, selectGroups, sessionEvidence, validateProgress, validExamDate, SECTION_SECONDS } from '../src/lib/coaching/engine.js';
import { tickProgress, pauseProgress, advanceSection } from '../src/lib/coaching/sessionState.js';

const sections = ['vr', 'dm', 'qr', 'sj'];
const batches = sections.map((s) => JSON.parse(fs.readFileSync(`src/data/performance/${s}-tags.json`, 'utf8')));
const catalogue = { skills: batches.flatMap((b) => b.skills.map((s) => ({ ...s, section: b.section }))), questions: batches.flatMap((b) => b.questions.map((q) => ({ ...q, section: b.section }))) };
function fixture() {
  const tags = sections.flatMap((section) => selectGroups({ catalogue, section, assessment: true }));
  return { id: 's1', kind: 'assessment', time_multiplier: 1, progress: initialProgress(), status: 'active', budgets: SECTION_SECONDS,
    questions: tags.map((q) => ({ id: q.id, section: q.section, parentId: q.parentId, tag: q, choices: (q.options ?? []).map((o) => ({ value: typeof o === 'string' ? o : o.label })), explanation: 'PRIVATE KEY' })) };
}
test('all three frozen forms cover 48 eligible questions in complete, distinct parent groups', () => {
  const manifest = JSON.parse(fs.readFileSync('supabase/functions/ai-coach/forms.json', 'utf8'));
  const used = new Set();
  for (const form of manifest.forms) {
    assert.equal(form.questions.length, 48);
    for (const section of sections) assert.equal(form.questions.filter((q) => q.section === section).length, 12);
    const selected = form.questions.map((q) => {
      const tag = catalogue.questions.find((t) => t.id === q.id && t.section === q.section && t.mode === 'practice');
      assert.equal(tag.contentHash, q.contentHash); assert.ok(!tag.excludedReason); assert.notEqual(tag.confidence, 'low');
      assert.ok(!used.has(q.id)); used.add(q.id); return tag;
    });
    for (const q of selected) assert.deepEqual(selected.filter((t) => t.parentId === q.parentId).map((t) => t.id).sort(), catalogue.questions.filter((t) => t.parentId === q.parentId && t.mode === 'practice').map((t) => t.id).sort());
    assert.ok(new Set(selected.filter((q) => q.section === 'dm').map((q) => q.format)).size >= 3);
    assert.equal(new Set(selected.filter((q) => q.section === 'sj').map((q) => q.format)).size, 2);
  }
});
test('selection avoids repeats, preserves parents, targets skills and explicitly handles exhausted pools', () => {
  const first = selectGroups({ catalogue, section: 'vr' });
  const evidence = first.map((q) => ({ ...q, questionId: q.id, earned: 0, possible: 1 }));
  const fresh = selectGroups({ catalogue, section: 'vr', evidence });
  assert.ok(fresh.every((q) => !first.some((a) => a.id === q.id)));
  const review = selectGroups({ catalogue, section: 'vr', evidence, review: true });
  assert.equal(review[0].parentId, first[0].parentId);
  assert.throws(() => selectGroups({ catalogue, section: 'vr', skillId: 'fake' }), /exhausted/);
});
test('timers pause, cap elapsed time, move sections, retain flags and never charge background time', () => {
  let s = fixture(); s.progress.phase = 'running';
  s.progress = tickProgress(s, 12500); assert.equal(s.progress.elapsed.vr, 12500);
  s.progress = pauseProgress(s.progress); const p = tickProgress(s, 9999999); assert.equal(p.elapsed.vr, 12500); assert.equal(p.interrupted, true);
  s.progress = { ...p, phase: 'running' }; s.progress = tickProgress(s, 9999999);
  assert.equal(s.progress.elapsed.vr, 360000); assert.equal(s.progress.phase, 'instructions'); assert.equal(s.progress.sectionIndex, 1);
  assert.deepEqual(s.progress.closedSections, ['vr']); assert.equal(s.questions[s.progress.index].section, 'dm');
});
test('progress validation rejects changed closed answers, time rollback, foreign answers and premature completion', () => {
  const s = fixture(), p = initialProgress(); p.phase = 'running'; p.elapsed.vr = 1000;
  p.times[s.questions[0].id] = 1000; p.answers[s.questions[0].id] = s.questions[0].choices[0].value;
  const valid = validateProgress(s, p); assert.equal(valid.elapsed.vr, 1000);
  s.progress = valid;
  assert.throws(() => validateProgress(s, { ...valid, elapsed: { vr: 1 } }), /invalid_time/);
  assert.throws(() => validateProgress(s, { ...valid, answers: { [s.questions[0].id]: 'forged' } }), /invalid_answer/);
  assert.throws(() => validateProgress(s, { ...valid, phase: 'finished', closedSections: ['vr'] }), /incomplete/);
  const next = advanceSection(s, valid); s.progress = validateProgress(s, next);
  const changed = structuredClone(s.progress); changed.answers[s.questions[0].id] = null;
  assert.throws(() => validateProgress(s, changed), /section_closed/);
});
test('offline progression can save several completed sections atomically', () => {
  const s = fixture(); let p = initialProgress();
  for (let i = 0; i < 4; i++) p = advanceSection(s, p);
  assert.equal(validateProgress(s, p).phase, 'finished');
});
test('question UI withholds answers until completion while device scoring preserves DM and SJ partial credit', () => {
  const s = fixture(); const downloadable = publicSession(s), hidden = JSON.stringify(downloadable.questions);
  assert.ok(!hidden.includes('PRIVATE KEY')); assert.ok(!hidden.includes('statementAnswers')); assert.ok(!JSON.stringify(downloadable).includes('contentHash'));
  assert.equal(downloadable.offlineScoring[s.questions[0].id].explanation, 'PRIVATE KEY');
  const dm = s.questions.find((q) => q.tag.statementAnswers?.length === 5);
  assert.ok(dm);
  s.progress.answers[dm.id] = Object.fromEntries(dm.tag.statementAnswers.map((a, i) => [i, i ? a : a === 'Yes' ? 'No' : 'Yes']));
  const sj = s.questions.find((q) => q.section === 'sj'); const choices = sj.tag.options, index = choices.indexOf(sj.tag.answer);
  s.progress.answers[sj.id] = choices[index === 3 ? 2 : index + 1];
  const evidence = sessionEvidence(s); assert.equal(evidence.find((e) => e.questionId === dm.id).earned, 1); assert.equal(evidence.find((e) => e.questionId === sj.id).earned, 0.5);
  s.status = 'completed'; assert.ok(JSON.stringify(publicSession(s)).includes('PRIVATE KEY'));
});
test('estimates are bounded, monotonic and identical for paid/free and paused conditions', () => {
  let previous = 0;
  for (let n = 0; n <= 12; n++) {
    const r = practiceEstimate(sections.map((section) => ({ section, possible: 12, questions: 12, earned: n })));
    assert.ok(r.value >= previous && r.low >= 900 && r.high <= 2700 && r.low <= r.value && r.high >= r.value);
    previous = r.value;
  }
  const s = fixture(), baseline = buildSessionReport(s); s.progress.interrupted = true;
  assert.deepEqual(buildSessionReport(s).estimate, baseline.estimate);
  assert.equal(practiceEstimate([{ section: 'vr', questions: 12, earned: 6, possible: 12 }]), null);
});

test('device completion produces exactly the server report, grades and explanations without a request', () => {
  const raw = fixture();
  raw.progress = { ...initialProgress(), phase: 'finished', sectionIndex: 3, index: raw.questions.findIndex((q) => q.section === 'sj'), closedSections: sections };
  for (const [index, q] of raw.questions.entries()) {
    raw.progress.answers[q.id] = index % 3 ? q.tag.statementAnswers
      ? Object.fromEntries(q.tag.statementAnswers.map((answer, i) => [i, i === 0 ? answer === 'Yes' ? 'No' : 'Yes' : answer]))
      : q.tag.answer : null;
  }
  const download = publicSession(raw);
  const result = localSessionResult(download, Date.parse('2026-10-20T12:00:00Z'));
  raw.status = 'completed'; raw.completed_at = result.completedAt; raw.report = buildSessionReport(raw);
  const server = publicSession(raw);
  assert.deepEqual(result.report, server.report);
  assert.deepEqual(result.questions, server.questions);
  assert.equal(result.status, 'active', 'Completion remains queued until the cloud acknowledges it');
  assert.equal(localSessionResult({ ...download, progress: initialProgress() }).report, undefined, 'No results before finishing');
});
test('first encounters determine evidence; repeat drills do not inflate strengths or exam estimates', () => {
  const q = catalogue.questions.find((q) => q.section === 'vr' && !q.excludedReason && q.mode === 'practice');
  const rows = Array.from({ length: 40 }, (_, i) => ({ id: String(i), questionId: q.id, section: 'vr', mode: i ? 'coach' : 'practice', tag: q, answeredAt: `2026-10-${String(1 + Math.floor(i / 4)).padStart(2, '0')}T12:00:00Z`, selectedAnswer: i ? q.answer : null, timeMs: 10000 }));
  const p = buildCoachProfile({ catalogue, rawEvidence: rows, now: Date.parse('2026-10-17') });
  assert.equal(p.freshQuestions, 1); assert.equal(p.strengths.length, 0); assert.equal(p.sections[0].earned, 0);
  assert.ok(p.strengths.length <= 6 && p.weaknesses.length <= 6); assert.ok(!('estimate' in p));
});
test('statement telemetry is reconstructed without multiplying question time', () => {
  const q = catalogue.questions.find((q) => q.mode === 'practice' && !q.excludedReason && q.statementAnswers?.length === 5);
  const rows = q.statementAnswers.map((selectedAnswer, statementIndex) => ({ id: String(statementIndex), questionId: q.id, section: 'dm', mode: 'practice', tag: q, selectedAnswer, statementIndex, timeMs: 40000, answeredAt: '2026-10-10T12:00:00Z' }));
  const r = normaliseEvidence(rows, catalogue); assert.equal(r.length, 1); assert.equal(r[0].earned, 2); assert.equal(r[0].timeMs, 40000);
  assert.equal(normaliseEvidence(rows.slice(0, 4), catalogue).length, 0);
});
test('exam dates reject calendar overflow, text and invalid years', () => {
  assert.ok(validExamDate(null)); assert.ok(validExamDate('2028-02-29'));
  for (const date of ['2026-02-29', '2026-13-01', 'tomorrow', '', '1-1-1']) assert.equal(validExamDate(date), false);
});
