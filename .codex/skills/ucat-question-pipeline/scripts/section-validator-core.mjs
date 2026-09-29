import { isUuidV4, lexicalSimilarity, normaliseText, wordCount } from './vr-common.mjs';
import { normalisePreview } from './section-common.mjs';
import { computeLayout } from '../../../../src/utils/venn/layout.js';

export const DM_TYPES = [
  'syllogism', 'logic_puzzle', 'interpreting_info',
  'recognising_assumptions', 'venn_diagram', 'probabilistic',
];

export const SJ_LABELS = {
  1: ['Very important', 'Important', 'Of minor importance', 'Not important at all'],
  2: ['A very appropriate thing to do', 'Appropriate, but not ideal', 'Inappropriate, but not awful', 'A very inappropriate thing to do'],
};

const QR_STIMULUS_TYPES = new Set([
  'table', 'bar_chart', 'line_graph', 'pie_chart', 'scatter_plot',
  'network_diagram', 'geometry_diagram', 'text', 'formula', 'multi',
]);
const DM_VENN_SHAPES = new Set([
  'circle', 'oval', 'vertical_oval', 'square', 'rectangle', 'horizontal_strip',
  'vertical_strip', 'triangle', 'isosceles_triangle', 'diamond', 'trapezoid',
  'parallelogram', 'pentagon', 'hexagon', 'octagon', 'star', 'right_arrow', 'left_arrow',
]);
export function validateSectionCandidate({ section, input, modeHint, corpus = null, brief = null, expectedQuestions = null }) {
  const issues = [];
  const ids = new Map();
  const corpusIds = collectCorpusIds(corpus);
  const add = (severity, code, message, location) => issues.push({ severity, code, message, ...(location ? { location } : {}) });
  const registerId = (id, location) => {
    if (!isUuidV4(id)) add('error', 'schema.uuid_v4', `New content ID must be a UUID v4; found ${String(id)}.`, location);
    if (ids.has(id)) add('error', 'schema.duplicate_uuid', `ID is also used at ${ids.get(id)}.`, location);
    else ids.set(id, location);
    if (corpusIds.has(id)) add('error', 'schema.corpus_uuid_collision', `ID already exists in the corpus (${corpusIds.get(id)}).`, location);
  };

  if (!Array.isArray(input) || input.length === 0) {
    add('error', 'schema.root', 'Candidate must be a non-empty JSON array.');
    return finish(section, modeHint || 'practice', 0, [], issues);
  }
  const wrapperKey = section === 'dm' ? 'questions' : section === 'qr' ? 'sets' : 'scenarios';
  const looksTimed = input.length === 1 && Array.isArray(input[0]?.[wrapperKey]);
  const mode = modeHint || (looksTimed ? 'timed' : 'practice');
  if (mode === 'timed' && !looksTimed) add('error', 'schema.timed_wrapper', `Timed ${section.toUpperCase()} requires one wrapper with a ${wrapperKey} array.`);
  if (mode === 'practice' && looksTimed) add('error', 'schema.practice_root', `Practice ${section.toUpperCase()} must not use a timed-test wrapper.`);

  let questionCount = 0;
  if (section === 'dm') questionCount = validateDm(input, mode, add, registerId);
  else if (section === 'qr') questionCount = validateQr(input, mode, add, registerId);
  else if (section === 'sj') questionCount = validateSj(input, mode, add, registerId);
  else add('error', 'section.unsupported', `Unsupported section: ${section}.`);

  if (expectedQuestions != null && questionCount !== Number(expectedQuestions)) {
    add('error', 'batch.question_count', `Expected ${expectedQuestions} questions but found ${questionCount}.`);
  }
  validateBrief({ brief, corpus, section, mode, questionCount, stats: candidateStats(section, input, mode), add });
  let nearest = [];
  try {
    const candidateUnits = normalisePreview(section, mode === 'practice' ? input : [], mode === 'timed' ? input : []);
    nearest = compareNovelty(candidateUnits, corpus?.units || [], add);
  } catch (error) {
    add('error', 'schema.normalisation', error.message);
  }
  return finish(section, mode, questionCount, nearest, issues);
}

function validateDm(input, mode, add, registerId) {
  const questions = mode === 'timed' ? (input[0]?.questions || []) : input;
  const timedTypes = mode === 'timed' ? [
    ...Array(5).fill('syllogism'),
    ...Array(6).fill('logic_puzzle'),
    ...Array(6).fill('interpreting_info'),
    ...Array(5).fill('recognising_assumptions'),
    ...Array(6).fill('venn_diagram'),
    ...Array(7).fill('probabilistic'),
  ] : null;
  if (mode === 'timed') {
    const test = input[0] || {};
    if (input.length !== 1) add('error', 'timed.wrapper_count', 'Timed DM requires exactly one test wrapper.');
    if (test.question_count !== 35) add('error', 'timed.question_count', 'Timed DM question_count must be 35.');
    if (test.time_minutes !== 37) add('error', 'timed.time_minutes', 'Timed DM time_minutes must be 37.');
    if (questions.length !== 35) add('error', 'timed.actual_count', `Timed DM must contain 35 questions; found ${questions.length}.`);
  }
  const seenOrder = new Set();
  for (const [index, q] of questions.entries()) {
    const loc = `questions[${index}]`;
    registerId(q?.id, `${loc}.id`);
    requiredStrings(q, ['title', 'stem'], add, loc);
    if (!DM_TYPES.includes(q?.type)) add('error', 'dm.type', `Unsupported DM type: ${String(q?.type)}.`, loc);
    if (timedTypes && q?.type !== timedTypes[index]) add('error', 'timed.dm_type_order', `Timed DM question ${index + 1} must be ${timedTypes[index]}.`, loc);
    checkDifficulty(q?.difficulty, add, loc);
    const expectedOrder = mode === 'timed' ? index + 1 : null;
    if (!Number.isInteger(q?.order_index)) add('error', 'schema.order_index', 'order_index must be an integer.', loc);
    if (seenOrder.has(q?.order_index)) add('error', 'schema.order_duplicate', 'Duplicate question order_index.', loc);
    seenOrder.add(q?.order_index);
    if (expectedOrder != null && q.order_index !== expectedOrder) add('error', 'timed.order_sequence', `Timed DM order_index must be ${expectedOrder}.`, loc);
    const statements = q?.decision_making_question_statements || [];
    const options = q?.options || q?.decision_making_question_options || [];
    const isStatement = ['syllogism', 'interpreting_info'].includes(q?.type);
    if (isStatement) validateDmStatements(statements, q, add, registerId, loc);
    else validateOptions(options, 4, ['A', 'B', 'C', 'D'], q, add, registerId, loc, 'option_text');
    if (q?.type === 'recognising_assumptions' && Array.isArray(options)) {
      const yes = options.filter((o) => /^yes[;,]/i.test(String(o.option_text || o.text || ''))).length;
      const no = options.filter((o) => /^no[;,]/i.test(String(o.option_text || o.text || ''))).length;
      if (yes !== 2 || no !== 2) add('error', 'dm.assumption_balance', 'Recognising-assumptions options must contain two Yes and two No judgements.', loc);
    }
    if (q?.type === 'venn_diagram') {
      const stimulus = q.stimulus_diagram ?? q.stimulusDiagram;
      const optionConfigs = options.map((o) => o.option_data ?? o.vennConfig);
      const hasOptionDiagrams = optionConfigs.some(Boolean);
      if (hasOptionDiagrams && optionConfigs.some((config) => !config)) {
        add('error', 'dm.venn_option_diagrams', 'Diagram-selection questions need a diagram in every A-D option.', loc);
      }
      if (hasOptionDiagrams && optionConfigs.every((config) => Array.isArray(config?.sets))) {
        const signatures = optionConfigs.map((config) => JSON.stringify(config.sets.map((set) => [set.id, set.label, set.shape || 'circle'])));
        if (new Set(signatures).size !== 1) {
          add('error', 'dm.venn_option_key', 'All diagram options must use the same set labels and shapes because the renderer shows one shared key.', loc);
        }
      }
      if (stimulus && hasOptionDiagrams) {
        add('error', 'dm.venn_format', 'Use either a stimulus diagram or diagram options, not both.', loc);
      }
      const configs = [stimulus, ...optionConfigs].filter(Boolean);
      if (!configs.length) add('error', 'dm.venn_missing', 'Venn question needs a stimulus diagram or diagram options.', loc);
      configs.forEach((config, configIndex) => validateDmVenn(config, add, `${loc}.venn[${configIndex}]`));
    }
    if (q?.table_data != null) validateTable(q.table_data, add, `${loc}.table_data`);
    if (mode === 'practice' && typeof q?.is_free !== 'boolean') add('error', 'schema.is_free', 'Practice DM is_free must be a boolean.', loc);
  }
  return questions.length;
}

function validateDmStatements(statements, q, add, registerId, loc) {
  if (!Array.isArray(statements) || statements.length !== 5) {
    add('error', 'dm.statements', 'Syllogism and interpreting-info questions require exactly five statements.', loc);
    return;
  }
  const answers = [];
  statements.forEach((s, i) => {
    const sLoc = `${loc}.decision_making_question_statements[${i}]`;
    if (s.id != null) registerId(s.id, `${sLoc}.id`);
    if (!nonEmpty(s.statement_text)) add('error', 'schema.statement_text', 'statement_text must be non-empty.', sLoc);
    if (!['Yes', 'No'].includes(s.correct_answer)) add('error', 'dm.statement_answer', 'Statement answer must be Yes or No.', sLoc);
    if (!nonEmpty(s.answer_reason)) add('error', 'schema.answer_reason', 'Each statement needs an answer_reason.', sLoc);
    if (s.order_index !== i + 1) add('error', 'dm.statement_order', `Statement order_index must be ${i + 1}.`, sLoc);
    answers.push(s.correct_answer);
  });
  if (new Set(answers).size < 2) add('warning', 'dm.statement_balance', 'All five statements have the same answer; review for patterning.', loc);
  if (q.correct_answer && typeof q.correct_answer === 'object') {
    statements.forEach((s, i) => {
      if (q.correct_answer[i] !== s.correct_answer) add('error', 'dm.parent_answer_map', `Parent answer ${i} does not match statement answer.`, loc);
    });
  }
}

function validateQr(input, mode, add, registerId) {
  const sets = mode === 'timed' ? (input[0]?.sets || []) : input;
  if (mode === 'timed') {
    const test = input[0] || {};
    if (input.length !== 1) add('error', 'timed.wrapper_count', 'Timed QR requires exactly one test wrapper.');
    if (test.question_count !== 36) add('error', 'timed.question_count', 'Timed QR question_count must be 36.');
    if (test.time_minutes !== 26) add('error', 'timed.time_minutes', 'Timed QR time_minutes must be 26.');
  }
  let count = 0;
  sets.forEach((set, setIndex) => {
    const loc = `sets[${setIndex}]`;
    registerId(set?.id || set?.set_id, `${loc}.${mode === 'timed' ? 'set_id' : 'id'}`);
    if (!nonEmpty(set?.title)) add('error', 'schema.title', 'Set title must be non-empty.', loc);
    if (mode === 'practice' && typeof set?.is_free !== 'boolean') add('error', 'schema.is_free', 'Practice QR is_free must be a boolean.', loc);
    validateQrStimulus(set?.stimulus, add, `${loc}.stimulus`);
    const questions = mode === 'timed' ? set?.questions : set?.quantitative_reasoning_questions;
    if (!Array.isArray(questions) || questions.length < 1 || questions.length > 4) {
      add('error', 'qr.questions_per_set', 'Each QR set must contain 1 to 4 questions.', loc);
      return;
    }
    count += questions.length;
    questions.forEach((q, qIndex) => {
      const qLoc = `${loc}.questions[${qIndex}]`;
      registerId(q?.id, `${qLoc}.id`);
      const text = mode === 'timed' ? q?.stem : q?.question_text;
      if (!nonEmpty(text)) add('error', 'schema.question_text', `${mode === 'timed' ? 'stem' : 'question_text'} must be non-empty.`, qLoc);
      validateOptions(q?.options, 5, ['A', 'B', 'C', 'D', 'E'], q, add, registerId, qLoc, 'text', false);
      validateNumericOptionOrder(q?.options, add, qLoc);
      checkDifficulty(q?.difficulty, add, qLoc);
      if (q?.order_index !== qIndex) add('error', 'qr.order_sequence', `Question order_index must be ${qIndex}.`, qLoc);
    });
  });
  if (mode === 'timed' && count !== 36) add('error', 'timed.actual_count', `Timed QR must contain 36 questions; found ${count}.`);
  return count;
}

function validateQrStimulus(stimulus, add, loc) {
  if (!stimulus || typeof stimulus !== 'object') return add('error', 'qr.stimulus', 'stimulus must be an object.', loc);
  if (!QR_STIMULUS_TYPES.has(stimulus.type)) add('error', 'qr.stimulus_type', `Unsupported stimulus type: ${String(stimulus.type)}.`, loc);
  if (!['text', 'formula', 'multi'].includes(stimulus.type) && !nonEmpty(stimulus.context)) {
    add('error', 'qr.stimulus_context', 'Visual and table stimuli require context text.', loc);
  }
  const data = stimulus.data || {};
  if (stimulus.type === 'table') validateTable(data, add, `${loc}.data`);
  if (['bar_chart', 'line_graph'].includes(stimulus.type)) {
    const labels = data.labels;
    if (!Array.isArray(labels) || !labels.length) add('error', 'qr.chart_labels', 'Chart labels must be non-empty.', loc);
    if (!Array.isArray(data.series) || !data.series.length) add('error', 'qr.chart_series', 'Chart series must be non-empty.', loc);
    else data.series.forEach((series, i) => {
      if (!Array.isArray(series.values) || series.values.length !== labels?.length) add('error', 'qr.chart_length', 'Every chart series must match labels length.', `${loc}.data.series[${i}]`);
      if (!series.values?.every((v) => v === null || finiteNumber(v))) add('error', 'qr.chart_number', 'Chart values must be finite numbers or null.', `${loc}.data.series[${i}]`);
    });
  }
  if (stimulus.type === 'pie_chart') {
    if (!Array.isArray(data.segments) || data.segments.length < 2) add('error', 'qr.pie_segments', 'Pie chart needs at least two segments.', loc);
    const missing = (data.segments || []).filter((s) => s.value == null).length;
    if (missing > 1) add('error', 'qr.pie_missing', 'Pie chart supports at most one missing segment.', loc);
    if (data.total != null && (!finiteNumber(data.total) || data.total <= 0)) add('error', 'qr.pie_total', 'Pie total must be positive.', loc);
  }
  if (stimulus.type === 'scatter_plot') {
    const points = (data.series || []).flatMap((s) => s.points || []);
    if (!points.length || !points.every((p) => finiteNumber(p.x) && finiteNumber(p.y))) add('error', 'qr.scatter_points', 'Scatter plot requires finite x/y points.', loc);
  }
  if (stimulus.type === 'network_diagram') {
    const nodeIds = new Set((data.nodes || []).map((n) => n.id));
    if (!nodeIds.size || nodeIds.size !== (data.nodes || []).length) add('error', 'qr.network_nodes', 'Network node IDs must be present and unique.', loc);
    for (const edge of data.edges || []) if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) add('error', 'qr.network_edge', 'Network edge points to a missing node.', loc);
  }
  if (stimulus.type === 'geometry_diagram') validateGeometry(data, add, `${loc}.data`);
  if (['text', 'formula'].includes(stimulus.type) && !nonEmpty(stimulus.text || data.text)) add('error', 'qr.stimulus_text', `${stimulus.type} stimulus requires text.`, loc);
  if (stimulus.type === 'multi') {
    if (!Array.isArray(stimulus.items) || !stimulus.items.length) add('error', 'qr.multi_items', 'Multi stimulus requires items.', loc);
    else stimulus.items.forEach((item, i) => validateQrStimulus(item, add, `${loc}.items[${i}]`));
  }
}

function validateSj(input, mode, add, registerId) {
  const scenarios = mode === 'timed' ? (input[0]?.scenarios || []) : input;
  if (mode === 'timed') {
    const test = input[0] || {};
    if (input.length !== 1) add('error', 'timed.wrapper_count', 'Timed SJ requires exactly one test wrapper.');
    if (test.question_count !== 69) add('error', 'timed.question_count', 'Timed SJ question_count must be 69.');
    if (test.time_minutes !== 26) add('error', 'timed.time_minutes', 'Timed SJ time_minutes must be 26.');
  }
  let count = 0;
  const allItemTexts = new Map();
  scenarios.forEach((scenario, scenarioIndex) => {
    const loc = `scenarios[${scenarioIndex}]`;
    registerId(scenario?.id, `${loc}.id`);
    const body = mode === 'timed' ? scenario?.stem : scenario?.body;
    if (!nonEmpty(body)) add('error', 'sj.scenario_text', `${mode === 'timed' ? 'stem' : 'body'} must be non-empty.`, loc);
    const sentenceCount = String(body || '').split(/[.!?]+/).filter((v) => v.trim()).length;
    if (sentenceCount < 2 || sentenceCount > 5) add('warning', 'sj.scenario_length', `Scenario has ${sentenceCount} sentences; review against the usual 2-5.`, loc);
    if (mode === 'practice' && typeof scenario?.is_free !== 'boolean') add('error', 'schema.is_free', 'Practice SJ is_free must be a boolean.', loc);
    if (mode === 'timed' && scenario?.order_index !== scenarioIndex) add('error', 'sj.scenario_order', `Scenario order_index must be ${scenarioIndex}.`, loc);
    const items = mode === 'timed' ? scenario?.items : scenario?.situational_judgement_questions;
    if (!Array.isArray(items) || items.length < 2 || items.length > 6) {
      add('error', 'sj.items_per_scenario', 'Each new SJ scenario must contain 2 to 6 items.', loc);
      return;
    }
    count += items.length;
    items.forEach((item, itemIndex) => {
      const iLoc = `${loc}.items[${itemIndex}]`;
      registerId(item?.id, `${iLoc}.id`);
      const text = mode === 'timed' ? item?.text : item?.question_text;
      if (!nonEmpty(text)) add('error', 'sj.item_text', 'Item text must be non-empty.', iLoc);
      const normalised = normaliseText(text);
      if (normalised && allItemTexts.has(normalised)) add('error', 'sj.duplicate_item', `Item wording duplicates ${allItemTexts.get(normalised)}.`, iLoc);
      else if (normalised) allItemTexts.set(normalised, iLoc);
      const labelSet = mode === 'timed' ? (item?.type === 'importance' ? 1 : item?.type === 'appropriateness' ? 2 : null) : item?.label_set;
      if (![1, 2].includes(labelSet)) add('error', 'sj.label_type', 'Use importance/label_set 1 or appropriateness/label_set 2 only; Most/Least is unsupported.', iLoc);
      if (labelSet && !SJ_LABELS[labelSet].includes(item?.correct_answer)) add('error', 'sj.correct_answer', 'correct_answer must exactly match the selected four-point label scale.', iLoc);
      if (!nonEmpty(item?.answer_reason)) add('error', 'schema.answer_reason', 'answer_reason must be non-empty.', iLoc);
      checkDifficulty(item?.difficulty, add, iLoc);
      if (item?.order_index !== itemIndex) add('error', 'sj.item_order', `Item order_index must be ${itemIndex}.`, iLoc);
    });
  });
  if (mode === 'timed' && count !== 69) add('error', 'timed.actual_count', `Timed SJ must contain 69 questions; found ${count}.`);
  return count;
}

function validateDmVenn(config, add, loc) {
  if (!config || typeof config !== 'object' || !Array.isArray(config.sets) || config.sets.length < 2 || !config.regions || typeof config.regions !== 'object') {
    add('error', 'dm.venn_schema', 'Venn config requires sets and regions.', loc);
    return;
  }
  if (config.diagramLayout != null && config.diagramLayout !== 'auto') add('error', 'dm.venn_layout', 'New Venn diagrams must use diagramLayout "auto".', loc);
  const setIds = new Set();
  config.sets.forEach((set, index) => {
    const expected = `set${index + 1}`;
    if (set.id !== expected) add('error', 'dm.venn_set_id', `Venn set IDs must be sequential; expected ${expected}.`, `${loc}.sets[${index}]`);
    if (setIds.has(set.id)) add('error', 'dm.venn_set_duplicate', `Duplicate Venn set ID ${set.id}.`, loc);
    setIds.add(set.id);
    if (!nonEmpty(set.label)) add('error', 'dm.venn_set_label', 'Venn sets need labels.', `${loc}.sets[${index}]`);
    if (!DM_VENN_SHAPES.has(set.shape || 'circle')) add('error', 'dm.venn_shape', `Unsupported Venn shape: ${String(set.shape)}.`, `${loc}.sets[${index}]`);
  });
  for (const [region, value] of Object.entries(config.regions)) {
    if (region !== 'outside') {
      const base = region.endsWith('_only') ? region.slice(0, -5) : region;
      const ids = base.split('_');
      if (!ids.length || ids.some((id) => !setIds.has(id))) add('error', 'dm.venn_region_key', `Region ${region} references missing sets.`, loc);
      const indexes = ids.map((id) => Number(id.slice(3)));
      if (indexes.some((number, i) => i > 0 && number <= indexes[i - 1])) add('error', 'dm.venn_region_order', `Region ${region} must list sets in ascending order.`, loc);
    }
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) add('error', 'dm.venn_region_value', `Region ${region} must not contain a negative/non-finite value.`, loc);
    if (!['string', 'number'].includes(typeof value)) add('error', 'dm.venn_region_value', `Region ${region} must contain text or a number.`, loc);
  }
  try {
    const baked = computeLayout(config);
    if (!baked?.shapes?.length) add('error', 'dm.venn_bake', 'Venn baker produced no shapes.', loc);
  } catch (error) {
    add('error', 'dm.venn_bake', `Venn baker failed: ${error.message}`, loc);
  }
}

function validateGeometry(data, add, loc) {
  if (!data || !Array.isArray(data.shapes) || !data.shapes.length) return add('error', 'qr.geometry_shapes', 'Geometry diagram requires at least one shape.', loc);
  const width = data.viewBox?.width ?? 300;
  const height = data.viewBox?.height ?? 220;
  if (!finiteNumber(width) || width <= 0 || !finiteNumber(height) || height <= 0) add('error', 'qr.geometry_viewbox', 'Geometry viewBox width/height must be positive finite numbers.', loc);
  const requiredByType = {
    rect: ['x', 'y', 'width', 'height'], line: ['x1', 'y1', 'x2', 'y2'], circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'], arc: ['cx', 'cy', 'r'],
  };
  data.shapes.forEach((shape, index) => {
    const sLoc = `${loc}.shapes[${index}]`;
    if (!['rect', 'line', 'circle', 'ellipse', 'polygon', 'arc'].includes(shape?.type)) return add('error', 'qr.geometry_type', `Unsupported geometry shape: ${String(shape?.type)}.`, sLoc);
    for (const key of requiredByType[shape.type] || []) if (!finiteNumber(shape[key])) add('error', 'qr.geometry_number', `${shape.type}.${key} must be finite.`, sLoc);
    if (['rect', 'circle', 'ellipse', 'arc'].includes(shape.type)) {
      for (const key of ['width', 'height', 'r', 'rx', 'ry']) if (shape[key] != null && shape[key] <= 0) add('error', 'qr.geometry_size', `${shape.type}.${key} must be positive.`, sLoc);
    }
    if (shape.type === 'polygon' && (!Array.isArray(shape.points) || shape.points.length < 3 || !shape.points.every(point2d))) add('error', 'qr.geometry_points', 'Polygon requires at least three finite [x,y] points.', sLoc);
    if (shape.type === 'arc' && ((shape.startAngle != null && !finiteNumber(shape.startAngle)) || (shape.endAngle != null && !finiteNumber(shape.endAngle)))) add('error', 'qr.geometry_angle', 'Arc angles must be finite.', sLoc);
  });
  for (const [index, dim] of (data.dimensions || []).entries()) {
    const dLoc = `${loc}.dimensions[${index}]`;
    if (!point2d(dim?.from) || !point2d(dim?.to) || !nonEmpty(dim?.label)) add('error', 'qr.geometry_dimension', 'Dimension needs finite from/to points and a label.', dLoc);
    if (dim?.side != null && !['top', 'bottom', 'left', 'right'].includes(dim.side)) add('error', 'qr.geometry_dimension_side', 'Dimension side must be top, bottom, left, or right.', dLoc);
  }
}

function validateNumericOptionOrder(options, add, loc) {
  if (!Array.isArray(options) || options.length < 2) return;
  const parsed = options.map((option) => parseNumericOption(option?.text));
  if (parsed.some((value) => !value)) return;
  if (new Set(parsed.map((value) => value.unit)).size !== 1) return;
  for (let index = 1; index < parsed.length; index += 1) {
    if (parsed[index].number <= parsed[index - 1].number) {
      add('error', 'qr.numeric_option_order', 'Comparable numeric options must be unique and ascending.', loc);
      return;
    }
  }
}

function parseNumericOption(value) {
  const text = String(value || '').trim();
  const matches = [...text.matchAll(/-?\d[\d,]*(?:\.\d+)?/g)];
  if (matches.length !== 1) return null;
  const number = Number(matches[0][0].replaceAll(',', ''));
  if (!Number.isFinite(number)) return null;
  const unit = normaliseText(`${text.slice(0, matches[0].index)} ${text.slice(matches[0].index + matches[0][0].length)}`);
  return { number, unit };
}

function validateOptions(options, length, labels, q, add, registerId, loc, textKey, registerOptionIds = true) {
  if (!Array.isArray(options) || options.length !== length) return add('error', 'schema.options', `Expected exactly ${length} options.`, loc);
  const actualLabels = options.map((o) => o?.label);
  if (JSON.stringify(actualLabels) !== JSON.stringify(labels)) add('error', 'schema.option_labels', `Option labels must be ${labels.join(', ')} in order.`, loc);
  const texts = [];
  options.forEach((o, i) => {
    const oLoc = `${loc}.options[${i}]`;
    if (registerOptionIds && o?.id != null) registerId(o.id, `${oLoc}.id`);
    const text = o?.[textKey] ?? o?.text;
    if (!nonEmpty(text) && o?.option_data == null && o?.vennConfig == null) add('error', 'schema.option_text', 'Option needs text or diagram data.', oLoc);
    texts.push(normaliseText(text || JSON.stringify(o?.option_data || o?.vennConfig || '')));
    const expected = loc.startsWith('questions[') ? i + 1 : null;
    if (o?.order_index != null && expected != null && o.order_index !== expected) add('error', 'schema.option_order', `Option order_index must be ${expected}.`, oLoc);
  });
  if (new Set(texts).size !== texts.length) add('error', 'schema.option_duplicate', 'Options must be unique.', loc);
  if (!labels.includes(q?.correct_answer)) add('error', 'schema.correct_answer', 'correct_answer must be one of the option labels.', loc);
  if (!nonEmpty(q?.answer_reason)) add('error', 'schema.answer_reason', 'answer_reason must be non-empty.', loc);
  else if (wordCount(q.answer_reason) < 8) add('warning', 'content.short_explanation', 'answer_reason is unusually short.', loc);
}

function validateTable(value, add, loc) {
  const data = value?.headers || value?.rows ? value : value?.data;
  if (!data || !Array.isArray(data.headers) || !data.headers.length || !Array.isArray(data.rows) || !data.rows.length) {
    add('error', 'schema.table', 'Table requires non-empty headers and rows arrays.', loc);
    return;
  }
  if (!data.headers.every((v) => typeof v === 'string')) add('error', 'schema.table_header', 'Table headers must be strings.', loc);
  data.rows.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== data.headers.length || !row.every((v) => typeof v === 'string')) add('error', 'schema.table_row', 'Every table row must contain one string cell per header.', `${loc}.rows[${i}]`);
  });
}

function validateBrief({ brief, corpus, section, mode, questionCount, stats, add }) {
  if (!brief) return;
  if (brief.section && brief.section !== section) add('error', 'brief.section', `Brief section ${brief.section} does not match ${section}.`);
  if (brief.mode && brief.mode !== mode) add('error', 'brief.mode', `Brief mode ${brief.mode} does not match ${mode}.`);
  if (brief.question_count != null && Number(brief.question_count) !== questionCount) add('error', 'brief.question_count', `Brief requires ${brief.question_count} questions but candidate has ${questionCount}.`);
  if (brief.unit_count != null && Number(brief.unit_count) > 0 && Number(brief.unit_count) !== stats.unit_count) add('error', 'brief.unit_count', `Brief requires ${brief.unit_count} units but candidate has ${stats.unit_count}.`);
  if (Array.isArray(brief.unit_question_counts) && JSON.stringify(brief.unit_question_counts) !== JSON.stringify(stats.unit_question_counts)) {
    add('error', 'brief.unit_question_counts', `Brief requires unit question counts ${brief.unit_question_counts.join(', ')}, but candidate has ${stats.unit_question_counts.join(', ')}.`);
  }
  for (const [difficulty, expected] of Object.entries(brief.difficulty_allocation || {})) {
    const key = difficulty.replace(/_questions$/, '');
    if (Number.isFinite(Number(expected)) && Number(expected) !== (stats.difficulties[key] || 0)) add('error', `brief.difficulty.${difficulty}`, `Brief requires ${expected} ${difficulty}, but candidate has ${stats.difficulties[key] || 0}.`);
  }
  for (const [type, expected] of Object.entries(brief.type_or_skill_allocation || {})) {
    const key = type.replace(/_questions$/, '');
    if (Number.isFinite(Number(expected)) && Number(expected) !== (stats.types[key] || 0)) add('error', `brief.type.${type}`, `Brief requires ${expected} for ${type}, but candidate has ${stats.types[key] || 0}.`);
  }
  const interpreting = brief.section_constraints?.interpreting_info;
  if (interpreting) {
    if (Number(interpreting.table_based_min || 0) > stats.dm_interpreting_table) add('error', 'brief.dm_interpreting_table', `Brief requires at least ${interpreting.table_based_min} table-based interpreting-information questions; found ${stats.dm_interpreting_table}.`);
    if (Number(interpreting.passage_only_min || 0) > stats.dm_interpreting_passage) add('error', 'brief.dm_interpreting_passage', `Brief requires at least ${interpreting.passage_only_min} passage-only interpreting-information questions; found ${stats.dm_interpreting_passage}.`);
  }
  if (section === 'dm') {
    const statsVenn = stats.dm_venn;
    const defaults = statsVenn.total >= 4 ? {
      mixed_shape_min: Math.ceil(statsVenn.total / 2),
      select_diagram_min: 1,
      stimulus_diagram_min: 1,
      distinct_set_counts_min: 2,
      distinct_shape_types_min: 4,
      distinct_region_patterns_min: 3,
    } : {};
    const requirements = { ...defaults, ...brief.section_constraints?.venn_diagram };
    for (const [key, minimum] of Object.entries(requirements)) {
      const actual = statsVenn[key.replace(/_min$/, '')];
      if (actual != null && Number(minimum) > actual) {
        add('error', `brief.dm_venn_${key}`, `Brief requires at least ${minimum} for ${key}, but found ${actual}.`);
      }
    }
  }
  if (corpus && !brief.corpus_run_id) add('error', 'brief.corpus_run_id_missing', 'Brief must record the corpus run_id.');
  if (corpus && brief.corpus_run_id && brief.corpus_run_id !== corpus.run_id) add('error', 'brief.corpus_run_id', `Brief used ${brief.corpus_run_id}, but checker loaded ${corpus.run_id}.`);
}

function candidateStats(section, input, mode) {
  const difficulties = {};
  const types = {};
  let unitCount = 0;
  const unitQuestionCounts = [];
  let dmInterpretingTable = 0;
  let dmInterpretingPassage = 0;
  const dmVenn = {
    total: 0,
    mixed_shape: 0,
    select_diagram: 0,
    stimulus_diagram: 0,
    distinct_set_counts: 0,
    distinct_shape_types: 0,
    distinct_region_patterns: 0,
  };
  const vennSetCounts = new Set();
  const vennShapeTypes = new Set();
  const vennRegionPatterns = new Set();
  const addDifficulty = (value) => { difficulties[value] = (difficulties[value] || 0) + 1; };
  const addType = (value, amount = 1) => { types[value] = (types[value] || 0) + amount; };
  if (section === 'dm') {
    const questions = mode === 'timed' ? input[0]?.questions || [] : input;
    unitCount = questions.length;
    questions.forEach((q) => {
      unitQuestionCounts.push(1);
      addDifficulty(q.difficulty);
      addType(q.type);
      if (q.type === 'interpreting_info') {
        if (q.table_data != null) dmInterpretingTable += 1;
        else dmInterpretingPassage += 1;
      }
      if (q.type === 'venn_diagram') {
        dmVenn.total += 1;
        const options = q.options || q.decision_making_question_options || [];
        const hasOptionDiagrams = options.some((option) => option.option_data ?? option.vennConfig);
        if (hasOptionDiagrams) dmVenn.select_diagram += 1;
        else if (q.stimulus_diagram ?? q.stimulusDiagram) dmVenn.stimulus_diagram += 1;
        const selectedOption = options.find((option) => option.label === q.correct_answer);
        const config = hasOptionDiagrams
          ? (selectedOption?.option_data ?? selectedOption?.vennConfig)
          : (q.stimulus_diagram ?? q.stimulusDiagram);
        if (Array.isArray(config?.sets)) {
          vennSetCounts.add(config.sets.length);
          vennRegionPatterns.add(vennRegionPattern(config));
          const shapes = config.sets.map((set) => set.shape || 'circle');
          shapes.forEach((shape) => vennShapeTypes.add(shape));
          if (new Set(shapes).size > 1) dmVenn.mixed_shape += 1;
        }
      }
    });
  } else if (section === 'qr') {
    const sets = mode === 'timed' ? input[0]?.sets || [] : input;
    unitCount = sets.length;
    sets.forEach((set) => {
      const questions = set.questions || set.quantitative_reasoning_questions || [];
      unitQuestionCounts.push(questions.length);
      addType(`stimulus:${set.stimulus?.type}:sets`);
      addType(`stimulus:${set.stimulus?.type}:questions`, questions.length);
      questions.forEach((q) => addDifficulty(q.difficulty));
    });
  } else {
    const scenarios = mode === 'timed' ? input[0]?.scenarios || [] : input;
    unitCount = scenarios.length;
    scenarios.forEach((scenario) => {
      const items = scenario.items || scenario.situational_judgement_questions || [];
      unitQuestionCounts.push(items.length);
      items.forEach((item) => {
        addDifficulty(item.difficulty);
        const type = mode === 'timed' ? item.type : item.label_set === 1 ? 'importance' : item.label_set === 2 ? 'appropriateness' : 'unsupported';
        addType(type);
      });
    });
  }
  return {
    unit_count: unitCount,
    unit_question_counts: unitQuestionCounts,
    difficulties,
    types,
    dm_interpreting_table: dmInterpretingTable,
    dm_interpreting_passage: dmInterpretingPassage,
    dm_venn: {
      ...dmVenn,
      distinct_set_counts: vennSetCounts.size,
      distinct_shape_types: vennShapeTypes.size,
      distinct_region_patterns: vennRegionPatterns.size,
    },
  };
}

function vennRegionPattern(config) {
  const ids = config.sets.map((set) => set.id);
  const regionSizes = Array(ids.length).fill(0);
  const setProfiles = ids.map(() => Array(ids.length).fill(0));
  for (const key of Object.keys(config.regions || {})) {
    if (key === 'outside') continue;
    const members = ids.flatMap((id, index) => new RegExp(`(?:^|_)${id}(?:_|$)`).test(key) ? [index] : []);
    if (!members.length) continue;
    regionSizes[members.length - 1] += 1;
    members.forEach((index) => { setProfiles[index][members.length - 1] += 1; });
  }
  return `${ids.length}:${regionSizes.join(',')}:${setProfiles.map((profile) => profile.join(',')).sort().join(';')}`;
}

function compareNovelty(candidate, existing, add) {
  const result = [];
  for (const [index, unit] of candidate.entries()) {
    const matches = existing.map((item) => ({ existing_id: item.id, mode: item.mode, title: item.title, score: lexicalSimilarity(unit.comparison_text, item.comparison_text) }))
      .sort((a, b) => b.score - a.score).slice(0, 3).filter((m) => m.score >= 0.18);
    if (matches[0]?.score >= 0.68) add('error', 'novelty.corpus_near_duplicate', `Unit resembles existing "${matches[0].title}" (score ${matches[0].score}).`, `units[${index}]`);
    else if (matches[0]?.score >= 0.42) add('warning', 'novelty.corpus_similarity', `Review against existing "${matches[0].title}" (score ${matches[0].score}).`, `units[${index}]`);
    result.push({ candidate_id: unit.id, candidate_title: unit.title, matches });
  }
  for (let a = 0; a < candidate.length; a += 1) for (let b = a + 1; b < candidate.length; b += 1) {
    const score = lexicalSimilarity(candidate[a].comparison_text, candidate[b].comparison_text);
    if (score >= 0.68) add('error', 'novelty.within_batch', `Units ${a + 1} and ${b + 1} are too similar (score ${score}).`);
    else if (score >= 0.45) add('warning', 'novelty.within_batch', `Review units ${a + 1} and ${b + 1} for overlap (score ${score}).`);
  }
  return result;
}

function collectCorpusIds(corpus) {
  const result = new Map();
  for (const unit of corpus?.units || []) {
    walkIds(unit.payload, (id) => result.set(id, `${unit.mode} ${unit.title || unit.id}`));
  }
  return result;
}

function walkIds(value, visit, key = '') {
  if (Array.isArray(value)) return value.forEach((item) => walkIds(item, visit, key));
  if (!value || typeof value !== 'object') return;
  for (const [childKey, child] of Object.entries(value)) {
    if ((childKey === 'id' || childKey.endsWith('_id')) && typeof child === 'string') visit(child);
    else walkIds(child, visit, childKey);
  }
}

function finish(section, mode, questionCount, nearest, issues) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    section,
    mode,
    counts: { questions: questionCount, errors, warnings },
    deterministic_verdict: errors ? 'fail' : 'pass',
    issues,
    nearest_existing_content: nearest,
    note: 'A pass confirms machine-checkable structure and lexical screening only; an independent blind review must establish correctness and semantic novelty.',
  };
}

function checkDifficulty(value, add, loc) {
  if (!['normal', 'hard'].includes(value)) add('error', 'schema.difficulty', 'difficulty must be normal or hard.', loc);
}
function point2d(value) { return Array.isArray(value) && value.length === 2 && value.every(finiteNumber); }
function requiredStrings(value, keys, add, loc) {
  for (const key of keys) if (!nonEmpty(value?.[key])) add('error', `schema.${key}`, `${key} must be a non-empty string.`, loc);
}
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function finiteNumber(value) { return typeof value === 'number' && Number.isFinite(value); }
