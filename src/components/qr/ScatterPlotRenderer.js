import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const VW = 420;
const VH = 320;
const M = { top: 32, right: 22, bottom: 68, left: 62 };
const CW = VW - M.left - M.right;
const CH = VH - M.top - M.bottom;

const COLORS = ['#4a9eff', '#f6ad55', '#68d391', '#fc8181', '#b794f4'];

const SLH = 13; // scatter label pill height
const SLABEL_PAD = 6;

function scatterCollides(r, placed) {
  return placed.some(
    (p) =>
      r.x < p.x + p.w + SLABEL_PAD &&
      r.x + r.w > p.x - SLABEL_PAD &&
      r.y < p.y + p.h + SLABEL_PAD &&
      r.y + r.h > p.y - SLABEL_PAD
  );
}

// Process points sorted by x so nearby dots are handled together.
// For each point, try below → above → below-further → above-further.
// Letter labels (already rendered at cx+7, cy-16 to cy-6) are seeded
// into `placed` first so coordinate labels don't overlap them.
function placeScatterLabels(series, xPosFn, yPosFn, CW) {
  const placed = [];
  const result = [];

  const DOT_R = 4;

  // Seed placed with letter label rects to avoid overlapping them
  series.forEach((s) => {
    s.points.forEach((p) => {
      if (!p.label) return;
      const cx = xPosFn(p.x);
      const cy = yPosFn(p.y);
      const lw = p.label.length * 7 + 4;
      placed.push({ x: cx + 7, y: cy - 16, w: lw, h: 12 });
    });
  });

  // Collect all points across series, sort by py ascending = top of chart first.
  // All prefer above; a lower point falls back to below on clash.
  const allPoints = [];
  series.forEach((s, si) => {
    s.points.forEach((p, pi) => {
      allPoints.push({ p, si, pi, color: COLORS[si % COLORS.length] });
    });
  });
  allPoints.sort((a, b) => yPosFn(a.p.y) - yPosFn(b.p.y));

  allPoints.forEach(({ p, si, pi, color }) => {
    const cx = xPosFn(p.x);
    const cy = yPosFn(p.y);
    const txt = `${p.x}, ${p.y}`;
    const lw = txt.length * 5.8 + 8;
    const lx = Math.max(lw / 2, Math.min(CW - lw / 2, cx));

    // Add other series' dots near this point as obstacles
    const tempDots = series
      .filter((_, osi) => osi !== si)
      .flatMap((os) => os.points)
      .map((op) => {
        const ox = xPosFn(op.x);
        const oy = yPosFn(op.y);
        return { x: ox - DOT_R, y: oy - DOT_R, w: DOT_R * 2, h: DOT_R * 2 };
      });
    const obstacles = [...placed, ...tempDots];

    const aboveY = cy - SLH - 22; // above the letter label
    const belowY = cy + 8;
    // Offsets to try horizontally when vertical slots are full
    const xShifts = [0, lw * 0.7, -lw * 0.7, lw * 1.4, -lw * 1.4];
    const ySlots = [aboveY, belowY, aboveY - 18, belowY + 18, aboveY - 36];

    let ly = aboveY;
    let finalLx = lx;
    let settled = false;
    outer: for (const dy of ySlots) {
      // Skip slots that go off the top of the chart area
      if (dy < -SLH) continue;
      for (const dx of xShifts) {
        const tx = Math.max(lw / 2, Math.min(CW - lw / 2, cx + dx));
        const r = { x: tx - lw / 2, y: dy, w: lw, h: SLH };
        if (!scatterCollides(r, obstacles)) {
          ly = dy;
          finalLx = tx;
          placed.push(r);
          settled = true;
          break outer;
        }
      }
    }
    if (!settled) {
      placed.push({ x: finalLx - lw / 2, y: ly, w: lw, h: SLH });
    }

    const displaced = true;
    result.push({ key: `sv-${si}-${pi}`, x: finalLx, y: ly, w: lw, txt, color, dotX: cx, dotY: cy, displaced });
  });

  return result;
}

function niceAxis(min, max, tickCount = 5) {
  const span = max - min || max || 1;
  const rawMin = Math.floor((min - span * 0.1) / 10) * 10;
  const rawMax = Math.ceil((max + span * 0.1) / 10) * 10;
  const step = (rawMax - rawMin) / tickCount;
  return { axisMin: rawMin, axisMax: rawMax, step };
}

export default function ScatterPlotRenderer({ data, showValues = false }) {
  const { theme: t } = useTheme();
  const [selected, setSelected] = useState(null);
  const [svgWidth, setSvgWidth] = useState(VW);
  const { series, xAxisLabel, yAxisLabel } = data;

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series.flatMap((s) => s.points.map((p) => p.y));

  const { axisMin: xMin, axisMax: xMax, step: xStep } = niceAxis(
    Math.min(...allX),
    Math.max(...allX)
  );
  const { axisMin: yMin, axisMax: yMax, step: yStep } = niceAxis(
    Math.min(...allY),
    Math.max(...allY)
  );

  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const xTickCount = Math.round(xRange / xStep);
  const yTickCount = Math.round(yRange / yStep);

  function xPos(val) {
    return ((val - xMin) / xRange) * CW;
  }

  function yPos(val) {
    return CH - ((val - yMin) / yRange) * CH;
  }

  const labelPositions = showValues ? placeScatterLabels(series, xPos, yPos, CW) : [];

  function handleTap(e) {
    const { locationX, locationY } = e.nativeEvent;
    const scale = svgWidth / VW;
    const cx = locationX / scale - M.left;
    const cy = locationY / scale - M.top;

    let closest = null;
    let minDist = 30 / scale;
    series.forEach((s, si) => {
      s.points.forEach((p, pi) => {
        const px = xPos(p.x);
        const py = yPos(p.y);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < minDist) {
          minDist = dist;
          closest = { si, pi, x: p.x, y: p.y, label: p.label, cx: px, cy: py };
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
            {/* Y gridlines and ticks */}
            {Array.from({ length: yTickCount + 1 }, (_, i) => {
              const val = yMin + i * yStep;
              const y = yPos(val);
              return (
                <G key={`yt-${i}`}>
                  <Line x1={0} y1={y} x2={CW} y2={y} stroke={t.border} strokeWidth={0.7} />
                  <SvgText x={-5} y={y + 4} fontSize={13} fill={t.text} textAnchor="end">
                    {Math.round(val)}
                  </SvgText>
                </G>
              );
            })}

            {/* X gridlines and ticks */}
            {Array.from({ length: xTickCount + 1 }, (_, i) => {
              const val = xMin + i * xStep;
              const x = xPos(val);
              return (
                <G key={`xt-${i}`}>
                  <Line x1={x} y1={0} x2={x} y2={CH} stroke={t.border} strokeWidth={0.7} />
                  <SvgText x={x} y={CH + 18} fontSize={13} fill={t.text} textAnchor="middle">
                    {Math.round(val)}
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

            {/* X-axis label */}
            {xAxisLabel && (
              <SvgText
                x={CW / 2} y={CH + 42} fontSize={12} fill={t.text} textAnchor="middle"
              >
                {xAxisLabel}
              </SvgText>
            )}

            {/* Data points with letter labels */}
            {series.map((s, si) => {
              const color = COLORS[si % COLORS.length];
              return s.points.map((p, pi) => {
                const cx = xPos(p.x);
                const cy = yPos(p.y);
                return (
                  <G key={`${si}-${pi}`}>
                    <Circle cx={cx} cy={cy} r={4} fill={color} stroke={t.bgCard} strokeWidth={1} />
                    {p.label && (
                      <SvgText x={cx + 8} y={cy - 7} fontSize={12} fontWeight="700" fill={t.text}>
                        {p.label}
                      </SvgText>
                    )}
                  </G>
                );
              });
            })}

            {/* Value labels — rendered after points so they sit on top */}
            {labelPositions.map(({ key, x, y, w, txt, color, dotX, dotY, displaced }) => (
              <G key={key}>
                {displaced && (
                  <Line
                    x1={x} y1={y + SLH / 2}
                    x2={dotX} y2={dotY}
                    stroke={color} strokeWidth={0.8} opacity={0.6}
                    strokeDasharray="2 2"
                  />
                )}
                <Rect x={x - w / 2} y={y} width={w} height={SLH} rx={2} fill={color} opacity={0.88} />
                <SvgText x={x} y={y + SLH - 3} fontSize={10} fill="#fff" textAnchor="middle" fontWeight="600">
                  {txt}
                </SvgText>
              </G>
            ))}

            {/* Axes */}
            <Line x1={0} y1={0} x2={0} y2={CH} stroke={t.borderStrong} strokeWidth={1} />
            <Line x1={0} y1={CH} x2={CW} y2={CH} stroke={t.borderStrong} strokeWidth={1} />

            {/* Tooltip */}
            {selected && (() => {
              const prefix = selected.label ? `${selected.label}: ` : '';
              const text = `${prefix}(${selected.x}, ${selected.y})`;
              const tw = Math.max(48, text.length * 7 + 14);
              const th = 24;
              const above = selected.cy > th + 14;
              const tx = Math.max(tw / 2, Math.min(CW - tw / 2, selected.cx));
              const ty = above ? selected.cy - 12 - th : selected.cy + 12;
              return (
                <G>
                  <Rect x={tx - tw / 2} y={ty} width={tw} height={th} rx={6}
                        fill={t.bgCard} stroke={t.borderStrong} strokeWidth={0.8} />
                  <SvgText x={tx} y={ty + th / 2 + 4} fontSize={11} fill={t.text}
                           textAnchor="middle" fontWeight="600">
                    {text}
                  </SvgText>
                </G>
              );
            })()}
          </G>

          {/* Legend */}
          {series.length > 1 &&
            series.map((s, si) => (
              <G key={s.name} x={M.left + si * 120} y={VH - 10}>
                <Circle cx={5} cy={-5} r={5} fill={COLORS[si % COLORS.length]} stroke={t.bgCard} strokeWidth={1} />
                <SvgText x={16} y={0} fontSize={13} fill={t.text}>
                  {s.name}
                </SvgText>
              </G>
            ))}
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
