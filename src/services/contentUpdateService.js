import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { db } from '../lib/dbQueries';
import { getCached } from './contentCache';
import { syncPracticeContent } from './practiceContentService';
import { useNetwork } from '../context/NetworkContext';

const ALL_SECTIONS = [
  'verbal_reasoning',
  'decision_making',
  'quantitative_reasoning',
  'situational_judgement',
  'timed_verbal_reasoning',
  'timed_decision_making',
  'timed_quantitative_reasoning',
  'timed_situational_judgement',
];

// Minimum time between automatic version checks (5 minutes).
const MIN_CHECK_INTERVAL_MS = 5 * 60 * 1000;

let lastCheckedAt = 0;

// Keep complete device banks while replacements download. Timed-test hooks
// already refresh their own versioned banks when opened.
async function refreshChangedContent() {
  const rows = await db.getAllContentVersions({ force: true });
  const versions = Object.fromEntries(rows.map((row) => [row.section, row.version]));
  let staleCount = 0;
  await Promise.all(ALL_SECTIONS.map(async (section) => {
    const cached = await getCached(section);
    if (!cached || versions[section] == null || versions[section] === cached.version) return;
    staleCount++;
    if (!section.startsWith('timed_')) void syncPracticeContent(section).catch(() => {});
  }));
  lastCheckedAt = Date.now();
  return staleCount;
}

async function checkAndRefreshStaleContent() {
  if (Date.now() - lastCheckedAt < MIN_CHECK_INTERVAL_MS) return;
  lastCheckedAt = Date.now();
  try { await refreshChangedContent(); } catch { /* Keep downloaded content offline. */ }
}

export function forceContentVersionCheck() {
  return refreshChangedContent();
}

/**
 * Mount this hook once in AppStack (after login).
 * Runs a version check on mount and whenever the app returns to the foreground.
 */
export function useContentVersionCheck() {
  const appState = useRef(AppState.currentState);
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (isOnline) { lastCheckedAt = 0; checkAndRefreshStaleContent(); }

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isOnline) checkAndRefreshStaleContent();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [isOnline]);
}
