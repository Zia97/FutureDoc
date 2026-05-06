import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useFlatNavigation } from '../hooks/ui/useFlatNavigation';
import { useAnswers } from '../hooks/ui/useAnswers';
import { useSwipeGesture } from '../hooks/ui/useSwipeGesture';
import { usePremiumGate } from '../hooks/ui/usePremiumGate';
import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';
import NotesModal from './NotesModal';
import BottomToolbar from './BottomToolbar';
import PremiumIcon from './premium/PremiumIcon';
import {
  PremiumQuestionScaffold,
  QuestionTopBar,
  QuestionPanel,
  SectionLabel,
  QuestionText,
  PrimaryQuestionButton,
} from './premium/PremiumQuestionScreenUI';

const SECTION_TITLE = {
  vr: 'Verbal Reasoning',
  sj: 'Situational Judgement',
};

export default function PassageLayout({
  flatQuestions,
  initialIndex = 0,
  itemLabel,
  getTitle,
  renderOptions,
  getQuestionOptions = null,
  alwaysShowReason = false,
  onAnswerCommit = null,
  initialAnswers = {},
  section = 'vr',
  getItemIsFree = null,
  demoMode = false,
  onDemoExit = null,
  demoTitle = null,
  demoSubtitle = null,
  demoExitLabel = null,
  demoExitHint = null,
}) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const { index, item, isFirst, isLast, goNext: rawGoNext, goPrev: rawGoPrev } =
    useFlatNavigation(flatQuestions, initialIndex);
  const { canAccess } = usePremiumGate(getItemIsFree);

  function goNext() {
    const next = flatQuestions[index + 1];
    if (next && !canAccess(next)) return;
    rawGoNext();
  }
  function goPrev() {
    const prev = flatQuestions[index - 1];
    if (prev && !canAccess(prev)) return;
    rawGoPrev();
  }

  const { handleAnswer, getAnswer } = useAnswers(initialAnswers);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [notesVisible, setNotesVisible] = useState(false);

  const qid = item.question.questionId ?? item.question.id ?? item.question.itemId;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === item.question.answer;

  const viewedAtRef = useRef(Date.now());
  useEffect(() => {
    setPendingAnswer(null);
    viewedAtRef.current = Date.now();
  }, [qid, item.stemId]);

  const panHandlers = useSwipeGesture(
    isFirst ? null : goPrev,
    isLast ? null : goNext,
  );

  function getOptionState(option) {
    if (!hasAnswered) return option === pendingAnswer ? 'selected' : 'idle';
    if (option === item.question.answer) return 'correct';
    if (option === selectedAnswer) return 'incorrect';
    return 'idle';
  }

  function onAnswer(option) {
    if (hasAnswered) return;
    setPendingAnswer(option);
  }

  function handleCheckAnswer() {
    if (!pendingAnswer || hasAnswered) return;
    const timeSpentMs = Math.max(0, Date.now() - viewedAtRef.current);
    handleAnswer(item.stemId, qid, pendingAnswer);
    onAnswerCommit?.(item, pendingAnswer, { timeSpentMs });
  }

  const sectionColor = section === 'sj' ? colors.mint : colors.blue;
  const screenTitle = SECTION_TITLE[section] ?? 'Practice';

  return (
    <PremiumQuestionScaffold panHandlers={demoMode ? null : panHandlers}>
      <QuestionTopBar
        title={demoMode ? (demoTitle ?? 'AI Tutor Demo') : screenTitle}
        subtitle={demoMode ? (demoSubtitle ?? 'Sample question') : 'Practice'}
        accent={sectionColor}
        onExit={demoMode ? (onDemoExit ?? (() => navigation.goBack())) : () => navigation.goBack()}
      />

      {demoMode ? null : (
        <ScreenNavBar
          title={getTitle(item)}
          meta={`Question ${index + 1} of ${flatQuestions.length}`}
          onPrev={goPrev}
          onNext={goNext}
          isFirst={isFirst}
          isLast={isLast}
          color={sectionColor}
          report={{ questionId: qid, section }}
        />
      )}

      <ScrollView
        key={item.stemId + qid}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuestionPanel>
          <SectionLabel accent={sectionColor}>{itemLabel}</SectionLabel>
          <QuestionText muted>{item.resource}</QuestionText>
        </QuestionPanel>

        <QuestionPanel>
          <SectionLabel accent={sectionColor}>Question</SectionLabel>
          <QuestionText>{item.question.questionText}</QuestionText>

          <View style={styles.optionsContainer}>
            {renderOptions({ item, question: item.question, getOptionState, onAnswer })}
          </View>

          {pendingAnswer && !hasAnswered ? (
            <PrimaryQuestionButton accent={sectionColor} onPress={handleCheckAnswer}>
              Check Answer
            </PrimaryQuestionButton>
          ) : null}

          {hasAnswered ? (
            <FeedbackBox
              isCorrect={isCorrect}
              correctAnswer={item.question.answer}
              reason={item.question.answeringReason}
              showReason={alwaysShowReason || true}
              isDemo={demoMode}
              highlightTeachMe={demoMode}
              questionContext={{
                questionId: qid,
                question: item.question.questionText,
                questionType: section === 'sj' ? 'situational_judgement' : 'true_false_cant_tell',
                section,
                passage: item.resource ?? undefined,
                options: getQuestionOptions ? getQuestionOptions(item, item.question) : undefined,
                correctAnswer: item.question.answer,
                userAnswer: selectedAnswer,
                explanation: item.question.answeringReason,
                isTimed: false,
              }}
            />
          ) : null}
        </QuestionPanel>
      </ScrollView>

      {demoMode ? (
        <DemoBackBar
          accent={sectionColor}
          colors={colors}
          isDark={isDark}
          label={demoExitLabel}
          hint={demoExitHint}
          onPress={() => (onDemoExit ? onDemoExit() : navigation.goBack())}
        />
      ) : (
        <BottomToolbar
          onNotes={() => setNotesVisible(true)}
          sectionColor={sectionColor}
        />
      )}

      <NotesModal
        visible={notesVisible}
        sectionKey={section}
        onClose={() => setNotesVisible(false)}
      />
    </PremiumQuestionScaffold>
  );
}

function DemoBackBar({ accent, colors, isDark, onPress, label, hint }) {
  const insets = useSafeAreaInsets();
  const buttonLabel = label ?? 'Done — back to lesson';
  return (
    <View style={[demoBarStyles.wrap, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        style={[
          demoBarStyles.button,
          {
            backgroundColor: accent,
            borderColor: accent,
            shadowColor: accent,
          },
        ]}
      >
        <PremiumIcon name="check" size={18} color="#FFFFFF" strokeWidth={2.6} />
        <Text style={demoBarStyles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
      {hint ? (
        <Text style={[demoBarStyles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const demoBarStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
});

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 26,
    gap: 14,
  },
  optionsContainer: {
    gap: 10,
    marginTop: 16,
  },
});
