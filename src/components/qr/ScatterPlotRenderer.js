import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { G, Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';

const DEFAULT_VW = 420;
const VH_BASE = 320;
const M_BASE = { top: 32, right: 0, bottom: 68, left: 38 };

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

// Process points in data-y descending order (highest first). Each label
// prefers above its dot; on collision it falls back to below the dot, then
// nudges further down until clear. Because we always push DOWN (never up),
// labels for higher data-y points can never end up below labels for lower
// data-y points — y order is preserved by construction.
function placeScatterLabels(series, xPosFn, yPosFn, CW) {
  const placed = [];
  const result = [];
  const DOT_R = 4;
  const NUDGE = 3;
  const MAX_NUDGES = 100;

  // Seed placed with letter label rects so coordinate labels avoid them
  series.forEach((s) => {
    s.points.forEach((p) => {
      if (!p.label) return;
      const cx = xPosFn(p.x);
      const cy = yPosFn(p.y);
      const lw = p.label.length * 7 + 4;
      placed.push({ x: cx + 7, y: cy - 16, w: lw, h: 12 });
    });
  });

  const allPoints = [];
  series.forEach((s, si) => {
    s.points.forEach((p, pi) => {
      allPoints.push({ p, si, pi, color: COLORS[si % COLORS.length] });
    });
  });
  allPoints.sort((a, b) => b.p.y - a.p.y);

  allPoints.forEach(({ p, si, pi, color }) => {
    const cx = xPosFn(p.x);
    const cy = yPosFn(p.y);
    const txt = `${p.x}, ${p.y}`;
    const lw = txt.length * 5.8 + 8;
    const lx = Math.max(lw / 2, Math.min(CW - lw / 2, cx));

    const tempDots = series
      .filter((_, osi) => osi !== si)
      .flatMap((os) => os.points)
      .map((op) => {
        const ox = xPosFn(op.x);
        const oy = yPosFn(op.y);
        return { x: ox - DOT_R, y: oy - DOT_R, w: DOT_R * 2, h: DOT_R * 2 };
      });
    const obstacles = [...placed, ...tempDots];

    const initialLy = cy - SLH - 22;
    let ly = initialLy;
    const rect = () => ({ x: lx - lw / 2, y: ly, w: lw, h: SLH });

    if (scatterCollides(rect(), obstacles)) {
      ly = cy + 8;
      let attempts = 0;
      while (scatterCollides(rect(), obstacles) && attempts < MAX_NUDGES) {
        ly += NUDGE;
        attempts++;
      }
    }

    placed.push({ x: lx - lw / 2, y: ly, w: lw, h: SLH });
    const displaced = ly !== initialLy;
    result.push({ key: `sv-${si}-${pi}`, x: lx, y: ly, w: lw, txt, color, dotX: cx, dotY: cy, displaced });
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
  const { svgMultiplier } = useTextSize();
  const [selected, setSelected] = useState(null);
  const [svgWidth, setSvgWidth] = useState(DEFAULT_VW);
  const fz = (n) => Math.round(n * svgMultiplier);
  const M = {
    top: M_BASE.top,
    right: M_BASE.right,
    bottom: M_BASE.bottom + Math.round((svgMultiplier - 1) * 26),
    left: M_BASE.left + Math.round((svgMultiplier - 1) * 18),
  };
  const VH = VH_BASE + Math.round((svgMultiplier - 1) * 26);
  const CH = VH - M.top - M.bottom;
  const VW = svgWidth;
  const CW = VW - M.left - M.right;
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
    const cx = locationX - M.left;
    const cy = locationY - M.top;

    let closest = null;
    let minDist = 30;
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
                  <SvgText x={-5} y={y + 4} fontSize={fz(13)} fill={t.text} textAnchor="end">
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
                  <SvgText x={x} y={CH + 18} fontSize={fz(13)} fill={t.text} textAnchor="middle">
                    {Math.round(val)}
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

            {/* X-axis label */}
            {xAxisLabel && (
              <SvgText
                x={CW / 2} y={CH + 42} fontSize={fz(12)} fill={t.text} textAnchor="middle"
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
                      <SvgText x={cx + 8} y={cy - 7} fontSize={fz(12)} fontWeight="700" fill={t.text}>
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
                <SvgText x={x} y={y + SLH - 3} fontSize={fz(10)} fill="#fff" textAnchor="middle" fontWeight="600">
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
                  <SvgText x={tx} y={ty + th / 2 + 4} fontSize={fz(11)} fill={t.text}
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
                <SvgText x={16} y={0} fontSize={fz(13)} fill={t.text}>
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
