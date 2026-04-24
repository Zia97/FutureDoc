import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const VW = 420;
const VH = 340;
const M = { top: 28, right: 20, bottom: 96, left: 62 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

const LH = 14;
const LABEL_PAD = 4;

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

function collides(r, placed) {
  return placed.some(
    (p) =>
      r.x < p.x + p.w + LABEL_PAD &&
      r.x + r.w > p.x - LABEL_PAD &&
      r.y < p.y + p.h + LABEL_PAD &&
      r.y + r.h > p.y - LABEL_PAD
  );
}

// For each bar in a group, try above then below to avoid overlaps.
function placeBarLabels(groups) {
  const placed = [];
  const result = [];

  for (const { barCx, barTop, barBottom, val, color, key, unit } of groups) {
    const txt = `${unit}${val}`;
    const lw = txt.length * 6.5 + 8;
    const lx = barCx;

    // Candidate positions: above bar first, then below bar top (inside), then further up
    const aboveY = barTop - LH - 3;
    const belowY = barBottom + 3;
    const candidates = [aboveY, belowY, aboveY - LH - 2, belowY + LH + 2, aboveY - (LH + 2) * 2];

    let ly = aboveY;
    for (const cy of candidates) {
      const r = { x: lx - lw / 2, y: cy, w: lw, h: LH };
      if (!collides(r, placed)) {
        ly = cy;
        placed.push(r);
        break;
      }
    }

    result.push({ key, x: lx, y: ly, w: lw, txt, color });
  }
  return result;
}

export default function BarChartRenderer({ data, showValues = false }) {
  const { theme: t } = useTheme();
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
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
  const barPad = groupWidth * 0.14;
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

  // Build label placement input across all groups
  const labelInputs = [];
  labels.forEach((label, gi) => {
    const gx = gi * groupWidth + barPad;
    series.forEach((s, si) => {
      if (hiddenSeries.has(si)) return;
      const val = s.values[gi];
      if (val == null) return;
      const barTop = yPos(Math.max(val, 0));
      const barBottom = yPos(Math.min(val, 0));
      const barX = gx + si * (barW + 1.5);
      const barCx = barX + barW / 2;
      labelInputs.push({
        key: `lbl-${gi}-${si}`,
        barCx, barTop, barBottom, val,
        color: COLORS[si % COLORS.length],
        unit,
      });
    });
  });

  const labelPositions = showValues ? placeBarLabels(labelInputs) : [];

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
                <SvgText x={-5} y={y + 4} fontSize={13} fill={t.text} textAnchor="end">
                  {tickLabel}
                </SvgText>
              </G>
            );
          })}

          {/* Y-axis label */}
          {yAxisLabel && (
            <SvgText
              x={-48} y={CH / 2} fontSize={12} fill={t.text}
              textAnchor="middle" rotation="-90"
              originX={-48} originY={CH / 2}
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
                  return (
                    <Rect
                      key={s.name}
                      x={barX}
                      y={barTop}
                      width={barW}
                      height={Math.max(bh, 1)}
                      fill={COLORS[si % COLORS.length]}
                      rx={2}
                    />
                  );
                })}
                {wrapLabel(label).map((line, li) => (
                  <SvgText
                    key={li}
                    x={lx}
                    y={CH + 24 + li * 14}
                    fontSize={12}
                    fill={t.text}
                    textAnchor="middle"
                  >
                    {line}
                  </SvgText>
                ))}
              </G>
            );
          })}

          {/* Value label pills — rendered on top of all bars */}
          {labelPositions.map(({ key, x, y, w, txt, color }) => (
            <G key={key}>
              <Rect x={x - w / 2} y={y} width={w} height={LH} rx={3} fill={color} opacity={0.92} />
              <SvgText x={x} y={y + LH - 3} fontSize={11} fill="#fff" textAnchor="middle" fontWeight="700">
                {txt}
              </SvgText>
            </G>
          ))}

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
              <G key={series[si].name} x={x} y={VH - 14} opacity={hidden ? 0.3 : 1}
                 onPress={() => toggleSeries(si)}>
                <Rect x={-4} y={-16} width={item.width + 8} height={20} fill="transparent" />
                <Rect x={0} y={-11} width={13} height={13} fill={COLORS[si % COLORS.length]} rx={2} />
                <SvgText x={20} y={0} fontSize={13} fill={t.text}>
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
