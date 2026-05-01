import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { reportError } from '../../lib/reportError';
import { db } from '../../lib/dbQueries';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import {
  AnalyticsCard,
  AnalyticsEmptyState,
  AnalyticsInsight,
  AnalyticsTile,
  usePremiumAnalyticsTheme,
} from '../../components/premium/PremiumAnalyticsUI';
import {
  getVRScaledScore,
  scoreColor,
  formatPercentile,
  VR_2025_MEAN,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER,
} from '../../lib/ucatScoring';

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation
// ─────────────────────────────────────────────────────────────────────────────

function aggregate(rows, tests) {
  if (!rows || rows.length === 0) {
    return {
      attemptCount: 0,
      headline: null,
      trend: [],
      difficulty: null,
      completion: null,
      pacing: null,
      hasTimingData: false,
    };
  }

  const trend = rows.map((r) => ({
    testId: r.test_id,
    label: `Test ${r.test_id}`,
    score: getVRScaledScore(r.score_percent),
    scorePercent: r.score_percent,
    submittedAt: r.submitted_at,
  }));

  const scaledScores = trend.map((t) => t.score);
  const avg = Math.round(scaledScores.reduce((a, b) => a + b, 0) / scaledScores.length);
  const best = Math.max(...scaledScores);

  // Sum pre-aggregated summaries across all attempts.
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  let totalQuestions = 0, totalAnswered = 0;
  let totalTimeMs = 0, timedCount = 0;
  let correctTimeMs = 0, correctTimedCount = 0;
  let incorrectTimeMs = 0, incorrectTimedCount = 0;

  for (const attempt of rows) {
    const s = attempt.analytics_summary;
    if (!s) continue;

    const d = s.difficulty ?? {};
    normalCorrect += d.normal?.correct ?? 0;
    normalTotal += d.normal?.total ?? 0;
    hardCorrect += d.hard?.correct ?? 0;
    hardTotal += d.hard?.total ?? 0;

    totalAnswered += s.completion?.answered ?? 0;
    totalQuestions += s.completion?.total ?? 0;

    if (s.pacing) {
      totalTimeMs += s.pacing.total_ms ?? 0;
      timedCount += s.pacing.timed_count ?? 0;
      correctTimeMs += s.pacing.correct_ms ?? 0;
      correctTimedCount += s.pacing.correct_count ?? 0;
      incorrectTimeMs += s.pacing.incorrect_ms ?? 0;
      incorrectTimedCount += s.pacing.incorrect_count ?? 0;
    }
  }

  const pct = (c, t) => (t > 0 ? Math.round((c / t) * 100) : null);
  const avgSec = (ms, n) => (n > 0 ? Math.round(ms / n / 1000) : null);

  const difficulty = {
    normal: { value: pct(normalCorrect, normalTotal), correct: normalCorrect, total: normalTotal },
    hard:   { value: pct(hardCorrect, hardTotal),     correct: hardCorrect,   total: hardTotal },
  };

  const unanswered = totalQuestions - totalAnswered;
  const completion = {
    answered: totalAnswered,
    total: totalQuestions,
    unansweredAvg: rows.length > 0 ? Math.round(unanswered / rows.length) : 0,
    answeredPct: pct(totalAnswered, totalQuestions),
  };

  const benchmarkTest = tests.find((t) => t.timeMinutes && t.questionCount);
  const targetSec = benchmarkTest
    ? Math.round((benchmarkTest.timeMinutes * 60) / benchmarkTest.questionCount)
    : null;

  const pacing = timedCount > 0
    ? {
        avgSec: avgSec(totalTimeMs, timedCount),
        avgCorrectSec: avgSec(correctTimeMs, correctTimedCount),
        avgIncorrectSec: avgSec(incorrectTimeMs, incorrectTimedCount),
        sampleSize: timedCount,
        targetSec,
      }
    : null;

  return {
    attemptCount: rows.length,
    headline: { avg, best, latest: scaledScores[scaledScores.length - 1] },
    trend,
    difficulty,
    completion,
    pacing,
    hasTimingData: timedCount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────────────────────────────────────

// UCAT scaled score line chart. Y-axis is fixed to the 300–900 range so
// data points sit at the same vertical position they'd occupy on the
// final UCAT score scale, regardless of how few attempts the user has.
//
// Each data point is coloured by its scoreColor band so students can see
// at a glance whether each test landed above or below the 2025 mean.
function ScoreLineChart({ data, t, gridColor, textColor, width }) {
  const W = width;
  const H = 230;
  const padX = 44;
  const padBottom = 30;
  const padTop = 22; // leaves room for value labels above each point
  const innerW = W - padX * 2;
  const innerH = H - padBottom - padTop;
  const n = data.length;

  const Y_MIN = 300;
  const Y_MAX = 900;
  const xFor = (i) =>
    padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (s) => padTop + (1 - (s - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.score)}`)
    .join(' ');

  const yTicks = [300, 450, 600, 750, 900];
  const meanY = yFor(VR_2025_MEAN);

  return (
    <Svg width={W} height={H}>
      {yTicks.map((tk) => (
        <Line
          key={tk}
          x1={padX}
          x2={W - padX}
          y1={yFor(tk)}
          y2={yFor(tk)}
          stroke={gridColor}
          strokeWidth={1}
        />
      ))}
      {yTicks.map((tk) => (
        <SvgText
          key={`l${tk}`}
          x={padX - 6}
          y={yFor(tk) + 3}
          fontSize={9}
          fill={textColor}
          textAnchor="end"
        >
          {tk}
        </SvgText>
      ))}

      {/* 2025 UK VR mean reference line. Dashed so it doesn't compete
          with the user's own score line. */}
      <Line
        x1={padX}
        x2={W - padX}
        y1={meanY}
        y2={meanY}
        stroke={t.textSecondary}
        strokeWidth={1.5}
        strokeDasharray="5,4"
        opacity={0.7}
      />
      <SvgText
        x={W - padX - 4}
        y={meanY - 5}
        fontSize={9}
        fontWeight="700"
        fill={t.textSecondary}
        textAnchor="end"
      >
        2025 avg {VR_2025_MEAN}
      </SvgText>

      {n > 1 && (
        <Path d={path} stroke={t.accent} strokeWidth={2.5} fill="none" />
      )}

      {/* ±SCORE_UNCERTAINTY confidence interval bars on each data point.
          Visualises the ~±40 SEM that the real UCAT has — students should
          read each dot as "somewhere within this range", not as a precise
          number. */}
      {data.map((d, i) => {
        const yLo = yFor(Math.max(300, d.score - SCORE_UNCERTAINTY));
        const yHi = yFor(Math.min(900, d.score + SCORE_UNCERTAINTY));
        const x = xFor(i);
        const capW = 4;
        return (
          <G key={`ci${i}`}>
            <Line x1={x} x2={x} y1={yHi} y2={yLo} stroke={scoreColor(d.score, t)} strokeWidth={1.5} opacity={0.45} />
            <Line x1={x - capW} x2={x + capW} y1={yHi} y2={yHi} stroke={scoreColor(d.score, t)} strokeWidth={1.5} opacity={0.45} />
            <Line x1={x - capW} x2={x + capW} y1={yLo} y2={yLo} stroke={scoreColor(d.score, t)} strokeWidth={1.5} opacity={0.45} />
          </G>
        );
      })}

      {data.map((d, i) => (
        <Circle
          key={`c${i}`}
          cx={xFor(i)}
          cy={yFor(d.score)}
          r={5}
          fill={scoreColor(d.score, t)}
        />
      ))}
      {/* Score value above each data point, coloured by performance band. */}
      {data.map((d, i) => (
        <SvgText
          key={`v${i}`}
          x={xFor(i)}
          y={yFor(d.score) - 10}
          fontSize={11}
          fontWeight="700"
          fill={scoreColor(d.score, t)}
          textAnchor="middle"
        >
          {d.score}
        </SvgText>
      ))}
      {/* X-axis: each data point labelled with the test it represents. */}
      {data.map((d, i) => (
        <SvgText
          key={`x${i}`}
          x={xFor(i)}
          y={H - 10}
          fontSize={10}
          fontWeight="600"
          fill={textColor}
          textAnchor="middle"
        >
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

function StatBar({ label, value, sub, color, barBg, textColor, mutedColor }) {
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
        <View
          style={[
            styles.barFill,
            { width: `${width}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function VRAnalyticsScreen({ route, preloadedRows }) {
  const { user } = useAuth();
  const tests = route.params?.tests ?? [];
  const hasPreloaded = preloadedRows !== undefined;
  const t = usePremiumAnalyticsTheme('VR');
  const screenBg = hasPreloaded ? 'transparent' : t.bgInput;

  const [rows, setRows] = useState(hasPreloaded ? preloadedRows : null);
  const [loading, setLoading] = useState(!hasPreloaded);
  const [error, setError] = useState(null);
  const [chartWidth, setChartWidth] = useState(280);

  const load = useCallback(async () => {
    if (hasPreloaded) return;
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await db.loadVRAnalytics();
      setRows(data);
      setError(null);
    } catch (err) {
      reportError('VRAnalyticsScreen', err, { level: 'warning', extra: { note: 'load failed' } });
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user, hasPreloaded]);

  useFocusEffect(
    useCallback(() => {
      if (!hasPreloaded) load();
    }, [load, hasPreloaded]),
  );

  // Sync preloaded data from parent (unified analytics screen)
  useEffect(() => {
    if (hasPreloaded) {
      setRows(preloadedRows);
      setLoading(false);
    }
  }, [hasPreloaded, preloadedRows]);

  const stats = useMemo(() => aggregate(rows ?? [], tests), [rows, tests]);

  if (loading) {
    return (
      <AnalyticsEmptyState
        t={t}
        loading
        title="Loading VR analytics"
        message="Fetching your latest Verbal Reasoning attempts."
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

  if (!user) {
    return (
      <AnalyticsEmptyState
        t={t}
        icon="user"
        title="Sign in to see analytics"
        message="Performance analytics are tied to your account so they survive reinstall and sync across devices."
        backgroundColor={screenBg}
      />
    );
  }

  if (stats.attemptCount === 0) {
    return (
      <AnalyticsEmptyState
        t={t}
        icon={UCAT_SECTIONS.VR.icon}
        title="No VR data yet"
        message="Complete a timed Verbal Reasoning test to start building your performance analytics."
        backgroundColor={screenBg}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]} edges={['bottom']}>
      <StatusBar barStyle={t.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Headline tiles — Average and Best are estimated UCAT scaled scores
            (300–900), matching what students see on the post-test results
            screen. Both are colour-coded against the 2025 mean. The "(est.)"
            label is intentional: these are derived estimates, not official
            UCAT scores. */}
        <View style={styles.tileRow}>
          <Tile t={t} label="Tests" value={stats.attemptCount} />
          <Tile
            t={t}
            label="Average (est.)"
            value={stats.headline.avg}
            valueColor={scoreColor(stats.headline.avg, t)}
          />
          <Tile
            t={t}
            label="Best (est.)"
            value={stats.headline.best}
            valueColor={scoreColor(stats.headline.best, t)}
          />
        </View>

        {/* 2025 average comparison strip — gives the headline tiles context.
            "approx" wording so a student in the middle of the distribution
            doesn't read "+38" as a precise claim. */}
        <View style={[styles.benchmarkStrip, { backgroundColor: t.accentDim, borderColor: t.border }]}>
          <Text style={[styles.benchmarkLabel, { color: t.textSecondary }]}>
            vs 2025 UK average ({VR_2025_MEAN})
          </Text>
          <Text style={[styles.benchmarkValue, { color: scoreColor(stats.headline.avg, t) }]}>
            ~{benchmarkDelta(stats.headline.avg, VR_2025_MEAN)}
          </Text>
        </View>

        {/* Score trend */}
        <AnalyticsCard
          t={t}
          onLayout={(e) => setChartWidth(Math.max(240, e.nativeEvent.layout.width - 36))}
        >
          <Text style={[styles.cardTitle, { color: t.text }]}>Score over time</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Estimated UCAT scaled score on each test, in the order you took them.
            Vertical bars show the ±{SCORE_UNCERTAINTY}-point uncertainty in each
            estimate. Dashed line is the 2025 UK average ({VR_2025_MEAN}).
          </Text>
          <View style={styles.chartWrap}>
            <ScoreLineChart
              data={stats.trend}
              t={t}
              gridColor={t.border}
              textColor={t.textSecondary}
              width={chartWidth}
            />
          </View>
          {(() => {
            const latest = stats.trend[stats.trend.length - 1];
            const percentileText = latest ? formatPercentile('vr', latest.score) : null;
            if (!percentileText) return null;
            return (
              <Text style={[styles.percentileLine, { color: t.textSecondary }]}>
                Your latest test is {percentileText} of 2025 UK UCAT candidates.
              </Text>
            );
          })()}
        </AnalyticsCard>

        {/* Difficulty breakdown */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Accuracy by difficulty</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How you perform on standard vs harder questions.
          </Text>
          <View style={{ marginTop: 14 }}>
            <StatBar
              label="Normal"
              value={stats.difficulty.normal.value}
              sub={`${stats.difficulty.normal.correct} / ${stats.difficulty.normal.total}`}
              color={t.correct}
              barBg={t.bgInput}
              textColor={t.text}
              mutedColor={t.textSecondary}
            />
            <StatBar
              label="Hard"
              value={stats.difficulty.hard.value}
              sub={`${stats.difficulty.hard.correct} / ${stats.difficulty.hard.total}`}
              color={t.danger}
              barBg={t.bgInput}
              textColor={t.text}
              mutedColor={t.textSecondary}
            />
          </View>
          {stats.difficulty.normal.value != null && stats.difficulty.hard.value != null && (
            <Insight
              t={t}
              text={difficultyInsight(stats.difficulty.normal.value, stats.difficulty.hard.value)}
            />
          )}
        </AnalyticsCard>

        {/* Pacing — placed before completion rate so students see how
            long they're taking before they see how many they leave blank. */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Pacing</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Average time you're spending on each question.
          </Text>
          {!stats.hasTimingData ? (
            <Text style={[styles.emptyInline, { color: t.textSecondary }]}>
              We'll start tracking question timing on your next test. Take one to see
              your pacing.
            </Text>
          ) : (
            <>
              <View style={styles.pacingHero}>
                <Text style={[styles.bigStat, { color: t.text }]}>
                  {stats.pacing.avgSec}s
                </Text>
                <Text style={[styles.completionMeta, { color: t.textSecondary }]}>
                  per question
                  {stats.pacing.targetSec != null && (
                    <Text>{`\nTarget pace: ${stats.pacing.targetSec}s per question`}</Text>
                  )}
                </Text>
              </View>
              {(stats.pacing.avgCorrectSec != null || stats.pacing.avgIncorrectSec != null) && (
                <View style={[styles.pacingSplit, { borderTopColor: t.border }]}>
                  <View style={styles.pacingSplitItem}>
                    <Text style={[styles.pacingSplitValue, { color: t.correct }]}>
                      {stats.pacing.avgCorrectSec != null ? `${stats.pacing.avgCorrectSec}s` : '—'}
                    </Text>
                    <Text style={[styles.pacingSplitLabel, { color: t.textSecondary }]}>
                      avg on correct
                    </Text>
                  </View>
                  <View style={[styles.pacingSplitDivider, { backgroundColor: t.border }]} />
                  <View style={styles.pacingSplitItem}>
                    <Text style={[styles.pacingSplitValue, { color: t.danger }]}>
                      {stats.pacing.avgIncorrectSec != null ? `${stats.pacing.avgIncorrectSec}s` : '—'}
                    </Text>
                    <Text style={[styles.pacingSplitLabel, { color: t.textSecondary }]}>
                      avg on incorrect
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </AnalyticsCard>

        {/* Completion rate */}
        <AnalyticsCard t={t}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Completion rate</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How often you finish every question before the timer runs out.
          </Text>
          <View style={styles.completionRow}>
            <Text style={[styles.bigStat, { color: t.text }]}>
              {stats.completion.answeredPct ?? 0}%
            </Text>
            <Text style={[styles.completionMeta, { color: t.textSecondary }]}>
              {stats.completion.answered} of {stats.completion.total} questions answered
              {'\n'}
              ~{stats.completion.unansweredAvg} left blank per test
            </Text>
          </View>
          {stats.completion.unansweredAvg > 2 && (
            <Insight
              t={t}
              text={`You're leaving ~${stats.completion.unansweredAvg} questions blank per test. Try skipping long questions earlier so you have time to come back to them.`}
            />
          )}
        </AnalyticsCard>

        {/* Estimation disclaimer — surfaced near the bottom of the screen
            so anyone scrolling through the analytics has read what these
            numbers actually mean before drawing conclusions. */}
        <AnalyticsCard t={t} style={styles.disclaimerCard}>
          <Text style={[styles.disclaimerTitle, { color: t.text }]}>About these scores</Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary }]}>
            {UCAT_SCORE_DISCLAIMER}
          </Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary, marginTop: 8 }]}>
            Read the full methodology in <Text style={{ fontWeight: '700' }}>About UCAT → Scoring</Text>.
          </Text>
        </AnalyticsCard>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ t, label, value, valueColor }) {
  return <AnalyticsTile t={t} label={label} value={value} valueColor={valueColor} />;
}

// Formats the delta from the user's average to the 2025 UK mean.
// "+38 above average", "-72 below average", or "matches the average"
// when within 5 points either side.
function benchmarkDelta(userAvg, mean) {
  const delta = userAvg - mean;
  if (Math.abs(delta) <= 5) return 'matches the 2025 average';
  if (delta > 0) return `+${delta} above average`;
  return `${delta} below average`;
}

function Insight({ t, text }) {
  return <AnalyticsInsight t={t} text={text} />;
}

function difficultyInsight(normalPct, hardPct) {
  const gap = normalPct - hardPct;
  if (gap >= 25) {
    return `Big gap between normal (${normalPct}%) and hard (${hardPct}%) — the hard questions are where the points are. Focus practice there.`;
  }
  if (gap >= 10) {
    return `You're solid on normal questions (${normalPct}%) but the hard ones drop you to ${hardPct}%. Worth targeted practice.`;
  }
  if (gap >= 0) {
    return `Your normal/hard accuracy is close (${normalPct}% vs ${hardPct}%). You're holding up well under tougher questions.`;
  }
  return `You're scoring higher on hard questions (${hardPct}%) than normal ones (${normalPct}%). Don't get complacent on the easy ones.`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 34,
    gap: 14,
  },

  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tileValue: { fontSize: 22, fontWeight: '800' },
  tileLabel: { fontSize: 11, marginTop: 4, fontWeight: '600', letterSpacing: 0 },

  benchmarkStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    flexWrap: 'wrap',
  },
  benchmarkLabel: { flex: 1, minWidth: 160, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  benchmarkValue: { fontSize: 14, lineHeight: 18, fontWeight: '900', textAlign: 'right' },

  percentileLine: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17,
  },

  disclaimerCard: {
    marginTop: 2,
  },
  disclaimerTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  disclaimerBody: { fontSize: 12, lineHeight: 18 },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '900' },
  cardSub: { fontSize: 13, lineHeight: 19, marginTop: 6 },

  chartWrap: { marginTop: 12, alignItems: 'center' },

  barRow: { marginTop: 4, marginBottom: 10 },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: { fontSize: 13, fontWeight: '600' },
  barValue: { fontSize: 13, fontWeight: '700' },
  barTrack: { height: 9, borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },

  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  bigStat: { fontSize: 36, fontWeight: '800' },
  completionMeta: { fontSize: 12, flex: 1, lineHeight: 18 },
  pacingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  pacingSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  pacingSplitItem: { flex: 1, alignItems: 'center' },
  pacingSplitValue: { fontSize: 22, fontWeight: '800' },
  pacingSplitLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  pacingSplitDivider: { width: 1, height: 36 },

  insight: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  insightText: { fontSize: 13, lineHeight: 19 },

  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyInline: { fontSize: 13, marginTop: 12, lineHeight: 19, fontStyle: 'italic' },
});
