import { useState, useEffect, useMemo, useRef } from 'react';
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

export function useQuantitativeReasoningSets() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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

      if (hasValidCache) {
        setSets(cached.data);
        setLoading(false);
      }

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch (versionError) {
        if (!hasValidCache) setError(versionError);
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setLoading(false);
        return;
      }

      if (!isMounted.current) return;
      setSyncing(true);
      setSyncProgress({ loaded: 0, total: null });

      try {
        let pagesLoaded = 0;
        const raw = await db.fetchAllQRSetsPaginated(() => {
          pagesLoaded++;
          if (isMounted.current) setSyncProgress({ loaded: pagesLoaded, total: null });
        });
        const fresh = mapSets(raw);
        if (isMounted.current) setSets(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        if (!hasValidCache && isMounted.current) setError(err);
      } finally {
        if (isMounted.current) {
          setSyncing(false);
          setSyncProgress(null);
          setLoading(false);
        }
      }
    }

    load();
  }, []);

  const flatQuestions = useMemo(() => flattenQRSets(sets), [sets]);

  return { sets, flatQuestions, loading, error, syncing, syncProgress };
}
