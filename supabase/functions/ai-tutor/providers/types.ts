export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  /**
   * Send a chat request and return a Response that streams
   * normalized SSE chunks in the shape: data: {"content":"..."}\n\n
   * Terminated with:                    data: [DONE]\n\n
   */
  chat(system: string, messages: ChatMessage[]): Promise<Response>;
}
