import { AIProvider, ChatMessage } from './types.ts';

export class AnthropicProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model = 'claude-haiku-4-5-20251001',
  ) {}

  async chat(system: string, messages: ChatMessage[]): Promise<Response> {
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
        stream: true,
        system,
        messages,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      throw new Error(`Anthropic error ${upstream.status}: ${err}`);
    }

    // Normalize Anthropic SSE → our simple SSE format
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split('\n')) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const raw = trimmed.slice(5).trim();
              try {
                const json = JSON.parse(raw);
                if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
                  const out = `data: ${JSON.stringify({ content: json.delta.text })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(out));
                } else if (json.type === 'message_stop') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
