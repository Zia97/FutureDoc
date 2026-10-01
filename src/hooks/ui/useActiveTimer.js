import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Tracks foreground-only active time for a single question.
 *
 * Why: per-question time stamps (used by question_stats and practice analytics)
 * should not include time the user spent with the app backgrounded, the phone
 * locked, or interruption modals open (AI tutor / calculator / notes). Otherwise
 * a 30-second fridge break poisons their average.
 *
 * Mirrors the active-time pattern in lesson telemetry.
 *
 * Usage:
 *   const timer = useActiveTimer({ resetKey: questionId });
 *   // before answering — call timer.pause() / timer.resume() around modals
 *   const elapsedMs = timer.getElapsedMs();
 *
 * The hook auto-pauses when AppState transitions away from 'active'.
 */
export function useActiveTimer({ resetKey } = {}) {
  // Accumulated active time (ms) since the last reset.
  const accumulatedRef = useRef(0);
  // Timestamp at which the current active streak started, or null when paused.
  const activeSinceRef = useRef(null);
  // Track manual pauses (from modals) separately from AppState pauses so we
  // don't auto-resume from a manual pause when AppState comes back to active.
  const manualPauseDepthRef = useRef(0);

  const start = useCallback(() => {
    if (activeSinceRef.current == null && manualPauseDepthRef.current === 0) {
      activeSinceRef.current = Date.now();
    }
  }, []);

  const flushActiveStreak = useCallback(() => {
    if (activeSinceRef.current != null) {
      accumulatedRef.current += Date.now() - activeSinceRef.current;
      activeSinceRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    manualPauseDepthRef.current += 1;
    flushActiveStreak();
  }, [flushActiveStreak]);

  const resume = useCallback(() => {
    if (manualPauseDepthRef.current > 0) {
      manualPauseDepthRef.current -= 1;
    }
    if (manualPauseDepthRef.current === 0 && AppState.currentState === 'active') {
      start();
    }
  }, [start]);

  const reset = useCallback(() => {
    accumulatedRef.current = 0;
    activeSinceRef.current = null;
    manualPauseDepthRef.current = 0;
    if (AppState.currentState === 'active') {
      activeSinceRef.current = Date.now();
    }
  }, []);

  const getElapsedMs = useCallback(() => {
    const live = activeSinceRef.current != null ? Date.now() - activeSinceRef.current : 0;
    return accumulatedRef.current + live;
  }, []);

  // AppState listener — pause/resume on background/foreground transitions.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        if (manualPauseDepthRef.current === 0) start();
      } else {
        flushActiveStreak();
      }
    });
    return () => sub.remove();
  }, [flushActiveStreak, start]);

  // Reset on key change (e.g. new question).
  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  return { getElapsedMs, pause, resume, reset };
}
