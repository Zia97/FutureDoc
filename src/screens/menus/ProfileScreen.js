import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

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
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

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

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{emailInitial}</Text>
        </View>
        <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionHeading}>Reset Progress</Text>
      <Text style={styles.sectionSubheading}>
        Delete your answers and progress for a section. This cannot be undone.
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.id} style={[styles.card, { borderLeftColor: section.color }]}>
          <Text style={styles.cardLabel}>{section.label}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProgress(section)}
            disabled={deleting === section.id}
            activeOpacity={0.75}
          >
            {deleting === section.id ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Progress</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.deleteAllButton}
        onPress={handleDeleteAll}
        disabled={deletingAll}
        activeOpacity={0.8}
      >
        {deletingAll ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Text style={styles.deleteAllText}>Delete All Progress</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#4f46e5',
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
    color: '#a0aec0',
    fontSize: 15,
    flex: 1,
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubheading: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#e2e8f0',
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
    borderColor: '#ef4444',
    minWidth: 44,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteAllButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteAllText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#334155',
  },
  signOutText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
