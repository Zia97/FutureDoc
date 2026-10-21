import Alert from '../../services/appAlert';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { coachRequest, startCoachSession, readCoachSessionCache, loadCoachHubCache, saveCoachHubCache, queueCoachPreferences, flushCoachPreferences, flushCoachCheckpoints, resetCoachProgress } from '../../services/coachingService';
import { flushPracticeAttempts } from '../../services/practiceAttemptQueue';
import { ensureCoachQuestionBanks } from '../../services/practiceContentService';
import { useNetwork } from '../../context/NetworkContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { hasCoachProAccess } from '../../lib/coaching/access';
import CoachQuestionSetup from '../../components/coaching/CoachQuestionSetup';
import { isPreviewEnabled } from '../../dev/previewStore';
import { getExamDate, NOT_BOOKED, setExamDate } from '../../services/onboardingFlags';
import { validExamDate } from '../../lib/coaching/engine';
import { buildDashboardStory, resumeSummary, sectionSnapshot } from '../../lib/coaching/dashboard';
import ExamDateCalendar, { formatLocalISO, parseLocalISO } from '../../components/ExamDateCalendar';
import { Button, useCoachTheme } from '../../components/coaching/CoachUI';
import { Segments } from '../../components/performance/PerformanceUI';
import { CoachText, DashboardHeader, ProgressOverview, NextPracticeCard, CoachInsightCard, CoachChatDock, CoachSheet, TextLink, ds } from '../../components/coaching/CoachDashboardUI';
import CoachProgressDetails from '../../components/coaching/CoachProgressDetails';
import CoachWelcome from '../../components/coaching/CoachWelcome';
import CoachProgressOverview from '../../components/coaching/CoachProgressOverview';
import CoachProgressChart from '../../components/coaching/CoachProgressChart';
import { useMarketingDemo, getMarketingDemo } from '../../dev/useMarketingDemo';

export default function CoachHubScreen({ navigation, route }) {
  const marketingDemo = useMarketingDemo();
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const subscription = useSubscription();
  const hasPro = marketingDemo || hasCoachProAccess(subscription);
  const { colors, isDark } = useCoachTheme();
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState(route?.params?.area === 'progress' ? 'progress' : 'coach');
  useEffect(() => {
    if (route?.params?.area) {
      setArea(route.params.area === 'progress' ? 'progress' : 'coach');
      navigation.setParams({ area: undefined });
    }
  }, [route?.params?.area, navigation]);
  const [realData, setData] = useState(null), [error, setError] = useState(null), [busy, setBusy] = useState(false);
  const data = marketingDemo ? getMarketingDemo().coach : realData;
  const [samplePreviewEnabled, setSamplePreviewEnabled] = useState(false);
  const [questionSetup, setQuestionSetup] = useState(null), [setupError, setSetupError] = useState(null);
  const [setupRetry, setSetupRetry] = useState(0);
  const [questionsReady, setQuestionsReady] = useState(false);
  useEffect(() => {
    if (marketingDemo) return;
    let active = true;
    setSetupError(null);
    void ensureCoachQuestionBanks((progress) => {
      if (!active) return;
      setQuestionsReady(!!progress.ready);
      setQuestionSetup(progress.ready ? null : progress);
    }).catch(() => {
      if (active) setSetupError('Connect to the internet and check that your device has space, then retry.');
    });
    return () => { active = false; };
  }, [marketingDemo, isOnline, setupRetry]);
  const [sheet, setSheet] = useState(null), [progressTab, setProgressTab] = useState('overview');
  const [examDate, setDate] = useState(''), [multiplier, setMultiplier] = useState(1), [datePickerOpen, setDatePickerOpen] = useState(false);
  const [savedDate, setSavedDate] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const loadVersion = useRef(0), sheetRef = useRef(sheet);
  sheetRef.current = sheet;

  const load = useCallback(async () => {
    if (marketingDemo) {
      setDate(getMarketingDemo().examDate); setSavedDate(getMarketingDemo().examDate); setMultiplier(1); setError(null);
      return;
    }
    if (!user?.id) return;
    const version = ++loadVersion.current;
    try {
      if (__DEV__) void isPreviewEnabled('coach_sample').then(setSamplePreviewEnabled).catch(() => {});
      const [cached, local] = await Promise.all([loadCoachHubCache(user.id), getExamDate()]);
      if (version !== loadVersion.current) return;
      // A completed session can replace or invalidate the dashboard while this
      // screen stays mounted underneath the assessment and first-plan screens.
      setData(cached ?? { settings: { time_multiplier: 1 }, profile: null, baseline: null, active: null, history: [], previewAvailable: true });
      if (sheetRef.current !== 'settings') {
        const date = local === NOT_BOOKED ? '' : local || cached?.settings.exam_date || '';
        setDate(date); setSavedDate(date);
        if (cached) setMultiplier(Number(cached.settings.time_multiplier));
      }
      void Promise.allSettled([flushCoachPreferences(user.id), flushPracticeAttempts(user.id), flushCoachCheckpoints(user.id)]);
      const next = await coachRequest(user.id, 'hub');
      if (version !== loadVersion.current) return;
      const merged = await saveCoachHubCache(user.id, next);
      if (version !== loadVersion.current) return;
      setData(merged); setError(null);
      if (sheetRef.current !== 'settings') {
        const date = local === NOT_BOOKED ? '' : local || merged.settings.exam_date || '';
        setDate(date); setSavedDate(date);
        setMultiplier(Number(merged.settings.time_multiplier));
      }
    } catch (e) { if (version === loadVersion.current) setError(e.message); }
  }, [marketingDemo, user?.id, isOnline]);
  useFocusEffect(useCallback(() => { load(); return () => { loadVersion.current++; }; }, [load]));
  useEffect(() => {
    let cancelled = false;
    setActiveSession(null);
    if (data?.active?.id) void readCoachSessionCache(user.id, data.active.id)
      .then((cached) => { if (!cancelled) setActiveSession(cached?.session ?? null); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, data?.active?.id, data]);

  const story = useMemo(() => buildDashboardStory(data?.profile, data?.baseline, data?.history), [data]);
  const sections = useMemo(() => sectionSnapshot(data?.profile, data?.baseline), [data]);
  const resume = resumeSummary(activeSession, data?.active);
  const profile = data?.profile;
  const locked = !hasPro && !data?.previewAvailable;
  const selectedExamDate = parseLocalISO(examDate);
  const savedExamDate = parseLocalISO(savedDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = savedExamDate ? Math.round((savedExamDate - today) / 86400000) : null;
  const examLabel = days == null ? null : days < 0 ? 'Update your exam date in settings' : days === 0 ? 'Your exam is today' : days === 1 ? 'Your exam is tomorrow' : days + ' days to your exam';

  function closeSheet() { setSheet(null); setDatePickerOpen(false); }
  function openSettings() {
    if (!data) return;
    setDate(savedDate); setMultiplier(Number(data.settings.time_multiplier)); setSheet('settings');
  }
  function openProgress(tab = 'overview') {
    if (tab === 'overview') { closeSheet(); setArea('progress'); }
    else { setProgressTab(tab); setSheet('progress'); }
  }
  function showAccuracyInfo() {
    Alert.alert('Running accuracy', 'Your running accuracy starts with your mini mock and updates as you practise, using your latest 20 first attempts in each section. Repeated questions count once. Your full history stays saved, and your coaching plan uses your wider performance.');
  }
  function go(screen, params) {
    closeSheet();
    if (marketingDemo && screen === 'CoachSession') {
      const report = params.id === data.baseline.id ? data.baseline.report : data.history.find((s) => s.id === params.id)?.report;
      navigation.navigate('CoachSampleResults', { report, marketingDemo: true }); return;
    }
    navigation.navigate(screen, params);
  }
  function lesson(item) { if (item?.lessonRoute) go(item.lessonRoute, { lessonId: item.lessonId }); }
  async function start(kind, focus = {}) {
    if (marketingDemo) return Alert.alert('Marketing demo', 'Turn off Marketing demo in Profile to start a real session.');
    if (kind !== 'assessment' && subscription?.loading) return;
    if (kind !== 'assessment' && locked) return go('Paywall');
    if (kind !== 'assessment' && !questionsReady) return;
    closeSheet(); setBusy(true);
    try {
      const result = await startCoachSession(user.id, kind, focus, subscription);
      setData(await loadCoachHubCache(user.id));
      navigation.navigate('CoachSession', { id: result.session.id });
    } catch (e) { if (e.code === 'pro_required') navigation.navigate('Paywall'); else Alert.alert('Your coach', e.message); }
    finally { setBusy(false); }
  }
  function practise(kind = 'practice', focus = {}) {
    if (data?.active) return go('CoachSession', { id: data.active.id });
    if (locked) return go('Paywall');
    return start(kind, focus);
  }
  async function previewSample() {
    setBusy(true);
    try {
      const result = await coachRequest(user.id, 'dev_sample');
      navigation.navigate('CoachSampleResults', { report: result.report });
    } catch (e) { Alert.alert('Sample results unavailable', e.message); }
    finally { setBusy(false); }
  }
  async function saveSettings() {
    if (marketingDemo) { closeSheet(); return; }
    const date = examDate.trim() || null;
    if (!validExamDate(date)) return Alert.alert('Check the date', 'Choose an exam date or select Not booked yet.');
    setBusy(true);
    loadVersion.current++;
    try {
      await setExamDate(date ?? NOT_BOOKED, false);
      await queueCoachPreferences(user.id, { examDate: date, timeMultiplier: multiplier });
      setSavedDate(date ?? '');
      setData(await loadCoachHubCache(user.id));
      closeSheet();
    } catch (e) { Alert.alert('Could not save', e.message); }
    finally { setBusy(false); }
  }
  function confirmReset() {
    if (marketingDemo) return Alert.alert('Marketing demo', 'Sample progress cannot be reset. Turn off Marketing demo to manage your real progress.');
    Alert.alert('Delete coaching progress?',
      'Your initial assessment, coaching sessions, answers, reports, plan, milestones and coach chat will be permanently deleted. You will need to resit the initial assessment. Your separate practice, timed-test and AI tutor records will stay in the app. Used free coaching credits will not be restored.',
      [{ text: 'Keep my progress', style: 'cancel' }, {
        text: 'Delete coaching data', style: 'destructive', onPress: async () => {
          setBusy(true); loadVersion.current++;
          try {
            await resetCoachProgress(user.id);
            setData(null); closeSheet(); await load();
          } catch (e) {
            if (e.code === 'local_cleanup_failed') {
              setData(null); closeSheet(); await load();
              Alert.alert('Coaching reset on your account', e.message);
            } else Alert.alert('Could not reset coaching', e.message);
          } finally { setBusy(false); }
        },
      }]);
  }

  return <SafeAreaView edges={['top', 'left', 'right']} style={[ds.page, { backgroundColor: colors.bgTop }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
    <DashboardHeader onBack={() => route?.name === 'Coaching' ? navigation.navigate('Home') : navigation.goBack()} onSettings={openSettings} examLabel={examLabel} />
    <View style={{ paddingHorizontal: 20, paddingBottom: 12, width: '100%', maxWidth: 800, alignSelf: 'center' }}>
      <Segments values={[{ id: 'coach', label: 'Your coach' }, { id: 'progress', label: 'Your progress' }]} value={area} onChange={setArea} />
    </View>
    {area === 'progress' ? <CoachProgressOverview navigation={navigation}
      onHistory={profile ? () => openProgress('history') : null} /> : <ScrollView style={ds.coachScroll} showsVerticalScrollIndicator={false} contentContainerStyle={ds.content}>
      {questionSetup && !marketingDemo && <CoachQuestionSetup progress={questionSetup} error={setupError} onRetry={() => setSetupRetry((value) => value + 1)} />}
      {error && !data && <View style={[ds.option, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}><CoachText style={{ fontSize: 12, fontWeight: '700' }}>{data ? 'Showing your saved progress' : 'Your coach could not connect'}</CoachText>
          <CoachText muted style={ds.caption}>{data ? 'Your plan is still here. Reconnect to update it.' : error}</CoachText></View>
        <TextLink title="Retry" onPress={load} />
      </View>}
      {!data ? (!error && <ActivityIndicator color={colors.blue} size="large" accessibilityLabel="Loading your coach" style={{ marginTop: 40 }} />)
        : !profile ? <>
          <CoachWelcome>
            {data.active ? <NextPracticeCard resume={resume} busy={busy} onContinue={() => practise()} /> : null}
          </CoachWelcome>
          <TextLink title="How coaching works" icon="help-circle-outline" onPress={() => setSheet('how')} style={{ alignSelf: 'flex-start' }} />
          {__DEV__ && samplePreviewEnabled && !data.active && <Button title="Developer: preview sample results" secondary disabled={busy} onPress={previewSample} />}
        </> : <>
          <CoachProgressChart history={profile.overallHistory} />
          <ProgressOverview story={story} sections={sections} onProgress={() => openProgress()}
            onSection={(section) => go('CoachSectionProgress', { section, mode: 'combined' })}
            onAccuracyInfo={showAccuracyInfo} />
          <NextPracticeCard focus={story.focus} resume={resume} busy={busy || (!marketingDemo && !data.active && (subscription?.loading || (!locked && !questionsReady)))} locked={locked} preview={data.previewAvailable && !hasPro}
            onContinue={() => practise('practice', story.focus ? { skillId: story.focus.skillId } : {})}
            onLesson={story.focus?.lessonRoute ? () => lesson(story.focus) : null} onPlan={() => openProgress('plan')} />
          <CoachInsightCard story={story} strengths={profile.strengths} weaknesses={profile.weaknesses} onDetails={() => openProgress()} onHow={() => setSheet('how')} />
        </>}
      {profile && <CoachChatDock onPress={() => go('CoachChat')} remaining={data.chatRemaining} />}
    </ScrollView>}
    {area === 'coach' && data && !profile && !data.active && <View style={{ paddingHorizontal: 20, paddingTop: 12,
      paddingBottom: route?.name === 'Coaching' ? 12 : Math.max(insets.bottom, 12), borderTopWidth: 1, borderTopColor: colors.border }}>
      <View style={{ width: '100%', maxWidth: 800, alignSelf: 'center' }}>
        <Button title={busy ? 'Preparing your mini mock…' : 'Start my mini mock'} disabled={busy} onPress={() => start('assessment')} />
      </View>
    </View>}

    <CoachSheet visible={!!sheet} title={sheet === 'settings' ? 'Coach settings' : sheet === 'how' ? 'How coaching works' : 'Your progress'} onClose={closeSheet}>
      {sheet === 'how' && <View style={{ gap: 16 }}>
        <View style={{ gap: 5 }}><CoachText style={ds.cardTitle}>Start with a mini mock</CoachText>
          <CoachText muted>Your timed assessment gives us a first picture of what you already do well and what to practise next.</CoachText></View>
        <View style={{ gap: 5 }}><CoachText style={ds.cardTitle}>Get a plan that can change</CoachText>
          <CoachText muted>Your answers in coaching, Free Practice and Timed Tests help us choose relevant questions and lessons. Your focus can change as your results do.</CoachText></View>
        <View style={{ gap: 5 }}><CoachText style={ds.cardTitle}>See your progress</CoachText>
          <CoachText muted>We track your recent results across each section. Your exam date helps shape the practice we recommend.</CoachText></View>
        <View style={{ gap: 5 }}><CoachText style={ds.cardTitle}>Ask your coach</CoachText>
          <CoachText muted>Questions help your coach explain things in context.</CoachText></View>
      </View>}
      {sheet === 'settings' && <>
        <CoachText style={ds.cardTitle}>Your exam date</CoachText>
        <Pressable accessibilityRole="button" accessibilityLabel="Choose exam date" onPress={() => setDatePickerOpen(!datePickerOpen)}
          style={[ds.option, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.blue} />
          <CoachText style={{ flex: 1 }}>{selectedExamDate ? selectedExamDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not booked yet'}</CoachText>
          <Ionicons name={datePickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </Pressable>
        {datePickerOpen && <>
          <ExamDateCalendar key={examDate || 'not-booked'} selected={selectedExamDate} onSelectDay={(date) => { setDate(formatLocalISO(date)); setDatePickerOpen(false); }} />
          <TextLink title="Not booked yet" onPress={() => { setDate(''); setDatePickerOpen(false); }} />
        </>}
        <View style={{ gap: 10 }}>
          <CoachText style={ds.cardTitle}>Time allowance</CoachText>
          <Segments values={[{ id: 1, label: 'Standard' }, { id: 1.25, label: '+25%' }, { id: 1.5, label: '+50%' }]} value={multiplier} onChange={setMultiplier} />
          <CoachText muted style={ds.caption}>Applies to new timed sessions. A session already started keeps its original allowance.</CoachText>
        </View>
        <Button title={busy ? 'Saving…' : 'Save settings'} disabled={busy} onPress={saveSettings} />
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 18, marginTop: 6 }}>
          <CoachText style={{ fontSize: 13, fontWeight: '700' }}>Start again</CoachText>
          <CoachText muted style={[ds.caption, { marginTop: 4 }]}>Delete your coaching progress and resit the mini mock.</CoachText>
          <TextLink title="Delete coaching data" icon="trash-outline" color={colors.red} disabled={busy} onPress={confirmReset} style={{ alignSelf: 'flex-start' }} />
        </View>
      </>}
      {sheet === 'progress' && profile && <CoachProgressDetails data={{ ...data, pro: hasPro }} story={story} tab={progressTab} onTabChange={setProgressTab}
        onAccuracyInfo={showAccuracyInfo}
        onSection={(section) => go('CoachSectionProgress', { section, mode: 'combined' })}
        onSkill={(skillId) => go('PerformanceSkill', { skillId, mode: 'combined' })}
        busy={busy} onSession={(id) => go('CoachSession', { id })} onLesson={lesson}
        onPractice={(item) => practise('practice', { skillId: item.skillId })} />}
    </CoachSheet>
  </SafeAreaView>;
}
