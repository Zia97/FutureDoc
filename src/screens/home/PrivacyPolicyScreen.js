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

const LAST_UPDATED = '9 October 2026';

const SECTIONS = [
  {
    title: "Who we are",
    body: "UCAT Genius is an independent UCAT preparation product operated by Qarex Labs Ltd, the data controller responsible for the personal information described in this policy. We are registered in England and Wales under company number 17503258. Our registered office is 71–75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom. Contact us at admin@qarexlabs.co.uk.\n\nUCAT Genius is not affiliated with, endorsed by or connected to the UCAT Consortium, Pearson VUE, any university or admissions body. Our questions, explanations and progress tools are independent study aids; we do not have access to the official UCAT mark scheme.",
  },
  {
    title: "Information we collect",
    body: "- Account information: your email address and account identifiers, including a Supabase user ID and a RevenueCat app user ID. Supabase also records sign-in details such as IP address, event time and device user agent for account security.\n- Study activity: your practice and test answers, scores, timings and progress summaries, so you can review your work and see your progress.\n- AI Tutor content: questions and messages you send to the tutor. These are used to answer you and to detect misuse, investigate complaints and improve app quality.\n- Community content: if you use a Student Community feature, posts and replies you choose to publish. Other users of that feature can see the content you post, so please avoid sharing personal or sensitive information there.\n- Purchases: product, transaction and subscription status information received through RevenueCat and the Apple App Store or Google Play. We do not receive your payment card number.\n- Diagnostics: crash and error details sent to Sentry, which may include device model, operating system and app versions, an anonymised identifier and an error stack trace.\n- Website visits: ordinary technical request information, such as IP address and browser details, is processed to deliver and protect the UCAT Genius website. The site also loads a Cloudflare Web Analytics script, which can process page-view and performance information.\n- Messages to us: information you choose to include when you contact support or make a privacy request.\n\nWe do not ask you to provide your real name, postal address, phone number, location, contacts, photos, or camera or microphone input to use the app. Please do not put sensitive personal information in AI Tutor messages or community posts.",
  },
  {
    title: "How we use information and our legal bases",
    body: "- To provide the service (contract): create and manage your account, save practice results, display progress, answer AI Tutor requests, provide community features where available, and recognise paid access.\n- To keep the service safe and reliable (legitimate interests): investigate abuse or complaints, protect accounts, diagnose errors and improve stability. Our interest is operating a secure, useful study app; we consider the effect of this processing on users, including younger users.\n- To deliver the website (legitimate interests): process routine website requests and understand page performance so the site remains available and useful.\n- To comply with law (legal obligation): keep records or respond to lawful requests where required.\n- With consent, if we ask for it: for any optional processing that requires consent. We do not currently send marketing or newsletter emails. If we introduce them, we will ask you to opt in and provide a way to withdraw consent.\n\nWe do not sell personal information, use it for advertising profiles, run advertising in the app or use AI Tutor messages to train AI models. Essential account and service messages, such as password resets and security notices, are separate from marketing.",
  },
  {
    title: "AI Tutor",
    body: "The AI Tutor sends the text of your questions and messages to OpenAI to generate a response. We do not attach your email address or account identifier to the messages sent to OpenAI. We store your messages for up to 14 days to monitor misuse, investigate complaints and improve quality, unless an active abuse or safety investigation requires longer retention. AI responses may be inaccurate; please check important information against official sources.",
  },
  {
    title: "Progress analytics and tracking",
    body: "We calculate progress and performance summaries from your practice answers, scores and timings for you to view in the app. The mobile app does not use cookies, advertising trackers, behavioural analytics SDKs or cross-app tracking. Crash reporting through Sentry is used to fix errors, not to advertise to you.\n\nThe UCAT Genius website includes a Cloudflare Web Analytics script, which can collect page-view and performance metrics when configured. This is separate from your in-app study analytics and is not used for cross-site advertising.",
  },
  {
    title: "Payments and subscriptions",
    body: "Apple or Google handles payment processing for in-app purchases. RevenueCat helps us check purchase and subscription entitlements. We receive purchase metadata such as the product purchased, transaction ID and subscription status; we do not receive or store payment card details. You can manage or cancel an app-store subscription through the store where you bought it.",
  },
  {
    title: "Third-party service providers",
    body: "We use these services to operate UCAT Genius. Their own privacy notices explain their handling of information:\n\n- Supabase — account authentication, database and storage for account and study data.\n- RevenueCat — purchase status and subscription entitlements.\n- Apple App Store and Google Play — in-app payment processing.\n- OpenAI — AI Tutor responses, using message content without an attached email or account identifier.\n- Sentry — crash and error reporting.\n- Expo / EAS — app builds and updates, which may involve limited update-check or diagnostic data.\n- Cloudflare — website delivery and a web analytics script on ucatgenius.com.\n\nWe use providers for these service purposes, not for resale of your data or unrelated advertising.",
  },
  {
    title: "International data transfers",
    body: "Some providers, including OpenAI and Sentry, operate in the United States or other countries outside the UK. Where UK data protection law treats a transfer as restricted, we use an applicable adequacy decision or appropriate safeguards, such as the UK International Data Transfer Agreement or the UK Addendum to EU Standard Contractual Clauses, as relevant to the transfer. Contact us if you would like more information about the safeguards used for your data.",
  },
  {
    title: "How long we keep data",
    body: "- Account and study progress data are kept while your account is active.\n- AI Tutor messages are normally deleted after 14 days, subject to the investigation exception above.\n- Sentry crash and error logs are kept for up to 90 days.\n- After account deletion, personal data associated with your account is removed within 30 days, except information we must keep for a legal reason. Transaction records may be retained for up to six years for tax and accounting purposes.\n\nCommunity posts you publish may have been seen or copied by other users before deletion. If you need help removing a post, please contact us.",
  },
  {
    title: "Security",
    body: "We use encryption in transit and at rest and limit access to information needed to operate the app. No online system can be guaranteed completely secure. Please protect your account credentials and tell us promptly if you suspect unauthorised access.",
  },
  {
    title: "Children",
    body: "UCAT Genius is intended for people aged 16 or over. We do not knowingly collect personal data from children under 16. If you believe someone under 16 has provided personal information to us, email admin@qarexlabs.co.uk so we can investigate and delete it where appropriate.",
  },
  {
    title: "Your data protection rights",
    body: "Under the UK GDPR and Data Protection Act 2018, you may have rights to access your personal data, correct it, ask for its deletion, restrict its use, receive certain data in a portable form, and object to processing based on legitimate interests. Where we rely on consent, you may withdraw it. These rights depend on the circumstances and may be subject to legal exceptions.\n\nEmail admin@qarexlabs.co.uk to exercise a right. We may need to verify your identity. We normally respond within one month. You can also complain to the Information Commissioner’s Office (ICO) if you are unhappy with how we handle your data.",
  },
  {
    title: "Account and data deletion",
    body: "Use Delete Account on the Profile screen in the app, or email admin@qarexlabs.co.uk. Deleting your account does not automatically cancel a subscription billed by Apple or Google; manage that subscription in the relevant store. We remove associated personal data within 30 days, subject to the limited legal retention described above.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this policy if our practices, services or legal obligations change. We will update the date above and, for significant changes, notify users in the app or by email before they take effect.",
  },
  {
    title: "Contact us",
    body: "Qarex Labs Ltd 71–75 Shelton Street Covent Garden London WC2H 9JQ United Kingdom\n\nEmail: admin@qarexlabs.co.uk",
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
              How we handle personal information when you use the UCAT Genius app, visit ucatgenius.com or contact us.
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
