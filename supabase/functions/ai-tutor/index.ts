import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAIProvider } from './providers/openai.ts';
import { AnthropicProvider } from './providers/anthropic.ts';
import { ChatMessage } from './providers/types.ts';
import { getSectionPrompt, buildQuestionContext } from './prompt.ts';

// ── Limits ────────────────────────────────────────────────────────────────────
const FREE_LIFETIME_LIMIT = 5;
// Premium users get unlimited access (no daily cap)

// Hard caps on what the client may send. Anything over these is rejected
// before the body is forwarded to the LLM, so a single user cannot rack up
// arbitrary token cost by sending huge payloads.
const MAX_BODY_BYTES        = 32 * 1024;   // 32 KB whole request
const MAX_PASSAGE_CHARS     = 8000;
const MAX_QUESTION_CHARS    = 4000;
const MAX_EXPLANATION_CHARS = 4000;
const MAX_STIMULUS_CHARS    = 8000;        // JSON-stringified stimulusData
const MAX_VENN_CHARS        = 4000;
const MAX_MESSAGE_CHARS     = 2000;        // per chat message
const MAX_MESSAGES          = 12;          // last N turns kept

function tooLong(field: string, value: unknown, max: number): boolean {
  if (value == null) return false;
  const len = typeof value === 'string'
    ? value.length
    : JSON.stringify(value).length;
  if (len > max) {
    console.warn(`[ai-tutor] reject: ${field} length ${len} > ${max}`);
    return true;
  }
  return false;
}

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
    'Access-Control-Allow-Headers': 'authorization, content-type, x-app-version, x-platform',
  };
}

// ── Version gate ─────────────────────────────────────────────────────────────
// Server-side enforcement of the min-supported app version. Mirrors the
// client-side appVersionGate.js check but cannot be bypassed by a modified
// build — without the X-App-Version header (or with a too-old one), the
// request is refused.

function parseVersion(v: string | null | undefined): number[] | null {
  if (typeof v !== 'string') return null;
  const parts = v.trim().split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) return null;
  return parts;
}

function versionLower(a: number[], b: number[]): boolean {
  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return true;
    if (a[i] > b[i]) return false;
  }
  return false;
}

const versionCache = new Map<string, { min: string; fetchedAt: number }>();
const VERSION_CACHE_TTL_MS = 60_000;

async function isAppVersionSupported(
  client: ReturnType<typeof createClient>,
  platform: string | null,
  appVersion: string | null,
): Promise<boolean> {
  // Permissive only when the client clearly isn't a UCAT Genius app build —
  // e.g. a non-mobile platform we never shipped to. Real builds always send
  // X-App-Version. Missing version on ios/android fails closed.
  if (!platform) return true;
  if (platform !== 'ios' && platform !== 'android') return true;

  const current = parseVersion(appVersion);
  if (!current) return false;

  const cached = versionCache.get(platform);
  let minVersion: string | undefined = cached?.min;
  if (!cached || Date.now() - cached.fetchedAt > VERSION_CACHE_TTL_MS) {
    const { data } = await client
      .from('app_version_requirements')
      .select('min_supported_version')
      .eq('platform', platform)
      .single();
    const fetched = data?.min_supported_version;
    if (typeof fetched === 'string') {
      minVersion = fetched;
      versionCache.set(platform, { min: fetched, fetchedAt: Date.now() });
    }
  }
  if (!minVersion) return true; // fail open if the row is missing

  const min = parseVersion(minVersion);
  if (!min) return true;
  return !versionLower(current, min);
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  console.log('[ai-tutor] env check — AI_PROVIDER:', Deno.env.get('AI_PROVIDER') ?? '(not set)', '| OPENAI_API_KEY present:', !!Deno.env.get('OPENAI_API_KEY'));

  // 0. Reject oversized requests before parsing the body. Content-Length is
  // a hint, not a guarantee, but it catches the obvious cost-amplification
  // case (gigantic stimulus / passage / messages payload).
  const declaredLen = Number(req.headers.get('Content-Length') ?? 0);
  if (declaredLen > MAX_BODY_BYTES) {
    return json({ error: 'payload_too_large', limit: MAX_BODY_BYTES }, 413);
  }

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

  // 1a. Server-side min-version gate. A modified build that strips the
  // client-side appVersionGate cannot bypass this — the request is refused
  // unless the X-App-Version header satisfies app_version_requirements.
  const platform   = req.headers.get('X-Platform');
  const appVersion = req.headers.get('X-App-Version');
  const versionOk  = await isAppVersionSupported(supabase, platform, appVersion);
  if (!versionOk) {
    return json({ error: 'app_update_required' }, 426);
  }

  // 1b. Global kill switch — disables the tutor for everyone (paid + demo).
  // Flip via Supabase Studio: UPDATE app_kill_switches SET enabled = false
  // WHERE key = 'ai_tutor_enabled'; takes effect within ~60–120s.
  const tutorEnabled = await isKillSwitchEnabled(supabase, 'ai_tutor_enabled', true);
  if (!tutorEnabled) {
    return json({ error: 'tutor_disabled' }, 503);
  }

  // 2. Parse body. Re-measure after parsing in case Content-Length lied,
  // and reject any individual field that's blown past its cap.
  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return json({ error: 'payload_too_large', limit: MAX_BODY_BYTES }, 413);
  }
  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
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
  } = parsed;

  if (
    tooLong('question', question, MAX_QUESTION_CHARS) ||
    tooLong('explanation', explanation, MAX_EXPLANATION_CHARS) ||
    tooLong('passage', passage, MAX_PASSAGE_CHARS) ||
    tooLong('stimulusData', stimulusData, MAX_STIMULUS_CHARS) ||
    tooLong('vennDiagrams', vennDiagrams, MAX_VENN_CHARS)
  ) {
    return json({ error: 'field_too_large' }, 413);
  }

  // Cap message history: keep at most the last MAX_MESSAGES turns and
  // truncate any single message to MAX_MESSAGE_CHARS. This protects against
  // a long-running chat being padded out into an expensive context window.
  const safeMessages: ChatMessage[] = Array.isArray(messages)
    ? messages
        .slice(-MAX_MESSAGES)
        .map((m) => ({
          role: m.role,
          content: typeof m.content === 'string'
            ? m.content.slice(0, MAX_MESSAGE_CHARS)
            : '',
        }))
        .filter((m) => m.content.length > 0)
    : [];

  if (safeMessages.length === 0) {
    return json({ error: 'no_messages' }, 400);
  }

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
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_premium, is_admin, ai_banned')
    .eq('user_id', user.id)
    .single();

  if (profile?.ai_banned) {
    return json({ error: 'account_restricted' }, 403);
  }

  // Unlimited access for RevenueCat subscribers OR admins
  const isPremium = !!(profile?.is_premium || profile?.is_admin);

  // 4. Enforce usage limits via the atomic increment_ai_usage RPC.
  // Returns -1 when the cap is hit, the new lifetime_count otherwise.
  // This closes the SELECT-then-UPSERT race on the free-tier limit.
  if (!isDemo) {
    const { data: incremented, error: incErr } = await supabase.rpc(
      'increment_ai_usage',
      {
        p_user_id:   user.id,
        p_limit:     FREE_LIFETIME_LIMIT,
        p_unlimited: isPremium,
      },
    );
    if (incErr) {
      console.error('[ai-tutor] increment_ai_usage failed:', incErr.message);
      return json({ error: 'usage_check_failed' }, 500);
    }
    if (incremented === -1) {
      return json({ error: 'lifetime_limit_reached', limit: FREE_LIFETIME_LIMIT }, 429);
    }
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
  const lastUserMsg = safeMessages.filter((m: ChatMessage) => m.role === 'user').pop();
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
    aiResponse = await provider.chat(systemPrompt, safeMessages);
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
