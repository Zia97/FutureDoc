import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme } from '../theme/premiumTheme';
import { PremiumScreen } from './premium/PremiumPracticeUI';
import DMQuestionRenderer from './dm/DMQuestionRenderer';
import {
  getDMScaledScore,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER_SHORT,
} from '../lib/ucatScoring';
import {
  ResultsHeader,
  ScoreOverviewCard,
  UcatScoreCard,
  QuestionBreakdownRow,
  DoneBottomBar,
  ReviewHeader,
  ReviewNavBar,
  resultsStyles,
} from './premium/PremiumResultsUI';

const YES_NO_TYPES = ['syllogism', 'passage_syllogism', 'interpreting_info'];

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
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const accent = colors.teal;
  const [reviewIndex, setReviewIndex] = useState(null);

  const questionResults = useMemo(
    () =>
      questions.map((q, idx) => ({
        ...q,
        index: idx,
        result: getQuestionResult(q, answers),
        flagged: flags ? flags.has(q.questionId) : false,
        displayTitle: q.title ?? `Question ${idx + 1}`,
      })),
    [questions, answers, flags],
  );

  const correctCount = questionResults.filter((q) => q.result === 'correct').length;
  const incorrectCount = questionResults.filter((q) => q.result === 'incorrect').length;
  const unansweredCount = questionResults.filter((q) => q.result === 'unanswered').length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scaledScore = getDMScaledScore(pct);

  if (reviewIndex !== null) {
    const q = questions[reviewIndex];
    const prev = reviewIndex > 0 ? reviewIndex - 1 : null;
    const next = reviewIndex < questions.length - 1 ? reviewIndex + 1 : null;

    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
          <ReviewHeader
            onBack={() => setReviewIndex(null)}
            label={`Q${reviewIndex + 1}`}
            sublabel={q.title ?? `Question ${reviewIndex + 1}`}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />

          <ScrollView
            contentContainerStyle={resultsStyles.reviewContent}
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

          <ReviewNavBar
            onPrev={prev !== null ? () => setReviewIndex(prev) : null}
            onNext={next !== null ? () => setReviewIndex(next) : null}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />
        </SafeAreaView>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
        <ResultsHeader title={test.title} accent={accent} colors={colors} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={resultsStyles.scrollContent}
        >
          <ScoreOverviewCard
            pct={pct}
            correctCount={correctCount}
            incorrectCount={incorrectCount}
            unansweredCount={unansweredCount}
            total={total}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />

          <UcatScoreCard
            scaledScore={scaledScore}
            uncertainty={`±${SCORE_UNCERTAINTY}`}
            disclaimer={`* ${UCAT_SCORE_DISCLAIMER_SHORT}`}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />

          <Text style={[resultsStyles.sectionHeader, { color: colors.textMuted }]}>
            QUESTION BREAKDOWN
          </Text>

          <View style={resultsStyles.breakdownList}>
            {questionResults.map((q) => (
              <QuestionBreakdownRow
                key={q.questionId}
                number={q.index + 1}
                title={q.displayTitle}
                result={q.result}
                flagged={q.flagged}
                onPress={() => setReviewIndex(q.index)}
                accent={accent}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>

          <View style={{ height: 8 }} />
        </ScrollView>

        <DoneBottomBar onDone={onDone} accent={accent} colors={colors} isDark={isDark} />
      </SafeAreaView>
    </PremiumScreen>
  );
}
