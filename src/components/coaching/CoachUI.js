import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PerformanceCard, PerformanceButton, StatRing, useReducedMotion, usePerformanceTheme, performanceStyles, SECTION_NAMES, SECTION_COLOURS } from '../performance/PerformanceUI';

export { PerformanceCard as Card, PerformanceButton as Button, usePerformanceTheme as useCoachTheme };
export const cs = StyleSheet.create({ ...performanceStyles,
  input: { minHeight: 48, borderWidth: 1, borderRadius: 13, padding: 12, fontSize: 16 },
  chip: { padding: 11, borderWidth: 1, borderRadius: 13, minHeight: 44, justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
export function CoachPage({ children, scrollRef }) {
  const { colors } = usePerformanceTheme();
  return <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.bgTop }}>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 18, width: '100%', maxWidth: 800, alignSelf: 'center', paddingBottom: 40 }}>{children}</ScrollView>
  </SafeAreaView>;
}
export function Copy({ children, title = false, muted = false, style }) {
  const { colors } = usePerformanceTheme();
  return <Text style={[title ? cs.title : cs.body, { color: muted ? colors.textSecondary : colors.text }, style]}>{children}</Text>;
}
export function CoachHero({ title, children }) {
  const { colors } = usePerformanceTheme();
  return <LinearGradient colors={[colors.purple, colors.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 24, borderRadius: 26, gap: 13 }}>
    <Ionicons name="sparkles" size={30} color="#FFFFFF" />
    <Text style={[cs.heading, { color: '#FFFFFF' }]}>{title}</Text>
    <Text style={[cs.body, { color: '#F1F3FF' }]}>{children}</Text>
  </LinearGradient>;
}
export function SessionReport({ report }) {
  const { colors } = usePerformanceTheme();
  if (!report) return null;
  if (report.estimate) return <AssessmentReport report={report} />;
  return <>
    <PerformanceCard accent={colors.purple}>
      <Copy title>Set complete</Copy>
      <Copy muted>{report.summary}</Copy>
      {report.previouslySeen > 0 && <Copy muted>{report.previouslySeen} questions had been seen before. Familiarity can affect this estimate.</Copy>}
      {report.timeMultiplier > 1 && <Copy muted>Completed with {Math.round((report.timeMultiplier - 1) * 100)}% extra working time.</Copy>}
    </PerformanceCard>
    {report.sections.map((s) => <PerformanceCard key={s.section}>
      <View style={cs.between}><Copy title>{SECTION_NAMES[s.section]}</Copy><Copy title>{s.accuracy}%</Copy></View>
      <Copy muted>{s.earned}/{s.possible} marks · {s.answered}/{s.questions} answered</Copy>
      <Copy muted>{Math.floor(s.seconds / 60)}m {s.seconds % 60}s active time{s.budgetSeconds ? ` / ${Math.floor(s.budgetSeconds / 60)}m ${s.budgetSeconds % 60}s allowed` : ''}</Copy>
      {report.estimate?.sections[s.section] && <Copy>{report.estimate.sections[s.section].value} practice estimate · {report.estimate.sections[s.section].low}–{report.estimate.sections[s.section].high}</Copy>}
      {s.section === 'sj' && <Copy muted>SJ is reported as marks. This short sample does not support a reliable band estimate.</Copy>}
    </PerformanceCard>)}
  </>;
}

// https://www.ucat.ac.uk/results/test-statistics/ — 2026 UCAT deciles:
// 40th = 1850, 70th = 2050. These colours are
// directional only; a short practice assessment cannot assign a percentile.
function estimateColor(value, colors) {
  if (value < 1850) return colors.red;
  if (value < 2050) return colors.amber;
  return colors.teal;
}

function scoreBand(value) {
  if (value < 1850) return 'Below 2026 UCAT 40th-percentile score';
  if (value < 2050) return '2026 UCAT 40th–70th score band';
  return 'At or above 2026 UCAT 70th-percentile score';
}

function AssessmentReport({ report }) {
  const { colors } = usePerformanceTheme();
  const reducedMotion = useReducedMotion();
  const target = report.estimate.value;
  const progress = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(reducedMotion ? target : 0);
  const accent = estimateColor(target, colors);

  useEffect(() => {
    progress.stopAnimation();
    if (reducedMotion) { progress.setValue(target); setDisplayScore(target); return; }
    progress.setValue(0);
    const listener = progress.addListener(({ value }) => setDisplayScore(Math.round(value / 10) * 10));
    const animation = Animated.timing(progress, { toValue: target, duration: 1500,
      easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start(({ finished }) => { if (finished) setDisplayScore(target); });
    return () => { animation.stop(); progress.removeListener(listener); };
  }, [progress, reducedMotion, target]);

  return <>
    <PerformanceCard accent={accent} style={{ alignItems: 'center', gap: 7, paddingVertical: 22 }}>
      <Text style={{ color: colors.text, fontSize: 23, fontWeight: '800' }}>Mini Mock result</Text>
      <Text accessibilityLabel={`Practice estimate ${target} out of 2700`}
        style={{ color: accent, fontSize: 54, fontWeight: '900', fontVariant: ['tabular-nums'] }}>
        {displayScore}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '700' }}>Practice estimate · UCAT scale 900–2700</Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>Estimated range {report.estimate.low}–{report.estimate.high}</Text>
      <Text style={{ color: accent, fontSize: 11, fontWeight: '700', textAlign: 'center' }}>{scoreBand(target)}</Text>
      {report.sample && <Text style={{ color: colors.textMuted, fontSize: 12 }}>Developer sample · not your result</Text>}
    </PerformanceCard>
    <Text style={[cs.title, { color: colors.text }]}>Section scores</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {report.sections.map((section) => {
        const estimate = report.estimate.sections?.[section.section];
        const color = colors[SECTION_COLOURS[section.section]];
        return <PerformanceCard key={section.section} accent={color}
          style={{ width: '47%', flexGrow: 1, alignItems: 'center', padding: 12, gap: 7 }}>
          <Text style={[cs.eyebrow, { color, alignSelf: 'flex-start' }]}>{section.section.toUpperCase()}</Text>
          <StatRing value={section.accuracy} color={color} size={76} compact label={`${SECTION_NAMES[section.section]} accuracy`} />
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>{SECTION_NAMES[section.section]}</Text>
          {estimate ? <>
            <Text style={{ color, fontSize: 23, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{estimate.value}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>UCAT 300–900 · estimate {estimate.low}–{estimate.high}</Text>
          </> : <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>Band 1–4 · not estimated</Text>}
        </PerformanceCard>;
      })}
    </View>
  </>;
}
