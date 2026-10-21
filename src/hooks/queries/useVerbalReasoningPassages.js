import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getCached } from '../../services/contentCache';
import { syncPracticeContent } from '../../services/practiceContentService';
import { mapPassages } from '../../lib/practiceContent';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenVRPassages } from '../../lib/flattenQuestions';

const SECTION = 'verbal_reasoning';

export function useVerbalReasoningPassages() {
  const [passages, setPassages] = useState([]);
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
      const enabled = await isPreviewEnabled('vr');
      if (enabled) {
        const data = require('../../dev/preview-vr.json');
        if (data?.length > 0) {
          setPassages(mapPassages(data, true));
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

    try {
      const fresh = await syncPracticeContent(SECTION, (progress) => {
        if (!isMounted.current) return;
        setSyncing(true);
        setSyncProgress(progress);
      });
      if (isMounted.current) {
        setPassages(fresh.data);
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

  const flatQuestions = useMemo(() => flattenVRPassages(passages), [passages]);

  return { passages, flatQuestions, loading, error, syncing, syncProgress, refetch };
}
