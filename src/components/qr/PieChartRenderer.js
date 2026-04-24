import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { isPrefixUnit } from './formatUnit';

const VW = 420;
const VH = 260;
const CX = 110;
const CY = 118;
const R = 96;

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
  const { theme: t } = useTheme();
  const { segments, total, unit = '' } = data;
  const computedTotal = total ?? segments.reduce((s, seg) => s + (seg.value ?? 0), 0);

  // Separate known and null segments
  const knownSegments = segments.filter((seg) => seg.value != null);
  const nullSegments = segments.filter((seg) => seg.value == null);

  let cumulative = 0;
  const slices = knownSegments.map((seg, i) => {
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

  // Null segments get a "missing" slice for the remainder
  const nullSlices = nullSegments.map((seg, i) => ({
    ...seg,
    startDeg: (cumulative / computedTotal) * 360,
    endDeg: 360,
    color: '#2d3748',
  }));

  const allSlices = [...slices, ...nullSlices];

  // Legend includes all segments (known + null)
  const legendItems = segments.map((seg, i) => ({
    ...seg,
    color: seg.value != null
      ? (seg.color ?? COLORS[knownSegments.indexOf(seg) % COLORS.length])
      : '#2d3748',
  }));

  const ROW_H = 44;
  const legendStartY = Math.max(14, (VH - legendItems.length * ROW_H) / 2);

  return (
    <View>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <Svg
        width="100%"
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Pie slices */}
        {allSlices.map((slice, i) => (
          <Path
            key={i}
            d={arcPath(CX, CY, R, slice.startDeg, slice.endDeg)}
            fill={slice.color}
            stroke={t.bgCard}
            strokeWidth={1.5}
          />
        ))}

        {/* Legend */}
        {legendItems.map((seg, i) => {
          const ly = legendStartY + i * ROW_H;
          const isNull = seg.value == null;
          const pct = isNull ? '?' : ((seg.value / computedTotal) * 100).toFixed(1);
          const fmtVal = seg.value != null ? seg.value.toLocaleString() : '';
          const valText = isNull
            ? '?'
            : isPrefixUnit(unit)
              ? `${unit}${fmtVal}`
              : unit
                ? `${fmtVal}${unit}`
                : `${fmtVal}`;
          return (
            <G key={i} x={228} y={ly}>
              <Rect x={0} y={0} width={14} height={14} fill={seg.color} rx={3} />
              <SvgText x={20} y={12} fontSize={13} fill={t.text} fontWeight="600">
                {seg.label}
              </SvgText>
              <SvgText x={20} y={29} fontSize={12} fill={t.text}>
                {valText} ({pct}%)
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
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
});
