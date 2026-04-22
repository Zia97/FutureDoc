import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const COOLDOWN_MS = 3000;

export default function OfflineRetry({ onRetry, message }) {
  const { theme: t } = useTheme();
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    if (busy) return;
    setBusy(true);
    try {
      await onRetry?.();
    } finally {
      setTimeout(() => setBusy(false), COOLDOWN_MS);
    }
  }

  return (
    <View style={[styles.wrap, { backgroundColor: t.bgInput }]}>
      <MaterialCommunityIcons name="wifi-off" size={40} color={t.textSecondary} />
      <Text style={[styles.title, { color: t.textSecondary }]}>No internet connection</Text>
      <Text style={[styles.body, { color: t.textSecondary }]}>
        {message ?? 'Connect to the internet to load the latest content.'}
      </Text>
      <TouchableOpacity
        onPress={handlePress}
        disabled={busy}
        activeOpacity={0.8}
        style={[styles.btn, { backgroundColor: t.accent, opacity: busy ? 0.6 : 1 }]}
      >
        {busy ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
            <Text style={styles.btnText}>Retry</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  body: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.75,
    marginBottom: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
