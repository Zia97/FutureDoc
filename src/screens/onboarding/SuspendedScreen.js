import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SUPPORT_EMAIL = 'ucatgenius@gmail.com';

export default function SuspendedScreen({ reason, suspendedAt }) {
  const { theme: t } = useTheme();
  const { signOut, user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleEmail = async () => {
    const subjectParts = ['UCAT Genius — account suspension appeal'];
    if (user?.email) subjectParts.push(`(${user.email})`);
    const subject = encodeURIComponent(subjectParts.join(' '));
    const bodyLines = [
      'Hi,',
      '',
      'I would like to appeal a suspension on my account.',
      '',
      `Account email: ${user?.email ?? '(unknown)'}`,
      `User ID: ${user?.id ?? '(unknown)'}`,
      suspendedAt ? `Suspended at: ${suspendedAt}` : null,
      reason ? `Reason shown: ${reason}` : null,
      '',
      'Reason for appeal:',
      '',
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join('\n'));
    const url = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open mail app', `Please email ${SUPPORT_EMAIL} from any inbox.`);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: t.text }]}>Account suspended</Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          Your account has been suspended and cannot use UCAT Genius right now.
        </Text>

        {reason ? (
          <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            <Text style={[styles.cardLabel, { color: t.textMuted }]}>Reason</Text>
            <Text style={[styles.cardText, { color: t.text }]}>{reason}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border, marginTop: 12 }]}>
          <Text style={[styles.cardText, { color: t.textSecondary }]}>
            If you believe this is a mistake, contact support and we'll review the suspension.
          </Text>
          <Text style={[styles.cardText, { color: t.textSecondary, marginTop: 8 }]}>
            Email: <Text style={{ fontWeight: '700', color: t.text }}>{SUPPORT_EMAIL}</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: t.border, backgroundColor: t.bg }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }]}
          onPress={handleEmail}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Email Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonGhost, { borderColor: t.border }]}
          onPress={handleSignOut}
          activeOpacity={0.85}
          disabled={signingOut}
        >
          {signingOut ? (
            <ActivityIndicator color={t.textSecondary} />
          ) : (
            <Text style={[styles.buttonGhostText, { color: t.textSecondary }]}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 18 },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardText: { fontSize: 14, lineHeight: 22 },
  footer: { padding: 20, borderTopWidth: 1, gap: 10 },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonGhost: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonGhostText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
