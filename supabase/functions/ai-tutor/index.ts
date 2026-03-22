import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAIProvider } from './providers/openai.ts';
import { AnthropicProvider } from './providers/anthropic.ts';
import { ChatMessage } from './providers/types.ts';
import { getSectionPrompt, buildQuestionContext } from './prompt.ts';

// ── Limits ────────────────────────────────────────────────────────────────────
const FREE_LIFETIME_LIMIT = 3;
const PREMIUM_DAILY_LIMIT = 20;

// ── Provider factory ──────────────────────────────────────────────────────────
function getProvider() {
  const provider = Deno.env.get('AI_PROVIDER') ?? 'openai';
  if (provider === 'anthropic') {
    return new AnthropicProvider(Deno.env.get('ANTHROPIC_API_KEY') ?? '');
  }
  return new OpenAIProvider(Deno.env.get('OPENAI_API_KEY') ?? '');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  console.log('[ai-tutor] env check — AI_PROVIDER:', Deno.env.get('AI_PROVIDER') ?? '(not set)', '| OPENAI_API_KEY present:', !!Deno.env.get('OPENAI_API_KEY'));

  // 1. Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Unauthorized' }, 401);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', ''),
  );
  if (authError || !user) return json({ error: 'Unauthorized', detail: authError?.message ?? 'no user' }, 401);

  // 2. Parse body
  const {
    question,
    questionType,
    section,
    correctAnswer,
    userAnswer,
    explanation,
    stimulusData,
    vennDiagrams,
    messages,
  }: {
    question: string;
    questionType: string;
    section: string;
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
    stimulusData?: unknown;
    vennDiagrams?: string;
    messages: ChatMessage[];
  } = await req.json();

  // 3. Check subscription tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_premium')
    .eq('user_id', user.id)
    .single();

  const isPremium = profile?.is_premium ?? false;

  // 4. Enforce usage limits
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: usage } = await supabase
    .from('user_ai_usage')
    .select('lifetime_count, daily_count, daily_reset_at')
    .eq('user_id', user.id)
    .single();

  if (isPremium) {
    const resetNeeded = !usage || usage.daily_reset_at !== today;
    const currentDaily = resetNeeded ? 0 : (usage?.daily_count ?? 0);

    if (currentDaily >= PREMIUM_DAILY_LIMIT) {
      return json({ error: 'daily_limit_reached', limit: PREMIUM_DAILY_LIMIT }, 429);
    }

    // Upsert with reset if needed
    await supabase.from('user_ai_usage').upsert({
      user_id: user.id,
      daily_count: currentDaily + 1,
      daily_reset_at: today,
      lifetime_count: (usage?.lifetime_count ?? 0) + 1,
    });
  } else {
    const currentLifetime = usage?.lifetime_count ?? 0;

    if (currentLifetime >= FREE_LIFETIME_LIMIT) {
      return json({ error: 'lifetime_limit_reached', limit: FREE_LIFETIME_LIMIT }, 429);
    }

    await supabase.from('user_ai_usage').upsert({
      user_id: user.id,
      lifetime_count: currentLifetime + 1,
      daily_count: (usage?.daily_count ?? 0),
      daily_reset_at: usage?.daily_reset_at ?? today,
    });
  }

  // 5. Fetch user context (top struggles)
  const { data: context } = await supabase
    .from('user_ai_context')
    .select('struggles')
    .eq('user_id', user.id)
    .single();

  const struggles = context?.struggles ?? {};
  const topStruggles = Object.entries(struggles as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic, count]) => `${topic.replace(/_/g, ' ')} (asked ${count}x)`);

  // 6. Update struggle counter for this question type
  const updatedStruggles = {
    ...struggles,
    [questionType]: ((struggles as Record<string, number>)[questionType] ?? 0) + 1,
  };
  await supabase.from('user_ai_context').upsert({
    user_id: user.id,
    struggles: updatedStruggles,
    updated_at: new Date().toISOString(),
  });

  // 7. Build system prompt
  const systemPrompt = getSectionPrompt(section) + '\n\n' + buildQuestionContext({
    section,
    question,
    userAnswer,
    correctAnswer,
    explanation,
    stimulusData,
    vennDiagrams,
    topStruggles,
  });

  // 8. Call AI provider and stream response
  console.log('[ai-tutor] reaching provider, key present:', !!Deno.env.get('OPENAI_API_KEY'));
  const provider = getProvider();
  let aiResponse: Response;
  try {
    aiResponse = await provider.chat(systemPrompt, messages);
  } catch (err) {
    console.error('[ai-tutor] provider error:', err);
    return json({ error: 'provider_error', detail: String(err) }, 500);
  }

  const headers = new Headers(aiResponse.headers);
  for (const [k, v] of Object.entries(corsHeaders())) {
    headers.set(k, v);
  }

  return new Response(aiResponse.body, { headers });
});
