-- Refine timed DM answer reasonings to tutor-voice style per UCAT-DM-VALIDATOR.md Step 8.
-- Also fixes UTF-8 mojibake (Â£ -> £, Â -> — or similar) in option_text, stems, and existing reasonings.
-- Scope:
--   1. Encoding fixes on timed_decision_making_question_options.option_text
--   2. Encoding fixes on timed_decision_making_questions.stem + table_data
--   3. Full rewrite of timed_decision_making_questions.answer_reason for MCQ types
--   4. Full rewrite of timed_decision_making_question_statements.answer_reason for Yes/No types

BEGIN;

-- =====================================================================
-- SECTION 1: UTF-8 encoding fixes on option_text (£ values)
-- =====================================================================

UPDATE "public"."timed_decision_making_question_options" SET option_text = '£96'  WHERE id = '2e3c8108-19b8-437c-ae65-4bd979c2e7eb';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£132' WHERE id = '8a4529f7-06a3-468f-b00d-cb82f010dbea';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£86'  WHERE id = 'adda8b70-632a-497a-a56f-72d10f8e694d';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£116' WHERE id = 'b7f7506f-fa9b-444e-844e-fc84b91a91be';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£40'  WHERE id = '376ccddd-fdab-4a7a-8305-3d9925089ee4';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£60'  WHERE id = 'a541e520-b202-4ef6-9e58-f9653c75d4c1';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£80'  WHERE id = 'ad9453c6-92c9-4450-8e40-35f8ea6a570b';
UPDATE "public"."timed_decision_making_question_options" SET option_text = '£90'  WHERE id = 'c8253add-62af-4518-8a38-ed6285d926c2';

-- =====================================================================
-- SECTION 2: UTF-8 encoding fixes on question stems + table_data
-- =====================================================================

-- Charity Fundraiser Amounts stem (£450 mojibake)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Five colleagues — Amy, Ben, Carol, Dave, and Emma — each raise a different amount for a charity event. The following is known:

- The total raised by all five is £450.
- Amy raises £30 more than Dave.
- Ben raises twice as much as Carol.
- Emma raises £50.
- Carol raises £20 less than Dave.

How much does Amy raise?'
WHERE id = '845ed4c0-f8d6-4c42-97f2-4af4b6d6db8e';

-- School Fundraiser Budget stem (£180, £20 mojibake + bullets)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A school is organising a fundraiser with three stalls: Cakes, Games, and Crafts. The following information is known:

• The total budget across all three stalls is £180.
• The Games stall receives twice as much budget as the Crafts stall.
• The Cakes stall receives £20 more than the Crafts stall.

How much budget does the Games stall receive?'
WHERE id = '9d524579-acdb-4a0b-b6e2-b8b9561f8724';

-- Science Fair Project Budget stem (£50, £75, £100 mojibake)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Three students — Kai, Leah, and Marta — are each allocated a budget of £50, £75, or £100 for their science fair projects (each amount used exactly once). They also each choose a different topic: biology, chemistry, or physics.

- The student with the £100 budget chose chemistry.
- Kai has a larger budget than Leah.
- Marta did not choose biology.
- The biology project has the smallest budget.

What is Leah''s project topic?'
WHERE id = 'd3dc29cd-387a-4d06-bef0-7e40d5511af4';

-- Solar Panel Installation Report stem (£620, £410 mojibake)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A local council report states the following:

"In 2024, 340 households in Borough X had solar panels installed. Of these, 210 were installed on south-facing roofs and 130 on east- or west-facing roofs. Households with south-facing installations reported an average annual energy saving of £620, while east/west installations reported an average saving of £410. The council projects that if installation rates double by 2026, the borough will achieve carbon-neutral status for residential electricity by 2030."'
WHERE id = '4dcd2bbb-a497-4a11-be26-885a370bd2ee';

-- Urban Green Spaces Study stem (£2 million mojibake)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A local council commissioned a study examining the relationship between urban green spaces and residents'' self-reported wellbeing. Researchers surveyed 2,000 adults living in a mid-sized city. Participants were asked how often they visited green spaces (parks, gardens, nature reserves) per week and were given a validated wellbeing questionnaire scored from 0 to 100.

The results showed that participants who visited green spaces four or more times per week had an average wellbeing score of 74, compared to 61 for those who visited once or fewer times per week. Among those who visited frequently, 68% reported that they exercised during their visits. The study also found that areas with more green space per capita tended to have higher average household incomes.

The council noted that 40% of the city''s green spaces are located in the three wealthiest boroughs, while the five least affluent boroughs share 15% of total green space. The council plans to invest £2 million into creating new parks in underserved areas over the next three years.'
WHERE id = '5a556bed-1992-45f2-91d8-9fd37c5ebfd6';

-- Gym Membership Revenue table_data header (£k mojibake)
UPDATE "public"."timed_decision_making_questions"
SET table_data = '{"rows":[["Basic","30","28","26","24","800"],["Standard","45","48","50","54","600"],["Premium","60","58","62","64","320"],["Student","12","8","6","14","350"]],"headers":["Membership Type","Q1 Revenue (£k)","Q2 Revenue (£k)","Q3 Revenue (£k)","Q4 Revenue (£k)","Members (Q4)"]}'
WHERE id = 'c96f63d4-80a2-4303-9a4b-3c5a2ef0a9c8';

-- Greenhouses stem (– mojibake) -- Botanical Garden Layout
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Five greenhouses (1–5) in a row must each display a different plant family: Ferns, Orchids, Palms, Succulents, and Cacti.

• Orchids are in greenhouse 3.
• Ferns are in a lower-numbered greenhouse than Palms.
• Succulents are not adjacent to Orchids.
• Cacti are in greenhouse 1 or greenhouse 5.

Which of the following must be true?'
WHERE id = '88745375-b6e4-4763-8a4e-2496d9c93dbb';

-- Railway Carriage Allocation stem (1–6 mojibake)
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A train has 6 carriages numbered 1–6 from front to back. Four passengers — Anna, Ben, Chloe, and Dan — must each be assigned to a different carriage.

• Anna''s carriage number is exactly 2 more than Ben''s.
• Chloe is in a higher-numbered carriage than Dan.
• Dan is not in carriage 1.
• Ben is in an odd-numbered carriage.

Which of the following must be true?'
WHERE id = '9645015c-1360-4fbe-85ca-87312d347dc1';

-- Library Reading Room Assignment stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Four students — K, L, M, and N — are each assigned to one of three reading rooms: Arts, Sciences, or Humanities. Each room must have at least one student.

• K and L are in the same room.
• M is in the Sciences room.
• N is not in the same room as K.

Which of the following must be true?'
WHERE id = '14d7fe0e-d384-4364-b994-66b2f526cb52';

-- Lighthouse Keeper Shifts stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Four lighthouse keepers — Grace, Henry, Isla, and James — each work exactly one shift: Dawn, Morning, Afternoon, or Night (in that time order).

• Grace works an earlier shift than Henry.
• Isla does not work the Dawn or Night shift.
• James works the shift immediately after Isla.
• Henry does not work the Afternoon shift.

Which of the following must be true?'
WHERE id = '599b8332-152f-413c-86cb-22dc5917016b';

-- Library Reading Group Seating stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Five members of a library reading group — Fiona, George, Hannah, Ian, and Julia — sit in a row of five chairs numbered 1 to 5 from left to right. The following conditions apply:

• Fiona sits in chair 1.
• George sits in chair 5.
• Hannah sits immediately next to Ian.
• Julia does not sit in chair 1 or chair 5.

Which of the following is a possible seating arrangement from chair 1 to chair 5?'
WHERE id = '99a7f8e1-2fd5-4502-998f-2ffeffbcd68a';

-- Volunteer Rota Assignment stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Four volunteers — Priya, Quinn, Raj, and Suki — must each be assigned to exactly one of four different tasks at a community centre: Reception, Kitchen, Stockroom, and Events. The following conditions apply:

• Priya cannot be assigned to Kitchen or Stockroom.
• Quinn cannot be assigned to Reception or Stockroom.
• Suki is assigned to Reception.

Which of the following must be true?'
WHERE id = '5434e16d-6822-4845-9c3e-4bb290f1e7fd';

-- Office Seating Plan stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Four colleagues — Amy, Ben, Clara, and Dev — sit around a square table, one on each side (North, South, East, West). The following conditions apply:

• Amy sits directly opposite Ben.
• Clara does not sit on the North or East side.
• Dev sits on the East side.

Who sits on the West side?'
WHERE id = 'ac818ab4-e9e0-4e5e-b46c-71aae32d5840';

-- Meeting Room Booking stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A company has four meeting rooms available for booking on Friday. The four teams, their sizes, and available rooms are:

Team Alpha: 11 members — can use Room 1 or Room 4
Team Beta: 5 members — can use Room 2 or Room 3
Team Gamma: 14 members — can use Room 4 only
Team Delta: 7 members — can use Room 1 or Room 2

Room 1 seats 12, Room 2 seats 8, Room 3 seats 6, and Room 4 seats 16. Each room is booked by exactly one team. A team must use a room that seats all its members.

Which room does Team Alpha book?'
WHERE id = 'd4014fcb-2342-4315-83af-9782a42ac387';

-- Truth or Bluff stem (the — after "different")
UPDATE "public"."timed_decision_making_questions"
SET stem = 'Three friends — Liam, Mia, and Noah — each either always tells the truth or always lies. They make the following statements:

Liam: "Mia is a liar."
Mia: "Noah and I are different — one of us tells the truth and the other lies."
Noah: "Liam is a truth-teller."

How many of the three are truth-tellers?'
WHERE id = 'e5103c94-b898-44d1-9248-c77fd5bd758e';

-- Sports Centre Memberships stem (not needed, no mojibake, skip)

-- Vaccination Rates table_data header (age ranges)
UPDATE "public"."timed_decision_making_questions"
SET table_data = '{"rows":[["50–59","32","45","8","12"],["60–69","48","62","35","28"],["70–79","71","78","52","45"],["80+","82","85","61","58"]],"headers":["Age Group","Flu","COVID Booster","Shingles","Pneumococcal"]}'
WHERE id = 'b9856ab0-1d01-43dc-bb83-05c3a845a29b';

-- Bread Sales by Season table_data (Q1 (Jan–Mar) etc.)
UPDATE "public"."timed_decision_making_questions"
SET table_data = '{"rows":[["White","4.2","3.8","3.5","4.8"],["Wholemeal","2.6","2.9","3.1","2.4"],["Sourdough","1.8","2.2","2.5","2.1"],["Rye","0.9","0.7","0.6","1.2"]],"headers":["Bread Type","Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"]}'
WHERE id = 'e5d42783-9e41-426d-8000-3c47111ee11e';

-- Hospital Bed Occupancy stem (dash in 'critical pressure' — none needed; skip)

-- School Fair team selection stem
UPDATE "public"."timed_decision_making_questions"
SET stem = 'A teacher is selecting a team of 3 students from the following candidates for a relay race. The table shows each student''s attributes:

The following conditions must all be met:

• The team must include at least one student from Year 10 and at least one from Year 11.
• No two students on the team may prefer the same leg.
• The combined sprint time of the team must be under 39.2 seconds.

Which of the following is a valid team?'
WHERE id = 'f6762570-d857-4c57-8052-cf6782ea2718';

COMMIT;

-- =====================================================================
-- SECTION 3: MCQ answer_reason rewrites (tutor-voice, per validator Step 8)
-- =====================================================================
-- Note: Run in a separate transaction below so section-2 fixes are already committed
--       if anything in section 3 needs to be re-run.

BEGIN;

-- --- PROBABILISTIC (simple 1-2 sentence calcs, named pattern up front) ---

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a law-of-total-probability question: weight each oven''s undercooked rate by the share of loaves it bakes. Oven A: 0.70 × 0.02 = 0.014. Oven B: 0.30 × 0.06 = 0.018. Add them: 0.014 + 0.018 = 0.032 = 3.2%. The trap here is taking a simple average of 2% and 6% (= 4%) — you must weight by how many loaves each oven produces. The answer is A (3.2%).'
WHERE id = '015e0b07-a37f-43f3-8c80-ee5c8e0695a2';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Weight each machine''s defect rate by how many items it makes, then add. Machine X: 800 × 0.03 = 24 defects. Machine Y: 400 × 0.05 = 20 defects. Total = 44. Watch for the averaging trap — multiplying 1,200 by a blended 4% gives 48, which is wrong because the machines don''t produce equal numbers. The answer is C (44).'
WHERE id = '12130eac-f022-4ab0-a119-ffae3ce176c5';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is an "or" probability, so use P(A or B) = P(A) + P(B) − P(both). P(die = 6) = 1/6. P(spinner = 4) = 1/4. These are independent, so P(both) = 1/6 × 1/4 = 1/24. Over a common denominator of 24: 4/24 + 6/24 − 1/24 = 9/24 = 3/8. The trap is adding without subtracting the overlap, which would double-count the "6 and 4" case. The answer is A (3/8).'
WHERE id = '13eedf33-dffb-4e4d-9193-ead1f0f9572a';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'For independent events "all happen", multiply the individual probabilities. Each seed germinates with P = 0.7, so P(all 5) = 0.7^5 = 0.16807, about 16.8%. The classic traps are here as distractors: 70% is the chance for one seed, 30% is the chance one fails, and 50% comes from nowhere. The answer is D (16.8%).'
WHERE id = '18f10ed6-11a8-4dd3-93af-c928b21a51a2';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a Bayesian / base-rate question — a positive test for a rare condition is usually a false positive. Work in a hypothetical 10,000 patients. 50 have the condition (1/200); 98% test positive = 49 true positives. The other 9,950 do not have it; 5% still test positive = ~498 false positives. So of the ~547 positives, only 49 truly have it: 49/547 ≈ 9%. The trap is reading the sensitivity (98%) as "chance you have it when positive" — that ignores the tiny base rate. The answer is A (about 9%).'
WHERE id = '1e19fe3d-874d-4321-9b30-1616d0705d9c';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is an "or" probability. Primes in 1–8: 2, 3, 5, 7 (four numbers). Greater than 6: 7, 8 (two numbers). Take the union, counting 7 once: {2, 3, 5, 7, 8} = five outcomes out of 8. Probability = 5/8. The trap is adding 4 + 2 = 6 favourable (counting 7 twice) and landing on 3/4 — always subtract the overlap. The answer is B (5/8).'
WHERE id = '2683b1f4-352c-473f-8d7e-c625cb374abf';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Law of total probability across three suppliers — weight each defect rate by that supplier''s share. X: 0.50 × 0.04 = 0.020. Y: 0.30 × 0.06 = 0.018. Z: 0.20 × 0.03 = 0.006. Total = 0.044 = 4.4%. Don''t just average the three rates (that gives ~4.3% only by coincidence and breaks on other weightings). The answer is B (4.4%).'
WHERE id = '2e304911-bd52-4c34-99cb-90fcd2a67abc';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a conditional probability with non-replacement. You''re told the first draw is dark, so work with the remaining pool: 2 dark chocolates left out of 9 total. P = 2/9. The traps are labelled: 3/10 ignores the draw, 3/9 forgets to subtract one dark, and 2/10 forgets to reduce the total. The answer is B (2/9).'
WHERE id = '308dfdb6-3226-4559-8e9d-681fb14909e9';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'"At least one" is fastest via the complement: 1 − P(neither succeeds). P(roll > 4 on one die) = 2/6 = 1/3, so P(not > 4) = 2/3. Both rolls fail with probability 2/3 × 2/3 = 4/9. Therefore P(at least one > 4) = 1 − 4/9 = 5/9. The "add the two rolls" trap gives 2/3 and the "both succeed" trap gives 1/9 — both appear as distractors. The answer is C (5/9).'
WHERE id = '47f67d8e-e0fa-497c-8254-e7abc0b6f40f';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Simple "or" with disjoint events, so no overlap to subtract. P(A) = 130/500 and P(B) = 90/500. Add: (130 + 90)/500 = 220/500 = 0.44 = 44%. The distractors are there to catch careless errors: 22% halves it, 56% uses the wrong blood types, 26% counts only type A. The answer is B (44%).'
WHERE id = '4bea70fd-74a1-4ed0-a9ea-995eaa806ccf';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'"Same colour" means add up three disjoint outcomes — both red, both blue, or both green — using combinations because the draw is without replacement. Total pairs C(10,2) = 45. Both red C(5,2) = 10. Both blue C(3,2) = 3. Both green C(2,2) = 1. So 14/45. The trap is trying to use ordered probabilities (5/10 × 4/9 etc.) and forgetting to add the three cases. The answer is D (14/45).'
WHERE id = '6ebf9868-a8ab-48ca-bba5-8486cffaef03';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Law of total probability — split by whether a passenger was selected. Selected and prohibited: 0.08 × 0.15 = 0.012. Not selected and prohibited: 0.92 × 0.02 = 0.0184. Add: 0.012 + 0.0184 = 0.0304 = 3.04%. The trap is using only the 15% figure (that''s conditional on being selected, not the overall rate). The answer is A (3.04%).'
WHERE id = '75939143-0e29-484f-b80b-13744f19b48b';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a classic base-rate question — don''t confuse the test''s 92% accuracy with the chance a positive person actually has the allergy. True positives: 50 × 0.92 = 46. False positives from the 950 without the allergy: 950 × 0.08 = 76. Total positives: 122. So P(allergy | positive) = 46/122 ≈ 37.7%. The "92%" trap (answer A) is base-rate neglect — it forgets that false positives from a large healthy group swamp the true positives. The answer is B (37.7%).'
WHERE id = '865ff1cc-ec9e-4983-b594-d3e053281077';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two independent "AND" events, so multiply. P(wait < 5 min) = 1/3. P(on time) = 4/5. P(both) = 1/3 × 4/5 = 4/15 ≈ 26.7%. The distractors are each event on its own (80% or 33.3%) — don''t pick either without combining. The answer is A (26.7%).'
WHERE id = '8c30f317-c442-4c34-997c-9728e01e0a95';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Non-replacement, so the second draw depends on the first. P(1st red) = 6/12 = 1/2. Given one red is gone, P(2nd red) = 5/11. Multiply: 1/2 × 5/11 = 5/22. The 1/4 trap treats this as with-replacement (6/12 × 6/12); the 5/12 trap forgets to reduce the denominator after the first draw. The answer is B (5/22).'
WHERE id = '9712bbff-eaf5-4ba2-bfda-fd1fa0fafb03';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Law of total probability — weight each line''s defect rate by its share. Line A: 0.60 × 0.03 = 0.018. Line B: 0.40 × 0.05 = 0.020. Total: 0.038 = 3.8%. Don''t simple-average 3% and 5% to get 4% — that ignores the 60/40 split. The answer is B (3.8%).'
WHERE id = '9a46dfe0-329e-4de2-9046-7a750c97b300';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a binomial question: "exactly 2 of 3" uses C(3,2) × p^2 × (1−p)^1. So 3 × 0.6^2 × 0.4 = 3 × 0.36 × 0.4 = 0.432 = 43.2%. The distractors collect the usual mistakes: 0.6^2 alone (36%, forgetting the third match and the combinations), P(at least 2) = 64.8%, and P(all 3) = 21.6%. The answer is A (43.2%).'
WHERE id = 'b75eff78-4d82-44a1-8c23-8e6c39a774a4';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Another "or" probability with overlap. P(ace) = 4/52 = 1/13. P(heads) = 1/2. Independent, so P(both) = 1/13 × 1/2 = 1/26. Over 26ths: 2/26 + 13/26 − 1/26 = 14/26 = 7/13. Forgetting to subtract the overlap gives 15/26 — a common trap, so always deduct the "both" case in inclusive-or sums. The answer is B (7/13).'
WHERE id = 'be2e7032-3ef9-470a-a9cf-61c5b2830e15';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Conditional probability: P(practical | written) = P(both) / P(written) = 60/75 = 4/5 = 80%. The key is to divide by "written" (75), not by the whole class (120) — that would be joint probability, not conditional. The answer is C (80%).'
WHERE id = 'bfb7f66a-9291-498e-98b5-24abebd69073';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Conditional probability, same structure: P(writing | speaking) = P(both) / P(speaking) = 50/90 ≈ 0.556 ≈ 56%. Don''t divide by the total of 150 — the condition "enrolled in speaking" fixes the denominator at 90. The answer is B (56%).'
WHERE id = 'c1492293-c6ee-47a9-8685-914edd2b5c4e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Law of total probability — split by whether there was heavy traffic. Traffic and delayed: 0.20 × 0.70 = 0.14. No traffic and delayed: 0.80 × 0.15 = 0.12. Add: 0.26 = 26%. The 70% trap is the rate given traffic — ignoring that traffic itself only happens 20% of the time. The answer is B (26%).'
WHERE id = 'c50b4609-428b-4e00-9876-6bf142d77862';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Without replacement, so chain the two conditional probabilities. 40 of the 200 tickets win a prize. P(1st wins) = 40/200. P(2nd wins | 1st won) = 39/199. Multiply: (40 × 39) / (200 × 199) = 1,560 / 39,800 ≈ 0.0392 ≈ 3.9%. The 4.0% distractor is the with-replacement shortcut (40/200 × 40/200) — always reduce the denominator for "without replacement". The answer is B (3.9%).'
WHERE id = 'ce65c3ae-f7f0-4980-bb50-a74cb9baeb2f';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The trap here is the accuracy-vs-precision distinction. Accuracy measures whether the test gives the correct answer; precision measures whether repeated tests agree with each other — they are not interchangeable. The test is 92% accurate at detecting the condition (sensitivity) and 88% accurate at ruling it out (specificity). 92% > 88%, so Dr. Shah is correct — option A states exactly that comparison. Option B conflates the 95% precision with accuracy. Option C flatly says they''re the same, which is false. Option D relabels the 88% as precision when it is actually the specificity figure. The answer is A.'
WHERE id = 'cec3c174-949b-427e-bad0-bf9b8d2f9d2e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'"At least one late" is cleanest via the complement — find "both on time" and subtract from 1. Both on time: 0.80 × 0.75 = 0.60. So at least one late = 1 − 0.60 = 0.40 = 40%. The 5% trap is "both late" (0.20 × 0.25). The 45% trap adds the late rates (20% + 25%) — you can''t add probabilities of events that aren''t mutually exclusive. The answer is B (40%).'
WHERE id = 'cf58fca0-2498-45fb-952e-76c7e154c147';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The 3:2 ratio means Type X is 3/5 = 60% of production and Type Y is 2/5 = 40%. Weighted defect rate = 0.60 × 3% + 0.40 × 5% = 1.8% + 2.0% = 3.8%. Don''t take a plain average (4.0%) — it ignores the production split. The answer is A (3.8%).'
WHERE id = 'e1a2f464-a7e0-42b6-915d-e0b44f737f18';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Law of total probability, split by rain. Rain and delay: 0.30 × 0.60 = 0.18. No rain and delay: 0.70 × 0.10 = 0.07. Add: 0.25 = 25%. The 60% trap is the conditional rate given rain — ignore it alone and you overcount. The answer is C (25%).'
WHERE id = 'ec250d7c-e142-452d-998a-4716ab29b9ad';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Base-rate question — beware the 95% sensitivity. Using a hypothetical 10,000 donors: 200 are infected (2%); 95% of those test positive = 190 true positives. The other 9,800 are fine; 10% (100% − 90% specificity) still test positive = 980 false positives. P(infected | positive) = 190 / (190 + 980) = 190/1,170 ≈ 16%. The "95%" distractor is base-rate neglect in its purest form. The answer is A (about 16%).'
WHERE id = 'f3576d6b-4a16-4216-b928-fd71a5b5873a';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'"Same colour" = sum of three disjoint two-of-a-kind outcomes, using combinations. Total pairs C(25,2) = 300. Both gold C(8,2) = 28. Both silver C(12,2) = 66. Both bronze C(5,2) = 10. Same colour = 104. Probability = 104/300 = 26/75. Always list the disjoint cases first before computing — it is easy to forget the bronze pair. The answer is A (26/75).'
WHERE id = 'fc746f4c-bc29-4e5b-a3cb-b741208271db';

COMMIT;

-- =====================================================================
-- SECTION 4: LOGIC PUZZLE answer_reason rewrites
-- =====================================================================

BEGIN;

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the most constrained clue — the total tiebreaker count — because only one neighbourhood has excess volunteers. Each neighbourhood needs 3 members; count volunteers per neighbourhood: North has 3 (2M+1W), East has 3 (1M+2W), West has 3 (1M+2W), South has 4 (3M+1W). So South is the only neighbourhood with more volunteers than places — that is where the tiebreaker is held. Option A (Amir, Ben) picks North, C (Jess, Karen) picks East, D (Nina, Olivia) picks West — all three neighbourhoods exactly fit and need no tiebreaker. The answer is B — Ethan, Finn and George attend the tiebreaker, as they are the three South men competing for two spots (Hannah is auto-selected as the only woman).'
WHERE id = '0b88d367-3d08-484d-b99f-5e5a9ada96bf';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The fastest opening is Sara — she is directly assigned Plant Growth, removing one project from everyone else''s options. That forces Priya onto Volcanoes (she cannot take Robotics or Solar System, and Plant Growth is gone). Ravi then cannot take Solar System and Plant Growth/Volcanoes are taken, so Ravi must take Robotics. Only Solar System is left for Tom. The "Tom does not choose Volcanoes" clue is a red herring once Sara''s pick cascades. The answer is B — Tom chooses Solar System.'
WHERE id = '0c0b7b35-8f3b-4e3c-9712-ba01878c9d18';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the fixed placements: Hana is on the morning shift, and the question fixes George on afternoon. Now apply Fiona''s two constraints: she cannot work morning (rule 5) and cannot be with George (rule 2), so she is forced onto the night shift. That is already the answer before you even place Ivan. Ivan just has to differ from Hana, so he is on afternoon or night — but Fiona''s night placement is fixed regardless. Option A (Fiona morning) violates rule 5; B (Ivan afternoon) is possible but not required; D (not shown) would need equal certainty. The answer is C — Fiona is on the night shift.'
WHERE id = '0dc9e284-c8cf-4382-aab5-92858dbcf0ac';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The fastest route is to check which arrangements satisfy all three "at least one room" constraints. M is fixed in Sciences. K and L share a room, and N must not be with K. Three rooms need to be filled, so if N joined M in Sciences, nobody would fill the third room — invalid. N must therefore be alone in whichever room K and L do not take. Arrangement 1: K, L in Arts; N in Humanities. Arrangement 2: K, L in Humanities; N in Arts. In both, N is the only person in their room — that is the one fact that must hold. Option A works only in arrangement 1; C works only in arrangement 1; D works only in arrangement 2. The answer is B — N is the only student in their reading room.'
WHERE id = '14d7fe0e-d384-4364-b994-66b2f526cb52';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The quickest opening is to pin down the fixed combinations. Two colleagues chose chicken, with different desserts — so at most one of them can have cake. One colleague chose fish with fruit (no cake). The fourth chose vegetarian, and "nobody chose vegetarian with yoghurt" leaves them with cake or fruit. So the maximum possible cake count is: one chicken + cake, and one vegetarian + cake, giving 2. You cannot get 3 because fish is locked to fruit, and cannot get 4 because the two chicken picks must be distinct. The answer is B — at most 2 colleagues chose cake.'
WHERE id = '1a185176-c44f-4d2e-b980-4ba7d0bcdd55';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is an average/algebra puzzle — start with the total. 10 pupils × 4.4 = 44 detentions. Subtract the known pupils: (4×4) + (2×2) + 1 = 21. That leaves 44 − 21 = 23 for Charlie, Marie and Robert. Let Charlie = C; then Marie = C + 2 and Robert = C + 3 (since Marie is one fewer than Robert). So C + (C + 2) + (C + 3) = 23 → 3C = 18 → C = 6. That gives Marie = 8, Robert = 9. A (6) and C (8) are the other two pupils'' totals — traps if you pick the wrong name. B (7) comes from miscalculating the offsets. The answer is D — Robert receives 9 detentions.'
WHERE id = '3c1843f4-6358-4660-a21a-d5b4a6f3ea3a';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the fixed assignment — Suki is in Reception, so the other three fill Kitchen, Stockroom, Events. Priya cannot do Kitchen or Stockroom, so Priya is forced onto Events. Quinn cannot do Reception (taken) or Stockroom, and Events is now taken, so Quinn takes Kitchen. Raj takes the only remaining task: Stockroom. That gives you the unique assignment. Option A (Quinn → Events) is wrong — Quinn is in Kitchen. Option C (Priya → Kitchen) is ruled out by the first constraint. Option D (Raj → Events) is wrong — Events is Priya''s. The answer is B — Raj is assigned to Stockroom.'
WHERE id = '5434e16d-6822-4845-9c3e-4bb290f1e7fd';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with Isla — she is the most constrained keeper (only Morning or Afternoon). Case 1: Isla = Morning → James = Afternoon (immediately after), leaving Dawn and Night for Grace and Henry. Grace < Henry forces Grace = Dawn, Henry = Night. Case 2: Isla = Afternoon → James = Night, leaving Dawn and Morning for Grace and Henry. Henry ≠ Afternoon is satisfied; Grace < Henry gives Grace = Dawn, Henry = Morning. Both valid arrangements have Grace on Dawn, so that is the only fact that must be true. Option A is only true in Case 1; B fails in Case 2 (James is after Henry there); D is only true in Case 1. The answer is C — Grace works the Dawn shift.'
WHERE id = '599b8332-152f-413c-86cb-22dc5917016b';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the fixed placement: hamper = gold (from the question''s "if"). The voucher cannot be red, green, or silver, and gold is gone, so voucher = blue. The remaining colours for the bottle, teddy and plant are red, green and silver. The bottle takes the first alphabetically among those three — green. The teddy cannot be silver, so teddy = red, leaving silver for the plant. The answer is C — the plant is wrapped in silver.'
WHERE id = '5a665fe0-aac4-43ee-81d4-e98362b040c9';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is an algebra puzzle — set up variables from the smallest unknown. Let Dave = D. Then Amy = D + 30, Carol = D − 20, Ben = 2 × Carol = 2D − 40, Emma = £50. Sum: (D + 30) + (2D − 40) + (D − 20) + D + 50 = 5D + 20 = 450, so D = 86. Amy = 86 + 30 = £116. Sanity-check: Dave £86 + Carol £66 + Ben £132 + Emma £50 + Amy £116 = £450 ✓. Options A (£86 = Dave) and D (£132 = Ben) are the other named amounts — traps if you solve for the wrong person. The answer is C — Amy raises £116.'
WHERE id = '845ed4c0-f8d6-4c42-97f2-4af4b6d6db8e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the most constrained greenhouses. Orchids = 3, Cacti = 1 or 5, Succulents not adjacent to Orchids (so not 2 or 4), and Ferns < Palms. If Cacti = 1, Succulents must be in 5 (the only non-adjacent slot), forcing Ferns = 2 and Palms = 4. If Cacti = 5, Succulents = 1, and again Ferns = 2, Palms = 4. In both valid arrangements Ferns is in greenhouse 2 — that is the only fact guaranteed. Option A could be wrong (Cacti could be 5), C could be wrong (Succulents could be 1), D isn''t always true (in arrangement 1, Palms 4 and Cacti 1 aren''t adjacent). The answer is B — Ferns are in greenhouse 2.'
WHERE id = '88745375-b6e4-4763-8a4e-2496d9c93dbb';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a truth-teller puzzle — test each assumption against the constraint that exactly 2 of the three are honest (since Ivan is honest and says so). Assume George is honest: his claim "Holly and I are both honest" is true, so Holly is also honest, which makes Faye the single liar. Check: Faye lies when she says "George is dishonest" — consistent. Holly truthfully says "Faye is dishonest" — consistent. ✓ Now test the alternative: if George is a liar, his statement is false, which would need Faye and Holly to both be honest; but then Holly honestly claims "Faye is dishonest", contradicting Faye being honest. Contradiction. So George and Holly are honest and Faye is the odd one out. The answer is A — Faye is dishonest.'
WHERE id = 'cdb96cad-0d72-44e1-94d6-352c4fe891dd';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the strictest constraint — Ben must be in an odd carriage. Anna = Ben + 2, so Ben = 5 would force Anna = 7 (impossible in 6 carriages). Ben is therefore 1 or 3 — and this is the only fact that must always hold. Option B (Anna in carriage 5) only works if Ben = 3 — not guaranteed. Option C (Chloe > Anna) fails if Ben = 3, Anna = 5 and Chloe = 4 < 5. Option D (Dan in an even carriage) is not forced — Dan could be 5 while Ben = 1, Anna = 3. The answer is A — Ben is in carriage 1 or carriage 3.'
WHERE id = '9645015c-1360-4fbe-85ca-87312d347dc1';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The fastest route is to test each option against all the rules rather than building arrangements from scratch. Fiona is in chair 1 and George in chair 5, so any option that misplaces them is dead. Option B puts George in chair 4 — fails. Option D puts George in chair 2 — fails. That leaves A and C. Check Hannah-next-to-Ian: in C, Ian is in 2 and Hannah in 4 — not adjacent, fails. In A: Fiona(1), Julia(2), Hannah(3), Ian(4), George(5) — Julia is not in chair 1 or 5 ✓, Hannah and Ian are adjacent ✓. The answer is A.'
WHERE id = '99a7f8e1-2fd5-4502-998f-2ffeffbcd68a';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a simultaneous-equations puzzle — start with the two unknowns you can isolate. Bourbons + custard creams = 50, and custard creams are 10 more than bourbons. So 2 × bourbons + 10 = 50 → bourbons = 20, custard creams = 30. Let ginger snaps = G. Shortbread = 2G; digestives = 2G + 20. Total: G + 2G + (2G + 20) + 20 + 30 = 5G + 70 = 200 → G = 26. Digestives = 2 × 26 + 20 = 72. A (52), B (66), D (78) are traps from miscounting the bourbon/custard pair or mis-setting shortbread. The answer is C (72 digestives).'
WHERE id = '8d31fd13-cbf3-4e1e-9d60-cc0e51315e06';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with Cheng — he is fixed on floor 2. Bella must be lower than Cheng, so Bella = floor 1. That leaves floors 3, 4 and 5 for Amir, Diana and Elias, with Amir < Diana and Elias not on 1 or 5. Elias ends up on 3 (the only non-end option left), then Amir < Diana forces Amir = 4 and Diana = 5. Option A places Diana too low (floor 2 is taken by Cheng), B is Bella''s floor, C is Amir''s. The answer is D — Diana is on floor 5.'
WHERE id = 'b569f20d-9cb5-4313-8deb-3cbe909a4bea';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with the student with only one possible room — Gamma (14 members) can only use Room 4 (16 seats). So Gamma takes Room 4, meaning Alpha (11 members) must take its other option, Room 1 (12 seats). Delta (7 members) has Room 1 or Room 2; Room 1 is now taken, so Delta = Room 2 (8 seats). Beta then gets Room 3 (6 seats, fits 5). Options B/C assign Alpha to rooms it isn''t allowed to use; D is blocked by Gamma. The answer is A — Team Alpha books Room 1.'
WHERE id = 'd4014fcb-2342-4315-83af-9782a42ac387';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Lock in the forced placements first. Biology has the smallest budget (£50), chemistry has the largest (£100), so physics = £75. Marta cannot take biology, so Marta takes chemistry or physics. If Marta = chemistry (£100), Kai > Leah means Kai = £75 (physics) and Leah = £50 (biology). If Marta = physics (£75), Kai > Leah means Kai = £100 (chemistry) and Leah = £50 (biology). In both branches Leah ends up with biology, so the answer is determined. The answer is A — Leah''s topic is Biology.'
WHERE id = 'd3dc29cd-387a-4d06-bef0-7e40d5511af4';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a pure algebra puzzle. Let Crafts = x. Then Games = 2x and Cakes = x + 20. Total: x + 2x + (x + 20) = 4x + 20 = 180, so x = 40. Games = 2 × 40 = £80. Sanity-check: Crafts £40 + Cakes £60 + Games £80 = £180 ✓. A (£40) and B (£60) are the other two stalls — traps if you solve for the wrong one. D (£90) doesn''t match any valid value. The answer is C — Games receives £80.'
WHERE id = '9d524579-acdb-4a0b-b6e2-b8b9561f8724';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The total is 7 cars across four zones with 1–2 cars each, and Green = Blue. Try Green = Blue = 1: then Red + Yellow = 5, but both are capped at 2, so max is 4 — impossible. So Green = Blue = 2, giving Red + Yellow = 3. Red > Yellow forces Red = 2 and Yellow = 1. That gives the only layout (2, 2, 2, 1), and Green holds 2 cars. Option A (1) is ruled out by the capacity check; C is a misread of the problem; D isn''t consistent with the rules. The answer is B — 2 cars.'
WHERE id = '9ebb0df5-3ac4-410f-b047-c65e25436a04';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Dev is on East (given). Amy and Ben are directly opposite each other — the only opposite-pairs on a square are North–South and East–West. Dev is already on East and is neither Amy nor Ben, so Amy and Ben cannot split East–West; they must take the North–South pair. That leaves West for Clara (and Clara cannot be on North or East anyway). Options A and B place Amy or Ben on West, contradicting the opposite-pair rule; D puts Dev on West, but he is on East. The answer is C — Clara sits on the West side.'
WHERE id = 'ac818ab4-e9e0-4e5e-b46c-71aae32d5840';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Start with Clara — fixed in seat 3. Ben cannot sit next to Clara, so Ben is not in seat 2 or 4 — Ben is in seat 1 or 5. Emma cannot sit at either end, so Emma is in seat 2 or 4. Test Ben = 5: Aisha (next to Ben) = 4, so Emma = 2 and Dan = 1 — but Dan must be further right than Emma, and 1 < 2, fails. Therefore Ben = 1, Aisha = 2, Emma = 4, Dan = 5. All four options describe single facts; only "Ben sits in seat 1" holds in the unique valid arrangement. The answer is A — Ben sits in seat 1.'
WHERE id = 'f7c280bf-b599-41d7-9e35-368c153212ec';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Screen each option against all three conditions — legs unique, both years represented, total time under 39.2s. Option A totals 13.2 + 12.8 + 13.5 = 39.5 — over 39.2, fails. Option C totals 13.0 + 12.9 + 13.5 = 39.4 — over 39.2, fails. Option D has Emma and Hassan both preferring the 1st leg — fails the unique-legs rule. Option B: Emma(Y10, 1st, 13.2), Farid(Y11, 2nd, 12.8), Jake(Y11, 3rd, 13.1) — legs are 1/2/3 (unique ✓), both Y10 and Y11 present ✓, total 39.1 < 39.2 ✓. The answer is B.'
WHERE id = 'f6762570-d857-4c57-8052-cf6782ea2718';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Work from the constraints that unambiguously pin one person. Assume Liam is honest: his statement "Mia is a liar" is true → Mia lies → her "Noah and I are different types" is false → Noah and Mia are the same type → Noah is also a liar. But then Noah''s claim "Liam is a truth-teller" is a lie — so Liam would actually be a liar, contradicting the assumption. Case fails. Now assume Liam is a liar: his statement "Mia is a liar" is false → Mia is honest → her statement is true → Noah and Mia differ → Noah is a liar. Noah''s "Liam is a truth-teller" is therefore a lie — consistent with Liam being a liar ✓. Unique solution: only Mia tells the truth. A (0) misses Mia; C (2) and D (3) both place Liam or Noah as honest, which breaks the chain. The answer is B — exactly 1 truth-teller.'
WHERE id = 'e5103c94-b898-44d1-9248-c77fd5bd758e';

COMMIT;

-- =====================================================================
-- SECTION 5: RECOGNISING_ASSUMPTIONS answer_reason rewrites
-- =====================================================================
-- Structure: open by naming what a strong argument must do (address both action AND outcome, evidence-based, broad scope, no unstated assumptions),
-- then walk each wrong option naming the criterion it fails, then name the winner.

BEGIN;

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument here has to connect the action (preventing under-16 accounts) to the outcome (child health/safety) with evidence, address the full group, and not smuggle in unstated assumptions. Option A is the next strongest: it cites enforceability data, but it addresses whether the policy works in practice rather than whether it would improve child outcomes — close, but a half-answer. Option B assumes parents cannot already manage screen time and focuses on parental convenience, not child outcomes — unsupported assumption. Option C is pure emotion (unhappy children) with no evidence. Option D names a specific published finding from a credible source, links it directly to the action, and connects to the outcome — all four criteria met. The answer is D.'
WHERE id = '012e6dc7-61bb-4524-935d-4988ce140a89';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (tax on ultra-processed foods) to the outcome (reduced consumption and health costs) with evidence. Option B is a reasonable counter with a real mechanism (regressive impact on low-income families), but it focuses on side-effects rather than whether the tax would achieve its health goal. Option C is a bare value-claim with no evidence. Option D is a principled objection ("government shouldn''t interfere") that engages with neither the evidence nor the outcome. Option A cites Mexico''s sugar tax with a specific 8% reduction figure and extends it to a comparable policy, hitting both the action and the outcome with data. The answer is A.'
WHERE id = '01624ca5-f350-443f-8bd9-bdb28b4643f2';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must tie the action (four-day week) to the outcome (productivity and wellbeing) with evidence covering the broad workforce. Option A raises a preference concern about some employees but provides no evidence on productivity or wellbeing — narrow scope. Option C is the strongest counter: it cites continuous-staffing costs in service industries with a concrete figure, but it addresses a sector-specific side-effect rather than the core productivity/wellbeing question. Option D is pure opinion with no data. Option B cites the Iceland trial involving over 2,500 workers, showing that productivity was maintained while wellbeing improved and sick leave dropped — it hits both halves of the proposition with specific evidence. The answer is B.'
WHERE id = '11b2edbd-4fc8-4da0-bd06-aa9ce3402591';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The proposition has two parts — introducing daily meditation (the action) and improving student concentration (the outcome). A strong argument must connect both with evidence. Option A talks about enjoying a break, which is the wrong outcome (enjoyment, not concentration). Option B is a narrow-scope worry about "some" untrained teachers — it''s about implementation, not whether meditation improves concentration. Option D mentions PE lessons as an alternative, which dodges the question about meditation''s effect. Option C cites studies showing meditation improves attention span and working memory — both mechanistically tied to concentration in academic tasks. Action and outcome, evidence-based, full group. The answer is C.'
WHERE id = '13a6695c-a24f-4a52-a206-2a326e600c7f';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (banning primary-school homework) to the outcome (improved wellbeing) with evidence, across the full group. Option A is a narrow parental-insight concern — it addresses a side-effect on parents, not child wellbeing. Option C assumes children would switch to screens without evidence, and only tangentially touches wellbeing. Option D hits both parts but is emotionally framed and restates that homework causes stress without supporting data. Option B cites large-scale educational studies showing no academic benefit at primary level alongside reduced stress and anxiety when homework is removed — action, outcome, evidence, broad scope all in one. The answer is B.'
WHERE id = '33808b60-5f28-4e68-8567-db8c1726667b';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must connect the action (banning energy drinks for under-16s) to the outcome (improving health) with evidence, across the full group. Option B is about parental authority — relevant, but the outcome in question is child health, not parent control. Option C narrows the scope to "older teenagers" and argues autonomy, not health. Option D addresses enforcement practicality — a side-effect of the action, not the health outcome. Option A cites a 40% higher rate of obesity and dental problems in under-16s who regularly consume energy drinks — directly tying the ban to the health outcome with evidence. The answer is A.'
WHERE id = '3a5f65e7-361f-488d-bad7-a2e57329734d';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (compulsory cooking in secondary schools) to the outcome (reduced obesity rates in young people) with evidence. Option A is a timetabling concern — about the action''s feasibility, not the obesity outcome. Option B broadens the outcome to "life skills", not obesity specifically. Option C is a strong counter about socioeconomic root causes of obesity, but offers no evidence that school cooking programmes actually fail — it argues from a principle. Option D cites schools that have run compulsory cooking programmes showing healthier choices and lower obesity versus control groups — direct evidence tying the action to the outcome. The answer is D.'
WHERE id = '627f93e9-2a35-45ea-bead-c9f654752e0e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (free transport for under-25s) to the outcome (reduced private-vehicle emissions) with evidence. Option A is emotional — cost-of-living concern, wrong outcome. Option B addresses a tax-burden concern about the action but not the emissions outcome. Option C is a reasonable counter citing pilot data, but it argues the policy doesn''t achieve the emissions goal — it''s the strongest anti-argument but still weaker than a direct positive link. Option D cites pilot schemes showing a shift from private journeys to public transport, directly lowering per-capita vehicle emissions in the target age group — exactly the mechanism the proposition is asking about. The answer is D.'
WHERE id = '68cec943-4b74-4009-8b0f-6329b3754c7f';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument here must link the action (mandatory solar panels on new homes) to the outcome (reducing household energy costs) with evidence. Option A talks aesthetics — wrong outcome entirely. Option B addresses purchase price, which is a different cost category from ongoing household energy bills. Option C focuses on preferences of "some" homeowners — narrow scope, doesn''t touch energy costs. Option D cites data from countries where solar panels are mandatory showing household electricity bills are 40% lower on average — direct, quantified evidence that the action produces the stated outcome. The answer is D.'
WHERE id = '696e10e1-de73-4a2b-8f17-a1367a66fefe';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must connect the action (banning cars during weekday mornings) to the outcome (reduced air pollution) with evidence. Option A discusses noise — wrong outcome. Option B focuses on commuter convenience — a side-effect, not pollution. Option D notes that some commuters already use public transport, which is about existing behaviour rather than whether the ban would reduce pollution. Option C cites data from cities with similar bans showing no citywide pollution reduction because traffic is simply displaced — it directly challenges the action-to-outcome link with evidence. The answer is C.'
WHERE id = '71cb725b-98c4-400d-b73e-49b7d0239575';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must connect the action (banning cars in city centres during peak hours) to the outcome (reduced air pollution and better health) with evidence. Option B is a weak personal-convenience claim — no data and wrong outcome. Option C is over-broad ("everywhere") — it doesn''t engage with the peak-hour, city-centre specifics. Option D is a reasonable counter with a specific figure (15% drop in footfall), but it addresses economic impact rather than the pollution outcome. Option A cites European cities showing 20–30% decreases in air pollution during peak-hour bans, with direct respiratory-health improvements — action, outcome and evidence in one. The answer is A.'
WHERE id = '7bbd0dea-19a8-43cb-b409-3258c7f12c24';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (making public transport free) to the outcome (reduced urban air pollution) with evidence. Option A is about equity for low-income residents — a different outcome. Option B uses "some" (narrow scope) and doesn''t address pollution levels. Option D addresses funding — a tangential side-effect, not pollution. Option C cites an 18% drop in private car usage and measurable nitrogen dioxide reductions in cities that have done this — direct evidence of action producing the pollution outcome. The answer is C.'
WHERE id = '7c000d11-879c-4055-b06a-1c8c8a5ff16c';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (abolishing standardised tests) to the outcome (improved educational outcomes) with evidence. Option A argues tests are useful to universities — relevant, but about a different outcome (admissions utility). Option C is emotional ("stressful") and addresses wellbeing rather than educational outcomes, using "many" (not the full group). Option D addresses implementation for "some schools" — narrow scope, tangential concern. Option B cites a specific 25% of lesson time spent on test prep limiting deeper learning — it ties the action to the educational-outcome claim with a quantified mechanism. The answer is B.'
WHERE id = '7e7107a2-987d-4619-9f87-455abc6666fd';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (compulsory voting) to the outcome (strengthened democratic representation) with evidence. Option A uses "some" (narrow scope) and assumes voices being heard equals representation, without data. Option B assumes forced voters would be uninformed without evidence, and doesn''t directly address representation. Option C compares vaguely to "some other democracies" and argues representation is already adequate — no direct evidence on whether compulsory voting improves it. Option D cites Australia''s compulsory voting producing 90% turnout and a more demographically representative parliament — direct action-to-outcome evidence from a real system. The answer is D.'
WHERE id = '808d3f13-86ec-41ef-a612-7b00ef879f85';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (compulsory financial literacy in schools) to a measurable outcome with evidence. Option A is vague ("young people should know about money") — no evidence, emotional tone. Option B is a strong counter with partial evidence about limited long-term impact and curriculum trade-offs, but it''s about the action''s feasibility more than whether it works. Option D shifts responsibility to parents without addressing whether school-based education is effective. Option C cites Money and Pensions Service research showing adults who received structured financial education were 30% less likely to accumulate problem debt — direct action-to-outcome link with quantified evidence. The answer is C.'
WHERE id = '821c8d81-f321-495a-a72f-0caae9784d26';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (age verification) to the outcome (protecting children from harmful content) with evidence. Option B discusses parental reassurance — wrong outcome (it''s about parents feeling better, not actual child protection). Option C addresses educational use for "some" children — tangential benefit, narrow scope, doesn''t engage with harmful content. Option D argues bypass potential — a real concern, but it focuses on whether the policy works in full, not on whether it would reduce exposure for the majority. Option A cites research that children under 13 without supervision face significantly more harmful content, and age verification would restrict their access — direct action-to-outcome evidence. The answer is A.'
WHERE id = 'aaad03df-22a7-435f-8ebb-55d9495cd667';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (mandatory helmets) to the outcome (reduced head injuries) with evidence. Option B is a side-effect worry — it assumes discomfort would deter cycling and it addresses public health broadly, not head injuries specifically. Option C addresses affordability (feasibility of the action) — doesn''t touch the injury outcome. Option D is a reasonable counter citing per-cyclist injury rates versus participation, but it conflates overall cycling decline with policy failure — the argument has a flaw. Option A cites regions that introduced mandatory helmet laws showing measurable reductions in head injury severity and frequency — direct action-to-outcome evidence from real policy. The answer is A.'
WHERE id = 'b9ab007b-4234-4a94-a024-e4a1cf7c4f9a';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (opt-out donation) to the outcome (more available organs) with evidence. Option A is emotional ("morally wrong to let people die") — right outcome but no evidence. Option B raises a consent/trust concern, but it assumes opt-out violates consent (people can still opt out) and the supply-undermining claim is speculative. Option D narrows the scope to religious groups — tangential concern, doesn''t engage with organ supply. Option C cites Spain and Wales showing sustained increases in donation rates after adopting opt-out systems — direct action-to-outcome evidence. The answer is C.'
WHERE id = 'e8c0e72f-fa1c-429c-837a-56ce3cf5e05e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (four-day week) to the outcome (improved productivity) with evidence. Option A addresses personal time — wrong outcome. Option C focuses on "some industries" — narrow scope, and about practicality rather than productivity. Option D discusses morale — a different outcome. Option B cites a UK trial showing overall output per employee did not increase when the working week was reduced — direct evidence that the action does not produce the productivity outcome, challenging the proposition head-on. The answer is B.'
WHERE id = 'eefba9a0-26e6-4c0d-b2c9-f5e8472609cd';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'A strong argument must link the action (opt-out organ donation) to the outcome (reduced transplant waiting lists) with evidence. Option B mentions public opinion — relevant context, but not about waiting lists. Option C raises family distress — an emotional concern, not a waiting-list outcome. Option D makes an unsupported assumption that trust would drop, without evidence, and doesn''t address waiting lists. Option A cites Spain''s 30% higher transplant rate under opt-out — quantified, directly linking action to the waiting-list outcome. The answer is A.'
WHERE id = 'f5a24132-4b11-413a-a95a-c4b6153521f1';

COMMIT;

-- =====================================================================
-- SECTION 6: VENN_DIAGRAM answer_reason rewrites
-- =====================================================================
-- SELECT questions: 3-move structure (easy wins → rule out → one targeted calc).
-- INTERPRET questions: translate region into categories → walk wrong letters → name the answer.

BEGIN;

-- SELECT venns

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two numbers you can read off any diagram in a second: 3 screenings are in all three categories (centre) and 8 belong to none (outside). Move 1 (easy wins) — scan each diagram for those. Option B shows 5 in the centre — the stem says 3, so B is out. Move 2 — A, C, and D all show centre = 3 and outside = 8, so keep looking. Documentary total is 28; subtract the two pair overlaps (documentary+international = 8, documentary+award = 6) and the triple (3): documentary-only = 28 − 5 − 3 − 3 = 17. Option D shows 19 there, so D is out. Move 3 (targeted calc) — only A and C remain, and they differ in the documentary+international overlap. That pair overlap only (excluding the triple) = 8 − 3 = 5. A shows 2 there; C shows 5 — only C matches. The answer is C.'
WHERE id = '0369c69d-ce05-41b7-8ffc-186748706e73';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Three easy wins you can check in seconds: spicy+vegetarian = 8, nuts+gluten-free = 6, and outside = 12. Move 1 — scan each option. Option B shows the two pair overlaps swapped (6 and 8 instead of 8 and 6) — out. Option C shows 10 outside instead of 12 — out. Move 2 — A and D remain. Move 3 (targeted calc) — vegetarian total is 14, and 8 of those are also spicy, so vegetarian-only = 14 − 8 = 6. Option D shows 12 there; option A shows 6. The answer is A.'
WHERE id = '0816982c-ffbd-4324-8927-4aed961d6e96';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two freebies from the stem: 4 books are in all three categories (centre), and 16 fit none (outside). Move 1 — scan. Option B shows 6 in the centre — out. Option C shows 10 outside — out. Move 2 — A and D remain. Move 3 (targeted calc) — 12 books are both hardback and fiction, with 4 of those also children''s, so hardback+fiction-only = 12 − 4 = 8. Option D shows 12 there; option A shows 8. The answer is A.'
WHERE id = '34189408-378c-42c8-9260-89f343e4ebf1';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'This is a nested venn question — all premium holders have an online account, and all online holders are registered. Two easy wins: premium = 18 (sits in the innermost ring) and "none" = 75 − 60 = 15 (one subtraction). Move 1 — scan. Option B shows 22 in the innermost ring, not 18 — out. Option D shows 20 outside, not 15 — out. Move 2 — A and C remain; both have innermost 18 and outside 15, but they differ in the two rings. Move 3 (targeted calc) — middle ring (online but not premium) = 40 − 18 = 22; outer ring (registered but no online account) = 60 − 40 = 20. Option A shows 20 then 22 (swapped); option C shows 22 then 20. The answer is C.'
WHERE id = '4ad2ddb0-16aa-49bb-a695-968af6fa05df';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Easy wins first: the stem says 8 birds have no traits and that no bird both mimics and is nocturnal. Move 1 — scan. Option D shows 10 outside — out. Because mimic and nocturnal cannot overlap, the central shape (touching both others) must be colourful, and colourful is what the other two overlap with. Move 2 — use mimic''s total of 13 to test: mimic = mimic-only + mimic+colourful overlap. In option B the overlap is 3, giving mimic total 8 + 3 = 11, not 13 — out. In option C the second shape''s solo area is 6, so mimic total = 6 + 5 = 11 — out. Move 3 — option A has the mimic+colourful overlap at 5, so mimic total = 8 + 5 = 13 ✓. The answer is A.'
WHERE id = '6f767d4a-6b22-45dc-bf5f-5381f0543da0';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Three easy wins from the stem: forklift+hazardous = 10, first aid+height safety = 8, none = 8. Move 1 — scan. Option D shows overlaps of 12 and 6 — out. Option C shows forklift-only = 22, but forklift total is 30 and the overlap is 10, giving forklift-only = 20 — out. Move 2 — A and B remain. Move 3 (targeted calc) — first-aid total is 15 with an 8 overlap, so first-aid-only = 7. Option A shows 9; option B shows 7. The answer is B.'
WHERE id = 'd0bba658-7248-4fe9-ad5e-8dbc71c1e707';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two easy wins: 5 students are in all three clubs (centre) and 28 are in none (outside). Move 1 — scan the shape totals so you can see each category in one glance. Option B''s centre is 3, not 5, and its shape totals (32, 26, 20) don''t match music 30 / drama 24 / art 18 — out. Option C has centre 3 and one shape totals 36 (forgot to subtract the triple from the pair overlaps) — out. Option D has one shape totalling 22 — no match — out. Move 2 — only A left. Move 3 (sanity check) — option A''s shape totals are 16+7+4+3 = 30 (music ✓), 11+7+3+3 = 24 (drama ✓), 8+4+3+3 = 18 (art ✓), with centre 3 and outside 28. The answer is A.'
WHERE id = 'd9ea48ab-c60a-4666-9e47-a1bc20689ed5';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two easy wins: 6 magazines are in all three categories (centre) and 13 fit none (outside). Move 1 — scan. Option B shows 8 in the centre — out. Option C shows 10 outside — out. Move 2 — A and D remain. Move 3 (targeted calc) — 15 are both weekly and digital; 6 of those are also environmental, so weekly+digital-only = 15 − 6 = 9. Option D shows 4 there; option A shows 9. The answer is A.'
WHERE id = 'da1d0b0d-019e-43ae-9351-729fc1a13c95';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two easy wins: 5 members play all three (centre) and 12 play none (outside). Move 1 — scan. Option B shows 8 in the centre — out. Option D shows 10 outside — out. Move 2 — A and C remain. Move 3 (targeted calc) — 12 play both tennis and badminton; 5 of those also play squash, so tennis+badminton-only = 12 − 5 = 7. Option A shows 5 there; option C shows 7. The answer is C.'
WHERE id = 'ed3dfef9-6eb7-43e2-b1b2-29b77869dbef';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Four easy wins from the stem: 4 strong in frontend+backend, 3 in backend+database, 4 in database+devops, and 5 outside. Move 1 — scan. Option C shows 1 outside — out. Option B shows 3 in the frontend+backend overlap (not 4) — out. Move 2 — A and D remain; they differ in frontend-only and devops-only. Move 3 (targeted calc) — frontend total is 15, minus the 4 that overlap with backend, gives frontend-only = 11. Option D shows 10 there; option A shows 11. The answer is A.'
WHERE id = 'c3f5f14b-c720-4a46-8f69-42551f881875';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Two easy wins: the stem gives you 5 plants are succulent+flowering and 6 are flowering+trailing (the only overlaps, because succulent and trailing do not share). So one shape (flowering, 18) sits in the middle and overlaps with both sides. Move 1 — scan shape totals. Option C has the middle shape at 10 + 5 + 6 = 21 (no category has that total) — out. Option B has sides totalling 8 + 5 = 13 and 7 + 6 = 13 — neither matches succulent (12) or trailing (14) — out. Option D has 7 + 6 = 13 and 8 + 5 = 13 — same problem — out. Move 2 — only A remains. Move 3 (sanity check) — option A''s sides total 7 + 5 = 12 (succulent ✓) and 8 + 6 = 14 (trailing ✓), with the middle at 7 + 5 + 6 = 18 (flowering ✓) and 7 outside. The answer is A.'
WHERE id = 'c26f61a1-aa9e-4ccf-a38e-05c03744a674';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'Four easy wins straight from the stem: the four pair-overlaps (management+degree = 8, degree+certifications = 6, certifications+references = 4, references+management = 5) and none = 10. Move 1 — scan. Option D swaps two of those pair overlaps (showing 4 and 6 instead of 6 and 4) — out. Option C shows the references+management overlap as 7 instead of 5 — out. Move 2 — A and B remain. Move 3 (targeted calc) — management-only = 25 − 8 − 5 = 12. Option A shows 14 there; option B shows 12. The answer is B.'
WHERE id = 'cd1e5110-6892-443e-80c0-972036e37534';

-- INTERPRET venns (translate region into categories → walk wrong letters → name the answer)

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the octagon (engineer) and square (senior engineer), outside the circle (principal engineer)" — that is, a senior engineer who has not yet been promoted to principal. Letter P is inside the octagon but outside the square — an engineer who is not senior, so it fails the senior requirement. Letter R is inside all three — a principal engineer, which the question excludes. Letter S is outside all three — not an engineer at all. Letter Q is inside the octagon and the square but outside the circle — exactly the region described. The answer is B (Letter Q).'
WHERE id = '05eae854-d2be-4c30-8010-2c4526f548a6';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the oval (shelved) and the hexagon (wrapped), outside the trapezoid (catalogued), pentagon (stamped), and square (tagged)." Letter S is in the pentagon+oval overlap — that includes stamped, which is excluded. Letter T is inside the oval only — missing wrapped. Letter W is in the hexagon+square overlap — that includes tagged, which is excluded. Letter U is in the oval+hexagon overlap, outside every other shape — matching every condition. The answer is B (Letter U).'
WHERE id = '14094fcb-5053-441d-9278-404e412c8c2b';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the parallelogram (Bachelor''s) and the diamond (Master''s), outside the square (Certificate), oval (Foundation), and hexagon (Doctoral)." Letter G is where Foundation and Bachelor''s meet — includes Foundation, excluded. Letter J is where Master''s and Doctoral meet — includes Doctoral, excluded. Letter C is Bachelor''s alone — missing Master''s. Letter H is the Bachelor''s+Master''s overlap with nothing else — exactly the region described. The answer is B (Letter H).'
WHERE id = '1ee0a429-8f04-4139-9220-efd6ffa2797e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the rectangle (full-time) and the circle (induction done), outside the pentagon (safety certified) and the diamond (contract staff)." Letter R is in the rectangle+circle+pentagon overlap — includes safety certified, excluded. Letter P is inside the rectangle only — missing induction. Letter T is inside the diamond and outside the rectangle — contract staff and not full-time. Letter Q is inside the rectangle and the circle but outside both the pentagon and the diamond — matching every condition. The answer is A (Letter Q).'
WHERE id = '22429841-a497-4aca-9383-37852fc2ef35';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the hexagon (Environment) and the octagon (Transport), outside all other shapes." Letter G is Environment+Healthcare — includes Healthcare, excluded. Letter F is Transport alone — missing Environment. Letter L is Employment+Transport — includes Employment, excluded. Letter M is the Environment+Transport overlap, outside the other four focus areas — exactly the region described. The answer is A (Letter M).'
WHERE id = '22959108-0a64-459c-93e7-7e16aff09615';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the rectangle (urgent) and the pentagon (approval), outside the diamond (recurring), the hexagon (manager), and the star (automated)." Letter T is in the pentagon only — missing urgent. Letter V is in the rectangle only — missing approval. Letter R is in the rectangle+hexagon overlap — includes manager, excluded. Letter P is in the rectangle+pentagon overlap, outside every other shape — matching every condition. The answer is A (Letter P).'
WHERE id = '22d0c66b-e526-4573-99ed-e18b9db1a770';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the circle (certified) and the vertical oval (live sessions), outside the hexagon (self-paced), the oval (assignments), and the pentagon (premium content)." The four candidate letters each pair certified with one other feature: F is certified+self-paced, G is certified+live sessions, H is certified+assignments, J is certified+premium content. Only G matches the required pair. The answer is B (Letter G).'
WHERE id = '53e769e8-201e-4535-a12c-4279da6421dd';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the diamond (industry partnership) and the circle (patient involvement), outside the hexagon (clinical relevance)." Letter B is industry partnership alone — missing patient involvement. Letter F is where clinical relevance and industry partnership meet — includes clinical relevance, excluded. Letter H is where patient involvement and multi-site collaboration meet — no industry partnership. Letter G is the industry partnership+patient involvement overlap, outside clinical relevance — matching every condition. The answer is C (Letter G).'
WHERE id = '6fc68992-0bae-4187-9c2d-b1b2ac5a7e0e';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the circle (laboratory) and the diamond (mandatory yr 1), outside the hexagon (external placement), the oval (summer school), and the star (portfolio)." Letter P is laboratory only — missing mandatory. Letter Q is mandatory only — missing laboratory. Letter V is laboratory+external placement — includes the wrong second property. Letter U is the laboratory+mandatory yr 1 overlap, outside all other categories — matching every condition. The answer is C (Letter U).'
WHERE id = 'a906e613-2454-48d3-8222-9d95b805bfdf';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the rectangle (main stage), the pentagon (comedy) and the star (family-friendly), outside the circle (music)." Letter Q is rectangle+circle+pentagon — includes music, excluded. Letter R is rectangle+pentagon only — missing family-friendly. Letter T is rectangle+star only — missing comedy. Letter S is the rectangle+pentagon+star overlap, outside every other shape — matching every condition. The answer is B (Letter S).'
WHERE id = 'c7c02760-7ce5-4168-aa41-2c39e515c623';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the pentagon (manager) and the diamond (analyst), outside the oval (designer) and the trapezoid (developer)." Letter P is in the pentagon only — missing analyst. Letter V is in the diamond only — missing manager. Letter Q is pentagon+oval — includes designer, excluded. Letter W is the pentagon+diamond overlap, outside both oval and trapezoid — matching every condition. The answer is A (Letter W).'
WHERE id = 'ee55caee-9d71-46e4-91c8-48a53ae0bb9d';

UPDATE "public"."timed_decision_making_questions" SET answer_reason =
'The target region is "inside the octagon (gluten-free) and the parallelogram (low-sugar), outside the circle (organic), the pentagon (local), the trapezoid (vegetarian), and the vertical oval (fair-trade)." Letter D is gluten-free alone — missing low-sugar. Letter J is vegetarian+gluten-free — includes vegetarian, excluded. Letter L is low-sugar+fair-trade — includes fair-trade, excluded. Letter K is the gluten-free+low-sugar overlap, outside all other categories — matching every condition. The answer is D (Letter K).'
WHERE id = 'f14b0fe7-7ce8-471d-812b-2949e3c7fa69';

COMMIT;

-- =====================================================================
-- SECTION 7: SYLLOGISM statement answer_reason rewrites
-- =====================================================================
-- Format per validator Step 8: open with "Yes —" or "No —", show deduction chain
-- or name the specific trap (reverse inference, quantifier shift, UCAT "some" excludes
-- "all", scope creep, could-be-vs-must-be, chained "some" claims). 1–3 sentences each.

BEGIN;

-- Q: Cycling Club Members (3b330db6)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — five training rides are necessary to enter the race. If someone has entered, they must have met that prerequisite. The "some members with five rides did not enter" premise doesn''t block this direction; it only blocks the reverse.' WHERE id = '00f7ed77-354a-4708-b7ca-caceebe5f661';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain the necessary conditions. A medal needs race completion, race completion needs entry, and entry needs five training rides. So medal → five rides, meaning no medal holder can have fewer than five.' WHERE id = '01ac55b2-647f-4f8b-a5aa-be3f4ee4ee66';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — classic reverse-inference trap. Five rides is necessary for entry, not sufficient, and the premises explicitly state some five-ride members did not enter. Even if they did enter, entering doesn''t guarantee completing the race or receiving a medal.' WHERE id = 'c6e15d2b-be85-4e84-9e49-361c3ac6b2f8';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — this directly contradicts the premises, which say some five-ride members did not enter. Quantifier shift: "some did not" cannot become "all did".' WHERE id = '4b22b0fe-0daa-4f03-a153-484a61f28484';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain of necessity. A medal requires completing the race, and entering the race requires five training rides. So by contraposition, fewer than five rides → cannot enter → cannot complete → cannot hold a medal.' WHERE id = '01ac55b2-647f-4f8b-a5aa-be3f4ee4ee66';

-- Q: Zorplek Classification (f56c602e)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "only quibbles can be certified as nimtars" makes being a quibble a necessary condition. So every nimtar is automatically a quibble.' WHERE id = 'dbbad7cf-c39e-43cb-ac69-18a7b3ce3ce9';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — indirect proof works fastest. All zorpleks produce fizzle, and no grunthi does. If a grunthi were a zorplek, it would produce fizzle, contradicting the second premise. So no grunthi can be a zorplek.' WHERE id = '02a9e92b-9fb4-4646-a48c-b88bb2922ef8';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — you cannot chain two "some" claims to get certainty. Nimtars must be quibbles, and some zorpleks are quibbles, but the quibbles that become nimtars might be the non-zorplek ones. The fizzle link is not guaranteed.' WHERE id = 'ffb6b71d-fd41-4f89-88f9-36578273cbd5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — quantifier shift from "some" to "all". Under UCAT rules, "some zorpleks are quibbles" strictly excludes "all". So at least one zorplek is not a quibble.' WHERE id = 'f3775d85-82be-4eb7-a1be-9a8ba5273f2e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — a grunthi cannot be a zorplek, but nothing blocks a grunthi from being a quibble by some other route. If it is a quibble, it could be certified as a nimtar. Counter-example: a grunthi that is a non-zorplek quibble.' WHERE id = 'f3f7802f-461d-4708-ad0f-2dd02b6e3191';

-- Q: Cheese Maturation (689fffaf)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — cannot chain two "some" claims. Artisan cheeses are all aged, and some aged cheeses develop hard rinds, but those hard-rind ones might all be non-artisan. Possible, not certain.' WHERE id = '8d6e0425-68f8-401d-9da3-08cc0d0b6386';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — a universal negative converts symmetrically. "No hard-rind cheese is cloth-wrapped" and "no cloth-wrapped cheese has a hard rind" say the same thing.' WHERE id = '4bd783a8-2835-4cb3-a327-a8d8b71fbe80';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. "All artisan cheeses are aged" does not mean all aged cheeses are artisan; plenty of non-artisan cheeses age too.' WHERE id = '31dc90b9-cfd6-43b4-8243-9b8ff7a40a42';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — some aged cheeses have a hard rind, and no hard-rind cheese is cloth-wrapped. So every hard-rind cheese is not cloth-wrapped, and in particular the ones that exist are not — this gives you "some cheeses with a hard rind are not cloth-wrapped".' WHERE id = '03898ab2-35c2-4dfb-bab1-1637c3bd675f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises say nothing about how artisan cheeses are sold. Some could develop hard rinds (and therefore not be cloth-wrapped), or they might not. We cannot deduce their wrapping.' WHERE id = '528ab8b7-a32a-4820-a2f0-0723a16b3643';

-- Q: Rice Preparation Rules (c2c2992e)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "inedible unless boiled" means boiling is a necessary condition for edibility. By contraposition, if rice is edible, it must have been boiled.' WHERE id = '41f9b86b-7ea0-411c-9021-44de5731c691';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — sufficient/necessary confusion. Boiling is necessary but not sufficient; salt is also required. Rice boiled without salting is still inedible, so the conclusion fails.' WHERE id = '041311ea-a59b-4b4b-aae7-036bd6d47ad3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — both conditions are necessary. Boiling is required (premise 1) and salt is required (premise 2), so any edible rice must have had both.' WHERE id = '421683a0-f5d9-4e52-88bc-1c377dacfe81';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — same sufficient/necessary trap as boiling. Salt is necessary but not sufficient; rice also has to be boiled. Salted-but-unboiled rice remains inedible.' WHERE id = '5d0150b6-56c1-4583-8f1d-65dca2d85ab2';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises say salt is necessary for edibility, not that boiling forces salting. You can boil rice without salting it; it simply stays inedible.' WHERE id = 'a1dc0c81-9fcf-4ab2-a4eb-b7fc14b90675';

-- Q: Bioluminescent Organisms (73d77474)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain the premises. Most deep-sea organisms are bioluminescent, and all bioluminescent organisms produce luciferin. So most deep-sea organisms produce luciferin.' WHERE id = '8e9943d9-bd26-4cab-8af1-9ac39522c07b';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — cannot chain two "some" claims safely. Some luciferin producers are studied in labs, but those studied ones might all be non-deep-sea producers. Possible, not certain.' WHERE id = '99307db3-4311-4d1d-904e-b261aca786da';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. "All bioluminescent organisms produce luciferin" does not mean all luciferin producers are bioluminescent; other organisms can make luciferin too.' WHERE id = 'efd44637-e0c7-4f43-adf1-cc0e231b8616';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — most deep-sea organisms are bioluminescent (>50%), and all bioluminescent organisms produce luciferin. So at least some deep-sea organisms produce luciferin — meaning some luciferin producers are deep-sea.' WHERE id = '35402d6e-2d8e-4a1e-ae58-c7a428761439';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — quantifier shift. Only "most" (>50%) of deep-sea organisms are bioluminescent; the rest may not produce luciferin. "Most" never justifies "all".' WHERE id = '8b594ea9-d9bd-4712-af7d-a9f736940b96';

-- Q: Swimming Pool Safety Rules (7959110c)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the rule says under-8s in the main pool need a lifeguard-certified adult. A 6-year-old is under 8, so accompaniment is required for them to be permitted.' WHERE id = '1f760dd4-3af3-4c6b-be16-d2ef54ec6961';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — scope creep. The proficiency test is a requirement for the diving area, not for being lifeguard-certified. The premises don''t link the two, so we cannot import the rule across contexts.' WHERE id = '53c9ade7-b953-4d35-aac2-7d05aba2c0d3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "no one may use the diving area without first completing a swimming proficiency test" makes the test a necessary condition. Anyone using the diving area must have completed it.' WHERE id = 'ed047098-06ff-486d-96f9-a2b250c7ecdc';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — same scope-creep trap. The proficiency test is only linked to diving-area use. The premises don''t say lifeguard certification requires the test, so some lifeguard-certified adults may never have taken it.' WHERE id = '0dbd3d2a-6531-48c9-8de1-27651073fee3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "not restricted by the under-8 rule" is not the same as "permitted". Other pool rules might exist that the premises don''t mention, so we can''t conclude a 10-year-old can use the main pool unaccompanied.' WHERE id = '2fd6d762-5c37-443d-88a8-ecfe55e30a4f';

-- Q: Brindle Classification (7de21b72)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "only striped brindles can be classified as jentiks" makes striped-brindle a necessary condition for being a jentik. So every jentik must be a striped brindle.' WHERE id = '369dfac1-d604-43cd-b8c5-74912f54c4d1';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reversed "only" statement. "Only striped brindles can be jentiks" makes striped-brindle necessary but not sufficient; some striped brindles may not be classified as jentiks.' WHERE id = '9b5b6361-e277-4ed5-b7b3-125fda9a5c4f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — spotted brindles are brindles (all brindles are spotted or striped). Some spotted brindles are larger than any jentik, so some brindles are larger than any jentik.' WHERE id = '7f6a2fa5-3db9-4644-b868-f806f8c3603d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — spotted and striped are mutually exclusive ("either... or"), and only striped brindles can be jentiks. A spotted brindle is therefore not striped, and cannot be a jentik.' WHERE id = '4a8e4abb-ace6-4d13-ac5b-e8328cfb0747';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises say some spotted brindles are larger than any jentik, but say nothing about striped brindles'' sizes. Some striped brindles (who aren''t jentiks themselves) could also be larger than any jentik. Possible, not certain.' WHERE id = 'e4f33a92-70fc-41e3-8f91-18b396e5a450';

-- Q: Archaeological Dig Volunteers (82c6acc0)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain the premises. Some volunteers are certified archaeologists, and all certified archaeologists have done the heritage course. So those certified volunteers have completed it — some volunteers have too.' WHERE id = '81cb206d-7d1d-486a-b362-3b76d2bf9501';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "only certified archaeologists are permitted" makes certification necessary, not sufficient. Plus only some volunteers are certified, so we cannot conclude all volunteers are permitted.' WHERE id = '7f493e56-39ea-476d-af8a-688e7a89ab61';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — conversion of a particular affirmative. "Some volunteers are certified archaeologists who have completed the heritage course" flips to "some heritage-course completers are volunteers".' WHERE id = '1df8b851-7aaf-430a-88e4-a29186f96a04';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the permission belongs to all certified archaeologists, not just volunteers. Non-volunteer certified archaeologists could also handle artefacts, so "only volunteers" narrows the group incorrectly.' WHERE id = 'ac3e7f8f-cf9e-4c83-9979-efa80fe245a9';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — under UCAT rules, "some" means strictly >0% and <100%. So if some volunteers are certified archaeologists, some are not.' WHERE id = 'e401289a-e62b-4a31-8381-4d3485a613d1';

-- Q: Frebble Classification (89acea5a)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain of necessity. All plonks are frebbles, and only spotted frebbles can be grozzled. So a grozzled plonk must be a spotted frebble, which means it must be spotted.' WHERE id = '3d88cef8-2063-410c-9091-f8f0dd0e349e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. "All plonks are frebbles" does not mean all frebbles are plonks.' WHERE id = 'd806ce32-c0e8-4f47-a842-562186042273';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — some plonks are not spotted, and only spotted frebbles can be grozzled. The unspotted plonks cannot be grozzled, so not all plonks can be.' WHERE id = '6ffbfaf8-5eb6-463a-8248-b57d0b0af58c';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premise says only spotted frebbles can be grozzled, regardless of whether they are plonks. Being a plonk is not a requirement for grozzling.' WHERE id = '7da2e5ae-6503-4bae-816d-f65ca2a457b7';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "only spotted frebbles can be grozzled" makes spotted a necessary condition. Unspotted frebbles are therefore excluded from grozzling.' WHERE id = 'f695d90d-e66b-406a-af95-709fa2f8f7e4';

-- Q: Community Garden Allotments (91e33082)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — large plots cannot be maintained without regular watering, so watering is necessary for all large plots. Adding composting doesn''t remove that requirement.' WHERE id = 'e44636d2-4bf0-4dcc-aba2-e005908d93f0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — contrapositive. All large plots require watering, so a plot that doesn''t require watering cannot be large. The only other option is small.' WHERE id = 'e7475310-f02d-4fba-a12c-72eee4ec64b8';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — quantifier shift. "Some small plots do not require watering" does not mean all small plots are exempt; some small plots may still need watering.' WHERE id = '3d20a1a3-69bd-4003-a86f-a4ba7186ef41';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premise says composting is sufficient, not necessary. Other methods could also maintain soil quality; the premises don''t rule them out.' WHERE id = '20332038-4d1f-4176-90f6-eb0e74705462';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — some small plots don''t need watering, and composting alone is sufficient for soil quality. Those specific small plots can be maintained with composting only.' WHERE id = '3a07365e-83e0-41f3-9321-6aff14359b0b';

-- Q: Wildlife Sanctuary Protocols (94d8ee7f)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "only animals that pass the health assessment are placed in the public viewing area" makes passing a necessary condition. Any animal in the viewing area must have passed.' WHERE id = '5d61ea2a-2cdd-4352-900a-5ff27117eb61';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — chain of uncertainties. Partner-sanctuary animals are the exception to automatic assessment; only some of them receive one, and even those may not pass. We cannot conclude all transferred animals reach the viewing area.' WHERE id = '1e893a50-a345-4819-99f1-8260afec2748';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the first premise says all rescued animals receive an assessment unless from a partner sanctuary. If the animal is not from a partner sanctuary, the exception fails, and the assessment is given.' WHERE id = 'd897a5eb-52ec-4b3f-9fff-7bf8abb604d5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — you cannot pass an assessment you never took. Since passing is required for viewing-area placement, an animal that didn''t receive the assessment cannot be there.' WHERE id = '3c3c44f7-a6f4-4d2d-aae3-50d0910b3dbd';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — some partner-sanctuary animals do receive the assessment (premise 3), and if they pass, they qualify for placement. So at least some can end up there.' WHERE id = '4e74999e-c8fb-47fd-8dba-6dd6ee27ac9d';

-- Q: Photography Club Rules (9cadfb5d)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the only exception to the portfolio requirement is having won a regional award. So exhibiting without a portfolio forces the member to be a regional award winner.' WHERE id = '83cb9090-d294-479e-8a9f-da9556c8f7de';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — direct contradiction. The premises state some three-year members have not won a regional award. Quantifier shift from "some have not" to "all have" fails.' WHERE id = '462dba88-ea5e-45bb-b91d-5fe9f7b94a83';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — directly stated: all regional award winners have been members for at least three years.' WHERE id = '9c071dff-661d-48b7-ba90-6b435554f26f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — three-year membership alone is not sufficient; the premises say some three-year members have not won an award. Only award winners can skip the portfolio, so long membership isn''t enough.' WHERE id = '3ae00e8f-b7ff-49b2-9695-0f63cec23e66';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — restates the third premise from the other direction. "Some three-year members have not won an award" is the same set as "some non-winners have been members for at least three years".' WHERE id = '473d6cca-1119-490c-be5a-159f950e3bbd';

-- Q: Rare Coin Collectors (d6b4808b)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — cannot chain two "some" claims. All rare coin collectors attend auctions, and some auction attendees are jewellery dealers, but those jewellery dealers might not include any rare coin collectors. Possible, not certain.' WHERE id = '877b1313-5a13-4dec-b77e-d86ea688b1bf';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — universal negatives convert symmetrically. "No jewellery dealers work in museums" = "no museum workers are jewellery dealers".' WHERE id = 'b61becb9-5cc9-43f8-84c5-db7e84f84e7c';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. "All rare coin collectors attend auction houses" does not mean all auction attendees are rare coin collectors.' WHERE id = '6cc3cf41-a98c-4312-9b82-08eec2af152d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — under UCAT rules "some" means strictly less than all. So if some auction attendees are jewellery dealers, some are not.' WHERE id = '461f4330-71df-44ae-9641-d489ccb3ce45';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises don''t link rare coin collectors with museum work. They attend auctions; nothing says whether they work in museums or not.' WHERE id = '0aff2501-b132-458c-9328-c7d3906824cb';

-- Q: Medication Dispensing Rules (d812a53e)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — directly stated: prescription medication cannot be dispensed without a valid prescription.' WHERE id = '7ee32404-3c2b-461c-9f42-9aff4cd469c1';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — some over-the-counter medications require a consultation, and consultation is sufficient for side-effect advice. So some OTC customers will receive advice.' WHERE id = '8dac1619-5d0b-497c-a5f6-4e708e8ee1c4';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — consultation is stated as sufficient for advice, not as the only route. OTC customers could receive advice by other means, so we cannot conclude "most do not".' WHERE id = '44c87abe-f585-4eae-8ec7-a6b5b4c333e0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — consultations can happen for some OTC medications too. Having a consultation doesn''t force the medication to be a prescription.' WHERE id = 'cff8b355-3c06-49dd-8541-0f4397cc3171';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — directly from the third premise. Some OTC medications do require a consultation, so some OTC customers receive one.' WHERE id = '0f1bd093-4b90-45de-a953-80b60940a394';

-- Q: Laboratory Safety Protocols (d5ad8332)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — goggles are required for lab entry, but handling radioactive samples requires being a senior researcher. Wearing goggles doesn''t confer senior status.' WHERE id = 'c0158438-97bc-46d8-8473-197dd00032a6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — radioactive sample handling requires lead-lined gloves, and any lab presence requires goggles. Since handling happens in the lab, both are needed.' WHERE id = 'e0bc8d38-d4d2-4af0-a695-c2a450eade7a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises only say handling radioactive samples requires lead-lined gloves. Nothing forbids a junior researcher from wearing them for other reasons.' WHERE id = 'afabab62-d245-4510-a9bc-2bf5085fb633';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. Lead-lined gloves are required for handling radioactive samples, but a researcher could wear them for other reasons without being senior.' WHERE id = 'f800e8ef-5bda-4607-b62a-a1da60c7976d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — premise 1 says no researcher may enter the lab without goggles, so this scenario contradicts the premises. We cannot draw conclusions from an impossible case.' WHERE id = '4c60566b-5394-41ca-b40b-53cd275c1e20';

-- Q: Brimptons and Floxels (ded2c63a)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — some brimptons are vellins, and all brimptons are floxels. Those vellin-brimptons are therefore floxels, so some floxels are vellins.' WHERE id = '5b0c91a3-f55c-4849-be25-f8a84a14e784';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — cannot chain through "some". Brimptons are floxels, and some floxels are quizzits and no quizzits are drabbels — but brimptons might be non-quizzit floxels, which could be drabbels.' WHERE id = '87213fd8-c629-4a9d-8565-69657cbe2839';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — conversion of a particular affirmative. "Some floxels are quizzits" flips to "some quizzits are floxels".' WHERE id = '118934c0-5eb2-4fb8-9e37-4036dea3f050';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the vellin-brimptons are floxels (by the all-brimptons-are-floxels rule), but there may be vellins outside the brimpton group, and those needn''t be floxels. Quantifier leap from some to all.' WHERE id = '124e91dd-b3d9-44bf-895e-1be3e347fc07';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — UCAT "some" rule. "Some floxels are quizzits" means strictly less than all, so some floxels are not quizzits.' WHERE id = 'ed91cdb8-3496-4fdd-a34b-593b26d10a39';

-- Q: Chemical Compound Properties (d0c6d23a)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — chain by contraposition. A compound not treated with A is unstable; stable means treated with A. Final product requires stable, so final product → treated with A.' WHERE id = '6bf0b9cc-0a22-4580-80ba-81b468226943';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premise is "not treated with A → unstable", which gives "stable → treated with A" by contraposition but not the reverse. Other causes of instability could exist.' WHERE id = '9e2cf235-efb9-4b2c-ab3e-666cdb1c4cfd';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — B-treated compounds are unsuitable for external use, but the premises don''t say the final product must be for external use. A B-treated compound could still be stable and used in a non-external product.' WHERE id = '0d119662-0c81-4e31-9f5f-85c174bca848';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — some compounds are treated with both A and B, and no B-treated compound is suitable for external use. Those dual-treated ones are therefore not suitable for external use — and they''re among the A-treated group.' WHERE id = '1f88cd1c-4223-4e6e-b9a5-e426618cd295';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises say nothing about whether final-product compounds are for external use. That link is unstated, so we cannot conclude it.' WHERE id = 'dc185e8a-8288-49d4-a1de-ebc8ddac69a7';

-- Q: School Transport Eligibility (f4b3c7fa)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — living more than 3 miles from school makes a student eligible for a free bus pass. 4 miles satisfies that.' WHERE id = '0b36b7c0-dd8a-4649-9aa8-5544bd4add72';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — a bicycle loan requires bus-pass eligibility (i.e., living more than 3 miles away) and declining it. A student within 3 miles fails the first step, so they cannot apply.' WHERE id = '265859c7-d75d-42da-a875-6ce6d2dc5c8e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — quantifier shift. "Most students within 3 miles walk" cannot become "all students within 3 miles walk". Most means more than half, not everyone.' WHERE id = '0ac75763-6b0a-4c18-a654-f8422b281e9a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — bicycle-loan applicants must be bus-pass eligible (living more than 3 miles away). By contraposition, anyone with a loan lives more than 3 miles from school.' WHERE id = 'eef144e5-fd98-40f6-adbb-a27bba21e8e6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "may apply" is permission, not obligation. A student declining the bus pass could choose not to apply, or apply and not receive a loan.' WHERE id = '5e98b486-4873-425f-94cb-914c886d4487';

-- Q: Bakery Product Freshness (47f0c1df)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — "no bread is sold without being baked that morning" makes morning-baking necessary for any sold loaf.' WHERE id = 'c8360b02-77fc-42ef-abe3-be3b03951820';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the refrigeration rule applies to cream-containing pastries. Since some pastries have no cream, and no other refrigeration rule is given, some don''t need refrigerating.' WHERE id = 'e5106ffe-84a5-452c-9865-a416007c8b52';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — reverse-inference trap. Cream pastries must be refrigerated, but that doesn''t mean only cream pastries are refrigerated; other items could also be stored cold.' WHERE id = '1647fa0f-f24a-427b-a87b-38a9786deadc';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — contrapositive of the first premise. "Sold → baked that morning" logically equals "not baked that morning → not sold".' WHERE id = '3d4ff3c5-757f-4b24-b5b0-a6cb03707c3e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — scope creep. Only cream pastries must be refrigerated, and some pastries contain no cream. So not all pastries need refrigerating.' WHERE id = '121128e6-3af6-4d9e-9f3e-c2de78230647';

-- Q: Community Garden Rules (34ba47ab)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — directly from the first premise. Growing vegetables makes meeting attendance required.' WHERE id = '8b7d5a32-0992-4765-9e4f-7a62230bccf0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — scope creep. Only vegetable-growing plot holders must attend; non-vegetable-growers may or may not.' WHERE id = '7a865975-9bc7-439d-bc9a-df1401aa03e3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — cannot chain two "some" claims. Vegetable growers attend meetings, and some attendees volunteer, but the vegetable growers might all be among the non-volunteering attendees. Possible, not certain.' WHERE id = '6d15eb19-1a9d-4ff2-86b9-99f229005427';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the age restriction applies only to maintenance volunteers. Vegetable growers must attend meetings but don''t have to volunteer, so the age rule doesn''t automatically reach them.' WHERE id = 'b22e1666-93ba-4716-868b-c2539f7f5f62';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — contraposition. "No maintenance volunteer is under 18" means all maintenance volunteers are 18+; so under-18 → not a maintenance volunteer.' WHERE id = '285c4f90-0989-4e13-ac44-b29ac4c42964';

COMMIT;

-- =====================================================================
-- SECTION 8: INTERPRETING_INFO statement answer_reason rewrites
-- =====================================================================
-- Same format: open with "Yes —" or "No —", quote/verify data or name the trap
-- (causation/correlation, extrapolation, qualifier shift, theory-vs-fact, average-vs-individual,
-- unit/scale mismatch, subtle word change). Fix any mojibake in arithmetic symbols.

BEGIN;

-- Q: Opioid Prescribing Practices (cd767acb)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the passage says the drug was "aggressively marketed as a non-addictive chronic pain remedy" despite addicts abusing it. That matches misrepresenting harmlessness to medical professionals.' WHERE id = '31de98ea-64eb-4efc-9276-a9228e98f3c4';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — subtle word change. The passage describes symposia "drilling in promotional material" and prescription being driven by "numerous incentives". Being given material and incentives is not the same as being bullied.' WHERE id = '91ad8c7a-1ad3-4808-9d3b-98e36275d5d1';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — directly supported. The passage says OxyContin was "originally based on elements of the opium poppy" (organic origin, so part-organic) and marketed as a "chronic pain remedy" (persistent pain).' WHERE id = '088dcbbf-76a3-41f1-b786-e27b24513281';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the passage says it was "overprescribed due to numerous incentives", not solely because of non-addictiveness claims. No single main reason is identified.' WHERE id = '3650e64c-7210-4009-bde5-b9791abb9968';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the passage describes addicts abusing the drug but does not assign blame to patients. It focuses on Purdue''s marketing and doctor overprescribing. Patient blame is an assumption beyond the text.' WHERE id = 'fd208017-2a2a-436b-bc52-78eb8303beaf';

-- Q: Flower Show Entries (a180f2c6)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — red roses = 40 ÷ 4 = 10. Yellow roses = 40 − 10 = 30. 30 > 10.' WHERE id = 'b0bc9c25-e3bf-4b67-a922-6e4c5563652a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "all of the red flowers are roses" is stated directly, so no tulips can be red.' WHERE id = '08716a73-39fd-40fa-8dba-d365a360aace';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — tulips = 80 − 40 = 40; yellow tulips = 40 ÷ 2 = 20. Yellow roses = 30. Total yellow = 50. Red = 10, purple = 20. Yellow (50) beats both.' WHERE id = '8c5ca51f-d11a-40b8-b704-8da049cef375';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — half the tulips are yellow, so some yellow flowers are tulips, not roses. The "all red flowers are roses" rule doesn''t extend to yellow.' WHERE id = '54b1dcfd-c439-4294-8bc1-4d535e5f9d3f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — purple tulips = 40 ÷ 2 = 20. Red roses = 10. 20 > 10.' WHERE id = 'c44cb098-3a9a-4258-9ef8-db7a363e9189';

-- Q: Bicycle Storage (2daaf529)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "not silver" does not mean "black". Mountain bikes could be red, blue, green, or anything non-silver. We can''t conclude the colour.' WHERE id = '61f644d1-5139-4c41-9892-aa701e8c3b4d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — the only types are road and mountain bikes, and no silver bike is a mountain bike. So every silver bike is a road bike.' WHERE id = 'c61d7005-2964-41ee-8a68-7f1c6bb9f063';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — half of 24 road bikes = 12 black road bikes. Silver mountain bikes = 0 (none of the silver are mountain). 12 > 0.' WHERE id = '6e28d9ef-0144-4839-b56e-17e3fb6f1b4f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — mountain bikes = 40 − 24 = 16. Silver bicycles = 12 (half of road bikes). 16 > 12, so there are more mountain bikes than silver, not fewer.' WHERE id = '6f41f026-8b65-4bbc-adc9-74f51964564e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — we know 12 road bikes are black, but mountain bike colours are unknown beyond not being silver. The total count of black bicycles is undetermined.' WHERE id = '6b37f827-1891-481b-9026-f991a3bc5913';

-- Q: Solar Panel Installation Report (4dcd2bbb)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — south-facing: 210 × £620 = £130,200. East/west: 130 × £410 = £53,300. Total = £183,500, which exceeds £170,000.' WHERE id = '0cb2a8f0-a509-459e-b7b1-5e0fa57039c5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. Higher average savings depend on panel size, usage, tariffs and more; savings are not a direct measure of efficiency.' WHERE id = '045f4b24-f505-4155-97e9-20aca5fe60cd';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 210 of 340 = 61.8%, which is more than half.' WHERE id = 'a9d946b4-dd96-4d41-b69b-dda93bd67d48';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the council "projects" the outcome, which is an estimate subject to assumptions. Projection is not certainty, so "definitely" is not supported.' WHERE id = '680e762f-b671-4fc9-b282-fffa2712557f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — total savings £183,500 ÷ 340 households = £539.71, greater than £500.' WHERE id = '2523862b-43fd-47bb-a742-2dfd9b8a3a21';

-- Q: Trophy Cabinet Categories (5661649f)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 22 individual trophies total, 20 of which are gold. So silver individual trophies = 22 − 20 = 2.' WHERE id = '601ae283-5e6b-4902-aa9a-74f2800ed4bb';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — all gold trophies are individual, so there are zero gold team trophies. Team trophies total 36 − 22 = 14, all of which must be silver.' WHERE id = '4b7926a1-2e3c-4636-b343-286a0e6f5d0f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — there are zero gold team trophies (all gold are individual). The 14 team trophies are silver.' WHERE id = '7e49b271-5e3d-464f-87fc-a6aaa97815bb';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — no silver team trophy was won after 2015, and all team trophies are silver. So no team trophy was won after 2015, meaning any post-2015 trophy must be individual.' WHERE id = '236ebb01-d76a-4c00-b4d7-2ff640752fd2';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — post-2015 trophies must be individual (not team), but there are 2 silver individual trophies of unknown date. One or both could be post-2015, so some post-2015 trophies could be silver.' WHERE id = 'e321fa2d-53d1-4566-a764-2b09f6d3597a';

-- Q: Renewable Energy Report (587add50)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — if consumption in 2015 was 100 units, renewable output was 18. By 2023, consumption was 112 units, and renewables were 34% of 112 = ~38.1 units. Absolute output rose from 18 to ~38.' WHERE id = '207275b5-b85f-4151-9315-0d201dbe5628';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the report says wind investment doubled "since 2018", not since 2015. We have no 2015 baseline, so the 2015–2023 doubling claim cannot be supported.' WHERE id = '45a2ad71-fa7c-414d-9922-0f5a81ef10ae';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the report uses "could" and conditions on "if current trends continue". That is a projection, not a definite prediction, so it cannot be stated as fact.' WHERE id = '6e73d148-0ea3-4a85-9021-33f848d42854';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — different time periods and different metrics. Solar installations grew since 2020, while wind investment doubled since 2018. You can''t compare growth rates across mismatched windows and measures.' WHERE id = 'da632043-9e83-4336-8040-6124e9dae549';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — if renewables rose from 18% to 34%, non-renewables fell from 82% to 66%. The non-renewable share decreased.' WHERE id = 'd2d2f429-36bf-40f9-a3a0-5aa5637ca1bf';

-- Q: Regional Rainfall Data — jun/sep (cfccd113)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — North total: 58 + 72 + 85 + 63 = 278 mm, which exceeds 270 mm.' WHERE id = '27ecd0c0-b3b5-4b04-86b8-31882f4fcade';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — North August 85, Central August 70, South August 52 — each is the highest value in its own row.' WHERE id = '4fdc0986-efe0-4820-8f09-93b7db15127f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — North total 278 mm; South total 35 + 48 + 52 + 41 = 176 mm. Difference = 102 mm, which is more than 100.' WHERE id = '5e87a7b1-c6c5-4c6a-bb3a-9c158a92a5b9';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — South total 176 ÷ 4 = 44 mm, which is not less than 40 mm.' WHERE id = 'faa90c8e-448b-4f97-b254-a118cae14305';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — extrapolation beyond the data. The table only covers June–September; predicting October is not supported by what''s given.' WHERE id = 'd3b013d0-8a27-4880-b0a2-bc6aa2a210db';

-- Q: Regional Rainfall Data — jan/apr (61b0e3e1)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — West''s monthly figures are 91, 88, 76, 70. Each is higher than every other region in its column.' WHERE id = '7152a5fa-6453-48f2-9a02-84bf3d62215d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — South total 42 + 38 + 45 + 52 = 177 mm; North Jan+Feb = 85 + 72 = 157 mm. 177 > 157, so the statement is false.' WHERE id = '49986fdc-1a33-43c7-9006-82a0403cf601';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — North went from 85 mm in January to 55 mm in April. 55 < 85, confirming a decrease.' WHERE id = '2462b43a-e5ad-4cbf-9125-d9997df51f84';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — East > South in January, February and March, but in April East (49) < South (52). Fails in April.' WHERE id = 'a5b9dfee-5f71-4587-9b51-9f7799fb9206';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — West''s figures are 91, 88, 76, 70, each lower than the one before.' WHERE id = '0d7ff57a-c713-4224-b0f6-c5bad428d968';

-- Q: Commuter Transport Choices (357570bf)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — car numbers range 280–320 across the week, which exceeds every other method on every day. Even the highest non-car value (bus Wednesday, 160) is far below the corresponding car figure.' WHERE id = '3000dcc1-b430-4340-a1f0-39131ecb7e54';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — bus totals: 145 + 152 + 160 + 148 + 130 = 735, which exceeds 700.' WHERE id = 'edd664f4-3f95-4206-b55c-622f17a1a7ea';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Friday total 280 + 130 + 58 + 42 = 510. Other days all total 580. Friday is the lowest.' WHERE id = '5f8d579f-2a83-407a-bb1e-a4fefe19e736';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. Both car and bus use dropped on Friday; people may have worked from home or taken leave. The drop doesn''t prove a shift to public transport.' WHERE id = '4d99d3cf-a5be-41ad-8e32-ae7fabbcdf0d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Wednesday total 580, bicycle 82. 82 ÷ 580 = 14.1%, less than 15%.' WHERE id = 'f78ddfb5-457c-4b04-a233-34ab38612c89';

-- Q: Urban Green Spaces Study (5a556bed)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. The study shows an association between visits and wellbeing, but it is observational — income, exercise habits and other factors could explain the gap.' WHERE id = 'd5903033-a84a-4453-9b44-4dce93781af9';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 68% of frequent visitors reported exercising. 68% is more than half.' WHERE id = 'aa4f6d13-7c1b-4f05-b384-bb7a1d92bf64';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 40% of green space in three wealthiest boroughs vs. 15% shared by five least affluent. 40% > 15%.' WHERE id = 'd4a1f7ee-0860-434c-93e2-4b4a8b6adbb6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — average vs individuals. An average score of 61 doesn''t mean every infrequent visitor scored below 65; some could be above, some below.' WHERE id = '13a8617e-eb38-4f8a-a96b-77a46a407f26';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — extrapolation. The study is observational and the investment''s outcome is not guaranteed by the data. Association doesn''t prove the intervention will deliver improved wellbeing.' WHERE id = '236345a2-d2e9-4489-9375-b7b3ca72891e';

-- Q: Hospital Bed Occupancy (7aa3b365)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — "critical pressure" is strictly above 90%. General Medicine hit exactly 90% in March, which fails the threshold. So it was not critical in every month.' WHERE id = '40e3edf1-8fcb-4366-9c7e-e04a32207e35';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Paediatrics recorded 65, 70, 68, 72%, the lowest value in every month.' WHERE id = '18a5ae28-3635-4c80-beb5-e15a72677e9d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Geriatrics was above 90% in March (92%) and April (91%) — 2 months. Cardiology was above 90% in February (91%) and March (93%) — also 2 months. Tied, not more.' WHERE id = '9d362f98-9e9c-46b2-966e-458df11a4a2e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — averages: Jan 81.6%, Feb 84.8%, Mar 85.6%, Apr 85.8%. April is highest.' WHERE id = '88801129-e89e-4e67-af0a-22911e626893';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Orthopaedics recorded 76, 80, 85, 82%. None exceed 90%, so it was never under critical pressure.' WHERE id = 'e6533be0-43ee-41cd-993c-ef6c4c1f1fe0';

-- Q: Hospital Discharge Times (c600ca9c)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — General Surgery has the most patients (620) and the shortest average discharge (48 hrs).' WHERE id = '8d23def0-650e-406d-a076-af1b0f34f2a5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation/extrapolation trap. Respiratory has the second-shortest time (64 hrs) but the highest readmission rate (11.3%); Orthopaedics has the longest time with the lowest rate. No clear pattern.' WHERE id = '1330d48a-90a2-4210-89b6-fbe7f2bc03d0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Neurology: 270 × 9.6% = 25.92 readmissions, fewer than 30.' WHERE id = '2ec6a04c-0ca7-4f78-abfa-721352dc8d25';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 480 + 310 + 540 + 620 + 270 = 2,220, which exceeds 2,000.' WHERE id = '8bd82765-ae72-4b75-a029-4cb2a553e1b5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Orthopaedics: 310 × 5.2% ≈ 16.1, the lowest across all wards.' WHERE id = 'bbae4649-47c7-4694-869d-7074e66ea1f0';

-- Q: Apprenticeship Completion (6d5d9c7d)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 78% of 450 = 351, which is more than 350.' WHERE id = '6a2a36f8-5cba-422f-8611-aa5e4433ba71';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 351 completers × 85% ≈ 298, which is more than 290.' WHERE id = 'f53e4ce0-598f-4281-93d4-f04c46ae5ff6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation/causation trap. The provider "attributed" the gap to mentoring, but attribution is not proof; entry requirements or incentives could also explain it.' WHERE id = '272f9a55-f2f7-4b07-b8c0-aeee800e019f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 92% − 68% = 24 percentage points, more than 20.' WHERE id = '1c1a6990-bb44-4e01-982c-9ffaa293ef28';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — non-completers = 450 − 351 = 99, fewer than 100.' WHERE id = '3a7af099-a721-46c5-9c51-5056de4af6ac';

-- Q: Vaccination Rates (b9856ab0)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — flu coverage: 32 → 48 → 71 → 82. Each value is higher than the one before.' WHERE id = '248123ec-3c37-4368-9158-cce334ae96d1';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — COVID Booster coverage for 60–69 is 62%, which exceeds 50%.' WHERE id = 'bca7fa75-4925-4a62-a887-17f0337b533b';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — in the 50–59 group Shingles (8%) is lowest, but in 60–69 Pneumococcal (28%) is lower than Shingles (35%). Not the lowest in every group.' WHERE id = 'c86c88c7-8089-4c0d-9def-89d4c7def8de';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Flu 82>71, COVID 85>78, Shingles 61>52, Pneumococcal 58>45. Every vaccine is higher in 80+.' WHERE id = 'f9c1c24a-c476-496a-9e48-39d818145a7b';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the table shows coverage only, nothing about hospital admissions. The conclusion requires an unstated link.' WHERE id = '1763c292-977a-49f9-a030-58ceb0f2fc07';

-- Q: Microplastic Sampling (b4505912)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — at every depth Beta exceeds Alpha, Gamma and Delta (e.g., surface 72 vs 48, 31, 55). Beta is highest at all four depths.' WHERE id = '38846dfd-ee79-4b0d-8853-01a7d0f49873';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — at Alpha, 50 m = 18 and surface/2 = 24. 18 < 24, so the first site already fails the claim.' WHERE id = 'ce7050be-cb25-4f9b-a181-bd6c55f8bce6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — totals: Alpha 109, Beta 174, Gamma 72, Delta 126. Beta is highest.' WHERE id = 'c0b0f51f-a69a-4ad7-acd1-a26f4cb4cbb6';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — each site''s values strictly decrease from surface to 100 m (e.g., Alpha 48→35→18→8). Pattern holds at every site.' WHERE id = '716c017c-54bb-4fb5-9d53-8ac59a4fca0e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. The table shows concentrations, not mechanisms. Attributing the pattern to settling is an assumption not supported by the data.' WHERE id = 'e8c9de7b-1dbc-4830-bf3c-4f10d81dd6c7';

-- Q: Public Library Membership Survey (a29d3dff)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 52% of 800 = 416 members, which is more than 400.' WHERE id = '9708a223-daa3-4b80-95ff-ba501efc363f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — weekly internet users: 416 × 45% = 187.2. Non-weekly: 384 × 20% = 76.8. 187.2 > 76.8.' WHERE id = '8a7e885e-32c8-4330-aec9-f6a283ac411a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. The council claims borrowing causes higher satisfaction, but the survey only shows an association; borrowers might differ in other engagement factors.' WHERE id = 'ced25456-2a13-453f-9f2f-5fb651781790';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — weekly borrowers: 416 × 70% = 291.2. Non-weekly borrowers: 384 × 40% = 153.6. Total ≈ 445, which is more than 400 (half of 800), so more than half borrow.' WHERE id = '8ac550c2-0d2b-41ad-b513-49a611f23155';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 70% of weekly visitors borrow vs. 40% of non-weekly. 70% > 40%.' WHERE id = 'd771ee72-1690-4054-9821-debcc035d4a8';

-- Q: Pet Ownership Survey (97dfddc0)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — 5 fish tank owners total. The 6 cat-without-garden households can''t own one, but the 10 cat-with-garden households could hold all 5. Possible but not forced, so no guarantee any dog household owns a fish tank.' WHERE id = '2e26d559-f901-4b81-84d7-7c2f3e85346d';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — half of 24 dog-owning households have a garden: 12.' WHERE id = 'da6e13ab-aac6-4d6b-9b0c-beb813174d05';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 16 cat-owning households total, 10 with a garden, so 6 without. 10 > 6.' WHERE id = 'c9f75eea-0fc7-4c9a-b65f-108422e9bb68';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the premises say nothing about dog-owning households without gardens and fish tanks. Some of the 5 fish tank owners could be dog-without-garden households, so we can''t conclude all fish-tank owners have a garden.' WHERE id = 'b292e433-2b2c-4540-9050-f8ffdc6f1875';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — dog-with-garden 12 + cat-with-garden 10 = 22 with a garden. Without = 40 − 22 = 18. 22 > 18.' WHERE id = 'ea7df9e9-d5ed-4927-a97d-0f3d10c3910a';

-- Q: Gym Membership Revenue (c96f63d4)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Q1 total: 30+45+60+12 = £147k. Q4: 24+54+64+14 = £156k. Q4 > Q1.' WHERE id = '9604a782-687b-43f7-a8e1-2cf293bcc0e5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — extrapolation. The question asks what the table shows, not a future projection. We can''t assume the trend continues beyond Q4.' WHERE id = '197f44b7-df33-4e9a-958c-26aa37f04453';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Premium per member: £64,000 / 320 = £200. Basic per member: £24,000 / 800 = £30. Premium > Basic.' WHERE id = '99a4bba7-913a-4f17-ae41-2d5f5498c372';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — student revenue is £12k, £8k, £6k, £14k across the quarters, the lowest figure in every column.' WHERE id = '0b86fb45-3391-436a-9b5c-0935c897a69e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. A revenue drop doesn''t prove dissatisfaction; members could be upgrading or numbers could shift for other reasons.' WHERE id = '5c86e5c8-a98f-46fb-8d8e-ac9a825075f5';

-- Q: Bread Sales by Season (e5d42783)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Q1 total 9.5, white 4.2 / 9.5 = 44.2% ✓. Q2 total 9.6, white 3.8 / 9.6 = 39.6% — below 40%. So not every quarter.' WHERE id = 'da5f8e8e-f601-43da-8f97-b3de77598a9f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Sourdough: Q1 1.8, Q2 2.2, Q3 2.5, Q4 2.1. Sales fell from Q3 to Q4.' WHERE id = 'd90ba7b1-9385-4059-a8a8-4e988fa63de8';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — quarter totals: Q1 9.5, Q2 9.6, Q3 9.7, Q4 10.5. Q4 is highest.' WHERE id = 'ac3e7f8f-cf9e-4c83-9979-efa80fe245a9';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Wholemeal vs Sourdough by quarter: 2.6>1.8, 2.9>2.2, 3.1>2.5, 2.4>2.1. Wholemeal leads all four.' WHERE id = 'd1934342-1f0e-429c-81ba-345189647dde';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — extrapolation beyond the data. The table covers one year; predicting post-Q4 sales is not supported.' WHERE id = 'f2ebc586-1c7c-471c-968b-d1e4bedbb61b';

-- Q: School Attendance Patterns (721d240b)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Year 7: 96%, 95%, 93%. Autumn (96%) and Spring (95%) meet the 95% target; Summer (93%) does not. Two terms.' WHERE id = '7869b1db-8dcd-4908-bafa-85d903e5f6e3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Year 11: 91%, 88%, 85%. Each is the lowest in its term when compared to the other year groups.' WHERE id = '658a6ca3-6d35-49a1-aaaa-1abbe8c48f91';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — every row''s attendance strictly falls across the three terms (Year 7 96→95→93, …, Year 11 91→88→85). All decline.' WHERE id = 'faa432a8-c0c0-49ac-8c85-6c7e7b51a3ad';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — in Autumn, Year 7 (96%) and Year 10 (95%) both meet the 95% target. That''s two, not one.' WHERE id = 'bbe0e8d9-5a97-4ef3-b382-735fd49cc49f';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. The data shows attendance decline, not the reason. Seasonal illness or other factors could explain it.' WHERE id = '181c1d0b-315a-4498-ac84-0f8ca1ae0011';

-- Q: Stamp Collection Categories (68ab2ed2)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — International stamps are never Damaged, so all 5 Damaged stamps must be Domestic.' WHERE id = 'bfebc7ce-482d-4357-a222-cf62bbaed6f5';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the stem says 10 Domestic Used stamps. The statement of 5 contradicts the given data.' WHERE id = 'db721b60-b0a3-4f62-87e6-ce848377cddd';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — the 25 International stamps are split between Mint and Used with no further info. We cannot determine the split, so we cannot conclude which is larger.' WHERE id = 'a9883cc2-fe8c-4d61-8ba4-65d3593dc9c0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — 35 Domestic − 20 Mint = 15 non-Mint Domestic stamps.' WHERE id = 'b740c179-9aec-4372-bfc1-bbce889ca595';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — 20 Domestic Mint plus 0–25 International Mint gives 20–45 Mint total. Could be fewer or more than 30; the data doesn''t pin it down.' WHERE id = 'f7db88b5-5c99-4070-a28f-b3a3c2cd4a03';

-- Q: Factory Production Output (8473df9a)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — line totals: A 655, B 520, C 730, D 450. Line C has the highest total.' WHERE id = '7b4f18f5-e65c-4e04-9f3b-d5294908ce97';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Line B: 98, 102, 115, 108, 97. Output fell from Wednesday to Thursday and again to Friday, so it did not increase throughout the week.' WHERE id = 'b1c3f89c-f3be-4d3c-b4ac-bf4e56178fd3';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Line A total 655, average 655 ÷ 5 = 131, less than 132.' WHERE id = 'ebb961a7-6ea1-4f71-9448-7122706e479a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — Line D: 85, 90, 88, 92, 95. Output fell from Tuesday to Wednesday, so it didn''t increase every day.' WHERE id = '5810ead2-ad1e-46bc-b545-77a71af23220';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — combined totals by day: Mon 453, Tue 469, Wed 469, Thu 485, Fri 479. Thursday is the highest.' WHERE id = '1da2a689-0695-4554-b415-bd88de311b96';

-- Q: Volunteer Shift Survey (62f8be39)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — inclusion–exclusion: 78 + 65 − both = 120, so both = 23.' WHERE id = '77adf051-7ca8-4674-b40d-3536b67d1a68';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — morning only = 78 − 23 = 55. Afternoon only = 65 − 23 = 42. 55 > 42.' WHERE id = 'b75387c5-bade-4171-ae72-17821d27498e';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — unsupported causal assumption. The report notes a correlation between working both shifts and higher satisfaction, but doesn''t attribute it to flexible hours specifically.' WHERE id = 'b52b594f-9313-4937-9c77-725a3f7cd3fe';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. Satisfaction improved since flexible shifts were introduced, but other changes over the two years could explain the improvement.' WHERE id = '76f59b19-e958-4bd5-9d50-c4c1ba6a46e0';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — single-shift volunteers = 55 morning-only + 42 afternoon-only = 97 out of 120 (~81%). Well over half.' WHERE id = '7437c3db-75f9-4541-976e-fea0a58353b3';

-- Q: Bicycle Hire Usage (fbff63c9)
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — Autumn values: Central Park 108, Riverside 72, University 186, Market Square 95. University is highest.' WHERE id = 'd937a580-2b64-44db-8385-76106c1475ec';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — University peaks in Autumn (186), not Summer (124), so not every station peaks in Summer.' WHERE id = 'dec28571-4854-45e7-a1c2-5d8cb9c69a4a';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'Yes — seasonal totals: Spring 501, Summer 737, Autumn 461, Winter 299. Summer is highest.' WHERE id = 'df6d5e30-2d97-4699-81cf-119f621e24cd';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — in Autumn (MS 95 > RS 72) and Winter (MS 45 > RS 38), Market Square exceeds Riverside. Two seasons break the claim.' WHERE id = '4e500157-8121-45f8-b01a-799bc5607541';
UPDATE "public"."timed_decision_making_question_statements" SET answer_reason =
'No — correlation vs causation. The data shows numbers, not reasons. Attributing the decline to cold weather is an unstated assumption.' WHERE id = '373f8b8e-a6a0-40a0-be68-1244cdb843ec';

COMMIT;


