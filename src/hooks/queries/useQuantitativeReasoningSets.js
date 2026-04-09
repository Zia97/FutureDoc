import { useState, useEffect, useMemo } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenQRSets } from '../../lib/flattenQuestions';

const SECTION = 'quantitative_reasoning';

function mapSets(data) {
  return data.map((s) => ({
    id: s.id,
    setId: s.id,
    title: s.title,
    isFree: s.is_free ?? s.isFree ?? false,
    stimulus: s.stimulus,
    questions: [...s.quantitative_reasoning_questions]
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
  const data = await db.fetchQRSets();
  return mapSets(data);
}

export function useQuantitativeReasoningSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('qr');
        if (enabled) {
          const data = require('../../dev/preview-qr.json');
          if (data?.length > 0) {
            setSets(mapSets(data));
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
          setSets(cached.data);
        } else {
          setError(versionError);
        }
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setSets(cached.data);
        setLoading(false);
        return;
      }

      try {
        const fresh = await withRetry(() => fetchFromDB(), {
          shouldRetry: (result) => result.length === 0,
        });
        setSets(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        if (hasValidCache) {
          setSets(cached.data);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const flatQuestions = useMemo(() => flattenQRSets(sets), [sets]);

  return { sets, flatQuestions, loading, error };
}
