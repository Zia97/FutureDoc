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
    title: "Who provides UCAT Genius",
    body: "UCAT Genius is provided by Qarex Labs Ltd (“we”, “us”), registered in England and Wales under company number 17503258. Our registered office is 71–75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom. These terms form an agreement between you and Qarex Labs Ltd when you use the UCAT Genius app or related services. If you are under 18, please review them with a parent or guardian.\n\nUCAT Genius is intended for users aged 16 or over. Please do not create an account if you are under 16.",
  },
  {
    title: "About the product",
    body: "UCAT Genius offers independent UCAT practice questions, timed tests, lessons, answer explanations, progress tools and an AI Tutor. Some versions may also offer a Student Community. Features and access may differ between free and paid plans and may change as the app is updated.\n\nUCAT Genius is not official, endorsed by or affiliated with the UCAT Consortium, Pearson VUE, the NHS, any university or any admissions organisation. We do not have access to the official UCAT mark scheme. Refer to the official UCAT website for current exam rules and information.",
  },
  {
    title: "Your account",
    body: "Provide an email address you can access, keep your sign-in details secure and tell us promptly if you suspect unauthorised use. You are responsible for activity through your account unless it results from our failure to take reasonable care. Please keep your account information accurate and do not share paid access in a way that bypasses the limits of your purchase.",
  },
  {
    title: "Plans, purchases and subscriptions",
    body: "The app may offer free access, recurring subscriptions and a one-off lifetime access product. The available features, price, currency, billing period and any renewal details are shown before you confirm a purchase. “Lifetime” means access for the life of the UCAT Genius service, subject to these terms and your statutory rights; it does not promise that the service will operate forever.\n\nIn-app purchases are billed by the Apple App Store or Google Play, as applicable. Their purchase and payment terms also apply. We use RevenueCat to recognise your entitlement in the app. Prices and taxes shown by the store may vary by location. We will not change the price of an existing store subscription except through the applicable store process and any notice or consent required by law.",
  },
  {
    title: "Free trials",
    body: "If a free trial is offered, its length, eligibility and the price that follows will be displayed before you start it. A trial attached to an automatically renewing subscription will move to the paid subscription shown at sign-up unless you cancel before the trial ends. Availability of trials and eligibility for another trial are determined by the offer and the relevant app store.",
  },
  {
    title: "Cancellation and refunds",
    body: "You can turn off renewal of an Apple subscription in your Apple account settings, or of a Google Play subscription in Google Play. You can do this at any time before renewal; access normally continues until the end of the current paid period or trial, as described by the store. Deleting the app or your UCAT Genius account does not cancel an app-store subscription.\n\nFor a refund or billing issue, use the relevant store’s refund process or contact us at admin@qarexlabs.co.uk and we will help where we can. Nothing in these terms limits any cancellation, refund or other rights you have under applicable consumer law.",
  },
  {
    title: "Acceptable use",
    body: "Use UCAT Genius for your own lawful study. Do not try to compromise the app or other users’ accounts, scrape or redistribute substantial parts of its question bank, circumvent paid access, use automated tools to overload it, or submit unlawful, abusive or infringing content. Do not use the AI Tutor or any community feature to harass others, reveal another person’s private information or generate harmful content.\n\nIf a community feature is available, content you post may be visible to other users. You are responsible for what you post and must have the rights needed to share it. We may remove content or restrict access where reasonably necessary to protect users, comply with law or enforce these terms. Tell us at admin@qarexlabs.co.uk if you see content that raises a concern.",
  },
  {
    title: "Intellectual property",
    body: "The UCAT Genius app, its design, lessons, questions, explanations and other material are owned by us or our licensors. We give you a personal, non-exclusive, non-transferable right to use them for your own preparation while you have access to the service. You may not copy, publish, sell or commercially exploit them without permission, except where the law allows.\n\nYou keep ownership of content you submit. You give us a limited permission to host, display and process it as needed to provide the feature you use, such as showing a community post to other users. Our handling of personal information is explained in the Privacy Policy.",
  },
  {
    title: "AI Tutor and educational limitations",
    body: "AI-generated answers may be incomplete, inaccurate or unsuitable for a particular question. Check them against reliable sources and use your own judgement. The AI Tutor and our study materials are preparation aids, not official UCAT advice, admissions advice, medical advice or a substitute for the official exam materials.\n\nWe do not guarantee a particular UCAT score, exam result, university interview, admission offer or other outcome. Your results depend on many factors outside our control.",
  },
  {
    title: "Availability and changes",
    body: "We aim to keep the service available and working, but maintenance, errors, network issues and changes outside our control can interrupt access. We may update features and content to improve the app or keep it secure. If we make a material change that adversely affects paid access, we will give reasonable notice where practicable and provide any remedy required by law.",
  },
  {
    title: "Our responsibility to you",
    body: "We are responsible for foreseeable loss or damage caused by our breach of these terms or our failure to use reasonable care and skill. Loss is foreseeable if it is obvious it might happen or if both you and we knew it might happen when you agreed to these terms. We are not responsible for losses that were not foreseeable or for business losses where you use UCAT Genius as a consumer.\n\nNothing in these terms excludes or limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any liability that cannot lawfully be excluded. Your statutory rights, including rights under the Consumer Rights Act 2015, remain unaffected.",
  },
  {
    title: "Ending access",
    body: "You may stop using UCAT Genius and delete your account using the Delete Account option in the app’s Profile screen or by contacting us. We may suspend or end access if you seriously or repeatedly breach these terms, misuse the service, or if we are legally required to do so. Where reasonable, we will explain the reason and give you an opportunity to resolve a problem. Ending access does not remove any rights or remedies you have under consumer law. App-store subscriptions must be cancelled separately as described above.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms to reflect changes to the product, law or our business. We will update the date above and give reasonable notice of material changes. Changes will not remove rights you have already acquired for a purchase. If a change materially disadvantages you, contact us to discuss your options and any remedy available by law.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the law of England and Wales. If you live elsewhere in the UK, you may bring a claim in the courts of your part of the UK. If you live outside the UK, mandatory consumer protections in your country of residence may also apply.",
  },
  {
    title: "Contact us",
    body: "For support, billing questions or concerns about these terms, email admin@qarexlabs.co.uk.\n\nQarex Labs Ltd 71–75 Shelton Street Covent Garden London WC2H 9JQ United Kingdom",
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
              These terms explain how you may use UCAT Genius and how purchases, subscriptions and account access work.
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
