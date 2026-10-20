import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createBoundedAsyncCache } from '../src/lib/boundedAsyncCache.js';

test('bounded cache shares loads, isolates users, retries failures and evicts oversized values', async () => {
  const cache = createBoundedAsyncCache({ maxEntries: 1, maxBytes: 100 });
  let loads = 0;
  const read = () => cache.get('alice', async () => { loads++; return ['a']; });
  await Promise.all([read(), read(), read()]);
  assert.equal(loads, 1);
  assert.deepEqual(await cache.get('bob', async () => ['b']), ['b']);
  await read(); assert.equal(loads, 2);
  await assert.rejects(cache.get('failed', async () => { throw Error('offline'); }));
  assert.equal(await cache.get('failed', async () => 'recovered'), 'recovered');
  await cache.get('large', async () => 'x'.repeat(100));
  assert.equal(await cache.get('large', async () => 'fresh'), 'fresh');
});

test('lesson queue retains unacknowledged seconds, handles writes in flight, and scopes uploads', async () => {
  const values = new Map(), server = new Map();
  let account = 'alice', loseAck = true, gate = null, started;
  const storage = {
    getItem: async (key) => values.get(key) ?? null,
    multiGet: async (keys) => keys.map((key) => [key,values.get(key) ?? null]),
    setItem: async (key, value) => values.set(key, value),
    getAllKeys: async () => [...values.keys()],
    multiRemove: async (keys) => keys.forEach((key) => values.delete(key)),
  };
  const supabase = {
    auth: { getSession: async () => ({ data: { session: { user: { id: account }, access_token: account } } }) },
    rpc(name, args) {
      assert.equal(name, 'save_lesson_checkpoint');
      return {
        setHeader(_name, token) { assert.equal(token, `Bearer ${account}`); return this; },
        async then(resolve, reject) {
          try {
            started?.();
            if (gate) await gate;
            const key = `${account}:${args.p_device_id}`;
            server.set(key, Math.max(server.get(key) ?? 0, args.p_seconds));
            resolve(loseAck ? { error: Error('lost acknowledgement') } : {});
          } catch (error) { reject(error); }
        },
      };
    },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('src/services/lessonCheckpointQueue.js', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: (path) => path.includes('async-storage') ? { default: storage }
    : path.endsWith('supabase') ? { supabase } : { newCoachRequestId: () => crypto.randomUUID() } });
  const save = (seconds) => exports.queueLessonCheckpoint('alice', { lessonId: 'vr-one', section: 'vr', deltaSeconds: seconds });
  await save(60);
  await assert.rejects(exports.flushLessonCheckpoints('alice'), /lost acknowledgement/);
  loseAck = false;
  await exports.flushLessonCheckpoints('alice');
  assert.equal([...server.values()][0], 60);
  await save(5);
  let release;
  gate = new Promise((resolve) => { release = resolve; });
  const uploading = new Promise((resolve) => { started = resolve; });
  const flush = exports.flushLessonCheckpoints('alice');
  await uploading;
  await save(10);
  release(); await flush; gate = null;
  assert.equal([...server.values()][0], 75, 'drain uploads new checkpoint instead of clearing it with the old acknowledgement');
  await save(5);
  account = 'bob';
  await exports.flushLessonCheckpoints('alice');
  assert.equal(server.size, 1);
  account = 'alice';
  await exports.flushLessonCheckpoints('alice');
  assert.equal([...server.values()][0], 80);
  assert.equal(JSON.parse([...values.values()][0]).dirty, false);
  await exports.clearLessonCheckpoints();
  assert.equal(values.size, 0);
});
