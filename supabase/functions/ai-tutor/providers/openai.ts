import { AIProvider, ChatMessage } from './types.ts';

export class OpenAIProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model = 'gpt-4o-mini',
  ) {}

  async chat(system: string, messages: ChatMessage[]): Promise<Response> {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      throw new Error(`OpenAI error ${upstream.status}: ${err}`);
    }

    const json = await upstream.json();
    const content = json.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
