import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 230;
const M = { top: 20, right: 20, bottom: 56, left: 46 };
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
  const { labels, series, yAxisLabel, unit = '' } = data;
  const numPoints = labels.length;

  const allValues = series.flatMap((s) => s.values);
  const { yMin, yMax, tickStep } = computeYAxis(allValues);
  const range = yMax - yMin;
  const tickCount = Math.round(range / tickStep);

  function xPos(i) {
    return (i / (numPoints - 1)) * CW;
  }

  function yPos(val) {
    return CH - ((val - yMin) / range) * CH;
  }

  return (
    <View>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
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
                <SvgText x={-5} y={y + 3} fontSize={8.5} fill="#718096" textAnchor="end">
                  {unit}{Math.round(val)}
                </SvgText>
              </G>
            );
          })}

          {/* Y-axis label */}
          {yAxisLabel && (
            <SvgText
              x={-32} y={CH / 2} fontSize={8} fill="#a0aec0"
              textAnchor="middle" rotation="-90"
              originX={-32} originY={CH / 2}
            >
              {yAxisLabel}
            </SvgText>
          )}

          {/* X-axis labels */}
          {labels.map((label, i) => (
            <SvgText
              key={i} x={xPos(i)} y={CH + 14}
              fontSize={8.5} fill="#a0aec0" textAnchor="middle"
            >
              {label}
            </SvgText>
          ))}

          {/* Lines & data points */}
          {series.map((s, si) => {
            const pts = s.values.map((v, i) => `${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`).join(' ');
            const color = COLORS[si % COLORS.length];
            return (
              <G key={s.name}>
                <Polyline
                  points={pts}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
                {s.values.map((v, i) => (
                  <Circle
                    key={i}
                    cx={xPos(i)} cy={yPos(v)}
                    r={3.5}
                    fill={color}
                    stroke="#1a1a2e"
                    strokeWidth={1}
                  />
                ))}
              </G>
            );
          })}

          {/* Axes */}
          <Line x1={0} y1={0} x2={0} y2={CH} stroke="#4a5568" strokeWidth={1} />
          <Line x1={0} y1={CH} x2={CW} y2={CH} stroke="#4a5568" strokeWidth={1} />
        </G>

        {/* Legend */}
        {series.length > 1 &&
          series.map((s, si) => {
            const color = COLORS[si % COLORS.length];
            return (
              <G key={s.name} x={M.left + si * 115} y={VH - 10}>
                <Line x1={0} y1={-4} x2={14} y2={-4} stroke={color} strokeWidth={2} />
                <Circle cx={7} cy={-4} r={3} fill={color} />
                <SvgText x={18} y={0} fontSize={8.5} fill="#a0aec0">
                  {s.name}
                </SvgText>
              </G>
            );
          })}
      </Svg>
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
