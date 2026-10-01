import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

const REASONS = [
  ['harassment', 'Harassment'], ['hate', 'Hate'], ['sexual', 'Sexual content'],
  ['violence', 'Violence'], ['self_harm', 'Self-harm concern'], ['personal_information', 'Personal information'],
  ['spam', 'Spam or scam'], ['copyright', 'Copyright'], ['other', 'Other'],
];

export default function ForumReportModal({ visible, onClose, onSubmit, saving }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [reason, setReason] = useState('harassment');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('harassment');
      setDetails('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: isDark ? '#09172D' : '#fff', borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Report content</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Reports are private and reviewed by an administrator.</Text>
          <View style={styles.reasons}>
            {REASONS.map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={[styles.reason, { borderColor: reason === value ? colors.blue : colors.border, backgroundColor: reason === value ? hexToRgba(colors.blue, 0.12) : 'transparent' }]}
                onPress={() => setReason(value)}
              >
                <Text style={[styles.reasonText, { color: reason === value ? colors.blue : colors.textSecondary }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#06101F' : '#F4F7FB' }]}
            value={details}
            onChangeText={setDetails}
            placeholder="Optional details"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, { borderColor: colors.border }]} onPress={onClose} disabled={saving}>
              <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.red }]} onPress={() => onSubmit(reason, details)} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, { color: '#fff' }]}>Send report</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 22, justifyContent: 'center', backgroundColor: 'rgba(2,5,12,0.74)' },
  card: { borderWidth: 1, borderRadius: 22, padding: 20 },
  title: { fontSize: 20, fontWeight: '900' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  reason: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  reasonText: { fontSize: 12, fontWeight: '800' },
  input: { borderWidth: 1, borderRadius: 13, padding: 12, minHeight: 90, textAlignVertical: 'top', marginTop: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  button: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '900' },
});
