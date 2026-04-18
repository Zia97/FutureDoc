import { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const SECTIONS = [
  { id: 'what', label: 'What is the UCAT?' },
  { id: 'format', label: 'Exam Format' },
  { id: 'vr', label: 'Verbal Reasoning' },
  { id: 'dm', label: 'Decision Making' },
  { id: 'qr', label: 'Quantitative Reasoning' },
  { id: 'sj', label: 'Situational Judgement' },
  { id: 'scoring', label: 'Scoring' },
  { id: 'tips', label: 'Study Tips' },
  { id: 'dates', label: 'Exam Dates & Registration' },
  { id: 'disclaimer', label: 'Disclaimer' },
];

const REGION = {
  uk: {
    subtitle: 'University Clinical Aptitude Test 2026 — United Kingdom',
    officialUrl: 'https://www.ucat.ac.uk',
    officialUrlLabel: 'Visit ucat.ac.uk (Official Website)',
    whatPara1:
      'The University Clinical Aptitude Test (UCAT) is a computer-based admissions test used by the majority of UK medical and dental schools. It is sat annually by candidates applying for undergraduate medicine and dentistry programmes, and is designed to assess a range of mental abilities and behavioural attributes considered important for healthcare professionals.',
    whatPara2:
      'Unlike A-level examinations, the UCAT does not test scientific knowledge. Instead, it evaluates aptitude across four cognitive domains. The test is administered by Pearson VUE at authorised test centres and must be sat between July and September each year, ahead of UCAS application deadlines.',
    whatInfoBox:
      'For 2026 entry, the UCAT testing window runs from mid-July to the end of September 2025. Always check the official UCAT website for exact dates.',
    formatIntro:
      'From 2026, the UCAT consists of four separately timed subtests delivered in a fixed order. Abstract Reasoning has been permanently removed from the exam. The total testing time is just under 2 hours, including instruction periods and administration.',
    sjScoreLine:
      'Situational Judgement is scored separately using a band system (Band 1–4) and is not included in the overall cognitive total score.',
    sjBands: [
      'Band 1 — performance similar to the highest-scoring candidates',
      'Band 2 — performance similar to the majority of candidates',
      'Band 3 — below the majority of candidates',
      'Band 4 — significantly below the majority of candidates',
    ],
    sjInfoBox:
      'SJ is scored separately (Band 1–4) and is not included in the overall UCAT scaled score. Many universities do consider it, so do not neglect it.',
    scoringUniversities:
      'Universities use UCAT scores differently. Some use score thresholds to shortlist for interview, others combine UCAT score with predicted A-level grades, and some use a points-based scoring system. Always check each university\'s individual admissions policy.',
    scoringStatsIntro:
      'The 2025 UCAT was sat by 41,354 candidates — the first cohort under the new 3-subtest format. Score data below reflects that sitting.',
    chartNote: '41,354 candidates · Mean 1,891 · Source: ucat.ac.uk',
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
      'Always check each university\'s updated thresholds for 2026 entry, as institutions are recalibrating their benchmarks for the new format.',
    dates: {
      cycles: [
        {
          heading: '2027 Entry — Test sat in 2026',
          rows: [
            { event: 'Registration Opens', date: '~March 2026' },
            { event: 'Testing Window', date: 'Mid-July – Late September 2026' },
            { event: 'UCAS Application Deadline', date: '15 October 2026' },
          ],
        },
      ],
      disclaimer: 'Registration open/close dates are approximate. The UCAS deadline is standard for UK medicine and dentistry applications. Always verify exact dates at ucat.ac.uk before registering.',
    },
    disclaimerBody1:
      'The information provided in this app is intended as a study aid and general guide only. Whilst every effort has been made to ensure accuracy, exam formats, dates, rules, and scoring methods are subject to change by UCAT.',
    disclaimerBody2:
      'Always refer to the official UCAT website for the most up-to-date and authoritative information before making any decisions related to your application.',
  },
  anz: {
    subtitle: 'University Clinical Aptitude Test 2026 — Australia & New Zealand',
    officialUrl: 'https://www.ucat.edu.au',
    officialUrlLabel: 'Visit ucat.edu.au (Official Website)',
    whatPara1:
      'The University Clinical Aptitude Test ANZ (UCAT ANZ) is a computer-based admissions test used by the majority of Australian and New Zealand medical and dental schools. It is sat annually by candidates applying for undergraduate medicine and dentistry programmes, and is designed to assess a range of mental abilities and behavioural attributes considered important for healthcare professionals.',
    whatPara2:
      'Unlike ATAR examinations, the UCAT ANZ does not test academic knowledge. Instead, it evaluates aptitude across four cognitive domains. The test is administered by Pearson VUE at authorised test centres and must be sat between July and September each year, ahead of application deadlines for Australian and New Zealand universities.',
    whatInfoBox:
      'For 2026 entry, the UCAT ANZ testing window runs from 7 July to 26 September 2025. Always check the official UCAT ANZ website for exact dates.',
    formatIntro:
      'From 2025, the UCAT ANZ consists of four separately timed subtests delivered in a fixed order. Abstract Reasoning has been permanently removed from the exam. The total testing time is just under 2 hours, including instruction periods and administration.',
    sjScoreLine:
      'Situational Judgement is scored on a separate 300–900 scale and is not included in the overall cognitive total score. Unlike the UK UCAT, UCAT ANZ does not use a band system for SJ.',
    sjBands: null,
    sjInfoBox:
      'SJ is scored on a separate 300–900 scale and is not included in the overall cognitive total. However, most Australian and New Zealand universities do consider the SJ score, so do not neglect it.',
    scoringUniversities:
      'Universities use UCAT ANZ scores differently. Some use score thresholds to shortlist for interview, others combine the UCAT ANZ score with ATAR or GPA, and some use a points-based scoring system. Application is via state and territory systems (SATAC, VTAC, UAC, QTAC, TISC) in Australia, or directly via university portals in New Zealand. Always check each university\'s individual admissions policy.',
    scoringStatsIntro:
      'The 2025 UCAT ANZ was sat by approximately 16,950 candidates — the first ANZ cohort under the new 3-subtest format. Score data below reflects that sitting.',
    chartNote: '~16,950 candidates · Mean 1,941 · Source: ucat.edu.au',
    bellCurve: { mean: 1941, sd: 285, d1: 1576, d9: 2310 },
    statItems: [
      { label: 'Mean Cognitive', value: '1,941' },
      { label: 'Mean SJ', value: '586' },
      { label: 'Top 10%', value: '2,310+' },
    ],
    sjScoreSection: 'numeric',
    sjGMCTip:
      "Familiarise yourself with AHPRA's Good Medical Practice: A Code of Conduct for all health practitioners — it informs the professional values tested in SJ.",
    scoringThresholdNote:
      'Always check each university\'s updated thresholds for 2026 entry. Medical schools in Australia and New Zealand are recalibrating their benchmarks for the new format.',
    dates: {
      cycles: [
        {
          heading: '2027 Entry — Test sat in 2026',
          rows: [
            { event: 'Registration Opens', date: '16 February 2026' },
            { event: 'Registration Closes', date: '11 May 2026' },
            { event: 'Test Booking Opens', date: '3 March 2026' },
            { event: 'Test Booking Closes', date: '15 May 2026' },
            { event: 'Testing Window', date: '1 July – 5 August 2026' },
          ],
        },
      ],
      disclaimer: 'Dates are sourced from ucat.edu.au. Application deadlines vary by state and university — check SATAC, VTAC, UAC, QTAC, or TISC for your state. Always verify at ucat.edu.au before registering.',
    },
    disclaimerBody1:
      'The information provided in this app is intended as a study aid and general guide only. Whilst every effort has been made to ensure accuracy, exam formats, dates, rules, and scoring methods are subject to change by UCAT ANZ.',
    disclaimerBody2:
      'Always refer to the official UCAT ANZ website for the most up-to-date and authoritative information before making any decisions related to your application.',
  },
};

export default function AboutUCATScreen() {
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const { theme: t } = useTheme();
  const styles = makeStyles(t);
  const [region, setRegion] = useState('uk');
  const r = REGION[region];

  function scrollToSection(id) {
    const ref = sectionRefs.current[id];
    if (ref && scrollRef.current) {
      ref.measureLayout(scrollRef.current, (_x, y) => {
        scrollRef.current.scrollTo({ y: y - 16, animated: true });
      });
    }
  }

  function registerRef(id) {
    return (ref) => {
      sectionRefs.current[id] = ref;
    };
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bgInput} />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>About the UCAT 2026</Text>
          <Text style={styles.pageSubtitle}>{r.subtitle}</Text>
        </View>

        {/* Region Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, region === 'uk' && styles.tabActive]}
            onPress={() => setRegion('uk')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, region === 'uk' && styles.tabTextActive]}>
              UCAT UK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, region === 'anz' && styles.tabActive]}
            onPress={() => setRegion('anz')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, region === 'anz' && styles.tabTextActive]}>
              UCAT ANZ
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contents */}
        <View style={styles.contentsCard}>
          <Text style={styles.contentsHeading}>Contents</Text>
          {SECTIONS.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => scrollToSection(s.id)}
              activeOpacity={0.7}
              style={styles.contentsItem}
            >
              <Text style={styles.contentsText}>{s.label}</Text>
              <Text style={styles.contentsArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* What is the UCAT */}
        <View ref={registerRef('what')} style={styles.section}>
          <Text style={styles.sectionTitle}>What is the UCAT?</Text>
          <Text style={styles.body}>{r.whatPara1}</Text>
          <Text style={styles.body}>{r.whatPara2}</Text>
          <InfoBox text={r.whatInfoBox} styles={styles} />
        </View>

        {/* Exam Format */}
        <View ref={registerRef('format')} style={styles.section}>
          <Text style={styles.sectionTitle}>Exam Format</Text>
          <Text style={styles.body}>{r.formatIntro}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Subtest</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Items</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Time</Text>
            </View>
            {[
              ['Verbal Reasoning', '44', '22 min'],
              ['Decision Making', '35', '37 min'],
              ['Quantitative Reasoning', '36', '26 min'],
              ['Situational Judgement', '69', '26 min'],
            ].map(([name, items, time], i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{name}</Text>
                <Text style={styles.tableCell}>{items}</Text>
                <Text style={styles.tableCell}>{time}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.body}>
            A short one-minute break is provided between each subtest. Candidates may use an on-screen
            calculator during both Quantitative Reasoning and Decision Making. No physical notes or
            materials are permitted in the testing room.
          </Text>
        </View>

        {/* Verbal Reasoning */}
        <View ref={registerRef('vr')} style={styles.section}>
          <SectionBadge label="VR" color={t.accent} styles={styles} />
          <Text style={styles.sectionTitle}>Verbal Reasoning</Text>
          <StatRow items={[{ label: 'Questions', value: '44' }, { label: 'Time', value: '22 min' }, { label: 'Per question', value: '~30 sec' }]} styles={styles} />
          <Text style={styles.body}>
            Verbal Reasoning assesses your ability to read and critically evaluate written information.
            You are presented with 11 passages of text (approximately 200–300 words each), each followed
            by four questions.
          </Text>
          <Text style={styles.subheading}>Question Types</Text>
          <BulletList items={[
            'True / False / Can\'t Tell — decide whether a statement is supported, contradicted, or cannot be determined from the passage.',
            'Free text questions — select the best answer from four options based on the passage content.',
          ]} styles={styles} />
          <Text style={styles.subheading}>Key Skills</Text>
          <BulletList items={[
            'Reading comprehension under time pressure',
            'Distinguishing between what is stated and what is implied',
            'Avoiding assumptions based on prior knowledge',
            'Identifying the logical conclusion supported by the text',
          ]} styles={styles} />
          <InfoBox text="Do not use outside knowledge. Base every answer solely on the passage provided." styles={styles} />
        </View>

        {/* Decision Making */}
        <View ref={registerRef('dm')} style={styles.section}>
          <SectionBadge label="DM" color={t.accent} styles={styles} />
          <Text style={styles.sectionTitle}>Decision Making</Text>
          <StatRow items={[{ label: 'Questions', value: '35' }, { label: 'Time', value: '37 min' }, { label: 'Per question', value: '~63 sec' }]} styles={styles} />
          <Text style={styles.body}>
            Decision Making tests your ability to apply logic to reach sound decisions from complex
            information. Questions may draw on text, statistics, charts, or logical puzzles.
          </Text>
          <Text style={styles.subheading}>Question Types</Text>
          <BulletList items={[
            'Logical puzzles — deducing conclusions from a set of given premises.',
            'Syllogisms — evaluating whether a conclusion necessarily follows.',
            'Interpreting information — drawing inferences from data, charts, or diagrams.',
            'Recognising assumptions — identifying assumptions underlying an argument.',
            'Venn diagrams — using set logic to answer probability-style questions.',
          ]} styles={styles} />
          <Text style={styles.subheading}>Scoring & Calculator</Text>
          <Text style={styles.body}>
            Single-answer questions are worth one mark. Multi-statement questions (where you match
            statements to Yes/No) are worth two marks with one mark awarded for partial credit.
            An on-screen calculator is available throughout this subtest.
          </Text>
        </View>

        {/* Quantitative Reasoning */}
        <View ref={registerRef('qr')} style={styles.section}>
          <SectionBadge label="QR" color={t.accent} styles={styles} />
          <Text style={styles.sectionTitle}>Quantitative Reasoning</Text>
          <StatRow items={[{ label: 'Questions', value: '36' }, { label: 'Time', value: '26 min' }, { label: 'Per question', value: '~43 sec' }]} styles={styles} />
          <Text style={styles.body}>
            Quantitative Reasoning assesses your ability to use numerical and mathematical skills to
            solve problems. Questions are presented alongside tables, charts, or graphs and require
            interpretation and calculation.
          </Text>
          <Text style={styles.subheading}>Topics Covered</Text>
          <BulletList items={[
            'Percentages, ratios, and fractions',
            'Rates, speed, distance, and time',
            'Currency conversions and financial calculations',
            'Data interpretation from tables and graphs',
            'Area, volume, and basic geometry',
          ]} styles={styles} />
          <Text style={styles.subheading}>Calculator Use</Text>
          <Text style={styles.body}>
            An on-screen calculator is available during this subtest (and also in Decision Making).
            The key skill is not raw arithmetic but knowing which calculation to perform efficiently
            within the tight time limit.
          </Text>
          <InfoBox text="Practice reading tables and graphs quickly. The bottleneck is usually identifying the right numbers, not the calculation itself." styles={styles} />
        </View>

        {/* Situational Judgement */}
        <View ref={registerRef('sj')} style={styles.section}>
          <SectionBadge label="SJ" color={t.accent} styles={styles} />
          <Text style={styles.sectionTitle}>Situational Judgement</Text>
          <StatRow items={[{ label: 'Questions', value: '69' }, { label: 'Time', value: '26 min' }, { label: 'Per question', value: '~23 sec' }]} styles={styles} />
          <Text style={styles.body}>
            Situational Judgement assesses your ability to understand real-world situations and
            identify appropriate behaviour in a clinical or professional context. It is co-developed
            with practising clinicians and tested against consensus responses from senior doctors.
          </Text>
          <Text style={styles.body}>{r.sjScoreLine}</Text>
          <Text style={styles.subheading}>Format</Text>
          <Text style={styles.body}>
            You are presented with scenarios involving a medical student, junior doctor, or healthcare
            professional, followed by a series of possible responses.
          </Text>
          <BulletList items={[
            'Appropriateness questions — rate each response as: Very Appropriate, Appropriate but not Ideal, Inappropriate but not Awful, or Very Inappropriate.',
            'Importance questions — rate how important each action is: Very Important, Important, Of Minor Importance, or Not Important at all.',
          ]} styles={styles} />
          <Text style={styles.subheading}>Key Themes</Text>
          <BulletList items={[
            'Patient safety and escalation',
            'Professional integrity and honesty',
            'Team communication and hierarchy',
            'Confidentiality and consent',
            'Personal wellbeing and limitations',
          ]} styles={styles} />
          <InfoBox text={r.sjInfoBox} styles={styles} />
        </View>

        {/* Scoring */}
        <View ref={registerRef('scoring')} style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.body}>
            Each of the three cognitive subtests (VR, DM, QR) is scored on a scale of 300–900.
            Your total {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} score is the sum of these three scaled scores, giving a range of 900–2700.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightLabel}>Total Cognitive Score Range</Text>
            <Text style={styles.highlightValue}>900 – 2700</Text>
          </View>

          {region === 'uk' ? (
            <>
              <Text style={styles.body}>
                The Situational Judgement subtest is scored separately in Bands:
              </Text>
              <BulletList items={r.sjBands} styles={styles} />
            </>
          ) : (
            <Text style={styles.body}>
              The Situational Judgement subtest is scored separately on a 300–900 scale (not bands).
              The 2025 ANZ mean SJ score was 586.
            </Text>
          )}

          <Text style={styles.body}>{r.scoringUniversities}</Text>
          <Text style={styles.subheading}>
            Average Scores — 2025 {region === 'uk' ? 'Results' : 'ANZ Results'}
          </Text>
          <Text style={styles.body}>{r.scoringStatsIntro}</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Total Cognitive Score Distribution (2025)</Text>
            <BellCurveChart data={r.bellCurve} t={t} />
            <Text style={styles.chartNote}>{r.chartNote}</Text>
          </View>
          <StatRow items={r.statItems} styles={styles} />

          {region === 'uk' && (
            <>
              <Text style={styles.subheading}>SJ Band Distribution — 2025</Text>
              <SJBandBar t={t} />
            </>
          )}

          <Text style={styles.body}>{r.scoringThresholdNote}</Text>

          {/* ── How this app estimates your score ─────────────────────── */}
          <View style={styles.tipDivider} />
          <Text style={styles.subheading}>How UCAT Genius estimates your score</Text>
          <Text style={styles.body}>
            The real {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} does not use a simple
            formula. Pearson VUE uses Item Response Theory (IRT) — specifically the
            Rasch model since 2011 — with item-level calibration. Each test form has
            its own raw → scaled conversion table that is generated before the
            testing window opens. Two candidates with the same number of correct
            answers on different forms can receive different scaled scores. The
            conversion tables are proprietary and not published.
          </Text>
          <Text style={styles.body}>
            That means no third-party app — including this one — can replicate
            UCAT scoring exactly. We do the next best thing:
          </Text>
          <BulletList items={[
            'Verbal Reasoning uses piecewise-linear interpolation against community-derived raw → scaled anchor points, validated against the 2025 official deciles published by the UCAT Consortium.',
            'Decision Making and Quantitative Reasoning use a z-score transformation anchored at each section\u2019s 2025 mean and standard deviation (Pearson VUE 2023 technical report).',
            'Situational Judgement is reported as a UK Band (1\u20134) using community-derived approximate thresholds. Official band boundaries are reset annually and not published before each cycle.',
          ]} styles={styles} />
          <Text style={styles.body}>
            Each estimated scaled score carries a typical uncertainty of about
            ±40 points (the standard error of measurement reported in the
            Pearson VUE 2023 technical report). You will see this margin
            displayed alongside every scaled score in the app — for example
            "620 ±40". Treat the numbers as a rough indicator of where your
            performance sits, not a prediction of your actual UCAT result.
          </Text>
          <InfoBox
            text={
              'Practice scores tend to under-estimate real UCAT performance. ' +
              'Most prep platforms (including this one) draw their data from a ' +
              'self-selected user pool that is more motivated than the average ' +
              'UCAT candidate. Use these scores to track your own progress over ' +
              'time, not to predict your final result.'
            }
            styles={styles}
          />
        </View>

        {/* Study Tips */}
        <View ref={registerRef('tips')} style={styles.section}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <Text style={styles.body}>
            The {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} is a skills test, not a knowledge test. Consistent, timed practice is the most
            effective preparation strategy.
          </Text>

          <Text style={styles.subheading}>General Strategy</Text>
          <BulletList items={[
            'Start 8–12 weeks before your test date and build up to full timed mocks.',
            'Practice under exam conditions from the beginning — time pressure is the primary challenge.',
            'After each session, review every wrong answer to understand why, not just what the right answer was.',
            'Rotate focus across all subtests weekly — do not neglect SJ.',
            `Use the official ${region === 'uk' ? 'UCAT' : 'UCAT ANZ'} practice platform (Pearson VUE) to familiarise yourself with the interface.`,
          ]} styles={styles} />

          <View style={styles.tipDivider} />
          <SectionBadge label="VR" color={t.accent} styles={styles} />
          <Text style={styles.subheading}>Verbal Reasoning</Text>
          <BulletList items={[
            'Base every answer solely on the passage — prior knowledge must be ignored completely.',
            'For True/False/Can\'t Tell: locate the exact sentence in the passage before committing to an answer.',
            '"Can\'t Tell" means the passage neither confirms nor contradicts — not that you are unsure.',
            'If a question is taking more than 30 seconds, flag it and move on — return at the end.',
            'Skim the questions before reading the passage so you know what to look for.',
          ]} styles={styles} />

          <View style={styles.tipDivider} />
          <SectionBadge label="DM" color={t.accent} styles={styles} />
          <Text style={styles.subheading}>Decision Making</Text>
          <BulletList items={[
            'Use the whiteboard provided to sketch Venn diagrams for set-logic questions.',
            'For syllogisms: ask whether the conclusion must be true — not whether it could be true.',
            'Recognise assumption questions require you to find what the argument depends on being true.',
            'The calculator is available — use it for any question involving numbers or probability.',
            'Multi-statement questions award partial marks — always attempt every statement.',
          ]} styles={styles} />

          <View style={styles.tipDivider} />
          <SectionBadge label="QR" color={t.accent} styles={styles} />
          <Text style={styles.subheading}>Quantitative Reasoning</Text>
          <BulletList items={[
            'Read the question before examining the data — identify exactly which numbers you need.',
            `Practice specifically with the on-screen ${region === 'uk' ? 'UCAT' : 'UCAT ANZ'} calculator; it behaves differently to a standard one.`,
            'Plan your calculation before picking up the calculator — efficiency beats speed.',
            'Most questions test data interpretation, not complex maths. GCSE-level arithmetic is sufficient.',
            'Watch for unit changes (e.g. km to m, monthly to annual) — these are common traps.',
          ]} styles={styles} />

          <View style={styles.tipDivider} />
          <SectionBadge label="SJ" color={t.accent} styles={styles} />
          <Text style={styles.subheading}>Situational Judgement</Text>
          <BulletList items={[
            'Patient safety is always the overriding priority — escalate anything that puts a patient at risk.',
            'Never act outside your level of competence; always seek senior support when in doubt.',
            r.sjGMCTip,
            'Think about what a senior, experienced doctor would consider ideal — not just acceptable.',
            'SJ uses partial marking — a response close to the correct answer still earns credit.',
          ]} styles={styles} />

          <View style={styles.tipDivider} />
          <Text style={styles.subheading}>Test Day</Text>
          <BulletList items={[
            'Arrive at the test centre at least 15 minutes early — late arrival means no entry.',
            'You will be given a whiteboard and marker; use it freely for working.',
            'Use the flag feature to mark uncertain questions and revisit them before time expires.',
            'Check your remaining time every 5–6 questions to maintain pace.',
            'Each subtest is independently timed — unused time in one does not carry over to the next.',
          ]} styles={styles} />
        </View>

        {/* Exam Dates & Registration */}
        <View ref={registerRef('dates')} style={styles.section}>
          <Text style={styles.sectionTitle}>Exam Dates & Registration</Text>
          <Text style={styles.body}>
            Key dates for each {region === 'uk' ? 'UCAT' : 'UCAT ANZ'} testing cycle are listed below.
            Registration and test booking must be completed before the testing window opens.
          </Text>
          {r.dates.cycles.map((cycle, ci) => (
            <View key={ci} style={styles.datesBlock}>
              <Text style={styles.datesCycleHeading}>{cycle.heading}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Event</Text>
                  <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Date</Text>
                </View>
                {cycle.rows.map((row, ri) => (
                  <View key={ri} style={[styles.tableRow, ri % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{row.event}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{row.date}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View ref={registerRef('disclaimer')} style={[styles.section, styles.disclaimerSection]}>
          <Text style={styles.disclaimerTitle}>⚠ Disclaimer</Text>
          <Text style={styles.disclaimerBody}>{r.disclaimerBody1}</Text>
          <Text style={styles.disclaimerBody}>{r.disclaimerBody2}</Text>
          <Text style={styles.disclaimerBody}>{r.dates.disclaimer}</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(r.officialUrl)}
            activeOpacity={0.7}
            style={styles.officialLink}
          >
            <Text style={styles.officialLinkText}>{r.officialUrlLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function SectionBadge({ label, color, styles }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatRow({ items, styles }) {
  return (
    <View style={styles.statRow}>
      {items.map((item, i) => (
        <View key={i} style={styles.statItem}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function BulletList({ items, styles }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function BellCurveChart({ data, t }) {
  const { mean: MEAN, sd: SD, d1: D1, d9: D9 } = data;
  const SCORE_MIN = 900;
  const SCORE_MAX = 2700;

  const W = Dimensions.get('window').width - 68;
  const H = 190;
  const pL = 8, pR = 8, pT = 16, pB = 52;
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
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const fullCurve = toPath(pts);
  const fullFill = fullCurve + ` L${sx(SCORE_MAX).toFixed(1)},${baseY} L${sx(SCORE_MIN).toFixed(1)},${baseY} Z`;

  const bot10Pts = pts.filter(([x]) => x <= sx(D1) + 1);
  const bot10Fill = bot10Pts.length > 1
    ? toPath(bot10Pts) + ` L${sx(D1).toFixed(1)},${baseY} L${sx(SCORE_MIN).toFixed(1)},${baseY} Z`
    : null;

  const top10Pts = pts.filter(([x]) => x >= sx(D9) - 1);
  const top10Fill = top10Pts.length > 1
    ? toPath(top10Pts) + ` L${sx(SCORE_MAX).toFixed(1)},${baseY} L${sx(D9).toFixed(1)},${baseY} Z`
    : null;

  const markers = [
    { score: D1, label: 'Bot. 10%', sub: String(D1), color: '#f87171' },
    { score: MEAN, label: 'Mean', sub: String(MEAN), color: t.text },
    { score: D9, label: 'Top 10%', sub: String(D9), color: '#34d399' },
  ];

  return (
    <Svg width={W} height={H}>
      <Path d={fullFill} fill={t.accent + '1f'} />
      {bot10Fill && <Path d={bot10Fill} fill="rgba(239,68,68,0.22)" />}
      {top10Fill && <Path d={top10Fill} fill="rgba(16,185,129,0.22)" />}
      <Path d={fullCurve} stroke={t.accent} strokeWidth="2.5" fill="none" />
      <Line x1={pL} y1={baseY} x2={W - pR} y2={baseY} stroke={t.border} strokeWidth="1" />
      {markers.map(({ score, label, sub, color }) => (
        <G key={score}>
          <Line
            x1={sx(score)} y1={pT + 2} x2={sx(score)} y2={baseY}
            stroke={color} strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8"
          />
          <SvgText x={sx(score)} y={baseY + 15} fontSize="10" fill={color} textAnchor="middle" fontWeight="700">
            {label}
          </SvgText>
          <SvgText x={sx(score)} y={baseY + 28} fontSize="9" fill={color} textAnchor="middle" opacity="0.8">
            {sub}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function SJBandBar({ t }) {
  const bands = [
    { label: 'Band 1', pct: 21, color: '#10b981' },
    { label: 'Band 2', pct: 39, color: '#3b82f6' },
    { label: 'Band 3', pct: 29, color: '#f59e0b' },
    { label: 'Band 4', pct: 10, color: '#ef4444' },
  ];
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', borderRadius: 8, overflow: 'hidden', height: 30, marginBottom: 10 }}>
        {bands.map((b) => (
          <View key={b.label} style={{ flex: b.pct, backgroundColor: b.color + 'cc', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{b.pct}%</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {bands.map((b) => (
          <View key={b.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: b.color }} />
            <Text style={{ fontSize: 12, color: t.text }}>{b.label} — {b.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InfoBox({ text, styles }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoBoxText}>{text}</Text>
    </View>
  );
}

function makeStyles(t) { return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bgInput,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: t.text,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: t.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  // Region Tabs
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: t.bgCard,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: t.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: t.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: t.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },

  // Contents
  contentsCard: {
    backgroundColor: t.bgCard,
    borderRadius: 14,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: t.border,
  },
  contentsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: t.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  contentsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  contentsText: {
    color: t.accent,
    fontSize: 15,
    fontWeight: '500',
  },
  contentsArrow: {
    color: t.accent,
    fontSize: 20,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: t.text,
    marginBottom: 14,
  },
  subheading: {
    fontSize: 15,
    fontWeight: '700',
    color: t.text,
    marginTop: 14,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: t.textSecondary,
    lineHeight: 24,
    marginBottom: 10,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: t.bgCard,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: t.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: t.text,
  },
  statLabel: {
    fontSize: 11,
    color: t.textSecondary,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Bullet list
  bulletList: {
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 7,
    paddingRight: 8,
  },
  bullet: {
    color: t.accent,
    fontSize: 16,
    marginRight: 10,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: t.text,
    lineHeight: 22,
  },

  // Info box
  infoBox: {
    backgroundColor: t.accentDim,
    borderLeftWidth: 3,
    borderLeftColor: t.accent,
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  infoBoxText: {
    fontSize: 13,
    color: t.accent,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Table
  table: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: t.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: t.bg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    color: t.textSecondary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: t.bgCard,
  },
  tableRowAlt: {
    backgroundColor: t.bgInput,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: t.text,
  },

  // Highlight box
  highlightBox: {
    backgroundColor: t.accentDim,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginVertical: 14,
    borderWidth: 1,
    borderColor: t.accent,
  },
  highlightLabel: {
    fontSize: 12,
    color: t.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '800',
    color: t.text,
  },

  // Tip divider
  tipDivider: {
    height: 1,
    backgroundColor: t.border,
    marginVertical: 16,
  },

  // Chart
  chartCard: {
    backgroundColor: t.bg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: t.border,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: t.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chartNote: {
    fontSize: 10,
    color: t.textMuted,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Disclaimer
  disclaimerSection: {
    backgroundColor: t.bgCard,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: t.border,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: t.text,
    marginBottom: 12,
  },
  disclaimerBody: {
    fontSize: 14,
    color: t.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  officialLink: {
    marginTop: 8,
    backgroundColor: t.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  officialLinkText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Dates section
  datesBlock: {
    marginBottom: 20,
  },
  datesCycleHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: t.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
}); }
