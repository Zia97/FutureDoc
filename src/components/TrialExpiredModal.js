import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';

// Marks that we've observed this user actively on a trial. Set while the trial
// is live; used to distinguish a genuinely-ended trial from initial-load states
// where isPro hasn't resolved yet.
const TRIAL_WAS_ACTIVE_KEY = 'trial_was_active_v1';
// Set once the expiry modal has been shown, so it never reappears.
const TRIAL_EXPIRED_SEEN_KEY = 'trial_expired_seen_v1';

export default function TrialExpiredModal() {
  const { theme: t } = useTheme();
  const navigation = useNavigation();
  const { isPro, isOnTrial, hasUsedTrial } = useSubscription();
  const [visible, setVisible] = useState(false);

  // While the trial is active, remember it. This is the breadcrumb that lets us
  // later tell "trial ended" apart from "subscription state still loading".
  useEffect(() => {
    if (isOnTrial) {
      AsyncStorage.setItem(TRIAL_WAS_ACTIVE_KEY, 'true');
    }
  }, [isOnTrial]);

  // Detect expiry: the user claimed a trial (hasUsedTrial) and is no longer
  // premium (isPro === false), AND we previously saw the trial live. Show once.
  useEffect(() => {
    let cancelled = false;

    async function maybeShow() {
      // Trial clearly not over — nothing to do.
      if (isOnTrial || isPro || !hasUsedTrial) return;

      const [wasActive, alreadySeen] = await Promise.all([
        AsyncStorage.getItem(TRIAL_WAS_ACTIVE_KEY),
        AsyncStorage.getItem(TRIAL_EXPIRED_SEEN_KEY),
      ]);

      if (cancelled) return;
      if (wasActive === 'true' && alreadySeen !== 'true') {
        setVisible(true);
      }
    }

    maybeShow();
    return () => { cancelled = true; };
  }, [isPro, isOnTrial, hasUsedTrial]);

  function close() {
    AsyncStorage.setItem(TRIAL_EXPIRED_SEEN_KEY, 'true');
    setVisible(false);
  }

  function goToPaywall() {
    close();
    navigation.navigate('Paywall');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <Text style={[styles.title, { color: t.text }]}>Your free trial has ended</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            We hope you enjoyed full access to UCAT Genius. To keep using premium
            features, you can upgrade any time — no pressure.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: t.accent }]}
            onPress={goToPaywall}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>See upgrade options</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={close} activeOpacity={0.7}>
            <Text style={[styles.secondaryButtonText, { color: t.textMuted }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
