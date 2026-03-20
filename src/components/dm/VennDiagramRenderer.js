import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const STROKE_WIDTH = 2;
const FONT_SIZE = 13;
const MIN_OUTLINE_CLEARANCE = 10; // minimum px from label centre to any shape outline

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
 * Returns a string representing which shapes contain the point, e.g. "10110".
 * Used to ensure a nudged label stays in the same logical region.
 */
function regionMembership(px, py, geoms) {
  return geoms.map(g => (isPointInsideShape(px, py, g) ? '1' : '0')).join('');
}

/**
 * Given a preferred label position, return a position that is:
 *   1. at least `clearance` px from every shape outline, AND
 *   2. in the same logical region (same set of containing shapes) as the original.
 *
 * IMPORTANT: `x` and `y` must be the visual centre of the text (i.e. the SVG
 * element should use dominantBaseline="central"), so the clearance check is
 * geometrically accurate — not offset by the SVG text baseline.
 *
 * If no candidate satisfies both constraints within the search radius, returns
 * the candidate with the best (maximum) clearance that is still in the correct
 * region, rather than falling back to the original position.
 */
function safeLabelPos(x, y, geoms, clearance) {
  if (minDistToAllOutlines(x, y, geoms) >= clearance) return { x, y };

  const targetRegion = regionMembership(x, y, geoms);
  const DIRS = 16;
  const angles = Array.from({ length: DIRS }, (_, i) => (i * 2 * Math.PI) / DIRS);

  let bestPos = null;
  let bestDist = -1;

  for (let step = 3; step <= 60; step += 3) {
    for (const angle of angles) {
      const cx = x + Math.cos(angle) * step;
      const cy = y + Math.sin(angle) * step;
      if (regionMembership(cx, cy, geoms) !== targetRegion) continue;
      const d = minDistToAllOutlines(cx, cy, geoms);
      if (d >= clearance) return { x: cx, y: cy };
      if (d > bestDist) { bestDist = d; bestPos = { x: cx, y: cy }; }
    }
  }

  // Full clearance unachievable in this region (narrow sliver) — use the
  // best position found rather than the original.
  return bestPos ?? { x, y };
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
    case 'triangle': return r * 0.5;                  // pointed top; cx±r/2 at cy
    case 'pentagon': return r * Math.cos(Math.PI / 5); // ≈ 0.81r
    default:         return r;                         // circle, square, rectangle, diamond
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
  const r          = 44;
  const cy         = 57;
  const CANVAS_W   = 320;
  const CANVAS_H   = 115;
  const OVERLAP_PX = 18; // visible overlap depth
  const GAP_PX     = 14; // visible gap between non-overlapping shapes

  const [s1, s2, s3] = shapeTypes;
  const ext1 = shapeExtentAtCenter(s1, r);
  const ext2 = shapeExtentAtCenter(s2, r);
  const ext3 = shapeExtentAtCenter(s3, r);

  const overlap12 = (regionCounts['set1_set2'] ?? 0) > 0;
  const overlap23 = (regionCounts['set2_set3'] ?? 0) > 0;

  const dist12 = overlap12 ? (ext1 + ext2 - OVERLAP_PX) : (ext1 + ext2 + GAP_PX);
  const dist23 = overlap23 ? (ext2 + ext3 - OVERLAP_PX) : (ext2 + ext3 + GAP_PX);

  // Centre the arrangement horizontally within the fixed canvas.
  const totalWidth = dist12 + dist23 + 2 * r;
  const cx1 = Math.round((CANVAS_W - totalWidth) / 2 + r);
  const cx2 = cx1 + dist12;
  const cx3 = cx2 + dist23;

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
    outside:   { x: 8,                                            y: 8  },
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
// Static layout templates
// ---------------------------------------------------------------------------

/**
 * Layout templates define shape positions and region label positions.
 * Shapes are positioned so adjacent sets overlap visually.
 * Region label positions are the text centres for each count number.
 *
 * Supported layouts:
 *   two_overlap        — two sets, partially overlapping
 *   two_separate       — two sets, no overlap
 *   three_linear       — DYNAMIC: see computeThreeLinearLayout above
 *   three_all_overlap  — three sets, all pairwise overlaps + centre
 *   three_one_separate — set1∩set2; set3 separate
 *   five_complex       — 5 shapes: large rectangle (set1), square overlapping top-left (set2),
 *                        triangle overlapping right (set3), circle inside set1 (set4),
 *                        diamond inside set1 overlapping set4 and set3 (set5).
 *                        Region keys are descriptive: set2_only, set1_set2, set1_only,
 *                        set1_set4, set1_set4_set5, set1_set3_set5, set3_only.
 */
const LAYOUTS = {
  two_overlap: {
    canvasWidth: 210,
    canvasHeight: 110,
    sets: [
      { id: 'set1', cx: 72,  cy: 55, w: 90, h: 90 },
      { id: 'set2', cx: 138, cy: 55, w: 90, h: 90 },
    ],
    regions: {
      set1_only: { x: 42,  y: 55 },
      set2_only: { x: 168, y: 55 },
      set1_set2: { x: 105, y: 55 },
      outside:   { x: 8,   y: 10 },
    },
  },

  two_separate: {
    canvasWidth: 230,
    canvasHeight: 110,
    sets: [
      { id: 'set1', cx: 65,  cy: 55, w: 90, h: 90 },
      { id: 'set2', cx: 165, cy: 55, w: 90, h: 90 },
    ],
    regions: {
      set1_only: { x: 65,  y: 55 },
      set2_only: { x: 165, y: 55 },
      outside:   { x: 8,   y: 10 },
    },
  },

  three_all_overlap: {
    // Large shapes (r=100), close centres (side≈80) so every region is spacious.
    // set1 (top): cx=160 cy=110
    // set2 (BL):  cx=120 cy=179   dist to set1 ≈ 80
    // set3 (BR):  cx=200 cy=179   dist to set2 = 80
    // Centroid ≈ (160,156) — dist to each centre ≈46px, giving 37–54px margin
    // inside even the tightest shape (diamond inscribed-r ≈71px). Verified geometrically.
    canvasWidth: 310,
    canvasHeight: 300,
    sets: [
      { id: 'set1', cx: 160, cy: 110, w: 200, h: 200 },
      { id: 'set2', cx: 120, cy: 179, w: 200, h: 200 },
      { id: 'set3', cx: 200, cy: 179, w: 200, h: 200 },
    ],
    regions: {
      set1_only: { x: 160, y: 50  },
      set2_only: { x: 75,  y: 212 },
      set3_only: { x: 245, y: 212 },
      set1_set2: { x: 110, y: 130 },
      set1_set3: { x: 230, y: 145 },
      set2_set3: { x: 160, y: 228 },
      all_three: { x: 175, y: 156 },
      outside:   { x: 10,  y: 12  },
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
      outside:         { x: 12,  y: 12  },
    },
  },

  three_one_separate: {
    canvasWidth: 280,
    canvasHeight: 110,
    sets: [
      { id: 'set1', cx: 65,  cy: 55, w: 88, h: 88 },
      { id: 'set2', cx: 135, cy: 55, w: 88, h: 88 },
      { id: 'set3', cx: 218, cy: 55, w: 88, h: 88 },
    ],
    regions: {
      set1_only: { x: 42,  y: 55 },
      set1_set2: { x: 100, y: 47 },
      set2_only: { x: 158, y: 55 },
      set3_only: { x: 218, y: 55 },
      outside:   { x: 8,   y: 8  },
    },
  },
};

function renderShape(shape, cx, cy, w, h, stroke) {
  const r = Math.min(w, h) / 2;
  const strokeProps = {
    stroke: stroke,
    strokeWidth: STROKE_WIDTH,
    fill: 'none',
  };

  switch (shape) {
    case 'circle':
      return <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} {...strokeProps} />;

    case 'square':
    case 'rectangle':
      return (
        <Rect
          key={`${cx}-${cy}`}
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
      return <Polygon key={`${cx}-${cy}`} points={pts} {...strokeProps} />;
    }

    case 'pentagon': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      }).join(' ');
      return <Polygon key={`${cx}-${cy}`} points={pts} {...strokeProps} />;
    }

    case 'diamond': {
      const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
      return <Polygon key={`${cx}-${cy}`} points={pts} {...strokeProps} />;
    }

    default:
      return <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} {...strokeProps} />;
  }
}

function resolveLayout(vennConfig) {
  if (!vennConfig) return null;
  if (vennConfig.diagramLayout === 'three_linear') {
    const shapeTypes = (vennConfig.sets || []).map(s => s.shape || 'circle');
    return computeThreeLinearLayout(shapeTypes, vennConfig.regions || {});
  }
  return LAYOUTS[vennConfig.diagramLayout] ?? null;
}

export function getCanvasSize(diagramLayout, vennConfig) {
  if (diagramLayout === 'three_linear') {
    // Use the dynamic layout if a full config is available; otherwise return
    // the fixed canvas size that all three_linear variants share.
    if (vennConfig) {
      const layout = resolveLayout(vennConfig);
      return { width: layout.canvasWidth, height: layout.canvasHeight };
    }
    return { width: 320, height: 115 };
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

  return (
    <View>
      <Svg
        width={displayW}
        height={displayH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
      >
        {layout.sets.map((pos) => {
          const shape = shapeById[pos.id] || 'circle';
          return renderShape(shape, pos.cx, pos.cy, pos.w, pos.h, STROKE);
        })}

        {Object.entries(vennConfig.regions || {}).map(([regionKey, value]) => {
          if (value === undefined || value === null) return null;
          const rawPos = layout.regions[regionKey];
          if (!rawPos) return null;
          const pos = safeLabelPos(rawPos.x, rawPos.y, shapeGeoms, MIN_OUTLINE_CLEARANCE);
          const sharedProps = {
            x: pos.x,
            y: pos.y,
            fontSize: FONT_SIZE,
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
