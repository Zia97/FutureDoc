-- Refresh: Timed DM Test 2 (test_id = 2)
-- Replaces all 35 questions with new content

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

  -- Q01: Satellites and Orbits (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Satellites and Orbits', 'syllogism'::dm_question_type, 'All geostationary satellites orbit at 36,000 km. Some satellites are used for weather monitoring. No low-orbit satellite is geostationary.', NULL, NULL, NULL, NULL, 1)
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'Some weather-monitoring satellites orbit at 36,000 km.', 'No', 'Some satellites monitor weather, but we do not know whether any of those weather-monitoring satellites are geostationary. They could all be non-geostationary satellites orbiting at other altitudes.', 1),
    (v_q01, 'No low-orbit satellite orbits at 36,000 km.', 'Yes', 'No low-orbit satellite is geostationary, and all geostationary satellites orbit at 36,000 km. Since low-orbit satellites are not geostationary, and only geostationary satellites are stated to orbit at 36,000 km, low-orbit satellites do not orbit at that altitude. (Note: we cannot assume non-geostationary satellites orbit there, as the premise links 36,000 km exclusively to geostationary satellites.)', 2),
    (v_q01, 'All satellites that orbit at 36,000 km are geostationary.', 'No', 'The premise states all geostationary satellites orbit at 36,000 km — not the reverse. Other satellite types could theoretically also orbit at 36,000 km. This reverses the universal statement.', 3),
    (v_q01, 'No geostationary satellite is low-orbit.', 'Yes', 'No low-orbit satellite is geostationary. By the symmetry of universal negative statements, no geostationary satellite is low-orbit.', 4),
    (v_q01, 'Some geostationary satellites monitor weather.', 'No', 'Some satellites monitor weather, but we cannot determine which satellites those are. The weather-monitoring satellites may all be non-geostationary. This does not follow from the premises.', 5);

  -- Q02: Gym Class Attendance (interpreting_info)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Gym Class Attendance', 'interpreting_info'::dm_question_type, 'A gym recorded attendance for four classes across a full week.', '{"headers":["Class","Monday","Tuesday","Wednesday","Thursday","Friday"],"rows":[["Yoga","28","32","25","30","35"],["Spinning","40","35","38","42","30"],["Pilates","22","25","20","24","28"],["Boxing","35","30","33","36","25"]]}'::jsonb, NULL, NULL, NULL, 2)
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'Spinning had the highest attendance on Monday.', 'Yes', 'Monday attendance: Yoga 28, Spinning 40, Pilates 22, Boxing 35. Spinning at 40 is the highest.', 1),
    (v_q02, 'Yoga attendance increased every day of the week.', 'No', 'Yoga: Monday 28, Tuesday 32, Wednesday 25. Attendance dropped from 32 to 25 on Wednesday, so it did not increase every day.', 2),
    (v_q02, 'Pilates consistently had the lowest attendance.', 'No', 'Monday: Pilates 22 (lowest). Tuesday: Pilates 25 (lowest). Wednesday: Pilates 20 (lowest). Thursday: Pilates 24 (lowest). However, on Friday: Pilates 28 but Boxing 25. Boxing had the lowest attendance on Friday, not Pilates.', 3),
    (v_q02, 'Boxing attendance peaked on Thursday.', 'Yes', 'Boxing: Monday 35, Tuesday 30, Wednesday 33, Thursday 36, Friday 25. Thursday at 36 is the highest.', 4),
    (v_q02, 'Total Friday attendance exceeded 120.', 'No', 'Friday total: 35 + 30 + 28 + 25 = 118. This is less than 120.', 5);

  -- Q03: UK Gig Economy (syllogism/passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'UK Gig Economy', 'syllogism'::dm_question_type, E'The UK''s gig economy employed an estimated 4.4 million workers by 2024. The Supreme Court ruled in 2021 that Uber drivers were ''workers'' entitled to minimum wage and holiday pay, not self-employed contractors. The government proposed a new employment status of ''dependent contractor'' to bridge the gap between employment and self-employment. Trade unions argued this did not go far enough, calling for full employment rights for all gig workers. Platform companies warned that reclassifying workers would increase costs by 20–30%, potentially leading to reduced job availability. A survey by the Work Foundation found that 60% of gig workers valued flexibility as their primary reason for gig work. The Department for Business reported that gig economy disputes at employment tribunals had increased by 40% since 2019.', NULL, NULL, NULL, NULL, 3)
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'More than 5 million workers were in the gig economy by 2024.', 'No', 'The passage states the gig economy employed an estimated 4.4 million workers by 2024, which is fewer than 5 million.', 1),
    (v_q03, 'The Supreme Court ruled Uber drivers were employees.', 'No', 'The Court ruled Uber drivers were ''workers'' — a distinct legal status from ''employees'' in UK law. The ruling specifically distinguished them from self-employed contractors, not classified them as employees.', 2),
    (v_q03, 'Platform companies warned reclassification would increase costs.', 'Yes', 'The passage states platform companies warned that reclassifying workers would increase costs by 20–30%.', 3),
    (v_q03, 'Fewer than half of gig workers valued flexibility as their primary reason for gig work.', 'No', 'The Work Foundation survey found that 60% of gig workers valued flexibility as their primary reason — more than half, not fewer.', 4),
    (v_q03, 'Gig economy tribunal disputes increased after 2019.', 'Yes', 'The Department for Business reported that gig economy disputes at employment tribunals had increased by 40% since 2019.', 5);

  -- Q04: Bakery Delivery Route (logic_puzzle)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Bakery Delivery Route', 'logic_puzzle'::dm_question_type, E'A bakery delivers to five shops – Alder, Birch, Cedar, Daisy, and Elm – one after another in positions 1st to 5th.\n\n• Cedar is delivered to 3rd.\n• Alder is delivered to before Birch.\n• Elm is not delivered to 1st or 5th.\n• Daisy is delivered to immediately before Elm.\n\nWhich position is Alder delivered to?', NULL, NULL, 'C', 'Cedar = 3rd. Elm is not 1st or 5th, so Elm could be 2nd or 4th. Daisy is immediately before Elm. If Daisy = 1st and Elm = 2nd: remaining positions 4th and 5th for Alder and Birch. Alder before Birch gives Alder = 4th, Birch = 5th. This works. If Daisy = 3rd, Elm = 4th: Cedar is already 3rd. Conflict. If Daisy = 4th, Elm = 5th: Elm cannot be 5th. The only solution is Daisy(1st), Elm(2nd), Cedar(3rd), Alder(4th), Birch(5th).', 4)
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q04, 'A', '1st', NULL, 1),
    (v_q04, 'B', '2nd', NULL, 2),
    (v_q04, 'C', '4th', NULL, 3),
    (v_q04, 'D', '5th', NULL, 4);

  -- Q05: Banning Advertising to Children Under 12 (strongest_argument)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Banning Advertising to Children Under 12', 'strongest_argument'::dm_question_type, 'All advertising directed at children under 12 should be banned.', NULL, NULL, 'A', 'Option A is the strongest argument because it identifies a specific cognitive vulnerability — children under 12 cannot distinguish advertising from factual content — which directly supports the age-based cutoff in the proposal. Option B raises a practical funding concern but does not address the harm. Option C relies on an appeal to other countries'' practices. Option D shifts responsibility without addressing the vulnerability.', 5)
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q05, 'A', 'Yes; children under 12 lack the cognitive ability to distinguish advertising from factual content, making them vulnerable to commercial manipulation.', NULL, 1),
    (v_q05, 'B', 'No; advertising funds free children''s television programming, and banning it would reduce the quantity and quality of content available.', NULL, 2),
    (v_q05, 'C', 'Yes; countries like Sweden have banned child-directed advertising with no negative impact on their economy.', NULL, 3),
    (v_q05, 'D', 'No; parents should be responsible for managing what their children see, not the government.', NULL, 4);

  -- Q06: Camping Equipment (venn_diagram SELECT, three_all_overlap_v2)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Camping Equipment', 'venn_diagram'::dm_question_type, E'A camping retailer surveyed 48 customers. 7 own Tents only, 5 own Stoves only, 6 own Lanterns only, 4 own Tents and Stoves only, 3 own Tents and Lanterns only, 5 own Stoves and Lanterns only, 8 own all three, and 10 own none.\n\nThe diamond represents Tents, the isosceles_triangle represents Stoves, and the parallelogram represents Lanterns.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'The correct distribution is: Tents only = 7, Stoves only = 5, Lanterns only = 6, Tents ∩ Stoves = 4, Tents ∩ Lanterns = 3, Stoves ∩ Lanterns = 5, all three = 8, outside = 10. Total = 48. Option B swaps Tent-Stove and Tent-Lantern overlaps (4 and 3). Option C swaps Tent-only and Stove-only (7 and 5). Option D swaps the all-three and Stove-Lantern values (8 and 5).', 6)
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', '', '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"Tents","shape":"diamond"},{"id":"set2","label":"Stoves","shape":"isosceles_triangle"},{"id":"set3","label":"Lanterns","shape":"parallelogram"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":6,"set1_set2":4,"set1_set3":3,"set2_set3":5,"all_three":8,"outside":10}}'::jsonb, 1),
    (v_q06, 'B', '', '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"Tents","shape":"diamond"},{"id":"set2","label":"Stoves","shape":"isosceles_triangle"},{"id":"set3","label":"Lanterns","shape":"parallelogram"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":6,"set1_set2":3,"set1_set3":4,"set2_set3":5,"all_three":8,"outside":10}}'::jsonb, 2),
    (v_q06, 'C', '', '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"Tents","shape":"diamond"},{"id":"set2","label":"Stoves","shape":"isosceles_triangle"},{"id":"set3","label":"Lanterns","shape":"parallelogram"}],"regions":{"set1_only":5,"set2_only":7,"set3_only":6,"set1_set2":4,"set1_set3":3,"set2_set3":5,"all_three":8,"outside":10}}'::jsonb, 3),
    (v_q06, 'D', '', '{"diagramLayout":"three_all_overlap_v2","sets":[{"id":"set1","label":"Tents","shape":"diamond"},{"id":"set2","label":"Stoves","shape":"isosceles_triangle"},{"id":"set3","label":"Lanterns","shape":"parallelogram"}],"regions":{"set1_only":7,"set2_only":5,"set3_only":6,"set1_set2":4,"set1_set3":3,"set2_set3":8,"all_three":5,"outside":10}}'::jsonb, 4);

  -- Q07: Blood Donation Compatibility (probabilistic)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Blood Donation Compatibility', 'probabilistic'::dm_question_type, 'A blood bank has 500 donors: 44% are type O, 42% are type A, 10% are type B, and 4% are type AB. A hospital needs type O or type B blood.', NULL, NULL, 'B', 'Type O donors: 500 × 0.44 = 220. Type B donors: 500 × 0.10 = 50. Type AB donors: 500 × 0.04 = 20. Compatible (O + B): 220 + 50 = 270. Option A: 270 is not more than 280, so A is wrong. Option B: exactly 220 type O donors — correct. Option C: 20 AB donors is not more than 25, so C is wrong. Option D: there are exactly 50 type B donors, not fewer than 50, so D is wrong.', 7)
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', 'More than 280 donors are either type O or type B.', NULL, 1),
    (v_q07, 'B', 'There are exactly 220 type O donors.', NULL, 2),
    (v_q07, 'C', 'Type AB donors number more than 25.', NULL, 3),
    (v_q07, 'D', 'Fewer than 50 donors are type B.', NULL, 4);

  -- Q08: Software and Licences (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Software and Licences', 'syllogism'::dm_question_type, 'All commercial software requires a licence. No freeware requires a licence. Some software is developed by volunteers.', NULL, NULL, NULL, NULL, 8)
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q08, 'No freeware is commercial software.', 'Yes', 'All commercial software requires a licence, and no freeware requires a licence. Since commercial software must have a licence and freeware cannot, no software can be both freeware and commercial.', 1),
    (v_q08, 'Some software developed by volunteers is freeware.', 'No', 'We know some software is developed by volunteers, but the premises do not tell us whether any volunteer-developed software is freeware. It may or may not be.', 2),
    (v_q08, 'All software that requires a licence is commercial.', 'No', 'The premise states all commercial software requires a licence — not the reverse. Other non-commercial software (e.g. proprietary non-commercial tools) might also require a licence.', 3),
    (v_q08, 'No commercial software is freeware.', 'Yes', 'This is the same conclusion as statement 1 rephrased. By the symmetry of universal negatives, if no freeware is commercial then no commercial software is freeware.', 4),
    (v_q08, 'Some volunteer-developed software requires a licence.', 'No', 'We do not know which category volunteer-developed software falls into. It could be commercial, freeware, or neither. The premises give no information to determine this.', 5);

  -- Q09: UK Prison Reform (syllogism/passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'UK Prison Reform', 'syllogism'::dm_question_type, E'England and Wales had a prison population of approximately 87,000 in 2024, one of the highest incarceration rates in Western Europe. The government introduced an early release scheme allowing certain prisoners to be freed after serving 40% of their sentence, rather than the usual 50%, to ease overcrowding. The Chief Inspector of Prisons reported that violence in prisons had increased by 14% over two years and that 30% of inspected prisons were rated as being of serious concern. Rehabilitation programmes, including education and employment training, were available in fewer than half of prisons due to staffing shortages. Reoffending rates remained stubbornly high at 25% within one year of release. The Howard League for Penal Reform argued that community sentences, such as electronic tagging and supervised programmes, were more effective at reducing reoffending and significantly cheaper than imprisonment. The Prison Officers'' Association warned that reducing sentence lengths without investment in supervision would increase risk to the public.', NULL, NULL, NULL, NULL, 9)
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q09, 'The prison population exceeded 90,000 in 2024.', 'No', 'The passage states the prison population was approximately 87,000 in 2024, which is below 90,000.', 1),
    (v_q09, 'Early release allowed some prisoners to leave after serving 40% of their sentence.', 'Yes', 'The passage states the government introduced an early release scheme allowing certain prisoners to be freed after serving 40% of their sentence.', 2),
    (v_q09, 'Rehabilitation programmes were available in more than half of prisons.', 'No', 'The passage states rehabilitation programmes were available in fewer than half of prisons due to staffing shortages.', 3),
    (v_q09, 'Reoffending rates within one year were below 20%.', 'No', 'The passage states reoffending rates remained at 25% within one year of release, which is above 20%.', 4),
    (v_q09, 'The Howard League argued community sentences cost less than imprisonment.', 'Yes', 'The passage states the Howard League argued that community sentences were significantly cheaper than imprisonment.', 5);

  -- Q10: Supermarket Weekly Sales (interpreting_info)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Supermarket Weekly Sales', 'interpreting_info'::dm_question_type, 'A supermarket chain recorded weekly sales figures (in thousands of pounds) by category and region.', '{"headers":["Region","Fruit (£k)","Vegetables (£k)","Dairy (£k)","Bakery (£k)"],"rows":[["North","48","52","38","30"],["South","62","58","45","35"],["East","40","44","32","28"],["West","55","50","42","33"]]}'::jsonb, NULL, NULL, NULL, 10)
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q10, 'South had the highest sales in every category.', 'Yes', 'Fruit: South 62 (highest). Vegetables: South 58 (highest). Dairy: South 45 (highest). Bakery: South 35 (highest). South leads in every category.', 1),
    (v_q10, 'East had the lowest sales in every category.', 'Yes', 'Fruit: East 40 (lowest). Vegetables: East 44 (lowest). Dairy: East 32 (lowest). Bakery: East 28 (lowest). East is lowest in every category.', 2),
    (v_q10, 'Vegetables outsold Fruit in every region.', 'No', 'North: Vegetables 52 > Fruit 48. South: Vegetables 58 < Fruit 62. Vegetables did not outsell Fruit in the South region.', 3),
    (v_q10, 'Total Dairy sales exceeded £150k.', 'Yes', 'Total Dairy: 38 + 45 + 32 + 42 = 157. This exceeds 150.', 4),
    (v_q10, 'West sold more Bakery than North.', 'Yes', 'West Bakery = 33, North Bakery = 30. West sold more.', 5);

  -- Q11: Tournament Bracket (logic_puzzle)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Tournament Bracket', 'logic_puzzle'::dm_question_type, E'Four players – Kai, Lena, Max, and Nina – play matches in order from 1st to 4th.\n\n• Lena plays in the 2nd match.\n• Max plays before Kai.\n• Nina does not play in the 1st match.\n• Kai plays in the last match.\n\nWhich position is Nina in?', NULL, NULL, 'B', 'Lena = 2nd. Kai = 4th (last). Max must play before Kai, so Max is in 1st or 3rd. Nina is not 1st, so Nina = 3rd and Max = 1st. Order: Max(1st), Lena(2nd), Nina(3rd), Kai(4th).', 11)
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', '1st', NULL, 1),
    (v_q11, 'B', '3rd', NULL, 2),
    (v_q11, 'C', '2nd', NULL, 3),
    (v_q11, 'D', '4th', NULL, 4);

  -- Q12: Speed Limiters in All New Cars (strongest_argument)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Speed Limiters in All New Cars', 'strongest_argument'::dm_question_type, 'All new cars sold in the UK should have mandatory speed limiters fitted.', NULL, NULL, 'B', 'Option B is the strongest argument because it identifies a specific safety risk — the inability to accelerate when overtaking or merging onto motorways — that is directly caused by the proposed technology. Option A supports the proposal but relies on a broad estimate. Option C makes a vague moral judgement. Option D deflects to other safety features without addressing speed limiters directly.', 12)
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q12, 'A', 'Yes; speed limiters would reduce the severity of accidents and save an estimated 2,000 lives per year on European roads according to EU safety assessments.', NULL, 1),
    (v_q12, 'B', 'No; speed limiters could create dangerous situations when overtaking or merging onto motorways where acceleration is needed for safety.', NULL, 2),
    (v_q12, 'C', 'Yes; drivers who want to speed are acting irresponsibly and technology should prevent them.', NULL, 3),
    (v_q12, 'D', 'No; the automotive industry should focus on improving overall vehicle safety features rather than restricting performance.', NULL, 4);

  -- Q13: Textile Properties (venn_diagram INTERPRET, two_vertical_overlap)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Textile Properties', 'venn_diagram'::dm_question_type, E'The diagram shows fabrics categorised by their properties. The hexagon represents Waterproof fabrics and the star represents Breathable fabrics. Each letter marks a different region.\n\nWhich letter represents fabrics that are both Waterproof and Breathable?', NULL, '{"diagramLayout":"two_vertical_overlap","sets":[{"id":"set1","label":"Waterproof","shape":"hexagon"},{"id":"set2","label":"Breathable","shape":"star"}],"regions":{"set1_only":"W","set1_set2":"X","set2_only":"Y","outside":"Z"}}'::jsonb, 'B', 'The hexagon is Waterproof and the star is Breathable. The overlap region X is inside both shapes — representing fabrics that are both Waterproof and Breathable. W is Waterproof only. Y is Breathable only. Z is neither.', 13)
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q13, 'A', 'Letter W', NULL, 1),
    (v_q13, 'B', 'Letter X', NULL, 2),
    (v_q13, 'C', 'Letter Y', NULL, 3),
    (v_q13, 'D', 'Letter Z', NULL, 4);

  -- Q14: Luggage Screening (probabilistic)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Luggage Screening', 'probabilistic'::dm_question_type, 'An airport screens 3,000 bags per day. 2% of bags contain prohibited items. The scanner detects 96% of prohibited items but gives a false alarm on 4% of clean bags.', NULL, NULL, 'B', 'Prohibited bags: 3,000 × 0.02 = 60. Detected prohibited (true positive): 60 × 0.96 = 57.6. Clean bags: 2,940. False alarms: 2,940 × 0.04 = 117.6. Total flagged: 57.6 + 117.6 = 175.2. Option A: 57.6 detected, not fewer than 50 — wrong. Option B: total flagged ≈ 175, which is more than 150 — correct. Option C: P(prohibited | flagged) = 57.6/175.2 ≈ 32.9%, not greater than 50% — wrong. Option D: missed prohibited = 60 − 57.6 = 2.4, not fewer than 2 — wrong.', 14)
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q14, 'A', 'Fewer than 50 prohibited items are detected by the scanner.', NULL, 1),
    (v_q14, 'B', 'More than 150 bags are flagged in total.', NULL, 2),
    (v_q14, 'C', 'A flagged bag has a greater than 50% chance of containing prohibited items.', NULL, 3),
    (v_q14, 'D', 'The scanner misses fewer than 2 prohibited bags.', NULL, 4);

  -- Q15: Diamonds and Gemstones (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Diamonds and Gemstones', 'syllogism'::dm_question_type, 'Some diamonds are colourless. All colourless diamonds are valued highly. No synthetic diamond is colourless.', NULL, NULL, NULL, NULL, 15)
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, 'Some diamonds are valued highly.', 'Yes', 'Some diamonds are colourless, and all colourless diamonds are valued highly. Therefore those colourless diamonds are valued highly — so at least some diamonds are valued highly.', 1),
    (v_q15, 'All diamonds are colourless.', 'No', 'The premise states only some diamonds are colourless, not all. Many diamonds have colour.', 2),
    (v_q15, 'No synthetic diamond is valued highly.', 'No', 'No synthetic diamond is colourless, and all colourless diamonds are valued highly. However, synthetic diamonds could be valued highly for other reasons (e.g. clarity, cut). The premises only link colourlessness to high value.', 3),
    (v_q15, 'Some things valued highly are diamonds.', 'Yes', 'Some diamonds are valued highly (from statement 1). By conversion, some things valued highly are diamonds.', 4),
    (v_q15, 'All colourless things are diamonds.', 'No', 'The premises discuss colourless diamonds specifically. Other gemstones (e.g. sapphires) can also be colourless. This is not established by the premises.', 5);

  -- Q16: Power Station Output (interpreting_info)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Power Station Output', 'interpreting_info'::dm_question_type, 'A report recorded monthly electricity output (in GWh) for four UK power stations.', '{"headers":["Station","January (GWh)","February (GWh)","March (GWh)","April (GWh)"],"rows":[["Drax","580","540","500","480"],["Hinkley","420","420","420","420"],["Dinorwig","150","180","120","160"],["Sizewell","350","360","370","380"]]}'::jsonb, NULL, NULL, NULL, 16)
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'Drax output decreased every month.', 'Yes', 'Drax: January 580, February 540, March 500, April 480. Each month is lower than the previous.', 1),
    (v_q16, 'Hinkley output was constant across all four months.', 'Yes', 'Hinkley: 420 in every month. The output did not change.', 2),
    (v_q16, 'Sizewell output increased every month.', 'Yes', 'Sizewell: January 350, February 360, March 370, April 380. Each month is higher than the previous.', 3),
    (v_q16, 'Dinorwig had the lowest output every month.', 'Yes', 'January: Dinorwig 150 (lowest). February: Dinorwig 180 (lowest). March: Dinorwig 120 (lowest). April: Dinorwig 160 (lowest).', 4),
    (v_q16, 'Total output in April exceeded 1,500 GWh.', 'No', 'April total: 480 + 420 + 160 + 380 = 1,440. This is less than 1,500.', 5);

  -- Q17: Hospital Night Shift (logic_puzzle)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Hospital Night Shift', 'logic_puzzle'::dm_question_type, E'Four doctors – Ellis, Farooq, Grant, and Hussain – are assigned to consecutive night shifts numbered 1 to 4.\n\n• Grant is on shift 3.\n• Ellis is not on a shift adjacent to Grant (not shift 2 or 4).\n• Hussain is on an earlier shift than Farooq.\n\nWhich shift is Hussain on?', NULL, NULL, 'B', 'Grant = shift 3. Ellis cannot be on shift 2 or 4, so Ellis = shift 1. Remaining shifts 2 and 4 for Hussain and Farooq. Hussain before Farooq means Hussain = shift 2, Farooq = shift 4.', 17)
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q17, 'A', 'Shift 1', NULL, 1),
    (v_q17, 'B', 'Shift 2', NULL, 2),
    (v_q17, 'C', 'Shift 3', NULL, 3),
    (v_q17, 'D', 'Shift 4', NULL, 4);

  -- Q18: Military Rank Structure (venn_diagram INTERPRET, three_nested)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Military Rank Structure', 'venn_diagram'::dm_question_type, E'The diagram shows military personnel categorised by rank. The rectangle represents all Officers, the oval (inside the rectangle) represents Commissioned Officers, and the pentagon (inside the oval) represents Generals. Every General is a Commissioned Officer, and every Commissioned Officer is an Officer. Each letter marks a different region.\n\nWhich letter represents a Commissioned Officer who is not a General?', NULL, '{"diagramLayout":"three_nested","sets":[{"id":"set1","label":"Officers","shape":"rectangle"},{"id":"set2","label":"Commissioned","shape":"oval"},{"id":"set3","label":"Generals","shape":"pentagon"}],"regions":{"set1_only":"A","set1_set2":"B","all_three":"C","outside":"D"}}'::jsonb, 'B', 'The oval represents Commissioned Officers. The region inside the oval but outside the pentagon (Generals) is B. Region A is Officers who are not Commissioned. Region C is Generals (inside all three nested shapes). Region D is outside all shapes — not military officers.', 18)
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Letter A', NULL, 1),
    (v_q18, 'B', 'Letter B', NULL, 2),
    (v_q18, 'C', 'Letter C', NULL, 3),
    (v_q18, 'D', 'Letter D', NULL, 4);

  -- Q19: UK Food Bank Usage (syllogism/passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'UK Food Bank Usage', 'syllogism'::dm_question_type, E'The Trussell Trust distributed 3.1 million emergency food parcels in the UK during 2023–24, an increase of 94% over five years. The primary reasons cited were low income (39%), benefit delays (24%), and benefit changes (15%). The government argued that Universal Credit was designed to simplify the welfare system and that the majority of claimants received their first payment on time. Independent research from the Joseph Rowntree Foundation found that 3.8 million people in the UK experienced destitution in 2022, defined as being unable to afford two or more essentials such as food, shelter, and heating. The All-Party Parliamentary Group on Hunger recommended introducing a statutory right to food, similar to Scotland''s proposed Good Food Nation Act. However, the government stated that existing welfare provisions were sufficient and that food banks operated as a supplement, not a replacement, for state support.', NULL, NULL, NULL, NULL, 19)
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q19, 'More than 2 million food parcels were distributed in 2023–24.', 'Yes', 'The passage states 3.1 million emergency food parcels were distributed, which exceeds 2 million.', 1),
    (v_q19, 'Low income was the most commonly cited reason for food bank use.', 'Yes', 'Low income was cited at 39%, the highest percentage among the reasons listed (benefit delays 24%, benefit changes 15%).', 2),
    (v_q19, 'All Universal Credit claimants received their first payment on time.', 'No', 'The passage states the majority of claimants received their first payment on time — not all. This means some did not.', 3),
    (v_q19, 'Fewer than 3 million people experienced destitution in 2022.', 'No', 'The Joseph Rowntree Foundation found that 3.8 million people experienced destitution in 2022, which exceeds 3 million.', 4),
    (v_q19, 'The APPG recommended a statutory right to food.', 'Yes', 'The passage states the All-Party Parliamentary Group on Hunger recommended introducing a statutory right to food.', 5);

  -- Q20: Mandatory Organ Donation (strongest_argument)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Mandatory Organ Donation', 'strongest_argument'::dm_question_type, 'All citizens should be automatically registered as organ donors unless they actively choose to opt out.', NULL, NULL, 'A', 'Option A is the strongest argument because it provides specific, evidence-based support — a 25% increase in donation rates in Spain — with a direct, measurable life-saving outcome. Option B raises bodily autonomy but overlooks that opt-out preserves choice. Option C relies on assumed intent without evidence. Option D raises a valid concern for a minority but does not outweigh the systemic benefit.', 20)
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; opt-out systems have increased organ donation rates by over 25% in countries such as Spain, directly saving thousands of lives each year.', NULL, 1),
    (v_q20, 'B', 'No; automatically registering citizens as donors without explicit consent violates the principle of bodily autonomy, which is a fundamental human right.', NULL, 2),
    (v_q20, 'C', 'Yes; many people intend to be organ donors but never get around to registering, and an opt-out system would reflect their true wishes.', NULL, 3),
    (v_q20, 'D', 'No; some religious groups have specific beliefs about bodily integrity after death, and an automatic system may conflict with these beliefs.', NULL, 4);

  -- Q21: Chocolate Selection (probabilistic)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Chocolate Selection', 'probabilistic'::dm_question_type, 'A jar contains 12 chocolates: 5 dark, 4 milk, and 3 white. Three chocolates are taken at random one at a time without replacement.', NULL, NULL, 'A', 'Option A: P(all three dark) = (5/12) × (4/11) × (3/10) = 60/1320 = 1/22. Correct. Option B: P(all same) = P(all dark) + P(all milk) + P(all white) = 60/1320 + 24/1320 + 6/1320 = 90/1320 ≈ 6.8%. Not greater than 10%. Wrong. Option C: P(no white) = (9/12) × (8/11) × (7/10) = 504/1320 ≈ 38.2%. Not greater than 50%. Wrong. Option D: P(first two milk) = (4/12) × (3/11) = 12/132 ≈ 9.1%. Not greater than 10%. Wrong.', 21)
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'The probability that all three chocolates are dark is 1/22.', NULL, 1),
    (v_q21, 'B', 'The probability that all three chocolates are the same flavour exceeds 10%.', NULL, 2),
    (v_q21, 'C', 'The probability of drawing no white chocolate exceeds 50%.', NULL, 3),
    (v_q21, 'D', 'The probability that the first two chocolates are both milk exceeds 10%.', NULL, 4);

  -- Q22: Fungi and Organisms (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Fungi and Organisms', 'syllogism'::dm_question_type, 'All mushrooms are fungi. No fungus is a plant. Some organisms that grow in forests are fungi.', NULL, NULL, NULL, NULL, 22)
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q22, 'No mushroom is a plant.', 'Yes', 'All mushrooms are fungi, and no fungus is a plant. By transitive reasoning, no mushroom can be a plant.', 1),
    (v_q22, 'Some things that grow in forests are mushrooms.', 'No', 'Some forest organisms are fungi, but those fungi may not include any mushrooms. Mushrooms are a subset of fungi, but the forest fungi could all be non-mushroom fungi such as moulds.', 2),
    (v_q22, 'All fungi are mushrooms.', 'No', 'All mushrooms are fungi, but not all fungi are mushrooms. Yeasts and moulds are fungi but not mushrooms. This reverses the premise.', 3),
    (v_q22, 'Some organisms that grow in forests are not plants.', 'Yes', 'Some forest organisms are fungi, and no fungus is a plant. Therefore those forest fungi are not plants — so at least some forest organisms are not plants.', 4),
    (v_q22, 'All plants are non-fungi.', 'Yes', 'No fungus is a plant. By contraposition, all plants are non-fungi. This is logically equivalent to the premise.', 5);

  -- Q23: Conference Schedule (logic_puzzle)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Conference Schedule', 'logic_puzzle'::dm_question_type, E'Five speakers – Adams, Blake, Chen, Davis, and Evans – present in slots 1 to 5.\n\n• Evans is in slot 3.\n• Adams presents before Chen.\n• Blake is not in slot 1 or slot 5.\n• Davis presents immediately after Blake.\n\nWhich slot is Chen in?', NULL, NULL, 'B', 'Evans = slot 3. Blake is not in slot 1 or 5. Davis is immediately after Blake. If Blake = 2, Davis = 3: conflict with Evans = 3. If Blake = 4, Davis = 5. Remaining slots 1 and 2 for Adams and Chen. Adams before Chen gives Adams = 1, Chen = 2.', 23)
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', 'Slot 1', NULL, 1),
    (v_q23, 'B', 'Slot 2', NULL, 2),
    (v_q23, 'C', 'Slot 4', NULL, 3),
    (v_q23, 'D', 'Slot 5', NULL, 4);

  -- Q24: Pottery Techniques (venn_diagram SELECT, two_overlap)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Pottery Techniques', 'venn_diagram'::dm_question_type, E'A pottery class surveyed 35 students. 12 practise Wheel-throwing only, 8 practise Hand-building only, 9 practise both techniques, and 6 practise neither.\n\nThe trapezoid represents Wheel-throwing and the circle represents Hand-building.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'The correct distribution is: Wheel-throwing only = 12, Hand-building only = 8, both = 9, neither = 6. Total = 35. Option B swaps Wheel-throwing only and Hand-building only (12 and 8). Option C swaps the overlap and outside values (9 and 6). Option D puts the overlap value in Wheel-throwing only.', 24)
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Wheel-throwing","shape":"trapezoid"},{"id":"set2","label":"Hand-building","shape":"circle"}],"regions":{"set1_only":12,"set2_only":8,"set1_set2":9,"outside":6}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Wheel-throwing","shape":"trapezoid"},{"id":"set2","label":"Hand-building","shape":"circle"}],"regions":{"set1_only":8,"set2_only":12,"set1_set2":9,"outside":6}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Wheel-throwing","shape":"trapezoid"},{"id":"set2","label":"Hand-building","shape":"circle"}],"regions":{"set1_only":12,"set2_only":8,"set1_set2":6,"outside":9}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"two_overlap","sets":[{"id":"set1","label":"Wheel-throwing","shape":"trapezoid"},{"id":"set2","label":"Hand-building","shape":"circle"}],"regions":{"set1_only":9,"set2_only":8,"set1_set2":12,"outside":6}}'::jsonb, 4);

  -- Q25: Motorway Traffic Flow (interpreting_info)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Motorway Traffic Flow', 'interpreting_info'::dm_question_type, 'A transport agency recorded hourly vehicle counts on four motorway sections.', '{"headers":["Section","7am","10am","1pm","4pm","7pm"],"rows":[["M1 Jct 25-28","4800","2200","2600","5100","3200"],["M6 Jct 10-12","5200","2800","2400","4800","3000"],["M25 Jct 5-8","6100","3500","3100","5800","3800"],["M62 Jct 20-22","3600","1800","2000","3900","2400"]]}'::jsonb, NULL, NULL, NULL, 25)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q25, 'M25 had the highest traffic at every time slot.', 'Yes', '7am: M25 6100 (highest). 10am: M25 3500 (highest). 1pm: M25 3100 (highest). 4pm: M25 5800 (highest). 7pm: M25 3800 (highest).', 1),
    (v_q25, 'Traffic was highest at 7am for every section.', 'No', 'M1: 7am = 4800, 4pm = 5100. The M1 had higher traffic at 4pm than at 7am.', 2),
    (v_q25, 'M62 had the lowest traffic at every time slot.', 'Yes', '7am: M62 3600 (lowest). 10am: M62 1800 (lowest). 1pm: M62 2000 (lowest). 4pm: M62 3900 (lowest). 7pm: M62 2400 (lowest).', 3),
    (v_q25, 'Total traffic at 4pm exceeded 19,000 vehicles.', 'Yes', '4pm total: 5100 + 4800 + 5800 + 3900 = 19,600. This exceeds 19,000.', 4),
    (v_q25, 'M6 traffic at 1pm was lower than at 10am.', 'Yes', 'M6: 10am = 2800, 1pm = 2400. Traffic at 1pm was lower.', 5);

  -- Q26: Cheese Ageing Categories (venn_diagram SELECT, three_vertical_chain)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Cheese Ageing Categories', 'venn_diagram'::dm_question_type, E'A cheese shop categorised 40 cheeses by ageing. 8 are Soft only, 4 are both Soft and Semi-hard, 7 are Semi-hard only, 5 are both Semi-hard and Hard, 6 are Hard only, and 10 are uncategorised.\n\nThe star represents Soft, the diamond represents Semi-hard, and the hexagon represents Hard.\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'The correct distribution is: Soft only = 8, Soft ∩ Semi-hard = 4, Semi-hard only = 7, Semi-hard ∩ Hard = 5, Hard only = 6, outside = 10. Total = 40. Option B swaps the two overlap values (4 and 5). Option C swaps Soft-only and Semi-hard-only (8 and 7). Option D swaps Hard-only and outside (6 and 10).', 26)
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Soft","shape":"star"},{"id":"set2","label":"Semi-hard","shape":"diamond"},{"id":"set3","label":"Hard","shape":"hexagon"}],"regions":{"set1_only":8,"set1_set2":4,"set2_only":7,"set2_set3":5,"set3_only":6,"outside":10}}'::jsonb, 1),
    (v_q26, 'B', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Soft","shape":"star"},{"id":"set2","label":"Semi-hard","shape":"diamond"},{"id":"set3","label":"Hard","shape":"hexagon"}],"regions":{"set1_only":8,"set1_set2":5,"set2_only":7,"set2_set3":4,"set3_only":6,"outside":10}}'::jsonb, 2),
    (v_q26, 'C', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Soft","shape":"star"},{"id":"set2","label":"Semi-hard","shape":"diamond"},{"id":"set3","label":"Hard","shape":"hexagon"}],"regions":{"set1_only":7,"set1_set2":4,"set2_only":8,"set2_set3":5,"set3_only":6,"outside":10}}'::jsonb, 3),
    (v_q26, 'D', '', '{"diagramLayout":"three_vertical_chain","sets":[{"id":"set1","label":"Soft","shape":"star"},{"id":"set2","label":"Semi-hard","shape":"diamond"},{"id":"set3","label":"Hard","shape":"hexagon"}],"regions":{"set1_only":8,"set1_set2":4,"set2_only":7,"set2_set3":5,"set3_only":10,"outside":6}}'::jsonb, 4);

  -- Q27: Banning Zero-Hours Contracts (strongest_argument)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Banning Zero-Hours Contracts', 'strongest_argument'::dm_question_type, 'Zero-hours contracts should be banned in the UK.', NULL, NULL, 'B', 'Option B is the strongest argument because it identifies specific groups — students and carers — who actively prefer zero-hours contracts for the flexibility they offer, directly challenging the premise that such contracts are inherently harmful. Option A raises valid concerns but does not counter the flexibility benefit. Option C relies on an appeal to other countries. Option D raises costs but does not address worker preference.', 27)
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Yes; zero-hours contracts leave workers unable to plan their finances or secure mortgages, as they have no guaranteed income from week to week, perpetuating financial insecurity.', NULL, 1),
    (v_q27, 'B', 'No; many workers, including students and carers, prefer zero-hours contracts because they offer flexibility to choose when and how much they work.', NULL, 2),
    (v_q27, 'C', 'Yes; most other European countries have already restricted or banned zero-hours contracts, so the UK should follow suit.', NULL, 3),
    (v_q27, 'D', 'No; banning zero-hours contracts would increase costs for small businesses that rely on flexible staffing during peak periods.', NULL, 4);

  -- Q28: Wine Cellar Rack Order (logic_puzzle)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Wine Cellar Rack Order', 'logic_puzzle'::dm_question_type, E'Four wines – Bordeaux, Chianti, Douro, and Eiswein – are stored on racks 1 to 4 (top to bottom).\n\n• Chianti is on rack 2.\n• Bordeaux is above Douro (lower rack number).\n• Eiswein is not on a rack adjacent to Chianti.\n\nWhich rack is Douro on?', NULL, NULL, 'C', 'Chianti = rack 2. Eiswein cannot be on rack 1 or 3 (adjacent to 2), so Eiswein = rack 4. Remaining racks 1 and 3 for Bordeaux and Douro. Bordeaux is above (lower number than) Douro, so Bordeaux = rack 1, Douro = rack 3.', 28)
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Rack 1', NULL, 1),
    (v_q28, 'B', 'Rack 2', NULL, 2),
    (v_q28, 'C', 'Rack 3', NULL, 3),
    (v_q28, 'D', 'Rack 4', NULL, 4);

  -- Q29: Antarctic Research Stations (syllogism/passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Antarctic Research Stations', 'syllogism'::dm_question_type, E'Antarctica hosts 70 year-round research stations operated by 30 countries under the Antarctic Treaty System, signed in 1959. The British Antarctic Survey (BAS) operates five research stations, including Halley VI, which was relocated 23 km inland in 2017 due to a growing ice crack. Antarctica''s ice sheet contains approximately 26.5 million cubic kilometres of ice, representing 70% of the world''s fresh water. Average temperatures at the South Pole range from −28°C in summer to −60°C in winter. The Madrid Protocol, added to the Antarctic Treaty in 1991, designates Antarctica as a natural reserve devoted to peace and science, banning all mineral resource activities. Despite the ban, some nations have been accused of conducting surveys that could be precursors to future mining claims. A 2024 study found that Antarctic ice loss had accelerated to 150 billion tonnes per year, triple the rate measured in the 1990s.', NULL, NULL, NULL, NULL, 29)
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q29, 'More than 80 year-round stations operate in Antarctica.', 'No', 'The passage states Antarctica hosts 70 year-round research stations, which is fewer than 80.', 1),
    (v_q29, 'Halley VI was relocated due to an ice crack.', 'Yes', 'The passage states Halley VI was relocated 23 km inland in 2017 due to a growing ice crack.', 2),
    (v_q29, 'Antarctica contains more than half the world''s fresh water.', 'Yes', 'The passage states Antarctica''s ice sheet represents 70% of the world''s fresh water, which is more than half.', 3),
    (v_q29, 'The Madrid Protocol permits mineral extraction under certain conditions.', 'No', 'The passage states the Madrid Protocol bans all mineral resource activities. It does not permit extraction under any conditions.', 4),
    (v_q29, 'Antarctic ice loss has slowed since the 1990s.', 'No', 'The passage states ice loss has accelerated to 150 billion tonnes per year, triple the rate measured in the 1990s. It has increased, not slowed.', 5);

  -- Q30: Chocolate Selection Probability (probabilistic)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Chocolate Box Probability', 'probabilistic'::dm_question_type, 'A box contains 12 chocolates: 5 dark, 4 milk, and 3 white. Three chocolates are selected at random without replacement.', NULL, NULL, 'A', 'Option A: P(all dark) = (5 × 4 × 3) / (12 × 11 × 10) = 60/1320 = 1/22 ≈ 4.5%. Correct. Option B: P(all same) = 60/1320 + 24/1320 + 6/1320 = 90/1320 ≈ 6.8%. Not > 10%. Wrong. Option C: P(no white) = (9 × 8 × 7) / (12 × 11 × 10) = 504/1320 ≈ 38.2%. Not > 50%. Wrong. Option D: P(first two milk) = (4/12) × (3/11) = 12/132 ≈ 9.1%. Not > 10%. Wrong.', 30)
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', 'The probability all three are dark is 1/22.', NULL, 1),
    (v_q30, 'B', 'The probability all three are the same type exceeds 10%.', NULL, 2),
    (v_q30, 'C', 'The probability of selecting no white chocolate exceeds 50%.', NULL, 3),
    (v_q30, 'D', 'The probability the first two selected are both milk exceeds 10%.', NULL, 4);

  -- Q31: Public Library Borrowing (interpreting_info)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Public Library Borrowing', 'interpreting_info'::dm_question_type, 'A public library recorded weekly borrowing figures by genre over four weeks.', '{"headers":["Genre","Week 1","Week 2","Week 3","Week 4"],"rows":[["Fiction","340","360","380","350"],["Non-fiction","180","190","200","210"],["Children''s","250","230","270","260"],["Reference","45","50","40","55"]]}'::jsonb, NULL, NULL, NULL, 31)
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q31, 'Fiction was the most borrowed genre every week.', 'Yes', 'Week 1: Fiction 340 (highest). Week 2: Fiction 360 (highest). Week 3: Fiction 380 (highest). Week 4: Fiction 350 (highest).', 1),
    (v_q31, 'Non-fiction borrowing increased every week.', 'Yes', 'Non-fiction: Week 1 = 180, Week 2 = 190, Week 3 = 200, Week 4 = 210. Each week is higher than the previous.', 2),
    (v_q31, 'Children''s borrowing increased consistently.', 'No', 'Children''s: Week 1 = 250, Week 2 = 230. Borrowing dropped from Week 1 to Week 2, so it did not increase consistently.', 3),
    (v_q31, 'Reference borrowing peaked in Week 4.', 'Yes', 'Reference: Week 1 = 45, Week 2 = 50, Week 3 = 40, Week 4 = 55. Week 4 at 55 is the highest.', 4),
    (v_q31, 'Total borrowing in Week 3 exceeded 900.', 'No', 'Week 3 total: 380 + 200 + 270 + 40 = 890. This is less than 900.', 5);

  -- Q32: Photography Styles (venn_diagram SELECT, three_one_separate)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Photography Styles', 'venn_diagram'::dm_question_type, E'A photography club surveyed 36 members. 8 shoot Portrait only, 5 shoot both Portrait and Landscape, 7 shoot Landscape only, 9 shoot Macro only, and 7 shoot none.\n\nThe parallelogram represents Portrait, the isosceles_triangle represents Landscape (these two overlap), and the oval represents Macro (separate from the other two).\n\nWhich of the following diagrams best represents the data?', NULL, NULL, 'A', 'The correct distribution is: Portrait only = 8, Portrait ∩ Landscape = 5, Landscape only = 7, Macro only = 9, outside = 7. Total = 36. Option B swaps Portrait-only and Landscape-only (8 and 7). Option C swaps Macro-only and outside (9 and 7). Option D swaps the overlap and Landscape-only (5 and 7).', 32)
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Portrait","shape":"parallelogram"},{"id":"set2","label":"Landscape","shape":"isosceles_triangle"},{"id":"set3","label":"Macro","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":5,"set2_only":7,"set3_only":9,"outside":7}}'::jsonb, 1),
    (v_q32, 'B', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Portrait","shape":"parallelogram"},{"id":"set2","label":"Landscape","shape":"isosceles_triangle"},{"id":"set3","label":"Macro","shape":"oval"}],"regions":{"set1_only":7,"set1_set2":5,"set2_only":8,"set3_only":9,"outside":7}}'::jsonb, 2),
    (v_q32, 'C', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Portrait","shape":"parallelogram"},{"id":"set2","label":"Landscape","shape":"isosceles_triangle"},{"id":"set3","label":"Macro","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":5,"set2_only":7,"set3_only":7,"outside":9}}'::jsonb, 3),
    (v_q32, 'D', '', '{"diagramLayout":"three_one_separate","sets":[{"id":"set1","label":"Portrait","shape":"parallelogram"},{"id":"set2","label":"Landscape","shape":"isosceles_triangle"},{"id":"set3","label":"Macro","shape":"oval"}],"regions":{"set1_only":8,"set1_set2":7,"set2_only":5,"set3_only":9,"outside":7}}'::jsonb, 4);

  -- Q33: Rivers and Tributaries (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Rivers and Tributaries', 'syllogism'::dm_question_type, 'All tributaries flow into rivers. Some rivers are tidal. No canal is a tributary.', NULL, NULL, NULL, NULL, 33)
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q33, 'No canal flows into a river.', 'No', 'No canal is a tributary, and all tributaries flow into rivers. However, canals might flow into rivers through means other than being tributaries. The premises do not establish that only tributaries flow into rivers.', 1),
    (v_q33, 'No canal is a river.', 'No', 'The premises only state that no canal is a tributary. A canal could theoretically be classified as a river — the premises do not address this relationship.', 2),
    (v_q33, 'Some tributaries are tidal.', 'No', 'Some rivers are tidal, but tributaries flow INTO rivers — they are not necessarily rivers themselves. Even if they were, the tidal rivers might not include any that have tributaries feeding them. This does not follow.', 3),
    (v_q33, 'Some tidal things are rivers.', 'Yes', 'The premise states some rivers are tidal. By conversion, some tidal things are rivers.', 4),
    (v_q33, 'All canals are non-tributaries.', 'Yes', 'No canal is a tributary. This means every canal is a non-tributary. This follows directly from the premise.', 5);

  -- Q34: UK Renewable Energy Transition (syllogism/passage)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'UK Renewable Energy Transition', 'syllogism'::dm_question_type, E'The UK generated 46% of its electricity from renewable sources in 2023, up from 11% in 2012. Offshore wind capacity reached 14.7 GW, making the UK the world''s second-largest offshore wind market after China. The government set a target of 50 GW of offshore wind capacity by 2030. However, the most recent Contracts for Difference auction attracted no bids for offshore wind projects after developers argued the strike price was too low to cover rising costs. The Climate Change Committee warned that the UK needed to quadruple its rate of onshore wind and solar installation to meet its 2035 decarbonisation target. Nuclear power provided 15% of UK electricity in 2023, with the government approving Sizewell C as the first new nuclear plant in a generation at an estimated cost of £20 billion. Critics argued nuclear was too expensive and too slow to build compared with renewables.', NULL, NULL, NULL, NULL, 34)
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q34, 'More than half of UK electricity came from renewables in 2023.', 'No', 'The passage states 46% of electricity came from renewable sources in 2023, which is less than half (50%).', 1),
    (v_q34, 'The UK is the world''s largest offshore wind market.', 'No', 'The passage states the UK is the world''s second-largest offshore wind market, after China.', 2),
    (v_q34, 'The most recent CfD auction secured multiple offshore wind contracts.', 'No', 'The passage states the most recent auction attracted no bids for offshore wind projects.', 3),
    (v_q34, 'Nuclear provided more than 10% of UK electricity.', 'Yes', 'The passage states nuclear power provided 15% of UK electricity in 2023, which exceeds 10%.', 4),
    (v_q34, 'Sizewell C is estimated to cost more than £15 billion.', 'Yes', 'The passage states Sizewell C has an estimated cost of £20 billion, which exceeds £15 billion.', 5);

  -- Q35: Podcasts and Digital Media (syllogism)
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index)
  VALUES (2, 'Podcasts and Digital Media', 'syllogism'::dm_question_type, 'All podcasts are digital media. All digital media can be streamed online. Some things that can be streamed online are free.', NULL, NULL, NULL, NULL, 35)
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q35, 'All podcasts can be streamed online.', 'Yes', 'All podcasts are digital media, and all digital media can be streamed online. By transitive reasoning, all podcasts can be streamed online.', 1),
    (v_q35, 'Some podcasts are free.', 'No', 'Some streamable things are free, but those free streamable things may not include any podcasts. The premises do not establish which streamable content is free.', 2),
    (v_q35, 'All digital media are podcasts.', 'No', 'The premise states all podcasts are digital media — not the reverse. Videos, e-books, and music are digital media but not podcasts.', 3),
    (v_q35, 'Some free things can be streamed online.', 'Yes', 'The premise states some things that can be streamed online are free. By conversion, some free things can be streamed online.', 4),
    (v_q35, 'All things that can be streamed are digital media.', 'No', 'The premise states all digital media can be streamed online — not the reverse. Live broadcasts or other content might be streamable without being classified as digital media.', 5);

END $$;
