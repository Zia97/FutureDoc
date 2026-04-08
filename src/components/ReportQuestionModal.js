import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { REPORT_REASONS, submitQuestionReport } from '../lib/reportQuestion';

export default function ReportQuestionModal({
  visible,
  onClose,
  questionId,
  section,
  testId = null,
  isTimed = false,
}) {
  const { practiceTheme: t } = useTheme();
  const [selected, setSelected] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);

  // Reset form whenever the modal closes
  useEffect(() => {
    if (!visible) {
      setSelected([]);
      setComment('');
      setSubmitting(false);
      setSubmittedOk(false);
    }
  }, [visible]);

  function toggleReason(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (submitting) return;
    if (selected.length === 0 && !comment.trim()) {
      Alert.alert('Pick a reason', 'Select at least one reason or add a comment.');
      return;
    }
    setSubmitting(true);
    const res = await submitQuestionReport({
      questionId,
      section,
      testId,
      isTimed,
      reasons: selected,
      comment,
    });
    setSubmitting(false);

    if (!res.ok) {
      Alert.alert('Could not send report', res.error ?? 'Please try again.');
      return;
    }
    setSubmittedOk(true);
    setTimeout(onClose, 1100);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.text }]}>Report this question</Text>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: t.borderStrong }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeText, { color: t.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>

          {submittedOk ? (
            <View style={styles.successBlock}>
              <Text style={[styles.successTitle, { color: t.text }]}>Thanks!</Text>
              <Text style={[styles.successBody, { color: t.textSecondary }]}>
                Your report has been sent. We'll review it shortly.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: t.textSecondary }]}>
                What's wrong with it? Pick all that apply.
              </Text>

              <View style={styles.chipsContainer}>
                {REPORT_REASONS.map((r) => {
                  const isOn = selected.includes(r.id);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.chip,
                        { borderColor: t.borderStrong, backgroundColor: t.bg },
                        isOn && { backgroundColor: t.accent, borderColor: t.accent },
                      ]}
                      onPress={() => toggleReason(r.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: t.text },
                          isOn && { color: '#ffffff', fontWeight: '700' },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.subtitle, { color: t.textSecondary, marginTop: 16 }]}>
                Comments (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: t.bgInput ?? t.bg, color: t.text, borderColor: t.border },
                ]}
                value={comment}
                onChangeText={setComment}
                placeholder="Add any extra details that would help us fix this..."
                placeholderTextColor={t.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: t.accent },
                  submitting && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitText}>Send report</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 90,
    maxHeight: 140,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  successBlock: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  successBody: {
    fontSize: 14,
    textAlign: 'center',
  },
});
