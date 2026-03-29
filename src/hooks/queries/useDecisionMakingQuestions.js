import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'decision_making';

function mapQuestions(data) {
  return data.map((q) => ({
    id: q.id,
    title: q.title,
    type: q.type,
    stem: q.stem,
    tableData: q.table_data,
    stimulusDiagram: q.stimulus_diagram,
    answer: q.correct_answer,
    answeringReason: q.answer_reason,
    subtype: q.stimulus_diagram
      ? 'interpret_diagram'
      : q.decision_making_question_options?.some((o) => o.option_data)
      ? 'select_diagram'
      : null,
    options: [...(q.decision_making_question_options || [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((o) => ({
        label: o.label,
        text: o.option_text,
        vennConfig: o.option_data,
      })),
    statements: [...(q.decision_making_question_statements || [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => ({
        text: s.statement_text,
        answer: s.correct_answer,
        reason: s.answer_reason ?? null,
      })),
  }));
}

async function fetchFromDB() {
  const data = await db.fetchDMQuestions();
  return mapQuestions(data);
}

export function useDecisionMakingQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
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

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch (versionError) {
        if (hasValidCache) {
          setQuestions(cached.data);
        } else {
          setError(versionError);
        }
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setQuestions(cached.data);
        setLoading(false);
        return;
      }

      try {
        const fresh = await withRetry(() => fetchFromDB(), {
          shouldRetry: (result) => result.length === 0,
        });
        setQuestions(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        if (hasValidCache) {
          setQuestions(cached.data);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { questions, loading, error };
}
