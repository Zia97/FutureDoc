import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.8}
      >
        <Text style={styles.profileInitial}>{emailInitial}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>UCAT PrepAI</Text>
        <Text style={styles.subtitle}>Built by doctors</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => navigation.navigate('PracticeSections')}
          activeOpacity={0.85}
        >
          <Text style={styles.practiceButtonText}>Practice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  profileButton: {
    position: 'absolute',
    top: 52,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  profileInitial: {
    color: '#a0aec0',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0aec0',
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  practiceButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 14,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  practiceButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
