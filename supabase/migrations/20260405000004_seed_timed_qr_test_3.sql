-- Seed: Timed QR Test 3 (test_id = 3)
-- 36 questions across 14 sets, 26 minutes

DO $$
DECLARE
  v_s01 UUID;
  v_s02 UUID;
  v_s03 UUID;
  v_s04 UUID;
  v_s05 UUID;
  v_s06 UUID;
  v_s07 UUID;
  v_s08 UUID;
  v_s09 UUID;
  v_s10 UUID;
  v_s11 UUID;
  v_s12 UUID;
  v_s13 UUID;
  v_s14 UUID;
BEGIN

  -- Clean up any existing data for test 3
  DELETE FROM timed_quantitative_reasoning_questions
    WHERE set_id IN (
      SELECT id FROM timed_quantitative_reasoning_sets WHERE test_id = 3
    );
  DELETE FROM timed_quantitative_reasoning_sets WHERE test_id = 3;

  INSERT INTO timed_quantitative_reasoning_tests (id, title, time_minutes)
  VALUES (3, 'QR Timed Test 3', 26)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════
  -- SET 01: Student Exam Performance
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-01', 'Student Exam Performance', '{
    "type": "table",
    "context": "Exam results for six Year 11 students. The multiplier in brackets shows each subject''s weighting in the overall grade calculation. Weighted average = Sum of (score times weight) divided by sum of weights. All scores are out of 100.",
    "data": {
      "headers": ["Student", "English (x2)", "Maths (x3)", "Science (x2)", "History (x1)"],
      "rows": [
        ["Amira", "78", "64", "72", "86"],
        ["Ben", "62", "88", "76", "58"],
        ["Chloe", "84", "72", "68", "92"],
        ["David", "74", "80", "84", "60"],
        ["Elena", "90", "56", "78", "88"],
        ["Faisal", "72", "92", "84", "68"]
      ]
    }
  }'::jsonb, 0)
  RETURNING id INTO v_s01;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 'qr3-s01-q1', 'What is Faisal''s weighted average score?',
     '[{"label":"A","text":"78.0"},{"label":"B","text":"79.0"},{"label":"C","text":"80.5"},{"label":"D","text":"82.0"},{"label":"E","text":"84.0"}]'::jsonb,
     'D', 'Step 1: Total weight = 2 + 3 + 2 + 1 = 8. Step 2: Faisal''s weighted total = (72 x 2) + (92 x 3) + (84 x 2) + (68 x 1) = 144 + 276 + 168 + 68 = 656. Step 3: Weighted average = 656 / 8 = 82.0. A common error is calculating the simple mean of the four scores: (72 + 92 + 84 + 68) / 4 = 79.0, which ignores the weightings. The answer is 82.0.', 0),
    (v_s01, 'qr3-s01-q2', 'Which student has the highest weighted average score?',
     '[{"label":"A","text":"Ben"},{"label":"B","text":"Chloe"},{"label":"C","text":"David"},{"label":"D","text":"Elena"},{"label":"E","text":"Faisal"}]'::jsonb,
     'E', 'Step 1: Calculate each student''s weighted average (total weight = 8). Amira: (156 + 192 + 144 + 86) / 8 = 578 / 8 = 72.25. Ben: (124 + 264 + 152 + 58) / 8 = 598 / 8 = 74.75. Chloe: (168 + 216 + 136 + 92) / 8 = 612 / 8 = 76.5. David: (148 + 240 + 168 + 60) / 8 = 616 / 8 = 77.0. Elena: (180 + 168 + 156 + 88) / 8 = 592 / 8 = 74.0. Faisal: (144 + 276 + 168 + 68) / 8 = 656 / 8 = 82.0. Step 2: Faisal has the highest at 82.0. A common error is picking the student with the highest single subject score (Ben has 88 in Maths, Elena has 90 in English) rather than the highest weighted average. The answer is Faisal.', 1),
    (v_s01, 'qr3-s01-q3', 'How many additional marks would Elena need in Maths to equal David''s weighted average?',
     '[{"label":"A","text":"3"},{"label":"B","text":"5"},{"label":"C","text":"6"},{"label":"D","text":"8"},{"label":"E","text":"12"}]'::jsonb,
     'D', 'Step 1: David''s weighted average = 77.0, so the target weighted total = 77.0 x 8 = 616. Step 2: Elena''s current weighted total = (90 x 2) + (56 x 3) + (78 x 2) + (88 x 1) = 180 + 168 + 156 + 88 = 592. Step 3: Shortfall = 616 - 592 = 24 weighted marks. Step 4: Maths has a weighting of 3, so additional raw marks needed = 24 / 3 = 8. A common error is dividing by 2 instead of 3 (giving 12), or not accounting for the weighting at all (giving 24). The answer is 8.', 2),
    (v_s01, 'qr3-s01-q4', 'What percentage of students achieved a weighted average above 75.0?',
     '[{"label":"A","text":"16.7%"},{"label":"B","text":"50.0%"},{"label":"C","text":"66.7%"},{"label":"D","text":"83.3%"},{"label":"E","text":"100%"}]'::jsonb,
     'B', 'Step 1: Weighted averages are: Amira 72.25, Ben 74.75, Chloe 76.5, David 77.0, Elena 74.0, Faisal 82.0. Step 2: Students above 75.0: Chloe (76.5), David (77.0), and Faisal (82.0) = 3 out of 6 students. Step 3: Percentage = 3 / 6 x 100 = 50.0%. A common error is including Ben (74.75) by rounding up, or miscounting the qualifying students. The answer is 50.0%.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 02: Community Renewable Energy Balance
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-02', 'Community Renewable Energy Balance', '{
    "type": "bar_chart",
    "context": "Positive values indicate energy surplus sold back to the grid. Negative values indicate energy purchased from the grid. The grid buyback rate is £85 per MWh and the purchase rate is £120 per MWh.",
    "data": {
      "title": "Monthly Net Energy Balance (MWh)",
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "series": [
        { "name": "Net Balance", "values": [-45, -30, 15, 40, 55, -10] }
      ],
      "yAxisLabel": "Net Energy (MWh)",
      "unit": ""
    }
  }'::jsonb, 1)
  RETURNING id INTO v_s02;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 'qr3-s02-q1', 'In how many months did the community have an energy surplus?',
     '[{"label":"A","text":"1"},{"label":"B","text":"3"},{"label":"C","text":"4"},{"label":"D","text":"5"},{"label":"E","text":"6"}]'::jsonb,
     'B', 'Step 1: A surplus is indicated by a positive net balance. Step 2: Positive months are March (15), April (40), and May (55). Step 3: That is 3 months. A common error is counting months at zero or confusing negative values (deficit) with surplus. The answer is 3.', 0),
    (v_s02, 'qr3-s02-q2', 'What was the total net energy balance over the six months?',
     '[{"label":"A","text":"-25 MWh"},{"label":"B","text":"0 MWh"},{"label":"C","text":"15 MWh"},{"label":"D","text":"25 MWh"},{"label":"E","text":"55 MWh"}]'::jsonb,
     'D', 'Step 1: Sum all monthly balances: -45 + (-30) + 15 + 40 + 55 + (-10). Step 2: Positives: 15 + 40 + 55 = 110. Negatives: -45 + (-30) + (-10) = -85. Step 3: Total = 110 - 85 = 25 MWh. A common error is summing only the positive values (110) or only the absolute values (195). The answer is 25 MWh.', 1),
    (v_s02, 'qr3-s02-q3', 'What was the community''s net financial position over the six months? (Surplus energy sold at £85/MWh; deficit energy purchased at £120/MWh.)',
     '[{"label":"A","text":"-£2,125"},{"label":"B","text":"-£1,500"},{"label":"C","text":"-£850"},{"label":"D","text":"£850"},{"label":"E","text":"£2,125"}]'::jsonb,
     'C', 'Step 1: Total surplus sold = (15 + 40 + 55) x £85 = 110 x £85 = £9,350. Step 2: Total deficit purchased = (45 + 30 + 10) x £120 = 85 x £120 = £10,200. Step 3: Net financial position = £9,350 - £10,200 = -£850. A common error is applying the same rate to the net balance (25 x £85 = £2,125), which ignores the different buy and sell rates. The answer is -£850.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 03: Patient Drug Dosage
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-03', 'Patient Drug Dosage', '{
    "type": "multi",
    "items": [
      {
        "type": "table",
        "data": {
          "headers": ["Patient", "Weight (kg)", "Age"],
          "rows": [
            ["Patient A", "72", "45"],
            ["Patient B", "96", "62"],
            ["Patient C", "54", "28"],
            ["Patient D", "108", "55"],
            ["Patient E", "84", "38"]
          ]
        }
      },
      {
        "type": "text",
        "text": "Standard dose = 15 mg per kg of body weight per day, divided into 3 equal doses. Maximum single dose = 450 mg."
      }
    ]
  }'::jsonb, 2)
  RETURNING id INTO v_s03;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 'qr3-s03-q1', 'What is the standard single dose for Patient A?',
     '[{"label":"A","text":"240 mg"},{"label":"B","text":"360 mg"},{"label":"C","text":"420 mg"},{"label":"D","text":"540 mg"},{"label":"E","text":"1,080 mg"}]'::jsonb,
     'B', 'Step 1: Daily dose = 72 kg x 15 mg/kg = 1,080 mg. Step 2: Single dose = 1,080 / 3 = 360 mg. Step 3: 360 mg is below the 450 mg maximum, so no adjustment needed. A common error is forgetting to divide by 3 (giving 1,080 mg) or dividing by 2 instead of 3 (giving 540 mg). The answer is 360 mg.', 0),
    (v_s03, 'qr3-s03-q2', 'What is the correct single dose for Patient D?',
     '[{"label":"A","text":"270 mg"},{"label":"B","text":"360 mg"},{"label":"C","text":"420 mg"},{"label":"D","text":"450 mg"},{"label":"E","text":"540 mg"}]'::jsonb,
     'D', 'Step 1: Daily dose = 108 kg x 15 mg/kg = 1,620 mg. Step 2: Single dose = 1,620 / 3 = 540 mg. Step 3: 540 mg exceeds the maximum single dose of 450 mg, so the dose is capped at 450 mg. A common error is not applying the 450 mg cap, giving the uncapped answer of 540 mg. The answer is 450 mg.', 1),
    (v_s03, 'qr3-s03-q3', 'Patient E takes the standard dose for 7 days. How many grams of medication do they take in total?',
     '[{"label":"A","text":"2.94 g"},{"label":"B","text":"5.88 g"},{"label":"C","text":"8.82 g"},{"label":"D","text":"12.60 g"},{"label":"E","text":"26.46 g"}]'::jsonb,
     'C', 'Step 1: Daily dose = 84 kg x 15 mg/kg = 1,260 mg per day. Step 2: Single dose = 1,260 / 3 = 420 mg, which is below the 450 mg cap. Step 3: Total over 7 days = 1,260 x 7 = 8,820 mg. Step 4: Convert to grams = 8,820 / 1,000 = 8.82 g. A common error is calculating only one dose per day for 7 days (420 x 7 = 2,940 mg = 2.94 g), or two doses per day (5,880 mg = 5.88 g). The answer is 8.82 g.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 04: Regional House Price Trends
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-04', 'Regional House Price Trends', '{
    "type": "line_graph",
    "data": {
      "title": "Average House Prices by Region (£000s)",
      "labels": ["2019", "2020", "2021", "2022", "2023", "2024"],
      "series": [
        { "name": "North", "values": [145, 150, 162, 178, 185, 190] },
        { "name": "South", "values": [280, 290, 310, 340, 355, 365] },
        { "name": "Midlands", "values": [195, 200, 215, 235, 248, 255] }
      ],
      "yAxisLabel": "Average Price (£000s)",
      "unit": ""
    }
  }'::jsonb, 3)
  RETURNING id INTO v_s04;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 'qr3-s04-q1', 'What was the average house price in the South in 2022?',
     '[{"label":"A","text":"£290,000"},{"label":"B","text":"£310,000"},{"label":"C","text":"£340,000"},{"label":"D","text":"£355,000"},{"label":"E","text":"£365,000"}]'::jsonb,
     'C', 'Step 1: Read the South series at the 2022 label on the graph. Step 2: The value is 340 (in £000s) = £340,000. A common error is reading from an adjacent year such as 2021 (£310,000) or 2023 (£355,000). The answer is £340,000.', 0),
    (v_s04, 'qr3-s04-q2', 'What was the percentage increase in North house prices from 2019 to 2024? Give your answer to one decimal place.',
     '[{"label":"A","text":"23.8%"},{"label":"B","text":"26.4%"},{"label":"C","text":"31.0%"},{"label":"D","text":"45.0%"},{"label":"E","text":"76.3%"}]'::jsonb,
     'C', 'Step 1: North price in 2019 = 145 (£000s). North price in 2024 = 190 (£000s). Step 2: Increase = 190 - 145 = 45 (£000s). Step 3: Percentage increase = 45 / 145 x 100 = 31.0%. A common error is dividing by the final value (45 / 190 = 23.7%) or giving the absolute increase as a percentage of a different base. The answer is 31.0%.', 1),
    (v_s04, 'qr3-s04-q3', 'What was the average annual increase in Midlands house prices over the period 2019 to 2024?',
     '[{"label":"A","text":"£10,000"},{"label":"B","text":"£12,000"},{"label":"C","text":"£14,000"},{"label":"D","text":"£15,000"},{"label":"E","text":"£60,000"}]'::jsonb,
     'B', 'Step 1: Total increase = 255 - 195 = 60 (£000s). Step 2: Number of years from 2019 to 2024 = 5. Step 3: Average annual increase = 60 / 5 = 12 (£000s) = £12,000. A common error is dividing by 6 (the number of data points) instead of 5 (the number of intervals), giving £10,000. Another error is giving the total increase of £60,000 rather than the annual average. The answer is £12,000.', 2),
    (v_s04, 'qr3-s04-q4', 'By how much more did the South''s average price increase compared to the North''s, over the period 2019 to 2024?',
     '[{"label":"A","text":"£25,000"},{"label":"B","text":"£30,000"},{"label":"C","text":"£35,000"},{"label":"D","text":"£40,000"},{"label":"E","text":"£45,000"}]'::jsonb,
     'D', 'Step 1: South increase = 365 - 280 = 85 (£000s) = £85,000. Step 2: North increase = 190 - 145 = 45 (£000s) = £45,000. Step 3: Difference = £85,000 - £45,000 = £40,000. A common error is comparing the absolute prices rather than the increases, or comparing the 2024 values directly (365 - 190 = 175, not the correct approach). The answer is £40,000.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 05: Gym Membership Pricing
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-05', 'Gym Membership Pricing', '{
    "type": "text",
    "text": "A gym charges £45 per month for a standard membership. Members who sign up for a full year receive a 20% discount on the monthly fee. A joining fee of £75 applies to all new members regardless of membership length."
  }'::jsonb, 4)
  RETURNING id INTO v_s05;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 'qr3-s05-q1', 'What is the total cost of a one-year membership including the joining fee?',
     '[{"label":"A","text":"£432"},{"label":"B","text":"£507"},{"label":"C","text":"£540"},{"label":"D","text":"£615"},{"label":"E","text":"£690"}]'::jsonb,
     'B', 'Step 1: Monthly fee with 20% discount = £45 x 0.80 = £36. Step 2: Annual fee = £36 x 12 = £432. Step 3: Total including joining fee = £432 + £75 = £507. A common error is forgetting the discount (£45 x 12 + £75 = £615) or forgetting the joining fee (£432). The answer is £507.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 06: App Downloads by Device and Age Group
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-06', 'App Downloads by Device and Age Group', '{
    "type": "table",
    "context": "A technology company recorded app downloads over a one-month period, classified by device type and user age group. The number of Android downloads in the 61+ age group was lost during a server migration.",
    "data": {
      "headers": ["Device \\ Age Group", "18-25", "26-40", "41-60", "61+", "Total"],
      "rows": [
        ["iPhone", "480", "620", "340", "160", "1,600"],
        ["Android", "550", "480", "390", "?", "1,600"],
        ["Tablet", "120", "240", "280", "160", "800"],
        ["Total", "1,150", "1,340", "1,010", "500", "4,000"]
      ]
    }
  }'::jsonb, 5)
  RETURNING id INTO v_s06;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 'qr3-s06-q1', 'How many downloads were there across all devices for the 41-60 age group?',
     '[{"label":"A","text":"1,010"},{"label":"B","text":"1,150"},{"label":"C","text":"1,340"},{"label":"D","text":"1,600"},{"label":"E","text":"4,000"}]'::jsonb,
     'A', 'Step 1: Read the Total row for the 41-60 column. Step 2: The value is 1,010. A common error is reading from an adjacent column such as 26-40 (1,340) or 18-25 (1,150), or reading a device row total instead of the age group total. The answer is 1,010.', 0),
    (v_s06, 'qr3-s06-q2', 'What percentage of all 26-40 year old downloads were on an Android device? Give your answer to one decimal place.',
     '[{"label":"A","text":"30.0%"},{"label":"B","text":"35.8%"},{"label":"C","text":"40.0%"},{"label":"D","text":"46.3%"},{"label":"E","text":"48.0%"}]'::jsonb,
     'B', 'Step 1: Android downloads in the 26-40 group = 480. Step 2: Total downloads in the 26-40 group = 1,340. Step 3: Percentage = 480 / 1,340 x 100 = 35.8%. A common error is dividing by the Android total (480 / 1,600 = 30.0%) instead of the age group total. The answer is 35.8%.', 1),
    (v_s06, 'qr3-s06-q3', 'What percentage of all 61+ downloads were on an Android device? Give your answer to the nearest whole number.',
     '[{"label":"A","text":"24%"},{"label":"B","text":"28%"},{"label":"C","text":"32%"},{"label":"D","text":"36%"},{"label":"E","text":"44%"}]'::jsonb,
     'D', 'Step 1: Find Android 61+ downloads. From the Android row: Total (1,600) - 18-25 (550) - 26-40 (480) - 41-60 (390) = 180. Step 2: Total 61+ downloads = 500. Step 3: Percentage = 180 / 500 x 100 = 36%. A common error is using the overall total (4,000) as the denominator instead of the 61+ column total, or failing to derive the missing value first. The answer is 36%.', 2),
    (v_s06, 'qr3-s06-q4', 'Which device had the most evenly distributed downloads across the four age groups? (That is, the smallest difference between its highest and lowest age group counts.)',
     '[{"label":"A","text":"Tablet"},{"label":"B","text":"Android"},{"label":"C","text":"iPhone"},{"label":"D","text":"iPhone and Android equally"},{"label":"E","text":"Can''t Tell"}]'::jsonb,
     'A', 'Step 1: Calculate the range (highest minus lowest) for each device. iPhone: highest = 620, lowest = 160, range = 460. Android: highest = 550, lowest = 180 (derived from 1,600 - 550 - 480 - 390), range = 370. Tablet: highest = 280, lowest = 120, range = 160. Step 2: The smallest range is 160 (Tablet), meaning Tablet downloads are most evenly spread across age groups. A common error is comparing total downloads rather than the spread of values. The answer is Tablet.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 07: T-Shaped Garden Paving
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-07', 'T-Shaped Garden Paving', '{
    "type": "geometry_diagram",
    "context": "A homeowner plans to pave a T-shaped area in their garden. Paving slabs cost £15 per square metre. Edging strip for the border costs £4.50 per metre.",
    "data": {
      "title": "T-Shaped Paving Plan",
      "viewBox": { "width": 360, "height": 310 },
      "shapes": [
        {
          "type": "polygon",
          "points": [[90, 50], [270, 50], [270, 110], [210, 110], [210, 260], [150, 260], [150, 110], [90, 110]],
          "fill": "none",
          "stroke": "#a0aec0"
        },
        {
          "type": "rect",
          "x": 210,
          "y": 110,
          "width": 10,
          "height": 10,
          "fill": "none",
          "stroke": "#a0aec0"
        }
      ],
      "dimensions": [
        { "from": [90, 35], "to": [270, 35], "label": "6 m", "side": "top" },
        { "from": [78, 50], "to": [78, 110], "label": "2 m", "side": "left" },
        { "from": [138, 110], "to": [138, 260], "label": "5 m", "side": "left" },
        { "from": [150, 275], "to": [210, 275], "label": "2 m", "side": "bottom" }
      ]
    }
  }'::jsonb, 6)
  RETURNING id INTO v_s07;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 'qr3-s07-q1', 'What is the total area of the T-shaped paving?',
     '[{"label":"A","text":"16 m²"},{"label":"B","text":"18 m²"},{"label":"C","text":"20 m²"},{"label":"D","text":"22 m²"},{"label":"E","text":"30 m²"}]'::jsonb,
     'D', 'Step 1: Split the T-shape into two rectangles. The top bar is 6 m wide and 2 m deep = 6 x 2 = 12 m². The vertical stem is 2 m wide and 5 m tall = 2 x 5 = 10 m². Step 2: Total area = 12 + 10 = 22 m². A common error is calculating only the top bar (12 m²) or treating the shape as a single rectangle 6 x 5 = 30 m². The answer is 22 m².', 0),
    (v_s07, 'qr3-s07-q2', 'What is the total cost of the edging strip needed for the entire perimeter?',
     '[{"label":"A","text":"£81.00"},{"label":"B","text":"£90.00"},{"label":"C","text":"£99.00"},{"label":"D","text":"£108.00"},{"label":"E","text":"£117.00"}]'::jsonb,
     'E', 'Step 1: Trace the perimeter of the T-shape. Starting from the top-left corner going clockwise: top = 6, right side of top bar = 2, step right = (6 - 2) / 2 = 2, right side of stem = 5, bottom of stem = 2, left side of stem = 5, step left = 2, left side of top bar = 2. Step 2: Total perimeter = 6 + 2 + 2 + 5 + 2 + 5 + 2 + 2 = 26 m. Step 3: Cost = 26 x £4.50 = £117.00. A common error is using the area (22 m²) instead of the perimeter, giving 22 x £4.50 = £99.00, or missing the two step edges in the perimeter count. The answer is £117.00.', 1);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 08: Small Business Monthly Expenses
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-08', 'Small Business Monthly Expenses', '{
    "type": "pie_chart",
    "context": "The business owner is reviewing expenses for March.",
    "data": {
      "title": "Monthly Expenses by Category",
      "segments": [
        { "label": "Rent", "value": 2400 },
        { "label": "Salaries", "value": 4800 },
        { "label": "Utilities", "value": 960 },
        { "label": "Marketing", "value": 1440 },
        { "label": "Supplies", "value": 1200 },
        { "label": "Other", "value": 1200 }
      ],
      "unit": "£"
    }
  }'::jsonb, 7)
  RETURNING id INTO v_s08;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 'qr3-s08-q1', 'What percentage of total expenses went to Salaries?',
     '[{"label":"A","text":"20%"},{"label":"B","text":"28%"},{"label":"C","text":"32%"},{"label":"D","text":"36%"},{"label":"E","text":"40%"}]'::jsonb,
     'E', 'Step 1: Total expenses = £2,400 + £4,800 + £960 + £1,440 + £1,200 + £1,200 = £12,000. Step 2: Salaries percentage = £4,800 / £12,000 x 100 = 40%. A common error is dividing by only some categories rather than the full total. The answer is 40%.', 0),
    (v_s08, 'qr3-s08-q2', 'What is the ratio of Rent to Marketing in its simplest form?',
     '[{"label":"A","text":"3:2"},{"label":"B","text":"5:3"},{"label":"C","text":"2:1"},{"label":"D","text":"5:2"},{"label":"E","text":"8:3"}]'::jsonb,
     'B', 'Step 1: Rent = £2,400. Marketing = £1,440. Step 2: Ratio = 2,400 : 1,440. Divide both by their highest common factor (480): 2,400 / 480 = 5, 1,440 / 480 = 3. Step 3: Simplified ratio = 5 : 3. A common error is not fully simplifying (e.g. stopping at 10:6 or 24:14.4). The answer is 5:3.', 1),
    (v_s08, 'qr3-s08-q3', 'Next month, Rent increases by 15% and Salaries decrease by 5%. All other costs stay the same. What is the new total monthly expense?',
     '[{"label":"A","text":"£11,640"},{"label":"B","text":"£11,880"},{"label":"C","text":"£12,000"},{"label":"D","text":"£12,120"},{"label":"E","text":"£12,360"}]'::jsonb,
     'D', 'Step 1: New Rent = £2,400 x 1.15 = £2,760. Step 2: New Salaries = £4,800 x 0.95 = £4,560. Step 3: Unchanged costs = £960 + £1,440 + £1,200 + £1,200 = £4,800. Step 4: New total = £2,760 + £4,560 + £4,800 = £12,120. A common error is applying a percentage change to the total rather than to individual categories, or assuming the increases and decreases cancel out. The answer is £12,120.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 09: Bacterial Culture Growth
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-09', 'Bacterial Culture Growth', '{
    "type": "text",
    "text": "A bacterial culture in a laboratory starts with 5,000 cells. The population increases by 4% per hour under controlled conditions. No cells are removed from the culture."
  }'::jsonb, 8)
  RETURNING id INTO v_s09;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 'qr3-s09-q1', 'How many cells are in the culture after 2 hours?',
     '[{"label":"A","text":"5,408"},{"label":"B","text":"5,416"},{"label":"C","text":"5,600"},{"label":"D","text":"5,800"},{"label":"E","text":"10,400"}]'::jsonb,
     'A', 'Step 1: After 1 hour: 5,000 x 1.04 = 5,200. Step 2: After 2 hours: 5,200 x 1.04 = 5,408. A common error is using simple growth (5,000 + 2 x 200 = 5,400) instead of compound growth, which misses the 8 additional cells from growth on the first hour''s increase. Another error is doubling the original population (10,400). The answer is 5,408.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 10: Driving Route Comparison
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-10', 'Driving Route Comparison', '{
    "type": "multi",
    "items": [
      {
        "type": "text",
        "text": "A family drives from Bristol to Edinburgh. Their car uses 8 litres of fuel per 100 km. Petrol costs £1.50 per litre. 1 mile = 1.6 km."
      },
      {
        "type": "table",
        "data": {
          "headers": ["Route", "Distance (miles)", "Motorway Toll", "Estimated Time"],
          "rows": [
            ["M5/M6", "375", "£0.00", "6 h 15 min"],
            ["M4/M1", "400", "£12.50", "6 h 40 min"]
          ]
        }
      }
    ]
  }'::jsonb, 9)
  RETURNING id INTO v_s10;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 'qr3-s10-q1', 'What is the fuel cost for the M5/M6 route?',
     '[{"label":"A","text":"£45.00"},{"label":"B","text":"£56.25"},{"label":"C","text":"£72.00"},{"label":"D","text":"£80.00"},{"label":"E","text":"£96.00"}]'::jsonb,
     'C', 'Step 1: Convert miles to km: 375 x 1.6 = 600 km. Step 2: Fuel used = 600 / 100 x 8 = 48 litres. Step 3: Fuel cost = 48 x £1.50 = £72.00. A common error is forgetting to convert miles to km (375 / 100 x 8 x 1.50 = £45.00) or using the wrong conversion factor. The answer is £72.00.', 0),
    (v_s10, 'qr3-s10-q2', 'Which route has the lower total travel cost (fuel plus toll), and by how much?',
     '[{"label":"A","text":"M5/M6, by £17.30"},{"label":"B","text":"M5/M6, by £12.50"},{"label":"C","text":"M5/M6, by £4.80"},{"label":"D","text":"M4/M1, by £4.80"},{"label":"E","text":"M4/M1, by £12.50"}]'::jsonb,
     'A', 'Step 1: M5/M6 fuel cost = £72.00 (calculated previously). M5/M6 total = £72.00 + £0.00 = £72.00. Step 2: M4/M1 distance in km = 400 x 1.6 = 640 km. Fuel = 640 / 100 x 8 = 51.2 litres. Fuel cost = 51.2 x £1.50 = £76.80. M4/M1 total = £76.80 + £12.50 = £89.30. Step 3: Difference = £89.30 - £72.00 = £17.30. A common error is comparing only fuel costs without the toll, or assuming the toll makes the routes equal. The answer is M5/M6, by £17.30.', 1),
    (v_s10, 'qr3-s10-q3', 'What is the average speed of the M4/M1 route in km/h?',
     '[{"label":"A","text":"60 km/h"},{"label":"B","text":"84 km/h"},{"label":"C","text":"90 km/h"},{"label":"D","text":"96 km/h"},{"label":"E","text":"100 km/h"}]'::jsonb,
     'D', 'Step 1: M4/M1 distance = 640 km (400 miles x 1.6). Step 2: Time = 6 hours 40 minutes = 6 + 40/60 = 20/3 hours. Step 3: Average speed = 640 / (20/3) = 640 x 3/20 = 1,920 / 20 = 96 km/h. A common error is treating 6 h 40 min as 6.40 hours instead of 6.667 hours, giving 640 / 6.40 = 100 km/h. Another error is using miles (400) instead of km, giving 400 / 6.667 = 60 km/h. The answer is 96 km/h.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 11: Recipe Scaling for a Dinner Party
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-11', 'Recipe Scaling for a Dinner Party', '{
    "type": "text",
    "text": "A recipe for 6 servings of soup requires 450 g of potatoes, 200 ml of cream, and 1.2 litres of stock. Each serving also requires 15 g of butter."
  }'::jsonb, 10)
  RETURNING id INTO v_s11;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 'qr3-s11-q1', 'How many grams of potatoes are needed for 10 servings?',
     '[{"label":"A","text":"375 g"},{"label":"B","text":"450 g"},{"label":"C","text":"600 g"},{"label":"D","text":"675 g"},{"label":"E","text":"750 g"}]'::jsonb,
     'E', 'Step 1: Potatoes per serving = 450 / 6 = 75 g. Step 2: For 10 servings = 75 x 10 = 750 g. A common error is scaling to the wrong number of servings, such as 8 (giving 600 g), or using the original recipe amount unchanged (450 g). The answer is 750 g.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 12: City Health Indicators
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-12', 'City Health Indicators', '{
    "type": "scatter_plot",
    "context": "Each point represents a city. The x-axis shows hospital beds per 10,000 population and the y-axis shows life expectancy in years.",
    "data": {
      "title": "City Health Indicators",
      "xAxisLabel": "Hospital Beds per 10,000 Population",
      "yAxisLabel": "Life Expectancy (years)",
      "series": [
        {
          "name": "Cities",
          "points": [
            { "x": 25, "y": 78.5, "label": "A" },
            { "x": 40, "y": 81.2, "label": "B" },
            { "x": 18, "y": 76.0, "label": "C" },
            { "x": 55, "y": 82.8, "label": "D" },
            { "x": 32, "y": 79.6, "label": "E" },
            { "x": 48, "y": 80.4, "label": "F" },
            { "x": 22, "y": 82.0, "label": "G" }
          ]
        }
      ]
    }
  }'::jsonb, 11)
  RETURNING id INTO v_s12;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 'qr3-s12-q1', 'What is the range of life expectancy values across all seven cities?',
     '[{"label":"A","text":"4.8 years"},{"label":"B","text":"6.8 years"},{"label":"C","text":"7.2 years"},{"label":"D","text":"8.4 years"},{"label":"E","text":"37.0 years"}]'::jsonb,
     'B', 'Step 1: Highest life expectancy = City D at 82.8 years. Lowest = City C at 76.0 years. Step 2: Range = 82.8 - 76.0 = 6.8 years. A common error is calculating the range of hospital beds (55 - 18 = 37) rather than life expectancy. The answer is 6.8 years.', 0),
    (v_s12, 'qr3-s12-q2', 'City E has a population of 250,000. How many hospital beds does it have?',
     '[{"label":"A","text":"80"},{"label":"B","text":"320"},{"label":"C","text":"800"},{"label":"D","text":"3,200"},{"label":"E","text":"8,000"}]'::jsonb,
     'C', 'Step 1: City E has 32 beds per 10,000 population. Step 2: Population = 250,000 = 25 x 10,000. Step 3: Total beds = 32 x 25 = 800. A common error is multiplying 32 x 250 = 8,000 (forgetting that the rate is per 10,000, not per 1,000). The answer is 800.', 1),
    (v_s12, 'qr3-s12-q3', 'City D plans to build a new hospital, adding 200 beds. Its population is 400,000. What will its new hospital beds per 10,000 population figure be?',
     '[{"label":"A","text":"55.5"},{"label":"B","text":"56.0"},{"label":"C","text":"57.5"},{"label":"D","text":"58.5"},{"label":"E","text":"60.0"}]'::jsonb,
     'E', 'Step 1: City D currently has 55 beds per 10,000 people. Population = 400,000 = 40 x 10,000. Step 2: Current total beds = 55 x 40 = 2,200. Step 3: New total beds = 2,200 + 200 = 2,400. Step 4: New rate = 2,400 / 40 = 60.0 beds per 10,000. A common error is simply adding 200 / 10,000 = 0.02 to the rate, or not converting the population to units of 10,000. The answer is 60.0.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 13: UK Income Tax Calculation
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-13', 'UK Income Tax Calculation', '{
    "type": "table",
    "context": "National Insurance is not included. Figures are for the 2025/26 tax year.",
    "data": {
      "headers": ["Taxable Income Band", "Rate"],
      "rows": [
        ["£0 - £12,570", "0% (Personal Allowance)"],
        ["£12,571 - £50,270", "20% (Basic Rate)"],
        ["£50,271 - £125,140", "40% (Higher Rate)"]
      ]
    }
  }'::jsonb, 12)
  RETURNING id INTO v_s13;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 'qr3-s13-q1', 'Alice earns £42,000 per year. How much income tax does she pay?',
     '[{"label":"A","text":"£5,886"},{"label":"B","text":"£6,400"},{"label":"C","text":"£7,540"},{"label":"D","text":"£8,400"},{"label":"E","text":"£10,060"}]'::jsonb,
     'A', 'Step 1: Personal Allowance: first £12,570 at 0% = £0. Step 2: Basic Rate: £42,000 - £12,570 = £29,430 at 20% = £5,886. Step 3: Total tax = £0 + £5,886 = £5,886. A common error is applying 20% to the entire income (£42,000 x 0.20 = £8,400), which ignores the tax-free Personal Allowance. The answer is £5,886.', 0),
    (v_s13, 'qr3-s13-q2', 'Ben earns £65,000 per year. How much income tax does he pay?',
     '[{"label":"A","text":"£7,540"},{"label":"B","text":"£10,486"},{"label":"C","text":"£13,432"},{"label":"D","text":"£18,892"},{"label":"E","text":"£26,000"}]'::jsonb,
     'C', 'Step 1: Personal Allowance: first £12,570 at 0% = £0. Step 2: Basic Rate: £50,270 - £12,570 = £37,700 at 20% = £7,540. Step 3: Higher Rate: £65,000 - £50,270 = £14,730 at 40% = £5,892. Step 4: Total tax = £0 + £7,540 + £5,892 = £13,432. A common error is applying 20% to the full income (£65,000 x 0.20 = £13,000) or applying 40% to the full income (£65,000 x 0.40 = £26,000), which ignores progressive banding. The answer is £13,432.', 1),
    (v_s13, 'qr3-s13-q3', 'Carol pays exactly £9,486 in income tax. What is her annual salary?',
     '[{"label":"A","text":"£47,430"},{"label":"B","text":"£55,135"},{"label":"C","text":"£59,716"},{"label":"D","text":"£62,000"},{"label":"E","text":"£74,300"}]'::jsonb,
     'B', 'Step 1: The full Basic Rate band generates £37,700 x 0.20 = £7,540 in tax. Step 2: Carol''s remaining tax in the Higher Rate band = £9,486 - £7,540 = £1,946. Step 3: Income taxed at 40%: £1,946 / 0.40 = £4,865. Step 4: Total salary = £50,270 + £4,865 = £55,135. Verification: PA = £0, Basic = £7,540, Higher = £1,946, Total = £9,486. A common error is dividing total tax by 20% (£9,486 / 0.20 = £47,430), which assumes all income is taxed at a single flat rate. The answer is £55,135.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 14: Courier Delivery Zones
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (3, 'qr3-set-14', 'Courier Delivery Zones', '{
    "type": "text",
    "text": "A courier charges a base fee of £4.50 per parcel. Zone A deliveries cost £1.20 per kg and Zone B deliveries cost £0.80 per kg. A customer sends two parcels: one weighing 5 kg and one weighing 3 kg. The receipt shows both parcels were sent on the same day but does not specify each parcel''s destination zone."
  }'::jsonb, 13)
  RETURNING id INTO v_s14;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 'qr3-s14-q1', 'What was the total cost of sending both parcels?',
     '[{"label":"A","text":"£15.40"},{"label":"B","text":"£16.60"},{"label":"C","text":"£17.40"},{"label":"D","text":"£18.60"},{"label":"E","text":"Can''t Tell"}]'::jsonb,
     'E', 'Step 1: The total cost depends on which parcel goes to which zone. If both go to Zone B: (£4.50 + 5 x £0.80) + (£4.50 + 3 x £0.80) = £8.50 + £6.90 = £15.40. If 5 kg to Zone B and 3 kg to Zone A: £8.50 + £8.10 = £16.60. If 5 kg to Zone A and 3 kg to Zone B: £10.50 + £6.90 = £17.40. If both to Zone A: £10.50 + £8.10 = £18.60. Step 2: Since the receipt does not specify each parcel''s destination zone, the total cost cannot be determined. A common error is assuming both parcels go to the same zone or that the heavier parcel must go to the more expensive zone. The answer is Can''t Tell.', 0);

END $$;
