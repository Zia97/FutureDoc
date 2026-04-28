import React from 'react';

import SectionLearnPrototypeScreen from './SectionLearnPrototypeScreen';

const DECISION_MAKING_CONFIG = {
  headerTitle: 'Learn DM',
  shortName: 'Decision Making',
  eyebrow: 'DECISION MAKING',
  heroTitle: 'Learn the logic before the puzzle starts.',
  heroBody:
    'This filler module shows how Decision Making could teach rules, diagrams, worked reasoning, and timing strategy.',
  icon: 'person-cog',
  accentKey: 'teal',
  stats: [
    ['7', 'Lessons'],
    ['10', 'Examples'],
    ['24m', 'Estimate'],
  ],
  lessonCards: [
    { title: 'Filler logic foundations', meta: '4 min - Beginner', icon: 'brain' },
    { title: 'Filler diagram method', meta: '5 min - Core skill', icon: 'list' },
    { title: 'Filler argument evaluation', meta: '6 min - Example led', icon: 'notes' },
  ],
  coreIdea:
    'Placeholder theory paragraph for Decision Making. This area would explain the reasoning skill in a short, structured way.',
  approachSteps: [
    'Restate the rule or condition in simple terms.',
    'Map the information before looking at the options.',
    'Eliminate choices that break a stated condition.',
    'Flag the question if the setup is taking too long.',
  ],
  commonTraps:
    'Placeholder warning box for hidden assumptions, reversed conditions, similar-looking options, and overcomplicated diagrams.',
  topics: [
    'Syllogisms',
    'Venn diagrams',
    'Logic puzzles',
    'Arguments',
    'Assumptions',
    'Probability',
  ],
  exampleSourceTitle: 'Sample Rule Set',
  exampleSource:
    'Placeholder rule set. In the real version, this area would contain a short logic setup, argument, or diagram prompt.',
  questionStem: 'Filler question stem: which option follows from the placeholder rule set?',
  workedSteps: [
    'Placeholder step 1: separate facts from assumptions.',
    'Placeholder step 2: draw or list the relationship being tested.',
    'Placeholder step 3: test each option against the stated rule.',
    'Placeholder step 4: choose the option that must follow, not merely could follow.',
  ],
  strategyStats: [
    ['37m', 'Timed section'],
    ['60s', 'Setup check'],
    ['2 pass', 'Review rhythm'],
  ],
  strategyChecklist: [
    'Placeholder logic setup habit.',
    'Placeholder elimination habit.',
    'Placeholder assumption-checking habit.',
    'Placeholder skip-and-return habit.',
  ],
  practiceRoute: 'DMQuestionList',
};

export default function DecisionMakingLearnScreen({ navigation }) {
  return <SectionLearnPrototypeScreen navigation={navigation} config={DECISION_MAKING_CONFIG} />;
}
