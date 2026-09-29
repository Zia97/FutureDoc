import React from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  hexToRgba,
  premiumColors,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const LAST_UPDATED = '28 September 2026';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body:
      'We keep data collection limited to what is needed for the app to work:\n\n- Your email address and account identifier\n- Your display name and five-digit public community tag\n- Your test and practice performance, including answers, scores, timings, and analytics summaries\n- Questions or messages you send to the AI tutor\n- Community posts, replies, screenshots, reports, blocked-user choices, and your acceptance of the Community Guidelines\n- Safety classifications, moderation actions, and limited technical information needed to prevent spam and abuse',
  },
  {
    title: '2. How We Use Your Information',
    body:
      'We use this information for account access, learning and performance features, operating the student community, searching discussions, enforcing rate limits, detecting unsafe or abusive submissions, responding to reports, and securing the service. We do not sell, rent, trade, advertise with, or train our own models on your personal data.',
  },
  {
    title: '3. Data Storage & Security',
    body:
      'Your data is stored using Supabase with encryption in transit and at rest. Community screenshots are kept in private storage and delivered through time-limited links. Pending submissions are visible only to their author and administrators; other students receive only approved content. Access is limited through server-side authorisation and row-level security.',
  },
  {
    title: '4. Third-Party Services',
    body:
      'We use trusted third-party services where needed for authentication, secure storage, subscription management, app updates, error monitoring, the AI tutor, and community safety moderation. Community text and screenshots may be sent to a safety provider solely to classify them for harmful or prohibited content. We do not permit these services to use your data for our marketing, advertising, or resale. Each provider has its own privacy terms.',
  },
  {
    title: '5. Your Rights',
    body:
      'You can:\n\n- Access your performance and public community content through the app\n- Delete your own forum posts and replies\n- Report content and block other community members\n- Delete your account from the Profile screen\n- Contact us to request access, correction, an export, human review of a moderation decision, or deletion where applicable\n\nIf you are in the UK or EU, you may also have rights to rectification, restriction, objection, and data portability.',
  },
  {
    title: '6. Data Retention',
    body:
      'We retain account data while your account is active. When you delete it, identifying account data and screenshots are scheduled for removal within 30 days. Public discussion text may remain only in anonymised form to preserve conversation context. Reports, moderation decisions, and audit records may be retained for a reasonable period where necessary to protect users, resolve complaints, prevent repeat abuse, or comply with law.',
  },
  {
    title: '7. Children’s Privacy',
    body:
      'The app is intended for users aged 16 and over. We do not knowingly collect data from children under 16. If we become aware that we have collected data from a child under 16, we will delete it promptly.',
  },
  {
    title: '8. Changes to This Policy',
    body:
      'We may update this policy from time to time. We will notify you of significant changes via the app or email. Continued use of the app after changes constitutes acceptance.',
  },
  {
    title: '9. Contact Us',
    body:
      'If you have any questions about this privacy policy or your data, please contact us at:\n\nucatgenius@gmail.com',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const introScaled = {
    fontSize: Math.round(styles.introText.fontSize * multiplier),
    lineHeight: Math.round(styles.introText.lineHeight * multiplier),
  };

  const heroAnim = useFadeSlide(0);
  const introAnim = useFadeSlide(100);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Privacy Policy" />

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={[styles.iconBadge, { borderColor: hexToRgba(colors.cyan, 0.42) }]}>
            <LinearGradient
              colors={[hexToRgba(colors.cyan, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconFill}
            >
              <PremiumIcon name="lock" size={32} color={colors.cyan} />
            </LinearGradient>
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
            <View style={[styles.lastUpdatedPill, { borderColor: hexToRgba(colors.cyan, 0.32), backgroundColor: hexToRgba(colors.cyan, 0.1) }]}>
              <Text style={[styles.lastUpdatedText, { color: colors.cyan }]}>Last updated · {LAST_UPDATED}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={introAnim}>
          <LinearGradient
            colors={gradients.glass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.introCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.introText, introScaled, { color: colors.textSecondary }]}>
              UCAT Genius (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
              This policy explains what data we collect, how we use it, and your rights.
              {'\n\n'}UCAT Genius is an independent study tool and is not affiliated with, endorsed by, or
              connected to the official UCAT app, the UCAT Consortium, Pearson VUE, or any university.
              We recommend visiting the official UCAT website (ucat.ac.uk) for the latest exam information.
            </Text>
          </LinearGradient>
        </Animated.View>

        {SECTIONS.map((section, index) => (
          <SectionBlock
            key={section.title}
            title={section.title}
            body={section.body}
            delay={160 + index * 40}
            colors={colors}
            gradients={gradients}
          />
        ))}
      </PremiumScrollView>
    </PremiumScreen>
  );
}

function SectionBlock({ title, body, delay, colors, gradients }) {
  const anim = useFadeSlide(delay, 12);
  const { multiplier } = useTextSize();
  const bodyScaled = {
    fontSize: Math.round(styles.sectionBody.fontSize * multiplier),
    lineHeight: Math.round(styles.sectionBody.lineHeight * multiplier),
  };
  return (
    <Animated.View style={[styles.section, anim]}>
      <LinearGradient
        colors={gradients.glass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.sectionCard, { borderColor: colors.border }]}
      >
        <View style={[styles.sectionAccent, { backgroundColor: colors.cyan }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sectionBody, bodyScaled, { color: colors.textSecondary }]}>{body}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 4,
    paddingBottom: 18,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 8 },
  title: {
    color: premiumColors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  lastUpdatedPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lastUpdatedText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  introCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  introText: {
    fontSize: 14,
    lineHeight: 21,
  },
  section: { marginBottom: 12 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  sectionAccent: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 21,
  },
});
