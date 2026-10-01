-- Replace 72 trivial UCAT QR questions in the PRACTICE table.
--
-- Counterpart to 20260508000003_purge_trivial_qr_questions.sql and
-- 20260509000001_replace_trivial_timed_qr_questions.sql. This migration
-- targets `quantitative_reasoning_questions` (non-timed practice) and
-- rewrites every question that fails the tightened reasoning floor in
-- `.claude/UCAT-QR-QUESTION-GENERATOR.md` and `.claude/UCAT-QR-VALIDATOR.md`.
--
-- Banned patterns being removed (in addition to those caught last round):
--   * Single percentage from two visible values (X / visible total)
--   * Single ratio / fraction from two visible values
--   * Single multiplication / division / unit conversion of one given value
--   * Mean of <=5 values from a single row, column, or labelled series
--
-- Each replacement:
--   * Uses the same set's existing stimulus (no chart/table changes)
--   * Clears the new floor (percentage CHANGE / multi-step / filter / >5 mean /
--     missing-data derivation / formula chain / Can't Tell / etc.)
--   * Does not duplicate the logic of other questions in the same set
--   * Has 5 options in ascending numerical order with traceable distractors
--   * Has step-by-step `Step N:` reasoning for multi-step questions
--   * Keeps the same id, set_id, question_ref, order_index, created_at

----------------------------------------------------------------------
-- Pie chart sets
----------------------------------------------------------------------

-- practice-qr-set-47-q1: Wind growth needed to hit 35% target
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Country X has set a target for wind to provide 35% of total electricity generation by next year. If total generation stays at 400 TWh and only the wind segment changes, by how many TWh must wind generation grow to meet the target?',
  options = '[{"text":"32 TWh","label":"A"},{"text":"38 TWh","label":"B"},{"text":"45 TWh","label":"C"},{"text":"95 TWh","label":"D"},{"text":"140 TWh","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Work out what 35% of the 400 TWh total is. Target wind = 0.35 × 400 = 140 TWh.

Step 2: Read the current wind segment from the chart: 95 TWh.

Step 3: Required growth = target − current = 140 − 95 = 45 TWh.

The answer is 45 TWh.',
  difficulty = 'hard'
WHERE id = '94cc68ff-0902-4fcf-9cf1-9e72e89dc59e';

-- practice-qr-set-47-q3: Ratio of gas to nuclear after projected changes
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'If gas generation falls by 25% and nuclear generation triples, what would the new ratio of gas generation to nuclear generation be, in its simplest form?',
  options = '[{"text":"4 : 5","label":"A"},{"text":"5 : 7","label":"B"},{"text":"9 : 11","label":"C"},{"text":"11 : 9","label":"D"},{"text":"27 : 11","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Apply each change to the current segment values. New gas = 180 × (1 − 0.25) = 180 × 0.75 = 135 TWh.

Step 2: New nuclear = 55 × 3 = 165 TWh.

Step 3: Form the ratio 135 : 165 and divide both sides by their highest common factor of 15: 135 ÷ 15 = 9 and 165 ÷ 15 = 11.

The answer is 9 : 11.',
  difficulty = 'hard'
WHERE id = '7e174677-8f58-4626-98df-2fa82c66521c';

-- practice-qr-set-38-q1: Increase in Bonds + Cash to hit 40% target
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The trustees plan to rebalance so that Global Bonds and Cash combined make up 40% of the portfolio. If the total portfolio value is unchanged at £45,000,000, by how much must the combined Bonds + Cash holdings increase?',
  options = '[{"text":"£2,400,000","label":"A"},{"text":"£3,150,000","label":"B"},{"text":"£3,600,000","label":"C"},{"text":"£6,750,000","label":"D"},{"text":"£18,000,000","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Read the two current segments: Global Bonds £11,250,000 and Cash £3,600,000. Combined = £14,850,000.

Step 2: Work out the target value: 40% of £45,000,000 = 0.40 × 45,000,000 = £18,000,000.

Step 3: Required increase = target − current = 18,000,000 − 14,850,000 = £3,150,000.

The answer is £3,150,000.',
  difficulty = 'hard'
WHERE id = '7a56362d-7a9c-4620-be40-1e0c61b0d170';

-- practice-qr-set-59-q1: Combined "Other" loans (filter <15% share)
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The library decides to publish only the categories that individually account for at least 15% of total loans, grouping all smaller categories together as "Other". How many loans fall into the new "Other" group?',
  options = '[{"text":"3,600","label":"A"},{"text":"4,800","label":"B"},{"text":"8,400","label":"C"},{"text":"13,200","label":"D"},{"text":"18,000","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Work out each category as a share of the 48,000 total. Fiction 18,000 ÷ 48,000 = 37.5%. Non-fiction 9,600 ÷ 48,000 = 20.0%. Children''s 12,000 ÷ 48,000 = 25.0%. Audiobooks 4,800 ÷ 48,000 = 10.0%. Reference 3,600 ÷ 48,000 = 7.5%.

Step 2: Categories below 15% are Audiobooks (10.0%) and Reference (7.5%).

Step 3: Combined "Other" = 4,800 + 3,600 = 8,400 loans.

The answer is 8,400.',
  difficulty = 'hard'
WHERE id = 'ade57716-1e2a-439e-9513-e8e00f584c36';

-- practice-qr-set-59-q2: Ratio after projected Audiobook and Reference changes
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Next year, Audiobook loans are expected to grow by 50% while Reference loans are expected to fall by one third. What will be the ratio of Audiobook loans to Reference loans next year, in its simplest form?',
  options = '[{"text":"2 : 1","label":"A"},{"text":"3 : 1","label":"B"},{"text":"3 : 2","label":"C"},{"text":"4 : 1","label":"D"},{"text":"5 : 2","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Apply each change. New Audiobook loans = 4,800 × 1.50 = 7,200.

Step 2: New Reference loans = 3,600 × (1 − 1/3) = 3,600 × 2/3 = 2,400.

Step 3: Ratio 7,200 : 2,400 simplifies by dividing both sides by 2,400 to give 3 : 1.

The answer is 3 : 1.',
  difficulty = 'hard'
WHERE id = '71b50c00-987f-4884-a1b8-0fe8a7d696ab';

-- practice-qr-set-85-q2: Subscribers on tiers other than Standard or Student
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'What percentage of SoundWave''s subscribers are on a tier other than Standard or Student, to 1 decimal place?',
  options = '[{"text":"30.6%","label":"A"},{"text":"46.9%","label":"B"},{"text":"53.1%","label":"C"},{"text":"69.4%","label":"D"},{"text":"76.9%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Read the Standard and Student segments: 245,000 + 180,000 = 425,000.

Step 2: Subscribers on the other three tiers (Family + Premium HiFi + Business) = 800,000 − 425,000 = 375,000.

Step 3: Share = 375,000 ÷ 800,000 × 100 = 46.875%, which rounds to 46.9%.

The answer is 46.9%.',
  difficulty = 'normal'
WHERE id = '10fed6a0-2ac8-4049-a91d-34255958a73c';

-- practice-qr-set-85-q4: Net change in HiFi + Business after opposite-direction moves
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Premium HiFi subscribers grow by 30% next quarter while Business subscribers fall by 25% over the same period. By how many subscribers does the combined Premium HiFi + Business count change?',
  options = '[{"text":"−22,500","label":"A"},{"text":"−9,000","label":"B"},{"text":"+13,500","label":"C"},{"text":"+36,000","label":"D"},{"text":"+58,500","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Premium HiFi change = 120,000 × 0.30 = +36,000.

Step 2: Business change = 90,000 × 0.25 = 22,500. Because Business falls, this is −22,500.

Step 3: Net change in the combined count = +36,000 + (−22,500) = +13,500 subscribers.

The answer is +13,500.',
  difficulty = 'hard'
WHERE id = 'a4fe7656-8808-4f16-b829-f581019d3f46';

-- practice-qr-set-67-q2: Africa share after 20% growth, others unchanged
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'If Africa-route throughput grows by 20% next year while every other route stays constant, what percentage of total throughput will Africa routes then represent, to 1 decimal place?',
  options = '[{"text":"8.4%","label":"A"},{"text":"8.8%","label":"B"},{"text":"10.3%","label":"C"},{"text":"10.5%","label":"D"},{"text":"11.5%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: New Africa-route throughput = 210 × 1.20 = 252 thousand TEUs.

Step 2: New total throughput = 2,400 − 210 + 252 = 2,442 thousand TEUs.

Step 3: New Africa share = 252 ÷ 2,442 × 100 = 10.319%, which rounds to 10.3%.

The answer is 10.3%.',
  difficulty = 'hard'
WHERE id = '669beba2-086a-4c7f-83a1-71ec66b5d0bc';

-- practice-qr-set-22-q2: Composting share if Landfill is reduced to 10% target
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The council aims to cap Landfill at no more than 10% of household waste next year. The plan is to divert the freed share into Composting only, with every other category unchanged. What would the new Composting share need to be?',
  options = '[{"text":"10%","label":"A"},{"text":"15%","label":"B"},{"text":"20%","label":"C"},{"text":"25%","label":"D"},{"text":"30%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Work out the current Landfill share. The five segments must sum to 100%, so Landfill = 100 − (45 + 15 + 20 + 5) = 15%.

Step 2: Reducing Landfill to 10% frees 15 − 10 = 5 percentage points.

Step 3: All 5 percentage points are added to Composting: new Composting = 15 + 5 = 20%.

The answer is 20%.',
  difficulty = 'hard'
WHERE id = '45de30f3-e90a-45a5-9a81-6e481f1fda45';

-- practice-qr-set-04-q2: Natural Gas share if Renewables match Electricity
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The government plans to make Renewables match Electricity''s share of the household energy mix by 2030, by reducing Natural Gas only — every other category stays the same. What would the new Natural Gas share be?',
  options = '[{"text":"14%","label":"A"},{"text":"18%","label":"B"},{"text":"24%","label":"C"},{"text":"30%","label":"D"},{"text":"32%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read Electricity = 28% and Renewables = 10% from the chart.

Step 2: Renewables must rise to 28% to match Electricity, an increase of 28 − 10 = 18 percentage points.

Step 3: All 18 percentage points are taken from Natural Gas: new Natural Gas = 42 − 18 = 24%.

The answer is 24%.',
  difficulty = 'hard'
WHERE id = 'a099ec34-b404-4fc4-8540-58514ac27768';

-- practice-qr-set-29-q3: Savings share after Entertainment cut
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The family decides to cut Entertainment spending by 50% and add the freed cash entirely to Savings. After this change, what percentage of monthly income will go to Savings, to 1 decimal place?',
  options = '[{"text":"25.0%","label":"A"},{"text":"28.8%","label":"B"},{"text":"30.0%","label":"C"},{"text":"32.5%","label":"D"},{"text":"33.8%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Work out the current Entertainment value. The six segments must sum to £3,600, so Entertainment = 3,600 − (1,080 + 540 + 450 + 360 + 900) = £270.

Step 2: A 50% cut frees 270 × 0.50 = £135. New Savings = 900 + 135 = £1,035.

Step 3: New Savings as a share of monthly income = 1,035 ÷ 3,600 × 100 = 28.75%, which rounds to 28.8%.

The answer is 28.8%.',
  difficulty = 'hard'
WHERE id = 'c0d7a77d-932e-4b2d-85bd-bc6a079146bf';

-- practice-qr-set-80-q3: Total commission with split rate (Produce 8%, others 5%)
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The market charges every vendor a 5% commission on revenue, except Produce, which pays 8%. Using the chart values and the stated total, what is the total commission collected on Saturday?',
  options = '[{"text":"£660","label":"A"},{"text":"£756","label":"B"},{"text":"£804","label":"C"},{"text":"£864","label":"D"},{"text":"£912","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Work out the missing Flowers segment using the £13,200 total: 13,200 − 4,800 − 2,700 − 1,800 − 2,400 = £1,500.

Step 2: Produce commission = 4,800 × 0.08 = £384.

Step 3: Other vendors'' revenue = 2,700 + 1,800 + 2,400 + 1,500 = £8,400. Their 5% commission = 8,400 × 0.05 = £420.

Step 4: Total commission = 384 + 420 = £804.

The answer is £804.',
  difficulty = 'hard'
WHERE id = 'fb7eeaa4-6e1d-43bc-812b-cda53d462c45';

-- practice-qr-set-93-q2: Tickets share if ticket sales had been 30% higher
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Suppose ticket sales had been 30% higher than the actual figure. With every other category unchanged, what percentage of total event income would Ticket Sales then have represented, to 1 decimal place?',
  options = '[{"text":"36.0%","label":"A"},{"text":"42.2%","label":"B"},{"text":"46.8%","label":"C"},{"text":"47.6%","label":"D"},{"text":"50.4%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: New ticket sales = 45,000 × 1.30 = £58,500. The increase is 58,500 − 45,000 = £13,500.

Step 2: New event total = 125,000 + 13,500 = £138,500 (because no other category changes).

Step 3: New ticket share = 58,500 ÷ 138,500 × 100 = 42.238%, which rounds to 42.2%.

The answer is 42.2%.',
  difficulty = 'hard'
WHERE id = '6908616f-a2d9-465d-8212-6f9307d45ba1';

----------------------------------------------------------------------
-- Bar chart sets
----------------------------------------------------------------------

-- practice-qr-set-08-q2: Mean profit margin across profit-making quarters only
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Ignoring the quarters where the business made a loss, what is the mean profit margin across the profit-making quarters, to 1 decimal place?',
  options = '[{"text":"8.2%","label":"A"},{"text":"12.8%","label":"B"},{"text":"15.4%","label":"C"},{"text":"19.4%","label":"D"},{"text":"23.3%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Identify the profit-making quarters (Net P/L above zero): Q1, Q3 and Q5.

Step 2: Compute each margin using profit ÷ revenue × 100. Q1: 15 ÷ 120 × 100 = 12.50%. Q3: 20 ÷ 140 × 100 = 14.286%. Q5: 35 ÷ 180 × 100 = 19.444%.

Step 3: Mean = (12.50 + 14.286 + 19.444) ÷ 3 = 46.230 ÷ 3 = 15.41%, which rounds to 15.4%.

The answer is 15.4%.',
  difficulty = 'hard'
WHERE id = '2fddffce-7533-46eb-9a21-2b60775520b1';

-- practice-qr-set-88-q2: Old Trafford utilisation gap to highest stadium
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'By how many percentage points does Old Trafford''s capacity utilisation lag behind the stadium with the highest utilisation across the five shown, to 1 decimal place?',
  options = '[{"text":"0.4 pp","label":"A"},{"text":"0.7 pp","label":"B"},{"text":"1.0 pp","label":"C"},{"text":"1.4 pp","label":"D"},{"text":"2.0 pp","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Compute each stadium''s utilisation. Old Trafford 73,200 ÷ 74,140 × 100 = 98.732%. Emirates 60,100 ÷ 60,704 × 100 = 99.005%. Anfield 59,800 ÷ 61,276 × 100 = 97.591%. Tottenham 61,700 ÷ 62,850 × 100 = 98.171%. Etihad 53,100 ÷ 53,400 × 100 = 99.438%.

Step 2: Etihad has the highest utilisation at 99.438%.

Step 3: Gap = 99.438 − 98.732 = 0.706 percentage points, which rounds to 0.7 pp.

The answer is 0.7 pp.',
  difficulty = 'hard'
WHERE id = '4a08b52d-8f5c-40f0-b636-fb44c906ded2';

-- practice-qr-set-88-q3: Combined utilisation across all five stadiums
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the five stadiums combined, what is the overall capacity utilisation (combined attendance ÷ combined capacity), to 1 decimal place?',
  options = '[{"text":"96.6%","label":"A"},{"text":"97.6%","label":"B"},{"text":"98.0%","label":"C"},{"text":"98.6%","label":"D"},{"text":"99.4%","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Sum the average attendances: 73,200 + 60,100 + 59,800 + 61,700 + 53,100 = 307,900.

Step 2: Sum the capacities: 74,140 + 60,704 + 61,276 + 62,850 + 53,400 = 312,370.

Step 3: Overall utilisation = 307,900 ÷ 312,370 × 100 = 98.569%, which rounds to 98.6%.

The answer is 98.6%.',
  difficulty = 'hard'
WHERE id = '30a15f46-c79b-40e6-a9e3-53a2894113e9';

-- practice-qr-set-02-q2: Ratio of older-group urgent to younger-group urgent
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Combine the 0–17 and 18–39 groups into "Younger" and the 40–64 and 65+ groups into "Older". What is the ratio of urgent appointments in the Older group to urgent appointments in the Younger group, in its simplest form?',
  options = '[{"text":"5 : 2","label":"A"},{"text":"5 : 3","label":"B"},{"text":"9 : 4","label":"C"},{"text":"20 : 9","label":"D"},{"text":"200 : 90","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Older urgent = 80 (40–64) + 120 (65+) = 200.

Step 2: Younger urgent = 35 (0–17) + 55 (18–39) = 90.

Step 3: Ratio 200 : 90 simplifies by dividing both sides by 10 to give 20 : 9, which has no further common factor.

The answer is 20 : 9.',
  difficulty = 'hard'
WHERE id = 'a13fb893-6443-40e4-a67a-62c09797b505';

-- practice-qr-set-31-q4: % change in combined net profit 2024 vs 2025
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Comparing 2024 and 2025 totals across all six branches combined, what was the percentage change in combined net profit, to 1 decimal place?',
  options = '[{"text":"1.9% decrease","label":"A"},{"text":"1.9% increase","label":"B"},{"text":"2.0% decrease","label":"C"},{"text":"2.0% increase","label":"D"},{"text":"No change","label":"E"}]',
  correct_answer = 'A',
  answer_reason = 'Step 1: 2024 combined net profit = 42 + 18 + (−5) + 35 + (−12) + 28 = £106,000.

Step 2: 2025 combined net profit = 55 + (−8) + 22 + 40 + 5 + (−10) = £104,000.

Step 3: Percentage change uses the 2024 figure as the base: (104 − 106) ÷ 106 × 100 = −2 ÷ 106 × 100 = −1.887%, which rounds to a 1.9% decrease.

The answer is 1.9% decrease.',
  difficulty = 'hard'
WHERE id = '90f0e8f6-0b60-4e61-af30-1fcde25360e4';

-- practice-qr-set-48-q2: How many weeks are above the 9-week mean
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'How many of the nine weeks recorded an admissions count strictly above the nine-week mean (rounded to 1 decimal place)?',
  options = '[{"text":"3","label":"A"},{"text":"4","label":"B"},{"text":"5","label":"C"},{"text":"6","label":"D"},{"text":"7","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Sum the nine weekly bars: 42 + 56 + 61 + 58 + 67 + 49 + 63 + 72 + 55 = 523.

Step 2: Mean = 523 ÷ 9 = 58.1 admissions per week.

Step 3: Compare each week to 58.1: 42 (no), 56 (no), 61 (yes), 58 (no), 67 (yes), 49 (no), 63 (yes), 72 (yes), 55 (no). That gives 4 weeks strictly above the mean.

The answer is 4.',
  difficulty = 'hard'
WHERE id = 'a7cedbdc-284c-43e2-a97a-c4771e6eaf92';

-- practice-qr-set-97-q2: Year mean if November had matched October
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'If the observatory had remained open in November and recorded the same number of visitors as October, what would the mean monthly visitor count for the full 12 months have been?',
  options = '[{"text":"1,540","label":"A"},{"text":"1,610","label":"B"},{"text":"1,650","label":"C"},{"text":"1,673","label":"D"},{"text":"1,800","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum the 11 recorded months: 800 + 900 + 1,200 + 1,500 + 2,000 + 2,400 + 2,800 + 2,600 + 1,800 + 1,400 + 1,000 = 18,400.

Step 2: Add the hypothetical November = October value (1,400): 18,400 + 1,400 = 19,800.

Step 3: Mean across 12 months = 19,800 ÷ 12 = 1,650.

The answer is 1,650.',
  difficulty = 'hard'
WHERE id = 'c49b8985-d443-4d39-9de5-06fb5d7cb2d9';

-- practice-qr-set-39-q3 was not in fail list — skip; q-grade verified above

-- practice-qr-set-21-q2: Plymouth excess in months where it exceeds Manchester
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the months in which Plymouth''s rainfall exceeded Manchester''s, by how many millimetres in total did Plymouth exceed Manchester?',
  options = '[{"text":"16 mm","label":"A"},{"text":"24 mm","label":"B"},{"text":"32 mm","label":"C"},{"text":"38 mm","label":"D"},{"text":"53 mm","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Compare each month. Jan: Plymouth 112 vs Manchester 98 → +14. Feb: 95 vs 85 → +10. Mar: 80 vs 72 → +8. Apr: 60 vs 64 → no. May: 48 vs 55 → no. Jun: 52 vs 68 → no.

Step 2: Plymouth exceeds Manchester only in January, February and March.

Step 3: Total excess = 14 + 10 + 8 = 32 mm.

The answer is 32 mm.',
  difficulty = 'hard'
WHERE id = '73b21da9-924b-4f8b-929f-0292f3add340';

-- practice-qr-set-37-q2: Brighton mean − Edinburgh mean across 12 months
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the twelve months shown, what is Brighton''s mean monthly temperature minus Edinburgh''s mean monthly temperature, to 1 decimal place?',
  options = '[{"text":"1.5 °C","label":"A"},{"text":"2.5 °C","label":"B"},{"text":"3.0 °C","label":"C"},{"text":"3.5 °C","label":"D"},{"text":"4.0 °C","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum Brighton''s twelve months: 7 + 7 + 9 + 11 + 14 + 18 + 19 + 19 + 17 + 13 + 10 + 8 = 152. Brighton mean = 152 ÷ 12 = 12.667 °C.

Step 2: Sum Edinburgh''s twelve months: 4 + 4 + 6 + 8 + 11 + 14 + 16 + 16 + 14 + 11 + 7 + 5 = 116. Edinburgh mean = 116 ÷ 12 = 9.667 °C.

Step 3: Difference = 12.667 − 9.667 = 3.0 °C.

The answer is 3.0 °C.',
  difficulty = 'hard'
WHERE id = '9daa1f41-45de-4485-8ab8-6f945f1f61f0';

-- practice-qr-set-70-q2: % Coast > next-most-visited park in June
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'In June, by what percentage do Coast Park''s visitors exceed those of the next-most-visited park, to 1 decimal place?',
  options = '[{"text":"5.0%","label":"A"},{"text":"9.1%","label":"B"},{"text":"10.0%","label":"C"},{"text":"60.0%","label":"D"},{"text":"71.4%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Read the four parks at June: Lakeside 55, Summit 38, Forest 35, Coast 60 (thousand visitors).

Step 2: Coast is the highest at 60; the next-most-visited is Lakeside at 55.

Step 3: Percentage by which Coast exceeds Lakeside = (60 − 55) ÷ 55 × 100 = 9.09%, which rounds to 9.1%.

The answer is 9.1%.',
  difficulty = 'hard'
WHERE id = 'c68fc4bf-9acf-421d-82d5-d59b4a5330bf';

-- practice-qr-set-60-q2: % by which 2024 combined > 2020 combined
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Express the change in combined console sales from 2020 to 2024 as a percentage of the 2020 combined total, to 1 decimal place.',
  options = '[{"text":"38.3%","label":"A"},{"text":"45.0%","label":"B"},{"text":"62.2%","label":"C"},{"text":"86.5%","label":"D"},{"text":"162.2%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: 2020 combined sales = 12 (Alpha) + 20 (Beta) + 5 (Gamma) = 37 million units.

Step 2: 2024 combined sales = 25 + 12 + 23 = 60 million units.

Step 3: Percentage change = (60 − 37) ÷ 37 × 100 = 23 ÷ 37 × 100 = 62.16%, which rounds to 62.2%.

The answer is 62.2%.',
  difficulty = 'hard'
WHERE id = 'b5f3000d-db6c-42cb-901a-1922d858cfe9';

-- practice-qr-set-60-q4: % by which Alpha 5-year total > Beta 5-year total
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the five years 2020–2024, by what percentage was Alpha''s total sales greater than Beta''s total sales, to 1 decimal place?',
  options = '[{"text":"13.0%","label":"A"},{"text":"13.6%","label":"B"},{"text":"15.0%","label":"C"},{"text":"17.4%","label":"D"},{"text":"28.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Alpha five-year total = 12 + 15 + 18 + 22 + 25 = 92 million units.

Step 2: Beta five-year total = 20 + 18 + 16 + 14 + 12 = 80 million units.

Step 3: Percentage by which Alpha exceeds Beta = (92 − 80) ÷ 80 × 100 = 12 ÷ 80 × 100 = 15.0%.

The answer is 15.0%.',
  difficulty = 'hard'
WHERE id = '29e88ceb-feb6-4b91-af89-ad2703e6d593';

-- practice-qr-set-92-q2: Carla Week 9 → Week 12 % drop
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Carla peaks at her highest mileage in Week 9 and then tapers down to Week 12. By what percentage did her mileage drop from Week 9 to Week 12, to 1 decimal place?',
  options = '[{"text":"20.0%","label":"A"},{"text":"25.0%","label":"B"},{"text":"33.3%","label":"C"},{"text":"40.0%","label":"D"},{"text":"50.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read Carla''s Week 9 = 60 miles and Week 12 = 40 miles from the line graph.

Step 2: Percentage decrease uses the original value (Week 9) as the denominator: (60 − 40) ÷ 60 × 100 = 20 ÷ 60 × 100 = 33.33%, which rounds to 33.3%.

The answer is 33.3%.',
  difficulty = 'normal'
WHERE id = 'fcb115c6-ed22-49f8-a5f2-0c7b338e6459';

-- practice-qr-set-27-q3: Total A*/A % change 2024 to 2025
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five subjects combined, what was the percentage change in total A*/A grades from 2024 to 2025, to 1 decimal place?',
  options = '[{"text":"8.4%","label":"A"},{"text":"8.5%","label":"B"},{"text":"9.1%","label":"C"},{"text":"9.4%","label":"D"},{"text":"10.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: 2024 total = 180 + 160 + 140 + 220 + 120 = 820.

Step 2: 2025 total = 210 + 150 + 165 + 240 + 130 = 895.

Step 3: Percentage change uses the 2024 value as the denominator: (895 − 820) ÷ 820 × 100 = 75 ÷ 820 × 100 = 9.146%, which rounds to 9.1%.

The answer is 9.1%.',
  difficulty = 'hard'
WHERE id = '0cd2dbfb-cd45-494a-bf96-2dc351454033';

----------------------------------------------------------------------
-- Cross-tabulation table sets
----------------------------------------------------------------------

-- practice-qr-set-41-q1: How many regions are "category-dominant" (any single category > 40%)
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'A region is called "category-dominant" if any single category accounts for more than 40% of that region''s total sales. How many of the four regions shown are category-dominant?',
  options = '[{"text":"0","label":"A"},{"text":"1","label":"B"},{"text":"2","label":"C"},{"text":"3","label":"D"},{"text":"4","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: For each region, find the largest category value and compare it to 40% of the region''s total.

Step 2: North — biggest category is Groceries at 500. 40% of 1,200 = 480. 500 > 480, so North qualifies.

Step 3: South — biggest is Groceries at 600. 40% of 1,300 = 520. 600 > 520, so South qualifies.

Step 4: East — biggest is Groceries at 450. 40% of 1,200 = 480. 450 < 480, so East does NOT qualify.

Step 5: West — biggest is Groceries at 450. 40% of 1,100 = 440. 450 > 440, so West qualifies.

Step 6: Three regions (North, South, West) are category-dominant.

The answer is 3.',
  difficulty = 'hard'
WHERE id = '5c8d7c1d-3cb8-40b6-bbfa-0d646bea5b60';

-- practice-qr-set-41-q2: % by which South Groceries exceeds East Groceries
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'By what percentage are South region Groceries sales greater than East region Groceries sales, to 1 decimal place?',
  options = '[{"text":"25.0%","label":"A"},{"text":"30.0%","label":"B"},{"text":"33.3%","label":"C"},{"text":"75.0%","label":"D"},{"text":"133.3%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the two cells: South Groceries = 600 and East Groceries = 450.

Step 2: Percentage change uses the original (East) value as the denominator: (600 − 450) ÷ 450 × 100 = 150 ÷ 450 × 100 = 33.33%, which rounds to 33.3%.

The answer is 33.3%.',
  difficulty = 'normal'
WHERE id = '90ed23cc-2300-4244-8cae-aad3c490affb';

-- practice-qr-set-41-q3: Total profit on East region using per-category margins
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The store''s profit margins are 15% on Electronics, 25% on Clothing, 8% on Groceries and 20% on Homeware. What is the total profit on East region sales, in £?',
  options = '[{"text":"£162,000","label":"A"},{"text":"£180,000","label":"B"},{"text":"£196,000","label":"C"},{"text":"£210,000","label":"D"},{"text":"£225,000","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Apply each category''s margin to the East column, working in £000s. Electronics: 160 × 0.15 = 24. Clothing: 360 × 0.25 = 90. Groceries: 450 × 0.08 = 36. Homeware: 230 × 0.20 = 46.

Step 2: Sum the four contributions: 24 + 90 + 36 + 46 = 196 (£000s).

Step 3: Convert to £: 196 × £1,000 = £196,000.

The answer is £196,000.',
  difficulty = 'hard'
WHERE id = 'e70b758b-8357-4c96-8b4a-c4c2815dc815';

-- practice-qr-set-26-q3: Specialty with highest South share of own row total
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'For which specialty is the South region''s referrals the highest share of that specialty''s row total, to 1 decimal place?',
  options = '[{"text":"Cardiology","label":"A"},{"text":"Dermatology","label":"B"},{"text":"Gastroenterology","label":"C"},{"text":"Neurology","label":"D"},{"text":"Rheumatology","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Compute South share = South cell ÷ row total × 100 for each specialty. Cardiology: 150 ÷ 540 × 100 = 27.8%. Dermatology: 200 ÷ 700 × 100 = 28.6%. Gastroenterology: 130 ÷ 410 × 100 = 31.7%. Neurology: 100 ÷ 300 × 100 = 33.3%. Rheumatology: 120 ÷ 370 × 100 = 32.4%.

Step 2: The highest South share is Neurology at 33.3%.

The answer is Neurology.',
  difficulty = 'hard'
WHERE id = '6bc48656-2d3a-47cf-8757-49eaabf949a9';

-- practice-qr-set-26-q4: N : S ratio excluding Cardiology and Dermatology
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Excluding Cardiology and Dermatology, what is the ratio of all North referrals to all South referrals across the remaining three specialties, in its simplest form?',
  options = '[{"text":"5 : 7","label":"A"},{"text":"6 : 7","label":"B"},{"text":"32 : 35","label":"C"},{"text":"35 : 32","label":"D"},{"text":"7 : 5","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Use the North column total minus the two excluded rows: 740 − 180 (Cardiology) − 240 (Dermatology) = 320.

Step 2: Repeat for South: 700 − 150 − 200 = 350.

Step 3: Ratio 320 : 350 simplifies by dividing both sides by 10 to give 32 : 35, which has no further common factor.

The answer is 32 : 35.',
  difficulty = 'hard'
WHERE id = '2a8f5eda-aa2d-46d7-ad4d-8d45eca7b231';

-- practice-qr-set-36-q3: Region with highest 0–17 share
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all four regions, which has the highest proportion of its population aged 0–17, to 1 decimal place?',
  options = '[{"text":"North","label":"A"},{"text":"Midlands","label":"B"},{"text":"South","label":"C"},{"text":"West","label":"D"},{"text":"All four are equal","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Compute 0–17 ÷ regional total × 100 for each region. North: 520 ÷ 2,600 × 100 = 20.0%. Midlands: 610 ÷ 2,900 × 100 = 21.0%. South: 680 ÷ 3,400 × 100 = 20.0%. West: 420 ÷ 2,010 × 100 = 20.9%.

Step 2: The highest share is Midlands at 21.0%.

The answer is Midlands.',
  difficulty = 'hard'
WHERE id = '4d323101-1574-425d-91fd-1414ade09dc3';

-- practice-qr-set-72-q2: % of cold-blooded animals that live in the Rainforest
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Treat reptiles and amphibians together as "cold-blooded" animals. What percentage of the zoo''s cold-blooded animals live in the Rainforest, to 1 decimal place?',
  options = '[{"text":"22.5%","label":"A"},{"text":"31.5%","label":"B"},{"text":"39.5%","label":"C"},{"text":"44.4%","label":"D"},{"text":"50.0%","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Total cold-blooded = Reptiles row total 60 + Amphibians row total 30 = 90.

Step 2: Cold-blooded in Rainforest = Reptiles Rainforest 18 + Amphibians Rainforest 22 = 40.

Step 3: Share = 40 ÷ 90 × 100 = 44.444%, which rounds to 44.4%.

The answer is 44.4%.',
  difficulty = 'hard'
WHERE id = '9296450b-94fe-476a-ae6f-c4ad250eb52f';

-- practice-qr-set-72-q3: Habitat with the highest mammal share
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Among the four habitats, which has the highest share of mammals as a percentage of its own total population, to 1 decimal place?',
  options = '[{"text":"Savannah","label":"A"},{"text":"Rainforest","label":"B"},{"text":"Arctic","label":"C"},{"text":"Desert","label":"D"},{"text":"All four are equal","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Compute mammal share for each habitat using the column totals. Savannah: 48 ÷ 85 × 100 = 56.5%. Rainforest: 32 ÷ 127 × 100 = 25.2%. Arctic: 18 ÷ 26 × 100 = 69.2%. Desert: 12 ÷ 62 × 100 = 19.4%.

Step 2: The highest share is Arctic at 69.2%.

The answer is Arctic.',
  difficulty = 'hard'
WHERE id = '87e1f86f-281e-44a3-bbe3-ff13b2b7d0fc';

-- practice-qr-set-72-q4: Combined Rainforest + Arctic share of total animals
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Combining the Rainforest and Arctic habitats into a single "Cool Climate" zone, what percentage of the zoo''s 300 animals live in this Cool Climate zone, to 1 decimal place?',
  options = '[{"text":"8.7%","label":"A"},{"text":"28.3%","label":"B"},{"text":"42.3%","label":"C"},{"text":"51.0%","label":"D"},{"text":"59.7%","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Read the column totals for Rainforest (127) and Arctic (26) and sum them: 127 + 26 = 153.

Step 2: Express as a share of the 300 total: 153 ÷ 300 × 100 = 51.0%.

The answer is 51.0%.',
  difficulty = 'normal'
WHERE id = '2ada1593-5b14-41a3-99f2-50aa2d5730ab';

-- practice-qr-set-51-q2: % of Standard listeners on Pop+Rock+Hip-Hop
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Of all listeners on the Standard tier, what percentage are on the Pop, Rock or Hip-Hop genres combined, to 1 decimal place?',
  options = '[{"text":"23.0%","label":"A"},{"text":"73.5%","label":"B"},{"text":"81.2%","label":"C"},{"text":"84.4%","label":"D"},{"text":"92.5%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the Standard column for the three named genres: Pop 8.0m + Rock 5.5m + Hip-Hop 7.2m = 20.7m.

Step 2: Read the Standard column total: 25.5m.

Step 3: Share = 20.7 ÷ 25.5 × 100 = 81.18%, which rounds to 81.2%.

The answer is 81.2%.',
  difficulty = 'hard'
WHERE id = '2b0d4259-2552-4f29-a2a0-456de842a4f7';

-- practice-qr-set-75-q2: % of all calls answered in 15 minutes or less
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'What percentage of all calls received last month were responded to in 15 minutes or less, to 1 decimal place?',
  options = '[{"text":"25.6%","label":"A"},{"text":"34.6%","label":"B"},{"text":"51.1%","label":"C"},{"text":"60.2%","label":"D"},{"text":"65.4%","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Read the row totals for the two fastest response bands: ≤7 min total = 340 and 8–15 min total = 460.

Step 2: Sum them: 340 + 460 = 800 calls answered within 15 minutes.

Step 3: Express as a share of the grand total of 1,330 calls: 800 ÷ 1,330 × 100 = 60.150%, which rounds to 60.2%.

The answer is 60.2%.',
  difficulty = 'hard'
WHERE id = 'ebb88b75-a073-4e17-bfc5-b47dea5444f2';

-- practice-qr-set-84-q2: Room with highest Morning share of own total
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the four room types, which has the highest Morning bookings as a percentage of its own total bookings, to 1 decimal place?',
  options = '[{"text":"Silent Study","label":"A"},{"text":"Group Study","label":"B"},{"text":"Media Room","label":"C"},{"text":"PhD Pods","label":"D"},{"text":"All four are equal","label":"E"}]',
  correct_answer = 'A',
  answer_reason = 'Step 1: Compute Morning ÷ Room total × 100 for each room. Silent Study: 45 ÷ 180 × 100 = 25.0%. Group Study: 30 ÷ 165 × 100 = 18.2%. Media Room: 10 ÷ 75 × 100 = 13.3%. PhD Pods: 15 ÷ 70 × 100 = 21.4%.

Step 2: The highest Morning share is Silent Study at 25.0%.

The answer is Silent Study.',
  difficulty = 'hard'
WHERE id = 'ae80b906-29fc-495b-bab7-884a51388dd8';

----------------------------------------------------------------------
-- Line graph sets
----------------------------------------------------------------------

-- practice-qr-set-03-q2: How many months Patient C > Patient A
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the six months shown, in how many months was Patient C''s HbA1c reading higher than Patient A''s?',
  options = '[{"text":"0","label":"A"},{"text":"1","label":"B"},{"text":"2","label":"C"},{"text":"3","label":"D"},{"text":"4","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Read the two lines month by month. January A 72 vs C 58 → A higher. February A 68 vs C 60 → A higher. March A 65 vs C 62 → A higher. April A 60 vs C 64 → C higher. May A 58 vs C 66 → C higher. June A 55 vs C 68 → C higher.

Step 2: C exceeds A in April, May and June, which is 3 months.

The answer is 3.',
  difficulty = 'normal'
WHERE id = '3ab4c954-b4da-4ddd-946e-5a78479a2b3a';

-- practice-qr-set-13-q2: Count readings >45 minutes across both commuters
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the ten data points (5 days × 2 commuters), how many of the recorded commute times were strictly greater than 45 minutes?',
  options = '[{"text":"4","label":"A"},{"text":"5","label":"B"},{"text":"6","label":"C"},{"text":"7","label":"D"},{"text":"8","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read Emma''s line: 35, 48, 42, 55, 38. Values strictly above 45: 48 and 55 — 2 readings.

Step 2: Read Jake''s line: 52, 45, 50, 48, 46. Values strictly above 45: 52, 50, 48, 46 — 4 readings (45 itself does not qualify).

Step 3: Combined count = 2 + 4 = 6 readings.

The answer is 6.',
  difficulty = 'normal'
WHERE id = '012c453b-580e-4944-9c63-07d4d1611489';

-- practice-qr-set-28-q4: Recorded points <85% across all operators (excluding A April)
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the 17 recorded data points (all months for all three operators, excluding Operator A''s missing April), how many readings are strictly below 85%?',
  options = '[{"text":"5","label":"A"},{"text":"6","label":"B"},{"text":"7","label":"C"},{"text":"8","label":"D"},{"text":"9","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read Operator A''s recorded values (excluding April): 88, 86, 84, 83, 87. Below 85: 84 and 83 → 2 readings.

Step 2: Read Operator B''s six values: 78, 80, 83, 85, 86, 88. Below 85: 78, 80, 83 → 3 readings (85 itself does not qualify).

Step 3: Read Operator C''s six values: 92, 91, 87, 85, 83, 82. Below 85: 83, 82 → 2 readings.

Step 4: Combined count = 2 + 3 + 2 = 7 readings.

The answer is 7.',
  difficulty = 'hard'
WHERE id = '3e529cf4-6b31-43eb-b6d7-3e5f670c3677';

-- practice-qr-set-81-q2: Recorded points <35s across all four strokes
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the 23 recorded lap-time data points (all four strokes × six weeks, excluding the missing Backstroke Week 4), how many readings were strictly below 35 seconds?',
  options = '[{"text":"8","label":"A"},{"text":"10","label":"B"},{"text":"11","label":"C"},{"text":"13","label":"D"},{"text":"15","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read Freestyle: 32.0, 31.5, 31.0, 30.6, 30.2, 29.8. All six are below 35 → 6 readings.

Step 2: Read Backstroke (Week 4 missing): 38.0, 37.5, 37.0, 36.1, 35.7. None are below 35 → 0 readings.

Step 3: Read Breaststroke: 42.0, 41.5, 41.0, 40.6, 40.2, 39.8. None are below 35 → 0 readings.

Step 4: Read Butterfly: 35.0, 34.5, 34.0, 33.6, 33.2, 32.8. Below 35: 34.5, 34.0, 33.6, 33.2, 32.8 → 5 readings (35.0 itself does not qualify).

Step 5: Combined count = 6 + 0 + 0 + 5 = 11 readings.

The answer is 11.',
  difficulty = 'hard'
WHERE id = '5adf938b-662c-42fe-89b1-bab6c6d74f16';

-- practice-qr-set-57-q1: Mean monthly occupancy across six months
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across the six months shown, what is the mean monthly occupancy rate?',
  options = '[{"text":"60.0%","label":"A"},{"text":"70.0%","label":"B"},{"text":"72.5%","label":"C"},{"text":"75.0%","label":"D"},{"text":"85.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the six monthly bars: 60, 65, 70, 75, 80, 85.

Step 2: Sum the six values: 60 + 65 + 70 + 75 + 80 + 85 = 435.

Step 3: Mean = 435 ÷ 6 = 72.5%.

The answer is 72.5%.',
  difficulty = 'normal'
WHERE id = '4843358a-83be-4ff5-a03d-c562d079ecd7';

----------------------------------------------------------------------
-- Scatter plot sets
----------------------------------------------------------------------

-- practice-qr-set-89-q1: Highest swim time as % of own total
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Among the five athletes, which had the highest swim split as a percentage of their own total race time, to 1 decimal place?',
  options = '[{"text":"Amara","label":"A"},{"text":"Brendan","label":"B"},{"text":"Clara","label":"C"},{"text":"Diego","label":"D"},{"text":"Elena","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Compute swim ÷ total × 100 for each athlete. Amara 25 ÷ 129 × 100 = 19.4%. Brendan 28 ÷ 133 × 100 = 21.1%. Clara 23 ÷ 127 × 100 = 18.1%. Diego 27 ÷ 131 × 100 = 20.6%. Elena 26 ÷ 133 × 100 = 19.5%.

Step 2: The highest swim share is Brendan at 21.1%.

The answer is Brendan.',
  difficulty = 'hard'
WHERE id = 'c0ba9af5-5f32-4a5d-bf67-281c4eac18d1';

-- practice-qr-set-86-q3: Mean honey production per month of hive age
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all eight hives, what is the mean honey production per month of hive age, to 2 decimal places of kg?',
  options = '[{"text":"1.10 kg","label":"A"},{"text":"1.32 kg","label":"B"},{"text":"1.52 kg","label":"C"},{"text":"1.75 kg","label":"D"},{"text":"2.00 kg","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: For each hive, divide honey by age (in months). A: 12 ÷ 6 = 2.000. B: 18 ÷ 10 = 1.800. C: 22 ÷ 14 = 1.571. D: 28 ÷ 18 = 1.556. E: 35 ÷ 22 = 1.591. F: 32 ÷ 26 = 1.231. G: 40 ÷ 30 = 1.333. H: 38 ÷ 34 = 1.118.

Step 2: Sum the eight ratios: 2.000 + 1.800 + 1.571 + 1.556 + 1.591 + 1.231 + 1.333 + 1.118 = 12.200.

Step 3: Mean = 12.200 ÷ 8 = 1.5249, which rounds to 1.52 kg per month.

The answer is 1.52 kg.',
  difficulty = 'hard'
WHERE id = '7624366c-a3a7-4fdb-8284-cb14352ba887';

-- practice-qr-set-86-q4: How many hives produced above the mean
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Comparing each hive''s annual honey production with the mean across all eight hives, how many hives produced strictly above the mean?',
  options = '[{"text":"2","label":"A"},{"text":"3","label":"B"},{"text":"4","label":"C"},{"text":"5","label":"D"},{"text":"6","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum the eight annual values: 12 + 18 + 22 + 28 + 35 + 32 + 40 + 38 = 225 kg.

Step 2: Mean = 225 ÷ 8 = 28.125 kg.

Step 3: Compare each hive: A 12 (no), B 18 (no), C 22 (no), D 28 (no, 28 < 28.125), E 35 (yes), F 32 (yes), G 40 (yes), H 38 (yes). That gives 4 hives above the mean.

The answer is 4.',
  difficulty = 'normal'
WHERE id = '6434eeab-23e4-4b53-aa0c-10e69d345375';

-- practice-qr-set-33-q2: City with lowest rent per 1,000 density units
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'For each city, divide its average monthly rent by its density and multiply by 1,000 to get the rent per 1,000 people per km² of density. Which city has the LOWEST value?',
  options = '[{"text":"City A","label":"A"},{"text":"City B","label":"B"},{"text":"City C","label":"C"},{"text":"City D","label":"D"},{"text":"City E","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: For each city compute rent ÷ density × 1,000 in £. City A: 650 ÷ 1,800 × 1,000 = 361.11. City E: 750 ÷ 2,500 × 1,000 = 300.00. City B: 900 ÷ 3,100 × 1,000 = 290.32. City C: 1,100 ÷ 4,200 × 1,000 = 261.90. City D: 1,850 ÷ 5,800 × 1,000 = 318.97.

Step 2: The lowest value is City C at 261.90.

The answer is City C.',
  difficulty = 'hard'
WHERE id = '792ea980-b10b-43a4-98c9-92c74b1a809e';

-- practice-qr-set-98-q2: Region with highest Perennials share
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Among the five regions, which has the highest proportion of its sales in Perennials, to 1 decimal place?',
  options = '[{"text":"North","label":"A"},{"text":"Midlands","label":"B"},{"text":"South","label":"C"},{"text":"West","label":"D"},{"text":"Online","label":"E"}]',
  correct_answer = 'E',
  answer_reason = 'Step 1: For each region, compute Perennials ÷ column total × 100. North: 150 ÷ 450 × 100 = 33.3%. Midlands: 220 ÷ 700 × 100 = 31.4%. South: 300 ÷ 920 × 100 = 32.6%. West: 130 ÷ 380 × 100 = 34.2%. Online: 100 ÷ 250 × 100 = 40.0%.

Step 2: The highest Perennials share is Online at 40.0%.

The answer is Online.',
  difficulty = 'hard'
WHERE id = '8f18ce55-7e43-481a-a5d5-0aef4d8dc05d';

-- practice-qr-set-98-q4: Combined Shrubs+Trees % of Online sales
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Combine Shrubs and Trees into a single "Woody Plants" group. What percentage of Online sales does this combined group represent, to 1 decimal place?',
  options = '[{"text":"24.0%","label":"A"},{"text":"32.0%","label":"B"},{"text":"40.0%","label":"C"},{"text":"46.3%","label":"D"},{"text":"50.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the Online column for Shrubs and Trees: 60 + 40 = 100.

Step 2: Read the Online column total: 250.

Step 3: Share = 100 ÷ 250 × 100 = 40.0%.

The answer is 40.0%.',
  difficulty = 'normal'
WHERE id = 'b1f477b0-05c0-429f-ab26-7063d9119c70';

-- practice-qr-set-16-q2: Mean of all 25 individual scores
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all 25 individual subject scores in the table, what is the mean score, to 1 decimal place?',
  options = '[{"text":"70.0%","label":"A"},{"text":"74.5%","label":"B"},{"text":"76.3%","label":"C"},{"text":"78.0%","label":"D"},{"text":"82.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum each row. Alex: 68 + 75 + 72 + 82 + 90 = 387. Bella: 85 + 88 + 82 + 70 + 65 = 390. Chen: 92 + 95 + 90 + 78 + 72 = 427. Dani: 55 + 62 + 48 + 75 + 88 = 328. Emir: 78 + 70 + 85 + 88 + 55 = 376.

Step 2: Grand total across all 25 cells = 387 + 390 + 427 + 328 + 376 = 1,908.

Step 3: Mean = 1,908 ÷ 25 = 76.32%, which rounds to 76.3%.

The answer is 76.3%.',
  difficulty = 'normal'
WHERE id = '29f49bec-8739-4958-a959-14621305ee1d';

-- practice-qr-set-16-q4: How many subjects have a class mean >75%
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'For how many of the five subjects does the class mean strictly exceed 75%?',
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"4","label":"D"},{"text":"5","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Compute each column''s mean over the five students. Maths: (68 + 85 + 92 + 55 + 78) ÷ 5 = 378 ÷ 5 = 75.6%. Biology: (75 + 88 + 95 + 62 + 70) ÷ 5 = 390 ÷ 5 = 78.0%. Chemistry: (72 + 82 + 90 + 48 + 85) ÷ 5 = 377 ÷ 5 = 75.4%. English: (82 + 70 + 78 + 75 + 88) ÷ 5 = 393 ÷ 5 = 78.6%. Art: (90 + 65 + 72 + 88 + 55) ÷ 5 = 370 ÷ 5 = 74.0%.

Step 2: Subjects strictly above 75%: Maths, Biology, Chemistry, English. Art (74.0%) does not qualify.

Step 3: That gives a count of 4 subjects.

The answer is 4.',
  difficulty = 'hard'
WHERE id = '722f79c0-5e4e-41ab-9cda-d3d3fe803b06';

----------------------------------------------------------------------
-- Text-stimulus and table sets (financial, rate, geometry)
----------------------------------------------------------------------

-- practice-qr-set-09-q2: Alpha vs Beta total cost on £100k 2-year loan
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'On a £100,000 loan over 2 years, by how much more does Alpha Fixed 2 cost in total (interest + arrangement fee) than Beta Fixed 2, to the nearest £1?',
  options = '[{"text":"£22","label":"A"},{"text":"£100","label":"B"},{"text":"£250","label":"C"},{"text":"£500","label":"D"},{"text":"£750","label":"E"}]',
  correct_answer = 'A',
  answer_reason = 'Step 1: Apply the compound formula to each product. Alpha balance = 100,000 × 1.045² = 100,000 × 1.092025 = £109,202.50. Alpha interest = £9,202.50. Alpha total cost = 9,202.50 + 999 = £10,201.50.

Step 2: Beta balance = 100,000 × 1.0425² = 100,000 × 1.08680625 = £108,680.63. Beta interest = £8,680.63. Beta total cost = 8,680.63 + 1,499 = £10,179.63.

Step 3: Alpha exceeds Beta by 10,201.50 − 10,179.63 = £21.87, which rounds to £22.

The answer is £22.',
  difficulty = 'hard'
WHERE id = '8019cecf-5be3-4dca-b89a-0d539075d961';

-- practice-qr-set-10-q1: First year cumulative interest exceeds £500
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'After how many full years does the customer''s cumulative interest first exceed £500?',
  options = '[{"text":"2","label":"A"},{"text":"3","label":"B"},{"text":"4","label":"C"},{"text":"5","label":"D"},{"text":"6","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Apply the compound formula year by year. Year 1: balance = 5,000 × 1.04 = £5,200. Cumulative interest = £200.

Step 2: Year 2: balance = 5,200 × 1.04 = £5,408. Cumulative interest = £408.

Step 3: Year 3: balance = 5,408 × 1.04 = £5,624.32. Cumulative interest = £624.32.

Step 4: £624.32 is the first cumulative interest figure above £500, and it is reached at the end of Year 3.

The answer is 3.',
  difficulty = 'normal'
WHERE id = 'a8432de5-6bdc-4f34-ad06-768930f37e75';

-- practice-qr-set-50-q1: Loyalty member adds £15 hat — final price including VAT
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The loyalty member adds a hat marked at £15 to the order. What is the new total she pays, including VAT and any delivery, to the nearest penny?',
  options = '[{"text":"£101.25","label":"A"},{"text":"£104.30","label":"B"},{"text":"£109.35","label":"C"},{"text":"£114.30","label":"D"},{"text":"£121.50","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: New marked total = 60 + 25 + 35 + 15 = £135.

Step 2: Apply the 25% sale discount: 135 × 0.75 = £101.25.

Step 3: Apply the further 10% loyalty discount: 101.25 × 0.90 = £91.125 (this is the pre-VAT price).

Step 4: £91.125 is over the £50 free-delivery threshold, so no delivery fee. Add 20% VAT: 91.125 × 1.20 = £109.35.

The answer is £109.35.',
  difficulty = 'hard'
WHERE id = '634073b1-1a3d-4238-8450-02aa4df2df62';

-- practice-qr-set-11-q1: Saving of Advance Singles vs Anytime Returns over a month
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'A passenger plans 6 one-way Manchester journeys and 4 one-way Birmingham journeys this month. Comparing two strategies — paying for Anytime Returns and treating each leg as half the return fare, or buying Advance Singles for every journey — how much does the Advance Singles strategy save?',
  options = '[{"text":"£550","label":"A"},{"text":"£900","label":"B"},{"text":"£1,132","label":"C"},{"text":"£1,254","label":"D"},{"text":"£1,598","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Anytime one-way fares (return ÷ 2): Manchester = 386 ÷ 2 = £193. Birmingham = 220 ÷ 2 = £110.

Step 2: Anytime Return strategy total = 6 × 193 + 4 × 110 = 1,158 + 440 = £1,598.

Step 3: Advance Single strategy total = 6 × 55 + 4 × 34 = 330 + 136 = £466.

Step 4: Saving = 1,598 − 466 = £1,132.

The answer is £1,132.',
  difficulty = 'hard'
WHERE id = 'd8ffc62f-44ec-49a1-a0e3-e2403e07e2fa';

-- practice-qr-set-12-q1: Arrival time including drive + lunch
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Maria leaves Norwich at 09:00, takes the 30-minute lunch break in Birmingham as planned, and drives the second leg at the stated 35 mph. At what time does she arrive in Aberystwyth?',
  options = '[{"text":"15:30","label":"A"},{"text":"16:00","label":"B"},{"text":"16:30","label":"C"},{"text":"17:00","label":"D"},{"text":"17:30","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Leg 1 driving time = 180 ÷ 60 = 3.0 hours. Arriving in Birmingham at 09:00 + 3:00 = 12:00.

Step 2: Add the 30-minute lunch break: 12:00 + 0:30 = 12:30.

Step 3: Leg 2 driving time = 140 ÷ 35 = 4.0 hours. Arriving in Aberystwyth at 12:30 + 4:00 = 16:30.

The answer is 16:30.',
  difficulty = 'hard'
WHERE id = 'd833e4c6-a6d5-449d-a631-80d55e405fc9';

-- practice-qr-set-15-q1: Non-cruise distance in km using cruise/non-cruise split
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'During the non-cruise phases (taxi, climb, descent and landing), the aircraft averages 240 mph. What total distance, in km, does the aircraft cover during the non-cruise phases, to the nearest km?',
  options = '[{"text":"261 km","label":"A"},{"text":"391 km","label":"B"},{"text":"418 km","label":"C"},{"text":"522 km","label":"D"},{"text":"730 km","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Total flight time = 7 h 15 m = 7.25 hours.

Step 2: Cruise time = 85% of total = 0.85 × 7.25 = 6.1625 hours. Non-cruise time = 7.25 − 6.1625 = 1.0875 hours.

Step 3: Non-cruise distance in miles = 240 × 1.0875 = 261 miles.

Step 4: Convert to km using 1 mile = 1.6 km: 261 × 1.6 = 417.6 km, which rounds to 418 km.

The answer is 418 km.',
  difficulty = 'hard'
WHERE id = 'c0c738ab-fa67-4e3b-9b2b-02aa032c7800';

-- practice-qr-set-23-q2: Time to fill from 40% to brim
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'If the tank is initially 40% full and the tap is opened at the stated 18 L/min, how long will it take for the tank to reach the brim, in hours and minutes (to the nearest minute)?',
  options = '[{"text":"5 h 02 m","label":"A"},{"text":"6 h 18 m","label":"B"},{"text":"7 h 32 m","label":"C"},{"text":"8 h 25 m","label":"D"},{"text":"9 h 10 m","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Volume of the tank = π × r² × h = 3.14 × 1.2² × 3.0 = 13.5648 m³. Convert to litres: 13,564.8 L.

Step 2: Volume already in the tank = 0.40 × 13,564.8 = 5,425.92 L. Volume still needed = 13,564.8 − 5,425.92 = 8,138.88 L.

Step 3: Time = volume ÷ flow rate = 8,138.88 ÷ 18 = 452.16 minutes.

Step 4: Convert to hours and minutes: 452.16 ÷ 60 = 7.536 hours = 7 h 32 m (since 0.536 × 60 ≈ 32 min).

The answer is 7 h 32 m.',
  difficulty = 'hard'
WHERE id = '0587b5ba-2ccf-496b-825b-21e160e46c39';

-- practice-qr-set-45-q2: % drained in 1 hour, full tank, outlet only
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Starting from a fully full tank with only the outlet open, what percentage of the tank''s capacity has drained out after exactly 1 hour?',
  options = '[{"text":"30%","label":"A"},{"text":"37.5%","label":"B"},{"text":"45%","label":"C"},{"text":"50%","label":"D"},{"text":"55%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Tank capacity = 12 m³ × 1,000 = 12,000 L.

Step 2: Volume drained in 1 hour = outlet rate × time = 90 × 60 = 5,400 L.

Step 3: Percentage drained = 5,400 ÷ 12,000 × 100 = 45.0%.

The answer is 45%.',
  difficulty = 'normal'
WHERE id = 'a82e4062-2d47-4648-81fc-8892a03ccb07';

-- practice-qr-set-24-q2: Mean % reduction needed across all five sectors to hit 2030 targets
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five sectors, what is the mean percentage reduction required from the 2025 figure to the 2030 target, to 1 decimal place?',
  options = '[{"text":"21.5%","label":"A"},{"text":"22.5%","label":"B"},{"text":"23.0%","label":"C"},{"text":"24.5%","label":"D"},{"text":"26.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: For each sector, compute (2025 − 2030 target) ÷ 2025 × 100. Energy: (75 − 55) ÷ 75 × 100 = 26.67%. Transport: (95 − 70) ÷ 95 × 100 = 26.32%. Industry: (68 − 50) ÷ 68 × 100 = 26.47%. Buildings: (60 − 45) ÷ 60 × 100 = 25.00%. Agriculture: (56 − 50) ÷ 56 × 100 = 10.71%.

Step 2: Sum the five percentage reductions: 26.67 + 26.32 + 26.47 + 25.00 + 10.71 = 115.17.

Step 3: Mean = 115.17 ÷ 5 = 23.03%, which rounds to 23.0%.

The answer is 23.0%.',
  difficulty = 'hard'
WHERE id = 'a7fd342d-8bc6-4804-b76b-93a411553a8b';

-- practice-qr-set-49-q1: Time saved on N → Port via shortest route vs N→Central→East→Port
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'A van travels from North to Port. Compared with the route N → Central → East → Port, how many minutes faster is the shortest route, at the stated 50 km/h driving speed?',
  options = '[{"text":"4 min","label":"A"},{"text":"6 min","label":"B"},{"text":"8 min","label":"C"},{"text":"12 min","label":"D"},{"text":"18 min","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Distance via N → Central → East → Port = 18 + 22 + 14 = 54 km. Time = 54 ÷ 50 × 60 = 64.8 minutes.

Step 2: The only other connected route is N → East → Port = 35 + 14 = 49 km. Time = 49 ÷ 50 × 60 = 58.8 minutes.

Step 3: 49 km is the shorter route, so time saved = 64.8 − 58.8 = 6.0 minutes.

The answer is 6 min.',
  difficulty = 'hard'
WHERE id = '3b1713c7-78c1-4df8-b9a5-5a325fbc6455';

-- practice-qr-set-49-q3: Shortest round trip from Central visiting both Port and West
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'A driver based at Central must visit both the Port and the West depot in a single round trip, starting and returning to Central, using only the connected roads shown. What is the shortest possible total distance, in km?',
  options = '[{"text":"76","label":"A"},{"text":"84","label":"B"},{"text":"91","label":"C"},{"text":"102","label":"D"},{"text":"117","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: List the directly-connected edges that involve Central, Port and West. Central–West 15 km, Central–East 22 km, East–Port 14 km, Port–South 28 km, South–West 12 km.

Step 2: Try the route Central → East → Port → South → West → Central: 22 + 14 + 28 + 12 + 15 = 91 km.

Step 3: Try the reverse Central → West → South → Port → East → Central: 15 + 12 + 28 + 14 + 22 = 91 km. Same total.

Step 4: Any route that backtracks through Central (e.g. Central → West → Central → East → Port → Central via East again) would add extra edges and cannot beat 91 km.

The answer is 91 km.',
  difficulty = 'hard'
WHERE id = '90dded7c-15e5-48ce-bd5b-d624f40eacdb';

-- practice-qr-set-63-q2: Outbound trips exceed inbound trips by how many bikes
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all eight time buckets shown, by how many bikes does total outbound exceed total inbound at this docking station?',
  options = '[{"text":"75","label":"A"},{"text":"250","label":"B"},{"text":"405","label":"C"},{"text":"750","label":"D"},{"text":"1,735","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum the Outbound bars: 85 + 420 + 180 + 160 + 175 + 210 + 385 + 120 = 1,735.

Step 2: Sum the Inbound bars: 30 + 110 + 175 + 195 + 180 + 205 + 340 + 95 = 1,330.

Step 3: Difference = 1,735 − 1,330 = 405.

The answer is 405.',
  difficulty = 'hard'
WHERE id = 'fe2c0736-e1bc-44d2-9e9d-e1707135d00e';

-- practice-qr-set-64-q2: Mean millilitres of milk per espresso shot across all five branches
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five branches combined, what is the mean number of millilitres of milk used per espresso shot, to the nearest whole millilitre?',
  options = '[{"text":"75","label":"A"},{"text":"80","label":"B"},{"text":"84","label":"C"},{"text":"88","label":"D"},{"text":"92","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Sum the daily milk column across the five branches: 42 + 30 + 48 + 22 + 36 = 178 L. Convert to mL: 178 × 1,000 = 178,000 mL.

Step 2: Sum the daily espresso shots column: 480 + 320 + 580 + 240 + 400 = 2,020 shots.

Step 3: Mean millilitres per shot = 178,000 ÷ 2,020 = 88.12, which rounds to 88 mL.

The answer is 88.',
  difficulty = 'hard'
WHERE id = '227acca5-5809-4025-a914-5e2d059e6a58';

-- practice-qr-set-65-q2: Average donation per donor across all five channels
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five channels combined, what was the average donation per donor, to the nearest penny?',
  options = '[{"text":"£18.30","label":"A"},{"text":"£25.40","label":"B"},{"text":"£33.50","label":"C"},{"text":"£37.21","label":"D"},{"text":"£53.80","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Sum the Donations column across all five channels: 48,000 + 12,500 + 7,200 + 22,000 + 9,800 = £99,500.

Step 2: Sum the Donors column: 1,200 + 310 + 960 + 24 + 180 = 2,674.

Step 3: Average donation per donor = 99,500 ÷ 2,674 = £37.21.

The answer is £37.21.',
  difficulty = 'hard'
WHERE id = 'cb97c8e8-c097-404c-ae0c-e552d07910c9';

-- practice-qr-set-78-q1: Highest acceptances among the three lowest acceptance-to-applicant ratios
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Of the three courses with the lowest acceptance-to-applicant ratios, which had the highest number of acceptances?',
  options = '[{"text":"Medicine","label":"A"},{"text":"Dentistry","label":"B"},{"text":"Law","label":"C"},{"text":"Engineering","label":"D"},{"text":"Business","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: For each course, compute acceptances ÷ applicants × 100. Medicine: 150 ÷ 1,200 × 100 = 12.5%. Dentistry: 80 ÷ 800 × 100 = 10.0%. Law: 400 ÷ 2,500 × 100 = 16.0%. Engineering: 350 ÷ 1,800 × 100 = 19.4%. Business: 900 ÷ 3,000 × 100 = 30.0%.

Step 2: The three lowest acceptance ratios are Dentistry (10.0%), Medicine (12.5%) and Law (16.0%).

Step 3: Among those three, the highest acceptance count is Law at 400 acceptances.

The answer is Law.',
  difficulty = 'hard'
WHERE id = 'd41a2ee2-be05-47a5-b2b5-735e726d2896';

-- practice-qr-set-78-q2: Combined acceptance rate across all five courses
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five courses combined, what percentage of applicants ultimately accepted a place, to 1 decimal place?',
  options = '[{"text":"18.0%","label":"A"},{"text":"20.2%","label":"B"},{"text":"30.0%","label":"C"},{"text":"36.5%","label":"D"},{"text":"60.0%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Sum the Applicants bars: 1,200 + 800 + 2,500 + 1,800 + 3,000 = 9,300.

Step 2: Sum the Acceptances bars: 150 + 80 + 400 + 350 + 900 = 1,880.

Step 3: Combined acceptance rate = 1,880 ÷ 9,300 × 100 = 20.215%, which rounds to 20.2%.

The answer is 20.2%.',
  difficulty = 'hard'
WHERE id = 'e2440737-fa07-4c7e-9b31-01418f3e3446';

-- practice-qr-set-90-q1: Economy 5 days, 750 mi, with insurance
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'A customer rents an Economy car for 5 days, drives 750 miles in total, and adds the insurance option. What is the total hire cost?',
  options = '[{"text":"£180","label":"A"},{"text":"£200","label":"B"},{"text":"£230","label":"C"},{"text":"£260","label":"D"},{"text":"£305","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'From the Economy row: daily base £30, free miles 100/day, overage £0.20/mile, insurance £6/day.

Step 1: Base hire = 5 × £30 = £150.

Step 2: Free miles = 5 × 100 = 500. Overage miles = 750 − 500 = 250.

Step 3: Overage charge = 250 × £0.20 = £50.

Step 4: Insurance = 5 × £6 = £30.

Step 5: Total = 150 + 50 + 30 = £230.

The answer is £230.',
  difficulty = 'hard'
WHERE id = 'f73de7da-2904-437f-a743-fc2e8cc2cf47';

-- practice-qr-set-62-q2: Average revenue per minute of chair time across all Filling appointments
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'What is the average revenue per minute of chair time across ALL Filling appointments (NHS plus private), to the nearest penny?',
  options = '[{"text":"£2.10","label":"A"},{"text":"£2.45","label":"B"},{"text":"£2.76","label":"C"},{"text":"£3.20","label":"D"},{"text":"£3.85","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the Filling row, NHS revenue = 48 × £75.50 = £3,624. Private revenue = 24 × £180.00 = £4,320. Total Filling revenue = 3,624 + 4,320 = £7,944.

Step 2: Total Filling appointments = 48 + 24 = 72. Each takes 40 minutes of chair time, so total chair time = 72 × 40 = 2,880 minutes.

Step 3: Revenue per minute = 7,944 ÷ 2,880 = £2.7583, which rounds to £2.76.

The answer is £2.76.',
  difficulty = 'hard'
WHERE id = '607d2ae1-f35a-4d4b-8c5d-d2e2acdeb132';

-- practice-qr-set-101-q4: Quarter with highest combined sightings across all five species
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'Across all five species, in which quarter were combined sightings the highest, and what was the combined count?',
  options = '[{"text":"Q1, 670","label":"A"},{"text":"Q2, 775","label":"B"},{"text":"Q3, 845","label":"C"},{"text":"Q4, 680","label":"D"},{"text":"All four are equal","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum each quarter''s column across the five species. Q1: 80 + 220 + 150 + 90 + 130 = 670. Q2: 120 + 260 + 160 + 95 + 140 = 775. Q3: 150 + 280 + 170 + 110 + 135 = 845.

Step 2: For Q4, Robin''s value is missing but is fixed by the stated mean of 162.5: Robin annual total = 162.5 × 4 = 650, so Robin Q4 = 650 − 150 − 160 − 170 = 170. Q4 sum = 40 + 240 + 170 + 105 + 125 = 680.

Step 3: The largest of {670, 775, 845, 680} is Q3 at 845 sightings.

The answer is Q3, 845.',
  difficulty = 'hard'
WHERE id = '9b3b2362-1ddc-46bf-91c0-bbaffb6004df';

----------------------------------------------------------------------
-- Verification: every WHERE id above must update exactly one row.
-- After running this migration, the practice QR bank should contain
-- 0 questions whose answer_reason matches the banned single-op patterns
-- (single percentage / ratio / multiplication / division / mean of ≤5
-- from a row or column without a downstream operation).
----------------------------------------------------------------------

-- practice-qr-set-84-q3: Group Study revenue across three slots with per-slot prices
UPDATE public.quantitative_reasoning_questions SET
  question_text = 'The library plans to charge £4 per Morning booking, £6 per Afternoon booking and £8 per Evening booking. Using the Group Study row, what would Group Study room revenue be across the three slots that week?',
  options = '[{"text":"£660","label":"A"},{"text":"£990","label":"B"},{"text":"£1,090","label":"C"},{"text":"£1,170","label":"D"},{"text":"£1,320","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the Group Study row: Morning 30, Afternoon 55, Evening 80.

Step 2: Multiply each slot count by its price. Morning: 30 × £4 = £120. Afternoon: 55 × £6 = £330. Evening: 80 × £8 = £640.

Step 3: Sum the three contributions: 120 + 330 + 640 = £1,090.

The answer is £1,090.',
  difficulty = 'hard'
WHERE id = '4b1e9310-24de-4013-9da4-f6026d2fa340';
