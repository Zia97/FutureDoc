import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'timed_quantitative_reasoning';

function mapTests(data) {
  return data.map((test) => ({
    id: test.id,
    title: test.title,
    questionCount: test.question_count,
    timeMinutes: test.time_minutes,
    sets: test.sets.map((s) => ({
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
        })),
    })),
  }));
}

export function useTimedQRTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('qr');
        if (enabled) {
          const data = require('../../dev/preview-qr-timed.json');
          if (data?.length > 0) {
            setTests(mapTests(data));
            setLoading(false);
            return;
          }
        }
      }

      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;
      if (hasValidCache) {
        setTests(cached.data);
        setLoading(false);
      }

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch {
        if (!hasValidCache) setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        return;
      }

      // TODO: fetch timed QR tests from DB once schema is designed.
      if (!hasValidCache) setLoading(false);
    }

    load();
  }, []);

  return { tests, loading, error };
}
