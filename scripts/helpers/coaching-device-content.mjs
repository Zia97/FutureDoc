import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import ts from 'typescript';
import * as engine from '../../src/lib/coaching/engine.js';
import * as transport from '../../src/lib/coaching/contentTransport.js';

const filename = path.resolve('src/lib/coaching/deviceContent.js');
export const deviceContent = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: deviceContent, require(specifier) {
  if (specifier.endsWith('.json')) return { default: JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename), specifier), 'utf8')) };
  if (specifier === './engine.js') return engine;
  if (specifier === './contentTransport.js') return transport;
  throw new Error(`Unexpected device content dependency: ${specifier}`);
} });

export function sampleDeviceBanks() {
  const sections = { vr: 'verbal_reasoning', dm: 'decision_making', qr: 'quantitative_reasoning', sj: 'situational_judgement' };
  return Object.fromEntries(Object.entries(sections).map(([section, key]) => {
    const { questions } = JSON.parse(fs.readFileSync(`src/data/performance/${section}-tags.json`, 'utf8'));
    const eligible = questions.filter((q) => q.mode === 'practice');
    const ids = [...new Set(eligible.filter((q) => !q.excludedReason && q.confidence !== 'low').map((q) => q.parentId))].slice(0, 12);
    const data = ids.map((id) => {
      const children = eligible.filter((q) => q.parentId === id).map((tag) => ({ id: tag.id, questionId: tag.id,
        questionText: 'Downloaded question', stem: 'Downloaded stem', options: tag.options ?? ['A', 'B', 'C', 'D'],
        labelSet: tag.labelSet, answer: tag.answer, answeringReason: 'Downloaded explanation',
        statements: (tag.statementAnswers ?? []).map((answer) => ({ text: 'Downloaded statement', answer, reason: 'Downloaded reason' })),
      }));
      return section === 'dm' ? children[0] : { id, title: 'Downloaded parent', resource: 'Downloaded passage',
        stimulus: { type: 'text', text: 'Downloaded data' }, questions: children };
    });
    return [key, { version: 1, data }];
  }));
}
