import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { hasMarketingAccess } from '../src/lib/marketingAccess.js';

function fixture(name, { approved = false, admin = false } = {}) {
  const slots = [], calls = [], navigation = [];
  let index = 0;
  const react = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) { const slot = index++; if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
      return [slots[slot], (value) => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }]; },
    useCallback: (fn) => fn, useEffect: () => {},
  };
  const components = new Proxy({ hexToRgba: () => '', useFadeSlide: () => ({}), usePerformanceTheme: () => ({ colors: {} }), performanceStyles: {} }, { get: (target, key) => target[key] ?? key });
  const source = ts.transpileModule(fs.readFileSync(`src/screens/home/${name}.js`, 'utf8'), { fileName: `${name}.jsx`,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, __DEV__: false, require(path) {
    if (path === 'react') return { ...react, default: react };
    if (path === 'react-native') return new Proxy({ Animated: { View: 'AnimatedView' }, StyleSheet: { create: (s) => s }, Platform: { OS: 'android' } }, { get: (target, key) => target[key] ?? key });
    if (path === '@react-navigation/native') return { useFocusEffect: () => {}, useNavigation: () => ({ navigate: (...args) => navigation.push(args) }) };
    if (path.endsWith('AuthContext')) return { useAuth: () => ({ user: { id: 'tester', email: 'tester@example.test', identities: [] }, displayName: 'Tester' }) };
    if (path.endsWith('MarketingAccessContext')) return { useMarketingAccess: () => ({ canUseMarketingDemo: approved, refreshMarketingAccess: async () => {} }) };
    if (path.endsWith('useMarketingDemo')) return { useMarketingDemo: () => false, setMarketingDemoEnabled: async () => {} };
    if (path.endsWith('ThemeContext')) return { useTheme: () => ({ isDark: false }) };
    if (path.endsWith('SubscriptionContext')) return { useSubscription: () => ({ isPro: true, isOnTrial: false }) };
    if (path.endsWith('SupportNotificationsContext')) return { useSupportNotifications: () => ({ counts: { is_admin: admin } }) };
    if (path.endsWith('premiumTheme')) return { getPremiumTheme: () => ({ colors: {} }) };
    if (path.endsWith('marketingAccess')) return { hasMarketingAccess };
    if (path.endsWith('marketingTesters')) return { manageMarketingTester: async (...args) => { calls.push(args); return { user: { email: args[1], displayName: 'Tester', isPro: args[0] === 'grant', testerExpiresAt: args[0] === 'grant' ? '2099-01-01' : null } }; } };
    return components;
  } });
  return { calls, navigation, render: () => { index = 0; return exports.default({ navigation: { navigate: (...args) => navigation.push(args) } }); } };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
test('approved testers in a release build see only marketing tools, with no developer preview or management controls', () => {
  const f = fixture('ProfileScreen', { approved: true });
  const tree = nodes(f.render());
  assert.equal(tree.filter((node) => node.props?.accessibilityLabel === 'Marketing demo').length, 1);
  assert.ok(!tree.some((node) => node.props?.children?.includes('Coaching sample results')));
  assert.ok(!tree.some((node) => node.props?.children?.includes('Developer')));
  assert.ok(!tree.some((node) => node.props?.title === 'Marketing testers' || node.props?.title === 'Manage support'));
});
test('ordinary Pro accounts cannot see marketing tools, while admins can manage testers without being testers themselves', () => {
  const ordinary = nodes(fixture('ProfileScreen').render());
  assert.ok(!ordinary.some((node) => node.props?.accessibilityLabel === 'Marketing demo'));
  const f = fixture('ProfileScreen', { admin: true });
  const menu = nodes(f.render()).find((node) => node.props?.title === 'Marketing testers');
  menu.props.onPress(); assert.deepEqual(f.navigation[0], ['MarketingTesters']);
});
test('the management screen rejects non-admin navigation and sends explicit temporary grants for admins', async () => {
  const ordinary = fixture('MarketingTestersScreen', { approved: true });
  assert.ok(!nodes(ordinary.render()).some((node) => node.props?.title === 'Find account'));
  assert.deepEqual(ordinary.calls, []);
  const f = fixture('MarketingTestersScreen', { admin: true });
  nodes(f.render()).find((node) => node.props?.accessibilityLabel === 'Tester email').props.onChangeText('tester@example.test');
  await nodes(f.render()).find((node) => node.props?.title === 'Find account').props.onPress();
  await nodes(f.render()).find((node) => node.props?.title?.startsWith('Grant Pro')).props.onPress();
  assert.deepEqual(f.calls[0].slice(0, 2), ['lookup', 'tester@example.test']);
  assert.equal(f.calls[1][0], 'grant'); assert.equal(f.calls[1][2].days, 90);
});
