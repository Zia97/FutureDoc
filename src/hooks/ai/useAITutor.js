import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { streamAITutor } from '../../services/aiTutor';

export const TUTOR_ERROR = {
  DAILY_LIMIT: 'daily_limit_reached',
  LIFETIME_LIMIT: 'lifetime_limit_reached',
  NETWORK: 'network_error',
  OFFLINE: 'offline',
  TUTOR_DISABLED: 'tutor_disabled',
  DEMO_DISABLED: 'demo_disabled',
};

function firstPresentId(...values) {
  return values.find((value) => value != null && String(value).trim() !== '');
}

function resolveQuestionId(context) {
  return firstPresentId(
    context?.questionId,
    context?.id,
    context?.itemId,
    context?.question?.questionId,
    context?.question?.id,
    context?.question?.itemId,
  );
}

function normalizeQuestionContext(context) {
  if (!context) return context;
  const questionId = resolveQuestionId(context);
  return questionId == null ? context : { ...context, questionId };
}

/**
 * Manages AI tutor chat state for a single question session.
 *
 * @param {object} questionContext - passed straight to the Edge Function
 * @param {string} questionContext.questionId
 * @param {string} questionContext.question
 * @param {string} questionContext.questionType
 * @param {string} questionContext.section
 * @param {string} questionContext.correctAnswer
 * @param {string} questionContext.userAnswer
 * @param {string} questionContext.explanation
 * @param {object} [questionContext.stimulusData]
 */
export function useAITutor(questionContext, options = {}) {
  const { isDemo = false } = options;
  const normalizedQuestionContext = useMemo(
    () => normalizeQuestionContext(questionContext),
    [questionContext],
  );
  const questionSessionKey = `${resolveQuestionId(normalizedQuestionContext) ?? ''}:${normalizedQuestionContext?.question ?? ''}`;
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null); // null | TUTOR_ERROR value

  // Tracks conversation history sent to the Edge Function (role/content only)
  const historyRef = useRef([]);

  const sendMessage = useCallback((userText) => {
    if (isStreaming) return;

    const userMessage = { role: 'user', content: userText };
    historyRef.current = [...historyRef.current, userMessage];

    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setStreamingContent('');
    setIsStreaming(true);
    setError(null);

    let accumulated = '';

    streamAITutor({
      ...normalizedQuestionContext,
      messages: historyRef.current,
      isDemo,
      onChunk: (chunk) => {
        accumulated += chunk;
        setStreamingContent(accumulated);
      },
      onDone: () => {
        const assistantMessage = { role: 'assistant', content: accumulated };
        historyRef.current = [...historyRef.current, assistantMessage];
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      onError: (err) => {
        const code = err?.code;
        if (
          code === TUTOR_ERROR.DAILY_LIMIT ||
          code === TUTOR_ERROR.LIFETIME_LIMIT ||
          code === TUTOR_ERROR.OFFLINE ||
          code === TUTOR_ERROR.TUTOR_DISABLED ||
          code === TUTOR_ERROR.DEMO_DISABLED
        ) {
          setError(code);
        } else {
          setError(TUTOR_ERROR.NETWORK);
        }
        // Remove the optimistic user message on error
        setMessages((prev) => prev.slice(0, -1));
        historyRef.current = historyRef.current.slice(0, -1);
        setIsStreaming(false);
      },
    });
  }, [isStreaming, normalizedQuestionContext, isDemo]);

  // Reset the session when the question changes (new question = fresh chat)
  useEffect(() => {
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setError(null);
    historyRef.current = [];
  }, [questionSessionKey]);

  const reset = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setError(null);
    historyRef.current = [];
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    sendMessage,
    reset,
  };
}
