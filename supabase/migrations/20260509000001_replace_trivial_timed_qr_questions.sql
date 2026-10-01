-- Replace trivial UCAT QR questions in the TIMED tests.
--
-- Counterpart to 20260508000003_purge_trivial_qr_questions.sql, which handled
-- the practice table. This migration targets `timed_quantitative_reasoning_questions`
-- and rewrites the 22 questions identified as failing the "minimum reasoning
-- floor" rule from `.claude/UCAT-QR-QUESTION-GENERATOR.md` and
-- `.claude/UCAT-QR-VALIDATOR.md`.
--
-- Banned patterns being removed:
--   * Pure single-value reads (cell / line-point / scatter-point / segment)
--   * Scan-for-extreme on raw chart values
--   * Two-value add/subtract with no further operation
--   * Trivial sum of a row/column with no downstream operation
--
-- Each replacement:
--   * Uses the same set's existing stimulus (no chart/table changes)
--   * Clears the reasoning floor (percentage / ratio / mean / multi-step /
--     filter / per-unit / formula / etc.)
--   * Does not duplicate the logic of other questions in the same set
--   * Has 5 options with traceable distractor error sources
--   * Has step-by-step `Step N:` reasoning where multi-step
--   * Keeps the same id, set_id, question_ref, order_index, created_at
--
-- Rows are grouped by test_id (1..4) for traceability.

----------------------------------------------------------------------
-- TEST 1
----------------------------------------------------------------------

-- qr1-s01-q1: Cardiology weekly capacity utilisation
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across the five days, what percentage of Cardiology''s weekly capacity was occupied? Give your answer to one decimal place.',
  options = '[{"text":"68.0%","label":"A"},{"text":"73.1%","label":"B"},{"text":"74.4%","label":"C"},{"text":"78.1%","label":"D"},{"text":"84.4%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum the Cardiology row across the five days: 22 + 25 + 21 + 27 + 24 = 119.

Step 2: Weekly capacity = daily capacity × 5 days = 32 × 5 = 160.

Step 3: Percentage occupied = 119 ÷ 160 × 100 = 74.375%, which rounds to 74.4%.

The answer is 74.4%.',
  difficulty = 'normal'
WHERE id = '49b5cc07-a9f1-4c83-be2b-d324be3cfd23';

-- qr1-s04-q1: Total Wk1 → Wk2 % change across all six departments
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'From Week 1 to Week 2, by what percentage did total combined sales across all six departments change? Give your answer to one decimal place.',
  options = '[{"text":"3.3%","label":"A"},{"text":"3.4%","label":"B"},{"text":"4.2%","label":"C"},{"text":"8.0%","label":"D"},{"text":"17.2%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Week 1 total = 48 + 22 + 35 + 62 + 29 + 41 = 237 (£000s).

Step 2: Week 2 total = 51 + 25 + 33 + 58 + 34 + 44 = 245 (£000s).

Step 3: Percentage change uses the original (Week 1) value as the base: (245 − 237) ÷ 237 × 100 = 8 ÷ 237 × 100 = 3.376%, which rounds to 3.4%.

The answer is 3.4%.',
  difficulty = 'normal'
WHERE id = 'fbccb400-e35f-4be5-b761-9fd81af40639';

-- qr1-s06-q1: South region 6-year mean membership rate
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What was the mean membership rate for the South region across the six years shown? Give your answer to one decimal place.',
  options = '[{"text":"88.4%","label":"A"},{"text":"90.0%","label":"B"},{"text":"93.0%","label":"C"},{"text":"93.7%","label":"D"},{"text":"94.1%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the six South values from the line graph: 94.1, 94.5, 93.8, 92.2, 91.5, 92.0.

Step 2: Sum = 94.1 + 94.5 + 93.8 + 92.2 + 91.5 + 92.0 = 558.1.

Step 3: Mean = 558.1 ÷ 6 = 93.02%, which rounds to 93.0%.

The answer is 93.0%.',
  difficulty = 'normal'
WHERE id = '8b620446-ae96-42ca-99f5-e75a2ef713ea';

-- qr1-s07-q1: Combined mean for ≥30 hour students
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across both classes combined, what is the mean exam score for students who revised at least 30 hours? Give your answer to one decimal place.',
  options = '[{"text":"64.5","label":"A"},{"text":"69.3","label":"B"},{"text":"72.0","label":"C"},{"text":"75.3","label":"D"},{"text":"81.3","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Identify the six students with revision ≥ 30 hours: Class A at 30, 40, 50 hours scored 72, 82, 90; Class B at 30, 40, 50 hours scored 60, 70, 78.

Step 2: Sum these six scores: (72 + 82 + 90) + (60 + 70 + 78) = 244 + 208 = 452.

Step 3: Mean = 452 ÷ 6 = 75.33%, which rounds to 75.3%.

The answer is 75.3%.',
  difficulty = 'normal'
WHERE id = 'e27bb3e7-9025-4360-8cf0-de8ec618724b';

-- qr1-s07-q2: Class A vs Class B at 50 hours, percentage difference
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'At 50 hours of revision, by what percentage does the Class A score exceed the Class B score? Give your answer to one decimal place.',
  options = '[{"text":"12.0%","label":"A"},{"text":"13.3%","label":"B"},{"text":"15.4%","label":"C"},{"text":"17.1%","label":"D"},{"text":"20.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: At x = 50 hours, Class A = 90% and Class B = 78%.

Step 2: Percentage by which A exceeds B uses B as the base: (90 − 78) ÷ 78 × 100 = 12 ÷ 78 × 100 = 15.385%, which rounds to 15.4%.

The answer is 15.4%.',
  difficulty = 'normal'
WHERE id = '8b730567-3474-4bc8-a5ca-ff4e1d04d267';

----------------------------------------------------------------------
-- TEST 2
----------------------------------------------------------------------

-- qr2-s01-q1: Self-Referrals to Dermatology as % of all Dermatology referrals
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What percentage of all Dermatology referrals came via Self-Referral? Give your answer to one decimal place.',
  options = '[{"text":"6.8%","label":"A"},{"text":"22.5%","label":"B"},{"text":"31.1%","label":"C"},{"text":"38.0%","label":"D"},{"text":"42.2%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the Self-Referral row, Dermatology column: 38.

Step 2: Read the Department Total for Dermatology: 122.

Step 3: Percentage = 38 ÷ 122 × 100 = 31.15%, which rounds to 31.1%.

The answer is 31.1%.',
  difficulty = 'normal'
WHERE id = '02b62eb7-4b1e-46ca-8dc0-8c03ec699204';

-- qr2-s02-q1: Bakery six-month overall profit margin
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across the six months from January to June, what was the bakery''s overall profit margin? Give your answer to one decimal place.',
  options = '[{"text":"30.0%","label":"A"},{"text":"35.7%","label":"B"},{"text":"36.1%","label":"C"},{"text":"39.3%","label":"D"},{"text":"56.5%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Total revenue = 18 + 22 + 24 + 20 + 28 + 32 = 144 (£000s).

Step 2: Total costs = 12 + 14 + 15 + 14 + 17 + 20 = 92 (£000s).

Step 3: Total profit = 144 − 92 = 52 (£000s).

Step 4: Profit margin = 52 ÷ 144 × 100 = 36.11%, which rounds to 36.1%.

The answer is 36.1%.',
  difficulty = 'normal'
WHERE id = '6c5d0fe1-762a-4ebd-bc00-bc212f4c7e3d';

-- qr2-s04-q1: Humanities mean monthly loans
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What were the Humanities faculty''s mean monthly loans across the eight months shown? Give your answer to the nearest 10 books.',
  options = '[{"text":"850","label":"A"},{"text":"1,090","label":"B"},{"text":"1,130","label":"C"},{"text":"1,190","label":"D"},{"text":"1,420","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum Humanities loans across the eight months: 850 + 1,100 + 1,350 + 720 + 1,050 + 1,200 + 1,380 + 1,420 = 9,070.

Step 2: Mean = 9,070 ÷ 8 = 1,133.75, which rounds to 1,130 to the nearest 10.

The answer is 1,130.',
  difficulty = 'normal'
WHERE id = 'f5fbf872-9b28-4d7c-8cec-3e5459044985';

-- qr2-s04-q2: Engineering Dec → Apr % growth
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'By what percentage did Engineering loans grow from December to April? Give your answer to one decimal place.',
  options = '[{"text":"44.9%","label":"A"},{"text":"80.0%","label":"B"},{"text":"81.5%","label":"C"},{"text":"100.0%","label":"D"},{"text":"181.5%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the Engineering line, December = 540 and April = 980.

Step 2: Percentage change uses the original value as the base: (980 − 540) ÷ 540 × 100 = 440 ÷ 540 × 100 = 81.48%, which rounds to 81.5%.

The answer is 81.5%.',
  difficulty = 'normal'
WHERE id = 'd90e1544-10b4-496a-ab12-46cda474faa0';

-- qr2-s08-q1: Country D's CO2 per £1,000 of GDP per capita
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What is Country D''s CO₂ emissions per £1,000 of GDP per capita? Give your answer to two decimal places.',
  options = '[{"text":"0.17","label":"A"},{"text":"0.19","label":"B"},{"text":"0.27","label":"C"},{"text":"0.32","label":"D"},{"text":"3.16","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: From the scatter plot, Country D has GDP per capita = £30,000 and emissions = 9.5 tonnes per person.

Step 2: Emissions per £1,000 GDP = 9.5 ÷ 30 = 0.3167, which rounds to 0.32.

The answer is 0.32.',
  difficulty = 'normal'
WHERE id = '3deda984-13e6-4550-95ca-cb4d6b7b9cab';

-- qr2-s09-q1: Monthly pass break-even saving
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'A passenger commutes 5 round-trip journeys per week between Greenfield and Laketown using single adult tickets. Over 4 weeks, how much would they save by buying a monthly pass instead of paying single adult fares for every leg?',
  options = '[{"text":"£11.00","label":"A"},{"text":"£37.00","label":"B"},{"text":"£48.00","label":"C"},{"text":"£85.00","label":"D"},{"text":"£96.00","label":"E"}]',
  correct_answer = 'A',
  answer_reason = 'Step 1: Adult single fare = £2.40, so a round trip costs 2 × £2.40 = £4.80.

Step 2: Total round trips over 4 weeks = 5 × 4 = 20.

Step 3: Total fare cost without the pass = 20 × £4.80 = £96.00.

Step 4: Saving with the pass = £96.00 − £85.00 = £11.00.

The answer is £11.00.',
  difficulty = 'hard'
WHERE id = '495ddcc8-509c-4a37-ab5a-e11a1b62055a';

-- qr2-s14-q1: Dogs Q1 → Q4 % growth
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'By what percentage did dog vaccinations increase from Q1 to Q4? Give your answer to one decimal place.',
  options = '[{"text":"19.4%","label":"A"},{"text":"21.6%","label":"B"},{"text":"24.1%","label":"C"},{"text":"35.0%","label":"D"},{"text":"124.1%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the Dogs row, Q1 = 145 and Q4 = 180.

Step 2: Percentage change uses Q1 as the base: (180 − 145) ÷ 145 × 100 = 35 ÷ 145 × 100 = 24.14%, which rounds to 24.1%.

The answer is 24.1%.',
  difficulty = 'normal'
WHERE id = 'f71d5228-bac7-4a2c-a0ec-9ec66d1d3414';

----------------------------------------------------------------------
-- TEST 3
----------------------------------------------------------------------

-- qr3-s02-q2: Mean monthly deficit across deficit months
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'In the months that ran an energy deficit, what was the mean monthly deficit in MWh? Give your answer to one decimal place.',
  options = '[{"text":"4.2","label":"A"},{"text":"14.2","label":"B"},{"text":"28.3","label":"C"},{"text":"36.7","label":"D"},{"text":"42.5","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Identify the deficit (negative) months: January −45, February −30, June −10. Three months total.

Step 2: Sum the deficit magnitudes: 45 + 30 + 10 = 85 MWh.

Step 3: Mean monthly deficit = 85 ÷ 3 = 28.33, which rounds to 28.3 MWh.

The answer is 28.3 MWh.',
  difficulty = 'normal'
WHERE id = '07979331-226a-43d8-9fe8-0f0d5a50ad4d';

-- qr3-s04-q1: 2022 mean house price across all 3 regions
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'In 2022, what was the mean average house price across the three regions?',
  options = '[{"text":"£213,000","label":"A"},{"text":"£229,000","label":"B"},{"text":"£251,000","label":"C"},{"text":"£263,000","label":"D"},{"text":"£340,000","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the line graph, the 2022 values are North 178, South 340 and Midlands 235 (all in £000s).

Step 2: Sum = 178 + 340 + 235 = 753 (£000s).

Step 3: Mean = 753 ÷ 3 = 251 (£000s) = £251,000.

The answer is £251,000.',
  difficulty = 'normal'
WHERE id = 'de12870c-5b5a-4cdd-8b04-3ed85863e00c';

-- qr3-s06-q1: 18-25 share of all downloads
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What percentage of all downloads came from users aged 18-25? Give your answer to one decimal place.',
  options = '[{"text":"12.5%","label":"A"},{"text":"25.3%","label":"B"},{"text":"28.8%","label":"C"},{"text":"33.5%","label":"D"},{"text":"71.3%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the 18-25 column total: 1,150.

Step 2: Read the grand total: 4,000.

Step 3: Percentage = 1,150 ÷ 4,000 × 100 = 28.75%, which rounds to 28.8%.

The answer is 28.8%.',
  difficulty = 'normal'
WHERE id = '0f5b873c-f4ca-46e1-b99a-20b3960ac842';

-- qr3-s12-q1: Mean life expectancy across the 7 cities
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What was the mean life expectancy across the seven cities? Give your answer to one decimal place.',
  options = '[{"text":"76.0 years","label":"A"},{"text":"79.4 years","label":"B"},{"text":"80.1 years","label":"C"},{"text":"80.4 years","label":"D"},{"text":"82.8 years","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the y-values for each of the seven cities: A 78.5, B 81.2, C 76.0, D 82.8, E 79.6, F 80.4, G 82.0.

Step 2: Sum = 78.5 + 81.2 + 76.0 + 82.8 + 79.6 + 80.4 + 82.0 = 560.5.

Step 3: Mean = 560.5 ÷ 7 = 80.07, which rounds to 80.1 years.

The answer is 80.1 years.',
  difficulty = 'normal'
WHERE id = '9281d0c7-8955-4631-b849-77fdc7714cfc';

----------------------------------------------------------------------
-- TEST 4
----------------------------------------------------------------------

-- qr4-s01-q1: % of all residents working in their home borough
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What percentage of all 2,900 residents work in the same borough they live in? Give your answer to one decimal place.',
  options = '[{"text":"37.6%","label":"A"},{"text":"48.6%","label":"B"},{"text":"51.4%","label":"C"},{"text":"62.4%","label":"D"},{"text":"82.3%","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: The diagonal cells of the cross-tabulation give residents working in their own borough: Eastham 480, Northwick 360, Westford 400, Southley 570.

Step 2: Sum the diagonal: 480 + 360 + 400 + 570 = 1,810.

Step 3: Percentage = 1,810 ÷ 2,900 × 100 = 62.41%, which rounds to 62.4%.

The answer is 62.4%.',
  difficulty = 'normal'
WHERE id = '8f500c88-439a-432e-b866-cb59927bba32';

-- qr4-s02-q1: % of all visitors who were children across all 5 sites
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across all five heritage sites, what percentage of total visitors were children? Give your answer to one decimal place.',
  options = '[{"text":"33.3%","label":"A"},{"text":"35.0%","label":"B"},{"text":"43.0%","label":"C"},{"text":"53.9%","label":"D"},{"text":"65.0%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Sum adult visitors across all five sites: 16,000 + 12,000 + 24,000 + 10,000 + 15,000 = 77,000.

Step 2: Sum child visitors: 8,000 + 9,000 + 16,000 + 2,500 + 6,000 = 41,500.

Step 3: Total visitors = 77,000 + 41,500 = 118,500.

Step 4: Child percentage = 41,500 ÷ 118,500 × 100 = 35.02%, which rounds to 35.0%.

The answer is 35.0%.',
  difficulty = 'normal'
WHERE id = '7a61805e-0cb7-4b27-9487-3136f3b7b892';

-- qr4-s04-q1: London Jan → Jul % change in temperature
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'By what percentage did London''s average temperature increase from January to July? Give your answer to one decimal place.',
  options = '[{"text":"18.0%","label":"A"},{"text":"78.3%","label":"B"},{"text":"360.0%","label":"C"},{"text":"400.0%","label":"D"},{"text":"460.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the London line, January = 5°C and July = 23°C.

Step 2: Percentage change uses January as the base: (23 − 5) ÷ 5 × 100 = 18 ÷ 5 × 100 = 360.0%.

The answer is 360.0%.',
  difficulty = 'normal'
WHERE id = 'b992a331-db87-409d-8330-3c66fc0832b2';

-- qr4-s07-q1: Highest energy density per gram of fat
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Which cereal provides the most energy (kcal) per gram of fat?',
  options = '[{"text":"Oat Crunch","label":"A"},{"text":"Wheat Flakes","label":"B"},{"text":"Bran Bites","label":"C"},{"text":"Honey Puffs","label":"D"},{"text":"Granola Mix","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'For each cereal, divide energy (kcal) by fat (g), both per 100 g.

Step 1: Oat Crunch = 380 ÷ 7 = 54.3 kcal/g fat.

Step 2: Wheat Flakes = 360 ÷ 2 = 180.0 kcal/g fat.

Step 3: Bran Bites = 320 ÷ 3 = 106.7 kcal/g fat.

Step 4: Honey Puffs = 400 ÷ 5 = 80.0 kcal/g fat.

Step 5: Granola Mix = 450 ÷ 18 = 25.0 kcal/g fat.

The highest is Wheat Flakes at 180.0 kcal per gram of fat.

The answer is Wheat Flakes.',
  difficulty = 'hard'
WHERE id = '0904a527-9438-41ea-b3a2-2c4a80fd3ac6';

-- qr4-s09-q1: Mean weekly training volume across the seven runners
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What was the mean weekly training volume across the seven runners, in km?',
  options = '[{"text":"50","label":"A"},{"text":"55","label":"B"},{"text":"60","label":"C"},{"text":"70","label":"D"},{"text":"100","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the x-values for each runner: A 100, B 80, C 65, D 50, E 40, F 30, G 55.

Step 2: Sum = 100 + 80 + 65 + 50 + 40 + 30 + 55 = 420.

Step 3: Mean = 420 ÷ 7 = 60 km per week.

The answer is 60 km.',
  difficulty = 'normal'
WHERE id = '66d449e7-a9f1-4c83-be2b-d324be3cfd23';

-- qr4-s11-q1: Total annual rental income for the four properties with known occupancy
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What is the total annual rental income generated by the four properties whose occupancy is known? (Exclude 22 Oak Avenue.)',
  options = '[{"text":"£4,100","label":"A"},{"text":"£41,000","label":"B"},{"text":"£46,150","label":"C"},{"text":"£49,200","label":"D"},{"text":"£57,300","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'For each of the four properties with known occupancy, multiply monthly rent by occupancy months.

Step 1: 14 Elm Close = £850 × 11 = £9,350.

Step 2: 7 Park Lane = £1,200 × 12 = £14,400.

Step 3: 3 Church Street = £1,100 × 10 = £11,000.

Step 4: 9 River Walk = £950 × 12 = £11,400.

Step 5: Total = 9,350 + 14,400 + 11,000 + 11,400 = £46,150.

The answer is £46,150.',
  difficulty = 'hard'
WHERE id = 'a6c477e9-cea1-4e90-8f05-887fb66eabba';
