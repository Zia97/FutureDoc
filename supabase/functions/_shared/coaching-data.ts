import { readAllPages as pages } from '../../../src/lib/performance/pagination.js';

export async function readCatalogue(client: any) {
  const [skills, questions] = await Promise.all([
    pages(() => client.from('performance_skills').select('id,section,metadata')),
    pages(() => client.from('performance_question_tags').select('id,section,mode,question_id,metadata')),
  ]);
  if (!skills.length || !questions.length) throw new Error('content_unavailable');
  return { skills: skills.map((s: any) => ({ ...s.metadata, id: s.id, section: s.section })),
    questions: questions.map((q: any) => ({ ...q.metadata, id: q.question_id, section: q.section, mode: q.mode })) };
}

export const readEvidence = async (client: any, userId: string) =>
  (await pages(() => client.from('coach_evidence').select('id,payload').eq('user_id', userId))).map((r: any) => r.payload);
