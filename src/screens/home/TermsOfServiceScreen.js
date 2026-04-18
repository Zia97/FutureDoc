import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const LAST_UPDATED = '11 April 2026';

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
      'You must provide a valid email address to create an account. You are responsible for maintaining the security of your account credentials. You must be at least 16 years old to use this app.',
  },
  {
    title: '4. Subscriptions & Payments',
    body:
      'Some features require a paid subscription. Subscriptions are managed through the Apple App Store or Google Play Store and are subject to their respective terms.\n\n\u2022 Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period\n\u2022 You can manage or cancel subscriptions in your device\u2019s account settings\n\u2022 Refunds are handled by Apple or Google according to their policies',
  },
  {
    title: '5. Intellectual Property',
    body:
      'All content in the app \u2014 including questions, explanations, diagrams, and UI design \u2014 is the intellectual property of UCAT Genius. You may not reproduce, distribute, or create derivative works from our content without written permission.',
  },
  {
    title: '6. Disclaimer',
    body:
      'UCAT Genius is an independent study tool and is not affiliated with, endorsed by, or connected to the official UCAT app, the UCAT Consortium, Pearson VUE, or any university. "UCAT" is a registered trademark of the UCAT Consortium; its use here is purely descriptive.\n\nThis app is intended solely as a supplementary preparation aid. It does not replace official UCAT resources. We strongly recommend that all users visit the official UCAT website (ucat.ac.uk) for the latest information on exam format, registration dates, and scoring.\n\nPractice questions are original content designed to reflect the style and difficulty of the UCAT. They are not past exam questions.\n\nScaled scores (300\u2013900) and SJ bands shown in this app are estimates only. The real UCAT uses Item Response Theory scoring with proprietary, item-level parameters that no third-party app can replicate exactly. Our estimates are derived from the 2025 UCAT Consortium official statistics (means, standard deviations, and decile tables) using piecewise-linear interpolation (Verbal Reasoning) and z-score transformation (Decision Making, Quantitative Reasoning), with a typical \u00b140-point uncertainty per subtest. Treat any score shown in this app as a rough indicator of progress, not as a prediction of your actual UCAT result. See "About UCAT \u2192 Scoring" inside the app for the full methodology.',
  },
  {
    title: '7. Limitation of Liability',
    body:
      'The app is provided "as is" without warranties of any kind. We do not guarantee that use of the app will result in any particular exam outcome. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.',
  },
  {
    title: '8. Account Deletion',
    body:
      'You may delete your account at any time from the Profile screen. Upon deletion, all personal data and progress will be permanently removed. Active subscriptions should be cancelled separately through your device\u2019s account settings.',
  },
  {
    title: '9. Termination',
    body:
      'We reserve the right to suspend or terminate your account if you violate these terms, abuse the service, or engage in fraudulent activity.',
  },
  {
    title: '10. Changes to Terms',
    body:
      'We may update these terms from time to time. We will notify you of significant changes via the app or email. Continued use after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '11. Governing Law',
    body:
      'These terms are governed by and construed in accordance with the laws of England and Wales.',
  },
  {
    title: '12. Contact Us',
    body:
      'If you have any questions about these terms, please contact us at:\n\nucatprepaisupport@gmail.com',
  },
];

export default function TermsOfServiceScreen() {
  const { theme: t } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bgInput }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.lastUpdated, { color: t.textMuted }]}>
        Last updated: {LAST_UPDATED}
      </Text>

      <Text style={[styles.intro, { color: t.textSecondary }]}>
        Please read these terms carefully before using UCAT Genius.
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>{section.title}</Text>
          <Text style={[styles.sectionBody, { color: t.textSecondary }]}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  lastUpdated: { fontSize: 12, marginBottom: 16 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  sectionBody: { fontSize: 14, lineHeight: 21 },
});
