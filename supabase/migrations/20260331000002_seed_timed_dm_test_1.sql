-- Seed: Timed DM Test 1 (test_id = 1)
-- 35 questions, 37 minutes

DO $$
DECLARE
  v_q01 UUID;
  v_q02 UUID;
  v_q03 UUID;
  v_q04 UUID;
  v_q05 UUID;
  v_q06 UUID;
  v_q07 UUID;
  v_q08 UUID;
  v_q09 UUID;
  v_q10 UUID;
  v_q11 UUID;
  v_q12 UUID;
  v_q13 UUID;
  v_q14 UUID;
  v_q15 UUID;
  v_q16 UUID;
  v_q17 UUID;
  v_q18 UUID;
  v_q19 UUID;
  v_q20 UUID;
  v_q21 UUID;
  v_q22 UUID;
  v_q23 UUID;
  v_q24 UUID;
  v_q25 UUID;
  v_q26 UUID;
  v_q27 UUID;
  v_q28 UUID;
  v_q29 UUID;
  v_q30 UUID;
  v_q31 UUID;
  v_q32 UUID;
  v_q33 UUID;
  v_q34 UUID;
  v_q35 UUID;
BEGIN

  DELETE FROM timed_decision_making_questions WHERE test_id = 1;

  INSERT INTO timed_decision_making_tests (id, title, time_minutes)
  VALUES (1, 'DM Practice Test 1', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: syllogism - Rare Coin Collectors
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Rare Coin Collectors', 'syllogism'::dm_question_type, 'All rare coin collectors attend auction houses. Some auction house attendees are jewellery dealers. No jewellery dealers work in museums.', NULL, NULL, NULL, NULL, 1, 'normal')
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some rare coin collectors are jewellery dealers.', 'No', 'All rare coin collectors attend auction houses, and some auction house attendees are jewellery dealers. However, the jewellery-dealing attendees may not include any rare coin collectors. We cannot conclude this — it is possible but not certain.', 1),
    (v_q01, 'No museum workers are jewellery dealers.', 'Yes', '''No jewellery dealers work in museums'' is a universal negative, which converts symmetrically: no museum workers are jewellery dealers.', 2),
    (v_q01, 'All auction house attendees are rare coin collectors.', 'No', 'Reverse inference error. ''All rare coin collectors attend auction houses'' does not mean all auction house attendees are rare coin collectors. Many people attend auctions for other reasons.', 3),
    (v_q01, 'Some auction house attendees are not jewellery dealers.', 'Yes', '''Some auction house attendees are jewellery dealers'' — in UCAT, ''some'' means strictly less than all. Therefore some attendees are NOT jewellery dealers.', 4),
    (v_q01, 'Some rare coin collectors work in museums.', 'No', 'The premises give no information about whether rare coin collectors work in museums. They attend auction houses, but nothing links them to museums or excludes them from museums. The conclusion cannot be definitively deduced.', 5);

  -- Q02: syllogism - Bioluminescent Organisms
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Bioluminescent Organisms', 'syllogism'::dm_question_type, 'Most deep-sea organisms are bioluminescent. All bioluminescent organisms produce luciferin. Some luciferin producers are studied in laboratories.', NULL, NULL, NULL, NULL, 2, 'normal')
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Most deep-sea organisms produce luciferin.', 'Yes', 'Most deep-sea organisms are bioluminescent, and all bioluminescent organisms produce luciferin. By chaining these two premises, most deep-sea organisms produce luciferin.', 1),
    (v_q02, 'Some deep-sea organisms are studied in laboratories.', 'No', 'Most deep-sea organisms are bioluminescent, all bioluminescent produce luciferin, and some luciferin producers are studied. However, the studied luciferin producers might not include any deep-sea organisms — they could be entirely non-deep-sea luciferin producers.', 2),
    (v_q02, 'All luciferin producers are bioluminescent.', 'No', 'Reverse inference error. ''All bioluminescent organisms produce luciferin'' does not mean all luciferin producers are bioluminescent. Other organisms may also produce luciferin.', 3),
    (v_q02, 'Some luciferin producers are deep-sea organisms.', 'Yes', 'Most deep-sea organisms are bioluminescent (>50%), and all bioluminescent organisms produce luciferin. Therefore at least some deep-sea organisms produce luciferin, meaning some luciferin producers are deep-sea organisms.', 4),
    (v_q02, 'All deep-sea organisms produce luciferin.', 'No', E'Quantifier shift. Only ''most'' (>50%) deep-sea organisms are bioluminescent. The remaining deep-sea organisms may not be bioluminescent and therefore may not produce luciferin. ''Most'' does not justify ''all.''', 5);

  -- Q03: syllogism - Archaeological Dig Volunteers
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Archaeological Dig Volunteers', 'syllogism'::dm_question_type, 'Only certified archaeologists are permitted to handle artefacts. Some volunteers at the dig are certified archaeologists. All certified archaeologists have completed a heritage protection course.', NULL, NULL, NULL, NULL, 3, 'hard')
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'Some volunteers have completed a heritage protection course.', 'Yes', 'Some volunteers are certified archaeologists, and all certified archaeologists have completed a heritage protection course. Therefore those volunteers who are certified have completed the course.', 1),
    (v_q03, 'All volunteers are permitted to handle artefacts.', 'No', E'Only some volunteers are certified archaeologists. Furthermore, ''only certified archaeologists are permitted'' means being certified is a necessary condition for permission, not a sufficient one. We cannot conclude all volunteers — or even any — are permitted.', 2),
    (v_q03, 'Some people who have completed a heritage protection course are volunteers.', 'Yes', 'From statement 1, some volunteers have completed the heritage course. By conversion of a particular affirmative, some heritage-course completers are volunteers.', 3),
    (v_q03, 'Only volunteers are permitted to handle artefacts.', 'No', 'The premise states only certified archaeologists are permitted. Certified archaeologists may include non-volunteer professionals. This narrows the permitted group incorrectly.', 4),
    (v_q03, 'Some volunteers are not certified archaeologists.', 'Yes', E'''Some volunteers at the dig are certified archaeologists'' — in UCAT, ''some'' means strictly >0% and <100%. Therefore some volunteers are NOT certified archaeologists.', 5);

  -- Q04: syllogism - Cheese Maturation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Cheese Maturation', 'syllogism'::dm_question_type, 'All artisan cheeses are aged for at least six months. Some aged cheeses develop a hard rind. No cheese with a hard rind is sold wrapped in cloth.', NULL, NULL, NULL, NULL, 4, 'normal')
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q04, 'Some artisan cheeses develop a hard rind.', 'No', 'All artisan cheeses are aged, and some aged cheeses develop a hard rind. However, the aged cheeses that develop hard rinds may not include any artisan cheeses — it is possible but not certain.', 1),
    (v_q04, 'No cloth-wrapped cheese has a hard rind.', 'Yes', '''No cheese with a hard rind is sold wrapped in cloth'' converts symmetrically: no cloth-wrapped cheese has a hard rind.', 2),
    (v_q04, 'All aged cheeses are artisan cheeses.', 'No', 'Reverse inference error. ''All artisan cheeses are aged'' does not mean all aged cheeses are artisan. Many non-artisan cheeses are also aged.', 3),
    (v_q04, 'Some cheeses that develop a hard rind are not sold wrapped in cloth.', 'Yes', 'Some aged cheeses develop a hard rind, and no hard-rind cheese is cloth-wrapped. Therefore ALL cheeses with a hard rind are not cloth-wrapped, which means at least some are not — this follows necessarily.', 4),
    (v_q04, 'All artisan cheeses are sold wrapped in cloth.', 'No', 'The premises give no information about how artisan cheeses are sold. Some artisan cheeses might develop hard rinds (and therefore not be cloth-wrapped), or they might not. We cannot determine their wrapping method.', 5);

  -- Q05: syllogism - Brimptons and Floxels
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Brimptons and Floxels', 'syllogism'::dm_question_type, 'All brimptons are floxels. Some floxels are quizzits. No quizzits are drabbels. Some brimptons are vellins.', NULL, NULL, NULL, NULL, 5, 'hard')
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'Some floxels are vellins.', 'Yes', 'Some brimptons are vellins, and all brimptons are floxels. Those vellin-brimptons are therefore floxels, so some floxels are vellins.', 1),
    (v_q05, 'No brimptons are drabbels.', 'No', E'All brimptons are floxels. Some floxels are quizzits, and no quizzits are drabbels. But brimptons might be floxels that are NOT quizzits — and nothing prevents non-quizzit floxels from being drabbels. We cannot conclude that no brimptons are drabbels.', 2),
    (v_q05, 'Some quizzits are floxels.', 'Yes', '''Some floxels are quizzits'' converts to ''some quizzits are floxels'' by conversion of a particular affirmative.', 3),
    (v_q05, 'All vellins are floxels.', 'No', 'Some brimptons are vellins, and all brimptons are floxels, so those vellin-brimptons are floxels. But there may be vellins that are not brimptons, and those need not be floxels. We cannot conclude all vellins are floxels.', 4),
    (v_q05, 'Some floxels are not quizzits.', 'Yes', E'''Some floxels are quizzits'' — in UCAT, ''some'' means strictly less than all (>0% and <100%). Therefore some floxels are NOT quizzits.', 5);

  -- Q06: logic_puzzle - Botanical Garden Layout
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Botanical Garden Layout', 'logic_puzzle'::dm_question_type, E'Five greenhouses (1–5) in a row must each display a different plant family: Ferns, Orchids, Palms, Succulents, and Cacti.\n\n• Orchids are in greenhouse 3.\n• Ferns are in a lower-numbered greenhouse than Palms.\n• Succulents are not adjacent to Orchids.\n• Cacti are in greenhouse 1 or greenhouse 5.\n\nWhich of the following must be true?', NULL, NULL, 'B', E'Orchids = 3. Succulents not adjacent to 3 → not in 2 or 4. Cacti in 1 or 5. If Cacti = 1: Succulents must be in 5 (only non-adjacent slot left). Ferns < Palms in {2, 4} → Ferns = 2, Palms = 4. If Cacti = 5: Succulents must be in 1. Ferns < Palms in {2, 4} → Ferns = 2, Palms = 4. In both valid arrangements, Ferns = 2. Only B must be true. A is not always true (Cacti could be 5). C is not always true (Succulents could be 1). D is not always true (in arrangement 1, Palms = 4 and Cacti = 1 are not adjacent).', 6, 'normal')
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Cacti are in greenhouse 1.', NULL, 1),
    (v_q06, 'B', 'Ferns are in greenhouse 2.', NULL, 2),
    (v_q06, 'C', 'Succulents are in greenhouse 5.', NULL, 3),
    (v_q06, 'D', 'Palms are adjacent to Cacti.', NULL, 4);

  -- Q07: logic_puzzle - Railway Carriage Allocation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Railway Carriage Allocation', 'logic_puzzle'::dm_question_type, E'A train has 6 carriages numbered 1–6 from front to back. Four passengers — Anna, Ben, Chloe, and Dan — must each be assigned to a different carriage.\n\n• Anna''s carriage number is exactly 2 more than Ben''s.\n• Chloe is in a higher-numbered carriage than Dan.\n• Dan is not in carriage 1.\n• Ben is in an odd-numbered carriage.\n\nWhich of the following must be true?', NULL, NULL, 'A', E'Ben is odd: 1, 3, or 5. Anna = Ben + 2. If Ben = 1, Anna = 3. If Ben = 3, Anna = 5. If Ben = 5, Anna = 7 — impossible (max 6). So Ben must be 1 or 3. A must be true. B: Anna could be 3 (if Ben = 1) or 5 (if Ben = 3) — not always 5. C: If Ben = 3, Anna = 5; Dan could be 2, Chloe could be 4 — Chloe (4) < Anna (5), so C fails. D: If Ben = 1, Anna = 3, Dan could be 5 (odd), so D fails.', 7, 'normal')
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'Ben is in carriage 1 or carriage 3.', NULL, 1),
    (v_q07, 'B', 'Anna is in carriage 5.', NULL, 2),
    (v_q07, 'C', 'Chloe is in a higher-numbered carriage than Anna.', NULL, 3),
    (v_q07, 'D', 'Dan is in an even-numbered carriage.', NULL, 4);

  -- Q08: logic_puzzle - Lighthouse Keeper Shifts
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Lighthouse Keeper Shifts', 'logic_puzzle'::dm_question_type, E'Four lighthouse keepers — Grace, Henry, Isla, and James — each work exactly one shift: Dawn, Morning, Afternoon, or Night (in that time order).\n\n• Grace works an earlier shift than Henry.\n• Isla does not work the Dawn or Night shift.\n• James works the shift immediately after Isla.\n• Henry does not work the Afternoon shift.\n\nWhich of the following must be true?', NULL, NULL, 'C', E'Isla is Morning or Afternoon (not Dawn/Night). James is immediately after Isla. Case A: Isla = Morning → James = Afternoon. Remaining: Dawn and Night for Grace and Henry. Grace < Henry → Grace = Dawn, Henry = Night. Case B: Isla = Afternoon → James = Night. Remaining: Dawn and Morning for Grace and Henry. Henry ≠ Afternoon (satisfied). Grace < Henry → Grace = Dawn, Henry = Morning. In both valid arrangements, Grace = Dawn. C must be true. A is only true in Case A. B: In Case A, James = Afternoon, Henry = Night (James before Henry ✓), but in Case B, James = Night, Henry = Morning (James after Henry ✗). D is only true in Case A.', 8, 'hard')
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', 'Henry works the Night shift.', NULL, 1),
    (v_q08, 'B', 'James works immediately before Henry.', NULL, 2),
    (v_q08, 'C', 'Grace works the Dawn shift.', NULL, 3),
    (v_q08, 'D', 'Isla works the Morning shift.', NULL, 4);

  -- Q09: logic_puzzle - Swimming Club Detentions
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Swimming Club Detentions', 'logic_puzzle'::dm_question_type, E'In a class of ten pupils, the average number of detentions per pupil in the spring term is 4.4. Four pupils get four detentions each, two pupils get two detentions each, and one pupil is given just one detention. Out of the remaining three pupils, Marie gets two more detentions than Charlie but one fewer than Robert.\n\nHow many detentions does Robert receive?', NULL, NULL, 'D', E'Total detentions = 10 × 4.4 = 44. Known: (4 × 4) + (2 × 2) + 1 = 16 + 4 + 1 = 21. Remaining for Charlie (C), Marie (M), Robert (R): 44 − 21 = 23. Marie = C + 2. Robert = M + 1 = C + 3. So C + (C + 2) + (C + 3) = 23 → 3C + 5 = 23 → C = 6. Marie = 8. Robert = 9. Distractors: A (6) = Charlie''s value. B (7) = miscalculating the relationships. C (8) = Marie''s value.', 9, 'normal')
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', '6', NULL, 1),
    (v_q09, 'B', '7', NULL, 2),
    (v_q09, 'C', '8', NULL, 3),
    (v_q09, 'D', '9', NULL, 4);

  -- Q10: logic_puzzle - Festival Committee Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Festival Committee Selection', 'logic_puzzle'::dm_question_type, E'A town festival committee needs 12 members: 3 from each of four neighbourhoods, with an equal number of men and women overall. 13 people volunteer:\n\nNorth: Men — Amir, Ben; Women — Clara\nSouth: Men — Ethan, Finn, George; Women — Hannah\nEast: Men — Ivan; Women — Jess, Karen\nWest: Men — Max; Women — Nina, Olivia\n\nOnly one neighbourhood has more volunteers than places. A tiebreaker interview must be held there. Which volunteers will attend the tiebreaker?', NULL, NULL, 'B', E'Each neighbourhood needs 3 members with 6 men and 6 women overall. North has 3 volunteers (2M + 1W), East has 3 (1M + 2W), West has 3 (1M + 2W) — all exactly fit, so all are selected. South has 4 volunteers (3M + 1W) for 3 spots — the only neighbourhood with excess. Gender check: N(2M + 1W) + E(1M + 2W) + W(1M + 2W) = 4M + 5W. Need 6M + 6W total, so South must contribute 2M + 1W. Hannah (the only woman) is automatically selected, and 2 of the 3 men fill the remaining spots. Therefore all three South men — Ethan, Finn and George — attend the tiebreaker. A (Amir and Ben): North has exactly 3 volunteers, no tiebreaker. C (Jess and Karen): East has exactly 3, no tiebreaker. D (Nina and Olivia): West has exactly 3, no tiebreaker.', 10, 'hard')
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'Amir and Ben', NULL, 1),
    (v_q10, 'B', 'Ethan, Finn and George', NULL, 2),
    (v_q10, 'C', 'Jess and Karen', NULL, 3),
    (v_q10, 'D', 'Nina and Olivia', NULL, 4);

  -- Q11: logic_puzzle - Library Reading Room Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Library Reading Room Assignment', 'logic_puzzle'::dm_question_type, E'Four students — K, L, M, and N — are each assigned to one of three reading rooms: Arts, Sciences, or Humanities. Each room must have at least one student.\n\n• K and L are in the same room.\n• M is in the Sciences room.\n• N is not in the same room as K.\n\nWhich of the following must be true?', NULL, NULL, 'B', E'M = Sciences. K and L together. N ≠ K''s room. Three rooms need at least one student each. M covers Sciences. K & L together in one of {Arts, Humanities}. If N were also in Sciences (with M), the third room would be empty — violating the constraint. So N must fill the remaining room alone. Arrangement 1: K,L in Arts; N in Humanities. Arrangement 2: K,L in Humanities; N in Arts. In both, N is the sole occupant of their room. A: only arrangement 1. C: only arrangement 1. D: only arrangement 2.', 11, 'normal')
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'K is in the Arts room.', NULL, 1),
    (v_q11, 'B', 'N is the only student in their reading room.', NULL, 2),
    (v_q11, 'C', 'There are exactly two students in the Arts room.', NULL, 3),
    (v_q11, 'D', 'L is in the Humanities room.', NULL, 4);

  -- Q12: interpreting_info - Vaccination Rates
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Vaccination Rates', 'interpreting_info'::dm_question_type, 'A public health authority recorded the percentage of residents who received each vaccine type in the past year, broken down by age group.', '{"headers":["Age Group","Flu","COVID Booster","Shingles","Pneumococcal"],"rows":[["50–59","32","45","8","12"],["60–69","48","62","35","28"],["70–79","71","78","52","45"],["80+","82","85","61","58"]]}'::jsonb, NULL, NULL, NULL, 12, 'normal')
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'Flu vaccination coverage increases with each successive age group.', 'Yes', 'Flu coverage: 32 → 48 → 71 → 82. Each value is higher than the previous.', 1),
    (v_q12, 'More than half of residents aged 60–69 received a COVID Booster.', 'Yes', 'COVID Booster coverage for 60–69 is 62%, which exceeds 50%.', 2),
    (v_q12, 'The Shingles vaccine has the lowest coverage across all age groups.', 'No', 'In the 50–59 group, Shingles (8%) is the lowest. But in the 60–69 group, Pneumococcal (28%) is lower than Shingles (35%). So Shingles is not the lowest in every age group.', 3),
    (v_q12, 'Coverage for every vaccine type is higher in the 80+ group than in the 70–79 group.', 'Yes', 'Flu: 82 > 71 ✓. COVID Booster: 85 > 78 ✓. Shingles: 61 > 52 ✓. Pneumococcal: 58 > 45 ✓. All four are higher.', 4),
    (v_q12, 'Increasing vaccination rates will reduce hospital admissions in older adults.', 'No', 'The data shows vaccination coverage percentages only. It provides no information about hospital admissions. Any conclusion about the effect on admissions requires an assumption not supported by the data.', 5);

  -- Q13: interpreting_info - Bicycle Hire Usage
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Bicycle Hire Usage', 'interpreting_info'::dm_question_type, 'A city council recorded the average number of daily bicycle hires from each docking station across four seasons.', '{"headers":["Station","Spring","Summer","Autumn","Winter"],"rows":[["Central Park","142","218","108","64"],["Riverside","96","185","72","38"],["University","178","124","186","152"],["Market Square","85","210","95","45"]]}'::jsonb, NULL, NULL, NULL, 13, 'normal')
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q13, 'The University station has the highest average daily hires in Autumn.', 'Yes', 'Autumn values: Central Park = 108, Riverside = 72, University = 186, Market Square = 95. University (186) is the highest.', 1),
    (v_q13, 'Every station has its highest average daily hires in Summer.', 'No', 'University''s highest is Autumn (186), not Summer (124). So not every station peaks in Summer.', 2),
    (v_q13, 'The total average daily hires across all stations is highest in Summer.', 'Yes', 'Spring: 142 + 96 + 178 + 85 = 501. Summer: 218 + 185 + 124 + 210 = 737. Autumn: 108 + 72 + 186 + 95 = 461. Winter: 64 + 38 + 152 + 45 = 299. Summer (737) is the highest.', 3),
    (v_q13, 'Market Square has fewer hires than Riverside in every season.', 'No', 'In Autumn: Market Square (95) > Riverside (72). In Winter: Market Square (45) > Riverside (38). So Market Square exceeds Riverside in two seasons.', 4),
    (v_q13, 'Bicycle hire usage declines in Winter because of cold weather.', 'No', 'The data shows hire numbers but not the reasons behind them. Attributing the decline to cold weather is a causal inference not supported by the data provided.', 5);

  -- Q14: interpreting_info - Bread Sales by Season
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Bread Sales by Season', 'interpreting_info'::dm_question_type, 'A bakery chain recorded its average weekly sales (in thousands of loaves) by bread type for each quarter of the year.', '{"headers":["Bread Type","Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"],"rows":[["White","4.2","3.8","3.5","4.8"],["Wholemeal","2.6","2.9","3.1","2.4"],["Sourdough","1.8","2.2","2.5","2.1"],["Rye","0.9","0.7","0.6","1.2"]]}'::jsonb, NULL, NULL, NULL, 14, 'hard')
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'White bread accounts for more than 40% of total sales in every quarter.', 'No', 'Q1 total: 4.2 + 2.6 + 1.8 + 0.9 = 9.5. White = 4.2/9.5 = 44.2% ✓. Q2 total: 3.8 + 2.9 + 2.2 + 0.7 = 9.6. White = 3.8/9.6 = 39.6% — less than 40%. Not true in every quarter.', 1),
    (v_q14, 'Sourdough sales increased each quarter throughout the year.', 'No', 'Sourdough: Q1 = 1.8, Q2 = 2.2, Q3 = 2.5, Q4 = 2.1. Sales fell from Q3 (2.5) to Q4 (2.1).', 2),
    (v_q14, 'Total sales across all bread types are highest in Q4.', 'Yes', 'Q1 = 9.5, Q2 = 9.6, Q3 = 3.5 + 3.1 + 2.5 + 0.6 = 9.7, Q4 = 4.8 + 2.4 + 2.1 + 1.2 = 10.5. Q4 (10.5) is the highest.', 3),
    (v_q14, 'Wholemeal outsold Sourdough in every quarter.', 'Yes', 'Q1: 2.6 > 1.8 ✓. Q2: 2.9 > 2.2 ✓. Q3: 3.1 > 2.5 ✓. Q4: 2.4 > 2.1 ✓. Wholemeal exceeds Sourdough in all four quarters.', 4),
    (v_q14, 'Rye bread sales will continue to rise after Q4.', 'No', 'The data covers one year of historical sales. Predicting future sales beyond Q4 requires extrapolation, which is not supported by the data.', 5);

  -- Q15: interpreting_info - Opioid Prescribing Practices
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Opioid Prescribing Practices', 'interpreting_info'::dm_question_type, E'From 1996 to 2001, American drug giant Purdue Pharma held more than 40 national ''pain management symposia'' hosting thousands of American doctors and pharmacists with the aim to drill into them promotional material about OxyContin. This semi-synthetic opioid loosely related to morphine and originally based on elements of the opium poppy was aggressively marketed as a non-addictive chronic pain remedy. Overprescribed due to numerous incentives, OxyContin became a ''go to'' drug for any kind of pain but many addicts abused it by grinding the pills up to snort for a potent high, fuelling an opioid epidemic.', NULL, NULL, NULL, NULL, 15, 'hard')
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'Purdue Pharma misrepresented the harmlessness of their product to medical professionals.', 'Yes', E'The passage states OxyContin was ''aggressively marketed as a non-addictive chronic pain remedy'' despite the fact that ''many addicts abused it,'' indicating the non-addictive claim was a misrepresentation to doctors and pharmacists.', 1),
    (v_q15, 'American doctors and pharmacists were bullied into prescribing OxyContin.', 'No', E'The passage says Purdue held symposia to ''drill into them promotional material'' and that the drug was ''overprescribed due to numerous incentives.'' Being given promotional material and incentives is not the same as being bullied. This conclusion uses a stronger term than the passage supports.', 2),
    (v_q15, 'OxyContin started out as a part-organic drug for persistent pain.', 'Yes', E'The passage states OxyContin was ''originally based on elements of the opium poppy'' (organic origin, making it part-organic) and was marketed as a ''chronic pain remedy'' (persistent pain). Both elements are directly supported.', 3),
    (v_q15, 'Claims of OxyContin''s non-addictiveness was the main reason for it being prescribed more often than necessary.', 'No', E'The passage says it was ''overprescribed due to numerous incentives,'' not solely due to claims of non-addictiveness. The passage does not identify a single main reason — it cites multiple factors.', 4),
    (v_q15, 'Patients are partially to blame for the escalation of the opioid problem.', 'No', 'The passage describes addicts abusing the drug but does not assign blame to patients. It focuses on Purdue Pharma''s marketing and the overprescribing by doctors. Concluding patient blame requires an assumption beyond the passage.', 5);

  -- Q16: interpreting_info - Flower Show Entries
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Flower Show Entries', 'interpreting_info'::dm_question_type, 'A village flower show has 80 entries. 40 entries are roses and the rest are tulips. A quarter of the roses are red and the remainder are yellow. All of the red flowers are roses. Half of the tulips are purple and the rest are yellow.', NULL, NULL, NULL, NULL, 16, 'normal')
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'There are more yellow roses than red roses.', 'Yes', 'Red roses = 40 / 4 = 10. Yellow roses = 40 − 10 = 30. 30 > 10, so there are more yellow roses than red roses.', 1),
    (v_q16, 'Some of the tulips are red.', 'No', '''All of the red flowers are roses'' is stated directly. Therefore no tulips can be red.', 2),
    (v_q16, 'There are more yellow flowers than any other colour.', 'Yes', 'Tulips = 80 − 40 = 40. Yellow tulips = 40 / 2 = 20. Yellow roses = 30. Total yellow = 30 + 20 = 50. Red = 10. Purple = 20. Yellow (50) exceeds both red and purple.', 3),
    (v_q16, 'All yellow flowers are roses.', 'No', 'The stem states half the tulips are yellow. Therefore some yellow flowers are tulips, not roses.', 4),
    (v_q16, 'There are more purple flowers than red flowers.', 'Yes', 'Purple tulips = 40 / 2 = 20. Red roses = 10. 20 > 10.', 5);

  -- Q17: interpreting_info - Microplastic Sampling Results
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Microplastic Sampling Results', 'interpreting_info'::dm_question_type, 'Marine researchers collected seawater samples at four sites and four depths, measuring the number of microplastic particles per litre.', '{"headers":["Depth (m)","Site Alpha","Site Beta","Site Gamma","Site Delta"],"rows":[["Surface (0)","48","72","31","55"],["10","35","58","24","42"],["50","18","29","12","20"],["100","8","15","5","9"]]}'::jsonb, NULL, NULL, NULL, 17, 'normal')
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'Site Beta has the highest concentration at every depth.', 'Yes', 'Surface: 72 > 55 > 48 > 31. 10m: 58 > 42 > 35 > 24. 50m: 29 > 20 > 18 > 12. 100m: 15 > 9 > 8 > 5. Beta is highest at all four depths.', 1),
    (v_q17, 'The concentration at 50m is more than half the surface concentration at every site.', 'No', 'Site Alpha: 50m = 18, surface/2 = 48/2 = 24. 18 < 24 — not more than half. The statement fails at the first site checked.', 2),
    (v_q17, 'The total concentration across all depths is highest at Site Beta.', 'Yes', 'Alpha: 48 + 35 + 18 + 8 = 109. Beta: 72 + 58 + 29 + 15 = 174. Gamma: 31 + 24 + 12 + 5 = 72. Delta: 55 + 42 + 20 + 9 = 126. Beta (174) is the highest.', 3),
    (v_q17, 'Microplastic concentration decreases with depth at every site.', 'Yes', 'Alpha: 48 → 35 → 18 → 8 ✓. Beta: 72 → 58 → 29 → 15 ✓. Gamma: 31 → 24 → 12 → 5 ✓. Delta: 55 → 42 → 20 → 9 ✓. All sites show a strictly decreasing pattern.', 4),
    (v_q17, 'The decrease in concentration with depth is caused by microplastics settling on the seafloor.', 'No', 'The data shows concentration values at different depths but provides no information about mechanisms. Attributing the pattern to settling is a causal inference not supported by the data.', 5);

  -- Q18: strongest_argument - Mandatory Organ Donation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Mandatory Organ Donation', 'strongest_argument'::dm_question_type, 'Should the UK adopt an opt-out organ donation system to reduce transplant waiting lists?', NULL, NULL, 'A', E'A is the strongest because it addresses both parts of the proposition — the action (opt-out system) and the outcome (reducing waiting lists) — with specific comparative evidence (30% higher transplant rates in Spain). B addresses the action but only mentions public opinion, not waiting lists. C addresses an emotional concern of some families, not waiting lists. D makes an unsupported assumption about reduced trust and does not address waiting lists.', 18, 'normal')
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Yes; countries such as Spain that use opt-out systems have transplant rates 30% higher than opt-in countries, directly reducing average waiting times for patients on the transplant list.', NULL, 1),
    (v_q18, 'B', 'Yes; most people support organ donation in principle, so an opt-out system would simply align the default with public sentiment.', NULL, 2),
    (v_q18, 'C', 'No; some families find it distressing to discuss organ donation after the death of a relative.', NULL, 3),
    (v_q18, 'D', 'No; an opt-out system could reduce trust in the medical profession, as patients may fear that their organs will be prioritised over their treatment.', NULL, 4);

  -- Q19: strongest_argument - Abolishing Standardised Testing
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Abolishing Standardised Testing', 'strongest_argument'::dm_question_type, 'Should standardised testing be abolished in secondary schools to improve educational outcomes?', NULL, NULL, 'B', E'B is the strongest because it addresses both parts — the action (abolishing testing) and the outcome (improving educational outcomes) — with a specific quantified claim (25% of lesson time on test prep limits progress). A addresses why tests are useful but does not connect to educational outcomes. C is emotional (''stressful''), addresses wellbeing rather than educational outcomes, and uses ''many'' (not the full group). D addresses implementation with ''some schools'' — narrow scope, tangential concern.', 19, 'normal')
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q19, 'A', 'No; standardised tests provide an objective measure of student ability that is used by universities for admissions.', NULL, 1),
    (v_q19, 'B', 'Yes; teachers report spending 25% of lesson time on test preparation rather than deeper learning, which limits genuine educational progress across all subjects.', NULL, 2),
    (v_q19, 'C', 'Yes; many students find exams stressful and anxiety-inducing, which affects their wellbeing.', NULL, 3),
    (v_q19, 'D', 'No; some schools may lack the resources to implement alternative assessment methods effectively.', NULL, 4);

  -- Q20: strongest_argument - Free Public Transport
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Free Public Transport', 'strongest_argument'::dm_question_type, 'Should all public transport be made free to reduce urban air pollution?', NULL, NULL, 'C', E'C is the strongest because it connects both parts — the action (free transport) and the outcome (reduced air pollution) — with specific evidence (18% car usage drop, measurable NO₂ reductions). A addresses equity benefits, not air pollution. B uses ''some'' (narrow scope) and does not address overall pollution levels. D addresses funding, a tangential concern unrelated to air pollution.', 20, 'normal')
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; free transport would particularly benefit low-income residents who currently cannot afford bus fares.', NULL, 1),
    (v_q20, 'B', 'No; some commuters would still prefer to drive for the convenience of a private vehicle.', NULL, 2),
    (v_q20, 'C', $s$Yes; private car usage falls by an average of 18% in cities that introduced free public transport, leading to measurable reductions in nitrogen dioxide levels.$s$, NULL, 3),
    (v_q20, 'D', 'No; the cost of funding free transport would require significant increases in local taxation.', NULL, 4);

  -- Q21: strongest_argument - Banning Energy Drinks for Under-16s
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Banning Energy Drinks for Under-16s', 'strongest_argument'::dm_question_type, 'Should the sale of energy drinks be banned for under-16s to improve children''s health?', NULL, NULL, 'A', E'A is the strongest because it addresses both parts — the action (banning energy drinks for under-16s) and the outcome (improving children''s health) — with evidence (40% higher obesity/dental rate). B addresses parental control, not children''s health directly. C focuses on ''older teenagers'' (a subgroup) and autonomy rather than health outcomes. D addresses enforcement practicality, not health outcomes.', 21, 'normal')
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'Yes; studies show that regular energy drink consumption in under-16s is associated with a 40% higher rate of obesity and dental problems compared to non-consumers.', NULL, 1),
    (v_q21, 'B', 'Yes; parents should have more control over what their children consume, and a ban supports parental authority.', NULL, 2),
    (v_q21, 'C', 'No; older teenagers are capable of making responsible dietary choices for themselves.', NULL, 3),
    (v_q21, 'D', 'No; banning energy drinks would be difficult to enforce in practice at the point of sale.', NULL, 4);

  -- Q22: strongest_argument - Compulsory Voting
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Compulsory Voting', 'strongest_argument'::dm_question_type, 'Should voting be made compulsory in the UK to strengthen democratic representation?', NULL, NULL, 'D', E'D is the strongest because it addresses both parts — the action (compulsory voting) and the outcome (stronger democratic representation) — with specific evidence from Australia (90% turnout, demographically representative parliament). A uses ''some'' (narrow scope) and makes an assumption about voices being heard. B makes an unsupported assumption that forced voters are uninformed and does not address representation directly. C uses vague comparisons (''some other democracies'') and does not directly address whether representation would be strengthened.', 22, 'hard')
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Yes; some citizens feel that their vote makes no difference, and compulsory voting would ensure their voices are heard.', NULL, 1),
    (v_q22, 'B', 'No; compulsory voting may result in uninformed votes, as citizens who are uninterested in politics would be forced to participate without engaging with the issues.', NULL, 2),
    (v_q22, 'C', 'No; the UK already has a higher voter turnout than some other democracies, suggesting that representation is adequate.', NULL, 3),
    (v_q22, 'D', $s$Yes; data from Australia, where voting is compulsory, shows that voter turnout exceeds 90% and the resulting parliament more closely reflects the demographic composition of the population.$s$, NULL, 4);

  -- Q23: venn_diagram SELECT - Gardening Club Plots
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Gardening Club Plots', 'venn_diagram'::dm_question_type, E'A gardening club has 50 members. 18 tend a flower plot, 22 tend a vegetable plot, and 15 tend a herb plot. 6 members tend both a flower plot and a vegetable plot. 4 members tend both a flower plot and a herb plot. No member tends both a vegetable plot and a herb plot. 5 members do not tend any plot.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'B', 'Flower only = 18 − 6 − 4 = 8. Vegetable only = 22 − 6 = 16. Herb only = 15 − 4 = 11. Flower ∩ Vegetable = 6. Flower ∩ Herb = 4. Outside = 5. Sum: 8 + 16 + 11 + 6 + 4 + 5 = 50 ✓. Only B has all correct values. A swaps the two overlap values (4 and 6). C has Flower ∩ Vegetable = 8 (should be 6). D has Flower ∩ Vegetable = 8 and Flower only = 6 (both wrong).', 23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flower","shape":"hexagon"},{"id":"set2","label":"Vegetable","shape":"rectangle"},{"id":"set3","label":"Herb","shape":"star"}],"regions":{"set1_only":10,"set2_only":14,"set3_only":11,"set1_set2":4,"set1_set3":6,"outside":5}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flower","shape":"hexagon"},{"id":"set2","label":"Vegetable","shape":"rectangle"},{"id":"set3","label":"Herb","shape":"star"}],"regions":{"set1_only":8,"set2_only":16,"set3_only":11,"set1_set2":6,"set1_set3":4,"outside":5}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flower","shape":"hexagon"},{"id":"set2","label":"Vegetable","shape":"rectangle"},{"id":"set3","label":"Herb","shape":"star"}],"regions":{"set1_only":6,"set2_only":16,"set3_only":13,"set1_set2":8,"set1_set3":2,"outside":5}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flower","shape":"hexagon"},{"id":"set2","label":"Vegetable","shape":"rectangle"},{"id":"set3","label":"Herb","shape":"star"}],"regions":{"set1_only":6,"set2_only":16,"set3_only":11,"set1_set2":8,"set1_set3":4,"outside":5}}'::jsonb, 4);

  -- Q24: venn_diagram SELECT - Spice Rack Inventory
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Spice Rack Inventory', 'venn_diagram'::dm_question_type, E'A chef classifies 80 jars of spices into four groups arranged along a shelf: Sweet, Savoury, Hot, and Aromatic. Some jars belong to two adjacent groups. 25 jars are Sweet, 25 are Savoury, 21 are Hot, and 17 are Aromatic. 5 jars are both Sweet and Savoury. 8 jars are both Savoury and Hot. 3 jars are both Hot and Aromatic. No jar belongs to two non-adjacent groups. 8 jars belong to none of these categories.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'C', 'Sweet only = 25 − 5 = 20. Savoury only = 25 − 5 − 8 = 12. Hot only = 21 − 8 − 3 = 10. Aromatic only = 17 − 3 = 14. Overlaps: Sweet ∩ Savoury = 5, Savoury ∩ Hot = 8, Hot ∩ Aromatic = 3. Outside = 8. Sum: 20 + 5 + 12 + 8 + 10 + 3 + 14 + 8 = 80 ✓. Only C has all correct values. A swaps the Sweet–Savoury and Savoury–Hot overlaps. B has Sweet–Savoury = 3 and Hot–Aromatic = 5 (both wrong). D has Sweet only = 18 and Savoury only = 14 (both wrong).', 24, 'hard')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"four_linear","sets":[{"id":"set1","label":"Sweet","shape":"oval"},{"id":"set2","label":"Savoury","shape":"pentagon"},{"id":"set3","label":"Hot","shape":"diamond"},{"id":"set4","label":"Aromatic","shape":"trapezoid"}],"regions":{"set1_only":20,"set1_set2":8,"set2_only":9,"set2_set3":5,"set3_only":13,"set3_set4":3,"set4_only":14,"outside":8}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"four_linear","sets":[{"id":"set1","label":"Sweet","shape":"oval"},{"id":"set2","label":"Savoury","shape":"pentagon"},{"id":"set3","label":"Hot","shape":"diamond"},{"id":"set4","label":"Aromatic","shape":"trapezoid"}],"regions":{"set1_only":22,"set1_set2":3,"set2_only":12,"set2_set3":8,"set3_only":10,"set3_set4":5,"set4_only":12,"outside":8}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"four_linear","sets":[{"id":"set1","label":"Sweet","shape":"oval"},{"id":"set2","label":"Savoury","shape":"pentagon"},{"id":"set3","label":"Hot","shape":"diamond"},{"id":"set4","label":"Aromatic","shape":"trapezoid"}],"regions":{"set1_only":20,"set1_set2":5,"set2_only":12,"set2_set3":8,"set3_only":10,"set3_set4":3,"set4_only":14,"outside":8}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"four_linear","sets":[{"id":"set1","label":"Sweet","shape":"oval"},{"id":"set2","label":"Savoury","shape":"pentagon"},{"id":"set3","label":"Hot","shape":"diamond"},{"id":"set4","label":"Aromatic","shape":"trapezoid"}],"regions":{"set1_only":18,"set1_set2":5,"set2_only":14,"set2_set3":8,"set3_only":10,"set3_set4":3,"set4_only":14,"outside":8}}'::jsonb, 4);

  -- Q25: venn_diagram SELECT - Youth Club Activities (hide_labels = true)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (1,'Youth Club Activities', 'venn_diagram'::dm_question_type, E'One night at a youth club 8 people played snooker. 12 people (of which 4 also played snooker) played table tennis. 9 people played darts (none of these played either snooker or table tennis). 6 people played no game; they just talked.\n\nWhich one of the following represents the activities taking place at the youth club that night?', NULL, NULL, 'C', 'Snooker = 8, Table tennis = 12 (of which 4 also play snooker), Darts = 9 (no overlap), Talked only = 6. Snooker only = 8 − 4 = 4. Table tennis only = 12 − 4 = 8. Snooker ∩ TT = 4. Darts = 9. Outside = 6. Total = 4 + 4 + 8 + 9 + 6 = 31. The student must deduce which shape represents which activity. Only C has correct values: set1_only=4 (snooker only), overlap=4, set2_only=8 (TT only), set3_only=9 (darts), outside=6. Option A puts 8 in set1_only and 4 in set2_only — confuses total snooker with snooker-only and total with TT-only. Option B has set1_only=8 and darts=5 — wrong on both counts. Option D swaps darts (9) and outside (6).', 25, 'hard', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"","shape":"oval"},{"id":"set2","label":"","shape":"circle"},{"id":"set3","label":"","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":4,"set2_only":4,"set3_only":9,"outside":6}}'::jsonb, 1),
    (v_q25, 'B', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"","shape":"oval"},{"id":"set2","label":"","shape":"circle"},{"id":"set3","label":"","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":4,"set2_only":8,"set3_only":5,"outside":6}}'::jsonb, 2),
    (v_q25, 'C', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"","shape":"oval"},{"id":"set2","label":"","shape":"circle"},{"id":"set3","label":"","shape":"oval"}],"regions":{"set1_only":4,"set1_set2":4,"set2_only":8,"set3_only":9,"outside":6}}'::jsonb, 3),
    (v_q25, 'D', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"","shape":"oval"},{"id":"set2","label":"","shape":"circle"},{"id":"set3","label":"","shape":"oval"}],"regions":{"set1_only":4,"set1_set2":4,"set2_only":8,"set3_only":6,"outside":9}}'::jsonb, 4);

  -- Q26: venn_diagram INTERPRET - Community Centre Activities
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Community Centre Activities', 'venn_diagram'::dm_question_type, E'The diagram shows activities at a community centre categorised by five properties: council-funded, held weekly, open to over-60s, requires booking, and has a waiting list. Each letter marks a different region.\n\nWhich letter represents an activity that is council-funded, requires booking, and has a waiting list?', NULL, '{"diagramLayout":"five_complex","sets":[{"id":"set1","label":"Council-funded","shape":"rectangle"},{"id":"set2","label":"Held weekly","shape":"square"},{"id":"set3","label":"Open to over-60s","shape":"triangle"},{"id":"set4","label":"Requires booking","shape":"circle"},{"id":"set5","label":"Has waiting list","shape":"diamond"}],"regions":{"set2_only":"P","set1_set2":"Q","set1_only":"R","set1_set4":"S","set1_set4_set5":"T","set1_set3_set5":"U","set3_only":"V","outside":"W"}}'::jsonb, 'A', 'The question asks for council-funded (set1) + requires booking (set4) + has waiting list (set5). The region set1_set4_set5 represents exactly this combination — activities inside set1, set4, and set5 but not in the other sets. This region is labelled T. Letter S (set1_set4) is council-funded and requires booking but does NOT have a waiting list. Letter U (set1_set3_set5) is council-funded, open to over-60s, and has a waiting list but does NOT require booking. Letter Q (set1_set2) is council-funded and held weekly.', 26, 'hard')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter T', NULL, 1),
    (v_q26, 'B', 'Letter S', NULL, 2),
    (v_q26, 'C', 'Letter U', NULL, 3),
    (v_q26, 'D', 'Letter Q', NULL, 4);

  -- Q27: venn_diagram INTERPRET - Pet Shelter Animals
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Pet Shelter Animals', 'venn_diagram'::dm_question_type, E'The diagram shows animals at a pet shelter categorised by three properties. All microchipped animals are vaccinated. Animals awaiting rehoming are neither vaccinated nor microchipped. Each letter marks a different region.\n\nWhich letter represents an animal that is vaccinated but not microchipped?', NULL, '{"diagramLayout":"three_nested_one_separate","sets":[{"id":"set1","label":"Vaccinated","shape":"hexagon"},{"id":"set2","label":"Microchipped","shape":"circle"},{"id":"set3","label":"Awaiting rehoming","shape":"star"}],"regions":{"set1_only":"P","set1_set2":"Q","set3_only":"R","outside":"S"}}'::jsonb, 'B', 'Vaccinated but not microchipped = inside set1 (Vaccinated) but outside set2 (Microchipped). This is the set1_only region, labelled P. Letter Q (set1_set2) is vaccinated AND microchipped. Letter R (set3_only) is awaiting rehoming only. Letter S (outside) is in none of the categories.', 27, 'normal')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter Q', NULL, 1),
    (v_q27, 'B', 'Letter P', NULL, 2),
    (v_q27, 'C', 'Letter R', NULL, 3),
    (v_q27, 'D', 'Letter S', NULL, 4);

  -- Q28: venn_diagram INTERPRET - Student Exchange Programmes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Student Exchange Programmes', 'venn_diagram'::dm_question_type, E'The diagram shows university students categorised by exchange programme applications and subject areas. Students who applied to Europe and those who applied to Asia form one overlapping pair. Students studying Science and those studying Languages form a separate overlapping pair. The two pairs do not overlap with each other. Each letter marks a different region.\n\nWhich letter represents a student who applied to both Europe and Asia?', NULL, '{"diagramLayout":"four_two_pairs","sets":[{"id":"set1","label":"Applied to Europe","shape":"oval"},{"id":"set2","label":"Applied to Asia","shape":"diamond"},{"id":"set3","label":"Studying Science","shape":"pentagon"},{"id":"set4","label":"Studying Languages","shape":"hexagon"}],"regions":{"set1_only":"P","set2_only":"Q","set1_set2":"R","set3_only":"S","set4_only":"T","set3_set4":"U","outside":"V"}}'::jsonb, 'C', 'Applied to both Europe and Asia = inside set1 (Europe) and set2 (Asia). This is the set1_set2 region, labelled R. Letter P (set1_only) is Europe only. Letter U (set3_set4) is Science and Languages. Letter V (outside) is in none of the categories.', 28, 'normal')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter P', NULL, 1),
    (v_q28, 'B', 'Letter U', NULL, 2),
    (v_q28, 'C', 'Letter R', NULL, 3),
    (v_q28, 'D', 'Letter V', NULL, 4);

  -- Q29: probabilistic - Blood Type Distribution
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Blood Type Distribution', 'probabilistic'::dm_question_type, E'In a sample of 500 blood donors, 220 have blood type O, 130 have type A, 90 have type B, and 60 have type AB. A donor is selected at random.\n\nWhat is the probability that the selected donor has blood type A or blood type B?', NULL, NULL, 'B', 'P(A or B) = (130 + 90) / 500 = 220 / 500 = 0.44 = 44%. A (22%) is half the correct answer. C (56%) is P(O or AB) = (220 + 60) / 500. D (26%) is P(A only) = 130 / 500.', 29, 'normal')
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', '22%', NULL, 1),
    (v_q29, 'B', '44%', NULL, 2),
    (v_q29, 'C', '56%', NULL, 3),
    (v_q29, 'D', '26%', NULL, 4);

  -- Q30: probabilistic - Factory Defect Rate
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Factory Defect Rate', 'probabilistic'::dm_question_type, E'A factory produces 1,200 items per day. Machine X produces 800 items with a 3% defect rate, and Machine Y produces 400 items with a 5% defect rate.\n\nHow many defective items are expected per day in total?', NULL, NULL, 'C', E'Machine X defective: 800 × 0.03 = 24. Machine Y defective: 400 × 0.05 = 20. Total = 24 + 20 = 44. A (48) = 1200 × 0.04 (averaging the rates incorrectly). B (60) = 1200 × 0.05 (using only the higher rate). D (36) = 1200 × 0.03 (using only the lower rate).', 30, 'normal')
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', '48', NULL, 1),
    (v_q30, 'B', '60', NULL, 2),
    (v_q30, 'C', '44', NULL, 3),
    (v_q30, 'D', '36', NULL, 4);

  -- Q31: probabilistic - Raffle Ticket Drawing
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Raffle Ticket Drawing', 'probabilistic'::dm_question_type, E'A charity raffle has 200 tickets. 30 tickets win a small prize and 10 tickets win a large prize. The remaining 160 tickets win nothing. Two tickets are drawn at random without replacement.\n\nWhat is the probability that both tickets win a prize (of any kind)?', NULL, NULL, 'B', E'Total prize tickets = 30 + 10 = 40. P(1st wins) = 40/200. P(2nd wins | 1st won) = 39/199. P(both) = (40/200) × (39/199) = 1560/39800 ≈ 0.0392 ≈ 3.9%. A (4.0%) uses 40/200 × 40/200 = 0.04 — the common error of not adjusting for ''without replacement.'' C (20%) is P(1st wins) = 40/200. D (1.0%) confuses the calculation entirely.', 31, 'hard')
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', '4.0%', NULL, 1),
    (v_q31, 'B', '3.9%', NULL, 2),
    (v_q31, 'C', '20.0%', NULL, 3),
    (v_q31, 'D', '1.0%', NULL, 4);

  -- Q32: probabilistic - Allergy Test Reliability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Allergy Test Reliability', 'probabilistic'::dm_question_type, E'An allergy test has 92% accuracy: it correctly identifies 92% of people who have the allergy (true positive rate) and correctly identifies 92% of people who do not have the allergy (true negative rate). In a population of 1,000 people, 50 actually have the allergy.\n\nIf a person tests positive, what is the approximate probability that they actually have the allergy?', NULL, NULL, 'B', E'True positives: 50 × 0.92 = 46. False positives: 950 × 0.08 = 76. Total positives: 46 + 76 = 122. P(allergy | positive) = 46/122 ≈ 37.7%. A (92%) confuses test accuracy with positive predictive value — the classic base rate neglect error. C (5.0%) is the raw prevalence (50/1000). D (60.5%) does not correspond to any valid calculation.', 32, 'hard')
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', '92.0%', NULL, 1),
    (v_q32, 'B', '37.7%', NULL, 2),
    (v_q32, 'C', '5.0%', NULL, 3),
    (v_q32, 'D', '60.5%', NULL, 4);

  -- Q33: probabilistic - Bus Arrival Times
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Bus Arrival Times', 'probabilistic'::dm_question_type, E'Buses on Route 7 arrive at a stop every 15 minutes. A passenger arrives at the bus stop at a random time. The probability that a bus arrives within the first 5 minutes of waiting is 1/3. If the passenger takes the bus, there is an 80% chance they arrive at their destination on time.\n\nWhat is the probability that the passenger waits less than 5 minutes AND arrives at their destination on time?', NULL, NULL, 'A', E'P(wait < 5 min) = 1/3. P(on time) = 80% = 4/5. These are independent. P(both) = 1/3 × 4/5 = 4/15 ≈ 0.267 = 26.7%. B (80%) is P(on time) alone. C (33.3%) is P(wait < 5 min) alone. D (46.7%) may come from incorrectly subtracting (80% − 33.3%).', 33, 'normal')
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', '26.7%', NULL, 1),
    (v_q33, 'B', '80.0%', NULL, 2),
    (v_q33, 'C', '33.3%', NULL, 3),
    (v_q33, 'D', '46.7%', NULL, 4);

  -- Q34: probabilistic - Seed Germination Rate
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Seed Germination Rate', 'probabilistic'::dm_question_type, E'A gardener plants 5 seeds, each with an independent 70% chance of germinating.\n\nWhat is the probability that all 5 seeds germinate?', NULL, NULL, 'D', E'Each seed germinates independently with P = 0.7. P(all 5) = 0.7 × 0.7 × 0.7 × 0.7 × 0.7 = 0.7⁵ = 0.16807 ≈ 16.8%. A (70%) is the probability for a single seed. B (30%) is the probability of a single seed NOT germinating. C (50%) does not correspond to a valid calculation.', 34, 'normal')
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q34, 'A', '70.0%', NULL, 1),
    (v_q34, 'B', '30.0%', NULL, 2),
    (v_q34, 'C', '50.0%', NULL, 3),
    (v_q34, 'D', '16.8%', NULL, 4);

  -- Q35: probabilistic - Cricket Match Outcomes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (1,'Cricket Match Outcomes', 'probabilistic'::dm_question_type, E'A cricket team plays 3 matches. The probability of winning any single match is 0.6, and each match outcome is independent.\n\nWhat is the probability that the team wins exactly 2 out of the 3 matches?', NULL, NULL, 'A', E'P(exactly 2 wins) = C(3,2) × 0.6² × 0.4¹ = 3 × 0.36 × 0.4 = 3 × 0.144 = 0.432 = 43.2%. B (36%) = 0.6² = P(two specific matches won, forgetting the third and combinations). C (64.8%) = P(at least 2 wins) = P(exactly 2) + P(all 3) = 0.432 + 0.216 = 0.648. D (21.6%) = P(all 3 wins) = 0.6³.', 35, 'normal')
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', '43.2%', NULL, 1),
    (v_q35, 'B', '36.0%', NULL, 2),
    (v_q35, 'C', '64.8%', NULL, 3),
    (v_q35, 'D', '21.6%', NULL, 4);

END $$;
