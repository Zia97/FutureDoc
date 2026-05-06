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
import { UCAT_SECTIONS } from '../../constants/sectionVisuals';
import { VR_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const PREMIUM_LESSON_TYPES = new Set(['Strategy', 'Traps', 'Worked example']);

export const STORAGE_KEY = VR_LEARN_STORAGE_KEY;

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Understand what VR is testing and learn the core way to approach every passage.',
    icon: 'book',
    accentKey: 'blue',
    lessons: [
      {
        id: 'what-vr-tests',
        title: 'What VR is testing',
        subtitle: 'Learn what the section is really checking before you start practising.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What a VR question looks like',
            body: 'You are shown an unfamiliar passage on any topic, then asked questions about it. There are two question types:',
          },
          {
            title: 'The two question types',
            bullets: [
              "True / False / Can't Tell (T/F/CT) — You read a statement and decide if the passage proves it true, proves it false, or gives you too little information to tell.",
              'Multiple Choice (MCQ) — You pick the best answer from four options, usually completing a sentence or choosing the most supported conclusion.',
            ],
          },
          {
            kind: 'rule',
            title: 'The key rule for both types',
            body: 'Your answer must come from the passage alone — not from what you think is true in real life, not from what seems likely. Only what the passage actually says.',
          },
          {
            title: 'The passage is your authority',
            body: 'The passage is the only source of truth. You cannot add missing facts from memory or general knowledge to justify an answer.',
          },
          {
            title: 'What UCAT is checking',
            bullets: [
              'Whether you can read quickly and find the exact evidence.',
              'Whether you can stay disciplined and separate what you know from what the text says.',
              'Whether you can spot answers that are too strong, too broad, or too confident for the evidence.',
            ],
          },
          {
            title: 'What UCAT is not checking',
            bullets: [
              'It is not testing what you already know about the topic.',
              'It is not testing whether something is "probably true" in real life.',
              'It is not asking for the most reasonable-sounding answer; it is asking for the supported one.',
            ],
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'If the passage cannot support it, do not select it.',
          },
          {
            kind: 'mini',
            prompt: 'A passage states that a council delayed a vote until Friday. Which conclusion is justified?',
            options: [
              'The vote was delayed.',
              'The policy will fail.',
              'The council opposes the plan.',
              'Public opinion caused the delay.',
            ],
            correctIndex: 0,
            explanation: 'Only the first option is directly stated. The others may sound plausible, but the passage does not support them.',
          },
          {
            kind: 'mini',
            prompt: 'A passage says a river town\'s trade fell after a new bridge opened. Was the bridge definitely the cause?',
            options: [
              'Yes, the bridge caused the fall in trade.',
              'No, the passage shows trade fell after the bridge opened, but does not prove cause.',
              'Yes, because the events happened in that order.',
            ],
            correctIndex: 1,
            explanation: 'After does not mean because of. The passage describes a sequence, not a proven cause. Watch out for this trap throughout VR.',
          },
          {
            kind: 'tip',
            title: 'Why common sense can still lose you marks',
            body: 'Familiar topics are dangerous. Your brain fills gaps automatically with what you already know, even when the passage does not say it. Treat every option as guilty until the passage clears it.',
          },
        ],
      },
      {
        id: 'how-passages-work',
        title: 'How the section is built',
        subtitle: 'Before you practise, know the format — how many questions there are, how long you have, and which shortcuts matter.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'notes',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This lesson gives you the numbers behind VR — how many passages, how many questions, how long you have, and the keyboard shortcuts available on the test. Knowing the format before you start practising lets you build the right habits from day one.',
          },
          {
            title: 'The section at a glance',
            bullets: [
              '44 questions across 11 passages in 22 minutes.',
              'Four questions per passage set on average.',
              'There is no negative marking. If you are almost out of time, it is better to put a quick random guess than leave a question unanswered.',
              'VR is the first section of the UCAT — you take it before DM, QR, and SJT.',
            ],
          },
          {
            title: 'What the timer really means',
            body: "The '30 seconds per question' figure is an average, not a target. Easier True / False / Can't Tell items often take 15-25 seconds. Harder author or inference items can take 45-60 seconds. Plan for variable spend, not a metronome.",
          },
          {
            title: 'Pearson VUE shortcuts that save time',
            bullets: [
              'Alt+F flags a question for review.',
              'Alt+N moves to the next question.',
              'Alt+P moves to the previous question.',
              'Practising these saves roughly half a question across the section.',
            ],
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Accuracy first, then pace, then completion. Speed without precision creates repeated near-misses.',
          },
          {
            kind: 'mini',
            prompt: 'You have 22 minutes for 44 questions. What does this imply?',
            options: [
              'You should aim for exactly 30 seconds on every question.',
              'Easy questions should take less time so harder ones can take more.',
              'You should read every passage in full before answering.',
            ],
            correctIndex: 1,
            explanation: '30 seconds is an average. Bank time on easy items so you can spend it on harder ones. Reading every passage in full burns the budget.',
          },
          {
            kind: 'mini',
            prompt: 'You are out of time with one unanswered item left. There is no negative marking. What should you do?',
            options: [
              'Leave it blank to be safe.',
              'Pick the best guess, even a random letter is better than nothing.',
              'Spend the remaining seconds reading the passage.',
            ],
            correctIndex: 1,
            explanation: 'No negative marking means a blank is always worse than a guess. Always submit something on every question.',
          },
          {
            kind: 'tip',
            title: 'Why VR feels faster than it looks on paper',
            body: 'Reading 11 passages plus 44 question prompts in 22 minutes feels short because you are doing two tasks per question: searching the passage AND comparing options. Both use working memory, which is why pacing feels tighter than the raw timer suggests.',
          },
        ],
      },
      {
        id: 'core-vr-method',
        title: 'The core method for any VR set',
        subtitle: 'A step-by-step process you can apply to every passage and question in VR — learn this before anything else.',
        duration: '5 min',
        type: 'Core method',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This lesson teaches the default method you should apply to every VR question. It is not about one specific question type — it is the general process that works across all of them. Learn and internalise this before you study individual question types or strategies.',
          },
          {
            title: 'The approach in one sentence',
            body: 'Give the passage a quick glance so you roughly know where things are, then read each question, find your keyword, and go straight to the relevant part of the passage.',
          },
          {
            title: 'Why this order works',
            body: 'A quick glance at the passage first gives you a rough map — you know where the numbers are, where names appear, which paragraph covers which topic. Then when you read the question and pick your anchor keyword, you already have a sense of where to look. This is faster than either reading the whole passage carefully upfront or going in completely cold.',
          },
          {
            title: 'Step 1: do the opening glance',
            body: 'When a new passage appears, spend 8-10 seconds letting your eye move down the text. You are not reading in detail — you are building a rough map.',
            bullets: [
              'The first sentence of each paragraph usually signals its topic.',
              'Also glance at the final paragraph — writers often put their stance there.',
              'Numbers, names, and dates stand out visually — note roughly where they sit.',
              'Do not stop on unfamiliar words. Keep moving.',
              'After the glance, go straight to the first question.',
            ],
          },
          {
            title: 'Step 2: read the question',
            body: 'After the opening glance, read the question or statement in full. Work out what it is asking — is it a T/F/CT, a direct detail, an inference, or an author opinion? Each one tells you what kind of evidence to look for.',
          },
          {
            title: 'Step 3: pick your anchor keyword',
            bullets: [
              'Pull a distinctive word from the question — a name, date, place, or specific noun.',
              'Note any quantity words: "some", "all", "most", "may", "must".',
              'Avoid common words like "the" or "study" — they appear everywhere and will not help you locate the right line.',
            ],
          },
          {
            title: 'Step 4: scan the passage for that keyword',
            body: 'Run your eye down the passage looking only for your anchor. Once you find it, slow down and read that sentence and the one before and after it. That local area usually contains everything you need.',
          },
          {
            title: 'Step 5: decide — or guess and move on',
            body: 'If two options are close, compare their exact wording against the passage, not your memory of the idea. If an item is eating time, make your best call, flag it, and move on. Do not drift.',
          },
          {
            kind: 'rule',
            title: 'The method in order',
            body: 'Glance at the passage → read the question → pick an anchor → scan for it → read locally → decide or guess and move.',
          },
          {
            kind: 'mini',
            prompt: 'You are about to answer this question: "According to the passage, what role did Dr Patel play in the museum\'s closure?" Which word should you scan for first?',
            options: [
              '"museum"',
              '"closure"',
              '"Dr Patel"',
              '"the passage"',
            ],
            correctIndex: 2,
            explanation: '"Dr Patel" is the best anchor — it is a specific name that will appear only once or twice in the passage. "Museum" and "closure" are likely repeated throughout, so they will not take you straight to the right line.',
          },
          {
            kind: 'mini',
            prompt: 'You have read the question wording. What is the next best move under UCAT timing?',
            options: [
              'Read the entire passage carefully.',
              'Scan for the named person or keyword from the question.',
              'Read the answer options first to spot patterns.',
            ],
            correctIndex: 1,
            explanation: 'Scan for the keyword to locate the right region of the passage. Reading the full passage burns the time budget; reading options first usually biases you toward whichever sounds most familiar.',
          },
          {
            kind: 'tip',
            title: 'When a passage-first read can actually be faster',
            body: 'For very short passages (3-4 lines), reading the whole thing first can be quicker than scanning. For author-opinion questions, glancing at the final paragraph first often reveals the writer\'s stance. Adapt the method, do not abandon it.',
          },
          {
            kind: 'checklist',
            title: 'My core method',
            items: [
              'Give the passage a quick 8-10 second glance to build a rough map.',
              'After the glance, read the question and pick an anchor keyword.',
              'Scan for the anchor, then read that area closely.',
              'Compare exact wording when two options are close.',
              'Decide or guess and move on when time pressure builds.',
            ],
          },
        ],
      },
      {
        id: 'how-this-app-helps',
        title: 'How this app will help you learn VR',
        subtitle: 'A quick tour of the practice loop on this app — including the AI tutor that lives inside every question.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A short walkthrough of how to learn and practise VR on this app, plus a live demo of the AI tutor — the feature that turns every wrong answer into a one-on-one teaching session.',
          },
          {
            title: 'When to try questions',
            body: 'Once you have finished the lessons, or if you want to skip ahead and try questions now, answer a practice question and check whether you were correct for the right reasons. If you were wrong, guessed, or still feel unsure, ask the AI tutor follow-up questions on that exact question.',
          },
          {
            title: 'Why static explanations may not be enough',
            body: "An explanation tells you what the right answer was. It does not always tell you what your specific mistake was, why your reasoning fell short, or how to avoid the same trap next time. That is what the AI tutor is for — it sees the passage, the question, your answer, and the correct answer, and it answers your follow-ups in plain English.",
          },
          {
            kind: 'rule',
            title: 'Where the tutor lives',
            body: 'After you submit any practice question, look for the "Teach Me" button at the bottom of the explanation box. That opens the AI tutor for this exact question.',
          },
          {
            title: 'What you can ask',
            body: 'Ask any UCAT Verbal Reasoning question about the passage, the answer choices, or your reasoning. The tutor knows the full context of the question you are on, so you can ask directly, for example: "Why is this not B?" or "What did I miss?"',
          },
          {
            kind: 'demoLaunch',
            title: 'Try it now on a sample question',
            body: 'Tap the button below to open one short VR question. Answer it, then look for the highlighted "Teach Me" button to chat with the tutor.',
            buttonLabel: 'Try a sample question with the AI tutor',
            note: 'This demo is free — it does not use any of your AI credits.',
          },
          {
            kind: 'tip',
            title: 'Free vs Premium AI tutor access',
            body: 'Free users get 5 AI tutor messages in total across the app. Premium gives unlimited access on every question. Every student is unique and learns in different ways, so the AI tutor is here to answer your specific questions.',
          },
          {
            kind: 'rule',
            title: 'Use the tutor as soon as something is unclear',
            body: 'Do not power through a confusing explanation hoping it clicks later. Ask. The whole point of the tutor is to convert a confused minute into a learning minute.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'Question Types',
    description: 'Learn the two response formats and the question-wording patterns nested inside them.',
    icon: 'list',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'tfct',
        title: "True / False / Can't Tell",
        subtitle: "One of VR's two question types. You're given a statement and must decide: does the passage prove it, disprove it, or not say enough to tell?",
        duration: '6 min',
        type: 'Question type',
        icon: 'check',
        steps: [
          {
            title: 'What this question type looks like',
            body: "You are shown a passage and then a statement about it. Your job is to decide whether the statement is True, False, or Can't Tell from the passage alone. You pick one of exactly three answers:",
            bullets: [
              'True — the passage directly supports the statement',
              'False — the passage directly contradicts the statement',
              "Can't Tell — the passage does not give enough information to decide",
            ],
          },
          {
            kind: 'rule',
            title: 'Example format',
            body: 'Passage: "The library closed at 6 pm on weekdays."\nStatement: "The library was open at 7 pm on Monday."\nAnswer: False — the passage directly contradicts this.',
          },
          {
            title: 'What each answer means',
            bullets: [
              'True — the passage contains evidence that proves the statement.',
              'False — the passage contains evidence that contradicts the statement in a meaningful way.',
              "Can't Tell — the passage neither proves nor disproves the statement. There is simply not enough information.",
            ],
          },
          {
            title: "The default-to-Can't-Tell heuristic",
            body: "If you find yourself building a multi-step argument to call something 'True' or 'False', the answer is usually Can't Tell. The right answer should feel direct. A statement can sound reasonable and still be Can't Tell.",
          },
          {
            title: 'What to do when you have to guess',
            body: "If you can confidently eliminate one of True or False, your remaining choice is between the survivor and Can't Tell, never True vs False. Use this whenever you have to commit fast.",
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Supported is not the same as plausible. If you have to argue for True, the answer is probably Can\'t Tell.',
          },
          {
            kind: 'tip',
            title: 'Definitive vs mitigating language as a tiebreaker',
            body: 'Statements with definitive words ("always", "never", "all", "no one", "only") are often False. Statements with mitigating words ("may", "could", "often", "some") are often True or Can\'t Tell. Use this only as a tiebreaker, not a substitute for evidence.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "All sixth-year apprentices attend one mandatory safety seminar and some attend a second optional seminar." Statement: "Every apprentice attends two seminars."',
            options: [
              'True',
              'False',
              "Can't Tell",
            ],
            correctIndex: 1,
            explanation: 'The passage says only some apprentices attend a second seminar. The statement claims every apprentice attends two, which the passage directly contradicts.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A pilot scheme reduced waiting times in three clinics." Statement: "The scheme would reduce waiting times across the whole country."',
            options: [
              'True',
              'False',
              "Can't Tell",
            ],
            correctIndex: 2,
            explanation: 'The passage gives evidence for three clinics. It neither supports nor contradicts a country-wide claim, so the answer is Can\'t Tell.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "Rainfall in the region may have contributed to landslide frequency." Statement: "Rainfall caused the landslides."',
            options: [
              'True',
              'False',
              "Can't Tell",
            ],
            correctIndex: 2,
            explanation: '"May have contributed" is a soft claim. The statement turns it into a hard cause, which the passage does not support. Can\'t Tell.',
          },
          {
            kind: 'mini',
            prompt: 'You can confidently rule out True. Between False and Can\'t Tell, which heuristic helps?',
            options: [
              'Pick False, since you eliminated True.',
              'Pick Can\'t Tell, since it is always safest.',
              'Decide based on whether the passage actively contradicts the statement, or simply does not address it.',
            ],
            correctIndex: 2,
            explanation: 'Eliminating True does not automatically mean False. Ask whether the passage actually contradicts the statement (False) or simply does not settle it (Can\'t Tell).',
          },
          {
            kind: 'tip',
            title: "Why students underuse Can't Tell",
            body: "Students avoid Can't Tell because it feels like giving up. But the test deliberately includes statements the passage does not settle. If you almost never pick Can't Tell in practice, you are probably forcing True or False onto missing evidence.",
          },
        ],
      },
      {
        id: 'multiple-choice',
        title: 'Multiple Choice (4-option)',
        subtitle: "VR's second question type. You're given four answer options and must pick the one best supported by the passage — not the one that sounds most reasonable.",
        duration: '3 min',
        type: 'Question type',
        icon: 'filter',
        steps: [
          {
            title: 'What this question type looks like',
            body: 'You are shown a passage and then a question or incomplete sentence, followed by four answer options (A, B, C, D). You must pick the single best answer based only on what the passage says.',
            bullets: [
              'Common formats: "According to the passage...", "Which conclusion is most supported?", "The author most likely believes..."',
              'All four options are usually plausible — your job is to reject the wrong three for clear reasons.',
              'Unlike T/F/CT, there is no fixed set of answers. The options vary every time.',
            ],
          },
          {
            kind: 'rule',
            title: 'Example format',
            body: 'Passage: "The new train line cut journey times by 20% but led to a 15% rise in platform congestion."\nQuestion: "Which conclusion is best supported?"\nA) The train line was a complete success\nB) Journey times fell but congestion increased\nC) Platform congestion fell by 20%\nD) The train line was not worth building\nAnswer: B — directly stated. A, C, and D all go beyond or contradict the passage.',
          },
          {
            title: 'Why multiple choice is harder than it looks',
            body: 'In 4-option MCQ items, all four options often sound reasonable. The correct option is the one that fits the passage most exactly, not the one that sounds smartest. Your task is to reject the wrong ones for clear reasons.',
          },
          {
            title: 'Four quick distractor shapes',
            bullets: [
              'Too strong: the option overstates what the passage says.',
              'Too broad: the option goes wider than the passage scope.',
              'Partly true: the option matches one detail but flips another.',
              'Wrong location: the option attaches a fact to the wrong part of the passage.',
            ],
          },
          {
            title: 'The four teaching sub-types',
            body: 'Within 4-option MCQ, you will see direct detail (according to the passage), inference (most likely), author opinion, and negative stems (NOT/EXCEPT). These are tutoring labels, not separate UCAT formats. Recognising the sub-type tells you which reading discipline to apply; the later trap taxonomy gives more precise labels for wrong-answer patterns.',
          },
          {
            kind: 'trap',
            title: 'Sounds right is not enough',
            body: 'Distractors are written to be plausible. If you cannot point to the line that supports your choice, you are not yet ready to lock the answer.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A company delayed expansion because energy costs rose sharply." Which option is safest?',
            options: [
              'Costs affected expansion.',
              'Expansion was cancelled forever.',
              'Staff opposed expansion.',
              'The company had no profits.',
            ],
            correctIndex: 0,
            explanation: 'Only the first option is directly supported. The others overstate, invent, or assume detail the passage never gives.',
          },
          {
            kind: 'mini',
            prompt: 'Two answer options differ only in "some" vs "all". Which should you eliminate first and why?',
            options: [
              'The one with "some", because it is too weak.',
              'The one with "all", because it makes the stronger claim.',
              'Neither; they are equivalent.',
            ],
            correctIndex: 1,
            explanation: '"All" requires more evidence than "some". The stronger claim usually fails first because the passage rarely supports universal claims.',
          },
        ],
      },
      {
        id: 'detail-questions',
        title: 'Direct detail questions',
        subtitle: 'A sub-type of multiple choice: the answer is in the passage, you just have to find and read it precisely.',
        duration: '4 min',
        type: 'Question type',
        icon: 'search',
        steps: [
          {
            title: 'What this question type looks like',
            body: 'Direct detail questions sit inside the 4-option multiple choice format. The question stem — the wording before the answer options — usually says "According to the passage..." or gives you an incomplete sentence to finish. The answer is always explicitly stated in the passage; your job is to locate it and match it exactly, not interpret or infer.',
            bullets: [
              'Common question stems: "According to the passage...", "The passage states that...", "Complete the sentence: The trial ended..."',
              'The trap: four options that all look plausible, but only one is actually supported by the text word-for-word.',
              'The skill: finding the right line quickly, then reading it precisely enough to avoid the almost-right distractors.',
            ],
          },
          {
            title: 'Where to look first',
            body: 'Start with the distinctive words in the question, then scan for those anchors. Read the answer line and the surrounding lines, not just the matched keyword. One shared word is rarely enough.',
          },
          {
            title: 'How incomplete statements mislead',
            body: 'Incomplete statements often fail because students choose an ending that is plausible but not the best supported. Direct detail questions are won by precision, not deep interpretation.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Read the local lines, not just the matched keyword. Detail questions are precision tests, not broad interpretation tests.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A research vessel left on Monday, reached the reef on Thursday, and began sampling on Friday." Complete: "Sampling began after the vessel..."',
            options: [
              'left port.',
              'reached the reef.',
              'returned home.',
              'received its samples.',
            ],
            correctIndex: 1,
            explanation: 'The passage shows the order: leave Monday, reach Thursday, sample Friday. Sampling began after the vessel reached the reef. "Left port" is also true but less precise as the immediate prior event.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A museum reopened the east wing in 2018 after two years of structural repairs." According to the passage, the east wing reopened...',
            options: [
              'in 2016.',
              'in 2018, following two years of repairs.',
              'after a refurbishment that took longer than planned.',
              'shortly before the west wing opened.',
            ],
            correctIndex: 1,
            explanation: 'The passage gives the year and reason directly. The other options invent or twist details: 2016 reverses the date, "longer than planned" adds an unsupported claim, and the west wing is not mentioned.',
          },
          {
            kind: 'tip',
            title: 'Why one shared keyword is not enough',
            body: 'Test writers love to use the same keyword in two different sentences and put the answer to your question in only one of them. Always read the sentence before and after the keyword to confirm you are in the right place.',
          },
        ],
      },
      {
        id: 'inference',
        title: 'Inference questions',
        subtitle: 'Another multiple choice sub-type: the answer is implied by the passage, not directly stated — but it still has to be grounded in evidence.',
        duration: '5 min',
        type: 'Question type',
        icon: 'compass',
        steps: [
          {
            title: 'What this question type looks like',
            body: 'Inference questions sit inside the 4-option multiple choice format. Unlike direct detail, the answer is not copied from the passage — it is a conclusion the passage makes reasonable. The question wording usually signals this:',
            bullets: [
              'Common question stems: "Which conclusion is most justified?", "What is most likely true?", "Which inference is best supported?"',
              'The task: find the option that follows logically from the passage without going beyond it.',
              'The main trap: options that sound plausible or likely in the real world, but go further than what the passage actually supports.',
            ],
          },
          {
            title: 'What an inference is',
            body: 'An inference is not random imagination. It is the next conclusion the passage genuinely supports. The right answer is often implied rather than copied, but it is still anchored in evidence.',
          },
          {
            title: 'How inference becomes speculation',
            body: 'Extreme answers often fail because they outrun the text. If you cannot point to the evidence chain, your inference is probably too loose. Prefer moderate, evidence-linked conclusions over dramatic ones.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Trace the chain: clue → connection → conclusion. If you cannot show all three steps, your inference is probably one step too far.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "City-centre cycling rose after protected lanes were added, and short car trips fell slightly." What is most likely true?',
            options: [
              'Some commuters who would have driven short distances are now cycling.',
              'Protected lanes will eliminate car traffic.',
              'All cyclists used to drive cars.',
              'The city banned short car trips.',
            ],
            correctIndex: 0,
            explanation: 'A modest, evidence-linked conclusion. The other options outrun the passage with bans, eliminations, or universals the text does not support.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A historian praises the archive\'s scope but criticises its lack of regional records." Which conclusion is most likely about the archive?',
            options: [
              'It is useless to most researchers.',
              'It is the largest archive in Europe.',
              'It has clear strengths but also clear gaps.',
              'It will be expanded next year.',
            ],
            correctIndex: 2,
            explanation: 'Mixed praise and criticism in the passage points to a balanced conclusion. The other options are too extreme, invented, or unrelated.',
          },
          {
            kind: 'tip',
            title: 'How to spot an answer that is one step too far',
            body: 'Read your candidate option and ask: "Does the passage justify each part of this claim?" If you have to add a word like "always", "everyone", or "the only reason", you have probably overreached.',
          },
        ],
      },
      {
        id: 'author-opinion',
        title: 'Author opinion questions',
        subtitle: 'A multiple choice sub-type where you identify what the writer themselves believes — not what the passage reports others saying.',
        duration: '5 min',
        type: 'Question type',
        icon: 'person-cog',
        steps: [
          {
            title: 'What this question type looks like',
            body: 'Author opinion questions sit inside the 4-option multiple choice format. Instead of asking what the passage states, they ask what the author thinks, believes, or intends.',
            bullets: [
              'Common question stems: "Which view does the author most likely hold?", "What is the writer\'s overall stance?", "The author implies that..."',
              'The key distinction: the passage may quote other people\'s opinions at length — those are not the author\'s view unless the author endorses them.',
              'The main trap: picking the view of a quoted expert or critic instead of the author\'s own position.',
            ],
          },
          {
            title: 'Whose view is this?',
            body: "The author's view is built across the passage, not hidden in one random adjective. Reported opinions (quoted experts, summarised sources) are not automatically the author's opinion. Track who is making the claim.",
          },
          {
            title: 'Tone clues and evaluative language',
            bullets: [
              'Contrast words ("however", "yet", "although") often signal where the author pushes back.',
              'Repeated approval or criticism reveals stance.',
              'Adjectives like "welcome", "concerning", "promising", "limited" carry evaluation.',
            ],
          },
          {
            title: 'The final-paragraph-first technique',
            body: "For author or writer questions specifically, read the final paragraph first. Writers usually summarise their stance there. This saves you from inferring stance line-by-line through the whole passage.",
          },
          {
            kind: 'trap',
            title: 'Reported speech trap',
            body: 'A passage can quote a critic at length without agreeing with them. Always check whether the view is the author\'s own or attributed to someone else.',
          },
          {
            kind: 'mini',
            prompt: 'Passage summarises two policy proposals, then ends: "Option B is costly, reactive, and politically convenient rather than effective." Which view does the author hold?',
            options: [
              'The author supports Option B.',
              'The author is critical of Option B.',
              'The author has no view.',
              'The author supports neither option.',
            ],
            correctIndex: 1,
            explanation: 'The closing sentence is openly critical of Option B. The final paragraph reveals stance most directly.',
          },
          {
            kind: 'mini',
            prompt: 'Passage describes a new reporting policy as "welcome transparency" but with "poor implementation." What is the author\'s overall stance?',
            options: [
              'Wholly positive.',
              'Wholly negative.',
              'Approves of the goal but criticises the execution.',
              'Indifferent.',
            ],
            correctIndex: 2,
            explanation: 'The author praises one element ("welcome transparency") and criticises another ("poor implementation"). Neither extreme captures the mixed view.',
          },
        ],
      },
      {
        id: 'negative-stems',
        title: 'Negative stem questions (NOT / EXCEPT)',
        subtitle: 'A multiple choice variant where the task is reversed — you find the one option the passage does NOT support.',
        duration: '4 min',
        type: 'Question type',
        icon: 'flag',
        steps: [
          {
            title: 'What this question type looks like',
            body: 'Negative stem questions look like normal multiple choice, but the question stem contains a reversal word that flips your task. Instead of finding what the passage supports, you find what it does not.',
            bullets: [
              'Common question stems: "All of the following are mentioned EXCEPT...", "Which of the following is NOT supported?", "Which conclusion is least justified?"',
              'The format: three of the four options will be supported by the passage. One will not. You pick the unsupported one.',
              'The main trap: students solve the question correctly but answer the positive version — they pick the supported option because it feels right.',
            ],
          },
          {
            title: 'How reverse stems work',
            body: 'If the question stem contains "not", "except", or "least", your task has reversed. In many reverse stems, three options will be supported by the passage and one will fail. Your job is to find the failure.',
          },
          {
            title: 'Elimination order for EXCEPT questions',
            bullets: [
              'Quickly tick each option that the passage supports.',
              'The remaining option is your answer.',
              'Do not over-think it once three options are clearly supported.',
            ],
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Re-read the question stem once before you select. Reverse stems are accuracy tests disguised as reading tests.',
          },
          {
            kind: 'trap',
            title: 'Solved the passage, answered the wrong task',
            body: 'The most common failure on negative stems: students answer the positive version of the question. They find the supported option and pick it, even though the question asked which option is NOT supported.',
          },
          {
            kind: 'mini',
            prompt: 'Passage lists three causes of crop loss (drought, pests, soil depletion) and dismisses one failed theory (alien interference). Which is NOT supported by the passage?',
            options: [
              'Drought caused crop loss.',
              'Pests caused crop loss.',
              'Soil depletion caused crop loss.',
              'Alien interference caused crop loss.',
            ],
            correctIndex: 3,
            explanation: 'Three options are supported. Alien interference is dismissed as a failed theory, so it is the unsupported option, which is what the negative stem asks for.',
          },
          {
            kind: 'mini',
            prompt: 'Passage outlines four hospital changes: new ward, longer triage hours, electronic records, expanded pharmacy. The question asks: "All of the following occurred EXCEPT..." with one option being "outsourced cleaning". What do you do?',
            options: [
              'Pick whichever option sounds least familiar.',
              'Tick each option that the passage supports, and pick the one left over (outsourced cleaning).',
              'Pick the first option, since EXCEPT usually means option A.',
            ],
            correctIndex: 1,
            explanation: 'Tick the supported options and pick what is left. Outsourced cleaning is not in the passage, so it is the EXCEPT answer.',
          },
        ],
      },
      {
        id: 'rare-stems',
        title: 'Word reference and unusual question wording',
        subtitle: 'Some VR questions use wording you have not seen before — this lesson shows you how to recognise and reduce them to familiar types.',
        duration: '3 min',
        type: 'Question type',
        icon: 'book',
        steps: [
          {
            title: 'What these questions look like',
            body: 'Occasionally a VR question uses phrasing that does not match the standard formats. Do not let unfamiliar wording throw you — the underlying task is almost always something you already know how to do.',
            bullets: [
              '"What does \'this\' refer to?" — a word reference question. The answer is usually nearby, often in the previous sentence.',
              '"Which new fact would most weaken the argument?" — an inference question in disguise. Test the passage\'s logic.',
              '"What is the primary purpose of the passage?" — an author opinion question. Read the final paragraph first.',
            ],
          },
          {
            title: 'How to re-label rare wording',
            body: 'Rare wording usually hides a familiar job. Reduce it to a known type, then solve it. Do not freeze just because the wording looks unfamiliar.',
          },
          {
            title: 'Two rare wording patterns you will meet',
            bullets: [
              '"What does \'this\' refer to?" - a local reference question. Check the previous sentence for the antecedent.',
              '"Which new fact would matter most?" or "weaken the argument?" - usually an inference question in disguise. Test the passage\'s logic.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Passage: "Local traders opposed the new tax when it first applied only to large firms. This resistance grew after the tax was widened to smaller traders." What does "this resistance" refer to?',
            options: [
              'Local traders\' opposition to the new tax.',
              'Tax inspectors\' resistance.',
              'A general feeling of resistance to all taxes.',
              'Resistance to the smaller traders themselves.',
            ],
            correctIndex: 0,
            explanation: '"This resistance" points back to local traders opposing the new tax in the previous sentence.',
          },
          {
            kind: 'mini',
            prompt: 'Passage argues a new school policy improved attendance, citing one year of data. Which new piece of information would matter most?',
            options: [
              'The colour of the school uniform.',
              'Attendance data from comparable schools without the policy.',
              'The headteacher\'s name.',
              'The total number of teachers.',
            ],
            correctIndex: 1,
            explanation: 'A "what would weaken or test the claim?" question is really an inference question. A control comparison directly tests whether the policy is the cause of the improvement.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Build the speed habits and trap awareness that protect marks under time pressure.',
    icon: 'target',
    accentKey: 'amber',
    lessons: [
      {
        id: 'passage-reading',
        title: 'Passage reading approach',
        subtitle: 'How to read VR passages faster — specific techniques for skimming, chunking, and avoiding habits that slow you down.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'book',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'VR gives you 22 minutes for 44 questions across 11 passages. Reading speed is a real constraint. This lesson covers the specific habits — skimming, chunking, and suppressing inner voice — that let you extract meaning faster without missing detail that costs you marks.',
          },
          {
            title: 'The 10-second skim',
            body: 'Before you scan for keywords, glance at the first sentence of each paragraph plus the final paragraph. This gives you topic, structure, and stance in 8-10 seconds.',
          },
          {
            title: 'Chunking - read in groups, not words',
            body: 'Read in chunks of 2-4 words at a time. Train your eye to take in groups of words rather than fixating on each individual word. This is the single biggest reading-speed gain available.',
          },
          {
            title: 'Suppressing subvocalisation',
            body: 'Subvocalisation is the inner voice that "speaks" each word as you read. It caps your reading speed at speech speed, which is too slow for VR. With practice, you can read faster than you can speak by switching off the inner voice on initial scans.',
          },
          {
            title: 'Stopping regressions',
            body: 'Regressions are the habit of jumping back to re-read what you have already read. If you finish a sentence and want to go back, it is usually better to keep reading and let context fill the gap. Only regress when a question specifically prompts you back.',
          },
          {
            title: 'Activating background context without contaminating answers',
            body: 'For unfamiliar topics, take one second to ask "what kind of passage is this?" (history, science, opinion). This activates useful background context and speeds processing. But do not let your prior knowledge answer the question for you.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Skim → scan → read locally. Save word-by-word reading for the exact local lines that decide the answer.',
          },
          {
            kind: 'mini',
            prompt: 'You are about to read a 4-paragraph passage on a topic you have never seen before. What is the best first move?',
            options: [
              'Read every word from start to finish.',
              'Glance at the first sentence of each paragraph plus the final paragraph.',
              'Skip to the questions and read no passage at all.',
            ],
            correctIndex: 1,
            explanation: 'The 10-second skim gives you topic, structure, and stance before you spend time on any single sentence. Reading every word is too slow; skipping the passage entirely loses orientation.',
          },
          {
            kind: 'mini',
            prompt: 'You catch yourself jumping back to re-read a sentence you already finished. What should you do?',
            options: [
              'Always go back - re-reading improves comprehension.',
              'Keep reading. Context usually fills the gap by the next sentence.',
              'Stop and start the paragraph again.',
            ],
            correctIndex: 1,
            explanation: 'Regressions cost time and rarely add comprehension. Trust forward momentum on initial passes; only return when a specific question sends you back.',
          },
          {
            kind: 'tip',
            title: 'Why your reading speed in school is not your reading speed for UCAT',
            body: 'School reading rewards depth and reflection. UCAT reading rewards speed plus precision on a small region. They are different skills. Practising on outside reading (BBC, Economist, New Scientist) trains the right habits before test day.',
          },
        ],
      },
      {
        id: 'passage-genres',
        title: 'Reading any passage: language features to watch for',
        subtitle: 'UCAT passages cover any topic — your approach stays the same. What changes is which surface features to stay alert to.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'list',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'UCAT VR passages can be about anything — science, history, politics, culture. No reputable prep source recommends switching strategy based on topic, and doing so risks activating background knowledge that misleads your answers. Your keyword-scan approach stays identical regardless of topic. What this lesson teaches is the language features that appear in any passage and carry the most trap potential.',
          },
          {
            kind: 'rule',
            title: 'The core rule',
            body: 'Your strategy does not change with the topic. The passage is always your only source of truth — whether it is about Tudor history or a clinical trial.',
          },
          {
            title: 'Feature 1: proper nouns and numbers',
            body: 'Names, dates, places, and percentages are your strongest scan anchors in any passage. They are distinctive, appear rarely, and usually mark the exact sentence the question is testing. When you spot one in the question wording, use it immediately as your anchor.',
          },
          {
            title: 'Feature 2: causation language',
            body: 'Watch for words like "caused", "led to", "resulted in", "due to". A passage may describe two things happening together without proving one caused the other. Options that upgrade a correlation into a cause are one of the most common traps across all passage topics.',
            bullets: [
              'Passage says: "Sleep length was associated with recovery speed."',
              'Trap option says: "Sleep directly causes faster recovery."',
              'The word "associated" is doing critical work — do not let an option replace it with "causes".',
            ],
          },
          {
            title: 'Feature 3: qualifier and hedging language',
            body: 'Words like "may", "could", "some", "often", "suggests" soften what the passage claims. Wrong options frequently strip these out and replace them with stronger words like "will", "all", "proves". The passage\'s strength and the option\'s strength must match.',
          },
          {
            title: 'Feature 4: contrast words',
            body: '"However", "yet", "although", "despite", "while" signal that the passage is about to push back or introduce a complication. These words often mark the author\'s actual position — the evaluative claim that comes after the contrast is usually the writer\'s own view.',
          },
          {
            title: 'Feature 5: reported speech',
            body: 'Any passage can quote someone else\'s opinion. That quoted view is not the author\'s view unless the author endorses it. Watch for attribution phrases like "according to", "critics argue", "Dr Hayes stated" — these introduce someone else\'s claim, not the writer\'s.',
          },
          {
            kind: 'trap',
            title: 'The background knowledge trap',
            body: 'Passages on familiar topics are the most dangerous. The moment you recognise a topic — a medical study, a historical event — your brain starts filling in gaps from memory. UCAT deliberately includes options that are true in the real world but not supported by the passage. Always answer from the text, not your knowledge.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A study found that regions with more cycling infrastructure saw lower rates of obesity. Researchers noted that income levels were not controlled for." An option states: "Cycling infrastructure causes lower obesity rates." Why is this wrong?',
            options: [
              'It is wrong because the study only covered one region.',
              'It is wrong because the passage shows a correlation but does not prove causation, and researchers flagged an uncontrolled variable.',
              'It is wrong because obesity rates were not mentioned.',
            ],
            correctIndex: 1,
            explanation: 'The passage describes a relationship between two things and explicitly flags a confounder. "Causes" upgrades correlation to causation — the classic trap. This applies in any passage on any topic.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "Critics have called the scheme wasteful. The author notes, however, that early results are encouraging." What is the author\'s view?',
            options: [
              'The scheme is wasteful.',
              'The scheme shows early promise.',
              'The author has no view.',
              'The author agrees with the critics.',
            ],
            correctIndex: 1,
            explanation: '"However" signals a contrast. The author\'s own evaluative claim comes after it — "early results are encouraging". The critics\' view is reported speech, not the author\'s position.',
          },
        ],
      },
      {
        id: 'keyword-scanning',
        title: 'Keyword scanning and paragraph anchors',
        subtitle: 'How to locate the right sentence in a passage quickly — without reading every word first.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'search',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Once you have read a question, you need to find the relevant part of the passage without re-reading the whole thing. This lesson teaches keyword scanning — choosing the right anchor word from the question and using it to jump directly to the correct line.',
          },
          {
            title: 'Strong vs weak keywords',
            bullets: [
              'Strong: dates, names, unusual nouns, contrast terms, technical phrases.',
              'Weak: common verbs ("is", "has"), articles ("the", "a"), generic nouns.',
              'Strong keywords appear once or twice. Weak ones appear everywhere.',
            ],
          },
          {
            title: 'How to use a second anchor',
            body: 'If your first keyword appears many times in the passage, pick a second anchor from the question to narrow the search. The intersection of two anchors usually points to a single sentence.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Scan first for location, then read locally. Scanning is for finding; close reading is for deciding.',
          },
          {
            kind: 'mini',
            prompt: 'In a question about a transport report, which is the strongest first scan anchor?',
            options: [
              '"report"',
              '"city"',
              '"tram"',
              '"2019 commuter subsidy"',
            ],
            correctIndex: 3,
            explanation: '"2019 commuter subsidy" is highly distinctive and almost certainly appears in only one place. The other options would appear repeatedly throughout a transport passage.',
          },
          {
            kind: 'mini',
            prompt: 'Your first keyword "trial" appears five times in the passage. The question also mentions "Phase 2" and "blood pressure". What is the best second anchor?',
            options: [
              '"Phase 2", because it is more specific than the others.',
              '"Trial" again - just re-scan more carefully.',
              'Pick any of the four options at random.',
            ],
            correctIndex: 0,
            explanation: '"Phase 2" is highly distinctive and will narrow the five occurrences of "trial" to one. The intersection of two anchors usually pinpoints the right sentence.',
          },
          {
            kind: 'tip',
            title: 'Why verbs like "is" and "has" waste time',
            body: 'These appear in nearly every sentence, so they give you no signal about location. Train yourself to skip past them and lock onto distinctive nouns instead.',
          },
        ],
      },
      {
        id: 'reading-precisely',
        title: 'Reading precisely: paraphrase, quantity, qualifiers',
        subtitle: 'Many wrong answers differ from the right one by a single word — this lesson trains you to catch those differences.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Once you have found the right part of the passage, the battle is not over. Test writers build distractors that match on the idea but shift on one small word — "some" becomes "all", "may" becomes "will". This lesson trains you to compare wording precisely so those small differences stop costing you marks.',
          },
          {
            title: 'Paraphrase vs distortion',
            body: 'A correct paraphrase keeps the meaning; a distortion shifts the strength of the claim. Many wrong answers borrow the passage\'s idea but change one small word.',
          },
          {
            title: 'Quantity words',
            body: '"Some" does not mean "most". "Many" does not mean "all". Quantity words decide whether an option is right or wrong, even when everything else looks fine.',
          },
          {
            title: 'Qualifier words',
            body: '"May", "could", "often", "likely" all soften a claim. "Will", "must", "always" all harden it. Match the strength of the option to the strength in the passage.',
          },
          {
            title: 'Definitive vs mitigating language',
            bullets: [
              'Definitive: always, never, all, only, no one - the passage rarely supports these.',
              'Mitigating: may, could, often, some - lower bar, more likely to survive.',
              'When two options are close, compare the smallest words first.',
            ],
          },
          {
            kind: 'trap',
            title: 'Shared idea, wrong strength',
            body: 'The trap option captures the same general idea as the passage but exaggerates or softens it. The shared idea makes it feel safe; the strength shift makes it wrong.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "Some districts saw moderate gains after the reform." Which option is best supported?',
            options: [
              'All districts gained from the reform.',
              'Most districts gained from the reform.',
              'Some districts gained from the reform.',
              'No districts gained from the reform.',
            ],
            correctIndex: 2,
            explanation: 'Match the strength exactly. "Some" is what the passage says; "all" and "most" overshoot, and "no" contradicts.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A committee may consider extending the trial." Which option is closest?',
            options: [
              'The committee will extend the trial.',
              'The committee is considering extending the trial.',
              'The committee may consider extending the trial.',
              'The committee has rejected extending the trial.',
            ],
            correctIndex: 2,
            explanation: 'Only the third option preserves "may consider", which is doubly soft. The others firm it up into action or contradict it.',
          },
          {
            kind: 'mini',
            prompt: 'Two T/F/CT statements differ only in "always" vs "often". Which is more likely to be False?',
            options: [
              'The "often" version, because it is too vague.',
              'The "always" version, because the passage rarely supports universals.',
              'Both equally likely.',
            ],
            correctIndex: 1,
            explanation: 'Definitive language ("always") raises the evidence bar. The passage almost never justifies it. Use this as a tiebreaker when guessing.',
          },
        ],
      },
      {
        id: 'outside-knowledge',
        title: 'Outside knowledge and hidden assumptions',
        subtitle: 'One of the most common reasons students drop marks — using what they know instead of what the passage says.',
        duration: '3 min',
        type: 'Strategy',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'In VR your only source of truth is the passage. But your brain automatically fills in gaps using real-world knowledge — and UCAT questions are designed to exploit this. This lesson helps you recognise when you are answering from memory rather than from the text, and how to stop it.',
          },
          {
            title: 'How outside knowledge sneaks in',
            body: 'An answer can be true in the real world and still be wrong in VR. The most dangerous outside-knowledge errors are the ones that feel obvious - because the obviousness comes from what you already know, not from the text.',
          },
          {
            title: 'Hidden assumptions in close options',
            body: 'An answer can require an unstated assumption to work, even a small one. That is enough to disqualify it. If the option only makes sense once you add a missing premise, it is not supported.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'If you cannot point to the line, you do not have the answer. Run a 2-second self-check before you submit.',
          },
          {
            kind: 'trap',
            title: 'It feels right because of what I already know',
            body: 'Familiar topics are dangerous. Your brain auto-fills gaps using prior knowledge, and the test deliberately includes options that match real-world facts but not the passage.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A vaccine trial involved adults aged 40-65." Statement: "The treatment is proven safe for teenagers."',
            options: [
              'True',
              'False',
              "Can't Tell",
            ],
            correctIndex: 2,
            explanation: 'The passage covers only adults 40-65. Teenagers are outside the scope. The passage does not support or contradict the claim, so it is Can\'t Tell - even if real-world knowledge suggests vaccines are usually tested across age groups.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A regional train service was suspended after flooding." Statement: "Road travel definitely increased."',
            options: [
              'True',
              'False',
              "Can't Tell",
            ],
            correctIndex: 2,
            explanation: 'It feels obvious that road travel would increase, but that is outside knowledge. The passage says nothing about road travel, so the answer is Can\'t Tell.',
          },
        ],
      },
      {
        id: 'trap-taxonomy',
        title: 'The VR trap taxonomy',
        subtitle: 'A detailed set of nine wrong-answer patterns. Learn to name them and you can train against them systematically.',
        duration: '5 min',
        type: 'Traps',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'VR distractors are not random — they follow predictable patterns. This lesson gives you a named taxonomy of nine common trap types that appear across VR question formats. These labels describe wrong-answer patterns; the later review lesson uses separate error labels to describe why you personally missed a question.',
          },
          {
            title: 'Why naming traps matters',
            body: 'If you can label why a missed question fooled you, you can train against the pattern. Without labels, you only learn one item at a time. With labels, you learn an entire family.',
          },
          {
            title: 'The nine categories',
            bullets: [
              'Dispersion: relevant evidence is scattered across paragraphs; one location alone misleads.',
              'Juxtaposition: two ideas placed near each other look causally connected when they are not.',
              'Causation vs correlation: the passage describes a relationship; the option asserts a cause.',
              'Synonym/paraphrase: different words for the same idea, sometimes correct, sometimes a strength twist.',
              'Almost-right: matches on most details but flips one small word.',
              'Outside knowledge: true in the real world but not in this passage.',
              'Definitive vs mitigating: extreme language ("always", "all") that the passage does not justify.',
              'Scope/date-range mismatch: option range is wider or narrower than the passage range.',
              'Number swap: uses a number from the passage in a different context.',
            ],
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'If you can name the trap, you can train against it. When reviewing a miss, tag the tempting wrong option with one of these trap labels when it fits.',
          },
          {
            kind: 'mini',
            prompt: 'Passage describes a study finding a correlation between sleep length and recovery speed. An option claims sleep directly causes faster recovery. Which trap is this?',
            options: [
              'Outside knowledge',
              'Causation vs correlation',
              'Dispersion',
              'Number swap',
            ],
            correctIndex: 1,
            explanation: 'A correlation in the passage being upgraded to a direct cause in the option is the textbook causation/correlation trap.',
          },
          {
            kind: 'mini',
            prompt: 'Passage says a programme operated in three counties between 2018 and 2020. An option claims it operated nationally. Which trap?',
            options: [
              'Almost-right',
              'Scope/date-range mismatch',
              'Synonym/paraphrase',
              'Juxtaposition',
            ],
            correctIndex: 1,
            explanation: 'The option widens "three counties" to "nationally" - a clear scope mismatch.',
          },
          {
            kind: 'mini',
            prompt: 'Passage states "65% of respondents agreed". An option says "75% agreed". Which trap?',
            options: [
              'Number swap',
              'Outside knowledge',
              'Definitive vs mitigating',
              'Dispersion',
            ],
            correctIndex: 0,
            explanation: 'Same kind of fact (a percentage), wrong value. Number swap is the dedicated label for this very common trap.',
          },
        ],
      },
      {
        id: 'timing-strategy',
        title: 'Timing, guessing, flagging, and triage',
        subtitle: 'How to manage the clock across all 11 passages — including when to cut your losses and move on.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'timer',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'VR is tight on time. Many students lose marks not from getting questions wrong, but from spending too long on hard questions and running out of time on easy ones. This lesson teaches you when to guess, when to flag, and when to triage an entire passage to protect your overall score.',
          },
          {
            title: 'Decision thresholds',
            body: 'Timing is part of the skill, not an optional extra. If a question is taking too long, you need a decision rule, not hope. Set a personal threshold (e.g. 45 seconds on a hard item) and stick to it.',
          },
          {
            title: 'When to guess on a single question',
            body: 'Best-guessing after elimination is often the right move in VR. There is no negative marking, so a flagged guess is strictly better than leaving it blank.',
          },
          {
            title: 'How to use flag and review',
            body: 'Flagging only helps if it protects time. It is not a substitute for deciding. Pick your best current answer, flag, and move on. If you have time at the end, review flagged items.',
          },
          {
            title: 'Passage-level triage',
            body: 'If a passage is unusually long, dense, or off-topic, top scorers sometimes guess all 4 questions on it (with a flag) and reclaim the time for the other 10 passages. This is a strategic move, not failure.',
          },
          {
            title: 'Your time-contingency plan',
            body: 'Decide before the test what you will do if you are 4 minutes behind. A pre-rehearsed rule beats panic. Example: "If I am at passage 5 with under 10 minutes left, I triage one passage."',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Accuracy first, then pace, then completion. Your goal is to protect easy and medium marks across the whole section, not save every hard question.',
          },
          {
            kind: 'mini',
            prompt: 'You are 34 seconds into a question and split between two options after eliminating two. What is the best move?',
            options: [
              'Keep going - you are close.',
              'Pick one of the two surviving options, flag, and move on.',
              'Skip without picking anything.',
            ],
            correctIndex: 1,
            explanation: 'After eliminating two options, you have a 50/50. Spending more time rarely improves the odds. Best-guess and flag protects your time budget.',
          },
          {
            kind: 'mini',
            prompt: 'You are on passage 5 of 11. The passage is unusually dense, and you are already 90 seconds over budget. What is the right move?',
            options: [
              'Push harder - you cannot afford to skip a passage.',
              'Triage: best-guess all 4 questions on this passage (with flags) and bank the time for the next 6 passages.',
              'Skip the next passage instead, since this one is already underway.',
            ],
            correctIndex: 1,
            explanation: 'Passage-level triage protects your performance on the rest of the section. Sinking another 4 minutes into a dense passage usually costs more than it saves.',
          },
          {
            kind: 'mini',
            prompt: 'You flagged three items earlier. With 45 seconds left, you also have one unseen item. What do you do first?',
            options: [
              'Revisit the first flagged question.',
              'Answer the unseen item, even with a guess.',
              'Try to revisit all three flags quickly.',
            ],
            correctIndex: 1,
            explanation: 'No negative marking means a blank is always worse than a guess. Lock in an answer on the unseen item before anything else, then return to flags if time permits.',
          },
          {
            kind: 'checklist',
            title: 'My default timing rules',
            items: [
              'Best-guess any question that crosses my decision threshold.',
              'Flag and move on, do not stare.',
              'Never leave a question blank - no negative marking.',
              'Triage a whole passage if it threatens the rest of the section.',
              'Have a pre-rehearsed plan for being 4 minutes behind.',
            ],
          },
        ],
      },
      {
        id: 'eliminating-distractors',
        title: 'Eliminating distractors and comparing close options',
        subtitle: 'When two options both look correct, this is how you break the tie — by attacking wrong answers rather than defending right ones.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'flame',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'In VR, the right answer is often found by eliminating the wrong three rather than spotting the correct one immediately. This lesson teaches you the four shapes wrong answers take, and how to reject each one with a clear reason rather than gut instinct.',
          },
          {
            title: 'The four common distractor shapes',
            bullets: [
              'Too strong: overstates what the passage supports.',
              'Too broad: extends beyond passage scope.',
              'Partly true: matches one detail, twists another.',
              'Wrong location: attaches a fact to the wrong part of the passage.',
            ],
          },
          {
            title: 'The option audit',
            body: 'If you do not know why an option is wrong, it can come back and tempt you later. Strong students do not just find right answers - they reject wrong ones for clear reasons. Test each option against the exact wording.',
          },
          {
            title: 'Linking back to the trap taxonomy',
            body: 'Every distractor you reject can be labelled with one of the nine trap categories. Naming the trap on each rejection turns a single question into a learning rep.',
          },
          {
            kind: 'trap',
            title: 'Partly true is still wrong',
            body: 'A common failure mode: the option matches on the noun but flips the adjective, or matches the year but changes the place. Partly true distractors feel safe but should be rejected like any other wrong option.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A housing policy lowered rents in newly built units but did not affect older properties." Two options: (A) "The policy lowered rents in some units." (B) "The policy lowered rents across all properties." Which should you eliminate first and why?',
            options: [
              '(A), because it is too vague.',
              '(B), because "all properties" overgeneralises beyond what the passage supports.',
              'Neither - both are equally good.',
            ],
            correctIndex: 1,
            explanation: '(B) overshoots. The passage explicitly excludes older properties. (A) correctly limits the claim to "some units", which the passage supports.',
          },
          {
            kind: 'mini',
            prompt: 'Passage: "A study found a correlation between sleep length and recovery speed." Compare option (A) "Sleep length was correlated with recovery speed" with (B) "Sleep length directly caused faster recovery". Which is the trap, and what is its name?',
            options: [
              '(A) is the trap - synonym/paraphrase.',
              '(B) is the trap - causation vs correlation.',
              'Both are equally supported.',
            ],
            correctIndex: 1,
            explanation: '(A) preserves the relationship type. (B) upgrades correlation to causation - the textbook trap. Naming it ("causation vs correlation") makes it easier to spot next time.',
          },
        ],
      },
      {
        id: 'review-routine',
        title: 'Review routine and error log',
        subtitle: 'How to get better from practice — tagging your mistakes by type so you can train the right weaknesses, not just repeat questions.',
        duration: '3 min',
        type: 'Strategy',
        icon: 'notes',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Doing practice questions is only half the work. This lesson teaches you how to review them: tagging each mistake with a specific error label so you can see patterns over time and target the weaknesses that are actually costing you marks.',
          },
          {
            title: 'Why "wrong" is not a useful diagnosis',
            body: '"I got it wrong" tells you nothing. "I got it wrong because I assumed outside knowledge" tells you what to train. Always tag the reason, not just the outcome.',
          },
          {
            title: 'The nine review labels',
            body: 'These labels describe why you missed a question. They overlap with the trap taxonomy, but they are for your personal error log rather than for classifying every wrong answer.',
          },
          {
            title: 'The labels',
            bullets: [
              'Time pressure - rushed and missed something.',
              'Bad scanning - did not find the right region.',
              'Wording error - misread quantity, qualifier, or scope.',
              'Assumption / outside knowledge.',
              'Distractor failure - picked a tempting wrong option.',
              'Misread negative stem.',
              'Scope mismatch.',
              'Causation/correlation conflation.',
              'Anxiety-induced error - tag separately to track over time.',
            ],
          },
          {
            title: 'How to log a miss in one line',
            body: 'Q12 wrong - distractor failure (causation/correlation). One line is enough. Patterns emerge after 20 logs, not after one.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'Review should be short, honest, and specific. If you can label the miss, you can train the weakness.',
          },
          {
            kind: 'mini',
            prompt: 'A student chose an option because it "looked familiar" but the passage did not state it. Which error label fits best?',
            options: [
              'Time pressure',
              'Assumption / outside knowledge',
              'Bad scanning',
              'Anxiety-induced error',
            ],
            correctIndex: 1,
            explanation: '"Looked familiar" almost always means prior knowledge filled in for missing passage support. Outside-knowledge is the right label, and the matching lesson is "Outside knowledge and hidden assumptions".',
          },
          {
            kind: 'mini',
            prompt: 'A student found the right paragraph but missed the word "only" and picked the wrong option. Which label fits?',
            options: [
              'Bad scanning',
              'Wording error',
              'Time pressure',
              'Causation/correlation conflation',
            ],
            correctIndex: 1,
            explanation: 'They reached the right region but misread a qualifier. That is a wording error. Follow up with the "Reading precisely" lesson.',
          },
          {
            kind: 'mini',
            prompt: 'A student answered the positive version of an EXCEPT question and missed the mark. Which label fits?',
            options: [
              'Distractor failure',
              'Misread negative stem',
              'Outside knowledge',
              'Anxiety-induced error',
            ],
            correctIndex: 1,
            explanation: 'They solved the passage correctly but answered the wrong task. That is the dedicated "misread negative stem" label.',
          },
          {
            kind: 'checklist',
            title: 'My review routine after practice',
            items: [
              'Tag every miss with one review label.',
              'Log it in one line, no essays.',
              'Look for repeating labels across 20+ items.',
              'Open the matching lesson when one label dominates.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'See the VR method applied to a real passage and question. Read, answer, then study the breakdown.',
    icon: 'notes',
    accentKey: 'mint',
    lessons: [
      {
        id: 'tfct-example-supported',
        title: 'T/F/CT worked example 1',
        subtitle: 'A True / False / Can’t Tell statement to evaluate using passage evidence alone.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'check',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'True / False / Can’t Tell',
            body: 'Read the passage and decide whether the statement is supported, contradicted, or not settled by the text. Commit to your answer first — the breakdown afterwards walks through the full method.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'tfct-example-contradiction',
        title: 'T/F/CT worked example 2',
        subtitle: 'Another True / False / Can’t Tell statement to evaluate against the passage.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'flag',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'True / False / Can’t Tell',
            body: 'Read the passage and decide whether the statement is supported, contradicted, or not settled by the text. Pay close attention to whether the passage actively addresses the statement’s topic. The breakdown follows once you commit.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'tfct-example-cant-tell',
        title: 'T/F/CT worked example 3',
        subtitle: 'A True / False / Can’t Tell statement to evaluate carefully against the passage.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'shield-heart',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'True / False / Can’t Tell',
            body: 'Read the passage and decide whether the statement is supported, contradicted, or not settled by the text. Watch the scope of the statement against what the passage actually covers. The breakdown follows your answer.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'detail-example',
        title: 'Direct detail worked example',
        subtitle: 'Locate a specific fact inside a passage that contains several similar-looking values.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'search',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: direct detail',
            body: 'A fact-finding question. Read the question stem carefully, anchor on the most distinctive word, and pick the option the passage supports exactly. Commit to an answer first; the audit follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'detail-paraphrase-example',
        title: 'Detail with paraphrase worked example',
        subtitle: 'Several options describe the same idea in different words. Pick the one that matches the passage faithfully.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: detail with paraphrase',
            body: 'Read the passage, then choose the option that best restates what it actually says. Compare options closely against the passage’s wording. The breakdown comes after you commit.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'inference-example',
        title: 'Inference worked example',
        subtitle: 'Pick the conclusion the passage best supports.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'compass',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: inference',
            body: 'Read the passage and decide which option is most justified by the evidence. Try to trace the reasoning chain in the passage before you answer. The breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'inference-causation-example',
        title: 'Inference from study data worked example',
        subtitle: 'A passage describes a study with mixed evidence. Pick the conclusion the passage best supports.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'flame',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: inference from study data',
            body: 'Read the passage and choose the option most consistent with the evidence and the language the authors actually use. Pay attention to how strongly each option phrases the relationship. The breakdown follows your answer.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'author-example-stance',
        title: 'Author opinion worked example 1',
        subtitle: 'Identify the view the author of the passage holds.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'person-cog',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: author’s opinion',
            body: 'Read the passage and decide which option best captures the author’s own view. Look closely at evaluative language and where it sits in the passage. The breakdown follows once you commit.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'author-example-reported-speech',
        title: 'Author opinion worked example 2',
        subtitle: 'A passage with multiple voices. Identify the view the author actually holds.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'notes',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: author’s opinion with quoted voices',
            body: 'Read the passage and decide which option best captures the author’s own view. Track who is making each claim — not every voice in a passage is the author’s. The breakdown follows your answer.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'negative-stem-example',
        title: 'EXCEPT / negative stem worked example',
        subtitle: 'A question that asks which option is NOT supported by the passage.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'flag',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: EXCEPT / negative stem',
            body: 'The question stem reverses the task — you are looking for the option the passage does not support. Read it carefully before scanning. The breakdown follows your answer.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'mixed-trap-example',
        title: 'Detail with multiple figures worked example',
        subtitle: 'A passage with several numbers tied to different scopes. Match the value the question actually asks for.',
        duration: '3 min',
        type: 'Worked example',
        icon: 'list',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Multiple choice: detail with multiple figures',
            body: 'A fact-finding question where every option corresponds to a real number in the passage. Make sure your choice matches the value, the location, and the time period the question is asking about. The breakdown follows.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
    ],
  },
  {
    id: 'optional',
    title: 'Optional Add-ons',
    description: 'Targeted support for specific situations. Take it or skip it.',
    icon: 'shield-heart',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'esl-vocabulary',
        title: 'ESL and vocabulary strategies',
        subtitle: 'If English is not your first language.',
        duration: '3 min',
        type: 'Optional',
        icon: 'book',
        steps: [
          {
            title: 'Why time pressure hits L2 readers harder',
            body: 'If English is not your first language, you are not at a permanent disadvantage. But under time pressure, the metacognitive strategies L2 readers normally use to compensate for slower word recognition are harder to deploy. UCAT VR is exactly that high-pressure scenario.',
          },
          {
            title: 'Building lexical coverage',
            body: 'Comfortable comprehension typically requires recognising about 98% of running words in a text. Build vocabulary in the topic areas UCAT favours: science, history, current affairs, and social-policy debates.',
          },
          {
            title: 'Synonym anticipation',
            body: 'When you see a keyword in the question, train yourself to anticipate two or three synonyms the passage might use. UCAT distractors often hinge on synonym/paraphrase recognition. "Diminished" might appear as "reduced", "lessened", or "decreased".',
          },
          {
            title: 'How to structure your practice differently',
            body: 'L2 readers benefit from heavier untimed reading (The Economist, BBC News long-reads, New Scientist) before timed practice. Build comprehension speed first, then add the clock.',
          },
          {
            kind: 'rule',
            title: 'Rule',
            body: 'UCAT VR rewards careful reading more than fast reading. L2 readers who build strong comprehension habits often do well even at moderate speed.',
          },
          {
            kind: 'mini',
            prompt: 'Stem keyword: "diminished". Which set of synonyms is the passage most likely to use?',
            options: [
              '"reduced", "lessened", "decreased"',
              '"increased", "expanded", "grew"',
              '"unchanged", "stable", "fixed"',
            ],
            correctIndex: 0,
            explanation: 'Synonym anticipation is the L2 reader\'s biggest compensation tool. Training yourself to brainstorm 2-3 synonyms per keyword turns a slower lookup into a fast match.',
          },
          {
            kind: 'mini',
            prompt: 'You read a 4-line scientific passage and notice three words you were not sure about. What should you do?',
            options: [
              'Give up on scientific passages.',
              'Note the words, look them up afterwards, and add them to your vocabulary practice.',
              'Skip every passage that uses unfamiliar terms.',
            ],
            correctIndex: 1,
            explanation: 'Lexical coverage builds gradually. Logging unfamiliar words during practice and reviewing them later raises your coverage in the topic areas UCAT favours.',
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
export const ESTIMATED_TIME = '85 min';

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
  const accent = colors[UCAT_SECTIONS.VR.accentKey] ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon={UCAT_SECTIONS.VR.icon} accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{UCAT_SECTIONS.VR.title.toUpperCase()}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Verbal Reasoning lessons.</Text>
        </View>
      </View>

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
        label={allComplete ? 'Start VR Practice' : nextLesson ? `Continue: ${nextLesson.title}` : 'Continue Learning'}
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
  return (
    <View
      style={[
        styles.practiceCard,
        {
          backgroundColor: isDark ? 'rgba(10, 29, 55, 0.86)' : 'rgba(255, 255, 255, 0.86)',
          borderColor: hexToRgba(allComplete ? colors.mint : colors.blue, 0.44),
        },
      ]}
    >
      <View style={[styles.practiceIcon, { backgroundColor: hexToRgba(allComplete ? colors.mint : colors.blue, 0.12), borderColor: hexToRgba(allComplete ? colors.mint : colors.blue, 0.32) }]}>
        <PremiumIcon name={allComplete ? 'check' : 'target'} size={24} color={allComplete ? colors.mint : colors.blue} strokeWidth={2.4} />
      </View>
      <View style={styles.practiceCopy}>
        <Text style={[styles.practiceTitle, { color: colors.text }]}>
          {allComplete ? 'VR Learning Complete' : 'Ready to apply it?'}
        </Text>
        <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
          {allComplete
            ? 'You have finished the VR learning pathway.'
            : 'Open untimed VR practice when you want to turn a lesson into repetition.'}
        </Text>
        <View style={styles.practiceButtons}>
          <PrimaryButton label="Start VR Practice" icon="pencil" color={colors.blue} onPress={onPractice} style={styles.practiceButton} />
          <PrimaryButton label="Start Timed VR Test" icon="timer" color={colors.cyan} variant="outline" onPress={onTimed} style={styles.practiceButton} />
        </View>
      </View>
    </View>
  );
}

export default function VerbalReasoningLearnScreen({ navigation }) {
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
      'Reset VR progress?',
      'This will clear all your completed lessons in Verbal Reasoning. This cannot be undone.',
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
    navigation.navigate('VRQuestionList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'VR', title: 'Verbal Reasoning' });
  }, [navigation]);

  const openLesson = useCallback((lessonId) => {
    const lesson = ALL_LESSONS.find((l) => l.id === lessonId);
    if (!lesson) return;
    const alreadyCompleted = completedIds.includes(lessonId);
    const isLocked = !alreadyCompleted && lesson.number > nextLesson.number;
    if (isLocked) return;
    if (!isPro && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('LearnVRLesson', { lessonId });
  }, [isPro, navigation, completedIds, nextLesson]);

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
      <AppHeader navigation={navigation} title="Learn VR" />

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
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Your VR Path</Text>
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
                accessibilityLabel="Reset VR progress"
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
