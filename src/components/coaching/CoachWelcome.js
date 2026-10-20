import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PremiumIcon } from '../premium/PremiumPracticeUI';
import { Reveal } from '../performance/PerformanceUI';
import { useCoachTheme } from './CoachUI';
import { useReducedMotion } from '../performance/PerformanceUI';
import { CoachText, ds } from './CoachDashboardUI';
import { hexToRgba } from '../../theme/premiumTheme';

export function CoachIntroHero({ title, children, compact = false }) {
  const reducedMotion = useReducedMotion();
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    drift.stopAnimation();
    drift.setValue(0);
    if (compact || reducedMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [compact, drift, reducedMotion]);
  return <LinearGradient colors={['#163C75', '#303E91', '#50308C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
    <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={styles.motionLayer}>
      <Animated.View style={[styles.glow, styles.glowOne, { opacity: reducedMotion ? 0.13 : 0.11, transform: [
        { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-16, 28] }) },
        { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [13, -17] }) },
        { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.1] }) },
      ] }]} />
      <Animated.View style={[styles.glow, styles.glowTwo, { opacity: reducedMotion ? 0.09 : 0.08, transform: [
        { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [22, -24] }) },
        { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [-13, 19] }) },
      ] }]} />
    </View>
    {compact && <View style={styles.heroTop}>
      <View style={[styles.emblem, compact && { width: 56, height: 56, borderRadius: 19 }]}>
        <PremiumIcon name="coach" size={compact ? 33 : 42} color="#FFFFFF" />
      </View>
    </View>}
    <Text accessibilityRole="header" style={[styles.heroTitle, compact && { fontSize: 29, lineHeight: 36 }]}>{title}</Text>
    <Text style={styles.heroCopy}>{children}</Text>
  </LinearGradient>;
}

const benefits = [
  { icon: 'scan-outline', color: 'blue', title: 'Know where to focus',
    copy: "Find the question types that slow you down or cost you marks across all four subtests." },
  { icon: 'compass-outline', color: 'purple', title: 'Know what to practise next',
    copy: "Get questions and lessons for the areas you need to improve, so you spend less time revising what you already do well." },
  { icon: 'trending-up-outline', color: 'teal', title: 'Your plan updates as you improve',
    copy: "As you improve, your practice priorities change. Keep track of your results and ask your coach for advice along the way." },
];

export default function CoachWelcome({ children }) {
  const { colors } = useCoachTheme();
  return <>
    <Reveal><CoachIntroHero title={'Welcome to your\npersonal UCAT coach.'}>
      Let's work out where you can gain marks, then take it one practice session at a time.
    </CoachIntroHero></Reveal>
    <Reveal delay={80} style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 21, gap: 23 }]}>
      {benefits.map((item) => <View key={item.title} style={styles.benefit}>
        <View style={[styles.benefitIcon, { backgroundColor: hexToRgba(colors[item.color], 0.1) }]}>
          <Ionicons name={item.icon} size={23} color={colors[item.color]} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <CoachText style={styles.benefitTitle}>{item.title}</CoachText>
          <CoachText muted style={styles.benefitCopy}>{item.copy}</CoachText>
        </View>
      </View>)}
    </Reveal>
    <Reveal delay={160} style={{ gap: 13 }}>
      {children || <>
        <View style={{ gap: 7 }}>
          <CoachText style={ds.cardTitle}>First, let's try a mini mock</CoachText>
          <CoachText muted>Your results will shape your first plan.</CoachText>
          <View style={[ds.row, { flexWrap: 'wrap', gap: 14, marginTop: 3 }]}>
            <View style={styles.detail}><Ionicons name="time-outline" size={16} color={colors.textSecondary} /><CoachText muted style={ds.caption}>Around 35 minutes</CoachText></View>
            <View style={styles.detail}><Ionicons name="pause-circle-outline" size={16} color={colors.textSecondary} /><CoachText muted style={ds.caption}>Pause and finish later</CoachText></View>
          </View>
        </View>
      </>}
    </Reveal>
  </>;
}

const styles = StyleSheet.create({
  hero: { padding: 25, borderRadius: 27, gap: 19, overflow: 'hidden' },
  motionLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glow: { position: 'absolute', borderRadius: 999 },
  glowOne: { width: 300, height: 300, right: -78, top: -122, backgroundColor: '#8D9DFF' },
  glowTwo: { width: 220, height: 220, left: '24%', bottom: -170, backgroundColor: '#4DE1D2' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  emblem: { width: 76, height: 76, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: '#FFFFFF', fontSize: 31, lineHeight: 39, fontWeight: '800', letterSpacing: -0.7 },
  heroCopy: { color: '#DCE8FF', fontSize: 15, lineHeight: 23 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 13 },
  benefitIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  benefitCopy: { fontSize: 13, lineHeight: 20 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
