// Static QR worked-example sets used by the QR Learning Pathway.
// Each entry is one full QR set + question, keyed by the lesson id, so the
// learn screen can launch the matching example from each Worked Example
// lesson. Schema mirrors the post-mapped form produced by
// useQuantitativeReasoningSets so QRQuestionScreen can consume it directly
// without going through Supabase.
//
// Not loaded from Supabase; not stored in attempts cache.

export const QR_WORKED_EXAMPLES = {
  'percentage-example': {
    id: 'qr-we-percentage',
    setId: 'qr-we-percentage',
    title: 'Worked example: Percentages',
    isFree: true,
    stimulus: {
      type: 'text',
      text: 'A concert sells 160 early-bird tickets at £24 each. The £24 price is a 20% discount on the full ticket price.',
    },
    questions: [
      {
        questionId: 'qr-we-percentage-q1',
        questionText: 'What would the revenue from these 160 tickets have been at the full ticket price?',
        options: [
          { label: 'A', text: '£3,840' },
          { label: 'B', text: '£4,608' },
          { label: 'C', text: '£4,800' },
          { label: 'D', text: '£6,000' },
        ],
        answer: 'C',
        answeringReason:
          'Step 1 — Recognise the reverse-percentage move. £24 is the discounted price after 20% off, so £24 represents 80% of the full price. To go back to the full price, divide by the multiplier (0.8), do not add 20%.\n\nStep 2 — Find the full ticket price. 24 ÷ 0.8 = £30.\n\nStep 3 — Multiply by the number of tickets. 160 × 30 = £4,800.\n\nWhy the wrong options are tempting:\n• £3,840 — the discounted revenue (160 × 24). Stops at the wrong stage; this is what the concert actually took, not what it would have taken at full price.\n• £4,608 — increases £24 by 20% (24 × 1.2 = 28.80, then × 160). Reverses the discount the wrong way. Adding 20% to the discounted price does not return the original.\n• £6,000 — likely a scaling error (e.g. dividing by 0.64, or applying ÷ 0.8 to 30 instead of to 24).\n\nKey lesson: to reverse a percentage discount, divide by the multiplier (0.8 here), never add the same percentage back. The fastest sense-check is: "If 80% = £24, then 10% = £3, so 100% = £30."',
      },
    ],
  },

  'table-example': {
    id: 'qr-we-table',
    setId: 'qr-we-table',
    title: 'Worked example: Table question',
    isFree: true,
    stimulus: {
      type: 'table',
      context: 'A supermarket sells three snack packs in different sizes. The table below shows their weight and price.',
      data: {
        headers: ['Pack', 'Weight (g)', 'Price (£)'],
        rows: [
          ['A', '180', '1.98'],
          ['B', '240', '2.40'],
          ['C', '300', '2.85'],
        ],
      },
    },
    questions: [
      {
        questionId: 'qr-we-table-q1',
        questionText: 'Which pack offers the cheapest price per 100 g?',
        options: [
          { label: 'A', text: 'Pack A' },
          { label: 'B', text: 'Pack B' },
          { label: 'C', text: 'Pack C' },
          { label: 'D', text: 'All three packs cost the same per 100 g' },
        ],
        answer: 'C',
        answeringReason:
          'The sticker price alone does not answer this — the question asks for unit price, so each pack must be reduced to a "per 100 g" cost.\n\nStep 1 — Find the cost per 100 g for each pack.\n• Pack A: 1.98 ÷ 180 × 100 = £1.10 per 100 g.\n• Pack B: 2.40 ÷ 240 × 100 = £1.00 per 100 g.\n• Pack C: 2.85 ÷ 300 × 100 = £0.95 per 100 g.\n\nStep 2 — Compare. Pack C at £0.95 per 100 g is the cheapest.\n\nWhy the wrong options are tempting:\n• Pack A — has the lowest sticker price (£1.98) but is also the smallest, so its unit price is actually the highest.\n• Pack B — sits in the middle of the table and "feels neat" (£2.40 / 240 g). Pattern guessing without calculating is the trap.\n• "All cost the same" — only correct if the unit prices were identical, which they are not.\n\nKey lesson: when a table gives quantity AND price, the question almost always wants a unit rate. Always reduce to "per 1" or "per 100" before comparing.',
      },
    ],
  },

  'graph-example': {
    id: 'qr-we-graph',
    setId: 'qr-we-graph',
    title: 'Worked example: Graph question',
    isFree: true,
    stimulus: {
      type: 'bar_chart',
      context: 'The bar chart below shows the number of vaccine doses administered at a community clinic over four months.',
      data: {
        title: 'Vaccine Doses Administered (January – April)',
        labels: ['January', 'February', 'March', 'April'],
        series: [
          {
            name: 'Doses',
            values: [120, 160, 140, 200],
          },
        ],
        yAxisLabel: 'Doses administered',
      },
    },
    questions: [
      {
        questionId: 'qr-we-graph-q1',
        questionText: 'What is the mean number of doses administered per month over the four months shown?',
        options: [
          { label: 'A', text: '140' },
          { label: 'B', text: '155' },
          { label: 'C', text: '200' },
          { label: 'D', text: '620' },
        ],
        answer: 'B',
        answeringReason:
          'Step 1 — Read each bar against the y-axis: January 120, February 160, March 140, April 200.\n\nStep 2 — Add the four values. 120 + 160 = 280; + 140 = 420; + 200 = 620.\n\nStep 3 — Divide by the number of months. 620 ÷ 4 = 155.\n\nWhy the wrong options are tempting:\n• 140 — the value of the March bar. Reading a single bar instead of computing the average.\n• 200 — the highest bar (April). Picking the maximum instead of the mean.\n• 620 — the total, before dividing. Stopping at the intermediate value; UCAT plants this exact number to catch students who do not finish the calculation.\n\nKey lesson: for "mean" or "average" questions, total then divide. Reading a single bar — even the most striking one — never answers an average question. After every chart calculation, ask yourself: "Have I divided yet?"',
      },
    ],
  },

  'line-graph-example': {
    id: 'qr-we-line-graph',
    setId: 'qr-we-line-graph',
    title: 'Worked example: Line graph',
    isFree: true,
    stimulus: {
      type: 'line_graph',
      context: 'The line graph shows the number of monthly visitors to a small clinic website during 2024.',
      data: {
        title: 'Monthly Website Visitors (2024)',
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        series: [
          {
            name: 'Visitors',
            values: [1200, 1450, 1800, 2100, 2400, 2200, 2700, 3200, 3000, 2800, 3500, 4100],
          },
        ],
        yAxisLabel: 'Visitors',
      },
    },
    questions: [
      {
        questionId: 'qr-we-line-graph-q1',
        questionText: 'By approximately what percentage did the monthly visitor count increase from January to December 2024?',
        options: [
          { label: 'A', text: '29%' },
          { label: 'B', text: '71%' },
          { label: 'C', text: '242%' },
          { label: 'D', text: '342%' },
        ],
        answer: 'C',
        answeringReason:
          'Step 1 — Read both endpoints off the graph. January = 1,200 visitors. December = 4,100 visitors.\n\n' +
          'Step 2 — Apply the percentage-change formula. % change = (new − old) ÷ old × 100 = (4,100 − 1,200) ÷ 1,200 × 100 = 2,900 ÷ 1,200 × 100 ≈ 241.7%, which rounds to 242%.\n\n' +
          'Why the wrong options are tempting:\n' +
          '• 29% — divides January by December (1,200 ÷ 4,100). The wrong-direction ratio, not the percentage change.\n' +
          '• 71% — uses the FINAL value as the base: 2,900 ÷ 4,100 × 100. Classic wrong-base trap. Percentage increase always uses the ORIGINAL value as the denominator.\n' +
          '• 342% — treats the ratio 4,100 ÷ 1,200 × 100 as the percentage change. That tells you December is 342% OF January, but the % change is 342% − 100% = 242%. Forgetting to subtract 100% from a ratio is the second most common chart-percentage trap.\n\n' +
          'Key lesson — for percentage change, lock in the formula (new − old) ÷ old × 100 BEFORE reading the chart. The original value is the denominator, never the new one.',
      },
    ],
  },

  'pie-chart-example': {
    id: 'qr-we-pie-chart',
    setId: 'qr-we-pie-chart',
    title: 'Worked example: Pie chart',
    isFree: true,
    stimulus: {
      type: 'pie_chart',
      context: 'A hospital allocated its £3,600,000 equipment budget across its five departments last year. The pie chart shows the distribution.',
      data: {
        title: 'Equipment Budget Allocation',
        segments: [
          { label: 'Cardiology', value: 1080000 },
          { label: 'Oncology', value: 900000 },
          { label: 'Radiology', value: 720000 },
          { label: 'Paediatrics', value: 540000 },
          { label: 'A&E', value: 360000 },
        ],
        unit: '£',
      },
    },
    questions: [
      {
        questionId: 'qr-we-pie-chart-q1',
        questionText: 'What percentage of the equipment budget was allocated to Oncology?',
        options: [
          { label: 'A', text: '15%' },
          { label: 'B', text: '20%' },
          { label: 'C', text: '25%' },
          { label: 'D', text: '30%' },
        ],
        answer: 'C',
        answeringReason:
          'Step 1 — Find Oncology in the legend, then read its value: £900,000.\n\n' +
          'Step 2 — Divide by the total. 900,000 ÷ 3,600,000 = 0.25 = 25%.\n\n' +
          'Mental shortcut: trim matching zeros. 900 ÷ 3,600 = 9 ÷ 36 = 1 ÷ 4 = 25%. Most pie-chart percentages resolve mentally with this trick.\n\n' +
          'Why the wrong options are tempting:\n' +
          '• 15% — Paediatrics share (540 ÷ 3,600). Read the wrong segment.\n' +
          '• 20% — Radiology share (720 ÷ 3,600). Read the wrong segment.\n' +
          '• 30% — Cardiology share (1,080 ÷ 3,600). The largest slice. UCAT plants the largest-segment percentage as a decoy on pie chart questions to catch students who reach for the most prominent visual without checking the label.\n\n' +
          'Key lesson — locate the named segment in the legend FIRST, then divide. Picking the biggest slice on instinct is the most common pie-chart mistake.',
      },
    ],
  },

  'scatter-plot-example': {
    id: 'qr-we-scatter-plot',
    setId: 'qr-we-scatter-plot',
    title: 'Worked example: Scatter plot',
    isFree: true,
    stimulus: {
      type: 'scatter_plot',
      context: 'Each point on the scatter plot represents one of five GP clinics, comparing average daily appointments (x-axis) with patient satisfaction score out of 100 (y-axis).',
      data: {
        title: 'Daily Appointments vs Patient Satisfaction',
        series: [
          {
            name: 'Clinics',
            points: [
              { x: 25, y: 88, label: 'A' },
              { x: 40, y: 75, label: 'B' },
              { x: 55, y: 62, label: 'C' },
              { x: 70, y: 70, label: 'D' },
              { x: 85, y: 45, label: 'E' },
            ],
          },
        ],
        xAxisLabel: 'Daily appointments',
        yAxisLabel: 'Satisfaction score',
      },
    },
    questions: [
      {
        questionId: 'qr-we-scatter-plot-q1',
        questionText: 'Which clinic does NOT fit the overall trend shown in the data?',
        options: [
          { label: 'A', text: 'Clinic A' },
          { label: 'B', text: 'Clinic C' },
          { label: 'C', text: 'Clinic D' },
          { label: 'D', text: 'Clinic E' },
        ],
        answer: 'C',
        answeringReason:
          'Step 1 — Identify the overall pattern. Reading the points left to right by appointments: A (25, 88), B (40, 75), C (55, 62), E (85, 45). Each step right brings a step down — a negative correlation between appointments and satisfaction.\n\n' +
          'Step 2 — Plot Clinic D against the trend. D sits at (70, 70) — to the right of C (55, 62) but with a HIGHER satisfaction score. From C to D, appointments went up but satisfaction went up too, breaking the otherwise consistent downward pattern.\n\n' +
          'Step 3 — D is the only point that breaks the trend. Every other clinic continues the negative correlation.\n\n' +
          'Why the wrong options are tempting:\n' +
          '• Clinic A — the highest satisfaction score. But the trend says low appointments = high satisfaction, so A fits the pattern, not breaks it.\n' +
          '• Clinic C — sits in the middle of the chart and "feels average". Pattern guessing without comparing neighbouring points.\n' +
          '• Clinic E — the lowest satisfaction score. Lowest is not the same as outlier — E continues the downward trend perfectly.\n\n' +
          'Key lesson — outliers on a scatter plot are not the smallest or largest values; they are the points that BREAK the otherwise consistent direction. Sketch the trend mentally first, then look for the single point that fails it.',
      },
    ],
  },

  'geometry-example': {
    id: 'qr-we-geometry',
    setId: 'qr-we-geometry',
    title: 'Worked example: Composite shape',
    isFree: true,
    stimulus: {
      type: 'geometry_diagram',
      context: 'The diagram shows the floor plan of an L-shaped room, drawn as two adjacent rectangles. Outer dimensions are labelled in metres; all corners are right angles.',
      data: {
        shapes: [
          { type: 'rect', x: 35, y: 90, width: 160, height: 60 },
          { type: 'rect', x: 35, y: 30, width: 100, height: 60 },
        ],
        dimensions: [
          { from: [35, 150], to: [195, 150], label: '8 m', side: 'bottom' },
          { from: [35, 30], to: [35, 150], label: '6 m', side: 'left' },
          { from: [35, 30], to: [135, 30], label: '5 m', side: 'top' },
          { from: [195, 90], to: [195, 150], label: '3 m', side: 'right' },
        ],
        viewBox: { width: 220, height: 170 },
      },
    },
    questions: [
      {
        questionId: 'qr-we-geometry-q1',
        questionText: 'A homeowner wants to lay flooring across the entire L-shaped room. Tiles cost £45 per square metre. What is the total cost?',
        options: [
          { label: 'A', text: '£675' },
          { label: 'B', text: '£1,080' },
          { label: 'C', text: '£1,755' },
          { label: 'D', text: '£2,160' },
        ],
        answer: 'C',
        answeringReason:
          'Step 1 — Read the labelled dimensions and deduce the cutout. The outer footprint is 8 m × 6 m. The labelled top is only 5 m and the labelled right edge is only 3 m, so a 3 × 3 m corner has been cut out (8 − 5 = 3, and 6 − 3 = 3).\n\n' +
          'Step 2 — Calculate the area. Easiest method: full rectangle MINUS cutout. 8 × 6 = 48 m². Cutout = 3 × 3 = 9 m². Area = 48 − 9 = 39 m².\n\n' +
          'Cross-check by partitioning differently — bottom strip = 8 × 3 = 24 m², upper-left rectangle = 5 × 3 = 15 m². Total = 24 + 15 = 39 m². ✓\n\n' +
          'Step 3 — Multiply by the unit cost. 39 × 45 = £1,755.\n\n' +
          'Why the wrong options are tempting:\n' +
          '• £675 — counts only the upper-left rectangle (15 m² × £45). Half-the-area error.\n' +
          '• £1,080 — counts only the bottom strip (24 m² × £45). The other half-the-area error.\n' +
          '• £2,160 — uses the full bounding rectangle (48 m² × £45). The classic "forgot to subtract the cutout" trap. Composite shapes always tempt you to read the outer dimensions and stop.\n\n' +
          'Key lesson — for composite shapes, either subtract the missing piece from the bounding rectangle or split into clean rectangles. Always cross-check both methods give the same area before multiplying.',
      },
    ],
  },

  'word-problem-example': {
    id: 'qr-we-word-problem',
    setId: 'qr-we-word-problem',
    title: 'Worked example: Multi-step word problem',
    isFree: true,
    stimulus: {
      type: 'text',
      text: 'A student drives 24 km to a library at 48 km/h, stays at the library for 35 minutes, and then drives back along the same route at 60 km/h.',
    },
    questions: [
      {
        questionId: 'qr-we-word-problem-q1',
        questionText: 'How long is the entire trip, including the time spent at the library?',
        options: [
          { label: 'A', text: '54 minutes' },
          { label: 'B', text: '65 minutes' },
          { label: 'C', text: '89 minutes' },
          { label: 'D', text: '105 minutes' },
        ],
        answer: 'C',
        answeringReason:
          'Plan the steps before calculating: outward time, return time, library stay, then add them all in the same units.\n\nStep 1 — Outward travel time. Time = distance ÷ speed = 24 ÷ 48 = 0.5 hours = 30 minutes.\n\nStep 2 — Return travel time. 24 ÷ 60 = 0.4 hours = 24 minutes.\n\nStep 3 — Convert before adding. The library stay is already in minutes (35), so convert both travel times to minutes too. 30 + 35 + 24 = 89 minutes.\n\nWhy the wrong options are tempting:\n• 54 minutes — adds only the two travel times (30 + 24) and forgets the 35-minute stay. Classic "missed-a-stage" error in a multi-step question.\n• 65 minutes — adds the outward journey and the library stay (30 + 35) but forgets the return journey.\n• 105 minutes — treats 0.4 hours as 40 minutes instead of 24 minutes. This is the decimal-hours trap.\n\nKey lesson: for multi-leg journey times, convert every component to the same unit BEFORE adding. The most common multi-step traps are unit mismatches and dropping one of the stages — list the steps before you calculate, and tick each one off.',
      },
    ],
  },
};

export const QR_WORKED_EXAMPLE_IDS = Object.keys(QR_WORKED_EXAMPLES);
