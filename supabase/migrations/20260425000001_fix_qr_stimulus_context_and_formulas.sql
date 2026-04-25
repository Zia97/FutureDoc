-- Normalise timed QR stimuli so:
--   1. Every non-text stimulus has a `context` field that begins with a sentence
--      describing what the visual shows.
--   2. Formulas / unit conversions / rate footnotes are pushed to the bottom of
--      the context (or the multi text item) on their own line, separated by a
--      blank line, and wrapped in *...* so QRStimulusRenderer renders them in
--      italics (see src/components/qr/QRStimulusRenderer.js stripItalicMarkers).
--   3. No formulas/conversions remain inline in the main descriptive prose.
--
-- This is a content-only update; no schema changes.

------------------------------------------------------------------
-- Group A: non-text stimuli that had no `context` at all.
------------------------------------------------------------------

-- qr1-set-04 Supermarket Sales (bar chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The bar chart below shows weekly sales (in £000s) across six departments of a supermarket for two consecutive weeks.'
)
WHERE id = '38f67c82-1e73-48fb-b50a-e1ab68c715d8';

-- qr1-set-07 Revision vs Score (scatter plot)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'Each point on the scatter plot represents a Year 11 student. The x-axis shows total revision hours and the y-axis shows the exam score (%). Two classes are plotted.'
)
WHERE id = 'ef8692a1-b55c-4f31-87c2-c8892b7d91b1';

-- qr1-set-08 Restaurant Chain Annual Budget (pie chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The pie chart below shows how a restaurant chain''s annual budget of £310 million is split across five categories. The Marketing slice is unlabelled.'
)
WHERE id = '5d0fe949-dd48-4549-bb13-0126ac2b395a';

-- qr1-set-10 Packaging Tray (geometry diagram)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The diagram below shows an open-top cardboard tray. The base is 8 inches by 6 inches, and the side walls are 1 inch tall.'
)
WHERE id = '4d081688-bc16-4b2c-8bae-5d81efc3b2d8';

-- qr1-set-11 Population Growth Index (line graph)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The line graph below shows the population growth index for three UK regions from 2018 to 2023, with 2018 set as the base year (index = 100).'
)
WHERE id = 'e9a6d249-f865-4f7f-add6-bb2251c0e065';

-- qr2-set-08 Carbon Emissions (scatter plot)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'Each point on the scatter plot represents a country. The x-axis shows GDP per capita (£000s) and the y-axis shows annual CO₂ emissions in tonnes per person.'
)
WHERE id = 'b54dabc3-61c8-4bc0-9859-33cbfd46e225';

-- qr3-set-04 House Price Trends (line graph)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The line graph below shows the average house price (in £000s) for three UK regions from 2019 to 2024.'
)
WHERE id = 'a9acd9a8-c4da-4ce8-a06d-de6e585cddbf';

-- qr4-set-02 Heritage Sites (bar chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The bar chart below shows the number of adult and child visitors to five UK heritage sites in 2025.'
)
WHERE id = '5bfc0a78-e118-4702-8f12-f525927ff721';

-- qr4-set-08 Subject Enrolment (pie chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The pie chart below shows the subject enrolment of 1,200 students at Greenfield Academy. The Sciences slice is unlabelled.'
)
WHERE id = '530a6fba-16a0-4e79-ba57-cb95f4229860';

-- qr4-set-09 Marathon Training (scatter plot)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'Each point on the scatter plot represents a runner. The x-axis shows weekly training volume in km, and the y-axis shows the runner''s marathon finish time in minutes.'
)
WHERE id = '5e6e4629-a7af-44f3-94bf-b98dfe771426';

-- qr4-set-04 UK City Temperatures (line graph)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = stimulus || jsonb_build_object(
  'context',
  'The line graph below shows the monthly average temperature (°C) for three UK cities from January to August 2025.'
)
WHERE id = 'f82d7e30-3d6d-4546-b3a8-1a1cba40d7c2';

------------------------------------------------------------------
-- Group B: context exists but is only formulas/footnotes/missing-data
-- notes — needs a leading description of the visual, with formulas
-- and rates moved to italic lines beneath.
------------------------------------------------------------------

-- qr1-set-09 Energy Consumption (table)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The table below shows the power rating, daily and weekly usage, and brand for five household appliances.' ||
    E'\n\n*Energy (kWh) = Power (kW) × Time (hours)*' ||
    E'\n\n*Electricity costs 28p per kWh. Assume 4.3 weeks per month.*'
  )
)
WHERE id = '3237f0e2-6d76-4cd9-ae7f-5b36fdf49a77';

-- qr1-set-05 Highland Rescue Patrol Routes (network diagram)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The network diagram below shows the patrol route between a rescue HQ and five posts (A–E). Each edge label gives the travel time between two locations in days.' ||
    E'\n\n*1 day''s journey covers 15 km*'
  )
)
WHERE id = '51e2d4c7-e74d-4947-8df4-3ddd22b2a713';

-- qr2-set-13 L-shaped Patio (geometry diagram)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The diagram below shows a plan view of an L-shaped patio with all side lengths labelled in metres.' ||
    E'\n\n*Paving slabs cost £22 per m².*'
  )
)
WHERE id = '734a385a-1c39-4e4b-9b01-afbb5b76b5ff';

-- qr3-set-08 Small Business Monthly Expenses (pie chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The pie chart below shows the breakdown of monthly expenses (in £) by category for a small business in March.'::text
  )
)
WHERE id = '1a2b85d3-9400-4888-8e49-a9fe0d5ad67d';

-- qr3-set-13 UK Income Tax Calculation (table)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The table below shows UK income tax bands and the rate applied to taxable income within each band.' ||
    E'\n\n*National Insurance is not included. Figures are for the 2025/26 tax year.*'
  )
)
WHERE id = '6f59bccd-2bcd-495f-b2c5-35a570ca6d8e';

-- qr2-set-10 Charity Fundraising Budget (pie chart)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The pie chart below shows the charity''s annual fundraising income of £120,000 split by source. The Grant Funding slice is unlabelled. The charity has 45 active volunteers across all fundraising activities.'::text
  )
)
WHERE id = 'd16d1d9d-accb-4882-95e4-a326bcc5b653';

-- qr1-set-01 Hospital Ward Occupancy (table)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The table below shows the daily patient count for five hospital wards from Monday to Friday.' ||
    E'\n\nWard capacities: Cardiology 32, Orthopaedics 45, Paediatrics 18, Neurology 35, Oncology 25. The weekly mean occupancy for Orthopaedics was 36.4 patients.'
  )
)
WHERE id = '39394de0-978e-4d50-89c1-0a5f0959c8d3';

-- qr2-set-04 University Library Monthly Loans (line graph)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The line graph below shows the number of monthly book loans across three university faculties from September to April.' ||
    E'\n\nJanuary data for the Science faculty was unavailable due to a system error. The total Science loans across all 8 months were 11,580.'
  )
)
WHERE id = '93785a4b-2590-496a-b012-e273e79e552b';

-- qr1-set-06 Regional Gym Membership Rates (line graph)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The line graph below shows the gym membership rate (%) for three UK regions from 2018 to 2023.' ||
    E'\n\n2021 data for the North region was not recorded due to a data collection error.'
  )
)
WHERE id = 'ff0b6ba3-add8-469f-857a-2cd33f57c6f2';

-- qr3-set-07 T-Shaped Garden Paving (geometry diagram)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The diagram below shows a plan view of a T-shaped paved area in a garden, with all side lengths labelled in metres.' ||
    E'\n\n*Paving slabs cost £15 per square metre. Edging strip for the border costs £4.50 per metre.*'
  )
)
WHERE id = 'f0370bab-341f-472d-9051-609173ad31c9';

-- qr1-set-12 Office Technology Equipment Order (table)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The table below shows the unit price, quantity ordered, applicable discount, and VAT rate for five items in an office equipment order.' ||
    E'\n\n*Discounts are applied to the unit price first, then VAT is applied to the discounted price.*'
  )
)
WHERE id = 'c41613c4-7d70-49b6-88a2-a9fd33bc2c76';

------------------------------------------------------------------
-- Group C: formulas/conversions inline in main stem text — split
-- onto a trailing italic line.
------------------------------------------------------------------

-- qr3-set-10 Driving Route Comparison (multi: text item index 0)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{items,0,text}',
  to_jsonb(
    'A family drives from Bristol to Edinburgh.' ||
    E'\n\n*The car uses 8 litres of fuel per 100 km. Petrol costs £1.50 per litre. 1 mile = 1.6 km.*'
  )
)
WHERE id = '4f454ab5-f6f2-4796-ba7a-243804883f98';

-- qr2-set-09 Local Bus Service – Route 42 (multi: text item index 0)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{items,0,text}',
  to_jsonb(
    'Route 42 runs between Greenfield and Laketown. An adult single fare is £2.40. Children under 16 travel at half the adult fare. A monthly pass for unlimited travel costs £85.' ||
    E'\n\n*1 mile = 1.6 km*'
  )
)
WHERE id = 'b1bff806-f8c1-4e0d-8a2f-ba617d5f3e1b';

-- qr2-set-06 Water Tank Capacity (text)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{text}',
  to_jsonb(
    'A rectangular water tank has external dimensions 1,200 mm × 800 mm × 600 mm. The walls and base are uniformly 100 mm thick and the tank is open at the top.' ||
    E'\n\n*1 litre = 1,000 cm³*'
  )
)
WHERE id = '83996377-9205-4601-a8ca-32eab48b6259';

-- qr4-set-03 Cylindrical Grain Silo (text)
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{text}',
  to_jsonb(
    'A grain silo has a cylindrical body with an internal diameter of 6 metres and a height of 14 metres. One cubic metre of grain weighs 720 kg.' ||
    E'\n\n*Use π = 3.14*'
  )
)
WHERE id = 'cd2ced71-55ab-40a1-ab8e-58c81d449820';

-- qr3-set-01 Student Exam Performance (table) — formula was inline in context
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The table below shows exam results for six Year 11 students across four subjects. The multiplier in brackets shows each subject''s weighting in the overall grade calculation. All scores are out of 100.' ||
    E'\n\n*Weighted average = Σ(score × weight) ÷ Σ(weights)*'
  )
)
WHERE id = '75247b37-6141-4bf2-b143-bac50c56b441';

-- qr3-set-02 Community Renewable Energy Balance (bar chart) — rates inline
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The bar chart below shows the monthly net energy balance (in MWh) for a community renewable scheme. Positive values indicate energy surplus sold back to the grid; negative values indicate energy purchased from the grid.' ||
    E'\n\n*Grid buyback rate: £85 per MWh. Purchase rate: £120 per MWh.*'
  )
)
WHERE id = 'a68c4649-48d3-4f6d-a4fc-b551beaec652';

-- qr2-set-02 Artisan Bakery (bar chart) — formula combined with prose on one line
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{context}',
  to_jsonb(
    'The bar chart below shows the bakery''s monthly revenue and costs (in £000s) from January to June. The bakery opened in October the previous year.' ||
    E'\n\n*Profit Margin (%) = (Profit ÷ Revenue) × 100*'
  )
)
WHERE id = 'e6918f82-b630-4e95-9dfc-02af2be57ab1';

-- qr4-set-05 Greenhouse Gas Intensity (multi: text item index 1) —
-- formula and prose were on a single line which would italicise the whole line
UPDATE timed_quantitative_reasoning_sets
SET stimulus = jsonb_set(
  stimulus,
  '{items,1,text}',
  to_jsonb(
    'A lower carbon intensity indicates a more carbon-efficient sector.' ||
    E'\n\n*Carbon Intensity = Emissions (kt CO₂e) ÷ Revenue (£m)*'
  )
)
WHERE id = 'a60cccfa-487c-4fc3-9f48-c5422a35356c';

------------------------------------------------------------------
-- Bump the timed QR content version so all client caches re-fetch
-- the corrected stimuli.
------------------------------------------------------------------

UPDATE content_versions
   SET version    = version + 1,
       updated_at = now()
 WHERE section = 'timed_quantitative_reasoning';
