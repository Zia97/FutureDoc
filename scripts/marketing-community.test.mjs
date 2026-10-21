import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as demoData from '../src/dev/marketingCommunityData.js';
import { returnToCommunity } from '../src/navigation/forumNavigation.js';

const now = Date.parse('2026-10-21T12:00:00Z');
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('sample discussions have complete threads, coherent reply counts and valid nested replies', () => {
  const community = demoData.createMarketingCommunity(now);
  const posts = community.listPosts();
  assert.equal(posts.length, 8);
  assert.deepEqual(community.getSnapshot(), demoData.createMarketingCommunity(now).getSnapshot());
  for (const post of posts) {
    assert.ok(demoData.isMarketingCommunityId(post.id));
    assert.ok(post.title.length >= 5 && post.body.length >= 10);
    const { replies } = community.getThread(post.id);
    assert.equal(post.replyCount, replies.length);
    assert.ok(replies.length >= 3);
    for (const reply of replies) {
      assert.equal(reply.postId, post.id);
      assert.ok(reply.body && reply.author.displayName);
      assert.ok(Date.parse(reply.createdAt) >= Date.parse(post.createdAt) && Date.parse(reply.createdAt) <= now);
      if (reply.parentReplyId) assert.ok(replies.some((parent) => parent.id === reply.parentReplyId));
    }
  }
  assert.equal(community.getThread('real-post-id'), null);
});

test('search finds sample discussions without changing the feed', () => {
  const community = demoData.createMarketingCommunity(now);
  assert.equal(community.listPosts('  VENN  diagrams ').length, 1);
  assert.equal(community.listPosts('not-a-topic').length, 0);
  assert.equal(community.listPosts().length, 8);
});

test('local posts, replies and likes stay consistent across feed and thread subscribers', () => {
  const community = demoData.createMarketingCommunity(now);
  let events = 0;
  const unsubscribe = community.subscribe(() => events++);
  const post = community.createPost({ title: 'My next practice focus', body: 'Working on conditional logic this week.' });
  const reply = community.createReply(post.id, 'I am practising the same skill.');
  community.createReply(post.id, 'Let us compare techniques.', reply.id);
  community.toggleLike('post', post.id);
  community.toggleLike('reply', reply.id);
  assert.equal(community.listPosts()[0].replyCount, 2);
  assert.equal(community.listPosts()[0].likeCount, 1);
  assert.equal(community.getThread(post.id).post, community.listPosts()[0]);
  assert.equal(community.getThread(post.id).replies[0].likeCount, 1);
  community.toggleLike('post', post.id);
  assert.equal(community.listPosts()[0].likeCount, 0);
  assert.equal(events, 6);
  unsubscribe();
  assert.equal(demoData.createMarketingCommunity(now).listPosts().length, 8, 'Restart discards all local additions');
});

test('deleting a sample reply updates counts and keeps its child reply readable', () => {
  const community = demoData.createMarketingCommunity(now);
  const post = community.listPosts()[0];
  const parent = community.getThread(post.id).replies[0];
  community.deleteContent('reply', parent.id);
  const thread = community.getThread(post.id);
  assert.equal(thread.post.replyCount, thread.replies.length);
  assert.ok(thread.replies.every((reply) => reply.parentReplyId !== parent.id));
  community.deleteContent('post', post.id);
  assert.equal(community.getThread(post.id), null);
  assert.equal(community.listPosts().length, 7);
});

function fixture(name, { community = demoData.createMarketingCommunity(now), mode = { enabled: true }, postId, service = {} } = {}) {
  const slots = [], effects = [], calls = [], alerts = [], navigationCalls = [];
  let index = 0, focus, cleanup;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useState(initial) {
      const slot = index++;
      if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial;
      return [slots[slot], (value) => { slots[slot] = typeof value === 'function' ? value(slots[slot]) : value; }];
    },
    useRef(initial) { const slot = index++; return slots[slot] ??= { current: initial }; },
    useCallback: (fn) => fn,
    useEffect: (fn) => effects.push(fn),
  };
  const source = ts.transpileModule(fs.readFileSync(`src/screens/forum/${name}.js`, 'utf8'), {
    fileName: `${name}.jsx`, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
  });
  const exports = {};
  vm.runInNewContext(source.outputText, { exports, setTimeout, clearTimeout, require(path) {
    if (path === 'react') return { ...react, default: react };
    if (path === 'react-native') return new Proxy({ StyleSheet: { create: (s) => s }, Platform: { OS: 'android' } }, { get: (target, key) => target[key] ?? key });
    if (path === '@react-navigation/native') return { useFocusEffect: (fn) => { focus = fn; } };
    if (path.endsWith('useMarketingCommunity')) return { useMarketingCommunity: () => ({ marketingDemo: mode.enabled, community, snapshot: community.getSnapshot() }) };
    if (path.endsWith('marketingCommunityData')) return demoData;
    if (path.endsWith('ThemeContext')) return { useTheme: () => ({ isDark: false }) };
    if (path.endsWith('premiumTheme')) return { getPremiumTheme: () => ({ colors: {} }), hexToRgba: () => '' };
    if (path.endsWith('forumNavigation')) return { returnToCommunity };
    if (path.endsWith('appAlert')) return { default: { alert: (...args) => alerts.push(args) } };
    if (path.endsWith('/lib/forum')) return new Proxy({}, { get: (_target, key) => (...args) => {
      calls.push([key, ...args]);
      if (service[key]) return service[key](...args);
      throw new Error(`Unexpected real forum call: ${String(key)}`);
    } });
    if (path.endsWith('reportError')) return { reportError: () => {} };
    const component = path.split('/').at(-1);
    return new Proxy({ default: component }, { get: (target, key) => target[key] ?? key });
  } });
  const navigation = { navigate: (...args) => navigationCalls.push(args), canGoBack: () => false };
  return { community, calls, alerts, effects, navigationCalls,
    render: () => { index = 0; return exports.default({ navigation, route: { params: { postId } } }); },
    focus: () => { cleanup?.(); cleanup = focus?.(); },
  };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const find = (tree, type) => nodes(tree).find((node) => node.type === type);
const button = (tree, label) => nodes(tree).find((node) => typeof node.props?.onPress === 'function'
  && nodes(node).some((child) => child.type === 'Text' && child.props.children.includes(label)));

test('marketing feed renders immediately and likes and refresh never call the real forum', async () => {
  const f = fixture('ForumScreen');
  let tree = f.render(); f.focus();
  const list = find(tree, 'FlatList');
  assert.equal(list.props.data.length, 8);
  await list.props.refreshControl.props.onRefresh();
  await list.props.onEndReached();
  const card = list.props.renderItem({ item: list.props.data[0] });
  await card.props.onLike();
  tree = f.render();
  assert.equal(find(tree, 'FlatList').props.data[0].likeCount, 25);
  card.props.onPress();
  assert.equal(f.navigationCalls[0][0], 'ForumThread');
  assert.deepEqual(f.calls, []);
});

test('marketing thread supports nested replies, likes and reports without any real forum calls', async () => {
  const f = fixture('ForumThreadScreen', { postId: 'marketing-post-1' });
  let tree = f.render(); f.focus();
  const reply = nodes(tree).find((node) => node.type?.name === 'ReplyCard');
  assert.ok(reply.props.reply.body);
  reply.props.onReply();
  tree = f.render();
  find(tree, 'TextInput').props.onChangeText('This is my local sample reply.');
  tree = f.render();
  const send = nodes(tree).find((node) => node.props?.onPress && nodes(node).some((child) => child.props?.name === 'send'));
  await send.props.onPress();
  const latest = f.community.getThread('marketing-post-1').replies.at(-1);
  assert.equal(latest.parentReplyId, reply.props.reply.id);
  await reply.props.onLike();
  assert.equal(f.community.getThread('marketing-post-1').replies[0].likeCount, 11);
  reply.props.onReport();
  tree = f.render();
  await find(tree, 'ForumReportModal').props.onSubmit('other', 'Sample report');
  reply.props.onBlock();
  assert.deepEqual(f.calls, []);
  assert.ok(f.alerts.every((alert) => alert[0] === 'Marketing demo'));
});

test('marketing composer publishes only to the in-memory community', async () => {
  const f = fixture('CreateForumPostScreen');
  let tree = f.render();
  let inputs = nodes(tree).filter((node) => node.type === 'TextInput');
  inputs[0].props.onChangeText('A sample discussion');
  inputs[1].props.onChangeText('What are you practising this week?');
  tree = f.render();
  await button(tree, 'Post discussion').props.onPress();
  assert.equal(f.community.listPosts()[0].title, 'A sample discussion');
  assert.deepEqual(f.calls, []);
  assert.equal(f.navigationCalls[0][0], 'MainTabs');
});

test('switching marketing off restores the real feed and cannot send a leftover sample thread ID to the server', async () => {
  const mode = { enabled: true }, post = { id: 'real-post', title: 'Real discussion' };
  const f = fixture('ForumScreen', { mode, service: {
    getForumState: async () => ({ readEnabled: true }), listForumPosts: async () => [post],
  } });
  f.render(); f.focus();
  mode.enabled = false;
  f.render(); f.focus(); await tick();
  assert.equal(find(f.render(), 'FlatList').props.data[0], post);
  const thread = fixture('ForumThreadScreen', { mode, postId: 'marketing-post-1' });
  thread.render(); thread.focus(); await tick();
  assert.ok(!find(thread.render(), 'ForumPostCard'));
  assert.deepEqual(thread.calls, []);
});

test('a late real feed response cannot replace demo content or revive stale data after switching modes', async () => {
  const mode = { enabled: false };
  let finish;
  const response = new Promise((resolve) => { finish = resolve; });
  const f = fixture('ForumScreen', { mode, service: {
    getForumState: async () => ({ readEnabled: true }), listForumPosts: () => response,
  } });
  f.render(); f.focus();
  mode.enabled = true;
  f.render(); f.focus();
  finish([{ id: 'outdated-real-post' }]); await tick();
  assert.equal(find(f.render(), 'FlatList').props.data.length, 8);
  mode.enabled = false;
  assert.equal(find(f.render(), 'FlatList').props.data.length, 0);
});
