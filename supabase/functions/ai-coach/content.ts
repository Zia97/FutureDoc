import { LABEL_SETS } from '../../../src/constants/sjLabelSets.js';
import assessment from './assessment-v2.json' with { type: 'json' };
export { readCatalogue } from '../_shared/coaching-data.ts';

export const bases: Record<string, string> = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };
const assessmentQuestions = new Map(assessment.questions.map((q) => [q.id, q]));
export function selectAssessment(catalogue: any, evidence: any[]) {
  const seen = new Set(evidence.map((e) => e.questionId));
  const skills = new Set(catalogue.skills.map((skill: any) => skill.id));
  if (assessment.validation.status !== 'PASS' || assessmentQuestions.size !== 48 ||
    !['vr', 'dm', 'qr', 'sj'].every((section) => assessment.questions.filter((q) => q.section === section).length === 12) ||
    !assessment.questions.every((q) => q.tag.assessmentOnly && q.tag.source === assessment.id && skills.has(q.tag.primarySkillId))) {
    throw new Error('assessment_content_unavailable');
  }
  return { id: assessment.id, tags: assessment.questions.map((q) => ({ ...q.tag })),
    repeated: assessment.questions.filter((q) => seen.has(q.id)).length };
}

const sorted = (rows: any[]) => [...rows].sort((a, b) => a.order_index - b.order_index);
async function bankVersions(client: any) {
  const { data, error } = await client.from('content_versions').select('section,version');
  if (error) throw error;
  return Object.fromEntries(data.map((row: any) => [row.section, row.version]));
}
export async function loadQuestions(client: any, tags: any[]) {
  if (tags.some((tag) => tag.assessmentOnly)) {
    if (new Set(tags.map((tag) => tag.id)).size !== tags.length) throw new Error('content_changed');
    return tags.map((tag) => {
      const stored = assessmentQuestions.get(tag.id);
      if (!tag.assessmentOnly || !stored || tag.source !== assessment.id || tag.contentHash !== stored.tag.contentHash ||
        tag.section !== stored.section || tag.primarySkillId !== stored.tag.primarySkillId) throw new Error('content_changed');
      const question = JSON.parse(JSON.stringify(stored));
      question.tag.previouslySeen = tag.previouslySeen === true;
      return question;
    });
  }
  const before = await bankVersions(client);
  const output: any[] = [];
  for (const section of ['vr', 'dm', 'qr', 'sj']) {
    const chosen = tags.filter((t) => t.section === section);
    if (!chosen.length) continue;
    const base = bases[section];
    const relation = section === 'vr' ? 'passages' : section === 'qr' ? 'sets' : 'scenarios';
    const select = section === 'dm' ? '*,decision_making_question_options(*),decision_making_question_statements(*)' : `*,${base}_questions(*)`;
    const { data, error } = await client.from(section === 'dm' ? `${base}_questions` : `${base}_${relation}`).select(select).in('id', [...new Set(chosen.map((q) => q.parentId))]);
    if (error) throw error;
    const byParent = new Map(data.map((p: any) => [p.id, p]));
    for (const parentId of [...new Set(chosen.map((q) => q.parentId))]) {
      const parent: any = byParent.get(parentId);
      if (!parent) throw new Error('content_unavailable');
      const children = section === 'dm' ? [parent] : sorted(parent[`${base}_questions`]);
      if (children.length !== chosen.filter((q) => q.parentId === parentId).length) throw new Error('content_changed');
      for (const child of children) {
        const tag = chosen.find((q) => q.id === child.id);
        if (!tag) throw new Error('content_changed');
        const statements = sorted(child.decision_making_question_statements ?? []);
        if ((tag.answer ?? null) !== (child.correct_answer ?? null) || JSON.stringify(tag.statementAnswers ?? []) !== JSON.stringify(statements.map((s) => s.correct_answer))) throw new Error('content_changed');
        const options = section === 'dm' ? sorted(child.decision_making_question_options ?? []) : section === 'sj' ? LABEL_SETS[child.label_set as keyof typeof LABEL_SETS] : child.options;
        const dm = section === 'dm' ? { id: child.id, type: child.type, stem: child.stem, tableData: child.table_data,
          stimulusDiagram: child.stimulus_diagram, stimulusVennGeometry: child.venn_geometry, hideLabels: child.hide_labels,
          options: options.map((o: any) => ({ label: o.label, text: o.option_text, vennConfig: o.option_data, vennGeometry: o.venn_geometry })),
          statements: statements.map((s) => ({ text: s.statement_text })) } : null;
        output.push({ id: child.id, section, parentId, title: parent.title ?? '',
          context: section === 'vr' || section === 'sj' ? parent.body : null,
          text: child.question_text ?? '', stimulus: section === 'qr' ? parent.stimulus : null, dm,
          choices: (options ?? []).map((o: any) => typeof o === 'string' ? { value: o, label: o } : { value: o.label, label: `${o.label}. ${o.text ?? o.option_text ?? ''}` }),
          tag, explanation: child.answer_reason, statementReasons: statements.map((s) => s.answer_reason) });
      }
    }
  }
  if (output.length !== tags.length) throw new Error('content_unavailable');
  const after = await bankVersions(client);
  for (const question of output) {
    const bank = bases[question.section];
    if (before[bank] != null && before[bank] === after[bank]) question.bankVersion = after[bank];
  }
  return output;
}
