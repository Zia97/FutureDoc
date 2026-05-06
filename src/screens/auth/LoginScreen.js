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

export default function LoginScreen({ navigation, onSkip }) {
  const { signIn, signInWithGoogle, signInWithApple, resendVerificationEmail } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const isGate = typeof onSkip === 'function';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(120);
  const socialAnim = useFadeSlide(220);
  const linksAnim = useFadeSlide(300);

  const dismissToHome = () => {
    // In gate mode the auth state change (anon → real user) is what unmounts
    // this screen — the AppNavigator reroutes once the verified user lands.
    if (isGate) return;
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const handleSkip = () => {
    if (isGate) onSkip();
    else dismissToHome();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      const isUnverified = /verify your email/i.test(error.message);
      setShowResend(isUnverified);
      Alert.alert('Login failed', error.message);
      return;
    }
    setShowResend(false);
    dismissToHome();
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Enter your email first.');
      return;
    }
    setResending(true);
    const { error } = await resendVerificationEmail(email);
    setResending(false);
    if (error) {
      Alert.alert('Could not resend', error.message);
      return;
    }
    Alert.alert('Email sent', 'Check your inbox for the new confirmation link.');
  };

  const handleGoogle = async () => {
    setSocialLoading('google');
    const { error } = await signInWithGoogle();
    setSocialLoading(null);
    if (error) {
      Alert.alert('Google sign-in failed', error.message);
      return;
    }
    dismissToHome();
  };

  const handleApple = async () => {
    setSocialLoading('apple');
    try {
      const { error } = await signInWithApple();
      if (error) {
        Alert.alert('Apple sign-in failed', error.message);
        return;
      }
      dismissToHome();
    } catch (e) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign-in failed', e.message);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(8, 18, 36, 0.78)' : 'rgba(255, 255, 255, 0.92)',
    color: colors.text,
    borderColor: hexToRgba(colors.blue, 0.28),
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Sign In" showBack={!isGate} />

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
                <PremiumIcon name="caduceus" size={36} color={colors.blue} secondaryColor={colors.cyan} />
              </LinearGradient>
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue your UCAT preparation.
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

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Password</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleLogin}
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
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={socialAnim}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: hexToRgba(colors.blue, 0.22) }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or continue with</Text>
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
            {showResend ? (
              <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.linkButton}>
                {resending ? (
                  <ActivityIndicator color={colors.cyan} />
                ) : (
                  <Text style={[styles.linkAccent, { color: colors.cyan }]}>Resend verification email</Text>
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkButton}>
              <Text style={[styles.linkMuted, { color: colors.textSecondary }]}>Forgot your password?</Text>
            </TouchableOpacity>

            <View style={[styles.signupRow, { borderColor: hexToRgba(colors.blue, 0.18) }]}>
              <Text style={[styles.signupMuted, { color: colors.textMuted }]}>New to UCAT Genius?</Text>
              <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
                <Text style={[styles.signupLink, { color: colors.blue }]}>Create an account</Text>
              </TouchableOpacity>
            </View>

            {isGate ? (
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
                <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip for now</Text>
              </TouchableOpacity>
            ) : null}
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
    paddingTop: 8,
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
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  linkButton: { paddingVertical: 4 },
  linkAccent: { fontSize: 14, fontWeight: '700' },
  linkMuted: { fontSize: 14, fontWeight: '500' },
  signupRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  signupMuted: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: '800' },
  skipButton: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textDecorationLine: 'underline',
  },
});
