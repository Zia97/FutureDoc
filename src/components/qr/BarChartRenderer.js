import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 240;
const M = { top: 20, right: 16, bottom: 62, left: 54 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

function niceStep(range, tickCount) {
  const raw = range / tickCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 3 ? 3 : norm <= 5 ? 5 : norm <= 7 ? 7 : 10;
  return nice * mag;
}

export default function BarChartRenderer({ data }) {
  const { labels, series, yAxisLabel, unit = '' } = data;
  const numGroups = labels.length;
  const numSeries = series.length;

  const allValues = series.flatMap((s) => s.values).filter((v) => v != null);
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);

  const hasNegative = rawMin < 0;
  const tickCount = 5;

  // Calculate nice axis bounds
  let axisMin, axisMax, step;
  if (hasNegative) {
    const absMax = Math.max(Math.abs(rawMin), Math.abs(rawMax));
    step = niceStep(absMax, Math.floor(tickCount / 2));
    const nTicks = Math.ceil(absMax / step);
    axisMax = nTicks * step;
    axisMin = -Math.ceil(Math.abs(rawMin) / step) * step;
  } else {
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax || 1)));
    const norm = rawMax / mag;
    const nice = norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 3 ? 3 : norm <= 5 ? 5 : norm <= 7 ? 7 : 10;
    axisMax = nice * mag;
    axisMin = 0;
    step = axisMax / tickCount;
  }

  const axisRange = axisMax - axisMin;

  const groupWidth = CW / numGroups;
  const barPad = groupWidth * 0.14;
  const groupInner = groupWidth - barPad * 2;
  const barW = Math.max(4, groupInner / numSeries - 1.5);

  // Zero line position (where value=0 sits in chart coordinates)
  const zeroY = ((axisMax - 0) / axisRange) * CH;

  function yPos(val) {
    return ((axisMax - val) / axisRange) * CH;
  }

  // Generate tick values
  const ticks = [];
  for (let v = axisMin; v <= axisMax + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1000) / 1000); // avoid float drift
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
          {ticks.map((val, i) => {
            const y = yPos(val);
            return (
              <G key={i}>
                <Line
                  x1={0} y1={y} x2={CW} y2={y}
                  stroke={val === 0 && hasNegative ? '#4a5568' : '#2d3748'}
                  strokeWidth={val === 0 && hasNegative ? 1.2 : 0.7}
                />
                <SvgText x={-5} y={y + 4} fontSize={11} fill="#718096" textAnchor="end">
                  {unit}{Number.isInteger(val) ? val : val.toFixed(1)}
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

          {/* Bars & X labels */}
          {labels.map((label, gi) => {
            const gx = gi * groupWidth + barPad;
            const lx = gi * groupWidth + groupWidth / 2;
            return (
              <G key={label}>
                {series.map((s, si) => {
                  const val = s.values[gi];
                  if (val == null) return null;
                  const barTop = yPos(Math.max(val, 0));
                  const barBottom = yPos(Math.min(val, 0));
                  const bh = barBottom - barTop;
                  return (
                    <Rect
                      key={s.name}
                      x={gx + si * (barW + 1.5)}
                      y={barTop}
                      width={barW}
                      height={Math.max(bh, 1)}
                      fill={COLORS[si % COLORS.length]}
                      rx={2}
                    />
                  );
                })}
                <SvgText x={lx} y={CH + 16} fontSize={11} fill="#a0aec0" textAnchor="middle">
                  {label}
                </SvgText>
              </G>
            );
          })}

          {/* Axes */}
          <Line x1={0} y1={0} x2={0} y2={CH} stroke="#4a5568" strokeWidth={1} />
          <Line x1={0} y1={CH} x2={CW} y2={CH} stroke="#4a5568" strokeWidth={1} />
          {/* Zero line for negative charts */}
          {hasNegative && (
            <Line x1={0} y1={zeroY} x2={CW} y2={zeroY} stroke="#4a5568" strokeWidth={1.2} />
          )}
        </G>

        {/* Legend */}
        {numSeries > 1 &&
          series.map((s, si) => (
            <G key={s.name} x={M.left + si * 110} y={VH - 10}>
              <Rect x={0} y={-10} width={11} height={11} fill={COLORS[si % COLORS.length]} rx={2} />
              <SvgText x={16} y={0} fontSize={11} fill="#a0aec0">
                {s.name}
              </SvgText>
            </G>
          ))}
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
