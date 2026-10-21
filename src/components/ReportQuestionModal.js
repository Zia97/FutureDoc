import Alert from '../services/appAlert';
import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useTextSize } from '../context/TextSizeContext';
import {
  LESSON_REPORT_REASONS,
  REPORT_REASONS,
  submitLessonReport,
  submitQuestionReport,
} from '../lib/reportQuestion';
import { getPremiumTheme, hexToRgba } from '../theme/premiumTheme';
import PremiumIcon from './premium/PremiumIcon';

export default function ReportQuestionModal({
  visible,
  onClose,
  reportType = 'question',
  questionId,
  lessonId,
  lessonTitle = null,
  section,
  testId = null,
  isTimed = false,
  reportContext = {},
  partNumber = null,
  totalParts = null,
}) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const insets = useSafeAreaInsets();
  const scroll = useRef(null);
  const inputFocused = useRef(false);

  const [selected, setSelected] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);
  const closeTimer = useRef(null);
  const requestGeneration = useRef(0);
  const submittingRef = useRef(false);
  const isLessonReport = reportType === 'lesson';
  const reasons = isLessonReport ? LESSON_REPORT_REASONS : REPORT_REASONS;

  useEffect(() => {
    if (!visible) return;
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (inputFocused.current) scroll.current?.scrollToEnd({ animated: true });
    });
    return () => subscription.remove();
  }, [visible]);

  useEffect(() => {
    setSelected([]);
    setComment('');
    setSubmitting(false);
    submittingRef.current = false;
    setSubmittedOk(false);
    return () => {
      requestGeneration.current++;
      clearTimeout(closeTimer.current);
    };
  }, [visible, questionId, lessonId]);

  function toggleReason(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (submittingRef.current) return;
    if (!comment.trim()) {
      Alert.alert('Add comments', 'Please describe the issue so we know what to fix.');
      return;
    }
    submittingRef.current = true;
    const generation = requestGeneration.current;
    setSubmitting(true);
    try {
      const res = isLessonReport
        ? await submitLessonReport({
            lessonId,
            lessonTitle,
            section,
            reasons: selected,
            comment,
            partNumber,
            totalParts,
          })
        : await submitQuestionReport({
            questionId,
            section,
            testId,
            isTimed,
            reasons: selected,
            comment,
            context: reportContext,
          });
      if (generation !== requestGeneration.current) return;

      if (!res.ok) {
        Alert.alert('Could not send report', res.error ?? 'Please try again.');
        return;
      }
      Keyboard.dismiss();
      setSubmittedOk(true);
      closeTimer.current = setTimeout(onClose, 1100);
    } catch {
      if (generation === requestGeneration.current) {
        Alert.alert('Could not send report', 'Please try again. Your comments are still here.');
      }
    } finally {
      if (generation === requestGeneration.current) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  }

  const accent = colors.red;
  const title = isLessonReport ? 'Report this lesson' : 'Report this question';
  const reasonPrompt = isLessonReport
    ? "What's wrong with this lesson? Pick all that apply."
    : "What's wrong with it? Pick all that apply.";
  const commentPlaceholder = isLessonReport
    ? 'Tell us what needs fixing and where in the lesson...'
    : 'What happened, and what did you expect? For an answer issue, include your reasoning or calculation.';

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.cardWrap, { borderColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
          <LinearGradient
            colors={gradients.glass}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.handle, { backgroundColor: hexToRgba(colors.text, 0.18) }]} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: hexToRgba(accent, isDark ? 0.18 : 0.14),
                    borderColor: hexToRgba(accent, 0.55),
                  },
                ]}
              >
                <PremiumIcon name="flag" size={20} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { borderColor: colors.borderStrong, backgroundColor: hexToRgba(colors.text, 0.04) },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <PremiumIcon name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {submittedOk ? (
            <View style={styles.successBlock}>
              <View
                style={[
                  styles.successIcon,
                  {
                    backgroundColor: hexToRgba(colors.mint, isDark ? 0.18 : 0.14),
                    borderColor: hexToRgba(colors.mint, 0.55),
                  },
                ]}
              >
                <PremiumIcon name="check" size={26} color={colors.mint} />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>Report sent</Text>
              <Text style={[styles.successBody, { color: colors.textSecondary }]}>
                View replies in Profile → Support.
              </Text>
            </View>
          ) : (
            <>
            <ScrollView ref={scroll} style={{ flexShrink: 1 }} keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: 8 }}>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {reasonPrompt}
              </Text>

              <View style={styles.chipsContainer}>
                {reasons.map((r) => {
                  const isOn = selected.includes(r.id);
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor: hexToRgba(colors.text, isDark ? 0.04 : 0.05),
                        },
                        isOn && {
                          backgroundColor: hexToRgba(accent, isDark ? 0.22 : 0.16),
                          borderColor: hexToRgba(accent, 0.7),
                        },
                      ]}
                      onPress={() => toggleReason(r.id)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: colors.textSecondary },
                          isOn && { color: colors.text, fontWeight: '700' },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 18 }]}>
                Comments (required)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: hexToRgba(colors.text, isDark ? 0.04 : 0.05),
                    color: colors.text,
                    borderColor: colors.border,
                    fontSize: Math.round(styles.input.fontSize * multiplier),
                    lineHeight: Math.round(styles.input.lineHeight * multiplier),
                  },
                ]}
                value={comment}
                onChangeText={setComment}
                accessibilityLabel="Report comments"
                editable={!submitting}
                onFocus={() => { inputFocused.current = true; scroll.current?.scrollToEnd({ animated: true }); }}
                onBlur={() => { inputFocused.current = false; }}
                placeholder={commentPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
            </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
                style={[styles.submitWrap, submitting && { opacity: 0.65 }]}
              >
                <LinearGradient
                  colors={[accent, hexToRgba(accent, 0.82)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <PremiumIcon name="flag" size={16} color="#ffffff" />
                      <Text style={styles.submitText}>Send report</Text>
                    </>
                  )}
                </LinearGradient>
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
    backgroundColor: 'rgba(2, 6, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  cardWrap: {
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '500',
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
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 96,
    maxHeight: 140,
  },
  submitWrap: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitButton: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successBlock: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  successBody: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
