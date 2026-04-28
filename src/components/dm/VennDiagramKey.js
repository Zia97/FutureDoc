import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Polygon, Ellipse } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { shapeToSvgSpec } from '../../utils/venn/shapes';

const SIZE = 30;
const MID = SIZE / 2;
const STROKE_W = 2;

// Per-shape (w, h) to pass into `shapeToSvgSpec` so the key swatch renders the
// shape at its natural visual aspect inside a `SIZE × SIZE` box. Shapes with
// internal stretching inside `shapeToSvgSpec` / `shapeToPolygon` (strips,
// rectangle, parallelogram, arrows) are handed a roughly square input — the
// stretch is applied inside those helpers so the same factor is used in the
// diagram and the key. Inputs are scaled down from SIZE so the stretched
// result still fits within the SIZE × SIZE swatch.
function keyDims(shape) {
  switch (shape) {
    case 'horizontal_strip':
      return { w: SIZE / 1.4, h: SIZE };
    case 'vertical_strip':
      return { w: SIZE, h: SIZE / 1.4 };
    case 'right_arrow':
    case 'left_arrow':
      return { w: SIZE * 0.95, h: SIZE * 0.8 };
    default:
      // `rectangle` relies on shapeToSvgSpec applying its 0.63 height squash;
      // `parallelogram` relies on shapeToPolygon's internal ±0.85/±0.6 skew.
      return { w: SIZE * 0.9, h: SIZE * 0.9 };
  }
}

// Draws the same shape the baker drew, reusing `shapeToSvgSpec` so the key and
// diagram can never drift. Any shape supported by `shapeToPolygon`/
// `shapeToSvgSpec` in `src/utils/venn/shapes.js` is automatically supported
// here.
function KeyShape({ shape, stroke }) {
  const { w, h } = keyDims(shape);
  const spec = shapeToSvgSpec(shape, MID, MID, w, h, 0);
  const props = { stroke, strokeWidth: STROKE_W, fill: 'none' };
  switch (spec.kind) {
    case 'circle':
      return <Circle cx={spec.cx} cy={spec.cy} r={spec.r} {...props} />;
    case 'ellipse':
      return <Ellipse cx={spec.cx} cy={spec.cy} rx={spec.rx} ry={spec.ry} {...props} />;
    case 'rect':
      return <Rect x={spec.x} y={spec.y} width={spec.width} height={spec.height} {...props} />;
    case 'polygon':
      return <Polygon points={spec.points.map(p => `${p[0]},${p[1]}`).join(' ')} {...props} />;
    default:
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn(`[VennDiagramKey] unsupported shape "${shape}" — falling back to circle`);
      }
      return <Circle cx={MID} cy={MID} r={SIZE * 0.4} {...props} />;
  }
}

export default function VennDiagramKey({ sets }) {
  const { practiceTheme: t } = useTheme();
  const { multiplier } = useTextSize();
  const itemLabelScaled = {
    fontSize: Math.round(styles.itemLabel.fontSize * multiplier),
  };

  if (!sets || sets.length === 0) return null;

  // When every set uses the same shape (e.g. three circles), the legend adds
  // no information — the student can't tell the circles apart via the key.
  // In this case the diagram itself carries per-shape labels (handled by the
  // baker), and the legend is suppressed.
  const shapes = sets.map((s) => s.shape || 'circle');
  if (shapes.length > 1 && new Set(shapes).size === 1) return null;

  return (
    <View style={[styles.container, { backgroundColor: t.bgCard, borderColor: t.border }]}>
      <Text style={[styles.keyLabel, { color: t.textSecondary }]}>Key</Text>
      <View style={styles.items}>
        {sets.map((s) => (
          <View key={s.id} style={styles.item}>
            <Svg width={SIZE} height={SIZE}>
              <KeyShape shape={s.shape || 'circle'} stroke={t.text} />
            </Svg>
            <Text style={[styles.itemLabel, itemLabelScaled, { color: t.text }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
