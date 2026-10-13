import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const SECTION_NAMES = { vr: 'Verbal Reasoning', dm: 'Decision Making', qr: 'Quantitative Reasoning', sj: 'Situational Judgement' };
export const SECTION_COLOURS = { vr: 'blue', dm: 'purple', qr: 'teal', sj: 'amber' };
export function usePerformanceTheme() {
  const { isDark } = useTheme();
  return getPremiumTheme(isDark);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);
  return reduced;
}

function useProgress(target, duration = 900, delay = 0) {
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const progress = useRef(new Animated.Value(reduced ? target : 0)).current;
  useEffect(() => {
    progress.stopAnimation();
    if (reduced || !focused) { progress.setValue(target); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: target, duration, delay,
      easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [target, duration, delay, reduced, focused, progress]);
  return progress;
}

export function Reveal({ children, delay = 0, style }) {
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const translateY = useRef(new Animated.Value(0)).current;
  const entered = useRef(false);
  useEffect(() => {
    if (reduced || !focused || entered.current) { translateY.setValue(0); return; }
    entered.current = true;
    // Keep content visible when the async motion preference resolves or an
    // entrance is interrupted. Only the position animates, once per mount.
    translateY.setValue(10);
    const animation = Animated.timing(translateY, { toValue: 0, duration: 380, delay: Math.max(0, Math.min(delay, 240)),
      easing: Easing.out(Easing.cubic), useNativeDriver: true, isInteraction: false });
    animation.start();
    return () => { animation.stop(); translateY.setValue(0); };
  }, [reduced, focused, delay, translateY]);
  return <Animated.View collapsable={false} style={[style, { opacity: 1, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function StatRing({ value, size = 148, color, label = 'Accuracy', compact = false }) {
  const { colors } = usePerformanceTheme();
  const target = Math.max(0, Math.min(100, value ?? 0));
  const progress = useProgress(target);
  const [count, setCount] = useState(target);
  useEffect(() => {
    const id = progress.addListener(({ value: next }) => setCount(Math.round(next)));
    return () => progress.removeListener(id);
  }, [progress]);
  const stroke = compact ? 5 : 9;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${value == null ? 'No data' : `${value} percent`} ${label}`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={hexToRgba(color, 0.13)} strokeWidth={stroke} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progress.interpolate({ inputRange: [0, 100], outputRange: [circumference, 0] })}
          rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} importantForAccessibility="no-hide-descendants">
        <Text style={{ color: colors.text, fontSize: compact ? 19 : 35, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{value == null ? '—' : `${count}%`}</Text>
        {!compact && <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 3 }}>{label}</Text>}
      </View>
    </View>
  );
}

export function SkillBar({ value, color, height = 7, delay = 0 }) {
  const progress = useProgress(Math.max(0, Math.min(100, value ?? 0)), 700, delay);
  return <View style={{ height, borderRadius: height, backgroundColor: hexToRgba(color, 0.12), overflow: 'hidden' }}>
    <Animated.View style={{ height, borderRadius: height, backgroundColor: color,
      width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
  </View>;
}

export function PerformanceCard({ children, style, accent }) {
  const { colors } = usePerformanceTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: accent ? hexToRgba(accent, 0.3) : colors.border }, style]}>{children}</View>;
}

export function PerformanceButton({ title, onPress, icon = 'arrow-forward', secondary = false, disabled = false }) {
  const { colors } = usePerformanceTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const press = (toValue) => { if (!reduced) Animated.spring(scale, { toValue, speed: 35, bounciness: 2, useNativeDriver: true }).start(); };
  return <Animated.View style={{ transform: [{ scale }] }}><Pressable onPress={onPress} disabled={disabled}
    onPressIn={() => press(0.98)} onPressOut={() => press(1)} accessibilityRole="button" accessibilityState={{ disabled }}
    style={[styles.button, { backgroundColor: secondary ? colors.surfaceSoft : colors.blue,
      borderColor: secondary ? colors.border : colors.blue, opacity: disabled ? 0.45 : 1 }]}>
    <Text style={[styles.buttonText, { color: secondary ? colors.text : '#FFFFFF' }]}>{title}</Text>
    <Ionicons name={icon} size={18} color={secondary ? colors.text : '#FFFFFF'} />
  </Pressable></Animated.View>;
}

export function Segments({ values, value, onChange, small = false }) {
  const { colors } = usePerformanceTheme();
  return <View style={[styles.segments, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
    {values.map((option) => <Pressable key={option.id} onPress={() => onChange(option.id)}
      accessibilityRole="tab" accessibilityState={{ selected: option.id === value }} accessibilityLabel={option.label}
      style={[styles.segment, { paddingVertical: small ? 10 : 12, backgroundColor: option.id === value ? colors.surface : 'transparent' }]}>
      <Text style={{ fontSize: small ? 12 : 13, fontWeight: '700', color: option.id === value ? colors.text : colors.textMuted }}>{option.label}</Text>
    </Pressable>)}
  </View>;
}

export function ProLockCard({ onUnlock, pending = false }) {
  const { colors, isDark } = usePerformanceTheme();
  return <Reveal><PerformanceCard accent={colors.purple} style={{ overflow: 'hidden', padding: 24 }}>
    <LinearGradient colors={[hexToRgba(colors.purple, 0.13), hexToRgba(colors.blue, 0.03)]} style={StyleSheet.absoluteFill} />
    <View style={styles.lockArt} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ flex: 1, gap: 9, opacity: 0.35 }}>
        {[0.8, 0.55, 0.68].map((width, index) => <View key={index} style={{ width: `${width * 100}%`, height: 8, borderRadius: 8, backgroundColor: colors.purple }} />)}
      </View>
      <View style={[styles.lockIcon, { backgroundColor: isDark ? '#231E48' : '#EDE9FE', borderColor: hexToRgba(colors.purple, 0.4) }]}>
        <Ionicons name="lock-closed" size={26} color={colors.purple} />
      </View>
    </View>
    <Text style={[styles.eyebrow, { color: colors.purple }]}>PERFORMANCE PRO</Text>
    <Text style={[styles.title, { color: colors.text, marginTop: 9 }]}>{pending ? 'Checking Pro access' : 'Full performance analysis'}</Text>
    <Text style={[styles.body, { color: colors.textSecondary, marginTop: 10, marginBottom: 18 }]}>{pending
      ? 'Your purchase is active in the app. Refresh to check that your full analysis has unlocked.'
      : 'Unlock detailed skill results, recommended practice and progress charts.'}</Text>
    {!pending && <View style={{ gap: 10, marginBottom: 22 }}>{['Detailed skill breakdowns', 'Personalised practice recommendations', 'Fresh questions and mistake review'].map((text) => <View key={text} style={styles.row}>
      <Ionicons name="checkmark-circle" color={colors.purple} size={17} /><Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>{text}</Text>
    </View>)}</View>}
    <PerformanceButton title={pending ? 'Refresh Pro access' : 'Unlock full analysis'} icon={pending ? 'refresh' : 'lock-open-outline'} onPress={onUnlock} />
    {!pending && <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 }}>Included with your Pro subscription</Text>}
  </PerformanceCard></Reveal>;
}

export function SkillRow({ skill, onPress, delay = 0 }) {
  const { colors } = usePerformanceTheme();
  const color = colors[SECTION_COLOURS[skill.section]];
  return <Reveal delay={delay}><Pressable onPress={onPress} accessibilityRole="button"
    accessibilityLabel={`${skill.label}, ${skill.accuracy == null ? 'no data' : `${skill.accuracy} percent accuracy`}, ${skill.status}. View details.`}
    style={({ pressed }) => [styles.skillRow, { backgroundColor: pressed ? colors.surfaceSoft : colors.surface, borderColor: colors.border }]}>
    <View style={styles.between}><Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{skill.label}</Text>
      <Text style={{ color, fontSize: 17, fontWeight: '800', marginLeft: 12 }}>{skill.accuracy == null ? '—' : `${skill.accuracy}%`}</Text><Ionicons name="chevron-forward" color={colors.textMuted} size={15} /></View>
    <SkillBar value={skill.accuracy} color={color} delay={delay} />
    <View style={styles.between}><Text style={{ color: colors.textSecondary, fontSize: 12 }}>{skill.status}</Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{skill.questions} questions · {skill.sets} sets</Text></View>
  </Pressable></Reveal>;
}

export function HistoryChart({ weeks = [], color }) {
  const { colors } = usePerformanceTheme();
  const [selected, setSelected] = useState(null);
  useEffect(() => setSelected(null), [weeks]);
  const point = selected == null ? null : weeks[selected];
  return <View>
    <View style={[styles.between, { alignItems: 'flex-end', marginTop: 16, height: 144, gap: 10 }]}>
      {weeks.map((week, i) => <Pressable key={week.date} onPress={() => setSelected(i)} accessibilityRole="button"
        accessibilityLabel={`Week of ${new Date(week.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${week.accuracy == null ? 'no fresh questions' : `${week.accuracy} percent across ${week.questions} questions`}`}
        style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <Text style={{ fontSize: 10, color: selected === i ? color : colors.textSecondary }}>{week.accuracy == null ? '—' : `${week.accuracy}%`}</Text>
        <HistoryColumn value={week.accuracy} color={color} selected={selected === i} />
        <Text style={{ fontSize: 9, color: colors.textMuted }}>{new Date(week.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
      </Pressable>)}
    </View>
    <Text style={[styles.caption, { color: colors.textSecondary, marginTop: 16 }]}>{point
      ? `${point.questions} questions · ${point.accuracy == null ? 'No results' : `${point.accuracy}% accuracy`}`
      : 'Tap a week to see your results.'}</Text>
  </View>;
}

export function CohortComparison({ sections = [] }) {
  const { colors } = usePerformanceTheme();
  const available = sections.some((item) => item.cohort?.cohortAccuracy != null);
  return <Reveal><PerformanceCard>
    <Text style={[styles.title, { color: colors.text }]}>You vs cohort</Text>
    {!available ? <Text style={[styles.body, { color: colors.textSecondary, marginTop: 9 }]}>There isn’t enough comparison data yet.</Text>
      : <View style={{ gap: 23, marginTop: 15 }}>{sections.map(({ section, cohort }) => {
        const color = colors[SECTION_COLOURS[section]];
        const ready = cohort?.cohortAccuracy != null;
        const delta = cohort?.delta ?? 0;
        return <View key={section} style={{ gap: 9 }}>
          <View style={styles.between}><Text style={[styles.eyebrow, { color }]}>{section.toUpperCase()}</Text>
            <Text style={[styles.caption, { color: !ready ? colors.textMuted : delta >= 0 ? colors.mint : colors.textSecondary }]}>{!ready ? 'Not enough data yet' : delta === 0 ? 'At the cohort average' : `${Math.abs(delta)} pts ${delta > 0 ? 'above' : 'below'} average`}</Text></View>
          {ready && [{ label: 'You', value: cohort.yourAccuracy, barColor: color }, { label: 'Cohort', value: cohort.cohortAccuracy, barColor: colors.textMuted }].map(({ label, value, barColor }) =>
            <View key={label} style={[styles.row, { gap: 12 }]} accessible accessibilityLabel={`${SECTION_NAMES[section]}, ${label}, ${value} percent accuracy`}>
              <Text style={{ width: 47, fontSize: 12, color: colors.textSecondary }}>{label}</Text>
              <View style={{ flex: 1 }}><SkillBar value={value} color={barColor} height={7} /></View>
              <Text style={{ width: 38, textAlign: 'right', color: colors.text, fontWeight: '700', fontSize: 12 }}>{value}%</Text>
            </View>)}
        </View>;
      })}</View>}
  </PerformanceCard></Reveal>;
}

function HistoryColumn({ value, color, selected }) {
  const progress = useProgress(value == null ? 0 : Math.max(2, value), 800);
  return <View style={{ height: 95, width: '100%', justifyContent: 'flex-end', borderRadius: 7, backgroundColor: hexToRgba(color, 0.07) }}>
    <Animated.View style={{ width: '100%', borderRadius: 7, backgroundColor: color, opacity: selected ? 1 : 0.6,
      height: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
  </View>;
}

export const performanceStyles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 36, gap: 18 },
  heading: { fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 25 },
  body: { fontSize: 14, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 18 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
const styles = StyleSheet.create({
  ...performanceStyles,
  card: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 4 },
  button: { minHeight: 50, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  buttonText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  segments: { flexDirection: 'row', padding: 4, borderRadius: 16, borderWidth: 1, gap: 3 },
  segment: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 42 },
  skillRow: { borderWidth: 1, borderRadius: 19, padding: 17, gap: 12 },
  lockArt: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 22 },
  lockIcon: { width: 64, height: 64, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
