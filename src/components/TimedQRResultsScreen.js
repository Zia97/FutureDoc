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
import AnswerOptionButton from './AnswerOptionButton';
import FeedbackBox from './FeedbackBox';
import QRStimulusRenderer from './qr/QRStimulusRenderer';
import {
  getQRScaledScore,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER_SHORT,
} from '../lib/ucatScoring';

export default function TimedQRResultsScreen({ sets, getAnswer, flags, test, onDone }) {
  const { practiceTheme: t } = useTheme();
  const insets = useSafeAreaInsets();
  const [reviewItem, setReviewItem] = useState(null); // null | { setIndex, questionIndex }

  const flatQuestions = useMemo(() => {
    const list = [];
    sets.forEach((s, sIdx) => {
      s.questions.forEach((q, qIdx) => {
        const selected = getAnswer(s.setId, q.questionId);
        const answered = !!selected;
        const correct = answered && selected === q.answer;
        const result = correct ? 'correct' : 'incorrect';
        list.push({
          globalIndex: list.length,
          setIndex: sIdx,
          questionIndex: qIdx,
          questionId: q.questionId,
          result,
          flagged: flags.has(q.questionId),
        });
      });
    });
    return list;
  }, [sets, getAnswer, flags]);

  const correctCount = flatQuestions.filter((q) => q.result === 'correct').length;
  const incorrectCount = flatQuestions.filter((q) => q.result === 'incorrect').length;
  const total = flatQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scaledScore = getQRScaledScore(pct);

  // ── Question review mode ──────────────────────────────────────────
  if (reviewItem !== null) {
    const { setIndex, questionIndex } = reviewItem;
    const set = sets[setIndex];
    const q = set.questions[questionIndex];
    const selectedAnswer = getAnswer(set.setId, q.questionId);
    const isCorrect = !!selectedAnswer && selectedAnswer === q.answer;

    const currentGlobal = flatQuestions.findIndex(
      (fq) => fq.setIndex === setIndex && fq.questionIndex === questionIndex,
    );
    const prev = currentGlobal > 0 ? flatQuestions[currentGlobal - 1] : null;
    const next = currentGlobal < flatQuestions.length - 1 ? flatQuestions[currentGlobal + 1] : null;

    function getOptionState(opt) {
      if (opt.label === q.answer) return 'correct';
      if (selectedAnswer && opt.label === selectedAnswer && !isCorrect) return 'incorrect';
      return 'idle';
    }

    const questionContext = !isCorrect
      ? {
          question: q.stem,
          questionType: 'quantitative_reasoning',
          section: 'qr',
          stimulus: set.stimulus,
          options: q.options,
          correctAnswer: q.answer,
          userAnswer: selectedAnswer ?? 'Not answered',
          explanation: q.answeringReason,
          isTimed: true,
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
            Q{currentGlobal + 1} · Set {setIndex + 1}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.reviewContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.stimulusCard,
              { backgroundColor: t.bgCard, borderLeftColor: t.accent, borderColor: t.border },
            ]}
          >
            <Text style={[styles.stimulusLabel, { color: t.accent }]}>STIMULUS</Text>
            <QRStimulusRenderer stimulus={set.stimulus} />
          </View>

          <View
            style={[styles.questionCard, { backgroundColor: t.bgCard, borderColor: t.border }]}
          >
            <Text style={[styles.questionText, { color: t.text }]}>{q.stem}</Text>
            <View style={styles.optionsContainer}>
              {q.options.map((opt) => (
                <AnswerOptionButton
                  key={opt.label}
                  label={`${opt.label}.  ${opt.text}`}
                  state={getOptionState(opt)}
                  onPress={() => {}}
                />
              ))}
            </View>
            <FeedbackBox
              isCorrect={isCorrect}
              correctAnswer={q.answer}
              reason={q.answeringReason}
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
              prev && setReviewItem({ setIndex: prev.setIndex, questionIndex: prev.questionIndex })
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
              next && setReviewItem({ setIndex: next.setIndex, questionIndex: next.questionIndex })
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
  };
  const resultLabel = {
    correct: 'Correct',
    incorrect: 'Incorrect',
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
          </View>
        </View>

        {/* UCAT Score */}
        <Text style={[styles.sectionHeader, { color: t.textSecondary }]}>UCAT SCORE ESTIMATE</Text>
        <View style={[styles.ucatCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={[styles.scaledBadge, { backgroundColor: t.accent + '22' }]}>
            <Text style={[styles.scaledBadgeText, { color: t.accent }]}>
              {scaledScore} <Text style={styles.scaledBadgeRange}>±{SCORE_UNCERTAINTY}</Text>
            </Text>
          </View>
          <Text style={[styles.ucatDesc, { color: t.textSecondary }]}>
            Scaled score estimate (300–900)
          </Text>
          <Text style={[styles.ucatDisclaimer, { color: t.textSecondary }]}>
            * {UCAT_SCORE_DISCLAIMER_SHORT}
          </Text>
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
              setReviewItem({ setIndex: q.setIndex, questionIndex: q.questionIndex })
            }
            activeOpacity={0.7}
          >
            <View style={styles.questionRowLeft}>
              <Text style={[styles.qNumber, { color: t.text }]}>Q{q.globalIndex + 1}</Text>
              <Text style={[styles.qSet, { color: t.textSecondary }]}>
                Set {q.setIndex + 1}
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
  scaledBadgeRange: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
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
  qSet: {
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
    gap: 12,
  },
  stimulusCard: {
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
  },
  stimulusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
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
  reviewNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  reviewNavBtn: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
