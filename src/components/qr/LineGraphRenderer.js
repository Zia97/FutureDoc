import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Polyline, Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 240;
const M = { top: 20, right: 20, bottom: 62, left: 54 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

function computeYAxis(allValues, tickCount = 5) {
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const span = dataMax - dataMin || dataMax;
  const rawMin = Math.max(0, Math.floor((dataMin - span * 0.15) / 10) * 10);
  const rawMax = Math.ceil((dataMax + span * 0.1) / 10) * 10;
  const tickStep = (rawMax - rawMin) / tickCount;
  return { yMin: rawMin, yMax: rawMax, tickStep };
}

export default function LineGraphRenderer({ data }) {
  const [selected, setSelected] = useState(null);
  const [svgWidth, setSvgWidth] = useState(VW);
  const { labels, series, yAxisLabel, unit = '' } = data;
  const numPoints = labels.length;

  const allValues = series.flatMap((s) => s.values).filter((v) => v != null);
  const { yMin, yMax, tickStep } = computeYAxis(allValues);
  const range = yMax - yMin;
  const tickCount = Math.round(range / tickStep);

  function xPos(i) {
    return (i / (numPoints - 1)) * CW;
  }

  function yPos(val) {
    return CH - ((val - yMin) / range) * CH;
  }

  function handleTap(e) {
    const { locationX, locationY } = e.nativeEvent;
    const scale = svgWidth / VW;
    const cx = locationX / scale - M.left;
    const cy = locationY / scale - M.top;

    let closest = null;
    let minDist = 30 / scale;
    series.forEach((s, si) => {
      s.values.forEach((v, i) => {
        if (v == null) return;
        const px = xPos(i);
        const py = yPos(v);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = { si, pi: i, val: v, cx: px, cy: py };
        }
      });
    });
    setSelected(closest);
  }

  return (
    <View>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
      <Pressable onPress={handleTap} onLayout={(e) => setSvgWidth(e.nativeEvent.layout.width)}>
        <Svg
          width="100%"
          height={VH}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <G x={M.left} y={M.top}>
            {/* Gridlines & Y-axis ticks */}
            {Array.from({ length: tickCount + 1 }, (_, i) => {
              const val = yMin + i * tickStep;
              const y = yPos(val);
              return (
                <G key={i}>
                  <Line
                    x1={0} y1={y} x2={CW} y2={y}
                    stroke="#2d3748" strokeWidth={0.7}
                  />
                  <SvgText x={-5} y={y + 4} fontSize={11} fill="#718096" textAnchor="end">
                    {unit}{Math.round(val)}
                  </SvgText>
                </G>
              );
            })}

            {/* Y-axis label */}
            {yAxisLabel && (
              <SvgText
                x={-40} y={CH / 2} fontSize={10} fill="#a0aec0"
                textAnchor="middle" rotation="-90"
                originX={-40} originY={CH / 2}
              >
                {yAxisLabel}
              </SvgText>
            )}

            {/* X-axis labels */}
            {labels.map((label, i) => (
              <SvgText
                key={i} x={xPos(i)} y={CH + 16}
                fontSize={11} fill="#a0aec0" textAnchor="middle"
              >
                {label}
              </SvgText>
            ))}

            {/* Lines & data points */}
            {series.map((s, si) => {
              const color = COLORS[si % COLORS.length];
              const segments = [];
              let seg = [];
              s.values.forEach((v, i) => {
                if (v != null) {
                  seg.push(`${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`);
                } else if (seg.length) {
                  segments.push(seg);
                  seg = [];
                }
              });
              if (seg.length) segments.push(seg);
              return (
                <G key={s.name}>
                  {segments.map((pts, idx) => (
                    <Polyline key={idx} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} />
                  ))}
                  {s.values.map((v, i) => {
                    if (v == null) return null;
                    return (
                      <Circle key={i} cx={xPos(i)} cy={yPos(v)} r={5}
                              fill={color} stroke="#1a1a2e" strokeWidth={1} />
                    );
                  })}
                </G>
              );
            })}

            {/* Axes */}
            <Line x1={0} y1={0} x2={0} y2={CH} stroke="#4a5568" strokeWidth={1} />
            <Line x1={0} y1={CH} x2={CW} y2={CH} stroke="#4a5568" strokeWidth={1} />

            {/* Tooltip */}
            {selected && (() => {
              const text = `${unit}${selected.val.toLocaleString()}`;
              const tw = Math.max(38, text.length * 8 + 14);
              const th = 24;
              const above = selected.cy > th + 14;
              const tx = Math.max(tw / 2, Math.min(CW - tw / 2, selected.cx));
              const ty = above ? selected.cy - 12 - th : selected.cy + 12;
              return (
                <G>
                  <Rect x={tx - tw / 2} y={ty} width={tw} height={th} rx={6}
                        fill="#1a202c" stroke="#4a5568" strokeWidth={0.8} />
                  <SvgText x={tx} y={ty + th / 2 + 4} fontSize={12} fill="#e2e8f0"
                           textAnchor="middle" fontWeight="600">
                    {text}
                  </SvgText>
                </G>
              );
            })()}
          </G>

          {/* Legend */}
          {series.length > 1 &&
            series.map((s, si) => {
              const color = COLORS[si % COLORS.length];
              return (
                <G key={s.name} x={M.left + si * 125} y={VH - 10}>
                  <Line x1={0} y1={-4} x2={16} y2={-4} stroke={color} strokeWidth={2} />
                  <Circle cx={8} cy={-4} r={5} fill={color} />
                  <SvgText x={20} y={0} fontSize={11} fill="#a0aec0">
                    {s.name}
                  </SvgText>
                </G>
              );
            })}
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#90cdf4',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
});
