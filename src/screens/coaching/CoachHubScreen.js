import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { coachRequest, saveCoachCheckpoint, readCoachSessionCache, loadCoachHubCache, saveCoachHubCache, queueCoachPreferences, flushCoachPreferences, flushCoachCheckpoints, resetCoachProgress } from '../../services/coachingService';
import { flushPracticeAttempts } from '../../services/practiceAttemptQueue';
import { isPreviewEnabled } from '../../dev/previewStore';
import { getExamDate, NOT_BOOKED, setExamDate } from '../../services/onboardingFlags';
import { validExamDate } from '../../lib/coaching/engine';
import { buildDashboardStory, resumeSummary, sectionSnapshot, sectionName } from '../../lib/coaching/dashboard';
import ExamDateCalendar, { formatLocalISO, parseLocalISO } from '../../components/ExamDateCalendar';
import { PremiumIcon } from '../../components/premium/PremiumPracticeUI';
import { Button, useCoachTheme } from '../../components/coaching/CoachUI';
import { Segments } from '../../components/performance/PerformanceUI';
import { hexToRgba } from '../../theme/premiumTheme';
import { CoachText, DashboardHeader, ProgressOverview, NextPracticeCard, CoachInsightCard, CoachChatDock, CoachSheet, SectionChoices, TextLink, ds } from '../../components/coaching/CoachDashboardUI';
import CoachProgressDetails from '../../components/coaching/CoachProgressDetails';

const PRACTICE_MODES = [
  { id: 'practice', title: 'Untimed practice', icon: 'sparkles-outline' },
  { id: 'review', title: 'Review mistakes', icon: 'refresh-outline' },
  { id: 'timed_check', title: 'Timed practice', icon: 'timer-outline' },
];

export default function CoachHubScreen({ navigation, route }) {
  const { user } = useAuth();
  const { colors, isDark } = useCoachTheme();
  const [data, setData] = useState(null), [error, setError] = useState(null), [busy, setBusy] = useState(false);
  const [samplePreviewEnabled, setSamplePreviewEnabled] = useState(false);
  const [sheet, setSheet] = useState(null), [progressTab, setProgressTab] = useState('overview');
  const [examDate, setDate] = useState(''), [multiplier, setMultiplier] = useState(1), [datePickerOpen, setDatePickerOpen] = useState(false);
  const [savedDate, setSavedDate] = useState('');
  const [section, setSection] = useState('vr'), [skill, setSkill] = useState(null), [mode, setMode] = useState('practice');
  const [skillPickerOpen, setSkillPickerOpen] = useState(false), [activeSession, setActiveSession] = useState(null);
  const loadVersion = useRef(0), sheetRef = useRef(sheet);
  sheetRef.current = sheet;

  const load = useCallback(async () => {
    if (!user?.id) return;
    const version = ++loadVersion.current;
    try {
      if (__DEV__) void isPreviewEnabled('coach_sample').then(setSamplePreviewEnabled).catch(() => {});
      const [cached, local] = await Promise.all([loadCoachHubCache(user.id), getExamDate()]);
      if (version !== loadVersion.current) return;
      if (cached) setData((current) => current ?? cached);
      if (sheetRef.current !== 'settings') {
        const date = local === NOT_BOOKED ? '' : local || cached?.settings.exam_date || '';
        setDate(date); setSavedDate(date);
        if (cached) setMultiplier(Number(cached.settings.time_multiplier));
      }
      await Promise.allSettled([flushCoachPreferences(user.id), flushPracticeAttempts(user.id), flushCoachCheckpoints(user.id)]);
      const next = await coachRequest(user.id, 'hub');
      if (version !== loadVersion.current) return;
      setData(next); setError(null);
      if (sheetRef.current !== 'settings') {
        const date = local === NOT_BOOKED ? '' : local || next.settings.exam_date || '';
        setDate(date); setSavedDate(date);
        setMultiplier(Number(next.settings.time_multiplier));
      }
      void saveCoachHubCache(user.id, next).catch(() => {});
    } catch (e) { if (version === loadVersion.current) setError(e.message); }
  }, [user?.id]);
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
  const locked = data?.pro === false && !data?.previewAvailable;
  const chosenSkill = profile?.skills?.find((item) => item.id === skill);
  const selectedExamDate = parseLocalISO(examDate);
  const savedExamDate = parseLocalISO(savedDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = savedExamDate ? Math.round((savedExamDate - today) / 86400000) : null;
  const examLabel = days == null ? null : days < 0 ? 'Update your exam date in settings' : days === 0 ? 'Your exam is today' : days === 1 ? 'Your exam is tomorrow' : days + ' days to your exam';

  function closeSheet() { setSheet(null); setDatePickerOpen(false); setSkillPickerOpen(false); }
  function openSettings() {
    if (!data) return;
    setDate(savedDate); setMultiplier(Number(data.settings.time_multiplier)); setSheet('settings');
  }
  function openProgress(tab = 'overview') { setProgressTab(tab); setSheet('progress'); }
  function go(screen, params) { closeSheet(); navigation.navigate(screen, params); }
  function lesson(item) { if (item?.lessonRoute) go(item.lessonRoute, { lessonId: item.lessonId }); }
  async function start(kind, focus = {}) {
    closeSheet(); setBusy(true);
    try {
      const result = await coachRequest(user.id, 'start', { kind, ...focus });
      await saveCoachCheckpoint(user.id, result.session, false);
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
    const date = examDate.trim() || null;
    if (!validExamDate(date)) return Alert.alert('Check the date', 'Choose an exam date or select Not booked yet.');
    setBusy(true);
    loadVersion.current++;
    try {
      await setExamDate(date ?? NOT_BOOKED, false);
      await queueCoachPreferences(user.id, { examDate: date, timeMultiplier: multiplier });
      setSavedDate(date ?? '');
      if (data) {
        const updated = { ...data, settings: { ...data.settings, exam_date: date, time_multiplier: multiplier } };
        setData(updated);
        void saveCoachHubCache(user.id, updated).catch(() => {});
      }
      closeSheet();
    } catch (e) { Alert.alert('Could not save', e.message); }
    finally { setBusy(false); }
  }
  function confirmReset() {
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
    <ScrollView style={ds.coachScroll} showsVerticalScrollIndicator={false} contentContainerStyle={ds.content}>
      {error && <View style={[ds.option, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}><CoachText style={{ fontSize: 12, fontWeight: '700' }}>{data ? 'Showing your saved progress' : 'Your coach could not connect'}</CoachText>
          <CoachText muted style={ds.caption}>{data ? 'Your plan is still here. Reconnect to update it.' : error}</CoachText></View>
        <TextLink title="Retry" onPress={load} />
      </View>}
      {!data ? (!error && <ActivityIndicator color={colors.blue} size="large" accessibilityLabel="Loading your coach" style={{ marginTop: 40 }} />)
        : !profile ? <>
          <View style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 15, padding: 24 }]}>
            <View style={[ds.coachAvatar, { width: 58, height: 58, borderRadius: 20, backgroundColor: hexToRgba(colors.purple, 0.12) }]}><PremiumIcon name="coach" size={34} color={colors.purple} /></View>
            <CoachText style={[ds.heroTitle, { fontSize: 28, lineHeight: 35 }]}>Meet your UCAT coach.</CoachText>
            <CoachText muted>Discover your strengths, work on the areas that need support, and see your progress as you prepare.</CoachText>
            <View style={[ds.row, { alignItems: 'flex-start', gap: 8, marginVertical: 6 }]}>
              {['Find your level', 'Build your plan', 'Grow your skills'].map((label, index) => <View key={label} style={{ flex: 1, gap: 7 }}>
                <View style={[ds.coachAvatar, { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.surfaceSoft }]}><CoachText style={{ color: colors.purple, fontSize: 12, fontWeight: '800' }}>{index + 1}</CoachText></View>
                <CoachText style={{ fontSize: 11, lineHeight: 16, fontWeight: '600' }}>{label}</CoachText>
              </View>)}
            </View>
            {!data.active && <>
              <CoachText style={ds.cardTitle}>Start with your mini mock</CoachText>
              <CoachText muted>A timed introduction across all four sections. Your answers will shape your first coaching plan.</CoachText>
              <CoachText muted style={ds.caption}>Around 35 minutes · pause and finish later</CoachText>
              <Button title={busy ? 'Preparing your mini mock…' : 'Start my mini mock'} disabled={busy} onPress={() => start('assessment')} />
            </>}
          </View>
          {data.active && <NextPracticeCard resume={resume} busy={busy} onContinue={() => practise()} />}
          <TextLink title="How coaching works" icon="help-circle-outline" onPress={() => setSheet('how')} style={{ alignSelf: 'flex-start' }} />
          {__DEV__ && samplePreviewEnabled && !data.active && <Button title="Developer: preview sample results" secondary disabled={busy} onPress={previewSample} />}
        </> : <>
          <ProgressOverview story={story} sections={sections} onProgress={() => openProgress()}
            onAccuracyInfo={() => Alert.alert('Your accuracy', 'It starts with your mini mock results. As you answer new questions, it uses your latest 20 first attempts in each section. Repeated questions count once.')} />
          <NextPracticeCard focus={story.focus} resume={resume} busy={busy} locked={locked} preview={data.previewAvailable && data.pro === false}
            onContinue={() => practise('practice', story.focus ? { skillId: story.focus.skillId } : {})}
            onLesson={story.focus?.lessonRoute ? () => lesson(story.focus) : null} onChange={() => setSheet('practice')} onPlan={() => openProgress('plan')} />
          <CoachInsightCard story={story} strengths={profile.strengths} weaknesses={profile.weaknesses} onDetails={() => openProgress()} onHow={() => setSheet('how')} />
          {data.pro === null && <CoachText muted style={ds.caption}>Reconnect to confirm Pro access. Your saved results remain available.</CoachText>}
        </>}
      {profile && <CoachChatDock onPress={() => go('CoachChat')} remaining={data.chatRemaining} />}
    </ScrollView>

    <CoachSheet visible={!!sheet} title={sheet === 'settings' ? 'Coach settings' : sheet === 'practice' ? 'Choose your practice' : sheet === 'how' ? 'How coaching works' : 'Your progress'} onClose={closeSheet}>
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
      {sheet === 'practice' && <>
        <View><CoachText style={ds.cardTitle}>1. Choose a section</CoachText>
          <SectionChoices value={section} onChange={(value) => { setSection(value); setSkill(null); setSkillPickerOpen(false); }} /></View>
        <View style={{ gap: 10 }}>
          <CoachText style={ds.cardTitle}>2. Pick a question type</CoachText>
          <Pressable onPress={() => setSkillPickerOpen(!skillPickerOpen)} accessibilityRole="button" accessibilityState={{ expanded: skillPickerOpen }}
            style={[ds.option, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <CoachText style={{ flex: 1 }}>{chosenSkill?.label ?? 'All question types'}</CoachText>
            <Ionicons name={skillPickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          {skillPickerOpen && [{ id: null, label: 'All question types' }, ...(profile?.skills ?? []).filter((item) => item.section === section)].map((item) =>
            <Pressable key={item.id ?? 'all'} onPress={() => { setSkill(item.id); setSkillPickerOpen(false); }} accessibilityRole="radio" accessibilityState={{ checked: skill === item.id }}
              style={[ds.option, { borderColor: skill === item.id ? colors.blue : colors.border, backgroundColor: colors.surface }]}>
              <CoachText style={{ flex: 1, fontSize: 13 }}>{item.label}</CoachText>
              {item.accuracy != null && <CoachText muted style={ds.caption}>{item.accuracy}%</CoachText>}
              {skill === item.id && <Ionicons name="checkmark-circle" color={colors.blue} size={19} />}
            </Pressable>)}
        </View>
        <CoachText style={ds.cardTitle}>3. How would you like to practise?</CoachText>
        {PRACTICE_MODES.map((item) => <Pressable key={item.id} onPress={() => setMode(item.id)} accessibilityRole="radio" accessibilityState={{ checked: mode === item.id }}
          style={[ds.option, { backgroundColor: mode === item.id ? colors.surfaceSoft : colors.surface, borderColor: mode === item.id ? colors.blue : colors.border }]}>
          <Ionicons name={item.icon} size={23} color={colors.blue} />
          <CoachText style={{ flex: 1, fontWeight: '700' }}>{item.title}</CoachText>
          <Ionicons name={mode === item.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={mode === item.id ? colors.blue : colors.textMuted} />
        </Pressable>)}
        {data?.active && <CoachText muted>Finish your current practice before switching focus. You can continue it below.</CoachText>}
        <Button title={data?.active ? 'Resume current practice' : locked ? 'Continue with Pro' : 'Start ' + sectionName(section) + ' practice'}
          disabled={busy} onPress={() => practise(mode, skill ? { skillId: skill } : { section })} />
      </>}
      {sheet === 'progress' && profile && <CoachProgressDetails data={data} story={story} tab={progressTab} onTabChange={setProgressTab}
        busy={busy} onSession={(id) => go('CoachSession', { id })} onLesson={lesson}
        onPractice={(item) => practise('practice', { skillId: item.skillId })} />}
    </CoachSheet>
  </SafeAreaView>;
}
