import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const LAST_UPDATED = '9 April 2026';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body:
      'When you create an account we collect your email address and, if you sign in via Google or Apple, the basic profile information provided by that service (name and email). We also collect data on you performance when answering questions and completing tests in this app.',
  },
  {
    title: '2. How We Use Your Information',
    body:
      'We use your data to:\n\n\u2022 Provide and maintain the app\n\u2022 Track your practice progress and display performance analytics\n\u2022 Send important account-related communications\n\u2022 Improve the app and fix bugs',
  },
  {
    title: '3. Data Storage & Security',
    body:
      'Your data is stored securely using Supabase (hosted on AWS). We use industry-standard encryption in transit (TLS) and at rest. We do not sell, rent, or share your personal data with third parties for marketing purposes.',
  },
  {
    title: '4. Third-Party Services',
    body:
      'We use the following third-party services:\n\n\u2022 Supabase \u2014 authentication and database\n\u2022 Google Sign-In \u2014 optional authentication\n\u2022 Apple Sign-In \u2014 optional authentication\n\u2022 RevenueCat \u2014 subscription management\n\u2022 Expo / EAS \u2014 app updates and builds\n\nEach service has its own privacy policy governing how they handle your data.',
  },
  {
    title: '5. Your Rights',
    body:
      'You can:\n\n\u2022 Access your data through the app\n\u2022 Delete your account and all associated data at any time from the Profile screen\n\u2022 Contact us to request a copy of your data\n\nIf you are in the UK or EU, you have additional rights under UK GDPR / EU GDPR including the right to rectification, restriction of processing, and data portability.',
  },
  {
    title: '6. Data Retention',
    body:
      'We retain your data for as long as your account is active. If you delete your account, all personal data is permanently removed within 30 days.',
  },
  {
    title: '7. Children\u2019s Privacy',
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
      'If you have any questions about this privacy policy or your data, please contact us at:\n\nucatprepaisupport@gmail.com',
  },
];

export default function PrivacyPolicyScreen() {
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
        UCAT Genius AI ("we", "our", "us") is committed to protecting your privacy.
        This policy explains what data we collect, how we use it, and your rights.
        {'\n\n'}UCAT Genius AI is an independent study tool and is not affiliated with, endorsed by, or
        connected to the official UCAT app, the UCAT Consortium, Pearson VUE, or any university.
        We recommend visiting the official UCAT website (ucat.ac.uk) for the latest exam information.
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
