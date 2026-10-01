// Static DM worked-example questions used by the DM Learning Pathway.
// Each entry is one full DM question (post-mapped schema, matching what
// useDecisionMakingQuestions emits) keyed by lesson id so the learn screen
// can launch the matching example from each Worked Example lesson.
//
// Not loaded from Supabase; not stored in attempts cache.

export const DM_WORKED_EXAMPLES = {
  'syllogism-example': {
    id: 'dm-we-syllogism',
    title: 'Worked example: Syllogism',
    type: 'syllogism',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'Take the following statements as true:\n\n• All radiographers are clinicians.\n• No clinicians are unpaid volunteers.\n• Some radiographers are tutors.\n\nFor each conclusion below, decide whether it follows logically from the statements.',
    answer: { 0: 'Yes', 1: 'Yes', 2: 'Yes', 3: 'No', 4: 'No' },
    answeringReason: null,
    options: [],
    statements: [
      {
        text: 'Some tutors are clinicians.',
        answer: 'Yes',
        reason:
          'Some radiographers are tutors (premise 3). All radiographers are clinicians (premise 1). So those radiographer-tutors must also be clinicians, meaning some tutors are clinicians.',
      },
      {
        text: 'No radiographers are unpaid volunteers.',
        answer: 'Yes',
        reason:
          'All radiographers are clinicians (premise 1) and no clinicians are unpaid volunteers (premise 2). Combining the two: radiographers cannot be unpaid volunteers.',
      },
      {
        text: 'Some clinicians are tutors.',
        answer: 'Yes',
        reason:
          'Some radiographers are tutors (premise 3) and all radiographers are clinicians (premise 1). The radiographer-tutors are therefore clinicians who are tutors.',
      },
      {
        text: 'All tutors are radiographers.',
        answer: 'No',
        reason:
          'We only know that some radiographers are tutors. The premises say nothing about all tutors. Other clinicians or other professionals could also be tutors. This is the classic some-to-all trap.',
      },
      {
        text: 'Some unpaid volunteers are not radiographers.',
        answer: 'No',
        reason:
          'This conclusion needs at least one unpaid volunteer to exist. The premises tell us no radiographer is an unpaid volunteer, but they never establish that there are any unpaid volunteers at all. Without that existence claim, "some unpaid volunteers..." does not follow.',
      },
    ],
  },

  'venn-example': {
    id: 'dm-we-venn',
    title: 'Worked example: Standard Venn diagram',
    type: 'venn_diagram',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: 'select_diagram',
    stem:
      'A school surveyed 60 Year 11 pupils about which after-school clubs they attended last term:\n\n' +
      '• 19 pupils attended Drama\n' +
      '• 15 pupils attended Music\n' +
      '• 22 pupils attended Sport\n' +
      '• 9 pupils attended exactly two of the three clubs\n' +
      '• 2 pupils attended all three clubs\n' +
      '• 17 pupils attended none of the three clubs\n\n' +
      'Which of the following diagrams correctly represents the data?',
    answer: 'A',
    answeringReason:
      'Three values the stem hands you straight away — the centre region where all three overlap (2 pupils), the region beyond all three circles (17 pupils with no clubs), and the sum of the three pair regions (11 pupils with exactly two clubs). Check those before deriving anything else.\n\n' +
      "• Option B's centre shows 3, but the stem says 2 attended all three clubs.\n" +
      "• Option C's no-clubs region shows 15, but the stem says 17.\n" +
      "• Option D's three pair regions add to 4 + 6 + 2 = 12, but the stem says exactly 11 attended exactly two.\n\n" +
      'That leaves A. Sanity-check one set total: Drama = 10 + 3 + 4 + 2 = 19, matching the stem.\n\n' +
      'The lesson — read the stem for the values you can spot on any diagram (the centre, the outside, and the pair total) and use them to eliminate. Deriving every region from scratch is the slow path. The answer is A.',
    options: [
      {
        label: 'A',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Drama', shape: 'circle' },
            { id: 'set2', label: 'Music', shape: 'circle' },
            { id: 'set3', label: 'Sport', shape: 'circle' },
          ],
          regions: {
            set1_only: 10, set2_only: 8, set3_only: 14,
            set1_set2: 3, set1_set3: 4, set2_set3: 2,
            set1_set2_set3: 2, outside: 17,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'B',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Drama', shape: 'circle' },
            { id: 'set2', label: 'Music', shape: 'circle' },
            { id: 'set3', label: 'Sport', shape: 'circle' },
          ],
          regions: {
            set1_only: 10, set2_only: 8, set3_only: 14,
            set1_set2: 3, set1_set3: 4, set2_set3: 2,
            set1_set2_set3: 3, outside: 16,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'C',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Drama', shape: 'circle' },
            { id: 'set2', label: 'Music', shape: 'circle' },
            { id: 'set3', label: 'Sport', shape: 'circle' },
          ],
          regions: {
            set1_only: 10, set2_only: 8, set3_only: 16,
            set1_set2: 3, set1_set3: 4, set2_set3: 2,
            set1_set2_set3: 2, outside: 15,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'D',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Drama', shape: 'circle' },
            { id: 'set2', label: 'Music', shape: 'circle' },
            { id: 'set3', label: 'Sport', shape: 'circle' },
          ],
          regions: {
            set1_only: 10, set2_only: 8, set3_only: 12,
            set1_set2: 4, set1_set3: 6, set2_set3: 2,
            set1_set2_set3: 2, outside: 16,
          },
        },
        vennGeometry: null,
      },
    ],
    statements: [],
  },

  'venn-example-shapes': {
    id: 'dm-we-venn-shapes',
    title: 'Worked example: Mixed-shape Venn',
    type: 'venn_diagram',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: 'select_diagram',
    stem:
      'A logistics firm tracked 75 packages last week. Each package can be sent overseas, insured for high value, or delivered before its deadline — or any combination of the three.\n\n' +
      '• 25 packages were sent overseas in total\n' +
      '• 17 packages were insured for high value in total\n' +
      '• 32 packages were delivered before deadline in total\n' +
      '• 14 packages had exactly two of the three properties\n' +
      '• 4 packages had all three properties\n' +
      '• 23 packages had none of the three properties\n\n' +
      'Which of the following diagrams correctly represents the data?',
    answer: 'A',
    answeringReason:
      'UCAT diagrams may use shapes other than circles — read the legend (block arrow for sent overseas, hexagon for insured, diamond for on-time) before reading any region. Then go for the values the stem gives you directly: the centre region (4 with all three), the region beyond all shapes (23 with none), and the sum of the three pair regions (14 with exactly two).\n\n' +
      "• Option B's centre shows 5, but the stem says 4 had all three properties.\n" +
      "• Option C's three pair regions add to 4 + 9 + 3 = 16, but the stem says 14 had exactly two.\n" +
      "• Option D's no-property region shows 20, but the stem says 23 had none.\n\n" +
      'A is the only diagram consistent with all three values. Sanity-check one set total: overseas = 10 + 4 + 7 + 4 = 25, matching the stem.\n\n' +
      'The lesson — UCAT diagrams are not always circles, so do not assume the shape; whichever shapes appear, they are interchangeable and the legend tells you which is which. Read the legend first, then apply the same elimination strategy as on a circle diagram. The answer is A.',
    options: [
      {
        label: 'A',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Sent overseas', shape: 'right_arrow' },
            { id: 'set2', label: 'Insured', shape: 'hexagon' },
            { id: 'set3', label: 'On-time', shape: 'diamond' },
          ],
          regions: {
            set1_only: 10, set2_only: 6, set3_only: 18,
            set1_set2: 4, set1_set3: 7, set2_set3: 3,
            set1_set2_set3: 4, outside: 23,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'B',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Sent overseas', shape: 'right_arrow' },
            { id: 'set2', label: 'Insured', shape: 'hexagon' },
            { id: 'set3', label: 'On-time', shape: 'diamond' },
          ],
          regions: {
            set1_only: 10, set2_only: 6, set3_only: 18,
            set1_set2: 4, set1_set3: 7, set2_set3: 3,
            set1_set2_set3: 5, outside: 22,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'C',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Sent overseas', shape: 'right_arrow' },
            { id: 'set2', label: 'Insured', shape: 'hexagon' },
            { id: 'set3', label: 'On-time', shape: 'diamond' },
          ],
          regions: {
            set1_only: 10, set2_only: 6, set3_only: 16,
            set1_set2: 4, set1_set3: 9, set2_set3: 3,
            set1_set2_set3: 4, outside: 23,
          },
        },
        vennGeometry: null,
      },
      {
        label: 'D',
        text: '',
        vennConfig: {
          diagramLayout: 'auto',
          sets: [
            { id: 'set1', label: 'Sent overseas', shape: 'right_arrow' },
            { id: 'set2', label: 'Insured', shape: 'hexagon' },
            { id: 'set3', label: 'On-time', shape: 'diamond' },
          ],
          regions: {
            set1_only: 10, set2_only: 6, set3_only: 21,
            set1_set2: 4, set1_set3: 7, set2_set3: 3,
            set1_set2_set3: 4, outside: 20,
          },
        },
        vennGeometry: null,
      },
    ],
    statements: [],
  },

  'venn-example-interpret': {
    id: 'dm-we-venn-interpret',
    title: 'Worked example: Reading a Venn diagram',
    type: 'venn_diagram',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: {
      diagramLayout: 'auto',
      sets: [
        { id: 'set1', label: 'Spicy', shape: 'octagon' },
        { id: 'set2', label: 'Vegetarian', shape: 'vertical_oval' },
        { id: 'set3', label: 'Under £10', shape: 'pentagon' },
      ],
      regions: {
        set1_only: 'P', set2_only: 'Q', set3_only: 'R',
        set1_set2: 'S', set1_set3: 'T', set2_set3: 'U',
        set1_set2_set3: 'V', outside: 'W',
      },
    },
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: 'interpret_diagram',
    stem:
      'A restaurant categorises its 200 menu items by three properties: spicy, vegetarian, and priced under £10. Each letter marks a different region.\n\n' +
      'Which letter represents a menu item that is vegetarian and under £10 but not spicy?',
    answer: 'B',
    answeringReason:
      'Translate the question into in/out language for each shape before looking at any letter. You want items inside the vegetarian shape AND inside the under-£10 shape AND outside the spicy shape.\n\n' +
      '• Letter S sits inside spicy and vegetarian, outside under-£10. Two failures — it is inside spicy (the target excludes spicy) and outside under-£10.\n' +
      '• Letter U sits inside vegetarian and under-£10, outside spicy. All three conditions match.\n' +
      '• Letter V is the centre region — inside all three, including spicy. The target excludes spicy, so V is out.\n' +
      '• Letter Q sits inside vegetarian only — outside under-£10. The target requires under-£10, so Q is too narrow.\n\n' +
      "The lesson — turn 'X and Y but not Z' into a checklist of three in/out conditions and walk to the region that satisfies all three. Never guess from letter position. The answer is B (Letter U).",
    options: [
      { label: 'A', text: 'Letter S', vennConfig: null, vennGeometry: null },
      { label: 'B', text: 'Letter U', vennConfig: null, vennGeometry: null },
      { label: 'C', text: 'Letter V', vennConfig: null, vennGeometry: null },
      { label: 'D', text: 'Letter Q', vennConfig: null, vennGeometry: null },
    ],
    statements: [],
  },

  'venn-example-numerical': {
    id: 'dm-we-venn-numerical',
    title: 'Worked example: Region calculation',
    type: 'venn_diagram',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: {
      diagramLayout: 'auto',
      sets: [
        { id: 'set1', label: 'Football', shape: 'square' },
        { id: 'set2', label: 'Tennis', shape: 'hexagon' },
        { id: 'set3', label: 'Cricket', shape: 'isosceles_triangle' },
      ],
      regions: {
        set1_only: 8, set2_only: 6, set3_only: 10,
        set1_set2: 4, set1_set3: 5, set2_set3: 3,
        set1_set2_set3: 2, outside: 12,
      },
    },
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: 'interpret_diagram',
    stem:
      'A sports club tracked which sports each of its 50 members play. The diagram shows how many members fall in each region.\n\n' +
      'How many members play tennis but not football?',
    answer: 'B',
    answeringReason:
      "Translate 'tennis but not football' into 'inside the tennis shape AND outside the football shape'. Two regions match: tennis only (6) and the tennis-and-cricket region that sits outside football (3). Add: 6 + 3 = 9.\n\n" +
      '• Option A (6) only counts tennis-only and forgets the tennis-and-cricket members. Those still play tennis, and they sit outside football, so they count.\n' +
      '• Option B (9) is correct.\n' +
      '• Option C (11) wrongly includes the centre region (2) where members play all three sports — including football. The centre fails the "not football" condition.\n' +
      '• Option D (15) sums every region inside the tennis shape: 6 + 4 + 3 + 2 = 15. That answers "how many play tennis", not "tennis but not football".\n\n' +
      "The lesson — 'X but not Y' means inside X's shape AND outside Y's shape. Walk through every region inside X and exclude the ones that also sit inside Y. Reading the whole tennis shape (D) is the classic 'A and B' versus 'A and B only' trap. The answer is B (9).",
    options: [
      { label: 'A', text: '6', vennConfig: null, vennGeometry: null },
      { label: 'B', text: '9', vennConfig: null, vennGeometry: null },
      { label: 'C', text: '11', vennConfig: null, vennGeometry: null },
      { label: 'D', text: '15', vennConfig: null, vennGeometry: null },
    ],
    statements: [],
  },

  'puzzle-example': {
    id: 'dm-we-puzzle',
    title: 'Worked example: Logic puzzle',
    type: 'logic_puzzle',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'Four students — Hana, Idris, June, and Leo — give presentations on Monday, Tuesday, Wednesday, and Thursday. Exactly one student presents per day.\n\n• Hana presents before Idris.\n• Idris presents before Leo.\n• June presents on Wednesday.\n\nWho presents on Tuesday?',
    answer: 'B',
    answeringReason:
      'Place the absolute rule first: June = Wednesday.\n\nThe relative rules form a chain: Hana → Idris → Leo. They must occupy the remaining three days (Monday, Tuesday, Thursday) in that order. The only ordering that fits is:\n\n• Monday — Hana\n• Tuesday — Idris\n• Wednesday — June\n• Thursday — Leo\n\nSo Idris presents on Tuesday — option B.\n\nLesson: place absolute rules first, then chain rules. The structure usually resolves itself once you commit June to Wednesday.',
    options: [
      { label: 'A', text: 'Hana', vennConfig: null, vennGeometry: null },
      { label: 'B', text: 'Idris', vennConfig: null, vennGeometry: null },
      { label: 'C', text: 'June', vennConfig: null, vennGeometry: null },
      { label: 'D', text: 'Leo', vennConfig: null, vennGeometry: null },
    ],
    statements: [],
  },

  'interpreting-info-example': {
    id: 'dm-we-interpreting-info',
    title: 'Worked example: Interpreting information',
    type: 'interpreting_info',
    difficulty: 'normal',
    isFree: true,
    tableData: {
      headers: ['Clinic', 'Appointments', 'Late arrivals', 'Average wait'],
      rows: [
        ['North', '200', '40', '12 min'],
        ['East', '300', '45', '10 min'],
        ['South', '150', '27', '18 min'],
        ['West', '100', '18', '9 min'],
      ],
    },
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'The table shows appointment data from four clinics over one week.\n\nFor each statement below, decide whether it follows from the information in the table.',
    answer: { 0: 'Yes', 1: 'Yes', 2: 'Yes', 3: 'No', 4: 'No' },
    answeringReason: null,
    options: [],
    statements: [
      {
        text: 'East had the highest number of late arrivals.',
        answer: 'Yes',
        reason:
          'Compare the late-arrival counts: North 40, East 45, South 27, West 18. East is the highest count.',
      },
      {
        text: 'North had the highest late-arrival rate.',
        answer: 'Yes',
        reason:
          'Use the denominator for each clinic. North: 40/200 = 20%. East: 45/300 = 15%. South: 27/150 = 18%. West: 18/100 = 18%. North has the highest rate.',
      },
      {
        text: 'West had the shortest average wait.',
        answer: 'Yes',
        reason:
          'Compare the average-wait column directly: West is 9 minutes, lower than East 10, North 12, and South 18.',
      },
      {
        text: 'South had more late arrivals than North.',
        answer: 'No',
        reason:
          'South had 27 late arrivals, while North had 40. This statement reverses the comparison.',
      },
      {
        text: 'A higher number of late arrivals always meant a longer average wait.',
        answer: 'No',
        reason:
          'East had the most late arrivals (45) but its average wait was only 10 minutes. South had fewer late arrivals (27) but a longer average wait (18 minutes). The pattern is not "always" true.',
      },
    ],
  },

  'probability-example': {
    id: 'dm-we-probability',
    title: 'Worked example: Probability',
    type: 'probabilistic',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'A clinic has 5 red files, 3 blue files, and 2 green files in a tray, giving 10 files in total.\n\nTwo files are taken from the tray, one after the other, without replacement.\n\nWhat is the probability that both files are red?',
    answer: 'B',
    answeringReason:
      '"Without replacement" means the second draw uses an updated denominator.\n\nChance the first file is red = 5/10 = 1/2.\n\nAfter taking one red, 4 red files remain out of 9 total.\n\nChance the second file is red after the first was red = 4/9.\n\nChance both are red = 1/2 × 4/9 = 4/18 = 2/9.\n\nOptional cross-check: there are 10 possible red-red pairs out of 45 possible two-file pairs, so 10/45 = 2/9. ✓\n\n• A (1/4) — almost-right fraction; comes from incorrectly simplifying an intermediate step.\n• B (2/9) — correct.\n• C (5/18) — comes from adding 1/2 + 4/9 instead of multiplying.\n• D (1/2) — ignores the second draw entirely (just gives the chance of the first file being red).\n\nLesson: "without replacement" always changes the second denominator. Multiply for "and"; only add for mutually exclusive outcomes.',
    options: [
      { label: 'A', text: '1/4', vennConfig: null, vennGeometry: null },
      { label: 'B', text: '2/9', vennConfig: null, vennGeometry: null },
      { label: 'C', text: '5/18', vennConfig: null, vennGeometry: null },
      { label: 'D', text: '1/2', vennConfig: null, vennGeometry: null },
    ],
    statements: [],
  },

  'assumption-example': {
    id: 'dm-we-assumption',
    title: 'Worked example: Assumption',
    type: 'recognising_assumptions',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'A college is considering whether to install secure bike storage.\n\nArgument: The college should install secure bike storage because more students would cycle to campus if they had somewhere safe to leave their bikes.\n\nWhich assumption does this argument rely on?',
    answer: 'B',
    answeringReason:
      'Use the "pretend it is false" test.\n\n• A — If bike storage were not cheaper than other transport schemes, the argument could still work. Cost is not the hidden link in this argument.\n• B — Correct. If safety of bike storage is not currently stopping any students from cycling, then adding storage would not explain why more students would cycle. The argument collapses when this is false.\n• C — Whether cycling improves fitness may be true, but the argument is about whether storage would increase cycling, not whether cycling is healthy.\n• D — The argument says more students would cycle, not that all students own bikes. This option is too strong.\n\nThe lesson: an assumption is not just a relevant-sounding extra fact. It is the missing link the argument needs in order to work.',
    options: [
      {
        label: 'A',
        text: 'Secure bike storage would be cheaper than improving bus services.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'B',
        text: 'Concern about leaving bikes safely is currently stopping at least some students from cycling to campus.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'C',
        text: 'Cycling to campus would improve students\' fitness.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'D',
        text: 'All students at the college already own bikes.',
        vennConfig: null,
        vennGeometry: null,
      },
    ],
    statements: [],
  },

  'argument-example': {
    id: 'dm-we-argument',
    title: 'Worked example: Strongest argument',
    type: 'strongest_argument',
    difficulty: 'normal',
    isFree: true,
    tableData: null,
    stimulusDiagram: null,
    stimulusVennGeometry: null,
    hideLabels: false,
    subtype: null,
    stem: 'A town is considering whether to introduce free evening bus travel for students.\n\nWhich is the strongest argument?',
    answer: 'B',
    answeringReason:
      'Apply FREES (Factual, Relevant, Entire, Emotionless, Sensible) to each option.\n\n• A — fails Factual (aesthetic claim, no evidence) and Relevant (does not address the actual proposal).\n• B — passes all five. Cites survey data (Factual), directly addresses attendance and transport cost (Relevant), covers the proposal mechanism and intended outcome (Entire), uses neutral language (Emotionless), and follows a clear chain (Sensible).\n• C — partly relevant but narrow; fails Entire because it focuses on a side effect for some adults rather than the student-travel proposal as a whole.\n• D — uses moral framing ("deserve") rather than evidence; fails Factual and Sensible.\n\nThe correct answer is B. The strongest argument passes all five FREES tests; weaker options fail at least one. Watch for emotive or moral language as a quick weak-argument tell.',
    options: [
      {
        label: 'A',
        text: 'Yes, because buses look more welcoming when young people use them.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'B',
        text: 'Yes, because survey data show late classes are a major reason for missed attendance among students, and transport cost is the most commonly reported barrier.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'C',
        text: 'No, because some adults prefer quiet buses in the evening.',
        vennConfig: null,
        vennGeometry: null,
      },
      {
        label: 'D',
        text: 'Yes, because students deserve support.',
        vennConfig: null,
        vennGeometry: null,
      },
    ],
    statements: [],
  },
};

export const DM_WORKED_EXAMPLE_IDS = Object.keys(DM_WORKED_EXAMPLES);
