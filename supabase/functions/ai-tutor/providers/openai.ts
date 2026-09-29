import type {
  AIProvider,
  TutorDiagnostics,
  TutorRequest,
  TutorResult,
  TutorUsage,
} from './types.ts';

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    content: {
      type: 'string',
      description: 'The concise explanation shown directly to the student.',
    },
    teaching_skill: {
      type: ['string', 'null'],
      description: 'The curriculum skill or technique used in the explanation.',
    },
    misconception: {
      type: ['string', 'null'],
      enum: [
        'misread_question',
        'outside_knowledge',
        'evidence_scope',
        'false_vs_cant_tell',
        'missed_negation',
        'reversed_implication',
        'quantifier_error',
        'incomplete_constraints',
        'probability_dependency',
        'irrelevant_argument',
        'wrong_operation',
        'percentage_base',
        'unit_conversion',
        'chart_reading',
        'premature_rounding',
        'professional_role',
        'patient_safety_priority',
        'over_escalation',
        'under_escalation',
        'confidentiality',
        'honesty',
        'rating_scale',
        'insufficient_evidence',
        'other',
        null,
      ],
      description: 'The best matching canonical misconception code, or null when one cannot be inferred.',
    },
    record_status: {
      type: 'string',
      enum: ['consistent', 'possible_error'],
      description: 'Whether the supplied answer and explanation are internally consistent.',
    },
    record_concern: {
      type: ['string', 'null'],
      description: 'A concrete, verifiable discrepancy only when record_status is possible_error.',
    },
  },
  required: [
    'content',
    'teaching_skill',
    'misconception',
    'record_status',
    'record_concern',
  ],
};

const CALCULATOR_TOOL = {
  type: 'function',
  name: 'calculate',
  description: 'Perform exact arithmetic for a Quantitative Reasoning explanation. Use this instead of mental arithmetic when a calculation affects the answer.',
  strict: true,
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {
      operation: {
        type: 'string',
        enum: [
          'sum',
          'product',
          'difference',
          'quotient',
          'percentage_of',
          'percentage_change',
          'power',
          'square_root',
          'round',
        ],
      },
      values: {
        type: 'array',
        items: { type: 'number' },
        minItems: 1,
        maxItems: 20,
      },
      decimal_places: {
        type: ['integer', 'null'],
        minimum: 0,
        maximum: 10,
      },
    },
    required: ['operation', 'values', 'decimal_places'],
  },
};

type OpenAIUsage = {
  input_tokens?: number;
  input_tokens_details?: {
    cached_tokens?: number;
    cache_write_tokens?: number;
  };
  output_tokens?: number;
  output_tokens_details?: { reasoning_tokens?: number };
};

type OpenAIOutputItem = {
  type?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  content?: Array<{ type?: string; text?: string }>;
  [key: string]: unknown;
};

type OpenAIResponse = {
  id?: string;
  model?: string;
  output?: OpenAIOutputItem[];
  usage?: OpenAIUsage;
};

function emptyUsage(): TutorUsage {
  return {
    inputTokens: 0,
    cachedInputTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    estimatedCostUsd: 0,
  };
}

function addUsage(total: TutorUsage, usage?: OpenAIUsage) {
  const inputTokens = usage?.input_tokens ?? 0;
  const cachedInputTokens = usage?.input_tokens_details?.cached_tokens ?? 0;
  const cacheWriteTokens = usage?.input_tokens_details?.cache_write_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const reasoningTokens = usage?.output_tokens_details?.reasoning_tokens ?? 0;
  const uncachedInputTokens = Math.max(
    0,
    inputTokens - cachedInputTokens - cacheWriteTokens,
  );

  total.inputTokens += inputTokens;
  total.cachedInputTokens += cachedInputTokens;
  total.cacheWriteTokens += cacheWriteTokens;
  total.outputTokens += outputTokens;
  total.reasoningTokens += reasoningTokens;

  // GPT-6 Luna Standard short-context rates, USD per 1M tokens.
  total.estimatedCostUsd += (
    (uncachedInputTokens * 0.10) +
    (cachedInputTokens * 0.01) +
    (cacheWriteTokens * 0.125) +
    (outputTokens * 0.50)
  ) / 1_000_000;
}

export function calculate(args: {
  operation: string;
  values: number[];
  decimal_places: number | null;
}): { result?: number; error?: string } {
  const values = Array.isArray(args.values) ? args.values : [];
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    return { error: 'Calculator values must be finite numbers.' };
  }

  let result: number;
  switch (args.operation) {
    case 'sum':
      result = values.reduce((total, value) => total + value, 0);
      break;
    case 'product':
      result = values.reduce((total, value) => total * value, 1);
      break;
    case 'difference':
      if (values.length !== 2) return { error: 'Difference requires two values.' };
      result = values[0] - values[1];
      break;
    case 'quotient':
      if (values.length !== 2) return { error: 'Quotient requires two values.' };
      if (values[1] === 0) return { error: 'Cannot divide by zero.' };
      result = values[0] / values[1];
      break;
    case 'percentage_of':
      if (values.length !== 2) return { error: 'Percentage-of requires [percentage, whole].' };
      result = (values[0] / 100) * values[1];
      break;
    case 'percentage_change':
      if (values.length !== 2) return { error: 'Percentage change requires [old, new].' };
      if (values[0] === 0) return { error: 'The old value cannot be zero.' };
      result = ((values[1] - values[0]) / values[0]) * 100;
      break;
    case 'power':
      if (values.length !== 2) return { error: 'Power requires [base, exponent].' };
      result = values[0] ** values[1];
      break;
    case 'square_root':
      if (values.length !== 1) return { error: 'Square root requires one value.' };
      if (values[0] < 0) return { error: 'Cannot take the real square root of a negative value.' };
      result = Math.sqrt(values[0]);
      break;
    case 'round': {
      if (values.length !== 1) return { error: 'Round requires one value.' };
      const places = args.decimal_places ?? 0;
      const factor = 10 ** places;
      result = Math.round((values[0] + Number.EPSILON) * factor) / factor;
      break;
    }
    default:
      return { error: 'Unsupported calculator operation.' };
  }

  if (!Number.isFinite(result)) return { error: 'Calculation did not produce a finite result.' };

  if (args.operation !== 'round' && args.decimal_places != null) {
    const factor = 10 ** args.decimal_places;
    result = Math.round((result + Number.EPSILON) * factor) / factor;
  }
  return { result };
}

function extractOutputText(response: OpenAIResponse): string {
  for (const item of response.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        return content.text;
      }
    }
  }
  return '';
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gpt-6-luna') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(request: TutorRequest): Promise<TutorResult> {
    const startedAt = Date.now();
    const usage = emptyUsage();
    let toolCalls = 0;
    let responseId: string | null = null;
    let returnedModel = this.model;

    const input: unknown[] = [
      {
        role: 'developer',
        content: [
          {
            type: 'input_text',
            text: request.instructions,
            prompt_cache_breakpoint: { mode: 'explicit' },
          },
        ],
      },
      {
        role: 'developer',
        content: [{ type: 'input_text', text: request.questionContext }],
      },
      ...request.messages.map((message) => ({
        role: message.role,
        // Simple string messages are compatible for both user and assistant
        // history. Typed input_text blocks are reserved for new input roles.
        content: message.content,
      })),
    ];

    const tools = request.section.toLowerCase() === 'qr'
      ? [CALCULATOR_TOOL]
      : [];

    for (let turn = 0; turn < 4; turn++) {
      const upstream = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          store: false,
          input,
          reasoning: { effort: 'medium' },
          text: {
            verbosity: 'low',
            format: {
              type: 'json_schema',
              name: 'ucat_tutor_response',
              strict: true,
              schema: RESPONSE_SCHEMA,
            },
          },
          max_output_tokens: 2048,
          // Only the stable teaching instructions are worth writing. The
          // question, learner history and chat suffix change every request.
          prompt_cache_options: { mode: 'explicit', ttl: '30m' },
          include: ['reasoning.encrypted_content'],
          parallel_tool_calls: false,
          ...(tools.length > 0 ? { tools } : {}),
        }),
      });

      if (!upstream.ok) {
        const err = await upstream.text();
        throw new Error(`OpenAI error ${upstream.status}: ${err}`);
      }

      const response = await upstream.json() as OpenAIResponse;
      responseId = response.id ?? responseId;
      returnedModel = response.model ?? returnedModel;
      addUsage(usage, response.usage);

      const calls = (response.output ?? []).filter(
        (item) => item.type === 'function_call' && item.name === 'calculate',
      );

      if (calls.length > 0) {
        toolCalls += calls.length;
        input.push(...(response.output ?? []));
        for (const call of calls) {
          let toolOutput: { result?: number; error?: string };
          try {
            toolOutput = calculate(JSON.parse(call.arguments ?? '{}'));
          } catch {
            toolOutput = { error: 'Calculator arguments were not valid JSON.' };
          }
          input.push({
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify(toolOutput),
          });
        }
        continue;
      }

      const outputText = extractOutputText(response);
      if (!outputText) throw new Error('OpenAI returned no tutor message.');

      const parsed = JSON.parse(outputText) as {
        content?: string;
        teaching_skill?: string | null;
        misconception?: string | null;
        record_status?: 'consistent' | 'possible_error';
        record_concern?: string | null;
      };
      if (!parsed.content?.trim()) throw new Error('OpenAI returned an empty tutor explanation.');

      const recordConcern = parsed.record_concern?.trim() || null;
      const hasVerifiableConcern = parsed.record_status === 'possible_error' && !!recordConcern;
      const diagnostics: TutorDiagnostics = {
        teachingSkill: parsed.teaching_skill?.trim() || null,
        misconception: parsed.misconception?.trim() || null,
        recordStatus: hasVerifiableConcern
          ? 'possible_error'
          : 'consistent',
        recordConcern: hasVerifiableConcern ? recordConcern : null,
      };

      return {
        content: parsed.content.trim(),
        diagnostics,
        provider: 'openai',
        model: returnedModel,
        responseId,
        latencyMs: Date.now() - startedAt,
        toolCalls,
        usage: {
          ...usage,
          estimatedCostUsd: Number(usage.estimatedCostUsd.toFixed(8)),
        },
      };
    }

    throw new Error('OpenAI exceeded the calculator tool-call limit.');
  }
}
