import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getCached, saveCache } from '../../services/contentCache';

const SECTION = 'verbal_reasoning';

function mapPassages(data) {
  return data.map((p) => ({
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
  }));
}

async function fetchFromDB() {
  const { data, error } = await supabase
    .from('verbal_reasoning_passages')
    .select(`
      id,
      title,
      body,
      verbal_reasoning_questions (
        id,
        question_text,
        options,
        correct_answer,
        answer_reason,
        order_index
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return mapPassages(data);
}

export function useVerbalReasoningPassages() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;
      if (hasValidCache) {
        setPassages(cached.data);
        setLoading(false);
      }

      const { data: versionRow, error: versionError } = await supabase
        .from('content_versions')
        .select('version')
        .eq('section', SECTION)
        .single();

      if (versionError) {
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
        const fresh = await fetchFromDB();
        setPassages(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
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

  return { passages, loading, error };
}
