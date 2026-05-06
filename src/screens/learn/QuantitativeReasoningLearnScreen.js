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
import { usePaywallNavigation } from '../../hooks/ui/usePaywallNavigation';
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import { QR_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const PREMIUM_LESSON_TYPES = new Set(['Strategy', 'Traps', 'Worked example']);

export const STORAGE_KEY = QR_LEARN_STORAGE_KEY;

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Orientation, test mechanics, and the default process you will use on every QR question.',
    icon: 'book',
    accentKey: 'purple',
    lessons: [
      {
        id: 'what-qr-tests',
        title: 'What QR is testing',
        subtitle: 'Welcome to QR. Before any maths, learn what this section is really checking — and what it is not.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This is the very first lesson of the QR pathway. By the end of it you will know what Quantitative Reasoning actually tests, why it is built the way it is, and the broad skills the section is checking. No maths yet — just orientation.',
          },
          {
            title: 'What QR is in one sentence',
            body: 'Quantitative Reasoning (QR) is the part of the UCAT that checks whether you can use straightforward maths in a fast, practical way to solve problems built around data — usually charts, tables, and short scenarios.',
          },
          {
            title: 'The numbers behind the section',
            bullets: [
              '36 questions in 26 minutes — roughly 43 seconds per question on average.',
              'A separate 2-minute instructions screen runs before the timer starts.',
              'Each question is worth 1 mark; there is no negative marking.',
              'QR contributes to the cognitive score (out of 2,700) along with VR and DM.',
              'Abstract Reasoning has been removed from the test — QR sits alongside VR, DM, and SJ only.',
            ],
          },
          {
            title: 'The skills being tested',
            bullets: [
              'Percentages, ratios, fractions, and averages.',
              'Rates, units, and basic conversions.',
              'Reading tables, charts, and short scenarios accurately.',
              'Translating word problems into the right calculation.',
              'Speed and accurate decision-making under exam time pressure.',
            ],
          },
          {
            kind: 'rule',
            title: 'The big idea',
            body: 'QR is not won by doing more maths than other students; it is won by choosing the right maths faster. The challenge is rarely "Can you do hard maths?" and much more often "Can you spot which numbers matter, pick the right method, and avoid wasting time?"',
          },
          {
            title: 'What QR is NOT testing',
            bullets: [
              'It is not a school maths exam — there is no algebraic proof, calculus, or trigonometry.',
              'It is not a test of memorised formulas alone — you have to apply them to data.',
              'It is not testing whether you can do every calculation precisely without a calculator.',
            ],
          },
          {
            kind: 'tip',
            title: 'Why time pressure is the real opponent',
            body: '36 questions in 26 minutes feels short because each question asks two things at once: read the data correctly AND choose the right operation. Both use working memory, which is why pacing feels tighter than the raw timer suggests.',
          },
        ],
      },
      {
        id: 'how-qr-works',
        title: 'How QR questions work',
        subtitle: 'Most QR questions can be read in four layers. Once you can see them, you stop wasting time reading the wrong things.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'list',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Now that you know what QR tests, this lesson shows you how an individual question is usually built. Most QR items follow the same shape, and once you can see that shape, you stop drowning in data and start hunting for what you actually need.',
          },
          {
            title: 'The four layers of a QR item',
            bullets: [
              'Question stem — what are you being asked to find?',
              'Data source — a table, graph, diagram, or short passage.',
              'Conditions — small notes, units, dates, exclusions, discounts, limits.',
              'Answer options — five choices (A–E); useful for estimation, but only after you know the task.',
            ],
          },
          {
            title: 'Single questions vs sets',
            body: 'A QR question can stand alone, but more often you will see a set: one chart, table, or scenario followed by 2-4 separate questions. The same data source is reused across the set, but each question can ask about a different slice of it.',
          },
          {
            title: 'What the data source can look like',
            bullets: [
              'A table of values.',
              'A bar, line, pie, or scatter chart.',
              'A short written scenario.',
              'A diagram or simple figure.',
              'Sometimes nothing at all — just a calculation.',
            ],
          },
          {
            kind: 'rule',
            title: 'Read the question first',
            body: 'Before studying the data, read the question stem. That tells you exactly which row, column, or value to look for, so you do not try to memorise the whole data source before you know why you are reading it.',
          },
          {
            kind: 'tip',
            title: 'Sets reuse the data — but each question asks something different',
            body: 'When several questions share one chart, do not re-scan the whole chart from scratch every time. Re-read the next stem first, decide what changed, and only re-look at the part of the data that matters.',
          },
        ],
      },
      {
        id: 'core-qr-method',
        title: 'The core QR method',
        subtitle: 'One repeatable process you will apply to every QR question, before any specific topic. Learn this before anything else.',
        duration: '5 min',
        type: 'Core method',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Most students do not lose marks on QR because they cannot do the maths — they lose marks because they start calculating before they have read carefully. This lesson teaches the default sequence to apply to every question, before any topic-specific knowledge.',
          },
          {
            title: 'The eight-step routine',
            bullets: [
              'Read the question stem first.',
              'Identify the target — what final quantity is needed.',
              'Check units and any conditions in the stem or stimulus notes.',
              'Select only the relevant data (one cell, one bar, one sentence).',
              'Glance at the answer options to gauge how close they are.',
              'Estimate the rough answer.',
              'Calculate (mentally or with the calculator) only if needed.',
              'Sense-check the size and units before locking in.',
            ],
          },
          {
            kind: 'rule',
            title: 'Estimate before you calculate',
            body: 'A 5-second estimate catches mistypes, magnitude errors, and unit slips. It also tells you whether you even need a precise calculation, or if the rough answer already eliminates four of the five options.',
          },
          {
            title: 'When to stop and move on',
            body: 'If the question is taking far longer than the average 43 seconds and you do not see the path, flag it, make your best guess, and move on. This is not failure — it is a decision rule to protect your other marks.',
          },
          {
            kind: 'mini',
            prompt: 'A bill of £48 increases by 12.5%. The answer options are roughly £50, £54, £58, £60, £72. Best first move?',
            options: [
              'Open the calculator and type 48 × 1.125.',
              'Estimate: 10% of 48 is 4.8, so the answer should be a bit above £53.',
              'Pick the middle option, since the question is medium difficulty.',
              'Skip the question — there is no quick way.',
            ],
            correctIndex: 1,
            explanation: 'A 5-second mental estimate gives "a bit above £53", which singles out £54. Calculator entry takes longer than the estimate, and the maths agrees: 12.5% = 1/8, and 48 ÷ 8 = 6, so 48 + 6 = £54.',
          },
          {
            kind: 'mini',
            prompt: 'You finish step one of a two-step problem and see your intermediate value sitting in the answer options. Should you click it?',
            options: [
              'Yes — your value matches an option, so it must be correct.',
              'No — UCAT routinely plants intermediate values as decoys. Finish the second step.',
              'Only if it is option A.',
            ],
            correctIndex: 1,
            explanation: 'Intermediate-value traps are one of the most common QR mistakes. If your answer matches an option but the calculation felt suspiciously short, recheck the stem — there is usually a final step you have missed.',
          },
          {
            kind: 'tip',
            title: 'Why "read the question first" sounds obvious but is hard',
            body: 'Under time pressure, most students skim the data first because it is visually loud. A bar chart shouts at you; a question stem mumbles. Train the discipline of looking away from the chart until you have read the stem.',
          },
          {
            kind: 'checklist',
            title: 'My core QR method',
            items: [
              'Read the question stem first.',
              'Identify the target value and its units.',
              'Select only the relevant data.',
              'Glance at the answer options to choose estimate vs precise.',
              'Estimate, then calculate if needed.',
              'Sense-check size and units before locking in.',
              'If it is taking too long, flag and move on.',
            ],
          },
        ],
      },
      {
        id: 'how-this-app-helps',
        title: 'How this app will help you learn QR',
        subtitle: 'A quick tour of the practice loop on this app — including the AI tutor that lives inside every QR question.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A short walkthrough of how to learn and practise QR on this app, plus a live demo of the AI tutor — the feature that turns every wrong answer into a one-on-one teaching session.',
          },
          {
            title: 'When to try questions',
            body: 'Once you have finished the lessons, or if you want to skip ahead and try questions now, answer a practice question and check whether you were correct for the right reasons. If you were wrong, guessed, or still feel unsure, ask the AI tutor follow-up questions on that exact question.',
          },
          {
            title: 'Why static explanations may not be enough',
            body: 'An explanation tells you what the right answer was. It does not always tell you what your specific mistake was, why your reasoning fell short, or how to avoid the same trap next time. That is what the AI tutor is for — it sees the stimulus, the question, your answer, and the correct answer, and answers your follow-ups in plain English.',
          },
          {
            kind: 'rule',
            title: 'Where the tutor lives',
            body: 'After you submit any practice question, look for the "Teach Me" button at the bottom of the explanation box. That opens the AI tutor for this exact question.',
          },
          {
            title: 'What you can ask',
            body: 'Ask any UCAT Quantitative Reasoning question about the data, calculation, answer choices, or your working. The tutor knows the full context of the question you are on, so you can ask directly, for example: "Why is this not C?" or "Where did my calculation go wrong?"',
          },
          {
            kind: 'demoLaunch',
            title: 'Try it now on a sample QR question',
            body: 'Tap the button below to open one short QR question. Answer it, then look for the highlighted "Teach Me" button to chat with the tutor.',
            buttonLabel: 'Try a sample question with the AI tutor',
            note: 'This demo is free — it does not use any of your AI credits.',
          },
          {
            kind: 'tip',
            title: 'Free vs Premium AI tutor access',
            body: 'Free users get 5 AI tutor messages in total across the app. Premium gives unlimited access on every question. Every student is unique and learns in different ways — the AI tutor is here to answer your questions specifically.',
          },
          {
            kind: 'rule',
            title: 'Use the tutor as soon as something is unclear',
            body: 'Do not power through a confusing explanation hoping it clicks later. Ask. The whole point of the tutor is to convert a confused minute into a learning minute.',
          },
        ],
      },
      {
        id: 'calculator-basics',
        title: 'Calculator and keyboard basics',
        subtitle: 'The on-screen calculator has three behaviours that catch students out. Learn them now, before practice.',
        duration: '7 min',
        type: 'Foundation',
        icon: 'calculator',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'The QR section gives you a basic on-screen calculator. It is not a scientific calculator and does not behave like the one on your phone. This lesson teaches the three behaviours that catch students out, the keyboard shortcuts that save real time, and when to use the calculator at all.',
          },
          {
            title: 'Behaviour 1 — No order of operations',
            body: 'The calculator processes everything left to right. So 3 + 7 × 4 gives 40, not 31. There are no brackets, no exponent key, and no implicit BIDMAS handling. If a question requires order of operations, you must enter it in the correct order yourself, or use the memory keys to hold intermediate values.',
          },
          {
            title: 'Behaviour 2 — Backspace clears the entire entry',
            body: 'There is no per-digit delete. If you mistype a single digit halfway through entering a number, the Backspace key wipes the whole number, not just the last digit. The fix: type slowly the first time. Mistyping costs more than slow typing.',
          },
          {
            title: 'Behaviour 3 — The calculator window can lose focus',
            body: 'If you click outside the calculator (for example, to flag a question, or to read the noteboard), the calculator becomes inactive — your keyboard input goes nowhere. Click back into the calculator window before continuing.',
          },
          {
            title: 'The memory keys',
            bullets: [
              'MS — store the displayed value in memory.',
              'M+ — add the displayed value to whatever is currently stored.',
              'MR — recall the stored value back to the display.',
              'MC — clear the stored value.',
              'Use these instead of writing intermediate values down for chained calculations.',
            ],
          },
          {
            title: 'Keyboard shortcuts',
            bullets: [
              'Alt + C — open or close the calculator.',
              'Alt + N / Alt + P — next / previous question.',
              'Alt + F — flag for review, but it can deactivate the calculator (explained next).',
              'A, B, C, D, E — select that answer option directly. Faster than mousing.',
              'Num Lock must be ON for the numeric keypad to enter values into the calculator.',
            ],
          },
          {
            kind: 'trap',
            title: 'Alt + F deactivates an open calculator',
            body: 'Pressing Alt + F to flag while the calculator is open will deactivate the calculator. You must click back into the calculator window before keyboard input registers again. Practise the recovery: flag → click back into calculator → continue.',
          },
          {
            title: 'When to use the calculator',
            bullets: [
              'Decimals are awkward (e.g. 17.6 × 23.4).',
              'The arithmetic is long or chained.',
              'You need a precise final answer.',
              'The answer options are tightly clustered.',
            ],
          },
          {
            title: 'When NOT to use the calculator',
            bullets: [
              'The percentage is simple (10%, 25%, 50%).',
              'An estimate is enough to choose between far-apart options.',
              'The answer can be read directly off a graph.',
              'Mental maths is clearly faster.',
              'The calculation is a quick subtraction or doubling.',
            ],
          },
          {
            kind: 'tip',
            title: 'Practise on a full keyboard with a numpad before exam day',
            body: 'Laptop keyboards without a numpad train the wrong muscle memory. The numpad is significantly faster than typing numbers along the top row, and Num Lock must be ON for it to enter into the calculator.',
          },
        ],
      },
    ],
  },
  {
    id: 'maths',
    title: 'Core Maths Skills',
    description: 'A high-yield refresher of the maths topics QR repeatedly tests — not a full GCSE course.',
    icon: 'brain',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'mental-percentages',
        title: 'Mental percentage building blocks',
        subtitle: 'Calculate any percentage of any number in your head using the 10%-and-1% anchor method.',
        duration: '5 min',
        type: 'Core skill',
        icon: 'flame',
        practiceLabel: 'Practise QR questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This is the single highest-leverage QR lesson for rusty-maths students. Students that perform well can calculate many QR percentages in their heads quickly by using two anchor values: 10% and 1%. Build any percentage by combining them.',
          },
          {
            title: 'The two anchors',
            bullets: [
              '10% of any number = move the decimal point one place left. 10% of 240 is 24. 10% of 4,800 is 480. 10% of 35 is 3.5.',
              '1% of any number = move the decimal point two places left. 1% of 240 is 2.4. 1% of 4,800 is 48.',
            ],
          },
          {
            title: 'Building any percentage from the anchors',
            bullets: [
              '20% = 10% × 2.',
              '30% = 10% × 3.',
              '5% = 10% ÷ 2.',
              '15% = 10% + 5%.',
              '25% = ÷ 4 (usually faster than building from anchors).',
              '50% = ÷ 2.',
              '75% = halve, then add half again, OR original − 25%.',
              '12.5% = ÷ 8.',
              '7% = 1% × 7.',
            ],
          },
          {
            kind: 'rule',
            title: 'The reciprocation trick',
            body: 'Percentages reciprocate: x% of y = y% of x. Use whichever direction is mentally easier. 4% of 75 is awkward, but 75% of 4 is just 3 — same answer.',
          },
          {
            title: 'Worked walk-through: 35% of 240',
            bullets: [
              '10% of 240 = 24.',
              '30% = 24 × 3 = 72.',
              '5% = 24 ÷ 2 = 12.',
              '35% = 72 + 12 = 84. Students that perform well can do this quickly.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'What is 30% of 80?',
            options: ['12', '21', '24', '32'],
            correctIndex: 2,
            explanation: '10% of 80 = 8. 30% = 8 × 3 = 24.',
          },
          {
            kind: 'mini',
            prompt: 'What is 7% of 400?',
            options: ['14', '21', '28', '40'],
            correctIndex: 2,
            explanation: '1% of 400 = 4. 7% = 4 × 7 = 28.',
          },
          {
            kind: 'mini',
            prompt: 'What is 8% of 25?',
            options: ['1.6', '2', '4', '8'],
            correctIndex: 1,
            explanation: 'Reciprocate: 8% of 25 = 25% of 8 = 8 ÷ 4 = 2. Far easier than 1% of 25 = 0.25, then × 8.',
          },
          {
            kind: 'tip',
            title: 'Why this saves whole questions worth of time',
            body: 'Across 36 QR questions, students who never built the anchor habit can lose 2-3 minutes opening the calculator for simple percentages. That is a whole question of saved time when the anchors become automatic.',
          },
        ],
      },
      {
        id: 'percentages',
        title: 'Percentages',
        subtitle: 'Find percentages of amounts; calculate increases, decreases, and changes; reverse a percentage to find the original.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'calculator',
        practiceLabel: 'Practise percentage questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Percentages are everywhere in QR — discounts, profits, attendance rates, dosage changes, growth. This lesson covers the four moves you must own: find a percentage of an amount, increase or decrease by a percentage, calculate percentage change, and reverse a percentage.',
          },
          {
            title: 'The five core formulas',
            bullets: [
              'Percentage of an amount = (p ÷ 100) × whole.',
              'Percentage change = (new − original) ÷ original × 100.',
              'Increase by p%: multiply by (1 + p/100). +15% → ×1.15.',
              'Decrease by p%: multiply by (1 − p/100). −15% → ×0.85.',
              'Reverse: original = new ÷ multiplier. Never subtract the percentage back.',
            ],
          },
          {
            title: 'Worked walk-through 1: increase',
            body: 'A fee of £240 increases by 15%. New fee = 240 × 1.15 = £276.',
          },
          {
            title: 'Worked walk-through 2: reverse percentage',
            body: 'A jacket costs £68 after a 15% discount. To reverse: £68 is 85% of the original. Original = 68 ÷ 0.85 = £80. Adding 15% to £68 gives £78.20, which is wrong — the discount was taken off the original (£80), not the new price.',
          },
          {
            kind: 'trap',
            title: 'Percentage points vs percent change',
            body: 'A no-show rate rises from 12% to 15%. The difference is 3 percentage points. The percentage change is (15 − 12) ÷ 12 × 100 = 25%. Both are valid — but they answer different questions, and UCAT plants both numbers in the options to catch students.',
          },
          {
            kind: 'mini',
            prompt: 'A value falls from 80 to 64. What is the percentage change?',
            options: ['16% decrease', '20% decrease', '25% decrease', '80% decrease'],
            correctIndex: 1,
            explanation: 'Change = 16. Percentage change = 16 ÷ 80 × 100 = 20% decrease. Always divide by the ORIGINAL value, not the new one.',
          },
          {
            kind: 'mini',
            prompt: 'A train fare is £54 after a 10% discount. What was the original fare?',
            options: ['£48.60', '£59.40', '£60', '£64.80'],
            correctIndex: 2,
            explanation: '£54 is 90% of the original. 54 ÷ 0.9 = £60. Adding 10% back to £54 gives £59.40, which is wrong.',
          },
          {
            kind: 'mini',
            prompt: 'A clinic\'s no-show rate rises from 30% to 34%. By how many percentage points has it risen?',
            options: ['4 percentage points', '4%', '13.3 percentage points', '34%'],
            correctIndex: 0,
            explanation: 'Subtracting two percentages directly gives "percentage points". The relative percentage change is 4 ÷ 30 × 100 ≈ 13.3%, which is a different question.',
          },
        ],
      },
      {
        id: 'successive-percentages',
        title: 'Successive percentage changes',
        subtitle: 'When something rises 20% then falls 20%, it does NOT return to the original. Learn the multiplier method.',
        duration: '4 min',
        type: 'Core skill',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Successive percentage changes are one of the most-tested traps in all of QR. Students instinctively guess "no change" when a value goes up by 20% and then down by 20%. That is wrong every single time, and UCAT routinely places "0%" or "no change" in the answer options to catch them.',
          },
          {
            title: 'Why successive percentages do not cancel',
            body: 'The two percentages apply to different bases — the increase applies to the original; the decrease applies to the now-larger value. Different bases mean different absolute changes. The result is usually a net move unless one multiplier exactly reverses the other.',
          },
          {
            kind: 'rule',
            title: 'The multiplier method',
            body: 'Convert each change to a multiplier (1 ± p/100), then multiply the multipliers together. Never add or subtract the percentages.',
          },
          {
            title: 'Worked walk-through: the classic trap',
            bullets: [
              'A share price rises 20%, then falls 20%.',
              'Up 20% → ×1.20. Down 20% → ×0.80.',
              'Combined multiplier: 1.20 × 0.80 = 0.96.',
              'Net change = 0.96 − 1.00 = −0.04 = 4% loss.',
              'The instinct answer "no change" is wrong; UCAT plants 0% in the options.',
            ],
          },
          {
            title: 'Worked walk-through: two increases',
            body: 'A salary rises 5% one year, then 10% the next. Multipliers: 1.05 × 1.10 = 1.155. Total rise = 15.5%, not 15%.',
          },
          {
            kind: 'mini',
            prompt: 'A value rises 50%, then falls 50%. What is the net change?',
            options: ['No change', '25% loss', '50% loss', '75% gain'],
            correctIndex: 1,
            explanation: '1.5 × 0.5 = 0.75. That is a 25% loss. Never trust "they cancel out".',
          },
          {
            kind: 'mini',
            prompt: 'A value falls 10%, then rises 10%. What is the net change?',
            options: ['No change', '1% loss', '1% gain', '11% loss'],
            correctIndex: 1,
            explanation: '0.9 × 1.1 = 0.99. That is a 1% loss. The order does not matter — the multipliers commute — but they still do not cancel.',
          },
          {
            kind: 'tip',
            title: 'When successive percentages DO cancel',
            body: 'Only when one multiplier is the reciprocal of the other (e.g. ×1.25 and ×0.80, since 0.80 = 1 ÷ 1.25). The percentages will be different (+25% and −20%) — that is the giveaway. If the percentages are equal in size, they never cancel.',
          },
        ],
      },
      {
        id: 'fractions-decimals',
        title: 'Fractions, decimals, and conversions',
        subtitle: 'Move quickly between fractions, decimals, and percentages. Recognise common equivalents on sight.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'In QR, being able to switch forms quickly saves time. Some questions are easier as fractions, some as decimals, some as percentages. The aim is not to memorise everything; it is to recognise common equivalents fast enough that you do not waste calculator time on simple conversions.',
          },
          {
            title: 'The three core conversions',
            bullets: [
              'Fraction → decimal: numerator ÷ denominator.',
              'Decimal → percentage: × 100.',
              'Percentage → decimal: ÷ 100.',
            ],
          },
          {
            title: 'Equivalents to know on sight',
            bullets: [
              '1/2 = 0.5 = 50%.',
              '1/4 = 0.25 = 25%; 3/4 = 0.75 = 75%.',
              '1/5 = 0.2 = 20%; 2/5 = 0.4 = 40%; 3/5 = 0.6 = 60%; 4/5 = 0.8 = 80%.',
              '1/3 ≈ 0.333 ≈ 33.3%; 2/3 ≈ 0.667 ≈ 66.7%.',
              '1/8 = 0.125 = 12.5%; 3/8 = 0.375 = 37.5%; 5/8 = 0.625 = 62.5%; 7/8 = 0.875 = 87.5%.',
              '1/10 = 0.1 = 10%; 1/20 = 0.05 = 5%; 1/25 = 0.04 = 4%; 1/50 = 0.02 = 2%.',
            ],
          },
          {
            kind: 'rule',
            title: 'The sevenths family',
            body: '1/7 ≈ 14.3%, 2/7 ≈ 28.6%, 3/7 ≈ 42.9%, 4/7 ≈ 57.1%, 5/7 ≈ 71.4%, 6/7 ≈ 85.7%. If you see any of these strange-looking percentages in a question or answer options, you are almost certainly looking at a sevenths-based calculation.',
          },
          {
            title: 'Choosing the friendliest form',
            body: 'For final answers, keep extra digits and round at the end. For elimination, an estimate is often enough. If you need 2/3 of a number, multiplying by 2 then dividing by 3 is usually faster than entering 0.667 into a calculator.',
          },
          {
            kind: 'mini',
            prompt: 'Convert 0.4 to a percentage.',
            options: ['0.04%', '4%', '40%', '400%'],
            correctIndex: 2,
            explanation: 'Decimal → percentage: × 100. So 0.4 × 100 = 40%.',
          },
          {
            kind: 'mini',
            prompt: 'Which is larger: 0.7 or 2/3?',
            options: ['0.7', '2/3', 'They are equal'],
            correctIndex: 0,
            explanation: '2/3 ≈ 0.667. So 0.7 > 2/3.',
          },
          {
            kind: 'mini',
            prompt: 'You see 14.3% in the answer options. What fraction is the calculation likely involving?',
            options: ['1/5', '1/6', '1/7', '1/8'],
            correctIndex: 2,
            explanation: '14.3% is the decimal form of 1/7. Recognising the sevenths family on sight saves real time.',
          },
        ],
      },
      {
        id: 'ratios-proportions',
        title: 'Ratios and proportions',
        subtitle: 'Simplify, split, scale, and handle direct vs inverse proportion — including the workers-and-time trap.',
        duration: '7 min',
        type: 'Core skill',
        icon: 'list',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Ratios show up in QR as recipes, mixtures, staffing, prices, and rates. A good default is to find the value of one part before scaling to the total you need. This lesson also covers inverse proportion — the workers-and-time scenario that catches most students.',
          },
          {
            title: 'The core moves',
            bullets: [
              'Simplify: divide every part by the same number.',
              'Split a total: total parts = a + b; one part = total ÷ total parts; share = one part × required parts.',
              'Direct proportion: scale every linked quantity by the same factor.',
              'Inverse proportion: the product stays constant. For workers and time, workers × time = the same total work.',
            ],
          },
          {
            title: 'Worked walk-through: sharing in a ratio',
            bullets: [
              'Split £210 in the ratio 2:5.',
              'Total parts = 2 + 5 = 7.',
              'One part = 210 ÷ 7 = £30.',
              'Shares: 2 × 30 = £60 and 5 × 30 = £150.',
            ],
          },
          {
            title: 'Worked walk-through: inverse proportion',
            bullets: [
              'Six workers take 8 days to finish a job. How long for 4 workers?',
              'Total work = 6 × 8 = 48 worker-days.',
              'With 4 workers: 48 ÷ 4 = 12 days.',
              'The trap answer is 5.3 days (4/6 × 8) — that would be correct if it were direct, not inverse.',
            ],
          },
          {
            kind: 'trap',
            title: 'The 4:1 ratio trap',
            body: 'Staff are split in a nurses:doctors ratio of 4:1. With 30 staff, doctors = 1/5 × 30 = 6, NOT 1/4 × 30 = 7.5. Students see "4:1" and think doctors are 1/4 of staff. Doctors are 1/(4+1) = 1/5 of the whole staff. Always sum the parts first.',
          },
          {
            kind: 'mini',
            prompt: 'Share £96 in the ratio 1:3.',
            options: ['£24 and £72', '£32 and £64', '£48 and £48', '£12 and £84'],
            correctIndex: 0,
            explanation: 'Total parts = 4. One part = 96 ÷ 4 = £24. Shares: £24 and £72.',
          },
          {
            kind: 'mini',
            prompt: '8 cleaners take 5 hours to clean an office. How long for 10 cleaners at the same rate?',
            options: ['4 hours', '5 hours', '6 hours 15 min', '8 hours'],
            correctIndex: 0,
            explanation: 'Inverse proportion. Total work = 8 × 5 = 40 cleaner-hours. With 10 cleaners: 40 ÷ 10 = 4 hours. More cleaners means less time, not more.',
          },
          {
            kind: 'mini',
            prompt: 'A ratio is 3:7. What fraction of the whole is the smaller part?',
            options: ['3/7', '3/10', '7/10', '1/3'],
            correctIndex: 1,
            explanation: 'Total parts = 3 + 7 = 10. The smaller part is 3 out of 10, i.e. 3/10. Not 3/7 (that would be smaller-to-larger, not smaller-to-whole).',
          },
        ],
      },
      {
        id: 'averages-range',
        title: 'Averages and range',
        subtitle: 'Mean, median, mode, range — and the combined-samples calculation that catches most students.',
        duration: '7 min',
        type: 'Core skill',
        icon: 'chart',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'In QR, "average" usually means mean unless the question says otherwise. This lesson covers mean, median, mode, range, working backwards from a mean to find a missing value, and combined samples — where two groups of different sizes are merged.',
          },
          {
            title: 'The four basics',
            bullets: [
              'Mean = total ÷ number of values.',
              'Median = middle value after sorting (or mean of two middles for an even count).',
              'Mode = most frequent value.',
              'Range = maximum − minimum.',
            ],
          },
          {
            title: 'Working backwards from the mean',
            body: 'If the mean of 6 numbers is 14, the total is 6 × 14 = 84. To find a missing number, subtract the known values from the total.',
          },
          {
            kind: 'rule',
            title: 'Combined mean — weight by group size',
            body: 'Combined mean = total of all values ÷ total number of values. For two groups, that is (group 1 size × group 1 mean + group 2 size × group 2 mean) ÷ total size. You cannot simply average the two means together unless the groups are equal in size.',
          },
          {
            title: 'Worked walk-through: combined samples trap',
            bullets: [
              'Group A: 15 students, mean 72. Group B: 25 students, mean 80.',
              'Group A total = 15 × 72 = 1,080.',
              'Group B total = 25 × 80 = 2,000.',
              'Combined total = 3,080. Combined size = 40.',
              'Combined mean = 3,080 ÷ 40 = 77 (NOT 76 — the simple average of the two means).',
            ],
          },
          {
            kind: 'mini',
            prompt: 'What is the median of 7, 2, 10, 6, 3?',
            options: ['3', '6', '7', '10'],
            correctIndex: 1,
            explanation: 'Sort first: 2, 3, 6, 7, 10. Middle value = 6. The mode trap is to pick the middle of the unsorted list (10) or to use the mean.',
          },
          {
            kind: 'mini',
            prompt: 'The mean of 4 values is 20. What is the total?',
            options: ['5', '20', '24', '80'],
            correctIndex: 3,
            explanation: 'Total = mean × number of values = 20 × 4 = 80. Always store this when working backwards from a mean.',
          },
          {
            kind: 'mini',
            prompt: 'Class A has 10 students averaging 50. Class B has 20 students averaging 80. What is the combined mean?',
            options: ['65', '70', '75', '80'],
            correctIndex: 1,
            explanation: '(10 × 50 + 20 × 80) ÷ 30 = (500 + 1,600) ÷ 30 = 2,100 ÷ 30 = 70. The simple average of 50 and 80 is 65 — that would only be correct if the groups were the same size. Class B is twice as big, so the combined mean is pulled toward 80.',
          },
        ],
      },
      {
        id: 'units-conversions',
        title: 'Units and conversions',
        subtitle: 'Convert before you calculate. Mixing units is one of the most common QR errors.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'notes',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Unit conversion is one of the most reliable ways QR catches students out. Within the metric system, prefixes work in powers of ten, and common conversions should become automatic. The safest habit is simple: convert first, then calculate.',
          },
          {
            title: 'Conversions to know cold',
            bullets: [
              'Time: 1 h = 60 min; 1 min = 60 s.',
              'Length: 1 km = 1,000 m; 1 m = 100 cm; 1 cm = 10 mm.',
              'Mass: 1 kg = 1,000 g; 1 g = 1,000 mg.',
              'Volume: 1 L = 1,000 mL.',
              'Money: £1 = 100p.',
              'Imperial: 1 mile ≈ 1.6 km (UCAT typically uses 1.6 unless told otherwise).',
            ],
          },
          {
            kind: 'rule',
            title: 'Convert first, then calculate',
            body: 'If a rate is per hour and the time is given in minutes, convert before doing any arithmetic. Working in mixed units almost always produces a wrong answer that looks plausible.',
          },
          {
            title: 'Worked walk-through: time as a decimal',
            body: 'Convert 1 hour 30 minutes to a decimal number of hours: 30 min = 0.5 hours, so the answer is 1.5 hours — NOT 1.30 (a common calculator-entry mistake).',
          },
          {
            kind: 'mini',
            prompt: 'Convert 3.5 km to metres.',
            options: ['350 m', '3,500 m', '35,000 m', '0.35 m'],
            correctIndex: 1,
            explanation: '1 km = 1,000 m, so 3.5 × 1,000 = 3,500 m.',
          },
          {
            kind: 'mini',
            prompt: 'Convert 420 seconds to minutes.',
            options: ['4.2 minutes', '7 minutes', '70 minutes', '4 minutes 20 seconds'],
            correctIndex: 1,
            explanation: '420 ÷ 60 = 7 minutes. The trap "4 minutes 20 seconds" treats 420 as a base-10 number.',
          },
          {
            kind: 'mini',
            prompt: 'A bottle contains 0.75 L. Another contains 250 mL. What is the total in litres?',
            options: ['0.775 L', '1.00 L', '1.25 L', '7.75 L'],
            correctIndex: 1,
            explanation: 'Convert first: 250 mL = 0.25 L. Total = 0.75 + 0.25 = 1.00 L. Adding 0.75 to 250 directly is the unit-mismatch trap.',
          },
          {
            kind: 'tip',
            title: 'Always glance at the unit in the answer options',
            body: 'Before locking in an answer, check the unit. If options are in metres and you calculated in km, multiply by 1,000. UCAT often "dresses up" answer options in different units to catch careless readers.',
          },
        ],
      },
      {
        id: 'speed-rates',
        title: 'Speed, distance, time, and rates',
        subtitle: 'Use the speed triangle confidently — and never average leg speeds for multi-leg journeys.',
        duration: '7 min',
        type: 'Core skill',
        icon: 'timer',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A rate compares quantities with different units. Speed is one example — distance per unit time. QR also hides rates inside cost per item, patients per hour, and output per worker. Strong rate questions usually become easy once you convert all units into one clean system.',
          },
          {
            title: 'The core formulas',
            bullets: [
              'Speed = distance ÷ time.',
              'Distance = speed × time.',
              'Time = distance ÷ speed.',
              'Unit rate = amount ÷ number of units.',
            ],
          },
          {
            kind: 'rule',
            title: 'Average speed is total distance ÷ total time',
            body: 'For a multi-leg journey, average speed is NEVER the simple average of the leg speeds. It is always total distance divided by total time. Always.',
          },
          {
            title: 'Worked walk-through: the multi-leg trap',
            bullets: [
              'A car travels 60 km at 40 km/h, then 60 km at 60 km/h. Average speed?',
              'Time leg 1 = 60 ÷ 40 = 1.5 h.',
              'Time leg 2 = 60 ÷ 60 = 1 h.',
              'Total distance = 120 km. Total time = 2.5 h.',
              'Average speed = 120 ÷ 2.5 = 48 km/h.',
              'The trap answer is 50 km/h — the simple average of 40 and 60. The car spends more time on the slow leg, so the average is pulled toward the slower speed.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'A runner goes 9 km in 45 minutes. What is the speed in km/h?',
            options: ['6 km/h', '12 km/h', '15 km/h', '20 km/h'],
            correctIndex: 1,
            explanation: 'Convert first: 45 minutes = 0.75 h. Speed = 9 ÷ 0.75 = 12 km/h. Using 9 ÷ 45 (mixing units) gives 0.2, which is wrong.',
          },
          {
            kind: 'mini',
            prompt: 'A bus travels at 60 km/h for 1.5 hours. How far does it go?',
            options: ['40 km', '60 km', '90 km', '120 km'],
            correctIndex: 2,
            explanation: 'Distance = speed × time = 60 × 1.5 = 90 km.',
          },
          {
            kind: 'mini',
            prompt: 'A cyclist rides 20 km at 20 km/h, then 20 km at 30 km/h. What is the average speed?',
            options: ['22 km/h', '24 km/h', '25 km/h', '50 km/h'],
            correctIndex: 1,
            explanation: 'Time = 1 h + 2/3 h = 5/3 h. Total distance = 40 km. Average = 40 ÷ (5/3) = 24 km/h. The simple average of 25 km/h is the trap.',
          },
          {
            kind: 'tip',
            title: 'Rule of thumb for multi-leg trips',
            body: 'For equal-distance legs at different speeds, the average is always less than the simple average of the speeds. Never click the simple average without checking.',
          },
        ],
      },
      {
        id: 'interest',
        title: 'Simple and compound interest',
        subtitle: 'Interest as a percentage over time. Compound earns interest on previous interest — they are not the same.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'pencil',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Interest is a percentage of money paid (or earned) over time. UCAT can test either kind. Simple interest is calculated on the original amount only; compound interest is calculated on the original amount plus all previously earned interest. The longer the period and the higher the rate, the bigger the gap.',
          },
          {
            title: 'The interest formulas',
            bullets: [
              'Simple interest: I = P × r × t (P principal, r decimal rate, t years).',
              'Final amount with simple: P + I, or equivalently P × (1 + rt).',
              'Compound interest final amount: A = P × (1 + r)ⁿ.',
              'Compound interest earned = A − P.',
            ],
          },
          {
            title: 'Worked walk-through: simple',
            body: '£800 at 4% simple interest for 5 years. I = 800 × 0.04 × 5 = £160. Final amount = £960. Three multiplications, no exponent — mental-friendly.',
          },
          {
            title: 'Worked walk-through: compound',
            bullets: [
              '£800 at 4% compound interest for 5 years. A = 800 × (1.04)⁵.',
              'The basic calculator has no power key — chain it: 1.04 × 1.04 × 1.04 × 1.04 × 1.04 ≈ 1.2167.',
              'A ≈ 800 × 1.2167 = £973.36. Compound interest only = £173.36.',
            ],
          },
          {
            kind: 'trap',
            title: '5% compounded for 2 years is NOT 10%',
            body: '1.05² = 1.1025 = a 10.25% gain, not 10%. The extra 0.25% is interest earned in year two on the £50 of interest earned in year one. The longer the period, the bigger this gap grows.',
          },
          {
            kind: 'mini',
            prompt: '£500 at 6% simple interest for 3 years. Total interest?',
            options: ['£30', '£90', '£100', '£180'],
            correctIndex: 1,
            explanation: 'I = 500 × 0.06 × 3 = £90.',
          },
          {
            kind: 'mini',
            prompt: '£200 at 10% compound for 2 years. What is the percentage gain on the principal?',
            options: ['10%', '20%', '21%', '40%'],
            correctIndex: 2,
            explanation: '1.10² = 1.21. That is a 21% gain, not 20% — the extra 1% is the interest in year two on the £20 of interest from year one.',
          },
          {
            kind: 'mini',
            prompt: 'Which gives more in 10 years on the same principal: 5% simple or 5% compound?',
            options: [
              'Simple, by a noticeable margin.',
              'Compound, by a noticeable margin.',
              'They give exactly the same.',
            ],
            correctIndex: 1,
            explanation: 'Compound earns interest on previous interest; simple does not. Over 10 years at 5%, compound is meaningfully ahead.',
          },
        ],
      },
      {
        id: 'progressive-rates',
        title: 'Tax bands and tiered rates',
        subtitle: 'Apply each rate to its own slice of value, not to the whole — the trap that catches almost every student first time.',
        duration: '5 min',
        type: 'Core skill',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'UCAT regularly tests tiered or banded calculations. The most common is tax: income in different bands is taxed at different rates, and each rate applies only to the slice of income within that band — not to the total income. The same logic applies to tiered shipping costs, electricity tariffs, and commission structures.',
          },
          {
            kind: 'rule',
            title: 'Apply each rate to its band only',
            body: 'For tiered or banded systems, work band by band. Identify the slice of value that falls within each band, multiply by that band\'s rate, then add up all the band totals.',
          },
          {
            title: 'Worked walk-through: tax bands',
            bullets: [
              'Tax: 0% on first £10,000; 20% on £10,000–£40,000; 40% above £40,000.',
              'A person earns £55,000.',
              'First £10,000 at 0% → £0.',
              'Next £30,000 (the slice from £10,000 to £40,000) at 20% → £6,000.',
              'Final £15,000 (the slice from £40,000 to £55,000) at 40% → £6,000.',
              'Total tax = £12,000.',
              'The trap answer is £22,000 (40% × £55,000), which would apply the top rate to ALL income.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Tax bands are 0% on the first £10,000, 20% on £10,000–£40,000, and 40% above £40,000. How much tax is paid on £30,000?',
            options: ['£0', '£4,000', '£6,000', '£12,000'],
            correctIndex: 1,
            explanation: 'First £10k at 0% = £0; next £20k at 20% = £4,000. Total = £4,000.',
          },
          {
            kind: 'mini',
            prompt: 'Using those tax bands — 0% on the first £10,000, 20% on £10,000–£40,000, and 40% above £40,000 — how much tax is paid on £100,000?',
            options: ['£20,000', '£24,000', '£30,000', '£40,000'],
            correctIndex: 2,
            explanation: '£0 (first £10k) + £6,000 (basic band, 20% × £30k) + £24,000 (40% × £60k above £40k) = £30,000.',
          },
          {
            kind: 'mini',
            prompt: 'Why is "40% × £55,000 = £22,000" wrong for someone earning £55,000?',
            options: [
              'Because there is no 40% band.',
              'Because 40% only applies to income above £40,000, not to all income.',
              'Because tax is always rounded down.',
            ],
            correctIndex: 1,
            explanation: 'Top-band rates only apply to the income that falls within their band. Applying the top rate wholesale is the single most common progressive-calculation trap.',
          },
        ],
      },
      {
        id: 'algebra',
        title: 'Basic algebra and equations',
        subtitle: 'Solve simple one-step and two-step equations disguised as pricing, fees, and "find the missing value".',
        duration: '4 min',
        type: 'Core skill',
        icon: 'pencil',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'QR algebra is always practical, never abstract. The aim is to isolate the unknown by undoing operations in reverse order. You will rarely see anything more complex than a two-step equation, usually disguised as pricing, averages, or "find the missing quantity".',
          },
          {
            title: 'The core moves',
            bullets: [
              'If a number is added, subtract it.',
              'If a number is subtracted, add it.',
              'If a number multiplies the variable, divide.',
              'If the variable is divided by a number, multiply.',
              'Apply the same change to both sides.',
            ],
          },
          {
            title: 'Worked walk-through: pricing formula',
            bullets: [
              'A clinic charges using C = 5n + 2, where n is items and C is total cost in £.',
              'If C = 27, find n.',
              'Subtract 2: 25 = 5n.',
              'Divide by 5: n = 5.',
              'Substitute back: 5 × 5 + 2 = 27 ✓.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Total cost of n items at £4 each plus a £2 booking fee is £30. How many items?',
            options: ['5', '6', '7', '8'],
            correctIndex: 2,
            explanation: '4n + 2 = 30 → 4n = 28 → n = 7.',
          },
          {
            kind: 'mini',
            prompt: 'A taxi charges £5 plus £2 per mile. The total fare is £19. How many miles?',
            options: ['5 miles', '7 miles', '9 miles', '12 miles'],
            correctIndex: 1,
            explanation: '5 + 2m = 19 → 2m = 14 → m = 7 miles.',
          },
          {
            kind: 'mini',
            prompt: 'Five test scores have mean 14. Four are known: 12, 15, 11, 18. Find the fifth.',
            options: ['12', '13', '14', '15'],
            correctIndex: 2,
            explanation: 'Total needed = 5 × 14 = 70. Known total = 56. Fifth score = 70 − 56 = 14. Reverse-mean is the most common algebra disguise in QR.',
          },
        ],
      },
      {
        id: 'geometry',
        title: 'Geometry and measurement',
        subtitle: 'Only the formulas that actually appear in QR — plus the m³-to-litres trap that catches almost everyone.',
        duration: '7 min',
        type: 'Core skill',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'QR geometry stays narrow and practical. The high-yield formulas are area and perimeter of rectangles, area of triangles, circumference and area of circles, and volume of cuboids and cylinders. UCAT typically expects π ≈ 3.14 unless the question gives a different value.',
          },
          {
            title: 'Formulas to know',
            bullets: [
              'Perimeter of rectangle = 2(l + w).',
              'Area of rectangle = l × w.',
              'Area of triangle = ½ × base × height (perpendicular height).',
              'Circumference = π × d, or 2 × π × r.',
              'Area of circle = π × r².',
              'Volume of cuboid = l × w × h.',
              'Volume of cylinder = π × r² × h.',
            ],
          },
          {
            kind: 'rule',
            title: 'Critical conversions for volume',
            body: '1 m³ = 1,000 litres (NOT 100 — this is the most-tested geometry trap). 1 m³ = 1,000,000 cm³. 1 cm³ = 1 mL. 1 m² = 10,000 cm² (NOT 100).',
          },
          {
            title: 'Worked walk-through: m³ to litres',
            bullets: [
              'A water tank measures 2 m × 1 m × 1 m. How many litres does it hold?',
              'Volume = 2 × 1 × 1 = 2 m³.',
              '1 m³ = 1,000 L, so 2 m³ = 2,000 L.',
              'Trap answers: 200 L (using 1 m³ = 100 L) or 2 L (using 1 m³ = 1 L) — both wrong.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'A circle has diameter 14 cm. Find its area, using π ≈ 3.14.',
            options: ['≈ 22 cm²', '≈ 44 cm²', '≈ 154 cm²', '≈ 615 cm²'],
            correctIndex: 2,
            explanation: 'Use the radius, not the diameter: r = 14 ÷ 2 = 7. Area = π × r² = 3.14 × 49 ≈ 154 cm². Using d² instead of r² gives ≈ 615 — the classic radius/diameter trap.',
          },
          {
            kind: 'mini',
            prompt: 'A swimming pool is 25 m × 10 m × 2 m. What is its volume in litres?',
            options: ['500 L', '5,000 L', '50,000 L', '500,000 L'],
            correctIndex: 3,
            explanation: 'Volume = 500 m³. Convert: 500 × 1,000 = 500,000 L. Using 1 m³ = 100 gives the trap 50,000 L.',
          },
          {
            kind: 'mini',
            prompt: 'A triangle has base 10 cm and perpendicular height 6 cm. What is its area?',
            options: ['16 cm²', '30 cm²', '60 cm²', '120 cm²'],
            correctIndex: 1,
            explanation: 'Area = ½ × base × height = ½ × 10 × 6 = 30 cm². Forgetting the ½ gives 60 — the most common triangle-area trap.',
          },
          {
            kind: 'tip',
            title: 'Watch the diameter-vs-radius switch',
            body: 'UCAT often gives the value that needs converting first. If a question gives a diameter, halve it before using any formula that needs the radius, especially circle area. This single habit saves several easy marks.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'QR Question Types',
    description: 'The five formats QR uses most often. Each one rewards a slightly different reading habit.',
    icon: 'list',
    accentKey: 'blue',
    lessons: [
      {
        id: 'table-questions',
        title: 'Table questions',
        subtitle: 'Read tables with intent — row, column, unit, calculation. Avoid absorbing the whole table.',
        duration: '5 min',
        type: 'Question type',
        icon: 'list',
        practiceLabel: 'Practise table questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Table questions test selective attention. The skill is not reading every row carefully — it is using row labels, column labels, units, and categories to find the exact values you need. Good table readers move with intent: row first, column second, unit third, calculation fourth.',
          },
          {
            title: 'The five-step table method',
            bullets: [
              'Read the question stem first.',
              'Find the correct row.',
              'Find the correct column.',
              'Check the unit (and any heading like "values in thousands").',
              'Only then calculate.',
            ],
          },
          {
            kind: 'stimulus',
            title: 'Example table',
            body: 'Three cereal boxes — total price and weight per box. To compare value, reduce each row to a unit rate (price per 100 g) before comparing.',
            stimulus: {
              type: 'table',
              data: {
                headers: ['Box', 'Weight (g)', 'Price (£)'],
                rows: [
                  ['A', '375', '2.10'],
                  ['B', '500', '2.60'],
                  ['C', '750', '4.20'],
                ],
              },
            },
          },
          {
            title: 'Worked walk-through: unit price comparison',
            bullets: [
              'Use the example table above.',
              'Question: which box is cheapest per 100 g?',
              'You need a unit price, not the cheapest sticker price.',
              'For each box: price ÷ weight × 100 → unit price per 100 g.',
              'A: 2.10 ÷ 375 × 100 = £0.56. B: 2.60 ÷ 500 × 100 = £0.52. C: 4.20 ÷ 750 × 100 = £0.56.',
              'Cheapest per 100 g is Box B at £0.52.',
            ],
          },
          {
            kind: 'rule',
            title: 'Read only what the question needs',
            body: 'If the question is "How many more adult visits in April than child visits in June?", you need exactly two cells. Reading the rest of the table is wasted time.',
          },
          {
            kind: 'mini',
            prompt: 'The table heading says "values in thousands". A cell shows 24. What does it actually mean?',
            options: ['24', '240', '2,400', '24,000'],
            correctIndex: 3,
            explanation: '"Values in thousands" multiplies every cell by 1,000. So 24 = 24,000. Missing this header is one of the most common single-cell errors.',
          },
          {
            kind: 'mini',
            prompt: 'A table gives total cost and total quantity for several products. The question asks for the cheapest per 100 g. What extra step is needed?',
            options: [
              'No extra step — just pick the lowest total cost.',
              'Convert each row to a unit rate (cost per 100 g) before comparing.',
              'Add all the totals together first.',
            ],
            correctIndex: 1,
            explanation: 'Total cost alone ignores weight. The cheapest sticker price is rarely the cheapest per 100 g. Always reduce to a unit rate before comparing.',
          },
          {
            kind: 'tip',
            title: 'Point to the cell before you calculate',
            body: 'Before doing any arithmetic, mentally point at the cell that gave you the value. If you cannot point to it, you have probably misread the row or column.',
          },
          {
            kind: 'rule',
            title: 'In this app vs the real UCAT exam',
            body: 'In this app, tables and charts are wrapped in extra controls — "Tap to expand", pinch-zoom, and on graph questions a "Show values" toggle. These are ONLY here because phones have less screen space than the real UCAT computer. In the actual UCAT exam you will NOT be able to toggle values on or off, expand the chart, or pinch-zoom. The exam shows the chart at one fixed size on a desktop screen with no interactive controls. Treat the in-app extras as a reading aid for practice; do not build a habit of relying on them.',
          },
        ],
      },
      {
        id: 'graph-questions',
        title: 'Graph and chart questions',
        subtitle: 'Bar, line, pie, scatter, and dual-axis charts — after the stem, read in the same order every time.',
        duration: '6 min',
        type: 'Question type',
        icon: 'chart',
        practiceLabel: 'Practise graph questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Graph questions become much easier when you always read in the same order. After reading the question stem, scan the graph for title, axes, units, scale, legend, and the target value. In QR, a graph often looks harder than it is because the visual design distracts you from the simple numerical read-off underneath.',
          },
          {
            title: 'The fixed reading order',
            bullets: [
              'Title — what is being measured?',
              'Axis labels — what do the horizontal and vertical axes represent?',
              'Scale — what is one interval worth (5? 10? 50?).',
              'Legend — which colour or line is which category?',
              'Target — re-check the exact value or difference the question stem asks for.',
              'For dual-axis charts: confirm which series uses which axis BEFORE reading any value.',
            ],
          },
          {
            kind: 'stimulus',
            title: 'Example: bar chart',
            body: 'Practise the fixed reading order on this bar chart. Title, axes, units, scale — then read the value the stem asks for.',
            stimulus: {
              type: 'bar_chart',
              data: {
                title: 'Monthly Prescriptions Filled (Q1)',
                labels: ['January', 'February', 'March'],
                series: [
                  {
                    name: 'Prescriptions',
                    values: [320, 410, 380],
                  },
                ],
                yAxisLabel: 'Prescriptions',
              },
            },
          },
          {
            kind: 'stimulus',
            title: 'Example: line graph with multiple series',
            body: 'Two series share one y-axis. Use the legend to identify each line BEFORE reading off any point.',
            stimulus: {
              type: 'line_graph',
              data: {
                title: 'Daily Visitors by Clinic (Mon–Fri)',
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                series: [
                  { name: 'Clinic A', values: [120, 140, 160, 150, 180] },
                  { name: 'Clinic B', values: [90, 110, 100, 130, 150] },
                ],
                yAxisLabel: 'Visitors',
              },
            },
          },
          {
            kind: 'stimulus',
            title: 'Example: pie chart',
            body: 'Locate the named segment in the legend first, then divide by the total before guessing the largest slice.',
            stimulus: {
              type: 'pie_chart',
              data: {
                title: 'Hospital Admissions by Department',
                segments: [
                  { label: 'A&E', value: 450 },
                  { label: 'Cardiology', value: 300 },
                  { label: 'Paediatrics', value: 150 },
                  { label: 'Other', value: 100 },
                ],
                unit: '',
              },
            },
          },
          {
            kind: 'trap',
            title: 'Dual-axis charts',
            body: 'A chart can show, say, revenue on the left axis (£k) and customer count on the right axis (thousands). If the question asks for revenue and you read off the customer axis, the wrong number will look plausible. UCAT routinely places the wrong-axis value in the answer options as a decoy. Always confirm axis pairing first.',
          },
          {
            title: 'Reading specific chart types',
            bullets: [
              'Bar chart: compare bar heights or lengths.',
              'Line graph: track trends and turning points.',
              'Pie chart: read percentages, then convert to absolute values if needed.',
              'Stacked chart: subtract layers to find a single category.',
              'Scatter plot: judge correlation direction and any outliers.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Why should you check the scale before reading a bar height?',
            options: [
              'Because each gridline may represent 5, 10, 50, or another step size — assuming "1 per gridline" is wrong most of the time.',
              'Because the chart might be upside down.',
              'Because the colours could change.',
            ],
            correctIndex: 0,
            explanation: 'Scale-reading errors are the single biggest source of "almost right" answers on bar charts. Confirm what one gridline is worth before reading any value.',
          },
          {
            kind: 'mini',
            prompt: 'If the y-axis unit is "£k", what does a point at 8 mean?',
            options: ['£8', '£80', '£800', '£8,000'],
            correctIndex: 3,
            explanation: '"£k" means thousands of pounds, so 8 = £8,000. Missing this multiplier is a very common chart error.',
          },
          {
            kind: 'mini',
            prompt: 'A chart has two y-axes. What should you confirm before reading any value?',
            options: [
              'Whether the chart fits on the screen.',
              'Which series uses which axis.',
              'Which axis is taller.',
            ],
            correctIndex: 1,
            explanation: 'On dual-axis charts, the wrong-axis read-off is a planted distractor. Match each series to its axis using the legend before doing anything else.',
          },
          {
            kind: 'rule',
            title: 'In this app vs the real UCAT exam',
            body: 'In this app, every chart sits inside extra controls — "Show values" to print numbers on bars and points, "Tap to expand" with pinch-zoom, and on multi-series charts you can tap a legend entry to hide or show a line. These are ONLY here because mobile screens are small and dense charts are hard to read; they are not part of the UCAT. In the actual UCAT exam you will NOT have a "Show values" toggle, expand-and-zoom, or interactive legends. The exam draws each chart at one fixed size on a desktop screen and you read every value off the gridlines yourself. Use the in-app aids while you learn the chart, but do not let yourself rely on them — practise reading values straight off the scale.',
          },
        ],
      },
      {
        id: 'word-problems',
        title: 'Word problem questions',
        subtitle: 'Translate words into operations. Ignore the numbers you do not need.',
        duration: '6 min',
        type: 'Question type',
        icon: 'notes',
        practiceLabel: 'Practise word problems',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Word problems are where QR feels most like reasoning. This subtest rewards problem solving more than raw numerical facility. In practice, that means turning words like difference, remaining, per, total, discount, increase, and average into operations — and ignoring the numbers that are not needed.',
          },
          {
            title: 'Words that change the calculation',
            bullets: [
              '"Increase" / "rise" / "more than" → addition or percentage up.',
              '"Difference" / "decrease" / "less than" → subtraction or percentage down.',
              '"Total" / "altogether" → addition.',
              '"Per person" / "per item" → division.',
              '"Remaining" / "left" → subtract from the starting value.',
              '"X% cheaper" → (100 − X)% of the original.',
            ],
          },
          {
            title: 'The four-step word-problem method',
            bullets: [
              'Underline mentally what the question is asking for.',
              'Mentally mark the useful numbers.',
              'Ignore irrelevant numbers (yes, some are planted distractors).',
              'Translate keywords into operations, then check units before locking in.',
            ],
          },
          {
            title: 'Worked walk-through',
            bullets: [
              'Adult ticket £18; child ticket is 40% cheaper. Child price?',
              '"40% cheaper" means 60% of the adult price.',
              '60% of 18 = 0.6 × 18 = £10.80.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'What operation does "difference" usually signal?',
            options: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
            correctIndex: 1,
            explanation: '"Difference" is almost always a subtraction. Translate keywords into operations before reaching for the calculator.',
          },
          {
            kind: 'mini',
            prompt: 'What does "per person" usually signal?',
            options: ['Multiplication', 'Subtraction', 'Division', 'Addition'],
            correctIndex: 2,
            explanation: '"Per" almost always means division — a unit rate. Total ÷ number of people.',
          },
          {
            kind: 'mini',
            prompt: 'A nurse uses 25 mL of medicine from a bottle containing 0.2 L. How much remains, in mL?',
            options: ['175 mL', '200 mL', '225 mL', '0.175 mL'],
            correctIndex: 0,
            explanation: 'Convert first: 0.2 L = 200 mL. Then subtract: 200 − 25 = 175 mL. Subtracting in different units (200 − 0.025) is the trap.',
          },
          {
            kind: 'tip',
            title: 'Not every number in the question is useful',
            body: 'Word problems often give one or two numbers you do not need (a date, a count of products that are not relevant). Decide what the question is asking, then ignore the rest.',
          },
        ],
      },
      {
        id: 'multi-step',
        title: 'Multi-step calculation questions',
        subtitle: 'Plan the steps before calculating. Stop only when the final operation is done.',
        duration: '5 min',
        type: 'Question type',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Some QR items are not hard because of any single step; they are hard because they require two, three, or four linked steps with no room for careless errors. Each question is worth one mark, so you also need a judgment rule for when to push and when to flag.',
          },
          {
            title: 'A repeatable structure',
            bullets: [
              'Break the problem into mini-steps before touching the calculator.',
              'Note or store the intermediate value (use calculator memory keys for chains).',
              'Ask yourself: "Does this already answer the question?"',
              'If not, complete the final step.',
              'If time is bleeding away, flag and move on.',
            ],
          },
          {
            kind: 'trap',
            title: 'The intermediate-value trap',
            body: 'UCAT routinely places the value from step 1 in the answer options as a decoy. If your answer matches an early result and the question felt suspiciously short, you may have stopped too early. Always re-read the stem before locking in.',
          },
          {
            title: 'Worked walk-through',
            bullets: [
              'A shop sells 3 notebooks at £2.40 each and a pen set at £8 with 25% off. Change from £20?',
              'Step 1: Notebooks = 3 × 2.40 = £7.20.',
              'Step 2: Pen discount = 25% of 8 = £2. Discounted price = £6.',
              'Step 3: Total spend = 7.20 + 6 = £13.20.',
              'Step 4: Change = 20 − 13.20 = £6.80.',
              'Stopping at step 3 (£13.20) is exactly the intermediate-value trap.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'After step one of a three-step problem, your answer matches one of the options. What should you ask?',
            options: [
              '"Can I click it now and save time?"',
              '"Is this the final quantity, or only an intermediate value?"',
              '"Is option A always wrong?"',
            ],
            correctIndex: 1,
            explanation: 'Always check whether you have answered the actual question or only set up the next step. UCAT plants intermediate values as decoys precisely to catch students who stop early.',
          },
          {
            kind: 'mini',
            prompt: 'Why is writing down or storing an intermediate value helpful in a multi-step question?',
            options: [
              'It looks neater.',
              'It reduces working-memory pressure and prevents repeat work.',
              'It is required by the test rules.',
            ],
            correctIndex: 1,
            explanation: 'Multi-step questions overload working memory. Use the calculator memory keys (MS, MR) or a quick noteboard scribble to free up brain space for the final step.',
          },
          {
            kind: 'mini',
            prompt: 'You have spent 90 seconds on a multi-step question and are still on step two. What is the correct strategic response?',
            options: [
              'Push on — you are almost there.',
              'Flag it, make your best guess, and move on.',
              'Skip without picking anything.',
            ],
            correctIndex: 1,
            explanation: 'Two minutes spent on one hard question is three other questions you did not finish. There is no negative marking, so a flagged guess is strictly better than a blank.',
          },
        ],
      },
      {
        id: 'estimation',
        title: 'Estimation questions',
        subtitle: 'Round friendly, eliminate options that are far off, save the calculator only for the close ones.',
        duration: '5 min',
        type: 'Question type',
        icon: 'flame',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Official candidate advice explicitly recommends rounding to eliminate clearly wrong options. Not every QR question needs a perfect calculation. Estimation is especially powerful when the answer options are far apart, or when you mainly need to check whether the answer is closer to 200, 2,000, or 20,000.',
          },
          {
            title: 'When estimation pays',
            bullets: [
              'Answer options are far apart in size.',
              'You only need to eliminate clearly wrong options.',
              'You want to sense-check a calculator answer.',
              'A question is close to running you out of time.',
            ],
          },
          {
            title: 'Worked walk-through',
            bullets: [
              'Estimate 49.8 × 21.2.',
              'Round to 50 × 21 = 1,050.',
              'If the only option near 1,050 is 1,055, you do not need the exact value.',
            ],
          },
          {
            kind: 'rule',
            title: 'Estimate first, calculate only if needed',
            body: 'Round each number to a friendly value, compare against the options, and only do the precise calculation if your estimate cannot separate them. This is the single biggest source of saved time across 36 QR questions.',
          },
          {
            kind: 'mini',
            prompt: 'Is estimation safer when answer options are close together or far apart?',
            options: ['Far apart', 'Close together', 'Either, no difference'],
            correctIndex: 0,
            explanation: 'Far-apart options can be eliminated with a rough estimate. Close-together options need precision — estimation cannot separate them.',
          },
          {
            kind: 'mini',
            prompt: 'What is 302 × 19 roughly?',
            options: ['About 600', 'About 1,200', 'About 6,000', 'About 60,000'],
            correctIndex: 2,
            explanation: 'Round to 300 × 20 = 6,000. The exact answer is 5,738 — and only one of the options is close to that.',
          },
          {
            kind: 'mini',
            prompt: 'Why estimate before entering a long calculation into the calculator?',
            options: [
              'It is required by the test.',
              'To catch unreasonable outputs and mistypes.',
              'To make the calculation slower.',
            ],
            correctIndex: 1,
            explanation: 'A 5-second estimate is a free sanity check. If your calculator answer is wildly different from the estimate, you have probably mistyped — re-enter rather than locking in.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Pace, judgment, and trap recognition — the things that protect marks once you know the maths.',
    icon: 'target',
    accentKey: 'amber',
    lessons: [
      {
        id: 'timing-strategy',
        title: 'Timing strategy and the three-pass method',
        subtitle: 'How to use the 26 minutes wisely — and never leave a question blank.',
        duration: '6 min',
        type: 'Strategy',
        icon: 'timer',
        practiceLabel: 'Try a timed QR set',
        practiceRoute: 'timed',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'With 36 questions in 26 minutes, the average is about 43 seconds per question. The official test tools include a timer, progress indicator, and flag-for-review function, and there is no negative marking. This lesson teaches the three-pass model that lets you protect easy marks while still finishing every question.',
          },
          {
            title: 'Pass 1 — The win-collection pass',
            body: 'Move through every question in order. Answer anything you can complete in under 45 seconds. Flag anything that looks long, multi-step, or unclear. Do NOT dwell. Goal: reach Q36 with all easy marks banked. This pass typically takes 18–22 minutes if well-drilled.',
          },
          {
            title: 'Pass 2 — The rescue pass',
            body: 'With time remaining, return to flagged questions in order of perceived ease. Spend up to 60 seconds per question. If a question is still resisting at 60 seconds, guess and move on. Goal: convert as many flagged questions as possible.',
          },
          {
            title: 'Pass 3 — The no-blanks pass',
            body: 'With 30 seconds remaining, blanket-guess any unanswered question. There is no negative marking, so a blank is a guaranteed zero, while a guess has a 20% chance of being right. Always finish with every question answered. The fastest way to do this is the keyboard letter keys A–E.',
          },
          {
            kind: 'rule',
            title: 'The 1-minute rule',
            body: 'If a question would take more than 60 seconds and you still cannot see the route, you are probably losing time overall. Flag, guess, and move on. Two minutes spent on one hard question is three other questions you did not finish.',
          },
          {
            kind: 'mini',
            prompt: 'Why is "average time per question" not the same as "spend 43 seconds on every question"?',
            options: [
              'Because the timer counts up, not down.',
              'Because some questions are much quicker and some are much slower.',
              'Because UCAT pauses the clock between questions.',
            ],
            correctIndex: 1,
            explanation: 'Some QR items are 15-second reads; others are 90-second multi-step calculations. Treat 43 seconds as a budget across the whole section, not a target on each question.',
          },
          {
            kind: 'mini',
            prompt: 'Is it strategically sensible to leave a QR question blank?',
            options: [
              'Yes, sometimes — it shows discipline.',
              'No. With no negative marking, a blank is a guaranteed zero, while a guess has roughly a 20% chance of being right.',
              'Only on the first three questions.',
            ],
            correctIndex: 1,
            explanation: 'Always finish with every question answered. The expected value of a random guess across five options is +0.2 marks. A blank is +0.0.',
          },
          {
            kind: 'mini',
            prompt: 'With 30 seconds left and 4 unanswered questions, what should you do?',
            options: [
              'Carefully attempt the first one.',
              'Pick a letter and press it for all 4 — never leave blanks.',
              'Re-check your earlier answers instead.',
            ],
            correctIndex: 1,
            explanation: 'In Pass 3, time is too short for thoughtful work. Press the same letter (A–E) for all unanswered items. On average you pick up roughly 1 mark out of 4 unanswered — strictly better than zero.',
          },
          {
            kind: 'checklist',
            title: 'My QR timing rules',
            items: [
              'Pass 1: answer fast, flag anything that looks long.',
              'Pass 2: return to flags, 60 seconds maximum each.',
              'Pass 3: with 30 seconds left, blanket-guess any blanks.',
              'Apply the 1-minute rule on every question.',
              'Never leave a blank — there is no negative marking.',
            ],
          },
        ],
      },
      {
        id: 'options-first',
        title: 'Glance at answer options before calculating',
        subtitle: 'After reading the stem, check the spread of the options. It tells you whether to estimate or be precise.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'The five answer options tell you how much precision the question demands. After reading the question stem, confident students glance at the spread before calculating. If the options are far apart, an estimate suffices and the calculator stays closed. If the options are tightly clustered, you need precision and the calculator earns its time.',
          },
          {
            title: 'Two patterns to recognise',
            bullets: [
              'Far-apart options (e.g. 96, 480, 958, 1,960) → estimate. Round friendly, eliminate magnitude misfits, pick the survivor.',
              'Tightly clustered options (e.g. 982, 985, 988, 991) → calculate precisely. Estimation cannot separate them.',
            ],
          },
          {
            kind: 'rule',
            title: 'Magnitude check first',
            body: 'If your rough answer is 600 and one option is 60, eliminate the 60 immediately without further checking. Do not waste time on options that are an order of magnitude off.',
          },
          {
            title: 'Worked walk-through: far-apart options',
            bullets: [
              'Calculate 19.95 × 48 with options 96, 480, 958, 1,960.',
              'Estimate: 20 × 48 = 960.',
              '96 too small, 480 too small, 1,960 too big.',
              'Answer must be 958. No calculator needed. Time: 5 seconds.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'If options are 12, 120, 1,200, and 12,000, what is the fastest first move?',
            options: [
              'Estimate the magnitude — orders of magnitude apart, so a rough estimate is enough.',
              'Calculate precisely.',
              'Pick the middle option.',
            ],
            correctIndex: 0,
            explanation: 'Far-apart options reward estimation. A magnitude check usually eliminates three of the four immediately.',
          },
          {
            kind: 'mini',
            prompt: 'If options are 4.6, 4.7, 4.8, and 4.9, what does that signal?',
            options: [
              'Estimate roughly.',
              'Calculate precisely — the options are tightly clustered.',
              'Pick the middle option.',
            ],
            correctIndex: 1,
            explanation: 'Tightly clustered options demand precision. Estimation cannot separate them, so the calculator is worth the seconds.',
          },
          {
            kind: 'mini',
            prompt: 'You estimate 600. Options are 98, 105, 602, 610. Which should you compare most seriously?',
            options: ['98 and 105', '602 and 610', 'All four equally'],
            correctIndex: 1,
            explanation: 'Eliminate 98 and 105 by magnitude — they are five times too small. Then do the precise calculation to choose between 602 and 610.',
          },
        ],
      },
      {
        id: 'mental-vs-calc',
        title: 'Choosing mental maths vs calculator',
        subtitle: 'Pick the route that finishes fastest, not the one that feels safest.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'calculator',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Official candidate advice recommends a combination of mental arithmetic, written methods, and the on-screen calculator. Many students lose time by opening the calculator for calculations that are faster in their head, while truly awkward decimals usually should go straight to the calculator. The right lesson is not "calculator bad" — it is "calculator selective".',
          },
          {
            title: 'Prefer mental maths for',
            bullets: [
              '10%, 20%, 25%, 50% (use the anchor methods).',
              'Simple differences and totals.',
              'Obvious unit-rate comparisons.',
              'Rough estimates.',
              'Answer elimination.',
            ],
          },
          {
            title: 'Prefer the calculator for',
            bullets: [
              'Ugly decimals (17.6 × 23.4).',
              'Chained operations (use memory keys).',
              'Exact monetary totals.',
              'Precise final answers when options are close.',
              'Compound interest powers (no exponent key — chain multiplications).',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Which is better done mentally: 50% of 68 or 18.74 × 2.93?',
            options: ['50% of 68', '18.74 × 2.93', 'Both', 'Neither'],
            correctIndex: 0,
            explanation: '50% of 68 = 34 (mental, 1 second). 18.74 × 2.93 should go straight to the calculator — typing is faster than carrying digits.',
          },
          {
            kind: 'mini',
            prompt: 'Compute 35% of 240 — calculator or mental?',
            options: [
              'Calculator — it is faster and safer.',
              'Mental — 10% = 24, 30% = 72, 5% = 12, total = 84.',
              'Either is equally fast.',
            ],
            correctIndex: 1,
            explanation: 'With the anchor method, mental finishes in 4-5 seconds. Calculator entry takes longer.',
          },
          {
            kind: 'mini',
            prompt: 'If options are 980, 990, 1,000, and 1,010, is exact calculation more likely to matter?',
            options: ['Yes — the options are close together.', 'No — estimate is enough.', 'Either way.'],
            correctIndex: 0,
            explanation: 'Tightly clustered options need precision. Use the calculator and avoid rounding mid-step.',
          },
          {
            kind: 'tip',
            title: 'Calculator as a comfort blanket',
            body: 'Many students reach for the calculator on every percentage out of habit. Do not. Build the anchor method until simple percentages are mental — that habit alone is worth multiple marks.',
          },
        ],
      },
      {
        id: 'qr-traps',
        title: 'Common QR traps',
        subtitle: 'A roll-call of the wrong answers UCAT plants on purpose. Recognise them and you will stop walking into them.',
        duration: '6 min',
        type: 'Traps',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'QR wrong answers are often believable because they match a common mistake rather than random arithmetic noise. This lesson is a roll-call of the recurring traps — once you can name a trap, you can spot it the next time it appears.',
          },
          {
            title: 'The trap roll-call',
            bullets: [
              'Wrong denominator — using the new value instead of the original in percentage change.',
              'Successive percentages do not cancel — +20% then −20% is not zero net change.',
              'Average speed is total/total — never the simple average of leg speeds.',
              'Intermediate value clicked — the answer to step one of a multi-step problem is in the options as a decoy.',
              'Wrong units — answer in grams when options are in kilograms.',
              'm³ ↔ L confusion — 1 m³ = 1,000 L (not 100).',
              'Percentage points vs percent change — different operations, different answers.',
              'Tax band wholesale — applying the top rate to all income.',
              'Ratio whole-vs-part — 4:1 means smaller part is 1/5, not 1/4.',
              'Direct vs inverse proportion — fewer workers means longer time, not shorter.',
              'Combined samples — naively averaging two means without weighting by group size.',
              'Compound vs simple — 5% compounded for 2 years is 10.25%, not 10%.',
              'Dual-axis chart misread — the answer matches the wrong axis\'s read-off.',
              'Calculator left-to-right — 3 + 7 × 4 gives 40, not 31.',
              'Backspace wipes everything — so do not press it mid-entry.',
            ],
          },
          {
            kind: 'rule',
            title: 'Pre-click checks',
            body: 'Before clicking an option, ask: did I use the right row/column/line? Did I use the original value where required? Did I convert units? Is this the final answer or an intermediate result? Does the size make sense versus my estimate?',
          },
          {
            kind: 'mini',
            prompt: 'A rate rises from 40% to 50%. A trap option says "It rose by 10%". What is the correct analysis?',
            options: [
              'It rose by 10% — the option is correct.',
              'Difference = 10 percentage points; relative increase = (50 − 40) ÷ 40 = 25%. The two are not the same.',
              'It rose by 50%.',
            ],
            correctIndex: 1,
            explanation: 'Subtracting two percentages directly gives "percentage points". The percent change is (10 ÷ 40) × 100 = 25%. UCAT plants both as options to catch students who confuse the two.',
          },
          {
            kind: 'mini',
            prompt: 'Your answer is exactly the value you calculated in step one of a three-step problem. What should you suspect?',
            options: ['I am clearly correct.', 'Intermediate-value trap — finish the remaining steps.', 'Random match.'],
            correctIndex: 1,
            explanation: 'When the calculation feels too easy, that is the warning sign. Re-read the stem and confirm you have answered the actual question, not just an intermediate step.',
          },
          {
            kind: 'mini',
            prompt: 'A 4:1 ratio of nurses to doctors. What fraction of staff are doctors?',
            options: ['1/4', '1/5', '4/5', '1/3'],
            correctIndex: 1,
            explanation: 'Total parts = 4 + 1 = 5. Doctors are 1 of 5 parts = 1/5 of staff, not 1/4. Always sum the parts before reading off a fraction.',
          },
        ],
      },
      {
        id: 'rounding',
        title: 'Rounding and answer options',
        subtitle: 'Round at the end, not in the middle. Match the precision the answer options demand.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'check',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Official candidate advice recommends rounding to eliminate clearly wrong options, but students also need the opposite lesson: do not round too early when options are close. Keep extra precision during working, then round only when the question demands a specific final format.',
          },
          {
            kind: 'rule',
            title: 'Round at the end',
            body: 'Keep one or two extra digits during working and round only at the final step. Early rounding can shift a final answer by enough to match a wrong option instead of the right one.',
          },
          {
            title: 'Match the question format',
            bullets: [
              'Round to whole numbers if the answer options are whole numbers.',
              'Round to 1 or 2 decimal places when options use decimals.',
              'Match money to 2 decimal places (or as the options show).',
              'Match percentages to the same precision as the options.',
            ],
          },
          {
            title: 'Worked walk-through',
            bullets: [
              'Calculate 2.36 ÷ 0.49 with options 4.1, 4.8, 5.6, 6.2.',
              'Estimate: 2.5 ÷ 0.5 ≈ 5.',
              'That narrows it to 4.8 or 5.6.',
              'Now do the exact calculation. Do not round both numbers heavily and stop at the estimate.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'If options are 1,200, 1,210, 1,220, and 1,230, is a rough estimate enough?',
            options: ['Yes', 'No — calculate precisely', 'Sometimes'],
            correctIndex: 1,
            explanation: 'Tightly clustered options always demand precision. A rough estimate cannot separate values within 30 of each other.',
          },
          {
            kind: 'mini',
            prompt: 'A question asks for "the nearest whole number". When should you round?',
            options: ['As you go', 'Only at the very end', 'Both — round each step'],
            correctIndex: 1,
            explanation: 'Rounding mid-calculation introduces error that grows with each step. Hold extra digits, then round once at the final step.',
          },
          {
            kind: 'mini',
            prompt: 'Your rough working gives about 4.85. Options are 4.8 and 4.9. What should you do before choosing?',
            options: [
              'Pick 4.8 — round down.',
              'Pick 4.9 immediately.',
              'Re-check the working with full precision before rounding.',
            ],
            correctIndex: 2,
            explanation: 'Half-way values are exactly where one extra digit of precision can change the option. Re-check before locking in — rounding cannot fix a wrong calculation.',
          },
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'Apply the QR method to one full question per lesson. Answer it, then study the breakdown.',
    icon: 'notes',
    accentKey: 'mint',
    lessons: [
      {
        id: 'percentage-example',
        title: 'Percentage worked example',
        subtitle: 'A reverse-percentage scenario — find the original price, then the full revenue.',
        duration: '6 min',
        type: 'Worked example',
        icon: 'calculator',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Percentages worked example',
            body: 'A concert sold early-bird tickets at a 20% discount. You will find the full ticket price by dividing by the multiplier (not by adding the discount back), then multiply through to find revenue. Commit to your answer first; the breakdown afterwards walks through the full method and the trap options.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'table-example',
        title: 'Table question worked example',
        subtitle: 'Compare three packs by unit price, not sticker price.',
        duration: '6 min',
        type: 'Worked example',
        icon: 'list',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Table question worked example',
            body: 'A table gives weight and price for three snack packs. The cheapest sticker price is not the cheapest per 100 g. You will reduce each row to a unit rate, then compare. Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'graph-example',
        title: 'Bar chart worked example',
        subtitle: 'Read each bar against the scale, total, then divide for the mean.',
        duration: '6 min',
        type: 'Worked example',
        icon: 'chart',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Bar chart worked example',
            body: 'A bar chart shows monthly vaccine doses across four months. The question asks for the mean. Watch out for two trap shapes: picking the highest bar, and stopping at the total before dividing. Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'line-graph-example',
        title: 'Line graph worked example',
        subtitle: 'A 12-month visitor trend — read the endpoints, then apply the percentage-change formula.',
        duration: '6 min',
        type: 'Worked example',
        icon: 'chart',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Line graph worked example',
            body: 'Monthly clinic-website visitors over a year. The question asks for the percentage growth from January to December. Watch the wrong-base trap (using the new value as the denominator) and the ratio trap (forgetting to subtract 100% from a "X% OF" figure). Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'pie-chart-example',
        title: 'Pie chart worked example',
        subtitle: 'Read the named segment from the legend, then divide by the total.',
        duration: '5 min',
        type: 'Worked example',
        icon: 'chart',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Pie chart worked example',
            body: 'A hospital equipment budget split across five departments. The question asks for one named segment as a percentage. Watch the largest-slice decoy and remember to match the LABEL before reading any value. Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'scatter-plot-example',
        title: 'Scatter plot worked example',
        subtitle: 'Spot the point that breaks the trend — outliers are not extremes.',
        duration: '5 min',
        type: 'Worked example',
        icon: 'chart',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Scatter plot worked example',
            body: 'Five GP clinics plotted by daily appointments vs satisfaction score. The question asks which clinic does NOT fit the trend. Sketch the overall direction first; the outlier is the point that breaks it, not the highest or lowest value. Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'geometry-example',
        title: 'Geometry worked example',
        subtitle: 'L-shaped room — split into rectangles or subtract the cutout, then multiply by unit cost.',
        duration: '6 min',
        type: 'Worked example',
        icon: 'pencil',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Geometry worked example',
            body: 'An L-shaped floor plan with labelled outer dimensions. The question asks for the total tile cost at £45 per m². Watch the "forgot to subtract the cutout" trap — using the full bounding rectangle is the planted distractor. Commit to your answer first; the breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'word-problem-example',
        title: 'Multi-step word problem worked example',
        subtitle: 'Outward travel + library stay + return travel — convert before you add.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'pencil',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multi-step word problem worked example',
            body: 'A multi-step travel scenario with two journey legs and a stay in the middle. Convert each leg to minutes BEFORE adding, and make sure you include the stay. Commit to your answer first; the breakdown walks through every stage and the missed-step trap.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
    ],
  },
  {
    id: 'apply',
    title: 'Apply It',
    description: 'Convert understanding into action — mixed retrieval and a final pre-test checklist.',
    icon: 'flag',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'mini-drill',
        title: 'Mini QR drill — mixed skills',
        subtitle: 'A quick mixed retrieval set covering percentages, ratios, tables, graphs, and multi-step.',
        duration: '8 min',
        type: 'Strategy',
        icon: 'flame',
        practiceLabel: 'Start QR practice',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'The goal of this drill is not to imitate a full timed test. It is to force quick switching between the main QR skill families: percentages, ratios, tables, graphs, multi-step reasoning, successive percentages, average speed, and tax bands. Use whichever method fits the question fastest.',
          },
          {
            kind: 'mini',
            prompt: 'A price of £80 is reduced by 15%. What is the new price?',
            options: ['£12', '£65', '£68', '£72'],
            correctIndex: 2,
            explanation: '15% of 80 = 12. New price = 80 − 12 = £68. Or: 80 × 0.85 = £68.',
          },
          {
            kind: 'mini',
            prompt: 'Share 72 in the ratio 1:2:3.',
            options: ['12, 24, 36', '24, 24, 24', '8, 16, 48', '12, 12, 48'],
            correctIndex: 0,
            explanation: 'Total parts = 6, so one part = 12. Shares = 12, 24, 36. Sanity check: 12 + 24 + 36 = 72 ✓.',
          },
          {
            kind: 'mini',
            prompt: 'A packet costs £2.40 and contains 300 g. What is the cost per 100 g?',
            options: ['£0.40', '£0.80', '£1.20', '£8.00'],
            correctIndex: 1,
            explanation: '2.40 ÷ 300 × 100 = £0.80 per 100 g.',
          },
          {
            kind: 'mini',
            prompt: 'A price rises 10%, then falls 10%. What is the net change?',
            options: ['No change', '1% loss', '1% gain', '10% loss'],
            correctIndex: 1,
            explanation: '1.1 × 0.9 = 0.99. Net 1% loss. Successive percentages do not cancel.',
          },
          {
            kind: 'mini',
            prompt: 'A journey covers 100 km in 1 hour, then 100 km in 2 hours. What is the average speed?',
            options: ['50 km/h', '66.7 km/h', '75 km/h', '100 km/h'],
            correctIndex: 1,
            explanation: 'Total distance ÷ total time = 200 ÷ 3 ≈ 66.7 km/h. The simple average of the two speeds (75 km/h) is the trap.',
          },
          {
            kind: 'mini',
            prompt: '0% on first £10k, 20% on £10k–£40k, 40% above. Tax on £45k?',
            options: ['£6,000', '£8,000', '£9,000', '£18,000'],
            correctIndex: 1,
            explanation: '£0 (first £10k) + £6,000 (20% × £30k) + £2,000 (40% × £5k) = £8,000.',
          },
          {
            kind: 'tip',
            title: 'Watch the carry-over effect',
            body: 'When you switch between question types, your brain often carries the previous question\'s method into the next one. Reset before each item: read the stem fresh, identify the target, choose the method.',
          },
        ],
      },
      {
        id: 'final-checklist',
        title: 'Final QR checklist',
        subtitle: 'A short, rehearsed mental script to run through before answering — and before exam day.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'check',
        practiceLabel: 'Start QR practice',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A final checklist is useful because QR errors are repetitive. Students do not usually fail because they forgot every formula — they fail because they repeat the same two or three habits under time pressure. A strong checklist keeps thinking simple enough to survive inside the actual subtest.',
          },
          {
            kind: 'checklist',
            title: 'Pre-question checks',
            items: [
              'What is the final quantity I am being asked for?',
              'Which numbers actually matter?',
              'Are the units consistent?',
              'Have I glanced at the answer options?',
              'Can I estimate first?',
              'Do I need the calculator or not?',
              'Is this the final answer, not an intermediate value?',
              'If it is taking too long, should I flag and move on?',
            ],
          },
          {
            kind: 'checklist',
            title: 'Pass discipline across 26 minutes',
            items: [
              'Pass 1 — answer fast, flag hard questions.',
              'Pass 2 — return to flagged questions, 60 seconds each.',
              'Pass 3 — blanket-guess any remaining question with 30 seconds left.',
              'Never leave a blank — there is no negative marking.',
            ],
          },
          {
            kind: 'rule',
            title: 'The one phrase to remember',
            body: 'Choose the right maths faster. Not "do harder maths". Not "be more careful". Choose. The. Right. Maths. Faster.',
          },
          {
            kind: 'mini',
            prompt: 'What should you check before trusting a calculator answer?',
            options: [
              'Whether the calculator screen looks bright.',
              'Whether the answer makes sense in size and units versus your estimate.',
              'Whether the test has started.',
            ],
            correctIndex: 1,
            explanation: 'Estimate first, calculate, then sense-check size and units. A wildly different number means you mistyped — re-enter rather than locking in.',
          },
          {
            kind: 'mini',
            prompt: 'You see you are chasing a messy question for too long. What should you do?',
            options: [
              'Push through — sunk cost.',
              'Flag, best-guess, move on.',
              'Skip without picking anything.',
            ],
            correctIndex: 1,
            explanation: 'Flag and move. Sunk cost is the most expensive trap on QR — protect the easy and medium marks elsewhere.',
          },
          {
            kind: 'mini',
            prompt: 'With 30 seconds left and 4 unanswered questions, what should you do?',
            options: [
              'Try to solve the first one.',
              'Pick a letter (A–E) and press it for all 4.',
              'Leave them blank to be safe.',
            ],
            correctIndex: 1,
            explanation: 'Never leave blanks. Random guessing across five options has an expected value of +0.2 per question — across 4 unanswered, that is roughly 1 mark for free.',
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
export const ESTIMATED_TIME = '158 min';

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
  const accent = colors[UCAT_SECTIONS.QR.accentKey] ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon={UCAT_SECTIONS.QR.icon} accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{UCAT_SECTIONS.QR.title.toUpperCase()}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Quantitative Reasoning lessons.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        Learn the maths, formulas, calculator skills, shortcuts, and strategies needed for UCAT QR.
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
        label={allComplete ? 'Start QR Practice' : nextLesson ? `Continue: ${nextLesson.title}` : 'Continue Learning'}
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

function LessonCard({ lesson, status, accent, colors, isDark, onPress, isPremium, isLocked }) {
  const completed = status === 'completed';
  const active = status === 'inProgress' || status === 'next';
  const borderColor = completed
    ? hexToRgba(colors.mint, 0.48)
    : active
      ? hexToRgba(accent, 0.58)
      : colors.border;
  const iconColor = completed ? colors.mint : active ? accent : colors.textMuted;

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.84}
      onPress={isLocked ? undefined : onPress}
      disabled={isLocked}
      style={[styles.lessonTouch, isLocked && styles.lessonTouchLocked]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isLocked }}
    >
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
            <Text style={[styles.lessonMeta, { color: colors.textMuted }]}>
              {lesson.duration} - {lesson.type}{isLocked ? ' - Locked' : ''}
            </Text>
            <StatusPill status={status} colors={colors} isDark={isDark} />
          </View>
        </View>

        {isLocked ? (
          <PremiumIcon name="lock" size={20} color={colors.textMuted} strokeWidth={2.4} />
        ) : isPremium ? (
          <PremiumIcon name="lock" size={20} color={colors.amber ?? '#f59e0b'} strokeWidth={2.4} />
        ) : (
          <PremiumIcon name="chevron-right" size={22} color={active ? accent : colors.textMuted} strokeWidth={2.4} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function ModuleSection({ module, completedIds, nextLessonNumber, colors, isDark, onSelectLesson, expanded, onToggle, isPro }) {
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
            const completed = completedIds.includes(lesson.id);
            const status = completed
              ? 'completed'
              : numberedLesson?.number === nextLessonNumber
                ? 'next'
                : 'notStarted';
            const isLocked = !completed && (numberedLesson?.number ?? 0) > nextLessonNumber;

            return (
              <LessonCard
                key={lesson.id}
                lesson={numberedLesson}
                status={status}
                accent={accent}
                colors={colors}
                isDark={isDark}
                isPremium={PREMIUM_LESSON_TYPES.has(numberedLesson?.type) && !isPro}
                isLocked={isLocked}
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
  const heroAccent = colors.purple ?? colors.blue;

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
          {allComplete ? 'QR Learning Complete' : 'Ready to apply it?'}
        </Text>
        <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
          {allComplete
            ? 'You have finished the QR learning pathway.'
            : 'Open untimed QR practice when you want to turn a lesson into repetition.'}
        </Text>
        <View style={styles.practiceButtons}>
          <PrimaryButton label="Start QR Practice" icon="pencil" color={heroAccent} onPress={onPractice} style={styles.practiceButton} />
          <PrimaryButton label="Start Timed QR Test" icon="timer" color={colors.cyan} variant="outline" onPress={onTimed} style={styles.practiceButton} />
        </View>
      </View>
    </View>
  );
}

export default function QuantitativeReasoningLearnScreen({ navigation }) {
  const { isDark } = useTheme();
  const { colors, gradients } = getPremiumTheme(isDark);
  const { isPro } = useSubscription();
  const openPaywall = usePaywallNavigation();
  const [completedIds, setCompletedIds] = useState([]);
  const [expandedModules, setExpandedModules] = useState(() => MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {}));
  const introAnim = useFadeSlide(0, 14);
  const contentAnim = useFadeSlide(120, 16);

  const toggleModule = useCallback((moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  }, []);

  const handleResetProgress = useCallback(() => {
    Alert.alert(
      'Reset QR progress?',
      'This will clear all your completed lessons in Quantitative Reasoning. This cannot be undone.',
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
    navigation.navigate('QRQuestionList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'QR', title: 'Quantitative Reasoning' });
  }, [navigation]);

  const openLesson = useCallback((lessonId) => {
    const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return;
    const alreadyCompleted = completedIds.includes(lessonId);
    const isLocked = !alreadyCompleted && lesson.number > nextLesson.number;
    if (isLocked) return;
    if (!isPro && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      openPaywall();
      return;
    }
    navigation.navigate('LearnQRLesson', { lessonId });
  }, [isPro, openPaywall, navigation, completedIds, nextLesson]);

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
      <AppHeader navigation={navigation} title="Learn QR" />

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
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Your QR Path</Text>
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
                accessibilityLabel="Reset QR progress"
              >
                <PremiumIcon name="refresh" size={18} color={colors.textSecondary} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Work through the path in order. Each lesson unlocks once you finish the one before it — completed lessons stay open for review.
            </Text>
          </View>

          {MODULES.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              completedIds={completedIds}
              nextLessonNumber={nextLesson?.number ?? TOTAL_LESSONS}
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
  lessonTouchLocked: {
    opacity: 0.55,
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
