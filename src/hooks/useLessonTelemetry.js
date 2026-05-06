import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import {
  recordLessonStart,
  recordLessonHeartbeat,
  recordLessonComplete,
} from '../lib/userTelemetry';

const HEARTBEAT_MS = 15_000;

/**
 * Track time-on-lesson for telemetry.
 *
 * Active wall-clock seconds (foreground only) are accumulated locally and
 * flushed on a 15s cadence, on unmount, and on explicit completion.
 *
 * @param {{ section: 'vr'|'dm'|'qr'|'sj', lessonId: string|null }} args
 * @returns {{ markComplete: () => void }}
 */
export function useLessonTelemetry({ section, lessonId }) {
  const enabled = !!section && !!lessonId;

  // Wall-clock anchor for the currently-active foreground window (null when bg).
  const activeSinceRef = useRef(null);
  // Pending seconds since the last successful flush.
  const pendingSecondsRef = useRef(0);
  // Once true, heartbeats stop and further markComplete calls are ignored.
  const completedRef = useRef(false);

  const collectSeconds = useCallback(() => {
    if (activeSinceRef.current == null) return 0;
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - activeSinceRef.current) / 1000));
    activeSinceRef.current = now;
    pendingSecondsRef.current += elapsed;
    return pendingSecondsRef.current;
  }, []);

  const flushHeartbeat = useCallback(async () => {
    if (!enabled || completedRef.current) return;
    collectSeconds();
    const delta = pendingSecondsRef.current;
    if (delta <= 0) return;
    pendingSecondsRef.current = 0;
    await recordLessonHeartbeat({ section, lessonId, deltaSeconds: delta });
  }, [enabled, section, lessonId, collectSeconds]);

  useEffect(() => {
    if (!enabled) return undefined;

    completedRef.current = false;
    pendingSecondsRef.current = 0;
    activeSinceRef.current =
      AppState.currentState === 'active' ? Date.now() : null;

    recordLessonStart({ section, lessonId });

    const interval = setInterval(() => {
      flushHeartbeat();
    }, HEARTBEAT_MS);

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        if (activeSinceRef.current == null) activeSinceRef.current = Date.now();
      } else {
        // Going to background: roll partial seconds into pending and pause the clock.
        collectSeconds();
        activeSinceRef.current = null;
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
      // Final flush on unmount unless markComplete already handled it.
      if (!completedRef.current) {
        collectSeconds();
        const delta = pendingSecondsRef.current;
        pendingSecondsRef.current = 0;
        activeSinceRef.current = null;
        if (delta > 0) {
          recordLessonHeartbeat({ section, lessonId, deltaSeconds: delta });
        }
      }
    };
  }, [enabled, section, lessonId, flushHeartbeat, collectSeconds]);

  const markComplete = useCallback(() => {
    if (!enabled || completedRef.current) return;
    completedRef.current = true;
    collectSeconds();
    const delta = pendingSecondsRef.current;
    pendingSecondsRef.current = 0;
    activeSinceRef.current = null;
    recordLessonComplete({ section, lessonId, deltaSeconds: delta });
  }, [enabled, section, lessonId, collectSeconds]);

  return { markComplete };
}
