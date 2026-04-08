import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Circle, Ellipse, Polygon, Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_VW = 300;
const DEFAULT_VH = 220;
const DIM_COLOR = '#f6ad55';
const CAP_SIZE = 4; // end-cap length for dimension arrows

export default function GeometryDiagramRenderer({ data }) {
  const { theme: t } = useTheme();
  const SHAPE_STROKE = t.text;
  const DIM_TEXT_COLOR = t.text;
  const { shapes = [], dimensions = [] } = data;
  const vw = data.viewBox?.width || DEFAULT_VW;
  const vh = data.viewBox?.height || DEFAULT_VH;

  function renderShape(shape, i) {
    const common = {
      fill: shape.fill || 'none',
      stroke: shape.stroke || SHAPE_STROKE,
      strokeWidth: shape.strokeWidth || 1.2,
      ...(shape.strokeDasharray ? { strokeDasharray: shape.strokeDasharray } : {}),
    };

    switch (shape.type) {
      case 'rect':
        return (
          <Rect
            key={i}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx || 0}
            {...common}
          />
        );

      case 'line':
        return (
          <Line
            key={i}
            x1={shape.x1}
            y1={shape.y1}
            x2={shape.x2}
            y2={shape.y2}
            {...common}
          />
        );

      case 'circle':
        return (
          <Circle
            key={i}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            {...common}
          />
        );

      case 'ellipse':
        return (
          <Ellipse
            key={i}
            cx={shape.cx}
            cy={shape.cy}
            rx={shape.rx}
            ry={shape.ry}
            {...common}
          />
        );

      case 'polygon': {
        const pts = shape.points.map((p) => p.join(',')).join(' ');
        return <Polygon key={i} points={pts} {...common} />;
      }

      case 'arc': {
        const {
          cx, cy, r,
          startAngle = 0,
          endAngle = 180,
        } = shape;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
        return <Path key={i} d={d} {...common} />;
      }

      default:
        return null;
    }
  }

  function renderDimension(dim, i) {
    const [x1, y1] = dim.from;
    const [x2, y2] = dim.to;

    // Direction vector of the dimension line
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Perpendicular unit vector for end-caps
    const px = -dy / len;
    const py = dx / len;

    // Text position: offset to the specified side
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const side = dim.side || 'top';
    let textOffX = 0;
    let textOffY = 0;
    const TEXT_OFF = 10;

    switch (side) {
      case 'top':
        textOffY = -TEXT_OFF;
        break;
      case 'bottom':
        textOffY = TEXT_OFF + 4;
        break;
      case 'left':
        textOffX = -TEXT_OFF - 2;
        break;
      case 'right':
        textOffX = TEXT_OFF + 2;
        break;
    }

    const textAnchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';

    return (
      <G key={`dim-${i}`}>
        {/* Main dimension line */}
        <Line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={DIM_COLOR}
          strokeWidth={0.8}
        />
        {/* End cap at start */}
        <Line
          x1={x1 - px * CAP_SIZE} y1={y1 - py * CAP_SIZE}
          x2={x1 + px * CAP_SIZE} y2={y1 + py * CAP_SIZE}
          stroke={DIM_COLOR}
          strokeWidth={0.8}
        />
        {/* End cap at end */}
        <Line
          x1={x2 - px * CAP_SIZE} y1={y2 - py * CAP_SIZE}
          x2={x2 + px * CAP_SIZE} y2={y2 + py * CAP_SIZE}
          stroke={DIM_COLOR}
          strokeWidth={0.8}
        />
        {/* Label */}
        <SvgText
          x={midX + textOffX}
          y={midY + textOffY}
          fontSize={10}
          fontWeight="600"
          fill={DIM_TEXT_COLOR}
          textAnchor={textAnchor}
          alignmentBaseline="central"
        >
          {dim.label}
        </SvgText>
      </G>
    );
  }

  return (
    <View>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <Svg
        width="100%"
        height={vh}
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Shapes */}
        {shapes.map(renderShape)}

        {/* Dimension labels */}
        {dimensions.map(renderDimension)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
});
