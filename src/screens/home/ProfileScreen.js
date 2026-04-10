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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { isPreviewEnabled, setPreviewEnabled } from '../../dev/previewStore';
import { forceContentVersionCheck } from '../../services/contentUpdateService';

const PRACTICE_SECTIONS = [
  { id: 'vr', label: 'Verbal Reasoning' },
  { id: 'dm', label: 'Decision Making' },
  { id: 'qr', label: 'Quantitative Reasoning' },
  { id: 'sj', label: 'Situational Judgement' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, deleteAccount } = useAuth();
  const { theme: t, isDark, toggleDark } = useTheme();
  const { isPro, presentCustomerCenter } = useSubscription();
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'All your progress, scores, and personal data will be permanently erased.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      await deleteAccount();
                    } catch {
                      setDeleting(false);
                      Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
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

      {/* Subscription */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Subscription</Text>
      {isPro ? (
        <>
          <View style={[styles.subscriptionCard, { backgroundColor: t.bgCard, borderColor: t.correct ?? '#38a169' }]}>
            <View style={styles.subscriptionRow}>
              <View style={styles.subscriptionInfo}>
                <Text style={[styles.subscriptionPlan, { color: t.text }]}>Premium Plan</Text>
                <Text style={[styles.subscriptionDesc, { color: t.textMuted }]}>
                  All features unlocked
                </Text>
              </View>
              <View style={[styles.upgradeBadge, { backgroundColor: t.correct ?? '#38a169' }]}>
                <Text style={styles.upgradeBadgeText}>Active</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.manageButton, { backgroundColor: t.bgCard, borderColor: t.border }]}
            onPress={presentCustomerCenter}
            activeOpacity={0.8}
          >
            <Text style={[styles.manageButtonText, { color: t.text }]}>Manage Subscription</Text>
            <Text style={[styles.linkChevron, { color: t.textMuted }]}>{'\u203A'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.subscriptionCard, { backgroundColor: t.bgCard, borderColor: t.accent }]}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.8}
        >
          <View style={styles.subscriptionRow}>
            <View style={styles.subscriptionInfo}>
              <Text style={[styles.subscriptionPlan, { color: t.text }]}>Free Plan</Text>
              <Text style={[styles.subscriptionDesc, { color: t.textMuted }]}>
                Limited questions & AI Tutor usage
              </Text>
            </View>
            <View style={[styles.upgradeBadge, { backgroundColor: t.accent }]}>
              <Text style={styles.upgradeBadgeText}>Upgrade</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

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

      {/* Legal */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>Legal</Text>
      <View style={[styles.toggleCard, { backgroundColor: t.bgCard, borderColor: t.border }]}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.linkText, { color: t.text }]}>Privacy Policy</Text>
          <Text style={[styles.linkChevron, { color: t.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>
        <View style={[styles.toggleDivider, { backgroundColor: t.border }]} />
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate('TermsOfService')}
          activeOpacity={0.7}
        >
          <Text style={[styles.linkText, { color: t.text }]}>Terms of Service</Text>
          <Text style={[styles.linkChevron, { color: t.textMuted }]}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: t.bgCard, borderColor: t.borderStrong }]}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={[styles.signOutText, { color: t.textSecondary }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        style={[styles.deleteButton, { borderColor: t.danger ?? '#dc2626' }]}
        onPress={handleDeleteAccount}
        activeOpacity={0.8}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator size="small" color={t.danger ?? '#dc2626'} />
        ) : (
          <Text style={[styles.deleteText, { color: t.danger ?? '#dc2626' }]}>Delete Account</Text>
        )}
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
  subscriptionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionInfo: {
    flex: 1,
    marginRight: 12,
  },
  subscriptionPlan: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  subscriptionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  upgradeBadge: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  upgradeBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkChevron: {
    fontSize: 22,
    fontWeight: '300',
  },

  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
  },
  manageButtonText: {
    fontSize: 15,
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
  deleteButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
