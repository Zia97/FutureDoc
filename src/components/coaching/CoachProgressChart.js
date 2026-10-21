import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop, Text as SvgText } from 'react-native-svg';
import { chartGeometry } from '../../lib/coaching/progressHistory';
import { useCoachTheme } from './CoachUI';
import { CoachText, ds } from './CoachDashboardUI';
import { hexToRgba } from '../../theme/premiumTheme';
import AppDialog from '../AppDialog';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const dateLabel = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const EMPTY = [];

export default function CoachProgressChart({ history = EMPTY }) {
  const { colors } = useCoachTheme();
  const focused = useIsFocused();
  const [reducedMotion, setReducedMotion] = useState(null);
  const [accuracyInfoVisible, setAccuracyInfoVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const played = useRef(false);
  const gradientId = `coachProgress${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { vertices, path, length, distances } = useMemo(() => chartGeometry(history), [history]);
  const latest = history.at(-1);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReducedMotion(value); })
      .catch(() => { if (active) setReducedMotion(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (reducedMotion === null || !vertices.length) return;
    if (!focused || reducedMotion || played.current || vertices.length === 1) {
      progress.setValue(1);
      return;
    }
    played.current = true;
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 1400,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: false, isInteraction: false });
    animation.start();
    // Refreshes and navigation finish an interrupted entrance;
    // they never restart it or leave a partly drawn result on screen.
    return () => { animation.stop(); progress.setValue(1); };
  }, [focused, reducedMotion, path, progress]);

  const movement = (axis) => vertices.length > 1 && length > 0 ? progress.interpolate({
    inputRange: distances.map((distance) => distance / length),
    outputRange: vertices.map((point) => point[axis]),
  }) : vertices[0]?.[axis] ?? 0;

  return <View style={[ds.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 12, borderRadius: 20, gap: 6 }]}>
    <View style={ds.row}>
      <CoachText style={[ds.cardTitle, { flex: 1 }]}>Performance over time</CoachText>
      <CoachText style={{ fontSize: 24, lineHeight: 30, fontWeight: '800', color: colors.cyan }}>{latest ? `${latest.accuracy}%` : '—'}</CoachText>
      <Pressable accessibilityRole="button" accessibilityLabel="About performance over time" hitSlop={6}
        style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        onPress={() => setAccuracyInfoVisible(true)}>
        <Ionicons name="information-circle-outline" size={21} color={colors.textSecondary} />
      </Pressable>
    </View>
    {latest ? <>
      <View accessible accessibilityRole="image" accessibilityLabel={`Performance over time. Accuracy, ${latest.accuracy} percent on ${dateLabel(latest.date)}. ${history.length === 1 ? 'Starting point.' : `From ${history[0].accuracy} percent on ${dateLabel(history[0].date)}.`}`}>
        <Svg width="100%" height={150} viewBox="0 0 360 190" preserveAspectRatio="none">
          <Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.cyan} stopOpacity={0.22} />
            <Stop offset="1" stopColor={colors.blue} stopOpacity={0.015} />
          </LinearGradient></Defs>
          {[0, 50, 100].map((value) => <React.Fragment key={value}>
            <Line x1={58} x2={348} y1={156 - value * 1.3} y2={156 - value * 1.3} stroke={colors.border} strokeDasharray="3 5" />
            <SvgText x={50} y={160 - value * 1.3} textAnchor="end" fill={colors.textMuted} fontSize={10}>{value}%</SvgText>
          </React.Fragment>)}
          {vertices.length > 1 && <>
            <AnimatedPath d={`${path} L348,156 L${vertices[0].x},156 Z`} fill={`url(#${gradientId})`} opacity={progress} />
            <Path d={path} fill="none" stroke={hexToRgba(colors.cyan, 0.08)} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            <AnimatedPath d={path} fill="none" stroke={colors.cyan} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={`${length} ${length}`} strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [length, 0] })} />
          </>}
          <AnimatedCircle cx={movement('x')} cy={movement('y')} r={8} fill={hexToRgba(colors.cyan, 0.15)} opacity={progress} />
          <AnimatedCircle cx={movement('x')} cy={movement('y')} r={4} fill={colors.cyan} stroke={colors.surface} strokeWidth={2} opacity={progress} />
          <Line x1={58} x2={58} y1={20} y2={156} stroke={colors.textMuted} strokeWidth={1} />
          <Line x1={58} x2={352} y1={156} y2={156} stroke={colors.textMuted} strokeWidth={1} />
          <SvgText x={13} y={91} rotation={-90} origin="13,91" textAnchor="middle" fill={colors.textSecondary} fontSize={11}>Accuracy</SvgText>
          <SvgText x={203} y={181} textAnchor="middle" fill={colors.textSecondary} fontSize={11}>Time</SvgText>
        </Svg>
      </View>
      {history.length === 1 && <CoachText muted style={ds.caption}>One day of recorded results. A line appears after another day of questions.</CoachText>}
    </> : <CoachText muted>Answer questions in practice, timed tests or coaching to see your progress.</CoachText>}
    <AppDialog visible={accuracyInfoVisible} message="Daily running accuracy from your first attempts in practice, timed tests and coaching, including answers before your mini mock. Each section with recorded marks counts equally; sections you have not attempted are left out. Repeated questions count once."
      onClose={() => setAccuracyInfoVisible(false)} />
  </View>;
}
