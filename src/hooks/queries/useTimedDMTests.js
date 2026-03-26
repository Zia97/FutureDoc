import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'timed_decision_making';

function mapTests(data) {
  return data.map((test) => ({
    id: test.id,
    title: test.title,
    passageCount: 0,
    questionCount: test.question_count,
    timeMinutes: test.time_minutes,
    questions: [...test.questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        questionId: q.id,
        title: q.title,
        type: q.type,
        stem: q.stem,
        options: q.options ?? [],
        statements: q.decision_making_question_statements
          ? [...q.decision_making_question_statements]
              .sort((a, b) => a.order_index - b.order_index)
              .map((s) => ({ text: s.statement_text, answer: s.correct_answer, reason: s.answer_reason ?? null }))
          : [],
        tableData: q.table_data,
        stimulusDiagram: q.stimulus_diagram,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
      })),
  }));
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
      if (hasValidCache) {
        setTests(cached.data);
        setLoading(false);
      }

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch {
        if (!hasValidCache) setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        return;
      }

      // TODO: fetch timed DM tests from DB once schema is designed.
      if (!hasValidCache) setLoading(false);
    }

    load();
  }, []);

  return { tests, loading, error };
}
