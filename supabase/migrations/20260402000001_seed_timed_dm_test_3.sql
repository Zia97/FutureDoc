-- Seed: Timed DM Test 3 (test_id = 3)
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

  DELETE FROM timed_decision_making_questions WHERE test_id = 3;

  INSERT INTO timed_decision_making_tests (id, title, time_minutes)
  VALUES (3, 'DM Practice Test 3', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: syllogism - Swimming Pool Safety Rules
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Swimming Pool Safety Rules', 'syllogism'::dm_question_type, 'Children under 8 are not permitted in the main pool unless accompanied by a lifeguard-certified adult. No one may use the diving area without first completing a swimming proficiency test. Some lifeguard-certified adults do not use the diving area.', NULL, NULL, NULL, NULL, 1, 'normal')
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'A 6-year-old in the main pool must be accompanied by a lifeguard-certified adult.', 'Yes', 'The premise states children under 8 are not permitted in the main pool unless accompanied by a lifeguard-certified adult. A 6-year-old is under 8, so to be permitted in the main pool they must be accompanied by a lifeguard-certified adult. This follows directly.', 1),
    (v_q01, 'A lifeguard-certified adult must have completed a swimming proficiency test.', 'No', 'The proficiency test is a requirement for using the diving area, not for being lifeguard-certified. The premises establish no link between lifeguard certification and the proficiency test. This is a scope creep error — applying a rule from one context (diving area) to another (lifeguard certification).', 2),
    (v_q01, 'Someone using the diving area has completed a swimming proficiency test.', 'Yes', 'The premise states ''No one may use the diving area without first completing a swimming proficiency test.'' This means completing the test is a necessary condition for using the diving area. Therefore, anyone using the diving area must have completed the test.', 3),
    (v_q01, 'All lifeguard-certified adults have completed a swimming proficiency test.', 'No', 'We know some lifeguard-certified adults do not use the diving area, but the proficiency test is only stated as a requirement for using the diving area. There is no premise connecting lifeguard certification with the proficiency test. Some lifeguard-certified adults may never have taken the test.', 4),
    (v_q01, 'A 10-year-old can use the main pool without being accompanied.', 'No', 'The accompaniment rule applies to children under 8. A 10-year-old is not under 8, so this specific rule does not restrict them. However, we cannot conclude they CAN use the pool without accompaniment — there may be other rules not mentioned in the premises. ''Not restricted by this rule'' is not the same as ''permitted.'' The conclusion goes beyond what can be deduced from the premises.', 5);

  -- Q02: syllogism - Brindle Classification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Brindle Classification', 'syllogism'::dm_question_type, 'All brindles are either spotted or striped. Only striped brindles can be classified as jentiks. Some spotted brindles are larger than any jentik.', NULL, NULL, NULL, NULL, 2, 'hard')
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'A jentik must be a striped brindle.', 'Yes', '''Only striped brindles can be classified as jentiks'' means that being a striped brindle is a necessary condition for being a jentik. Therefore any jentik must be a striped brindle.', 1),
    (v_q02, 'All striped brindles are jentiks.', 'No', '''Only striped brindles can be classified as jentiks'' means being a striped brindle is necessary but not sufficient for being a jentik. Some striped brindles may not be classified as jentiks. This reverses the direction of the ''only'' statement.', 2),
    (v_q02, 'Some brindles are larger than any jentik.', 'Yes', 'The premises state some spotted brindles are larger than any jentik. Since all brindles are either spotted or striped, spotted brindles are brindles. Therefore some brindles (specifically, some spotted ones) are larger than any jentik.', 3),
    (v_q02, 'No spotted brindle can be a jentik.', 'Yes', 'All brindles are either spotted or striped — these are mutually exclusive categories (''either...or''). Only striped brindles can be jentiks. A spotted brindle is not striped, so it cannot be a jentik.', 4),
    (v_q02, 'All brindles that are larger than any jentik are spotted.', 'No', 'We know some spotted brindles are larger than any jentik, but the premises do not rule out the possibility that some striped brindles (who are not jentiks) might also be larger than any jentik. We cannot conclude that all brindles larger than any jentik must be spotted.', 5);

  -- Q03: syllogism - School Transport Eligibility
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'School Transport Eligibility', 'syllogism'::dm_question_type, 'If a student lives more than 3 miles from the school, they are eligible for a free bus pass. Students who are eligible for a free bus pass but decline it may apply for a bicycle loan instead. Most students who live within 3 miles of the school walk to school.', NULL, NULL, NULL, NULL, 3, 'normal')
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'A student who lives 4 miles from the school is eligible for a free bus pass.', 'Yes', 'The first premise states that if a student lives more than 3 miles from the school, they are eligible for a free bus pass. 4 miles is more than 3 miles, so this student is eligible.', 1),
    (v_q03, 'A student who lives within 3 miles of the school cannot apply for a bicycle loan.', 'Yes', 'The bicycle loan is available to students who are eligible for a bus pass but decline it. Bus pass eligibility requires living more than 3 miles away. A student living within 3 miles is not eligible for a bus pass, so they cannot meet the prerequisite for the bicycle loan.', 2),
    (v_q03, 'All students who live within 3 miles of the school walk to school.', 'No', 'The premise states ''most'' students within 3 miles walk to school. ''Most'' means more than 50% but not all. This conclusion uses the quantifier ''all,'' which is stronger than what the premises support. This is a quantifier shift error.', 3),
    (v_q03, 'A student with a bicycle loan must live more than 3 miles from the school.', 'Yes', 'To apply for a bicycle loan, a student must be eligible for a bus pass but decline it. Bus pass eligibility requires living more than 3 miles away. Therefore, anyone with a bicycle loan must live more than 3 miles from the school.', 4),
    (v_q03, 'A student who declines a bus pass must have a bicycle loan.', 'No', 'The premises state that students who decline the bus pass ''may apply'' for a bicycle loan. ''May apply'' indicates permission, not obligation. A student could decline the bus pass and choose not to apply for a bicycle loan, or apply and not receive one.', 5);

  -- Q04: syllogism - Bakery Product Freshness
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Bakery Product Freshness', 'syllogism'::dm_question_type, 'No bread is sold without being baked that morning. Pastries containing cream must be refrigerated. Some pastries do not contain cream.', NULL, NULL, NULL, NULL, 4, 'normal')
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q04, 'A loaf of bread being sold must have been baked that morning.', 'Yes', 'The premise ''No bread is sold without being baked that morning'' means being baked that morning is a necessary condition for bread being sold. Therefore any bread being sold must have been baked that morning.', 1),
    (v_q04, 'Some pastries do not need to be refrigerated.', 'Yes', 'The refrigeration requirement applies to pastries containing cream. The premises state some pastries do not contain cream. Since those pastries are not subject to the cream-based refrigeration rule, and no other refrigeration rule is stated, some pastries do not need to be refrigerated.', 2),
    (v_q04, 'All refrigerated items in the bakery are pastries containing cream.', 'No', 'The premises state pastries with cream must be refrigerated, but this does not mean only cream pastries are refrigerated. Other items might also be refrigerated for reasons not mentioned. This is a reverse inference error.', 3),
    (v_q04, 'If bread was not baked that morning, it will not be sold.', 'Yes', 'This is the contrapositive of the first premise. ''No bread is sold without being baked that morning'' means: if bread is sold, then it was baked that morning. The contrapositive — if not baked that morning, then not sold — is logically equivalent and therefore valid.', 4),
    (v_q04, 'All pastries must be refrigerated.', 'No', 'Only pastries containing cream must be refrigerated. The premises explicitly state that some pastries do not contain cream, and no refrigeration rule applies to those. Therefore not all pastries must be refrigerated. This is a scope creep error.', 5);

  -- Q05: syllogism - Wildlife Sanctuary Protocols
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Wildlife Sanctuary Protocols', 'syllogism'::dm_question_type, 'All rescued animals receive a health assessment unless they are transferred from an accredited partner sanctuary. Only animals that pass the health assessment are placed in the public viewing area. Some animals transferred from partner sanctuaries also receive a health assessment.', NULL, NULL, NULL, NULL, 5, 'hard')
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'An animal in the public viewing area must have passed a health assessment.', 'Yes', '''Only animals that pass the health assessment are placed in the public viewing area'' means passing the health assessment is a necessary condition for placement. Any animal in the public viewing area must therefore have passed the assessment.', 1),
    (v_q05, 'All animals transferred from partner sanctuaries are placed in the public viewing area.', 'No', 'Animals from partner sanctuaries do not automatically receive a health assessment (they are the exception in the first premise). Only some of them also receive one. Even those that receive an assessment may not pass it. Therefore we cannot conclude all transferred animals end up in the viewing area.', 2),
    (v_q05, 'A rescued animal not from a partner sanctuary will receive a health assessment.', 'Yes', 'The first premise states all rescued animals receive a health assessment unless transferred from a partner sanctuary. If the animal is not from a partner sanctuary, the exception does not apply, so the animal will receive a health assessment.', 3),
    (v_q05, 'An animal that did not receive a health assessment cannot be in the public viewing area.', 'Yes', 'The premise states ''Only animals that pass the health assessment are placed in the public viewing area.'' Passing the health assessment requires having received it first — you cannot pass a test you never took. Therefore, an animal that did not receive the assessment could not have passed it, and so cannot be placed in the public viewing area.', 4),
    (v_q05, 'No animal from a partner sanctuary can be placed in the public viewing area.', 'No', 'The third premise states some animals transferred from partner sanctuaries also receive a health assessment. If any of those animals pass the assessment, they would meet the requirement for placement in the viewing area. Therefore it is not true that no partner sanctuary animal can be placed there.', 5);

  -- Q06: logic_puzzle - Library Reading Group Seating
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Library Reading Group Seating', 'logic_puzzle'::dm_question_type, 'Five members of a library reading group — Fiona, George, Hannah, Ian, and Julia — sit in a row of five chairs numbered 1 to 5 from left to right. The following conditions apply:

• Fiona sits in chair 1.
• George sits in chair 5.
• Hannah sits immediately next to Ian.
• Julia does not sit in chair 1 or chair 5.

Which of the following is a possible seating arrangement from chair 1 to chair 5?', NULL, NULL, 'A', 'Fiona is in chair 1 and George is in chair 5 (given). Julia cannot be in chair 1 or 5, so Julia is in chair 2, 3, or 4. Hannah must be immediately next to Ian.

Option A: Fiona(1), Julia(2), Hannah(3), Ian(4), George(5). Julia in chair 2 ✓. Hannah(3) adjacent to Ian(4) ✓. All conditions met.

Option B: Fiona(1), Hannah(2), Julia(3), George(4), Ian(5). George must be in chair 5 but is in chair 4 ✗.

Option C: Fiona(1), Ian(2), Julia(3), Hannah(4), George(5). Ian(2) and Hannah(4) are not adjacent ✗.

Option D: Fiona(1), George(2), Julia(3), Ian(4), Hannah(5). George must be in chair 5 but is in chair 2 ✗.', 6, 'normal')
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Fiona, Julia, Hannah, Ian, George', NULL, 1),
    (v_q06, 'B', 'Fiona, Hannah, Julia, George, Ian', NULL, 2),
    (v_q06, 'C', 'Fiona, Ian, Julia, Hannah, George', NULL, 3),
    (v_q06, 'D', 'Fiona, George, Julia, Ian, Hannah', NULL, 4);

  -- Q07: logic_puzzle - Volunteer Rota Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Volunteer Rota Assignment', 'logic_puzzle'::dm_question_type, 'Four volunteers — Priya, Quinn, Raj, and Suki — must each be assigned to exactly one of four different tasks at a community centre: Reception, Kitchen, Stockroom, and Events. The following conditions apply:

• Priya cannot be assigned to Kitchen or Stockroom.
• Quinn cannot be assigned to Reception or Stockroom.
• Suki is assigned to Reception.

Which of the following must be true?', NULL, NULL, 'B', 'Suki is in Reception (given). Remaining: Kitchen, Stockroom, Events for Priya, Quinn, Raj. Priya cannot do Kitchen or Stockroom, so Priya must do Events. Quinn cannot do Reception (taken) or Stockroom, so Quinn must do Kitchen (Events is taken by Priya). Raj takes the remaining task: Stockroom.

Option A: Quinn is assigned to Events — False, Quinn is in Kitchen ✗.
Option B: Raj is assigned to Stockroom — True ✓.
Option C: Priya is assigned to Kitchen — False, Priya cannot do Kitchen and is in Events ✗.
Option D: Raj is assigned to Events — False, Raj is in Stockroom ✗.', 7, 'normal')
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'Quinn is assigned to Events.', NULL, 1),
    (v_q07, 'B', 'Raj is assigned to Stockroom.', NULL, 2),
    (v_q07, 'C', 'Priya is assigned to Kitchen.', NULL, 3),
    (v_q07, 'D', 'Raj is assigned to Events.', NULL, 4);

  -- Q08: logic_puzzle - School Fundraiser Budget
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'School Fundraiser Budget', 'logic_puzzle'::dm_question_type, 'A school is organising a fundraiser with three stalls: Cakes, Games, and Crafts. The following information is known:

• The total budget across all three stalls is £180.
• The Games stall receives twice as much budget as the Crafts stall.
• The Cakes stall receives £20 more than the Crafts stall.

How much budget does the Games stall receive?', NULL, NULL, 'C', 'Let the Crafts budget = x. Then Games = 2x and Cakes = x + 20. Total: x + 2x + (x + 20) = 180. Simplifying: 4x + 20 = 180, so 4x = 160, therefore x = 40. Crafts = £40, Cakes = £60, Games = £80. Total check: 40 + 60 + 80 = £180 ✓.

Option A (£40) is the Crafts budget. Option B (£60) is the Cakes budget. Option D (£90) does not match any correct value.', 8, 'hard')
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', '£40', NULL, 1),
    (v_q08, 'B', '£60', NULL, 2),
    (v_q08, 'C', '£80', NULL, 3),
    (v_q08, 'D', '£90', NULL, 4);

  -- Q09: logic_puzzle - Office Seating Plan
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Office Seating Plan', 'logic_puzzle'::dm_question_type, 'Four colleagues — Amy, Ben, Clara, and Dev — sit around a square table, one on each side (North, South, East, West). The following conditions apply:

• Amy sits directly opposite Ben.
• Clara does not sit on the North or East side.
• Dev sits on the East side.

Who sits on the West side?', NULL, NULL, 'C', 'Dev is on the East side (given). Clara cannot be on North or East, so Clara is on South or West. Amy and Ben sit opposite each other. The opposite pairs on a square table are North-South and East-West. Since Dev is on East, the East-West pair would be Dev and whoever is on West. Amy and Ben must be opposite each other, so they cannot be split across East-West (Dev occupies East and is neither Amy nor Ben). Therefore Amy and Ben occupy the North-South pair. This leaves Clara for the remaining side: West.

Option A: Amy is on North or South (opposite Ben), not West ✗. Option B: Ben is on North or South (opposite Amy), not West ✗. Option D: Dev is on East, not West ✗.', 9, 'normal')
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', 'Amy', NULL, 1),
    (v_q09, 'B', 'Ben', NULL, 2),
    (v_q09, 'C', 'Clara', NULL, 3),
    (v_q09, 'D', 'Dev', NULL, 4);

  -- Q10: logic_puzzle - Sports Day Team Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Sports Day Team Selection', 'logic_puzzle'::dm_question_type, 'A teacher is selecting a team of 3 students from the following candidates for a relay race. The table shows each student''s attributes:

The following conditions must all be met:

• The team must include at least one student from Year 10 and at least one from Year 11.
• No two students on the team may prefer the same leg.
• The combined sprint time of the team must be under 39.2 seconds.

Which of the following is a valid team?', '{"headers":["Student","Year Group","Sprint Time (s)","Preferred Leg"],"rows":[["Emma","Year 10","13.2","1st"],["Farid","Year 11","12.8","2nd"],["Grace","Year 10","13.5","3rd"],["Hassan","Year 11","13.0","1st"],["Isla","Year 10","12.9","2nd"],["Jake","Year 11","13.1","3rd"]]}'::jsonb, NULL, 'B', 'Option A: Emma(Y10, 1st, 13.2), Farid(Y11, 2nd, 12.8), Grace(Y10, 3rd, 13.5). Legs all different ✓. Year groups: Y10 and Y11 ✓. Total: 13.2 + 12.8 + 13.5 = 39.5. Not under 39.2 ✗.

Option B: Emma(Y10, 1st, 13.2), Farid(Y11, 2nd, 12.8), Jake(Y11, 3rd, 13.1). Legs: 1st, 2nd, 3rd — all different ✓. Year groups: Y10 (Emma) and Y11 (Farid, Jake) ✓. Total: 13.2 + 12.8 + 13.1 = 39.1. Under 39.2 ✓. All conditions met.

Option C: Hassan(Y11, 1st, 13.0), Isla(Y10, 2nd, 12.9), Grace(Y10, 3rd, 13.5). Legs all different ✓. Year groups ✓. Total: 13.0 + 12.9 + 13.5 = 39.4. Not under 39.2 ✗.

Option D: Emma(Y10, 1st, 13.2), Hassan(Y11, 1st, 13.0), Jake(Y11, 3rd, 13.4). Emma and Hassan both prefer 1st leg ✗.', 10, 'normal')
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'Emma, Farid, Grace', NULL, 1),
    (v_q10, 'B', 'Emma, Farid, Jake', NULL, 2),
    (v_q10, 'C', 'Hassan, Isla, Grace', NULL, 3),
    (v_q10, 'D', 'Emma, Hassan, Jake', NULL, 4);

  -- Q11: logic_puzzle - Truth or Bluff
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Truth or Bluff', 'logic_puzzle'::dm_question_type, 'Three friends — Liam, Mia, and Noah — each either always tells the truth or always lies. They make the following statements:

Liam: "Mia is a liar."
Mia: "Noah and I are different — one of us tells the truth and the other lies."
Noah: "Liam is a truth-teller."

How many of the three are truth-tellers?', NULL, NULL, 'B', 'Case 1 — Assume Liam is a truth-teller: Then Mia is a liar (Liam''s statement is true). Since Mia is a liar, her statement is false. Mia claimed Noah and she are different types, so the opposite is true: Noah and Mia are the same type. Since Mia is a liar, Noah is also a liar. But Noah said ''Liam is a truth-teller'' — since Noah is a liar, this must be false, meaning Liam is NOT a truth-teller. This contradicts our assumption. Case 1 is impossible.

Case 2 — Assume Liam is a liar: His statement is false, so Mia is a truth-teller. Since Mia tells the truth, her statement is true: Noah and Mia are different types. Mia is a truth-teller, so Noah must be a liar. Check Noah''s statement: Noah says ''Liam is a truth-teller'' — since Noah is a liar, this is false, confirming Liam is a liar ✓.

The unique solution: Liam = liar, Mia = truth-teller, Noah = liar. Exactly 1 truth-teller.

Option A (0) is wrong — Mia is a truth-teller. Option C (2) is wrong — only Mia tells the truth. Option D (3) is wrong — Liam and Noah are liars.', 11, 'hard')
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', '0', NULL, 1),
    (v_q11, 'B', '1', NULL, 2),
    (v_q11, 'C', '2', NULL, 3),
    (v_q11, 'D', '3', NULL, 4);

  -- Q12: interpreting_info - Gym Membership Revenue
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Gym Membership Revenue', 'interpreting_info'::dm_question_type, 'A gym chain tracks its quarterly revenue (in thousands of pounds) from four membership types across the year.', '{"headers":["Membership Type","Q1 Revenue (£k)","Q2 Revenue (£k)","Q3 Revenue (£k)","Q4 Revenue (£k)","Members (Q4)"],"rows":[["Basic","30","28","26","24","800"],["Standard","45","48","50","54","600"],["Premium","60","58","62","64","320"],["Student","12","8","6","14","350"]]}'::jsonb, NULL, NULL, NULL, 12, 'normal')
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'Total revenue from all membership types was higher in Q4 than in Q1.', 'Yes', 'Q1 total = 30+45+60+12 = £147k. Q4 total = 24+54+64+14 = £156k. Q4 is higher, so this is true.', 1),
    (v_q12, 'If the trend in Standard membership revenue continues, Q5 revenue would exceed £58,000.', 'No', 'This is an extrapolation trap. We cannot assume the trend will continue beyond the data provided. The question asks what the data shows, not what might happen in the future.', 2),
    (v_q12, 'Premium members pay more per person than Basic members in Q4.', 'Yes', 'Premium Q4 revenue per member = £64,000 / 320 = £200. Basic Q4 revenue per member = £24,000 / 800 = £30. Premium members do pay more per person.', 3),
    (v_q12, 'Student membership generated the least revenue in every quarter.', 'Yes', 'Student revenue is £12k, £8k, £6k, £14k across Q1–Q4. In every quarter, this is the lowest figure compared to all other membership types.', 4),
    (v_q12, 'The decrease in Basic membership revenue shows that customers are dissatisfied with the Basic package.', 'No', 'This is a causation/correlation trap. Revenue declining does not necessarily indicate dissatisfaction — members could be upgrading to higher tiers, or there could be fewer Basic members for other reasons. The data does not provide information about satisfaction.', 5);

  -- Q13: interpreting_info - Urban Green Spaces Study
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Urban Green Spaces Study', 'interpreting_info'::dm_question_type, 'A local council commissioned a study examining the relationship between urban green spaces and residents'' self-reported wellbeing. Researchers surveyed 2,000 adults living in a mid-sized city. Participants were asked how often they visited green spaces (parks, gardens, nature reserves) per week and were given a validated wellbeing questionnaire scored from 0 to 100.

The results showed that participants who visited green spaces four or more times per week had an average wellbeing score of 74, compared to 61 for those who visited once or fewer times per week. Among those who visited frequently, 68% reported that they exercised during their visits. The study also found that areas with more green space per capita tended to have higher average household incomes.

The council noted that 40% of the city''s green spaces are located in the three wealthiest boroughs, while the five least affluent boroughs share 15% of total green space. The council plans to invest £2 million into creating new parks in underserved areas over the next three years.', NULL, NULL, NULL, NULL, 13, 'normal')
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q13, 'The study demonstrates that visiting green spaces causes improved wellbeing.', 'No', 'This is a causation/correlation trap. The study shows an association between green space visits and higher wellbeing scores, but this is observational data and cannot establish causation. Other factors (e.g., income, exercise habits) may explain the difference.', 1),
    (v_q13, 'More than half of the frequent green space visitors reported exercising during their visits.', 'Yes', 'The passage states that 68% of frequent visitors reported exercising during their visits. 68% is more than half, so this statement is true.', 2),
    (v_q13, 'The three wealthiest boroughs have more green space than the five least affluent boroughs combined.', 'Yes', 'The passage states that 40% of green space is in the three wealthiest boroughs, while the five least affluent boroughs share 15%. 40% is greater than 15%, so this is true.', 3),
    (v_q13, 'Participants who visited green spaces once or fewer times per week all had wellbeing scores below 65.', 'No', 'The passage gives the average score of 61 for infrequent visitors. An average of 61 does not mean all individuals scored below 65 — some could have scored higher, some lower.', 4),
    (v_q13, 'The council''s investment will result in improved wellbeing for residents in underserved areas.', 'No', 'This is an extrapolation trap. While the study shows an association between green space access and wellbeing, we cannot conclude that building new parks will necessarily improve wellbeing. The study is observational and the outcome of the investment is not guaranteed by the data.', 5);

  -- Q14: interpreting_info - Pet Ownership Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Pet Ownership Survey', 'interpreting_info'::dm_question_type, 'In a neighbourhood of 40 households, 24 own a dog and the remaining 16 own a cat. No household owns both a dog and a cat. Half of the dog-owning households have a garden. Of the cat-owning households, 10 have a garden. None of the cat-owning households without a garden own a fish tank. There are exactly 5 fish tank owners in the entire neighbourhood.', NULL, NULL, NULL, NULL, 14, 'hard')
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'At least one dog-owning household owns a fish tank.', 'No', 'There are 5 fish tank owners total. Cat-owning households without a garden (6 households) cannot own a fish tank, but cat-owning households with a garden (10 households) could own fish tanks. It is possible that all 5 fish tank owners are cat-owning households with gardens. We cannot conclude that at least one dog-owning household must own a fish tank.', 1),
    (v_q14, 'There are 12 dog-owning households with a garden.', 'Yes', 'Half of the 24 dog-owning households have a garden. Half of 24 is 12. This must be true.', 2),
    (v_q14, 'The number of cat-owning households with a garden exceeds the number of cat-owning households without a garden.', 'Yes', 'There are 16 cat-owning households total, and 10 have a garden, so 6 do not. 10 exceeds 6, so this is true.', 3),
    (v_q14, 'All fish tank owners have a garden.', 'No', 'We know that cat-owning households without a garden do not own a fish tank, but we have no information about whether dog-owning households without a garden own a fish tank. Some of the 5 fish tank owners could be dog-owning households without a garden. We cannot determine this must be true.', 4),
    (v_q14, 'More households in the neighbourhood have a garden than do not.', 'Yes', 'Dog-owning households with a garden: 12. Cat-owning households with a garden: 10. Total with a garden: 22. Total without a garden: 40 - 22 = 18. 22 is more than 18, so this is true.', 5);

  -- Q15: interpreting_info - Hospital Bed Occupancy Rates
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Hospital Bed Occupancy Rates', 'interpreting_info'::dm_question_type, 'A hospital records the percentage of beds occupied in each ward at the end of each month. The hospital considers any occupancy rate above 90% to be ''critical pressure''. Each ward has the same total number of beds.', '{"headers":["Ward","January (%)","February (%)","March (%)","April (%)"],"rows":[["Cardiology","88","91","93","89"],["Orthopaedics","76","80","85","82"],["General Medicine","92","94","90","95"],["Paediatrics","65","70","68","72"],["Geriatrics","87","89","92","91"]]}'::jsonb, NULL, NULL, NULL, 15, 'normal')
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'General Medicine was under critical pressure in every month shown.', 'No', 'Critical pressure is defined as occupancy above 90%. General Medicine recorded 92% (January), 94% (February), 90% (March), and 95% (April). In March, occupancy was exactly 90%, which is not above 90% and therefore does not meet the critical pressure threshold. Since the statement claims every month, and March does not qualify, the conclusion is false.', 1),
    (v_q15, 'Paediatrics had the lowest occupancy rate in every month.', 'Yes', 'Paediatrics recorded 65%, 70%, 68%, 72%. In every month these are the lowest values across all wards.', 2),
    (v_q15, 'Geriatrics was under critical pressure in more months than Cardiology.', 'No', 'Geriatrics was above 90% in March (92%) and April (91%) — 2 months. Cardiology was above 90% in February (91%) and March (93%) — also 2 months. Both wards were under critical pressure for the same number of months, so Geriatrics did not have more.', 3),
    (v_q15, 'The average occupancy rate across all wards was highest in April.', 'Yes', 'January average: (88+76+92+65+87)/5 = 81.6%. February: (91+80+94+70+89)/5 = 84.8%. March: (93+85+90+68+92)/5 = 85.6%. April: (89+82+95+72+91)/5 = 85.8%. April has the highest average occupancy rate across all wards.', 4),
    (v_q15, 'Orthopaedics never reached critical pressure during the period shown.', 'Yes', 'Orthopaedics recorded 76%, 80%, 85%, 82%. None of these exceed 90%, so the ward was never under critical pressure.', 5);

  -- Q16: interpreting_info - Stamp Collection Categories
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Stamp Collection Categories', 'interpreting_info'::dm_question_type, 'A collector has exactly 60 stamps. Each stamp is classified as either ''Domestic'' or ''International''. Each stamp is also in one of three conditions: Mint, Used, or Damaged. There are 35 Domestic stamps and 25 International stamps. Of the Domestic stamps, 20 are Mint and 10 are Used. Of the International stamps, none are Damaged. There are 5 Damaged stamps in total.', NULL, NULL, NULL, NULL, 16, 'hard')
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'All 5 Damaged stamps are Domestic.', 'Yes', 'There are only two categories: Domestic and International. None of the International stamps are Damaged. Therefore all Damaged stamps must be Domestic. Since there are 5 Damaged stamps total, all 5 are Domestic.', 1),
    (v_q16, 'There are exactly 5 Domestic stamps that are Used.', 'No', 'The stem states that of the Domestic stamps, 10 are Used. The statement says 5, which contradicts the given information.', 2),
    (v_q16, 'There are more International Mint stamps than International Used stamps.', 'No', 'There are 25 International stamps, none Damaged. So they are split between Mint and Used, totalling 25. But we do not know the exact split. It could be any combination. We cannot determine whether there are more Mint than Used among International stamps.', 3),
    (v_q16, 'The number of Domestic stamps that are not Mint is 15.', 'Yes', 'There are 35 Domestic stamps, 20 of which are Mint. 35 - 20 = 15 Domestic stamps that are not Mint. This must be true.', 4),
    (v_q16, 'There are fewer than 30 Mint stamps in the entire collection.', 'No', 'There are 20 Domestic Mint stamps. International stamps have 25 total (none Damaged), so between 0 and 25 could be Mint. Total Mint could range from 20 to 45. We cannot determine whether the total is fewer than 30 — it could be true or false depending on the International Mint count.', 5);

  -- Q17: interpreting_info - School Attendance Patterns
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'School Attendance Patterns', 'interpreting_info'::dm_question_type, 'A secondary school records the average attendance percentage for each year group across three terms. The school''s target is 95% attendance for every year group in every term.', '{"headers":["Year Group","Autumn Term (%)","Spring Term (%)","Summer Term (%)"],"rows":[["Year 7","96","95","93"],["Year 8","94","93","91"],["Year 9","92","90","89"],["Year 10","95","94","92"],["Year 11","91","88","85"]]}'::jsonb, NULL, NULL, NULL, 17, 'normal')
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'Year 7 met the school''s attendance target in at least two terms.', 'Yes', 'Year 7 recorded 96% (Autumn, meets target), 95% (Spring, meets target), and 93% (Summer, does not meet target). They met the target in two terms.', 1),
    (v_q17, 'Year 11 had the lowest attendance in every term.', 'Yes', 'Year 11: Autumn 91%, Spring 88%, Summer 85%. Comparing with all other year groups in each term, these are the lowest values in every term.', 2),
    (v_q17, 'Attendance declined from Autumn to Summer for every year group.', 'Yes', 'Year 7: 96→95→93 (decline). Year 8: 94→93→91 (decline). Year 9: 92→90→89 (decline). Year 10: 95→94→92 (decline). Year 11: 91→88→85 (decline). All year groups show declining attendance across the three terms.', 3),
    (v_q17, 'Only one year group met the school''s attendance target in the Autumn Term.', 'No', 'In the Autumn Term, Year 7 (96%) and Year 10 (95%) both met or exceeded the 95% target. That is two year groups, not one.', 4),
    (v_q17, 'The declining attendance pattern shows that students become less motivated as the year progresses.', 'No', 'This is a causation/correlation trap. While attendance declines across terms for all year groups, the data alone does not explain why. Attributing it to declining motivation is an assumption — illness, seasonal factors, or other reasons could also explain the pattern.', 5);

  -- Q18: strongest_argument - Mandatory Cycling Helmets
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Mandatory Cycling Helmets', 'strongest_argument'::dm_question_type, 'Should wearing cycling helmets be made mandatory for all cyclists to reduce cycling-related head injuries?', NULL, NULL, 'A', 'Option A is the strongest argument because it directly addresses both the action (mandatory helmets) and the desired outcome (reducing head injuries) with evidence from regions that have implemented such laws. Option B addresses the action but only tangentially relates to the outcome — it raises a side-effect concern about general public health rather than head injuries specifically, and relies on the assumption that discomfort would significantly deter cycling. Option C only addresses the feasibility of the action (affordability) but does not connect to the outcome of reducing head injuries. Option D addresses both parts and provides counter-evidence but the argument is weaker than A because it conflates participation rates with per-cyclist injury rates — a decrease in overall cycling does not mean the policy failed to protect those who continue cycling. However, D is a reasonable counter-argument. A remains strongest because it provides direct evidence linking the action to the desired outcome.', 18, 'normal')
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Yes; studies in regions that have introduced mandatory helmet laws have shown a measurable reduction in the severity and frequency of cycling-related head injuries, suggesting that a legal requirement would directly contribute to lowering head injury rates.', NULL, 1),
    (v_q18, 'B', 'No; some cyclists find helmets uncomfortable and this could discourage people from cycling altogether, which would be bad for public health.', NULL, 2),
    (v_q18, 'C', 'Yes; helmets are relatively inexpensive and widely available, so most people could easily buy one.', NULL, 3),
    (v_q18, 'D', 'No; mandatory helmet laws in some jurisdictions have led to significant decreases in cycling participation without a proportionate reduction in head injury rates per cyclist, indicating the policy may not effectively achieve its goal of reducing head injuries.', NULL, 4);

  -- Q19: strongest_argument - Free Public Transport for Under-25s
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Free Public Transport for Under-25s', 'strongest_argument'::dm_question_type, 'Should public transport be made free for under-25s to reduce carbon emissions from private vehicles?', NULL, NULL, 'D', 'Option D is the strongest argument because it directly addresses both the action (free transport for under-25s) and the desired outcome (reducing carbon emissions from private vehicles) with supporting evidence from pilot schemes. Option A addresses only the action (financial support for young people) but does not connect to the outcome of reducing emissions — it relies on an emotional appeal about cost of living. Option B only addresses the action (cost/fairness of the subsidy) and does not engage with the outcome of emission reduction at all — it raises a tangential concern about tax burden. Option C addresses both parts and provides counter-evidence, but D is stronger because it provides direct positive evidence linking the specific action to the specific outcome.', 19, 'normal')
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q19, 'A', 'Yes; young people deserve financial support because the cost of living is very high and they often struggle with money.', NULL, 1),
    (v_q19, 'B', 'No; the funding required to subsidise free transport for under-25s would place a significant burden on taxpayers, which is unfair to older citizens.', NULL, 2),
    (v_q19, 'C', 'No; data from cities that have trialled free youth transport shows that the majority of new journeys replaced walking and cycling rather than private car use, meaning the policy did not lead to a meaningful reduction in vehicle emissions.', NULL, 3),
    (v_q19, 'D', 'Yes; research from pilot schemes indicates that offering free public transport to young people leads to a significant shift from private car journeys to public transport, directly lowering per-capita vehicle emissions in the target age group.', NULL, 4);

  -- Q20: strongest_argument - Banning Homework in Primary Schools
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Banning Homework in Primary Schools', 'strongest_argument'::dm_question_type, 'Should homework be banned in primary schools to improve children''s wellbeing?', NULL, NULL, 'B', 'Option B is the strongest argument because it directly addresses both the action (banning homework in primary schools) and the desired outcome (improving wellbeing) with evidence from educational studies showing reduced stress and anxiety. Option A addresses a consequence of the action (parents losing insight) but does not engage with the outcome of children''s wellbeing — it has a narrow scope focused on parental needs. Option C addresses the action but relies on an assumption that children would default to screen time, which is unsubstantiated. It also only tangentially addresses the outcome. Option D addresses both parts but is emotionally framed (''should be allowed to play and enjoy childhood'') rather than evidence-based, and restates the premise that homework causes stress without providing supporting evidence.', 20, 'normal')
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'No; some parents rely on homework to understand what their children are learning at school.', NULL, 1),
    (v_q20, 'B', 'Yes; several large-scale educational studies have found that homework at primary level has no significant academic benefit, while its removal is associated with reduced stress and anxiety in young children, indicating a direct improvement in wellbeing.', NULL, 2),
    (v_q20, 'C', 'No; without homework, children would just spend more time on screens, which is also harmful to their wellbeing.', NULL, 3),
    (v_q20, 'D', 'Yes; children should be allowed to play and enjoy their childhood instead of being stressed by schoolwork.', NULL, 4);

  -- Q21: strongest_argument - Opt-Out Organ Donation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Opt-Out Organ Donation', 'strongest_argument'::dm_question_type, 'Should organ donation become an opt-out system to increase the number of available organs for transplant?', NULL, NULL, 'C', 'Option C is the strongest argument because it directly addresses both the action (opt-out system) and the desired outcome (increasing available organs) with concrete evidence from countries that have implemented the policy. Option A addresses the outcome (saving lives) but relies on an emotional appeal rather than evidence, and does not specifically connect the opt-out system to increased organ availability. Option B addresses both parts and raises a legitimate concern about consent and trust, but it relies on the assumption that an opt-out system necessarily violates consent (people can still opt out), and the claim that it would undermine supply is speculative. Option D only addresses a narrow subset of the population (some religious groups) and does not engage with the outcome of increasing organ supply — it has too narrow a scope to be the strongest argument.', 21, 'hard')
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'Yes; it is morally wrong to let people die on transplant waiting lists when their lives could be saved.', NULL, 1),
    (v_q21, 'B', 'No; an opt-out system may lead to organs being taken from people who did not genuinely consent, which violates individual bodily autonomy and could undermine public trust in the medical system rather than increasing usable organ supply.', NULL, 2),
    (v_q21, 'C', 'Yes; evidence from countries that have adopted opt-out systems, such as Spain and Wales, shows a significant and sustained increase in organ donation rates compared to opt-in systems, directly expanding the pool of organs available for transplant.', NULL, 3),
    (v_q21, 'D', 'No; some religious groups oppose organ donation, and their beliefs should be respected.', NULL, 4);

  -- Q22: strongest_argument - Compulsory Cooking Lessons
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Compulsory Cooking Lessons', 'strongest_argument'::dm_question_type, 'Should cooking be a compulsory subject in secondary schools to reduce obesity rates among young people?', NULL, NULL, 'D', 'Option D is the strongest argument because it directly addresses both the action (compulsory cooking in secondary schools) and the desired outcome (reducing obesity rates) with evidence from school programmes. Option A addresses only the action (impact on curriculum) but does not engage with the outcome of reducing obesity — it raises a tangential concern about timetabling. Option B addresses the action (cooking lessons) but does not connect to the specific outcome of reducing obesity — it broadens the argument to general life skills, which is a different outcome. Option C addresses both parts and provides a reasonable counter-argument about socioeconomic factors, but D is stronger because it provides direct positive evidence from comparable programmes.', 22, 'normal')
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'No; schools already have overcrowded curricula and adding another compulsory subject would reduce time available for core academic subjects.', NULL, 1),
    (v_q22, 'B', 'Yes; learning to cook is a valuable life skill that every young person should have.', NULL, 2),
    (v_q22, 'C', 'No; obesity is primarily driven by socioeconomic factors such as income and access to affordable healthy food, and teaching cooking skills alone does not address these root causes, meaning compulsory lessons are unlikely to produce a significant reduction in youth obesity rates.', NULL, 3),
    (v_q22, 'D', 'Yes; research from schools that have introduced compulsory cooking programmes shows that students who complete these courses make significantly healthier dietary choices and have lower rates of obesity compared to control groups, demonstrating a direct link between cooking education and reduced obesity.', NULL, 4);

  -- Q23: venn_diagram - Gym Activity Memberships
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Gym Activity Memberships', 'venn_diagram'::dm_question_type, 'A sports centre surveyed 80 members about three activities: swimming, yoga, and running. 35 members do swimming, 28 do yoga, and 30 do running. 12 do both swimming and yoga, 10 do both swimming and running, and 8 do both yoga and running. 5 members do all three activities.

Which of the following diagrams best represents the data?', NULL, NULL, 'C', 'Using inclusion-exclusion: swim only = 35-7-5-5 = 18, yoga only = 28-7-3-5 = 13, run only = 30-5-3-5 = 17, swim&yoga only = 12-5 = 7, swim&run only = 10-5 = 5, yoga&run only = 8-5 = 3, all three = 5, outside = 80-(18+13+17+7+5+3+5) = 12. Option C has these exact values. Option A forgot to subtract the all_three count from pairwise overlaps. Option B swapped the swim&run and yoga&run exclusive overlaps. Option D swapped the swim-only and run-only values.', 23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Swimming","shape":"pentagon"},{"id":"set2","label":"Yoga","shape":"star"},{"id":"set3","label":"Running","shape":"hexagon"}],"regions":{"set1_only":8,"set2_only":3,"set3_only":7,"set1_set2":12,"set1_set3":10,"set2_set3":8,"all_three":5,"outside":27}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Swimming","shape":"pentagon"},{"id":"set2","label":"Yoga","shape":"star"},{"id":"set3","label":"Running","shape":"hexagon"}],"regions":{"set1_only":20,"set2_only":11,"set3_only":17,"set1_set2":7,"set1_set3":3,"set2_set3":5,"all_three":5,"outside":12}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Swimming","shape":"pentagon"},{"id":"set2","label":"Yoga","shape":"star"},{"id":"set3","label":"Running","shape":"hexagon"}],"regions":{"set1_only":18,"set2_only":13,"set3_only":17,"set1_set2":7,"set1_set3":5,"set2_set3":3,"all_three":5,"outside":12}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Swimming","shape":"pentagon"},{"id":"set2","label":"Yoga","shape":"star"},{"id":"set3","label":"Running","shape":"hexagon"}],"regions":{"set1_only":17,"set2_only":13,"set3_only":18,"set1_set2":7,"set1_set3":5,"set2_set3":3,"all_three":5,"outside":12}}'::jsonb, 4);

  -- Q24: venn_diagram - Garden Centre Plants
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Garden Centre Plants', 'venn_diagram'::dm_question_type, 'A garden centre has 60 plants categorised by three traits: flowering, evergreen, and fruit-bearing. 25 are flowering, 20 are evergreen, and 22 are fruit-bearing. 8 are both flowering and evergreen, and 6 are both flowering and fruit-bearing. No plant is both evergreen and fruit-bearing. 7 plants have none of these traits.

Which of the following diagrams best represents the data?', NULL, NULL, 'A', 'Flowering only = 25-8-6 = 11, Evergreen only = 20-8 = 12, Fruit-bearing only = 22-6 = 16, outside = 7. Sum: 11+12+16+8+6+7 = 60. Option A matches. Option B swapped the overlaps (flowering&evergreen and flowering&fruit). Option C swapped flowering-only and flowering&evergreen. Option D swapped evergreen-only and fruit-bearing-only.', 24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flowering","shape":"hexagon"},{"id":"set2","label":"Evergreen","shape":"oval"},{"id":"set3","label":"Fruit-bearing","shape":"trapezoid"}],"regions":{"set1_only":11,"set2_only":12,"set3_only":16,"set1_set2":8,"set1_set3":6,"outside":7}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flowering","shape":"hexagon"},{"id":"set2","label":"Evergreen","shape":"oval"},{"id":"set3","label":"Fruit-bearing","shape":"trapezoid"}],"regions":{"set1_only":11,"set2_only":14,"set3_only":14,"set1_set2":6,"set1_set3":8,"outside":7}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flowering","shape":"hexagon"},{"id":"set2","label":"Evergreen","shape":"oval"},{"id":"set3","label":"Fruit-bearing","shape":"trapezoid"}],"regions":{"set1_only":8,"set2_only":12,"set3_only":16,"set1_set2":11,"set1_set3":6,"outside":7}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Flowering","shape":"hexagon"},{"id":"set2","label":"Evergreen","shape":"oval"},{"id":"set3","label":"Fruit-bearing","shape":"trapezoid"}],"regions":{"set1_only":11,"set2_only":16,"set3_only":12,"set1_set2":8,"set1_set3":6,"outside":7}}'::jsonb, 4);

  -- Q25: venn_diagram - Museum Visitors
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (3,'Museum Visitors', 'venn_diagram'::dm_question_type, 'A museum surveyed 45 visitors. 22 visited the modern art gallery and 18 visited the sculpture garden. 7 visitors visited both. 12 visitors visited neither.

Which diagram is consistent with the data?', NULL, NULL, 'A', 'Modern art only = 22-7 = 15. Sculpture garden only = 18-7 = 11. Both = 7. Neither = 12. Sum: 15+11+7+12 = 45. Since the labels are hidden, we need a diagram where one exclusive region is 15, the other is 11, the overlap is 7, and the outside is 12. Only Option A has these exact values. Option B has an overlap of 9 and outside of 10. Option C has an exclusive region of 13 and overlap of 9. Option D has exclusive regions of 14 and 12, overlap of 8, and outside of 11.', 25, 'hard', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"hideLabels":true,"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Modern Art","shape":"circle"},{"id":"set2","label":"Sculpture Garden","shape":"square"}],"regions":{"set1_only":15,"set2_only":11,"set1_set2":7,"outside":12}}'::jsonb, 1),
    (v_q25, 'B', '', '{"hideLabels":true,"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Modern Art","shape":"circle"},{"id":"set2","label":"Sculpture Garden","shape":"square"}],"regions":{"set1_only":15,"set2_only":11,"set1_set2":9,"outside":10}}'::jsonb, 2),
    (v_q25, 'C', '', '{"hideLabels":true,"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Modern Art","shape":"circle"},{"id":"set2","label":"Sculpture Garden","shape":"square"}],"regions":{"set1_only":13,"set2_only":11,"set1_set2":9,"outside":12}}'::jsonb, 3),
    (v_q25, 'D', '', '{"hideLabels":true,"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Modern Art","shape":"circle"},{"id":"set2","label":"Sculpture Garden","shape":"square"}],"regions":{"set1_only":14,"set2_only":12,"set1_set2":8,"outside":11}}'::jsonb, 4);

  -- Q26: venn_diagram - Company Project Categories
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Company Project Categories', 'venn_diagram'::dm_question_type, 'The diagram shows a company''s 120 projects categorised by department involvement. The rectangle represents Operations, the square represents Marketing, the triangle represents Sales, the circle represents Finance, and the diamond represents IT. Each letter marks a different region.

Which letter represents projects that involve Operations and Finance but not IT?', NULL, '{"diagramLayout":"five_complex","sets":[{"id":"set1","label":"Operations","shape":"rectangle"},{"id":"set2","label":"Marketing","shape":"square"},{"id":"set3","label":"Sales","shape":"triangle"},{"id":"set4","label":"Finance","shape":"circle"},{"id":"set5","label":"IT","shape":"diamond"}],"regions":{"set2_only":"P","set1_set2":"Q","set1_only":"R","set1_set4":"S","set1_set4_set5":"T","set1_set3_set5":"U","set3_only":"V","outside":"W"}}'::jsonb, 'A', 'The question asks for projects involving Operations and Finance but not IT. Letter S is in the region inside both the rectangle (Operations) and the circle (Finance) but outside the diamond (IT). Letter T is inside Operations, Finance, AND IT — which includes IT, so it does not match. Letter R is inside Operations only, with no Finance involvement. Letter Q is inside both Operations and Marketing, which is the wrong department pairing.', 26, 'hard')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter S', NULL, 1),
    (v_q26, 'B', 'Letter T', NULL, 2),
    (v_q26, 'C', 'Letter R', NULL, 3),
    (v_q26, 'D', 'Letter Q', NULL, 4);

  -- Q27: venn_diagram - University Research Grants
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'University Research Grants', 'venn_diagram'::dm_question_type, 'The diagram shows a university''s research grants categorised by six properties. The rectangle represents Funded grants, the circle represents Biomedical, the pentagon represents Engineering, the hexagon represents Humanities, the diamond represents Collaborative, and the triangle represents Industry Partnership. Each letter marks a different region.

Which letter represents grants that are funded and involve both engineering and collaboration but are not biomedical?', NULL, '{"diagramLayout":"six_complex","sets":[{"id":"set1","label":"Funded","shape":"rectangle"},{"id":"set2","label":"Biomedical","shape":"circle"},{"id":"set3","label":"Engineering","shape":"pentagon"},{"id":"set4","label":"Humanities","shape":"hexagon"},{"id":"set5","label":"Collaborative","shape":"diamond"},{"id":"set6","label":"Industry Partnership","shape":"triangle"}],"regions":{"set1_set2":"P","set1_set2_set3":"Q","set1_set3":"R","set1_set3_set5":"S","set1_set4":"T","set1_set5":"U","set1_only":"V","set1_set6":"W","set6_only":"X","outside":"Y"}}'::jsonb, 'C', 'The question asks for funded grants that involve engineering and collaboration but not biomedical research. Letter S marks the region inside the rectangle (Funded), the pentagon (Engineering), and the diamond (Collaborative), but outside the circle (Biomedical). Letter Q is inside Funded, Biomedical, and Engineering — it includes Biomedical, so it does not match. Letter R is inside Funded and Engineering only, without Collaborative involvement. Letter U is inside Funded and Collaborative only, without Engineering.', 27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter Q', NULL, 1),
    (v_q27, 'B', 'Letter R', NULL, 2),
    (v_q27, 'C', 'Letter S', NULL, 3),
    (v_q27, 'D', 'Letter U', NULL, 4);

  -- Q28: venn_diagram - Vehicle Classifications
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Vehicle Classifications', 'venn_diagram'::dm_question_type, 'The diagram shows vehicles at a depot classified by type. The octagon represents motor vehicles, the star represents electric vehicles, and the parallelogram represents bicycles. Each letter marks a different region.

Which letter represents vehicles that are motorised but not electric?', NULL, '{"diagramLayout":"three_nested_one_separate","sets":[{"id":"set1","label":"Motor vehicles","shape":"octagon"},{"id":"set2","label":"Electric vehicles","shape":"star"},{"id":"set3","label":"Bicycles","shape":"parallelogram"}],"regions":{"set1_only":"P","set1_set2":"Q","set3_only":"R","outside":"S"}}'::jsonb, 'A', 'The octagon represents motor vehicles and the star represents electric vehicles, with electric vehicles nested entirely inside motor vehicles (since all electric vehicles are motor vehicles). Letter P is in the octagon but outside the star — these are motor vehicles that are not electric (such as petrol or diesel vehicles). Letter Q is inside both the octagon and the star, representing electric vehicles (which are also motor vehicles). Letter R is inside the parallelogram, representing bicycles, which are neither motorised nor electric. Letter S is outside all shapes, representing items that are none of these categories.', 28, 'normal')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter P', NULL, 1),
    (v_q28, 'B', 'Letter Q', NULL, 2),
    (v_q28, 'C', 'Letter R', NULL, 3),
    (v_q28, 'D', 'Letter S', NULL, 4);

  -- Q29: probabilistic - Hospital Diagnostic Test
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Hospital Diagnostic Test', 'probabilistic'::dm_question_type, 'A hospital uses a screening test for a rare condition that affects 1 in 200 patients. The test correctly identifies 98% of patients who have the condition (sensitivity) and correctly identifies 95% of patients who do not have the condition (specificity).

If a patient tests positive, what is the probability that they actually have the condition?', NULL, NULL, 'A', 'Using Bayes'' theorem: P(condition) = 1/200 = 0.005. P(positive|condition) = 0.98. P(positive|no condition) = 0.05. P(positive) = 0.98 × 0.005 + 0.05 × 0.995 = 0.0049 + 0.04975 = 0.05465. P(condition|positive) = 0.0049 / 0.05465 = 0.0897, or about 9%.', 29, 'normal')
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'About 9%', NULL, 1),
    (v_q29, 'B', 'About 25%', NULL, 2),
    (v_q29, 'C', 'About 50%', NULL, 3),
    (v_q29, 'D', 'About 98%', NULL, 4);

  -- Q30: probabilistic - Bakery Production Lines
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Bakery Production Lines', 'probabilistic'::dm_question_type, 'A bakery uses two ovens. Oven A bakes 70% of all loaves with a 2% rate of being undercooked. Oven B bakes the remaining 30% with a 6% rate of being undercooked.

What is the probability that a randomly selected loaf is undercooked?', NULL, NULL, 'A', 'P(undercooked) = P(undercooked|A) × P(A) + P(undercooked|B) × P(B) = 0.02 × 0.70 + 0.06 × 0.30 = 0.014 + 0.018 = 0.032 = 3.2%.', 30, 'normal')
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', '3.2%', NULL, 1),
    (v_q30, 'B', '4.0%', NULL, 2),
    (v_q30, 'C', '4.6%', NULL, 3),
    (v_q30, 'D', '5.2%', NULL, 4);

  -- Q31: probabilistic - Language Course Enrolment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Language Course Enrolment', 'probabilistic'::dm_question_type, 'In a language school with 150 students, 90 enrolled in a speaking course and 85 enrolled in a writing course. 50 students enrolled in both courses.

What is the probability that a randomly selected student who enrolled in the speaking course also enrolled in the writing course?', NULL, NULL, 'B', 'This is a conditional probability question. P(writing | speaking) = P(both) / P(speaking) = 50/90 = 5/9 = 0.556 = 56%.', 31, 'normal')
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', '33%', NULL, 1),
    (v_q31, 'B', '56%', NULL, 2),
    (v_q31, 'C', '59%', NULL, 3),
    (v_q31, 'D', '67%', NULL, 4);

  -- Q32: probabilistic - Ticket Raffle Draw
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Ticket Raffle Draw', 'probabilistic'::dm_question_type, 'A raffle contains 8 gold tickets, 12 silver tickets, and 5 bronze tickets. Two tickets are drawn at random without replacement.

What is the probability that both tickets are the same colour?', NULL, NULL, 'A', 'Total ways to pick 2 from 25 = C(25,2) = 300. Both gold: C(8,2) = 28. Both silver: C(12,2) = 66. Both bronze: C(5,2) = 10. Same colour = 28+66+10 = 104. Probability = 104/300 = 26/75.', 32, 'normal')
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', '26/75', NULL, 1),
    (v_q32, 'B', '52/300', NULL, 2),
    (v_q32, 'C', '1/3', NULL, 3),
    (v_q32, 'D', '23/75', NULL, 4);

  -- Q33: probabilistic - Train and Bus Delays
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Train and Bus Delays', 'probabilistic'::dm_question_type, 'On any given morning, there is a 20% chance of heavy traffic. When there is heavy traffic, there is a 70% chance of a bus delay. When there is no heavy traffic, there is a 15% chance of a bus delay.

What is the probability of experiencing a bus delay on a randomly chosen morning?', NULL, NULL, 'B', 'P(delay) = P(delay|traffic) × P(traffic) + P(delay|no traffic) × P(no traffic) = 0.70 × 0.20 + 0.15 × 0.80 = 0.14 + 0.12 = 0.26 = 26%.', 33, 'normal')
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', '14%', NULL, 1),
    (v_q33, 'B', '26%', NULL, 2),
    (v_q33, 'C', '35%', NULL, 3),
    (v_q33, 'D', '42%', NULL, 4);

  -- Q34: probabilistic - Card and Coin Game
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Card and Coin Game', 'probabilistic'::dm_question_type, 'A game involves drawing a card from a standard 52-card deck and flipping a fair coin. A player wins if they draw an ace OR the coin lands on heads (or both).

What is the probability that a player wins?', NULL, NULL, 'B', 'P(ace) = 4/52 = 1/13. P(heads) = 1/2. P(both) = 1/13 × 1/2 = 1/26. P(win) = P(ace) + P(heads) - P(both) = 1/13 + 1/2 - 1/26 = 2/26 + 13/26 - 1/26 = 14/26 = 7/13.', 34, 'hard')
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q34, 'A', '15/26', NULL, 1),
    (v_q34, 'B', '7/13', NULL, 2),
    (v_q34, 'C', '29/52', NULL, 3),
    (v_q34, 'D', '27/52', NULL, 4);

  -- Q35: probabilistic - Warehouse Quality Inspection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (3,'Warehouse Quality Inspection', 'probabilistic'::dm_question_type, 'A warehouse receives shipments from three suppliers. Supplier X provides 50% of items with a 4% defect rate. Supplier Y provides 30% of items with a 6% defect rate. Supplier Z provides 20% of items with a 3% defect rate.

What percentage of all items in the warehouse are defective?', NULL, NULL, 'B', 'P(defective) = P(defective|X) × P(X) + P(defective|Y) × P(Y) + P(defective|Z) × P(Z) = 0.04 × 0.50 + 0.06 × 0.30 + 0.03 × 0.20 = 0.020 + 0.018 + 0.006 = 0.044 = 4.4%.', 35, 'normal')
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', '3.4%', NULL, 1),
    (v_q35, 'B', '4.4%', NULL, 2),
    (v_q35, 'C', '5.0%', NULL, 3),
    (v_q35, 'D', '4.0%', NULL, 4);

END $$;
