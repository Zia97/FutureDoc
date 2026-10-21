import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { usePerformanceReport } from '../../hooks/usePerformanceReport';
import PerformanceLoading from '../../components/performance/PerformanceLoading';
import { CohortComparison, HistoryChart, PerformanceButton, PerformanceCard, Segments, SkillRow, StatRing,
  SECTION_COLOURS, SECTION_NAMES, performanceStyles as s, usePerformanceTheme } from '../../components/performance/PerformanceUI';
import { PROGRESS_MODES, progressMode } from '../../components/coaching/CoachProgressOverview';

const CONDITIONS = { assessment: 'Mini mock', practice: 'Untimed coaching', timed_check: 'Timed coaching', review: 'Mistake review' };
export default function CoachSectionProgressScreen({ navigation, route }) {
  const { colors } = usePerformanceTheme();
  const section = SECTION_NAMES[route.params?.section] ? route.params.section : 'vr';
  const [mode, setMode] = useState(progressMode(route.params?.mode));
  const { report, loading, error, refreshing, refresh, canAnalyse } = usePerformanceReport(mode);
  const stats = report?.overview.sections.find((item) => item.section === section);
  const color = colors[SECTION_COLOURS[section]];
  const skills = canAnalyse ? report.details.skills.filter((skill) => skill.section === section)
    .sort((a, b) => b.priority - a.priority || b.questions - a.questions || a.label.localeCompare(b.label)) : [];
  return <PremiumScreen><AppHeader navigation={navigation} title={SECTION_NAMES[section]} />
    <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={color} />}>
      <Segments values={PROGRESS_MODES} value={mode} onChange={setMode} small />
      {loading && !report ? <PerformanceLoading /> : error && !report ? <PerformanceCard>
        <Text style={[s.body, { color: colors.textSecondary }]}>{error}</Text><PerformanceButton title="Try again" onPress={refresh} />
      </PerformanceCard> : stats ? <>
        <PerformanceCard accent={color}><View style={[s.row, { justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }]}>
          <StatRing value={stats.accuracy} color={color} />
          <View style={{ gap: 8 }}><Text style={[s.title, { color: colors.text }]}>{stats.answered} answered</Text>
            <Text style={[s.body, { color: colors.textSecondary }]}>{stats.medianSeconds == null ? 'No timing results yet' : `${stats.medianSeconds}s typical time per question`}</Text></View>
        </View></PerformanceCard>
        {mode !== 'coaching' && <CohortComparison sections={[stats]} onRetry={refresh} />}
        {mode === 'coaching' && stats.conditions?.some((item) => item.questions > 0) && <PerformanceCard>
          <Text style={[s.title, { color: colors.text }]}>Session types</Text>
          {stats.conditions.filter((item) => item.questions > 0).map((item) => <View key={item.kind} style={[s.between, { paddingVertical: 9 }]}>
            <Text style={[s.body, { color: colors.textSecondary }]}>{CONDITIONS[item.kind]}</Text><Text style={[s.title, { color }]}>{item.accuracy}%</Text>
          </View>)}
        </PerformanceCard>}
        <Text style={[s.title, { color: colors.text }]}>Skills</Text>
        {canAnalyse ? <>
          {skills.map((skill) => <SkillRow key={skill.id} skill={skill} onPress={() => navigation.navigate('PerformanceSkill', { skillId: skill.id, mode })} />)}
          <PerformanceCard><Text style={[s.title, { color: colors.text }]}>Accuracy over time</Text>
            <HistoryChart weeks={report.details.history.find((item) => item.section === section)?.weeks} color={color} />
            {mode === 'timed' && <PerformanceButton title="View mock results" secondary onPress={() => navigation.navigate(`${section.toUpperCase()}Analytics`)} />}
          </PerformanceCard>
        </> : <>
          {(report.skillCatalogue ?? []).filter((skill) => skill.section === section).map((skill) => <Pressable key={skill.id} accessibilityRole="button"
            accessibilityLabel={`${skill.label}, skill analysis with Pro`} onPress={() => navigation.navigate('PerformanceSkill', { skillId: skill.id, mode })}>
            <PerformanceCard><View style={s.row}><Text style={[s.body, { flex: 1, color: colors.text }]}>{skill.label}</Text><Ionicons name="lock-closed-outline" size={17} color={colors.textMuted} /></View></PerformanceCard>
          </Pressable>)}
          <PerformanceButton title={`Build a plan to improve your ${section.toUpperCase()}`} onPress={() => navigation.navigate('Paywall')} />
        </>}
      </> : null}
    </ScrollView>
  </PremiumScreen>;
}
