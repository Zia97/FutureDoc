import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StatusBar, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { usePerformanceReport } from '../../hooks/usePerformanceReport';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  HistoryChart, PerformanceButton, PerformanceCard, ProLockCard, Reveal, Segments, SkillRow,
  StatRing, SECTION_COLOURS, SECTION_NAMES, performanceStyles as s, usePerformanceTheme,
} from '../../components/performance/PerformanceUI';

const MODES = [{ id: 'practice', label: 'Practice' }, { id: 'timed', label: 'Timed tests' }];
const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'skills', label: 'Skills' }, { id: 'history', label: 'Progress' }];
export const SECTION_TABS = Object.keys(SECTION_NAMES).map((id) => ({ id, label: id.toUpperCase() }));

export default function PerformanceAnalyticsScreen({ navigation }) {
  const { colors, isDark } = usePerformanceTheme();
  const [mode, setMode] = useState('practice');
  const [tab, setTab] = useState('overview');
  const [section, setSection] = useState('vr');
  const { report, loading, error, refresh, isPro, canAnalyse } = usePerformanceReport(mode);
  const { checkSubscription } = useSubscription();
  const openSkill = (id) => canAnalyse ? navigation.navigate('PerformanceSkill', { skillId: id, mode }) : navigation.navigate('Paywall');
  const unlock = async () => {
    if (isPro) { await checkSubscription(); refresh(); }
    else navigation.navigate('Paywall');
  };
  const skills = canAnalyse ? report.details.skills : [];
  const priorities = canAnalyse ? report.details.priorities.map((id) => skills.find((skill) => skill.id === id)).filter(Boolean) : [];
  return <PremiumScreen>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <AppHeader title="Performance" navigation={navigation} showBack={false} />
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!report} onRefresh={refresh} tintColor={colors.blue} />}>
      <View><Text style={[s.eyebrow, { color: colors.cyan }]}>YOUR PERSONAL STUDY PICTURE</Text>
        <Text style={[s.heading, { color: colors.text, marginTop: 9 }]}>Every question tells a story.</Text>
        <Text style={[s.body, { color: colors.textSecondary, marginTop: 7 }]}>See your progress. Find your focus.</Text></View>
      <Segments values={MODES} value={mode} onChange={setMode} />
      {loading && !report ? <PerformanceCard><View style={{ paddingVertical: 45, alignItems: 'center', gap: 15 }}>
        <ActivityIndicator color={colors.cyan} size="large" /><Text style={[s.body, { color: colors.textSecondary }]}>Bringing your progress together…</Text>
      </View></PerformanceCard> : error ? <PerformanceCard>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.amber} />
        <Text style={[s.title, { color: colors.text, marginTop: 10 }]}>Your stats will be back soon</Text>
        <Text style={[s.body, { color: colors.textSecondary, marginVertical: 12 }]}>{error}</Text>
        <PerformanceButton title="Try again" icon="refresh" onPress={refresh} />
      </PerformanceCard> : report ? <>
        <Segments values={TABS} value={tab} onChange={setTab} small />
        {tab === 'overview' && <>
          <Reveal><PerformanceCard>
            <View style={[s.row, { gap: 18, justifyContent: 'space-around', flexWrap: 'wrap' }]}>
              <StatRing value={report.overview.accuracy} color={colors.cyan} />
              <View style={{ flex: 1, minWidth: 120, gap: 7 }}>
                <Text style={[s.eyebrow, { color: colors.textMuted }]}>FIRST RESPONSES</Text>
                <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }}>{report.overview.questions.toLocaleString()}</Text>
                <Text style={[s.body, { color: colors.textSecondary }]}>questions explored</Text>
                <Text style={[s.caption, { color: colors.textMuted }]}>{mode === 'practice' ? 'Repeat answers stay separate.' : 'Based on your saved timed attempts.'}</Text>
              </View>
            </View>
            <Text style={[s.caption, { color: colors.textMuted, marginTop: 14 }]}>Marks earned includes partial credit. This is a practice measure, not a predicted UCAT score.</Text>
          </PerformanceCard></Reveal>
          {report.overview.questions === 0 && <PerformanceCard>
            <Text style={[s.title, { color: colors.text }]}>Your story starts with a few questions</Text>
            <Text style={[s.body, { color: colors.textSecondary, marginVertical: 10 }]}>Build a picture of your strengths by practising across the four sections.</Text>
            <PerformanceButton title={mode === 'practice' ? 'Start practising' : 'Explore timed tests'} onPress={() => navigation.navigate(mode === 'practice' ? 'PracticeSections' : 'TimedTestList')} />
          </PerformanceCard>}
          <View style={s.between}><Text style={[s.title, { color: colors.text }]}>Your four sections</Text><Text style={[s.caption, { color: colors.textMuted }]}>First-response marks</Text></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {report.overview.sections.map((item, index) => <Reveal key={`${mode}:${item.section}`} delay={index * 50} style={{ width: '48%', flexGrow: 1 }}>
              <Pressable onPress={() => { if (canAnalyse) { setSection(item.section); setTab('skills'); } else navigation.navigate('Paywall'); }}
                accessibilityRole="button" accessibilityLabel={`${SECTION_NAMES[item.section]}, ${item.accuracy ?? 'no data'} percent. ${canAnalyse ? 'Explore skills' : 'Unlock skill breakdown with Pro'}`}>
                <PerformanceCard style={{ alignItems: 'center', padding: 16, gap: 9 }}>
                  <View style={[s.between, { alignSelf: 'stretch' }]}><Text style={[s.eyebrow, { color: colors[SECTION_COLOURS[item.section]] }]}>{item.section.toUpperCase()}</Text><Ionicons name={canAnalyse ? 'arrow-forward' : 'lock-closed-outline'} size={14} color={colors.textMuted} /></View>
                  <StatRing value={item.accuracy} color={colors[SECTION_COLOURS[item.section]]} size={80} compact label={`${SECTION_NAMES[item.section]} marks earned`} />
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{SECTION_NAMES[item.section]}</Text>
                  <Text style={[s.caption, { color: colors.textMuted }]}>{item.questions} questions</Text>
                </PerformanceCard>
              </Pressable>
            </Reveal>)}
          </View>
          {canAnalyse ? <>
            <View style={s.between}><Text style={[s.title, { color: colors.text }]}>Your next moves</Text><Text style={[s.eyebrow, { color: colors.purple }]}>PRO</Text></View>
            {priorities.length ? priorities.map((skill, index) => <Reveal key={skill.id} delay={index * 60}>
              <PerformanceCard accent={colors[SECTION_COLOURS[skill.section]]}>
                <Text style={[s.eyebrow, { color: colors[SECTION_COLOURS[skill.section]] }]}>FOCUS {index + 1} · {skill.section.toUpperCase()}</Text>
                <Text style={[s.title, { color: colors.text, marginTop: 8 }]}>{skill.label}</Text>
                <Text style={[s.body, { color: colors.textSecondary, marginVertical: 10 }]}>{skill.accuracy}% of marks across {skill.questions} new questions. {skill.newQuestionIds.length ? 'Build this skill with a fresh set.' : 'Revisit your mistakes and the technique.'}</Text>
                <PerformanceButton title="Explore this skill" onPress={() => openSkill(skill.id)} secondary />
              </PerformanceCard>
            </Reveal>) : <PerformanceCard>
              <Text style={[s.title, { color: colors.text }]}>{skills.some((skill) => skill.supported) ? 'Keep building your range' : 'Let’s build your skill picture'}</Text>
              <Text style={[s.body, { color: colors.textSecondary, marginVertical: 10 }]}>A reliable priority needs at least 10 new questions across 3 different sets. Explore a skill to find fresh practice.</Text>
              <PerformanceButton title="Explore skills" secondary onPress={() => setTab('skills')} />
            </PerformanceCard>}
            {report.details.reviewCount > 0 && <Pressable accessibilityRole="button" onPress={() => setTab('skills')}>
              <PerformanceCard><View style={s.row}><Ionicons name="refresh-circle-outline" size={28} color={colors.mint} /><View style={{ flex: 1 }}>
                <Text style={[s.title, { color: colors.text }]}>{report.details.reviewCount} mistakes to revisit</Text><Text style={[s.caption, { color: colors.textSecondary }]}>Choose a skill to start a focused review.</Text>
              </View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></View></PerformanceCard>
            </Pressable>}
          </> : <ProLockCard onUnlock={unlock} pending={isPro} />}
        </>}
        {tab !== 'overview' && (!canAnalyse ? <ProLockCard onUnlock={unlock} pending={isPro} /> : <>
          <Segments values={SECTION_TABS} value={section} onChange={setSection} small />
          <View><Text style={[s.title, { color: colors.text }]}>{SECTION_NAMES[section]}</Text><Text style={[s.caption, { color: colors.textSecondary, marginTop: 5 }]}>{tab === 'skills' ? 'Tap a skill for evidence, technique and targeted practice.' : 'Your first responses over the last six weeks.'}</Text></View>
          {tab === 'skills' ? skills.filter((skill) => skill.section === section).sort((a, b) => b.priority - a.priority || b.questions - a.questions || a.label.localeCompare(b.label))
            .map((skill, index) => <SkillRow key={skill.id} skill={skill} onPress={() => openSkill(skill.id)} delay={index * 35} />)
            : <PerformanceCard><Text style={[s.eyebrow, { color: colors[SECTION_COLOURS[section]] }]}>WEEKLY MARKS EARNED</Text>
              <HistoryChart weeks={report.details.history.find((entry) => entry.section === section)?.weeks} color={colors[SECTION_COLOURS[section]]} />
              {mode === 'timed' && <View style={{ marginTop: 18 }}><PerformanceButton secondary title="View mock results" onPress={() => navigation.navigate(`${section.toUpperCase()}Analytics`)} /></View>}
            </PerformanceCard>}
          {report.details.excludedFromSkills > 0 && <Text style={[s.caption, { color: colors.textMuted }]}>{report.details.excludedFromSkills} question(s) are left out of skill analysis while their content or classification is reviewed.</Text>}
        </>)}
        <Methodology mode={mode} />
      </> : null}
    </ScrollView>
  </PremiumScreen>;
}

export function Methodology({ mode }) {
  const [open, setOpen] = useState(false);
  const { colors } = usePerformanceTheme();
  return <View style={{ gap: 9 }}><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={[s.row, { minHeight: 44 }]}>
    <Ionicons name="information-circle-outline" color={colors.textMuted} size={17} /><Text style={[s.caption, { color: colors.textSecondary }]}>How your analysis works</Text><Ionicons name={open ? 'chevron-up' : 'chevron-down'} color={colors.textMuted} size={14} />
  </Pressable>{open && <Text style={[s.caption, { color: colors.textMuted }]}>
    {mode === 'practice' ? 'We use your first recorded response to each question or DM statement. Repeat answers feed your review queue, not your first-response score. ' : 'We analyse the timed attempts saved to your account. If you reset and retake a test, the saved retake replaces that test’s earlier result. '}
    SJ includes half marks for adjacent ratings. Complete five-statement DM questions earn two marks for all correct and one for four correct. Skill priorities need 10 questions across 3 sets; older evidence is labelled for a recheck. Weekly bars can contain different difficulty mixes. Improvement indicators compare matching difficulty levels only. Time includes reading shared passages and diagrams. Missing timings are left out. Only synced answers are included.
  </Text>}</View>;
}
