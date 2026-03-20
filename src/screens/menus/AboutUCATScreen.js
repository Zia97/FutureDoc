import { useRef } from 'react';
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
  { id: 'disclaimer', label: 'Disclaimer' },
];

export default function AboutUCATScreen({ navigation }) {
  const scrollRef = useRef(null);
  const sectionRefs = useRef({});
  const { theme: t } = useTheme();
  const styles = makeStyles(t);

  function scrollToSection(id) {
    const ref = sectionRefs.current[id];
    if (ref && scrollRef.current) {
      ref.measureLayout(scrollRef.current, (x, y) => {
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
          <Text style={styles.pageSubtitle}>University Clinical Aptitude Test 2026</Text>
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
          <Text style={styles.body}>
            The University Clinical Aptitude Test (UCAT) is a computer-based admissions test used by
            the majority of UK medical and dental schools. It is sat annually by candidates applying
            for undergraduate medicine and dentistry programmes, and is designed to assess a range of
            mental abilities and behavioural attributes considered important for healthcare professionals.
          </Text>
          <Text style={styles.body}>
            Unlike A-level examinations, the UCAT does not test scientific knowledge. Instead, it
            evaluates aptitude across four cognitive domains. The test is administered by Pearson VUE
            at authorised test centres and must be sat between July and September each year, ahead of
            UCAS application deadlines.
          </Text>
          <InfoBox
            text="For 2026 entry, the UCAT testing window runs from mid-July to the end of September 2025. Always check the official UCAT website for exact dates."
          />
        </View>

        {/* Exam Format */}
        <View ref={registerRef('format')} style={styles.section}>
          <Text style={styles.sectionTitle}>Exam Format</Text>
          <Text style={styles.body}>
            From 2026, the UCAT consists of four separately timed subtests delivered in a fixed order.
            Abstract Reasoning has been permanently removed from the exam. The total testing time is
            just under 2 hours, including instruction periods and administration.
          </Text>
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
          <SectionBadge label="VR" color="#7c3aed" />
          <Text style={styles.sectionTitle}>Verbal Reasoning</Text>
          <StatRow items={[{ label: 'Questions', value: '44' }, { label: 'Time', value: '22 min' }, { label: 'Per question', value: '~30 sec' }]} />
          <Text style={styles.body}>
            Verbal Reasoning assesses your ability to read and critically evaluate written information.
            You are presented with 11 passages of text (approximately 200–300 words each), each followed
            by four questions.
          </Text>
          <Text style={styles.subheading}>Question Types</Text>
          <BulletList items={[
            'True / False / Can\'t Tell — decide whether a statement is supported, contradicted, or cannot be determined from the passage.',
            'Free text questions — select the best answer from four options based on the passage content.',
          ]} />
          <Text style={styles.subheading}>Key Skills</Text>
          <BulletList items={[
            'Reading comprehension under time pressure',
            'Distinguishing between what is stated and what is implied',
            'Avoiding assumptions based on prior knowledge',
            'Identifying the logical conclusion supported by the text',
          ]} />
          <InfoBox text="Do not use outside knowledge. Base every answer solely on the passage provided." />
        </View>

        {/* Decision Making */}
        <View ref={registerRef('dm')} style={styles.section}>
          <SectionBadge label="DM" color="#0891b2" />
          <Text style={styles.sectionTitle}>Decision Making</Text>
          <StatRow items={[{ label: 'Questions', value: '35' }, { label: 'Time', value: '37 min' }, { label: 'Per question', value: '~63 sec' }]} />
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
          ]} />
          <Text style={styles.subheading}>Scoring & Calculator</Text>
          <Text style={styles.body}>
            Single-answer questions are worth one mark. Multi-statement questions (where you match
            statements to Yes/No) are worth two marks with one mark awarded for partial credit.
            An on-screen calculator is available throughout this subtest.
          </Text>
        </View>

        {/* Quantitative Reasoning */}
        <View ref={registerRef('qr')} style={styles.section}>
          <SectionBadge label="QR" color="#059669" />
          <Text style={styles.sectionTitle}>Quantitative Reasoning</Text>
          <StatRow items={[{ label: 'Questions', value: '36' }, { label: 'Time', value: '26 min' }, { label: 'Per question', value: '~43 sec' }]} />
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
          ]} />
          <Text style={styles.subheading}>Calculator Use</Text>
          <Text style={styles.body}>
            An on-screen calculator is available during this subtest (and also in Decision Making).
            The key skill is not raw arithmetic but knowing which calculation to perform efficiently
            within the tight time limit.
          </Text>
          <InfoBox text="Practise reading tables and graphs quickly. The bottleneck is usually identifying the right numbers, not the calculation itself." />
        </View>

        {/* Situational Judgement */}
        <View ref={registerRef('sj')} style={styles.section}>
          <SectionBadge label="SJ" color="#d97706" />
          <Text style={styles.sectionTitle}>Situational Judgement</Text>
          <StatRow items={[{ label: 'Questions', value: '69' }, { label: 'Time', value: '26 min' }, { label: 'Per question', value: '~23 sec' }]} />
          <Text style={styles.body}>
            Situational Judgement assesses your ability to understand real-world situations and
            identify appropriate behaviour in a clinical or professional context. It is co-developed
            with practising clinicians and tested against consensus responses from senior doctors.
          </Text>
          <Text style={styles.subheading}>Format</Text>
          <Text style={styles.body}>
            You are presented with scenarios involving a medical student, junior doctor, or healthcare
            professional, followed by a series of possible responses.
          </Text>
          <BulletList items={[
            'Appropriateness questions — rate each response as: Very Appropriate, Appropriate but not Ideal, Inappropriate but not Awful, or Very Inappropriate.',
            'Importance questions — rate how important each action is: Very Important, Important, Of Minor Importance, or Not Important at all.',
          ]} />
          <Text style={styles.subheading}>Key Themes</Text>
          <BulletList items={[
            'Patient safety and escalation',
            'Professional integrity and honesty',
            'Team communication and hierarchy',
            'Confidentiality and consent',
            'Personal wellbeing and limitations',
          ]} />
          <InfoBox text="SJ is scored separately (Band 1–4) and is not included in the overall UCAT scaled score. Many universities do consider it, so do not neglect it." />
        </View>

        {/* Scoring */}
        <View ref={registerRef('scoring')} style={styles.section}>
          <Text style={styles.sectionTitle}>Scoring</Text>
          <Text style={styles.body}>
            Each of the three cognitive subtests (VR, DM, QR) is scored on a scale of 300–900.
            Your total UCAT score is the sum of these three scaled scores, giving a range of
            900–2700.
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightLabel}>Total Score Range</Text>
            <Text style={styles.highlightValue}>900 – 2700</Text>
          </View>
          <Text style={styles.body}>
            The Situational Judgement subtest is scored separately in Bands:
          </Text>
          <BulletList items={[
            'Band 1 — performance similar to the highest-scoring candidates',
            'Band 2 — performance similar to the majority of candidates',
            'Band 3 — below the majority of candidates',
            'Band 4 — significantly below the majority of candidates',
          ]} />
          <Text style={styles.body}>
            Universities use UCAT scores differently. Some use score thresholds to shortlist for
            interview, others combine UCAT score with predicted A-level grades, and some use a
            points-based scoring system. Always check each university's individual admissions policy.
          </Text>
          <Text style={styles.subheading}>Average Scores — 2025 Results</Text>
          <Text style={styles.body}>
            The 2025 UCAT was sat by 41,354 candidates — the first cohort under the new 3-subtest
            format. Score data below reflects that sitting.
          </Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Total Cognitive Score Distribution (2025)</Text>
            <BellCurveChart />
            <Text style={styles.chartNote}>41,354 candidates · Mean 1,891 · Source: ucat.ac.uk</Text>
          </View>
          <StatRow items={[
            { label: 'VR Mean', value: '602' },
            { label: 'DM Mean', value: '628' },
            { label: 'QR Mean', value: '661' },
          ]} />
          <Text style={styles.subheading}>SJ Band Distribution — 2025</Text>
          <SJBandBar />
          <Text style={styles.body}>
            Always check each university's updated thresholds for 2026 entry, as institutions are
            recalibrating their benchmarks for the new format.
          </Text>
        </View>

        {/* Study Tips */}
        <View ref={registerRef('tips')} style={styles.section}>
          <Text style={styles.sectionTitle}>Study Tips</Text>
          <Text style={styles.body}>
            The UCAT is a skills test, not a knowledge test. Consistent, timed practice is the most
            effective preparation strategy.
          </Text>

          <Text style={styles.subheading}>General Strategy</Text>
          <BulletList items={[
            'Start 8–12 weeks before your test date and build up to full timed mocks.',
            'Practice under exam conditions from the beginning — time pressure is the primary challenge.',
            'After each session, review every wrong answer to understand why, not just what the right answer was.',
            'Rotate focus across all subtests weekly — do not neglect SJ.',
            'Use the official UCAT practice platform (Pearson VUE) to familiarise yourself with the interface.',
          ]} />

          <View style={styles.tipDivider} />
          <SectionBadge label="VR" color="#7c3aed" />
          <Text style={styles.subheading}>Verbal Reasoning</Text>
          <BulletList items={[
            'Base every answer solely on the passage — prior knowledge must be ignored completely.',
            'For True/False/Can\'t Tell: locate the exact sentence in the passage before committing to an answer.',
            '"Can\'t Tell" means the passage neither confirms nor contradicts — not that you are unsure.',
            'If a question is taking more than 30 seconds, flag it and move on — return at the end.',
            'Skim the questions before reading the passage so you know what to look for.',
          ]} />

          <View style={styles.tipDivider} />
          <SectionBadge label="DM" color="#0891b2" />
          <Text style={styles.subheading}>Decision Making</Text>
          <BulletList items={[
            'Use the whiteboard provided to sketch Venn diagrams for set-logic questions.',
            'For syllogisms: ask whether the conclusion must be true — not whether it could be true.',
            'Recognise assumption questions require you to find what the argument depends on being true.',
            'The calculator is available — use it for any question involving numbers or probability.',
            'Multi-statement questions award partial marks — always attempt every statement.',
          ]} />

          <View style={styles.tipDivider} />
          <SectionBadge label="QR" color="#059669" />
          <Text style={styles.subheading}>Quantitative Reasoning</Text>
          <BulletList items={[
            'Read the question before examining the data — identify exactly which numbers you need.',
            'Practise specifically with the on-screen UCAT calculator; it behaves differently to a standard one.',
            'Plan your calculation before picking up the calculator — efficiency beats speed.',
            'Most questions test data interpretation, not complex maths. GCSE-level arithmetic is sufficient.',
            'Watch for unit changes (e.g. km to m, monthly to annual) — these are common traps.',
          ]} />

          <View style={styles.tipDivider} />
          <SectionBadge label="SJ" color="#d97706" />
          <Text style={styles.subheading}>Situational Judgement</Text>
          <BulletList items={[
            'Patient safety is always the overriding priority — escalate anything that puts a patient at risk.',
            'Never act outside your level of competence; always seek senior support when in doubt.',
            'Read the GMC\'s Good Medical Practice for context on professional values and duties.',
            'Think about what a senior, experienced doctor would consider ideal — not just acceptable.',
            'SJ uses partial marking — a response close to the correct band still earns credit.',
          ]} />

          <View style={styles.tipDivider} />
          <Text style={styles.subheading}>Test Day</Text>
          <BulletList items={[
            'Arrive at the test centre at least 15 minutes early — late arrival means no entry.',
            'You will be given a whiteboard and marker; use it freely for working.',
            'Use the flag feature to mark uncertain questions and revisit them before time expires.',
            'Check your remaining time every 5–6 questions to maintain pace.',
            'Each subtest is independently timed — unused time in one does not carry over to the next.',
          ]} />
        </View>

        {/* Disclaimer */}
        <View ref={registerRef('disclaimer')} style={[styles.section, styles.disclaimerSection]}>
          <Text style={styles.disclaimerTitle}>⚠ Disclaimer</Text>
          <Text style={styles.disclaimerBody}>
            The information provided in this app is intended as a study aid and general guide only.
            Whilst every effort has been made to ensure accuracy, exam formats, dates, rules, and
            scoring methods are subject to change by UCAT ANZ.
          </Text>
          <Text style={styles.disclaimerBody}>
            Always refer to the official UCAT website for the most up-to-date and authoritative
            information before making any decisions related to your application.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://www.ucat.ac.uk')}
            activeOpacity={0.7}
            style={styles.officialLink}
          >
            <Text style={styles.officialLinkText}>Visit ucat.ac.uk (Official Website)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function SectionBadge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatRow({ items }) {
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

function BulletList({ items }) {
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

function BellCurveChart() {
  const MEAN = 1891;
  const SD = 250;
  const SCORE_MIN = 900;
  const SCORE_MAX = 2700;
  const D1 = 1580; // 10th percentile
  const D9 = 2220; // 90th percentile

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
    { score: D1, label: 'Bot. 10%', sub: '1580', color: '#f87171' },
    { score: MEAN, label: 'Mean', sub: '1891', color: '#e2e8f0' },
    { score: D9, label: 'Top 10%', sub: '2220', color: '#34d399' },
  ];

  return (
    <Svg width={W} height={H}>
      <Path d={fullFill} fill="rgba(79,70,229,0.12)" />
      {bot10Fill && <Path d={bot10Fill} fill="rgba(239,68,68,0.22)" />}
      {top10Fill && <Path d={top10Fill} fill="rgba(16,185,129,0.22)" />}
      <Path d={fullCurve} stroke="#4f46e5" strokeWidth="2.5" fill="none" />
      <Line x1={pL} y1={baseY} x2={W - pR} y2={baseY} stroke="#2d4a6e" strokeWidth="1" />
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

function SJBandBar() {
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
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{b.label} — {b.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function InfoBox({ text }) {
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
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: t.text,
    letterSpacing: 0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: t.textSecondary,
    marginTop: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    color: '#4f46e5',
    fontSize: 16,
    marginRight: 10,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: t.textSecondary,
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
    backgroundColor: '#1a1206',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#92400e',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fbbf24',
    marginBottom: 12,
  },
  disclaimerBody: {
    fontSize: 14,
    color: '#d1b87a',
    lineHeight: 22,
    marginBottom: 10,
  },
  officialLink: {
    marginTop: 8,
    backgroundColor: '#92400e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  officialLinkText: {
    color: '#fef3c7',
    fontWeight: '700',
    fontSize: 14,
  },
}); }
