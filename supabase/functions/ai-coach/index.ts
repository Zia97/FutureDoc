import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { profileHasPro, revenueCatHasPro } from '../../../src/lib/performance/access.js';
import { readEvidence } from '../_shared/coaching-data.ts';
import { readSharedLearningContext, readLearningHistory } from '../_shared/learner-memory.ts';
import { buildCoachProfile, buildSampleReport, buildSessionReport, initialProgress, normaliseEvidence, publicSession, selectGroups, sessionEvidence, validateProgress, validExamDate, SECTION_SECONDS, SECTION_NAMES } from '../../../src/lib/coaching/engine.js';
import { readCatalogue, selectAssessment, loadQuestions } from './content.ts';
import { coachReply } from './agent.ts';
import { compactCoachSession } from '../../../src/lib/coaching/contentTransport.js';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { headers, status });
const uuid = (v: unknown) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const unwrap = ({ data, error }: any) => { if (error) throw error; return data; };
async function proAccess(client: any, userId: string) {
  const profile = unwrap(await client.from('user_profiles').select('is_admin,is_premium,premium_expires_at').eq('user_id', userId).single());
  if (profile.is_admin) return true;
  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) return profileHasPro(profile);
  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, { headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('access_unavailable');
  return revenueCatHasPro((await response.json()).subscriber);
}
async function ensureProfile(client: any, userId: string) {
  const existing = unwrap(await client.from('coach_profiles').select('*').eq('user_id', userId).maybeSingle());
  if (existing) return existing;
  unwrap(await client.from('coach_profiles').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true }));
  return unwrap(await client.from('coach_profiles').select('*').eq('user_id', userId).single());
}
async function getSession(client: any, userId: string, id: string) {
  if (!uuid(id)) throw new Error('invalid_request');
  const result = unwrap(await client.from('coach_sessions').select('*').eq('id', id).eq('user_id', userId).maybeSingle());
  if (!result) throw new Error('session_not_found');
  return result;
}
const presentSession = (session: any, versions?: any) => compactCoachSession(publicSession(session), session.questions, versions);
const preparedSession = (row: any, versions?: any) => ({ ...presentSession({ ...row.session, id: row.id, status: 'active', version: 0 }, versions), previousSessionId: row.previous_session_id });

// Register a device-created session by its durable UUID. Only server content
// and grading are persisted; device-supplied answers are validated by save.
async function importDeviceSession(client: any, userId: string, body: any) {
  if (!uuid(body.id) || !['assessment', 'practice', 'review', 'timed_check'].includes(body.kind)
    || ![1, 1.25, 1.5].includes(body.timeMultiplier) || !Array.isArray(body.questionIds)
    || body.questionIds.length < 1 || body.questionIds.length > 48
    || new Set(body.questionIds).size !== body.questionIds.length) throw new Error('invalid_request');
  const existing = unwrap(await client.from('coach_sessions').select('*').eq('user_id', userId).eq('id', body.id).maybeSingle());
  if (existing) return publicSession(existing);
  const catalogue = await readCatalogue(client);
  let tags: any[];
  if (body.kind === 'assessment') {
    const form = selectAssessment(catalogue, []);
    if (body.formVersion !== form.id || JSON.stringify(body.questionIds) !== JSON.stringify(form.tags.map((tag: any) => tag.id))) throw new Error('content_changed');
    tags = form.tags;
  } else {
    tags = body.questionIds.map((id: string) => catalogue.questions.find((q: any) => q.id === id && q.mode === 'practice'));
    if (body.formVersion !== 'practice-v1' || tags.some((tag) => !tag || tag.excludedReason || tag.confidence === 'low')
      || tags.length > 20 || new Set(tags.map((tag) => tag.section)).size !== 1) throw new Error('invalid_request');
    // Keep complete parent groups, matching normal coaching selection.
    if (tags.some((tag) => catalogue.questions.some((q: any) => q.mode === 'practice' && q.section === tag.section
      && q.parentId === tag.parentId && !body.questionIds.includes(q.id)))) throw new Error('invalid_request');
  }
  if (!Array.isArray(body.contentHashes) || JSON.stringify(body.contentHashes) !== JSON.stringify(tags.map((tag) => tag.contentHash))) throw new Error('content_changed');
  const pro = body.kind === 'assessment' ? false : await proAccess(client, userId);
  const loaded = await loadQuestions(client, tags);
  const questions = body.questionIds.map((id: string) => loaded.find((q: any) => q.id === id));
  const budgets = Object.fromEntries([...new Set(questions.map((q: any) => q.section))].map((section: any) => [section,
    body.kind === 'assessment' ? Math.round(SECTION_SECONDS[section as keyof typeof SECTION_SECONDS] * body.timeMultiplier)
      : body.kind === 'timed_check' ? Math.round(SECTION_SECONDS[section as keyof typeof SECTION_SECONDS] / 12 * questions.length * body.timeMultiplier) : null]));
  const title = body.kind === 'assessment' ? 'Your starting assessment'
    : `${SECTION_NAMES[questions[0].section as keyof typeof SECTION_NAMES]} · ${body.kind === 'review' ? 'Mistake review' : body.kind === 'timed_check' ? 'Timed check' : 'Coached practice'}`;
  const created = unwrap(await client.rpc('coach_import_session', { p_user: userId, p_pro: pro, p_session: {
    id: body.id, kind: body.kind, title, form_version: body.formVersion, time_multiplier: body.timeMultiplier,
    questions, budgets, progress: initialProgress(),
  } }));
  return publicSession(created);
}

async function prepareNextSet(client: any, userId: string, id: string, versions?: any) {
  if (!uuid(id)) throw new Error('invalid_request');
  let previous: any;
  try { previous = await getSession(client, userId, id); }
  catch (error) {
    if ((error as Error).message !== 'session_not_found') throw error;
    const draft = unwrap(await client.from('coach_next_sets').select('*').eq('user_id', userId).eq('id', id).maybeSingle());
    if (!draft?.session) throw new Error('session_not_found');
    previous = { ...draft.session, id: draft.id };
  }
  if (previous.kind === 'assessment') throw new Error('invalid_request');
  if (!await proAccess(client, userId)) throw new Error('pro_required');
  const existing = unwrap(await client.from('coach_next_sets').select('*').eq('user_id', userId).eq('previous_session_id', id).is('claimed_at', null).maybeSingle());
  if (existing) return preparedSession(existing, versions);
  const [catalogue, rawEvidence, reserved, active] = await Promise.all([
    readCatalogue(client), readEvidence(client, userId),
    client.from('coach_next_sets').select('session').eq('user_id', userId).is('claimed_at', null).limit(50),
    client.from('coach_sessions').select('questions').eq('user_id', userId).eq('status', 'active'),
  ]);
  const section = previous.questions[0].section;
  const unavailable = [previous, ...unwrap(active), ...unwrap(reserved).map((row: any) => row.session)].flatMap((s: any) => s.questions)
    .map((q: any) => ({ section: q.section, questionId: q.id, mode: 'practice' }));
  const tags = selectGroups({ catalogue, section, evidence: [...normaliseEvidence(rawEvidence, catalogue), ...unavailable], seed: rawEvidence.length + unavailable.length });
  const questions = await loadQuestions(client, tags);
  const row = unwrap(await client.rpc('coach_prepare_next_set', { p_user: userId, p_previous: id, p_pro: true, p_session: {
    kind: 'practice', title: `${SECTION_NAMES[section as keyof typeof SECTION_NAMES]} · Coached practice`, form_version: 'practice-v1',
    time_multiplier: previous.time_multiplier, questions, budgets: { [section]: null }, progress: initialProgress(),
  } }));
  return preparedSession(row, versions);
}

async function finishPreviousSession(client: any, userId: string, previous: any) {
  if (!uuid(previous?.id) || previous?.progress?.phase !== 'finished') throw new Error('invalid_request');
  for (let attempt = 0; attempt < 3; attempt++) {
    const session = await getSession(client, userId, previous.id);
    if (session.status === 'completed') return;
    const progress = validateProgress(session, previous.progress);
    const finished = { ...session, progress, completed_at: new Date().toISOString() };
    const { error } = await client.rpc('coach_save_session', { p_user: userId, p_id: session.id, p_version: session.version,
      p_progress: progress, p_report: buildSessionReport(finished), p_evidence: sessionEvidence(finished) });
    if (!error) return;
    if (!String(error.message).includes('version_conflict') || attempt === 2) throw error;
  }
}

export async function handleCoach(req: Request, client: any) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'unauthorized' }, 401);
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return json({ error: 'unauthorized' }, 401);
  let body: any;
  try { const text = await req.text(); if (text.length > 75000) return json({ error: 'request_too_large' }, 413); body = JSON.parse(text); }
  catch { return json({ error: 'invalid_request' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.action !== 'string') return json({ error: 'invalid_request' }, 400);
  try {
    if (body.action === 'reset_progress') {
      if (body.confirm !== 'DELETE_COACHING_DATA') throw new Error('invalid_request');
      unwrap(await client.rpc('coach_reset_progress', { p_user: user.id }));
      return json({ ok: true });
    }
    if (Deno.env.get('COACH_ENABLED') === 'false') return json({ error: 'coach_unavailable' }, 503);
    const versions = body.contentVersions && typeof body.contentVersions === 'object' ? body.contentVersions : {};
    if (body.action === 'import_session') return json({ session: await importDeviceSession(client, user.id, body) });
    if (body.action === 'session') return json({ session: presentSession(await getSession(client, user.id, body.id), versions) });
    if (body.action === 'prepare_next') return json({ session: await prepareNextSet(client, user.id, body.id, versions) });
    if (body.action === 'save') {
      let session;
      try { session = await getSession(client, user.id, body.id); }
      catch (error) {
        if ((error as Error).message !== 'session_not_found' || !uuid(body.id)) throw error;
        const draft = unwrap(await client.from('coach_next_sets').select('*').eq('user_id', user.id).eq('id', body.id).maybeSingle());
        if (!draft?.session) throw error;
        if (body.version !== 0) throw new Error('version_conflict');
        validateProgress(draft.session, body.progress);
        if (!await proAccess(client, user.id)) throw new Error('pro_required');
        session = unwrap(await client.rpc('coach_activate_next_set', { p_user: user.id, p_id: body.id, p_pro: true }));
      }
      if (session.status === 'completed') return json({ session: publicSession(session) });
      if (!Number.isInteger(body.version) || body.version !== session.version) throw new Error('version_conflict');
      const progress = validateProgress(session, body.progress);
      const complete = progress.phase === 'finished';
      const finished = { ...session, progress, completed_at: new Date().toISOString() };
      const report = complete ? buildSessionReport(finished) : null;
      const saved = unwrap(await client.rpc('coach_save_session', { p_user: user.id, p_id: session.id, p_version: body.version,
        p_progress: progress, p_report: report, p_evidence: complete ? sessionEvidence(finished) : [] }));
      return json({ session: publicSession(saved) });
    }
    if (body.action === 'dev_sample') {
      const developer = unwrap(await client.from('user_profiles').select('is_admin').eq('user_id', user.id).single());
      if (!developer?.is_admin) return json({ error: 'forbidden' }, 403);
      const catalogue = await readCatalogue(client);
      const form = selectAssessment(catalogue, []);
      const questions = await loadQuestions(client, form.tags.map((tag: any) => ({ ...tag, previouslySeen: false })));
      return json({ report: buildSampleReport(questions), sample: true });
    }
    // Starting the next download must not send the student back to a set they
    // already finished locally while its background upload is still pending.
    if (['start', 'initial_plan'].includes(body.action) && body.previous) {
      if (body.action === 'start' && !['assessment', 'practice', 'review', 'timed_check'].includes(body.kind)) throw new Error('invalid_request');
      if (body.action === 'initial_plan' && body.previous.id !== body.id) throw new Error('invalid_request');
      await finishPreviousSession(client, user.id, body.previous);
    }
    const settings = await ensureProfile(client, user.id);
    if (body.action === 'initial_plan' || body.action === 'acknowledge_plan') {
      if (!settings.baseline_session_id) throw new Error('assessment_required');
      if (body.id !== settings.baseline_session_id) throw new Error('invalid_request');
      const baseline = await getSession(client, user.id, settings.baseline_session_id);
      if (baseline.status !== 'completed') throw new Error('assessment_required');
      if (body.action === 'acknowledge_plan') {
        unwrap(await client.from('coach_profiles').update({ plan_intro_session_id: baseline.id })
          .eq('user_id', user.id).eq('baseline_session_id', baseline.id));
        return json({ ok: true });
      }
      if (settings.plan_intro_session_id === baseline.id) return json({ seen: true });
      const catalogue = await readCatalogue(client);
      const profile = buildCoachProfile({ catalogue, rawEvidence: sessionEvidence(baseline),
        examDate: settings.exam_date, baselineCompletedAt: baseline.completed_at });
      return json({ seen: false, profile, report: baseline.report });
    }
    if (body.action === 'settings') {
      const examDate = body.examDate === undefined ? settings.exam_date : body.examDate;
      const timeMultiplier = body.timeMultiplier === undefined ? Number(settings.time_multiplier) : body.timeMultiplier;
      if (!validExamDate(examDate) || ![1, 1.25, 1.5].includes(timeMultiplier)) throw new Error('invalid_settings');
      unwrap(await client.from('coach_profiles').update({ exam_date: examDate, time_multiplier: timeMultiplier, updated_at: new Date().toISOString() }).eq('user_id', user.id));
      return json({ ok: true });
    }
    if (!['hub', 'start', 'chat'].includes(body.action)) throw new Error('invalid_request');
    let pro = false, reservation: any;
    if (body.action === 'chat') {
    if (!settings.baseline_session_id) throw new Error('assessment_required');
    if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 2000 || !uuid(body.requestId)) throw new Error('invalid_message');
    pro = await proAccess(client, user.id);
    reservation = unwrap(await client.rpc('coach_reserve_message', { p_user: user.id, p_request: body.requestId, p_text: body.text.trim(), p_pro: pro }));
    if (!reservation.reserved) {
      if (reservation.message.status === 'completed') return json({ message: reservation.message });
      // If a worker was terminated, return a durable fallback for that same request.
      if (Date.parse(reservation.message.created_at) > Date.now() - 120000) throw new Error('message_in_progress');
    }
    }
    const [catalogue, rawEvidence, hubPro] = await Promise.all([readCatalogue(client), readEvidence(client, user.id),
      body.action === 'hub' ? proAccess(client, user.id).catch(() => null) : Promise.resolve(null)]);
    const baseline = settings.baseline_session_id ? await getSession(client, user.id, settings.baseline_session_id) : null;
    const profile = buildCoachProfile({ catalogue, rawEvidence, examDate: settings.exam_date,
      baselineCompletedAt: baseline?.completed_at ?? null });
    if (body.action === 'hub' && hubPro !== true && baseline) {
      const initial = buildCoachProfile({ catalogue, rawEvidence: sessionEvidence(baseline), examDate: settings.exam_date,
        baselineCompletedAt: baseline.completed_at });
      // Progress remains accurate for everyone. Adaptive recommendations and
      // their reasons stay at the initial plan until Pro is active.
      profile.plan = initial.plan;
      profile.planSkills = initial.skills;
    }
    if (baseline) {
      if ((body.action !== 'hub' || hubPro === true) && profile.milestones.length) unwrap(await client.from('coach_milestones').upsert(profile.milestones.map((label: string) => ({ user_id: user.id,
        key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label })), { onConflict: 'user_id,key', ignoreDuplicates: true }));
      const earned = unwrap(await client.from('coach_milestones').select('key,label,earned_at').eq('user_id', user.id).order('earned_at'));
      profile.milestones = [...new Set([...profile.milestones, ...earned.map((m: any) => m.label)])];
    }
    if (body.action === 'hub') {
      const [active, history, chatCount] = await Promise.all([
        client.from('coach_sessions').select('id,title,kind').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
        client.from('coach_sessions').select('id,title,kind,report,completed_at').eq('user_id', user.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(20),
        client.from('coach_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('free_credit_used', true),
      ]);
      if (baseline && hubPro === true) unwrap(await client.from('coach_plans').upsert({ user_id: user.id, evidence_count: rawEvidence.length,
        plan_key: `${profile.generatedAt.slice(0, 10)}:${settings.exam_date ?? ''}:${settings.time_multiplier}`, profile }, { onConflict: 'user_id,evidence_count,plan_key', ignoreDuplicates: true }));
      return json({ settings, profile: baseline ? profile : null, baseline: baseline ? { id: baseline.id, report: baseline.report } : null,
        active: unwrap(active), history: unwrap(history), pro: hubPro, previewAvailable: !settings.preview_session_id,
        chatRemaining: hubPro ? null : Math.max(0, 5 - Number(settings.free_chat_used ?? 0) - (chatCount.count ?? 0)) });
    }
    if (body.action === 'start') {
      if (!['assessment', 'practice', 'review', 'timed_check'].includes(body.kind)) throw new Error('invalid_request');
      if (body.kind !== 'assessment' && !baseline) throw new Error('assessment_required');
      // Resume before content/entitlement checks: an earned session remains available.
      const active = unwrap(await client.from('coach_sessions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle());
      if (active) return json({ session: presentSession(active, versions) });
      if (body.kind === 'assessment' && baseline) return json({ session: publicSession(baseline) });
      const pro = body.kind === 'assessment' ? false : await proAccess(client, user.id);
      if (body.kind !== 'assessment' && !pro && settings.preview_session_id) throw new Error('pro_required');
      let tags: any[], formVersion: string, title: string;
      if (body.kind === 'assessment') {
        const form = selectAssessment(catalogue, rawEvidence);
        const seen = new Set(rawEvidence.map((e: any) => e.questionId));
        tags = form.tags.map((q: any) => ({ ...q, previouslySeen: seen.has(q.id) })); formVersion = form.id; title = 'Your starting assessment';
      } else {
        const skill = body.skillId ? catalogue.skills.find((s: any) => s.id === body.skillId) : null;
        if (body.skillId && !skill) throw new Error('invalid_skill');
        const section = skill?.section ?? body.section ?? profile.plan[0]?.section;
        if (!['vr', 'dm', 'qr', 'sj'].includes(section)) throw new Error('invalid_section');
        tags = selectGroups({ catalogue, section, evidence: normaliseEvidence(rawEvidence, catalogue),
          skillId: skill?.id, review: body.kind === 'review', seed: rawEvidence.length });
        formVersion = 'practice-v1'; title = `${SECTION_NAMES[section as keyof typeof SECTION_NAMES]} · ${body.kind === 'review' ? 'Mistake review' : body.kind === 'timed_check' ? 'Timed check' : skill?.label ?? 'Coached practice'}`;
      }
      const questions = await loadQuestions(client, tags);
      const budgets = Object.fromEntries([...new Set(questions.map((q: any) => q.section))].map((section: any) => {
        const seconds = SECTION_SECONDS[section as keyof typeof SECTION_SECONDS];
        return [section, body.kind === 'assessment' ? Math.round(seconds * settings.time_multiplier) : body.kind === 'timed_check' ? Math.round(seconds / 12 * questions.length * settings.time_multiplier) : null];
      }));
      const session = unwrap(await client.rpc('coach_start_session', { p_user: user.id, p_pro: pro, p_session: {
        kind: body.kind, title, form_version: formVersion, time_multiplier: settings.time_multiplier, questions, budgets, progress: initialProgress(),
      } }));
      return json({ session: presentSession(session, versions), previewAvailable: body.kind === 'assessment' || pro ? !settings.preview_session_id : false });
    }
    const recent = Array.isArray(body.history) ? body.history.slice(-12).flatMap((turn: any) => {
      if (!turn || typeof turn.user_text !== 'string') return [];
      return [{ user_text: turn.user_text.slice(0, 2000), assistant_text: typeof turn.assistant_text === 'string' ? turn.assistant_text.slice(0, 7000) : null }];
    }) : [];
    const retrieve = async (name: string, args: any) => {
      const offset = Number.isInteger(args.offset) ? Math.max(0, Math.min(1000000, args.offset)) : 0;
      if (name === 'get_learning_history') return await readLearningHistory(client, user.id, args);
      if (name === 'get_history') {
        const sorted = rawEvidence.filter((e: any) => !args.section || e.section === args.section).sort((a: any, b: any) => String(b.answeredAt).localeCompare(String(a.answeredAt)));
        return { total: sorted.length, offset, nextOffset: offset + 30 < sorted.length ? offset + 30 : null,
          attempts: sorted.slice(offset, offset + 30).map((e: any) => ({ date: e.answeredAt, section: e.section, mode: e.mode, kind: e.kind,
            skill: e.tag?.primarySkillId, selectedAnswer: e.selectedAnswer, statementIndex: e.statementIndex,
            grading: e.statementIndex == null ? normaliseEvidence([e], catalogue).map((r: any) => ({ earned: r.earned, possible: r.possible }))[0] ?? null : 'Individual statement record; see get_skill for whole-question marks',
            seconds: e.timeMs == null ? null : e.timeMs / 1000, interrupted: e.interrupted })) };
      }
      if (name === 'get_plan_history') {
        const rows = unwrap(await client.from('coach_plans').select('evidence_count,profile,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).range(offset, offset + 9));
        return { plans: rows.map((r: any) => ({ date: r.created_at, evidenceCount: r.evidence_count, plan: r.profile.plan, milestones: r.profile.milestones })), nextOffset: rows.length === 10 ? offset + 10 : null };
      }
      return { error: 'unsupported_tool' };
    };
    let reply: any = null;
    if (reservation.reserved) { try {
      const sharedLearning = await readSharedLearningContext(client, user.id);
      reply = await coachReply({ profile, baseline: baseline.report, text: body.text.trim(), history: recent, sharedLearning, retrieve });
    } catch { /* Evidence-based fallback; no failed model response is shown. */ } }
    const content = reply?.content ?? "I could not respond right now. Please try again in a moment.";
    const message = unwrap(await client.rpc('coach_complete_message', { p_user: user.id, p_request: body.requestId,
      p_assistant: content, p_success: !!reply, p_free_credit_used: !!reply && !pro,
      p_provider: reply?.provider ?? null, p_model: reply?.model ?? null, p_response_id: reply?.responseId ?? null,
      p_tool_calls: reply?.used?.length ?? 0,
      p_evidence: { profileVersion: profile.version, generatedAt: profile.generatedAt, tools: reply?.used ?? [], fallback: !reply } }));
    return json({ reply: content, requestId: message.request_id });
  } catch (err: any) {
    const code = err?.message ?? '';
    const known: Record<string, number> = { pro_required: 402, assessment_required: 409, assessment_already_completed: 409, version_conflict: 409, session_not_found: 404, previous_incomplete: 409, session_in_progress: 409,
      message_in_progress: 409, message_not_found: 404, message_already_completed: 409, daily_limit: 429, invalid_request: 400, invalid_settings: 400, invalid_message: 400,
      invalid_progress: 400, invalid_section: 400, invalid_skill: 400, invalid_time: 400, invalid_answer: 400,
      section_closed: 409, incomplete_assessment: 400, question_pool_exhausted: 409, assessment_content_unavailable: 503, content_changed: 503 };
    if (known[code]) return json({ error: code }, known[code]);
    console.error('ai-coach request failed', { action: body?.action, code: err?.code ?? 'unavailable' });
    return json({ error: 'coach_unavailable' }, 503);
  }
}

Deno.serve((req) => handleCoach(req, createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } })));
