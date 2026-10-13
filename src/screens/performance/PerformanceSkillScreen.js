import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader, PremiumScreen } from '../../components/premium/PremiumPracticeUI';
import { usePerformanceReport } from '../../hooks/usePerformanceReport';
import { HistoryChart, PerformanceButton, PerformanceCard, ProLockCard, Reveal, StatRing, SECTION_COLOURS, SECTION_NAMES, performanceStyles as s, usePerformanceTheme } from '../../components/performance/PerformanceUI';
import { Methodology } from '../timed/PerformanceAnalyticsScreen';

export default function PerformanceSkillScreen({ route, navigation }) {
  const mode = route.params?.mode === 'timed' ? 'timed' : 'practice';
  const { report, loading, error, refresh, isPro, canAnalyse } = usePerformanceReport(mode);
  const { colors } = usePerformanceTheme();
  const skill = canAnalyse ? report.details.skills.find((item) => item.id === route.params?.skillId) : null;
  const color = colors[SECTION_COLOURS[skill?.section] ?? 'blue'];
  const practice = (kind) => {
    if (!canAnalyse || !skill) { navigation.navigate('Paywall'); return; }
    navigation.navigate('PerformancePractice', { skillId: skill.id, kind });
  };
  return <PremiumScreen><AppHeader title="Skill analysis" navigation={navigation} />
    <ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading && !!report} onRefresh={refresh} tintColor={color} />}>
      {loading ? <ActivityIndicator color={color} size="large" style={{ marginTop: 70 }} /> : error ? <PerformanceCard>
        <Text style={[s.body, { color: colors.textSecondary, marginBottom: 14 }]}>{error}</Text><PerformanceButton title="Try again" onPress={refresh} />
      </PerformanceCard> : !canAnalyse ? <ProLockCard pending={isPro} onUnlock={isPro ? refresh : () => navigation.navigate('Paywall')} /> : !skill ? <PerformanceCard>
        <Text style={[s.title, { color: colors.text }]}>This skill is not available yet</Text><Text style={[s.body, { color: colors.textSecondary }]}>Return to Performance to explore your current skills.</Text>
      </PerformanceCard> : <>
        <View><Text style={[s.eyebrow, { color }]}>{SECTION_NAMES[skill.section].toUpperCase()} · {mode === 'timed' ? 'TIMED' : 'PRACTICE'}</Text>
          <Text style={[s.heading, { color: colors.text, marginTop: 10 }]}>{skill.label}</Text><Text style={[s.body, { color: colors.textSecondary, marginTop: 9 }]}>{skill.description}</Text></View>
        <Reveal><PerformanceCard accent={color}>
          <View style={[s.row, { justifyContent: 'space-around', flexWrap: 'wrap' }]}><StatRing value={skill.accuracy} color={color} />
            <View style={{ gap: 9, flex: 1, minWidth: 130 }}><Text style={[s.title, { color: colors.text }]}>{skill.status}</Text><Text style={[s.body, { color: colors.textSecondary }]}>{skill.questions} new questions{'\n'}{skill.sets} different sets</Text>
              {skill.trend && <Text style={[s.caption, { color: skill.trend.delta >= 0 ? colors.mint : colors.amber }]}>{skill.trend.delta > 0 ? '+' : ''}{skill.trend.delta} percentage points{'\n'}on comparable difficulty</Text>}
            </View>
          </View>
          <Text style={[s.caption, { color: colors.textMuted, marginTop: 12 }]}>{!skill.supported ? 'An early picture. We need 10 new questions across 3 sets before making a confident recommendation.' : skill.stale ? 'Your evidence is over four weeks old. Try fresh questions to check this skill again.' : 'Based on first responses. Repeating a familiar answer does not increase this score.'}</Text>
        </PerformanceCard></Reveal>
        <Reveal delay={60}><PerformanceCard>
          <View style={s.row}><Ionicons name="bulb-outline" size={22} color={colors.amber} /><Text style={[s.title, { color: colors.text }]}>A technique to try</Text></View>
          <Text style={[s.body, { color: colors.textSecondary, marginVertical: 12 }]}>{skill.tip}</Text>
          {skill.lessonId && <PerformanceButton secondary title="Open the technique lesson" icon="book-outline" onPress={() => navigation.navigate(skill.lessonRoute, { lessonId: skill.lessonId })} />}
        </PerformanceCard></Reveal>
        <Reveal delay={100}><PerformanceCard accent={color}>
          <Text style={[s.title, { color: colors.text }]}>Put it into practice</Text><Text style={[s.body, { color: colors.textSecondary, marginVertical: 10 }]}>A focused set of up to eight questions from your practice bank.</Text>
          <PerformanceButton title={skill.newQuestionIds.length ? `Start fresh practice · ${Math.min(8, skill.newQuestionIds.length)} questions` : 'No new questions in this skill yet'} disabled={!skill.newQuestionIds.length} onPress={() => practice('fresh')} />
          <View style={{ height: 8 }} /><PerformanceButton secondary icon="refresh" title={skill.reviewQuestionIds.length ? `Review mistakes · ${Math.min(8, skill.reviewQuestionIds.length)} questions` : 'No mistakes waiting for review'} disabled={!skill.reviewQuestionIds.length} onPress={() => practice('review')} />
        </PerformanceCard></Reveal>
        <PerformanceCard><Text style={[s.title, { color: colors.text }]}>Practice and timed performance</Text>
          <View style={[s.row, { marginTop: 16, gap: 12 }]}>{[{ label: 'Practice', value: skill.practice }, { label: 'Timed tests', value: skill.timed }].map(({ label, value }) => <View key={label} style={{ flex: 1, gap: 5 }}>
            <Text style={[s.caption, { color: colors.textMuted }]}>{label}</Text><Text style={{ fontSize: 26, fontWeight: '800', color: colors.text }}>{value.accuracy == null ? '—' : `${value.accuracy}%`}</Text><Text style={[s.caption, { color: colors.textSecondary }]}>{value.questions} questions</Text>
          </View>)}</View>
          <Text style={[s.caption, { color: colors.textMuted, marginTop: 15 }]}>Different questions and conditions. A gap suggests something to explore; it does not establish the cause.</Text>
        </PerformanceCard>
        <PerformanceCard><View style={s.between}><Text style={[s.title, { color: colors.text }]}>Your pace</Text><Ionicons name="timer-outline" size={23} color={color} /></View>
          <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text, marginVertical: 10 }}>{skill.medianSeconds == null ? '—' : `${skill.medianSeconds}s`}</Text><Text style={[s.caption, { color: colors.textSecondary }]}>Median active time across {skill.timedQuestions} answered questions with timing data. Reading shared passages or diagrams is included.</Text>
        </PerformanceCard>
        <PerformanceCard><Text style={[s.title, { color: colors.text }]}>This skill over time</Text><HistoryChart weeks={skill.history} color={color} /></PerformanceCard><Methodology mode={mode} />
      </>}
    </ScrollView>
  </PremiumScreen>;
}
