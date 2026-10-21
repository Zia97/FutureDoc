import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createAppAlertStore } from '../src/services/appAlert.js';

test('alerts wait for the host and preserve each queued message and action', () => {
  const store = createAppAlertStore(), actions = [];
  store.alert('First', 'Message');
  store.alert('Second', 'Another message', [{ text: 'Continue', onPress: () => actions.push('continue') }]);
  const first = store.getSnapshot();
  assert.equal(first.buttons[0].text, 'OK');
  assert.equal(first.cancelable, false);
  store.press(first.id, 0);
  assert.equal(store.getSnapshot().title, 'Second');
  store.press(store.getSnapshot().id, 0);
  assert.deepEqual(actions, ['continue']);
  assert.equal(store.getSnapshot(), null);
});

test('nested destructive confirmations require separate actions and stale taps cannot confirm twice', () => {
  const store = createAppAlertStore();
  let deleted = 0;
  store.alert('Delete account?', 'Warning', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => store.alert('Are you sure?', 'Final warning', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete forever', style: 'destructive', onPress: () => deleted++ },
    ]) },
  ]);
  const first = store.getSnapshot();
  store.dismiss(first.id);
  assert.equal(store.getSnapshot(), first, 'Backdrop and Back cannot bypass a noncancelable dialog');
  store.press(first.id, 1);
  const second = store.getSnapshot();
  store.press(first.id, 1);
  assert.equal(store.getSnapshot(), second);
  assert.equal(deleted, 0);
  store.press(second.id, 1);
  store.press(second.id, 1);
  assert.equal(deleted, 1);
});

test('cancellation never triggers the destructive action and dismiss callbacks run once', () => {
  const store = createAppAlertStore();
  let cancelled = 0, dismissed = 0, deleted = 0;
  const buttons = [{ text: 'Stay', style: 'cancel', onPress: () => cancelled++ },
    { text: 'Exit', style: 'destructive', onPress: () => deleted++ }];
  store.alert('Exit?', '', buttons, { cancelable: true, onDismiss: () => dismissed++ });
  const first = store.getSnapshot();
  store.dismiss(first.id); store.dismiss(first.id);
  assert.equal(dismissed, 1);
  assert.equal(cancelled, 0);
  assert.equal(deleted, 0);
  store.alert('Exit?', '', buttons);
  store.press(store.getSnapshot().id, 0);
  assert.equal(cancelled, 1);
  assert.equal(deleted, 0);
});

test('subscribers receive new snapshots and can unsubscribe cleanly', () => {
  const store = createAppAlertStore(), snapshots = [];
  store.dismiss(undefined);
  const unsubscribe = store.subscribe(() => snapshots.push(store.getSnapshot()));
  store.alert('First');
  store.press(store.getSnapshot().id, 0);
  unsubscribe();
  store.alert('Second');
  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[1], null);
});

const nodes = (tree) => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object'
  ? [tree, ...nodes(tree.props?.children)] : [];

test('the themed dialog renders choices, scrollable copy and safe dismissal controls', () => {
  const react = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) };
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('src/components/AppDialog.js', 'utf8'), {
    fileName: 'AppDialog.jsx', compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(code, { exports, require(name) {
    if (name === 'react') return { ...react, default: react };
    if (name === 'react-native') return { Modal: 'Modal', Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text', View: 'View',
      StyleSheet: { create: (styles) => styles, absoluteFill: {} } };
    if (name.endsWith('ThemeContext')) return { useTheme: () => ({ isDark: false }) };
    if (name.endsWith('premiumTheme')) return { getPremiumTheme: (isDark) => {
      assert.equal(isDark, false); return { colors: { surface: 'white', red: 'red', blue: 'blue' } };
    } };
    return { Ionicons: 'Ionicons' };
  } });
  let closed = 0;
  const actions = [];
  let tree = exports.default({ visible: true, title: 'Delete?', message: 'Warning', cancelable: false,
    buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }],
    onClose: () => closed++, onAction: (index) => actions.push(index) });
  tree.props.onRequestClose();
  assert.equal(closed, 0);
  assert.ok(nodes(tree).some((node) => node.type === 'ScrollView'));
  const remove = nodes(tree).find((node) => node.props?.accessibilityLabel === 'Delete');
  assert.equal(remove.props.style({ pressed: false })[1].backgroundColor, 'red');
  remove.props.onPress();
  assert.deepEqual(actions, [1]);
  tree = exports.default({ visible: true, message: 'Info', onClose: () => closed++ });
  tree.props.onRequestClose();
  nodes(tree).find((node) => node.props?.accessibilityLabel === 'Close dialog' && !node.props?.style?.position)?.props.onPress();
  assert.equal(closed, 2);
});

test('all application alerts use the shared service and changed application JSX parses', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  for (const file of ['App.js', ...walk('src').filter((file) => file.endsWith('.js'))]) {
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes('Alert.alert(')) {
      assert.match(source, /import Alert from ['"].*services\/appAlert['"]/u, file);
      assert.doesNotMatch(source, /import\s*\{[^}]*\bAlert\b[^}]*\}\s*from\s*['"]react-native['"]/u, file);
    }
    if (!source.includes('appAlert') && !source.includes('AppDialog') && !source.includes('AppAlertHost')) continue;
    const result = ts.transpileModule(source, { fileName: file.replace('.js', '.jsx'), reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } });
    assert.deepEqual(result.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error), [], file);
  }
  assert.match(fs.readFileSync('App.js', 'utf8'), /<AppAlertHost\s*\/>/u);
});
