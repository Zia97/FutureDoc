import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCached, saveCache } from '../services/contentCache';

const SECTION = 'verbal_reasoning';

function mapPassages(data) {
  return data.map((p) => ({
    id: p.id,
    title: p.title,
    resource: p.body,
    questions: [...p.verbal_reasoning_questions]
      .sort((a, b) => a.order_index - b.order_index)
      .map((q) => ({
        id: q.id,
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

  const { data: simpleTest, error: simpleError } = await supabase.from('verbal_reasoning_passages').select('id, title');
  console.log('[VR] simple test:', JSON.stringify({ simpleTest, simpleError }));

  console.log('[VR] raw DB response:', JSON.stringify({ data, error }));
  if (error) throw error;
  return mapPassages(data);
}

export function useVerbalReasoningPassages() {
  const [passages, setPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      // 1. Load cache immediately so the user sees content with no delay
      const cached = await getCached(SECTION);
      const hasValidCache = cached?.data?.length > 0;
      console.log('[VR] cache:', cached ? `v${cached.version}, ${cached.data?.length} passages` : 'none');
      if (hasValidCache) {
        setPassages(cached.data);
        setLoading(false);
      }

      // 2. Check remote version (tiny single-row fetch)
      const { data: versionRow, error: versionError } = await supabase
        .from('content_versions')
        .select('version')
        .eq('section', SECTION)
        .single();

      console.log('[VR] version check:', versionRow, versionError);

      if (versionError) {
        if (!hasValidCache) {
          setError(versionError);
          setLoading(false);
        }
        return;
      }

      // 3. Cache is current — nothing more to do
      if (hasValidCache && cached.version === versionRow.version) {
        console.log('[VR] cache is current, skipping fetch');
        return;
      }

      // 4. No cache or version mismatch — fetch full data and update cache
      try {
        console.log('[VR] fetching from DB...');
        const fresh = await fetchFromDB();
        console.log('[VR] fetched', fresh.length, 'passages');
        setPassages(fresh);
        await saveCache(SECTION, versionRow.version, fresh);
      } catch (err) {
        console.log('[VR] fetchFromDB error:', err);
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
