import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFlatNavigation } from '../hooks/ui/useFlatNavigation';
import { useAnswers } from '../hooks/ui/useAnswers';
import { useSwipeGesture } from '../hooks/ui/useSwipeGesture';
import { usePremiumGate } from '../hooks/ui/usePremiumGate';
import { useTheme } from '../context/ThemeContext';
import ScreenNavBar from './ScreenNavBar';
import FeedbackBox from './FeedbackBox';
import NotesModal from './NotesModal';
import BottomToolbar from './BottomToolbar';

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
}) {
  const { practiceTheme: t } = useTheme();

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
  const [notes, setNotes] = useState('');

  const qid = item.question.questionId ?? item.question.id;
  const selectedAnswer = getAnswer(item.stemId, qid);
  const hasAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === item.question.answer;

  useEffect(() => { setPendingAnswer(null); }, [qid]);

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
    handleAnswer(item.stemId, qid, pendingAnswer);
    onAnswerCommit?.(item, pendingAnswer);
  }

  const sectionColor = section === 'sj' ? t.sectionSJ : t.sectionVR;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.bg }]} {...panHandlers}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.headerBg} />

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

      <ScrollView
        key={item.stemId + qid}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <Text style={[styles.resourceLabel, { color: sectionColor }]}>{itemLabel.toUpperCase()}</Text>
        <Text style={[styles.resourceText, { color: t.textSecondary }]}>{item.resource}</Text>

        <View style={[styles.divider, { backgroundColor: t.border }]} />

        <Text style={[styles.questionLabel, { color: sectionColor }]}>QUESTION</Text>
        <Text style={[styles.questionText, { color: t.text }]}>{item.question.questionText}</Text>

        <View style={styles.optionsContainer}>
          {renderOptions({ item, question: item.question, getOptionState, onAnswer })}
        </View>

        {pendingAnswer && !hasAnswered && (
          <TouchableOpacity
            style={[styles.checkButton, { backgroundColor: sectionColor }]}
            onPress={handleCheckAnswer}
          >
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        )}

        {hasAnswered && (
          <FeedbackBox
            isCorrect={isCorrect}
            correctAnswer={item.question.answer}
            reason={item.question.answeringReason}
            showReason
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
        )}
      </ScrollView>

      <BottomToolbar
        onNotes={() => setNotesVisible(true)}
        sectionColor={sectionColor}
      />

      <NotesModal
        visible={notesVisible}
        notes={notes}
        onChangeNotes={setNotes}
        onClear={() => setNotes('')}
        onClose={() => setNotesVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  resourceLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  resourceText: {
    fontSize: 14,
    lineHeight: 22,
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
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
  checkButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
