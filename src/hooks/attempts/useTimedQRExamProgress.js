import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { enqueue, flush, removePending } from '../../services/timedExamSyncQueue';

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
      if (__DEV__) console.error('[useTimedQRExamProgress] local load failed:', err);
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
      if (__DEV__) console.error('[useTimedQRExamProgress] cloud hydrate failed:', err);
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Called when the exam ends (user ends it or timer expires).
  async function submitExam({ test, answers, secondsLeft, flags }) {
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
    } catch (err) {
      if (__DEV__) console.error('[useTimedQRExamProgress] local save failed:', err);
    }

    // ── 2. Sync to cloud (best effort) ─────────────────────────────────────
    if (!user) return;

    const dbAnswers = answerList
      .filter((a) => a.selectedAnswer)
      .map((a) => ({
        question_id: a.questionId,
        set_id: a.setId,
        selected_answer: a.selectedAnswer,
      }));

    const numericId = numericTestIdFromKey(test.id);
    const payload = {
      userId: user.id,
      testId: numericId,
      scorePercent,
      correctCount,
      timeTakenSeconds,
      flags: flagsArr,
      answers: dbAnswers,
    };

    try {
      await db.submitTimedQRExam(payload);
      await removePending({ userId: user.id, section: SECTION, testKey: test.id });
    } catch (err) {
      if (__DEV__) console.error('[useTimedQRExamProgress] cloud save failed, queueing:', err);
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
      if (__DEV__) console.error('[useTimedQRExamProgress] local delete failed:', err);
    }

    if (!user) return;
    const numericId = numericTestIdFromKey(testId);
    try {
      await db.deleteTimedQRAttempt(numericId);
      await removePending({ userId: user.id, section: SECTION, testKey: testId });
    } catch (err) {
      if (__DEV__) console.error('[useTimedQRExamProgress] cloud delete failed, queueing:', err);
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
