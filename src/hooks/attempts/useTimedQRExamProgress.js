import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { enqueue, flush, removePending } from '../../services/timedExamSyncQueue';
import { buildQRAnalyticsSummary } from '../../lib/buildAnalyticsSummary';
import { reportError } from '../../lib/reportError';
import { recordActivity } from '../../services/streakService';
import { setLastActivity } from '../../services/lastActivityService';

const COMPLETED_KEY = 'timed_qr_completed_attempts';
const SECTION = 'qr';

// QR test.id is the string "timed-qr-test-N" produced by useTimedQRTests.
// The DB stores test_id as a SMALLINT, so we convert in both directions.
function numericTestIdFromKey(key) {
  // Strips non-digits and any leading zeros: "timed-qr-test-001" → 1
  return Number(String(key).replace(/\D+/g, '').replace(/^0+/, '') || '0');
}
function keyFromNumericTestId(id) {
  return `timed-qr-test-${id}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Earlier versions of useTimedQRTests stored s.set_ref (e.g. "qr1-set-01")
// as the client setId, so cached completed attempts created before the fix
// have answerMaps keyed by those refs instead of by the set UUID. After the
// fix, the test object's setIds are UUIDs and the review screen lookup
// `answerMap[set.setId]` returns nothing — review shows everything as
// unanswered. Drop those legacy attempts so the user gets a clean
// "not taken yet" state and can re-take the test cleanly.
function pruneLegacyAttempts(attempts) {
  if (!attempts || typeof attempts !== 'object') return { pruned: attempts, droppedCount: 0 };
  let droppedCount = 0;
  const pruned = {};
  for (const [key, attempt] of Object.entries(attempts)) {
    const map = attempt?.answerMap;
    const setKeys = map ? Object.keys(map) : [];
    const allUuid = setKeys.every((k) => UUID_RE.test(k));
    if (setKeys.length === 0 || allUuid) {
      pruned[key] = attempt;
    } else {
      droppedCount++;
    }
  }
  return { pruned, droppedCount };
}

// Score 1 mark per correct answer (matched by option label).
function computeScores(sets, answers) {
  const answerList = [];
  let correctCount = 0;

  for (const set of sets) {
    for (const q of set.questions) {
      const selected = answers[q.questionId];
      const isCorrect = !!selected && selected === q.answer;
      if (isCorrect) correctCount++;

      answerList.push({
        questionId: q.questionId,
        setId: set.setId,
        selectedAnswer: selected ?? '',
      });
    }
  }

  const total = answerList.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { answerList, correctCount, scorePercent };
}

export function useTimedQRExamProgress() {
  const { user } = useAuth();
  const [completedAttempts, setCompletedAttempts] = useState({});

  const loadAttempts = useCallback(async () => {
    let local = {};
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (err) {
      reportError('useTimedQRExamProgress', err, { level: 'warning', extra: { note: 'local load failed' } });
    }

    // One-time cleanup: drop any legacy attempts whose answerMap is keyed
    // by set_ref strings instead of UUIDs (see pruneLegacyAttempts comment).
    // Persists the pruned cache so the next launch is clean.
    const { pruned, droppedCount } = pruneLegacyAttempts(local);
    if (droppedCount > 0) {
      if (__DEV__) {
        console.warn(
          '[useTimedQRExamProgress] pruned',
          droppedCount,
          'legacy QR attempt(s) with non-UUID setIds — user must retake those tests',
        );
      }
      local = pruned;
      try {
        await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(local));
      } catch (err) {
        reportError('useTimedQRExamProgress', err, { level: 'warning', extra: { note: 'local prune save failed' } });
      }
    }

    setCompletedAttempts(local);

    if (!user) return;

    // Push any pending offline writes first so the hydrate sees them.
    await flush(user);

    try {
      const rows = await db.loadTimedQRAttempts();
      const merged = { ...local };
      for (const row of rows) {
        const answerMap = {};
        for (const a of row.answers) {
          if (!answerMap[a.set_id]) answerMap[a.set_id] = {};
          answerMap[a.set_id][a.question_id] = a.selected_answer;
        }
        merged[keyFromNumericTestId(row.test_id)] = {
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
      reportError('useTimedQRExamProgress', err, { level: 'warning', extra: { note: 'cloud hydrate failed' } });
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Called when the exam ends (user ends it or timer expires).
  // timeMsByQid is an optional { [questionId]: ms } map from the per-question
  // time tracker; null/missing entries are stored as NULL in the DB.
  async function submitExam({ test, answers, secondsLeft, flags, timeMsByQid }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answerList, correctCount, scorePercent } = computeScores(test.sets, answers);
    const flagsArr = flags ? Array.from(flags) : [];

    // Build answer map for review: { [setId]: { [questionId]: selectedAnswer } }
    const answerMap = {};
    for (const set of test.sets) {
      for (const q of set.questions) {
        const ans = answers[q.questionId];
        if (ans) {
          if (!answerMap[set.setId]) answerMap[set.setId] = {};
          answerMap[set.setId][q.questionId] = ans;
        }
      }
    }

    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap,
      flags: flagsArr,
    };

    // ── 1. Save to local storage (fast, device-first) ──────────────────────
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
      recordActivity();
      setLastActivity({ kind: 'timedList', section: 'QR' });
    } catch (err) {
      reportError('useTimedQRExamProgress', err, { level: 'warning', extra: { note: 'local save failed' } });
    }

    // ── 2. Sync to cloud (best effort) ─────────────────────────────────────
    if (!user) return;

    // Only persist answered questions; the review screen treats absent
    // entries as unanswered the same way local cache does.
    // time_ms is included if the per-question tracker has a value for the
    // question — null/missing means "not tracked" (e.g. older clients).
    const dbAnswers = answerList
      .filter((a) => a.selectedAnswer)
      .map((a) => ({
        question_id: a.questionId,
        set_id: a.setId,
        selected_answer: a.selectedAnswer,
        time_ms: timeMsByQid?.[a.questionId] ?? null,
      }));

    const analyticsSummary = buildQRAnalyticsSummary({ test, answers, timeMsByQid });

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
      await db.submitTimedQRExam(payload);
      await removePending({ userId: user.id, section: SECTION, testKey: test.id });
    } catch (err) {
      reportError('useTimedQRExamProgress', err, { level: 'error', extra: { note: 'cloud save failed, queueing' } });
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

  async function deleteAttempt(testId) {
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      reportError('useTimedQRExamProgress', err, { level: 'warning', extra: { note: 'local delete failed' } });
    }

    if (!user) return;
    const numericId = numericTestIdFromKey(testId);
    try {
      await db.deleteTimedQRAttempt(numericId);
      await removePending({ userId: user.id, section: SECTION, testKey: testId });
    } catch (err) {
      reportError('useTimedQRExamProgress', err, { level: 'error', extra: { note: 'cloud delete failed, queueing' } });
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
