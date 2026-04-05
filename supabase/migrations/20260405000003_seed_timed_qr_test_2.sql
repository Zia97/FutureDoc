-- Seed: Timed QR Test 2 (test_id = 2)
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

  -- Clean up any existing data for test 2
  DELETE FROM timed_quantitative_reasoning_questions
    WHERE set_id IN (
      SELECT id FROM timed_quantitative_reasoning_sets WHERE test_id = 2
    );
  DELETE FROM timed_quantitative_reasoning_sets WHERE test_id = 2;

  INSERT INTO timed_quantitative_reasoning_tests (id, title, time_minutes)
  VALUES (2, 'QR Timed Test 2', 26)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════
  -- SET 01: Hospital Referral Pathways
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-01', 'Hospital Referral Pathways', '{
    "type": "table",
    "context": "The table below is a cross-tabulation showing how patients were referred to each department during the last quarter.",
    "data": {
      "headers": ["Referral \\ Department", "Cardiology", "Dermatology", "Orthopaedics", "Gastroenterology", "Total"],
      "rows": [
        ["GP Referral", "84", "62", "95", "48", "289"],
        ["Self-Referral", "12", "38", "18", "22", "90"],
        ["A&E Transfer", "45", "8", "32", "15", "100"],
        ["Specialist Referral", "28", "14", "?", "18", "80"],
        ["Department Total", "169", "122", "165", "103", "559"]
      ]
    }
  }'::jsonb, 0)
  RETURNING id INTO v_s01;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 'qr2-s01-q1', 'How many referrals were received by the Dermatology department in total?',
     '[{"label":"A","text":"103"},{"label":"B","text":"112"},{"label":"C","text":"122"},{"label":"D","text":"142"},{"label":"E","text":"165"}]'::jsonb,
     'C', 'Step 1: Read the Department Total row for Dermatology. Step 2: The value is 122. A common error is reading from an adjacent column such as Gastroenterology (103) or Orthopaedics (165). The answer is 122.', 0),
    (v_s01, 'qr2-s01-q2', 'How many Specialist Referrals were made to the Orthopaedics department?',
     '[{"label":"A","text":"14"},{"label":"B","text":"17"},{"label":"C","text":"20"},{"label":"D","text":"23"},{"label":"E","text":"26"}]'::jsonb,
     'C', 'Step 1: From the Specialist Referral row, the total is 80. The known values are: Cardiology = 28, Dermatology = 14, Gastroenterology = 18. Step 2: Orthopaedics = 80 − 28 − 14 − 18 = 20. A common error is subtracting from the Orthopaedics column total (165) instead of the Specialist Referral row total (80). The answer is 20.', 1),
    (v_s01, 'qr2-s01-q3', 'What percentage of all GP Referrals were directed to Cardiology? Give your answer to one decimal place.',
     '[{"label":"A","text":"24.3%"},{"label":"B","text":"26.7%"},{"label":"C","text":"29.1%"},{"label":"D","text":"31.5%"},{"label":"E","text":"33.8%"}]'::jsonb,
     'C', 'Step 1: From the GP Referral row, Cardiology = 84 and the row total = 289. Step 2: Percentage = 84 ÷ 289 × 100 = 29.1%. A common error is dividing by the Cardiology column total (169) instead of the GP Referral row total (289), which gives 49.7%. The answer is 29.1%.', 2),
    (v_s01, 'qr2-s01-q4', 'Which referral source directed the highest proportion of its total referrals to Cardiology?',
     '[{"label":"A","text":"GP Referral"},{"label":"B","text":"Self-Referral"},{"label":"C","text":"A&E Transfer"},{"label":"D","text":"Specialist Referral"},{"label":"E","text":"GP Referral and A&E Transfer equally"}]'::jsonb,
     'C', 'Step 1: Calculate the proportion of each source''s referrals that went to Cardiology. GP Referral: 84 ÷ 289 = 29.1%. Self-Referral: 12 ÷ 90 = 13.3%. A&E Transfer: 45 ÷ 100 = 45.0%. Specialist Referral: 28 ÷ 80 = 35.0%. Step 2: A&E Transfer has the highest proportion at 45.0%. A common error is comparing the raw Cardiology counts (84 for GP is higher than 45 for A&E) instead of the proportions. The answer is A&E Transfer.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 02: Artisan Bakery Monthly Revenue and Costs
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-02', 'Artisan Bakery Monthly Revenue and Costs', '{
    "type": "bar_chart",
    "context": "Profit Margin (%) = (Profit ÷ Revenue) × 100. The bakery opened in October the previous year.",
    "data": {
      "title": "Artisan Bakery — Revenue and Costs (£000s)",
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "series": [
        { "name": "Revenue", "values": [18, 22, 24, 20, 28, 32] },
        { "name": "Costs", "values": [-12, -14, -15, -14, -17, -20] }
      ],
      "yAxisLabel": "Amount (£000s)",
      "unit": "£"
    }
  }'::jsonb, 1)
  RETURNING id INTO v_s02;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 'qr2-s02-q1', 'What was the bakery''s profit in March?',
     '[{"label":"A","text":"£6,000"},{"label":"B","text":"£7,000"},{"label":"C","text":"£8,000"},{"label":"D","text":"£9,000"},{"label":"E","text":"£11,000"}]'::jsonb,
     'D', 'Step 1: From the chart, March revenue = £24,000 and March costs = £15,000 (shown as −15 on the chart). Step 2: Profit = Revenue − Costs = £24,000 − £15,000 = £9,000. A common error is reading the wrong month''s bars or confusing revenue and cost values. The answer is £9,000.', 0),
    (v_s02, 'qr2-s02-q2', 'In which month did the bakery achieve the highest profit margin?',
     '[{"label":"A","text":"February"},{"label":"B","text":"March"},{"label":"C","text":"April"},{"label":"D","text":"May"},{"label":"E","text":"June"}]'::jsonb,
     'D', 'Step 1: Calculate profit and profit margin for each month. January: (18 − 12) ÷ 18 = 33.3%. February: (22 − 14) ÷ 22 = 36.4%. March: (24 − 15) ÷ 24 = 37.5%. April: (20 − 14) ÷ 20 = 30.0%. May: (28 − 17) ÷ 28 = 39.3%. June: (32 − 20) ÷ 32 = 37.5%. Step 2: May has the highest profit margin at 39.3%. A common error is selecting the month with the highest absolute profit (June, £12,000) rather than the highest margin percentage. The answer is May.', 1),
    (v_s02, 'qr2-s02-q3', 'The bakery''s July–December profit is expected to equal 1.5 times the January–June profit. What is the expected total annual profit?',
     '[{"label":"A","text":"£78,000"},{"label":"B","text":"£104,000"},{"label":"C","text":"£120,000"},{"label":"D","text":"£130,000"},{"label":"E","text":"£156,000"}]'::jsonb,
     'D', 'Step 1: Calculate the January–June profit in £000s: (18−12) + (22−14) + (24−15) + (20−14) + (28−17) + (32−20) = 6 + 8 + 9 + 6 + 11 + 12 = 52, which is £52,000. Step 2: July–December profit = 1.5 × £52,000 = £78,000. Step 3: Total annual profit = £52,000 + £78,000 = £130,000. A common error is giving only the second-half profit (£78,000) or doubling the first half (£104,000) instead of adding 1.5 times the first half to the first half. The answer is £130,000.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 03: Snow Leopard Population
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-03', 'Snow Leopard Population', '{
    "type": "text",
    "text": "The snow leopard population in Country A is 40% of the population in Country B. The population in Country C is 50% of the population in Country A. There are 520 snow leopards in Country C."
  }'::jsonb, 2)
  RETURNING id INTO v_s03;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 'qr2-s03-q1', 'How many snow leopards are in Country B?',
     '[{"label":"A","text":"1,040"},{"label":"B","text":"1,300"},{"label":"C","text":"2,080"},{"label":"D","text":"2,600"},{"label":"E","text":"5,200"}]'::jsonb,
     'D', 'Step 1: Country C = 50% of Country A, so Country A = 520 ÷ 0.50 = 1,040. Step 2: Country A = 40% of Country B, so Country B = 1,040 ÷ 0.40 = 2,600. A common error is stopping after finding Country A (1,040) or dividing 520 directly by 0.40 (giving 1,300), which skips the chain relationship. The answer is 2,600.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 04: University Library Monthly Loans
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-04', 'University Library Monthly Loans', '{
    "type": "line_graph",
    "context": "January data for the Science faculty was unavailable due to a system error. The total Science loans across all 8 months were 11,580.",
    "data": {
      "title": "Monthly Book Loans by Faculty",
      "labels": ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
      "series": [
        { "name": "Science", "values": [1200, 1450, 1680, 980, null, 1600, 1750, 1400] },
        { "name": "Humanities", "values": [850, 1100, 1350, 720, 1050, 1200, 1380, 1420] },
        { "name": "Engineering", "values": [680, 820, 950, 540, 780, 860, 920, 980] }
      ],
      "yAxisLabel": "Number of Loans",
      "unit": ""
    }
  }'::jsonb, 3)
  RETURNING id INTO v_s04;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 'qr2-s04-q1', 'In which month did the Humanities faculty borrow the most books?',
     '[{"label":"A","text":"November"},{"label":"B","text":"January"},{"label":"C","text":"February"},{"label":"D","text":"March"},{"label":"E","text":"April"}]'::jsonb,
     'E', 'Step 1: Read the Humanities values from the graph: Sep = 850, Oct = 1,100, Nov = 1,350, Dec = 720, Jan = 1,050, Feb = 1,200, Mar = 1,380, Apr = 1,420. Step 2: The highest value is April at 1,420. A common error is selecting March (1,380) or November (1,350), which are close but not the maximum. The answer is April.', 0),
    (v_s04, 'qr2-s04-q2', 'What was the total number of books borrowed by the Engineering faculty across all 8 months?',
     '[{"label":"A","text":"5,550"},{"label":"B","text":"5,980"},{"label":"C","text":"6,230"},{"label":"D","text":"6,530"},{"label":"E","text":"6,840"}]'::jsonb,
     'D', 'Step 1: Read the Engineering values: Sep = 680, Oct = 820, Nov = 950, Dec = 540, Jan = 780, Feb = 860, Mar = 920, Apr = 980. Step 2: Total = 680 + 820 + 950 + 540 + 780 + 860 + 920 + 980 = 6,530. A common error is miscounting the months or accidentally including a value from the Science or Humanities series. The answer is 6,530.', 1),
    (v_s04, 'qr2-s04-q3', 'How many books did the Science faculty lend in January?',
     '[{"label":"A","text":"1,320"},{"label":"B","text":"1,420"},{"label":"C","text":"1,520"},{"label":"D","text":"1,620"},{"label":"E","text":"1,720"}]'::jsonb,
     'C', 'Step 1: The total Science loans across all 8 months = 11,580. Step 2: Sum of known Science loans (Sep, Oct, Nov, Dec, Feb, Mar, Apr) = 1,200 + 1,450 + 1,680 + 980 + 1,600 + 1,750 + 1,400 = 10,060. Step 3: January = 11,580 − 10,060 = 1,520. A common error is dividing the total by 8 to estimate the mean (1,447.5) instead of subtracting the known months from the stated total. The answer is 1,520.', 2),
    (v_s04, 'qr2-s04-q4', 'In November, what percentage of total loans across all three faculties came from the Science faculty? Give your answer to one decimal place.',
     '[{"label":"A","text":"38.4%"},{"label":"B","text":"40.1%"},{"label":"C","text":"42.2%"},{"label":"D","text":"44.5%"},{"label":"E","text":"46.8%"}]'::jsonb,
     'C', 'Step 1: In November — Science = 1,680, Humanities = 1,350, Engineering = 950. Step 2: Total November loans = 1,680 + 1,350 + 950 = 3,980. Step 3: Science percentage = 1,680 ÷ 3,980 × 100 = 42.2%. A common error is using the full-year Science total rather than the November-only value. The answer is 42.2%.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 05: Paint Roller Surface Areas
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-05', 'Paint Roller Surface Areas', '{
    "type": "multi",
    "items": [
      {
        "type": "table",
        "data": {
          "headers": ["Brand", "Length (cm)", "Diameter (cm)", "Weight (g)"],
          "rows": [
            ["RollEase", "25", "7", "120"],
            ["PaintPro", "30", "14", "280"],
            ["QuickCoat", "21", "7", "95"],
            ["MasterRoll", "35", "14", "340"],
            ["MiniRoll", "14", "7", "65"]
          ]
        }
      },
      {
        "type": "text",
        "text": "Curved surface area of a cylinder = πdh, where d is the diameter, h is the length, and π = 22/7."
      }
    ]
  }'::jsonb, 4)
  RETURNING id INTO v_s05;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 'qr2-s05-q1', 'What is the curved surface area of the RollEase roller?',
     '[{"label":"A","text":"462 cm²"},{"label":"B","text":"508 cm²"},{"label":"C","text":"550 cm²"},{"label":"D","text":"616 cm²"},{"label":"E","text":"700 cm²"}]'::jsonb,
     'C', 'Step 1: From the table, RollEase has length = 25 cm and diameter = 7 cm. Step 2: Using the formula, curved surface area = πdh = (22/7) × 7 × 25 = 22 × 25 = 550 cm². A common error is using the radius (3.5 cm) instead of the diameter in the given formula, which would halve the answer. The answer is 550 cm².', 0),
    (v_s05, 'qr2-s05-q2', 'Which roller has the largest curved surface area?',
     '[{"label":"A","text":"RollEase"},{"label":"B","text":"PaintPro"},{"label":"C","text":"QuickCoat"},{"label":"D","text":"MasterRoll"},{"label":"E","text":"MiniRoll"}]'::jsonb,
     'D', 'Step 1: Calculate the curved surface area for each roller using πdh with π = 22/7. RollEase: (22/7) × 7 × 25 = 550 cm². PaintPro: (22/7) × 14 × 30 = 44 × 30 = 1,320 cm². QuickCoat: (22/7) × 7 × 21 = 22 × 21 = 462 cm². MasterRoll: (22/7) × 14 × 35 = 44 × 35 = 1,540 cm². MiniRoll: (22/7) × 7 × 14 = 22 × 14 = 308 cm². Step 2: MasterRoll has the largest curved surface area at 1,540 cm². A common error is selecting the roller with the largest single dimension rather than computing the full surface area for each. The answer is MasterRoll.', 1),
    (v_s05, 'qr2-s05-q3', 'A painter needs to cover a wall area of 15,400 cm². Each pass of the roller covers exactly its curved surface area. Using the PaintPro roller, how many complete passes are needed to cover the wall?',
     '[{"label":"A","text":"10"},{"label":"B","text":"11"},{"label":"C","text":"12"},{"label":"D","text":"13"},{"label":"E","text":"14"}]'::jsonb,
     'C', 'Step 1: PaintPro curved surface area = (22/7) × 14 × 30 = 1,320 cm². Step 2: Number of passes = 15,400 ÷ 1,320 = 11.67. Step 3: Since a partial pass does not fully cover the remaining area, round up to 12 complete passes. A common error is rounding down to 11, which would leave 880 cm² uncovered. The answer is 12.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 06: Water Tank Capacity
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-06', 'Water Tank Capacity', '{
    "type": "text",
    "text": "A rectangular water tank has external dimensions 1,200 mm × 800 mm × 600 mm. The walls and base are uniformly 100 mm thick and the tank is open at the top. 1 litre = 1,000 cm³."
  }'::jsonb, 5)
  RETURNING id INTO v_s06;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 'qr2-s06-q1', 'What is the internal capacity of the tank in litres?',
     '[{"label":"A","text":"240 litres"},{"label":"B","text":"300 litres"},{"label":"C","text":"385 litres"},{"label":"D","text":"480 litres"},{"label":"E","text":"576 litres"}]'::jsonb,
     'B', 'Step 1: The walls are 100 mm thick on each side and the tank is open at the top. Internal length = 1,200 − (2 × 100) = 1,000 mm = 100 cm. Internal width = 800 − (2 × 100) = 600 mm = 60 cm. Internal height = 600 − 100 = 500 mm = 50 cm (only the base has a wall; the top is open). Step 2: Volume = 100 × 60 × 50 = 300,000 cm³. Step 3: 300,000 ÷ 1,000 = 300 litres. A common error is subtracting wall thickness from both top and bottom of the height (giving 400 mm internal height and 240 litres). The answer is 300 litres.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 07: Council Tax Bands — Berkshire
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-07', 'Council Tax Bands — Berkshire', '{
    "type": "table",
    "context": "Council Tax is a single annual charge based on the property''s valuation band. A 25% discount applies if only one adult resides in the property.",
    "data": {
      "headers": ["Band", "Property Value Range", "Annual Charge"],
      "rows": [
        ["A", "Up to £40,000", "£1,248"],
        ["B", "£40,001 – £52,000", "£1,456"],
        ["C", "£52,001 – £68,000", "£1,664"],
        ["D", "£68,001 – £88,000", "£1,872"],
        ["E", "£88,001 – £120,000", "£2,288"],
        ["F", "£120,001 – £160,000", "£2,704"]
      ]
    }
  }'::jsonb, 6)
  RETURNING id INTO v_s07;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 'qr2-s07-q1', 'A couple lives in a property valued at £75,000. How much Council Tax do they pay annually?',
     '[{"label":"A","text":"£1,456"},{"label":"B","text":"£1,664"},{"label":"C","text":"£1,872"},{"label":"D","text":"£2,080"},{"label":"E","text":"£2,288"}]'::jsonb,
     'C', 'Step 1: A property valued at £75,000 falls in Band D (£68,001 – £88,000). Step 2: The annual charge for Band D is £1,872. No discount applies as the property has more than one adult. A common error is selecting Band C or Band E by misreading the boundary values. The answer is £1,872.', 0),
    (v_s07, 'qr2-s07-q2', 'A single adult lives in a property valued at £55,000. How much Council Tax do they pay annually?',
     '[{"label":"A","text":"£1,040"},{"label":"B","text":"£1,152"},{"label":"C","text":"£1,248"},{"label":"D","text":"£1,352"},{"label":"E","text":"£1,456"}]'::jsonb,
     'C', 'Step 1: A property valued at £55,000 falls in Band C (£52,001 – £68,000). The standard annual charge is £1,664. Step 2: A single adult receives a 25% discount: £1,664 × 0.75 = £1,248. A common error is forgetting the single-adult discount entirely, giving £1,664. The answer is £1,248.', 1),
    (v_s07, 'qr2-s07-q3', 'Mrs Taylor has a Band C property and lives alone. Mr Ahmed has a Band E property and lives with his family. Over a 3-year period, how much more does Mr Ahmed pay in total than Mrs Taylor?',
     '[{"label":"A","text":"£1,872"},{"label":"B","text":"£2,496"},{"label":"C","text":"£3,120"},{"label":"D","text":"£3,744"},{"label":"E","text":"£4,368"}]'::jsonb,
     'C', 'Step 1: Mrs Taylor has Band C and lives alone: £1,664 × 0.75 = £1,248 per year. Step 2: Mr Ahmed has Band E with no discount: £2,288 per year. Step 3: Annual difference = £2,288 − £1,248 = £1,040. Step 4: Over 3 years = £1,040 × 3 = £3,120. A common error is forgetting Mrs Taylor''s single-adult discount, giving an annual difference of £2,288 − £1,664 = £624 and a 3-year total of £1,872. The answer is £3,120.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 08: Carbon Emissions by Country
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-08', 'Carbon Emissions by Country', '{
    "type": "scatter_plot",
    "data": {
      "title": "Annual CO₂ Emissions vs GDP per Capita",
      "xAxisLabel": "GDP per Capita (£000s)",
      "yAxisLabel": "CO₂ Emissions (tonnes per person)",
      "series": [
        {
          "name": "Countries",
          "points": [
            { "x": 8, "y": 2.5, "label": "A" },
            { "x": 15, "y": 4.8, "label": "B" },
            { "x": 22, "y": 6.2, "label": "C" },
            { "x": 30, "y": 9.5, "label": "D" },
            { "x": 38, "y": 7.1, "label": "E" },
            { "x": 45, "y": 12.0, "label": "F" },
            { "x": 52, "y": 8.8, "label": "G" }
          ]
        }
      ]
    }
  }'::jsonb, 7)
  RETURNING id INTO v_s08;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 'qr2-s08-q1', 'Which country has the highest CO₂ emissions per person?',
     '[{"label":"A","text":"Country C"},{"label":"B","text":"Country D"},{"label":"C","text":"Country E"},{"label":"D","text":"Country F"},{"label":"E","text":"Country G"}]'::jsonb,
     'D', 'Step 1: Read the CO₂ emissions (y-axis) for each country: A = 2.5, B = 4.8, C = 6.2, D = 9.5, E = 7.1, F = 12.0, G = 8.8. Step 2: Country F has the highest emissions at 12.0 tonnes per person. A common error is selecting Country D (9.5) or Country G (8.8), which are high but not the highest. The answer is Country F.', 0),
    (v_s08, 'qr2-s08-q2', 'How many countries have both a GDP per capita above £20,000 and CO₂ emissions below 10 tonnes per person?',
     '[{"label":"A","text":"2"},{"label":"B","text":"3"},{"label":"C","text":"4"},{"label":"D","text":"5"},{"label":"E","text":"6"}]'::jsonb,
     'C', 'Step 1: Identify countries with GDP per capita above £20,000 (x > 20): C (22, 6.2), D (30, 9.5), E (38, 7.1), F (45, 12.0), G (52, 8.8). Step 2: Of these, filter for CO₂ emissions below 10: C (6.2) ✓, D (9.5) ✓, E (7.1) ✓, G (8.8) ✓. Country F (12.0) does not qualify. Step 3: Four countries meet both conditions. A common error is including Country F or excluding Country D (whose 9.5 is just below 10). The answer is 4.', 1);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 09: Local Bus Service — Route 42
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-09', 'Local Bus Service — Route 42', '{
    "type": "multi",
    "items": [
      {
        "type": "text",
        "text": "Route 42 runs between Greenfield and Laketown. An adult single fare is £2.40. Children under 16 travel at half the adult fare. A monthly pass for unlimited travel costs £85. 1 mile = 1.6 km."
      },
      {
        "type": "table",
        "data": {
          "headers": ["Stop", "Distance from Greenfield (miles)", "Departs"],
          "rows": [
            ["Greenfield", "0", "07:15"],
            ["Millbridge", "5", "07:27"],
            ["Oakford", "12", "07:45"],
            ["Laketown", "20", "08:01"]
          ]
        }
      }
    ]
  }'::jsonb, 8)
  RETURNING id INTO v_s09;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 'qr2-s09-q1', 'How long does the bus take to travel from Greenfield to Laketown?',
     '[{"label":"A","text":"38 minutes"},{"label":"B","text":"42 minutes"},{"label":"C","text":"44 minutes"},{"label":"D","text":"46 minutes"},{"label":"E","text":"50 minutes"}]'::jsonb,
     'D', 'Step 1: The bus departs Greenfield at 07:15 and arrives at Laketown at 08:01. Step 2: Journey time = 08:01 − 07:15 = 46 minutes. A common error is miscalculating across the hour boundary. The answer is 46 minutes.', 0),
    (v_s09, 'qr2-s09-q2', 'What is the average speed of the bus between Oakford and Laketown, to the nearest mph?',
     '[{"label":"A","text":"24 mph"},{"label":"B","text":"27 mph"},{"label":"C","text":"30 mph"},{"label":"D","text":"33 mph"},{"label":"E","text":"36 mph"}]'::jsonb,
     'C', 'Step 1: Distance from Oakford to Laketown = 20 − 12 = 8 miles. Step 2: Time = 08:01 − 07:45 = 16 minutes = 16 ÷ 60 hours. Step 3: Speed = 8 ÷ (16/60) = 8 × 60 ÷ 16 = 30 mph. A common error is converting 16 minutes as 0.16 hours instead of 16/60 = 0.267 hours. The answer is 30 mph.', 1),
    (v_s09, 'qr2-s09-q3', 'What is the distance from Millbridge to Laketown in kilometres?',
     '[{"label":"A","text":"12.0 km"},{"label":"B","text":"19.2 km"},{"label":"C","text":"24.0 km"},{"label":"D","text":"32.0 km"},{"label":"E","text":"38.4 km"}]'::jsonb,
     'C', 'Step 1: Distance from Millbridge to Laketown = 20 − 5 = 15 miles. Step 2: Convert to kilometres: 15 × 1.6 = 24.0 km. A common error is converting only the Oakford distance (12 × 1.6 = 19.2 km) or the total route distance (20 × 1.6 = 32.0 km) instead of the Millbridge-to-Laketown segment. The answer is 24.0 km.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 10: Charity Fundraising Budget
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-10', 'Charity Fundraising Budget', '{
    "type": "pie_chart",
    "context": "The charity has 45 active volunteers across all fundraising activities.",
    "data": {
      "title": "Annual Fundraising Income by Source",
      "segments": [
        { "label": "Corporate Sponsorship", "value": 45000 },
        { "label": "Individual Donations", "value": 32000 },
        { "label": "Grant Funding", "value": null },
        { "label": "Event Revenue", "value": 18000 },
        { "label": "Merchandise Sales", "value": 8000 }
      ],
      "total": 120000,
      "unit": "£"
    }
  }'::jsonb, 9)
  RETURNING id INTO v_s10;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 'qr2-s10-q1', 'What was the Grant Funding amount?',
     '[{"label":"A","text":"£12,000"},{"label":"B","text":"£14,000"},{"label":"C","text":"£17,000"},{"label":"D","text":"£20,000"},{"label":"E","text":"£23,000"}]'::jsonb,
     'C', 'Step 1: The total budget is £120,000. Sum of known segments: Corporate Sponsorship £45,000 + Individual Donations £32,000 + Event Revenue £18,000 + Merchandise Sales £8,000 = £103,000. Step 2: Grant Funding = £120,000 − £103,000 = £17,000. A common error is omitting one of the smaller segments from the subtraction. The answer is £17,000.', 0),
    (v_s10, 'qr2-s10-q2', 'What percentage of the total budget was raised from sources other than Corporate Sponsorship? Give your answer to one decimal place.',
     '[{"label":"A","text":"54.2%"},{"label":"B","text":"58.3%"},{"label":"C","text":"62.5%"},{"label":"D","text":"66.7%"},{"label":"E","text":"70.8%"}]'::jsonb,
     'C', 'Step 1: Corporate Sponsorship = £45,000. Total budget = £120,000. Step 2: All other sources = £120,000 − £45,000 = £75,000. Step 3: Percentage = 75,000 ÷ 120,000 × 100 = 62.5%. A common error is calculating Corporate Sponsorship''s own percentage (37.5%) and reporting that instead of the complement, or misreading the Corporate Sponsorship value from the chart. The answer is 62.5%.', 1),
    (v_s10, 'qr2-s10-q3', 'Next year, both Corporate Sponsorship and Individual Donations are expected to grow by 10%. If all other sources remain unchanged, what will the new total budget be?',
     '[{"label":"A","text":"£120,000"},{"label":"B","text":"£123,200"},{"label":"C","text":"£124,500"},{"label":"D","text":"£127,700"},{"label":"E","text":"£132,000"}]'::jsonb,
     'D', 'Step 1: New Corporate Sponsorship = £45,000 × 1.10 = £49,500. Step 2: New Individual Donations = £32,000 × 1.10 = £35,200. Step 3: Unchanged sources = Grant Funding £17,000 + Event Revenue £18,000 + Merchandise Sales £8,000 = £43,000. Step 4: New total = £49,500 + £35,200 + £43,000 = £127,700. A common error is applying the 10% increase to only one source (giving £123,200 or £124,500) or applying 10% to the entire budget (giving £132,000). The answer is £127,700.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 11: Fencing a Rectangular Field
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-11', 'Fencing a Rectangular Field', '{
    "type": "text",
    "text": "A farmer has a rectangular field measuring 120 metres long and 80 metres wide. She wants to divide it into three equal plots by installing two internal fences running parallel to the shorter side. Fencing costs £12.50 per metre."
  }'::jsonb, 10)
  RETURNING id INTO v_s11;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 'qr2-s11-q1', 'What is the total cost of the internal fencing?',
     '[{"label":"A","text":"£1,000"},{"label":"B","text":"£1,500"},{"label":"C","text":"£2,000"},{"label":"D","text":"£3,000"},{"label":"E","text":"£5,000"}]'::jsonb,
     'C', 'Step 1: The fences run parallel to the shorter side (80 m), so each fence is 80 m long. Two fences are needed to create three equal plots. Step 2: Total fencing = 2 × 80 = 160 m. Step 3: Cost = 160 × £12.50 = £2,000. A common error is installing only one fence (£1,000) or running the fences parallel to the longer side, making each fence 120 m (total cost £3,000). The answer is £2,000.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 12: Riverside Hotel Room Prices
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-12', 'Riverside Hotel Room Prices', '{
    "type": "table",
    "context": "Weeknights are Monday to Thursday. Weekends are Friday to Sunday. Discounts and surcharges apply to the rack rate. VAT at 20% is added to the final price after all discounts or surcharges.",
    "data": {
      "headers": ["Room Type", "Rack Rate (per night)", "Weeknight Discount", "Weekend Surcharge", "Max Occupancy"],
      "rows": [
        ["Single", "£85", "15%", "0%", "1"],
        ["Double", "£120", "15%", "10%", "2"],
        ["Family", "£175", "20%", "15%", "4"],
        ["Suite", "£250", "10%", "20%", "2"],
        ["Penthouse", "£420", "0%", "25%", "4"]
      ]
    }
  }'::jsonb, 11)
  RETURNING id INTO v_s12;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 'qr2-s12-q1', 'What is the weeknight price of a Double room before VAT?',
     '[{"label":"A","text":"£96.00"},{"label":"B","text":"£102.00"},{"label":"C","text":"£108.00"},{"label":"D","text":"£114.00"},{"label":"E","text":"£120.00"}]'::jsonb,
     'B', 'Step 1: The Double room rack rate is £120 with a weeknight discount of 15%. Step 2: Weeknight price = £120 × (1 − 0.15) = £120 × 0.85 = £102.00. A common error is applying the weekend surcharge instead of the weeknight discount, or forgetting the discount entirely (£120). The answer is £102.00.', 0),
    (v_s12, 'qr2-s12-q2', 'A couple books a Suite for a Saturday night. What is the total cost including VAT?',
     '[{"label":"A","text":"£288.00"},{"label":"B","text":"£300.00"},{"label":"C","text":"£324.00"},{"label":"D","text":"£360.00"},{"label":"E","text":"£396.00"}]'::jsonb,
     'D', 'Step 1: The Suite rack rate is £250 with a weekend surcharge of 20%. Weekend price = £250 × 1.20 = £300.00. Step 2: Add 20% VAT: £300.00 × 1.20 = £360.00. A common error is forgetting to add VAT (giving £300.00) or applying the surcharge and VAT as a combined 40% increase. The answer is £360.00.', 1),
    (v_s12, 'qr2-s12-q3', 'A family books a Family room for 3 weeknights and 2 weekend nights. What is the total cost including VAT?',
     '[{"label":"A","text":"£822.50"},{"label":"B","text":"£891.00"},{"label":"C","text":"£945.00"},{"label":"D","text":"£987.00"},{"label":"E","text":"£1,050.00"}]'::jsonb,
     'D', 'Step 1: Family room rack rate = £175. Weeknight price = £175 × 0.80 = £140 per night. Weekend price = £175 × 1.15 = £201.25 per night. Step 2: 3 weeknights = 3 × £140 = £420. 2 weekend nights = 2 × £201.25 = £402.50. Step 3: Subtotal = £420 + £402.50 = £822.50. Step 4: Add 20% VAT: £822.50 × 1.20 = £987.00. A common error is forgetting VAT (giving £822.50) or applying the weeknight discount to all 5 nights. The answer is £987.00.', 2),
    (v_s12, 'qr2-s12-q4', 'A guest books 2 weeknights in a Double room and 1 weekend night in a Single room. What is the total cost including VAT?',
     '[{"label":"A","text":"£289.00"},{"label":"B","text":"£312.00"},{"label":"C","text":"£331.20"},{"label":"D","text":"£346.80"},{"label":"E","text":"£372.00"}]'::jsonb,
     'D', 'Step 1: Double weeknight: £120 × 0.85 = £102 per night. For 2 nights: £102 × 2 = £204. Step 2: Single weekend: £85 × 1.00 = £85 per night (0% surcharge). For 1 night: £85. Step 3: Subtotal = £204 + £85 = £289. Step 4: Add 20% VAT: £289 × 1.20 = £346.80. A common error is applying a weekend surcharge to the Single room (which has 0%) or forgetting VAT (giving £289.00). The answer is £346.80.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 13: L-shaped Patio Design
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-13', 'L-shaped Patio Design', '{
    "type": "geometry_diagram",
    "context": "Paving slabs for the patio surface cost £22 per m².",
    "data": {
      "title": "L-shaped Patio (plan view)",
      "viewBox": { "width": 380, "height": 290 },
      "shapes": [
        {
          "type": "polygon",
          "points": [[55, 50], [230, 50], [230, 190], [335, 190], [335, 260], [55, 260]],
          "fill": "none",
          "stroke": "#a0aec0"
        },
        {
          "type": "rect",
          "x": 230, "y": 178, "width": 12, "height": 12,
          "fill": "none",
          "stroke": "#a0aec0"
        }
      ],
      "dimensions": [
        { "from": [55, 35], "to": [230, 35], "label": "5 m", "side": "top" },
        { "from": [40, 50], "to": [40, 260], "label": "6 m", "side": "left" },
        { "from": [230, 202], "to": [335, 202], "label": "3 m", "side": "bottom" },
        { "from": [345, 190], "to": [345, 260], "label": "2 m", "side": "right" }
      ]
    }
  }'::jsonb, 12)
  RETURNING id INTO v_s13;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s13, 'qr2-s13-q1', 'What is the total area of the patio?',
     '[{"label":"A","text":"28 m²"},{"label":"B","text":"32 m²"},{"label":"C","text":"36 m²"},{"label":"D","text":"42 m²"},{"label":"E","text":"48 m²"}]'::jsonb,
     'C', 'Step 1: Derive the unlabeled dimensions. Total width along the bottom = 5 + 3 = 8 m. Inner step height = 6 − 2 = 4 m. Step 2: Method A (subtraction): Full rectangle = 8 × 6 = 48 m². Removed corner = 3 × 4 = 12 m². Area = 48 − 12 = 36 m². Method B (addition): Left rectangle = 5 × 6 = 30 m², bottom-right rectangle = 3 × 2 = 6 m². Area = 30 + 6 = 36 m². A common error is using the full rectangle area (48 m²) without subtracting the missing corner, or confusing area with perimeter (28). The answer is 36 m².', 0),
    (v_s13, 'qr2-s13-q2', 'The homeowner wants to install a decorative stone border around the entire perimeter of the patio. The border costs £6.50 per metre. What is the total cost of the border?',
     '[{"label":"A","text":"£130.00"},{"label":"B","text":"£156.00"},{"label":"C","text":"£182.00"},{"label":"D","text":"£208.00"},{"label":"E","text":"£234.00"}]'::jsonb,
     'C', 'Step 1: Identify all 6 sides of the L-shape. Labeled: top = 5 m, left = 6 m, step across = 3 m, right side = 2 m. Derived: full bottom = 5 + 3 = 8 m, inner vertical step = 6 − 2 = 4 m. Step 2: Perimeter = 5 + 4 + 3 + 2 + 8 + 6 = 28 m. Step 3: Cost = 28 × £6.50 = £182.00. A common error is treating the patio as a simple rectangle with perimeter 2 × (8 + 4) = 24 m, giving £156.00, or using the area (36 m²) instead of the perimeter, giving £234.00. The answer is £182.00.', 1);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 14: Veterinary Clinic Vaccination Records
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (2, 'qr2-set-14', 'Veterinary Clinic Vaccination Records', '{
    "type": "table",
    "context": "Figures show the number of vaccinations administered each quarter. The reptile Q4 record was lost during a database migration.",
    "data": {
      "headers": ["Animal Type", "Q1", "Q2", "Q3", "Q4"],
      "rows": [
        ["Dogs", "145", "162", "158", "180"],
        ["Cats", "98", "105", "112", "125"],
        ["Rabbits", "32", "28", "35", "30"],
        ["Reptiles", "8", "12", "10", "?"]
      ]
    }
  }'::jsonb, 13)
  RETURNING id INTO v_s14;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s14, 'qr2-s14-q1', 'How many more dog vaccinations were administered in Q4 than in Q1?',
     '[{"label":"A","text":"25"},{"label":"B","text":"30"},{"label":"C","text":"35"},{"label":"D","text":"40"},{"label":"E","text":"45"}]'::jsonb,
     'C', 'Step 1: From the Dogs row, Q4 = 180 and Q1 = 145. Step 2: Difference = 180 − 145 = 35. A common error is reading from the wrong animal row, such as Cats (125 − 98 = 27). The answer is 35.', 0),
    (v_s14, 'qr2-s14-q2', 'How many reptile vaccinations were administered in Q4?',
     '[{"label":"A","text":"8"},{"label":"B","text":"10"},{"label":"C","text":"12"},{"label":"D","text":"14"},{"label":"E","text":"Can''t Tell"}]'::jsonb,
     'E', 'Step 1: The table shows ''?'' for reptile vaccinations in Q4, and the context confirms this record was lost. Step 2: No total or mean for reptiles is provided, so there is no way to calculate the missing value from the available data. A common error is assuming the Q4 value equals the average of Q1–Q3, but the question provides no basis for this assumption. The answer is Can''t Tell.', 1);

  -- Bump content version
  UPDATE content_versions
  SET version = version + 1, updated_at = now()
  WHERE section = 'timed_quantitative_reasoning';

END $$;
