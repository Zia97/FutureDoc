import React from 'react';
import { View, Text } from 'react-native';
import { PremiumQuestionLoading, PremiumQuestionScaffold, PrimaryQuestionButton } from './premium/PremiumQuestionScreenUI';
import { useTheme } from '../context/ThemeContext';

export default function TimedExamSavingScreen({ state, onRetry }) {
  const { theme } = useTheme();
  if (state === 'saving') return <PremiumQuestionLoading label="Saving your test…" />;
  return (
    <PremiumQuestionScaffold>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 20 }}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: theme.text }}>Your answers are still here</Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: theme.text }}>We couldn't finish saving your test on this device. Please keep this screen open and try again.</Text>
        <PrimaryQuestionButton onPress={onRetry}>Try saving again</PrimaryQuestionButton>
      </View>
    </PremiumQuestionScaffold>
  );
}
