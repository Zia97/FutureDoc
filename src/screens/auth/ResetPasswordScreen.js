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

export default function ResetPasswordScreen() {
  const { updatePassword, setPasswordRecovery } = useAuth();
  const { theme: t } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={[styles.title, { color: t.text }]}>Set New Password</Text>
      <Text style={[styles.description, { color: t.textMuted }]}>
        Enter your new password below.
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
        placeholder="New password (min 6 characters)"
        placeholderTextColor={t.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
        placeholder="Confirm new password"
        placeholderTextColor={t.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: t.accent }]}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setPasswordRecovery(false)}>
        <Text style={[styles.link, { color: t.accent }]}>Skip</Text>
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
