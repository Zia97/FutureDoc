import { useState, useEffect, useRef } from 'react';

export function useTestTimer(totalMinutes, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const ref = useRef(null);

  // Keep the latest onExpire in a ref so the interval always invokes the
  // current closure — not the one captured when the effect last ran (the
  // effect only re-runs on isPaused changes). Without this, onExpire and
  // everything it closes over (notably the in-progress answers state) is
  // frozen at mount, so a timer-expiry auto-submit persists the initial
  // EMPTY answers over the user's real attempt (score 0 / scaled 300).
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // One-shot guards: the timer may expire, or be stopped, at most once.
  const expiredRef = useRef(false);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (isPaused || stoppedRef.current) {
      clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          if (!expiredRef.current && !stoppedRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [isPaused]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 300; // last 5 minutes

  function pause() { setIsPaused(true); }
  function resume() { setIsPaused(false); }

  // Halt the countdown permanently — called when the exam ends so the timer
  // cannot fire a second (expiry) auto-submit while the results screen is up.
  function stop() {
    stoppedRef.current = true;
    clearInterval(ref.current);
  }

  return { secondsLeft, display, isUrgent, isPaused, pause, resume, stop };
}
