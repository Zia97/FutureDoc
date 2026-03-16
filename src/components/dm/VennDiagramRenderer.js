import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Polygon,
  Text as SvgText,
} from 'react-native-svg';

const STROKE = '#e2e8f0';
const TEXT_FILL = '#e2e8f0';
const STROKE_WIDTH = 2;
const FONT_SIZE = 13;

/**
 * Layout templates define shape positions and region label positions.
 * Shapes are positioned so adjacent sets overlap visually.
 * Region label positions are the text centres for each count number.
 *
 * Supported layouts:
 *   two_overlap        — two sets, partially overlapping
 *   two_separate       — two sets, no overlap
 *   three_linear       — three sets in a row; set1∩set2, set2∩set3, set1 not ∩ set3
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

  three_linear: {
    canvasWidth: 275,
    canvasHeight: 115,
    sets: [
      { id: 'set1', cx: 58,  cy: 57, w: 88, h: 88 },
      { id: 'set2', cx: 133, cy: 57, w: 88, h: 88 },
      { id: 'set3', cx: 208, cy: 57, w: 88, h: 88 },
    ],
    regions: {
      set1_only: { x: 35,  y: 57 },
      set1_set2: { x: 96,  y: 47 },
      set2_only: { x: 133, y: 33 },
      set2_set3: { x: 170, y: 47 },
      set3_only: { x: 231, y: 57 },
      all_three: { x: 133, y: 57 },
      outside:   { x: 8,   y: 8  },
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
      set2_set3: { x: 160, y: 215 },
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
   *  set5 diamond   : cx=270 cy=120 r=65         → x:205–335  y:55–185  (inside set1, overlaps set4 & set3)
   *
   *  Labeled regions (all geometrically verified):
   *    set2_only       ( 65,  35)  set2 above set1
   *    set1_set2       ( 65, 100)  set1 ∩ set2
   *    set1_only       (140,  58)  set1 only — gap between set2 and set4
   *    set1_set4       (148, 120)  set1 ∩ set4 — left of set5
   *    set1_set4_set5  (224, 120)  set1 ∩ set4 ∩ set5 — not set3
   *    set1_set3_set5  (328, 120)  set1 ∩ set3 ∩ set5 — not set4
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
      { id: 'set5', cx: 270, cy: 120, w: 130, h: 130 },
    ],
    regions: {
      set2_only:       { x: 65,  y: 35  },
      set1_set2:       { x: 65,  y: 100 },
      set1_only:       { x: 140, y: 70  },
      set1_set4:       { x: 148, y: 120 },
      set1_set4_set5:  { x: 224, y: 120 },
      set1_set3_set5:  { x: 316, y: 133 },
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

function renderShape(shape, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  const strokeProps = {
    stroke: STROKE,
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

export function getCanvasSize(diagramLayout) {
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
  const layout = LAYOUTS[vennConfig?.diagramLayout];
  if (!layout) return null;

  const canvasW = layout.canvasWidth;
  const canvasH = layout.canvasHeight;
  const displayW = canvasW * scale;
  const displayH = canvasH * scale;

  const shapeById = {};
  (vennConfig.sets || []).forEach((s) => {
    shapeById[s.id] = s.shape;
  });

  return (
    <View>
      <Svg
        width={displayW}
        height={displayH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
      >
        {/* Draw shapes for each set */}
        {layout.sets.map((pos) => {
          const shape = shapeById[pos.id] || 'circle';
          return renderShape(shape, pos.cx, pos.cy, pos.w, pos.h);
        })}

        {/* Place labels in each region.
            Each label is rendered twice: a thick dark stroke first (halo),
            then the bright fill on top — so letters are readable on any boundary. */}
        {Object.entries(vennConfig.regions || {}).map(([regionKey, value]) => {
          if (value === undefined || value === null) return null;
          const pos = layout.regions[regionKey];
          if (!pos) return null;
          const sharedProps = {
            x: pos.x,
            y: pos.y,
            fontSize: FONT_SIZE,
            textAnchor: 'middle',
            fontWeight: '600',
          };
          return (
            <React.Fragment key={regionKey}>
              {/* Dark halo — drawn first, behind the fill */}
              <SvgText
                {...sharedProps}
                fill="#1a1a2e"
                stroke="#1a1a2e"
                strokeWidth={3}
              >
                {value}
              </SvgText>
              {/* Bright fill on top */}
              <SvgText
                {...sharedProps}
                fill={TEXT_FILL}
              >
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
