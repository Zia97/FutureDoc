-- Seed: Timed VR Test 4 (test_id = 4)

DO $$
DECLARE
  v_p01 UUID; v_p02 UUID; v_p03 UUID; v_p04 UUID; v_p05 UUID;
  v_p06 UUID; v_p07 UUID; v_p08 UUID; v_p09 UUID; v_p10 UUID;
  v_p11 UUID;
BEGIN

  INSERT INTO timed_verbal_reasoning_tests (id, title, time_minutes)
  VALUES (4, 'VR Timed Test 4', 22)
  ON CONFLICT (id) DO NOTHING;

  -- ── Passage 1 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 1 — The Psychology of Colour',
    'The relationship between colour and human psychology has been studied extensively, though many popular claims in this area outpace the evidence. Colour psychology examines how different hues influence mood, perception, and behaviour, and findings suggest these effects are real but modest and highly context-dependent. Red, for instance, has been associated with heightened arousal and a sense of urgency in experimental settings, and has been shown in some studies to impair performance on cognitive tasks requiring careful analytical thinking — an effect researchers have linked to its association with danger and failure in many cultural contexts. Blue, by contrast, tends to be associated with calm and is often cited as a colour that facilitates creative thinking, though the mechanisms remain debated. However, much of this research has been conducted in Western contexts, and cross-cultural studies reveal that colour associations vary considerably between societies: white, for example, is the colour of mourning in several East and South Asian traditions, while it typically signifies purity and celebration in Western ones. Commercial and marketing industries have enthusiastically adopted colour psychology, with brands making deliberate choices about palette to evoke specific emotional responses. Researchers urge caution, however, noting that individual differences, personal history, and the context in which a colour appears often exert a greater influence on response than the colour itself.',
    0
  ) RETURNING id INTO v_p01;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p01, 'According to the passage, what effect has red been shown to have on analytical cognitive tasks?',
      ARRAY['It improves performance by increasing alertness and focus', 'It has no measurable effect on cognitive performance', 'It has been shown to impair performance in some studies', 'It enhances creative thinking but reduces logical reasoning'],
      'It has been shown to impair performance in some studies',
      'The passage states red ''has been shown in some studies to impair performance on cognitive tasks requiring careful analytical thinking.''',
      0),
    (v_p01, 'Colour associations are universal and consistent across all human cultures.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states ''cross-cultural studies reveal that colour associations vary considerably between societies,'' giving the example of white signifying mourning in some cultures and purity in others.',
      1),
    (v_p01, 'What caution do researchers raise about applying colour psychology to real-world settings?',
      ARRAY['Colour psychology studies have not been replicated outside of laboratory conditions', 'Individual differences, personal history, and context often matter more than colour itself', 'The commercial use of colour psychology is illegal in most countries', 'No colour has been shown to produce consistent effects across multiple studies'],
      'Individual differences, personal history, and context often matter more than colour itself',
      'The passage states researchers note ''individual differences, personal history, and the context in which a colour appears often exert a greater influence on response than the colour itself.''',
      2),
    (v_p01, 'The passage suggests that the commercial use of colour psychology by brands is based on well-established, universally agreed scientific findings.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states ''many popular claims in this area outpace the evidence'' and that researchers ''urge caution,'' indicating the commercial use goes beyond what the science firmly supports.',
      3);

  -- ── Passage 2 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 2 — The Ethics of Human Genetic Enhancement',
    'Advances in gene-editing technologies, most notably CRISPR-Cas9, have made it technically feasible — and in some respects increasingly straightforward — to alter the genetic makeup of human embryos. This has reignited a long-standing ethical debate about the permissibility of genetic enhancement: the deliberate modification of heritable traits not for therapeutic purposes but to confer advantages such as increased intelligence, athleticism, or disease resistance. Proponents of genetic enhancement argue that parents already make decisions designed to give their children advantages — choosing schools, nutrition, and enrichment activities — and that genetic enhancement represents a logical extension of this parental concern. They also argue that if genetic enhancement becomes available, restricting it to the wealthy would exacerbate existing inequality, suggesting that the ethical path may be to ensure equitable access rather than prohibition. Critics counter that genetic enhancement of germline cells — those that can be inherited by future generations — crosses a qualitative moral threshold. Unlike environmental interventions, genetic changes are permanent and affect individuals who cannot consent. There are also concerns about the commodification of human life and the potential resurrection of eugenic thinking — the historically discredited notion that human populations can and should be ''improved'' through selective reproduction. In 2018, the birth of gene-edited twins in China — whose genome had been altered to confer resistance to HIV — was widely condemned by the international scientific community as premature and ethically unjustifiable.',
    1
  ) RETURNING id INTO v_p02;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p02, 'Some proponents of genetic enhancement argue that restricting access to the wealthy would be ethically preferable to permitting it widely.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states proponents argue restricting access to the wealthy ''would exacerbate existing inequality,'' suggesting instead that ''the ethical path may be to ensure equitable access rather than prohibition'' — the opposite of restriction to the wealthy.',
      0),
    (v_p02, 'According to the passage, what distinguishes genetic enhancement of germline cells from other forms of parental intervention?',
      ARRAY['Germline editing is performed before birth, while other interventions occur during childhood', 'Germline changes are heritable and permanent, affecting future generations who cannot consent', 'Germline editing is significantly more expensive than environmental interventions such as schooling', 'Unlike other interventions, germline editing requires the approval of an international ethics board'],
      'Germline changes are heritable and permanent, affecting future generations who cannot consent',
      'The passage states germline changes ''are permanent and affect individuals who cannot consent,'' highlighting their heritable nature as a key ethical distinction.',
      1),
    (v_p02, 'The international scientific community welcomed the birth of gene-edited twins in China in 2018 as a breakthrough.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states it ''was widely condemned by the international scientific community as premature and ethically unjustifiable.''',
      2),
    (v_p02, 'Which of the following best describes the concern about eugenics raised in the passage?',
      ARRAY['That genetic enhancement could allow governments to enforce reproductive policies', 'That genetic enhancement may lead to the revival of the discredited idea that human populations should be improved through selective reproduction', 'That eugenics programmes could be secretly conducted by pharmaceutical companies', 'That genetic enhancement will reduce human genetic diversity to dangerous levels'],
      'That genetic enhancement may lead to the revival of the discredited idea that human populations should be improved through selective reproduction',
      'The passage warns of ''the potential resurrection of eugenic thinking — the historically discredited notion that human populations can and should be improved through selective reproduction.''',
      3);

  -- ── Passage 3 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 3 — The Amazon Rainforest',
    'The Amazon rainforest, spanning approximately 5.5 million square kilometres across nine South American countries, is the largest tropical rainforest on Earth and one of the most biologically diverse regions in the world. It is estimated to contain around 10 percent of all species on the planet, many of which remain undescribed by science. The Amazon basin also plays a critical role in the global climate system: its trees absorb and store vast quantities of carbon dioxide and release enormous amounts of water vapour through a process called transpiration, generating what scientists have described as ''flying rivers'' — aerial streams of moisture that influence rainfall patterns far beyond the forest''s physical boundaries. Deforestation, driven primarily by agricultural expansion — particularly cattle ranching and soya cultivation — has destroyed roughly 17 percent of the Amazon''s original extent, with some scientists warning that the forest is approaching a tipping point beyond which widespread dieback could become self-reinforcing. As the forest shrinks, its ability to generate its own rainfall diminishes, potentially triggering a cycle of drought and further die-off. Indigenous communities, many of whom have lived in the forest for millennia and whose land rights remain legally insecure in several countries, are disproportionately affected by deforestation and the associated violence from illegal loggers and land speculators. International conservation efforts have achieved some reductions in deforestation rates at certain times, though progress has been uneven and dependent on the political will of national governments.',
    2
  ) RETURNING id INTO v_p03;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p03, 'The Amazon rainforest is estimated to contain approximately 10 percent of all species on Earth.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage directly states ''it is estimated to contain around 10 percent of all species on the planet.''',
      0),
    (v_p03, 'What do scientists mean by ''flying rivers'' in the context of the Amazon?',
      ARRAY['Underground waterways that connect the Amazon basin to the Atlantic Ocean', 'Aerial streams of moisture generated by the forest that influence rainfall in distant regions', 'Seasonal flooding events that transport nutrients from the forest floor to river systems', 'Trade winds that carry Amazon rainwater across the South American continent'],
      'Aerial streams of moisture generated by the forest that influence rainfall in distant regions',
      'The passage describes ''flying rivers'' as ''aerial streams of moisture that influence rainfall patterns far beyond the forest''s physical boundaries,'' generated by transpiration.',
      1),
    (v_p03, 'According to the passage, what makes the potential tipping point in Amazon deforestation particularly alarming?',
      ARRAY['Beyond the tipping point, international law would no longer protect the remaining forest', 'Widespread dieback could become self-reinforcing as the forest loses its ability to generate its own rainfall', 'The tipping point would trigger flooding events that would devastate coastal South American cities', 'Beyond this threshold, all remaining species in the Amazon would face immediate extinction'],
      'Widespread dieback could become self-reinforcing as the forest loses its ability to generate its own rainfall',
      'The passage warns that ''as the forest shrinks, its ability to generate its own rainfall diminishes, potentially triggering a cycle of drought and further die-off.''',
      2),
    (v_p03, 'International conservation efforts have consistently and permanently halted deforestation in the Amazon.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states international efforts have achieved ''some reductions in deforestation rates at certain times'' but that ''progress has been uneven'' — far from a consistent permanent halt.',
      3);

  -- ── Passage 4 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 4 — The History of Money',
    'Money, in one form or another, has been a feature of human civilisation for at least five thousand years, though its origins are more complex than the simple narrative of barter giving way to coins might suggest. Anthropologists have argued that many pre-monetary societies did not primarily use barter among strangers but instead relied on systems of credit, gift, and obligation within communities. Commodity money — where the medium of exchange has intrinsic value, such as grain, cattle, or silver — was used in ancient Mesopotamia and Egypt, often in the context of temple and palace redistribution systems rather than market exchange. The first coins are generally attributed to the kingdom of Lydia in modern-day Turkey, around 600 BCE. Paper money originated in China during the Tang dynasty, driven by the practical inconvenience of carrying large quantities of metal coin for long-distance trade. The concept spread westward slowly, arriving in Europe during the 17th century in the form of banknotes issued by goldsmiths who held deposits of metal coin. The development of central banking and fiat currency — money that has value not because of what it is made of but because a government has declared it legal tender — fundamentally transformed the economics of money creation. Today, the vast majority of money in existence is not physical at all but exists as electronic entries in bank databases, a state of affairs that continues to unsettle those who prefer a more tangible conception of value.',
    3
  ) RETURNING id INTO v_p04;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p04, 'Anthropologists agree that barter was the primary method of exchange in all pre-monetary societies.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states anthropologists have argued that many pre-monetary societies ''did not primarily use barter'' but instead used credit, gift, and obligation systems.',
      0),
    (v_p04, 'According to the passage, what motivated the development of paper money in China?',
      ARRAY['A shortage of precious metals made metal coinage impossible to produce', 'The Chinese government wished to centralise control over the money supply', 'The impracticality of transporting large quantities of metal coin for long-distance trade', 'Religious beliefs prevented the use of metal objects as a medium of exchange'],
      'The impracticality of transporting large quantities of metal coin for long-distance trade',
      'The passage states paper money was ''driven by the practical inconvenience of carrying large quantities of metal coin for long-distance trade.''',
      1),
    (v_p04, 'What is the defining feature of fiat currency as described in the passage?',
      ARRAY['It is backed by a fixed quantity of gold held in government reserves', 'Its value derives from government declaration rather than from the material it is made of', 'It can only be issued by private banks with a government licence', 'It exists exclusively in electronic form and has no physical equivalent'],
      'Its value derives from government declaration rather than from the material it is made of',
      'The passage defines fiat currency as ''money that has value not because of what it is made of but because a government has declared it legal tender.''',
      2),
    (v_p04, 'The first coins were produced in ancient Egypt around 600 BCE.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage attributes the first coins to ''the kingdom of Lydia in modern-day Turkey, around 600 BCE'' — not ancient Egypt.',
      3);

  -- ── Passage 5 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 5 — The Science of Climate Tipping Points',
    'Climate tipping points are thresholds in the Earth''s climate system that, once crossed, trigger self-reinforcing changes that are difficult or impossible to reverse even if greenhouse gas emissions are subsequently reduced. Scientists have identified a number of potential tipping elements — components of the climate system that could undergo abrupt and dramatic change if global temperatures rise beyond certain levels. These include the collapse of the West Antarctic and Greenland ice sheets, which store enough water to raise sea levels by several metres; the thawing of Arctic permafrost, which would release vast quantities of methane — a potent greenhouse gas — creating a feedback loop that accelerates further warming; and the dieback of the Amazon rainforest. Concern among climate scientists has grown because recent research suggests that several tipping points may be closer than previously estimated, and that some may interact: triggering one tipping element could increase the likelihood of triggering others in a cascading sequence. The concept of tipping points has significant implications for climate policy: it suggests that gradual, incremental emissions reductions may be insufficient if tipping thresholds are crossed in the interim, and that the relationship between emissions and consequences may not be linear but may instead involve step-changes that are qualitatively different from anything in recent human experience. Proponents of urgent climate action cite tipping points as among the strongest arguments for treating the climate crisis as an emergency rather than a manageable long-term challenge.',
    4
  ) RETURNING id INTO v_p05;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p05, 'Once a climate tipping point is crossed, reducing greenhouse gas emissions will immediately reverse the changes triggered.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage defines tipping points as triggering changes ''that are difficult or impossible to reverse even if greenhouse gas emissions are subsequently reduced.''',
      0),
    (v_p05, 'According to the passage, why is the thawing of Arctic permafrost considered a tipping point?',
      ARRAY['It would flood coastal cities by raising sea levels by several metres', 'It would destroy habitats for Arctic wildlife, causing mass extinctions', 'It would release methane that creates a feedback loop accelerating further warming', 'It would disrupt ocean currents that regulate temperatures across the Northern Hemisphere'],
      'It would release methane that creates a feedback loop accelerating further warming',
      'The passage states permafrost thawing ''would release vast quantities of methane — a potent greenhouse gas — creating a feedback loop that accelerates further warming.''',
      1),
    (v_p05, 'What does the passage suggest about the interaction between different climate tipping elements?',
      ARRAY['Each tipping element operates independently with no effect on the others', 'Triggering one tipping element could increase the probability of triggering others in a cascade', 'Tipping elements in the Southern Hemisphere counteract those in the Northern Hemisphere', 'The interaction between tipping elements is too unpredictable to be modelled scientifically'],
      'Triggering one tipping element could increase the probability of triggering others in a cascade',
      'The passage states ''triggering one tipping element could increase the likelihood of triggering others in a cascading sequence.''',
      2),
    (v_p05, 'Recent research has found that several climate tipping points may be reached at lower temperatures than previously thought.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states ''recent research suggests that several tipping points may be closer than previously estimated,'' implying they could be triggered at lower temperature thresholds.',
      3);

  -- ── Passage 6 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 6 — The History of Public Health',
    'The development of modern public health as a discipline is often traced to the mid-19th century, when industrialisation and rapid urban growth created conditions of catastrophic overcrowding and contamination in cities across Europe and North America. In London, cholera epidemics in the 1840s and 1850s prompted investigations that became foundational to epidemiology. John Snow, a physician working during the 1854 Broad Street cholera outbreak, mapped the distribution of cases and identified a contaminated water pump as the source — a piece of detective work that provided compelling evidence for the waterborne transmission of cholera at a time when the dominant theory held that disease was spread through bad air, or ''miasma.'' His work contributed to a gradual shift towards understanding disease as caused by specific, identifiable agents — a germ theory whose development is most closely associated with the French chemist Louis Pasteur and the German physician Robert Koch. The subsequent decades saw significant public health interventions: the construction of sewage systems, the regulation of food and water supplies, and the introduction of vaccination programmes that dramatically reduced mortality from diseases such as smallpox and diphtheria. Life expectancy in many developed countries roughly doubled between 1850 and 1950, with improvements in sanitation, nutrition, and public health infrastructure accounting for a substantial share of this gain — arguably more than advances in medical treatment during the same period.',
    5
  ) RETURNING id INTO v_p06;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p06, 'What was the dominant theory about disease transmission before germ theory?',
      ARRAY['That diseases were caused by microscopic organisms passed between people through touch', 'That illness was caused by spiritual or supernatural forces', 'That disease spread through contaminated water and food supplies', 'That disease was transmitted through bad air, known as miasma'],
      'That disease was transmitted through bad air, known as miasma',
      'The passage states ''the dominant theory held that disease was spread through bad air, or miasma.''',
      0),
    (v_p06, 'John Snow''s work on the 1854 cholera outbreak proved definitively that all diseases are caused by waterborne pathogens.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'Snow''s work identified a waterborne source for that specific outbreak — the passage does not state his findings were extended as proof that all diseases are waterborne.',
      1),
    (v_p06, 'According to the passage, what does the evidence suggest about the causes of improved life expectancy between 1850 and 1950?',
      ARRAY['Advances in surgical technique and pharmaceutical treatment were the primary drivers', 'Improvements in sanitation, nutrition, and public health infrastructure accounted for a substantial share', 'Reduced warfare and political stability were the dominant factors', 'Better education and rising literacy rates improved people''s ability to manage their own health'],
      'Improvements in sanitation, nutrition, and public health infrastructure accounted for a substantial share',
      'The passage states ''improvements in sanitation, nutrition, and public health infrastructure'' accounted for ''a substantial share of this gain — arguably more than advances in medical treatment.''',
      2),
    (v_p06, 'Germ theory is most closely associated in the passage with John Snow''s epidemiological investigations.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states germ theory''s development ''is most closely associated with the French chemist Louis Pasteur and the German physician Robert Koch,'' not John Snow.',
      3);

  -- ── Passage 7 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 7 — The Concept of Flow',
    'In the 1970s, Hungarian-American psychologist Mihaly Csikszentmihalyi introduced the concept of ''flow'' — a mental state of complete absorption in a challenging activity, characterised by a loss of self-consciousness, distorted perception of time, and intense intrinsic motivation. Csikszentmihalyi developed the concept through extensive interviews with artists, athletes, surgeons, and chess players, who independently described peak experiences of effortless concentration during which performance felt almost automatic and self-monitoring fell away. The conditions most conducive to flow, according to Csikszentmihalyi, involve a balance between the perceived difficulty of a task and the individual''s skill level: tasks that are too easy produce boredom, while those that are too difficult produce anxiety. Only when challenge and skill are closely matched does the focused absorption of flow become possible. The concept has been applied widely across domains including education, sports psychology, workplace productivity, and therapy. In educational contexts, flow theory suggests that students learn most effectively not through passive instruction but through appropriately challenging activities that stretch but do not overwhelm their abilities. Critics of the concept have noted that flow is difficult to measure objectively, as it is largely defined by the subjective reports of those experiencing it, and that the conditions for flow may vary substantially between individuals and across cultural contexts.',
    6
  ) RETURNING id INTO v_p07;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p07, 'According to the passage, what conditions does Csikszentmihalyi identify as most likely to produce a state of flow?',
      ARRAY['A task that is highly familiar and can be completed quickly with minimal effort', 'A task performed in complete isolation without any external distractions', 'A close match between the perceived difficulty of a task and the individual''s skill level', 'A task that involves collaboration with others who share the same level of expertise'],
      'A close match between the perceived difficulty of a task and the individual''s skill level',
      'The passage states flow becomes possible ''only when challenge and skill are closely matched.''',
      0),
    (v_p07, 'Csikszentmihalyi developed his theory of flow primarily through laboratory experiments on student performance.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the concept was developed ''through extensive interviews with artists, athletes, surgeons, and chess players'' — not laboratory experiments on students.',
      1),
    (v_p07, 'What criticism of flow theory does the passage present?',
      ARRAY['It has never been successfully applied outside of artistic and athletic contexts', 'Csikszentmihalyi failed to acknowledge the contributions of earlier psychologists to the concept', 'Flow is difficult to measure objectively as it relies on subjective self-reports and may vary across individuals', 'The concept has been shown to be incompatible with achieving high performance under competitive pressure'],
      'Flow is difficult to measure objectively as it relies on subjective self-reports and may vary across individuals',
      'The passage states critics note ''flow is difficult to measure objectively, as it is largely defined by the subjective reports of those experiencing it, and that the conditions for flow may vary substantially between individuals.''',
      2),
    (v_p07, 'Flow theory suggests that students learn best through passive instruction delivered by experienced teachers.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states flow theory suggests students learn most effectively ''not through passive instruction but through appropriately challenging activities that stretch but do not overwhelm their abilities.''',
      3);

  -- ── Passage 8 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 8 — The Decline of Biodiversity',
    'Biodiversity — the variety of life on Earth, encompassing the diversity of species, genetic variation within species, and the range of ecosystems — is declining at a rate that many scientists describe as constituting a sixth mass extinction event. Previous mass extinctions, such as the one that ended the Cretaceous period approximately 66 million years ago, were caused by geological and astronomical events. The current decline is driven primarily by human activities: habitat destruction, particularly the conversion of forests and wetlands to agricultural land; pollution; overexploitation of wild species through hunting and fishing; the spread of invasive species; and, increasingly, climate change. The Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services (IPBES) estimated in 2019 that approximately one million animal and plant species face extinction within decades. Beyond the ethical dimensions of causing the permanent loss of species, biodiversity loss has direct practical consequences: ecosystems provide services — pollination, water purification, carbon storage, flood regulation — that underpin human food systems and economies. The economic value of these ecosystem services has been estimated in the trillions of dollars annually. Some conservation scientists argue for protecting large contiguous areas of habitat, as corridor connectivity allows species to migrate in response to changing conditions. Others emphasise the importance of integrating biodiversity considerations into agricultural and urban planning, rather than confining conservation to protected reserves.',
    7
  ) RETURNING id INTO v_p08;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p08, 'According to the passage, what primarily distinguishes the current extinction event from previous mass extinctions?',
      ARRAY['The current extinction is happening more slowly than previous events', 'Previous extinctions were caused by geological and astronomical events, while the current one is primarily human-driven', 'Previous extinctions affected only animal species, whereas the current one affects plants as well', 'The current extinction is limited to tropical ecosystems, unlike previous global events'],
      'Previous extinctions were caused by geological and astronomical events, while the current one is primarily human-driven',
      'The passage states previous extinctions ''were caused by geological and astronomical events,'' while the current decline ''is driven primarily by human activities.''',
      0),
    (v_p08, 'The IPBES estimated in 2019 that around one million species face extinction within decades.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage directly states ''the IPBES estimated in 2019 that approximately one million animal and plant species face extinction within decades.''',
      1),
    (v_p08, 'What practical argument does the passage make for conserving biodiversity beyond its ethical value?',
      ARRAY['Biodiversity has significant tourism value that supports local economies in developing countries', 'Ecosystems provide services such as pollination and water purification that support human food systems and economies', 'Diverse ecosystems are more resistant to the spread of infectious diseases that threaten humans', 'Protecting biodiversity stimulates scientific innovation and the development of new medicines'],
      'Ecosystems provide services such as pollination and water purification that support human food systems and economies',
      'The passage states ecosystems ''provide services — pollination, water purification, carbon storage, flood regulation — that underpin human food systems and economies.''',
      2),
    (v_p08, 'All conservation scientists cited in the passage agree that the best strategy is to establish large protected reserves separate from agricultural land.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage presents two different views: some scientists argue for large protected areas, while ''others emphasise the importance of integrating biodiversity considerations into agricultural and urban planning'' — there is no consensus.',
      3);

  -- ── Passage 9 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 9 — The Language of Shakespeare',
    'William Shakespeare, writing in the late 16th and early 17th centuries, is often cited as the single greatest contributor to the English language, though the scale of his influence is a matter of ongoing scholarly debate. Linguists have estimated that Shakespeare coined or was among the first to record in writing several thousand words and phrases that have since entered common English usage, including ''bedroom,'' ''lonely,'' ''obscene,'' ''generous,'' and ''eyeball.'' He also popularised or is credited with inventing numerous phrases still used today, such as ''break the ice,'' ''heart of gold,'' and ''wild goose chase.'' However, attributing specific coinages to Shakespeare is complicated by the nature of the written record: many words he used may have been in spoken circulation for some time before appearing in his work, and the relative scarcity of contemporaneous documents makes it impossible to establish with certainty that Shakespeare was the first user of any particular word. Shakespeare''s linguistic influence was also a product of timing: his works were written just as the printing press was enabling the wider standardisation and codification of English, and the enduring popularity of his plays and poems ensured that his vocabulary entered and remained in the written canon. The First Folio, a collected edition of his plays published in 1623 — seven years after his death — preserved works that might otherwise have been lost, and it is to this publication that subsequent generations largely owe their access to his writing.',
    8
  ) RETURNING id INTO v_p09;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p09, 'It is definitively proven that Shakespeare was the first person to use all of the words attributed to him.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states it is ''impossible to establish with certainty that Shakespeare was the first user of any particular word,'' as many may have been in spoken use before appearing in his writing.',
      0),
    (v_p09, 'According to the passage, what role did timing play in amplifying Shakespeare''s linguistic influence?',
      ARRAY['He was writing at the height of English imperial expansion, spreading his vocabulary globally', 'His works coincided with the printing press enabling standardisation of English, and their popularity embedded his vocabulary in the written canon', 'He was patronised by the English monarchy, which promoted his work through official channels', 'He was the only major playwright writing in English at the time, giving him unrivalled influence'],
      'His works coincided with the printing press enabling standardisation of English, and their popularity embedded his vocabulary in the written canon',
      'The passage states his works ''were written just as the printing press was enabling the wider standardisation and codification of English,'' and the enduring popularity of his work ensured his vocabulary entered the written canon.',
      1),
    (v_p09, 'The First Folio was published during Shakespeare''s lifetime.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the First Folio was published in 1623 — ''seven years after his death.''',
      2),
    (v_p09, 'Which of the following best explains why the passage describes attributing specific coinages to Shakespeare as complicated?',
      ARRAY['Shakespeare wrote under multiple pseudonyms, making it unclear which works are genuinely his', 'Words he wrote down may have already been in spoken use, and the historical record is too sparse to confirm he was the first user', 'Many of his manuscripts were destroyed in the Globe Theatre fire, leaving gaps in the written record', 'His handwriting was illegible, making it difficult for historians to transcribe his original texts accurately'],
      'Words he wrote down may have already been in spoken use, and the historical record is too sparse to confirm he was the first user',
      'The passage states ''many words he used may have been in spoken circulation for some time before appearing in his work, and the relative scarcity of contemporaneous documents makes it impossible to establish with certainty'' his priority.',
      3);

  -- ── Passage 10 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 10 — Microplastics and Human Health',
    'Microplastics — particles of plastic smaller than five millimetres — have been found in virtually every environment studied, from deep ocean sediments and Arctic ice to agricultural soils and drinking water. Their ubiquity is a consequence of the physical fragmentation of larger plastic items and the deliberate manufacture of tiny plastic particles used in cosmetics, textiles, and industrial processes. Research into the health effects of microplastics on humans is still at an early stage, but findings to date have raised concern. Studies have detected microplastic particles in human blood, lung tissue, and breast milk, indicating that exposure leads to systemic uptake. Laboratory research suggests that microplastics can provoke inflammatory responses and may carry other harmful contaminants — including pesticides and heavy metals — into cells, acting as vectors for chemical toxicity. However, establishing a causal link between microplastic exposure and specific human health outcomes remains difficult due to the near-universal nature of exposure (which makes comparison groups hard to identify) and the long time periods over which health effects may develop. Regulatory responses have been limited: some jurisdictions have banned microbeads — the tiny plastic particles found in some personal care products — but no country has implemented comprehensive limits on microplastic pollution. Environmental advocates argue that the scale and urgency of the problem justifies precautionary regulation even in the absence of definitive proof of harm.',
    9
  ) RETURNING id INTO v_p10;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p10, 'Microplastics are only found in ocean environments and have not been detected in food or drinking water.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states microplastics have been found ''from deep ocean sediments and Arctic ice to agricultural soils and drinking water'' — explicitly including drinking water.',
      0),
    (v_p10, 'According to the passage, what makes it difficult to establish a causal link between microplastic exposure and human health outcomes?',
      ARRAY['Microplastics are too small to be reliably detected in human tissue samples', 'The health effects of microplastics manifest too quickly to be distinguished from other causes', 'Near-universal exposure makes it hard to find comparison groups, and health effects may take a long time to appear', 'Pharmaceutical companies have blocked the funding of independent research into microplastic health effects'],
      'Near-universal exposure makes it hard to find comparison groups, and health effects may take a long time to appear',
      'The passage states this is difficult ''due to the near-universal nature of exposure (which makes comparison groups hard to identify) and the long time periods over which health effects may develop.''',
      1),
    (v_p10, 'No country has yet implemented comprehensive limits on microplastic pollution.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage explicitly states ''no country has implemented comprehensive limits on microplastic pollution.''',
      2),
    (v_p10, 'What position do environmental advocates take on regulation, according to the passage?',
      ARRAY['They argue regulation should wait until definitive scientific proof of harm is established', 'They contend the problem is too widespread to be addressed through national regulation alone', 'They believe precautionary regulation is justified even without definitive proof of harm', 'They support a complete ban on all plastic production within the next decade'],
      'They believe precautionary regulation is justified even without definitive proof of harm',
      'The passage states advocates argue ''the scale and urgency of the problem justifies precautionary regulation even in the absence of definitive proof of harm.''',
      3);

  -- ── Passage 11 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    4,
    'Passage 11 — The Architecture of the Brain',
    'The human brain contains approximately 86 billion neurons — nerve cells that transmit electrical and chemical signals — connected by an estimated 100 trillion synaptic connections. This extraordinary complexity underlies all human thought, emotion, sensation, and behaviour, yet the brain consumes only about 20 watts of power — less than a dim light bulb. Neurons are organised into networks, and neuroscientists have increasingly moved away from the idea that specific mental functions are localised in discrete brain regions towards a more distributed understanding, in which cognition emerges from the coordinated activity of large-scale networks spanning multiple areas. One influential framework distinguishes between the default mode network — active during rest, mind-wandering, and self-reflection — and task-positive networks engaged during focused attention and goal-directed behaviour. The two networks tend to show an antagonistic relationship, with activation of one typically associated with deactivation of the other. Neuroplasticity — the brain''s capacity to reorganise its structure and function in response to experience, learning, and injury — has emerged as one of the most significant findings of modern neuroscience. It means that the brain is not a static organ but a dynamic one, continuously reshaped by the demands placed upon it. This has important clinical implications: neuroplasticity underlies the brain''s capacity to recover function following stroke or injury, and it forms the rationale for rehabilitative interventions that exploit the brain''s adaptive properties.',
    10
  ) RETURNING id INTO v_p11;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p11, 'According to the passage, how have neuroscientists'' views about the organisation of mental functions in the brain changed?',
      ARRAY['They now believe fewer neurons are involved in complex cognition than previously thought', 'They have moved from viewing functions as localised in specific regions to understanding them as emerging from distributed networks', 'They have concluded that the left and right hemispheres of the brain are entirely independent', 'They now argue that mental functions are determined entirely by genetic factors rather than brain structure'],
      'They have moved from viewing functions as localised in specific regions to understanding them as emerging from distributed networks',
      'The passage states neuroscientists ''have increasingly moved away from the idea that specific mental functions are localised in discrete brain regions towards a more distributed understanding, in which cognition emerges from the coordinated activity of large-scale networks.''',
      0),
    (v_p11, 'The default mode network is most active when a person is engaged in focused, goal-directed tasks.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage describes the default mode network as ''active during rest, mind-wandering, and self-reflection'' — it is task-positive networks that are engaged during focused attention.',
      1),
    (v_p11, 'What does the passage suggest is the clinical significance of neuroplasticity?',
      ARRAY['It allows surgeons to transplant neural tissue from one area of the brain to another', 'It means that brain damage in childhood has no lasting effects on adult function', 'It underpins the brain''s ability to recover from stroke or injury and justifies rehabilitative interventions', 'It enables pharmacological treatments to permanently rewire dysfunctional neural circuits'],
      'It underpins the brain''s ability to recover from stroke or injury and justifies rehabilitative interventions',
      'The passage states ''neuroplasticity underlies the brain''s capacity to recover function following stroke or injury, and it forms the rationale for rehabilitative interventions that exploit the brain''s adaptive properties.''',
      2),
    (v_p11, 'The human brain uses approximately the same amount of power as a standard household light bulb.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the brain consumes ''about 20 watts of power — less than a dim light bulb,'' indicating it uses less power than a standard light bulb.',
      3);

END $$;
