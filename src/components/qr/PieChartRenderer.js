import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';

const VW = 360;
const VH = 220;
const CX = 95;
const CY = 100;
const R = 82;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4', '#76e4f7'];

function arcPath(cx, cy, r, startDeg, endDeg) {
  const toRad = (d) => ((d - 90) * Math.PI) / 180;
  const s = toRad(startDeg);
  const e = toRad(endDeg);
  const x1 = (cx + r * Math.cos(s)).toFixed(2);
  const y1 = (cy + r * Math.sin(s)).toFixed(2);
  const x2 = (cx + r * Math.cos(e)).toFixed(2);
  const y2 = (cy + r * Math.sin(e)).toFixed(2);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function PieChartRenderer({ data }) {
  const { segments, total, unit = '' } = data;
  const computedTotal = total ?? segments.reduce((s, seg) => s + seg.value, 0);

  let cumulative = 0;
  const slices = segments.map((seg, i) => {
    const startDeg = (cumulative / computedTotal) * 360;
    cumulative += seg.value;
    const endDeg = (cumulative / computedTotal) * 360;
    return {
      ...seg,
      startDeg,
      endDeg,
      color: seg.color ?? COLORS[i % COLORS.length],
    };
  });

  const ROW_H = 40;
  const legendStartY = Math.max(14, (VH - slices.length * ROW_H) / 2);

  return (
    <View>
      {data.title && <Text style={styles.title}>{data.title}</Text>}
      <Svg
        width="100%"
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pie slices */}
        {slices.map((slice, i) => (
          <Path
            key={i}
            d={arcPath(CX, CY, R, slice.startDeg, slice.endDeg)}
            fill={slice.color}
            stroke="#1a1a2e"
            strokeWidth={1.5}
          />
        ))}

        {/* Legend */}
        {slices.map((slice, i) => {
          const ly = legendStartY + i * ROW_H;
          const pct = ((slice.value / computedTotal) * 100).toFixed(1);
          return (
            <G key={i} x={200} y={ly}>
              <Rect x={0} y={0} width={13} height={13} fill={slice.color} rx={3} />
              <SvgText x={19} y={11} fontSize={12} fill="#e2e8f0" fontWeight="600">
                {slice.label}
              </SvgText>
              <SvgText x={19} y={27} fontSize={11} fill="#718096">
                {unit}{slice.value.toLocaleString()} ({pct}%)
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
