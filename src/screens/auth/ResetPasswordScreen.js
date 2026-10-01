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
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import AppLogo from '../../components/AppLogo';

export default function ResetPasswordScreen() {
  const { updatePassword, setPasswordRecovery } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const heroAnim = useFadeSlide(0);
  const formAnim = useFadeSlide(120);

  const handleUpdate = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated.');
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

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PremiumScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <Animated.View style={[styles.hero, heroAnim]}>
            <AppLogo
              size={76}
              radius={22}
              shadowColor={colors.blue}
              borderColor={hexToRgba(colors.blue, 0.42)}
              style={styles.logo}
            />
            <Text style={[styles.heading, { color: colors.text }]}>Set new password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose a strong password you haven't used before.
            </Text>
          </Animated.View>

          <Animated.View style={formAnim}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>New password</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Confirm password</Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="Re-enter your new password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleUpdate}
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
                  <Text style={styles.primaryButtonText}>Update Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPasswordRecovery(false)} style={styles.skipLink}>
              <Text style={[styles.skipLinkText, { color: colors.textMuted }]}>Skip for now</Text>
            </TouchableOpacity>
          </Animated.View>
        </PremiumScrollView>
      </KeyboardAvoidingView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scroll: { paddingTop: 28, paddingBottom: 36 },
  hero: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  logo: { marginBottom: 18 },
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
  skipLink: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipLinkText: { fontSize: 14, fontWeight: '600' },
});
