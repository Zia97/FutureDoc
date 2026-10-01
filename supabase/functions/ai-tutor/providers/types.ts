export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TutorRequest {
  /** Stable curriculum instructions. Providers should keep this first for caching. */
  instructions: string;
  /** Question-specific data which changes from one question to the next. */
  questionContext: string;
  messages: ChatMessage[];
  section: string;
}

export interface TutorDiagnostics {
  teachingSkill: string | null;
  misconception: string | null;
  recordStatus: 'consistent' | 'possible_error';
  recordConcern: string | null;
}

export interface TutorUsage {
  inputTokens: number;
  cachedInputTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  estimatedCostUsd: number;
}

export interface TutorResult {
  content: string;
  diagnostics: TutorDiagnostics;
  provider: string;
  model: string;
  responseId: string | null;
  latencyMs: number;
  toolCalls: number;
  usage: TutorUsage;
}

export interface AIProvider {
  chat(request: TutorRequest): Promise<TutorResult>;
}
