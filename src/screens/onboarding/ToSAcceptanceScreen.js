import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export const TOS_FLAG_KEY = 'tos_accepted_v1';

export default function ToSAcceptanceScreen({ onAccepted }) {
  const { theme: t } = useTheme();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await AsyncStorage.setItem(TOS_FLAG_KEY, 'true');
      onAccepted?.();
    } catch (e) {
      Alert.alert('Something went wrong', e.message ?? 'Please try again.');
      setAccepting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: t.text }]}>Welcome to UCAT Genius</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Before you start, please review our terms.
        </Text>

        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardTitle, { color: t.text }]}>Key points</Text>
          <Text style={[styles.bullet, { color: t.textSecondary }]}>
            • You must be at least 16 years old to use this app.
          </Text>
          <Text style={[styles.bullet, { color: t.textSecondary }]}>
            • UCAT Genius is an independent study tool. It is not affiliated with the UCAT Consortium or Pearson VUE. Practice questions are original content, not past exam questions.
          </Text>
          <Text style={[styles.bullet, { color: t.textSecondary }]}>
            • Scaled scores and SJ bands shown in the app are estimates only — treat them as rough indicators of progress, not predictions of your UCAT result.
          </Text>
          <Text style={[styles.bullet, { color: t.textSecondary }]}>
            • Subscriptions are managed through the App Store or Google Play.
          </Text>
          <Text style={[styles.note, { color: t.textMuted }]}>
            By tapping Accept & Continue, you agree to our Terms of Service and Privacy Policy. You can review the full versions from Profile → Settings at any time.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: t.border, backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: t.accent }]}
          onPress={handleAccept}
          disabled={accepting}
        >
          {accepting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptText}>Accept & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 18 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  bullet: { fontSize: 14, lineHeight: 22, marginBottom: 6 },
  note: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  footer: { padding: 20, borderTopWidth: 1 },
  acceptButton: { borderRadius: 10, padding: 16, alignItems: 'center' },
  acceptText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
