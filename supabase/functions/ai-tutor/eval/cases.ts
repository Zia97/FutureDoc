export type TutorEvalCase = {
  id: string;
  section: 'vr' | 'dm' | 'qr' | 'sj';
  questionType: string;
  question: string;
  passage?: string;
  options?: string[];
  stimulusData?: unknown;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  studentMessage: string;
  expectedRecordStatus: 'consistent' | 'possible_error';
  mustMentionAny: string[];
};

export const TUTOR_EVAL_CASES: TutorEvalCase[] = [
  {
    id: 'vr-cant-tell-vs-false',
    section: 'vr',
    questionType: 'true_false_cant_tell',
    passage: 'The survey recorded how often 500 commuters used buses. It did not ask participants why they chose their mode of transport.',
    question: 'Most commuters chose buses because they were cheaper than trains.',
    options: ['True', 'False', "Can't Tell"],
    userAnswer: 'False',
    correctAnswer: "Can't Tell",
    explanation: 'The passage gives no reason for the commuters’ choices, so the claim is neither confirmed nor contradicted.',
    studentMessage: 'Why is it not false if the passage never says that?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['contradict', 'neither', "can't tell", 'absence'],
  },
  {
    id: 'dm-contrapositive',
    section: 'dm',
    questionType: 'syllogism',
    question: 'All tickets with parking include drink tokens. Sam has no drink tokens. Conclusion: Sam has no parking.',
    userAnswer: 'No',
    correctAnswer: 'Yes',
    explanation: 'Parking implies drink tokens, so no drink tokens implies no parking by the contrapositive.',
    studentMessage: 'I thought we are not allowed to reverse the statement?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['contrapositive', 'flip', 'negate', 'parking'],
  },
  {
    id: 'dm-probability-without-replacement',
    section: 'dm',
    questionType: 'probabilistic',
    question: 'A bag has 5 yellow and 10 other tokens. Two are drawn without replacement. What is the probability both are yellow?',
    userAnswer: '1/9',
    correctAnswer: '2/21',
    explanation: 'Multiply 5/15 by 4/14 to obtain 2/21.',
    studentMessage: 'Why does the second fraction change?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['without replacement', 'removed', '4', '14'],
  },
  {
    id: 'dm-strongest-argument',
    section: 'dm',
    questionType: 'strongest_argument',
    question: 'Should cycle helmets be compulsory to reduce head injuries?',
    options: [
      'A. Yes; peer-reviewed studies show a large reduction in head-injury risk.',
      'B. No; helmets often look unattractive.',
    ],
    userAnswer: 'B',
    correctAnswer: 'A',
    explanation: 'A directly links the proposal to the stated outcome using relevant evidence.',
    studentMessage: 'Why does evidence make A stronger?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['relevant', 'evidence', 'proposition', 'head injur'],
  },
  {
    id: 'qr-reverse-percentage',
    section: 'qr',
    questionType: 'text',
    question: 'After a 20% increase, a fee is £72. What was the original fee?',
    options: ['A. £52', 'B. £57.60', 'C. £60', 'D. £86.40'],
    userAnswer: 'B',
    correctAnswer: 'C',
    explanation: '£72 is 120% of the original, so divide 72 by 1.2 to get £60.',
    studentMessage: 'Why can’t I take 20% off £72?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['1.2', 'divide', 'original', 'different base'],
  },
  {
    id: 'qr-unit-conversion',
    section: 'qr',
    questionType: 'table',
    question: 'A pump moves 18 litres per minute. How many litres does it move in 2.5 hours?',
    userAnswer: '45 litres',
    correctAnswer: '2,700 litres',
    explanation: 'Convert 2.5 hours to 150 minutes, then calculate 18 × 150 = 2,700 litres.',
    studentMessage: 'Where did I go wrong?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['150', 'minutes', '2,700', 'unit'],
  },
  {
    id: 'sj-local-resolution',
    section: 'sj',
    questionType: 'appropriateness',
    question: 'A colleague makes a single dismissive comment with no immediate patient-safety risk. A student reports them formally without first speaking privately.',
    userAnswer: 'Very appropriate',
    correctAnswer: 'Appropriate but not ideal',
    explanation: 'Raising the concern helps, but a private local conversation should normally be tried first when there is no immediate safety risk.',
    studentMessage: 'Why is reporting it not the best possible response?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['local', 'private', 'proportion', 'safety'],
  },
  {
    id: 'sj-competence',
    section: 'sj',
    questionType: 'appropriateness',
    question: 'A medical student performs an unfamiliar procedure alone because the ward is busy.',
    userAnswer: 'Appropriate but not ideal',
    correctAnswer: 'Very inappropriate',
    explanation: 'Acting beyond competence without supervision creates a direct patient-safety risk.',
    studentMessage: 'Isn’t helping better than doing nothing?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['competence', 'patient safety', 'supervision', 'risk'],
  },
  {
    id: 'sj-importance-patient-safety',
    section: 'sj',
    questionType: 'importance',
    question: 'When deciding how to respond to a prescribing error, consider whether the medicine has already reached the patient.',
    userAnswer: 'Of minor importance',
    correctAnswer: 'Very important',
    explanation: 'Whether the patient received the medicine changes the immediate safety risk and urgency of action.',
    studentMessage: 'Why does this factor matter so much?',
    expectedRecordStatus: 'consistent',
    mustMentionAny: ['patient', 'safety', 'risk', 'urgent'],
  },
  {
    id: 'vr-genuine-record-discrepancy',
    section: 'vr',
    questionType: 'verbal_reasoning',
    passage: 'The trial enrolled exactly 12 volunteers in its first phase.',
    question: 'How many volunteers were enrolled in the first phase?',
    options: ['A. 10', 'B. 12', 'C. 21', 'D. 120'],
    userAnswer: 'B',
    correctAnswer: 'C',
    explanation: 'The passage states that 21 volunteers entered the first phase.',
    studentMessage: 'The passage says 12, so why is the answer 21?',
    expectedRecordStatus: 'possible_error',
    mustMentionAny: ['12', 'flag', 'review', 'discrep'],
  },
];
