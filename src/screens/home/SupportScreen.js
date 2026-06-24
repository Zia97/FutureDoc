import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { submitSupportMessage } from '../../lib/supportMessages';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  hexToRgba,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const MAX_MESSAGE = 4000;
const MAX_SUBJECT = 120;

export default function SupportScreen() {
  const navigation = useNavigation();
  const { user, displayName } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { isPro } = useSubscription();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const replyEmail = user?.email ?? null;

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(100);

  const accent = colors.cyan;

  const handleSend = async () => {
    if (submitting) return;
    if (!subject.trim()) {
      Alert.alert('Add a subject', 'Please give your message a short subject.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Write a message', 'Please describe what you need help with.');
      return;
    }

    setSubmitting(true);
    const result = await submitSupportMessage({
      subject,
      message,
      displayName: displayName ?? null,
      isPremium: !!isPro,
    });
    setSubmitting(false);

    if (!result.ok) {
      Alert.alert('Could not send', result.error ?? 'Please try again.');
      return;
    }
    setSent(true);
  };

  const handleClose = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Contact Support" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <PremiumScrollView keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <Animated.View style={heroAnim}>
            <LinearGradient
              colors={[
                hexToRgba(accent, isDark ? 0.18 : 0.1),
                isDark ? 'rgba(8, 22, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
                isDark ? 'rgba(4, 10, 23, 0.98)' : 'rgba(235, 243, 255, 0.98)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
            >
              <View style={[styles.heroAccentStripe, { backgroundColor: accent }]} />
              <View style={styles.heroRow}>
                <RichIconBox icon="shield-heart" accent={accent} size={56} iconSize={28} />
                <View style={styles.heroText}>
                  <Text style={[styles.heroTitle, { color: colors.text }]}>How can we help?</Text>
                  <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                    Send a message and we'll get back to you by email.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {sent ? (
            <Animated.View style={[styles.section, formAnim]}>
              <View
                style={[
                  styles.successCard,
                  { borderColor: hexToRgba(colors.mint, 0.55), backgroundColor: hexToRgba(colors.mint, isDark ? 0.12 : 0.08) },
                ]}
              >
                <RichIconBox icon="check" accent={colors.mint} size={56} iconSize={28} />
                <Text style={[styles.successTitle, { color: colors.text }]}>Message sent</Text>
                <Text style={[styles.successBody, { color: colors.textSecondary }]}>
                  Thanks — we've received your message and will reply to{' '}
                  <Text style={{ fontWeight: '700', color: colors.text }}>
                    {replyEmail || 'your account email'}
                  </Text>{' '}
                  as soon as we can.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.mint, shadowColor: colors.mint }]}
                  onPress={handleClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.section, formAnim]}>
              {/* Reply-to (read-only — your account email) */}
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Reply to</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                    borderColor: colors.border,
                  },
                ]}
              >
                <PremiumIcon name="person-cog" size={18} color={colors.textMuted} />
                <Text
                  style={[styles.inputField, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {replyEmail}
                </Text>
              </View>
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                We'll reply to your account email.
              </Text>

              {/* Subject */}
              <Text style={[styles.fieldLabel, { color: colors.textMuted, marginTop: 18 }]}>Subject</Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                    borderColor: colors.border,
                  },
                ]}
              >
                <PremiumIcon name="pencil" size={18} color={colors.textMuted} />
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  placeholder="Short summary of the issue"
                  placeholderTextColor={colors.textMuted}
                  value={subject}
                  onChangeText={setSubject}
                  maxLength={MAX_SUBJECT}
                  editable={!submitting}
                />
              </View>

              {/* Message */}
              <Text style={[styles.fieldLabel, { color: colors.textMuted, marginTop: 18 }]}>Message</Text>
              <View
                style={[
                  styles.textareaWrap,
                  {
                    backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.textareaField, { color: colors.text }]}
                  placeholder="Describe what's going on. Include steps to reproduce if it's a bug."
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                  maxLength={MAX_MESSAGE}
                  editable={!submitting}
                />
              </View>
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {message.length} / {MAX_MESSAGE}
              </Text>

              {/* Send */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: accent, shadowColor: accent, marginTop: 18 },
                  submitting && { opacity: 0.7 },
                ]}
                onPress={handleSend}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Message</Text>
                )}
              </TouchableOpacity>

              <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
                We attach your account email, app version and platform so we can debug. We do not share your
                message with anyone outside of UCAT Genius.
              </Text>
            </Animated.View>
          )}
        </PremiumScrollView>
      </KeyboardAvoidingView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
  },
  heroAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 22,
    bottom: 22,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  section: {
    marginTop: 26,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  textareaWrap: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderWidth: 1,
    minHeight: 160,
  },
  textareaField: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 140,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'right',
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  privacyNote: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 14,
    textAlign: 'center',
  },
  successCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
  },
  successBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
});
