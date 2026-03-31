-- Fix DM Test 1: Venn diagram stem spoilers and internal-terminology answer reasons
-- Stems: remove structural meta-observations that spoil the question
-- Answer reasons: rewrite to be student-facing explanations (no region keys, set IDs, or layout names)

-- Q23: Gardening Club Plots (SELECT) — remove "No member tends both a vegetable plot and a herb plot"; rewrite answer reason as student-facing
UPDATE timed_decision_making_questions
SET stem = E'A gardening club has 50 members. 18 tend a flower plot, 22 tend a vegetable plot, and 15 tend a herb plot. 6 members tend both a flower plot and a vegetable plot. 4 members tend both a flower plot and a herb plot. 5 members do not tend any plot.\n\nWhich of the following diagrams best represents the data?',
    answer_reason = 'The stem states 18 tend flowers, 22 tend vegetables, and 15 tend herbs, with 6 in both flowers and vegetables, 4 in both flowers and herbs, and 5 tending no plot. In Option B, flower-only is 8 (18 minus the 6 flower-vegetable and 4 flower-herb overlaps), vegetable-only is 16 (22 minus the 6 overlap), and herb-only is 11 (15 minus the 4 overlap). With the two overlaps (6 and 4) and 5 outside, the total is 50. Option A swaps the two overlap values. Option C places 8 in the flower-vegetable overlap instead of 6. Option D has both the flower-vegetable overlap and flower-only values wrong.'
WHERE test_id = 1 AND order_index = 23;

-- Q24: Spice Rack Inventory (SELECT) — remove "arranged along a shelf", "Some jars belong to two adjacent groups", "No jar belongs to two non-adjacent groups"
UPDATE timed_decision_making_questions
SET stem = E'A chef classifies 80 jars of spices into four groups: Sweet, Savoury, Hot, and Aromatic. 25 jars are Sweet, 25 are Savoury, 21 are Hot, and 17 are Aromatic. 5 jars are both Sweet and Savoury. 8 jars are both Savoury and Hot. 3 jars are both Hot and Aromatic. 8 jars belong to none of these categories.\n\nWhich of the following diagrams best represents the data?',
    answer_reason = 'The stem states 25 Sweet, 25 Savoury, 21 Hot, 17 Aromatic, with overlaps of 5 (Sweet and Savoury), 8 (Savoury and Hot), and 3 (Hot and Aromatic), plus 8 outside. In Option C, Sweet-only is 20 (25 − 5), Savoury-only is 12 (25 − 5 − 8), Hot-only is 10 (21 − 8 − 3), and Aromatic-only is 14 (17 − 3). The three overlaps and 8 outside sum to 80, matching the total. Option A swaps the Sweet–Savoury and Savoury–Hot overlap values. Option B has Sweet–Savoury as 3 and Hot–Aromatic as 5, both incorrect. Option D has Sweet-only as 18 and Savoury-only as 14, both wrong.'
WHERE test_id = 1 AND order_index = 24;

-- Q25: Youth Club Activities (SELECT, unlabelled) — answer reason uses region keys
UPDATE timed_decision_making_questions
SET answer_reason = 'Snooker has 8 players total, and 4 of those also played table tennis, so 4 played snooker only. Table tennis has 12 players total, minus the 4 who also played snooker gives 8 who played table tennis only. The snooker–table tennis overlap is 4. Darts has 9 players with no overlap with any other activity. 6 people played nothing. Total: 4 + 4 + 8 + 9 + 6 = 31. Since the diagrams have no labels, the student must work out which shape is which. Only Option C has a diagram where one shape contains 4, the overlap is 4, the other shape contains 8, the separate shape has 9, and the outside is 6 — matching all the data. Option A puts 8 and 4 in the wrong shapes. Option B shows the separate activity as 5 instead of 9. Option D swaps the separate activity (9) with the outside count (6).'
WHERE test_id = 1 AND order_index = 25;

-- Q26: Community Centre Activities (INTERPRET) — answer reason uses region keys and set IDs
UPDATE timed_decision_making_questions
SET answer_reason = 'The question asks for an activity that is council-funded, requires booking, and has a waiting list — but is not held weekly, not open to over-60s. The only region inside all three of those shapes (council-funded, requires booking, and has a waiting list) but outside the other two is marked with letter T. Letter S is inside council-funded and requires booking but is outside the waiting list shape — so it does not have a waiting list. Letter U is inside council-funded, open to over-60s, and has a waiting list but is outside requires booking. Letter Q is inside council-funded and held weekly only.'
WHERE test_id = 1 AND order_index = 26;

-- Q27: Pet Shelter Animals (INTERPRET) — fix answer reason only (stem premises are factual data, not structural spoilers)
UPDATE timed_decision_making_questions
SET answer_reason = 'The question asks for an animal that is vaccinated but not microchipped. Since all microchipped animals are vaccinated, the microchipped group sits entirely within the vaccinated group. The region inside the vaccinated shape but outside the microchipped shape is marked with letter P. Letter Q is inside both the vaccinated and microchipped shapes, so it includes microchipped animals. Letter R is inside the awaiting rehoming shape only. Letter S is outside all three shapes entirely.'
WHERE test_id = 1 AND order_index = 27;

-- Q28: Student Exchange Programmes (INTERPRET) — remove "form one overlapping pair", "a separate overlapping pair", "The two pairs do not overlap with each other"
UPDATE timed_decision_making_questions
SET stem = E'The diagram shows university students categorised by exchange programme applications and subject areas: applied to Europe, applied to Asia, studying Science, and studying Languages. Each letter marks a different region.\n\nWhich letter represents a student who applied to both Europe and Asia?',
    answer_reason = 'The question asks for a student who applied to both Europe and Asia. The region inside both the Europe and Asia shapes is marked with letter R. Letter P is inside the Europe shape only, so it represents students who applied to Europe but not Asia. Letter U is inside both the Science and Languages shapes, which is unrelated to the exchange programme applications. Letter V is outside all four shapes entirely.'
WHERE test_id = 1 AND order_index = 28;
