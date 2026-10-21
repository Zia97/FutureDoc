import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import { buildOverallHistory, chartGeometry } from '../src/lib/coaching/progressHistory.js';
import { buildCoachProfile } from '../src/lib/coaching/engine.js';

const sections = ['vr', 'dm', 'qr', 'sj'];
const now = Date.parse('2026-10-21T23:00:00Z');
function row(section, index, earned = 1, date = '2026-10-01') {
  return { id: `${section}-${index}`, questionId: `${section}-${index}`, section, earned, possible: 1,
    answeredAt: `${date}T12:00:00Z`, mode: 'practice' };
}
const baseline = () => sections.flatMap((section) => Array.from({ length: 5 }, (_, i) => row(section, i)));

test('overall history weights four sections equally, preserves partial marks and groups days', () => {
  const rows = baseline().map((r) => ({ ...r, earned: r.section === 'vr' ? 0 : r.section === 'dm' ? 0.5 : 1 }));
  rows.push(...Array.from({ length: 15 }, (_, i) => row('vr', i + 5, 0)));
  assert.deepEqual(buildOverallHistory(rows, now), [{ date: '2026-10-01', accuracy: 63 }]);
});

test('a first attempt counts once across modes; retries and invalid or future evidence cannot inflate the line', () => {
  const rows = baseline();
  rows[0].earned = 0;
  const expected = buildOverallHistory(rows, now);
  assert.deepEqual(buildOverallHistory([...rows,
    { ...rows[0], id: 'retry', mode: 'timed', earned: 1, answeredAt: '2026-10-03T12:00:00Z' },
    { ...row('vr', 99), excluded: true },
    row('vr', 100, 1, '2027-01-01'),
    row('vr', 101, 1, 'invalid'),
    { ...row('vr', 102), earned: null },
  ], now), expected);
});

test('all historical marks contribute beyond twenty questions without resetting other sections', () => {
  const rows = baseline();
  rows.push(...Array.from({ length: 20 }, (_, i) => row('vr', i + 5, 0, '2026-10-02')));
  assert.deepEqual(buildOverallHistory(rows, now), [
    { date: '2026-10-01', accuracy: 100 }, { date: '2026-10-02', accuracy: 80 },
  ]);
});

test('early history uses the sections with recorded marks without inventing missing results', () => {
  assert.deepEqual(buildOverallHistory([row('vr', 1, 0)], now), [{ date: '2026-10-01', accuracy: 0 }]);
  assert.deepEqual(buildOverallHistory([
    row('vr', 1, 0), row('dm', 1, 1, '2026-10-02'),
  ], now), [{ date: '2026-10-01', accuracy: 0 }, { date: '2026-10-02', accuracy: 50 }]);
  assert.deepEqual(buildOverallHistory(baseline().slice(0, -1), now), [{ date: '2026-10-01', accuracy: 100 }]);
  assert.deepEqual(buildOverallHistory([], now), []);
  assert.equal(buildOverallHistory(baseline().map((r) => ({ ...r, earned: 0 })), now)[0].accuracy, 0);
});

test('coach graphs include recorded results from before the mini mock and need no baseline cutoff', () => {
  const rawEvidence = baseline().map((r) => ({ ...r, selectedAnswer: 'A', tag: {
    section: r.section, answer: 'A', options: ['A', 'B', 'C', 'D'], confidence: 'high', parentId: r.questionId,
  } }));
  const profile = buildCoachProfile({ catalogue: { skills: [], questions: [] }, rawEvidence,
    baselineCompletedAt: '2026-10-10T12:00:00Z', now });
  assert.deepEqual(profile.overallHistory, [{ date: '2026-10-01', accuracy: 100 }]);
  assert.ok(profile.runningSections.every((section) => section.questions === 0), 'The separate running section calculation keeps its existing cutoff');
  const withoutBaseline = buildCoachProfile({ catalogue: { skills: [], questions: [] }, rawEvidence, now });
  assert.deepEqual(withoutBaseline.overallHistory, profile.overallHistory);
});

test('the full timeline retains older data without a date-range filter', () => {
  const rows = baseline().map((r) => ({ ...r, answeredAt: '2025-01-01T12:00:00Z' }));
  rows.push(row('vr', 50, 0, '2026-10-01'));
  assert.deepEqual(buildOverallHistory(rows, now), [
    { date: '2025-01-01', accuracy: 100 }, { date: '2026-10-01', accuracy: 96 },
  ]);
});

test('graph geometry uses elapsed time and follows the actual marks, including zero and a single starting point', () => {
  const geometry = chartGeometry([
    { date: '2026-10-01', accuracy: 0 }, { date: '2026-10-02', accuracy: 50 }, { date: '2026-10-11', accuracy: 100 },
  ]);
  assert.equal(geometry.vertices[0].y, 156);
  assert.equal(geometry.vertices[2].y, 26);
  assert.ok(Math.abs(geometry.vertices[1].x - 87) < 0.001);
  assert.equal(geometry.distances.at(-1), geometry.length);
  assert.equal(chartGeometry([{ date: '2026-10-01', accuracy: 50 }]).length, 0);
  assert.deepEqual(chartGeometry([]).vertices, []);
});

test('changed JSX parses without diagnostics', () => {
  for (const file of ['src/components/coaching/CoachProgressChart.js', 'src/screens/coaching/CoachHubScreen.js']) {
    const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file.replace('.js', '.jsx'),
      reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } });
    assert.deepEqual(result.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error), [], file);
  }
});

// Exercise the entrance lifecycle with retained hook state. Native rendering
// still needs device review, but rerenders must never start a second animation.
function chartFixture(reduced = false) {
  const slots = [], pending = [], exports = {}, animations = [];
  let cursor = 0, focused = true, motionListener;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useId: () => 'chart-id',
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useMemo(fn) { return fn(); },
    useEffect(fn, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        pending.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: fn() }; });
      }
    },
  };
  class Value {
    constructor(value) { this.value = value; }
    setValue(value) { this.value = value; }
    interpolate(config) { return config; }
  }
  const source = ts.transpileModule(fs.readFileSync('src/components/coaching/CoachProgressChart.js', 'utf8'), {
    fileName: 'chart.jsx', compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(source, { exports, require(path) {
    if (path === 'react') return { ...react, default: react };
    if (path === 'react-native') return {
      Animated: { Value, createAnimatedComponent: (component) => component,
        timing(value, config) { const animation = { start() { animations.push(config); }, stop() {} }; return animation; } },
      AccessibilityInfo: { isReduceMotionEnabled: async () => reduced,
        addEventListener: (_name, listener) => { motionListener = listener; return { remove() {} }; } },
      Easing: { cubic: 'cubic', inOut: (fn) => fn }, Modal: 'Modal', StyleSheet: { absoluteFill: {} }, Pressable: 'Pressable', View: 'View',
    };
    if (path === '@react-navigation/native') return { useIsFocused: () => focused };
    if (path.endsWith('/progressHistory')) return { chartGeometry };
    if (path.endsWith('/CoachUI')) return { useCoachTheme: () => ({ colors: {} }) };
    if (path.endsWith('/premiumTheme')) return { hexToRgba: () => '' };
    return new Proxy({ ds: {}, default: 'Svg' }, { get: (target, key) => target[key] ?? key });
  } });
  return {
    animations,
    motion: (value) => motionListener(value),
    focus: (value) => { focused = value; },
    render(history) { cursor = 0; const tree = exports.default({ history }); while (pending.length) pending.shift()(); return tree; },
  };
}

test('the graph draws once and does not replay on identical refreshes, updated results or navigation', async () => {
  const f = chartFixture();
  const history = [{ date: '2026-10-01', accuracy: 50 }, { date: '2026-10-02', accuracy: 75 }];
  f.render(history);
  await new Promise((resolve) => setImmediate(resolve));
  f.render(history);
  assert.equal(f.animations.length, 1);
  assert.equal(f.animations[0].duration, 1400);
  f.render(structuredClone(history));
  f.render([...history, { date: '2026-10-03', accuracy: 80 }]);
  f.focus(false); f.render(history);
  f.focus(true); f.render(history);
  assert.equal(f.animations.length, 1);
});

test('reduced motion and a single starting point show static results', async () => {
  const history = [{ date: '2026-10-01', accuracy: 50 }, { date: '2026-10-02', accuracy: 75 }];
  const f = chartFixture(true), single = chartFixture();
  f.render(history); single.render(history.slice(0, 1));
  await new Promise((resolve) => setImmediate(resolve));
  f.render(history); single.render(history.slice(0, 1));
  assert.equal(f.animations.length, 0);
  assert.equal(single.animations.length, 0);
});
