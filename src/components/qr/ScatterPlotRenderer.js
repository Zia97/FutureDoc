import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 240;
const M = { top: 20, right: 20, bottom: 62, left: 54 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

function niceAxis(min, max, tickCount = 5) {
  const span = max - min || max || 1;
  const rawMin = Math.floor((min - span * 0.1) / 10) * 10;
  const rawMax = Math.ceil((max + span * 0.1) / 10) * 10;
  const step = (rawMax - rawMin) / tickCount;
  return { axisMin: rawMin, axisMax: rawMax, step };
}

export default function ScatterPlotRenderer({ data }) {
  const [selected, setSelected] = useState(null);
  const [svgWidth, setSvgWidth] = useState(VW);
  const { series, xAxisLabel, yAxisLabel } = data;

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series.flatMap((s) => s.points.map((p) => p.y));

  const { axisMin: xMin, axisMax: xMax, step: xStep } = niceAxis(
    Math.min(...allX),
    Math.max(...allX)
  );
  const { axisMin: yMin, axisMax: yMax, step: yStep } = niceAxis(
    Math.min(...allY),
    Math.max(...allY)
  );

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xTickCount = Math.round(xRange / xStep);
  const yTickCount = Math.round(yRange / yStep);

  function xPos(val) {
    return ((val - xMin) / xRange) * CW;
  }

  function yPos(val) {
    return CH - ((val - yMin) / yRange) * CH;
  }

  function handleTap(e) {
    const { locationX, locationY } = e.nativeEvent;
    const scale = svgWidth / VW;
    const cx = locationX / scale - M.left;
    const cy = locationY / scale - M.top;

    let closest = null;
    let minDist = 30 / scale;
    series.forEach((s, si) => {
      s.points.forEach((p, pi) => {
        const px = xPos(p.x);
        const py = yPos(p.y);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = { si, pi, x: p.x, y: p.y, label: p.label, cx: px, cy: py };
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
            {/* Y gridlines and ticks */}
            {Array.from({ length: yTickCount + 1 }, (_, i) => {
              const val = yMin + i * yStep;
              const y = yPos(val);
              return (
                <G key={`yt-${i}`}>
                  <Line x1={0} y1={y} x2={CW} y2={y} stroke="#2d3748" strokeWidth={0.7} />
                  <SvgText x={-5} y={y + 4} fontSize={11} fill="#718096" textAnchor="end">
                    {Math.round(val)}
                  </SvgText>
                </G>
              );
            })}

            {/* X gridlines and ticks */}
            {Array.from({ length: xTickCount + 1 }, (_, i) => {
              const val = xMin + i * xStep;
              const x = xPos(val);
              return (
                <G key={`xt-${i}`}>
                  <Line x1={x} y1={0} x2={x} y2={CH} stroke="#2d3748" strokeWidth={0.7} />
                  <SvgText x={x} y={CH + 16} fontSize={11} fill="#a0aec0" textAnchor="middle">
                    {Math.round(val)}
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

            {/* X-axis label */}
            {xAxisLabel && (
              <SvgText
                x={CW / 2} y={CH + 36} fontSize={10} fill="#a0aec0" textAnchor="middle"
              >
                {xAxisLabel}
              </SvgText>
            )}

            {/* Data points with optional labels */}
            {series.map((s, si) => {
              const color = COLORS[si % COLORS.length];
              return s.points.map((p, pi) => {
                const cx = xPos(p.x);
                const cy = yPos(p.y);
                return (
                  <G key={`${si}-${pi}`}>
                    <Circle cx={cx} cy={cy} r={4} fill={color} stroke="#1a1a2e" strokeWidth={1} />
                    {p.label && (
                      <SvgText x={cx + 7} y={cy - 6} fontSize={10} fontWeight="700" fill="#e2e8f0">
                        {p.label}
                      </SvgText>
                    )}
                  </G>
                );
              });
            })}

            {/* Axes */}
            <Line x1={0} y1={0} x2={0} y2={CH} stroke="#4a5568" strokeWidth={1} />
            <Line x1={0} y1={CH} x2={CW} y2={CH} stroke="#4a5568" strokeWidth={1} />

            {/* Tooltip */}
            {selected && (() => {
              const prefix = selected.label ? `${selected.label}: ` : '';
              const text = `${prefix}(${selected.x}, ${selected.y})`;
              const tw = Math.max(48, text.length * 7 + 14);
              const th = 24;
              const above = selected.cy > th + 14;
              const tx = Math.max(tw / 2, Math.min(CW - tw / 2, selected.cx));
              const ty = above ? selected.cy - 12 - th : selected.cy + 12;
              return (
                <G>
                  <Rect x={tx - tw / 2} y={ty} width={tw} height={th} rx={6}
                        fill="#1a202c" stroke="#4a5568" strokeWidth={0.8} />
                  <SvgText x={tx} y={ty + th / 2 + 4} fontSize={11} fill="#e2e8f0"
                           textAnchor="middle" fontWeight="600">
                    {text}
                  </SvgText>
                </G>
              );
            })()}
          </G>

          {/* Legend */}
          {series.length > 1 &&
            series.map((s, si) => (
              <G key={s.name} x={M.left + si * 110} y={VH - 10}>
                <Circle cx={5} cy={-5} r={4} fill={COLORS[si % COLORS.length]} stroke="#1a1a2e" strokeWidth={1} />
                <SvgText x={14} y={0} fontSize={11} fill="#a0aec0">
                  {s.name}
                </SvgText>
              </G>
            ))}
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
