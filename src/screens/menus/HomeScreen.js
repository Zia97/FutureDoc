import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function useFadeSlide(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme: t } = useTheme();
  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  const headerAnim = useFadeSlide(0);
  const badgeAnim = useFadeSlide(120);
  const titleAnim = useFadeSlide(220);
  const subtitleAnim = useFadeSlide(320);
  const actionsAnim = useFadeSlide(440);

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <LinearGradient
        colors={[t.gradientTop, t.bg, t.bg]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Animated.View style={[styles.header, headerAnim]}>
        <Text style={[styles.wordmark, { color: t.text }]}>UCAT Genius AI</Text>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: t.bgCard, borderColor: t.border }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.profileInitial, { color: t.accent }]}>{emailInitial}</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.hero}>
        <Animated.View style={[styles.badge, { borderColor: t.accent }, badgeAnim]}>
          <Text style={[styles.badgeText, { color: t.accent }]}>UCAT 2026</Text>
        </Animated.View>

        <Animated.Text style={[styles.title, { color: t.text }, titleAnim]}>
          Your edge{'\n'}starts here.
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { color: t.textMuted }, subtitleAnim]}>
          AI-powered preparation{'\n'}built by doctors
        </Animated.Text>
      </View>

      <Animated.View style={[styles.actions, actionsAnim]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: t.accent }]}
          onPress={() => navigation.navigate('PracticeSections')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Start Practising</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: t.bgCard, borderColor: t.border }]}
          onPress={() => navigation.navigate('AboutUCAT')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, { color: t.textSecondary }]}>About the UCAT</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 15,
    fontWeight: '700',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 46,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
