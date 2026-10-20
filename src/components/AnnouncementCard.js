import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Shared by the native modal and the admin's phone preview. Deliberately plain Text:
// no HTML, Markdown, links, images or administrator-provided styling.
export default function AnnouncementCard({ title, message, onDismiss, busy = false, error = '' }) {
  const { theme: t } = useTheme();
  return (
    <View style={styles.backdrop}>
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: t.text }]}>{title}</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.messageContainer}>
          <Text selectable style={[styles.message, { color: t.textSecondary }]}>{message}</Text>
        </ScrollView>
        {!!error && <Text accessibilityRole="alert" style={[styles.error, { color: t.textSecondary }]}>{error}</Text>}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Dismiss announcement"
          disabled={busy} onPress={onDismiss} style={[styles.button, { backgroundColor: t.accent }]}>
          <Text style={styles.buttonText}>{busy ? 'Saving…' : 'Dismiss'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 430, maxHeight: '85%', borderRadius: 16, borderWidth: 1, padding: 24, gap: 16 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  scroll: { flexShrink: 1 },
  messageContainer: { paddingBottom: 2 },
  message: { fontSize: 16, lineHeight: 24 },
  error: { fontSize: 14, lineHeight: 20 },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
