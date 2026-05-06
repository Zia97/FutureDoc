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
import { SJ_LEARN_STORAGE_KEY } from '../../data/learn/learningStorageKeys';

const PREMIUM_LESSON_TYPES = new Set(['Strategy', 'Traps', 'Worked example']);

export const STORAGE_KEY = SJ_LEARN_STORAGE_KEY;

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Orientation: what SJ tests, how scenarios are built, how to use this app to learn, what good judgement looks like, and the default method you will apply to every question.',
    icon: 'book',
    accentKey: 'mint',
    lessons: [
      {
        id: 'what-sj-tests',
        title: 'What SJ is testing',
        subtitle: 'Welcome to SJ. Before any technique, learn what this section is really checking — and what it is not.',
        duration: '4 min',
        type: 'Foundation',
        icon: 'stethoscope',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This is the very first lesson of the SJ pathway. By the end of it you will know what Situational Judgement actually tests, why it sits at the end of the UCAT (University Clinical Aptitude Test), and how its banded scoring is different from the other sections. No scenarios yet — just orientation.',
          },
          {
            title: 'What SJ is in one sentence',
            body: 'Situational Judgement (SJ) tests whether you can respond to realistic situations in a way a safe, professional medical student or junior doctor would — judging actions and considerations against established professional standards, not against your personal preferences.',
          },
          {
            title: 'What SJ is NOT testing',
            bullets: [
              'It does not test medical or clinical knowledge — anatomy, pharmacology, and procedures are out of scope.',
              'It is not asking what you would personally do.',
              'It is not asking for the kindest answer or the strictest answer — it asks for the professional answer.',
              'It does not assume you have placement experience to draw on.',
            ],
          },
          {
            title: 'What SJ IS checking',
            bullets: [
              'Patient safety — putting safety above convenience, hierarchy, or awkwardness.',
              'Honesty and integrity — admitting mistakes, telling the truth, no cover-ups.',
              'Confidentiality — knowing when patient information can and cannot be shared.',
              'Professional communication — empathy, clarity, and respectful conduct.',
              'Knowing when to act, when to escalate, and when to step back.',
            ],
          },
          {
            kind: 'rule',
            title: 'The big idea',
            body: 'In SJ, the question is never "what would I do?" — it is always "what should a safe, professional medical student or junior doctor do here?" Your answer is compared to a model answer set by medical educators, professionals, and the public, not to your personal opinion.',
          },
          {
            kind: 'mini',
            prompt: 'A scenario describes a colleague being short-tempered with a patient who is asking lots of questions. SJ is checking whether you can:',
            options: [
              'Diagnose the colleague\'s mood disorder.',
              'Apply professional standards of communication and respect.',
              'Recall a specific professional-guidance paragraph from memory.',
              'Choose the answer you personally would pick.',
            ],
            correctIndex: 1,
            explanation: 'SJ tests whether you apply professional standards — not clinical knowledge, not memorised paragraphs, and not personal preference. The right answer matches what a safe, professional clinician should consider appropriate.',
          },
          {
            kind: 'mini',
            prompt: 'A scenario asks how appropriate a particular action is. The action involves a treatment you have never heard of. What should you do?',
            options: [
              'Skip the question — you cannot answer without clinical knowledge.',
              'Treat the clinical content as background and judge the professional behaviour itself.',
              'Guess at random because you do not have the medical facts.',
              'Pick the option that mentions the most medical terms.',
            ],
            correctIndex: 1,
            explanation: 'SJ never requires medical knowledge. The clinical detail is background — you judge the behaviour, not the medicine. If the question is about confidentiality, honesty, escalation, or communication, those are the things being tested.',
          },
          {
            kind: 'tip',
            title: 'Why SJ feels different from VR, DM, and QR',
            body: 'The other UCAT sections — Verbal Reasoning (VR), Decision Making (DM), and Quantitative Reasoning (QR) — reward fast logic on facts. SJ rewards the kind of judgement you cannot get from speed alone. The "right" answer is rarely the most obvious one; it is the one a safe professional would choose after thinking carefully about safety, honesty, and role.',
          },
        ],
      },
      {
        id: 'how-sj-scenarios-work',
        title: 'How SJ scenarios work',
        subtitle: 'Before you practise, know the format — how many questions, how long you have, the answer scales, and how partial credit works.',
        duration: '5 min',
        type: 'Foundation',
        icon: 'list',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Now that you know what SJ is checking, this lesson shows you how an individual question is built. SJ has its own answer scales and its own scoring quirks — once you know the shape of the section, you will avoid the most common rookie mistakes.',
          },
          {
            title: 'The section at a glance',
            bullets: [
              '69 questions in 26 minutes — about 22 to 23 seconds per question on average.',
              'SJ is the LAST section of the UCAT — you take it after Verbal Reasoning, Decision Making, and Quantitative Reasoning.',
              'There is no negative marking; an unanswered question simply gets zero.',
              'SJ is reported as a band, not a numerical score. Band 1 is strongest, Band 4 is weakest, and the band is reported separately from the combined score for the other three UCAT sections.',
            ],
          },
          {
            title: 'Three question formats you will see',
            bullets: [
              'Appropriateness questions — rate an action ("How appropriate is X?") on a four-point scale. Covered in its own lesson in the Question Types module.',
              'Importance questions — rate a factor or consideration ("How important is Y?") on a four-point scale. Also covered in its own lesson in the Question Types module.',
              'Most/least appropriate (drag-and-drop) — pick the most appropriate action and the least appropriate from a small set. These award no partial credit, and they are covered alongside scoring in the "How partial credit works" lesson.',
            ],
          },
          {
            title: 'How a scenario is built',
            body: 'Each scenario gives you a few sentences setting up a situation in a hospital, clinic, or university. Below it, you are asked to rate one or more specific actions or factors related to that situation. You judge each option on its own — they are not competing with each other.',
          },
          {
            title: 'How partial credit works',
            body: 'Full marks if your answer matches the model answer. Partial marks if your answer is one position away on the scale (for example, model answer is "Very appropriate" and you choose "Appropriate, but not ideal"). Two positions away usually scores nothing. Drag-and-drop questions are different — they award no partial credit, so both selections must be correct.',
          },
          {
            kind: 'rule',
            title: 'Get the half right first',
            body: 'Because partial credit only flows to the neighbour rating, the single most important step is deciding whether the answer sits in the appropriate half or the inappropriate half. For importance questions, make the same split between the high-importance half ("Very important" or "Important") and the low-importance half ("Of minor importance" or "Not important at all"). Get the half right and you guarantee at least partial credit.',
          },
          {
            kind: 'mini',
            prompt: 'You have 26 minutes for 69 questions. What does this imply about pacing?',
            options: [
              'You should aim for exactly 22 seconds on every question.',
              'SJ is generally less time-pressured than QR — read carefully but do not stall on close calls.',
              'You should read every scenario twice before answering.',
              'You should skim the scenario in 5 seconds to save time.',
            ],
            correctIndex: 1,
            explanation: 'SJ is the least time-pressured of the four sections. Easy items take 10-15 seconds; close calls take 30-40. The bigger risk is rushing through a half-read scenario, not running out of time.',
          },
          {
            kind: 'mini',
            prompt: 'A model answer is "A very appropriate thing to do". You select "Appropriate, but not ideal". What happens?',
            options: [
              'You score full marks.',
              'You score partial credit.',
              'You score zero.',
              'You score negative marks.',
            ],
            correctIndex: 1,
            explanation: 'Neighbour ratings get partial credit. Two positions out (e.g. picking "Inappropriate, but not awful") usually scores nothing, and there is no negative marking.',
          },
          {
            kind: 'tip',
            title: 'Why "no negative marking" still matters',
            body: 'If a question is eating time, make a confident guess on the half you believe in and move on. A blank scores zero; a guess at least has a chance of full or partial credit.',
          },
        ],
      },
      {
        id: 'how-this-app-helps',
        title: 'How this app will help you learn SJ',
        subtitle: 'A quick tour of the practice loop on this app — including the AI tutor that lives inside every SJ question.',
        duration: '3 min',
        type: 'Foundation',
        icon: 'brain',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A short walkthrough of how to learn and practise SJ on this app, plus a live demo of the AI tutor — the feature that turns every wrong answer into a one-on-one teaching session.',
          },
          {
            title: 'When to try questions',
            body: 'Once you have finished the lessons, or if you want to skip ahead and try questions now, answer a practice scenario and check whether your rating matched the model answer for the right reasons. If you were wrong, guessed, or still feel unsure, ask the AI tutor follow-up questions on that exact scenario.',
          },
          {
            title: 'Why static explanations may not be enough',
            body: 'A written explanation tells you what the model answer was. It does not always tell you why your specific rating fell short, which principle you missed, or how you should think about a similar scenario next time. That is what the AI tutor is for — it sees the scenario, the question, your rating, and the model rating, and answers your follow-ups in plain English.',
          },
          {
            kind: 'rule',
            title: 'Where the tutor lives',
            body: 'After you submit any practice scenario, look for the "Teach Me" button at the bottom of the explanation box. That opens the AI tutor for this exact question, with the scenario and your answer already loaded.',
          },
          {
            title: 'What you can ask',
            body: 'Ask any UCAT Situational Judgement question about the scenario, the rating, or your reasoning. The tutor knows the full context of the question you are on, so you can ask directly, for example: "Why is this not Very appropriate?" or "What principle did I miss?"',
          },
          {
            kind: 'demoLaunch',
            title: 'Try it now on a sample SJ scenario',
            body: 'Tap the button below to open one short SJ scenario. Rate the action, then look for the highlighted "Teach Me" button to chat with the tutor.',
            buttonLabel: 'Try a sample scenario with the AI tutor',
            note: 'This demo is free — it does not use any of your AI credits.',
          },
          {
            kind: 'tip',
            title: 'Free vs Premium AI tutor access',
            body: 'Free users get 5 AI tutor messages in total across the app. Premium gives unlimited access on every question. SJ scenarios reward different reasoning to VR/DM/QR, so the tutor is especially useful for unpacking close calls.',
          },
          {
            kind: 'rule',
            title: 'Use the tutor as soon as something is unclear',
            body: 'Do not power through a confusing rating hoping it clicks later. Ask. The whole point of the tutor is to convert a confused minute into a learning minute.',
          },
        ],
      },
      {
        id: 'good-sj-judgement',
        title: 'What good SJ judgement looks like',
        subtitle: 'The four practical priorities and the four ethical pillars that underpin every strong SJ answer.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'shield-heart',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Strong SJ answers are not random good intentions — they reflect a small set of priorities that medical educators agree on. This lesson gives you the practical four-priority list and maps it onto the four classical pillars of medical ethics, so you have a single mental framework to fall back on.',
          },
          {
            title: 'The four practical priorities',
            bullets: [
              'Patient safety first — if safety is at risk, act.',
              'Honesty, always — cover-ups are nearly always wrong.',
              'Respect autonomy and dignity — patients have the right to information and to choose.',
              'Stay within your competence — ask for help when you are out of your depth.',
            ],
          },
          {
            title: 'The four pillars of medical ethics',
            bullets: [
              'Autonomy — patients have the right to make their own decisions about their care.',
              'Beneficence — act in the patient\'s best interest.',
              'Non-maleficence — do no harm.',
              'Justice — treat people fairly and use resources responsibly.',
            ],
          },
          {
            title: 'How the two lists fit together',
            body: 'The pillars give you the underlying ethical framework; the priorities are the practical version you actually use during the test. Most SJ scenarios test one or two of the pillars — patient safety usually maps onto non-maleficence and beneficence, honesty maps onto autonomy (informed consent and trust), and competence touches non-maleficence.',
          },
          {
            kind: 'rule',
            title: 'When the pillars compete',
            body: 'When two principles point in different directions, patient safety and honesty almost always win in SJ. An action that respects autonomy but allows clear harm to a patient is rated lower than one that protects the patient and explains why.',
          },
          {
            kind: 'mini',
            prompt: 'A patient with capacity refuses a treatment that would help them but does not put them at acute risk. What does respecting autonomy look like?',
            options: [
              'Quietly delay the conversation in the hope the patient changes their mind.',
              'Explain the risks and benefits clearly, ensure the decision is informed, and document it.',
              'Ignore the refusal because the treatment is in their best interest.',
              'Tell the family without the patient\'s consent so they can persuade the patient.',
            ],
            correctIndex: 1,
            explanation: 'Autonomy means a patient with capacity can choose to refuse, even when clinicians disagree. The professional response is to make sure the decision is informed and to document it — not to override, delay, or bring in family without consent.',
          },
          {
            kind: 'mini',
            prompt: 'A scenario forces a choice between mild patient embarrassment and a potential safety risk. Which pillar takes priority?',
            options: [
              'Autonomy.',
              'Non-maleficence (do no harm) — safety wins.',
              'Justice.',
              'It depends on the patient\'s preference at the time.',
            ],
            correctIndex: 1,
            explanation: 'Patient safety overrides personal embarrassment, convenience, and even courtesy. Non-maleficence is the dominant pillar whenever a real safety risk is on the table.',
          },
          {
            kind: 'tip',
            title: 'Why this list speeds you up',
            body: 'If you can identify which pillar (or which combination) the scenario is testing, the right answer usually follows quickly. Most close calls collapse once you ask "which priority does this action actually serve?".',
          },
        ],
      },
      {
        id: 'core-sj-method',
        title: 'The core SJ method',
        subtitle: 'A repeatable five-step process you will apply to every SJ question, before any specific theme or trap.',
        duration: '6 min',
        type: 'Core method',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Most students do not lose marks because the principles are hard — they lose marks because they do not have a default sequence to follow on every question. This lesson teaches the five-step routine that should run in your head from question one onwards.',
          },
          {
            title: 'The five steps in order',
            bullets: [
              'Read the scenario actively and identify the core issue (safety, honesty, confidentiality, teamwork, role).',
              'Read the question carefully — is it Appropriateness or Importance? Whose viewpoint is it asking from?',
              'Stick to what is given — no extra motives, no imagined backstory, no assumed seniority that the scenario never stated.',
              'Apply professional principles — what keeps the patient safe, what is honest, what stays in your role.',
              'Decide the half of the scale first, then refine to the specific rating.',
            ],
          },
          {
            title: 'Step 1 in practice — spotting the core issue',
            bullets: [
              'Patient safety at risk? That is the dominant theme.',
              'A mistake or possible cover-up? This is honesty / duty of candour.',
              'Sharing patient information? This is confidentiality.',
              'A colleague behaving poorly? This is teamwork and professionalism.',
              'A task beyond your training? This is role and competence.',
            ],
          },
          {
            title: 'Step 2 in practice — reading the question',
            body: 'The wording of the question controls the answer. "How appropriate is X?" rates an action. "How important is Y?" rates a factor. Switching scales by accident is one of the easiest ways to lose marks. Note who is the subject of the action too — sometimes it is you, sometimes a colleague, sometimes a senior.',
          },
          {
            title: 'Step 3 in practice — sticking to what is given',
            body: 'If the scenario does not say a doctor is senior, do not assume they are. If it does not say a patient is intoxicated, do not infer it. Inventing facts misleads you to the wrong rating, and SJ writers know which assumptions to plant.',
          },
          {
            title: 'Step 4 in practice — applying professional principles',
            body: 'Now use the principle that fits the core issue: protect patients from harm, be honest, keep information private, stay within your role, communicate respectfully, and escalate when the situation is too serious or outside your competence. The framework module that comes next expands each of these into its own lesson — this step is where that knowledge plugs into the method.',
          },
          {
            title: 'Step 5 in practice — half first, then refine',
            bullets: [
              'Decide quickly whether the answer is in the upper half or lower half of the relevant scale.',
              'Getting the half right secures partial credit even if you pick the wrong sub-rating inside it.',
              'Then choose between the two ratings inside that half using the tie-breaker (covered next).',
            ],
          },
          {
            kind: 'rule',
            title: 'The tie-breaker for close calls',
            body: 'When you have correctly identified the half, default to the STRONGER option ("Very appropriate" or "Very inappropriate") UNLESS the action helps but does not fully solve the issue, or there is an obvious better alternative the action ignores. The older advice "only pick very if you are certain" is wrong — it costs marks.',
          },
          {
            kind: 'mini',
            prompt: 'You have decided an action is in the appropriate half but cannot tell whether it is "Very appropriate" or "Appropriate, but not ideal". Apply the tie-breaker default. Which should you pick if you cannot see a flaw in the action?',
            options: [
              '"Appropriate, but not ideal" — play it safe.',
              '"A very appropriate thing to do" — default to the stronger option when you cannot see a flaw.',
              'Skip the question.',
              'Pick at random.',
            ],
            correctIndex: 1,
            explanation: 'If you have correctly identified the half and cannot see a specific flaw or a better alternative, the stronger option is statistically the more common correct answer. Soften only when there is a specific reason to.',
          },
          {
            kind: 'checklist',
            title: 'My core SJ method',
            items: [
              'Read the scenario, identify the core issue.',
              'Read the question — Appropriateness or Importance? Whose viewpoint?',
              'Stick to what is actually stated.',
              'Apply professional principles (safety, honesty, role, escalation).',
              'Pick the half first, then refine using the tie-breaker default.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'framework',
    title: 'The SJ Judgement Framework',
    description: 'Eight professional principles that apply to almost every SJ scenario. Internalise these and the questions get faster.',
    icon: 'shield-heart',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'patient-safety-first',
        title: 'Patient safety comes first',
        subtitle: 'The single most important principle in SJ. Safety overrides convenience, hierarchy, and personal awkwardness — every time.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'shield-heart',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'This is the single highest-leverage principle in SJ. Most scenarios where a patient may come to harm collapse onto this one rule. Learn it first; everything else stacks on top of it.',
          },
          {
            title: 'The principle',
            body: 'When a patient might be harmed, the response should not be passive, dismissive, or unnecessarily delayed. Actions that protect patients are usually rated very appropriate or very important; actions that ignore or downplay danger are very inappropriate.',
          },
          {
            title: 'Signs the scenario is a safety scenario',
            bullets: [
              'Risk of immediate physical harm to a patient.',
              'A medication, dosage, equipment, or procedure error in progress.',
              'Someone working while impaired (alcohol, drugs, exhaustion, mental ill-health).',
              'Equipment or process failures that could affect patients.',
              'A patient being missed, ignored, or left without care when they need it.',
            ],
          },
          {
            kind: 'rule',
            title: 'When in doubt, ask',
            body: '"Which option best safeguards the patient?" That single question resolves most safety scenarios faster than any framework.',
          },
          {
            kind: 'trap',
            title: 'Safety overrides hierarchy',
            body: 'A common trap is staying silent because someone senior is involved. Hierarchy never overrides patient safety. Speaking up respectfully to a senior who is doing something dangerous is appropriate, even very appropriate. Saying nothing is very inappropriate.',
          },
          {
            kind: 'mini',
            prompt: 'A consultant (senior doctor) prescribes a medication you have just learned the patient is allergic to. The consultant is busy and senior. How appropriate is it to interrupt them politely and mention the allergy before they leave?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Patient safety wins. Interrupting politely with safety-critical information is exactly the right move, regardless of seniority. Staying silent because the consultant is senior is the trap.',
          },
          {
            kind: 'tip',
            title: 'Why this principle is so heavily weighted',
            body: 'GMC (General Medical Council) guidance explicitly requires doctors to act promptly if patient safety may be seriously compromised. SJ writers translate that directly: actions that protect patients land at the top of the scale, actions that downplay risk land at the bottom.',
          },
        ],
      },
      {
        id: 'honesty-integrity',
        title: 'Honesty and integrity',
        subtitle: 'How SJ handles mistakes, white lies, and the duty of candour.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'check',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'After patient safety, honesty is the principle SJ rewards most consistently. Once you internalise that "white lies" do not exist in SJ, you will avoid a whole category of wrong answers.',
          },
          {
            title: 'The principle',
            body: 'Whether the mistake is yours or someone else\'s, the right move is almost always to be truthful and put it right. Covering up errors, falsifying records, lying about events, or ignoring dishonesty is almost always inappropriate, even when the intent is to protect someone.',
          },
          {
            title: 'The duty of candour',
            body: 'When something has gone wrong, the GMC duty of candour requires you to be open with patients, put matters right where possible, apologise, and explain fully and promptly. Apologising is not an admission of legal liability — it is part of being open.',
          },
          {
            title: 'Strong honesty responses usually involve',
            bullets: [
              'Owning up to your own mistakes promptly.',
              'Seeking advice from a senior when unsure.',
              'Correcting incorrect information as soon as it is spotted.',
              'Speaking to a colleague before reporting them, where appropriate.',
              'Escalating dishonesty that risks patient care.',
            ],
          },
          {
            kind: 'rule',
            title: 'When in doubt, choose honesty',
            body: 'A "white lie" that protects yourself or a colleague is still a lie in SJ terms. Honesty almost always rates higher than convenience.',
          },
          {
            kind: 'mini',
            prompt: 'You realise you wrote down the wrong dose in a patient\'s notes after the round has ended. The patient is unaffected so far. How appropriate is it to quietly correct the entry without telling anyone?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 2,
            explanation: 'Quietly correcting the entry fixes the data, but it hides a problem you created and removes the team\'s ability to check whether anyone acted on the wrong number. That hidden cover-up puts it in the inappropriate half. It is not "very inappropriate" because the data is corrected; if you had also flagged the error to the team, the same correction would have been appropriate.',
          },
          {
            kind: 'tip',
            title: 'Why dishonesty is treated so firmly',
            body: 'Medicine relies on accurate records and trust. A dishonest entry now sets a precedent that makes future safety incidents harder to prevent. SJ tests this directly because the profession does.',
          },
        ],
      },
      {
        id: 'confidentiality-privacy',
        title: 'Confidentiality',
        subtitle: 'When patient information should be kept private and the narrow exceptions where it can be shared.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Confidentiality scenarios are common in SJ and have predictable correct answers. This lesson teaches the default (do not share) and the small list of exceptions where sharing is allowed.',
          },
          {
            title: 'The default',
            body: 'Patient information is confidential by default — and the duty continues even after the patient has died. Do not share patient details with people who do not need to know them, in person, by phone, by message, or on social media.',
          },
          {
            title: 'When confidentiality bends',
            bullets: [
              'The patient gives consent.',
              'It is required by law or court order.',
              'It is in the public interest because failing to disclose risks death or serious harm to others.',
              'Sharing only with team members who genuinely need to know for the patient\'s care.',
            ],
          },
          {
            title: 'Common breaches the test punishes',
            bullets: [
              'Discussing patients in lifts, cafes, or on public transport.',
              'Posting about a case on social media, even with no name attached.',
              'Sharing details with friends or family members who ask.',
              'Letting unauthorised people see notes or screens.',
            ],
          },
          {
            kind: 'rule',
            title: 'Default to privacy',
            body: 'If sharing the information is not strictly necessary for the patient\'s care or one of the narrow exceptions above, the default position is not to share it.',
          },
          {
            kind: 'mini',
            prompt: 'A patient\'s adult daughter calls the ward and asks for an update on their mother. The patient is alert and able to communicate. What is the most appropriate first step?',
            options: [
              'Give a brief update so the family is reassured.',
              'Refuse all information without exception.',
              'Check whether the patient consents to family being given updates, then act on that.',
              'Tell the daughter to call back later.',
            ],
            correctIndex: 2,
            explanation: 'Confidentiality starts from the patient. If the patient has capacity and can consent (or refuse), that consent is the gate. Assuming family are entitled to information is the trap.',
          },
          {
            kind: 'trap',
            title: 'Social media is never a grey area',
            body: 'Posting a case online, even without names, is almost always rated very inappropriate. There is no benefit to the patient\'s care and a real risk of identification.',
          },
        ],
      },
      {
        id: 'communication-empathy',
        title: 'Communication and empathy',
        subtitle: 'How SJ rewards empathy combined with action — and why being kind is not enough on its own.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'notes',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Many students assume the kindest answer is the right answer. SJ rewards empathy paired with action — being kind without addressing the issue is incomplete.',
          },
          {
            title: 'The principle',
            body: 'Strong responses listen, acknowledge feelings, explain clearly, and adapt to the person in front of them. Snapping, dismissing, using jargon, or rushing through a difficult conversation are inappropriate. So is being so gentle that the actual issue (safety, honesty, escalation) gets ignored.',
          },
          {
            title: 'Hallmarks of strong communication',
            bullets: [
              'Listening before judging.',
              'Asking clarifying questions where useful.',
              'Speaking privately when the topic is sensitive.',
              'Avoiding public confrontation or shaming.',
              'Being honest without being harsh.',
            ],
          },
          {
            kind: 'rule',
            title: 'Empathy plus action',
            body: 'A response that is dismissive, blunt, or shaming usually drops in rating, even when its underlying point is correct. A response that is empathic but ignores a clear safety or honesty issue also drops.',
          },
          {
            kind: 'mini',
            prompt: 'A patient is anxious about an upcoming test result and asks you "honestly, am I going to be OK?" You are a medical student and do not have the result yet. How appropriate is it to say "try not to worry, everything will be fine"?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'This is dishonest reassurance. You do not know they will be fine, and pretending you do is a lie that could damage trust if the result is bad. The empathic-and-honest version would be to acknowledge the anxiety and explain that the doctor will discuss the result with them as soon as it is available.',
          },
          {
            kind: 'tip',
            title: 'Why false reassurance is treated as dishonesty',
            body: 'Even with good intentions, telling a patient something is fine when you do not know is rated as dishonesty in SJ. Honesty paired with compassion almost always beats false comfort.',
          },
        ],
      },
      {
        id: 'escalation-seeking-help',
        title: 'Escalation and seeking help',
        subtitle: 'Knowing when to handle something yourself, when to talk to the colleague directly, and when to escalate to a senior.',
        duration: '6 min',
        type: 'Core principle',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Escalation is one of the most-tested principles in SJ. Students lose marks at both extremes — escalating too aggressively for small issues and staying silent on serious ones. This lesson teaches the dial.',
          },
          {
            title: 'The principle',
            body: 'Asking for help is professional, not a sign of failure. The skill is knowing what you can deal with directly, what needs a quiet conversation with the person involved, and what needs a senior. The widely-applied rule is: try to resolve issues locally first, escalate when local resolution fails or when patient safety is at immediate risk.',
          },
          {
            title: 'Usually escalate when',
            bullets: [
              'Patient safety is at immediate risk.',
              'The behaviour is repeated despite previous discussion.',
              'There is dishonesty, bullying, harassment, or serious misconduct.',
              'The issue is beyond your competence or authority.',
              'The matter has legal or safeguarding implications.',
            ],
          },
          {
            title: 'Usually handle directly when',
            bullets: [
              'It is a minor misunderstanding.',
              'A quiet conversation could resolve it.',
              'No-one is at risk.',
              'You can act safely within your role.',
            ],
          },
          {
            kind: 'rule',
            title: 'You do not need proof to raise a concern',
            body: 'GMC Raising Concerns guidance is clear — you can justify raising a concern based on reasonable belief, even if you turn out to be mistaken. You are not required to investigate or prove anything before flagging.',
          },
          {
            kind: 'mini',
            prompt: 'A colleague has been mildly grumpy with the team for one shift. How appropriate is it to phone the consultant out of hours to report this immediately?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 2,
            explanation: 'A one-off grumpy shift is the kind of issue that can be handled with a private conversation — or simply left for now. Phoning a consultant out of hours is disproportionate and ignores the local-resolution principle.',
          },
          {
            kind: 'mini',
            prompt: 'A colleague seems impaired and is about to see a patient. How appropriate is it to escalate to the consultant immediately?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Patient safety is at immediate risk and the issue is beyond a quiet word. Escalation is exactly right. The local-resolution principle does NOT apply once a patient may come to harm.',
          },
          {
            kind: 'tip',
            title: 'Where students lose marks',
            body: 'Reaching for the consultant on minor interpersonal issues, and staying silent on serious safety issues. Both are rated poorly. Match the response to the seriousness of the issue.',
          },
        ],
      },
      {
        id: 'role-limits',
        title: 'Knowing your role and limits',
        subtitle: 'Why acting beyond your training is rated as unsafe, even when you happen to be right.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'person-cog',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A common failure mode in SJ is the confident student who does too much. This lesson explains why acting outside your role is rated as unsafe regardless of whether your judgement is correct, and what the in-role version of "helping" looks like.',
          },
          {
            title: 'The principle',
            body: 'GMC guidance is explicit: recognise and work within the limits of your competence. As a medical student you should not prescribe, perform unsupervised procedures, or make final clinical decisions. Junior staff have similar limits compared to seniors.',
          },
          {
            title: 'Strong in-role responses',
            bullets: [
              'Being honest about what you do and do not know.',
              'Asking for supervision when uncertain.',
              'Referring decisions upward when out of your remit.',
              'Not pretending to be more senior than you are.',
              'Flagging concerns to a senior who CAN act, instead of acting yourself.',
            ],
          },
          {
            kind: 'rule',
            title: 'Right answer, wrong role',
            body: 'Confidently making a clinical decision you are not trained for is unsafe, even if you happen to be right. SJ marks this as inappropriate regardless of outcome.',
          },
          {
            kind: 'mini',
            prompt: 'A patient asks you, a medical student, what dose of their medication they should take when they go home. How appropriate is it to give them the dose you remember the doctor saying earlier?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Giving prescribing advice is not within a medical student\'s role. The right move is to find the doctor and have them confirm the dose, even if your memory is correct. Acting confidently outside role is unsafe.',
          },
          {
            kind: 'tip',
            title: 'Why "ask the supervising doctor" is so often correct',
            body: 'For student scenarios specifically, "flag this to the supervising doctor" or "ask the registrar or another supervising doctor" is frequently the most appropriate option. SJ writers know that students sometimes try to over-help, and they reward those who escalate within their role.',
          },
        ],
      },
      {
        id: 'teamwork-professionalism',
        title: 'Teamwork and professionalism',
        subtitle: 'Handling colleagues fairly without ignoring poor behaviour. Rules around bullying, harassment, and discrimination are firmer than they used to be.',
        duration: '6 min',
        type: 'Core principle',
        icon: 'list',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'GMC guidance on collegial behaviour was strengthened in 2024. Scenarios involving bullying, harassment, or sexually inappropriate behaviour now have unambiguous expected answers. This lesson covers the new ground.',
          },
          {
            title: 'The principle',
            body: 'Good responses keep the team functioning while still taking issues seriously. Gossip, public humiliation, and unnecessary conflict almost never help. Loyalty does not require silence.',
          },
          {
            title: 'Strong patterns',
            bullets: [
              'Speak to the colleague privately first when the issue is small.',
              'Avoid discussing colleagues with people uninvolved in the issue.',
              'Escalate to a supervisor when the behaviour is serious or repeated.',
              'Stay respectful even when you disagree.',
            ],
          },
          {
            title: 'GMC 2024 guidance — what changed',
            bullets: [
              'Treat colleagues with kindness, courtesy, and respect.',
              'Do not bully, discriminate against, or harass anyone.',
              'Do not act in a sexual way towards colleagues with the effect or purpose of causing offence, embarrassment, or distress.',
              'If you witness inappropriate behaviour, check in with the affected person, challenge the behaviour, or report it.',
              'Leaders must support staff and act on concerns promptly.',
            ],
          },
          {
            kind: 'rule',
            title: 'Silence is rarely an option now',
            body: 'For scenarios involving sexually inappropriate, bullying, or discriminatory behaviour, doing nothing because someone is senior is rated very inappropriate. The expected actions are: check on the affected person, challenge the behaviour, or report.',
          },
          {
            kind: 'mini',
            prompt: 'You witness a colleague making sexually inappropriate comments to a more junior team member. The senior colleague is well-liked by the team. How appropriate is it to say nothing in order to keep the peace?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Silence in this situation is rated very inappropriate. The expected action is to check on the affected person, challenge the behaviour, or report it. Hierarchy and popularity do not change that.',
          },
          {
            kind: 'tip',
            title: 'Why this category got firmer',
            body: 'Medicine has had public reckonings about workplace behaviour. SJ now reflects the strengthened GMC stance, so scenarios that used to feel grey have clearer expected answers.',
          },
        ],
      },
      {
        id: 'boundaries-conflicts-interest',
        title: 'Personal boundaries and conflicts of interest',
        subtitle: 'When relationships, gifts, and feelings should make you step back rather than step in.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Boundary scenarios appear regularly: friends or family as patients, gifts, romantic interest, financial ties. The expected answer is almost always declare, refuse, or step back.',
          },
          {
            title: 'The principle',
            body: 'Conflicts of interest — gifts, friends as patients, financial ties, romantic feelings — should generally be declared or refused. Mixing personal life with professional decisions is rated poorly; maintaining boundaries earns top marks.',
          },
          {
            title: 'Where boundaries get tested',
            bullets: [
              'Gifts from patients or families.',
              'Personal relationships with patients or colleagues.',
              'A friend or family member asking for medical advice or treatment.',
              'Social media contact with patients.',
              'Personal feelings (attraction, dislike) affecting clinical decisions.',
            ],
          },
          {
            title: 'Strong patterns',
            bullets: [
              'Politely decline gifts that could be seen as influencing care.',
              'Avoid treating people you have a personal relationship with where possible.',
              'Keep professional and personal communication separate.',
              'Declare conflicts of interest where appropriate.',
            ],
          },
          {
            kind: 'rule',
            title: 'Sexual boundaries are not grey',
            body: 'Sexual or improper emotional relationships with patients (or those close to them) are explicitly prohibited. SJ scenarios involving this are not grey — they are rated firmly.',
          },
          {
            kind: 'mini',
            prompt: 'A patient you have treated several times offers you a small gift "as a thank-you". How appropriate is it to politely decline and explain that you cannot accept gifts that could be seen as influencing care?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Polite decline plus explanation is the textbook answer. It maintains the boundary, preserves the relationship, and respects the patient. Accepting can blur professional boundaries.',
          },
          {
            kind: 'tip',
            title: 'When in doubt, ask the eyebrow test',
            body: 'If a colleague would raise an eyebrow at the situation, treat it as a boundary issue and respond accordingly.',
          },
        ],
      },
    ],
  },

  {
    id: 'types',
    title: 'Question Types',
    description: 'Master the two SJ scales (Appropriateness and Importance), how to choose between close ratings, and how partial credit works.',
    icon: 'list',
    accentKey: 'blue',
    lessons: [
      {
        id: 'appropriateness-questions',
        title: 'Appropriateness questions',
        subtitle: 'Learn how to rate whether an action is a good response to a scenario.',
        duration: '6 min',
        type: 'Question type',
        icon: 'check',
        practiceLabel: 'Practise SJ scenarios',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Appropriateness questions are the most common SJ format. This lesson teaches the four-point scale, what each rating actually means, and how to choose between them.',
          },
          {
            title: 'What you are rating',
            body: 'Appropriateness asks whether the specific action is a good response to the scenario. You are NOT asked whether the action is the best of the four options — each option is rated in its own right, against the situation.',
          },
          {
            title: 'The four-point scale (exact wording)',
            bullets: [
              'A very appropriate thing to do — the action is a complete, well-judged response to the situation.',
              'Appropriate, but not ideal — the action is reasonable and helps, but does not fully solve the problem or there is a better approach.',
              'Inappropriate, but not awful — the action is not right and may have flaws, but does not make things significantly worse.',
              'A very inappropriate thing to do — the action should not be done and could actively harm the situation.',
            ],
          },
          {
            title: 'How to choose',
            bullets: [
              'Start with safety, honesty, and confidentiality — does the action protect or violate these?',
              'Check whether the action stays within the person\'s role.',
              'Check whether it is proportionate to the issue.',
              'Then judge how well it actually handles the situation.',
            ],
          },
          {
            kind: 'rule',
            title: 'Judge effect on the core issue',
            body: 'Ask: does this action solve the issue, partly solve it, miss the point, or worsen it? That maps directly onto the four ratings.',
          },
          {
            kind: 'mini',
            prompt: 'A colleague has been late repeatedly. How appropriate is it to speak to them privately to ask if everything is OK?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Speaking privately, expressing concern, and trying local resolution first is the textbook strong response. There is no better alternative the action skips.',
          },
          {
            kind: 'tip',
            title: 'The middle ratings exist for a reason',
            body: 'An action can be appropriate without being ideal. It can be inappropriate without being a disaster. Most close-call scenarios live in the two middle ratings.',
          },
        ],
      },
      {
        id: 'importance-questions',
        title: 'Importance questions',
        subtitle: 'Learn how to judge whether a consideration matters in a decision.',
        duration: '6 min',
        type: 'Question type',
        icon: 'flag',
        practiceLabel: 'Practise SJ scenarios',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Importance questions ask you to weigh whether a factor SHOULD influence the decision. They use a different scale to appropriateness — using the wrong scale is a common way to lose marks.',
          },
          {
            title: 'What you are rating',
            body: 'Importance asks whether a factor or consideration should influence the decision in this scenario. You are not asked what to do — just whether this consideration matters when working out what to do.',
          },
          {
            title: 'The four-point scale (exact wording)',
            bullets: [
              'Very important — essential. Ignoring it would compromise the outcome.',
              'Important — significant; should influence the decision but is not critical.',
              'Of minor importance — slightly relevant; could be noted, but missing it would not damage the outcome.',
              'Not important at all — irrelevant; should not influence the decision.',
            ],
          },
          {
            title: 'How to choose',
            bullets: [
              'Ask: does this factor change what the right response should be?',
              'Factors involving safety, honesty, or confidentiality usually rate high.',
              'Personal feelings, embarrassment, and convenience usually rate low.',
              'Irrelevant facts are not important at all.',
            ],
          },
          {
            kind: 'rule',
            title: 'Importance vs Appropriateness',
            body: 'Importance is not the same as appropriateness. A factor can be very important even though it is not an action at all. Always check the wording before answering.',
          },
          {
            kind: 'mini',
            prompt: 'Scenario: a colleague makes a medication error. Factor: "the colleague\'s personal embarrassment about being corrected." How important is this factor in the decision about whether to raise the issue?',
            options: [
              'Very important.',
              'Important.',
              'Of minor importance.',
              'Not important at all.',
            ],
            correctIndex: 3,
            explanation: 'Embarrassment matters in HOW you raise the issue (privately, kindly), but not in WHETHER you raise it. It should not influence the decision to raise a safety issue. Patient safety and honesty are unaffected by it.',
          },
          {
            kind: 'tip',
            title: 'A useful split',
            body: 'Patient safety, honesty, and core professional standards usually fall under "Very important". Personal feelings, minor inconveniences, and protocol annoyances are usually "Of minor importance" or "Not important at all". The middle "Important" rating is for genuinely relevant but non-critical factors.',
          },
        ],
      },
      {
        id: 'appropriate-vs-important',
        title: 'Appropriate vs Important — the key difference',
        subtitle: 'One of the easiest places to lose marks. The two scales are not interchangeable.',
        duration: '5 min',
        type: 'Question type',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Many students lose marks by accidentally rating an action as "important" or rating a consideration as "appropriate". This lesson hard-wires the difference.',
          },
          {
            title: 'Two different questions',
            bullets: [
              'Appropriateness asks: is this ACTION a good thing to DO?',
              'Importance asks: does this FACTOR matter when DECIDING what to do?',
            ],
          },
          {
            title: 'Mini example',
            body: 'Scenario: a colleague seems unwell on a busy shift.\n\nFactor: "Whether the colleague is safe to keep working."\n\nThis factor is very IMPORTANT to consider. It is not itself an action — so rating it on the appropriateness scale would be a category mistake.',
          },
          {
            title: 'Common confusion',
            body: 'An action cannot be "important" and a factor cannot be "appropriate" in this exam. The wording controls the scale. If the question says "How appropriate…?" use the appropriateness scale. If it says "How important…?" use the importance scale.',
          },
          {
            kind: 'rule',
            title: 'Read the question stem before answering',
            body: 'Before you read the option, identify whether you are being asked about an action or a consideration. The wording of the question controls the scale you use.',
          },
          {
            kind: 'mini',
            prompt: 'The question reads: "How important is it to consider whether the patient consents before sharing their information with their family?" Which scale do you use?',
            options: [
              'The appropriateness scale (Very appropriate to Very inappropriate).',
              'The importance scale (Very important to Not important at all).',
              'A yes/no scale.',
              'It does not matter, the scales are equivalent.',
            ],
            correctIndex: 1,
            explanation: 'The word "important" tells you to use the importance scale. The factor here is patient consent — and yes, in this case it would rate "Very important". But the scale you use is fixed by the wording of the question stem.',
          },
          {
            kind: 'tip',
            title: 'Why this trap is so common',
            body: 'Under time pressure, students start applying their answer before they finish reading the question. Force yourself to identify "is this an action or a factor?" before you start rating.',
          },
        ],
      },
      {
        id: 'close-ratings',
        title: 'How to choose between close ratings',
        subtitle: 'Use the half-the-scale-first technique, then apply the tie-breaker default.',
        duration: '7 min',
        type: 'Strategy',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'The hardest SJ choices are between neighbouring ratings. This lesson gives you two tools: the half-first technique to lock in partial credit, and the tie-breaker default to refine within the half.',
          },
          {
            title: 'Step 1 — half first',
            body: 'Decide quickly whether the answer is broadly in the upper half or lower half of the relevant scale: appropriate vs inappropriate, or high importance vs low importance. Getting the half right is half the battle — it puts you in line for partial credit even if you pick the wrong sub-rating within the half.',
          },
          {
            title: 'Tests for the upper half (appropriateness)',
            bullets: [
              'Very appropriate: addresses the main issue and has no real downsides.',
              'Appropriate but not ideal: addresses the issue but is incomplete, slightly off, or could be done better.',
            ],
          },
          {
            title: 'Tests for the lower half (appropriateness)',
            bullets: [
              'Inappropriate but not awful: misses the main issue or is poorly judged, but does not cause active harm.',
              'Very inappropriate: is unsafe, dishonest, breaches confidentiality, or makes the situation clearly worse.',
            ],
          },
          {
            title: 'Tests for the importance scale',
            bullets: [
              'Very important vs Important — if leaving the factor out would endanger the patient or breach ethics, it is very important. If it just refines the decision, it is important.',
              'Of minor importance vs Not important at all — "not at all" means truly irrelevant. "Minor" means it has a small but real bearing.',
            ],
          },
          {
            kind: 'rule',
            title: 'The tie-breaker default',
            body: 'Once you have correctly identified the half, default to the STRONGER option ("very appropriate" or "very inappropriate") UNLESS the action helps but does not fully solve the issue, or there is an obvious better alternative the action ignores. The "play it safe" instinct toward the milder option is wrong — it costs marks.',
          },
          {
            kind: 'mini',
            prompt: 'You have decided an action is in the inappropriate half. It is dishonest and breaches confidentiality. Apply the tie-breaker. Which sub-rating should you pick?',
            options: [
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
              'Important.',
              'Not important at all.',
            ],
            correctIndex: 1,
            explanation: 'Active dishonesty plus confidentiality breach is exactly what "very inappropriate" describes. Defaulting to the milder rating because you want to play it safe loses marks.',
          },
          {
            kind: 'tip',
            title: 'When to soften',
            body: 'Soften from the stronger option only when (a) the action helps but is incomplete, OR (b) there is a clearly better alternative the action skips. If neither is true, stay with the strong option.',
          },
        ],
      },
      {
        id: 'partial-credit',
        title: 'How partial credit works',
        subtitle: 'Why getting the half right is so valuable — and why drag-and-drop questions are different.',
        duration: '4 min',
        type: 'Question type',
        icon: 'check',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'SJ\'s scoring is more forgiving than VR/DM/QR — but only if you understand it. This lesson explains how partial credit flows and where it does NOT.',
          },
          {
            title: 'The official rule',
            body: 'You get full marks if your answer matches the correct answer, and partial marks if your answer is close to the correct answer. UCAT does not publicly define "close", but the safest working assumption is that partial marks apply only to answers ONE position away from the correct one.',
          },
          {
            title: 'Worked example',
            body: 'If "very appropriate" is the model answer:\n• You answer "very appropriate" → full marks.\n• You answer "appropriate, but not ideal" → partial marks.\n• You answer "inappropriate, but not awful" → no marks.\n• You answer "very inappropriate" → no marks.',
          },
          {
            kind: 'rule',
            title: 'Drag-and-drop is different',
            body: 'Most/least appropriate drag-and-drop questions award no partial credit at all. You must get BOTH selections right to score, and there is no consolation for being close.',
          },
          {
            kind: 'mini',
            prompt: 'A drag-and-drop question asks for the most appropriate and least appropriate of three options. You correctly identify the most appropriate but not the least. What do you score?',
            options: [
              'Full marks.',
              'Partial marks.',
              'Zero marks.',
              'Negative marks.',
            ],
            correctIndex: 2,
            explanation: 'Drag-and-drop awards no partial credit. Both selections must be correct. There is no negative marking either, so a wrong answer just scores zero, not below.',
          },
          {
            kind: 'tip',
            title: 'Practical implication',
            body: 'On four-point scale questions, getting the half right is genuinely valuable — it converts a coin-flip between two ratings into guaranteed partial credit. On drag-and-drop, focus your time on confirming both selections.',
          },
        ],
      },
    ],
  },

  {
    id: 'themes',
    title: 'Common Scenario Themes',
    description: 'The recurring scenario types in SJ. Internalise the principle for each, then apply it to whatever scenario appears.',
    icon: 'notes',
    accentKey: 'amber',
    lessons: [
      {
        id: 'mistakes-patient-harm',
        title: 'Mistakes and patient harm — duty of candour',
        subtitle: 'How to handle errors, near-misses, and possible harm — yours or a colleague\'s.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'shield-heart',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Mistake-and-harm scenarios are common in SJ, and the expected answers follow a tight pattern. Once you internalise that pattern, this whole category gets easy.',
          },
          {
            title: 'What these scenarios test',
            body: 'You are shown a situation where someone has made an error, forgotten something, given wrong information, or put a patient at potential risk. The judgement is how to respond honestly and safely.',
          },
          {
            title: 'Strong response patterns',
            bullets: [
              'Address the immediate safety risk first.',
              'Be honest about what happened.',
              'Inform the team or supervisor when needed.',
              'Document the issue properly.',
              'Avoid covering up or quietly fixing it without telling anyone.',
            ],
          },
          {
            title: 'Your error vs colleague\'s error',
            body: 'If YOU made the mistake — even a small one — admitting it and correcting it is almost always very appropriate. If a COLLEAGUE made the mistake, address it sensitively in person where possible; escalate if the issue is serious or repeats.',
          },
          {
            kind: 'rule',
            title: 'The duty of candour pattern',
            body: 'Be open with patients, put matters right, apologise, explain. Apologising is not an admission of legal liability.',
          },
          {
            kind: 'trap',
            title: '"Wait and see" is a cover-up in disguise',
            body: 'Waiting to see if your error causes a problem before deciding what to do is functionally identical to ignoring it. SJ rates this as very inappropriate.',
          },
          {
            kind: 'mini',
            prompt: 'You spot that a colleague gave a patient slightly wrong dosage instructions. The patient has not yet acted on the advice. How appropriate is it to mention the correct instructions privately to the colleague so they can put it right?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Private, prompt, in-role, and gives the colleague a chance to fix the issue before it harms the patient. There is no obvious better step.',
          },
        ],
      },
      {
        id: 'confidentiality-scenarios',
        title: 'Confidentiality scenarios',
        subtitle: 'The default is to protect patient information. Recognise the shapes of common breaches.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Confidentiality scenarios are some of the easiest to get right once you know the shapes. This lesson covers the recurring breach patterns and the rare exceptions.',
          },
          {
            title: 'Where confidentiality breaks down',
            bullets: [
              'Discussing patients in public spaces (lifts, cafes, transport).',
              'Posting on social media, even without names.',
              'Sharing details with friends or family who ask.',
              'Letting unauthorised people see notes or screens.',
              'Telling other patients about another patient.',
            ],
          },
          {
            title: 'Strong responses',
            body: 'Keep information within the team that needs it. Move sensitive conversations to private areas. Politely refuse to discuss patients with people who are not entitled to that information. Default to the patient\'s privacy unless an explicit exception applies.',
          },
          {
            title: 'A common variant',
            body: 'A patient\'s family member asks for an update. The right move is generally to check whether the patient consents to family being told, not to assume. The family is not automatically entitled.',
          },
          {
            kind: 'rule',
            title: 'Default to privacy',
            body: 'If sharing the information is not strictly necessary for the patient\'s care, the default position is not to share it.',
          },
          {
            kind: 'mini',
            prompt: 'You are in a hospital lift discussing a tricky case with a colleague. Two members of the public are also in the lift. How appropriate is it to keep talking about the case at low volume?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Public lifts are a classic confidentiality breach. Volume does not change the principle — the conversation should pause until you are in a private setting. SJ rates this firmly.',
          },
        ],
      },
      {
        id: 'colleague-behaviour',
        title: 'Colleague behaviour and bullying',
        subtitle: 'How to respond to rude, unsafe, dishonest, or harassing colleagues. The 2024 GMC update made this category firmer.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'person-cog',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Colleague-behaviour scenarios cover everything from minor rudeness to serious harassment. The right response varies by severity — but for serious issues, the GMC 2024 update narrowed the acceptable range significantly.',
          },
          {
            title: 'The range of cases',
            bullets: [
              'Rude or dismissive behaviour towards patients or staff.',
              'Unsafe practice or shortcuts.',
              'Dishonesty about hours, tasks, or events.',
              'Bullying or undermining behaviour.',
              'Sexual harassment or discrimination.',
              'A colleague who is unwell or visibly struggling.',
            ],
          },
          {
            title: 'For minor issues',
            bullets: [
              'Try a polite, direct private conversation first.',
              'Avoid public confrontation and gossip.',
              'Offer support if the colleague seems to be struggling.',
            ],
          },
          {
            title: 'For serious issues',
            bullets: [
              'Escalation is required — quiet conversations alone are not enough.',
              'Bullying, harassment, sexually inappropriate behaviour, and unsafe practice all fall here.',
              'You do not need proof — reasonable belief is enough to raise a concern.',
            ],
          },
          {
            kind: 'rule',
            title: 'Saying nothing is rarely safe',
            body: 'Since the GMC 2024 update, scenarios involving inappropriate sexual comments, bullying, or discrimination have unambiguous expected answers: don\'t ignore, check on the affected person, challenge or report. Saying nothing because someone is senior is very inappropriate.',
          },
          {
            kind: 'mini',
            prompt: 'A senior is repeatedly belittling a more junior colleague in front of patients. How appropriate is it to ignore it because the senior is well-respected on the team?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'This is bullying behaviour, and ignoring it is exactly what GMC 2024 explicitly rules out. The expected actions are check on the affected person, challenge, or report.',
          },
        ],
      },
      {
        id: 'fitness-to-practise',
        title: 'Fitness to practise — the impaired colleague',
        subtitle: 'Specific high-stakes scenarios where a colleague appears impaired. The expected response pattern is tight.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A specific high-stakes variant of the colleague-behaviour theme: a colleague appears to be working while impaired (drugs, alcohol, exhaustion, mental ill-health). The expected pattern is well-defined.',
          },
          {
            title: 'The principle',
            body: 'Patient interests override professional loyalty. You do not need proof to raise a concern — reasonable belief is enough. The expected pattern is: gather information without confronting publicly, ensure patients are not at immediate risk, escalate to a senior.',
          },
          {
            title: 'The SPIES framework — Seek, Patient safety, Initiative, Escalate, Support',
            bullets: [
              'Seek information — get the facts you can without confrontation.',
              'Patient safety — make sure no patient is at immediate risk.',
              'Initiative — what can you do within your role?',
              'Escalate — to a senior who has the authority to act.',
              'Support — for the colleague going through this.',
            ],
          },
          {
            title: 'What this rules out',
            bullets: [
              'Confronting a possibly-impaired colleague publicly in front of patients.',
              'Promising the colleague you will keep the issue quiet.',
              'Trying to handle a fitness-to-practise concern within your own role as a student or junior doctor.',
              'Waiting until the next shift to see if it happens again.',
            ],
          },
          {
            kind: 'rule',
            title: 'Escalate without delay if a patient is at immediate risk',
            body: 'If the colleague is about to see a patient and you have reasonable belief they are impaired, escalation now is essential. Local-resolution thinking does not apply.',
          },
          {
            kind: 'mini',
            prompt: 'A nurse confides that a junior doctor has been smelling of alcohol on shifts and asks you to "keep it quiet". How appropriate is it to reassure the nurse but escalate the concern to the consultant or appropriate supervisor?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Patient safety overrides loyalty. The student does not have authority to manage a fitness-to-practise issue directly, so escalation to the right senior is the safe, proportionate response. Reassuring the nurse keeps her supported without making promises that could harm patients.',
          },
          {
            kind: 'tip',
            title: 'SPIES is an interview framework that maps onto SJ',
            body: 'SPIES is technically a framework taught for foundation-year interviews, but it maps neatly onto SJ scenarios in this category. If you remember it, fitness-to-practise scenarios become routine.',
          },
        ],
      },
      {
        id: 'academic-professional-integrity',
        title: 'Academic and professional integrity',
        subtitle: 'Cheating, plagiarism, fake attendance, exaggerated CVs. The pattern is firm.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'check',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Integrity scenarios appear regularly. Medicine relies on trust, so SJ treats these issues firmly. This lesson covers the recurring shapes and expected responses.',
          },
          {
            title: 'Common dishonesty patterns',
            bullets: [
              'Cheating in exams or assessments.',
              'Plagiarism in coursework.',
              'Lying about attendance or completed tasks.',
              'Falsifying signatures, documents, or records.',
              'Exaggerating clinical experience or qualifications.',
            ],
          },
          {
            title: 'Why this is high stakes',
            body: 'Medicine relies on trust. Dishonesty in training predicts dishonesty in practice, which puts patients at risk. SJ treats integrity issues firmly because the profession does.',
          },
          {
            title: 'Expected response shape',
            body: 'For most scenarios — speak to the person privately first, then escalate if they do not put it right. The right answer is rarely "ignore", "join in", or "report immediately to the dean before any conversation".',
          },
          {
            kind: 'rule',
            title: 'Be honest about qualifications and experience',
            body: 'Honesty about qualifications and experience is non-negotiable. Helping someone cheat or covering for them is rarely appropriate, even if they are a friend or under pressure.',
          },
          {
            kind: 'mini',
            prompt: 'A classmate asks you to sign their attendance for a teaching session they did not attend, citing a tough personal week. How appropriate is it to politely decline?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 0,
            explanation: 'Falsifying attendance is dishonesty — and SJ treats it firmly. Polite decline is the right response. You can still offer to support the friend in other ways.',
          },
        ],
      },
      {
        id: 'patient-communication-empathy',
        title: 'Patient communication and empathy',
        subtitle: 'Distressed, angry, confused, or refusing patients. Empathy plus clarity, within your role.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'notes',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Patient interaction scenarios are about combining empathy with action. This lesson teaches the recurring shapes and the role-specific limits a medical student or junior doctor must observe.',
          },
          {
            title: 'Common patient situations',
            bullets: [
              'Distressed or upset patients.',
              'Angry or frustrated patients or relatives.',
              'Confused or vulnerable patients.',
              'Embarrassed patients with sensitive issues.',
              'Patients refusing care or asking for inappropriate options.',
            ],
          },
          {
            title: 'Strong response patterns',
            bullets: [
              'Acknowledge how the patient is feeling.',
              'Listen before explaining.',
              'Use clear, plain language — avoid jargon.',
              'Keep calm under pressure.',
              'Involve seniors when needed without abandoning the patient.',
            ],
          },
          {
            kind: 'rule',
            title: 'Lying is almost never appropriate',
            body: 'Even with good intentions, lying to a patient is rated firmly. If they ask something you cannot answer, the right response is usually to acknowledge the question and find someone who can.',
          },
          {
            kind: 'trap',
            title: 'Empathy without role is a trap',
            body: 'A long heart-to-heart that goes beyond your competence can be just as wrong as a brisk dismissal. If the patient asks for clinical opinions you cannot give, flag the distress to the supervising doctor — that IS the empathic answer.',
          },
          {
            kind: 'mini',
            prompt: 'An angry relative is shouting at the front desk because their family member has been waiting for hours. How appropriate is it to dismiss them as "just being difficult" and walk away?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Dismissal almost never improves the situation. The right response is to acknowledge the frustration, explain calmly, and involve a senior if the issue cannot be resolved at your level.',
          },
        ],
      },
      {
        id: 'capacity-consent',
        title: 'Capacity, consent and autonomy',
        subtitle: 'Patients with capacity have the right to choose, even decisions clinicians disagree with.',
        duration: '5 min',
        type: 'Scenario theme',
        icon: 'shield-heart',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Capacity-and-consent scenarios appear regularly and have a clear principle: respect the patient\'s right to choose, ensure the decision is informed, and document. They are NOT testing whether you can persuade.',
          },
          {
            title: 'The principle',
            body: 'Patients with capacity have the right to make decisions about their care, even decisions clinicians disagree with. Your job is to ensure they have the information they need to choose, not to override.',
          },
          {
            title: 'For under-16s — the Gillick competence rule',
            body: 'Gillick competence is a UK legal principle: a child under 16 with sufficient understanding can consent to their own treatment, even without parental involvement. SJ may probe whether you respect this principle without abandoning safety.',
          },
          {
            title: 'Strong responses',
            bullets: [
              'Explain the risks and benefits clearly.',
              'Ensure the decision is informed.',
              'Document the conversation properly.',
              'Do not pressure or override.',
              'Escalate if you genuinely think the patient lacks capacity to decide.',
            ],
          },
          {
            kind: 'rule',
            title: 'Disagreement is not the same as incapacity',
            body: 'A patient with capacity who refuses treatment is exercising autonomy. They are not refusing because they lack understanding — they are refusing because they have weighed up the trade-offs and reached a different conclusion to the clinical team.',
          },
          {
            kind: 'mini',
            prompt: 'A patient with full capacity refuses a blood transfusion that would help them but is not life-saving. How appropriate is it to call their family without consent so the family can persuade them?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Calling the family without consent breaches confidentiality and tries to override the patient\'s autonomy. Both make this very inappropriate. The right move is to ensure the refusal is informed and documented.',
          },
        ],
      },
      {
        id: 'theme-boundaries',
        title: 'Boundary scenarios in practice',
        subtitle: 'Recognise the recurring boundary shapes — gifts, romantic interest, friend-as-patient, social media.',
        duration: '5 min',
        type: 'Scenario theme',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'You met the core boundary principle earlier in the judgement framework. This lesson covers the recurring scenario shapes so you can recognise them on sight.',
          },
          {
            title: 'Recurring shapes',
            bullets: [
              'A patient gives you a gift — decline politely if it could be seen as influencing care.',
              'A friend or family member asks you to treat them — usually decline and refer to the team.',
              'A patient asks to add you on social media — decline and explain professional boundaries.',
              'You feel attracted to a patient — step back from their care; do not act on it.',
              'A financial relationship affects what you might recommend — declare the conflict.',
            ],
          },
          {
            kind: 'rule',
            title: 'Declare, refuse, or step back',
            body: 'These three moves cover almost every boundary scenario. If you cannot maintain professional distance, the right answer is to disclose to the team and remove yourself from the conflict.',
          },
          {
            kind: 'mini',
            prompt: 'A patient sends you a friend request on Instagram after a successful consultation. How appropriate is it to accept it because you do not want to seem rude?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Mixing social media with patient relationships is a clear boundary issue. Politely declining (or simply not responding) and explaining professional boundaries is the right move. Worry about seeming rude is not enough to override the principle.',
          },
        ],
      },
    ],
  },

  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Even with strong principles, certain patterns trip students up. Recognise the traps and you will rate consistently.',
    icon: 'target',
    accentKey: 'teal',
    lessons: [
      {
        id: 'professional-not-yourself',
        title: 'Answer as a professional, not yourself',
        subtitle: '"What I would do" vs "what should be done". Step into the role before answering.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'person-cog',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'The single most common reason good students lose marks is answering as themselves rather than as the safe-professional version of themselves. This lesson teaches the mental switch.',
          },
          {
            title: 'The right reference point',
            body: 'SJ is not asking what you would personally do. It is asking what a safe, professional medical student or junior doctor should judge as appropriate or important. Mentally step into the role of a calm, honest, patient-centred clinician before answering.',
          },
          {
            title: 'Common personal-opinion mistakes',
            bullets: [
              'Rating an action as appropriate because you would do it.',
              'Rating an action as inappropriate because you find it uncomfortable.',
              'Letting cultural or personal beliefs override patient safety.',
              'Assuming everyone shares your tolerance for risk or confrontation.',
            ],
          },
          {
            kind: 'rule',
            title: 'Rate the response, not the scenario',
            body: 'Sometimes the scenario is upsetting — a rude colleague, a poor patient choice, a friend asking you to break the rules. Don\'t rate the action based on how you feel about the situation. Judge whether the specific action is a good response, not whether the situation itself is fair.',
          },
          {
            kind: 'mini',
            prompt: 'You personally find confrontation difficult. The scenario asks how appropriate it is to politely challenge a colleague who has just made a discriminatory comment. How should your personal preference influence the rating?',
            options: [
              'It should not — rate based on professional standards, not personal preference.',
              'It should — rate it as inappropriate because you would not do it.',
              'It should — rate it as appropriate but not ideal because confrontation is hard.',
              'Skip the question — you cannot answer it.',
            ],
            correctIndex: 0,
            explanation: 'SJ is professional judgement, not personal preference. Politely challenging discriminatory behaviour is exactly the kind of action GMC 2024 expects, regardless of how hard you personally find confrontation.',
          },
          {
            kind: 'tip',
            title: 'A useful self-check',
            body: 'If your answer changes when you imagine a different student answering the same question, you are using personal opinion, not professional judgement.',
          },
        ],
      },
      {
        id: 'local-resolution',
        title: 'Local resolution before escalation',
        subtitle: 'For interpersonal issues without immediate risk, a calm direct conversation usually beats jumping to a senior.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'flag',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'Going straight to a senior, the GMC, or a formal complaint when a quiet conversation would have resolved the issue is one of the most common SJ mistakes. This lesson teaches when to escalate and when to start local.',
          },
          {
            title: 'The principle',
            body: 'For interpersonal issues that don\'t directly threaten patient safety, the best first step is usually a calm, direct conversation with the person involved. Jumping straight to a senior, the GMC, or a formal complaint for something a quick chat could resolve is disproportionate and tends to be rated "Appropriate, but not ideal" at best.',
          },
          {
            kind: 'rule',
            title: 'When safety is at risk, the rule flips',
            body: 'The moment patient safety is at immediate risk, escalate first and talk later. The local-resolution rule never overrides the safety rule (covered in the Patient safety lesson in the framework module).',
          },
          {
            kind: 'mini',
            prompt: 'A team-mate has missed two meetings without apologising. How appropriate is it to file a formal complaint with the head of department as your first action?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 2,
            explanation: 'A formal complaint is hugely disproportionate to two missed meetings. The right first move is a private conversation. The issue is real, so the action is not the worst possible response, but it overshoots the local-resolution principle and sits in the inappropriate half.',
          },
          {
            kind: 'tip',
            title: 'Why this is the most-tested strategy theme',
            body: 'SJ writers know students like the look of "decisive" actions. The trap is dressing up an over-reaction as decisiveness. Match the response to the seriousness of the issue.',
          },
        ],
      },
      {
        id: 'address-root-cause',
        title: 'Address the root cause, not the symptom',
        subtitle: 'Surface-level responses rarely earn the strongest rating. The most appropriate action gets to the source.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'target',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A whole class of "Appropriate, but not ideal" answers comes from actions that handle the symptom but skip the underlying issue. This lesson teaches you to spot them.',
          },
          {
            title: 'The principle',
            body: 'The most appropriate actions get to the source of the problem. A colleague keeps making medication errors? Speaking to them privately about why it is happening often beats simply double-checking their work going forward.',
          },
          {
            title: 'Tell-tale shapes of root-cause responses',
            bullets: [
              'Asking why something is happening.',
              'Offering support if a colleague seems to be struggling.',
              'Fixing a process that allowed the error.',
              'Following up to make sure the underlying issue does not repeat.',
            ],
          },
          {
            kind: 'rule',
            title: 'Reflexive surface-level responses',
            body: 'These usually rate "Appropriate, but not ideal" at best. They help, but they leave the underlying issue alive.',
          },
          {
            kind: 'mini',
            prompt: 'A colleague has made repeated drug-dosing errors over the past month. How appropriate is it to simply double-check their drug entries from now on, without raising the issue with them?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 1,
            explanation: 'Double-checking helps the patient short term, but it does not address why the colleague is making errors (overload? fatigue? a knowledge gap?). The stronger action is a private conversation alongside the safety net of double-checking.',
          },
        ],
      },
      {
        id: 'proportionate-responses',
        title: 'Proportionate responses',
        subtitle: 'Match the response to the seriousness of the issue. Neither overreact nor underreact.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'filter',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A clean way to filter close-call answers: ask whether the response fits the size of the problem. Two extremes lose marks, and the right answer almost always sits between them.',
          },
          {
            title: 'The principle',
            body: 'Strong SJ answers are usually proportionate. A minor misunderstanding rarely needs a formal report. A serious safety or dishonesty issue rarely deserves a quiet word and nothing else.',
          },
          {
            title: 'Signs a response is disproportionate',
            bullets: [
              'Going straight to the most senior person for something minor.',
              'Doing nothing about a clear safety or honesty issue.',
              'Treating a one-off mistake as a long-term character flaw.',
              'Escalating before trying any direct conversation (for non-safety issues).',
            ],
          },
          {
            kind: 'rule',
            title: 'The size test',
            body: 'Patient cold? Offer a blanket. Patient short of breath? Don\'t just offer a blanket. The best answers are usually in between extremes — neither "do nothing" nor "fire everyone".',
          },
          {
            kind: 'trap',
            title: 'Empathy isn\'t always right',
            body: 'Helping someone feel better is not always correct if it sacrifices safety, honesty, or fairness. An action that protects a colleague\'s feelings while leaving a patient at risk is not the empathic answer — it is the wrong answer.',
          },
          {
            kind: 'mini',
            prompt: 'A colleague forgot to attend one teaching session because they had a hospital appointment. How appropriate is it to immediately report them to the dean for repeated absenteeism?',
            options: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
            correctIndex: 3,
            explanation: 'Reporting a one-off absence as "repeated absenteeism" is wildly disproportionate AND inaccurate (the absence is not repeated). The action overshoots and misrepresents the situation.',
          },
        ],
      },
      {
        id: 'reading-exact-wording',
        title: 'Reading the exact wording',
        subtitle: 'A single word can flip the answer. SJ options are written carefully, so you must read them carefully.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'pencil',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'SJ option-writers use specific words to differentiate ratings. Learning which words flip an answer keeps you out of the most preventable mistakes.',
          },
          {
            title: 'Why wording matters',
            body: 'A response that "speaks privately to a colleague" is very different from one that "publicly confronts" them, even if both raise the same issue. SJ writers use these word swaps deliberately to test your attention.',
          },
          {
            title: 'Wording to read carefully',
            bullets: [
              'Immediately confront vs privately discuss.',
              'Ignore vs raise it later.',
              'Report without speaking to anyone vs ask for advice first.',
              'Tell other students vs tell the supervisor.',
              'Always, never, only, secretly, immediately, alone.',
            ],
          },
          {
            kind: 'rule',
            title: 'Re-read the option once more before rating',
            body: 'The same idea can be appropriate or very inappropriate depending on a single word. Build the habit of a final once-over before you commit.',
          },
          {
            kind: 'trap',
            title: 'An action is not a full care plan',
            body: 'When you rate an action, you are rating that specific action. Do not invent extra facts or hidden motives, but do not mark down an otherwise good action just because it does not list every routine follow-up. Rate what the action says and its natural effect.',
          },
          {
            kind: 'trap',
            title: 'Don\'t assume',
            body: 'Use only what the scenario gives you. If it does not say a patient is intoxicated, do not assume they are. If it does not say a colleague is junior, do not read it in. Inventing facts misleads you to wrong answers.',
          },
          {
            kind: 'mini',
            prompt: 'Two options describe the same idea: (A) "Quietly raise the concern with the colleague after the round." (B) "Publicly confront the colleague during the round." Will they get the same rating?',
            options: [
              'Yes, the underlying idea is the same.',
              'No — the wording of "publicly confront" vs "quietly raise after the round" can flip the rating from appropriate to inappropriate.',
              'Yes, both raise the issue so both are appropriate.',
              'You cannot tell without more context.',
            ],
            correctIndex: 1,
            explanation: 'A single word ("publicly", "during the round") can flip the rating. The underlying intent matters less than how the action is described. Read the wording every time.',
          },
        ],
      },
      {
        id: 'pacing-burnout',
        title: 'Pacing and not burning out — SJ comes last',
        subtitle: 'SJ is the last subtest. Fatigue is the real enemy, not the timer.',
        duration: '4 min',
        type: 'Strategy',
        icon: 'timer',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'SJ comes after the other three UCAT sections: VR, DM, and QR. By the time you reach it, you are tired. This lesson teaches the pacing approach that compensates for that fatigue without rushing.',
          },
          {
            title: 'The principle',
            body: 'The questions are not time-pressured the way QR is, so slow your reading down deliberately. Practise full mocks so that the SJ-after-three-other-sections experience is something you have already trained for.',
          },
          {
            title: 'How to pace SJ',
            bullets: [
              'Aim for ~22 seconds per question on average.',
              'Easy items can take 10-15 seconds; close calls 30-45.',
              'A 22-second average means you can spend more on the hard ones if you bank time on the easy ones.',
              'Use the half-first technique to lock in partial credit on close calls fast.',
            ],
          },
          {
            kind: 'rule',
            title: 'Don\'t rush a half-read scenario',
            body: 'The biggest risk in SJ is misreading the scenario because you are tired and pushing through. Slow the read; the time budget is forgiving.',
          },
          {
            kind: 'mini',
            prompt: 'You are ten minutes into the SJ section after completing VR, DM, and QR. You are tired. What is the best pacing approach?',
            options: [
              'Sprint to make up time you do not need to make up.',
              'Slow your reading deliberately and rely on the half-first technique on close calls.',
              'Skip every third question to save time.',
              'Always pick the strongest option to finish faster.',
            ],
            correctIndex: 1,
            explanation: 'SJ has a forgiving time budget. The risk is fatigue-driven misreading, not running out of time. Slow the read; lean on the half-first technique to lock in partial credit when you cannot decide.',
          },
        ],
      },
    ],
  },

  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'Apply the method on real SJ scenarios. Each worked example walks you through the reasoning step by step.',
    icon: 'notes',
    accentKey: 'purple',
    lessons: [
      {
        id: 'appropriateness-worked-example',
        title: 'Appropriateness — group project conflict',
        subtitle: 'See how to rate an action when it helps but is not the strongest option available.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'check',
        steps: [
          {
            title: 'What this worked example covers',
            body: 'A classic SJ pattern: an action that is reasonable and not harmful, but a clearly stronger alternative exists. Most students rate it "Very appropriate" by mistake. The lesson is to recognise when "Appropriate, but not ideal" is actually correct.',
          },
          {
            title: 'How to use this worked example',
            body: 'Tap below to open the scenario. Read it carefully, choose your rating from the four options, then study the explanation — that is where the method is taught.',
          },
          {
            kind: 'workedExampleLaunch',
            title: 'Open the worked example',
            body: 'A short university scenario about an unfair group project. Rate the action, then read the breakdown.',
            buttonLabel: 'Open worked example',
          },
          {
            title: 'What you should take away',
            bullets: [
              'Local resolution beats premature escalation.',
              'When a clearly better alternative exists, drop from "Very appropriate" to "Appropriate, but not ideal".',
              'A side conversation that excludes the person at the centre of the issue is rarely the strongest move.',
            ],
          },
        ],
      },
      {
        id: 'importance-worked-example',
        title: 'Importance — wrong dose about to be given',
        subtitle: 'See how to rate a factor on the importance scale when patient safety is the dominant issue.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'flag',
        steps: [
          {
            title: 'What this worked example covers',
            body: 'A pure importance scenario where one factor (patient risk) clearly outranks all the others. The lesson is to recognise the signature of "Very important" and not soften the rating.',
          },
          {
            title: 'How to use this worked example',
            body: 'Tap below to open the scenario. Rate the factor on the importance scale, then read the explanation — it walks through how to triangulate "Very important" using the safety-first principle.',
          },
          {
            kind: 'workedExampleLaunch',
            title: 'Open the worked example',
            body: 'A ward scenario about a possible medication error. Rate the factor, then study the breakdown.',
            buttonLabel: 'Open worked example',
          },
          {
            title: 'What you should take away',
            bullets: [
              'Patient welfare always outranks comfort, embarrassment, or efficiency.',
              'Factors that determine whether a patient is harmed are almost always "Very important".',
              'Do not soften the rating because the implied action feels socially uncomfortable.',
            ],
          },
        ],
      },
      {
        id: 'professionalism-worked-example',
        title: 'Appropriateness — admitting your own error',
        subtitle: 'See how the duty of candour produces the strongest rating, and why "wait and see" is so badly rated.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'shield-heart',
        steps: [
          {
            title: 'What this worked example covers',
            body: 'A duty-of-candour scenario where the textbook response (transparency plus correction) is "Very appropriate", and the tempting "fix it quietly" alternative is in the inappropriate half. The lesson is to recognise that hiding a known error always drops the rating.',
          },
          {
            title: 'How to use this worked example',
            body: 'Tap below to open the scenario. Rate the action, then study the explanation — it covers why "wait and see" and "quietly correct" both fail the duty of candour test.',
          },
          {
            kind: 'workedExampleLaunch',
            title: 'Open the worked example',
            body: 'A documentation-error scenario testing the duty of candour. Rate the action, then read the breakdown.',
            buttonLabel: 'Open worked example',
          },
          {
            title: 'What you should take away',
            bullets: [
              'When you have made a mistake, transparency plus correction is "Very appropriate".',
              'Anything less than transparency, even if you fix the mistake, is in the inappropriate half.',
              '"Wait and see" is functionally identical to ignoring the error.',
            ],
          },
        ],
      },
      {
        id: 'close-call-worked-example',
        title: 'Close call — the anxious patient',
        subtitle: 'See how to decide between "Very appropriate" and "Appropriate, but not ideal" when both feel reasonable.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'target',
        steps: [
          {
            title: 'What this worked example covers',
            body: 'A close-call scenario where students hesitate between the two upper ratings. The lesson is to apply the tie-breaker default: if the action is honest, kind, in-role, and uses time the student has, default to the strongest rating.',
          },
          {
            title: 'How to use this worked example',
            body: 'Tap below to open the scenario. Rate the action, then read the explanation — it walks through why the lower rating would punish an imagined version of the action rather than the action described.',
          },
          {
            kind: 'workedExampleLaunch',
            title: 'Open the worked example',
            body: 'A clinic scenario about an anxious patient. Rate the action, then study the breakdown.',
            buttonLabel: 'Open worked example',
          },
          {
            title: 'What you should take away',
            bullets: [
              'When the action is honest, kind, in-role, and uses time the student has, default to "Very appropriate".',
              'Do not drop to "Appropriate, but not ideal" just because you can imagine a different version of the action going wrong.',
              'SJ rates the action described, not the worst-case version of it.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'apply',
    title: 'Apply It',
    description: 'Turn the learning into practice. Run a short mixed drill, then move into the full practice flow.',
    icon: 'pencil',
    accentKey: 'mint',
    lessons: [
      {
        id: 'mini-sj-drill',
        title: 'Mini SJ drill',
        subtitle: 'Try a short mixed drill before full practice. Diagnose which principle you missed when you get one wrong.',
        duration: '8 min',
        type: 'Mini drill',
        icon: 'pencil',
        practiceLabel: 'Practise SJ scenarios',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'You have worked through the full SJ pathway. Before you commit to long practice sessions, try a small mixed drill — and use it to diagnose which principles you reach for least naturally.',
          },
          {
            title: 'How to use this drill',
            body: 'Open the practice flow and attempt a short mixed set of scenarios. Aim for around five questions covering both appropriateness and importance, with at least one close-call.',
          },
          {
            title: 'Recommended mix',
            bullets: [
              'Two appropriateness scenarios.',
              'Two importance scenarios.',
              'One close-call where two ratings feel similar.',
            ],
          },
          {
            title: 'After the drill',
            body: 'For each question you got wrong, identify which principle you missed: safety, honesty, confidentiality, role, escalation, proportion, or wording. That label is what to revise. The pattern of mistakes is more useful than the score.',
          },
          {
            kind: 'rule',
            title: 'Use the AI tutor on every wrong answer',
            body: 'When a rating surprises you, ask the tutor "what principle did I miss?" That single question converts a confusing wrong answer into a learning point you will remember.',
          },
        ],
      },
      {
        id: 'final-sj-checklist',
        title: 'Final SJ checklist',
        subtitle: 'Run through the checklist before any answer. When the answers are yes, you are applying the method.',
        duration: '4 min',
        type: 'Checklist',
        icon: 'check',
        steps: [
          {
            title: 'What this lesson covers',
            body: 'A short final checklist to run through before locking in any SJ answer. With practice, this loop becomes automatic.',
          },
          {
            kind: 'checklist',
            title: 'Before answering each question',
            items: [
              'Have I identified the main issue (safety, ethics, role, communication)?',
              'Have I made patient safety the top priority where it applies?',
              'Am I using only the information given — no invented backstory?',
              'Am I rating the specific action or factor asked, not the whole scenario?',
              'Does my answer respect the role and competence of the person in the scenario?',
              'Is my response proportionate — not overreacting, not underreacting?',
              'Have I picked the correct half of the scale before fine-tuning?',
              'Am I defaulting to the stronger option in that half unless something tells me to soften?',
              'Am I answering as a professional, not based on my personal feelings?',
            ],
          },
          {
            title: 'You are ready when',
            body: 'You can answer most scenarios without flipping between two ratings, and you can name the principle behind each rating you choose. Move into full practice from here, and use the AI tutor on every wrong answer to lock in the lesson.',
          },
          {
            title: 'One last reminder',
            body: 'Think like a safe, professional clinician — calm, honest, patient-centred, willing to ask for help. Apply the half-the-scale-first technique. Default to the stronger option when the half is clear. Don\'t burn time on questions that won\'t yield — flag and move on.',
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
export const ESTIMATED_TIME = '179 min';

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
  const accent = colors[UCAT_SECTIONS.SJ.accentKey] ?? colors.cyan ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon={UCAT_SECTIONS.SJ.icon} accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>{UCAT_SECTIONS.SJ.title.toUpperCase()}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Situational Judgement lessons.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        Scenarios, response judgement, common traps, and consistent reasoning rules.
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
        label={allComplete ? 'Start SJ Practice' : nextLesson ? `Continue: ${nextLesson.title}` : 'Continue Learning'}
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
  const heroAccent = colors.mint ?? colors.cyan ?? colors.blue;

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
          {allComplete ? 'SJ Learning Complete' : 'Ready to apply it?'}
        </Text>
        <Text style={[styles.practiceText, { color: colors.textSecondary }]}>
          {allComplete
            ? 'You have finished the SJ learning pathway.'
            : 'Open SJ practice when you want to turn a lesson into repetition.'}
        </Text>
        <View style={styles.practiceButtons}>
          <PrimaryButton label="Start SJ Practice" icon="pencil" color={heroAccent} onPress={onPractice} style={styles.practiceButton} />
          <PrimaryButton label="Start Timed SJ Test" icon="timer" color={colors.cyan} variant="outline" onPress={onTimed} style={styles.practiceButton} />
        </View>
      </View>
    </View>
  );
}

export default function SituationalJudgementLearnScreen({ navigation }) {
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
      'Reset SJ progress?',
      'This will clear all your completed lessons in Situational Judgement. This cannot be undone.',
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
    navigation.navigate('SJScenarioList');
  }, [navigation]);

  const openTimedPractice = useCallback(() => {
    navigation.navigate('TimedTestList', { section: 'SJ', title: 'Situational Judgement' });
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
    navigation.navigate('LearnSJLesson', { lessonId });
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
      <AppHeader navigation={navigation} title="Learn SJ" />

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
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Your SJ Path</Text>
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
                accessibilityLabel="Reset SJ progress"
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
