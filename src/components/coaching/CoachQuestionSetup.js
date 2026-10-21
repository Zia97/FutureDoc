import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, View } from 'react-native';
import { CoachText, ds } from './CoachDashboardUI';
import { Button, useCoachTheme } from './CoachUI';
import { useReducedMotion } from '../performance/PerformanceUI';

export default function CoachQuestionSetup({ progress, error, onRetry }) {
  const { colors } = useCoachTheme();
  const reducedMotion = useReducedMotion();
  const loaded = progress?.loaded ?? 0, total = progress?.total ?? 4;
  const value = useRef(new Animated.Value(loaded / total)).current;
  useEffect(() => {
    const animation = Animated.timing(value, { toValue: loaded / total, duration: reducedMotion ? 0 : 300, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [loaded, total, value, reducedMotion]);
  return <View style={{ gap: 14, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {!error && <ActivityIndicator color={colors.blue} />}
      <CoachText style={ds.cardTitle}>Setting up your questions</CoachText>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel="Question download"
      accessibilityValue={{ min: 0, max: total, now: loaded, text: `${loaded} of ${total} sections downloaded` }}
      style={{ height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.border }}>
      <Animated.View style={{ height: '100%', backgroundColor: colors.blue, width: value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
    <CoachText muted style={ds.caption}>{loaded} of {total} sections downloaded{progress?.section ? ` · ${progress.section}` : ''}</CoachText>
    {error ? <>
      <CoachText muted style={ds.caption}>{error}</CoachText>
      <Button title="Retry download" secondary onPress={onRetry} />
    </> : <CoachText muted style={ds.caption}>Saved on this device for coaching and Free Practice.</CoachText>}
  </View>;
}
