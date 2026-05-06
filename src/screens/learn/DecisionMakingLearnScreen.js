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
import { DM_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const PREMIUM_LESSON_TYPES = new Set(['Strategy', 'Traps', 'Worked example']);

export const STORAGE_KEY = DM_LEARN_STORAGE_KEY;

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'A short orientation: what DM is, how the section is scored, and how to use this app.',
    icon: 'book',
    accentKey: 'teal',
    lessons: [
      {
        id: 'what-dm-tests',
        title: 'What DM is testing',
        subtitle: 'A short tour of Decision Making and the six question families that make up the section.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Decision Making is not about specialist knowledge. It is about disciplined thinking under time pressure — reading carefully, organising fast, and only drawing the conclusions the information actually allows.',
          },
          {
            title: 'The official UCAT line',
            body: '"Decision Making assesses your ability to apply logic to reach a decision or conclusion, evaluate arguments and analyse statistical information. Knowledge of specific mathematical or logical reasoning terminology is not required."',
          },
          {
            kind: 'rule',
            title: 'Stick to the information given',
            body: 'Even if the statements sound unrealistic, treat them as true for that question. Real-world knowledge does not override the stated information.',
          },
          {
            title: 'The six question families',
            body: 'Every DM question is one of six types. You will learn each one in detail in Module 4 — here is a one-line preview so you can recognise them on sight.',
            bullets: [
              'Syllogisms — premises plus conclusions; pick Yes or No for each.',
              'Logic puzzles — ordering, grouping, scheduling, or matching with constraints.',
              'Interpreting information — tables, charts, graphs, or rule sets followed by Yes/No statements.',
              'Venn diagrams — choose the diagram that matches the statements, or calculate region totals.',
              'Probabilistic reasoning — calculate or compare probabilities.',
              'Recognising assumptions — pick the strongest argument for or against a proposal, or the unstated assumption an argument depends on.',
            ],
          },
          {
            kind: 'tip',
            title: 'The order of question types can change',
            body: 'Similar question types tend to appear together in the exam, but UCAT does not promise a fixed order. Always work out which family a question belongs to from the question itself, not from where it sits in the test.',
          },
        ],
      },
      {
        id: 'how-dm-questions-work',
        title: 'Format and scoring',
        subtitle: 'Two answer styles, partial credit on Yes/No sets, and no negative marking — three rules that shape every choice you make in the test.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'list',
        steps: [
          {
            title: 'The format at a glance',
            bullets: [
              '35 questions in 37 minutes (plus a 1 min 30 sec instruction screen).',
              'Two answer formats: single-answer multiple choice (1 mark) and five-statement Yes/No sets (2 marks).',
              'No negative marking — never leave anything blank.',
              'A basic on-screen calculator and flag/review tools are available.',
            ],
          },
          {
            kind: 'rule',
            title: 'How partial credit works',
            body: 'Five-statement Yes/No sets are worth 2 marks for all five correct, 1 mark for four correct, 0 marks for three or fewer. Treat them as five mini-questions, not one big one.',
          },
          {
            kind: 'tip',
            title: 'Why this changes how you triage',
            body: 'A 5-statement set is worth twice as much as a single MCQ. If both are answerable in the time you have, protect the higher-value set first.',
          },
          {
            kind: 'mini',
            prompt: 'You are unsure of a five-statement Yes/No set with one minute left. What gives you the best expected score?',
            options: [
              'Leave the whole set blank.',
              'Answer the four you are confident on and guess the fifth.',
              'Skip the set and revisit a single-answer item instead.',
            ],
            correctIndex: 1,
            explanation: 'Five-statement sets are worth 2 marks. Locking in four answers protects the partial mark, and guessing the fifth costs nothing because there is no negative marking.',
          },
          {
            kind: 'mini',
            prompt: 'Out of one single-MCQ question and one five-statement Yes/No set, which is worth more marks if answered fully?',
            options: [
              'The single MCQ — fewer statements to read.',
              'The five-statement set — worth twice as many marks.',
              'They are identical in value.',
            ],
            correctIndex: 1,
            explanation: 'A 5-statement Yes/No set is worth 2 marks vs 1 for a single MCQ. Under time pressure, do not abandon a higher-value set when you can still lock in answers.',
          },
        ],
      },
      {
        id: 'how-this-app-helps-dm',
        title: 'How this app teaches DM',
        subtitle: 'A quick tour of the practice loop on this app — including the AI tutor that lives inside every DM question.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A short walkthrough of how to learn and practise DM on this app, plus a live demo of the AI tutor — the feature that turns every wrong answer into a one-on-one teaching session.',
          },
          {
            title: 'When to try questions',
            body: 'Once you have finished the lessons, or if you want to skip ahead and try questions now, answer a practice question and check whether you were correct for the right reasons. If you were wrong, guessed, or still feel unsure, ask the AI tutor follow-up questions on that exact question.',
          },
          {
            title: 'Why static explanations are not always enough',
            body: 'An explanation tells you what the right answer was. It does not always tell you what your specific mistake was, why your reasoning fell short, or how to avoid the same trap next time. That is what the AI tutor is for — it sees the question, the options, your answer, and the correct answer, and it answers your follow-ups in plain English.',
          },
          {
            kind: 'rule',
            title: 'Where the tutor lives',
            body: 'After you submit any practice question, look for the "Teach Me" button at the bottom of the explanation box. That opens the AI tutor for this exact question. On Yes/No sets, every statement has its own Teach Me.',
          },
          {
            title: 'What you can ask',
            body: 'Ask any UCAT Decision Making question about the question setup, statements, answer choices, or your reasoning. The tutor knows the full context of the question you are on, so you can ask directly, for example: "Why is this not B?" or "Why does this conclusion follow?"',
          },
          {
            kind: 'demoLaunch',
            title: 'Try it now on a sample DM question',
            body: 'Tap the button below to open one short DM question. Answer it, then look for the highlighted "Teach Me" button to chat with the tutor.',
            buttonLabel: 'Try a sample DM question with the AI tutor',
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
    ],
  },
  {
    id: 'logic',
    title: 'Core logic foundations',
    description: 'The reasoning skills that sit underneath every DM question — words like "all"/"some"/"none", if-then logic, certainty, and assumptions.',
    icon: 'brain',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'quantifiers',
        title: 'All, some, none, and not all',
        subtitle: 'UCAT gives "all", "some" and "none" precise meanings — learn them exactly.',
        duration: '5 min',
        type: 'Logic skill',
        icon: 'filter',
        steps: [
          {
            kind: 'rule',
            title: 'What "all", "some" and "none" mean here',
            body: '"Some" = more than zero but less than all. "Not all" = at least one exception. "All" = 100%. "No" / "None" = 0% overlap.',
          },
          {
            title: 'What you CAN conclude',
            bullets: [
              '"All A are B" means: if x is an A, then x is a B.',
              '"No A are B" means: A and B do not overlap at all.',
              '"Some A are B" means: at least one A is a B AND at least one A is not a B.',
              '"Not all A are B" means: at least one A is not a B.',
            ],
          },
          {
            title: 'What you CANNOT conclude',
            bullets: [
              '"All A are B" does NOT mean all B are A (you cannot flip an "all" statement).',
              '"Some" does NOT mean "most".',
              '"Not all" does NOT mean "none".',
              '"No A are B" does NOT mean some A are B.',
            ],
          },
          {
            kind: 'mini',
            prompt: '"All radiographers are clinicians." Which conclusion is safe?',
            options: [
              'All clinicians are radiographers.',
              'No radiographer is a non-clinician.',
              'Most clinicians are radiographers.',
            ],
            correctIndex: 1,
            explanation: 'Safe rewrite: if every A is B, then no A is a non-B. The other two flip the "all" statement — a classic trap.',
          },
          {
            kind: 'mini',
            prompt: '"No volunteers are drivers. Some volunteers are marshals." Which follows?',
            options: [
              'All marshals are volunteers.',
              'Some marshals are not drivers.',
              'No marshal is a driver.',
            ],
            correctIndex: 1,
            explanation: 'The volunteers who are marshals are not drivers (premise 1), so some marshals are not drivers. We cannot conclude anything about all marshals from "some".',
          },
          {
            kind: 'mini',
            prompt: '"Not all applicants passed." Which follows?',
            options: [
              'Most applicants failed.',
              'At least one applicant did not pass.',
              'No applicants passed.',
            ],
            correctIndex: 1,
            explanation: '"Not all" guarantees at least one exception. It does not commit to most or to none — those would over-strengthen the claim.',
          },
        ],
      },
      {
        id: 'if-then',
        title: 'If-then logic',
        subtitle: 'Direction matters. There is only one safe way to flip an if–then statement.',
        duration: '5 min',
        type: 'Logic skill',
        icon: 'target',
        steps: [
          {
            kind: 'rule',
            title: 'What "if A then B" means',
            body: '"If A then B" says: whenever A is true, B must also be true. The rule is only broken when A happens but B does not.',
          },
          {
            title: 'What you CAN do',
            bullets: [
              'Flip AND negate (valid): "if NOT B, then NOT A". This is the only safe way to rearrange an if-then.',
              'Translate "A only if B" as "if A then B" (you need B before A can happen).',
              'Translate "A unless B" as "if NOT B, then A".',
            ],
          },
          {
            title: 'What you CANNOT do',
            bullets: [
              'Just flip (invalid): "if B then A" does NOT follow from "if A then B".',
              'Just negate (invalid): "if NOT A then NOT B" does NOT follow either.',
              '"A only if B" does NOT mean "if B then A".',
            ],
          },
          {
            kind: 'tip',
            title: 'Why "flip AND negate" is the only safe move',
            body: 'If A always forces B, then whenever B is missing, A must also be missing — otherwise A would have forced B. Flipping alone ("if B then A") does not work because B can have other causes. Negating alone ("if not A then not B") does not work either because B can still happen for other reasons.',
          },
          {
            kind: 'mini',
            prompt: '"If the alarm rings, staff evacuate." Staff evacuated yesterday. Did the alarm ring?',
            options: [
              'Yes — evacuating means the alarm rang.',
              'Not necessarily — they may have evacuated for another reason.',
              'No — the alarm definitely did not ring.',
            ],
            correctIndex: 1,
            explanation: 'Knowing staff evacuated does not prove the alarm rang — that\'s the wrong direction. Staff might have evacuated because of a fire, drill, or other trigger.',
          },
          {
            kind: 'mini',
            prompt: '"You can resit only if you register." Sam did NOT register. What follows?',
            options: [
              'Sam can still resit.',
              'Sam cannot resit.',
              'Sam will register later.',
            ],
            correctIndex: 1,
            explanation: 'The rule "if you resit then you registered" can be safely flipped to "if you did NOT register then you cannot resit". Sam did not register, so Sam cannot resit. Flipping AND negating is the one valid move.',
          },
          {
            kind: 'trap',
            title: 'The "only if" trap',
            body: '"A only if B" means "if A then B" — NOT "if B then A". B has to be in place before A can happen, not the other way round. Reading it the wrong way is the most common DM if-then error.',
          },
        ],
      },
      {
        id: 'simplify-wording',
        title: 'Simplifying messy wording',
        subtitle: 'Translate wordy clues into short, usable logic — faster, not slower.',
        duration: '4 min',
        type: 'Logic skill',
        icon: 'pencil',
        steps: [
          {
            title: 'Why this matters',
            body: 'You often lose marks not because the logic is hard but because the wording is messy. Rewriting clues in compact form is faster, not slower.',
          },
          {
            title: 'Translation toolkit',
            bullets: [
              '"A only if B" rewrites as "if A then B".',
              '"Not all" rewrites as "at least one is not".',
              '"Either A or B but not both" means exactly one of them happens.',
              '"At least N" sets a minimum; "at most N" sets a maximum.',
              '"Exactly N" means not N−1, not N+1 — only N.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Rewrite: "A student may join the lab only if they completed training."',
            options: [
              'If they completed training, they joined the lab.',
              'If they joined the lab, they completed training.',
              'Both directions — they are equivalent.',
            ],
            correctIndex: 1,
            explanation: '"A only if B" means "if A then B". So joining the lab requires training to have been completed. The other direction (training means they joined) is not stated.',
          },
          {
            kind: 'mini',
            prompt: 'Rewrite: "Either Asha or Ben must attend, but not both."',
            options: [
              'Both attend.',
              'Exactly one attends.',
              'Neither attends.',
            ],
            correctIndex: 1,
            explanation: '"Either/or but not both" means exactly one of them attends — never both, never neither.',
          },
        ],
      },
      {
        id: 'must-vs-could',
        title: 'Must be true vs could be true',
        subtitle: 'DM rewards certainty, not probability.',
        duration: '4 min',
        type: 'Logic skill',
        icon: 'check',
        steps: [
          {
            title: 'The kind of question this applies to',
            body: 'Many DM questions give you a few statements (the premises) and then a proposed conclusion, and ask whether the conclusion follows. You answer Yes or No. Yes/No syllogisms are the obvious example, but the same skill shows up in interpreting-information questions and Venn-based ones too.',
          },
          {
            kind: 'rule',
            title: 'Answer Yes only when the conclusion is forced',
            body: 'Answer Yes only if the conclusion MUST be true given the statements — meaning there is no possible situation where the statements are all true but the conclusion is false. If the conclusion is only possibly or probably true, answer No.',
          },
          {
            title: 'The one-question test',
            body: 'Ask: can I imagine even one situation, consistent with the statements, where this conclusion is false? If yes, the conclusion does not follow and you answer No.',
          },
          {
            kind: 'mini',
            prompt: '"All mentors are graduates. Some graduates play tennis." Does "Some mentors play tennis" follow?',
            options: [
              'Yes — definitely follows.',
              'No — possible but not guaranteed.',
              'Yes — most mentors play tennis.',
            ],
            correctIndex: 1,
            explanation: 'The graduates who play tennis might not be the same graduates who are mentors. The conclusion could be true, but it is not forced — and DM only accepts Yes when the conclusion is forced. So the answer is No.',
          },
          {
            kind: 'mini',
            prompt: '"No buses are electric. Some buses are full." Does "Some full vehicles are not electric" follow?',
            options: [
              'Yes — must be true.',
              'No — could be true.',
              'Cannot tell.',
            ],
            correctIndex: 0,
            explanation: 'The full buses are vehicles, and they are not electric (premise 1). So "some full vehicles are not electric" is forced.',
          },
          {
            kind: 'mini',
            prompt: '"Some candidates wear glasses." Does "Some candidates do not wear glasses" follow?',
            options: [
              'Yes — under UCAT, "some" implies "not all".',
              'No — the statements never claim that.',
              'Cannot tell.',
            ],
            correctIndex: 0,
            explanation: 'In standard logic "some" only means "at least one", but UCAT defines "some" as more than zero AND less than all (see the All, some, none lesson). That directly forces at least one candidate to not wear glasses, so the second statement must follow.',
          },
        ],
      },
      {
        id: 'statements-conclusions',
        title: 'Statements, conclusions, and assumptions',
        subtitle: 'Distinguish what is given, what follows, and what the reasoning is relying on. The vocabulary you will need for argument questions later.',
        duration: '5 min',
        type: 'Logic skill',
        icon: 'notes',
        steps: [
          {
            title: 'The three building blocks',
            bullets: [
              'A statement (or premise) is information the question gives you.',
              'A conclusion is what someone is trying to prove.',
              'An assumption is an unstated idea the reasoning needs in order to work.',
            ],
          },
          {
            title: 'How DM judges arguments',
            body: 'In UCAT argument questions, you judge support, relevance, and strength rather than whether you personally agree with the conclusion. The premises are the only source of truth.',
          },
          {
            kind: 'rule',
            title: 'The "pretend it\'s false" test for assumptions',
            body: 'When asked to identify the assumption behind an argument, pretend each candidate is false. If the argument falls apart, you have found the assumption. If the argument still works, you have not.',
          },
          {
            kind: 'mini',
            prompt: '"The library should open later because student attendance would rise." Which is the unstated assumption?',
            options: [
              'Late opening is one of the reasons attendance is currently lower.',
              'Most students live within walking distance.',
              'The library has enough staff to extend hours.',
            ],
            correctIndex: 0,
            explanation: 'Pretend it is false: if late opening had nothing to do with current attendance, the argument collapses — so this is the assumption the argument depends on. Staffing and distance are not what the argument hinges on.',
          },
          {
            kind: 'mini',
            prompt: '"We should buy more bikes because some students like cycling." Which is the assumption?',
            options: [
              'Cycling is good for health.',
              'Liking cycling translates into actual use.',
              'Bikes are cheaper than cars.',
            ],
            correctIndex: 1,
            explanation: 'If liking does not translate into use, buying bikes does not solve anything — the case for bikes falls apart. That is the assumption the argument depends on.',
          },
          {
            kind: 'trap',
            title: 'Calling every extra idea an "assumption"',
            body: 'In DM, an assumption must be connected to whether the argument works — not just vaguely related to the topic. Pretend each candidate is false; if the argument still works without it, it is not the assumption.',
          },
        ],
      },
    ],
  },
  {
    id: 'method',
    title: 'Method and tools',
    description: 'The repeatable routine, the noteboard tools, and the on-screen calculator — your toolkit before you tackle question types.',
    icon: 'target',
    accentKey: 'blue',
    lessons: [
      {
        id: 'trace-method',
        title: 'The TRACE method',
        subtitle: 'A repeatable five-step routine that works across the whole DM section.',
        duration: '5 min',
        type: 'Core method',
        icon: 'target',
        steps: [
          {
            title: 'Why you need a routine',
            body: 'Good DM performance comes from repetition of the same method, not from inventing a fresh approach for every question. TRACE gives you that routine.',
          },
          {
            kind: 'rule',
            title: 'TRACE in one line',
            body: 'Type, then Read, then Anchor, then Conclude, then Eliminate.',
          },
          {
            title: 'T — Type',
            body: 'Name the question family before you do anything else. Knowing the family tells you which method to use and whether the question genuinely needs a sketch — most short questions do not.',
          },
          {
            title: 'R — Read',
            body: 'Read the actual task (the question stem) before drowning in detail. Many students absorb every rule and only then realise the question only needed two of them.',
          },
          {
            title: 'A — Anchor',
            body: 'Extract only the facts that matter and hold them somewhere reliable — in your head if the logic is short, on the noteboard if it is not. Sketch only when the question is too tangled to track mentally: arrows for conditionals, a tiny table for puzzles, a Venn outline for overlap, a one-line order for ranking. The next lesson covers exactly when a sketch pays for itself and when it costs you time.',
          },
          {
            title: 'C — Conclude',
            body: 'Answer from your representation — whether that is your mental model or a quick sketch — not from instinct or vague recall. If you are past your time budget, eliminate what you can and best-guess rather than rebuilding the picture. Never burn extra time redrawing.',
          },
          {
            title: 'E — Eliminate',
            body: 'Check exact wording (all, some, only if, must, strongest), eliminate clearly wrong options, and flag and move on if you stall.',
          },
          {
            kind: 'mini',
            prompt: 'You spend 90 seconds on a logic puzzle and have not made progress. What does TRACE tell you to do?',
            options: [
              'Push for another minute — you are nearly there.',
              'Make your best guess, flag, and move on.',
              'Restart the puzzle from scratch.',
            ],
            correctIndex: 1,
            explanation: 'The Eliminate step explicitly handles stuck items: pick the best surviving option, flag, and move on. Time burnt on one puzzle is time stolen from easier marks elsewhere.',
          },
          {
            kind: 'mini',
            prompt: 'You see "Some doctors are researchers; no researchers are interns." Which Anchor is fastest?',
            options: [
              'A three-circle Venn diagram drawn on the noteboard.',
              'A one-line note ("D∩R yes; R∩I = 0") and reason in your head.',
              'A grid with names down one side.',
            ],
            correctIndex: 1,
            explanation: 'Two short premises like this resolve mentally in seconds — a one-line note is enough to anchor the logic. Drawing a three-circle Venn for a two-statement syllogism burns 15-20 seconds you do not have. Save full Venn sketches for numerical Venn questions or 3+ overlapping sets you cannot track in your head.',
          },
        ],
      },
      {
        id: 'when-to-draw',
        title: 'Diagrams, tables, or mental logic',
        subtitle: 'Default to mental reasoning — sketch only when the question genuinely needs it. Time spent drawing is time stolen from other questions.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'notes',
        steps: [
          {
            title: 'Your noteboard at the test centre',
            body: 'At Pearson VUE you receive an A4 laminated notebook and pen. On OnVUE you supply your own erasable whiteboard or laminated paper no larger than 30 × 50 cm, shown blank to the proctor at the start and erased at the end.',
          },
          {
            kind: 'rule',
            title: 'The default is mental — sketching is the exception',
            body: 'You have ~63 seconds per question. A neat sketch can take 15-30 seconds before you have even started reasoning. Sketch only when the question is genuinely too tangled to track in your head, or when the question type forces it (numerical Venns, multi-entity matching).',
          },
          {
            title: 'When a sketch genuinely pays for itself',
            bullets: [
              'Numerical Venn questions — region totals, "how many in both/neither", or answer options that ARE Venn diagrams. Always sketch a quick 4-region outline.',
              'Matching puzzles with 4+ items × 4+ attributes (e.g. four people, four days, four colours). A two-way grid is standard.',
              'Logic puzzles with 4+ rules where you cannot hold all the constraints in mind at once. Use a short order line or a small grid.',
              'Five-statement Yes/No sets built on the same premises — a one-line shorthand for each premise saves you re-reading them five times.',
            ],
          },
          {
            title: 'When to keep it mental (or one short note)',
            bullets: [
              'Two-statement syllogisms (e.g. "All A are B; some B are C"). Reason it out, jot at most a single line of shorthand.',
              'Short ordering chains — three names with one or two rules resolve on a single line.',
              'Single if-then or only-if comparisons.',
              'Strongest-argument and assumption questions. The relationships are linguistic, not structural — drawings almost never help.',
              'Probability with one or two events. Multiply or add in your head, or one line on the noteboard.',
            ],
          },
          {
            kind: 'trap',
            title: 'Over-drawing the simple ones',
            body: 'A two-fact mental check should take five seconds. Drawing a grid for it can take thirty. The cost is invisible at the time but compounds across the section — six over-drawn questions can wipe out a minute of real solving time.',
          },
          {
            kind: 'rule',
            title: 'The 15-second sketch cap',
            body: 'If your sketch is not built within ~15 seconds, you have picked the wrong tool or the question does not need one. Stop drawing, eliminate what you can mentally, and best-guess. Never burn 60+ seconds on a sketch alone.',
          },
          {
            kind: 'mini',
            prompt: '"Mia sits before Jun, and Jun sits before Arlo." Which tool is fastest?',
            options: [
              'A three-circle Venn.',
              'A short order line in your head or a single jotted line: Mia – Jun – Arlo.',
              'A full grid with all possible seats.',
            ],
            correctIndex: 1,
            explanation: 'Three names with one chained rule resolves mentally in seconds — a one-line note is plenty if you want to externalise it. A Venn does not represent ordering; a full grid is overkill for a chain this short.',
          },
          {
            kind: 'mini',
            prompt: '"Should the school add a later bus?" with four short arguments. Best tool?',
            options: [
              'A Venn diagram.',
              'No drawing — compare arguments directly in your head.',
              'A grid of arguments.',
            ],
            correctIndex: 1,
            explanation: 'Argument-evaluation questions are read-and-compare. The relationships between arguments and the proposal are linguistic, not structural — drawings rarely help and almost always cost time.',
          },
          {
            kind: 'mini',
            prompt: 'Numerical Venn question: "Of 80 students, 35 take French, 28 take German, 12 take both. How many take neither?" Best approach?',
            options: [
              'Solve in your head — it is just arithmetic.',
              'Quick 4-region Venn outline (French only, German only, both, neither), fill in the numbers, sanity-check.',
              'A grid with rows and columns of subjects.',
            ],
            correctIndex: 1,
            explanation: 'Numerical Venns are the one set-overlap question type where a sketch genuinely pays for itself — a 5-10 second four-region outline prevents double-counting and surfaces the "neither" region you would otherwise forget. Pure mental arithmetic on multi-region overlap is where students lose the easy marks.',
          },
        ],
      },
      {
        id: 'on-screen-calculator',
        title: 'Using the on-screen calculator',
        subtitle: 'Know exactly what the calculator does, what it does not, and the one rule that catches everyone out.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'calculator',
        steps: [
          {
            title: 'What the calculator is and is not',
            body: 'A basic on-screen calculator is available for DM and QR. It handles the four operations (+, −, ×, ÷), a memory function, percentage, and a square root key (√). It cannot do powers (no x², x³, or xⁿ button), and there are no brackets — which is why operation order matters so much.',
          },
          {
            kind: 'rule',
            title: 'The most important thing to know',
            body: 'The calculator does NOT follow BODMAS. Operations execute in entry order. If you type 2 + 3 × 4, it returns 20, not 14. Always do multiplications and divisions first, then add and subtract.',
          },
          {
            title: 'Useful keys and shortcuts',
            bullets: [
              'M+ stores the displayed number in memory.',
              'MRC recalls memory (press once to recall, twice to clear).',
              'Alt + C opens or closes the calculator (faster than clicking).',
              'The % key gives you a percentage of the previous number.',
              '√ takes the square root of the displayed number — useful when working back from an area or a squared total.',
            ],
          },
          {
            kind: 'tip',
            title: 'Verify the layout in the official tutorial',
            body: 'The exact button set has been described inconsistently across prep sites. Spend 60 seconds in the official UCAT practice tutorial before test day and confirm exactly which keys are on your calculator — that takes any uncertainty off the table.',
          },
          {
            title: 'When to reach for it',
            bullets: [
              'Numbers with 4+ digits, or any multi-step arithmetic where dropping a digit would matter.',
              'Probability multiplication where you need the exact fraction or decimal.',
              'Percentages where the answer choices are close together.',
            ],
          },
          {
            title: 'When to skip it',
            bullets: [
              'Anything you can do in your head in under 3 seconds.',
              'Estimation tasks where rounding gives the answer faster.',
              'Simple comparisons where exact numbers do not matter.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'You enter "2 + 3 × 4" into the on-screen calculator. What does it display?',
            options: ['14', '20', '24'],
            correctIndex: 1,
            explanation: 'Entry order, not BODMAS. It computes 2 + 3 = 5, then 5 × 4 = 20. To get the BODMAS answer, multiply first: type 3 × 4 = 12, then + 2 = 14.',
          },
          {
            kind: 'mini',
            prompt: 'You need the chance of red and 6: 1/2 × 1/6. Reach for the calculator?',
            options: [
              'Yes — fraction multiplication is what it is for.',
              'No — 1/2 × 1/6 = 1/12 is faster mentally.',
              'Yes — the % key handles this.',
            ],
            correctIndex: 1,
            explanation: 'Simple fraction multiplication is faster mentally than reaching for the calculator. Save the calculator for multi-step or 4+ digit arithmetic.',
          },
        ],
      },
      {
        id: 'elimination',
        title: 'Elimination logic',
        subtitle: 'Use elimination as a primary reasoning tool, not a final tidy-up.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'flag',
        steps: [
          {
            title: 'Why elimination is a speed skill',
            body: 'Good elimination is one of the fastest ways to find the right answer in DM. For every wrong answer, you should be able to name why it is wrong.',
          },
          {
            title: 'The five rejection reasons',
            bullets: [
              'Contradicted — the premises directly rule it out.',
              'Too strong — uses "all", "always", "never" when the evidence supports only "some" or "sometimes".',
              'Not proven — sounds plausible but the premises do not establish it.',
              'Off-topic — answers a different question than the one asked.',
              'Only partly supported — half right, half added in.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Premise: "Some mentors are tutors." Option: "All mentors are tutors." Reject because…',
            options: [
              'Contradicted by the premises.',
              'Too strong — overshoots "some" to "all".',
              'Off-topic.',
            ],
            correctIndex: 1,
            explanation: '"All" is a stronger claim than "some". The premise supports only "some", so any "all" option fails on the strength check.',
          },
          {
            kind: 'mini',
            prompt: 'Question is about reducing lost property. Option: "Students deserve respect." Reject because…',
            options: [
              'Off-topic — answers a different question.',
              'Too strong.',
              'Contradicted.',
            ],
            correctIndex: 0,
            explanation: 'Respect-based reasoning does not address lost property. Off-topic options are common DM distractors — strong-sounding but unrelated to the actual question.',
          },
          {
            kind: 'tip',
            title: 'Do not keep favourites',
            body: 'If you cannot name why an option is wrong, you have not eliminated it — you have just hoped the option was wrong. Force a label, then move on.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'Question types and worked examples',
    description: 'A method, traps to watch, and worked examples for the DM question families, including both argument subtypes.',
    icon: 'list',
    accentKey: 'mint',
    lessons: [
      {
        id: 'syllogisms',
        title: 'Syllogisms / Yes-No conclusions',
        subtitle: 'Treat each statement separately. Stick to UCAT\'s exact meanings of "all", "some" and "none".',
        duration: '6 min',
        type: 'Question type',
        icon: 'check',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type tests',
            body: 'Syllogism questions ask whether conclusions follow from premises. Treat the premises as true even if they sound unrealistic. These commonly appear as five-statement Yes/No sets worth 2 marks.',
          },
          {
            title: 'The method',
            bullets: [
              'For two short premises, hold the logic in your head or jot a single line of shorthand — drawing a full Venn is usually slower than the reasoning itself.',
              'Only sketch a Venn when you have 3+ overlapping sets or you cannot track the relationships mentally.',
              'Test each conclusion separately — never let one conclusion\'s reasoning bleed into another.',
              'Mark Yes only if the conclusion must be true given the premises.',
              'Stick to UCAT\'s exact wording rules: "some" also means "not all"; "no" means zero overlap; "all" does not guarantee that any actually exist.',
            ],
          },
          {
            kind: 'trap',
            title: 'Chaining "all" and "some" too aggressively',
            body: 'A classic trap: "All A are B. Some B are C. Therefore some A are C." This does NOT follow — the Bs that are C may not be the same Bs that are A. There is no guaranteed link between A and C.',
          },
          {
            kind: 'mini',
            prompt: '"All coders are problem-solvers. Some problem-solvers are gamers." Does "Some coders are gamers" follow?',
            options: ['Yes', 'No'],
            correctIndex: 1,
            explanation: 'The problem-solvers who are gamers may not be the same problem-solvers who are coders. The conclusion is possible but not forced.',
          },
          {
            kind: 'mini',
            prompt: '"No interns are consultants. Some interns are researchers." Does "Some researchers are not consultants" follow?',
            options: ['Yes', 'No'],
            correctIndex: 0,
            explanation: 'The interns who are researchers cannot be consultants. So among researchers, those interns are non-consultants — meaning "some researchers are not consultants" is forced.',
          },
          {
            kind: 'mini',
            prompt: '"Not all tutors are examiners." Does "Some tutors are not examiners" follow?',
            options: ['Yes', 'No'],
            correctIndex: 0,
            explanation: '"Not all" = at least one is not. That is exactly what "some are not" claims. Direct restatement.',
          },
        ],
      },
      {
        id: 'syllogism-example',
        title: 'Worked example: Syllogism',
        subtitle: 'A five-statement Yes/No set built from three premises about radiographers, clinicians, and tutors.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'check',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Syllogism',
            body: 'Read the three premises and decide Yes or No for each of the five conclusions. Commit to your answers first — every statement gets its own breakdown afterwards.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'logic-puzzles',
        title: 'Logic puzzles',
        subtitle: 'Order, group, match, or schedule items by translating clues into a grid or order line.',
        duration: '6 min',
        type: 'Question type',
        icon: 'list',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this question type covers',
            body: 'Logic puzzles include ordering, grouping, matching, and scheduling. They are mentally expensive but reward organisation more than speed-reading.',
          },
          {
            title: 'The method',
            bullets: [
              'Identify the items and the slots.',
              'For 3 items with 1-2 rules, reason it out mentally or jot a single order line.',
              'For 4+ items or 4+ rules, build a small grid, table, or order line — anything more complex is hard to track in your head.',
              'Add absolute rules first ("June is on Wednesday"); relative rules second ("Hana before Idris").',
              'Make forced deductions before testing options.',
              'If still stuck after 90 seconds, guess intelligently, flag, and move on.',
            ],
          },
          {
            kind: 'trap',
            title: 'Drawing for the small ones, juggling the big ones',
            body: 'Both directions cost marks. Drawing a grid for a 3-name chain wastes 20+ seconds; juggling 4+ rules in your head leads to forgotten constraints. Match the tool to the size of the puzzle — and if the sketch is taking longer than 10-15 seconds to set up, you have picked the wrong tool.',
          },
          {
            kind: 'mini',
            prompt: 'Three clues: A is before B; B is before C; C is in slot 4. Which absolute rule do you place first?',
            options: [
              'A is before B.',
              'B is before C.',
              'C is in slot 4.',
            ],
            correctIndex: 2,
            explanation: 'Absolute rules (fixed positions) come first because they shrink the search space immediately. Relative rules then apply against that anchor.',
          },
          {
            kind: 'mini',
            prompt: 'You have spent 95 seconds on one puzzle and made no progress. What do you do?',
            options: [
              'Push for another 30 seconds.',
              'Best-guess between the surviving options, flag, and move on.',
              'Skip without selecting an answer.',
            ],
            correctIndex: 1,
            explanation: '90 seconds is your decision threshold for stuck puzzles. Best-guess after eliminating clearly wrong options — there is no negative marking.',
          },
        ],
      },
      {
        id: 'puzzle-example',
        title: 'Worked example: Logic puzzle',
        subtitle: 'Place an absolute rule first, then resolve the chain.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'list',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Logic puzzle',
            body: 'Four students, four days, three clues. Find the absolute rule, place it, then chain the rest. The breakdown explains why the structure resolves uniquely.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'venn-diagrams',
        title: 'Venn / Euler diagrams',
        subtitle: 'The two main question formats, the shape variety to expect, and the "only vs and" trap that catches everyone.',
        duration: '7 min',
        type: 'Question type',
        icon: 'filter',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'The question formats you will meet',
            body: 'Most prep sources describe Venn/Euler questions in two main formats. A third pattern — calculating a count from a labelled numerical diagram — is sometimes treated as a stand-alone format and sometimes folded into "interpret". The next four worked examples cover all three so you are ready for either framing.',
            bullets: [
              'Select the diagram — the stem gives data; you pick which of four candidate diagrams matches it.',
              'Interpret the diagram — a single rendered diagram (often with letters labelling regions); you answer a question about which region or category fits a description.',
              'Region calculation — a labelled numerical diagram (a sub-form of "interpret"); you compute a count for a category combination such as "X but not Y".',
            ],
          },
          {
            kind: 'rule',
            title: 'UCAT does NOT always use circles',
            body: 'Multiple UCAT prep sources note that diagrams may use shapes other than circles — published examples have included stars, ovals, parallelograms, pentagons and rectangles. Other geometric shapes (hexagons, arrows, strips, diamonds, trapezoids) are also possible but appear less frequently in the published examples we found. Whatever shapes appear, each shape represents one category, and the legend below the diagram tells you which is which. ALWAYS read the legend before reading any region.',
          },
          {
            title: 'The three set relationships',
            bullets: [
              'Overlap — two shapes share members; partial overlap.',
              'Subset (Euler) — one shape sits entirely inside another (e.g. "All A are B" — every A is a B).',
              'Disjoint — two shapes do not touch; no shared members.',
            ],
          },
          {
            kind: 'rule',
            title: 'The fast method for select-the-diagram and calculation questions',
            body: 'You will not have time to derive every region. Use the values the stem gives you directly:',
            bullets: [
              'Read the legend — confirm which shape is which category.',
              'Spot the values you can read straight off any diagram: the centre count (all categories overlap), the outside count (none of them), and the sum of pair regions ("exactly two").',
              'Check those against each option to eliminate three of four diagrams in seconds.',
              'Only then derive a single category total to sanity-check the survivor.',
            ],
          },
          {
            kind: 'rule',
            title: 'For region-calculation questions',
            body: 'Translate "X but not Y" into "inside the X shape AND outside the Y shape". Walk through every region inside X and exclude any that also touches Y. Same for "X and Y only" — inside X and Y, outside everything else.',
          },
          {
            kind: 'trap',
            title: '"A and B" vs "A and B only"',
            body: '"A and B" includes everyone in the overlap of A and B, INCLUDING those also in C. "A and B only" excludes anyone also in C. This is the single most common Venn diagram error — and it gets worse with more categories. Always check whether the question says "only".',
          },
          {
            kind: 'trap',
            title: 'Double-counting the overlap',
            body: 'Adding 12 sport + 8 music + 3 both = 23 misreads the question. The 3 in both are already counted in the 12 and the 8. The total in either is 12 + 8 − 3 = 17 (inclusion–exclusion).',
          },
        ],
      },
      {
        id: 'venn-example',
        title: 'Worked example: Standard Venn (circles)',
        subtitle: 'A classic 3-circle SELECT question — read the values the stem gives you, eliminate, sanity-check.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Standard Venn',
            body: 'A 3-set diagram with labelled circles. Use the centre count, the no-clubs count, and the exactly-two count to eliminate three of four diagrams without doing every region calculation.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'venn-example-shapes',
        title: 'Worked example: Mixed-shape Venn',
        subtitle: 'A reminder that diagrams may use non-circle shapes — read the legend, then apply the same elimination strategy.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Mixed-shape Venn',
            body: 'Same SELECT mechanic, but the categories are drawn as a block arrow, a hexagon, and a diamond. The legend tells you which shape is which — then it is the same maths as on a circle diagram.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'venn-example-interpret',
        title: 'Worked example: Reading a Venn diagram',
        subtitle: 'A single labelled diagram with letters in each region — pick the letter that matches a category description.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Reading a diagram',
            body: 'Translate "X and Y but not Z" into a checklist of in/out conditions, then walk to the region that satisfies all of them. Never guess from letter position.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'venn-example-numerical',
        title: 'Worked example: Region calculation',
        subtitle: 'A diagram with numbers — calculate a count for a category combination, watching for the "only vs and" trap.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'filter',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Region calculation',
            body: 'A 3-set numerical diagram. Translate "X but not Y" into "inside X AND outside Y" and add the matching regions. The classic trap is reading the whole shape and forgetting to exclude.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'interpreting-info',
        title: 'Interpreting information',
        subtitle: 'Read tables, charts, rule sets, and short data blocks carefully — units and denominators win marks.',
        duration: '6 min',
        type: 'Question type',
        icon: 'notes',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'The method',
            bullets: [
              'Read the title.',
              'Read the units.',
              'Mark the denominator or total.',
              'Identify the exact row, column, or rule that matters.',
              'Test each statement one at a time.',
            ],
          },
          {
            title: 'Trap 1 — Rate vs absolute number',
            body: 'A clinic with 40 late arrivals from 200 appointments has a 20% late rate, not 40%. Whenever you see a number in a table, check whether the question is asking for the count (40) or the rate (40 / 200). Mixing them up is the most common data trap in DM.',
          },
          {
            title: 'Trap 2 — Time-window switches',
            body: 'A table shows weekly totals; a statement claims a daily maximum. Check the time base before answering.',
          },
          {
            title: 'Trap 3 — Causation vs correlation',
            body: 'Two variables moving together do not prove one causes the other. If a statement claims cause, check whether the data supports cause or only association.',
          },
          {
            kind: 'mini',
            prompt: 'A chart shows 40 late arrivals out of 200 appointments. The late-arrival rate is…',
            options: ['20%', '40%', '50%'],
            correctIndex: 0,
            explanation: '40 / 200 = 20%. Reading the count (40) as the rate (40%) is the rate-vs-absolute trap.',
          },
          {
            kind: 'mini',
            prompt: 'Survey shows ice cream sales and sunburn cases both rise in summer. Which conclusion is unsafe?',
            options: [
              'Both rise in summer.',
              'Ice cream sales cause sunburn.',
              'They are correlated.',
            ],
            correctIndex: 1,
            explanation: 'Both rising together is correlation. Concluding cause from co-movement ignores the obvious common driver (summer / sun exposure). Watch any data option that upgrades correlation to cause.',
          },
        ],
      },
      {
        id: 'interpreting-info-example',
        title: 'Worked example: Interpreting information',
        subtitle: 'A small appointments table where totals, rates, and averages point to different answers.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'notes',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Interpreting information',
            body: 'Read the table first, then test each statement against the exact row, column, and denominator it uses. The breakdown shows how totals and rates can pull in different directions.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'probability',
        title: 'Probability questions',
        subtitle: 'Decide add vs multiply immediately, and update denominators when there is no replacement.',
        duration: '6 min',
        type: 'Question type',
        icon: 'calculator',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            kind: 'rule',
            title: 'Two core rules',
            body: 'For "A and B", multiply the two chances. If the first event changes the situation for the second (for example, drawing a ball without putting it back), update the second probability before multiplying. For "A or B", add the two chances and subtract any overlap.',
          },
          {
            title: 'Quick translations',
            bullets: [
              '"A or B": add the probabilities, then subtract any overlap.',
              '"A and B": multiply the probabilities (update the second one if the first affects it).',
              'Without replacement: the first pick changes the denominator for the second pick.',
              'Mutually exclusive: the two events cannot both happen, so the overlap is zero.',
              'Independent: one event does not affect the other.',
            ],
          },
          {
            title: 'Independent vs mutually exclusive',
            body: 'Independent events can both happen — they just do not influence each other. Mutually exclusive events cannot both happen at all. Confusing the two leads to multiplying when the combined chance should be zero, or vice versa.',
          },
          {
            kind: 'mini',
            prompt: 'Fair coin then fair die. Chance of heads and a 6 = ?',
            options: ['1/2', '1/6', '1/12'],
            correctIndex: 2,
            explanation: 'Independent events combined with "and" — multiply the probabilities. 1/2 × 1/6 = 1/12.',
          },
          {
            kind: 'mini',
            prompt: 'Bag with 4 white and 1 black. Two draws without replacement. Chance both are white = ?',
            options: ['16/25', '3/5', '4/5'],
            correctIndex: 1,
            explanation: 'Chance of first white = 4/5. After taking one, 3 white remain of 4 total. Chance of second white after the first is white = 3/4. Chance of both = 4/5 × 3/4 = 12/20 = 3/5.',
          },
          {
            kind: 'trap',
            title: 'Multiplying probabilities of mutually exclusive events',
            body: 'The chance of A and B when A and B cannot both happen is 0, not A multiplied by B. Never multiply mutually exclusive probabilities.',
          },
        ],
      },
      {
        id: 'probability-example',
        title: 'Worked example: Probability',
        subtitle: 'Two draws without replacement from a tray of red, blue, and green files.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'calculator',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Probability',
            body: '"Without replacement" always changes the second denominator. Commit to your answer first, then study the cross-check using possible pairs.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'strongest-argument',
        title: 'Recognising assumptions and strongest argument',
        subtitle: 'For strongest arguments, test evidence and relevance. For assumptions, pretend each candidate is false.',
        duration: '6 min',
        type: 'Question type',
        icon: 'flame',
        practiceLabel: 'Practise DM questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'The two skills tested',
            body: 'Strongest argument asks which of four reasons best supports or opposes a proposal. Recognising assumptions asks what unstated idea the argument relies on to work.',
          },
          {
            kind: 'rule',
            title: 'FREES — the strongest-argument framework',
            body: 'F — Factual (evidence, not feeling). R — Relevant (addresses the proposal directly). E — Entire (addresses the whole proposal, not just a small side issue). E — Emotionless (avoids emotive or loaded language). S — Sensible (no unsupported leaps). The strongest argument passes all five; weaker arguments fail one or more.',
          },
          {
            title: 'Method for strongest argument',
            bullets: [
              'Read the proposal carefully and note what is being decided.',
              'Scan each option once for any obvious FREES failure (emotive language, irrelevant point, unsupported leap) and eliminate it.',
              'On the 1-2 survivors, check the remaining FREES letters more carefully.',
              'Pick the strongest — you have ~30-45 sec total, so do not run all five checks on every option.',
            ],
          },
          {
            title: 'Method for assumption questions',
            body: 'Pretend each candidate is false in turn. The one that, when false, breaks the argument is the assumption.',
          },
          {
            kind: 'mini',
            prompt: '"Should the clinic add evening appointments?" Which is the strongest argument?',
            options: [
              'Yes — evenings feel more modern and welcoming.',
              'Yes — current did-not-attend rates are highest among working-age patients who cannot attend daytime slots, and a survey showed transport access is a secondary barrier.',
              'No — some staff prefer mornings.',
            ],
            correctIndex: 1,
            explanation: 'Option B passes all five FREES tests: factual (data cited), relevant (missed appointments are the proposal\'s actual problem), entire (addresses the appointment-time mechanism and the outcome), emotionless (neutral), sensible (clear chain). A fails Factual; C is narrow and partly relevant.',
          },
          {
            kind: 'mini',
            prompt: 'Argument: "We should add lockers because students need somewhere to keep belongings." What is the assumption?',
            options: [
              'Lockers are cheaper than alternatives.',
              'Students currently lack a place to keep belongings.',
              'All schools should have lockers.',
            ],
            correctIndex: 1,
            explanation: 'Pretend it is false: if students already have a place to keep belongings, the case for lockers collapses. That is the assumption the argument depends on.',
          },
          {
            kind: 'trap',
            title: 'Picking the option you personally agree with',
            body: 'Confident wording is not strength. The strongest argument is the one with the best evidence and chain of reasoning, regardless of which side it takes.',
          },
        ],
      },
      {
        id: 'assumption-example',
        title: 'Worked example: Assumption',
        subtitle: 'Use the "pretend it is false" test to find the hidden link an argument needs.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'brain',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Assumption',
            body: 'Read the short argument, then test each option by pretending it is false. The right assumption is the one that makes the argument collapse when removed.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
      {
        id: 'weak-arguments',
        title: 'Spotting weak arguments',
        subtitle: 'Persuasive tone is not the same as logical strength.',
        duration: '4 min',
        type: 'Question type',
        icon: 'flag',
        steps: [
          {
            title: 'Five common weak patterns',
            bullets: [
              'Emotional appeal — feeling replaces reasoning ("it would be nicer").',
              'Popularity — common view is not proof ("everyone wants it").',
              'Unsupported prediction — future claim with no evidence ("it will definitely solve everything").',
              'Off-topic — answers a different question (cost when asked about fairness).',
              'Extreme wording — too absolute for the evidence (always, never, impossible).',
            ],
          },
          {
            title: 'Why weak arguments still tempt students',
            body: 'Weak arguments often sound passionate, certain, or righteous. Under time pressure, energy can feel like strength. UCAT tests whether you can see past it.',
          },
          {
            kind: 'mini',
            prompt: '"We should change the rota because everyone hates mornings." Which weakness is this?',
            options: [
              'Emotional / popularity — feelings and group preference, no real reason.',
              'Off-topic.',
              'Unsupported prediction.',
            ],
            correctIndex: 0,
            explanation: 'Combines emotional appeal with popularity. Neither addresses the actual operational reason for or against changing the rota.',
          },
          {
            kind: 'mini',
            prompt: '"This new policy will solve all attendance problems forever." Which weakness?',
            options: [
              'Emotional appeal.',
              'Unsupported prediction with extreme wording.',
              'Off-topic.',
            ],
            correctIndex: 1,
            explanation: '"All... forever" is a sweeping future claim with no evidence — unsupported prediction plus extreme wording. Strong arguments rarely commit to "all" or "always".',
          },
        ],
      },
      {
        id: 'argument-example',
        title: 'Worked example: Strongest argument',
        subtitle: 'A free evening bus proposal with four candidate arguments — apply FREES.',
        duration: '4 min',
        type: 'Worked example',
        icon: 'flame',
        steps: [
          {
            kind: 'workedExampleLaunch',
            title: 'Worked example: Strongest argument',
            body: 'Run F, R, E, E, S on each of the four options. The breakdown shows exactly which letters each option fails or passes.',
            buttonLabel: 'Start worked example',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Traps and exam-day strategy',
    description: 'The classic traps to spot before they cost you marks, plus the timing and triage rules that protect your score under pressure.',
    icon: 'target',
    accentKey: 'amber',
    lessons: [
      {
        id: 'logic-traps',
        title: 'Common logic traps',
        subtitle: 'The biggest reasoning errors to recognise before they happen.',
        duration: '5 min',
        type: 'Traps',
        icon: 'flag',
        steps: [
          {
            title: 'The four big traps',
            bullets: [
              'Flipping an "all" statement — "all A are B" does NOT give you "all B are A".',
              'Flipping an if-then — "if A then B" does NOT give you "if B then A".',
              'Treating "could be true" as "must be true" — a conclusion that is only possible should be marked No in a "must follow" question.',
              'Bringing in outside knowledge — treat the question\'s statements as your only source of truth.',
            ],
          },
          {
            kind: 'mini',
            prompt: '"All surgeons are clinicians." A trap option says "All clinicians are surgeons." Which trap?',
            options: [
              'Flipping an "all" statement.',
              'Outside knowledge.',
              'Treating "could be true" as "must be true".',
            ],
            correctIndex: 0,
            explanation: 'Flipping "all A are B" to "all B are A" is the classic trap. It never works.',
          },
          {
            kind: 'mini',
            prompt: '"If the alarm rings, staff evacuate." Trap: "Staff evacuated, so the alarm rang." Which trap?',
            options: [
              'Flipping an if-then in the wrong direction.',
              'Outside knowledge.',
              'Flipping an "all" statement.',
            ],
            correctIndex: 0,
            explanation: 'Treating B as proof of A is the wrong direction — invalid. The only safe flip is "if NOT B then NOT A".',
          },
          {
            kind: 'mini',
            prompt: '"Some graduates are volunteers." Trap: "Most graduates are volunteers." Which trap?',
            options: [
              'Strengthening "some" to "most".',
              'Causation/correlation.',
              'Flipping an if-then.',
            ],
            correctIndex: 0,
            explanation: '"Some" never licences "most". Pushing a weaker word ("some") into a stronger one ("most") is one of the most reliable DM traps.',
          },
        ],
      },
      {
        id: 'diagram-traps',
        title: 'Diagram traps',
        subtitle: 'Avoid the drawing mistakes that create wrong answers before reasoning even begins.',
        duration: '4 min',
        type: 'Traps',
        icon: 'filter',
        steps: [
          {
            title: 'Common diagram mistakes',
            bullets: [
              'Double-counting overlap.',
              'Forgetting the outside region (those in neither group).',
              'Forcing uncertain information into fixed positions.',
              'Treating an empty region of your Venn (one with no number written in it) as zero when the question simply did not give you that number.',
            ],
          },
          {
            kind: 'trap',
            title: 'Writing certainty where the clue gives only possibility',
            body: '"Mira sits before Jay" does not pin them to specific seats. Possibility is not placement. Mark the constraint, not a position.',
          },
          {
            kind: 'mini',
            prompt: '12 students in sport, 8 in music, 3 in both. Total in either is…',
            options: ['17', '20', '23'],
            correctIndex: 0,
            explanation: '12 + 8 − 3 = 17 (inclusion-exclusion). Adding raw 12 + 8 + 3 double-counts the overlap; using 12 + 8 ignores it.',
          },
          {
            kind: 'mini',
            prompt: '"Some doctors are researchers." If you do sketch this (e.g. inside a larger 3-set numerical Venn), how should the two circles sit?',
            options: [
              'Doctor circle entirely inside research circle.',
              'Two circles with a partial overlap only.',
              'Two completely separate circles.',
            ],
            correctIndex: 1,
            explanation: 'Only the overlap is established by "some". Drawing the doctor circle fully inside research would over-claim a subset; separate circles would over-claim disjoint. (Reminder: for a single "some" statement on its own, you usually do not need to sketch at all — this is about getting the geometry right when a sketch is genuinely useful.)',
          },
        ],
      },
      {
        id: 'data-traps',
        title: 'Probability and data traps',
        subtitle: 'Avoid calculation errors that come from reading problems the wrong way.',
        duration: '4 min',
        type: 'Traps',
        icon: 'calculator',
        steps: [
          {
            title: 'Probability traps',
            bullets: [
              'Using "with replacement" denominators when the question says "without replacement".',
              'Adding when you should multiply (or vice versa).',
              'Assuming independence when events depend on each other.',
              'Confusing "A or B" with "A and B".',
            ],
          },
          {
            title: 'Data traps',
            bullets: [
              'Comparing totals when proportions matter.',
              'Comparing percentages when raw counts matter.',
              'Forgetting which value is the denominator.',
              'Importing causation from correlation.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Two clinics each have 10 complaints; one saw 100 patients, the other 1,000. Which has the higher complaint rate?',
            options: [
              'They are equal — same complaint count.',
              'The 100-patient clinic — 10/100 = 10% vs 10/1000 = 1%.',
              'Cannot tell from the data.',
            ],
            correctIndex: 1,
            explanation: 'Comparing totals when proportions matter is the textbook data trap. The 100-patient clinic has a 10× higher complaint rate.',
          },
          {
            kind: 'mini',
            prompt: 'Independent events: chance of A = 1/5, chance of B = 1/2. Chance of A and B = ?',
            options: ['7/10', '1/10', '3/10'],
            correctIndex: 1,
            explanation: 'Independent events combined with "and" — multiply. 1/5 × 1/2 = 1/10. The 7/10 distractor comes from adding instead of multiplying.',
          },
        ],
      },
      {
        id: 'argument-traps',
        title: 'Argument traps',
        subtitle: 'Spot arguments that sound good but reason badly.',
        duration: '4 min',
        type: 'Traps',
        icon: 'flame',
        steps: [
          {
            title: 'The five trap shapes',
            bullets: [
              'Emotional appeal — words like "feel", "deserve", "should" without evidence.',
              'Popularity — "everyone wants it", "the majority".',
              'Unsupported prediction — "will definitely", "is bound to".',
              'Off-topic — answers a different question (cost when fairness was asked).',
              'Extreme wording — "always", "never", "impossible".',
            ],
          },
          {
            title: 'Apply FREES to test',
            body: 'Run Factual, Relevant, Entire, Emotionless, Sensible on each option. A trap option fails on at least one letter; the strongest passes all five.',
          },
          {
            kind: 'mini',
            prompt: 'Argument: "We should keep the policy because everyone supports it." Which trap?',
            options: [
              'Popularity.',
              'Causation/correlation.',
              'Off-topic.',
            ],
            correctIndex: 0,
            explanation: 'Common-view-is-proof is the popularity trap. Even if true, popularity does not establish that the policy is the right call.',
          },
          {
            kind: 'mini',
            prompt: 'Argument: "We should change the rules because they always fail." Which trap?',
            options: [
              'Extreme wording — "always" is too absolute.',
              'Emotional appeal.',
              'Popularity.',
            ],
            correctIndex: 0,
            explanation: '"Always fail" is a sweeping claim ("every single time") that evidence rarely supports. Watch for "always", "never", "impossible" as quick weak-argument tells.',
          },
        ],
      },
      {
        id: 'timing-strategy',
        title: 'Timing strategy for DM',
        subtitle: 'Build a timing plan that reflects actual question difficulty.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'timer',
        practiceLabel: 'Try a timed DM set',
        practiceRoute: 'timed',
        steps: [
          {
            title: 'The benchmark',
            body: 'Roughly 63 seconds per question (37 minutes ÷ 35 questions). Treat it as a benchmark, not a target — argument and Venn questions are often faster, while logical puzzles and Yes/No sets need longer.',
          },
          {
            title: 'Suggested target times',
            bullets: [
              'Strongest argument / assumption — 30-45 sec; run FREES, take the clear winner.',
              'Venn diagrams — 30-60 sec; sketch quickly, do not overwork.',
              'Probability — 45-60 sec; decide add vs multiply immediately.',
              'Syllogism / interpretation 5-statement sets — 60-90 sec; treat as high-value.',
              'Logic puzzles — 60-90 sec; build a grid early; flag if stuck.',
            ],
          },
          {
            title: 'The two-pass method',
            bullets: [
              'Pass one — take clean marks quickly. Flag time sinks and move on.',
              'Pass two — return to flagged items where setup time might now pay off.',
              'If a puzzle is going nowhere after 90 seconds, guess strategically, flag, and move on.',
            ],
          },
          {
            kind: 'mini',
            prompt: '90 seconds into a five-clue logic puzzle, no progress. Best move?',
            options: [
              'Spend two more minutes — you are close.',
              'Best-guess the surviving option, flag, move on.',
              'Skip without answering.',
            ],
            correctIndex: 1,
            explanation: 'Decision threshold reached. Best-guess (no negative marking), flag for pass two, and reclaim time for easier marks elsewhere.',
          },
          {
            kind: 'mini',
            prompt: 'You have one minute left and one unanswered five-statement Yes/No set plus two flagged single MCQs. What first?',
            options: [
              'Revisit the flagged MCQs.',
              'Lock in the Yes/No set — it is worth twice as many marks.',
              'Skip them all to avoid mistakes.',
            ],
            correctIndex: 1,
            explanation: 'Five-statement sets are 2 marks vs 1 for an MCQ. If you can answer or guess quickly, that is better than leaving a 2-mark item blank. Cover the high-value item first.',
          },
        ],
      },
      {
        id: 'five-statement-tactics',
        title: 'Five-statement Yes/No tactics',
        subtitle: 'Maximise marks on the highest-value question type in DM.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'check',
        steps: [
          {
            kind: 'rule',
            title: 'The scoring structure',
            body: 'Five-statement sets are worth 2 marks for all five correct, 1 mark for four correct, 0 marks for three or fewer. There is no negative marking.',
          },
          {
            title: 'Three rules that follow from this',
            bullets: [
              'Prioritise these items under time pressure — 2 marks beats 1.',
              'Do not let one tough statement burn the whole question — lock in the easy four to protect the partial mark.',
              'Never leave any statement blank — guessing costs nothing, while a blank guarantees 0 marks.',
            ],
          },
          {
            kind: 'checklist',
            title: 'Triage checklist for 5-statement sets',
            items: [
              'Read all five statements before answering any.',
              'Solve the easy ones first to lock in the partial-credit floor.',
              'Stick to UCAT\'s exact meanings of "all", "some" and "none".',
              'Judge each statement against the same premise set, fresh each time.',
              'Never leave a statement blank.',
            ],
          },
          {
            kind: 'mini',
            prompt: 'Statements 1-4 are clear; statement 5 is murky and you are out of time. What do you do?',
            options: [
              'Leave statement 5 blank.',
              'Lock in your four answers and guess statement 5.',
              'Restart all five.',
            ],
            correctIndex: 1,
            explanation: '4/5 = 1 mark. Locking in the four certain answers protects that mark; guessing the fifth costs nothing and might bump you to 5/5.',
          },
          {
            kind: 'mini',
            prompt: 'Five statements, none clear, ten seconds left. Best play?',
            options: [
              'Leave them all blank.',
              'Answer all five quickly using the best pattern or hunch you have.',
              'Pick a different answer for each by gut feel.',
            ],
            correctIndex: 1,
            explanation: 'A blank guarantees 0 marks. Filling all five gives you a real chance at 1 or 2 marks and there is no penalty for being wrong, so always answer every statement — even when you are guessing.',
          },
        ],
      },
    ],
  },
  {
    id: 'apply',
    title: 'Apply It',
    description: 'Switch quickly between question types and carry one short pre-question checklist.',
    icon: 'shield-heart',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'mini-dm-drill',
        title: 'Mini DM drill',
        subtitle: 'Switch quickly between question types and apply the right method without hesitation.',
        duration: '5 min',
        type: 'Apply',
        icon: 'flame',
        steps: [
          {
            title: 'Why mixed practice matters',
            body: 'Real DM sections move fast between syllogisms, Venns, puzzles, and arguments. The biggest skill gain after lessons is the speed at which you identify the type and switch methods.',
          },
          {
            kind: 'mini',
            prompt: 'Syllogism: "All mentors are graduates. Some graduates are volunteers." Does "Some mentors are volunteers" follow?',
            options: ['Yes', 'No'],
            correctIndex: 1,
            explanation: 'The graduates who are volunteers may not be the same graduates who are mentors. The conclusion is possible but not forced.',
          },
          {
            kind: 'mini',
            prompt: 'Data: 18 play tennis, 14 play badminton, 6 play both. How many play at least one?',
            options: ['20', '26', '38'],
            correctIndex: 1,
            explanation: 'Inclusion-exclusion: 18 + 14 − 6 = 26. Adding the 6 in instead of subtracting gives the trap 38.',
          },
          {
            kind: 'mini',
            prompt: 'Mia, Noor, and Theo are first/second/third in a queue. Mia is before Noor. Theo is after Noor. Who is first?',
            options: ['Mia', 'Noor', 'Theo'],
            correctIndex: 0,
            explanation: 'Mia < Noor < Theo. The unique ordering is Mia, Noor, Theo — Mia must be first.',
          },
          {
            kind: 'mini',
            prompt: '"Should the library stay open later during exam week?" Which is the strongest argument?',
            options: [
              'Yes — libraries are important.',
              'Yes — occupancy data show desk shortages peak after 6 p.m. during revision periods.',
              'No — some students prefer mornings.',
              'Yes — it would feel fair.',
            ],
            correctIndex: 1,
            explanation: 'Option B passes all five FREES tests: factual (data cited), relevant (exam-week demand), entire (addresses the later-opening mechanism and the outcome), emotionless, sensible. The others lean on importance, narrow preference, or feeling.',
          },
          {
            kind: 'tip',
            title: 'Quick review habits',
            body: 'After each mini set, ask: did I identify the type fast enough? Did I represent the information clearly? Did I choose logic over instinct? Tag missed items with the matching trap label.',
          },
        ],
      },
      {
        id: 'final-checklist',
        title: 'Final DM checklist',
        subtitle: 'One short pre-question checklist to carry into every DM item.',
        duration: '3 min',
        type: 'Apply',
        icon: 'check',
        steps: [
          {
            kind: 'checklist',
            title: 'Pre-question checklist (TRACE)',
            items: [
              'Type — did I identify the question type before solving?',
              'Read — did I focus on the actual task before drowning in detail?',
              'Anchor — did I hold the key facts mentally when the logic was short, and only sketch when the question was too tangled to track in my head?',
              'Conclude — am I answering from the representation, not from instinct?',
              'Eliminate — did I check exact wording (all, some, only if, must, strongest)?',
            ],
          },
          {
            kind: 'checklist',
            title: 'The wording check',
            items: [
              'Did I separate "must be true" from "could be true"?',
              'Did I use UCAT\'s exact meanings ("some" = more than zero, less than all)?',
              'Did I avoid reversing "all" or "if-then"?',
            ],
          },
          {
            kind: 'checklist',
            title: 'Five-statement Yes/No discipline',
            items: [
              'Did I prioritise these items (they are 2-mark)?',
              'Did I lock in the easy four before fighting with the fifth?',
              'Did I ever leave a statement blank? (No.)',
            ],
          },
          {
            kind: 'rule',
            title: 'The timing rule',
            body: 'Fast questions fund slow questions. Take clean marks quickly. Flag stubborn puzzles. Return with time left. Never leave blanks.',
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
export const ESTIMATED_TIME = '126 min';

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
  const accent = colors[UCAT_SECTIONS.DM.accentKey] ?? colors.cyan ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon={UCAT_SECTIONS.DM.icon} accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{UCAT_SECTIONS.DM.title.toUpperCase()}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Decision Making lessons.</Text>
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
            ? 'You have finished the DM learning pathway.'
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
    if (!lesson) return;
    const alreadyCompleted = completedIds.includes(lessonId);
    const isLocked = !alreadyCompleted && lesson.number > nextLesson.number;
    if (isLocked) return;
    if (!isPro && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('LearnDMLesson', { lessonId });
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
