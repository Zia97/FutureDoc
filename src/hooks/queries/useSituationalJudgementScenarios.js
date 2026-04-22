import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { flattenSJScenarios } from '../../lib/flattenQuestions';

const SECTION = 'situational_judgement';

function mapScenarios(data) {
  return data.map((s) => ({
    id: s.id,
    scenarioId: s.id,
    isFree: s.is_free ?? s.isFree ?? false,
    resource: s.body,
    questions: [...s.situational_judgement_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        questionId: q.id,
        questionText: q.question_text,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
        labelSet: q.label_set ?? s.label_set,
      })),
  }));
}

export function useSituationalJudgementScenarios() {
  const [scenarios, setScenarios] = useState([]);
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
      const enabled = await isPreviewEnabled('sj');
      if (enabled) {
        const data = require('../../dev/preview-sj.json');
        if (data?.length > 0) {
          setScenarios(mapScenarios(data));
          setLoading(false);
          return;
        }
      }
    }

    const cached = await getCached(SECTION);
    const hasValidCache = cached?.data?.length > 0;

    if (hasValidCache) {
      setScenarios(cached.data);
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
      setError(null);
      setLoading(false);
      return;
    }

    if (!isMounted.current) return;
    setSyncing(true);
    setSyncProgress({ loaded: 0, total: null });

    try {
      let pagesLoaded = 0;
      const raw = await db.fetchAllSJScenariosPaginated(() => {
        pagesLoaded++;
        if (isMounted.current) setSyncProgress({ loaded: pagesLoaded, total: null });
      });
      const fresh = mapScenarios(raw);
      if (isMounted.current) {
        setScenarios(fresh);
        setError(null);
      }
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
  }, []);

  const refetch = useCallback(async () => {
    setError(null);
    setLoading(true);
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const flatQuestions = useMemo(() => flattenSJScenarios(scenarios), [scenarios]);

  return { scenarios, flatQuestions, loading, error, syncing, syncProgress, refetch };
}
