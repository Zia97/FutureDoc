import { useState, useCallback, useRef } from 'react';
import { streamAITutor } from '../services/aiTutor';

export const TUTOR_ERROR = {
  DAILY_LIMIT: 'daily_limit_reached',
  LIFETIME_LIMIT: 'lifetime_limit_reached',
  NETWORK: 'network_error',
};

/**
 * Manages AI tutor chat state for a single question session.
 *
 * @param {object} questionContext - passed straight to the Edge Function
 * @param {string} questionContext.question
 * @param {string} questionContext.questionType
 * @param {string} questionContext.section
 * @param {string} questionContext.correctAnswer
 * @param {string} questionContext.userAnswer
 * @param {string} questionContext.explanation
 * @param {object} [questionContext.stimulusData]
 */
export function useAITutor(questionContext) {
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
      ...questionContext,
      messages: historyRef.current,
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
        if (code === TUTOR_ERROR.DAILY_LIMIT || code === TUTOR_ERROR.LIFETIME_LIMIT) {
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
  }, [isStreaming, questionContext]);

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
