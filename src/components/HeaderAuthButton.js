import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Top-right header button — circular avatar with the user's initial → Profile.
export default function HeaderAuthButton() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme: t } = useTheme();

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <TouchableOpacity
      style={[styles.profileButton, { backgroundColor: t.bgCard, borderColor: t.border }]}
      onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      activeOpacity={0.8}
    >
      <Text style={[styles.profileInitial, { color: t.accent }]}>{initial}</Text>
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
});
