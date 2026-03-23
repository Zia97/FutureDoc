import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenVRPassages } from '../../lib/flattenQuestions';

const SECTION = 'verbal_reasoning';

function mapPassages(data) {
  return data.map((p) => ({
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
  }));
}

async function fetchFromDB() {
  const data = await db.fetchVRPassages();
  return mapPassages(data);
}

export function useVerbalReasoningPassages() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('vr');
        if (enabled) {
          const data = require('../../dev/preview-vr.json');
          if (data?.length > 0) {
            setPassages(mapPassages(data));
            setLoading(false);
            return;
          }
        }
      }

      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;
      if (hasValidCache) {
        setPassages(cached.data);
        setLoading(false);
      }

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch (versionError) {
        if (!hasValidCache) {
          setError(versionError);
          setLoading(false);
        }
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        return;
      }

      try {
        const fresh = await withRetry(() => fetchFromDB(), {
          shouldRetry: (result) => result.length === 0,
        });
        setPassages(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        if (!hasValidCache) {
          setError(err);
        }
      } finally {
        if (!hasValidCache) setLoading(false);
      }
    }

    load();
  }, []);

  const flatQuestions = useMemo(() => flattenVRPassages(passages), [passages]);

  return { passages, flatQuestions, loading, error };
}
