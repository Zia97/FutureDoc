import { OpenAIProvider } from '../providers/openai.ts';
import { buildQuestionContext, getTutorInstructions } from '../prompt-v2.ts';
import { TUTOR_EVAL_CASES } from './cases.ts';

const apiKey = Deno.env.get('OPENAI_API_KEY');
if (!apiKey) throw new Error('Set OPENAI_API_KEY before running tutor evaluations.');

const provider = new OpenAIProvider(apiKey, 'gpt-6-luna');
let passed = 0;

for (const testCase of TUTOR_EVAL_CASES) {
  const result = await provider.chat({
    instructions: getTutorInstructions(testCase.section, testCase.questionType),
    questionContext: buildQuestionContext({
      section: testCase.section,
      questionType: testCase.questionType,
      question: testCase.question,
      passage: testCase.passage,
      options: testCase.options,
      stimulusData: testCase.stimulusData,
      userAnswer: testCase.userAnswer,
      correctAnswer: testCase.correctAnswer,
      explanation: testCase.explanation,
      learnerInsights: [],
      isTimed: false,
    }),
    messages: [{ role: 'user', content: testCase.studentMessage }],
    section: testCase.section,
  });

  const lower = result.content.toLowerCase();
  const mentionsExpected = testCase.mustMentionAny.some((needle) => (
    lower.includes(needle.toLowerCase())
  ));
  const statusMatches = result.diagnostics.recordStatus === testCase.expectedRecordStatus;
  const ok = mentionsExpected && statusMatches && result.content.length <= 1800;
  if (ok) passed++;

  console.log(JSON.stringify({
    id: testCase.id,
    passed: ok,
    mentionsExpected,
    statusMatches,
    content: result.content,
    diagnostics: result.diagnostics,
    usage: result.usage,
    latencyMs: result.latencyMs,
  }));
}

console.log(`Tutor eval result: ${passed}/${TUTOR_EVAL_CASES.length} passed`);
if (passed !== TUTOR_EVAL_CASES.length) Deno.exit(1);
