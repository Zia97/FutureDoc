import { readAllPages as pages } from '../../../src/lib/performance/pagination.js';
import { createBoundedAsyncCache } from '../../../src/lib/boundedAsyncCache.js';

const catalogues = createBoundedAsyncCache({ maxEntries: 1, maxBytes: 12_000_000 });
const evidence = createBoundedAsyncCache({ maxEntries: 8, maxBytes: 8_000_000 });
export const readCatalogue = (client: any) => catalogues.get('catalogue', () => loadCatalogue(client));
async function loadCatalogue(client: any) {
  const [skills, questions] = await Promise.all([
    pages(() => client.from('performance_skills').select('id,section,metadata')),
    pages(() => client.from('performance_question_tags').select('id,section,mode,question_id,metadata')),
  ]);
  if (!skills.length || !questions.length) throw new Error('content_unavailable');
  return { skills: skills.map((s: any) => ({ ...s.metadata, id: s.id, section: s.section })),
    questions: questions.map((q: any) => ({ ...q.metadata, id: q.question_id, section: q.section, mode: q.mode })) };
}

export async function readEvidence(client: any, userId: string) {
  const { data: revision, error } = await client.rpc('coach_evidence_revision', { p_user: userId });
  if (error) throw error;
  return evidence.get(`${userId}:${revision}`, async () =>
    (await pages(() => client.from('coach_evidence').select('id,payload').eq('user_id', userId))).map((r: any) => r.payload));
}
