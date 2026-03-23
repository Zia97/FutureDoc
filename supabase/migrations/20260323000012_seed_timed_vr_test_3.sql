-- Seed: Timed VR Test 3 (test_id = 3)

DO $$
DECLARE
  v_p01 UUID; v_p02 UUID; v_p03 UUID; v_p04 UUID; v_p05 UUID;
  v_p06 UUID; v_p07 UUID; v_p08 UUID; v_p09 UUID; v_p10 UUID;
  v_p11 UUID;
BEGIN

  INSERT INTO timed_verbal_reasoning_tests (id, title, time_minutes)
  VALUES (3, 'VR Timed Test 3', 22)
  ON CONFLICT (id) DO NOTHING;

  -- ── Passage 1 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 1 — The Galapagos Islands and Evolution',
    'When Charles Darwin arrived at the Galapagos Islands in September 1835 aboard HMS Beagle, he was not yet the revolutionary thinker he would become. The archipelago, located roughly 1,000 kilometres off the coast of Ecuador, had been formed by volcanic activity and was home to a range of species found nowhere else on Earth. Darwin collected specimens of birds, reptiles, and plants across several islands, but it was not during the voyage itself that the significance of his observations became clear. It was only after returning to England, when the ornithologist John Gould identified Darwin''s collected birds as distinct species of finch — each with a beak adapted to the food sources available on its particular island — that Darwin began to develop his ideas about descent with modification. The Galapagos finches became one of the most iconic illustrations of natural selection: isolated populations, facing different environmental pressures, had diverged over generations into separate species. Darwin''s theory, published in On the Origin of Species in 1859, proposed that all species had descended from common ancestors, with new species arising through the gradual accumulation of heritable variations selected by the environment. The book was immediately controversial, challenging both prevailing religious accounts of creation and the scientific consensus of the time.',
    0
  ) RETURNING id INTO v_p01;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p01, 'Darwin immediately recognised the evolutionary significance of the Galapagos finches during his voyage.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states it was ''not during the voyage itself that the significance of his observations became clear,'' but only after Gould identified the birds back in England.',
      0),
    (v_p01, 'According to the passage, what role did John Gould play in the development of Darwin''s theory?',
      ARRAY['He accompanied Darwin on the Beagle voyage and collected specimens alongside him', 'He identified Darwin''s collected birds as distinct finch species, prompting Darwin to develop his ideas', 'He published Darwin''s theory of natural selection in the scientific journal he edited', 'He provided Darwin with funding to conduct further research in the Galapagos'],
      'He identified Darwin''s collected birds as distinct finch species, prompting Darwin to develop his ideas',
      'The passage states it was ''when the ornithologist John Gould identified Darwin''s collected birds as distinct species of finch'' that ''Darwin began to develop his ideas about descent with modification.''',
      1),
    (v_p01, 'What does the passage suggest was the reason different finch populations on separate islands developed different beak shapes?',
      ARRAY['Each island had a different climate that directly altered the birds'' physical features', 'Finches deliberately migrated between islands to find mates with different characteristics', 'Isolated populations faced different environmental pressures and diverged over generations', 'Human settlers on different islands selectively bred the birds for specific traits'],
      'Isolated populations faced different environmental pressures and diverged over generations',
      'The passage states ''isolated populations, facing different environmental pressures, had diverged over generations into separate species.''',
      2),
    (v_p01, 'On the Origin of Species was well received by both the scientific community and the public upon its publication.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the book ''was immediately controversial, challenging both prevailing religious accounts of creation and the scientific consensus of the time.''',
      3);

  -- ── Passage 2 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 2 — The Economics of Healthcare',
    'Healthcare occupies a peculiar position in economic theory because it violates many of the assumptions that underpin standard market models. In a typical market, consumers make informed choices between competing products based on price and quality, and competition between suppliers drives efficiency and lowers costs. Healthcare markets, however, are characterised by profound information asymmetry: patients generally lack the knowledge to evaluate whether a recommended treatment is necessary or whether an alternative might be equally effective at lower cost. This creates a relationship of dependency on medical professionals, who act simultaneously as advisers and — in some systems — as providers with a financial interest in the treatments they recommend. A second distinctive feature of healthcare is the unpredictability of need: unlike most goods, serious illness cannot be planned for, and the costs involved can be catastrophic for individuals without insurance or public provision. For these reasons, most developed countries have chosen not to leave healthcare entirely to market forces, opting instead for systems that blend public funding, regulation, and in some cases direct public provision. However, even within publicly funded systems, debates persist about how to allocate limited resources — whether to fund expensive treatments that benefit a small number of patients or to direct resources towards interventions that deliver broader but more modest benefits across a larger population.',
    1
  ) RETURNING id INTO v_p02;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p02, 'According to the passage, what is meant by ''information asymmetry'' in healthcare markets?',
      ARRAY['Hospitals in wealthy areas have access to better medical information than those in poorer regions', 'Patients typically lack the knowledge to assess whether recommended treatments are necessary or optimal', 'Government health agencies withhold clinical data from the public to avoid causing alarm', 'Medical research is published in technical language that prevents patients from understanding it'],
      'Patients typically lack the knowledge to assess whether recommended treatments are necessary or optimal',
      'The passage defines information asymmetry in this context as patients lacking ''the knowledge to evaluate whether a recommended treatment is necessary or whether an alternative might be equally effective.''',
      0),
    (v_p02, 'The passage argues that healthcare should be fully privatised to introduce competition and reduce costs.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states that ''most developed countries have chosen not to leave healthcare entirely to market forces'' — it does not advocate for privatisation.',
      1),
    (v_p02, 'Which of the following best describes the resource allocation dilemma identified in the passage?',
      ARRAY['Whether to train more doctors or invest in new medical technology', 'Whether to fund costly treatments for few patients or cheaper interventions benefiting many', 'Whether public or private hospitals should receive the majority of government funding', 'Whether to prioritise treating the elderly or younger patients with greater life expectancy'],
      'Whether to fund costly treatments for few patients or cheaper interventions benefiting many',
      'The passage asks ''whether to fund expensive treatments that benefit a small number of patients or to direct resources towards interventions that deliver broader but more modest benefits across a larger population.''',
      2),
    (v_p02, 'The unpredictability of serious illness is identified in the passage as a reason why pure market provision of healthcare is problematic.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that ''serious illness cannot be planned for, and the costs involved can be catastrophic for individuals without insurance or public provision,'' presenting this as a reason most countries do not leave healthcare to market forces.',
      3);

  -- ── Passage 3 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 3 — The History of the Silk Road',
    'The Silk Road was not a single road but a vast network of overland and maritime trade routes connecting China to the Mediterranean world, active from roughly the 2nd century BCE until the 15th century CE. Named by the 19th-century German geographer Ferdinand von Richthofen, the routes facilitated the exchange not only of goods — silk, spices, glassware, and precious metals among them — but also of ideas, religions, and technologies. Buddhism spread from India into Central Asia and China along these routes, while Islam later followed a similar trajectory. Paper-making and printing technology, originating in China, reached the Islamic world and eventually Europe via Silk Road transmission. The routes were not continuously open or uniformly safe; they were vulnerable to banditry and disrupted by the rise and fall of empires, and only the most valuable goods could justify the expense and danger of the full overland journey. The Mongol Empire, at its height in the 13th century, temporarily unified much of the route under a single authority, creating conditions that facilitated travel — as evidenced by the famous journey of Marco Polo, who is said to have travelled from Venice to China. The eventual decline of the Silk Road is often attributed to the rise of European maritime trade routes that bypassed the overland network, offering faster and cheaper alternatives for connecting East and West.',
    2
  ) RETURNING id INTO v_p03;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p03, 'The term ''Silk Road'' was coined during the period when the trade routes were most actively used.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the name was given by ''19th-century German geographer Ferdinand von Richthofen,'' long after the routes had declined in the 15th century.',
      0),
    (v_p03, 'According to the passage, what contribution did the Mongol Empire make to Silk Road trade?',
      ARRAY['The Mongols constructed new paved roads to replace the existing network', 'By unifying much of the route under one authority, they created safer conditions for travel', 'The Mongols introduced paper currency that simplified commercial transactions along the route', 'They established a postal relay system that accelerated the movement of goods'],
      'By unifying much of the route under one authority, they created safer conditions for travel',
      'The passage states the Mongol Empire ''temporarily unified much of the route under a single authority, creating conditions that facilitated travel.''',
      1),
    (v_p03, 'Which of the following technologies does the passage identify as having been transmitted from China to Europe via Silk Road connections?',
      ARRAY['Glassmaking and metalworking', 'Paper-making and printing', 'Textile weaving and dyeing', 'Compass navigation and shipbuilding'],
      'Paper-making and printing',
      'The passage specifically states ''paper-making and printing technology, originating in China, reached the Islamic world and eventually Europe via Silk Road transmission.''',
      2),
    (v_p03, 'The Silk Road was a safe and reliable route used by merchants carrying all types of goods.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the routes ''were vulnerable to banditry'' and ''only the most valuable goods could justify the expense and danger of the full overland journey.''',
      3);

  -- ── Passage 4 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 4 — The Science of Memory',
    'Memory is not a single unified system but a collection of distinct processes supported by different brain structures. Neuroscientists distinguish broadly between declarative memory — which covers consciously accessible facts and events — and non-declarative memory, which includes procedural skills such as riding a bicycle, which can be performed without conscious recollection of how they were learned. Within declarative memory, a further distinction is drawn between semantic memory (general knowledge, such as knowing that Paris is the capital of France) and episodic memory (personally experienced events, such as remembering a specific holiday). The hippocampus, a structure in the medial temporal lobe, plays a critical role in forming new declarative memories and in consolidating them into long-term storage. Damage to the hippocampus — as famously illustrated by the patient known as H.M., who underwent surgical removal of both hippocampi in 1953 — can result in a profound inability to form new long-term memories, while leaving older memories and procedural skills largely intact. This suggests that long-term memories are not permanently stored in the hippocampus but are consolidated into other areas of the cortex over time. Memory is also reconstructive rather than reproductive: each time a memory is recalled, it is reassembled from stored components and can be subtly altered by subsequent experiences, emotions, and suggestion — a finding with significant implications for the reliability of eyewitness testimony.',
    3
  ) RETURNING id INTO v_p04;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p04, 'According to the passage, what does the case of patient H.M. reveal about the role of the hippocampus?',
      ARRAY['The hippocampus is responsible for all types of memory, including procedural skills', 'Removal of the hippocampus erases all existing long-term memories', 'The hippocampus is critical for forming new long-term declarative memories but not for storing them permanently', 'Without the hippocampus, patients lose the ability to learn any new information'],
      'The hippocampus is critical for forming new long-term declarative memories but not for storing them permanently',
      'The passage states H.M.''s case showed ''a profound inability to form new long-term memories, while leaving older memories and procedural skills largely intact,'' and that memories are ''consolidated into other areas of the cortex over time.''',
      0),
    (v_p04, 'Knowing how to ride a bicycle is an example of semantic memory.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage classifies bicycle riding as a procedural skill — a form of non-declarative memory — not semantic memory, which covers general knowledge like facts.',
      1),
    (v_p04, 'What does the passage mean when it describes memory as ''reconstructive rather than reproductive''?',
      ARRAY['The brain physically rebuilds damaged memory cells after injury', 'Memories are reassembled each time they are recalled and can be altered in the process', 'The brain reproduces memories identically every time they are accessed', 'New memories are constructed entirely from imagination rather than real experience'],
      'Memories are reassembled each time they are recalled and can be altered in the process',
      'The passage states that ''each time a memory is recalled, it is reassembled from stored components and can be subtly altered by subsequent experiences, emotions, and suggestion.''',
      2),
    (v_p04, 'The reconstructive nature of memory has no practical consequences beyond academic psychology.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states this finding has ''significant implications for the reliability of eyewitness testimony,'' indicating real-world legal consequences.',
      3);

  -- ── Passage 5 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 5 — The Cultural Significance of Bread',
    'Few foods have occupied as central a place in human culture as bread. Baked from ground grain and water, bread has been a dietary staple in civilisations across Europe, the Middle East, and North Africa for at least 14,000 years, with evidence of flatbread preparation predating even the development of agriculture. The advent of leavened bread — made with yeast or sourdough cultures that cause the dough to rise — is generally dated to ancient Egypt around 3000 BCE, though accidental fermentation likely occurred much earlier. Bread has carried profound symbolic weight across many traditions: in Christianity it represents the body of Christ in the Eucharist; in Judaism, unleavened bread eaten during Passover commemorates the Exodus from Egypt; and in many folk traditions across the world, offering bread to guests is a gesture of hospitality and welcome. The political dimensions of bread are equally significant. The Roman strategy of ''bread and circuses'' — providing free grain distributions alongside public entertainment — was explicitly designed to maintain social order among the urban poor. In 18th-century France, bread shortages and the soaring price of grain were among the most immediate triggers of popular unrest that contributed to the Revolution. Today, industrial bread production has transformed the product almost beyond recognition from its artisanal origins, prompting a widespread revival of interest in traditional fermentation methods and heritage grains among consumers concerned with both health and craft.',
    4
  ) RETURNING id INTO v_p05;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p05, 'Evidence of bread-making predates the development of agriculture.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states there is ''evidence of flatbread preparation predating even the development of agriculture.''',
      0),
    (v_p05, 'According to the passage, what was the political purpose of providing free grain distributions in ancient Rome?',
      ARRAY['To demonstrate Roman agricultural superiority over neighbouring civilisations', 'To reduce unemployment by supporting the grain-milling industry', 'To maintain social order among the urban poor', 'To honour the gods through acts of public generosity'],
      'To maintain social order among the urban poor',
      'The passage states the Roman strategy ''was explicitly designed to maintain social order among the urban poor.''',
      1),
    (v_p05, 'Which of the following best explains the contemporary revival of interest in traditional bread-making methods?',
      ARRAY['Industrial bread has become too expensive for most consumers', 'Government regulations have restricted the use of artificial additives in commercial bread', 'Consumers are motivated by concerns about health and an appreciation for artisanal craft', 'Traditional bread-making techniques produce bread that lasts significantly longer'],
      'Consumers are motivated by concerns about health and an appreciation for artisanal craft',
      'The passage states the revival is ''among consumers concerned with both health and craft.''',
      2),
    (v_p05, 'Bread shortages in 18th-century France were the sole cause of the French Revolution.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states bread shortages and grain prices were ''among the most immediate triggers'' that ''contributed to'' the Revolution — not the sole cause.',
      3);

  -- ── Passage 6 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 6 — The Psychology of Conformity',
    'In a series of now-famous experiments conducted in the 1950s, the American psychologist Solomon Asch demonstrated the powerful influence that group pressure can exert on individual judgement, even in the absence of any explicit coercion. Participants were shown a series of lines of clearly different lengths and asked to state which of three comparison lines matched a target line. The task was unambiguous: the correct answer was obvious to the eye. However, when participants were placed in a group of actors who unanimously gave a clearly wrong answer, approximately 75 percent of participants conformed at least once, and around one third of responses across the experiment were incorrect — aligned with the false group consensus rather than with what participants could plainly see. When asked afterwards, many participants reported that they had genuinely doubted their own perception, while others admitted to simply going along with the group to avoid standing out. Asch''s findings suggested that conformity operates through two mechanisms: informational influence, where individuals assume the group possesses superior knowledge, and normative influence, where individuals conform to avoid social rejection or ridicule. Subsequent researchers have explored the conditions under which conformity is most and least likely to occur, finding that the presence of even a single dissenter — an ally who gives the correct answer — dramatically reduces conformity rates, suggesting that social unanimity is a critical amplifier of group pressure.',
    5
  ) RETURNING id INTO v_p06;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p06, 'In Asch''s experiments, participants were asked to judge the length of lines alongside genuine fellow volunteers who also made mistakes.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the other group members were ''actors'' who ''unanimously gave a clearly wrong answer'' — they were not genuine volunteers making genuine mistakes.',
      0),
    (v_p06, 'According to the passage, what are the two mechanisms through which conformity operates?',
      ARRAY['Peer pressure and financial incentives', 'Informational influence and normative influence', 'Authority compliance and group loyalty', 'Cognitive dissonance and social comparison'],
      'Informational influence and normative influence',
      'The passage explicitly names the two mechanisms as ''informational influence, where individuals assume the group possesses superior knowledge, and normative influence, where individuals conform to avoid social rejection or ridicule.''',
      1),
    (v_p06, 'What did the presence of a single dissenter in Asch''s follow-up research reveal about group pressure?',
      ARRAY['It had no measurable effect on how often participants gave wrong answers', 'It increased conformity by making dissenters appear more credible', 'It dramatically reduced conformity rates, highlighting the importance of unanimity', 'It caused the majority to reconsider, resulting in group agreement on the correct answer'],
      'It dramatically reduced conformity rates, highlighting the importance of unanimity',
      'The passage states ''the presence of even a single dissenter dramatically reduces conformity rates, suggesting that social unanimity is a critical amplifier of group pressure.''',
      2),
    (v_p06, 'All participants who gave wrong answers in Asch''s experiments reported that they had genuinely believed the group''s answer was correct.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states some reported genuinely doubting their perception, while ''others admitted to simply going along with the group to avoid standing out'' — not all believed the group was correct.',
      3);

  -- ── Passage 7 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 7 — The Discovery of the Higgs Boson',
    'On 4 July 2012, scientists at CERN — the European Organisation for Nuclear Research — announced the discovery of a new subatomic particle consistent with the long-theorised Higgs boson, a finding that sent shockwaves through the global physics community. The Higgs boson had been predicted in 1964 by the British physicist Peter Higgs and, independently, by several other theorists, as a necessary consequence of the mechanism by which fundamental particles acquire mass. According to the Standard Model of particle physics, which describes the fundamental forces and particles that make up the universe, certain particles interact with an invisible quantum field — known as the Higgs field — that permeates all of space. It is this interaction that gives particles their mass: the more strongly a particle interacts with the Higgs field, the greater its mass. The search for the Higgs boson required the construction of the Large Hadron Collider (LHC) at CERN — the most powerful particle accelerator ever built — which smashes protons together at nearly the speed of light, briefly recreating the conditions of the early universe and allowing physicists to observe the particles produced in the collisions. Peter Higgs and François Englert, one of the other physicists who had independently predicted the particle, were awarded the Nobel Prize in Physics in 2013. The discovery was widely described as completing the Standard Model, though physicists note that the model still leaves important questions unanswered.',
    6
  ) RETURNING id INTO v_p07;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p07, 'Peter Higgs was the only physicist to predict the existence of the Higgs boson in 1964.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the Higgs boson was predicted by Peter Higgs ''and, independently, by several other theorists.''',
      0),
    (v_p07, 'According to the passage, what determines how much mass a particle has?',
      ARRAY['The speed at which the particle travels through space', 'The number of other particles it collides with inside an accelerator', 'The strength of its interaction with the Higgs field', 'Its proximity to the core of an atom'],
      'The strength of its interaction with the Higgs field',
      'The passage states ''the more strongly a particle interacts with the Higgs field, the greater its mass.''',
      1),
    (v_p07, 'The discovery of the Higgs boson means that all questions in particle physics have now been resolved.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states physicists note ''the model still leaves important questions unanswered,'' directly contradicting any claim that all questions are resolved.',
      2),
    (v_p07, 'Why was the Large Hadron Collider necessary for discovering the Higgs boson?',
      ARRAY['It was the only facility with computers powerful enough to process the required calculations', 'It could observe the Higgs field directly using infrared imaging technology', 'It smashes protons at near light speed, recreating early-universe conditions and producing observable particles', 'It was built specifically to measure the mass of already-known subatomic particles'],
      'It smashes protons at near light speed, recreating early-universe conditions and producing observable particles',
      'The passage describes the LHC as smashing protons ''at nearly the speed of light, briefly recreating the conditions of the early universe and allowing physicists to observe the particles produced.''',
      3);

  -- ── Passage 8 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 8 — The Welfare of Farmed Animals',
    'Animal welfare in farming has become an increasingly prominent ethical and political issue in many countries, driven by growing public awareness of the conditions in which food-producing animals are commonly kept. Intensive or factory farming, which emerged in the mid-20th century as a response to demand for affordable food, typically involves keeping large numbers of animals in confined spaces, using selective breeding and feed additives to maximise growth rates, and routinely administering antibiotics to prevent the disease outbreaks that crowded conditions encourage. Critics argue that such systems cause unnecessary suffering, pointing to the inability of animals to express natural behaviours, the physical consequences of accelerated growth, and the stress associated with extreme confinement. Defenders of intensive farming argue that it has made nutritious food accessible to populations that could not otherwise afford it, and that many welfare concerns can be addressed through improved husbandry standards without abandoning the economic model. Legislative responses vary considerably between countries: some have banned practices such as battery cages for hens and gestation crates for sows that remain legal elsewhere. Consumer behaviour has also shifted in some markets, with growing demand for products certified as higher welfare, though price sensitivity means that premium welfare products remain a minority of overall sales. The debate ultimately raises deeper questions about the moral status of non-human animals and the obligations of humans towards them.',
    7
  ) RETURNING id INTO v_p08;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p08, 'Intensive farming emerged in the mid-20th century primarily to meet demand for affordable food.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states intensive farming ''emerged in the mid-20th century as a response to demand for affordable food.''',
      0),
    (v_p08, 'According to the passage, why are antibiotics routinely used in intensive farming?',
      ARRAY['To accelerate the growth of animals and reduce the time to market', 'To prevent disease outbreaks encouraged by crowded living conditions', 'To comply with government regulations requiring all farmed animals to be vaccinated', 'To reduce the stress experienced by animals kept in confined spaces'],
      'To prevent disease outbreaks encouraged by crowded living conditions',
      'The passage states antibiotics are ''routinely administered to prevent the disease outbreaks that crowded conditions encourage.''',
      1),
    (v_p08, 'Higher-welfare animal products currently represent the majority of food sales in most markets.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states ''premium welfare products remain a minority of overall sales'' due to price sensitivity.',
      2),
    (v_p08, 'What position do defenders of intensive farming take regarding animal welfare concerns?',
      ARRAY['They deny that animals experience suffering in any meaningful sense', 'They argue welfare concerns are exaggerated by activist groups with no scientific basis', 'They accept that intensive farming is inherently cruel and must eventually be replaced', 'They contend that welfare improvements are possible within the existing economic model'],
      'They contend that welfare improvements are possible within the existing economic model',
      'The passage states defenders argue ''many welfare concerns can be addressed through improved husbandry standards without abandoning the economic model.''',
      3);

  -- ── Passage 9 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 9 — The History of Anaesthesia',
    'Before the introduction of effective anaesthesia in the 1840s, surgery was an experience of unimaginable terror. Operations were performed on fully conscious patients, whose screams were an accepted part of the surgical environment, and speed was considered one of the most prized qualities in a surgeon — the faster the operation, the shorter the agony. Alcohol and opium provided partial relief but nothing approaching genuine insensibility. The first public demonstration of ether anaesthesia is widely credited to the American dentist William Morton, who in October 1846 successfully anaesthetised a patient at Massachusetts General Hospital in Boston for the surgical removal of a neck tumour. News of the demonstration spread rapidly to Europe, and within months the technique was being used in hospitals across Britain and France. Chloroform, which proved easier to administer than ether, quickly became popular following its introduction by the Scottish physician James Young Simpson in 1847. The technique received a significant boost to its social acceptability when Queen Victoria accepted chloroform during the birth of her eighth child in 1853 — a royal endorsement that helped overcome religious and moral objections to removing the pain of childbirth. The development of anaesthesia transformed surgery from a last resort to a practical therapeutic intervention, enabling longer, more precise operations and ultimately laying the groundwork for the sophisticated surgical specialties of the modern era.',
    8
  ) RETURNING id INTO v_p09;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p09, 'Before effective anaesthesia, surgeons were valued for their speed because faster operations reduced the patient''s suffering.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states ''speed was considered one of the most prized qualities in a surgeon — the faster the operation, the shorter the agony.''',
      0),
    (v_p09, 'Which of the following best explains the significance of Queen Victoria accepting chloroform in 1853?',
      ARRAY['It proved that chloroform was medically safe for use in all surgical procedures', 'It encouraged other European monarchs to accept anaesthesia, accelerating its adoption', 'Her endorsement helped to overcome the moral and religious objections to pain relief in childbirth', 'It led directly to chloroform replacing ether as the standard anaesthetic worldwide'],
      'Her endorsement helped to overcome the moral and religious objections to pain relief in childbirth',
      'The passage states the royal endorsement ''helped overcome religious and moral objections to removing the pain of childbirth.''',
      1),
    (v_p09, 'William Morton was the first person to ever use ether as an anaesthetic.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage credits Morton with the first ''public demonstration'' of ether anaesthesia but does not state he was the first to use it in any context. Earlier private uses cannot be ruled out.',
      2),
    (v_p09, 'According to the passage, how did the development of anaesthesia change the nature of surgery?',
      ARRAY['It eliminated the risk of infection, making surgery significantly safer overall', 'It allowed surgeons to perform longer and more precise operations, enabling modern surgical specialties', 'It reduced the cost of surgery by shortening recovery times and hospital stays', 'It shifted surgery from hospitals into specialist clinics, making it more accessible'],
      'It allowed surgeons to perform longer and more precise operations, enabling modern surgical specialties',
      'The passage states anaesthesia enabled ''longer, more precise operations and ultimately laying the groundwork for the sophisticated surgical specialties of the modern era.''',
      3);

  -- ── Passage 10 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 10 — The Sociology of Sport',
    'Sport is far more than a form of physical recreation. Sociologists have long argued that sporting events and institutions serve as powerful arenas in which broader social values, hierarchies, and tensions are expressed, contested, and reproduced. The organisation of sport historically reflected and reinforced prevailing social divisions: amateur athletics in Victorian Britain, for example, were explicitly designed to exclude the working class through rules requiring participants to not have engaged in sport for financial gain — rules that conveniently did not apply to gentlemen of independent means who could afford to train without payment. The integration of professional sport in the 20th century opened new pathways of social mobility for talented individuals from disadvantaged backgrounds, yet critics argue that sport simultaneously naturalises inequality by presenting exceptional individual achievement as the solution to structural disadvantage. National sporting success has also frequently been instrumentalised by governments for political purposes — from Nazi Germany''s hosting of the 1936 Berlin Olympics to the apartheid-era South African sporting boycotts — as sport carries symbolic weight that politics seeks to capture or contest. More recently, sport has become a site of activism, with athletes increasingly using their visibility to draw attention to racial injustice, gender inequality, and other social issues, prompting fierce debate about whether sport should remain ''apolitical'' — a position critics argue was never genuinely available in the first place.',
    9
  ) RETURNING id INTO v_p10;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p10, 'Victorian amateur athletics rules excluded the working class by prohibiting participation by those who had ever played sport professionally.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states the rules required participants ''to not have engaged in sport for financial gain,'' which would exclude working-class individuals who had played professionally.',
      0),
    (v_p10, 'According to critics cited in the passage, what is problematic about using individual sporting achievement as a response to structural disadvantage?',
      ARRAY['It discourages team sports and promotes an overly individualistic culture', 'It distracts from the enjoyment of sport as a collective recreational activity', 'It presents exceptional individual success as a solution to problems that are structural in nature', 'It places too much psychological pressure on athletes from disadvantaged backgrounds'],
      'It presents exceptional individual success as a solution to problems that are structural in nature',
      'The passage states critics argue sport ''naturalises inequality by presenting exceptional individual achievement as the solution to structural disadvantage.''',
      1),
    (v_p10, 'The passage implies that the idea of sport being ''apolitical'' is an accurate description of how sport has historically functioned.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states critics argue the apolitical position ''was never genuinely available in the first place,'' and provides numerous historical examples of sport''s political dimensions.',
      2),
    (v_p10, 'Which of the following examples does the passage use to illustrate how governments have used sporting events for political purposes?',
      ARRAY['The Cold War rivalry between the USA and USSR at the Olympic Games', 'The 1936 Berlin Olympics hosted by Nazi Germany and the apartheid-era sporting boycotts', 'The exclusion of professional athletes from the Victorian amateur athletics movement', 'The recent activism of athletes drawing attention to racial and gender inequality'],
      'The 1936 Berlin Olympics hosted by Nazi Germany and the apartheid-era sporting boycotts',
      'The passage explicitly cites ''Nazi Germany''s hosting of the 1936 Berlin Olympics'' and ''apartheid-era South African sporting boycotts'' as examples of sport being instrumentalised for political purposes.',
      3);

  -- ── Passage 11 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    3,
    'Passage 11 — The Rise of Telemedicine',
    'Telemedicine — the delivery of clinical healthcare services at a distance through telecommunications technology — is not a new concept, but its adoption accelerated dramatically during the COVID-19 pandemic, when lockdowns and infection-control measures made in-person consultations difficult or impossible for many patients. During the pandemic''s peak, healthcare systems in many countries rapidly scaled up video and telephone consultation platforms, with some reporting that more than half of all primary care appointments were conducted remotely. For patients with mobility limitations, those living in rural or underserved areas, or those managing chronic conditions that require frequent but routine monitoring, the expansion of remote care offered genuine benefits in terms of convenience and access. However, the shift also raised important concerns. Critics noted that virtual consultations limit the ability to conduct physical examinations, potentially leading to missed diagnoses. There are also concerns about the digital divide: older patients and those from lower socioeconomic backgrounds may lack access to reliable internet connections or the digital literacy required to use telehealth platforms effectively. Questions also arose about the safety and appropriateness of remote prescribing, particularly for controlled medications. As healthcare systems assess how to incorporate telemedicine into long-term models of care, most experts advocate for a hybrid approach — using remote consultations for appropriate cases while preserving in-person care for situations where physical examination or complex communication is essential.',
    10
  ) RETURNING id INTO v_p11;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p11, 'Telemedicine was invented during the COVID-19 pandemic in response to lockdown restrictions.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states telemedicine ''is not a new concept'' and that the pandemic ''accelerated'' its adoption — not invented it.',
      0),
    (v_p11, 'According to the passage, which patient groups particularly benefit from the expansion of telemedicine?',
      ARRAY['Patients requiring emergency surgical intervention', 'Patients with mental health conditions requiring intensive therapy', 'Patients with mobility limitations, those in rural areas, and those managing chronic conditions', 'Patients who are fluent in digital technology and prefer convenience over thoroughness'],
      'Patients with mobility limitations, those in rural areas, and those managing chronic conditions',
      'The passage specifically identifies ''patients with mobility limitations, those living in rural or underserved areas, or those managing chronic conditions'' as particularly benefiting from remote care.',
      1),
    (v_p11, 'What does the passage identify as a clinical risk associated with virtual consultations?',
      ARRAY['Patients are more likely to cancel appointments if they are conducted remotely', 'Virtual consultations are significantly more expensive than in-person appointments', 'The inability to conduct physical examinations may result in missed diagnoses', 'Remote platforms expose patient data to a higher risk of cybersecurity breaches'],
      'The inability to conduct physical examinations may result in missed diagnoses',
      'The passage states ''virtual consultations limit the ability to conduct physical examinations, potentially leading to missed diagnoses.''',
      2),
    (v_p11, 'Most experts cited in the passage believe that telemedicine should fully replace in-person consultations across all healthcare settings.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states most experts advocate for ''a hybrid approach — using remote consultations for appropriate cases while preserving in-person care for situations where physical examination or complex communication is essential.''',
      3);

END $$;
