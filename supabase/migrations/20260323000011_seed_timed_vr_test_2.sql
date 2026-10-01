-- Seed: Timed VR Test 2 (test_id = 2)

DO $$
DECLARE
  v_p01 UUID; v_p02 UUID; v_p03 UUID; v_p04 UUID; v_p05 UUID;
  v_p06 UUID; v_p07 UUID; v_p08 UUID; v_p09 UUID; v_p10 UUID;
  v_p11 UUID;
BEGIN

  INSERT INTO timed_verbal_reasoning_tests (id, title, time_minutes)
  VALUES (2, 'VR Timed Test 2', 22)
  ON CONFLICT (id) DO NOTHING;

  -- ── Passage 1 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 1 — The Domestication of Dogs',
    'Dogs are widely considered to be the first domesticated animal, with genetic and archaeological evidence suggesting that domestication from wolves occurred at least 15,000 years ago, though some studies place the event considerably earlier. Unlike later domesticated species — such as cattle and sheep, which were bred primarily for food and labour — dogs appear to have been domesticated principally as companions and hunting aids. The process was not a sudden event but rather a gradual one, likely beginning when wolves started scavenging near human camps and the least fearful individuals were tolerated and eventually incorporated into the group. Over generations, these wolves evolved distinct behavioural traits: reduced aggression, increased sociability, and a remarkable sensitivity to human communicative cues such as pointing and gaze direction — abilities that even our closest primate relatives, chimpanzees, demonstrate only weakly. Domestication also produced physical changes, including floppy ears, shortened snouts, and coat variation, features associated with what researchers call the ''domestication syndrome.'' Today, with hundreds of recognised breeds, dogs occupy a unique ecological niche as the animal most intimately integrated into human social life, appearing in roles ranging from assistance and therapy to law enforcement and search-and-rescue.',
    0
  ) RETURNING id INTO v_p01;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p01, 'According to the passage, what most likely initiated the domestication of wolves?',
      ARRAY['Humans captured wolf cubs and raised them deliberately', 'Wolves began scavenging near human settlements and the least fearful were tolerated', 'Early humans selectively bred wolves for hunting purposes from the outset', 'A sudden genetic mutation caused wolves to lose their aggression towards humans'],
      'Wolves began scavenging near human settlements and the least fearful were tolerated',
      'The passage states the process ''likely began when wolves started scavenging near human camps and the least fearful individuals were tolerated and eventually incorporated into the group.''',
      0),
    (v_p01, 'Dogs are unique among domesticated animals in that they were bred primarily for companionship and hunting rather than food or labour.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage contrasts dogs with cattle and sheep — domesticated for food and labour — and states dogs ''appear to have been domesticated principally as companions and hunting aids.''',
      1),
    (v_p01, 'Which of the following best describes what the passage means by ''domestication syndrome''?',
      ARRAY['A set of behavioural problems caused by keeping animals in captivity', 'A collection of physical traits such as floppy ears and coat variation associated with domestication', 'The process by which wild animals gradually lose their survival instincts', 'A genetic disorder found exclusively in domesticated dog breeds'],
      'A collection of physical traits such as floppy ears and coat variation associated with domestication',
      'The passage defines domestication syndrome as physical changes including ''floppy ears, shortened snouts, and coat variation.''',
      2),
    (v_p01, 'Chimpanzees are as capable as dogs at interpreting human communicative cues such as pointing.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states dogs have sensitivity to human cues that ''even our closest primate relatives, chimpanzees, demonstrate only weakly,'' indicating chimpanzees are less capable in this regard.',
      3);

  -- ── Passage 2 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 2 — The Concept of Universal Basic Income',
    'Universal Basic Income (UBI) is a policy proposal in which every citizen of a given state receives a regular, unconditional cash payment from the government, regardless of employment status or other income. Advocates argue that UBI would provide a meaningful safety net in an era of increasing automation, reducing poverty and giving individuals the freedom to pursue education, caregiving, or creative work without the coercive pressure of precarious employment. Several small-scale pilot programmes have been conducted in countries including Finland, Kenya, and Canada, with results generally showing modest improvements in recipients'' wellbeing, mental health, and in some cases employment outcomes — contrary to the assumption that guaranteed income would reduce the motivation to work. Critics of UBI, however, argue that its cost would be prohibitive at a national scale, and that unconditional payments represent an inefficient use of public resources compared with targeted welfare programmes designed to assist those most in need. There are also concerns that a UBI could be used as political justification to dismantle existing social safety nets, leaving vulnerable populations worse off overall. The debate around UBI reflects deeper disagreements about the role of the state, the nature of work, and what societies owe to their members.',
    1
  ) RETURNING id INTO v_p02;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p02, 'According to the passage, what have pilot UBI programmes generally found about recipients'' motivation to work?',
      ARRAY['Recipients largely stopped working once guaranteed income was provided', 'Employment outcomes were unaffected or in some cases improved', 'Recipients worked more hours but in lower-paid jobs', 'The programmes were too short to draw any conclusions about employment'],
      'Employment outcomes were unaffected or in some cases improved',
      'The passage states pilot results showed ''modest improvements in recipients'' wellbeing, mental health, and in some cases employment outcomes — contrary to the assumption that guaranteed income would reduce the motivation to work.''',
      0),
    (v_p02, 'UBI payments are conditional on recipients being in paid employment or actively seeking work.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage defines UBI as ''unconditional cash payment from the government, regardless of employment status or other income.''',
      1),
    (v_p02, 'Which of the following is identified in the passage as a concern critics raise about UBI?',
      ARRAY['It would lead to uncontrolled inflation', 'It could be used to justify removing existing welfare provisions', 'It would disproportionately benefit the wealthy', 'It has already failed in every country where it has been trialled'],
      'It could be used to justify removing existing welfare provisions',
      'The passage states critics worry ''a UBI could be used as political justification to dismantle existing social safety nets, leaving vulnerable populations worse off overall.''',
      2),
    (v_p02, 'The passage suggests that debates about UBI are purely economic in nature.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage concludes that the debate ''reflects deeper disagreements about the role of the state, the nature of work, and what societies owe to their members'' — extending well beyond economics.',
      3);

  -- ── Passage 3 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 3 — The Architecture of Gothic Cathedrals',
    'The Gothic style of architecture, which emerged in northern France during the 12th century and spread throughout Europe over the following three centuries, represented a dramatic departure from the heavier, more enclosed forms of Romanesque building that preceded it. The defining technical innovation of Gothic architecture was the pointed arch, which, combined with the flying buttress — an external arched support that transferred the weight of the roof away from the walls — allowed builders to construct structures of unprecedented height with much thinner walls. This structural ingenuity had profound aesthetic consequences: the walls of Gothic cathedrals could be filled with large stained-glass windows, flooding interiors with coloured light that contemporaries described in explicitly spiritual terms, as a manifestation of divine illumination. The Cathedral of Notre-Dame de Paris, begun in 1163, is among the earliest and most celebrated examples of the Gothic style, though it underwent significant modifications over the centuries. At their most ambitious, Gothic cathedrals took generations to complete, with some — such as Cologne Cathedral in Germany — remaining unfinished for centuries before construction resumed. The style eventually gave way to Renaissance architecture, which looked instead to classical Greek and Roman forms for inspiration, viewing the Gothic as overly elaborate and irrational.',
    2
  ) RETURNING id INTO v_p03;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p03, 'What was the primary structural innovation that allowed Gothic cathedrals to have thinner walls and larger windows?',
      ARRAY['The use of reinforced concrete foundations', 'The combination of the pointed arch and flying buttress', 'The introduction of iron crossbeams within the walls', 'The adoption of domed roofs to distribute weight evenly'],
      'The combination of the pointed arch and flying buttress',
      'The passage identifies the pointed arch combined with the flying buttress as the innovations that ''allowed builders to construct structures of unprecedented height with much thinner walls.''',
      0),
    (v_p03, 'Notre-Dame de Paris was completed exactly as originally designed without any modifications.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states Notre-Dame ''underwent significant modifications over the centuries.''',
      1),
    (v_p03, 'How did contemporaries interpret the effect of stained-glass windows flooding Gothic interiors with coloured light?',
      ARRAY['As a display of the wealth and power of the Church', 'As an artistic achievement with no particular religious meaning', 'As a spiritual phenomenon representing divine illumination', 'As a practical solution to the problem of poor natural lighting'],
      'As a spiritual phenomenon representing divine illumination',
      'The passage states contemporaries described the light ''in explicitly spiritual terms, as a manifestation of divine illumination.''',
      2),
    (v_p03, 'Renaissance architects admired Gothic architecture and sought to develop it further.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states Renaissance architecture ''viewed the Gothic as overly elaborate and irrational,'' turning instead to classical Greek and Roman forms — indicating rejection, not admiration.',
      3);

  -- ── Passage 4 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 4 — The Science of Habit Formation',
    'Habits are automatic behavioural routines triggered by specific contextual cues, and they play a far larger role in daily life than most people consciously recognise. Research by behavioural psychologists suggests that approximately 40 to 45 percent of everyday actions are performed out of habit rather than deliberate decision-making. The neurological basis of habit formation lies in a region of the brain called the basal ganglia, which encodes repeated behavioural sequences into efficient, low-effort routines — a process sometimes described as ''chunking.'' Once a habit is established, the prefrontal cortex — the seat of conscious decision-making — becomes less involved, which is why habitual behaviours feel effortless and are resistant to change. Habits follow a consistent three-part structure identified by researchers: a cue or trigger, a routine or behaviour, and a reward. Understanding this loop has practical implications for behaviour change. Interventions aimed at breaking unhealthy habits — such as smoking or excessive snacking — are generally more effective when they focus on replacing the routine with an alternative behaviour that delivers a similar reward, rather than simply attempting to eliminate the behaviour entirely. Life transitions — moving to a new city, starting a new job, or having a child — have been identified as particularly fertile windows for habit change, as the disruption of familiar cues creates an opportunity to establish new routines.',
    3
  ) RETURNING id INTO v_p04;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p04, 'According to the passage, which part of the brain is primarily responsible for encoding habitual behaviour?',
      ARRAY['The prefrontal cortex', 'The hippocampus', 'The basal ganglia', 'The amygdala'],
      'The basal ganglia',
      'The passage states that ''the neurological basis of habit formation lies in a region of the brain called the basal ganglia, which encodes repeated behavioural sequences into efficient, low-effort routines.''',
      0),
    (v_p04, 'The passage suggests that the most effective way to break a bad habit is to eliminate the behaviour entirely through willpower.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states interventions are ''generally more effective when they focus on replacing the routine with an alternative behaviour that delivers a similar reward, rather than simply attempting to eliminate the behaviour entirely.''',
      1),
    (v_p04, 'Which of the following best explains why major life changes may be good opportunities to form new habits?',
      ARRAY['People tend to be more motivated to improve themselves during transitions', 'Disruption of familiar cues weakens existing habit triggers, creating space for new routines', 'Life changes increase activity in the prefrontal cortex, improving decision-making', 'New environments provide more rewards, making new habits easier to sustain'],
      'Disruption of familiar cues weakens existing habit triggers, creating space for new routines',
      'The passage states that life transitions create ''an opportunity to establish new routines'' because ''the disruption of familiar cues'' opens this window — directly identifying cue disruption as the mechanism.',
      2),
    (v_p04, 'What proportion of daily actions does research suggest are driven by habit rather than conscious choice?',
      ARRAY['Around 10 to 15 percent', 'Around 25 to 30 percent', 'Around 40 to 45 percent', 'Around 60 to 70 percent'],
      'Around 40 to 45 percent',
      'The passage states that ''approximately 40 to 45 percent of everyday actions are performed out of habit rather than deliberate decision-making.''',
      3);

  -- ── Passage 5 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 5 — The History of Cartography',
    'Maps are among the oldest artefacts of human civilisation, with some of the earliest known examples dating to ancient Babylonia around 2300 BCE. For most of history, maps were not simply neutral representations of geography but were deeply shaped by the cultural, religious, and political assumptions of those who made them. Medieval European maps, known as mappae mundi, typically placed Jerusalem at their centre and oriented the map with east at the top — reflecting a theological rather than geographical worldview. It was not until the 15th and 16th centuries, with the explosion of oceanic exploration, that European cartographers began to develop more systematic methods for projecting the curved surface of the Earth onto a flat plane. The Mercator projection, introduced by the Flemish geographer Gerardus Mercator in 1569, became the dominant model for navigation because it preserved the accuracy of compass bearings. However, it also substantially distorted the relative size of land masses, making regions closer to the poles — including Europe and North America — appear far larger than those near the equator, such as Africa and South America. This distortion has since attracted criticism as an inadvertent reinforcement of a Eurocentric worldview, and alternative projections that more accurately represent relative land area have been proposed, though none has fully displaced Mercator in common usage.',
    4
  ) RETURNING id INTO v_p05;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p05, 'Why did medieval European maps typically place Jerusalem at their centre?',
      ARRAY['Jerusalem was geographically located at the centre of the known world at the time', 'The mapmakers were based in Jerusalem and drew from their immediate surroundings outward', 'The placement reflected theological beliefs rather than geographical accuracy', 'Jerusalem was the largest and most populated city in medieval Europe'],
      'The placement reflected theological beliefs rather than geographical accuracy',
      'The passage states that mappae mundi placed Jerusalem at the centre ''reflecting a theological rather than geographical worldview.''',
      0),
    (v_p05, 'The Mercator projection accurately represents the relative size of all land masses across the globe.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states that the Mercator projection ''substantially distorted the relative size of land masses,'' making polar regions appear far larger than equatorial ones.',
      1),
    (v_p05, 'What was the primary reason the Mercator projection became the dominant model for navigation?',
      ARRAY['It was endorsed by the Catholic Church as the most theologically correct representation', 'It was the first projection to depict the Americas with any degree of accuracy', 'It preserved the accuracy of compass bearings, making it practical for navigation', 'It was the simplest projection to reproduce by hand'],
      'It preserved the accuracy of compass bearings, making it practical for navigation',
      'The passage states the Mercator projection ''became the dominant model for navigation because it preserved the accuracy of compass bearings.''',
      2),
    (v_p05, 'Alternative map projections that more accurately show land area have completely replaced the Mercator projection in everyday use.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states that alternative projections have been proposed but ''none has fully displaced Mercator in common usage.''',
      3);

  -- ── Passage 6 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 6 — Antibiotic Resistance: A Growing Crisis',
    'Antibiotic resistance — the ability of bacteria to survive and multiply in the presence of drugs designed to kill them — is widely described by public health authorities as one of the most serious threats to global health in the coming decades. The problem arises naturally through evolution: when a population of bacteria is exposed to an antibiotic, individuals with genetic mutations that allow them to survive will reproduce and pass on those traits, eventually producing resistant strains. This process is dramatically accelerated by the overuse and misuse of antibiotics — for instance, prescribing them for viral infections against which they are ineffective, or using them extensively in livestock farming to promote animal growth. The pipeline of new antibiotics has also slowed considerably, as pharmaceutical companies find the economics of antibiotic development unattractive: a new antibiotic, once developed, is likely to be held in reserve to delay resistance, generating limited commercial returns. The World Health Organisation has identified antibiotic-resistant infections as responsible for a significant and growing number of deaths annually, with projections suggesting the toll could rise dramatically over the coming decades if current trends continue. International efforts to address the crisis include campaigns to reduce unnecessary antibiotic prescribing, improved hygiene standards in healthcare settings, and investment incentives for pharmaceutical research.',
    5
  ) RETURNING id INTO v_p06;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p06, 'According to the passage, why is antibiotic resistance considered a natural phenomenon?',
      ARRAY['Humans have always carried antibiotic-resistant bacteria in their bodies', 'It arises through evolutionary processes when bacteria with resistant mutations survive and reproduce', 'Bacteria naturally produce chemicals that neutralise antibiotics over time', 'Resistance develops because antibiotics are derived from natural organisms'],
      'It arises through evolutionary processes when bacteria with resistant mutations survive and reproduce',
      'The passage explains that resistance ''arises naturally through evolution'' when bacteria with mutations that allow survival ''reproduce and pass on those traits.''',
      0),
    (v_p06, 'Pharmaceutical companies are investing heavily in new antibiotic development due to the scale of the public health crisis.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the pipeline of new antibiotics ''has slowed considerably'' because companies find the economics ''unattractive'' — the opposite of heavy investment.',
      1),
    (v_p06, 'Which of the following does the passage identify as a reason why antibiotic use in livestock contributes to resistance?',
      ARRAY['Animals metabolise antibiotics differently, creating more resistant strains', 'Livestock antibiotics are of a lower quality and therefore less effective', 'Extensive use in farming to promote growth accelerates the development of resistance', 'Animals spread resistant bacteria directly to farmworkers through physical contact'],
      'Extensive use in farming to promote growth accelerates the development of resistance',
      'The passage cites ''using them extensively in livestock farming to promote animal growth'' as an example of misuse that ''dramatically accelerates'' resistance.',
      2),
    (v_p06, 'Why do pharmaceutical companies have limited financial incentive to develop new antibiotics?',
      ARRAY['The science of developing new antibiotics is too complex for current technology', 'Governments have placed price caps on antibiotics that make them unprofitable', 'New antibiotics are likely to be kept in reserve rather than widely sold, limiting commercial returns', 'Consumer demand for new antibiotics is low because existing drugs still work'],
      'New antibiotics are likely to be kept in reserve rather than widely sold, limiting commercial returns',
      'The passage states a new antibiotic ''is likely to be held in reserve to delay resistance, generating limited commercial returns.''',
      3);

  -- ── Passage 7 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 7 — The Psychology of Decision-Making Under Risk',
    'Classical economic theory long assumed that humans make decisions as rational agents, carefully weighing up probabilities and expected outcomes to maximise their utility. The work of psychologists Daniel Kahneman and Amos Tversky, beginning in the 1970s, fundamentally challenged this view. Their research demonstrated that human decision-making under conditions of risk and uncertainty is systematically biased in predictable ways. One of their most influential findings concerns what they termed ''loss aversion'': the observation that people feel the pain of a loss roughly twice as intensely as they feel the pleasure of an equivalent gain. This asymmetry means that individuals will often make irrational choices to avoid losses, even when the mathematically expected outcome of accepting the loss would be superior. A related concept, the ''framing effect,'' shows that the way in which a choice is presented — rather than its objective content — significantly influences the decision made. For example, people respond very differently to a medical treatment described as having a 90 percent survival rate compared with one described as having a 10 percent mortality rate, even though these statements are mathematically identical. Kahneman was awarded the Nobel Prize in Economics in 2002 for this body of work, which gave rise to the field of behavioural economics — an approach that incorporates insights from psychology into economic models of human behaviour.',
    6
  ) RETURNING id INTO v_p07;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p07, 'What does the concept of ''loss aversion'' as described in the passage suggest about human psychology?',
      ARRAY['People are generally unwilling to take any financial risks regardless of potential gains', 'The emotional impact of losing something is felt approximately twice as strongly as gaining something of equal value', 'Humans consistently underestimate the probability of negative outcomes', 'People only make rational decisions when the stakes are sufficiently high'],
      'The emotional impact of losing something is felt approximately twice as strongly as gaining something of equal value',
      'The passage states people ''feel the pain of a loss roughly twice as intensely as they feel the pleasure of an equivalent gain.''',
      0),
    (v_p07, 'Kahneman and Tversky''s research supported the classical economic view of humans as rational decision-makers.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states their work ''fundamentally challenged'' the classical view of rational decision-making, demonstrating instead that decisions are ''systematically biased.''',
      1),
    (v_p07, 'Which of the following best illustrates the ''framing effect'' as described in the passage?',
      ARRAY['A person refuses a bet even though statistically they would gain more than they lose', 'A patient prefers a treatment with a 90% survival rate over one described as having a 10% mortality rate, despite these being the same', 'An investor sells shares at a loss to avoid risking further decline in their value', 'A consumer chooses a more expensive product because it is presented in premium packaging'],
      'A patient prefers a treatment with a 90% survival rate over one described as having a 10% mortality rate, despite these being the same',
      'The passage uses this exact scenario to illustrate the framing effect — that ''the way in which a choice is presented significantly influences the decision made'' even when the content is identical.',
      2),
    (v_p07, 'Amos Tversky was awarded the Nobel Prize in Economics alongside Kahneman in 2002.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage states that Kahneman was awarded the Nobel Prize in 2002 but makes no mention of whether Tversky shared the prize. It cannot be determined from the passage alone.',
      3);

  -- ── Passage 8 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 8 — The Development of the Internet',
    'The internet as we know it today traces its origins to ARPANET, a project funded by the United States Department of Defense in the late 1960s, which was designed to allow multiple computers to communicate across a decentralised network. The decentralised design was partly motivated by concerns about network resilience: a distributed system with no single central node would be more resistant to disruption than one dependent on a single point of failure. Over the following two decades, the network expanded from a small cluster of university and research computers to a broader academic infrastructure. The pivotal transformation came in 1989, when the British computer scientist Tim Berners-Lee, working at the CERN research facility in Switzerland, proposed the World Wide Web — a system of interlinked hypertext documents accessible via the internet. The Web democratised access to information, enabling ordinary users with no technical background to navigate the internet through a graphical interface. Commercial use of the internet expanded rapidly through the 1990s, fuelled by falling costs and the proliferation of personal computers. By the early 2000s, the internet had become a transformative infrastructure underlying commerce, communication, journalism, and entertainment. The subsequent rise of social media platforms in the mid-2000s further shifted the internet from a predominantly read-only resource to an interactive environment in which billions of users generate as well as consume content.',
    7
  ) RETURNING id INTO v_p08;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p08, 'According to the passage, why was ARPANET designed as a decentralised network?',
      ARRAY['To reduce the cost of building and maintaining computer infrastructure', 'To allow the military to monitor communications more efficiently', 'To make the network more resilient by avoiding dependence on a single central point', 'To enable universities in different states to share academic research more easily'],
      'To make the network more resilient by avoiding dependence on a single central point',
      'The passage states the decentralised design was motivated by concerns about ''network resilience,'' as ''a distributed system with no single central node would be more resistant to disruption.''',
      0),
    (v_p08, 'Tim Berners-Lee invented the internet.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage clearly distinguishes between the internet (originating with ARPANET in the 1960s) and the World Wide Web, which Berners-Lee proposed in 1989. He invented the Web, not the internet itself.',
      1),
    (v_p08, 'What key change did the World Wide Web introduce that made the internet accessible to non-technical users?',
      ARRAY['It provided free internet connections to households for the first time', 'It created a graphical interface allowing users to navigate via interlinked documents', 'It reduced the cost of personal computers so more people could afford them', 'It established a universal language that all computers could understand'],
      'It created a graphical interface allowing users to navigate via interlinked documents',
      'The passage states the Web ''democratised access to information, enabling ordinary users with no technical background to navigate the internet through a graphical interface.''',
      2),
    (v_p08, 'The passage suggests that social media fundamentally changed the nature of how users interact with internet content.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states social media ''shifted the internet from a predominantly read-only resource to an interactive environment in which billions of users generate as well as consume content.''',
      3);

  -- ── Passage 9 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 9 — The Role of Coral Reefs in Marine Ecosystems',
    'Coral reefs are among the most biologically diverse ecosystems on Earth, occupying less than one percent of the ocean floor while supporting an estimated 25 percent of all marine species. Often described as the ''rainforests of the sea,'' they provide essential habitat, feeding grounds, and nurseries for thousands of species of fish, invertebrates, and marine mammals. Beyond their ecological importance, reefs provide significant economic and protective benefits to coastal human communities — supporting fisheries that feed hundreds of millions of people, underpinning tourism industries worth billions of dollars annually, and acting as natural barriers that buffer coastlines from storm surges and wave damage. Despite their importance, coral reefs are under severe and accelerating threat. Rising sea temperatures, driven by climate change, cause coral bleaching — a process in which the symbiotic algae that live within coral tissues and provide them with the majority of their nutrients are expelled, leaving the coral pale and vulnerable to disease and death. Ocean acidification, resulting from the absorption of atmospheric carbon dioxide, weakens coral skeletons and impairs their ability to grow. Local pressures including pollution, destructive fishing practices, and coastal development compound these global stressors. Scientists estimate that without substantial reductions in greenhouse gas emissions, the majority of the world''s coral reefs could be severely degraded or lost by the middle of this century.',
    8
  ) RETURNING id INTO v_p09;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p09, 'What does the passage identify as the cause of coral bleaching?',
      ARRAY['Increased pollution from coastal industrial activity damaging coral tissues', 'Rising sea temperatures causing coral to expel the symbiotic algae that provide their nutrients', 'Ocean acidification dissolving the calcium carbonate structures of coral reefs', 'Overfishing removing species that protect coral from disease'],
      'Rising sea temperatures causing coral to expel the symbiotic algae that provide their nutrients',
      'The passage defines bleaching as the process ''in which the symbiotic algae that live within coral tissues and provide them with the majority of their nutrients are expelled,'' driven by ''rising sea temperatures.''',
      0),
    (v_p09, 'Coral reefs cover more than ten percent of the ocean floor.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states coral reefs occupy ''less than one percent of the ocean floor.''',
      1),
    (v_p09, 'According to the passage, what role do coral reefs play for coastal human communities beyond providing food?',
      ARRAY['They provide fresh water through a natural filtration process', 'They support tourism and protect coastlines from storm damage', 'They are a source of raw materials used in traditional medicine', 'They regulate the salinity of coastal waters, making them safe for swimming'],
      'They support tourism and protect coastlines from storm damage',
      'The passage states reefs ''underpin tourism industries worth billions of dollars annually'' and ''act as natural barriers that buffer coastlines from storm surges and wave damage.''',
      2),
    (v_p09, 'Ocean acidification strengthens coral skeletons by increasing the concentration of minerals in seawater.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states ocean acidification ''weakens coral skeletons and impairs their ability to grow'' — the opposite of strengthening them.',
      3);

  -- ── Passage 10 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 10 — The Life and Work of Marie Curie',
    'Marie Curie remains one of the most celebrated scientists in history, and her achievements are all the more remarkable given the formidable barriers she faced as a woman in 19th and early 20th century science. Born Maria Sklodowska in Warsaw in 1867, she moved to Paris to pursue higher education at a time when Polish universities did not admit women. She earned degrees in both physics and mathematics from the Sorbonne, graduating first in her physics degree. Working alongside her husband Pierre Curie, she conducted pioneering research into radioactivity — a term she herself coined — and discovered two new elements: polonium, named after her homeland, and radium. In 1903, she became the first woman to be awarded a Nobel Prize, receiving it in Physics jointly with Pierre and Henri Becquerel. Following Pierre''s death in a road accident in 1906, she took over his professorship at the Sorbonne, becoming its first female professor. In 1911 she received a second Nobel Prize, this time in Chemistry, making her the first person — and still one of very few — to win Nobel Prizes in two different scientific disciplines. Her later years were devoted to medical applications of radioactivity, including the development of mobile X-ray units used during the First World War. It is now understood that prolonged exposure to radioactive materials significantly damaged her health, and she died in 1934 from aplastic anaemia.',
    9
  ) RETURNING id INTO v_p10;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p10, 'Which of the following best explains why Marie Curie moved from Warsaw to Paris to study?',
      ARRAY['The University of Paris had the best physics faculty in the world at the time', 'She had been offered a research scholarship by the Sorbonne', 'Polish universities did not accept female students', 'She wished to collaborate directly with French scientists working on radioactivity'],
      'Polish universities did not accept female students',
      'The passage states she moved to Paris ''to pursue higher education at a time when Polish universities did not admit women.''',
      0),
    (v_p10, 'Marie Curie was the first person ever to win two Nobel Prizes.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage states she was ''the first person — and still one of very few — to win Nobel Prizes in two different scientific disciplines,'' but does not state she was the first person to win two Nobel Prizes overall. These are different claims.',
      1),
    (v_p10, 'What does the passage suggest was a significant consequence of Marie Curie''s research work on her personal health?',
      ARRAY['She suffered severe depression following the death of her husband', 'Extended contact with radioactive materials caused the illness from which she died', 'The physical demands of laboratory work caused chronic back problems', 'She contracted tuberculosis while working in field hospitals during the First World War'],
      'Extended contact with radioactive materials caused the illness from which she died',
      'The passage states that ''prolonged exposure to radioactive materials significantly damaged her health, and she died in 1934 from aplastic anaemia.''',
      2),
    (v_p10, 'Marie Curie became a professor at the Sorbonne after her husband''s death.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that ''following Pierre''s death in a road accident in 1906, she took over his professorship at the Sorbonne, becoming its first female professor.''',
      3);

  -- ── Passage 11 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    2,
    'Passage 11 — The Philosophy of Stoicism',
    'Stoicism is a school of philosophy founded in Athens around 300 BCE by the philosopher Zeno of Citium, who taught at a painted porch — the ''Stoa Poikile'' — from which the movement takes its name. The Stoics held that the path to a good life lay not in the accumulation of external goods such as wealth, status, or pleasure, but in the cultivation of virtue and rational self-discipline. Central to Stoic thought is the distinction between what is ''up to us'' — our own judgements, desires, and responses — and what is not, including health, reputation, and material circumstances. Stoics argued that emotional suffering arises principally from our judgements about events, rather than from the events themselves: it is not misfortune that distresses us, but our belief that misfortune is harmful. By learning to distinguish between what lies within our control and accepting with equanimity what does not, individuals could achieve a stable inner freedom impervious to external circumstance. Stoicism flourished particularly in Rome, where figures including the statesman Cicero, the slave-philosopher Epictetus, and the Emperor Marcus Aurelius engaged deeply with its ideas. The writings of Marcus Aurelius — his personal journal, published posthumously as the Meditations — remain widely read today. In recent decades, Stoic principles have been adapted into modern psychological therapies, most notably Cognitive Behavioural Therapy, which shares the Stoic insight that it is our interpretations of events, rather than events themselves, that determine our emotional responses.',
    10
  ) RETURNING id INTO v_p11;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p11, 'What does the passage identify as the origin of the name ''Stoicism''?',
      ARRAY['It derives from the Greek word for wisdom, reflecting the movement''s emphasis on rational thought', 'It was named after Zeno of Citium''s birthplace on the island of Cyprus', 'It comes from the painted porch where Zeno taught, the Stoa Poikile', 'It was coined by Roman philosophers who later adopted and renamed the movement'],
      'It comes from the painted porch where Zeno taught, the Stoa Poikile',
      'The passage states Zeno ''taught at a painted porch — the Stoa Poikile — from which the movement takes its name.''',
      0),
    (v_p11, 'According to the Stoics, emotional suffering is caused directly by unfortunate events themselves.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states the Stoic position that ''it is not misfortune that distresses us, but our belief that misfortune is harmful'' — locating the cause in our judgements, not the events.',
      1),
    (v_p11, 'Which of the following best describes the connection the passage draws between Stoicism and Cognitive Behavioural Therapy?',
      ARRAY['Both were developed by the same group of philosophers working in ancient Rome', 'Both emphasise that our interpretations of events shape our emotional responses more than the events themselves', 'Both advocate for the complete elimination of all emotional responses to external events', 'Both recommend accumulating wealth and status as a route to psychological resilience'],
      'Both emphasise that our interpretations of events shape our emotional responses more than the events themselves',
      'The passage states CBT ''shares the Stoic insight that it is our interpretations of events, rather than events themselves, that determine our emotional responses.''',
      2),
    (v_p11, 'Marcus Aurelius published his personal journal, the Meditations, himself during his lifetime.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage describes the Meditations as ''his personal journal, published posthumously'' — meaning it was published after his death, not by him during his lifetime.',
      3);

END $$;
