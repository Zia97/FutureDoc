import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { PremiumIcon } from '../premium/PremiumPracticeUI';
import { useReducedMotion } from '../performance/PerformanceUI';
import { hexToRgba } from '../../theme/premiumTheme';
import { COACH_SECTIONS, sectionName } from '../../lib/coaching/dashboard';
import { useCoachTheme } from './CoachUI';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CoachText({ children, style, muted = false, ...props }) {
  const { colors } = useCoachTheme();
  return <Text {...props} style={[ds.body, { color: muted ? colors.textSecondary : colors.text }, style]}>{children}</Text>;
}

export function TextLink({ title, onPress, color, icon, disabled = false, style }) {
  const { colors } = useCoachTheme();
  const tint = color ?? colors.blue;
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ disabled }} style={({ pressed }) => [ds.textLink, { opacity: disabled ? 0.4 : pressed ? 0.65 : 1 }, style]}>
    {icon && <Ionicons name={icon} size={16} color={tint} />}
    <Text style={[ds.linkText, { color: tint }]}>{title}</Text>
  </Pressable>;
}

export function DashboardHeader({ onBack, onSettings, examLabel }) {
  const { colors } = useCoachTheme();
  return <View style={ds.header}>
    <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={4}
      style={[ds.iconButton, { backgroundColor: colors.surfaceSoft }]}>
      <Ionicons name="arrow-back" size={21} color={colors.text} />
    </Pressable>
    <View style={{ flex: 1, gap: 3 }}>
      <CoachText style={ds.headerTitle}>Coaching</CoachText>
      {examLabel && <CoachText muted style={ds.caption}>{examLabel}</CoachText>}
    </View>
    <Pressable onPress={onSettings} accessibilityRole="button" accessibilityLabel="Coach settings" style={ds.settingsButton}>
      <Ionicons name="settings-outline" size={21} color={colors.textSecondary} />
      <CoachText muted style={{ fontSize: 10, lineHeight: 13 }}>Settings</CoachText>
    </Pressable>
  </View>;
}

function SnapshotRing({ value, color }) {
  const { colors } = useCoachTheme();
  const reducedMotion = useReducedMotion();
  const target = Math.max(0, Math.min(100, value ?? 0));
  const progress = useRef(new Animated.Value(target)).current;
  useEffect(() => {
    if (reducedMotion) { progress.setValue(target); return; }
    const animation = Animated.timing(progress, { toValue: target, duration: 650, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [target, reducedMotion, progress]);
  const circumference = 2 * Math.PI * 21;
  return <View style={{ width: 40, height: 40 }} importantForAccessibility="no-hide-descendants">
    <Svg width={40} height={40} viewBox="0 0 50 50">
      <Circle cx={25} cy={25} r={21} fill="none" stroke={hexToRgba(color, 0.15)} strokeWidth={4} />
      <AnimatedCircle cx={25} cy={25} r={21} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={progress.interpolate({ inputRange: [0, 100], outputRange: [circumference, 0] })}
        rotation={-90} origin="25,25" />
    </Svg>
    <View style={[StyleSheet.absoluteFill, ds.center]}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 11, fontVariant: ['tabular-nums'] }}>{value == null ? '—' : `${value}%`}</Text>
    </View>
  </View>;
}

export function ProgressOverview({ story, sections, onProgress, onAccuracyInfo, onSection }) {
  const { colors, gradients } = useCoachTheme();
  return <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[ds.card, { borderColor: colors.border, padding: 12, borderRadius: 20 }]}>
    <View style={[ds.between, { gap: 6 }]}>
      <CoachText style={[ds.cardTitle, { flex: 1 }]}>Running accuracy</CoachText>
      <Pressable onPress={onAccuracyInfo} accessibilityRole="button" accessibilityLabel="About your running accuracy" hitSlop={6}
        style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
      </Pressable>
      <TextLink title="View progress" icon="arrow-forward" onPress={onProgress} style={{ minHeight: 32 }} />
    </View>
    {story.improvement && <View style={[ds.row, { alignItems: 'center', marginTop: 6 }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <CoachText style={{ fontWeight: '700' }}>{story.improvement.skill.label}</CoachText>
        <CoachText muted style={ds.caption}>{sectionName(story.improvement.skill.section)} · {story.improvement.mode === 'timed' ? 'Timed' : 'Practice'}</CoachText>
      </View>
      <View style={[ds.gainBadge, { backgroundColor: hexToRgba(colors.mint, 0.12) }]}
        accessible accessibilityLabel={`${story.improvement.delta} percentage point improvement in ${story.improvement.skill.label} ${story.improvement.mode} marks`}>
        <Ionicons name="trending-up" size={17} color={colors.mint} />
        <Text style={{ color: colors.mint, fontSize: 16, fontWeight: '800' }}>+{story.improvement.delta}</Text>
        <Text style={{ color: colors.mint, fontSize: 10, fontWeight: '700' }}>percentage points</Text>
      </View>
    </View>}
    <View style={ds.snapshotRow}>
      {sections.map((section) => <Pressable key={section.id} style={[ds.snapshotTile, { backgroundColor: hexToRgba(colors[section.color], 0.06) }]}
        onPress={() => onSection?.(section.id)} accessibilityRole="button"
        accessibilityLabel={`${section.title}, ${section.accuracy == null ? 'no results yet' : `${section.accuracy} percent of marks`}. View section and skills.`}>
        <SnapshotRing value={section.accuracy} color={colors[section.color]} />
        <Text style={[ds.sectionName, { color: colors.text }]}>{section.short}</Text>
      </Pressable>)}
    </View>
  </LinearGradient>;
}

export function NextPracticeCard({ focus, resume, busy, locked, preview, onContinue, onLesson, onPlan }) {
  const section = COACH_SECTIONS.find((item) => item.id === (resume?.section ?? focus?.section));
  const light = '#DCE8FF';
  return <LinearGradient colors={['#163C75', '#303E91', '#50308C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[ds.practiceCard, { paddingBottom: 20 }]}>
    <View style={[ds.between, { gap: 4 }]}>
      <Text style={[ds.eyebrow, { color: '#BFD7FF', flex: 1 }]}>NEXT LESSON</Text>
      {!resume && <TextLink title="View plan" color={light} onPress={onPlan} style={{ minHeight: 32 }} />}
    </View>
    <View style={[ds.row, { marginTop: 8 }]}>
      <View style={ds.sectionIcon}><PremiumIcon name={section?.icon ?? 'target'} size={22} color="#FFFFFF" /></View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: light, fontSize: 12, fontWeight: '600' }}>{resume?.sectionTitle ?? focus?.sectionTitle ?? 'Personalised UCAT practice'}</Text>
        <Text style={ds.practiceTitle}>{resume?.title ?? focus?.title ?? 'Build your next skill'}</Text>
      </View>
    </View>
    <Text style={ds.practiceReason}>{resume?.detail ?? focus?.reason ?? 'Your coach will choose questions around your performance.'}</Text>
    {onLesson && !resume && <TextLink title="Review lesson" icon="book-outline" color={light} onPress={onLesson}
      style={{ alignSelf: 'flex-start', marginTop: 6 }} />}
    <Pressable onPress={onContinue} disabled={busy} accessibilityRole="button" accessibilityState={{ disabled: busy }}
      style={({ pressed }) => [ds.continueButton, { opacity: busy ? 0.55 : pressed ? 0.85 : 1 }]}>
      <Text style={ds.continueText}>{busy ? 'Preparing your questions…' : resume?.kind === 'assessment' ? 'Continue mini mock' : resume ? 'Continue practice' : locked ? 'Continue with Pro' : 'Continue practice'}</Text>
      <Ionicons name={resume ? 'play' : locked ? 'lock-open-outline' : 'arrow-forward'} size={19} color="#213B79" />
    </Pressable>
    {preview && !resume && <Text style={[ds.practiceMeta, { textAlign: 'center', marginTop: 8 }]}>Your first coached practice is free</Text>}
  </LinearGradient>;
}

export function CoachInsightCard({ story, strengths = [], weaknesses = [], onDetails, onHow }) {
  const { colors } = useCoachTheme();
  return <View style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <View style={ds.row}>
      <View style={[ds.coachAvatar, { backgroundColor: hexToRgba(colors.purple, 0.12) }]}><PremiumIcon name="coach" size={23} color={colors.purple} /></View>
      <View style={{ flex: 1 }}><CoachText style={ds.cardTitle}>Your coach’s take</CoachText></View>
    </View>
    <CoachText muted style={{ marginTop: 13 }}>{story.coachNote}</CoachText>
    <View style={[ds.row, { alignItems: 'stretch', marginTop: 16, gap: 10 }]}>
      {[{ title: 'Strengths', icon: 'checkmark-circle', color: colors.mint, items: strengths },
        { title: 'Areas to improve', icon: 'flag', color: colors.red, items: weaknesses }].map((group) => <View key={group.title}
          style={[ds.signalPanel, { backgroundColor: hexToRgba(group.color, 0.06), borderColor: hexToRgba(group.color, 0.16) }]}>
        <Ionicons name={group.icon} size={17} color={group.color} />
        <Text style={[ds.signalTitle, { color: group.color }]}>{group.title}</Text>
        {group.items.slice(0, 2).map((skill) => <View key={skill.id} style={{ gap: 3, marginTop: 8 }}>
          <CoachText style={{ fontSize: 12, lineHeight: 16, fontWeight: '600' }}>{skill.label}</CoachText>
          <CoachText muted style={{ fontSize: 10, lineHeight: 14 }}>{sectionName(skill.section)}</CoachText>
        </View>)}
        {!group.items.length && <CoachText muted style={[ds.caption, { marginTop: 8 }]}>More practice will help us spot these.</CoachText>}
      </View>)}
    </View>
    <TextLink title="See your full breakdown" icon="arrow-forward" onPress={onDetails} style={{ alignSelf: 'flex-start', marginTop: 4, marginBottom: -8 }} />
    {onHow && <TextLink title="How coaching works" icon="help-circle-outline" onPress={onHow} style={{ alignSelf: 'flex-start', marginTop: 2, marginBottom: -8 }} />}
  </View>;
}

export function CoachChatDock({ onPress, remaining }) {
  const { colors } = useCoachTheme();
  const insets = useSafeAreaInsets();
  return <View style={[ds.chatDock, { backgroundColor: colors.bgTop, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Ask your coach" style={({ pressed }) => [ds.chatButton,
      { backgroundColor: colors.surfaceSoft, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
      <View style={[ds.coachAvatar, { backgroundColor: hexToRgba(colors.purple, 0.14) }]}><Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.purple} /></View>
      <View style={{ flex: 1 }}><CoachText style={{ fontWeight: '700' }}>Ask your coach</CoachText>
        {remaining != null && <CoachText muted style={ds.caption}>{remaining} free messages available</CoachText>}</View>
      <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  </View>;
}

export function CoachSheet({ visible, title, onClose, children }) {
  const { colors } = useCoachTheme();
  const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
    <View style={[ds.sheetBackdrop, { paddingTop: Math.max(insets.top, 18) }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`} />
      <View accessibilityViewIsModal style={[ds.sheet, { backgroundColor: colors.bgTop, paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={[ds.sheetHandle, { backgroundColor: colors.textMuted }]} />
        <View style={ds.sheetHeader}>
          <View style={{ flex: 1 }}><CoachText style={ds.sheetTitle}>{title}</CoachText></View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`} style={[ds.iconButton, { backgroundColor: colors.surfaceSoft }]}>
            <Ionicons name="close" size={21} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={ds.sheetContent}>
          {visible ? children : null}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

export function SkillEvidence({ skill, color, onLesson }) {
  const { colors } = useCoachTheme();
  return <View style={[ds.evidenceRow, { borderColor: colors.border }]}>
    <View style={[ds.row, { alignItems: 'flex-start' }]}>
      <View style={{ flex: 1, gap: 3 }}><CoachText style={{ fontSize: 14, fontWeight: '700' }}>{skill.label}</CoachText>
        <CoachText muted style={ds.caption}>{sectionName(skill.section)}</CoachText></View>
      <Text style={{ color, fontSize: 21, fontWeight: '800' }}>{skill.accuracy == null ? '—' : `${skill.accuracy}%`}</Text>
    </View>
    <View style={[ds.barTrack, { backgroundColor: hexToRgba(color, 0.13), marginTop: 12 }]}><View style={[ds.barFill, { width: `${Math.max(0, Math.min(100, skill.accuracy ?? 0))}%`, backgroundColor: color }]} /></View>
    <CoachText muted style={[ds.caption, { marginTop: 8 }]}>{skill.questions} first attempts · {skill.stale ? 'Due for a fresh check' : skill.confidence === 'established' ? 'Repeated evidence' : 'Early indication'}</CoachText>
    {onLesson && <TextLink title="Review the technique" icon="book-outline" onPress={onLesson} style={{ alignSelf: 'flex-start', marginBottom: -10 }} />}
  </View>;
}

export const ds = StyleSheet.create({
  page: { flex: 1 },
  coachScroll: { flex: 1, minHeight: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16, width: '100%', maxWidth: 800, alignSelf: 'center' },
  headerTitle: { fontSize: 22, lineHeight: 27, fontWeight: '800' },
  iconButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  settingsButton: { minWidth: 48, minHeight: 48, gap: 4, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, paddingBottom: 24, gap: 16, width: '100%', maxWidth: 800, alignSelf: 'center' },
  card: { borderWidth: 1, borderRadius: 25, padding: 18, overflow: 'hidden' },
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 11, lineHeight: 16 },
  eyebrow: { fontSize: 10, lineHeight: 15, fontWeight: '800', letterSpacing: 1.4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.5 },
  cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  textLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  linkText: { fontSize: 12, lineHeight: 17, fontWeight: '700', flexShrink: 1 },
  gainBadge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, alignItems: 'center', gap: 2 },
  snapshotRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  snapshotTile: { flex: 1, alignItems: 'center', gap: 2, borderRadius: 12, paddingVertical: 4 },
  sectionName: { fontSize: 11, lineHeight: 15, fontWeight: '700' },
  practiceCard: { borderRadius: 25, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6, overflow: 'hidden' },
  sectionIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  practiceTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 28, fontWeight: '800', letterSpacing: -0.3 },
  practiceReason: { color: '#E2EBFF', fontSize: 13, lineHeight: 20, marginTop: 14 },
  practiceMeta: { color: '#BED3FB', fontSize: 11, lineHeight: 16, marginTop: 8 },
  continueButton: { backgroundColor: '#FFFFFF', borderRadius: 15, minHeight: 52, padding: 14, marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  continueText: { color: '#213B79', fontSize: 15, fontWeight: '800', flex: 1 },
  coachAvatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  signalPanel: { flex: 1, borderRadius: 15, padding: 12, borderWidth: 1, alignItems: 'flex-start' },
  signalTitle: { fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 6 },
  chatDock: { flexShrink: 0, borderTopWidth: 1, paddingTop: 9, paddingHorizontal: 18 },
  chatButton: { borderRadius: 18, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, maxWidth: 764, alignSelf: 'center', width: '100%' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '94%', borderTopLeftRadius: 28, borderTopRightRadius: 28, width: '100%', maxWidth: 800, alignSelf: 'center' },
  sheetHandle: { width: 34, height: 4, borderRadius: 2, opacity: 0.35, alignSelf: 'center', marginTop: 10 },
  sheetHeader: { padding: 20, paddingTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800' },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 18, gap: 18 },
  evidenceRow: { borderWidth: 1, borderRadius: 18, padding: 15 },
  barTrack: { height: 6, overflow: 'hidden', borderRadius: 6 },
  barFill: { height: '100%', borderRadius: 6 },
  option: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
});
