import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = ts.transpileModule(fs.readFileSync('supabase/functions/ai-coach/agent.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const shared = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('supabase/functions/_shared/learning-instructions.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: shared });
test('coach agent reads deterministic evidence, calls bounded account tools and disables provider storage', async () => {
  const requests = [], retrievals = [], exports = {};
  const outputs = [
    [{ type: 'function_call', name: 'get_profile', call_id: 'c1', arguments: '{}' }],
    [{ type: 'function_call', name: 'get_history', call_id: 'c2', arguments: '{"section":null,"offset":20}' }],
    [{ type: 'message', content: [{ type: 'output_text', text: 'Your progress is saved. Try one set, then review it.' }] }],
  ];
  vm.runInNewContext(source, { exports, AbortSignal, require: () => shared, Deno: { env: { get: (key) => key === 'OPENAI_API_KEY' ? 'test-key' : undefined } },
    fetch: async (_url, options) => { requests.push(JSON.parse(options.body)); return new Response(JSON.stringify({ status: 'completed', output: outputs.shift() })); } });
  const result = await exports.coachReply({ profile: { skills: [], freshQuestions: 48 }, baseline: {}, text: 'Do you remember my exam date?', history: [], retrieve: async (...args) => { retrievals.push(args); return { messages: [] }; } });
  assert.equal(requests.length, 3); assert.equal(requests[0].tool_choice.name, 'get_profile'); assert.ok(requests.every((r) => r.store === false && r.parallel_tool_calls === false));
  assert.ok(requests[1].input.some((i) => i.type === 'function_call_output' && JSON.parse(i.output).freshQuestions === 48));
  assert.equal(retrievals[0][0], 'get_history'); assert.equal(retrievals[0][1].offset, 20);
  assert.equal(result.content, 'Your progress is saved. Try one set, then review it.');
});
test('missing API configuration and provider failures return a deterministic fallback signal', async () => {
  for (const configured of [false, true]) {
    const exports = {};
    vm.runInNewContext(source, { exports, AbortSignal, require: () => shared, Deno: { env: { get: () => configured ? 'test-key' : undefined } }, fetch: async () => new Response('', { status: 503 }) });
    assert.equal(await exports.coachReply({ profile: {}, history: [], text: 'hello' }), null);
  }
});

test('coach sees tutor help interests separately from performance and can retrieve earlier explanations', async () => {
  const requests = [], retrievals = [], exports = {};
  const outputs = [
    [{ type: 'function_call', name: 'get_profile', call_id: 'p', arguments: '{}' }],
    [{ type: 'function_call', name: 'get_learning_history', call_id: 'h', arguments: '{"source":"tutor","query":"negation","offset":8}' }],
    [{ type: 'message', content: [{ type: 'output_text', text: 'We used the negation test earlier. You can revisit it in your next DM set.' }] }],
  ];
  vm.runInNewContext(source, { exports, AbortSignal, require: () => shared,
    Deno: { env: { get: (key) => key === 'OPENAI_API_KEY' ? 'test-key' : undefined } },
    fetch: async (_url, options) => { requests.push(JSON.parse(options.body)); return new Response(JSON.stringify({ output: outputs.shift() })); },
  });
  await exports.coachReply({ profile: { skills: [], weaknesses: [] }, text: 'What did we cover earlier?', history: [],
    sharedLearning: { supportSummary: { classification: 'help_requests_not_performance', totalRequests: 10 } },
    retrieve: async (...args) => { retrievals.push(args); return { conversations: [{ assistant_text: 'Use the negation test.' }] }; },
  });
  const evidence = JSON.parse(requests[1].input.find((i) => i.call_id === 'p' && i.type === 'function_call_output').output);
  assert.equal(evidence.learningSupport.supportSummary.totalRequests, 10); assert.equal(evidence.weaknesses.length, 0);
  assert.equal(retrievals[0][0], 'get_learning_history'); assert.equal(retrievals[0][1].source, 'tutor');
  assert.equal(retrievals[0][1].offset, 8);
});
