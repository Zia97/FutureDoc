import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePerformanceReport } from '../../hooks/usePerformanceReport';
import PerformanceLoading from '../performance/PerformanceLoading';
import { CohortComparison, PerformanceButton, PerformanceCard, Reveal, Segments, StatRing,
  SECTION_COLOURS, SECTION_NAMES, performanceStyles as s, usePerformanceTheme } from '../performance/PerformanceUI';

export const PROGRESS_MODES = [{ id: 'combined', label: 'All' }, { id: 'practice', label: 'Practice' }, { id: 'timed', label: 'Timed' }, { id: 'coaching', label: 'Coaching' }];
export const progressMode = (value) => PROGRESS_MODES.some((mode) => mode.id === value) ? value : 'combined';

export default function CoachProgressOverview({ navigation, initialMode = 'combined', onHistory }) {
  const { colors } = usePerformanceTheme();
  const [mode, setMode] = useState(progressMode(initialMode));
  const { report, loading, error, refreshing, refresh, canAnalyse } = usePerformanceReport(mode);
  const skills = report?.details?.skills ?? [];
  const priorities = (report?.details?.priorities ?? []).map((id) => skills.find((skill) => skill.id === id)).filter(Boolean);
  return <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.blue} />}>
    <Segments values={PROGRESS_MODES} value={mode} onChange={setMode} small />
    {loading && !report ? <PerformanceLoading overview /> : error && !report ? <PerformanceCard>
      <Text style={[s.body, { color: colors.textSecondary }]}>{error}</Text><PerformanceButton title="Try again" onPress={refresh} />
    </PerformanceCard> : report ? <>
      <Reveal><PerformanceCard><View style={[s.row, { gap: 18, justifyContent: 'space-around', flexWrap: 'wrap' }]}>
        <StatRing value={report.overview.accuracy} color={colors.cyan} />
        <View style={{ flex: 1, minWidth: 120, gap: 7 }}>
          <Text style={{ fontSize: 36, fontWeight: '800', color: colors.text }}>{report.overview.answered.toLocaleString()}</Text>
          <Text style={[s.body, { color: colors.textSecondary }]}>Questions answered</Text>
        </View>
      </View></PerformanceCard></Reveal>
      <Text style={[s.title, { color: colors.text }]}>Your sections</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {report.overview.sections.map((item) => <Pressable key={item.section} accessibilityRole="button"
          accessibilityLabel={`${SECTION_NAMES[item.section]}, ${item.accuracy == null ? 'no results' : item.accuracy + ' percent accuracy'}. View section and skills.`}
          onPress={() => navigation.navigate('CoachSectionProgress', { section: item.section, mode })} style={{ width: '47%', flexGrow: 1 }}>
          <PerformanceCard style={{ alignItems: 'center', padding: 16, gap: 9 }}>
            <View style={[s.between, { alignSelf: 'stretch' }]}><Text style={[s.eyebrow, { color: colors[SECTION_COLOURS[item.section]] }]}>{item.section.toUpperCase()}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} /></View>
            <StatRing value={item.accuracy} color={colors[SECTION_COLOURS[item.section]]} size={80} compact />
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>{SECTION_NAMES[item.section]}</Text>
          </PerformanceCard>
        </Pressable>)}
      </View>
      {mode !== 'coaching' && <CohortComparison sections={report.overview.sections} onRetry={refresh} />}
      {!report.overview.questions && <PerformanceCard>
        <Text style={[s.title, { color: colors.text }]}>No results yet</Text>
        <PerformanceButton title={mode === 'coaching' ? 'Open your coach' : mode === 'timed' ? 'Explore timed tests' : 'Start practising'}
          onPress={() => navigation.navigate('MainTabs', { screen: mode === 'coaching' ? 'Coaching' : mode === 'timed' ? 'TimedTestList' : 'PracticeSections', params: mode === 'coaching' ? { area: 'coach' } : undefined })} />
      </PerformanceCard>}
      {canAnalyse && priorities.length > 0 && <>
        <Text style={[s.title, { color: colors.text }]}>Recommended practice</Text>
        {priorities.map((skill) => <PerformanceCard key={skill.id} accent={colors[SECTION_COLOURS[skill.section]]}>
          <Text style={[s.title, { color: colors.text }]}>{skill.label}</Text>
          <Text style={[s.caption, { color: colors.textSecondary, marginBottom: 10 }]}>{SECTION_NAMES[skill.section]}</Text>
          <PerformanceButton title="Explore this skill" secondary onPress={() => navigation.navigate('PerformanceSkill', { skillId: skill.id, mode })} />
        </PerformanceCard>)}
      </>}
      {canAnalyse && report.details.reviewCount > 0 && <PerformanceCard>
        <Text style={[s.title, { color: colors.text }]}>{report.details.reviewCount} mistakes to revisit</Text>
        <PerformanceButton title="Choose a skill to review" secondary onPress={() => navigation.navigate('CoachSectionProgress', { section: priorities[0]?.section ?? 'vr', mode })} />
      </PerformanceCard>}
      {!canAnalyse && <PerformanceCard accent={colors.purple}>
        <Text style={[s.title, { color: colors.text }]}>Choose where to improve</Text>
        <Text style={[s.body, { color: colors.textSecondary, marginVertical: 10 }]}>Pro adds skill analysis, progress charts and targeted practice to your section results.</Text>
        <PerformanceButton title="Explore coaching with Pro" onPress={() => navigation.navigate('Paywall')} />
      </PerformanceCard>}
    </> : null}
    {onHistory && <PerformanceButton title="Coaching sessions and milestones" secondary onPress={onHistory} />}
  </ScrollView>;
}
