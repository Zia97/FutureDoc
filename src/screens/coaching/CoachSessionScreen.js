import Alert from '../../services/appAlert';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { hasCoachProAccess, assertCoachSessionAccess } from '../../lib/coaching/access';
import { saveCoachSession, loadCoachSession, refreshCoachSession, saveCoachCheckpoint, registerCoachSession, startCoachSession } from '../../services/coachingService';
import { localSessionResult } from '../../lib/coaching/engine';
import { tickProgress, advanceSection, pauseProgress, isUntimedSession, resumeUntimedSession, reconcileCoachSession } from '../../lib/coaching/sessionState';
import { CoachPage, Copy, Button, useCoachTheme } from '../../components/coaching/CoachUI';
import CoachQuestionSession from '../../components/coaching/CoachQuestionSession';
import CoachAssessmentResults from '../../components/coaching/CoachAssessmentResults';

export default function CoachSessionScreen({ route, navigation }) {
  const { user } = useAuth(); const { colors } = useCoachTheme();
  const { isOnline } = useNetwork();
  const subscription = useSubscription();
  const subscriptionRef = useRef(subscription);
  subscriptionRef.current = subscription;
  const canContinue = hasCoachProAccess(subscription);
  let initial = route.params.initialUserId === user.id && route.params.initialSession?.id === route.params.id ? route.params.initialSession : null;
  if (initial) { try { assertCoachSessionAccess(initial, subscription); } catch { initial = null; } }
  const [session, setSession] = useState(initial), [error, setError] = useState(null), [syncing, setSyncing] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const current = useRef(initial), revision = useRef(0), inFlight = useRef(false), mounted = useRef(true), lastTick = useRef(Date.now()), lastCheckpoint = useRef(Date.now()), syncRef = useRef(null);
  const continuing = useRef(false);
  const dirtyRef = useRef(false);
  const syncQueued = useRef(false);
  const loading = useRef(true);
  const reviewingSection = useRef(false);
  const foreground = useRef(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const put = useCallback((next, dirty = true) => {
    next = localSessionResult(next);
    current.current = next; revision.current++;
    dirtyRef.current = dirty;
    lastCheckpoint.current = Date.now();
    if (mounted.current) setSession(next);
    return saveCoachCheckpoint(user.id, next, dirty).then(() => { if (mounted.current) setStorageError(null); }).catch(() => { if (mounted.current) setStorageError('Your answers could not be saved on this device.'); throw new Error('Your progress could not be saved on this device.'); });
  }, [user.id]);
  const sync = useCallback(async () => {
    const snapshot = current.current;
    if (loading.current || !snapshot || snapshot.status === 'completed' || !dirtyRef.current) return;
    if (inFlight.current) { syncQueued.current = true; return; }
    inFlight.current = true; if (mounted.current) setSyncing(true);
    const sentRevision = revision.current;
    try {
      await saveCoachCheckpoint(user.id, snapshot);
      const { session: saved } = await saveCoachSession(user.id, snapshot);
      // A screen reopened during this request owns its newer checkpoint now.
      if (!mounted.current) return;
      const newer = revision.current !== sentRevision && saved.status !== 'completed';
      const next = newer ? reconcileCoachSession(saved, current.current) : saved;
      await put(next, newer);
    } catch {
      // Keep answering from the local checkpoint; autosave retries silently.
    } finally {
      inFlight.current = false; if (mounted.current) setSyncing(false);
      if (syncQueued.current) { syncQueued.current = false; syncRef.current?.(); }
    }
  }, [user.id, put]);
  syncRef.current = sync;
  useEffect(() => { if (isOnline) syncRef.current?.(); }, [isOnline]);
  const load = useCallback(async () => {
    loading.current = true;
    try {
      setError(null);
      const shownRevision = revision.current;
      const saved = await loadCoachSession(user.id, route.params.id, subscriptionRef.current);
      assertCoachSessionAccess(saved.session, subscriptionRef.current);
      if (!mounted.current) return;
      const editedDuringLoad = shownRevision !== revision.current && saved.session.status !== 'completed';
      const loaded = editedDuringLoad ? reconcileCoachSession(saved.session, current.current) : saved.session;
      let next = foreground.current ? resumeUntimedSession(loaded) : loaded;
      const resumedOnLoad = next !== saved.session;
      const pausedOnLoad = next.status !== 'completed' && next.progress.phase === 'running' && (!isUntimedSession(next) || !foreground.current);
      if (pausedOnLoad) next = { ...next, progress: pauseProgress(next.progress) };
      if (next.status === 'completed') {
        current.current = next;
        dirtyRef.current = false;
        setSession(next);
        if (saved.dirty) await saveCoachCheckpoint(user.id, next, false);
      } else if (saved.dirty || editedDuringLoad || resumedOnLoad || pausedOnLoad || next.progress.phase === 'finished') {
        await put(next);
      } else {
        current.current = next;
        dirtyRef.current = false;
        setSession(next);
      }
      lastTick.current = Date.now();
      // Older downloads predate device scoring. Upgrade them without delaying
      // the questions or replacing answers entered while the download runs.
      if (next.status !== 'completed' && !next.offlineScoring) {
        void refreshCoachSession(user.id, route.params.id).then(({ session: refreshed }) => {
          if (!mounted.current) return;
          const merged = reconcileCoachSession(refreshed, current.current);
          return put(foreground.current ? resumeUntimedSession(merged) : merged, dirtyRef.current);
        }).catch(() => {});
      }
    } catch (e) {
      if (e.code === 'pro_required') {
        current.current = null; setSession(null);
        if (subscriptionRef.current?.loading) return;
        setError(e); navigation.navigate('Paywall');
      }
      if (e.code === 'session_not_found' || e.code === 'unauthorized') { current.current = null; setSession(null); }
      if (!current.current) setError(e);
    } finally {
      loading.current = false;
      if (current.current?.progress.phase === 'finished') syncRef.current?.();
    }
  }, [user.id, route.params.id, put]);
  useEffect(() => { mounted.current = true; const unregister = registerCoachSession(user.id, route.params.id); load(); return () => { mounted.current = false; unregister(); }; }, [load, user.id, route.params.id, subscription?.loading]);
  useEffect(() => { if (canContinue && error?.code === 'pro_required') load(); }, [canContinue, error?.code, load]);

  function accountForTime() {
    const s = current.current, now = Date.now();
    const delta = now - lastTick.current; lastTick.current = now;
    if (!s || s.status === 'completed' || !foreground.current) return s;
    const progress = tickProgress(s, delta, !reviewingSection.current);
    if (progress.phase === 'instructions' || progress.phase === 'finished') reviewingSection.current = false;
    return { ...s, progress };
  }
  function edit(transform, allowInactive = false) {
    const s = accountForTime(); if (!s || s.status === 'completed') return;
    // An elapsed timer may have moved to the next section before a tap landed.
    const progress = s.progress.phase === 'running' || allowInactive ? transform(s.progress, s) : s.progress;
    if (progress.phase === 'instructions' || progress.phase === 'finished') reviewingSection.current = false;
    put({ ...s, progress }).catch(() => {});
    if (progress.phase !== 'running') syncRef.current?.();
  }
  async function pause() {
    const s = accountForTime(); if (!s || s.status === 'completed') return;
    await put({ ...s, progress: pauseProgress(s.progress) });
    syncRef.current?.();
  }
  usePreventRemove(!!session && session.status !== 'completed' && session.progress.phase !== 'finished', ({ data }) => {
    pause().then(() => navigation.dispatch(data.action)).catch((e) => Alert.alert('Could not save', e.message));
  });
  useEffect(() => {
    const timer = setInterval(() => {
      if (!foreground.current) return;
      const s = accountForTime();
      if (s && current.current?.progress.phase === 'running') {
        const changedPhase = s.progress.phase !== 'running';
        revision.current++;
        dirtyRef.current = true;
        const next = localSessionResult(s);
        current.current = next;
        if (mounted.current) setSession(next);
        if (changedPhase || Date.now() - lastCheckpoint.current >= 5000) {
          lastCheckpoint.current = Date.now();
          saveCoachCheckpoint(user.id, next).catch(() => { if (mounted.current) setStorageError('Your answers could not be saved on this device.'); });
        }
        if (changedPhase) syncRef.current?.();
      }
    }, 1000);
    const autosave = setInterval(() => syncRef.current?.(), 60000);
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        pause().catch(() => {});
        foreground.current = false;
      } else {
        foreground.current = true;
        lastTick.current = Date.now();
        const saved = current.current;
        if (saved) {
          const next = resumeUntimedSession(saved);
          if (next !== saved) put(next).catch(() => {});
          syncRef.current?.();
        }
      }
    });
    return () => { clearInterval(timer); clearInterval(autosave); listener.remove(); };
  }, [put]);

  if (!session) return <CoachPage>{error ? <><Copy>Could not load questions. Please try again.</Copy><Button title="Try again" onPress={load} /><Button title="Back to coaching" secondary onPress={() => navigation.goBack()} /></> : <ActivityIndicator color={colors.blue} size="large" />}</CoachPage>;
  const complete = session.status === 'completed' || (session.progress.phase === 'finished' && !!session.report), p = session.progress;
  const q = session.questions[p.index];
  async function continuePractice() {
    if (continuing.current) return;
    if (subscriptionRef.current?.loading) return;
    if (!hasCoachProAccess(subscriptionRef.current)) { navigation.navigate('Paywall'); return; }
    continuing.current = true;
    const open = (next) => navigation.replace('CoachSession', { id: next.id, initialUserId: user.id, initialSession: next });
    let opened = false;
    try {
      setPreparing(true);
      const { session: next } = await startCoachSession(user.id, 'practice', { section: session.questions[0].section }, subscriptionRef.current);
      if (!hasCoachProAccess(subscriptionRef.current)) { navigation.navigate('Paywall'); return; }
      open(next); opened = true;
    } catch (e) { if (e.code === 'pro_required') navigation.navigate('Paywall'); else Alert.alert('Your coach', e.message); }
    finally { if (!opened) continuing.current = false; if (mounted.current) setPreparing(false); }
  }
  if (complete) return <CoachAssessmentResults session={session}
    initialReview={route.params?.review === true}
    onPlan={session.kind === 'assessment' ? () => navigation.navigate('CoachPlanIntro', { id: session.id,
      ...(session.status !== 'completed' ? { previous: { id: session.id, progress: session.progress } } : {}) }) : undefined}
    onContinue={session.kind !== 'assessment' ? continuePractice : undefined}
    onDone={session.kind !== 'assessment' ? () => navigation.popTo('MainTabs', { screen: 'Coaching' }) : undefined}
    busy={preparing || !!subscription?.loading} />;
  return <CoachQuestionSession key={p.sectionIndex} session={session} navigation={navigation}
    syncing={syncing} storageError={storageError}
    onAnswer={(value) => edit((progress) => progress.index === p.index
      ? { ...progress, answers: { ...progress.answers, [q.id]: value } } : progress)}
    onNavigate={(nextIndex) => edit((progress) => session.questions[nextIndex]?.section === session.questions[progress.index]?.section
      ? { ...progress, index: nextIndex } : progress)}
    onFlag={() => edit((progress) => progress.index === p.index
      ? { ...progress, flags: { ...progress.flags, [q.id]: !progress.flags[q.id] } } : progress)}
    onPause={() => pause().catch((e) => Alert.alert('Could not save', e.message))}
    onResume={() => { lastTick.current = Date.now(); edit((progress) =>
      ['instructions', 'paused'].includes(progress.phase) ? { ...progress, phase: 'running' } : progress, true); }}
    onFinish={() => edit((progress, s) => advanceSection(s, progress))}
    onReviewChange={(reviewing) => {
      const next = accountForTime();
      reviewingSection.current = reviewing && next?.progress.phase === 'running';
      if (next) { put(next).catch(() => {}); if (next.progress.phase !== 'running') syncRef.current?.(); }
    }} />;
}
