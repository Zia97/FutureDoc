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

export const STORAGE_KEY = '@futuredoc/qr_learning_completed_lessons';

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Understand what QR is testing and the general method for every question.',
    icon: 'book',
    accentKey: 'purple',
    lessons: [
      {
        id: 'what-qr-tests',
        title: 'What QR tests',
        subtitle: 'Speed, accuracy, and basic maths under time pressure - not advanced calculation.',
        duration: '4 min',
        type: 'Introduction',
        icon: 'brain',
        steps: [
          {
            title: 'The real skill',
            body: 'QR is not advanced maths. It tests whether you can read data correctly, choose the right operation, and finish quickly. Most lost marks come from misreading or running out of time, not difficult calculations.',
          },
          {
            title: 'What QR is testing',
            bullets: [
              'Percentages, ratios, fractions, and averages.',
              'Rates, units, and basic conversions.',
              'Reading tables, charts, and short scenarios.',
              'Translating word problems into calculations.',
              'Speed and accuracy under exam conditions.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If you understood the data and chose the correct operation, the maths itself is usually straightforward. Time is the real opponent.',
          },
        ],
      },
      {
        id: 'how-qr-works',
        title: 'How QR questions work',
        subtitle: 'Learn the structure of QR sets so you do not absorb data you will never use.',
        duration: '5 min',
        type: 'Introduction',
        icon: 'list',
        steps: [
          {
            title: 'QR is a mix of formats',
            body: 'A QR question can be a standalone calculation or part of a set sharing the same table, chart, or scenario. Sets reuse the data, so reading carefully once pays off across several questions.',
          },
          {
            title: 'What you may see',
            bullets: [
              'A table of values.',
              'A bar, line, or pie chart.',
              'A short written scenario.',
              'A diagram or simple figure.',
              'A standalone calculation with no stimulus.',
            ],
          },
          {
            title: 'Read the question first',
            body: 'Before studying the data, read the question stem. That tells you exactly which row, column, or value to look for, so you do not try to understand the whole stimulus at once.',
          },
          {
            title: 'Quick check',
            body: 'If you find yourself memorising the table, stop. You only need the values that answer the question.',
          },
        ],
      },
      {
        id: 'core-qr-method',
        title: 'The core QR method',
        subtitle: 'Use a repeatable method for solving QR questions under pressure.',
        duration: '6 min',
        type: 'Core method',
        icon: 'target',
        practiceLabel: 'Practise QR questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Read with intent',
            body: 'Read the final question first so you know what value is needed. Only then look at the data, with that goal in mind.',
          },
          {
            title: 'The eight-step routine',
            bullets: [
              'Read the final question first.',
              'Identify the value being asked for.',
              'Find the relevant data only.',
              'Choose the correct operation.',
              'Estimate before calculating.',
              'Calculate efficiently.',
              'Check units and answer format.',
              'Move on if it is taking too long.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before tapping an answer, restate the question in your own words. If your value answers a slightly different question, redo the final step.',
          },
        ],
      },
      {
        id: 'calculator-basics',
        title: 'Calculator and keyboard basics',
        subtitle: 'Learn when the calculator helps and when it slows you down.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'calculator',
        steps: [
          {
            title: 'The calculator is a tool, not a default',
            body: 'The on-screen calculator helps for awkward decimals, long multiplications, and multi-step arithmetic. For simple percentages and obvious ratios, it is usually slower than mental maths.',
          },
          {
            title: 'Use the calculator when',
            bullets: [
              'The numbers are long decimals.',
              'You need a precise final answer.',
              'There are several arithmetic steps in a row.',
              'A table or chart contains awkward values.',
            ],
          },
          {
            title: 'Use mental maths when',
            bullets: [
              'You only need an estimate.',
              'The percentage is simple (10%, 25%, 50%).',
              'You are eliminating obviously wrong options.',
              'The numbers round cleanly.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Practise with the UCAT-style calculator before exam day. Typing accuracy matters as much as the maths itself.',
          },
        ],
      },
    ],
  },
  {
    id: 'maths',
    title: 'Core Maths Skills',
    description: 'Build the maths foundations behind every QR question type.',
    icon: 'brain',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'percentages',
        title: 'Percentages',
        subtitle: 'Master percentage of, increase, decrease, change, and reverse percentages.',
        duration: '7 min',
        type: 'Core skill',
        icon: 'calculator',
        practiceLabel: 'Practise percentage questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'The core operations',
            bullets: [
              'Percentage of a value: 20% of 150 = 0.20 x 150 = 30.',
              'Increase by X%: multiply by (1 + X/100).',
              'Decrease by X%: multiply by (1 - X/100).',
              'Percentage change: (new - old) / old x 100.',
              'Reverse percentage: divide by the multiplier you applied.',
            ],
          },
          {
            title: 'Mini example',
            body: 'A price falls from 80 to 64. Percentage change = (64 - 80) / 80 x 100 = -20%. The price decreased by 20%.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Using the new value as the original when calculating change.',
              'Confusing percentage points with percentage change.',
              'Applying increases and decreases in the wrong order.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After a 10% increase then a 10% decrease, you do not return to the original value. Always work from the most recent figure.',
          },
        ],
      },
      {
        id: 'fractions-decimals',
        title: 'Fractions, decimals, and conversions',
        subtitle: 'Move quickly between fractions, decimals, and percentages.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'filter',
        steps: [
          {
            title: 'Common conversions to memorise',
            bullets: [
              '1/2 = 0.5 = 50%.',
              '1/4 = 0.25 = 25%.',
              '3/4 = 0.75 = 75%.',
              '1/5 = 0.2 = 20%.',
              '1/10 = 0.1 = 10%.',
              '1/3 ~ 0.333 ~ 33.3%.',
              '2/3 ~ 0.667 ~ 66.7%.',
            ],
          },
          {
            title: 'When to keep exact, when to estimate',
            body: 'For final answers, keep extra digits and round at the end. For elimination, an estimate is often enough to remove options that are far off.',
          },
          {
            title: 'Quick check',
            body: 'If you need 2/3 of a number, multiply by 2 and divide by 3 - or recognise it as roughly 67%. Both routes work; pick whichever is faster on the values given.',
          },
        ],
      },
      {
        id: 'ratios-proportions',
        title: 'Ratios and proportions',
        subtitle: 'Simplify, split, and scale ratios without losing parts.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'list',
        steps: [
          {
            title: 'The core moves',
            bullets: [
              'Simplify: divide every part by the same number.',
              'Split a total: add the parts, divide the total by that sum, multiply each part.',
              'Scale: keep the ratio constant, change the absolute values.',
              'Compare ratios: convert to a common base or to fractions.',
            ],
          },
          {
            title: 'Mini example',
            body: 'A recipe uses flour and sugar in a 3:2 ratio. If 150g of flour is used, sugar = 150 x 2/3 = 100g.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Adding parts incorrectly when splitting a total.',
              'Comparing raw numbers instead of proportions.',
              'Forgetting to scale every part of the ratio.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After scaling, the ratio between the parts should still simplify to the original ratio. If not, you have scaled one part more than the other.',
          },
        ],
      },
      {
        id: 'averages-range',
        title: 'Averages and range',
        subtitle: 'Mean, median, mode, and how missing values fall out of the average.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'chart',
        steps: [
          {
            title: 'The four basics',
            bullets: [
              'Mean = total / number of items.',
              'Median = middle value once sorted.',
              'Mode = most common value.',
              'Range = highest - lowest.',
            ],
          },
          {
            title: 'Working backwards from the mean',
            body: 'If the average of 5 numbers is 12, the total is 60. Use this to find a missing value: subtract the known values from the total.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Forgetting to sort before finding the median.',
              'Confusing mean with median when the data is skewed.',
              'Treating range as a measure of average.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If a question gives an average and asks for one missing value, work through the total first, not the individual values.',
          },
        ],
      },
      {
        id: 'units-conversions',
        title: 'Units and conversions',
        subtitle: 'Convert time, distance, mass, and volume before calculating.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'notes',
        steps: [
          {
            title: 'Conversions you must know',
            bullets: [
              '1 hour = 60 minutes; 1 minute = 60 seconds.',
              '1 km = 1000 m; 1 m = 100 cm.',
              '1 kg = 1000 g.',
              '1 litre = 1000 ml.',
            ],
          },
          {
            title: 'Convert before you calculate',
            body: 'Mixing units is one of the most common QR errors. If a rate is per hour and the time is in minutes, convert before doing any arithmetic.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Mixing minutes and hours in speed or rate calculations.',
              'Forgetting to convert km to m or vice versa.',
              'Giving the answer in the wrong unit.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before locking in your answer, glance at the unit in the answer options. If they are in metres and you calculated in km, multiply by 1000.',
          },
        ],
      },
      {
        id: 'speed-rates',
        title: 'Speed, distance, time, and rates',
        subtitle: 'Use the speed triangle and rate logic without slipping on units.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'timer',
        steps: [
          {
            title: 'The core formulas',
            bullets: [
              'Speed = Distance / Time.',
              'Distance = Speed x Time.',
              'Time = Distance / Speed.',
            ],
          },
          {
            title: 'Other rate questions',
            bullets: [
              'Cost per item: total cost / number of items.',
              'Output per hour: total output / hours worked.',
              'Unit rate: scale to "per 1" before comparing.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Using minutes when the speed is in km/hour.',
              'Multiplying when the question requires division.',
              'Comparing total values instead of per-unit values.',
            ],
          },
          {
            title: 'Quick check',
            body: 'For a speed answer in km/h, time must be in hours and distance in km. Rewrite both before calculating.',
          },
        ],
      },
      {
        id: 'algebra',
        title: 'Basic algebra and equations',
        subtitle: 'Translate words into equations and solve for the missing value.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'pencil',
        steps: [
          {
            title: 'The core moves',
            bullets: [
              'Use a letter for the unknown.',
              'Translate words into an equation.',
              'Rearrange to isolate the unknown.',
              'Substitute back to check.',
            ],
          },
          {
            title: 'Mini example',
            body: '3x + 5 = 20. Subtract 5: 3x = 15. Divide by 3: x = 5.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Reversing the order of operations when rearranging.',
              'Forgetting to apply the same change to both sides.',
              'Translating "is more than" or "less than" the wrong way around.',
            ],
          },
          {
            title: 'Quick check',
            body: 'After solving, plug your value back into the original equation. If it does not balance, the rearrangement is wrong.',
          },
        ],
      },
      {
        id: 'geometry',
        title: 'Geometry and measurement',
        subtitle: 'Only the geometry that actually appears in QR.',
        duration: '6 min',
        type: 'Core skill',
        icon: 'filter',
        steps: [
          {
            title: 'Formulas to know',
            bullets: [
              'Area of rectangle = length x width.',
              'Area of triangle = 1/2 x base x height.',
              'Area of circle = pi x r^2.',
              'Circumference = 2 x pi x r.',
              'Volume of cuboid = length x width x height.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Using diameter instead of radius in circle formulas.',
              'Forgetting square units for area, cubic units for volume.',
              'Confusing area with perimeter in word problems.',
            ],
          },
          {
            title: 'Quick check',
            body: 'When a question gives a diameter, halve it before using the area or circumference formula. UCAT often gives the value that needs converting first.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'QR Question Types',
    description: 'Learn the main forms QR questions take and the right approach for each.',
    icon: 'list',
    accentKey: 'blue',
    lessons: [
      {
        id: 'table-questions',
        title: 'Table questions',
        subtitle: 'Read tables efficiently without absorbing irrelevant rows.',
        duration: '7 min',
        type: 'Question type',
        icon: 'list',
        practiceLabel: 'Practise table questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Read the question first',
            body: 'Before studying the table, identify which value the question wants. Then go straight to the relevant row and column instead of reading the whole table.',
          },
          {
            title: 'Watch the headers',
            bullets: [
              'Check row labels for the category.',
              'Check column labels for the variable.',
              'Watch for unit hints in the headers (kg, %, GBP).',
              'Note any total or subtotal rows.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Picking up a value from the wrong row.',
              'Misreading a unit in the column header.',
              'Using a total when the question asks for a category.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Point to the cell that gave you the value before you calculate. If you cannot, you have misread the table.',
          },
        ],
      },
      {
        id: 'graph-questions',
        title: 'Graph and chart questions',
        subtitle: 'Read bar, line, pie, and stacked charts without estimation errors.',
        duration: '8 min',
        type: 'Question type',
        icon: 'chart',
        practiceLabel: 'Practise graph questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Always check the axes',
            bullets: [
              'Look at axis labels and units.',
              'Note the scale interval - small steps mean fine differences matter.',
              'Watch for broken or shifted axes.',
            ],
          },
          {
            title: 'Reading specific chart types',
            bullets: [
              'Bar chart: compare heights or lengths.',
              'Line graph: look for trends and turning points.',
              'Pie chart: read percentages, then convert to absolute values if needed.',
              'Stacked chart: subtract layers to find a single category.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Estimating too roughly when the answer options are close.',
              'Confusing the percentage of a slice with the absolute value.',
              'Reading a stacked total as a single category.',
            ],
          },
          {
            title: 'Quick check',
            body: 'When the answer options are close together, treat estimation as elimination, not as the final answer. Read the value off the scale precisely.',
          },
        ],
      },
      {
        id: 'word-problems',
        title: 'Word problem questions',
        subtitle: 'Translate words into maths and ignore the numbers you do not need.',
        duration: '7 min',
        type: 'Question type',
        icon: 'notes',
        practiceLabel: 'Practise word problems',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Identify the final value',
            body: 'Underline mentally what the question is asking for. The setup may give five numbers, but only two or three matter.',
          },
          {
            title: 'Words that change the calculation',
            bullets: [
              '"Increase" / "rise" / "more than" - addition or percentage up.',
              '"Difference" / "decrease" / "less than" - subtraction or percentage down.',
              '"Total" / "altogether" - addition.',
              '"Per person" / "per item" - division.',
              '"Remaining" / "left" - subtract from the starting value.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Using every number in the question, even ones that are not relevant.',
              'Stopping at an intermediate value that happens to match an answer option.',
              'Missing a final conversion (e.g. minutes back to hours).',
            ],
          },
          {
            title: 'Quick check',
            body: 'Before tapping, ask: does my answer answer the actual question, or just one step of it?',
          },
        ],
      },
      {
        id: 'multi-step',
        title: 'Multi-step calculation questions',
        subtitle: 'Manage questions that need more than one operation in sequence.',
        duration: '7 min',
        type: 'Question type',
        icon: 'target',
        steps: [
          {
            title: 'Plan before calculating',
            body: 'List the steps in your head before touching the calculator. Two clear steps are faster than one panicked attempt.',
          },
          {
            title: 'A repeatable structure',
            bullets: [
              'Break the question into smaller steps.',
              'Note the intermediate value.',
              'Check the intermediate value answers nothing on its own.',
              'Complete the final step.',
            ],
          },
          {
            title: 'The intermediate-value trap',
            body: 'UCAT often includes the value from step 1 as a wrong option. If your answer matches an early result, you may have stopped too early.',
          },
          {
            title: 'Quick check',
            body: 'After each step, ask whether you have answered the question or only set up the next step. Stop only when the final operation is done.',
          },
        ],
      },
      {
        id: 'estimation',
        title: 'Estimation questions',
        subtitle: 'Use estimation to eliminate options and save time.',
        duration: '6 min',
        type: 'Question type',
        icon: 'flame',
        steps: [
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
            title: 'Mini example',
            body: '49.8 x 21.2. Estimate as 50 x 21 = 1050. If only one option is near 1050, you do not need the exact value.',
          },
          {
            title: 'Common traps',
            bullets: [
              'Estimating when the options are very close together.',
              'Rounding both numbers in the same direction without adjusting.',
              'Trusting an estimate when a question explicitly asks for a precise value.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If two answer options are within a few percent of each other, do the precise calculation. Estimation cannot separate them.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Build the speed habits and trap awareness that protect marks under QR time pressure.',
    icon: 'target',
    accentKey: 'amber',
    lessons: [
      {
        id: 'timing-strategy',
        title: 'Timing strategy for QR',
        subtitle: 'Learn when to push, when to estimate, and when to move on.',
        duration: '6 min',
        type: 'Timing',
        icon: 'timer',
        practiceLabel: 'Try a timed QR set',
        practiceRoute: 'timed',
        steps: [
          {
            title: 'QR is fast-paced',
            body: 'A full QR section gives roughly 40 seconds per question. Some questions are quick reads; others require multi-step working. Treat that average as a budget, not a rule.',
          },
          {
            title: 'Triage rules',
            bullets: [
              'Fast questions: answer immediately, then move on.',
              'Awkward questions: judge after 30-40 seconds.',
              'Stuck questions: flag, guess, and skip - never grind.',
            ],
          },
          {
            title: 'Easy marks first',
            body: 'You score the same mark for an easy question and a hard one. Protect the easy and medium marks before chasing one ugly question.',
          },
          {
            title: 'Quick check',
            body: 'QR rewards efficient decisions as much as maths ability. If you can eliminate two options and the rest is unclear, guess and move.',
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
            title: 'Mental maths is often faster',
            bullets: [
              'Simple percentages (10%, 25%, 50%).',
              'Small additions and subtractions.',
              'Obvious ratios and unit conversions.',
              'Quick estimation for elimination.',
            ],
          },
          {
            title: 'Calculator is often faster',
            bullets: [
              'Long decimals and awkward percentages.',
              'Multi-step arithmetic with several values.',
              'Precise final answers from a table or chart.',
              'Anything where typing is faster than carrying digits.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If you reach for the calculator and the calculation is one quick step, you are probably wasting seconds. The opposite is also true: do not force a long sum mentally just to seem efficient.',
          },
        ],
      },
      {
        id: 'qr-traps',
        title: 'Common QR traps',
        subtitle: 'Avoid the mistakes that cost students easy marks.',
        duration: '6 min',
        type: 'Traps',
        icon: 'flag',
        steps: [
          {
            title: 'The big trap family',
            bullets: [
              'Using the wrong row, column, or chart value.',
              'Ignoring units or mixing them.',
              'Rounding too early in a multi-step calculation.',
              'Selecting an intermediate value as the final answer.',
              'Misreading "increase by" vs "increase to".',
              'Confusing percentage change with raw difference.',
              'Trusting the calculator without estimating first.',
            ],
          },
          {
            title: 'Watch for small wording',
            body: 'Words such as "except", "remaining", "average", and "per person" can change the entire calculation. Slow down on these even when the maths looks simple.',
          },
          {
            title: 'Quick check',
            body: 'If your answer matches an option exactly but the calculation felt suspiciously short, recheck the question wording. UCAT often hides one extra step.',
          },
        ],
      },
      {
        id: 'rounding',
        title: 'Rounding and answer options',
        subtitle: 'Round at the right moment, not too early.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'check',
        steps: [
          {
            title: 'The core rule',
            body: 'Keep extra digits during working and round only at the end. Early rounding can shift a final answer by enough to match a wrong option instead of the right one.',
          },
          {
            title: 'Match the question format',
            bullets: [
              'Round to whole numbers if the answer options are whole numbers.',
              'Round to 1 or 2 decimal places when the options use decimals.',
              'Match money to 2 decimal places (or as the options show).',
              'Match percentages to the same precision as the options.',
            ],
          },
          {
            title: 'Common traps',
            bullets: [
              'Rounding to a whole number midway through, then losing precision.',
              'Giving more decimal places than the options use.',
              'Rounding the wrong direction on a half-way value.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If your unrounded answer is close to two options, recheck the working before rounding. Rounding cannot fix a wrong calculation.',
          },
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'See the QR method applied step by step, with the right and wrong reasoning side by side.',
    icon: 'notes',
    accentKey: 'mint',
    lessons: [
      {
        id: 'percentage-example',
        title: 'Percentage worked example',
        subtitle: 'Apply percentage change step by step.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'calculator',
        steps: [
          {
            title: 'Scenario',
            body: 'A laptop is on sale at 15% off its original price of 800 GBP. After the sale, the shop adds 5% VAT to the discounted price.',
          },
          {
            title: 'Question',
            body: 'What is the final price the customer pays?',
          },
          {
            title: 'Step-by-step calculation',
            bullets: [
              'Discounted price = 800 x (1 - 0.15) = 800 x 0.85 = 680 GBP.',
              'Final price = 680 x (1 + 0.05) = 680 x 1.05 = 714 GBP.',
            ],
          },
          {
            title: 'Common trap',
            body: 'Students often combine 15% off and 5% on into a single 10% off, giving 720 GBP. Percentages applied in sequence do not add or subtract directly.',
          },
          {
            title: 'Final answer',
            body: '714 GBP.',
          },
        ],
      },
      {
        id: 'table-example',
        title: 'Table question worked example',
        subtitle: 'Find the right row and column without absorbing the whole table.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'list',
        steps: [
          {
            title: 'Scenario',
            body: 'A table shows monthly sales (in units) for three products A, B, and C across four months. Product B sold 240 in March and 300 in April.',
          },
          {
            title: 'Question',
            body: 'What was the percentage increase in Product B sales from March to April?',
          },
          {
            title: 'Identify the right cells',
            body: 'Only the March and April rows for Product B matter. Ignore Products A and C entirely.',
          },
          {
            title: 'Calculation steps',
            bullets: [
              'Increase = 300 - 240 = 60.',
              'Percentage change = 60 / 240 x 100 = 25%.',
            ],
          },
          {
            title: 'Common trap',
            body: 'Students often divide by 300 (the new value) instead of 240 (the original), giving 20%. Always divide by the original value.',
          },
          {
            title: 'Final answer',
            body: '25%.',
          },
        ],
      },
      {
        id: 'graph-example',
        title: 'Graph question worked example',
        subtitle: 'Read a chart precisely without rounding too soon.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'chart',
        steps: [
          {
            title: 'Scenario',
            body: 'A bar chart shows daily revenue across five days. Monday is at 1,200 GBP, Tuesday at 1,500 GBP, Wednesday at 900 GBP, Thursday at 1,800 GBP, Friday at 1,600 GBP.',
          },
          {
            title: 'Question',
            body: 'What is the mean daily revenue across the five days?',
          },
          {
            title: 'Calculation steps',
            bullets: [
              'Total = 1200 + 1500 + 900 + 1800 + 1600 = 7000 GBP.',
              'Mean = 7000 / 5 = 1400 GBP.',
            ],
          },
          {
            title: 'Common trap',
            body: 'Students often misread one bar by 100-200 GBP and end up with a very close but wrong answer. Reading each bar carefully against the scale is the difference between right and almost right.',
          },
          {
            title: 'Final answer',
            body: '1,400 GBP.',
          },
        ],
      },
      {
        id: 'word-problem-example',
        title: 'Multi-step word problem worked example',
        subtitle: 'See why stopping at an intermediate value would lose the mark.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'pencil',
        steps: [
          {
            title: 'Scenario',
            body: 'A coach travels at 60 km/h for 2 hours, then at 80 km/h for 1.5 hours. The driver wants the average speed for the whole journey.',
          },
          {
            title: 'Question',
            body: 'What is the average speed across the entire journey?',
          },
          {
            title: 'Calculation steps',
            bullets: [
              'Distance leg 1 = 60 x 2 = 120 km.',
              'Distance leg 2 = 80 x 1.5 = 120 km.',
              'Total distance = 240 km.',
              'Total time = 2 + 1.5 = 3.5 hours.',
              'Average speed = 240 / 3.5 ~ 68.57 km/h.',
            ],
          },
          {
            title: 'Common trap',
            body: 'Students often average the two speeds directly: (60 + 80) / 2 = 70 km/h. Average speed depends on total distance over total time, not the mean of the speeds.',
          },
          {
            title: 'Final answer',
            body: 'Approximately 68.6 km/h.',
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
export const ESTIMATED_TIME = '45 min';

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
  const accent = colors.purple ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon="calculator" accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>QUANTITATIVE REASONING</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Master QR step by step.</Text>
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
            ? 'You have finished the QR learning pathway. Move into practice while the method is fresh.'
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
    if (!isPro && lesson && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('LearnQRLesson', { lessonId });
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
