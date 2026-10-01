import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';

import { db } from '../../lib/dbQueries';
import { reportError } from '../../lib/reportError';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import {
  AnalyticsCard,
  AnalyticsEmptyState,
  AnalyticsInsight,
  AnalyticsTile,
  usePremiumAnalyticsTheme,
} from '../../components/premium/PremiumAnalyticsUI';

const SECTION_KEY_MAP = { VR: 'vr', DM: 'dm', QR: 'qr', SJ: 'sj' };

const DM_TYPE_LABELS = {
  syllogism: 'Syllogisms',
  logic_puzzle: 'Logic puzzles',
  strongest_argument: 'Strongest argument',
  recognising_assumptions: 'Recognising assumptions',
  interpreting_info: 'Interpreting info',
  venn_diagram: 'Venn diagrams',
  probabilistic: 'Probabilistic',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function pct(num, denom) {
  if (!denom) return null;
  return Math.round((num / denom) * 100);
}

function attemptKey(a) {
  return `${a.question_id}:${a.statement_index ?? -1}`;
}

function formatSeconds(ms) {
  if (ms == null || Number.isNaN(ms)) return '—';
  const s = ms / 1000;
  if (s < 10) return `${s.toFixed(1)}s`;
  return `${Math.round(s)}s`;
}

function clampValid(t) {
  return t != null && t >= 500 && t <= 600000;
}

// ─── Aggregation ────────────────────────────────────────────────────────────
function aggregate({ rawAttempts, latestAttempts, cohortByKey, totalQuestions, sectionKey }) {
  if (!latestAttempts || latestAttempts.length === 0) {
    return { hasData: false };
  }

  const gradable = latestAttempts.filter((a) => a.is_correct === true || a.is_correct === false);
  const correctCount = gradable.filter((a) => a.is_correct).length;
  const accuracy = pct(correctCount, gradable.length);

  const uniqueQuestionIds = new Set(latestAttempts.map((a) => a.question_id));
  const coverage = pct(uniqueQuestionIds.size, totalQuestions);

  // ─ Time stats ────────────────────────────────────────────────────────────
  const validTimes = latestAttempts.map((a) => a.time_spent_ms).filter(clampValid);
  const avgTimeMs = validTimes.length > 0
    ? Math.round(validTimes.reduce((s, t) => s + t, 0) / validTimes.length)
    : null;

  // Time on correct vs incorrect (uses gradable + valid time only).
  const correctTimes = gradable
    .filter((a) => a.is_correct && clampValid(a.time_spent_ms))
    .map((a) => a.time_spent_ms);
  const incorrectTimes = gradable
    .filter((a) => !a.is_correct && clampValid(a.time_spent_ms))
    .map((a) => a.time_spent_ms);
  const avgCorrectMs = correctTimes.length > 0
    ? Math.round(correctTimes.reduce((s, t) => s + t, 0) / correctTimes.length)
    : null;
  const avgIncorrectMs = incorrectTimes.length > 0
    ? Math.round(incorrectTimes.reduce((s, t) => s + t, 0) / incorrectTimes.length)
    : null;

  // ─ Cohort comparison ────────────────────────────────────────────────────
  // Compare on the questions the user has attempted that ALSO have cohort data.
  let cohortAccuracy = null;
  let cohortAvgTimeMs = null;
  let userAccuracyOnCohortQs = null;
  let userAvgTimeOnCohortQs = null;
  let beatCohortTimeCount = 0;
  let beatCohortTimeTotal = 0;

  let pctSum = 0, pctN = 0;
  let timeSum = 0, timeN = 0;
  const userOnSet = { correct: 0, total: 0, timeMs: 0, timeN: 0 };
  for (const a of latestAttempts) {
    const k = attemptKey(a);
    const c = cohortByKey?.get(k);
    if (!c) continue;
    pctSum += c.correctPct;
    pctN += 1;
    timeSum += c.avgTimeMs;
    timeN += 1;
    if (a.is_correct === true || a.is_correct === false) {
      userOnSet.total += 1;
      if (a.is_correct) userOnSet.correct += 1;
    }
    if (clampValid(a.time_spent_ms)) {
      userOnSet.timeMs += a.time_spent_ms;
      userOnSet.timeN += 1;
      beatCohortTimeTotal += 1;
      if (a.time_spent_ms < c.avgTimeMs) beatCohortTimeCount += 1;
    }
  }
  if (pctN > 0) cohortAccuracy = Math.round((pctSum / pctN) * 100);
  if (timeN > 0) cohortAvgTimeMs = Math.round(timeSum / timeN);
  if (userOnSet.total > 0) userAccuracyOnCohortQs = Math.round((userOnSet.correct / userOnSet.total) * 100);
  if (userOnSet.timeN > 0) userAvgTimeOnCohortQs = Math.round(userOnSet.timeMs / userOnSet.timeN);
  const fasterPct = beatCohortTimeTotal > 0 ? Math.round((beatCohortTimeCount / beatCohortTimeTotal) * 100) : null;

  // ─ Difficulty breakdown (with cohort delta) ─────────────────────────────
  const byDifficulty = {
    normal: { correct: 0, total: 0, cohortPctSum: 0, cohortPctN: 0 },
    hard:   { correct: 0, total: 0, cohortPctSum: 0, cohortPctN: 0 },
  };
  for (const a of gradable) {
    const bucket = byDifficulty[a.difficulty];
    if (!bucket) continue;
    bucket.total += 1;
    if (a.is_correct) bucket.correct += 1;
    const c = cohortByKey?.get(attemptKey(a));
    if (c) { bucket.cohortPctSum += c.correctPct; bucket.cohortPctN += 1; }
  }
  const difficulty = {
    normal: {
      correct: byDifficulty.normal.correct,
      total: byDifficulty.normal.total,
      value: pct(byDifficulty.normal.correct, byDifficulty.normal.total),
      cohortValue: byDifficulty.normal.cohortPctN > 0
        ? Math.round((byDifficulty.normal.cohortPctSum / byDifficulty.normal.cohortPctN) * 100)
        : null,
    },
    hard: {
      correct: byDifficulty.hard.correct,
      total: byDifficulty.hard.total,
      value: pct(byDifficulty.hard.correct, byDifficulty.hard.total),
      cohortValue: byDifficulty.hard.cohortPctN > 0
        ? Math.round((byDifficulty.hard.cohortPctSum / byDifficulty.hard.cohortPctN) * 100)
        : null,
    },
  };

  // ─ DM by type (with cohort delta) ───────────────────────────────────────
  let byType = null;
  if (sectionKey === 'DM') {
    const tally = new Map();
    for (const a of gradable) {
      if (!a.type) continue;
      const cur = tally.get(a.type) ?? { correct: 0, total: 0, cohortPctSum: 0, cohortPctN: 0 };
      cur.total += 1;
      if (a.is_correct) cur.correct += 1;
      const c = cohortByKey?.get(attemptKey(a));
      if (c) { cur.cohortPctSum += c.correctPct; cur.cohortPctN += 1; }
      tally.set(a.type, cur);
    }
    byType = [...tally.entries()]
      .map(([type, d]) => ({
        type,
        label: DM_TYPE_LABELS[type] ?? type,
        correct: d.correct,
        total: d.total,
        value: pct(d.correct, d.total),
        cohortValue: d.cohortPctN > 0 ? Math.round((d.cohortPctSum / d.cohortPctN) * 100) : null,
      }))
      .filter((r) => r.total >= 1)
      .sort((a, b) => b.total - a.total);
  }

  // ─ 7-day activity ───────────────────────────────────────────────────────
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d, count: 0 });
  }
  const startMs = days[0].date.getTime();
  for (const a of latestAttempts) {
    const ts = new Date(a.answered_at).getTime();
    if (ts < startMs) continue;
    const dayIdx = Math.floor((ts - startMs) / (24 * 60 * 60 * 1000));
    if (dayIdx < 0 || dayIdx >= days.length) continue;
    days[dayIdx].count += 1;
  }

  // ─ Improvement trend (last 14d vs prior 14d) ───────────────────────────
  // Walks raw attempts, not latest, so we capture activity over time.
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const recentStart = now - 14 * day;
  const priorStart = now - 28 * day;
  const recent = { correct: 0, total: 0, count: 0 };
  const prior = { correct: 0, total: 0, count: 0 };
  for (const a of rawAttempts ?? []) {
    const ts = new Date(a.answered_at).getTime();
    if (ts >= recentStart) {
      recent.count += 1;
      if (a.is_correct === true || a.is_correct === false) {
        recent.total += 1;
        if (a.is_correct) recent.correct += 1;
      }
    } else if (ts >= priorStart) {
      prior.count += 1;
      if (a.is_correct === true || a.is_correct === false) {
        prior.total += 1;
        if (a.is_correct) prior.correct += 1;
      }
    }
  }
  const trend = {
    recent: { ...recent, accuracy: pct(recent.correct, recent.total) },
    prior:  { ...prior,  accuracy: pct(prior.correct, prior.total) },
  };

  // ─ Longest correct streak ──────────────────────────────────────────────
  // Walk in chronological order. Reset on incorrect; ignore null.
  let longestStreak = 0, currentStreak = 0;
  const chrono = [...(rawAttempts ?? [])].reverse();
  for (const a of chrono) {
    if (a.is_correct === true) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else if (a.is_correct === false) {
      currentStreak = 0;
    }
  }

  // ─ Cohort comparison series (chronological order, only attempts with cohort data) ─
  // For each user attempt that has a matching question_stats row, in the order
  // they answered: the time chart shows raw per-attempt time vs the cohort avg
  // for that same question. The accuracy chart shows running cumulative accuracy.
  const chronoForSeries = [...(rawAttempts ?? [])].reverse(); // oldest first
  const timeSeries = [];
  const accuracySeries = [];
  let runCorrect = 0, runGradable = 0;
  let runCohortPctSum = 0, runCohortPctN = 0;
  for (const a of chronoForSeries) {
    const c = cohortByKey?.get(attemptKey(a));
    if (!c) continue;
    const i = timeSeries.length;
    if (clampValid(a.time_spent_ms)) {
      timeSeries.push({ x: i, you: a.time_spent_ms, cohort: c.avgTimeMs });
    }
    if (a.is_correct === true || a.is_correct === false) {
      runGradable += 1;
      if (a.is_correct) runCorrect += 1;
      runCohortPctSum += c.correctPct;
      runCohortPctN += 1;
      accuracySeries.push({
        x: accuracySeries.length,
        you: Math.round((runCorrect / runGradable) * 100),
        cohort: Math.round((runCohortPctSum / runCohortPctN) * 100),
      });
    }
  }

  // ─ Hardest questions you got right ─────────────────────────────────────
  // Among latest attempts: correct + cohort correct% < 0.4.
  const hardestRight = latestAttempts
    .filter((a) => a.is_correct === true)
    .map((a) => ({ a, c: cohortByKey?.get(attemptKey(a)) }))
    .filter(({ c }) => c && c.correctPct < 0.4)
    .sort((x, y) => x.c.correctPct - y.c.correctPct)
    .slice(0, 5)
    .map(({ a, c }) => ({
      questionId: a.question_id,
      cohortCorrectPct: Math.round(c.correctPct * 100),
      cohortAttempts: c.totalFirstAttempts,
    }));

  return {
    hasData: true,
    totalAttempts: latestAttempts.length,
    uniqueQuestions: uniqueQuestionIds.size,
    totalQuestions,
    accuracy,
    coverage,
    avgTimeMs,
    avgCorrectMs,
    avgIncorrectMs,
    cohortAccuracy,
    cohortAvgTimeMs,
    userAccuracyOnCohortQs,
    userAvgTimeOnCohortQs,
    fasterPct,
    difficulty,
    byType,
    days,
    trend,
    longestStreak,
    hardestRight,
    timeSeries,
    accuracySeries,
  };
}

// ─── UI primitives ──────────────────────────────────────────────────────────
function StatBar({ label, value, sub, cohortValue, color, barBg, textColor, mutedColor, cohortColor }) {
  const width = value == null ? 0 : value;
  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={[styles.barLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.barValue, { color: textColor }]}>
          {value == null ? '—' : `${value}%`}
          {sub ? <Text style={{ color: mutedColor, fontWeight: '400' }}>  {sub}</Text> : null}
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: barBg }]}>
        <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
        {cohortValue != null && (
          <View
            style={[
              styles.barCohortMarker,
              { left: `${cohortValue}%`, backgroundColor: cohortColor ?? mutedColor },
            ]}
          />
        )}
      </View>
      {cohortValue != null && (
        <Text style={[styles.barCohortLabel, { color: mutedColor }]}>
          Cohort avg: {cohortValue}%
        </Text>
      )}
    </View>
  );
}

function ActivityStrip({ days, t }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <View style={styles.activityRow}>
      {days.map((d, i) => {
        const h = (d.count / max) * 60 + 4;
        const isToday = i === days.length - 1;
        return (
          <View key={i} style={styles.activityCol}>
            <View
              style={[
                styles.activityBar,
                {
                  height: h,
                  backgroundColor: d.count === 0 ? t.border : t.accent,
                  opacity: d.count === 0 ? 0.5 : isToday ? 1 : 0.78,
                },
              ]}
            />
            <Text style={[styles.activityLabel, { color: t.textSecondary }]}>
              {d.date.toLocaleDateString('en-GB', { weekday: 'narrow' })}
            </Text>
            <Text style={[styles.activityCount, { color: t.text }]}>{d.count}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CohortLineChart({ data, t, width, yDomain, yTicks, yFormat, youColor, cohortColor }) {
  const W = width;
  const H = 180;
  const padL = 36;
  const padR = 14;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = data.length;
  if (n === 0) return null;

  const [yMin, yMax] = yDomain;
  const xFor = (i) => padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (v) => padT + (1 - (v - yMin) / Math.max(1, yMax - yMin)) * innerH;

  const pathFor = (key) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d[key])}`).join(' ');

  return (
    <Svg width={W} height={H}>
      {yTicks.map((tk) => (
        <G key={tk}>
          <Line x1={padL} x2={W - padR} y1={yFor(tk)} y2={yFor(tk)} stroke={t.border} strokeWidth={1} />
        </G>
      ))}
      {yTicks.map((tk) => (
        <SvgTextLabel key={`l${tk}`} x={padL - 6} y={yFor(tk) + 3} fill={t.textSecondary} anchor="end">
          {yFormat(tk)}
        </SvgTextLabel>
      ))}

      {n > 1 && (
        <>
          {/* Cohort line (drawn first so user line sits on top) */}
          <Path d={pathFor('cohort')} stroke={cohortColor} strokeWidth={2} strokeDasharray="4,4" fill="none" />
          {/* User line */}
          <Path d={pathFor('you')} stroke={youColor} strokeWidth={2.5} fill="none" />
        </>
      )}

      {/* User points */}
      {data.map((d, i) => (
        <Circle key={`u${i}`} cx={xFor(i)} cy={yFor(d.you)} r={n === 1 ? 5 : 3} fill={youColor} />
      ))}

      {/* Cohort points (only show when single-point so the dashed reference is visible) */}
      {n === 1 && data.map((d, i) => (
        <Circle
          key={`c${i}`}
          cx={xFor(i)}
          cy={yFor(d.cohort)}
          r={5}
          stroke={cohortColor}
          strokeWidth={2}
          strokeDasharray="2,2"
          fill="none"
        />
      ))}

      {/* X-axis label (simple: 1 ... n) */}
      <SvgTextLabel x={padL} y={H - 8} fill={t.textSecondary} anchor="start">1</SvgTextLabel>
      {n > 1 && (
        <SvgTextLabel x={W - padR} y={H - 8} fill={t.textSecondary} anchor="end">{n}</SvgTextLabel>
      )}
    </Svg>
  );
}

function SvgTextLabel({ x, y, fill, anchor = 'middle', children }) {
  return (
    <SvgText x={x} y={y} fontSize={9} fontWeight="700" fill={fill} textAnchor={anchor}>
      {children}
    </SvgText>
  );
}

function ChartLegend({ youColor, cohortColor, t, youLabel = 'You', cohortLabel = 'Cohort' }) {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendItem}>
        <View style={[styles.legendSwatch, { backgroundColor: youColor }]} />
        <Text style={[styles.legendText, { color: t.textSecondary }]}>{youLabel}</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendDashed, { borderColor: cohortColor }]} />
        <Text style={[styles.legendText, { color: t.textSecondary }]}>{cohortLabel}</Text>
      </View>
    </View>
  );
}

function VersusBars({ youValue, themValue, youLabel, themLabel, youColor, themColor, t, suffix = '%' }) {
  const max = Math.max(youValue ?? 0, themValue ?? 0, 1);
  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      {[
        { label: youLabel, value: youValue, color: youColor },
        { label: themLabel, value: themValue, color: themColor },
      ].map((row) => {
        const w = row.value == null ? 0 : Math.max(2, (row.value / max) * 100);
        return (
          <View key={row.label}>
            <View style={styles.versusHeader}>
              <Text style={[styles.versusLabel, { color: t.text }]}>{row.label}</Text>
              <Text style={[styles.versusValue, { color: row.color }]}>
                {row.value == null ? '—' : `${row.value}${suffix}`}
              </Text>
            </View>
            <View style={[styles.versusTrack, { backgroundColor: t.bgInput }]}>
              <View style={[styles.versusFill, { width: `${w}%`, backgroundColor: row.color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TimeSplitBars({ correctMs, incorrectMs, t }) {
  const max = Math.max(correctMs ?? 0, incorrectMs ?? 0, 1);
  return (
    <View style={{ marginTop: 14, gap: 14 }}>
      {[
        { label: 'Avg time on correct', value: correctMs, color: t.correct },
        { label: 'Avg time on incorrect', value: incorrectMs, color: t.danger },
      ].map((row) => {
        const w = row.value == null ? 0 : Math.max(2, (row.value / max) * 100);
        return (
          <View key={row.label}>
            <View style={styles.versusHeader}>
              <Text style={[styles.versusLabel, { color: t.text }]}>{row.label}</Text>
              <Text style={[styles.versusValue, { color: row.color }]}>
                {row.value == null ? '—' : formatSeconds(row.value)}
              </Text>
            </View>
            <View style={[styles.versusTrack, { backgroundColor: t.bgInput }]}>
              <View style={[styles.versusFill, { width: `${w}%`, backgroundColor: row.color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TrendCompare({ trend, t }) {
  const max = Math.max(trend.recent.count, trend.prior.count, 1);
  const accDelta = trend.recent.accuracy != null && trend.prior.accuracy != null
    ? trend.recent.accuracy - trend.prior.accuracy
    : null;
  return (
    <View style={{ marginTop: 14 }}>
      <View style={styles.trendRow}>
        <View style={styles.trendCol}>
          <Text style={[styles.trendPeriod, { color: t.textSecondary }]}>Prior 14 days</Text>
          <View style={[styles.trendBarTrack, { backgroundColor: t.bgInput }]}>
            <View
              style={[styles.trendBarFill, { width: `${(trend.prior.count / max) * 100}%`, backgroundColor: t.textSecondary }]}
            />
          </View>
          <Text style={[styles.trendValue, { color: t.text }]}>
            {trend.prior.accuracy == null ? '—' : `${trend.prior.accuracy}%`}
          </Text>
          <Text style={[styles.trendSub, { color: t.textSecondary }]}>{trend.prior.count} attempts</Text>
        </View>
        <View style={styles.trendCol}>
          <Text style={[styles.trendPeriod, { color: t.textSecondary }]}>Last 14 days</Text>
          <View style={[styles.trendBarTrack, { backgroundColor: t.bgInput }]}>
            <View
              style={[styles.trendBarFill, { width: `${(trend.recent.count / max) * 100}%`, backgroundColor: t.accent }]}
            />
          </View>
          <Text style={[styles.trendValue, { color: t.text }]}>
            {trend.recent.accuracy == null ? '—' : `${trend.recent.accuracy}%`}
          </Text>
          <Text style={[styles.trendSub, { color: t.textSecondary }]}>{trend.recent.count} attempts</Text>
        </View>
      </View>
      {accDelta != null && (
        <Text
          style={[
            styles.trendDelta,
            { color: accDelta > 0 ? t.correct : accDelta < 0 ? t.danger : t.textSecondary },
          ]}
        >
          {accDelta > 0 ? `+${accDelta}pp` : `${accDelta}pp`} vs prior fortnight
        </Text>
      )}
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function PracticeAnalyticsView({ sectionKey, preloadedData }) {
  const t = usePremiumAnalyticsTheme(sectionKey);
  const hasPreloaded = preloadedData !== undefined;
  const screenBg = hasPreloaded ? 'transparent' : t.bgInput;

  const [data, setData] = useState(hasPreloaded ? preloadedData : null);
  const [loading, setLoading] = useState(!hasPreloaded);
  const [error, setError] = useState(null);

  const sectionId = SECTION_KEY_MAP[sectionKey];

  const load = useCallback(async () => {
    if (hasPreloaded) return;
    try {
      setLoading(true);
      const res = await db.loadPracticeAnalytics(sectionId);
      setData(res);
      setError(null);
    } catch (err) {
      reportError('PracticeAnalyticsView', err, { level: 'warning', extra: { section: sectionId } });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [hasPreloaded, sectionId]);

  useFocusEffect(useCallback(() => { if (!hasPreloaded) load(); }, [load, hasPreloaded]));

  useEffect(() => {
    if (hasPreloaded) {
      setData(preloadedData);
      setLoading(false);
    }
  }, [hasPreloaded, preloadedData]);

  const [chartWidth, setChartWidth] = useState(280);
  const stats = useMemo(
    () => aggregate({
      rawAttempts: data?.rawAttempts ?? [],
      latestAttempts: data?.latestAttempts ?? [],
      cohortByKey: data?.cohortByKey ?? new Map(),
      totalQuestions: data?.totalQuestions ?? 0,
      sectionKey,
    }),
    [data, sectionKey],
  );

  if (loading) {
    return (
      <AnalyticsEmptyState
        t={t}
        loading
        title={`Loading ${sectionKey} practice`}
        message="Fetching your practice attempts."
        backgroundColor={screenBg}
      />
    );
  }

  if (error) {
    return (
      <AnalyticsEmptyState
        t={t}
        icon="wifi-off"
        title="Couldn't load analytics"
        message="Pull down or come back later."
        backgroundColor={screenBg}
      />
    );
  }

  if (!stats.hasData) {
    return (
      <AnalyticsEmptyState
        t={t}
        icon={UCAT_SECTIONS[sectionKey]?.icon}
        title="No practice yet"
        message={`Answer some ${UCAT_SECTIONS[sectionKey]?.title ?? sectionKey} practice questions to start building your analytics.`}
        backgroundColor={screenBg}
      />
    );
  }

  // Insight: time efficiency.
  const timeInsight = (() => {
    if (stats.avgCorrectMs == null || stats.avgIncorrectMs == null) return null;
    const ratio = stats.avgIncorrectMs / stats.avgCorrectMs;
    if (ratio >= 1.5) {
      return `You're spending ${ratio.toFixed(1)}× longer on questions you get wrong. On the real exam, that's time you'd never get back — practice flagging and moving on.`;
    }
    if (ratio <= 0.8) {
      return `You're answering wrong faster than right — you may be guessing under pressure. Slow down on uncertainty.`;
    }
    return `Your time on right vs wrong is balanced. Keep working on accuracy.`;
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['bottom']}>
      <StatusBar barStyle={t.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Headline tiles */}
        <View style={styles.tileRow}>
          <AnalyticsTile t={t} label="Attempts" value={stats.totalAttempts} />
          <AnalyticsTile
            t={t}
            label="Accuracy"
            value={stats.accuracy != null ? `${stats.accuracy}%` : '—'}
            valueColor={
              stats.accuracy == null ? t.text
                : stats.accuracy >= 70 ? t.correct
                  : stats.accuracy >= 50 ? t.text
                    : t.danger
            }
          />
          <AnalyticsTile
            t={t}
            label="Faster than"
            value={stats.fasterPct != null ? `${stats.fasterPct}%` : '—'}
            valueColor={
              stats.fasterPct == null ? t.text
                : stats.fasterPct >= 60 ? t.correct
                  : stats.fasterPct >= 40 ? t.text
                    : t.danger
            }
          />
        </View>

        {/* You vs cohort — two line charts (accuracy running %, time per attempt) */}
        {(stats.timeSeries.length > 0 || stats.accuracySeries.length > 0) && (
          <AnalyticsCard
            t={t}
            onLayout={(e) => setChartWidth(Math.max(240, e.nativeEvent.layout.width - 36))}
          >
            <Text style={[styles.cardTitle, { color: t.text }]}>You vs cohort</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              How you compare to other students on the same questions, in the order you answered them.
            </Text>

            {stats.accuracySeries.length === 0 && stats.timeSeries.length === 0 && (
              <Text style={[styles.emptyChart, { color: t.textSecondary }]}>
                Not enough cohort data yet — keep answering practice questions and the comparison charts will fill in.
              </Text>
            )}

            {stats.accuracySeries.length >= 1 && (() => {
              const ys = stats.accuracySeries.flatMap((d) => [d.you, d.cohort]);
              const minY = Math.max(0, Math.floor((Math.min(...ys) - 5) / 10) * 10);
              const maxY = Math.min(100, Math.ceil((Math.max(...ys) + 5) / 10) * 10);
              const span = Math.max(20, maxY - minY);
              const tick = span <= 30 ? 10 : 20;
              const ticks = [];
              for (let v = minY; v <= maxY; v += tick) ticks.push(v);
              return (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.subhead, { color: t.textSecondary }]}>Running accuracy</Text>
                  <View style={styles.chartWrap}>
                    <CohortLineChart
                      data={stats.accuracySeries}
                      t={t}
                      width={chartWidth}
                      yDomain={[minY, maxY]}
                      yTicks={ticks}
                      yFormat={(v) => `${v}%`}
                      youColor={t.accent}
                      cohortColor={t.textSecondary}
                    />
                  </View>
                  <ChartLegend youColor={t.accent} cohortColor={t.textSecondary} t={t} />
                </View>
              );
            })()}

            {stats.timeSeries.length >= 1 && (() => {
              const ys = stats.timeSeries.flatMap((d) => [d.you, d.cohort]);
              const maxMs = Math.max(...ys);
              const niceMaxSec = Math.ceil(maxMs / 1000 / 10) * 10;
              const tickStep = niceMaxSec <= 30 ? 5 : niceMaxSec <= 60 ? 10 : 20;
              const ticks = [];
              for (let v = 0; v <= niceMaxSec; v += tickStep) ticks.push(v * 1000);
              return (
                <View style={{ marginTop: 18 }}>
                  <Text style={[styles.subhead, { color: t.textSecondary }]}>Time per question</Text>
                  <View style={styles.chartWrap}>
                    <CohortLineChart
                      data={stats.timeSeries}
                      t={t}
                      width={chartWidth}
                      yDomain={[0, niceMaxSec * 1000]}
                      yTicks={ticks}
                      yFormat={(v) => `${Math.round(v / 1000)}s`}
                      youColor={t.accent}
                      cohortColor={t.textSecondary}
                    />
                  </View>
                  <ChartLegend youColor={t.accent} cohortColor={t.textSecondary} t={t} />
                </View>
              );
            })()}

            {stats.cohortAccuracy != null && stats.userAccuracyOnCohortQs != null && (() => {
              const delta = stats.userAccuracyOnCohortQs - stats.cohortAccuracy;
              if (Math.abs(delta) < 3) return null;
              return (
                <AnalyticsInsight
                  t={t}
                  text={delta > 0
                    ? `You're scoring ${delta}pp above the cohort overall. You're answering questions other students often get wrong.`
                    : `You're ${Math.abs(delta)}pp below the cohort overall. Review your incorrect answers and the AI tutor explanations.`}
                />
              );
            })()}
          </AnalyticsCard>
        )}

        {/* Time efficiency */}
        {(stats.avgCorrectMs != null || stats.avgIncorrectMs != null) && (
          <AnalyticsCard t={t}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Time efficiency</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              How long you spend on questions you get right vs wrong.
            </Text>
            <TimeSplitBars correctMs={stats.avgCorrectMs} incorrectMs={stats.avgIncorrectMs} t={t} />
            {timeInsight && <AnalyticsInsight t={t} text={timeInsight} />}
          </AnalyticsCard>
        )}

        {/* Improvement trend */}
        {(stats.trend.recent.count > 0 || stats.trend.prior.count > 0) && (
          <AnalyticsCard t={t}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Improvement trend</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              Last 14 days vs the 14 before that.
            </Text>
            <TrendCompare trend={stats.trend} t={t} />
          </AnalyticsCard>
        )}

        {/* Streak */}
        {stats.longestStreak > 1 && (
          <AnalyticsCard t={t}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Longest correct streak</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              Consecutive correct answers in a row.
            </Text>
            <View style={styles.streakRow}>
              <Text style={[styles.streakValue, { color: t.accent }]}>{stats.longestStreak}</Text>
              <Text style={[styles.streakUnit, { color: t.textSecondary }]}>in a row</Text>
            </View>
          </AnalyticsCard>
        )}

        {/* Hardest questions you got right */}
        {stats.hardestRight.length > 0 && (
          <AnalyticsCard t={t}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Hardest questions you got right</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              {stats.hardestRight.length === 1 ? 'A question' : `${stats.hardestRight.length} questions`} most students get wrong — and you nailed.
            </Text>
            <View style={{ marginTop: 14, gap: 8 }}>
              {stats.hardestRight.map((row) => (
                <View
                  key={row.questionId}
                  style={[styles.hardRow, { backgroundColor: t.bgInput, borderColor: t.border }]}
                >
                  <Text style={[styles.hardCohort, { color: t.danger }]}>
                    {row.cohortCorrectPct}% cohort
                  </Text>
                  <Text style={[styles.hardSub, { color: t.textSecondary }]}>
                    of {row.cohortAttempts} attempts got it right — you did.
                  </Text>
                </View>
              ))}
            </View>
          </AnalyticsCard>
        )}

        {/* Coverage */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Coverage</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How many of the available {sectionKey} practice questions you've attempted.
          </Text>
          <View style={styles.coverageRow}>
            <Text style={[styles.bigStat, { color: t.text }]}>
              {stats.uniqueQuestions}<Text style={{ color: t.textSecondary, fontSize: 18 }}> / {stats.totalQuestions}</Text>
            </Text>
            <Text style={[styles.coverageMeta, { color: t.textSecondary }]}>
              questions attempted at least once
              {stats.avgTimeMs != null && (
                <Text>{`\nAvg time per attempt: ${formatSeconds(stats.avgTimeMs)}`}</Text>
              )}
            </Text>
          </View>
        </AnalyticsCard>

        {/* Difficulty breakdown */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Accuracy by difficulty</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Your latest answer on each question, with cohort marker for comparison.
          </Text>
          <View style={{ marginTop: 14 }}>
            <StatBar
              label="Normal"
              value={stats.difficulty.normal.value}
              cohortValue={stats.difficulty.normal.cohortValue}
              sub={`${stats.difficulty.normal.correct} / ${stats.difficulty.normal.total}`}
              color={t.correct}
              barBg={t.bgInput}
              textColor={t.text}
              mutedColor={t.textSecondary}
              cohortColor={t.text}
            />
            <StatBar
              label="Hard"
              value={stats.difficulty.hard.value}
              cohortValue={stats.difficulty.hard.cohortValue}
              sub={`${stats.difficulty.hard.correct} / ${stats.difficulty.hard.total}`}
              color={t.danger}
              barBg={t.bgInput}
              textColor={t.text}
              mutedColor={t.textSecondary}
              cohortColor={t.text}
            />
          </View>
        </AnalyticsCard>

        {/* DM: by question type */}
        {sectionKey === 'DM' && stats.byType && stats.byType.length > 0 && (
          <AnalyticsCard t={t}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Accuracy by question type</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              Your strongest and weakest DM question styles, with cohort marker.
            </Text>
            <View style={{ marginTop: 14 }}>
              {stats.byType.map((row) => (
                <StatBar
                  key={row.type}
                  label={row.label}
                  value={row.value}
                  cohortValue={row.cohortValue}
                  sub={`${row.correct} / ${row.total}`}
                  color={
                    row.value == null ? t.textSecondary
                      : row.value >= 70 ? t.correct
                        : row.value >= 50 ? t.accent
                          : t.danger
                  }
                  barBg={t.bgInput}
                  textColor={t.text}
                  mutedColor={t.textSecondary}
                  cohortColor={t.text}
                />
              ))}
            </View>
          </AnalyticsCard>
        )}

        {/* Activity */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Activity (last 7 days)</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Practice questions answered each day.
          </Text>
          <View style={{ marginTop: 18 }}>
            <ActivityStrip days={stats.days} t={t} />
          </View>
        </AnalyticsCard>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 34, gap: 14 },
  tileRow: { flexDirection: 'row', gap: 10 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
  cardSub: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  subhead: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6, marginTop: 14, textTransform: 'uppercase' },
  bigStat: { fontSize: 36, fontWeight: '800' },
  coverageRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 16 },
  coverageMeta: { fontSize: 12, flex: 1, lineHeight: 18 },

  barRow: { marginTop: 4, marginBottom: 14 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, fontWeight: '600' },
  barValue: { fontSize: 13, fontWeight: '700' },
  barTrack: { position: 'relative', height: 9, borderRadius: 999, overflow: 'visible' },
  barFill: { height: '100%', borderRadius: 999 },
  barCohortMarker: { position: 'absolute', top: -2, width: 2, height: 13, borderRadius: 1 },
  barCohortLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  versusHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  versusLabel: { fontSize: 13, fontWeight: '700' },
  versusValue: { fontSize: 14, fontWeight: '900' },
  versusTrack: { height: 11, borderRadius: 999, overflow: 'hidden' },
  versusFill: { height: '100%', borderRadius: 999 },

  chartWrap: { marginTop: 10, alignItems: 'center' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 18, height: 3, borderRadius: 2 },
  legendDashed: { width: 18, height: 0, borderTopWidth: 2, borderStyle: 'dashed' },
  legendText: { fontSize: 11, fontWeight: '700' },
  emptyChart: { fontSize: 13, lineHeight: 19, marginTop: 14, fontStyle: 'italic' },

  trendRow: { flexDirection: 'row', gap: 16 },
  trendCol: { flex: 1, gap: 6 },
  trendPeriod: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendBarTrack: { height: 7, borderRadius: 999, overflow: 'hidden' },
  trendBarFill: { height: '100%', borderRadius: 999 },
  trendValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  trendSub: { fontSize: 11, fontWeight: '700' },
  trendDelta: { marginTop: 14, fontSize: 13, fontWeight: '800', textAlign: 'center' },

  streakRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 14, gap: 10 },
  streakValue: { fontSize: 56, fontWeight: '900' },
  streakUnit: { fontSize: 14, fontWeight: '700' },

  hardRow: { padding: 12, borderRadius: 10, borderWidth: 1, gap: 4 },
  hardCohort: { fontSize: 13, fontWeight: '900' },
  hardSub: { fontSize: 12, lineHeight: 17 },

  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: 80 },
  activityCol: { alignItems: 'center', flex: 1, gap: 4 },
  activityBar: { width: 16, borderRadius: 4 },
  activityLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  activityCount: { fontSize: 11, fontWeight: '700' },
});
