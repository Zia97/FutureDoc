import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTextSize, TEXT_SIZE_OPTIONS } from '../../context/TextSizeContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { isPreviewEnabled, setPreviewEnabled } from '../../dev/previewStore';
import { forceContentVersionCheck } from '../../services/contentUpdateService';
import {
  AppHeader,
  GlassMenuCard,
  PremiumFooter,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  PremiumIcon,
  hexToRgba,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const PRACTICE_SECTIONS = [
  { id: 'vr', label: 'Verbal Reasoning' },
  { id: 'dm', label: 'Decision Making' },
  { id: 'qr', label: 'Quantitative Reasoning' },
  { id: 'sj', label: 'Situational Judgement' },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, deleteAccount, isAnonymous, displayName, updatePassword, saveDisplayName } = useAuth();
  const { isDark } = useTheme();
  const { colors } = getPremiumTheme(isDark);
  const { isPro, presentCustomerCenter } = useSubscription();
  const { sizeId, setSize } = useTextSize();

  const [deleting, setDeleting] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [previewToggles, setPreviewToggles] = useState({ vr: false, qr: false, sj: false, dm: false });
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const heroAnim = useFadeSlide(0);
  const subAnim = useFadeSlide(90);
  const contentAnim = useFadeSlide(170);
  const legalAnim = useFadeSlide(250);
  const dangerAnim = useFadeSlide(320);
  const footerAnim = useFadeSlide(400);

  const openNameModal = () => {
    setNameDraft(displayName ?? '');
    setNameModalVisible(true);
  };

  const handleSaveDisplayName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Display name cannot be blank.');
      return;
    }
    setNameSaving(true);
    const { error } = await saveDisplayName(trimmed);
    setNameSaving(false);
    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    setNameModalVisible(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setPwSaving(true);
    const { error } = await updatePassword(newPassword);
    setPwSaving(false);
    if (error) {
      Alert.alert('Could not update password', error.message);
      return;
    }
    setPwModalVisible(false);
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Password updated', 'Your password has been changed.');
  };

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

  const dismissToHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          dismissToHome();
        },
      },
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
                      dismissToHome();
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

  const initialSource = isAnonymous ? 'G' : (displayName?.[0] ?? user?.email?.[0] ?? '?');
  const heroInitial = initialSource.toUpperCase();
  const emailLabel = isAnonymous ? 'Guest — progress saved on this device' : user?.email;
  const isPasswordUser = !isAnonymous && user?.app_metadata?.provider === 'email';

  const proAccent = colors.mint;
  const accountAccent = colors.cyan;
  const contentAccent = colors.blue;
  const securityAccent = colors.purple;
  const legalAccent = colors.teal;

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Profile" />

      <PremiumScrollView>
        {/* Hero card */}
        <Animated.View style={heroAnim}>
          <LinearGradient
            colors={[
              hexToRgba(accountAccent, isDark ? 0.18 : 0.1),
              isDark ? 'rgba(8, 22, 43, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              isDark ? 'rgba(4, 10, 23, 0.98)' : 'rgba(235, 243, 255, 0.98)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { borderColor: colors.border, shadowColor: accountAccent }]}
          >
            <View style={[styles.heroAccentStripe, { backgroundColor: accountAccent }]} />

            <View style={styles.heroTopRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark ? '#172D68' : '#DBEAFE',
                    borderColor: hexToRgba(accountAccent, 0.45),
                  },
                ]}
              >
                <Text style={[styles.avatarText, { color: isDark ? '#C5E4FF' : accountAccent }]}>
                  {heroInitial}
                </Text>
              </View>

              <View style={styles.heroIdentity}>
                {!isAnonymous && displayName ? (
                  <Text style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                ) : (
                  <Text style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                    {isAnonymous ? 'Guest' : 'Account'}
                  </Text>
                )}
                <Text style={[styles.heroEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {emailLabel}
                </Text>
              </View>
            </View>

            <View style={styles.heroPills}>
              <View
                style={[
                  styles.pill,
                  {
                    borderColor: hexToRgba(isPro ? proAccent : accountAccent, 0.4),
                    backgroundColor: hexToRgba(isPro ? proAccent : accountAccent, 0.12),
                  },
                ]}
              >
                <PremiumIcon
                  name={isPro ? 'shield-heart' : 'lock'}
                  size={14}
                  color={isPro ? proAccent : accountAccent}
                />
                <Text style={[styles.pillText, { color: isPro ? proAccent : accountAccent }]}>
                  {isPro ? 'Premium' : 'Free Plan'}
                </Text>
              </View>

              {!isAnonymous && displayName ? (
                <TouchableOpacity
                  onPress={openNameModal}
                  activeOpacity={0.8}
                  style={[
                    styles.pill,
                    {
                      borderColor: hexToRgba(colors.blue, 0.32),
                      backgroundColor: hexToRgba(colors.blue, 0.1),
                    },
                  ]}
                >
                  <PremiumIcon name="pencil" size={14} color={colors.blue} />
                  <Text style={[styles.pillText, { color: colors.blue }]}>Edit name</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Anonymous CTA */}
        {isAnonymous && (
          <Animated.View style={[styles.section, subAnim]}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Account</Text>
            <GlassMenuCard
              title="Save your progress"
              description="Add an email to sync across devices and avoid losing progress if you reinstall."
              icon="shield-heart"
              accent={accountAccent}
              highlighted
              badge="Save"
              onPress={() => navigation.navigate('SignUp')}
            />
            <GlassMenuCard
              title="Already have an account?"
              description="Sign in to restore your progress and unlock cross-device sync."
              icon="person-cog"
              accent={colors.blue}
              onPress={() => navigation.navigate('Login')}
            />
          </Animated.View>
        )}

        {/* Subscription */}
        <Animated.View style={[styles.section, subAnim]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Subscription</Text>
          {isPro ? (
            <>
              <GlassMenuCard
                title="Premium Plan"
                description="Premium plan active. Thank you for your support!"
                icon="shield-heart"
                accent={proAccent}
                highlighted
                badge="Active"
                showChevron={false}
              />
              <GlassMenuCard
                title="Manage Subscription"
                description="Manage your purchases"
                icon="person-cog"
                accent={colors.blue}
                onPress={presentCustomerCenter}
                showChevron={false}
              />
            </>
          ) : (
            <GlassMenuCard
              title="Upgrade to Premium"
              description="Unlock the full question bank, AI Tutor and timed mocks."
              icon="shield-heart"
              accent={proAccent}
              highlighted
              badge="Upgrade"
              onPress={() => navigation.navigate('Paywall')}
            />
          )}
        </Animated.View>

        {/* Display */}
        <Animated.View style={[styles.section, contentAnim]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Display</Text>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            Adjust the size of reading text in questions, passages and information screens. Buttons and headers stay the same.
          </Text>
          <View
            style={[
              styles.textSizeRow,
              {
                borderColor: colors.border,
                backgroundColor: isDark ? 'rgba(8, 22, 43, 0.85)' : 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          >
            {TEXT_SIZE_OPTIONS.map((option, idx) => {
              const selected = option.id === sizeId;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.85}
                  onPress={() => setSize(option.id)}
                  style={[
                    styles.textSizeOption,
                    idx > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border },
                    selected && { backgroundColor: hexToRgba(colors.blue, isDark ? 0.18 : 0.12) },
                  ]}
                >
                  <Text
                    style={[
                      styles.textSizeSample,
                      {
                        color: selected ? colors.blue : colors.text,
                        fontSize: Math.round(14 * option.multiplier),
                      },
                    ]}
                  >
                    Aa
                  </Text>
                  <Text
                    style={[
                      styles.textSizeLabel,
                      { color: selected ? colors.blue : colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.section, contentAnim]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Content</Text>
          <GlassMenuCard
            title={checkingUpdates ? 'Checking for updates…' : 'Check for Updates'}
            description="Pull the latest questions, mocks and explanations from the cloud."
            icon="refresh"
            accent={contentAccent}
            onPress={checkingUpdates ? undefined : handleCheckForUpdates}
          />
        </Animated.View>

        {/* Security */}
        {isPasswordUser && (
          <Animated.View style={[styles.section, contentAnim]}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Security</Text>
            <GlassMenuCard
              title="Change Password"
              description="Update the password used to sign in to UCAT Genius."
              icon="lock"
              accent={securityAccent}
              onPress={() => setPwModalVisible(true)}
            />
          </Animated.View>
        )}

        {/* Developer */}
        {__DEV__ && (
          <Animated.View style={[styles.section, contentAnim]}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Developer</Text>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              Load questions from a local JSON file instead of the database. Reload the app after placing content in src/dev/.
            </Text>
            <View
              style={[
                styles.devCard,
                {
                  backgroundColor: isDark ? 'rgba(8, 22, 43, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: colors.border,
                  shadowColor: colors.amber,
                },
              ]}
            >
              {PRACTICE_SECTIONS.map((section, index) => (
                <React.Fragment key={section.id}>
                  {index > 0 && (
                    <View style={[styles.devDivider, { backgroundColor: colors.border }]} />
                  )}
                  <View style={styles.devRow}>
                    <RichIconBox icon="pulse" accent={colors.amber} size={40} iconSize={20} />
                    <View style={styles.devLabel}>
                      <Text style={[styles.devTitle, { color: colors.text }]}>{section.label}</Text>
                      <Text style={[styles.devSubtitle, { color: colors.textMuted }]}>
                        preview-{section.id}.json
                      </Text>
                    </View>
                    <Switch
                      value={previewToggles[section.id] ?? false}
                      onValueChange={(val) => handlePreviewToggle(section.id, val)}
                      trackColor={{ false: colors.border, true: colors.amber }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Legal */}
        <Animated.View style={[styles.section, legalAnim]}>
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Legal</Text>
          <GlassMenuCard
            title="Privacy Policy"
            description="How we collect, store and use your data."
            icon="notes"
            accent={legalAccent}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <GlassMenuCard
            title="Terms of Service"
            description="The rules and conditions for using UCAT Genius."
            icon="book"
            accent={legalAccent}
            onPress={() => navigation.navigate('TermsOfService')}
          />
        </Animated.View>

        {/* Account actions */}
        {!isAnonymous && (
          <Animated.View style={[styles.section, dangerAnim]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark ? 'rgba(8, 22, 43, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: colors.border,
                },
              ]}
              onPress={handleSignOut}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>Sign Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.dangerButton,
                {
                  borderColor: hexToRgba(colors.red, 0.6),
                  backgroundColor: hexToRgba(colors.red, isDark ? 0.08 : 0.06),
                },
              ]}
              onPress={handleDeleteAccount}
              activeOpacity={0.85}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={colors.red} />
              ) : (
                <Text style={[styles.actionText, { color: colors.red }]}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View style={footerAnim}>
          <PremiumFooter style={styles.footer} />
        </Animated.View>
      </PremiumScrollView>

      {/* Edit name modal */}
      <Modal
        visible={nameModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#0B1A33' : '#FFFFFF',
                borderColor: colors.border,
                shadowColor: colors.blue,
              },
            ]}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                hexToRgba(colors.blue, isDark ? 0.22 : 0.12),
                hexToRgba(colors.blue, 0),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.modalAccentStripe, { backgroundColor: colors.blue }]} />

            <View style={styles.modalHeader}>
              <RichIconBox icon="pencil" accent={colors.blue} size={48} iconSize={24} />
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Display Name</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  This is how you'll appear across UCAT Genius.
                </Text>
              </View>
            </View>

            <Text style={[styles.modalFieldLabel, { color: colors.textMuted }]}>Display name</Text>
            <View
              style={[
                styles.modalInputWrap,
                {
                  backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                  borderColor: colors.border,
                },
              ]}
            >
              <PremiumIcon name="person-cog" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputField, { color: colors.text }]}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                value={nameDraft}
                onChangeText={setNameDraft}
                autoCapitalize="words"
                maxLength={40}
                autoFocus
              />
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGhost, { borderColor: colors.border }]}
                onPress={() => setNameModalVisible(false)}
                disabled={nameSaving}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.blue, shadowColor: colors.blue }]}
                onPress={handleSaveDisplayName}
                disabled={nameSaving}
              >
                {nameSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change password modal */}
      <Modal
        visible={pwModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPwModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#0B1A33' : '#FFFFFF',
                borderColor: colors.border,
                shadowColor: securityAccent,
              },
            ]}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                hexToRgba(securityAccent, isDark ? 0.22 : 0.12),
                hexToRgba(securityAccent, 0),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.modalAccentStripe, { backgroundColor: securityAccent }]} />

            <View style={styles.modalHeader}>
              <RichIconBox icon="lock" accent={securityAccent} size={48} iconSize={24} />
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Pick a new password with at least 6 characters.
                </Text>
              </View>
            </View>

            <Text style={[styles.modalFieldLabel, { color: colors.textMuted }]}>New password</Text>
            <View
              style={[
                styles.modalInputWrap,
                {
                  backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                  borderColor: colors.border,
                },
              ]}
            >
              <PremiumIcon name="lock" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputField, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <Text style={[styles.modalFieldLabel, { color: colors.textMuted }]}>Confirm password</Text>
            <View
              style={[
                styles.modalInputWrap,
                {
                  backgroundColor: isDark ? '#040A17' : '#F1F5FB',
                  borderColor: colors.border,
                },
              ]}
            >
              <PremiumIcon name="check" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.modalInputField, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonGhost, { borderColor: colors.border }]}
                onPress={() => {
                  setPwModalVisible(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={pwSaving}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: securityAccent, shadowColor: securityAccent }]}
                onPress={handleChangePassword}
                disabled={pwSaving}
              >
                {pwSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 22,
  },
  heroAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 22,
    bottom: 22,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
  },
  heroIdentity: {
    flex: 1,
    minWidth: 0,
  },
  heroName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  heroEmail: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  section: {
    marginTop: 26,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },

  textSizeRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textSizeOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  textSizeSample: {
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  textSizeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  devCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
    shadowRadius: 18,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  devLabel: {
    flex: 1,
    minWidth: 0,
  },
  devTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  devSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  devDivider: {
    height: 1,
    marginHorizontal: 16,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
  },
  dangerButton: {
    marginTop: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  footer: {
    marginTop: 30,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 5, 12, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : 0,
    shadowRadius: 26,
  },
  modalAccentStripe: {
    position: 'absolute',
    left: 0,
    top: 22,
    bottom: 22,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  modalFieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 4,
  },
  modalInput: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  modalInputField: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.32 : 0,
    shadowRadius: 14,
  },
  modalButtonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    shadowOpacity: 0,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
