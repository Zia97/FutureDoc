import React from 'react';
import { Text, View } from 'react-native';
import { PerformanceButton, performanceStyles as s, usePerformanceTheme } from './PerformanceUI';
import { AppHeader, PremiumScreen } from '../premium/PremiumPracticeUI';
import { useNavigation } from '@react-navigation/native';

export default function PracticeSessionFooter({ session, isLast, answered }) {
  const { colors } = usePerformanceTheme();
  if (!session) return null;
  return <View style={{ padding: 16, gap: 10 }}>
    <Text style={[s.caption, { color: colors.textSecondary }]}>{session.title} · Focused practice</Text>
    {isLast && <PerformanceButton title="Finish this session" icon="checkmark" onPress={session.onComplete} disabled={!answered} />}
    {isLast && !answered && <Text style={[s.caption, { color: colors.textMuted }]}>Answer each question in the session to finish.</Text>}
  </View>;
}

export function PracticeSessionUnavailable() {
  const { colors } = usePerformanceTheme();
  const navigation = useNavigation();
  return <PremiumScreen><AppHeader title="Focused practice" navigation={navigation} /><View style={s.content}>
    <Text style={[s.title, { color: colors.text }]}>These questions could not be loaded</Text>
    <Text style={[s.body, { color: colors.textSecondary }]}>Check your connection, then return to your skill analysis and try again.</Text>
    <PerformanceButton title="Back to analysis" onPress={() => navigation.goBack()} />
  </View></PremiumScreen>;
}
