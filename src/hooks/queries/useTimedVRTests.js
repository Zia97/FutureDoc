import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenTimedVRPassages } from '../../lib/flattenQuestions';
import { reportError } from '../../lib/reportError';

const SECTION = 'timed_verbal_reasoning';

function mapTestsFromNested(rows) {
  return rows.map((test) => {
    const passages = [...(test.timed_verbal_reasoning_passages ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((p) => {
        const questions = [...(p.timed_verbal_reasoning_questions ?? [])]
          .sort((a, b) => a.order_index - b.order_index)
          .map((q) => ({
            questionId: q.id,
            questionText: q.question_text,
            options: q.options,
            answer: q.correct_answer,
            answeringReason: q.answer_reason,
            difficulty: q.difficulty ?? 'normal',
          }));
        return { id: p.id, title: p.title, resource: p.body, questions };
      });
    return {
      id: test.id,
      title: test.title,
      isFree: test.is_free ?? false,
      passageCount: passages.length,
      questionCount: passages.reduce((n, p) => n + p.questions.length, 0),
      timeMinutes: test.time_minutes ?? 22,
      passages,
      flatQuestions: flattenTimedVRPassages(passages),
    };
  });
}

function mapTests(data) {
  return data.map((test) => {
    const rawPassages = test.timed_verbal_reasoning_passages ?? test.passages ?? [];
    const passages = rawPassages.map((p) => ({
      id: p.id,
      title: p.title,
      resource: p.body ?? p.resource,
      questions: [...(p.timed_verbal_reasoning_questions ?? p.verbal_reasoning_questions ?? p.questions ?? [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          questionId: q.id ?? q.questionId,
          questionText: q.question_text ?? q.questionText,
          options: q.options,
          answer: q.correct_answer ?? q.answer,
          answeringReason: q.answer_reason ?? q.answeringReason,
          difficulty: q.difficulty ?? 'normal',
        })),
    }));
    return {
      id: test.id,
      title: test.title,
      isFree: test.is_free ?? test.isFree ?? false,
      passageCount: test.passage_count ?? passages.length,
      questionCount: test.question_count ?? passages.reduce((n, p) => n + p.questions.length, 0),
      timeMinutes: test.time_minutes ?? 22,
      passages,
      flatQuestions: flattenTimedVRPassages(passages),
    };
  });
}

export function useTimedVRTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('vr');
        if (enabled) {
          const data = require('../../dev/preview-vr-timed.json');
          if (data?.length > 0) {
            setTests(mapTests(data));
            setLoading(false);
            return;
          }
        }
      }

      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch {
        // Offline / version check failed — fall back to cache if available
        if (hasValidCache) {
          setTests(
            cached.data.map((t) =>
              t.flatQuestions
                ? t
                : { ...t, flatQuestions: flattenTimedVRPassages(t.passages) },
            ),
          );
        }
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setTests(
          cached.data.map((t) =>
            t.flatQuestions
              ? t
              : { ...t, flatQuestions: flattenTimedVRPassages(t.passages) },
          ),
        );
        setLoading(false);
        return;
      }

      try {
        const rows = await withRetry(() => db.fetchTimedVRTests());
        const mapped = mapTestsFromNested(rows);
        await saveCache(SECTION, versionRow.version, mapped);
        setTests(mapped);
      } catch (fetchErr) {
        reportError('useTimedVRTests', fetchErr, { level: 'warning', extra: { note: 'fetch failed' } });
        if (hasValidCache) {
          setTests(
            cached.data.map((t) =>
              t.flatQuestions
                ? t
                : { ...t, flatQuestions: flattenTimedVRPassages(t.passages) },
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { tests, loading, error };
}
