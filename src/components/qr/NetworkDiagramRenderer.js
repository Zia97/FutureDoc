import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';

const DEFAULT_VW = 360;
const VH = 260;
const M = { top: 10, right: 16, bottom: 10, left: 16 };
const CH = VH - M.top - M.bottom;

const NODE_R = 6;

export default function NetworkDiagramRenderer({ data }) {
  const { theme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  const [svgWidth, setSvgWidth] = useState(DEFAULT_VW);
  const fz = (n) => Math.round(n * svgMultiplier);
  const VW = svgWidth;
  const CW = VW - M.left - M.right;
  const NODE_FILL = t.accent;
  const NODE_STROKE = t.bgCard;
  const EDGE_COLOR = t.borderStrong;
  const LABEL_COLOR = t.text;
  const EDGE_LABEL_COLOR = t.text;
  const { nodes = [], edges = [], note } = data;

  function px(frac) {
    return frac * CW;
  }
  function py(frac) {
    return frac * CH;
  }

  // Build a lookup for node positions
  const nodeMap = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = { x: px(n.x), y: py(n.y) };
  });

  return (
    <View onLayout={(e) => setSvgWidth(e.nativeEvent.layout.width)}>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <Svg
        width={VW}
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <G x={M.left} y={M.top}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            // Offset label perpendicular to the edge so it doesn't overlap the line
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const offsetX = (-dy / len) * 10;
            const offsetY = (dx / len) * 10;

            return (
              <G key={`edge-${i}`}>
                <Line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={EDGE_COLOR}
                  strokeWidth={1.5}
                />
                {edge.label && (
                  <SvgText
                    x={midX + offsetX}
                    y={midY + offsetY}
                    fontSize={fz(10)}
                    fontWeight="600"
                    fill={EDGE_LABEL_COLOR}
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    {edge.label}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const cx = px(node.x);
            const cy = py(node.y);

            // Place label above node by default, below if near top
            const labelY = node.y < 0.15 ? cy + NODE_R + 12 : cy - NODE_R - 6;

            return (
              <G key={node.id}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  fill={NODE_FILL}
                  stroke={NODE_STROKE}
                  strokeWidth={1.5}
                />
                <SvgText
                  x={cx}
                  y={labelY}
                  fontSize={fz(10)}
                  fontWeight="700"
                  fill={LABEL_COLOR}
                  textAnchor="middle"
                >
                  {node.label}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* Note at bottom */}
        {note && (
          <SvgText
            x={VW / 2}
            y={VH - 4}
            fontSize={fz(10)}
            fill={t.text}
            textAnchor="middle"
          >
            {note}
          </SvgText>
        )}
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
