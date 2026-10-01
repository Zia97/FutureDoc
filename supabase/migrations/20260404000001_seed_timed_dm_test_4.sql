-- Seed: Timed DM Test 4 (test_id = 4)
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

  DELETE FROM timed_decision_making_questions WHERE test_id = 4;

  INSERT INTO timed_decision_making_tests (id, title, time_minutes)
  VALUES (4, 'DM Practice Test 4', 37)
  ON CONFLICT (id) DO NOTHING;

  -- Q01: syllogism - Photography Club Rules
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Photography Club Rules', 'syllogism'::dm_question_type, 'Members of the photography club must submit a portfolio before exhibiting their work unless they have won a regional award. All regional award winners have been members for at least three years. Some members who have been members for at least three years have not won a regional award.', NULL, NULL, NULL, NULL, 1, 'normal')
  RETURNING id INTO v_q01;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q01, 'A member exhibiting work without submitting a portfolio must have won a regional award.', 'Yes', 'The premise states members must submit a portfolio unless they have won a regional award. The only exception to submitting a portfolio is having won a regional award. Therefore, if a member exhibits without a portfolio, they must have won a regional award.', 1),
    (v_q01, 'All members who have been members for at least three years have won a regional award.', 'No', 'The premises explicitly state that some members who have been members for at least three years have NOT won a regional award. This conclusion directly contradicts the given information. This is a quantifier shift — ''some have not'' cannot become ''all have.''', 2),
    (v_q01, 'A regional award winner has been a member for at least three years.', 'Yes', 'This is directly stated in the premises: ''All regional award winners have been members for at least three years.'' It follows immediately.', 3),
    (v_q01, 'A member who has been a member for at least three years may exhibit without submitting a portfolio.', 'No', 'Being a member for three years does not guarantee winning a regional award — the premises state some three-year members have not won one. Only regional award winners can exhibit without a portfolio. Therefore, long membership alone is not sufficient to bypass the portfolio requirement.', 4),
    (v_q01, 'Some members who have not won a regional award have been members for at least three years.', 'Yes', 'This is a direct restatement of the third premise: ''Some members who have been members for at least three years have not won a regional award.'' The same group is described from the other direction.', 5);

  -- Q02: syllogism - Zorplek Classification
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Zorplek Classification', 'syllogism'::dm_question_type, 'All zorpleks produce fizzle. No grunthi produces fizzle. Some zorpleks are also quibbles. Only quibbles can be certified as nimtars.', NULL, NULL, NULL, NULL, 2, 'hard')
  RETURNING id INTO v_q02;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q02, 'A nimtar must be a quibble.', 'Yes', '''Only quibbles can be certified as nimtars'' means being a quibble is a necessary condition for being a nimtar. Therefore every nimtar must be a quibble.', 1),
    (v_q02, 'No grunthi is a zorplek.', 'Yes', 'All zorpleks produce fizzle, and no grunthi produces fizzle. If a grunthi were a zorplek, it would produce fizzle, contradicting the second premise. Therefore no grunthi can be a zorplek.', 2),
    (v_q02, 'Some nimtars produce fizzle.', 'No', 'Nimtars must be quibbles, and some zorpleks are quibbles. However, we do not know whether the quibbles that are certified as nimtars are specifically zorplek-quibbles (which produce fizzle) or non-zorplek quibbles (which may not). We cannot chain two ''some'' claims to guarantee nimtars produce fizzle.', 3),
    (v_q02, 'All zorpleks are quibbles.', 'No', 'The premise states ''some zorpleks are also quibbles.'' Under UCAT''s definition, ''some'' means more than zero but less than all. Therefore not all zorpleks are quibbles — this is a quantifier shift from ''some'' to ''all.''', 4),
    (v_q02, 'A grunthi cannot be a nimtar.', 'No', 'Nimtars must be quibbles, but the premises do not prevent a grunthi from being a quibble. A grunthi cannot be a zorplek, but nothing stops a grunthi from being a quibble through other means. Therefore a grunthi could potentially be a quibble and be certified as a nimtar.', 5);

  -- Q03: syllogism - Community Garden Rules
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Community Garden Rules', 'syllogism'::dm_question_type, 'If a plot holder grows vegetables, they must attend the monthly meeting. Some plot holders who attend the monthly meeting also volunteer for maintenance. No volunteer for maintenance is under the age of 18.', NULL, NULL, NULL, NULL, 3, 'normal')
  RETURNING id INTO v_q03;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q03, 'A plot holder who grows vegetables attends the monthly meeting.', 'Yes', 'This follows directly from the first premise: ''If a plot holder grows vegetables, they must attend the monthly meeting.'' Growing vegetables guarantees attendance at the meeting.', 1),
    (v_q03, 'All plot holders attend the monthly meeting.', 'No', 'Only plot holders who grow vegetables must attend. The premises say nothing about plot holders who do not grow vegetables — they may or may not attend. This extends the scope beyond what is stated.', 2),
    (v_q03, 'Some plot holders who grow vegetables volunteer for maintenance.', 'No', 'Vegetable growers attend meetings, and some meeting attendees volunteer for maintenance. However, the vegetable growers might be among those meeting attendees who do not volunteer. Two ''some'' claims cannot be chained to produce a definite conclusion.', 3),
    (v_q03, 'No plot holder who grows vegetables is under 18.', 'No', 'The age restriction applies only to maintenance volunteers. Growing vegetables requires attending meetings, but not volunteering for maintenance. A vegetable-growing plot holder could attend meetings without volunteering, so the age restriction does not necessarily apply to them.', 4),
    (v_q03, 'If a plot holder volunteers for maintenance, they are at least 18 years old.', 'Yes', '''No volunteer for maintenance is under the age of 18'' means every maintenance volunteer must be 18 or older. By contraposition, being under 18 means not being a maintenance volunteer.', 5);

  -- Q04: syllogism - Cycling Club Members
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Cycling Club Members', 'syllogism'::dm_question_type, 'Completing at least five training rides is necessary to enter the cycling club''s annual race. Only members who complete the annual race receive a participation medal. Some members who have completed at least five training rides did not enter the annual race.', NULL, NULL, NULL, NULL, 4, 'normal')
  RETURNING id INTO v_q04;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q04, 'A member with a participation medal has completed the annual race.', 'Yes', '''Only members who complete the annual race receive a participation medal'' means completing the race is necessary for receiving the medal. Therefore any medal holder must have completed the race.', 1),
    (v_q04, 'A member who has completed at least five training rides will receive a participation medal.', 'No', 'Completing five training rides is necessary to enter the race, but it does not guarantee entry — the premises state some members with five rides did not enter. Even entering does not guarantee completing the race or receiving a medal. Multiple steps are assumed.', 2),
    (v_q04, 'A member entering the annual race has completed at least five training rides.', 'Yes', 'The premise states that completing at least five training rides is necessary to enter the race. Therefore any member who enters must have completed the required rides.', 3),
    (v_q04, 'All members who have completed at least five training rides entered the annual race.', 'No', 'This is directly contradicted by the premises, which state that some members who completed five training rides did not enter the race. Five rides are necessary but not sufficient for entry.', 4),
    (v_q04, 'No member who receives a participation medal has completed fewer than five training rides.', 'Yes', 'A medal requires completing the race. Entering the race requires completing five training rides. Therefore: medal implies race completion implies five rides completed. No medal holder can have fewer than five rides.', 5);

  -- Q05: syllogism - Chemical Compound Properties
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Chemical Compound Properties', 'syllogism'::dm_question_type, 'Compound X is unstable if it has not been treated with reagent A. Any compound used in the final product must be stable. Some compounds treated with reagent A are also treated with reagent B. No compound treated with reagent B is suitable for external use.', NULL, NULL, NULL, NULL, 5, 'hard')
  RETURNING id INTO v_q05;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q05, 'A compound used in the final product has been treated with reagent A.', 'Yes', 'A compound not treated with reagent A is unstable. Any compound in the final product must be stable. By contraposition: stable implies treated with A. Therefore final product implies stable implies treated with A.', 1),
    (v_q05, 'All compounds treated with reagent A are stable.', 'No', 'The premise states that not being treated with A causes instability. The contrapositive is: stable implies treated with A. However, this does not mean treated with A implies stable — there could be other causes of instability besides lacking reagent A.', 2),
    (v_q05, 'A compound treated with reagent B is not used in the final product.', 'No', 'Compounds treated with reagent B are not suitable for external use, but the premises do not state that the final product is for external use. A compound treated with B could still be stable and used in a final product that is not intended for external use.', 3),
    (v_q05, 'Some compounds treated with reagent A are not suitable for external use.', 'Yes', 'Some compounds treated with reagent A are also treated with reagent B. No compound treated with reagent B is suitable for external use. Therefore those compounds treated with both A and B are not suitable for external use — and they are among the compounds treated with A.', 4),
    (v_q05, 'All compounds used in the final product are suitable for external use.', 'No', 'The premises provide no information linking final product use with external use suitability. These are independent attributes, and no premise connects them. This conclusion introduces a relationship not established in the given information.', 5);

  -- Q06: logic_puzzle - Concert Hall Seating
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Concert Hall Seating', 'logic_puzzle'::dm_question_type, 'Five friends — Aisha, Ben, Clara, Dan, and Emma — sit in a row of five seats at a concert hall. The seats are numbered 1 to 5 from left to right.

- Aisha sits directly next to Ben.
- Clara sits in seat 3.
- Dan sits further to the right than Emma.
- Ben does not sit directly next to Clara.
- Emma does not sit at either end.

Which of the following must be true?', NULL, NULL, 'A', 'Clara is in seat 3. Emma cannot sit at either end, so Emma is in seat 2 or 4. Ben cannot sit next to Clara (seat 3), so Ben cannot be in seat 2 or 4 — Ben must be in seat 1 or 5. Aisha sits directly next to Ben: if Ben is in seat 1, Aisha is in seat 2; if Ben is in seat 5, Aisha is in seat 4. Testing Ben in seat 5: Aisha is in seat 4, leaving Emma for seat 2 and Dan for seat 1. But Dan (seat 1) must be further right than Emma (seat 2), and 1 is left of 2, so this fails. Therefore Ben must be in seat 1, with Aisha in seat 2, Emma in seat 4, and Dan in seat 5.', 6, 'normal')
  RETURNING id INTO v_q06;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q06, 'A', 'Ben sits in seat 1.', NULL, 1),
    (v_q06, 'B', 'Dan sits in seat 4.', NULL, 2),
    (v_q06, 'C', 'Emma sits in seat 2.', NULL, 3),
    (v_q06, 'D', 'Aisha sits in seat 4.', NULL, 4);

  -- Q07: logic_puzzle - Biscuit Production Schedule
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Biscuit Production Schedule', 'logic_puzzle'::dm_question_type, 'A bakery produces five types of biscuit on Monday. The total production is 200 biscuits. Shortbread accounts for twice as many as ginger snaps. Digestives account for 20 more than shortbread. Bourbons and custard creams together total 50. Custard creams account for 10 more than bourbons.

How many digestive biscuits were produced?', NULL, NULL, 'C', 'Start with bourbons and custard creams: they total 50, and custard creams are 10 more than bourbons. So 2 × bourbons + 10 = 50, giving bourbons = 20 and custard creams = 30. Let ginger snaps = G. Shortbread = 2G, and digestives = 2G + 20. The total is G + 2G + (2G + 20) + 20 + 30 = 200, so 5G + 70 = 200, giving G = 26. Therefore digestives = 2 × 26 + 20 = 72.', 7, 'normal')
  RETURNING id INTO v_q07;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q07, 'A', '52', NULL, 1),
    (v_q07, 'B', '66', NULL, 2),
    (v_q07, 'C', '72', NULL, 3),
    (v_q07, 'D', '78', NULL, 4);

  -- Q08: logic_puzzle - Science Fair Project Assignment
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Science Fair Project Assignment', 'logic_puzzle'::dm_question_type, 'Four students — Priya, Ravi, Sara, and Tom — each select a different science fair project from: Volcanoes, Solar System, Plant Growth, and Robotics.

- Priya does not choose Robotics or Solar System.
- Sara chooses Plant Growth.
- Tom does not choose Volcanoes.
- Ravi does not choose Solar System.

Which project does Tom choose?', NULL, NULL, 'B', 'Sara chooses Plant Growth, eliminating it for others. Priya cannot choose Robotics or Solar System, and with Plant Growth taken, Priya must choose Volcanoes. Ravi cannot choose Solar System, and with Volcanoes and Plant Growth both taken, Ravi must choose Robotics. The only remaining project for Tom is Solar System.', 8, 'normal')
  RETURNING id INTO v_q08;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q08, 'A', 'Volcanoes', NULL, 1),
    (v_q08, 'B', 'Solar System', NULL, 2),
    (v_q08, 'C', 'Plant Growth', NULL, 3),
    (v_q08, 'D', 'Robotics', NULL, 4);

  -- Q09: logic_puzzle - Charity Fundraiser Amounts
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Charity Fundraiser Amounts', 'logic_puzzle'::dm_question_type, 'Five colleagues — Amy, Ben, Carol, Dave, and Emma — each raise a different amount for a charity event. The following is known:

- The total raised by all five is £450.
- Amy raises £30 more than Dave.
- Ben raises twice as much as Carol.
- Emma raises £50.
- Carol raises £20 less than Dave.

How much does Amy raise?', NULL, NULL, 'C', 'Emma raises £50. Let Dave = D. Then Amy = D + 30, Carol = D − 20, and Ben = 2 × (D − 20) = 2D − 40. The total is (D + 30) + (2D − 40) + (D − 20) + D + 50 = 450. Simplifying: 5D + 20 = 450, so D = 86. Amy raises 86 + 30 = £116. Checking: Dave = £86, Carol = £66, Ben = £132, Emma = £50. Total = 116 + 132 + 66 + 86 + 50 = £450.', 9, 'hard')
  RETURNING id INTO v_q09;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q09, 'A', '£86', NULL, 1),
    (v_q09, 'B', '£96', NULL, 2),
    (v_q09, 'C', '£116', NULL, 3),
    (v_q09, 'D', '£132', NULL, 4);

  -- Q10: logic_puzzle - Meeting Room Booking
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Meeting Room Booking', 'logic_puzzle'::dm_question_type, 'A company has four meeting rooms available for booking on Friday. The four teams, their sizes, and available rooms are:

Team Alpha: 11 members — can use Room 1 or Room 4
Team Beta: 5 members — can use Room 2 or Room 3
Team Gamma: 14 members — can use Room 4 only
Team Delta: 7 members — can use Room 1 or Room 2

Room 1 seats 12, Room 2 seats 8, Room 3 seats 6, and Room 4 seats 16. Each room is booked by exactly one team. A team must use a room that seats all its members.

Which room does Team Alpha book?', NULL, NULL, 'A', 'Team Gamma has 14 members and can only use Room 4 (which seats 16), so Gamma must book Room 4. Team Alpha has 11 members and can use Room 1 or Room 4. Since Room 4 is taken by Gamma, Alpha must book Room 1 (seats 12, which accommodates 11). Team Delta then takes Room 2 (seats 8, accommodates 7), and Team Beta takes Room 3 (seats 6, accommodates 5).', 10, 'normal')
  RETURNING id INTO v_q10;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q10, 'A', 'Room 1', NULL, 1),
    (v_q10, 'B', 'Room 2', NULL, 2),
    (v_q10, 'C', 'Room 3', NULL, 3),
    (v_q10, 'D', 'Room 4', NULL, 4);

  -- Q11: logic_puzzle - Honest and Dishonest Players
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Honest and Dishonest Players', 'logic_puzzle'::dm_question_type, 'Four players — Faye, George, Holly, and Ivan — play a game. Each player is either always honest or always dishonest. The following statements are made:

- Faye says: "George is dishonest."
- George says: "Holly and I are both honest."
- Holly says: "Faye is dishonest."

Ivan is known to be honest. Ivan says: "Exactly two of Faye, George, and Holly are honest."

Which player among Faye, George, and Holly is dishonest?', NULL, NULL, 'A', 'Ivan is honest, so exactly two of Faye, George, and Holly are honest — meaning exactly one is dishonest. If George is honest, his claim that ''Holly and I are both honest'' is true, making Holly honest. Then Faye must be the dishonest one. Checking: Faye (dishonest) says ''George is dishonest'' — a lie, consistent since George is honest. Holly (honest) says ''Faye is dishonest'' — true, consistent. If instead George is dishonest, then Faye and Holly must both be honest. But Holly (honest) says ''Faye is dishonest,'' which would be false since Faye is honest — a contradiction. Therefore George must be honest and Faye is the dishonest player.', 11, 'hard')
  RETURNING id INTO v_q11;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q11, 'A', 'Faye', NULL, 1),
    (v_q11, 'B', 'George', NULL, 2),
    (v_q11, 'C', 'Holly', NULL, 3),
    (v_q11, 'D', 'It cannot be determined.', NULL, 4);

  -- Q12: interpreting_info - Regional Rainfall Data
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Regional Rainfall Data', 'interpreting_info'::dm_question_type, 'The table below shows the average monthly rainfall in millimetres for four regions over a four-month period.', '{"headers":["Region","January","February","March","April"],"rows":[["North","85","72","68","55"],["South","42","38","45","52"],["East","63","58","61","49"],["West","91","88","76","70"]]}'::jsonb, NULL, NULL, NULL, 12, 'normal')
  RETURNING id INTO v_q12;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q12, 'The West region had the highest rainfall in every month shown.', 'Yes', 'In January, West (91) is higher than North (85), South (42), and East (63). In February, West (88) exceeds all others. In March, West (76) exceeds North (68), South (45), and East (61). In April, West (70) exceeds North (55), South (52), and East (49). West has the highest rainfall in every month.', 1),
    (v_q12, 'The total rainfall for the South region across all four months was less than the total for the North region in January and February combined.', 'No', 'South total = 42 + 38 + 45 + 52 = 177 mm. North in January and February = 85 + 72 = 157 mm. 177 is greater than 157, not less. The statement is false.', 2),
    (v_q12, 'The North region had a decrease in rainfall from January to April.', 'Yes', 'North''s rainfall went from 85 mm in January to 55 mm in April. 55 is less than 85, confirming a decrease over this period.', 3),
    (v_q12, 'The East region had higher rainfall than the South region in every month.', 'No', 'In January (63 > 42), February (58 > 38), and March (61 > 45), East exceeds South. However, in April, East (49) is less than South (52). The statement fails in April.', 4),
    (v_q12, 'Rainfall in the West region decreased each month from January to April.', 'Yes', 'West''s monthly figures are 91, 88, 76, 70. Each value is lower than the one before: 91 > 88 > 76 > 70. The rainfall decreased every month.', 5);

  -- Q13: interpreting_info - Renewable Energy Report
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Renewable Energy Report', 'interpreting_info'::dm_question_type, 'A recent report states that the proportion of electricity generated from renewable sources in Country X rose from 18% in 2015 to 34% in 2023. Over the same period, total electricity consumption in the country increased by 12%. The report notes that investment in wind farms has doubled since 2018, while solar panel installations have grown by 150% since 2020. The report concludes that if current trends continue, renewable energy could supply more than half of the country''s electricity by 2030.', NULL, NULL, NULL, NULL, 13, 'normal')
  RETURNING id INTO v_q13;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q13, 'The total amount of electricity generated from renewable sources increased between 2015 and 2023.', 'Yes', 'The renewable share nearly doubled (18% to 34%) while total consumption also increased by 12%. If total consumption in 2015 was 100 units, renewable output was 18. In 2023, total consumption was 112 units, with renewable output at 34% of 112 = 38.1. The absolute amount increased from 18 to 38.1.', 1),
    (v_q13, 'Investment in wind farms doubled between 2015 and 2023.', 'No', 'The report states investment in wind farms has doubled ''since 2018,'' not since 2015. We have no information about investment levels in 2015, so we cannot conclude a doubling over the 2015–2023 period.', 2),
    (v_q13, 'Renewable energy will supply more than half of the country''s electricity by 2030.', 'No', 'The report says ''if current trends continue, renewable energy could supply more than half.'' This is a conditional projection using the word ''could,'' not a definite prediction. Future trends may change, so this cannot be stated as fact.', 3),
    (v_q13, 'Solar panel installations grew faster than wind farm investment between 2020 and 2023.', 'No', 'Solar installations grew 150% since 2020, while wind investment doubled since 2018. These cover different time periods and measure different things (installations vs investment). They cannot be directly compared over the same interval.', 4),
    (v_q13, 'The proportion of electricity from non-renewable sources decreased between 2015 and 2023.', 'Yes', 'If renewable energy rose from 18% to 34%, then non-renewable fell from 82% to 66%. The proportion from non-renewable sources decreased.', 5);

  -- Q14: interpreting_info - Bicycle Storage
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Bicycle Storage', 'interpreting_info'::dm_question_type, 'In a building''s bike storage, there are 40 bicycles. There are 24 road bikes and the rest are mountain bikes. Half of the road bikes are black and the other half are silver. None of the silver bicycles are mountain bikes.', NULL, NULL, NULL, NULL, 14, 'normal')
  RETURNING id INTO v_q14;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q14, 'Some of the mountain bikes are black.', 'No', 'We know mountain bikes cannot be silver (stated), but ''not silver'' does not mean ''black.'' Mountain bikes could be any non-silver colour — red, blue, green, or any other colour. We cannot conclude they are black.', 1),
    (v_q14, 'All of the silver bicycles are road bikes.', 'Yes', 'The only types of bicycle are road bikes and mountain bikes. None of the silver bicycles are mountain bikes. Therefore all silver bicycles must be road bikes.', 2),
    (v_q14, 'There are more black road bikes than silver mountain bikes.', 'Yes', 'There are 12 black road bikes (half of 24). There are zero silver mountain bikes (stated: none of the silver bicycles are mountain bikes). 12 is more than 0.', 3),
    (v_q14, 'There are fewer mountain bikes than silver bicycles.', 'No', 'There are 16 mountain bikes (40 − 24). All silver bicycles are road bikes, and there are 12 silver road bikes (half of 24). Since 16 is greater than 12, there are more mountain bikes than silver bicycles, not fewer.', 4),
    (v_q14, 'Half of all the bicycles are black.', 'No', 'We know 12 road bikes are black. Half of 40 is 20. We would need 8 mountain bikes to also be black, but we have no information about mountain bike colours beyond knowing they are not silver. We cannot determine the total number of black bicycles.', 5);

  -- Q15: interpreting_info - Volunteer Shift Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Volunteer Shift Survey', 'interpreting_info'::dm_question_type, 'A survey of 120 volunteers at a community centre found that volunteers work either morning shifts, afternoon shifts, or both. The survey showed that 78 volunteers work morning shifts and 65 work afternoon shifts. A follow-up report noted that volunteers who work both shifts were more likely to report feeling ''very satisfied'' with their role than those working a single shift. The centre manager stated that satisfaction levels have improved steadily since the introduction of flexible shift patterns two years ago.', NULL, NULL, NULL, NULL, 15, 'normal')
  RETURNING id INTO v_q15;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q15, '23 volunteers work both morning and afternoon shifts.', 'Yes', 'Using the inclusion-exclusion principle: morning + afternoon − both = total. So 78 + 65 − both = 120, giving both = 143 − 120 = 23.', 1),
    (v_q15, 'More volunteers work only morning shifts than work only afternoon shifts.', 'Yes', 'Morning only = 78 − 23 = 55. Afternoon only = 65 − 23 = 42. 55 is more than 42.', 2),
    (v_q15, 'Volunteers who work both shifts are more satisfied because they have more flexible hours.', 'No', 'The report notes a correlation between working both shifts and higher satisfaction, but does not establish a causal link to ''flexible hours.'' The satisfaction could be due to many other factors. This assumes a cause that is not stated in the data.', 3),
    (v_q15, 'Flexible shift patterns have caused satisfaction levels to improve.', 'No', 'The manager states that satisfaction improved since flexible shifts were introduced. However, this is correlation, not proven causation. Other changes over the two years could explain the improvement.', 4),
    (v_q15, 'Most volunteers work a single shift.', 'Yes', 'Volunteers working a single shift = 55 (morning only) + 42 (afternoon only) = 97. Out of 120 total, 97 work a single shift, which is about 81% — well over half, so ''most'' is correct.', 5);

  -- Q16: interpreting_info - Factory Production Output
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Factory Production Output', 'interpreting_info'::dm_question_type, 'The table below shows the daily output in units for four production lines over one working week.', '{"headers":["Line","Monday","Tuesday","Wednesday","Thursday","Friday"],"rows":[["A","120","135","128","140","132"],["B","98","102","115","108","97"],["C","150","142","138","145","155"],["D","85","90","88","92","95"]]}'::jsonb, NULL, NULL, NULL, 16, 'normal')
  RETURNING id INTO v_q16;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q16, 'Line C had the highest total output for the week.', 'Yes', 'Line A total = 120 + 135 + 128 + 140 + 132 = 655. Line B = 98 + 102 + 115 + 108 + 97 = 520. Line C = 150 + 142 + 138 + 145 + 155 = 730. Line D = 85 + 90 + 88 + 92 + 95 = 450. Line C at 730 has the highest total.', 1),
    (v_q16, 'Line B''s output increased from Monday to Friday.', 'No', 'Line B''s figures are 98, 102, 115, 108, 97. The output increased from Monday to Wednesday but then decreased on Thursday (108) and again on Friday (97). It did not increase throughout the week.', 2),
    (v_q16, 'The average daily output of Line A was more than 132 units.', 'No', 'Line A''s total output is 655. The average is 655 ÷ 5 = 131. This is less than 132, not more.', 3),
    (v_q16, 'Line D''s output increased every day throughout the week.', 'No', 'Line D''s figures are 85, 90, 88, 92, 95. From Tuesday (90) to Wednesday (88) there is a decrease. Therefore the output did not increase every day.', 4),
    (v_q16, 'The combined output of all four lines was highest on Thursday.', 'Yes', 'Monday combined = 120 + 98 + 150 + 85 = 453. Tuesday = 135 + 102 + 142 + 90 = 469. Wednesday = 128 + 115 + 138 + 88 = 469. Thursday = 140 + 108 + 145 + 92 = 485. Friday = 132 + 97 + 155 + 95 = 479. Thursday at 485 is the highest.', 5);

  -- Q17: interpreting_info - Trophy Cabinet Categories
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Trophy Cabinet Categories', 'interpreting_info'::dm_question_type, 'A sports club displays 36 trophies. Of these, 20 are gold and the rest are silver. There are 22 trophies for individual events and the rest are for team events. All of the gold trophies are for individual events. None of the silver team trophies were won after 2015.', NULL, NULL, NULL, NULL, 17, 'hard')
  RETURNING id INTO v_q17;
  INSERT INTO timed_decision_making_question_statements (question_id, statement_text, correct_answer, answer_reason, order_index) VALUES
    (v_q17, 'There are exactly 2 silver individual trophies.', 'Yes', 'There are 22 individual trophies in total and 20 gold trophies, all of which are for individual events. Therefore silver individual trophies = 22 − 20 = 2.', 1),
    (v_q17, 'All team trophies are silver.', 'Yes', 'All gold trophies are for individual events, meaning there are zero gold team trophies. Team trophies = 36 − 22 = 14. Since no gold trophy is a team trophy, all 14 team trophies must be silver.', 2),
    (v_q17, 'There are 14 gold team trophies.', 'No', 'All gold trophies are for individual events. This means there are zero gold team trophies, not 14. The 14 team trophies are all silver.', 3),
    (v_q17, 'All trophies won after 2015 are for individual events.', 'Yes', 'None of the silver team trophies were won after 2015, and all team trophies are silver (as shown above). Therefore no team trophy was won after 2015. Any trophy won after 2015 must be for an individual event.', 4),
    (v_q17, 'All trophies won after 2015 are gold.', 'No', 'We know trophies won after 2015 must be individual (since no team trophy was won after 2015). However, there are 2 silver individual trophies, and we do not know when they were won. One or both could have been won after 2015. Therefore some post-2015 trophies could be silver.', 5);

  -- Q18: strongest_argument - Meditation in Schools
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Meditation in Schools', 'strongest_argument'::dm_question_type, 'Should schools introduce daily meditation sessions to improve student concentration?', NULL, NULL, 'C', 'The proposition asks whether meditation should be introduced (action) to improve concentration (outcome). Option C is the strongest because it directly addresses both parts: it connects meditation (the action) to improved concentration (the outcome) with evidence about attention span and working memory. Option A addresses enjoyment rather than concentration — the wrong outcome. Option B focuses on practicality for ''some'' teachers, not whether meditation improves concentration. Option D addresses a different activity (PE) and does not directly counter whether meditation would improve concentration.', 18, 'normal')
  RETURNING id INTO v_q18;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q18, 'A', 'Yes; students would enjoy having a break during the school day.', NULL, 1),
    (v_q18, 'B', 'No; some teachers are not trained in meditation techniques.', NULL, 2),
    (v_q18, 'C', 'Yes; studies have shown that regular meditation practice improves attention span and working memory, which are directly linked to concentration in academic tasks.', NULL, 3),
    (v_q18, 'D', 'No; students already have physical education lessons to help them focus.', NULL, 4);

  -- Q19: strongest_argument - Banning Private Cars in City Centres
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Banning Private Cars in City Centres', 'strongest_argument'::dm_question_type, 'Should city centres ban private cars during weekday mornings to reduce air pollution?', NULL, NULL, 'C', 'The proposition asks whether banning cars (action) would reduce air pollution (outcome). Option C directly addresses both parts with evidence: it references data showing that similar bans do not reduce air pollution because traffic is displaced. Option A discusses noise reduction, not air pollution — wrong outcome. Option B focuses on convenience for commuters, not pollution levels. Option D notes that ''some'' commuters use public transport, which is about existing behaviour, not whether the ban would reduce pollution.', 19, 'normal')
  RETURNING id INTO v_q19;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q19, 'A', 'Yes; fewer cars would make city centres quieter for pedestrians.', NULL, 1),
    (v_q19, 'B', 'No; many people rely on their cars to commute to work in the city centre.', NULL, 2),
    (v_q19, 'C', 'No; data from cities that have introduced similar bans shows no significant reduction in citywide air pollution levels, as traffic is simply displaced to surrounding areas.', NULL, 3),
    (v_q19, 'D', 'Yes; some commuters already prefer to use public transport.', NULL, 4);

  -- Q20: strongest_argument - Age Verification on Social Media
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Age Verification on Social Media', 'strongest_argument'::dm_question_type, 'Should social media platforms require age verification to protect children from harmful content?', NULL, NULL, 'A', 'The proposition asks whether age verification (action) should be required to protect children from harmful content (outcome). Option A is strongest because it addresses both parts with evidence: research showing children under 13 face more harmful content, and age verification restricting their access. Option B discusses parental reassurance rather than actual protection from harmful content. Option C addresses educational use for ''some'' children, which is a tangential benefit rather than addressing the harmful content concern. Option D argues about bypass potential but does not address whether the measure would reduce exposure to harmful content for the majority.', 20, 'hard')
  RETURNING id INTO v_q20;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q20, 'A', 'Yes; research indicates that children under 13 who use social media without supervision are exposed to significantly more harmful content, and age verification would restrict their access.', NULL, 1),
    (v_q20, 'B', 'Yes; parents would feel reassured knowing their children cannot access social media.', NULL, 2),
    (v_q20, 'C', 'No; some children use social media for educational purposes.', NULL, 3),
    (v_q20, 'D', 'No; determined children will find ways to bypass age verification.', NULL, 4);

  -- Q21: strongest_argument - Four-Day Working Week
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Four-Day Working Week', 'strongest_argument'::dm_question_type, 'Should employers offer a four-day working week to improve employee productivity?', NULL, NULL, 'B', 'The proposition asks whether a four-day week (action) should be offered to improve productivity (outcome). Option B directly addresses both parts with evidence: trial data showing that reducing the week did not increase output per employee — directly challenging the link between the action and the desired outcome. Option A addresses personal time, not productivity. Option C focuses on practicality for ''some'' industries rather than productivity. Option D discusses morale, which is a different outcome from productivity.', 21, 'normal')
  RETURNING id INTO v_q21;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q21, 'A', 'Yes; employees would have more time for personal activities.', NULL, 1),
    (v_q21, 'B', 'No; a trial in several UK companies found that overall output per employee did not increase when the working week was reduced by one day.', NULL, 2),
    (v_q21, 'C', 'No; some industries require staff to be available five days a week.', NULL, 3),
    (v_q21, 'D', 'Yes; employee morale is generally higher when working fewer days.', NULL, 4);

  -- Q22: strongest_argument - Solar Panels on New Homes
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Solar Panels on New Homes', 'strongest_argument'::dm_question_type, 'Should all new homes be required to have solar panels to reduce household energy costs?', NULL, NULL, 'D', 'The proposition asks whether solar panels should be required (action) to reduce household energy costs (outcome). Option D is strongest because it directly addresses both parts with specific evidence: data showing a 40% reduction in electricity bills in countries with mandatory solar panels. Option A discusses aesthetics, not energy costs. Option B addresses the purchase price of homes, which is a different cost metric from ongoing household energy costs. Option C focuses on preferences of ''some'' homeowners and does not address whether solar panels reduce energy costs.', 22, 'normal')
  RETURNING id INTO v_q22;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q22, 'A', 'Yes; solar panels would make houses look more modern.', NULL, 1),
    (v_q22, 'B', 'No; the initial cost of installing solar panels increases the purchase price of new homes.', NULL, 2),
    (v_q22, 'C', 'No; some homeowners prefer to use gas heating rather than electricity.', NULL, 3),
    (v_q22, 'D', 'Yes; data from countries where solar panels are mandatory on new builds shows that household electricity bills are on average 40% lower.', NULL, 4);

  -- Q23: venn_diagram - Household Recycling Survey
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Household Recycling Survey', 'venn_diagram'::dm_question_type, 'A council surveyed 80 households about recycling habits. Of these, 38 households recycle paper, 34 recycle glass, and 42 recycle plastic. 15 recycle both paper and glass, 18 recycle both paper and plastic, and 12 recycle both glass and plastic. 8 households recycle all three materials, and 3 households recycle none.

Which of the following diagrams best represents the data?', NULL, NULL, 'C', 'Starting with the triple overlap: 8 households recycle all three. Paper and glass only (excluding those who also recycle plastic) = 15 − 8 = 7. Paper and plastic only = 18 − 8 = 10. Glass and plastic only = 12 − 8 = 4. The exclusive regions: paper only = 38 − 7 − 10 − 8 = 13, glass only = 34 − 7 − 4 − 8 = 15, plastic only = 42 − 10 − 4 − 8 = 20. Outside = 3. Total: 13 + 15 + 20 + 7 + 10 + 4 + 8 + 3 = 80. Only Option C has all these values correct. Option A swaps the paper-only and glass-only values. Option B uses the inclusive overlap counts without subtracting the triple overlap. Option D swaps the paper-glass and paper-plastic overlap values.', 23, 'normal')
  RETURNING id INTO v_q23;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q23, 'A', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Paper","shape":"diamond"},{"id":"set2","label":"Glass","shape":"trapezoid"},{"id":"set3","label":"Plastic","shape":"vertical_oval"}],"regions":{"set1_only":15,"set2_only":13,"set3_only":20,"set1_set2":7,"set1_set3":10,"set2_set3":4,"all_three":8,"outside":3}}'::jsonb, 1),
    (v_q23, 'B', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Paper","shape":"diamond"},{"id":"set2","label":"Glass","shape":"trapezoid"},{"id":"set3","label":"Plastic","shape":"vertical_oval"}],"regions":{"set1_only":5,"set2_only":7,"set3_only":12,"set1_set2":15,"set1_set3":18,"set2_set3":12,"all_three":8,"outside":3}}'::jsonb, 2),
    (v_q23, 'C', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Paper","shape":"diamond"},{"id":"set2","label":"Glass","shape":"trapezoid"},{"id":"set3","label":"Plastic","shape":"vertical_oval"}],"regions":{"set1_only":13,"set2_only":15,"set3_only":20,"set1_set2":7,"set1_set3":10,"set2_set3":4,"all_three":8,"outside":3}}'::jsonb, 3),
    (v_q23, 'D', '', '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Paper","shape":"diamond"},{"id":"set2","label":"Glass","shape":"trapezoid"},{"id":"set3","label":"Plastic","shape":"vertical_oval"}],"regions":{"set1_only":13,"set2_only":15,"set3_only":20,"set1_set2":10,"set1_set3":7,"set2_set3":4,"all_three":8,"outside":3}}'::jsonb, 4);

  -- Q24: venn_diagram - Sports Club Membership
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Sports Club Membership', 'venn_diagram'::dm_question_type, 'A sports club has 60 members. 28 play badminton, 22 play tennis, and 18 play swimming. 10 members play both badminton and tennis, and 6 play both badminton and swimming. No member plays both tennis and swimming. 8 members do not play any of these sports.

Which of the following diagrams best represents the data?', NULL, NULL, 'B', 'Since no member plays both tennis and swimming, these two sports are separate from each other but both overlap with badminton. Badminton only = 28 − 10 − 6 = 12. Tennis only = 22 − 10 = 12. Swimming only = 18 − 6 = 12. The badminton-tennis overlap has 10 members and the badminton-swimming overlap has 6. Outside = 8. Total: 12 + 12 + 12 + 10 + 6 + 8 = 60. Only Option B has all values correct. Option A fails to subtract the overlaps from badminton, giving 18 instead of 12 for badminton only. Option C swaps the two overlap values. Option D confuses the overlap and exclusive region values.', 24, 'normal')
  RETURNING id INTO v_q24;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q24, 'A', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Badminton","shape":"oval"},{"id":"set2","label":"Tennis","shape":"star"},{"id":"set3","label":"Swimming","shape":"hexagon"}],"regions":{"set1_only":18,"set2_only":12,"set3_only":12,"set1_set2":10,"set1_set3":6,"outside":2}}'::jsonb, 1),
    (v_q24, 'B', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Badminton","shape":"oval"},{"id":"set2","label":"Tennis","shape":"star"},{"id":"set3","label":"Swimming","shape":"hexagon"}],"regions":{"set1_only":12,"set2_only":12,"set3_only":12,"set1_set2":10,"set1_set3":6,"outside":8}}'::jsonb, 2),
    (v_q24, 'C', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Badminton","shape":"oval"},{"id":"set2","label":"Tennis","shape":"star"},{"id":"set3","label":"Swimming","shape":"hexagon"}],"regions":{"set1_only":12,"set2_only":12,"set3_only":12,"set1_set2":6,"set1_set3":10,"outside":8}}'::jsonb, 3),
    (v_q24, 'D', '', '{"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Badminton","shape":"oval"},{"id":"set2","label":"Tennis","shape":"star"},{"id":"set3","label":"Swimming","shape":"hexagon"}],"regions":{"set1_only":12,"set2_only":10,"set3_only":6,"set1_set2":12,"set1_set3":12,"outside":8}}'::jsonb, 4);

  -- Q25: venn_diagram - Pet Shop Animals
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty, hide_labels)
  VALUES (4,'Pet Shop Animals', 'venn_diagram'::dm_question_type, 'A pet shop has 45 animals, comprising cats, dogs, and rabbits. There are 20 cats, 12 dogs, and 10 rabbits. 5 animals are both cats and dogs. No animal is both a cat and a rabbit, and no animal is both a dog and a rabbit.

Which of the following diagrams is consistent with the data?', NULL, NULL, 'D', 'Cats and dogs overlap (5 are both), while rabbits are entirely separate. Cat-only = 20 − 5 = 15. Dog-only = 12 − 5 = 7. The overlap contains 5. Rabbits = 10 (separate). Total inside = 15 + 5 + 7 + 10 = 37, so outside = 45 − 37 = 8. Only Option D matches: the overlapping pair totals 15 + 5 = 20 (cats) and 7 + 5 = 12 (dogs), with the separate shape showing 10 (rabbits) and 8 outside. Option A has the wrong overlap value (7 instead of 5). Option B has 3 in the overlap instead of 5. Option C has 9 for the dog-only region instead of 7.', 25, 'normal', TRUE)
  RETURNING id INTO v_q25;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q25, 'A', '', '{"hideLabels":true,"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Cats","shape":"hexagon"},{"id":"set2","label":"Dogs","shape":"circle"},{"id":"set3","label":"Rabbits","shape":"pentagon"}],"regions":{"set1_only":13,"set1_set2":7,"set2_only":10,"set3_only":12,"outside":3}}'::jsonb, 1),
    (v_q25, 'B', '', '{"hideLabels":true,"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Cats","shape":"hexagon"},{"id":"set2","label":"Dogs","shape":"circle"},{"id":"set3","label":"Rabbits","shape":"pentagon"}],"regions":{"set1_only":17,"set1_set2":3,"set2_only":9,"set3_only":10,"outside":6}}'::jsonb, 2),
    (v_q25, 'C', '', '{"hideLabels":true,"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Cats","shape":"hexagon"},{"id":"set2","label":"Dogs","shape":"circle"},{"id":"set3","label":"Rabbits","shape":"pentagon"}],"regions":{"set1_only":15,"set1_set2":5,"set2_only":9,"set3_only":8,"outside":8}}'::jsonb, 3),
    (v_q25, 'D', '', '{"hideLabels":true,"diagramLayout":"three_hub","sets":[{"id":"set1","label":"Cats","shape":"hexagon"},{"id":"set2","label":"Dogs","shape":"circle"},{"id":"set3","label":"Rabbits","shape":"pentagon"}],"regions":{"set1_only":15,"set1_set2":5,"set2_only":7,"set3_only":10,"outside":8}}'::jsonb, 4);

  -- Q26: venn_diagram - Library Resource Categories
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Library Resource Categories', 'venn_diagram'::dm_question_type, 'The diagram shows library resources categorised by five attributes. Each letter marks a different region.

Which letter represents a resource that is available to borrow, is a new arrival, and is staff recommended, but does not have digital access?', NULL, '{"sets":[{"id":"set1","label":"Available to borrow","shape":"rectangle"},{"id":"set2","label":"Reference only","shape":"hexagon"},{"id":"set3","label":"Digital access","shape":"triangle"},{"id":"set4","label":"New arrivals","shape":"oval"},{"id":"set5","label":"Staff recommended","shape":"pentagon"}],"regions":{"set2_only":"P","set1_set2":"Q","set1_only":"R","set1_set4":"S","set1_set4_set5":"T","set1_set3_set5":"U","set3_only":"V","outside":"W"}}'::jsonb, 'B', 'The question asks for a resource that is available to borrow (inside the rectangle), is a new arrival (inside the circle), and is staff recommended (inside the diamond), but does not have digital access (outside the triangle). Letter T is in the region where the rectangle, circle, and diamond all overlap, but outside the triangle — matching all four conditions. Letter S is where the rectangle and circle overlap without the diamond, so it is missing the staff recommended attribute. Letter U is where the rectangle, triangle, and diamond overlap — this includes digital access, which the question excludes. Letter R is inside the rectangle only, missing both new arrival and staff recommended.', 26, 'hard')
  RETURNING id INTO v_q26;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q26, 'A', 'Letter S', NULL, 1),
    (v_q26, 'B', 'Letter T', NULL, 2),
    (v_q26, 'C', 'Letter U', NULL, 3),
    (v_q26, 'D', 'Letter R', NULL, 4);

  -- Q27: venn_diagram - Festival Event Categories
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Festival Event Categories', 'venn_diagram'::dm_question_type, 'The diagram shows festival events categorised by six attributes. Each letter marks a different region.

Which letter represents an indoor event with food stalls and evening sessions, but without live music, workshop activities, or free entry?', NULL, '{"sets":[{"id":"set1","label":"Indoor events","shape":"rectangle"},{"id":"set2","label":"Live music","shape":"octagon"},{"id":"set3","label":"Food stalls","shape":"trapezoid"},{"id":"set4","label":"Workshop activities","shape":"star"},{"id":"set5","label":"Evening sessions","shape":"vertical_oval"},{"id":"set6","label":"Free entry","shape":"diamond"}],"regions":{"set1_set2":"P","set1_set2_set3":"Q","set1_set3":"R","set1_set3_set5":"S","set1_set4":"T","set1_set5":"U","set1_only":"V","set1_set6":"W","set6_only":"X","outside":"Y"}}'::jsonb, 'B', 'The question asks for an event that is indoor (inside the rectangle), has food stalls (inside the pentagon), and is an evening session (inside the diamond), but does not have live music (outside the circle), workshop activities (outside the hexagon), or free entry (outside the triangle). Letter S is in the region where the rectangle, pentagon, and diamond overlap, outside all other shapes — matching every condition. Letter R is where the rectangle and pentagon overlap without the diamond, missing evening sessions. Letter U is where the rectangle and diamond overlap without the pentagon, missing food stalls. Letter Q includes live music, which the question excludes.', 27, 'hard')
  RETURNING id INTO v_q27;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q27, 'A', 'Letter R', NULL, 1),
    (v_q27, 'B', 'Letter S', NULL, 2),
    (v_q27, 'C', 'Letter U', NULL, 3),
    (v_q27, 'D', 'Letter Q', NULL, 4);

  -- Q28: venn_diagram - University Course Requirements
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'University Course Requirements', 'venn_diagram'::dm_question_type, 'The diagram shows university courses categorised by three attributes. All courses that require programming also require statistics. All courses that require statistics are Social Science courses. Each letter marks a different region.

Which letter represents a Social Science course that requires both statistics and programming?', NULL, '{"sets":[{"id":"set1","label":"Social Science","shape":"octagon"},{"id":"set2","label":"Statistics required","shape":"pentagon"},{"id":"set3","label":"Programming required","shape":"circle"}],"regions":{"set1_only":"P","set1_set2":"Q","all_three":"R","outside":"S"}}'::jsonb, 'C', 'The diagram shows three concentric shapes: the hexagon (Social Science) contains the diamond (statistics required), which contains the star (programming required). A course requiring both statistics and programming would be inside all three shapes — the innermost region. This is letter R. Letter P represents Social Science courses that do not require statistics. Letter Q represents courses requiring statistics but not programming — in the ring between the diamond and star. Letter S is outside all three categories.', 28, 'normal')
  RETURNING id INTO v_q28;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q28, 'A', 'Letter P', NULL, 1),
    (v_q28, 'B', 'Letter Q', NULL, 2),
    (v_q28, 'C', 'Letter R', NULL, 3),
    (v_q28, 'D', 'Letter S', NULL, 4);

  -- Q29: probabilistic - Medical Screening Accuracy
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Medical Screening Accuracy', 'probabilistic'::dm_question_type, 'A rapid blood test for a condition is 92% accurate when the condition is present (it correctly identifies 92% of people who have the condition) and 88% accurate when the condition is absent (it correctly identifies 88% of people who do not have the condition). The test is described as 95% precise because it gives the same result 95 out of 100 times when repeated.

Dr. Shah claims that the test is more accurate at detecting the condition than at ruling it out.

Which of the following is the best response to Dr. Shah''s claim?', NULL, NULL, 'A', 'The test has 92% accuracy at detecting the condition (sensitivity) and 88% accuracy at ruling it out (specificity). Since 92% is higher than 88%, Dr. Shah''s claim is correct. Option A identifies this comparison correctly. Option B confuses precision (consistency of repeated results) with accuracy (correctness of results) — they are different concepts. Option C incorrectly claims accuracy and precision are the same thing. Option D wrongly reclassifies the 88% as precision when it is actually the accuracy rate for ruling out the condition.', 29, 'normal')
  RETURNING id INTO v_q29;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q29, 'A', 'Yes; the test correctly identifies 92% of people with the condition, which is higher than the 88% accuracy for those without it.', NULL, 1),
    (v_q29, 'B', 'Yes; the 95% precision means the test consistently gives the correct result.', NULL, 2),
    (v_q29, 'C', 'No; accuracy and precision are the same thing, so the 95% precision applies equally to both.', NULL, 3),
    (v_q29, 'D', 'No; the 88% figure refers to precision, not accuracy.', NULL, 4);

  -- Q30: probabilistic - Coloured Marble Draw
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Coloured Marble Draw', 'probabilistic'::dm_question_type, 'A bag contains 6 red marbles, 4 blue marbles, and 2 green marbles. Two marbles are drawn one after the other without replacement.

What is the probability that both marbles drawn are red?', NULL, NULL, 'B', 'There are 12 marbles in total. The probability of drawing a red marble first is 6/12 = 1/2. After removing one red marble, 5 red remain out of 11 total. The probability of a second red is 5/11. Multiplying: 1/2 × 5/11 = 5/22. Option A (1/4) incorrectly multiplies 6/12 × 6/12, treating the draws as if with replacement. Option C (1/6) is not based on a valid calculation. Option D (5/12) incorrectly uses 5/12 instead of 5/11 for the second draw.', 30, 'normal')
  RETURNING id INTO v_q30;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q30, 'A', '1/4', NULL, 1),
    (v_q30, 'B', '5/22', NULL, 2),
    (v_q30, 'C', '1/6', NULL, 3),
    (v_q30, 'D', '5/12', NULL, 4);

  -- Q31: probabilistic - Bus Punctuality
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Bus Punctuality', 'probabilistic'::dm_question_type, 'A survey found that Bus Route A arrives on time 80% of the time and Bus Route B arrives on time 75% of the time. The two routes operate independently.

What is the probability that at least one of the two buses is late on a given day?', NULL, NULL, 'B', 'The easiest approach is to find the probability that both are on time and subtract from 1. Both on time = 0.80 × 0.75 = 0.60 = 60%. At least one late = 1 − 0.60 = 0.40 = 40%. Option A (5%) is the probability that both are late (0.20 × 0.25 = 0.05). Option C (45%) incorrectly adds the late probabilities (20% + 25%). Option D (20%) only considers Route A''s late probability.', 31, 'normal')
  RETURNING id INTO v_q31;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q31, 'A', '5%', NULL, 1),
    (v_q31, 'B', '40%', NULL, 2),
    (v_q31, 'C', '45%', NULL, 3),
    (v_q31, 'D', '20%', NULL, 4);

  -- Q32: probabilistic - Six-Sided Die Rolls
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Six-Sided Die Rolls', 'probabilistic'::dm_question_type, 'A fair six-sided die is rolled twice. What is the probability of rolling a number greater than 4 on at least one of the two rolls?', NULL, NULL, 'C', 'Numbers greater than 4 are 5 and 6, so the probability on a single roll is 2/6 = 1/3. The probability of NOT rolling greater than 4 is 2/3. The probability of failing on both rolls is 2/3 × 2/3 = 4/9. Therefore, the probability of at least one success is 1 − 4/9 = 5/9. Option A (1/3) is the probability for a single roll only. Option B (2/3) incorrectly doubles the single-roll probability. Option D (1/9) is the probability of rolling greater than 4 on both rolls (1/3 × 1/3).', 32, 'normal')
  RETURNING id INTO v_q32;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q32, 'A', '1/3', NULL, 1),
    (v_q32, 'B', '2/3', NULL, 2),
    (v_q32, 'C', '5/9', NULL, 3),
    (v_q32, 'D', '1/9', NULL, 4);

  -- Q33: probabilistic - Factory Widget Defect Rate
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Factory Widget Defect Rate', 'probabilistic'::dm_question_type, 'A factory produces two types of widget. Type X has a defect rate of 3% and Type Y has a defect rate of 5%. The factory produces Type X and Type Y in a ratio of 3:2.

A widget is selected at random from the production line. What is the probability that the widget is defective?', NULL, NULL, 'A', 'In a 3:2 production ratio, Type X accounts for 3/5 = 60% and Type Y for 2/5 = 40% of production. The overall defect probability is a weighted average: (0.60 × 3%) + (0.40 × 5%) = 1.8% + 2.0% = 3.8%. Option B (4.0%) incorrectly uses a simple average of 3% and 5% without weighting by production ratio. Option C (8.0%) incorrectly adds the two defect rates. Option D (3.0%) only considers Type X''s defect rate, ignoring Type Y.', 33, 'hard')
  RETURNING id INTO v_q33;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q33, 'A', '3.8%', NULL, 1),
    (v_q33, 'B', '4.0%', NULL, 2),
    (v_q33, 'C', '8.0%', NULL, 3),
    (v_q33, 'D', '3.0%', NULL, 4);

  -- Q34: probabilistic - Spinner Probability
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Spinner Probability', 'probabilistic'::dm_question_type, 'A spinner is divided into 8 equal sections numbered 1 to 8. The spinner is spun once.

What is the probability of landing on a prime number or a number greater than 6?', NULL, NULL, 'B', 'The prime numbers from 1 to 8 are 2, 3, 5, and 7 (four numbers). The numbers greater than 6 are 7 and 8 (two numbers). The union of these sets is {2, 3, 5, 7, 8} — five numbers (note that 7 appears in both conditions but is counted only once). The probability is 5 out of 8 sections = 5/8. Option A (3/4 = 6/8) overcounts by including an extra number. Option C (1/2 = 4/8) only counts the prime numbers without including 8. Option D (3/8) undercounts the favourable outcomes.', 34, 'normal')
  RETURNING id INTO v_q34;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q34, 'A', '3/4', NULL, 1),
    (v_q34, 'B', '5/8', NULL, 2),
    (v_q34, 'C', '1/2', NULL, 3),
    (v_q34, 'D', '3/8', NULL, 4);

  -- Q35: probabilistic - Chocolate Box Selection
  INSERT INTO timed_decision_making_questions (test_id, title, type, stem, table_data, stimulus_diagram, correct_answer, answer_reason, order_index, difficulty)
  VALUES (4,'Chocolate Box Selection', 'probabilistic'::dm_question_type, 'A box contains 10 chocolates: 4 milk, 3 dark, and 3 white. Two chocolates are selected at random without replacement.

Given that the first chocolate selected is dark, what is the probability that the second chocolate is also dark?', NULL, NULL, 'B', 'After selecting one dark chocolate, there are 2 dark chocolates remaining out of 9 total chocolates left. The conditional probability is 2/9. Option A (3/10) uses the original count of dark chocolates and the original total, ignoring that one dark chocolate has already been removed. Option C (1/3 = 3/9) adjusts the total to 9 but forgets to subtract one from the dark count. Option D (1/5 = 2/10) correctly subtracts from the dark count but uses the original total of 10 instead of 9.', 35, 'hard')
  RETURNING id INTO v_q35;
  INSERT INTO timed_decision_making_question_options (question_id, label, option_text, option_data, order_index) VALUES
    (v_q35, 'A', '3/10', NULL, 1),
    (v_q35, 'B', '2/9', NULL, 2),
    (v_q35, 'C', '1/3', NULL, 3),
    (v_q35, 'D', '1/5', NULL, 4);

END $$;
