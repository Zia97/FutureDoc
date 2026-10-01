import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';

// Sentinel value matching the migration: -1 means "no statement" (option-based).
const NO_STATEMENT = -1;

function makeKey(questionId, statementIndex) {
  const idx = statementIndex == null ? NO_STATEMENT : statementIndex;
  return `${questionId}:${idx}`;
}

/**
 * Fetches all question_stats rows for a given practice section once on mount.
 * Returns a lookup function `getStats(questionId, statementIndex)` that maps
 * to `{ totalFirstAttempts, avgTimeMs, correctPct }` or null.
 *
 * @param {'vr'|'dm'|'qr'|'sj'} section
 */
export function useQuestionStats(section) {
  const [statsMap, setStatsMap] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!section) return;
    const { data, error } = await supabase
      .from('question_stats')
      .select('question_id, statement_index, total_first_attempts, total_correct_first_attempts, sum_time_ms')
      .eq('section', section);

    if (error || !isMounted.current) return;

    const map = new Map();
    for (const row of data ?? []) {
      const total = row.total_first_attempts ?? 0;
      if (total <= 0) continue;
      map.set(makeKey(row.question_id, row.statement_index), {
        totalFirstAttempts: total,
        avgTimeMs: Math.round((row.sum_time_ms ?? 0) / total),
        correctPct: Math.round((100 * (row.total_correct_first_attempts ?? 0)) / total),
      });
    }
    setStatsMap(map);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const getStats = useMemo(
    () =>
      function getStats(questionId, statementIndex = null) {
        if (!questionId || !statsMap) return null;
        return statsMap.get(makeKey(questionId, statementIndex)) ?? null;
      },
    [statsMap],
  );

  return { getStats, refetch: load };
}
