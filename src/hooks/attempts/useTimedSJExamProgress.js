import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { enqueue, flush, removePending } from '../../services/timedExamSyncQueue';
import { buildSJAnalyticsSummary } from '../../lib/buildAnalyticsSummary';
import { LABEL_SETS } from '../../constants/sjLabelSets';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';

// Local storage key — stores completed exam results keyed by test.id string
const COMPLETED_KEY = 'timed_sj_completed_attempts';
const SECTION = 'sj';

// SJ test.id is the string "timed-sj-test-N" produced by useTimedSJTests.
// The DB stores test_id as a SMALLINT, so we convert in both directions.
function numericTestIdFromKey(key) {
  return Number(String(key).split('-').pop());
}
function keyFromNumericTestId(id) {
  return `timed-sj-test-${id}`;
}

// Computes UCAT SJ marks and builds the answers array for DB insertion.
// Mark scheme: 4 marks (exact), 2 marks (1 position off), 0 marks (2+ off or unanswered)
function computeScores(scenarios, getAnswer) {
  const answers = [];
  let totalMarks = 0;
  let correctCount = 0;

  for (const scenario of scenarios) {
    for (const item of scenario.items) {
      const selected = getAnswer(scenario.scenarioId, item.itemId);
      const labelSet = LABEL_SETS[item.type === 'importance' ? 1 : 2];
      const si = selected ? labelSet.indexOf(selected) : -1;
      const ci = labelSet.indexOf(item.answer);
      const diff = si === -1 || ci === -1 ? 99 : Math.abs(si - ci);
      const marks = diff === 0 ? 4 : diff === 1 ? 2 : 0;

      totalMarks += marks;
      if (diff === 0) correctCount++;

      answers.push({
        questionId: item.itemId,
        scenarioId: scenario.scenarioId,
        selectedAnswer: selected ?? '',
      });
    }
  }

  const maxMarks = answers.length * 4;
  const scorePercent = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  return { answers, correctCount, scorePercent };
}

// Returns true if a cached attempt's answerMap holds at least one answer.
// Handles the nested SJ shape ({ [scenarioId]: { [itemId]: ans } }).
function answerMapHasAny(map) {
  if (!map || typeof map !== 'object') return false;
  for (const v of Object.values(map)) {
    if (v && typeof v === 'object') {
      if (Object.keys(v).length > 0) return true;
    } else if (v != null && v !== '') {
      return true;
    }
  }
  return false;
}

export function useTimedSJExamProgress() {
  const { user } = useAuth();
  // { [testId]: { scorePercent, correctCount, submittedAt, timeTakenSeconds, answerMap, flags } }
  const [completedAttempts, setCompletedAttempts] = useState({});

  const loadAttempts = useCallback(async () => {
    let local = {};
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'warning', extra: { note: 'local load failed' } });
    }
    setCompletedAttempts(local);

    if (!user) return;

    // Push any pending offline writes first so the hydrate sees them.
    await flush(user);

    try {
      const rows = await db.loadTimedSJAttempts();
      const merged = { ...local };
      for (const row of rows) {
        const answerMap = {};
        for (const a of row.answers) {
          if (!answerMap[a.scenario_id]) answerMap[a.scenario_id] = {};
          answerMap[a.scenario_id][a.question_id] = a.selected_answer;
        }
        // Never let an answer-less DB row (e.g. a partial/interrupted write)
        // clobber a local attempt that still holds the real answers.
        const sjKey = keyFromNumericTestId(row.test_id);
        if (row.answers.length === 0 && answerMapHasAny(merged[sjKey]?.answerMap)) {
          continue;
        }
        merged[sjKey] = {
          scorePercent: row.score_percent,
          correctCount: row.correct_count,
          submittedAt: row.submitted_at,
          timeTakenSeconds: row.time_taken_seconds,
          answerMap,
          flags: row.flags ?? [],
        };
      }
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(merged));
      setCompletedAttempts(merged);
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'warning', extra: { note: 'cloud hydrate failed' } });
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Called when the exam ends (user ends it or timer expires).
  async function submitExam({ test, getAnswer, secondsLeft, flags, timeMsByQid }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answers, correctCount, scorePercent } = computeScores(
      test.scenarios,
      getAnswer,
    );
    const flagsArr = flags ? Array.from(flags) : [];

    // Build answer map for review: { [scenarioId]: { [itemId]: selectedAnswer } }
    const answerMap = {};
    for (const scenario of test.scenarios) {
      for (const item of scenario.items) {
        const ans = getAnswer(scenario.scenarioId, item.itemId);
        if (ans) {
          if (!answerMap[scenario.scenarioId]) answerMap[scenario.scenarioId] = {};
          answerMap[scenario.scenarioId][item.itemId] = ans;
        }
      }
    }

    // ── 1. Save to local storage (fast, device-first) ───────────────────────
    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap,
      flags: flagsArr,
    };
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
      recordActivity();
      setLastActivity({ kind: 'timedList', section: 'SJ' });
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'warning', extra: { note: 'local save failed' } });
    }

    // ── 2. Sync to cloud (best effort) ──────────────────────────────────────
    if (!user) return;

    const dbAnswers = answers
      .filter((a) => a.selectedAnswer)
      .map((a) => ({
        question_id: a.questionId,
        scenario_id: a.scenarioId,
        selected_answer: a.selectedAnswer,
        time_ms: timeMsByQid?.[a.questionId] ?? null,
      }));

    const analyticsSummary = buildSJAnalyticsSummary({ test, getAnswer, timeMsByQid });

    const numericId = numericTestIdFromKey(test.id);
    const payload = {
      userId: user.id,
      testId: numericId,
      scorePercent,
      correctCount,
      timeTakenSeconds,
      flags: flagsArr,
      answers: dbAnswers,
      analyticsSummary,
    };

    try {
      await db.submitTimedSJExam(payload);
      await removePending({ userId: user.id, section: SECTION, testKey: test.id });
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'error', extra: { note: 'cloud save failed, queueing' } });
      await enqueue({
        userId: user.id,
        section: SECTION,
        op: 'submit',
        testKey: test.id,
        testId: numericId,
        payload,
      });
    }
  }

  // Removes a completed attempt from local storage and cloud.
  async function deleteAttempt(testId) {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'warning', extra: { note: 'local delete failed' } });
    }

    if (!user) return;
    const numericId = numericTestIdFromKey(testId);
    try {
      await db.deleteTimedSJAttempt(numericId);
      await removePending({ userId: user.id, section: SECTION, testKey: testId });
    } catch (err) {
      reportError('useTimedSJExamProgress', err, { level: 'error', extra: { note: 'cloud delete failed, queueing' } });
      await enqueue({
        userId: user.id,
        section: SECTION,
        op: 'delete',
        testKey: testId,
        testId: numericId,
      });
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadAttempts };
}
