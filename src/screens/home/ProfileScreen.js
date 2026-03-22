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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { isPreviewEnabled, setPreviewEnabled } from '../../dev/previewStore';
import { forceContentVersionCheck } from '../../services/contentUpdateService';

const SECTIONS = [
  {
    id: 'vr',
    label: 'Verbal Reasoning',
    color: '#7c3aed',
    cacheKeys: ['vr_attempts', 'vr_pending_sync', 'vr_passage_progress'],
    dbTables: ['verbal_reasoning_question_attempts', 'verbal_reasoning_passage_progress'],
  },
  {
    id: 'dm',
    label: 'Decision Making',
    color: '#0891b2',
    cacheKeys: ['dm_attempts', 'dm_pending_sync'],
    dbTables: ['decision_making_question_attempts'],
  },
  {
    id: 'qr',
    label: 'Quantitative Reasoning',
    color: '#059669',
    cacheKeys: ['qr_attempts', 'qr_pending_sync', 'qr_set_progress'],
    dbTables: ['quantitative_reasoning_question_attempts', 'quantitative_reasoning_set_progress'],
  },
  {
    id: 'sj',
    label: 'Situational Judgement',
    color: '#d97706',
    cacheKeys: ['sj_attempts', 'sj_pending_sync', 'sj_scenario_progress'],
    dbTables: ['situational_judgement_question_attempts', 'situational_judgement_scenario_progress'],
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { theme: t, isDark, useUCATScheme, toggleDark, toggleUCATScheme } = useTheme();
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [previewToggles, setPreviewToggles] = useState({ vr: false, qr: false, sj: false, dm: false });

  useEffect(() => {
    if (!__DEV__) return;
    async function loadToggles() {
      const entries = await Promise.all(
        SECTIONS.map(async (s) => [s.id, await isPreviewEnabled(s.id)])
      );
      setPreviewToggles(Object.fromEntries(entries));
    }
    loadToggles();
  }, []);

  const handlePreviewToggle = async (sectionId, value) => {
    await setPreviewEnabled(sectionId, value);
    setPreviewToggles((prev) => ({ ...prev, [sectionId]: value }));
  };

  const handleDeleteProgress = (section) => {
    Alert.alert(
      `Reset ${section.label}`,
      'This will permanently delete all your answers and progress for this section. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProgress(section),
        },
      ],
    );
  };

  const deleteProgress = async (section) => {
    setDeleting(section.id);
    try {
      await Promise.all(section.cacheKeys.map((key) => AsyncStorage.removeItem(key)));

      for (const table of section.dbTables) {
        const { error } = await supabase.from(table).delete().eq('user_id', user.id);
        if (error) throw error;
      }

      Alert.alert('Done', `${section.label} progress has been reset.`);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Reset All Progress',
      'This will permanently delete all your answers and progress across every section. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: deleteAllProgress },
      ],
    );
  };

  const deleteAllProgress = async () => {
    setDeletingAll(true);
    try {
      const allCacheKeys = SECTIONS.flatMap((s) => s.cacheKeys);
      await Promise.all(allCacheKeys.map((key) => AsyncStorage.removeItem(key)));

      for (const section of SECTIONS) {
        for (const table of section.dbTables) {
          const { error } = await supabase.from(table).delete().eq('user_id', user.id);
          if (error) throw error;
        }
      }

      Alert.alert('Done', 'All progress has been reset.');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeletingAll(false);
    }
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

        <View style={[styles.toggleDivider, { backgroundColor: t.border }]} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <Text style={[styles.toggleTitle, { color: t.text }]}>Use UCAT Colour Scheme in Questions</Text>
            <Text style={[styles.toggleSubtitle, { color: t.textMuted }]}>
              Practice screens match the real UCAT interface
            </Text>
          </View>
          <Switch
            value={useUCATScheme}
            onValueChange={toggleUCATScheme}
            trackColor={{ false: t.border, true: t.accent }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Reset Progress */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Reset Progress</Text>
      <Text style={[styles.sectionSubheading, { color: t.textMuted }]}>
        Delete your answers and progress for a section. This cannot be undone.
      </Text>

      {SECTIONS.map((section) => (
        <View
          key={section.id}
          style={[styles.card, { backgroundColor: t.bgCard, borderLeftColor: section.color, borderColor: t.border }]}
        >
          <Text style={[styles.cardLabel, { color: t.text }]}>{section.label}</Text>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: t.danger }]}
            onPress={() => handleDeleteProgress(section)}
            disabled={deleting === section.id}
            activeOpacity={0.75}
          >
            {deleting === section.id ? (
              <ActivityIndicator size="small" color={t.danger} />
            ) : (
              <Text style={[styles.deleteButtonText, { color: t.danger }]}>Delete Progress</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.deleteAllButton, { backgroundColor: t.bgCard, borderColor: t.danger }]}
        onPress={handleDeleteAll}
        disabled={deletingAll}
        activeOpacity={0.8}
      >
        {deletingAll ? (
          <ActivityIndicator size="small" color={t.danger} />
        ) : (
          <Text style={[styles.deleteAllText, { color: t.danger }]}>Delete All Progress</Text>
        )}
      </TouchableOpacity>

      {__DEV__ && (
        <>
          <Text style={[styles.sectionHeading, { color: '#f59e0b' }]}>Content Preview</Text>
          <Text style={[styles.sectionSubheading, { color: t.textMuted }]}>
            Load questions from a local JSON file instead of the database. Reload the app after placing content in src/dev/.
          </Text>
          <View style={[styles.toggleCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
            {SECTIONS.map((section, index) => (
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

      {/* Check for Updates */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Content</Text>
      <Text style={[styles.sectionSubheading, { color: t.textMuted }]}>
        Check if new questions or updates are available. Your existing answers are always preserved.
      </Text>
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
    marginBottom: 36,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubheading: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },

  // Appearance toggles
  toggleCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
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

  // Progress reset cards
  card: {
    borderRadius: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteAllButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 32,
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
