import { useState, useEffect } from 'react';
import { isPreviewEnabled } from '../../dev/previewStore';

function mapTests(data) {
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
            setTests(mapTests(data));
            setLoading(false);
            return;
          }
        }
      }

      // TODO: fetch from DB
      setTests([]);
      setLoading(false);
    }

    load();
  }, []);

  return { tests, loading, error };
}
