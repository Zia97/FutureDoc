import { useRef, useState } from 'react';
import { createExamSubmission } from '../../services/examSubmission';

export function useExamSubmission(save, onComplete) {
  const [submissionState, setSubmissionState] = useState(null);
  const callbacks = useRef({ save, onComplete });
  callbacks.current = { save, onComplete };
  const submit = useRef(null);
  if (!submit.current) {
    submit.current = createExamSubmission({
      save: (snapshot) => callbacks.current.save(snapshot),
      onStateChange: setSubmissionState,
      onComplete: () => callbacks.current.onComplete(),
    });
  }
  return { submit: submit.current, submissionState };
}
