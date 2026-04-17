import { supabase } from '../lib/supabase';
import { getIsOnline } from '../context/NetworkContext';

const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-tutor`;

export async function streamAITutor({
  questionId,
  question,
  questionType,
  section,
  correctAnswer,
  userAnswer,
  explanation,
  passage,
  options,
  stimulusData,
  vennDiagrams,
  isTimed,
  messages,
  onChunk,
  onDone,
  onError,
}) {
  // Pre-flight: never debit a credit (or stall on a hung fetch) when offline.
  // Streaming AI responses are non-idempotent and credit-gated server-side, so
  // we refuse to even start the request. The caller surfaces an inline retry.
  if (!getIsOnline()) {
    onError({ code: 'offline' });
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    onError(new Error('Not authenticated'));
    return;
  }

  let response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        questionId,
        question,
        questionType,
        section,
        correctAnswer,
        userAnswer,
        explanation,
        passage,
        options,
        stimulusData,
        vennDiagrams,
        isTimed,
        messages,
      }),
    });
  } catch (err) {
    onError(err);
    return;
  }

  if (!response.ok) {
    try {
      const body = await response.json();
      onError({ code: body.error, status: response.status });
    } catch {
      onError({ code: 'unknown', status: response.status });
    }
    return;
  }

  try {
    const { content } = await response.json();
    if (content) onChunk(content);
    onDone();
  } catch (err) {
    onError(err);
  }
}
