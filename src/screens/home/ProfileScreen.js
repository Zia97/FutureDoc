import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isPreviewEnabled, setPreviewEnabled } from '../../dev/previewStore';
import { forceContentVersionCheck } from '../../services/contentUpdateService';

const PRACTICE_SECTIONS = [
  { id: 'vr', label: 'Verbal Reasoning' },
  { id: 'dm', label: 'Decision Making' },
  { id: 'qr', label: 'Quantitative Reasoning' },
  { id: 'sj', label: 'Situational Judgement' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme: t, isDark, toggleDark } = useTheme();
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [previewToggles, setPreviewToggles] = useState({ vr: false, qr: false, sj: false, dm: false });

  useEffect(() => {
    if (!__DEV__) return;
    async function loadToggles() {
      const entries = await Promise.all(
        PRACTICE_SECTIONS.map(async (s) => [s.id, await isPreviewEnabled(s.id)])
      );
      setPreviewToggles(Object.fromEntries(entries));
    }
    loadToggles();
  }, []);

  const handlePreviewToggle = async (sectionId, value) => {
    await setPreviewEnabled(sectionId, value);
    setPreviewToggles((prev) => ({ ...prev, [sectionId]: value }));
  };

  const handleCheckForUpdates = async () => {
    setCheckingUpdates(true);
    try {
      const staleCount = await forceContentVersionCheck();
      if (staleCount > 0) {
        Alert.alert(
          'Content Updated',
          `${staleCount} section${staleCount > 1 ? 's have' : ' has'} new content. Navigate to any section to load the latest questions.`,
        );
      } else {
        Alert.alert('Up to Date', 'All content is already up to date.');
      }
    } catch {
      Alert.alert('Error', 'Could not check for updates. Please try again.');
    } finally {
      setCheckingUpdates(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bgInput }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar */}
      <View style={styles.avatarRow}>
        <View style={[styles.avatar, { backgroundColor: t.accent }]}>
          <Text style={styles.avatarText}>{emailInitial}</Text>
        </View>
        <Text style={[styles.email, { color: t.textSecondary }]} numberOfLines={1}>{user?.email}</Text>
      </View>

      {/* Appearance */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Appearance</Text>
      <View style={[styles.toggleCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <Text style={[styles.toggleTitle, { color: t.text }]}>Dark Mode</Text>
            <Text style={[styles.toggleSubtitle, { color: t.textMuted }]}>
              Switch between light and dark theme
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleDark}
            trackColor={{ false: t.border, true: t.accent }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Content</Text>
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: t.bgCard, borderColor: t.accent }]}
        onPress={handleCheckForUpdates}
        disabled={checkingUpdates}
        activeOpacity={0.8}
      >
        {checkingUpdates ? (
          <ActivityIndicator size="small" color={t.accent} />
        ) : (
          <Text style={[styles.updateButtonText, { color: t.accent }]}>Check for Updates</Text>
        )}
      </TouchableOpacity>

      {/* Developer (DEV only) */}
      {__DEV__ && (
        <>
          <Text style={[styles.sectionHeading, { color: t.text }]}>Developer</Text>
          <Text style={[styles.bodyWarning, { color: t.textMuted }]}>
            Load questions from a local JSON file instead of the database. Reload the app after placing content in src/dev/.
          </Text>
          <View style={[styles.toggleCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            {PRACTICE_SECTIONS.map((section, index) => (
              <React.Fragment key={section.id}>
                {index > 0 && <View style={[styles.toggleDivider, { backgroundColor: t.border }]} />}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabel}>
                    <Text style={[styles.toggleTitle, { color: t.text }]}>{section.label}</Text>
                    <Text style={[styles.toggleSubtitle, { color: t.textMuted }]}>
                      preview-{section.id}.json
                    </Text>
                  </View>
                  <Switch
                    value={previewToggles[section.id] ?? false}
                    onValueChange={(val) => handlePreviewToggle(section.id, val)}
                    trackColor={{ false: t.border, true: '#f59e0b' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </React.Fragment>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={[styles.signOutText, { color: t.textSecondary }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    fontSize: 15,
    flex: 1,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  bodyWarning: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },

  // Appearance toggles
  toggleCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleLabel: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  toggleSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  toggleDivider: {
    height: 1,
    marginHorizontal: 18,
  },

  updateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
