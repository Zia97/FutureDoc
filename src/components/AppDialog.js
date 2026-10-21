import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getPremiumTheme } from '../theme/premiumTheme';

export default function AppDialog({ visible, title, message, buttons = [], cancelable = true, onClose, onAction }) {
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent
    onRequestClose={cancelable ? onClose : () => {}}>
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} disabled={!cancelable} onPress={onClose}
        accessibilityRole="button" accessibilityLabel="Close dialog" />
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.contentRow}>
          <ScrollView style={styles.content} contentContainerStyle={styles.copy} bounces={false}>
            {!!title && <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>}
            {!!message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
          </ScrollView>
          {cancelable && <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close dialog"
            style={[styles.close, { backgroundColor: colors.surfaceSoft }]}>
            <Ionicons name="close" size={21} color={colors.textSecondary} />
          </Pressable>}
        </View>
        {buttons.length > 0 && <View style={styles.actions}>
          {buttons.map((button, index) => <Pressable key={index} onPress={() => onAction(index)}
            accessibilityRole="button" accessibilityLabel={button.text ?? 'OK'}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1,
              backgroundColor: button.style === 'cancel' ? colors.surfaceSoft : button.style === 'destructive' ? colors.red : colors.blue }]}>
            <Text style={[styles.buttonText, { color: button.style === 'cancel' ? colors.text : '#FFFFFF' }]}>{button.text ?? 'OK'}</Text>
          </Pressable>)}
        </View>}
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  card: { width: '100%', maxWidth: 360, maxHeight: '85%', padding: 20, borderRadius: 20, borderWidth: 1, gap: 18 },
  contentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexShrink: 1 },
  content: { flex: 1, flexShrink: 1 },
  copy: { gap: 8 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  message: { fontSize: 14, lineHeight: 21 },
  close: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: 8 },
  button: { minHeight: 44, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
});
