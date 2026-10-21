import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as sessionState from '../src/lib/coaching/sessionState.js';
import * as resultsView from '../src/lib/coaching/resultsView.js';
import * as scoring from '../src/lib/ucatScoring.js';
import * as sjScoring from '../src/lib/sjScoring.js';
import { LABEL_SETS } from '../src/constants/sjLabelSets.js';

const names = { vr: 'VR', dm: 'DM', qr: 'QR', sj: 'SJ' };
function sessionFor(section) {
  const choices = section === 'sj' ? ['Very appropriate', 'Appropriate', 'Inappropriate', 'Very inappropriate'] : ['First option', 'Second option'];
  const questions = [0, 1, 2].map((i) => ({ id: `${section}-${i}`, section, parentId: `parent-${i === 2 ? 1 : 0}`, title: `Saved set ${i === 2 ? 2 : 1}`,
    context: 'Original passage or scenario.', text: `Original question ${i + 1}`, explanation: `Original explanation ${i + 1}`,
    choices: choices.map((label, index) => ({ value: String.fromCharCode(65 + index), label })), answer: 'A', grade: { earned: i === 0 ? 1 : section === 'sj' && i === 1 ? 0.5 : 0, possible: 1 },
    stimulus: { type: 'table', columns: ['Year', 'Value'], rows: [['2026', '50']] },
    dm: section === 'dm' ? { type: 'logic_puzzle', stem: `Original DM stem ${i + 1}`, options: [{ label: 'A', text: 'First option' }, { label: 'B', text: 'Second option' }], statements: [] } : null,
  }));
  const answers = { [`${section}-0`]: 'A', [`${section}-1`]: 'B' };
  if (section === 'dm') {
    const correct = ['Yes', 'No', 'Yes', 'No', 'Yes'];
    questions[1].answer = correct; questions[1].grade = { earned: 1, possible: 2 };
    questions[1].statementReasons = correct.map((_, i) => `Statement reason ${i + 1}`);
    questions[1].dm = { type: 'syllogism', stem: 'A five-statement question', tableData: { columns: ['Fact'], rows: [['Original fact']] }, statements: correct.map((_, i) => ({ text: `Statement ${i + 1}` })) };
    answers['dm-1'] = Object.fromEntries(correct.map((answer, i) => [i, i ? answer : 'No']));
  }
  const earned = questions.reduce((sum, q) => sum + q.grade.earned, 0), possible = questions.reduce((sum, q) => sum + q.grade.possible, 0);
  return { id: 'saved-coach-set', kind: 'practice', status: 'active', title: 'Saved coached practice', questions,
    progress: { phase: 'finished', answers, flags: { [`${section}-1`]: true }, times: {}, elapsed: {} },
    report: { sections: [{ section, earned, possible, accuracy: Math.round(100 * earned / possible) }] } };
}

// Render the real coaching adapter and real completed timed-test screens.
// Replace only native views and leaf feedback/rendering components.
function fixture(session, { initialReview = false, isDark = false, multiplier = 1 } = {}) {
  const instances = new Map(), modules = new Map(); let current, lastTimed;
  const calls = { done: 0, continued: 0, plan: 0 };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const instance = current, index = current.index++;
      if (!(index in instance.slots)) instance.slots[index] = typeof initial === 'function' ? initial() : initial;
      return [instance.slots[index], (value) => { instance.slots[index] = typeof value === 'function' ? value(instance.slots[index]) : value; }];
    },
    useMemo: (fn) => fn(),
  };
  const native = new Proxy({ StyleSheet: { create: (value) => value }, Platform: { OS: 'web' } }, { get: (target, key) => target[key] ?? key });
  const components = new Proxy({ resultsStyles: { stemText: { fontSize: 16, lineHeight: 24 }, questionText: { fontSize: 16, lineHeight: 24 } } }, { get: (target, key) => target[key] ?? key });
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: `${file}x`, compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
    } });
    const errors = source.diagnostics?.filter((error) => error.category === ts.DiagnosticCategory.Error) ?? [];
    assert.equal(errors.length, 0);
    vm.runInNewContext(source.outputText, { exports, React: react, require(path) {
      if (path === 'react') return { ...react, default: react };
      if (path === 'react-native') return native;
      if (path === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView' };
      if (path.endsWith('ThemeContext')) return { useTheme: () => ({ isDark }) };
      if (path.endsWith('TextSizeContext')) return { useTextSize: () => ({ multiplier }) };
      if (path.endsWith('premiumTheme')) return { getPremiumTheme: () => ({ colors: { blue: 'blue', teal: 'teal', purple: 'purple', mint: 'mint' } }) };
      if (path.endsWith('sessionState')) return sessionState;
      if (path.endsWith('resultsView')) return resultsView;
      if (path.endsWith('ucatScoring')) return scoring;
      if (path.endsWith('sjScoring')) return sjScoring;
      if (path.endsWith('sjLabelSets')) return { LABEL_SETS };
      if (path.endsWith('PremiumResultsUI') || path.endsWith('PremiumPracticeUI') || path.endsWith('PerformanceUI') || path.endsWith('CoachUI')) return components;
      const timed = path.match(/Timed(VR|DM|QR|SJ)ResultsScreen$/);
      if (timed) return { default: load(`src/components/Timed${timed[1]}ResultsScreen.js`) };
      if (path.includes('attempts') || path.includes('Service') || path.includes('Queue')) assert.fail('Review must read frozen results without loading or saving attempts');
      return { default: path.split('/').at(-1) };
    } });
    modules.set(file, exports.default); return exports.default;
  }
  function render(component, props, key) {
    current = instances.get(key) ?? { index: 0, slots: [] }; instances.set(key, current); current.index = 0;
    return component(props);
  }
  const Coach = load('src/components/coaching/CoachAssessmentResults.js');
  const props = { session, initialReview, onDone: () => calls.done++, onContinue: session.kind === 'assessment' ? undefined : () => calls.continued++, onPlan: () => calls.plan++ };
  const coach = () => render(Coach, props, 'coach');
  return { calls, coach, load,
    timed(overrides) {
      const wrapper = coach(); assert.equal(typeof wrapper.type, 'function');
      if (lastTimed !== wrapper.type) instances.delete('timed');
      lastTimed = wrapper.type;
      return render(wrapper.type, { ...wrapper.props, ...overrides }, 'timed');
    },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
}
const all = (tree, type) => nodes(tree).filter((node) => node.type === type);
const find = (tree, type) => all(tree, type)[0];

for (const section of ['vr', 'dm', 'qr', 'sj']) test(`${section}: completed coaching reuses the timed results screen, breakdown and question review`, () => {
  const session = sessionFor(section), f = fixture(session, { initialReview: true, isDark: true, multiplier: 1.5 });
  const wrapper = f.coach();
  assert.equal(wrapper.type, f.load(`src/components/Timed${names[section]}ResultsScreen.js`));
  let tree = f.timed();
  assert.equal(find(tree, 'ResultsHeader').props.title, session.title);
  assert.equal(find(tree, 'ScoreOverviewCard').props.pct, session.report.sections[0].accuracy);
  assert.equal(find(tree, 'UcatScoreCard'), undefined, 'A small coached set must not create a full-test scaled estimate');
  const rows = all(tree, 'QuestionBreakdownRow');
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((row) => row.props.result), ['correct', ['dm', 'sj'].includes(section) ? 'partial' : 'incorrect', 'unanswered']);
  assert.equal(rows[1].props.flagged, true);
  find(tree, 'Button').props.onPress(); assert.equal(f.calls.plan, 1);
  all(tree, 'Button').find((button) => button.props.title === 'Continue with another set').props.onPress(); assert.equal(f.calls.continued, 1);
  rows[0].props.onPress(); tree = f.timed();
  assert.equal(find(tree, 'ReviewHeader').props.label, 'Q1');
  assert.equal(find(tree, 'ReviewNavBar').props.onPrev, null);
  if (section === 'dm') {
    assert.equal(find(tree, 'DMQuestionRenderer').props.question.stem, 'Original DM stem 1');
    assert.equal(find(tree, 'DMQuestionRenderer').props.answer, 'A');
    assert.equal(find(tree, 'DMQuestionRenderer').props.submitted, true);
  } else {
    const feedback = find(tree, 'FeedbackBox');
    assert.equal(feedback.props.reason, 'Original explanation 1');
    assert.equal(feedback.props.questionContext.isTimed, false, 'Coaching review retains its practice-bank identity');
    assert.equal(all(tree, 'AnswerOptionButton')[0].props.state, 'correct');
    if (section === 'qr') assert.deepEqual(find(tree, 'QRStimulusRenderer').props.stimulus, session.questions[0].stimulus);
  }
  find(tree, 'ReviewNavBar').props.onNext(); tree = f.timed();
  assert.equal(find(tree, 'ReviewHeader').props.label, 'Q2');
  if (section === 'sj') {
    assert.equal(find(tree, 'FeedbackBox').props.isPartial, true);
    assert.equal(all(tree, 'AnswerOptionButton')[1].props.state, 'partial');
  }
  if (section === 'dm') {
    const question = find(tree, 'DMQuestionRenderer').props.question;
    assert.equal(question.statements[0].answer, 'Yes');
    assert.equal(question.statements[0].reason, 'Statement reason 1');
    assert.deepEqual(question.tableData, session.questions[1].dm.tableData);
  }
  find(tree, 'ReviewNavBar').props.onNext(); tree = f.timed();
  assert.equal(find(tree, 'ReviewHeader').props.label, 'Q3');
  assert.equal(find(tree, 'ReviewNavBar').props.onNext, null);
  find(tree, 'ReviewHeader').props.onBack(); tree = f.timed();
  assert.ok(find(tree, 'ScoreOverviewCard'));
  find(tree, 'DoneBottomBar').props.onDone(); assert.equal(f.calls.done, 1);
});

test('the mini mock keeps its overall report and opens each section in the existing timed-test review', () => {
  const parts = ['vr', 'dm', 'qr', 'sj'].map(sessionFor);
  const session = { ...parts[0], kind: 'assessment', questions: parts.flatMap((part) => part.questions),
    progress: { ...parts[0].progress, answers: Object.assign({}, ...parts.map((part) => part.progress.answers)), flags: Object.assign({}, ...parts.map((part) => part.progress.flags)) },
    report: { sections: parts.flatMap((part) => part.report.sections) } };
  const f = fixture(session);
  assert.ok(find(f.coach(), 'SessionReport'));
  all(f.coach(), 'Button').find((button) => button.props.title === 'Review my answers').props.onPress();
  for (const section of ['vr', 'dm', 'qr', 'sj']) {
    const selector = f.coach().props.summaryContent;
    assert.equal(selector.type, 'Segments'); selector.props.onChange(section);
    assert.equal(f.coach().type, f.load(`src/components/Timed${names[section]}ResultsScreen.js`));
    assert.equal(all(f.timed(), 'QuestionBreakdownRow').length, 3);
  }
  find(f.timed(), 'DoneBottomBar').props.onDone();
  assert.ok(find(f.coach(), 'SessionReport'));
});

test('existing timed results retain their scaled-score cards and timed tutor context by default', () => {
  for (const section of ['vr', 'qr', 'sj']) {
    const f = fixture(sessionFor(section));
    let tree = f.timed({ showUcatScore: undefined, scoreSummary: undefined, isTimed: undefined });
    if (section !== 'sj') assert.ok(find(tree, 'UcatScoreCard'));
    else assert.ok(nodes(tree).some((node) => node.props?.children?.includes('UCAT SCORE')));
    find(tree, 'QuestionBreakdownRow').props.onPress();
    tree = f.timed({ showUcatScore: undefined, scoreSummary: undefined, isTimed: undefined });
    assert.equal(find(tree, 'FeedbackBox').props.questionContext.isTimed, true);
  }
});
