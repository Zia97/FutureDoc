import { LABEL_SETS } from '../constants/sjLabelSets';

// ─────────────────────────────────────────────────────────────────────────────
// Builds the pre-aggregated analytics_summary JSONB that gets stored on the
// exam attempt row. One function per section because the "type breakdown"
// dimension differs (question type for DM, stimulus type for QR, mark
// breakdown for SJ, none for VR).
//
// Each builder receives the test object + the answers/metadata available at
// submission time and returns a plain object ready for JSONB insertion.
// ─────────────────────────────────────────────────────────────────────────────

function pacingFromTimings(timeMsByQid, correctQids, allQids) {
  let totalMs = 0, timedCount = 0;
  let correctMs = 0, correctCount = 0;
  let incorrectMs = 0, incorrectCount = 0;

  for (const qid of allQids) {
    const ms = timeMsByQid?.[qid];
    if (ms == null) continue;
    totalMs += ms;
    timedCount++;
    if (correctQids.has(qid)) {
      correctMs += ms;
      correctCount++;
    } else {
      incorrectMs += ms;
      incorrectCount++;
    }
  }

  if (timedCount === 0) return null;
  return {
    total_ms: totalMs,
    timed_count: timedCount,
    correct_ms: correctMs,
    correct_count: correctCount,
    incorrect_ms: incorrectMs,
    incorrect_count: incorrectCount,
  };
}

// ── VR ───────────────────────────────────────────────────────────────────────

export function buildVRAnalyticsSummary({ test, getAnswer, timeMsByQid }) {
  const totalQuestions = test.questionCount;
  let answered = 0;
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  const correctQids = new Set();
  const allQids = [];

  for (const passage of test.passages) {
    for (const q of passage.questions) {
      allQids.push(q.questionId);
      const selected = getAnswer(passage.id, q.questionId);
      if (selected) answered++;
      const isCorrect = !!selected && selected === q.answer;
      if (isCorrect) correctQids.add(q.questionId);

      if (q.difficulty === 'hard') {
        hardTotal++;
        if (isCorrect) hardCorrect++;
      } else {
        normalTotal++;
        if (isCorrect) normalCorrect++;
      }
    }
  }

  return {
    difficulty: {
      normal: { correct: normalCorrect, total: normalTotal },
      hard: { correct: hardCorrect, total: hardTotal },
    },
    pacing: pacingFromTimings(timeMsByQid, correctQids, allQids),
    completion: { answered, total: totalQuestions },
  };
}

// ── DM ───────────────────────────────────────────────────────────────────────

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

export function buildDMAnalyticsSummary({ test, answers, timeMsByQid }) {
  const totalQuestions = test.questionCount;
  let answered = 0;
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  const typeBreakdown = {};
  const correctQids = new Set();
  const allQids = [];

  for (const q of test.questions) {
    allQids.push(q.questionId);
    const selected = answers[q.questionId];
    if (selected != null && selected !== '') answered++;

    const isYesNo = YES_NO_TYPES.includes(q.type);
    let isCorrect = false;

    if (isYesNo) {
      if (selected && typeof selected === 'object' && q.statements?.length > 0) {
        isCorrect = q.statements.every((s, i) => selected[i] === s.answer);
      }
    } else {
      isCorrect = !!selected && selected === q.answer;
    }

    if (isCorrect) correctQids.add(q.questionId);

    const qtype = q.type ?? 'unknown';
    if (!typeBreakdown[qtype]) typeBreakdown[qtype] = { correct: 0, total: 0 };
    typeBreakdown[qtype].total++;
    if (isCorrect) typeBreakdown[qtype].correct++;

    if (q.difficulty === 'hard') {
      hardTotal++;
      if (isCorrect) hardCorrect++;
    } else {
      normalTotal++;
      if (isCorrect) normalCorrect++;
    }
  }

  return {
    difficulty: {
      normal: { correct: normalCorrect, total: normalTotal },
      hard: { correct: hardCorrect, total: hardTotal },
    },
    type_breakdown: typeBreakdown,
    pacing: pacingFromTimings(timeMsByQid, correctQids, allQids),
    completion: { answered, total: totalQuestions },
  };
}

// ── QR ───────────────────────────────────────────────────────────────────────

export function buildQRAnalyticsSummary({ test, answers, timeMsByQid }) {
  const totalQuestions = test.questionCount;
  let answered = 0;
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  const stimulusBreakdown = {};
  const correctQids = new Set();
  const allQids = [];

  for (const set of test.sets) {
    const stimulusType = set.stimulus?.type ?? 'unknown';

    for (const q of set.questions) {
      allQids.push(q.questionId);
      const selected = answers[q.questionId];
      if (selected) answered++;
      const isCorrect = !!selected && selected === q.answer;
      if (isCorrect) correctQids.add(q.questionId);

      if (!stimulusBreakdown[stimulusType]) stimulusBreakdown[stimulusType] = { correct: 0, total: 0 };
      stimulusBreakdown[stimulusType].total++;
      if (isCorrect) stimulusBreakdown[stimulusType].correct++;

      if (q.difficulty === 'hard') {
        hardTotal++;
        if (isCorrect) hardCorrect++;
      } else {
        normalTotal++;
        if (isCorrect) normalCorrect++;
      }
    }
  }

  return {
    difficulty: {
      normal: { correct: normalCorrect, total: normalTotal },
      hard: { correct: hardCorrect, total: hardTotal },
    },
    stimulus_breakdown: stimulusBreakdown,
    pacing: pacingFromTimings(timeMsByQid, correctQids, allQids),
    completion: { answered, total: totalQuestions },
  };
}

// ── SJ ───────────────────────────────────────────────────────────────────────

export function buildSJAnalyticsSummary({ test, getAnswer, timeMsByQid }) {
  const totalQuestions = test.questionCount;
  let answered = 0;
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  let fullMarks = 0, partialMarks = 0, zeroMarks = 0;
  const correctQids = new Set(); // "correct" = exact match (4 marks)
  const allQids = [];

  for (const scenario of test.scenarios) {
    for (const item of scenario.items) {
      allQids.push(item.itemId);
      const selected = getAnswer(scenario.scenarioId, item.itemId);
      if (selected) answered++;

      const labelSet = LABEL_SETS[item.labelSet] ?? LABEL_SETS[2];
      const si = selected ? labelSet.indexOf(selected) : -1;
      const ci = labelSet.indexOf(item.answer);
      const diff = si === -1 || ci === -1 ? 99 : Math.abs(si - ci);
      const marks = diff === 0 ? 4 : diff === 1 ? 2 : 0;

      if (marks === 4) { fullMarks++; correctQids.add(item.itemId); }
      else if (marks === 2) partialMarks++;
      else zeroMarks++;

      if (item.difficulty === 'hard') {
        hardTotal++;
        if (marks === 4) hardCorrect++;
      } else {
        normalTotal++;
        if (marks === 4) normalCorrect++;
      }
    }
  }

  return {
    difficulty: {
      normal: { correct: normalCorrect, total: normalTotal },
      hard: { correct: hardCorrect, total: hardTotal },
    },
    mark_breakdown: { full: fullMarks, partial: partialMarks, zero: zeroMarks },
    pacing: pacingFromTimings(timeMsByQid, correctQids, allQids),
    completion: { answered, total: totalQuestions },
  };
}
