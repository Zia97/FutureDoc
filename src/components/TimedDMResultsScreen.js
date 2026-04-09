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
import DMQuestionRenderer from './dm/DMQuestionRenderer';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

function getDMScaledScore(pct) {
  return Math.round(300 + (pct / 100) * 600);
}

function getQuestionResult(q, answers) {
  const selected = answers[q.questionId];
  const isYesNo = YES_NO_TYPES.includes(q.type);

  if (isYesNo) {
    if (!selected || typeof selected !== 'object') return 'unanswered';
    if (q.statements?.length === 0) return 'unanswered';
    const allAnswered = q.statements.every((_, i) => selected[i] != null);
    if (!allAnswered) return 'unanswered';
    const allCorrect = q.statements.every((s, i) => selected[i] === s.answer);
    return allCorrect ? 'correct' : 'incorrect';
  }

  if (!selected) return 'unanswered';
  return selected === q.answer ? 'correct' : 'incorrect';
}

export default function TimedDMResultsScreen({ questions, answers, flags, test, onDone }) {
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const [reviewIndex, setReviewIndex] = useState(null);

  const questionResults = useMemo(
    () =>
      questions.map((q) => ({
        ...q,
        result: getQuestionResult(q, answers),
        flagged: flags ? flags.has(q.questionId) : false,
      })),
    [questions, answers, flags],
  );

  const correctCount = questionResults.filter((q) => q.result === 'correct').length;
  const incorrectCount = questionResults.filter((q) => q.result === 'incorrect').length;
  const unansweredCount = questionResults.filter((q) => q.result === 'unanswered').length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scaledScore = getDMScaledScore(pct);

  // ── Question review mode ──────────────────────────────────────────
  if (reviewIndex !== null) {
    const q = questions[reviewIndex];
    const prev = reviewIndex > 0 ? reviewIndex - 1 : null;
    const next = reviewIndex < questions.length - 1 ? reviewIndex + 1 : null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

        <View style={[styles.reviewHeader, { backgroundColor: '#1e3a8a' }]}>
          <TouchableOpacity
            onPress={() => setReviewIndex(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.reviewBackText}>← Results</Text>
          </TouchableOpacity>
          <Text style={styles.reviewHeaderTitle}>Q{reviewIndex + 1}</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          <DMQuestionRenderer
            question={q}
            answer={answers[q.questionId]}
            onAnswer={() => {}}
            submitted
            timedMode={false}
          />
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
              prev === null && styles.reviewNavBtnDisabled,
            ]}
            onPress={() => prev !== null && setReviewIndex(prev)}
            disabled={prev === null}
          >
            <Text style={[styles.reviewNavBtnText, { color: t.text }]}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.reviewNavBtn,
              { backgroundColor: t.bgInput, borderColor: t.borderStrong },
              next === null && styles.reviewNavBtnDisabled,
            ]}
            onPress={() => next !== null && setReviewIndex(next)}
            disabled={next === null}
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
        <Text style={[styles.sectionHeader, { color: t.textSecondary }]}>UCAT SCORE ESTIMATE</Text>
        <View style={[styles.ucatCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={[styles.scaledBadge, { backgroundColor: t.accent + '22' }]}>
            <Text style={[styles.scaledBadgeText, { color: t.accent }]}>{scaledScore}</Text>
          </View>
          <Text style={[styles.ucatDesc, { color: t.textSecondary }]}>
            Scaled score estimate (300–900)
          </Text>
          <Text style={[styles.ucatDisclaimer, { color: t.textSecondary }]}>
            * Estimate only. Actual UCAT score is cohort-scaled and varies each year.
          </Text>
        </View>

        {/* Question breakdown */}
        <Text style={[styles.sectionHeader, { color: t.textSecondary }]}>QUESTION BREAKDOWN</Text>

        {questionResults.map((q, idx) => (
          <TouchableOpacity
            key={q.questionId}
            style={[
              styles.questionRow,
              {
                backgroundColor: idx % 2 === 0 ? t.bgCard : (t.bgSecondary ?? t.bg),
                borderBottomColor: t.border,
              },
            ]}
            onPress={() => setReviewIndex(idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.qNumber, { color: t.text }]}>Q{idx + 1}</Text>
            <View style={styles.questionRowRight}>
              {q.flagged && <Text style={styles.flaggedBadge}>⚑</Text>}
              <View
                style={[styles.resultBadge, { backgroundColor: resultColor[q.result] + '22' }]}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  ucatCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  scaledBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
  },
  scaledBadgeText: {
    fontSize: 28,
    fontWeight: '800',
  },
  ucatDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  ucatDisclaimer: {
    fontSize: 10,
    fontStyle: 'italic',
    opacity: 0.6,
    marginTop: 2,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  reviewContent: {
    padding: 16,
  },
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
