import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/dbQueries';
import {
  getDMScaledScore,
  scoreColor,
  formatPercentile,
  DM_2025_MEAN,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER,
} from '../../lib/ucatScoring';

// ─────────────────────────────────────────────────────────────────────────────
// Question-type labels
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS = {
  syllogism:                'Syllogisms',
  logic_puzzle:             'Logical Puzzles',
  recognising_assumptions:  'Recognising Assumptions',
  interpreting_info:        'Interpreting Information',
  venn_diagram:             'Venn Diagrams',
  probabilistic:            'Probabilistic Reasoning',
  passage_syllogism:        'Passage Syllogisms',
  // Legacy fallback — DB rows written before the rename migration
  strongest_argument:       'Recognising Assumptions',
  unknown:                  'Unknown',
};

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation
// ─────────────────────────────────────────────────────────────────────────────

function aggregate(rows, tests) {
  if (!rows || rows.length === 0) {
    return {
      attemptCount: 0,
      headline: null,
      trend: [],
      questionType: null,
      difficulty: null,
      completion: null,
      pacing: null,
      hasTimingData: false,
    };
  }

  const trend = rows.map((r) => ({
    testId: r.test_id,
    label: `Test ${r.test_id}`,
    score: getDMScaledScore(r.score_percent),
    scorePercent: r.score_percent,
    submittedAt: r.submitted_at,
  }));

  const scaledScores = trend.map((t) => t.score);
  const avg = Math.round(scaledScores.reduce((a, b) => a + b, 0) / scaledScores.length);
  const best = Math.max(...scaledScores);

  // Sum pre-aggregated summaries across all attempts.
  let totalQuestions = 0, totalAnswered = 0;
  let normalCorrect = 0, normalTotal = 0, hardCorrect = 0, hardTotal = 0;
  let totalTimeMs = 0, timedCount = 0;
  let correctTimeMs = 0, correctTimedCount = 0;
  let incorrectTimeMs = 0, incorrectTimedCount = 0;

  // Seed all 6 official types so they always appear in the breakdown.
  const OFFICIAL_TYPES = [
    'syllogism', 'logic_puzzle', 'recognising_assumptions',
    'interpreting_info', 'venn_diagram', 'probabilistic',
  ];
  const typeTotals = {};
  for (const t of OFFICIAL_TYPES) typeTotals[t] = { correct: 0, total: 0 };

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

    // Merge type breakdown
    if (s.type_breakdown) {
      for (const [qtype, counts] of Object.entries(s.type_breakdown)) {
        if (!typeTotals[qtype]) typeTotals[qtype] = { correct: 0, total: 0 };
        typeTotals[qtype].correct += counts.correct ?? 0;
        typeTotals[qtype].total += counts.total ?? 0;
      }
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

  const questionType = Object.entries(typeTotals)
    .map(([key, v]) => ({
      key,
      label: QUESTION_TYPE_LABELS[key] ?? key,
      value: pct(v.correct, v.total),
      correct: v.correct,
      total: v.total,
    }))
    .sort((a, b) => b.total - a.total);

  const unanswered = totalQuestions - totalAnswered;
  const completion = {
    answered: totalAnswered,
    total: totalQuestions,
    unansweredAvg: rows.length > 0 ? Math.round(unanswered / rows.length) : 0,
    answeredPct: pct(totalAnswered, totalQuestions),
  };

  const difficulty = {
    normal: { value: pct(normalCorrect, normalTotal), correct: normalCorrect, total: normalTotal },
    hard:   { value: pct(hardCorrect, hardTotal),     correct: hardCorrect,   total: hardTotal },
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
    questionType,
    difficulty,
    completion,
    pacing,
    hasTimingData: timedCount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────────────────────────────────────

function ScoreLineChart({ data, t, gridColor, textColor, width }) {
  const W = width;
  const H = 230;
  const padX = 44;
  const padBottom = 30;
  const padTop = 22;
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
  const meanY = yFor(DM_2025_MEAN);

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
        2025 avg {DM_2025_MEAN}
      </SvgText>

      {n > 1 && (
        <Path d={path} stroke={t.accent} strokeWidth={2.5} fill="none" />
      )}

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

export default function DMAnalyticsScreen({ route }) {
  const { theme: t } = useTheme();
  const { user } = useAuth();
  const tests = route.params?.tests ?? [];

  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartWidth, setChartWidth] = useState(320);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await db.loadDMAnalytics();
      setRows(data);
      setError(null);
    } catch (err) {
      if (__DEV__) console.error('[DMAnalyticsScreen] load failed:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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
          Complete a timed Decision Making test to start building your performance
          analytics.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bgInput }]} edges={['bottom']}>
      <StatusBar barStyle={t.statusBar} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Headline tiles */}
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

        {/* 2025 average comparison strip */}
        <View style={[styles.benchmarkStrip, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.benchmarkLabel, { color: t.textSecondary }]}>
            vs 2025 UK average ({DM_2025_MEAN})
          </Text>
          <Text style={[styles.benchmarkValue, { color: scoreColor(stats.headline.avg, t) }]}>
            ~{benchmarkDelta(stats.headline.avg, DM_2025_MEAN)}
          </Text>
        </View>

        {/* Score trend */}
        <View
          style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 24)}
        >
          <Text style={[styles.cardTitle, { color: t.text }]}>Score over time</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            Estimated UCAT scaled score on each test, in the order you took them.
            Vertical bars show the ±{SCORE_UNCERTAINTY}-point uncertainty in each
            estimate. Dashed line is the 2025 UK average ({DM_2025_MEAN}).
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
            const percentileText = latest ? formatPercentile('dm', latest.score) : null;
            if (!percentileText) return null;
            return (
              <Text style={[styles.percentileLine, { color: t.textSecondary }]}>
                Your latest test is at {percentileText} of 2025 UK UCAT candidates.
              </Text>
            );
          })()}
        </View>

        {/* Accuracy by question type — the DM-specific breakdown */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Accuracy by question type</Text>
          <Text style={[styles.cardSub, { color: t.textSecondary }]}>
            How you perform on each kind of DM question. Find your weak spots
            and focus your practice there.
          </Text>
          <View style={{ marginTop: 14 }}>
            {stats.questionType.length === 0 ? (
              <Text style={[styles.emptyInline, { color: t.textSecondary }]}>
                No data yet.
              </Text>
            ) : (
              stats.questionType.map((qt) => (
                <StatBar
                  key={qt.key}
                  label={qt.label}
                  value={qt.value}
                  sub={`${qt.correct} / ${qt.total}`}
                  color={qt.value != null ? scoreColor(300 + (qt.value / 100) * 600, t) : t.accent}
                  barBg={t.bgInput}
                  textColor={t.text}
                  mutedColor={t.textSecondary}
                />
              ))
            )}
          </View>
          {questionTypeInsight(stats.questionType) && (
            <Insight t={t} text={questionTypeInsight(stats.questionType)} />
          )}
        </View>

        {/* Difficulty breakdown */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
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
        </View>

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
                      avg on correct
                    </Text>
                  </View>
                  <View style={[styles.pacingSplitDivider, { backgroundColor: t.border }]} />
                  <View style={styles.pacingSplitItem}>
                    <Text style={[styles.pacingSplitValue, { color: t.danger }]}>
                      {stats.pacing.avgIncorrectSec != null ? `${stats.pacing.avgIncorrectSec}s` : '\u2014'}
                    </Text>
                    <Text style={[styles.pacingSplitLabel, { color: t.textSecondary }]}>
                      avg on incorrect
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Completion rate */}
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
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
              text={`You're leaving ~${stats.completion.unansweredAvg} questions blank per test. For statement-based questions, even a guess on each statement gives you a chance — don't leave them blank.`}
            />
          )}
        </View>

        {/* Estimation disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.disclaimerTitle, { color: t.text }]}>About these scores</Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary }]}>
            {UCAT_SCORE_DISCLAIMER}
          </Text>
          <Text style={[styles.disclaimerBody, { color: t.textSecondary, marginTop: 8 }]}>
            Read the full methodology in <Text style={{ fontWeight: '700' }}>About UCAT → Scoring</Text>.
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

function benchmarkDelta(userAvg, mean) {
  const delta = userAvg - mean;
  if (Math.abs(delta) <= 5) return 'matches the 2025 average';
  if (delta > 0) return `+${delta} above average`;
  return `${delta} below average`;
}

// Calls out the user's strongest and weakest question type when there's
// enough data to be meaningful. Requires >= 3 samples per type.
function questionTypeInsight(questionTypes) {
  const eligible = questionTypes.filter((qt) => qt.total >= 3 && qt.value != null);
  if (eligible.length < 2) return null;
  const sorted = [...eligible].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  if (best.value - worst.value < 15) return null;
  return `Strongest: ${best.label} (${best.value}%). Weakest: ${worst.label} (${worst.value}%). Spend more practice time on ${worst.label.toLowerCase()} questions.`;
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
  tileValue: { fontSize: 22, fontWeight: '800' },
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
  benchmarkValue: { fontSize: 14, fontWeight: '800' },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, marginTop: 4 },

  chartWrap: { marginTop: 12, alignItems: 'center' },

  percentileLine: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 17,
  },

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

  disclaimerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 4,
    opacity: 0.92,
  },
  disclaimerTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  disclaimerBody: { fontSize: 12, lineHeight: 18 },

  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyInline: { fontSize: 13, marginTop: 12, lineHeight: 19, fontStyle: 'italic' },
});
