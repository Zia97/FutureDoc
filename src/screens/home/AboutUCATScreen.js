import React, { useRef, useState } from 'react';
import {
  Animated,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Polyline,
  Text as SvgText,
} from 'react-native-svg';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useTextSize } from '../../context/TextSizeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  RichIconBox,
  hexToRgba,
  premiumColors,
  useFadeSlide,
  useStaggeredFade,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';

const SECTIONS = [
  { id: 'what', label: 'What is the UCAT?', icon: 'book', accentKey: 'blue' },
  { id: 'format', label: 'Exam Format', icon: 'timer', accentKey: 'cyan' },
  { id: 'vr', label: UCAT_SECTIONS.VR.title, icon: UCAT_SECTIONS.VR.icon, accentKey: UCAT_SECTIONS.VR.accentKey },
  { id: 'dm', label: UCAT_SECTIONS.DM.title, icon: UCAT_SECTIONS.DM.icon, accentKey: UCAT_SECTIONS.DM.accentKey },
  { id: 'qr', label: UCAT_SECTIONS.QR.title, icon: UCAT_SECTIONS.QR.icon, accentKey: UCAT_SECTIONS.QR.accentKey },
  { id: 'sj', label: UCAT_SECTIONS.SJ.title, icon: UCAT_SECTIONS.SJ.icon, accentKey: UCAT_SECTIONS.SJ.accentKey },
  { id: 'scoring', label: 'Scoring', icon: 'chart', accentKey: 'amber' },
  { id: 'tips', label: 'Study Tips', icon: 'target', accentKey: 'cyan' },
  { id: 'dates', label: 'Exam Dates & Registration', icon: 'flag', accentKey: 'red' },
  { id: 'disclaimer', label: 'Disclaimer', icon: 'shield-heart', accentKey: 'mint' },
];

const FORMAT_ROWS = [
  ['Verbal Reasoning', '44', '22 min'],
  ['Decision Making', '35', '37 min'],
  ['Quantitative Reasoning', '36', '26 min'],
  ['Situational Judgement', '69', '26 min'],
];

const REGION = {
  uk: {
    subtitle: 'University Clinical Aptitude Test 2026 - United Kingdom',
    officialUrl: 'https://www.ucat.ac.uk',
    officialUrlLabel: 'Visit ucat.ac.uk',
    whatPara1:
      'The University Clinical Aptitude Test (UCAT) is a computer-based admissions test used by the majority of UK medical and dental schools. It is sat annually by candidates applying for undergraduate medicine and dentistry programmes, and is designed to assess mental abilities and behavioural attributes considered important for healthcare professionals.',
    whatPara2:
      'Unlike A-level examinations, the UCAT does not test scientific knowledge. Instead, it evaluates aptitude across four cognitive domains. The test is administered by Pearson VUE at authorised test centres and must be sat ahead of UCAS application deadlines.',
    whatInfoBox:
      'For the 2027 entry cycle, candidates sit the UCAT in 2026. Always check the official UCAT website for exact registration, booking, and testing dates.',
    formatIntro:
      'From 2026, the UCAT consists of four separately timed subtests delivered in a fixed order. Abstract Reasoning has been permanently removed from the exam. The total testing time is just under 2 hours, including instruction periods and administration.',
    sjScoreLine:
      'Situational Judgement is scored separately using a band system (Band 1-4) and is not included in the overall cognitive total score.',
    sjBands: [
      'Band 1 - performance similar to the highest-scoring candidates',
      'Band 2 - performance similar to the majority of candidates',
      'Band 3 - below the majority of candidates',
      'Band 4 - significantly below the majority of candidates',
    ],
    sjInfoBox:
      'SJ is scored separately (Band 1-4) and is not included in the overall UCAT scaled score. Many universities do consider it, so do not neglect it.',
    scoringUniversities:
      "Universities use UCAT scores differently. Some use score thresholds to shortlist for interview, others combine UCAT score with predicted A-level grades, and some use a points-based scoring system. Always check each university's individual admissions policy.",
    scoringStatsIntro:
      'The 2025 UCAT was sat by 41,354 candidates - the first cohort under the new 3-subtest format. Score data below reflects that sitting.',
    chartNote: '41,354 candidates | Mean 1,891 | Source: ucat.ac.uk',
    bellCurve: { mean: 1891, sd: 250, d1: 1580, d9: 2220 },
    statItems: [
      { label: 'VR Mean', value: '602' },
      { label: 'DM Mean', value: '628' },
      { label: 'QR Mean', value: '661' },
    ],
    sjScoreSection: 'band',
    sjGMCTip:
      "Read the GMC's Good Medical Practice for context on professional values and duties.",
    scoringThresholdNote:
      "Always check each university's updated thresholds for 2027 entry, as institutions are recalibrating their benchmarks for the new format.",
    dates: {
      cycles: [
        {
          heading: '2027 Entry - Test sat in 2026',
          rows: [
            { event: 'Registration Opens', date: '~March 2026' },
            { event: 'Testing Window', date: 'Mid-July to late September 2026' },
            { event: 'UCAS Application Deadline', date: '15 October 2026' },
          ],
        },
      ],
      disclaimer:
        'Registration open and close dates are approximate. The UCAS deadline is standard for UK medicine and dentistry applications. Always verify exact dates at ucat.ac.uk before registering.',
    },
    disclaimerBody1:
      'The information provided in this app is intended as a study aid and general guide only. Whilst every effort has been made to ensure accuracy, exam formats, dates, rules, and scoring methods are subject to change by UCAT.',
    disclaimerBody2:
      'Always refer to the official UCAT website for the most up-to-date and authoritative information before making any decisions related to your application.',
  },
  anz: {
    subtitle: 'University Clinical Aptitude Test 2026 - Australia & New Zealand',
    officialUrl: 'https://www.ucat.edu.au',
    officialUrlLabel: 'Visit ucat.edu.au',
    whatPara1:
      'The University Clinical Aptitude Test ANZ (UCAT ANZ) is a computer-based admissions test used by the majority of Australian and New Zealand medical and dental schools. It is sat annually by candidates applying for undergraduate medicine and dentistry programmes, and is designed to assess mental abilities and behavioural attributes considered important for healthcare professionals.',
    whatPara2:
      'Unlike ATAR examinations, the UCAT ANZ does not test academic knowledge. Instead, it evaluates aptitude across four cognitive domains. The test is administered by Pearson VUE at authorised test centres and must be sat ahead of application deadlines for Australian and New Zealand universities.',
    whatInfoBox:
      'For 2027 entry, the UCAT ANZ testing window runs from 1 July to 5 August 2026. Always check the official UCAT ANZ website for exact dates.',
    formatIntro:
      'From 2025, the UCAT ANZ consists of four separately timed subtests delivered in a fixed order. Abstract Reasoning has been permanently removed from the exam. The total testing time is just under 2 hours, including instruction periods and administration.',
    sjScoreLine:
      'Situational Judgement is scored on a separate 300-900 scale and is not included in the overall cognitive total score. Unlike the UK UCAT, UCAT ANZ does not use a band system for SJ.',
    sjBands: null,
    sjInfoBox:
      'SJ is scored on a separate 300-900 scale and is not included in the overall cognitive total. However, most Australian and New Zealand universities do consider the SJ score, so do not neglect it.',
    scoringUniversities:
      "Universities use UCAT ANZ scores differently. Some use score thresholds to shortlist for interview, others combine the UCAT ANZ score with ATAR or GPA, and some use a points-based scoring system. Application is via state and territory systems (SATAC, VTAC, UAC, QTAC, TISC) in Australia, or directly via university portals in New Zealand. Always check each university's individual admissions policy.",
    scoringStatsIntro:
      'The 2025 UCAT ANZ was sat by approximately 16,950 candidates - the first ANZ cohort under the new 3-subtest format. Score data below reflects that sitting.',
    chartNote: '~16,950 candidates | Mean 1,941 | Source: ucat.edu.au',
    bellCurve: { mean: 1941, sd: 285, d1: 1576, d9: 2310 },
    statItems: [
      { label: 'Mean Cognitive', value: '1,941' },
      { label: 'Mean SJ', value: '586' },
      { label: 'Top 10%', value: '2,310+' },
    ],
    sjScoreSection: 'numeric',
    sjGMCTip:
      "Familiarise yourself with AHPRA's Good Medical Practice: A Code of Conduct for all health practitioners - it informs the professional values tested in SJ.",
    scoringThresholdNote:
      "Always check each university's updated thresholds for 2027 entry. Medical schools in Australia and New Zealand are recalibrating their benchmarks for the new format.",
    dates: {
      cycles: [
        {
          heading: '2027 Entry - Test sat in 2026',
          rows: [
            { event: 'Registration Opens', date: '16 February 2026' },
            { event: 'Registration Closes', date: '11 May 2026' },
            { event: 'Test Booking Opens', date: '3 March 2026' },
            { event: 'Test Booking Closes', date: '15 May 2026' },
            { event: 'Testing Window', date: '1 July to 5 August 2026' },
          ],
        },
      ],
      disclaimer:
        'Dates are sourced from ucat.edu.au. Application deadlines vary by state and university - check SATAC, VTAC, UAC, QTAC, or TISC for your state. Always verify at ucat.edu.au before registering.',
    },
    disclaimerBody1:
      'The information provided in this app is intended as a study aid and general guide only. Whilst every effort has been made to ensure accuracy, exam formats, dates, rules, and scoring methods are subject to change by UCAT ANZ.',
    disclaimerBody2:
      'Always refer to the official UCAT ANZ website for the most up-to-date and authoritative information before making any decisions related to your application.',
  },
};

export default function AboutUCATScreen({ navigation }) {
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { multiplier } = useTextSize();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, isDark, multiplier);
  const [region, setRegion] = useState('uk');
  const r = REGION[region];

  const heroAnim = useFadeSlide(0, 14);
  const regionAnim = useFadeSlide(90, 14);
  const contentsAnim = useFadeSlide(150, 14);
  const sectionAnims = useStaggeredFade(SECTIONS.length, 230, 48);

  const getAccent = (accentKey) => colors[accentKey] ?? premiumColors[accentKey] ?? colors.blue;

  function scrollToSection(id) {
    const ref = sectionRefs.current[id];
    if (ref && scrollRef.current) {
      ref.measureLayout(
        scrollRef.current,
        (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(y - 18, 0), animated: true }),
        () => {},
      );
    }
  }

  function registerRef(id) {
    return (ref) => {
      sectionRefs.current[id] = ref;
    };
  }

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="About the UCAT" />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={heroAnim}>
          <LinearGradient
            colors={gradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { borderColor: colors.border, shadowColor: colors.blue }]}
          >
            <View pointerEvents="none" style={styles.heroArt}>
              <AboutHeroArt colors={colors} isDark={isDark} />
            </View>

            <View style={styles.heroHeader}>
              <RichIconBox icon="book" accent={colors.purple} size={64} iconSize={30} />
              <View style={styles.heroTitleBlock}>
                <Text style={[styles.heroEyebrow, { color: colors.cyan }]}>UCAT 2026 GUIDE</Text>
                <Text style={[styles.heroTitle, { color: colors.text }]}>About the UCAT</Text>
              </View>
            </View>

            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              {r.subtitle}
            </Text>

            <View style={styles.heroFacts}>
              <HeroFact icon="timer" label="Duration" value="<2 hrs" accent={colors.cyan} styles={styles} />
              <HeroFact icon="target" label="Subtests" value="4" accent={colors.blue} styles={styles} />
              <HeroFact icon="chart" label="Score" value="900-2700" accent={colors.amber} styles={styles} />
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.regionCard, regionAnim]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Region</Text>
          <View style={styles.tabRow}>
            <RegionTab
              label="UCAT UK"
              active={region === 'uk'}
              accent={colors.blue}
              styles={styles}
              colors={colors}
              onPress={() => setRegion('uk')}
            />
            <RegionTab
              label="UCAT ANZ"
              active={region === 'anz'}
              accent={colors.teal}
              styles={styles}
              colors={colors}
              onPress={() => setRegion('anz')}
            />
          </View>
        </Animated.View>

        <Animated.View style={contentsAnim}>
          <LinearGradient
            colors={gradients.glass}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.contentsCard, { borderColor: colors.border }]}
          >
            <View style={styles.contentsHeader}>
              <RichIconBox icon="list" accent={colors.cyan} size={44} iconSize={22} />
              <View style={styles.contentsTitleBlock}>
                <Text style={[styles.contentsTitle, { color: colors.text }]}>Contents</Text>
              </View>
            </View>

            {SECTIONS.map((section, index) => (
              <ContentsItem
                key={section.id}
                section={section}
                accent={getAccent(section.accentKey)}
                isLast={index === SECTIONS.length - 1}
                styles={styles}
                colors={colors}
                onPress={() => scrollToSection(section.id)}
              />
            ))}
          </LinearGradient>
        </Animated.View>

        <Animated.View style={sectionAnims[0]}>
          <View ref={registerRef('what')} style={styles.sectionAnchor}>
            <SectionCard
              title="What is the UCAT?"
              icon="book"
              accent={colors.blue}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>{r.whatPara1}</Text>
              <Text style={styles.body}>{r.whatPara2}</Text>
              <InfoBox text={r.whatInfoBox} icon="pulse" accent={colors.cyan} styles={styles} />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[1]}>
          <View ref={registerRef('format')} style={styles.sectionAnchor}>
            <SectionCard
              title="Exam Format"
              icon="timer"
              accent={colors.cyan}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>{r.formatIntro}</Text>
              <DataTable
                headers={['Subtest', 'Items', 'Time']}
                rows={FORMAT_ROWS}
                styles={styles}
              />
              <Text style={styles.body}>
                A short one-minute break is provided between each subtest. Candidates may use an
                on-screen calculator during both Quantitative Reasoning and Decision Making. No
                physical notes or materials are permitted in the testing room.
              </Text>
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[2]}>
          <View ref={registerRef('vr')} style={styles.sectionAnchor}>
            <SectionCard
              title={UCAT_SECTIONS.VR.title}
              icon={UCAT_SECTIONS.VR.icon}
              accent={colors[UCAT_SECTIONS.VR.accentKey]}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <SectionBadge label={UCAT_SECTIONS.VR.shortLabel} color={colors[UCAT_SECTIONS.VR.accentKey]} styles={styles} />
              <StatRow
                items={[
                  { label: 'Questions', value: '44' },
                  { label: 'Time', value: '22 min' },
                  { label: 'Per question', value: '~30 sec' },
                ]}
                accent={colors[UCAT_SECTIONS.VR.accentKey]}
                styles={styles}
              />
              <Text style={styles.body}>
                Verbal Reasoning assesses your ability to read and critically evaluate written
                information. You are presented with 11 passages of text, each followed by four
                questions.
              </Text>
              <Text style={styles.subheading}>Question Types</Text>
              <BulletList
                items={[
                  "True / False / Can't Tell - decide whether a statement is supported, contradicted, or cannot be determined from the passage.",
                  'Free text questions - select the best answer from four options based on the passage content.',
                ]}
                accent={colors.blue}
                styles={styles}
              />
              <Text style={styles.subheading}>Key Skills</Text>
              <BulletList
                items={[
                  'Reading comprehension under time pressure',
                  'Distinguishing between what is stated and what is implied',
                  'Avoiding assumptions based on prior knowledge',
                  'Identifying the logical conclusion supported by the text',
                ]}
                accent={colors.blue}
                styles={styles}
              />
              <InfoBox
                text="Do not use outside knowledge. Base every answer solely on the passage provided."
                icon="notes"
                accent={colors.blue}
                styles={styles}
              />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[3]}>
          <View ref={registerRef('dm')} style={styles.sectionAnchor}>
            <SectionCard
              title={UCAT_SECTIONS.DM.title}
              icon={UCAT_SECTIONS.DM.icon}
              accent={colors[UCAT_SECTIONS.DM.accentKey]}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <SectionBadge label={UCAT_SECTIONS.DM.shortLabel} color={colors[UCAT_SECTIONS.DM.accentKey]} styles={styles} />
              <StatRow
                items={[
                  { label: 'Questions', value: '35' },
                  { label: 'Time', value: '37 min' },
                  { label: 'Per question', value: '~63 sec' },
                ]}
                accent={colors[UCAT_SECTIONS.DM.accentKey]}
                styles={styles}
              />
              <Text style={styles.body}>
                Decision Making tests your ability to apply logic to reach sound decisions from
                complex information. Questions may draw on text, statistics, charts, or logical
                puzzles.
              </Text>
              <Text style={styles.subheading}>Question Types</Text>
              <BulletList
                items={[
                  'Logical puzzles - deducing conclusions from a set of given premises.',
                  'Syllogisms - evaluating whether a conclusion necessarily follows.',
                  'Interpreting information - drawing inferences from data, charts, or diagrams.',
                  'Recognising assumptions - identifying assumptions underlying an argument.',
                  'Venn diagrams - using set logic to answer probability-style questions.',
                ]}
                accent={colors.teal}
                styles={styles}
              />
              <Text style={styles.subheading}>Scoring & Calculator</Text>
              <Text style={styles.body}>
                Single-answer questions are worth one mark. Multi-statement questions are worth
                two marks with one mark awarded for partial credit. An on-screen calculator is
                available throughout this subtest.
              </Text>
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[4]}>
          <View ref={registerRef('qr')} style={styles.sectionAnchor}>
            <SectionCard
              title={UCAT_SECTIONS.QR.title}
              icon={UCAT_SECTIONS.QR.icon}
              accent={colors[UCAT_SECTIONS.QR.accentKey]}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <SectionBadge label={UCAT_SECTIONS.QR.shortLabel} color={colors[UCAT_SECTIONS.QR.accentKey]} styles={styles} />
              <StatRow
                items={[
                  { label: 'Questions', value: '36' },
                  { label: 'Time', value: '26 min' },
                  { label: 'Per question', value: '~43 sec' },
                ]}
                accent={colors[UCAT_SECTIONS.QR.accentKey]}
                styles={styles}
              />
              <Text style={styles.body}>
                Quantitative Reasoning assesses your ability to use numerical and mathematical
                skills to solve problems. Questions are presented alongside tables, charts, or
                graphs and require interpretation and calculation.
              </Text>
              <Text style={styles.subheading}>Topics Covered</Text>
              <BulletList
                items={[
                  'Percentages, ratios, and fractions',
                  'Rates, speed, distance, and time',
                  'Currency conversions and financial calculations',
                  'Data interpretation from tables and graphs',
                  'Area, volume, and basic geometry',
                ]}
                accent={colors[UCAT_SECTIONS.QR.accentKey]}
                styles={styles}
              />
              <Text style={styles.subheading}>Calculator Use</Text>
              <Text style={styles.body}>
                An on-screen calculator is available during this subtest and also in Decision
                Making. The key skill is knowing which calculation to perform efficiently within
                the tight time limit.
              </Text>
              <InfoBox
                text="Practice reading tables and graphs quickly. The bottleneck is usually identifying the right numbers, not the calculation itself."
                icon="calculator"
                accent={colors.purple}
                styles={styles}
              />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[5]}>
          <View ref={registerRef('sj')} style={styles.sectionAnchor}>
            <SectionCard
              title={UCAT_SECTIONS.SJ.title}
              icon={UCAT_SECTIONS.SJ.icon}
              accent={colors[UCAT_SECTIONS.SJ.accentKey]}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <SectionBadge label={UCAT_SECTIONS.SJ.shortLabel} color={colors[UCAT_SECTIONS.SJ.accentKey]} styles={styles} />
              <StatRow
                items={[
                  { label: 'Questions', value: '69' },
                  { label: 'Time', value: '26 min' },
                  { label: 'Per question', value: '~23 sec' },
                ]}
                accent={colors[UCAT_SECTIONS.SJ.accentKey]}
                styles={styles}
              />
              <Text style={styles.body}>
                Situational Judgement assesses your ability to understand real-world situations
                and identify appropriate behaviour in a clinical or professional context. It is
                co-developed with practising clinicians and tested against consensus responses
                from senior doctors.
              </Text>
              <Text style={styles.body}>{r.sjScoreLine}</Text>
              <Text style={styles.subheading}>Format</Text>
              <Text style={styles.body}>
                You are presented with scenarios involving a medical student, junior doctor, or
                healthcare professional, followed by a series of possible responses.
              </Text>
              <BulletList
                items={[
                  'Appropriateness questions - rate each response from very appropriate to very inappropriate.',
                  'Importance questions - rate how important each action is from very important to not important at all.',
                ]}
                accent={colors[UCAT_SECTIONS.SJ.accentKey]}
                styles={styles}
              />
              <Text style={styles.subheading}>Key Themes</Text>
              <BulletList
                items={[
                  'Patient safety and escalation',
                  'Professional integrity and honesty',
                  'Team communication and hierarchy',
                  'Confidentiality and consent',
                  'Personal wellbeing and limitations',
                ]}
                accent={colors[UCAT_SECTIONS.SJ.accentKey]}
                styles={styles}
              />
              <InfoBox text={r.sjInfoBox} icon="shield-heart" accent={colors[UCAT_SECTIONS.SJ.accentKey]} styles={styles} />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[6]}>
          <View ref={registerRef('scoring')} style={styles.sectionAnchor}>
            <SectionCard
              title="Scoring"
              icon="chart"
              accent={colors.amber}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>
                Each of the three cognitive subtests (VR, DM, QR) is scored on a scale of
                300-900. Your total {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} score is the sum of
                these three scaled scores, giving a range of 900-2700.
              </Text>
              <HighlightBox
                label="Total Cognitive Score Range"
                value="900-2700"
                accent={colors.amber}
                styles={styles}
              />

              {region === 'uk' ? (
                <>
                  <Text style={styles.body}>
                    The Situational Judgement subtest is scored separately in Bands:
                  </Text>
                  <BulletList items={r.sjBands} accent={colors.amber} styles={styles} />
                </>
              ) : (
                <Text style={styles.body}>
                  The Situational Judgement subtest is scored separately on a 300-900 scale (not
                  bands). The 2025 ANZ mean SJ score was 586.
                </Text>
              )}

              <Text style={styles.body}>{r.scoringUniversities}</Text>
              <Text style={styles.subheading}>
                Average Scores - 2025 {region === 'uk' ? 'Results' : 'ANZ Results'}
              </Text>
              <Text style={styles.body}>{r.scoringStatsIntro}</Text>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Total Cognitive Score Distribution (2025)</Text>
                <BellCurveChart
                  data={r.bellCurve}
                  colors={colors}
                  accent={colors.amber}
                  windowWidth={width}
                />
                <Text style={styles.chartNote}>{r.chartNote}</Text>
              </View>
              <StatRow items={r.statItems} accent={colors.amber} styles={styles} />

              {region === 'uk' && (
                <>
                  <Text style={styles.subheading}>SJ Band Distribution - 2025</Text>
                  <SJBandBar styles={styles} colors={colors} />
                </>
              )}

              <Text style={styles.body}>{r.scoringThresholdNote}</Text>

              <View style={styles.tipDivider} />
              <Text style={styles.subheading}>How UCAT Genius estimates your score</Text>
              <Text style={styles.body}>
                The real {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} does not use a simple formula.
                Pearson VUE uses Item Response Theory (IRT), specifically the Rasch model since
                2011, with item-level calibration. Each test form has its own raw to scaled
                conversion table that is generated before the testing window opens.
              </Text>
              <Text style={styles.body}>
                That means no third-party app, including this one, can replicate UCAT scoring
                exactly. We do the next best thing:
              </Text>
              <BulletList
                items={[
                  'Verbal Reasoning uses piecewise-linear interpolation against community-derived raw to scaled anchor points, validated against the 2025 official deciles published by the UCAT Consortium.',
                  "Decision Making and Quantitative Reasoning use a z-score transformation anchored at each section's 2025 mean and standard deviation (Pearson VUE 2023 technical report).",
                  'Situational Judgement is reported as a UK Band (1-4) using community-derived approximate thresholds. Official band boundaries are reset annually and not published before each cycle.',
                ]}
                accent={colors.amber}
                styles={styles}
              />
              <Text style={styles.body}>
                Each estimated scaled score carries a typical uncertainty of about +/-40 points.
                You will see this margin displayed alongside every scaled score in the app, for
                example "620 +/-40". Treat the numbers as a rough indicator of where your
                performance sits, not a prediction of your actual UCAT result.
              </Text>
              <InfoBox
                text="Practice scores tend to under-estimate real UCAT performance. Use these scores to track your own progress over time, not to predict your final result."
                icon="chart"
                accent={colors.amber}
                styles={styles}
              />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[7]}>
          <View ref={registerRef('tips')} style={styles.sectionAnchor}>
            <SectionCard
              title="Study Tips"
              icon="target"
              accent={colors.cyan}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>
                The {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} is a skills test, not a knowledge
                test. Consistent, timed practice is the most effective preparation strategy.
              </Text>

              <Text style={styles.subheading}>General Strategy</Text>
              <BulletList
                items={[
                  'Start 8-12 weeks before your test date and build up to full timed mocks.',
                  'Practice under exam conditions from the beginning - time pressure is the primary challenge.',
                  'After each session, review every wrong answer to understand why, not just what the right answer was.',
                  'Rotate focus across all subtests weekly - do not neglect SJ.',
                  `Use the official ${region === 'uk' ? 'UCAT' : 'UCAT ANZ'} practice platform (Pearson VUE) to familiarise yourself with the interface.`,
                ]}
                accent={colors.cyan}
                styles={styles}
              />

              <View style={styles.tipDivider} />
              <SectionBadge label="VR" color={colors.blue} styles={styles} />
              <Text style={styles.subheading}>Verbal Reasoning</Text>
              <BulletList
                items={[
                  'Base every answer solely on the passage - prior knowledge must be ignored completely.',
                  "For True/False/Can't Tell: locate the exact sentence in the passage before committing to an answer.",
                  '"Can\'t Tell" means the passage neither confirms nor contradicts - not that you are unsure.',
                  'If a question is taking more than 30 seconds, flag it and move on - return at the end.',
                  'Skim the questions before reading the passage so you know what to look for.',
                ]}
                accent={colors.blue}
                styles={styles}
              />

              <View style={styles.tipDivider} />
              <SectionBadge label="DM" color={colors.teal} styles={styles} />
              <Text style={styles.subheading}>Decision Making</Text>
              <BulletList
                items={[
                  'Use the whiteboard provided to sketch Venn diagrams for set-logic questions.',
                  'For syllogisms: ask whether the conclusion must be true - not whether it could be true.',
                  'Recognise assumption questions require you to find what the argument depends on being true.',
                  'The calculator is available - use it for any question involving numbers or probability.',
                  'Multi-statement questions award partial marks - always attempt every statement.',
                ]}
                accent={colors.teal}
                styles={styles}
              />

              <View style={styles.tipDivider} />
              <SectionBadge label="QR" color={colors.purple} styles={styles} />
              <Text style={styles.subheading}>Quantitative Reasoning</Text>
              <BulletList
                items={[
                  'Read the question before examining the data - identify exactly which numbers you need.',
                  `Practice specifically with the on-screen ${region === 'uk' ? 'UCAT' : 'UCAT ANZ'} calculator; it behaves differently to a standard one.`,
                  'Plan your calculation before picking up the calculator - efficiency beats speed.',
                  'Most questions test data interpretation, not complex maths. GCSE-level arithmetic is sufficient.',
                  'Watch for unit changes (e.g. km to m, monthly to annual) - these are common traps.',
                ]}
                accent={colors.purple}
                styles={styles}
              />

              <View style={styles.tipDivider} />
              <SectionBadge label="SJ" color={colors.mint} styles={styles} />
              <Text style={styles.subheading}>Situational Judgement</Text>
              <BulletList
                items={[
                  'Patient safety is always the overriding priority - escalate anything that puts a patient at risk.',
                  'Never act outside your level of competence; always seek senior support when in doubt.',
                  r.sjGMCTip,
                  'Think about what a senior, experienced doctor would consider ideal - not just acceptable.',
                  'SJ uses partial marking - a response close to the correct answer still earns credit.',
                ]}
                accent={colors.mint}
                styles={styles}
              />

              <View style={styles.tipDivider} />
              <Text style={styles.subheading}>Test Day</Text>
              <BulletList
                items={[
                  'Arrive at the test centre at least 15 minutes early - late arrival means no entry.',
                  'You will be given a whiteboard and marker; use it freely for working.',
                  'Use the flag feature to mark uncertain questions and revisit them before time expires.',
                  'Check your remaining time every 5-6 questions to maintain pace.',
                  'Each subtest is independently timed - unused time in one does not carry over to the next.',
                ]}
                accent={colors.cyan}
                styles={styles}
              />
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[8]}>
          <View ref={registerRef('dates')} style={styles.sectionAnchor}>
            <SectionCard
              title="Exam Dates & Registration"
              icon="flag"
              accent={colors.red}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>
                Key dates for each {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} testing cycle are
                listed below. Registration and test booking must be completed before the testing
                window opens.
              </Text>
              {r.dates.cycles.map((cycle, cycleIndex) => (
                <View key={cycle.heading} style={cycleIndex > 0 && styles.datesBlockSpacing}>
                  <Text style={styles.datesCycleHeading}>{cycle.heading}</Text>
                  <DataTable
                    headers={['Event', 'Date']}
                    rows={cycle.rows.map((row) => [row.event, row.date])}
                    wideFirstColumn
                    styles={styles}
                  />
                </View>
              ))}
            </SectionCard>
          </View>
        </Animated.View>

        <Animated.View style={sectionAnims[9]}>
          <View ref={registerRef('disclaimer')} style={styles.sectionAnchor}>
            <SectionCard
              title="Disclaimer"
              icon="shield-heart"
              accent={colors.mint}
              styles={styles}
              colors={colors}
              isDark={isDark}
            >
              <Text style={styles.body}>{r.disclaimerBody1}</Text>
              <Text style={styles.body}>{r.disclaimerBody2}</Text>
              <Text style={styles.body}>{r.dates.disclaimer}</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(r.officialUrl)}
                activeOpacity={0.84}
                accessibilityRole="button"
                accessibilityLabel={r.officialUrlLabel}
                style={styles.officialLinkTouch}
              >
                <LinearGradient
                  colors={[hexToRgba(colors.mint, 0.95), hexToRgba(colors.blue, 0.95)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.officialLink}
                >
                  <Text style={styles.officialLinkText}>{r.officialUrlLabel}</Text>
                  <PremiumIcon name="chevron-right" size={21} color="#ffffff" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            </SectionCard>
          </View>
        </Animated.View>
      </ScrollView>
    </PremiumScreen>
  );
}

function AboutHeroArt({ colors, isDark }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 220 260" preserveAspectRatio="xMidYMid meet">
      <Circle cx="142" cy="108" r="84" stroke={colors.blue} strokeWidth="2" opacity={isDark ? 0.24 : 0.18} fill="none" />
      <Circle cx="142" cy="108" r="56" stroke={colors.cyan} strokeWidth="1.4" opacity={isDark ? 0.16 : 0.14} fill="none" />
      <Path
        d="M70 112c22-42 62-62 118-55"
        stroke={colors.blue}
        strokeWidth="4"
        strokeLinecap="round"
        opacity={isDark ? 0.28 : 0.2}
        fill="none"
      />
      <Polyline
        points="15 150 42 150 52 130 66 174 80 144 92 150 126 150"
        stroke={colors.cyan}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isDark ? 0.2 : 0.16}
      />
      <G opacity={isDark ? 0.18 : 0.16} stroke={colors.purple} strokeWidth="1.5" fill="none">
        <Path d="M72 67c-10-8-7-24 7-25 4-11 20-10 25-1 11-1 18 10 14 20 9 6 5 21-7 22H83c-4 0-8-5-11-16Z" />
        <Path d="M88 42v40M103 43v39M75 58h40M80 72h32" />
      </G>
      <G opacity={isDark ? 0.16 : 0.14} stroke={colors.mint} strokeWidth="1.6" strokeLinecap="round">
        <Line x1="170" y1="26" x2="170" y2="47" />
        <Line x1="159.5" y1="36.5" x2="180.5" y2="36.5" />
        <Line x1="178" y1="198" x2="178" y2="218" />
        <Line x1="168" y1="208" x2="188" y2="208" />
      </G>
    </Svg>
  );
}

function HeroFact({ icon, label, value, accent, styles }) {
  return (
    <View style={[styles.heroFact, { borderColor: hexToRgba(accent, 0.26), backgroundColor: hexToRgba(accent, 0.08) }]}>
      <PremiumIcon name={icon} size={15} color={accent} strokeWidth={2.3} />
      <View style={styles.heroFactCopy}>
        <Text
          style={[styles.heroFactValue, { color: accent }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {value}
        </Text>
        <Text style={styles.heroFactLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function RegionTab({ label, active, accent, onPress, styles, colors }) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.tab, active && { borderColor: hexToRgba(accent, 0.44) }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {active ? (
        <LinearGradient
          pointerEvents="none"
          colors={[hexToRgba(accent, 0.26), hexToRgba(colors.blue, 0.12)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <Text style={[styles.tabText, { color: active ? colors.text : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ContentsItem({ section, accent, isLast, onPress, styles, colors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      style={[styles.contentsItem, isLast && styles.contentsItemLast]}
      accessibilityRole="button"
    >
      <View style={[styles.contentsIcon, { borderColor: hexToRgba(accent, 0.28), backgroundColor: hexToRgba(accent, 0.1) }]}>
        <PremiumIcon name={section.icon} size={18} color={accent} strokeWidth={2.4} />
      </View>
      <Text style={[styles.contentsText, { color: colors.text }]} numberOfLines={2}>
        {section.label}
      </Text>
      <View style={[styles.contentsChevron, { borderColor: hexToRgba(accent, 0.24) }]}>
        <PremiumIcon name="chevron-right" size={18} color={accent} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

function SectionCard({ title, icon, accent, children, styles, colors, isDark }) {
  return (
    <LinearGradient
      colors={[
        isDark ? 'rgba(18, 35, 64, 0.96)' : 'rgba(255, 255, 255, 0.98)',
        isDark ? 'rgba(8, 22, 43, 0.96)' : 'rgba(246, 250, 255, 0.98)',
        isDark ? 'rgba(4, 10, 23, 0.98)' : 'rgba(235, 243, 255, 0.98)',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.sectionCard,
        {
          borderColor: hexToRgba(accent, isDark ? 0.36 : 0.24),
          shadowColor: accent,
        },
      ]}
    >
      <View style={[styles.sectionStripe, { backgroundColor: accent, shadowColor: accent }]} />
      <View style={styles.sectionHeader}>
        <RichIconBox icon={icon} accent={accent} size={48} iconSize={24} />
        <View style={styles.sectionTitleBlock}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
      </View>
      {children}
    </LinearGradient>
  );
}

function SectionBadge({ label, color, styles }) {
  return (
    <View style={[styles.badge, { backgroundColor: hexToRgba(color, 0.1), borderColor: hexToRgba(color, 0.42) }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatRow({ items, accent, styles }) {
  return (
    <View style={styles.statRow}>
      {items.map((item) => (
        <View
          key={`${item.label}-${item.value}`}
          style={[styles.statItem, { borderColor: hexToRgba(accent, 0.26), backgroundColor: hexToRgba(accent, 0.08) }]}
        >
          <Text style={[styles.statValue, { color: accent }]}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function BulletList({ items, accent, styles }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.bulletItem}>
          <View style={[styles.bulletDot, { backgroundColor: accent }]} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoBox({ text, icon, accent, styles }) {
  return (
    <View style={[styles.infoBox, { borderColor: hexToRgba(accent, 0.34), backgroundColor: hexToRgba(accent, 0.1) }]}>
      <PremiumIcon name={icon} size={22} color={accent} strokeWidth={2.3} />
      <Text style={[styles.infoBoxText, { color: accent }]}>{text}</Text>
    </View>
  );
}

function HighlightBox({ label, value, accent, styles }) {
  return (
    <LinearGradient
      colors={[hexToRgba(accent, 0.22), hexToRgba(accent, 0.08)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.highlightBox, { borderColor: hexToRgba(accent, 0.38) }]}
    >
      <Text style={styles.highlightLabel}>{label}</Text>
      <Text style={[styles.highlightValue, { color: accent }]}>{value}</Text>
    </LinearGradient>
  );
}

function DataTable({ headers, rows, wideFirstColumn = false, styles }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {headers.map((header, index) => (
          <Text
            key={header}
            style={[styles.tableCell, styles.tableHeaderText, (wideFirstColumn || index === 0) && styles.tableCellWide]}
          >
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={`${row[0]}-${rowIndex}`} style={[styles.tableRow, rowIndex % 2 === 1 && styles.tableRowAlt]}>
          {row.map((cell, cellIndex) => (
            <Text
              key={`${cell}-${cellIndex}`}
              style={[styles.tableCell, (wideFirstColumn || cellIndex === 0) && styles.tableCellWide]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function BellCurveChart({ data, colors, accent, windowWidth }) {
  const { mean: MEAN, sd: SD, d1: D1, d9: D9 } = data;
  const SCORE_MIN = 900;
  const SCORE_MAX = 2700;

  const W = Math.max(190, Math.min(520, windowWidth - 112));
  const H = 190;
  const pL = 8;
  const pR = 8;
  const pT = 18;
  const pB = 52;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const baseY = pT + cH;

  const pdf = (x) => {
    const z = (x - MEAN) / SD;
    return Math.exp(-0.5 * z * z);
  };
  const sx = (score) => pL + ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * cW;
  const sy = (p) => pT + (1 - p) * cH;

  const pts = [];
  for (let s = SCORE_MIN; s <= SCORE_MAX; s += 12) {
    pts.push([sx(s), sy(pdf(s))]);
  }

  const toPath = (points) =>
    points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const fullCurve = toPath(pts);
  const fullFill = `${fullCurve} L${sx(SCORE_MAX).toFixed(1)},${baseY} L${sx(SCORE_MIN).toFixed(1)},${baseY} Z`;

  const bot10Pts = pts.filter(([x]) => x <= sx(D1) + 1);
  const bot10Fill = bot10Pts.length > 1
    ? `${toPath(bot10Pts)} L${sx(D1).toFixed(1)},${baseY} L${sx(SCORE_MIN).toFixed(1)},${baseY} Z`
    : null;

  const top10Pts = pts.filter(([x]) => x >= sx(D9) - 1);
  const top10Fill = top10Pts.length > 1
    ? `${toPath(top10Pts)} L${sx(SCORE_MAX).toFixed(1)},${baseY} L${sx(D9).toFixed(1)},${baseY} Z`
    : null;

  const markers = [
    { score: D1, label: '10th', sub: String(D1), color: colors.red },
    { score: MEAN, label: 'Mean', sub: String(MEAN), color: colors.text },
    { score: D9, label: '90th', sub: String(D9), color: colors.mint },
  ];

  return (
    <Svg width={W} height={H}>
      <Path d={fullFill} fill={hexToRgba(accent, 0.14)} />
      {bot10Fill ? <Path d={bot10Fill} fill={hexToRgba(colors.red, 0.18)} /> : null}
      {top10Fill ? <Path d={top10Fill} fill={hexToRgba(colors.mint, 0.18)} /> : null}
      <Path d={fullCurve} stroke={accent} strokeWidth="2.6" fill="none" />
      <Line x1={pL} y1={baseY} x2={W - pR} y2={baseY} stroke={colors.border} strokeWidth="1" />
      {markers.map(({ score, label, sub, color }) => (
        <G key={score}>
          <Line
            x1={sx(score)}
            y1={pT + 2}
            x2={sx(score)}
            y2={baseY}
            stroke={color}
            strokeWidth="1.4"
            strokeDasharray="4,3"
            opacity="0.82"
          />
          <SvgText x={sx(score)} y={baseY + 16} fontSize="10" fill={color} textAnchor="middle" fontWeight="700">
            {label}
          </SvgText>
          <SvgText x={sx(score)} y={baseY + 30} fontSize="9" fill={color} textAnchor="middle" opacity="0.82">
            {sub}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function SJBandBar({ styles, colors }) {
  const bands = [
    { label: 'Band 1', pct: 21, color: colors.mint },
    { label: 'Band 2', pct: 39, color: colors.blue },
    { label: 'Band 3', pct: 29, color: colors.amber },
    { label: 'Band 4', pct: 10, color: colors.red },
  ];

  return (
    <View style={styles.bandBlock}>
      <View style={styles.bandBar}>
        {bands.map((band) => (
          <View
            key={band.label}
            style={[styles.bandSegment, { flex: band.pct, backgroundColor: hexToRgba(band.color, 0.86) }]}
          >
            <Text style={styles.bandPercent}>{band.pct}%</Text>
          </View>
        ))}
      </View>
      <View style={styles.bandLegend}>
        {bands.map((band) => (
          <View key={band.label} style={styles.bandLegendItem}>
            <View style={[styles.bandLegendDot, { backgroundColor: band.color }]} />
            <Text style={styles.bandLegendText}>{band.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(colors, isDark, textMultiplier = 1) {
  const scale = (n) => Math.round(n * textMultiplier);
  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 38,
    },
    heroCard: {
      borderRadius: 28,
      borderWidth: 1,
      overflow: 'hidden',
      padding: 22,
      marginBottom: 18,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: Platform.OS === 'ios' ? 0.18 : 0,
      shadowRadius: 30,
      elevation: 0,
    },
    heroArt: {
      position: 'absolute',
      right: -24,
      top: 18,
      width: 220,
      height: 260,
      opacity: 0.82,
    },
    heroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingRight: 34,
    },
    heroTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    heroEyebrow: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '900',
    },
    heroTitle: {
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
      marginTop: 2,
    },
    heroSubtitle: {
      fontSize: 15,
      lineHeight: 23,
      marginTop: 18,
      maxWidth: 295,
    },
    heroFacts: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: 6,
      marginTop: 22,
      alignItems: 'stretch',
    },
    heroFact: {
      flex: 1,
      minWidth: 0,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    heroFactCopy: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
    },
    heroFactValue: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '900',
    },
    heroFactLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      lineHeight: 13,
      fontWeight: '700',
      marginTop: 1,
    },
    regionCard: {
      marginBottom: 16,
    },
    cardLabel: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '900',
      marginBottom: 8,
    },
    tabRow: {
      flexDirection: 'row',
      gap: 10,
    },
    tab: {
      flex: 1,
      minHeight: 46,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(8, 17, 33, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
    tabText: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '900',
    },
    contentsCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      marginBottom: 20,
      overflow: 'hidden',
    },
    contentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
    },
    contentsTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    contentsTitle: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '900',
    },
    contentsSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 2,
    },
    contentsItem: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contentsItemLast: {
      borderBottomWidth: 0,
    },
    contentsIcon: {
      width: 34,
      height: 34,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    contentsText: {
      flex: 1,
      minWidth: 0,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: '800',
    },
    contentsChevron: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      backgroundColor: isDark ? 'rgba(8, 15, 30, 0.45)' : 'rgba(255, 255, 255, 0.72)',
    },
    sectionAnchor: {
      marginBottom: 18,
    },
    sectionCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 18,
      overflow: 'hidden',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: Platform.OS === 'ios' ? 0.16 : 0,
      shadowRadius: 24,
      elevation: 0,
    },
    sectionStripe: {
      position: 'absolute',
      left: 0,
      top: 22,
      bottom: 22,
      width: 4,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: Platform.OS === 'ios' ? 0.7 : 0,
      shadowRadius: 12,
      elevation: 0,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      marginBottom: 16,
    },
    sectionTitleBlock: {
      flex: 1,
      minWidth: 0,
    },
    sectionTitle: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '900',
    },
    subheading: {
      color: colors.text,
      fontSize: scale(16),
      lineHeight: scale(22),
      fontWeight: '900',
      marginTop: 14,
      marginBottom: 8,
    },
    body: {
      color: colors.textSecondary,
      fontSize: scale(15),
      lineHeight: scale(24),
      marginBottom: 10,
    },
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 11,
      paddingVertical: 5,
      marginBottom: 12,
    },
    badgeText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '900',
    },
    statRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    statItem: {
      flex: 1,
      minWidth: 0,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: '900',
      textAlign: 'center',
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      marginTop: 3,
      textAlign: 'center',
    },
    bulletList: {
      marginBottom: 8,
      gap: 8,
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingRight: 4,
    },
    bulletDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 8,
      flexShrink: 0,
    },
    bulletText: {
      flex: 1,
      minWidth: 0,
      color: colors.text,
      fontSize: scale(14),
      lineHeight: scale(22),
    },
    infoBox: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 14,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
    },
    infoBoxText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '700',
    },
    table: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? 'rgba(5, 12, 26, 0.46)' : 'rgba(255, 255, 255, 0.66)',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(61, 139, 255, 0.12)' : 'rgba(37, 99, 235, 0.1)',
      paddingVertical: 11,
      paddingHorizontal: 12,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 11,
      paddingHorizontal: 12,
      backgroundColor: isDark ? 'rgba(8, 18, 36, 0.55)' : 'rgba(255, 255, 255, 0.56)',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tableRowAlt: {
      backgroundColor: isDark ? 'rgba(11, 27, 52, 0.55)' : 'rgba(239, 246, 255, 0.72)',
    },
    tableCell: {
      flex: 1,
      minWidth: 0,
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
      paddingRight: 8,
    },
    tableCellWide: {
      flex: 1.75,
    },
    tableHeaderText: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
    },
    highlightBox: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 18,
      alignItems: 'center',
      marginVertical: 14,
    },
    highlightLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '900',
      marginBottom: 6,
      textAlign: 'center',
    },
    highlightValue: {
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      textAlign: 'center',
    },
    tipDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    chartCard: {
      alignItems: 'center',
      borderRadius: 18,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? 'rgba(5, 12, 26, 0.5)' : 'rgba(255, 255, 255, 0.68)',
    },
    chartTitle: {
      alignSelf: 'flex-start',
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '900',
      marginBottom: 8,
    },
    chartNote: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 15,
      textAlign: 'center',
      marginTop: 6,
      fontWeight: '700',
    },
    bandBlock: {
      marginBottom: 14,
    },
    bandBar: {
      flexDirection: 'row',
      borderRadius: 14,
      overflow: 'hidden',
      height: 34,
      marginBottom: 11,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bandSegment: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    bandPercent: {
      color: '#ffffff',
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '900',
    },
    bandLegend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    bandLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    bandLegendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    bandLegendText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '700',
    },
    datesBlockSpacing: {
      marginTop: 14,
    },
    datesCycleHeading: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '900',
      marginBottom: 10,
    },
    officialLinkTouch: {
      marginTop: 8,
      borderRadius: 17,
      overflow: 'hidden',
      alignSelf: 'stretch',
    },
    officialLink: {
      minHeight: 50,
      borderRadius: 17,
      paddingHorizontal: 16,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    officialLinkText: {
      color: '#ffffff',
      fontWeight: '900',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
  });
}
