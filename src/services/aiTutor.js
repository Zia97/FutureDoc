import { supabase } from '../lib/supabase';

const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-tutor`;

export async function streamAITutor({
  question,
  questionType,
  section,
  correctAnswer,
  userAnswer,
  explanation,
  stimulusData,
  vennDiagrams,
  messages,
  onChunk,
  onDone,
  onError,
}) {
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
        question,
        questionType,
        section,
        correctAnswer,
        userAnswer,
        explanation,
        stimulusData,
        vennDiagrams,
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
