import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { recordLessonStart, recordLessonHeartbeat, recordLessonComplete } from '../lib/userTelemetry';
import { reportError } from '../lib/reportError';
import { useAuth } from '../context/AuthContext';
import { useMarketingDemo } from '../dev/useMarketingDemo';

const CHECKPOINT_MS = 5_000;
const UPLOAD_MS = 60_000;
export function useLessonTelemetry({ section, lessonId }) {
  const marketingDemo = useMarketingDemo();
  const focused = useIsFocused();
  const { user } = useAuth();
  const userId = user?.id;
  const completeRef = useRef(null);
  const finished = useRef(false);
  useEffect(() => { finished.current = false; }, [section, lessonId]);
  useEffect(() => {
    if (marketingDemo || !section || !lessonId || !userId || !focused || finished.current) return;
    let anchor = AppState.currentState === 'active' ? Date.now() : null;
    let pending = 0;
    let lastUpload = Date.now();
    let writes = Promise.resolve();
    let done = false;
    const collect = () => {
      if (anchor == null) return;
      const seconds = Math.max(0, Math.floor((Date.now() - anchor) / 1000));
      pending += seconds;
      anchor += seconds * 1000;
    };
    const save = (upload, complete = false) => {
      collect();
      // Serialize persistence, retaining seconds if a local write fails.
      writes = writes.then(async () => {
        const delta = pending;
        pending = 0;
        try {
          await (complete ? recordLessonComplete : recordLessonHeartbeat)({ userId, section, lessonId, deltaSeconds: delta, upload });
        } catch (error) {
          pending += delta;
          reportError('lessonCheckpoint.persist', error);
        }
      });
      if (upload) lastUpload = Date.now();
      return writes;
    };
    writes = recordLessonStart({ userId, section, lessonId }).catch((error) => reportError('lessonCheckpoint.start', error));
    const interval = setInterval(() => {
      if (!done && anchor != null) save(Date.now() - lastUpload >= UPLOAD_MS);
    }, CHECKPOINT_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (done) return;
      if (state === 'active') { if (anchor == null) anchor = Date.now(); }
      else { save(true); anchor = null; }
    });
    completeRef.current = () => {
      if (done) return;
      done = true;
      finished.current = true;
      save(true, true);
      anchor = null;
    };
    return () => {
      clearInterval(interval);
      sub.remove();
      if (!done) save(true);
      anchor = null;
      completeRef.current = null;
    };
  }, [marketingDemo, section, lessonId, userId, focused]);
  return { markComplete: useCallback(() => completeRef.current?.(), []) };
}
