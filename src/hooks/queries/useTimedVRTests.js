import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'timed_verbal_reasoning';

function mapTests(data) {
  return data.map((test) => ({
    id: test.id,
    title: test.title,
    passageCount: test.passage_count,
    questionCount: test.question_count,
    timeMinutes: test.time_minutes,
    passages: test.passages.map((p) => ({
      id: p.id,
      title: p.title,
      resource: p.body,
      questions: [...p.verbal_reasoning_questions]
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          questionId: q.id,
          questionText: q.question_text,
          options: q.options,
          answer: q.correct_answer,
          answeringReason: q.answer_reason,
        })),
    })),
  }));
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

      // TODO: fetch timed VR tests from DB once schema is designed.
      if (!hasValidCache) setLoading(false);
    }

    load();
  }, []);

  return { tests, loading, error };
}
