// Canonical seed positions per topology family, plus an inferrer that picks
// the right family from region keys. All positions are in "unit space"
// (default radius ~50). The baker scales uniformly until every region can fit
// a 12 px label with clearance from every outline.

const R = 50;
const W = 2 * R;
const H = 2 * R;
// 1.10*R balances two competing constraints in chain/hub topologies:
//   - tight enough that star/oval lens overlaps are visible
//   - loose enough that a middle shape's "only" region in a 4-chain doesn't
//     disappear (adjacent overlaps would otherwise cover the whole middle shape)
const OVERLAP_D  = 1.10 * R;
const SEPARATE_D = 2.20 * R;

// ---------------------------------------------------------------------------
// Stable content hash — same vennConfig content always produces the same hash,
// regardless of object key order in the source data (JSON vs JSONB normalise
// keys differently). Used to deterministically pick layout variants so the
// same question renders identically for every user, while different questions
// get visually different arrangements.
// ---------------------------------------------------------------------------

function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonicalize);
  const sorted = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = canonicalize(obj[k]);
  return sorted;
}

export function stableHash(obj) {
  const str = JSON.stringify(canonicalize(obj));
  // djb2 — fast, good distribution for short JSON strings
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function asShape(id, cx, cy, w = W, h = H) {
  return { id, cx, cy, w, h, rotation: 0 };
}

function inOrder(ids, byIdMap) {
  return ids.map(id => byIdMap[id]);
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-randomness for layout jitter. Same hash + same index
// always produces the same "random" value, so a given vennConfig renders
// identically for every user while still looking organic (varied Y positions,
// subtle rotations, slight size differences — not the old robotic flat rows).
// ---------------------------------------------------------------------------

function hashedRand(hash, index) {
  let h = (hash ^ ((index + 1) * 2654435761)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

// Shapes where rotation is visually a no-op (rotationally symmetric). No point
// paying the polygon-clipping cost of rotating them — the rendered outline is
// identical.
const SYMMETRIC_SHAPES = new Set(['circle']);

// Shapes where rotation would look absurd (ovals shouldn't be tilted 15° — it
// reads as a mistake, not a design choice).
const LIGHT_ROTATION_SHAPES = new Set(['oval', 'vertical_oval']);

function rotationAmpFor(shape, baseAmp) {
  if (SYMMETRIC_SHAPES.has(shape)) return 0;
  if (LIGHT_ROTATION_SHAPES.has(shape)) return baseAmp * 0.35;
  return baseAmp;
}

// Apply hash-seeded jitter to a set of seeded shape positions.
//   yAmp       — vertical offset in units of R (0.20 = ±0.20R, so ±10px in unit space)
//   sizeRange  — [lo, hi] multiplier for w/h (e.g. [0.92, 1.10])
//   rotAmp     — rotation amplitude in radians (e.g. 0.20 ≈ ±11.5°)
// Rotation is attenuated/zeroed for rotation-inappropriate shapes. yAmp is
// bounded by the caller so adjacent-overlap constraints in chain topologies
// still hold (>0.25R starts breaking 1.10R-spaced chains).
// Probability that any given shape receives a full rotation when rotAmp > 0.
// Shapes that lose the lottery render effectively upright (a tiny epsilon
// rotation is applied to avoid axis-aligned polygon-clipping degeneracies —
// invisible to the eye, but prevents the clipper from choking on perfectly
// co-linear edges between adjacent shapes).
const ROTATION_PROBABILITY = 0.5;
const UPRIGHT_EPSILON = 0.008; // ~0.46°, visually indistinguishable from 0

function applyJitter(shapes, idToShape, hash, opts = {}) {
  const { yAmp = 0, sizeRange = null, rotAmp = 0 } = opts;
  return shapes.map((s, i) => {
    const shape = (idToShape && idToShape[s.id]) || 'circle';
    const yOff = yAmp ? (hashedRand(hash, i * 7 + 11) - 0.5) * 2 * yAmp * R : 0;
    const sk = sizeRange
      ? sizeRange[0] + hashedRand(hash, i * 7 + 13) * (sizeRange[1] - sizeRange[0])
      : 1;
    const rAmp = rotationAmpFor(shape, rotAmp);
    let rot = 0;
    if (rAmp) {
      const rotGate = hashedRand(hash, i * 7 + 19);
      if (rotGate < ROTATION_PROBABILITY) {
        rot = (hashedRand(hash, i * 7 + 17) - 0.5) * 2 * rAmp;
      } else if (!SYMMETRIC_SHAPES.has(shape)) {
        rot = (hashedRand(hash, i * 7 + 23) - 0.5) * 2 * UPRIGHT_EPSILON;
      }
    }
    return {
      ...s,
      cy: s.cy + yOff,
      w: s.w * sk,
      h: s.h * sk,
      rotation: (s.rotation || 0) + rot,
    };
  });
}

// ---------------------------------------------------------------------------
// Region-key analysis
// ---------------------------------------------------------------------------

function parseRegionKey(regionKey, allSetIds) {
  if (regionKey === 'outside') return { insideIds: [], outsideIds: allSetIds };
  const mentioned = allSetIds.filter(id => {
    const re = new RegExp(`(?:^|_)${id}(?:_|$)`);
    return re.test(regionKey);
  });
  if (mentioned.length === 0) return { insideIds: allSetIds, outsideIds: [] };
  return {
    insideIds: mentioned,
    outsideIds: allSetIds.filter(id => !mentioned.includes(id)),
  };
}

function analyzeRegions(allSetIds, regions) {
  const regionKeys = Object.keys(regions).filter(k => k !== 'outside');
  const parsed = regionKeys.map(k => ({ key: k, ...parseRegionKey(k, allSetIds) }));

  const overlapPairs = new Set();
  const mentions = Object.fromEntries(allSetIds.map(id => [id, new Set()]));

  for (const { key, insideIds } of parsed) {
    for (const id of insideIds) mentions[id].add(key);
    for (let a = 0; a < insideIds.length; a++) {
      for (let b = a + 1; b < insideIds.length; b++) {
        overlapPairs.add([insideIds[a], insideIds[b]].sort().join('|'));
      }
    }
  }
  return { overlapPairs, mentions, parsed };
}

// A is nested inside B iff every region mentioning A also mentions B, AND
// some region mentions B without A.
function findNestings(allSetIds, mentions) {
  const nested = [];
  for (const inner of allSetIds) {
    const innerRegions = [...mentions[inner]];
    if (innerRegions.length === 0) continue;
    for (const outer of allSetIds) {
      if (outer === inner) continue;
      const allInnerInOuter = innerRegions.every(rk => mentions[outer].has(rk));
      const someOuterWithoutInner = [...mentions[outer]].some(rk => !mentions[inner].has(rk));
      if (allInnerInOuter && someOuterWithoutInner) nested.push([inner, outer]);
    }
  }
  return nested;
}

function pairsOf(overlapPairs) {
  return [...overlapPairs].map(s => s.split('|'));
}

// ---------------------------------------------------------------------------
// Primitive seeds
// ---------------------------------------------------------------------------

function seed_three_all_overlap(ids) {
  // Tight spacing so even shapes with low "inward extent" (triangles, ovals,
  // stars) produce a usable triple-intersection region. Scale loop pushes
  // outward when labels need more room.
  const d = 0.78 * R;
  return [
    asShape(ids[0],  0,           -0.58 * d),
    asShape(ids[1], -0.58 * d,     0.42 * d),
    asShape(ids[2],  0.58 * d,     0.42 * d),
  ];
}

function seed_three_linear(ids, mid, leftId, rightId) {
  const m = {
    [leftId]:  asShape(leftId,  -OVERLAP_D, 0),
    [mid]:     asShape(mid,      0,         0),
    [rightId]: asShape(rightId,  OVERLAP_D, 0),
  };
  return inOrder(ids, m);
}

function seed_three_one_separate(ids, pairA, pairB, lone) {
  const m = {
    [pairA]: asShape(pairA, 0,                     0),
    [pairB]: asShape(pairB, OVERLAP_D,             0),
    [lone]:  asShape(lone,  OVERLAP_D + SEPARATE_D, 0),
  };
  return inOrder(ids, m);
}

function seed_three_nested(ids, innermost, middle, outermost) {
  const m = {
    [outermost]: asShape(outermost, 0, 0, 2.6 * R, 2.6 * R),
    [middle]:    asShape(middle,    0, 0, 1.65 * R, 1.65 * R),
    [innermost]: asShape(innermost, 0, 0, 0.80 * R, 0.80 * R),
  };
  return inOrder(ids, m);
}

function seed_three_nested_one_separate(ids, inner, outer, lone) {
  const m = {
    [outer]: asShape(outer, 0, 0, 2.1 * R, 2.1 * R),
    [inner]: asShape(inner, 0, 0, 0.95 * R, 0.95 * R),
    [lone]:  asShape(lone,  2.1 * R + SEPARATE_D * 0.65, 0),
  };
  return inOrder(ids, m);
}

function seed_three_separate(ids) {
  return [
    asShape(ids[0], 0,                 0),
    asShape(ids[1], SEPARATE_D,        0),
    asShape(ids[2], 2 * SEPARATE_D,    0),
  ];
}

function seed_four_linear(ids, order) {
  const pos = [
    [-1.5 * OVERLAP_D, 0],
    [-0.5 * OVERLAP_D, 0],
    [ 0.5 * OVERLAP_D, 0],
    [ 1.5 * OVERLAP_D, 0],
  ];
  const m = {};
  order.forEach((id, i) => { m[id] = asShape(id, pos[i][0], pos[i][1]); });
  return inOrder(ids, m);
}

function seed_four_two_pairs(ids, p1a, p1b, p2a, p2b) {
  const cL = -SEPARATE_D / 2, cR = SEPARATE_D / 2;
  const m = {
    [p1a]: asShape(p1a, cL - OVERLAP_D / 2, 0),
    [p1b]: asShape(p1b, cL + OVERLAP_D / 2, 0),
    [p2a]: asShape(p2a, cR - OVERLAP_D / 2, 0),
    [p2b]: asShape(p2b, cR + OVERLAP_D / 2, 0),
  };
  return inOrder(ids, m);
}

// 4-cycle: 1-2-3-4-1 (arranged as a diamond so adjacent pairs overlap)
function seed_four_cycle(ids, cycleOrder) {
  const r = 0.65 * OVERLAP_D;
  const [a, b, c, d] = cycleOrder;
  const m = {
    [a]: asShape(a, 0,  -r),
    [b]: asShape(b, r,   0),
    [c]: asShape(c, 0,   r),
    [d]: asShape(d, -r,  0),
  };
  return inOrder(ids, m);
}

// N separate — place in a horizontal row.
function seed_all_separate(ids) {
  return ids.map((id, i) => asShape(id, i * SEPARATE_D, 0));
}

// n-shape cycle (any n ≥ 5). Each adjacent pair in `order` overlaps; non-
// adjacent pairs do not. Shapes are placed on a regular polygon ring so each
// shape is equidistant from its neighbours at OVERLAP_D.
function seed_n_cycle(ids, cycleOrder) {
  const n = cycleOrder.length;
  // Ring radius such that adjacent centres are exactly OVERLAP_D apart:
  //   2 * ringR * sin(π/n) = OVERLAP_D
  const ringR = OVERLAP_D / (2 * Math.sin(Math.PI / n));
  // Spoke size: small enough that non-adjacent shapes don't overlap,
  // large enough that adjacent shapes do. Non-adjacent nearest distance is
  // 2*ringR*sin(2π/n). We pick spokeR at the midpoint between the two bounds.
  const maxSpokeR = ringR * Math.sin(2 * Math.PI / n);
  const minSpokeR = OVERLAP_D / 2;
  // Bias toward larger shapes (0.82 lerp) so overlap regions are large
  // enough for readable labels. Adjacent-pair intersections are deep;
  // non-adjacent pairs stay separated (safety gap ~9–11 % of OVERLAP_D).
  const spokeR = minSpokeR + 0.82 * (maxSpokeR - minSpokeR);
  const spokeW = spokeR * 2;

  const byId = {};
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // first spoke at 12-o'clock
    byId[cycleOrder[i]] = asShape(cycleOrder[i], ringR * Math.cos(angle), ringR * Math.sin(angle), spokeW, spokeW);
  }
  return ids.map(id => byId[id]);
}

// 4-set dense (K4 or near-K4): 5 or 6 overlap pairs. Place in a tight 2×2
// grid so all horizontal, vertical, and diagonal pairs overlap.
function seed_four_dense(ids) {
  const d = OVERLAP_D / 2;
  return [
    asShape(ids[0], -d, -d),
    asShape(ids[1],  d, -d),
    asShape(ids[2], -d,  d),
    asShape(ids[3],  d,  d),
  ];
}

// n-shape dense "pile" — used when 4–6 sets all heavily overlap but don't
// match a clean hub/chain/cycle. Shapes sit on a small ring with hash-seeded
// radial + angular jitter so the cluster looks organic (matches UCAT's
// "shapes piled at varied heights" aesthetic rather than a neat ring). The
// ring radius is small enough that every shape overlaps every other shape —
// polygon-clipping then carves out whichever regions the region keys ask for.
function seed_n_pile(ids, hash = 0) {
  const n = ids.length;
  const ringR = 0.55 * R;
  const shapeR = R * 1.10;
  // Ring jitter must stay bounded — shapes on the ring must all mutually
  // overlap for n_pile to carve arbitrary region keys. (2π/n)/5 angular
  // and 10% radial keeps the pile visually organic without separating shapes.
  const angleJitterMax = (2 * Math.PI) / n / 5;
  const radialJitterMax = 0.10 * ringR;
  return ids.map((id, i) => {
    const baseAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    const dA = (hashedRand(hash, 301 + i) - 0.5) * 2 * angleJitterMax;
    const dR = (hashedRand(hash, 401 + i) - 0.5) * 2 * radialJitterMax;
    const angle = baseAngle + dA;
    const rad = ringR + dR;
    return asShape(id, rad * Math.cos(angle), rad * Math.sin(angle), shapeR * 2, shapeR * 2);
  });
}

// n-shape chain (any n ≥ 5). Each adjacent pair in `order` overlaps; non-
// adjacent pairs do not. Visually identical structure to seed_four_linear,
// generalised so 5/6/7-shape chains render as a clean horizontal sequence
// rather than falling through to the unrecognised-row fallback.
function seed_n_chain(ids, order) {
  const positions = {};
  const k = order.length;
  for (let i = 0; i < k; i++) {
    const x = (i - (k - 1) / 2) * OVERLAP_D;
    positions[order[i]] = asShape(order[i], x, 0);
  }
  return inOrder(ids, positions);
}

// n-shape hub (any n ≥ 4). One central "hub" set overlaps every "spoke" set;
// spokes do not overlap each other. Spokes are arranged radially around the
// hub. Spoke radii shrink as the spoke count grows so that adjacent spokes
// don't touch each other while still each overlapping the hub. Hash-seeded
// angle jitter breaks the mechanical "perfect ring" look without ever
// collapsing two spokes into each other.
function seed_n_hub(ids, hubId, spokeIds, hash = 0) {
  const k = spokeIds.length;
  // Geometry tuned per spoke count so spokes overlap the hub but not each
  // other. Constraints (treating shapes as circles of given radii):
  //   - hub-spoke center distance d satisfies d < R_hub + R_spoke (overlap)
  //   - adjacent spoke centers separated by 2d·sin(π/k) > 2·R_spoke (no overlap)
  // hubR is grown beyond R for k>=4: the hub doesn't affect spoke-spoke
  // collision, and spoke edges (d + spokeR) dominate the canvas bbox, so
  // enlarging the hub is "free" and directly widens every hub-spoke overlap
  // lens — which is where the per-spoke labels sit.
  let d, spokeR, hubR;
  if (k <= 3)      { d = 1.10 * R; spokeR = R;        hubR = R;        }
  else if (k === 4){ d = 1.30 * R; spokeR = 0.85 * R; hubR = 1.15 * R; }
  else if (k === 5){ d = 1.40 * R; spokeR = 0.75 * R; hubR = 1.15 * R; }
  else             { d = 1.50 * R; spokeR = 0.65 * R; hubR = 1.20 * R; } // k = 6+

  const positions = {};
  positions[hubId] = asShape(hubId, 0, 0, hubR * 2, hubR * 2);
  const spokeW = spokeR * 2;
  // Angular jitter must stay well below half the gap to the next spoke so the
  // hub-spoke intersection lens (where the per-spoke label lives) never
  // shrinks below the area floor. (2π/k)/6 is a conservative fraction —
  // enough visible asymmetry without risking the region guarantees.
  const angleJitterMax = (2 * Math.PI) / k / 6;
  // Small radial jitter (±4% of d) gives subtle "some spokes jut further"
  // variety without shrinking hub-spoke intersections noticeably.
  const radialJitterMax = 0.04 * d;
  for (let i = 0; i < k; i++) {
    const baseAngle = (2 * Math.PI * i) / k - Math.PI / 2; // first spoke at 12 o'clock
    const dA = (hashedRand(hash, 101 + i) - 0.5) * 2 * angleJitterMax;
    const dR = (hashedRand(hash, 211 + i) - 0.5) * 2 * radialJitterMax;
    const angle = baseAngle + dA;
    const rad = d + dR;
    const x = rad * Math.cos(angle);
    const y = rad * Math.sin(angle);
    positions[spokeIds[i]] = asShape(spokeIds[i], x, y, spokeW, spokeW);
  }
  return inOrder(ids, positions);
}

// ---------------------------------------------------------------------------
// Container layout: one set nests ≥2 inner sets, plus optional external sets.
// The container is drawn as a wide rectangle around the inner arrangement;
// external sets sit to the right.
// ---------------------------------------------------------------------------

// Inner-cluster geometry (shared across variants)
const INNER_SCALE = 0.55;
const INNER_R = R * INNER_SCALE;
const INNER_W = INNER_R * 2;
// Balanced: tighter than v1 so triple regions (set1 ∩ set2 ∩ set3 inside a
// container) have usable clearance, but loose enough that middle shapes in a
// 4+ chain still have a visible only-region.
const INNER_SPACING_OVERLAP  = INNER_R * 1.20;
const INNER_SPACING_SEPARATE = INNER_R * 2.30;
const CONTAINER_PAD = INNER_R * 0.95;

function pairKey(a, b) {
  return [a, b].sort().join('|');
}

// Compute the overlap pairs that exist between inner sets, derived from the
// region keys after removing the container set.
function computeInnerOverlapPairs(innerIds, regions, allSetIds) {
  const innerSet = new Set(innerIds);
  const pairs = new Set();
  for (const rk of Object.keys(regions)) {
    if (rk === 'outside') continue;
    const inside = parseRegionKey(rk, allSetIds).insideIds.filter(id => innerSet.has(id));
    for (let a = 0; a < inside.length; a++) {
      for (let b = a + 1; b < inside.length; b++) {
        pairs.add(pairKey(inside[a], inside[b]));
      }
    }
  }
  return pairs;
}

// === Inner-cluster layout variants ===
// Each variant takes orderedIds (chain order from orderWithOverlapsAdjacent)
// and overlapPairs, and returns { id: {cx, cy, w, h}, ... } centred on origin.

// Spacing between row centres in the two-row / snake layouts. INNER_R*1.3*2
// gives a comfortable 16 px clearance between top-row and bottom-row shape
// edges (no overlap; rows are visually distinct).
const INNER_ROW_GAP = INNER_R * 1.3 * 2;

function placeRow(positions, ids, overlapPairs, y) {
  if (ids.length === 0) return;
  positions[ids[0]] = { cx: 0, cy: y, w: INNER_W, h: INNER_W };
  let x = 0;
  for (let i = 1; i < ids.length; i++) {
    const isOverlap = overlapPairs.has(pairKey(ids[i - 1], ids[i]));
    x += isOverlap ? INNER_SPACING_OVERLAP : INNER_SPACING_SEPARATE;
    positions[ids[i]] = { cx: x, cy: y, w: INNER_W, h: INNER_W };
  }
}

// Split an ordered chain into contiguous overlap-segments. A new segment
// starts wherever consecutive shapes in the chain don't actually overlap.
function chainSegments(orderedIds, overlapPairs) {
  if (orderedIds.length === 0) return [];
  const segments = [[orderedIds[0]]];
  for (let i = 1; i < orderedIds.length; i++) {
    if (overlapPairs.has(pairKey(orderedIds[i - 1], orderedIds[i]))) {
      segments[segments.length - 1].push(orderedIds[i]);
    } else {
      segments.push([orderedIds[i]]);
    }
  }
  return segments;
}

function recenterRowX(positions, ids) {
  if (ids.length === 0) return;
  const subset = Object.fromEntries(ids.map(id => [id, positions[id]]));
  const bbox = bboxOfPositions(subset);
  const cx = (bbox.minX + bbox.maxX) / 2;
  for (const id of ids) positions[id].cx -= cx;
}

// === Inner-cluster layouts ===

function layout_inner_row(orderedIds, overlapPairs) {
  const positions = {};
  placeRow(positions, orderedIds, overlapPairs, 0);
  return centerPositionsOnOrigin(positions);
}

// Two-row layout. The biggest overlap-segment of the chain goes on top; the
// remaining segments / isolated shapes fill the bottom row. For a pure single
// chain we fall back to row — snaking pure chains across rows risks phantom
// diagonal overlaps that contradict the region keys.
function layout_inner_two_rows(orderedIds, overlapPairs) {
  const segments = chainSegments(orderedIds, overlapPairs);
  if (segments.length === 1) return layout_inner_row(orderedIds, overlapPairs);

  const sorted = [...segments].sort((a, b) => b.length - a.length);
  const topRow = sorted[0];
  const bottomRow = sorted.slice(1).flat();

  const positions = {};
  placeRow(positions, topRow,    overlapPairs, -INNER_ROW_GAP / 2);
  placeRow(positions, bottomRow, overlapPairs,  INNER_ROW_GAP / 2);
  recenterRowX(positions, topRow);
  recenterRowX(positions, bottomRow);
  return centerPositionsOnOrigin(positions);
}

const INNER_LAYOUT_FNS = {
  row:      layout_inner_row,
  two_rows: layout_inner_two_rows,
};

// === External-shape placement ===
// Externals adjoin the container on one of four sides. Combos are constrained
// (in LAYOUT_COMBOS below) to keep the canvas aspect ratio wider than tall so
// the renderer doesn't have to shrink to fit the viewport height.

const EXTERNAL_GAP = R * 0.18;   // ~9 px in unit space — externals visually adjoin the container

function placeExternals(externalIds, containerW, containerH, side) {
  const positions = {};
  if (externalIds.length === 0) return positions;

  if (side === 'right' || side === 'left') {
    const sign = side === 'right' ? 1 : -1;
    const startX = sign * (containerW / 2 + EXTERNAL_GAP + W / 2);
    const totalH = externalIds.length * H + (externalIds.length - 1) * EXTERNAL_GAP;
    let y = -totalH / 2 + H / 2;
    for (const id of externalIds) {
      positions[id] = { cx: startX, cy: y, w: W, h: H };
      y += H + EXTERNAL_GAP;
    }
  } else {
    const sign = side === 'bottom' ? 1 : -1;
    const startY = sign * (containerH / 2 + EXTERNAL_GAP + H / 2);
    const totalW = externalIds.length * W + (externalIds.length - 1) * EXTERNAL_GAP;
    let x = -totalW / 2 + W / 2;
    for (const id of externalIds) {
      positions[id] = { cx: x, cy: startY, w: W, h: H };
      x += W + EXTERNAL_GAP;
    }
  }
  return positions;
}

// === Layout combinations ===
// Hand-picked set of (inner × external) combinations that all keep the canvas
// aspect ratio reasonable for a phone viewport. Hash-indexed so the same
// vennConfig always picks the same combo (deterministic across users).
//
// Excluded combos: two_rows + top/bottom external — the canvas becomes taller
// than wide and the renderer has to shrink it, making fonts unreadable.
const LAYOUT_COMBOS = [
  { inner: 'row',      external: 'right'  },
  { inner: 'row',      external: 'left'   },
  { inner: 'row',      external: 'top'    },
  { inner: 'row',      external: 'bottom' },
  { inner: 'two_rows', external: 'right'  },
  { inner: 'two_rows', external: 'left'   },
];

function pickLayoutCombo(hash, override) {
  if (override?.inner && override?.external && INNER_LAYOUT_FNS[override.inner]) {
    return { inner: override.inner, external: override.external };
  }
  return LAYOUT_COMBOS[hash % LAYOUT_COMBOS.length];
}

// === Main container seeding with variants ===

function seed_container(allSetIds, containerId, innerIds, externalIds, regions, hash, layoutVariantOverride) {
  const innerOverlapPairs = computeInnerOverlapPairs(innerIds, regions, allSetIds);
  const orderedInner = orderWithOverlapsAdjacent(innerIds, innerOverlapPairs);

  const combo = pickLayoutCombo(hash, layoutVariantOverride);
  const innerPositions = INNER_LAYOUT_FNS[combo.inner](orderedInner, innerOverlapPairs);

  // Container: bounding rectangle around the inner cluster + padding
  const innerBBox = bboxOfPositions(innerPositions);
  const containerW = innerBBox.w + CONTAINER_PAD * 2;
  const containerH = innerBBox.h + CONTAINER_PAD * 2;

  // External shapes outside the container on the chosen side
  const externalPositions = placeExternals(externalIds, containerW, containerH, combo.external);

  // Assemble in input order
  const all = {
    [containerId]: { cx: 0, cy: 0, w: containerW, h: containerH },
    ...innerPositions,
    ...externalPositions,
  };
  return allSetIds.map(id => ({
    id,
    cx: all[id].cx,
    cy: all[id].cy,
    w: all[id].w,
    h: all[id].h,
  }));
}

function bboxOfPositions(positions) {
  const ids = Object.keys(positions);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of ids) {
    const p = positions[id];
    minX = Math.min(minX, p.cx - p.w / 2);
    minY = Math.min(minY, p.cy - p.h / 2);
    maxX = Math.max(maxX, p.cx + p.w / 2);
    maxY = Math.max(maxY, p.cy + p.h / 2);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function centerPositionsOnOrigin(positions) {
  const bbox = bboxOfPositions(positions);
  const dx = -(bbox.minX + bbox.maxX) / 2;
  const dy = -(bbox.minY + bbox.maxY) / 2;
  for (const id of Object.keys(positions)) {
    positions[id].cx += dx;
    positions[id].cy += dy;
  }
  return positions;
}

function orderWithOverlapsAdjacent(ids, overlapPairs) {
  if (ids.length <= 1) return ids.slice();
  // Build adjacency
  const adj = Object.fromEntries(ids.map(id => [id, new Set()]));
  for (const p of overlapPairs) {
    const [a, b] = p.split('|');
    if (adj[a]) adj[a].add(b);
    if (adj[b]) adj[b].add(a);
  }
  // Walk from a node with at least one neighbour (preferring degree-1 start)
  const degree = id => adj[id].size;
  let start = ids.find(id => degree(id) === 1) || ids[0];
  const order = [start];
  const visited = new Set(order);
  while (order.length < ids.length) {
    const cur = order[order.length - 1];
    const next = [...adj[cur]].find(id => !visited.has(id));
    if (next) {
      order.push(next);
      visited.add(next);
    } else {
      // no neighbour left — pick any unvisited
      const any = ids.find(id => !visited.has(id));
      if (!any) break;
      order.push(any);
      visited.add(any);
    }
  }
  return order;
}

// ---------------------------------------------------------------------------
// Structure classifier — picks the topology family for a given region set
// ---------------------------------------------------------------------------

// Per-topology jitter profiles. Keys match the topology family name chosen
// by the classifier. Values configure applyJitter():
//   yAmp      — vertical jitter amplitude (units of R). 0 disables.
//   sizeRange — [lo, hi] multiplier on shape w/h. null disables.
//   rotAmp    — rotation amplitude in radians. 0 disables.
// Tight geometries (three_nested, n_cycle, four_cycle) get minimal or no
// jitter because the topology relies on exact positioning to produce the
// intended regions; anything more and polygon-clipping stops yielding them.
// Jitter amplitudes tuned to preserve region guarantees. Every topology
// relies on polygon-clipping producing non-trivial intersection areas for
// every declared region — aggressive jitter (yAmp > 0.15, rotAmp > 0.18,
// size variance > ±7%) can collapse marginal overlaps (triple intersections,
// diagonal pairs in dense 4-set grids) below the 4 px² area floor and throw
// at bake time. The values below are as high as we can push while keeping
// every existing preview-dm test green. Rotation is the primary visual
// payoff — it's safe to keep wherever we can.
const JITTER_PROFILES = {
  three_all_overlap:         { yAmp: 0.04, sizeRange: [0.97, 1.04], rotAmp: 0.06 },
  three_linear:              { yAmp: 0.14, sizeRange: [0.95, 1.07], rotAmp: 0.09 },
  three_one_separate:        { yAmp: 0.14, sizeRange: [0.95, 1.07], rotAmp: 0.09 },
  three_nested:              { yAmp: 0,    sizeRange: null,         rotAmp: 0    },
  three_nested_one_separate: { yAmp: 0.08, sizeRange: [0.97, 1.04], rotAmp: 0.06 },
  three_separate:            { yAmp: 0.18, sizeRange: [0.92, 1.10], rotAmp: 0.10 },
  four_linear:               { yAmp: 0.10, sizeRange: [0.95, 1.06], rotAmp: 0.07 },
  four_two_pairs:            { yAmp: 0.12, sizeRange: [0.94, 1.08], rotAmp: 0.08 },
  four_cycle:                { yAmp: 0,    sizeRange: [0.98, 1.03], rotAmp: 0.05 },
  four_dense:                { yAmp: 0,    sizeRange: [0.98, 1.03], rotAmp: 0.04 },
  n_chain:                   { yAmp: 0.08, sizeRange: [0.96, 1.04], rotAmp: 0.06 },
  n_cycle:                   { yAmp: 0,    sizeRange: [0.98, 1.02], rotAmp: 0.04 },
  n_hub:                     { yAmp: 0,    sizeRange: null,         rotAmp: 0.06 },
  n_pile:                    { yAmp: 0.05, sizeRange: [0.96, 1.05], rotAmp: 0.06 },
  all_separate:              { yAmp: 0.22, sizeRange: [0.88, 1.15], rotAmp: 0.11 },
  main_plus_separate:        { yAmp: 0.10, sizeRange: [0.95, 1.06], rotAmp: 0.07 },
  container:                 { yAmp: 0,    sizeRange: null,         rotAmp: 0    },
  fallback:                  { yAmp: 0.10, sizeRange: [0.95, 1.07], rotAmp: 0.07 },
};

function jitter(shapes, idToShape, hash, profileName) {
  const profile = JITTER_PROFILES[profileName] || JITTER_PROFILES.fallback;
  return applyJitter(shapes, idToShape, hash, profile);
}

export function seedPositions(allSetIds, regions, hash = 0, layoutVariantOverride = null, idToShape = {}) {
  const n = allSetIds.length;
  const { overlapPairs, mentions } = analyzeRegions(allSetIds, regions);
  const nestings = findNestings(allSetIds, mentions);
  const pairs = pairsOf(overlapPairs);

  // Identify fully-disjoint sets (no overlap with anyone)
  const involvedSet = new Set();
  for (const [a, b] of pairs) { involvedSet.add(a); involvedSet.add(b); }
  const separateIds = allSetIds.filter(id => !involvedSet.has(id));
  const mainIds = allSetIds.filter(id => involvedSet.has(id));

  // Container detection: does any main ID nest >= 2 other main IDs?
  const containCount = Object.fromEntries(mainIds.map(id => [id, 0]));
  for (const [inner, outer] of nestings) {
    if (mainIds.includes(outer) && mainIds.includes(inner)) containCount[outer]++;
  }
  const sortedContain = Object.entries(containCount).sort((a, b) => b[1] - a[1]);
  const [containerId, containerCount] = sortedContain[0] || [null, 0];

  if (containerCount >= 2) {
    const innerIds = nestings
      .filter(([inner, outer]) => outer === containerId && mainIds.includes(inner))
      .map(([inner]) => inner);
    const mainOthers = mainIds.filter(id => id !== containerId && !innerIds.includes(id));
    const externalIds = [...mainOthers, ...separateIds];
    const raw = seed_container(allSetIds, containerId, innerIds, externalIds, regions, hash, layoutVariantOverride);
    // Container geometry is tight — apply a tiny per-shape rotation to inner
    // + external shapes but skip Y-jitter (would push shapes out of the
    // container or break external gap).
    return applyJitter(raw, idToShape, hash, {
      yAmp: 0,
      sizeRange: null,
      rotAmp: 0.08,
    }).map(s =>
      // The container set itself must NOT rotate — it's a bounding rect and
      // rotating it breaks the visual "box around inners".
      s.id === containerId ? { ...s, rotation: 0 } : s
    );
  }

  // If we have both main + separate and the main is handleable on its own,
  // layout main, then tack separates to the right.
  if (separateIds.length > 0 && mainIds.length > 0) {
    const mainLayout = seedPositions(mainIds, regions, hash, layoutVariantOverride, idToShape);
    const maxX = Math.max(...mainLayout.map(s => s.cx + s.w / 2));
    const minY = Math.min(...mainLayout.map(s => s.cy - s.h / 2));
    const maxY = Math.max(...mainLayout.map(s => s.cy + s.h / 2));

    const positions = {};
    for (const s of mainLayout) {
      positions[s.id] = { cx: s.cx, cy: s.cy, w: s.w, h: s.h, rotation: s.rotation || 0 };
    }

    let exX = maxX + SEPARATE_D / 2 + R;
    for (const id of separateIds) {
      positions[id] = { cx: exX, cy: (minY + maxY) / 2, w: W, h: H, rotation: 0 };
      exX += W + SEPARATE_D * 0.4;
    }

    // Only jitter the separate tail — the main cluster was already jittered
    // by its own recursive seedPositions call.
    const tail = separateIds.map(id => ({ id, ...positions[id] }));
    const jitteredTail = jitter(tail, idToShape, hash ^ 0x9E3779B1, 'main_plus_separate');
    for (const s of jitteredTail) positions[s.id] = s;

    return allSetIds.map(id => ({ id, ...positions[id] }));
  }

  // All separate
  if (separateIds.length === n) {
    return jitter(seed_all_separate(allSetIds), idToShape, hash, 'all_separate');
  }

  // Hub-and-spoke (any n ≥ 4): one set has degree n-1, every other set degree 1.
  if (n >= 4) {
    const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
    for (const [a, b] of pairs) { deg[a]++; deg[b]++; }
    const hubId = allSetIds.find(id => deg[id] === n - 1);
    if (hubId && allSetIds.every(id => id === hubId || deg[id] === 1)) {
      const spokes = allSetIds.filter(id => id !== hubId);
      return jitter(seed_n_hub(allSetIds, hubId, spokes, hash), idToShape, hash, 'n_hub');
    }
  }

  // n-cycle (any n ≥ 5): n overlap pairs where every node has degree 2 (ring).
  if (n >= 5 && pairs.length === n) {
    const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
    for (const [a, b] of pairs) { deg[a]++; deg[b]++; }
    const allDeg2 = allSetIds.every(id => deg[id] === 2);
    if (allDeg2) {
      const cycleOrder = walkCycle(allSetIds, pairs);
      if (cycleOrder && cycleOrder.length === n) {
        return jitter(seed_n_cycle(allSetIds, cycleOrder), idToShape, hash, 'n_cycle');
      }
    }
  }

  // n-chain (any n ≥ 5): n-1 overlap pairs forming a path with two endpoints.
  if (n >= 5 && pairs.length === n - 1) {
    const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
    for (const [a, b] of pairs) { deg[a]++; deg[b]++; }
    const endpoints = allSetIds.filter(id => deg[id] === 1);
    const middle    = allSetIds.filter(id => deg[id] === 2);
    if (endpoints.length === 2 && endpoints.length + middle.length === n) {
      const order = walkChain(allSetIds, pairs, endpoints[0]);
      if (order.length === n) {
        return jitter(seed_n_chain(allSetIds, order), idToShape, hash, 'n_chain');
      }
    }
  }

  // n-pile (n ≥ 5): dense cluster where overlap pattern doesn't match
  // hub/cycle/chain — many pairs, often most or all pairs. Shapes stack on a
  // small ring so they all intersect each other; polygon-clipping carves out
  // whichever regions the region keys request. Matches the UCAT "big pile of
  // shapes at varied heights" aesthetic. (n=4 dense is handled by
  // seed_four_dense below; n_pile would otherwise short-circuit it.)
  if (n >= 5 && pairs.length >= n) {
    return jitter(seed_n_pile(allSetIds, hash), idToShape, hash, 'n_pile');
  }

  // ---- "Main-only" families (3+ sets only — UCAT venn questions never use 2 sets) ----

  if (n === 3) {
    // Full chain nesting
    if (nestings.length >= 2) {
      const innersSet = new Set(nestings.map(p => p[0]));
      const outers = allSetIds.filter(id => !innersSet.has(id));
      if (outers.length === 1) {
        const outermost = outers[0];
        const mid = nestings.find(([, o]) => o === outermost)?.[0];
        const inner = mid ? nestings.find(([, o]) => o === mid)?.[0] : null;
        if (mid && inner) {
          return jitter(seed_three_nested(allSetIds, inner, mid, outermost), idToShape, hash, 'three_nested');
        }
      }
    }
    // Single nesting + lone
    if (nestings.length === 1) {
      const [inner, outer] = nestings[0];
      const lone = allSetIds.find(id => id !== inner && id !== outer);
      const loneOverlaps =
        overlapPairs.has([lone, inner].sort().join('|')) ||
        overlapPairs.has([lone, outer].sort().join('|'));
      if (!loneOverlaps) {
        return jitter(seed_three_nested_one_separate(allSetIds, inner, outer, lone), idToShape, hash, 'three_nested_one_separate');
      }
    }

    if (pairs.length === 3) {
      return jitter(seed_three_all_overlap(allSetIds), idToShape, hash, 'three_all_overlap');
    }

    if (pairs.length === 2) {
      const count = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { count[x]++; count[y]++; }
      const mid = allSetIds.find(id => count[id] === 2);
      const sides = allSetIds.filter(id => count[id] === 1);
      if (mid && sides.length === 2) {
        return jitter(seed_three_linear(allSetIds, mid, sides[0], sides[1]), idToShape, hash, 'three_linear');
      }
    }

    if (pairs.length === 1) {
      const [pa, pb] = pairs[0];
      const lone = allSetIds.find(id => id !== pa && id !== pb);
      return jitter(seed_three_one_separate(allSetIds, pa, pb, lone), idToShape, hash, 'three_one_separate');
    }

    if (pairs.length === 0) {
      return jitter(seed_three_separate(allSetIds), idToShape, hash, 'three_separate');
    }
  }

  if (n === 4) {
    // four_dense: 5 or 6 overlap pairs — K4 or near-K4, tight 2×2 grid
    if (pairs.length >= 5) {
      return jitter(seed_four_dense(allSetIds), idToShape, hash, 'four_dense');
    }
    // four_two_pairs: 2 overlap pairs, no shared set
    if (pairs.length === 2) {
      const [p1, p2] = pairs;
      const shared = p1.some(x => p2.includes(x));
      if (!shared) {
        return jitter(seed_four_two_pairs(allSetIds, p1[0], p1[1], p2[0], p2[1]), idToShape, hash, 'four_two_pairs');
      }
    }
    // four_linear: 3 overlap pairs forming a chain (two degree-1 endpoints)
    if (pairs.length === 3) {
      const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { deg[x]++; deg[y]++; }
      const endpoints = allSetIds.filter(id => deg[id] === 1);
      if (endpoints.length === 2) {
        const order = walkChain(allSetIds, pairs, endpoints[0]);
        if (order.length === 4) {
          return jitter(seed_four_linear(allSetIds, order), idToShape, hash, 'four_linear');
        }
      }
    }
    // four_cycle: 4 overlap pairs, all degree 2
    if (pairs.length === 4) {
      const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { deg[x]++; deg[y]++; }
      const allDeg2 = allSetIds.every(id => deg[id] === 2);
      if (allDeg2) {
        const cycleOrder = walkCycle(allSetIds, pairs);
        if (cycleOrder && cycleOrder.length === 4) {
          return jitter(seed_four_cycle(allSetIds, cycleOrder), idToShape, hash, 'four_cycle');
        }
      }
    }
  }

  // Fallback for unrecognized shapes: place in a row and let the scale loop
  // try to make it work.
  const fallback = allSetIds.map((id, i) => asShape(id, (i - (n - 1) / 2) * OVERLAP_D, 0));
  return jitter(fallback, idToShape, hash, 'fallback');
}

function walkChain(ids, pairs, startId) {
  const adj = Object.fromEntries(ids.map(id => [id, new Set()]));
  for (const [x, y] of pairs) { adj[x].add(y); adj[y].add(x); }
  const order = [startId];
  const visited = new Set(order);
  let cur = startId;
  while (order.length < ids.length) {
    const next = [...adj[cur]].find(id => !visited.has(id));
    if (!next) break;
    order.push(next);
    visited.add(next);
    cur = next;
  }
  return order;
}

function walkCycle(ids, pairs) {
  const adj = Object.fromEntries(ids.map(id => [id, new Set()]));
  for (const [x, y] of pairs) { adj[x].add(y); adj[y].add(x); }
  const start = ids[0];
  const order = [start];
  const visited = new Set(order);
  let cur = start;
  while (order.length < ids.length) {
    const next = [...adj[cur]].find(id => !visited.has(id));
    if (!next) return null;
    order.push(next);
    visited.add(next);
    cur = next;
  }
  // Confirm the cycle closes
  if (!adj[cur].has(start)) return null;
  return order;
}
