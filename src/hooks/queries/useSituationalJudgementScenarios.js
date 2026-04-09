import { useState, useEffect, useMemo } from 'react';
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

async function fetchFromDB() {
  const data = await db.fetchSJScenarios();
  return mapScenarios(data);
}

export function useSituationalJudgementScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
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

      let versionRow;
      try {
        versionRow = await withRetry(() => db.getContentVersion(SECTION));
      } catch (versionError) {
        if (hasValidCache) {
          setScenarios(cached.data);
        } else {
          setError(versionError);
        }
        setLoading(false);
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        setScenarios(cached.data);
        setLoading(false);
        return;
      }

      try {
        const fresh = await withRetry(() => fetchFromDB(), {
          shouldRetry: (result) => result.length === 0,
        });
        setScenarios(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        if (hasValidCache) {
          setScenarios(cached.data);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const flatQuestions = useMemo(() => flattenSJScenarios(scenarios), [scenarios]);

  return { scenarios, flatQuestions, loading, error };
}
