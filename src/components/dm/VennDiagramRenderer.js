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
  const STEP = 5;

  let bestX = hintX;
  let bestY = hintY;
  let bestDist = scoreCandidate(hintX, hintY, geoms, regionCheck, canvasW, canvasH);

  // Phase 1: coarse grid
  for (let gx = 0; gx <= canvasW; gx += STEP) {
    for (let gy = 0; gy <= canvasH; gy += STEP) {
      const d = scoreCandidate(gx, gy, geoms, regionCheck, canvasW, canvasH);
      if (d > bestDist) { bestDist = d; bestX = gx; bestY = gy; }
    }
  }

  // Phase 2: refine around the best coarse point at 1px resolution
  const rx0 = Math.max(0, bestX - STEP);
  const rx1 = Math.min(canvasW, bestX + STEP);
  const ry0 = Math.max(0, bestY - STEP);
  const ry1 = Math.min(canvasH, bestY + STEP);
  for (let gx = rx0; gx <= rx1; gx++) {
    for (let gy = ry0; gy <= ry1; gy++) {
      const d = scoreCandidate(gx, gy, geoms, regionCheck, canvasW, canvasH);
      if (d > bestDist) { bestDist = d; bestX = gx; bestY = gy; }
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
function computeThreeLinearLayout(shapeTypes, regionCounts) {
  const r          = 65;
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

  const dist12 = overlap12 ? (ext1 + ext2 - OVERLAP_PX) : (ext1 + ext2 + GAP_PX);
  const dist23 = overlap23 ? (ext2 + ext3 - OVERLAP_PX) : (ext2 + ext3 + GAP_PX);

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
function computeThreeAllOverlapLayout(shapeTypes, inverted = false) {
  const r          = 75;
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

  const d12 = Math.max(span12 - OVERLAP_PX, r * 0.4);
  const d13 = Math.max(span13 - OVERLAP_PX, r * 0.4);
  const d23 = Math.max(span23 - OVERLAP_PX, r * 0.4);

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
function computeTwoOverlapLayout(shapeTypes, staggered = false) {
  const r          = 75;
  const OVERLAP_PX = 55;
  const MARGIN     = 20;

  const [s1, s2] = shapeTypes;

  // Direction from set1 toward set2
  const angle = staggered ? Math.PI / 6 : 0; // 30° for staggered, 0° for horizontal
  const ext1 = rayExtentFromCenter(s1, r, angle);
  const ext2 = rayExtentFromCenter(s2, r, angle + Math.PI);
  const span = ext1 + ext2;
  const dist = Math.max(span - OVERLAP_PX, r * 0.5);

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
function computeTwoVerticalOverlapLayout(shapeTypes) {
  const r          = 75;
  const OVERLAP_PX = 55;
  const MARGIN     = 20;

  const [s1, s2] = shapeTypes;

  const ext1 = rayExtentFromCenter(s1, r, Math.PI / 2);
  const ext2 = rayExtentFromCenter(s2, r, -Math.PI / 2);
  const span = ext1 + ext2;
  const dist = Math.max(span - OVERLAP_PX, r * 0.5);

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
function computeThreeVerticalChainLayout(shapeTypes, regionCounts) {
  const r          = 60;
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

  const dist12 = overlap12 ? (ext1d + ext2u - OVERLAP_PX) : (ext1d + ext2u + GAP_PX);
  const dist23 = overlap23 ? (ext2d + ext3u - OVERLAP_PX) : (ext2d + ext3u + GAP_PX);

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

function resolveLayout(vennConfig) {
  if (!vennConfig) return null;
  const shapeTypes = (vennConfig.sets || []).map(s => s.shape || 'circle');
  if (vennConfig.diagramLayout === 'three_linear') {
    return computeThreeLinearLayout(shapeTypes, vennConfig.regions || {});
  }
  if (vennConfig.diagramLayout === 'three_all_overlap') {
    return computeThreeAllOverlapLayout(shapeTypes, false);
  }
  if (vennConfig.diagramLayout === 'three_all_overlap_v2') {
    return computeThreeAllOverlapLayout(shapeTypes, true);
  }
  if (vennConfig.diagramLayout === 'two_overlap') {
    return computeTwoOverlapLayout(shapeTypes, false);
  }
  if (vennConfig.diagramLayout === 'two_overlap_staggered') {
    return computeTwoOverlapLayout(shapeTypes, true);
  }
  if (vennConfig.diagramLayout === 'two_vertical_overlap') {
    return computeTwoVerticalOverlapLayout(shapeTypes);
  }
  if (vennConfig.diagramLayout === 'three_vertical_chain') {
    return computeThreeVerticalChainLayout(shapeTypes, vennConfig.regions || {});
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
]);

export function getCanvasSize(diagramLayout, vennConfig) {
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

  const layout = resolveLayout(vennConfig);
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
  const labelPlacements = useMemo(() => {
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
    return placements;
  }, [vennConfig]);

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
