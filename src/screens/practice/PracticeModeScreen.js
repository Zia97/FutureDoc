import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function PracticeModeScreen({ navigation }) {
  const { theme: t } = useTheme();
  const { isAnonymous } = useAuth();

  const handleTimedPractice = () => {
    if (isAnonymous) {
      Alert.alert(
        'Create an account',
        'Timed practice simulates real UCAT conditions and saves your results so you can track progress. Create a free account to unlock it.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Create account', onPress: () => navigation.navigate('SignUp') },
        ],
      );
      return;
    }
    navigation.navigate('TimedPracticeSections');
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bgInput }]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bgInput} />

      <Text style={[styles.heading, { color: t.text }]}>How do you want to practice?</Text>
      <Text style={[styles.subheading, { color: t.textSecondary }]}>Choose a practice mode</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border, borderLeftColor: t.accent }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PracticeSections')}
        >
          <View style={[styles.iconBox, { backgroundColor: t.accent }]}>
            <Text style={styles.iconText}>✎</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: t.text }]}>Normal Practice</Text>
            <Text style={[styles.cardDescription, { color: t.textSecondary }]}>
              Browse and attempt questions at your own pace
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border, borderLeftColor: '#e11d48' }]}
          activeOpacity={0.8}
          onPress={handleTimedPractice}
        >
          <View style={[styles.iconBox, { backgroundColor: '#e11d48' }]}>
            <Text style={styles.iconText}>⏱</Text>
          </View>
          <View style={styles.cardText}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, { color: t.text }]}>Timed Practice</Text>
              {isAnonymous && (
                <View style={[styles.lockBadge, { borderColor: t.border, backgroundColor: t.bgInput }]}>
                  <Text style={[styles.lockBadgeText, { color: t.textMuted }]}>Account required</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardDescription, { color: t.textSecondary }]}>
              Sit timed tests under real UCAT conditions
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 36,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    color: '#ffffff',
    fontSize: 20,
  },
  cardText: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  lockBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 19,
  },
});
