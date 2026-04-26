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
  requestPermission,
  scheduleDailyReminder,
} from '../../services/notificationService';
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

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(120);
  const linksAnim = useFadeSlide(240);

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a display name.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, trimmedName);
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }
    Alert.alert(
      'Check your email',
      'We sent you a confirmation link. Please verify your email before signing in.',
      [{ text: 'OK', onPress: askForNotifications }],
    );
  };

  const askForNotifications = () => {
    Alert.alert(
      'Stay on track',
      'Get a daily reminder to keep your streak going and study consistently.',
      [
        {
          text: 'Not now',
          style: 'cancel',
          onPress: () => navigation.navigate('Login'),
        },
        {
          text: 'Enable reminders',
          onPress: async () => {
            const status = await requestPermission();
            if (status === 'granted') {
              await scheduleDailyReminder();
            }
            navigation.navigate('Login');
          },
        },
      ],
    );
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
    color: colors.text,
    borderColor: hexToRgba(colors.blue, 0.28),
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Create Account" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PremiumScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.hero, heroAnim]}>
            <View style={[styles.logoBadge, { borderColor: hexToRgba(colors.cyan, 0.42) }]}>
              <LinearGradient
                colors={[hexToRgba(colors.cyan, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoFill}
              >
                <PremiumIcon name="stethoscope" size={36} color={colors.cyan} secondaryColor={colors.blue} />
              </LinearGradient>
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>Join UCAT Genius</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Build the score that matches your ambition.
            </Text>
          </Animated.View>

          <Animated.View style={formAnim}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Display name</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                maxLength={40}
              />
            </View>

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

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Password</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleSubmit}
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
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.legalText, { color: colors.textMuted }]}>
              By creating an account you agree to our{' '}
              <Text style={[styles.legalLink, { color: colors.cyan }]} onPress={() => navigation.navigate('TermsOfService')}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={[styles.legalLink, { color: colors.cyan }]} onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>.
            </Text>
          </Animated.View>

          <Animated.View style={[styles.linkBlock, linksAnim]}>
            <View style={[styles.signinRow, { borderColor: hexToRgba(colors.blue, 0.18) }]}>
              <Text style={[styles.signinMuted, { color: colors.textMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={[styles.signinLink, { color: colors.blue }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 6,
    paddingBottom: 26,
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: premiumColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 320,
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
    marginTop: 10,
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
  legalText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  legalLink: { fontWeight: '700' },
  linkBlock: {
    marginTop: 22,
    alignItems: 'center',
  },
  signinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  signinMuted: { fontSize: 14 },
  signinLink: { fontSize: 14, fontWeight: '800' },
});
