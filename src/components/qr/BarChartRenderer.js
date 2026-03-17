import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 230;
const M = { top: 20, right: 16, bottom: 56, left: 46 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

function niceMax(rawMax) {
  const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const norm = rawMax / mag;
  const nice = norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 3 ? 3 : norm <= 5 ? 5 : norm <= 7 ? 7 : 10;
  return nice * mag;
}

export default function BarChartRenderer({ data }) {
  const { labels, series, yAxisLabel, unit = '' } = data;
  const numGroups = labels.length;
  const numSeries = series.length;

  const allValues = series.flatMap((s) => s.values);
  const maxVal = niceMax(Math.max(...allValues));
  const tickCount = 5;
  const tickStep = maxVal / tickCount;

  const groupWidth = CW / numGroups;
  const barPad = groupWidth * 0.14;
  const groupInner = groupWidth - barPad * 2;
  const barW = Math.max(4, groupInner / numSeries - 1.5);

  function yPos(val) {
    return CH - (val / maxVal) * CH;
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
            const val = i * tickStep;
            const y = yPos(val);
            return (
              <G key={i}>
                <Line
                  x1={0} y1={y} x2={CW} y2={y}
                  stroke="#2d3748" strokeWidth={0.7}
                />
                <SvgText x={-5} y={y + 3} fontSize={8.5} fill="#718096" textAnchor="end">
                  {unit}{Number.isInteger(val) ? val : val.toFixed(0)}
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

          {/* Bars & X labels */}
          {labels.map((label, gi) => {
            const gx = gi * groupWidth + barPad;
            const lx = gi * groupWidth + groupWidth / 2;
            return (
              <G key={label}>
                {series.map((s, si) => {
                  const val = s.values[gi];
                  const bh = (val / maxVal) * CH;
                  return (
                    <Rect
                      key={s.name}
                      x={gx + si * (barW + 1.5)}
                      y={CH - bh}
                      width={barW}
                      height={bh}
                      fill={COLORS[si % COLORS.length]}
                      rx={2}
                    />
                  );
                })}
                <SvgText x={lx} y={CH + 13} fontSize={8.5} fill="#a0aec0" textAnchor="middle">
                  {label}
                </SvgText>
              </G>
            );
          })}

          {/* Axes */}
          <Line x1={0} y1={0} x2={0} y2={CH} stroke="#4a5568" strokeWidth={1} />
          <Line x1={0} y1={CH} x2={CW} y2={CH} stroke="#4a5568" strokeWidth={1} />
        </G>

        {/* Legend */}
        {numSeries > 1 &&
          series.map((s, si) => (
            <G key={s.name} x={M.left + si * 95} y={VH - 10}>
              <Rect x={0} y={-8} width={9} height={9} fill={COLORS[si % COLORS.length]} rx={2} />
              <SvgText x={13} y={0} fontSize={8.5} fill="#a0aec0">
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
