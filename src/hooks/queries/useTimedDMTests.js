import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { reportError } from '../../lib/reportError';
import { mapTimedDMTests } from '../../utils/dm/normalizeTimedDM';

const SECTION = 'timed_decision_making';

export function useTimedDMTests() {
  const [tests, setTests] = useState([]);
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
        const data = require('../../dev/preview-dm-timed.json');
        if (data?.length > 0) {
          setTests(mapTimedDMTests(data, true));
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
    } catch (e) {
      reportError('DM', e, { level: 'warning', extra: { note: 'getContentVersion failed' } });
      if (!hasValidCache) setError(e);
      setLoading(false);
      return;
    }

    if (hasValidCache && cached.version === versionRow.version) {
      setError(null);
      setLoading(false);
      return;
    }

    if (!isMounted.current) return;
    setSyncing(true);
    setSyncProgress({ loaded: 0, total: null });

    try {
      let pagesLoaded = 0;
      const raw = await db.fetchAllTimedDMTestsPaginated(() => {
        pagesLoaded++;
        if (isMounted.current) setSyncProgress({ loaded: pagesLoaded, total: null });
      });
      const mapped = mapTimedDMTests(raw);
      await saveCache(SECTION, versionRow.version, mapped);
      if (isMounted.current) {
        setTests(mapped);
        setError(null);
      }
    } catch (e) {
      reportError('DM', e, { level: 'warning', extra: { note: 'fetchTimedDMTests failed' } });
      if (!hasValidCache && isMounted.current) setError(e);
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

  return { tests, loading, error, syncing, syncProgress, refetch };
}
