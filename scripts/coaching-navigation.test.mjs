import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as coachAccess from '../src/lib/coaching/access.js';

const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const welcome = { settings: { time_multiplier: 1 }, profile: null, baseline: null };
const completed = { ...welcome, profile: { skills: [], plan: [] }, baseline: { id: 'mock', report: {} } };

// Exercise the screen callbacks and retained hook state without a native renderer.
function screenFixture(name, service, content = {}) {
  const slots = [], effects = [], exports = {}, navigationCalls = [];
  let index = 0, focus;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const slot = index++;
      if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], (next) => { slots[slot] = typeof next === 'function' ? next(slots[slot]) : next; }];
    },
    useRef(initial) { const slot = index++; return slots[slot] ??= { current: initial }; },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useEffect: (fn) => effects.push(fn),
  };
  const components = new Proxy({ ds: {}, useCoachTheme: () => ({ colors: {} }) }, {
    get: (target, key) => target[key] ?? key,
  });
  const source = ts.transpileModule(fs.readFileSync(`src/screens/coaching/${name}.js`, 'utf8'), {
    fileName: `${name}.jsx`,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(source, { exports, console, __DEV__: false, require(path) {
    if (path === 'react') return { ...react, default: react };
    if (path === 'react-native') return new Proxy({ StyleSheet: { create: (styles) => styles } }, {
      get: (target, key) => target[key] ?? key,
    });
    if (path === '@react-navigation/native') return { useFocusEffect: (fn) => { focus = fn; } };
    if (path === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView', useSafeAreaInsets: () => ({ bottom: 0 }) };
    if (path.endsWith('SubscriptionContext')) return { useSubscription: () => content.subscription ?? { isPro: true, adminOverride: true } };
    if (path.endsWith('/coaching/access')) return coachAccess;
    if (path.endsWith('AuthContext')) return { useAuth: () => ({ user: { id: 'alice' } }) };
    if (path.endsWith('coachingService')) return { ...service,
      loadCoachInitialPlan: service.loadCoachInitialPlan ?? ((user, id) => service.coachRequest(user, 'initial_plan', { id })),
      startCoachSession: service.startCoachSession ?? (async (user, kind, focus) => {
        const result = await service.coachRequest(user, 'start', { kind, ...focus });
        await service.saveCoachCheckpoint(user, result.session);
        return result;
      }),
      saveCoachHubCache: async (...args) => await service.saveCoachHubCache(...args) ?? args[1],
    };
    if (path.endsWith('NetworkContext')) return { useNetwork: () => ({ isOnline: true }) };
    if (path.endsWith('practiceContentService')) return { ensureCoachQuestionBanks: async (onProgress) => onProgress({ ready: true }), ...content };
    if (path.endsWith('practiceAttemptQueue')) return { flushPracticeAttempts: async () => {} };
    if (path.endsWith('onboardingFlags')) return { getExamDate: async () => null };
    if (path.endsWith('dashboard')) return { buildDashboardStory: () => ({}), sectionSnapshot: () => [], resumeSummary: () => null };
    if (path.endsWith('initialPlan')) return { buildInitialPlan: () => ({ priorities: [] }) };
    if (path.endsWith('ExamDateCalendar')) return { parseLocalISO: () => null };
    if (path.endsWith('premiumTheme')) return { hexToRgba: () => '' };
    return new Proxy({ ...components, default: path.split('/').at(-1) }, {
      get: (target, key) => target[key] ?? key,
    });
  } });
  return {
    effects,
    navigationCalls,
    focus: () => focus(),
    render: () => {
      index = 0;
      return exports.default({ route: { name: 'Coaching', params: { id: 'mock' } }, navigation: {
        navigate: (...args) => navigationCalls.push(args), popTo: (...args) => navigationCalls.push(args), isFocused: () => true,
      } });
    },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}

test('Start my coaching saves the plan on device and returns before the cloud dashboard responds', async () => {
  const hub = deferred();
  const requests = [], cached = [], preferences = [];
  const f = screenFixture('CoachPlanIntroScreen', {
    coachRequest: async (_user, action) => {
      requests.push(action);
      return action === 'initial_plan' ? { seen: false, profile: completed.profile, report: {} } : action === 'hub' ? hub.promise : { ok: true };
    },
    loadCoachHubCache: async () => welcome,
    queueCoachPreferences: async (user, value) => preferences.push({ user, value }),
    saveCoachHubCache: async (user, data) => cached.push({ user, data }),
  });
  f.render(); f.effects[0](); await tick();
  const button = nodes(f.render()).find((node) => node.props?.title === 'Start my coaching');
  const pending = button.props.onPress(); await tick();
  assert.deepEqual(requests, ['initial_plan', 'hub']);
  assert.equal(f.navigationCalls.length, 1);
  assert.equal(preferences[0].value.planIntroSessionId, 'mock');
  hub.resolve(completed); await pending;
  assert.equal(cached[0].user, 'alice');
  assert.equal(cached[0].data.baseline.id, 'mock');
  assert.equal(f.navigationCalls[0][0], 'MainTabs');
  assert.equal(f.navigationCalls[0][1].screen, 'Coaching');
});

test('a failed cloud refresh does not prevent returning to the locally saved plan', async () => {
  const f = screenFixture('CoachPlanIntroScreen', {
    coachRequest: async (_user, action) => {
      if (action === 'hub') throw new Error('Offline');
      return action === 'initial_plan' ? { seen: false, profile: completed.profile, report: {} } : { ok: true };
    },
    loadCoachHubCache: async () => welcome,
    queueCoachPreferences: async () => {},
    saveCoachHubCache: async () => {},
  });
  f.render(); f.effects[0](); await tick();
  await nodes(f.render()).find((node) => node.props?.title === 'Start my coaching').props.onPress();
  await tick();
  assert.equal(f.navigationCalls.length, 1);
  assert.ok(!nodes(f.render()).some((node) => node.props?.children?.includes('Offline')));
  assert.equal(nodes(f.render()).find((node) => node.props?.title === 'Start my coaching').props.disabled, false);
});

test('dashboard loading never waits for pending checkpoint uploads', async () => {
  const upload = deferred(); let requested = false;
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => completed,
    coachRequest: async () => { requested = true; return completed; },
    saveCoachHubCache: async () => {},
    flushCoachPreferences: async () => {}, flushCoachCheckpoints: () => upload.promise,
  });
  f.render(); f.focus(); await tick();
  assert.equal(requested, true);
  assert.ok(nodes(f.render()).some((node) => node.type === 'ProgressOverview'));
  upload.resolve();
});

test('returning to an already mounted coaching tab replaces its welcome state from the refreshed cache', async () => {
  let cached = welcome;
  let remote = Promise.resolve(welcome);
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => cached,
    coachRequest: async () => remote,
    saveCoachHubCache: async (_user, next) => { cached = next; },
    flushCoachPreferences: async () => {}, flushCoachCheckpoints: async () => {},
  });
  f.render(); f.focus(); await tick();
  assert.ok(nodes(f.render()).some((node) => node.type === 'CoachWelcome'));
  const refresh = deferred(); remote = refresh.promise;
  cached = completed;
  f.focus(); await tick();
  assert.ok(!nodes(f.render()).some((node) => node.type === 'CoachWelcome'));
  assert.ok(nodes(f.render()).some((node) => node.type === 'ProgressOverview'));
  refresh.resolve(completed); await tick();
});

test('a missing dashboard cache still allows the bundled mini mock while the cloud is unavailable', async () => {
  let cached = welcome;
  let remote = Promise.resolve(welcome);
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => cached,
    coachRequest: async () => remote,
    saveCoachHubCache: async (_user, next) => { cached = next; },
    flushCoachPreferences: async () => {}, flushCoachCheckpoints: async () => {},
  });
  f.render(); f.focus(); await tick();
  assert.ok(nodes(f.render()).some((node) => node.type === 'CoachWelcome'));
  const refresh = deferred(); remote = refresh.promise; cached = null;
  f.focus(); await tick();
  const tree = f.render();
  assert.ok(nodes(tree).some((node) => node.type === 'CoachWelcome'));
  assert.ok(nodes(tree).some((node) => node.props?.title === 'Start my mini mock'));
  refresh.resolve(completed); await tick();
});

test('first setup shows download progress and gates new coaching practice until the banks are ready', async () => {
  const download = deferred(), requests = []; let publish;
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => completed,
    coachRequest: async (_user, action) => { requests.push(action); return action === 'hub' ? completed : { session: { id: 'new-set' } }; },
    saveCoachHubCache: async () => {}, saveCoachCheckpoint: async () => {},
    flushCoachPreferences: async () => {}, flushCoachCheckpoints: async () => {},
  }, { ensureCoachQuestionBanks: (onProgress) => {
    publish = onProgress; onProgress({ loaded: 1, total: 4, section: 'Decision Making' }); return download.promise;
  } });
  f.render(); f.effects[1](); f.focus(); await tick();
  let tree = f.render();
  assert.equal(nodes(tree).find((node) => node.type === 'CoachQuestionSetup').props.progress.loaded, 1);
  let practice = nodes(tree).find((node) => node.type === 'NextPracticeCard');
  assert.equal(practice.props.busy, true);
  await practice.props.onContinue();
  assert.deepEqual(requests, ['hub']);
  publish({ ready: true, loaded: 4, total: 4 }); download.resolve(); await tick();
  tree = f.render();
  assert.ok(!nodes(tree).some((node) => node.type === 'CoachQuestionSetup'));
  practice = nodes(tree).find((node) => node.type === 'NextPracticeCard');
  assert.equal(practice.props.busy, false);
  await practice.props.onContinue();
  assert.deepEqual(requests, ['hub', 'start']);
  assert.deepEqual(JSON.parse(JSON.stringify(f.navigationCalls[0])), ['CoachSession', { id: 'new-set' }]);
});

test('an interrupted question setup leaves an existing coaching session available immediately', async () => {
  const hub = { ...completed, active: { id: 'saved-set', kind: 'practice' } };
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => hub, coachRequest: async () => hub,
    saveCoachHubCache: async () => {}, flushCoachPreferences: async () => {}, flushCoachCheckpoints: async () => {},
  }, { ensureCoachQuestionBanks: async (onProgress) => {
    onProgress({ loaded: 2, total: 4 }); throw Error('Offline');
  } });
  f.render(); f.effects[1](); f.focus(); await tick();
  const tree = f.render();
  const setup = nodes(tree).find((node) => node.type === 'CoachQuestionSetup');
  assert.ok(setup.props.error);
  assert.equal(typeof setup.props.onRetry, 'function');
  const practice = nodes(tree).find((node) => node.type === 'NextPracticeCard');
  assert.equal(practice.props.busy, false);
  practice.props.onContinue();
  assert.deepEqual(JSON.parse(JSON.stringify(f.navigationCalls[0])), ['CoachSession', { id: 'saved-set' }]);
});

test('a cached Pro dashboard cannot unlock another coached set after the live subscription ends', async () => {
  const hub = { ...completed, pro: true, previewAvailable: false }, requests = [];
  const f = screenFixture('CoachHubScreen', {
    loadCoachHubCache: async () => hub,
    coachRequest: async (_user, action) => { requests.push(action); return hub; },
    saveCoachHubCache: async () => {}, flushCoachPreferences: async () => {}, flushCoachCheckpoints: async () => {},
  }, { subscription: { isPro: false } });
  f.render(); f.focus(); await tick();
  const practice = nodes(f.render()).find((node) => node.type === 'NextPracticeCard');
  assert.equal(practice.props.locked, true);
  assert.equal(practice.props.busy, false, 'The paywall does not need to wait for question downloads');
  practice.props.onContinue();
  assert.deepEqual(f.navigationCalls.map((call) => call[0]), ['Paywall']);
  assert.deepEqual(requests, ['hub']);
});
