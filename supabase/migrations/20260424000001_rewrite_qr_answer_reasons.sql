-- ============================================================
-- Rewrite all timed QR question answer_reason fields to align with
-- .claude/UCAT-QR-QUESTION-GENERATOR.md (strict):
--   * second person voice
--   * named data sources (row/column/segment/label)
--   * every intermediate step visible, blank-line separated
--   * closing "The answer is X." line
--   * NO trap / common-error / distractor commentary
-- 144 rows rewritten (all 4 timed tests). No correct_answer,
-- options, or difficulty changes were required.
-- ============================================================

BEGIN;

-- ── Test 1 ──────────────────────────────────────────────────

-- QR Timed Test 1 — answer_reason rewrites to remove distractor/common-error commentary
-- and align with UCAT-QR-QUESTION-GENERATOR.md. All 36 rows updated: answer_reason only.
-- No math errors found; no correct_answer, options, or difficulty changes required.

-- qr1-s01-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Neurology row of the table, read each day''s occupancy: Mon = 28, Tue = 30, Wed = 26, Thu = 29, Fri = 31.\n\nStep 2: Add them: 28 + 30 + 26 + 29 + 31 = 144.\n\nThe answer is 144.'
WHERE question_ref = 'qr1-s01-q1';

-- qr1-s01-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the context, the Cardiology capacity is 32.\n\nStep 2: Divide each day''s Cardiology occupancy by 32: Mon = 22 ÷ 32 = 68.8%; Tue = 25 ÷ 32 = 78.1%; Wed = 21 ÷ 32 = 65.6%; Thu = 27 ÷ 32 = 84.4%; Fri = 24 ÷ 32 = 75.0%.\n\nStep 3: Thursday is the highest at 84.4%.\n\nThe answer is Thursday.'
WHERE question_ref = 'qr1-s01-q2';

-- qr1-s01-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The context states the weekly mean for Orthopaedics was 36.4 patients, so the weekly total = 36.4 × 5 = 182.\n\nStep 2: From the Orthopaedics row, add Mon to Thu: 38 + 35 + 40 + 36 = 149.\n\nStep 3: Friday = 182 − 149 = 33.\n\nThe answer is 33.'
WHERE question_ref = 'qr1-s01-q3';

-- qr1-s01-q4: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read the Wed column across all five wards: Cardiology 21, Orthopaedics 40, Paediatrics 11, Neurology 26, Oncology 22. Total occupied = 21 + 40 + 11 + 26 + 22 = 120.\n\nStep 2: From the context, total capacity = 32 + 45 + 18 + 35 + 25 = 155.\n\nStep 3: Percentage = 120 ÷ 155 × 100 = 77.42%, which rounds to 77%.\n\nThe answer is 77%.'
WHERE question_ref = 'qr1-s01-q4';

-- qr1-s02-q1: remove common-error commentary; progressive-tax micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Tax is applied band by band, so you tax only the slice of income sitting in each band.\n\nStep 1: Personal Allowance — the first £12,570 is taxed at 0%, giving £0.\n\nStep 2: Basic Rate — income above £12,570 up to £42,000 = £42,000 − £12,570 = £29,430, taxed at 20%: £29,430 × 0.20 = £5,886.\n\nStep 3: £42,000 is below £50,270, so no income reaches the Higher Rate band. Total tax = £0 + £5,886 = £5,886.\n\nThe answer is £5,886.'
WHERE question_ref = 'qr1-s02-q1';

-- qr1-s02-q2: remove common-error commentary; progressive-tax micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Tax is applied band by band, so you tax only the slice of income sitting in each band.\n\nStep 1: Personal Allowance — first £12,570 at 0% = £0.\n\nStep 2: Basic Rate — the full band £12,571 to £50,270 is used: £50,270 − £12,570 = £37,700 at 20% = £7,540.\n\nStep 3: Higher Rate — income above £50,270 up to £68,000 = £68,000 − £50,270 = £17,730 at 40% = £7,092.\n\nStep 4: Total tax = £0 + £7,540 + £7,092 = £14,632.\n\nThe answer is £14,632.'
WHERE question_ref = 'qr1-s02-q2';

-- qr1-s02-q3: remove common-error commentary; progressive-tax micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Tax is applied band by band, so you tax only the slice of income sitting in each band.\n\nStep 1: Personal Allowance — first £12,570 at 0% = £0.\n\nStep 2: Basic Rate — full band £50,270 − £12,570 = £37,700 at 20% = £7,540.\n\nStep 3: Higher Rate — £52,000 − £50,270 = £1,730 at 40% = £692.\n\nStep 4: Annual tax = £7,540 + £692 = £8,232. Weekly = £8,232 ÷ 52 = £158.31 to the nearest penny.\n\nThe answer is £158.31.'
WHERE question_ref = 'qr1-s02-q3';

-- qr1-s03-q1: remove common-error commentary; show minute-to-hour conversion
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the timetable, the Northampton to Leeds leg departs 08:10 and arrives 09:52, so the journey time is 1 hour 42 minutes. Convert: 42 ÷ 60 = 0.7 hour, giving 1.7 hours.\n\nStep 2: Speed = distance ÷ time = 122 ÷ 1.7 = 71.76 mph, which rounds to 72 mph.\n\nThe answer is 72 mph.'
WHERE question_ref = 'qr1-s03-q1';

-- qr1-s03-q2: remove common-error commentary; show decimal-hour to minute conversion
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the stem, the Leeds to Edinburgh distance is 209 miles at an average of 95 mph. Time = 209 ÷ 95 = 2.2 hours. Convert 0.2 hour: 0.2 × 60 = 12 minutes, so 2 hours 12 minutes.\n\nStep 2: The train departs Leeds at 10:10. Arrival = 10:10 + 2h 12min = 12:22.\n\nThe answer is 12:22.'
WHERE question_ref = 'qr1-s03-q2';

-- qr1-s03-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The standard return is £147 per person. For 3 adults the pre-discount total = 3 × £147 = £441.\n\nStep 2: Apply the 15% group discount by multiplying by (1 − 0.15) = 0.85: £441 × 0.85 = £374.85.\n\nThe answer is £374.85.'
WHERE question_ref = 'qr1-s03-q3';

-- qr1-s04-q1: remove common-error commentary; note £000s scale
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The y-axis label says Sales (£000s), so each bar reading is in thousands of pounds. Read the Week 1 series across all six bars: Produce 48, Bakery 22, Dairy 35, Meat 62, Frozen 29, Beverages 41.\n\nStep 2: Sum = 48 + 22 + 35 + 62 + 29 + 41 = 237, i.e. £237,000.\n\nThe answer is £237,000.'
WHERE question_ref = 'qr1-s04-q1';

-- qr1-s04-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: For each department that grew, compute (Week 2 − Week 1) ÷ Week 1 × 100. Produce: (51 − 48) ÷ 48 × 100 = 6.25%. Bakery: (25 − 22) ÷ 22 × 100 = 13.64%. Frozen: (34 − 29) ÷ 29 × 100 = 17.24%. Beverages: (44 − 41) ÷ 41 × 100 = 7.32%. Dairy and Meat both decreased.\n\nStep 2: The largest percentage increase is Frozen at 17.24%.\n\nThe answer is Frozen.'
WHERE question_ref = 'qr1-s04-q2';

-- qr1-s04-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read the Week 2 series: 51 + 25 + 33 + 58 + 34 + 44 = 245 (in £000s).\n\nStep 2: Meat in Week 2 = 58.\n\nStep 3: Percentage = 58 ÷ 245 × 100 = 23.67%, which rounds to 23.7%.\n\nThe answer is 23.7%.'
WHERE question_ref = 'qr1-s04-q3';

-- qr1-s05-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Follow the edge labels along the specified route: HQ → Post A = 2 days, Post A → Post B = 3 days, Post B → Post C = 1 day. Total time = 2 + 3 + 1 = 6 days.\n\nStep 2: The context gives 1 day = 15 km, so distance = 6 × 15 = 90 km.\n\nThe answer is 90 km.'
WHERE question_ref = 'qr1-s05-q1';

-- qr1-s05-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: List every possible route from HQ to Post D using the diagram edges. Route via A–B–C–D: 2 + 3 + 1 + 2 = 8 days. Route via the A–D shortcut edge: 2 + 5 = 7 days. Route via HQ–E–D: 3 + 4 = 7 days.\n\nStep 2: The shortest total is 7 days.\n\nThe answer is 7 days.'
WHERE question_ref = 'qr1-s05-q2';

-- qr1-s06-q1: remove note-style trailing commentary; tighten to pp subtraction
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the South line on the graph, 2020 = 93.8% and 2023 = 92.0%.\n\nStep 2: Percentage-point change = 92.0 − 93.8 = −1.8 pp.\n\nThe answer is −1.8 pp.'
WHERE question_ref = 'qr1-s06-q1';

-- qr1-s06-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the North line on the graph, the 2023 membership rate = 90.1%.\n\nStep 2: Members = 280,000 × 0.901 = 252,280.\n\nThe answer is 252,280.'
WHERE question_ref = 'qr1-s06-q2';

-- qr1-s06-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The question asks for percentage decrease, so use (Original − New) ÷ Original × 100 with the 2019 value as the base.\n\nStep 1: North: (90.8 − 89.6) ÷ 90.8 × 100 = 1.2 ÷ 90.8 × 100 = 1.32%.\n\nStep 2: South: (94.5 − 91.5) ÷ 94.5 × 100 = 3.0 ÷ 94.5 × 100 = 3.17%.\n\nStep 3: Midlands: (90.2 − 88.3) ÷ 90.2 × 100 = 1.9 ÷ 90.2 × 100 = 2.11%.\n\nStep 4: South has the greatest percentage decrease at 3.17%.\n\nThe answer is South.'
WHERE question_ref = 'qr1-s06-q3';

-- qr1-s06-q4: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read the 2023 value for each series: North = 90.1%, South = 92.0%, Midlands = 89.0%.\n\nStep 2: Mean = (90.1 + 92.0 + 89.0) ÷ 3 = 271.1 ÷ 3 = 90.37%, which rounds to 90.4%.\n\nThe answer is 90.4%.'
WHERE question_ref = 'qr1-s06-q4';

-- qr1-s07-q1: remove common-error commentary; single-step read
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Locate the Class A point at x = 30 hours on the scatter plot. The y-value is 70%. The answer is 70%.'
WHERE question_ref = 'qr1-s07-q1';

-- qr1-s07-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: At x = 40 hours, the Class A point is at y = 79% and the Class B point is at y = 75%.\n\nStep 2: Difference = 79 − 75 = 4 percentage points.\n\nThe answer is 4 percentage points.'
WHERE question_ref = 'qr1-s07-q2';

-- qr1-s08-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Sum the four known segment values: Staff Salaries £142m + Food Supplies £68m + Premises £45m + Administration £21m = £276m.\n\nStep 2: Marketing = total − known = £310m − £276m = £34m.\n\nThe answer is £34m.'
WHERE question_ref = 'qr1-s08-q1';

-- qr1-s08-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the pie chart, Staff Salaries = £142m and the stated total = £310m.\n\nStep 2: Percentage = 142 ÷ 310 × 100 = 45.81%, which rounds to 45.8%.\n\nThe answer is 45.8%.'
WHERE question_ref = 'qr1-s08-q2';

-- qr1-s08-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The increase is 12% of the current Food Supplies value, not 12% of the total. Increase = £68m × 0.12 = £8.16m.\n\nStep 2: Because the total stays fixed at £310m, the other categories must shrink by exactly the same amount, £8.16m.\n\nThe answer is £8.16m.'
WHERE question_ref = 'qr1-s08-q3';

-- qr1-s09-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Electric oven row, Power = 2.2 kW and Weekly Use = 10.5 hours.\n\nStep 2: Energy = Power × Time = 2.2 × 10.5 = 23.1 kWh.\n\nThe answer is 23.1 kWh.'
WHERE question_ref = 'qr1-s09-q1';

-- qr1-s09-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Refrigerator row, Power = 0.12 kW and Weekly Use = 168 hours. Weekly energy = 0.12 × 168 = 20.16 kWh.\n\nStep 2: Scale to a month using 4.3 weeks: 20.16 × 4.3 = 86.688 kWh.\n\nStep 3: At 28p per kWh, cost = 86.688 × £0.28 = £24.27 to the nearest penny.\n\nThe answer is £24.27.'
WHERE question_ref = 'qr1-s09-q2';

-- qr1-s09-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: For each appliance, multiply Power (kW) by Weekly Use (hrs). Electric oven: 2.2 × 10.5 = 23.1 kWh. Washing machine: 0.9 × 3.5 = 3.15 kWh. Refrigerator: 0.12 × 168 = 20.16 kWh. Electric shower: 9.5 × 2.1 = 19.95 kWh. LED lighting: 0.04 × 42 = 1.68 kWh.\n\nStep 2: The highest weekly total is the Electric oven at 23.1 kWh.\n\nThe answer is Electric oven.'
WHERE question_ref = 'qr1-s09-q3';

-- qr1-s09-q4: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Power reduction = 9.5 − 7.5 = 2.0 kW. Weekly hours stay at 2.1 from the Electric shower row.\n\nStep 2: Weekly energy saved = 2.0 × 2.1 = 4.2 kWh. Monthly energy saved = 4.2 × 4.3 = 18.06 kWh.\n\nStep 3: Monthly cost saved = 18.06 × £0.28 = £5.06 to the nearest penny.\n\nThe answer is £5.06.'
WHERE question_ref = 'qr1-s09-q4';

-- qr1-s10-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The tray has dimensions 8 in (length) × 6 in (width) × 1 in (height) and is open on top, so you add the base plus four side faces.\n\nStep 1: Base = 8 × 6 = 48 in².\n\nStep 2: Two long sides = 2 × (8 × 1) = 16 in². Two short sides = 2 × (6 × 1) = 12 in².\n\nStep 3: Total = 48 + 16 + 12 = 76 in².\n\nThe answer is 76 in².'
WHERE question_ref = 'qr1-s10-q1';

-- qr1-s10-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The cardboard area for one tray is 76 in² (base plus four sides).\n\nStep 2: Cost = 76 × 3p = 228p = £2.28.\n\nThe answer is £2.28.'
WHERE question_ref = 'qr1-s10-q2';

-- qr1-s11-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the London line, the 2023 index = 119 (2018 = 100). So the 2023 population is 119% of the 2018 level.\n\nStep 2: Population = 480,000 × 119 ÷ 100 = 480,000 × 1.19 = 571,200.\n\nThe answer is 571,200.'
WHERE question_ref = 'qr1-s11-q1';

-- qr1-s11-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Subtract the 2020 index from the 2022 index for each region. London: 116 − 101 = 15. North West: 122 − 107 = 15. South West: 118 − 106 = 12.\n\nStep 2: London and North West both rose by 15 index points — they are tied for the largest absolute increase.\n\nThe answer is London and North West equally.'
WHERE question_ref = 'qr1-s11-q2';

-- qr1-s11-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the North West line, 2021 index = 115. Arrival population = 180,000 × 115 ÷ 100 = 180,000 × 1.15 = 207,000.\n\nStep 2: 2023 index = 124. Departure population = 180,000 × 1.24 = 223,200.\n\nStep 3: Increase during the stay = 223,200 − 207,000 = 16,200.\n\nThe answer is 16,200.'
WHERE question_ref = 'qr1-s11-q3';

-- qr1-s12-q1: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The context says discount first, then VAT on the discounted price.\n\nStep 1: Discounted price = £180.00 × (1 − 0.10) = £180.00 × 0.90 = £162.00.\n\nStep 2: Price with VAT = £162.00 × 1.20 = £194.40.\n\nThe answer is £194.40.'
WHERE question_ref = 'qr1-s12-q1';

-- qr1-s12-q2: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The context says discount first, then VAT on the discounted price.\n\nStep 1: Discounted unit price = £30.00 × (1 − 0.15) = £30.00 × 0.85 = £25.50.\n\nStep 2: Unit price with VAT = £25.50 × 1.20 = £30.60.\n\nStep 3: Total for 3 keyboards = £30.60 × 3 = £91.80.\n\nThe answer is £91.80.'
WHERE question_ref = 'qr1-s12-q2';

-- qr1-s12-q3: remove common-error commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'For each row, calculate unit price × (1 − discount) × 1.20 × quantity.\n\nStep 1: Laptop (×1): £180.00 × 0.90 × 1.20 = £194.40.\n\nStep 2: Monitor (×2): £60.00 × 1.00 × 1.20 × 2 = £144.00.\n\nStep 3: Keyboard (×3): £30.00 × 0.85 × 1.20 × 3 = £91.80.\n\nStep 4: USB Hub (×1): £25.00 × 1.00 × 1.20 = £30.00.\n\nStep 5: Headset (×2): £40.00 × 0.80 × 1.20 × 2 = £76.80.\n\nStep 6: Total = £194.40 + £144.00 + £91.80 + £30.00 + £76.80 = £537.00.\n\nThe answer is £537.00.'
WHERE question_ref = 'qr1-s12-q3';

-- ── Test 2 ──────────────────────────────────────────────────

-- QR Timed Test 2 — answer_reason rewrites (strip trap commentary, second person, stepped format)
-- All 36 questions: math verified independently, options/correct_answer unchanged, difficulty unchanged.

-- qr2-s01-q1: strip trap commentary, second person
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'You read the Department Total row under the Dermatology column, which gives 122.\n\nThe answer is 122.'
WHERE question_ref = 'qr2-s01-q1';

-- qr2-s01-q2: strip trap commentary, stepped format
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The Specialist Referral row totals 80, with Cardiology = 28, Dermatology = 14 and Gastroenterology = 18.\n\nStep 2: Orthopaedics = 80 − 28 − 14 − 18 = 20.\n\nThe answer is 20.'
WHERE question_ref = 'qr2-s01-q2';

-- qr2-s01-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the GP Referral row, Cardiology = 84 and the row total = 289.\n\nStep 2: Percentage = 84 ÷ 289 × 100 = 29.1%.\n\nThe answer is 29.1%.'
WHERE question_ref = 'qr2-s01-q3';

-- qr2-s01-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: For each referral source, you divide its Cardiology count by its row total. GP Referral: 84 ÷ 289 = 29.1%. Self-Referral: 12 ÷ 90 = 13.3%. A&E Transfer: 45 ÷ 100 = 45.0%. Specialist Referral: 28 ÷ 80 = 35.0%.\n\nStep 2: A&E Transfer has the highest proportion at 45.0%.\n\nThe answer is A&E Transfer.'
WHERE question_ref = 'qr2-s01-q4';

-- qr2-s02-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the March bars, revenue = £24,000 and costs = £15,000 (shown as −15).\n\nStep 2: Profit = £24,000 − £15,000 = £9,000.\n\nThe answer is £9,000.'
WHERE question_ref = 'qr2-s02-q1';

-- qr2-s02-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: For each month, profit margin = (Revenue − Costs) ÷ Revenue. January: 6 ÷ 18 = 33.3%. February: 8 ÷ 22 = 36.4%. March: 9 ÷ 24 = 37.5%. April: 6 ÷ 20 = 30.0%. May: 11 ÷ 28 = 39.3%. June: 12 ÷ 32 = 37.5%.\n\nStep 2: May has the highest profit margin at 39.3%.\n\nThe answer is May.'
WHERE question_ref = 'qr2-s02-q2';

-- qr2-s02-q3: strip trap commentary, clean stepped format
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the chart, you calculate the January–June profit in £000s: 6 + 8 + 9 + 6 + 11 + 12 = 52, so £52,000.\n\nStep 2: July–December profit = 1.5 × £52,000 = £78,000.\n\nStep 3: Total annual profit = £52,000 + £78,000 = £130,000.\n\nThe answer is £130,000.'
WHERE question_ref = 'qr2-s02-q3';

-- qr2-s03-q1: strip trap commentary, name reverse % pattern
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'This is a chain of reverse percentages, so you divide at each step.\n\nStep 1: Country C = 50% of Country A, so Country A = 520 ÷ 0.50 = 1,040.\n\nStep 2: Country A = 40% of Country B, so Country B = 1,040 ÷ 0.40 = 2,600.\n\nThe answer is 2,600.'
WHERE question_ref = 'qr2-s03-q1';

-- qr2-s04-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: You read the Humanities line: Sep = 850, Oct = 1,100, Nov = 1,350, Dec = 720, Jan = 1,050, Feb = 1,200, Mar = 1,380, Apr = 1,420.\n\nStep 2: The highest value is April at 1,420.\n\nThe answer is April.'
WHERE question_ref = 'qr2-s04-q1';

-- qr2-s04-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: You read the Engineering line: Sep = 680, Oct = 820, Nov = 950, Dec = 540, Jan = 780, Feb = 860, Mar = 920, Apr = 980.\n\nStep 2: Total = 680 + 820 + 950 + 540 + 780 + 860 + 920 + 980 = 6,530.\n\nThe answer is 6,530.'
WHERE question_ref = 'qr2-s04-q2';

-- qr2-s04-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The context states the total Science loans across all 8 months = 11,580.\n\nStep 2: You sum the known Science values (Sep, Oct, Nov, Dec, Feb, Mar, Apr): 1,200 + 1,450 + 1,680 + 980 + 1,600 + 1,750 + 1,400 = 10,060.\n\nStep 3: January = 11,580 − 10,060 = 1,520.\n\nThe answer is 1,520.'
WHERE question_ref = 'qr2-s04-q3';

-- qr2-s04-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the November points, Science = 1,680, Humanities = 1,350 and Engineering = 950.\n\nStep 2: Total November loans = 1,680 + 1,350 + 950 = 3,980.\n\nStep 3: Science share = 1,680 ÷ 3,980 × 100 = 42.2%.\n\nThe answer is 42.2%.'
WHERE question_ref = 'qr2-s04-q4';

-- qr2-s05-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the RollEase row, length h = 25 cm and diameter d = 7 cm.\n\nStep 2: Curved surface area = πdh = (22/7) × 7 × 25 = 22 × 25 = 550 cm².\n\nThe answer is 550 cm².'
WHERE question_ref = 'qr2-s05-q1';

-- qr2-s05-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: You apply πdh with π = 22/7 to each roller. RollEase: (22/7) × 7 × 25 = 550 cm². PaintPro: (22/7) × 14 × 30 = 44 × 30 = 1,320 cm². QuickCoat: (22/7) × 7 × 21 = 22 × 21 = 462 cm². MasterRoll: (22/7) × 14 × 35 = 44 × 35 = 1,540 cm². MiniRoll: (22/7) × 7 × 14 = 22 × 14 = 308 cm².\n\nStep 2: MasterRoll is the largest at 1,540 cm².\n\nThe answer is MasterRoll.'
WHERE question_ref = 'qr2-s05-q2';

-- qr2-s05-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: PaintPro curved surface area = (22/7) × 14 × 30 = 1,320 cm².\n\nStep 2: Number of passes = 15,400 ÷ 1,320 = 11.67.\n\nStep 3: A partial pass will not cover the remainder, so you round up to 12.\n\nThe answer is 12.'
WHERE question_ref = 'qr2-s05-q3';

-- qr2-s06-q1: strip trap commentary, clean stepped format
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The walls are 100 mm thick on every side except the open top. Internal length = 1,200 − (2 × 100) = 1,000 mm = 100 cm. Internal width = 800 − (2 × 100) = 600 mm = 60 cm. Internal height = 600 − 100 = 500 mm = 50 cm (only the base is subtracted).\n\nStep 2: Internal volume = 100 × 60 × 50 = 300,000 cm³.\n\nStep 3: Convert to litres: 300,000 ÷ 1,000 = 300 litres.\n\nThe answer is 300 litres.'
WHERE question_ref = 'qr2-s06-q1';

-- qr2-s07-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: £75,000 falls in the £68,001 – £88,000 range, which is Band D.\n\nStep 2: The Band D annual charge is £1,872, and no single-adult discount applies to a couple.\n\nThe answer is £1,872.'
WHERE question_ref = 'qr2-s07-q1';

-- qr2-s07-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: £55,000 falls in the £52,001 – £68,000 range, which is Band C with an annual charge of £1,664.\n\nStep 2: A single adult receives a 25% discount: £1,664 × 0.75 = £1,248.\n\nThe answer is £1,248.'
WHERE question_ref = 'qr2-s07-q2';

-- qr2-s07-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Mrs Taylor is Band C with a single-adult discount: £1,664 × 0.75 = £1,248 per year.\n\nStep 2: Mr Ahmed is Band E with no discount: £2,288 per year.\n\nStep 3: Annual difference = £2,288 − £1,248 = £1,040.\n\nStep 4: Over 3 years the difference = £1,040 × 3 = £3,120.\n\nThe answer is £3,120.'
WHERE question_ref = 'qr2-s07-q3';

-- qr2-s08-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: You read the y-values for each labelled point: A = 2.5, B = 4.8, C = 6.2, D = 9.5, E = 7.1, F = 12.0, G = 8.8.\n\nStep 2: The highest value is Country F at 12.0 tonnes per person.\n\nThe answer is Country F.'
WHERE question_ref = 'qr2-s08-q1';

-- qr2-s08-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Points with x > 20: C (22, 6.2), D (30, 9.5), E (38, 7.1), F (45, 12.0), G (52, 8.8).\n\nStep 2: From those, keep points with y < 10: C (6.2), D (9.5), E (7.1) and G (8.8). F is excluded at 12.0.\n\nStep 3: Four countries satisfy both conditions.\n\nThe answer is 4.'
WHERE question_ref = 'qr2-s08-q2';

-- qr2-s09-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the timetable, Greenfield departs at 07:15 and Laketown at 08:01.\n\nStep 2: 07:15 to 08:00 is 45 minutes; add 1 minute to reach 08:01, giving 46 minutes.\n\nThe answer is 46 minutes.'
WHERE question_ref = 'qr2-s09-q1';

-- qr2-s09-q2: strip trap commentary, flag the time conversion clearly
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, Oakford to Laketown = 20 − 12 = 8 miles.\n\nStep 2: Time = 08:01 − 07:45 = 16 minutes. Convert to hours: 16 ÷ 60 hours (not 0.16).\n\nStep 3: Speed = 8 ÷ (16/60) = 8 × 60 ÷ 16 = 30 mph.\n\nThe answer is 30 mph.'
WHERE question_ref = 'qr2-s09-q2';

-- qr2-s09-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Distance column, Millbridge to Laketown = 20 − 5 = 15 miles.\n\nStep 2: Convert using 1 mile = 1.6 km: 15 × 1.6 = 24.0 km.\n\nThe answer is 24.0 km.'
WHERE question_ref = 'qr2-s09-q3';

-- qr2-s10-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The total is £120,000. You sum the four known segments: £45,000 + £32,000 + £18,000 + £8,000 = £103,000.\n\nStep 2: Grant Funding = £120,000 − £103,000 = £17,000.\n\nThe answer is £17,000.'
WHERE question_ref = 'qr2-s10-q1';

-- qr2-s10-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Corporate Sponsorship = £45,000 out of a £120,000 total.\n\nStep 2: All other sources = £120,000 − £45,000 = £75,000.\n\nStep 3: Share = 75,000 ÷ 120,000 × 100 = 62.5%.\n\nThe answer is 62.5%.'
WHERE question_ref = 'qr2-s10-q2';

-- qr2-s10-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: New Corporate Sponsorship = £45,000 × 1.10 = £49,500.\n\nStep 2: New Individual Donations = £32,000 × 1.10 = £35,200.\n\nStep 3: Unchanged sources sum to £17,000 + £18,000 + £8,000 = £43,000.\n\nStep 4: New total = £49,500 + £35,200 + £43,000 = £127,700.\n\nThe answer is £127,700.'
WHERE question_ref = 'qr2-s10-q3';

-- qr2-s11-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Two fences run parallel to the 80 m shorter side to split the field into three equal plots, so each fence is 80 m long.\n\nStep 2: Total fencing = 2 × 80 = 160 m.\n\nStep 3: Cost = 160 × £12.50 = £2,000.\n\nThe answer is £2,000.'
WHERE question_ref = 'qr2-s11-q1';

-- qr2-s12-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Double row, rack rate = £120 and weeknight discount = 15%.\n\nStep 2: Weeknight price = £120 × (1 − 0.15) = £120 × 0.85 = £102.00.\n\nThe answer is £102.00.'
WHERE question_ref = 'qr2-s12-q1';

-- qr2-s12-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Saturday is a weekend, so apply the Suite 20% surcharge: £250 × 1.20 = £300.00.\n\nStep 2: Add 20% VAT: £300.00 × 1.20 = £360.00.\n\nThe answer is £360.00.'
WHERE question_ref = 'qr2-s12-q2';

-- qr2-s12-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Family rack rate = £175. Weeknight price = £175 × 0.80 = £140. Weekend price = £175 × 1.15 = £201.25.\n\nStep 2: 3 weeknights = 3 × £140 = £420. 2 weekend nights = 2 × £201.25 = £402.50.\n\nStep 3: Pre-VAT subtotal = £420 + £402.50 = £822.50.\n\nStep 4: Add 20% VAT: £822.50 × 1.20 = £987.00.\n\nThe answer is £987.00.'
WHERE question_ref = 'qr2-s12-q3';

-- qr2-s12-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Double weeknight price = £120 × 0.85 = £102. For 2 nights: 2 × £102 = £204.\n\nStep 2: Single has a 0% weekend surcharge, so the weekend price stays at £85. For 1 night: £85.\n\nStep 3: Pre-VAT subtotal = £204 + £85 = £289.\n\nStep 4: Add 20% VAT: £289 × 1.20 = £346.80.\n\nThe answer is £346.80.'
WHERE question_ref = 'qr2-s12-q4';

-- qr2-s13-q1: strip trap commentary, keep addition method only (cleaner)
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Split the L-shape into two rectangles using the labelled dimensions. The left rectangle is 5 m × 6 m. The bottom-right rectangle is 3 m × 2 m.\n\nStep 2: Left area = 5 × 6 = 30 m². Bottom-right area = 3 × 2 = 6 m².\n\nStep 3: Total area = 30 + 6 = 36 m².\n\nThe answer is 36 m².'
WHERE question_ref = 'qr2-s13-q1';

-- qr2-s13-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Work out all 6 sides. Labelled: top = 5 m, left = 6 m, inner step across = 3 m, right = 2 m. Derived: full bottom = 5 + 3 = 8 m, inner vertical step = 6 − 2 = 4 m.\n\nStep 2: Perimeter = 5 + 6 + 8 + 2 + 3 + 4 = 28 m.\n\nStep 3: Cost = 28 × £6.50 = £182.00.\n\nThe answer is £182.00.'
WHERE question_ref = 'qr2-s13-q2';

-- qr2-s14-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Dogs row, Q4 = 180 and Q1 = 145.\n\nStep 2: Difference = 180 − 145 = 35.\n\nThe answer is 35.'
WHERE question_ref = 'qr2-s14-q1';

-- qr2-s14-q2: strip trap commentary, clean Can't Tell form
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The Reptiles row shows "?" for Q4, and the context confirms the record was lost.\n\nStep 2: No yearly total, mean or trend rule is given for reptiles, so the Q4 value cannot be derived from the data provided.\n\nThe answer is Can''t Tell.'
WHERE question_ref = 'qr2-s14-q2';

-- ── Test 3 ──────────────────────────────────────────────────

-- QR Timed Test 3 — answer_reason rewrites (strip trap commentary, enforce second-person, blank-line step layout)
-- All 36 rows contained "A common error is…" distractor commentary, forbidden by the generator guide.
-- Math was independently verified: all correct_answer letters and option sets are correct. No options or letters changed.

-- qr3-s01-q1: strip trap commentary, keep weighted-average method
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Add the weights from the headers: 2 + 3 + 2 + 1 = 8.\n\nStep 2: From Faisal''s row, compute his weighted total: (72 × 2) + (92 × 3) + (84 × 2) + (68 × 1) = 144 + 276 + 168 + 68 = 656.\n\nStep 3: Weighted average = 656 ÷ 8 = 82.0.\n\nThe answer is 82.0.'
WHERE question_ref = 'qr3-s01-q1';

-- qr3-s01-q2: strip trap commentary; compact per-student list
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Total weight from the headers = 2 + 3 + 2 + 1 = 8.\n\nStep 2: Compute each student''s weighted total from their row and divide by 8. Amira: 578 ÷ 8 = 72.25. Ben: 598 ÷ 8 = 74.75. Chloe: 612 ÷ 8 = 76.5. David: 616 ÷ 8 = 77.0. Elena: 592 ÷ 8 = 74.0. Faisal: 656 ÷ 8 = 82.0.\n\nStep 3: The highest weighted average is Faisal''s 82.0.\n\nThe answer is Faisal.'
WHERE question_ref = 'qr3-s01-q2';

-- qr3-s01-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: David''s weighted average is 77.0, so the target weighted total = 77.0 × 8 = 616.\n\nStep 2: From Elena''s row, her current weighted total = (90 × 2) + (56 × 3) + (78 × 2) + (88 × 1) = 180 + 168 + 156 + 88 = 592.\n\nStep 3: Shortfall = 616 − 592 = 24 weighted marks.\n\nStep 4: Maths has weight 3, so additional raw marks needed = 24 ÷ 3 = 8.\n\nThe answer is 8.'
WHERE question_ref = 'qr3-s01-q3';

-- qr3-s01-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The weighted averages from the table are Amira 72.25, Ben 74.75, Chloe 76.5, David 77.0, Elena 74.0 and Faisal 82.0.\n\nStep 2: The students above 75.0 are Chloe, David and Faisal — that is 3 of the 6 students.\n\nStep 3: Percentage = 3 ÷ 6 × 100 = 50.0%.\n\nThe answer is 50.0%.'
WHERE question_ref = 'qr3-s01-q4';

-- qr3-s02-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'A surplus corresponds to a positive bar. On the chart, only March (15), April (40) and May (55) are positive. That is 3 months. The answer is 3.'
WHERE question_ref = 'qr3-s02-q1';

-- qr3-s02-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Sum the six monthly values from the chart: −45 + (−30) + 15 + 40 + 55 + (−10).\n\nStep 2: Positives add to 15 + 40 + 55 = 110. Negatives add to −45 − 30 − 10 = −85.\n\nStep 3: Net total = 110 − 85 = 25 MWh.\n\nThe answer is 25 MWh.'
WHERE question_ref = 'qr3-s02-q2';

-- qr3-s02-q3: strip trap commentary; keep the two-rate structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Surplus months (Mar, Apr, May) sell at £85/MWh: (15 + 40 + 55) × £85 = 110 × £85 = £9,350.\n\nStep 2: Deficit months (Jan, Feb, Jun) buy at £120/MWh: (45 + 30 + 10) × £120 = 85 × £120 = £10,200.\n\nStep 3: Net position = £9,350 − £10,200 = −£850.\n\nThe answer is −£850.'
WHERE question_ref = 'qr3-s02-q3';

-- qr3-s03-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, Patient A weighs 72 kg, so daily dose = 72 × 15 = 1,080 mg.\n\nStep 2: A single dose = 1,080 ÷ 3 = 360 mg, which is below the 450 mg cap.\n\nThe answer is 360 mg.'
WHERE question_ref = 'qr3-s03-q1';

-- qr3-s03-q2: strip trap commentary; keep the cap step
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, Patient D weighs 108 kg, so daily dose = 108 × 15 = 1,620 mg.\n\nStep 2: Uncapped single dose = 1,620 ÷ 3 = 540 mg.\n\nStep 3: 540 mg exceeds the 450 mg maximum single dose, so the dose is capped at 450 mg.\n\nThe answer is 450 mg.'
WHERE question_ref = 'qr3-s03-q2';

-- qr3-s03-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, Patient E weighs 84 kg, so daily dose = 84 × 15 = 1,260 mg.\n\nStep 2: Check the cap: single dose = 1,260 ÷ 3 = 420 mg, which is below 450 mg, so no adjustment.\n\nStep 3: Total over 7 days = 1,260 × 7 = 8,820 mg.\n\nStep 4: Convert to grams: 8,820 ÷ 1,000 = 8.82 g.\n\nThe answer is 8.82 g.'
WHERE question_ref = 'qr3-s03-q3';

-- qr3-s04-q1: strip trap commentary; keep single-step
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Read the South line at the 2022 label on the graph. The value is 340 (in £000s), which is £340,000. The answer is £340,000.'
WHERE question_ref = 'qr3-s04-q1';

-- qr3-s04-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.\n\nStep 1: From the North line, the 2019 value is 145 and the 2024 value is 190 (£000s).\n\nStep 2: (190 − 145) ÷ 145 × 100 = 45 ÷ 145 × 100 = 31.0%.\n\nThe answer is 31.0%.'
WHERE question_ref = 'qr3-s04-q2';

-- qr3-s04-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Midlands line, 2019 = 195 and 2024 = 255 (£000s), so total increase = 255 − 195 = 60 (£000s).\n\nStep 2: The number of one-year intervals from 2019 to 2024 is 5.\n\nStep 3: Average annual increase = 60 ÷ 5 = 12 (£000s) = £12,000.\n\nThe answer is £12,000.'
WHERE question_ref = 'qr3-s04-q3';

-- qr3-s04-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the South line, the increase = 365 − 280 = 85 (£000s) = £85,000.\n\nStep 2: From the North line, the increase = 190 − 145 = 45 (£000s) = £45,000.\n\nStep 3: Difference between the two increases = £85,000 − £45,000 = £40,000.\n\nThe answer is £40,000.'
WHERE question_ref = 'qr3-s04-q4';

-- qr3-s05-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The stem gives you a 20% discount on the £45 monthly fee: £45 × 0.80 = £36.\n\nStep 2: Annual fee = £36 × 12 = £432.\n\nStep 3: Add the £75 joining fee: £432 + £75 = £507.\n\nThe answer is £507.'
WHERE question_ref = 'qr3-s05-q1';

-- qr3-s06-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Read the Total row in the 41–60 column. The value is 1,010. The answer is 1,010.'
WHERE question_ref = 'qr3-s06-q1';

-- qr3-s06-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, Android downloads in the 26–40 column = 480.\n\nStep 2: The column total for 26–40 = 1,340.\n\nStep 3: Percentage = 480 ÷ 1,340 × 100 = 35.8%.\n\nThe answer is 35.8%.'
WHERE question_ref = 'qr3-s06-q2';

-- qr3-s06-q3: strip trap commentary; keep derivation of missing cell
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Derive the missing Android 61+ value using the Android row total: 1,600 − 550 − 480 − 390 = 180.\n\nStep 2: The 61+ column total = 500.\n\nStep 3: Percentage = 180 ÷ 500 × 100 = 36%.\n\nThe answer is 36%.'
WHERE question_ref = 'qr3-s06-q3';

-- qr3-s06-q4: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Calculate the range (highest − lowest) across the four age groups for each device. iPhone: 620 − 160 = 460. Android: highest 550, lowest 180 (derived as 1,600 − 550 − 480 − 390), range = 550 − 180 = 370. Tablet: 280 − 120 = 160.\n\nStep 2: The smallest range is 160, for Tablet, so Tablet downloads are spread most evenly.\n\nThe answer is Tablet.'
WHERE question_ref = 'qr3-s06-q4';

-- qr3-s07-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Split the T-shape into two rectangles using the dimensions on the diagram. The top bar is 6 m × 2 m = 12 m².\n\nStep 2: The vertical stem is 2 m × 5 m = 10 m².\n\nStep 3: Total area = 12 + 10 = 22 m².\n\nThe answer is 22 m².'
WHERE question_ref = 'qr3-s07-q1';

-- qr3-s07-q2: strip trap commentary; keep perimeter trace
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Trace the perimeter clockwise from the top-left corner, using the diagram dimensions. Each horizontal step on either side of the stem = (6 − 2) ÷ 2 = 2 m. The sides are: top 6, right of top bar 2, step-right 2, right of stem 5, bottom of stem 2, left of stem 5, step-left 2, left of top bar 2.\n\nStep 2: Total perimeter = 6 + 2 + 2 + 5 + 2 + 5 + 2 + 2 = 26 m.\n\nStep 3: Cost = 26 × £4.50 = £117.00.\n\nThe answer is £117.00.'
WHERE question_ref = 'qr3-s07-q2';

-- qr3-s08-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Sum the pie-chart segments to get the total: £2,400 + £4,800 + £960 + £1,440 + £1,200 + £1,200 = £12,000.\n\nStep 2: Salaries share = £4,800 ÷ £12,000 × 100 = 40%.\n\nThe answer is 40%.'
WHERE question_ref = 'qr3-s08-q1';

-- qr3-s08-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read Rent = £2,400 and Marketing = £1,440 from the pie chart, giving the ratio 2,400 : 1,440.\n\nStep 2: Divide both sides by the common factor 480: 2,400 ÷ 480 = 5 and 1,440 ÷ 480 = 3.\n\nThe answer is 5:3.'
WHERE question_ref = 'qr3-s08-q2';

-- qr3-s08-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: New Rent = £2,400 × 1.15 = £2,760.\n\nStep 2: New Salaries = £4,800 × 0.95 = £4,560.\n\nStep 3: Unchanged costs (Utilities + Marketing + Supplies + Other) = £960 + £1,440 + £1,200 + £1,200 = £4,800.\n\nStep 4: New total = £2,760 + £4,560 + £4,800 = £12,120.\n\nThe answer is £12,120.'
WHERE question_ref = 'qr3-s08-q3';

-- qr3-s09-q1: strip trap commentary; name compound pattern
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'This is compound growth at 4% per hour, so each hour you multiply by 1.04.\n\nStep 1: After 1 hour: 5,000 × 1.04 = 5,200.\n\nStep 2: After 2 hours: 5,200 × 1.04 = 5,408.\n\nThe answer is 5,408.'
WHERE question_ref = 'qr3-s09-q1';

-- qr3-s10-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Convert miles to km using 1 mile = 1.6 km: 375 × 1.6 = 600 km.\n\nStep 2: Fuel used at 8 L per 100 km: 600 ÷ 100 × 8 = 48 litres.\n\nStep 3: Fuel cost = 48 × £1.50 = £72.00.\n\nThe answer is £72.00.'
WHERE question_ref = 'qr3-s10-q1';

-- qr3-s10-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: M5/M6 total cost = £72.00 fuel + £0.00 toll = £72.00.\n\nStep 2: M4/M1 distance in km = 400 × 1.6 = 640 km. Fuel = 640 ÷ 100 × 8 = 51.2 litres. Fuel cost = 51.2 × £1.50 = £76.80.\n\nStep 3: M4/M1 total = £76.80 + £12.50 toll = £89.30.\n\nStep 4: Difference = £89.30 − £72.00 = £17.30, with M5/M6 cheaper.\n\nThe answer is M5/M6, by £17.30.'
WHERE question_ref = 'qr3-s10-q2';

-- qr3-s10-q3: strip trap commentary; keep time-conversion emphasis
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Convert the M4/M1 distance to km: 400 × 1.6 = 640 km.\n\nStep 2: Convert 6 h 40 min to hours: 6 + 40 ÷ 60 = 20/3 h ≈ 6.667 h.\n\nStep 3: Average speed = total distance ÷ total time = 640 ÷ (20/3) = 640 × 3 ÷ 20 = 96 km/h.\n\nThe answer is 96 km/h.'
WHERE question_ref = 'qr3-s10-q3';

-- qr3-s11-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the stem, 6 servings use 450 g of potatoes, so per serving = 450 ÷ 6 = 75 g.\n\nStep 2: For 10 servings = 75 × 10 = 750 g.\n\nThe answer is 750 g.'
WHERE question_ref = 'qr3-s11-q1';

-- qr3-s12-q1: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read the y-values of all seven points. Highest = City D at 82.8 years; lowest = City C at 76.0 years.\n\nStep 2: Range = 82.8 − 76.0 = 6.8 years.\n\nThe answer is 6.8 years.'
WHERE question_ref = 'qr3-s12-q1';

-- qr3-s12-q2: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the scatter plot, City E has x = 32 beds per 10,000 population.\n\nStep 2: A population of 250,000 is 25 units of 10,000.\n\nStep 3: Total beds = 32 × 25 = 800.\n\nThe answer is 800.'
WHERE question_ref = 'qr3-s12-q2';

-- qr3-s12-q3: strip trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: City D currently has x = 55 beds per 10,000, and a population of 400,000 = 40 units of 10,000, so current total beds = 55 × 40 = 2,200.\n\nStep 2: Add the new beds: 2,200 + 200 = 2,400.\n\nStep 3: New rate = 2,400 ÷ 40 = 60.0 beds per 10,000.\n\nThe answer is 60.0.'
WHERE question_ref = 'qr3-s12-q3';

-- qr3-s13-q1: strip trap commentary; progressive-tax micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Progressive tax is applied band by band from the table.\n\nStep 1: The first £12,570 is Personal Allowance at 0%, giving £0.\n\nStep 2: Alice''s remaining income £42,000 − £12,570 = £29,430 all falls in the 20% Basic Rate band (under £50,270). Tax = £29,430 × 0.20 = £5,886.\n\nStep 3: Total tax = £0 + £5,886 = £5,886.\n\nThe answer is £5,886.'
WHERE question_ref = 'qr3-s13-q1';

-- qr3-s13-q2: strip trap commentary; progressive-tax micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Progressive tax is applied band by band from the table.\n\nStep 1: Personal Allowance: first £12,570 at 0% = £0.\n\nStep 2: Basic Rate band width = £50,270 − £12,570 = £37,700, taxed at 20% = £7,540.\n\nStep 3: Higher Rate portion = £65,000 − £50,270 = £14,730, taxed at 40% = £5,892.\n\nStep 4: Total tax = £0 + £7,540 + £5,892 = £13,432.\n\nThe answer is £13,432.'
WHERE question_ref = 'qr3-s13-q2';

-- qr3-s13-q3: strip trap commentary; reverse-progressive-tax structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'You work backwards through the tax bands from the table.\n\nStep 1: A fully-used Basic Rate band generates £37,700 × 0.20 = £7,540 in tax.\n\nStep 2: Carol''s tax £9,486 exceeds £7,540, so some income sits in the Higher Rate band. Higher Rate tax = £9,486 − £7,540 = £1,946.\n\nStep 3: Higher Rate income = £1,946 ÷ 0.40 = £4,865.\n\nStep 4: Total salary = £50,270 (top of Basic Rate band) + £4,865 = £55,135.\n\nThe answer is £55,135.'
WHERE question_ref = 'qr3-s13-q3';

-- qr3-s14-q1: strip trap commentary; Can't Tell micro-structure
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The total depends on which parcel goes to which zone, and the receipt does not specify.\n\nStep 1: Each parcel has a £4.50 base fee. Per-kg rates are £1.20 (Zone A) or £0.80 (Zone B).\n\nStep 2: The four possible allocations give different totals: both to Zone B = £15.40; 5 kg to B and 3 kg to A = £16.60; 5 kg to A and 3 kg to B = £17.40; both to Zone A = £18.60.\n\nStep 3: With no information on each parcel''s zone, the total cannot be determined from the stem alone.\n\nThe answer is Can''t Tell.'
WHERE question_ref = 'qr3-s14-q1';

-- ── Test 4 ──────────────────────────────────────────────────

-- QR Timed Test 4 — answer_reason rewrites to strict generator-guide style.
-- All 36 original rows contained banned trap/common-error commentary, so every
-- row is rewritten. No correct_answer, options, or difficulty changes were needed
-- (independent recomputation matched every labelled answer).

-- qr4-s01-q1: stripped trap commentary, second-person rewrite
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'From the cross-tabulation, find the Westford row (home borough) and the Northwick workplace column. The intersecting cell reads 90.\n\nThe answer is 90.'
WHERE question_ref = 'qr4-s01-q1';

-- qr4-s01-q2: removed trap commentary, blank-line step separation
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Northwick row, the Home Total is 700 residents and the diagonal cell (Northwick→Northwick) is 360 who work in their own borough.\n\nStep 2: Residents working outside Northwick = 700 − 360 = 340.\n\nStep 3: Percentage = 340 ÷ 700 × 100 = 48.57% which rounds to 48.6%.\n\nThe answer is 48.6%.'
WHERE question_ref = 'qr4-s01-q2';

-- qr4-s01-q3: Can''t Tell pattern — plain non-derivable statement
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The cross-tabulation records only where people live and where they work; it contains no distance data and no information about addresses within each borough. Without distances, you cannot determine how many of the 90 Westford→Northwick commuters travel more than 10 km.\n\nThe answer is Can''t Tell.'
WHERE question_ref = 'qr4-s01-q3';

-- qr4-s01-q4: stripped trap commentary, clean proportional scaling
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Westford workplace column, the total workers are 700, of whom 120 are Northwick residents, so the Northwick share is 120 ÷ 700.\n\nStep 2: Apply this proportion to the 350 new jobs: 350 × 120 ÷ 700 = 60.\n\nThe answer is 60.'
WHERE question_ref = 'qr4-s01-q4';

-- qr4-s02-q1: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the bar chart, read the Roman Baths adult bar = 24,000 and child bar = 16,000.\n\nStep 2: Total = 24,000 + 16,000 = 40,000.\n\nThe answer is 40,000.'
WHERE question_ref = 'qr4-s02-q1';

-- qr4-s02-q2: removed trap commentary, second-person steps
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Abbey Fields bars, adults = 12,000 and children = 9,000, so total visitors = 12,000 + 9,000 = 21,000.\n\nStep 2: Child percentage = 9,000 ÷ 21,000 × 100 = 42.86%, which rounds to 43%.\n\nThe answer is 43%.'
WHERE question_ref = 'qr4-s02-q2';

-- qr4-s02-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Calculate the adult-to-child ratio for each site from the two bars: Castle Moor = 16,000 ÷ 8,000 = 2.00; Abbey Fields = 12,000 ÷ 9,000 = 1.33; Roman Baths = 24,000 ÷ 16,000 = 1.50; Harbour Fort = 10,000 ÷ 2,500 = 4.00; Cathedral Close = 15,000 ÷ 6,000 = 2.50. The highest is Harbour Fort at 4.00.\n\nThe answer is Harbour Fort.'
WHERE question_ref = 'qr4-s02-q3';

-- qr4-s02-q4: removed trap commentary, clean increase calculation
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Harbour Fort bars, child visitors = 2,500. After a 60% rise: 2,500 × 1.60 = 4,000.\n\nStep 2: Adult visitors are unchanged at 10,000.\n\nStep 3: New total = 10,000 + 4,000 = 14,000.\n\nThe answer is 14,000.'
WHERE question_ref = 'qr4-s02-q4';

-- qr4-s03-q1: removed ''key trap'' commentary, kept method
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The stimulus gives an internal diameter of 6 m, so radius = 6 ÷ 2 = 3 m.\n\nStep 2: Volume of the cylinder = π × r² × h = 3.14 × 3² × 14 = 3.14 × 9 × 14 = 395.64 m³.\n\nStep 3: Mass of grain = 395.64 × 720 kg/m³ = 284,860.8 kg.\n\nStep 4: Convert to tonnes: 284,860.8 ÷ 1,000 = 284.86 tonnes, which rounds to 285 tonnes.\n\nThe answer is 285 tonnes.'
WHERE question_ref = 'qr4-s03-q1';

-- qr4-s04-q1: removed trap commentary, simple chart read
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'On the line graph, follow the Edinburgh series to the May point. It reads 12°C.\n\nThe answer is 12°C.'
WHERE question_ref = 'qr4-s04-q1';

-- qr4-s04-q2: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'For each month, subtract Edinburgh from London: Jan 5−3 = 2, Feb 6−4 = 2, Mar 9−6 = 3, Apr 12−9 = 3, May 16−12 = 4, Jun 19−14 = 5, Jul 23−17 = 6, Aug 20−16 = 4. The largest gap is 6°C in July.\n\nThe answer is July.'
WHERE question_ref = 'qr4-s04-q2';

-- qr4-s04-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Sum the Manchester values across the eight months shown: 4 + 5 + 7 + 10 + 14 + 17 + 19 + 18 = 94.\n\nStep 2: Mean = 94 ÷ 8 = 11.75°C, which rounds to 11.8°C.\n\nThe answer is 11.8°C.'
WHERE question_ref = 'qr4-s04-q3';

-- qr4-s04-q4: removed trap commentary, clear intersection logic
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Read the London series and list months at or above 15°C: May (16), June (19), July (23), August (20).\n\nStep 2: Read the Edinburgh series and list months at or above 15°C: July (17), August (16).\n\nStep 3: The café opens only when both conditions hold, so the overlap is July and August = 2 months.\n\nThe answer is 2.'
WHERE question_ref = 'qr4-s04-q4';

-- qr4-s05-q1: removed trap commentary, second-person voice
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'From the Manufacturing row, emissions = 420 kt CO₂e and revenue = £2,800m. Carbon Intensity = Emissions ÷ Revenue = 420 ÷ 2,800 = 0.15.\n\nThe answer is 0.15.'
WHERE question_ref = 'qr4-s05-q1';

-- qr4-s05-q2: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Apply Carbon Intensity = Emissions ÷ Revenue to each row: Manufacturing = 420 ÷ 2,800 = 0.15; Agriculture = 270 ÷ 900 = 0.30; Transport = 640 ÷ 3,200 = 0.20; Energy = 700 ÷ 5,000 = 0.14; Construction = 240 ÷ 1,500 = 0.16. The lowest — and therefore the most carbon-efficient — is Energy at 0.14.\n\nThe answer is Energy.'
WHERE question_ref = 'qr4-s05-q2';

-- qr4-s05-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Transport row, current emissions = 640 kt. After a 15% cut: 640 × 0.85 = 544 kt.\n\nStep 2: Revenue is unchanged at £3,200m.\n\nStep 3: New carbon intensity = 544 ÷ 3,200 = 0.17.\n\nThe answer is 0.17.'
WHERE question_ref = 'qr4-s05-q3';

-- qr4-s05-q4: removed ''key trap'' commentary, kept boundary logic
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the table, compute each sector''s intensity (Emissions ÷ Revenue): Manufacturing 0.15, Agriculture 0.30, Transport 0.20, Energy 0.14, Construction 0.16.\n\nStep 2: The target is strictly below 0.20, so Transport (exactly 0.20) does not qualify. Sectors with intensity < 0.20 are Energy (0.14), Manufacturing (0.15), and Construction (0.16) = 3.\n\nThe answer is 3.'
WHERE question_ref = 'qr4-s05-q4';

-- qr4-s06-q1: removed ''key trap'' commentary, kept sequential-discount method
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Apply the 15% discount to the marked price: £840 × 0.85 = £714.00.\n\nStep 2: Apply the further 10% discount to the reduced price: £714.00 × 0.90 = £642.60.\n\nThe answer is £642.60.'
WHERE question_ref = 'qr4-s06-q1';

-- qr4-s07-q1: rewrite for strict second-person voice, no commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Read the Fibre (g) column: Oat Crunch 8.5, Wheat Flakes 3.5, Bran Bites 15, Honey Puffs 2, Granola Mix 6. The highest value is Bran Bites at 15 g per 100 g.\n\nThe answer is Bran Bites.'
WHERE question_ref = 'qr4-s07-q1';

-- qr4-s07-q2: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Oat Crunch row, protein = 11 g per 100 g and serving size = 45 g.\n\nStep 2: Protein per serving = 11 × (45 ÷ 100) = 11 × 0.45 = 4.95 g.\n\nThe answer is 4.95 g.'
WHERE question_ref = 'qr4-s07-q2';

-- qr4-s07-q3: removed ''the trap is'' commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'For each cereal, multiply sugar per 100 g by (serving size ÷ 100): Oat Crunch 14 × 0.45 = 6.30 g; Wheat Flakes 20 × 0.30 = 6.00 g; Bran Bites 12 × 0.40 = 4.80 g; Honey Puffs 28 × 0.35 = 9.80 g; Granola Mix 22 × 0.50 = 11.00 g. The highest per serving is Granola Mix at 11.00 g.\n\nThe answer is Granola Mix.'
WHERE question_ref = 'qr4-s07-q3';

-- qr4-s07-q4: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Energy from 60 g Bran Bites = 320 × (60 ÷ 100) = 320 × 0.6 = 192 kcal.\n\nStep 2: Energy from 40 g Granola Mix = 450 × (40 ÷ 100) = 450 × 0.4 = 180 kcal.\n\nStep 3: Total = 192 + 180 = 372 kcal.\n\nThe answer is 372 kcal.'
WHERE question_ref = 'qr4-s07-q4';

-- qr4-s08-q1: removed trap commentary, pie-chart total logic
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The pie chart states a total of 1,200 students. Sum the labelled segments: English 320 + Mathematics 280 + Humanities 210 + Arts 90 = 900.\n\nStep 2: Sciences = 1,200 − 900 = 300.\n\nThe answer is 300.'
WHERE question_ref = 'qr4-s08-q1';

-- qr4-s08-q2: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the pie chart, Humanities = 210 out of the stated total of 1,200.\n\nStep 2: Percentage = 210 ÷ 1,200 × 100 = 17.5%.\n\nThe answer is 17.5%.'
WHERE question_ref = 'qr4-s08-q2';

-- qr4-s08-q3: removed trap commentary, clarified ''additional'' step
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Current Mathematics proportion = 280 ÷ 1,200.\n\nStep 2: New Mathematics at 1,500 total = 1,500 × (280 ÷ 1,200) = 350.\n\nStep 3: Additional students needed = 350 − 280 = 70.\n\nThe answer is 70.'
WHERE question_ref = 'qr4-s08-q3';

-- qr4-s09-q1: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'From the scatter plot, Runner A is at y = 195 minutes and Runner F is at y = 295 minutes. Difference = 295 − 195 = 100 minutes.\n\nThe answer is 100 minutes.'
WHERE question_ref = 'qr4-s09-q1';

-- qr4-s09-q2: rewritten in second person for consistency
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'The trend on the plot is that more training (higher x) goes with faster — lower — finish times (lower y). Compare Runner G (x = 55, y = 280) with its neighbours: Runner D (x = 50, y = 248) and Runner C (x = 65, y = 230). Both train similar amounts but finish 30–50 minutes sooner, so G sits far above the trend line while every other point follows it closely.\n\nThe answer is Runner G.'
WHERE question_ref = 'qr4-s09-q2';

-- qr4-s09-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Convert 4 hours 30 minutes to minutes: 4 × 60 + 30 = 270 minutes.\n\nStep 2: From the scatter plot, count runners with y < 270: A (195), B (218), C (230), D (248), E (265) = 5. F (295) and G (280) exceed 270.\n\nThe answer is 5.'
WHERE question_ref = 'qr4-s09-q3';

-- qr4-s10-q1: removed trap commentary, kept combined-rate method
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: Combined fill rate = 200 + 120 = 320 litres per minute.\n\nStep 2: Time = 48,000 ÷ 320 = 150 minutes.\n\nStep 3: Convert: 150 minutes = 2 hours 30 minutes.\n\nThe answer is 2 hours 30 minutes.'
WHERE question_ref = 'qr4-s10-q1';

-- qr4-s11-q1: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Sum the Annual Maintenance (£) column across all five rows: 1,200 + 2,400 + 800 + 1,500 + 1,800 = 7,700.\n\nThe answer is £7,700.'
WHERE question_ref = 'qr4-s11-q1';

-- qr4-s11-q2: removed trap commentary, missing-value calculation
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: The stimulus states the mean annual occupancy is 11 months across 5 properties, so the total occupancy across all five rows is 11 × 5 = 55 months.\n\nStep 2: Sum the four known occupancies from the Occupancy column: 11 + 12 + 10 + 12 = 45 months.\n\nStep 3: 22 Oak Avenue occupancy = 55 − 45 = 10 months.\n\nThe answer is 10.'
WHERE question_ref = 'qr4-s11-q2';

-- qr4-s11-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the 7 Park Lane row, monthly rent = £1,200 and occupancy = 12 months. Gross income = 1,200 × 12 = £14,400.\n\nStep 2: Annual maintenance = £2,400. Net income = 14,400 − 2,400 = £12,000.\n\nThe answer is £12,000.'
WHERE question_ref = 'qr4-s11-q3';

-- qr4-s11-q4: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'For each property, compute (Monthly rent × Occupancy − Annual maintenance) ÷ Annual maintenance.\n\nStep 1: 14 Elm Close = (850 × 11 − 1,200) ÷ 1,200 = 8,150 ÷ 1,200 = 6.79.\n\nStep 2: 7 Park Lane = (1,200 × 12 − 2,400) ÷ 2,400 = 12,000 ÷ 2,400 = 5.00.\n\nStep 3: 22 Oak Avenue = (675 × 10 − 800) ÷ 800 = 5,950 ÷ 800 = 7.44.\n\nStep 4: 3 Church Street = (1,100 × 10 − 1,500) ÷ 1,500 = 9,500 ÷ 1,500 = 6.33.\n\nStep 5: 9 River Walk = (950 × 12 − 1,800) ÷ 1,800 = 9,600 ÷ 1,800 = 5.33. The highest value is 22 Oak Avenue at 7.44.\n\nThe answer is 22 Oak Avenue.'
WHERE question_ref = 'qr4-s11-q4';

-- qr4-s12-q1: removed trap commentary, VAT step
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Basic row, monthly line rental = £12.00 before VAT.\n\nStep 2: Add VAT at 20%: £12.00 × 1.20 = £14.40.\n\nThe answer is £14.40.'
WHERE question_ref = 'qr4-s12-q1';

-- qr4-s12-q2: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Standard row, allowance = 15 GB, line rental = £22.00, excess charge = £2.50 per GB. Excess usage = 22 − 15 = 7 GB.\n\nStep 2: Excess charge = 7 × £2.50 = £17.50.\n\nStep 3: Subtotal before VAT = £22.00 + £17.50 = £39.50.\n\nStep 4: Add VAT at 20%: £39.50 × 1.20 = £47.40.\n\nThe answer is £47.40.'
WHERE question_ref = 'qr4-s12-q2';

-- qr4-s12-q3: removed trap commentary
UPDATE timed_quantitative_reasoning_questions
SET answer_reason = E'Step 1: From the Basic row, allowance = 5 GB and excess charge = £3.50 per GB. Monthly excess = 8 − 5 = 3 GB, costing 3 × £3.50 = £10.50.\n\nStep 2: Monthly total = £12.00 line rental + £10.50 excess = £22.50.\n\nStep 3: Annual total = £22.50 × 12 = £270.\n\nThe answer is £270.'
WHERE question_ref = 'qr4-s12-q3';

COMMIT;
