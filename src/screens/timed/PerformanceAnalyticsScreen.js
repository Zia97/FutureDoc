import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Preserve existing navigation links while Progress lives in Coaching.
export default function PerformanceAnalyticsScreen({ navigation }) {
  useFocusEffect(useCallback(() => {
    navigation.navigate('Coaching', { area: 'progress' });
  }, [navigation]));
  return null;
}
