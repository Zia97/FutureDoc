import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as state from '../src/lib/coaching/sessionState.js';
import * as engine from '../src/lib/coaching/engine.js';
import * as coachAccess from '../src/lib/coaching/access.js';
import * as view from '../src/lib/coaching/assessmentView.js';
import { UCAT_SECTIONS } from '../src/constants/sectionVisuals.js';

const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const native = new Proxy({ StyleSheet: { create: (styles) => styles }, ActivityIndicator: 'ActivityIndicator',
  Alert: { alert() {} }, AppState: { addEventListener: () => ({ remove() {} }) },
}, { get: (target, key) => target[key] ?? key });
const ui = new Proxy({ useCoachTheme: () => ({ colors: {} }) }, { get: (target, key) => target[key] ?? key });

// Keep the actual session controller and adapter, replacing native views only.
function fixture(section = 'vr', kind = 'practice', phase = 'paused') {
  let now = 100000, current, component, appStateListener, removalGuard;
  const modules = new Map(), instances = new Map(), checkpoints = [], requests = [], timers = [], cleanups = [], navigationCalls = [], preparations = [];
  const settings = { offline: false, subscription: { isPro: true, customerInfo: { entitlements: { active: { 'UCAT Genius AI Pro': { expirationDate: '2100-01-01T00:00:00Z' } } } } } };
  const session = { id: 'saved-session', version: 0, kind, status: 'active', title: 'Saved practice',
    budgets: { [section]: kind === 'assessment' || kind === 'timed_check' ? 90 : null },
    progress: { ...engine.initialProgress(), phase, index: 1, elapsed: { [section]: 12000 },
      answers: { [`${section}-0`]: 'A' }, flags: { [`${section}-1`]: true } },
    questions: [0, 1].map((i) => ({ id: `${section}-${i}`, section, parentId: `${section}-parent`, title: 'Saved question',
      context: 'Original passage or scenario', text: 'Original question', stimulus: { type: 'text', text: 'Original data' },
      choices: [{ value: 'A', label: 'A. One' }, { value: 'B', label: 'B. Two' }],
      dm: section === 'dm' ? { type: 'syllogism', stem: 'Original stem', statements: [{ text: 'First statement' }, { text: 'Second statement' }] } : null,
    })),
  };
  session.offlineScoring = Object.fromEntries(session.questions.map((q) => [q.id, {
    tag: { section, parentId: q.parentId, answer: 'A', options: ['A', 'B'],
      ...(section === 'dm' ? { statementAnswers: ['Yes', 'No'] } : {}) }, explanation: 'Original explanation',
  }]));
  const slot = (initial) => {
    const i = current.index++;
    if (!(i in current.slots)) current.slots[i] = initial;
    return i;
  };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const instance = current;
      const i = slot(typeof initial === 'function' ? initial() : initial);
      return [instance.slots[i], (next) => { instance.slots[i] = typeof next === 'function' ? next(instance.slots[i]) : next; }];
    },
    useRef(initial) { return current.slots[slot({ current: initial })]; },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useMemo(fn, deps) {
      const i = current.index++, previous = current.slots[i];
      if (!previous || deps.some((value, index) => !Object.is(value, previous.deps[index]))) {
        current.slots[i] = { deps, value: fn() };
      }
      return current.slots[i].value;
    },
    useEffect(fn, deps) {
      const i = current.index++, previous = current.slots[i];
      if (!previous || deps.some((value, index) => !Object.is(value, previous[index]))) {
        current.slots[i] = deps;
        current.effects.push(fn);
      }
    },
  };
  const service = {
    startCoachSession: async (_user, _kind, _focus, subscription) => {
      coachAccess.assertCoachProAccess(subscription);
      preparations.push(session.id);
      const next = settings.prepare ? await settings.prepare() : settings.next;
      return { session: state.resumeUntimedSession(next) };
    },
    prepareCoachNextSet: async (_user, previous) => { preparations.push(previous.id); return settings.prepare ? settings.prepare() : settings.next ?? null; },
    takeCoachNextSet: (_user, _id, subscription) => { coachAccess.assertCoachProAccess(subscription); const ready = settings.next; settings.next = null; return ready ? state.resumeUntimedSession(ready) : null; },
    registerCoachSession: () => () => {},
    readCoachSessionCache: async () => ({ session: structuredClone(session), dirty: false }),
    loadCoachSession: async () => settings.noCache && settings.load ? settings.load() : ({ session: structuredClone(session), dirty: false }),
    saveCoachCheckpoint: async (_user, next, dirty) => checkpoints.push({ session: structuredClone(next), dirty }),
    saveCoachSession: async (user, snapshot) => service.coachRequest(user, 'save', { id: snapshot.id, version: snapshot.version, progress: snapshot.progress }),
    coachRequest: async (_user, action, payload) => {
      requests.push({ action, payload: structuredClone(payload) });
      if (settings.offline) throw new Error('Offline');
      if (settings.save) await settings.save();
      assert.equal(action, 'save');
      return { session: { ...session, progress: structuredClone(payload.progress), version: payload.version + 1,
        status: payload.progress.phase === 'finished' ? 'completed' : 'active', report: { sections: [] } } };
    },
  };
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: `${file}x`, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
    }).outputText;
    vm.runInNewContext(source, { exports, console, Date: class extends Date { static now() { return now; } },
      setInterval: (fn) => { timers.push(fn); return timers.length; }, clearInterval() {},
      require(path) {
        if (path === 'react') return { ...react, default: react };
        if (path === 'react-native') return { ...native, AppState: { currentState: 'active', addEventListener: (_event, listener) => {
          appStateListener = listener; return { remove() {} };
        } } };
        if (path === '@react-navigation/native') return { usePreventRemove: (enabled, listener) => { removalGuard = { enabled, listener }; } };
        if (path.endsWith('SubscriptionContext')) return { useSubscription: () => settings.subscription };
        if (path.endsWith('/coaching/access')) return coachAccess;
        if (path.endsWith('AuthContext')) return { useAuth: () => ({ user: { id: 'alice' } }) };
        if (path.endsWith('NetworkContext')) return { useNetwork: () => ({ isOnline: !settings.offline }) };
        if (path.endsWith('ThemeContext')) return { useTheme: () => ({ isDark: false }) };
        if (path.endsWith('premiumTheme')) return { getPremiumTheme: () => ({ colors: {} }) };
        if (path.endsWith('coachingService')) return service;
        if (path.endsWith('sessionState')) return state;
        if (path.endsWith('/engine')) return engine;
        if (path.endsWith('assessmentView')) return view;
        if (path.endsWith('sectionVisuals')) return { UCAT_SECTIONS };
        if (path.endsWith('useSwipeGesture')) return { useSwipeGesture: () => ({}) };
        if (path.endsWith('useTestTimer')) return { isTestTimerUrgent: (seconds) => seconds < 30 };
        if (path.endsWith('CoachQuestionSession')) return { default: load('src/components/coaching/CoachQuestionSession.js') };
        if (path.endsWith('CoachUI') || path.endsWith('PremiumQuestionScreenUI')) return ui;
        if (path.startsWith('../../hooks/attempts') || path.includes('AttemptQueue')) assert.fail('Coaching must not write duplicate practice attempts');
        return { default: path.split('/').at(-1) };
      },
    });
    modules.set(file, exports.default);
    return exports.default;
  }
  const root = load('src/screens/coaching/CoachSessionScreen.js');
  const navigation = { goBack() {}, popTo() {}, replace: (...args) => navigationCalls.push(['replace', ...args]), navigate: (...args) => navigationCalls.push(['navigate', ...args]) };
  function render(fn, props, key) {
    current = instances.get(key) ?? { slots: [], index: 0, effects: [] };
    instances.set(key, current); current.index = 0; current.effects = [];
    const tree = fn(props);
    current.effects.forEach((fn) => { const cleanup = fn(); if (typeof cleanup === 'function') cleanups.push(cleanup); });
    return tree;
  }
  return { session, settings, requests, checkpoints, navigationCalls, preparations,
    async ready() { this.controller(); await tick(); },
    controller() { return component = render(root, { route: { params: { id: session.id, ...settings.routeParams } }, navigation }, 'root'); },
    question() { this.controller(); return render(component.type, component.props, 'question'); },
    advance(ms) { now += ms; timers[0](); },
    autosave() { return timers[1](); },
    unmount() { cleanups.forEach((cleanup) => cleanup()); },
    appState(next) { appStateListener(next); },
    removalGuard() { return removalGuard; },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
}
const find = (tree, type) => nodes(tree).find((node) => node.type === type);

test('resumed practice, review and timed sessions use the existing question UI in every section', async () => {
  for (const section of ['vr', 'dm', 'qr', 'sj']) for (const kind of ['practice', 'review', 'timed_check']) {
    const f = fixture(section, kind); await f.ready();
    const opened = f.question();
    assert.equal(opened.type, 'PremiumQuestionScaffold');
    if (kind === 'timed_check') find(opened, 'PremiumPauseModal').props.onResume();
    else assert.equal(find(opened, 'PremiumPauseModal'), undefined);
    const tree = f.question(), panel = find(tree, 'TimedQuestionPanel');
    assert.equal(panel.props.section, section);
    assert.equal(panel.props.flagged, true);
    assert.equal(panel.props.text, 'Original question');
    assert.ok(find(tree, 'ScreenNavBar'));
    assert.ok(find(tree, 'BottomToolbar'));
    assert.ok(find(tree, 'TestNavigatorModal'));
    assert.equal(find(tree, 'QuestionTopBar').props.timerDisplay, kind === 'timed_check' ? '1:18' : undefined);
    assert.equal(find(tree, 'ScreenNavBar').props.report.isTimed, false, 'Coached questions come from the practice bank');
    const value = section === 'dm' ? { 0: 'Yes', 1: 'No' } : 'B';
    panel.props.onAnswer(value);
    assert.deepEqual(f.controller().props.session.progress.answers[`${section}-1`], value);
    assert.equal(f.controller().props.session.progress.answers[`${section}-0`], 'A');
    assert.equal(f.controller().props.session.progress.index, 1, 'Resume keeps the saved question position');
  }
});

test('new planned questions open directly with background timing and no practice pause controls', async () => {
  const f = fixture('qr', 'practice', 'instructions'); await f.ready();
  const tree = f.question();
  assert.equal(tree.type, 'PremiumQuestionScaffold');
  assert.equal(find(tree, 'PremiumInstructionScreen'), undefined);
  assert.equal(find(tree, 'PrimaryQuestionButton'), undefined);
  assert.ok(find(tree, 'TimedQuestionPanel'));
  const toolbar = find(f.question(), 'BottomToolbar');
  assert.equal(typeof toolbar.props.onCalculator, 'function');
  assert.equal(toolbar.props.onPause, undefined);
  f.advance(5000);
  assert.equal(f.controller().props.session.progress.elapsed.qr, 17000);
  assert.equal(f.controller().props.session.progress.times['qr-1'], 5000);
  assert.equal(find(f.question(), 'QuestionTopBar').props.timerDisplay, undefined);
  assert.equal(f.checkpoints.at(-1).session.progress.answers['qr-0'], 'A');
});

test('shared navigator and end-of-set review preserve flags and complete through coaching saving', async () => {
  const f = fixture('vr'); await f.ready(); f.controller().props.onResume();
  let tree = f.question();
  find(tree, 'TimedQuestionPanel').props.onToggleFlag();
  assert.equal(f.controller().props.session.progress.flags['vr-1'], false);
  find(f.question(), 'TestNavigatorModal').props.onNavigateTo(0);
  assert.equal(f.controller().props.session.progress.index, 0);
  find(f.question(), 'ScreenNavBar').props.onNext();
  find(f.question(), 'ScreenNavBar').props.onNext();
  tree = f.question();
  const review = find(tree, 'TimedTestReviewScreen');
  assert.equal(review.props.questions.length, 2);
  assert.equal(review.props.getStatus(review.props.questions[0]), 'Answered');
  assert.equal(review.props.endButtonLabel, 'Finish practice');
  assert.equal(review.props.timerDisplay, undefined);
  assert.equal(review.props.reviewLabel, 'REVIEW PRACTICE');
  review.props.onEndTest(); await tick();
  const saved = f.requests.at(-1);
  assert.equal(saved.action, 'save');
  assert.equal(saved.payload.progress.phase, 'finished');
  assert.equal(saved.payload.progress.answers['vr-0'], 'A');
  const results = f.controller();
  assert.equal(results.type, 'CoachAssessmentResults', 'Uses the existing shared results and answer-review UI');
  assert.equal(typeof results.props.onContinue, 'function');
  assert.equal(results.props.onPlan, undefined);
});

test('untimed practice and mistake review resume automatically after backgrounding without counting time away', async () => {
  for (const kind of ['practice', 'review']) {
    const f = fixture('vr', kind); await f.ready();
    assert.ok(find(f.question(), 'TimedQuestionPanel'));
    f.advance(5000);
    f.appState('background'); await tick();
    assert.equal(f.controller().props.session.progress.phase, 'paused', 'Storage stops the timer while the app is away');
    f.advance(60000);
    assert.equal(f.controller().props.session.progress.elapsed.vr, 17000);
    f.appState('active'); await tick();
    const tree = f.question();
    assert.equal(find(tree, 'PremiumPauseModal'), undefined);
    assert.ok(find(tree, 'TimedQuestionPanel'));
    assert.equal(f.controller().props.session.progress.phase, 'running');
    assert.equal(f.controller().props.session.progress.index, 1);
    f.advance(3000);
    assert.equal(f.controller().props.session.progress.elapsed.vr, 20000);
    assert.equal(f.controller().props.session.progress.times['vr-1'], 8000);
    assert.equal(f.controller().props.session.progress.answers['vr-0'], 'A');
  }
});

test('timed coaching still requires resume after backgrounding', async () => {
  const f = fixture('qr', 'timed_check'); await f.ready();
  find(f.question(), 'PremiumPauseModal').props.onResume();
  f.advance(5000);
  f.appState('background'); await tick();
  f.advance(60000);
  f.appState('active'); await tick();
  assert.ok(find(f.question(), 'PremiumPauseModal'));
  assert.equal(f.controller().props.session.progress.elapsed.qr, 17000);
  assert.equal(f.controller().props.session.progress.phase, 'paused');
});

test('timed expiry, offline completion and retry keep the saved answers through the shared UI', async () => {
  const f = fixture('sj', 'timed_check'); await f.ready(); f.controller().props.onResume();
  f.settings.offline = true;
  f.advance(80000); await tick();
  assert.equal(f.controller().props.session.progress.phase, 'finished');
  assert.equal(f.controller().type, 'CoachAssessmentResults', 'Results are available on the device while offline');
  assert.equal(f.controller().props.session.status, 'active', 'Cloud completion is still pending');
  assert.equal(f.checkpoints.at(-1).session.progress.answers['sj-0'], 'A');
  f.settings.offline = false;
  await f.autosave();
  assert.equal(f.controller().type, 'CoachAssessmentResults');
  assert.equal(f.controller().props.session.progress.elapsed.sj, 90000);
});

test('the mini mock keeps its standard instructions and section-end behaviour', async () => {
  const f = fixture('dm', 'assessment', 'instructions'); await f.ready();
  const instructions = f.question();
  assert.equal(instructions.type, 'PremiumInstructionScreen');
  assert.equal(instructions.props.durationSeconds, 45);
  instructions.props.onStart();
  const tree = f.question();
  assert.equal(find(tree, 'ScreenNavBar').props.report.isTimed, true);
  find(tree, 'ScreenNavBar').props.onNext();
  assert.equal(find(f.question(), 'TimedTestReviewScreen').props.endButtonLabel, 'End section');
});

test('a slow upload leaves cached questions, answers and timing immediately usable', async () => {
  const f = fixture('qr', 'practice', 'instructions'), response = deferred();
  f.settings.save = () => response.promise;
  await f.ready();
  find(f.question(), 'TimedQuestionPanel').props.onAnswer('B');
  f.advance(60000); f.autosave(); await tick();
  assert.equal(f.requests.length, 1);
  const current = f.controller();
  assert.equal(current.props.error, undefined);
  assert.equal(current.props.session.version, 0);
  assert.equal(current.props.session.progress.phase, 'running');
  assert.equal(current.props.session.progress.answers['qr-1'], 'B');
  assert.equal(current.props.session.progress.elapsed.qr, 72000);
  f.advance(1000);
  response.resolve(); await tick();
  await f.autosave();
  assert.equal(f.requests.at(-1).payload.version, 1);
  assert.equal(f.requests.at(-1).payload.progress.answers['qr-1'], 'B');
});

test('normal completion opens the report immediately while the cloud request remains pending', async () => {
  const f = fixture('vr'), response = deferred(); await f.ready();
  f.settings.save = () => response.promise;
  f.controller().props.onFinish(); await tick();
  const results = f.controller();
  assert.equal(results.type, 'CoachAssessmentResults');
  assert.equal(results.props.busy, false, 'Cloud saving does not disable result actions');
  assert.equal(results.props.session.report.sections[0].earned, 1);
  assert.equal(results.props.session.questions[0].explanation, 'Original explanation');
  assert.equal(results.props.session.status, 'active');
  response.resolve(); await tick();
  assert.equal(f.controller().type, 'CoachAssessmentResults');
});

test('finishing during an autosave queues completion with the acknowledged version and all answers', async () => {
  const f = fixture('dm'), response = deferred(); await f.ready();
  f.settings.save = () => response.promise;
  const saving = f.autosave(); await tick();
  find(f.question(), 'TimedQuestionPanel').props.onAnswer({ 0: 'Yes', 1: 'No' });
  f.controller().props.onFinish();
  response.resolve(); await saving; await tick();
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].payload.version, 1);
  assert.equal(f.requests[1].payload.progress.phase, 'finished');
  assert.deepEqual(f.requests[1].payload.progress.answers['dm-1'], { 0: 'Yes', 1: 'No' });
  assert.equal(f.controller().type, 'CoachAssessmentResults');
});

test('a save response arriving after exit cannot overwrite the reopened screen checkpoint', async () => {
  const f = fixture('qr'), response = deferred(); await f.ready();
  f.settings.save = () => response.promise;
  const saving = f.autosave(); await tick();
  f.unmount();
  const checkpointsAtExit = f.checkpoints.length;
  response.resolve(); await saving;
  assert.equal(f.checkpoints.length, checkpointsAtExit);
});

test('save conflicts never replace questions or stop answering and navigation', async () => {
  const f = fixture('vr'); await f.ready();
  f.settings.save = () => { throw Object.assign(new Error('Version mismatch'), { code: 'version_conflict' }); };
  await f.autosave();
  let tree = f.question();
  assert.ok(find(tree, 'TimedQuestionPanel'));
  assert.equal(f.controller().props.session.progress.phase, 'running');
  assert.equal(f.controller().props.onReload, undefined);
  assert.equal(f.controller().props.onSync, undefined);
  find(tree, 'TimedQuestionPanel').props.onAnswer('B');
  find(f.question(), 'ScreenNavBar').props.onPrev();
  assert.equal(f.controller().props.session.progress.answers['vr-1'], 'B');
  assert.equal(f.controller().props.session.progress.index, 0);
  f.advance(5000);
  assert.equal(f.controller().props.session.progress.elapsed.vr, 17000);
});

test('offline completion displays results immediately and reconnecting uploads without changing screens', async () => {
  const f = fixture('qr'); await f.ready(); f.settings.offline = true;
  f.controller().props.onFinish(); await tick();
  const results = f.controller();
  assert.equal(results.type, 'CoachAssessmentResults');
  assert.equal(results.props.busy, false);
  assert.equal(results.props.session.status, 'active');
  f.settings.offline = false;
  f.controller(); await tick();
  assert.equal(f.controller().type, 'CoachAssessmentResults');
});

test('a failed background refresh leaves cached questions usable without session recovery controls', async () => {
  const f = fixture('dm');
  f.settings.load = () => { throw Object.assign(new Error('Version mismatch'), { code: 'version_conflict' }); };
  await f.ready();
  const tree = f.question();
  assert.ok(find(tree, 'TimedQuestionPanel'));
  find(tree, 'TimedQuestionPanel').props.onAnswer({ 0: 'Yes', 1: 'No' });
  assert.deepEqual(f.controller().props.session.progress.answers['dm-1'], { 0: 'Yes', 1: 'No' });
});

test('Continue opens device questions offline while uploads remain blocked', async () => {
  const f = fixture('vr'), upload = deferred(); await f.ready();
  const next = { ...structuredClone(f.session), id: 'next-set', kind: 'practice', budgets: { vr: null }, progress: engine.initialProgress() };
  next.questions[0].text = 'Prepared next question';
  f.settings.prepare = async () => { f.settings.next = next; return next; };
  f.settings.save = () => upload.promise;
  f.question(); await tick();
  assert.deepEqual(f.preparations, [], 'Starting another set does not need a network download');
  f.controller().props.onFinish(); await tick();
  f.settings.offline = true;
  const results = f.controller();
  assert.equal(results.type, 'CoachAssessmentResults');
  assert.equal(f.removalGuard().enabled, false, 'Finished results must not intercept navigation to save the previous set again');
  const requestCount = f.requests.length;
  await results.props.onContinue();
  assert.equal(f.navigationCalls.length, 1, 'Only device persistence precedes navigation');
  assert.equal(f.requests.length, requestCount);
  assert.equal(f.navigationCalls[0][0], 'replace');
  assert.equal(f.navigationCalls[0][2].initialSession.id, next.id);
  assert.equal(f.navigationCalls[0][2].initialSession.progress.phase, 'running');
  results.props.onContinue();
  assert.equal(f.navigationCalls.length, 1, 'Repeated taps cannot open or consume the next set twice');
  upload.resolve(); await tick();
});

test('a free preview finishes and displays results, then Continue opens Pro without preparing more sets', async () => {
  const f = fixture('vr'); f.settings.subscription = { isPro: false }; await f.ready();
  f.controller().props.onFinish(); await tick();
  const results = f.controller();
  assert.equal(results.type, 'CoachAssessmentResults');
  assert.ok(results.props.session.report);
  assert.equal(f.preparations.length, 0);
  await results.props.onContinue();
  assert.deepEqual(f.navigationCalls, [['navigate', 'Paywall']]);
  assert.equal(f.preparations.length, 0);
});

test('a paid download cannot bypass the paywall after the subscription ends', async () => {
  const f = fixture('vr'); await f.ready();
  f.settings.next = { ...structuredClone(f.session), id: 'downloaded-set', progress: engine.initialProgress() };
  f.controller().props.onFinish(); await tick();
  const oldContinue = f.controller().props.onContinue;
  f.settings.subscription = { isPro: false }; f.controller();
  await oldContinue();
  assert.deepEqual(f.navigationCalls, [['navigate', 'Paywall']]);
  assert.equal(f.settings.next.id, 'downloaded-set', 'A blocked tap cannot consume the cached set');
});

test('a subscription expiring during next-set preparation is checked again before opening the set', async () => {
  const f = fixture('vr'), download = deferred();
  f.settings.prepare = () => download.promise;
  await f.ready(); f.controller().props.onFinish(); await tick();
  const continuing = f.controller().props.onContinue();
  f.settings.subscription = { isPro: false }; f.controller();
  f.settings.next = { ...structuredClone(f.session), id: 'downloaded-set', progress: engine.initialProgress() };
  download.resolve(f.settings.next); await continuing;
  assert.deepEqual(f.navigationCalls, [['navigate', 'Paywall']]);
});

test('a prepared set renders its first question immediately and keeps taps entered during device loading', async () => {
  const f = fixture('vr'), deviceRead = deferred();
  const next = { ...structuredClone(f.session), id: 'next-set', progress: { ...engine.initialProgress(), phase: 'running' } };
  next.questions[0].text = 'Prepared next question';
  f.settings.routeParams = { id: next.id, initialSession: next, initialUserId: 'alice' };
  f.settings.noCache = true; f.settings.load = () => deviceRead.promise;
  const tree = f.question();
  assert.equal(find(tree, 'TimedQuestionPanel').props.text, 'Prepared next question');
  find(tree, 'TimedQuestionPanel').props.onAnswer('B');
  deviceRead.resolve({ session: next, dirty: true }); await tick();
  assert.equal(f.controller().props.session.progress.answers['vr-0'], 'B');
});

test('repeated Continue taps share the same device preparation', async () => {
  const f = fixture('qr'), download = deferred(); await f.ready();
  const next = { ...structuredClone(f.session), id: 'next-set', progress: engine.initialProgress() };
  f.settings.prepare = async () => { await download.promise; f.settings.next = next; return next; };
  f.question();
  f.controller().props.onFinish(); await tick();
  const opening = f.controller().props.onContinue();
  await f.controller().props.onContinue();
  assert.equal(f.navigationCalls.length, 0);
  assert.equal(f.preparations.length, 1);
  download.resolve(); await opening;
  assert.equal(f.navigationCalls.length, 1);
});
