import { useState, useEffect } from 'react';
import { isPreviewEnabled } from '../../dev/previewStore';

function mapTests(data) {
  return data.map((test) => ({
    id: test.id,
    title: test.title,
    passageCount: test.passage_count,
    questionCount: test.question_count,
    timeMinutes: test.time_minutes,
    passages: test.passages.map((p) => ({
      id: p.id,
      title: p.title,
      resource: p.body,
      questions: [...p.verbal_reasoning_questions]
        .sort((a, b) => a.order_index - b.order_index)
        .map((q) => ({
          questionId: q.id,
          questionText: q.question_text,
          options: q.options,
          answer: q.correct_answer,
          answeringReason: q.answer_reason,
        })),
    })),
  }));
}

export function useTimedVRTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('vr');
        if (enabled) {
          const data = require('../../dev/preview-vr-timed.json');
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
