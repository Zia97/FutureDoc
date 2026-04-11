import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { LABEL_SETS } from '../constants/sjLabelSets';
import AnswerOptionButton from './AnswerOptionButton';
import FeedbackBox from './FeedbackBox';
import {
  getSJBand,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER_SHORT,
} from '../lib/ucatScoring';

// ── UCAT SJ scoring helpers ───────────────────────────────────────────────────
// Mark scheme: 4 marks (exact), 2 marks (1 position off), 0 marks (2+ off / unanswered)
// Source: widely-cited UCAT SJT marking scheme used by official prep resources.
function sjMarkForQuestion(selected, correct, labelSet) {
  if (!selected) return 0;
  const si = labelSet.indexOf(selected);
  const ci = labelSet.indexOf(correct);
  if (si === -1 || ci === -1) return 0;
  const diff = Math.abs(si - ci);
  if (diff === 0) return 4;
  if (diff === 1) return 2;
  return 0;
}

// ANZ uses a 300–900 scaled score for SJ (UK uses bands). Without
// section-specific anchor data we keep the linear estimate; ANZ has its
// own annual statistics that we don't track separately yet.
function getANZScaledScore(rawPct) {
  return Math.round(300 + (rawPct / 100) * 600);
}
// ─────────────────────────────────────────────────────────────────────────────

export default function TimedSJResultsScreen({ scenarios, getAnswer, flags, test, onDone }) {
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const [reviewItem, setReviewItem] = useState(null); // null | { passageIndex, questionIndex }

  const flatQuestions = useMemo(() => {
    const list = [];
    scenarios.forEach((s, sIdx) => {
      s.items.forEach((item, iIdx) => {
        const selected = getAnswer(s.scenarioId, item.itemId);
        const answered = !!selected;
        const correct = answered && selected === item.answer;
        const result = !answered ? 'unanswered' : correct ? 'correct' : 'incorrect';
        list.push({
          globalIndex: list.length,
          passageIndex: sIdx,
          questionIndex: iIdx,
          questionId: item.itemId,
          result,
          flagged: flags.has(item.itemId),
        });
      });
    });
    return list;
  }, [scenarios, getAnswer, flags]);

  // Raw UCAT mark totals
  const { rawScore, maxRawScore } = useMemo(() => {
    let raw = 0;
    let max = 0;
    scenarios.forEach((s) => {
      s.items.forEach((item) => {
        const labelSet = item.type === 'importance' ? LABEL_SETS[1] : LABEL_SETS[2];
        const selected = getAnswer(s.scenarioId, item.itemId);
        raw += sjMarkForQuestion(selected, item.answer, labelSet);
        max += 4;
      });
    });
    return { rawScore: raw, maxRawScore: max };
  }, [scenarios, getAnswer]);

  const rawPct = maxRawScore > 0 ? (rawScore / maxRawScore) * 100 : 0;
  const ukBand = getSJBand(rawPct);
  const anzScore = getANZScaledScore(rawPct);

  const correctCount = flatQuestions.filter((q) => q.result === 'correct').length;
  const incorrectCount = flatQuestions.filter((q) => q.result === 'incorrect').length;
  const unansweredCount = flatQuestions.filter((q) => q.result === 'unanswered').length;
  const total = flatQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // ── Question review mode ──────────────────────────────────────────
  if (reviewItem !== null) {
    const { passageIndex, questionIndex } = reviewItem;
    const scenario = scenarios[passageIndex];
    const item = scenario.items[questionIndex];
    const selectedAnswer = getAnswer(scenario.scenarioId, item.itemId);
    const isCorrect = !!selectedAnswer && selectedAnswer === item.answer;
    const labelSet = item.type === 'importance' ? LABEL_SETS[1] : LABEL_SETS[2];

    const currentGlobal = flatQuestions.findIndex(
      (q) => q.passageIndex === passageIndex && q.questionIndex === questionIndex,
    );
    const prev = currentGlobal > 0 ? flatQuestions[currentGlobal - 1] : null;
    const next = currentGlobal < flatQuestions.length - 1 ? flatQuestions[currentGlobal + 1] : null;

    function getOptionState(opt) {
      if (opt === item.answer) return 'correct';
      if (selectedAnswer && opt === selectedAnswer && !isCorrect) return 'incorrect';
      return 'idle';
    }

    const questionContext = !isCorrect
      ? {
          question: item.text,
          questionType: 'situational_judgement',
          section: 'sj',
          passage: scenario.stem,
          options: labelSet,
          correctAnswer: item.answer,
          userAnswer: selectedAnswer ?? 'Not answered',
          explanation: item.answeringReason,
        }
      : undefined;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

        <View style={[styles.reviewHeader, { backgroundColor: '#1e3a8a' }]}>
          <TouchableOpacity
            onPress={() => setReviewItem(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.reviewBackText}>← Results</Text>
          </TouchableOpacity>
          <Text style={styles.reviewHeaderTitle}>
            Q{currentGlobal + 1} · Scenario {passageIndex + 1}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.stemCard,
              { backgroundColor: t.bgCard, borderLeftColor: t.sectionSJ, borderColor: t.border },
            ]}
          >
            <Text style={[styles.stemLabel, { color: t.sectionSJ }]}>SCENARIO</Text>
            <Text style={[styles.stemText, { color: t.textSecondary }]}>{scenario.stem}</Text>
          </View>

          <View
            style={[styles.questionCard, { backgroundColor: t.bgCard, borderColor: t.border }]}
          >
            <Text style={[styles.questionText, { color: t.text }]}>{item.text}</Text>
            <View style={styles.optionsContainer}>
              {labelSet.map((opt) => (
                <AnswerOptionButton
                  key={opt}
                  label={opt}
                  state={getOptionState(opt)}
                  onPress={() => {}}
                />
              ))}
            </View>
            <FeedbackBox
              isCorrect={isCorrect}
              correctAnswer={item.answer}
              reason={item.answeringReason}
              showReason
              questionContext={questionContext}
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.reviewNavBar,
            { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 4 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.reviewNavBtn,
              { backgroundColor: t.bgInput, borderColor: t.borderStrong },
              !prev && styles.reviewNavBtnDisabled,
            ]}
            onPress={() =>
              prev && setReviewItem({ passageIndex: prev.passageIndex, questionIndex: prev.questionIndex })
            }
            disabled={!prev}
          >
            <Text style={[styles.reviewNavBtnText, { color: t.text }]}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.reviewNavBtn,
              { backgroundColor: t.bgInput, borderColor: t.borderStrong },
              !next && styles.reviewNavBtnDisabled,
            ]}
            onPress={() =>
              next && setReviewItem({ passageIndex: next.passageIndex, questionIndex: next.questionIndex })
            }
            disabled={!next}
          >
            <Text style={[styles.reviewNavBtnText, { color: t.text }]}>Next →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Results summary mode ──────────────────────────────────────────
  const resultColor = {
    correct: t.correct,
    incorrect: t.danger,
    unanswered: t.textSecondary,
  };
  const resultLabel = {
    correct: 'Correct',
    incorrect: 'Incorrect',
    unanswered: 'Unanswered',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      <View style={[styles.header, { backgroundColor: '#1e3a8a' }]}>
        <Text style={styles.headerTitle}>{test.title} — Results</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score card */}
        <View style={[styles.scoreCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.scorePercent, { color: t.text }]}>{pct}%</Text>
          <Text style={[styles.scoreSubLabel, { color: t.textSecondary }]}>
            {correctCount} of {total} correct
          </Text>

          <View style={styles.scoreStats}>
            <View style={styles.scoreStat}>
              <Text style={[styles.scoreStatNum, { color: t.correct }]}>{correctCount}</Text>
              <Text style={[styles.scoreStatLabel, { color: t.textSecondary }]}>Correct</Text>
            </View>
            <View style={[styles.scoreStatDivider, { backgroundColor: t.border }]} />
            <View style={styles.scoreStat}>
              <Text style={[styles.scoreStatNum, { color: t.danger }]}>{incorrectCount}</Text>
              <Text style={[styles.scoreStatLabel, { color: t.textSecondary }]}>Incorrect</Text>
            </View>
            <View style={[styles.scoreStatDivider, { backgroundColor: t.border }]} />
            <View style={styles.scoreStat}>
              <Text style={[styles.scoreStatNum, { color: t.textSecondary }]}>{unansweredCount}</Text>
              <Text style={[styles.scoreStatLabel, { color: t.textSecondary }]}>Unanswered</Text>
            </View>
          </View>
        </View>

        {/* UCAT Score */}
        <Text style={[styles.sectionHeader, { color: t.textSecondary }]}>UCAT SCORE</Text>
        <View style={[styles.ucatRow, { borderColor: t.border }]}>
          {/* UK Band */}
          <View style={[styles.ucatCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.ucatCardRegion, { color: t.textSecondary }]}>UK</Text>
            <View style={[styles.bandBadge, { backgroundColor: ukBand.color + '22' }]}>
              <Text style={[styles.bandBadgeText, { color: ukBand.color }]}>Band {ukBand.band}</Text>
            </View>
            <Text style={[styles.ucatRaw, { color: t.textSecondary }]}>
              {rawScore} / {maxRawScore} marks
            </Text>
            <Text style={[styles.ucatDesc, { color: t.textSecondary }]}>{ukBand.description}</Text>
            <Text style={[styles.ucatDisclaimer, { color: t.textSecondary }]}>
              * Approximate — official band thresholds vary each year
            </Text>
          </View>

          {/* ANZ Score */}
          <View style={[styles.ucatCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.ucatCardRegion, { color: t.textSecondary }]}>AU / NZ</Text>
            <View style={[styles.bandBadge, { backgroundColor: ukBand.color + '22' }]}>
              <Text style={[styles.bandBadgeText, { color: ukBand.color }]}>
                {anzScore} ±{SCORE_UNCERTAINTY}
              </Text>
            </View>
            <Text style={[styles.ucatRaw, { color: t.textSecondary }]}>
              {rawScore} / {maxRawScore} marks
            </Text>
            <Text style={[styles.ucatDesc, { color: t.textSecondary }]}>Band {ukBand.band} · {ukBand.description}</Text>
            <Text style={[styles.ucatDisclaimer, { color: t.textSecondary }]}>
              * {UCAT_SCORE_DISCLAIMER_SHORT}
            </Text>
          </View>
        </View>

        {/* Question breakdown */}
        <Text style={[styles.sectionHeader, { color: t.textSecondary }]}>QUESTION BREAKDOWN</Text>

        {flatQuestions.map((q, idx) => (
          <TouchableOpacity
            key={q.questionId}
            style={[
              styles.questionRow,
              {
                backgroundColor: idx % 2 === 0 ? t.bgCard : (t.bgSecondary ?? t.bg),
                borderBottomColor: t.border,
              },
            ]}
            onPress={() =>
              setReviewItem({ passageIndex: q.passageIndex, questionIndex: q.questionIndex })
            }
            activeOpacity={0.7}
          >
            <View style={styles.questionRowLeft}>
              <Text style={[styles.qNumber, { color: t.text }]}>Q{q.globalIndex + 1}</Text>
              <Text style={[styles.qScenario, { color: t.textSecondary }]}>
                Scenario {q.passageIndex + 1}
              </Text>
            </View>
            <View style={styles.questionRowRight}>
              {q.flagged && <Text style={styles.flaggedBadge}>⚑</Text>}
              <View
                style={[
                  styles.resultBadge,
                  { backgroundColor: resultColor[q.result] + '22' },
                ]}
              >
                <Text style={[styles.resultBadgeText, { color: resultColor[q.result] }]}>
                  {resultLabel[q.result]}
                </Text>
              </View>
              <Text style={[styles.rowChevron, { color: t.textSecondary }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: t.bgCard, borderTopColor: t.border, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: '#1e3a8a' }]}
          onPress={onDone}
          activeOpacity={0.85}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // ── Summary header ──
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // ── Score card ──
  scoreCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  scorePercent: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  scoreSubLabel: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  scoreStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  scoreStat: {
    flex: 1,
    alignItems: 'center',
  },
  scoreStatNum: {
    fontSize: 26,
    fontWeight: '800',
  },
  scoreStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  scoreStatDivider: {
    width: 1,
    height: 36,
  },
  // ── Question list ──
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  questionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qNumber: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 36,
  },
  qScenario: {
    fontSize: 13,
  },
  flaggedBadge: {
    fontSize: 16,
    color: '#d97706',
  },
  resultBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rowChevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  // ── UCAT score section ──
  ucatRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  ucatCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  ucatCardRegion: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bandBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 2,
  },
  bandBadgeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  ucatRaw: {
    fontSize: 12,
    fontWeight: '600',
  },
  ucatDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  ucatDisclaimer: {
    fontSize: 10,
    fontStyle: 'italic',
    opacity: 0.6,
    marginTop: 2,
  },
  // ── Bottom bar ──
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  // ── Review header ──
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewBackText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewHeaderTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // ── Review content ──
  reviewContent: {
    padding: 16,
    gap: 12,
  },
  stemCard: {
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  stemLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  stemText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  // ── Review nav ──
  reviewNavBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  reviewNavBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  reviewNavBtnDisabled: {
    opacity: 0.3,
  },
  reviewNavBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
