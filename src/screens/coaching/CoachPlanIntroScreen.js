import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { coachRequest } from '../../services/coachingService';
import { buildInitialPlan } from '../../lib/coaching/initialPlan';
import { Button, useCoachTheme } from '../../components/coaching/CoachUI';
import { CoachText, TextLink, ds } from '../../components/coaching/CoachDashboardUI';
import { CoachIntroHero } from '../../components/coaching/CoachWelcome';
import { Reveal } from '../../components/performance/PerformanceUI';
import { hexToRgba } from '../../theme/premiumTheme';

export default function CoachPlanIntroScreen({ route, navigation }) {
  const { user } = useAuth();
  const { colors, isDark } = useCoachTheme();
  const [data, setData] = useState(null), [error, setError] = useState(null), [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const openCoaching = useCallback(() => navigation.popTo('MainTabs', { screen: 'Coaching' }), [navigation]);
  useEffect(() => {
    let cancelled = false;
    setError(null);
    coachRequest(user.id, 'initial_plan', { id: route.params.id }).then((result) => {
      if (cancelled) return;
      if (result.seen) openCoaching();
      else setData(result);
    }).catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [user.id, route.params.id, attempt, openCoaching]);
  const plan = useMemo(() => buildInitialPlan(data?.profile, data?.report), [data]);

  async function continueToCoaching() {
    setBusy(true); setError(null);
    try {
      await coachRequest(user.id, 'acknowledge_plan', { id: route.params.id });
      openCoaching();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: colors.bgTop }}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to mini mock results" onPress={() => navigation.goBack()}
        style={[ds.iconButton, { backgroundColor: colors.surfaceSoft }]}>
        <Ionicons name="arrow-back" size={21} color={colors.text} />
      </Pressable>
      <CoachText style={ds.headerTitle}>Your first plan</CoachText>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {!data && !error && <ActivityIndicator accessibilityLabel="Preparing your first plan" color={colors.blue} size="large" style={{ marginTop: 60 }} />}
      {error && <View accessibilityRole="alert" style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 12 }]}>
        <CoachText>{error}</CoachText>
        {!data && <Button title="Try again" onPress={() => setAttempt((value) => value + 1)} />}
        <TextLink title="Open coaching" onPress={openCoaching} />
      </View>}
      {data && <>
        <Reveal><CoachIntroHero compact title="Your first plan is ready.">
          {plan.priorities.length ? "Your mini mock has shown us where to begin. Here's what we'll work on first." : "Your mini mock is saved. Let's build on it with your first practice sessions."}
        </CoachIntroHero></Reveal>
        {plan.strength && <Reveal delay={60} style={[ds.card, { backgroundColor: colors.surface, borderColor: hexToRgba(colors.teal, 0.3), gap: 12 }]}>
          <View style={styles.row}><Ionicons name="checkmark-circle" size={21} color={colors.teal} />
            <CoachText style={{ color: colors.teal, fontWeight: '700', fontSize: 13 }}>{plan.strength.heading}</CoachText></View>
          <View style={{ gap: 5 }}>
            <CoachText style={ds.cardTitle}>{plan.strength.title}</CoachText>
            {plan.strength.section && <CoachText muted style={ds.caption}>{plan.strength.section}</CoachText>}
          </View>
          <CoachText muted>{plan.strength.description}</CoachText>
        </Reveal>}
        {plan.priorities.length > 0 && <Reveal delay={120} style={{ gap: 13 }}>
          <CoachText accessibilityRole="header" style={ds.cardTitle}>Start here</CoachText>
          {plan.priorities.map((item, index) => <View key={item.id} style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 12 }]}>
            <View style={[styles.row, { alignItems: 'flex-start' }]}>
              <View style={[styles.number, { backgroundColor: hexToRgba(colors.purple, 0.12) }]}>
                <CoachText style={{ color: colors.purple, fontWeight: '800' }}>{index + 1}</CoachText>
              </View>
              <View style={{ flex: 1, gap: 4 }}><CoachText style={ds.cardTitle}>{item.title}</CoachText><CoachText muted style={ds.caption}>{item.section}</CoachText></View>
            </View>
            <CoachText muted>{item.reason}</CoachText>
          </View>)}
        </Reveal>}
        {plan.pace && <View style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, gap: 9 }]}>
          <View style={styles.row}><Ionicons name="time-outline" size={21} color={colors.blue} /><CoachText style={ds.cardTitle}>Build your pace</CoachText></View>
          <CoachText muted>{plan.pace.description}</CoachText>
        </View>}
        <View style={[styles.row, { alignItems: 'flex-start', padding: 4 }]}>
          <Ionicons name="refresh-outline" size={21} color={colors.purple} />
          <CoachText muted style={{ flex: 1 }}>This is your starting plan. As you improve, we'll adjust what you practise next. Your coach can explain a recommendation or help you decide where to focus.</CoachText>
        </View>
      </>}
    </ScrollView>
    {data && <View style={[styles.footer, { backgroundColor: colors.bgTop, borderTopColor: colors.border }]}>
      <View style={{ width: '100%', maxWidth: 800, alignSelf: 'center' }}><Button title={busy ? 'Opening coaching…' : 'Start my coaching'} disabled={busy} onPress={continueToCoaching} /></View>
    </View>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 20, paddingVertical: 12 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 28, gap: 19, width: '100%', maxWidth: 800, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  number: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
});
