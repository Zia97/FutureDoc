import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { db } from '../lib/dbQueries';
import { getCached, clearCache } from './contentCache';

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

/**
 * Checks each section's cached version against the DB.
 * Clears the local content cache for any section that has a newer version.
 * The next time a section hook mounts it will find no cache and fetch fresh content.
 */
async function checkAndInvalidateStaleContent() {
  const now = Date.now();
  if (now - lastCheckedAt < MIN_CHECK_INTERVAL_MS) return;
  lastCheckedAt = now;

  for (const section of ALL_SECTIONS) {
    try {
      const cached = await getCached(section);
      if (!cached) continue; // nothing cached — nothing to invalidate

      const versionRow = await db.getContentVersion(section);
      if (versionRow.version !== cached.version) {
        await clearCache(section);
      }
    } catch {
      // Version check failure is non-fatal — skip this section silently.
    }
  }
}

/**
 * Checks all sections immediately, bypassing the cooldown.
 * Returns the number of sections whose caches were cleared.
 */
export async function forceContentVersionCheck() {
  let staleCount = 0;
  for (const section of ALL_SECTIONS) {
    try {
      const cached = await getCached(section);
      if (!cached) continue;

      const versionRow = await db.getContentVersion(section);
      if (versionRow.version !== cached.version) {
        await clearCache(section);
        staleCount++;
      }
    } catch {
      // ignore
    }
  }
  // Reset cooldown so the next background check runs fresh.
  lastCheckedAt = Date.now();
  return staleCount;
}

/**
 * Mount this hook once in AppStack (after login).
 * Runs a version check on mount and whenever the app returns to the foreground.
 */
export function useContentVersionCheck() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkAndInvalidateStaleContent();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkAndInvalidateStaleContent();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);
}
