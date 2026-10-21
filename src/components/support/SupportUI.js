import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';
import { AppHeader, PremiumScreen } from '../premium/PremiumPracticeUI';

export function SupportLayout({ navigation, title, children, unreadCount = 0 }) {
  return <PremiumScreen applyBottomInset>
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <AppHeader navigation={navigation} title={title} unreadCount={unreadCount} />
      {children}
    </KeyboardAvoidingView>
  </PremiumScreen>;
}

export function SupportButton({ title, onPress, disabled, busy, secondary = false }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !!(disabled || busy) }}
    disabled={disabled || busy} onPress={onPress}
    style={[styles.button, { backgroundColor: secondary ? hexToRgba(colors.cyan, 0.1) : colors.cyan,
      borderColor: colors.cyan, opacity: disabled || busy ? 0.55 : 1 }]}>
    {busy ? <ActivityIndicator color={secondary ? colors.cyan : '#fff'} /> :
      <Text style={[styles.buttonText, { color: secondary ? colors.cyan : '#fff' }]}>{title}</Text>}
  </TouchableOpacity>;
}

export function SupportFilters({ options, value, onChange }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}
    contentContainerStyle={styles.filters} keyboardShouldPersistTaps="handled">
    {options.map(([key, label]) => <TouchableOpacity key={key} onPress={() => onChange(key)}
      accessibilityRole="button" accessibilityState={{ selected: key === value }}
      style={[styles.chip, { borderColor: key === value ? colors.cyan : colors.border,
        backgroundColor: hexToRgba(colors.cyan, key === value ? 0.14 : 0.03) }]}>
      <Text style={{ color: key === value ? colors.cyan : colors.textSecondary, fontWeight: '700' }}>{label}</Text>
    </TouchableOpacity>)}
  </ScrollView>;
}

export function SupportError({ message, retry }) {
  const { colors } = getPremiumTheme(useTheme().isDark);
  return <View style={styles.error} accessibilityLiveRegion="polite">
    <Text style={{ color: colors.red }}>{message}</Text>
    {retry && <SupportButton title="Retry" secondary onPress={retry} />}
  </View>;
}

export const supportStyles = StyleSheet.create({
  padded: { padding: 20, gap: 14 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  label: { fontSize: 14, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  meta: { fontSize: 12, lineHeight: 18 },
});
const styles = StyleSheet.create({
  fill: { flex: 1 },
  button: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filters: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 20 },
  error: { padding: 20, gap: 12 },
});
