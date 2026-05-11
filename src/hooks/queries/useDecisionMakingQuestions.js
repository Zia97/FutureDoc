import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'decision_making';

function mapOptions(q) {
  const rawOptions = q.decision_making_question_options ?? q.options ?? [];
  return [...rawOptions]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((o) => ({
      label: o.label,
      text: o.option_text ?? o.text ?? '',
      option_text: o.option_text ?? o.text ?? '',
      vennConfig: o.option_data ?? o.vennConfig ?? null,
      option_data: o.option_data ?? o.vennConfig ?? null,
      vennGeometry: o.venn_geometry ?? o.vennGeometry ?? null,
      order_index: o.order_index,
    }));
}

function mapQuestions(data) {
  return data.map((q) => ({
    id: q.id,
    title: q.title,
    type: q.type,
    difficulty: q.difficulty ?? null,
    stem: q.stem,
    isFree: q.is_free ?? q.isFree ?? false,
    tableData: q.table_data,
    stimulusDiagram: q.stimulus_diagram ?? q.stimulusDiagram,
    stimulusVennGeometry: q.venn_geometry ?? null,
    hideLabels: q.hideLabels ?? q.hide_labels ?? false,
    answer: q.correct_answer,
    answeringReason: q.answer_reason,
    subtype: (q.stimulus_diagram ?? q.stimulusDiagram)
      ? 'interpret_diagram'
      : (q.decision_making_question_options?.some((o) => o.option_data)
        || q.options?.some((o) => o.option_data ?? o.vennConfig))
      ? 'select_diagram'
      : null,
    options: mapOptions(q),
    statements: [...(q.decision_making_question_statements || [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => ({
        text: s.statement_text,
        answer: s.correct_answer,
        reason: s.answer_reason ?? null,
      })),
  }));
}

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
          setQuestions(mapQuestions(data));
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
      const raw = await db.fetchAllDMQuestionsPaginated(() => {
        pagesLoaded++;
        if (isMounted.current) setSyncProgress({ loaded: pagesLoaded, total: null });
      });
      const fresh = mapQuestions(raw);
      if (isMounted.current) {
        setQuestions(fresh);
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

  return { questions, loading, error, syncing, syncProgress, refetch };
}
