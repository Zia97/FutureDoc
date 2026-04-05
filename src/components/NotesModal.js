import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NotesModal({ visible, notes, onChangeNotes, onClear, onClose }) {
  const { practiceTheme: t } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.text }]}>Notes</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.clearButton, { borderColor: t.borderStrong }]} onPress={onClear} activeOpacity={0.7}>
                <Text style={[styles.clearText, { color: '#dc2626' }]}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: t.accent }]} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: t.bgInput ?? t.bg, color: t.text, borderColor: t.border }]}
            value={notes}
            onChangeText={onChangeNotes}
            placeholder="Write your notes here..."
            placeholderTextColor={t.textMuted}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 200,
  },
});
