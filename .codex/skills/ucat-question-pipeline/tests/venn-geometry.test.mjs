import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import polygonClipping from 'polygon-clipping';
import { EXPLICIT_SHAPES, explicitShapePolygon, explicitSetDash, polygonBounds } from '../../../../src/utils/venn/explicitShapes.js';
import { deriveVennArrangement, inspectExplicitDiagram, layoutExplicitDiagram, evaluateVennQuery, vennFingerprints } from '../../../../src/utils/venn/arrangement.js';
import { createVennFromGeometry, generateVennDiagram, generateVennBatch, createVennQuestionExample, VENN_QUERY_KINDS } from '../../../../src/utils/venn/generate.js';
import { findRegionLabelBox, rectangleFitsPolygon } from '../../../../src/utils/venn/labelSpace.js';
import { computeLayout, getLayout, getLayoutAdaptive } from '../../../../src/utils/venn/layout.js';
import { validateSectionCandidate } from '../scripts/section-validator-core.mjs';

const set = (id, shape, cx, cy, width, height, rotationDeg = 0) => ({
  id, label: `Group ${id}`, shape, geometry: { cx, cy, width, height, rotationDeg },
});
const crossSets = () => [set('set1', 'rectangle', 0, 0, 200, 200), set('set2', 'rectangle', 0, 0, 40, 240)];
function crossDiagram() {
  const config = createVennFromGeometry(crossSets());
  config.regions = [
    { id: 'set1_only:0', value: 1 }, { id: 'set1_only:1', value: 2 },
    { id: 'set2_only:0', value: 3 }, { id: 'set2_only:1', value: 4 },
    { id: 'set1_set2_only:0', value: 5 }, { id: 'outside', value: 7 },
  ];
  return config;
}

function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

test('explicit shapes respect true width/height, rotation and position for every supported outline', () => {
  for (const shape of EXPLICIT_SHAPES) {
    const points = explicitShapePolygon(shape, { cx: 12, cy: 31, width: 140, height: 80, rotationDeg: 0 });
    const b = polygonBounds(points);
    assert(Math.abs(b.maxX - b.minX - 140) < 0.01, shape);
    assert(Math.abs(b.maxY - b.minY - 80) < 0.01, shape);
    const turned = polygonBounds(explicitShapePolygon(shape, { cx: 12, cy: 31, width: 140, height: 80, rotationDeg: 90 }));
    assert(Math.abs(turned.maxX - turned.minX - 80) < 0.01, shape);
    assert(Math.abs(turned.maxY - turned.minY - 140) < 0.01, shape);
  }
});

test('connected faces with the same set membership have separate labels and correct areas', () => {
  const { cells } = deriveVennArrangement(crossSets());
  assert.equal(cells.length, 5);
  assert.equal(cells.filter(c => c.inside.length === 1 && c.inside[0] === 'set1').length, 2);
  assert.equal(cells.filter(c => c.inside.length === 1 && c.inside[0] === 'set2').length, 2);
  assert.equal(cells.find(c => c.inside.length === 2).area, 8000);
  assert.equal(cells.reduce((sum, c) => sum + c.area, 0), 41600);
});

test('query derivation counts connected faces once and requires an explicit outside count when relevant', () => {
  const config = crossDiagram();
  assert.equal(evaluateVennQuery(config, { allOf: ['set1'] }).total, 8);
  assert.equal(evaluateVennQuery(config, { allOf: ['set2'] }).total, 12);
  assert.equal(evaluateVennQuery(config, { anyOf: ['set1', 'set2'] }).total, 15);
  assert.equal(evaluateVennQuery(config, { exactly: 2 }).total, 5);
  assert.equal(evaluateVennQuery(config, { noneOf: ['set1'] }).total, 14);
  assert.equal(evaluateVennQuery(config, {}).total, 22);
  assert.equal(evaluateVennQuery(config, { exactly: 0 }).total, 7);
  assert.equal(evaluateVennQuery(config, { allOf: ['set1'], noneOf: ['set2'] }).terms.length, 2);
  assert.throws(() => evaluateVennQuery(config, { allOf: ['unknown'] }), /unknown set/);
  assert.throws(() => evaluateVennQuery(config, { atleast: 2 }), /Unknown/);
  config.regions = config.regions.filter(r => r.id !== 'outside');
  assert.throws(() => evaluateVennQuery(config, { exactly: 0 }), /no outside count/);
  config.regions[0].value = 'X';
  assert.throws(() => evaluateVennQuery(config, { allOf: ['set1'] }), /numeric counts/);
});

test('zeros remain visible, every real cell is required, and malformed geometry fails before rendering', () => {
  const config = crossDiagram();
  config.regions[0].value = 0;
  assert.equal(computeLayout(config).labels.find(l => l.region === 'set1_only:0').text, '0');
  const missing = structuredClone(config);
  missing.regions.pop(); // outside is optional
  missing.regions.pop(); // overlap is not optional, even if author meant zero
  assert.throws(() => inspectExplicitDiagram(missing), /Unlabelled/);
  const duplicate = structuredClone(config);
  duplicate.regions.push(duplicate.regions[0]);
  assert.throws(() => inspectExplicitDiagram(duplicate), /Duplicate region/);
  const impossible = structuredClone(config);
  impossible.regions.push({ id: 'set7_only:0', value: 1 });
  assert.throws(() => inspectExplicitDiagram(impossible), /impossible region/);
  const bad = structuredClone(config);
  bad.sets[0].geometry.rotationDeg = Infinity;
  assert.throws(() => inspectExplicitDiagram(bad), /finite geometry/);
  bad.sets[0].geometry.rotationDeg = 0;
  bad.sets[0].shape = 'circle';
  bad.sets[0].geometry.width = 210;
  assert.throws(() => inspectExplicitDiagram(bad), /equal width and height/);
  const coincident = crossSets();
  coincident[1].geometry = { ...coincident[0].geometry };
  assert.throws(() => deriveVennArrangement(coincident), /coincident outlines/);
  const multiline = structuredClone(config);
  multiline.regions[0].value = 'A\nB';
  assert.throws(() => inspectExplicitDiagram(multiline), /short label/);
  assert.throws(() => layoutExplicitDiagram(config, { maxCanvasWidth: NaN }), /canvas limits/);
  assert.throws(() => computeLayout({ ...config, schemaVersion: 3 }), /Unsupported/);
  assert.throws(() => getLayoutAdaptive({ ...config, schemaVersion: 3 }, { maxWidthPx: 390 }), /Unsupported/);
});

test('label boxes stay inside their exact region at phone widths and larger text sizes', () => {
  const config = createVennFromGeometry([
    set('set1', 'heart', 313.26, 277.44, 266.28, 208.94, -5.44),
    set('set2', 'rounded_rectangle', 198.95, 294.99, 195.03, 193.38, 11.94),
    set('set3', 'teardrop', 223.12, 157.88, 304.76, 228.01, 1.51),
  ]);
  const withLetters = structuredClone(config);
  withLetters.regions.forEach(r => { r.value = 'WW'; });
  for (const diagram of [config, withLetters]) for (const width of [320, 390, 768]) for (const fontScale of [1, 1.25]) {
    const layout = getLayoutAdaptive(diagram, { maxWidthPx: width, fontScale });
    for (const label of layout.labels) {
      assert(label.fontSize >= 12 * fontScale);
      const halfW = label.text.length * label.fontSize * (label.text === 'WW' ? 1 : 0.66) / 2 + 1;
      const halfH = label.fontSize * 0.55 + 1;
      for (const dx of [-halfW, 0, halfW]) for (const dy of [-halfH, 0, halfH]) {
        for (const shape of layout.shapes) {
          assert.equal(pointInRing(label.x + dx, label.y + dy, shape.points), label.inside.includes(shape.id),
            `${width}px ${label.region} crosses ${shape.id}`);
        }
      }
    }
  }
});

test('nested shape holes are subtracted from area and from the label region', () => {
  const sets = [set('outer', 'square', 0, 0, 200, 200), set('inner', 'circle', 0, 0, 80, 80)];
  const { cells } = deriveVennArrangement(sets);
  assert.equal(cells.length, 2);
  const outer = cells.find(c => c.inside.length === 1);
  assert.equal(outer.polygon.length, 2);
  assert(Math.abs(cells.reduce((sum, c) => sum + c.area, 0) - 40000) < 0.001);
  assert.equal(pointInRing(outer.x, outer.y, explicitShapePolygon('circle', sets[1].geometry)), false);
});

test('thin cells fail the authoring gate rather than disappearing or getting microscopic labels', () => {
  const config = createVennFromGeometry([set('a', 'rectangle', 0, 0, 200, 200), set('b', 'rectangle', 199.9, 0, 200, 200)]);
  assert.throws(() => layoutExplicitDiagram(config), /Adjust the geometry/);
});

test('cache includes geometry, counts and font scale; repeated shapes share key dash identities', () => {
  const a = crossDiagram();
  const b = structuredClone(a);
  b.regions[0].value = 90;
  assert.equal(getLayout(a).labels[0].text, '1');
  assert.equal(getLayout(b).labels[0].text, '90');
  assert.notDeepEqual(getLayout(a), getLayout(a, { fontScale: 1.25 }));
  assert.notEqual(explicitSetDash(a.sets, 0), explicitSetDash(a.sets, 1));
  const aliases = [set('a', 'ellipse', 0, 0, 100, 200), set('b', 'oval', 80, 0, 100, 200)];
  assert.notEqual(explicitSetDash(aliases, 0), explicitSetDash(aliases, 1));
  assert.notEqual(getLayout(a, { maxWidthPx: 390 }).canvas.width, getLayout(a, { maxWidthPx: 768 }).canvas.width);
  const rotated = structuredClone(a);
  rotated.sets.forEach(s => { s.geometry.rotationDeg = 90; });
  assert.notDeepEqual(getLayout(rotated).shapes, getLayout(a).shapes);
  assert.equal(vennFingerprints(a).topology, vennFingerprints(b).topology);
});

test('seeded authoring creates reproducible, readable, varied 3 to 6 set diagrams', () => {
  const topologies = new Set(), geometries = new Set();
  for (const setCount of [3, 4, 5, 6]) {
    const options = { seed: `showcase-${setCount}`, setCount };
    const a = generateVennDiagram(options);
    const b = generateVennDiagram(options);
    assert.deepEqual(a, b);
    assert(a.diagnostics.canvas.width <= 720);
    assert(a.config.sets.some(s => Math.abs(s.geometry.rotationDeg) > 15));
    assert(new Set(a.config.sets.map(s => s.geometry.cy)).size > 2);
    topologies.add(a.fingerprints.topology); geometries.add(a.fingerprints.geometry);
  }
  assert.equal(topologies.size, 4);
  assert.equal(geometries.size, 4);
  const twoCircles = generateVennDiagram({ seed: 'two-circles', setCount: 2, shapes: ['circle', 'circle'],
    relations: [{ a: 'set1', b: 'set2', type: 'overlap' }] });
  assert.equal(twoCircles.config.regions.length, 3);
  assert.throws(() => generateVennDiagram({ seed: 'reject', setCount: 8 }), /setCount/);
  assert.throws(() => generateVennDiagram({ seed: 'reject', maxAttempts: 0 }), /maxAttempts/);
  assert.throws(() => generateVennDiagram({ seed: 'reject', maxAttempts: 1, minRegions: 999, maxRegions: 1000 }), /No readable/);
});

test('pipeline validates v2 stimulus and all option diagrams and rejects a missing visible cell', () => {
  const diagram = crossDiagram();
  const question = {
    id: randomUUID(), title: 'Synthetic diagram regression', type: 'venn_diagram', difficulty: 'normal',
    is_free: true, stem: 'How many objects are in both sets?', order_index: 1,
    stimulus_diagram: diagram, correct_answer: 'B', answer_reason: 'The sole shared region contains five objects, corresponding to option B.',
    decision_making_question_options: [4, 5, 8, 12].map((n, i) => ({ label: 'ABCD'[i], option_text: String(n), order_index: i + 1 })),
  };
  const check = () => validateSectionCandidate({ section: 'dm', input: [question], modeHint: 'practice' });
  assert.equal(check().deterministic_verdict, 'pass');
  delete question.stimulus_diagram;
  question.decision_making_question_options.forEach(o => { o.option_data = structuredClone(diagram); });
  assert.equal(check().deterministic_verdict, 'pass');
  question.decision_making_question_options[2].option_data.regions.shift();
  assert(check().issues.some(issue => issue.code === 'dm.venn_geometry'));
});

test('rectangular space uses wide shallow regions and rejects boxes crossing concavities or holes', () => {
  const wide = { polygon: [[[0, 0], [120, 0], [120, 26], [0, 26], [0, 0]]], x: 60, y: 13 };
  const box = findRegionLabelBox(wide, '123456', 14, 3);
  assert(box.requiredScale < 1, 'six digits fit without enlarging this shallow region');
  assert(rectangleFitsPolygon(wide.polygon, box));
  assert(Math.abs(box.height - 26) < 0.01);
  const notch = [[[0, 0], [100, 0], [100, 100], [60, 100], [60, 30], [40, 30], [40, 100], [0, 100], [0, 0]]];
  const acrossNotch = { x: 50, y: 65, width: 90, height: 50 };
  // All four corners lie inside; the full rectangle still crosses the notch.
  for (const x of [5, 95]) for (const y of [40, 90]) assert(pointInRing(x, y, notch[0]));
  assert.equal(rectangleFitsPolygon(notch, acrossNotch), false);
  const holed = [wide.polygon[0], [[50, 8], [70, 8], [70, 18], [50, 18], [50, 8]]];
  assert.equal(rectangleFitsPolygon(holed, { x: 60, y: 13, width: 110, height: 24 }), false);
  for (const cell of [{ polygon: notch, x: 20, y: 50 }, { polygon: holed, x: 25, y: 13 }]) {
    const safe = findRegionLabelBox(cell, '88', 14, 3);
    const rect = [[safe.x - safe.width / 2, safe.y - safe.height / 2], [safe.x + safe.width / 2, safe.y - safe.height / 2],
      [safe.x + safe.width / 2, safe.y + safe.height / 2], [safe.x - safe.width / 2, safe.y + safe.height / 2]];
    assert.equal(polygonClipping.difference([rect], cell.polygon).length, 0);
  }
});

test('tall arrangements fit the height limit while retaining the required font size', () => {
  const config = createVennFromGeometry([set('a', 'rectangle', 0, 0, 100, 600), set('b', 'rectangle', 0, 300, 80, 600)]);
  config.labelStyle = { minFontSize: 14, preferredFontSize: 18, padding: 3 };
  const layout = getLayout(config, { targetWidthPx: 768, maxCanvasHeight: 1800 });
  assert(layout.canvas.height <= 1800);
  assert(layout.labels.every(l => l.fontSize >= 14));
});

test('authors can constrain actual containment and reject contradictory relationships', () => {
  const options = { seed: 'contained', setCount: 2, shapes: ['circle', 'circle'], families: ['nested_chain'],
    relations: [{ a: 'set1', b: 'set2', type: 'contains' }] };
  const { config } = generateVennDiagram(options);
  assert(inspectExplicitDiagram(config).cells.every(c => !c.inside.includes('set2') || c.inside.includes('set1')));
  assert.throws(() => generateVennDiagram({ ...options, maxAttempts: 3,
    relations: [...options.relations, { a: 'set1', b: 'set2', type: 'disjoint' }] }), /No readable/);
  assert.throws(() => generateVennDiagram({ ...options, families: ['unknown'] }), /layout families/);
  assert.throws(() => generateVennDiagram({ ...options, labelStyle: { minFontSize: 8 } }), /labelStyle/);
});

test('overlap fingerprint ignores shape substitutions, names, order and pose', () => {
  const baseline = vennFingerprints(crossDiagram());
  const alternate = crossSets().reverse();
  alternate[1].shape = 'square';
  alternate.forEach((s, i) => { s.id = `group${i}`; s.label = `Renamed ${i}`; s.geometry.cx += 50; });
  assert.equal(vennFingerprints(createVennFromGeometry(alternate)).topologySignature, baseline.topologySignature);
  const apart = createVennFromGeometry([set('a', 'square', 0, 0, 200, 200), set('b', 'square', 400, 0, 100, 100)]);
  const nested = createVennFromGeometry([set('a', 'square', 0, 0, 200, 200), set('b', 'square', 0, 0, 100, 100)]);
  assert.notEqual(vennFingerprints(apart).topologySignature, vennFingerprints(nested).topologySignature);
});

test('diverse batches verify full label rectangles, preserve larger font policy and vary question operations', () => {
  const batch = generateVennBatch({ seed: 'variety-check', count: 8, setCounts: [3, 4, 5, 6] });
  assert.equal(batch.diversity.uniqueTopologies, 8);
  assert(Object.keys(batch.diversity.familyCounts).length >= 6);
  assert(batch.diversity.overlapDepths.length >= 2);
  const operations = new Set();
  batch.results.forEach(({ config }, i) => {
    const example = createVennQuestionExample(config, { kind: VENN_QUERY_KINDS[i % VENN_QUERY_KINDS.length], index: i });
    operations.add(example.kind);
    assert.equal(example.answer.terms.reduce((sum, t) => sum + t.value, 0), example.answer.total);
    for (const width of [320, 768]) for (const fontScale of [1, 1.25]) {
      const layout = getLayoutAdaptive(config, { maxWidthPx: width, fontScale });
      for (const label of layout.labels) {
        assert(label.fontSize >= 14 * fontScale);
        const b = label.labelBox;
        const rectangle = [[[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]]];
        for (const shape of layout.shapes) {
          const leak = label.inside.includes(shape.id)
            ? polygonClipping.difference(rectangle, [shape.points])
            : polygonClipping.intersection(rectangle, [shape.points]);
          assert.equal(leak.length, 0, `${i}: ${label.region} label/padding crosses ${shape.id}`);
        }
      }
    }
    const larger = { ...config, labelStyle: { minFontSize: 18, preferredFontSize: 20, padding: 4 } };
    assert(getLayout(larger).labels.every(l => l.fontSize >= 18));
  });
  assert.equal(operations.size, 6);
});
