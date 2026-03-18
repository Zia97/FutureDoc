import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCached, saveCache } from '../services/contentCache';

const SECTION = 'situational_judgement';

function mapScenarios(data) {
  return data.map((s) => ({
    id: s.id,
    scenarioId: s.id,
    labelSet: s.label_set,
    resource: s.body,
    questions: [...s.situational_judgement_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
        questionText: q.question_text,
        answer: q.correct_answer,
        answeringReason: q.answer_reason,
      })),
  }));
}

async function fetchFromDB() {
  const { data, error } = await supabase
    .from('situational_judgement_scenarios')
    .select(`
      id,
      label_set,
      body,
      situational_judgement_questions (
        id,
        question_text,
        correct_answer,
        answer_reason,
        order_index
      )
    `)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return mapScenarios(data);
}

export function useSituationalJudgementScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;
      if (hasValidCache) {
        setScenarios(cached.data);
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
        setScenarios(fresh);
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

  return { scenarios, loading, error };
}
