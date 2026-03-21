import { useState, useEffect } from 'react';
import { isPreviewEnabled } from '../../dev/previewStore';

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
        stem: q.stem,
        options: q.options ?? [],
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
      })),
  }));
}

export function useTimedQRTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (__DEV__) {
        const enabled = await isPreviewEnabled('qr');
        if (enabled) {
          const data = require('../../dev/preview-qr-timed.json');
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
