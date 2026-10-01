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

const LAST_UPDATED = '29 September 2026';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By creating an account or using UCAT Genius, you agree to these Terms of Service. If you do not agree, do not use the app.',
  },
  {
    title: '2. Description of Service',
    body:
      'UCAT Genius is a mobile application designed to help students prepare for the University Clinical Aptitude Test (UCAT). The app provides practice questions, timed mock tests, and performance tracking across the four UCAT sections.',
  },
  {
    title: '3. Accounts',
    body:
      'You must provide a valid email address to create an account. We store your email only for account creation and account management. You are responsible for maintaining the security of your account credentials. You must be at least 16 years old to use this app.',
  },
  {
    title: '4. Data and Privacy',
    body:
      'We only store the data needed to provide and improve the app: your account details, test and practice performance, AI tutor conversations and optional answer feedback, technical AI usage information, and content you choose to submit to the student community. Community posts, replies, public display names, and approved screenshots are visible to other signed-in users. Submissions may be processed automatically and reviewed by an administrator to keep the service safe. See the Privacy Policy for more information.',
  },
  {
    title: '5. Subscriptions & Payments',
    body:
      'Some features require a paid subscription. Subscriptions are managed through the Apple App Store or Google Play Store and are subject to their respective terms.\n\n• Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period\n• You can manage or cancel subscriptions in your device’s account settings\n• Refunds are handled by Apple or Google according to their policies',
  },
  {
    title: '6. Intellectual Property',
    body:
      'Questions, explanations, diagrams, and UI design supplied by UCAT Genius remain our intellectual property and may not be reproduced or distributed without permission. You retain ownership of original content you submit to the community. By posting it, you grant UCAT Genius a non-exclusive, worldwide, royalty-free licence to store, moderate, display, and technically reproduce it only as needed to operate and protect the community. You must have the right to share every screenshot or other item you upload.',
  },
  {
    title: '6A. Student Community',
    body:
      'Before posting, you must accept the Community Guidelines. You must not submit harassment, hate, threats, bullying, sexual or graphic content, personal information, spam, scams, impersonation, confidential live-exam material, or pirated paid resources. Do not use the community to identify, target, or humiliate another person.\n\nPosts, replies, public display names, and screenshots may be checked by automated safety systems and human administrators. We may hold, reject, remove, lock, or limit access to content, and may restrict an account from posting. Users can report content and separately block other users. Automated decisions may be referred for human review by contacting ucatgenius@gmail.com.',
  },
  {
    title: '7. Disclaimer',
    body:
      'UCAT Genius is an independent study tool and is not affiliated with, endorsed by, or connected to the official UCAT app, the UCAT Consortium, Pearson VUE, or any university. "UCAT" is a registered trademark of the UCAT Consortium; its use here is purely descriptive.\n\nThis app is intended solely as a supplementary preparation aid. It does not replace official UCAT resources. We strongly recommend that all users visit the official UCAT website (ucat.ac.uk) for the latest information on exam format, registration dates, and scoring.\n\nPractice questions are original content designed to reflect the style and difficulty of the UCAT. They are not past exam questions.\n\nScaled scores (300–900) and SJ bands shown in this app are estimates only. The real UCAT uses Item Response Theory scoring with proprietary, item-level parameters that no third-party app can replicate exactly. Our estimates are derived from the 2025 UCAT Consortium official statistics (means, standard deviations, and decile tables) using piecewise-linear interpolation (Verbal Reasoning) and z-score transformation (Decision Making, Quantitative Reasoning), with a typical ±40-point uncertainty per subtest. Treat any score shown in this app as a rough indicator of progress, not as a prediction of your actual UCAT result. See "About UCAT → Scoring" inside the app for the full methodology.',
  },
  {
    title: '8. Limitation of Liability',
    body:
      'The app is provided "as is" without warranties of any kind. We do not guarantee that use of the app will result in any particular exam outcome. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.',
  },
  {
    title: '9. Account Deletion',
    body:
      'You may delete your account at any time from the Profile screen. Your email, performance data, AI tutor logs, private forum-account mapping, and uploaded screenshots will be removed. Text already contributed to public discussions may remain in anonymised form as “Deleted user” so replies keep their context, unless removal is required by law or you delete it before deleting your account. Security and moderation records may be retained where reasonably necessary to handle reports, prevent abuse, or meet legal obligations. Active subscriptions should be cancelled separately through your device’s account settings.',
  },
  {
    title: '10. Termination',
    body:
      'We may make the community read-only for an account, suspend community posting, remove content, or suspend or terminate the full account if these terms are violated, the service is abused, or fraudulent activity occurs. Serious or repeated violations may lead to a permanent restriction.',
  },
  {
    title: '11. Changes to Terms',
    body:
      'We may update these terms from time to time. We will notify you of significant changes via the app or email. Continued use after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '12. Governing Law',
    body:
      'These terms are governed by and construed in accordance with the laws of England and Wales.',
  },
  {
    title: '13. Contact Us',
    body:
      'If you have any questions about these terms, please contact us at:\n\nucatgenius@gmail.com',
  },
];

export default function TermsOfServiceScreen({ navigation }) {
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
      <AppHeader navigation={navigation} title="Terms of Service" />

      <PremiumScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.hero, heroAnim]}>
          <View style={[styles.iconBadge, { borderColor: hexToRgba(colors.blue, 0.42) }]}>
            <LinearGradient
              colors={[hexToRgba(colors.blue, isDark ? 0.22 : 0.16), isDark ? 'rgba(8, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.96)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconFill}
            >
              <PremiumIcon name="shield-heart" size={32} color={colors.blue} secondaryColor={colors.cyan} />
            </LinearGradient>
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
            <View style={[styles.lastUpdatedPill, { borderColor: hexToRgba(colors.blue, 0.32), backgroundColor: hexToRgba(colors.blue, 0.1) }]}>
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
              Please read these terms carefully before using UCAT Genius.
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
        <View style={[styles.sectionAccent, { backgroundColor: colors.blue }]} />
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
