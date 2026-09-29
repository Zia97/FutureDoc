import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { getIsOnline } from '../context/NetworkContext';

const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-tutor`;
const APP_VERSION  = Constants.expoConfig?.version ?? '0.0.0';

function firstPresentId(...values) {
  return values.find((value) => value != null && String(value).trim() !== '');
}

export async function streamAITutor({
  questionId,
  id,
  itemId,
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
  isDemo,
  messages,
  onChunk,
  onDone,
  onError,
}) {
  const resolvedQuestionId = firstPresentId(questionId, id, itemId);

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
        'X-Platform': Platform.OS,
        'X-App-Version': APP_VERSION,
      },
      body: JSON.stringify({
        questionId: resolvedQuestionId,
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
        isDemo,
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
    const { content, messageId } = await response.json();
    if (content) onChunk(content);
    onDone({ messageId: messageId ?? null });
  } catch (err) {
    onError(err);
  }
}

export async function rateAITutorResponse(logId, rating) {
  if (!getIsOnline()) throw new Error('offline');
  if (!Number.isSafeInteger(Number(logId))) throw new Error('invalid_log_id');
  if (!['helpful', 'not_helpful'].includes(rating)) throw new Error('invalid_rating');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      'X-Platform': Platform.OS,
      'X-App-Version': APP_VERSION,
    },
    body: JSON.stringify({
      action: 'feedback',
      logId: Number(logId),
      rating,
    }),
  });

  if (!response.ok) throw new Error('feedback_failed');
}
