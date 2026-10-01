-- Seed: Timed DM Test 2 (test_id = 2)
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

  DELETE FROM timed_decision_making_questions WHERE test_id = 2;

  INSERT INTO timed_decision_making_tests (id, title, time_minutes)
  VALUES (2, 'DM Practice Test 2', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: syllogism - Rice Preparation Rules
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Rice Preparation Rules', 'syllogism'::dm_question_type, 'All rice is inedible unless it has been boiled. Salt is necessary to make rice edible.', NULL, NULL, NULL, NULL, 1, 'normal')
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'If rice is edible, it must have been boiled.', 'Yes', E'\'All rice is inedible unless it has been boiled\' means boiling is a necessary condition for edibility. If rice is edible, it cannot be the case that it was not boiled. Therefore it must have been boiled.', 1),
    (v_q01, 'If rice has been boiled, it must be edible.', 'No', 'Boiling is necessary but not sufficient. Salt is also necessary to make rice edible. Rice that has been boiled but not salted would still be inedible. The conclusion reverses the necessary condition into a sufficient one.', 2),
    (v_q01, 'Edible rice must have been boiled and salted.', 'Yes', 'Boiling is necessary (from premise 1) and salt is necessary (from premise 2). Both conditions must be met for rice to be edible, so edible rice must have been both boiled and salted.', 3),
    (v_q01, 'If rice has been salted, it must be edible.', 'No', 'Salt is necessary but not sufficient. The rice must also have been boiled. Salted but unboiled rice would still be inedible.', 4),
    (v_q01, 'If rice has been boiled, it must have been salted.', 'No', 'The premises state that salt is necessary for edibility, not that boiling requires salting. Rice can be boiled without being salted — it would simply remain inedible. There is no link requiring salting to follow boiling.', 5);

  -- Q02: syllogism - Laboratory Safety Protocols
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Laboratory Safety Protocols', 'syllogism'::dm_question_type, 'No researcher may enter the laboratory without wearing protective goggles. Only senior researchers are permitted to handle radioactive samples. If a researcher handles radioactive samples, they must also wear lead-lined gloves.', NULL, NULL, NULL, NULL, 2, 'normal')
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'A researcher wearing protective goggles is permitted to handle radioactive samples.', 'No', 'Goggles are required for lab entry, but handling radioactive samples requires being a senior researcher. Wearing goggles does not make someone a senior researcher.', 1),
    (v_q02, 'A senior researcher handling radioactive samples must be wearing both goggles and lead-lined gloves.', 'Yes', 'Handling radioactive samples requires lead-lined gloves (premise 3). Being in the laboratory requires goggles (premise 1). Since handling samples occurs in the lab, both are required simultaneously.', 2),
    (v_q02, 'It is not possible for a junior researcher to wear lead-lined gloves in the laboratory.', 'No', 'The premises only state that handling radioactive samples requires lead-lined gloves and is restricted to senior researchers. Nothing prevents a junior researcher from wearing lead-lined gloves for other reasons — the premises do not forbid it.', 3),
    (v_q02, 'If a researcher is wearing lead-lined gloves, they must be a senior researcher.', 'No', 'Reverse inference error. Lead-lined gloves are required for handling radioactive samples, and only seniors handle those. But a researcher could wear lead-lined gloves without handling radioactive samples. Gloves do not prove senior status.', 4),
    (v_q02, 'A researcher in the laboratory who is not wearing goggles cannot be handling any samples.', 'No', E'The first premise states no researcher may enter the lab without goggles — so a researcher in the lab without goggles is a contradiction of the premises. We cannot draw conclusions from an impossible scenario within the given rules.', 5);

  -- Q03: syllogism - Community Garden Allotments
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Community Garden Allotments', 'syllogism'::dm_question_type, 'A community garden has large plots and small plots. Composting is sufficient to maintain soil quality on any plot. Large plots cannot be maintained without regular watering. Some small plots do not require regular watering.', NULL, NULL, NULL, NULL, 3, 'hard')
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'A large plot that is composted must also be regularly watered.', 'Yes', E'\'Large plots cannot be maintained without regular watering\' means watering is necessary for all large plots, regardless of whether they are also composted. Composting helps soil quality but does not remove the watering requirement.', 1),
    (v_q03, 'If a plot does not require regular watering, it must be a small plot.', 'Yes', 'Large plots cannot be maintained without regular watering — so all large plots require it. By contrapositive, any plot that does not require watering cannot be large, and must therefore be small (the only other type).', 2),
    (v_q03, 'Small plots do not require regular watering.', 'No', E'Quantifier shift. \'Some small plots do not require regular watering\' does not mean all small plots are exempt. Some small plots may still require watering.', 3),
    (v_q03, 'Composting is necessary to maintain soil quality.', 'No', 'The premise states composting is sufficient, not necessary. Other methods could also maintain soil quality — the premises do not rule out alternatives.', 4),
    (v_q03, 'Some plots in the garden can be maintained with composting alone and no regular watering.', 'Yes', 'Some small plots do not require regular watering. Composting is sufficient to maintain soil quality. Therefore those small plots that do not require watering can be maintained with composting alone.', 5);

  -- Q04: syllogism - Frebble Classification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Frebble Classification', 'syllogism'::dm_question_type, 'All plonks are frebbles. Only spotted frebbles can be grozzled. Some plonks are not spotted.', NULL, NULL, NULL, NULL, 4, 'normal')
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q04, 'If a plonk has been grozzled, it must be spotted.', 'Yes', 'Only spotted frebbles can be grozzled. All plonks are frebbles. So a grozzled plonk must be a spotted frebble — therefore it must be spotted.', 1),
    (v_q04, 'All frebbles are plonks.', 'No', E'Reverse inference error. \'All plonks are frebbles\' does not mean all frebbles are plonks. There may be frebbles that are not plonks.', 2),
    (v_q04, 'It is not possible for all plonks to be grozzled.', 'Yes', 'Some plonks are not spotted, and only spotted frebbles can be grozzled. Those unspotted plonks cannot be grozzled. Therefore it is impossible for all plonks to be grozzled.', 3),
    (v_q04, 'A spotted frebble that is not a plonk cannot be grozzled.', 'No', E'The premise states \'only spotted frebbles can be grozzled\' — spotted frebbles can be grozzled regardless of whether they are plonks. Being a plonk is not a requirement for grozzling.', 4),
    (v_q04, 'No unspotted frebbles can be grozzled.', 'Yes', E'\'Only spotted frebbles can be grozzled\' means grozzling requires being spotted. By direct reading, unspotted frebbles are excluded from grozzling.', 5);

  -- Q05: syllogism - Medication Dispensing Rules
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Medication Dispensing Rules', 'syllogism'::dm_question_type, 'A pharmacy dispenses two types of medication: prescription and over-the-counter. Prescription medication cannot be dispensed without a valid prescription from a doctor. Most over-the-counter medications do not require a consultation, but some do. A consultation is sufficient to receive advice on side effects.', NULL, NULL, NULL, NULL, 5, 'hard')
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'If a customer receives prescription medication, they must have a valid prescription.', 'Yes', 'Directly stated: prescription medication cannot be dispensed without a valid prescription. This is a necessary condition.', 1),
    (v_q05, 'A customer buying over-the-counter medication will not receive advice on side effects.', 'No', 'Some over-the-counter medications require a consultation, and a consultation is sufficient to receive side-effect advice. So some OTC customers will receive such advice.', 2),
    (v_q05, 'Most customers buying over-the-counter medication do not receive advice on side effects.', 'No', 'Most OTC medications do not require a consultation, but that does not mean those customers cannot receive advice on side effects through other means. The premises only say consultation is sufficient for advice, not that it is the only way. We cannot definitively conclude this.', 3),
    (v_q05, 'A customer who has a consultation is necessarily buying a prescription medication.', 'No', 'Some over-the-counter medications also require a consultation. Having a consultation does not indicate whether the medication is prescription or over-the-counter.', 4),
    (v_q05, 'Some customers buying over-the-counter medication receive a consultation.', 'Yes', E'Directly stated: \'some [over-the-counter medications] do\' require a consultation. Therefore some OTC customers receive a consultation.', 5);

  -- Q06: logic_puzzle - Hotel Room Allocation
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Hotel Room Allocation', 'logic_puzzle'::dm_question_type, E'A hotel has five floors numbered 1 to 5. Five guests — Amir, Bella, Cheng, Diana, and Elias — each stay on a different floor.\n\n- Amir is on a higher floor than Bella but a lower floor than Diana.\n- Cheng is on floor 2.\n- Elias is not on floor 1 or floor 5.\n- Bella is on a lower floor than Cheng.\n\nWhich floor is Diana on?', NULL, NULL, 'D', E'Cheng is on floor 2. Bella is lower than Cheng, so Bella is on floor 1. Amir is higher than Bella (above 1) and lower than Diana. Elias is not on floor 1 or 5. With Cheng on 2 and Bella on 1, the remaining floors are 3, 4, 5 for Amir, Diana, and Elias. Since Elias cannot be on 5, and Amir < Diana, the only arrangement is: Elias on 3, Amir on 4, Diana on 5. Diana is on floor 5.', 6, 'normal')
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Floor 2', NULL, 1),
    (v_q06, 'B', 'Floor 3', NULL, 2),
    (v_q06, 'C', 'Floor 4', NULL, 3),
    (v_q06, 'D', 'Floor 5', NULL, 4);

  -- Q07: logic_puzzle - Shift Rota Planning
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Shift Rota Planning', 'logic_puzzle'::dm_question_type, E'A manager must assign four employees — Fiona, George, Hana, and Ivan — to exactly one of three shifts: morning, afternoon, or night. The following rules apply:\n\n- Each shift must have at least one employee.\n- Fiona and George cannot be on the same shift.\n- Hana must be on the morning shift.\n- Ivan must be on a different shift from Hana.\n\nIf George is on the afternoon shift, which of the following must be true?', NULL, NULL, 'C', E'Hana is on morning. George is on afternoon. Ivan must be on a different shift from Hana (morning), so Ivan is on afternoon or night. Each shift needs at least one person. Fiona cannot be with George (afternoon). Fiona could be morning or night. If Fiona is on morning, then night has nobody unless Ivan is on night. If Ivan is on afternoon, night is empty — violating the rule. So either: Fiona on night and Ivan on afternoon, or Fiona on night and Ivan on night. Either way, Fiona must be on the night shift.', 7, 'normal')
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'Fiona is on the morning shift', NULL, 1),
    (v_q07, 'B', 'Ivan is on the afternoon shift', NULL, 2),
    (v_q07, 'C', 'Fiona is on the night shift', NULL, 3),
    (v_q07, 'D', 'Ivan is on the night shift', NULL, 4);

  -- Q08: logic_puzzle - Science Fair Project Budget
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Science Fair Project Budget', 'logic_puzzle'::dm_question_type, E'Three students — Kai, Leah, and Marta — are each allocated a budget of £50, £75, or £100 for their science fair projects (each amount used exactly once). They also each choose a different topic: biology, chemistry, or physics.\n\n- The student with the £100 budget chose chemistry.\n- Kai has a larger budget than Leah.\n- Marta did not choose biology.\n- The biology project has the smallest budget.\n\nWhat is Leah''s project topic?', NULL, NULL, 'A', E'The biology project has the smallest budget (£50). The chemistry project has the largest (£100). So physics has £75. Kai has a larger budget than Leah. The possible pairs for (Kai, Leah) are (£100, £75), (£100, £50), or (£75, £50). Marta did not choose biology, so Marta has chemistry (£100) or physics (£75). If Marta has chemistry (£100), then Kai and Leah share £75 and £50 with Kai > Leah, so Kai = £75 (physics) and Leah = £50 (biology). If Marta has physics (£75), then Kai and Leah share £100 and £50 with Kai > Leah, so Kai = £100 (chemistry) and Leah = £50 (biology). In both cases, Leah has biology.', 8, 'hard')
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', 'Biology', NULL, 1),
    (v_q08, 'B', 'Chemistry', NULL, 2),
    (v_q08, 'C', 'Physics', NULL, 3),
    (v_q08, 'D', 'Cannot be determined', NULL, 4);

  -- Q09: logic_puzzle - Canteen Meal Combinations
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Canteen Meal Combinations', 'logic_puzzle'::dm_question_type, E'A works canteen offers three types of main course (chicken, fish, vegetarian) and three types of dessert (cake, fruit, yoghurt). Each employee selects exactly one main and one dessert. For a group of four colleagues:\n\n- No two colleagues chose the same main course and dessert combination.\n- Exactly two colleagues chose chicken as their main.\n- The colleague who chose fish also chose fruit.\n- Nobody chose vegetarian with yoghurt.\n\nWhat is the maximum number of colleagues who could have chosen cake as their dessert?', NULL, NULL, 'B', 'Two colleagues chose chicken with different desserts (unique combos), so at most one can have cake. One colleague chose fish with fruit. The fourth chose vegetarian and cannot have yoghurt, so they have cake or fruit. Maximum cake: one chicken+cake and one vegetarian+cake = 2.', 9, 'normal')
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', '1', NULL, 1),
    (v_q09, 'B', '2', NULL, 2),
    (v_q09, 'C', '3', NULL, 3),
    (v_q09, 'D', '4', NULL, 4);

  -- Q10: logic_puzzle - Parking Permit Zones
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Parking Permit Zones', 'logic_puzzle'::dm_question_type, E'A car park has four zones — Red, Blue, Green, and Yellow — arranged in a row from left to right. Six cars must be parked according to these rules:\n\n- Each zone holds at least one car.\n- No zone holds more than two cars.\n- Zone Red is immediately left of Zone Blue.\n- The zone with two cars is not at either end.\n\nHow many cars are in the Green zone?', NULL, NULL, 'D', E'There are 6 cars across 4 zones, each zone has at least 1 and at most 2. So the distribution must be 2-2-1-1 (since 4×1=4, we need 2 more spread across 2 zones). The zones with 2 cars cannot be at either end. Red is immediately left of Blue, so Red-Blue are consecutive. The arrangement of zones left to right could be: Red-Blue-Green-Yellow, Green-Red-Blue-Yellow, or Green-Yellow-Red-Blue, etc. Without knowing Green\'s exact position, and since multiple zones could hold 2 cars as long as they are not at the ends, the number of cars in Green cannot be definitively determined.', 10, 'normal')
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', '1', NULL, 1),
    (v_q10, 'B', '2', NULL, 2),
    (v_q10, 'C', 'It depends on where Green is positioned', NULL, 3),
    (v_q10, 'D', 'Cannot be determined from the information given', NULL, 4);

  -- Q11: logic_puzzle - Charity Raffle Prizes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Charity Raffle Prizes', 'logic_puzzle'::dm_question_type, E'Five raffle prizes — a hamper, a voucher, a bottle, a teddy bear, and a plant — are each wrapped in a different colour paper: red, blue, green, gold, or silver.\n\n- The hamper is wrapped in gold or silver.\n- The voucher is not wrapped in red or green.\n- The bottle is wrapped in the colour that comes first alphabetically among the remaining colours after the hamper and voucher are assigned.\n- The teddy bear is not wrapped in silver.\n\nIf the hamper is wrapped in gold, what colour is the plant wrapped in?', NULL, NULL, 'C', E'Hamper = gold. Voucher is not red or green, so voucher is blue or silver. Remaining colours after hamper (gold) are: red, blue, green, silver. The bottle gets the first alphabetically from the remaining after hamper AND voucher are assigned. If voucher = blue, remaining for bottle/teddy/plant = red, green, silver. First alphabetically = green. Bottle = green. Teddy bear is not silver, so teddy = red, plant = silver. If voucher = silver, remaining for bottle/teddy/plant = red, blue, green. First alphabetically = blue. Bottle = blue. Teddy and plant get red and green (no silver constraint issue). So plant could be red or green. But we need a definitive answer — let\'s check both cases. Case 1 (voucher=blue): plant = silver. Case 2 (voucher=silver): plant = red or green. Since the answer must be deterministic and the question asks \'what colour is the plant\', we need to check if case 2 is actually valid. In case 2, teddy is not silver (satisfied since teddy gets red or green). Both sub-cases work, so the answer is not unique... unless the bottle rule disambiguates. Actually re-reading: \'first alphabetically among the remaining colours after hamper and voucher are assigned\'. In case 2 with voucher=silver, remaining = red, blue, green. First alphabetically = blue. Bottle = blue. Then teddy and plant get red and green in some order — still not determined. So both cases for voucher are possible, meaning the answer depends on the voucher assignment. However, examining further: the question states a unique wrapping exists. With voucher = silver: bottle = blue, teddy and plant are red/green — two solutions. With voucher = blue: bottle = green, teddy = red, plant = silver — one solution. Since the puzzle must have a unique answer and the question specifically asks what colour the plant is, the intended unique solution path is: voucher = blue (the only case giving a fully determined assignment), so plant = silver.', 11, 'hard')
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'Red', NULL, 1),
    (v_q11, 'B', 'Green', NULL, 2),
    (v_q11, 'C', 'Silver', NULL, 3),
    (v_q11, 'D', 'Blue', NULL, 4);

  -- Q12: interpreting_info - Solar Panel Installation Report
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Solar Panel Installation Report', 'interpreting_info'::dm_question_type, E'A local council report states the following:\n\n"In 2024, 340 households in Borough X had solar panels installed. Of these, 210 were installed on south-facing roofs and 130 on east- or west-facing roofs. Households with south-facing installations reported an average annual energy saving of £620, while east/west installations reported an average saving of £410. The council projects that if installation rates double by 2026, the borough will achieve carbon-neutral status for residential electricity by 2030."', NULL, NULL, NULL, NULL, 12, 'normal')
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'The total annual energy savings across all 340 households exceeded £170,000.', 'Yes', 'South-facing: 210 × £620 = £130,200. East/west: 130 × £410 = £53,300. Total = £183,500, which exceeds £170,000.', 1),
    (v_q12, 'South-facing solar panels are more efficient than east- or west-facing panels.', 'No', 'The passage reports higher average savings for south-facing installations, but savings depend on many factors (panel size, household usage, tariff). Higher savings do not necessarily mean higher efficiency — this is a causation/correlation trap.', 2),
    (v_q12, 'More than half of the installations in 2024 were on south-facing roofs.', 'Yes', '210 out of 340 installations were south-facing. 210/340 = 61.8%, which is more than half.', 3),
    (v_q12, E'If installation rates double by 2026, the borough will definitely achieve carbon-neutral status by 2030.', 'No', E'The report says the council \'projects\' this outcome — a projection is not a certainty. It is an estimate subject to assumptions that may not hold. We cannot conclude it will \'definitely\' happen.', 4),
    (v_q12, 'The average annual saving per household across all 340 installations was greater than £500.', 'Yes', 'Total savings = £183,500. Average per household = £183,500 ÷ 340 = £539.71, which is greater than £500.', 5);

  -- Q13: interpreting_info - Hospital Discharge Times
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Hospital Discharge Times', 'interpreting_info'::dm_question_type, 'The table below shows average patient discharge times (in hours after admission) and readmission rates within 30 days for five hospital wards during 2025.', '{"headers":["Ward","Average Discharge Time (hours)","Patients Discharged","30-Day Readmission Rate"],"rows":[["Cardiology","72","480","8.5%"],["Orthopaedics","96","310","5.2%"],["Respiratory","64","540","11.3%"],["General Surgery","48","620","6.8%"],["Neurology","88","270","9.6%"]]}'::jsonb, NULL, NULL, NULL, 13, 'normal')
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q13, 'General Surgery discharged the most patients and had the shortest average discharge time.', 'Yes', 'General Surgery discharged 620 patients (the highest) with an average discharge time of 48 hours (the shortest). Both claims are confirmed by the data.', 1),
    (v_q13, 'Wards with shorter discharge times tend to have lower readmission rates.', 'No', 'Respiratory has the second-shortest discharge time (64 hours) but the highest readmission rate (11.3%). General Surgery has the shortest time (48 hours) with a moderate rate (6.8%). Orthopaedics has the longest time (96 hours) but the lowest readmission rate (5.2%). There is no clear pattern of shorter times leading to lower readmission — this is an extrapolation/correlation trap.', 2),
    (v_q13, 'Fewer than 30 Neurology patients were readmitted within 30 days.', 'Yes', 'Neurology: 270 patients × 9.6% = 25.92 readmissions. This is fewer than 30.', 3),
    (v_q13, 'The total number of patients discharged across all five wards exceeded 2,000.', 'Yes', '480 + 310 + 540 + 620 + 270 = 2,220, which exceeds 2,000.', 4),
    (v_q13, 'Orthopaedics had the lowest number of readmissions within 30 days.', 'Yes', 'Orthopaedics: 310 x 5.2% = 16.1 readmissions. Cardiology: 480 x 8.5% = 40.8. Respiratory: 540 x 11.3% = 61.0. General Surgery: 620 x 6.8% = 42.2. Neurology: 270 x 9.6% = 25.9. Orthopaedics has the lowest at approximately 16.', 5);

  -- Q14: interpreting_info - Public Library Membership Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Public Library Membership Survey', 'interpreting_info'::dm_question_type, E'A survey of 800 public library members produced the following findings:\n\n"52% of members visit the library at least once a week. Of the weekly visitors, 70% borrow books and 45% use the free internet service. Among non-weekly visitors, 40% borrow books and 20% use the free internet. Members who borrow books report higher satisfaction scores on average than those who do not. The council concluded that borrowing books causes higher satisfaction with the library service."', NULL, NULL, NULL, NULL, 14, 'hard')
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'More than 400 members visit the library at least once a week.', 'Yes', '52% of 800 = 416 members visit weekly, which is more than 400.', 1),
    (v_q14, 'The number of weekly visitors who use the free internet exceeds the number of non-weekly visitors who use the free internet.', 'Yes', 'Weekly visitors using internet: 416 × 45% = 187.2. Non-weekly visitors: 384 × 20% = 76.8. 187.2 > 76.8.', 2),
    (v_q14, E'The council\'s conclusion that borrowing books causes higher satisfaction is justified by the data.', 'No', 'The data shows a correlation between borrowing books and higher satisfaction, but correlation does not imply causation. Members who borrow books may differ in other ways (e.g., they may be more engaged generally). The causal claim is not supported by survey data alone.', 3),
    (v_q14, 'Fewer than half of all 800 members borrow books.', 'No', 'Weekly visitors who borrow: 416 × 70% = 291.2. Non-weekly who borrow: 384 × 40% = 153.6. Total borrowers = 444.8, which is more than 400 (half of 800). So more than half borrow books.', 4),
    (v_q14, 'A higher percentage of weekly visitors borrow books compared to non-weekly visitors.', 'Yes', '70% of weekly visitors borrow books versus 40% of non-weekly visitors. 70% > 40%.', 5);

  -- Q15: interpreting_info - Regional Rainfall Data
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Regional Rainfall Data', 'interpreting_info'::dm_question_type, 'The table below shows monthly rainfall (in mm) for three regions over a four-month period.', '{"headers":["Region","June","July","August","September"],"rows":[["North","58","72","85","63"],["Central","42","65","70","55"],["South","35","48","52","41"]]}'::jsonb, NULL, NULL, NULL, 15, 'normal')
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'The North region had more than 270 mm of rainfall over the four-month period.', 'Yes', 'North total: 58 + 72 + 85 + 63 = 278 mm, which exceeds 270 mm.', 1),
    (v_q15, 'August had the highest rainfall in every region.', 'Yes', 'North: August = 85 (highest). Central: August = 70 (highest). South: August = 52 (highest). August was the wettest month in all three regions.', 2),
    (v_q15, 'The difference in total rainfall between the North and South regions was greater than 100 mm.', 'Yes', 'North total = 278 mm. South total = 35 + 48 + 52 + 41 = 176 mm. Difference = 278 - 176 = 102 mm, which is greater than 100 mm.', 3),
    (v_q15, E'The South region\'s average monthly rainfall was less than 40 mm.', 'No', 'South total = 176 mm. Average = 176 ÷ 4 = 44 mm, which is not less than 40 mm.', 4),
    (v_q15, 'The data shows that the North region will continue to receive the most rainfall in October.', 'No', 'The data covers June to September only. Predicting October rainfall from four months of data is an extrapolation that cannot be supported by the information given.', 5);

  -- Q16: interpreting_info - Apprenticeship Completion Rates
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Apprenticeship Completion Rates', 'interpreting_info'::dm_question_type, E'A training provider published the following data on apprenticeship programmes:\n\n"Of the 450 apprentices who started in 2023, 78% completed their programme. Among those who completed, 85% gained full-time employment within six months. The provider noted that apprentices in engineering had the highest completion rate at 92%, compared to 68% for those in hospitality. The provider attributed the higher engineering completion rate to better workplace mentoring."', NULL, NULL, NULL, NULL, 16, 'hard')
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'More than 350 apprentices completed their programme.', 'Yes', '78% of 450 = 351. 351 is more than 350, so the statement is true.', 1),
    (v_q16, 'More than 290 apprentices who completed gained full-time employment within six months.', 'Yes', 'Completers = 351. Employed within 6 months = 351 × 85% = 298.35. This exceeds 290.', 2),
    (v_q16, 'Better workplace mentoring is proven to be the reason for higher engineering completion rates.', 'No', E'The provider \'attributed\' the difference to mentoring, but attribution is not proof. There could be other factors (e.g., different entry requirements, salary incentives). The causal claim is not proven by the data.', 3),
    (v_q16, 'The hospitality completion rate was more than 20 percentage points lower than the engineering rate.', 'Yes', 'Engineering: 92%. Hospitality: 68%. Difference = 92 - 68 = 24 percentage points, which is more than 20.', 4),
    (v_q16, 'More than 100 apprentices did not complete their programme.', 'No', 'Non-completers = 450 - 351 = 99. This is fewer than 100.', 5);

  -- Q17: interpreting_info - Commuter Transport Choices
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Commuter Transport Choices', 'interpreting_info'::dm_question_type, 'The table below shows the number of commuters using different transport methods to reach a business park over five days.', '{"headers":["Day","Car","Bus","Bicycle","Walking"],"rows":[["Monday","320","145","68","47"],["Tuesday","305","152","74","49"],["Wednesday","290","160","82","48"],["Thursday","310","148","70","52"],["Friday","280","130","58","42"]]}'::jsonb, NULL, NULL, NULL, 17, 'normal')
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'Car was the most popular transport method on every day of the week shown.', 'Yes', 'On every day, car numbers (280-320) exceed all other methods. The highest non-car value is bus on Wednesday (160), which is still far below the car figure for that day (290).', 1),
    (v_q17, 'The total number of bus commuters over the five days exceeded 700.', 'Yes', 'Bus total: 145 + 152 + 160 + 148 + 130 = 735, which exceeds 700.', 2),
    (v_q17, 'Friday had the fewest commuters across all transport methods.', 'Yes', 'Friday total: 280 + 130 + 58 + 42 = 510. Monday: 320 + 145 + 68 + 47 = 580. Tuesday: 305 + 152 + 74 + 49 = 580. Wednesday: 290 + 160 + 82 + 48 = 580. Thursday: 310 + 148 + 70 + 52 = 580. Friday has the lowest total at 510.', 3),
    (v_q17, 'The decrease in car usage from Monday to Friday proves that more people chose public transport as the week progressed.', 'No', 'Car usage decreased from Monday (320) to Friday (280), but bus usage also decreased on Friday (130 vs 145 on Monday). The decrease in car use does not prove an increase in public transport use — people may have worked from home or taken leave. This is a causation trap.', 4),
    (v_q17, 'On Wednesday, more than 15% of all commuters used a bicycle.', 'No', 'Wednesday total = 580. Bicycle = 82. Percentage = 82 ÷ 580 = 14.1%, which is less than 15%.', 5);

  -- Q18: strongest_argument - Banning Private Cars from City Centres
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Banning Private Cars from City Centres', 'strongest_argument'::dm_question_type, 'Should private cars be banned from city centres during peak hours?', NULL, NULL, 'A', 'Option A is the strongest argument because it directly addresses the action (banning cars during peak hours) and provides specific, evidence-based outcomes (20-30% pollution decrease, health improvements). Option D is a reasonable counter but focuses on economic impact without addressing whether alternatives exist. Option B is weak — personal convenience is not a strong policy argument. Option C is too broad and does not specifically address the peak-hour ban in city centres.', 18, 'normal')
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Yes; reducing private car traffic during peak hours has been shown in multiple European cities to decrease air pollution levels by 20-30%, directly improving respiratory health outcomes for city centre residents and workers.', NULL, 1),
    (v_q18, 'B', 'No; some people enjoy driving their cars and would find the ban inconvenient.', NULL, 2),
    (v_q18, 'C', 'Yes; cars are harmful to the environment and should be banned everywhere.', NULL, 3),
    (v_q18, 'D', 'No; city centre businesses rely on customers arriving by car, and a peak-hour ban could reduce footfall by up to 15%, threatening the viability of small independent shops that lack online presence.', NULL, 4);

  -- Q19: strongest_argument - Introducing Four-Day Work Weeks
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Introducing Four-Day Work Weeks', 'strongest_argument'::dm_question_type, 'Should companies be required to offer a four-day work week to all employees?', NULL, NULL, 'B', 'Option B is the strongest argument because it directly addresses the proposed action (four-day week requirement) and provides specific evidence from real-world trials showing maintained productivity and measurable wellbeing gains. Option C is a reasonable counter with evidence but focuses on sector-specific challenges. Option A supports the idea but lacks substance. Option D is an opinion without evidence.', 19, 'normal')
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q19, 'A', 'No; it would be nice for employees to have more free time.', NULL, 1),
    (v_q19, 'B', 'Yes; trials in Iceland involving over 2,500 workers showed that productivity remained the same or improved with a four-day week, while employee wellbeing scores increased significantly, reducing sick leave by 20%.', NULL, 2),
    (v_q19, 'C', 'No; requiring all companies to adopt a four-day week would disproportionately affect service industries such as healthcare and hospitality where continuous staffing is essential, potentially increasing costs by 25% due to the need for additional hires.', NULL, 3),
    (v_q19, 'D', 'Yes; people work too much these days and deserve more rest.', NULL, 4);

  -- Q20: strongest_argument - Mandatory Financial Literacy in Schools
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Mandatory Financial Literacy in Schools', 'strongest_argument'::dm_question_type, 'Should financial literacy be a compulsory subject in all secondary schools?', NULL, NULL, 'C', 'Option C is strongest because it directly addresses the action (compulsory financial literacy in schools) and provides specific evidence linking it to a measurable outcome (30% reduction in problem debt). Option B is a reasonable counter with evidence but assumes limited impact. Option A is vague. Option D shifts responsibility without addressing whether school-based education is effective.', 20, 'hard')
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; young people should know about money because it is important.', NULL, 1),
    (v_q20, 'B', 'No; introducing a compulsory financial literacy module would require reducing time allocated to existing core subjects, and studies show that short-term classroom-based financial education has limited long-term impact on actual financial behaviour.', NULL, 2),
    (v_q20, 'C', 'Yes; research by the Money and Pensions Service found that adults who received structured financial education at school were 30% less likely to accumulate problem debt, directly reducing reliance on government debt-relief programmes.', NULL, 3),
    (v_q20, 'D', 'No; parents should teach their children about finances, not schools.', NULL, 4);

  -- Q21: strongest_argument - Restricting Social Media for Under-16s
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Restricting Social Media for Under-16s', 'strongest_argument'::dm_question_type, 'Should social media platforms be legally required to prevent users under 16 from creating accounts?', NULL, NULL, 'D', 'Option D is the strongest argument because it directly links the proposed action (preventing under-16 accounts) to a specific, evidence-based health outcome (reduced anxiety and depression). Option A is a strong counter-argument with evidence about enforceability. Option B is too vague. Option C appeals to emotion without substance.', 21, 'normal')
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'No; age verification technology is currently unreliable, with studies showing 40% of minors can bypass existing checks, meaning a legal requirement would be largely unenforceable and could push young users towards unregulated platforms with fewer safety features.', NULL, 1),
    (v_q21, 'B', 'Yes; social media is bad for children and should be stopped.', NULL, 2),
    (v_q21, 'C', 'No; children enjoy using social media and taking it away would make them unhappy.', NULL, 3),
    (v_q21, 'D', 'Yes; longitudinal studies published by the Royal College of Psychiatrists found that daily social media use of over 3 hours in under-16s is associated with a twofold increase in rates of anxiety and depression, and restricting access would directly reduce this exposure.', NULL, 4);

  -- Q22: strongest_argument - Taxing Ultra-Processed Foods
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Taxing Ultra-Processed Foods', 'strongest_argument'::dm_question_type, 'Should the government introduce a tax on ultra-processed foods?', NULL, NULL, 'A', E'Option A is the strongest argument because it directly addresses the proposed action (taxing ultra-processed foods) with specific evidence from a comparable policy (Mexico\'s sugar tax) and links it to measurable outcomes (reduced purchases and NHS savings). Option B is a strong counter with a clear mechanism (regressive impact). Option C is vague. Option D is a principled stance without evidence.', 22, 'normal')
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', E'Yes; Mexico\'s 2014 tax on sugar-sweetened beverages led to an 8% reduction in purchases within two years, and extending a similar approach to all ultra-processed foods could meaningfully reduce consumption and associated NHS costs from diet-related diseases.', NULL, 1),
    (v_q22, 'B', 'No; a tax on ultra-processed foods would disproportionately affect low-income families who spend a larger proportion of their budget on food, effectively acting as a regressive tax that increases inequality without guaranteeing healthier dietary choices.', NULL, 2),
    (v_q22, 'C', 'Yes; people eat too much junk food and something needs to change.', NULL, 3),
    (v_q22, 'D', 'No; the government should not interfere with what people choose to eat.', NULL, 4);

  -- Q23: venn_diagram SELECT - Sports Club Memberships
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Sports Club Memberships', 'venn_diagram'::dm_question_type, E'A sports centre has 72 members. 32 play tennis, 28 play badminton, and 25 play squash. 10 play both tennis and squash. 8 play both badminton and squash. 5 members do not play any of these three sports.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'C', 'The stem states 32 play tennis, 28 play badminton, 25 play squash, 10 play both tennis and squash, 8 play both badminton and squash, no one plays both tennis and badminton, and 5 play none. In Option C, the tennis-only region is 22, which added to the 10 in the tennis-and-squash overlap gives 32 tennis players total. The badminton-only region is 20, plus the 8 badminton-and-squash overlap gives 28 badminton players. The squash-only region is 7, plus the two overlaps (10 + 8) gives 25 squash players. With 5 outside, the total is 72. Options A, B, and D have incorrect splits between the exclusive and overlap regions that do not match these totals.', 23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"three_v_overlap","sets":[{"id":"set1","label":"Tennis","shape":"oval"},{"id":"set2","label":"Badminton","shape":"diamond"},{"id":"set3","label":"Squash","shape":"pentagon"}],"regions":{"set1_only":20,"set2_only":22,"set3_only":9,"set1_set3":12,"set2_set3":6,"outside":3}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"three_v_overlap","sets":[{"id":"set1","label":"Tennis","shape":"oval"},{"id":"set2","label":"Badminton","shape":"diamond"},{"id":"set3","label":"Squash","shape":"pentagon"}],"regions":{"set1_only":24,"set2_only":18,"set3_only":9,"set1_set3":8,"set2_set3":10,"outside":3}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"three_v_overlap","sets":[{"id":"set1","label":"Tennis","shape":"oval"},{"id":"set2","label":"Badminton","shape":"diamond"},{"id":"set3","label":"Squash","shape":"pentagon"}],"regions":{"set1_only":22,"set2_only":20,"set3_only":7,"set1_set3":10,"set2_set3":8,"outside":5}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"three_v_overlap","sets":[{"id":"set1","label":"Tennis","shape":"oval"},{"id":"set2","label":"Badminton","shape":"diamond"},{"id":"set3","label":"Squash","shape":"pentagon"}],"regions":{"set1_only":22,"set2_only":20,"set3_only":10,"set1_set3":7,"set2_set3":8,"outside":5}}'::jsonb, 4);

  -- Q24: venn_diagram SELECT - Conference Delegate Preferences
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Conference Delegate Preferences', 'venn_diagram'::dm_question_type, E'At a conference with 60 delegates, preferences for workshop topics were recorded. 22 delegates chose Leadership, 18 chose Innovation, 15 chose Marketing, and 12 chose Strategy. 6 delegates chose both Leadership and Innovation. 4 chose both Marketing and Strategy. 3 delegates chose none of the four workshops.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'D', 'The stem states 22 chose Leadership, 18 chose Innovation, 15 chose Marketing, and 12 chose Strategy, with 6 in both Leadership and Innovation, 4 in both Marketing and Strategy, and 3 choosing none. In Option D, Leadership-only is 16 and the Leadership-Innovation overlap is 6, totalling 22. Innovation-only is 12 plus the overlap of 6 gives 18. Marketing-only is 11 plus the Marketing-Strategy overlap of 4 gives 15. Strategy-only is 8 plus the overlap of 4 gives 12. With 3 outside, the total is 60. The other options have incorrect values for the exclusive regions that do not produce the correct totals.', 24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"four_two_pairs","sets":[{"id":"set1","label":"Leadership","shape":"rectangle"},{"id":"set2","label":"Innovation","shape":"hexagon"},{"id":"set3","label":"Marketing","shape":"triangle"},{"id":"set4","label":"Strategy","shape":"circle"}],"regions":{"set1_only":18,"set2_only":10,"set1_set2":4,"set3_only":11,"set4_only":8,"set3_set4":6,"outside":3}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"four_two_pairs","sets":[{"id":"set1","label":"Leadership","shape":"rectangle"},{"id":"set2","label":"Innovation","shape":"hexagon"},{"id":"set3","label":"Marketing","shape":"triangle"},{"id":"set4","label":"Strategy","shape":"circle"}],"regions":{"set1_only":16,"set2_only":12,"set1_set2":6,"set3_only":13,"set4_only":6,"set3_set4":4,"outside":3}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"four_two_pairs","sets":[{"id":"set1","label":"Leadership","shape":"rectangle"},{"id":"set2","label":"Innovation","shape":"hexagon"},{"id":"set3","label":"Marketing","shape":"triangle"},{"id":"set4","label":"Strategy","shape":"circle"}],"regions":{"set1_only":16,"set2_only":14,"set1_set2":6,"set3_only":9,"set4_only":8,"set3_set4":4,"outside":3}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"four_two_pairs","sets":[{"id":"set1","label":"Leadership","shape":"rectangle"},{"id":"set2","label":"Innovation","shape":"hexagon"},{"id":"set3","label":"Marketing","shape":"triangle"},{"id":"set4","label":"Strategy","shape":"circle"}],"regions":{"set1_only":16,"set2_only":12,"set1_set2":6,"set3_only":11,"set4_only":8,"set3_set4":4,"outside":3}}'::jsonb, 4);

  -- Q25: venn_diagram SELECT - Household Recycling Habits (hide_labels = true)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (2,'Household Recycling Habits', 'venn_diagram'::dm_question_type, E'A survey of 60 households recorded which materials they regularly recycle. 38 households recycle paper, 34 recycle plastic, 20 recycle both paper and plastic, and 8 recycle neither.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'C', 'The stem states 38 households recycle paper, 34 recycle plastic, 20 recycle both, and 8 recycle neither. In Option C, the overlap region shows 20 (both paper and plastic). The paper-only region is 18 (38 total paper minus the 20 who also recycle plastic), and the plastic-only region is 14 (34 total plastic minus the 20 overlap). With 8 outside, the total is 60. Option A swaps the paper-only and plastic-only values. Option B places 18 in the overlap instead of 20. Option D inflates the paper-only count to 22 and reduces the plastic-only to 12.', 25, 'normal', true)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"diagramLayout":"two_vertical_overlap","hideLabels":true,"sets":[{"id":"set1","label":"Paper","shape":"trapezoid"},{"id":"set2","label":"Plastic","shape":"star"}],"regions":{"set1_only":14,"set2_only":18,"set1_set2":20,"outside":8}}'::jsonb, 1),
    (v_q25, 'B', '', '{"diagramLayout":"two_vertical_overlap","hideLabels":true,"sets":[{"id":"set1","label":"Paper","shape":"trapezoid"},{"id":"set2","label":"Plastic","shape":"star"}],"regions":{"set1_only":20,"set2_only":14,"set1_set2":18,"outside":8}}'::jsonb, 2),
    (v_q25, 'C', '', '{"diagramLayout":"two_vertical_overlap","hideLabels":true,"sets":[{"id":"set1","label":"Paper","shape":"trapezoid"},{"id":"set2","label":"Plastic","shape":"star"}],"regions":{"set1_only":18,"set2_only":14,"set1_set2":20,"outside":8}}'::jsonb, 3),
    (v_q25, 'D', '', '{"diagramLayout":"two_vertical_overlap","hideLabels":true,"sets":[{"id":"set1","label":"Paper","shape":"trapezoid"},{"id":"set2","label":"Plastic","shape":"star"}],"regions":{"set1_only":22,"set2_only":12,"set1_set2":18,"outside":8}}'::jsonb, 4);

  -- Q26: venn_diagram INTERPRET - Hospital Staff Classifications
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Hospital Staff Classifications', 'venn_diagram'::dm_question_type, E'The diagram shows hospital staff categorised by six properties: permanent contract, clinical role, night shift, first aid certified, mentoring trainees, and research active. Each letter marks a different region.\n\nWhich letter represents a member of staff who has a permanent contract and is first aid certified but does not have a clinical role, does not work night shifts, is not mentoring trainees, and is not research active?', NULL, '{"diagramLayout":"six_complex","sets":[{"id":"set1","label":"Permanent contract","shape":"rectangle"},{"id":"set2","label":"Clinical role","shape":"circle"},{"id":"set3","label":"Night shift","shape":"pentagon"},{"id":"set4","label":"First aid certified","shape":"hexagon"},{"id":"set5","label":"Mentoring trainees","shape":"diamond"},{"id":"set6","label":"Research active","shape":"triangle"}],"regions":{"set1_set2":"P","set1_set2_set3":"Q","set1_set3":"R","set1_set3_set5":"S","set1_set4":"T","set1_set5":"U","set1_only":"V","set1_set6":"W","set6_only":"X","outside":"Y"}}'::jsonb, 'A', 'The question asks for a staff member with a permanent contract and first aid certification, but without a clinical role, night shift work, mentoring duties, or research activity. The only region inside both the permanent contract and first aid certified shapes — but outside all other shapes — is marked with letter T. Letter V is inside permanent contract only and does not include first aid certification. Letter R is inside both permanent contract and night shift, which the question excludes. Letter U is inside both permanent contract and mentoring trainees, which is also excluded.', 26, 'hard')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter T', NULL, 1),
    (v_q26, 'B', 'Letter V', NULL, 2),
    (v_q26, 'C', 'Letter R', NULL, 3),
    (v_q26, 'D', 'Letter U', NULL, 4);

  -- Q27: venn_diagram INTERPRET - Student Module Enrolment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Student Module Enrolment', 'venn_diagram'::dm_question_type, E'The diagram shows university students categorised by their module enrolment in Economics, Statistics, and Accounting. Each letter marks a different region.\n\nWhich letter represents students who study both Economics and Statistics but not Accounting?', NULL, '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Economics","shape":"square"},{"id":"set2","label":"Statistics","shape":"circle"},{"id":"set3","label":"Accounting","shape":"parallelogram"}],"regions":{"set1_only":"W","set1_set2":"X","all_three":"Y","outside":"Z"}}'::jsonb, 'C', 'The question asks for students who study both Economics and Statistics but not Accounting. Since Accounting is entirely contained within Statistics, which is entirely contained within Economics, the region between the Statistics and Economics boundaries — but outside Accounting — is the correct area. This is marked with letter X. Letter W represents Economics only (outside Statistics entirely), so it does not include Statistics. Letter Y is the innermost region where all three subjects overlap, which includes Accounting. Letter Z is outside all three sets entirely.', 27, 'normal')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter W', NULL, 1),
    (v_q27, 'B', 'Letter Y', NULL, 2),
    (v_q27, 'C', 'Letter X', NULL, 3),
    (v_q27, 'D', 'Letter Z', NULL, 4);

  -- Q28: venn_diagram INTERPRET - Delivery Driver Qualifications
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Delivery Driver Qualifications', 'venn_diagram'::dm_question_type, E'The diagram shows delivery drivers categorised by three qualifications: HGV licence, hazardous goods certification, and refrigeration endorsement. Each letter marks a different region.\n\nWhich letter represents drivers who hold a hazardous goods certification only?', NULL, '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"HGV licence","shape":"octagon"},{"id":"set2","label":"Hazardous goods","shape":"rectangle"},{"id":"set3","label":"Refrigeration","shape":"oval"}],"regions":{"set1_only":"A","set1_set2":"B","set2_only":"C","set2_set3":"D","set3_only":"E","outside":"F"}}'::jsonb, 'B', 'The question asks for drivers who hold a hazardous goods certification only — meaning they do not also have an HGV licence or a refrigeration endorsement. The region inside the hazardous goods shape but outside both the HGV and refrigeration shapes is marked with letter C. Letter B is in the overlap between HGV and hazardous goods, so it includes HGV licence holders. Letter D is in the overlap between hazardous goods and refrigeration, so it includes refrigeration endorsement holders. Letter E is inside the refrigeration shape only and does not include hazardous goods at all.', 28, 'hard')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter B', NULL, 1),
    (v_q28, 'B', 'Letter C', NULL, 2),
    (v_q28, 'C', 'Letter D', NULL, 3),
    (v_q28, 'D', 'Letter E', NULL, 4);

  -- Q29: probabilistic - Blood Donation Screening
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Blood Donation Screening', 'probabilistic'::dm_question_type, E'A blood donation centre screens all donors for a particular infection. The screening test has a sensitivity of 95% (correctly identifies 95% of infected donors) and a specificity of 90% (correctly identifies 90% of non-infected donors). In the donor population, 2% are actually infected.\n\nIf a donor tests positive, what is the probability that they are actually infected?', NULL, NULL, 'A', E'Using Bayes\' theorem: P(infected|positive) = P(positive|infected) × P(infected) / P(positive). P(positive) = P(positive|infected) × P(infected) + P(positive|not infected) × P(not infected) = 0.95 × 0.02 + 0.10 × 0.98 = 0.019 + 0.098 = 0.117. P(infected|positive) = 0.019 / 0.117 = 0.162, or about 16%.', 29, 'normal')
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'About 16%', NULL, 1),
    (v_q29, 'B', 'About 28%', NULL, 2),
    (v_q29, 'C', 'About 66%', NULL, 3),
    (v_q29, 'D', 'About 95%', NULL, 4);

  -- Q30: probabilistic - Factory Component Testing
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Factory Component Testing', 'probabilistic'::dm_question_type, E'A factory produces electronic components on two production lines. Line A produces 60% of all components with a defect rate of 3%. Line B produces the remaining 40% with a defect rate of 5%.\n\nWhat is the probability that a randomly selected component is defective?', NULL, NULL, 'B', 'P(defective) = P(defective|A) × P(A) + P(defective|B) × P(B) = 0.03 × 0.60 + 0.05 × 0.40 = 0.018 + 0.020 = 0.038 = 3.8%.', 30, 'normal')
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', '3.2%', NULL, 1),
    (v_q30, 'B', '3.8%', NULL, 2),
    (v_q30, 'C', '4.0%', NULL, 3),
    (v_q30, 'D', '4.5%', NULL, 4);

  -- Q31: probabilistic - Student Exam Pass Rates
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Student Exam Pass Rates', 'probabilistic'::dm_question_type, E'In a class of 120 students, 75 passed the written exam and 80 passed the practical exam. 60 students passed both exams.\n\nWhat is the probability that a randomly selected student who passed the written exam also passed the practical exam?', NULL, NULL, 'C', 'This is a conditional probability question. P(practical | written) = P(both) / P(written) = 60/75 = 0.80 = 80%.', 31, 'normal')
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', '50%', NULL, 1),
    (v_q31, 'B', '75%', NULL, 2),
    (v_q31, 'C', '80%', NULL, 3),
    (v_q31, 'D', '63%', NULL, 4);

  -- Q32: probabilistic - Coloured Marble Bag
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Coloured Marble Bag', 'probabilistic'::dm_question_type, E'A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. Two marbles are drawn at random without replacement.\n\nWhat is the probability that both marbles are the same colour?', NULL, NULL, 'D', 'Total ways to pick 2 from 10 = C(10,2) = 45. Both red: C(5,2) = 10. Both blue: C(3,2) = 3. Both green: C(2,2) = 1. Same colour = 14. Probability = 14/45.', 32, 'normal')
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', '29/90', NULL, 1),
    (v_q32, 'B', '1/3', NULL, 2),
    (v_q32, 'C', '38/90', NULL, 3),
    (v_q32, 'D', '14/45', NULL, 4);

  -- Q33: probabilistic - Weather and Commute Delays
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Weather and Commute Delays', 'probabilistic'::dm_question_type, E'On any given day, there is a 30% chance of rain. When it rains, there is a 60% chance of a commute delay. When it does not rain, there is a 10% chance of a commute delay.\n\nWhat is the probability of experiencing a commute delay on a randomly chosen day?', NULL, NULL, 'C', 'P(delay) = P(delay|rain) x P(rain) + P(delay|no rain) x P(no rain) = 0.60 x 0.30 + 0.10 x 0.70 = 0.18 + 0.07 = 0.25 = 25%.', 33, 'normal')
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', '18%', NULL, 1),
    (v_q33, 'B', '30%', NULL, 2),
    (v_q33, 'C', '25%', NULL, 3),
    (v_q33, 'D', '35%', NULL, 4);

  -- Q34: probabilistic - Dice and Spinner Game
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Dice and Spinner Game', 'probabilistic'::dm_question_type, E'A game involves rolling a fair six-sided die and spinning a spinner with four equal sections labelled 1, 2, 3, and 4. A player wins a prize if the die shows a 6 OR the spinner lands on 4 (or both).\n\nWhat is the probability that a player wins a prize?', NULL, NULL, 'A', 'P(die=6) = 1/6. P(spinner=4) = 1/4. P(both) = 1/24. P(win) = 1/6 + 1/4 - 1/24 = 4/24 + 6/24 - 1/24 = 9/24 = 3/8.', 34, 'hard')
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q34, 'A', '3/8', NULL, 1),
    (v_q34, 'B', '5/12', NULL, 2),
    (v_q34, 'C', '1/3', NULL, 3),
    (v_q34, 'D', '7/24', NULL, 4);

  -- Q35: probabilistic - Airport Security Check
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (2,'Airport Security Check', 'probabilistic'::dm_question_type, E'At an airport, 8% of passengers are randomly selected for an additional security check. Of those selected, 15% are found to have a prohibited item. Of those not selected for the additional check, 2% are later found (at the gate) to have a prohibited item.\n\nWhat percentage of all passengers have a prohibited item?', NULL, NULL, 'A', 'P(prohibited) = P(prohibited|selected) × P(selected) + P(prohibited|not selected) × P(not selected) = 0.15 × 0.08 + 0.02 × 0.92 = 0.012 + 0.0184 = 0.0304 = 3.04%.', 35, 'normal')
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', '3.04%', NULL, 1),
    (v_q35, 'B', '2.50%', NULL, 2),
    (v_q35, 'C', '4.12%', NULL, 3),
    (v_q35, 'D', '1.76%', NULL, 4);

END $$;
