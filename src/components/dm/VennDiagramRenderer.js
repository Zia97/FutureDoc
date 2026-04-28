import React, { useMemo } from 'react';
import { View } from 'react-native';
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
  const props = { stroke, strokeWidth: STROKE_WIDTH, fill: 'none' };
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
//   widthPx    — maximum display width. The adaptive baker finds the minimum
//                width at which all labels reach 12 px, up to this cap.
//                Simple diagrams stay compact; dense ones grow to the cap.
//   scale      — legacy. Used only when widthPx is not provided.
export default function VennDiagramRenderer({ vennConfig, widthPx, bakedGeometry, scale = 1 }) {
  const { practiceTheme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  // Use a gentler multiplier than other diagrams since the baker tuned label
  // size to fit inside regions; too much growth would cause overlap.
  const vennLabelMultiplier = 1 + (svgMultiplier - 1) * 0.5;

  const baked = useMemo(() => {
    if (bakedGeometry) return bakedGeometry;
    if (widthPx) {
      try {
        return getLayoutAdaptive(vennConfig, { maxWidthPx: widthPx });
      } catch (err) {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[VennDiagramRenderer] adaptive bake failed:', err.message);
        }
      }
    }
    try {
      return getLayout(vennConfig);
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[VennDiagramRenderer] bake failed:', err.message);
      }
      return null;
    }
  }, [vennConfig, widthPx, bakedGeometry]);

  if (!baked) return null;
  const { canvas, shapes, labels } = baked;

  // Render at the exact canvas dimensions the baker produced — height grows
  // freely so labels stay at the size the adaptive bake calculated.
  // Only cap width (never exceed the available panel width).
  let w = canvas.width;
  let h = canvas.height;
  if (widthPx && w > widthPx) {
    const s = widthPx / w;
    w = widthPx;
    h = h * s;
  }
  if (!widthPx) {
    w = w * scale;
    h = h * scale;
  }

  return (
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
            fontSize={Math.round(lbl.fontSize * vennLabelMultiplier)}
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
}
