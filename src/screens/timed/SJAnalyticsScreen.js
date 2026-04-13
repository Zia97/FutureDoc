import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import { getSJBand, SJ_UK_BANDS } from '../../lib/ucatScoring';

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
      bandDistribution: null,
      markBreakdown: null,
    };
  }

  const trend = rows.map((r) => {
    const band = getSJBand(r.score_percent);
    return {
      testId: r.test_id,
      label: `Test ${r.test_id}`,
      scorePercent: r.score_percent,
      band: band.band,
      bandColor: band.color,
    };
  });

  const bands = trend.map((t) => t.band);
  const avgPct = Math.round(
    rows.reduce((s, r) => s + r.score_percent, 0) / rows.length,
  );

  // Sum pre-aggregated summaries across all attempts.
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  let totalQuestions = 0, totalAnswered = 0;
  let fullMarks = 0, partialMarks = 0, zeroMarks = 0;
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

    if (s.mark_breakdown) {
      fullMarks += s.mark_breakdown.full ?? 0;
      partialMarks += s.mark_breakdown.partial ?? 0;
      zeroMarks += s.mark_breakdown.zero ?? 0;
    }

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

  const bandDistribution = [1, 2, 3, 4].map((b) => ({
    band: b,
    count: bands.filter((x) => x === b).length,
    ...SJ_UK_BANDS.find((bk) => bk.band === b),
  }));

  const totalMarked = fullMarks + partialMarks + zeroMarks;
  const markBreakdown = totalMarked > 0
    ? {
        full: { count: fullMarks, pct: pct(fullMarks, totalMarked) },
        partial: { count: partialMarks, pct: pct(partialMarks, totalMarked) },
        zero: { count: zeroMarks, pct: pct(zeroMarks, totalMarked) },
        total: totalMarked,
      }
    : null;

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
    headline: {
      avgPct,
      avgBand: getSJBand(avgPct),
      bestBand: getSJBand(rows.reduce((best, r) => Math.max(best, r.score_percent), 0)),
      latestBand: getSJBand(rows[rows.length - 1].score_percent),
    },
    trend,
    difficulty,
    completion,
    bandDistribution,
    markBreakdown,
    pacing,
    hasTimingData: timedCount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────────────────────────────────────

// SJ band trend chart — Y-axis shows bands 1–4 (1 at top, 4 at bottom).
// Each point coloured by band. Percentage shown above each point.
function BandLineChart({ data, t, gridColor, textColor, width }) {
  const W = width;
  const H = 200;
  const padX = 44;
  const padBottom = 30;
  const padTop = 28;
  const innerW = W - padX * 2;
  const innerH = H - padBottom - padTop;
  const n = data.length;

  // Band 1 = top, Band 4 = bottom
  const xFor = (i) =>
    padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yFor = (band) => padTop + ((band - 1) / 3) * innerH;

  const path = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.band)}`)
    .join(' ');

  const yTicks = [1, 2, 3, 4];

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
          y={yFor(tk) + 4}
          fontSize={11}
          fill={textColor}
          textAnchor="end"
          fontWeight="700"
        >
          Band {tk}
        </SvgText>
      ))}

      {n > 1 && (
        <Path d={path} stroke={t.accent} strokeWidth={2.5} fill="none" />
      )}

      {data.map((d, i) => (
        <Circle
          key={`c${i}`}
          cx={xFor(i)}
          cy={yFor(d.band)}
          r={5}
          fill={d.bandColor}
        />
      ))}
      {data.map((d, i) => (
        <SvgText
          key={`v${i}`}
          x={xFor(i)}
          y={yFor(d.band) - 10}
          fontSize={10}
          fontWeight="700"
          fill={d.bandColor}
          textAnchor="middle"
        >
          {d.scorePercent}%
        </SvgText>
      ))}
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

// Horizontal stacked bar showing mark quality (full / partial / zero).
function MarkBar({ full, partial, zero, t }) {
  const total = full + partial + zero;
  if (total === 0) return null;
  const fp = (full / total) * 100;
  const pp = (partial / total) * 100;
  return (
    <View style={styles.markBarTrack}>
      <View style={[styles.markBarSegment, { width: `${fp}%`, backgroundColor: t.correct }]} />
      <View style={[styles.markBarSegment, { width: `${pp}%`, backgroundColor: '#d97706' }]} />
      <View style={[styles.markBarSegment, { flex: 1, backgroundColor: t.danger }]} />
    </View>
  );
}

function StatBar({ label, value, sub, color, barBg, textColor, mutedColor }) {
  const width = value == null ? 0 : value;
  return (
    <View style={styles.barRow}>
      <View style={styles.barHeader}>
        <Text style={[styles.barLabel, { color: textColor }]}>{label}</Text>
        <Text style={[styles.barValue, { color: textColor }]}>
          {value == null ? '\u2014' : `${value}%`}
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

export default function SJAnalyticsScreen({ route, preloadedRows }) {
  const { theme: t } = useTheme();
  const { user } = useAuth();
  const tests = route.params?.tests ?? [];
  const hasPreloaded = preloadedRows !== undefined;

  const [rows, setRows] = useState(hasPreloaded ? preloadedRows : null);
  const [loading, setLoading] = useState(!hasPreloaded);
  const [error, setError] = useState(null);
  const [chartWidth, setChartWidth] = useState(320);

  const load = useCallback(async () => {
    if (hasPreloaded) return;
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await db.loadSJAnalytics();
      setRows(data);
      setError(null);
    } catch (err) {
      if (__DEV__) console.error('[SJAnalyticsScreen] load failed:', err);
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

  useEffect(() => {
    if (hasPreloaded) {
      setRows(preloadedRows);
      setLoading(false);
    }
  }, [hasPreloaded, preloadedRows]);

  const stats = useMemo(() => aggregate(rows ?? [], tests), [rows, tests]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <ActivityIndicator size="large" color={t.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <Text style={[styles.emptyText, { color: t.textSecondary }]}>
          Couldn't load analytics. Pull down or come back later.
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <Text style={[styles.emptyTitle, { color: t.text }]}>Sign in to see analytics</Text>
        <Text style={[styles.emptyText, { color: t.textSecondary }]}>
          Performance analytics are tied to your account so they survive reinstall and
          sync across devices.
        </Text>
      </View>
    );
  }

  if (stats.attemptCount === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: t.bgInput }]}>
        <Text style={[styles.emptyTitle, { color: t.text }]}>No data yet</Text>
        <Text style={[styles.emptyText, { color: t.textSecondary }]}>
          Complete a timed Situational Judgement test to start building your performance
          analytics.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bgInput }]} edges={['bottom']}>
      <StatusBar barStyle={t.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Headline tiles — SJ uses bands, not scaled scores */}
        <View style={styles.tileRow}>
          <Tile t={t} label="Tests" value={stats.attemptCount} />
          <Tile
            t={t}
            label="Average Band"
            value={`Band ${stats.headline.avgBand.band}`}
            valueColor={stats.headline.avgBand.color}
          />
          <Tile
            t={t}
            label="Best Band"
            value={`Band ${stats.headline.bestBand.band}`}
            valueColor={stats.headline.bestBand.color}
          />
        </View>

        {/* Average band description */}
        <View style={[styles.benchmarkStrip, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.benchmarkLabel, { color: t.textSecondary }]}>
            Average: {stats.headline.avgPct}% marks
          </Text>
          <Text style={[styles.benchmarkValue, { color: stats.headline.avgBand.color }]}>
            {stats.headline.avgBand.description.split('\u2014')[0].trim()}
          </Text>
        </View>

        {/* Band trend chart */}
        <View
          style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 24)}
        >
          <Text style={[styles.cardTitle, { color: t.text }]}>Band over time</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Your SJ band on each test, in the order you took them. Band 1 is best.
            Percentage above each point shows your mark score.
          </Text>
          <View style={styles.chartWrap}>
            <BandLineChart
              data={stats.trend}
              t={t}
              gridColor={t.border}
              textColor={t.textSecondary}
              width={chartWidth}
            />
          </View>
        </View>

        {/* Band distribution */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Band distribution</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How many of your tests landed in each band.
          </Text>
          <View style={{ marginTop: 14, gap: 8 }}>
            {stats.bandDistribution.map((b) => (
              <View key={b.band} style={styles.bandRow}>
                <View style={[styles.bandDot, { backgroundColor: b.color }]} />
                <Text style={[styles.bandLabel, { color: t.text }]}>
                  Band {b.band}
                </Text>
                <Text style={[styles.bandDesc, { color: t.textSecondary }]}>
                  {b.description.split('\u2014')[0].trim()}
                </Text>
                <Text style={[styles.bandCount, { color: t.text }]}>
                  {b.count}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mark quality breakdown */}
        {stats.markBreakdown && (
          <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Mark quality</Text>
            <Text style={[styles.cardSub, { color: t.textSecondary }]}>
              SJ uses partial credit: 4 marks for exact match, 2 for one position off, 0 for
              further away. Higher full-mark rate means stronger judgement alignment.
            </Text>
            <View style={{ marginTop: 14 }}>
              <MarkBar
                full={stats.markBreakdown.full.count}
                partial={stats.markBreakdown.partial.count}
                zero={stats.markBreakdown.zero.count}
                t={t}
              />
              <View style={[styles.markLegend, { marginTop: 12 }]}>
                <LegendItem color={t.correct} label="Full (4)" value={`${stats.markBreakdown.full.pct}%`} textColor={t.text} />
                <LegendItem color="#d97706" label="Partial (2)" value={`${stats.markBreakdown.partial.pct}%`} textColor={t.text} />
                <LegendItem color={t.danger} label="Zero (0)" value={`${stats.markBreakdown.zero.pct}%`} textColor={t.text} />
              </View>
            </View>
            {markInsight(stats.markBreakdown) && (
              <Insight t={t} text={markInsight(stats.markBreakdown)} />
            )}
          </View>
        )}

        {/* Pacing */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
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
                      {stats.pacing.avgCorrectSec != null ? `${stats.pacing.avgCorrectSec}s` : '\u2014'}
                    </Text>
                    <Text style={[styles.pacingSplitLabel, { color: t.textSecondary }]}>
                      avg on exact
                    </Text>
                  </View>
                  <View style={[styles.pacingSplitDivider, { backgroundColor: t.border }]} />
                  <View style={styles.pacingSplitItem}>
                    <Text style={[styles.pacingSplitValue, { color: t.danger }]}>
                      {stats.pacing.avgIncorrectSec != null ? `${stats.pacing.avgIncorrectSec}s` : '\u2014'}
                    </Text>
                    <Text style={[styles.pacingSplitLabel, { color: t.textSecondary }]}>
                      avg on non-exact
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Difficulty breakdown — exact matches only (4 marks) */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Exact match by difficulty</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How often you pick the exact correct answer on standard vs harder questions.
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
        </View>

        {/* Completion rate */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Completion rate</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How often you answer every question before the timer runs out.
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
              text={`You're leaving ~${stats.completion.unansweredAvg} questions blank per test. Unanswered SJ questions score 0 marks — always put an answer down, even if unsure.`}
            />
          )}
        </View>

        {/* SJ scoring disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.disclaimerTitle, { color: t.text }]}>About SJ bands</Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary }]}>
            Unlike VR, DM, and QR, Situational Judgement is reported as a band (1–4) rather
            than a scaled score. Band boundaries are set annually by the UCAT Consortium based
            on the candidate distribution. The bands shown here are approximate thresholds
            derived from community data — your actual UCAT SJ band may differ.
          </Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary, marginTop: 8 }]}>
            SJ uses partial credit: you receive 4 marks for the exact answer, 2 marks if
            one position away, and 0 marks if two or more positions away.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({ t, label, value, valueColor }) {
  return (
    <View style={[styles.tile, { backgroundColor: t.bgCard, borderColor: t.border }]}>
      <Text style={[styles.tileValue, { color: valueColor ?? t.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: t.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Insight({ t, text }) {
  return (
    <View style={[styles.insight, { backgroundColor: t.accentDim, borderColor: t.accent }]}>
      <Text style={[styles.insightText, { color: t.text }]}>{text}</Text>
    </View>
  );
}

function LegendItem({ color, label, value, textColor }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.legendValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function markInsight(breakdown) {
  const { full, partial, zero } = breakdown;
  if (full.pct >= 60) {
    return `Strong alignment — ${full.pct}% of your answers are exact matches. You're reading scenarios the way the expert panel does.`;
  }
  if (partial.pct >= 50) {
    return `You're close on most questions (${partial.pct}% partial credit) but not quite landing the exact answer. Review the mark schemes to calibrate your judgement.`;
  }
  if (zero.pct >= 40) {
    return `${zero.pct}% of your answers score zero marks — you're often two or more positions away from the correct answer. Focus on understanding the GMC principles behind SJ scenarios.`;
  }
  return null;
}

function difficultyInsight(normalPct, hardPct) {
  const gap = normalPct - hardPct;
  if (gap >= 25) {
    return `Big gap between normal (${normalPct}%) and hard (${hardPct}%) exact matches. The harder scenarios test more nuanced judgement — practise reasoning through the mark schemes.`;
  }
  if (gap >= 10) {
    return `You're solid on normal questions (${normalPct}%) but the hard ones drop to ${hardPct}%. Worth reviewing the trickier scenarios.`;
  }
  if (gap >= 0) {
    return `Your normal/hard exact-match rate is close (${normalPct}% vs ${hardPct}%). You're holding up well on tougher scenarios.`;
  }
  return `You're scoring higher on hard questions (${hardPct}%) than normal ones (${normalPct}%). Don't get complacent on the straightforward scenarios.`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  scroll: { padding: 16, gap: 14 },

  tileRow: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tileValue: { fontSize: 18, fontWeight: '800' },
  tileLabel: { fontSize: 11, marginTop: 4, fontWeight: '600', letterSpacing: 0.5 },

  benchmarkStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: -4,
  },
  benchmarkLabel: { fontSize: 12, fontWeight: '600' },
  benchmarkValue: { fontSize: 13, fontWeight: '800' },

  disclaimerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    opacity: 0.92,
  },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  disclaimerBody: { fontSize: 12, lineHeight: 18 },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 4 },

  chartWrap: { marginTop: 12, alignItems: 'center' },

  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bandDot: { width: 10, height: 10, borderRadius: 5 },
  bandLabel: { fontSize: 13, fontWeight: '700', width: 52 },
  bandDesc: { fontSize: 12, flex: 1 },
  bandCount: { fontSize: 16, fontWeight: '800', minWidth: 24, textAlign: 'right' },

  markBarTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  markBarSegment: { height: '100%' },

  markLegend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, fontWeight: '600' },
  legendValue: { fontSize: 11, fontWeight: '700' },

  barRow: { marginTop: 4, marginBottom: 10 },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: { fontSize: 13, fontWeight: '600' },
  barValue: { fontSize: 13, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },

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

  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 16,
  },
  bigStat: { fontSize: 36, fontWeight: '800' },
  completionMeta: { fontSize: 12, flex: 1, lineHeight: 18 },

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
