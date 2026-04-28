import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Polyline, Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import { formatWithUnit } from './formatUnit';

const DEFAULT_VW = 420;
const VH_BASE = 320;
const M_BASE = { top: 32, right: 0, bottom: 80, left: 38 };

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

const LH = 14; // label pill height
const LABEL_PAD = 6; // minimum gap between labels

function collides(r, placed) {
  return placed.some(
    (p) =>
      r.x < p.x + p.w + LABEL_PAD &&
      r.x + r.w > p.x - LABEL_PAD &&
      r.y < p.y + p.h + LABEL_PAD &&
      r.y + r.h > p.y - LABEL_PAD
  );
}

// Process labels in data-y descending order (highest first). Each label
// prefers above its dot; on collision it falls back to below the dot, then
// nudges further down until clear. Because we always push DOWN (never up),
// labels for higher data values can never end up below labels for lower
// values — y order is preserved by construction.
function placeValueLabels(series, xPosFn, yPosFn, unit, CW) {
  const placed = [];
  const result = [];
  const numPoints = series[0]?.values.length ?? 0;
  const DOT_R = 5;
  const NUDGE = 4;
  const MAX_NUDGES = 80;

  for (let i = 0; i < numPoints; i++) {
    const column = series
      .map((s, si) => ({ si, v: s.values[i] }))
      .filter(({ v }) => v != null)
      .sort((a, b) => b.v - a.v);

    if (column.length === 0) continue;

    column.forEach(({ si, v }) => {
      const px = xPosFn(i);
      const py = yPosFn(v);
      const txt = formatWithUnit(v, unit);
      const lw = txt.length * 6.5 + 8;
      const lx = Math.max(lw / 2, Math.min(CW - lw / 2, px));
      const colorIndex = series[si].originalIndex ?? si;

      const tempDots = series
        .filter((_, osi) => osi !== si)
        .map((os) => os.values[i])
        .filter((ov) => ov != null)
        .map((ov) => {
          const cy = yPosFn(ov);
          return { x: px - DOT_R, y: cy - DOT_R, w: DOT_R * 2, h: DOT_R * 2 };
        });
      const obstacles = [...placed, ...tempDots];

      let ly = py - 8 - LH;
      const rect = () => ({ x: lx - lw / 2, y: ly, w: lw, h: LH });

      if (collides(rect(), obstacles)) {
        ly = py + 8;
        let attempts = 0;
        while (collides(rect(), obstacles) && attempts < MAX_NUDGES) {
          ly += NUDGE;
          attempts++;
        }
      }

      placed.push({ x: lx - lw / 2, y: ly, w: lw, h: LH });
      result.push({
        key: `lv-${colorIndex}-${i}`,
        x: lx,
        y: ly,
        w: lw,
        txt,
        color: COLORS[colorIndex % COLORS.length],
      });
    });
  }
  return result;
}

function computeYAxis(allValues, tickCount = 5) {
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const span = dataMax - dataMin || dataMax;
  const rawMin = Math.max(0, Math.floor((dataMin - span * 0.15) / 10) * 10);
  const rawMax = Math.ceil((dataMax + span * 0.1) / 10) * 10;
  const tickStep = (rawMax - rawMin) / tickCount;
  return { yMin: rawMin, yMax: rawMax, tickStep };
}

export default function LineGraphRenderer({ data, showValues = false }) {
  const { theme: t } = useTheme();
  const { svgMultiplier } = useTextSize();
  const [selected, setSelected] = useState(null);
  const [svgWidth, setSvgWidth] = useState(DEFAULT_VW);
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const fz = (n) => Math.round(n * svgMultiplier);
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

  function toggleSeries(si) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(si)) next.delete(si);
      else next.add(si);
      return next;
    });
  }
  const numPoints = labels.length;

  const visibleSeries = series
    .map((s, si) => ({ ...s, originalIndex: si }))
    .filter((_, si) => !hiddenSeries.has(si));
  const allValues = (visibleSeries.length ? visibleSeries : series).flatMap((s) => s.values).filter((v) => v != null);
  const { yMin, yMax, tickStep } = computeYAxis(allValues);
  const range = yMax - yMin;
  const tickCount = Math.round(range / tickStep);

  function xPos(i) {
    return (i / (numPoints - 1)) * CW;
  }

  function yPos(val) {
    return CH - ((val - yMin) / range) * CH;
  }

  const labelPositions = showValues ? placeValueLabels(visibleSeries, xPos, yPos, unit, CW) : [];

  function handleTap(e) {
    const { locationX, locationY } = e.nativeEvent;
    const cx = locationX - M.left;
    const cy = locationY - M.top;

    let closest = null;
    let minDist = 30;
    series.forEach((s, si) => {
      if (hiddenSeries.has(si)) return;
      s.values.forEach((v, i) => {
        if (v == null) return;
        const px = xPos(i);
        const py = yPos(v);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = { si, pi: i, val: v, cx: px, cy: py };
        }
      });
    });
    setSelected(closest);
  }

  return (
    <View>
      {data.title && <Text style={[styles.title, { color: t.accent }]}>{data.title}</Text>}
      <Pressable onPress={handleTap} onLayout={(e) => setSvgWidth(e.nativeEvent.layout.width)}>
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
                    stroke={t.border} strokeWidth={0.7}
                  />
                  <SvgText x={-5} y={y + 4} fontSize={fz(13)} fill={t.text} textAnchor="end">
                    {formatWithUnit(Math.round(val), unit)}
                  </SvgText>
                </G>
              );
            })}

            {/* Y-axis label */}
            {yAxisLabel && (
              <SvgText
                x={-(M.left - 8)} y={CH / 2} fontSize={fz(12)} fill={t.text}
                textAnchor="middle" rotation="-90"
                originX={-(M.left - 8)} originY={CH / 2}
              >
                {yAxisLabel}
              </SvgText>
            )}

            {/* Vertical gridlines at each data point column */}
            {labels.map((_, i) => (
              <Line
                key={`vg-${i}`}
                x1={xPos(i)} y1={0} x2={xPos(i)} y2={CH}
                stroke="rgba(255,255,255,0.25)" strokeWidth={0.8} strokeDasharray="3 4"
              />
            ))}

            {/* X-axis labels — rotated to avoid overlap on dense datasets */}
            {labels.map((label, i) => {
              const px = xPos(i);
              return (
                <SvgText
                  key={i}
                  x={px}
                  y={CH + 14}
                  fontSize={fz(11)}
                  fill={t.text}
                  textAnchor="end"
                  rotation="-40"
                  originX={px}
                  originY={CH + 14}
                >
                  {label}
                </SvgText>
              );
            })}

            {/* Lines & data points */}
            {series.map((s, si) => {
              if (hiddenSeries.has(si)) return null;
              const color = COLORS[si % COLORS.length];
              const segments = [];
              let seg = [];
              s.values.forEach((v, i) => {
                if (v != null) {
                  seg.push(`${xPos(i).toFixed(1)},${yPos(v).toFixed(1)}`);
                } else if (seg.length) {
                  segments.push(seg);
                  seg = [];
                }
              });
              if (seg.length) segments.push(seg);
              return (
                <G key={s.name}>
                  {segments.map((pts, idx) => (
                    <Polyline key={idx} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} />
                  ))}
                  {s.values.map((v, i) => {
                    if (v == null) return null;
                    return (
                      <Circle key={i} cx={xPos(i)} cy={yPos(v)} r={5}
                              fill={color} stroke={t.bgCard} strokeWidth={1} />
                    );
                  })}
                </G>
              );
            })}

            {/* Value labels — rendered after all series so they sit on top */}
            {labelPositions.map(({ key, x, y, w, txt, color }) => (
              <G key={key}>
                <Rect x={x - w / 2} y={y} width={w} height={LH} rx={3} fill={color} opacity={0.92} />
                <SvgText x={x} y={y + LH - 3} fontSize={fz(11)} fill="#fff" textAnchor="middle" fontWeight="700">
                  {txt}
                </SvgText>
              </G>
            ))}

            {/* Axes */}
            <Line x1={0} y1={0} x2={0} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
            <Line x1={0} y1={CH} x2={CW} y2={CH} stroke={t.borderStrong} strokeWidth={1} />

            {/* Tooltip */}
            {selected && (() => {
              const text = formatWithUnit(selected.val.toLocaleString(), unit);
              const tw = Math.max(38, text.length * 8 + 14);
              const th = 24;
              const above = selected.cy > th + 14;
              const tx = Math.max(tw / 2, Math.min(CW - tw / 2, selected.cx));
              const ty = above ? selected.cy - 12 - th : selected.cy + 12;
              const tooltipColor = COLORS[selected.si % COLORS.length];
              return (
                <G>
                  <Rect x={tx - tw / 2} y={ty} width={tw} height={th} rx={6}
                        fill={tooltipColor} stroke={tooltipColor} strokeWidth={0.8} />
                  <SvgText x={tx} y={ty + th / 2 + 4} fontSize={fz(12)} fill="#fff"
                           textAnchor="middle" fontWeight="600">
                    {text}
                  </SvgText>
                </G>
              );
            })()}
          </G>

          {/* Legend — tap to toggle line visibility */}
          {series.length > 1 && (() => {
            const gap = 14;
            const items = series.map((s) => ({
              name: s.name,
              width: 22 + s.name.length * 7,
            }));
            const totalW = items.reduce((sum, it) => sum + it.width, 0) + gap * (items.length - 1);
            let startX = Math.max(8, (VW - totalW) / 2);
            return items.map((item, si) => {
              const color = COLORS[si % COLORS.length];
              const hidden = hiddenSeries.has(si);
              const x = startX;
              startX += item.width + gap;
              return (
                <G key={series[si].name} x={x} y={VH - 10} opacity={hidden ? 0.3 : 1}
                   onPress={() => toggleSeries(si)}>
                  <Rect x={-4} y={-16} width={item.width + 4} height={20} fill="transparent" />
                  <Line x1={0} y1={-4} x2={16} y2={-4} stroke={color} strokeWidth={2} />
                  <Circle cx={8} cy={-4} r={5} fill={color} />
                  <SvgText x={22} y={0} fontSize={fz(13)} fill={t.text}>
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
