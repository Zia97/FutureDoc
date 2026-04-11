import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { enqueue, flush, removePending } from '../../services/timedExamSyncQueue';

const COMPLETED_KEY = 'timed_dm_completed_attempts';
const SECTION = 'dm';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

// DM has no parent grouping (no passage/scenario/set). The local answerMap
// is therefore flat: { [questionId]: answer } where answer is either a string
// (MCQ/Venn) or an object (Yes/No statements). DB column is JSONB to match.

// Score 1 per correct question.
function computeScores(questions, answers) {
  const answerList = [];
  let correctCount = 0;

  for (const q of questions) {
    const selected = answers[q.questionId];
    const isYesNo = YES_NO_TYPES.includes(q.type);
    let isCorrect = false;

    if (isYesNo) {
      if (selected && typeof selected === 'object' && q.statements?.length > 0) {
        isCorrect = q.statements.every((s, i) => selected[i] === s.answer);
      }
    } else {
      isCorrect = !!selected && selected === q.answer;
    }

    if (isCorrect) correctCount++;

    answerList.push({
      questionId: q.questionId,
      selectedAnswer: selected,
      isCorrect,
    });
  }

  const total = questions.length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { answerList, correctCount, scorePercent };
}

export function useTimedDMExamProgress() {
  const { user } = useAuth();
  const [completedAttempts, setCompletedAttempts] = useState({});

  const loadAttempts = useCallback(async () => {
    let local = {};
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (err) {
      if (__DEV__) console.error('[useTimedDMExamProgress] local load failed:', err);
    }
    setCompletedAttempts(local);

    if (!user) return;

    // Push any pending offline writes first so the hydrate sees them.
    await flush(user);

    try {
      const rows = await db.loadTimedDMAttempts();
      const merged = { ...local };
      for (const row of rows) {
        // DM answerMap is flat: { [questionId]: selected_answer }
        const answerMap = {};
        for (const a of row.answers) {
          answerMap[a.question_id] = a.selected_answer;
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
      if (__DEV__) console.error('[useTimedDMExamProgress] cloud hydrate failed:', err);
    }
  }, [user]);

  useEffect(() => {
    loadAttempts();
  }, [loadAttempts]);

  async function submitExam({ test, answers, secondsLeft, flags }) {
    const timeTakenSeconds = test.timeMinutes * 60 - (secondsLeft ?? 0);
    const { answerList, correctCount, scorePercent } = computeScores(test.questions, answers);
    const flagsArr = flags ? Array.from(flags) : [];

    const attemptData = {
      scorePercent,
      correctCount,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      answerMap: answers,
      flags: flagsArr,
    };

    // ── 1. Save to local storage (fast, device-first) ───────────────────────
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      current[test.id] = attemptData;
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts(current);
    } catch (err) {
      if (__DEV__) console.error('[useTimedDMExamProgress] local save failed:', err);
    }

    // ── 2. Sync to cloud (best effort) ──────────────────────────────────────
    if (!user) return;

    const dbAnswers = answerList
      .filter((a) => a.selectedAnswer != null && a.selectedAnswer !== '')
      .map((a) => ({
        question_id: a.questionId,
        // selected_answer is JSONB on the DB; supabase-js handles
        // both strings and objects through the JSON column transparently.
        selected_answer: a.selectedAnswer,
      }));

    const payload = {
      userId: user.id,
      testId: test.id,
      scorePercent,
      correctCount,
      timeTakenSeconds,
      flags: flagsArr,
      answers: dbAnswers,
    };

    try {
      await db.submitTimedDMExam(payload);
      await removePending({ userId: user.id, section: SECTION, testKey: test.id });
    } catch (err) {
      if (__DEV__) console.error('[useTimedDMExamProgress] cloud save failed, queueing:', err);
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
    try {
      const raw = await AsyncStorage.getItem(COMPLETED_KEY);
      const current = raw ? JSON.parse(raw) : {};
      delete current[testId];
      await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(current));
      setCompletedAttempts({ ...current });
    } catch (err) {
      if (__DEV__) console.error('[useTimedDMExamProgress] local delete failed:', err);
    }

    if (!user) return;
    try {
      await db.deleteTimedDMAttempt(testId);
      await removePending({ userId: user.id, section: SECTION, testKey: testId });
    } catch (err) {
      if (__DEV__) console.error('[useTimedDMExamProgress] cloud delete failed, queueing:', err);
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
