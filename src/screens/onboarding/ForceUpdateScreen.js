import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ForceUpdateScreen({ storeUrl }) {
  const { theme: t } = useTheme();
  const [opening, setOpening] = useState(false);

  const handleUpdate = async () => {
    if (!storeUrl) return;
    setOpening(true);
    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (!canOpen) throw new Error('Cannot open store link.');
      await Linking.openURL(storeUrl);
    } catch (e) {
      Alert.alert('Could not open store', e.message ?? 'Please update from the App Store or Google Play.');
    } finally {
      setOpening(false);
    }
  };

  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Update required</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          A new version of UCAT Genius AI is available. Please update to continue.
        </Text>

        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.cardText, { color: t.textSecondary }]}>
            This version is no longer supported. Updating ensures you get the latest questions, fixes, and performance improvements.
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: t.border, backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent, opacity: opening ? 0.7 : 1 }]}
          onPress={handleUpdate}
          disabled={opening || !storeUrl}
        >
          <Text style={styles.buttonText}>Open {storeName}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 18 },
  cardText: { fontSize: 14, lineHeight: 22 },
  footer: { padding: 20, borderTopWidth: 1 },
  button: { borderRadius: 10, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
