import React from 'react';

import SectionLearnPrototypeScreen from './SectionLearnPrototypeScreen';

const QUANTITATIVE_REASONING_CONFIG = {
  headerTitle: 'Learn QR',
  shortName: 'Quantitative Reasoning',
  eyebrow: 'QUANTITATIVE REASONING',
  heroTitle: 'Learn the method before the numbers arrive.',
  heroBody:
    'This filler module shows how Quantitative Reasoning could teach data reading, worked calculations, and calculator strategy.',
  icon: 'calculator',
  accentKey: 'purple',
  stats: [
    ['8', 'Lessons'],
    ['14', 'Examples'],
    ['28m', 'Estimate'],
  ],
  lessonCards: [
    { title: 'Filler data interpretation', meta: '5 min - Beginner', icon: 'chart' },
    { title: 'Filler percentage method', meta: '4 min - Core skill', icon: 'calculator' },
    { title: 'Filler speed calculation', meta: '6 min - Example led', icon: 'timer' },
  ],
  coreIdea:
    'Placeholder theory paragraph for Quantitative Reasoning. This area would explain the numerical method without adding real teaching content yet.',
  approachSteps: [
    'Identify the units and what the question actually wants.',
    'Choose the shortest calculation route before typing.',
    'Estimate the answer range to catch obvious errors.',
    'Skip calculation-heavy traps when they threaten timing.',
  ],
  commonTraps:
    'Placeholder warning box for unit switches, percentage base errors, copied figures, and distractor rows in tables.',
  topics: [
    'Percentages',
    'Ratios',
    'Rates',
    'Tables',
    'Charts',
    'Estimation',
  ],
  exampleSourceTitle: 'Sample Data Set',
  exampleSource:
    'Placeholder table or chart description. In the real version, this area would display the data source for the worked example.',
  questionStem: 'Filler question stem: which option matches the placeholder data calculation?',
  workedSteps: [
    'Placeholder step 1: find the relevant row, column, or chart value.',
    'Placeholder step 2: write the calculation structure before doing arithmetic.',
    'Placeholder step 3: estimate the size of the result.',
    'Placeholder step 4: compare the exact result with the answer options.',
  ],
  strategyStats: [
    ['26m', 'Timed section'],
    ['40s', 'Calc decision'],
    ['2 pass', 'Review rhythm'],
  ],
  strategyChecklist: [
    'Placeholder unit-checking habit.',
    'Placeholder calculator-entry habit.',
    'Placeholder estimation habit.',
    'Placeholder time-protection habit.',
  ],
  practiceRoute: 'QRQuestionList',
};

export default function QuantitativeReasoningLearnScreen({ navigation }) {
  return <SectionLearnPrototypeScreen navigation={navigation} config={QUANTITATIVE_REASONING_CONFIG} />;
}
