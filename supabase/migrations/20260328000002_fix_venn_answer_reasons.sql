-- Fix venn diagram answer_reason fields to remove technical set references
-- and make them human-readable for students.
-- Affects: Test 2 (6 questions), Test 3 (6 questions)

-- ============================================================
-- TEST 2
-- ============================================================

-- Q10: Medical Conditions (order_index = 10)
UPDATE timed_decision_making_questions
SET answer_reason = 'Diabetes is shown as the square, Asthma is the octagon, and Hypertension is the circle. The region inside both the square (Diabetes) and the octagon (Asthma), but outside the circle (Hypertension), is labelled U. Region T is where Diabetes and Hypertension overlap. Region V is where Hypertension and Asthma overlap. Region Z is where all three shapes overlap. The correct answer is B (Letter U).'
WHERE test_id = 2 AND order_index = 10;

-- Q12: Fruit Preferences (order_index = 12)
UPDATE timed_decision_making_questions
SET answer_reason = 'Apples only = 3. Apples and Bananas overlap = 2. Bananas only = 2. Bananas and Cherries overlap = 4. Cherries only = 1. Total = 3 + 2 + 2 + 4 + 1 = 12. Only option B has all five values correct. Option A swaps the two overlap regions. Option C swaps the Apples-only and Bananas-only counts. Option D swaps the Bananas-only count with the Bananas–Cherries overlap.'
WHERE test_id = 2 AND order_index = 12;

-- Q24: Rock and Jazz Music (order_index = 24)
UPDATE timed_decision_making_questions
SET answer_reason = 'Rock only = 8. Both Rock and Jazz = 7. Jazz only = 5. Total = 8 + 7 + 5 = 20. Only option C has all three values correct. Option A swaps the Rock-only and Jazz-only counts. Option B puts the overlap as 5 instead of 7. Option D puts 7 in Rock only and 8 in the overlap.'
WHERE test_id = 2 AND order_index = 24;

-- Q25: School Activity Groups (order_index = 25)
UPDATE timed_decision_making_questions
SET answer_reason = 'Year Group is the rectangle, Debaters is the circle, Musicians is the diamond, and Athletes is the triangle. Region E is inside the rectangle, the circle, and the diamond — but outside the triangle. This represents pupils in the Year Group who are both Debaters and Musicians but not Athletes. Region D is Year Group and Debaters only (no Musicians). Region F is Year Group, Athletes, and Musicians (no Debaters). Region G is Athletes only. The correct answer is B (Letter E).'
WHERE test_id = 2 AND order_index = 25;

-- Q27: Online vs In-Store Shopping (order_index = 27)
UPDATE timed_decision_making_questions
SET answer_reason = 'Online only = 15. In-store only = 10. There is no overlap, so the shapes must be completely separate. Only option B correctly shows 15 for online and 10 for in-store with no overlap. Option A swaps the counts. Option C incorrectly shows an overlap of 5. Option D shows 15 for both groups.'
WHERE test_id = 2 AND order_index = 27;

-- Q30: Youth Club Hobbies (order_index = 30)
UPDATE timed_decision_making_questions
SET answer_reason = 'Painting only = 4. Painting and Drawing overlap = 3. Drawing only = 2. Photography only = 6. Total = 4 + 3 + 2 + 6 = 15. Only option D has all four values correct. Option A swaps the Painting-only and Photography-only counts. Option B swaps the overlap and Drawing-only counts. Option C swaps the Painting-only count and the overlap.'
WHERE test_id = 2 AND order_index = 30;

-- ============================================================
-- TEST 3
-- ============================================================

-- Q05: Gym Membership Types (order_index = 5)
UPDATE timed_decision_making_questions
SET answer_reason = 'Pool only = 10. Both pool and gym floor = 12. Gym floor only = 8. Total = 10 + 12 + 8 = 30. Only option A has all three values correct. Option B swaps the pool-only and gym-floor-only counts. Option C puts the overlap as 10 and pool-only as 12. Option D puts the overlap as 8.'
WHERE test_id = 3 AND order_index = 5;

-- Q08: Science Fair Entries (order_index = 8)
UPDATE timed_decision_making_questions
SET answer_reason = 'Physics is shown as the parallelogram, Chemistry as the star, and Biology as the oval. The region inside both Physics and Chemistry but outside Biology is labelled M. N is where Physics and Biology overlap (without Chemistry). P is where Chemistry and Biology overlap (without Physics). Q is where all three shapes overlap. The correct answer is B (Letter M).'
WHERE test_id = 3 AND order_index = 8;

-- Q13: Tea and Coffee Drinkers (order_index = 13)
UPDATE timed_decision_making_questions
SET answer_reason = 'Tea is shown as the triangle, Coffee as the oval, and Hot Chocolate as the star. Region A is inside the Tea shape but outside both Coffee and Hot Chocolate — meaning Tea only. B is where Tea and Coffee overlap. C is Coffee only. D is where Coffee and Hot Chocolate overlap. The correct answer is A.'
WHERE test_id = 3 AND order_index = 13;

-- Q22: Holiday Activities (order_index = 22)
UPDATE timed_decision_making_questions
SET answer_reason = 'Swimming is shown as the trapezoid, Hiking as the hexagon, and Cycling as the parallelogram. The region where Swimming and Hiking overlap but outside Cycling is labelled T. U is where Swimming and Cycling overlap. V is where Hiking and Cycling overlap. Z is where all three shapes overlap. The correct answer is B (Letter T).'
WHERE test_id = 3 AND order_index = 22;

-- Q32: Campus Facilities (order_index = 32)
UPDATE timed_decision_making_questions
SET answer_reason = 'Library is shown as the hexagon, Canteen as the trapezoid, and Sports Hall as the triangle. Region H is inside the hexagon but outside both the trapezoid and triangle — meaning Library only. J is where Library and Canteen overlap. K is Canteen only. M is outside all shapes. The correct answer is C (Letter H).'
WHERE test_id = 3 AND order_index = 32;

-- Q35: Student Transport Survey (order_index = 35)
UPDATE timed_decision_making_questions
SET answer_reason = 'Walk is shown as the parallelogram and Cycle as the star. Region E is inside the parallelogram but outside the star — students who walk but do not cycle. F is where Walk and Cycle overlap. G is Cycle only. H is outside both shapes (neither walk nor cycle). The correct answer is C (Letter E).'
WHERE test_id = 3 AND order_index = 35;
