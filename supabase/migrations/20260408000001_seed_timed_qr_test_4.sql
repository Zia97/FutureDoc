-- Seed: Timed QR Test 4 (test_id = 4)
-- 36 questions across 12 sets, 26 minutes

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
BEGIN

  -- Clean up any existing data for test 4
  DELETE FROM timed_quantitative_reasoning_questions
    WHERE set_id IN (
      SELECT id FROM timed_quantitative_reasoning_sets WHERE test_id = 4
    );
  DELETE FROM timed_quantitative_reasoning_sets WHERE test_id = 4;

  INSERT INTO timed_quantitative_reasoning_tests (id, title, time_minutes)
  VALUES (4, 'QR Timed Test 4', 26)
  ON CONFLICT (id) DO NOTHING;

  -- ═══════════════════════════════════════════════════════════════
  -- SET 01: Commuter Survey by Borough
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-01', 'Commuter Survey by Borough', '{
    "type": "table",
    "context": "A commuter survey of 2,900 residents across four boroughs recorded where each person lives (rows) and where they work (columns).",
    "data": {
      "headers": ["Home \\ Workplace", "Eastham", "Northwick", "Westford", "Southley", "Home Total"],
      "rows": [
        ["Eastham", "480", "160", "80", "80", "800"],
        ["Northwick", "120", "360", "120", "100", "700"],
        ["Westford", "60", "90", "400", "50", "600"],
        ["Southley", "40", "90", "100", "570", "800"],
        ["Workplace Total", "700", "700", "700", "800", "2900"]
      ]
    }
  }'::jsonb, 0)
  RETURNING id INTO v_s01;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s01, 'qr4-s01-q1', 'How many people live in Westford and commute to Northwick for work?',
     '[{"label":"A","text":"50"},{"label":"B","text":"60"},{"label":"C","text":"90"},{"label":"D","text":"100"},{"label":"E","text":"120"}]'::jsonb,
     'C', 'From the cross-tabulation table, find the Westford row (home borough) and the Northwick column (workplace). The intersection shows 90. A common error is reading the reversed cell — Northwick residents working in Westford (120) — by confusing rows and columns. The answer is 90.', 0),
    (v_s01, 'qr4-s01-q2', 'What percentage of Northwick residents work outside their own borough, to the nearest 0.1%?',
     '[{"label":"A","text":"34.0%"},{"label":"B","text":"42.5%"},{"label":"C","text":"48.6%"},{"label":"D","text":"51.4%"},{"label":"E","text":"56.3%"}]'::jsonb,
     'C', 'Step 1: From the Northwick row, the total number of Northwick residents is 700 (Home Total). Step 2: Northwick residents working IN Northwick (the diagonal cell) = 360. Step 3: Northwick residents working OUTSIDE = 700 − 360 = 340. Step 4: Percentage = 340 ÷ 700 × 100 = 48.6%. A common error is calculating the percentage working IN Northwick (360 ÷ 700 = 51.4%) instead of outside. The answer is 48.6%.', 1),
    (v_s01, 'qr4-s01-q3', 'How many Westford residents who work in Northwick commute more than 10 km?',
     '[{"label":"A","text":"18"},{"label":"B","text":"36"},{"label":"C","text":"54"},{"label":"D","text":"90"},{"label":"E","text":"Can''t Tell"}]'::jsonb,
     'E', 'The survey records where people live and where they work. It does not include any information about travel distances between boroughs or the specific locations of individuals within each borough. Without distance data, the number commuting more than 10 km cannot be determined. The answer is Can''t Tell.', 2),
    (v_s01, 'qr4-s01-q4', 'The council plans to build a new business park in Westford, creating 350 new jobs. These jobs will be filled by residents of all four boroughs in the same proportions as the current Westford workplace column. How many of the new jobs would be filled by Northwick residents?',
     '[{"label":"A","text":"40"},{"label":"B","text":"50"},{"label":"C","text":"60"},{"label":"D","text":"120"},{"label":"E","text":"200"}]'::jsonb,
     'C', 'Step 1: From the Westford workplace column, total workers = 700. Of these, 120 are Northwick residents. Step 2: Northwick''s proportion = 120/700. Step 3: Of 350 new jobs, Northwick share = 350 × (120 ÷ 700) = 350 × 120 ÷ 700 = 60. A common error is reading the wrong cell — e.g. using 80 (Eastham→Westford) or 90 (Westford→Northwick, reading the row instead of the column). The answer is 60.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 02: Annual Visitor Numbers at UK Heritage Sites
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-02', 'Annual Visitor Numbers at UK Heritage Sites', '{
    "type": "bar_chart",
    "data": {
      "title": "Annual Visitors by Heritage Site (2025)",
      "labels": ["Castle Moor", "Abbey Fields", "Roman Baths", "Harbour Fort", "Cathedral Close"],
      "series": [
        { "name": "Adult Visitors", "values": [16000, 12000, 24000, 10000, 15000] },
        { "name": "Child Visitors", "values": [8000, 9000, 16000, 2500, 6000] }
      ],
      "yAxisLabel": "Number of Visitors",
      "unit": ""
    }
  }'::jsonb, 1)
  RETURNING id INTO v_s02;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s02, 'qr4-s02-q1', 'What was the total number of visitors to Roman Baths in 2025?',
     '[{"label":"A","text":"16,000"},{"label":"B","text":"24,000"},{"label":"C","text":"33,000"},{"label":"D","text":"40,000"},{"label":"E","text":"48,000"}]'::jsonb,
     'D', 'Step 1: Roman Baths adult visitors = 24,000. Step 2: Roman Baths child visitors = 16,000. Step 3: Total = 24,000 + 16,000 = 40,000. A common error is reading only the adult bar (24,000) and forgetting to add child visitors. The answer is 40,000.', 0),
    (v_s02, 'qr4-s02-q2', 'What percentage of visitors to Abbey Fields were children, to the nearest whole percent?',
     '[{"label":"A","text":"33%"},{"label":"B","text":"38%"},{"label":"C","text":"43%"},{"label":"D","text":"57%"},{"label":"E","text":"75%"}]'::jsonb,
     'C', 'Step 1: Abbey Fields children = 9,000, adults = 12,000. Step 2: Total = 12,000 + 9,000 = 21,000. Step 3: Percentage = (9,000 ÷ 21,000) × 100 = 42.9% ≈ 43%. A common error is dividing children by adults only (9,000 ÷ 12,000 = 75%) instead of by total visitors. Another error is calculating the adult percentage (12,000 ÷ 21,000 = 57%). The answer is 43%.', 1),
    (v_s02, 'qr4-s02-q3', 'Which site had the highest ratio of adult visitors to child visitors?',
     '[{"label":"A","text":"Abbey Fields"},{"label":"B","text":"Castle Moor"},{"label":"C","text":"Cathedral Close"},{"label":"D","text":"Harbour Fort"},{"label":"E","text":"Roman Baths"}]'::jsonb,
     'D', 'Calculate the adult:child ratio for each site: Castle Moor = 16,000 ÷ 8,000 = 2.00; Abbey Fields = 12,000 ÷ 9,000 = 1.33; Roman Baths = 24,000 ÷ 16,000 = 1.50; Harbour Fort = 10,000 ÷ 2,500 = 4.00; Cathedral Close = 15,000 ÷ 6,000 = 2.50. The highest ratio is Harbour Fort at 4.00. A common error is selecting Roman Baths because it has the most adult visitors in absolute terms (24,000), without considering the ratio. The answer is Harbour Fort.', 2),
    (v_s02, 'qr4-s02-q4', 'A marketing campaign increases child visitors at Harbour Fort by 60% the following year, while adult visitors remain the same. What would be the new total number of visitors to Harbour Fort?',
     '[{"label":"A","text":"11,000"},{"label":"B","text":"11,500"},{"label":"C","text":"12,500"},{"label":"D","text":"14,000"},{"label":"E","text":"16,000"}]'::jsonb,
     'D', 'Step 1: Current child visitors = 2,500. After 60% increase: 2,500 × 1.60 = 4,000. Step 2: Adult visitors remain at 10,000. Step 3: New total = 10,000 + 4,000 = 14,000. A common error is calculating 60% of 2,500 as the new count (1,500) instead of the increase, giving 10,000 + 1,500 = 11,500. Another error is using the original total of 12,500 without applying the increase. The answer is 14,000.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 03: Cylindrical Grain Silo
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-03', 'Cylindrical Grain Silo', '{
    "type": "text",
    "text": "A grain silo has a cylindrical body with an internal diameter of 6 metres and a height of 14 metres. One cubic metre of grain weighs 720 kg. Use π = 3.14."
  }'::jsonb, 2)
  RETURNING id INTO v_s03;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s03, 'qr4-s03-q1', 'What is the maximum weight of grain the silo can hold, to the nearest tonne? [1 tonne = 1,000 kg]',
     '[{"label":"A","text":"190 tonnes"},{"label":"B","text":"285 tonnes"},{"label":"C","text":"396 tonnes"},{"label":"D","text":"570 tonnes"},{"label":"E","text":"1,140 tonnes"}]'::jsonb,
     'B', 'Step 1: The diameter is 6 m, so radius = 6 ÷ 2 = 3 m. Step 2: Volume = π × r² × h = 3.14 × 9 × 14 = 3.14 × 126 = 395.64 m³. Step 3: Weight = 395.64 × 720 = 284,861 kg. Step 4: Convert: 284,861 ÷ 1,000 = 285 tonnes (to the nearest tonne). The key trap is using the diameter (6 m) directly as the radius, which gives π × 36 × 14 = 1,582.56 m³ and a weight of 1,140 tonnes — four times too large. The answer is 285 tonnes.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 04: Monthly Average Temperature in Three UK Cities
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-04', 'Monthly Average Temperature in Three UK Cities', '{
    "type": "line_graph",
    "data": {
      "title": "Monthly Average Temperature (2025)",
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      "series": [
        { "name": "London", "values": [5, 6, 9, 12, 16, 19, 23, 20] },
        { "name": "Manchester", "values": [4, 5, 7, 10, 14, 17, 19, 18] },
        { "name": "Edinburgh", "values": [3, 4, 6, 9, 12, 14, 17, 16] }
      ],
      "yAxisLabel": "Temperature (°C)",
      "unit": ""
    }
  }'::jsonb, 3)
  RETURNING id INTO v_s04;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s04, 'qr4-s04-q1', 'What was the average temperature in Edinburgh in May?',
     '[{"label":"A","text":"9°C"},{"label":"B","text":"12°C"},{"label":"C","text":"14°C"},{"label":"D","text":"16°C"},{"label":"E","text":"19°C"}]'::jsonb,
     'B', 'From the line graph, read the Edinburgh line at May: the value is 12°C. A common error is reading the Manchester line (14°C) or the London line (16°C) instead of Edinburgh. The answer is 12°C.', 0),
    (v_s04, 'qr4-s04-q2', 'In which month was the difference in average temperature between London and Edinburgh greatest?',
     '[{"label":"A","text":"April"},{"label":"B","text":"May"},{"label":"C","text":"June"},{"label":"D","text":"July"},{"label":"E","text":"August"}]'::jsonb,
     'D', 'Calculate the difference (London − Edinburgh) for each month: Jan = 5−3 = 2, Feb = 6−4 = 2, Mar = 9−6 = 3, Apr = 12−9 = 3, May = 16−12 = 4, Jun = 19−14 = 5, Jul = 23−17 = 6, Aug = 20−16 = 4. The greatest difference is 6°C in July. A common error is selecting June (difference of 5°C) or confusing the largest absolute temperature (July, London = 23°C) with the largest difference. The answer is July.', 1),
    (v_s04, 'qr4-s04-q3', 'What was the mean average temperature in Manchester across all eight months, to the nearest 0.1°C?',
     '[{"label":"A","text":"10.5°C"},{"label":"B","text":"11.0°C"},{"label":"C","text":"11.5°C"},{"label":"D","text":"11.8°C"},{"label":"E","text":"12.5°C"}]'::jsonb,
     'D', 'Step 1: Sum Manchester temperatures: 4 + 5 + 7 + 10 + 14 + 17 + 19 + 18 = 94. Step 2: Mean = 94 ÷ 8 = 11.75°C, which rounds to 11.8°C. A common error is dividing by 12 (for all months in a year) instead of 8 (the number of months shown): 94 ÷ 12 = 7.8°C, or summing incorrectly. The answer is 11.8°C.', 2),
    (v_s04, 'qr4-s04-q4', 'An outdoor café opens only in months where the average temperature is at least 15°C in both London and Edinburgh. In how many of the eight months shown was the café open?',
     '[{"label":"A","text":"1"},{"label":"B","text":"2"},{"label":"C","text":"3"},{"label":"D","text":"4"},{"label":"E","text":"5"}]'::jsonb,
     'B', 'Step 1: Identify months where London ≥ 15°C: May (16), June (19), July (23), August (20) = 4 months. Step 2: Identify months where Edinburgh ≥ 15°C: July (17), August (16) = 2 months. Step 3: Both conditions met: July and August = 2 months. The key trap is counting London alone (4 months) without checking Edinburgh. Edinburgh’s June temperature is only 14°C, which fails the ≥ 15°C threshold. The answer is 2.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 05: Greenhouse Gas Intensity by Sector
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-05', 'Greenhouse Gas Intensity by Sector', '{
    "type": "multi",
    "items": [
      {
        "type": "table",
        "data": {
          "headers": ["Sector", "Emissions (kt CO₂e)", "Revenue (£m)", "Employees (000s)"],
          "rows": [
            ["Manufacturing", "420", "2800", "85"],
            ["Agriculture", "270", "900", "42"],
            ["Transport", "640", "3200", "120"],
            ["Energy", "700", "5000", "38"],
            ["Construction", "240", "1500", "65"]
          ]
        }
      },
      {
        "type": "text",
        "text": "Carbon Intensity = Emissions (kt CO₂e) ÷ Revenue (£m). A lower carbon intensity indicates a more carbon-efficient sector."
      }
    ]
  }'::jsonb, 4)
  RETURNING id INTO v_s05;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s05, 'qr4-s05-q1', 'What is the carbon intensity of the Manufacturing sector?',
     '[{"label":"A","text":"0.10"},{"label":"B","text":"0.12"},{"label":"C","text":"0.15"},{"label":"D","text":"0.17"},{"label":"E","text":"0.20"}]'::jsonb,
     'C', 'Using the formula: Carbon Intensity = Emissions ÷ Revenue. Manufacturing: 420 ÷ 2,800 = 0.15. A common error is dividing Revenue by Emissions (2,800 ÷ 420 = 6.67) — the inverse. The answer is 0.15.', 0),
    (v_s05, 'qr4-s05-q2', 'Which sector is the most carbon-efficient?',
     '[{"label":"A","text":"Agriculture"},{"label":"B","text":"Construction"},{"label":"C","text":"Energy"},{"label":"D","text":"Manufacturing"},{"label":"E","text":"Transport"}]'::jsonb,
     'C', 'Calculate carbon intensity for each: Manufacturing = 420/2800 = 0.15; Agriculture = 270/900 = 0.30; Transport = 640/3200 = 0.20; Energy = 700/5000 = 0.14; Construction = 240/1500 = 0.16. The lowest (most efficient) is Energy at 0.14. A common error is selecting the sector with the lowest absolute emissions — Construction at 240 kt — without applying the formula. The answer is Energy.', 1),
    (v_s05, 'qr4-s05-q3', 'If Transport reduces its emissions by 15% while revenue stays the same, what would its new carbon intensity be?',
     '[{"label":"A","text":"0.15"},{"label":"B","text":"0.17"},{"label":"C","text":"0.19"},{"label":"D","text":"0.20"},{"label":"E","text":"0.23"}]'::jsonb,
     'B', 'Step 1: Transport''s current emissions = 640 kt. After 15% reduction: 640 × 0.85 = 544 kt. Step 2: Revenue stays at £3,200m. Step 3: New carbon intensity = 544 ÷ 3,200 = 0.17. A common error is using the original carbon intensity (0.20) without applying the reduction. The answer is 0.17.', 2),
    (v_s05, 'qr4-s05-q4', 'The government has set a target carbon intensity of below 0.20 for all sectors. How many sectors currently meet this target?',
     '[{"label":"A","text":"1"},{"label":"B","text":"2"},{"label":"C","text":"3"},{"label":"D","text":"4"},{"label":"E","text":"5"}]'::jsonb,
     'C', 'Carbon intensities: Manufacturing = 0.15, Agriculture = 0.30, Transport = 0.20, Energy = 0.14, Construction = 0.16. The target is strictly below 0.20. Sectors meeting this: Energy (0.14), Manufacturing (0.15), Construction (0.16) = 3 sectors. The key trap is including Transport, which has a carbon intensity of exactly 0.20 — equal to the target but NOT below it. The answer is 3.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 06: Loyalty Weekend Electronics Discount
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-06', 'Loyalty Weekend Electronics Discount', '{
    "type": "text",
    "text": "An electronics store runs a ''Loyalty Weekend'' promotion: first, a 15% discount is applied to the marked price, then a further 10% discount is applied to the already-reduced price. The discounts cannot be combined into a single reduction."
  }'::jsonb, 5)
  RETURNING id INTO v_s06;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s06, 'qr4-s06-q1', 'A customer buys a laptop with a marked price of £840. What is the final price the customer pays?',
     '[{"label":"A","text":"£588.00"},{"label":"B","text":"£630.00"},{"label":"C","text":"£642.60"},{"label":"D","text":"£714.00"},{"label":"E","text":"£756.00"}]'::jsonb,
     'C', 'Step 1: Apply the 15% discount: £840 × 0.85 = £714.00. Step 2: Apply the 10% discount to the reduced price: £714 × 0.90 = £642.60. The key trap is adding the discounts (15% + 10% = 25%) and applying a single 25% reduction: £840 × 0.75 = £630.00. Sequential discounts must be applied multiplicatively (0.85 × 0.90 = 0.765), not additively. The answer is £642.60.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 07: Cereal Nutrition Comparison
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-07', 'Cereal Nutrition Comparison', '{
    "type": "table",
    "context": "Nutritional information per 100g for five cereals, with recommended serving sizes.",
    "data": {
      "headers": ["Cereal", "Energy (kcal)", "Protein (g)", "Fibre (g)", "Sugar (g)", "Fat (g)", "Serving Size (g)"],
      "rows": [
        ["Oat Crunch", "380", "11", "8.5", "14", "7", "45"],
        ["Wheat Flakes", "360", "10", "3.5", "20", "2", "30"],
        ["Bran Bites", "320", "9", "15", "12", "3", "40"],
        ["Honey Puffs", "400", "6", "2", "28", "5", "35"],
        ["Granola Mix", "450", "8", "6", "22", "18", "50"]
      ]
    }
  }'::jsonb, 6)
  RETURNING id INTO v_s07;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s07, 'qr4-s07-q1', 'Which cereal has the highest fibre content per 100g?',
     '[{"label":"A","text":"Bran Bites"},{"label":"B","text":"Granola Mix"},{"label":"C","text":"Honey Puffs"},{"label":"D","text":"Oat Crunch"},{"label":"E","text":"Wheat Flakes"}]'::jsonb,
     'A', 'Comparing the Fibre column: Oat Crunch = 8.5g, Wheat Flakes = 3.5g, Bran Bites = 15g, Honey Puffs = 2g, Granola Mix = 6g. The highest fibre per 100g is Bran Bites at 15g. The answer is Bran Bites.', 0),
    (v_s07, 'qr4-s07-q2', 'How many grams of protein are in one recommended serving of Oat Crunch?',
     '[{"label":"A","text":"3.15g"},{"label":"B","text":"4.50g"},{"label":"C","text":"4.95g"},{"label":"D","text":"5.50g"},{"label":"E","text":"11.00g"}]'::jsonb,
     'C', 'Step 1: Oat Crunch has 11g protein per 100g and a serving size of 45g. Step 2: Protein per serving = 11 × (45 ÷ 100) = 11 × 0.45 = 4.95g. A common error is using the per-100g value directly (11g, option E) without scaling to the serving size. The answer is 4.95g.', 1),
    (v_s07, 'qr4-s07-q3', 'Which cereal contains the most sugar per recommended serving?',
     '[{"label":"A","text":"Bran Bites"},{"label":"B","text":"Granola Mix"},{"label":"C","text":"Honey Puffs"},{"label":"D","text":"Oat Crunch"},{"label":"E","text":"Wheat Flakes"}]'::jsonb,
     'B', 'Calculate sugar per serving for each: Oat Crunch = 14 × 0.45 = 6.30g; Wheat Flakes = 20 × 0.30 = 6.00g; Bran Bites = 12 × 0.40 = 4.80g; Honey Puffs = 28 × 0.35 = 9.80g; Granola Mix = 22 × 0.50 = 11.00g. The highest is Granola Mix at 11.00g. The trap is selecting Honey Puffs, which has the highest sugar per 100g (28g) but a smaller serving size (35g), so less sugar per serving than Granola Mix (50g serving). The answer is Granola Mix.', 2),
    (v_s07, 'qr4-s07-q4', 'Alex eats 60g of Bran Bites for breakfast and 40g of Granola Mix as a snack. What is the total energy intake from these two portions?',
     '[{"label":"A","text":"180 kcal"},{"label":"B","text":"192 kcal"},{"label":"C","text":"308 kcal"},{"label":"D","text":"372 kcal"},{"label":"E","text":"770 kcal"}]'::jsonb,
     'D', 'Step 1: Energy from 60g Bran Bites: 320 × (60 ÷ 100) = 320 × 0.6 = 192 kcal. Step 2: Energy from 40g Granola Mix: 450 × (40 ÷ 100) = 450 × 0.4 = 180 kcal. Step 3: Total = 192 + 180 = 372 kcal. A common error is adding the per-100g values directly: 320 + 450 = 770 kcal, without scaling to actual portions. The answer is 372 kcal.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 08: School Subject Enrolment
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-08', 'School Subject Enrolment', '{
    "type": "pie_chart",
    "data": {
      "title": "Subject Enrolment at Greenfield Academy",
      "segments": [
        { "label": "English", "value": 320 },
        { "label": "Mathematics", "value": 280 },
        { "label": "Sciences", "value": null },
        { "label": "Humanities", "value": 210 },
        { "label": "Arts", "value": 90 }
      ],
      "total": 1200
    }
  }'::jsonb, 7)
  RETURNING id INTO v_s08;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s08, 'qr4-s08-q1', 'How many students are enrolled in Sciences?',
     '[{"label":"A","text":"210"},{"label":"B","text":"260"},{"label":"C","text":"280"},{"label":"D","text":"300"},{"label":"E","text":"320"}]'::jsonb,
     'D', 'Step 1: Total enrolment = 1,200. Sum of known subjects: English (320) + Mathematics (280) + Humanities (210) + Arts (90) = 900. Step 2: Sciences = 1,200 − 900 = 300. A common error is confusing segment values and reading an existing value instead of calculating the missing one. The answer is 300.', 0),
    (v_s08, 'qr4-s08-q2', 'What percentage of students are enrolled in Humanities?',
     '[{"label":"A","text":"14.0%"},{"label":"B","text":"16.5%"},{"label":"C","text":"17.5%"},{"label":"D","text":"21.0%"},{"label":"E","text":"25.0%"}]'::jsonb,
     'C', 'Step 1: Humanities = 210 students. Total = 1,200. Step 2: Percentage = (210 ÷ 1,200) × 100 = 17.5%. A common error is dividing by 900 (the sum of visible segments only) instead of the stated total of 1,200, giving 23.3%. The answer is 17.5%.', 1),
    (v_s08, 'qr4-s08-q3', 'The school plans to increase total enrolment to 1,500 next year, keeping the same proportion in each subject. How many additional Mathematics students would be needed?',
     '[{"label":"A","text":"35"},{"label":"B","text":"56"},{"label":"C","text":"70"},{"label":"D","text":"280"},{"label":"E","text":"350"}]'::jsonb,
     'C', 'Step 1: Current Mathematics proportion = 280 out of 1,200. Step 2: At 1,500 total: new Mathematics = 1,500 × (280 ÷ 1,200) = 1,500 × 280 ÷ 1,200 = 350. Step 3: Additional = 350 − 280 = 70. A common error is reporting 350 (the new total) instead of the increase of 70. The answer is 70 additional students.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 09: Marathon Training and Finish Times
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-09', 'Marathon Training and Finish Times', '{
    "type": "scatter_plot",
    "data": {
      "title": "Marathon Training Volume vs Finish Time",
      "xAxisLabel": "Training Volume (km per week)",
      "yAxisLabel": "Finish Time (minutes)",
      "series": [
        {
          "name": "Runners",
          "points": [
            { "x": 30, "y": 295, "label": "F" },
            { "x": 40, "y": 265, "label": "E" },
            { "x": 50, "y": 248, "label": "D" },
            { "x": 55, "y": 280, "label": "G" },
            { "x": 65, "y": 230, "label": "C" },
            { "x": 80, "y": 218, "label": "B" },
            { "x": 100, "y": 195, "label": "A" }
          ]
        }
      ]
    }
  }'::jsonb, 8)
  RETURNING id INTO v_s09;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s09, 'qr4-s09-q1', 'What is the difference in finish time between Runner A and Runner F?',
     '[{"label":"A","text":"70 minutes"},{"label":"B","text":"85 minutes"},{"label":"C","text":"100 minutes"},{"label":"D","text":"195 minutes"},{"label":"E","text":"295 minutes"}]'::jsonb,
     'C', 'From the scatter plot: Runner A finishes in 195 minutes, Runner F finishes in 295 minutes. Difference = 295 − 195 = 100 minutes. A common error is reading the value for a single runner (195 or 295) instead of calculating the difference. The answer is 100 minutes.', 0),
    (v_s09, 'qr4-s09-q2', 'Which runner appears to be the most significant outlier from the general trend?',
     '[{"label":"A","text":"Runner A"},{"label":"B","text":"Runner C"},{"label":"C","text":"Runner D"},{"label":"D","text":"Runner F"},{"label":"E","text":"Runner G"}]'::jsonb,
     'E', 'The general trend shows more training associated with faster (lower) finish times. Runner G trains 55 km/week but finishes in 280 minutes — much slower than nearby runners: D trains 50 km and finishes in 248 min, C trains 65 km and finishes in 230 min. G''s time of 280 is far above what the trend predicts, making G the most significant outlier. The answer is Runner G.', 1),
    (v_s09, 'qr4-s09-q3', 'How many runners completed the marathon in under 4 hours 30 minutes?',
     '[{"label":"A","text":"3"},{"label":"B","text":"4"},{"label":"C","text":"5"},{"label":"D","text":"6"},{"label":"E","text":"7"}]'::jsonb,
     'C', 'Step 1: Convert 4 hours 30 minutes to minutes: 4 × 60 + 30 = 270 minutes. Step 2: Count runners with times strictly below 270: A (195), B (218), C (230), D (248), E (265) = 5 runners. F (295) and G (280) are both above 270. A common error is miscounting or converting the time incorrectly. The answer is 5.', 2);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 10: Swimming Pool Filling
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-10', 'Swimming Pool Filling', '{
    "type": "text",
    "text": "A swimming pool has a capacity of 48,000 litres. Pump A fills the pool at a rate of 200 litres per minute. Pump B fills at a rate of 120 litres per minute. The pool’s filtration system uses 1.5 kWh of electricity per hour."
  }'::jsonb, 9)
  RETURNING id INTO v_s10;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s10, 'qr4-s10-q1', 'How long would it take to fill the pool from empty using both pumps together? Give your answer in hours and minutes.',
     '[{"label":"A","text":"2 hours 30 minutes"},{"label":"B","text":"3 hours 20 minutes"},{"label":"C","text":"4 hours"},{"label":"D","text":"5 hours"},{"label":"E","text":"5 hours 20 minutes"}]'::jsonb,
     'A', 'Step 1: Combined fill rate = 200 + 120 = 320 litres per minute. Step 2: Time = 48,000 ÷ 320 = 150 minutes = 2 hours 30 minutes. A common error is using the average rate instead of the combined rate: (200 + 120) ÷ 2 = 160 L/min, giving 48,000 ÷ 160 = 300 min = 5 hours. Another error is taking the arithmetic mean of the individual fill times: Pump A alone = 48,000 ÷ 200 = 240 min = 4 hours, Pump B alone = 48,000 ÷ 120 = 400 min = 6 hr 40 min, average = (240 + 400) ÷ 2 = 320 min = 5 hours 20 minutes. The answer is 2 hours 30 minutes.', 0);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 11: Rental Property Income Comparison
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-11', 'Rental Property Income Comparison', '{
    "type": "table",
    "context": "The mean annual occupancy across all 5 properties is 11 months.",
    "data": {
      "headers": ["Property", "Monthly Rent (£)", "Occupancy (months/yr)", "Annual Maintenance (£)", "Property Type"],
      "rows": [
        ["14 Elm Close", "850", "11", "1200", "Terraced"],
        ["7 Park Lane", "1200", "12", "2400", "Semi-detached"],
        ["22 Oak Avenue", "675", "?", "800", "Flat"],
        ["3 Church Street", "1100", "10", "1500", "Detached"],
        ["9 River Walk", "950", "12", "1800", "Terraced"]
      ]
    }
  }'::jsonb, 10)
  RETURNING id INTO v_s11;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s11, 'qr4-s11-q1', 'What is the total annual maintenance cost across all five properties?',
     '[{"label":"A","text":"£5,900"},{"label":"B","text":"£6,500"},{"label":"C","text":"£7,200"},{"label":"D","text":"£7,700"},{"label":"E","text":"£8,200"}]'::jsonb,
     'D', 'Sum the Annual Maintenance column: £1,200 + £2,400 + £800 + £1,500 + £1,800 = £7,700. A common error is omitting one property from the sum — for example, missing River Walk gives £5,900. The answer is £7,700.', 0),
    (v_s11, 'qr4-s11-q2', 'How many months per year is 22 Oak Avenue occupied?',
     '[{"label":"A","text":"8"},{"label":"B","text":"9"},{"label":"C","text":"10"},{"label":"D","text":"11"},{"label":"E","text":"12"}]'::jsonb,
     'C', 'Step 1: Mean occupancy = 11 months across 5 properties. Total = 11 × 5 = 55 months. Step 2: Sum of known occupancies = 11 + 12 + 10 + 12 = 45. Step 3: 22 Oak Avenue = 55 − 45 = 10 months. A common error is assuming the missing value equals the mean (11 months). The answer is 10 months.', 1),
    (v_s11, 'qr4-s11-q3', 'What is the annual net rental income from 7 Park Lane? [Net income = Gross rental income − Annual maintenance]',
     '[{"label":"A","text":"£9,600"},{"label":"B","text":"£12,000"},{"label":"C","text":"£12,600"},{"label":"D","text":"£13,200"},{"label":"E","text":"£14,400"}]'::jsonb,
     'B', 'Step 1: Gross income = £1,200 × 12 months = £14,400. Step 2: Net income = £14,400 − £2,400 = £12,000. A common error is reporting £14,400 (the gross income without subtracting maintenance). Another error is using the wrong property''s maintenance — e.g. £1,800 (River Walk) gives £12,600, or £1,200 (Elm Close) gives £13,200. The answer is £12,000.', 2),
    (v_s11, 'qr4-s11-q4', 'Net income per pound of maintenance is defined as: (Monthly rent × Occupancy − Annual maintenance) ÷ Annual maintenance. Which property has the highest net income per pound of maintenance?',
     '[{"label":"A","text":"14 Elm Close"},{"label":"B","text":"22 Oak Avenue"},{"label":"C","text":"3 Church Street"},{"label":"D","text":"7 Park Lane"},{"label":"E","text":"9 River Walk"}]'::jsonb,
     'B', 'Calculate for each property: 14 Elm Close = (850×11 − 1200) ÷ 1200 = 8150 ÷ 1200 = 6.79. 7 Park Lane = (1200×12 − 2400) ÷ 2400 = 12000 ÷ 2400 = 5.00. 22 Oak Avenue = (675×10 − 800) ÷ 800 = 5950 ÷ 800 = 7.44. 3 Church Street = (1100×10 − 1500) ÷ 1500 = 9500 ÷ 1500 = 6.33. 9 River Walk = (950×12 − 1800) ÷ 1800 = 9600 ÷ 1800 = 5.33. The highest is 22 Oak Avenue at 7.44. A common error is selecting the property with the highest gross income (7 Park Lane) without accounting for maintenance efficiency. The answer is 22 Oak Avenue.', 3);

  -- ═══════════════════════════════════════════════════════════════
  -- SET 12: Mobile Data Plans and Charges
  -- ═══════════════════════════════════════════════════════════════
  INSERT INTO timed_quantitative_reasoning_sets (test_id, set_ref, title, stimulus, order_index)
  VALUES (4, 'qr4-set-12', 'Mobile Data Plans and Charges', '{
    "type": "multi",
    "items": [
      {
        "type": "text",
        "text": "A mobile network offers four data plans. Customers who exceed their monthly data allowance are charged per additional GB used. Monthly line rental is charged separately. All prices shown exclude VAT at 20%."
      },
      {
        "type": "table",
        "data": {
          "headers": ["Plan", "Monthly Data (GB)", "Monthly Line Rental (£)", "Excess Data (£ per GB)", "Contract Length"],
          "rows": [
            ["Lite", "2", "8.00", "4.00", "1 month"],
            ["Basic", "5", "12.00", "3.50", "12 months"],
            ["Standard", "15", "22.00", "2.50", "18 months"],
            ["Premium", "Unlimited", "35.00", "N/A", "24 months"]
          ]
        }
      }
    ]
  }'::jsonb, 11)
  RETURNING id INTO v_s12;

  INSERT INTO timed_quantitative_reasoning_questions (set_id, question_ref, stem, options, correct_answer, answer_reason, order_index) VALUES
    (v_s12, 'qr4-s12-q1', 'How much does a Basic plan customer pay per month for line rental, including VAT?',
     '[{"label":"A","text":"£12.00"},{"label":"B","text":"£12.40"},{"label":"C","text":"£13.20"},{"label":"D","text":"£14.40"},{"label":"E","text":"£15.00"}]'::jsonb,
     'D', 'Step 1: Basic plan line rental = £12.00 (before VAT). Step 2: Add VAT at 20%: £12.00 × 1.20 = £14.40. A common error is forgetting to add VAT (£12.00) or applying 10% instead of 20% (£12 × 1.10 = £13.20). The answer is £14.40.', 0),
    (v_s12, 'qr4-s12-q2', 'A Standard plan customer uses 22 GB in one month. What is their total bill for that month, including VAT?',
     '[{"label":"A","text":"£26.40"},{"label":"B","text":"£39.50"},{"label":"C","text":"£43.90"},{"label":"D","text":"£47.40"},{"label":"E","text":"£55.80"}]'::jsonb,
     'D', 'Step 1: Standard plan allowance = 15 GB. Excess = 22 − 15 = 7 GB. Step 2: Excess charge = 7 × £2.50 = £17.50. Step 3: Subtotal = £22.00 + £17.50 = £39.50. Step 4: Add VAT at 20%: £39.50 × 1.20 = £47.40. A common error is forgetting VAT (giving £39.50) or applying VAT only to the line rental: £22 × 1.20 + £17.50 = £43.90. The answer is £47.40.', 1),
    (v_s12, 'qr4-s12-q3', 'A customer on the Basic plan uses exactly 8 GB every month for 12 months. What is their total annual cost, before VAT?',
     '[{"label":"A","text":"£144"},{"label":"B","text":"£186"},{"label":"C","text":"£270"},{"label":"D","text":"£336"},{"label":"E","text":"£480"}]'::jsonb,
     'C', 'Step 1: Monthly usage = 8 GB, Basic plan allowance = 5 GB. Excess = 8 − 5 = 3 GB per month. Step 2: Monthly excess charge = 3 × £3.50 = £10.50. Step 3: Monthly total = £12.00 + £10.50 = £22.50. Step 4: Annual total = £22.50 × 12 = £270. A common error is charging all 8 GB as excess (ignoring the 5 GB allowance): annual line rental £144 + 8 × £3.50 × 12 = £144 + £336 = £480. The answer is £270.', 2);

END $$;
