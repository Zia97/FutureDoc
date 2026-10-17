import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Segments } from '../performance/PerformanceUI';
import { PremiumIcon } from '../premium/PremiumPracticeUI';
import { hexToRgba } from '../../theme/premiumTheme';
import { sectionName, sectionSnapshot } from '../../lib/coaching/dashboard';
import { Button, useCoachTheme } from './CoachUI';
import { CoachText, SkillEvidence, TextLink, ds } from './CoachDashboardUI';

export default function CoachProgressDetails({ data, story, tab, onTabChange, onSession, onLesson, onPractice, busy }) {
  const { colors } = useCoachTheme();
  const profile = data.profile;
  return <>
    <Segments values={[{ id: 'overview', label: 'Progress' }, { id: 'plan', label: 'Your plan' }, { id: 'history', label: 'History' }]} value={tab} onChange={onTabChange} />
    {tab === 'overview' && <>
      <View style={{ gap: 12 }}>
        <CoachText style={ds.cardTitle}>Your section performance</CoachText>
        {sectionSnapshot(profile, data.baseline).map((section) => <View key={section.id} style={[ds.evidenceRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={ds.row}>
            <PremiumIcon name={section.icon} color={colors[section.color]} size={22} />
            <CoachText style={{ flex: 1, fontWeight: '700' }}>{section.title}</CoachText>
            <CoachText style={{ color: colors[section.color], fontWeight: '800', fontSize: 23 }}>{section.accuracy == null ? '—' : `${section.accuracy}%`}</CoachText>
          </View>
          <View style={[ds.barTrack, { marginTop: 13, backgroundColor: hexToRgba(colors[section.color], 0.12) }]}>
            <View style={[ds.barFill, { width: `${section.accuracy ?? 0}%`, backgroundColor: colors[section.color] }]} />
          </View>
          <CoachText muted style={[ds.caption, { marginTop: 8 }]}>{section.questions ? `${section.questions} of 20 questions` : 'No results yet'}</CoachText>
        </View>)}
      </View>
      <View style={{ gap: 12 }}>
        <CoachText style={ds.cardTitle}>Where you’re improving</CoachText>
        {story.improvements.length ? story.improvements.slice(0, 6).map((item) => <View key={`${item.skill.id}:${item.mode}`} style={[ds.evidenceRow, { borderColor: hexToRgba(colors.mint, 0.3), backgroundColor: hexToRgba(colors.mint, 0.05) }]}>
          <View style={ds.row}><Ionicons name="trending-up" size={21} color={colors.mint} />
            <CoachText style={{ flex: 1, fontWeight: '700' }}>{item.skill.label}</CoachText>
            <CoachText style={{ color: colors.mint, fontWeight: '800' }}>+{item.delta} pts</CoachText></View>
          <CoachText muted style={[ds.caption, { marginTop: 6 }]}>{sectionName(item.skill.section)} · {item.mode === 'timed' ? 'Timed' : 'Practice'} marks</CoachText>
          <CoachText muted style={[ds.caption, { marginTop: 8 }]}>{item.delta} percentage-point increase. {item.recentCount} questions from the last two weeks compared with {item.priorCount} in the previous two weeks, matched by difficulty.</CoachText>
        </View>) : <View style={[ds.evidenceRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <CoachText style={{ fontWeight: '700' }}>Building your progress picture</CoachText>
          <CoachText muted style={{ marginTop: 6 }}>Keep practising your recommended skills. We’ll show improvements here once we have enough comparable questions over time.</CoachText>
        </View>}
      </View>
      {[{ title: 'Your strengths', items: profile.strengths, color: colors.mint }, { title: 'Areas to improve', items: profile.weaknesses, color: colors.red }].map((group) => <View key={group.title} style={{ gap: 10 }}>
        <CoachText style={[ds.cardTitle, { color: group.color }]}>{group.title}</CoachText>
        {(group.items ?? []).slice(0, 6).map((skill) => <SkillEvidence key={skill.id} skill={skill} color={group.color} onLesson={skill.lessonRoute ? () => onLesson(skill) : null} />)}
        {!group.items?.length && <CoachText muted>We’ll keep learning about you as you answer more questions.</CoachText>}
      </View>)}
      <View style={[ds.card, { borderColor: colors.border, backgroundColor: colors.surface, gap: 12 }]}>
        <CoachText style={ds.cardTitle}>Along the way</CoachText>
        <CoachText muted>{profile.freshQuestions ?? 0} different questions explored across the app.</CoachText>
        {(profile.milestones ?? []).map((milestone) => <View style={ds.row} key={milestone}>
          <Ionicons name="checkmark-circle" size={19} color={colors.mint} /><CoachText style={{ flex: 1, fontSize: 13 }}>{milestone}</CoachText>
        </View>)}
      </View>
    </>}
    {tab === 'plan' && <>
      {story.plan.map((item, index) => <View key={item.skillId} style={[ds.card, { borderColor: index === 0 ? hexToRgba(colors.purple, 0.4) : colors.border, backgroundColor: colors.surface, gap: 12 }]}>
        <View style={ds.row}><View style={[ds.coachAvatar, { backgroundColor: colors.surfaceSoft }]}><CoachText style={{ fontWeight: '800', color: colors.purple }}>{index + 1}</CoachText></View>
          <View style={{ flex: 1, gap: 3 }}><CoachText muted style={ds.caption}>{item.sectionTitle}</CoachText><CoachText style={ds.cardTitle}>{item.title}</CoachText></View></View>
        <CoachText muted>{item.reason}</CoachText>
        {!!item.tip && <CoachText style={{ fontSize: 13 }}>{item.tip}</CoachText>}
        <Button title={data.active ? 'Resume current practice' : data.pro === false && !data.previewAvailable ? 'Practise with Pro' : 'Practise this skill'} disabled={busy} onPress={() => onPractice(item)} />
        {item.lessonRoute && <TextLink title="Review the technique" icon="book-outline" onPress={() => onLesson(item)} />}
      </View>)}
      {profile.daysToExam != null && profile.daysToExam <= 2 && profile.daysToExam >= 0 && <CoachText muted>With your exam close, keep practice light and leave time to rest.</CoachText>}
    </>}
    {tab === 'history' && <>
      {data.baseline && <View style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 10 }]}>
        <CoachText style={ds.cardTitle}>Mini mock</CoachText>
        <Button title="View mini mock result" onPress={() => onSession(data.baseline.id)} secondary />
      </View>}
      <CoachText style={ds.cardTitle}>Recent practice</CoachText>
      {story.recentSessions.map((session) => <Pressable key={session.id} onPress={() => onSession(session.id)} accessibilityRole="button"
        style={[ds.option, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name={session.kind === 'timed_check' ? 'timer-outline' : session.kind === 'review' ? 'refresh-outline' : 'checkmark-circle-outline'} size={23} color={colors.purple} />
        <View style={{ flex: 1, gap: 5 }}><CoachText style={{ fontSize: 13, fontWeight: '700' }}>{session.title}</CoachText>
          <CoachText muted style={ds.caption}>{new Date(session.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {session.kind === 'timed_check' ? 'Timed check' : session.kind === 'review' ? 'Mistake review' : 'Coached practice'}</CoachText></View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>)}
      {!story.recentSessions.length && <CoachText muted>No completed practice yet.</CoachText>}
    </>}
  </>;
}
