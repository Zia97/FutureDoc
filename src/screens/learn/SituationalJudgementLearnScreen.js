import React from 'react';

import SectionLearnPrototypeScreen from './SectionLearnPrototypeScreen';

const SITUATIONAL_JUDGEMENT_CONFIG = {
  headerTitle: 'Learn SJ',
  shortName: 'Situational Judgement',
  eyebrow: 'SITUATIONAL JUDGEMENT',
  heroTitle: 'Learn the judgement pattern before the scenario starts.',
  heroBody:
    'This filler module shows how Situational Judgement could teach professional principles, ranking logic, and worked scenarios.',
  icon: 'stethoscope',
  accentKey: 'mint',
  stats: [
    ['6', 'Lessons'],
    ['11', 'Examples'],
    ['22m', 'Estimate'],
  ],
  lessonCards: [
    { title: 'Filler professional principles', meta: '4 min - Beginner', icon: 'shield-heart' },
    { title: 'Filler response ranking', meta: '5 min - Core skill', icon: 'list' },
    { title: 'Filler scenario walkthrough', meta: '6 min - Example led', icon: 'notes' },
  ],
  coreIdea:
    'Placeholder theory paragraph for Situational Judgement. This area would explain the professional principle being tested in a concise way.',
  approachSteps: [
    'Identify the main concern in the scenario.',
    'Separate immediate safety issues from communication issues.',
    'Rank actions by professionalism and practicality.',
    'Avoid extreme responses unless the scenario clearly justifies them.',
  ],
  commonTraps:
    'Placeholder warning box for overly passive answers, over-escalation, ignoring patient safety, and choosing what feels nice rather than appropriate.',
  topics: [
    'Patient safety',
    'Confidentiality',
    'Teamwork',
    'Honesty',
    'Escalation',
    'Ranking actions',
  ],
  exampleSourceTitle: 'Sample Scenario',
  exampleSource:
    'Placeholder professional scenario. In the real version, this area would contain the situation that the worked example refers to.',
  questionStem: 'Filler question stem: which response is the most appropriate in the placeholder scenario?',
  workedSteps: [
    'Placeholder step 1: identify the person at risk or the professional duty involved.',
    'Placeholder step 2: remove options that ignore the main concern.',
    'Placeholder step 3: compare the remaining actions for proportionality.',
    'Placeholder step 4: choose the response that is professional, practical, and timely.',
  ],
  strategyStats: [
    ['26m', 'Timed section'],
    ['25s', 'Scenario read'],
    ['Bands', 'Score style'],
  ],
  strategyChecklist: [
    'Placeholder principle-first habit.',
    'Placeholder patient-safety habit.',
    'Placeholder escalation habit.',
    'Placeholder ranking-comparison habit.',
  ],
  practiceRoute: 'SJScenarioList',
};

export default function SituationalJudgementLearnScreen({ navigation }) {
  return <SectionLearnPrototypeScreen navigation={navigation} config={SITUATIONAL_JUDGEMENT_CONFIG} />;
}
