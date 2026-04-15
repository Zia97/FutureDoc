import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { enqueue, flush, removePending } from '../../services/timedExamSyncQueue';
import { buildVRAnalyticsSummary } from '../../lib/buildAnalyticsSummary';
import { reportError } from '../../lib/reportError';

const COMPLETED_KEY = 'timed_vr_completed_attempts';
const SECTION = 'vr';

// VR test.id is the numeric SMALLINT from the DB (e.g. 1, 2, 3).
// AsyncStorage object keys are stringified, so the local cache is keyed
// by the string form. We mirror that on the DB hydrate path.

// Computes VR scores: 1 mark per correct answer.
function computeScores(passages, getAnswer) {
  const answers = [];
  let correctCount = 0;

  for (const passage of passages) {
    for (const q of passage.questions) {
      const selected = getAnswer(passage.id, q.questionId);
      if (selected && selected === q.answer) correctCount++;

      answers.push({
        questionId: q.questionId,
        passageId: passage.id,
        selectedAnswer: selected ?? '',
      });
    }
  }

  const scorePercent = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return { answers, correctCount, scorePercent };
}

export function useTimedVRExamProgress() {
  const { user } = useAuth();
  const [completedAttempts, setCompletedAttempts] = useState({});

  const loadAttempts = useCallback(async () => {
    // 1. Local cache first (instant, works offline).
    let local = {};
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (err) {
      reportError('useTimedVRExamProgress', err, { level: 'warning', extra: { note: 'local load failed' } });
    }
    setCompletedAttempts(local);

    // 2. Hydrate from cloud if signed in. DB is source of truth across devices,
    //    so we overwrite local entries with whatever the DB returns.
    if (!user) return;

    // Push any pending offline writes first so the hydrate sees them.
    await flush(user);

    try {
      const rows = await db.loadTimedVRAttempts();
      const merged = { ...local };
      for (const row of rows) {
        const answerMap = {};
        for (const a of row.answers) {
          if (!answerMap[a.passage_id]) answerMap[a.passage_id] = {};
          answerMap[a.passage_id][a.question_id] = a.selected_answer;
        }
        merged[row.test_id] = {
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
      reportError('useTimedVRExamProgress', err, { level: 'warning', extra: { note: 'cloud hydrate failed' } });
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  // Called when the exam ends (user ends it or timer expires).
  // Saves locally first, then writes to DB best-effort (non-blocking errors).
  // timeMsByQid is an optional { [questionId]: ms } map from the per-question
  // time tracker; null/missing entries are stored as NULL in the DB.
  async function submitExam({ test, getAnswer, secondsLeft, flags, timeMsByQid }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answers, correctCount, scorePercent } = computeScores(
      test.passages,
      getAnswer,
    );

    // Build answer map for review: { [passageId]: { [questionId]: selectedAnswer } }
    const answerMap = {};
    for (const passage of test.passages) {
      for (const q of passage.questions) {
        const ans = getAnswer(passage.id, q.questionId);
        if (ans) {
          if (!answerMap[passage.id]) answerMap[passage.id] = {};
          answerMap[passage.id][q.questionId] = ans;
        }
      }
    }

    const flagsArr = flags ? Array.from(flags) : [];

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
    } catch (err) {
      reportError('useTimedVRExamProgress', err, { level: 'warning', extra: { note: 'local save failed' } });
    }

    // ── 2. Sync to cloud (best effort — local already saved) ────────────────
    if (!user) return;

    // Only persist answered questions; the review screen treats absent
    // entries as unanswered the same way local cache does.
    // time_ms is included if the per-question tracker has a value for the
    // question — null/missing means "not tracked" (e.g. older clients).
    const dbAnswers = answers
      .filter((a) => a.selectedAnswer)
      .map((a) => ({
        question_id: a.questionId,
        passage_id: a.passageId,
        selected_answer: a.selectedAnswer,
        time_ms: timeMsByQid?.[a.questionId] ?? null,
      }));

    const analyticsSummary = buildVRAnalyticsSummary({ test, getAnswer, timeMsByQid });

    const payload = {
      userId: user.id,
      testId: test.id,
      scorePercent,
      correctCount,
      timeTakenSeconds,
      flags: flagsArr,
      answers: dbAnswers,
      analyticsSummary,
    };

    try {
      await db.submitTimedVRExam(payload);
      // Direct write succeeded — drop any earlier queued copy of the same op.
      await removePending({ userId: user.id, section: SECTION, testKey: test.id });
    } catch (err) {
      reportError('useTimedVRExamProgress', err, { level: 'error', extra: { note: 'cloud save failed, queueing' } });
      await enqueue({
        userId: user.id,
        section: SECTION,
        op: 'submit',
        testKey: test.id,
        testId: test.id,
        payload,
      });
    }
  }

  async function deleteAttempt(testId) {
    // Local first so the UI updates immediately, then mirror to cloud.
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      reportError('useTimedVRExamProgress', err, { level: 'warning', extra: { note: 'local delete failed' } });
    }

    if (!user) return;
    try {
      await db.deleteTimedVRAttempt(testId);
      await removePending({ userId: user.id, section: SECTION, testKey: testId });
    } catch (err) {
      reportError('useTimedVRExamProgress', err, { level: 'error', extra: { note: 'cloud delete failed, queueing' } });
      await enqueue({
        userId: user.id,
        section: SECTION,
        op: 'delete',
        testKey: testId,
        testId,
      });
    }
  }

  return { completedAttempts, submitExam, deleteAttempt, reload: loadAttempts };
}
