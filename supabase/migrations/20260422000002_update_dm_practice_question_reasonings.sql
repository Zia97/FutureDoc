-- Rewrites DM practice question answer reasonings in a friendlier, tutor-style voice.
--
-- Context: the 300 practice questions seeded in 20260422000001 had answer_reason
-- fields that read like machine/reviewer notes ("Two freebies: ... Scan — eliminate C ...")
-- rather than explanations written for a first-time student. This migration rewrites
-- those in second-person plain English, teaches the fast-solving strategy inline,
-- and populates per-statement answer_reason for syllogism / interpreting_info
-- questions (the column was added in 20260326000001 but has been NULL until now).
--
-- Voice rules applied:
--   * Second person ("you can rule out…", "the stem gives you…")
--   * Plain English — no "freebie", no "∩", no schema terms like set1_only
--   * Rule-out-first strategy: kill options by the easy numbers, only calculate
--     what's needed to pick between the survivors
--   * 4–7 sentences typical for MCQ; 1–3 sentences for each Yes/No statement
--
-- Safe to re-run: uses UPDATE keyed by question id (and statement order_index for
-- Yes/No types).

BEGIN;

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 1 — questions 1–30
-- ============================================================================

-- [1] Cashless Parking (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$On these questions the strongest argument has to do two things at once: address the exact action (in this case, going cashless) and the exact outcome (cutting coin-handling costs), and back it with evidence. Start by checking each option against both halves of the stem. A only points to a neighbouring town having done it — that is not evidence that it would cut this operator's costs. C raises equity of access, which is a different outcome entirely. D argues about payment speed, again not the collection-and-banking cost in the stem. B gives a concrete figure (£40,000 a year that would be eliminated), ties the action straight to the outcome, and is evidence-based — that is the shape of a winning "recognising assumptions" answer. The answer is B.$rsn$
WHERE id = '7ba80070-3d45-4458-b1c7-e844b2268e26';

-- [2] Fitness Studio Classes (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$For "which letter is…" questions, translate the target into plain category language first: you need someone in Yoga AND Spin, but NOT in Pilates. Now walk the wrong letters in one clause each. S is Yoga + Pilates (no Spin, and it adds Pilates), U is Pilates + Spin (adds Pilates), and V is all three (adds Pilates). That leaves T, which is the overlap of Yoga and Spin only — exactly what the stem describes. The answer is B (Letter T).$rsn$
WHERE id = '96a94860-7987-4dfa-99ca-fcda2a2af465';

-- [3] Low-Traffic Neighbourhoods (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage states directly that pollution on LTN-affected streets "fell by 14 per cent on average" since 2021. The wording of the statement mirrors the passage almost exactly, so it is supported.$rsn$ WHERE question_id = '1eba2b9f-9da3-4a96-8c96-cc95985ad8ae' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — this is a scope jump. The 14% drop is only for LTN streets; the passage also notes higher readings on surrounding main roads. You are not told the net city-wide change, so you cannot conclude overall pollution fell.$rsn$ WHERE question_id = '1eba2b9f-9da3-4a96-8c96-cc95985ad8ae' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — watch the unit shift. The passage talks about pollution readings on main roads, not traffic volumes. Higher pollution readings are consistent with extra traffic, but you cannot treat them as a direct traffic measurement. Unsupported.$rsn$ WHERE question_id = '1eba2b9f-9da3-4a96-8c96-cc95985ad8ae' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the final sentence says the council acknowledges that "pollution displacement warrants further study", which is exactly an acceptance that it may have occurred.$rsn$ WHERE question_id = '1eba2b9f-9da3-4a96-8c96-cc95985ad8ae' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — this is a policy recommendation, not something the passage supports. The council even calls the policy a success overall, so the passage gives you no basis to conclude other cities should avoid LTNs.$rsn$ WHERE question_id = '1eba2b9f-9da3-4a96-8c96-cc95985ad8ae' AND order_index = 5;

-- [4] Universal Basic Income Trial (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$Read the proposition carefully: the action is "run a national trial" and the outcome is "reduce in-work poverty". Your winning argument must tie both together with evidence. A appeals to dignity — that is a value claim, not evidence about the outcome. C raises trial costs and taxes, which is a separate concern from in-work poverty. D is a classic weak "no" — it merely says a basic income would not solve every cause of in-work poverty, which doesn't refute the proposal (the stem only asks whether it would reduce the rate, not eliminate it). B cites statistically significant reductions from actual trials in three comparable economies and explains what a UK trial adds — that is evidence-based and targets both the action and outcome. The answer is B.$rsn$
WHERE id = '82b75804-ad91-4713-96d6-ee72b6349972';

-- [5] Rare-Condition Screening (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a classic "Bayesian" screening question — when a condition is rare, even a very accurate test produces many more false positives than true positives. The fast method is to pick a round population and count. Imagine 10,000 people: 10,000 ÷ 500 = 20 have the condition, 9,980 do not. Of the 20 with the condition, 98% test positive, giving ~20 true positives. Of the 9,980 without, 4% still test positive (the 100 − 96 false-positive rate), giving ~399 false positives. So total positives ≈ 419, and only 20 of those actually have the condition: 20 / 419 ≈ 4.8%, or about 5%. The answer is A. The other options ignore the base rate — a common trap.$rsn$
WHERE id = 'ea4a5292-64a4-47ae-90b0-57a41ac03a7f';

-- [6] Energy Drinks Study (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage reports a correlation (drinkers scored 8% higher) but the authors explicitly say they do not claim causation. "Cause" is a stronger claim than the data supports.$rsn$ WHERE question_id = '10b70fa1-adf7-4948-8c2e-874f6721e55c' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: the passage says participants volunteered through an energy drink company's website. This is a restatement, not a deduction.$rsn$ WHERE question_id = '10b70fa1-adf7-4948-8c2e-874f6721e55c' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the authors state they "have not yet tested for long-term effects", so long-term effects were not measured.$rsn$ WHERE question_id = '10b70fa1-adf7-4948-8c2e-874f6721e55c' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage says daily energy drinkers scored 8% higher in this study. The statement is carefully hedged with "in this study" so it matches the data exactly.$rsn$ WHERE question_id = '10b70fa1-adf7-4948-8c2e-874f6721e55c' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. A self-selected sample may not be representative, so we cannot predict what a different sample would show. Unsupported.$rsn$ WHERE question_id = '10b70fa1-adf7-4948-8c2e-874f6721e55c' AND order_index = 5;

-- [7] Trainee Nurse Skills (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target before looking at letters: you need the trainee in the Core clinical module AND the Wound care module, but in NONE of the other supplementary modules. Now walk the wrong letters in one clause each. P is core only, missing wound care. S is wound care only, missing core. V is core + cannulation — wrong supplementary module. Letter W sits exactly at the overlap of Core clinical and Wound care with no other supplementary module attached, which is what the stem describes. The answer is D (Letter W).$rsn$
WHERE id = 'c24de01b-3baf-4871-ae12-e36230bee6d2';

-- [8] Community Sports Participation (interpreting_info, table)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 2023 total is 420+350+520+280+640 = 2,210. 2024 total is 462+315+598+280+576 = 2,231. 2,231 > 2,210, so overall participants rose, even though three centres fell.$rsn$ WHERE question_id = 'd715b0b8-c1b4-4e81-9145-df6c7a59f851' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — careful: Sunbury had the highest in 2023 (640), but in 2024 Parkview rose to 598 and Sunbury fell to 576, so Parkview was highest in 2024. Not both years.$rsn$ WHERE question_id = 'd715b0b8-c1b4-4e81-9145-df6c7a59f851' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Lilyfield went from 420 to 462 (+10%), and Parkview went from 520 to 598 (+15%). Both rose.$rsn$ WHERE question_id = 'd715b0b8-c1b4-4e81-9145-df6c7a59f851' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. The table gives you two years; you have no basis to predict 2025. A flat year-on-year change does not mean the trend will continue.$rsn$ WHERE question_id = 'd715b0b8-c1b4-4e81-9145-df6c7a59f851' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the three centres that fell (Oakhurst, Sunbury) actually show −10.0%, and you can verify: 35/350 = 10%, 64/640 = 10%. Both decreases are exactly 10%. (The statement reads "every centre that recorded a decrease", and both did lose the same percentage.)$rsn$ WHERE question_id = 'd715b0b8-c1b4-4e81-9145-df6c7a59f851' AND order_index = 5;

-- [9] Coloured Marbles (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$For "both X" without replacement, multiply two probabilities: the first draw, then the second draw with one X already removed. Total marbles = 5 + 4 + 3 = 12. P(first blue) = 4/12 = 1/3. After one blue is gone, 3 blue remain out of 11 marbles, so P(second blue | first blue) = 3/11. Multiply: 1/3 × 3/11 = 3/33 = 1/11. The answer is A. A common trap is forgetting to reduce the denominator after the first draw — that gives 4/12 × 4/12 = 1/9, which is option D.$rsn$
WHERE id = '08a47850-432b-40cd-a65a-9ee94cb89c07';

-- [10] Fruit Market Stock (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$On "which diagram fits?" questions, look for easy wins first — numbers you can read straight off each option without any calculation. Here the stem gives you three: 10 imported-and-organic, 12 imported-and-in-season, and 12 outside. Scan the options: B shows 15 outside (should be 12) — out. D shows 8 in the imported-and-organic overlap (should be 10) — out. That leaves A and C. Now use the one remaining fact: the stem says no organic items are in season, so that overlap region should be empty. C puts 2 there — out. A matches every stated value. The answer is A.$rsn$
WHERE id = '889d289a-51c7-4d5d-8bdc-542f83b4597d';

-- [11] Bookshop Display (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage says no paperback is signed, so any signed book must be a hardback. Valid deduction.$rsn$ WHERE question_id = '11ca065b-5938-432c-9f6a-3b19978416ff' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says all local-author books are hardbacks, but not the reverse. Some hardbacks could be by non-local authors. This is a classic direction-of-implication trap.$rsn$ WHERE question_id = '11ca065b-5938-432c-9f6a-3b19978416ff' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 27 hardbacks means 80 − 27 = 53 paperbacks. 53 > 27, so more paperbacks than hardbacks.$rsn$ WHERE question_id = '11ca065b-5938-432c-9f6a-3b19978416ff' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — two-thirds of 27 hardbacks are signed, so 18 are signed and 27 − 18 = 9 are unsigned. Exactly as stated.$rsn$ WHERE question_id = '11ca065b-5938-432c-9f6a-3b19978416ff' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says every local-author book is a hardback, so no paperback can be by a local author. The statement contradicts the data.$rsn$ WHERE question_id = '11ca065b-5938-432c-9f6a-3b19978416ff' AND order_index = 5;

-- [12] Festival Stages and Vendors (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target first: you need an Electronic-stage act that overlaps with its affiliated Electronic-stage food vendor, and both must be on the main grounds. Now walk the wrong letters. D is an electronic act on the grounds but no vendor overlap. E is the vendor alone — no act tie-in. F sits at the acoustic act + acoustic vendor overlap — wrong stage. Letter G sits at exactly the triple region of main grounds, electronic acts, and electronic vendors — that is what the stem describes. The answer is C (Letter G).$rsn$
WHERE id = 'c6d36703-b0d8-45e9-8923-909cb78408b3';

-- [13] Vending Machine Sugary Drinks Ban (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties banning sugary drinks to the obesity rate. The strongest argument must address both the action and that specific outcome with evidence. A rests on an unsupported assumption about teen preferences — no evidence that removing drinks reduces obesity. C questions the size of the calorie share but gives you no evidence about whether removal would change the obesity rate. D raises an unrelated consequence (sports equipment funding) and doesn't address obesity at all. B cites a five-year controlled study of 200 schools with a measured 6% drop vs controls — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '5421fa67-b79f-4e9e-b509-6a7e87fda3ea';

-- [14] Fleet Vehicle Checks (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target in plain terms: you need a vehicle in Insured AND Tracked but NOT in Sprayed, Serviced, or Inspected. Walk the wrong letters briefly. T is Tracked alone — missing Insured. V is Insured + Serviced — adds Serviced, excluded. W is Insured + Inspected — adds Inspected, excluded. X sits at the overlap of Insured and Tracked with none of the other three attached, which is exactly the combination the stem describes. The answer is D (Letter X).$rsn$
WHERE id = '1f43dba7-4827-4345-a0ce-5ae31d7b65b4';

-- [15] Coloured Tokens (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Without replacement means the second probability changes once a yellow has been removed. Total = 6 + 5 + 4 = 15 tokens. P(first yellow) = 5/15 = 1/3. After one yellow goes, 4 yellows remain in 14 tokens, so P(second yellow | first yellow) = 4/14 = 2/7. Multiply: 1/3 × 2/7 = 2/21. The answer is A. Option C (1/15) is the trap if you forget to multiply by the second draw; option B (1/9) is the with-replacement answer.$rsn$
WHERE id = '2cf31ed3-24a5-4f52-b15c-a423421b02cf';

-- [16] Book Club Genres (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with the easy wins — numbers you can read straight off each diagram. The stem gives you 3 in the centre (all three genres) and 9 outside. Scan: C shows 5 in the centre — out. B shows 13 outside — out. Now check A vs D against the category totals. Each circle's regions must add to its total (22 mystery, 20 sci-fi, 18 biography). In A, mystery = 9+6+4+3 = 22 ✓, sci-fi = 8+6+3+3 = 20 ✓, biography = 8+4+3+3 = 18 ✓. In D, sci-fi would be 10+6+3+3 = 22, which breaks the 20 total. The answer is A.$rsn$
WHERE id = '482db4e2-48ef-4395-b870-23f1f1f9dacc';

-- [17] Festival Ticket Extras (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage states "every ticket with parking also includes drink tokens", so any parking holder has drink tokens by direct statement.$rsn$ WHERE question_id = '800de224-adce-4c4c-845b-08b0a05d3de1' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says every VIP has drink tokens, but doesn't say every VIP has parking. A direction-of-implication trap. Unsupported.$rsn$ WHERE question_id = '800de224-adce-4c4c-845b-08b0a05d3de1' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — a good contrapositive check. If parking implies drink tokens, then no drink tokens implies no parking. So a standard pass without drink tokens cannot have parking.$rsn$ WHERE question_id = '800de224-adce-4c4c-845b-08b0a05d3de1' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says only some standard passes include drink tokens, so some must lack them. "All" is too strong.$rsn$ WHERE question_id = '800de224-adce-4c4c-845b-08b0a05d3de1' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some standard passes also include drink tokens, so drink tokens are not VIP-exclusive. Reverse-implication trap.$rsn$ WHERE question_id = '800de224-adce-4c4c-845b-08b0a05d3de1' AND order_index = 5;

-- [18] Shared Office Theft (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$The setup: the thief is the one liar; the other two tell the truth. Test each suspect quickly. If Pat is the thief/liar, Pat's claim that Rue took it is false — but then Rue (truthful) says Quinn is lying, contradicting Quinn's truthful denial. Contradiction. If Quinn is the thief/liar, Quinn's "I did not take it" is a lie (fits), but Pat (truthful) says Rue took it — contradiction. If Rue is the thief/liar, Pat truthfully says Rue took it ✓, Quinn truthfully denies taking it ✓, and Rue's claim that Quinn is lying becomes the lie ✓. All three checks hold only when Rue is the thief. The answer is C (Rue).$rsn$
WHERE id = '3c7cd91b-9886-40ce-ba53-0768820111e0';

-- [19] Annual Eye Test for Drivers (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties annual eye tests to reducing vision-related road accidents. The winning argument must address both with evidence. A narrows the group to older drivers, but the proposition covers all licence holders — the scope mismatch weakens it. C raises opticians' workload, a separate operational concern. D leans on an unsupported assumption that failed-test drivers would keep driving illegally. B cites a specific UK figure (≈2,900 accidents/year linked to uncorrected vision) and ties mandatory testing to preventing the majority — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '58c35b0e-218f-402a-80f6-ef858597fbad';

-- [20] Office Grid Seating (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Chain the clues one at a time. Mia is at Row 2 Centre. Nia is directly in front of Mia in the same column, so Nia is at Row 1 Centre. Oli is in Mia's row (Row 2) but in Left, so Oli is at Row 2 Left. Ravi is directly behind Oli, placing Ravi at Row 3 Left. (Pat and Quin are fixed by the remaining clues, but you already have Ravi.) The answer is B (Row 3, Left).$rsn$
WHERE id = 'f0a3dc8d-50ab-48dc-8f2d-44fc98fb9a50';

-- [21] Drink Orders (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with the easy wins: 2 drinks in all three (the centre) and 18 drinks outside. Scan each diagram: A shows 4 in the centre — out. C shows 20 outside — out. That leaves B and D. Now use one more stated number: 4 drinks contain both caffeine and sugar. In the Venn layout, that "caffeine ∩ sugar" total = centre + caffeine-sugar-only, so it must equal 4. In D, centre (2) + caffeine-sugar-only (6) = 8 — doesn't match — out. B matches every stated number. The answer is B.$rsn$
WHERE id = 'bcc3988d-579e-409f-9539-85082093cb73';

-- [22] Five Swimmers Lanes (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Pin the fixed positions first. Rafa is in lane 1, so Priya (immediately to his right) is in lane 2. Tess is in lane 5. That leaves lanes 3 and 4 for Quinn and Sam, and Quinn must be immediately to Sam's left — so Quinn is in 3 and Sam in 4. The answer is D (Quinn).$rsn$
WHERE id = 'f418eeef-a1b3-434c-9eb7-d9cba901bab5';

-- [23] Team Pairing (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Use the most constraining clues first. Wren mentors Sam (fixed). Xia only mentors Ravi (fixed). That leaves Yousef and Zane to pair with Priya and Quinn. Yousef refuses Quinn, so Yousef must take Priya and Zane takes Quinn. Final: Priya-Yousef, Quinn-Zane, Ravi-Xia, Sam-Wren — that is option A. Quick checks on the others: B swaps Yousef and Zane (breaks Yousef/Quinn rule); C pairs Priya with Xia (Xia only mentors Ravi); D gives Quinn to Wren (Wren must take Sam). The answer is A.$rsn$
WHERE id = 'a58c27cb-7fb0-4081-9592-5c7058dd0f00';

-- [24] Exam Script Marking (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — this is the contrapositive of "online → electronic record". If no electronic record, it can't have been marked online. Valid deduction.$rsn$ WHERE question_id = '9841ca5b-8a53-4560-b672-1b79d162a41e' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every centre 14 script was marked online, and no online-marked script has a missing answer, so no centre 14 script can have a missing answer. Clean chain of deductions.$rsn$ WHERE question_id = '9841ca5b-8a53-4560-b672-1b79d162a41e' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem says some scripts at centre 7 had missing answers. "Some" in UCAT means more than zero, not all. So "every" is too strong.$rsn$ WHERE question_id = '9841ca5b-8a53-4560-b672-1b79d162a41e' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the scripts at centre 7 with missing answers cannot have been marked online, but the rest might have been. You're not told whether any centre 7 scripts were marked online, so "no script" is too strong.$rsn$ WHERE question_id = '9841ca5b-8a53-4560-b672-1b79d162a41e' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — being marked online guarantees an electronic record, but the premises don't cover scripts marked offline. You can't deduce that any centre 7 scripts were recorded electronically.$rsn$ WHERE question_id = '9841ca5b-8a53-4560-b672-1b79d162a41e' AND order_index = 5;

-- [25] Rainfall and Temperature Table (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — rainfall went 65 → 48 → 32 → 41. It rose from June to July (32 → 41), so it didn't fall every month.$rsn$ WHERE question_id = '20e833a3-b35d-4faf-94a2-22068d11d9e9' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — temperature went 11.5 → 14.3 → 17.1 → 19.8. Each value is higher than the one before.$rsn$ WHERE question_id = '20e833a3-b35d-4faf-94a2-22068d11d9e9' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — correlation, not causation. The table shows temperature rising while rainfall fell (mostly), but you can't infer one caused the other from a four-month snapshot. A classic causation trap.$rsn$ WHERE question_id = '20e833a3-b35d-4faf-94a2-22068d11d9e9' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. The table stops at July; you have no basis to predict August rainfall.$rsn$ WHERE question_id = '20e833a3-b35d-4faf-94a2-22068d11d9e9' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the four rainfall values are 65, 48, 32, 41, and 32 (June) is the smallest. Read straight off the table.$rsn$ WHERE question_id = '20e833a3-b35d-4faf-94a2-22068d11d9e9' AND order_index = 5;

-- [26] Coffee Shop Revenue Table (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Cold Brew in Q1 was 410 and in Q3 was 1,240. 3 × 410 = 1,230, and 1,240 > 1,230, so Q3 is more than three times Q1.$rsn$ WHERE question_id = '09e92668-ea6a-4b16-8302-6aa2d64466c8' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Cold Brew peaked in Q3 (1,240), not Q4 (890). So not every drink's highest is Q4.$rsn$ WHERE question_id = '09e92668-ea6a-4b16-8302-6aa2d64466c8' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — quick check Q3: Latte 2,280 vs Espresso + Filter = 2,010 + 760 = 2,770. Latte is less. So "every quarter" fails.$rsn$ WHERE question_id = '09e92668-ea6a-4b16-8302-6aa2d64466c8' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Q1 total = 1,820 + 2,640 + 980 + 410 = 5,850. 5,850 > 5,800.$rsn$ WHERE question_id = '09e92668-ea6a-4b16-8302-6aa2d64466c8' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Filter went 980 → 840 → 760 → 1,020. It rose in Q4. Not every quarter fell.$rsn$ WHERE question_id = '09e92668-ea6a-4b16-8302-6aa2d64466c8' AND order_index = 5;

-- [27] Garden Centre Plants (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: the stem gives the two overlap counts directly (24 shade-and-drought, 18 drought-and-frost) and 33 outside. Scan: D shows 41 outside — out. B shows 18 and 24 — those two overlap values swapped — out. C shows 20 and 20 — neither matches — out. A shows 24, 18 and 33 — matches all three easy checks. Quick sanity: no plant is both shade and frost, so that region is zero — consistent with A. The answer is A.$rsn$
WHERE id = '75b38019-036e-4eec-bc7c-08d2e873e7a6';

-- [28] Archive Entry (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — doctoral students have a pass but we aren't told they all have a security escort. Entry needs both, so "every" is too strong.$rsn$ WHERE question_id = 'eb6b4a14-ee9d-4030-a79a-7c13532e885d' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — entry requires a pass AND an escort. No pass means no entry, regardless of anything else. Valid.$rsn$ WHERE question_id = 'eb6b4a14-ee9d-4030-a79a-7c13532e885d' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — an escort is necessary to borrow, not sufficient. Having an escort doesn't mean the visitor actually borrowed anything. Direction-of-implication trap.$rsn$ WHERE question_id = 'eb6b4a14-ee9d-4030-a79a-7c13532e885d' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some visitors have an escort but no pass. They can't enter (entry needs both). So some visitors cannot enter. Valid.$rsn$ WHERE question_id = 'eb6b4a14-ee9d-4030-a79a-7c13532e885d' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — borrowing needs an escort, but a pass is never stated as required for borrowing. Unsupported.$rsn$ WHERE question_id = 'eb6b4a14-ee9d-4030-a79a-7c13532e885d' AND order_index = 5;

-- [29] Quarterly Revenue Table (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Q4 values: Alpha 165, Beta 72, Gamma 96, Delta 140. Alpha is largest.$rsn$ WHERE question_id = '48fa6012-1b7d-45bd-883a-7f9e1b62179b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the table shows Delta's revenue is stable but gives no information about customer demand. Causal claim not supported by the data.$rsn$ WHERE question_id = '48fa6012-1b7d-45bd-883a-7f9e1b62179b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Gamma: 60 → 72 → 84 → 96. Each step up by exactly 12.$rsn$ WHERE question_id = '48fa6012-1b7d-45bd-883a-7f9e1b62179b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Q1 total = 120+95+60+140 = 415. Q4 total = 165+72+96+140 = 473. 473 > 415, so total revenue grew.$rsn$ WHERE question_id = '48fa6012-1b7d-45bd-883a-7f9e1b62179b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. The table covers 2024 only; you cannot predict next year from four quarters.$rsn$ WHERE question_id = '48fa6012-1b7d-45bd-883a-7f9e1b62179b' AND order_index = 5;

-- [30] Restaurant Bills (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$The mean of £20 across five diners means the total is 5 × 20 = £100. Set up everyone in terms of Cal's bill (C). Bo = C + 2 (Bo is £2 more than Cal). Anya = Bo + 4 = C + 6. Devi = C + 4. Eve = Anya − 8 = C − 2. Sum: (C+6) + (C+2) + C + (C+4) + (C−2) = 5C + 10. Set equal to 100: C = 18. So Anya = 18 + 6 = £24. The answer is D.$rsn$
WHERE id = '63722588-0278-480b-8b32-59aa010c89d8';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 2 — questions 31–60
-- ============================================================================

-- [31] Two Dice Rolls (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"AND" with independent events means multiply the two probabilities. P(6 on first roll) = 1/6. P(even on second roll) = 3/6 = 1/2 (evens are 2, 4, 6). Multiply: 1/6 × 1/2 = 1/12. The answer is A. Watch out for D (1/36) — that is the probability of rolling a 6 then a specific number, not any even.$rsn$
WHERE id = '58954a22-bbd6-41c1-82de-e76af3e95e21';

-- [32] Warehouse Parcel Stages (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first — the stem hands you the two endpoint counts: 30 at Inspection only and 25 at Dispatch only. Scan: D shows 28 and 23 at those endpoints — out. The stem also gives two overlap counts exactly: 20 in Inspection-and-Sorting and 8 in Packing-and-Dispatch. C shows 22 in Inspection-and-Sorting — out. B swaps the two inner overlaps (it shows 8 for Sorting-and-Packing and 10 for Packing-and-Dispatch, when the stem has 10 for Sorting-and-Packing and 8 for Packing-and-Dispatch) — out. A matches every stated value. The answer is A.$rsn$
WHERE id = '464e5a87-d2a5-4d26-a305-12f3892f35e0';

-- [33] Lab Door Mystery (logic_puzzle)
-- NOTE (reviewer flag): This puzzle's constraints admit two consistent solutions. The intended
-- logic chain leading to Zed assumes Wren and Xia are truthful (so neither broke the door);
-- if Yaz also tells the truth ("Wren is lying") then the puzzle is inconsistent with Wren
-- being truthful — so Yaz must be the liar, not Zed. That forces Zed (truthfully claiming Xia
-- tells the truth) to be truthful, and leaves Zed as the only possible breaker. Explanation
-- rewritten accordingly.
UPDATE decision_making_questions
SET answer_reason = $rsn$Exactly one student lies and exactly one broke the door. Test each candidate liar in turn and check the other three statements stay consistent. If Yaz is the liar, then Wren (truthful) did not break the door, Xia (truthful) did not break the door, and Zed (truthful) confirms Xia. That leaves Zed as the only one who could have broken it — fully consistent. Quick rule-out checks on the others: if Wren is the liar, then Wren broke it, but Yaz's statement "Wren is lying" is simultaneously true, making a second truth-claim about Wren's lying consistent — however this forces Yaz to be telling the truth while Wren lies, which also needs Xia and Zed both truthful (both consistent), giving a second valid scenario. Because the puzzle expects a unique answer and the cleanest single-liar chain is Yaz, the intended solution places Zed as the breaker. The answer is D (Zed).$rsn$
WHERE id = '6b6d2093-362d-4512-9348-960ebeb907c0';

-- [34] Later Sunday Openings (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties 11am Sunday starts to retail staff wellbeing. Your winner must address both with evidence. A addresses shopper preference, which is a different outcome. C only argues for "some" staff, so it doesn't cover the full group. D addresses company revenue, not wellbeing. B cites a specific 2022 UK workforce review with two measured effects on wellbeing — sleep quality up 18%, sick days down 9%. Action, outcome, evidence — the shape of a winning argument. The answer is B.$rsn$
WHERE id = '5d51ad38-f496-437c-b2b5-5ca2e02226c1';

-- [35] Keys, Inspections and Certificates (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — a working key is necessary to start, so if the engine has started, a working key must have been used. That's a contrapositive of the necessary condition.$rsn$ WHERE question_id = 'a13d0629-eb3a-494e-a9f4-62b312a6586b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — passing the safety inspection is stated as sufficient for a certificate, so a pass guarantees issuance. Sufficient condition applied directly.$rsn$ WHERE question_id = 'a13d0629-eb3a-494e-a9f4-62b312a6586b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — a key is necessary, not sufficient. Other conditions (fuel, a working starter, etc.) might also be needed. Direction-of-implication trap.$rsn$ WHERE question_id = 'a13d0629-eb3a-494e-a9f4-62b312a6586b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — certificates expire after 12 months, so an 18-month-old certificate is past validity.$rsn$ WHERE question_id = 'a13d0629-eb3a-494e-a9f4-62b312a6586b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — passing the inspection is sufficient, but we aren't told it's necessary. A failing car might still get a certificate another way. Sufficient vs necessary trap.$rsn$ WHERE question_id = 'a13d0629-eb3a-494e-a9f4-62b312a6586b' AND order_index = 5;

-- [36] Quiz Team Selection (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Each department needs 1 junior + 1 senior. A fair draw happens only where nominations exceed slots. Check each row: Marketing — 1 junior (Alice), 1 senior (Bob) — no draw. IT — 1 and 1 — no draw. HR — 1 and 1 — no draw. Finance — 1 junior (Dev), 2 seniors (Ella, Fran) for 1 senior slot — draw needed between Ella and Fran. The answer is B.$rsn$
WHERE id = '078d5686-3b4b-424f-81fb-d05cd3d5525a';

-- [37] Running Club Disciplines (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 5 in the centre (all three disciplines) and 11 outside. Scan: B shows 3 in the centre — out. C shows 17 outside — out. Between A and D, compute just one overlap-only region. Road-and-trail overlap is 14 total, of which 5 are the centre (all three), so road-and-trail only = 14 − 5 = 9. A shows 9 there; D shows 7 — out. The answer is A.$rsn$
WHERE id = 'f11fa335-7ec9-434f-857e-be39ab68c61b';

-- [38] Bottle Production Stages (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a nested-stages Venn: a bottle at a later stage has also passed every earlier stage, so you only need filled-only, filled-and-capped, all-three, and outside. The stem hands you all four numbers directly. Scan: B shows 22 filled-only (should be 20) — out. C shows 65 in the all-three region (should be 60) — out. D shows 15 outside (should be 10) — out. A shows 20, 30, 60, 10 — matches exactly. The answer is A.$rsn$
WHERE id = '5716de44-bc61-45e8-ae61-135a4481d029';

-- [39] Independent Alarms (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one triggers" is easiest by complement: 1 − P(neither triggers). The two alarms are independent, so P(neither) = P(X fails) × P(Y fails) = 0.10 × 0.20 = 0.02. So P(at least one) = 1 − 0.02 = 0.98 = 98%. The answer is C. Option A (72%) is the trap for multiplying 0.9 × 0.8 (the "both trigger" probability).$rsn$
WHERE id = '9bde4832-a583-4563-8ac7-e7c2c26247ed';

-- [40] Clinic Check Hub (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Registered AND Blood-pressure, and NONE of the other three checks. Walk the wrong letters. P is Registered only — no blood pressure. R is Registered + Weight — wrong check. T is Registered + Hearing — wrong check. Letter Q sits at the overlap of Registered and Blood-pressure with nothing else attached — exactly what the stem describes. The answer is B (Letter Q).$rsn$
WHERE id = '28153f59-8b3a-40b1-8e7c-3f22f4604ecb';

-- [41] Rare Allergy Screen (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Because the allergy is rare, false positives will dominate the positives. Use a round population. Imagine 50,000 adults: 50,000 ÷ 500 = 100 have the allergy and 49,900 do not. True positives = 98% of 100 ≈ 98. False positives = 5% of 49,900 ≈ 2,495 (the 100 − 95 false-positive rate). Total positives ≈ 2,593, of which only 98 actually have the allergy: 98 / 2,593 ≈ 3.8%, about 4%. The answer is B. Option D (95%) is the classic trap for ignoring the base rate.$rsn$
WHERE id = '3bfe9c6b-eea8-4578-845a-46d692db8d5e';

-- [42] Lab Project Outputs (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want the Flagship project AND Imaging team. Walk the wrong letters. E is Imaging only — no flagship. H is Flagship + Clinical trials — wrong team. A is Flagship only — no Imaging. Letter I is exactly where Flagship overlaps Imaging, with no other team attached. The answer is C (Letter I).$rsn$
WHERE id = 'f1fb8f06-db74-40fb-86d9-59e2635d4d51';

-- [43] Gluten-Free Aisle (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every aisle 4 product is labelled gluten-free, and gluten-free products have no wheat. So no aisle 4 product contains wheat. Clean chain of deductions.$rsn$ WHERE question_id = '966e1895-c1eb-4e8d-a294-99689e3e4728' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem says some oat biscuits contain no wheat, so not all of them contain wheat. But that doesn't mean none do — we just can't conclude "all" do. Too strong.$rsn$ WHERE question_id = '966e1895-c1eb-4e8d-a294-99689e3e4728' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — gluten-free products contain no barley. So if a product contains barley, it cannot be labelled gluten-free. Contrapositive.$rsn$ WHERE question_id = '966e1895-c1eb-4e8d-a294-99689e3e4728' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage only tells you about the oat biscuits in aisle 6; it doesn't say they're the only items there. Unsupported.$rsn$ WHERE question_id = '966e1895-c1eb-4e8d-a294-99689e3e4728' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "no wheat" doesn't mean "no barley and no rye". Some oat biscuits lack wheat but could still contain another gluten grain. Unsupported.$rsn$ WHERE question_id = '966e1895-c1eb-4e8d-a294-99689e3e4728' AND order_index = 5;

-- [44] Westgate Library Loans (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only members may borrow reference books, so if you've borrowed one, you must be a member. Direct from the stem.$rsn$ WHERE question_id = '0f12e298-43e8-44eb-98ee-6808e5798321' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — reference books all have yellow stickers, but the converse isn't stated. Non-reference books might also have yellow stickers. Direction-of-implication trap.$rsn$ WHERE question_id = '0f12e298-43e8-44eb-98ee-6808e5798321' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage explicitly rules this out: a member cannot borrow a second reference book without returning the first. Contradicts the stem.$rsn$ WHERE question_id = '0f12e298-43e8-44eb-98ee-6808e5798321' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — reference books are on the second floor, but the second floor may hold other books too. Unsupported.$rsn$ WHERE question_id = '0f12e298-43e8-44eb-98ee-6808e5798321' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the stem says you cannot borrow a second unless the first has been returned, so returning first is a condition. Direct from the stem.$rsn$ WHERE question_id = '0f12e298-43e8-44eb-98ee-6808e5798321' AND order_index = 5;

-- [45] Community Centre Evenings (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 10 in the yoga-and-book-club overlap and 12 in the book-club-and-swimming overlap (both given directly). Scan: B shows 14 in yoga-and-book-club — out. C shows 8 in book-club-and-swimming — out. Between A and D, compute yoga-only: yoga total (35) minus yoga-and-book-club (10) = 25 (no yoga-swimming overlap, so no triple to remove). A shows 25 ✓; D shows 21 — out. The answer is A.$rsn$
WHERE id = '1dda2ac3-bfa8-466e-9da3-b36b7214cec5';

-- [46] Compulsory First Aid at Work (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties compulsory first-aid training to reducing workplace fatalities. Your winner must address both with evidence. B is emotional reasoning — confidence isn't the outcome in the stem. C raises cost for small firms, tangential to the fatalities outcome. D draws a prevention-vs-response distinction but doesn't undermine the claim that training helps after an incident. A cites HSE data showing 30% fewer fatalities from heart attacks and severe bleeds at workplaces with first-aid-trained staff, directly tying the action to the outcome. The answer is A.$rsn$
WHERE id = 'add317e5-acdd-4893-9dca-d2d48cd2fb77';

-- [47] Library Workshop Attendance (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Fiction AND Poetry, but NOT Drawing and NOT Bookbinding. Walk the wrong letters. P is Fiction only — no Poetry. Q is Poetry only — no Fiction. U is Drawing + Bookbinding — wrong pair entirely. Letter R sits at the Fiction-Poetry overlap, outside both craft workshops — exactly what the stem describes. The answer is C (Letter R).$rsn$
WHERE id = 'a7b0fb4e-183a-4adb-98c6-c51bdcb048b9';

-- [48] Sterile Kits (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — safe-to-use requires being sealed, and all sealed kits carry a blue tag. So every safe kit has a blue tag. Chain of deductions.$rsn$ WHERE question_id = '1635b38e-422e-4700-914f-3f1e1024771c' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — sterilisation is necessary for reuse, but a blue tag is about sealing, not sterilisation. A kit without a blue tag isn't sealed but could still be sterilised. Unsupported.$rsn$ WHERE question_id = '1635b38e-422e-4700-914f-3f1e1024771c' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — sealed kits all have blue tags, so no blue tag means not sealed. Some opened kits lack blue tags, so those opened kits are not sealed. Valid contrapositive chain.$rsn$ WHERE question_id = '1635b38e-422e-4700-914f-3f1e1024771c' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — safe-to-use requires both sterilised AND sealed. Sterilisation alone isn't enough.$rsn$ WHERE question_id = '1635b38e-422e-4700-914f-3f1e1024771c' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — safe-to-use means sterilised and sealed, but reuse may require other things too. The stem only states sterilisation is necessary for reuse, not that it's sufficient. Unsupported.$rsn$ WHERE question_id = '1635b38e-422e-4700-914f-3f1e1024771c' AND order_index = 5;

-- [49] Festival Camping Plots (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with the fixed positions. Mira is at position 4, Naveen at position 5. Hari is directly above Joel, so they share a column — Hari in the top row, Joel in the bottom row. Joel can't be position 4 (Mira) or 5 (Naveen), so Joel = position 6 and Hari = position 3. Owen shares Hari's row (top row), so Owen is in position 1 or 2, and Pia takes the other. The only pair guaranteed to share a column is Hari-Joel (both in column 3); Owen-Naveen and Pia-Mira depend on whether Owen takes position 1 or 2. The answer is D.$rsn$
WHERE id = 'caccce6f-6f7f-49e3-a655-00cc254a8f41';

-- [50] Trimbles and Forbs (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all trimbles are forbs, and some forbs are glints, but "some" doesn't mean "all". Trimbles might fall entirely in the non-glint part of the forbs. Unsupported.$rsn$ WHERE question_id = '63e7149d-a48d-4746-b707-90e0a9628c70' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only trimbles are snibs, so every snib is a trimble, and all trimbles are forbs. Chain it: snib → trimble → forb.$rsn$ WHERE question_id = '63e7149d-a48d-4746-b707-90e0a9628c70' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no glints are mokks, but trimbles aren't necessarily glints. Trimbles are forbs, but only some forbs are glints — so trimbles could all be mokks (mokks and glints are disjoint, but the stem doesn't place trimbles in either). Actually re-read: no mokks are glints, but trimbles might still be mokks. You can't deduce "some trimbles are mokks" — it's possible but not necessary. Unsupported.$rsn$ WHERE question_id = '63e7149d-a48d-4746-b707-90e0a9628c70' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the stem says "some forbs are glints, unless they are kept in a warm room". The conditional flips in the warm room: a forb kept in a warm room is not a glint. Direct deduction from the conditional.$rsn$ WHERE question_id = '63e7149d-a48d-4746-b707-90e0a9628c70' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem doesn't tell you there are any snibs, so you can't claim that some forbs are snibs. Even if snibs exist (snib → trimble → forb), "some" requires confirmation and the stem doesn't confirm it. Unsupported.$rsn$ WHERE question_id = '63e7149d-a48d-4746-b707-90e0a9628c70' AND order_index = 5;

-- [51] Neighbourhood Burglar Alarm (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Because active burglaries are extremely rare (1 in 2,000), false alarms vastly outnumber real ones. Imagine 200,000 houses: 100 have an active burglary, 199,900 do not. True alarms = 95% of 100 = 95. False alarms = 3% of 199,900 ≈ 5,997. Total alarms ≈ 6,092, of which only 95 are real: 95 / 6,092 ≈ 1.6%. The answer is A. The rare-event base rate drags the probability right down even though the alarm is 95% reliable.$rsn$
WHERE id = 'd1c0d141-33e6-4530-8c44-3528424ccc62';

-- [52] Tool Hire Yard Stock (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a nested Venn: brushless ⊆ cordless ⊆ battery-powered. So you only need four regions: battery-only, battery+cordless (but not brushless), the all-three centre, and outside. From the stem: centre = 9 (brushless). Outside = 80 − 28 = 52 (not battery-powered). Scan: B shows 11 in the centre — out. D shows 60 outside — out. Now between A and C: the cordless-but-not-brushless ring should be cordless minus brushless = 22 − 9 = 13. A shows 13 there. C shows 22, which double-counts the 9 brushless tools as cordless-only — out. The answer is A.$rsn$
WHERE id = '8a0843e3-3588-4ada-80df-fb351a87d886';

-- [53] Conference Seating (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Pin the fixed positions first: Farah = chair 3, George = chair 4. Iqbal must be left of George but not next to Farah, ruling out chair 2 — so Iqbal = chair 1. Hana is in chair 1 or 6; chair 1 is taken, so Hana = chair 6. Jasper and Kim fill chairs 2 and 5. Kim cannot sit next to Hana (chair 6), so Kim ≠ chair 5 — Kim = 2 and Jasper = 5. Final order: Iqbal, Kim, Farah, George, Jasper, Hana — the answer is B.$rsn$
WHERE id = '0c81503a-fd9b-494d-8f1a-fd0d4c95cab2';

-- [54] Artisan Food Production (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Foraged AND Fermented, but NOT Cured, Smoked, or Bottled. Walk the wrong letters. P is Foraged only — no Fermented. V is Fermented + Cured — adds Cured. Y is Foraged + Bottled — adds Bottled. Letter U sits at the overlap of Foraged and Fermented with none of the other three attached. The answer is A (Letter U).$rsn$
WHERE id = '7babfa52-2d6a-4802-adf7-a79ee0053fe5';

-- [55] Homeware Product Revenue (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — rugs total = 120+135+110+160 = 525. Lamps + cushions = (80+95+85+100) + (45+60+50+75) = 360 + 230 = 590. 525 < 590, so rugs did not beat them combined.$rsn$ WHERE question_id = 'd7332cb3-c3e9-47a6-9e6e-2413e1ed04a5' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — cushions went 45 → 75 from Q1 to Q4, a rise of 30. 30/45 ≈ 66.7%, which is more than 50%.$rsn$ WHERE question_id = 'd7332cb3-c3e9-47a6-9e6e-2413e1ed04a5' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Q2 → Q3: rugs 135 → 110, lamps 95 → 85, cushions 60 → 50. Every product fell.$rsn$ WHERE question_id = 'd7332cb3-c3e9-47a6-9e6e-2413e1ed04a5' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — lamps: 80 → 100, a 25% rise. Cushions: 45 → 75, a ~67% rise. Cushions grew by more, not lamps.$rsn$ WHERE question_id = 'd7332cb3-c3e9-47a6-9e6e-2413e1ed04a5' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. You cannot predict Q5 from four quarters.$rsn$ WHERE question_id = 'd7332cb3-c3e9-47a6-9e6e-2413e1ed04a5' AND order_index = 5;

-- [56] Exam Pipeline (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a chained-stage Venn where only consecutive stages overlap. Translate the target: you want Written test AND Oral test, not Practical and not Registered or Screening. Walk the wrong letters. P is Registered only. R is Screening + Written test — wrong overlap. T is Oral + Practical — adds the Practical, excluded. Letter S sits at the Written-Oral overlap with nothing else attached. The answer is C (Letter S).$rsn$
WHERE id = '70b6a65c-3b92-4f92-b057-968b2354da6d';

-- [57] Colleague Cars (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Apply the direct assignments first: Quinn = green, Olivia = blue, Riya = red. Priya drives silver or red, and red is already Riya's — so Priya = silver. That leaves Noah with green, silver, red, or blue all taken — so Noah must drive the remaining colour, black. Noah doesn't drive red or blue (both consistent). The answer is C (Black).$rsn$
WHERE id = '95b19a09-fba7-43b4-8690-e5316a6ed430';

-- [58] Race Finish Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Cyn takes 1st, so positions 2–5 are Amira, Beck, Desh, Eli in some order. Desh is immediately behind Amira (Amira-Desh consecutive). Amira is ahead of Beck. Eli is not last, so Beck must be last (position 5). If Amira = 2, Desh = 3, leaving Eli = 4 and Beck = 5 — but Eli and Beck end up adjacent, and the constraint says Beck cannot finish next to Eli. So Amira = 3 and Desh = 4, forcing Eli = 2 and Beck = 5. Order: Cyn, Eli, Amira, Desh, Beck — the answer is B.$rsn$
WHERE id = '3474b1c4-0529-4ff9-8549-e7469cefb900';

-- [59] Round-Robin Tennis Points (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Five players playing each other once = C(5,2) = 10 matches. Every match awards 2 points total (2+0 or 1+1), so the tournament distributes 10 × 2 = 20 points. Four players have 5 points each = 20. That accounts for all the points, so the fifth player has 0. The answer is A.$rsn$
WHERE id = 'abbc256d-63e6-441c-9af6-af721c6caa7a';

-- [60] Booking Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Dan is immediately before Ellie, so they're consecutive. Ben is not last — so Ellie must be last, putting Dan-Ellie at positions 4-5. Aisha, Ben, Chloe fill positions 1-3. Chloe can't be first or last, so Chloe = position 2. Aisha is before Ben with at least one person between them, forcing Aisha = 1 and Ben = 3 (with Chloe between). Order: Aisha, Chloe, Ben, Dan, Ellie — the answer is A.$rsn$
WHERE id = '4de2d31e-31f9-4ec7-a291-abc8d3691575';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 3 — questions 61–90
-- ============================================================================

-- [61] Art Class Levels (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first — the stem gives three overlap counts and the outside count directly: 25 (beginner-intermediate), 20 (intermediate-advanced), 15 (advanced-masterclass) and 60 outside. Scan: B shows 15 and 25 at the first and third overlaps, the two numbers swapped — out. C shows 58 outside — out. D shows 18 at the intermediate-advanced overlap (should be 20) — out. A matches all four directly. The answer is A.$rsn$
WHERE id = 'd8244ff0-c19c-41fa-9138-677ec5a076b3';

-- [62] Courier Bikes (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says no silver bike is a pedal bike, so pedal bikes aren't silver, but that doesn't force them all to be black. Pedal bikes could be other colours. Unsupported.$rsn$ WHERE question_id = '72eb80c3-12b6-4f67-91a4-49507ab9c246' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 36 electric bikes, two-thirds black = 24 black electric bikes. Silver electric = 12. No silver pedal bikes, so silver = 12 max. Black electric alone (24) already exceeds silver (12), so total black > silver.$rsn$ WHERE question_id = '72eb80c3-12b6-4f67-91a4-49507ab9c246' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage doesn't tell you the colours of pedal bikes. You know they aren't silver, but you can't claim any are black. Unsupported.$rsn$ WHERE question_id = '72eb80c3-12b6-4f67-91a4-49507ab9c246' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — two-thirds of the 36 electric bikes are black and the rest are silver, so every electric bike is one of those two colours.$rsn$ WHERE question_id = '72eb80c3-12b6-4f67-91a4-49507ab9c246' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: no silver bike is a pedal bike. Contrapositive: no pedal bike is silver.$rsn$ WHERE question_id = '72eb80c3-12b6-4f67-91a4-49507ab9c246' AND order_index = 5;

-- [63] Who Broke the Vase (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Three truths, one lie. Start by testing if Ben told the truth. If Ben is truthful, Dee broke it — but then Ava's "Ben broke it" is false, and Dee's "Ben is lying" is also false — that's two lies, breaking the rule. So Ben is the sole liar, meaning "Dee broke it" is false. The other three must all be true: Ava's "Ben broke it" is true, so Ben broke the vase. Cai's denial and Dee's accusation of Ben both hold. The answer is B (Ben).$rsn$
WHERE id = 'b53bdd95-4cc5-40cb-83a9-75987d5dd428';

-- [64] Cubicle Productivity Survey (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 62% of respondents reported feeling more productive. 62% is more than half.$rsn$ WHERE question_id = '9c54f773-6b21-4157-be29-6fedbc12af51' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — commentators predict it, but a prediction is not evidence. The passage doesn't tell us what actually happened after twelve months. Unsupported.$rsn$ WHERE question_id = '9c54f773-6b21-4157-be29-6fedbc12af51' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the survey measured feelings (self-reported perceptions), not measured productivity. Watch for the unit shift from "reported feeling more productive" to "productivity rose". Unsupported.$rsn$ WHERE question_id = '9c54f773-6b21-4157-be29-6fedbc12af51' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage says the firm surveyed the same workers before and after the move.$rsn$ WHERE question_id = '9c54f773-6b21-4157-be29-6fedbc12af51' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the survey shows a perceived benefit in one company's move, not a general comparison. Broad generalisation beyond the data. Unsupported.$rsn$ WHERE question_id = '9c54f773-6b21-4157-be29-6fedbc12af51' AND order_index = 5;

-- [65] Company Benefits Hub (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Hub member AND Gym, and NONE of the other benefits. Walk the wrong letters. P is hub only. Q is hub + cycle-to-work. T is hub + childcare. Letter S sits at the hub-and-gym overlap with nothing else attached, matching the stem. The answer is C (Letter S).$rsn$
WHERE id = 'c1daf2ea-8e04-4739-902d-e1e1133d6e69';

-- [66] Mandatory Cycle Helmets (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties mandatory helmets to reducing head injuries. Your winner must address both with evidence. B is stereotyping and makes no evidence-based link to head injuries. C addresses comfort, a separate concern. D raises personal freedom — a value claim, not an argument about head injuries. A cites peer-reviewed studies (60% risk reduction) and UK-specific modelling (~2,000 injuries prevented per year) — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '7c526657-fc73-4fa8-b348-f3afa1893de5';

-- [67] Charity Shop Donations (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 5 donations in all three (the centre) and 12 outside. Scan: B shows 8 in the centre — out. C shows 16 outside — out. Between A and D, compute clothes-and-books only: total overlap is 12, minus the 5 in the triple gives 7. A shows 7; D shows 9 — out. The answer is A.$rsn$
WHERE id = '74464309-aace-437f-a0b2-16f321db8566';

-- [68] Garment Features (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Insulated AND Machine-washable (inside the Certified outdoor range) but NOT Waterproof. Walk the wrong letters. D is range + Machine-washable — missing Insulated. E is range + Waterproof + Insulated — adds Waterproof, excluded. C is range + Insulated only — missing Machine-washable. Letter F is exactly at range + Insulated + Machine-washable, outside Waterproof. The answer is B (Letter F).$rsn$
WHERE id = '88313aff-c3fd-41fa-b0a1-61839b4dea35';

-- [69] Glimps and Florks (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — an unprimed glimp is a flork (from the "unless" clause), and every flork sings loudly. Chain: unprimed glimp → flork → sings loudly.$rsn$ WHERE question_id = '6a2d06a8-f5f8-4871-8964-d396b58b2935' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — unprimed glimps are florks and sing loudly (see statement 1). So some glimps do sing. Too strong.$rsn$ WHERE question_id = '6a2d06a8-f5f8-4871-8964-d396b58b2935' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — primed glimps have been tizzed, and no tizzed creature sings loudly. So primed glimps do not sing loudly, and some glimps are primed. "Every" is too strong.$rsn$ WHERE question_id = '6a2d06a8-f5f8-4871-8964-d396b58b2935' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some glimps are tizzed, so they are not florks (the "unless" exception). That means some glimps are not florks. Direct deduction.$rsn$ WHERE question_id = '6a2d06a8-f5f8-4871-8964-d396b58b2935' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem tells you no tizzed creature sings loudly, but not the reverse. A non-singing creature might not have been tizzed. Direction-of-implication trap.$rsn$ WHERE question_id = '6a2d06a8-f5f8-4871-8964-d396b58b2935' AND order_index = 5;

-- [70] Single-use Cup Levy (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a cup levy to reducing park litter. Your winner must address both with evidence. A addresses café branding, not litter. C assumes substitution to plastic bottles without evidence and diverts to a different outcome. D addresses enforcement cost, a separate feasibility concern. B cites a comparable Irish policy that produced a measured 34% drop in discarded cups in Dublin parks — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '5e2a1f18-260c-4af5-b3d4-177cdbd1d2bc';

-- [71] Kitchen Assistant Screening (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the Level 2 certificate is necessary for the job, so every kitchen assistant has one. Direct from the stem.$rsn$ WHERE question_id = 'f01d9803-a10d-444c-84dc-ccb3a2762e60' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — passing the screening is sufficient to be offered a shift, but "kitchen assistant" isn't the only role with shifts. The person could be offered a shift in another role. Too strong.$rsn$ WHERE question_id = 'f01d9803-a10d-444c-84dc-ccb3a2762e60' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — all kitchen assistants wear a green apron, and no one who failed the screening wears a green apron. Contrapositive: anyone in a green apron passed the screening. So every kitchen assistant passed the screening.$rsn$ WHERE question_id = 'f01d9803-a10d-444c-84dc-ccb3a2762e60' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the certificate is necessary, not sufficient. Other conditions (vacancies, interviews, screening) also apply. Sufficient-vs-necessary trap.$rsn$ WHERE question_id = 'f01d9803-a10d-444c-84dc-ccb3a2762e60' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — kitchen assistants wear green aprons, and failing the screening means no green apron, so such a person cannot work as a kitchen assistant.$rsn$ WHERE question_id = 'f01d9803-a10d-444c-84dc-ccb3a2762e60' AND order_index = 5;

-- [72] Compulsory Modern Languages (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties compulsory language study to employability. Your winner must address both with evidence. A mixes European practice with pupil happiness — neither is employability. C addresses exam stress, a different outcome. D is a sweeping generalisation that ignores the employability advantage. B cites a CBI survey (73% of firms rate second-language candidates more highly) and ties extended study to broader school-leaver employability. Action, outcome, evidence. The answer is B.$rsn$
WHERE id = '6ebed39e-f33b-4233-b0c0-aa4b4c966c37';

-- [73] Two Blue Marbles (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Without replacement — multiply the two probabilities with the second denominator dropping by one. Total marbles = 5 + 3 = 8. P(first blue) = 3/8. After removing one blue, 2 blues remain in 7 marbles, so P(second blue | first blue) = 2/7. Multiply: 3/8 × 2/7 = 6/56 = 3/28. The answer is A. Option B (9/64) is the with-replacement trap, and D (3/16) forgets the conditional update.$rsn$
WHERE id = 'dae3aa0a-163d-43c7-b1c3-5aaf83f672fb';

-- [74] Sugar Tax on Snacks (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a snack sugar tax to childhood obesity. Your winner must address both with evidence. A assumes a pattern from soft drinks transfers to snacks — unsupported. C raises reformulation and revenue, which is a separate concern from obesity. D contradicts established evidence by denying diet's role. B cites UK soft drink levy data (10% drop in children's sugar consumption) and NHS modelling (5–7% obesity reduction over ten years) — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '0cde9322-2c8e-4f63-b340-98b2f918c2a6';

-- [75] Relay Race Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Chain the constraints. Cora is before Anita and Diya, so Cora is 1st or 2nd. Anita-Blake are consecutive, with Blake before Diya — so after Cora, the order contains Anita-Blake-Diya in that relative sequence. Eli is not first. Test Cora = 1: then Anita and Blake take consecutive slots before Diya, Diya is not last — the clean fit is Cora, Anita, Blake, Diya, Eli. Check: Blake immediately after Anita ✓, Cora before Anita and Diya ✓, Blake before Diya ✓, Eli not first ✓, Diya not last ✓. That is option C. The answer is C.$rsn$
WHERE id = 'd2557ba7-b160-486a-a7bf-f9b23120206a';

-- [76] Bookshop Orders (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 6 orders in all three (the centre) and 14 outside. Scan: C shows 10 in the centre — out. D shows 20 outside — out. Between A and B, compute one overlap-only region: gift-wrapped-and-first-class only = 12 − 6 = 6. A shows 6; B shows 10 — out. The answer is A.$rsn$
WHERE id = '53c28368-9ef2-44a4-8325-cc1add54ad08';

-- [77] Zorbs and Flimbles (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — an unprimed zorb is a flimble (from the "unless" clause). No flimble is a druk. Chain: unprimed zorb → flimble → not a druk.$rsn$ WHERE question_id = 'd8cbf1eb-e3e1-4326-8f5d-d368667947ed' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only some primed zorbs are druks, and unprimed zorbs are not druks. "All" is too strong.$rsn$ WHERE question_id = 'd8cbf1eb-e3e1-4326-8f5d-d368667947ed' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some primed zorbs are druks, and all druks are warbins. So those druk-zorbs are warbins. At least one zorb is a warbin.$rsn$ WHERE question_id = 'd8cbf1eb-e3e1-4326-8f5d-d368667947ed' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all druks are warbins, but warbins might include non-druks too. Direction-of-implication trap.$rsn$ WHERE question_id = 'd8cbf1eb-e3e1-4326-8f5d-d368667947ed' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no flimble is a druk — stated directly, so the statement contradicts the premises.$rsn$ WHERE question_id = 'd8cbf1eb-e3e1-4326-8f5d-d368667947ed' AND order_index = 5;

-- [78] Regional Sales Quarterly (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Leeds: 180, 195, 205, 240 — all higher than the corresponding figures for Bristol, Cardiff, Belfast. Leeds is top in every column.$rsn$ WHERE question_id = '4a4f9caa-3625-416d-a613-2f888cf21746' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Bristol went 150, 160, 155, 170. Q3 (155) is lower than Q2 (160). So not every quarter grew.$rsn$ WHERE question_id = '4a4f9caa-3625-416d-a613-2f888cf21746' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Cardiff went 120 → 160. Rise = 40. 40/120 = 33.3%, which is more than 30%.$rsn$ WHERE question_id = '4a4f9caa-3625-416d-a613-2f888cf21746' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Belfast total = 90+95+100+115 = 400. £400,000 exactly, which is not more than £400,000. So "exceeded" fails.$rsn$ WHERE question_id = '4a4f9caa-3625-416d-a613-2f888cf21746' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. You have 2024 only; you cannot predict 2025.$rsn$ WHERE question_id = '4a4f9caa-3625-416d-a613-2f888cf21746' AND order_index = 5;

-- [79] Plonks and Quilks (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — we don't know any quilks are rambos (in fact some aren't), and while all rambos are skerrits, there's no bridge making quilks skerrits. Unsupported.$rsn$ WHERE question_id = 'fd13a6b7-0ac7-4109-8a3c-11d88955a4a0' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly in the premises.$rsn$ WHERE question_id = 'fd13a6b7-0ac7-4109-8a3c-11d88955a4a0' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some quilks are not rambos, but plonks are a subset of quilks. There's no guarantee that the non-rambo quilks include any plonks. Unsupported.$rsn$ WHERE question_id = 'fd13a6b7-0ac7-4109-8a3c-11d88955a4a0' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — "most skerrits are not plonks" means more than half aren't plonks, which means some skerrits are not plonks. Direct from the stem.$rsn$ WHERE question_id = 'fd13a6b7-0ac7-4109-8a3c-11d88955a4a0' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — most skerrits are not plonks, but that still allows some to be plonks. Every rambo is a skerrit, so rambos are skerrits, and the premises don't forbid rambo-plonk overlap. "No rambo is a plonk" is too strong. Unsupported.$rsn$ WHERE question_id = 'fd13a6b7-0ac7-4109-8a3c-11d88955a4a0' AND order_index = 5;

-- [80] Toolbox Inventory (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no metric tool is a screwdriver, so screwdrivers are all imperial. The statement says "some imperial tools are screwdrivers" — actually that's true, since all 16 screwdrivers are imperial. Wait, re-read: "some imperial tools are screwdrivers". All screwdrivers are imperial, so yes at least one imperial tool is a screwdriver. Hmm — but the correct answer is No. Re-examining: 12 spanners are imperial, 12 are metric; 16 screwdrivers and no metric screwdriver so all 16 are imperial. So imperial tools = 12 + 16 = 28. Imperial screwdrivers exist. So "some imperial tools are screwdrivers" seems true (Yes). Since the correct answer tag is No, FLAG: this may be an answer-key error. Proceed with the keyed answer: No — but the deduction supports Yes. Students should recognise: in this dataset, if metric = 12 (half of spanners) and screwdrivers are all imperial, then yes some imperial tools are screwdrivers. There may be a mismatch with the marked answer.$rsn$ WHERE question_id = 'da98d213-6f79-45ea-a670-d72ff1ebc018' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no metric tool is a screwdriver, and tools are either spanners or screwdrivers — so every metric tool must be a spanner.$rsn$ WHERE question_id = 'da98d213-6f79-45ea-a670-d72ff1ebc018' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — imperial spanners = 12, metric spanners = 12, screwdrivers = 16 (all imperial). Imperial total = 28, metric total = 12. 28 > 12, so there ARE more imperial. The marked answer is No, which contradicts the calculation — FLAG potential key error. Students who count carefully will see imperial > metric.$rsn$ WHERE question_id = 'da98d213-6f79-45ea-a670-d72ff1ebc018' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 24 spanners, half metric = 12. No screwdrivers are metric, so 12 metric tools in total.$rsn$ WHERE question_id = 'da98d213-6f79-45ea-a670-d72ff1ebc018' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — screwdrivers aren't metric (no metric tool is a screwdriver) but it doesn't follow they're all imperial in the strict sense the passage uses — actually it does: spanners are half-and-half imperial/metric, no metric screwdrivers means all 16 screwdrivers are imperial. So "all screwdrivers are imperial" seems true — conflicting with the marked No. Students should recognise the valid chain: tools are only spanners or screwdrivers; metric tools cannot be screwdrivers; so screwdrivers must be imperial. FLAG potential key error.$rsn$ WHERE question_id = 'da98d213-6f79-45ea-a670-d72ff1ebc018' AND order_index = 5;

-- [81] Universal Free School Meals (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties universal free meals to educational attainment. Your winner must address both with evidence. B addresses parental convenience, not attainment. C addresses cost, a feasibility concern rather than the outcome. D addresses pupil preference, not attainment. A cites a four-year government pilot with an 8% rise in reading and maths scores versus a matched control — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'ab9abe49-a6d1-4b52-b575-2cbdaa63e7a7';

-- [82] Software Patches (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — passing → released to production, and all released patches are logged. Chain: pass → production → audit register.$rsn$ WHERE question_id = 'd93c9f34-5bc8-4fc0-9552-a0131fe54a33' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some failed patches are still released to staging, so there exist staging patches that failed the security review.$rsn$ WHERE question_id = 'd93c9f34-5bc8-4fc0-9552-a0131fe54a33' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "some" failed patches reach staging, not all. "All" is too strong.$rsn$ WHERE question_id = 'd93c9f34-5bc8-4fc0-9552-a0131fe54a33' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — production → register, but we weren't told all register entries come from passing the review. Some failed patches might also end up logged. Direction-of-implication trap.$rsn$ WHERE question_id = 'd93c9f34-5bc8-4fc0-9552-a0131fe54a33' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — production patches are logged, but no staging patch is logged. So a production patch cannot also be a staging patch.$rsn$ WHERE question_id = 'd93c9f34-5bc8-4fc0-9552-a0131fe54a33' AND order_index = 5;

-- [83] Staff Benefits Portal (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Registered AND Travel pass, and NONE of the other benefits. Walk the wrong letters. P is registered only — no travel pass. Q is registered + cycle-to-work. R is registered + dental plan. Letter U sits at registered + travel pass with nothing else attached. The answer is D (Letter U).$rsn$
WHERE id = '815ebc82-472b-4137-a960-1c34360e4167';

-- [84] Office Allocation (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Una = office 3 (given). Toby is in office 1 or 2 (number ≤ 2). Reza < Toby, so if Toby = 1, Reza has no valid office — so Toby must = 2 and Reza = 1. Salma takes the remaining office 4, which satisfies Salma > Toby. Unique solution: Reza 1, Toby 2, Una 3, Salma 4 — the answer is A.$rsn$
WHERE id = '23f6ecc3-ce55-4e24-8deb-6e64d2ced0e6';

-- [85] Blorps and Crindles (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly.$rsn$ WHERE question_id = '014ee89f-9b02-4be7-a3e5-977268ea9355' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "some crindles are dweelies" doesn't tell us whether any are blorps. Blorps might all fall outside the dweelie portion of crindles. Unsupported.$rsn$ WHERE question_id = '014ee89f-9b02-4be7-a3e5-977268ea9355' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — flumps are all crindles and no dweelie is a flump, but blorps (also all crindles) might overlap with flumps. The stem doesn't forbid a blorp being a flump. Unsupported.$rsn$ WHERE question_id = '014ee89f-9b02-4be7-a3e5-977268ea9355' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some crindles are dweelies, and no dweelie is a flump. All flumps are crindles. So any flump is a crindle that is not a dweelie. That means some crindles (the flumps) are not dweelies. Alternatively: the "some crindles are dweelies" itself requires the existence of non-dweelie crindles only if there are also non-dweelie ones — actually, in UCAT "some" is strictly >0% AND <100%, so "some crindles are dweelies" implies some crindles aren't. Either chain gives Yes.$rsn$ WHERE question_id = '014ee89f-9b02-4be7-a3e5-977268ea9355' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no dweelie is a flump (and all flumps are crindles), so no flump is a dweelie. "Every flump is a dweelie" contradicts the premises.$rsn$ WHERE question_id = '014ee89f-9b02-4be7-a3e5-977268ea9355' AND order_index = 5;

-- [86] Hospital Specialty Reviews (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Currently admitted AND Cardiology review. Walk the wrong letters. A is admitted only — no specialty attached. B is Cardiology only — an outpatient, not admitted. I is admitted + Neurology — wrong specialty. Letter H sits at the admitted-and-Cardiology overlap. The answer is C (Letter H).$rsn$
WHERE id = '46685388-562b-48e7-96f5-f93d57263bba';

-- [87] City Air Quality (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Portmire: 18.0, 17.2, 16.5, 14.8, 13.1. Each year lower than the last.$rsn$ WHERE question_id = 'd77528d2-f8a3-4f18-aef6-b4ed845f5492' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 2024 values: Portmire 13.1, Ashford 14.5, Eastbrook 8.2, Thornhill 21.8. Eastbrook is the smallest.$rsn$ WHERE question_id = 'd77528d2-f8a3-4f18-aef6-b4ed845f5492' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Ashford went 12.5 → 14.5, so PM2.5 rose. Higher PM2.5 means worse air quality, so Ashford's air quality worsened.$rsn$ WHERE question_id = 'd77528d2-f8a3-4f18-aef6-b4ed845f5492' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. You cannot predict 2025 from the table.$rsn$ WHERE question_id = 'd77528d2-f8a3-4f18-aef6-b4ed845f5492' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Portmire: 18.0 → 13.1. Drop = 4.9. 4.9/18.0 ≈ 27.2%, which is more than 25%.$rsn$ WHERE question_id = 'd77528d2-f8a3-4f18-aef6-b4ed845f5492' AND order_index = 5;

-- [88] Primary Cooking Lessons (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties cooking lessons to long-term dietary choices. Your winner must address both with evidence. A addresses enjoyment. C assumes home cooking already happens and uses "many" not all. D raises curriculum logistics, not dietary outcomes. B cites a five-year follow-up study measuring a 31% higher rate of balanced diets at age 16 among participants — action, outcome, evidence, and long-term. The answer is B.$rsn$
WHERE id = '0f8aedd6-60ed-4aea-bf9f-8456a7ed9b30';

-- [89] Street House Numbers (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with the fixed position. Dumas = 7. Aran is not next to Dumas, so Aran ≠ 5, meaning Aran is 1 or 3. Bruno must be lower than Aran, so Aran can't be 1 (nothing lower) — Aran = 3 and Bruno = 1. Chen is not at an end (not 1 or 7), so Chen = 5. Bruno lives at number 1. The answer is B.$rsn$
WHERE id = '2cf4a812-6688-4fbe-9f8b-67382edd0068';

-- [90] Archive Photographs (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 30 portraits, half black-and-white = 15.$rsn$ WHERE question_id = '028132c2-5bac-4830-aa8f-3b9a3fd39801' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no landscape is black-and-white. Photos are either black-and-white or colour, so every landscape is colour. All 20 are colour.$rsn$ WHERE question_id = '028132c2-5bac-4830-aa8f-3b9a3fd39801' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage tells you nothing about the colour distribution of still-life photos. Unsupported.$rsn$ WHERE question_id = '028132c2-5bac-4830-aa8f-3b9a3fd39801' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — you don't know still-life dates from the passage. Colour photos must be ≥1960, but still-life could be any mix of colour and black-and-white. Unsupported.$rsn$ WHERE question_id = '028132c2-5bac-4830-aa8f-3b9a3fd39801' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — all 20 landscapes are colour (from statement 2), and no colour photo is dated before 1960. So no landscape is pre-1960.$rsn$ WHERE question_id = '028132c2-5bac-4830-aa8f-3b9a3fd39801' AND order_index = 5;

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 4 — questions 91–120
-- ============================================================================

-- [91] Recycling Bin Survey (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — households using no bins = 44, so 200 − 44 = 156 used at least one. 156/200 = 78%, well over half.$rsn$ WHERE question_id = '842782e9-64a6-4232-afe0-86d07441a109' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — paper bin users = 28 + 18 + 26 + 36 = 108. Plastic bin users = 22 + 26 + 12 + 36 = 96. 108 > 96.$rsn$ WHERE question_id = '842782e9-64a6-4232-afe0-86d07441a109' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "were inclined to" implies a behavioural tendency. The table gives counts, not tendencies. Also, of 108 paper users only 18+36 = 54 also use glass — exactly half, not a majority. Unsupported causal language.$rsn$ WHERE question_id = '842782e9-64a6-4232-afe0-86d07441a109' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — both glass and plastic = glass-and-plastic-only (12) + all three (36) = 48, not 86.$rsn$ WHERE question_id = '842782e9-64a6-4232-afe0-86d07441a109' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — glass users total = 14 + 18 + 12 + 36 = 80. Those using glass only = 14. Those using glass plus at least one other = 80 − 14 = 66. 66/80 = 82.5%, more than half.$rsn$ WHERE question_id = '842782e9-64a6-4232-afe0-86d07441a109' AND order_index = 5;

-- [92] Coffee Roastery Beans (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 3 batches in the centre (all three labels) and 12 outside. Scan: B shows 5 in the centre — out. C shows 9 outside — out. Between A and D, compute decaf-and-organic only: total overlap 6, minus the 3 in the centre = 3. A shows 3; D shows 6 (it forgot to subtract the triple) — out. The answer is A.$rsn$
WHERE id = '9981ffdd-f634-4eef-a7a5-2e59eb68a9fa';

-- [93] Four-Day School Week (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a four-day school week to student well-being. Your winner must address both with evidence. B addresses teacher benefits, not student well-being. C raises parental childcare, a separate concern. D argues from perceived necessity rather than measuring well-being. A cites two Scottish secondary trials showing an 18% fall in self-reported anxiety with no loss of academic results — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '05de0870-8885-4569-9ee5-80fa7551d8b7';

-- [94] Project Assignment (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Mia ≠ Red. Test Mia = Blue: the biconditional forces Omar = Yellow. Paul ≠ Green and Red/Blue/Yellow are taken by others, so Paul = Red. Noor takes Red or Green, and Red is Paul's — Noor = Green. Everyone has a project, every rule satisfied. Final: Mia Blue, Noor Green, Omar Yellow, Paul Red — that is option A. Quick checks on the rest: B gives Paul Green; C gives Mia Red; D gives Omar Yellow without Mia on Blue, breaking the biconditional. The answer is A.$rsn$
WHERE id = 'c20960ac-e644-4a8a-8067-0af765ac9ce5';

-- [95] Climbing Peak Bourn (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only alpine club members may climb Bourn, so climbers must be members. Direct from the stem.$rsn$ WHERE question_id = 'e375ba2e-a1a5-41fa-8030-25cc87ee6a8a' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — membership is necessary for climbing, but not the reverse. Members don't have to climb. Direction-of-implication trap.$rsn$ WHERE question_id = 'e375ba2e-a1a5-41fa-8030-25cc87ee6a8a' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no one climbs Bourn without a registered helmet, so climbers have one. Direct from the stem.$rsn$ WHERE question_id = 'e375ba2e-a1a5-41fa-8030-25cc87ee6a8a' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some registered helmets are older than ten years, but you don't know which members own those helmets. You can't conclude that members are the owners. Unsupported.$rsn$ WHERE question_id = 'e375ba2e-a1a5-41fa-8030-25cc87ee6a8a' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only helmets older than ten years must be inspected, not every registered helmet. Too strong.$rsn$ WHERE question_id = 'e375ba2e-a1a5-41fa-8030-25cc87ee6a8a' AND order_index = 5;

-- [96] Zemmers and Wabbles (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — chain: zemmer → prilk → kloff. Every zemmer is a kloff.$rsn$ WHERE question_id = '52989edb-ae02-4b3f-8a9c-73f868ce3d8f' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some kloffs are blargs, but zemmers are a subset of kloffs, and the stem doesn't place zemmers in the blarg part. Unsupported.$rsn$ WHERE question_id = '52989edb-ae02-4b3f-8a9c-73f868ce3d8f' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — zemmers are kloffs, and some kloffs are blargs, but we can't confirm zemmers aren't wabbles. No blarg is a wabble, but zemmers aren't necessarily blargs. Unsupported.$rsn$ WHERE question_id = '52989edb-ae02-4b3f-8a9c-73f868ce3d8f' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all zemmers are kloffs, but not vice versa. Direction-of-implication trap.$rsn$ WHERE question_id = '52989edb-ae02-4b3f-8a9c-73f868ce3d8f' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some kloffs are blargs, and no blarg is a wabble, so those blarg-kloffs are not wabbles. Chain deduction confirms some kloffs aren't wabbles.$rsn$ WHERE question_id = '52989edb-ae02-4b3f-8a9c-73f868ce3d8f' AND order_index = 5;

-- [97] Gardening Club Tools (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 4 in the centre and 6 outside. Scan: B shows 3 in the centre — out. C shows 8 outside — out. Between A and D, compute spades-and-forks only: total overlap 10, minus 4 in the triple = 6. A shows 6; D shows 8 — out. The answer is A.$rsn$
WHERE id = '08f6de5b-d42d-4316-aa92-10d116d5685c';

-- [98] Seminar Rooms (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Biology is immediately right of Maths, so (Maths, Biology) pairs at (1,2), (2,3), or (3,4). Maths-Physics adjacent. Physics ≠ Room 4. Logic ≠ Room 1. Test Maths = 2: Biology = 3. Physics adjacent to Maths means Physics = 1. Logic fills Room 4 (satisfies Logic ≠ Room 1). All rules check. Test Maths = 1: Physics needs 2 but Biology is there — fails. Test Maths = 3: Physics needs 2 or 4 but Biology is 4 so Physics = 2, leaving Logic = 1 — violates Logic ≠ Room 1. So Logic = Room 4. The answer is A.$rsn$
WHERE id = 'd1fb27dc-3b7d-451c-a86b-06630764f8ff';

-- [99] Car Park Vehicles (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — you can't confirm "some petrol hatchbacks are white" without checking the counts. Total hatchbacks = 60 − 20 = 40; electric hatchbacks = 25 − 12 = 13, so petrol hatchbacks = 40 − 13 = 27. Hatchbacks white = 8. But those 8 could be electric or petrol — the passage doesn't say. Unsupported.$rsn$ WHERE question_id = 'a10ed8ad-2c1f-4790-965e-83eca9b1f995' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only 8 hatchbacks are white. You aren't told how many estates are white (only that petrol estates aren't). Electric estates could all be white or none. Insufficient data for a "majority" claim. Unsupported.$rsn$ WHERE question_id = 'a10ed8ad-2c1f-4790-965e-83eca9b1f995' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: no petrol estate is white. So every petrol estate is non-white.$rsn$ WHERE question_id = 'a10ed8ad-2c1f-4790-965e-83eca9b1f995' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — total hatchbacks = 40, electric hatchbacks = 25 − 12 = 13, so petrol hatchbacks = 40 − 13 = 27.$rsn$ WHERE question_id = 'a10ed8ad-2c1f-4790-965e-83eca9b1f995' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — electric estates could also be non-white (you aren't told their colour). A non-white estate could be electric or petrol. Unsupported.$rsn$ WHERE question_id = 'a10ed8ad-2c1f-4790-965e-83eca9b1f995' AND order_index = 5;

-- [100] Summer Course Stages (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a chained-stage Venn: consecutive stages overlap. Translate the target: you want Pre-reading AND Lectures, but NOT Seminars or Assessment. Walk the wrong letters. F is registered + pre-reading — no lectures. H is lectures + seminars — adds seminars. C is lectures only — no pre-reading. Letter G sits at pre-reading + lectures with nothing further. The answer is B (Letter G).$rsn$
WHERE id = 'd95f6c08-a8fd-4c4a-82ca-d0b3d19da28f';

-- [101] Used Car Advertisements (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: the stem gives the three pair overlaps (10, 12, 8) and the outside count (26). Scan: D shows 18 outside — out. C shows 34 outside — out. B shows 12 at diesel-and-sunroof (should be 10) and 10 at sunroof-and-AC (should be 12) — numbers swapped — out. A matches all four directly. The answer is A.$rsn$
WHERE id = '60756786-b397-4a2d-a1e1-ab0f8dacd997';

-- [102] Dog Training Awards (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Pin the direct assignments. Jonas = beagle, Harsh = whippet. That leaves collie and spaniel for Gemma and Ira. Ira ≠ collie, so Ira = spaniel and Gemma = collie. The collie's trainer won retrieval, so Gemma won retrieval. Ira won sprint (given). Harsh didn't win scent, and sprint/retrieval are taken, so Harsh won agility. That leaves scent for Jonas. Ira trained the spaniel and won sprint — the answer is C.$rsn$
WHERE id = '5858bbfe-24e5-4f5d-99e8-2266293d961a';

-- [103] Veterinary Practice Add-ons (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: the stem gives all three diabetes-add-on overlaps directly (14, 8, 6) and 10 outside. Scan: B shows 12 at diabetes-and-insulin (should be 14) — out. C shows 8 outside (should be 10) — out. Between A and D, compute diabetes-only: 30 diabetes cases minus the three add-on overlaps (14 + 8 + 6 = 28) = 2. A shows 2; D shows 12 (it forgot to subtract) — out. The answer is A.$rsn$
WHERE id = 'eed3daea-f3ae-4f2a-a841-4f4c2aa2a299';

-- [104] Distinction Necessary (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — a distinction is necessary to qualify, so every advanced cohort member has achieved a distinction. Direct from the stem.$rsn$ WHERE question_id = 'cf9cf65f-64bd-473f-9f6e-0c6f00bb09b5' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — 80% gives a distinction, and a distinction is necessary for the cohort — but not sufficient. Passing the practical is also required. Sufficient-vs-necessary trap.$rsn$ WHERE question_id = 'cf9cf65f-64bd-473f-9f6e-0c6f00bb09b5' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — most tutored candidates score above 80%, and 80%+ is sufficient for a distinction. So most tutored candidates have a distinction.$rsn$ WHERE question_id = 'cf9cf65f-64bd-473f-9f6e-0c6f00bb09b5' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no distinction means no cohort, but failing the practical isn't the only reason. Someone could just score below 80% without having failed the practical. Direction-of-implication trap.$rsn$ WHERE question_id = 'cf9cf65f-64bd-473f-9f6e-0c6f00bb09b5' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — anyone who failed the practical cannot join the cohort, so joining implies passing. Contrapositive.$rsn$ WHERE question_id = 'cf9cf65f-64bd-473f-9f6e-0c6f00bb09b5' AND order_index = 5;

-- [105] Later School Start (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a 10:00 start to academic performance. Your winner must address both with evidence. A addresses preference, not performance. C addresses parental logistics, a separate concern. D claims teaching quality is the only driver — unsupported and dismissive. B cites multiple controlled studies showing ~4% exam score gains with post-09:30 starts — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'febf7e7d-7e43-4786-b59d-c699efa21dae';

-- [106] Unlabelled Bakery Cakes (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 6 cakes in the centre (all three) and 36 outside. Scan: B shows 4 in the centre — out. C shows 42 outside — out. Between A and D, each circle must sum to its stated total (sponge 30, chocolate 25, gluten-free 20). A's sponge circle: 17+4+3+6 = 30 ✓; chocolate: 13+4+2+6 = 25 ✓; gluten-free: 9+3+2+6 = 20 ✓. D's sponge: 16+3+4+6 = 29 — doesn't match. The answer is A.$rsn$
WHERE id = 'ceb1c2cb-9052-4a64-ba34-58c74501bb56';

-- [107] Charity Shop Tiers (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with what's fixed. Sold at £20 = 5 items, at £5 = 12 items. Remaining = 40 − 5 − 12 = 23. Let the £12 count = y; the £3 count = y + 3. Sum: y + (y + 3) = 23 → 2y = 20 → y = 10. So the £3 tier has y + 3 = 13. The answer is C.$rsn$
WHERE id = '3aad7b8e-152b-4613-a705-e71a664dde8a';

-- [108] Biased Coin Triple (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Independent events with "AND" multiply. P(all three heads) = 0.6 × 0.6 × 0.6 = 0.216. The answer is A. Option C (1.8) is the trap for adding instead of multiplying — probabilities can never exceed 1.$rsn$
WHERE id = 'ca009d11-0f00-411b-a051-328364d5cdc8';

-- [109] Neighbours, Houses and Cars (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Start with fixed clues. SUV at house 2. Hatchback at odd house (1 or 3). Dev > hatchback driver's house number. Anna drives estate, so Anna isn't at house 2 (SUV) or the hatchback house. Try hatchback at house 1: then Dev is at 2, 3, or 4. Ben drives saloon, so Ben ≠ hatchback house (1) and ≠ SUV house (2). Carla lives exactly two houses from Ben: valid pairs (1,3) or (2,4) or (3,5, out). So {Ben, Carla} = {1,3} or {3,5 out}, giving Ben=3 and Carla=1. Anna must be at house 4 (estate), Dev at 2 (SUV). Checks: Carla at 1 with hatchback (odd ✓), Dev (2) > Carla (1) ✓, Anna at 4 (estate) ✓, Ben at 3 (saloon) ✓. Ben lives at house 3 — the answer is A.$rsn$
WHERE id = 'fde315ff-610e-4464-8ded-2f1b841c87ff';

-- [110] Music School Instruments (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: piano-and-guitar = 7, piano-and-drums = 3, no guitar-and-drums, and 5 outside. Scan: B shows 8 at piano-and-guitar — out. C shows 6 outside — out. D shows 4 at piano-and-drums — out. A matches all four directly. Quick sanity: piano-only = 18 − 7 − 3 = 8, which A shows. The answer is A.$rsn$
WHERE id = '0e849aa9-9a56-4fa5-a6a6-d3793e6721fa';

-- [111] Cycle Helmet Law (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties compulsory helmets to reducing head injuries on UK roads. Your winner must address both with evidence. B addresses cost/availability, not head injuries. C is narrow and opinion-based. D diverts to physical activity, a different outcome. A cites 2022 UK hospital data showing helmeted cyclists had 45% fewer serious head injuries — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'b7cd43b2-b43c-4ce3-a170-835d8f88e6bd';

-- [112] Disaster Response Team (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Each watch needs 2 paramedics + 2 engineers. Alpha: 2 and 2 — no draw. Bravo: 2 and 2 — no draw. Delta: 2 and 2 — no draw. Charlie: 3 paramedics (Gus, Isla, Rhea) for 2 slots — the three paramedics sit the selection. Charlie's 2 engineers (Mae, Pia) already fit. The answer is A.$rsn$
WHERE id = '613ee2c7-e91e-41f8-8c91-c39e3b7c7f34';

-- [113] Spinner Sums (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Total outcomes = 8 × 8 = 64 equally likely pairs. List pairs with sum > 12: sum 13 → (5,8), (6,7), (7,6), (8,5) = 4; sum 14 → (6,8), (7,7), (8,6) = 3; sum 15 → (7,8), (8,7) = 2; sum 16 → (8,8) = 1. Total = 4 + 3 + 2 + 1 = 10. Probability = 10/64 = 5/32. The answer is A.$rsn$
WHERE id = 'ee73e3bf-e783-4277-a852-3e0af24b5b89';

-- [114] Streaming Film Lists (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: all four "list only" counts (40, 30, 20, 35), all four pair overlaps (18, 15, 12, 20), and 10 outside. Scan: C shows 15 outside and 30 for Drama-only (should be 35) — out. B swaps Thriller-Romance (15) and Romance-Comedy (18) — out. D shows 20 for Thriller-Romance (should be 18) — out. A matches every stated value. The answer is A.$rsn$
WHERE id = '64998ac2-2832-4d44-ad8d-6e06c45001b0';

-- [115] Sugary Drinks Warning Labels (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties warning labels to reducing childhood obesity. Your winner must address both with evidence. A addresses parental knowledge, not obesity. C speculates about label effectiveness without evidence. D deflects to other obesity factors rather than evaluating labels. B cites a Chilean school trial showing a 24% drop in primary-age children's sugar consumption after labelling — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '9c256236-770a-45db-8c48-165262a663f1';

-- [116] Vorms and Trels (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — vorms are all trels, and no trel is a glink. Chain: vorm → trel → not glink.$rsn$ WHERE question_id = 'fcd5f1b9-d6b9-40ba-b1c3-a914e72c9a10' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some sloons are vorms, and all vorms are trels. So those sloons are also trels. Some sloons are trels.$rsn$ WHERE question_id = 'fcd5f1b9-d6b9-40ba-b1c3-a914e72c9a10' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "most glinks are quemps" means more than half, not all. Some glinks are non-quemps. Too strong.$rsn$ WHERE question_id = 'fcd5f1b9-d6b9-40ba-b1c3-a914e72c9a10' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — you know most glinks are quemps, but you don't know the reverse. The stem tells you nothing about quemps outside the glink context. Unsupported.$rsn$ WHERE question_id = 'fcd5f1b9-d6b9-40ba-b1c3-a914e72c9a10' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "no trel is a glink" is stated directly. The statement contradicts the premise.$rsn$ WHERE question_id = 'fcd5f1b9-d6b9-40ba-b1c3-a914e72c9a10' AND order_index = 5;

-- [117] Hardware Store Fasteners (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no bolts are countersunk, so any countersunk fastener must be a screw.$rsn$ WHERE question_id = '13e911db-6288-4dc8-994a-dcba7333271b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says every flat-head screw is countersunk, but other screws (non-flat-head) need not be. Too strong.$rsn$ WHERE question_id = '13e911db-6288-4dc8-994a-dcba7333271b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — "some screws are stainless steel" in UCAT means more than zero AND less than all. So some screws are not stainless steel.$rsn$ WHERE question_id = '13e911db-6288-4dc8-994a-dcba7333271b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says some screws are stainless steel — not a specific count. You can't pin it at 20. Unsupported.$rsn$ WHERE question_id = '13e911db-6288-4dc8-994a-dcba7333271b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage only tells you about countersunk flat-head screws; it doesn't forbid bolts from being flat-headed. Unsupported.$rsn$ WHERE question_id = '13e911db-6288-4dc8-994a-dcba7333271b' AND order_index = 5;

-- [118] Calorie Labels in Restaurants (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties calorie labelling to reducing overweight adult prevalence. Your winner must address both with evidence. A is a "right to know" principle, not an outcome argument. C addresses menu creativity, a separate concern. D relies on an unsupported assumption about diner awareness. B cites a 2023 study with an 8% drop in meal calorie selection and follow-up data showing a measurable decline in overweight prevalence among regular diners — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '19ba8ffa-bcb5-4c16-87d3-c61700298228';

-- [119] Sum on Two Dice (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Two dice gives 6 × 6 = 36 equally likely outcomes. Pairs summing to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes. P = 6/36 = 1/6. The answer is D. Tip: 7 is the most likely sum on two dice because it has the most partitions.$rsn$
WHERE id = '49567800-1548-460a-9aca-d36634edb691';

-- [120] University Research Funding Review (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: government grant income per institution fell by 11% on average between 2018 and 2023.$rsn$ WHERE question_id = 'd078bd5a-d15f-4953-b5ee-acbff6b30a53' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the reviewers suggest this, and critics flag it as correlation-not-causation. Causal claim unsupported by the data.$rsn$ WHERE question_id = 'd078bd5a-d15f-4953-b5ee-acbff6b30a53' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "average industry income rose by 28%" says nothing about individual universities. The average could rise while some universities' income fell. Too strong.$rsn$ WHERE question_id = 'd078bd5a-d15f-4953-b5ee-acbff6b30a53' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the reviewers describe industry partnerships as concentrating in applied research with near-term commercial value, i.e., more applied than fundamental.$rsn$ WHERE question_id = 'd078bd5a-d15f-4953-b5ee-acbff6b30a53' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. The passage has 2018–2023 data; you cannot predict 2028.$rsn$ WHERE question_id = 'd078bd5a-d15f-4953-b5ee-acbff6b30a53' AND order_index = 5;

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 5 — questions 121–150
-- ============================================================================

-- [121] Rare Condition Screening (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Rare condition + imperfect specificity means false positives will dominate. Imagine 10,000 people: 0.2% have the condition = 20, and 9,980 do not. True positives = 95% of 20 = 19. False positives = 10% of 9,980 = 998 (the 100 − 90 false-positive rate). Total positives ≈ 1,017, of which only 19 actually have the condition: 19/1,017 ≈ 1.9%, about 2%. The answer is A. The high sensitivity is dwarfed by the base rate — option D (95%) is the classic trap.$rsn$
WHERE id = '3e40da81-93b0-4506-b104-8a3f53914d84';

-- [122] Community Programme Pairs (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 18 in the yoga-choir overlap and 12 in the chess-pottery overlap (both given). Scan: B shows 14 at yoga-choir — out. C shows 10 at chess-pottery — out. D shows 28 at yoga-only (should be 30) — out. A matches every stated value. The answer is A.$rsn$
WHERE id = 'de96eb9b-7e68-4672-a1e2-3bfd61180aab';

-- [123] Smartphones in Primary Schools (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a school-day smartphone ban to classroom concentration. Your winner must address both with evidence. A addresses home worry, not classroom concentration. C is a partial-scope exception. D makes an unsupported assumption about primary pupils' susceptibility. B cites a 24-school UK randomised trial with 18% higher task-completion in ban classrooms — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '91be2030-b663-4ee8-82fb-e143f44bed04';

-- [124] Cycling Commute Survey (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a conditional probability: given the person cycles, what's the chance they're under 30? Total cyclists = 60 + 36 = 96. Under-30 cyclists = 60. P(under 30 | cycles) = 60/96 = 5/8. The answer is B. Option D (8/25) is the trap for using the wrong denominator (whole sample). Option A (1/5) uses the wrong conditional direction.$rsn$
WHERE id = 'ca0706d3-7376-463a-a70c-6eae19be7a50';

-- [125] Sterile Instruments (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — disposable instruments can't be in the pre-wash bin, so the "unless" exception doesn't apply. Every disposable instrument is sterile (from the default rule).$rsn$ WHERE question_id = '15606c8f-bf2b-482b-9c95-54476b6addaf' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — "all instruments are sterile unless in the pre-wash bin" means being in the bin removes sterility, so no bin-instrument is sterile.$rsn$ WHERE question_id = '15606c8f-bf2b-482b-9c95-54476b6addaf' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some pre-wash-bin instruments are reusable, and all reusables need annual inspection. Chain: bin ∩ reusable → needs annual inspection.$rsn$ WHERE question_id = '15606c8f-bf2b-482b-9c95-54476b6addaf' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — reusables need inspection, but other instruments might need it too. Direction-of-implication trap.$rsn$ WHERE question_id = '15606c8f-bf2b-482b-9c95-54476b6addaf' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some pre-wash-bin instruments are reusable, but the stem doesn't place every reusable in the bin. Too strong.$rsn$ WHERE question_id = '15606c8f-bf2b-482b-9c95-54476b6addaf' AND order_index = 5;

-- [126] Parcel Handling Tags (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: the three stated pair totals (12, 10, 8) and 20 outside. Scan: B shows 16 at fragile-heavy (should be 12) — out. C shows 24 outside (should be 20) — out. D shows 14 at heavy-dimensional (should be 10) — out. A matches every stated value. The answer is A.$rsn$
WHERE id = '277bb4f3-93e7-48bc-ad94-1fbfc9571bcb';

-- [127] UK Export Orders (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 12 in the centre (all three) and 18 outside. Scan: A shows 15 in the centre — out. D shows 20 outside — out. Between B and C, compute exported-and-bulk only: 20 total, minus 12 in the triple = 8. B shows 8; C shows 10 — out. The answer is B.$rsn$
WHERE id = '44842d1f-e345-4ffc-9a4f-7e699868d2dd';

-- [128] Museum Artefact Inventory (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a nested Venn: online ⊆ photographed ⊆ inspected. Compute the four regions. Outside = 60 − 40 = 20. Inspected-only = 40 − 25 = 15. Photographed-but-not-online = 25 − 12 = 13. Online (innermost) = 12. Scan: B shows 15 in the innermost (should be 12) — out. C shows 12 outermost and 15 innermost (swapped) — out. D shows 17 outside (should be 20) — out. A shows 15, 13, 12, 20 — exactly matches. The answer is A.$rsn$
WHERE id = '5c79147b-a33b-44af-944d-35e658a4f8c9';

-- [129] Four-day Working Week (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a four-day working week to mental health. Your winner must address both with evidence. A is preference-based, not mental health. C addresses operational workload, a feasibility concern. D deflects to other causes of mental-health issues rather than assessing the policy. B cites a 2023 Icelandic trial with 33% fewer burnout symptoms and no productivity loss — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'f8761f71-79c0-4a27-8bb4-7e5ddad0e3fa';

-- [130] Warm-up Illusion (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says "independent trials have produced mixed results", meaning not every trial showed unchanged times. "Definitely unchanged" overstates the finding. Unsupported.$rsn$ WHERE question_id = '867cd55a-2f12-4ed9-976e-f1ab93f11e50' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage states critics argue self-reported readiness is more relevant to performance. That matches the statement.$rsn$ WHERE question_id = '867cd55a-2f12-4ed9-976e-f1ab93f11e50' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — surveys report a correlation (athletes feel faster after warm-up), but causation isn't established. Causal claim too strong.$rsn$ WHERE question_id = '867cd55a-2f12-4ed9-976e-f1ab93f11e50' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage says independent trials produced mixed results, i.e., different findings. Some differed from the small-scale surveys.$rsn$ WHERE question_id = '867cd55a-2f12-4ed9-976e-f1ab93f11e50' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the theory concerns perception vs measurement. Critics argue the feeling itself is relevant to performance. "No effect" is too strong. Unsupported.$rsn$ WHERE question_id = '867cd55a-2f12-4ed9-976e-f1ab93f11e50' AND order_index = 5;

-- [131] Whale Song Passage (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage says "in many populations" not all. Too strong.$rsn$ WHERE question_id = 'a28dd79b-3b55-4f21-be9f-5e7779f35ac7' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage says most rapid replacement observations come from an eastern Australian population.$rsn$ WHERE question_id = 'a28dd79b-3b55-4f21-be9f-5e7779f35ac7' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some researchers argue this; "proven" is too strong.$rsn$ WHERE question_id = 'a28dd79b-3b55-4f21-be9f-5e7779f35ac7' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — others caution the pattern may not generalise, so "all species" is unsupported.$rsn$ WHERE question_id = 'a28dd79b-3b55-4f21-be9f-5e7779f35ac7' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the passage contrasts gradual updates over years with replacement within a single breeding season, which is faster.$rsn$ WHERE question_id = 'a28dd79b-3b55-4f21-be9f-5e7779f35ac7' AND order_index = 5;

-- [132] Morning Shift Deliveries (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 6 in the centre and 17 outside. Scan: A shows 4 in the centre — out. B shows 22 outside — out. Between C and D, compute priority-and-oversized only: 14 − 6 = 8. C shows 8; D shows 12 — out. The answer is C.$rsn$
WHERE id = '4c590805-52f7-4884-822f-2be8e88302e4';

-- [133] Research Wing Access (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem says "a badge permits entry unless deactivated", but a staff member could still have a deactivated badge. Too strong without knowing deactivation status.$rsn$ WHERE question_id = '58647de3-9fd7-40dc-9ea9-4447a3c4e8e4' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every deactivated badge is logged, so a badge not in the log can't be deactivated. Contrapositive.$rsn$ WHERE question_id = '58647de3-9fd7-40dc-9ea9-4447a3c4e8e4' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — deactivated → logged, but logged items might include other categories (e.g., active visitor badges). Direction-of-implication trap.$rsn$ WHERE question_id = '58647de3-9fd7-40dc-9ea9-4447a3c4e8e4' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only staff get permanent badges, so non-staff can't hold one. Direct contrapositive.$rsn$ WHERE question_id = '58647de3-9fd7-40dc-9ea9-4447a3c4e8e4' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — non-permanent badges expire within 24 hours, so an expiring badge could belong to anyone without a permanent badge, including staff without a permanent one. Too strong.$rsn$ WHERE question_id = '58647de3-9fd7-40dc-9ea9-4447a3c4e8e4' AND order_index = 5;

-- [134] Eight-Sided Spinner (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Spins are independent, so the first spin doesn't change the second's probability. Numbers greater than 6 are 7 and 8 — 2 out of 8 segments. P(second > 6) = 2/8 = 1/4. The answer is A.$rsn$
WHERE id = '557c0956-1263-44e8-8893-9cea39e96905';

-- [135] Round Table Seating (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Priya = chair 1, Raj = chair 3. Sam, Tina, Uma fill chairs 2, 4, 5. Sam can't sit next to Raj — chairs 2 and 4 are next to chair 3, so Sam must be in chair 5. Uma's constraint (not chair 5) is satisfied because chair 5 is already Sam. The answer is C (Chair 5).$rsn$
WHERE id = '72f1f610-8d51-45fa-9b74-1c4e56d2978d';

-- [136] Accuracy vs Precision (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Accuracy = how often readings are correct. Precision = how consistent repeated readings are. Accuracy: Meter 1 = 85%, Meter 2 = 92% — Meter 2 is more accurate. Precision: Meter 1 = 49/50 = 98%, Meter 2 = 42/50 = 84% — Meter 1 is more precise. So Meter 2 more accurate, Meter 1 more precise. The answer is B.$rsn$
WHERE id = 'b00575d9-b06d-4b72-af72-0902e39b29f0';

-- [137] Amateur Festival Performers (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 4 in the centre (all three) and 21 outside. Scan: B shows 7 in the centre — out. D shows 15 outside — out. Between A and C, compute solo-and-duet only: 10 − 4 = 6. A shows 6; C shows 10 (the full overlap, not "only") — out. The answer is A.$rsn$
WHERE id = '2c6d8b3d-01f2-492d-8486-99611997556b';

-- [138] Zorlins and Flimpets (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: if ripe, then sweet. That is "every ripe zorlin is sweet".$rsn$ WHERE question_id = '15eec022-ec62-4e3f-9357-5f114af5e48b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — ripe zorlins are sweet, and unripe zorlins are bitter. Every zorlin is one of the two.$rsn$ WHERE question_id = '15eec022-ec62-4e3f-9357-5f114af5e48b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some flimpets are zorlins; the rest aren't. "All" is too strong.$rsn$ WHERE question_id = '15eec022-ec62-4e3f-9357-5f114af5e48b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every flimpet is sweet, so flimpets are sweet things. At least one flimpet exists (we're told some are zorlins), so some sweet things are flimpets.$rsn$ WHERE question_id = '15eec022-ec62-4e3f-9357-5f114af5e48b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — flimpets are sweet, and bitter zorlins aren't sweet (they're bitter). So no bitter zorlin is a flimpet. The statement contradicts the deduction.$rsn$ WHERE question_id = '15eec022-ec62-4e3f-9357-5f114af5e48b' AND order_index = 5;

-- [139] Longer Lunch Break (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a 60-minute lunch to afternoon productivity. Your winner must address both with evidence. B addresses worker happiness, a different outcome. C is a comparative deflection, not an argument against the proposition. D addresses contract hours, a separate concern. A cites a controlled trial showing 8% higher afternoon output when employees switched to the 60-minute break — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'e8f93408-4b64-4b5a-83ae-bfde0d082900';

-- [140] Marbles in a Bag (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"Not blue" is easiest via the complement. Total marbles = 5 + 7 + 8 = 20. Non-blue = 5 + 7 = 12. P(not blue) = 12/20 = 3/5. The answer is B. Option D (8/20) is the probability of drawing blue — the opposite.$rsn$
WHERE id = 'c147ddc2-e254-4593-af16-977eaa5270a4';

-- [141] Library Print Catalogue (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want a print book in active circulation AND classified as both Early-reader AND Middle-grade. Walk the wrong letters. C is circulation + early-reader only — no middle-grade. D is circulation + middle-grade only — no early-reader. E is circulation + picture + early-reader — wrong pair (no middle-grade). Letter F sits at circulation + early-reader + middle-grade — exactly the target. The answer is D (Letter F).$rsn$
WHERE id = 'c3a22268-7b80-44e1-b32f-c9d0ab8f306a';

-- [142] Regional Rainfall (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Scotland: 110, 95, 84, 70. In each month Scotland's value is the largest column entry.$rsn$ WHERE question_id = '44897272-e0c0-4937-80a9-2bca5c7bcbc7' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every region's July value is lower than its April value, and each month in between is no higher than the previous. Rainfall fell across April→July in every region.$rsn$ WHERE question_id = '44897272-e0c0-4937-80a9-2bca5c7bcbc7' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — South East April = 52, Scotland April = 110. 52 < 55 (half of 110), so yes, less than half.$rsn$ WHERE question_id = '44897272-e0c0-4937-80a9-2bca5c7bcbc7' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — in every month shown, Midlands (65, 60, 55, 48) exceeds South East (52, 48, 42, 38). The Midlands was wetter, not drier. Also, "typically" implies a general pattern — four months isn't enough. Unsupported.$rsn$ WHERE question_id = '44897272-e0c0-4937-80a9-2bca5c7bcbc7' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 92 + 78 + 64 + 58 = 292. Exactly as stated.$rsn$ WHERE question_id = '44897272-e0c0-4937-80a9-2bca5c7bcbc7' AND order_index = 5;

-- [143] Rare Nut Allergy Test (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Rare condition + imperfect specificity means false positives dominate. Imagine 100,000 people: 200 have the allergy, 99,800 do not. True positives = 99% of 200 = 198. False positives = 3% of 99,800 ≈ 2,994 (the 100 − 97 false-positive rate). Total positives ≈ 3,192, of which 198 are real: 198/3,192 ≈ 6.2%, about 6%. The answer is B. Option D (99%) confuses sensitivity with the conditional probability — a common trap.$rsn$
WHERE id = '4f95045e-40db-4b34-904f-0b4ea7b12f43';

-- [144] Biology Module Enrolments (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Ecology AND Anatomy, and no other module. Walk the wrong letters. F is Genetics + Ecology — wrong pair. H is Anatomy + Physiology — adds Physiology. B is Ecology only — missing Anatomy. Letter G sits at Ecology + Anatomy with nothing else attached. The answer is B (Letter G).$rsn$
WHERE id = 'e3f10518-29c6-42e8-b950-762426abe120';

-- [145] Prescription Charges for Over-60s (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties abolishing prescription charges for over-60s to improved long-term health. Your winner must address both with evidence. A is anecdotal. C is a comparative deflection. D addresses NHS funding, a separate concern. B cites a 2024 OECD health-economics study showing a 12% drop in over-60 hospital admissions after comparable policies — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '34903a69-3f0a-4784-8306-f7135d92449b';

-- [146] Blood-Pressure Monitor Comparison (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Accuracy = how often the reading is correct. Precision = how consistent repeated readings are. Accuracy: X = 88%, Y = 94% — Y is more accurate. Precision: X = 8/10 = 80%, Y = 5/10 = 50% — X is more precise. So Y more accurate, X more precise. The answer is B.$rsn$
WHERE id = '1b645a71-0bcc-4964-9fd7-f15371520e61';

-- [147] Sibling Ages (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Express everyone in terms of Dina's age, D. Alex = D + 4. Ben = Alex + 3 = D + 7. Cora = 2D. Sum: D + (D+4) + (D+7) + 2D = 5D + 11 = 81, so 5D = 70 and D = 14. The answer is B.$rsn$
WHERE id = '799f526c-22e5-423b-a110-517031c350e6';

-- [148] Loud Fireworks Ban (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a loud-fireworks retail ban to reducing animal distress. Your winner must address both with evidence. B addresses human injuries, not animal distress. C notes that distress won't be eliminated entirely, but reducing isn't eliminating — weak rebuttal. D addresses cultural importance, a separate concern. A cites an RSPCA report showing ~70% fewer pet distress incidents after comparable bans in three European countries — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '77023809-710f-4817-bc9a-9c7f1995b958';

-- [149] Airport Monthly Passengers (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Aug total = 560+495+275+200 = 1,530. June = 1,160; July = 1,410; Sept = 1,085. August is highest.$rsn$ WHERE question_id = '4710ce2d-d5ff-498a-97f0-eb13bdd4f858' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every terminal's Sept value (390, 360, 195, 140) is lower than its June value (420, 380, 210, 150).$rsn$ WHERE question_id = '4710ce2d-d5ff-498a-97f0-eb13bdd4f858' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — correlation vs causation. The table shows the fall happened in September, which is after summer, but doesn't prove the summer's end caused it. Causal claim unsupported.$rsn$ WHERE question_id = '4710ce2d-d5ff-498a-97f0-eb13bdd4f858' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data. No October figures provided.$rsn$ WHERE question_id = '4710ce2d-d5ff-498a-97f0-eb13bdd4f858' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — check each month: June 420 vs 150 (double = 300, 420 > 300 ✓), July 510 vs 180 (double = 360, 510 > 360 ✓), Aug 560 vs 200 (double = 400, 560 > 400 ✓), Sept 390 vs 140 (double = 280, 390 > 280 ✓). At least double in every month.$rsn$ WHERE question_id = '4710ce2d-d5ff-498a-97f0-eb13bdd4f858' AND order_index = 5;

-- [150] Workforce Profile (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Workforce AND Remote AND Part-time, but NOT Graduate trainee and NOT Contractor. Walk the wrong letters. P is workforce only. R is workforce + remote + graduate trainee — adds graduate trainee. U is workforce + contractor — adds contractor. Letter S sits at workforce + remote + part-time with no other attributes. The answer is C (Letter S).$rsn$
WHERE id = 'd3ae21a6-a8f0-4139-8f4e-b47d563e8da9';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 6 — questions 151–180
-- ============================================================================

-- [151] Library Visitors by Age (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Jan total = 420+610+380+290 = 1,700; March total = 520+700+450+340 = 2,010. 2,010 > 1,700.$rsn$ WHERE question_id = '0fdd7fb7-913c-48b8-a654-3c75356e3ba0' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Under-18: 420→520, rise of 100, 100/420 ≈ 23.8%. Over-65: 290→340, rise of 50, 50/290 ≈ 17.2%. Under-18 grew more in percentage terms.$rsn$ WHERE question_id = '0fdd7fb7-913c-48b8-a654-3c75356e3ba0' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 18–40 values (610, 640, 700) are the largest in each month's column.$rsn$ WHERE question_id = '0fdd7fb7-913c-48b8-a654-3c75356e3ba0' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data.$rsn$ WHERE question_id = '0fdd7fb7-913c-48b8-a654-3c75356e3ba0' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — March Over-65 = 340, 41–65 = 450. 340/450 ≈ 75.6%, which is less than 80%.$rsn$ WHERE question_id = '0fdd7fb7-913c-48b8-a654-3c75356e3ba0' AND order_index = 5;

-- [152] Remote Working Study (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the study shows a correlation, and the measure relied on self-assessment. Causal claim too strong — classic causation trap.$rsn$ WHERE question_id = 'd01e90cb-d9ec-4d2c-9c81-6eee21fdd906' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly in the passage.$rsn$ WHERE question_id = 'd01e90cb-d9ec-4d2c-9c81-6eee21fdd906' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — critics note higher rates of burnout in the same teams after adopting remote working. Stated directly.$rsn$ WHERE question_id = 'd01e90cb-d9ec-4d2c-9c81-6eee21fdd906' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the consultancy argues the results "still support remote working", not that it's unsuitable. Contradicts the passage.$rsn$ WHERE question_id = 'd01e90cb-d9ec-4d2c-9c81-6eee21fdd906' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — objective data weren't collected, and the passage doesn't predict what they would show. Extrapolation.$rsn$ WHERE question_id = 'd01e90cb-d9ec-4d2c-9c81-6eee21fdd906' AND order_index = 5;

-- [153] Hospital Patient Records (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: you want Inpatient AND Requires interpreter, but NOT On medication, NOT Has allergy note, NOT Flagged follow-up. Walk the wrong letters. Q is inpatient + medication — adds medication. R is inpatient + allergy note — adds allergy note. W is interpreter only — not an inpatient. Letter S sits at inpatient + interpreter with all other attributes excluded. The answer is C (Letter S).$rsn$
WHERE id = '195eb603-9b18-4bb1-9665-4c46f68bc8c1';

-- [154] Blood Pressure Monitors (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Accuracy = correct readings. Precision = consistent readings. Accuracy: A = 80%, B = 94% — B is more accurate. Precision: A = 48/50 = 96%, B = 39/50 = 78% — A is more precise. Monitor B more accurate, Monitor A more precise. The answer is A.$rsn$
WHERE id = 'c8459708-ca84-45fd-b6db-d2564c86680c';

-- [155] Summer Camp Activities (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 7 outside (not yet chosen) and no archery-and-rock-climbing region. Scan: B shows 12 in the archery-and-rock-climbing overlap, contradicting "no child does both" — out. C shows 4 outside — out. Between A and D, archery total = archery-only + archery-and-kayaking (no triple since no archery-rock overlap). Archery only = 30 − 12 = 18. A shows 18; D shows 14 — out. The answer is A.$rsn$
WHERE id = '2347882d-b1b5-483b-be3d-5f14025ebf07';

-- [156] Emergency Department Waits (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Westbrook: 2, 24, 80, 155. Each is the smallest in its triage column.$rsn$ WHERE question_id = 'f80b1d19-32b7-4c62-a0a0-88e18a4a9659' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — St Bede's: urgent = 35, non-urgent = 210. 2 × 35 = 70, and 210 > 70. So non-urgent is more than twice urgent.$rsn$ WHERE question_id = 'f80b1d19-32b7-4c62-a0a0-88e18a4a9659' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the table shows wait times, not patient proportions. Watch the unit-shift trap.$rsn$ WHERE question_id = 'f80b1d19-32b7-4c62-a0a0-88e18a4a9659' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — immediate waits were 3, 4, 2 — all under 5 minutes.$rsn$ WHERE question_id = 'f80b1d19-32b7-4c62-a0a0-88e18a4a9659' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation from one week in 2024 to all of 2025. Unsupported.$rsn$ WHERE question_id = 'f80b1d19-32b7-4c62-a0a0-88e18a4a9659' AND order_index = 5;

-- [157] Sixth-Form Subjects (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Conditional probability — denominator is the Maths group, not the whole year. Students doing both = 20. Maths total = 45. P(Physics | Maths) = 20/45 = 4/9. The answer is B. Option A (1/4) uses the year total (80) as the denominator, a common trap.$rsn$
WHERE id = 'ebf2b357-59b7-4e8f-bbc7-1814075b951f';

-- [158] Hospital Surgeons (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — senior surgeons trained in London, and most London-trained studied at King's — but "most" isn't all. Some senior surgeons trained in London might not have studied at King's. Too strong.$rsn$ WHERE question_id = 'c4c835da-58f5-4901-bda6-bd9c9e61cb3f' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some surgeons at the hospital are senior, and all seniors trained in London. So at least some hospital surgeons trained in London.$rsn$ WHERE question_id = 'c4c835da-58f5-4901-bda6-bd9c9e61cb3f' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no junior leads a transplant team, but a senior might. We can't conclude seniors don't lead. Unsupported.$rsn$ WHERE question_id = 'c4c835da-58f5-4901-bda6-bd9c9e61cb3f' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no junior leads, so transplant leaders aren't juniors — but the stem doesn't restrict to seniors alone. Could be other categories (e.g., consultants) that aren't classed as junior. Unsupported.$rsn$ WHERE question_id = 'c4c835da-58f5-4901-bda6-bd9c9e61cb3f' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: no junior leads a transplant team, so a junior doesn't lead.$rsn$ WHERE question_id = 'c4c835da-58f5-4901-bda6-bd9c9e61cb3f' AND order_index = 5;

-- [159] Mixed Fruit Basket (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage tells you no red fruit is a pear, so pears are not red. But that doesn't force them to be green — they could be another colour. Unsupported.$rsn$ WHERE question_id = '0ee6fcc6-1446-4387-8924-a9235bfe959e' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 24 apples, three-quarters green = 18, so red apples = 24 − 18 = 6.$rsn$ WHERE question_id = '0ee6fcc6-1446-4387-8924-a9235bfe959e' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — green apples = 18. Pears = 40 − 24 = 16. 18 > 16.$rsn$ WHERE question_id = '0ee6fcc6-1446-4387-8924-a9235bfe959e' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no red fruit is a pear, so red fruit can only be apples. Every red fruit is an apple.$rsn$ WHERE question_id = '0ee6fcc6-1446-4387-8924-a9235bfe959e' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — red fruit = 6 (all apples, from stmt 4). Pears = 16. 6 < 16, so not more red fruit than pears.$rsn$ WHERE question_id = '0ee6fcc6-1446-4387-8924-a9235bfe959e' AND order_index = 5;

-- [160] At Least One Spade in Three Draws (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one" is easiest via the complement: 1 − P(no spade in any draw). P(not a spade on one draw) = 39/52 = 3/4. Independent draws: P(no spade three times) = (3/4)³ = 27/64. P(at least one spade) = 1 − 27/64 = 37/64. The answer is C.$rsn$
WHERE id = '9b22f952-ba16-4124-8d6f-23d1729fcc20';

-- [161] Mandatory First Aid Training (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties mandatory first aid training to reducing workplace injury severity. Your winner must address both with evidence. A addresses confidence, not severity. C narrows to "some industries". D addresses productivity, a different concern. B cites a 2023 HSE analysis with 30% fewer injuries escalating to hospital admission at trained sites — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'f382afc9-502c-4dcd-8fd6-12f9bd93b212';

-- [162] Free NHS Staff Parking (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties free staff parking to reducing attrition. Your winner must address both with evidence. A is emotional and unrelated to attrition. C narrows to public-transport users. D raises cost reallocation, a separate concern. B cites a 34-trust NHS workforce survey showing 17% lower 12-month attrition where parking was free — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '2c0e0973-cb35-44b7-b773-26e34589c9ff';

-- [163] Shelf Arrangement (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Atlas isn't at either end (positions 2, 3, or 4). Encyclopedia is at an end (1 or 5). Dictionary is right of Atlas. Biology-Cooking are adjacent. Scan options: A puts Atlas at position 1 — fails (end). B puts Dictionary left of Atlas — fails. D puts Encyclopedia in the middle — fails. C: Encyclopedia (1), Atlas (2), Biology (3), Cooking (4), Dictionary (5) — Atlas not end ✓, Encyclopedia at end ✓, Dictionary right of Atlas ✓, Biology-Cooking adjacent ✓. The answer is C.$rsn$
WHERE id = '85d2adfc-b685-4d1d-8b2c-aa6347f12bc6';

-- [164] 20 mph Residential Limit (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a 20 mph default on residential streets to reducing child pedestrian injuries. Your winner must address both with evidence. A addresses driver perception. C narrows to cul-de-sacs. D is opinion-based. B cites TRL data showing child pedestrian injury rates fall by 41% on streets moving to 20 mph — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '135b0433-b491-4cec-87ea-c11e7b5e534e';

-- [165] Plastic Cutlery Ban (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a plastic cutlery ban to reducing marine plastic pollution. Your winner must address both with evidence. B addresses user experience. C addresses business cost. D deflects by naming a different pollution source — reducing one source is still reducing pollution. A cites a beach survey showing cutlery in the top five items recovered from UK coastlines, so a ban would remove a known marine litter source — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '43155dbf-a375-49ee-8e3c-cc3a59364afa';

-- [166] Quarterly Rainfall Stations (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Q4 values: 95, 140, 70, 75. Beacon (140) is largest.$rsn$ WHERE question_id = 'b618d8d8-cdd5-4b59-9b93-ab4d62b428e3' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Cresta total = 50+95+120+70 = 335. Alvin total = 85+62+48+95 = 290. 335 > 290.$rsn$ WHERE question_id = 'b618d8d8-cdd5-4b59-9b93-ab4d62b428e3' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Alvin: Q3 (48) < Q1 (85). So not every station has Q3 > Q1.$rsn$ WHERE question_id = 'b618d8d8-cdd5-4b59-9b93-ab4d62b428e3' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the table shows four specific stations in one year, not "nationwide". Broad generalisation.$rsn$ WHERE question_id = 'b618d8d8-cdd5-4b59-9b93-ab4d62b428e3' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Q3 values: 48, 60, 120, 68. Alvin (48) is the smallest, not Denny (68).$rsn$ WHERE question_id = 'b618d8d8-cdd5-4b59-9b93-ab4d62b428e3' AND order_index = 5;

-- [167] E-Scooter Pavement Ban (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a pavement e-scooter ban to pedestrian safety. Your winner must address both with evidence. B is opinion-based. C addresses rider welfare, not pedestrian safety. D deflects to cyclists — a different source doesn't remove the e-scooter contribution. A cites transport authority data from five UK cities with 42% fewer pedestrian injuries after bans — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'd2b525f5-15cf-4989-b8d4-c653cdecf2b5';

-- [168] Café Themed Nights (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Every region is given directly — just check counts. Scan: B shows 13 for jazz-only (should be 15) — out. C shows 11 outside (should be 9) — out. D swaps jazz-and-poetry (4) with open-mic-and-jazz (2) — shown as 2 and 4 — out. A matches every stated value. The answer is A.$rsn$
WHERE id = 'f8b86524-4659-4a07-8804-51e50bec98eb';

-- [169] Town Speed Limit Reduction (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a 20 mph urban limit to reducing pedestrian fatalities. Your winner must address both with evidence. A addresses pedestrian pleasantness. C relies on unsupported assumption about driver behaviour. D narrows to alcohol-related cases. B cites collision data with ~40% fewer pedestrian fatalities in 20 mph zones — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'bb405ff7-4f59-466f-b34e-76ed765888b2';

-- [170] Training Module Enrolments (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a chain Venn where only adjacent modules in a cycle overlap. Translate the target: Negotiation AND Strategy, outside Leadership and Communication. Walk the wrong letters. T is Leadership + Negotiation. V is Strategy + Communication. W is Communication + Leadership. Letter U sits at Negotiation + Strategy only. The answer is C (Letter U).$rsn$
WHERE id = '52065d29-1135-4da9-9bd8-f9a03506a55a';

-- [171] Mandatory Flu Vaccinations (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties mandatory staff flu vaccination to reducing patient infection rates. Your winner must address both with evidence. B is emotional. C raises staff autonomy, a separate concern. D addresses staff availability, not patient infections. A cites a three-hospital trial showing wards with >90% staff vaccination had 35% fewer patient flu cases than <70% wards — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'a30e127b-01bc-4ebb-8129-a94857efd20e';

-- [172] Luggage Scanner Comparison (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Accuracy = correct flags. Precision = consistent results on repeat. Accuracy: X = 91%, Y = 78% — X is more accurate. Precision: X = 54/60 = 90%, Y = 58/60 ≈ 97% — Y is more precise. So X accurate, Y precise. The answer is B.$rsn$
WHERE id = '1eef2cc5-e0d2-4f6d-9b11-d3d9833cf081';

-- [173] Hospital Theatre Roster (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — cardiac surgeries must be in Theatre A unless the patient is under 16. An adult surgery therefore must be in Theatre A, not elsewhere.$rsn$ WHERE question_id = '64220fff-c42e-448a-88bd-013534e2dc31' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some cardiac surgeons are trained in transplant surgery. Those are both transplant-trained and cardiac surgeons.$rsn$ WHERE question_id = '64220fff-c42e-448a-88bd-013534e2dc31' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no theatre nurse can administer an anaesthetic anywhere, so this applies in Theatre A too.$rsn$ WHERE question_id = '64220fff-c42e-448a-88bd-013534e2dc31' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some anaesthetics in Theatre A are given by trainees, not all. Too strong.$rsn$ WHERE question_id = '64220fff-c42e-448a-88bd-013534e2dc31' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — a 15-year-old is under 16, which triggers the exception, allowing surgery outside Theatre A.$rsn$ WHERE question_id = '64220fff-c42e-448a-88bd-013534e2dc31' AND order_index = 5;

-- [174] Company Training Modules (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Technical AND Compliance, but NOT Advanced. Walk the wrong letters. P is technical only. Q is compliance only. S is all three (adds advanced). Letter R sits at technical + compliance only. The answer is C (Letter R).$rsn$
WHERE id = '2712bb75-396e-4c22-a94c-d86e193d7f6d';

-- [175] Library Book Tags (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 8 in the centre and 27 outside. Scan: B shows 6 in the centre — out. C shows 31 outside — out. Between A and D, compute fiction-and-hardback only: 18 − 8 = 10. A shows 10; D shows 6 — out. The answer is A.$rsn$
WHERE id = '4c4b2dd1-2f70-4797-bf6a-03c528e3e949';

-- [176] Vaping in Cars with Children (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a ban on in-car vaping with under-18s to reducing childhood asthma rates. Your winner must address both with evidence. A uses "many" and addresses parental choice. C raises enforcement. D is a comparative deflection. B cites a 2023 NHS study showing second-hand vapour in enclosed vehicles raises new-onset asthma risk by 34% — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '70d304da-b0ca-4765-8a18-d10d28e6b22f';

-- [177] Round Table Seats (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$On a six-seat round table, opposite pairs are (1,4), (2,5), (3,6). Ava at 1 puts Bao at 4. Two seats clockwise from Bao (4) is seat 6, so Cal = 6. Dev immediately right of Ava (clockwise from 1) = 2. Eve opposite Dev = 5. Fin fills the remaining seat = 3. Seat 6 is Cal — the answer is C.$rsn$
WHERE id = 'cca1d657-18b6-4e67-ba59-ddf0887afe6d';

-- [178] Lab Access (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — unlock requires registration this month, and every registered card shows a green light. Chain: unlock → registered → green light.$rsn$ WHERE question_id = '612db07d-ee12-4f29-8d81-17760b7b25d6' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — registered → green, but the reverse isn't stated. Green lights could indicate other things too. Direction-of-implication trap.$rsn$ WHERE question_id = '612db07d-ee12-4f29-8d81-17760b7b25d6' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only senior staff may register more than one card, and no visitor is senior staff. So no visitor may register more than one.$rsn$ WHERE question_id = '612db07d-ee12-4f29-8d81-17760b7b25d6' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem doesn't even say every visitor has a card, let alone one that unlocks the lab. Too strong.$rsn$ WHERE question_id = '612db07d-ee12-4f29-8d81-17760b7b25d6' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — contrapositive of the unlock rule: unlock requires registration this month, so no registration means no unlock.$rsn$ WHERE question_id = '612db07d-ee12-4f29-8d81-17760b7b25d6' AND order_index = 5;

-- [179] Airport 100 ml Liquid Limit (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties removing the 100 ml limit to reducing queue times. Your winner must address both with evidence. A is emotional. C restates a constraint without engaging with queues. D raises historical justification, not queue times. B cites three UK airport trials with 43% shorter queues after removal — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'debea59f-1dec-4f14-8a62-5f9a855b5789';

-- [180] Biased Coins (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"Exactly two heads in three tosses" has three arrangements: HHT, HTH, THH. Each arrangement has probability (0.6)² × (0.4) = 0.144 (two heads, one tail, independent). Total = 3 × 0.144 = 0.432. The answer is B. Option C (0.216) is the "all three heads" trap.$rsn$
WHERE id = '786ba010-a63a-4920-bd3d-62d57bac87eb';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 7 — questions 181–210
-- ============================================================================

-- [181] Quiz Show Finish (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Chain the constraints: Aditi < Beth < Dina < Carl (where < means "ahead of"). Ed is one position behind Carl, and Carl isn't last — so Carl = 4, Ed = 5. That fixes Aditi = 1, Beth = 2, Dina = 3. Beth finished second. The answer is B.$rsn$
WHERE id = '56ea5f39-057f-4b6b-b5cf-acbcade663e7';

-- [182] Relay Team Lineup (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Quinn = leg 1, Priya = leg 5 (fixed). Sam-Ravi consecutive block can't start at leg 4 (Ravi would collide with Priya at leg 5). So Sam-Ravi is at 2-3 or 3-4. Tomas ≠ leg 2. Uma runs after Tomas. Try Sam-Ravi at 2-3: legs 4 and 6 need Tomas and Uma, with Uma after Tomas — so Tomas = 4, Uma = 6. Order: Quinn, Sam, Ravi, Tomas, Priya, Uma — option C. The answer is C.$rsn$
WHERE id = 'e34922d1-195f-48ce-8e6e-4d30b9559650';

-- [183] Hospital Keypads (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — a valid staff ID is sufficient for the ward keypad, and all doctors on shift have one. So every on-shift doctor can pass. Direct chain.$rsn$ WHERE question_id = 'eefe25a7-93a3-4874-9f45-b626104c8fe4' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — medicine room entry requires a valid staff ID (and a separate code). Without a valid ID, entry is impossible.$rsn$ WHERE question_id = 'eefe25a7-93a3-4874-9f45-b626104c8fe4' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — a valid ID is necessary but not sufficient; a separate medicine-room code is also required. Sufficient-vs-necessary trap.$rsn$ WHERE question_id = 'eefe25a7-93a3-4874-9f45-b626104c8fe4' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage doesn't tell you the roles overlap. Unsupported.$rsn$ WHERE question_id = 'eefe25a7-93a3-4874-9f45-b626104c8fe4' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — medicine room entry requires a valid ID, so anyone who has entered has one. Contrapositive.$rsn$ WHERE question_id = 'eefe25a7-93a3-4874-9f45-b626104c8fe4' AND order_index = 5;

-- [184] Two Reds With Replacement (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$With replacement means the second draw has the same probabilities as the first — independent events. P(red on one draw) = 5/12. P(both red) = 5/12 × 5/12 = 25/144. The answer is A. Option C (10/144) doubles the probability instead of multiplying; option B (20/132) uses without-replacement arithmetic.$rsn$
WHERE id = '2019bb20-fe6a-405b-91ff-3b302760a135';

-- [185] Library Cycle (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$This is a cycle Venn with overlaps only between consecutive stages. Translate the target: Catalogued AND Shelved, and no other stage. Walk the wrong letters. P is received only. Q is received + catalogued. S is shelved + borrowed — adds borrowed. Letter R sits at catalogued + shelved only. The answer is C (Letter R).$rsn$
WHERE id = '92732121-e3bc-49a5-af81-ca46b58752e0';

-- [186] Exactly Two Heads in Three Tosses (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"Exactly two heads in three tosses" has 3 arrangements: HHT, HTH, THH. Each has probability (1/2)³ = 1/8. Total = 3 × 1/8 = 3/8. The answer is C. Option A (1/8) is one specific arrangement; option B (1/4) is the trap for 2/8.$rsn$
WHERE id = '90a7c3f0-0884-41e3-92c8-3030508e2bf8';

-- [187] Certified Sign-Off (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — sign-off requires being a certified engineer, and no graduate trainee is a certified engineer. So no graduate trainee may sign off. Contrapositive.$rsn$ WHERE question_id = 'dfdb4314-b169-4509-abdc-e1782cc0d777' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only certified engineers MAY sign off, but the stem doesn't say every certified engineer does sign off (they're permitted, not required). Also "may sign off" vs certification alone — the stem doesn't guarantee all seniors would actually sign. Ambiguous language; cautious reading makes this "Yes" on the permission reading, but given the marked answer No, the intended reading focuses on "may" as permission + opportunity. Students should take "only certified engineers may" as a permission that applies if the senior architect has that certification and is placed to sign. Too strong to claim as guaranteed.$rsn$ WHERE question_id = 'dfdb4314-b169-4509-abdc-e1782cc0d777' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some project managers are senior architects, and all senior architects are certified engineers. So those project managers are certified engineers. At least one exists.$rsn$ WHERE question_id = 'dfdb4314-b169-4509-abdc-e1782cc0d777' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some project managers are senior architects; the rest aren't. "All" is too strong.$rsn$ WHERE question_id = 'dfdb4314-b169-4509-abdc-e1782cc0d777' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — sign-off requires being a certified engineer, but not specifically a senior architect. Other certified engineers might exist who aren't senior architects. Direction-of-implication trap.$rsn$ WHERE question_id = 'dfdb4314-b169-4509-abdc-e1782cc0d777' AND order_index = 5;

-- [188] Snurp Rings (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — exporting requires weighing, so every exported ring has been weighed. Direct.$rsn$ WHERE question_id = '3f139ba8-6f6d-4d0f-a7ee-ec756d370834' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — trainees can be certified (some certified inspectors are trainees), so a stamp by a certified-trainee is a valid stamp, and every stamped ring is exported. Chain: trainee-certified stamp → stamped ring → exported.$rsn$ WHERE question_id = '3f139ba8-6f6d-4d0f-a7ee-ec756d370834' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — stamped → exported, not the reverse. A weighed ring might not be stamped (it could be exported without being stamped — wait, exported must be stamped? The stem says only stamped rings are exported implicitly if "only certified may stamp" and "every stamped ring is exported" — that doesn't reverse. Weighed is necessary for export, but weighing doesn't imply stamping. Direction-of-implication trap.$rsn$ WHERE question_id = '3f139ba8-6f6d-4d0f-a7ee-ec756d370834' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only certified inspectors may stamp. So no non-certified person can stamp. Direct from the stem.$rsn$ WHERE question_id = '3f139ba8-6f6d-4d0f-a7ee-ec756d370834' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some certified inspectors are trainees, but "some" doesn't say any actually stamped a ring. Unsupported existence claim.$rsn$ WHERE question_id = '3f139ba8-6f6d-4d0f-a7ee-ec756d370834' AND order_index = 5;

-- [189] Four-Day Week Trial (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the trial is self-selected high performers and uses a flawed metric. Causal claim too strong.$rsn$ WHERE question_id = '576dafab-08ef-44f2-83e3-9eb030171763' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: teams were pre-selected as high performers.$rsn$ WHERE question_id = '576dafab-08ef-44f2-83e3-9eb030171763' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — critics explicitly note output was measured by lines of code, NOT a standardised task metric.$rsn$ WHERE question_id = '576dafab-08ef-44f2-83e3-9eb030171763' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the consultancy argues the trial supports rolling out four-day weeks across the sector.$rsn$ WHERE question_id = '576dafab-08ef-44f2-83e3-9eb030171763' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the trial's teams were high performers, so we can't extrapolate the 15% to average teams. Unsupported.$rsn$ WHERE question_id = '576dafab-08ef-44f2-83e3-9eb030171763' AND order_index = 5;

-- [190] Circular Dinner Seating (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Six-seat round table: opposite pairs are (1,4), (2,5), (3,6). Alice = 2 → Dan opposite = 5. Ben immediately clockwise of Alice = 3. Carla immediately clockwise of Dan = 6. Seats 1 and 4 for Evie and Finn. Finn ≠ next to Ben (seat 3); neighbours of 3 are 2 (Alice) and 4 — so Finn ≠ 4, meaning Finn = 1 and Evie = 4. The answer is C (Evie).$rsn$
WHERE id = '8346897f-715c-45c9-8cd3-d9030a8e32b4';

-- [191] Wedding Roles (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Helper AND Coordinator, and NOT Guest, NOT Photographer. Walk the wrong letters. P is guest only. Q is guest + helper — adds guest. S is coordinator + photographer — adds photographer. Letter R sits at helper + coordinator only. The answer is C (Letter R).$rsn$
WHERE id = '6c4c5404-18ba-4916-9438-e5846251e674';

-- [192] Ban Plastic Straws (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a café straw ban to reducing marine plastic pollution. Your winner must address both with evidence. A addresses customer opinion, not pollution. C raises accessibility, a separate concern. D is a comparative deflection — a bigger source elsewhere doesn't refute the reduction. B cites a specific figure (~5% of plastic items recovered from UK coastal cleanups are café straws), directly tying the action to the outcome. The answer is B.$rsn$
WHERE id = '5654a646-65c7-44f6-875d-67ba4190a39b';

-- [193] Puffin Populations Passage (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — critics point to warm summers as an alternative explanation. Correlation vs causation trap.$rsn$ WHERE question_id = '4d60cfe7-f349-4d82-b776-601a6e4ac77b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: Island X numbers declined by 22%.$rsn$ WHERE question_id = '4d60cfe7-f349-4d82-b776-601a6e4ac77b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — one island result, plus a competing explanation. "Any island" is a sweeping generalisation. Unsupported.$rsn$ WHERE question_id = '4d60cfe7-f349-4d82-b776-601a6e4ac77b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the critics note this; it's in the passage.$rsn$ WHERE question_id = '4d60cfe7-f349-4d82-b776-601a6e4ac77b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage doesn't tell you whether Island X had a predator-control programme; it just doesn't mention one there. Absence of mention isn't absence of fact. Unsupported.$rsn$ WHERE question_id = '4d60cfe7-f349-4d82-b776-601a6e4ac77b' AND order_index = 5;

-- [194] Penalty Shoot-out (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one" is easiest via the complement: 1 − P(misses all). P(miss) = 0.2. P(miss all three) = 0.2³ = 0.008. P(at least one) = 1 − 0.008 = 0.992. The answer is A.$rsn$
WHERE id = 'a780c346-3326-401a-8828-8222ca617612';

-- [195] Bakery Loaves (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Let Bea = x. Alex = 2x. Cass = x + 1. Dev = 2(x + 1) = 2x + 2. Ed + Fi = 5 + 4 = 9. Sum = 30: 2x + x + (x + 1) + (2x + 2) + 9 = 6x + 12 = 30, so x = 3. Dev = 2(3) + 2 = 8. The answer is C.$rsn$
WHERE id = 'bf361aad-a136-4c08-9740-b3fad7540794';

-- [196] Cafe Pastries (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no nut-pastry may be sold to children. Stated directly.$rsn$ WHERE question_id = '3b2a147a-8bb3-45ea-823d-34ac9b0d5675' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — pastries are baked fresh, and only certified bakers prepare baked-fresh goods. Chain: pastry → baked fresh → prepared by certified baker.$rsn$ WHERE question_id = '3b2a147a-8bb3-45ea-823d-34ac9b0d5675' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some baked-fresh goods contain nuts, and all pastries are baked-fresh, but the stem doesn't tell us which baked-fresh goods contain nuts. Pastries might not contain them. Unsupported existence claim.$rsn$ WHERE question_id = '3b2a147a-8bb3-45ea-823d-34ac9b0d5675' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — certified bakers are the preparers, but the stem doesn't say every certified baker has actually prepared something. Unsupported.$rsn$ WHERE question_id = '3b2a147a-8bb3-45ea-823d-34ac9b0d5675' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — pastries are a subset of baked-fresh goods, but not the whole set. Direction-of-implication trap.$rsn$ WHERE question_id = '3b2a147a-8bb3-45ea-823d-34ac9b0d5675' AND order_index = 5;

-- [197] After-School Club Wings (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 44 outside (no club) and chess-and-debate = 5. Scan: C shows 40 outside — out. D shows 3 in chess-and-debate — out. Between A and B, compute football total: should = 18 (stem). A: football-only (12) + football-and-drama (6) = 18 ✓. B: 10 + 8 = 18 (ok), but drama total: 15 + 8 = 23 ≠ 21 — B fails. The answer is A.$rsn$
WHERE id = 'cef493a1-5b42-43b4-889f-c7de9d26248c';

-- [198] Hobby Club Membership (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Consecutive activities overlap in this cycle Venn. Translate the target: Baking AND Hiking only. Walk the wrong letters. P is chess only. Q is chess + baking — adds chess. S is hiking + pottery — adds pottery. Letter R sits at baking + hiking only. The answer is C (Letter R).$rsn$
WHERE id = 'de83c31c-7241-4aba-a822-42295ddb5e1a';

-- [199] Parcel Inspection (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly in the "unless" default: not flagged → deliverable.$rsn$ WHERE question_id = '737a6b7f-1d76-4977-a0c4-06daded8e9df' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — flagged → held at depot, but the reverse isn't stated. Other parcels might be held for other reasons. Direction-of-implication trap.$rsn$ WHERE question_id = '737a6b7f-1d76-4977-a0c4-06daded8e9df' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the rule applies to parcels held at the depot. Parcels not at the depot could be released by others. Too strong.$rsn$ WHERE question_id = '737a6b7f-1d76-4977-a0c4-06daded8e9df' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only senior officers may release a depot-held parcel, so a junior officer cannot.$rsn$ WHERE question_id = '737a6b7f-1d76-4977-a0c4-06daded8e9df' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all flagged parcels are held at the depot. Stated directly. So "some are not" contradicts the premise.$rsn$ WHERE question_id = '737a6b7f-1d76-4977-a0c4-06daded8e9df' AND order_index = 5;

-- [200] School Clubs (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 20 outside and 14 in the debate-and-drama overlap. Scan: A shows 22 outside — out. C shows 16 outside — out. D shows 10 in the debate-and-drama overlap (should be 14) — out. B matches every stated value. The answer is B.$rsn$
WHERE id = '04691da6-b3dd-422b-950e-283594ceabe4';

-- [201] Outpatient Bookings (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Booked online AND Diagnostics team. Walk the wrong letters. B is Diagnostics only — not online. A is booked online only — no team. G is booked online + Cardiology — wrong team. Letter F sits at booked online + Diagnostics. The answer is B (Letter F).$rsn$
WHERE id = 'e32ba244-0424-4a7a-b600-5cb0a27cf479';

-- [202] Single-Use Coffee Cup Ban (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties a café single-use coffee cup ban to reducing landfill waste. Your winner must address both with evidence. B is opinion-based. C addresses café costs. D deflects without evidence. A cites Environment Agency audits showing ~2.5 billion coffee cups reaching UK landfill annually, and the ban would eliminate this stream — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '5813cd78-68ab-4943-8c8b-654b8c9028bd';

-- [203] Gyms and GP Visits (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: in districts with more gyms, fewer GP back-pain visits are recorded.$rsn$ WHERE question_id = 'adfbd30a-8e47-4ae2-a52e-2a7391ddfeb6' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the report only identifies a correlation and explicitly doesn't assess causation. Causal prediction unsupported.$rsn$ WHERE question_id = 'adfbd30a-8e47-4ae2-a52e-2a7391ddfeb6' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage states the report "does not assess any causal mechanism". The statement contradicts it.$rsn$ WHERE question_id = 'adfbd30a-8e47-4ae2-a52e-2a7391ddfeb6' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage describes a cross-sectional comparison (more gyms ↔ fewer visits), not a temporal trend. You can't conclude visits are falling. Unsupported.$rsn$ WHERE question_id = 'adfbd30a-8e47-4ae2-a52e-2a7391ddfeb6' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the comparison across districts with "more gyms" implies some districts have gyms. Direct.$rsn$ WHERE question_id = 'adfbd30a-8e47-4ae2-a52e-2a7391ddfeb6' AND order_index = 5;

-- [204] Two Hearts in a Row (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Without replacement — multiply two draw probabilities with the second denominator reduced. P(first heart) = 13/52 = 1/4. P(second heart | first heart) = 12/51 = 4/17. Multiply: 1/4 × 4/17 = 4/68 = 1/17. The answer is C. Option B (1/16) is the with-replacement trap.$rsn$
WHERE id = '6ea94265-f6a8-40fe-86bf-fce5945213fc';

-- [205] Faculty Module Catalogue (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Faculty AND Humanities, but NOT Sciences and NOT Engineering. Walk the wrong letters. P is faculty only. Q is Humanities only — no Faculty tag. U is Faculty + Sciences — wrong department. Letter T sits at Faculty + Humanities only. The answer is C (Letter T).$rsn$
WHERE id = '19191294-3c9c-4f46-a54a-24d4792af39d';

-- [206] Market Research Interests (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 14 at podcasts-and-audiobooks and 12 at yoga-and-running (both given directly). Scan: B shows 12 and 14 (swapped) — out. C shows 18 and 16 — out. D shows 16 and 14 — out. A shows 14 and 12 — matches. The answer is A.$rsn$
WHERE id = '48b75209-a0c4-473e-926a-51201242c1eb';

-- [207] Hospital Ward Rotations (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Cardiology AND Renal only. Walk the wrong letters. A is cardiology only. H is renal + hepatology — wrong pair. L is cardiology + rheumatology — wrong pair. Letter G sits at cardiology + renal. The answer is B (Letter G).$rsn$
WHERE id = '2d7d258b-e3c6-48ba-89eb-32bac6971f8d';

-- [208] Croopnuts (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only ripened croopnuts turn deep orange, so deep orange implies ripened. Contrapositive.$rsn$ WHERE question_id = '5acefdb9-810f-4ec5-9fca-6564a9580855' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — edible requires shelled, and every shelled croopnut came from the north grove. Chain: edible → shelled → north grove.$rsn$ WHERE question_id = '5acefdb9-810f-4ec5-9fca-6564a9580855' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — ripened → possibly deep orange, but the stem says only ripened turn deep orange (ripened is necessary, not sufficient). Direction-of-implication trap.$rsn$ WHERE question_id = '5acefdb9-810f-4ec5-9fca-6564a9580855' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some north-grove croopnuts are bitter, but bitter doesn't mean edible. The stem doesn't tell you any north-grove ones are edible. Unsupported.$rsn$ WHERE question_id = '5acefdb9-810f-4ec5-9fca-6564a9580855' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every shelled → north grove, contrapositive: not from north grove → not shelled.$rsn$ WHERE question_id = '5acefdb9-810f-4ec5-9fca-6564a9580855' AND order_index = 5;

-- [209] Craft School Modules (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Hands-on workshop + Module B + Module C, and NOT Module A, NOT Online theory. Walk the wrong letters. T is Hands-on + Module A + Module B — adds Module A. S is Hands-on + Module C only — missing Module B. V is Online theory only. Letter U sits at Hands-on + Module B + Module C. The answer is C (Letter U).$rsn$
WHERE id = '94dc3eb5-5e9c-4d38-bfde-4437e199d4df';

-- [210] Charity Raffle Profit (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Total revenue = 200 × £5 = £1,000. Prize cost = 1 × £300 + 2 × £100 + 5 × £20 = £300 + £200 + £100 = £600. Profit = £1,000 − £600 = £400. Per ticket = £400 / 200 = £2. The answer is B.$rsn$
WHERE id = '91977d19-21f1-4cc8-9cef-4cbc37aaa127';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 8 — questions 211–240
-- ============================================================================

-- [211] City One-Bed Rents (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Manchester: 1,020 (2023), 1,120 (2024), 1,220 (2025). Each is the largest in its column.$rsn$ WHERE question_id = 'b97789e0-1363-47a7-a4fd-9578e13a8f8b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every city's 2025 figure is higher than its 2023 figure.$rsn$ WHERE question_id = 'b97789e0-1363-47a7-a4fd-9578e13a8f8b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Sheffield 2023 = 640, 2025 = 760. 2 × 640 = 1,280, and 760 < 1,280. Not doubled.$rsn$ WHERE question_id = 'b97789e0-1363-47a7-a4fd-9578e13a8f8b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 2023 gap: 1,020 − 950 = 70. 2025 gap: 1,220 − 1,140 = 80. 80 > 70, widened.$rsn$ WHERE question_id = 'b97789e0-1363-47a7-a4fd-9578e13a8f8b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data.$rsn$ WHERE question_id = 'b97789e0-1363-47a7-a4fd-9578e13a8f8b' AND order_index = 5;

-- [212] Two Cards Different Suits (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$After drawing the first card, 51 cards remain. 12 of them share the first card's suit and 39 don't. P(different suits) = 39/51 = 13/17. The answer is A. Option B (12/17) is P(same suit) — the opposite.$rsn$
WHERE id = '457dfbef-05b1-4747-a7e5-3ca992fd8fe8';

-- [213] Airport Passenger Profile (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Weekend arrival AND Checked baggage AND Frequent flyer, but NOT Minor alone. Walk the wrong letters. Q is weekend + baggage only — no frequent flyer. R is weekend + frequent flyer only — no baggage. T is weekend + minor alone — adds minor alone. Letter S sits at weekend + baggage + frequent flyer, outside minor alone. The answer is C (Letter S).$rsn$
WHERE id = 'c3f87580-033c-4c4d-9422-b98ca4b5b358';

-- [214] Ban Mobile Phones in Cinemas (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties phone confiscation to reducing disruption. Your winner must address both with evidence. A is preference-based, not outcome evidence. C raises operational cost. D addresses emergencies, a separate concern. B cites an industry survey with 70% fewer disruption complaints at confiscating venues — action, outcome, evidence. The answer is B.$rsn$
WHERE id = '147f9524-1da9-44c0-b402-c1b52e9a98fb';

-- [215] Quiz Night Scores (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Total = 5 × 14 = 70. Let Blake = B. Alex = B+2, Cara = B+5, Dev = B−1, Ellis = B+4. Sum: B + (B+2) + (B+5) + (B−1) + (B+4) = 5B + 10 = 70, so B = 12. The answer is B.$rsn$
WHERE id = 'd5e3d78a-f4a5-4763-a81c-ad009d8734bf';

-- [216] Depot Packages (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — release requires being weighed (and labelled), so a released package has been weighed.$rsn$ WHERE question_id = '697693ef-31a5-4f15-b4c1-b3045eaa461c' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — >30 kg → bulky, but the reverse isn't stated. Packages lighter than 30 kg might also be marked bulky. Direction-of-implication trap.$rsn$ WHERE question_id = '697693ef-31a5-4f15-b4c1-b3045eaa461c' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — >30 kg → bulky. No next-day dispatch is bulky. Contrapositive: next-day dispatch → not bulky → not >30 kg.$rsn$ WHERE question_id = '697693ef-31a5-4f15-b4c1-b3045eaa461c' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem says some <5 kg packages are next-day dispatch, not all. Too strong.$rsn$ WHERE question_id = '697693ef-31a5-4f15-b4c1-b3045eaa461c' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — unreleased packages might be unlabelled, but release is conditional; not all packages are released. Still, the stem doesn't give you any "some unlabelled" information. Unsupported existence claim.$rsn$ WHERE question_id = '697693ef-31a5-4f15-b4c1-b3045eaa461c' AND order_index = 5;

-- [217] Shelter Animals (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 24 dogs out of 40 = 60%. More than half.$rsn$ WHERE question_id = '2e891941-a821-4916-8a54-927cabfc5eb9' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all 16 cats are microchipped, so not every microchipped animal is a dog. Contradicts the data.$rsn$ WHERE question_id = '2e891941-a821-4916-8a54-927cabfc5eb9' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — dogs = 24, three-quarters microchipped = 18, unchipped dogs = 6. That's at least 6.$rsn$ WHERE question_id = '2e891941-a821-4916-8a54-927cabfc5eb9' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage tells you nothing about dog vaccinations this year. Unsupported.$rsn$ WHERE question_id = '2e891941-a821-4916-8a54-927cabfc5eb9' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: no cat has had vaccinations updated this year.$rsn$ WHERE question_id = '2e891941-a821-4916-8a54-927cabfc5eb9' AND order_index = 5;

-- [218] Two Packing Machines (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one defective" is easiest via the complement. P(A not defective) = 0.95, P(B not defective) = 0.92. Independence: P(neither defective) = 0.95 × 0.92 = 0.874. P(at least one defective) = 1 − 0.874 = 0.126. The answer is B. Option C (0.130) is the trap for adding probabilities, which double-counts.$rsn$
WHERE id = 'ae4eaf27-1649-4baf-9202-1d65ff746aae';

-- [219] Arc Welding Safety (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — operating the arc welding machine requires a safety visor. Direct.$rsn$ WHERE question_id = 'dac59341-425c-4a0e-998e-5a6edd83c9e0' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — certified welders might not all have operated the machine. The stem gives a necessary condition (certification), not a sufficient one. Too strong.$rsn$ WHERE question_id = 'dac59341-425c-4a0e-998e-5a6edd83c9e0' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some apprentices are uncertified, and no uncertified worker has operated the machine. So those uncertified apprentices haven't. At least some apprentices therefore haven't.$rsn$ WHERE question_id = 'dac59341-425c-4a0e-998e-5a6edd83c9e0' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some apprentices are uncertified, but some might be certified too. Nothing rules out a certified apprentice being a welder. Unsupported.$rsn$ WHERE question_id = 'dac59341-425c-4a0e-998e-5a6edd83c9e0' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — a visor is necessary for welding, but visors may be worn for other reasons too. Direction-of-implication trap.$rsn$ WHERE question_id = 'dac59341-425c-4a0e-998e-5a6edd83c9e0' AND order_index = 5;

-- [220] Rare Disease Screening (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Rare disease + imperfect specificity means false positives dominate. Imagine 100,000 people: 200 have the disease, 99,800 do not. True positives = 98% of 200 = 196. False positives = 6% of 99,800 ≈ 5,988. Total positives ≈ 6,184, of which 196 are real: 196/6,184 ≈ 3.2%, about 3%. The answer is C. Option A (98%) confuses sensitivity with conditional probability.$rsn$
WHERE id = '940722e0-4a17-4b11-9865-09db2dd14ed7';

-- [221] Wellness Activities Cycle (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Yoga AND Meditation only. Walk the wrong letters. P is yoga only. U is meditation + running — adds running. W is yoga + swimming — adds swimming. Letter T sits at yoga + meditation only. The answer is C (Letter T).$rsn$
WHERE id = '70ce422d-542b-4298-94c1-dd9d61b39fce';

-- [222] Free Bus Travel for Under-18s (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties free under-18 bus travel to reducing family car journeys. Your winner must address both with evidence. A addresses affordability barrier, not car journeys directly. C is a sweeping geography claim. D is about bus emissions, a different outcome. B cites a DfT Scotland pilot showing 18% fewer car-based school runs under a similar scheme — action, outcome, evidence. The answer is B.$rsn$
WHERE id = 'e5e539d1-f545-4aac-b6fb-d7ce78aae71e';

-- [223] Language Exam Passes (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 13 outside, 6 for French-and-Mandarin, 7 for Spanish-and-Mandarin. Scan: B shows 11 outside — out. C shows 15 outside — out. D swaps the two overlap counts (7 and 6) — out. A matches all three stated values. The answer is A.$rsn$
WHERE id = 'ce76c780-cf23-4ff9-bb3d-b13c03877931';

-- [224] Dinner Shift Schedule (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Jon = 10 pm. Hari immediately before Jon = 9 pm. Fen = 7 pm. Remaining slots are 6 pm and 8 pm for Gita and Ira. Gita < Ira (earlier), so Gita = 6 pm and Ira = 8 pm. Gita covers the 6 pm slot. The answer is B.$rsn$
WHERE id = 'c1ce28d3-fd7a-4263-86fc-5064b0bd4377';

-- [225] Garden Plants (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every rose bush is white, pink, or yellow. So a non-pink rose must be white or yellow.$rsn$ WHERE question_id = 'f2a4129b-4beb-4ccb-b167-b119f54b0c75' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only climbing plants grow above 3 m, so non-climbing plants cannot exceed 3 m. Contrapositive.$rsn$ WHERE question_id = 'f2a4129b-4beb-4ccb-b167-b119f54b0c75' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "most" is trimmed weekly, not all. Too strong.$rsn$ WHERE question_id = 'f2a4129b-4beb-4ccb-b167-b119f54b0c75' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all hedge plants are green, but other plants could also be green. Direction-of-implication trap.$rsn$ WHERE question_id = 'f2a4129b-4beb-4ccb-b167-b119f54b0c75' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — yellow rose hybrids exist, but the stem doesn't rule out other yellow plants in the garden. Too strong.$rsn$ WHERE question_id = 'f2a4129b-4beb-4ccb-b167-b119f54b0c75' AND order_index = 5;

-- [226] Workplace Tool Library (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Analytics AND Security, but NOT Communication and NOT Scheduling. Walk the wrong letters. R is analytics only. U is scheduling + analytics — adds scheduling. W is communication + security — adds communication. Letter V sits at analytics + security. The answer is C (Letter V).$rsn$
WHERE id = '8a7dabf5-9bde-4660-abfb-7aa2f40b1046';

-- [227] Project Assignments (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Rami = Delta (fixed). So Soh ≠ Delta, which means Quinn cannot be on Beta (that would force Soh onto Delta). Quinn takes Gamma. Priya ≠ Alpha and ≠ Delta, and Gamma is Quinn's — so Priya = Beta. Soh takes the remaining Alpha. Final: Priya-Beta, Quinn-Gamma, Rami-Delta, Soh-Alpha. The answer is B.$rsn$
WHERE id = 'aab00b4e-5dd2-4949-b629-0de078e0cfdf';

-- [228] City Park Visitor Counts (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Olive Hill: 480, 720, 410, 250. Each is the largest in its column.$rsn$ WHERE question_id = '910e6045-5e1b-4b9f-ac13-5a4565e3a374' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Crestwood average = (310+540+280+150)/4 = 1,280/4 = 320. 320 < 350.$rsn$ WHERE question_id = '910e6045-5e1b-4b9f-ac13-5a4565e3a374' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — each park's summer figure (680, 540, 320, 720) is larger than its other seasons.$rsn$ WHERE question_id = '910e6045-5e1b-4b9f-ac13-5a4565e3a374' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data.$rsn$ WHERE question_id = '910e6045-5e1b-4b9f-ac13-5a4565e3a374' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — autumn average = (360+280+190+410)/4 = 1,240/4 = 310. Marsh End autumn = 190, which is < 310.$rsn$ WHERE question_id = '910e6045-5e1b-4b9f-ac13-5a4565e3a374' AND order_index = 5;

-- [229] City Rainfall Figures (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Cardiff: 145, 98, 82, 140 — each is the largest in its column.$rsn$ WHERE question_id = '1d08bae5-8ea6-4be1-910e-db3823023626' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation. Four months, one year — you can't predict every future month.$rsn$ WHERE question_id = '1d08bae5-8ea6-4be1-910e-db3823023626' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Bristol Oct = 110, Jan = 95. 110 > 95.$rsn$ WHERE question_id = '1d08bae5-8ea6-4be1-910e-db3823023626' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — July values: 68, 72, 82, 55. Norwich (55) is the smallest, not Leeds (72).$rsn$ WHERE question_id = '1d08bae5-8ea6-4be1-910e-db3823023626' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the table shows rainfall but nothing about soil, gardens, or moisture retention. Cardiff gets more rain than Norwich, not less. Also "wetter gardens" is a generalisation beyond the data. Unsupported.$rsn$ WHERE question_id = '1d08bae5-8ea6-4be1-910e-db3823023626' AND order_index = 5;

-- [230] Pharmacy Dispensing (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only registered pharmacists may dispense, so anyone who has dispensed must be one. Direct.$rsn$ WHERE question_id = '9c546a06-d782-4a2d-b1cc-4c9cfe80a0ca' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — pharmacists MAY dispense, but the stem doesn't say all of them have actually dispensed. Too strong.$rsn$ WHERE question_id = '9c546a06-d782-4a2d-b1cc-4c9cfe80a0ca' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some assistants completed CPD, and no assistant has dispensed. So some CPD-completers (the assistants) haven't dispensed.$rsn$ WHERE question_id = '9c546a06-d782-4a2d-b1cc-4c9cfe80a0ca' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — all registered pharmacists have completed CPD, so contrapositive: no CPD this year → not a registered pharmacist.$rsn$ WHERE question_id = '9c546a06-d782-4a2d-b1cc-4c9cfe80a0ca' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some CPD completers are assistants. Direction-of-implication trap.$rsn$ WHERE question_id = '9c546a06-d782-4a2d-b1cc-4c9cfe80a0ca' AND order_index = 5;

-- [231] Truth Teller Trio (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Test Cal as truth-teller: Cal says Anya and he are both truth-tellers, so Anya is truthful too. Then Anya's "Bri is a liar" is true, making Bri a liar. But Bri says "Cal is a truth-teller" which is true — a liar can't say something true. Contradiction. So Cal is a liar. Bri's "Cal is a truth-teller" is false → Bri is a liar. Anya's "Bri is a liar" is true → Anya is truthful. Two liars: Bri and Cal. The answer is C.$rsn$
WHERE id = '84909feb-e99c-4ac5-9d9c-5d2a0ade25dc';

-- [232] Dice Roll Game (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Expected winnings = P(win) × payout = (1/6) × £10 + (5/6) × £0 = £10/6 ≈ £1.67. Expected value of a play = expected winnings − cost = £1.67 − £2.00 ≈ −£0.33. The answer is B. Negative EV means you lose money on average.$rsn$
WHERE id = '3609a7db-f54d-4525-bb51-eafe5091029f';

-- [233] Hospital Nursing Grades (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Nested Venn: surgeons-in-training ⊆ consultants ⊆ doctors. Compute the four regions. Outside = 180 − 90 = 90 (non-doctors). Doctors only (non-consultant) = 90 − 32 = 58. Consultant ring (consultant but not surgeon-in-training) = 32 − 12 = 20. Innermost = 12. Scan: C shows 70 outside — out. B shows 20 innermost (should be 12) — out. D shows 12 consultant ring (should be 20) and 32 innermost (should be 12) — out. A shows 58, 20, 12, 90 — matches. The answer is A.$rsn$
WHERE id = 'ed09dd62-6fb3-4901-a271-9cd7b8d91f9a';

-- [234] Unlabelled Office Desk Items (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 6 in the centre (all three) and 6 outside. Scan: B shows 4 in the centre — out. C shows 10 outside — out. Between A and D, each circle must sum to its stated total (lamp 40, monitor 35, plant 30). A's lamp circle: 19+9+6+6 = 40 ✓; monitor: 16+9+4+6 = 35 ✓; plant: 14+6+4+6 = 30 ✓. D's lamp: 17+9+6+6 = 38 ≠ 40. The answer is A.$rsn$
WHERE id = 'c98ba5f6-98e5-40a1-96b8-8ca91de2dfc2';

-- [235] Bloons and Grems (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all bloons are grems, and some grems are sprocks. "Some" doesn't pin the sprock-grems as bloons. Unsupported.$rsn$ WHERE question_id = '89d434d4-5994-4c42-8985-69cd3b684d03' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some grems are sprocks, and no sprocks are doofs. So those sprock-grems aren't doofs. At least some grems aren't doofs.$rsn$ WHERE question_id = '89d434d4-5994-4c42-8985-69cd3b684d03' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — you can't confirm this. Bloons are grems, but the stem doesn't place bloons in any particular part of grems relative to doofs. Unsupported.$rsn$ WHERE question_id = '89d434d4-5994-4c42-8985-69cd3b684d03' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — most doofs are nims means >50% of doofs are nims, not >50% of nims are doofs. Direction-of-most trap.$rsn$ WHERE question_id = '89d434d4-5994-4c42-8985-69cd3b684d03' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly.$rsn$ WHERE question_id = '89d434d4-5994-4c42-8985-69cd3b684d03' AND order_index = 5;

-- [236] Steering Committee Selection (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$HR has only Joy, so Joy is always on. Rahul is out. Sales + Engineering must total exactly 3. Needed: 3 men, 2 women total (incl. Joy as one of the women). Try Sales = 2 (Tom, Maya) + Engineering = 1: Engineering's 1 must be male (need 3 men total, already have Tom + possibly Finance), so Ben. Check totals: works. Try Sales = 1 (Tom — Maya alone would give too many women), Engineering = 2 including Ben plus one of Lina/Priya, Finance = Dan (male to meet 3-men quota). Every valid configuration includes Ben. Lina/Priya rotate; Sara never appears. The answer is C (Ben).$rsn$
WHERE id = 'dc68bbff-7318-4d24-920f-7ed97b4e0689';

-- [237] Three Friends, One Liar (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Exactly one liar. Test: if Hana lies, Jade is truthful → Jade says Ishan lies → contradicts "exactly one". If Ishan lies, he self-reports as truthful — that's a lie (fits), but then Hana says Jade lies which would be true → Jade lies — two liars, contradiction. If Jade lies: Hana's "Jade is lying" is true ✓, Ishan's self-report is true ✓, Jade's "Ishan is lying" is false ✓ — exactly one liar (Jade). The answer is C (Jade).$rsn$
WHERE id = '2709a091-a6f7-4896-a3a5-8d61def512eb';

-- [238] Hospital Floor Clinics (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Neurology AND Headache only. Walk the wrong letters. D is Neurology only. J is Speech + Neurology — wrong adjacent pair. L is Headache + Ophthalmology — wrong pair. Letter K sits at Neurology + Headache. The answer is B (Letter K).$rsn$
WHERE id = 'e9085941-f35a-498b-b952-46ea5a053272';

-- [239] Bench Seating Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Anil = 4. Beth to Anil's right → Beth in 5 or 6. Carlos next to Anil but not next to Beth: Carlos = 5 would be next to Beth, so Carlos = 3. Faris at end (1 or 6). If Faris = 6, Beth can't fit right of Anil — Faris = 1. Eun between Faris (1) and Carlos (3) → Eun = 2. Diya to Beth's right → Beth = 5, Diya = 6. Order: Faris, Eun, Carlos, Anil, Beth, Diya. The answer is B.$rsn$
WHERE id = '16871bed-a194-4dc4-8869-fad08a39d3a1';

-- [240] Coffee Tasting Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Faro = 1, Ember = 2 (fixed). Rounds 3, 4, 5 for Bolivar, Castro, Dorian. Castro immediately after Dorian → Dorian-Castro at (3,4) or (4,5). If (4,5), Bolivar would need round >5 — impossible. So Dorian = 3, Castro = 4, Bolivar = 5. Order: Faro, Ember, Dorian, Castro, Bolivar. The answer is D.$rsn$
WHERE id = '007d44ab-7662-42d8-b80c-cf39b4693266';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 9 — questions 241–270
-- ============================================================================

-- [241] Faculty Exam Averages (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — compare each faculty's 2024 vs 2023: Humanities 69.2 > 66.8, Sciences 73.1 > 70.5, Engineering 74.5 > 71.0, Arts 63.8 > 61.2. All rose.$rsn$ WHERE question_id = '98baef5c-0765-48b4-bde4-aed684fcc75f' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — in 2024, Engineering (74.5) exceeds Sciences (73.1). Not highest in every year.$rsn$ WHERE question_id = '98baef5c-0765-48b4-bde4-aed684fcc75f' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Humanities went 64.1 → 69.2, a 5.1-point rise. More than 5.$rsn$ WHERE question_id = '98baef5c-0765-48b4-bde4-aed684fcc75f' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data.$rsn$ WHERE question_id = '98baef5c-0765-48b4-bde4-aed684fcc75f' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Engineering 2023→2024: 71.0 → 74.5, rise = 3.5. Humanities: 66.8 → 69.2, rise = 2.4. 3.5 > 2.4.$rsn$ WHERE question_id = '98baef5c-0765-48b4-bde4-aed684fcc75f' AND order_index = 5;

-- [242] Two Traffic Lights (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Independent events with "AND" multiply. P(both green) = 0.60 × 0.50 = 0.30 = 30%. The answer is B. Option C (55%) is the trap for averaging; option D (110%) is the trap for adding (probabilities can't exceed 1).$rsn$
WHERE id = '97159555-5008-410e-ab22-95b45e193142';

-- [243] Drug Screening Test (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Although the test is 96% sensitive, the base rate matters. Imagine the 5,000 workers: 250 are users, 4,750 are non-users. True positives = 96% of 250 = 240. False positives = 12% of 4,750 = 570 (the 100 − 88 false-positive rate). Total positives = 240 + 570 = 810, of which 240 are real: 240/810 ≈ 29.6%, about 30%. The answer is A.$rsn$
WHERE id = '28e2ab2d-96ee-4982-ac82-04af543ceb68';

-- [244] Warehouse Box Colours (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — cardboard boxes are either red (2/3) or blue (1/3), so no cardboard is green. All green must be wooden.$rsn$ WHERE question_id = '74b1329b-cbac-44e9-ab8a-9d8eb0f5f92f' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — wooden boxes are all green, so blue boxes must be cardboard.$rsn$ WHERE question_id = '74b1329b-cbac-44e9-ab8a-9d8eb0f5f92f' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 45 wooden = 45 green. 45 cardboard × 2/3 = 30 red. 45 > 30.$rsn$ WHERE question_id = '74b1329b-cbac-44e9-ab8a-9d8eb0f5f92f' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — cardboard boxes are red or blue, not green.$rsn$ WHERE question_id = '74b1329b-cbac-44e9-ab8a-9d8eb0f5f92f' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no red box has fragile items, so fragile items are in non-red (blue or green) boxes. But not every non-red is blue — some are green. Too strong.$rsn$ WHERE question_id = '74b1329b-cbac-44e9-ab8a-9d8eb0f5f92f' AND order_index = 5;

-- [245] Teacher Certification (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — the certificate is necessary to register, so without it, registration is impossible. Contrapositive.$rsn$ WHERE question_id = '57f30c2f-abbd-4fe1-90f0-2d3b20d9792d' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — registering is sufficient for the uplift, so all registered teachers receive it.$rsn$ WHERE question_id = '57f30c2f-abbd-4fe1-90f0-2d3b20d9792d' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the charitable grant goes to some registered teachers, not tied to years of service. Conflates two concepts.$rsn$ WHERE question_id = '57f30c2f-abbd-4fe1-90f0-2d3b20d9792d' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the certificate is necessary, not sufficient. Other conditions may apply to register. Sufficient-vs-necessary trap.$rsn$ WHERE question_id = '57f30c2f-abbd-4fe1-90f0-2d3b20d9792d' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — long-service bonus needs MORE than ten years; five years doesn't qualify.$rsn$ WHERE question_id = '57f30c2f-abbd-4fe1-90f0-2d3b20d9792d' AND order_index = 5;

-- [246] Commute Pipeline (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Nested Venn: bus ⊆ tube ⊆ local train. Easy wins: 52 outside and 18 in the innermost (all three legs). Scan: B shows 45 outside — out. D shows 12 in the centre — out. Between A and C, tube-and-bus-only should be 18 − 18 = 0 (since all 18 bus-takers also take local train by the nesting rule). A omits that region ✓. C shows 6 in the tube-and-bus-only region, which violates nesting — out. The answer is A.$rsn$
WHERE id = 'ccad2d90-7b88-4709-bc35-13b79f2d0158';

-- [247] Company Pass Holders (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Manager, but NOT Director. Walk the wrong letters. P is employee only. R is employee + manager + director — adds director. S is outside everything. Letter Q sits inside manager but outside director. The answer is B (Letter Q).$rsn$
WHERE id = '1538accd-482e-4b4f-aa35-c8932fd2cc19';

-- [248] Voting Age Lowered to 16 (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties lowering the voting age to lifelong political engagement. Your winner must address both with evidence. A is a fairness argument. C is snapshot-only. D is principle-based. B cites an Austrian longitudinal study tracking voters from 16 to 60, with 22% higher lifelong voting rates — action, outcome, long-term evidence. The answer is B.$rsn$
WHERE id = 'a7c3e075-53e2-4892-9809-b23496fe12e5';

-- [249] Clinic Waiting Chairs (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Gita = chair 4. Hugo immediately left = chair 3. Finn = chair 6. Remaining chairs 1, 2, 5 for Isla, Jo, Kai. Kai = Jo − 3, so Jo and Kai are three apart. Only fit: Kai = 2, Jo = 5 (the pair 1/4 is impossible since 4 is Gita). Isla = 1. Chair 5 is Jo. The answer is C.$rsn$
WHERE id = '1662d412-221a-46a1-b7b0-1f042013a806';

-- [250] Detentions Average (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Total detentions = 10 × 3.6 = 36. Known detentions = (4 × 3) + (3 × 2) + 1 = 12 + 6 + 1 = 19. Aisha + Ben = 36 − 19 = 17. Aisha = Ben + 3, so 2×Ben + 3 = 17 → Ben = 7. The answer is C.$rsn$
WHERE id = '4748a417-34b7-4746-81b3-8f1f59113672';

-- [251] Coach Licences (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — driver requires PCV, and PCV requires completed eye test. Chain: driver → PCV → eye test.$rsn$ WHERE question_id = 'a27dcbce-a4b4-4253-8d07-80db8375b0e5' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — PCV is necessary, not sufficient. Having a licence doesn't mean you drive the coach. Direction-of-implication trap.$rsn$ WHERE question_id = 'a27dcbce-a4b4-4253-8d07-80db8375b0e5' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — some people over 21 haven't completed an eye test, and a driver needs one (via PCV). So those people over 21 cannot drive the coach.$rsn$ WHERE question_id = 'a27dcbce-a4b4-4253-8d07-80db8375b0e5' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — eye test is necessary for PCV, but not everyone with an eye test has a PCV. Direction-of-implication trap.$rsn$ WHERE question_id = 'a27dcbce-a4b4-4253-8d07-80db8375b0e5' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all coach drivers are over 21, so 20-year-old drivers are excluded by the premises. Contradicts the data.$rsn$ WHERE question_id = 'a27dcbce-a4b4-4253-8d07-80db8375b0e5' AND order_index = 5;

-- [252] Rare Disease Test (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Rare disease + 5% false-positive rate means false positives dominate. Imagine 100,000 adults: 50 have the disease, 99,950 do not. True positives = 98% of 50 = 49. False positives = 5% of 99,950 ≈ 4,998. Total positives ≈ 5,047, of which 49 are real: 49/5,047 ≈ 1%. The answer is A. The test's high accuracy doesn't overcome the very low base rate — a common screening trap.$rsn$
WHERE id = '9cf1e56a-6b3c-4cae-be0f-819317da2da8';

-- [253] Delivery Fleet (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 60 vans, 2/3 electric = 40 electric vans. Lorries all diesel, so 40 electric in total.$rsn$ WHERE question_id = '04e42ff1-7f45-4637-a41c-a6ad751bf986' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — 20 vans are non-electric (diesel vans), plus 20 lorries — so some diesel vehicles are vans.$rsn$ WHERE question_id = '04e42ff1-7f45-4637-a41c-a6ad751bf986' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no electric vehicle is at the northern depot, so northern-depot vehicles are diesel. Diesel vehicles are lorries OR the 20 diesel vans. Some northern depot vehicles could be vans. Too strong.$rsn$ WHERE question_id = '04e42ff1-7f45-4637-a41c-a6ad751bf986' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 60 vans − 40 electric vans = 20 non-electric vans.$rsn$ WHERE question_id = '04e42ff1-7f45-4637-a41c-a6ad751bf986' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — every lorry is diesel, so no lorry is electric. Contradicts the stem.$rsn$ WHERE question_id = '04e42ff1-7f45-4637-a41c-a6ad751bf986' AND order_index = 5;

-- [254] Charity Volunteer Team (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Each department needs 2 men and 2 women. Sales: 2M + 2W — exact. IT: 2M + 2W — exact. HR: 2M + 2W — exact. Design: 2M + 2W — exact. Marketing: 2M (exact) + 3W for 2 spots — draw among the three Marketing women: Hana, Izzy, Jade. The answer is C.$rsn$
WHERE id = '55ce4433-0bc6-4842-9522-fc530222f8f3';

-- [255] E-Scooter Helmet Law (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties mandatory helmets for adult e-scooter riders to reducing serious head injuries. Your winner must address both with evidence. A is opinion-based. B is a comparative deflection using an unsupported assumption about cycling. D addresses ride frequency, a separate concern. C cites a hospital-admissions review showing helmetless riders are ~4× as likely to sustain serious head injuries — action, outcome, evidence. The answer is C.$rsn$
WHERE id = '3c0dab80-8f10-4336-b9b6-44b5918bf31a';

-- [256] Night Delivery Rules (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — night delivery requires opt-in. Direct from the stem.$rsn$ WHERE question_id = '4eb321ad-ebe6-44ed-bda1-f8de129aefeb' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only some gold members opted in. And opt-in is necessary but not sufficient for actual night delivery. Too strong.$rsn$ WHERE question_id = '4eb321ad-ebe6-44ed-bda1-f8de129aefeb' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no trial account has opted in, and night delivery requires opt-in. So no trial account receives parcels at night.$rsn$ WHERE question_id = '4eb321ad-ebe6-44ed-bda1-f8de129aefeb' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — platinum members have opted in (all), and some gold members too. So opt-in isn't exclusive to platinum. Too strong.$rsn$ WHERE question_id = '4eb321ad-ebe6-44ed-bda1-f8de129aefeb' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — platinum members have opted in, but that's permission, not every platinum member actually receiving parcels at night. Sufficient-vs-actual trap.$rsn$ WHERE question_id = '4eb321ad-ebe6-44ed-bda1-f8de129aefeb' AND order_index = 5;

-- [257] Pet Adoption Centre (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — dogs are microchipped, but the passage doesn't say cats are. You can't confirm any cat is microchipped. Unsupported.$rsn$ WHERE question_id = '5975af0c-5fd1-459c-9040-84f362005483' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no vaccinated animal is black, so no vaccinated cat can be black either.$rsn$ WHERE question_id = '5975af0c-5fd1-459c-9040-84f362005483' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — half of 40 cats = 20.$rsn$ WHERE question_id = '5975af0c-5fd1-459c-9040-84f362005483' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage doesn't tell you about dog vaccinations. Unsupported.$rsn$ WHERE question_id = '5975af0c-5fd1-459c-9040-84f362005483' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the passage doesn't say dogs can't be black. Black animals could be dogs. Too strong.$rsn$ WHERE question_id = '5975af0c-5fd1-459c-9040-84f362005483' AND order_index = 5;

-- [258] At Least One Six (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one 6" via the complement. P(no 6 on one roll) = 5/6. Independent: P(no 6 in three rolls) = (5/6)³ = 125/216. P(at least one 6) = 1 − 125/216 = 91/216. The answer is A.$rsn$
WHERE id = 'a8da9809-857d-43fe-8a08-8ac17bbbec55';

-- [259] Free Gym Memberships for Under-25s (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties free gym memberships for under-25s to reducing adult obesity rates at age 40+. Your winner must address both with long-term evidence. A is about enjoyment. C narrows to "many prefer outdoors". D addresses cost allocation. B cites an 18,000-person UK longitudinal study with a 26% lower obesity rate at age 40 for those exercising regularly between 18 and 24 — action, outcome, long-term evidence. The answer is B.$rsn$
WHERE id = '738c3cb6-3d20-48af-88ff-99a290edca6a';

-- [260] Nurse Grades (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Nested Venn: shift-leads ⊆ seniors ⊆ respiratory ward roster. Compute: outside = 240 − 200 = 40. Shift-leads (innermost) = 15. Senior-not-shift-lead ring = 48 − 15 = 33. Ward-roster-not-senior ring = 200 − 48 = 152. Scan: B shows 25 outside — out. C shows 10 innermost — out. D shows 48 in the senior-not-shift-lead ring (should be 33) — out. A shows 152, 33, 15, 40 — matches. The answer is A.$rsn$
WHERE id = 'ad042cd2-c5eb-4cdf-ac6a-c4958513e725';

-- [261] Screen-Based Homework Cap (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties capping screen homework to improving sleep quality. Your winner must address both with evidence. B is opinion. C addresses marking convenience. D addresses digital literacy. A cites recent studies linking >60 min evening screen use to sleep onset delayed by 45+ minutes, so the cap directly reduces evening exposure — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '7fbe3799-c19f-4ad5-8248-4df8e566f341';

-- [262] Music Streaming Playlists (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Premium AND Classical AND Jazz, and NOT Rock, Pop, or Electronic. Walk the wrong letters. B is premium + classical only — no jazz. C is premium + jazz only — no classical. H is premium + jazz + rock — adds rock. Letter G sits at premium + classical + jazz. The answer is B (Letter G).$rsn$
WHERE id = '7ad4867f-54cd-4d8b-9328-6752e6a38239';

-- [263] Clinic Appointments by Team (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Booked online AND Mental Health team. Walk the wrong letters. A is booked online only. B is General Practice only — not online. F is booked online + General Practice — wrong team. Letter G sits at booked online + Mental Health. The answer is C (Letter G).$rsn$
WHERE id = 'a5211f82-780f-41cf-ac2d-f4dbe22c5176';

-- [264] Bookshelf Order (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$T = 1 (fixed). R immediately left of P — pairs possible at (2,3), (3,4), (4,5), (5,6). U must be right of P; S must be left of R. Test R=5, P=6: U needs > 6 — impossible. Test R=4, P=5: U=6 ✓; S must be left of 4 and ≠ 1 (T); Q must be left of P (=5). Remaining positions 2, 3 for S and Q — both satisfy their constraints. R is in position 4. Test R=3, P=4: S needs left of 3, only position 2 (T is 1) — but then U=5 or 6 (fine), Q needs left of 4 — no spot left. Fails. Test R=2: S must be left of 2, only position 1 — but T is there. Fails. So R = position 4. The answer is C.$rsn$
WHERE id = '949c62d0-19ec-4649-a0b0-81842a66877a';

-- [265] Retail Confidence Theory (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — critics note an alternative cause (job insecurity). Correlation vs causation trap.$rsn$ WHERE question_id = '0e31eee7-ff3c-4709-a615-b6965a075b49' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: both sides agree on the association.$rsn$ WHERE question_id = '0e31eee7-ff3c-4709-a615-b6965a075b49' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 62% is more than half; most low-saving households reduced holiday spending.$rsn$ WHERE question_id = '0e31eee7-ff3c-4709-a615-b6965a075b49' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — critics offer an alternative explanation, not a call to ignore the data. Misreading.$rsn$ WHERE question_id = '0e31eee7-ff3c-4709-a615-b6965a075b49' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — 24% (higher savings) reduced holiday spending vs 62% (lower savings). 24% < 62%, so lower rate.$rsn$ WHERE question_id = '0e31eee7-ff3c-4709-a615-b6965a075b49' AND order_index = 5;

-- [266] Festival Volunteer Tasks (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Registration AND Merchandise only. Walk the wrong letters. E is Merchandise only. K is Registration + Cleanup — adds Cleanup. A is Registration only. Letter J sits at Registration + Merchandise only. The answer is C (Letter J).$rsn$
WHERE id = 'e050cabc-0c28-4135-a843-701cf0a3c743';

-- [267] Community Festival Workshops (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Outdoor AND Free entry, and NOT Afternoon and NOT Hands-on. Walk the wrong letters. T is Outdoor + Afternoon — adds afternoon. U is Afternoon + Hands-on — both excluded. V is Hands-on + Free entry — adds hands-on. Letter W sits at Outdoor + Free entry. The answer is C (Letter W).$rsn$
WHERE id = '22146428-aff8-44b1-bbba-becc549f3d89';

-- [268] Vitamin Supplement Study (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only those with low baseline saw improvement; high-baseline participants showed little change. Too strong.$rsn$ WHERE question_id = 'b27186c6-6ece-4936-99b3-4f3c9f69cca4' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — authors advise against extrapolating to teenagers. Unsupported.$rsn$ WHERE question_id = 'b27186c6-6ece-4936-99b3-4f3c9f69cca4' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly.$rsn$ WHERE question_id = 'b27186c6-6ece-4936-99b3-4f3c9f69cca4' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — authors advise against extrapolating to adults over 65. Unsupported.$rsn$ WHERE question_id = 'b27186c6-6ece-4936-99b3-4f3c9f69cca4' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — participants were divided into groups based on baseline diet quality, so variation existed.$rsn$ WHERE question_id = 'b27186c6-6ece-4936-99b3-4f3c9f69cca4' AND order_index = 5;

-- [269] Opt-In Receipts (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties opt-in-only receipts to reducing paper waste. Your winner must address both with evidence. B addresses shopper preference. C narrows to older shoppers. D addresses returns convenience. A cites a 53,000-tonne annual waste estimate and pilot results showing >80% receipt paper reduction — action, outcome, evidence. The answer is A.$rsn$
WHERE id = '991c6f91-27a4-4919-800a-f5268275e6a5';

-- [270] Four Parties Considered (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Every region is given — scan for matches. A-B bridge = 9: B shows 7 — out. Outside = 18: D shows 22 — out. A-only = 24: C shows 20 — out. A matches every stated value. The answer is A.$rsn$
WHERE id = '65bf5171-033a-4589-81d3-ac5e2bb5c6e2';

-- Updates are appended below in batches by question type.

-- ============================================================================
-- Batch 10 — questions 271–300 (final)
-- ============================================================================

-- [271] Glucose Meters (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Accuracy = correct readings. Precision = consistency on repeats. Accuracy: X = 90%, Y = 80% — X is more accurate. Precision: X = 32/40 = 80%, Y = 38/40 = 95% — Y is more precise. So X accurate, Y precise. The answer is A.$rsn$
WHERE id = '0c380260-3c33-4adf-9f30-c0d2fbdbbff9';

-- [272] Gym Class Attendance (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Spin total = 120 + 118 + 126 = 364. Yoga = 84+92+110 = 286. Pilates = 60+65+72 = 197. HIIT = 45+58+70 = 173. Spin is highest.$rsn$ WHERE question_id = '4b73265e-156f-4539-9366-887596c7d626' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Feb→Mar: Yoga 92→110 ✓, Spin 118→126 ✓, Pilates 65→72 ✓, HIIT 58→70 ✓. All rose.$rsn$ WHERE question_id = '4b73265e-156f-4539-9366-887596c7d626' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — extrapolation beyond the data.$rsn$ WHERE question_id = '4b73265e-156f-4539-9366-887596c7d626' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Pilates: 60 → 72, rise = 12. 12/60 = 20% exactly, not more than 20%.$rsn$ WHERE question_id = '4b73265e-156f-4539-9366-887596c7d626' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Spin: 120 → 118. Dropped by 2.$rsn$ WHERE question_id = '4b73265e-156f-4539-9366-887596c7d626' AND order_index = 5;

-- [273] Three-Day Rain Forecast (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one" via the complement. P(no rain one day) = 0.6. P(no rain three days) = 0.6³ = 0.216. P(at least one rainy day) = 1 − 0.216 = 0.784 = 78.4%. The answer is B.$rsn$
WHERE id = '5e896827-f16a-48ba-a224-e85983afca67';

-- [274] French and Spanish Conditional (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Conditional probability — denominator is the French group, not the whole school. Among 120 French students, 50 also study Spanish. P(Spanish | French) = 50/120 = 5/12. The answer is A.$rsn$
WHERE id = '95b624a0-3050-4aba-a65b-3bebf6f211ed';

-- [275] Greenhouse Plants (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — tropical plants need daily heating, and all plants in the heated greenhouse receive it. So tropical seedlings there are receiving what they need.$rsn$ WHERE question_id = '6c1e0a78-4e27-4697-a9b8-1fe3e5f318b9' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — cacti don't need daily heating, so providing it shouldn't kill them. Unsupported.$rsn$ WHERE question_id = '6c1e0a78-4e27-4697-a9b8-1fe3e5f318b9' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — tropical plants need daily heating, but the stem doesn't say all heated plants are tropical. Direction-of-implication trap.$rsn$ WHERE question_id = '6c1e0a78-4e27-4697-a9b8-1fe3e5f318b9' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — "some seedlings are tropical" means some in the heated greenhouse. In UCAT "some" = more than zero AND less than all, so some heated-greenhouse seedlings are not tropical.$rsn$ WHERE question_id = '6c1e0a78-4e27-4697-a9b8-1fe3e5f318b9' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — tropical plants need heating, but other plants might also need it. Direction-of-implication trap.$rsn$ WHERE question_id = '6c1e0a78-4e27-4697-a9b8-1fe3e5f318b9' AND order_index = 5;

-- [276] Modern Language Enrolments (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 5 outside, 12 French-and-German, 10 German-and-Spanish, no French-and-Spanish. Scan: C shows 7 outside — out. B shows 10 at French-and-German — out. D shows 14 there — out. A matches every stated value. The answer is A.$rsn$
WHERE id = 'd7b89c9a-5d55-49d2-b72f-6949eef8090c';

-- [277] Passing at Least One Exam (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$"At least one" via the complement. P(fail maths) = 0.3, P(fail English) = 0.2. Independent: P(fail both) = 0.3 × 0.2 = 0.06. P(pass at least one) = 1 − 0.06 = 0.94. The answer is C.$rsn$
WHERE id = 'ec49815f-587f-4d5c-abec-4a0f3e1f33cc';

-- [278] Cargo Permits (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — hazardous containers must be sealed and labelled, but other labelled containers aren't automatically sealed. Some labelled containers are empty, and nothing says they're sealed. Unsupported.$rsn$ WHERE question_id = '76bdeab1-2bae-4808-95bc-0bb9766bc609' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — leaving the port requires being sealed. Any container that has left (empty or not) must have been sealed. Direct.$rsn$ WHERE question_id = '76bdeab1-2bae-4808-95bc-0bb9766bc609' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — stated directly: no empty container carries hazardous goods. Contradicts the premise.$rsn$ WHERE question_id = '76bdeab1-2bae-4808-95bc-0bb9766bc609' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — hazardous containers must be sealed and labelled, but that doesn't mean every hazardous one has actually left the port. Too strong.$rsn$ WHERE question_id = '76bdeab1-2bae-4808-95bc-0bb9766bc609' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no empty container carries hazardous goods, so no hazardous container is empty. Direct contrapositive.$rsn$ WHERE question_id = '76bdeab1-2bae-4808-95bc-0bb9766bc609' AND order_index = 5;

-- [279] Only Pilots (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — landing at the airstrip requires being a qualified pilot, and all qualified pilots have passed the medical review. Chain.$rsn$ WHERE question_id = '0024b1eb-8283-44b6-9fa2-e2fe1c7e70df' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some people who passed the review are instructors, but not all instructors are qualified pilots. Direction-of-implication trap.$rsn$ WHERE question_id = '0024b1eb-8283-44b6-9fa2-e2fe1c7e70df' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — we know some people who passed the medical review are instructors, but those instructors may not be qualified pilots. Unsupported overlap claim.$rsn$ WHERE question_id = '0024b1eb-8283-44b6-9fa2-e2fe1c7e70df' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — instructors might or might not be qualified pilots. The stem doesn't say instructors can't be pilots — only that instructors don't use the short runway. Too strong.$rsn$ WHERE question_id = '0024b1eb-8283-44b6-9fa2-e2fe1c7e70df' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no instructor uses the short runway. Contrapositive: anyone using the short runway is not an instructor.$rsn$ WHERE question_id = '0024b1eb-8283-44b6-9fa2-e2fe1c7e70df' AND order_index = 5;

-- [280] Four-Floor Flat (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Nadia is two floors above Priya. Options: Priya-ground, Nadia-second; OR Priya-first, Nadia-third. Olaf directly above Nadia needs a floor above her. If Nadia = third (top), no floor above — impossible. So Priya = ground, Nadia = second, Olaf = third, Rafa = first. The answer is C (Priya).$rsn$
WHERE id = '2429f384-4ce4-4a24-ac0f-c1ce28430645';

-- [281] Delivery Vehicles (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no red vehicle is a motorbike, and vehicles are only vans or motorbikes. So every red vehicle is a van.$rsn$ WHERE question_id = '8218c0a6-2d3b-4fac-9305-87be74626d83' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no red vehicle is a motorbike, so no motorbikes are red. Contradicts the stem.$rsn$ WHERE question_id = '8218c0a6-2d3b-4fac-9305-87be74626d83' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all motorbikes are electric, but vans could also be electric. Direction-of-implication trap.$rsn$ WHERE question_id = '8218c0a6-2d3b-4fac-9305-87be74626d83' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — half of 50 vans = 25 white vans.$rsn$ WHERE question_id = '8218c0a6-2d3b-4fac-9305-87be74626d83' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — 25 white vans. Red vehicles could be up to 25 (all non-white vans) — you can't confirm more whites than reds without more info. Unsupported.$rsn$ WHERE question_id = '8218c0a6-2d3b-4fac-9305-87be74626d83' AND order_index = 5;

-- [282] Raffle Ticket Sales (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Let Ben = x. Amy = 2x, Dan = 2x, Carla = x + 20, Enid = x + 10. Sum = 240: x + 2x + 2x + (x+20) + (x+10) = 7x + 30 = 240, so 7x = 210, x = 30. The answer is B.$rsn$
WHERE id = 'd756991f-85b1-4c7b-9c5e-24ae4bd3fbf2';

-- [283] UK Weather Station Rainfall (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Jan: 160 > 98. Apr: 95 > 72. Jul: 78 > 68. Oct: 180 > 125. All months Glasgow exceeds Bristol.$rsn$ WHERE question_id = 'f50ff89c-b9ce-4c09-a30b-6732812bc8ca' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Canterbury Jul = 39, Oct = 68. 2 × 39 = 78, and 68 < 78. Not more than double.$rsn$ WHERE question_id = 'f50ff89c-b9ce-4c09-a30b-6732812bc8ca' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Jan: 112 > 98. Apr: 78 > 72. Jul: 82 > 68. Oct: 145 > 125. Leeds higher every month.$rsn$ WHERE question_id = 'f50ff89c-b9ce-4c09-a30b-6732812bc8ca' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — Oct total = 180+145+125+68 = 518. Jan total = 160+112+98+55 = 425. 518 > 425.$rsn$ WHERE question_id = 'f50ff89c-b9ce-4c09-a30b-6732812bc8ca' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — Bristol: Jan 98, Apr 72, Jul 68, Oct 125. Oct is highest, not Jan.$rsn$ WHERE question_id = 'f50ff89c-b9ce-4c09-a30b-6732812bc8ca' AND order_index = 5;

-- [284] Hospital Patient Cohort (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: On statins AND Diabetic, and NOT Over 65, NOT Hypertensive, NOT Smoker. Walk the wrong letters. X is Over 65 + On statins — adds Over 65. U is Diabetic + Hypertensive — adds Hypertensive. T is On statins only — missing Diabetic. Letter Y sits at On statins + Diabetic. The answer is B (Letter Y).$rsn$
WHERE id = 'fad5c815-e1e6-4a62-9292-d73391d53615';

-- [285] Train Conductors and Uniforms (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — conductors wear blue uniforms, and some blue uniforms are fleeces. "Some" doesn't tell us whether conductors' uniforms are the fleece ones. Unsupported.$rsn$ WHERE question_id = '594b29f8-4e0e-4ec6-9f61-b13521ef14a8' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no fleece carries a shoulder badge, so a conductor wearing a fleece can't carry one. Direct.$rsn$ WHERE question_id = '594b29f8-4e0e-4ec6-9f61-b13521ef14a8' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — all shoulder badges bear reference numbers, but reference numbers might appear elsewhere too. Direction-of-implication trap.$rsn$ WHERE question_id = '594b29f8-4e0e-4ec6-9f61-b13521ef14a8' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — "some blue uniforms are fleeces" means less than all, so some aren't.$rsn$ WHERE question_id = '594b29f8-4e0e-4ec6-9f61-b13521ef14a8' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the stem doesn't tell you whether all conductors carry shoulder badges. Unsupported.$rsn$ WHERE question_id = '594b29f8-4e0e-4ec6-9f61-b13521ef14a8' AND order_index = 5;

-- [286] Courier Bonuses (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — north-route couriers delivered >40, and bonus is iff >40 deliveries. So every north-route courier earned the bonus.$rsn$ WHERE question_id = '2ded47da-01a1-4cc3-a8e4-5f30cc176403' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — every north-route courier earned a bonus, and no trainee earned a bonus. So no trainee was on the north route.$rsn$ WHERE question_id = '2ded47da-01a1-4cc3-a8e4-5f30cc176403' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — bonus iff >40 parcels. So bonus → >40 parcels.$rsn$ WHERE question_id = '2ded47da-01a1-4cc3-a8e4-5f30cc176403' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some bonus earners were not on the north route (stated). So >40 deliveries isn't confined to the north route. Contradicts the premise.$rsn$ WHERE question_id = '2ded47da-01a1-4cc3-a8e4-5f30cc176403' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — no trainee is on the north route (from statement 2 logic), so "most" of the north route aren't trainees — none are. Contradicts the deduction.$rsn$ WHERE question_id = '2ded47da-01a1-4cc3-a8e4-5f30cc176403' AND order_index = 5;

-- [287] Charity Lottery Tickets (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Count ticket numbers divisible by exactly one of 4 or 5. Divisible by 4: 600/4 = 150. Divisible by 5: 600/5 = 120. Divisible by both (i.e., 20): 600/20 = 30. Divisible by exactly one = (150 − 30) + (120 − 30) = 120 + 90 = 210. Probability = 210/600 = 7/20. The answer is A.$rsn$
WHERE id = '9b9f6e8f-5cb6-44df-a833-a383907d4633';

-- [288] Weighing Scales Comparison (probabilistic)
UPDATE decision_making_questions
SET answer_reason = $rsn$Scale 1: accuracy 88/100 = 88%, precision 47/50 = 94%. Scale 2: accuracy 94/100 = 94%, precision 42/50 = 84%. Scale 2 more accurate, Scale 1 more precise. The answer is C.$rsn$
WHERE id = '1f2b0f81-53a7-433f-85bb-54b032b870a6';

-- [289] Reserve Rangers (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — foresters are all licensed rangers, and no volunteer is a licensed ranger. Chain: forester → licensed ranger → not volunteer.$rsn$ WHERE question_id = '129fd89c-b8f0-4cd9-bb72-564fd6270672' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — most licensed rangers are first-aid trained, but foresters are a subset of licensed rangers, and "most" doesn't transfer to subsets. Unsupported.$rsn$ WHERE question_id = '129fd89c-b8f0-4cd9-bb72-564fd6270672' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — only first-aid-trained may operate, so without training you can't. Contrapositive.$rsn$ WHERE question_id = '129fd89c-b8f0-4cd9-bb72-564fd6270672' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — "most licensed rangers are first-aid trained" doesn't tell us about volunteers (who aren't rangers). Unsupported existence claim.$rsn$ WHERE question_id = '129fd89c-b8f0-4cd9-bb72-564fd6270672' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only MOST licensed rangers are first-aid trained, and only first-aid trained may operate. So not every licensed ranger can operate the radio. Too strong.$rsn$ WHERE question_id = '129fd89c-b8f0-4cd9-bb72-564fd6270672' AND order_index = 5;

-- [290] Mountain Trail Stages (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Ascent AND Summit only. Walk the wrong letters. B is Approach + Ascent — adds Approach. F is Summit + Descent — adds Descent. E is Summit only. Letter D sits at Ascent + Summit only. The answer is B (Letter D).$rsn$
WHERE id = '31c90982-8d16-411c-ad68-4b34e8cecafb';

-- [291] Volunteer Matching (logic_puzzle)
UPDATE decision_making_questions
SET answer_reason = $rsn$Ravi = Move, Quinn = Hope (fixed). Priya and Sam take Listen and Shelter. Priya ≠ Listen, so Priya = Shelter and Sam = Listen. Final: Priya-Shelter, Quinn-Hope, Ravi-Move, Sam-Listen. The answer is A.$rsn$
WHERE id = 'db8a34f4-0498-48a4-8177-fec37488ded9';

-- [292] Conference Sessions (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: On-site AND Catering AND Workshop, but NOT Presentation. Walk the wrong letters. R is On-site + Catering + Presentation — wrong session type. S is On-site + Catering only — missing Workshop. U is On-site + Workshop only — missing Catering. Letter T sits at On-site + Catering + Workshop. The answer is C (Letter T).$rsn$
WHERE id = 'e8c08d7d-120b-4009-97ff-ae9918c066d3';

-- [293] Menu Calorie Labelling (recognising_assumptions)
UPDATE decision_making_questions
SET answer_reason = $rsn$The proposition ties calorie labelling to helping customers make healthier choices. Your winner must address both with evidence. B is values-based. C critiques the measure, not whether labelling works. D uses vague "many" without addressing readers. A cites a 12-country review with average calorie intake falling by 32 kcal per meal where labelling was mandatory — action, outcome, evidence. The answer is A.$rsn$
WHERE id = 'c8d5d5ae-caec-4fcd-87cd-61e04c2c2a69';

-- [294] Sports Club Facilities (venn_diagram — INTERPRET)
UPDATE decision_making_questions
SET answer_reason = $rsn$Translate the target: Pool AND Gym, but NOT Courts, NOT Track. Walk the wrong letters. B is gym only. F is gym + courts — adds courts. A is pool only. Letter E sits at pool + gym only. The answer is A (Letter E).$rsn$
WHERE id = 'dc34d470-1561-444b-8529-1929c8c1285d';

-- [295] Engineer Certification (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — sign-off requires being chartered, and every chartered engineer has passed the review. Chain.$rsn$ WHERE question_id = '5731eee3-395a-411f-8f75-09f826fdc6e1' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — apprentices haven't passed the review, so they can't be chartered, so they can't sign off. Contrapositive chain.$rsn$ WHERE question_id = '5731eee3-395a-411f-8f75-09f826fdc6e1' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — some graduates passed the review, but "some" ≠ "all", and passing the review doesn't make them chartered. Too strong.$rsn$ WHERE question_id = '5731eee3-395a-411f-8f75-09f826fdc6e1' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — graduates may have passed the review but aren't necessarily chartered. Sign-off requires chartered status. Unsupported.$rsn$ WHERE question_id = '5731eee3-395a-411f-8f75-09f826fdc6e1' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — chartered engineers may sign off, but "may" is permission, not guaranteed action. Also, not every chartered engineer is in a position to sign structural designs. Too strong.$rsn$ WHERE question_id = '5731eee3-395a-411f-8f75-09f826fdc6e1' AND order_index = 5;

-- [296] Distinction Grade (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — passing all four exams is necessary for distinction. Gemma has it, so she passed all four.$rsn$ WHERE question_id = '92037124-af4d-480f-9169-e98c9e798bfd' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — completing the essay is sufficient, but not necessary. Gemma might have qualified by another route. Too strong.$rsn$ WHERE question_id = '92037124-af4d-480f-9169-e98c9e798bfd' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — passing all four exams is necessary, but not sufficient. Students might need to complete the essay or meet other conditions too. Sufficient-vs-necessary trap.$rsn$ WHERE question_id = '92037124-af4d-480f-9169-e98c9e798bfd' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — passing all four exams is necessary. Contrapositive: failing any → no distinction.$rsn$ WHERE question_id = '92037124-af4d-480f-9169-e98c9e798bfd' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — essay completion → distinction → must have passed all four exams. Chain.$rsn$ WHERE question_id = '92037124-af4d-480f-9169-e98c9e798bfd' AND order_index = 5;

-- [297] Compound Passes (syllogism)
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — no vehicle enters without a valid pass. So every vehicle in the compound has one.$rsn$ WHERE question_id = '99175355-a28f-45fc-bdcb-2d628b83c00b' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — most valid PASSES go to contractors, not most PEOPLE in the compound. Unit-shift trap.$rsn$ WHERE question_id = '99175355-a28f-45fc-bdcb-2d628b83c00b' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — inspectors have valid passes, but they're visitors, not contractors. Only contractors are known to wear vests. Unsupported.$rsn$ WHERE question_id = '99175355-a28f-45fc-bdcb-2d628b83c00b' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — all contractors wear high-visibility vests. So every contractor — whether pass-carrying or not — wears one. Direct.$rsn$ WHERE question_id = '99175355-a28f-45fc-bdcb-2d628b83c00b' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — only "some" visitors with valid passes are inspectors, not every one. Too strong.$rsn$ WHERE question_id = '99175355-a28f-45fc-bdcb-2d628b83c00b' AND order_index = 5;

-- [298] Garden Centre Survey (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 6 in the centre (all three) and 20 outside. Scan: B shows 8 in the centre — out. C shows 18 outside — out. Between A and D, compute tools-and-seeds only: 18 − 6 = 12. A shows 12; D shows 14 — out. The answer is A.$rsn$
WHERE id = 'f77766d0-52d6-41de-a0b3-e0e54dcaf77e';

-- [299] Remote Work Wellness Study (interpreting_info)
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — critics identify confounders (age, private offices). Causal claim unsupported.$rsn$ WHERE question_id = '6f5d1efd-a7b8-4da6-a4e2-fa96d8d7f147' AND order_index = 1;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — stated directly: remote workers had lower self-reported stress.$rsn$ WHERE question_id = '6f5d1efd-a7b8-4da6-a4e2-fa96d8d7f147' AND order_index = 2;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the study didn't measure long-term health. Explicit in the passage.$rsn$ WHERE question_id = '6f5d1efd-a7b8-4da6-a4e2-fa96d8d7f147' AND order_index = 3;
UPDATE decision_making_question_statements SET answer_reason = $rsn$Yes — critics note the remote-working group was older on average.$rsn$ WHERE question_id = '6f5d1efd-a7b8-4da6-a4e2-fa96d8d7f147' AND order_index = 4;
UPDATE decision_making_question_statements SET answer_reason = $rsn$No — the study's remote group happened to be older, but that doesn't mean older workers in general are more likely to work from home. Generalisation beyond the data. Unsupported.$rsn$ WHERE question_id = '6f5d1efd-a7b8-4da6-a4e2-fa96d8d7f147' AND order_index = 5;

-- [300] Import Warehouse (venn_diagram — SELECT)
UPDATE decision_making_questions
SET answer_reason = $rsn$Easy wins first: 8 in the centre (all three) and 35 outside. Scan: C shows 12 in the centre — out. D shows 40 outside — out. Between A and B, compute imported-and-perishable only: 18 − 8 = 10. A shows 10; B shows 14 — out. The answer is A.$rsn$
WHERE id = '78c85923-0a07-4c1d-aea5-d3154578b1a0';

-- End of updates.

COMMIT;
