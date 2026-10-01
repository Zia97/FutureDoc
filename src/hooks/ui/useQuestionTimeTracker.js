import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Tracks the cumulative milliseconds the user has actively spent looking
 * at each question during a timed test.
 *
 * "Actively" means: the test screen is mounted, the test isn't paused,
 * and the app is in the foreground. Revisits are additive — going back
 * to a question increases its accumulated time, matching the assumption
 * that the user is engaged with whatever question is currently on screen.
 *
 * Usage:
 *   const getQuestionTimes = useQuestionTimeTracker(currentQid, !isPaused && !showReview);
 *   // ...later, on submit:
 *   const timesByQid = getQuestionTimes(); // { [qid]: ms }
 *
 * Returns a stable getter; calling it flushes the in-flight timer for
 * the current question and returns a snapshot of the accumulated map.
 */
export function useQuestionTimeTracker(qid, isActive) {
  const timesRef = useRef({});           // { [qid]: accumulated ms }
  const enteredAtRef = useRef(null);     // ms timestamp the current run started
  const currentQidRef = useRef(null);    // qid the in-flight timer belongs to
  const appForegroundRef = useRef(AppState.currentState === 'active');

  // Flush whatever has accumulated for the in-flight question and stop the timer.
  function flushCurrent() {
    if (enteredAtRef.current != null && currentQidRef.current != null) {
      const elapsed = Date.now() - enteredAtRef.current;
      if (elapsed > 0) {
        const qidKey = currentQidRef.current;
        timesRef.current[qidKey] = (timesRef.current[qidKey] ?? 0) + elapsed;
      }
    }
    enteredAtRef.current = null;
  }

  // Pause/resume on app foreground/background transitions.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const nowForeground = state === 'active';
      if (nowForeground === appForegroundRef.current) return;
      appForegroundRef.current = nowForeground;

      if (!nowForeground) {
        flushCurrent();
      } else if (isActive && currentQidRef.current != null) {
        enteredAtRef.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [isActive]);

  // React to question changes and active-state changes.
  useEffect(() => {
    flushCurrent();
    currentQidRef.current = qid ?? null;
    if (isActive && appForegroundRef.current && qid != null) {
      enteredAtRef.current = Date.now();
    }
  }, [qid, isActive]);

  // Final flush on unmount so callers don't lose the last interval.
  useEffect(() => {
    return () => flushCurrent();
  }, []);

  // Caller-facing snapshot. Flushes the in-flight timer first so the
  // returned map reflects time spent up to and including "right now".
  function getQuestionTimes() {
    flushCurrent();
    // Re-arm the timer for the same question in case the caller continues
    // tracking after reading (e.g. a draft submit before the user resumes).
    if (isActive && appForegroundRef.current && currentQidRef.current != null) {
      enteredAtRef.current = Date.now();
    }
    return { ...timesRef.current };
  }

  return getQuestionTimes;
}
