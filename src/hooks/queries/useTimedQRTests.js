import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenTimedQRSets } from '../../lib/flattenQuestions';

const SECTION = 'timed_quantitative_reasoning';

function addFlatQuestions(test) {
  return { ...test, flatQuestions: flattenTimedQRSets(test.sets) };
}

// Maps dev JSON format (preview-qr-timed.json) into the app data shape.
function mapDevTests(data) {
  return data.map((test) => {
    const sets = test.sets.map((s) => ({
      setId: s.set_id,
      title: s.title,
      stimulus: s.stimulus,
      questions: [...s.questions]
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          questionId: q.id,
          stem: q.stem,
          options: q.options ?? [],
          answer: q.correct_answer,
          answeringReason: q.answer_reason,
          difficulty: q.difficulty ?? 'normal',
        })),
    }));
    return addFlatQuestions({
      id: test.id,
      title: test.title,
      questionCount: test.question_count,
      timeMinutes: test.time_minutes,
      sets,
    });
  });
}

// Maps DB rows (from timed_quantitative_reasoning_tests with nested sets and questions) into the app data shape.
//
// NB: setId MUST be the UUID s.id, not the human-readable s.set_ref.
// The DB column timed_quantitative_reasoning_question_answers.set_id is a
// UUID FK to timed_quantitative_reasoning_sets.id, so any submission that
// uses set_ref (e.g. "qr1-set-01") gets rejected with `22P02 invalid input
// syntax for type uuid`. Earlier versions of this file used set_ref by
// mistake, which is why old local cache and old offline queue entries may
// contain non-UUID setIds. Pruning logic in:
//   • src/services/timedExamSyncQueue.js (validate-and-drop in flush)
//   • src/hooks/attempts/useTimedQRExamProgress.js (prune bad local attempts)
// handles the cleanup the next time the app loads.
function mapDBTests(rows) {
  return rows.map((test) => {
    const sets = [...test.timed_quantitative_reasoning_sets]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => ({
        setId: s.id,
        setRef: s.set_ref,
        title: s.title,
        stimulus: s.stimulus,
        questions: [...s.timed_quantitative_reasoning_questions]
          .sort((a, b) => a.order_index - b.order_index)
          .map((q) => ({
            questionId: q.id,
            stem: q.stem,
            options: q.options ?? [],
            answer: q.correct_answer,
            answeringReason: q.answer_reason,
            difficulty: q.difficulty ?? 'normal',
          })),
      }));

    const questionCount = sets.reduce((sum, s) => sum + s.questions.length, 0);

    return addFlatQuestions({
      id: `timed-qr-test-${test.id}`,
      title: test.title,
      isFree: test.is_free ?? false,
      questionCount,
      timeMinutes: test.time_minutes,
      sets,
    });
  });
}

export function useTimedQRTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('qr');
        if (enabled) {
          const data = require('../../dev/preview-qr-timed.json');
          if (data?.length > 0) {
            setTests(mapDevTests(data));
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
      } catch (versionError) {
        if (hasValidCache) {
          setTests(cached.data.map(addFlatQuestions));
        } else {
          setError(versionError);
        }
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setTests(cached.data.map(addFlatQuestions));
        setLoading(false);
        return;
      }

      try {
        const rows = await withRetry(() => db.fetchTimedQRTests(), {
          shouldRetry: (result) => result.length === 0,
        });
        const mapped = mapDBTests(rows);
        setTests(mapped);
        await saveCache(SECTION, versionRow.version, mapped);
      } catch (err) {
        if (hasValidCache) {
          setTests(cached.data.map(addFlatQuestions));
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { tests, loading, error };
}
