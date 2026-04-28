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

export const STORAGE_KEY = '@futuredoc/sj_learning_completed_lessons';

export const MODULES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'Understand what SJ tests and how to approach scenarios.',
    icon: 'book',
    accentKey: 'mint',
    lessons: [
      {
        id: 'what-sj-tests',
        title: 'What SJ tests',
        subtitle: 'Understand what Situational Judgement is really assessing.',
        duration: '4 min',
        type: 'Introduction',
        icon: 'stethoscope',
        steps: [
          {
            title: 'Judgement, not knowledge',
            body: 'Situational Judgement does not test medical facts or clinical knowledge. It tests how you respond to realistic situations involving patients, colleagues, rules, communication, and professionalism.',
          },
          {
            title: 'What SJ is really checking',
            bullets: [
              'Patient safety awareness.',
              'Honesty and integrity.',
              'Confidentiality and respect for privacy.',
              'Professional communication.',
              'Knowing when to escalate or seek help.',
              'Working within your role and competence.',
            ],
          },
          {
            title: 'Quick check',
            body: 'You are being assessed as a future safe clinician. Answer as a thoughtful professional, not as the strictest or kindest version of yourself.',
          },
        ],
      },
      {
        id: 'how-sj-scenarios-work',
        title: 'How SJ scenarios work',
        subtitle: 'Learn how scenarios, actions, and considerations are presented.',
        duration: '5 min',
        type: 'Introduction',
        icon: 'list',
        steps: [
          {
            title: 'How a scenario is built',
            body: 'Each SJ question gives you a short situation and the people involved. You then judge a set of actions or considerations one at a time, based only on what the scenario actually says.',
          },
          {
            title: 'Two main answer formats',
            bullets: [
              'Appropriateness: rate how good an action is as a response.',
              'Importance: rate whether a factor matters when deciding what to do.',
              'You judge each option independently, not in competition with the others.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Answer the scenario in front of you. Do not invent extra context or assume facts the question never gave.',
          },
        ],
      },
      {
        id: 'core-sj-method',
        title: 'The core SJ method',
        subtitle: 'Use a repeatable method for every SJ question.',
        duration: '6 min',
        type: 'Core method',
        icon: 'target',
        practiceLabel: 'Practise SJ scenarios',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'Read the scenario carefully',
            body: 'Read once for the situation, then again for the people involved and what the question is actually asking. Small wording often changes what counts as appropriate.',
          },
          {
            title: 'The seven-step routine',
            bullets: [
              'Read the scenario carefully.',
              'Identify the main issue.',
              'Identify who is affected and who has responsibility.',
              'Look for safety, honesty, confidentiality, communication, and escalation issues.',
              'Judge the option directly against the scenario.',
              'Avoid adding assumptions.',
              'Pick the best rating, not just a generally nice-sounding answer.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If you cannot point to part of the scenario that justifies your rating, you are inserting your own opinion instead of judging the option.',
          },
        ],
      },
      {
        id: 'good-sj-judgement',
        title: 'What good SJ judgement looks like',
        subtitle: 'Learn the qualities of a strong SJ answer.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'shield-heart',
        steps: [
          {
            title: 'The qualities of a strong response',
            bullets: [
              'Safe: it does not put patients or staff at risk.',
              'Honest: it does not cover up, lie, or mislead.',
              'Respectful: it treats people with dignity.',
              'Professional: it fits the role and the setting.',
              'Proportionate: it matches the seriousness of the issue.',
              'Patient-centred: it considers the patient first.',
              'Within role: it does not exceed your competence.',
              'Willing to escalate: it raises serious concerns appropriately.',
            ],
          },
          {
            title: 'Why this matters',
            body: 'SJ rewards balanced answers. Responses that are too passive miss safety issues. Responses that are too harsh or extreme overshoot. Strong answers sit between these extremes.',
          },
          {
            title: 'Quick check',
            body: 'Ask: would a safe, professional future clinician do this? If you cannot say yes confidently, the rating should drop.',
          },
        ],
      },
    ],
  },
  {
    id: 'framework',
    title: 'The SJ Judgement Framework',
    description: 'Learn the professional principles that apply across most SJ questions.',
    icon: 'shield-heart',
    accentKey: 'cyan',
    lessons: [
      {
        id: 'patient-safety-first',
        title: 'Patient safety comes first',
        subtitle: 'Understand why safety usually takes priority.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'shield-heart',
        steps: [
          {
            title: 'Safety is the top priority',
            body: 'When a patient might be harmed, the response should not be passive, dismissive, or unnecessarily delayed. Safety usually outranks loyalty to colleagues, embarrassment, or convenience.',
          },
          {
            title: 'Signs a safety issue is present',
            bullets: [
              'Risk of immediate physical harm.',
              'A medication, dosage, or procedure error.',
              'Someone working while impaired or unwell.',
              'Equipment or process failures that could affect patients.',
              'A patient being missed, ignored, or left without care.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If a response leaves a possible safety issue unaddressed, it cannot be very appropriate, no matter how kind or polite it sounds.',
          },
        ],
      },
      {
        id: 'honesty-integrity',
        title: 'Honesty and integrity',
        subtitle: 'Learn how SJ handles mistakes, honesty, and trust.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'check',
        steps: [
          {
            title: 'Honesty is non-negotiable',
            body: 'Covering up errors, falsifying records, lying about events, or ignoring dishonest behaviour is almost always inappropriate, even when the intent is to protect someone.',
          },
          {
            title: 'Strong responses usually involve',
            bullets: [
              'Owning up to your own mistakes.',
              'Seeking advice from a senior when unsure.',
              'Correcting incorrect information promptly.',
              'Speaking to a colleague before reporting them where appropriate.',
              'Escalating dishonesty that risks patient care.',
            ],
          },
          {
            title: 'Quick check',
            body: 'A "white lie" that protects yourself or a colleague is still a lie in SJ terms. Honesty almost always rates higher than convenience.',
          },
        ],
      },
      {
        id: 'confidentiality-privacy',
        title: 'Confidentiality and privacy',
        subtitle: 'Learn when information should and should not be shared.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'filter',
        steps: [
          {
            title: 'Default: do not share',
            body: 'Patient information should not be shared casually, in public, online, or with people who do not need to know. Family, friends, and other patients are usually not entitled to clinical details.',
          },
          {
            title: 'When confidentiality bends',
            bullets: [
              'Serious risk of harm to the patient or others.',
              'A legal requirement to share.',
              'Sharing only with the team members who need to know.',
              'Always proportionate, never gossip.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Sharing identifiable patient details on social media, in lifts, in cafes, or with friends is almost always very inappropriate, regardless of intent.',
          },
        ],
      },
      {
        id: 'communication-empathy',
        title: 'Communication and empathy',
        subtitle: 'Use respectful communication without ignoring the issue.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'notes',
        steps: [
          {
            title: 'Respect plus action',
            body: 'Good SJ responses combine empathy with action. Being kind without addressing the issue is incomplete. Addressing the issue rudely is also incomplete.',
          },
          {
            title: 'Hallmarks of strong communication',
            bullets: [
              'Listening before judging.',
              'Asking clarifying questions where useful.',
              'Speaking privately when the topic is sensitive.',
              'Avoiding public confrontation.',
              'Being honest without being harsh.',
            ],
          },
          {
            title: 'Quick check',
            body: 'A response that is dismissive, blunt, or shaming usually drops in rating, even when its underlying point is correct.',
          },
        ],
      },
      {
        id: 'escalation-seeking-help',
        title: 'Escalation and seeking help',
        subtitle: 'Know when to act directly and when to involve someone senior.',
        duration: '6 min',
        type: 'Core principle',
        icon: 'flag',
        steps: [
          {
            title: 'Escalation is judgement, not weakness',
            body: 'Asking for help is professional, not a sign of failure. The skill is knowing what you can deal with directly and what needs a supervisor, tutor, or senior clinician.',
          },
          {
            title: 'Usually escalate when',
            bullets: [
              'Patient safety is at risk.',
              'The behaviour is repeated despite previous discussion.',
              'There is dishonesty, bullying, or serious misconduct.',
              'The issue is beyond your competence.',
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
            title: 'Quick check',
            body: 'Going straight to the most senior person for a small issue is over-escalation. Staying silent on a serious issue is under-escalation. Both lose marks.',
          },
        ],
      },
      {
        id: 'role-limits',
        title: 'Knowing your role and limits',
        subtitle: 'Avoid acting beyond your competence.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'person-cog',
        steps: [
          {
            title: 'Stay inside your role',
            body: 'Medical students and junior staff should not make decisions or perform tasks beyond their training. Acting outside your role can cause harm even when you mean well.',
          },
          {
            title: 'Strong responses involve',
            bullets: [
              'Being honest about what you do and do not know.',
              'Asking for supervision when uncertain.',
              'Referring decisions upward when out of your remit.',
              'Not pretending to be more senior than you are.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Confidently making clinical decisions you are not trained for is unsafe, even if you happen to be right. SJ marks this as inappropriate.',
          },
        ],
      },
      {
        id: 'teamwork-professionalism',
        title: 'Teamwork and professionalism',
        subtitle: 'Handle colleagues fairly without ignoring poor behaviour.',
        duration: '5 min',
        type: 'Core principle',
        icon: 'list',
        steps: [
          {
            title: 'Protect the team without protecting bad behaviour',
            body: 'Good responses keep the team functioning while still taking issues seriously. Gossip, public humiliation, and unnecessary conflict almost never help.',
          },
          {
            title: 'Strong patterns',
            bullets: [
              'Speak to the colleague privately first when appropriate.',
              'Avoid discussing colleagues with people uninvolved in the issue.',
              'Escalate to a supervisor when the behaviour is serious or repeated.',
              'Stay respectful even when you disagree.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Loyalty does not require silence. Ignoring poor behaviour to "protect" a colleague is usually inappropriate when patients or other staff are affected.',
          },
        ],
      },
    ],
  },
  {
    id: 'types',
    title: 'Question Types',
    description: 'Learn how to handle appropriateness and importance questions.',
    icon: 'list',
    accentKey: 'blue',
    lessons: [
      {
        id: 'appropriateness-questions',
        title: 'Appropriateness questions',
        subtitle: 'Learn how to rate whether an action is a good response.',
        duration: '6 min',
        type: 'Question type',
        icon: 'check',
        practiceLabel: 'Practise appropriateness questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What you are rating',
            body: 'Appropriateness asks whether the specific action is a good response to the scenario. You are not asked whether the action is the best of the four; each option is rated in its own right.',
          },
          {
            title: 'The four-point scale',
            bullets: [
              'A very appropriate thing to do.',
              'Appropriate, but not ideal.',
              'Inappropriate, but not awful.',
              'A very inappropriate thing to do.',
            ],
          },
          {
            title: 'How to choose',
            bullets: [
              'Start with safety, honesty, and confidentiality.',
              'Check whether the action stays within the person\'s role.',
              'Check whether it is proportionate to the issue.',
              'Then judge how well it actually handles the situation.',
            ],
          },
          {
            title: 'Quick check',
            body: 'An action can be appropriate without being ideal. It can be inappropriate without being a disaster. The middle ratings exist for a reason.',
          },
        ],
      },
      {
        id: 'importance-questions',
        title: 'Importance questions',
        subtitle: 'Learn how to judge whether a consideration matters.',
        duration: '6 min',
        type: 'Question type',
        icon: 'flag',
        practiceLabel: 'Practise importance questions',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'What you are rating',
            body: 'Importance asks whether a factor should influence the decision in this scenario. You are not asked what to do, just whether this consideration matters when working it out.',
          },
          {
            title: 'The four-point scale',
            bullets: [
              'Very important.',
              'Important.',
              'Of minor importance.',
              'Not important at all.',
            ],
          },
          {
            title: 'How to choose',
            bullets: [
              'Ask: does this factor change what the right response should be?',
              'Factors involving safety, honesty, or confidentiality are usually high.',
              'Personal feelings or convenience are usually low.',
              'Irrelevant facts are not important at all.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Importance is not the same as appropriateness. Something can be important to consider even if it is not the action you would take.',
          },
        ],
      },
      {
        id: 'appropriate-vs-important',
        title: 'Appropriate vs important',
        subtitle: 'Understand the key difference between actions and considerations.',
        duration: '6 min',
        type: 'Question type',
        icon: 'filter',
        steps: [
          {
            title: 'Two different questions',
            bullets: [
              'Appropriateness asks: is this action a good thing to do?',
              'Importance asks: does this factor matter when deciding what to do?',
            ],
          },
          {
            title: 'Mini example',
            body: 'Scenario: A colleague seems unwell on a busy shift.\n\nFactor: "Whether the colleague is safe to keep working."\n\nThis factor is very important to consider, even though it is not itself an action.',
          },
          {
            title: 'Common confusion',
            body: 'Students sometimes rate a sensible action as "important" or rate an important factor as "appropriate". The two scales are not interchangeable.',
          },
          {
            title: 'Quick check',
            body: 'Before answering, identify whether you are being asked about an action or a consideration. The wording controls the scale you should use.',
          },
        ],
      },
      {
        id: 'close-ratings',
        title: 'How to choose between close ratings',
        subtitle: 'Separate similar answer options with more confidence.',
        duration: '7 min',
        type: 'Strategy',
        icon: 'target',
        steps: [
          {
            title: 'Why close ratings are hard',
            body: 'The hardest SJ choices are between neighbouring ratings, like "appropriate but not ideal" vs "inappropriate but not awful". The other two ratings are usually easier to rule out.',
          },
          {
            title: 'Tests for the upper half',
            bullets: [
              'Very appropriate: addresses the main issue and has no real downsides.',
              'Appropriate but not ideal: addresses the issue but is incomplete, slightly off, or could be done better.',
            ],
          },
          {
            title: 'Tests for the lower half',
            bullets: [
              'Inappropriate but not awful: misses the main issue or is poorly judged, but does not cause active harm.',
              'Very inappropriate: is unsafe, dishonest, breaches confidentiality, or makes the situation clearly worse.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If a response is unsafe, dishonest, or breaches confidentiality, default to the very inappropriate end, not the middle.',
          },
        ],
      },
    ],
  },
  {
    id: 'themes',
    title: 'Common Scenario Themes',
    description: 'Recognise the most common types of SJ situations.',
    icon: 'notes',
    accentKey: 'amber',
    lessons: [
      {
        id: 'mistakes-patient-harm',
        title: 'Mistakes and patient harm',
        subtitle: 'Handle errors, risk, and possible harm safely.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'shield-heart',
        steps: [
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
              'Document the issue.',
              'Avoid covering up or quietly fixing it without telling anyone.',
            ],
          },
          {
            title: 'Quick check',
            body: 'A "small" error that affects a patient still needs to be acknowledged. Hiding it usually rates as very inappropriate.',
          },
        ],
      },
      {
        id: 'confidentiality-scenarios',
        title: 'Confidentiality scenarios',
        subtitle: 'Protect patient information in realistic situations.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'filter',
        steps: [
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
            body: 'Keep information within the team that needs it. Move sensitive conversations to private areas. Politely refuse to discuss patients with people who are not entitled to that information.',
          },
          {
            title: 'Quick check',
            body: 'If sharing the information is not strictly necessary for the patient\'s care, the default position is not to share it.',
          },
        ],
      },
      {
        id: 'colleague-behaviour',
        title: 'Colleague behaviour',
        subtitle: 'Respond to unsafe, rude, dishonest, or struggling colleagues.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'person-cog',
        steps: [
          {
            title: 'The range of cases',
            bullets: [
              'Rude or dismissive behaviour towards patients or staff.',
              'Unsafe practice or shortcuts.',
              'Dishonesty about hours, tasks, or events.',
              'Bullying or undermining behaviour.',
              'A colleague who is unwell or visibly struggling.',
            ],
          },
          {
            title: 'How to respond well',
            bullets: [
              'Speak privately and calmly when the issue is small.',
              'Offer support to colleagues who are struggling.',
              'Escalate when behaviour is repeated or unsafe.',
              'Avoid public criticism and gossip.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Empathy and accountability go together. Supporting a colleague does not mean ignoring unsafe behaviour.',
          },
        ],
      },
      {
        id: 'academic-professional-integrity',
        title: 'Academic and professional integrity',
        subtitle: 'Deal with cheating, lying, plagiarism, and dishonesty.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'check',
        steps: [
          {
            title: 'Common dishonesty patterns',
            bullets: [
              'Cheating in exams or assessments.',
              'Plagiarism in coursework.',
              'Lying about attendance or completed tasks.',
              'Falsifying signatures, documents, or records.',
              'Exaggerating clinical experience.',
            ],
          },
          {
            title: 'Why this is high stakes',
            body: 'Medicine relies on trust. Dishonesty in training predicts dishonesty in practice, which puts patients at risk. SJ treats integrity issues firmly.',
          },
          {
            title: 'Quick check',
            body: 'Helping someone cheat or covering for them is rarely appropriate, even if they are a friend or under pressure.',
          },
        ],
      },
      {
        id: 'patient-communication-empathy',
        title: 'Patient communication and empathy',
        subtitle: 'Respond professionally to distressed or difficult interactions.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'notes',
        steps: [
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
              'Use clear, plain language.',
              'Keep calm under pressure.',
              'Involve seniors when needed without abandoning the patient.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Dismissing or arguing with an upset patient almost never improves the situation. Empathy first, problem-solving second.',
          },
        ],
      },
      {
        id: 'boundaries-conflicts-interest',
        title: 'Personal boundaries and conflicts of interest',
        subtitle: 'Recognise when relationships, gifts, or feelings affect judgement.',
        duration: '6 min',
        type: 'Scenario theme',
        icon: 'flag',
        steps: [
          {
            title: 'Where boundaries get tested',
            bullets: [
              'Gifts from patients or families.',
              'Personal relationships with patients or colleagues.',
              'Friend or family asking for advice or treatment.',
              'Social media contact with patients.',
              'Personal feelings affecting clinical decisions.',
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
            title: 'Quick check',
            body: 'If a colleague would raise an eyebrow at the situation, treat it as a boundary issue and respond accordingly.',
          },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Strategy & Traps',
    description: 'Avoid the common mistakes that cost marks in SJ.',
    icon: 'target',
    accentKey: 'teal',
    lessons: [
      {
        id: 'common-sj-traps',
        title: 'Common SJ traps',
        subtitle: 'Avoid the mistakes that make good students lose marks.',
        duration: '6 min',
        type: 'Strategy',
        icon: 'flag',
        steps: [
          {
            title: 'The classic trap family',
            bullets: [
              'Choosing the kindest answer even when it ignores safety.',
              'Choosing the harshest answer because something is wrong.',
              'Failing to escalate a serious issue.',
              'Escalating every small issue too quickly.',
              'Acting outside your role to "help".',
              'Adding facts that the scenario never gave.',
              'Treating "not ideal" as "very inappropriate".',
            ],
          },
          {
            title: 'Why these traps work',
            body: 'Each one feels reasonable in everyday life. SJ writes options that reward instinct over careful judgement, so the "obvious nice answer" is often a middle rating, not the top one.',
          },
          {
            title: 'Quick check',
            body: 'If your reasoning is "this is what a kind person would do", check whether it actually addresses the safety, honesty, or escalation issue in the scenario.',
          },
        ],
      },
      {
        id: 'proportionate-responses',
        title: 'Proportionate responses',
        subtitle: 'Match the response to the seriousness of the issue.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'filter',
        steps: [
          {
            title: 'Match the response to the issue',
            body: 'Strong SJ answers are usually proportionate. A minor misunderstanding rarely needs a formal report. A serious safety or dishonesty issue rarely deserves a quiet word and nothing else.',
          },
          {
            title: 'Signs a response is disproportionate',
            bullets: [
              'Going straight to the most senior person for something minor.',
              'Doing nothing about a clear safety or honesty issue.',
              'Treating a one-off mistake as a long-term character flaw.',
              'Escalating before trying any direct conversation.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Ask: does the response fit the seriousness of the issue? If it overshoots or undershoots, the rating drops.',
          },
        ],
      },
      {
        id: 'avoiding-personal-opinion',
        title: 'Avoiding personal opinion',
        subtitle: 'Answer as a safe future clinician, not just as yourself.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'person-cog',
        steps: [
          {
            title: 'The right reference point',
            body: 'SJ is not asking what you would personally do. It is asking what a safe, professional future clinician should judge as appropriate or important.',
          },
          {
            title: 'Common personal-opinion mistakes',
            bullets: [
              'Rating an action as appropriate because you would do it.',
              'Rating an action as inappropriate because you find it uncomfortable.',
              'Letting cultural or personal beliefs override patient safety.',
              'Assuming everyone shares your tolerance for risk.',
            ],
          },
          {
            title: 'Quick check',
            body: 'If your answer changes when you imagine a different student answering the same question, you are using personal opinion, not professional judgement.',
          },
        ],
      },
      {
        id: 'reading-exact-wording',
        title: 'Reading the exact wording',
        subtitle: 'Learn why small wording changes can change the answer.',
        duration: '5 min',
        type: 'Strategy',
        icon: 'pencil',
        steps: [
          {
            title: 'Why wording matters',
            body: 'SJ options are written carefully. A response that "speaks privately to a colleague" is very different from one that "publicly confronts" them, even if both raise the same issue.',
          },
          {
            title: 'Wording to read carefully',
            bullets: [
              'Immediately confront vs privately discuss.',
              'Ignore vs raise it later.',
              'Report without speaking to anyone vs ask for advice first.',
              'Tell other students vs tell the supervisor.',
              'Always, never, only, secretly.',
            ],
          },
          {
            title: 'Quick check',
            body: 'Re-read the option once more before rating. The same idea can be appropriate or very inappropriate depending on a single word.',
          },
        ],
      },
    ],
  },
  {
    id: 'examples',
    title: 'Worked Examples',
    description: 'See how to apply SJ reasoning step by step.',
    icon: 'notes',
    accentKey: 'purple',
    lessons: [
      {
        id: 'appropriateness-worked-example',
        title: 'Appropriateness worked example',
        subtitle: 'See how to judge an action step by step.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'check',
        steps: [
          {
            title: 'Scenario',
            body: 'You are a medical student on a ward round. A junior doctor reads out a drug dose that you are sure is too high based on the prescribing notes you saw earlier.',
          },
          {
            title: 'Action',
            body: 'Quietly mention to the doctor, before they prescribe it, that you think the dose may be higher than expected.',
          },
          {
            title: 'Student reasoning',
            body: 'Patient safety is the priority. The action is private, respectful, and stays within the student\'s role - it raises a concern without overruling the doctor.',
          },
          {
            title: 'Correct rating',
            body: 'A very appropriate thing to do.',
          },
          {
            title: 'Why nearby ratings fail',
            bullets: [
              'Appropriate but not ideal: there is no real downside; speaking up was the right call.',
              'Inappropriate but not awful: ignores that doing nothing risks patient harm.',
              'Very inappropriate: there is nothing unsafe or dishonest about raising the concern privately.',
            ],
          },
        ],
      },
      {
        id: 'importance-worked-example',
        title: 'Importance worked example',
        subtitle: 'See how to judge whether a consideration matters.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'flag',
        steps: [
          {
            title: 'Scenario',
            body: 'A classmate asks you to sign their attendance for a teaching session they did not attend, saying they had a difficult personal week.',
          },
          {
            title: 'Consideration',
            body: '"Whether falsifying attendance records could affect patient safety later in training."',
          },
          {
            title: 'Student reasoning',
            body: 'This consideration links a small dishonesty now to bigger trust issues later. Integrity in training is treated seriously precisely because clinical practice depends on accurate records and honest behaviour.',
          },
          {
            title: 'Correct rating',
            body: 'Very important.',
          },
          {
            title: 'Why nearby ratings fail',
            bullets: [
              'Important: understates how directly integrity links to patient safety.',
              'Of minor importance: treats a documented dishonesty as a small issue.',
              'Not important at all: ignores the core principle being tested.',
            ],
          },
        ],
      },
      {
        id: 'professionalism-worked-example',
        title: 'Professionalism worked example',
        subtitle: 'Apply patient safety, honesty, and escalation together.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'shield-heart',
        steps: [
          {
            title: 'Scenario',
            body: 'A senior nurse confides that a junior doctor has been coming to shifts smelling of alcohol. They ask you, a medical student, to keep it quiet.',
          },
          {
            title: 'Action',
            body: 'Reassure the nurse but escalate the concern to the consultant or appropriate supervisor without naming her if possible.',
          },
          {
            title: 'Student reasoning',
            body: 'Patient safety overrides loyalty. A doctor under the influence is a serious risk. The student does not have authority to manage this directly, so escalation to the right senior is the safe, proportionate response.',
          },
          {
            title: 'Correct rating',
            body: 'A very appropriate thing to do.',
          },
          {
            title: 'Common wrong reasoning',
            body: 'Students often rate "keep it quiet to protect the colleague" highly because it feels kind. SJ marks this as very inappropriate because it ignores the safety risk.',
          },
        ],
      },
      {
        id: 'close-call-worked-example',
        title: 'Close-call worked example',
        subtitle: 'Learn how to decide when two ratings feel similar.',
        duration: '7 min',
        type: 'Worked example',
        icon: 'target',
        steps: [
          {
            title: 'Scenario',
            body: 'A patient becomes upset when you, a medical student, cannot answer a clinical question. They ask you to "just guess".',
          },
          {
            title: 'Action',
            body: 'Politely tell the patient you do not know, apologise, and offer to find a doctor who can answer them.',
          },
          {
            title: 'Why this is a close call',
            body: 'Some students rate this as "very appropriate". Others rate it "appropriate but not ideal" because they think the student should have known. Both feel reasonable.',
          },
          {
            title: 'Tie-break',
            body: 'The action is honest, stays within role, and protects the patient by routing them to someone qualified. There is no hidden downside, so it sits at the top of the scale.',
          },
          {
            title: 'Correct rating',
            body: 'A very appropriate thing to do.',
          },
          {
            title: 'Why the lower rating loses',
            body: 'It penalises the student for not knowing something they should not be expected to know. SJ rates the action, not the gap in knowledge.',
          },
        ],
      },
    ],
  },
  {
    id: 'apply',
    title: 'Apply It',
    description: 'Turn the learning into practice.',
    icon: 'pencil',
    accentKey: 'mint',
    lessons: [
      {
        id: 'mini-sj-drill',
        title: 'Mini SJ drill',
        subtitle: 'Try a short mixed drill before full practice.',
        duration: '8 min',
        type: 'Mini drill',
        icon: 'pencil',
        practiceLabel: 'Practise SJ scenarios',
        practiceRoute: 'practice',
        steps: [
          {
            title: 'How to use this drill',
            body: 'Use the practice flow to attempt a short mixed set of scenarios. Aim for around five questions covering both appropriateness and importance, with at least one close-call option.',
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
            body: 'For each question you got wrong, identify which principle you missed: safety, honesty, confidentiality, role, escalation, proportion, or wording. That label is what to revise.',
          },
        ],
      },
      {
        id: 'final-sj-checklist',
        title: 'Final SJ checklist',
        subtitle: 'Check you are ready before starting SJ practice.',
        duration: '4 min',
        type: 'Checklist',
        icon: 'check',
        steps: [
          {
            title: 'Before answering each question',
            bullets: [
              'Did I identify the main issue?',
              'Did I consider patient safety first?',
              'Did I avoid making assumptions?',
              'Did I judge the specific action or consideration?',
              'Did I stay within the person\'s role?',
              'Did I choose a proportionate response?',
              'Did I separate "not ideal" from "very inappropriate"?',
              'Did I avoid choosing based only on what sounds kind?',
            ],
          },
          {
            title: 'You are ready when',
            body: 'You can answer most scenarios without flipping between two ratings, and you can name the principle behind each rating you choose. Move into full practice from here.',
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
  const accent = colors.mint ?? colors.cyan ?? colors.blue;

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroCard, { borderColor: colors.border, shadowColor: accent }]}
    >
      <View style={styles.heroHeader}>
        <RichIconBox icon="stethoscope" accent={accent} size={58} iconSize={30} />
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: accent }]}>SITUATIONAL JUDGEMENT</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Learn how to think like a safe, professional future clinician.</Text>
        </View>
      </View>

      <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
        Understand scenarios, judge responses, avoid traps, and apply consistent reasoning before starting practice.
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
            ? 'You have finished the SJ learning pathway. Move into practice while the method is fresh.'
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
    if (!isPro && lesson && PREMIUM_LESSON_TYPES.has(lesson.type)) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('LearnSJLesson', { lessonId });
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
              Follow the recommended order, or open any lesson when you want to review a specific principle.
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
