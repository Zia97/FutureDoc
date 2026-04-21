// Abstract vennConfig -> concrete geometry + region label positions.
//
// The contract: if computeLayout() returns without throwing, every labelled region has
// polylabel clearance >= MIN_LABEL_DIST, and every font size is >= MIN_FONT_SIZE.
// If a topology can't satisfy this after MAX_SCALE_ATTEMPTS, computeLayout throws —
// which is a generator-side bug, caught here rather than at render time.

import polygonClipping from 'polygon-clipping';
import polylabel from 'polylabel';
import { shapeToPolygon, shapeToSvgSpec } from './shapes.js';
import { seedPositions, stableHash } from './topologies.js';

// Label contract
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 16;
const PADDING = 2;                  // px between label text edge and shape outline
const CHAR_WIDTH_RATIO = 0.55;      // per em, for sans-serif digits/letters
const MIN_LABEL_DIST = 14;          // polylabel distance floor (supports 12 px font for up to 3 chars)

// Canvas
const CANVAS_MARGIN = 12;
const OUTSIDE_CORNER_MARGIN = 12;

// ---------------------------------------------------------------------------
// Region key parsing — same semantics as the old renderer.
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

// ---------------------------------------------------------------------------
// Polygon-clipping helpers. The lib expects MultiPolygon:
//   [ [ ring, hole1, hole2, ... ], ... ]
// where ring = [[x,y], [x,y], ..., [x,y]] and first point == last point.
// ---------------------------------------------------------------------------

function ringClosed(ring) {
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx === lx && fy === ly) return ring;
  return [...ring, [fx, fy]];
}

function ringToMultiPolygon(ring) {
  return [[ringClosed(ring)]];
}

function intersectAll(multiPolys) {
  if (multiPolys.length === 0) return [];
  if (multiPolys.length === 1) return multiPolys[0];
  return polygonClipping.intersection(multiPolys[0], ...multiPolys.slice(1));
}

function subtractAll(base, subtractors) {
  if (subtractors.length === 0) return base;
  return polygonClipping.difference(base, ...subtractors);
}

// Returns the largest polygon ring from a MultiPolygon result (polygon-clipping
// may return multiple disjoint pieces; we label the biggest).
function largestPolygon(multiPoly) {
  if (!multiPoly || multiPoly.length === 0) return null;
  let best = null;
  let bestArea = -Infinity;
  for (const poly of multiPoly) {
    const area = ringArea(poly[0]);
    if (area > bestArea) {
      bestArea = area;
      best = poly;
    }
  }
  return { polygon: best, area: bestArea };
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lenSq;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const qx = ax + t * dx;
  const qy = ay + t * dy;
  return Math.hypot(px - qx, py - qy);
}

function minDistPointToRings(x, y, rings) {
  let min = Infinity;
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const d = pointToSegmentDist(x, y, ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1]);
      if (d < min) min = d;
    }
  }
  return min;
}

function ringArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(a) / 2;
}

// ---------------------------------------------------------------------------
// Label geometry
// ---------------------------------------------------------------------------

function fontSizeFor(dist, textLen) {
  // dist must accommodate the larger of half-width and half-height + padding.
  const halfHeightLimit = 2 * (dist - PADDING);
  const halfWidthLimit  = (dist - PADDING) / (CHAR_WIDTH_RATIO * Math.max(textLen, 1) / 2);
  const raw = Math.min(halfHeightLimit, halfWidthLimit);
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.floor(raw)));
}

// Minimum polylabel distance that a label of `textLen` chars at MIN_FONT_SIZE
// would require. The scale loop uses this per-region floor so longer labels
// get more space.
function minDistFor(textLen) {
  const halfW = CHAR_WIDTH_RATIO * MIN_FONT_SIZE * Math.max(textLen, 1) / 2;
  const halfH = MIN_FONT_SIZE / 2;
  return Math.max(halfW, halfH) + PADDING;
}

// ---------------------------------------------------------------------------
// computeLayout
// ---------------------------------------------------------------------------

export function computeLayout(vennConfig, options = {}) {
  if (!vennConfig || !vennConfig.sets || !vennConfig.regions) {
    throw new Error('computeLayout: vennConfig missing sets or regions');
  }

  const allSetIds = vennConfig.sets.map(s => s.id);
  const topologyName = vennConfig.diagramLayout || vennConfig.topology || 'auto';
  const idToShape = Object.fromEntries(vennConfig.sets.map(s => [s.id, s.shape || 'circle']));
  const idToSet = Object.fromEntries(vennConfig.sets.map(s => [s.id, s]));

  // Deterministic content hash → picks layout variant. Same question always
  // gets the same render for every user. Optional `layoutVariant` field on the
  // vennConfig overrides the hash-picked variant.
  const hash = stableHash({ sets: vennConfig.sets, regions: vennConfig.regions });
  const seedShapes = seedPositions(allSetIds, vennConfig.regions, hash, vennConfig.layoutVariant);

  // Active region keys = those with a value present (0 counts are omitted)
  const activeRegions = Object.entries(vennConfig.regions)
    .filter(([, v]) => v !== undefined && v !== null && v !== 0 && v !== '')
    .map(([key, value]) => ({ key, value: String(value) }));

  // ---- Pixel-targeted mode ----
  // Caller passes the on-screen pixel width the diagram should occupy.
  // The layout scales shapes to fit that width, computes label clearances in
  // display pixels, and either succeeds (font sizes are real pixel sizes) or
  // throws because the topology can't fit at the requested size.
  if (options.targetWidthPx) {
    return layoutAtPixelWidth({
      seedShapes, idToShape, idToSet, allSetIds, activeRegions,
      topologyName, hash, targetWidthPx: options.targetWidthPx,
    });
  }

  // ---- Natural-scale mode (renderer fallback when pixel mode can't fit) ----
  // Unit-scale layout, best-effort labels. We accept fontSize < MIN_FONT_SIZE
  // for genuinely-tight regions rather than blowing the canvas up 5x with a
  // scale loop. The renderer will shrink-fit this compact canvas to widthPx,
  // so smaller canvas → larger labels on screen.
  const placed = seedShapes.map(s => ({
    id: s.id,
    shape: idToShape[s.id],
    cx: s.cx,
    cy: s.cy,
    w:  s.w,
    h:  s.h,
  }));

  const result = tryLayout(placed, activeRegions, allSetIds, { strict: false });
  if (!result.ok) {
    // Only failure mode now is structurally-empty regions (geometric impossibility).
    throw new Error(
      `computeLayout: topology="${topologyName}" produces empty region "${result.worstRegion}" ` +
      `(${result.reason || 'no clearance'}) — region key is geometrically inconsistent with the topology`,
    );
  }

  return assembleCanvas({
    placed: result.placed,
    labels: result.labels,
    activeRegions,
    idToSet,
    diagnostics: { mode: 'natural', topology: topologyName, hash },
  });
}

function layoutAtPixelWidth({ seedShapes, idToShape, idToSet, allSetIds, activeRegions, topologyName, hash, targetWidthPx }) {
  // Compute the natural shape bbox at unit scale (no margin yet).
  const naturalBbox = computeBBox(seedShapes.map(s => ({ ...s, shape: idToShape[s.id] })));
  const naturalShapeWidth = naturalBbox.maxX - naturalBbox.minX;
  const availableShapeWidth = targetWidthPx - 2 * CANVAS_MARGIN;
  if (availableShapeWidth <= 0) {
    throw new Error(`computeLayout: targetWidthPx=${targetWidthPx} too small for canvas margin`);
  }
  const pixelScale = availableShapeWidth / naturalShapeWidth;

  // Apply pixelScale to all positions and sizes — now everything is in display px.
  const placed = seedShapes.map(s => ({
    id: s.id,
    shape: idToShape[s.id],
    cx: s.cx * pixelScale,
    cy: s.cy * pixelScale,
    w:  s.w  * pixelScale,
    h:  s.h  * pixelScale,
  }));

  const result = tryLayout(placed, activeRegions, allSetIds);
  if (!result.ok) {
    throw new Error(
      `computeLayout: cannot fit topology="${topologyName}" in ${targetWidthPx}px width. ` +
      `Region "${result.worstRegion}" only has ${(result.worstDist || 0).toFixed(1)}px clearance ` +
      `(needs >= ${MIN_LABEL_DIST}px). Reduce regions or render in a wider container.`,
    );
  }

  return assembleCanvas({
    placed: result.placed,
    labels: result.labels,
    activeRegions,
    idToSet,
    fixedWidth: targetWidthPx,
    diagnostics: { mode: 'pixel', topology: topologyName, targetWidthPx, pixelScale, hash },
  });
}

function assembleCanvas({ placed, labels, activeRegions, idToSet, fixedWidth, diagnostics }) {
  const bbox = computeBBox(placed);
  const naturalW = bbox.maxX - bbox.minX + 2 * CANVAS_MARGIN;
  const naturalH = bbox.maxY - bbox.minY + 2 * CANVAS_MARGIN;
  const canvas = {
    width:  Math.ceil(fixedWidth || naturalW),
    height: Math.ceil(naturalH),
  };
  // Centre shapes within the canvas (when fixedWidth is wider than natural)
  const offsetX = -bbox.minX + (canvas.width - (bbox.maxX - bbox.minX)) / 2;
  const offsetY = -bbox.minY + CANVAS_MARGIN;

  const shapes = placed.map(p => ({
    id: p.id,
    label: idToSet[p.id]?.label,
    ...shapeToSvgSpec(p.shape, p.cx + offsetX, p.cy + offsetY, p.w, p.h),
  }));

  const finalLabels = labels.map(l => ({
    ...l,
    x: l.x + offsetX,
    y: l.y + offsetY,
  }));

  // Outside label goes in whichever canvas corner has the most clearance
  // from any shape outline. Fixed top-left placement collides with shapes
  // (e.g. rect/square) whose corners sit flush against the canvas margin.
  const outsideEntry = activeRegions.find(r => r.key === 'outside');
  if (outsideEntry) {
    const fontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, 14));
    const textLen = String(outsideEntry.value).length;
    const halfW = CHAR_WIDTH_RATIO * fontSize * textLen / 2;
    const halfH = fontSize / 2;
    const rings = placed.map(p =>
      ringClosed(shapeToPolygon(p.shape, p.cx + offsetX, p.cy + offsetY, p.w, p.h))
    );
    const cx = [OUTSIDE_CORNER_MARGIN + halfW, canvas.width  - OUTSIDE_CORNER_MARGIN - halfW];
    const cy = [OUTSIDE_CORNER_MARGIN + halfH, canvas.height - OUTSIDE_CORNER_MARGIN - halfH];
    let best = { x: cx[0], y: cy[0], dist: -Infinity };
    for (const x of cx) for (const y of cy) {
      const dist = minDistPointToRings(x, y, rings);
      if (dist > best.dist) best = { x, y, dist };
    }
    finalLabels.push({
      region: 'outside',
      text: outsideEntry.value,
      x: best.x,
      y: best.y,
      fontSize,
    });
  }

  return { canvas, shapes, labels: finalLabels, diagnostics };
}

// strict=true (default): every region must satisfy MIN_LABEL_DIST or layout fails.
//   Used by pixel-targeted mode where we want a clean "fits / doesn't fit" answer.
// strict=false: emit a label for every region using whatever clearance polylabel
//   returns, even below MIN_LABEL_DIST. Font is clamped to a hard floor (8 px).
//   Used by natural-scale fallback mode — produces a compact canvas with a few
//   small labels rather than blowing the canvas up to fit them.
function tryLayout(placed, activeRegions, allSetIds, { strict = true } = {}) {
  // Build polygons for each shape (in MultiPolygon form for polygon-clipping)
  const shapePolys = placed.map(p => ringToMultiPolygon(shapeToPolygon(p.shape, p.cx, p.cy, p.w, p.h)));
  const idToPoly = Object.fromEntries(placed.map((p, i) => [p.id, shapePolys[i]]));

  const labels = [];
  let worstDist = Infinity;
  let worstRegion = null;

  for (const { key, value } of activeRegions) {
    if (key === 'outside') continue; // handled after scaling

    const { insideIds, outsideIds } = parseRegionKey(key, allSetIds);
    if (insideIds.length === 0) continue;

    const insidePolys = insideIds.map(id => idToPoly[id]);
    let region = intersectAll(insidePolys);
    if (region.length === 0) {
      // Topology can't produce this region — layout is structurally wrong.
      return {
        ok: false,
        worstDist: 0,
        worstRegion: key,
        reason: 'region_empty_after_intersection',
      };
    }

    if (outsideIds.length > 0) {
      const outPolys = outsideIds.map(id => idToPoly[id]);
      region = subtractAll(region, outPolys);
      if (region.length === 0) {
        return {
          ok: false,
          worstDist: 0,
          worstRegion: key,
          reason: 'region_empty_after_subtraction',
        };
      }
    }

    const biggest = largestPolygon(region);
    if (!biggest || biggest.area < 4) {
      return { ok: false, worstDist: 0, worstRegion: key, reason: 'region_too_small' };
    }

    // polylabel: input is a polygon = [outerRing, hole1, ...], output [x,y] with .distance
    const center = polylabel(biggest.polygon, 0.5);
    const dist = center.distance;

    const textLen = String(value).length;
    const requiredDist = Math.max(MIN_LABEL_DIST, minDistFor(textLen));

    if (dist < requiredDist) {
      if (dist < worstDist) {
        worstDist = dist;
        worstRegion = key;
      }
      if (strict) continue; // pixel mode: skip the label and the layout will fail below
      // best-effort: emit the label anyway with a fontSize below MIN_FONT_SIZE
      // so the renderer has *something* to show. Floor at 8 px.
      const bestFont = Math.max(8, Math.floor(2 * (dist - PADDING)));
      labels.push({ region: key, text: value, x: center[0], y: center[1], fontSize: bestFont });
      continue;
    }

    labels.push({
      region: key,
      text: value,
      x: center[0],
      y: center[1],
      fontSize: fontSizeFor(dist, textLen),
    });
  }

  // strict mode: layout is only OK if every region got a clearance-passing label
  if (strict && labels.length !== activeRegions.filter(r => r.key !== 'outside').length) {
    return { ok: false, worstDist, worstRegion };
  }

  return { ok: true, placed, labels };
}

function computeBBox(placed) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of placed) {
    const ring = shapeToPolygon(p.shape, p.cx, p.cy, p.w, p.h);
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

// ---------------------------------------------------------------------------
// Adaptive width layout — finds the minimum canvas width at which all region
// labels reach MIN_FONT_SIZE. Simple diagrams stay compact; dense 5-set ones
// grow as wide as needed up to maxWidthPx.
// ---------------------------------------------------------------------------

function scaleShapesToWidth(seedShapes, idToShape, targetWidthPx) {
  const naturalBbox = computeBBox(seedShapes.map(s => ({ ...s, shape: idToShape[s.id] })));
  const naturalShapeWidth = naturalBbox.maxX - naturalBbox.minX;
  const availableShapeWidth = targetWidthPx - 2 * CANVAS_MARGIN;
  if (availableShapeWidth <= 0) return null;
  const pixelScale = availableShapeWidth / naturalShapeWidth;
  return seedShapes.map(s => ({
    id: s.id,
    shape: idToShape[s.id],
    cx: s.cx * pixelScale,
    cy: s.cy * pixelScale,
    w:  s.w  * pixelScale,
    h:  s.h  * pixelScale,
  }));
}

// Best-effort layout at an exact pixel width. Never throws; returns null on structural failure.
function layoutWidthBestEffort({ seedShapes, idToShape, idToSet, allSetIds, activeRegions, targetWidthPx }) {
  const placed = scaleShapesToWidth(seedShapes, idToShape, targetWidthPx);
  if (!placed) return null;
  const result = tryLayout(placed, activeRegions, allSetIds, { strict: false });
  if (!result.ok) return null;
  return assembleCanvas({ placed: result.placed, labels: result.labels, activeRegions, idToSet, fixedWidth: targetWidthPx });
}

function entryAllLabelsOk(entry) {
  return entry.labels.every(l => l.region === 'outside' || l.fontSize >= MIN_FONT_SIZE);
}

// Find the minimum width where all labels reach MIN_FONT_SIZE, up to maxWidthPx.
// If the topology can't satisfy even at maxWidthPx, returns the best-effort max result.
export function findOptimalLayoutWidth(vennConfig, { minWidthPx = 230, maxWidthPx, minHeightPx = 180 }) {
  const allSetIds     = vennConfig.sets.map(s => s.id);
  const idToShape     = Object.fromEntries(vennConfig.sets.map(s => [s.id, s.shape || 'circle']));
  const idToSet       = Object.fromEntries(vennConfig.sets.map(s => [s.id, s]));
  const hash          = stableHash({ sets: vennConfig.sets, regions: vennConfig.regions });
  const seedShapes    = seedPositions(allSetIds, vennConfig.regions, hash, vennConfig.layoutVariant);
  const activeRegions = Object.entries(vennConfig.regions)
    .filter(([, v]) => v !== undefined && v !== null && v !== 0 && v !== '')
    .map(([key, value]) => ({ key, value: String(value) }));

  // Raise minWidthPx if the topology's aspect ratio means that width would produce
  // a canvas shorter than minHeightPx. Canvas height ≈ naturalH * pixelScale + 2*CANVAS_MARGIN,
  // where pixelScale = (targetWidthPx - 2*CANVAS_MARGIN) / naturalW.
  const naturalBbox = computeBBox(seedShapes.map(s => ({ ...s, shape: idToShape[s.id] })));
  const naturalW = naturalBbox.maxX - naturalBbox.minX;
  const naturalH = naturalBbox.maxY - naturalBbox.minY;
  if (naturalW > 0 && naturalH > 0) {
    const widthForMinHeight = Math.ceil(
      (minHeightPx - 2 * CANVAS_MARGIN) * (naturalW / naturalH) + 2 * CANVAS_MARGIN,
    );
    minWidthPx = Math.min(maxWidthPx, Math.max(minWidthPx, widthForMinHeight));
  }

  const args = { seedShapes, idToShape, idToSet, allSetIds, activeRegions };

  // Fast path: min width already satisfies all labels
  const atMin = layoutWidthBestEffort({ ...args, targetWidthPx: minWidthPx });
  if (atMin && entryAllLabelsOk(atMin)) return atMin;

  const atMax = layoutWidthBestEffort({ ...args, targetWidthPx: maxWidthPx });
  if (!atMax) return computeLayout(vennConfig);        // structural failure → natural-scale fallback
  if (!entryAllLabelsOk(atMax)) return atMax;          // can't satisfy even at max → best effort

  // Binary search for minimum satisfying width (4 px precision)
  let lo = minWidthPx, hi = maxWidthPx, best = atMax;
  while (hi - lo > 4) {
    const mid = Math.round((lo + hi) / 2);
    const result = layoutWidthBestEffort({ ...args, targetWidthPx: mid });
    if (result && entryAllLabelsOk(result)) {
      best = result;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Cache — computeLayout() is deterministic, so we memoize by JSON hash. The
// renderer mounts frequently (carousel of options), so caching matters.
// ---------------------------------------------------------------------------

const _cache = new Map();

function cacheKey(vennConfig, options) {
  // stableHash is order-independent so JSONB / JSON drift doesn't bust the cache
  return stableHash({
    sets: vennConfig.sets,
    regions: vennConfig.regions,
    variant: vennConfig.layoutVariant || null,
    targetWidthPx: options?.targetWidthPx ?? null,
  });
}

export function getLayout(vennConfig, options = {}) {
  const key = cacheKey(vennConfig, options);
  let entry = _cache.get(key);
  if (!entry) {
    entry = computeLayout(vennConfig, options);
    _cache.set(key, entry);
  }
  return entry;
}

export function getLayoutAdaptive(vennConfig, { maxWidthPx, minHeightPx = 180 }) {
  const key = stableHash({
    sets:       vennConfig.sets,
    regions:    vennConfig.regions,
    variant:    vennConfig.layoutVariant || null,
    adaptive:   true,
    maxWidthPx,
    minHeightPx,
  });
  let entry = _cache.get(key);
  if (!entry) {
    entry = findOptimalLayoutWidth(vennConfig, { maxWidthPx, minHeightPx });
    _cache.set(key, entry);
  }
  return entry;
}

export function clearLayoutCache() {
  _cache.clear();
}
