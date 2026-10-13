import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { hexToRgba } from '../../theme/premiumTheme';
import { PerformanceCard, SECTION_COLOURS, performanceStyles as s, usePerformanceTheme, useReducedMotion } from './PerformanceUI';

const MESSAGES = [
  { after: 0, title: 'Loading your results…', detail: 'Your analytics will appear here shortly.' },
  { after: 4000, title: 'Still loading your results…', detail: 'Thanks for waiting.' },
  { after: 9000, title: 'This is taking a little longer…', detail: 'You can leave this screen and come back.' },
];

export default function PerformanceLoading({ overview = false }) {
  const { colors } = usePerformanceTheme();
  const reduced = useReducedMotion();
  const focused = useIsFocused();
  const [messageIndex, setMessageIndex] = useState(0);
  const startedAt = useRef(Date.now()).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!focused) return;
    const elapsed = Date.now() - startedAt;
    setMessageIndex(MESSAGES.reduce((index, message, next) => elapsed >= message.after ? next : index, 0));
    // These messages acknowledge elapsed time, not guessed server progress.
    const timers = MESSAGES.slice(1).filter((message) => message.after > elapsed)
      .map((message) => setTimeout(() => setMessageIndex(MESSAGES.indexOf(message)), message.after - elapsed));
    return () => timers.forEach(clearTimeout);
  }, [focused, startedAt]);

  useEffect(() => {
    pulse.setValue(0);
    if (reduced || !focused) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => { animation.stop(); pulse.setValue(0); };
  }, [focused, reduced, pulse]);

  const message = MESSAGES[messageIndex];
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });
  const placeholder = { backgroundColor: colors.textMuted };
  return <View style={{ gap: 18 }}>
    <PerformanceCard>
      <View style={styles.status}>
        <View style={[styles.equalizer, { backgroundColor: hexToRgba(colors.cyan, 0.1) }]}
          accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[18, 30, 23, 35].map((height, index) => <Animated.View key={index}
            style={{ width: 5, height, borderRadius: 4, backgroundColor: colors.cyan,
              transform: [{ scaleY: pulse.interpolate({ inputRange: [0, 1], outputRange: index % 2 ? [1, 0.45] : [0.45, 1] }) }] }} />)}
        </View>
        <View style={{ flex: 1, gap: 5 }} accessible accessibilityRole="progressbar" accessibilityState={{ busy: true }}
          accessibilityLiveRegion="polite" accessibilityLabel={`${message.title} ${message.detail}`}>
          <Text style={[s.title, { color: colors.text }]}>{message.title}</Text>
          <Text style={[s.caption, { color: colors.textSecondary }]}>{message.detail}</Text>
        </View>
      </View>
      <Animated.View style={[styles.summary, { opacity }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.ring, { borderColor: colors.textMuted }]} />
        <View style={{ flex: 1, gap: 13 }}>
          <View style={[styles.line, placeholder, { width: '48%', height: 24 }]} />
          <View style={[styles.line, placeholder, { width: '90%' }]} />
          <View style={[styles.line, placeholder, { width: '65%' }]} />
        </View>
      </Animated.View>
    </PerformanceCard>
    {overview && <View style={{ gap: 14 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={[s.title, { color: colors.text }]}>Section breakdown</Text>
      <View style={styles.sections}>
        {Object.entries(SECTION_COLOURS).map(([section, colour]) => <PerformanceCard key={section} style={styles.section}>
          <Text style={[s.eyebrow, { color: colors[colour] }]}>{section.toUpperCase()}</Text>
          <Animated.View style={{ opacity, alignItems: 'center', gap: 14, width: '100%' }}>
            <View style={[styles.ring, { width: 64, height: 64, borderWidth: 5, borderColor: colors[colour] }]} />
            <View style={[styles.line, placeholder, { width: '80%' }]} />
          </Animated.View>
        </PerformanceCard>)}
      </View>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  equalizer: { width: 58, height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 24, paddingVertical: 6 },
  ring: { width: 100, height: 100, borderRadius: 50, borderWidth: 8 },
  line: { height: 10, borderRadius: 6 },
  sections: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  section: { width: '48%', flexGrow: 1, alignItems: 'center', padding: 16, gap: 16 },
});
