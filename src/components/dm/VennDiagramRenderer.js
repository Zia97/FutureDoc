import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Polygon,
  Ellipse,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const STROKE_WIDTH = 2;
const FONT_SIZE = 14;
const MIN_FONT_SIZE = 9;
const MIN_OVERLAP_DEPTH = 30; // minimum pixels of geometric overlap between any two shapes
const MIN_LABEL_CLEARANCE = 10; // minimum clearance (px) an overlap region must have for a readable label
const MAX_RBOOST_ATTEMPTS = 3; // how many times to retry with a larger radius
const RBOOST_STEP = 8; // px added to base radius on each retry

// Module-level layout cache — persists across component unmounts so navigating
// back to a previously-seen diagram is instant (no re-run of force-directed solver).
const _layoutCache = new Map();

// --- Label safety helpers ---

function distPointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/**
 * Convert a shape + position into a geometry object used for outline-distance
 * queries. Returns { type:'circle', cx, cy, r } or { type:'polygon', segs }.
 */
function shapeToGeometry(shapeType, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  if (shapeType === 'circle') {
    return { type: 'circle', cx, cy, r };
  }
  let pts;
  if (shapeType === 'triangle') {
    pts = [[cx, cy - r], [cx - r, cy + r], [cx + r, cy + r]];
  } else if (shapeType === 'diamond') {
    pts = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
  } else if (shapeType === 'pentagon') {
    pts = Array.from({ length: 5 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  } else if (shapeType === 'hexagon') {
    pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  } else if (shapeType === 'octagon') {
    pts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 8 - Math.PI / 2;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
  } else if (shapeType === 'oval') {
    const rx = r, ry = r * 0.65;
    pts = Array.from({ length: 16 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 16;
      return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
  } else if (shapeType === 'vertical_oval') {
    const rx = r * 0.65, ry = r;
    pts = Array.from({ length: 16 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 16;
      return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
    });
  } else if (shapeType === 'isosceles_triangle') {
    pts = [[cx, cy - r], [cx - r * 0.5, cy + r], [cx + r * 0.5, cy + r]];
  } else if (shapeType === 'parallelogram') {
    const sk = r * 0.25;
    pts = [[cx - r * 0.85 + sk, cy - r * 0.6], [cx + r * 0.85 + sk, cy - r * 0.6],
           [cx + r * 0.85 - sk, cy + r * 0.6], [cx - r * 0.85 - sk, cy + r * 0.6]];
  } else if (shapeType === 'star') {
    const innerR = r * 0.4;
    pts = Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : innerR;
      return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    });
  } else if (shapeType === 'trapezoid') {
    pts = [[cx - r * 0.55, cy - r], [cx + r * 0.55, cy - r],
           [cx + r, cy + r], [cx - r, cy + r]];
  } else {
    // square / rectangle
    const hw = w / 2, hh = h / 2;
    pts = [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]];
  }
  const segs = pts.map((p, i) => [...p, ...pts[(i + 1) % pts.length]]);
  return { type: 'polygon', segs };
}

/**
 * Clamp centre-to-centre distance so the geometric overlap between two shapes
 * is at least MIN_OVERLAP_DEPTH pixels deep.
 *   ext1 / ext2 = ray extents from each centre toward the other.
 *   dist        = proposed centre-to-centre distance.
 *   minFloor    = absolute minimum distance (prevents shapes collapsing).
 */
function clampDistForOverlap(dist, ext1, ext2, minFloor) {
  const maxDist = ext1 + ext2 - MIN_OVERLAP_DEPTH;
  if (maxDist > minFloor && dist > maxDist) {
    return Math.max(maxDist, minFloor);
  }
  return Math.max(dist, minFloor);
}

function distToOutline(px, py, geom) {
  if (geom.type === 'circle') {
    return Math.abs(Math.hypot(px - geom.cx, py - geom.cy) - geom.r);
  }
  return Math.min(...geom.segs.map(([x1, y1, x2, y2]) =>
    distPointToSegment(px, py, x1, y1, x2, y2),
  ));
}

function minDistToAllOutlines(px, py, geoms) {
  return Math.min(...geoms.map(g => distToOutline(px, py, g)));
}

/** Returns true if the point is strictly inside the given geometry. */
function isPointInsideShape(px, py, geom) {
  if (geom.type === 'circle') {
    return Math.hypot(px - geom.cx, py - geom.cy) < geom.r;
  }
  // Ray-casting for polygons
  let inside = false;
  for (const [x1, y1, x2, y2] of geom.segs) {
    if ((y1 > py) !== (y2 > py)) {
      const xIntersect = x1 + ((py - y1) * (x2 - x1)) / (y2 - y1);
      if (px < xIntersect) inside = !inside;
    }
  }
  return inside;
}

/**
 * Parses a region key to derive which sets the label must be inside vs outside.
 * This is the source of truth for region membership — NOT the hint position.
 * Handles keys like 'set1_only', 'set1_set2', 'all_three', 'outside', etc.
 */
function parseRegionKey(regionKey, allSetIds) {
  if (regionKey === 'outside') return { insideIds: [], outsideIds: allSetIds };
  const mentioned = allSetIds.filter(id => {
    const re = new RegExp(`(?:^|_)${id}(?:_|$)`);
    return re.test(regionKey);
  });
  if (mentioned.length === 0) return { insideIds: allSetIds, outsideIds: [] };
  return { insideIds: mentioned, outsideIds: allSetIds.filter(id => !mentioned.includes(id)) };
}

// ---------------------------------------------------------------------------
// Auto-layout engine — infers topology from region keys and computes
// positions dynamically for ANY shape combination.
// ---------------------------------------------------------------------------

/**
 * Analyzes region keys to build a topology graph describing which sets
 * overlap and which are nested.
 */
function inferTopology(allSetIds, regions) {
  const n = allSetIds.length;
  const idToIdx = Object.fromEntries(allSetIds.map((id, i) => [id, i]));

  // overlaps[i][j] = true if sets i and j co-appear in any region
  const overlaps = Array.from({ length: n }, () => Array(n).fill(false));
  // nested[i][j] = true if every region mentioning j also mentions i,
  //                AND at least one region mentions i without j
  const mentionSets = Array.from({ length: n }, () => []);

  const regionKeys = Object.keys(regions).filter(k => k !== 'outside');
  for (const rk of regionKeys) {
    const { insideIds } = parseRegionKey(rk, allSetIds);
    // Record overlap pairs
    for (let a = 0; a < insideIds.length; a++) {
      for (let b = a + 1; b < insideIds.length; b++) {
        const ai = idToIdx[insideIds[a]];
        const bi = idToIdx[insideIds[b]];
        overlaps[ai][bi] = true;
        overlaps[bi][ai] = true;
      }
    }
    // Record which regions mention each set
    for (const id of insideIds) {
      mentionSets[idToIdx[id]].push(rk);
    }
  }

  // Build nesting matrix
  const nested = Array.from({ length: n }, () => Array(n).fill(false));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      // Check if every region mentioning j also mentions i
      const regionsWithJ = regionKeys.filter(rk => {
        const { insideIds } = parseRegionKey(rk, allSetIds);
        return insideIds.includes(allSetIds[j]);
      });
      const regionsWithI = regionKeys.filter(rk => {
        const { insideIds } = parseRegionKey(rk, allSetIds);
        return insideIds.includes(allSetIds[i]);
      });
      if (regionsWithJ.length > 0) {
        const allJhaveI = regionsWithJ.every(rk => {
          const { insideIds } = parseRegionKey(rk, allSetIds);
          return insideIds.includes(allSetIds[i]);
        });
        const someIwithoutJ = regionsWithI.some(rk => {
          const { insideIds } = parseRegionKey(rk, allSetIds);
          return !insideIds.includes(allSetIds[j]);
        });
        if (allJhaveI && someIwithoutJ) {
          nested[i][j] = true;
        }
      }
    }
  }

  return { allSetIds, overlaps, nested, nSets: n, idToIdx, regions };
}

/**
 * Helper: find a nesting chain (longest sequence where each set contains
 * the next). Returns array of indices or null.
 */
function findNestingChain(topology) {
  const { nested, nSets } = topology;
  // Find roots (sets not nested inside anything)
  const isInner = Array(nSets).fill(false);
  for (let i = 0; i < nSets; i++) {
    for (let j = 0; j < nSets; j++) {
      if (nested[j][i]) { isInner[i] = true; break; }
    }
  }

  let bestChain = [];
  for (let root = 0; root < nSets; root++) {
    if (isInner[root]) continue;
    // Check if this root has any nested children
    const chain = [root];
    let current = root;
    while (true) {
      let next = -1;
      for (let j = 0; j < nSets; j++) {
        if (nested[current][j]) { next = j; break; }
      }
      if (next === -1) break;
      chain.push(next);
      current = next;
    }
    if (chain.length > bestChain.length) bestChain = chain;
  }
  return bestChain.length >= 2 ? bestChain : null;
}

/**
 * Helper: find a linear chain of overlapping sets (A-B-C where A∩B and B∩C
 * exist but NOT A∩C). Returns array of indices or null.
 */
function findLinearChain(topology, overlapPairs) {
  const { nSets, overlaps } = topology;
  // Build adjacency degree
  const degree = Array(nSets).fill(0);
  for (const [a, b] of overlapPairs) { degree[a]++; degree[b]++; }

  // Find endpoints (degree 1)
  const endpoints = [];
  for (let i = 0; i < nSets; i++) {
    if (degree[i] === 1) endpoints.push(i);
  }
  if (endpoints.length < 2) return null;

  // Try to walk from each endpoint
  for (const start of endpoints) {
    const chain = [start];
    const visited = new Set([start]);
    let current = start;
    while (true) {
      let next = -1;
      for (let j = 0; j < nSets; j++) {
        if (!visited.has(j) && overlaps[current][j]) { next = j; break; }
      }
      if (next === -1) break;
      chain.push(next);
      visited.add(next);
      current = next;
    }
    if (chain.length === nSets) return chain;
  }
  return null;
}

/**
 * Helper: find a hub set that overlaps all others while others don't
 * overlap each other. Returns hub index or -1.
 */
function findHub(topology) {
  const { nSets, overlaps } = topology;
  for (let h = 0; h < nSets; h++) {
    let isHub = true;
    for (let j = 0; j < nSets; j++) {
      if (j === h && !overlaps[h][j]) continue;
      if (j !== h && !overlaps[h][j]) { isHub = false; break; }
    }
    if (!isHub) continue;
    // Check that non-hub sets don't overlap each other
    let othersClean = true;
    for (let a = 0; a < nSets; a++) {
      if (a === h) continue;
      for (let b = a + 1; b < nSets; b++) {
        if (b === h) continue;
        if (overlaps[a][b]) { othersClean = false; break; }
      }
      if (!othersClean) break;
    }
    if (othersClean) return h;
  }
  return -1;
}

/**
 * Helper: find the apex of a V-overlap (one set overlapping two others that
 * don't overlap each other). Returns apex index or -1.
 */
function findVApex(topology, overlapPairs) {
  const { nSets } = topology;
  if (nSets !== 3 || overlapPairs.length !== 2) return -1;
  // The apex is the set that appears in both pairs
  const counts = Array(nSets).fill(0);
  for (const [a, b] of overlapPairs) { counts[a]++; counts[b]++; }
  for (let i = 0; i < nSets; i++) {
    if (counts[i] === 2) return i;
  }
  return -1;
}

/**
 * Helper: detect two separate overlapping pairs (4 sets, 2 overlap pairs,
 * each pair shares no sets). Returns { pair1: [a, b], pair2: [c, d] } or null.
 */
function findTwoPairs(topology, overlapPairs) {
  if (topology.nSets !== 4 || overlapPairs.length !== 2) return null;
  const [p1, p2] = overlapPairs;
  const shared = p1.some(x => p2.includes(x));
  if (shared) return null;
  return { pair1: p1, pair2: p2 };
}

/**
 * Classifies a topology into a placement strategy.
 */
function classifyTopology(topology) {
  const { nSets, overlaps } = topology;
  // Collect overlap pairs
  const overlapPairs = [];
  for (let i = 0; i < nSets; i++) {
    for (let j = i + 1; j < nSets; j++) {
      if (overlaps[i][j]) overlapPairs.push([i, j]);
    }
  }

  // No overlaps at all — separate or nested
  if (overlapPairs.length === 0) {
    const chain = findNestingChain(topology);
    if (chain && chain.length === nSets) return { strategy: 'nested', params: { chain } };
    if (chain) {
      const chainSet = new Set(chain);
      const separate = [];
      for (let i = 0; i < nSets; i++) { if (!chainSet.has(i)) separate.push(i); }
      return { strategy: 'nested_and_separate', params: { chain, separate } };
    }
    return { strategy: 'separate', params: {} };
  }

  // All possible pairs overlap
  const maxPairs = (nSets * (nSets - 1)) / 2;
  if (overlapPairs.length === maxPairs && nSets >= 2) {
    return { strategy: 'full_overlap', params: {} };
  }

  // Two pairs pattern (4 sets)
  const twoPairs = findTwoPairs(topology, overlapPairs);
  if (twoPairs) return { strategy: 'two_pairs', params: twoPairs };

  // V-overlap pattern (3 sets, 2 pairs)
  const vApex = findVApex(topology, overlapPairs);
  if (vApex >= 0) return { strategy: 'v_overlap', params: { apexIdx: vApex } };

  // Hub pattern
  const hubIdx = findHub(topology);
  if (hubIdx >= 0) return { strategy: 'hub', params: { hubIdx } };

  // Linear chain
  const chain = findLinearChain(topology, overlapPairs);
  if (chain) return { strategy: 'linear_chain', params: { chain } };

  // Pair + separate sets
  if (overlapPairs.length === 1) {
    const pairSet = new Set(overlapPairs[0]);
    const separate = [];
    for (let i = 0; i < nSets; i++) { if (!pairSet.has(i)) separate.push(i); }
    if (separate.length > 0) {
      return { strategy: 'pair_and_separate', params: { pair: overlapPairs[0], separate } };
    }
  }

  // Nesting chain with separate overlap sets
  const nestChain = findNestingChain(topology);
  if (nestChain) {
    const chainSet = new Set(nestChain);
    const separate = [];
    for (let i = 0; i < nSets; i++) { if (!chainSet.has(i)) separate.push(i); }
    if (separate.length > 0) {
      // Only use this strategy if the separate sets have no overlaps of their own.
      // If they do (e.g. a container diagram where sub-sets overlap each other),
      // fall through to the container/general strategies instead.
      const separateHaveOverlaps = separate.some(i =>
        Array.from({ length: nSets }, (_, j) => j).some(j => j !== i && overlaps[i][j])
      );
      if (!separateHaveOverlaps) {
        return { strategy: 'nested_and_separate', params: { chain: nestChain, separate } };
      }
    }
  }

  // Container pattern: one set appears in the vast majority of region keys
  // (typical for 5-6 set diagrams where a large shape contains smaller ones)
  if (nSets >= 4) {
    const regionKeys = Object.keys(topology.regions || {}).filter(k => k !== 'outside');
    const appearances = Array(nSets).fill(0);
    for (const key of regionKeys) {
      const { insideIds } = parseRegionKey(key, topology.allSetIds);
      for (const id of insideIds) {
        const idx = topology.idToIdx[id];
        if (idx !== undefined) appearances[idx]++;
      }
    }
    const maxApp = Math.max(...appearances);
    const containerIdx = appearances.indexOf(maxApp);
    if (maxApp >= regionKeys.length * 0.5 && containerIdx >= 0) {
      return { strategy: 'container', params: { containerIdx } };
    }
  }

  return { strategy: 'general', params: {} };
}

/**
 * Universal hint generator — works for ANY topology without layout-specific
 * knowledge. Produces a hint position for each region key.
 */
function generateRegionHints(layoutSets, allSetIds, regions) {
  const centerById = Object.fromEntries(layoutSets.map(s => [s.id, { x: s.cx, y: s.cy }]));
  const hints = {};

  for (const regionKey of Object.keys(regions)) {
    if (regionKey === 'outside') {
      hints[regionKey] = { x: 8, y: 16 };
      continue;
    }

    const { insideIds, outsideIds } = parseRegionKey(regionKey, allSetIds);

    if (insideIds.length === 0) {
      hints[regionKey] = { x: 8, y: 16 };
      continue;
    }

    // Centroid of participating set centres
    const cx = insideIds.reduce((s, id) => s + (centerById[id]?.x || 0), 0) / insideIds.length;
    const cy = insideIds.reduce((s, id) => s + (centerById[id]?.y || 0), 0) / insideIds.length;

    if (outsideIds.length > 0 && insideIds.length === 1) {
      // "Only" region — push hint away from the centroid of outside sets
      const ox = outsideIds.reduce((s, id) => s + (centerById[id]?.x || 0), 0) / outsideIds.length;
      const oy = outsideIds.reduce((s, id) => s + (centerById[id]?.y || 0), 0) / outsideIds.length;
      const dx = cx - ox;
      const dy = cy - oy;
      const len = Math.hypot(dx, dy) || 1;
      hints[regionKey] = { x: cx + (dx / len) * 20, y: cy + (dy / len) * 20 };
    } else {
      hints[regionKey] = { x: cx, y: cy };
    }
  }

  return hints;
}

// --- Auto-placement functions ---

/**
 * Separate sets in a row with gaps.
 */
function autoPlaceSeparate(ids, shapes, r) {
  const result = [];
  let x = 0;
  for (let i = 0; i < ids.length; i++) {
    const ext = rayExtentFromCenter(shapes[i], r, 0);
    if (i === 0) {
      x = ext;
    } else {
      const prevExt = rayExtentFromCenter(shapes[i - 1], r, 0);
      x += prevExt + ext + 18;
    }
    result.push({ id: ids[i], cx: x, cy: 0, w: r * 2, h: r * 2 });
  }
  return result;
}

/**
 * Concentric/nested sets — each inner level at ~60% of parent.
 */
function autoPlaceNested(ids, _shapes, chain, outerR) {
  const result = [];
  let currentR = outerR;
  for (let i = 0; i < chain.length; i++) {
    const idx = chain[i];
    result.push({ id: ids[idx], cx: 0, cy: 0, w: currentR * 2, h: currentR * 2 });
    currentR = currentR * 0.6;
  }
  return result;
}

/**
 * Nested group + separate sets to the right.
 */
function autoPlaceNestedAndSeparate(ids, shapes, chain, separate, r) {
  const nested = autoPlaceNested(ids, shapes, chain, r);
  const outerR = r;
  let rightEdge = outerR + 20;

  const result = [...nested];
  for (const idx of separate) {
    const ext = rayExtentFromCenter(shapes[idx], r * 0.85, 0);
    rightEdge += ext;
    result.push({ id: ids[idx], cx: rightEdge, cy: 0, w: r * 1.7, h: r * 1.7 });
    rightEdge += ext + 18;
  }
  return result;
}

/**
 * Overlapping pair + separate sets to the right.
 */
function autoPlacePairAndSeparate(ids, shapes, pair, separate, r) {
  const [a, b] = pair;
  const OVERLAP_PX = 55;
  const angle = 0;
  const ext1 = rayExtentFromCenter(shapes[a], r, angle);
  const ext2 = rayExtentFromCenter(shapes[b], r, angle + Math.PI);
  const dist = clampDistForOverlap(Math.max(ext1 + ext2 - OVERLAP_PX, r * 0.5), ext1, ext2, r * 0.4);

  const result = [
    { id: ids[a], cx: 0, cy: 0, w: r * 2, h: r * 2 },
    { id: ids[b], cx: dist, cy: 0, w: r * 2, h: r * 2 },
  ];

  let rightEdge = dist + r + 20;
  for (const idx of separate) {
    const ext = rayExtentFromCenter(shapes[idx], r, 0);
    rightEdge += ext;
    result.push({ id: ids[idx], cx: rightEdge, cy: 0, w: r * 2, h: r * 2 });
    rightEdge += ext + 18;
  }
  return result;
}

/**
 * Sets in a row; overlapping adjacent pairs use clampDistForOverlap,
 * non-overlapping get gaps.
 */
function autoPlaceLinearChain(ids, shapes, chain, regions, r) {
  const OVERLAP_PX = 45;
  const GAP_PX = 18;
  const result = [];
  let x = 0;

  for (let i = 0; i < chain.length; i++) {
    const idx = chain[i];
    if (i === 0) {
      result.push({ id: ids[idx], cx: 0, cy: 0, w: r * 2, h: r * 2 });
    } else {
      const prevIdx = chain[i - 1];
      const ext1 = shapeExtentAtCenter(shapes[prevIdx], r);
      const ext2 = shapeExtentAtCenter(shapes[idx], r);

      // Check if these two adjacent sets overlap by scanning region keys
      const id1 = ids[prevIdx];
      const id2 = ids[idx];
      const hasOverlap = Object.keys(regions).some(rk => {
        if (rk === 'outside') return false;
        const parts = rk.split('_only')[0].split('_');
        return parts.includes(id1.replace('set', 'set')) &&
               rk.includes(id1) && rk.includes(id2) && !rk.endsWith('_only');
      });

      const dist = hasOverlap
        ? clampDistForOverlap(ext1 + ext2 - OVERLAP_PX, ext1, ext2, r * 0.4)
        : ext1 + ext2 + GAP_PX;

      x = result[result.length - 1].cx + dist;
      result.push({ id: ids[idx], cx: x, cy: 0, w: r * 2, h: r * 2 });
    }
  }
  return result;
}

/**
 * Hub in centre, satellites evenly around it at angular positions.
 */
function autoPlaceHub(ids, shapes, hubIdx, r) {
  const OVERLAP_PX = 48;
  const result = [];
  result.push({ id: ids[hubIdx], cx: 0, cy: 0, w: r * 2, h: r * 2 });

  const satellites = [];
  for (let i = 0; i < ids.length; i++) {
    if (i !== hubIdx) satellites.push(i);
  }

  const nSat = satellites.length;
  for (let si = 0; si < nSat; si++) {
    const angle = (si * 2 * Math.PI) / nSat - Math.PI / 2;
    const idx = satellites[si];
    const ext1 = rayExtentFromCenter(shapes[hubIdx], r, angle);
    const ext2 = rayExtentFromCenter(shapes[idx], r, angle + Math.PI);
    const dist = clampDistForOverlap(Math.max(ext1 + ext2 - OVERLAP_PX, r * 0.5), ext1, ext2, r * 0.4);
    result.push({
      id: ids[idx],
      cx: dist * Math.cos(angle),
      cy: dist * Math.sin(angle),
      w: r * 2,
      h: r * 2,
    });
  }
  return result;
}

/**
 * Full overlap — trilateration for 3 sets, polygon arrangement for 4+.
 */
function autoPlaceFullOverlap(ids, shapes, r) {
  const n = ids.length;
  const OVERLAP_PX = 55;

  if (n === 2) {
    const ext1 = rayExtentFromCenter(shapes[0], r, 0);
    const ext2 = rayExtentFromCenter(shapes[1], r, Math.PI);
    const dist = clampDistForOverlap(Math.max(ext1 + ext2 - OVERLAP_PX, r * 0.5), ext1, ext2, r * 0.4);
    return [
      { id: ids[0], cx: 0, cy: 0, w: r * 2, h: r * 2 },
      { id: ids[1], cx: dist, cy: 0, w: r * 2, h: r * 2 },
    ];
  }

  if (n === 3) {
    // Trilateration (same as computeThreeAllOverlapLayout)
    const toRad = deg => (deg * Math.PI) / 180;
    const a12 = toRad(120), a21 = toRad(300);
    const a13 = toRad(60), a31 = toRad(240);

    const span12 = rayExtentFromCenter(shapes[0], r, a12) + rayExtentFromCenter(shapes[1], r, a21);
    const span13 = rayExtentFromCenter(shapes[0], r, a13) + rayExtentFromCenter(shapes[2], r, a31);
    const span23 = rayExtentFromCenter(shapes[1], r, toRad(0)) + rayExtentFromCenter(shapes[2], r, toRad(180));

    const d12 = clampDistForOverlap(span12 - OVERLAP_PX, rayExtentFromCenter(shapes[0], r, a12), rayExtentFromCenter(shapes[1], r, a21), r * 0.4);
    const d13 = clampDistForOverlap(span13 - OVERLAP_PX, rayExtentFromCenter(shapes[0], r, a13), rayExtentFromCenter(shapes[2], r, a31), r * 0.4);
    const d23 = clampDistForOverlap(span23 - OVERLAP_PX, rayExtentFromCenter(shapes[1], r, toRad(0)), rayExtentFromCenter(shapes[2], r, toRad(180)), r * 0.4);

    // Fix set2 at origin, set3 at (d23, 0), solve for set1
    const x1 = (d12 * d12 - d13 * d13 + d23 * d23) / (2 * d23);
    const y1 = -Math.sqrt(Math.max(0, d12 * d12 - x1 * x1));

    return [
      { id: ids[0], cx: x1, cy: y1, w: r * 2, h: r * 2 },
      { id: ids[1], cx: 0, cy: 0, w: r * 2, h: r * 2 },
      { id: ids[2], cx: d23, cy: 0, w: r * 2, h: r * 2 },
    ];
  }

  // 4+ sets — arrange in a polygon with reduced radius so all overlap
  const polyR = r * 0.6;
  return ids.map((id, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return {
      id,
      cx: polyR * Math.cos(angle),
      cy: polyR * Math.sin(angle),
      w: r * 2,
      h: r * 2,
    };
  });
}

/**
 * V-overlap: two top sets with gap, apex below centre.
 */
function autoPlaceVOverlap(ids, shapes, apexIdx, r) {
  const GAP_PX = 10;
  const OVERLAP_PX = 35;
  const others = [];
  for (let i = 0; i < ids.length; i++) {
    if (i !== apexIdx) others.push(i);
  }

  const [left, right] = others;
  const extLR = rayExtentFromCenter(shapes[left], r, 0);
  const extRL = rayExtentFromCenter(shapes[right], r, Math.PI);
  const horizDist = extLR + extRL + GAP_PX;

  const cxLeft = 0;
  const cxRight = horizDist;
  const cyTop = 0;
  const cxApex = horizDist / 2;

  // Compute vertical distance for overlap with apex
  const extDown = rayExtentFromCenter(shapes[left], r, Math.PI / 2);
  const extUp = rayExtentFromCenter(shapes[apexIdx], r, -Math.PI / 2);
  let vertDist = extDown + extUp - OVERLAP_PX;
  vertDist = Math.max(vertDist, 35);

  return [
    { id: ids[left], cx: cxLeft, cy: cyTop, w: r * 2, h: r * 2 },
    { id: ids[right], cx: cxRight, cy: cyTop, w: r * 2, h: r * 2 },
    { id: ids[apexIdx], cx: cxApex, cy: cyTop + vertDist, w: r * 2, h: r * 2 },
  ];
}

/**
 * Two overlapping pairs side by side with a gap.
 */
function autoPlaceTwoPairs(ids, shapes, params, r) {
  const OVERLAP_PX = 42;
  const PAIR_GAP = 35;
  const { pair1, pair2 } = params;

  const [a, b] = pair1;
  const ext1R = rayExtentFromCenter(shapes[a], r, 0);
  const ext2L = rayExtentFromCenter(shapes[b], r, Math.PI);
  const dist1 = clampDistForOverlap(Math.max(ext1R + ext2L - OVERLAP_PX, r * 0.4), ext1R, ext2L, r * 0.4);

  const [c, d] = pair2;
  const ext3R = rayExtentFromCenter(shapes[c], r, 0);
  const ext4L = rayExtentFromCenter(shapes[d], r, Math.PI);
  const dist2 = clampDistForOverlap(Math.max(ext3R + ext4L - OVERLAP_PX, r * 0.4), ext3R, ext4L, r * 0.4);

  const extBR = rayExtentFromCenter(shapes[b], r, 0);
  const extCL = rayExtentFromCenter(shapes[c], r, Math.PI);
  const pairOffset = dist1 + extBR + extCL + PAIR_GAP;

  return [
    { id: ids[a], cx: 0, cy: 0, w: r * 2, h: r * 2 },
    { id: ids[b], cx: dist1, cy: 0, w: r * 2, h: r * 2 },
    { id: ids[c], cx: pairOffset, cy: 0, w: r * 2, h: r * 2 },
    { id: ids[d], cx: pairOffset + dist2, cy: 0, w: r * 2, h: r * 2 },
  ];
}

/**
 * Force-directed fallback for complex/unclassified topologies.
 * 50 iterations of spring-based relaxation.
 */
/**
 * Container layout: one dominant set (large shape) with smaller sets inside/around it.
 * Used for 5-6 set diagrams where one set appears in most region keys.
 */
function autoPlaceContainer(ids, shapes, topology, containerIdx, r) {
  const n = ids.length;
  const { overlaps, allSetIds, regions } = topology;

  // Use a generous base — container layouts need more space
  const baseR = Math.max(r, 55);
  const containerW = baseR * 6;
  const containerH = baseR * 2.8;
  const innerR = baseR * 1.1;

  const regionKeys = Object.keys(regions).filter(k => k !== 'outside');

  // Categorize: "straddles" (has _only region AND overlaps container = at edge),
  // "inside" (overlaps container but NO _only = fully contained),
  // "outside" (no overlap with container)
  const straddleSets = [];
  const insideSets = [];
  const outsideSets = [];

  for (let i = 0; i < n; i++) {
    if (i === containerIdx) continue;
    const hasOnly = regionKeys.some(k => {
      const { insideIds } = parseRegionKey(k, allSetIds);
      return insideIds.length === 1 && insideIds[0] === allSetIds[i];
    });
    if (overlaps[containerIdx][i]) {
      if (hasOnly) straddleSets.push(i);
      else insideSets.push(i);
    } else {
      outsideSets.push(i);
    }
  }

  // Position storage indexed by set index
  const pos = {};
  const sz = {};

  // Container at origin
  pos[containerIdx] = { cx: 0, cy: 0 };
  sz[containerIdx] = { w: containerW, h: containerH };

  // Straddling sets at container edges (partly inside, partly outside)
  const edgeSlots = [
    { cx: -containerW / 2 + innerR * 0.35, cy: -containerH * 0.15 },
    { cx: containerW / 2 - innerR * 0.25, cy: 0 },
    { cx: -containerW / 2 + innerR * 0.35, cy: containerH * 0.15 },
    { cx: containerW / 2 - innerR * 0.25, cy: containerH * 0.2 },
  ];
  for (let i = 0; i < straddleSets.length; i++) {
    const slot = edgeSlots[i % edgeSlots.length];
    pos[straddleSets[i]] = { cx: slot.cx, cy: slot.cy };
    sz[straddleSets[i]] = { w: innerR * 2, h: innerR * 2 };
  }

  // Inside sets clustered near center (close enough to overlap each other)
  const startX = insideSets.length > 1 ? -innerR * 0.6 : 0;
  for (let i = 0; i < insideSets.length; i++) {
    pos[insideSets[i]] = { cx: startX + i * innerR * 1.2, cy: 0 };
    sz[insideSets[i]] = { w: innerR * 2, h: innerR * 2 };
  }

  // Force-directed refinement for all non-container sets
  const movable = [...straddleSets, ...insideSets];
  const OVERLAP_PX = 42;

  for (let iter = 0; iter < 80; iter++) {
    const forces = {};
    for (const idx of movable) forces[idx] = { fx: 0, fy: 0 };

    for (let a = 0; a < movable.length; a++) {
      for (let b = a + 1; b < movable.length; b++) {
        const si = movable[a];
        const sj = movable[b];

        const dx = pos[sj].cx - pos[si].cx;
        const dy = pos[sj].cy - pos[si].cy;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        const angle = Math.atan2(dy, dx);
        const ext1 = rayExtentFromCenter(shapes[si], innerR, angle);
        const ext2 = rayExtentFromCenter(shapes[sj], innerR, angle + Math.PI);
        const span = ext1 + ext2;

        if (overlaps[si][sj]) {
          // Overlapping pair: attract/repel to match target overlap distance
          const target = Math.max(span - OVERLAP_PX, innerR * 0.3);
          const delta = (dist - target) * 0.2;
          forces[si].fx += ux * delta;
          forces[si].fy += uy * delta;
          forces[sj].fx -= ux * delta;
          forces[sj].fy -= uy * delta;
        } else {
          // Non-overlapping pair: ONLY repel if too close (never attract)
          const minSep = span + 10;
          if (dist < minSep) {
            const delta = (dist - minSep) * 0.2;
            forces[si].fx += ux * delta;
            forces[si].fy += uy * delta;
            forces[sj].fx -= ux * delta;
            forces[sj].fy -= uy * delta;
          }
        }
      }
    }

    for (const si of movable) {
      pos[si].cx += forces[si].fx;
      pos[si].cy += forces[si].fy;

      // Inside sets: clamp to container interior
      if (insideSets.includes(si)) {
        const maxCx = containerW / 2 - innerR * 0.5;
        const maxCy = containerH / 2 - innerR * 0.5;
        pos[si].cx = Math.max(-maxCx, Math.min(maxCx, pos[si].cx));
        pos[si].cy = Math.max(-maxCy, Math.min(maxCy, pos[si].cy));
      }
      // Straddling sets: keep vertical within bounds, let horizontal find edge
      if (straddleSets.includes(si)) {
        const maxCy = containerH / 2 + innerR * 0.2;
        pos[si].cy = Math.max(-maxCy, Math.min(maxCy, pos[si].cy));
      }
    }
  }

  // Outside sets to the right
  let outsideCx = containerW / 2 + innerR + 20;
  for (const idx of outsideSets) {
    pos[idx] = { cx: outsideCx, cy: 0 };
    sz[idx] = { w: innerR * 2, h: innerR * 2 };
    outsideCx += innerR * 2 + 15;
  }

  return ids.map((id, i) => ({
    id,
    cx: pos[i].cx,
    cy: pos[i].cy,
    w: sz[i].w,
    h: sz[i].h,
  }));
}

function autoPlaceGeneral(ids, shapes, topology, r) {
  const n = ids.length;
  const { overlaps } = topology;

  // Initial placement: circle
  const positions = ids.map((id, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    const initR = r * 1.2;
    return { id, cx: initR * Math.cos(angle), cy: initR * Math.sin(angle), w: r * 2, h: r * 2 };
  });

  const TARGET_OVERLAP = 50;
  const TARGET_SEPARATE = r * 2.5;

  for (let iter = 0; iter < 50; iter++) {
    const forces = positions.map(() => ({ fx: 0, fy: 0 }));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[j].cx - positions[i].cx;
        const dy = positions[j].cy - positions[i].cy;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        const ext1 = rayExtentFromCenter(shapes[i], r, Math.atan2(dy, dx));
        const ext2 = rayExtentFromCenter(shapes[j], r, Math.atan2(-dy, -dx));
        const span = ext1 + ext2;

        if (overlaps[i][j]) {
          const targetDist = Math.max(span - TARGET_OVERLAP, r * 0.3);
          const delta = (dist - targetDist) * 0.15;
          forces[i].fx += ux * delta;
          forces[i].fy += uy * delta;
          forces[j].fx -= ux * delta;
          forces[j].fy -= uy * delta;
        } else if (dist < TARGET_SEPARATE) {
          // Non-overlapping: ONLY repel if too close
          const delta = (dist - TARGET_SEPARATE) * 0.15;
          forces[i].fx += ux * delta;
          forces[i].fy += uy * delta;
          forces[j].fx -= ux * delta;
          forces[j].fy -= uy * delta;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      positions[i].cx += forces[i].fx;
      positions[i].cy += forces[i].fy;
    }
  }

  return positions;
}

/**
 * Main auto-layout entry point. Infers topology from region keys and
 * dispatches to the appropriate placement function.
 */
function computeAutoLayout(vennConfig, rBoost) {
  const sets = vennConfig.sets || [];
  const n = sets.length;
  if (n === 0) return null;

  const setIds = sets.map(s => s.id);
  const shapeTypes = sets.map(s => s.shape || 'circle');
  const regions = vennConfig.regions || {};

  const MARGIN = 20;
  const r = Math.max(40, 85 - n * 8) + rBoost;

  const topology = inferTopology(setIds, regions);
  const { strategy, params } = classifyTopology(topology);

  let placements;
  switch (strategy) {
    case 'separate':
      placements = autoPlaceSeparate(setIds, shapeTypes, r);
      break;
    case 'nested':
      placements = autoPlaceNested(setIds, shapeTypes, params.chain, r);
      break;
    case 'nested_and_separate':
      placements = autoPlaceNestedAndSeparate(setIds, shapeTypes, params.chain, params.separate, r);
      break;
    case 'pair_and_separate':
      placements = autoPlacePairAndSeparate(setIds, shapeTypes, params.pair, params.separate, r);
      break;
    case 'linear_chain':
      placements = autoPlaceLinearChain(setIds, shapeTypes, params.chain, regions, r);
      break;
    case 'hub':
      placements = autoPlaceHub(setIds, shapeTypes, params.hubIdx, r);
      break;
    case 'full_overlap':
      placements = autoPlaceFullOverlap(setIds, shapeTypes, r);
      break;
    case 'v_overlap':
      placements = autoPlaceVOverlap(setIds, shapeTypes, params.apexIdx, r);
      break;
    case 'two_pairs':
      placements = autoPlaceTwoPairs(setIds, shapeTypes, params, r);
      break;
    case 'container':
      placements = autoPlaceContainer(setIds, shapeTypes, topology, params.containerIdx, r);
      break;
    case 'general':
    default:
      placements = autoPlaceGeneral(setIds, shapeTypes, topology, r);
      break;
  }

  if (!placements || placements.length === 0) return null;

  // Normalize positions: shift so canvas starts at MARGIN
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of placements) {
    const pr = Math.max(p.w, p.h) / 2;
    minX = Math.min(minX, p.cx - pr);
    minY = Math.min(minY, p.cy - pr);
    maxX = Math.max(maxX, p.cx + pr);
    maxY = Math.max(maxY, p.cy + pr);
  }

  const shiftX = MARGIN - minX;
  const shiftY = MARGIN - minY;
  const layoutSets = placements.map(p => ({
    id: p.id,
    cx: p.cx + shiftX,
    cy: p.cy + shiftY,
    w: p.w,
    h: p.h,
  }));

  const canvasWidth = Math.ceil(maxX - minX + MARGIN * 2);
  const canvasHeight = Math.ceil(maxY - minY + MARGIN * 2);

  // Generate region hints
  const regionHints = generateRegionHints(layoutSets, setIds, regions);

  return {
    sets: layoutSets,
    regions: regionHints,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Scores a candidate label position. Returns the minimum distance from the
 * point to any shape outline or canvas edge — i.e. the radius of the largest
 * circle that fits at this point without crossing any boundary.
 * Returns -Infinity if the point is not inside the correct region.
 */
function scoreCandidate(px, py, geoms, regionCheck, canvasW, canvasH) {
  if (px < 0 || py < 0 || px > canvasW || py > canvasH) return -Infinity;
  if (!regionCheck(px, py)) return -Infinity;
  const outlineDist = minDistToAllOutlines(px, py, geoms);
  const edgeDist = Math.min(px, py, canvasW - px, canvasH - py);
  return Math.min(outlineDist, edgeDist);
}

/**
 * Finds the "pole of inaccessibility" for a region — the point that is
 * maximally distant from all shape outlines and canvas edges while remaining
 * inside the correct logical region.
 *
 * Uses a two-phase grid search:
 *  1. Coarse pass (STEP px) across the full canvas to find the global best area
 *  2. Fine pass (1 px) around the coarse winner to pinpoint the exact optimum
 *
 * The hint position (from the layout) is always evaluated as a candidate so
 * that well-placed hints are never made worse.
 */
function findPoleOfInaccessibility(hintX, hintY, geoms, regionCheck, canvasW, canvasH) {
  const ACCEPT = MIN_LABEL_CLEARANCE; // clearance threshold — stop as soon as this is met
  const STEP = 12;

  let bestX = hintX;
  let bestY = hintY;
  let bestDist = scoreCandidate(hintX, hintY, geoms, regionCheck, canvasW, canvasH);

  // Phase 0: hint is already acceptable — return immediately.
  if (bestDist >= ACCEPT) return { x: bestX, y: bestY, clearance: bestDist };

  // Phase 1: try a ring of offsets around the hint at increasing radii.
  // Covers 90 % of cases where the hint is slightly off-centre.
  const ANGLES = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4,
                  Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
  for (const r of [10, 20, 35]) {
    for (const a of ANGLES) {
      const cx = hintX + r * Math.cos(a);
      const cy = hintY + r * Math.sin(a);
      const d = scoreCandidate(cx, cy, geoms, regionCheck, canvasW, canvasH);
      if (d > bestDist) { bestDist = d; bestX = cx; bestY = cy; }
      if (bestDist >= ACCEPT) return { x: bestX, y: bestY, clearance: bestDist };
    }
  }

  // Phase 2: coarse grid scan — stop as soon as an acceptable point is found.
  for (let gx = 0; gx <= canvasW; gx += STEP) {
    for (let gy = 0; gy <= canvasH; gy += STEP) {
      const d = scoreCandidate(gx, gy, geoms, regionCheck, canvasW, canvasH);
      if (d > bestDist) { bestDist = d; bestX = gx; bestY = gy; }
      if (bestDist >= ACCEPT) return { x: bestX, y: bestY, clearance: bestDist };
    }
  }

  return { x: bestX, y: bestY, clearance: bestDist };
}

/**
 * Finds the best label position AND font size for a region.
 * For "outside" regions, uses the hint directly (convention: top-left corner).
 * For all other regions, runs the pole-of-inaccessibility grid search.
 */
function findLabelPlacement(hintX, hintY, geoms, regionCheck, canvasW, canvasH, regionKey) {
  let pos, dist;

  if (regionKey === 'outside') {
    // "Outside" labels sit in the top-left corner by UCAT convention.
    // Use a small safety search around the hint instead of a full grid scan.
    pos = { x: hintX, y: hintY };
    dist = minDistToAllOutlines(hintX, hintY, geoms);
  } else {
    const result = findPoleOfInaccessibility(hintX, hintY, geoms, regionCheck, canvasW, canvasH);
    pos = { x: result.x, y: result.y };
    dist = result.clearance;
  }

  // Minimum region clearance — if the region is too small for any readable label,
  // signal to the renderer to skip it rather than rendering on top of outlines
  const MIN_RENDER_CLEARANCE = 4;
  if (dist < MIN_RENDER_CLEARANCE && regionKey !== 'outside') {
    return { ...pos, fontSize: MIN_FONT_SIZE, tooSmall: true };
  }

  const sizes = [FONT_SIZE, FONT_SIZE - 2, FONT_SIZE - 4, MIN_FONT_SIZE];
  for (const fs of sizes) {
    const clearance = Math.max(MIN_FONT_SIZE / 2 + 2, fs / 2 + 3);
    if (dist >= clearance - 1) return { ...pos, fontSize: fs };
  }
  return { ...pos, fontSize: MIN_FONT_SIZE };
}

// ---------------------------------------------------------------------------
// Dynamic three_linear layout
// ---------------------------------------------------------------------------

/**
 * Returns the horizontal half-extent of a shape at its vertical centre.
 * Two shapes "touch" at centre-height when their cx values are exactly
 * (extA + extB) apart. Used to place shapes with a visible overlap or gap
 * regardless of shape type.
 */
function shapeExtentAtCenter(shape, r) {
  switch (shape) {
    case 'triangle':           return r * 0.5;
    case 'pentagon':           return r * Math.cos(Math.PI / 5); // ≈ 0.81r
    case 'hexagon':            return r * Math.cos(Math.PI / 6); // ≈ 0.87r
    case 'octagon':            return r;
    case 'oval':               return r;        // full width at centre
    case 'vertical_oval':      return r * 0.65;  // narrow width at centre
    case 'isosceles_triangle': return r * 0.25;  // narrow at centre
    case 'parallelogram':      return r * 1.1;   // slightly wider due to skew
    case 'star':               return r * 0.95;
    case 'trapezoid':          return r * 0.78;  // midpoint width
    default:                   return r;         // circle, square, rectangle, diamond
  }
}

/**
 * Builds a three_linear layout at runtime based on the actual shape types and
 * which intersection regions are non-empty.
 *
 * - Adjacent pairs with a non-zero intersection count are drawn overlapping.
 * - Adjacent pairs with a zero (or absent) intersection count are drawn with
 *   a visible gap so the diagram structure itself reflects the data.
 *
 * All variants share a fixed canvas width (320 px) so option thumbnails are
 * always the same size; shapes are centred within that canvas.
 */
function computeThreeLinearLayout(shapeTypes, regionCounts, rBoost = 0) {
  const r          = 65 + rBoost;
  const cy         = 80;
  const CANVAS_H   = 162;
  const OVERLAP_PX = 45; // deeper overlaps give more label space
  const GAP_PX     = 18;

  const [s1, s2, s3] = shapeTypes;
  const ext1 = shapeExtentAtCenter(s1, r);
  const ext2 = shapeExtentAtCenter(s2, r);
  const ext3 = shapeExtentAtCenter(s3, r);

  const overlap12 = regionCounts['set1_set2'] != null;
  const overlap23 = regionCounts['set2_set3'] != null;

  const dist12 = overlap12 ? clampDistForOverlap(ext1 + ext2 - OVERLAP_PX, ext1, ext2, r * 0.4) : (ext1 + ext2 + GAP_PX);
  const dist23 = overlap23 ? clampDistForOverlap(ext2 + ext3 - OVERLAP_PX, ext2, ext3, r * 0.4) : (ext2 + ext3 + GAP_PX);

  // Canvas width is derived from actual content + margins rather than a fixed
  // value, so diagrams fill the screen more effectively.
  const totalWidth = dist12 + dist23 + 2 * r;
  const MARGIN     = 20;
  const CANVAS_W   = totalWidth + MARGIN * 2;
  const cx1        = MARGIN + r;
  const cx2        = cx1 + dist12;
  const cx3        = cx2 + dist23;

  const sets = [
    { id: 'set1', cx: cx1, cy, w: r * 2, h: r * 2 },
    { id: 'set2', cx: cx2, cy, w: r * 2, h: r * 2 },
    { id: 'set3', cx: cx3, cy, w: r * 2, h: r * 2 },
  ];

  // set2_only sits at the top to avoid both overlap zones.
  const regions = {
    set1_only: { x: overlap12 ? cx1 - ext1 * 0.35 : cx1,        y: cy },
    set2_only: { x: cx2,                                          y: cy - r * 0.55 },
    set3_only: { x: overlap23 ? cx3 + ext3 * 0.35 : cx3,         y: cy },
    outside:   { x: 8,                                            y: 16 },
  };

  if (overlap12) {
    regions.set1_set2 = { x: (cx1 + cx2) / 2, y: cy - 8 };
  }
  if (overlap23) {
    // Triangle shapes are narrow at the top, so their overlap zone sits in
    // the lower portion of the shapes. Bias the label hint downward.
    const yBias = (s2 === 'triangle' || s3 === 'triangle') ? r * 0.4 : 0;
    regions.set2_set3 = { x: (cx2 + cx3) / 2, y: cy + yBias };
  }

  return { sets, regions, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H };
}

// ---------------------------------------------------------------------------
// Dynamic three_all_overlap / three_all_overlap_v2 layout
// ---------------------------------------------------------------------------

/**
 * Casts a ray from the centre of a shape (treated as centred at the origin)
 * in the direction `angle` (radians, SVG coords: 0=right, π/2=down) and
 * returns the distance from the centre to the boundary.
 * Used so we can calculate the exact overlap depth for any shape type.
 */
function rayExtentFromCenter(shape, r, angle) {
  if (shape === 'circle') return r;

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  let pts;
  if (shape === 'triangle') {
    pts = [[0, -r], [-r, r], [r, r]];
  } else if (shape === 'diamond') {
    pts = [[0, -r], [r, 0], [0, r], [-r, 0]];
  } else if (shape === 'pentagon') {
    pts = Array.from({ length: 5 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  } else if (shape === 'hexagon') {
    pts = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  } else if (shape === 'octagon') {
    pts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 8 - Math.PI / 2;
      return [r * Math.cos(a), r * Math.sin(a)];
    });
  } else if (shape === 'oval') {
    const rx = r, ry = r * 0.65;
    pts = Array.from({ length: 16 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 16;
      return [rx * Math.cos(a), ry * Math.sin(a)];
    });
  } else if (shape === 'vertical_oval') {
    const rx = r * 0.65, ry = r;
    pts = Array.from({ length: 16 }, (_, i) => {
      const a = (i * 2 * Math.PI) / 16;
      return [rx * Math.cos(a), ry * Math.sin(a)];
    });
  } else if (shape === 'isosceles_triangle') {
    pts = [[0, -r], [-r * 0.5, r], [r * 0.5, r]];
  } else if (shape === 'parallelogram') {
    const sk = r * 0.25;
    pts = [[-r * 0.85 + sk, -r * 0.6], [r * 0.85 + sk, -r * 0.6],
           [r * 0.85 - sk, r * 0.6], [-r * 0.85 - sk, r * 0.6]];
  } else if (shape === 'star') {
    const innerR = r * 0.4;
    pts = Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : innerR;
      return [rad * Math.cos(a), rad * Math.sin(a)];
    });
  } else if (shape === 'trapezoid') {
    pts = [[-r * 0.55, -r], [r * 0.55, -r], [r, r], [-r, r]];
  } else {
    // square / rectangle
    pts = [[-r, -r], [r, -r], [r, r], [-r, r]];
  }

  let minT = Infinity;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % n];
    const edx = bx - ax;
    const edy = by - ay;
    // Solve: t*(cosA, sinA) = (ax, ay) + s*(edx, edy)
    // det = sinA*edx - cosA*edy
    // t   = (ay*edx - ax*edy) / det
    // s   = (ay*cosA - ax*sinA) / det
    const det = sinA * edx - cosA * edy;
    if (Math.abs(det) < 1e-9) continue;
    const t = (ay * edx - ax * edy) / det;
    const s = (ay * cosA - ax * sinA) / det;
    if (t > 1e-9 && s >= -1e-6 && s <= 1 + 1e-6) {
      minT = Math.min(minT, t);
    }
  }
  return minT === Infinity ? r : minT;
}

/**
 * Builds a three_all_overlap (or _v2) layout at runtime based on the actual
 * shape types, guaranteeing a visible overlap for every pair.
 *
 * Strategy:
 *  - For each of the three overlapping pairs, cast rays from each shape centre
 *    in the direction toward the partner to find the combined "span".
 *  - Place centres at (span - OVERLAP_PX) apart so each pair has exactly
 *    OVERLAP_PX of geometric overlap regardless of shape type.
 *  - Use trilateration (not equilateral assumption) so all three distances are
 *    satisfied simultaneously.
 *
 * inverted=false → set1 top, set2 bottom-left, set3 bottom-right  (three_all_overlap)
 * inverted=true  → set1 bottom, set2 top-left,  set3 top-right    (three_all_overlap_v2)
 */
function computeThreeAllOverlapLayout(shapeTypes, inverted = false, rBoost = 0) {
  const r          = 75 + rBoost;
  const OVERLAP_PX = 58;
  const MARGIN     = 20;

  const [s1, s2, s3] = shapeTypes;

  // Pair directions in SVG coords (0=right, π/2=down).
  // For equilateral arrangement:
  //   non-inverted: set1→set2 = 120°, set1→set3 = 60°
  //   inverted    : set1→set2 = 240°, set1→set3 = 300°
  //   set2→set3   = 0° in both variants
  const toRad = deg => (deg * Math.PI) / 180;
  const a12 = inverted ? toRad(240) : toRad(120);
  const a21 = inverted ? toRad(60)  : toRad(300);
  const a13 = inverted ? toRad(300) : toRad(60);
  const a31 = inverted ? toRad(120) : toRad(240);

  const span12 = rayExtentFromCenter(s1, r, a12) + rayExtentFromCenter(s2, r, a21);
  const span13 = rayExtentFromCenter(s1, r, a13) + rayExtentFromCenter(s3, r, a31);
  const span23 = rayExtentFromCenter(s2, r, toRad(0)) + rayExtentFromCenter(s3, r, toRad(180));

  const d12 = clampDistForOverlap(span12 - OVERLAP_PX, rayExtentFromCenter(s1, r, a12), rayExtentFromCenter(s2, r, a21), r * 0.4);
  const d13 = clampDistForOverlap(span13 - OVERLAP_PX, rayExtentFromCenter(s1, r, a13), rayExtentFromCenter(s3, r, a31), r * 0.4);
  const d23 = clampDistForOverlap(span23 - OVERLAP_PX, rayExtentFromCenter(s2, r, toRad(0)), rayExtentFromCenter(s3, r, toRad(180)), r * 0.4);

  // Trilaterate: fix set2 at origin, set3 at (d23, 0), solve for set1.
  //   d12² = x1² + y1²
  //   d13² = (x1 - d23)² + y1²
  //   → x1 = (d12² - d13² + d23²) / (2·d23)
  //   → y1 = sqrt(d12² - x1²)
  const x1loc = (d12 * d12 - d13 * d13 + d23 * d23) / (2 * d23);
  const y1abs = Math.sqrt(Math.max(0, d12 * d12 - x1loc * x1loc));

  // Convert to absolute SVG positions.
  // non-inverted: set2/set3 are at the BOTTOM (larger y), set1 is above.
  // inverted    : set2/set3 are at the TOP    (smaller y), set1 is below.
  const cx2 = MARGIN + r;
  const cy23 = inverted ? MARGIN + r : MARGIN + r + y1abs;

  const cx_2 = cx2;
  const cy_2 = cy23;
  const cx_3 = cx2 + d23;
  const cy_3 = cy23;
  const cx_1 = cx2 + x1loc;
  const cy_1 = inverted ? cy23 + y1abs : cy23 - y1abs;

  const canvasW = Math.ceil(Math.max(cx_1, cx_2, cx_3) + r + MARGIN);
  const canvasH = Math.ceil(Math.max(cy_1, cy_2, cy_3) + r + MARGIN);

  const sets = [
    { id: 'set1', cx: cx_1, cy: cy_1, w: r * 2, h: r * 2 },
    { id: 'set2', cx: cx_2, cy: cy_2, w: r * 2, h: r * 2 },
    { id: 'set3', cx: cx_3, cy: cy_3, w: r * 2, h: r * 2 },
  ];

  // Region hint positions: push each "only" hint away from the centroid so it
  // lands clearly inside one shape and outside the other two.
  const mx = (cx_1 + cx_2 + cx_3) / 3;
  const my = (cy_1 + cy_2 + cy_3) / 3;

  const regions = {
    set1_only: { x: cx_1 + (cx_1 - mx) * 0.5, y: cy_1 + (cy_1 - my) * 0.5 },
    set2_only: { x: cx_2 + (cx_2 - mx) * 0.5, y: cy_2 + (cy_2 - my) * 0.5 },
    set3_only: { x: cx_3 + (cx_3 - mx) * 0.5, y: cy_3 + (cy_3 - my) * 0.5 },
    set1_set2: { x: (cx_1 + cx_2) / 2,         y: (cy_1 + cy_2) / 2         },
    set1_set3: { x: (cx_1 + cx_3) / 2,         y: (cy_1 + cy_3) / 2         },
    set2_set3: { x: (cx_2 + cx_3) / 2,         y: (cy_2 + cy_3) / 2         },
    all_three: { x: mx,                         y: my                         },
    outside:   { x: 8,                          y: 16                         },
  };

  return { sets, regions, canvasWidth: canvasW, canvasHeight: canvasH };
}

// ---------------------------------------------------------------------------
// Dynamic two_overlap / two_overlap_staggered layout
// ---------------------------------------------------------------------------

/**
 * Builds a two_overlap (or staggered) layout at runtime based on the actual
 * shape types, guaranteeing a visible overlap regardless of shape geometry.
 *
 * Static layouts use fixed centre-to-centre distances that work for circles
 * but produce paper-thin overlaps for triangles, diamonds, etc.  This function
 * casts rays from each shape toward the other to measure the true span, then
 * positions the centres so the overlap is at least OVERLAP_PX deep.
 *
 * staggered=false → both shapes at the same y (horizontal)
 * staggered=true  → set1 upper-left, set2 lower-right (diagonal)
 */
function computeTwoOverlapLayout(shapeTypes, staggered = false, rBoost = 0) {
  const r          = 75 + rBoost;
  const OVERLAP_PX = 55;
  const MARGIN     = 20;

  const [s1, s2] = shapeTypes;

  // Direction from set1 toward set2
  const angle = staggered ? Math.PI / 6 : 0; // 30° for staggered, 0° for horizontal
  const ext1 = rayExtentFromCenter(s1, r, angle);
  const ext2 = rayExtentFromCenter(s2, r, angle + Math.PI);
  const span = ext1 + ext2;
  const dist = clampDistForOverlap(Math.max(span - OVERLAP_PX, r * 0.5), ext1, ext2, r * 0.4);

  const cx1 = MARGIN + r;
  const cy1 = MARGIN + r;
  const cx2 = cx1 + dist * Math.cos(angle);
  const cy2 = cy1 + dist * Math.sin(angle);

  const canvasW = Math.ceil(Math.max(cx1 + r, cx2 + r) + MARGIN);
  const canvasH = Math.ceil(Math.max(cy1 + r, cy2 + r) + MARGIN);

  // Region hint positions — push "only" hints away from the overlap midpoint
  const mx = (cx1 + cx2) / 2;
  const my = (cy1 + cy2) / 2;

  const regions = {
    set1_only: { x: cx1 + (cx1 - mx) * 0.6, y: cy1 + (cy1 - my) * 0.6 },
    set2_only: { x: cx2 + (cx2 - mx) * 0.6, y: cy2 + (cy2 - my) * 0.6 },
    set1_set2: { x: mx, y: my },
    outside:   { x: 8, y: 16 },
  };

  return {
    sets: [
      { id: 'set1', cx: cx1, cy: cy1, w: r * 2, h: r * 2 },
      { id: 'set2', cx: cx2, cy: cy2, w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Dynamic two_vertical_overlap layout
// ---------------------------------------------------------------------------

/**
 * Builds a two_vertical_overlap layout: two shapes stacked vertically with
 * overlap. Taller than wide — good for mobile screens.
 */
function computeTwoVerticalOverlapLayout(shapeTypes, rBoost = 0) {
  const r          = 75 + rBoost;
  const OVERLAP_PX = 55;
  const MARGIN     = 20;

  const [s1, s2] = shapeTypes;

  const ext1 = rayExtentFromCenter(s1, r, Math.PI / 2);
  const ext2 = rayExtentFromCenter(s2, r, -Math.PI / 2);
  const span = ext1 + ext2;
  const dist = clampDistForOverlap(Math.max(span - OVERLAP_PX, r * 0.5), ext1, ext2, r * 0.4);

  const cx  = MARGIN + r;
  const cy1 = MARGIN + r;
  const cy2 = cy1 + dist;

  const canvasW = Math.ceil(cx + r + MARGIN);
  const canvasH = Math.ceil(cy2 + r + MARGIN);

  const my = (cy1 + cy2) / 2;

  const regions = {
    set1_only: { x: cx, y: cy1 - (my - cy1) * 0.4 },
    set2_only: { x: cx, y: cy2 + (cy2 - my) * 0.4 },
    set1_set2: { x: cx, y: my },
    outside:   { x: 8,  y: 16 },
  };

  return {
    sets: [
      { id: 'set1', cx, cy: cy1, w: r * 2, h: r * 2 },
      { id: 'set2', cx, cy: cy2, w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Dynamic three_vertical_chain layout
// ---------------------------------------------------------------------------

/**
 * Builds a three_vertical_chain layout: three shapes stacked vertically.
 * Adjacent pairs overlap if their intersection region has a non-zero count;
 * otherwise a gap is drawn. Tall and narrow.
 *
 * Region keys: set1_only, set2_only, set3_only, set1_set2*, set2_set3*, outside
 * (* = only if overlapping)
 */
function computeThreeVerticalChainLayout(shapeTypes, regionCounts, rBoost = 0) {
  const r          = 60 + rBoost;
  const OVERLAP_PX = 45;
  const GAP_PX     = 15;
  const MARGIN     = 20;

  const [s1, s2, s3] = shapeTypes;

  const overlap12 = regionCounts['set1_set2'] != null;
  const overlap23 = regionCounts['set2_set3'] != null;

  const ext1d = rayExtentFromCenter(s1, r, Math.PI / 2);
  const ext2u = rayExtentFromCenter(s2, r, -Math.PI / 2);
  const ext2d = rayExtentFromCenter(s2, r, Math.PI / 2);
  const ext3u = rayExtentFromCenter(s3, r, -Math.PI / 2);

  const dist12 = overlap12 ? clampDistForOverlap(ext1d + ext2u - OVERLAP_PX, ext1d, ext2u, r * 0.3) : (ext1d + ext2u + GAP_PX);
  const dist23 = overlap23 ? clampDistForOverlap(ext2d + ext3u - OVERLAP_PX, ext2d, ext3u, r * 0.3) : (ext2d + ext3u + GAP_PX);

  const cx  = MARGIN + r;
  const cy1 = MARGIN + r;
  const cy2 = cy1 + dist12;
  const cy3 = cy2 + dist23;

  const canvasW = Math.ceil(cx + r + MARGIN);
  const canvasH = Math.ceil(cy3 + r + MARGIN);

  const regions = {
    set1_only: { x: cx, y: cy1 - r * 0.4 },
    set2_only: { x: cx + r * 0.5, y: cy2 },
    set3_only: { x: cx, y: cy3 + r * 0.4 },
    outside:   { x: 8,  y: 16 },
  };

  if (overlap12) regions.set1_set2 = { x: cx, y: (cy1 + cy2) / 2 };
  if (overlap23) regions.set2_set3 = { x: cx, y: (cy2 + cy3) / 2 };

  return {
    sets: [
      { id: 'set1', cx, cy: cy1, w: r * 2, h: r * 2 },
      { id: 'set2', cx, cy: cy2, w: r * 2, h: r * 2 },
      { id: 'set3', cx, cy: cy3, w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Dynamic four_linear layout
// ---------------------------------------------------------------------------

/**
 * Builds a four_linear layout: four shapes in a horizontal row.
 * Adjacent pairs (1-2, 2-3, 3-4) overlap if their intersection region has a
 * non-zero count; otherwise a gap is drawn. Extension of three_linear.
 *
 * Region keys: set1_only, set2_only, set3_only, set4_only,
 *              set1_set2*, set2_set3*, set3_set4*, outside
 * (* = only if overlapping)
 */
function computeFourLinearLayout(shapeTypes, regionCounts, rBoost = 0) {
  const r          = 50 + rBoost;
  const cy         = 72;
  const CANVAS_H   = 146;
  const OVERLAP_PX = 38;
  const GAP_PX     = 16;

  const [s1, s2, s3, s4] = shapeTypes;
  const ext1 = shapeExtentAtCenter(s1, r);
  const ext2 = shapeExtentAtCenter(s2, r);
  const ext3 = shapeExtentAtCenter(s3, r);
  const ext4 = shapeExtentAtCenter(s4, r);

  const overlap12 = regionCounts['set1_set2'] != null;
  const overlap23 = regionCounts['set2_set3'] != null;
  const overlap34 = regionCounts['set3_set4'] != null;

  const dist12 = overlap12 ? clampDistForOverlap(ext1 + ext2 - OVERLAP_PX, ext1, ext2, r * 0.3) : (ext1 + ext2 + GAP_PX);
  const dist23 = overlap23 ? clampDistForOverlap(ext2 + ext3 - OVERLAP_PX, ext2, ext3, r * 0.3) : (ext2 + ext3 + GAP_PX);
  const dist34 = overlap34 ? clampDistForOverlap(ext3 + ext4 - OVERLAP_PX, ext3, ext4, r * 0.3) : (ext3 + ext4 + GAP_PX);

  const MARGIN   = 18;
  const cx1      = MARGIN + r;
  const cx2      = cx1 + dist12;
  const cx3      = cx2 + dist23;
  const cx4      = cx3 + dist34;
  const CANVAS_W = Math.ceil(cx4 + r + MARGIN);

  const sets = [
    { id: 'set1', cx: cx1, cy, w: r * 2, h: r * 2 },
    { id: 'set2', cx: cx2, cy, w: r * 2, h: r * 2 },
    { id: 'set3', cx: cx3, cy, w: r * 2, h: r * 2 },
    { id: 'set4', cx: cx4, cy, w: r * 2, h: r * 2 },
  ];

  const regions = {
    set1_only: { x: overlap12 ? cx1 - ext1 * 0.35 : cx1,       y: cy },
    set2_only: { x: cx2,                                         y: cy - r * 0.55 },
    set3_only: { x: cx3,                                         y: cy - r * 0.55 },
    set4_only: { x: overlap34 ? cx4 + ext4 * 0.35 : cx4,        y: cy },
    outside:   { x: 8,                                           y: 14 },
  };

  if (overlap12) regions.set1_set2 = { x: (cx1 + cx2) / 2, y: cy };
  if (overlap23) regions.set2_set3 = { x: (cx2 + cx3) / 2, y: cy };
  if (overlap34) regions.set3_set4 = { x: (cx3 + cx4) / 2, y: cy };

  return { sets, regions, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H };
}

// ---------------------------------------------------------------------------
// Dynamic three_hub layout
// ---------------------------------------------------------------------------

/**
 * Builds a three_hub layout: a central shape (set1) flanked by set2 (left)
 * and set3 (right). set1 overlaps both set2 and set3, but set2 and set3
 * do NOT overlap each other.
 *
 * Region keys: set1_only, set2_only, set3_only, set1_set2, set1_set3, outside
 */
function computeThreeHubLayout(shapeTypes, rBoost = 0) {
  const r          = 65 + rBoost;
  const OVERLAP_PX = 48;
  const MARGIN     = 20;

  const [s1, s2, s3] = shapeTypes;

  const ext1L = rayExtentFromCenter(s1, r, Math.PI);
  const ext1R = rayExtentFromCenter(s1, r, 0);
  const ext2R = rayExtentFromCenter(s2, r, 0);
  const ext3L = rayExtentFromCenter(s3, r, Math.PI);

  const dist12 = clampDistForOverlap(Math.max(ext1L + ext2R - OVERLAP_PX, r * 0.4), ext1L, ext2R, r * 0.4);
  const dist13 = clampDistForOverlap(Math.max(ext1R + ext3L - OVERLAP_PX, r * 0.4), ext1R, ext3L, r * 0.4);

  const cy  = MARGIN + r;
  const cx2 = MARGIN + r;
  const cx1 = cx2 + dist12;
  const cx3 = cx1 + dist13;

  const canvasW = Math.ceil(cx3 + r + MARGIN);
  const canvasH = Math.ceil(cy + r + MARGIN);

  const regions = {
    set1_only: { x: cx1,                          y: cy - r * 0.5 },
    set2_only: { x: cx2 + (cx2 - cx1) * 0.3,     y: cy },
    set3_only: { x: cx3 + (cx3 - cx1) * 0.3,     y: cy },
    set1_set2: { x: (cx1 + cx2) / 2,              y: cy },
    set1_set3: { x: (cx1 + cx3) / 2,              y: cy },
    outside:   { x: 8,                            y: 16 },
  };

  return {
    sets: [
      { id: 'set1', cx: cx1, cy, w: r * 2, h: r * 2 },
      { id: 'set2', cx: cx2, cy, w: r * 2, h: r * 2 },
      { id: 'set3', cx: cx3, cy, w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Dynamic four_two_pairs layout
// ---------------------------------------------------------------------------

/**
 * Builds a four_two_pairs layout: two separate overlapping pairs side by side.
 * set1-set2 overlap on the left, set3-set4 overlap on the right.
 * The two pairs have no overlap with each other.
 *
 * Region keys: set1_only, set2_only, set1_set2, set3_only, set4_only, set3_set4, outside
 */
function computeFourTwoPairsLayout(shapeTypes, rBoost = 0) {
  const r          = 55 + rBoost;
  const OVERLAP_PX = 42;
  const PAIR_GAP   = 35;
  const MARGIN     = 18;
  const cy         = MARGIN + r;

  const [s1, s2, s3, s4] = shapeTypes;

  const ext1R = rayExtentFromCenter(s1, r, 0);
  const ext2L = rayExtentFromCenter(s2, r, Math.PI);
  const dist12 = clampDistForOverlap(Math.max(ext1R + ext2L - OVERLAP_PX, r * 0.4), ext1R, ext2L, r * 0.4);

  const ext2R = rayExtentFromCenter(s2, r, 0);
  const ext3L = rayExtentFromCenter(s3, r, Math.PI);
  const distPairs = ext2R + ext3L + PAIR_GAP;

  const ext3R = rayExtentFromCenter(s3, r, 0);
  const ext4L = rayExtentFromCenter(s4, r, Math.PI);
  const dist34 = clampDistForOverlap(Math.max(ext3R + ext4L - OVERLAP_PX, r * 0.4), ext3R, ext4L, r * 0.4);

  const cx1 = MARGIN + r;
  const cx2 = cx1 + dist12;
  const cx3 = cx2 + distPairs;
  const cx4 = cx3 + dist34;

  const canvasW = Math.ceil(cx4 + r + MARGIN);
  const canvasH = Math.ceil(cy + r + MARGIN);

  const mid12 = (cx1 + cx2) / 2;
  const mid34 = (cx3 + cx4) / 2;

  const regions = {
    set1_only: { x: cx1 - (mid12 - cx1) * 0.4, y: cy },
    set1_set2: { x: mid12,                      y: cy },
    set2_only: { x: cx2 + (cx2 - mid12) * 0.4,  y: cy - r * 0.4 },
    set3_only: { x: cx3 - (mid34 - cx3) * 0.4, y: cy },
    set3_set4: { x: mid34,                      y: cy },
    set4_only: { x: cx4 + (cx4 - mid34) * 0.4,  y: cy - r * 0.4 },
    outside:   { x: 8,                          y: 14 },
  };

  return {
    sets: [
      { id: 'set1', cx: cx1, cy, w: r * 2, h: r * 2 },
      { id: 'set2', cx: cx2, cy, w: r * 2, h: r * 2 },
      { id: 'set3', cx: cx3, cy, w: r * 2, h: r * 2 },
      { id: 'set4', cx: cx4, cy, w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Dynamic three_v_overlap layout
// ---------------------------------------------------------------------------

/**
 * Builds a three_v_overlap layout: V-arrangement.
 * set1 top-left, set2 top-right (no overlap between them).
 * set3 bottom-centre, overlapping both set1 and set2.
 *
 * Region keys: set1_only, set2_only, set3_only, set1_set3, set2_set3, outside
 */
function computeThreeVOverlapLayout(shapeTypes, rBoost = 0) {
  const BASE_R     = 65 + rBoost;
  const GAP_PX     = 10;
  const MARGIN     = 20;
  const TARGET_DIAG_OVERLAP = 35; // target overlap depth along the actual diagonal
  const MIN_VERT   = 35;          // vertical floor — below this the layout looks cramped

  const [s1, s2, s3] = shapeTypes;

  // Boost the radius if the shape combination produces narrow diagonal extents.
  // This guarantees adequate overlap area instead of forcing shapes unnaturally close.
  let r = BASE_R;
  let cx1, cx2, cx3, cy_top, horizDist, vertDist;

  for (let rAttempt = 0; rAttempt < 3; rAttempt++) {
    const ext1R = rayExtentFromCenter(s1, r, 0);
    const ext2L = rayExtentFromCenter(s2, r, Math.PI);
    const gapDist = ext1R + ext2L + GAP_PX;

    cx1     = MARGIN + r;
    cx2     = cx1 + gapDist;
    cy_top  = MARGIN + r;
    cx3     = (cx1 + cx2) / 2;
    horizDist = cx3 - cx1;

    // Iteratively find vertical distance giving TARGET_DIAG_OVERLAP along the diagonal
    const ext1D = rayExtentFromCenter(s1, r, Math.PI / 2);
    const ext3U = rayExtentFromCenter(s3, r, -Math.PI / 2);
    vertDist = ext1D + ext3U - 25;

    for (let iter = 0; iter < 20; iter++) {
      const diagAngle13 = Math.atan2(vertDist, horizDist);
      const diagAngle23 = Math.atan2(vertDist, -horizDist);

      const span13 = rayExtentFromCenter(s1, r, diagAngle13)
                   + rayExtentFromCenter(s3, r, diagAngle13 + Math.PI);
      const span23 = rayExtentFromCenter(s2, r, diagAngle23)
                   + rayExtentFromCenter(s3, r, diagAngle23 + Math.PI);

      const diagDist = Math.sqrt(horizDist * horizDist + vertDist * vertDist);
      const worstOverlap = Math.min(span13 - diagDist, span23 - diagDist);

      if (worstOverlap >= TARGET_DIAG_OVERLAP) break;
      vertDist -= 3;
    }

    // If vertDist is acceptable, we're done
    if (vertDist >= MIN_VERT) break;

    // Otherwise bump the radius and retry (larger shapes = more overlap room)
    r += 8;
  }
  vertDist = Math.max(vertDist, MIN_VERT);
  const cy3 = cy_top + vertDist;

  const canvasW = Math.ceil(cx2 + r + MARGIN);
  const canvasH = Math.ceil(cy3 + r + MARGIN);

  const mx = (cx1 + cx2 + cx3) / 3;
  const my = (cy_top * 2 + cy3) / 3;

  const regions = {
    set1_only: { x: cx1 + (cx1 - mx) * 0.4, y: cy_top + (cy_top - my) * 0.4 },
    set2_only: { x: cx2 + (cx2 - mx) * 0.4, y: cy_top + (cy_top - my) * 0.4 },
    set3_only: { x: cx3,                     y: cy3 + (cy3 - my) * 0.4 },
    set1_set3: { x: (cx1 + cx3) / 2,        y: (cy_top + cy3) / 2 },
    set2_set3: { x: (cx2 + cx3) / 2,        y: (cy_top + cy3) / 2 },
    outside:   { x: 8,                      y: 16 },
  };

  return {
    sets: [
      { id: 'set1', cx: cx1, cy: cy_top, w: r * 2, h: r * 2 },
      { id: 'set2', cx: cx2, cy: cy_top, w: r * 2, h: r * 2 },
      { id: 'set3', cx: cx3, cy: cy3,    w: r * 2, h: r * 2 },
    ],
    regions,
    canvasWidth: canvasW,
    canvasHeight: canvasH,
  };
}

// ---------------------------------------------------------------------------
// Static layout templates
// ---------------------------------------------------------------------------

/**
 * Static layout templates for layouts that are NOT computed dynamically.
 *
 * Dynamic layouts (computed at runtime based on shape types):
 *   two_overlap, two_overlap_staggered — see computeTwoOverlapLayout
 *   three_linear                       — see computeThreeLinearLayout
 *   three_all_overlap, _v2             — see computeThreeAllOverlapLayout
 *
 * Static layouts (fixed positions):
 *   two_nested          — two sets, one fully inside the other (subset)
 *   two_separate        — two sets, no overlap
 *   three_one_separate  — set1∩set2; set3 separate
 *   two_separate_staggered — two sets, no overlap, diagonal
 *   five_complex        — 5 shapes with fixed arrangement
 *   three_nested        — 3 concentric shapes (set1 ⊃ set2 ⊃ set3)
 */
const LAYOUTS = {
  two_nested: {
    // Outer shape fully contains inner shape (subset relationship).
    // set1 = larger outer, set2 = smaller inner.
    canvasWidth: 240,
    canvasHeight: 200,
    sets: [
      { id: 'set1', cx: 120, cy: 100, w: 160, h: 160 },
      { id: 'set2', cx: 120, cy: 100, w: 80, h: 80 },
    ],
    regions: {
      set1_only:  { x: 52, y: 100 },
      set1_set2:  { x: 120, y: 100 },
      outside:    { x: 8, y: 16 },
    },
  },

  two_separate: {
    // r=60, gap ~20px between shapes
    canvasWidth: 300,
    canvasHeight: 155,
    sets: [
      { id: 'set1', cx: 80,  cy: 77, w: 120, h: 120 },
      { id: 'set2', cx: 220, cy: 77, w: 120, h: 120 },
    ],
    regions: {
      set1_only: { x: 80,  y: 77 },
      set2_only: { x: 220, y: 77 },
      outside:   { x: 8,   y: 16 },
    },
  },

  /**
   * five_complex — redesigned for readability (440 × 215 canvas).
   *
   *  set1 rectangle : cx=200 cy=120 w=340 h=150  → x:30–370   y:45–195
   *  set2 square    : cx=65  cy=75  w=105 h=105  → x:12–118   y:22–128  (upper-left, partly outside set1)
   *  set3 triangle  : cx=355 cy=120 r=80         → top(355,40) BL(275,200) BR(435,200) (right side, partly outside set1)
   *  set4 circle    : cx=185 cy=120 r=58         → x:127–243  y:62–178  (inside set1)
   *  set5 diamond   : cx=280 cy=120 r=65         → x:215–345  y:55–185  (inside set1, overlaps set4 & set3)
   *
   *  Labeled regions (all geometrically verified):
   *    set2_only       ( 65,  35)  set2 above set1
   *    set1_set2       ( 65, 100)  set1 ∩ set2
   *    set1_only       (140,  58)  set1 only — gap between set2 and set4
   *    set1_set4       (148, 120)  set1 ∩ set4 — left of set5
   *    set1_set4_set5  (231, 120)  set1 ∩ set4 ∩ set5 — not set3
   *    set1_set3_set5  (330, 120)  set1 ∩ set3 ∩ set5 — not set4
   *    set3_only       (395, 150)  set3 only — right of set1
   */
  five_complex: {
    canvasWidth: 440,
    canvasHeight: 215,
    sets: [
      { id: 'set1', cx: 200, cy: 120, w: 340, h: 150 },
      { id: 'set2', cx: 65,  cy: 75,  w: 105, h: 105 },
      { id: 'set3', cx: 355, cy: 120, w: 160, h: 160 },
      { id: 'set4', cx: 185, cy: 120, w: 116, h: 116 },
      { id: 'set5', cx: 280, cy: 120, w: 130, h: 130 },
    ],
    regions: {
      set2_only:       { x: 65,  y: 35  },
      set1_set2:       { x: 65,  y: 100 },
      set1_only:       { x: 140, y: 70  },
      set1_set4:       { x: 148, y: 120 },
      set1_set4_set5:  { x: 231, y: 120 },
      set1_set3_set5:  { x: 330, y: 120 },
      set3_only:       { x: 395, y: 150 },
      outside:         { x: 12,  y: 16  },
    },
  },

  three_one_separate: {
    // r=60: set1-set2 overlap ~50px, set3 separate
    canvasWidth: 380,
    canvasHeight: 155,
    sets: [
      { id: 'set1', cx: 75,  cy: 77, w: 120, h: 120 },
      { id: 'set2', cx: 155, cy: 77, w: 120, h: 120 },
      { id: 'set3', cx: 300, cy: 77, w: 120, h: 120 },
    ],
    regions: {
      set1_only: { x: 42,  y: 77 },
      set1_set2: { x: 115, y: 77 },
      set2_only: { x: 195, y: 57 },
      set3_only: { x: 300, y: 77 },
      outside:   { x: 8,   y: 16 },
    },
  },

  two_separate_staggered: {
    // set1 upper-left, set2 lower-right; no overlap, r=58
    canvasWidth: 295,
    canvasHeight: 185,
    sets: [
      { id: 'set1', cx: 88,  cy: 62,  w: 116, h: 116 },
      { id: 'set2', cx: 210, cy: 118, w: 116, h: 116 },
    ],
    regions: {
      set1_only: { x: 88,  y: 62  },
      set2_only: { x: 210, y: 118 },
      outside:   { x: 8,   y: 16  },
    },
  },

  three_nested_one_separate: {
    // set2 nested inside set1 (subset), set3 completely separate.
    // Produces 4 regions: outer ring, inner, separate shape, outside.
    canvasWidth: 380,
    canvasHeight: 200,
    sets: [
      { id: 'set1', cx: 110, cy: 100, w: 160, h: 160 },
      { id: 'set2', cx: 110, cy: 100, w: 80,  h: 80  },
      { id: 'set3', cx: 300, cy: 100, w: 120, h: 120 },
    ],
    regions: {
      set1_only:  { x: 45,  y: 100 },
      set1_set2:  { x: 110, y: 100 },
      set3_only:  { x: 300, y: 100 },
      outside:    { x: 8,   y: 16  },
    },
  },

  three_nested: {
    // Three concentric shapes: set1 (outer) ⊃ set2 (middle) ⊃ set3 (inner).
    // Produces 4 regions: outer ring, middle ring, innermost, outside.
    canvasWidth: 260,
    canvasHeight: 220,
    sets: [
      { id: 'set1', cx: 130, cy: 110, w: 200, h: 200 },
      { id: 'set2', cx: 130, cy: 110, w: 130, h: 130 },
      { id: 'set3', cx: 130, cy: 110, w: 70,  h: 70  },
    ],
    regions: {
      set1_only:  { x: 46,  y: 55  },   // outer ring (set1 minus set2)
      set1_set2:  { x: 75,  y: 75  },   // middle ring (set2 minus set3)
      all_three:  { x: 130, y: 110 },   // innermost (inside set3)
      outside:    { x: 8,   y: 16  },
    },
  },

  /**
   * six_complex — 6-shape layout with overlapping groups (500 × 260 canvas).
   *
   *  set1 rectangle : cx=230 cy=130 w=400 h=230  → x:30–430   y:15–245  (large container)
   *  set2 circle    : cx=125 cy=100 w=110 h=110  → r=55, inside set1, upper-left
   *  set3 pentagon  : cx=205 cy=100 w=110 h=110  → r=55, inside set1, overlaps set2
   *  set4 hexagon   : cx=340 cy=100 w=110 h=110  → r=55, inside set1, upper-right (separate from set3)
   *  set5 diamond   : cx=210 cy=165 w=110 h=110  → r=55, inside set1, overlaps set3 from below
   *  set6 triangle  : cx=420 cy=130 w=130 h=130  → r=65, partly inside set1, partly outside right
   *
   *  Labeled regions (all geometrically verified):
   *    set1_set2        ( 90, 100)  set1 ∩ set2 only
   *    set1_set2_set3   (165,  90)  set1 ∩ set2 ∩ set3
   *    set1_set3        (230,  70)  set1 ∩ set3 only (no set2, no set5)
   *    set1_set3_set5   (205, 135)  set1 ∩ set3 ∩ set5
   *    set1_set4        (340, 100)  set1 ∩ set4 only
   *    set1_set5        (210, 195)  set1 ∩ set5 only (no set3)
   *    set1_only        (275, 200)  set1 only — gap between shapes
   *    set1_set6        (400, 160)  set1 ∩ set6
   *    set6_only        (460, 160)  set6 outside set1
   */
  six_complex: {
    canvasWidth: 500,
    canvasHeight: 260,
    sets: [
      { id: 'set1', cx: 230, cy: 130, w: 400, h: 230 },
      { id: 'set2', cx: 125, cy: 100, w: 110, h: 110 },
      { id: 'set3', cx: 205, cy: 100, w: 110, h: 110 },
      { id: 'set4', cx: 340, cy: 100, w: 110, h: 110 },
      { id: 'set5', cx: 210, cy: 165, w: 110, h: 110 },
      { id: 'set6', cx: 420, cy: 130, w: 130, h: 130 },
    ],
    regions: {
      set1_set2:        { x: 90,  y: 100 },
      set1_set2_set3:   { x: 165, y: 90  },
      set1_set3:        { x: 230, y: 70  },
      set1_set3_set5:   { x: 205, y: 135 },
      set1_set4:        { x: 340, y: 100 },
      set1_set5:        { x: 210, y: 195 },
      set1_only:        { x: 275, y: 200 },
      set1_set6:        { x: 400, y: 160 },
      set6_only:        { x: 460, y: 160 },
      outside:          { x: 12,  y: 12  },
    },
  },

};

function renderShape(id, shape, cx, cy, w, h, stroke) {
  const r = Math.min(w, h) / 2;
  const strokeProps = {
    stroke: stroke,
    strokeWidth: STROKE_WIDTH,
    fill: 'none',
  };

  switch (shape) {
    case 'circle':
      return <Circle key={id} cx={cx} cy={cy} r={r} {...strokeProps} />;

    case 'square':
    case 'rectangle':
      return (
        <Rect
          key={id}
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          {...strokeProps}
        />
      );

    case 'triangle': {
      // Upward-pointing triangle within bounding box
      const pts = `${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`;
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'pentagon': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'diamond': {
      const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'octagon': {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'oval':
      return <Ellipse key={id} cx={cx} cy={cy} rx={r} ry={r * 0.65} {...strokeProps} />;

    case 'vertical_oval':
      return <Ellipse key={id} cx={cx} cy={cy} rx={r * 0.65} ry={r} {...strokeProps} />;

    case 'isosceles_triangle': {
      const pts = `${cx},${cy - r} ${cx - r * 0.5},${cy + r} ${cx + r * 0.5},${cy + r}`;
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'parallelogram': {
      const sk = r * 0.25;
      const pts = `${cx - r * 0.85 + sk},${cy - r * 0.6} ${cx + r * 0.85 + sk},${cy - r * 0.6} ${cx + r * 0.85 - sk},${cy + r * 0.6} ${cx - r * 0.85 - sk},${cy + r * 0.6}`;
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'star': {
      const innerR = r * 0.4;
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : innerR;
        return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    case 'trapezoid': {
      const pts = `${cx - r * 0.55},${cy - r} ${cx + r * 0.55},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`;
      return <Polygon key={id} points={pts} {...strokeProps} />;
    }

    default:
      return <Circle key={id} cx={cx} cy={cy} r={r} {...strokeProps} />;
  }
}

/**
 * Measures the minimum clearance across all overlap regions in a layout.
 * Overlap regions are those where a label must sit inside multiple shapes
 * (i.e. not *_only and not outside). Returns Infinity if there are no
 * overlap regions.
 */
function measureMinOverlapClearance(layout, vennConfig) {
  const allSetIds = layout.sets.map(s => s.id);
  const shapeById = {};
  (vennConfig.sets || []).forEach(s => { shapeById[s.id] = s.shape; });

  const shapeGeoms = layout.sets.map(pos =>
    shapeToGeometry(shapeById[pos.id] || 'circle', pos.cx, pos.cy, pos.w, pos.h),
  );
  const setIndexById = Object.fromEntries(layout.sets.map((s, i) => [s.id, i]));

  let minClearance = Infinity;

  for (const [regionKey, value] of Object.entries(vennConfig.regions || {})) {
    if (value === undefined || value === null) continue;
    if (regionKey === 'outside' || regionKey.endsWith('_only')) continue;

    const rawPos = layout.regions[regionKey];
    if (!rawPos) continue;

    const { insideIds, outsideIds } = parseRegionKey(regionKey, allSetIds);
    const insideGeoms = insideIds.map(id => shapeGeoms[setIndexById[id]]).filter(Boolean);
    const outsideGeoms = outsideIds.map(id => shapeGeoms[setIndexById[id]]).filter(Boolean);
    const regionCheck = (px, py) =>
      insideGeoms.every(g => isPointInsideShape(px, py, g)) &&
      outsideGeoms.every(g => !isPointInsideShape(px, py, g));

    const result = findPoleOfInaccessibility(
      rawPos.x, rawPos.y, shapeGeoms, regionCheck,
      layout.canvasWidth, layout.canvasHeight,
    );
    minClearance = Math.min(minClearance, result.clearance);
  }

  return minClearance;
}

/**
 * Computes a dynamic layout for the given diagram type with an optional
 * radius boost (extra pixels added to the base shape radius).
 */
function computeDynamicLayout(diagramLayout, shapeTypes, vennConfig, rBoost) {
  switch (diagramLayout) {
    case 'three_linear':           return computeThreeLinearLayout(shapeTypes, vennConfig.regions || {}, rBoost);
    case 'three_all_overlap':      return computeThreeAllOverlapLayout(shapeTypes, false, rBoost);
    case 'three_all_overlap_v2':   return computeThreeAllOverlapLayout(shapeTypes, true, rBoost);
    case 'two_overlap':            return computeTwoOverlapLayout(shapeTypes, false, rBoost);
    case 'two_overlap_staggered':  return computeTwoOverlapLayout(shapeTypes, true, rBoost);
    case 'two_vertical_overlap':   return computeTwoVerticalOverlapLayout(shapeTypes, rBoost);
    case 'three_vertical_chain':   return computeThreeVerticalChainLayout(shapeTypes, vennConfig.regions || {}, rBoost);
    case 'four_linear':            return computeFourLinearLayout(shapeTypes, vennConfig.regions || {}, rBoost);
    case 'three_hub':              return computeThreeHubLayout(shapeTypes, rBoost);
    case 'four_two_pairs':         return computeFourTwoPairsLayout(shapeTypes, rBoost);
    case 'three_v_overlap':        return computeThreeVOverlapLayout(shapeTypes, rBoost);
    default:                       return null;
  }
}

function resolveLayout(vennConfig) {
  if (!vennConfig) return null;
  const shapeTypes = (vennConfig.sets || []).map(s => s.shape || 'circle');

  // Auto-layout: infer topology from region keys
  if (!vennConfig.diagramLayout || vennConfig.diagramLayout === 'auto') {
    let layout = null;
    for (let attempt = 0; attempt < MAX_RBOOST_ATTEMPTS; attempt++) {
      const rBoost = attempt * RBOOST_STEP;
      layout = computeAutoLayout(vennConfig, rBoost);
      if (!layout) return null;
      const minClear = measureMinOverlapClearance(layout, vennConfig);
      if (minClear >= MIN_LABEL_CLEARANCE) return layout;
    }
    return layout;
  }

  if (DYNAMIC_LAYOUTS.has(vennConfig.diagramLayout)) {
    let layout = null;
    for (let attempt = 0; attempt < MAX_RBOOST_ATTEMPTS; attempt++) {
      const rBoost = attempt * RBOOST_STEP;
      layout = computeDynamicLayout(vennConfig.diagramLayout, shapeTypes, vennConfig, rBoost);
      if (!layout) return null;

      const minClear = measureMinOverlapClearance(layout, vennConfig);
      if (minClear >= MIN_LABEL_CLEARANCE) return layout;
    }
    return layout;
  }

  return LAYOUTS[vennConfig.diagramLayout] ?? null;
}

const DYNAMIC_LAYOUTS = new Set([
  'three_linear',
  'three_all_overlap',
  'three_all_overlap_v2',
  'two_overlap',
  'two_overlap_staggered',
  'two_vertical_overlap',
  'three_vertical_chain',
  'four_linear',
  'three_hub',
  'four_two_pairs',
  'three_v_overlap',
]);

export function getCanvasSize(diagramLayout, vennConfig) {
  if (!diagramLayout || diagramLayout === 'auto') {
    if (vennConfig) {
      const layout = resolveLayout(vennConfig);
      if (layout) return { width: layout.canvasWidth, height: layout.canvasHeight };
    }
    return { width: 200, height: 200 };
  }
  if (DYNAMIC_LAYOUTS.has(diagramLayout)) {
    if (vennConfig) {
      const layout = resolveLayout(vennConfig);
      return { width: layout.canvasWidth, height: layout.canvasHeight };
    }
    // Fallback sizes when no config is available
    if (diagramLayout === 'three_linear') return { width: 420, height: 155 };
    if (diagramLayout === 'two_overlap') return { width: 280, height: 190 };
    if (diagramLayout === 'two_overlap_staggered') return { width: 300, height: 210 };
    return { width: 240, height: 220 };
  }
  const layout = LAYOUTS[diagramLayout];
  return layout
    ? { width: layout.canvasWidth, height: layout.canvasHeight }
    : { width: 200, height: 200 };
}

/**
 * Renders a Venn / Euler diagram from a vennConfig object.
 *
 * vennConfig shape:
 * {
 *   diagramLayout: "three_linear",        // one of the LAYOUTS keys
 *   sets: [{ id: "set1", shape: "square", label: "Green" }, ...],
 *   regions: { set1_only: 4, set2_only: 0, set1_set2: 2, ... }
 * }
 *
 * scale: multiplied against the canvas size (use < 1 for small option thumbnails)
 */
export default function VennDiagramRenderer({ vennConfig, scale = 1 }) {
  const { practiceTheme: t } = useTheme();
  const STROKE = t.text;
  const TEXT_FILL = t.text;

  // Use JSON key for stable comparison (vennConfig is often a new object each render).
  const configKey = JSON.stringify(vennConfig);
  // useMemo covers same-instance re-renders; _layoutCache covers remounts after navigation.
  const layout = useMemo(() => {
    if (_layoutCache.has(configKey)) return _layoutCache.get(configKey);
    const result = resolveLayout(vennConfig);
    _layoutCache.set(configKey, result);
    return result;
  }, [configKey]);
  if (!layout) return null;

  const canvasW = layout.canvasWidth;
  const canvasH = layout.canvasHeight;
  const displayW = canvasW * scale;
  const displayH = canvasH * scale;

  const shapeById = {};
  (vennConfig.sets || []).forEach((s) => {
    shapeById[s.id] = s.shape;
  });

  const shapeGeoms = layout.sets.map((pos) =>
    shapeToGeometry(shapeById[pos.id] || 'circle', pos.cx, pos.cy, pos.w, pos.h),
  );

  // Build a lookup from set ID → geometry index so region checks can reference
  // specific shapes by ID rather than position.
  const allSetIds = layout.sets.map(s => s.id);
  const setIndexById = Object.fromEntries(layout.sets.map((s, i) => [s.id, i]));

  // Cache label placements — the grid search only reruns when the config changes.
  const labelCacheKey = configKey + ':labels';
  const labelPlacements = useMemo(() => {
    if (_layoutCache.has(labelCacheKey)) return _layoutCache.get(labelCacheKey);
    const placements = {};
    for (const [regionKey, value] of Object.entries(vennConfig.regions || {})) {
      if (value === undefined || value === null || value === 0) continue;
      const rawPos = layout.regions[regionKey];
      if (!rawPos) continue;

      const { insideIds, outsideIds } = parseRegionKey(regionKey, allSetIds);
      const insideGeoms  = insideIds.map(id => shapeGeoms[setIndexById[id]]).filter(Boolean);
      const outsideGeoms = outsideIds.map(id => shapeGeoms[setIndexById[id]]).filter(Boolean);
      const regionCheck  = (px, py) =>
        insideGeoms.every(g => isPointInsideShape(px, py, g)) &&
        outsideGeoms.every(g => !isPointInsideShape(px, py, g));

      placements[regionKey] = findLabelPlacement(rawPos.x, rawPos.y, shapeGeoms, regionCheck, canvasW, canvasH, regionKey);
    }
    _layoutCache.set(labelCacheKey, placements);
    return placements;
  }, [configKey]);

  return (
    <View>
      <Svg
        width={displayW}
        height={displayH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
      >
        {layout.sets.map((pos) => {
          const shape = shapeById[pos.id] || 'circle';
          return renderShape(pos.id, shape, pos.cx, pos.cy, pos.w, pos.h, STROKE);
        })}

        {Object.entries(vennConfig.regions || {}).map(([regionKey, value]) => {
          if (value === undefined || value === null || value === 0) return null;
          const placement = labelPlacements[regionKey];
          if (!placement) return null;
          if (placement.tooSmall) return null;

          const sharedProps = {
            x: placement.x,
            y: placement.y,
            fontSize: placement.fontSize,
            textAnchor: 'middle',
            dominantBaseline: 'central',
            fontWeight: '600',
          };
          return (
            <React.Fragment key={regionKey}>
              <SvgText {...sharedProps} fill={t.bg} stroke={t.bg} strokeWidth={3}>
                {value}
              </SvgText>
              <SvgText {...sharedProps} fill={TEXT_FILL}>
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
