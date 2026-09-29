// Authoring utility only: bounded, seeded search, never randomise an exam view.
import { deriveVennArrangement, evaluateVennQuery, layoutExplicitDiagram, vennFingerprints, vennLabelStyle } from './arrangement.js';
import { EXPLICIT_SHAPES } from './explicitShapes.js';
import { stableHash } from './topologies.js';
import { VENN_LAYOUT_FAMILIES, proposeVennSets } from './layoutFamilies.js';
export { VENN_LAYOUT_FAMILIES } from './layoutFamilies.js';

function randomFrom(seed) {
  let state = stableHash(String(seed));
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createVennFromGeometry(sets, { seed = 'counts', minValue = 1, maxValue = 30 } = {}) {
  if (!Number.isSafeInteger(minValue) || !Number.isSafeInteger(maxValue) || minValue < 0 || maxValue < minValue) {
    throw new Error('Count range must contain non-negative safe integers in ascending order.');
  }
  const random = randomFrom(seed);
  const { cells } = deriveVennArrangement(sets);
  return {
    schemaVersion: 2, sets,
    regions: cells.map(cell => ({ id: cell.id,
      value: minValue + Math.floor(random() * (maxValue - minValue + 1)) })),
  };
}

function matchesRelations(cells, relations) {
  return relations.every(({ a, b, type }) => {
    const shared = cells.some(c => c.inside.includes(a) && c.inside.includes(b));
    if (type === 'disjoint') return !shared;
    if (type === 'contains') return shared && !cells.some(c => c.inside.includes(b) && !c.inside.includes(a));
    return shared && cells.some(c => c.inside.includes(a) && !c.inside.includes(b)) &&
      cells.some(c => c.inside.includes(b) && !c.inside.includes(a));
  });
}

export function generateVennDiagram({ seed, setCount = 4, shapes, labels,
  families = VENN_LAYOUT_FAMILIES, relations = [],
  labelStyle = { minFontSize: 14, preferredFontSize: 18, padding: 3 },
  maxAttempts = setCount >= 6 ? 700 : setCount >= 5 ? 350 : 180,
  maxCanvasWidth = 720, maxCanvasHeight = 1100, minRegions = setCount, maxRegions = 28,
  minOverlapDepth = 2, maxOverlapDepth = setCount, excludedTopologies = [] } = {}) {
  if (seed == null || !String(seed).length) throw new Error('Supply a stable seed for reproducible Venn generation.');
  if (!Number.isInteger(setCount) || setCount < 2 || setCount > 6) throw new Error('setCount must be within 2..6.');
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 1000) throw new Error('maxAttempts must be within 1..1000.');
  if (!Number.isFinite(maxCanvasWidth) || maxCanvasWidth < 360 || maxCanvasWidth > 1200 ||
      !Number.isFinite(maxCanvasHeight) || maxCanvasHeight < 360 || maxCanvasHeight > 1800) throw new Error('Invalid canvas limits.');
  if (!Number.isInteger(minRegions) || !Number.isInteger(maxRegions) || minRegions < 1 || maxRegions < minRegions ||
      !Number.isInteger(minOverlapDepth) || minOverlapDepth < 1 || minOverlapDepth > setCount ||
      !Number.isInteger(maxOverlapDepth) || maxOverlapDepth < minOverlapDepth || maxOverlapDepth > setCount) throw new Error('Invalid region or overlap limits.');
  if (!Array.isArray(families) || !families.length || families.some(f => !VENN_LAYOUT_FAMILIES.includes(f))) throw new Error('Supply supported layout families.');
  if (shapes && (!Array.isArray(shapes) || shapes.length !== setCount || shapes.some(s => !EXPLICIT_SHAPES.includes(s)))) {
    throw new Error('shapes must contain one supported shape for each set.');
  }
  if (labels && (!Array.isArray(labels) || labels.length !== setCount || labels.some(l => typeof l !== 'string' || !l.trim() || l.length > 80))) {
    throw new Error('labels must contain one non-empty label (up to 80 characters) for each set.');
  }
  const ids = new Set(Array.from({ length: setCount }, (_, i) => `set${i + 1}`));
  if (!Array.isArray(relations) || relations.some(r => !r || !ids.has(r.a) || !ids.has(r.b) || r.a === r.b ||
      !['overlap', 'contains', 'disjoint'].includes(r.type))) throw new Error('Invalid set relation; use a, b and overlap/contains/disjoint.');
  vennLabelStyle({ labelStyle });
  const random = randomFrom(seed), excluded = new Set(excludedTopologies);
  const familyOrder = [...new Set(families)].map(family => ({ family, order: random() }))
    .sort((a, b) => a.order - b.order).map(f => f.family);
  let best = null, lastFailure = 'No proposed layout met the region or relation limits.';
  const rejected = { structure: 0, space: 0, duplicate: 0 };
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const proposal = proposeVennSets(random, { setCount, shapes, labels, family: familyOrder[attempt % familyOrder.length] });
    try {
      const arrangement = deriveVennArrangement(proposal.sets);
      const depth = Math.max(...arrangement.cells.map(c => c.inside.length));
      if (arrangement.cells.length < minRegions || arrangement.cells.length > maxRegions ||
          depth < minOverlapDepth || depth > maxOverlapDepth || !matchesRelations(arrangement.cells, relations)) {
        rejected.structure++; continue;
      }
      const config = createVennFromGeometry(proposal.sets, { seed: `${seed}:values:${attempt}` });
      config.labelStyle = { ...labelStyle };
      const layout = layoutExplicitDiagram(config, { targetWidthPx: 360, maxCanvasWidth, maxCanvasHeight });
      const fingerprints = vennFingerprints(config);
      if (excluded.has(fingerprints.topology) || excluded.has(fingerprints.topologySignature)) {
        rejected.duplicate++; lastFailure = 'All valid layouts repeated an excluded overlap structure.'; continue;
      }
      const minimumFont = Math.min(...layout.labels.map(l => l.fontSize));
      const score = layout.canvas.width + layout.canvas.height * 0.18 - minimumFont * 5;
      if (!best || score < best.score) best = { config, score, fingerprints,
        diagnostics: { seed: String(seed), selectedAttempt: attempt + 1, composition: proposal.composition,
          canvas: layout.canvas, regions: arrangement.cells.length, overlapDepth: depth,
          minFontSize: minimumFont, regionSpace: layout.diagnostics.regionSpace } };
      if (layout.canvas.width <= 360 && layout.canvas.height <= 600) break;
      if (attempt >= 100 && layout.canvas.width <= 640 && layout.canvas.height <= 900) break;
    } catch (error) { rejected.space++; lastFailure = error.message; }
  }
  if (!best) throw new Error(`No readable ${setCount}-set diagram in ${maxAttempts} attempts. ${lastFailure}`);
  const { score, ...result } = best;
  result.diagnostics.rejected = rejected;
  return result;
}

// Balance proposal families across the batch, and require a new membership
// structure even when set names, ordering, shapes or rotations change.
export function generateVennBatch({ seed, count = 12, setCounts = [3, 4, 5, 6], families = VENN_LAYOUT_FAMILIES,
  excludedTopologies = [], ...options } = {}) {
  if (seed == null || !String(seed).length) throw new Error('Supply a stable batch seed.');
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('Batch count must be within 1..100.');
  if (!Array.isArray(setCounts) || !setCounts.length || setCounts.some(n => !Number.isInteger(n) || n < 2 || n > 6)) throw new Error('Invalid batch set counts.');
  if (!Array.isArray(families) || !families.length || families.some(f => !VENN_LAYOUT_FAMILIES.includes(f))) throw new Error('Invalid batch families.');
  const random = randomFrom(`${seed}:batch`), results = [], excluded = [...excludedTopologies];
  const usage = new Map([...new Set(families)].map(f => [f, 0]));
  for (let i = 0; i < count; i++) {
    const ordered = [...usage].map(([family, used]) => ({ family, used, tie: random() }))
      .sort((a, b) => a.used - b.used || a.tie - b.tie);
    let result = null, failure;
    for (const { family } of ordered) {
      try {
        result = generateVennDiagram({ ...options, seed: `${seed}:${i}:${family}`, setCount: setCounts[i % setCounts.length],
          families: [family], excludedTopologies: excluded });
        break;
      } catch (error) { failure = error; }
    }
    if (!result) throw new Error(`Could not complete diverse batch at diagram ${i + 1}/${count}: ${failure?.message}`);
    results.push(result); excluded.push(result.fingerprints.topologySignature);
    usage.set(result.diagnostics.composition.family, usage.get(result.diagnostics.composition.family) + 1);
  }
  return { results, diversity: { requested: count, generated: results.length,
    uniqueTopologies: new Set(results.map(r => r.fingerprints.topologySignature)).size,
    uniqueGeometries: new Set(results.map(r => r.fingerprints.geometry)).size,
    familyCounts: Object.fromEntries([...usage].filter(([, used]) => used)),
    overlapDepths: [...new Set(results.map(r => r.diagnostics.overlapDepth))].sort(),
    regionCounts: [...new Set(results.map(r => r.diagnostics.regions))].sort((a, b) => a - b) } };
}

export const VENN_QUERY_KINDS = Object.freeze(['at_least', 'exactly', 'intersection', 'exclusion', 'union', 'set_total']);

export function createVennQuestionExample(config, { kind = 'at_least', index = 0 } = {}) {
  if (!VENN_QUERY_KINDS.includes(kind) || !Number.isInteger(index) || index < 0) throw new Error('Invalid example query kind or index.');
  const candidates = [], sets = config.sets;
  const add = (prompt, query) => {
    const answer = evaluateVennQuery(config, query);
    if (answer.total > 0) candidates.push({ kind, prompt, query, answer });
  };
  if (kind === 'at_least' || kind === 'exactly') {
    for (let n = kind === 'exactly' ? 1 : 2; n <= sets.length; n++) {
      add(`How many belong to ${kind === 'exactly' ? 'exactly' : 'at least'} ${n} ${n === 1 ? 'group' : 'groups'}?`,
        { [kind === 'exactly' ? 'exactly' : 'atLeast']: n });
    }
  } else for (let a = 0; a < sets.length; a++) {
    if (kind === 'set_total') add(`How many belong to ${sets[a].label}?`, { allOf: [sets[a].id] });
    else for (let b = 0; b < sets.length; b++) {
      if (a === b || (kind !== 'exclusion' && b < a)) continue;
      if (kind === 'intersection') add(`How many belong to both ${sets[a].label} and ${sets[b].label}?`, { allOf: [sets[a].id, sets[b].id] });
      if (kind === 'union') add(`How many belong to ${sets[a].label} or ${sets[b].label}, including those in both?`, { anyOf: [sets[a].id, sets[b].id] });
      if (kind === 'exclusion') add(`How many belong to ${sets[a].label} but not ${sets[b].label}?`, { allOf: [sets[a].id], noneOf: [sets[b].id] });
    }
  }
  if (!candidates.length) throw new Error(`No non-empty ${kind} query in this diagram.`);
  return candidates[index % candidates.length];
}

