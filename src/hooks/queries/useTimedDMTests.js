import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { reportError } from '../../lib/reportError';

const SECTION = 'timed_decision_making';

function normalizeOptions(options = []) {
  return [...options]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((o) => ({
      label: o.label,
      text: o.option_text ?? o.text ?? '',
      option_text: o.option_text ?? o.text ?? '',
      option_data: o.option_data ?? o.vennConfig ?? null,
      vennConfig: o.option_data ?? o.vennConfig ?? null,
      vennGeometry: o.venn_geometry ?? o.vennGeometry ?? null,
      order_index: o.order_index,
    }));
}

function mapQuestion(q) {
  return {
    questionId: q.id,
    title: q.title,
    type: q.type,
    subtype: q.subtype ?? null,
    stem: q.stem,
    options: q.timed_decision_making_question_options
      ? normalizeOptions(q.timed_decision_making_question_options)
      : normalizeOptions(q.options ?? []),
    statements: q.timed_decision_making_question_statements
      ? [...q.timed_decision_making_question_statements]
          .sort((a, b) => a.order_index - b.order_index)
          .map((s) => ({ text: s.statement_text, answer: s.correct_answer, reason: s.answer_reason ?? null }))
      : (q.decision_making_question_statements
          ? [...q.decision_making_question_statements]
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => ({ text: s.statement_text, answer: s.correct_answer, reason: s.answer_reason ?? null }))
          : []),
    tableData: q.table_data,
    stimulusDiagram: q.stimulus_diagram ?? q.stimulusDiagram,
    stimulusVennGeometry: q.venn_geometry ?? null,
    hideLabels: q.hideLabels ?? q.hide_labels ?? false,
    answer: q.correct_answer,
    answeringReason: q.answer_reason,
    difficulty: q.difficulty ?? 'normal',
  };
}

function mapTests(data) {
  return data.map((test) => {
    const questions = test.timed_decision_making_questions ?? test.questions ?? [];
    return {
      id: test.id,
      title: test.title,
      isFree: test.is_free ?? test.isFree ?? false,
      passageCount: 0,
      questionCount: test.question_count ?? questions.length,
      timeMinutes: test.time_minutes,
      questions: [...questions]
        .sort((a, b) => a.order_index - b.order_index)
        .map(mapQuestion),
    };
  });
}

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
      const mapped = mapTests(raw);
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
