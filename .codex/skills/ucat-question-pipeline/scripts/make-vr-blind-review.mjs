// Removes the supplied answer and explanation so the reviewer commits to an answer independently.
import path from 'node:path';
import { candidatePassages, parseArgs, readJson, writeJson } from './vr-common.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
if (!inputPath) throw new Error('Usage: npm run questions:blind-review:vr -- <candidate.json>');

const input = readJson(inputPath);
const parsed = candidatePassages(input, args.mode);
const passages = parsed.passages.map((passage) => ({
  id: passage.id,
  title: passage.title,
  body: passage.body,
  verbal_reasoning_questions: passage.verbal_reasoning_questions.map((question) => ({
    id: question.id,
    question_text: question.question_text,
    options: question.options,
    order_index: question.order_index,
  })),
}));
const packet = {
  schema_version: 1,
  source_candidate: path.relative(process.cwd(), path.resolve(inputPath)),
  mode: parsed.mode,
  instructions: 'Choose an answer from options and cite decisive passage evidence before seeing the supplied key.',
  passages,
};
const output = args.output || inputPath.replace(/\.json$/i, '') + '.blind-review.json';
const writtenPacket = writeJson(output, packet);
const responseOutput = args['response-output'] || output.replace(/\.json$/i, '') + '.response.json';
const response = {
  schema_version: 1,
  source_packet: path.relative(process.cwd(), path.resolve(writtenPacket)),
  validator: { model: '', started_at: '', completed_at: '' },
  committed_before_answer_reveal: false,
  responses: passages.flatMap((passage) => passage.verbal_reasoning_questions.map((question) => ({
    passage_id: passage.id,
    question_id: question.id,
    order_index: question.order_index,
    independent_answer: '',
    evidence: '',
    relationship_or_option_eliminations: '',
    confidence: '',
    ambiguity: '',
  }))),
};
console.log(`Blind-review packet written to ${writtenPacket}`);
console.log(`Blind-response form written to ${writeJson(responseOutput, response)}`);
