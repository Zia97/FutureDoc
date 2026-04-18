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
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SignUpScreen({ navigation }) {
  const { signUp, linkAccount, isAnonymous } = useAuth();
  const { theme: t } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dismissToHome = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    if (isAnonymous) {
      // Upgrade existing anonymous account — preserves user_id + progress + AI usage.
      const { error } = await linkAccount(email, password);
      setLoading(false);
      if (error) {
        Alert.alert('Could not save progress', error.message);
        return;
      }
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Verify your email to finish setting up your account.',
        [{ text: 'OK', onPress: dismissToHome }],
      );
    } else {
      const { error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }
      Alert.alert(
        'Check your email',
        'We sent you a confirmation link. Please verify your email before signing in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: t.text }]}>UCAT Genius AI</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>Create your account</Text>

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
          placeholder="Password (min 6 characters)"
          placeholderTextColor={t.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={[styles.link, { color: t.accent }]}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
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
  link: {
    fontSize: 14,
  },
});
