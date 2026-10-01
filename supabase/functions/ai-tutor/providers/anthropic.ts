import type { AIProvider, TutorRequest, TutorResult } from './types.ts';

/**
 * Legacy provider adapter retained as reference code. The tutor entry point no
 * longer imports it or selects providers through AI_PROVIDER; every live tutor
 * section uses OpenAI/GPT-6 Luna.
 */
export class AnthropicProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model = 'claude-haiku-4-5-20251001',
  ) {}

  async chat(request: TutorRequest): Promise<TutorResult> {
    const startedAt = Date.now();
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        stream: false,
        system: `${request.instructions}\n\n${request.questionContext}`,
        messages: request.messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      throw new Error(`Anthropic error ${upstream.status}: ${err}`);
    }

    const json = await upstream.json();
    const content = (json.content ?? [])
      .filter((item: { type?: string }) => item.type === 'text')
      .map((item: { text?: string }) => item.text ?? '')
      .join('')
      .trim();
    if (!content) throw new Error('Anthropic returned no tutor message.');

    return {
      content,
      diagnostics: {
        teachingSkill: null,
        misconception: null,
        recordStatus: 'consistent',
        recordConcern: null,
      },
      provider: 'anthropic',
      model: json.model ?? this.model,
      responseId: json.id ?? null,
      latencyMs: Date.now() - startedAt,
      toolCalls: 0,
      usage: {
        inputTokens: json.usage?.input_tokens ?? 0,
        cachedInputTokens: json.usage?.cache_read_input_tokens ?? 0,
        cacheWriteTokens: json.usage?.cache_creation_input_tokens ?? 0,
        outputTokens: json.usage?.output_tokens ?? 0,
        reasoningTokens: 0,
        estimatedCostUsd: 0,
      },
    };
  }
}
