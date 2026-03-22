import { useState, useEffect } from 'react';
import { db } from '../../lib/dbQueries';
import { getCached, saveCache } from '../../services/contentCache';
import { withRetry } from '../../lib/withRetry';
import { isPreviewEnabled } from '../../dev/previewStore';

const SECTION = 'timed_situational_judgement';

// Maps dev JSON format (preview-sj-timed.json) into the app data shape.
function mapDevTests(data) {
  return data.map((test) => ({
    id: test.id,
    title: test.title,
    scenarioCount: test.scenarios.length,
    questionCount: test.question_count,
    timeMinutes: test.time_minutes,
    scenarios: [...test.scenarios]
      .sort((a, b) => a.order_index - b.order_index)
      .map((s) => ({
        scenarioId: s.id,
        stem: s.stem,
        items: [...s.items]
          .sort((a, b) => a.order_index - b.order_index)
          .map((i) => ({
            itemId: i.id,
            type: i.type,
            text: i.text,
            answer: i.correct_answer,
            answeringReason: i.answer_reason,
          })),
      })),
  }));
}

// Maps DB rows (grouped by test_id) into the app data shape.
function mapDBTests(rows) {
  const grouped = {};

  for (const scenario of rows) {
    const testId = scenario.test_id;
    if (!grouped[testId]) grouped[testId] = [];
    grouped[testId].push(scenario);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([testId, scenarios]) => {
      const mappedScenarios = scenarios.map((s) => ({
        scenarioId: s.id,
        stem: s.body,
        items: [...s.timed_situational_judgement_questions]
          .sort((a, b) => a.order_index - b.order_index)
          .map((q) => ({
            itemId: q.id,
            type: q.label_set === 1 ? 'importance' : 'appropriateness',
            text: q.question_text,
            answer: q.correct_answer,
            answeringReason: q.answer_reason,
          })),
      }));

      const questionCount = mappedScenarios.reduce((sum, s) => sum + s.items.length, 0);

      return {
        id: `timed-sj-test-${testId}`,
        title: `SJ Timed Test ${testId}`,
        scenarioCount: mappedScenarios.length,
        questionCount,
        timeMinutes: 26,
        scenarios: mappedScenarios,
      };
    });
}

export function useTimedSJTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('sj');
        if (enabled) {
          const data = require('../../dev/preview-sj-timed.json');
          if (data?.length > 0) {
            setTests(mapDevTests(data));
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
      } catch (versionError) {
        if (!hasValidCache) {
          setError(versionError);
          setLoading(false);
        }
        return;
      }

      if (hasValidCache && cached.version === versionRow.version) {
        return;
      }

      try {
        const rows = await withRetry(() => db.fetchTimedSJTests(), {
          shouldRetry: (result) => result.length === 0,
        });
        const mapped = mapDBTests(rows);
        setTests(mapped);
        await saveCache(SECTION, versionRow.version, mapped);
      } catch (err) {
        if (!hasValidCache) {
          setError(err);
        }
      } finally {
        if (!hasValidCache) setLoading(false);
      }
    }

    load();
  }, []);

  return { tests, loading, error };
}
