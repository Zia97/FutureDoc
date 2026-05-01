import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme } from '../theme/premiumTheme';
import { PremiumScreen } from './premium/PremiumPracticeUI';
import AnswerOptionButton from './AnswerOptionButton';
import FeedbackBox from './FeedbackBox';
import {
  getVRScaledScore,
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
  ReviewStemCard,
  ReviewQuestionCard,
  ReviewNavBar,
  resultsStyles,
} from './premium/PremiumResultsUI';

export default function TimedVRResultsScreen({ passages, getAnswer, flags, test, onDone }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const stemScaled = {
    fontSize: Math.round(resultsStyles.stemText.fontSize * multiplier),
    lineHeight: Math.round(resultsStyles.stemText.lineHeight * multiplier),
  };
  const qScaled = {
    fontSize: Math.round(resultsStyles.questionText.fontSize * multiplier),
    lineHeight: Math.round(resultsStyles.questionText.lineHeight * multiplier),
  };
  const accent = colors.blue;
  const [reviewItem, setReviewItem] = useState(null);

  const flatQuestions = useMemo(() => {
    const list = [];
    passages.forEach((p, pIdx) => {
      p.questions.forEach((q, qIdx) => {
        const selected = getAnswer(p.id, q.questionId);
        const answered = !!selected;
        const correct = answered && selected === q.answer;
        const result = !answered ? 'unanswered' : correct ? 'correct' : 'incorrect';
        list.push({
          globalIndex: list.length,
          passageIndex: pIdx,
          questionIndex: qIdx,
          questionId: q.questionId,
          passageTitle: p.title ?? `Passage ${pIdx + 1}`,
          result,
          flagged: flags.has(q.questionId),
        });
      });
    });
    return list;
  }, [passages, getAnswer, flags]);

  const correctCount = flatQuestions.filter((q) => q.result === 'correct').length;
  const incorrectCount = flatQuestions.filter((q) => q.result === 'incorrect').length;
  const unansweredCount = flatQuestions.filter((q) => q.result === 'unanswered').length;
  const total = flatQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scaledScore = getVRScaledScore(pct);

  // ── Question review mode ──────────────────────────────────────────
  if (reviewItem !== null) {
    const { passageIndex, questionIndex } = reviewItem;
    const passage = passages[passageIndex];
    const q = passage.questions[questionIndex];
    const selectedAnswer = getAnswer(passage.id, q.questionId);
    const isCorrect = !!selectedAnswer && selectedAnswer === q.answer;

    const currentGlobal = flatQuestions.findIndex(
      (fq) => fq.passageIndex === passageIndex && fq.questionIndex === questionIndex,
    );
    const prev = currentGlobal > 0 ? flatQuestions[currentGlobal - 1] : null;
    const next = currentGlobal < flatQuestions.length - 1 ? flatQuestions[currentGlobal + 1] : null;

    function getOptionState(opt) {
      if (opt === q.answer) return 'correct';
      if (selectedAnswer && opt === selectedAnswer && !isCorrect) return 'incorrect';
      return 'idle';
    }

    const questionContext = {
      questionId: q.questionId ?? q.id,
      question: q.questionText ?? q.stem,
      questionType: 'verbal_reasoning',
      section: 'vr',
      passage: passage.resource ?? passage.body,
      options: q.options,
      correctAnswer: q.answer,
      userAnswer: selectedAnswer ?? 'Not answered',
      explanation: q.answeringReason,
      isTimed: true,
    };

    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
          <ReviewHeader
            onBack={() => setReviewItem(null)}
            label={`Q${currentGlobal + 1}`}
            sublabel={passage.title ?? `Passage ${passageIndex + 1}`}
            accent={accent}
            isDark={isDark}
            colors={colors}
          />

          <ScrollView
            contentContainerStyle={resultsStyles.reviewContent}
            showsVerticalScrollIndicator={false}
          >
            <ReviewStemCard
              label="PASSAGE"
              accent={accent}
              colors={colors}
              isDark={isDark}
            >
              <Text style={[resultsStyles.stemText, stemScaled, { color: colors.textSecondary }]}>
                {passage.resource ?? passage.body}
              </Text>
            </ReviewStemCard>

            <ReviewQuestionCard colors={colors} isDark={isDark}>
              <Text style={[resultsStyles.questionText, qScaled, { color: colors.text }]}>{q.questionText}</Text>
              <View style={resultsStyles.optionsContainer}>
                {q.options.map((opt) => (
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
                correctAnswer={q.answer}
                reason={q.answeringReason}
                showReason
                questionContext={questionContext}
              />
            </ReviewQuestionCard>
          </ScrollView>

          <ReviewNavBar
            onPrev={prev ? () => setReviewItem({ passageIndex: prev.passageIndex, questionIndex: prev.questionIndex }) : null}
            onNext={next ? () => setReviewItem({ passageIndex: next.passageIndex, questionIndex: next.questionIndex }) : null}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />
        </SafeAreaView>
      </PremiumScreen>
    );
  }

  // ── Results summary mode ──────────────────────────────────────────
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
            {flatQuestions.map((q) => (
              <QuestionBreakdownRow
                key={q.questionId}
                number={q.globalIndex + 1}
                title={q.passageTitle}
                result={q.result}
                flagged={q.flagged}
                onPress={() => setReviewItem({ passageIndex: q.passageIndex, questionIndex: q.questionIndex })}
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
