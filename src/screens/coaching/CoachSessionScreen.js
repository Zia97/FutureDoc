import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Pressable, View } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { coachRequest, loadCoachSession, readCoachSessionCache, saveCoachCheckpoint, registerCoachSession } from '../../services/coachingService';
import { sessionSections, tickProgress, advanceSection, pauseProgress } from '../../lib/coaching/sessionState';
import { SECTION_NAMES } from '../../lib/coaching/engine';
import { CoachPage, Card, Copy, Button, SessionReport, cs, useCoachTheme } from '../../components/coaching/CoachUI';
import { DMStemContent, DMOptionsContent } from '../../components/dm/DMQuestionRenderer';
import QRStimulusRenderer from '../../components/qr/QRStimulusRenderer';
import AnswerOptionButton from '../../components/AnswerOptionButton';
import CalculatorModal from '../../components/CalculatorModal';
import CoachTimedAssessment from '../../components/coaching/CoachTimedAssessment';
import CoachAssessmentResults from '../../components/coaching/CoachAssessmentResults';

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
export default function CoachSessionScreen({ route, navigation }) {
  const { user } = useAuth(); const { colors } = useCoachTheme();
  const [session, setSession] = useState(null), [error, setError] = useState(null), [syncing, setSyncing] = useState(false);
  const [saveLabel, setSaveLabel] = useState(''), [reviewIndex, setReviewIndex] = useState(null), [calculator, setCalculator] = useState(false);
  const current = useRef(null), revision = useRef(0), inFlight = useRef(false), mounted = useRef(true), lastTick = useRef(Date.now()), lastCheckpoint = useRef(Date.now()), scroll = useRef(null), syncRef = useRef(null);
  const dirtyRef = useRef(false);
  const syncQueued = useRef(false);
  const reviewingSection = useRef(false);
  const put = useCallback((next, dirty = true) => {
    current.current = next; revision.current++;
    dirtyRef.current = dirty;
    lastCheckpoint.current = Date.now();
    if (mounted.current) setSession(next);
    return saveCoachCheckpoint(user.id, next, dirty).catch(() => { if (mounted.current) setSaveLabel('Device storage is full. Keep this screen open and sync before leaving.'); throw new Error('Your progress could not be saved on this device.'); });
  }, [user.id]);
  const sync = useCallback(async () => {
    const snapshot = current.current;
    if (!snapshot || snapshot.status === 'completed' || !dirtyRef.current) return;
    if (inFlight.current) { syncQueued.current = true; return; }
    inFlight.current = true; if (mounted.current) setSyncing(true);
    const sentRevision = revision.current;
    try {
      const { session: saved } = await coachRequest(user.id, 'save', { id: snapshot.id, version: snapshot.version, progress: snapshot.progress });
      const newer = revision.current !== sentRevision && saved.status !== 'completed';
      const next = { ...saved, progress: newer ? current.current.progress : saved.progress };
      await put(next, newer);
      if (mounted.current) { setSaveLabel(newer ? 'Saving changes on this device…' : 'Saved to your account'); setError(null); }
    } catch (e) {
      if (mounted.current) {
        setSaveLabel(e.code === 'version_conflict' ? 'Updated on another device. Reload to continue.' : 'Saved on this device · waiting to sync');
        if (e.code === 'version_conflict') {
          const paused = { ...current.current, progress: pauseProgress(current.current.progress) };
          await put(paused).catch(() => {}); setError(e);
        }
      }
    } finally {
      inFlight.current = false; if (mounted.current) setSyncing(false);
      if (syncQueued.current) { syncQueued.current = false; syncRef.current?.(); }
    }
  }, [user.id, put]);
  syncRef.current = sync;
  const load = useCallback(async (discardLocal = false) => {
    try {
      setError(null);
      if (!discardLocal) {
        const cached = await readCoachSessionCache(user.id, route.params.id);
        if (cached?.session && mounted.current) {
          const local = cached.session;
          if (local.status !== 'completed' && local.progress.phase === 'running') {
            await put({ ...local, progress: pauseProgress(local.progress) });
          } else {
            current.current = local;
            dirtyRef.current = !!cached.dirty;
            setSession(local);
          }
          lastTick.current = Date.now();
          setSaveLabel('Saved on this device');
        }
      }
      const shownRevision = revision.current;
      const saved = await loadCoachSession(user.id, route.params.id, discardLocal);
      if (!mounted.current) return;
      let next = saved.session;
      // Answers entered while the account copy loaded must stay visible.
      if (revision.current !== shownRevision && next.status !== 'completed') return;
      const pausedOnLoad = next.status !== 'completed' && next.progress.phase === 'running';
      if (pausedOnLoad) next = { ...next, progress: pauseProgress(next.progress) };
      if (next.status === 'completed') {
        current.current = next;
        dirtyRef.current = false;
        setSession(next);
        if (saved.dirty) await saveCoachCheckpoint(user.id, next, false);
      } else if (saved.dirty || pausedOnLoad || next.progress.phase === 'finished') {
        await put(next);
      } else {
        current.current = next;
        dirtyRef.current = false;
        setSession(next);
      }
      lastTick.current = Date.now();
      setSaveLabel(saved.offline ? 'Offline · saved on this device' : 'Saved progress loaded');
      if (next.progress.phase === 'finished') syncRef.current?.();
    } catch (e) {
      if (e.code === 'session_not_found' || e.code === 'unauthorized') { current.current = null; setSession(null); }
      setError(e);
    }
  }, [user.id, route.params.id, put]);
  useEffect(() => { mounted.current = true; const unregister = registerCoachSession(user.id, route.params.id); load(); return () => { mounted.current = false; unregister(); }; }, [load, user.id, route.params.id]);

  function accountForTime() {
    const s = current.current, now = Date.now();
    const delta = now - lastTick.current; lastTick.current = now;
    if (!s || s.status === 'completed') return s;
    const progress = tickProgress(s, delta, !reviewingSection.current);
    if (progress.phase === 'instructions' || progress.phase === 'finished') reviewingSection.current = false;
    return { ...s, progress };
  }
  function edit(transform, allowInactive = false) {
    const s = accountForTime(); if (!s || s.status === 'completed' || error) return;
    // An elapsed timer may have moved to the next section before a tap landed.
    const progress = s.progress.phase === 'running' || allowInactive ? transform(s.progress, s) : s.progress;
    if (progress.phase === 'instructions' || progress.phase === 'finished') reviewingSection.current = false;
    put({ ...s, progress }).catch(() => {});
    if (progress.phase !== 'running') syncRef.current?.();
  }
  async function pause() {
    setCalculator(false);
    const s = accountForTime(); if (!s || s.status === 'completed') return;
    await put({ ...s, progress: pauseProgress(s.progress) });
    syncRef.current?.();
  }
  usePreventRemove(!!session && session.status !== 'completed', ({ data }) => {
    pause().then(() => navigation.dispatch(data.action)).catch((e) => Alert.alert('Could not save', e.message));
  });
  useEffect(() => {
    const timer = setInterval(() => {
      const s = accountForTime();
      if (s && current.current?.progress.phase === 'running') {
        const changedPhase = s.progress.phase !== 'running';
        current.current = s;
        revision.current++;
        dirtyRef.current = true;
        if (mounted.current) setSession(s);
        if (changedPhase || Date.now() - lastCheckpoint.current >= 5000) {
          lastCheckpoint.current = Date.now();
          saveCoachCheckpoint(user.id, s).catch(() => { if (mounted.current) setSaveLabel('Device storage is full. Keep this screen open and sync before leaving.'); });
        }
        if (changedPhase) { setCalculator(false); syncRef.current?.(); scroll.current?.scrollTo({ y: 0 }); }
      }
    }, 1000);
    const autosave = setInterval(() => syncRef.current?.(), 60000);
    const listener = AppState.addEventListener('change', (state) => { if (state !== 'active') pause().catch(() => {}); else lastTick.current = Date.now(); });
    return () => { clearInterval(timer); clearInterval(autosave); listener.remove(); };
  }, [put]);

  useEffect(() => {
    navigation.setOptions?.({ headerShown: session?.kind !== 'assessment' });
  }, [navigation, session?.kind, session?.status]);

  const reloadConflict = () => Alert.alert('Load the account’s saved version?', 'Your unsynced changes on this device will be replaced by the latest account version.', [{ text: 'Keep this screen', style: 'cancel' }, { text: 'Load saved version', onPress: () => load(true) }]);
  if (!session) return <CoachPage>{error ? <><Copy>{error.message}</Copy><Button title={error.code === 'version_conflict' ? 'Load saved version' : 'Try again'} onPress={error.code === 'version_conflict' ? reloadConflict : () => load()} /></> : <ActivityIndicator color={colors.blue} size="large" />}</CoachPage>;
  const complete = session.status === 'completed', p = session.progress;
  const sections = sessionSections(session), section = sections[p.sectionIndex];
  const sectionIndices = session.questions.map((q, i) => q.section === section ? i : -1).filter((i) => i >= 0);
  const budget = session.budgets[section], seconds = Math.max(0, (budget == null ? (p.elapsed[section] ?? 0) / 1000 : budget - (p.elapsed[section] ?? 0) / 1000));
  const index = complete ? reviewIndex : p.index;
  const q = index == null ? null : session.questions[index];
  const answer = q ? p.answers[q.id] : null;
  const active = !complete && p.phase === 'running' && !error;
  function finishSection(showConfirmation = true) {
    const finish = () => { edit((progress, s) => advanceSection(s, progress)); scroll.current?.scrollTo({ y: 0 }); };
    if (showConfirmation === false) return finish();
    const unanswered = sectionIndices.filter((i) => { const a = p.answers[session.questions[i].id]; return a == null || (typeof a === 'object' && Object.keys(a).length < (session.questions[i].dm?.statements.length ?? 0)); }).length;
    Alert.alert(sections.length > 1 ? 'Finish this section?' : 'Finish this set?', `${unanswered ? `${unanswered} questions are not fully answered. ` : ''}${session.kind === 'assessment' ? 'You cannot return to a finished section.' : 'You can review your answers next.'}`, [{ text: 'Keep working', style: 'cancel' }, { text: 'Finish', onPress: finish }]);
  }
  async function continuePractice() {
    setSyncing(true);
    try {
      const result = await coachRequest(user.id, 'start', { kind: 'practice', section: session.questions[0].section });
      await saveCoachCheckpoint(user.id, result.session, false);
      navigation.replace('CoachSession', { id: result.session.id });
    } catch (e) { if (e.code === 'pro_required') navigation.navigate('Paywall'); else Alert.alert('Your coach', e.message); }
    finally { setSyncing(false); }
  }
  if (session.kind === 'assessment' && !complete) return <CoachTimedAssessment key={p.sectionIndex} session={session} navigation={navigation}
    error={error} syncing={syncing} saveLabel={saveLabel} onReload={reloadConflict} onSync={sync}
    onAnswer={(value) => edit((progress) => ({ ...progress, answers: { ...progress.answers, [q.id]: value } }))}
    onNavigate={(nextIndex) => edit((progress) => ({ ...progress, index: nextIndex }))}
    onFlag={() => edit((progress) => ({ ...progress, flags: { ...progress.flags, [q.id]: !progress.flags[q.id] } }))}
    onPause={() => pause().catch((e) => Alert.alert('Could not save', e.message))}
    onResume={() => { lastTick.current = Date.now(); edit((progress) => ({ ...progress, phase: 'running' }), true); }}
    onFinish={() => finishSection(false)} onReviewChange={(reviewing) => {
      const next = accountForTime();
      reviewingSection.current = reviewing && next?.progress.phase === 'running';
      if (next) { put(next).catch(() => {}); if (next.progress.phase !== 'running') syncRef.current?.(); }
    }} />;
  if (session.kind === 'assessment' && complete) return <CoachAssessmentResults session={session}
    initialReview={route.params?.review === true} onPlan={() => navigation.navigate('CoachHub')} />;
  return <CoachPage scrollRef={scroll}>
    <Copy title>{session.title}</Copy>
    {!complete && <Copy muted style={cs.caption}>{saveLabel}</Copy>}
    {error && <Card><Copy>{error.message}</Copy><Button title="Reload saved version" onPress={reloadConflict} /></Card>}
    {complete ? <>
      <SessionReport report={session.report} />
      {session.kind === 'assessment' ? <Button title="See my personal plan" onPress={() => navigation.navigate('CoachHub')} /> : <>
        <Button title="Continue with another set" disabled={syncing} onPress={continuePractice} />
        <Button title="Switch focus or finish for now" secondary onPress={() => navigation.navigate('CoachHub')} />
      </>}
      <Button title={reviewIndex == null ? 'Review my answers' : 'Close answer review'} secondary onPress={() => setReviewIndex(reviewIndex == null ? 0 : null)} />
    </> : p.phase === 'finished' ? <Card style={{ gap: 12 }}><Copy title>Your answers are ready</Copy><Copy muted>Connect to save your completed session and view the report. Your answers are saved on this device.</Copy><Button title={syncing ? 'Saving…' : 'Save & show my report'} disabled={syncing} onPress={sync} /></Card> : !active ? <Card style={{ gap: 14 }}>
      <Copy title>{p.phase === 'paused' ? 'Take the time you need.' : SECTION_NAMES[section]}</Copy>
      <Copy>{sectionIndices.length} questions · {budget == null ? 'Work at your own pace' : `${clock(seconds)} working time${session.timeMultiplier > 1 ? ' (includes extra time)' : ''}`}</Copy>
      <Copy muted>{p.phase === 'paused' ? 'The timer is paused. Your answers and flags are saved. Resume whenever you are ready.' : 'Read the full passage, scenario or data before answering. You can move between questions and flag anything to return to within this section. Explanations appear when the session is complete.'}</Copy>
      {session.kind === 'assessment' && p.phase === 'instructions' && <Copy muted>Allow about 45 seconds to get ready, then start the section. Pausing will be noted on your report.</Copy>}
      <Button title={p.phase === 'paused' ? 'Resume' : 'Start section'} disabled={!!error} onPress={() => { lastTick.current = Date.now(); edit((progress) => ({ ...progress, phase: 'running' }), true); }} />
    </Card> : <Card style={{ gap: 10 }}>
      <View style={cs.between}><Copy title>{section.toUpperCase()} · {sectionIndices.indexOf(index) + 1}/{sectionIndices.length}</Copy><Copy title style={{ fontVariant: ['tabular-nums'] }}>{clock(seconds)}</Copy></View>
      <Button title="Pause & save" secondary icon="pause" onPress={() => pause().catch((e) => Alert.alert('Could not save', e.message))} />
    </Card>}
    {(active || (complete && q)) && <>
      <View style={cs.wrap}>{(complete ? session.questions.map((_, i) => i) : sectionIndices).map((i) => {
        const item = session.questions[i], selected = i === index;
        return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Question ${i + 1}${p.flags[item.id] ? ', flagged' : ''}${p.answers[item.id] != null ? ', answered' : ', unanswered'}`} accessibilityState={{ selected }}
          onPress={() => { if (complete) setReviewIndex(i); else edit((progress) => ({ ...progress, index: i })); }} style={[cs.chip, { minWidth: 42, alignItems: 'center', backgroundColor: selected ? colors.blue : colors.surface, borderColor: p.flags[item.id] ? colors.amber : colors.border }]}>
          <Copy style={{ color: selected ? '#FFFFFF' : colors.text, fontSize: 13 }}>{i + 1}{p.flags[item.id] ? ' ⚑' : p.answers[item.id] != null ? ' ✓' : ''}</Copy>
        </Pressable>;
      })}</View>
      <Card style={{ gap: 15 }}>
        <Copy muted>{SECTION_NAMES[q.section]} · Question {index + 1}</Copy>
        {!!q.context && <Copy>{q.context}</Copy>}
        {!!q.stimulus && <QRStimulusRenderer stimulus={q.stimulus} />}
        {q.dm ? <DMStemContent question={q.dm} /> : <Copy title>{q.text}</Copy>}
        <View pointerEvents={complete ? 'none' : 'auto'}>
          {q.dm ? <DMOptionsContent question={{ ...q.dm, answer: Array.isArray(q.answer) ? undefined : q.answer, statements: q.dm.statements.map((s, i) => ({ ...s, answer: q.answer?.[i], reason: q.statementReasons?.[i] })) }} answer={answer} submitted={complete} timedMode={!complete} onAnswer={(value) => edit((progress) => ({ ...progress, answers: { ...progress.answers, [q.id]: value } }))} />
            : <View style={{ gap: 10 }}>{q.choices.map((choice) => <AnswerOptionButton key={choice.value} label={choice.label}
              state={complete ? choice.value === q.answer ? 'correct' : choice.value === answer ? 'incorrect' : 'idle' : choice.value === answer ? 'selected' : 'idle'}
              onPress={() => edit((progress) => ({ ...progress, answers: { ...progress.answers, [q.id]: choice.value } }))} />)}</View>}
        </View>
        {complete && <><Copy title>{q.grade.earned}/{q.grade.possible} marks</Copy>{answer == null && <Copy muted>You left this question unanswered.</Copy>}<Copy>{q.explanation || 'Review the statement explanations above.'}</Copy></>}
        {!complete && <Button title={p.flags[q.id] ? 'Remove flag' : 'Flag for review'} secondary icon="flag-outline" onPress={() => edit((progress) => ({ ...progress, flags: { ...progress.flags, [q.id]: !progress.flags[q.id] } }))} />}
      </Card>
      {['dm', 'qr'].includes(q.section) && <Button title="Calculator" secondary icon="calculator-outline" onPress={() => setCalculator(true)} />}
      <View style={cs.between}>
        <View style={{ flex: 1 }}><Button title="Previous" secondary disabled={complete ? index === 0 : index === sectionIndices[0]} onPress={() => { if (complete) setReviewIndex(index - 1); else edit((progress) => ({ ...progress, index: index - 1 })); }} /></View>
        <View style={{ flex: 1 }}><Button title="Next" disabled={complete ? index === session.questions.length - 1 : index === sectionIndices.at(-1)} onPress={() => { if (complete) setReviewIndex(index + 1); else edit((progress) => ({ ...progress, index: index + 1 })); }} /></View>
      </View>
      {!complete && <Button title={sections.length > 1 ? 'Finish this section' : 'Finish this set'} secondary onPress={finishSection} />}
    </>}
    <CalculatorModal visible={calculator} onClose={() => setCalculator(false)} />
  </CoachPage>;
}
