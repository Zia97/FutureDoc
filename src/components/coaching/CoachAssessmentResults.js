import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { SECTION_NAMES, SECTION_COLOURS } from '../performance/PerformanceUI';
import { PremiumScreen } from '../premium/PremiumPracticeUI';
import {
  ResultsHeader, QuestionBreakdownRow, DoneBottomBar, ReviewHeader,
  ReviewStemCard, ReviewQuestionCard, ReviewNavBar, resultsStyles,
} from '../premium/PremiumResultsUI';
import { DMStemContent, DMOptionsContent } from '../dm/DMQuestionRenderer';
import QRStimulusRenderer from '../qr/QRStimulusRenderer';
import AnswerOptionButton from '../AnswerOptionButton';
import { Button, SessionReport } from './CoachUI';

function resultFor(question, answer) {
  if (answer == null || (typeof answer === 'object' && !Object.keys(answer).length)) return 'unanswered';
  const earned = question.grade?.earned ?? 0;
  const possible = question.grade?.possible ?? 1;
  if (earned >= possible) return 'correct';
  return earned > 0 ? 'partial' : 'incorrect';
}

function ReviewQuestion({ question, answer, colors, isDark, accent }) {
  const dm = question.dm && {
    ...question.dm,
    answer: Array.isArray(question.answer) ? undefined : question.answer,
    statements: (question.dm.statements ?? []).map((statement, i) => ({
      ...statement, answer: question.answer?.[i], reason: question.statementReasons?.[i],
    })),
  };
  return <>
    <ReviewStemCard label={question.section === 'vr' ? 'PASSAGE' : question.section === 'sj' ? 'SCENARIO' : 'STEM'}
      accent={accent} colors={colors} isDark={isDark}>
      {question.section === 'qr' ? <QRStimulusRenderer stimulus={question.stimulus} />
        : dm ? <DMStemContent question={dm} showLabel={false} />
          : <Text style={[resultsStyles.stemText, { color: colors.textSecondary }]}>{question.context}</Text>}
    </ReviewStemCard>
    <ReviewQuestionCard colors={colors} isDark={isDark}>
      {!dm && <Text style={[resultsStyles.questionText, { color: colors.text }]}>{question.text}</Text>}
      {dm ? <View pointerEvents="none"><DMOptionsContent question={dm} answer={answer} submitted timedMode={false} showLabel={false} onAnswer={() => {}} /></View>
        : <View style={resultsStyles.optionsContainer} pointerEvents="none">
          {(question.choices ?? []).map((choice) => <AnswerOptionButton key={choice.value} label={choice.label}
            state={choice.value === question.answer ? 'correct'
              : choice.value === answer ? (question.grade?.earned > 0 ? 'partial' : 'incorrect') : 'idle'}
            onPress={() => {}} />)}
        </View>}
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 18 }}>
        {question.grade?.earned ?? 0}/{question.grade?.possible ?? 1} marks
      </Text>
      {answer == null && <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Unanswered</Text>}
      {!!question.explanation && <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 10 }}>{question.explanation}</Text>}
    </ReviewQuestionCard>
  </>;
}

export default function CoachAssessmentResults({ session, onPlan, initialReview = false }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [showBreakdown, setShowBreakdown] = useState(initialReview);
  const [reviewIndex, setReviewIndex] = useState(null);
  usePreventRemove(showBreakdown || reviewIndex != null, () => {
    if (reviewIndex != null) setReviewIndex(null);
    else setShowBreakdown(false);
  });
  const questions = session.questions ?? [];
  const progress = session.progress;
  const rows = useMemo(() => questions.map((question, index) => ({
    question, index, result: resultFor(question, progress.answers[question.id]),
  })), [questions, progress.answers]);

  if (reviewIndex != null) {
    const question = questions[reviewIndex];
    const accent = colors[SECTION_COLOURS[question.section]];
    return <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
        <ReviewHeader onBack={() => setReviewIndex(null)} label={`${SECTION_NAMES[question.section]} · Q${reviewIndex + 1}`}
          sublabel={question.title || `Question ${reviewIndex + 1}`} accent={accent} colors={colors} isDark={isDark} />
        <ScrollView key={question.id} contentContainerStyle={resultsStyles.reviewContent} showsVerticalScrollIndicator={false}>
          <ReviewQuestion question={question} answer={progress.answers[question.id]} colors={colors} isDark={isDark} accent={accent} />
        </ScrollView>
        <ReviewNavBar onPrev={reviewIndex > 0 ? () => setReviewIndex(reviewIndex - 1) : null}
          onNext={reviewIndex < questions.length - 1 ? () => setReviewIndex(reviewIndex + 1) : null}
          accent={accent} colors={colors} isDark={isDark} />
      </SafeAreaView>
    </PremiumScreen>;
  }

  if (showBreakdown) return <PremiumScreen>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
    <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
      <ResultsHeader title="Review my answers" accent={colors.purple} colors={colors} />
      <ScrollView contentContainerStyle={[resultsStyles.scrollContent, { gap: 9 }]} showsVerticalScrollIndicator={false}>
        {rows.map(({ question, index, result }) => <React.Fragment key={question.id}>
          {(index === 0 || question.section !== questions[index - 1].section) &&
            <Text style={[resultsStyles.sectionHeader, { color: colors[SECTION_COLOURS[question.section]], marginTop: index ? 15 : 0 }]}>
              {SECTION_NAMES[question.section].toUpperCase()}
            </Text>}
          <QuestionBreakdownRow number={index + 1} title={question.text || question.dm?.stem || question.title || `Question ${index + 1}`}
            subtitle={question.title} result={result} flagged={!!progress.flags?.[question.id]}
            onPress={() => setReviewIndex(index)} accent={colors[SECTION_COLOURS[question.section]]}
            colors={colors} isDark={isDark} />
        </React.Fragment>)}
      </ScrollView>
      <DoneBottomBar onDone={() => setShowBreakdown(false)} accent={colors.purple} colors={colors} isDark={isDark} />
    </SafeAreaView>
  </PremiumScreen>;

  return <PremiumScreen>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
    <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={[resultsStyles.scrollContent, { gap: 17, maxWidth: 800, width: '100%', alignSelf: 'center', paddingTop: 20 }]} showsVerticalScrollIndicator={false}>
        <SessionReport report={session.report} />
        <Button title="See my personal plan" onPress={onPlan} />
        <Button title="Review my answers" secondary onPress={() => setShowBreakdown(true)} />
      </ScrollView>
    </SafeAreaView>
  </PremiumScreen>;
}
