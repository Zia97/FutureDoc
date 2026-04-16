import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Shown in the top-right of navigator headers across the app.
// - Real accounts: circular avatar with email initial → Profile
// - Anonymous / signed out: "Log in" text button → Login screen
export default function HeaderAuthButton() {
  const navigation = useNavigation();
  const { user, isAnonymous } = useAuth();
  const { theme: t } = useTheme();

  const showProfile = !!user && !isAnonymous;

  if (showProfile) {
    const initial = user.email?.[0]?.toUpperCase() ?? '?';
    return (
      <TouchableOpacity
        style={[styles.profileButton, { backgroundColor: t.bgCard, borderColor: t.border }]}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.8}
      >
        <Text style={[styles.profileInitial, { color: t.accent }]}>{initial}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Login')}
      activeOpacity={0.7}
      style={styles.loginWrap}
    >
      <Text style={styles.loginText}>Log in</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  loginWrap: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
