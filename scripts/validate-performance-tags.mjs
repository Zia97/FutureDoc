import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export function questionContentHash(unit, question) {
  const parent = unit.payload ?? unit;
  const context = Object.fromEntries(['title', 'body', 'resource', 'stem', 'stimulus', 'stimulus_diagram', 'table_data', 'format', 'label_set'].filter((key) => parent[key] !== undefined).map((key) => [key, parent[key]]));
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).filter((k) => !['created_at', 'updated_at'].includes(k)).sort().map((k) => [k, canonical(value[k])]));
    return value;
  }
  return createHash('sha256').update(JSON.stringify(canonical({ question, context }))).digest('hex');
}

export function validatePerformanceTags({ corpusDirectory = null } = {}) {
  const sections = ['vr', 'dm', 'qr', 'sj'];
  const batches = sections.map((section) => JSON.parse(fs.readFileSync(`src/data/performance/${section}-tags.json`, 'utf8')));
  const summary = [];
  for (const batch of batches) {
    assert.equal(batch.version, 1);
    const ids = new Set(), skillIds = new Set(batch.skills.map((s) => s.id));
    assert.equal(skillIds.size, batch.skills.length, 'Duplicate skill');
    const lessonName = { vr: 'VerbalReasoning', dm: 'DecisionMaking', qr: 'QuantitativeReasoning', sj: 'SituationalJudgement' }[batch.section];
    const lessons = fs.readFileSync(`src/screens/learn/${lessonName}LearnScreen.js`, 'utf8');
    for (const skill of batch.skills) {
      assert.ok(skill.id.startsWith(`${batch.section}.`));
      for (const key of ['label', 'description', 'tip', 'lessonRoute', 'lessonId']) assert.ok(skill[key], `Missing ${key}: ${skill.id}`);
      assert.equal(skill.lessonRoute, `Learn${batch.section.toUpperCase()}Lesson`);
      assert.ok(lessons.includes(`'${skill.lessonId}'`) || lessons.includes(`"${skill.lessonId}"`), `Unknown lesson ${skill.lessonId}`);
    }
    for (const question of batch.questions) {
      const key = `${question.mode}:${question.id}`;
      assert.ok(!ids.has(key), `Duplicate ${key}`); ids.add(key);
      assert.match(question.id, /^[0-9a-f-]{36}$/i);
      assert.ok(['practice', 'timed'].includes(question.mode));
      assert.ok(['high', 'medium', 'low'].includes(question.confidence));
      assert.ok(['normal', 'hard'].includes(question.difficulty));
      assert.ok(skillIds.has(question.primarySkillId), `Unknown primary skill ${key}`);
      assert.ok(Array.isArray(question.secondarySkillIds) && question.secondarySkillIds.length <= 2);
      for (const id of question.secondarySkillIds) assert.ok(skillIds.has(id) && id !== question.primarySkillId);
      assert.ok(question.parentId && question.rationale);
      assert.match(question.contentHash ?? '', /^[0-9a-f]{64}$/, `Missing content fingerprint: ${key}`);
      assert.ok(!JSON.stringify(question).includes('\ufffd'), `Encoding artifact: ${key}`);
      if (batch.section === 'sj' && !question.excludedReason) {
        assert.ok(question.options.includes(question.answer), `Unanswerable SJ scale ${key}`);
      }
      if (question.statementAnswers) assert.ok(question.statementAnswers.every((a) => ['Yes', 'No'].includes(a)));
    }
    if (corpusDirectory) {
      const corpus = JSON.parse(fs.readFileSync(path.join(corpusDirectory, `${batch.section}-corpus.json`), 'utf8'));
      const expected = new Map();
      for (const unit of corpus.units ?? corpus.passages) {
        const parent = unit.payload ?? unit;
        const children = batch.section === 'vr' ? unit.questions : batch.section === 'dm' ? [parent] : parent.questions ?? parent.items;
        assert.ok(Array.isArray(children), `Missing source questions ${unit.id}`);
        for (const q of children) expected.set(`${unit.mode}:${q.id}`, { q, parentId: unit.id, contentHash: questionContentHash(unit, q) });
      }
      assert.equal(ids.size, expected.size, `${batch.section}: incomplete bank`);
      for (const question of batch.questions) {
        const source = expected.get(`${question.mode}:${question.id}`);
        assert.ok(source, `Question not in snapshot ${question.id}`);
        assert.equal(question.parentId, source.parentId);
        assert.equal(question.answer ?? null, source.q.correct_answer ?? null);
        if (batch.section === 'dm') {
          const statements = source.q.decision_making_question_statements ?? source.q.timed_decision_making_question_statements ?? [];
          const answers = [...statements].sort((a, b) => a.order_index - b.order_index).map((s) => s.correct_answer);
          assert.deepEqual(question.statementAnswers ?? [], answers, `DM statement key/order mismatch: ${question.id}`);
        }
        assert.equal(question.contentHash, source.contentHash, `Source content changed; re-review ${question.id}`);
      }
    }
    summary.push({ section: batch.section, skills: batch.skills.length, questions: ids.size,
      practice: batch.questions.filter((q) => q.mode === 'practice').length,
      timed: batch.questions.filter((q) => q.mode === 'timed').length,
      excluded: batch.questions.filter((q) => q.excludedReason).length });
  }
  return { batches, summary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--corpus-dir');
  const { summary } = validatePerformanceTags({ corpusDirectory: index >= 0 ? process.argv[index + 1] : null });
  console.log(JSON.stringify(summary, null, 2));
}
