# DM diagrams with explicit geometry

The DM renderer supports two formats. Existing diagrams keep the original topology-based layout. New diagrams can use `schemaVersion: 2` to save the exact position, width, height and angle of each shape. Both practice and timed questions already store these configurations in JSONB, so this feature needs no database schema migration.

## Generate diagrams for authoring

```powershell
npm run questions:venn:generate
# Creates twelve examples using 3, 4, 5 and 6 sets, a region/answer ledger,
# and an interactive HTML gallery under ignored content-authoring/cache/.

npm run questions:venn:generate -- -- --seed "training-2026" --sets "4,5,6" --count 3
# Quote the comma-separated list in PowerShell.

npm run questions:venn:generate -- -- --seed "sports" --sets "5" --shapes "teardrop,circle,heart,square,triangle"

npm run questions:venn:generate -- -- --seed "variety" --count 24 --min-font 14
npm run questions:venn:generate -- -- --sets "4,5" --count 8 --families "chain,bridge,freeform,nested_cluster"
```

The search composes continuously sampled position, spacing, aspect ratio, scale hierarchy and full-circle rotation with scene rotation, reflection and horizontal/vertical spread. Its 16 proposal families are orbit, chain, staircase, zigzag, wave, lattice, fan, hub/spokes, nested cluster, nested chain, two clusters, bridge, crossing bands, scatter, branching and freeform. Branching/freeform proposals grow from relationships with earlier shapes; they can combine containment, crossing, overlap and separation in one scene. Families suggest arrangements; actual memberships always come from clipping the final geometry. `layoutFamilies.js` is the extensible proposal grammar, and the renderer accepts arbitrary explicit geometry independently of this list.

Generation is seeded and bounded. `--count` supports 1–100 diagrams; `--attempts` (1–1000) controls attempts per family search, and `--max-width` (360–1200, default 720) bounds the readable canvas. `generateVennBatch()` favours less-used families and rejects repeated overlap structures, including copies disguised by different shapes, set ordering, names, counts or rotations. Its report records family coverage, overlap depths, region counts and unique structures. If constraints cannot be met, generation fails clearly rather than emitting a partial or repetitive batch. New palettes or rotations can still provide visual variety, but are measured separately from structural variety.

For specific structure, `generateVennDiagram()` accepts `families`, `minRegions`, `maxRegions`, `minOverlapDepth`, `maxOverlapDepth`, and `relations: [{ a: 'set1', b: 'set2', type: 'contains' }]`. Relation types are `contains`, `disjoint` and `overlap` (partial overlap, with an exclusive portion on each side). These are checked against actual cells. Use `excludedTopologies` with prior `topologySignature` values to avoid structures across batches. A finite number of structures exists for any restricted brief, so a sufficiently constrained request can exhaust the available variety.

The default files are `venn-generated.json`, `venn-generated.report.json`, and `venn-generated.html`. The gallery has 320/390/768 px viewport controls, a label-space overlay, and per-region area/box/font measurements. Example queries rotate between intersections, exclusions, unions, set totals, exactly N and at least N; each includes its calculated terms. These are local authoring assets, not approved questions or migrations. Use their complete configurations in the normal question pipeline, which still refreshes the corpus, checks novelty, derives distractors and requires independent blind review.

## V2 data contract

Each set has a stable alphanumeric `id`, its display `label`, a `shape`, and `geometry`:

```js
const sets = [
  { id: 'set1', label: 'Football', shape: 'triangle',
    geometry: { cx: 220, cy: 210, width: 280, height: 390, rotationDeg: -18 } },
  { id: 'set2', label: 'Tennis', shape: 'circle',
    geometry: { cx: 300, cy: 160, width: 200, height: 200, rotationDeg: 0 } },
];
```

Coordinates are diagram units, independent of screen pixels. Width and height are the actual unrotated bounding-box dimensions; positive angles rotate clockwise. Valid sizes are 1–10000 units, positions are within ±10000 units and rotations within ±360 degrees. Circles and squares retain equal dimensions; use an ellipse or rectangle for unequal dimensions. Two to six sets are supported.

Supported shapes: circle, ellipse, oval, vertical oval, square, rectangle, rounded rectangle, horizontal/vertical strip, triangle, isosceles triangle, diamond, pentagon, hexagon, octagon, star, trapezoid, parallelogram, right/left arrow, heart and teardrop. JSON names use underscores, e.g. `rounded_rectangle`.

Generate the region records from geometry rather than guessing memberships:

```js
import { createVennFromGeometry } from './src/utils/venn/generate.js';
import { inspectExplicitDiagram, evaluateVennQuery } from './src/utils/venn/arrangement.js';

const diagram = createVennFromGeometry(sets, { seed: 'sports-counts' });
// { schemaVersion: 2, sets, regions: [{ id: 'set1_only:0', value: 12 }, ...] }
const { cells } = inspectExplicitDiagram(diagram);
// Each cell has inside set IDs, component number, polygon, area and clearance.
const answer = evaluateVennQuery(diagram, { allOf: ['set1', 'set2'] });
// { total, terms: [{ region, value, inside }], expression: '...' }
```

`regions` is an array in v2. Every connected face must have exactly one `{ id, value }` entry, including zero counts. A shape crossing another can split one membership into two separate faces; they receive `:0` and `:1`, with separate values. Components are ordered by topmost then leftmost bounds. Changing geometry can change these IDs: regenerate the regions and recalculate answers after every geometry edit.

Values are non-negative safe integers or short, single-line text labels. Mathematical queries require numeric counts. An optional `{ id: 'outside', value: 7 }` adds a count outside all shapes and a surrounding frame. Queries that could include that population require this explicit value; the engine never assumes an unknown outside count is zero. Use `{ atLeast: 1 }` for the union of the shown sets.

Query constraints can combine `allOf`, `anyOf`, `noneOf`, `exactly`, `atLeast` and `atMost`. Each matching face is counted once. This supports intersection, exclusion, exactly N groups and at least N groups, and gives an auditable expression for explanations and distractors. It does not decide whether the narrative or distractors make a good UCAT question.

## Rendering and release checks

Generated diagrams save `labelStyle: { minFontSize: 14, preferredFontSize: 18, padding: 3 }`. The renderer and authoring checks honour the same policy. Older v2 configurations without it keep the 12/16 px defaults. Minimum font can be 12–32 px, preferred font can be up to 48 px and padding can be 2–12 px. `--min-font` sets the generator's minimum. Recalculate layout after changing counts: a three-digit count needs more width than a single digit.

`labelSpace.js` searches for a safe horizontal rectangle of the label's aspect ratio inside each region, accounting for concavity and holes. It uses distance to every boundary segment, so fitting four corners alone is insufficient. The search is bounded and returns a conservative safe box; it does not claim a mathematically exact global maximum. Text measurements conservatively estimate glyph widths across native fonts. This makes better use of wide/shallow regions than an inscribed circle alone.

`layoutExplicitDiagram(...).diagnostics.regionSpace` reports each region's model area, pixel area, `availableBox`, padded `labelBox`, `fontCapacityPx`, chosen/minimum font, padding, required scale and whether the search converged. Pixel measurements correspond to the reported canvas before optional user zoom. Area alone never establishes label fit. Every region must accommodate the minimum font plus padding; the canvas grows within its limit or the proposal is rejected. All connected faces and zero counts remain present.

The same sampled outline is used for polygon clipping, region detection, label placement and SVG drawing. Labels fit wholly inside their region with outline clearance. Holes and disconnected faces are preserved. Coincident outlines, omitted cells, duplicate IDs, impossible regions and unreadable slivers fail validation.

V2 labels stay at least 12 px, including on a narrow phone. Dense diagrams use horizontal scrolling at their readable size. The expanded stimulus view adds zoom buttons and vertical scrolling. Accessibility text sizing participates in the clearance calculation. Repeated shapes and similar outline families (such as circle/ellipse or square/diamond) get distinct line patterns shared with the key. Old baked geometry cannot override a v2 configuration.

The authoring checker tests a 320 px viewport and rejects diagrams requiring more than a 960 × 1400 px readable canvas. The generator's default limit is stricter. There is no silent fallback to smaller text for v2. The existing legacy renderer retains its historical behavior.

`vennFingerprints()` distinguishes canonical membership structure (`topologySignature` and `topology`) from `palette` and `geometry`. The canonical structure is independent of set ordering, palette, labels, values and pose, and includes disconnected-face multiplicity. The semantic novelty review must still compare reasoning tasks against the live corpus and other batch items; a new diagram alone does not prove a novel question.

Deploy the renderer update before releasing v2 question content. Existing app versions only understand the legacy format; use the app's release/minimum-version process before inserting v2 content into the shared database. This code change itself does not create or apply a content migration.

## Verification

`npm run questions:test` includes geometry tests for all supported shapes, independent point-in-polygon and full polygon-clipping checks of padded label rectangles, holes, concave notches, shallow regions, split regions, zero counts, exact query sums, reproducibility, batch variety, narrow screens, large text, validator integration and legacy pipeline regressions. Generated examples can also be inspected in the standalone HTML gallery.
