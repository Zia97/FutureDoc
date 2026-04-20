import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Polygon as SvgPolygon,
  Ellipse,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { bakeCached } from '../../utils/venn/bake';

const STROKE_WIDTH = 2;
// Cap on rendered diagram height as a fraction of the screen height so a tall
// natural canvas never scrolls off-screen even when the user has scrolled to it.
const MAX_HEIGHT_FRACTION = 0.55;

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
      ? bakeCached(vennConfig, { targetWidthPx: widthPx })
      : bakeCached(vennConfig);
    return baked.canvas;
  } catch {
    return { width: widthPx || 240, height: 200 };
  }
}

// Props:
//   vennConfig — required, the abstract spec
//   widthPx    — preferred. The pixel width the diagram should occupy on
//                screen. Baker scales shapes to fit; font sizes are real
//                display pixels (no shrinkage at render time).
//   scale      — legacy. Used only when widthPx is not provided.
//
// When `widthPx` is provided we try a strict pixel-targeted bake first. Some
// dense topologies (e.g. 5+ set diagrams with triple-overlap regions) can't
// satisfy the 12 px label floor at narrow on-screen widths; in that case we
// fall back to the natural-scale bake and shrink-fit it to widthPx (same
// behaviour as before). The user can still tap-to-expand to read tight labels.
export default function VennDiagramRenderer({ vennConfig, widthPx, scale = 1 }) {
  const { practiceTheme: t } = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const maxHeightPx = screenHeight * MAX_HEIGHT_FRACTION;

  const baked = useMemo(() => {
    if (widthPx) {
      try {
        return { entry: bakeCached(vennConfig, { targetWidthPx: widthPx }), fitMode: 'pixel' };
      } catch {
        // Fall through to natural-scale fallback
      }
    }
    try {
      return { entry: bakeCached(vennConfig), fitMode: widthPx ? 'fallback' : 'scale' };
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[VennDiagramRenderer] bake failed:', err.message);
      }
      return null;
    }
  }, [vennConfig, widthPx]);

  if (!baked) return null;
  const { entry, fitMode } = baked;
  const { canvas, shapes, labels } = entry;

  // Display dimensions:
  //   pixel    → canvas already in display px; cap height to viewport
  //   fallback → shrink natural canvas to widthPx, also cap height
  //   scale    → legacy scale prop
  let w, h;
  if (fitMode === 'pixel') {
    w = canvas.width;
    h = canvas.height;
    if (h > maxHeightPx) {
      const heightScale = maxHeightPx / h;
      w = w * heightScale;
      h = maxHeightPx;
    }
  } else if (fitMode === 'fallback') {
    const widthScale  = Math.min(1, widthPx / canvas.width);
    const heightScale = Math.min(1, maxHeightPx / canvas.height);
    const fitScale    = Math.min(widthScale, heightScale);
    w = canvas.width * fitScale;
    h = canvas.height * fitScale;
  } else {
    w = canvas.width  * scale;
    h = canvas.height * scale;
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
            fill={t.text}
            fontSize={lbl.fontSize}
            fontWeight="600"
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
