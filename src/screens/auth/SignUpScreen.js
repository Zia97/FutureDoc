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
import Svg, { Path } from 'react-native-svg';

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

const GoogleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 533.5 544.3">
    <Path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.3 34.1-25.3 63-53.9 82.3v68h87.1c51-47.1 81.4-116.5 81.4-195.3z" />
    <Path fill="#34A853" d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-87.1-68c-24.2 16.2-55.1 25.7-91 25.7-70 0-129.4-47.2-150.6-110.6H32.3v69.5C76.5 487 167.1 544.3 272 544.3z" />
    <Path fill="#FBBC05" d="M121.4 325.9c-10.3-30.6-10.3-63.5 0-94.1V162.3H32.3c-34.3 68.5-34.3 150.1 0 218.6l89.1-54.9z" />
    <Path fill="#EA4335" d="M272 107.7c39.4-.6 77.3 13.9 106.3 40.4l79.1-79.1C407.5 23.9 341 .3 272 1 167.1 1 76.5 58.3 32.3 162.3l89.1 69.5C142.5 155 201.9 107.7 272 107.7z" />
  </Svg>
);

const AppleIcon = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 384 512">
    <Path fill={color} d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </Svg>
);

export default function SignUpScreen({ navigation }) {
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(120);
  const socialAnim = useFadeSlide(220);
  const linksAnim = useFadeSlide(300);

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

  const handleGoogle = async () => {
    setSocialLoading('google');
    const { error } = await signInWithGoogle();
    setSocialLoading(null);
    if (error) {
      Alert.alert('Google sign-in failed', error.message);
    }
  };

  const handleApple = async () => {
    setSocialLoading('apple');
    try {
      const { error } = await signInWithApple();
      if (error) {
        Alert.alert('Apple sign-in failed', error.message);
      }
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in failed', e.message);
      }
    } finally {
      setSocialLoading(null);
    }
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
      <AppHeader navigation={navigation} title="Create Account" showBack={false} />

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

          <Animated.View style={socialAnim}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: hexToRgba(colors.blue, 0.22) }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or sign up with</Text>
              <View style={[styles.dividerLine, { backgroundColor: hexToRgba(colors.blue, 0.22) }]} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : '#FFFFFF',
                    borderColor: hexToRgba(colors.blue, 0.32),
                  },
                ]}
                onPress={handleGoogle}
                disabled={socialLoading !== null}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <GoogleIcon size={20} />
                    <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.socialButton, { backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.12)' }]}
                onPress={handleApple}
                disabled={socialLoading !== null}
              >
                {socialLoading === 'apple' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <AppleIcon size={22} color="#fff" />
                    <Text style={[styles.socialButtonText, { color: '#fff' }]}>Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View style={[styles.linkBlock, linksAnim]}>
            <View style={[styles.signinRow, { borderColor: hexToRgba(colors.blue, 0.18) }]}>
              <Text style={[styles.signinMuted, { color: colors.textMuted }]}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 18,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
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
