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

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(120);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
    color: colors.text,
    borderColor: hexToRgba(colors.blue, 0.28),
  };

  if (sent) {
    return (
      <PremiumScreen>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
        <AppHeader navigation={navigation} title="Reset Password" />
        <PremiumScrollView contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.hero, heroAnim]}>
            <View style={[styles.logoBadge, { borderColor: hexToRgba(colors.cyan, 0.42) }]}>
              <LinearGradient
                colors={[hexToRgba(colors.cyan, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoFill}
              >
                <PremiumIcon name="check" size={36} color={colors.cyan} />
              </LinearGradient>
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>Check your email</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We sent a password reset link to{'\n'}
              <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>
            </Text>
            <Text style={[styles.subtitleMuted, { color: colors.textMuted }]}>
              Follow the link to set a new password.
            </Text>
          </Animated.View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryButtonShadow}
          >
            <LinearGradient
              colors={[colors.blue, colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Back to Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </PremiumScrollView>
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Reset Password" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PremiumScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.hero, heroAnim]}>
            <View style={[styles.logoBadge, { borderColor: hexToRgba(colors.blue, 0.42) }]}>
              <LinearGradient
                colors={[hexToRgba(colors.blue, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoFill}
              >
                <PremiumIcon name="lock" size={36} color={colors.blue} />
              </LinearGradient>
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>Forgot password?</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your email and we'll send you a link to set a new password.
            </Text>
          </Animated.View>

          <Animated.View style={formAnim}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Email</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleReset}
              disabled={loading}
              style={styles.primaryButtonShadow}
            >
              <LinearGradient
                colors={[colors.blue, colors.cyan]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
              <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </PremiumScrollView>
      </KeyboardAvoidingView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scroll: { paddingBottom: 36 },
  hero: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 30,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  logoFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: premiumColors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 340,
  },
  subtitleMuted: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: 'center',
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    borderWidth: 1,
  },
  primaryButtonShadow: {
    borderRadius: 16,
    marginTop: 8,
    shadowColor: premiumColors.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 18,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  backLink: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 8,
  },
  backLinkText: { fontSize: 14, fontWeight: '600' },
});
