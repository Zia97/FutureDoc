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
import QRStimulusRenderer from './qr/QRStimulusRenderer';
import {
  getQRScaledScore,
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

export default function TimedQRResultsScreen({ sets, getAnswer, flags, test, onDone }) {
  const { isDark } = useTheme();
  const { multiplier } = useTextSize();
  const qScaled = {
    fontSize: Math.round(resultsStyles.questionText.fontSize * multiplier),
    lineHeight: Math.round(resultsStyles.questionText.lineHeight * multiplier),
  };
  const { colors } = getPremiumTheme(isDark);
  const accent = colors.purple;
  const [reviewItem, setReviewItem] = useState(null);

  const flatQuestions = useMemo(() => {
    const list = [];
    sets.forEach((s, sIdx) => {
      s.questions.forEach((q, qIdx) => {
        const selected = getAnswer(s.setId, q.questionId);
        const answered = !!selected;
        const correct = answered && selected === q.answer;
        const result = !answered ? 'unanswered' : correct ? 'correct' : 'incorrect';
        list.push({
          globalIndex: list.length,
          setIndex: sIdx,
          questionIndex: qIdx,
          questionId: q.questionId,
          setTitle: s.title ?? `Set ${sIdx + 1}`,
          result,
          flagged: flags.has(q.questionId),
        });
      });
    });
    return list;
  }, [sets, getAnswer, flags]);

  const correctCount = flatQuestions.filter((q) => q.result === 'correct').length;
  const incorrectCount = flatQuestions.filter((q) => q.result === 'incorrect').length;
  const unansweredCount = flatQuestions.filter((q) => q.result === 'unanswered').length;
  const total = flatQuestions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const scaledScore = getQRScaledScore(pct);

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

    const questionContext = {
      question: q.stem,
      questionType: 'quantitative_reasoning',
      section: 'qr',
      stimulus: set.stimulus,
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
            sublabel={set.title ?? `Set ${setIndex + 1}`}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />

          <ScrollView
            contentContainerStyle={resultsStyles.reviewContent}
            showsVerticalScrollIndicator={false}
          >
            <ReviewStemCard label="STIMULUS" accent={accent} colors={colors} isDark={isDark}>
              <QRStimulusRenderer stimulus={set.stimulus} />
            </ReviewStemCard>

            <ReviewQuestionCard colors={colors} isDark={isDark}>
              <Text style={[resultsStyles.questionText, qScaled, { color: colors.text }]}>{q.stem}</Text>
              <View style={resultsStyles.optionsContainer}>
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
            </ReviewQuestionCard>
          </ScrollView>

          <ReviewNavBar
            onPrev={prev ? () => setReviewItem({ setIndex: prev.setIndex, questionIndex: prev.questionIndex }) : null}
            onNext={next ? () => setReviewItem({ setIndex: next.setIndex, questionIndex: next.questionIndex }) : null}
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
            {flatQuestions.map((q) => (
              <QuestionBreakdownRow
                key={q.questionId}
                number={q.globalIndex + 1}
                title={q.setTitle}
                result={q.result}
                flagged={q.flagged}
                onPress={() => setReviewItem({ setIndex: q.setIndex, questionIndex: q.questionIndex })}
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
