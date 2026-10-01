-- Fix: Remove layout/shape descriptions from venn diagram stems and answer reasons
-- The rendered diagram + key already conveys this information visually

-- Q18: Science Subject Students — remove "Physics and Chemistry overlap; Biology is completely separate from both."
UPDATE timed_decision_making_questions
SET stem = 'The diagram below categorises sixth-form students by the science subjects they study. Each letter marks a different region.

Which letter represents a student who studies Chemistry but not Physics or Biology?'
WHERE test_id = 1 AND order_index = 18;

-- Q21: Athletic Activities — answer_reason opens with shape-label mapping the key already shows
UPDATE timed_decision_making_questions
SET answer_reason = 'Region Q is inside Swimming but outside Running — this is where athletes who swim but do not run belong. That matches the question, so the answer is A.

Region R is the overlap between both shapes — athletes who both swim and run. Region S is inside Running only — runners who do not swim. Region P is outside both shapes entirely — athletes who do neither.'
WHERE test_id = 1 AND order_index = 21;

-- Q18: Science Subject Students — answer_reason references shape names the key already shows
UPDATE timed_decision_making_questions
SET answer_reason = 'A student who studies Chemistry but not Physics or Biology must be inside the Chemistry region only, with no overlap with any other set. That region is labelled R, so the answer is C.

Region P is Physics only — not overlapping with Chemistry or Biology. Region Q is the overlap between Physics and Chemistry — students studying both. Region S is Biology only, which does not overlap with either Physics or Chemistry.'
WHERE test_id = 1 AND order_index = 18;
