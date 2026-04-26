import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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

export default function LoginScreen({ navigation }) {
  const { signIn, signInWithGoogle, signInWithApple, resendVerificationEmail } = useAuth();
  const { theme: t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const dismissToHome = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.text }]}>UCAT Genius</Text>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>Sign in to continue</Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
        placeholder="Email"
        placeholderTextColor={t.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
        placeholder="Password"
        placeholderTextColor={t.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: t.accent }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
        <Text style={[styles.dividerText, { color: t.textMuted }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: t.border }]} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: t.bgCard, borderColor: t.border, borderWidth: 1 }]}
          onPress={handleGoogle}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'google' ? (
            <ActivityIndicator color={t.text} />
          ) : (
            <>
              <GoogleIcon size={20} />
              <Text style={[styles.socialButtonText, { color: t.text }]}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: '#000' }]}
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

      {showResend && (
        <TouchableOpacity onPress={handleResend} disabled={resending}>
          {resending ? (
            <ActivityIndicator color={t.accent} style={{ marginTop: 8 }} />
          ) : (
            <Text style={[styles.link, { color: t.accent }]}>Resend verification email</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.link, { color: t.textMuted }]}>Forgot your password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
        <Text style={[styles.link, { color: t.accent }]}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    marginTop: 8,
  },
});
