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
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const { theme: t } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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

  if (sent) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <Text style={[styles.title, { color: t.text }]}>Check your email</Text>
        <Text style={[styles.description, { color: t.textMuted }]}>
          We've sent a password reset link to {email}. Follow the link to set a new password.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.text }]}>Reset Password</Text>
      <Text style={[styles.description, { color: t.textMuted }]}>
        Enter your email and we'll send you a link to reset your password.
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
        placeholder="Email"
        placeholderTextColor={t.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: t.accent }]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.link, { color: t.accent }]}>Back to Sign In</Text>
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
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
