import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { getPremiumTheme, hexToRgba } from '../../theme/premiumTheme';

const RULES = [
  'Be kind. Harassment, hate, threats, bullying and sexual content are not allowed.',
  'Do not share names, contact details, addresses, candidate numbers or other personal information.',
  'Only upload relevant screenshots. Do not upload confidential live-exam content or pirated paid materials.',
  'No spam, scams, impersonation or promotional links.',
  'Posts and screenshots are checked automatically and may also be reviewed by a human moderator.',
  'Use Report and Block when something makes the community unsafe.',
];

export default function ForumGuidelinesModal({ visible, onAccept, onClose, saving = false }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: isDark ? '#09172D' : '#FFFFFF', borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: hexToRgba(colors.cyan, 0.13) }]}>
              <Ionicons name="people-outline" size={25} color={colors.cyan} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.text }]}>Community guidelines</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>A focused, supportive place for UCAT students.</Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close community guidelines">
              <Ionicons name="close" size={26} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.rules} showsVerticalScrollIndicator={false}>
            {RULES.map((rule, index) => (
              <View key={rule} style={styles.ruleRow}>
                <View style={[styles.number, { backgroundColor: hexToRgba(colors.blue, 0.14) }]}>
                  <Text style={[styles.numberText, { color: colors.blue }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.rule, { color: colors.textSecondary }]}>{rule}</Text>
              </View>
            ))}
            <Text style={[styles.contact, { color: colors.textMuted }]}>Safety contact: ucatgenius@gmail.com</Text>
          </ScrollView>

          <TouchableOpacity style={styles.confirmRow} onPress={() => setConfirmed((value) => !value)} activeOpacity={0.8}>
            <Ionicons name={confirmed ? 'checkbox' : 'square-outline'} size={24} color={confirmed ? colors.cyan : colors.textMuted} />
            <Text style={[styles.confirmText, { color: colors.text }]}>I have read and agree to follow these guidelines.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: confirmed ? colors.blue : colors.border }]}
            onPress={onAccept}
            disabled={!confirmed || saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>Agree and continue</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,5,12,0.75)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, padding: 22, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { fontSize: 20, fontWeight: '900' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 3 },
  rules: { marginTop: 20 },
  ruleRow: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  number: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 12, fontWeight: '900' },
  rule: { flex: 1, fontSize: 14, lineHeight: 21 },
  contact: { fontSize: 12, marginVertical: 8 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 17 },
  confirmText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  acceptButton: { marginTop: 17, minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  acceptText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
