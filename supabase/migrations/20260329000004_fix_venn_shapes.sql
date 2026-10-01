-- Fix venn diagram shapes for questions with tight overlap regions
-- Q13 (test 1): star→pentagon, trapezoid→rectangle
-- Q24 (test 3): parallelogram→hexagon, isosceles_triangle→circle, trapezoid→square

BEGIN;

-- Q13 test 1: update stem text
UPDATE timed_decision_making_questions
SET stem = 'A craft workshop surveyed 50 members about materials they work with. 8 use Wood only, 6 use Metal only, 4 use Glass only, 5 use Wood and Metal only, 3 use Wood and Glass only, 4 use Metal and Glass only, 6 use all three materials, and 14 use none.

The hexagon represents Wood, the pentagon represents Metal, and the rectangle represents Glass.

Which of the following diagrams best represents the data?'
WHERE title = 'Craft Workshop Materials' AND test_id = 1;

-- Q13 test 1: update option diagrams
UPDATE timed_decision_making_question_options
SET option_data = '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE title = 'Craft Workshop Materials' AND test_id = 1)
AND label = 'A';

UPDATE timed_decision_making_question_options
SET option_data = '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":3,"set1_set3":5,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE title = 'Craft Workshop Materials' AND test_id = 1)
AND label = 'B';

UPDATE timed_decision_making_question_options
SET option_data = '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":6,"set2_only":8,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":4,"all_three":6,"outside":14}}'::jsonb
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE title = 'Craft Workshop Materials' AND test_id = 1)
AND label = 'C';

UPDATE timed_decision_making_question_options
SET option_data = '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Wood","shape":"hexagon"},{"id":"set2","label":"Metal","shape":"pentagon"},{"id":"set3","label":"Glass","shape":"rectangle"}],"regions":{"set1_only":8,"set2_only":6,"set3_only":4,"set1_set2":5,"set1_set3":3,"set2_set3":6,"all_three":4,"outside":14}}'::jsonb
WHERE question_id = (SELECT id FROM timed_decision_making_questions WHERE title = 'Craft Workshop Materials' AND test_id = 1)
AND label = 'D';

-- Q24 test 3: update stem and stimulus_diagram
UPDATE timed_decision_making_questions
SET stem = E'The diagram shows artists categorised by the paint media they use. The hexagon represents Oils, the circle represents Watercolour, and the square represents Acrylic. Each letter marks a different region.\n\nWhich letter represents artists who use both Oils and Watercolour but not Acrylic?',
    stimulus_diagram = '{"diagramLayout":"three_all_overlap","sets":[{"id":"set1","label":"Oils","shape":"hexagon"},{"id":"set2","label":"Watercolour","shape":"circle"},{"id":"set3","label":"Acrylic","shape":"square"}],"regions":{"set1_only":"A","set2_only":"B","set3_only":"C","set1_set2":"D","set1_set3":"E","set2_set3":"F","all_three":"G","outside":"H"}}'::jsonb,
    answer_reason = 'Oils = hexagon (set1), Watercolour = circle (set2). Their overlap excluding Acrylic (square, set3) is set1_set2 = D. E is Oils + Acrylic. F is Watercolour + Acrylic. G is all three. Answer: A (Letter D).'
WHERE title = 'Art Medium' AND test_id = 3;

COMMIT;
