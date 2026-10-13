import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildPerformanceReport } from '../../../src/lib/performance/engine.js';
import { profileHasPro, revenueCatHasPro } from '../../../src/lib/performance/access.js';
import { readAllPages as pages } from '../../../src/lib/performance/pagination.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const sections = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };

// This worker cache holds only question metadata. Anonymous cohort distributions
// have a separate database cache; personal reports remain request-local.
let catalogueCache: { at: number; value: any } | null = null;

async function catalogue(client: any) {
  if (catalogueCache && Date.now() - catalogueCache.at < 60000) return catalogueCache.value;
  const [skills, questions] = await Promise.all([
    pages(() => client.from('performance_skills').select('id, section, metadata')),
    pages(() => client.from('performance_question_tags').select('id, section, mode, question_id, metadata')),
  ]);
  if (!skills.length || !questions.length) throw new Error('performance_content_not_ready');
  const value = {
    skills: skills.map((s) => ({ ...s.metadata, id: s.id, section: s.section })),
    questions: questions.map((q) => ({ ...q.metadata, id: q.question_id, section: q.section, mode: q.mode })),
  };
  catalogueCache = { at: Date.now(), value };
  return value;
}

async function hasPro(client: any, userId: string) {
  const { data: profile, error } = await client.from('user_profiles')
    .select('is_admin,is_premium,premium_expires_at').eq('user_id', userId).single();
  if (error) throw error;
  if (profile?.is_admin) return true;
  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) return profileHasPro(profile);
  // Server verification also covers an immediately purchased/restored/trial
  // entitlement before its webhook has updated the Supabase mirror.
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('entitlement_check_unavailable');
  return revenueCatHasPro((await response.json()).subscriber);
}

async function readAttempts(client: any, userId: string, cutoff: string) {
  const practicePromise = pages(() => client.from('practice_question_attempts')
    .select('id,section,question_id,statement_index,selected_answer,is_correct,time_spent_ms,answered_at')
    .eq('user_id', userId).lte('answered_at', cutoff));
  const timedPromises = Object.entries(sections).map(async ([section, table]) => {
    const exams = await pages(() => client.from(`timed_${table}_exam_attempts`)
      .select('id,test_id,submitted_at').eq('user_id', userId).lte('submitted_at', cutoff));
    if (!exams.length) return [];
    const byId = new Map(exams.map((exam) => [exam.id, exam]));
    const answers = await pages(() => client.from(`timed_${table}_question_answers`)
      .select('id,exam_attempt_id,question_id,selected_answer,time_ms').eq('user_id', userId));
    return answers.filter((a) => byId.has(a.exam_attempt_id)).map((a) => ({
      id: a.id, section, mode: 'timed', questionId: a.question_id,
      selectedAnswer: a.selected_answer, timeMs: a.time_ms,
      answeredAt: byId.get(a.exam_attempt_id).submitted_at, testId: byId.get(a.exam_attempt_id).test_id,
    }));
  });
  const [practice, ...timed] = await Promise.all([practicePromise, ...timedPromises]);
  return [
    ...practice.map((a) => ({ id: a.id, section: a.section, mode: 'practice', questionId: a.question_id,
      statementIndex: a.statement_index, selectedAnswer: a.selected_answer, isCorrect: a.is_correct,
      timeMs: a.time_spent_ms, answeredAt: a.answered_at })),
    ...timed.flat(),
  ];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'unauthorized' }, 401);
  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return json({ error: 'unauthorized' }, 401);
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 1024) return json({ error: 'request_too_large' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'invalid_request' }, 400); }
  if (!['practice', 'timed', 'all'].includes(body?.mode)) return json({ error: 'invalid_mode' }, 400);
  try {
    const now = Date.now();
    const [content, attempts, pro, cohortResult] = await Promise.all([
      catalogue(client), readAttempts(client, user.id, new Date(now).toISOString()),
      body.includeDetails === true ? hasPro(client, user.id) : Promise.resolve(false),
      client.rpc('get_performance_cohort'),
    ]);
    // A temporarily unavailable cohort must not hide the student's own report.
    const cohort = cohortResult.error ? null : cohortResult.data;
    const build = (mode: string) => buildPerformanceReport({ catalogue: content, attempts, cohort, mode, isPro: pro, now });
    if (body.mode === 'all') return json({ snapshotVersion: 1, reports: { practice: build('practice'), timed: build('timed') } });
    // Older app builds can keep requesting a single mode during rollout.
    return json(build(body.mode));
  } catch (err) {
    // No response payloads, credentials or student answers in logs/errors.
    console.error('performance-analysis failed', err instanceof Error ? err.message : 'database request failed');
    return json({ error: 'analysis_unavailable' }, 503);
  }
});
