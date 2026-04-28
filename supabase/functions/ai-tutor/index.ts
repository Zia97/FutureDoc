import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAIProvider } from './providers/openai.ts';
import { AnthropicProvider } from './providers/anthropic.ts';
import { ChatMessage } from './providers/types.ts';
import { getSectionPrompt, buildQuestionContext } from './prompt.ts';

// ── Limits ────────────────────────────────────────────────────────────────────
const FREE_LIFETIME_LIMIT = 5;
// Premium users get unlimited access (no daily cap)

// ── Kill switches ─────────────────────────────────────────────────────────────
// In-memory cache for app_kill_switches reads. Edge Function instances are
// short-lived but shared across requests on a warm instance; a 60s TTL keeps
// flag flips visible within ~60–120s without hammering the DB on every call.
const KILL_SWITCH_TTL_MS = 60_000;
type KillSwitchCache = { value: boolean; fetchedAt: number };
const killSwitchCache = new Map<string, KillSwitchCache>();

async function isKillSwitchEnabled(
  client: ReturnType<typeof createClient>,
  key: string,
  defaultValue: boolean,
): Promise<boolean> {
  const cached = killSwitchCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < KILL_SWITCH_TTL_MS) {
    return cached.value;
  }
  const { data, error } = await client
    .from('app_kill_switches')
    .select('enabled')
    .eq('key', key)
    .single();
  if (error) {
    // Fail-open on lookup errors so a transient DB hiccup doesn't kill the
    // tutor for everyone. The 60s cache prevents a tight retry loop.
    console.warn(`[ai-tutor] kill switch lookup failed for ${key}:`, error.message);
    killSwitchCache.set(key, { value: defaultValue, fetchedAt: Date.now() });
    return defaultValue;
  }
  const value = data?.enabled ?? defaultValue;
  killSwitchCache.set(key, { value, fetchedAt: Date.now() });
  return value;
}

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

  // 1b. Global kill switch — disables the tutor for everyone (paid + demo).
  // Flip via Supabase Studio: UPDATE app_kill_switches SET enabled = false
  // WHERE key = 'ai_tutor_enabled'; takes effect within ~60–120s.
  const tutorEnabled = await isKillSwitchEnabled(supabase, 'ai_tutor_enabled', true);
  if (!tutorEnabled) {
    return json({ error: 'tutor_disabled' }, 503);
  }

  // 2. Parse body
  const {
    questionId,
    question,
    questionType,
    section,
    correctAnswer,
    userAnswer,
    explanation,
    passage,
    options,
    stimulusData,
    vennDiagrams,
    isTimed,
    isDemo,
    messages,
  }: {
    questionId?: string;
    question: string;
    questionType: string;
    section: string;
    correctAnswer: string;
    userAnswer: string;
    explanation: string;
    passage?: string;
    options?: string[];
    stimulusData?: unknown;
    vennDiagrams?: string;
    isTimed?: boolean;
    isDemo?: boolean;
    messages: ChatMessage[];
  } = await req.json();

  // 2b. Demo-only kill switch — disables only the in-lesson free demo while
  // paid users keep unlimited access. Flip via Studio: UPDATE
  // app_kill_switches SET enabled = false WHERE key = 'ai_tutor_demo_enabled'.
  if (isDemo) {
    const demoEnabled = await isKillSwitchEnabled(supabase, 'ai_tutor_demo_enabled', true);
    if (!demoEnabled) {
      return json({ error: 'demo_disabled' }, 503);
    }
  }

  // 3. Check subscription tier + admin status + ban status
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_premium, is_admin, ai_banned')
    .eq('user_id', user.id)
    .single();

  if (profile?.ai_banned) {
    return json({ error: 'account_restricted' }, 403);
  }

  // Unlimited access for RevenueCat subscribers OR admins
  const isPremium = !!(profile?.is_premium || profile?.is_admin);

  // 4. Enforce usage limits
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data: usage } = await supabase
    .from('user_ai_usage')
    .select('lifetime_count, daily_count, daily_reset_at')
    .eq('user_id', user.id)
    .single();

  // Demo messages from the in-lesson AI tutor sample don't deplete the free
  // lifetime quota and aren't gated by it. They still go through auth + ban
  // checks above and are still logged below.
  if (isDemo) {
    // no usage upsert
  } else if (isPremium) {
    // Premium users have unlimited AI Tutor access — just track usage for analytics
    await supabase.from('user_ai_usage').upsert({
      user_id: user.id,
      lifetime_count: (usage?.lifetime_count ?? 0) + 1,
      daily_count: (usage?.daily_count ?? 0) + 1,
      daily_reset_at: usage?.daily_reset_at ?? today,
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
    passage,
    options,
    stimulusData,
    vennDiagrams,
    topStruggles,
  });

  // 8. Log the user's message for abuse monitoring
  const lastUserMsg = messages.filter((m: ChatMessage) => m.role === 'user').pop();
  if (lastUserMsg?.content) {
    const { error: logError } = await supabase.from('ai_tutor_logs').insert({
      user_id: user.id,
      message: lastUserMsg.content.slice(0, 1000),
      section,
      question_id: questionId ?? null,
      is_timed: isTimed ?? false,
    });
    if (logError) {
      console.error('[ai-tutor] failed to insert log:', logError.message, logError.details);
    }
  }


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
