import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import { PremiumScreen } from './premium/PremiumPracticeUI';
import { LABEL_SETS } from '../constants/sjLabelSets';
import AnswerOptionButton from './AnswerOptionButton';
import FeedbackBox from './FeedbackBox';
import {
  getSJBand,
  SCORE_UNCERTAINTY,
  UCAT_SCORE_DISCLAIMER_SHORT,
} from '../lib/ucatScoring';
import {
  ResultsHeader,
  ScoreOverviewCard,
  QuestionBreakdownRow,
  DoneBottomBar,
  ReviewHeader,
  ReviewStemCard,
  ReviewQuestionCard,
  ReviewNavBar,
  resultsStyles,
} from './premium/PremiumResultsUI';

// UCAT SJ mark scheme: 4 (exact), 2 (1 off), 0 (2+ off / unanswered)
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

function getANZScaledScore(rawPct) {
  return Math.round(300 + (rawPct / 100) * 600);
}

function deriveScenarioTitle(stem, fallback) {
  if (!stem) return fallback;
  const trimmed = stem.trim();
  // Take up to first sentence terminator or 60 chars.
  const sentenceEnd = trimmed.search(/[.!?](\s|$)/);
  const slice = sentenceEnd > 0 && sentenceEnd <= 70
    ? trimmed.slice(0, sentenceEnd)
    : trimmed.slice(0, 60);
  if (trimmed.length > slice.length) return `${slice}…`;
  return slice;
}

export default function TimedSJResultsScreen({ scenarios, getAnswer, flags, test, onDone }) {
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
  const accent = colors.mint;
  const [reviewItem, setReviewItem] = useState(null);

  const flatQuestions = useMemo(() => {
    const list = [];
    scenarios.forEach((s, sIdx) => {
      const scenarioTitle = deriveScenarioTitle(s.stem, `Scenario ${sIdx + 1}`);
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
          scenarioTitle,
          result,
          flagged: flags.has(item.itemId),
        });
      });
    });
    return list;
  }, [scenarios, getAnswer, flags]);

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

    const questionContext = {
      questionId: item.itemId ?? item.questionId ?? item.id,
      question: item.text ?? item.questionText,
      questionType: 'situational_judgement',
      section: 'sj',
      passage: scenario.stem,
      options: labelSet,
      correctAnswer: item.answer,
      userAnswer: selectedAnswer ?? 'Not answered',
      explanation: item.answeringReason,
      isTimed: true,
    };

    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        <SafeAreaView style={resultsStyles.safeArea} edges={['top', 'left', 'right']}>
          <ReviewHeader
            onBack={() => setReviewItem(null)}
            label={`Q${currentGlobal + 1}`}
            sublabel={deriveScenarioTitle(scenario.stem, `Scenario ${passageIndex + 1}`)}
            accent={accent}
            colors={colors}
            isDark={isDark}
          />

          <ScrollView
            contentContainerStyle={resultsStyles.reviewContent}
            showsVerticalScrollIndicator={false}
          >
            <ReviewStemCard label="SCENARIO" accent={accent} colors={colors} isDark={isDark}>
              <Text style={[resultsStyles.stemText, stemScaled, { color: colors.textSecondary }]}>
                {scenario.stem}
              </Text>
            </ReviewStemCard>

            <ReviewQuestionCard colors={colors} isDark={isDark}>
              <Text style={[resultsStyles.questionText, qScaled, { color: colors.text }]}>{item.text}</Text>
              <View style={resultsStyles.optionsContainer}>
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

          <Text style={[resultsStyles.sectionHeader, { color: colors.textMuted }]}>UCAT SCORE</Text>
          <View style={sjStyles.ucatRow}>
            <SJScoreCard
              region="UK"
              badgeText={`Band ${ukBand.band}`}
              raw={`${rawScore} / ${maxRawScore} marks`}
              description={ukBand.description}
              disclaimer="* Approximate — official band thresholds vary each year"
              bandColor={ukBand.color}
              colors={colors}
              isDark={isDark}
            />
            <SJScoreCard
              region="AU / NZ"
              badgeText={`${anzScore} ±${SCORE_UNCERTAINTY}`}
              raw={`${rawScore} / ${maxRawScore} marks`}
              description={`Band ${ukBand.band} · ${ukBand.description}`}
              disclaimer={`* ${UCAT_SCORE_DISCLAIMER_SHORT}`}
              bandColor={ukBand.color}
              colors={colors}
              isDark={isDark}
            />
          </View>

          <Text style={[resultsStyles.sectionHeader, { color: colors.textMuted }]}>
            QUESTION BREAKDOWN
          </Text>

          <View style={resultsStyles.breakdownList}>
            {flatQuestions.map((q) => (
              <QuestionBreakdownRow
                key={q.questionId}
                number={q.globalIndex + 1}
                title={q.scenarioTitle}
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

function SJScoreCard({ region, badgeText, raw, description, disclaimer, bandColor, colors, isDark }) {
  return (
    <View style={[sjStyles.cardWrap, { shadowColor: bandColor }]}>
      <LinearGradient
        colors={
          isDark
            ? ['rgba(18, 35, 64, 0.96)', 'rgba(8, 22, 43, 0.96)']
            : ['rgba(255, 255, 255, 0.98)', 'rgba(246, 250, 255, 0.98)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[sjStyles.card, { borderColor: hexToRgba(bandColor, 0.32) }]}
      >
        <Text style={[sjStyles.region, { color: colors.textMuted }]}>{region}</Text>
        <View
          style={[
            sjStyles.bandBadge,
            {
              backgroundColor: hexToRgba(bandColor, isDark ? 0.18 : 0.12),
              borderColor: hexToRgba(bandColor, 0.42),
            },
          ]}
        >
          <Text style={[sjStyles.bandText, { color: bandColor }]}>{badgeText}</Text>
        </View>
        <Text style={[sjStyles.raw, { color: colors.textSecondary }]}>{raw}</Text>
        <Text style={[sjStyles.desc, { color: colors.textSecondary }]}>{description}</Text>
        <Text style={[sjStyles.disclaimer, { color: colors.textMuted }]}>{disclaimer}</Text>
      </LinearGradient>
    </View>
  );
}

const sjStyles = StyleSheet.create({
  ucatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  cardWrap: {
    flex: 1,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0,
    shadowRadius: 14,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    overflow: 'hidden',
  },
  region: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  bandBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginVertical: 2,
  },
  bandText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
  raw: {
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 10,
    fontStyle: 'italic',
    lineHeight: 14,
    marginTop: 2,
  },
});
