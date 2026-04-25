-- Seed practice QR sets and questions from preview-qr.json
-- 104 sets, 400 questions total

INSERT INTO quantitative_reasoning_sets (set_ref, title, stimulus, is_free) VALUES
  ('practice-qr-set-01', 'GP Training Region Allocations', '{"type":"table","context":"1,800 applicants applied for GP training posts last year. The cross-tabulation below shows each applicant''s home deanery (rows) and the deanery they were actually placed in (columns).","data":{"headers":["Home \\ Placement","London","Midlands","North","South West","Home Total"],"rows":[["London","380","60","40","20","500"],["Midlands","80","290","90","40","500"],["North","20","80","360","40","500"],["South West","20","70","10","200","300"],["Placement Total","500","500","500","300","1800"]]}}', true),
  ('practice-qr-set-02', 'Weekly GP Appointments by Age Group', '{"type":"bar_chart","context":"The bar chart below shows the number of appointments at a GP surgery during one week in March 2026, broken down by patient age group and appointment type.","data":{"title":"Weekly Appointments at Southgate Surgery (March 2026)","labels":["0–17","18–39","40–64","65+"],"series":[{"name":"Routine","values":[140,220,280,360]},{"name":"Urgent","values":[35,55,80,120]}],"yAxisLabel":"Number of Appointments","unit":""}}', true),
  ('practice-qr-set-03', 'HbA1c Levels Over Six Months', '{"type":"line_graph","context":"HbA1c values are reported in mmol/mol. The NHS diabetes treatment target for most adults is below 48 mmol/mol.","data":{"title":"HbA1c by Patient (Jan–Jun 2026)","labels":["Jan","Feb","Mar","Apr","May","Jun"],"series":[{"name":"Patient A","values":[72,68,65,60,58,55]},{"name":"Patient B","values":[85,80,78,75,72,70]},{"name":"Patient C","values":[58,60,62,64,66,68]}],"yAxisLabel":"HbA1c (mmol/mol)","unit":""}}', true),
  ('practice-qr-set-04', 'UK Household Energy Sources (2025)', '{"type":"pie_chart","context":"The pie chart below shows the percentage breakdown of energy sources used by UK households in 2025.","data":{"title":"UK Household Energy Mix 2025 (% of total)","segments":[{"label":"Natural Gas","value":42},{"label":"Electricity","value":28},{"label":"Heating Oil","value":12},{"label":"Renewables","value":10},{"label":"Other","value":8}],"unit":"%"}}', true),
  ('practice-qr-set-05', 'Weekday Ward Bed Occupancy', '{"type":"table","context":"The table shows the number of occupied beds per ward, Monday to Friday. The weekly mean ICU occupancy for the week was 16 beds.","data":{"headers":["Ward","Mon","Tue","Wed","Thu","Fri","Capacity"],"rows":[["Cardiology","24","22","25","23","21","30"],["ICU","14","16","15","?","18","20"],["Maternity","18","17","19","20","16","24"],["Oncology","22","24","23","25","26","28"]]}}', false),
  ('practice-qr-set-06', 'Gym Membership Tiers', '{"type":"text","text":"A gym offers three membership tiers: Basic at £25 per month, Plus at £40 per month, and Elite at £65 per month. Every new member also pays a one-off joining fee of £30. Members who pay 12 months upfront receive a 15% discount on their monthly fees (but the joining fee is charged in full). All prices shown already include VAT at 20%."}', false),
  ('practice-qr-set-07', 'UK Income Tax Bands', '{"type":"table","context":"Income tax bands for the 2025/26 UK tax year. National Insurance is not included. Taxable income is income after any pension contributions have been deducted.","data":{"headers":["Taxable Income","Rate","Band Name"],"rows":[["£0 – £12,570","0%","Personal Allowance"],["£12,571 – £50,270","20%","Basic Rate"],["£50,271 – £125,140","40%","Higher Rate"],["Over £125,140","45%","Additional Rate"]]}}', false),
  ('practice-qr-set-08', 'Quarterly Revenue and Net Profit/Loss', '{"type":"bar_chart","context":"The bar chart below shows quarterly revenue and net profit or loss for a company over five quarters.","formula":"Profit margin (%) = Net Profit ÷ Revenue × 100","data":{"title":"Quarterly Revenue and Net P/L (£000s)","labels":["Q1","Q2","Q3","Q4","Q5"],"series":[{"name":"Revenue","values":[120,95,140,160,180]},{"name":"Net P/L","values":[15,-8,20,-5,35]}],"yAxisLabel":"Amount (£000s)","unit":"£"}}', false),
  ('practice-qr-set-09', 'Two-Year Fixed-Rate Mortgage Products', '{"type":"multi","items":[{"type":"text","text":"A borrower is comparing three 2-year fixed-rate mortgage products. Interest is compounded annually — each year''s interest is calculated on the balance at the start of that year and added to the balance. Assume interest-only (no capital repayments) over the 2-year fix."},{"type":"formula","text":"Compound formula: Final balance = Initial × (1 + rate)^years"},{"type":"table","data":{"headers":["Product","Annual Rate","Arrangement Fee"],"rows":[["Alpha Fixed 2","4.50%","£999"],["Beta Fixed 2","4.25%","£1,499"],["Gamma Fixed 2","4.80%","£499"]]}}]}', false),
  ('practice-qr-set-10', 'Compound Interest Savings Account', '{"type":"text","text":"A savings account pays interest at an Annual Equivalent Rate (AER) of 4.00%. Interest compounds annually — each year''s interest is calculated on the new balance. A customer deposits £5,000 on 1 January and makes no further deposits or withdrawals.\n\n*Compound formula: Final balance = Initial × (1 + rate)ⁿ (where n = years)*"}', false),
  ('practice-qr-set-11', 'UK Rail Fares from London', '{"type":"table","context":"The table below shows UK rail fares from London to four destinations, including three fare types and the distance of each route.","data":{"headers":["Destination","Distance (miles)","Anytime Return (£)","Off-Peak Return (£)","Advance Single from (£)"],"rows":[["Birmingham","121","220","98","34"],["Manchester","202","386","152","55"],["Edinburgh","393","510","210","65"],["Bristol","118","245","110","42"]]}}', false),
  ('practice-qr-set-12', 'Multi-Leg Drive: Norwich to Aberystwyth', '{"type":"text","text":"Maria drives from Norwich to Aberystwyth via Birmingham. The first leg, Norwich to Birmingham, is 180 miles and she averages 60 mph. She takes a 30-minute lunch break in Birmingham. The second leg, Birmingham to Aberystwyth, is 140 miles and she averages 35 mph.\n\n*1 mile = 1.6 km*"}', false),
  ('practice-qr-set-13', 'Daily Commute Times', '{"type":"line_graph","context":"The line graph below shows the daily commute time for two people across a working week.","data":{"title":"Commute Time by Day (minutes)","labels":["Mon","Tue","Wed","Thu","Fri"],"series":[{"name":"Emma","values":[35,48,42,55,38]},{"name":"Jake","values":[52,45,50,48,46]}],"yAxisLabel":"Minutes","unit":""}}', false),
  ('practice-qr-set-14', 'Car Fuel Efficiency Comparison', '{"type":"multi","items":[{"type":"text","text":"Combined miles per gallon (mpg) measures a car''s fuel efficiency.\n\n*1 UK gallon = 4.546 litres*"},{"type":"table","data":{"headers":["Model","Engine Size","Combined mpg","CO₂ (g/km)"],"rows":[["Zephyr 1.5","1.5 L","48","125"],["Gale 2.0","2.0 L","36","155"],["Mistral Hybrid","1.6 L","62","90"],["Breeze 1.2","1.2 L","55","110"]]}}]}', false),
  ('practice-qr-set-15', 'London to Dubai Flight', '{"type":"text","text":"A commercial aircraft flies from London to Dubai, a distance of 3,414 miles. The full flight takes 7 hours 15 minutes — this includes taxi, climb, cruise, descent and landing. The cruise phase alone accounts for 85% of total flight time, during which the aircraft holds a steady speed of 480 mph.\n\n*1 mile = 1.6 km*\n*1 nautical mile = 1.852 km*"}', false),
  ('practice-qr-set-16', 'Year 13 Mock Exam Scores', '{"type":"table","context":"End-of-year mock exam scores for five Year 13 students, shown as percentages out of 100.","data":{"headers":["Student","Maths (%)","Biology (%)","Chemistry (%)","English (%)","Art (%)"],"rows":[["Alex","68","75","72","82","90"],["Bella","85","88","82","70","65"],["Chen","92","95","90","78","72"],["Dani","55","62","48","75","88"],["Emir","78","70","85","88","55"]]}}', false),
  ('practice-qr-set-17', 'Revision Hours vs Exam Score', '{"type":"scatter_plot","context":"The scatter plot below shows revision hours and exam scores for six students, each labelled A to F.","data":{"title":"Revision Hours vs Exam Score (6 students)","xAxisLabel":"Revision Hours","yAxisLabel":"Score (%)","series":[{"name":"Students","points":[{"x":5,"y":42,"label":"A"},{"x":10,"y":58,"label":"B"},{"x":15,"y":65,"label":"C"},{"x":20,"y":78,"label":"D"},{"x":25,"y":85,"label":"E"},{"x":30,"y":72,"label":"F"}]}]}}', false),
  ('practice-qr-set-18', 'Sixth-Form Attendance Rates', '{"type":"text","text":"A sixth-form college records attendance across its five A-level subject groups during a month of 20 teaching days. Attendance rates by subject were: Biology 96%, Chemistry 92%, Physics 88%, Mathematics 94%, Further Mathematics 84%. Enrolment: Biology 125 students, Chemistry 98, Physics 72, Mathematics 140, Further Mathematics 45."}', false),
  ('practice-qr-set-19', 'Departmental Enrolment (3-Year)', '{"type":"table","context":"Student enrolment by university department across three academic years. The final column is the three-year total. Data for Sciences 2025 was not yet published — only the three-year total is known.","data":{"headers":["Department","2023","2024","2025","2023–2025 Total"],"rows":[["Mathematics","240","260","280","780"],["Sciences","180","195","?","585"],["Humanities","120","115","110","345"],["Arts","95","100","105","300"]]}}', false),
  ('practice-qr-set-20', 'L-Shaped Classroom Floor', '{"type":"geometry_diagram","context":"The diagram below shows the floor plan of an L-shaped classroom, with all dimensions given in metres.","data":{"title":"Classroom Floor Plan (plan view, dimensions in metres)","viewBox":{"width":300,"height":220},"shapes":[{"type":"polygon","points":[[40,40],[120,40],[120,80],[240,80],[240,160],[40,160]],"fill":"none","stroke":"#2d3748"}],"dimensions":[{"from":[40,25],"to":[120,25],"label":"4 m","side":"top"},{"from":[130,40],"to":[130,80],"label":"2 m","side":"right"},{"from":[40,180],"to":[240,180],"label":"10 m","side":"bottom"},{"from":[35,40],"to":[35,160],"label":"6 m","side":"left"}]}}', false),
  ('practice-qr-set-21', 'Monthly Rainfall in Two UK Cities', '{"type":"line_graph","context":"The line graph below shows monthly rainfall in millimetres for two UK cities across the first six months of 2025.","data":{"title":"Monthly Rainfall 2025 (mm)","labels":["Jan","Feb","Mar","Apr","May","Jun"],"series":[{"name":"Manchester","values":[98,85,72,64,55,68]},{"name":"Plymouth","values":[112,95,80,60,48,52]}],"yAxisLabel":"Rainfall (mm)","unit":""}}', false),
  ('practice-qr-set-22', 'Local Council Waste Disposal (2025)', '{"type":"pie_chart","context":"Breakdown of household waste disposal methods for a local council in 2025. The Landfill segment value was not reported directly but the five segments sum to 100%.","data":{"title":"Household Waste Disposal by Method 2025","segments":[{"label":"Recycled","value":45},{"label":"Composted","value":15},{"label":"Incinerated","value":20},{"label":"Landfill","value":null},{"label":"Other","value":5}],"total":100,"unit":"%"}}', false),
  ('practice-qr-set-23', 'Cylindrical Water Tank', '{"type":"text","text":"A cylindrical water tank has an internal diameter of 2.4 metres and a height of 3.0 metres. It is being filled from a tap with a steady flow rate of 18 litres per minute.\n\n*Use π = 3.14*\n*1 m³ = 1,000 litres*"}', false),
  ('practice-qr-set-24', 'UK Carbon Emissions by Sector', '{"type":"table","context":"Annual carbon emissions in megatonnes of CO₂ (MtCO₂) by UK economic sector. The 2030 Target column shows the government''s stated reduction target.","data":{"headers":["Sector","2015 (MtCO₂)","2020 (MtCO₂)","2025 (MtCO₂)","2030 Target (MtCO₂)"],"rows":[["Energy","140","100","75","55"],["Transport","120","105","95","70"],["Industry","95","80","68","50"],["Buildings","85","72","60","45"],["Agriculture","60","58","56","50"]]}}', false),
  ('practice-qr-set-25', 'Neighbouring District Population Densities', '{"type":"text","text":"Three neighbouring districts have the following populations and areas: District A has 48,000 residents in 12 km²; District B has 84,000 residents in 28 km²; District C has 36,000 residents in 6 km²."}', false),
  ('practice-qr-set-26', 'Outpatient Referrals by Specialty and Region', '{"type":"table","context":"The cross-tabulation shows the number of outpatient referrals made last quarter by three NHS regions (columns) across five specialties (rows). One cell is missing.","data":{"headers":["Specialty \\ Region","North","Central","South","Row Total"],"rows":[["Cardiology","180","210","150","540"],["Dermatology","240","260","200","700"],["Gastroenterology","120","?","130","410"],["Neurology","90","110","100","300"],["Rheumatology","110","140","120","370"],["Column Total","740","880","700","2320"]]}}', false),
  ('practice-qr-set-27', 'A-Level A*/A Grades by Subject and Cohort', '{"type":"bar_chart","context":"The bar chart below shows the number of students achieving A*/A grades in five subjects, comparing two consecutive cohorts (2024 and 2025).","data":{"title":"Students Achieving A*/A by Subject (2024 vs 2025)","labels":["Biology","Chemistry","Physics","Maths","English"],"series":[{"name":"2024","values":[180,160,140,220,120]},{"name":"2025","values":[210,150,165,240,130]}],"yAxisLabel":"Number of Students","unit":""}}', false),
  ('practice-qr-set-28', 'Train Operator Punctuality (Jan–Jun)', '{"type":"line_graph","context":"Punctuality is reported as the percentage of trains arriving within 5 minutes of schedule. Operator A recorded a 6-month mean punctuality of 85%, though its April figure is missing from the chart.","data":{"title":"Monthly Train Punctuality by Operator (%)","labels":["Jan","Feb","Mar","Apr","May","Jun"],"series":[{"name":"Operator A","values":[88,86,84,null,83,87]},{"name":"Operator B","values":[78,80,83,85,86,88]},{"name":"Operator C","values":[92,91,87,85,83,82]}],"yAxisLabel":"Punctuality (%)","unit":""}}', false),
  ('practice-qr-set-29', 'Monthly Household Budget Breakdown', '{"type":"pie_chart","context":"A family''s monthly net income of £3,600 is allocated entirely across the six spending categories below. The Entertainment segment is not labelled with a value on the chart.","data":{"title":"Monthly Household Budget (£)","segments":[{"label":"Housing","value":1080},{"label":"Food","value":540},{"label":"Transport","value":450},{"label":"Utilities","value":360},{"label":"Entertainment","value":null},{"label":"Savings","value":900}],"total":3600,"unit":"£"}}', false),
  ('practice-qr-set-30', 'Sourdough Bakery Recipe Costing', '{"type":"text","text":"A bakery''s sourdough loaf recipe makes 4 loaves and uses the following ingredients per batch: 1,200 g strong white flour, 800 ml water, 30 g salt, 20 g fresh yeast, and 200 g sourdough starter. Ingredient prices: flour costs £1.40 per kg; salt costs £0.95 per 500 g tub; fresh yeast costs £3.60 per 250 g block. Water and sourdough starter prices are not listed. The oven is preheated to 230°C and each loaf is sold for £4.20."}', false),
  ('practice-qr-set-31', 'Regional Branch Net Profit (2024 vs 2025)', '{"type":"bar_chart","context":"The bar chart below shows net profit in thousands of pounds for six regional branches in 2024 and 2025. Negative values indicate a loss.","data":{"title":"Net Profit by Branch (£000s)","labels":["Branch A","Branch B","Branch C","Branch D","Branch E","Branch F"],"series":[{"name":"2024","values":[42,18,-5,35,-12,28]},{"name":"2025","values":[55,-8,22,40,5,-10]}],"yAxisLabel":"Net Profit (£000s)","unit":"£"}}', false),
  ('practice-qr-set-32', 'Patient BMI Clinic', '{"type":"multi","items":[{"type":"text","text":"BMI classifications: under 18.5 is underweight; 18.5–24.9 is healthy weight; 25.0–29.9 is overweight; 30.0 or above is obese.\n\n*BMI = weight (kg) ÷ height² (m²)*"},{"type":"table","data":{"headers":["Patient","Weight (kg)","Height (m)","Age (years)"],"rows":[["A","72","1.80","34"],["B","95","1.75","52"],["C","58","1.65","28"],["D","84","1.68","45"],["E","62","1.70","60"]]}}]}', false),
  ('practice-qr-set-33', 'UK City Population Density vs Average Rent', '{"type":"scatter_plot","context":"The scatter plot below shows population density and average monthly rent for five UK cities, each labelled A to E.","data":{"title":"Population Density vs Average Monthly Rent (5 UK cities)","xAxisLabel":"Population density (people per km²)","yAxisLabel":"Average monthly rent (£)","series":[{"name":"Cities","points":[{"x":1800,"y":650,"label":"A"},{"x":2500,"y":750,"label":"E"},{"x":3100,"y":900,"label":"B"},{"x":4200,"y":1100,"label":"C"},{"x":5800,"y":1850,"label":"D"}]}]}}', false),
  ('practice-qr-set-34', 'Shop Floor: Rectangle with Semicircular Bay', '{"type":"geometry_diagram","context":"The diagram below shows the floor plan of a shop, consisting of a rectangular section with a semicircular bay. All dimensions are in metres.","data":{"title":"Shop floor (not to scale)","viewBox":{"width":310,"height":200},"shapes":[{"type":"line","x1":50,"y1":50,"x2":210,"y2":50,"stroke":"#a0aec0"},{"type":"line","x1":50,"y1":50,"x2":50,"y2":150,"stroke":"#a0aec0"},{"type":"line","x1":50,"y1":150,"x2":210,"y2":150,"stroke":"#a0aec0"},{"type":"arc","cx":210,"cy":100,"r":50,"startAngle":-90,"endAngle":90,"stroke":"#a0aec0"},{"type":"line","x1":210,"y1":50,"x2":210,"y2":150,"stroke":"#a0aec0","strokeDasharray":"4,3"}],"dimensions":[{"from":[50,30],"to":[210,30],"label":"8 m","side":"top"},{"from":[35,50],"to":[35,150],"label":"5 m","side":"left"},{"from":[210,170],"to":[260,170],"label":"2.5 m","side":"bottom"}]}}', false),
  ('practice-qr-set-35', 'UK Income Tax and Salary Sacrifice', '{"type":"text","text":"Maya earns a gross salary of £72,000 per year. The UK income tax bands for her tax year are: £0–£12,570 at 0% (personal allowance); £12,571–£50,270 at 20% (basic rate); £50,271–£125,140 at 40% (higher rate); over £125,140 at 45% (additional rate). Her employer operates a pension salary-sacrifice scheme in which sacrificed pay is deducted from gross salary before income tax is calculated. National Insurance is not considered in this scenario. Assume take-home pay is gross salary minus any pension sacrifice minus income tax."}', false),
  ('practice-qr-set-36', 'UK Population by Age Band and Region (2024)', '{"type":"table","data":{"headers":["Region","0-17 (000s)","18-39 (000s)","40-64 (000s)","65+ (000s)","Median age (years)","Regional total (000s)"],"rows":[["North","520","790","860","430","41.2","2,600"],["Midlands","610","880","940","470","42.5","2,900"],["South","680","1,050","1,120","550","40.8","3,400"],["West","420","?","680","340","43.1","2,010"]]},"context":"Populations are given in thousands. The four regions shown cover the whole country; the overall population totals 10,910,000."}', false),
  ('practice-qr-set-37', 'Average Monthly Temperature in Three UK Cities (2025)', '{"type":"line_graph","context":"The line graph below shows the average monthly temperature in degrees Celsius for three UK cities throughout 2025.","data":{"title":"Average Monthly Temperature 2025 (°C)","labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"series":[{"name":"Edinburgh","values":[4,4,6,8,11,14,16,16,14,11,7,5]},{"name":"Cardiff","values":[6,6,8,10,13,16,18,18,15,12,8,7]},{"name":"Brighton","values":[7,7,9,11,14,18,19,19,17,13,10,8]}],"yAxisLabel":"Temperature (°C)","unit":""}}', false),
  ('practice-qr-set-38', 'Pension Fund Investment Portfolio', '{"type":"pie_chart","context":"A pension fund''s £45,000,000 portfolio is split across five asset classes as shown below.","data":{"title":"Portfolio Allocation (£)","segments":[{"label":"UK Equities","value":18000000},{"label":"Global Bonds","value":11250000},{"label":"Emerging Markets","value":6750000},{"label":"Property","value":5400000},{"label":"Cash","value":3600000}],"total":45000000,"unit":"£"}}', false),
  ('practice-qr-set-39', 'City Marathon Finishing Times', '{"type":"bar_chart","context":"All 500 runners who completed this year''s city marathon, grouped by finishing time band.","data":{"title":"Runners by Finishing Time Band","labels":["Under 3:00","3:00-3:29","3:30-3:59","4:00-4:29","4:30-4:59","5:00 or over"],"series":[{"name":"Runners","values":[35,80,140,125,75,45]}],"yAxisLabel":"Number of runners","unit":""}}', false),
  ('practice-qr-set-40', 'FastLink Northern Train Services', '{"type":"multi","items":[{"type":"text","text":"FastLink runs direct trains between three northern stations (Manchester, Liverpool and Leeds). Standard Class single tickets are priced at 15p per mile travelled. Passengers with a Senior Railcard pay 70% of the standard fare, and children under 11 travel free. Service T318 includes a scheduled stop at Manchester whose duration is not published; all other services run non-stop between their origin and destination."},{"type":"table","data":{"headers":["Service","Route","Departure","Arrival","Distance (miles)","Seats available"],"rows":[["T101","Manchester → Liverpool","09:15","10:05","35","42"],["T205","Leeds → Manchester","10:40","11:55","44","17"],["T318","Liverpool → Leeds","12:20","14:05","75","28"],["T422","Manchester → Leeds","15:50","17:15","44","33"],["T507","Leeds → Liverpool","19:35","21:20","75","9"]]}}]}', false),
  ('practice-qr-set-41', 'Department Store Sales by Category and Region', '{"type":"table","context":"The table below shows sales figures (in £000s) for a department store, broken down by product category and geographic region, with row and column totals.","data":{"headers":["Category","North","South","East","West","Total"],"rows":[["Electronics","180","240","160","220","800"],["Clothing","320","280","360","240","1200"],["Groceries","500","600","450","450","2000"],["Homeware","200","180","230","190","800"],["Total","1200","1300","1200","1100","4800"]]}}', false),
  ('practice-qr-set-42', 'A&E Waiting Times by Hospital', '{"type":"bar_chart","context":"The bar chart below shows the number of A&E patients per week at three hospitals, grouped by how long they waited to be seen.","data":{"title":"Weekly A&E Patients by Waiting-Time Bucket","labels":["Ashbury","Broomfield","Crandon"],"series":[{"name":"Less than 1 hour","values":[420,320,280]},{"name":"1 to 2 hours","values":[280,360,400]},{"name":"More than 2 hours","values":[100,220,320]}],"yAxisLabel":"Patients per week","unit":""}}', false),
  ('practice-qr-set-43', 'Emergency Drug Loading Doses', '{"type":"multi","items":[{"type":"text","text":"For each drug, the loading dose for an adult patient is calculated using the formula below. Every loading dose is capped at 500 mg per patient, so any calculated value above 500 mg must be given as 500 mg. The ''Max daily total'' column is a separate 24-hour limit and is not used when calculating a single loading dose.\n\n*Loading dose (mg) = dose (mg/kg) × patient weight (kg)*"},{"type":"table","data":{"headers":["Drug","Loading dose (mg/kg)","Max daily total (mg)"],"rows":[["Drug A","8","400"],["Drug B","12","600"],["Drug C","6","360"],["Drug D","15","750"]]}}]}', false),
  ('practice-qr-set-44', 'CloudVault Storage Plans', '{"type":"text","text":"CloudVault offers three monthly cloud-storage tiers, all prices quoted before VAT at 20%. Starter costs £4 per month and includes 100 GB; any data stored above 100 GB is charged at £0.05 per GB. Plus costs £10 per month and includes 500 GB; data above 500 GB is charged at £0.03 per GB. Pro costs £25 per month with unlimited storage but requires a 12-month minimum contract. A promotion gives new Starter customers 50% off the £4 monthly base fee for the first 3 months only (overage charges are not discounted). All customers generate data measured in GB.\n\n*1 GB = 1,000 MB*"}', false),
  ('practice-qr-set-45', 'Industrial Water Tank Flow', '{"type":"text","text":"An industrial cylindrical water tank has a total capacity of 12 m³. Water flows into the tank through an inlet pipe at 150 litres per minute, and drains out through an outlet at 90 litres per minute. Both pipes can be opened or closed independently. At the start of the shift, the tank is 25% full. A maintenance warning sticker on the side of the tank lists its empty mass as 340 kg.\n\n*1 m³ = 1,000 L*"}', false),
  ('practice-qr-set-46', 'Quarterly Revenue: Two High-Street Retailers', '{"type":"line_graph","context":"Quarterly revenue (£m) for two UK high-street retailers from Q1 2023 to Q4 2024. Revenue data for Retailer A in Q3 2024 is missing because the figure had not been reported at the time of publication. Retailer A''s stated mean quarterly revenue across the four quarters of 2024 is £54m.","data":{"title":"Quarterly Revenue (£m)","labels":["Q1 2023","Q2 2023","Q3 2023","Q4 2023","Q1 2024","Q2 2024","Q3 2024","Q4 2024"],"series":[{"name":"Retailer A","values":[42,48,45,55,50,52,null,60]},{"name":"Retailer B","values":[38,40,44,50,46,48,52,58]}],"yAxisLabel":"Revenue (£m)","unit":"£"}}', false),
  ('practice-qr-set-47', 'Electricity Generation Mix by Source', '{"type":"pie_chart","context":"Total electricity generation in Country X for 2024 was 400 TWh, broken down by source in the pie chart below.","data":{"title":"Electricity Generation by Source, 2024 (TWh)","segments":[{"label":"Gas","value":180},{"label":"Wind","value":95},{"label":"Nuclear","value":55},{"label":"Solar","value":40},{"label":"Other","value":30}],"unit":""}}', false),
  ('practice-qr-set-48', 'Weekly Hospital Admissions', '{"type":"bar_chart","context":"The bar chart below shows the number of emergency admissions at Riverside General Hospital across nine consecutive weeks.","data":{"title":"Weekly Emergency Admissions at Riverside General","labels":["Wk 1","Wk 2","Wk 3","Wk 4","Wk 5","Wk 6","Wk 7","Wk 8","Wk 9"],"series":[{"name":"Admissions","values":[42,56,61,58,67,49,63,72,55]}],"yAxisLabel":"Number of admissions","unit":""}}', false),
  ('practice-qr-set-49', 'Regional Delivery Network', '{"type":"network_diagram","context":"Edge labels show the road distance in km between depots. Vans travel between depots at an average driving speed of 50 km/h.","data":{"title":"Depot-to-Depot Road Distances (km)","nodes":[{"id":"north","label":"North","x":0.2,"y":0.2},{"id":"east","label":"East","x":0.75,"y":0.2},{"id":"central","label":"Central","x":0.45,"y":0.5},{"id":"west","label":"West","x":0.15,"y":0.55},{"id":"south","label":"South","x":0.35,"y":0.85},{"id":"port","label":"Port","x":0.85,"y":0.65}],"edges":[{"from":"north","to":"central","label":"18 km"},{"from":"east","to":"central","label":"22 km"},{"from":"central","to":"west","label":"15 km"},{"from":"central","to":"south","label":"20 km"},{"from":"east","to":"port","label":"14 km"},{"from":"north","to":"east","label":"35 km"},{"from":"south","to":"west","label":"12 km"},{"from":"port","to":"south","label":"28 km"}]}}', false),
  ('practice-qr-set-50', 'EverGreen Clothing End-of-Season Sale', '{"type":"text","text":"EverGreen Clothing runs an end-of-season sale. All marked prices on the website exclude VAT, which is charged at 20% on the final price paid. During the sale, every shopper gets 25% off the marked price. Loyalty card members then receive a further 10% off the already-discounted sub-total, before VAT is added. Standard delivery is £4.95 per order, but any order whose pre-VAT value after all discounts is over £50 qualifies for free delivery. The shop''s online support line is open 9 am to 6 pm every day. A loyalty member places an order containing a jacket marked at £60, a shirt marked at £25, and a pair of trousers marked at £35."}', false),
  ('practice-qr-set-51', 'MusicSphere Listeners by Genre and Tier', '{"type":"table","context":"Monthly active listeners (millions) on the MusicSphere streaming platform in March 2026, broken down by music genre and subscription tier. Subscription prices: Standard £10/month, Premium £15/month, Family £20/month. Free-tier listeners pay nothing. The platform pays artists a royalty of £0.004 per stream.","data":{"headers":["Genre","Free","Standard","Premium","Family","Total"],"rows":[["Pop","12.5","8.0","6.2","3.3","30.0"],["Rock","6.0","5.5","4.8","1.7","18.0"],["Hip-Hop","9.0","7.2","5.8","2.0","24.0"],["Classical","2.0","1.8","2.4","0.8","7.0"],["Other","4.5","3.0","2.8","0.7","11.0"],["Total","34.0","25.5","22.0","8.5","90.0"]]}}', false),
  ('practice-qr-set-52', 'Cinema Opening Weekend: Revenue and Marketing', '{"type":"bar_chart","context":"Opening weekend figures for five films released in March 2026. Revenue is shown as positive bars (box-office takings in £ millions); marketing spend is shown as negative bars (£ millions). Average ticket price across all cinemas was £9.50. Screen counts on opening weekend: Atlas Rising 3,200; Luna''s Code 1,800; Red Horizon 2,500; Paper Boats 900; Thunder Road 3,500.","data":{"title":"Opening Weekend Revenue and Marketing (£m)","labels":["Atlas Rising","Luna''s Code","Red Horizon","Paper Boats","Thunder Road"],"series":[{"name":"Revenue","values":[48,22,35,12,55]},{"name":"Marketing","values":[-18,-12,-20,-8,-30]}],"yAxisLabel":"Amount (£m)","unit":"£"}}', false),
  ('practice-qr-set-53', 'Premier League Points Across Three Seasons', '{"type":"line_graph","context":"Total league points earned by three Premier League clubs across three seasons. In the Premier League each team plays 38 matches per season: a win scores 3 points, a draw scores 1 point, and a loss scores 0 points. Ravenwood were promoted to the Premier League before the 2023/24 season.","data":{"title":"Premier League Points by Season","labels":["2023/24","2024/25","2025/26"],"series":[{"name":"Anfield United","values":[74,82,89]},{"name":"Citygate FC","values":[87,71,78]},{"name":"Ravenwood","values":[55,48,63]}],"yAxisLabel":"Points","unit":""}}', false),
  ('practice-qr-set-54', 'Willowbrook Veterinary Clinic: March Consultations', '{"type":"multi","items":[{"type":"text","text":"Amoxicillin dosing rule. The total daily dose is split equally into 3 doses per day. Routine booster vaccinations are given annually and are not counted as consultations.\n\n*Daily dose (mg) = patient weight (kg) × 15*"},{"type":"table","data":{"headers":["Species","Typical weight range (kg)","Consultations in March"],"rows":[["Dogs","2-50","145"],["Cats","3-8","98"],["Rabbits","1-4","32"],["Birds","0.05-2","18"],["Reptiles","0.1-5","12"]]}}]}', false),
  ('practice-qr-set-55', 'Art Gallery Ticket Sales', '{"type":"table","context":"The Westbury Art Gallery recorded ticket sales across a five-day week. Standard prices: Adult £12, Child £5, Concession £8. The table also shows the number of new gallery Members enrolled each day (separate from single-ticket visitors).","data":{"headers":["Day","Adult tickets","Child tickets","Concession tickets","New members"],"rows":[["Monday","140","60","45","22"],["Tuesday","165","75","52","18"],["Wednesday","180","90","48","25"],["Thursday","210","110","60","20"],["Friday","250","130","70","30"]]}}', false),
  ('practice-qr-set-56', 'Airline Route Revenue', '{"type":"table","context":"SkyLine Airways operates four long-, medium- and short-haul routes out of London Heathrow (LHR). The table below shows quarterly passenger numbers (in thousands) for each route during last year, including a row total per route and a column total per quarter. Average fares per one-way ticket are fixed all year: LHR-JFK £520, LHR-DXB £480, LHR-CDG £150, LHR-BCN £180.","data":{"headers":["Route","Q1","Q2","Q3","Q4","Annual Total"],"rows":[["LHR-JFK","60","70","85","65","280"],["LHR-DXB","40","45","55","50","190"],["LHR-CDG","90","100","120","95","405"],["LHR-BCN","55","60","80","70","265"],["Quarterly Total","245","275","340","280","1140"]]}}', false),
  ('practice-qr-set-57', 'Hotel Occupancy and RevPAR', '{"type":"bar_chart","context":"The Meridian Hotel has 200 rooms available for letting on every night of each 30-day month. The Average Daily Rate (ADR) is £120 across all months shown.","formula":"RevPAR = ADR × occupancy rate (where occupancy rate is expressed as a decimal)","data":{"title":"Monthly Room Occupancy Rate (%)","labels":["Jan","Feb","Mar","Apr","May","Jun"],"series":[{"name":"Occupancy","values":[60,65,70,75,80,85]}],"yAxisLabel":"Occupancy (%)","unit":"%"}}', false),
  ('practice-qr-set-58', 'Tiered Parcel Delivery Pricing', '{"type":"text","text":"SwiftPost offers parcel delivery across three zones: Zone 1 (UK), Zone 2 (Europe) and Zone 3 (International). Each parcel is charged a base rate for the first 2 kg and then an additional per-kg rate for every full kilogram above 2 kg, up to a 20 kg cap. Base rates (up to 2 kg): Zone 1 £4.50, Zone 2 £8.20, Zone 3 £14.00. Additional per-kg rates (for each full kg above 2 kg): Zone 1 £1.20, Zone 2 £1.80, Zone 3 £2.50. A fuel surcharge of 8% is then applied to the pre-surcharge total (base + weight charges) to give the final price. Optional parcel insurance costs £2.00 per parcel and is not included in any calculation below."}', false),
  ('practice-qr-set-59', 'Public Library Loans by Category', '{"type":"pie_chart","context":"Elmwood Public Library recorded 48,000 item loans last year, split between five categories as shown in the pie chart.","data":{"title":"Annual Loans by Category","segments":[{"label":"Fiction","value":18000},{"label":"Non-fiction","value":9600},{"label":"Children''s","value":12000},{"label":"Audiobooks","value":4800},{"label":"Reference","value":3600}],"unit":""}}', false),
  ('practice-qr-set-60', 'Gaming Console Annual Sales', '{"type":"line_graph","context":"Global annual unit sales (in millions) for three competing home gaming consoles — Alpha, Beta and Gamma — from 2020 to 2024.","data":{"title":"Annual Unit Sales by Console (millions)","labels":["2020","2021","2022","2023","2024"],"series":[{"name":"Alpha","values":[12,15,18,22,25]},{"name":"Beta","values":[20,18,16,14,12]},{"name":"Gamma","values":[5,8,12,17,23]}],"yAxisLabel":"Units sold (millions)","unit":"m"}}', false),
  ('practice-qr-set-61', 'Residential Solar Panel Output', '{"type":"scatter_plot","context":"Each point represents one residential solar installation, plotting the number of panels (x-axis) against the actual daily electricity output in kWh on a sunny day (y-axis) for eight sites A–H. Each panel has a maximum rating of 2.0 kWh per day.","data":{"title":"Daily Output vs Number of Panels (8 sites)","xAxisLabel":"Number of panels","yAxisLabel":"Daily output (kWh)","series":[{"name":"Sites","points":[{"x":8,"y":14.4,"label":"A"},{"x":10,"y":16,"label":"B"},{"x":12,"y":21.6,"label":"C"},{"x":15,"y":24,"label":"D"},{"x":18,"y":30.6,"label":"E"},{"x":20,"y":32,"label":"F"},{"x":22,"y":39.6,"label":"G"},{"x":25,"y":42.5,"label":"H"}]}]},"formula":"Efficiency (%) = (Actual daily output ÷ (Panels × 2.0)) × 100"}', false),
  ('practice-qr-set-62', 'Greenfields Dental Clinic Workload', '{"type":"table","context":"Monthly workload at Greenfields Dental Clinic. NHS and private patient counts, chair-time per appointment, and standard NHS and private fees per treatment type are shown below.","data":{"headers":["Treatment","NHS patients","Private patients","Chair time (min)","NHS fee (£)","Private fee (£)"],"rows":[["Check-up","120","45","20","25.80","60.00"],["Scale & Polish","60","30","25","27.40","75.00"],["Filling","48","24","40","75.50","180.00"],["Extraction","20","12","30","75.50","220.00"],["Root Canal","8","18","90","307.00","650.00"],["Crown fitting","4","10","60","307.00","850.00"]]}}', false),
  ('practice-qr-set-63', 'Central Docking Station Hourly Trips', '{"type":"bar_chart","context":"Hourly trip counts at the Central docking station of the city bicycle rental scheme on a typical weekday. Outbound trips are bikes taken from the station; inbound trips are bikes returned to the station. The station has a total capacity of 500 docking points.","data":{"title":"Central Station Trips by Hour (Weekday)","labels":["06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00"],"series":[{"name":"Outbound","values":[85,420,180,160,175,210,385,120]},{"name":"Inbound","values":[30,110,175,195,180,205,340,95]}],"yAxisLabel":"Trips","unit":""}}', false),
  ('practice-qr-set-64', 'City-Centre Coffee Branches Daily Supply', '{"type":"table","context":"Daily consumption figures at five city-centre coffee branches run by the same chain. Branches trade 7 days a week. The weekly beans figure is tracked separately by the roaster; each espresso shot uses 8 g of beans.","data":{"headers":["Branch","Daily espresso shots","Milk used (L/day)","Paper cups/day","Kg beans/week","Staff count"],"rows":[["Kingsway","480","42","620","22","8"],["Riverside","320","30","450","14","6"],["Eastgate","580","48","710","26","9"],["Millside","240","22","330","10","5"],["Parkview","400","36","540","18","7"]]}}', false),
  ('practice-qr-set-65', 'March Fundraising Drive with Gift Aid', '{"type":"multi","items":[{"type":"text","text":"Channel breakdown of donations received by the Helping Hands charity during the March 2025 fundraising drive. Gift Aid top-up applies only to donations from UK taxpayers who ticked the Gift Aid box. Admin costs are tracked separately and do not reduce the donation totals shown.\n\n*Gift Aid = Eligible donation × 0.25*"},{"type":"table","data":{"headers":["Channel","Donations (£)","Donors","Gift-Aid eligible (£)","Admin cost (£)"],"rows":[["Online portal","48,000","1,200","36,000","1,450"],["Postal cheque","12,500","310","9,200","380"],["Street collection","7,200","960","0","210"],["Corporate matched","22,000","24","0","140"],["Phone campaign","9,800","180","7,600","520"]]}}]}', false),
  ('practice-qr-set-66', 'Skillspark Online Spring-Term Refunds', '{"type":"text","text":"Skillspark Online runs three terms per year (Spring, Summer, Autumn). Each course costs £180 to enrol and runs for 12 weeks. The refund policy is tiered by the week the student withdraws: weeks 1–2 a full refund is given; weeks 3–4 a 75% refund; weeks 5–8 a 30% refund; weeks 9–12 no refund is given. In the Spring term, 240 students enrolled, 20 withdrew in week 2, 12 withdrew in week 4, and 18 withdrew in week 7. A one-off platform access fee of £15 is charged to every enrolled student and is non-refundable. Course materials are included in the enrolment fee."}', false),
  ('practice-qr-set-67', 'Portside Terminal Container Throughput 2024', '{"type":"pie_chart","context":"Container throughput at Portside Terminal in 2024, split by trade route. Total throughput was 2,400 thousand TEUs (twenty-foot equivalent units). One TEU represents one standard 20-foot container; a 40-foot container counts as 2 TEUs. Storage yard capacity is 120,000 TEUs at any one time.","data":{"title":"Container Throughput 2024 (thousand TEUs)","segments":[{"label":"Asia-Europe","value":860},{"label":"Transpacific","value":620},{"label":"Asia-Middle East","value":410},{"label":"Intra-Europe","value":300},{"label":"Africa routes","value":210}],"unit":""}}', false),
  ('practice-qr-set-68', 'FreshFork Meal Kit Subscription', '{"type":"text","text":"FreshFork offers a weekly meal kit subscription delivered to households. Customers choose from three tiers: Essentials (£30/week, 3 meals), Classic (£45/week, 4 meals) and Family (£65/week, 5 meals). Each recipe is written for 2 people; a household of N people uses ingredients in direct proportion (recipe quantities multiply by N/2). Delivery is free for Classic and Family subscribers; Essentials orders pay a £4.50 delivery fee per week. The customer support line is open 8am–8pm daily. A base Classic recipe calls for 400 g of pasta and 250 g of sauce for 2 people."}', false),
  ('practice-qr-set-69', 'Hotel Swimming Pool Dimensions', '{"type":"geometry_diagram","context":"Plan view of a hotel swimming pool. The pool has a rectangular deep section joined to a semi-circular shallow end. The water depth is a uniform 2 metres throughout. Chlorine dosage: 50 g per 1,000 litres of pool water.\n\n*Use π = 3.14*\n*1 m³ = 1,000 litres*","data":{"title":"Hotel Swimming Pool (plan view, dimensions in metres)","viewBox":{"width":340,"height":200},"shapes":[{"type":"rect","x":60,"y":60,"width":200,"height":100,"fill":"none","stroke":"#2d3748"},{"type":"arc","cx":260,"cy":110,"r":50,"startAngle":-90,"endAngle":90,"stroke":"#2d3748"},{"type":"line","x1":260,"y1":60,"x2":260,"y2":160,"stroke":"#a0aec0","strokeDasharray":"4,3"}],"dimensions":[{"from":[60,45],"to":[260,45],"label":"20 m","side":"top"},{"from":[45,60],"to":[45,160],"label":"10 m","side":"left"},{"from":[260,175],"to":[310,175],"label":"5 m","side":"bottom"}]}}', false),
  ('practice-qr-set-70', 'National Park Monthly Visitors (2025)', '{"type":"line_graph","context":"Monthly visitor counts (in thousands) to four UK national parks between January and June 2025. Annual maintenance budgets (not shown on the graph) are: Lakeside £1.8m, Summit £2.4m, Forest £1.2m, Coast £3.0m.","data":{"title":"Monthly Park Visitors (thousands)","labels":["Jan","Feb","Mar","Apr","May","Jun"],"series":[{"name":"Lakeside","values":[12,15,22,30,45,55]},{"name":"Summit","values":[18,20,25,28,32,38]},{"name":"Forest","values":[8,10,15,22,30,35]},{"name":"Coast","values":[20,22,28,35,50,60]}],"yAxisLabel":"Visitors (thousands)","unit":""}}', false),
  ('practice-qr-set-71', 'TeleBlue Mobile Data Tariff', '{"type":"text","text":"TeleBlue offers one mobile tariff with the following monthly structure. The base fee is £12 per month and includes up to 5 GB of data. Usage between 5 GB and 10 GB is charged at £2 per GB (applied only to the GB used above 5). Usage between 10 GB and 20 GB is charged at £1.50 per GB (applied only to the GB used above 10). Usage above 20 GB is charged at £1 per GB (applied only to the GB used above 20). Call minutes and texts are unlimited and not charged. A one-off £20 SIM delivery fee applies to new customers but is waived for upgrades. Customers must be at least 18 years old to open an account."}', false),
  ('practice-qr-set-72', 'Heathcote Zoo Animal Populations', '{"type":"table","context":"Current resident animal populations at Heathcote Zoo, broken down by species class and habitat. The zoo policy states a keeper-to-animal ratio of 1:20 for Mammals and 1:50 for all other species.","data":{"headers":["Species / Habitat","Savannah","Rainforest","Arctic","Desert","Total"],"rows":[["Mammals","48","32","18","12","110"],["Birds","20","55","8","17","100"],["Reptiles","12","18","0","30","60"],["Amphibians","5","22","0","3","30"],["Total","85","127","26","62","300"]]}}', false),
  ('practice-qr-set-73', 'DIY Paint Project: Wall Areas', '{"type":"bar_chart","context":"Wall area (square metres) to be repainted in each room of a three-bedroom flat. Paint coverage and costs: one 2.5 L tin covers 12 m² per coat; each wall needs 2 coats; tins cost £18 each and can only be purchased whole (round any fraction up to the next tin).","data":{"title":"Wall area by room (m squared)","labels":["Living","Kitchen","Bedroom 1","Bedroom 2","Hallway"],"series":[{"name":"Wall area","values":[45,28,32,30,22]}],"yAxisLabel":"Wall area (m squared)","unit":""}}', false),
  ('practice-qr-set-74', 'Electric Vehicle Range and Charging', '{"type":"text","text":"An electric vehicle has a usable battery capacity of 60 kWh and an average efficiency of 4 miles per kWh. The driver has access to a home charger rated at 6 kW and a public rapid charger rated at 40 kW. The car’s tyres are inflated to 36 psi.\n\n*Charging time (hours) = energy to add (kWh) ÷ charger power (kW)*"}', false),
  ('practice-qr-set-75', 'Ambulance Response Times by Severity', '{"type":"table","context":"Cross-tabulation of ambulance calls in one region last month, by response-time band and clinical severity category. Category 1 is the most urgent; Category 4 the least.","data":{"headers":["Response Time","Cat 1","Cat 2","Cat 3","Cat 4","Total"],"rows":[["≤7 min","210","90","30","10","340"],["8–15 min","60","240","120","40","460"],["16–30 min","20","80","180","90","370"],[">30 min","10","20","60","70","160"],["Total","300","430","390","210","1330"]]}}', false),
  ('practice-qr-set-76', 'Supermarket Checkout Queue Lengths', '{"type":"line_graph","context":"Average number of customers waiting in the checkout queue at a supermarket, recorded at six times of day on a typical weekday and weekend day. The store has 12 checkout lanes in total.","data":{"title":"Average Queue Length by Time of Day","labels":["09:00","11:00","13:00","15:00","17:00","19:00"],"series":[{"name":"Weekday","values":[2,4,7,5,6,8]},{"name":"Weekend","values":[5,8,12,10,9,7]}],"yAxisLabel":"Customers waiting","unit":""}}', false),
  ('practice-qr-set-77', 'Advertising Spend vs Online Sales', '{"type":"scatter_plot","context":"Weekly advertising spend (£000s) and monthly online sales (£000s) for six independent online stores last month. Each store pays a fixed platform fee of £500 per month in addition to its advertising costs.","data":{"title":"Advertising Spend vs Monthly Online Sales","xAxisLabel":"Weekly Advertising Spend (£000s)","yAxisLabel":"Monthly Online Sales (£000s)","series":[{"name":"Stores","points":[{"x":2,"y":15,"label":"Aria"},{"x":6,"y":30,"label":"Cove"},{"x":9,"y":45,"label":"Dune"},{"x":15,"y":70,"label":"Fern"},{"x":18,"y":85,"label":"Glen"},{"x":22,"y":100,"label":"Holt"}]}]}}', false),
  ('practice-qr-set-78', 'University Course Applications and Offers', '{"type":"bar_chart","context":"Number of applicants, offers and acceptances for five courses at a UK university this admissions cycle. Domestic tuition fee: £9,250 per year for all courses shown. All courses run for three academic years (Medicine runs for five).","data":{"title":"Applications, Offers and Acceptances by Course","labels":["Medicine","Dentistry","Law","Engineering","Business"],"series":[{"name":"Applicants","values":[1200,800,2500,1800,3000]},{"name":"Offers","values":[300,200,800,700,1500]},{"name":"Acceptances","values":[150,80,400,350,900]}],"yAxisLabel":"Number of students","unit":""}}', false),
  ('practice-qr-set-79', 'Theatre Seating and Show Revenue', '{"type":"text","text":"A theatre has three seating tiers. The Stalls has 200 seats priced at £45 per ticket. The Circle has 150 seats priced at £30 per ticket. The Gallery has 100 seats priced at £15 per ticket. At last night''s show, the Stalls was 90% full, the Circle was 80% full and the Gallery was 50% full. Programme booklets are sold separately at £3 each, and the stage itself measures 12 m by 8 m."}', false),
  ('practice-qr-set-80', 'Farmer''s Market Vendor Revenue', '{"type":"pie_chart","context":"The chart shows last Saturday''s revenue by vendor category at Greenfield Farmer''s Market. One segment value is missing. The total market revenue for the day was £13,200.","data":{"title":"Saturday Vendor Revenue (£)","segments":[{"label":"Produce","value":4800},{"label":"Baked Goods","value":2700},{"label":"Dairy","value":1800},{"label":"Meat & Fish","value":2400},{"label":"Flowers","value":null}],"total":13200,"unit":"£"}}', false),
  ('practice-qr-set-81', 'Swimming Club Lap Times by Stroke', '{"type":"line_graph","context":"Average 50 m lap times (seconds) recorded each week across a 6-week training block for four strokes. The Week 4 Backstroke session was cancelled due to a pool closure, so no time was recorded that week.","data":{"title":"Average 50 m Lap Time by Stroke (seconds)","labels":["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"],"series":[{"name":"Freestyle","values":[32,31.5,31,30.6,30.2,29.8]},{"name":"Backstroke","values":[38,37.5,37,null,36.1,35.7]},{"name":"Breaststroke","values":[42,41.5,41,40.6,40.2,39.8]},{"name":"Butterfly","values":[35,34.5,34,33.6,33.2,32.8]}],"yAxisLabel":"Time (seconds)","unit":""}}', false),
  ('practice-qr-set-82', 'Wind Farm Electricity Generation', '{"type":"bar_chart","context":"Monthly electricity generation (MWh) for three UK offshore wind farms during the first four months of 2025.","data":{"title":"Monthly Generation by Wind Farm (MWh)","labels":["Jan","Feb","Mar","Apr"],"series":[{"name":"Northvale","values":[450,420,380,340]},{"name":"Eastridge","values":[520,490,440,400]},{"name":"Seabay","values":[610,580,520,470]}],"yAxisLabel":"Generation (MWh)","unit":""}}', false),
  ('practice-qr-set-83', 'Dog Grooming Service Tiered Pricing', '{"type":"text","text":"Paws & Tails Grooming charges a base grooming fee by dog size: Small (under 10 kg) costs £28, Medium (10–25 kg) costs £38, and Large (over 25 kg) costs £52. Customers can add any of the following optional services to a session: nail trim £8, teeth clean £12, or de-shed treatment £15. Customers who have had 5 or more previous sessions with the salon receive a 10% loyalty discount applied to the entire bill (base fee plus any add-ons). All prices quoted above exclude VAT, which is charged at 20% and added after any loyalty discount. A transport collection service is also available for £10 per journey."}', false),
  ('practice-qr-set-84', 'University Library Study Room Bookings', '{"type":"table","context":"Bookings made for each study room type across three time slots during the last week of term.","data":{"headers":["Room Type \\ Slot","Morning","Afternoon","Evening","Total Bookings"],"rows":[["Silent Study","45","60","75","180"],["Group Study","30","55","80","165"],["Media Room","10","25","40","75"],["PhD Pods","15","20","35","70"],["Slot Total","100","160","230","490"]]}}', false),
  ('practice-qr-set-85', 'Streaming Music Platform Subscriber Breakdown', '{"type":"pie_chart","context":"SoundWave, a streaming music platform, had 800,000 subscribers at the end of last quarter, split across five tiers. The breakdown is shown below.","data":{"title":"SoundWave Subscribers by Tier (end of Q1 2026)","segments":[{"label":"Student","value":180000},{"label":"Standard","value":245000},{"label":"Family","value":165000},{"label":"Premium HiFi","value":120000},{"label":"Business","value":90000}],"total":800000,"unit":""}}', false),
  ('practice-qr-set-86', 'Beekeeping Hive Honey Production', '{"type":"scatter_plot","context":"A beekeeper records the age of each hive in months and its annual honey production in kilograms. Each point is labelled with the hive letter.","data":{"title":"Hive Age vs. Annual Honey Production","xAxisLabel":"Hive Age (months)","yAxisLabel":"Annual Honey (kg)","series":[{"name":"Hives","points":[{"x":6,"y":12,"label":"A"},{"x":10,"y":18,"label":"B"},{"x":14,"y":22,"label":"C"},{"x":18,"y":28,"label":"D"},{"x":22,"y":35,"label":"E"},{"x":26,"y":32,"label":"F"},{"x":30,"y":40,"label":"G"},{"x":34,"y":38,"label":"H"}]}]}}', false),
  ('practice-qr-set-87', 'City Taxi Fare Structure', '{"type":"text","text":"CityCab fares are made up of the following charges:\n\n• Flag-fall: £3.50 is charged when the passenger boards.\n• Mileage: the first 3 miles are £2.20 per mile; the next 5 miles (miles 3 to 8) are £1.80 per mile; any distance beyond 8 miles is £1.50 per mile.\n• Waiting time: £0.40 per minute while the taxi is stationary at the passenger''s request.\n• Night surcharge: a 25% surcharge is added to the total fare for journeys that begin between 23:00 and 05:00.\n\nMileage rates are applied band by band (not as a flat rate)."}', false),
  ('practice-qr-set-88', 'Premier League Stadium Capacity Utilisation', '{"type":"bar_chart","context":"The chart shows the average match-day attendance and the total stadium capacity for five Premier League stadiums in the 2025–26 season.","formula":"Capacity utilisation (%) = attendance ÷ capacity × 100","data":{"title":"Average Attendance vs. Capacity, 2025–26 Season","labels":["Old Trafford","Emirates","Anfield","Tottenham","Etihad"],"series":[{"name":"Avg. Attendance","values":[73200,60100,59800,61700,53100]},{"name":"Capacity","values":[74140,60704,61276,62850,53400]}],"yAxisLabel":"Spectators","unit":""}}', false),
  ('practice-qr-set-89', 'Triathlon Race Split Times', '{"type":"table","context":"The table shows split times (in minutes) for five athletes at an Olympic-distance triathlon. The race consists of a 1.5 km swim, a 40 km bike leg and a 10 km run. Transition covers both swim-to-bike and bike-to-run changeovers combined. Total is the sum of all four legs.","data":{"headers":["Athlete","Swim (min)","Bike (min)","Run (min)","Transition (min)","Total (min)"],"rows":[["Amara","25","62","38","4","129"],["Brendan","28","58","42","5","133"],["Clara","23","65","36","3","127"],["Diego","27","60","40","4","131"],["Elena","26","63","39","5","133"]]}}', false),
  ('practice-qr-set-90', 'Car Rental Mileage Package Pricing', '{"type":"table","context":"Rideaway Cars publishes the following daily rental tiers. Each tier includes a free mileage allowance per day; miles driven beyond the allowance are charged at the tier’s overage rate. Insurance is optional and charged per day when taken.","data":{"headers":["Tier","Daily Base (£)","Free Miles/Day","Overage (£/mile)","Insurance (£/day)","Fuel Grade"],"rows":[["Economy","30","100","0.20","6","Regular"],["Compact","40","150","0.18","8","Regular"],["SUV","60","200","0.25","12","Premium"],["Luxury","90","250","0.30","18","Premium"]]}}', false),
  ('practice-qr-set-91', 'Wedding Venue Package Pricing', '{"type":"multi","items":[{"type":"text","text":"Ashton Manor offers three wedding packages. Each package has a fixed base fee and a per-head price for catering. Every invoice is calculated using the following formula:\n\nFinal invoice = (base fee + guests × per-head price) × (1 + VAT) + service charge\n\nVAT is charged at 20%. A flat service charge of £250 is added after VAT."},{"type":"table","data":{"headers":["Package","Base Fee (£)","Per-Head Price (£)","Minimum Booking Hours"],"rows":[["Silver","800","55","5"],["Gold","1,200","75","6"],["Platinum","1,800","110","8"]]}}]}', false),
  ('practice-qr-set-92', 'Marathon Training Weekly Mileage', '{"type":"line_graph","context":"Three club runners logged their weekly training mileage across a 12-week marathon block. Ben’s Week 6 figure was not recorded due to a watch fault, but his coach confirmed his full 12-week mean mileage was 42 miles per week.","data":{"title":"Weekly Training Mileage (Weeks 1–12)","labels":["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"],"series":[{"name":"Alice","values":[20,24,28,32,36,38,42,44,46,48,42,30]},{"name":"Ben","values":[25,28,32,36,40,null,44,48,50,52,50,55]},{"name":"Carla","values":[35,38,42,46,50,54,56,58,60,58,50,40]}],"yAxisLabel":"Weekly Mileage (miles)","unit":""}}', false),
  ('practice-qr-set-93', 'Charity Fundraising Event Income', '{"type":"pie_chart","context":"The Riverside Children’s Charity held a fundraising evening attended by 2,500 people. The chart shows income by source; the total event income was £125,000. The Merchandise segment was not labelled with a value on the chart.","data":{"title":"Charity Event Income by Source (£)","segments":[{"label":"Ticket Sales","value":45000},{"label":"Sponsorship","value":30000},{"label":"Silent Auction","value":18000},{"label":"Raffle","value":12500},{"label":"Merchandise","value":null},{"label":"Donations","value":12000}],"total":125000,"unit":"£"}}', false),
  ('practice-qr-set-94', 'Community Hall Floor Refurbishment', '{"type":"geometry_diagram","context":"The plan below shows the floor of the main hall, an L-shaped room. All dimensions are in metres.","data":{"title":"Main Hall Floor Plan (plan view, dimensions in metres)","viewBox":{"width":300,"height":220},"shapes":[{"type":"polygon","points":[[50,40],[200,40],[200,110],[260,110],[260,180],[50,180]],"fill":"none"}],"dimensions":[{"from":[50,25],"to":[200,25],"label":"15 m","side":"top"},{"from":[35,40],"to":[35,180],"label":"14 m","side":"left"},{"from":[50,200],"to":[260,200],"label":"21 m","side":"bottom"},{"from":[210,40],"to":[210,110],"label":"7 m","side":"right"}]}}', false),
  ('practice-qr-set-95', 'Greenhouse Vegetable Yield vs Water Usage', '{"type":"scatter_plot","context":"A commercial greenhouse grows tomatoes under identical light, soil, and temperature conditions across 8 plots (P1-P8). Each point shows one plot''s weekly water usage and its monthly tomato yield.","data":{"title":"Tomato Yield vs Water Usage (8 plots)","xAxisLabel":"Water usage (litres per week)","yAxisLabel":"Tomato yield (kg per month)","series":[{"name":"Plots","points":[{"x":120,"y":18,"label":"P1"},{"x":150,"y":24,"label":"P2"},{"x":180,"y":30,"label":"P3"},{"x":210,"y":36,"label":"P4"},{"x":240,"y":42,"label":"P5"},{"x":270,"y":48,"label":"P6"},{"x":300,"y":54,"label":"P7"},{"x":180,"y":15,"label":"P8"}]}]}}', false),
  ('practice-qr-set-96', 'Tiered Postage Pricing', '{"type":"text","text":"A courier charges postage by parcel weight using the following bands. First 250 g: £3.20 flat charge. Next band 251-500 g: 40p per additional 100 g. Next band 501-2,000 g: 60p per additional 100 g. A \"Signed For\" service may be added to any parcel for an extra flat surcharge of £2.50 on top of the weight-based cost. A next-day delivery upgrade is also available for £4.00 per parcel (not used in the questions below). All prices already include VAT."}', false),
  ('practice-qr-set-97', 'Astronomical Observatory Monthly Visitors', '{"type":"bar_chart","context":"The observatory closed to the public during November for scheduled equipment maintenance, so no visitor figure is recorded for that month.","data":{"title":"Monthly Visitors to Hilltop Observatory (2025)","labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"series":[{"name":"Visitors","values":[800,900,1200,1500,2000,2400,2800,2600,1800,1400,null,1000]}],"yAxisLabel":"Number of visitors","unit":""}}', false),
  ('practice-qr-set-98', 'Plant Nursery Sales by Plant Type and Region', '{"type":"table","context":"Units of plants sold by a UK nursery chain last quarter, cross-tabulated by plant type (rows) and sales region (columns).","data":{"headers":["Plant Type","North","Midlands","South","West","Online","Row Total"],"rows":[["Shrubs","120","180","240","100","60","700"],["Trees","80","140","200","90","40","550"],["Perennials","150","220","300","130","100","900"],["Annuals","100","160","180","60","50","550"],["Column Total","450","700","920","380","250","2700"]]}}', false),
  ('practice-qr-set-99', 'Backyard Rectangular Swimming Pool', '{"type":"text","text":"A homeowner is filling a new rectangular swimming pool in their back garden. The pool has a uniform depth and internal dimensions of 8 metres long, 4 metres wide, and 1.5 metres deep.\n\n[1 m³ = 1,000 litres]\nFill time (hours) = volume (litres) ÷ flow rate (litres per hour)"}', false),
  ('practice-qr-set-100', 'Independent Coffee Shop Drink Sales', '{"type":"bar_chart","context":"Monthly revenue and running costs for each drink category at a small independent coffee shop in March 2026. Costs include ingredients, milk, cups, and category-specific supplies only; general overheads (rent, wages, utilities) are not included.","data":{"title":"March Revenue and Costs by Drink Category","labels":["Espresso","Latte","Cappuccino","Tea","Iced Drinks"],"series":[{"name":"Revenue","values":[4200,6500,5800,2400,3100]},{"name":"Cost","values":[-1200,-2100,-1900,-900,-1400]}],"yAxisLabel":"Amount (£)","unit":"£"}}', false),
  ('practice-qr-set-101', 'Birdwatching Reserve Species Sightings', '{"type":"table","context":"Quarterly bird sightings recorded by volunteers at Willowmere Reserve in 2025. The mean quarterly sightings for Robin across the year was 162.5.","data":{"headers":["Species","Q1","Q2","Q3","Q4","Annual Total","Conservation Status"],"rows":[["Swift","80","120","150","40","390","Amber"],["Starling","220","260","280","240","1000","Red"],["Robin","150","160","170","?","?","Green"],["Chaffinch","90","95","110","105","400","Green"],["Skylark","130","140","135","125","530","Amber"]]}}', false),
  ('practice-qr-set-102', 'Freelance Graphic Designer Hourly Rate Tiers', '{"type":"multi","items":[{"type":"text","text":"Commission structure: the designer keeps 70% of the first £2,000 of VAT-exclusive revenue billed each month, and 80% of any VAT-exclusive revenue billed above £2,000 in that month. All invoiced amounts shown to clients include VAT at 20%. The ''Typical Hours'' column is a guide only and is not used in calculations."},{"type":"table","data":{"headers":["Project Type","Base Rate (£/hr)","Typical Hours"],"rows":[["Logo Design","65","8–12"],["Web Graphics","55","15–25"],["Print Layout","70","10–20"],["Branding Package","85","30–50"]]}}]}', false),
  ('practice-qr-set-103', 'Community Garden Vegetable Plot Rental', '{"type":"text","text":"Greenside Community Garden rents out a total of 36 vegetable plots to local residents. Standard plots measure 5 m × 4 m and cost £12 per month. Large plots measure 6 m × 8 m and cost £28 per month. Residents who pay 6 months upfront receive a 10% discount on the monthly fee, but this discount does not apply to the optional one-off tool rental of £15. The garden has 30 standard plots and 6 large plots, all of which are currently rented out. Raymond holds one of the large plots."}', false),
  ('practice-qr-set-104', 'Weekend Cinema Ticket Sales by Age Group', '{"type":"bar_chart","context":"Ticket prices at the cinema are £6 for Child (Under 16), £12 for Standard (16–60), and £8 for Senior (60+).","data":{"title":"Tickets Sold by Age Group — Weekend of 18 April","labels":["Under 16","16–30","31–60","60+"],"series":[{"name":"Friday","values":[40,90,80,30]},{"name":"Saturday","values":[70,160,120,50]},{"name":"Sunday","values":[55,120,100,45]}],"yAxisLabel":"Tickets sold","unit":""}}', false);

INSERT INTO quantitative_reasoning_questions (set_id, question_ref, question_text, options, correct_answer, answer_reason, order_index, difficulty) VALUES
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-01'), 'practice-qr-set-01-q1', 'How many applicants from London were placed in the Midlands deanery?', '[{"label":"A","text":"40"},{"label":"B","text":"60"},{"label":"C","text":"80"},{"label":"D","text":"90"},{"label":"E","text":"290"}]', 'B', 'Find the London row (home deanery), then move across to the Midlands column (placement). The cell where they meet shows 60. The answer is 60.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-01'), 'practice-qr-set-01-q2', 'What percentage of trainees placed in the North come from a home deanery other than the North, to the nearest 0.1%?', '[{"label":"A","text":"18.0%"},{"label":"B","text":"26.0%"},{"label":"C","text":"28.0%"},{"label":"D","text":"72.0%"},{"label":"E","text":"77.8%"}]', 'C', 'Look at the North placement column. The total placed in North is 500, and 360 of those came from North themselves, so trainees who moved in from elsewhere = 500 − 360 = 140.

Step 1: Non-North trainees placed in North = 500 − 360 = 140.

Step 2: Percentage = 140 ÷ 500 × 100 = 28.0%.

The answer is 28.0%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-01'), 'practice-qr-set-01-q3', 'Which home deanery retained the highest percentage of its applicants in their own region?', '[{"label":"A","text":"London"},{"label":"B","text":"Midlands"},{"label":"C","text":"North"},{"label":"D","text":"South West"},{"label":"E","text":"All four are equal"}]', 'A', 'Retention rate = diagonal cell ÷ Home Total for each deanery.

Step 1: London = 380 ÷ 500 = 76.0%.

Step 2: Midlands = 290 ÷ 500 = 58.0%.

Step 3: North = 360 ÷ 500 = 72.0%.

Step 4: South West = 200 ÷ 300 = 66.7%.

London has the highest retention rate at 76.0%. The answer is London.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-01'), 'practice-qr-set-01-q4', 'The deanery plans to add 150 new training posts to South West next year, filled by applicants in the same home-region proportions as this year''s South West placement column. How many of the 150 posts would go to applicants from the Midlands?', '[{"label":"A","text":"10"},{"label":"B","text":"15"},{"label":"C","text":"20"},{"label":"D","text":"30"},{"label":"E","text":"35"}]', 'C', 'The new posts follow the same home-region split as the current South West placement column.

Step 1: From the South West column, the Midlands cell = 40 and the column total = 300.

Step 2: Midlands proportion = 40 ÷ 300 = 2/15.

Step 3: Apply to 150 new posts: 150 × 2/15 = 20.

The answer is 20.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-02'), 'practice-qr-set-02-q1', 'How many urgent appointments were recorded for patients aged 40–64?', '[{"label":"A","text":"55"},{"label":"B","text":"65"},{"label":"C","text":"80"},{"label":"D","text":"120"},{"label":"E","text":"280"}]', 'C', 'Read the Urgent series at the 40–64 age group. The bar sits at 80. The answer is 80.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-02'), 'practice-qr-set-02-q2', 'What was the total number of appointments (routine + urgent) for the 18–39 age group?', '[{"label":"A","text":"55"},{"label":"B","text":"220"},{"label":"C","text":"240"},{"label":"D","text":"275"},{"label":"E","text":"340"}]', 'D', 'Read both bars at the 18–39 age group and add them together: Routine = 220 and Urgent = 55, so total = 220 + 55 = 275. The answer is 275.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-02'), 'practice-qr-set-02-q3', 'What percentage of all routine appointments were for patients aged 65+, to the nearest whole percent?', '[{"label":"A","text":"28%"},{"label":"B","text":"30%"},{"label":"C","text":"33%"},{"label":"D","text":"36%"},{"label":"E","text":"40%"}]', 'D', 'Step 1: Add up all routine appointments: 140 + 220 + 280 + 360 = 1,000.

Step 2: 65+ routine appointments = 360.

Step 3: Percentage = 360 ÷ 1,000 × 100 = 36%.

The answer is 36%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-02'), 'practice-qr-set-02-q4', 'Which age group has the highest ratio of urgent to routine appointments?', '[{"label":"A","text":"0–17"},{"label":"B","text":"18–39"},{"label":"C","text":"40–64"},{"label":"D","text":"65+"},{"label":"E","text":"0–17 and 18–39 equally"}]', 'D', 'Work out urgent ÷ routine for each age group.

Step 1: 0–17 = 35 ÷ 140 = 0.250.

Step 2: 18–39 = 55 ÷ 220 = 0.250.

Step 3: 40–64 = 80 ÷ 280 = 0.286.

Step 4: 65+ = 120 ÷ 360 = 0.333.

The 65+ group has the highest ratio. The answer is 65+.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-03'), 'practice-qr-set-03-q1', 'What was Patient A''s HbA1c in April?', '[{"label":"A","text":"55"},{"label":"B","text":"58"},{"label":"C","text":"60"},{"label":"D","text":"65"},{"label":"E","text":"75"}]', 'C', 'Read the Patient A line at April directly from the graph. The value is 60 mmol/mol. The answer is 60.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-03'), 'practice-qr-set-03-q2', 'By how much did Patient B''s HbA1c fall between January and June?', '[{"label":"A","text":"5"},{"label":"B","text":"10"},{"label":"C","text":"15"},{"label":"D","text":"17"},{"label":"E","text":"20"}]', 'C', 'Read the two endpoints on the Patient B line: January = 85 and June = 70. Fall = 85 − 70 = 15. The answer is 15.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-03'), 'practice-qr-set-03-q3', 'What was the percentage change in Patient C''s HbA1c between January and June, to the nearest 0.1%?', '[{"label":"A","text":"10.0%"},{"label":"B","text":"14.7%"},{"label":"C","text":"17.2%"},{"label":"D","text":"20.0%"},{"label":"E","text":"47.2%"}]', 'C', 'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: Patient C starts at 58 in January and ends at 68 in June.

Step 2: (68 − 58) ÷ 58 × 100 = 10 ÷ 58 × 100 = 17.2%.

The answer is 17.2%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-03'), 'practice-qr-set-03-q4', 'In which month was the gap between Patient A''s and Patient C''s HbA1c greatest?', '[{"label":"A","text":"January"},{"label":"B","text":"February"},{"label":"C","text":"March"},{"label":"D","text":"May"},{"label":"E","text":"June"}]', 'A', 'Work out |Patient A − Patient C| for each listed month.

Step 1: January = |72 − 58| = 14.

Step 2: February = |68 − 60| = 8.

Step 3: March = |65 − 62| = 3.

Step 4: May = |58 − 66| = 8.

Step 5: June = |55 − 68| = 13.

January has the largest gap at 14. The answer is January.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-04'), 'practice-qr-set-04-q1', 'What percentage of UK household energy in 2025 came from Natural Gas?', '[{"label":"A","text":"8%"},{"label":"B","text":"12%"},{"label":"C","text":"28%"},{"label":"D","text":"42%"},{"label":"E","text":"58%"}]', 'D', 'Read the Natural Gas segment directly from the legend — 42%. The answer is 42%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-04'), 'practice-qr-set-04-q2', 'In its simplest form, what is the ratio of Electricity to Renewables?', '[{"label":"A","text":"5 : 14"},{"label":"B","text":"10 : 28"},{"label":"C","text":"14 : 5"},{"label":"D","text":"28 : 10"},{"label":"E","text":"42 : 10"}]', 'C', 'Electricity = 28 and Renewables = 10, so the ratio is 28 : 10. Divide both sides by 2 to simplify: 14 : 5. The stem names Electricity first, so it goes first. The answer is 14 : 5.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-04'), 'practice-qr-set-04-q3', 'If UK households used 250 TWh of energy in total in 2025, how much energy came from Heating Oil and Renewables combined?', '[{"label":"A","text":"22 TWh"},{"label":"B","text":"30 TWh"},{"label":"C","text":"44 TWh"},{"label":"D","text":"55 TWh"},{"label":"E","text":"105 TWh"}]', 'D', 'Step 1: Add the two percentages: 12% + 10% = 22%.

Step 2: Apply to the total: 22% of 250 TWh = 0.22 × 250 = 55 TWh.

The answer is 55 TWh.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-04'), 'practice-qr-set-04-q4', 'Suppose total household consumption falls by 8% by 2030 (from 250 TWh) while the Heating Oil share of the mix drops from 12% to 9%. To the nearest 0.1 TWh, how much energy will come from Heating Oil in 2030?', '[{"label":"A","text":"18.8 TWh"},{"label":"B","text":"20.7 TWh"},{"label":"C","text":"22.5 TWh"},{"label":"D","text":"27.6 TWh"},{"label":"E","text":"30.0 TWh"}]', 'B', 'Step 1: 2030 total consumption = 250 × (1 − 0.08) = 250 × 0.92 = 230 TWh.

Step 2: Heating Oil in 2030 = 9% of 230 = 0.09 × 230 = 20.7 TWh.

The answer is 20.7 TWh.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-05'), 'practice-qr-set-05-q1', 'How many Cardiology beds were occupied on Wednesday?', '[{"label":"A","text":"19"},{"label":"B","text":"21"},{"label":"C","text":"23"},{"label":"D","text":"25"},{"label":"E","text":"30"}]', 'D', 'Find the Cardiology row, then the Wed column. The cell value is 25. The answer is 25.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-05'), 'practice-qr-set-05-q2', 'On which day was Oncology occupancy closest to its capacity (as a percentage)?', '[{"label":"A","text":"Monday"},{"label":"B","text":"Tuesday"},{"label":"C","text":"Wednesday"},{"label":"D","text":"Thursday"},{"label":"E","text":"Friday"}]', 'E', 'Oncology capacity is 28. Work out occupancy ÷ 28 as a percentage for each day.

Step 1: Mon = 22 ÷ 28 = 78.6%.

Step 2: Tue = 24 ÷ 28 = 85.7%.

Step 3: Wed = 23 ÷ 28 = 82.1%.

Step 4: Thu = 25 ÷ 28 = 89.3%.

Step 5: Fri = 26 ÷ 28 = 92.9%.

Friday is the highest. The answer is Friday.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-05'), 'practice-qr-set-05-q3', 'What was the ICU occupancy on Thursday?', '[{"label":"A","text":"13"},{"label":"B","text":"15"},{"label":"C","text":"17"},{"label":"D","text":"19"},{"label":"E","text":"20"}]', 'C', 'This is a mean back-calculation: the missing value = (mean × number of days) − sum of the known days.

Step 1: Total occupancy for the week = 16 × 5 = 80.

Step 2: Sum of the known days = 14 + 16 + 15 + 18 = 63.

Step 3: Thursday = 80 − 63 = 17.

The answer is 17.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-05'), 'practice-qr-set-05-q4', 'On Monday, what was total occupancy as a percentage of total capacity across all four wards, to the nearest 0.1%?', '[{"label":"A","text":"22.3%"},{"label":"B","text":"31.8%"},{"label":"C","text":"64.0%"},{"label":"D","text":"76.5%"},{"label":"E","text":"82.4%"}]', 'D', 'Step 1: Add up Monday occupancies across all four wards: 24 + 14 + 18 + 22 = 78.

Step 2: Add up the capacities: 30 + 20 + 24 + 28 = 102.

Step 3: Percentage = 78 ÷ 102 × 100 = 76.5%.

The answer is 76.5%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-06'), 'practice-qr-set-06-q1', 'Lisa joins the Plus tier and pays monthly. What is her total cost for her first 12 months?', '[{"label":"A","text":"£480"},{"label":"B","text":"£498"},{"label":"C","text":"£510"},{"label":"D","text":"£528"},{"label":"E","text":"£540"}]', 'C', 'Step 1: Twelve months at £40 = 12 × £40 = £480.

Step 2: Add the one-off joining fee: £480 + £30 = £510.

The answer is £510.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-06'), 'practice-qr-set-06-q2', 'What is the VAT-exclusive monthly cost of the Elite tier, to the nearest penny?', '[{"label":"A","text":"£52.00"},{"label":"B","text":"£54.17"},{"label":"C","text":"£55.00"},{"label":"D","text":"£57.20"},{"label":"E","text":"£78.00"}]', 'B', 'This is a reverse percentage — the £65 already includes 20% VAT, so you divide by 1.2 to strip the VAT out. £65 ÷ 1.2 = £54.1667, which rounds to £54.17. The answer is £54.17.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-06'), 'practice-qr-set-06-q3', 'Tom pays 12 months upfront for the Basic tier. How much does he pay in total in his first year?', '[{"label":"A","text":"£255"},{"label":"B","text":"£270"},{"label":"C","text":"£285"},{"label":"D","text":"£300"},{"label":"E","text":"£345"}]', 'C', 'Step 1: Apply the 15% discount to the monthly rate: £25 × (1 − 0.15) = £25 × 0.85 = £21.25.

Step 2: Twelve months at the discounted rate = 12 × £21.25 = £255.

Step 3: Add the joining fee (not discounted): £255 + £30 = £285.

The answer is £285.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-06'), 'practice-qr-set-06-q4', 'Over 24 months, how much does a Plus member save by paying annually upfront (both years) compared to paying monthly throughout?', '[{"label":"A","text":"£72"},{"label":"B","text":"£96"},{"label":"C","text":"£108"},{"label":"D","text":"£144"},{"label":"E","text":"£180"}]', 'D', 'The joining fee is £30 in both cases, so it cancels — only the monthly-fee total differs.

Step 1: Monthly route over 24 months = 24 × £40 = £960.

Step 2: Upfront route (paying annually for both years) = 2 × (12 × £40 × 0.85) = 2 × £408 = £816.

Step 3: Saving = £960 − £816 = £144.

The answer is £144.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-07'), 'practice-qr-set-07-q1', 'Alice earns £38,500 in taxable income. How much income tax does she pay for the year?', '[{"label":"A","text":"£4,000"},{"label":"B","text":"£5,186"},{"label":"C","text":"£7,700"},{"label":"D","text":"£12,000"},{"label":"E","text":"£15,400"}]', 'B', 'Step 1: The first £12,570 is tax-free, so the taxable amount in the Basic band = £38,500 − £12,570 = £25,930.

Step 2: All of this falls in the 20% band (the ceiling is £50,270), so tax = £25,930 × 0.20 = £5,186.

The answer is £5,186.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-07'), 'practice-qr-set-07-q2', 'Ben earns £75,000 in taxable income. How much income tax does he pay for the year?', '[{"label":"A","text":"£15,000"},{"label":"B","text":"£16,792"},{"label":"C","text":"£17,432"},{"label":"D","text":"£25,270"},{"label":"E","text":"£30,000"}]', 'C', 'Apply each band''s rate only to the slice of income that sits inside that band.

Step 1: Basic band — 20% on the slice from £12,571 to £50,270: (£50,270 − £12,570) × 0.20 = £37,700 × 0.20 = £7,540.

Step 2: Higher band — 40% on the slice from £50,271 to £75,000: (£75,000 − £50,270) × 0.40 = £24,730 × 0.40 = £9,892.

Step 3: Total tax = £7,540 + £9,892 = £17,432.

The answer is £17,432.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-07'), 'practice-qr-set-07-q3', 'Carol''s salary rises from £48,000 to £53,000. How much extra income tax does she pay on the £5,000 rise?', '[{"label":"A","text":"£1,000"},{"label":"B","text":"£1,092"},{"label":"C","text":"£1,546"},{"label":"D","text":"£2,000"},{"label":"E","text":"£2,250"}]', 'C', 'The rise crosses the £50,270 threshold, so part of the £5,000 is taxed at 20% and part at 40%.

Step 1: From £48,000 up to £50,270 = £2,270 taxed at 20% = £2,270 × 0.20 = £454.

Step 2: From £50,270 up to £53,000 = £2,730 taxed at 40% = £2,730 × 0.40 = £1,092.

Step 3: Extra tax on the rise = £454 + £1,092 = £1,546.

The answer is £1,546.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-07'), 'practice-qr-set-07-q4', 'Dan earns £130,000 in taxable income. What percentage of his income does he pay in income tax, to the nearest 0.1%?', '[{"label":"A","text":"22.4%"},{"label":"B","text":"26.0%"},{"label":"C","text":"30.5%"},{"label":"D","text":"40.0%"},{"label":"E","text":"45.0%"}]', 'C', 'Dan''s income crosses all four bands, so work through each one in turn.

Step 1: Basic band — £37,700 × 0.20 = £7,540.

Step 2: Higher band — (£125,140 − £50,270) × 0.40 = £74,870 × 0.40 = £29,948.

Step 3: Additional band — (£130,000 − £125,140) × 0.45 = £4,860 × 0.45 = £2,187.

Step 4: Total tax = £7,540 + £29,948 + £2,187 = £39,675.

Step 5: Effective rate = £39,675 ÷ £130,000 × 100 = 30.5%.

The answer is 30.5%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-08'), 'practice-qr-set-08-q1', 'What was the revenue in Q3?', '[{"label":"A","text":"£95,000"},{"label":"B","text":"£120,000"},{"label":"C","text":"£140,000"},{"label":"D","text":"£160,000"},{"label":"E","text":"£180,000"}]', 'C', 'Read the Revenue bar at Q3. It reaches 140 on the £000s scale, which means £140,000. The answer is £140,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-08'), 'practice-qr-set-08-q2', 'In which quarter did the business record its largest loss?', '[{"label":"A","text":"Q1"},{"label":"B","text":"Q2"},{"label":"C","text":"Q3"},{"label":"D","text":"Q4"},{"label":"E","text":"Q5"}]', 'B', 'Losses show as bars below the zero line on the Net P/L series. Q2 is −£8,000 and Q4 is −£5,000; the other quarters are in profit. |−8| > |−5|, so Q2 is the larger loss. The answer is Q2.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-08'), 'practice-qr-set-08-q3', 'What was the profit margin in Q5, to the nearest 0.1%?', '[{"label":"A","text":"5.1%"},{"label":"B","text":"19.4%"},{"label":"C","text":"21.9%"},{"label":"D","text":"35.0%"},{"label":"E","text":"57.1%"}]', 'B', 'Use the formula given under the chart: profit margin = profit ÷ revenue × 100. Q5 profit = 35 and Q5 revenue = 180 (both in £000s, so the ratio is unit-free). 35 ÷ 180 × 100 = 19.4%. The answer is 19.4%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-08'), 'practice-qr-set-08-q4', 'Across all five quarters, what was the cumulative net profit/loss as a percentage of cumulative revenue, to the nearest 0.1%?', '[{"label":"A","text":"4.3%"},{"label":"B","text":"8.2%"},{"label":"C","text":"10.0%"},{"label":"D","text":"11.9%"},{"label":"E","text":"13.5%"}]', 'B', 'Step 1: Add all five quarters'' Net P/L, keeping the signs: 15 + (−8) + 20 + (−5) + 35 = 57 (£000s).

Step 2: Add all five quarters'' Revenue: 120 + 95 + 140 + 160 + 180 = 695 (£000s).

Step 3: Cumulative margin = 57 ÷ 695 × 100 = 8.2%.

The answer is 8.2%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-09'), 'practice-qr-set-09-q1', 'On a £200,000 loan taken on Alpha Fixed 2, what is the outstanding balance after 2 years (before the arrangement fee), to the nearest £1?', '[{"label":"A","text":"£209,000"},{"label":"B","text":"£218,000"},{"label":"C","text":"£218,405"},{"label":"D","text":"£218,450"},{"label":"E","text":"£220,900"}]', 'C', 'Use the compound formula from above the table: Final = Initial × (1 + rate)^years.

Step 1: 1.045² = 1.092025.

Step 2: 200,000 × 1.092025 = £218,405.

The answer is £218,405.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-09'), 'practice-qr-set-09-q2', 'How much more is Beta''s arrangement fee than Alpha''s?', '[{"label":"A","text":"£250"},{"label":"B","text":"£500"},{"label":"C","text":"£1,000"},{"label":"D","text":"£1,499"},{"label":"E","text":"£2,498"}]', 'B', 'Read the two fees from the table: Beta = £1,499 and Alpha = £999. Difference = £1,499 − £999 = £500. The answer is £500.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-09'), 'practice-qr-set-09-q3', 'On a £180,000 loan using Gamma Fixed 2, what is the outstanding balance after 2 years (before the arrangement fee), to the nearest £1?', '[{"label":"A","text":"£196,560"},{"label":"B","text":"£197,280"},{"label":"C","text":"£197,695"},{"label":"D","text":"£198,360"},{"label":"E","text":"£199,080"}]', 'C', 'Apply the compound formula: Final = 180,000 × 1.048².

Step 1: 1.048² = 1.098304.

Step 2: 180,000 × 1.098304 = £197,694.72, which rounds to £197,695.

The answer is £197,695.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-09'), 'practice-qr-set-09-q4', 'On a £150,000 loan over 2 years, which product has the lowest total cost (outstanding balance after 2 years plus the arrangement fee)?', '[{"label":"A","text":"Alpha Fixed 2"},{"label":"B","text":"Beta Fixed 2"},{"label":"C","text":"Gamma Fixed 2"},{"label":"D","text":"Alpha and Beta equally"},{"label":"E","text":"Can''t Tell"}]', 'B', 'Work out the balance + fee for each product on a £150,000 loan.

Step 1: Alpha = 150,000 × 1.045² + 999 = 163,803.75 + 999 = £164,802.75.

Step 2: Beta = 150,000 × 1.0425² + 1,499 = 163,020.94 + 1,499 = £164,519.94.

Step 3: Gamma = 150,000 × 1.048² + 499 = 164,745.60 + 499 = £165,244.60.

Beta is the cheapest, about £283 less than Alpha. The answer is Beta Fixed 2.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-10'), 'practice-qr-set-10-q1', 'How much interest does the account earn in the first full year?', '[{"label":"A","text":"£100"},{"label":"B","text":"£150"},{"label":"C","text":"£200"},{"label":"D","text":"£400"},{"label":"E","text":"£500"}]', 'C', 'Year 1 interest = balance × rate = £5,000 × 4% = £5,000 × 0.04 = £200. The answer is £200.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-10'), 'practice-qr-set-10-q2', 'What is the balance at the end of year 3, to the nearest £1?', '[{"label":"A","text":"£5,400"},{"label":"B","text":"£5,600"},{"label":"C","text":"£5,624"},{"label":"D","text":"£5,640"},{"label":"E","text":"£6,000"}]', 'C', 'Apply the compound formula: balance = 5,000 × 1.04³.

Step 1: 1.04³ = 1.124864.

Step 2: 5,000 × 1.124864 = £5,624.32, which rounds to £5,624.

The answer is £5,624.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-10'), 'practice-qr-set-10-q3', 'Over 5 years, by how much does the compound-interest return exceed the simple-interest return on this account, to the nearest £1?', '[{"label":"A","text":"£20"},{"label":"B","text":"£50"},{"label":"C","text":"£83"},{"label":"D","text":"£125"},{"label":"E","text":"£250"}]', 'C', 'Step 1: Simple interest over 5 years = 5,000 × 0.04 × 5 = £1,000.

Step 2: Compound balance = 5,000 × 1.04⁵ = 5,000 × 1.2166529 = £6,083.26, so compound interest = £6,083.26 − £5,000 = £1,083.26.

Step 3: Difference = £1,083.26 − £1,000 = £83.26, which rounds to £83.

The answer is £83.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-10'), 'practice-qr-set-10-q4', 'After how many complete years does the balance first exceed £6,000?', '[{"label":"A","text":"3 years"},{"label":"B","text":"4 years"},{"label":"C","text":"5 years"},{"label":"D","text":"6 years"},{"label":"E","text":"10 years"}]', 'C', 'Grow £5,000 by 1.04 each year until the balance crosses £6,000.

Step 1: Year 1 = 5,000 × 1.04 = £5,200.

Step 2: Year 2 = 5,200 × 1.04 = £5,408.

Step 3: Year 3 = 5,408 × 1.04 = £5,624.32.

Step 4: Year 4 = 5,624.32 × 1.04 = £5,849.29.

Step 5: Year 5 = 5,849.29 × 1.04 = £6,083.26 — first time above £6,000.

The answer is 5 years.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-11'), 'practice-qr-set-11-q1', 'What is the Off-Peak Return fare to Manchester?', '[{"label":"A","text":"£55"},{"label":"B","text":"£98"},{"label":"C","text":"£152"},{"label":"D","text":"£220"},{"label":"E","text":"£386"}]', 'C', 'Find the Manchester row, then the Off-Peak Return column. The cell reads £152. The answer is £152.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-11'), 'practice-qr-set-11-q2', 'What percentage saving does the Off-Peak Return give on Edinburgh versus the Anytime Return, to the nearest 0.1%?', '[{"label":"A","text":"41.2%"},{"label":"B","text":"52.4%"},{"label":"C","text":"58.8%"},{"label":"D","text":"71.4%"},{"label":"E","text":"142.9%"}]', 'C', 'Percentage saving = (Anytime − Off-Peak) ÷ Anytime × 100, using the original Anytime price as the denominator.

Step 1: Saving in £ = 510 − 210 = 300.

Step 2: Percentage = 300 ÷ 510 × 100 = 58.8%.

The answer is 58.8%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-11'), 'practice-qr-set-11-q3', 'A family of 2 adults and 2 children travel London to Bristol and back on Off-Peak Returns. Children pay half the adult Off-Peak Return fare. What is the total fare for the family?', '[{"label":"A","text":"£220"},{"label":"B","text":"£275"},{"label":"C","text":"£330"},{"label":"D","text":"£385"},{"label":"E","text":"£440"}]', 'C', 'Step 1: Adult Off-Peak Return to Bristol = £110.

Step 2: Two adults: 2 × £110 = £220.

Step 3: Child fare = £110 ÷ 2 = £55, and two children = 2 × £55 = £110.

Step 4: Total = £220 + £110 = £330.

The answer is £330.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-11'), 'practice-qr-set-11-q4', 'For Edinburgh, how much cheaper per mile is an Advance Single than half an Anytime Return (the one-way equivalent), to the nearest 0.1p per mile?', '[{"label":"A","text":"11.2p per mile"},{"label":"B","text":"16.5p per mile"},{"label":"C","text":"48.4p per mile"},{"label":"D","text":"64.9p per mile"},{"label":"E","text":"81.4p per mile"}]', 'C', 'Step 1: Anytime one-way = £510 ÷ 2 = £255.

Step 2: Anytime per mile = 255 ÷ 393 = £0.6489 = 64.9p per mile.

Step 3: Advance Single per mile = 65 ÷ 393 = £0.1654 = 16.5p per mile.

Step 4: Difference = 64.9 − 16.5 = 48.4p per mile.

The answer is 48.4p per mile.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-12'), 'practice-qr-set-12-q1', 'How long does the Norwich to Birmingham leg take?', '[{"label":"A","text":"2 h 30 m"},{"label":"B","text":"3 h 00 m"},{"label":"C","text":"3 h 15 m"},{"label":"D","text":"3 h 30 m"},{"label":"E","text":"3 h 45 m"}]', 'B', 'Time = distance ÷ speed = 180 ÷ 60 = 3.0 hours, which is exactly 3 h 00 m. The answer is 3 h 00 m.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-12'), 'practice-qr-set-12-q2', 'What is the total driving distance of the two legs combined, in kilometres?', '[{"label":"A","text":"320 km"},{"label":"B","text":"410 km"},{"label":"C","text":"480 km"},{"label":"D","text":"512 km"},{"label":"E","text":"640 km"}]', 'D', 'Step 1: Total miles = 180 + 140 = 320.

Step 2: Convert using the stated 1 mile = 1.6 km: 320 × 1.6 = 512 km.

The answer is 512 km.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-12'), 'practice-qr-set-12-q3', 'What is Maria''s total journey time from leaving Norwich to arriving in Aberystwyth?', '[{"label":"A","text":"6 h 30 m"},{"label":"B","text":"6 h 50 m"},{"label":"C","text":"7 h 00 m"},{"label":"D","text":"7 h 15 m"},{"label":"E","text":"7 h 30 m"}]', 'E', 'Step 1: Leg 1 time = 180 ÷ 60 = 3.0 h.

Step 2: Lunch break = 30 m = 0.5 h.

Step 3: Leg 2 time = 140 ÷ 35 = 4.0 h.

Step 4: Total = 3.0 + 0.5 + 4.0 = 7.5 h = 7 h 30 m.

The answer is 7 h 30 m.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-12'), 'practice-qr-set-12-q4', 'What is Maria''s average driving speed across the two legs (ignoring the break), to the nearest mph?', '[{"label":"A","text":"43 mph"},{"label":"B","text":"46 mph"},{"label":"C","text":"47.5 mph"},{"label":"D","text":"48 mph"},{"label":"E","text":"50 mph"}]', 'B', 'Average speed must use total distance ÷ total driving time (never the mean of the two speeds).

Step 1: Total distance = 180 + 140 = 320 miles.

Step 2: Total driving time = 3.0 + 4.0 = 7.0 hours (the lunch break is excluded).

Step 3: Average speed = 320 ÷ 7.0 = 45.7 mph, which rounds to 46 mph.

The answer is 46 mph.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-13'), 'practice-qr-set-13-q1', 'What was Emma''s commute time on Wednesday?', '[{"label":"A","text":"35 min"},{"label":"B","text":"38 min"},{"label":"C","text":"42 min"},{"label":"D","text":"48 min"},{"label":"E","text":"55 min"}]', 'C', 'Read the Emma line at Wednesday directly — 42 minutes. The answer is 42 min.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-13'), 'practice-qr-set-13-q2', 'What was Jake''s mean commute time across the five days?', '[{"label":"A","text":"42.0 min"},{"label":"B","text":"46.0 min"},{"label":"C","text":"48.2 min"},{"label":"D","text":"50.0 min"},{"label":"E","text":"55.0 min"}]', 'C', 'Mean = sum of values ÷ number of values.

Step 1: Sum Jake''s times: 52 + 45 + 50 + 48 + 46 = 241.

Step 2: Mean = 241 ÷ 5 = 48.2 minutes.

The answer is 48.2 min.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-13'), 'practice-qr-set-13-q3', 'On how many of the five days was Emma''s commute longer than Jake''s?', '[{"label":"A","text":"0 days"},{"label":"B","text":"1 day"},{"label":"C","text":"2 days"},{"label":"D","text":"3 days"},{"label":"E","text":"4 days"}]', 'C', 'Compare Emma''s and Jake''s times day by day.

Step 1: Mon — Emma 35 vs Jake 52 → no.

Step 2: Tue — Emma 48 vs Jake 45 → yes.

Step 3: Wed — Emma 42 vs Jake 50 → no.

Step 4: Thu — Emma 55 vs Jake 48 → yes.

Step 5: Fri — Emma 38 vs Jake 46 → no.

Emma''s commute was longer on two days (Tuesday and Thursday). The answer is 2 days.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-13'), 'practice-qr-set-13-q4', 'By what percentage did Emma''s commute time change from Monday to Thursday, to the nearest 0.1%?', '[{"label":"A","text":"36.4%"},{"label":"B","text":"57.1%"},{"label":"C","text":"63.6%"},{"label":"D","text":"133.3%"},{"label":"E","text":"157.1%"}]', 'B', 'Percentage change uses the original value (Monday) as the denominator: (new − old) ÷ old × 100.

Step 1: Change = 55 − 35 = 20 minutes.

Step 2: Percentage = 20 ÷ 35 × 100 = 57.1%.

The answer is 57.1%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-14'), 'practice-qr-set-14-q1', 'Which car has the highest combined mpg?', '[{"label":"A","text":"Zephyr 1.5"},{"label":"B","text":"Gale 2.0"},{"label":"C","text":"Mistral Hybrid"},{"label":"D","text":"Breeze 1.2"},{"label":"E","text":"Mistral Hybrid and Breeze 1.2 equally"}]', 'C', 'Scan the Combined mpg column for the largest value: Zephyr 48, Gale 36, Mistral 62, Breeze 55. Mistral Hybrid is highest at 62 mpg. The answer is Mistral Hybrid.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-14'), 'practice-qr-set-14-q2', 'How many litres of fuel does the Gale 2.0 use over 180 miles?', '[{"label":"A","text":"5.0 L"},{"label":"B","text":"15.0 L"},{"label":"C","text":"22.7 L"},{"label":"D","text":"28.1 L"},{"label":"E","text":"50.0 L"}]', 'C', 'Step 1: Gallons used = miles ÷ mpg = 180 ÷ 36 = 5.0 gallons.

Step 2: Convert to litres using 1 gallon = 4.546 L: 5.0 × 4.546 = 22.73 L.

The answer is 22.7 L.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-14'), 'practice-qr-set-14-q3', 'A Zephyr 1.5 driver travels 240 miles. Fuel costs £1.45 per litre. What is the journey fuel cost, to the nearest penny?', '[{"label":"A","text":"£12.60"},{"label":"B","text":"£28.50"},{"label":"C","text":"£32.96"},{"label":"D","text":"£40.20"},{"label":"E","text":"£72.55"}]', 'C', 'Step 1: Gallons used = 240 ÷ 48 = 5.0 gallons.

Step 2: Litres used = 5.0 × 4.546 = 22.73 L.

Step 3: Fuel cost = 22.73 × £1.45 = £32.9585, which rounds to £32.96.

The answer is £32.96.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-14'), 'practice-qr-set-14-q4', 'How many more miles per litre does the Mistral Hybrid cover compared with the Breeze 1.2, to the nearest 0.1 mile?', '[{"label":"A","text":"0.8 miles"},{"label":"B","text":"1.5 miles"},{"label":"C","text":"3.2 miles"},{"label":"D","text":"7.0 miles"},{"label":"E","text":"15.4 miles"}]', 'B', 'Convert each mpg to miles per litre by dividing by 4.546, then take the difference.

Step 1: Mistral = 62 ÷ 4.546 = 13.64 miles per litre.

Step 2: Breeze = 55 ÷ 4.546 = 12.10 miles per litre.

Step 3: Difference = 13.64 − 12.10 = 1.54, which rounds to 1.5 miles.

The answer is 1.5 miles.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-15'), 'practice-qr-set-15-q1', 'What is the London to Dubai distance in kilometres, to the nearest km?', '[{"label":"A","text":"2,134 km"},{"label":"B","text":"5,462 km"},{"label":"C","text":"6,324 km"},{"label":"D","text":"8,534 km"},{"label":"E","text":"10,924 km"}]', 'B', 'Multiply miles by the stated conversion factor 1.6: 3,414 × 1.6 = 5,462.4 km, which rounds to 5,462 km. The answer is 5,462 km.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-15'), 'practice-qr-set-15-q2', 'How long is the cruise phase, in hours and minutes (to the nearest minute)?', '[{"label":"A","text":"5 h 55 m"},{"label":"B","text":"6 h 10 m"},{"label":"C","text":"6 h 30 m"},{"label":"D","text":"7 h 00 m"},{"label":"E","text":"7 h 15 m"}]', 'B', 'Step 1: Total flight = 7 h 15 m = 435 minutes.

Step 2: Cruise time = 85% × 435 = 0.85 × 435 = 369.75 minutes.

Step 3: Convert to hours and minutes: 369.75 ÷ 60 = 6.1625 hours = 6 h 9.75 m, which rounds to 6 h 10 m.

The answer is 6 h 10 m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-15'), 'practice-qr-set-15-q3', 'How many miles does the aircraft cover during the cruise phase alone (at 480 mph), to the nearest mile?', '[{"label":"A","text":"2,834 miles"},{"label":"B","text":"2,958 miles"},{"label":"C","text":"3,280 miles"},{"label":"D","text":"3,414 miles"},{"label":"E","text":"3,472 miles"}]', 'B', 'Step 1: Cruise time in hours = 85% × 7.25 = 6.1625 hours.

Step 2: Distance = speed × time = 480 × 6.1625 = 2,958 miles.

The answer is 2,958 miles.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-15'), 'practice-qr-set-15-q4', 'Convert the full 3,414-mile route to nautical miles, to the nearest nautical mile.', '[{"label":"A","text":"1,843 nm"},{"label":"B","text":"2,950 nm"},{"label":"C","text":"3,162 nm"},{"label":"D","text":"3,951 nm"},{"label":"E","text":"6,324 nm"}]', 'B', 'Step 1: Convert miles to km: 3,414 × 1.6 = 5,462.4 km.

Step 2: Convert km to nautical miles using 1 nm = 1.852 km: 5,462.4 ÷ 1.852 = 2,949.5, which rounds to 2,950 nm.

The answer is 2,950 nm.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-16'), 'practice-qr-set-16-q1', 'What was Chen''s Biology score?', '[{"label":"A","text":"78%"},{"label":"B","text":"88%"},{"label":"C","text":"90%"},{"label":"D","text":"92%"},{"label":"E","text":"95%"}]', 'E', 'Find the Chen row, then the Biology column. The value is 95%. The answer is 95%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-16'), 'practice-qr-set-16-q2', 'What was Bella''s mean score across all five subjects?', '[{"label":"A","text":"70%"},{"label":"B","text":"76%"},{"label":"C","text":"78%"},{"label":"D","text":"82%"},{"label":"E","text":"88%"}]', 'C', 'Mean = sum ÷ count.

Step 1: Sum Bella''s scores: 85 + 88 + 82 + 70 + 65 = 390.

Step 2: Mean = 390 ÷ 5 = 78%.

The answer is 78%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-16'), 'practice-qr-set-16-q3', 'Which student has the largest range (highest minus lowest) across Maths, Biology, Chemistry and English?', '[{"label":"A","text":"Alex"},{"label":"B","text":"Bella"},{"label":"C","text":"Chen"},{"label":"D","text":"Dani"},{"label":"E","text":"Emir"}]', 'D', 'Range = highest − lowest, using only the four subjects the stem names (Maths, Biology, Chemistry, English — not Art).

Step 1: Alex = 82 − 68 = 14.

Step 2: Bella = 88 − 70 = 18.

Step 3: Chen = 95 − 78 = 17.

Step 4: Dani = 75 − 48 = 27.

Step 5: Emir = 88 − 70 = 18.

Dani has the largest range at 27. The answer is Dani.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-16'), 'practice-qr-set-16-q4', 'What was the overall class mean in Chemistry, to the nearest 0.1%?', '[{"label":"A","text":"70.0%"},{"label":"B","text":"72.0%"},{"label":"C","text":"74.8%"},{"label":"D","text":"75.4%"},{"label":"E","text":"80.0%"}]', 'D', 'Step 1: Sum the Chemistry column: 72 + 82 + 90 + 48 + 85 = 377.

Step 2: Mean = 377 ÷ 5 = 75.4%.

The answer is 75.4%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-17'), 'practice-qr-set-17-q1', 'Which student scored highest on the exam?', '[{"label":"A","text":"Student A"},{"label":"B","text":"Student C"},{"label":"C","text":"Student D"},{"label":"D","text":"Student E"},{"label":"E","text":"Student F"}]', 'D', 'Look for the highest point on the y-axis. Student E is at 85%, which is the top of the plot. The answer is Student E.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-17'), 'practice-qr-set-17-q2', 'Which student revised for the most hours?', '[{"label":"A","text":"Student A"},{"label":"B","text":"Student C"},{"label":"C","text":"Student D"},{"label":"D","text":"Student E"},{"label":"E","text":"Student F"}]', 'E', 'Look for the rightmost point on the x-axis. Student F is at 30 hours, the furthest right. The answer is Student F.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-17'), 'practice-qr-set-17-q3', 'Students A–E form an upward-trending pattern. Which student breaks that pattern (is the outlier)?', '[{"label":"A","text":"Student A"},{"label":"B","text":"Student B"},{"label":"C","text":"Student D"},{"label":"D","text":"Student E"},{"label":"E","text":"Student F"}]', 'E', 'Students A to E show scores rising steadily with hours (42 → 58 → 65 → 78 → 85). Student F has the most hours (30) but scores only 72% — lower than Student E already managed with fewer hours. That breaks the upward pattern. The answer is Student F.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-17'), 'practice-qr-set-17-q4', 'What is the mean "score per hour revised" across Students A to E (excluding outlier F), to the nearest 0.1?', '[{"label":"A","text":"2.4"},{"label":"B","text":"3.4"},{"label":"C","text":"5.2"},{"label":"D","text":"6.5"},{"label":"E","text":"8.4"}]', 'C', 'Work out score ÷ hours for each of the five students, then take the mean of those ratios.

Step 1: A = 42 ÷ 5 = 8.4.

Step 2: B = 58 ÷ 10 = 5.8.

Step 3: C = 65 ÷ 15 = 4.333.

Step 4: D = 78 ÷ 20 = 3.9.

Step 5: E = 85 ÷ 25 = 3.4.

Step 6: Mean = (8.4 + 5.8 + 4.333 + 3.9 + 3.4) ÷ 5 = 25.833 ÷ 5 = 5.17, which rounds to 5.2.

The answer is 5.2.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-18'), 'practice-qr-set-18-q1', 'How many student-days of attendance did Biology record across the month?', '[{"label":"A","text":"1,920"},{"label":"B","text":"2,100"},{"label":"C","text":"2,400"},{"label":"D","text":"2,500"},{"label":"E","text":"2,604"}]', 'C', 'Step 1: Possible student-days = students × teaching days = 125 × 20 = 2,500.

Step 2: Attended = 96% of 2,500 = 0.96 × 2,500 = 2,400.

The answer is 2,400.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-18'), 'practice-qr-set-18-q2', 'Which subject had the lowest attendance rate?', '[{"label":"A","text":"Biology"},{"label":"B","text":"Chemistry"},{"label":"C","text":"Physics"},{"label":"D","text":"Mathematics"},{"label":"E","text":"Further Mathematics"}]', 'E', 'Scan the attendance rates: Biology 96%, Chemistry 92%, Physics 88%, Mathematics 94%, Further Mathematics 84%. Further Mathematics is lowest at 84%. The answer is Further Mathematics.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-18'), 'practice-qr-set-18-q3', 'How many student-days of absence were recorded in Physics across the month?', '[{"label":"A","text":"86"},{"label":"B","text":"144"},{"label":"C","text":"173"},{"label":"D","text":"288"},{"label":"E","text":"345"}]', 'C', 'Step 1: Possible student-days for Physics = 72 × 20 = 1,440.

Step 2: Absence rate = 100% − 88% = 12%.

Step 3: Absent student-days = 12% × 1,440 = 0.12 × 1,440 = 172.8, which rounds to 173.

The answer is 173.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-18'), 'practice-qr-set-18-q4', 'What was the overall attendance rate across all five subjects combined, to the nearest 0.1%?', '[{"label":"A","text":"88.0%"},{"label":"B","text":"90.8%"},{"label":"C","text":"92.3%"},{"label":"D","text":"92.8%"},{"label":"E","text":"94.0%"}]', 'C', 'The overall rate must be weighted by enrolment — you can''t just average the five rates, because the subjects have different numbers of students.

Step 1: Possible student-days overall = 20 × (125 + 98 + 72 + 140 + 45) = 20 × 480 = 9,600.

Step 2: Attended student-days per subject — Biology 2,400; Chemistry 0.92 × 1,960 = 1,803.2; Physics 0.88 × 1,440 = 1,267.2; Maths 0.94 × 2,800 = 2,632; Further Maths 0.84 × 900 = 756.

Step 3: Total attended = 2,400 + 1,803.2 + 1,267.2 + 2,632 + 756 = 8,858.4.

Step 4: Overall rate = 8,858.4 ÷ 9,600 × 100 = 92.3%.

The answer is 92.3%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-19'), 'practice-qr-set-19-q1', 'How many students enrolled in Mathematics in 2024?', '[{"label":"A","text":"240"},{"label":"B","text":"250"},{"label":"C","text":"260"},{"label":"D","text":"280"},{"label":"E","text":"780"}]', 'C', 'Find the Mathematics row, then the 2024 column. The cell reads 260. The answer is 260.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-19'), 'practice-qr-set-19-q2', 'What was the total enrolment across all four departments in 2023?', '[{"label":"A","text":"550"},{"label":"B","text":"610"},{"label":"C","text":"635"},{"label":"D","text":"670"},{"label":"E","text":"780"}]', 'C', 'Sum the 2023 column: 240 + 180 + 120 + 95 = 635. The answer is 635.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-19'), 'practice-qr-set-19-q3', 'What was the Sciences enrolment in 2025?', '[{"label":"A","text":"180"},{"label":"B","text":"190"},{"label":"C","text":"200"},{"label":"D","text":"210"},{"label":"E","text":"225"}]', 'D', 'The three-year total is fixed, so the missing value = total − sum of the known years.

Step 1: Sciences three-year total = 585.

Step 2: Known years = 180 + 195 = 375.

Step 3: 2025 = 585 − 375 = 210.

The answer is 210.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-19'), 'practice-qr-set-19-q4', 'What was the percentage change in Humanities enrolment from 2023 to 2025?', '[{"label":"A","text":"4.2% decrease"},{"label":"B","text":"8.3% decrease"},{"label":"C","text":"8.3% increase"},{"label":"D","text":"9.1% decrease"},{"label":"E","text":"9.1% increase"}]', 'B', 'Percentage change uses the original (2023) as the denominator: (new − old) ÷ old × 100.

Step 1: Change = 110 − 120 = −10.

Step 2: Percentage = −10 ÷ 120 × 100 = −8.3%, which is an 8.3% decrease.

The answer is 8.3% decrease.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-20'), 'practice-qr-set-20-q1', 'What is the total floor area of the classroom, in square metres?', '[{"label":"A","text":"24 m²"},{"label":"B","text":"36 m²"},{"label":"C","text":"48 m²"},{"label":"D","text":"52 m²"},{"label":"E","text":"60 m²"}]', 'C', 'Split the L-shape into two rectangles and add their areas.

Step 1: Left column = 4 m wide × 6 m tall = 24 m².

Step 2: Lower extension (the strip to the right of the column) = 6 m wide × 4 m tall = 24 m².

Step 3: Total area = 24 + 24 = 48 m².

The answer is 48 m².', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-20'), 'practice-qr-set-20-q2', 'What is the perimeter of the classroom floor?', '[{"label":"A","text":"28 m"},{"label":"B","text":"30 m"},{"label":"C","text":"32 m"},{"label":"D","text":"36 m"},{"label":"E","text":"38 m"}]', 'C', 'Trace the outer boundary all the way round: 4 m (top) + 2 m (step down) + 6 m (step across) + 4 m (right side) + 10 m (bottom) + 6 m (left side) = 32 m. The answer is 32 m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-20'), 'practice-qr-set-20-q3', 'Carpet for the whole floor costs £22 per m². What is the total carpet cost?', '[{"label":"A","text":"£528"},{"label":"B","text":"£792"},{"label":"C","text":"£1,056"},{"label":"D","text":"£1,200"},{"label":"E","text":"£1,320"}]', 'C', 'Cost = area × rate = 48 × £22 = £1,056. The answer is £1,056.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-20'), 'practice-qr-set-20-q4', 'A skirting board runs along the full perimeter except for a 1.2 m-wide doorway. The skirting costs £4.50 per metre (cut to exact length). What is the total skirting cost?', '[{"label":"A","text":"£126.00"},{"label":"B","text":"£138.60"},{"label":"C","text":"£144.00"},{"label":"D","text":"£150.00"},{"label":"E","text":"£162.00"}]', 'B', 'Step 1: Skirting length = perimeter − doorway = 32 − 1.2 = 30.8 m.

Step 2: Cost = 30.8 × £4.50 = £138.60.

The answer is £138.60.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-21'), 'practice-qr-set-21-q1', 'What was Manchester''s rainfall in March?', '[{"label":"A","text":"64 mm"},{"label":"B","text":"68 mm"},{"label":"C","text":"72 mm"},{"label":"D","text":"80 mm"},{"label":"E","text":"85 mm"}]', 'C', 'Read the Manchester line at March directly — 72 mm. The answer is 72 mm.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-21'), 'practice-qr-set-21-q2', 'What was the total rainfall in Plymouth across the six months shown?', '[{"label":"A","text":"420 mm"},{"label":"B","text":"447 mm"},{"label":"C","text":"460 mm"},{"label":"D","text":"480 mm"},{"label":"E","text":"520 mm"}]', 'B', 'Sum the Plymouth values across all six months: 112 + 95 + 80 + 60 + 48 + 52 = 447 mm. The answer is 447 mm.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-21'), 'practice-qr-set-21-q3', 'In which month was the difference between Manchester and Plymouth rainfall greatest?', '[{"label":"A","text":"January"},{"label":"B","text":"March"},{"label":"C","text":"April"},{"label":"D","text":"May"},{"label":"E","text":"June"}]', 'E', 'Work out |Manchester − Plymouth| for each listed month.

Step 1: January = |98 − 112| = 14.

Step 2: March = |72 − 80| = 8.

Step 3: April = |64 − 60| = 4.

Step 4: May = |55 − 48| = 7.

Step 5: June = |68 − 52| = 16.

June has the largest gap at 16 mm. The answer is June.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-21'), 'practice-qr-set-21-q4', 'By what percentage did Manchester''s rainfall fall from January to May, to the nearest 0.1%?', '[{"label":"A","text":"34.5%"},{"label":"B","text":"43.9%"},{"label":"C","text":"55.1%"},{"label":"D","text":"56.1%"},{"label":"E","text":"78.2%"}]', 'B', 'Percentage decrease = (old − new) ÷ old × 100, using January (the original) as the denominator.

Step 1: Fall = 98 − 55 = 43.

Step 2: Percentage = 43 ÷ 98 × 100 = 43.9%.

The answer is 43.9%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-22'), 'practice-qr-set-22-q1', 'What percentage of household waste was recycled?', '[{"label":"A","text":"15%"},{"label":"B","text":"20%"},{"label":"C","text":"30%"},{"label":"D","text":"45%"},{"label":"E","text":"55%"}]', 'D', 'Read the Recycled segment directly from the legend — 45%. The answer is 45%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-22'), 'practice-qr-set-22-q2', 'In its simplest form, what is the ratio of Recycled to Incinerated waste?', '[{"label":"A","text":"2 : 1"},{"label":"B","text":"4 : 9"},{"label":"C","text":"9 : 1"},{"label":"D","text":"9 : 4"},{"label":"E","text":"20 : 45"}]', 'D', 'Recycled = 45 and Incinerated = 20, so the ratio is 45 : 20. Divide both sides by 5 to simplify: 9 : 4. The stem names Recycled first, so it goes first. The answer is 9 : 4.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-22'), 'practice-qr-set-22-q3', 'What percentage of household waste went to landfill?', '[{"label":"A","text":"10%"},{"label":"B","text":"15%"},{"label":"C","text":"20%"},{"label":"D","text":"25%"},{"label":"E","text":"35%"}]', 'B', 'The segments sum to 100%, so the missing segment = 100 − sum of the known segments.

Step 1: Sum of the known segments = 45 + 15 + 20 + 5 = 85.

Step 2: Landfill = 100 − 85 = 15%.

The answer is 15%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-22'), 'practice-qr-set-22-q4', 'The council processes 1,800 tonnes of household waste per month. How many tonnes per year are sent to landfill?', '[{"label":"A","text":"2,160 tonnes"},{"label":"B","text":"2,700 tonnes"},{"label":"C","text":"3,240 tonnes"},{"label":"D","text":"3,960 tonnes"},{"label":"E","text":"9,720 tonnes"}]', 'C', 'Step 1: Annual waste = 1,800 × 12 = 21,600 tonnes.

Step 2: Landfill share = 15% (from the previous question).

Step 3: Annual landfill = 21,600 × 0.15 = 3,240 tonnes.

The answer is 3,240 tonnes.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-23'), 'practice-qr-set-23-q1', 'What is the volume of the tank, in cubic metres, to the nearest 0.01 m³?', '[{"label":"A","text":"6.78 m³"},{"label":"B","text":"13.56 m³"},{"label":"C","text":"18.08 m³"},{"label":"D","text":"21.70 m³"},{"label":"E","text":"54.26 m³"}]', 'B', 'Volume of a cylinder = πr²h. You need the radius, not the diameter.

Step 1: Radius = diameter ÷ 2 = 2.4 ÷ 2 = 1.2 m.

Step 2: Volume = 3.14 × 1.2² × 3.0 = 3.14 × 1.44 × 3.0 = 13.5648, which rounds to 13.56 m³.

The answer is 13.56 m³.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-23'), 'practice-qr-set-23-q2', 'How many litres does the tank hold when full, to the nearest litre?', '[{"label":"A","text":"1,357 L"},{"label":"B","text":"6,782 L"},{"label":"C","text":"13,565 L"},{"label":"D","text":"18,086 L"},{"label":"E","text":"54,259 L"}]', 'C', 'Using the stated 1 m³ = 1,000 L, multiply the volume by 1,000: 13.5648 × 1,000 = 13,564.8 L, which rounds to 13,565 L. The answer is 13,565 L.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-23'), 'practice-qr-set-23-q3', 'Starting from empty, how long does it take to fill the tank completely, in hours and minutes (to the nearest minute)?', '[{"label":"A","text":"11 h 15 m"},{"label":"B","text":"12 h 34 m"},{"label":"C","text":"12 h 55 m"},{"label":"D","text":"13 h 10 m"},{"label":"E","text":"14 h 05 m"}]', 'B', 'Step 1: Time = volume ÷ flow rate = 13,564.8 ÷ 18 = 753.6 minutes.

Step 2: Convert to hours and minutes: 753.6 ÷ 60 = 12.56 hours = 12 h 33.6 m, which rounds to 12 h 34 m.

The answer is 12 h 34 m.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-23'), 'practice-qr-set-23-q4', 'If the flow rate doubles to 36 litres per minute, how long does the tank take to fill from empty?', '[{"label":"A","text":"5 h 03 m"},{"label":"B","text":"6 h 17 m"},{"label":"C","text":"7 h 28 m"},{"label":"D","text":"8 h 42 m"},{"label":"E","text":"9 h 10 m"}]', 'B', 'Doubling the flow rate halves the fill time, because time is inversely proportional to rate.

Step 1: Time = 13,564.8 ÷ 36 = 376.8 minutes.

Step 2: Convert to hours and minutes: 376.8 ÷ 60 = 6.28 hours = 6 h 16.8 m, which rounds to 6 h 17 m.

The answer is 6 h 17 m.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-24'), 'practice-qr-set-24-q1', 'Which sector had the highest emissions in 2025?', '[{"label":"A","text":"Energy"},{"label":"B","text":"Transport"},{"label":"C","text":"Industry"},{"label":"D","text":"Buildings"},{"label":"E","text":"Agriculture"}]', 'B', 'Scan the 2025 column for the largest value: Energy 75, Transport 95, Industry 68, Buildings 60, Agriculture 56. Transport at 95 is highest. The answer is Transport.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-24'), 'practice-qr-set-24-q2', 'What was the total UK emissions across all five sectors in 2025?', '[{"label":"A","text":"305 MtCO₂"},{"label":"B","text":"328 MtCO₂"},{"label":"C","text":"354 MtCO₂"},{"label":"D","text":"378 MtCO₂"},{"label":"E","text":"400 MtCO₂"}]', 'C', 'Sum the 2025 column: 75 + 95 + 68 + 60 + 56 = 354 MtCO₂. The answer is 354 MtCO₂.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-24'), 'practice-qr-set-24-q3', 'What was the percentage change in Energy sector emissions from 2015 to 2025?', '[{"label":"A","text":"30.5% decrease"},{"label":"B","text":"38.1% decrease"},{"label":"C","text":"46.4% decrease"},{"label":"D","text":"53.6% decrease"},{"label":"E","text":"65.0% decrease"}]', 'C', 'Percentage change = (new − old) ÷ old × 100, using 2015 as the denominator.

Step 1: Change = 75 − 140 = −65.

Step 2: Percentage = −65 ÷ 140 × 100 = −46.4%, which is a 46.4% decrease.

The answer is 46.4% decrease.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-24'), 'practice-qr-set-24-q4', 'If Transport emissions continue to fall by the same absolute amount per 5-year period as they did between 2020 and 2025, what would Transport emissions be in 2030?', '[{"label":"A","text":"70 MtCO₂"},{"label":"B","text":"80 MtCO₂"},{"label":"C","text":"85 MtCO₂"},{"label":"D","text":"90 MtCO₂"},{"label":"E","text":"95 MtCO₂"}]', 'C', 'Project forward using the same absolute fall as the previous 5-year period.

Step 1: Change 2020 → 2025 = 105 − 95 = 10 MtCO₂.

Step 2: 2030 projection = 95 − 10 = 85 MtCO₂.

The answer is 85 MtCO₂.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-25'), 'practice-qr-set-25-q1', 'What is the population density of District A, in people per km²?', '[{"label":"A","text":"2,000"},{"label":"B","text":"3,500"},{"label":"C","text":"4,000"},{"label":"D","text":"5,000"},{"label":"E","text":"8,000"}]', 'C', 'Population density = population ÷ area = 48,000 ÷ 12 = 4,000 people per km². The answer is 4,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-25'), 'practice-qr-set-25-q2', 'Which district has the highest population density?', '[{"label":"A","text":"District A"},{"label":"B","text":"District B"},{"label":"C","text":"District C"},{"label":"D","text":"Districts A and B equally"},{"label":"E","text":"Can''t Tell"}]', 'C', 'Work out the density for each district.

Step 1: A = 48,000 ÷ 12 = 4,000.

Step 2: B = 84,000 ÷ 28 = 3,000.

Step 3: C = 36,000 ÷ 6 = 6,000.

District C has the highest density. The answer is District C.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-25'), 'practice-qr-set-25-q3', 'What is the combined population density across all three districts, to the nearest whole person per km²?', '[{"label":"A","text":"3,500"},{"label":"B","text":"3,652"},{"label":"C","text":"3,800"},{"label":"D","text":"4,000"},{"label":"E","text":"4,333"}]', 'B', 'Combined density must use total people ÷ total area, not the average of the three separate densities.

Step 1: Total population = 48,000 + 84,000 + 36,000 = 168,000.

Step 2: Total area = 12 + 28 + 6 = 46 km².

Step 3: Density = 168,000 ÷ 46 = 3,652.17, which rounds to 3,652.

The answer is 3,652.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-25'), 'practice-qr-set-25-q4', 'A new housing development adds 12,000 residents to District A and expands its area by 3 km². What will District A''s new population density be, to the nearest whole person per km²?', '[{"label":"A","text":"3,636"},{"label":"B","text":"4,000"},{"label":"C","text":"4,167"},{"label":"D","text":"4,800"},{"label":"E","text":"5,200"}]', 'B', 'Step 1: New population = 48,000 + 12,000 = 60,000.

Step 2: New area = 12 + 3 = 15 km².

Step 3: New density = 60,000 ÷ 15 = 4,000 people per km² (unchanged, because both population and area grew by 25%).

The answer is 4,000.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-26'), 'practice-qr-set-26-q1', 'How many Neurology referrals were received in the South region?', '[{"label":"A","text":"90"},{"label":"B","text":"100"},{"label":"C","text":"110"},{"label":"D","text":"120"},{"label":"E","text":"300"}]', 'B', 'Find the Neurology row, then move across to the South column. The cell where they meet shows 100. The answer is 100.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-26'), 'practice-qr-set-26-q2', 'Using the Gastroenterology row total, what value should replace the ? in the Gastroenterology / Central cell?', '[{"label":"A","text":"130"},{"label":"B","text":"160"},{"label":"C","text":"250"},{"label":"D","text":"280"},{"label":"E","text":"290"}]', 'B', 'The row must add up to the stated row total, so the missing cell = row total − sum of the other cells in that row.

Step 1: Gastroenterology row total = 410, with North = 120 and South = 130.

Step 2: Missing Central value = 410 − 120 − 130 = 160.

The answer is 160.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-26'), 'practice-qr-set-26-q3', 'What percentage of all Dermatology referrals came from the North region, to the nearest 0.1%?', '[{"label":"A","text":"10.3%"},{"label":"B","text":"32.4%"},{"label":"C","text":"33.3%"},{"label":"D","text":"34.3%"},{"label":"E","text":"37.1%"}]', 'D', 'Percentage of a row = cell value ÷ row total × 100.

Step 1: From the Dermatology row, North = 240 and the row total = 700.

Step 2: 240 ÷ 700 × 100 = 34.2857... = 34.3%.

The answer is 34.3%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-26'), 'practice-qr-set-26-q4', 'In its simplest form, what is the ratio of all North referrals to all South referrals across the five specialties?', '[{"label":"A","text":"7 : 10"},{"label":"B","text":"35 : 37"},{"label":"C","text":"37 : 35"},{"label":"D","text":"74 : 70"},{"label":"E","text":"370 : 350"}]', 'C', 'Use the column totals from the bottom row of the table: North = 740 and South = 700, so the ratio starts as 740 : 700.

Step 1: Find the largest number that divides both sides. 740 and 700 share a factor of 20.

Step 2: 740 ÷ 20 = 37 and 700 ÷ 20 = 35, so the ratio in simplest form is 37 : 35.

The answer is 37 : 35.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-27'), 'practice-qr-set-27-q1', 'How many students achieved A*/A in Chemistry in 2025?', '[{"label":"A","text":"130"},{"label":"B","text":"140"},{"label":"C","text":"150"},{"label":"D","text":"160"},{"label":"E","text":"210"}]', 'C', 'Read the 2025 series bar for Chemistry. The bar sits at 150. The answer is 150.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-27'), 'practice-qr-set-27-q2', 'What was the percentage change in the number of Biology A*/A achievers from 2024 to 2025, to the nearest 0.1%?', '[{"label":"A","text":"14.3%"},{"label":"B","text":"15.0%"},{"label":"C","text":"16.7%"},{"label":"D","text":"30.0%"},{"label":"E","text":"85.7%"}]', 'C', 'Percentage change = (new − old) ÷ old × 100, using the 2024 value as the base.

Step 1: Biology 2024 = 180 and Biology 2025 = 210, so the difference = 210 − 180 = 30.

Step 2: 30 ÷ 180 × 100 = 16.666... = 16.7%.

The answer is 16.7%.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-27'), 'practice-qr-set-27-q3', 'In 2025, in its simplest form, what is the ratio of Maths to English A*/A achievers?', '[{"label":"A","text":"12 : 13"},{"label":"B","text":"13 : 24"},{"label":"C","text":"24 : 13"},{"label":"D","text":"130 : 240"},{"label":"E","text":"240 : 130"}]', 'C', 'Read the 2025 bars for Maths and English: Maths = 240 and English = 130, so the ratio starts as 240 : 130.

Step 1: Divide both sides by their common factor of 10 to get 24 : 13.

Step 2: 24 and 13 share no further common factors (13 is prime), so 24 : 13 is the simplest form.

The answer is 24 : 13.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-27'), 'practice-qr-set-27-q4', 'In 2024, what percentage of all A*/A achievers across the five subjects were in Physics, to the nearest 0.1%?', '[{"label":"A","text":"14.6%"},{"label":"B","text":"17.1%"},{"label":"C","text":"20.1%"},{"label":"D","text":"26.8%"},{"label":"E","text":"77.8%"}]', 'B', 'Find Physics 2024 as a share of the total 2024 achievers.

Step 1: Add the 2024 bars: 180 + 160 + 140 + 220 + 120 = 820.

Step 2: Physics 2024 = 140, so percentage = 140 ÷ 820 × 100 = 17.073... = 17.1%.

The answer is 17.1%.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-28'), 'practice-qr-set-28-q1', 'What was Operator B''s punctuality in March?', '[{"label":"A","text":"78%"},{"label":"B","text":"80%"},{"label":"C","text":"83%"},{"label":"D","text":"85%"},{"label":"E","text":"87%"}]', 'C', 'Read the Operator B line directly at March. The value sits at 83%. The answer is 83%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-28'), 'practice-qr-set-28-q2', 'For Operator C, in which month-to-month interval was the drop in punctuality largest?', '[{"label":"A","text":"Jan to Feb"},{"label":"B","text":"Feb to Mar"},{"label":"C","text":"Mar to Apr"},{"label":"D","text":"Apr to May"},{"label":"E","text":"May to Jun"}]', 'B', 'Work out the change in Operator C''s punctuality between each pair of consecutive months.

Step 1: Jan to Feb = 92 to 91, a drop of 1 percentage point.

Step 2: Feb to Mar = 91 to 87, a drop of 4 percentage points.

Step 3: Mar to Apr = 87 to 85, a drop of 2 percentage points.

Step 4: Apr to May = 85 to 83, a drop of 2 percentage points.

Step 5: May to Jun = 83 to 82, a drop of 1 percentage point.

Feb to Mar has the largest drop at 4 percentage points. The answer is Feb to Mar.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-28'), 'practice-qr-set-28-q3', 'Given Operator A''s 6-month mean punctuality was 85%, what was its punctuality in April?', '[{"label":"A","text":"78%"},{"label":"B","text":"80%"},{"label":"C","text":"82%"},{"label":"D","text":"84%"},{"label":"E","text":"86%"}]', 'C', 'Use the mean to back-calculate the missing April value: April = (mean × number of months) − sum of the other five months.

Step 1: Total punctuality across 6 months = 85 × 6 = 510.

Step 2: Sum of the known months (Jan, Feb, Mar, May, Jun) = 88 + 86 + 84 + 83 + 87 = 428.

Step 3: April value = 510 − 428 = 82.

The answer is 82%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-28'), 'practice-qr-set-28-q4', 'In June, by how many percentage points did Operator B''s punctuality exceed Operator C''s?', '[{"label":"A","text":"1"},{"label":"B","text":"4"},{"label":"C","text":"5"},{"label":"D","text":"6"},{"label":"E","text":"10"}]', 'D', 'Read the June values: Operator B = 88 and Operator C = 82. Difference = 88 − 82 = 6 percentage points. The answer is 6.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-29'), 'practice-qr-set-29-q1', 'How much does the family spend on Housing each month?', '[{"label":"A","text":"£360"},{"label":"B","text":"£450"},{"label":"C","text":"£540"},{"label":"D","text":"£900"},{"label":"E","text":"£1,080"}]', 'E', 'Read the Housing segment value directly from the chart legend. Housing = £1,080. The answer is £1,080.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-29'), 'practice-qr-set-29-q2', 'How much does the family spend on Entertainment each month?', '[{"label":"A","text":"£180"},{"label":"B","text":"£270"},{"label":"C","text":"£360"},{"label":"D","text":"£600"},{"label":"E","text":"£1,170"}]', 'B', 'The six segments together must add up to the stated total of £3,600, so Entertainment = total − sum of the other five segments.

Step 1: Sum of the labelled segments = 1,080 + 540 + 450 + 360 + 900 = £3,330.

Step 2: Entertainment = 3,600 − 3,330 = £270.

The answer is £270.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-29'), 'practice-qr-set-29-q3', 'In its simplest form, what is the ratio of Food spending to Transport spending?', '[{"label":"A","text":"5 : 6"},{"label":"B","text":"6 : 5"},{"label":"C","text":"9 : 10"},{"label":"D","text":"10 : 9"},{"label":"E","text":"54 : 45"}]', 'B', 'Read Food = £540 and Transport = £450, so the ratio starts as 540 : 450.

Step 1: Divide both sides by their common factor of 90 to get 6 : 5.

Step 2: 6 and 5 share no further common factors, so 6 : 5 is the simplest form.

The answer is 6 : 5.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-29'), 'practice-qr-set-29-q4', 'If the family''s monthly net income rises by 15% and they keep the same proportional split across all categories, how much will they spend on Utilities each month?', '[{"label":"A","text":"£360"},{"label":"B","text":"£414"},{"label":"C","text":"£450"},{"label":"D","text":"£540"},{"label":"E","text":"£621"}]', 'B', 'If the proportional split stays the same, the Utilities share of the budget is unchanged, so new Utilities = old Utilities × (1 + 0.15).

Step 1: Current Utilities spending = £360.

Step 2: 360 × 1.15 = £414.

The answer is £414.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-30'), 'practice-qr-set-30-q1', 'How much strong white flour, in grams, is needed to make 10 loaves using the same recipe?', '[{"label":"A","text":"2,400"},{"label":"B","text":"2,800"},{"label":"C","text":"3,000"},{"label":"D","text":"3,600"},{"label":"E","text":"4,800"}]', 'C', 'Scale the flour amount by the ratio of new loaves to recipe loaves.

Step 1: The base recipe uses 1,200 g for 4 loaves, so flour per loaf = 1,200 ÷ 4 = 300 g.

Step 2: For 10 loaves, flour needed = 300 × 10 = 3,000 g.

The answer is 3,000 g.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-30'), 'practice-qr-set-30-q2', 'What is the total cost of the strong white flour needed to make one batch (4 loaves)?', '[{"label":"A","text":"£1.17"},{"label":"B","text":"£1.40"},{"label":"C","text":"£1.68"},{"label":"D","text":"£2.40"},{"label":"E","text":"£16.80"}]', 'C', 'Convert the flour quantity into kilograms and multiply by the price per kg.

Step 1: 1,200 g = 1.2 kg.

Step 2: Cost = 1.2 × £1.40 = £1.68.

The answer is £1.68.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-30'), 'practice-qr-set-30-q3', 'Across a batch of 20 loaves, what is the combined cost of the flour, salt, and fresh yeast required, to the nearest penny?', '[{"label":"A","text":"£2.03"},{"label":"B","text":"£8.40"},{"label":"C","text":"£8.69"},{"label":"D","text":"£10.13"},{"label":"E","text":"£12.29"}]', 'D', 'Scale each ingredient to 20 loaves (a scale factor of 20 ÷ 4 = 5), then cost each one using its stated unit price.

Step 1: Flour = 1,200 × 5 = 6,000 g = 6 kg. Cost = 6 × £1.40 = £8.40.

Step 2: Salt = 30 × 5 = 150 g. Cost = (150 ÷ 500) × £0.95 = 0.3 × £0.95 = £0.285, which rounds to £0.29.

Step 3: Fresh yeast = 20 × 5 = 100 g. Cost = (100 ÷ 250) × £3.60 = 0.4 × £3.60 = £1.44.

Step 4: Total = £8.40 + £0.285 + £1.44 = £10.125, which rounds to £10.13.

The answer is £10.13.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-30'), 'practice-qr-set-30-q4', 'What profit does the bakery make on each loaf sold, to the nearest penny?', '[{"label":"A","text":"£2.52"},{"label":"B","text":"£3.35"},{"label":"C","text":"£3.78"},{"label":"D","text":"£4.20"},{"label":"E","text":"Can''t Tell"}]', 'E', 'Profit per loaf = sale price per loaf − total ingredient cost per loaf. The sale price is £4.20, but the ingredient cost per loaf cannot be fully worked out: water and sourdough starter are both ingredients in the recipe, and their prices are not given in the stimulus. Without those two prices the total ingredient cost is unknown, so profit per loaf cannot be determined from the information provided. The answer is Can''t Tell.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-31'), 'practice-qr-set-31-q1', 'What was Branch D''s net profit in 2025?', '[{"label":"A","text":"£5,000"},{"label":"B","text":"£22,000"},{"label":"C","text":"£35,000"},{"label":"D","text":"£40,000"},{"label":"E","text":"£55,000"}]', 'D', 'Read the 2025 bar for Branch D. It reaches 40 on the Net Profit (£000s) scale, so the net profit is £40,000. The answer is £40,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-31'), 'practice-qr-set-31-q2', 'In how many branches was the 2025 net profit positive (above the zero line)?', '[{"label":"A","text":"2"},{"label":"B","text":"3"},{"label":"C","text":"4"},{"label":"D","text":"5"},{"label":"E","text":"6"}]', 'C', 'Scan the 2025 series and count bars that sit above the zero baseline. Branch A (55), Branch C (22), Branch D (40) and Branch E (5) are positive; Branch B (−8) and Branch F (−10) are below zero. That gives 4 positive branches. The answer is 4.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-31'), 'practice-qr-set-31-q3', 'Which branch showed the largest increase in net profit from 2024 to 2025?', '[{"label":"A","text":"Branch A"},{"label":"B","text":"Branch C"},{"label":"C","text":"Branch D"},{"label":"D","text":"Branch E"},{"label":"E","text":"Branch F"}]', 'B', 'Work out the 2025 minus 2024 change for each branch, keeping the signs.

Step 1: Branch A: 55 − 42 = +13. Branch C: 22 − (−5) = +27. Branch D: 40 − 35 = +5. Branch E: 5 − (−12) = +17. Branch F: −10 − 28 = −38.

Step 2: The biggest positive change is +27 at Branch C.

The answer is Branch C.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-31'), 'practice-qr-set-31-q4', 'What was the total net profit across all six branches in 2025?', '[{"label":"A","text":"£86,000"},{"label":"B","text":"£104,000"},{"label":"C","text":"£106,000"},{"label":"D","text":"£122,000"},{"label":"E","text":"£140,000"}]', 'B', 'Step 1: Add the 2025 values for all six branches, keeping negatives as negatives: 55 + (−8) + 22 + 40 + 5 + (−10) = 104 (in £000s).

Step 2: The y-axis is labelled in £000s, so the total is 104 × £1,000 = £104,000.

The answer is £104,000.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-32'), 'practice-qr-set-32-q1', 'What is Patient B''s BMI, to 1 decimal place?', '[{"label":"A","text":"27.1"},{"label":"B","text":"30.2"},{"label":"C","text":"31.0"},{"label":"D","text":"32.3"},{"label":"E","text":"54.3"}]', 'C', 'Use the formula in the stimulus: BMI = weight ÷ height².

Step 1: From the table, Patient B weighs 95 kg and is 1.75 m tall.

Step 2: Height squared = 1.75 × 1.75 = 3.0625.

Step 3: BMI = 95 ÷ 3.0625 = 31.02, which rounds to 31.0.

The answer is 31.0.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-32'), 'practice-qr-set-32-q2', 'How many of the five patients fall within the healthy BMI range (18.5–24.9)?', '[{"label":"A","text":"1"},{"label":"B","text":"2"},{"label":"C","text":"3"},{"label":"D","text":"4"},{"label":"E","text":"5"}]', 'C', 'Work out each BMI and check the range.

Step 1: Patient A = 72 ÷ 1.80² = 72 ÷ 3.24 = 22.2 (healthy). Patient B = 31.0 (obese). Patient C = 58 ÷ 1.65² = 58 ÷ 2.7225 = 21.3 (healthy). Patient D = 84 ÷ 1.68² = 84 ÷ 2.8224 = 29.8 (overweight). Patient E = 62 ÷ 1.70² = 62 ÷ 2.89 = 21.5 (healthy).

Step 2: Patients A, C and E sit in the 18.5–24.9 range, which is 3 patients.

The answer is 3.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-32'), 'practice-qr-set-32-q3', 'Patient D wants to reduce their BMI to the top of the healthy range (24.9) without changing height. To the nearest kilogram, how much weight must they lose?', '[{"label":"A","text":"9 kg"},{"label":"B","text":"12 kg"},{"label":"C","text":"14 kg"},{"label":"D","text":"17 kg"},{"label":"E","text":"42 kg"}]', 'C', 'Rearrange the BMI formula: target weight = BMI × height².

Step 1: Patient D''s height is 1.68 m, so height² = 1.68 × 1.68 = 2.8224.

Step 2: Target weight = 24.9 × 2.8224 = 70.28 kg.

Step 3: Weight to lose = current − target = 84 − 70.28 = 13.72 kg, which rounds to 14 kg.

The answer is 14 kg.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-32'), 'practice-qr-set-32-q4', 'A sixth patient has a weight of 88 kg and a BMI of 27.2. To the nearest centimetre, what is this patient''s height?', '[{"label":"A","text":"162 cm"},{"label":"B","text":"174 cm"},{"label":"C","text":"180 cm"},{"label":"D","text":"196 cm"},{"label":"E","text":"324 cm"}]', 'C', 'Rearrange the BMI formula for height: height = √(weight ÷ BMI).

Step 1: weight ÷ BMI = 88 ÷ 27.2 = 3.2353.

Step 2: height = √3.2353 = 1.799 m.

Step 3: Convert to centimetres: 1.799 × 100 = 179.9 cm, which rounds to 180 cm.

The answer is 180 cm.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-33'), 'practice-qr-set-33-q1', 'Which city has the highest average monthly rent?', '[{"label":"A","text":"City A"},{"label":"B","text":"City B"},{"label":"C","text":"City C"},{"label":"D","text":"City D"},{"label":"E","text":"City E"}]', 'D', 'Look for the point with the largest y-coordinate (rent). City D sits at £1,850 per month, which is higher than every other labelled point on the plot. The answer is City D.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-33'), 'practice-qr-set-33-q2', 'What is the ratio of City D''s population density to City A''s population density, in the form n:1, to 1 decimal place?', '[{"label":"A","text":"2.3:1"},{"label":"B","text":"2.8:1"},{"label":"C","text":"3.1:1"},{"label":"D","text":"3.2:1"},{"label":"E","text":"4.0:1"}]', 'D', 'Read the x-values for each city from the plot.

Step 1: City D has a density of 5,800 people per km², and City A has a density of 1,800 people per km².

Step 2: Divide: 5,800 ÷ 1,800 = 3.222…, which rounds to 3.2.

The answer is 3.2:1.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-33'), 'practice-qr-set-33-q3', 'If City A''s average rent rose by 20% and City E''s average rent fell by 8%, what would the combined monthly rent of City A and City E be?', '[{"label":"A","text":"£1,330"},{"label":"B","text":"£1,392"},{"label":"C","text":"£1,400"},{"label":"D","text":"£1,470"},{"label":"E","text":"£1,680"}]', 'D', 'Apply each percentage change to the correct city''s rent.

Step 1: City A''s new rent = £650 × 1.20 = £780.

Step 2: City E''s new rent = £750 × 0.92 = £690.

Step 3: Combined = £780 + £690 = £1,470.

The answer is £1,470.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-33'), 'practice-qr-set-33-q4', 'City A''s council is considering a housing development that would double its population density. Based on the scatter plot alone, what would the expected new average monthly rent in City A be?', '[{"label":"A","text":"£650"},{"label":"B","text":"£900"},{"label":"C","text":"£1,100"},{"label":"D","text":"£1,300"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The scatter plot shows how five different cities compare at a single point in time. It does not say what would happen to one particular city''s rent if its density changed, and doubling A''s density would place it between cities B and C, where rents already differ from each other for reasons the plot does not explain. With no rule linking a change in density to a change in rent for the same city, the new rent cannot be determined from the plot alone. The answer is Can''t Tell.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-34'), 'practice-qr-set-34-q1', 'The shop floor is a rectangle of 8 m by 5 m with a semicircular bay window of radius 2.5 m attached to one short side. Using π = 3.14, what is the total floor area, to the nearest 0.1 m²?', '[{"label":"A","text":"40.0 m²"},{"label":"B","text":"47.9 m²"},{"label":"C","text":"49.8 m²"},{"label":"D","text":"59.6 m²"},{"label":"E","text":"79.3 m²"}]', 'C', 'Add the rectangle area and the semicircle area.

Step 1: Rectangle area = 8 × 5 = 40 m².

Step 2: Semicircle area = ½ × π × r² = ½ × 3.14 × 2.5² = ½ × 3.14 × 6.25 = 9.8125 m².

Step 3: Total area = 40 + 9.8125 = 49.8 m² (to 1 d.p.).

The answer is 49.8 m².', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-34'), 'practice-qr-set-34-q2', 'What is the perimeter of the outer edge of the shop floor, to the nearest 0.1 m?

Arc length of a semicircle = πr (use π = 3.14)', '[{"label":"A","text":"26.0 m"},{"label":"B","text":"28.9 m"},{"label":"C","text":"33.9 m"},{"label":"D","text":"36.7 m"},{"label":"E","text":"41.7 m"}]', 'B', 'The outer edge is made of three straight sides of the rectangle (the fourth is replaced by the bay) plus the curved arc.

Step 1: Straight sides = 8 (top) + 5 (left) + 8 (bottom) = 21 m.

Step 2: Arc length = π × r = 3.14 × 2.5 = 7.85 m.

Step 3: Perimeter = 21 + 7.85 = 28.85 m, which rounds to 28.9 m.

The answer is 28.9 m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-34'), 'practice-qr-set-34-q3', 'The owner plans to tile the floor. Tiles cost £32 per m², a 15% wastage allowance is added to the area, and a flat labour fee of £120 is charged. What is the total cost, to the nearest £?', '[{"label":"A","text":"£1,594"},{"label":"B","text":"£1,714"},{"label":"C","text":"£1,833"},{"label":"D","text":"£1,953"},{"label":"E","text":"£2,315"}]', 'D', 'Step 1: Floor area from Question 1 is 49.8125 m².

Step 2: Add 15% wastage: 49.8125 × 1.15 = 57.284 m².

Step 3: Material cost = 57.284 × £32 = £1,833.09.

Step 4: Add the £120 labour fee: £1,833.09 + £120 = £1,953.09, which rounds to £1,953.

The answer is £1,953.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-34'), 'practice-qr-set-34-q4', 'A skirting board is fitted along the three straight edges only (not the curved bay). The skirting comes in packs that cover 2.5 m each and can only be bought in whole packs. What is the minimum number of packs needed?', '[{"label":"A","text":"7"},{"label":"B","text":"8"},{"label":"C","text":"9"},{"label":"D","text":"12"},{"label":"E","text":"16"}]', 'C', 'Step 1: Straight edge length = 8 + 5 + 8 = 21 m.

Step 2: Packs needed = 21 ÷ 2.5 = 8.4.

Step 3: Packs must be whole, so round up: 8.4 rounds up to 9 packs.

The answer is 9.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-35'), 'practice-qr-set-35-q1', 'Without using salary sacrifice, how much income tax does Maya pay on her £72,000 salary in the tax year?', '[{"label":"A","text":"£8,692"},{"label":"B","text":"£14,400"},{"label":"C","text":"£16,232"},{"label":"D","text":"£23,772"},{"label":"E","text":"£28,800"}]', 'C', 'Apply each tax band only to the income that falls inside it.

Step 1: The first £12,570 is in the 0% personal allowance, so no tax on that.

Step 2: The basic-rate band runs from £12,571 to £50,270, a width of £37,700. Tax = £37,700 × 0.20 = £7,540.

Step 3: The higher-rate band covers income above £50,270. Maya''s income in this band = £72,000 − £50,270 = £21,730. Tax = £21,730 × 0.40 = £8,692.

Step 4: Total tax = £7,540 + £8,692 = £16,232.

The answer is £16,232.', 0, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-35'), 'practice-qr-set-35-q2', 'Maya sacrifices £6,000 of her salary into her pension. After this sacrifice, how much income tax does she pay in the tax year?', '[{"label":"A","text":"£11,432"},{"label":"B","text":"£13,200"},{"label":"C","text":"£13,832"},{"label":"D","text":"£15,032"},{"label":"E","text":"£20,372"}]', 'C', 'Salary sacrifice is deducted before tax, so her taxable income falls to £72,000 − £6,000 = £66,000.

Step 1: The first £12,570 is tax-free.

Step 2: The basic-rate band is still fully used: £37,700 × 0.20 = £7,540.

Step 3: Higher-rate income = £66,000 − £50,270 = £15,730. Tax = £15,730 × 0.40 = £6,292.

Step 4: Total tax = £7,540 + £6,292 = £13,832.

The answer is £13,832.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-35'), 'practice-qr-set-35-q3', 'Using the £6,000 salary sacrifice, what is Maya''s monthly take-home pay, to the nearest penny?', '[{"label":"A","text":"£3,600.00"},{"label":"B","text":"£4,347.33"},{"label":"C","text":"£4,564.00"},{"label":"D","text":"£4,647.33"},{"label":"E","text":"£5,500.00"}]', 'B', 'Step 1: Take-home is gross salary minus sacrifice minus tax: £72,000 − £6,000 − £13,832 = £52,168.

Step 2: Divide by 12 for a monthly figure: £52,168 ÷ 12 = £4,347.33.

The answer is £4,347.33.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-35'), 'practice-qr-set-35-q4', 'Compare two options: (X) Maya''s employer gives her a £6,000 pay rise on top of £72,000 (no pension sacrifice), or (Y) she continues at £72,000 and sacrifices £6,000 into her pension. By how much is her annual take-home pay LOWER under option Y than under option X?', '[{"label":"A","text":"£3,600"},{"label":"B","text":"£4,800"},{"label":"C","text":"£6,000"},{"label":"D","text":"£7,200"},{"label":"E","text":"£9,600"}]', 'D', 'Work out take-home under each option, then find the difference.

Step 1: Option X: gross = £78,000. Basic-rate tax = £7,540 (band fully used). Higher-rate income = £78,000 − £50,270 = £27,730, tax = £27,730 × 0.40 = £11,092. Total tax = £18,632. Take-home = £78,000 − £18,632 = £59,368.

Step 2: Option Y: gross = £72,000 minus £6,000 sacrifice, tax = £13,832 (from Question 2). Take-home = £72,000 − £6,000 − £13,832 = £52,168.

Step 3: Reduction in take-home = £59,368 − £52,168 = £7,200.

The answer is £7,200.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-36'), 'practice-qr-set-36-q1', 'What is the 18-39 population in the West region?', '[{"label":"A","text":"510,000"},{"label":"B","text":"540,000"},{"label":"C","text":"570,000"},{"label":"D","text":"600,000"},{"label":"E","text":"630,000"}]', 'C', 'The West row totals 2,010 (thousand), and the other three age bands for the West are 420, 680 and 340.

Step 1: Sum of the known bands = 420 + 680 + 340 = 1,440.

Step 2: Missing 18-39 band = 2,010 − 1,440 = 570 (thousand) = 570,000.

The answer is 570,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-36'), 'practice-qr-set-36-q2', 'Which region has the largest 65+ population, and what is that value?', '[{"label":"A","text":"340,000"},{"label":"B","text":"430,000"},{"label":"C","text":"470,000"},{"label":"D","text":"500,000"},{"label":"E","text":"550,000"}]', 'E', 'Reading the 65+ column: North 430, Midlands 470, South 550, West 340 (all in thousands). The largest is the South at 550 thousand, i.e. 550,000. The answer is 550,000.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-36'), 'practice-qr-set-36-q3', 'What percentage of the South region''s population is aged 0-17, to 1 decimal place?', '[{"label":"A","text":"16.0%"},{"label":"B","text":"18.5%"},{"label":"C","text":"20.0%"},{"label":"D","text":"22.5%"},{"label":"E","text":"25.0%"}]', 'C', 'The South row shows 680 (thousand) in the 0-17 column and a regional total of 3,400 (thousand).

Percentage = (part ÷ whole) × 100 = 680 ÷ 3,400 × 100 = 20.0%.

The answer is 20.0%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-36'), 'practice-qr-set-36-q4', 'Across all four regions combined, what percentage of the total population is aged 40-64, to 1 decimal place?', '[{"label":"A","text":"29.8%"},{"label":"B","text":"31.4%"},{"label":"C","text":"33.0%"},{"label":"D","text":"34.5%"},{"label":"E","text":"36.2%"}]', 'C', 'Step 1: Sum the 40-64 column across all four regions: 860 + 940 + 1,120 + 680 = 3,600 (thousand).

Step 2: The overall population is given as 10,910 (thousand).

Step 3: Percentage = 3,600 ÷ 10,910 × 100 = 33.0%.

The answer is 33.0%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-37'), 'practice-qr-set-37-q1', 'Between which two consecutive months did Brighton''s average temperature rise by the largest amount?', '[{"label":"A","text":"March to April"},{"label":"B","text":"April to May"},{"label":"C","text":"May to June"},{"label":"D","text":"June to July"},{"label":"E","text":"September to October"}]', 'C', 'Work out the month-to-month change on the Brighton line for each listed pair.

Step 1: March to April = 11 − 9 = +2 °C.

Step 2: April to May = 14 − 11 = +3 °C.

Step 3: May to June = 18 − 14 = +4 °C.

Step 4: June to July = 19 − 18 = +1 °C.

Step 5: September to October = 13 − 17 = −4 °C (a fall, not a rise).

The largest rise is +4 °C from May to June. The answer is May to June.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-37'), 'practice-qr-set-37-q2', 'What is the sum of Cardiff''s twelve monthly average temperatures, in °C?', '[{"label":"A","text":"132"},{"label":"B","text":"135"},{"label":"C","text":"137"},{"label":"D","text":"140"},{"label":"E","text":"143"}]', 'C', 'Read each value from the Cardiff line and add in order: 6 + 6 + 8 + 10 + 13 + 16 + 18 + 18 + 15 + 12 + 8 + 7 = 137. The answer is 137.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-37'), 'practice-qr-set-37-q3', 'What is the percentage increase in Edinburgh''s average temperature from January to July, to 1 decimal place?', '[{"label":"A","text":"200.0%"},{"label":"B","text":"250.0%"},{"label":"C","text":"275.0%"},{"label":"D","text":"300.0%"},{"label":"E","text":"400.0%"}]', 'D', 'Percentage increase uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: Edinburgh''s January value is 4 °C and July value is 16 °C.

Step 2: (16 − 4) ÷ 4 × 100 = 12 ÷ 4 × 100 = 300.0%.

The answer is 300.0%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-37'), 'practice-qr-set-37-q4', 'Across the twelve months, what is the largest gap between Brighton''s and Edinburgh''s monthly average temperature in any single month?', '[{"label":"A","text":"2 °C"},{"label":"B","text":"3 °C"},{"label":"C","text":"4 °C"},{"label":"D","text":"5 °C"},{"label":"E","text":"6 °C"}]', 'C', 'Work out Brighton minus Edinburgh for each month and track the largest. Most months show a gap of 3 °C (for example January 7 − 4 = 3 and July 19 − 16 = 3), October narrows to 13 − 11 = 2 °C, and in June the gap is 18 − 14 = 4 °C, which is the widest. The answer is 4 °C.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-38'), 'practice-qr-set-38-q1', 'What percentage of the portfolio is invested in UK Equities?', '[{"label":"A","text":"30%"},{"label":"B","text":"35%"},{"label":"C","text":"40%"},{"label":"D","text":"45%"},{"label":"E","text":"50%"}]', 'C', 'Percentage = (part ÷ whole) × 100 = 18,000,000 ÷ 45,000,000 × 100 = 40%. The answer is 40%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-38'), 'practice-qr-set-38-q2', 'What is the combined value of the Emerging Markets and Property segments?', '[{"label":"A","text":"£10,350,000"},{"label":"B","text":"£11,700,000"},{"label":"C","text":"£12,150,000"},{"label":"D","text":"£13,950,000"},{"label":"E","text":"£15,750,000"}]', 'C', 'Emerging Markets is £6,750,000 and Property is £5,400,000. Adding them: 6,750,000 + 5,400,000 = £12,150,000. The answer is £12,150,000.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-38'), 'practice-qr-set-38-q3', 'The trustees project that the total portfolio will grow by 12% next year with the proportions unchanged. What will the Property segment be worth?', '[{"label":"A","text":"£5,724,000"},{"label":"B","text":"£5,940,000"},{"label":"C","text":"£6,048,000"},{"label":"D","text":"£6,210,000"},{"label":"E","text":"£6,480,000"}]', 'C', 'Because the proportions stay the same, every segment grows by the same 12% the whole portfolio grows by.

Step 1: Property today is £5,400,000.

Step 2: Multiply by the growth factor 1.12: 5,400,000 × 1.12 = 6,048,000.

The answer is £6,048,000.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-38'), 'practice-qr-set-38-q4', 'What is the ratio of UK Equities to the combined value of Property and Cash, in its simplest form?', '[{"label":"A","text":"1 : 1"},{"label":"B","text":"3 : 2"},{"label":"C","text":"2 : 1"},{"label":"D","text":"5 : 2"},{"label":"E","text":"3 : 1"}]', 'C', 'Step 1: UK Equities = £18,000,000.

Step 2: Property + Cash = 5,400,000 + 3,600,000 = £9,000,000.

Step 3: Ratio 18,000,000 : 9,000,000 simplifies by dividing both sides by 9,000,000 to give 2 : 1.

The answer is 2 : 1.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-39'), 'practice-qr-set-39-q1', 'Which finishing time band contains the greatest number of runners (the modal band)?', '[{"label":"A","text":"Under 3:00"},{"label":"B","text":"3:00-3:29"},{"label":"C","text":"3:30-3:59"},{"label":"D","text":"4:00-4:29"},{"label":"E","text":"4:30-4:59"}]', 'C', 'Read the height of each bar: 35, 80, 140, 125, 75, 45. The tallest bar is 3:30-3:59 with 140 runners, so that is the modal band. The answer is 3:30-3:59.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-39'), 'practice-qr-set-39-q2', 'How many runners finished in under 4 hours?', '[{"label":"A","text":"215"},{"label":"B","text":"235"},{"label":"C","text":"255"},{"label":"D","text":"275"},{"label":"E","text":"295"}]', 'C', 'Add the three bands that finish before 4:00: Under 3:00 (35) + 3:00-3:29 (80) + 3:30-3:59 (140) = 255 runners. The answer is 255.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-39'), 'practice-qr-set-39-q3', 'What percentage of all 500 runners finished in 4:30 or slower?', '[{"label":"A","text":"12%"},{"label":"B","text":"18%"},{"label":"C","text":"20%"},{"label":"D","text":"24%"},{"label":"E","text":"30%"}]', 'D', 'Step 1: Add the two bands at 4:30 or slower: 4:30-4:59 (75) + 5:00 or over (45) = 120 runners.

Step 2: Percentage = 120 ÷ 500 × 100 = 24%.

The answer is 24%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-39'), 'practice-qr-set-39-q4', 'If next year''s race attracts 20% more entrants and the distribution of finishing times stays the same, how many more runners than this year would finish in under 4 hours?', '[{"label":"A","text":"45"},{"label":"B","text":"48"},{"label":"C","text":"51"},{"label":"D","text":"54"},{"label":"E","text":"60"}]', 'C', 'Step 1: This year, runners finishing in under 4 hours = 35 + 80 + 140 = 255.

Step 2: With 20% more entrants and the same distribution, next year''s count in that band = 255 × 1.20 = 306.

Step 3: Additional runners = 306 − 255 = 51.

The answer is 51.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-40'), 'practice-qr-set-40-q1', 'How long does service T422 take from departure to arrival?', '[{"label":"A","text":"65 minutes"},{"label":"B","text":"75 minutes"},{"label":"C","text":"85 minutes"},{"label":"D","text":"95 minutes"},{"label":"E","text":"105 minutes"}]', 'C', 'T422 leaves Manchester at 15:50 and arrives in Leeds at 17:15.

Step 1: From 15:50 to 16:50 is 1 hour = 60 minutes.

Step 2: From 16:50 to 17:15 is a further 25 minutes.

Step 3: Total = 60 + 25 = 85 minutes.

The answer is 85 minutes.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-40'), 'practice-qr-set-40-q2', 'What is the Standard Class single fare for service T205?', '[{"label":"A","text":"£5.25"},{"label":"B","text":"£5.85"},{"label":"C","text":"£6.00"},{"label":"D","text":"£6.60"},{"label":"E","text":"£7.40"}]', 'D', 'T205 covers 44 miles, and Standard Class is 15p per mile.

Step 1: Fare in pence = 44 × 15 = 660p.

Step 2: Convert to pounds: 660p ÷ 100 = £6.60.

The answer is £6.60.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-40'), 'practice-qr-set-40-q3', 'A passenger takes service T101 and, later the same day, service T422. Considering only the time spent on those two services, what is the average speed across the two services combined, to the nearest mph?', '[{"label":"A","text":"30 mph"},{"label":"B","text":"32 mph"},{"label":"C","text":"35 mph"},{"label":"D","text":"38 mph"},{"label":"E","text":"42 mph"}]', 'C', 'Average speed is total distance divided by total time in motion, not the mean of the two individual speeds.

Step 1: Combined distance = 35 + 44 = 79 miles.

Step 2: T101 runs 09:15 to 10:05 = 50 minutes; T422 runs 15:50 to 17:15 = 85 minutes. Combined time in motion = 50 + 85 = 135 minutes = 135 ÷ 60 = 2.25 hours.

Step 3: Average speed = 79 ÷ 2.25 = 35.1 mph, which rounds to 35 mph.

The answer is 35 mph.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-40'), 'practice-qr-set-40-q4', 'Service T318 includes an unpublished stop at Manchester. For how many minutes is T318 actually in motion between Liverpool and Leeds?', '[{"label":"A","text":"60 minutes"},{"label":"B","text":"75 minutes"},{"label":"C","text":"90 minutes"},{"label":"D","text":"105 minutes"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The total scheduled time for T318 is 12:20 to 14:05, which is 1 hour 45 minutes = 105 minutes. That elapsed time is split between time in motion and the stop at Manchester, but the stimulus states that the stop duration is not published. Without the stop length, you cannot separate moving time from stopped time. The answer is Can''t Tell.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-41'), 'practice-qr-set-41-q1', 'What percentage of total sales across all regions were in the Clothing category?', '[{"label":"A","text":"16.7%"},{"label":"B","text":"20.8%"},{"label":"C","text":"25.0%"},{"label":"D","text":"27.1%"},{"label":"E","text":"30.0%"}]', 'C', 'From the Total column on the Clothing row you can read 1,200, and the grand total in the bottom-right cell is 4,800. Divide: 1,200 ÷ 4,800 × 100 = 25.0%. The answer is 25.0%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-41'), 'practice-qr-set-41-q2', 'Of all sales made in the South region, what percentage were Groceries?', '[{"label":"A","text":"30.0%"},{"label":"B","text":"42.9%"},{"label":"C","text":"46.2%"},{"label":"D","text":"50.0%"},{"label":"E","text":"54.5%"}]', 'C', 'The denominator here is the South column total, not the grand total. From the South column, Groceries = 600 and the South total at the bottom of the column = 1,300. Divide: 600 ÷ 1,300 × 100 = 46.15%, which rounds to 46.2%. The answer is 46.2%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-41'), 'practice-qr-set-41-q3', 'What percentage of East region sales were in the Clothing category?', '[{"label":"A","text":"18.3%"},{"label":"B","text":"25.0%"},{"label":"C","text":"30.0%"},{"label":"D","text":"33.3%"},{"label":"E","text":"36.0%"}]', 'C', 'From the East column, Clothing = 360 and the East column total = 1,200. Divide: 360 ÷ 1,200 × 100 = 30.0%. The answer is 30.0%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-41'), 'practice-qr-set-41-q4', 'The company merges the Electronics and Homeware categories into a new ''Technology & Home'' group. What percentage of North region sales would this combined group represent?', '[{"label":"A","text":"22.5%"},{"label":"B","text":"25.0%"},{"label":"C","text":"28.3%"},{"label":"D","text":"31.7%"},{"label":"E","text":"38.0%"}]', 'D', 'Step 1: From the North column, add the Electronics and Homeware values: 180 + 200 = 380.

Step 2: The North column total is 1,200. Divide the combined value by the column total: 380 ÷ 1,200 × 100 = 31.67%, which rounds to 31.7%.

The answer is 31.7%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-42'), 'practice-qr-set-42-q1', 'How many patients at Broomfield waited less than 1 hour in the week shown?', '[{"label":"A","text":"220"},{"label":"B","text":"280"},{"label":"C","text":"320"},{"label":"D","text":"360"},{"label":"E","text":"420"}]', 'C', 'Read the ''Less than 1 hour'' bar for Broomfield on the chart: the value is 320 patients. The answer is 320.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-42'), 'practice-qr-set-42-q2', 'What percentage of Crandon''s patients waited more than 2 hours?', '[{"label":"A","text":"20.0%"},{"label":"B","text":"25.0%"},{"label":"C","text":"28.0%"},{"label":"D","text":"30.0%"},{"label":"E","text":"32.0%"}]', 'D', 'Step 1: Total Crandon patients across all three buckets = 280 + 400 + 320 = 1,000.

Step 2: The ''More than 2 hours'' bar for Crandon shows 320. Divide: 320 ÷ 1,000 × 100 = 30.0%.

The answer is 30.0%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-42'), 'practice-qr-set-42-q3', 'The NHS target is that at least 70% of A&E patients are seen within 2 hours (i.e. in the under-1-hour or 1-to-2-hour bucket). How many of the three hospitals met this target?', '[{"label":"A","text":"0"},{"label":"B","text":"1"},{"label":"C","text":"2"},{"label":"D","text":"3"},{"label":"E","text":"Can''t Tell"}]', 'C', 'Step 1: For each hospital, add the ''Less than 1 hour'' and ''1 to 2 hours'' bars, then divide by the total across all three buckets.

Step 2: Ashbury seen within 2 hours = 420 + 280 = 700, total = 800, percentage = 700 ÷ 800 × 100 = 87.5%, which meets the 70% target.

Step 3: Broomfield seen within 2 hours = 320 + 360 = 680, total = 900, percentage = 680 ÷ 900 × 100 = 75.6%, which meets the target.

Step 4: Crandon seen within 2 hours = 280 + 400 = 680, total = 1,000, percentage = 680 ÷ 1,000 × 100 = 68.0%, which is below 70% and fails the target.

The answer is 2.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-42'), 'practice-qr-set-42-q4', 'Using midpoint estimates of 0.5 hours for ''Less than 1 hour'', 1.5 hours for ''1 to 2 hours'' and 2.5 hours for ''More than 2 hours'', what is the weighted mean waiting time for patients across all three hospitals combined?', '[{"label":"A","text":"1.20 hours"},{"label":"B","text":"1.28 hours"},{"label":"C","text":"1.36 hours"},{"label":"D","text":"1.45 hours"},{"label":"E","text":"1.50 hours"}]', 'C', 'Step 1: Total patients in each bucket across all hospitals. Less than 1 hour = 420 + 320 + 280 = 1,020. 1 to 2 hours = 280 + 360 + 400 = 1,040. More than 2 hours = 100 + 220 + 320 = 640.

Step 2: Grand total of patients = 1,020 + 1,040 + 640 = 2,700.

Step 3: Weighted sum of hours = (1,020 × 0.5) + (1,040 × 1.5) + (640 × 2.5) = 510 + 1,560 + 1,600 = 3,670.

Step 4: Weighted mean = 3,670 ÷ 2,700 = 1.359, which rounds to 1.36 hours.

The answer is 1.36 hours.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-43'), 'practice-qr-set-43-q1', 'A 55 kg adult patient is prescribed a loading dose of Drug A. What dose should be given?', '[{"label":"A","text":"400 mg"},{"label":"B","text":"420 mg"},{"label":"C","text":"440 mg"},{"label":"D","text":"480 mg"},{"label":"E","text":"500 mg"}]', 'C', 'From the table, Drug A has a loading dose of 8 mg/kg. Using the formula: loading dose = 8 × 55 = 440 mg. This is below the 500 mg cap, so the full calculated value is given. The answer is 440 mg.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-43'), 'practice-qr-set-43-q2', 'A 60 kg adult patient is prescribed a loading dose of Drug B. What dose should be given?', '[{"label":"A","text":"420 mg"},{"label":"B","text":"480 mg"},{"label":"C","text":"500 mg"},{"label":"D","text":"600 mg"},{"label":"E","text":"720 mg"}]', 'C', 'Step 1: From the table, Drug B has a loading dose of 12 mg/kg. Using the formula: loading dose = 12 × 60 = 720 mg.

Step 2: The stimulus states every loading dose is capped at 500 mg. Since 720 mg is above the cap, the dose given is 500 mg.

The answer is 500 mg.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-43'), 'practice-qr-set-43-q3', 'A 75 kg adult patient receives a loading dose of Drug C, and six hours later receives a loading dose of Drug A. What total mass of drug (Drug C + Drug A) has been administered?', '[{"label":"A","text":"900 mg"},{"label":"B","text":"930 mg"},{"label":"C","text":"950 mg"},{"label":"D","text":"975 mg"},{"label":"E","text":"1,050 mg"}]', 'C', 'Step 1: Drug C loading dose = 6 × 75 = 450 mg. This is below the 500 mg cap, so 450 mg is given.

Step 2: Drug A loading dose = 8 × 75 = 600 mg. This is above the 500 mg cap, so 500 mg is given.

Step 3: Total administered = 450 + 500 = 950 mg.

The answer is 950 mg.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-43'), 'practice-qr-set-43-q4', 'A patient described in the notes only as being ''in the adult weight category'' is prescribed a loading dose of Drug D. What dose should be given?', '[{"label":"A","text":"500 mg"},{"label":"B","text":"600 mg"},{"label":"C","text":"750 mg"},{"label":"D","text":"900 mg"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The loading dose formula requires the patient''s weight in kilograms, but the notes only describe the patient as being ''in the adult weight category'' without giving a specific weight. Without the weight value, you cannot calculate the dose or decide whether the 500 mg cap applies. The answer is Can''t Tell.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-44'), 'practice-qr-set-44-q1', 'A Starter customer stores exactly 100 GB in a given month and is not eligible for the promotion. What is the total cost for that month including VAT?', '[{"label":"A","text":"£4.00"},{"label":"B","text":"£4.20"},{"label":"C","text":"£4.50"},{"label":"D","text":"£4.80"},{"label":"E","text":"£5.00"}]', 'D', 'At exactly 100 GB the customer pays only the base £4 with no overage. VAT at 20% is added: £4 × 1.20 = £4.80. The answer is £4.80.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-44'), 'practice-qr-set-44-q2', 'A customer uploads 2,400 MB of new data every day for 30 days. How many GB in total has the customer uploaded over the month?', '[{"label":"A","text":"60 GB"},{"label":"B","text":"68 GB"},{"label":"C","text":"72 GB"},{"label":"D","text":"80 GB"},{"label":"E","text":"96 GB"}]', 'C', 'Step 1: Daily upload in MB × days = 2,400 × 30 = 72,000 MB.

Step 2: Convert MB to GB using the rule in the stimulus, 1 GB = 1,000 MB, so 72,000 ÷ 1,000 = 72 GB.

The answer is 72 GB.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-44'), 'practice-qr-set-44-q3', 'A new Starter customer is eligible for the promotion and stores 180 GB every month for 12 months. What is their total cost for the year including VAT?', '[{"label":"A","text":"£96.00"},{"label":"B","text":"£102.00"},{"label":"C","text":"£108.00"},{"label":"D","text":"£115.20"},{"label":"E","text":"£124.80"}]', 'C', 'Step 1: Monthly overage = (180 − 100) × £0.05 = 80 × £0.05 = £4. The overage is the same every month because the promotion only discounts the base fee.

Step 2: For the first 3 promotional months the base is halved: £4 × 0.5 = £2. Monthly pre-VAT cost = £2 + £4 = £6, so 3 months cost 3 × £6 = £18.

Step 3: For the remaining 9 months the base is full price: £4 + £4 = £8 per month. So 9 × £8 = £72.

Step 4: Annual pre-VAT total = £18 + £72 = £90. Add VAT: £90 × 1.20 = £108.

The answer is £108.00.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-44'), 'practice-qr-set-44-q4', 'A customer expects to store 700 GB every month for 12 months and wants the cheapest plan (no promotion applies). Comparing the three tiers on total annual cost including VAT, what is the lowest possible annual cost?', '[{"label":"A","text":"£230.40"},{"label":"B","text":"£300.00"},{"label":"C","text":"£360.00"},{"label":"D","text":"£408.00"},{"label":"E","text":"£489.60"}]', 'A', 'Step 1: Starter annual cost. Overage = (700 − 100) × £0.05 = £30. Monthly = £4 + £30 = £34. Annual pre-VAT = 12 × £34 = £408. With VAT: £408 × 1.20 = £489.60.

Step 2: Plus annual cost. Overage = (700 − 500) × £0.03 = £6. Monthly = £10 + £6 = £16. Annual pre-VAT = 12 × £16 = £192. With VAT: £192 × 1.20 = £230.40.

Step 3: Pro annual cost. Monthly = £25 flat. Annual pre-VAT = 12 × £25 = £300. With VAT: £300 × 1.20 = £360.

Step 4: Compare: £489.60, £230.40, £360. The lowest is Plus at £230.40.

The answer is £230.40.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-45'), 'practice-qr-set-45-q1', 'With only the inlet open (outlet closed) from a starting level, how many litres of water enter the tank in 2 hours 30 minutes?', '[{"label":"A","text":"15,000 L"},{"label":"B","text":"18,750 L"},{"label":"C","text":"22,500 L"},{"label":"D","text":"27,000 L"},{"label":"E","text":"30,000 L"}]', 'C', 'Step 1: Convert 2 hours 30 minutes into minutes: 2 × 60 + 30 = 150 minutes.

Step 2: At the stated inlet rate of 150 L/min, volume in = 150 × 150 = 22,500 L.

The answer is 22,500 L.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-45'), 'practice-qr-set-45-q2', 'What is the total capacity of the tank expressed in litres?', '[{"label":"A","text":"1,200 L"},{"label":"B","text":"9,000 L"},{"label":"C","text":"12,000 L"},{"label":"D","text":"15,000 L"},{"label":"E","text":"120,000 L"}]', 'C', 'The stimulus gives the capacity as 12 m³ and the conversion 1 m³ = 1,000 L. So 12 × 1,000 = 12,000 L. The answer is 12,000 L.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-45'), 'practice-qr-set-45-q3', 'Starting from the 25%-full level, with both the inlet and outlet open for exactly 1 hour, what percentage of the tank''s total capacity is filled at the end of the hour?', '[{"label":"A","text":"30.0%"},{"label":"B","text":"47.5%"},{"label":"C","text":"50.0%"},{"label":"D","text":"55.0%"},{"label":"E","text":"65.0%"}]', 'D', 'Step 1: Tank capacity in litres = 12 × 1,000 = 12,000 L. Starting volume = 25% × 12,000 = 3,000 L.

Step 2: Net inflow rate = 150 − 90 = 60 L/min. Over 1 hour (60 minutes), net volume added = 60 × 60 = 3,600 L.

Step 3: Volume after 1 hour = 3,000 + 3,600 = 6,600 L. As a percentage of capacity: 6,600 ÷ 12,000 × 100 = 55.0%.

The answer is 55.0%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-45'), 'practice-qr-set-45-q4', 'Starting from the 25%-full level, with both the inlet and outlet open, how long does it take for the tank to become completely full?', '[{"label":"A","text":"1 hour 30 minutes"},{"label":"B","text":"2 hours 00 minutes"},{"label":"C","text":"2 hours 30 minutes"},{"label":"D","text":"3 hours 00 minutes"},{"label":"E","text":"3 hours 20 minutes"}]', 'C', 'Step 1: Capacity in litres = 12 × 1,000 = 12,000 L. Starting volume = 25% × 12,000 = 3,000 L, so the volume still needed to fill the tank = 12,000 − 3,000 = 9,000 L.

Step 2: Net inflow rate = 150 − 90 = 60 L/min.

Step 3: Time = volume needed ÷ net rate = 9,000 ÷ 60 = 150 minutes = 2 hours 30 minutes.

The answer is 2 hours 30 minutes.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-46'), 'practice-qr-set-46-q1', 'What was Retailer B''s revenue in Q2 2024?', '[{"label":"A","text":"£40m"},{"label":"B","text":"£44m"},{"label":"C","text":"£46m"},{"label":"D","text":"£48m"},{"label":"E","text":"£52m"}]', 'D', 'Read Retailer B''s line at the Q2 2024 point on the x-axis. The value sits at 48 on the y-axis. The answer is £48m.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-46'), 'practice-qr-set-46-q2', 'Using Retailer A''s stated 2024 mean quarterly revenue, what was Retailer A''s revenue in Q3 2024?', '[{"label":"A","text":"£48m"},{"label":"B","text":"£50m"},{"label":"C","text":"£52m"},{"label":"D","text":"£54m"},{"label":"E","text":"£56m"}]', 'D', 'Step 1: Retailer A''s 2024 mean is £54m across 4 quarters, so the total 2024 revenue = 54 × 4 = £216m.

Step 2: Read the three known 2024 values from the graph: Q1 = 50, Q2 = 52, Q4 = 60. Their sum = 50 + 52 + 60 = 162.

Step 3: The missing Q3 2024 value = 216 − 162 = 54.

The answer is £54m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-46'), 'practice-qr-set-46-q3', 'What was the percentage increase in Retailer B''s revenue from Q1 2023 to Q1 2024, to 1 decimal place?', '[{"label":"A","text":"8.0%"},{"label":"B","text":"17.4%"},{"label":"C","text":"21.1%"},{"label":"D","text":"26.1%"},{"label":"E","text":"46.0%"}]', 'C', 'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: Read Retailer B at Q1 2023 = 38 and at Q1 2024 = 46.

Step 2: (46 − 38) ÷ 38 × 100 = 8 ÷ 38 × 100 = 21.05%, which rounds to 21.1%.

The answer is 21.1%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-46'), 'practice-qr-set-46-q4', 'What was Retailer B''s total revenue across the four quarters of 2024?', '[{"label":"A","text":"£184m"},{"label":"B","text":"£196m"},{"label":"C","text":"£200m"},{"label":"D","text":"£204m"},{"label":"E","text":"£216m"}]', 'D', 'Read Retailer B''s four 2024 values from the graph: Q1 = 46, Q2 = 48, Q3 = 52, Q4 = 58. Sum: 46 + 48 + 52 + 58 = 204. The answer is £204m.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-47'), 'practice-qr-set-47-q1', 'What percentage of total electricity generation came from wind, to 1 decimal place?', '[{"label":"A","text":"10.0%"},{"label":"B","text":"13.8%"},{"label":"C","text":"19.0%"},{"label":"D","text":"23.8%"},{"label":"E","text":"45.0%"}]', 'D', 'Read the wind segment as 95 TWh out of a total of 400 TWh. Percentage = 95 ÷ 400 × 100 = 23.75%, which rounds to 23.8%. The answer is 23.8%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-47'), 'practice-qr-set-47-q2', 'Wind and solar combined account for what percentage of total generation, to 1 decimal place?', '[{"label":"A","text":"10.0%"},{"label":"B","text":"18.8%"},{"label":"C","text":"33.8%"},{"label":"D","text":"45.0%"},{"label":"E","text":"58.8%"}]', 'C', 'Step 1: Add the wind and solar segments: 95 + 40 = 135 TWh.

Step 2: Divide by the total and multiply by 100: 135 ÷ 400 × 100 = 33.75%, which rounds to 33.8%.

The answer is 33.8%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-47'), 'practice-qr-set-47-q3', 'What is the ratio of gas generation to nuclear generation, in its simplest form?', '[{"label":"A","text":"11 : 4"},{"label":"B","text":"18 : 5"},{"label":"C","text":"22 : 7"},{"label":"D","text":"33 : 10"},{"label":"E","text":"36 : 11"}]', 'E', 'Step 1: Read gas = 180 TWh and nuclear = 55 TWh, giving the ratio 180 : 55.

Step 2: Divide both sides by their highest common factor. 180 and 55 are both divisible by 5: 180 ÷ 5 = 36 and 55 ÷ 5 = 11. 36 and 11 share no further common factor.

The answer is 36 : 11.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-47'), 'practice-qr-set-47-q4', 'If total generation rises by 10% in 2025 and the proportion from each source stays the same, how many TWh will gas contribute in 2025?', '[{"label":"A","text":"180 TWh"},{"label":"B","text":"190 TWh"},{"label":"C","text":"198 TWh"},{"label":"D","text":"200 TWh"},{"label":"E","text":"440 TWh"}]', 'C', 'Gas''s share is unchanged, so its volume grows by the same 10% as the total. 2025 gas = 180 × 1.10 = 198. The answer is 198 TWh.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-48'), 'practice-qr-set-48-q1', 'How many emergency admissions were there in Week 5?', '[{"label":"A","text":"49"},{"label":"B","text":"58"},{"label":"C","text":"61"},{"label":"D","text":"63"},{"label":"E","text":"67"}]', 'E', 'Read the height of the Week 5 bar directly on the y-axis. It reaches 67. The answer is 67.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-48'), 'practice-qr-set-48-q2', 'What were the total emergency admissions across all nine weeks?', '[{"label":"A","text":"468"},{"label":"B","text":"496"},{"label":"C","text":"510"},{"label":"D","text":"523"},{"label":"E","text":"540"}]', 'D', 'Add all nine weekly values from the chart: 42 + 56 + 61 + 58 + 67 + 49 + 63 + 72 + 55. Running total: 42, 98, 159, 217, 284, 333, 396, 468, 523. The answer is 523.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-48'), 'practice-qr-set-48-q3', 'What was the median number of weekly admissions?', '[{"label":"A","text":"55"},{"label":"B","text":"56"},{"label":"C","text":"58"},{"label":"D","text":"61"},{"label":"E","text":"63"}]', 'C', 'Step 1: List the nine weekly values and sort them in ascending order: 42, 49, 55, 56, 58, 61, 63, 67, 72.

Step 2: With 9 values, the median is the 5th value in the sorted list, which is 58.

The answer is 58.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-48'), 'practice-qr-set-48-q4', 'By what percentage did weekly admissions increase from Week 1 to Week 8, to 1 decimal place?', '[{"label":"A","text":"30.0%"},{"label":"B","text":"41.7%"},{"label":"C","text":"58.3%"},{"label":"D","text":"71.4%"},{"label":"E","text":"171.4%"}]', 'D', 'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: Read Week 1 = 42 and Week 8 = 72 from the chart.

Step 2: (72 − 42) ÷ 42 × 100 = 30 ÷ 42 × 100 = 71.43%, which rounds to 71.4%.

The answer is 71.4%.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-49'), 'practice-qr-set-49-q1', 'A van travels from North to South via Central. What is the total distance of this route?', '[{"label":"A","text":"30 km"},{"label":"B","text":"35 km"},{"label":"C","text":"38 km"},{"label":"D","text":"40 km"},{"label":"E","text":"53 km"}]', 'C', 'Read the two edges on the route from the diagram: North to Central = 18 km and Central to South = 20 km. Total = 18 + 20 = 38. The answer is 38 km.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-49'), 'practice-qr-set-49-q2', 'What is the shortest road distance from East to West, using any connected path?', '[{"label":"A","text":"33 km"},{"label":"B","text":"37 km"},{"label":"C","text":"40 km"},{"label":"D","text":"48 km"},{"label":"E","text":"54 km"}]', 'B', 'Step 1: List the possible routes from East to West using the connected edges. Route 1: East → Central → West = 22 + 15 = 37 km. Route 2: East → Port → South → West = 14 + 28 + 12 = 54 km. Route 3: East → North → Central → West = 35 + 18 + 15 = 68 km.

Step 2: The shortest total is Route 1 at 37 km.

The answer is 37 km.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-49'), 'practice-qr-set-49-q3', 'What is the total road distance across all eight edges in the network?', '[{"label":"A","text":"144 km"},{"label":"B","text":"156 km"},{"label":"C","text":"164 km"},{"label":"D","text":"172 km"},{"label":"E","text":"180 km"}]', 'C', 'Add all eight edge labels from the diagram: 18 + 22 + 15 + 20 + 14 + 35 + 12 + 28. Running total: 18, 40, 55, 75, 89, 124, 136, 164. The answer is 164 km.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-49'), 'practice-qr-set-49-q4', 'A driver leaves North, travels via Central to East, then on to Port, stopping at Central for a rest break. How long does the complete journey take in total?', '[{"label":"A","text":"54 minutes"},{"label":"B","text":"60 minutes"},{"label":"C","text":"65 minutes"},{"label":"D","text":"90 minutes"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The diagram and context let you work out the driving time (18 + 22 + 14 = 54 km at 50 km/h, or about 65 minutes of driving), but the length of the rest break at Central is not given anywhere in the stimulus. Without that figure, the total journey time cannot be determined. The answer is Can''t Tell.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-50'), 'practice-qr-set-50-q1', 'What is the total marked price of the three items before any discounts or VAT?', '[{"label":"A","text":"£85"},{"label":"B","text":"£95"},{"label":"C","text":"£110"},{"label":"D","text":"£120"},{"label":"E","text":"£125"}]', 'D', 'Add the three marked prices from the stimulus: £60 + £25 + £35 = £120. The answer is £120.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-50'), 'practice-qr-set-50-q2', 'Expressed as a single percentage off the marked price, what is the combined effect of the 25% sale discount followed by the 10% loyalty discount on the pre-VAT price?', '[{"label":"A","text":"15.0%"},{"label":"B","text":"17.5%"},{"label":"C","text":"32.5%"},{"label":"D","text":"35.0%"},{"label":"E","text":"67.5%"}]', 'C', 'Sequential discounts multiply their multipliers, they do not add.

Step 1: 25% off means you pay 0.75 of the price. A further 10% off means you pay 0.90 of that sub-total. Combined multiplier = 0.75 × 0.90 = 0.675.

Step 2: The combined discount = 1 − 0.675 = 0.325 = 32.5%.

The answer is 32.5%.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-50'), 'practice-qr-set-50-q3', 'What is the total price, including VAT and any delivery charge, that the loyalty member pays for the three items?', '[{"label":"A","text":"£81.00"},{"label":"B","text":"£85.95"},{"label":"C","text":"£97.20"},{"label":"D","text":"£102.15"},{"label":"E","text":"£108.00"}]', 'C', 'Step 1: Marked total = £60 + £25 + £35 = £120. After the 25% sale discount: 120 × 0.75 = £90.

Step 2: Apply the 10% loyalty discount to the sub-total: 90 × 0.90 = £81. This is the pre-VAT price.

Step 3: £81 is over £50, so delivery is free. Add 20% VAT: 81 × 1.20 = £97.20.

The answer is £97.20.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-50'), 'practice-qr-set-50-q4', 'How much would a non-member (with no loyalty card) pay in total for exactly the same three items, including VAT and any delivery charge?', '[{"label":"A","text":"£90.00"},{"label":"B","text":"£97.20"},{"label":"C","text":"£102.15"},{"label":"D","text":"£108.00"},{"label":"E","text":"£112.95"}]', 'D', 'Step 1: Marked total = £120. A non-member gets only the 25% sale discount, so the pre-VAT price = 120 × 0.75 = £90.

Step 2: £90 is over £50, so delivery is free. Add 20% VAT: 90 × 1.20 = £108.

The answer is £108.00.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-51'), 'practice-qr-set-51-q1', 'How many million listeners in total are on the Premium tier?', '[{"label":"A","text":"8.5 million"},{"label":"B","text":"18.0 million"},{"label":"C","text":"22.0 million"},{"label":"D","text":"25.5 million"},{"label":"E","text":"34.0 million"}]', 'C', 'Read the Premium column total on the bottom Total row of the table. The value is 22.0. The answer is 22.0 million.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-51'), 'practice-qr-set-51-q2', 'What percentage of Hip-Hop listeners are on the Free tier?', '[{"label":"A","text":"25.0%"},{"label":"B","text":"30.0%"},{"label":"C","text":"37.5%"},{"label":"D","text":"40.0%"},{"label":"E","text":"50.0%"}]', 'C', 'Step 1: From the Hip-Hop row, the Free value is 9.0 million and the row Total is 24.0 million.

Step 2: 9.0 / 24.0 * 100 = 37.5%.

The answer is 37.5%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-51'), 'practice-qr-set-51-q3', 'Using the subscription prices given, what is the total monthly subscription revenue from Rock listeners?', '[{"label":"A","text":"£130 million"},{"label":"B","text":"£145 million"},{"label":"C","text":"£161 million"},{"label":"D","text":"£178 million"},{"label":"E","text":"£195 million"}]', 'C', 'Free listeners pay nothing, so only the Standard, Premium and Family columns contribute.

Step 1: From the Rock row read Standard = 5.5 million, Premium = 4.8 million and Family = 1.7 million.

Step 2: Standard revenue = 5.5 × £10 = £55 million. Premium revenue = 4.8 × £15 = £72 million. Family revenue = 1.7 × £20 = £34 million.

Step 3: Total = 55 + 72 + 34 = £161 million.

The answer is £161 million.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-51'), 'practice-qr-set-51-q4', 'Which genre has the highest proportion of its own listeners on the Premium tier?', '[{"label":"A","text":"Pop"},{"label":"B","text":"Rock"},{"label":"C","text":"Hip-Hop"},{"label":"D","text":"Classical"},{"label":"E","text":"Other"}]', 'D', 'For each genre, divide the Premium value by the row Total.

Step 1: Pop = 6.2 / 30.0 = 20.7%. Rock = 4.8 / 18.0 = 26.7%. Hip-Hop = 5.8 / 24.0 = 24.2%. Classical = 2.4 / 7.0 = 34.3%. Other = 2.8 / 11.0 = 25.5%.

Step 2: The highest proportion is Classical at 34.3%.

The answer is Classical.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-52'), 'practice-qr-set-52-q1', 'What was the opening weekend revenue for Red Horizon?', '[{"label":"A","text":"£20m"},{"label":"B","text":"£28m"},{"label":"C","text":"£35m"},{"label":"D","text":"£42m"},{"label":"E","text":"£48m"}]', 'C', 'Read the Revenue bar for Red Horizon on the chart. Its height is 35 on the y-axis. The answer is £35m.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-52'), 'practice-qr-set-52-q2', 'What was the net profit of Thunder Road on its opening weekend (revenue minus marketing spend)?', '[{"label":"A","text":"£15m"},{"label":"B","text":"£20m"},{"label":"C","text":"£25m"},{"label":"D","text":"£30m"},{"label":"E","text":"£85m"}]', 'C', 'Step 1: Read Thunder Road''s Revenue bar at £55m and its Marketing bar at -£30m.

Step 2: Net profit = 55 - 30 = £25m.

The answer is £25m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-52'), 'practice-qr-set-52-q3', 'Which film achieved the highest net profit expressed as a percentage of its opening weekend revenue?', '[{"label":"A","text":"Atlas Rising"},{"label":"B","text":"Luna''s Code"},{"label":"C","text":"Red Horizon"},{"label":"D","text":"Paper Boats"},{"label":"E","text":"Thunder Road"}]', 'A', 'For each film, calculate (revenue - marketing) / revenue * 100.

Step 1: Atlas Rising = (48 - 18) / 48 * 100 = 62.5%. Luna''s Code = (22 - 12) / 22 * 100 = 45.5%. Red Horizon = (35 - 20) / 35 * 100 = 42.9%. Paper Boats = (12 - 8) / 12 * 100 = 33.3%. Thunder Road = (55 - 30) / 55 * 100 = 45.5%.

Step 2: The highest percentage is Atlas Rising at 62.5%.

The answer is Atlas Rising.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-52'), 'practice-qr-set-52-q4', 'What was the total marketing spend across all five films on opening weekend?', '[{"label":"A","text":"£72m"},{"label":"B","text":"£80m"},{"label":"C","text":"£88m"},{"label":"D","text":"£92m"},{"label":"E","text":"£100m"}]', 'C', 'Add the absolute sizes of the five Marketing bars: 18 + 12 + 20 + 8 + 30 = 88. The answer is £88m.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-53'), 'practice-qr-set-53-q1', 'How many points did Anfield United earn in the 2024/25 season?', '[{"label":"A","text":"71"},{"label":"B","text":"74"},{"label":"C","text":"78"},{"label":"D","text":"82"},{"label":"E","text":"89"}]', 'D', 'Read Anfield United''s line at the 2024/25 point on the x-axis. The value is 82 on the y-axis. The answer is 82.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-53'), 'practice-qr-set-53-q2', 'By what percentage did Anfield United''s points total increase from 2023/24 to 2025/26, to 1 decimal place?', '[{"label":"A","text":"15.0%"},{"label":"B","text":"16.9%"},{"label":"C","text":"20.3%"},{"label":"D","text":"25.0%"},{"label":"E","text":"83.1%"}]', 'C', 'Percentage change uses the original value as the denominator: (new - old) / old * 100.

Step 1: Read Anfield United at 2023/24 = 74 and at 2025/26 = 89.

Step 2: (89 - 74) / 74 * 100 = 15 / 74 * 100 = 20.27%, which rounds to 20.3%.

The answer is 20.3%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-53'), 'practice-qr-set-53-q3', 'Citygate FC had exactly 8 draws in the 2024/25 season. How many matches did they win that season?', '[{"label":"A","text":"18"},{"label":"B","text":"19"},{"label":"C","text":"20"},{"label":"D","text":"21"},{"label":"E","text":"23"}]', 'D', 'Step 1: Read Citygate FC''s 2024/25 total from the graph: 71 points.

Step 2: Each draw is worth 1 point, so 8 draws contribute 8 points. Points from wins = 71 - 8 = 63.

Step 3: Each win is worth 3 points, so number of wins = 63 / 3 = 21.

The answer is 21.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-54'), 'practice-qr-set-54-q1', 'How many consultations were there for cats during March?', '[{"label":"A","text":"32"},{"label":"B","text":"85"},{"label":"C","text":"98"},{"label":"D","text":"115"},{"label":"E","text":"145"}]', 'C', 'Read the Consultations in March cell on the Cats row of the table. The value is 98. The answer is 98.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-54'), 'practice-qr-set-54-q2', 'What percentage of the total consultations in March were for rabbits, to 1 decimal place?', '[{"label":"A","text":"6.0%"},{"label":"B","text":"9.0%"},{"label":"C","text":"10.5%"},{"label":"D","text":"12.0%"},{"label":"E","text":"15.0%"}]', 'C', 'Step 1: Sum the Consultations in March column: 145 + 98 + 32 + 18 + 12 = 305.

Step 2: The Rabbits row shows 32 consultations. 32 ÷ 305 × 100 = 10.49%, which rounds to 10.5%.

The answer is 10.5%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-54'), 'practice-qr-set-54-q3', 'A dog weighing 24 kg is prescribed amoxicillin using the stated dosing rule. What is the size in mg of each individual dose that the owner must give?', '[{"label":"A","text":"80 mg"},{"label":"B","text":"100 mg"},{"label":"C","text":"120 mg"},{"label":"D","text":"180 mg"},{"label":"E","text":"360 mg"}]', 'C', 'Step 1: Apply the dosing rule: daily dose = weight × 15 = 24 × 15 = 360 mg.

Step 2: The daily dose is split into 3 equal doses, so each individual dose = 360 ÷ 3 = 120 mg.

The answer is 120 mg.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-55'), 'practice-qr-set-55-q1', 'How many concession tickets were sold in total across the five days?', '[{"label":"A","text":"225"},{"label":"B","text":"250"},{"label":"C","text":"265"},{"label":"D","text":"275"},{"label":"E","text":"295"}]', 'D', 'Add the Concession tickets column: 45 + 52 + 48 + 60 + 70 = 275. The answer is 275.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-55'), 'practice-qr-set-55-q2', 'What was the total ticket revenue on Friday?', '[{"label":"A","text":"£3,000"},{"label":"B","text":"£3,650"},{"label":"C","text":"£4,050"},{"label":"D","text":"£4,210"},{"label":"E","text":"£4,510"}]', 'D', 'Step 1: From the Friday row, Adult revenue = 250 × £12 = £3,000.

Step 2: Child revenue = 130 × £5 = £650.

Step 3: Concession revenue = 70 × £8 = £560.

Step 4: Total Friday revenue = £3,000 + £650 + £560 = £4,210.

The answer is £4,210.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-55'), 'practice-qr-set-55-q3', 'What percentage of Thursday’s total tickets sold were child tickets, to 1 decimal place?', '[{"label":"A","text":"26.3%"},{"label":"B","text":"28.9%"},{"label":"C","text":"31.4%"},{"label":"D","text":"52.4%"},{"label":"E","text":"55.3%"}]', 'B', 'Step 1: From the Thursday row, total tickets = 210 + 110 + 60 = 380.

Step 2: Child tickets as a percentage of the total = 110 ÷ 380 × 100 = 28.947%, which rounds to 28.9%.

The answer is 28.9%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-55'), 'practice-qr-set-55-q4', 'On Saturday the gallery ran a special event with new prices (Adult £15, Child £4, Concession £10) and sold 280 adult, 150 child and 85 concession tickets. What was the percentage change in total ticket revenue from Friday (standard prices) to Saturday (event prices)?', '[{"label":"A","text":"25.5% increase"},{"label":"B","text":"29.8% increase"},{"label":"C","text":"34.2% increase"},{"label":"D","text":"38.5% increase"},{"label":"E","text":"42.7% increase"}]', 'C', 'Step 1: Friday revenue (from Q2) = £4,210.

Step 2: Saturday revenue = 280 × £15 + 150 × £4 + 85 × £10 = £4,200 + £600 + £850 = £5,650.

Step 3: Percentage change = (5,650 − 4,210) ÷ 4,210 × 100 = 1,440 ÷ 4,210 × 100 = 34.20%.

The answer is 34.2% increase.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-56'), 'practice-qr-set-56-q1', 'How many thousand passengers travelled on the LHR-CDG route in Q3?', '[{"label":"A","text":"85"},{"label":"B","text":"100"},{"label":"C","text":"110"},{"label":"D","text":"120"},{"label":"E","text":"135"}]', 'D', 'Read the cell in the LHR-CDG row and the Q3 column of the table. The value is 120. The answer is 120.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-56'), 'practice-qr-set-56-q2', 'What was the annual total number of passengers (in thousands) on the LHR-JFK route?', '[{"label":"A","text":"245"},{"label":"B","text":"265"},{"label":"C","text":"280"},{"label":"D","text":"300"},{"label":"E","text":"340"}]', 'C', 'Read the value in the LHR-JFK row and the Annual Total column. The value is 280. The answer is 280.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-56'), 'practice-qr-set-56-q3', 'What was the total revenue from the LHR-JFK route in Q2, in £ millions?', '[{"label":"A","text":"£27.3m"},{"label":"B","text":"£31.2m"},{"label":"C","text":"£36.4m"},{"label":"D","text":"£44.2m"},{"label":"E","text":"£52.0m"}]', 'C', 'Step 1: Read the passenger figure in the LHR-JFK row and Q2 column: 70 (thousands), which equals 70,000 passengers.

Step 2: Multiply by the stated LHR-JFK fare of £520: 70,000 × £520 = £36,400,000 = £36.4m.

The answer is £36.4m.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-56'), 'practice-qr-set-56-q4', 'What was the total Q4 revenue across all four routes combined, in £ millions?', '[{"label":"A","text":"£42.00m"},{"label":"B","text":"£58.25m"},{"label":"C","text":"£72.05m"},{"label":"D","text":"£84.65m"},{"label":"E","text":"£96.80m"}]', 'D', 'Step 1: Read each route''s Q4 passenger figure (in thousands) from the Q4 column: LHR-JFK 65, LHR-DXB 50, LHR-CDG 95, LHR-BCN 70.

Step 2: Multiply each by its stated fare. LHR-JFK: 65,000 × £520 = £33,800,000. LHR-DXB: 50,000 × £480 = £24,000,000. LHR-CDG: 95,000 × £150 = £14,250,000. LHR-BCN: 70,000 × £180 = £12,600,000.

Step 3: Sum the four route revenues: £33.80m + £24.00m + £14.25m + £12.60m = £84.65m.

The answer is £84.65m.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-57'), 'practice-qr-set-57-q1', 'What was the room occupancy rate in April?', '[{"label":"A","text":"60%"},{"label":"B","text":"65%"},{"label":"C","text":"70%"},{"label":"D","text":"75%"},{"label":"E","text":"80%"}]', 'D', 'Read the height of the April bar on the y-axis. It reaches 75. The answer is 75%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-57'), 'practice-qr-set-57-q2', 'Using the formula given in the stimulus, what was the RevPAR in May?', '[{"label":"A","text":"£60"},{"label":"B","text":"£72"},{"label":"C","text":"£84"},{"label":"D","text":"£96"},{"label":"E","text":"£108"}]', 'D', 'Step 1: Read the May bar — occupancy is 80%, so the occupancy rate as a decimal is 0.80.

Step 2: Apply RevPAR = ADR × occupancy rate = £120 × 0.80 = £96.

The answer is £96.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-57'), 'practice-qr-set-57-q3', 'How many room-nights were sold at the Meridian Hotel in June?', '[{"label":"A","text":"4,200"},{"label":"B","text":"4,500"},{"label":"C","text":"4,800"},{"label":"D","text":"5,100"},{"label":"E","text":"5,400"}]', 'D', 'Step 1: Read the June bar — occupancy is 85%, so the occupancy rate as a decimal is 0.85.

Step 2: Available room-nights in a 30-day month = 200 rooms × 30 days = 6,000 room-nights.

Step 3: Room-nights sold = available × occupancy rate = 6,000 × 0.85 = 5,100.

The answer is 5,100.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-58'), 'practice-qr-set-58-q1', 'What is the final price of a 1.5 kg parcel sent to Zone 1, including the fuel surcharge?', '[{"label":"A","text":"£4.50"},{"label":"B","text":"£4.70"},{"label":"C","text":"£4.86"},{"label":"D","text":"£5.20"},{"label":"E","text":"£5.40"}]', 'C', 'Step 1: A 1.5 kg parcel is within the first 2 kg, so the pre-surcharge price is the Zone 1 base rate only: £4.50.

Step 2: Apply the 8% fuel surcharge: £4.50 × 1.08 = £4.86.

The answer is £4.86.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-58'), 'practice-qr-set-58-q2', 'What is the final price of a 5 kg parcel sent to Zone 3, including the fuel surcharge?', '[{"label":"A","text":"£15.12"},{"label":"B","text":"£20.52"},{"label":"C","text":"£21.50"},{"label":"D","text":"£23.22"},{"label":"E","text":"£25.92"}]', 'D', 'Step 1: A 5 kg parcel has 3 full kg above the first 2 kg. Zone 3 pre-surcharge price = base £14.00 + 3 × £2.50 = £14.00 + £7.50 = £21.50.

Step 2: Apply the 8% fuel surcharge: £21.50 × 1.08 = £23.22.

The answer is £23.22.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-58'), 'practice-qr-set-58-q3', 'A customer sends an 8 kg parcel to Zone 2 and a 4 kg parcel to Zone 1 in a single transaction. What is the total amount charged after the fuel surcharge is applied to the combined pre-surcharge total?', '[{"label":"A","text":"£24.84"},{"label":"B","text":"£25.90"},{"label":"C","text":"£27.97"},{"label":"D","text":"£30.24"},{"label":"E","text":"£33.48"}]', 'C', 'Step 1: For the 8 kg Zone 2 parcel, there are 6 full kg above the first 2 kg. Pre-surcharge price = £8.20 + 6 × £1.80 = £8.20 + £10.80 = £19.00.

Step 2: For the 4 kg Zone 1 parcel, there are 2 full kg above the first 2 kg. Pre-surcharge price = £4.50 + 2 × £1.20 = £4.50 + £2.40 = £6.90.

Step 3: Combined pre-surcharge total = £19.00 + £6.90 = £25.90. Apply the 8% fuel surcharge: £25.90 × 1.08 = £27.972, which rounds to £27.97.

The answer is £27.97.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-59'), 'practice-qr-set-59-q1', 'What percentage of total loans were Audiobooks?', '[{"label":"A","text":"7.5%"},{"label":"B","text":"10.0%"},{"label":"C","text":"12.5%"},{"label":"D","text":"20.0%"},{"label":"E","text":"25.0%"}]', 'B', 'Read the Audiobooks segment as 4,800 loans out of a total of 48,000. Percentage = 4,800 ÷ 48,000 × 100 = 10.0%. The answer is 10.0%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-59'), 'practice-qr-set-59-q2', 'What is the ratio of Fiction loans to Children''s loans, in its simplest form?', '[{"label":"A","text":"5 : 4"},{"label":"B","text":"3 : 2"},{"label":"C","text":"5 : 3"},{"label":"D","text":"9 : 5"},{"label":"E","text":"2 : 1"}]', 'B', 'Step 1: Read Fiction = 18,000 and Children''s = 12,000 from the pie chart, giving the ratio 18,000 : 12,000.

Step 2: Divide both sides by their highest common factor, 6,000: 18,000 ÷ 6,000 = 3 and 12,000 ÷ 6,000 = 2. 3 and 2 share no further common factor.

The answer is 3 : 2.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-59'), 'practice-qr-set-59-q3', 'Next year the library expects total loans to grow by 25% while each category keeps the same share of the total. How many Fiction loans are expected next year?', '[{"label":"A","text":"20,250"},{"label":"B","text":"21,000"},{"label":"C","text":"22,500"},{"label":"D","text":"24,000"},{"label":"E","text":"27,000"}]', 'C', 'Step 1: Fiction''s share stays constant, so Fiction grows by the same 25% as the total.

Step 2: Read Fiction = 18,000 from the pie chart. Fiction next year = 18,000 × 1.25 = 22,500.

The answer is 22,500.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-60'), 'practice-qr-set-60-q1', 'How many million Gamma units were sold in 2023?', '[{"label":"A","text":"8m"},{"label":"B","text":"12m"},{"label":"C","text":"17m"},{"label":"D","text":"20m"},{"label":"E","text":"23m"}]', 'C', 'Read Gamma''s line at the 2023 point on the x-axis. The value sits at 17 on the y-axis. The answer is 17m.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-60'), 'practice-qr-set-60-q2', 'What were the combined unit sales of all three consoles in 2022, in millions?', '[{"label":"A","text":"34m"},{"label":"B","text":"40m"},{"label":"C","text":"46m"},{"label":"D","text":"52m"},{"label":"E","text":"60m"}]', 'C', 'Step 1: Read each console''s 2022 value from the graph: Alpha = 18, Beta = 16, Gamma = 12.

Step 2: Sum the three values: 18 + 16 + 12 = 46.

The answer is 46m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-60'), 'practice-qr-set-60-q3', 'What was the percentage increase in Alpha''s unit sales from 2020 to 2024, to 1 decimal place?', '[{"label":"A","text":"52.0%"},{"label":"B","text":"84.6%"},{"label":"C","text":"108.3%"},{"label":"D","text":"208.3%"},{"label":"E","text":"313.0%"}]', 'C', 'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: Read Alpha at 2020 = 12 and at 2024 = 25.

Step 2: (25 − 12) ÷ 12 × 100 = 13 ÷ 12 × 100 = 108.33%, which rounds to 108.3%.

The answer is 108.3%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-60'), 'practice-qr-set-60-q4', 'What were the combined unit sales of all three consoles in 2024, in millions?', '[{"label":"A","text":"42m"},{"label":"B","text":"55m"},{"label":"C","text":"60m"},{"label":"D","text":"62m"},{"label":"E","text":"75m"}]', 'C', 'Read each console''s 2024 value from the graph: Alpha = 25, Beta = 12, Gamma = 23. Sum: 25 + 12 + 23 = 60. The answer is 60m.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-61'), 'practice-qr-set-61-q1', 'What is the daily output at Site E, in kWh?', '[{"label":"A","text":"24.0 kWh"},{"label":"B","text":"27.2 kWh"},{"label":"C","text":"30.6 kWh"},{"label":"D","text":"32.0 kWh"},{"label":"E","text":"39.6 kWh"}]', 'C', 'Read Site E''s point on the scatter plot. Its y-axis value is 30.6 kWh. The answer is 30.6 kWh.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-61'), 'practice-qr-set-61-q2', 'Using the formula given in the stimulus, what is the efficiency of Site F?', '[{"label":"A","text":"64%"},{"label":"B","text":"72%"},{"label":"C","text":"75%"},{"label":"D","text":"80%"},{"label":"E","text":"85%"}]', 'D', 'Step 1: Read Site F from the scatter plot: 20 panels and 32.0 kWh daily output.

Step 2: Apply the formula. Efficiency = (32.0 ÷ (20 × 2.0)) × 100 = (32.0 ÷ 40) × 100 = 80%.

The answer is 80%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-61'), 'practice-qr-set-61-q3', 'A new installation uses 16 panels and achieves an efficiency of 85%. Using the given formula, what is its daily output in kWh?', '[{"label":"A","text":"13.6 kWh"},{"label":"B","text":"18.8 kWh"},{"label":"C","text":"27.2 kWh"},{"label":"D","text":"32.0 kWh"},{"label":"E","text":"37.6 kWh"}]', 'C', 'Step 1: Rearrange the efficiency formula. Actual daily output = Panels × 2.0 × (efficiency ÷ 100).

Step 2: Substitute the values: 16 × 2.0 × (85 ÷ 100) = 32.0 × 0.85 = 27.2.

The answer is 27.2 kWh.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-62'), 'practice-qr-set-62-q1', 'How many check-up appointments were provided in total (NHS plus private)?', '[{"label":"A","text":"135"},{"label":"B","text":"145"},{"label":"C","text":"165"},{"label":"D","text":"175"},{"label":"E","text":"205"}]', 'C', 'From the Check-up row, the NHS patient count is 120 and the private patient count is 45. Add them: 120 + 45 = 165. The answer is 165.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-62'), 'practice-qr-set-62-q2', 'What was the total NHS revenue from Scale & Polish appointments?', '[{"label":"A","text":"£1,644"},{"label":"B","text":"£1,800"},{"label":"C","text":"£2,055"},{"label":"D","text":"£2,250"},{"label":"E","text":"£2,465"}]', 'A', 'From the Scale & Polish row, there are 60 NHS patients and the NHS fee is £27.40. Multiply: 60 × £27.40 = £1,644. The answer is £1,644.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-62'), 'practice-qr-set-62-q3', 'What percentage of all Filling appointments were performed privately, to 1 decimal place?', '[{"label":"A","text":"25.0%"},{"label":"B","text":"28.6%"},{"label":"C","text":"30.0%"},{"label":"D","text":"33.3%"},{"label":"E","text":"40.0%"}]', 'D', 'From the Filling row, NHS patients = 48 and private patients = 24, so the total number of Filling appointments = 48 + 24 = 72. The private share = 24 ÷ 72 × 100 = 33.33%, which rounds to 33.3%. The answer is 33.3%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-62'), 'practice-qr-set-62-q4', 'What was the total revenue (NHS plus private) from Root Canal treatments?', '[{"label":"A","text":"£11,700"},{"label":"B","text":"£13,406"},{"label":"C","text":"£14,156"},{"label":"D","text":"£15,500"},{"label":"E","text":"£16,438"}]', 'C', 'Step 1: From the Root Canal row, NHS patients = 8 at an NHS fee of £307.00. NHS revenue = 8 × £307.00 = £2,456.

Step 2: Private patients = 18 at a private fee of £650.00. Private revenue = 18 × £650.00 = £11,700.

Step 3: Total revenue = £2,456 + £11,700 = £14,156.

The answer is £14,156.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-63'), 'practice-qr-set-63-q1', 'How many outbound trips were recorded during the 08:00 hour?', '[{"label":"A","text":"180"},{"label":"B","text":"210"},{"label":"C","text":"385"},{"label":"D","text":"420"},{"label":"E","text":"520"}]', 'D', 'Read the Outbound bar at the 08:00 label on the x-axis. Its value is 420. The answer is 420.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-63'), 'practice-qr-set-63-q2', 'What was the total number of inbound trips across all eight time buckets shown?', '[{"label":"A","text":"1,180"},{"label":"B","text":"1,250"},{"label":"C","text":"1,330"},{"label":"D","text":"1,460"},{"label":"E","text":"1,540"}]', 'C', 'Read each Inbound value from the chart: 30, 110, 175, 195, 180, 205, 340, 95. Sum them: 30 + 110 + 175 + 195 + 180 + 205 + 340 + 95 = 1,330. The answer is 1,330.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-63'), 'practice-qr-set-63-q3', 'In the 18:00 hour, by what percentage did outbound trips exceed inbound trips, to the nearest whole percent?', '[{"label":"A","text":"9%"},{"label":"B","text":"12%"},{"label":"C","text":"13%"},{"label":"D","text":"15%"},{"label":"E","text":"45%"}]', 'C', 'Percentage excess uses the inbound value as the denominator: (outbound − inbound) ÷ inbound × 100.

Step 1: At 18:00, outbound = 385 and inbound = 340.

Step 2: (385 − 340) ÷ 340 × 100 = 45 ÷ 340 × 100 = 13.24%, which rounds to 13%.

The answer is 13%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-64'), 'practice-qr-set-64-q1', 'How many paper cups are used per day at the Eastgate branch?', '[{"label":"A","text":"450"},{"label":"B","text":"540"},{"label":"C","text":"620"},{"label":"D","text":"710"},{"label":"E","text":"750"}]', 'D', 'From the Eastgate row, read the Paper cups/day column directly. The value is 710. The answer is 710.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-64'), 'practice-qr-set-64-q2', 'What is the total daily milk usage across all five branches, in litres?', '[{"label":"A","text":"150 L"},{"label":"B","text":"164 L"},{"label":"C","text":"178 L"},{"label":"D","text":"196 L"},{"label":"E","text":"210 L"}]', 'C', 'From the Milk used (L/day) column, read each branch''s value: Kingsway 42, Riverside 30, Eastgate 48, Millside 22, Parkview 36. Sum them: 42 + 30 + 48 + 22 + 36 = 178 L. The answer is 178 L.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-64'), 'practice-qr-set-64-q3', 'A new regulation requires disposable paper cups to be replaced with reusable cups. Each branch must purchase enough reusable cups to cover 2 days of demand at its daily paper-cup rate, with each reusable cup costing £2.40. What is the total one-off cost across all five branches?', '[{"label":"A","text":"£6,360"},{"label":"B","text":"£10,200"},{"label":"C","text":"£12,720"},{"label":"D","text":"£15,900"},{"label":"E","text":"£21,200"}]', 'C', 'Step 1: From the Paper cups/day column, total across all five branches = 620 + 450 + 710 + 330 + 540 = 2,650 cups per day.

Step 2: Two days of demand = 2,650 × 2 = 5,300 cups.

Step 3: At £2.40 per cup, total cost = 5,300 × £2.40 = £12,720.

The answer is £12,720.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-65'), 'practice-qr-set-65-q1', 'How much was donated via the online portal during the March drive?', '[{"label":"A","text":"£36,000"},{"label":"B","text":"£42,000"},{"label":"C","text":"£45,500"},{"label":"D","text":"£48,000"},{"label":"E","text":"£52,450"}]', 'D', 'From the Online portal row, read the Donations (£) column directly. The value is £48,000. The answer is £48,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-65'), 'practice-qr-set-65-q2', 'What is the total amount of donations (before any Gift Aid top-up) received across all five channels?', '[{"label":"A","text":"£87,400"},{"label":"B","text":"£92,100"},{"label":"C","text":"£99,500"},{"label":"D","text":"£102,450"},{"label":"E","text":"£108,200"}]', 'C', 'From the Donations (£) column, sum each channel: £48,000 + £12,500 + £7,200 + £22,000 + £9,800 = £99,500. The answer is £99,500.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-65'), 'practice-qr-set-65-q3', 'How much Gift Aid top-up is generated from the postal cheque donations?', '[{"label":"A","text":"£1,840"},{"label":"B","text":"£2,300"},{"label":"C","text":"£2,875"},{"label":"D","text":"£3,125"},{"label":"E","text":"£4,600"}]', 'B', 'Apply the Gift Aid formula given in the stimulus: Gift Aid = Eligible donation × 0.25. From the Postal cheque row, Gift-Aid eligible = £9,200. Gift Aid = £9,200 × 0.25 = £2,300. The answer is £2,300.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-65'), 'practice-qr-set-65-q4', 'What is the total combined revenue (donations plus all Gift Aid top-up) received from the channels that have any Gift-Aid-eligible donations?', '[{"label":"A","text":"£70,300"},{"label":"B","text":"£78,200"},{"label":"C","text":"£83,500"},{"label":"D","text":"£87,200"},{"label":"E","text":"£92,450"}]', 'C', 'Step 1: The channels with any Gift-Aid eligible donations are Online portal, Postal cheque, and Phone campaign. Their donations sum to £48,000 + £12,500 + £9,800 = £70,300.

Step 2: Their Gift-Aid eligible amounts sum to £36,000 + £9,200 + £7,600 = £52,800. Apply the formula: Gift Aid = £52,800 × 0.25 = £13,200.

Step 3: Combined revenue = £70,300 + £13,200 = £83,500.

The answer is £83,500.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-66'), 'practice-qr-set-66-q1', 'How much is refunded to a student who withdraws in week 4?', '[{"label":"A","text":"£36"},{"label":"B","text":"£54"},{"label":"C","text":"£90"},{"label":"D","text":"£135"},{"label":"E","text":"£180"}]', 'D', 'Week 4 falls in the weeks 3–4 tier, which gives a 75% refund. The enrolment fee is £180, so the refund = £180 × 0.75 = £135. The answer is £135.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-66'), 'practice-qr-set-66-q2', 'Of the 240 students who enrolled in the Spring term, how many remained on the course after all stated withdrawals?', '[{"label":"A","text":"170"},{"label":"B","text":"180"},{"label":"C","text":"190"},{"label":"D","text":"200"},{"label":"E","text":"218"}]', 'C', 'Start with 240 enrolled students and subtract each wave of withdrawals: 240 − 20 (week 2) − 12 (week 4) − 18 (week 7) = 190. The answer is 190.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-66'), 'practice-qr-set-66-q3', 'What is the total amount Skillspark paid out in refunds to all Spring-term withdrawing students?', '[{"label":"A","text":"£4,572"},{"label":"B","text":"£5,404"},{"label":"C","text":"£5,850"},{"label":"D","text":"£6,192"},{"label":"E","text":"£7,380"}]', 'D', 'Step 1: The 20 students who withdrew in week 2 receive a full refund (100%): 20 × £180 = £3,600.

Step 2: The 12 students who withdrew in week 4 receive a 75% refund (£180 × 0.75 = £135 each): 12 × £135 = £1,620.

Step 3: The 18 students who withdrew in week 7 receive a 30% refund (£180 × 0.30 = £54 each): 18 × £54 = £972.

Step 4: Total refunds = £3,600 + £1,620 + £972 = £6,192.

The answer is £6,192.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-67'), 'practice-qr-set-67-q1', 'How many thousand TEUs were handled on the Asia-Europe route in 2024?', '[{"label":"A","text":"410"},{"label":"B","text":"620"},{"label":"C","text":"710"},{"label":"D","text":"860"},{"label":"E","text":"1,000"}]', 'D', 'From the Asia-Europe segment of the pie chart, read its value directly. The value is 860 thousand TEUs. The answer is 860.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-67'), 'practice-qr-set-67-q2', 'What percentage of the total 2024 throughput was handled on the Transpacific route, to 1 decimal place?', '[{"label":"A","text":"17.1%"},{"label":"B","text":"22.5%"},{"label":"C","text":"25.8%"},{"label":"D","text":"28.3%"},{"label":"E","text":"35.8%"}]', 'C', 'The Transpacific segment is 620 thousand TEUs and the total (given in the context) is 2,400 thousand TEUs. Percentage = 620 ÷ 2,400 × 100 = 25.83%, which rounds to 25.8%. The answer is 25.8%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-67'), 'practice-qr-set-67-q3', 'On the Asia-Middle East route, 30% of the TEU count came from 40-foot containers and 70% from 20-foot containers. How many 40-foot containers were shipped via this route in 2024?', '[{"label":"A","text":"41,000"},{"label":"B","text":"54,200"},{"label":"C","text":"61,500"},{"label":"D","text":"82,000"},{"label":"E","text":"123,000"}]', 'C', 'Step 1: The Asia-Middle East segment is 410 thousand TEUs, or 410,000 TEUs.

Step 2: 30% of those TEUs came from 40-foot containers: 410,000 × 0.30 = 123,000 TEUs.

Step 3: The stimulus states one 40-foot container counts as 2 TEUs, so the number of 40-foot containers = 123,000 ÷ 2 = 61,500.

The answer is 61,500.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-68'), 'practice-qr-set-68-q1', 'How much pasta (in grams) is needed for the base Classic recipe scaled to a household of 5 people?', '[{"label":"A","text":"400 g"},{"label":"B","text":"600 g"},{"label":"C","text":"800 g"},{"label":"D","text":"1,000 g"},{"label":"E","text":"1,200 g"}]', 'D', 'The stimulus states the base Classic recipe uses 400 g of pasta for 2 people, and ingredients scale by N/2 for a household of N people. For 5 people, pasta = 400 × 5 ÷ 2 = 400 × 2.5 = 1,000 g. The answer is 1,000 g.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-68'), 'practice-qr-set-68-q2', 'Over 4 weeks, how much does a household pay in total for the Essentials subscription, including delivery?', '[{"label":"A","text":"£120.00"},{"label":"B","text":"£126.00"},{"label":"C","text":"£130.50"},{"label":"D","text":"£138.00"},{"label":"E","text":"£155.00"}]', 'D', 'Step 1: The weekly cost for Essentials is £30 plus the £4.50 delivery fee = £34.50 per week.

Step 2: Across 4 weeks the total = 4 × £34.50 = £138.00.

The answer is £138.00.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-68'), 'practice-qr-set-68-q3', 'A household subscribes to the Family tier for 12 weeks, then switches to the Classic tier for a further 8 weeks. What is the total subscription cost across these 20 weeks?', '[{"label":"A","text":"£1,050"},{"label":"B","text":"£1,100"},{"label":"C","text":"£1,140"},{"label":"D","text":"£1,200"},{"label":"E","text":"£1,300"}]', 'C', 'Step 1: Family tier is £65/week, so 12 weeks × £65 = £780.

Step 2: Classic tier is £45/week, so 8 weeks × £45 = £360.

Step 3: Total = £780 + £360 = £1,140. Both tiers include free delivery so no delivery fee is added.

The answer is £1,140.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-69'), 'practice-qr-set-69-q1', 'What is the total surface area of the pool (plan view) in square metres?', '[{"label":"A","text":"200.00 m²"},{"label":"B","text":"239.25 m²"},{"label":"C","text":"278.50 m²"},{"label":"D","text":"357.00 m²"},{"label":"E","text":"514.00 m²"}]', 'B', 'Step 1: The rectangular section has area 20 × 10 = 200 m².

Step 2: The shallow end is a semi-circle with radius 5 m, so its area = ½ × π × r² = ½ × 3.14 × 25 = 39.25 m².

Step 3: Total surface area = 200 + 39.25 = 239.25 m².

The answer is 239.25 m².', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-69'), 'practice-qr-set-69-q2', 'What is the perimeter of the pool edge, in metres?', '[{"label":"A","text":"50.0 m"},{"label":"B","text":"60.0 m"},{"label":"C","text":"65.7 m"},{"label":"D","text":"81.4 m"},{"label":"E","text":"90.0 m"}]', 'C', 'Step 1: The pool edge consists of the two long sides of the rectangle (each 20 m), the 10 m short side opposite the shallow end, and the semi-circular arc.

Step 2: The straight edges total 20 + 20 + 10 = 50 m.

Step 3: The semi-circle arc length = π × r = 3.14 × 5 = 15.7 m.

Step 4: Total perimeter = 50 + 15.7 = 65.7 m.

The answer is 65.7 m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-69'), 'practice-qr-set-69-q3', 'What is the total volume of water the pool holds when filled to the brim, in litres?', '[{"label":"A","text":"400,000 L"},{"label":"B","text":"439,250 L"},{"label":"C","text":"478,500 L"},{"label":"D","text":"557,000 L"},{"label":"E","text":"714,000 L"}]', 'C', 'Step 1: The pool surface area = 200 + ½ × 3.14 × 5² = 200 + 39.25 = 239.25 m².

Step 2: Depth is a uniform 2 m, so volume = 239.25 × 2 = 478.5 m³.

Step 3: Using 1 m³ = 1,000 litres: 478.5 × 1,000 = 478,500 L.

The answer is 478,500 L.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-69'), 'practice-qr-set-69-q4', 'How much chlorine, to 1 decimal place, is needed to treat the pool when it is filled to the brim?', '[{"label":"A","text":"20.0 kg"},{"label":"B","text":"22.5 kg"},{"label":"C","text":"23.9 kg"},{"label":"D","text":"27.9 kg"},{"label":"E","text":"35.7 kg"}]', 'C', 'Step 1: The pool holds 478,500 litres when full.

Step 2: The stimulus gives a chlorine dosage of 50 g per 1,000 litres, so chlorine needed = 478,500 ÷ 1,000 × 50 = 23,925 g.

Step 3: Convert to kilograms: 23,925 ÷ 1,000 = 23.925 kg, which rounds to 23.9 kg.

The answer is 23.9 kg.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-70'), 'practice-qr-set-70-q1', 'In June 2025, which park had the highest number of visitors?', '[{"label":"A","text":"Forest (35,000)"},{"label":"B","text":"Summit (38,000)"},{"label":"C","text":"Lakeside (55,000)"},{"label":"D","text":"Coast (60,000)"},{"label":"E","text":"Cannot Tell"}]', 'D', 'Read each park value at the June point on the graph: Forest 35, Summit 38, Lakeside 55 and Coast 60 (all in thousands). The highest is Coast at 60,000. The answer is Coast (60,000).', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-70'), 'practice-qr-set-70-q2', 'What was the total number of visitors to Summit Park across the six months?', '[{"label":"A","text":"145,000"},{"label":"B","text":"155,000"},{"label":"C","text":"161,000"},{"label":"D","text":"170,000"},{"label":"E","text":"180,000"}]', 'C', 'Read the Summit line month by month: Jan 18, Feb 20, Mar 25, Apr 28, May 32, Jun 38 (thousands).

Step 1: Sum the values: 18 + 20 + 25 + 28 + 32 + 38 = 161.

Step 2: Convert to visitors: 161 × 1,000 = 161,000.

The answer is 161,000.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-70'), 'practice-qr-set-70-q3', 'What was the percentage increase in visitors to Forest Park from January to June, to 1 decimal place?', '[{"label":"A","text":"77.1%"},{"label":"B","text":"135.0%"},{"label":"C","text":"275.0%"},{"label":"D","text":"337.5%"},{"label":"E","text":"437.5%"}]', 'D', 'Percentage increase uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: From the Forest line, January = 8 and June = 35 (thousands).

Step 2: (35 − 8) / 8 × 100 = 27 ÷ 8 × 100 = 337.5%.

The answer is 337.5%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-70'), 'practice-qr-set-70-q4', 'In which month did Coast Park first exceed 30,000 visitors?', '[{"label":"A","text":"January"},{"label":"B","text":"February"},{"label":"C","text":"March"},{"label":"D","text":"April"},{"label":"E","text":"May"}]', 'D', 'Read the Coast line in order: Jan 20, Feb 22, Mar 28, Apr 35 (thousands). March is still below 30 and April is the first month above 30. The answer is April.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-71'), 'practice-qr-set-71-q1', 'An existing customer uses 8 GB of data in a month. What is the total monthly bill, excluding any one-off fees?', '[{"label":"A","text":"£14.00"},{"label":"B","text":"£16.00"},{"label":"C","text":"£18.00"},{"label":"D","text":"£22.00"},{"label":"E","text":"£24.00"}]', 'C', 'Step 1: The first 5 GB are covered by the £12 base fee.

Step 2: The remaining 8 − 5 = 3 GB fall in the 5 to 10 GB band at £2 per GB: 3 × £2 = £6.

Step 3: Total bill = £12 + £6 = £18.00.

The answer is £18.00.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-71'), 'practice-qr-set-71-q2', 'An existing customer uses 25 GB of data in a month. What is the total monthly bill, excluding any one-off fees?', '[{"label":"A","text":"£32.00"},{"label":"B","text":"£37.00"},{"label":"C","text":"£42.00"},{"label":"D","text":"£45.00"},{"label":"E","text":"£50.00"}]', 'C', 'Apply each band only to the GB that fall inside it.

Step 1: Base fee covers the first 5 GB: £12.

Step 2: The 5 to 10 GB band is fully used (5 GB) at £2/GB: 5 × £2 = £10.

Step 3: The 10 to 20 GB band is fully used (10 GB) at £1.50/GB: 10 × £1.50 = £15.

Step 4: The remaining 25 − 20 = 5 GB fall in the above-20 band at £1/GB: 5 × £1 = £5.

Step 5: Total = £12 + £10 + £15 + £5 = £42.00.

The answer is £42.00.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-71'), 'practice-qr-set-71-q3', 'An existing customer uses 12 GB of data in a month. What percentage of their total monthly bill (excluding any one-off fees) comes from overage charges, to the nearest whole percent?', '[{"label":"A","text":"28%"},{"label":"B","text":"45%"},{"label":"C","text":"52%"},{"label":"D","text":"60%"},{"label":"E","text":"68%"}]', 'C', 'Step 1: The 5 to 10 GB band is fully used (5 GB) at £2/GB = £10. The 10 to 12 GB portion is 2 GB at £1.50/GB = £3. Total overage = £10 + £3 = £13.

Step 2: Total bill = £12 base + £13 overage = £25.

Step 3: Overage share = 13 ÷ 25 × 100 = 52%.

The answer is 52%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-72'), 'practice-qr-set-72-q1', 'How many birds live in the Rainforest habitat?', '[{"label":"A","text":"32"},{"label":"B","text":"48"},{"label":"C","text":"55"},{"label":"D","text":"60"},{"label":"E","text":"78"}]', 'C', 'Read the cell at the intersection of the Birds row and the Rainforest column in the table. The value is 55. The answer is 55.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-72'), 'practice-qr-set-72-q2', 'What percentage of all animals at the zoo are reptiles?', '[{"label":"A","text":"10%"},{"label":"B","text":"15%"},{"label":"C","text":"20%"},{"label":"D","text":"25%"},{"label":"E","text":"30%"}]', 'C', 'From the Reptiles row the Total is 60, and the grand total on the bottom Total row is 300.

Step 1: 60 ÷ 300 × 100 = 20%.

The answer is 20%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-72'), 'practice-qr-set-72-q3', 'What percentage of animals living in the Desert habitat are reptiles, to 1 decimal place?', '[{"label":"A","text":"20.0%"},{"label":"B","text":"30.0%"},{"label":"C","text":"48.4%"},{"label":"D","text":"50.0%"},{"label":"E","text":"60.0%"}]', 'C', 'Step 1: From the Reptiles row the Desert cell is 30, and from the bottom Total row the Desert column total is 62.

Step 2: 30 ÷ 62 × 100 = 48.387..., which rounds to 48.4%.

The answer is 48.4%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-72'), 'practice-qr-set-72-q4', 'How many more animals live in the Rainforest than in the Savannah habitat?', '[{"label":"A","text":"25"},{"label":"B","text":"32"},{"label":"C","text":"42"},{"label":"D","text":"50"},{"label":"E","text":"62"}]', 'C', 'Read the column totals from the bottom Total row: Rainforest = 127 and Savannah = 85. Difference = 127 − 85 = 42. The answer is 42.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-73'), 'practice-qr-set-73-q1', 'What is the wall area of the Kitchen, in square metres?', '[{"label":"A","text":"22 m²"},{"label":"B","text":"28 m²"},{"label":"C","text":"30 m²"},{"label":"D","text":"32 m²"},{"label":"E","text":"45 m²"}]', 'B', 'Read the Kitchen bar from the chart: the value is 28 m². The answer is 28 m².', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-73'), 'practice-qr-set-73-q2', 'How many 2.5 L tins of paint must be purchased to apply two coats to the Living Room?', '[{"label":"A","text":"4 tins"},{"label":"B","text":"6 tins"},{"label":"C","text":"7 tins"},{"label":"D","text":"8 tins"},{"label":"E","text":"10 tins"}]', 'D', 'Step 1: The Living Room bar shows 45 m² of wall. Two coats means a total coverage of 2 × 45 = 90 m².

Step 2: At 12 m² per tin, tins needed = 90 ÷ 12 = 7.5.

Step 3: The stimulus says tins must be bought whole, so round 7.5 up to 8 tins.

The answer is 8 tins.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-73'), 'practice-qr-set-73-q3', 'Treating both bedrooms as a single paint batch, what is the total cost of paint (tins only) to apply two coats to Bedroom 1 and Bedroom 2?', '[{"label":"A","text":"£162"},{"label":"B","text":"£180"},{"label":"C","text":"£198"},{"label":"D","text":"£216"},{"label":"E","text":"£234"}]', 'C', 'Step 1: Combined wall area = Bedroom 1 (32) + Bedroom 2 (30) = 62 m². Two coats means 2 × 62 = 124 m² total coverage.

Step 2: Tins needed = 124 ÷ 12 = 10.33..., which rounds up to 11 whole tins.

Step 3: Cost = 11 × £18 = £198.

The answer is £198.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-74'), 'practice-qr-set-74-q1', 'What is the maximum driving range of the vehicle from a fully charged battery?', '[{"label":"A","text":"200 miles"},{"label":"B","text":"220 miles"},{"label":"C","text":"240 miles"},{"label":"D","text":"260 miles"},{"label":"E","text":"280 miles"}]', 'C', 'Multiply the usable battery capacity by the stated efficiency: 60 kWh × 4 miles/kWh = 240 miles. The answer is 240 miles.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-74'), 'practice-qr-set-74-q2', 'How long does it take to charge the battery from empty to full using the home charger?', '[{"label":"A","text":"6 hours"},{"label":"B","text":"8 hours"},{"label":"C","text":"10 hours"},{"label":"D","text":"12 hours"},{"label":"E","text":"15 hours"}]', 'C', 'Apply the stated charging-time rule: time = battery size ÷ charger power = 60 kWh ÷ 6 kW = 10 hours. The answer is 10 hours.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-74'), 'practice-qr-set-74-q3', 'The driver starts a 180-mile journey with the battery at 80% charge. Assuming the stated efficiency holds for the whole journey, what percentage of the full battery capacity remains at the end of the journey?', '[{"label":"A","text":"2.5%"},{"label":"B","text":"5.0%"},{"label":"C","text":"7.5%"},{"label":"D","text":"10.0%"},{"label":"E","text":"12.5%"}]', 'B', 'Step 1: Energy used on the 180-mile journey = 180 ÷ 4 = 45 kWh.

Step 2: Starting energy = 80% of 60 kWh = 0.80 × 60 = 48 kWh.

Step 3: Energy remaining = 48 − 45 = 3 kWh. As a percentage of full capacity: 3 ÷ 60 × 100 = 5.0%.

The answer is 5.0%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-74'), 'practice-qr-set-74-q4', 'How long does it take to charge the battery from empty to full using the rapid charger?', '[{"label":"A","text":"1 hour"},{"label":"B","text":"1 hour 15 minutes"},{"label":"C","text":"1 hour 30 minutes"},{"label":"D","text":"1 hour 45 minutes"},{"label":"E","text":"2 hours"}]', 'C', 'Apply the charging-time rule: time = 60 kWh ÷ 40 kW = 1.5 hours = 1 hour 30 minutes. The answer is 1 hour 30 minutes.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-75'), 'practice-qr-set-75-q1', 'How many Category 2 calls were responded to within 15 minutes?', '[{"label":"A","text":"240"},{"label":"B","text":"270"},{"label":"C","text":"300"},{"label":"D","text":"330"},{"label":"E","text":"360"}]', 'D', 'Add the Cat 2 counts in the ≤7 min and 8–15 min rows: 90 + 240 = 330. The answer is 330.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-75'), 'practice-qr-set-75-q2', 'What percentage of Category 1 calls were responded to within 7 minutes?', '[{"label":"A","text":"60.0%"},{"label":"B","text":"65.0%"},{"label":"C","text":"70.0%"},{"label":"D","text":"75.0%"},{"label":"E","text":"80.0%"}]', 'C', 'Percentage uses the Cat 1 total as the denominator. From the Cat 1 column, 210 of 300 calls were in the ≤7 min row. (210 ÷ 300) × 100 = 70.0%. The answer is 70.0%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-75'), 'practice-qr-set-75-q3', 'The service''s target is that 75% of Category 1 calls are responded to within 7 minutes. Assuming the Category 1 total of 300 is unchanged, by how many calls did the service fall short of the target last month?', '[{"label":"A","text":"10"},{"label":"B","text":"15"},{"label":"C","text":"20"},{"label":"D","text":"25"},{"label":"E","text":"30"}]', 'B', 'Step 1: The 75% target applied to the Cat 1 total = 0.75 × 300 = 225 calls within 7 minutes.

Step 2: The actual Cat 1 count in the ≤7 min row is 210.

Step 3: Shortfall = 225 − 210 = 15 calls.

The answer is 15.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-76'), 'practice-qr-set-76-q1', 'At 13:00, what is the difference in average queue length between the weekend and the weekday?', '[{"label":"A","text":"2"},{"label":"B","text":"3"},{"label":"C","text":"4"},{"label":"D","text":"5"},{"label":"E","text":"6"}]', 'D', 'Read both series at 13:00: Weekend = 12, Weekday = 7. Difference = 12 − 7 = 5. The answer is 5.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-76'), 'practice-qr-set-76-q2', 'At which of the following times is the weekend average queue length at its maximum?', '[{"label":"A","text":"09:00"},{"label":"B","text":"11:00"},{"label":"C","text":"13:00"},{"label":"D","text":"15:00"},{"label":"E","text":"17:00"}]', 'C', 'Scan the Weekend line across the six labelled times: 5, 8, 12, 10, 9, 7. The highest value is 12, at 13:00. The answer is 13:00.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-76'), 'practice-qr-set-76-q3', 'By what percentage did the weekend average queue length increase from 09:00 to 13:00?', '[{"label":"A","text":"40%"},{"label":"B","text":"70%"},{"label":"C","text":"100%"},{"label":"D","text":"140%"},{"label":"E","text":"180%"}]', 'D', 'Percentage change uses the earlier value as the denominator: (new − old) ÷ old × 100.

Step 1: Read the Weekend line at 09:00 = 5 and at 13:00 = 12.

Step 2: (12 − 5) ÷ 5 × 100 = 7 ÷ 5 × 100 = 140%.

The answer is 140%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-77'), 'practice-qr-set-77-q1', 'What are Dune''s monthly online sales?', '[{"label":"A","text":"£22,000"},{"label":"B","text":"£30,000"},{"label":"C","text":"£45,000"},{"label":"D","text":"£55,000"},{"label":"E","text":"£70,000"}]', 'C', 'Find the point labelled Dune on the scatter plot: it sits at an x-value of 9 with a y-value of 45. The y-axis is in £000s, so this is £45,000. The answer is £45,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-77'), 'practice-qr-set-77-q2', 'What is the difference between the highest and lowest monthly online sales across the six stores?', '[{"label":"A","text":"£75,000"},{"label":"B","text":"£80,000"},{"label":"C","text":"£85,000"},{"label":"D","text":"£90,000"},{"label":"E","text":"£95,000"}]', 'C', 'From the scatter plot, the highest sales are Holt at 100 and the lowest are Aria at 15 (both read in £000s on the y-axis). Difference = 100 − 15 = 85, which is £85,000. The answer is £85,000.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-77'), 'practice-qr-set-77-q3', 'What are the mean monthly online sales across the six stores?', '[{"label":"A","text":"£52,500"},{"label":"B","text":"£55,000"},{"label":"C","text":"£57,500"},{"label":"D","text":"£60,000"},{"label":"E","text":"£62,500"}]', 'C', 'Step 1: Read the y-values of all six labelled points (in £000s): Aria 15, Cove 30, Dune 45, Fern 70, Glen 85, Holt 100.

Step 2: Sum them: 15 + 30 + 45 + 70 + 85 + 100 = 345.

Step 3: Mean = 345 ÷ 6 = 57.5, which is £57,500.

The answer is £57,500.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-77'), 'practice-qr-set-77-q4', 'How many of the six stores have a weekly advertising spend of £10,000 or more?', '[{"label":"A","text":"1"},{"label":"B","text":"2"},{"label":"C","text":"3"},{"label":"D","text":"4"},{"label":"E","text":"5"}]', 'C', 'The x-axis is in £000s, so £10,000 corresponds to an x-value of 10. Count the labelled points with an x-value of 10 or greater: Fern (15), Glen (18), Holt (22). That gives 3 stores. The answer is 3.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-78'), 'practice-qr-set-78-q1', 'What percentage of Medicine applicants received an offer?', '[{"label":"A","text":"12.5%"},{"label":"B","text":"20.0%"},{"label":"C","text":"25.0%"},{"label":"D","text":"33.3%"},{"label":"E","text":"50.0%"}]', 'C', 'Read the Medicine bars: Applicants = 1,200 and Offers = 300. Offer rate = 300 ÷ 1,200 × 100 = 25.0%. The answer is 25.0%.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-78'), 'practice-qr-set-78-q2', 'For Business, what percentage of offers resulted in an acceptance?', '[{"label":"A","text":"30.0%"},{"label":"B","text":"45.0%"},{"label":"C","text":"50.0%"},{"label":"D","text":"60.0%"},{"label":"E","text":"72.0%"}]', 'D', 'Read the Business bars: Offers = 1,500 and Acceptances = 900. Acceptance rate = 900 ÷ 1,500 × 100 = 60.0%. The answer is 60.0%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-78'), 'practice-qr-set-78-q3', 'What is the total first-year tuition revenue from all acceptances across the five courses, at £9,250 per student?', '[{"label":"A","text":"£14.25m"},{"label":"B","text":"£15.80m"},{"label":"C","text":"£17.39m"},{"label":"D","text":"£18.85m"},{"label":"E","text":"£20.25m"}]', 'C', 'Step 1: Read Acceptances for each course: Medicine 150, Dentistry 80, Law 400, Engineering 350, Business 900.

Step 2: Total acceptances = 150 + 80 + 400 + 350 + 900 = 1,880.

Step 3: First-year tuition revenue = 1,880 × £9,250 = £17,390,000 = £17.39m.

The answer is £17.39m.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-78'), 'practice-qr-set-78-q4', 'What is the total number of offers made across all five courses?', '[{"label":"A","text":"2,800"},{"label":"B","text":"3,200"},{"label":"C","text":"3,500"},{"label":"D","text":"3,800"},{"label":"E","text":"4,200"}]', 'C', 'Read the Offers bars across all five courses: Medicine 300, Dentistry 200, Law 800, Engineering 700, Business 1,500. Sum = 300 + 200 + 800 + 700 + 1,500 = 3,500. The answer is 3,500.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-79'), 'practice-qr-set-79-q1', 'What is the total seating capacity of the theatre?', '[{"label":"A","text":"350"},{"label":"B","text":"400"},{"label":"C","text":"450"},{"label":"D","text":"500"},{"label":"E","text":"550"}]', 'C', 'Add the seats in the three tiers stated in the stimulus: Stalls 200 + Circle 150 + Gallery 100 = 450. The answer is 450.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-79'), 'practice-qr-set-79-q2', 'How much ticket revenue did the Stalls generate at last night''s show?', '[{"label":"A","text":"£6,300"},{"label":"B","text":"£7,200"},{"label":"C","text":"£8,100"},{"label":"D","text":"£9,000"},{"label":"E","text":"£10,800"}]', 'C', 'Step 1: Stalls tickets sold = 90% of 200 = 0.90 × 200 = 180.

Step 2: Stalls revenue = 180 × £45 = £8,100.

The answer is £8,100.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-79'), 'practice-qr-set-79-q3', 'What was the total ticket revenue across all three tiers at last night''s show?', '[{"label":"A","text":"£9,750"},{"label":"B","text":"£11,250"},{"label":"C","text":"£12,450"},{"label":"D","text":"£13,500"},{"label":"E","text":"£14,700"}]', 'C', 'Step 1: Stalls revenue = 0.90 × 200 × £45 = 180 × £45 = £8,100.

Step 2: Circle revenue = 0.80 × 150 × £30 = 120 × £30 = £3,600.

Step 3: Gallery revenue = 0.50 × 100 × £15 = 50 × £15 = £750.

Step 4: Total = £8,100 + £3,600 + £750 = £12,450.

The answer is £12,450.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-80'), 'practice-qr-set-80-q1', 'What was the Baked Goods revenue on Saturday?', '[{"label":"A","text":"£1,500"},{"label":"B","text":"£1,800"},{"label":"C","text":"£2,400"},{"label":"D","text":"£2,700"},{"label":"E","text":"£4,800"}]', 'D', 'Read the Baked Goods segment directly from the legend: £2,700. The answer is £2,700.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-80'), 'practice-qr-set-80-q2', 'What was the revenue from the Flowers vendor?', '[{"label":"A","text":"£900"},{"label":"B","text":"£1,200"},{"label":"C","text":"£1,500"},{"label":"D","text":"£1,800"},{"label":"E","text":"£2,100"}]', 'C', 'The total market revenue is £13,200, so the Flowers value equals the total minus the four known segments.

Step 1: Add the four known segments: £4,800 + £2,700 + £1,800 + £2,400 = £11,700.

Step 2: Flowers = £13,200 − £11,700 = £1,500.

The answer is £1,500.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-80'), 'practice-qr-set-80-q3', 'To the nearest 0.1%, what percentage of Saturday''s total revenue came from Produce?', '[{"label":"A","text":"13.6%"},{"label":"B","text":"18.2%"},{"label":"C","text":"20.5%"},{"label":"D","text":"27.3%"},{"label":"E","text":"36.4%"}]', 'E', 'Percentage of total uses the whole market as the denominator: share = Produce ÷ total × 100.

Step 1: Produce revenue is £4,800 and the total is £13,200.

Step 2: 4,800 ÷ 13,200 × 100 = 36.36…%, which rounds to 36.4%.

The answer is 36.4%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-80'), 'practice-qr-set-80-q4', 'Next Saturday, Meat & Fish revenue is expected to fall by 15% while total market revenue rises to £14,000. To the nearest 0.1%, what will Meat & Fish represent as a share of the new total?', '[{"label":"A","text":"12.9%"},{"label":"B","text":"13.8%"},{"label":"C","text":"14.6%"},{"label":"D","text":"17.1%"},{"label":"E","text":"19.6%"}]', 'C', 'Step 1: Apply the 15% fall to Meat & Fish: £2,400 × (1 − 0.15) = £2,400 × 0.85 = £2,040.

Step 2: Divide the new Meat & Fish value by the new total: 2,040 ÷ 14,000 × 100 = 14.571…%.

Step 3: Round to one decimal place: 14.6%.

The answer is 14.6%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-81'), 'practice-qr-set-81-q1', 'What was the Breaststroke lap time in Week 6?', '[{"label":"A","text":"32.8 s"},{"label":"B","text":"35.7 s"},{"label":"C","text":"39.8 s"},{"label":"D","text":"40.2 s"},{"label":"E","text":"42.0 s"}]', 'C', 'Read the Breaststroke line at Week 6: 39.8 seconds. The answer is 39.8 s.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-81'), 'practice-qr-set-81-q2', 'By how many seconds did the Freestyle lap time improve from Week 1 to Week 6?', '[{"label":"A","text":"0.4 s"},{"label":"B","text":"1.4 s"},{"label":"C","text":"2.2 s"},{"label":"D","text":"2.8 s"},{"label":"E","text":"4.0 s"}]', 'C', 'An improvement in lap time means the time got smaller, so subtract the Week 6 value from the Week 1 value.

Step 1: Week 1 Freestyle = 32.0 s and Week 6 Freestyle = 29.8 s.

Step 2: 32.0 − 29.8 = 2.2 s.

The answer is 2.2 s.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-81'), 'practice-qr-set-81-q3', 'To the nearest 0.1%, what was the percentage decrease in Butterfly lap time from Week 1 to Week 6?', '[{"label":"A","text":"2.2%"},{"label":"B","text":"6.3%"},{"label":"C","text":"6.7%"},{"label":"D","text":"7.0%"},{"label":"E","text":"15.9%"}]', 'B', 'Percentage decrease uses the starting value as the denominator: (old − new) ÷ old × 100.

Step 1: Week 1 Butterfly = 35.0 s and Week 6 Butterfly = 32.8 s.

Step 2: (35.0 − 32.8) ÷ 35.0 × 100 = 2.2 ÷ 35.0 × 100 = 6.285…%, which rounds to 6.3%.

The answer is 6.3%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-81'), 'practice-qr-set-81-q4', 'What was the Backstroke lap time in Week 4?', '[{"label":"A","text":"36.1 s"},{"label":"B","text":"36.5 s"},{"label":"C","text":"36.8 s"},{"label":"D","text":"37.0 s"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The graph has a gap at Week 4 for Backstroke because the session was cancelled, and no value or rate of improvement is given for that week. Without any data point or stated rule to fill the gap, the Week 4 Backstroke time cannot be determined from the information given. The answer is Can''t Tell.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-82'), 'practice-qr-set-82-q1', 'How much electricity did Eastridge generate in March?', '[{"label":"A","text":"340 MWh"},{"label":"B","text":"380 MWh"},{"label":"C","text":"400 MWh"},{"label":"D","text":"440 MWh"},{"label":"E","text":"520 MWh"}]', 'D', 'Read the Eastridge bar at the March category: 440 MWh. The answer is 440 MWh.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-82'), 'practice-qr-set-82-q2', 'What was Seabay''s total generation across the four months?', '[{"label":"A","text":"1,210 MWh"},{"label":"B","text":"1,590 MWh"},{"label":"C","text":"1,850 MWh"},{"label":"D","text":"2,180 MWh"},{"label":"E","text":"2,440 MWh"}]', 'D', 'Sum Seabay''s four monthly values.

Step 1: Add January and February: 610 + 580 = 1,190 MWh.

Step 2: Add March and April: 520 + 470 = 990 MWh.

Step 3: Combine the two halves: 1,190 + 990 = 2,180 MWh.

The answer is 2,180 MWh.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-82'), 'practice-qr-set-82-q3', 'To the nearest 0.1%, what was the percentage decrease in Northvale''s generation from January to April?', '[{"label":"A","text":"11.0%"},{"label":"B","text":"19.6%"},{"label":"C","text":"24.4%"},{"label":"D","text":"28.9%"},{"label":"E","text":"32.4%"}]', 'C', 'Percentage decrease uses the starting value as the denominator: (old − new) ÷ old × 100.

Step 1: Northvale in January = 450 MWh and in April = 340 MWh.

Step 2: (450 − 340) ÷ 450 × 100 = 110 ÷ 450 × 100 = 24.444…%, which rounds to 24.4%.

The answer is 24.4%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-82'), 'practice-qr-set-82-q4', 'Across all three wind farms combined, by what percentage did total generation fall from January to April? Give your answer to the nearest 0.1%.', '[{"label":"A","text":"18.2%"},{"label":"B","text":"21.0%"},{"label":"C","text":"23.4%"},{"label":"D","text":"26.5%"},{"label":"E","text":"30.6%"}]', 'C', 'You need the combined January total and the combined April total before you can work out the percentage change.

Step 1: January combined = 450 + 520 + 610 = 1,580 MWh.

Step 2: April combined = 340 + 400 + 470 = 1,210 MWh.

Step 3: Percentage change uses the original value as the denominator: (1,580 − 1,210) ÷ 1,580 × 100 = 370 ÷ 1,580 × 100 = 23.417…%, which rounds to 23.4%.

The answer is 23.4%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-83'), 'practice-qr-set-83-q1', 'Maya brings her 8 kg terrier in for grooming and a nail trim. She is a new customer. What is the cost before VAT?', '[{"label":"A","text":"£28"},{"label":"B","text":"£32.40"},{"label":"C","text":"£36"},{"label":"D","text":"£38"},{"label":"E","text":"£46"}]', 'C', 'An 8 kg dog is under 10 kg, so the base fee is the Small tier at £28. Add the nail trim at £8. As a new customer Maya has no loyalty discount, so the pre-VAT cost is £28 + £8 = £36. The answer is £36.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-83'), 'practice-qr-set-83-q2', 'Tom''s 14 kg cocker spaniel has grooming and a de-shed treatment. Tom has had 6 previous sessions at the salon. What is the cost before VAT?', '[{"label":"A","text":"£38.70"},{"label":"B","text":"£44.10"},{"label":"C","text":"£47.70"},{"label":"D","text":"£53"},{"label":"E","text":"£58.30"}]', 'C', 'A 14 kg dog falls in the 10–25 kg band, so the base fee is the Medium tier at £38. Add the de-shed treatment at £15.

Step 1: Pre-discount total = £38 + £15 = £53.

Step 2: Tom has 6 previous sessions (which is 5 or more), so the 10% loyalty discount applies to the full bill: £53 × 0.90 = £47.70.

The answer is £47.70.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-83'), 'practice-qr-set-83-q3', 'Sarah''s 28 kg retriever has grooming, a teeth clean, and a nail trim. Sarah has had 7 previous sessions. What is the final bill including VAT?', '[{"label":"A","text":"£64.80"},{"label":"B","text":"£72"},{"label":"C","text":"£77.76"},{"label":"D","text":"£86.40"},{"label":"E","text":"£93.60"}]', 'C', 'A 28 kg dog is over 25 kg, so the base fee is the Large tier at £52. Add the teeth clean (£12) and the nail trim (£8).

Step 1: Pre-discount total = £52 + £12 + £8 = £72.

Step 2: Sarah has 7 previous sessions, so the 10% loyalty discount applies to the whole bill: £72 × 0.90 = £64.80.

Step 3: Add 20% VAT to the discounted total: £64.80 × 1.20 = £77.76.

The answer is £77.76.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-83'), 'practice-qr-set-83-q4', 'Customer A has an 11 kg dog groomed with a teeth clean and has had 3 previous sessions. Customer B has an 11 kg dog groomed with a de-shed treatment and has had 8 previous sessions. Ignoring VAT, what is the difference between the two bills?', '[{"label":"A","text":"£1.50"},{"label":"B","text":"£2.30"},{"label":"C","text":"£2.70"},{"label":"D","text":"£3"},{"label":"E","text":"£8"}]', 'B', 'Both dogs are 11 kg, so both use the Medium tier at £38. Work out each bill separately before comparing.

Step 1: Customer A''s pre-discount total = £38 + £12 = £50. Customer A has only 3 previous sessions, so no loyalty discount applies. Customer A''s bill = £50.

Step 2: Customer B''s pre-discount total = £38 + £15 = £53. Customer B has 8 previous sessions, so the 10% loyalty discount applies: £53 × 0.90 = £47.70.

Step 3: Difference = £50 − £47.70 = £2.30.

The answer is £2.30.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-84'), 'practice-qr-set-84-q1', 'How many Group Study bookings were made for the Evening slot?', '[{"label":"A","text":"15"},{"label":"B","text":"30"},{"label":"C","text":"55"},{"label":"D","text":"75"},{"label":"E","text":"80"}]', 'E', 'Find the Group Study row, then move across to the Evening column. The cell where they meet shows 80. The answer is 80.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-84'), 'practice-qr-set-84-q2', 'To the nearest 0.1%, what percentage of all bookings that week took place in the Evening slot?', '[{"label":"A","text":"32.7%"},{"label":"B","text":"40.8%"},{"label":"C","text":"46.9%"},{"label":"D","text":"53.1%"},{"label":"E","text":"57.1%"}]', 'C', 'The whole week is the denominator here, so divide the Evening total by the grand total.

Step 1: From the Slot Total row, Evening bookings = 230 and the grand total = 490.

Step 2: 230 ÷ 490 × 100 = 46.938…%, which rounds to 46.9%.

The answer is 46.9%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-84'), 'practice-qr-set-84-q3', 'What fraction of Silent Study bookings were made in the Afternoon slot? Give your answer in its simplest form.', '[{"label":"A","text":"1/4"},{"label":"B","text":"2/7"},{"label":"C","text":"1/3"},{"label":"D","text":"3/8"},{"label":"E","text":"5/12"}]', 'C', 'The Silent Study row total is the denominator because the question is about Silent Study bookings.

Step 1: Silent Study Afternoon bookings = 60 and total Silent Study bookings = 180.

Step 2: Write as a fraction and simplify: 60/180 = 6/18 = 1/3.

The answer is 1/3.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-84'), 'practice-qr-set-84-q4', 'The library merges Media Room and PhD Pods into a single "Specialist" category. To the nearest 0.1%, what percentage of Specialist bookings were made outside the Evening slot?', '[{"label":"A","text":"41.4%"},{"label":"B","text":"48.3%"},{"label":"C","text":"51.7%"},{"label":"D","text":"55.2%"},{"label":"E","text":"58.6%"}]', 'B', 'Combine the two room types first, then work out the share that falls outside Evening.

Step 1: Total Specialist bookings = Media Room total + PhD Pods total = 75 + 70 = 145.

Step 2: Specialist Evening bookings = 40 + 35 = 75, so Specialist bookings outside the Evening slot = 145 − 75 = 70.

Step 3: 70 ÷ 145 × 100 = 48.275…%, which rounds to 48.3%.

The answer is 48.3%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-85'), 'practice-qr-set-85-q1', 'How many subscribers are on the Family tier?', '[{"label":"A","text":"90,000"},{"label":"B","text":"120,000"},{"label":"C","text":"165,000"},{"label":"D","text":"180,000"},{"label":"E","text":"245,000"}]', 'C', 'Read the Family segment directly from the legend. It shows 165,000 subscribers. The answer is 165,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-85'), 'practice-qr-set-85-q2', 'What percentage of SoundWave subscribers are on the Standard tier, to the nearest 0.1%?', '[{"label":"A","text":"20.6%"},{"label":"B","text":"22.5%"},{"label":"C","text":"24.5%"},{"label":"D","text":"30.6%"},{"label":"E","text":"32.7%"}]', 'D', 'Step 1: From the legend, Standard has 245,000 subscribers out of a total of 800,000.

Step 2: Percentage = 245,000 ÷ 800,000 × 100 = 30.625%, which rounds to 30.6%.

The answer is 30.6%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-85'), 'practice-qr-set-85-q3', 'Premium HiFi costs £14.99 per subscriber per month and Student costs £5.99 per subscriber per month. What is the difference between the monthly revenue from Premium HiFi and the monthly revenue from Student?', '[{"label":"A","text":"£720,600"},{"label":"B","text":"£899,400"},{"label":"C","text":"£1,078,200"},{"label":"D","text":"£1,798,800"},{"label":"E","text":"£1,979,400"}]', 'A', 'Step 1: Premium HiFi monthly revenue = 120,000 × £14.99 = £1,798,800.

Step 2: Student monthly revenue = 180,000 × £5.99 = £1,078,200.

Step 3: Difference = £1,798,800 − £1,078,200 = £720,600.

The answer is £720,600.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-85'), 'practice-qr-set-85-q4', 'SoundWave expects Business subscribers to grow by 40% next quarter. How many Business subscribers will there be after this growth?', '[{"label":"A","text":"36,000"},{"label":"B","text":"94,000"},{"label":"C","text":"108,000"},{"label":"D","text":"126,000"},{"label":"E","text":"130,000"}]', 'D', 'Step 1: From the legend, Business currently has 90,000 subscribers.

Step 2: Apply a 40% increase: 90,000 × 1.40 = 126,000.

The answer is 126,000.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-86'), 'practice-qr-set-86-q1', 'Which hive produced the most honey in the year?', '[{"label":"A","text":"Hive D"},{"label":"B","text":"Hive E"},{"label":"C","text":"Hive F"},{"label":"D","text":"Hive G"},{"label":"E","text":"Hive H"}]', 'D', 'Look for the point with the highest y-value on the chart. Hive G sits at 40 kg, which is the top of the plot. The answer is Hive G.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-86'), 'practice-qr-set-86-q2', 'What is the youngest hive that produced at least 30 kg of honey in the year?', '[{"label":"A","text":"Hive D"},{"label":"B","text":"Hive E"},{"label":"C","text":"Hive F"},{"label":"D","text":"Hive G"},{"label":"E","text":"Hive H"}]', 'B', 'Pick out the hives producing 30 kg or more (those with y at or above 30): E (35 kg), F (32 kg), G (40 kg) and H (38 kg). Of these, Hive E is the left-most on the x-axis at 22 months, so it is the youngest. The answer is Hive E.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-86'), 'practice-qr-set-86-q3', 'What is the mean annual honey production, in kg, of hives aged more than 20 months?', '[{"label":"A","text":"32.00"},{"label":"B","text":"33.50"},{"label":"C","text":"35.00"},{"label":"D","text":"36.25"},{"label":"E","text":"37.50"}]', 'D', 'Step 1: The hives aged more than 20 months are E (22 mo, 35 kg), F (26 mo, 32 kg), G (30 mo, 40 kg) and H (34 mo, 38 kg).

Step 2: Sum of production = 35 + 32 + 40 + 38 = 145 kg.

Step 3: Mean = 145 ÷ 4 = 36.25 kg.

The answer is 36.25 kg.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-86'), 'practice-qr-set-86-q4', 'For Hive D, what is its annual honey production per month of age, to the nearest 0.01 kg?', '[{"label":"A","text":"1.40 kg"},{"label":"B","text":"1.47 kg"},{"label":"C","text":"1.56 kg"},{"label":"D","text":"1.65 kg"},{"label":"E","text":"1.75 kg"}]', 'C', 'Step 1: From the chart, Hive D is 18 months old and produced 28 kg of honey in the year.

Step 2: Production per month of age = 28 ÷ 18 = 1.5555 kg, which rounds to 1.56 kg.

The answer is 1.56 kg.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-87'), 'practice-qr-set-87-q1', 'A passenger takes a 6-mile journey at 14:00 with no waiting time. What is the total fare?', '[{"label":"A","text":"£13.20"},{"label":"B","text":"£14.30"},{"label":"C","text":"£15.50"},{"label":"D","text":"£16.70"},{"label":"E","text":"£18.20"}]', 'C', 'Step 1: Flag-fall = £3.50.

Step 2: First 3 miles at £2.20 per mile = 3 × £2.20 = £6.60.

Step 3: The remaining 3 miles (miles 3 to 6) fall in the middle band at £1.80 per mile = 3 × £1.80 = £5.40.

Step 4: Total = £3.50 + £6.60 + £5.40 = £15.50.

The answer is £15.50.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-87'), 'practice-qr-set-87-q2', 'A passenger takes a 10-mile journey at 15:30, including 4 minutes of waiting time at the passenger''s request. What is the total fare?', '[{"label":"A","text":"£18.00"},{"label":"B","text":"£20.10"},{"label":"C","text":"£22.10"},{"label":"D","text":"£23.70"},{"label":"E","text":"£26.90"}]', 'D', 'Step 1: Flag-fall = £3.50.

Step 2: First 3 miles at £2.20 = 3 × £2.20 = £6.60.

Step 3: Next 5 miles (miles 3 to 8) at £1.80 = 5 × £1.80 = £9.00.

Step 4: Beyond 8 miles, there are 2 miles at £1.50 = 2 × £1.50 = £3.00.

Step 5: Waiting = 4 × £0.40 = £1.60.

Step 6: Total = £3.50 + £6.60 + £9.00 + £3.00 + £1.60 = £23.70.

The answer is £23.70.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-87'), 'practice-qr-set-87-q3', 'For the 10-mile, 4-minute waiting journey in the previous question (total £23.70), what percentage of the total fare came from the mileage charges alone (excluding flag-fall and waiting), to the nearest 0.1%?', '[{"label":"A","text":"28.5%"},{"label":"B","text":"38.0%"},{"label":"C","text":"67.5%"},{"label":"D","text":"78.5%"},{"label":"E","text":"85.2%"}]', 'D', 'Step 1: Add up the mileage charges only: £6.60 (first band) + £9.00 (middle band) + £3.00 (top band) = £18.60.

Step 2: Divide by the total fare and multiply by 100: £18.60 ÷ £23.70 × 100 = 78.48%, which rounds to 78.5%.

The answer is 78.5%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-87'), 'practice-qr-set-87-q4', 'A passenger boards at 16:00 and travels 5 miles. On the way, they ask the driver to wait briefly outside a shop before continuing. What is the total fare for this journey?', '[{"label":"A","text":"£13.70"},{"label":"B","text":"£14.30"},{"label":"C","text":"£17.13"},{"label":"D","text":"£22.70"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The mileage portion of the fare can be worked out from the 5 miles, but the waiting charge depends on how many minutes the taxi was stationary outside the shop, and the stem only says the wait was brief without giving a duration. Without the exact waiting time, the total fare cannot be determined from the information given. The answer is Can''t Tell.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-88'), 'practice-qr-set-88-q1', 'Which stadium has the highest capacity utilisation?', '[{"label":"A","text":"Old Trafford"},{"label":"B","text":"Emirates"},{"label":"C","text":"Anfield"},{"label":"D","text":"Tottenham"},{"label":"E","text":"Etihad"}]', 'E', 'Work out attendance ÷ capacity for each stadium.

Step 1: Old Trafford = 73,200 ÷ 74,140 = 98.7%.

Step 2: Emirates = 60,100 ÷ 60,704 = 99.0%.

Step 3: Anfield = 59,800 ÷ 61,276 = 97.6%.

Step 4: Tottenham = 61,700 ÷ 62,850 = 98.2%.

Step 5: Etihad = 53,100 ÷ 53,400 = 99.4%.

Etihad has the highest utilisation. The answer is Etihad.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-88'), 'practice-qr-set-88-q2', 'On average, how many empty seats are there per match at Old Trafford?', '[{"label":"A","text":"300"},{"label":"B","text":"604"},{"label":"C","text":"940"},{"label":"D","text":"1,150"},{"label":"E","text":"1,476"}]', 'C', 'From the Old Trafford bars, capacity is 74,140 and average attendance is 73,200. Empty seats per match = 74,140 − 73,200 = 940. The answer is 940.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-88'), 'practice-qr-set-88-q3', 'What is Anfield''s capacity utilisation, to the nearest 0.1%?', '[{"label":"A","text":"95.8%"},{"label":"B","text":"97.6%"},{"label":"C","text":"98.2%"},{"label":"D","text":"98.7%"},{"label":"E","text":"102.5%"}]', 'B', 'Step 1: From the Anfield bars, average attendance = 59,800 and capacity = 61,276.

Step 2: Utilisation = 59,800 ÷ 61,276 × 100 = 97.59%, which rounds to 97.6%.

The answer is 97.6%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-88'), 'practice-qr-set-88-q4', 'If Tottenham sold out every match (attendance equal to capacity), how many additional spectators per match would attend on average, compared with the chart?', '[{"label":"A","text":"300"},{"label":"B","text":"604"},{"label":"C","text":"940"},{"label":"D","text":"1,150"},{"label":"E","text":"1,476"}]', 'D', 'From the Tottenham bars, capacity is 62,850 and average attendance is 61,700. Additional spectators if sold out = 62,850 − 61,700 = 1,150. The answer is 1,150.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-89'), 'practice-qr-set-89-q1', 'What was Clara''s total race time, in minutes?', '[{"label":"A","text":"124"},{"label":"B","text":"127"},{"label":"C","text":"129"},{"label":"D","text":"131"},{"label":"E","text":"133"}]', 'B', 'Find Clara''s row and read the Total (min) column directly. Her total race time is 127 minutes. The answer is 127 minutes.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-89'), 'practice-qr-set-89-q2', 'Clara completed the 40 km bike leg in 65 minutes. What was her average bike speed, in km/h, to the nearest 0.1?', '[{"label":"A","text":"32.5"},{"label":"B","text":"34.6"},{"label":"C","text":"36.9"},{"label":"D","text":"38.5"},{"label":"E","text":"40.0"}]', 'C', 'Speed = distance ÷ time, with time in hours.

Step 1: From Clara''s row, her bike time is 65 minutes, which is 65 ÷ 60 = 1.0833 hours.

Step 2: Speed = 40 ÷ 1.0833 = 36.92 km/h, which rounds to 36.9 km/h.

The answer is 36.9 km/h.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-89'), 'practice-qr-set-89-q3', 'What percentage of Brendan''s total race time was spent on the run leg, to the nearest 0.1%?', '[{"label":"A","text":"28.6%"},{"label":"B","text":"30.0%"},{"label":"C","text":"31.6%"},{"label":"D","text":"33.3%"},{"label":"E","text":"35.3%"}]', 'C', 'Step 1: From Brendan''s row, his run time is 42 minutes and his total race time is 133 minutes.

Step 2: Percentage = 42 ÷ 133 × 100 = 31.58%, which rounds to 31.6%.

The answer is 31.6%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-89'), 'practice-qr-set-89-q4', 'Which athlete had the fastest swim split?', '[{"label":"A","text":"Amara"},{"label":"B","text":"Brendan"},{"label":"C","text":"Clara"},{"label":"D","text":"Diego"},{"label":"E","text":"Elena"}]', 'C', 'Scan the Swim (min) column and pick the smallest value. Clara''s swim is 23 minutes, which is the lowest. The answer is Clara.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-90'), 'practice-qr-set-90-q1', 'A customer rents a Compact for 3 days, declines insurance, and stays within the free mileage allowance. What is the total hire cost?', '[{"label":"A","text":"£90"},{"label":"B","text":"£120"},{"label":"C","text":"£144"},{"label":"D","text":"£160"},{"label":"E","text":"£270"}]', 'B', 'With no overage miles and no insurance, you only pay the daily base. From the Compact row, the daily base is £40, so 3 days = 3 × £40 = £120. The answer is £120.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-90'), 'practice-qr-set-90-q2', 'A customer rents an SUV for 4 days and drives 900 miles in total. Insurance is declined. What is the total hire cost?', '[{"label":"A","text":"£240"},{"label":"B","text":"£265"},{"label":"C","text":"£270"},{"label":"D","text":"£440"},{"label":"E","text":"£465"}]', 'B', 'From the SUV row: daily base £60, free miles 200/day, overage £0.25/mile.

Step 1: Base hire = 4 × £60 = £240.

Step 2: Free miles = 4 × 200 = 800, so overage miles = 900 − 800 = 100.

Step 3: Overage charge = 100 × £0.25 = £25.

Step 4: Total = £240 + £25 = £265.

The answer is £265.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-90'), 'practice-qr-set-90-q3', 'A customer rents a Luxury for 5 days, drives 1,400 miles, and takes the insurance add-on. What is the total hire cost?', '[{"label":"A","text":"£450"},{"label":"B","text":"£495"},{"label":"C","text":"£540"},{"label":"D","text":"£585"},{"label":"E","text":"£960"}]', 'D', 'From the Luxury row: daily base £90, free miles 250/day, overage £0.30/mile, insurance £18/day.

Step 1: Base hire = 5 × £90 = £450.

Step 2: Free miles = 5 × 250 = 1,250, so overage miles = 1,400 − 1,250 = 150.

Step 3: Overage charge = 150 × £0.30 = £45.

Step 4: Insurance = 5 × £18 = £90.

Step 5: Total = £450 + £45 + £90 = £585.

The answer is £585.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-90'), 'practice-qr-set-90-q4', 'A customer plans a 3-day trip covering 600 miles and will decline insurance. Which tier gives the lowest total cost?', '[{"label":"A","text":"Economy"},{"label":"B","text":"Compact"},{"label":"C","text":"SUV"},{"label":"D","text":"Luxury"},{"label":"E","text":"All four tiers cost the same"}]', 'B', 'Work out base hire plus any overage for each tier over 3 days and 600 miles.

Step 1: Economy = 3 × £30 + (600 − 300) × £0.20 = £90 + £60 = £150.

Step 2: Compact = 3 × £40 + (600 − 450) × £0.18 = £120 + £27 = £147.

Step 3: SUV = 3 × £60 + 0 (600 miles is within the 600-mile allowance) = £180.

Step 4: Luxury = 3 × £90 + 0 (600 miles is within the 750-mile allowance) = £270.

Compact is cheapest at £147. The answer is Compact.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-91'), 'practice-qr-set-91-q1', 'A couple books the Gold package for 80 guests. What is the final invoice?', '[{"label":"A","text":"£7,200"},{"label":"B","text":"£7,450"},{"label":"C","text":"£8,640"},{"label":"D","text":"£8,890"},{"label":"E","text":"£10,668"}]', 'D', 'Apply the invoice formula from the text using the Gold row (base £1,200, per-head £75).

Step 1: Pre-VAT subtotal = 1,200 + 80 × 75 = 1,200 + 6,000 = £7,200.

Step 2: Add 20% VAT: 7,200 × 1.20 = £8,640.

Step 3: Add the £250 service charge: 8,640 + 250 = £8,890.

The answer is £8,890.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-91'), 'practice-qr-set-91-q2', 'How much more does the Platinum package charge per head compared with the Silver package?', '[{"label":"A","text":"£20"},{"label":"B","text":"£35"},{"label":"C","text":"£55"},{"label":"D","text":"£75"},{"label":"E","text":"£110"}]', 'C', 'Read the per-head prices from the table: Platinum is £110 and Silver is £55. Difference = 110 − 55 = £55. The answer is £55.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-91'), 'practice-qr-set-91-q3', 'A couple was charged a final invoice of £7,810 for the Silver package. How many guests attended the wedding?', '[{"label":"A","text":"80"},{"label":"B","text":"90"},{"label":"C","text":"100"},{"label":"D","text":"115"},{"label":"E","text":"125"}]', 'C', 'Work backwards through the invoice formula, peeling off the service charge and then the VAT.

Step 1: Remove the £250 service charge: 7,810 − 250 = £7,560 (this is the VAT-inclusive figure).

Step 2: Remove 20% VAT by dividing by 1.20: 7,560 ÷ 1.20 = £6,300 (this is the pre-VAT subtotal).

Step 3: Subtract the Silver base fee: 6,300 − 800 = £5,500 (this is guests × per-head).

Step 4: Divide by the £55 per-head price: 5,500 ÷ 55 = 100 guests.

The answer is 100.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-91'), 'practice-qr-set-91-q4', 'What is the final invoice for a Platinum package with 120 guests?', '[{"label":"A","text":"£15,000"},{"label":"B","text":"£15,250"},{"label":"C","text":"£18,000"},{"label":"D","text":"£18,250"},{"label":"E","text":"£21,900"}]', 'D', 'Apply the invoice formula from the text using the Platinum row (base £1,800, per-head £110).

Step 1: Pre-VAT subtotal = 1,800 + 120 × 110 = 1,800 + 13,200 = £15,000.

Step 2: Add 20% VAT: 15,000 × 1.20 = £18,000.

Step 3: Add the £250 service charge: 18,000 + 250 = £18,250.

The answer is £18,250.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-92'), 'practice-qr-set-92-q1', 'What was Alice’s weekly mileage in Week 5?', '[{"label":"A","text":"28"},{"label":"B","text":"32"},{"label":"C","text":"36"},{"label":"D","text":"40"},{"label":"E","text":"44"}]', 'C', 'Read the Alice line at Week 5 directly from the graph — it sits at 36 miles. The answer is 36.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-92'), 'practice-qr-set-92-q2', 'What was Carla’s total mileage across the first four weeks of training?', '[{"label":"A","text":"151"},{"label":"B","text":"155"},{"label":"C","text":"161"},{"label":"D","text":"165"},{"label":"E","text":"171"}]', 'C', 'Sum Carla’s values for Weeks 1 to 4: 35 + 38 + 42 + 46 = 161 miles. The answer is 161.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-92'), 'practice-qr-set-92-q3', 'Given that Ben’s 12-week mean mileage was 42 miles per week, what was his Week 6 mileage?', '[{"label":"A","text":"38"},{"label":"B","text":"40"},{"label":"C","text":"42"},{"label":"D","text":"44"},{"label":"E","text":"46"}]', 'D', 'Use the mean to back-calculate the missing value: Week 6 = (mean × number of weeks) − sum of the other eleven weeks.

Step 1: Total mileage across 12 weeks = 42 × 12 = 504.

Step 2: Sum of the eleven logged weeks = 25 + 28 + 32 + 36 + 40 + 44 + 48 + 50 + 52 + 50 + 55 = 460.

Step 3: Week 6 value = 504 − 460 = 44.

The answer is 44.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-92'), 'practice-qr-set-92-q4', 'By what percentage did Alice’s weekly mileage increase from Week 1 to Week 10, to the nearest whole percent?', '[{"label":"A","text":"28%"},{"label":"B","text":"58%"},{"label":"C","text":"100%"},{"label":"D","text":"140%"},{"label":"E","text":"240%"}]', 'D', 'Percentage increase = (new − old) ÷ old × 100, using the Week 1 value (the original) as the denominator.

Step 1: Read Alice’s Week 1 value = 20 and Week 10 value = 48.

Step 2: Increase = 48 − 20 = 28.

Step 3: Percentage = 28 ÷ 20 × 100 = 140%.

The answer is 140%.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-93'), 'practice-qr-set-93-q1', 'How much income did the event receive from Sponsorship?', '[{"label":"A","text":"£12,000"},{"label":"B","text":"£18,000"},{"label":"C","text":"£30,000"},{"label":"D","text":"£45,000"},{"label":"E","text":"£125,000"}]', 'C', 'Read the Sponsorship segment directly from the legend — £30,000. The answer is £30,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-93'), 'practice-qr-set-93-q2', 'What percentage of total income came from Ticket Sales?', '[{"label":"A","text":"30%"},{"label":"B","text":"36%"},{"label":"C","text":"40%"},{"label":"D","text":"45%"},{"label":"E","text":"60%"}]', 'B', 'Percentage = Ticket Sales ÷ Total × 100 = 45,000 ÷ 125,000 × 100 = 36%. The answer is 36%.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-93'), 'practice-qr-set-93-q3', 'How much income did the event raise from Merchandise sales?', '[{"label":"A","text":"£5,000"},{"label":"B","text":"£7,500"},{"label":"C","text":"£12,000"},{"label":"D","text":"£12,500"},{"label":"E","text":"£17,500"}]', 'B', 'The six segments sum to the stated total of £125,000, so Merchandise = total − sum of the known segments.

Step 1: Sum of the known segments = 45,000 + 30,000 + 18,000 + 12,500 + 12,000 = £117,500.

Step 2: Merchandise = 125,000 − 117,500 = £7,500.

The answer is £7,500.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-93'), 'practice-qr-set-93-q4', 'The event ran up costs of £8,400, which the charity deducted from gross income. What percentage of the resulting net income came from Ticket Sales, to the nearest 0.1%?', '[{"label":"A","text":"36.0%"},{"label":"B","text":"38.6%"},{"label":"C","text":"40.1%"},{"label":"D","text":"45.0%"},{"label":"E","text":"48.2%"}]', 'B', 'Work out the net income first, then express Ticket Sales as a percentage of that net figure.

Step 1: Net income = gross − costs = 125,000 − 8,400 = £116,600.

Step 2: Ticket Sales share of net = 45,000 ÷ 116,600 × 100 = 38.594...%.

Step 3: Rounded to 0.1% = 38.6%.

The answer is 38.6%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-94'), 'practice-qr-set-94-q1', 'What is the total floor area of the main hall, in square metres?', '[{"label":"A","text":"147 m²"},{"label":"B","text":"210 m²"},{"label":"C","text":"252 m²"},{"label":"D","text":"294 m²"},{"label":"E","text":"315 m²"}]', 'C', 'Split the L-shape into two rectangles using the step at the 7 m mark down the right side.

Step 1: Upper rectangle = 15 m wide × 7 m tall = 105 m².

Step 2: Lower rectangle spans the full width at the bottom = 21 m wide × (14 − 7) m tall = 21 × 7 = 147 m².

Step 3: Total area = 105 + 147 = 252 m².

The answer is 252 m².', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-94'), 'practice-qr-set-94-q2', 'What is the perimeter of the main hall floor?', '[{"label":"A","text":"64 m"},{"label":"B","text":"66 m"},{"label":"C","text":"68 m"},{"label":"D","text":"70 m"},{"label":"E","text":"72 m"}]', 'D', 'Trace the outer boundary all the way round, deriving the two unlabelled edges from the given dimensions.

Step 1: The horizontal step = 21 − 15 = 6 m, and the right-lower edge = 14 − 7 = 7 m.

Step 2: Add the six edges: 15 (top) + 7 (right-upper) + 6 (step across) + 7 (right-lower) + 21 (bottom) + 14 (left) = 70 m.

The answer is 70 m.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-94'), 'practice-qr-set-94-q3', 'Vinyl flooring for the whole hall costs £28 per m². What is the total flooring cost?', '[{"label":"A","text":"£4,116"},{"label":"B","text":"£5,880"},{"label":"C","text":"£7,056"},{"label":"D","text":"£8,232"},{"label":"E","text":"£8,820"}]', 'C', 'Cost = total area × rate per m².

Step 1: Total area = 252 m² (from the area calculation).

Step 2: Cost = 252 × £28 = £7,056.

The answer is £7,056.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-94'), 'practice-qr-set-94-q4', 'An alternative proposal uses hardwood (£48 per m²) for the upper rectangle and vinyl (£28 per m²) for the lower rectangle. How much more does this mixed option cost compared with fitting vinyl across the whole hall?', '[{"label":"A","text":"£1,680"},{"label":"B","text":"£2,100"},{"label":"C","text":"£2,940"},{"label":"D","text":"£5,040"},{"label":"E","text":"£9,156"}]', 'B', 'Work out the cost of each option, then take the difference.

Step 1: Full vinyl cost = 252 × £28 = £7,056.

Step 2: Mixed option — upper rectangle in hardwood = 105 × £48 = £5,040.

Step 3: Mixed option — lower rectangle in vinyl = 147 × £28 = £4,116.

Step 4: Mixed total = 5,040 + 4,116 = £9,156.

Step 5: Difference = 9,156 − 7,056 = £2,100.

The answer is £2,100.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-95'), 'practice-qr-set-95-q1', 'Which plot recorded the highest monthly tomato yield?', '[{"label":"A","text":"P2"},{"label":"B","text":"P4"},{"label":"C","text":"P5"},{"label":"D","text":"P6"},{"label":"E","text":"P7"}]', 'E', 'Look for the highest point on the y-axis. P7 sits at 54 kg per month, the top of the plot. The answer is P7.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-95'), 'practice-qr-set-95-q2', 'Plots P1 to P7 follow an upward pattern where yield rises with water use. Which plot is the outlier that breaks this pattern?', '[{"label":"A","text":"P1"},{"label":"B","text":"P3"},{"label":"C","text":"P5"},{"label":"D","text":"P7"},{"label":"E","text":"P8"}]', 'E', 'P1 through P7 rise steadily from 18 kg at 120 L up to 54 kg at 300 L. P8 uses 180 L of water (the same as P3) but yields only 15 kg, well below the 30 kg P3 managed and below every other plot. The answer is P8.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-95'), 'practice-qr-set-95-q3', 'For plot P4, what is the yield expressed as kilograms of tomatoes per 100 litres of water per week, to 1 decimal place?', '[{"label":"A","text":"5.8 kg"},{"label":"B","text":"10.0 kg"},{"label":"C","text":"17.1 kg"},{"label":"D","text":"21.0 kg"},{"label":"E","text":"36.0 kg"}]', 'C', 'Step 1: Read P4 from the plot: 210 litres per week of water, 36 kg per month of tomatoes.

Step 2: Scale the yield to a per-100-litre basis: 36 / 210 * 100 = 17.142..., which rounds to 17.1 kg.

The answer is 17.1 kg.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-95'), 'practice-qr-set-95-q4', 'Ignoring the outlier, what is the mean monthly yield across plots P1 to P7, in kilograms?', '[{"label":"A","text":"30.0 kg"},{"label":"B","text":"33.0 kg"},{"label":"C","text":"36.0 kg"},{"label":"D","text":"39.4 kg"},{"label":"E","text":"42.0 kg"}]', 'C', 'Step 1: Add the yields for P1 to P7: 18 + 24 + 30 + 36 + 42 + 48 + 54 = 252 kg.

Step 2: Divide by the 7 plots: 252 / 7 = 36.0 kg.

The answer is 36.0 kg.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-96'), 'practice-qr-set-96-q1', 'How much does it cost to post a single 1,400 g parcel using the Standard service (no Signed For)?', '[{"label":"A","text":"£5.60"},{"label":"B","text":"£8.40"},{"label":"C","text":"£9.60"},{"label":"D","text":"£10.80"},{"label":"E","text":"£12.10"}]', 'C', 'Step 1: The first 250 g costs a flat £3.20.

Step 2: The next 250 g (from 251 g to 500 g) is charged at 40p per 100 g: 250 / 100 × £0.40 = £1.00.

Step 3: The remaining 900 g (from 501 g to 1,400 g) is charged at 60p per 100 g: 900 / 100 × £0.60 = £5.40.

Step 4: Total = £3.20 + £1.00 + £5.40 = £9.60.

The answer is £9.60.', 0, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-96'), 'practice-qr-set-96-q2', 'What is the Standard-service cost of a 400 g parcel?', '[{"label":"A","text":"£1.60"},{"label":"B","text":"£3.20"},{"label":"C","text":"£3.80"},{"label":"D","text":"£4.80"},{"label":"E","text":"£6.30"}]', 'C', 'Step 1: The first 250 g costs a flat £3.20.

Step 2: The remaining 150 g falls in the 251-500 g band at 40p per 100 g: 150 / 100 × £0.40 = £0.60.

Step 3: Total = £3.20 + £0.60 = £3.80.

The answer is £3.80.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-96'), 'practice-qr-set-96-q3', 'A small business ships three parcels on the same day: a 300 g parcel (Standard), an 800 g parcel (Standard), and a 450 g parcel (Signed For). What is the total postage cost?', '[{"label":"A","text":"£12.40"},{"label":"B","text":"£13.40"},{"label":"C","text":"£15.90"},{"label":"D","text":"£17.40"},{"label":"E","text":"£19.90"}]', 'C', 'Work each parcel out separately, then add.

Step 1: 300 g Standard = £3.20 flat + 50 g at 40p/100 g (£0.20) = £3.40.

Step 2: 800 g Standard = £3.20 flat + 250 g at 40p/100 g (£1.00) + 300 g at 60p/100 g (£1.80) = £6.00.

Step 3: 450 g Signed For = £3.20 flat + 200 g at 40p/100 g (£0.80) + £2.50 Signed For surcharge = £6.50.

Step 4: Total = £3.40 + £6.00 + £6.50 = £15.90.

The answer is £15.90.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-96'), 'practice-qr-set-96-q4', 'Two parcels each weigh 1,200 g. One is sent Standard; the other is sent Signed For. By what percentage is the Signed For cost higher than the Standard cost, to 1 decimal place?', '[{"label":"A","text":"20.8%"},{"label":"B","text":"22.9%"},{"label":"C","text":"25.0%"},{"label":"D","text":"29.8%"},{"label":"E","text":"31.3%"}]', 'D', 'Step 1: Standard cost for 1,200 g = £3.20 flat + 250 g at 40p/100 g (£1.00) + 700 g at 60p/100 g (£4.20) = £8.40.

Step 2: Signed For cost = £8.40 + £2.50 = £10.90.

Step 3: Percentage higher = (£10.90 - £8.40) / £8.40 × 100 = £2.50 / £8.40 × 100 = 29.76%, which rounds to 29.8%.

The answer is 29.8%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-97'), 'practice-qr-set-97-q1', 'Which month had the highest number of visitors?', '[{"label":"A","text":"April"},{"label":"B","text":"May"},{"label":"C","text":"June"},{"label":"D","text":"July"},{"label":"E","text":"August"}]', 'D', 'Look for the tallest bar. July sits at 2,800 visitors, higher than any other month on the chart. The answer is July.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-97'), 'practice-qr-set-97-q2', 'What was the total number of visitors across the whole year (November is excluded because the observatory was closed)?', '[{"label":"A","text":"16,400"},{"label":"B","text":"17,400"},{"label":"C","text":"18,400"},{"label":"D","text":"19,400"},{"label":"E","text":"20,400"}]', 'C', 'Step 1: Add the 11 recorded months: 800 + 900 + 1,200 + 1,500 + 2,000 + 2,400 + 2,800 + 2,600 + 1,800 + 1,400 + 1,000.

Step 2: Running total: 800 + 900 = 1,700; + 1,200 = 2,900; + 1,500 = 4,400; + 2,000 = 6,400; + 2,400 = 8,800; + 2,800 = 11,600; + 2,600 = 14,200; + 1,800 = 16,000; + 1,400 = 17,400; + 1,000 = 18,400.

The answer is 18,400.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-97'), 'practice-qr-set-97-q3', 'What was the mean number of visitors per month across the 11 months the observatory was open, to the nearest whole visitor?', '[{"label":"A","text":"1,533"},{"label":"B","text":"1,600"},{"label":"C","text":"1,673"},{"label":"D","text":"1,840"},{"label":"E","text":"2,044"}]', 'C', 'Step 1: The total for the 11 open months is 18,400 visitors (from the previous calculation).

Step 2: Mean = 18,400 / 11 = 1,672.72..., which rounds to 1,673.

The answer is 1,673.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-97'), 'practice-qr-set-97-q4', 'From the peak month to December, by what percentage did monthly visitors decrease, to 1 decimal place?', '[{"label":"A","text":"35.7%"},{"label":"B","text":"55.6%"},{"label":"C","text":"60.0%"},{"label":"D","text":"64.3%"},{"label":"E","text":"180.0%"}]', 'D', 'Step 1: The peak month is July with 2,800 visitors; December recorded 1,000 visitors.

Step 2: Percentage decrease = (old - new) / old × 100 = (2,800 - 1,000) / 2,800 × 100 = 1,800 / 2,800 × 100 = 64.285..., which rounds to 64.3%.

The answer is 64.3%.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-98'), 'practice-qr-set-98-q1', 'How many perennials were sold in the South region?', '[{"label":"A","text":"130"},{"label":"B","text":"150"},{"label":"C","text":"220"},{"label":"D","text":"300"},{"label":"E","text":"900"}]', 'D', 'Find the Perennials row and move across to the South column. The cell where they meet shows 300. The answer is 300.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-98'), 'practice-qr-set-98-q2', 'Which plant type had the highest total sales across all regions (including Online)?', '[{"label":"A","text":"Shrubs"},{"label":"B","text":"Trees"},{"label":"C","text":"Perennials"},{"label":"D","text":"Annuals"},{"label":"E","text":"All equal"}]', 'C', 'Compare the Row Total column: Shrubs 700, Trees 550, Perennials 900, Annuals 550. Perennials is the highest at 900. The answer is Perennials.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-98'), 'practice-qr-set-98-q3', 'Excluding Online sales, what percentage of all Trees sold were sold in the South region, to 1 decimal place?', '[{"label":"A","text":"21.7%"},{"label":"B","text":"36.4%"},{"label":"C","text":"39.2%"},{"label":"D","text":"40.0%"},{"label":"E","text":"45.5%"}]', 'C', 'Step 1: Trees sold across the four physical regions = 80 (North) + 140 (Midlands) + 200 (South) + 90 (West) = 510.

Step 2: Trees sold in the South = 200.

Step 3: Percentage = 200 / 510 × 100 = 39.215..., which rounds to 39.2%.

The answer is 39.2%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-98'), 'practice-qr-set-98-q4', 'How many plants in total were sold in the Midlands region?', '[{"label":"A","text":"380"},{"label":"B","text":"450"},{"label":"C","text":"700"},{"label":"D","text":"920"},{"label":"E","text":"2,700"}]', 'C', 'Read the Column Total row at the Midlands column. It shows 700, the sum of 180 + 140 + 220 + 160 across the four plant types. The answer is 700.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-99'), 'practice-qr-set-99-q1', 'What is the total internal volume of the pool, in cubic metres?', '[{"label":"A","text":"13.5 m³"},{"label":"B","text":"32.0 m³"},{"label":"C","text":"48.0 m³"},{"label":"D","text":"64.0 m³"},{"label":"E","text":"96.0 m³"}]', 'C', 'Step 1: Volume of a cuboid = length × width × depth.

Step 2: Volume = 8 × 4 × 1.5 = 48 m³.

The answer is 48.0 m³.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-99'), 'practice-qr-set-99-q2', 'How many litres of water are needed to fill the pool completely?', '[{"label":"A","text":"4,800 L"},{"label":"B","text":"24,000 L"},{"label":"C","text":"32,000 L"},{"label":"D","text":"48,000 L"},{"label":"E","text":"480,000 L"}]', 'D', 'Step 1: The pool volume is 48 m³ (from Question 1).

Step 2: Using 1 m³ = 1,000 L, multiply: 48 × 1,000 = 48,000 L.

The answer is 48,000 L.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-99'), 'practice-qr-set-99-q3', 'The homeowner adds chlorine at a rate of 5 grams per 10,000 litres of water. How many grams of chlorine are needed for the full pool?', '[{"label":"A","text":"9.6 g"},{"label":"B","text":"12.0 g"},{"label":"C","text":"24.0 g"},{"label":"D","text":"48.0 g"},{"label":"E","text":"240.0 g"}]', 'C', 'Step 1: The pool holds 48,000 L of water.

Step 2: Work out how many 10,000 L blocks this is: 48,000 / 10,000 = 4.8.

Step 3: Multiply by the 5 g dose per block: 4.8 × 5 = 24 g.

The answer is 24.0 g.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-99'), 'practice-qr-set-99-q4', 'Water flows into the pool from a hose at 40 litres per minute. How long does it take to fill the pool completely, in hours?', '[{"label":"A","text":"12 hours"},{"label":"B","text":"15 hours"},{"label":"C","text":"20 hours"},{"label":"D","text":"24 hours"},{"label":"E","text":"30 hours"}]', 'C', 'Step 1: The pool needs 48,000 L.

Step 2: Using time = volume / flow rate: 48,000 / 40 = 1,200 minutes.

Step 3: Convert to hours: 1,200 / 60 = 20 hours.

The answer is 20 hours.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-100'), 'practice-qr-set-100-q1', 'What was the total revenue across all five drink categories in March?', '[{"label":"A","text":"£14,500"},{"label":"B","text":"£19,800"},{"label":"C","text":"£22,000"},{"label":"D","text":"£24,600"},{"label":"E","text":"£29,500"}]', 'C', 'Read each revenue bar and add them: £4,200 + £6,500 + £5,800 + £2,400 + £3,100 = £22,000. The answer is £22,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-100'), 'practice-qr-set-100-q2', 'What was the net profit (revenue minus cost) for the Latte category?', '[{"label":"A","text":"£2,100"},{"label":"B","text":"£4,100"},{"label":"C","text":"£4,400"},{"label":"D","text":"£6,400"},{"label":"E","text":"£8,600"}]', 'C', 'From the Latte bars, revenue = £6,500 and cost = £2,100 (the negative bar represents £2,100 of cost). Net profit = £6,500 − £2,100 = £4,400. The answer is £4,400.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-100'), 'practice-qr-set-100-q3', 'Which drink category had the highest net profit as a percentage of its revenue?', '[{"label":"A","text":"Espresso"},{"label":"B","text":"Latte"},{"label":"C","text":"Cappuccino"},{"label":"D","text":"Tea"},{"label":"E","text":"Iced Drinks"}]', 'A', 'Net profit margin = (revenue − cost) ÷ revenue × 100 for each category.

Step 1: Espresso = (4,200 − 1,200) ÷ 4,200 × 100 = 3,000 ÷ 4,200 × 100 = 71.4%.

Step 2: Latte = (6,500 − 2,100) ÷ 6,500 × 100 = 4,400 ÷ 6,500 × 100 = 67.7%.

Step 3: Cappuccino = (5,800 − 1,900) ÷ 5,800 × 100 = 3,900 ÷ 5,800 × 100 = 67.2%.

Step 4: Tea = (2,400 − 900) ÷ 2,400 × 100 = 1,500 ÷ 2,400 × 100 = 62.5%.

Step 5: Iced Drinks = (3,100 − 1,400) ÷ 3,100 × 100 = 1,700 ÷ 3,100 × 100 = 54.8%.

Espresso is highest at 71.4%. The answer is Espresso.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-100'), 'practice-qr-set-100-q4', 'The shop plans to raise Latte prices by 12% in April. If sales volume and Latte costs are unchanged, what will the new net profit for Latte be?', '[{"label":"A","text":"£4,928"},{"label":"B","text":"£5,060"},{"label":"C","text":"£5,180"},{"label":"D","text":"£7,168"},{"label":"E","text":"£7,280"}]', 'C', 'Step 1: New revenue = £6,500 × 1.12 = £7,280.

Step 2: Cost is unchanged at £2,100, so new net profit = £7,280 − £2,100 = £5,180.

The answer is £5,180.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-101'), 'practice-qr-set-101-q1', 'How many Starling sightings were recorded in Q3?', '[{"label":"A","text":"220"},{"label":"B","text":"240"},{"label":"C","text":"260"},{"label":"D","text":"280"},{"label":"E","text":"1,000"}]', 'D', 'Find the Starling row, then move across to the Q3 column. The cell reads 280. The answer is 280.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-101'), 'practice-qr-set-101-q2', 'How many Robin sightings were made in Q4?', '[{"label":"A","text":"150"},{"label":"B","text":"160"},{"label":"C","text":"170"},{"label":"D","text":"180"},{"label":"E","text":"200"}]', 'C', 'The context gives you the mean quarterly sightings for Robin as 162.5 across 4 quarters.

Step 1: Annual total for Robin = mean × number of quarters = 162.5 × 4 = 650.

Step 2: Sum of known Q1–Q3 = 150 + 160 + 170 = 480.

Step 3: Q4 = 650 − 480 = 170.

The answer is 170.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-101'), 'practice-qr-set-101-q3', 'By what percentage did Swift sightings change from Q1 to Q3?', '[{"label":"A","text":"46.7%"},{"label":"B","text":"50.0%"},{"label":"C","text":"70.0%"},{"label":"D","text":"87.5%"},{"label":"E","text":"187.5%"}]', 'D', 'Percentage change uses the original value as the denominator: (new − old) ÷ old × 100.

Step 1: From the Swift row, Q1 = 80 and Q3 = 150.

Step 2: (150 − 80) ÷ 80 × 100 = 70 ÷ 80 × 100 = 87.5%.

The answer is 87.5%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-101'), 'practice-qr-set-101-q4', 'What was the mean quarterly number of Skylark sightings?', '[{"label":"A","text":"125.0"},{"label":"B","text":"127.5"},{"label":"C","text":"130.0"},{"label":"D","text":"132.5"},{"label":"E","text":"140.0"}]', 'D', 'From the Skylark row, the annual total is 530 across 4 quarters. Mean = 530 ÷ 4 = 132.5. The answer is 132.5.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-102'), 'practice-qr-set-102-q1', 'A client is sent a Logo Design invoice for £1,200 including VAT. What is the VAT-exclusive amount?', '[{"label":"A","text":"£960"},{"label":"B","text":"£980"},{"label":"C","text":"£1,000"},{"label":"D","text":"£1,080"},{"label":"E","text":"£1,440"}]', 'C', 'This is a reverse percentage — the £1,200 already includes 20% VAT, so you divide by 1.2 to strip the VAT out. £1,200 ÷ 1.2 = £1,000. The answer is £1,000.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-102'), 'practice-qr-set-102-q2', 'A Branding Package takes 40 hours at the base rate. What is the VAT-inclusive invoice amount?', '[{"label":"A","text":"£3,400"},{"label":"B","text":"£3,740"},{"label":"C","text":"£4,080"},{"label":"D","text":"£4,250"},{"label":"E","text":"£4,420"}]', 'C', 'Step 1: From the table, the Branding Package base rate is £85/hr. VAT-exclusive fee = 40 × £85 = £3,400.

Step 2: Add 20% VAT: £3,400 × 1.2 = £4,080.

The answer is £4,080.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-102'), 'practice-qr-set-102-q3', 'In March, the designer billed clients a total of £3,000 VAT-exclusive across several projects. How much does she keep after applying the commission structure?', '[{"label":"A","text":"£2,100"},{"label":"B","text":"£2,200"},{"label":"C","text":"£2,400"},{"label":"D","text":"£2,500"},{"label":"E","text":"£2,700"}]', 'B', 'The tier splits VAT-exclusive billings into a first £2,000 at 70% and anything above £2,000 at 80%.

Step 1: First £2,000 kept = £2,000 × 0.70 = £1,400.

Step 2: Amount above £2,000 = £3,000 − £2,000 = £1,000. Kept = £1,000 × 0.80 = £800.

Step 3: Total kept = £1,400 + £800 = £2,200.

The answer is £2,200.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-102'), 'practice-qr-set-102-q4', 'In May, the designer sent clients invoices totalling £4,800 VAT-inclusive. How much does she keep after applying the commission structure?', '[{"label":"A","text":"£2,800"},{"label":"B","text":"£3,000"},{"label":"C","text":"£3,200"},{"label":"D","text":"£3,360"},{"label":"E","text":"£3,840"}]', 'B', 'The commission structure is applied to VAT-exclusive revenue, so strip the VAT out first.

Step 1: VAT-exclusive billings = £4,800 ÷ 1.2 = £4,000.

Step 2: First £2,000 kept = £2,000 × 0.70 = £1,400.

Step 3: Amount above £2,000 = £4,000 − £2,000 = £2,000. Kept = £2,000 × 0.80 = £1,600.

Step 4: Total kept = £1,400 + £1,600 = £3,000.

The answer is £3,000.', 3, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-103'), 'practice-qr-set-103-q1', 'When every plot is rented at the standard monthly rate, what is the garden''s total monthly rental income?', '[{"label":"A","text":"£360"},{"label":"B","text":"£468"},{"label":"C","text":"£480"},{"label":"D","text":"£528"},{"label":"E","text":"£588"}]', 'D', 'Step 1: Standard plot income = 30 × £12 = £360.

Step 2: Large plot income = 6 × £28 = £168.

Step 3: Total = £360 + £168 = £528.

The answer is £528.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-103'), 'practice-qr-set-103-q2', 'Maya rents a standard plot, pays for 6 months upfront, and also takes the optional tool rental. How much does she pay in total?', '[{"label":"A","text":"£64.80"},{"label":"B","text":"£72.00"},{"label":"C","text":"£79.80"},{"label":"D","text":"£81.60"},{"label":"E","text":"£87.00"}]', 'C', 'Step 1: Apply the 10% upfront discount to the monthly fee: £12 × (1 − 0.10) = £12 × 0.90 = £10.80.

Step 2: Six months at the discounted rate = 6 × £10.80 = £64.80.

Step 3: Add the tool rental (not discounted): £64.80 + £15.00 = £79.80.

The answer is £79.80.', 1, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-103'), 'practice-qr-set-103-q3', 'What percentage of the garden''s total monthly rental income comes from the large plots?', '[{"label":"A","text":"16.7%"},{"label":"B","text":"25.0%"},{"label":"C","text":"31.8%"},{"label":"D","text":"50.0%"},{"label":"E","text":"68.2%"}]', 'C', 'Step 1: Large plot income = 6 × £28 = £168.

Step 2: Total income = £360 + £168 = £528.

Step 3: Large plot share = 168 ÷ 528 × 100 = 31.8%.

The answer is 31.8%.', 2, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-103'), 'practice-qr-set-103-q4', 'How much rent has Raymond paid in total since he first took on his plot?', '[{"label":"A","text":"£336"},{"label":"B","text":"£504"},{"label":"C","text":"£672"},{"label":"D","text":"£840"},{"label":"E","text":"Can''t Tell"}]', 'E', 'The stimulus tells you Raymond holds a large plot, but it does not say how long he has been renting it or whether he has ever paid upfront for any period. Without knowing the number of months he has held the plot, his total rent to date cannot be calculated. The answer is Can''t Tell.', 3, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-104'), 'practice-qr-set-104-q1', 'How many tickets were sold to 16–30 year olds across the whole weekend?', '[{"label":"A","text":"280"},{"label":"B","text":"320"},{"label":"C","text":"370"},{"label":"D","text":"420"},{"label":"E","text":"480"}]', 'C', 'Read the 16–30 bars for each day: Friday 90, Saturday 160, Sunday 120. Add them: 90 + 160 + 120 = 370. The answer is 370.', 0, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-104'), 'practice-qr-set-104-q2', 'Which age group had the highest total ticket sales across the weekend?', '[{"label":"A","text":"Under 16"},{"label":"B","text":"16–30"},{"label":"C","text":"31–60"},{"label":"D","text":"60+"},{"label":"E","text":"All four are equal"}]', 'B', 'Sum each age group across all three days.

Step 1: Under 16 = 40 + 70 + 55 = 165.

Step 2: 16–30 = 90 + 160 + 120 = 370.

Step 3: 31–60 = 80 + 120 + 100 = 300.

Step 4: 60+ = 30 + 50 + 45 = 125.

16–30 is the highest at 370. The answer is 16–30.', 1, 'normal'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-104'), 'practice-qr-set-104-q3', 'What percentage of total weekend ticket sales occurred on Saturday, to the nearest 0.1%?', '[{"label":"A","text":"33.3%"},{"label":"B","text":"38.9%"},{"label":"C","text":"41.7%"},{"label":"D","text":"44.4%"},{"label":"E","text":"50.0%"}]', 'C', 'Step 1: Saturday total = 70 + 160 + 120 + 50 = 400.

Step 2: Friday total = 40 + 90 + 80 + 30 = 240. Sunday total = 55 + 120 + 100 + 45 = 320. Weekend total = 240 + 400 + 320 = 960.

Step 3: Saturday share = 400 ÷ 960 × 100 = 41.67%, which rounds to 41.7%.

The answer is 41.7%.', 2, 'hard'),
  ((SELECT id FROM quantitative_reasoning_sets WHERE set_ref = 'practice-qr-set-104'), 'practice-qr-set-104-q4', 'Using the ticket prices given, what was the total weekend ticket revenue?', '[{"label":"A","text":"£8,040"},{"label":"B","text":"£9,120"},{"label":"C","text":"£9,600"},{"label":"D","text":"£10,030"},{"label":"E","text":"£11,520"}]', 'D', 'Step 1: Under 16 total = 40 + 70 + 55 = 165 tickets at £6 each = 165 × £6 = £990.

Step 2: 16–30 total = 90 + 160 + 120 = 370 tickets at the Standard price £12 = 370 × £12 = £4,440.

Step 3: 31–60 total = 80 + 120 + 100 = 300 tickets at £12 = 300 × £12 = £3,600.

Step 4: 60+ total = 30 + 50 + 45 = 125 tickets at £8 = 125 × £8 = £1,000.

Step 5: Total revenue = £990 + £4,440 + £3,600 + £1,000 = £10,030.

The answer is £10,030.', 3, 'hard');