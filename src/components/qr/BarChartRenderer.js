import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { formatWithUnit, formatNegativeWithUnit } from './formatUnit';

const DEFAULT_VW = 420;
const VH_BASE = 400;
const M_BASE = { top: 28, right: 0, bottom: 90, left: 38 };

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

const LH = 14;

function niceStep(range, tickCount) {
  const raw = range / tickCount;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}

function wrapLabel(label) {
  if (!label || !label.includes(' ')) return [label];
  const mid = label.length / 2;
  let bestSpace = -1, bestDist = Infinity;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === ' ') {
      const d = Math.abs(i - mid);
      if (d < bestDist) { bestDist = d; bestSpace = i; }
    }
  }
  if (bestSpace === -1) return [label];
  return [label.slice(0, bestSpace), label.slice(bestSpace + 1)];
}

export default function BarChartRenderer({ data, showValues = false }) {
  const { theme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const [tapped, setTapped] = useState(null); // { gi, si }
  const [svgWidth, setSvgWidth] = useState(DEFAULT_VW);

  const fz = (n) => Math.round(n * svgMultiplier);
  // Grow margins so larger tick numbers and rotated x-labels still fit.
  const M = {
    top: M_BASE.top,
    right: M_BASE.right,
    bottom: M_BASE.bottom + Math.round((svgMultiplier - 1) * 30),
    left: M_BASE.left + Math.round((svgMultiplier - 1) * 18),
  };
  const VH = VH_BASE + Math.round((svgMultiplier - 1) * 30);
  const CH = VH - M.top - M.bottom;
  const VW = svgWidth;
  const CW = VW - M.left - M.right;

  const { labels, series, yAxisLabel, unit = '' } = data;
  const numGroups = labels.length;

  function toggleSeries(si) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(si)) next.delete(si);
      else next.add(si);
      return next;
    });
  }

  const visibleSeries = series.filter((_, si) => !hiddenSeries.has(si));
  const allValues = (visibleSeries.length ? visibleSeries : series)
    .flatMap((s) => s.values)
    .filter((v) => v != null);

  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);
  const hasNegative = rawMin < 0;
  const tickCount = 5;

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
  const numSeries = series.length;
  const groupWidth = CW / numGroups;
  const barPad = groupWidth * 0.18;
  const groupInner = groupWidth - barPad * 2;
  const barW = Math.max(4, groupInner / numSeries - 1.5);

  const zeroY = ((axisMax - 0) / axisRange) * CH;

  function yPos(val) {
    return ((axisMax - val) / axisRange) * CH;
  }

  const ticks = [];
  for (let v = axisMin; v <= axisMax + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }

  function handleTap(e) {
    const { locationX, locationY } = e.nativeEvent;
    const cx = locationX - M.left;
    const cy = locationY - M.top;

    let hit = null;
    labels.forEach((_, gi) => {
      const gx = gi * groupWidth + barPad;
      series.forEach((s, si) => {
        if (hiddenSeries.has(si)) return;
        const val = s.values[gi];
        if (val == null) return;
        const barTop = yPos(Math.max(val, 0));
        const barBottom = yPos(Math.min(val, 0));
        const barX = gx + si * (barW + 1.5);
        if (cx >= barX && cx <= barX + barW && cy >= barTop && cy <= barBottom) {
          hit = { gi, si };
        }
      });
    });

    if (hit) {
      setTapped((prev) =>
        prev && prev.gi === hit.gi && prev.si === hit.si ? null : hit
      );
    } else {
      setTapped(null);
    }
  }

  // Build tooltip for tapped bar
  const tooltip = (() => {
    if (!tapped) return null;
    const { gi, si } = tapped;
    const val = series[si]?.values[gi];
    if (val == null) return null;
    const gx = gi * groupWidth + barPad;
    const barX = gx + si * (barW + 1.5);
    const barCx = barX + barW / 2;
    const barTop = yPos(Math.max(val, 0));
    const txt = formatWithUnit(val, unit);
    const tw = Math.max(40, txt.length * 7 + 16);
    const th = 22;
    const ty = Math.max(0, barTop - th - 6);
    const tx = Math.max(tw / 2, Math.min(CW - tw / 2, barCx));
    return { txt, tx, ty, tw, th, color: COLORS[si % COLORS.length] };
  })();

  // Build "show all" value labels — one per bar, always above bar top
  const allLabels = showValues ? (() => {
    const out = [];
    labels.forEach((_, gi) => {
      const gx = gi * groupWidth + barPad;
      series.forEach((s, si) => {
        if (hiddenSeries.has(si)) return;
        const val = s.values[gi];
        if (val == null) return;
        const barTop = yPos(Math.max(val, 0));
        const barX = gx + si * (barW + 1.5);
        const barCx = barX + barW / 2;
        const txt = formatWithUnit(val, unit);
        const ty = val < 0
          ? Math.min(CH - 2, yPos(val) + LH + 4)
          : Math.max(LH, barTop - 4);
        out.push({ key: `lbl-${gi}-${si}`, x: barCx, y: ty, txt, color: COLORS[si % COLORS.length] });
      });
    });
    return out;
  })() : [];

  return (
    <View>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <Pressable
        onPress={handleTap}
        onLayout={(e) => setSvgWidth(e.nativeEvent.layout.width)}
      >
        <Svg
          width="100%"
          height={VH}
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <G transform={`translate(${M.left}, ${M.top})`}>
            {/* Gridlines & Y-axis ticks */}
            {ticks.map((val, i) => {
              const y = yPos(val);
              const absVal = Math.abs(val);
              const fmtNum = Number.isInteger(absVal) ? absVal : absVal.toFixed(1);
              const tickLabel = val < 0
                ? formatNegativeWithUnit(fmtNum, unit)
                : formatWithUnit(fmtNum, unit);
              return (
                <G key={i}>
                  <Line
                    x1={0} y1={y} x2={CW} y2={y}
                    stroke={val === 0 && hasNegative ? t.borderStrong : t.border}
                    strokeWidth={val === 0 && hasNegative ? 1.2 : 0.7}
                  />
                  <SvgText x={-5} y={y + 4} fontSize={fz(13)} fill={t.text} textAnchor="end">
                    {tickLabel}
                  </SvgText>
                </G>
              );
            })}

            {/* Y-axis label */}
            {yAxisLabel && (
              <SvgText
                x={-(M.left - 8)} y={CH / 2} fontSize={fz(12)} fill={t.text}
                textAnchor="middle"
                transform={`rotate(-90, ${-(M.left - 8)}, ${CH / 2})`}
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
                    if (hiddenSeries.has(si)) return null;
                    const val = s.values[gi];
                    if (val == null) return null;
                    const barTop = yPos(Math.max(val, 0));
                    const barBottom = yPos(Math.min(val, 0));
                    const bh = barBottom - barTop;
                    const barX = gx + si * (barW + 1.5);
                    const isTapped = tapped?.gi === gi && tapped?.si === si;
                    return (
                      <Rect
                        key={s.name}
                        x={barX}
                        y={barTop}
                        width={barW}
                        height={Math.max(bh, 1)}
                        fill={COLORS[si % COLORS.length]}
                        opacity={isTapped ? 1 : 0.85}
                        rx={2}
                      />
                    );
                  })}
                  {wrapLabel(label).map((line, li) => (
                    <SvgText
                      key={li}
                      x={lx}
                      y={CH + 26 + li * 15}
                      fontSize={fz(12)}
                      fill={t.text}
                      textAnchor="middle"
                    >
                      {line}
                    </SvgText>
                  ))}
                </G>
              );
            })}

            {/* Show-all value labels */}
            {allLabels.map(({ key, x, y, txt, color }) => (
              <G key={key}>
                <Rect
                  x={x - (txt.length * 6 + 8) / 2} y={y - LH}
                  width={txt.length * 6 + 8} height={LH + 2}
                  rx={2} fill={color} opacity={0.9}
                />
                <SvgText x={x} y={y - 2} fontSize={fz(11)} fill="#fff" textAnchor="middle" fontWeight="700">
                  {txt}
                </SvgText>
              </G>
            ))}

            {/* Tapped bar tooltip */}
            {tooltip && (
              <G>
                <Rect
                  x={tooltip.tx - tooltip.tw / 2} y={tooltip.ty}
                  width={tooltip.tw} height={tooltip.th}
                  rx={5} fill={tooltip.color} opacity={0.95}
                />
                <SvgText
                  x={tooltip.tx} y={tooltip.ty + tooltip.th / 2 + 5}
                  fontSize={fz(12)} fill="#fff" textAnchor="middle" fontWeight="700"
                >
                  {tooltip.txt}
                </SvgText>
              </G>
            )}

            {/* Axes */}
            <Line x1={0} y1={0} x2={0} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
            <Line x1={0} y1={CH} x2={CW} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
            {hasNegative && (
              <Line x1={0} y1={zeroY} x2={CW} y2={zeroY} stroke={t.borderStrong} strokeWidth={1.2} />
            )}
          </G>

          {/* Legend — tap to toggle series */}
          {numSeries > 1 && (() => {
            const gap = 14;
            const items = series.map((s) => ({
              name: s.name,
              width: 20 + s.name.length * 7,
            }));
            const totalW = items.reduce((sum, it) => sum + it.width, 0) + gap * (items.length - 1);
            let cx = Math.max(8, (VW - totalW) / 2);
            return items.map((item, si) => {
              const x = cx;
              cx += item.width + gap;
              const hidden = hiddenSeries.has(si);
              return (
                <G key={series[si].name} transform={`translate(${x}, ${VH - 14})`} opacity={hidden ? 0.3 : 1}
                   onPress={() => toggleSeries(si)}>
                  <Rect x={-4} y={-16} width={item.width + 8} height={20} fill="transparent" />
                  <Rect x={0} y={-11} width={13} height={13} fill={COLORS[si % COLORS.length]} rx={2} />
                  <SvgText x={20} y={0} fontSize={fz(13)} fill={t.text}>
                    {item.name}
                  </SvgText>
                </G>
              );
            });
          })()}
        </Svg>
      </Pressable>

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
