import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { formatWithUnit } from './formatUnit';

const DEFAULT_VW = 420;
const PIE_PAD = 14;

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
  const { svgMultiplier } = useTextSize();
  const [svgWidth, setSvgWidth] = useState(DEFAULT_VW);
  const VW = svgWidth;
  const stacked = VW < 520 * svgMultiplier;
  const pieAreaW = stacked ? VW : VW * 0.48;
  const R = Math.max(1, Math.min((pieAreaW - PIE_PAD * 2) / 2, 110));
  const VH = R * 2 + PIE_PAD * 2;
  const CX = pieAreaW / 2;
  const CY = VH / 2;
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

  return (
    <View onLayout={(e) => setSvgWidth(e.nativeEvent.layout.width)}>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <View style={{ flexDirection: stacked ? 'column' : 'row', alignItems: 'center', gap: 12 }}>
        <Svg
          width={pieAreaW}
          height={VH}
          viewBox={`0 0 ${pieAreaW} ${VH}`}
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

        </Svg>
        <View style={{ width: stacked ? '100%' : undefined, flex: stacked ? undefined : 1, gap: 10, paddingBottom: 8 }}>
          {legendItems.map((seg, i) => {
            const isNull = seg.value == null;
            const pct = isNull ? '?' : ((seg.value / computedTotal) * 100).toFixed(1);
            const fmtVal = seg.value != null ? seg.value.toLocaleString() : '';
            const valText = isNull ? '?' : formatWithUnit(fmtVal, unit);
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ width: 14, height: 14, marginTop: 3, borderRadius: 3, backgroundColor: seg.color }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, lineHeight: 19, color: t.text, fontWeight: '600' }}>{seg.label}</Text>
                  <Text style={{ fontSize: 12, lineHeight: 18, color: t.text }}>{valText} ({pct}%)</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
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
