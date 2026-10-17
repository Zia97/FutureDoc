import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import { SECTION_SECONDS } from '../../lib/coaching/engine';
import { assessmentSectionItems, assessmentQuestionStatus } from '../../lib/coaching/assessmentView';
import { useSwipeGesture } from '../../hooks/ui/useSwipeGesture';
import { isTestTimerUrgent } from '../../hooks/ui/useTestTimer';
import { PremiumQuestionScaffold, QuestionTopBar, PremiumPauseModal } from '../premium/PremiumQuestionScreenUI';
import PremiumInstructionScreen from '../premium/PremiumInstructionScreen';
import TimedQuestionPanel from '../timed/TimedQuestionPanel';
import ScreenNavBar from '../ScreenNavBar';
import BottomToolbar from '../BottomToolbar';
import TestNavigatorModal from '../TestNavigatorModal';
import TimedTestReviewScreen from '../TimedTestReviewScreen';
import NotesModal from '../NotesModal';
import CalculatorModal from '../CalculatorModal';
import { CoachPage, Card, Copy, Button } from './CoachUI';

const clock = (seconds) => `${Math.floor(Math.ceil(seconds) / 60)}:${String(Math.ceil(seconds) % 60).padStart(2, '0')}`;
const SECTION_TIPS = {
  vr: 'Use only the information in the passage. Select one answer for each question.',
  dm: 'Some questions need one answer; others need Yes or No for every statement. A calculator and notes are available.',
  qr: 'Use the supplied data to answer each question. A calculator and notes are available.',
  sj: 'Read the scenario and use the rating scale shown for each item. Judge each response or factor independently.',
};

export default function CoachTimedAssessment({ session, navigation, error, syncing, saveLabel, onReload, onSync, onAnswer, onNavigate, onFlag, onPause, onResume, onFinish, onReviewChange }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  const p = session.progress;
  const q = session.questions[p.index];
  const section = q.section, meta = UCAT_SECTIONS[section.toUpperCase()], accent = colors[meta.accentKey];
  const items = useMemo(() => assessmentSectionItems(session), [session.questions, p.sectionIndex]);
  const localIndex = items.findIndex((item) => item.sessionIndex === p.index);
  const [showReview, setShowReview] = useState(false), [navigatorVisible, setNavigatorVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false), [calculatorVisible, setCalculatorVisible] = useState(false);
  const [seen, setSeen] = useState(() => new Set(Object.keys(p.times).filter((id) => p.times[id] > 0)));
  const scroll = useRef(null);
  const active = p.phase === 'running' && !error;
  const seconds = Math.max(0, session.budgets[section] - (p.elapsed[section] ?? 0) / 1000);
  const urgent = isTestTimerUrgent(Math.ceil(seconds));
  const flags = new Set(Object.keys(p.flags).filter((id) => p.flags[id]));
  useEffect(() => {
    if (active && !showReview) setSeen((previous) => previous.has(q.id) ? previous : new Set([...previous, q.id]));
  }, [q.id, active, showReview]);

  function review() { onReviewChange(true); setShowReview(true); }
  function navigate(local) {
    if (!items[local]) return;
    if (showReview) onReviewChange(false);
    setShowReview(false); setNavigatorVisible(false);
    onNavigate(items[local].sessionIndex);
    if (section !== 'vr' || items[local].parentId !== q.parentId) scroll.current?.scrollTo({ y: 0, animated: false });
  }
  const next = () => localIndex === items.length - 1 ? review() : navigate(localIndex + 1);
  const previous = () => navigate(localIndex - 1);
  const panHandlers = useSwipeGesture(active && !showReview && localIndex > 0 ? previous : null, active && !showReview ? next : null);
  const getStatus = (item) => assessmentQuestionStatus(session.questions[item.sessionIndex], p, seen);

  if (error) return <CoachPage><Card><Copy title>Load your saved assessment</Copy><Copy>{error.message}</Copy>
    <Button title="Load saved version" onPress={onReload} /><Button title="Back to coaching" secondary onPress={() => navigation.goBack()} /></Card></CoachPage>;
  if (p.phase === 'finished') return <CoachPage><Card style={{ gap: 12 }}><Copy title>Your answers are ready</Copy>
    <Copy muted>Connect to save your assessment and view the report. Your answers are saved on this device.</Copy>
    <Button title={syncing ? 'Saving…' : 'Save & show my report'} disabled={syncing} onPress={onSync} />
    <Button title="Back to coaching" secondary onPress={() => navigation.goBack()} /></Card></CoachPage>;
  if (p.phase === 'instructions') {
    const extraMultiplier = session.timeMultiplier > 1 ? session.timeMultiplier : 1.25;
    return <PremiumInstructionScreen navigation={navigation} sectionTitle={meta.title} sectionIcon={meta.icon} accent={accent}
      durationSeconds={45} readNotice={`Section ${p.sectionIndex + 1} of 4. You have 45 seconds to read these instructions, or start when ready.`}
      table={{ subtest: meta.title, questions: String(items.length), timeUCAT: `${clock(SECTION_SECONDS[section])} minutes`,
        timeExtended: `${clock(Math.round(SECTION_SECONDS[section] * extraMultiplier))} minutes`, timeLabel: 'Mini assessment',
        extendedTimeLabel: 'Mini assessment with extra time', extendedBadge: `+${Math.round((extraMultiplier - 1) * 100)}%` }}
      paragraphs={[SECTION_TIPS[section],
        `Your working time is ${clock(session.budgets[section])}${session.timeMultiplier > 1 ? ', including your extra time' : ''}.`,
        'Answer every question. There is no penalty for guessing.',
        'Use the Navigator to revisit questions or review flagged items within this section. You cannot return after finishing the section.',
        'You can pause and finish later. Interruptions are recorded on your report. Answers and explanations appear after all four sections.',
      ]} onStart={onResume} />;
  }
  if (p.phase === 'paused') return <PremiumQuestionScaffold>
    <QuestionTopBar title={meta.title} subtitle="Starting assessment" accent={accent} timerDisplay={clock(seconds)} onExit={() => navigation.goBack()} />
    <PremiumPauseModal visible onResume={onResume} onExit={() => navigation.goBack()} />
  </PremiumQuestionScaffold>;
  if (showReview) return <TimedTestReviewScreen questions={items} getStatus={getStatus} flags={flags}
    onNavigateTo={navigate} onEndTest={onFinish} timerDisplay={clock(seconds)} isUrgent={urgent} title={meta.title}
    endButtonLabel="End section" endConfirmTitle="Finish this section?" endConfirmButtonLabel="End section"
    endConfirmMessage={p.sectionIndex === 3 ? 'This completes your assessment. You will not be able to change your answers.' : 'You will move to the next section and cannot return to these questions.'} />;

  const title = section === 'sj' ? `Scenario ${items[localIndex].stemIndex + 1}` : section === 'vr'
    ? q.title?.replace(/^Passage\s+\d+[\s:\u2013-]*/i, '') || q.title : q.title || `Question ${localIndex + 1}`;
  return <PremiumQuestionScaffold panHandlers={panHandlers}>
    <QuestionTopBar title={meta.title} subtitle={`Starting assessment · ${p.sectionIndex + 1} of 4`} timerDisplay={clock(seconds)}
      isUrgent={urgent} accent={accent} onExit={() => navigation.goBack()} />
    <ScreenNavBar title={title} meta={`Question ${localIndex + 1} of ${items.length}`} onPrev={previous} onNext={next}
      isFirst={localIndex === 0} isLast={false} color={accent}
      report={{ questionId: q.id, section, isTimed: true, context: { screen: 'coaching-assessment', coach_session_id: session.id,
        form_version: session.formVersion, question_text: q.text || q.dm?.stem, selected_answer: p.answers[q.id], question_index: localIndex, seconds_left: Math.ceil(seconds) } }} />
    {saveLabel?.startsWith('Device storage is full') && <Text accessibilityRole="alert" style={{ color: colors.red, paddingHorizontal: 18 }}>{saveLabel}</Text>}
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" key={q.parentId + (section === 'vr' ? '' : q.id)}
      style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <TimedQuestionPanel section={section} accent={accent} context={q.context} text={q.text} stimulus={q.stimulus} dmQuestion={q.dm}
        choices={q.choices} answer={p.answers[q.id]} flagged={!!p.flags[q.id]} onAnswer={onAnswer} onToggleFlag={onFlag} />
    </ScrollView>
    <BottomToolbar onPause={() => { setNotesVisible(false); setCalculatorVisible(false); setNavigatorVisible(false); onPause(); }}
      onNotes={() => setNotesVisible(true)} onCalculator={['dm', 'qr'].includes(section) ? () => setCalculatorVisible(true) : undefined}
      onNavigator={() => setNavigatorVisible(true)} onPrev={previous} onNext={next} isFirst={localIndex === 0} isLast={false} sectionColor={accent} />
    <NotesModal visible={notesVisible} sectionKey={section} onClose={() => setNotesVisible(false)} />
    {['dm', 'qr'].includes(section) && <CalculatorModal visible={calculatorVisible} onClose={() => setCalculatorVisible(false)} />}
    <TestNavigatorModal visible={navigatorVisible} questions={items} getStatus={getStatus} flags={flags} onNavigateTo={navigate}
      onClose={() => setNavigatorVisible(false)} onReview={() => { setNavigatorVisible(false); review(); }} />
  </PremiumQuestionScaffold>;
}

const styles = StyleSheet.create({ scroll: { flex: 1 }, scrollContent: { paddingHorizontal: 8, paddingBottom: 28 } });
