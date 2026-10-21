import { useState, useEffect, useRef, useCallback } from 'react';
import { getCached } from '../../services/contentCache';
import { syncPracticeContent } from '../../services/practiceContentService';
import { mapQuestions } from '../../lib/practiceContent';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'decision_making';

export function useDecisionMakingQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (__DEV__) {
      const enabled = await isPreviewEnabled('dm');
      if (enabled) {
        const data = require('../../dev/preview-dm.json');
        if (data?.length > 0) {
          setQuestions(mapQuestions(data, true));
          setLoading(false);
          return;
        }
      }
    }

    const cached = await getCached(SECTION);
    const hasValidCache = cached?.data?.length > 0;

    if (hasValidCache) {
      setQuestions(cached.data);
      setLoading(false);
    }

    try {
      const fresh = await syncPracticeContent(SECTION, (progress) => {
        if (!isMounted.current) return;
        setSyncing(true);
        setSyncProgress(progress);
      });
      if (isMounted.current) {
        setQuestions(fresh.data);
        setError(null);
      }
    } catch (err) {
      if (!hasValidCache && isMounted.current) setError(err);
    } finally {
      if (isMounted.current) {
        setSyncing(false);
        setSyncProgress(null);
        setLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { questions, loading, error, syncing, syncProgress, refetch };
}
