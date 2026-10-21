import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { hasMarketingAccess } from '../src/lib/marketingAccess.js';

const NOW = Date.parse('2026-10-21T12:00:00Z');
const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture({ cache = null } = {}) {
  let userId = 'alice', time = NOW, index = 0;
  const slots = [], effects = [], requests = [], storeCalls = [], disk = new Map(cache ? [['marketing_access_cache', JSON.stringify(cache)]] : []);
  const timeouts = new Map(); let nextTimer = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    createContext: () => ({ Provider: 'MarketingAccessProvider' }),
    useState(initial) { const slot = index++; slots[slot] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[slot].value, (next) => { slots[slot].value = typeof next === 'function' ? next(slots[slot].value) : next; }]; },
    useRef(initial) { const slot = index++; return slots[slot] ??= { current: initial }; },
    useCallback(fn, deps) { const slot = index++; if (!same(slots[slot]?.deps, deps)) slots[slot] = { fn, deps }; return slots[slot].fn; },
    useEffect(fn, deps) { const slot = index++; if (!same(slots[slot]?.deps, deps)) { const previous = slots[slot]; slots[slot] = { deps }; effects.push(() => { previous?.cleanup?.(); slots[slot].cleanup = fn(); }); } },
  };
  const source = ts.transpileModule(fs.readFileSync('src/context/MarketingAccessContext.js', 'utf8'), { fileName: 'provider.jsx',
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText;
  const exports = {};
  class TestDate extends Date { static now() { return time; } }
  vm.runInNewContext(source, { exports, Date: TestDate, __DEV__: false,
    setTimeout: (fn, delay) => { const id = ++nextTimer; timeouts.set(id, { fn, delay }); return id; }, clearTimeout: (id) => timeouts.delete(id),
    setInterval: () => ++nextTimer, clearInterval: () => {},
    require(path) {
      if (path === 'react') return { ...react, default: react };
      if (path === 'react-native') return { AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } };
      if (path.includes('async-storage')) return { default: { getItem: async (key) => disk.get(key) ?? null, setItem: async (key, value) => disk.set(key, value) } };
      if (path.endsWith('AuthContext')) return { useAuth: () => ({ user: userId ? { id: userId } : null }) };
      if (path.endsWith('marketingAccess')) return { hasMarketingAccess: (expires, clock) => hasMarketingAccess(expires, clock ?? time) };
      if (path.endsWith('marketingDemoState')) return { marketingDemoStore: { setAccess: (value) => storeCalls.push(value), hydrate: async () => {} } };
      if (path.endsWith('supabase')) return { supabase: { from: () => ({ select() { return this; }, eq(_key, id) { this.id = id; return this; }, maybeSingle() { const id = this.id; return new Promise((resolve) => requests.push({ id, resolve })); } }) } };
      throw new Error(path);
    },
  });
  const render = () => { index = 0; return exports.MarketingAccessProvider({ children: null }).props.value; };
  return { requests, storeCalls, timeouts, render, setUser: (id) => { userId = id; }, setTime: (value) => { time = value; },
    async flush() { while (effects.length) effects.shift()(); await tick(); },
  };
}

test('only this account can reuse unexpired device permission, and switching users hides it immediately', async () => {
  const f = fixture({ cache: { userId: 'alice', expiresAt: new Date(NOW + 86400000).toISOString() } });
  assert.equal(f.render().canUseMarketingDemo, false);
  await f.flush();
  assert.equal(f.render().canUseMarketingDemo, true);
  f.setUser('bob');
  assert.equal(f.render().canUseMarketingDemo, false);
  await f.flush();
  // The first account's response arrives after the account switch.
  f.requests.find((r) => r.id === 'alice').resolve({ data: { marketing_tester_expires_at: new Date(NOW + 86400000).toISOString() } });
  await tick();
  assert.equal(f.render().canUseMarketingDemo, false);
});

test('server revocation removes cached access and the active demo permission', async () => {
  const f = fixture({ cache: { userId: 'alice', expiresAt: new Date(NOW + 86400000).toISOString() } });
  f.render(); await f.flush();
  assert.equal(f.render().canUseMarketingDemo, true);
  f.requests[0].resolve({ data: { marketing_tester_expires_at: null } }); await tick();
  assert.equal(f.render().canUseMarketingDemo, false); await f.flush();
  assert.equal(f.storeCalls.at(-1).available, false);
});

test('permission expires while the app is open, without a network response or a zero-delay timer loop', async () => {
  const f = fixture({ cache: { userId: 'alice', expiresAt: new Date(NOW + 5000).toISOString() } });
  f.render(); await f.flush(); f.render(); await f.flush();
  assert.equal(f.render().canUseMarketingDemo, true);
  const timer = [...f.timeouts.values()][0]; assert.ok(timer.delay <= 5001);
  f.setTime(NOW + 5001); timer.fn();
  assert.equal(f.render().canUseMarketingDemo, false); await f.flush();
  assert.equal(f.timeouts.size, 0);
});
