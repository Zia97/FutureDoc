-- 1. QR Test 1, Set 07 (Revision Hours vs Exam Score) — regenerate scatter with fewer, well-spread points
UPDATE public.timed_quantitative_reasoning_sets
SET stimulus = '{"data":{"title":"Revision Hours vs Exam Score — Year 11 Students","series":[{"name":"Class A","points":[{"x":10,"y":45},{"x":20,"y":60},{"x":30,"y":72},{"x":40,"y":82},{"x":50,"y":90}]},{"name":"Class B","points":[{"x":10,"y":38},{"x":20,"y":50},{"x":30,"y":60},{"x":40,"y":70},{"x":50,"y":78}]}],"xAxisLabel":"Total Revision Hours","yAxisLabel":"Exam Score (%)"},"type":"scatter_plot","context":"Each point on the scatter plot represents a Year 11 student. The x-axis shows total revision hours and the y-axis shows the exam score (%). Two classes are plotted."}'::jsonb
WHERE id = 'ef8692a1-b55c-4f31-87c2-c8892b7d91b1';

-- Update q1 (qr1-s07-q1): direct read on Class A at 30 hours
UPDATE public.timed_quantitative_reasoning_questions
SET stem = 'A student in Class A revised for 30 hours. What score did they achieve?',
    options = '[{"text":"65%","label":"A"},{"text":"68%","label":"B"},{"text":"72%","label":"C"},{"text":"76%","label":"D"},{"text":"80%","label":"E"}]'::jsonb,
    correct_answer = 'C',
    answer_reason = 'Locate the Class A point at x = 30 hours on the scatter plot. The y-value is 72%. The answer is 72%.',
    difficulty = 'normal'
WHERE question_ref = 'qr1-s07-q1';

-- Update q2 (qr1-s07-q2): difference between classes at 40 hours
UPDATE public.timed_quantitative_reasoning_questions
SET stem = 'For students who revised 40 hours, what is the difference in exam score between Class A and Class B?',
    options = '[{"text":"8 percentage points","label":"A"},{"text":"10 percentage points","label":"B"},{"text":"12 percentage points","label":"C"},{"text":"14 percentage points","label":"D"},{"text":"16 percentage points","label":"E"}]'::jsonb,
    correct_answer = 'C',
    answer_reason = 'Step 1: At x = 40 hours, the Class A point is at y = 82% and the Class B point is at y = 70%.

Step 2: Difference = 82 − 70 = 12 percentage points.

The answer is 12 percentage points.',
    difficulty = 'normal'
WHERE question_ref = 'qr1-s07-q2';


-- 2. QR Test 2, Set 01 (Hospital Referral Pathways) — abbreviate column headers only
UPDATE public.timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
    stimulus,
    '{data,headers}',
    '["Source","Cardio","Derm","Ortho","Gastro","Total"]'::jsonb
)
WHERE id = '4c19655a-74f9-4347-b145-7482223080d6';


-- 3. QR Test 2, Set 05 (Paint Roller Surface Areas) — prepend context paragraph
UPDATE public.timed_quantitative_reasoning_sets
SET stimulus = '{"type":"multi","items":[{"text":"A DIY store sells five brands of paint roller. The table below shows each roller''s dimensions and weight.","type":"text"},{"data":{"rows":[["RollEase","25","7","120"],["PaintPro","30","14","280"],["QuickCoat","21","7","95"],["MasterRoll","35","14","340"],["MiniRoll","14","7","65"]],"headers":["Brand","Length (cm)","Diameter (cm)","Weight (g)"]},"type":"table"},{"text":"Curved surface area of a cylinder = πdh, where d is the diameter, h is the length, and π = 22/7.","type":"text"}]}'::jsonb
WHERE id = 'cb791030-f2e2-422b-909d-64fdb58e2eb4';


-- 4. QR Test 3, Set 03 (Patient Drug Dosage) — prepend context paragraph
UPDATE public.timed_quantitative_reasoning_sets
SET stimulus = '{"type":"multi","items":[{"text":"A hospital prescribes a weight-based medication to five patients. The table below shows each patient''s weight and age.","type":"text"},{"data":{"rows":[["Patient A","72","45"],["Patient B","96","62"],["Patient C","54","28"],["Patient D","108","55"],["Patient E","84","38"]],"headers":["Patient","Weight (kg)","Age"]},"type":"table"},{"text":"Standard dose = 15 mg per kg of body weight per day, divided into 3 equal doses. Maximum single dose = 450 mg.","type":"text"}]}'::jsonb
WHERE id = 'b57041d4-c1cc-4e71-9d04-bf37f72df59f';
