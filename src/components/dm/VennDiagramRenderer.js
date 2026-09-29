import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Polygon as SvgPolygon,
  Ellipse,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { getLayout, getLayoutAdaptive } from '../../utils/venn/layout';

const STROKE_WIDTH = 2;

function ShapeMark({ shape, stroke }) {
  const props = { stroke, strokeWidth: STROKE_WIDTH, fill: 'none',
    strokeDasharray: shape.strokeDasharray, strokeLinejoin: 'round' };
  switch (shape.kind) {
    case 'circle':
      return <Circle cx={shape.cx} cy={shape.cy} r={shape.r} {...props} />;
    case 'ellipse':
      return <Ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} {...props} />;
    case 'rect':
      return <Rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...props} />;
    case 'polygon':
      return <SvgPolygon points={shape.points.map(p => `${p[0]},${p[1]}`).join(' ')} {...props} />;
    default:
      return null;
  }
}

export function getCanvasSize(_layoutName, vennConfig, widthPx) {
  if (!vennConfig) return { width: 240, height: 200 };
  try {
    const baked = widthPx
      ? getLayout(vennConfig, { targetWidthPx: widthPx })
      : getLayout(vennConfig);
    return baked.canvas;
  } catch {
    return { width: widthPx || 240, height: 200 };
  }
}

// Props:
//   vennConfig — required, the abstract spec
//   widthPx    — available viewport width. V2 diagrams scroll if their readable
//                canvas is wider. Legacy diagrams use the adaptive fit.
//   scale      — legacy. Used only when widthPx is not provided.
//   zoom       — V2 only. Enlarges the scrollable canvas and all its labels.
export default function VennDiagramRenderer({ vennConfig, widthPx, bakedGeometry, scale = 1, zoom = 1 }) {
  const { practiceTheme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  // Use a gentler multiplier than other diagrams since the baker tuned label
  // size to fit inside regions; too much growth would cause overlap.
  const vennLabelMultiplier = 1 + (svgMultiplier - 1) * 0.5;
  const isExplicit = vennConfig?.schemaVersion === 2;

  const baked = useMemo(() => {
    // Legacy bakes can be stale after content edits. V2 always derives from
    // its saved shape geometry, with a cache keyed by geometry AND values.
    if (bakedGeometry && !isExplicit) return bakedGeometry;
    if (widthPx) {
      try {
        return getLayoutAdaptive(vennConfig, { maxWidthPx: widthPx,
          fontScale: isExplicit ? Math.max(1, vennLabelMultiplier) : 1 });
      } catch (err) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[VennDiagramRenderer] adaptive bake failed:', err.message);
        }
      }
    }
    try {
      return getLayout(vennConfig, isExplicit ? { fontScale: Math.max(1, vennLabelMultiplier) } : {});
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[VennDiagramRenderer] bake failed:', err.message);
      }
      return null;
    }
  }, [vennConfig, widthPx, bakedGeometry, isExplicit, vennLabelMultiplier]);

  if (!baked) return <Text style={{ color: t.textSecondary }}>This diagram could not be displayed.</Text>;
  const { canvas, shapes, labels } = baked;

  // V2 uses the computed readable canvas. Legacy diagrams retain their fit.
  let w = canvas.width;
  let h = canvas.height;
  if (!isExplicit && widthPx && w > widthPx) {
    const s = widthPx / w;
    w = widthPx;
    h = h * s;
  }
  if (isExplicit) {
    const displayZoom = Math.max(1, Math.min(3, zoom));
    w *= displayZoom;
    h *= displayZoom;
  } else if (!widthPx) {
    w = w * scale;
    h = h * scale;
  }

  const diagram = (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${canvas.width} ${canvas.height}`}>
        {shapes.map(shape => (
          <ShapeMark key={shape.id} shape={shape} stroke={t.text} />
        ))}
        {labels.map((lbl, i) => (
          <SvgText
            key={`${lbl.region}-${i}`}
            x={lbl.x}
            y={lbl.y}
            fill={lbl.kind === 'set' ? t.textSecondary : t.text}
            fontSize={isExplicit ? lbl.fontSize : Math.round(lbl.fontSize * vennLabelMultiplier)}
            fontWeight={lbl.kind === 'set' ? '500' : '600'}
            fontStyle={lbl.kind === 'set' ? 'italic' : 'normal'}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {lbl.text}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
  if (!isExplicit || !widthPx || w <= widthPx) return diagram;
  return (
    <View style={{ width: widthPx }}>
      <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator
        style={{ width: widthPx }} accessibilityLabel="Scrollable set diagram">
        {diagram}
      </ScrollView>
      <Text style={{ color: t.textSecondary, fontSize: 12, paddingTop: 6 }}>
        Swipe sideways to see the full diagram
      </Text>
    </View>
  );
}
