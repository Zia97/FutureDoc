import React, { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Animated,
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
import { useSubscription } from '../../context/SubscriptionContext';

const PREMIUM_LESSON_TYPES = new Set(['Strategy', 'Traps', 'Worked example']);

export const STORAGE_KEY = '@futuredoc/dm_learning_completed_lessons';

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Understand what Decision Making tests and the general method for every question.',
    icon: 'book',
    accentKey: 'teal',
    lessons: [
      {
        id: 'what-dm-tests',
        title: 'What DM tests',
        subtitle: 'Logic, problem solving, evaluating arguments, and conclusions from limited data.',
        duration: '4 min',
        type: 'Introduction',
        icon: 'brain',
        steps: [
          {
            title: 'The real skill',
            body: 'Decision Making checks how clearly you reason from limited information. It rewards careful, evidence-based thinking, not speed alone or memorised facts.',
          },
          {
            title: 'What DM is testing',
            bullets: [
              'Logic and problem solving.',
              'Evaluating arguments for relevance and strength.',
              'Interpreting tables, rules, and short data sets.',
              'Drawing conclusions only as far as the evidence allows.',
              'Separating what is proven from what is merely possible.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If a conclusion sounds reasonable but is not directly supported by the information, treat it as unproven.',
          },
        ],
      },
      {
        id: 'how-dm-works',
        title: 'How DM questions work',
        subtitle: 'Learn the different question styles that appear in Decision Making.',
        duration: '5 min',
        type: 'Introduction',
        icon: 'list',
        steps: [
          {
            title: 'DM is a mix',
            body: 'Decision Making is not one single question type. Each question has its own short setup, so the section feels varied compared with VR.',
          },
          {
            title: 'The main question types',
            bullets: [
              'Syllogisms and yes/no conclusions.',
              'Logic puzzles (ordering, grouping, matching).',
              'Venn diagrams and overlap questions.',
              'Probability questions.',
              'Interpreting information from rules, tables, or charts.',
              'Strongest argument questions.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before solving, identify the question type. The right method changes a lot between a syllogism, a Venn, and an argument question.',
          },
        ],
      },
      {
        id: 'core-dm-method',
        title: 'The core DM method',
        subtitle: 'Use a repeatable method for solving DM questions under pressure.',
        duration: '6 min',
        type: 'Core method',
        icon: 'target',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Read with intent',
            body: 'Read the question first so you know what you are looking for. Then read the rules or stimulus with that goal in mind, not as general background.',
          },
          {
            title: 'The eight-step routine',
            bullets: [
              'Read the question carefully.',
              'Identify the task and question type.',
              'Extract the facts you actually need.',
              'Represent them clearly (notes, table, diagram).',
              'Apply logic step by step.',
              'Eliminate options that go beyond the evidence.',
              'Avoid outside assumptions.',
              'Move on if the setup is taking too long.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If you cannot point to the rule or fact that proves the answer, you are guessing. Slow down or eliminate.',
          },
        ],
      },
      {
        id: 'when-to-draw',
        title: 'When to use diagrams, tables, or mental logic',
        subtitle: 'Know when to draw, when to table, and when to solve mentally.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'notes',
        steps: [
          {
            title: 'Pick the right tool',
            body: 'Some DM questions are fast in your head. Others quickly become messy without a small drawing or table. Choosing the right format saves you time later.',
          },
          {
            title: 'Use a visual when',
            bullets: [
              'Information involves overlapping groups (Venn).',
              'You are ordering, grouping, or matching items (table or list).',
              'A timeline or sequence is involved.',
              'There are several conditional rules to track.',
            ],
          },
          {
            title: 'Solve mentally when',
            body: 'There are only one or two facts, the question is short, and the answer choices are clearly different. In these cases, drawing wastes time.',
          },
          {
            title: 'Quick check',
            body: 'If you are re-reading the same rules more than twice, stop and write them down. Reading is not the same as understanding.',
          },
        ],
      },
    ],
  },
  {
    id: 'logic',
    title: 'Core Logic Skills',
    description: 'Build the logic foundations behind every DM question type.',
    icon: 'brain',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'statements-conclusions',
        title: 'Statements, conclusions, and assumptions',
        subtitle: 'Separate facts, conclusions, possibilities, and assumptions.',
        duration: '6 min',
        type: 'Logic skill',
        icon: 'notes',
        steps: [
          {
            title: 'Four levels of certainty',
            bullets: [
              'Stated: directly given by the information.',
              'Must follow: a conclusion that has to be true if the statements are true.',
              'Could be true: possible, but not proven.',
              'Assumed: something the answer needs but the question never gives.',
            ],
          },
          {
            title: 'Why this matters',
            body: 'DM answers are designed so plausible conclusions sit alongside fully proven ones. The trick is choosing only what the evidence forces.',
          },
          {
            title: 'Quick check',
            body: 'Ask: is this answer stated, forced, possible, or assumed? Only the first two types are safe.',
          },
        ],
      },
      {
        id: 'quantifiers',
        title: 'All, some, none, and not all',
        subtitle: 'Master the wording that controls many syllogism questions.',
        duration: '7 min',
        type: 'Logic skill',
        icon: 'filter',
        steps: [
          {
            title: 'What each word actually means',
            bullets: [
              'All A are B: every A is also a B.',
              'Some A are B: at least one A is a B (possibly all).',
              'No A are B: there is no overlap.',
              'Not all A are B: at least one A is not a B.',
            ],
          },
          {
            title: 'Mini example',
            body: 'Statement: Some doctors work in hospitals.\n\nWe can conclude that at least one doctor works in a hospital. We cannot conclude that most do, or that all do.',
          },
          {
            title: 'Common confusions',
            bullets: [
              '"Some" never means "most".',
              '"Not all" never means "none".',
              '"All" does not work backwards: all A are B does not mean all B are A.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Replace the quantifier with its weakest valid meaning. If the conclusion still holds, it is safe.',
          },
        ],
      },
      {
        id: 'if-then',
        title: 'If-then logic',
        subtitle: 'Avoid one of the most common DM mistakes: reversing the rule.',
        duration: '7 min',
        type: 'Logic skill',
        icon: 'target',
        steps: [
          {
            title: 'The rule pattern',
            body: 'If A, then B means: whenever A is true, B must be true. A is sufficient for B. B does not automatically prove A.',
          },
          {
            title: 'Mini example',
            body: 'Rule: If a student attends the revision session, they receive a booklet.\n\nCan we conclude that everyone with a booklet attended the session? No. They may have received the booklet another way.',
          },
          {
            title: 'Reversal traps',
            bullets: [
              'If A then B does not mean if B then A.',
              'If A then B does not mean if not A then not B.',
              'The only safe flip is the contrapositive: if not B then not A.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before accepting a conditional answer, ask whether you are using the rule forwards or reversing it without permission.',
          },
        ],
      },
      {
        id: 'must-vs-could',
        title: 'Must be true vs could be true',
        subtitle: 'Tell the difference between forced conclusions and ones that only might be true.',
        duration: '6 min',
        type: 'Logic skill',
        icon: 'check',
        steps: [
          {
            title: 'Must vs could',
            body: 'A conclusion that must be true is forced by the information. A conclusion that could be true is consistent with it but not forced. UCAT wants forced conclusions only, unless it asks otherwise.',
          },
          {
            title: 'Mini example',
            body: 'All students in Group A study Biology. Some Biology students study Chemistry.\n\nConclusion: Some students in Group A study Chemistry.\n\nThis does not follow. It could be true, but it is not guaranteed.',
          },
          {
            title: 'Test by counter-example',
            body: 'Ask: can I imagine a situation where the statements are still true but the conclusion is false? If yes, it is only "could be true".',
          },
          {
            title: 'Quick check',
            body: 'Plausible is not the same as proven. Treat plausible answers with suspicion in DM.',
          },
        ],
      },
      {
        id: 'elimination',
        title: 'Elimination logic',
        subtitle: 'Remove answers that sound good but are not logically valid.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'flag',
        steps: [
          {
            title: 'When elimination wins',
            body: 'Many DM answers look reasonable. Elimination is often faster than trying to prove the right answer first.',
          },
          {
            title: 'Eliminate answers that are',
            bullets: [
              'Too strong for the evidence given.',
              'Not actually proven.',
              'Contradicted by a rule or fact.',
              'Based on outside knowledge.',
              'Only partly supported by the information.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After eliminating, the remaining answer should be the one you can directly justify with a rule, fact, or simple deduction.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'Question Types',
    description: 'Learn the main UCAT Decision Making question types and how to attack each one.',
    icon: 'list',
    accentKey: 'blue',
    lessons: [
      {
        id: 'syllogisms',
        title: 'Syllogisms / Yes-No conclusions',
        subtitle: 'Decide whether each conclusion follows from the statements.',
        duration: '8 min',
        type: 'Question type',
        icon: 'check',
        practiceLabel: 'Practise syllogism questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'You get a few statements and several proposed conclusions. For each conclusion, decide whether it follows logically (Yes) or not (No).',
          },
          {
            title: 'The core rule',
            body: 'A conclusion follows only if it must be true given the statements. If the statements allow the conclusion to be false, the answer is No.',
          },
          {
            title: 'What you must ignore',
            bullets: [
              'Outside knowledge about the topic.',
              'How likely the conclusion sounds in real life.',
              'Whether the statements themselves are true in reality.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Reversing if-then logic.',
              'Treating "some" as "most" or "all".',
              'Adding details the statements never gave.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Try to imagine a case where the statements hold but the conclusion is false. If you can, the conclusion does not follow.',
          },
        ],
      },
      {
        id: 'logic-puzzles',
        title: 'Logic puzzles',
        subtitle: 'Organise rules clearly and turn messy information into deductions.',
        duration: '8 min',
        type: 'Question type',
        icon: 'list',
        practiceLabel: 'Practise logic puzzles',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type covers',
            bullets: [
              'Ordering questions (who is first, second, etc.).',
              'Grouping questions (which items go together).',
              'Matching questions (people to objects, days, or roles).',
              'Seating, ranking, and scheduling questions.',
            ],
          },
          {
            title: 'Set up before you solve',
            body: 'Draw a small grid or list. Write the names down one side and the slots across the top. Translate every rule into a short symbol you can apply directly.',
          },
          {
            title: 'Step-by-step deduction',
            bullets: [
              'Apply the most restrictive rule first.',
              'Mark forced placements before guessing.',
              'Test each remaining option against every rule.',
              'Keep "definitely yes" and "definitely no" separate.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If your grid still has many options open, look for a rule that combines two facts. Combinations usually unlock puzzles, not single rules.',
          },
        ],
      },
      {
        id: 'venn-diagrams',
        title: 'Venn diagrams',
        subtitle: 'Understand overlaps, totals, and only-regions without double counting.',
        duration: '8 min',
        type: 'Question type',
        icon: 'filter',
        practiceLabel: 'Practise Venn diagram questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'Venn questions ask you to read or build overlaps between groups. The trick is using the diagram correctly and not double counting people who fit more than one group.',
          },
          {
            title: 'Key regions to recognise',
            bullets: [
              'Only A: in A, but not B or C.',
              'A and B only: in both, but not C.',
              'All three: in every group.',
              'Outside all groups: in none.',
            ],
          },
          {
            title: 'Wording warnings',
            bullets: [
              '"Only" usually means a single region.',
              '"At least one" usually means a union of regions.',
              '"Both" means an intersection, not a total.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before answering, ask whether the question is about a single region, a union, or a total. The wording controls the calculation.',
          },
        ],
      },
      {
        id: 'interpreting-info',
        title: 'Interpreting information',
        subtitle: 'Extract the useful information from tables, rules, charts, and data.',
        duration: '7 min',
        type: 'Question type',
        icon: 'notes',
        practiceLabel: 'Practise DM data questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'You are given a short data set, table, chart, or rule list, and asked a focused question about it. The challenge is finding only what you need.',
          },
          {
            title: 'Read the question first',
            body: 'Read the question stem before studying the data. That tells you which row, column, or rule actually matters, so you do not absorb the whole stimulus.',
          },
          {
            title: 'Stay inside the data',
            bullets: [
              'Use only what is given.',
              'Do not assume trends continue beyond the data.',
              'Do not add categories that the table does not show.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After choosing, point to the cell, line, or rule that proves your answer. If you cannot, you are guessing.',
          },
        ],
      },
      {
        id: 'probability',
        title: 'Probability questions',
        subtitle: 'Handle simple and combined probability questions without overcomplicating them.',
        duration: '8 min',
        type: 'Question type',
        icon: 'calculator',
        practiceLabel: 'Practise probability questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'Basic probability logic, usually with whole numbers and short scenarios. UCAT does not need exotic formulas; it needs careful reading.',
          },
          {
            title: 'The core rules',
            bullets: [
              'Simple probability = favourable outcomes / total outcomes.',
              'Mutually exclusive events: add the probabilities.',
              'Independent events: multiply the probabilities.',
              'If events depend on each other, do not multiply blindly.',
            ],
          },
          {
            title: 'Watch out for wording',
            bullets: [
              '"At least one" usually means 1 minus the probability of none.',
              '"And" suggests multiplication for independent events.',
              '"Or" suggests addition for mutually exclusive events.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If your answer is greater than 1 or less than 0, the setup is wrong. Recheck whether you should have added or multiplied.',
          },
        ],
      },
      {
        id: 'strongest-argument',
        title: 'Strongest argument questions',
        subtitle: 'Choose the argument that is most relevant, logical, and directly focused.',
        duration: '7 min',
        type: 'Question type',
        icon: 'flame',
        practiceLabel: 'Practise strongest argument',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'You see a question (often a yes/no policy question) and several short arguments. Choose the strongest one for or against.',
          },
          {
            title: 'A strong argument is',
            bullets: [
              'Directly relevant to the question being asked.',
              'Logical, not just emotional.',
              'Supported by the topic, not by side issues.',
              'Realistic in scope - not exaggerated.',
            ],
          },
          {
            title: 'Two-step check',
            bullets: [
              'Step 1: relevance. Does this argument actually answer the question?',
              'Step 2: strength. Does it give a real reason, not just a feeling?',
            ],
          },
          {
            title: 'Quick check',
            body: 'A strong argument should still sound convincing if you remove every emotional adjective. If only the feeling remains, it is weak.',
          },
        ],
      },
      {
        id: 'weak-arguments',
        title: 'Weak arguments and irrelevant arguments',
        subtitle: 'Spot answer choices that sound persuasive but are logically weak.',
        duration: '6 min',
        type: 'Question type',
        icon: 'flag',
        steps: [
          {
            title: 'Common weak patterns',
            bullets: [
              'Pure emotional appeal with no reason.',
              'Extreme claims with no support.',
              'Irrelevant points that do not address the question.',
              'Unsupported predictions about the future.',
              'Arguments that are too narrow or too broad.',
            ],
          },
          {
            title: 'Why students still pick them',
            body: 'Weak arguments often sound passionate or moral. Under time pressure, that energy can feel like strength. UCAT tests whether you can see past it.',
          },
          {
            title: 'Quick check',
            body: 'If the argument relies on tone rather than reason, eliminate it. If it answers a different question, eliminate it.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Build the speed habits and trap awareness that protect marks under DM time pressure.',
    icon: 'target',
    accentKey: 'amber',
    lessons: [
      {
        id: 'timing-strategy',
        title: 'Timing strategy for DM',
        subtitle: 'Learn when to push, when to guess, and when to move on.',
        duration: '6 min',
        type: 'Timing',
        icon: 'timer',
        practiceLabel: 'Try a timed DM set',
        practiceRoute: 'timed',
        steps: [
          {
            title: 'DM time pressure is real',
            body: 'A full DM section gives roughly one minute per question. Some questions are fast, others are setup-heavy. Treat them as a budget, not an average.',
          },
          {
            title: 'Triage rules',
            bullets: [
              'Fast questions: answer immediately, then move on.',
              'Setup-heavy puzzles: judge after 30 seconds.',
              'Stuck on a puzzle: flag and skip, never grind.',
            ],
          },
          {
            title: 'Returning to flagged questions',
            body: 'Come back at the end with a fresh eye. Sometimes a small detail you missed becomes obvious once your brain has reset on other questions.',
          },
          {
            title: 'Quick check',
            body: 'Your aim is total marks across the section, not winning every puzzle. Protect the easy and medium marks first.',
          },
        ],
      },
      {
        id: 'simplify-wording',
        title: 'How to simplify complex wording',
        subtitle: 'Turn long wording into simple logic you can actually use.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'pencil',
        steps: [
          {
            title: 'Why this matters',
            body: 'DM rules are often packed with conditions. If you try to hold them all in your head, you will misread something. Rewriting them in shorter form is faster, not slower.',
          },
          {
            title: 'Shortening tools',
            bullets: [
              'Notes: rewrite the rule in three or four words.',
              'Symbols: A -> B for if A then B.',
              'Bullet points: one rule per line.',
              'Tables: rows for items, columns for properties.',
              'Diagrams: Venn or arrows for relations.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After rewriting, you should not need to look at the original wording while solving. If you keep going back, your notes are too short.',
          },
        ],
      },
      {
        id: 'logic-traps',
        title: 'Common logic traps',
        subtitle: 'Avoid the logic mistakes that cost students easy marks.',
        duration: '6 min',
        type: 'Traps',
        icon: 'flag',
        steps: [
          {
            title: 'The big trap family',
            bullets: [
              'Reversing if-then logic.',
              'Treating "some" as "all" or "most".',
              'Treating "could be true" as "must be true".',
              'Bringing in outside knowledge.',
              'Ignoring exact wording.',
              'Treating likely statements as proven ones.',
            ],
          },
          {
            title: 'Why these traps work',
            body: 'Each one offers a small shortcut that feels normal in everyday thinking. UCAT writes answer choices specifically to reward shortcuts.',
          },
          {
            title: 'Quick check',
            body: 'If an answer feels obviously right and you have not checked the wording, slow down. Obvious answers are often the trap.',
          },
        ],
      },
      {
        id: 'diagram-traps',
        title: 'Diagram traps',
        subtitle: 'Avoid common mistakes with Venn diagrams, tables, and puzzle layouts.',
        duration: '6 min',
        type: 'Traps',
        icon: 'filter',
        steps: [
          {
            title: 'Common diagram mistakes',
            bullets: [
              'Double counting people in overlapping regions.',
              'Misreading "only" as "in this group at all".',
              'Confusing an overlap with a total.',
              'Placing uncertain information into fixed positions.',
              'Forgetting that some information may be incomplete.',
            ],
          },
          {
            title: 'Build the diagram carefully',
            body: 'Add information one rule at a time. Mark anything uncertain in pencil-style notation, so it does not look like a confirmed fact later.',
          },
          {
            title: 'Quick check',
            body: 'Before answering, total your regions. If the totals contradict the question, your placement is wrong, not the data.',
          },
        ],
      },
      {
        id: 'data-traps',
        title: 'Probability and data traps',
        subtitle: 'Avoid the common mistakes that lead to tempting wrong answers.',
        duration: '6 min',
        type: 'Traps',
        icon: 'calculator',
        steps: [
          {
            title: 'Probability mistakes',
            bullets: [
              'Adding when you should multiply.',
              'Multiplying when events are not independent.',
              'Forgetting "at least one" needs a complement approach.',
            ],
          },
          {
            title: 'Data mistakes',
            bullets: [
              'Ignoring totals when the question depends on proportion.',
              'Comparing raw numbers instead of percentages.',
              'Forgetting which value is the denominator.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before locking in a probability or data answer, restate the question in your own words. If your answer answers a slightly different question, redo the calculation.',
          },
        ],
      },
      {
        id: 'argument-traps',
        title: 'Argument traps',
        subtitle: 'Why persuasive-sounding arguments are not always strong arguments.',
        duration: '5 min',
        type: 'Traps',
        icon: 'flame',
        steps: [
          {
            title: 'Tempting weak choices',
            bullets: [
              'Sound persuasive but are irrelevant.',
              'Are too emotional.',
              'Are too extreme to support.',
              'Make unsupported assumptions.',
              'Do not answer the question directly.',
              'Focus on a side issue.',
            ],
          },
          {
            title: 'Two filters before you pick',
            bullets: [
              'Relevance: does this answer the question being asked?',
              'Strength: does it give a real reason, not just a feeling?',
            ],
          },
          {
            title: 'Quick check',
            body: 'If the argument would still apply with the topic swapped to something unrelated, it is too generic to be the strongest answer.',
          },
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'See the DM method applied step by step, with the right and wrong reasoning side by side.',
    icon: 'notes',
    accentKey: 'mint',
    lessons: [
      {
        id: 'syllogism-example',
        title: 'Syllogism worked example',
        subtitle: 'See how to test whether a conclusion really follows.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'check',
        steps: [
          {
            title: 'Statements',
            body: 'All cardiologists are doctors. Some doctors work in research, not in hospitals.',
          },
          {
            title: 'Proposed conclusion',
            body: 'Some cardiologists work in research, not in hospitals.',
          },
          {
            title: 'Student reasoning',
            body: 'All cardiologists are doctors, and some doctors do research, but the statements never connect those specific groups. The research doctors might all be non-cardiologists.',
          },
          {
            title: 'Correct answer',
            body: 'Does not follow. The conclusion could be true, but it is not forced by the statements.',
          },
          {
            title: 'Common wrong reasoning',
            body: 'Students often assume that "some doctors" must include cardiologists. UCAT does not allow that bridge unless the wording makes it explicit.',
          },
        ],
      },
      {
        id: 'venn-example',
        title: 'Venn diagram worked example',
        subtitle: 'Work through an overlap question without double counting.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            title: 'Scenario',
            body: 'A class of 30 students. 18 study Biology, 14 study Chemistry, and 8 study both.',
          },
          {
            title: 'Question',
            body: 'How many students study Biology only?',
          },
          {
            title: 'Step-by-step placement',
            bullets: [
              'Place 8 in the overlap of Biology and Chemistry.',
              'Biology only = 18 - 8 = 10.',
              'Chemistry only = 14 - 8 = 6.',
              'Total accounted for = 10 + 6 + 8 = 24, leaving 6 outside both.',
            ],
          },
          {
            title: 'Correct answer',
            body: '10 students study Biology only.',
          },
          {
            title: 'Common wrong reasoning',
            body: 'Students often answer 18, forgetting that the 8 in the overlap should be subtracted to find the "only Biology" region.',
          },
        ],
      },
      {
        id: 'puzzle-example',
        title: 'Logic puzzle worked example',
        subtitle: 'See how to organise puzzle rules and make deductions.',
        duration: '8 min',
        type: 'Worked example',
        icon: 'list',
        steps: [
          {
            title: 'Setup',
            body: 'Four students - P, Q, R, S - finish 1st to 4th in a quiz. P finishes higher than Q. R does not finish 1st. S finishes immediately after P.',
          },
          {
            title: 'Apply the rules',
            bullets: [
              'P is higher than Q, and S is just below P, so the order has a P-S block.',
              'R is not 1st, so 1st must be P, Q, or S. From the block, P sits above S, so P is a candidate for 1st.',
              'Test P=1, S=2. Then Q and R fill 3 and 4. P > Q is satisfied. R is not 1st. All rules hold.',
            ],
          },
          {
            title: 'Final order',
            body: 'P, S, Q, R or P, S, R, Q. Both satisfy all rules.',
          },
          {
            title: 'Why this matters',
            body: 'Some puzzles have more than one valid order. UCAT will only ask things that are true for every valid order. Recognising that protects you from over-claiming.',
          },
          {
            title: 'Common wrong reasoning',
            body: 'Students fix Q at 3rd or R at 4th too early, then misread the question as if there is only one valid order.',
          },
        ],
      },
      {
        id: 'probability-example',
        title: 'Probability worked example',
        subtitle: 'Apply probability rules step by step.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'calculator',
        steps: [
          {
            title: 'Scenario',
            body: 'A bag contains 5 red and 3 blue counters. Two counters are drawn one after the other, without replacement.',
          },
          {
            title: 'Question',
            body: 'What is the probability that both counters are red?',
          },
          {
            title: 'Calculation steps',
            bullets: [
              'P(first red) = 5/8.',
              'After taking one red, 4 red and 3 blue remain (7 total).',
              'P(second red | first red) = 4/7.',
              'P(both red) = 5/8 x 4/7 = 20/56 = 5/14.',
            ],
          },
          {
            title: 'Common trap',
            body: 'Students often calculate 5/8 x 5/8, forgetting that the first counter is not replaced. Always check whether the second event still has the same total.',
          },
          {
            title: 'Final answer',
            body: '5/14.',
          },
        ],
      },
      {
        id: 'argument-example',
        title: 'Strongest argument worked example',
        subtitle: 'Choose the strongest argument, not just the nicest-sounding one.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'flame',
        steps: [
          {
            title: 'Question',
            body: 'Should secondary schools provide a free hot meal to every student each day?',
          },
          {
            title: 'Answer choices',
            bullets: [
              'A: Yes, because hungry students cannot focus, and a guaranteed meal directly removes that barrier to learning.',
              'B: Yes, because every child deserves to feel cared for at school.',
              'C: No, because parents should be responsible for feeding their own children.',
              'D: No, because adding new services always leads to more government spending.',
            ],
          },
          {
            title: 'Relevance check',
            body: 'A and C address the school context directly. B is emotional but does not give a clear reason. D is generic and not specific to the topic.',
          },
          {
            title: 'Strength check',
            body: 'A gives a logical reason linked to the actual purpose of school. C raises a related point but is more about responsibility than effect. B and D do not really argue from evidence.',
          },
          {
            title: 'Correct answer',
            body: 'A is the strongest argument because it is directly relevant to the question and gives a logical, specific reason linked to learning.',
          },
        ],
      },
    ],
  },
];

export const ALL_LESSONS = MODULES.flatMap((module) =>
  module.lessons.map((lesson) => ({
    ...lesson,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleAccentKey: module.accentKey,
  })),
).map((lesson, index) => ({ ...lesson, number: index + 1 }));

export const VALID_LESSON_IDS = new Set(ALL_LESSONS.map((lesson) => lesson.id));
export const TOTAL_LESSONS = ALL_LESSONS.length;
export const ESTIMATED_TIME = '55 min';

function getAccent(colors, accentKey) {
  return colors[accentKey] ?? colors.blue;
}

function ProgressBar({ progress, color, colors, isDark, style }) {
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.64)' : 'rgba(219, 234, 254, 0.82)',
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function StatPill({ value, label, colors, isDark }) {
  return (
    <View
      style={[
        styles.statPill,
        {
          backgroundColor: isDark ? 'rgba(5, 12, 26, 0.52)' : 'rgba(255, 255, 255, 0.72)',
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function PrimaryButton({ label, icon = 'chevron-right', onPress, color, disabled = false, variant = 'filled', style }) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        isOutline
          ? { backgroundColor: 'transparent', borderColor: hexToRgba(color, 0.42), borderWidth: 1 }
          : { backgroundColor: color, borderColor: color, borderWidth: 1 },
        disabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
    >
      <PremiumIcon name={icon} size={18} color={isOutline ? color : '#FFFFFF'} strokeWidth={2.3} />
      <Text style={[styles.actionButtonText, { color: isOutline ? color : '#FFFFFF' }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function HeroCard({ completedCount, progress, nextLesson, allComplete, colors, gradients, isDark, onContinue }) {
  const accent = colors.teal ?? colors.cyan ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon="person-cog" accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>DECISION MAKING</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Master UCAT logic step by step.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        Learn syllogisms, puzzles, Venn diagrams, probability, arguments, traps, and timing strategy.
      </Text>

      <View style={styles.heroProgressHeader}>
        <Text style={[styles.progressLabel, { color: colors.text }]}>
          Progress: {completedCount} / {TOTAL_LESSONS} lessons complete
        </Text>
        <Text style={[styles.progressPercent, { color: accent }]}>{Math.round(progress * 100)}%</Text>
      </View>
      <ProgressBar progress={progress} color={accent} colors={colors} isDark={isDark} />

      <View style={styles.statRow}>
        <StatPill value={`${completedCount}/${TOTAL_LESSONS}`} label="Lessons" colors={colors} isDark={isDark} />
        <StatPill value={ESTIMATED_TIME} label="Estimate" colors={colors} isDark={isDark} />
        <StatPill value={`${MODULES.length}`} label="Modules" colors={colors} isDark={isDark} />
      </View>

      <PrimaryButton
        label={allComplete ? 'Start DM Practice' : nextLesson ? `Continue: ${nextLesson.title}` : 'Continue Learning'}
        icon={allComplete ? 'pencil' : 'play'}
        color={accent}
        onPress={onContinue}
        style={styles.heroButton}
      />
    </LinearGradient>
  );
}

function StatusPill({ status, colors, isDark }) {
  const meta = {
    completed: { label: 'Completed', icon: 'check', color: colors.mint },
    inProgress: { label: 'In progress', icon: 'play', color: colors.blue },
    next: { label: 'Next up', icon: 'target', color: colors.cyan },
    notStarted: { label: 'Not started', icon: 'book', color: colors.textMuted },
  }[status];

  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: status === 'notStarted'
            ? (isDark ? 'rgba(113, 136, 166, 0.1)' : 'rgba(100, 116, 139, 0.08)')
            : hexToRgba(meta.color, isDark ? 0.14 : 0.1),
          borderColor: status === 'notStarted' ? colors.border : hexToRgba(meta.color, 0.38),
        },
      ]}
    >
      <PremiumIcon name={meta.icon} size={13} color={meta.color} strokeWidth={2.4} />
      <Text style={[styles.statusText, { color: meta.color }]} numberOfLines={1}>{meta.label}</Text>
    </View>
  );
}

function LessonCard({ lesson, status, accent, colors, isDark, onPress, isPremium }) {
  const completed = status === 'completed';
  const active = status === 'inProgress' || status === 'next';
  const borderColor = completed
    ? hexToRgba(colors.mint, 0.48)
    : active
      ? hexToRgba(accent, 0.58)
      : colors.border;
  const iconColor = completed ? colors.mint : active ? accent : colors.textMuted;

  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} style={styles.lessonTouch} accessibilityRole="button">
      <View
        style={[
          styles.lessonCard,
          {
            backgroundColor: active
              ? hexToRgba(accent, isDark ? 0.09 : 0.06)
              : (isDark ? 'rgba(8, 20, 38, 0.72)' : 'rgba(255, 255, 255, 0.82)'),
            borderColor,
          },
        ]}
      >
        <View
          style={[
            styles.lessonNumber,
            {
              backgroundColor: hexToRgba(iconColor, completed ? 0.18 : 0.12),
              borderColor: hexToRgba(iconColor, 0.36),
            },
          ]}
        >
          {completed ? (
            <PremiumIcon name="check" size={18} color={colors.mint} strokeWidth={2.8} />
          ) : (
            <Text style={[styles.lessonNumberText, { color: iconColor }]}>{lesson.number}</Text>
          )}
        </View>

        <View style={styles.lessonCopy}>
          <View style={styles.lessonTitleRow}>
            <PremiumIcon name={lesson.icon} size={18} color={iconColor} strokeWidth={2.1} />
            <Text style={[styles.lessonTitle, { color: colors.text }]} numberOfLines={2}>{lesson.title}</Text>
          </View>
          <Text style={[styles.lessonSubtitle, { color: colors.textSecondary }]}>{lesson.subtitle}</Text>
          <View style={styles.lessonMetaRow}>
            <Text style={[styles.lessonMeta, { color: colors.textMuted }]}>{lesson.duration} - {lesson.type}</Text>
            <StatusPill status={status} colors={colors} isDark={isDark} />
          </View>
        </View>

        {isPremium ? (
          <PremiumIcon name="lock" size={20} color={colors.amber ?? '#f59e0b'} strokeWidth={2.4} />
        ) : (
          <PremiumIcon name="chevron-right" size={22} color={active ? accent : colors.textMuted} strokeWidth={2.4} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function ModuleSection({ module, completedIds, nextLessonId, colors, isDark, onSelectLesson, expanded, onToggle, isPro }) {
  const accent = getAccent(colors, module.accentKey);
  const completedInModule = module.lessons.filter((lesson) => completedIds.includes(lesson.id)).length;
  const progress = completedInModule / module.lessons.length;

  return (
    <View style={styles.moduleSection}>
      <TouchableOpacity activeOpacity={0.84} onPress={onToggle} accessibilityRole="button" accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${module.title}`}>
        <View style={styles.moduleHeader}>
          <View style={[styles.moduleIcon, { backgroundColor: hexToRgba(accent, 0.12), borderColor: hexToRgba(accent, 0.34) }]}>
            <PremiumIcon name={module.icon} size={21} color={accent} strokeWidth={2.2} />
          </View>
          <View style={styles.moduleCopy}>
            <View style={styles.moduleTitleRow}>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
              <View style={styles.moduleHeaderRight}>
                <Text style={[styles.moduleCount, { color: accent }]}>{completedInModule}/{module.lessons.length}</Text>
                <PremiumIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} strokeWidth={2.4} />
              </View>
            </View>
            <Text style={[styles.moduleDescription, { color: colors.textSecondary }]}>{module.description}</Text>
            <ProgressBar progress={progress} color={accent} colors={colors} isDark={isDark} style={styles.moduleProgress} />
          </View>
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.lessonList}>
          {module.lessons.map((lesson) => {
            const numberedLesson = ALL_LESSONS.find((item) => item.id === lesson.id);
            const status = completedIds.includes(lesson.id)
              ? 'completed'
              : nextLessonId === lesson.id
                ? 'next'
                : 'notStarted';

            return (
              <LessonCard
                key={lesson.id}
                lesson={numberedLesson}
                status={status}
                accent={accent}
                colors={colors}
                isDark={isDark}
                isPremium={PREMIUM_LESSON_TYPES.has(numberedLesson?.type) && !isPro}
                onPress={() => onSelectLesson(lesson.id)}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function PracticeHandOff({ allComplete, colors, isDark, onPractice, onTimed }) {
  const heroAccent = colors.teal ?? colors.cyan ?? colors.blue;

  return (
    <View
      style={[
        styles.practiceCard,
        {
          backgroundColor: isDark ? 'rgba(10, 29, 55, 0.86)' : 'rgba(255, 255, 255, 0.86)',
          borderColor: hexToRgba(allComplete ? colors.mint : heroAccent, 0.44),
        },
      ]}
    >
      <View style={[styles.practiceIcon, { backgroundColor: hexToRgba(allComplete ? colors.mint : heroAccent, 0.12), borderColor: hexToRgba(allComplete ? colors.mint : heroAccent, 0.32) }]}>
        <PremiumIcon name={allComplete ? 'check' : 'target'} size={24} color={allComplete ? colors.mint : heroAccent} strokeWidth={2.4} />
      </View>
      <View style={styles.practiceCopy}>
        <Text style={[styles.practiceTitle, { color: colors.text }]}>
          {allComplete ? 'DM Learning Complete' : 'Ready to apply it?'}
        </Text>
        <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
          {allComplete
            ? 'You have finished the DM learning pathway. Move into practice while the method is fresh.'
            : 'Open untimed DM practice when you want to turn a lesson into repetition.'}
        </Text>
        <View style={styles.practiceButtons}>
          <PrimaryButton label="Start DM Practice" icon="pencil" color={heroAccent} onPress={onPractice} style={styles.practiceButton} />
          <PrimaryButton label="Start Timed DM Test" icon="timer" color={colors.cyan} variant="outline" onPress={onTimed} style={styles.practiceButton} />
        </View>
      </View>
    </View>
  );
}

export default function DecisionMakingLearnScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { isPro } = useSubscription();
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedModules, setExpandedModules] = useState(() => MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {}));
  const introAnim = useFadeSlide(0, 14);
  const contentAnim = useFadeSlide(120, 16);

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const handleResetProgress = useCallback(() => {
    Alert.alert(
      'Reset DM progress?',
      'This will clear all your completed lessons in Decision Making. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
            setCompletedIds([]);
          },
        },
      ],
    );
  }, []);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (!raw) {
          setCompletedIds([]);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedIds(parsed.filter((id) => VALID_LESSON_IDS.has(id)));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []));

  const completedCount = completedIds.length;
  const progress = completedCount / TOTAL_LESSONS;
  const allComplete = completedCount === TOTAL_LESSONS;

  const nextLesson = useMemo(
    () => ALL_LESSONS.find((lesson) => !completedIds.includes(lesson.id)) ?? ALL_LESSONS[TOTAL_LESSONS - 1],
    [completedIds],
  );

  const openPractice = useCallback(() => {
    navigation.navigate('DMQuestionList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'DM', title: 'Decision Making' });
  }, [navigation]);

  const openLesson = useCallback((lessonId) => {
    const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
    if (!isPro && lesson && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('LearnDMLesson', { lessonId });
  }, [isPro, navigation]);

  const handleContinue = useCallback(() => {
    if (allComplete) {
      openPractice();
      return;
    }
    openLesson(nextLesson.id);
  }, [allComplete, nextLesson.id, openLesson, openPractice]);

  return (
    <PremiumScreen>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bgTop} />
      <AppHeader navigation={navigation} title="Learn DM" />

      <PremiumScrollView>
        <Animated.View style={introAnim}>
          <HeroCard
            completedCount={completedCount}
            progress={progress}
            nextLesson={nextLesson}
            allComplete={allComplete}
            colors={colors}
            gradients={gradients}
            isDark={isDark}
            onContinue={handleContinue}
          />
        </Animated.View>

        <Animated.View style={contentAnim}>
          <View style={styles.pathIntro}>
            <View style={styles.pathIntroRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Your DM Path</Text>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={handleResetProgress}
                style={[
                  styles.resetButton,
                  {
                    backgroundColor: isDark ? 'rgba(17, 31, 55, 0.82)' : 'rgba(255, 255, 255, 0.82)',
                    borderColor: colors.border,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Reset DM progress"
              >
                <PremiumIcon name="refresh" size={18} color={colors.textSecondary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Follow the recommended order, or open any lesson when you want to review a specific skill.
            </Text>
          </View>

          {MODULES.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              completedIds={completedIds}
              nextLessonId={nextLesson?.id}
              colors={colors}
              isDark={isDark}
              onSelectLesson={openLesson}
              expanded={!!expandedModules[module.id]}
              onToggle={() => toggleModule(module.id)}
              isPro={isPro}
            />
          ))}

          <PracticeHandOff
            allComplete={allComplete}
            colors={colors}
            isDark={isDark}
            onPractice={openPractice}
            onTimed={openTimedPractice}
          />
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
    marginBottom: 22,
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
  heroProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
    marginBottom: 9,
  },
  progressLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  progressPercent: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statPill: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  heroButton: {
    marginTop: 16,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.62,
  },
  actionButtonText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  pathIntro: {
    marginBottom: 16,
  },
  pathIntroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  moduleSection: {
    marginBottom: 22,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  moduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleCopy: {
    flex: 1,
    minWidth: 0,
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  moduleTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
  },
  moduleCount: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  moduleProgress: {
    height: 8,
    marginTop: 10,
  },
  lessonList: {
    gap: 10,
  },
  lessonTouch: {
    borderRadius: 18,
  },
  lessonCard: {
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  lessonCopy: {
    flex: 1,
    minWidth: 0,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  lessonSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  lessonMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  statusPill: {
    minHeight: 25,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '900',
  },
  practiceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
  },
  practiceIcon: {
    width: 46,
    height: 46,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceCopy: {
    flex: 1,
    minWidth: 0,
  },
  practiceTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
  },
  practiceText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  practiceButtons: {
    gap: 10,
    marginTop: 14,
  },
  practiceButton: {
    minHeight: 46,
  },
});
