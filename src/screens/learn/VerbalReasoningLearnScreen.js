import React, { useMemo, useState } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import {
  AppHeader,
  PremiumIcon,
  PremiumScreen,
  PremiumScrollView,
  RichIconBox,
  hexToRgba,
  useFadeSlide,
} from '../../components/premium/PremiumPracticeUI';
import { getPremiumTheme } from '../../theme/premiumTheme';

const TABS = [
  { id: 'theory', label: 'Theory', icon: 'book' },
  { id: 'types', label: 'Question Types', icon: 'list' },
  { id: 'examples', label: 'Worked Examples', icon: 'notes' },
  { id: 'strategy', label: 'Strategy', icon: 'target' },
];

const LESSON_CARDS = [
  { title: 'Filler lesson title', meta: '4 min - Beginner', icon: 'book' },
  { title: 'Filler inference module', meta: '5 min - Core skill', icon: 'search' },
  { title: 'Filler author opinion module', meta: '6 min - Example led', icon: 'notes' },
];

const TOPICS = [
  'Main idea',
  'True / false / can\'t tell',
  'Inference',
  'Author opinion',
  'Keyword scanning',
  'Dense passages',
];

const WORKED_STEPS = [
  'Placeholder step 1: identify what the question is asking and mark the useful phrase.',
  'Placeholder step 2: compare the answer wording against the relevant part of the passage.',
  'Placeholder step 3: eliminate the option that adds information not shown in the passage.',
  'Placeholder step 4: choose the safest answer and note the trap pattern.',
];

const TRY_OPTIONS = [
  'Option A placeholder',
  'Option B placeholder',
  'Option C placeholder',
  'Option D placeholder',
];

function SmallStat({ value, label, colors, isDark }) {
  return (
    <View
      style={[
        styles.smallStat,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.52)' : 'rgba(255, 255, 255, 0.7)',
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.smallStatValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.smallStatLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function ModuleHero({ colors, gradients, isDark }) {
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: colors.blue }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon="book" accent={colors.blue} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.blue }]}>VERBAL REASONING</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Learn the method, then practise it.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        This demo shows how a section could teach theory, question types, worked examples, and strategy using filler content.
      </Text>

      <View style={styles.statRow}>
        <SmallStat value="8" label="Lessons" colors={colors} isDark={isDark} />
        <SmallStat value="12" label="Examples" colors={colors} isDark={isDark} />
        <SmallStat value="25m" label="Estimate" colors={colors} isDark={isDark} />
      </View>
    </LinearGradient>
  );
}

function TabBar({ activeTab, onChange, colors, isDark }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScroll}
    >
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.84}
            onPress={() => onChange(tab.id)}
            style={[
              styles.tabButton,
              {
                backgroundColor: selected
                  ? hexToRgba(colors.blue, isDark ? 0.18 : 0.12)
                  : (isDark ? 'rgba(8, 20, 38, 0.72)' : 'rgba(255, 255, 255, 0.78)'),
                borderColor: selected ? hexToRgba(colors.blue, 0.56) : colors.border,
              },
            ]}
            accessibilityRole="button"
          >
            <PremiumIcon name={tab.icon} size={18} color={selected ? colors.blue : colors.textMuted} />
            <Text style={[styles.tabText, { color: selected ? colors.text : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ContentCard({ title, children, icon = 'notes', accent, colors, isDark, style }) {
  return (
    <View
      style={[
        styles.contentCard,
        {
          backgroundColor: isDark ? 'rgba(8, 20, 38, 0.74)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={styles.contentTitleRow}>
        <View style={[styles.contentIcon, { backgroundColor: hexToRgba(accent, 0.12), borderColor: hexToRgba(accent, 0.32) }]}>
          <PremiumIcon name={icon} size={18} color={accent} />
        </View>
        <Text style={[styles.contentTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function BulletRow({ children, colors, accent }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: accent }]} />
      <Text style={[styles.bodyText, styles.bulletText, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

function TheoryTab({ colors, isDark }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.lessonGrid}>
        {LESSON_CARDS.map((lesson, index) => (
          <View
            key={lesson.title}
            style={[
              styles.lessonCard,
              {
                backgroundColor: isDark ? 'rgba(8, 20, 38, 0.72)' : 'rgba(255, 255, 255, 0.82)',
                borderColor: index === 0 ? hexToRgba(colors.blue, 0.48) : colors.border,
              },
            ]}
          >
            <View style={styles.lessonCardTop}>
              <PremiumIcon name={lesson.icon} size={22} color={index === 0 ? colors.blue : colors.textMuted} />
              {index === 0 ? (
                <View style={[styles.statusPill, { backgroundColor: hexToRgba(colors.blue, 0.12), borderColor: hexToRgba(colors.blue, 0.34) }]}>
                  <Text style={[styles.statusText, { color: colors.blue }]}>Start</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
            <Text style={[styles.lessonMeta, { color: colors.textMuted }]}>{lesson.meta}</Text>
          </View>
        ))}
      </View>

      <ContentCard title="Core Idea" icon="brain" accent={colors.blue} colors={colors} isDark={isDark}>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Placeholder theory paragraph. This area would explain the concept in a short, focused way without becoming a textbook page.
        </Text>
      </ContentCard>

      <ContentCard title="How To Approach It" icon="list" accent={colors.cyan} colors={colors} isDark={isDark}>
        {['Read the task stem first.', 'Find the relevant passage area.', 'Check answer wording carefully.', 'Move on when the return is too low.'].map((item) => (
          <BulletRow key={item} colors={colors} accent={colors.cyan}>{item}</BulletRow>
        ))}
      </ContentCard>

      <ContentCard title="Common Traps" icon="flag" accent={colors.amber} colors={colors} isDark={isDark}>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Placeholder warning box for common mistakes, wording traps, and habits students should watch for.
        </Text>
      </ContentCard>
    </View>
  );
}

function QuestionTypesTab({ colors, isDark, activeTopic, setActiveTopic }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.topicGrid}>
        {TOPICS.map((topic) => {
          const selected = activeTopic === topic;
          return (
            <TouchableOpacity
              key={topic}
              activeOpacity={0.84}
              onPress={() => setActiveTopic(topic)}
              style={[
                styles.topicCard,
                {
                  backgroundColor: selected
                    ? hexToRgba(colors.blue, isDark ? 0.18 : 0.12)
                    : (isDark ? 'rgba(8, 20, 38, 0.72)' : 'rgba(255, 255, 255, 0.82)'),
                  borderColor: selected ? hexToRgba(colors.blue, 0.52) : colors.border,
                },
              ]}
            >
              <PremiumIcon name={selected ? 'check' : 'book'} size={20} color={selected ? colors.blue : colors.textMuted} />
              <Text style={[styles.topicTitle, { color: colors.text }]}>{topic}</Text>
              <Text style={[styles.topicMeta, { color: colors.textMuted }]}>Filler topic preview</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ContentCard title={activeTopic} icon="search" accent={colors.blue} colors={colors} isDark={isDark}>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Placeholder explanation for this question type. Real content would define the skill, show a mini example, then link into matching practice.
        </Text>
        <View style={[styles.inlineCallout, { borderColor: hexToRgba(colors.blue, 0.28), backgroundColor: hexToRgba(colors.blue, isDark ? 0.09 : 0.07) }]}>
          <Text style={[styles.inlineCalloutText, { color: colors.text }]}>Practice link placeholder</Text>
          <PremiumIcon name="chevron-right" size={19} color={colors.blue} />
        </View>
      </ContentCard>
    </View>
  );
}

function WorkedExamplesTab({ colors, isDark, visibleSteps, setVisibleSteps, selectedOption, setSelectedOption }) {
  const revealDone = visibleSteps >= WORKED_STEPS.length;

  return (
    <View style={styles.tabContent}>
      <ContentCard title="Sample Passage" icon="book" accent={colors.blue} colors={colors} isDark={isDark}>
        <Text style={[styles.passageText, { color: colors.textSecondary }]}>
          Placeholder passage text. In the real version, this area would contain a short UCAT-style extract that the worked example refers to.
        </Text>
      </ContentCard>

      <ContentCard title="Worked Example" icon="notes" accent={colors.cyan} colors={colors} isDark={isDark}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Filler question stem: which answer is best supported by the placeholder passage?
        </Text>

        <View style={styles.stepList}>
          {WORKED_STEPS.slice(0, visibleSteps).map((step, index) => (
            <View
              key={step}
              style={[
                styles.stepRow,
                {
                  backgroundColor: isDark ? 'rgba(5, 12, 26, 0.46)' : 'rgba(241, 247, 255, 0.88)',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={[styles.stepNumber, { backgroundColor: hexToRgba(colors.cyan, 0.14), borderColor: hexToRgba(colors.cyan, 0.34) }]}>
                <Text style={[styles.stepNumberText, { color: colors.cyan }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.bodyText, styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.84}
          onPress={() => (revealDone ? setVisibleSteps(1) : setVisibleSteps((current) => current + 1))}
          style={[styles.primaryButton, { backgroundColor: colors.blue }]}
          accessibilityRole="button"
        >
          <PremiumIcon name={revealDone ? 'refresh' : 'chevron-down'} size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>{revealDone ? 'Reset Example' : 'Reveal Next Step'}</Text>
        </TouchableOpacity>
      </ContentCard>

      <ContentCard title="Try One Now" icon="pencil" accent={colors.mint} colors={colors} isDark={isDark}>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Filler mini-question. Tap an answer to see how immediate feedback could appear.
        </Text>

        {TRY_OPTIONS.map((option, index) => {
          const selected = selectedOption === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.84}
              onPress={() => setSelectedOption(option)}
              style={[
                styles.answerOption,
                {
                  backgroundColor: selected
                    ? hexToRgba(colors.mint, isDark ? 0.16 : 0.1)
                    : (isDark ? 'rgba(5, 12, 26, 0.42)' : 'rgba(241, 247, 255, 0.86)'),
                  borderColor: selected ? hexToRgba(colors.mint, 0.5) : colors.border,
                },
              ]}
            >
              <Text style={[styles.answerLetter, { color: selected ? colors.mint : colors.textMuted }]}>
                {String.fromCharCode(65 + index)}
              </Text>
              <Text style={[styles.answerText, { color: colors.text }]}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        {selectedOption ? (
          <View style={[styles.feedbackBox, { backgroundColor: hexToRgba(colors.mint, isDark ? 0.12 : 0.08), borderColor: hexToRgba(colors.mint, 0.32) }]}>
            <PremiumIcon name="check" size={19} color={colors.mint} />
            <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
              Placeholder feedback would explain why this option is or is not supported.
            </Text>
          </View>
        ) : null}
      </ContentCard>
    </View>
  );
}

function StrategyTab({ colors, isDark, navigation }) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.strategyGrid}>
        {[
          ['22m', 'Timed section'],
          ['30s', 'Decision point'],
          ['2 pass', 'Review rhythm'],
        ].map(([value, label]) => (
          <SmallStat key={label} value={value} label={label} colors={colors} isDark={isDark} />
        ))}
      </View>

      <ContentCard title="Strategy Checklist" icon="target" accent={colors.blue} colors={colors} isDark={isDark}>
        {['Placeholder timing habit.', 'Placeholder scanning habit.', 'Placeholder review habit.', 'Placeholder skip habit.'].map((item) => (
          <BulletRow key={item} colors={colors} accent={colors.blue}>{item}</BulletRow>
        ))}
      </ContentCard>

      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => navigation.navigate('VRQuestionList')}
        style={[
          styles.practiceCard,
          {
            backgroundColor: isDark ? 'rgba(10, 29, 55, 0.88)' : 'rgba(255, 255, 255, 0.88)',
            borderColor: hexToRgba(colors.blue, 0.42),
          },
        ]}
        accessibilityRole="button"
      >
        <View style={styles.practiceCopy}>
          <Text style={[styles.practiceTitle, { color: colors.text }]}>Practise Similar Questions</Text>
          <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
            Placeholder CTA showing how Learn can hand off into existing practice.
          </Text>
        </View>
        <View style={[styles.practiceIcon, { backgroundColor: hexToRgba(colors.blue, 0.12), borderColor: hexToRgba(colors.blue, 0.32) }]}>
          <PremiumIcon name="chevron-right" size={23} color={colors.blue} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function VerbalReasoningLearnScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const [activeTab, setActiveTab] = useState('theory');
  const [activeTopic, setActiveTopic] = useState(TOPICS[0]);
  const [visibleSteps, setVisibleSteps] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const introAnim = useFadeSlide(0, 14);
  const contentAnim = useFadeSlide(120, 16);

  const activeLabel = useMemo(
    () => TABS.find((tab) => tab.id === activeTab)?.label ?? 'Theory',
    [activeTab],
  );

  const renderTab = () => {
    if (activeTab === 'types') {
      return (
        <QuestionTypesTab
          colors={colors}
          isDark={isDark}
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
        />
      );
    }

    if (activeTab === 'examples') {
      return (
        <WorkedExamplesTab
          colors={colors}
          isDark={isDark}
          visibleSteps={visibleSteps}
          setVisibleSteps={setVisibleSteps}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      );
    }

    if (activeTab === 'strategy') {
      return <StrategyTab colors={colors} isDark={isDark} navigation={navigation} />;
    }

    return <TheoryTab colors={colors} isDark={isDark} />;
  };

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Learn VR" />

      <PremiumScrollView>
        <Animated.View style={introAnim}>
          <ModuleHero colors={colors} gradients={gradients} isDark={isDark} />
          <Text style={[styles.sectionHeading, { color: colors.text }]}>{activeLabel}</Text>
          <TabBar activeTab={activeTab} onChange={setActiveTab} colors={colors} isDark={isDark} />
        </Animated.View>

        <Animated.View style={contentAnim}>
          {renderTab()}
        </Animated.View>
      </PremiumScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginTop: 4,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 0,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginTop: 4,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  smallStat: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  smallStatValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  smallStatLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 12,
  },
  tabScroll: {
    gap: 10,
    paddingRight: 20,
    paddingBottom: 4,
  },
  tabButton: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  tabContent: {
    paddingTop: 18,
    gap: 14,
  },
  lessonGrid: {
    gap: 12,
  },
  lessonCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  lessonCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  lessonTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },
  lessonMeta: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  contentCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  contentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 13,
  },
  contentIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  topicCard: {
    width: '47.8%',
    minHeight: 118,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  topicTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  topicMeta: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  inlineCallout: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  inlineCalloutText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  passageText: {
    fontSize: 15,
    lineHeight: 24,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '800',
    marginBottom: 14,
  },
  stepList: {
    gap: 10,
  },
  stepRow: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  answerOption: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  answerLetter: {
    width: 22,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  feedbackBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 13,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  strategyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  practiceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  practiceCopy: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  practiceText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  practiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
