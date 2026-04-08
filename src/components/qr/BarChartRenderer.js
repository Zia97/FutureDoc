import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const VW = 360;
const VH = 300;
const M = { top: 24, right: 16, bottom: 90, left: 54 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

function niceStep(range, tickCount) {
  const raw = range / tickCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}

// Split a label into up to 2 lines on the space nearest the midpoint.
// Single-word labels return as-is.
function wrapLabel(label) {
  if (!label || !label.includes(' ')) return [label];
  const mid = label.length / 2;
  let bestSpace = -1;
  let bestDist = Infinity;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === ' ') {
      const d = Math.abs(i - mid);
      if (d < bestDist) {
        bestDist = d;
        bestSpace = i;
      }
    }
  }
  if (bestSpace === -1) return [label];
  return [label.slice(0, bestSpace), label.slice(bestSpace + 1)];
}

export default function BarChartRenderer({ data }) {
  const { theme: t } = useTheme();
  const { labels, series, yAxisLabel, unit = '' } = data;
  const numGroups = labels.length;
  const numSeries = series.length;

  const allValues = series.flatMap((s) => s.values).filter((v) => v != null);
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);

  const hasNegative = rawMin < 0;
  const tickCount = 5;

  // Calculate nice axis bounds — always leave ≥1 tick of headroom beyond data
  let axisMin, axisMax, step;
  if (hasNegative) {
    step = niceStep(rawMax - rawMin, tickCount);
    axisMax = Math.ceil(rawMax / step) * step;
    axisMin = -Math.ceil(Math.abs(rawMin) / step) * step;
    if (axisMax - rawMax < step * 0.3) axisMax += step;
    if (rawMin - axisMin < step * 0.3) axisMin -= step;
  } else {
    const mag = Math.pow(10, Math.floor(Math.log10(rawMax || 1)));
    const norm = rawMax / mag;
    const nice = norm <= 1.5 ? 1.5 : norm <= 2 ? 2 : norm <= 3 ? 3 : norm <= 5 ? 5 : norm <= 7 ? 7 : 10;
    axisMax = nice * mag;
    axisMin = 0;
    step = axisMax / tickCount;
    if (axisMax - rawMax < step * 0.3) axisMax += step;
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
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
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
            const absVal = Math.abs(val);
            const fmtNum = Number.isInteger(absVal) ? absVal : absVal.toFixed(1);
            const tickLabel = `${val < 0 ? '-' : ''}${unit}${fmtNum}`;
            return (
              <G key={i}>
                <Line
                  x1={0} y1={y} x2={CW} y2={y}
                  stroke={val === 0 && hasNegative ? t.borderStrong : t.border}
                  strokeWidth={val === 0 && hasNegative ? 1.2 : 0.7}
                />
                <SvgText x={-5} y={y + 4} fontSize={12} fill={t.text} textAnchor="end">
                  {tickLabel}
                </SvgText>
              </G>
            );
          })}

          {/* Y-axis label */}
          {yAxisLabel && (
            <SvgText
              x={-40} y={CH / 2} fontSize={11} fill={t.text}
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
                  const barX = gx + si * (barW + 1.5);
                  const barCx = barX + barW / 2;
                  const labelY = val >= 0 ? barTop - 4 : barBottom + 12;
                  return (
                    <G key={s.name}>
                      <Rect
                        x={barX}
                        y={barTop}
                        width={barW}
                        height={Math.max(bh, 1)}
                        fill={COLORS[si % COLORS.length]}
                        rx={2}
                      />
                      <SvgText
                        x={barCx}
                        y={labelY}
                        fontSize={10}
                        fill={t.text}
                        textAnchor="middle"
                      >
                        {Math.abs(val)}
                      </SvgText>
                    </G>
                  );
                })}
                {wrapLabel(label).map((line, li) => (
                  <SvgText
                    key={li}
                    x={lx}
                    y={CH + 22 + li * 13}
                    fontSize={11}
                    fill={t.text}
                    textAnchor="middle"
                  >
                    {line}
                  </SvgText>
                ))}
              </G>
            );
          })}

          {/* Axes */}
          <Line x1={0} y1={0} x2={0} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
          <Line x1={0} y1={CH} x2={CW} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
          {/* Zero line for negative charts */}
          {hasNegative && (
            <Line x1={0} y1={zeroY} x2={CW} y2={zeroY} stroke={t.borderStrong} strokeWidth={1.2} />
          )}
        </G>

        {/* Legend — dynamic width, centered so long names don't clip */}
        {numSeries > 1 && (() => {
          const gap = 14;
          const items = series.map((s) => ({
            name: s.name,
            width: 18 + s.name.length * 6.4,
          }));
          const totalW = items.reduce((sum, it) => sum + it.width, 0) + gap * (items.length - 1);
          let cx = Math.max(8, (VW - totalW) / 2);
          return items.map((item, si) => {
            const x = cx;
            cx += item.width + gap;
            return (
              <G key={series[si].name} x={x} y={VH - 14}>
                <Rect x={0} y={-10} width={12} height={12} fill={COLORS[si % COLORS.length]} rx={2} />
                <SvgText x={18} y={0} fontSize={12} fill={t.text}>
                  {item.name}
                </SvgText>
              </G>
            );
          });
        })()}
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
