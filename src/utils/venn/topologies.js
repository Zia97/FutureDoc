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
  return { id, cx, cy, w, h };
}

function inOrder(ids, byIdMap) {
  return ids.map(id => byIdMap[id]);
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
// don't touch each other while still each overlapping the hub.
function seed_n_hub(ids, hubId, spokeIds) {
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
  for (let i = 0; i < k; i++) {
    const angle = (2 * Math.PI * i) / k - Math.PI / 2; // first spoke at 12 o'clock
    const x = d * Math.cos(angle);
    const y = d * Math.sin(angle);
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

export function seedPositions(allSetIds, regions, hash = 0, layoutVariantOverride = null) {
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
    return seed_container(allSetIds, containerId, innerIds, externalIds, regions, hash, layoutVariantOverride);
  }

  // If we have both main + separate and the main is handleable on its own,
  // layout main, then tack separates to the right.
  if (separateIds.length > 0 && mainIds.length > 0) {
    const mainLayout = seedPositions(mainIds, regions, hash, layoutVariantOverride);
    const maxX = Math.max(...mainLayout.map(s => s.cx + s.w / 2));
    const minY = Math.min(...mainLayout.map(s => s.cy - s.h / 2));
    const maxY = Math.max(...mainLayout.map(s => s.cy + s.h / 2));

    const positions = {};
    for (const s of mainLayout) positions[s.id] = { cx: s.cx, cy: s.cy, w: s.w, h: s.h };

    let exX = maxX + SEPARATE_D / 2 + R;
    for (const id of separateIds) {
      positions[id] = { cx: exX, cy: (minY + maxY) / 2, w: W, h: H };
      exX += W + SEPARATE_D * 0.4;
    }

    return allSetIds.map(id => ({ id, ...positions[id] }));
  }

  // All separate
  if (separateIds.length === n) return seed_all_separate(allSetIds);

  // Hub-and-spoke (any n ≥ 4): one set has degree n-1, every other set degree 1.
  if (n >= 4) {
    const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
    for (const [a, b] of pairs) { deg[a]++; deg[b]++; }
    const hubId = allSetIds.find(id => deg[id] === n - 1);
    if (hubId && allSetIds.every(id => id === hubId || deg[id] === 1)) {
      const spokes = allSetIds.filter(id => id !== hubId);
      return seed_n_hub(allSetIds, hubId, spokes);
    }
  }

  // n-chain (any n ≥ 5): n-1 overlap pairs forming a path with two endpoints.
  // (n=4 chain is handled by seed_four_linear in the n===4 block below.)
  if (n >= 5 && pairs.length === n - 1) {
    const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
    for (const [a, b] of pairs) { deg[a]++; deg[b]++; }
    const endpoints = allSetIds.filter(id => deg[id] === 1);
    const middle    = allSetIds.filter(id => deg[id] === 2);
    if (endpoints.length === 2 && endpoints.length + middle.length === n) {
      const order = walkChain(allSetIds, pairs, endpoints[0]);
      if (order.length === n) return seed_n_chain(allSetIds, order);
    }
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
        if (mid && inner) return seed_three_nested(allSetIds, inner, mid, outermost);
      }
    }
    // Single nesting + lone
    if (nestings.length === 1) {
      const [inner, outer] = nestings[0];
      const lone = allSetIds.find(id => id !== inner && id !== outer);
      const loneOverlaps =
        overlapPairs.has([lone, inner].sort().join('|')) ||
        overlapPairs.has([lone, outer].sort().join('|'));
      if (!loneOverlaps) return seed_three_nested_one_separate(allSetIds, inner, outer, lone);
    }

    if (pairs.length === 3) return seed_three_all_overlap(allSetIds);

    if (pairs.length === 2) {
      const count = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { count[x]++; count[y]++; }
      const mid = allSetIds.find(id => count[id] === 2);
      const sides = allSetIds.filter(id => count[id] === 1);
      if (mid && sides.length === 2) return seed_three_linear(allSetIds, mid, sides[0], sides[1]);
    }

    if (pairs.length === 1) {
      const [pa, pb] = pairs[0];
      const lone = allSetIds.find(id => id !== pa && id !== pb);
      return seed_three_one_separate(allSetIds, pa, pb, lone);
    }

    if (pairs.length === 0) return seed_three_separate(allSetIds);
  }

  if (n === 4) {
    // four_two_pairs: 2 overlap pairs, no shared set
    if (pairs.length === 2) {
      const [p1, p2] = pairs;
      const shared = p1.some(x => p2.includes(x));
      if (!shared) return seed_four_two_pairs(allSetIds, p1[0], p1[1], p2[0], p2[1]);
    }
    // four_linear: 3 overlap pairs forming a chain (two degree-1 endpoints)
    if (pairs.length === 3) {
      const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { deg[x]++; deg[y]++; }
      const endpoints = allSetIds.filter(id => deg[id] === 1);
      if (endpoints.length === 2) {
        const order = walkChain(allSetIds, pairs, endpoints[0]);
        if (order.length === 4) return seed_four_linear(allSetIds, order);
      }
    }
    // four_cycle: 4 overlap pairs, all degree 2
    if (pairs.length === 4) {
      const deg = Object.fromEntries(allSetIds.map(id => [id, 0]));
      for (const [x, y] of pairs) { deg[x]++; deg[y]++; }
      const allDeg2 = allSetIds.every(id => deg[id] === 2);
      if (allDeg2) {
        const cycleOrder = walkCycle(allSetIds, pairs);
        if (cycleOrder && cycleOrder.length === 4) return seed_four_cycle(allSetIds, cycleOrder);
      }
    }
  }

  // Fallback for unrecognized shapes: place in a row and let the scale loop
  // try to make it work.
  return allSetIds.map((id, i) => asShape(id, (i - (n - 1) / 2) * OVERLAP_D, 0));
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
