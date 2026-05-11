-- Purge trivial UCAT QR practice questions.
--
-- Replaces 73 questions that failed the new "minimum reasoning floor" rule
-- introduced in `.claude/UCAT-QR-QUESTION-GENERATOR.md` and
-- `.claude/UCAT-QR-VALIDATOR.md`.
--
-- The rule (summary):
--   * BANNED: pure single-value reads, scan-for-extreme on raw chart values,
--     and stand-alone two-value add/subtract questions. These were used as
--     "warm-up" Q1s in many sets and are not UCAT-grade quantitative reasoning.
--   * ACCEPTABLE: percentage / ratio / rate / unit conversion / weighted stat
--     / multi-step chain / threshold filter / missing-value derivation /
--     "Can't Tell" / geometry / formula application.
--
-- All set stimuli (charts, tables, text) are unchanged. This migration only
-- updates question_text, options, correct_answer, answer_reason, and
-- (sometimes) difficulty for the 73 affected rows.
--
-- Each new question:
--   * Uses data from the same set's stimulus
--   * Clears the reasoning floor (≥1 acceptable reasoning type)
--   * Does not duplicate what the other questions in the set test
--   * Has 5 ascending options with 3+ distinct distractor error types
--   * Has been arithmetically verified by an independent route

-- The UPDATEs below are grouped in chunks for traceability against the audit
-- list. Within each chunk they appear in question_ref order.

------------------------------------------------------------------
-- Chunk 1: sets 01–17 (12 questions)
------------------------------------------------------------------
-- practice-qr-set-01 q1: rewrite — % of all 1,800 applicants placed in their own home deanery (diagonal share)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all 1,800 applicants, what percentage were placed in the same deanery as their home deanery, to 1 decimal place?$stem$,
  options = '[{"text":"31.7%","label":"A"},{"text":"57.2%","label":"B"},{"text":"61.5%","label":"C"},{"text":"68.3%","label":"D"},{"text":"76.0%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the four diagonal cells where home deanery matches placement deanery: London-London 380, Midlands-Midlands 290, North-North 360 and South West-South West 200.

Step 2: Sum these to get the number placed in their home region: 380 + 290 + 360 + 200 = 1,230.

Step 3: Divide by the total of 1,800 applicants and convert to a percentage: 1,230 ÷ 1,800 × 100 = 68.333…%, which rounds to 68.3%.

The answer is 68.3%.$reason$,
  difficulty = 'hard'
WHERE id = '8c476d04-be42-412c-b0e5-cd05a7a9f52a';

-- practice-qr-set-02 q1: rewrite — urgent appointments as % of all appointments across the four age groups
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the four age groups, what percentage of all appointments were urgent, to 1 decimal place?$stem$,
  options = '[{"text":"8.0%","label":"A"},{"text":"22.5%","label":"B"},{"text":"25.0%","label":"C"},{"text":"29.0%","label":"D"},{"text":"33.3%","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Sum the Urgent series across all four age groups: 35 + 55 + 80 + 120 = 290.

Step 2: Sum the Routine series across all four age groups: 140 + 220 + 280 + 360 = 1,000.

Step 3: Add the two series totals to get all appointments: 290 + 1,000 = 1,290. The urgent share is 290 ÷ 1,290 × 100 = 22.480…%, which rounds to 22.5%.

The answer is 22.5%.$reason$,
  difficulty = 'hard'
WHERE id = '8bd8cdf5-1b18-43c2-9764-d8fbfb056b43';

-- practice-qr-set-03 q1: rewrite — Patient A's HbA1c in April as a percentage of Patient B's HbA1c in April
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$In April, Patient A's HbA1c is what percentage of Patient B's HbA1c, to 1 decimal place?$stem$,
  options = '[{"text":"20.0%","label":"A"},{"text":"25.0%","label":"B"},{"text":"44.4%","label":"C"},{"text":"80.0%","label":"D"},{"text":"125.0%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the April values from the line graph: Patient A is 60 mmol/mol and Patient B is 75 mmol/mol.

Step 2: Express A as a share of B: 60 ÷ 75 × 100 = 80.0%.

The answer is 80.0%.$reason$,
  difficulty = 'normal'
WHERE id = 'a65e3d8a-99ae-4f96-86ca-4c349fa4670e';

-- practice-qr-set-04 q1: rewrite — TWh from non-renewable sources (filter four segments × 250 TWh)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$If UK households used 250 TWh of energy in total in 2025, how many TWh came from non-renewable sources (Natural Gas, Electricity, Heating Oil and Other) combined?$stem$,
  options = '[{"text":"70 TWh","label":"A"},{"text":"105 TWh","label":"B"},{"text":"175 TWh","label":"C"},{"text":"225 TWh","label":"D"},{"text":"250 TWh","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the four non-renewable segments from the chart: Natural Gas 42%, Electricity 28%, Heating Oil 12% and Other 8%.

Step 2: Sum these shares: 42 + 28 + 12 + 8 = 90% of the total mix.

Step 3: Apply this share to the 250 TWh total: 250 × 0.90 = 225 TWh.

The answer is 225 TWh.$reason$,
  difficulty = 'hard'
WHERE id = 'af781bbc-bbe8-457a-8186-838390a9180a';

-- practice-qr-set-05 q1: rewrite — Cardiology weekday mean expressed as % of capacity
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What was the mean weekday Cardiology occupancy as a percentage of the Cardiology capacity, to 1 decimal place?$stem$,
  options = '[{"text":"70.0%","label":"A"},{"text":"76.7%","label":"B"},{"text":"80.0%","label":"C"},{"text":"83.3%","label":"D"},{"text":"90.0%","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Read the Cardiology row Monday to Friday: 24, 22, 25, 23 and 21 occupied beds.

Step 2: Sum and divide by 5 to get the weekday mean: (24 + 22 + 25 + 23 + 21) ÷ 5 = 115 ÷ 5 = 23 beds.

Step 3: Cardiology capacity is 30, so the share is 23 ÷ 30 × 100 = 76.666…%, which rounds to 76.7%.

The answer is 76.7%.$reason$,
  difficulty = 'hard'
WHERE id = 'ec5cb7c2-1248-49f7-8f56-f99428ca76aa';

-- practice-qr-set-08 q1: rewrite — % change in revenue from Q2 to Q5
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$By what percentage did revenue change from Q2 to Q5, to 1 decimal place?$stem$,
  options = '[{"text":"47.2%","label":"A"},{"text":"52.8%","label":"B"},{"text":"85.0%","label":"C"},{"text":"89.5%","label":"D"},{"text":"189.5%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the revenue bars: Q2 = £95,000 and Q5 = £180,000.

Step 2: The change uses the original (Q2) value as the denominator: (180 − 95) ÷ 95 × 100 = 85 ÷ 95 × 100 = 89.473…%.

Step 3: Rounded to 1 decimal place this is 89.5%.

The answer is 89.5%.$reason$,
  difficulty = 'normal'
WHERE id = '08077317-249c-4941-89c0-4cba5dddbd12';

-- practice-qr-set-11 q1: rewrite — Manchester Advance Single as % of Manchester Anytime Return
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The Advance Single fare to Manchester is what percentage of the Anytime Return fare to Manchester, to 1 decimal place?$stem$,
  options = '[{"text":"14.2%","label":"A"},{"text":"28.5%","label":"B"},{"text":"36.2%","label":"C"},{"text":"39.4%","label":"D"},{"text":"85.8%","label":"E"}]'::jsonb,
  correct_answer = 'A',
  answer_reason = $reason$Step 1: Read the Manchester row: Advance Single from £55 and Anytime Return £386.

Step 2: Express the Advance Single as a share of the Anytime Return: 55 ÷ 386 × 100 = 14.248…%, which rounds to 14.2%.

The answer is 14.2%.$reason$,
  difficulty = 'normal'
WHERE id = 'd8ffc62f-44ec-49a1-a0e3-e2403e07e2fa';

-- practice-qr-set-13 q1: rewrite — Wednesday share of Emma's weekly commute (approved spec example)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Emma's Wednesday commute time represents what percentage of her total commute time across the five days, to 1 decimal place?$stem$,
  options = '[{"text":"16.1%","label":"A"},{"text":"17.4%","label":"B"},{"text":"19.3%","label":"C"},{"text":"22.0%","label":"D"},{"text":"25.2%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Emma's five values from the line graph: 35, 48, 42, 55 and 38 minutes.

Step 2: Sum her week's commute time: 35 + 48 + 42 + 55 + 38 = 218 minutes.

Step 3: Wednesday is 42 minutes, so the share is 42 ÷ 218 × 100 = 19.266…%, which rounds to 19.3%.

The answer is 19.3%.$reason$,
  difficulty = 'normal'
WHERE id = '6d7b84a5-70cd-4a53-ad20-bac2a590dc3f';

-- practice-qr-set-14 q1: rewrite — CO₂ emissions difference between Mistral Hybrid and Gale 2.0 over 150 km
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Over a 150 km journey, how many fewer grams of CO₂ does the Mistral Hybrid emit than the Gale 2.0?$stem$,
  options = '[{"text":"4,500 g","label":"A"},{"text":"6,750 g","label":"B"},{"text":"9,750 g","label":"C"},{"text":"13,500 g","label":"D"},{"text":"23,250 g","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the CO₂ rates from the table: Gale 2.0 emits 155 g/km and Mistral Hybrid emits 90 g/km.

Step 2: Find the per-kilometre difference: 155 − 90 = 65 g/km.

Step 3: Multiply by the 150 km distance: 65 × 150 = 9,750 g.

The answer is 9,750 g.$reason$,
  difficulty = 'normal'
WHERE id = 'b1f3c23f-30b7-4f9e-a3f9-2e46d4327ae3';

-- practice-qr-set-16 q1: rewrite — % of the 25 individual scores that are 80% or higher (multi-condition filter)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all five students and all five subjects, what percentage of the 25 individual subject scores are 80% or higher?$stem$,
  options = '[{"text":"36.0%","label":"A"},{"text":"40.0%","label":"B"},{"text":"44.0%","label":"C"},{"text":"48.0%","label":"D"},{"text":"52.0%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Count cells of 80% or higher row by row. Alex: 82 and 90 → 2. Bella: 85, 88 and 82 → 3. Chen: 92, 95 and 90 → 3. Dani: 88 → 1. Emir: 85 and 88 → 2.

Step 2: Sum these counts: 2 + 3 + 3 + 1 + 2 = 11 scores at or above 80%.

Step 3: Express as a percentage of the 25 cells: 11 ÷ 25 × 100 = 44.0%.

The answer is 44.0%.$reason$,
  difficulty = 'hard'
WHERE id = 'b2f6be0a-9e90-47ff-aebb-db8c934f6469';

-- practice-qr-set-17 q1: rewrite — % by which Student E's score exceeds Student A's score
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$By what percentage is Student E's exam score higher than Student A's exam score, to 1 decimal place?$stem$,
  options = '[{"text":"43.0%","label":"A"},{"text":"49.4%","label":"B"},{"text":"50.6%","label":"C"},{"text":"102.4%","label":"D"},{"text":"202.4%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read each student's score from the scatter plot: Student A is at 42% and Student E is at 85%.

Step 2: Apply the percentage-change formula using Student A as the original value: (85 − 42) ÷ 42 × 100 = 43 ÷ 42 × 100 = 102.380…%.

Step 3: Rounded to 1 decimal place this is 102.4%.

The answer is 102.4%.$reason$,
  difficulty = 'normal'
WHERE id = '6bb91aa2-b170-4d50-a15b-020b6e6cc66c';

-- practice-qr-set-17 q2: rewrite — ratio of Student F's revision hours to Student F's exam score in simplest form
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$In its simplest form, what is the ratio of Student F's revision hours to Student F's exam score?$stem$,
  options = '[{"text":"5 : 6","label":"A"},{"text":"5 : 12","label":"B"},{"text":"6 : 5","label":"C"},{"text":"12 : 5","label":"D"},{"text":"30 : 72","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Read Student F's coordinates from the scatter plot: 30 revision hours and 72 exam score.

Step 2: The starting ratio is 30 : 72. The greatest common factor of 30 and 72 is 6, so divide both sides by 6: 30 ÷ 6 = 5 and 72 ÷ 6 = 12.

Step 3: 5 and 12 share no further common factor, so the simplest form is 5 : 12.

The answer is 5 : 12.$reason$,
  difficulty = 'normal'
WHERE id = '5426a4d2-f394-43bd-939a-5e98a25172d4';


------------------------------------------------------------------
-- Chunk 2: sets 18–33 (12 questions)
------------------------------------------------------------------
-- practice-qr-set-18 q2: rewrite — student-day shortfall against a 95% attendance target
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The college sets a target attendance of 95% across all five subjects combined for the 20-day month. By how many student-days did actual combined attendance fall short of this target, to the nearest student-day?$stem$,
  options = '[{"text":"26","label":"A"},{"text":"262","label":"B"},{"text":"288","label":"C"},{"text":"480","label":"D"},{"text":"742","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Total possible student-days = (125 + 98 + 72 + 140 + 45) × 20 = 480 × 20 = 9,600.

Step 2: The 95% target is 9,600 × 0.95 = 9,120 student-days.

Step 3: Actual attended student-days, by subject: Biology 0.96 × 2,500 = 2,400; Chemistry 0.92 × 1,960 = 1,803.2; Physics 0.88 × 1,440 = 1,267.2; Mathematics 0.94 × 2,800 = 2,632; Further Mathematics 0.84 × 900 = 756. Sum = 2,400 + 1,803.2 + 1,267.2 + 2,632 + 756 = 8,858.4.

Step 4: Shortfall = 9,120 − 8,858.4 = 261.6, which rounds to 262 student-days.

The answer is 262.$reason$,
  difficulty = 'hard'
WHERE id = '09bf1794-d828-42c0-afb1-974be1e801c3';

-- practice-qr-set-19 q1: rewrite — Mathematics share of 2024 total enrolment
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of the total 2024 enrolment across all four departments came from the Mathematics department, to the nearest 0.1%?$stem$,
  options = '[{"text":"12.9%","label":"A"},{"text":"33.3%","label":"B"},{"text":"35.8%","label":"C"},{"text":"38.8%","label":"D"},{"text":"40.9%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the 2024 column: Mathematics 260, Sciences 195, Humanities 115, Arts 100.

Step 2: Total 2024 enrolment = 260 + 195 + 115 + 100 = 670.

Step 3: Mathematics share = 260 ÷ 670 × 100 = 38.806…%, which rounds to 38.8%.

The answer is 38.8%.$reason$,
  difficulty = 'normal'
WHERE id = '7a6bf619-f69b-45b3-a9b3-730ff04d7e84';

-- practice-qr-set-19 q2: rewrite — Sciences share of three-year grand total
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the three years 2023–2025 combined, what percentage of all enrolments was in the Sciences department, to the nearest 0.1%?$stem$,
  options = '[{"text":"25.0%","label":"A"},{"text":"28.3%","label":"B"},{"text":"29.1%","label":"C"},{"text":"33.3%","label":"D"},{"text":"41.1%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the 2023–2025 Total column: Mathematics 780, Sciences 585, Humanities 345, Arts 300.

Step 2: Grand three-year total = 780 + 585 + 345 + 300 = 2,010.

Step 3: Sciences share = 585 ÷ 2,010 × 100 = 29.104…%, which rounds to 29.1%.

The answer is 29.1%.$reason$,
  difficulty = 'normal'
WHERE id = '0e0062f1-1a72-4c19-9270-12f5c4ed2eb6';

-- practice-qr-set-21 q1: rewrite — Manchester six-month mean monthly rainfall
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What was Manchester's mean monthly rainfall across the six months shown, to the nearest 0.1 mm?$stem$,
  options = '[{"text":"64.0 mm","label":"A"},{"text":"70.0 mm","label":"B"},{"text":"73.7 mm","label":"C"},{"text":"74.5 mm","label":"D"},{"text":"88.4 mm","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Manchester's six values from the line graph: 98, 85, 72, 64, 55, 68.

Step 2: Sum the six values: 98 + 85 + 72 + 64 + 55 + 68 = 442 mm.

Step 3: Mean = 442 ÷ 6 = 73.666… mm, which rounds to 73.7 mm.

The answer is 73.7 mm.$reason$,
  difficulty = 'normal'
WHERE id = 'c24f7f5e-9db8-4146-97de-7d5dff14f586';

-- practice-qr-set-22 q1: rewrite — weekly recycled tonnage with month-to-week conversion
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The council processes 1,800 tonnes of household waste per month, which is equivalent to four weeks. How many tonnes of recycled waste does the council handle per week?$stem$,
  options = '[{"text":"67.5 tonnes","label":"A"},{"text":"90 tonnes","label":"B"},{"text":"202.5 tonnes","label":"C"},{"text":"405 tonnes","label":"D"},{"text":"810 tonnes","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: The Recycled segment is 45% of total waste, so monthly recycled tonnage = 1,800 × 0.45 = 810 tonnes.

Step 2: Convert monthly to weekly by dividing by 4: 810 ÷ 4 = 202.5 tonnes per week.

The answer is 202.5 tonnes.$reason$,
  difficulty = 'normal'
WHERE id = 'a4dc0322-f14e-4fe4-ae34-4ed066abc41d';

-- practice-qr-set-24 q1: rewrite — total emissions cut required across all sectors to hit 2030 targets
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Starting from the 2025 figures, how much further reduction in emissions, in MtCO², is required across all five sectors combined to reach their 2030 targets?$stem$,
  options = '[{"text":"78 MtCO²","label":"A"},{"text":"84 MtCO²","label":"B"},{"text":"145 MtCO²","label":"C"},{"text":"146 MtCO²","label":"D"},{"text":"230 MtCO²","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Compute the gap between each sector's 2025 figure and its 2030 target: Energy 75 − 55 = 20; Transport 95 − 70 = 25; Industry 68 − 50 = 18; Buildings 60 − 45 = 15; Agriculture 56 − 50 = 6.

Step 2: Sum the five gaps: 20 + 25 + 18 + 15 + 6 = 84 MtCO².

Step 3: As an independent check, sum the 2025 column (75 + 95 + 68 + 60 + 56 = 354) and the 2030 Target column (55 + 70 + 50 + 45 + 50 = 270), then subtract: 354 − 270 = 84 MtCO².

The answer is 84 MtCO².$reason$,
  difficulty = 'hard'
WHERE id = '73a52221-3d78-4835-8342-d567aaf9774e';

-- practice-qr-set-26 q1: rewrite — Cardiology and Dermatology combined share of all referrals
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Cardiology and Dermatology combined accounted for what percentage of all 2,320 referrals last quarter, to the nearest 0.1%?$stem$,
  options = '[{"text":"23.3%","label":"A"},{"text":"30.2%","label":"B"},{"text":"53.4%","label":"C"},{"text":"69.7%","label":"D"},{"text":"71.1%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the Row Total column for Cardiology (540) and Dermatology (700).

Step 2: Combined referrals = 540 + 700 = 1,240.

Step 3: Share of grand total = 1,240 ÷ 2,320 × 100 = 53.448…%, which rounds to 53.4%.

The answer is 53.4%.$reason$,
  difficulty = 'hard'
WHERE id = '62396bfd-c0d7-49eb-be91-8ab85676962f';

-- practice-qr-set-27 q1: rewrite — net change in total A*/A achievers from 2024 to 2025
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$By how many students did the total number of A*/A achievers across all five subjects change from 2024 to 2025?$stem$,
  options = '[{"text":"30","label":"A"},{"text":"55","label":"B"},{"text":"75","label":"C"},{"text":"85","label":"D"},{"text":"95","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum the 2024 bars: 180 + 160 + 140 + 220 + 120 = 820.

Step 2: Sum the 2025 bars: 210 + 150 + 165 + 240 + 130 = 895.

Step 3: Net change = 895 − 820 = +75 students.

Step 4: As an independent check, sum the per-subject changes: Biology +30, Chemistry −10, Physics +25, Maths +20, English +10, which gives +30 − 10 + 25 + 20 + 10 = +75.

The answer is 75.$reason$,
  difficulty = 'hard'
WHERE id = '93685217-d6c0-4bae-9d96-430c256e7868';

-- practice-qr-set-28 q1: rewrite — Operator B six-month mean punctuality
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What was Operator B's mean punctuality across the six months shown, to the nearest 0.1%?$stem$,
  options = '[{"text":"78.0%","label":"A"},{"text":"82.4%","label":"B"},{"text":"83.3%","label":"C"},{"text":"84.0%","label":"D"},{"text":"86.7%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Operator B's six values from the line graph: 78, 80, 83, 85, 86, 88.

Step 2: Sum the six values: 78 + 80 + 83 + 85 + 86 + 88 = 500.

Step 3: Mean = 500 ÷ 6 = 83.333…%, which rounds to 83.3%.

The answer is 83.3%.$reason$,
  difficulty = 'normal'
WHERE id = '9c870ddb-e56c-4b07-827e-eb3c48828f65';

-- practice-qr-set-29 q1: rewrite — annual combined spending on Savings and Utilities
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across one full year, how much does the family spend on Savings and Utilities combined?$stem$,
  options = '[{"text":"£1,260","label":"A"},{"text":"£4,320","label":"B"},{"text":"£15,120","label":"C"},{"text":"£21,600","label":"D"},{"text":"£28,080","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the two segment values from the chart legend: Savings £900 and Utilities £360.

Step 2: Monthly combined = 900 + 360 = £1,260.

Step 3: Annual combined = 1,260 × 12 = £15,120.

The answer is £15,120.$reason$,
  difficulty = 'normal'
WHERE id = '02d6a44b-51ed-47a4-96cb-676a6788d618';

-- practice-qr-set-31 q1: rewrite — combined 2024 profit of branches that were profitable in 2024
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What was the combined 2024 net profit of the branches that were profitable in 2024?$stem$,
  options = '[{"text":"£77,000","label":"A"},{"text":"£105,000","label":"B"},{"text":"£122,000","label":"C"},{"text":"£123,000","label":"D"},{"text":"£140,000","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the 2024 bars and identify the branches above the zero line: Branch A £42,000, Branch B £18,000, Branch D £35,000, Branch F £28,000. Branches C and E were loss-making in 2024 and are excluded.

Step 2: Sum the four profitable branches: 42 + 18 + 35 + 28 = 123 (£000s) = £123,000.

Step 3: As an independent check, the 2024 grand total across all six branches is 42 + 18 − 5 + 35 − 12 + 28 = £106,000, and the loss-makers contribute (−5) + (−12) = −£17,000, so the profitable subtotal is 106 − (−17) = £123,000.

The answer is £123,000.$reason$,
  difficulty = 'hard'
WHERE id = '5c464ff7-48a1-42ab-818a-439661087d7d';

-- practice-qr-set-33 q1: rewrite — City D share of combined monthly rent across the five cities
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$City D's average monthly rent represents what percentage of the combined average monthly rent across all five cities, to the nearest 0.1%?$stem$,
  options = '[{"text":"12.4%","label":"A"},{"text":"20.0%","label":"B"},{"text":"33.3%","label":"C"},{"text":"35.2%","label":"D"},{"text":"54.4%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read each city's average monthly rent from the y-axis: City A £650, City E £750, City B £900, City C £1,100, City D £1,850.

Step 2: Combined rent = 650 + 750 + 900 + 1,100 + 1,850 = £5,250.

Step 3: City D's share = 1,850 ÷ 5,250 × 100 = 35.238…%, which rounds to 35.2%.

The answer is 35.2%.$reason$,
  difficulty = 'hard'
WHERE id = '3bfa0c01-caed-44d0-bf53-4eef372d3918';


------------------------------------------------------------------
-- Chunk 3: sets 36–56 (12 questions)
------------------------------------------------------------------
-- practice-qr-set-36 q2: rewrite — combined 65+ across regions as % of combined 0-17 across regions
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the four regions combined, the population aged 65+ is what percentage of the population aged 0-17, to 1 decimal place?$stem$,
  options = '[{"text":"16.4%","label":"A"},{"text":"19.7%","label":"B"},{"text":"80.3%","label":"C"},{"text":"80.9%","label":"D"},{"text":"124.6%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Add the 65+ column across the four regions: 430 + 470 + 550 + 340 = 1,790 thousand.

Step 2: Add the 0-17 column across the four regions: 520 + 610 + 680 + 420 = 2,230 thousand.

Step 3: Express 65+ as a percentage of 0-17: 1,790 ÷ 2,230 × 100 = 80.269…%, which rounds to 80.3%.

The answer is 80.3%.$reason$,
  difficulty = 'hard'
WHERE id = '88087893-fb80-457d-a218-06c298d10abe';

-- practice-qr-set-38 q2: rewrite — three smallest segments combined as % of total portfolio
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The three smallest asset classes (Emerging Markets, Property and Cash) make up what percentage of the total £45,000,000 portfolio?$stem$,
  options = '[{"text":"20.0%","label":"A"},{"text":"27.0%","label":"B"},{"text":"35.0%","label":"C"},{"text":"80.0%","label":"D"},{"text":"87.5%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the three smallest segment values from the pie chart: Emerging Markets £6,750,000, Property £5,400,000 and Cash £3,600,000.

Step 2: Sum them: 6,750,000 + 5,400,000 + 3,600,000 = £15,750,000.

Step 3: Express as a percentage of the £45,000,000 total: 15,750,000 ÷ 45,000,000 × 100 = 35.0%.

The answer is 35.0%.$reason$,
  difficulty = 'hard'
WHERE id = '36d73c4f-6261-4815-a757-2ed5280de7b2';

-- practice-qr-set-39 q1: rewrite — % of runners finishing between 3:00 and 4:29 (three middle bands)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of all 500 runners finished with a time between 3:00 and 4:29 inclusive (i.e. across the three bands 3:00-3:29, 3:30-3:59 and 4:00-4:29), to 1 decimal place?$stem$,
  options = '[{"text":"40.0%","label":"A"},{"text":"51.0%","label":"B"},{"text":"53.0%","label":"C"},{"text":"69.0%","label":"D"},{"text":"84.0%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the three middle bars from the chart: 3:00-3:29 has 80 runners, 3:30-3:59 has 140 runners, and 4:00-4:29 has 125 runners.

Step 2: Add these three bands: 80 + 140 + 125 = 345 runners.

Step 3: Express as a percentage of the 500 total: 345 ÷ 500 × 100 = 69.0%.

The answer is 69.0%.$reason$,
  difficulty = 'normal'
WHERE id = '8f0ba7a0-4154-496b-8487-d3bd85302263';

-- practice-qr-set-42 q1: rewrite — % of all A&E patients across the three hospitals seen in under 1 hour
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all three hospitals combined, what percentage of A&E patients waited less than 1 hour to be seen in the week shown, to 1 decimal place?$stem$,
  options = '[{"text":"23.7%","label":"A"},{"text":"28.0%","label":"B"},{"text":"37.8%","label":"C"},{"text":"38.5%","label":"D"},{"text":"52.5%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Add the "Less than 1 hour" patients across the three hospitals: 420 + 320 + 280 = 1,020.

Step 2: Compute the total weekly patients across all three hospitals. Ashbury: 420 + 280 + 100 = 800. Broomfield: 320 + 360 + 220 = 900. Crandon: 280 + 400 + 320 = 1,000. Combined: 800 + 900 + 1,000 = 2,700.

Step 3: Express the under-1-hour group as a percentage of the combined total: 1,020 ÷ 2,700 × 100 = 37.777…%, which rounds to 37.8%.

The answer is 37.8%.$reason$,
  difficulty = 'hard'
WHERE id = 'fe1cb1aa-cd3a-47b1-8a1c-f931aeadf366';

-- practice-qr-set-46 q1: rewrite — % increase in Retailer B's mean quarterly revenue from 2023 to 2024
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$By what percentage did Retailer B's mean quarterly revenue rise from 2023 to 2024, to 1 decimal place?$stem$,
  options = '[{"text":"15.7%","label":"A"},{"text":"16.0%","label":"B"},{"text":"18.6%","label":"C"},{"text":"21.1%","label":"D"},{"text":"31.6%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Retailer B's four 2023 quarters from the line graph: 38, 40, 44 and 50. Their mean is (38 + 40 + 44 + 50) ÷ 4 = 172 ÷ 4 = £43m.

Step 2: Read Retailer B's four 2024 quarters: 46, 48, 52 and 58. Their mean is (46 + 48 + 52 + 58) ÷ 4 = 204 ÷ 4 = £51m.

Step 3: Apply the percentage-increase formula on the means: (51 − 43) ÷ 43 × 100 = 8 ÷ 43 × 100 = 18.604…%, which rounds to 18.6%.

The answer is 18.6%.$reason$,
  difficulty = 'hard'
WHERE id = '2f11d7ba-e1e8-4b28-9ff1-9679472d6101';

-- practice-qr-set-48 q1: rewrite — share of total nine-week admissions accounted for by the three highest weeks
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The three highest-admission weeks accounted for what percentage of the total nine-week admissions, to 1 decimal place?$stem$,
  options = '[{"text":"26.6%","label":"A"},{"text":"27.9%","label":"B"},{"text":"38.6%","label":"C"},{"text":"50.3%","label":"D"},{"text":"62.9%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the nine bars: 42, 56, 61, 58, 67, 49, 63, 72 and 55. The three highest values are Week 8 (72), Week 5 (67) and Week 7 (63).

Step 2: Add the three highest: 72 + 67 + 63 = 202.

Step 3: Add all nine weeks: 42 + 56 + 61 + 58 + 67 + 49 + 63 + 72 + 55 = 523.

Step 4: Express the top three as a percentage of the total: 202 ÷ 523 × 100 = 38.624…%, which rounds to 38.6%.

The answer is 38.6%.$reason$,
  difficulty = 'hard'
WHERE id = '70a7c098-6a4f-4ec2-8750-195ba808fdad';

-- practice-qr-set-51 q1: rewrite — % of all listeners on a paid tier (Standard, Premium or Family combined)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of MusicSphere's total listeners are on a paid tier (Standard, Premium or Family), to 1 decimal place?$stem$,
  options = '[{"text":"9.4%","label":"A"},{"text":"28.3%","label":"B"},{"text":"37.8%","label":"C"},{"text":"52.8%","label":"D"},{"text":"62.2%","label":"E"}]'::jsonb,
  correct_answer = 'E',
  answer_reason = $reason$Step 1: Read the column totals row: Free 34.0m, Standard 25.5m, Premium 22.0m, Family 8.5m, Total 90.0m.

Step 2: Add the three paid tiers: 25.5 + 22.0 + 8.5 = 56.0m.

Step 3: Express as a percentage of the 90.0m total: 56.0 ÷ 90.0 × 100 = 62.222…%, which rounds to 62.2%.

The answer is 62.2%.$reason$,
  difficulty = 'normal'
WHERE id = '87155946-6af6-4856-b6fa-988bbba21528';

-- practice-qr-set-52 q1: rewrite — total marketing spend as % of total opening-weekend revenue
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all five films, opening-weekend marketing spend was what percentage of opening-weekend revenue, to 1 decimal place?$stem$,
  options = '[{"text":"33.8%","label":"A"},{"text":"37.5%","label":"B"},{"text":"48.8%","label":"C"},{"text":"51.2%","label":"D"},{"text":"54.5%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read the five revenue bars (positive): 48, 22, 35, 12 and 55. Sum: 48 + 22 + 35 + 12 + 55 = £172m.

Step 2: Read the five marketing bars (treat the magnitudes as positive spends): 18, 12, 20, 8 and 30. Sum: 18 + 12 + 20 + 8 + 30 = £88m.

Step 3: Express marketing as a percentage of revenue: 88 ÷ 172 × 100 = 51.162…%, which rounds to 51.2%.

The answer is 51.2%.$reason$,
  difficulty = 'hard'
WHERE id = '74a9d487-d407-484c-a7b5-82e465b968d8';

-- practice-qr-set-53 q1: rewrite — Anfield United's mean points per match across the three seasons
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the three seasons shown, what was Anfield United's mean points per match, to 2 decimal places? (Each Premier League season has 38 matches.)$stem$,
  options = '[{"text":"1.95","label":"A"},{"text":"2.05","label":"B"},{"text":"2.15","label":"C"},{"text":"2.29","label":"D"},{"text":"2.34","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Anfield United's points across the three seasons from the line graph: 74 (2023/24), 82 (2024/25) and 89 (2025/26).

Step 2: Sum the points: 74 + 82 + 89 = 245.

Step 3: Total matches played across the three seasons: 38 × 3 = 114.

Step 4: Mean points per match: 245 ÷ 114 = 2.1491…, which rounds to 2.15.

The answer is 2.15.$reason$,
  difficulty = 'hard'
WHERE id = 'ba814d06-e12f-4991-8023-3c309a1870f3';

-- practice-qr-set-54 q1: rewrite — combined small-animal share (rabbits + birds + reptiles) of March consultations
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Rabbits, birds and reptiles combined accounted for what percentage of all consultations at the clinic in March, to 1 decimal place?$stem$,
  options = '[{"text":"9.8%","label":"A"},{"text":"16.4%","label":"B"},{"text":"20.3%","label":"C"},{"text":"42.8%","label":"D"},{"text":"52.5%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the March consultations for rabbits, birds and reptiles: 32, 18 and 12. Combined: 32 + 18 + 12 = 62.

Step 2: Add all five species to get the March total: 145 + 98 + 32 + 18 + 12 = 305.

Step 3: Express the small-animal group as a percentage of the total: 62 ÷ 305 × 100 = 20.327…%, which rounds to 20.3%.

The answer is 20.3%.$reason$,
  difficulty = 'normal'
WHERE id = '3852004e-05ac-44df-b5f6-1be1124c7e53';

-- practice-qr-set-55 q1: rewrite — concession-ticket revenue as % of total weekly ticket revenue
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the five-day week shown, concession-ticket revenue accounted for what percentage of the gallery's total ticket revenue, to 1 decimal place?$stem$,
  options = '[{"text":"13.3%","label":"A"},{"text":"13.9%","label":"B"},{"text":"14.7%","label":"C"},{"text":"16.3%","label":"D"},{"text":"19.4%","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Sum each ticket-type column. Adult: 140 + 165 + 180 + 210 + 250 = 945. Child: 60 + 75 + 90 + 110 + 130 = 465. Concession: 45 + 52 + 48 + 60 + 70 = 275.

Step 2: Apply the standard prices to get weekly revenue per ticket type. Adult: 945 × £12 = £11,340. Child: 465 × £5 = £2,325. Concession: 275 × £8 = £2,200.

Step 3: Total weekly ticket revenue: 11,340 + 2,325 + 2,200 = £15,865.

Step 4: Express concession revenue as a percentage of the total: 2,200 ÷ 15,865 × 100 = 13.868…%, which rounds to 13.9%.

The answer is 13.9%.$reason$,
  difficulty = 'hard'
WHERE id = '629a6a2c-d356-4c79-9071-844c4ae8a2f5';

-- practice-qr-set-56 q1: rewrite — LHR-JFK's share of full-year revenue across all four routes
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$For the full year, what percentage of SkyLine Airways' total ticket revenue across the four routes came from LHR-JFK, to 1 decimal place?$stem$,
  options = '[{"text":"17.6%","label":"A"},{"text":"24.6%","label":"B"},{"text":"26.4%","label":"C"},{"text":"39.9%","label":"D"},{"text":"42.2%","label":"E"}]'::jsonb,
  correct_answer = 'E',
  answer_reason = $reason$Step 1: Use the Annual Total column with each fixed fare to get annual revenue per route. LHR-JFK: 280,000 × £520 = £145.6m. LHR-DXB: 190,000 × £480 = £91.2m. LHR-CDG: 405,000 × £150 = £60.75m. LHR-BCN: 265,000 × £180 = £47.7m.

Step 2: Total annual revenue across the four routes: 145.6 + 91.2 + 60.75 + 47.7 = £345.25m.

Step 3: Express LHR-JFK's share: 145.6 ÷ 345.25 × 100 = 42.173…%, which rounds to 42.2%.

The answer is 42.2%.$reason$,
  difficulty = 'hard'
WHERE id = '06fd222f-e0bc-4191-8792-60f8834d5c07';


------------------------------------------------------------------
-- Chunk 4: sets 56–74 (12 questions)
------------------------------------------------------------------
-- practice-qr-set-56 q2: rewrite — LHR-DXB share of total annual ticket revenue across the four routes
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Using the fixed average fares per one-way ticket given in the stimulus, what proportion of total annual ticket revenue across the four routes came from the LHR-DXB route, to 1 decimal place?$stem$,
  options = '[{"text":"13.8%","label":"A"},{"text":"16.7%","label":"B"},{"text":"17.6%","label":"C"},{"text":"26.4%","label":"D"},{"text":"28.0%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: For each route, multiply annual passengers (in thousands) by the fare per ticket. LHR-JFK: 280 × £520 = £145.60m. LHR-DXB: 190 × £480 = £91.20m. LHR-CDG: 405 × £150 = £60.75m. LHR-BCN: 265 × £180 = £47.70m.

Step 2: Total annual ticket revenue = 145.60 + 91.20 + 60.75 + 47.70 = £345.25m.

Step 3: LHR-DXB's share = 91.20 ÷ 345.25 × 100 = 26.415…%, which rounds to 26.4%.

The answer is 26.4%.$reason$,
  difficulty = 'hard'
WHERE id = '442189d3-d902-472d-b480-9446fc06cf30';

-- practice-qr-set-60 q1: rewrite — Gamma's share of total console sales across the five years
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What share of total console unit sales across the full 2020–2024 period came from the Gamma console, to 1 decimal place?$stem$,
  options = '[{"text":"17.7%","label":"A"},{"text":"27.4%","label":"B"},{"text":"33.8%","label":"C"},{"text":"35.4%","label":"D"},{"text":"38.8%","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: For each console, sum the five annual values from the line graph. Alpha: 12 + 15 + 18 + 22 + 25 = 92. Beta: 20 + 18 + 16 + 14 + 12 = 80. Gamma: 5 + 8 + 12 + 17 + 23 = 65 (millions of units).

Step 2: Combined five-year sales = 92 + 80 + 65 = 237 million units.

Step 3: Gamma's share = 65 ÷ 237 × 100 = 27.426…%, which rounds to 27.4%.

The answer is 27.4%.$reason$,
  difficulty = 'hard'
WHERE id = '1f792d50-2a24-459f-9217-c0a9e438c21a';

-- practice-qr-set-61 q1: rewrite — count of solar sites operating strictly above 80% efficiency
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Using the efficiency formula given in the stimulus, how many of the eight sites operate at an efficiency strictly above 80%?$stem$,
  options = '[{"text":"3","label":"A"},{"text":"4","label":"B"},{"text":"5","label":"C"},{"text":"7","label":"D"},{"text":"8","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: For each site, apply Efficiency = Actual ÷ (Panels × 2.0) × 100. Site A: 14.4 ÷ 16 × 100 = 90%. Site B: 16 ÷ 20 × 100 = 80%. Site C: 21.6 ÷ 24 × 100 = 90%. Site D: 24 ÷ 30 × 100 = 80%. Site E: 30.6 ÷ 36 × 100 = 85%. Site F: 32 ÷ 40 × 100 = 80%. Site G: 39.6 ÷ 44 × 100 = 90%. Site H: 42.5 ÷ 50 × 100 = 85%.

Step 2: Sites strictly above 80% are those at 85% or 90%: A, C, E, G and H.

Step 3: That gives a count of 5 sites.

The answer is 5.$reason$,
  difficulty = 'hard'
WHERE id = '1bec4942-4245-42ed-bbbc-d0e59ea18dfb';

-- practice-qr-set-62 q1: rewrite — total monthly chair time used by all Check-up appointments, in hours
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What is the total monthly chair time used by all Check-up appointments (NHS plus private) combined, in hours?$stem$,
  options = '[{"text":"15 hours","label":"A"},{"text":"40 hours","label":"B"},{"text":"55 hours","label":"C"},{"text":"82.5 hours","label":"D"},{"text":"110 hours","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Total Check-up appointments per month = 120 NHS + 45 private = 165.

Step 2: Each Check-up uses 20 minutes of chair time, so total chair time = 165 × 20 = 3,300 minutes.

Step 3: Convert to hours: 3,300 ÷ 60 = 55 hours.

The answer is 55 hours.$reason$,
  difficulty = 'hard'
WHERE id = '1f884324-e0f4-4ef3-83a9-12c5bbfa53e5';

-- practice-qr-set-63 q1: rewrite — count of time buckets where outbound trips are at least double inbound trips
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the eight time buckets shown, in how many is the number of outbound trips at least double the number of inbound trips?$stem$,
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"5","label":"D"},{"text":"8","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: For each time bucket, compare outbound to twice the inbound count. 06:00: 85 vs 2 × 30 = 60. 08:00: 420 vs 2 × 110 = 220. 10:00: 180 vs 2 × 175 = 350. 12:00: 160 vs 2 × 195 = 390. 14:00: 175 vs 2 × 180 = 360. 16:00: 210 vs 2 × 205 = 410. 18:00: 385 vs 2 × 340 = 680. 20:00: 120 vs 2 × 95 = 190.

Step 2: Only 06:00 (85 ≥ 60) and 08:00 (420 ≥ 220) clear the "outbound at least double inbound" threshold.

Step 3: That gives a count of 2 buckets.

The answer is 2.$reason$,
  difficulty = 'hard'
WHERE id = '879d3df8-3632-4c72-bdb8-5c86104e7d37';

-- practice-qr-set-64 q1: rewrite — overall mean daily espresso shots per staff member across all branches
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all five branches combined, what is the mean number of espresso shots produced per staff member per day, to the nearest whole shot?$stem$,
  options = '[{"text":"48","label":"A"},{"text":"57","label":"B"},{"text":"58","label":"C"},{"text":"64","label":"D"},{"text":"76","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum the daily espresso shots column: 480 + 320 + 580 + 240 + 400 = 2,020 shots.

Step 2: Sum the staff count column: 8 + 6 + 9 + 5 + 7 = 35 staff.

Step 3: Mean shots per staff per day = 2,020 ÷ 35 = 57.714…, which rounds to 58 shots.

The answer is 58.$reason$,
  difficulty = 'hard'
WHERE id = '85311422-dbd9-488e-8cfd-9d64ad496eeb';

-- practice-qr-set-65 q1: rewrite — overall average admin cost per donor across all five channels
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across all five fundraising channels combined, what is the average admin cost per donor, to the nearest penny?$stem$,
  options = '[{"text":"£0.97","label":"A"},{"text":"£1.01","label":"B"},{"text":"£1.21","label":"C"},{"text":"£2.28","label":"D"},{"text":"£5.83","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Sum the admin cost column across all five channels: £1,450 + £380 + £210 + £140 + £520 = £2,700.

Step 2: Sum the donor count column: 1,200 + 310 + 960 + 24 + 180 = 2,674.

Step 3: Average admin cost per donor = £2,700 ÷ 2,674 = £1.0097…, which rounds to £1.01.

The answer is £1.01.$reason$,
  difficulty = 'hard'
WHERE id = '9e06821f-9154-4b5b-ada8-80365da44ff0';

-- practice-qr-set-67 q1: rewrite — combined share of three named routes in the 2024 throughput
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The Asia-Europe, Transpacific and Asia-Middle East routes combined represent what percentage of the 2024 throughput, to 1 decimal place?$stem$,
  options = '[{"text":"21.3%","label":"A"},{"text":"61.7%","label":"B"},{"text":"78.8%","label":"C"},{"text":"86.3%","label":"D"},{"text":"91.3%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the three segment values from the pie chart: Asia-Europe 860, Transpacific 620 and Asia-Middle East 410 (thousand TEUs).

Step 2: Combined throughput on these three routes = 860 + 620 + 410 = 1,890 thousand TEUs.

Step 3: Share of the 2,400 thousand TEU annual total = 1,890 ÷ 2,400 × 100 = 78.75%, which rounds to 78.8%.

The answer is 78.8%.$reason$,
  difficulty = 'hard'
WHERE id = '21ea0823-9843-43b3-bd31-c8f070543b3f';

-- practice-qr-set-70 q1: rewrite — Lakeside annual budget per Jan–Jun visitor (£ per visitor)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Using Lakeside's Jan–Jun visitor total from the line graph and its £1.8m annual maintenance budget, what is the annual maintenance budget per Jan–Jun visitor, to the nearest penny?$stem$,
  options = '[{"text":"£5.03","label":"A"},{"text":"£10.06","label":"B"},{"text":"£13.41","label":"C"},{"text":"£15.00","label":"D"},{"text":"£60.34","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Read Lakeside's six monthly visitor counts from the line graph (in thousands): 12, 15, 22, 30, 45 and 55.

Step 2: Total Jan–Jun visitors = 12 + 15 + 22 + 30 + 45 + 55 = 179 thousand, i.e. 179,000 people.

Step 3: Lakeside's annual maintenance budget is £1.8m = £1,800,000. Cost per Jan–Jun visitor = £1,800,000 ÷ 179,000 = £10.0558…, which rounds to £10.06.

The answer is £10.06.$reason$,
  difficulty = 'hard'
WHERE id = '8b2151cc-33f8-4b79-8d23-f163f6199aff';

-- practice-qr-set-72 q1: rewrite — total keepers required under the 1:20 mammal and 1:50 other-species policy
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Applying the keeper-to-animal ratios in the stimulus (1:20 for Mammals and 1:50 for every other species), and rounding any fractional keeper up to a whole keeper, how many keepers does Heathcote Zoo need in total?$stem$,
  options = '[{"text":"6","label":"A"},{"text":"9","label":"B"},{"text":"11","label":"C"},{"text":"13","label":"D"},{"text":"15","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read each species' total from the table: Mammals 110, Birds 100, Reptiles 60, Amphibians 30.

Step 2: Apply the 1:20 ratio to Mammals: 110 ÷ 20 = 5.5, rounded up to 6 keepers.

Step 3: Apply the 1:50 ratio to the other species: Birds 100 ÷ 50 = 2.0 → 2 keepers; Reptiles 60 ÷ 50 = 1.2 → 2 keepers; Amphibians 30 ÷ 50 = 0.6 → 1 keeper. That gives 2 + 2 + 1 = 5 keepers.

Step 4: Total keepers = 6 + 5 = 11.

The answer is 11.$reason$,
  difficulty = 'hard'
WHERE id = '9d8b066b-264f-4db1-bdcd-28e0e3718b2b';

-- practice-qr-set-73 q1: rewrite — number of 2.5 L tins needed for ONE coat across the entire flat
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$How many 2.5 L tins of paint must be purchased to apply ONE coat to every room in the flat?$stem$,
  options = '[{"text":"12 tins","label":"A"},{"text":"13 tins","label":"B"},{"text":"14 tins","label":"C"},{"text":"26 tins","label":"D"},{"text":"27 tins","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum the wall areas across all five rooms: 45 + 28 + 32 + 30 + 22 = 157 m².

Step 2: At 12 m² per coat per tin, one coat needs 157 ÷ 12 = 13.083… tins.

Step 3: Tins must be bought whole, so round 13.083 up to 14 tins.

The answer is 14 tins.$reason$,
  difficulty = 'hard'
WHERE id = 'fac6a450-5406-4c7b-9072-681ff8a301ff';

-- practice-qr-set-74 q1: rewrite — minutes of rapid charging needed to refill the battery after a 100-mile journey from 50%
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The driver completes a 100-mile journey starting with the battery at 50% charge, then plugs in to the public rapid charger and refills back to full. Assuming the stated efficiency holds for the whole journey, how many minutes of rapid charging are needed?$stem$,
  options = '[{"text":"37.5 min","label":"A"},{"text":"45 min","label":"B"},{"text":"82.5 min","label":"C"},{"text":"90 min","label":"D"},{"text":"550 min","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Energy used on the 100-mile journey at 4 miles/kWh = 100 ÷ 4 = 25 kWh.

Step 2: Starting charge = 50% × 60 = 30 kWh, so the battery has 30 − 25 = 5 kWh remaining at the end of the journey.

Step 3: Energy needed to top up to full = 60 − 5 = 55 kWh.

Step 4: Apply the formula time = energy ÷ power: 55 ÷ 40 = 1.375 hours = 1.375 × 60 = 82.5 minutes.

The answer is 82.5 min.$reason$,
  difficulty = 'hard'
WHERE id = '380522b1-9f18-4a42-a374-10ce460ebb40';


------------------------------------------------------------------
-- Chunk 5: sets 75–85 (12 questions)
------------------------------------------------------------------
-- practice-qr-set-75 q1: rewrite — % of Cat 3 & Cat 4 calls answered within 15 minutes
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across Categories 3 and 4 combined, what percentage of calls were responded to within 15 minutes, to 1 decimal place?$stem$,
  options = '[{"text":"23.8%","label":"A"},{"text":"28.6%","label":"B"},{"text":"33.3%","label":"C"},{"text":"38.5%","label":"D"},{"text":"41.7%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: From the table, add the Cat 3 and Cat 4 calls in the ≤7 min band: 30 + 10 = 40.

Step 2: Add the Cat 3 and Cat 4 calls in the 8–15 min band: 120 + 40 = 160.

Step 3: Combine to get Cat 3 + Cat 4 calls answered within 15 minutes: 40 + 160 = 200.

Step 4: The Cat 3 and Cat 4 column totals are 390 and 210, so the combined denominator is 390 + 210 = 600.

Step 5: 200 ÷ 600 × 100 = 33.333…%, which rounds to 33.3%.

The answer is 33.3%.$reason$,
  difficulty = 'hard'
WHERE id = 'de2cec0f-1817-417b-94d9-49c62e0cf4b7';

-- practice-qr-set-76 q1: rewrite — % by which weekend mean queue exceeds weekday mean queue
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the six recorded times, the average weekend queue length is what percentage greater than the average weekday queue length, to 1 decimal place?$stem$,
  options = '[{"text":"37.3%","label":"A"},{"text":"50.0%","label":"B"},{"text":"59.4%","label":"C"},{"text":"71.4%","label":"D"},{"text":"159.4%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum the weekday values from the line graph: 2 + 4 + 7 + 5 + 6 + 8 = 32.

Step 2: Sum the weekend values: 5 + 8 + 12 + 10 + 9 + 7 = 51.

Step 3: With six readings on each line, the means are 32 ÷ 6 ≈ 5.333 and 51 ÷ 6 = 8.5.

Step 4: The weekend mean exceeds the weekday mean by 8.5 − 5.333 = 3.167, so the percentage greater is 3.167 ÷ 5.333 × 100 = 59.375%, which rounds to 59.4%.

The answer is 59.4%.$reason$,
  difficulty = 'hard'
WHERE id = 'd8c93361-e19c-4027-bce5-49b97f75a528';

-- practice-qr-set-76 q2: rewrite — count of recorded times (across both lines) with queue exceeding 8
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Counting the weekday and weekend lines separately, on how many of the recorded times does the average queue length exceed 8 customers?$stem$,
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"4","label":"D"},{"text":"5","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the weekday values from the line graph: 2, 4, 7, 5, 6 and 8. None of these is strictly greater than 8.

Step 2: Read the weekend values: 5, 8, 12, 10, 9 and 7. The values strictly greater than 8 are 12, 10 and 9, which is three readings.

Step 3: Combine the two lines: 0 + 3 = 3 readings exceed 8.

The answer is 3.$reason$,
  difficulty = 'normal'
WHERE id = '1d236b42-42bc-4256-b59d-8e692a47176e';

-- practice-qr-set-77 q1: rewrite — apply provided profit formula (sales − 4 × weekly adv − £500 fee) for Cove
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Treat each month as four trading weeks. A store's monthly profit equals its monthly online sales minus four times its weekly advertising spend, minus the £500 monthly platform fee. Using the values plotted for Cove, what is Cove's monthly profit?$stem$,
  options = '[{"text":"£4,500","label":"A"},{"text":"£5,500","label":"B"},{"text":"£6,000","label":"C"},{"text":"£6,500","label":"D"},{"text":"£29,500","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Cove's point on the scatter plot is at x = 6 and y = 30, so weekly advertising spend is £6,000 and monthly online sales are £30,000.

Step 2: Convert the weekly advertising to a monthly figure: 4 × £6,000 = £24,000.

Step 3: Apply the formula: £30,000 − £24,000 − £500 = £5,500.

The answer is £5,500.$reason$,
  difficulty = 'hard'
WHERE id = '3a805a8f-bdd8-41bf-8c8a-b2a0552a1c76';

-- practice-qr-set-78 q4: rewrite — total tuition revenue across full course duration (Med 5yr, others 3yr)
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Each accepted student pays £9,250 in tuition every year for the full duration of their course. Medicine runs for five years; the other four courses run for three years. What is the total tuition revenue the university will receive from this cohort across the full duration of their courses?$stem$,
  options = '[{"text":"£52.17m","label":"A"},{"text":"£52.95m","label":"B"},{"text":"£54.95m","label":"C"},{"text":"£56.42m","label":"D"},{"text":"£58.58m","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the Acceptances bar for each course: Medicine 150, Dentistry 80, Law 400, Engineering 350 and Business 900.

Step 2: Medicine's total tuition is 150 × 5 × £9,250 = £6,937,500.

Step 3: The four three-year courses contribute (80 + 400 + 350 + 900) × 3 × £9,250 = 1,730 × 3 × £9,250 = 5,190 × £9,250 = £48,007,500.

Step 4: Add the two figures: £6,937,500 + £48,007,500 = £54,945,000, which is £54.95m.

The answer is £54.95m.$reason$,
  difficulty = 'hard'
WHERE id = '0c073424-9441-4307-a9cf-40588380e891';

-- practice-qr-set-79 q1: rewrite — weighted average ticket revenue per attendee
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$At last night's show, what was the average ticket revenue per attendee across the three tiers, to the nearest penny?$stem$,
  options = '[{"text":"£30.00","label":"A"},{"text":"£33.33","label":"B"},{"text":"£35.57","label":"C"},{"text":"£37.50","label":"D"},{"text":"£42.00","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Work out the attendees in each tier from the occupancy figures in the stem: Stalls 0.90 × 200 = 180, Circle 0.80 × 150 = 120, Gallery 0.50 × 100 = 50.

Step 2: Compute each tier's ticket revenue: Stalls 180 × £45 = £8,100, Circle 120 × £30 = £3,600, Gallery 50 × £15 = £750.

Step 3: Total ticket revenue is £8,100 + £3,600 + £750 = £12,450, and total attendees are 180 + 120 + 50 = 350.

Step 4: Average revenue per attendee is £12,450 ÷ 350 = £35.5714…, which rounds to £35.57.

The answer is £35.57.$reason$,
  difficulty = 'hard'
WHERE id = 'f776158b-3e3f-4b53-b308-fc7a93166eb6';

-- practice-qr-set-80 q1: rewrite — combined Dairy + Meat & Fish share of total revenue
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The combined revenue from the Dairy and Meat & Fish vendors represents what percentage of Saturday's total market revenue, to 1 decimal place?$stem$,
  options = '[{"text":"13.6%","label":"A"},{"text":"18.2%","label":"B"},{"text":"31.8%","label":"C"},{"text":"36.4%","label":"D"},{"text":"50.0%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: From the pie chart, Dairy revenue is £1,800 and Meat & Fish revenue is £2,400.

Step 2: Add the two segments: £1,800 + £2,400 = £4,200.

Step 3: The stem gives the total market revenue as £13,200, so the share is £4,200 ÷ £13,200 × 100 = 31.818…%, which rounds to 31.8%.

The answer is 31.8%.$reason$,
  difficulty = 'normal'
WHERE id = '8c060c3f-111a-4ec3-8c76-61c788a2e36c';

-- practice-qr-set-81 q1: rewrite — six-week mean Breaststroke lap time
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the six weeks, what is the mean Breaststroke lap time, to 2 decimal places?$stem$,
  options = '[{"text":"39.80 s","label":"A"},{"text":"40.20 s","label":"B"},{"text":"40.85 s","label":"C"},{"text":"40.90 s","label":"D"},{"text":"41.50 s","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the Breaststroke line for each week: 42.0, 41.5, 41.0, 40.6, 40.2 and 39.8.

Step 2: Sum the six values: 42.0 + 41.5 + 41.0 + 40.6 + 40.2 + 39.8 = 245.1.

Step 3: Divide by the number of weeks: 245.1 ÷ 6 = 40.85 seconds.

The answer is 40.85 s.$reason$,
  difficulty = 'hard'
WHERE id = '5e88abeb-0049-4a07-8630-20b9d175cb30';

-- practice-qr-set-82 q1: rewrite — Seabay Jan generation as a percentage above Northvale Jan
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$In January, Seabay's generation was what percentage greater than Northvale's, to 1 decimal place?$stem$,
  options = '[{"text":"17.3%","label":"A"},{"text":"26.2%","label":"B"},{"text":"35.6%","label":"C"},{"text":"38.2%","label":"D"},{"text":"73.5%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the January bars: Northvale 450 MWh and Seabay 610 MWh.

Step 2: The amount by which Seabay exceeds Northvale is 610 − 450 = 160 MWh.

Step 3: Express that as a percentage of Northvale's January figure: 160 ÷ 450 × 100 = 35.555…%, which rounds to 35.6%.

The answer is 35.6%.$reason$,
  difficulty = 'normal'
WHERE id = 'b21f2e83-ce3c-48c7-b256-a2ffc0dec992';

-- practice-qr-set-82 q2: rewrite — mean monthly generation across all three farms over the four months
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the three wind farms over the four months shown, what is the mean monthly generation, to 1 decimal place?$stem$,
  options = '[{"text":"403.3 MWh","label":"A"},{"text":"446.7 MWh","label":"B"},{"text":"468.3 MWh","label":"C"},{"text":"496.7 MWh","label":"D"},{"text":"526.7 MWh","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum each farm's four monthly bars. Northvale: 450 + 420 + 380 + 340 = 1,590 MWh. Eastridge: 520 + 490 + 440 + 400 = 1,850 MWh. Seabay: 610 + 580 + 520 + 470 = 2,180 MWh.

Step 2: Combine the three farm totals: 1,590 + 1,850 + 2,180 = 5,620 MWh across all twelve farm-months.

Step 3: Divide by the number of farm-months: 5,620 ÷ 12 = 468.333…, which rounds to 468.3 MWh.

The answer is 468.3 MWh.$reason$,
  difficulty = 'hard'
WHERE id = '0e48dbe7-ab14-4b95-a1b0-2698c5b4cf92';

-- practice-qr-set-84 q1: rewrite — combined Group Study + PhD Pods share of all bookings
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Group Study and PhD Pod bookings combined represent what percentage of all bookings that week, to 1 decimal place?$stem$,
  options = '[{"text":"14.3%","label":"A"},{"text":"33.7%","label":"B"},{"text":"48.0%","label":"C"},{"text":"51.0%","label":"D"},{"text":"70.4%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the Total Bookings column for the two rooms: Group Study 165 and PhD Pods 70.

Step 2: Add them: 165 + 70 = 235.

Step 3: The Slot Total row gives 490 bookings overall, so the share is 235 ÷ 490 × 100 = 47.959…%, which rounds to 48.0%.

The answer is 48.0%.$reason$,
  difficulty = 'normal'
WHERE id = '7ded816a-2aa2-47fe-985c-eda12a27bedd';

-- practice-qr-set-85 q1: rewrite — Family + Premium HiFi as a percentage of all subscribers
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The Family and Premium HiFi tiers together account for what percentage of all SoundWave subscribers, to 1 decimal place?$stem$,
  options = '[{"text":"20.6%","label":"A"},{"text":"26.3%","label":"B"},{"text":"35.6%","label":"C"},{"text":"51.3%","label":"D"},{"text":"66.3%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the two segment values: Family 165,000 and Premium HiFi 120,000.

Step 2: Add them: 165,000 + 120,000 = 285,000.

Step 3: The stem gives the total as 800,000, so the share is 285,000 ÷ 800,000 × 100 = 35.625%, which rounds to 35.6%.

The answer is 35.6%.$reason$,
  difficulty = 'normal'
WHERE id = 'c2351536-4a45-4ce0-9815-f319773902a2';


------------------------------------------------------------------
-- Chunk 6: sets 86–104 (13 questions)
------------------------------------------------------------------
-- practice-qr-set-86 q1: rewrite — share of total honey from hives aged 18 months or less
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Hives aged 18 months or less account for what percentage of the eight hives' combined annual honey production, to 1 decimal place?$stem$,
  options = '[{"text":"23.1%","label":"A"},{"text":"30.0%","label":"B"},{"text":"35.6%","label":"C"},{"text":"50.0%","label":"D"},{"text":"51.1%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: From the scatter plot, hives aged 18 months or less are A (6 mo, 12 kg), B (10 mo, 18 kg), C (14 mo, 22 kg) and D (18 mo, 28 kg).

Step 2: Sum that subset's honey: 12 + 18 + 22 + 28 = 80 kg.

Step 3: Sum all eight hives' honey: 12 + 18 + 22 + 28 + 35 + 32 + 40 + 38 = 225 kg.

Step 4: The share is 80 ÷ 225 × 100 = 35.555…%, which rounds to 35.6%.

The answer is 35.6%.$reason$,
  difficulty = 'hard'
WHERE id = '11419827-0252-4ff0-8498-6910c264552f';

-- practice-qr-set-88 q4: rewrite — mean empty seats per match across the five stadiums
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the five stadiums shown, what is the mean number of empty seats per match (capacity minus average attendance), to the nearest whole spectator?$stem$,
  options = '[{"text":"745","label":"A"},{"text":"894","label":"B"},{"text":"1,118","label":"C"},{"text":"1,476","label":"D"},{"text":"4,470","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Take each stadium's capacity minus its average attendance: Old Trafford 74,140 − 73,200 = 940; Emirates 60,704 − 60,100 = 604; Anfield 61,276 − 59,800 = 1,476; Tottenham 62,850 − 61,700 = 1,150; Etihad 53,400 − 53,100 = 300.

Step 2: Add the five shortfalls: 940 + 604 + 1,476 + 1,150 + 300 = 4,470 empty seats.

Step 3: Divide by the five stadiums: 4,470 ÷ 5 = 894.

The answer is 894.$reason$,
  difficulty = 'hard'
WHERE id = '087ed70c-8398-4770-bb9b-1a8df4d27fd3';

-- practice-qr-set-89 q4: rewrite — mean swim split among athletes whose total time was below 132 minutes
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Among the athletes whose total race time was below 132 minutes, what was the mean swim split, in minutes, to 1 decimal place?$stem$,
  options = '[{"text":"23.0","label":"A"},{"text":"25.0","label":"B"},{"text":"25.8","label":"C"},{"text":"26.0","label":"D"},{"text":"27.0","label":"E"}]'::jsonb,
  correct_answer = 'B',
  answer_reason = $reason$Step 1: Read the Total column and pick athletes below 132 minutes: Amara 129, Clara 127 and Diego 131. Brendan and Elena are excluded at 133.

Step 2: Read those three athletes' swim splits: Amara 25, Clara 23, Diego 27.

Step 3: Mean swim split = (25 + 23 + 27) ÷ 3 = 75 ÷ 3 = 25.0 minutes.

The answer is 25.0.$reason$,
  difficulty = 'hard'
WHERE id = '03b34859-b4aa-4dc0-95db-f03b484a9c84';

-- practice-qr-set-91 q2: rewrite — cost per guest of a Gold package booking for 60 guests
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$A couple books the Gold package for 60 guests and splits the final invoice equally between the guests. What does each guest pay, to the nearest penny?$stem$,
  options = '[{"text":"£75.00","label":"A"},{"text":"£95.00","label":"B"},{"text":"£114.00","label":"C"},{"text":"£118.17","label":"D"},{"text":"£119.00","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Pre-VAT cost = Gold base £1,200 + 60 × £75 per head = 1,200 + 4,500 = £5,700.

Step 2: Apply 20% VAT: 5,700 × 1.20 = £6,840.

Step 3: Add the £250 service charge after VAT: 6,840 + 250 = £7,090.

Step 4: Split between 60 guests: 7,090 ÷ 60 = £118.166…, which rounds to £118.17.

The answer is £118.17.$reason$,
  difficulty = 'hard'
WHERE id = 'c4893942-6b37-4958-bf15-25a05238651a';

-- practice-qr-set-92 q1: rewrite — Alice's W6–W8 mileage as a percentage of Carla's W6–W8 mileage
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across Weeks 6, 7 and 8, what percentage is Alice's combined mileage of Carla's combined mileage over the same three weeks, to 1 decimal place?$stem$,
  options = '[{"text":"26.2%","label":"A"},{"text":"42.5%","label":"B"},{"text":"72.5%","label":"C"},{"text":"73.8%","label":"D"},{"text":"75.0%","label":"E"}]'::jsonb,
  correct_answer = 'D',
  answer_reason = $reason$Step 1: Read Alice's mileage for Weeks 6, 7 and 8 from the line graph: 38, 42 and 44 miles.

Step 2: Sum Alice's three weeks: 38 + 42 + 44 = 124 miles.

Step 3: Read Carla's mileage for the same three weeks: 54, 56 and 58 miles, summing to 168 miles.

Step 4: Express Alice's total as a percentage of Carla's: 124 ÷ 168 × 100 = 73.809…%, which rounds to 73.8%.

The answer is 73.8%.$reason$,
  difficulty = 'hard'
WHERE id = '0de2879c-9d6a-4953-9a38-641649303921';

-- practice-qr-set-93 q1: rewrite — mean per-attendee income from sponsorship, silent auction and raffle combined
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Combining only Sponsorship, Silent Auction and Raffle, what was the mean income per attendee from those three sources, to the nearest penny?$stem$,
  options = '[{"text":"£12.20","label":"A"},{"text":"£19.20","label":"B"},{"text":"£24.20","label":"C"},{"text":"£29.00","label":"D"},{"text":"£30.25","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the three segments: Sponsorship £30,000, Silent Auction £18,000, Raffle £12,500.

Step 2: Add them: 30,000 + 18,000 + 12,500 = £60,500.

Step 3: Divide by the 2,500 attendees: 60,500 ÷ 2,500 = £24.20.

The answer is £24.20.$reason$,
  difficulty = 'hard'
WHERE id = '68ab6547-a426-4314-b818-73f9a3bce143';

-- practice-qr-set-95 q1: rewrite — share of total monthly yield from plots using 200 L/wk or more
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of the eight plots' combined monthly tomato yield came from plots using 200 litres of water per week or more, to 1 decimal place?$stem$,
  options = '[{"text":"32.6%","label":"A"},{"text":"50.0%","label":"B"},{"text":"67.4%","label":"C"},{"text":"71.4%","label":"D"},{"text":"93.3%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: From the scatter plot, the plots using 200 L/wk or more are P4 (210 L, 36 kg), P5 (240 L, 42 kg), P6 (270 L, 48 kg) and P7 (300 L, 54 kg).

Step 2: Sum that subset's yield: 36 + 42 + 48 + 54 = 180 kg.

Step 3: Sum all eight plots' yield: 18 + 24 + 30 + 36 + 42 + 48 + 54 + 15 = 267 kg.

Step 4: The share is 180 ÷ 267 × 100 = 67.415…%, which rounds to 67.4%.

The answer is 67.4%.$reason$,
  difficulty = 'hard'
WHERE id = 'cbcc4004-5ed1-446c-a4dd-5b02d4f55a6a';

-- practice-qr-set-97 q1: rewrite — share of recorded year that fell in the May–August summer block
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of the year's recorded visitors arrived during the four summer months May to August, to 1 decimal place?$stem$,
  options = '[{"text":"28.3%","label":"A"},{"text":"33.3%","label":"B"},{"text":"53.3%","label":"C"},{"text":"61.4%","label":"D"},{"text":"63.0%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read the May–August bars: 2,000 + 2,400 + 2,800 + 2,600 = 9,800 visitors.

Step 2: Total recorded visitors across the eleven open months: 800 + 900 + 1,200 + 1,500 + 2,000 + 2,400 + 2,800 + 2,600 + 1,800 + 1,400 + 1,000 = 18,400 (November is excluded as the observatory was closed).

Step 3: Express May–August as a share of the recorded total: 9,800 ÷ 18,400 × 100 = 53.260…%, which rounds to 53.3%.

The answer is 53.3%.$reason$,
  difficulty = 'hard'
WHERE id = 'a3afa173-4e4c-417f-8c7e-53c8c097800c';

-- practice-qr-set-98 q1: rewrite — Perennials as a percentage of the South region's total sales
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of the South region's total plant sales were Perennials, to 1 decimal place?$stem$,
  options = '[{"text":"11.1%","label":"A"},{"text":"25.6%","label":"B"},{"text":"32.6%","label":"C"},{"text":"33.3%","label":"D"},{"text":"67.4%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: From the table, Perennials sold in the South = 300 units.

Step 2: The South column total = 920 units.

Step 3: 300 ÷ 920 × 100 = 32.608…%, which rounds to 32.6%.

The answer is 32.6%.$reason$,
  difficulty = 'hard'
WHERE id = 'a5da188d-61b5-4b88-a184-dff427abf88b';

-- practice-qr-set-100 q1: rewrite — overall blended profit margin across all five drink categories
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Across the five drink categories combined, what is the overall profit margin (total profit as a percentage of total revenue), to 1 decimal place?$stem$,
  options = '[{"text":"34.1%","label":"A"},{"text":"54.8%","label":"B"},{"text":"65.9%","label":"C"},{"text":"67.7%","label":"D"},{"text":"72.3%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Sum total revenue: 4,200 + 6,500 + 5,800 + 2,400 + 3,100 = £22,000.

Step 2: Sum total cost: 1,200 + 2,100 + 1,900 + 900 + 1,400 = £7,500.

Step 3: Total profit = 22,000 − 7,500 = £14,500.

Step 4: Overall margin = 14,500 ÷ 22,000 × 100 = 65.909…%, which rounds to 65.9%.

The answer is 65.9%.$reason$,
  difficulty = 'hard'
WHERE id = 'da2f25b7-5f6b-4f69-801f-152fef0f385d';

-- practice-qr-set-100 q2: rewrite — net margin after deducting £4,200 of general overheads
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$The shop's general overheads (rent, wages, utilities) for March were £4,200. After subtracting these from the combined category profit, what net margin (as a percentage of total revenue) does the shop earn in March, to 1 decimal place?$stem$,
  options = '[{"text":"19.1%","label":"A"},{"text":"34.1%","label":"B"},{"text":"46.8%","label":"C"},{"text":"57.9%","label":"D"},{"text":"65.9%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Total revenue = 4,200 + 6,500 + 5,800 + 2,400 + 3,100 = £22,000.

Step 2: Total category cost = 1,200 + 2,100 + 1,900 + 900 + 1,400 = £7,500, so combined category profit = 22,000 − 7,500 = £14,500.

Step 3: Subtract overheads: 14,500 − 4,200 = £10,300 net profit.

Step 4: Net margin = 10,300 ÷ 22,000 × 100 = 46.818…%, which rounds to 46.8%.

The answer is 46.8%.$reason$,
  difficulty = 'hard'
WHERE id = 'e5e486a3-f081-4609-8eb9-e9a637b8293e';

-- practice-qr-set-101 q1: rewrite — Red-status share of the reserve's total annual sightings
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$What percentage of the reserve's total 2025 sightings were of Red conservation-status species, to 1 decimal place?$stem$,
  options = '[{"text":"17.8%","label":"A"},{"text":"20.0%","label":"B"},{"text":"33.7%","label":"C"},{"text":"35.7%","label":"D"},{"text":"66.3%","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: The only Red-status species is Starling, with an annual total of 1,000 sightings.

Step 2: Robin's annual total is not printed but the stem gives a mean quarterly figure of 162.5, so Robin's annual total is 162.5 × 4 = 650.

Step 3: Total annual sightings = Swift 390 + Starling 1,000 + Robin 650 + Chaffinch 400 + Skylark 530 = 2,970.

Step 4: Red share = 1,000 ÷ 2,970 × 100 = 33.670…%, which rounds to 33.7%.

The answer is 33.7%.$reason$,
  difficulty = 'hard'
WHERE id = 'ab156e30-df63-4a0a-a248-b150585a1bc8';

-- practice-qr-set-104 q1: rewrite — total Saturday ticket revenue using the per-age-group prices
UPDATE quantitative_reasoning_questions SET
  question_text = $stem$Using the prices stated in the context, what was the total Saturday ticket revenue?$stem$,
  options = '[{"text":"£3,330","label":"A"},{"text":"£3,760","label":"B"},{"text":"£4,180","label":"C"},{"text":"£4,380","label":"D"},{"text":"£4,800","label":"E"}]'::jsonb,
  correct_answer = 'C',
  answer_reason = $reason$Step 1: Read Saturday's ticket counts: Under 16 = 70, 16–30 = 160, 31–60 = 120, 60+ = 50.

Step 2: Apply the prices from the context — £6 Child, £12 Standard for 16–60, £8 Senior: 70 × 6 = £420; 160 × 12 = £1,920; 120 × 12 = £1,440; 50 × 8 = £400.

Step 3: Add the four group revenues: 420 + 1,920 + 1,440 + 400 = £4,180.

The answer is £4,180.$reason$,
  difficulty = 'hard'
WHERE id = 'a7ba5b77-9e9b-4c28-9518-cca1a686fa7e';

