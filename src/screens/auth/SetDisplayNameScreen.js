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

export default function SetDisplayNameScreen() {
  const { saveDisplayName } = useAuth();
  const { theme: t } = useTheme();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a display name.');
      return;
    }
    setSaving(true);
    const { error } = await saveDisplayName(trimmed);
    setSaving(false);
    if (error) {
      Alert.alert('Could not save', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: t.text }]}>Pick a display name</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          This is how you'll appear in the app.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: t.bgCard, color: t.text, borderColor: t.border }]}
          placeholder="Display name"
          placeholderTextColor={t.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={40}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
