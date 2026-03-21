import { useState, useEffect, useRef } from 'react';

export function useTestTimer(totalMinutes, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 300; // last 5 minutes

  return { secondsLeft, display, isUrgent };
}
