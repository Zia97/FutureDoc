// Keep the original completed attempt available if a device write needs retrying.
export function createExamSubmission({ save, onStateChange, onComplete }) {
  let snapshot;
  let running = false;
  let completed = false;
  return async function submit(payload) {
    if (running || completed) return;
    if (snapshot === undefined) snapshot = payload;
    if (snapshot === undefined) return;
    running = true;
    onStateChange('saving');
    try {
      await save(snapshot);
      completed = true;
      onStateChange(null);
      onComplete();
    } catch {
      onStateChange('error');
    } finally {
      running = false;
    }
  };
}
