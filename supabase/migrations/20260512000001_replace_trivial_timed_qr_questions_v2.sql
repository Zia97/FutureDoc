-- Replace trivial UCAT QR questions in the TIMED tests (round 2).
--
-- Counterpart to 20260511000001_replace_trivial_practice_qr_questions.sql
-- (which handled the practice bank). This migration targets
-- `timed_quantitative_reasoning_questions` and rewrites the 24 questions
-- that fail the tightened "minimum reasoning floor" in
-- `.claude/UCAT-QR-QUESTION-GENERATOR.md` and `.claude/UCAT-QR-VALIDATOR.md`.
--
-- Banned patterns being removed (in addition to those caught in the
-- first round, 20260509000001):
--   * Single percentage from two visible values (X / visible total)
--   * Single ratio / fraction from two visible values
--   * Single multiplication / division / unit conversion of one given value
--   * Mean of <=5 values from a single row, column, or labelled series
--   * Pure band-lookup with no arithmetic
--
-- 4 of the 24 rewrites here are prior rewrites from 20260509000001 that
-- fell short of the tightened floor; the other 20 are originals.
--
-- Each replacement:
--   * Uses the same set's existing stimulus (no chart/table changes)
--   * Clears the new floor (percentage CHANGE / multi-step / filter /
--     >5 mean or median / missing-data derivation / formula chain)
--   * Does not duplicate the logic of other questions in the same set
--   * Has 5 options in ascending numerical order (or alphabetical for
--     label-style answers) with traceable distractors
--   * Has step-by-step `Step N:` reasoning for multi-step questions
--   * Keeps the same id, set_id, question_ref, order_index, created_at

----------------------------------------------------------------------
-- TEST 1
----------------------------------------------------------------------

-- qr1-s06-q2: North 2021 missing rate via mean back-calculation
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'If the North region''s mean membership rate across the six years was exactly 89.8%, what was its 2021 rate?',
  options = '[{"text":"88.4%","label":"A"},{"text":"88.7%","label":"B"},{"text":"89.0%","label":"C"},{"text":"89.8%","label":"D"},{"text":"90.0%","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: A mean of 89.8% across six years gives a total of 89.8 × 6 = 538.8 percentage points.

Step 2: Sum the five known North values (2018, 2019, 2020, 2022, 2023): 91.2 + 90.8 + 88.4 + 89.6 + 90.1 = 450.1.

Step 3: The missing 2021 rate = 538.8 − 450.1 = 88.7%.

The answer is 88.7%.',
  difficulty = 'hard'
WHERE id = 'b826faff-6c30-42ad-a0b4-e1d5061ec7d6';

-- qr1-s06-q4: Years where every region's rate strictly exceeds 88.0%
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across the five years where all three regions have recorded data, in how many years did every region''s membership rate strictly exceed 88.0%?',
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"4","label":"D"},{"text":"5","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: Identify the years where all three regions have data: 2018, 2019, 2020, 2022, 2023 (2021 is excluded because the North value is missing).

Step 2: Check each year for all three rates > 88.0%. 2018: 91.2, 94.1, 89.5 — all above. 2019: 90.8, 94.5, 90.2 — all above. 2020: Midlands = 87.1 — fails. 2022: 89.6, 91.5, 88.3 — all above. 2023: 90.1, 92.0, 89.0 — all above.

Step 3: Years that satisfy the condition: 2018, 2019, 2022, 2023 = 4 years.

The answer is 4.',
  difficulty = 'hard'
WHERE id = 'a7d6d9eb-7c60-439d-a8d1-508992305585';

-- qr1-s07-q2: Class A's 10-50hr score growth as a percentage of Class B's
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Class A''s exam score increase between 10 hours and 50 hours of revision, expressed as a percentage of Class B''s increase over the same range, is what value, to one decimal place?',
  options = '[{"text":"100.0%","label":"A"},{"text":"105.0%","label":"B"},{"text":"112.5%","label":"C"},{"text":"117.0%","label":"D"},{"text":"125.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the Class A points, the score increase between 10 and 50 hours = 90 − 45 = 45 percentage points.

Step 2: From the Class B points, the score increase = 78 − 38 = 40 percentage points.

Step 3: A''s increase as a percentage of B''s increase = 45 ÷ 40 × 100 = 112.5%.

The answer is 112.5%.',
  difficulty = 'hard'
WHERE id = '8b730567-3474-4bc8-a5ca-ff4e1d04d267';

-- qr1-s08-q2: % allocated to Staff Salaries, Food Supplies and Premises combined
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What percentage of the total budget is allocated to Staff Salaries, Food Supplies and Premises combined, to one decimal place?',
  options = '[{"text":"43.2%","label":"A"},{"text":"67.7%","label":"B"},{"text":"82.3%","label":"C"},{"text":"89.0%","label":"D"},{"text":"92.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the three segment values: Staff Salaries £142m + Food Supplies £68m + Premises £45m = £255m.

Step 2: Express as a percentage of the £310m total: 255 ÷ 310 × 100 = 82.258%, which rounds to 82.3%.

The answer is 82.3%.',
  difficulty = 'normal'
WHERE id = '7d998040-bdd2-454b-9ea7-61cf76100fdb';

-- qr1-s08-q3: New total budget after Staff +5% and Premises +10%
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Next year, Staff Salaries are projected to grow by 5% and Premises by 10%, while every other category stays the same. What is the new total budget, to the nearest £million?',
  options = '[{"text":"£315m","label":"A"},{"text":"£317m","label":"B"},{"text":"£322m","label":"C"},{"text":"£326m","label":"D"},{"text":"£358m","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Staff Salaries increase = £142m × 0.05 = £7.10m.

Step 2: Premises increase = £45m × 0.10 = £4.50m.

Step 3: Total budget increase = £7.10m + £4.50m = £11.60m.

Step 4: New total = £310m + £11.60m = £321.60m, which rounds to £322m.

The answer is £322m.',
  difficulty = 'hard'
WHERE id = 'd7de4b97-5add-4e54-b7fe-5e9c09ff6714';

-- qr1-s09-q1: Combined weekly cost of the two appliances above 20 kWh
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Two of the five appliances have a weekly energy consumption above 20 kWh. What is the combined weekly cost of running just those two appliances, to the nearest penny?',
  options = '[{"text":"£6.47","label":"A"},{"text":"£11.07","label":"B"},{"text":"£12.11","label":"C"},{"text":"£17.70","label":"D"},{"text":"£19.05","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Calculate the weekly energy for each appliance using Power × Weekly Use. Oven: 2.2 × 10.5 = 23.10 kWh. Washing machine: 0.9 × 3.5 = 3.15 kWh. Refrigerator: 0.12 × 168 = 20.16 kWh. Electric shower: 9.5 × 2.1 = 19.95 kWh. LED lighting: 0.04 × 42 = 1.68 kWh.

Step 2: Identify the two appliances above 20 kWh: Oven (23.10) and Refrigerator (20.16).

Step 3: Combined weekly energy = 23.10 + 20.16 = 43.26 kWh.

Step 4: Cost at 28p per kWh = 43.26 × £0.28 = £12.1128, which rounds to £12.11.

The answer is £12.11.',
  difficulty = 'hard'
WHERE id = '2d2a5163-4fb4-4dbe-aa99-1cdfa9e89ce0';

-- qr1-s11-q1: Combined London + South West population in 2022
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'London''s 2018 population was 480,000 and the South West''s 2018 population was 360,000. What was the combined population of the two regions in 2022, to the nearest 1,000?',
  options = '[{"text":"840,000","label":"A"},{"text":"866,000","label":"B"},{"text":"982,000","label":"C"},{"text":"1,007,000","label":"D"},{"text":"1,170,000","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: From the line graph, the London 2022 index = 116 and the South West 2022 index = 118 (with 2018 = 100 for both).

Step 2: London 2022 population = 480,000 × 116 ÷ 100 = 480,000 × 1.16 = 556,800.

Step 3: South West 2022 population = 360,000 × 118 ÷ 100 = 360,000 × 1.18 = 424,800.

Step 4: Combined = 556,800 + 424,800 = 981,600, which rounds to 982,000.

The answer is 982,000.',
  difficulty = 'hard'
WHERE id = 'b7783b80-61e7-4195-a649-a08d27e80b8d';

----------------------------------------------------------------------
-- TEST 2
----------------------------------------------------------------------

-- qr2-s01-q1: % of combined GP+A&E urgent referrals directed to Cardiology
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Combine GP Referrals and A&E Transfers into a single "urgent pathways" group. What percentage of these urgent referrals were directed to Cardiology, to one decimal place?',
  options = '[{"text":"23.1%","label":"A"},{"text":"29.1%","label":"B"},{"text":"33.2%","label":"C"},{"text":"38.7%","label":"D"},{"text":"45.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Combine the row totals for GP Referrals and A&E Transfers: 289 + 100 = 389 urgent referrals in total.

Step 2: Combine the Cardiology counts for those same two rows: 84 (GP) + 45 (A&E) = 129 directed to Cardiology.

Step 3: Percentage = 129 ÷ 389 × 100 = 33.16%, which rounds to 33.2%.

The answer is 33.2%.',
  difficulty = 'hard'
WHERE id = '02b62eb7-4b1e-46ca-8dc0-8c03ec699204';

-- qr2-s01-q3: Departments where GP Referrals provide at least 50% of total
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across the four departments shown, in how many departments do GP Referrals account for at least 50% of that department''s total referrals?',
  options = '[{"text":"0","label":"A"},{"text":"1","label":"B"},{"text":"2","label":"C"},{"text":"3","label":"D"},{"text":"4","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: For each department, divide GP Referrals by the Department Total: Cardio 84 ÷ 169 = 49.7%. Derm 62 ÷ 122 = 50.8%. Ortho 95 ÷ 165 = 57.6%. Gastro 48 ÷ 103 = 46.6%.

Step 2: Departments with GP share at least 50% are Dermatology (50.8%) and Orthopaedics (57.6%) — Cardiology just falls short at 49.7%.

The answer is 2.',
  difficulty = 'hard'
WHERE id = 'ca245978-3176-453e-a0ae-9dfae807726b';

-- qr2-s07-q1: Two-property landlord total Council Tax, both single-tenant
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'A landlord owns two properties valued at £45,000 and £100,000. Both are rented to single tenants. What is the landlord''s total annual Council Tax liability across the two properties?',
  options = '[{"text":"£2,496","label":"A"},{"text":"£2,652","label":"B"},{"text":"£2,808","label":"C"},{"text":"£3,172","label":"D"},{"text":"£3,744","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Place £45,000 in the £40,001–£52,000 range → Band B → £1,456. Apply the single-adult 25% discount: £1,456 × 0.75 = £1,092.

Step 2: Place £100,000 in the £88,001–£120,000 range → Band E → £2,288. Apply the single-adult discount: £2,288 × 0.75 = £1,716.

Step 3: Total annual liability = £1,092 + £1,716 = £2,808.

The answer is £2,808.',
  difficulty = 'hard'
WHERE id = 'aad4b849-4a7c-4182-833f-e3dcd35b71c7';

-- qr2-s08-q1: Countries with CO2 per £1,000 GDP strictly below 0.30
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'For each country, compute its CO₂ emissions per £1,000 of GDP per capita. Across the seven countries, how many have a value strictly below 0.30, to two decimal places?',
  options = '[{"text":"2","label":"A"},{"text":"3","label":"B"},{"text":"4","label":"C"},{"text":"5","label":"D"},{"text":"6","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Compute CO₂ ÷ GDP (in £000s) for each country. A: 2.5 ÷ 8 = 0.31. B: 4.8 ÷ 15 = 0.32. C: 6.2 ÷ 22 = 0.28. D: 9.5 ÷ 30 = 0.32. E: 7.1 ÷ 38 = 0.19. F: 12.0 ÷ 45 = 0.27. G: 8.8 ÷ 52 = 0.17.

Step 2: Countries with a value strictly below 0.30 are C (0.28), E (0.19), F (0.27) and G (0.17) — four countries in total.

The answer is 4.',
  difficulty = 'hard'
WHERE id = '3deda984-13e6-4550-95ca-cb4d6b7b9cab';

-- qr2-s12-q1: Largest weeknight vs weekend price gap, before VAT
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Which room type has the largest difference between its weeknight price and its weekend price (both before VAT)?',
  options = '[{"text":"Double","label":"A"},{"text":"Family","label":"B"},{"text":"Penthouse","label":"C"},{"text":"Single","label":"D"},{"text":"Suite","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'For each room type, compute weeknight = rack × (1 − weeknight discount) and weekend = rack × (1 + weekend surcharge), then take the gap.

Step 1: Single — rack £85. Weeknight £85 × 0.85 = £72.25. Weekend £85 × 1.00 = £85.00. Gap = £12.75.

Step 2: Double — rack £120. Weeknight £102.00. Weekend £132.00. Gap = £30.00.

Step 3: Family — rack £175. Weeknight £140.00. Weekend £201.25. Gap = £61.25.

Step 4: Suite — rack £250. Weeknight £225.00. Weekend £300.00. Gap = £75.00.

Step 5: Penthouse — rack £420. Weeknight £420.00 (0% discount). Weekend £525.00. Gap = £105.00. The largest gap is Penthouse.

The answer is Penthouse.',
  difficulty = 'hard'
WHERE id = '6a41ac02-319f-4b50-b4e0-c167942e83e4';

----------------------------------------------------------------------
-- TEST 3
----------------------------------------------------------------------

-- qr3-s02-q2: January's share of the total six-month deficit
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Of the months where the community ran an energy deficit, what proportion of the total deficit (in MWh) occurred in January, to one decimal place?',
  options = '[{"text":"11.8%","label":"A"},{"text":"35.3%","label":"B"},{"text":"52.9%","label":"C"},{"text":"60.0%","label":"D"},{"text":"75.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Identify the deficit months (negative bars): January −45, February −30, June −10.

Step 2: Total deficit (in MWh) = 45 + 30 + 10 = 85.

Step 3: January''s share = 45 ÷ 85 × 100 = 52.94%, which rounds to 52.9%.

The answer is 52.9%.',
  difficulty = 'hard'
WHERE id = '07979331-226a-43d8-9fe8-0f0d5a50ad4d';

-- qr3-s04-q1: Years where South-North price gap is strictly below £150,000
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Across the six years shown, in how many years was the gap between the South region''s average price and the North region''s average price strictly less than £150,000?',
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"4","label":"D"},{"text":"5","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Subtract the North value from the South value for each year (£000s). 2019: 280 − 145 = 135. 2020: 290 − 150 = 140. 2021: 310 − 162 = 148. 2022: 340 − 178 = 162. 2023: 355 − 185 = 170. 2024: 365 − 190 = 175.

Step 2: Gaps strictly below £150,000 are 2019 (135), 2020 (140) and 2021 (148) — three years.

The answer is 3.',
  difficulty = 'hard'
WHERE id = 'de12870c-5b5a-4cdd-8b04-3ed85863e00c';

-- qr3-s04-q3: South region mean house price across six years
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What was the South region''s mean average house price across the six years shown, to the nearest £1,000?',
  options = '[{"text":"£310,000","label":"A"},{"text":"£323,000","label":"B"},{"text":"£340,000","label":"C"},{"text":"£355,000","label":"D"},{"text":"£365,000","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'Step 1: Read the six South values from the line graph (£000s): 280, 290, 310, 340, 355, 365.

Step 2: Sum = 280 + 290 + 310 + 340 + 355 + 365 = 1,940 (£000s).

Step 3: Mean = 1,940 ÷ 6 = 323.33 (£000s), which rounds to £323,000.

The answer is £323,000.',
  difficulty = 'normal'
WHERE id = '242f7264-7608-40a8-b73a-4efca33e35b6';

-- qr3-s06-q1: iPhone share of combined 18-25 + 26-40 "younger users" segment
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Combine the 18-25 and 26-40 age groups into a single "younger users" segment. What percentage of younger users downloaded the app on an iPhone, to one decimal place?',
  options = '[{"text":"35.0%","label":"A"},{"text":"40.0%","label":"B"},{"text":"44.2%","label":"C"},{"text":"50.0%","label":"D"},{"text":"55.0%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Combine the two iPhone cells for the 18-25 and 26-40 columns: 480 + 620 = 1,100 iPhone downloads in the younger segment.

Step 2: Combine the two column totals: 1,150 + 1,340 = 2,490 total younger downloads.

Step 3: Percentage = 1,100 ÷ 2,490 × 100 = 44.18%, which rounds to 44.2%.

The answer is 44.2%.',
  difficulty = 'hard'
WHERE id = '0f5b873c-f4ca-46e1-b99a-20b3960ac842';

-- qr3-s06-q2: Device with highest 41+ proportion within its own downloads
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'For each device, calculate the proportion of its downloads that came from users aged 41 or older. Which device has the highest such proportion?',
  options = '[{"text":"Android","label":"A"},{"text":"Can''t Tell","label":"B"},{"text":"iPhone","label":"C"},{"text":"iPhone and Android equally","label":"D"},{"text":"Tablet","label":"E"}]',
  correct_answer = 'E',
  answer_reason = 'Step 1: Derive the missing Android 61+ cell using the Android row total: 1,600 − 550 − 480 − 390 = 180.

Step 2: For each device, sum the 41-60 and 61+ cells and divide by the row total. iPhone 41+ proportion = (340 + 160) ÷ 1,600 = 500 ÷ 1,600 = 31.3%.

Step 3: Android 41+ proportion = (390 + 180) ÷ 1,600 = 570 ÷ 1,600 = 35.6%.

Step 4: Tablet 41+ proportion = (280 + 160) ÷ 800 = 440 ÷ 800 = 55.0%. The highest is Tablet.

The answer is Tablet.',
  difficulty = 'hard'
WHERE id = 'a0fb94b4-5208-40ee-aba0-cd68db60d1b2';

-- qr3-s08-q2: Ratio of fixed costs (Rent + Salaries) to variable costs
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'Combine Rent and Salaries into "fixed costs" and group the remaining four categories as "variable costs". What is the ratio of fixed costs to variable costs, in its simplest form?',
  options = '[{"text":"1 : 1","label":"A"},{"text":"5 : 4","label":"B"},{"text":"3 : 2","label":"C"},{"text":"5 : 3","label":"D"},{"text":"2 : 1","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Fixed costs = Rent £2,400 + Salaries £4,800 = £7,200.

Step 2: Variable costs = Utilities £960 + Marketing £1,440 + Supplies £1,200 + Other £1,200 = £4,800.

Step 3: Ratio 7,200 : 4,800. Divide both sides by the common factor 2,400: 7,200 ÷ 2,400 = 3 and 4,800 ÷ 2,400 = 2.

The answer is 3 : 2.',
  difficulty = 'hard'
WHERE id = '37b00e88-3b0a-4c93-933b-f5d83a143dea';

-- qr3-s12-q2: Median hospital beds per 10,000 across the seven cities
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What is the median number of hospital beds per 10,000 population across the seven cities shown?',
  options = '[{"text":"22","label":"A"},{"text":"25","label":"B"},{"text":"32","label":"C"},{"text":"40","label":"D"},{"text":"48","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Read the x-value (beds per 10,000) for each city: A 25, B 40, C 18, D 55, E 32, F 48, G 22.

Step 2: Sort them in ascending order: 18, 22, 25, 32, 40, 48, 55.

Step 3: With seven values, the median is the 4th value: 32.

The answer is 32.',
  difficulty = 'normal'
WHERE id = 'b5edd111-fa66-41bf-97a1-be820fa71616';

----------------------------------------------------------------------
-- TEST 4
----------------------------------------------------------------------

-- qr4-s02-q2: Count of sites with more than 20,000 total visitors
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'How many of the five heritage sites had more than 20,000 total visitors (adults plus children) in 2025?',
  options = '[{"text":"1","label":"A"},{"text":"2","label":"B"},{"text":"3","label":"C"},{"text":"4","label":"D"},{"text":"5","label":"E"}]',
  correct_answer = 'D',
  answer_reason = 'Step 1: For each site, add the adult and child bar values. Castle Moor 16,000 + 8,000 = 24,000. Abbey Fields 12,000 + 9,000 = 21,000. Roman Baths 24,000 + 16,000 = 40,000. Harbour Fort 10,000 + 2,500 = 12,500. Cathedral Close 15,000 + 6,000 = 21,000.

Step 2: Sites with total above 20,000: Castle Moor (24,000), Abbey Fields (21,000), Roman Baths (40,000) and Cathedral Close (21,000). Harbour Fort (12,500) falls short.

The answer is 4.',
  difficulty = 'hard'
WHERE id = '4e1b47c5-0206-4cca-85ca-5562198c8b98';

-- qr4-s05-q1: Aggregate carbon intensity across all five sectors
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What is the combined carbon intensity of all five sectors, computed as total emissions divided by total revenue, to two decimal places?',
  options = '[{"text":"0.13","label":"A"},{"text":"0.15","label":"B"},{"text":"0.17","label":"C"},{"text":"0.19","label":"D"},{"text":"0.21","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum total emissions across the five sectors: 420 + 270 + 640 + 700 + 240 = 2,270 kt CO₂e.

Step 2: Sum total revenue across the five sectors: 2,800 + 900 + 3,200 + 5,000 + 1,500 = £13,400m.

Step 3: Combined carbon intensity = 2,270 ÷ 13,400 = 0.1694, which rounds to 0.17.

The answer is 0.17.',
  difficulty = 'hard'
WHERE id = 'fde93641-5b4b-4dfe-95c6-b3fa86b4e17a';

-- qr4-s07-q2: Total protein from a 50g serving of each of the five cereals
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'A consumer eats a 50 g serving of every cereal each day. What is the total daily protein intake from the five cereals combined, in grams?',
  options = '[{"text":"18g","label":"A"},{"text":"22g","label":"B"},{"text":"25g","label":"C"},{"text":"30g","label":"D"},{"text":"44g","label":"E"}]',
  correct_answer = 'B',
  answer_reason = 'For each cereal, protein in 50 g = (protein per 100 g) × 0.5.

Step 1: Oat Crunch = 11 × 0.5 = 5.5 g.

Step 2: Wheat Flakes = 10 × 0.5 = 5.0 g.

Step 3: Bran Bites = 9 × 0.5 = 4.5 g.

Step 4: Honey Puffs = 6 × 0.5 = 3.0 g.

Step 5: Granola Mix = 8 × 0.5 = 4.0 g.

Step 6: Total = 5.5 + 5.0 + 4.5 + 3.0 + 4.0 = 22.0 g.

The answer is 22g.',
  difficulty = 'hard'
WHERE id = '27709872-beb5-4f9b-833a-240728ce0883';

-- qr4-s08-q2: % of students studying English, Humanities or Arts
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'What percentage of all students study English, Humanities or Arts, to one decimal place?',
  options = '[{"text":"34.2%","label":"A"},{"text":"42.5%","label":"B"},{"text":"51.7%","label":"C"},{"text":"60.0%","label":"D"},{"text":"68.3%","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Sum the three relevant segments: English 320 + Humanities 210 + Arts 90 = 620 students.

Step 2: Express as a percentage of the 1,200 total: 620 ÷ 1,200 × 100 = 51.67%, which rounds to 51.7%.

The answer is 51.7%.',
  difficulty = 'normal'
WHERE id = '05466af8-c060-460b-ad1d-ab59492edf35';

-- qr4-s12-q1: Annual cost gap between Lite and Premium plans at 50 GB/month
UPDATE public.timed_quantitative_reasoning_questions SET
  stem = 'A customer compares the Lite and Premium plans for one year, using exactly 50 GB of data each month. Calculating costs before VAT, by how much is the cheaper plan less expensive over the full year, to the nearest pound?',
  options = '[{"text":"£840","label":"A"},{"text":"£1,440","label":"B"},{"text":"£1,980","label":"C"},{"text":"£2,160","label":"D"},{"text":"£2,400","label":"E"}]',
  correct_answer = 'C',
  answer_reason = 'Step 1: Lite plan monthly cost = £8.00 line rental + (50 − 2) GB × £4.00 excess = £8.00 + £192.00 = £200.00. Annual = £200.00 × 12 = £2,400.

Step 2: Premium plan monthly cost = £35.00 line rental, no excess (unlimited data). Annual = £35.00 × 12 = £420.

Step 3: Premium is cheaper. Difference = £2,400 − £420 = £1,980.

The answer is £1,980.',
  difficulty = 'hard'
WHERE id = '29bf5722-db64-4ac9-80ac-6e6bb52ae481';
