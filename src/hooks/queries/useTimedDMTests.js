import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';
import { reportError } from '../../lib/reportError';

const SECTION = 'timed_decision_making';

function mapQuestion(q) {
  return {
    questionId: q.id,
    title: q.title,
    type: q.type,
    subtype: q.subtype ?? null,
    stem: q.stem,
    options: q.timed_decision_making_question_options
      ? [...q.timed_decision_making_question_options]
          .sort((a, b) => a.order_index - b.order_index)
          .map((o) => ({ label: o.label, text: o.option_text, option_data: o.option_data ?? null, vennGeometry: o.venn_geometry ?? null }))
      : (q.options ?? []),
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
    stimulusDiagram: q.stimulus_diagram,
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
  const [error] = useState(null);

  useEffect(() => {
    async function load() {
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

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch (e) {
        reportError('DM', e, { level: 'warning', extra: { note: 'getContentVersion failed' } });
        if (hasValidCache) setTests(cached.data);
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setTests(cached.data);
        setLoading(false);
        return;
      }

      try {
        const fresh = await withRetry(() => db.fetchTimedDMTests());
        const mapped = mapTests(fresh);
        await saveCache(SECTION, versionRow.version, mapped);
        setTests(mapped);
      } catch (e) {
        reportError('DM', e, { level: 'warning', extra: { note: 'fetchTimedDMTests failed' } });
        if (hasValidCache) setTests(cached.data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { tests, loading, error };
}
