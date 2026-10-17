import { buildCoachProfile } from '../../../src/lib/coaching/engine.js';
import { readCatalogue, readEvidence } from './coaching-data.ts';

const unwrap = ({ data, error }: any) => { if (error) throw error; return data; };
const sections = ['vr', 'dm', 'qr', 'sj'];
const columns = 'id,source,created_at,section,question_id,question_type,skill_id,topic,question_text,user_text,assistant_text,teaching_skill,record_status';

// The user ID comes only from verified Auth, never from model arguments.
export async function readLearningHistory(client: any, userId: string, args: any = {}, size = 8) {
  if (args.source != null && !['tutor', 'coach'].includes(args.source)) return { error: 'invalid_source' };
  if (args.section != null && !sections.includes(args.section)) return { error: 'invalid_section' };
  const offset = Number.isInteger(args.offset) ? Math.max(0, Math.min(1000000, args.offset)) : 0;
  const limit = Math.max(1, Math.min(8, size));
  let query = client.from('ai_learning_history').select(columns).eq('user_id', userId);
  for (const field of ['source', 'section', 'skill_id', 'question_id']) {
    if (typeof args[field] === 'string') query = query.eq(field, args[field].slice(0, 120));
  }
  if (typeof args.query === 'string' && args.query.trim()) {
    query = query.ilike('search_text', `%${args.query.trim().slice(0, 100).replace(/[\\%_]/g, '\\$&')}%`);
  }
  const rows = unwrap(await query.order('created_at', { ascending: false }).order('id').range(offset, offset + limit));
  return { classification: 'conversations_not_performance', offset, nextOffset: rows.length > limit ? offset + limit : null,
    conversations: rows.slice(0, limit).map((row: any) => ({ ...row,
      user_text: row.user_text?.slice(0, 1500), assistant_text: row.assistant_text?.slice(0, 2400),
      question_text: row.question_text?.slice(0, 1200) })) };
}

export async function readSupportSummary(client: any, userId: string) {
  return unwrap(await client.rpc('ai_support_summary', { p_user: userId }));
}

// Optional memory must not make a tutor/coach response fail during a partial
// rollout or transient lookup failure. Missing memory is explicit to the model.
export async function readSharedLearningContext(client: any, userId: string, scope: any = {}) {
  const requests = [
    readSupportSummary(client, userId),
    readLearningHistory(client, userId, scope.section ? { source: 'tutor', section: scope.section, skill_id: scope.skillId ?? null } : {}, 4),
    ...(scope.section ? [readLearningHistory(client, userId, { source: 'coach' }, 2)] : []),
    ...(scope.questionId ? [readLearningHistory(client, userId, { source: 'tutor', question_id: scope.questionId }, 2)] : []),
  ];
  const results = await Promise.allSettled(requests);
  const summary = results[0].status === 'fulfilled' ? results[0].value : null;
  const history = results.slice(1).flatMap((r: any) => r.status === 'fulfilled' ? r.value.conversations ?? [] : []);
  const unique = [...new Map(history.map((row: any) => [row.id, row])).values()];
  return { supportSummary: summary ?? { available: false, classification: 'help_requests_not_performance' },
    recentConversations: unique,
    historyAvailable: results.slice(1).some((r) => r.status === 'fulfilled'),
    interpretation: 'Topic counts show engagement only, which may reflect curiosity, interest or debate. They do not establish a need for extra help. Read the student\'s words for an explicit support request; do not generalise discussion of one passage to section-wide difficulty. These conversations are not marks, measured weaknesses, diagnoses or proof of understanding.' };
}

export async function readTutorLearnerContext(client: any, userId: string, scope: any) {
  let performance: any = { available: false };
  let skillId: string | null = null;
  try {
    const [catalogue, rawEvidence, settings] = await Promise.all([
      readCatalogue(client), readEvidence(client, userId),
      (async () => unwrap(await client.from('coach_profiles').select('exam_date,baseline_session_id').eq('user_id', userId).maybeSingle()))(),
    ]);
    const baseline = settings?.baseline_session_id
      ? unwrap(await client.from('coach_sessions').select('completed_at').eq('id', settings.baseline_session_id).eq('user_id', userId).maybeSingle())
      : null;
    const tag = catalogue.questions.find((q: any) => q.id === scope.questionId && q.section === scope.section &&
      q.mode === (scope.isTimed ? 'timed' : 'practice') && !q.excludedReason && q.confidence !== 'low');
    skillId = tag?.primarySkillId ?? null;
    const profile = buildCoachProfile({ catalogue, rawEvidence, examDate: settings?.exam_date ?? null,
      baselineCompletedAt: baseline?.completed_at ?? null });
    const matching = profile.skills.filter((s: any) => skillId ? s.id === skillId : s.section === scope.section).slice(0, 5);
    performance = { available: true, source: 'saved_answers_and_timings', generatedAt: profile.generatedAt,
      examDate: settings?.exam_date ?? null, daysToExam: profile.daysToExam,
      assessmentCompleted: !!settings?.baseline_session_id, freshQuestions: profile.freshQuestions,
      section: profile.sections.find((s: any) => s.section === scope.section),
      runningSection: profile.runningSections.find((s: any) => s.section === scope.section) ?? null,
      relevantSkills: matching.map((s: any) => ({ id: s.id, label: s.label, questions: s.questions, sets: s.sets,
        accuracy: s.accuracy, confidence: s.confidence, stale: s.stale, medianSeconds: s.medianSeconds,
        practice: s.practice, timed: s.timed, trend: s.trend, timedTrend: s.timedTrend, tip: s.tip })),
      currentPlan: settings?.baseline_session_id ? profile.plan : [], dailyAdvice: profile.dailyAdvice };
  } catch { /* Teaching remains available when performance evidence cannot be read. */ }
  const shared = await readSharedLearningContext(client, userId, { ...scope, skillId });
  // Keep the initial prompt relevant. Older/cross-section topics are available
  // through the same history tool rather than copying the whole archive.
  if (shared.supportSummary?.topics) shared.supportSummary.topics = shared.supportSummary.topics.filter((t: any) => t.section === scope.section).slice(0, 8);
  return { performance, ...shared };
}
