-- Seed: Timed VR Test 1 (test_id = 1)

DO $$
DECLARE
  v_p01 UUID; v_p02 UUID; v_p03 UUID; v_p04 UUID; v_p05 UUID;
  v_p06 UUID; v_p07 UUID; v_p08 UUID; v_p09 UUID; v_p10 UUID;
  v_p11 UUID;
BEGIN

  INSERT INTO timed_verbal_reasoning_tests (id, title, time_minutes)
  VALUES (1, 'VR Timed Test 1', 22)
  ON CONFLICT (id) DO NOTHING;

  -- ── Passage 1 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 1 — The Printing Press and the Spread of Ideas',
    'Before Johannes Gutenberg introduced movable-type printing to Europe in the 1440s, books were produced almost entirely by hand. Scribes, often working within monasteries, would spend months or even years copying a single volume. This painstaking process meant that books were extraordinarily expensive and largely confined to religious institutions and wealthy patrons. Gutenberg''s printing press changed this landscape dramatically. By allowing multiple identical copies to be produced in a fraction of the time, it reduced the cost of books and made written material accessible to a far broader segment of society. Within fifty years of its introduction, it is estimated that over twenty million volumes had been printed across Europe. Scholars debate whether the printing press was the single most important driver of the Renaissance and Reformation, or merely one of several concurrent forces. Nonetheless, few dispute that it fundamentally altered how knowledge was recorded, preserved, and disseminated. The ability to circulate ideas widely — and rapidly — undermined the monopoly that religious and academic institutions had previously held over learning, and planted the seeds for an era of scientific inquiry.',
    0
  ) RETURNING id INTO v_p01;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p01, 'Prior to Gutenberg''s printing press, books in Europe were produced mainly by hand within religious institutions.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that scribes ''often working within monasteries'' copied books by hand, confirming that production was manual and largely confined to religious institutions.',
      0),
    (v_p01, 'The printing press was universally agreed to be the primary cause of the Renaissance.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states that ''scholars debate whether the printing press was the single most important driver,'' indicating there is no universal agreement.',
      1),
    (v_p01, 'Gutenberg was motivated to invent the printing press in order to challenge the authority of the Church.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage makes no mention of Gutenberg''s personal motivations. His intentions cannot be determined from the information given.',
      2),
    (v_p01, 'The printing press contributed to weakening the exclusive control that established institutions had over knowledge.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that the press ''undermined the monopoly that religious and academic institutions had previously held over learning,'' directly supporting this statement.',
      3);

  -- ── Passage 2 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 2 — The Psychology of Sleep',
    'Sleep is far more than a passive state of rest. Over the past few decades, neuroscientists have come to understand that the sleeping brain is engaged in a range of vital processes, including memory consolidation, emotional regulation, and cellular repair. During sleep, the brain cycles through distinct stages, broadly categorised as non-rapid eye movement (NREM) sleep and rapid eye movement (REM) sleep. It is during REM sleep — the stage most associated with vivid dreaming — that the brain is thought to process emotionally charged memories and make complex associative connections between new and existing information. Chronic sleep deprivation has been linked to a host of health consequences, including impaired cognitive function, increased risk of cardiovascular disease, and disruption to the body''s hormonal systems. Some researchers have suggested that modern working patterns, which frequently prioritise productivity over rest, are contributing to a widespread public health crisis. However, the optimal amount of sleep required varies between individuals, and the popular notion that everyone needs exactly eight hours remains an oversimplification not fully supported by clinical evidence.',
    1
  ) RETURNING id INTO v_p02;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p02, 'REM sleep is the stage most closely linked to vivid dreaming.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage directly states that REM sleep is ''the stage most associated with vivid dreaming.''',
      0),
    (v_p02, 'Clinical evidence fully supports the claim that all adults require exactly eight hours of sleep.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states that the eight-hour notion ''remains an oversimplification not fully supported by clinical evidence.''',
      1),
    (v_p02, 'The majority of neuroscientists believe that modern working patterns are the leading cause of sleep deprivation.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage notes that ''some researchers'' have suggested this link, but gives no indication of what the majority of neuroscientists believe.',
      2),
    (v_p02, 'According to the passage, what best describes the brain during sleep?',
      ARRAY['Inactive and recovering from daily activity', 'Engaged in essential biological and cognitive processes', 'Primarily focused on regulating body temperature', 'Replaying recent memories in chronological order'],
      'Engaged in essential biological and cognitive processes',
      'The passage describes sleep as involving memory consolidation, emotional regulation, and cellular repair — all active, essential processes — directly contradicting the idea of passivity.',
      3);

  -- ── Passage 3 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 3 — The Rise and Fall of the Aral Sea',
    'Once the fourth-largest lake in the world, the Aral Sea — straddling the borders of modern-day Kazakhstan and Uzbekistan — has largely disappeared over the past six decades. In the 1960s, Soviet planners diverted the two rivers that fed the Aral Sea, the Amu Darya and the Syr Darya, to irrigate vast cotton fields across Central Asia. The project was economically motivated and initially celebrated as an engineering triumph. However, with its water sources redirected, the Aral Sea began to shrink at a catastrophic rate. By the 2000s, the sea had split into several smaller, highly saline remnants. The fishing industry, which had once supported tens of thousands of livelihoods, collapsed entirely. Abandoned ships now sit rusting on what was formerly the seabed, a striking visual symbol of environmental mismanagement. The desiccation also triggered severe regional dust storms, carrying salt and pesticide residue across populated areas and causing serious respiratory illness in local communities. International efforts to restore parts of the northern section — through the construction of the Kok-Aral Dam in Kazakhstan — have seen some modest success, with water levels rising slightly and fish populations beginning to return in limited areas.',
    2
  ) RETURNING id INTO v_p03;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p03, 'The Aral Sea was once considered the fourth-largest lake in the world.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage opens by explicitly stating the Aral Sea was ''once the fourth-largest lake in the world.''',
      0),
    (v_p03, 'The Soviet diversion of the Aral Sea''s rivers was primarily intended to support the fishing industry.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the rivers were diverted ''to irrigate vast cotton fields,'' not to support fishing.',
      1),
    (v_p03, 'The Kok-Aral Dam has fully restored the Aral Sea to its former size.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage describes only ''modest success'' with water levels rising ''slightly'' — there is no suggestion of full restoration.',
      2),
    (v_p03, 'Which of the following best explains why dust storms in the region posed a health risk?',
      ARRAY['They carried extreme heat that caused dehydration in local populations', 'They transported salt and pesticide residue that caused respiratory problems', 'They buried agricultural land and destroyed the cotton harvest', 'They brought foreign diseases from neighbouring countries'],
      'They transported salt and pesticide residue that caused respiratory problems',
      'The passage specifically states dust storms carried ''salt and pesticide residue across populated areas and causing serious respiratory illness.''',
      3);

  -- ── Passage 4 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 4 — The Ethics of Artificial Intelligence in Healthcare',
    'Artificial intelligence is rapidly transforming healthcare, with algorithms now capable of detecting certain cancers in medical imaging with accuracy comparable to — and in some cases exceeding — that of experienced clinicians. Proponents argue that AI can reduce diagnostic errors, improve efficiency, and extend high-quality care to underserved populations who lack access to specialist physicians. However, critics raise significant ethical concerns. Chief among these is the issue of accountability: when an AI system makes a diagnostic error that harms a patient, it is unclear whether responsibility lies with the developer, the hospital deploying the system, or the clinician who relied upon it. There are also concerns about algorithmic bias — many AI systems are trained on datasets that underrepresent certain ethnic and demographic groups, raising the possibility that such tools may perform less accurately for patients from those backgrounds. Additionally, the integration of AI into clinical decision-making risks eroding the patient-doctor relationship, which many argue is itself therapeutically important. Regulatory frameworks governing medical AI remain underdeveloped in most countries, and experts warn that deployment is outpacing the establishment of adequate oversight mechanisms.',
    3
  ) RETURNING id INTO v_p04;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p04, 'AI systems have been shown to detect some cancers as accurately as, or more accurately than, experienced clinicians.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states AI can detect certain cancers ''with accuracy comparable to — and in some cases exceeding — that of experienced clinicians.''',
      0),
    (v_p04, 'Current regulatory frameworks in most countries are well-equipped to handle the deployment of medical AI.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly states that ''regulatory frameworks governing medical AI remain underdeveloped in most countries.''',
      1),
    (v_p04, 'According to the passage, what is the primary concern critics have about AI in healthcare?',
      ARRAY['AI will eventually replace all doctors', 'The cost of AI systems is prohibitive for most hospitals', 'It is unclear who bears responsibility when AI causes patient harm', 'AI systems are unable to process large volumes of medical data'],
      'It is unclear who bears responsibility when AI causes patient harm',
      'The passage states that accountability is ''chief among'' the ethical concerns raised by critics, describing uncertainty over where responsibility lies when AI errors harm patients.',
      2),
    (v_p04, 'AI tools trained on non-representative datasets may be less reliable for patients from underrepresented groups.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage raises the concern that AI systems trained on datasets underrepresenting certain groups may ''perform less accurately for patients from those backgrounds.''',
      3);

  -- ── Passage 5 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 5 — The History of Vaccination',
    'The concept of deliberately inducing immunity to disease predates modern medicine by centuries. In 17th-century China and the Ottoman Empire, a practice known as variolation was used to protect individuals from smallpox. This involved introducing material from a smallpox pustule into a healthy person, who would typically develop a mild form of the disease and subsequently be immune. The practice carried real risks — a small proportion of those variolated died — but these risks were considered acceptable given the devastation that smallpox routinely caused. Edward Jenner''s development of the smallpox vaccine in 1796 built upon this tradition but used material from cowpox, a far less dangerous disease, to confer immunity. Jenner''s approach laid the conceptual foundations for modern vaccinology. Over the following two centuries, vaccines were developed for diseases including polio, measles, and tuberculosis. The global campaign to eradicate smallpox, conducted by the World Health Organisation, culminated in the disease being declared eradicated in 1980 — the first and, to date, only human infectious disease to be eradicated through vaccination. Public health experts widely regard this achievement as one of the greatest in the history of medicine.',
    4
  ) RETURNING id INTO v_p05;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p05, 'Variolation involved the use of cowpox material to protect against smallpox.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states variolation used material from a smallpox pustule, not cowpox. It was Jenner''s vaccine that used cowpox material.',
      0),
    (v_p05, 'Smallpox is the only human infectious disease to have been eradicated through vaccination.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage describes smallpox as ''the first and, to date, only human infectious disease to be eradicated through vaccination.''',
      1),
    (v_p05, 'Edward Jenner was aware of variolation practices in China and the Ottoman Empire when he developed his vaccine.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage does not state whether Jenner was aware of these earlier practices; it only notes that his work ''built upon this tradition'' without specifying his knowledge of foreign methods.',
      2),
    (v_p05, 'Why was variolation considered an acceptable medical practice despite its risks?',
      ARRAY['It was endorsed by governments and therefore considered safe', 'The mortality rate from variolation was zero', 'The risks were outweighed by the severity of naturally occurring smallpox', 'It was only used on individuals who were already infected'],
      'The risks were outweighed by the severity of naturally occurring smallpox',
      'The passage states the risks ''were considered acceptable given the devastation that smallpox routinely caused,'' indicating a risk-benefit judgement.',
      3);

  -- ── Passage 6 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 6 — Urban Green Spaces and Mental Health',
    'Growing evidence suggests that access to green spaces within urban environments is associated with improved mental wellbeing. Studies conducted across multiple countries have found that city residents who live closer to parks, gardens, and tree-lined streets report lower levels of psychological distress and higher levels of life satisfaction compared with those who have limited access to such spaces. Researchers have proposed several mechanisms to explain this relationship. Exposure to natural environments appears to reduce activity in brain regions associated with rumination — repetitive, negative thought patterns linked to depression. Green spaces also facilitate social interaction and physical activity, both of which independently support mental health. However, the relationship is not straightforwardly causal. People who live near green spaces often have higher incomes and access to a broader range of health-supportive resources, making it difficult to isolate the specific contribution of nature exposure. Urban planners and public health policymakers increasingly argue that incorporating green spaces into city design should be treated as a health priority, particularly in densely populated areas where residents have few alternatives for experiencing natural environments.',
    5
  ) RETURNING id INTO v_p06;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p06, 'Research suggests that urban residents near green spaces experience lower levels of psychological distress.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that residents near green spaces ''report lower levels of psychological distress,'' directly supporting this statement.',
      0),
    (v_p06, 'The link between green spaces and improved mental health is definitively proven to be caused by nature exposure alone.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage explicitly notes that ''the relationship is not straightforwardly causal'' and identifies confounding factors such as income, meaning causality cannot be attributed to nature exposure alone.',
      1),
    (v_p06, 'Which of the following does the passage identify as a proposed mechanism linking green spaces to better mental health?',
      ARRAY['Reduced exposure to urban noise pollution', 'Increased sunlight absorption leading to higher vitamin D levels', 'Reduced activity in brain regions linked to negative thought patterns', 'Improved air quality resulting in better physical health'],
      'Reduced activity in brain regions linked to negative thought patterns',
      'The passage specifically mentions that ''exposure to natural environments appears to reduce activity in brain regions associated with rumination.''',
      2),
    (v_p06, 'Urban planners universally agree that green spaces should be the top priority in all city planning decisions.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage states that planners ''increasingly argue'' green spaces should be a health priority, but gives no indication of universal agreement or that it is considered the absolute top priority above all others.',
      3);

  -- ── Passage 7 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 7 — The Economics of Fair Trade',
    'The fair trade movement emerged in the latter half of the 20th century in response to concerns that the global commodity trade was systematically disadvantaging small-scale producers in developing countries. By guaranteeing a minimum price for goods such as coffee, cocoa, and bananas — irrespective of fluctuations in global market prices — fair trade certification aims to provide producers with greater financial stability. In addition to price guarantees, certified organisations must meet standards around labour rights, environmental practices, and community investment. Proponents argue that fair trade empowers producers, reduces poverty, and promotes sustainable agriculture. Critics, however, question whether the model delivers on its promises in practice. Some economists argue that price guarantees can reduce the incentive for producers to improve quality or adapt to changing market demands. Others point out that a significant portion of the premium paid by consumers does not reach the farmer directly, instead being absorbed by certification bodies and intermediaries in the supply chain. Research into the actual income gains experienced by fair-trade-certified farmers has yielded mixed results, with some studies showing modest improvements and others finding negligible differences compared with non-certified counterparts.',
    6
  ) RETURNING id INTO v_p07;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p07, 'Fair trade certification guarantees that producers will always receive prices above the global market rate.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage describes a minimum price guarantee ''irrespective of fluctuations in global market prices,'' but does not state that this price is always above the global market rate — only that it provides a floor.',
      0),
    (v_p07, 'Some economists argue that price guarantees might discourage producers from improving the quality of their goods.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that ''some economists argue that price guarantees can reduce the incentive for producers to improve quality.''',
      1),
    (v_p07, 'Studies consistently show that fair-trade-certified farmers earn significantly more than non-certified farmers.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states research has ''yielded mixed results,'' with some studies finding ''negligible differences'' — directly contradicting the claim of consistent, significant gains.',
      2),
    (v_p07, 'According to the passage, what is one reason why consumers'' fair trade premiums may not fully benefit farmers?',
      ARRAY['Farmers spend the premium on non-essential goods', 'Governments in producing countries tax fair trade revenue', 'A portion of the premium is retained by certification bodies and intermediaries', 'The premium is reinvested into environmental conservation projects'],
      'A portion of the premium is retained by certification bodies and intermediaries',
      'The passage explicitly states that ''a significant portion of the premium paid by consumers does not reach the farmer directly, instead being absorbed by certification bodies and intermediaries in the supply chain.''',
      3);

  -- ── Passage 8 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 8 — The Decline of Cursive Handwriting',
    'In recent years, several countries have removed the formal teaching of cursive handwriting from their school curricula, prompting considerable debate among educators, neuroscientists, and parents. Advocates of retaining cursive instruction argue that the physical act of forming letters by hand engages different and arguably richer cognitive processes than typing. Research published in educational psychology journals has suggested that students who take notes by hand tend to process and retain information more deeply than those who type, as the relative slowness of handwriting forces more active summarisation and engagement with material. Opponents of mandatory cursive teaching, however, contend that in an increasingly digital world, the time devoted to handwriting instruction would be better spent on digital literacy and other skills more directly relevant to students'' futures. They also note that printing — rather than cursive — is sufficient for most everyday handwriting needs. Some neuroscientists have highlighted that the fine motor skills involved in cursive writing contribute to broader neurological development in young children, although they acknowledge that this research is still evolving. The debate ultimately reflects a broader tension in education between the preservation of established practices and the need to prepare students for rapidly changing technological environments.',
    7
  ) RETURNING id INTO v_p08;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p08, 'All countries in the world have removed cursive handwriting from their school curricula.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states that ''several countries'' have removed cursive instruction — not all countries.',
      0),
    (v_p08, 'Some research suggests that handwritten note-taking may lead to better information retention than typed notes.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage references research suggesting students who take notes by hand ''tend to process and retain information more deeply than those who type.''',
      1),
    (v_p08, 'According to opponents of cursive teaching, what would be a better use of the time currently devoted to it?',
      ARRAY['Additional mathematics and science instruction', 'Physical education and sport', 'Developing digital literacy and future-relevant skills', 'More time for reading classic literature'],
      'Developing digital literacy and future-relevant skills',
      'The passage states that opponents believe time ''would be better spent on digital literacy and other skills more directly relevant to students'' futures.''',
      2),
    (v_p08, 'The neurological benefits of cursive writing for children''s development are conclusively established by current research.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage notes that neuroscientists ''acknowledge that this research is still evolving,'' indicating the evidence is not yet conclusive.',
      3);

  -- ── Passage 9 ────────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 9 — The Language of Bees',
    'Among the most remarkable discoveries in animal behaviour research is the finding that honeybees communicate the location of food sources to their hive-mates through a highly structured series of movements known as the waggle dance. First described in detail by the Austrian zoologist Karl von Frisch in the 1940s, the waggle dance encodes information about both the direction and distance of a food source relative to the hive. The direction of the dance corresponds to the angle of the food source relative to the sun, while the duration of the waggling phase correlates with the distance the foraging bee has flown. Von Frisch was awarded the Nobel Prize in Physiology or Medicine in 1973 for his work on this and related discoveries. Subsequent research has confirmed and extended his findings, demonstrating that bees can also communicate information about the quality of a food source through the vigour of the dance. More recently, researchers have begun using miniature radio trackers to study how bees integrate the information from waggle dances with their own navigational experience, finding that experienced foragers may sometimes choose to rely on their own memory rather than following the directions of a dancer.',
    8
  ) RETURNING id INTO v_p09;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p09, 'Karl von Frisch was the first scientist to observe that bees perform a waggle dance.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage states that von Frisch ''first described [the waggle dance] in detail,'' but does not state whether he was the first to observe it. Earlier, less detailed observations by others cannot be ruled out.',
      0),
    (v_p09, 'The duration of the waggling phase in a bee''s dance indicates how far the food source is from the hive.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage directly states that ''the duration of the waggling phase correlates with the distance the foraging bee has flown.''',
      1),
    (v_p09, 'All bees always follow the directions of a waggle dance when foraging.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states that experienced foragers ''may sometimes choose to rely on their own memory rather than following the directions of a dancer,'' contradicting the idea that all bees always follow the dance.',
      2),
    (v_p09, 'According to the passage, what additional information can bees communicate through the waggle dance beyond direction and distance?',
      ARRAY['The temperature at the food source', 'The number of other bees already foraging there', 'The quality of the food source', 'The time of day at which the food source is most productive'],
      'The quality of the food source',
      'The passage states that ''bees can also communicate information about the quality of a food source through the vigour of the dance.''',
      3);

  -- ── Passage 10 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 10 — The Placebo Effect in Modern Medicine',
    'The placebo effect — whereby patients experience genuine improvements in symptoms after receiving a treatment with no active pharmacological ingredient — has long been regarded as a nuisance in clinical research, something to be controlled for rather than studied in its own right. Yet mounting evidence suggests that placebo responses are far more complex and therapeutically interesting than this dismissive view implies. Neuroimaging studies have shown that placebo treatments can trigger the release of endogenous opioids in the brain, producing measurable reductions in pain that are physiologically real, not merely imagined. The magnitude of the placebo effect appears to be influenced by several contextual factors, including the confidence and warmth of the clinician administering the treatment, the impressiveness of the clinical setting, and even the colour and size of the pill provided. Controversially, some researchers have begun investigating ''open-label'' placebos — treatments that patients are told explicitly are inert — and have found that these still produce significant benefits in conditions such as chronic pain and irritable bowel syndrome. This challenges the assumption that deception is a necessary component of the placebo response. Critics, however, warn that an excessive focus on harnessing placebo effects risks undermining the rigorous testing and adoption of genuinely efficacious treatments.',
    9
  ) RETURNING id INTO v_p10;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p10, 'The placebo effect has historically been viewed as a useful tool in clinical treatment rather than a confounding variable.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states the placebo effect has ''long been regarded as a nuisance in clinical research, something to be controlled for,'' indicating it was historically seen as problematic, not useful.',
      0),
    (v_p10, 'Neuroimaging evidence shows that placebo treatments can trigger the release of natural pain-relieving chemicals in the brain.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states that ''neuroimaging studies have shown that placebo treatments can trigger the release of endogenous opioids in the brain, producing measurable reductions in pain.''',
      1),
    (v_p10, 'Open-label placebos are only effective in patients who do not know they are receiving a placebo.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage describes open-label placebos as treatments ''that patients are told explicitly are inert'' that still ''produce significant benefits,'' directly contradicting the need for patient ignorance.',
      2),
    (v_p10, 'According to the passage, which of the following factors influences the strength of the placebo effect?',
      ARRAY['The patient''s level of formal education', 'The age and gender of the patient', 'The confidence and warmth of the treating clinician', 'The specific disease being treated'],
      'The confidence and warmth of the treating clinician',
      'The passage explicitly lists ''the confidence and warmth of the clinician administering the treatment'' as one of the contextual factors influencing the magnitude of the placebo effect.',
      3);

  -- ── Passage 11 ───────────────────────────────────────────────
  INSERT INTO timed_verbal_reasoning_passages (test_id, title, body, order_index)
  VALUES (
    1,
    'Passage 11 — The Origins of the Olympic Games',
    'The ancient Olympic Games were held at Olympia, in the western Peloponnese region of Greece, and are traditionally dated to 776 BCE, though some historians believe athletic competitions at the site may predate this by several centuries. The games were held every four years and formed part of a broader religious festival honouring Zeus, the chief deity of the Greek pantheon. Athletes came from city-states across the Greek world to compete in events including foot races, wrestling, chariot racing, and the pentathlon. Crucially, participation was restricted to free Greek-speaking men; women, slaves, and foreigners were barred from competing and, in some periods, even from attending. The games continued for over a millennium before the Roman Emperor Theodosius I ordered their abolition in 393 CE, reportedly on the grounds that they were a pagan institution incompatible with the empire''s adoption of Christianity. The modern Olympic Games were revived in 1896 by Pierre de Coubertin, a French educator who believed that athletic competition could foster international understanding and peace. De Coubertin''s vision, though idealistic, has not been without controversy, as the games have frequently been entangled with political tensions, boycotts, and disputes over commercialisation throughout their modern history.',
    10
  ) RETURNING id INTO v_p11;

  INSERT INTO timed_verbal_reasoning_questions (passage_id, question_text, options, correct_answer, answer_reason, order_index) VALUES
    (v_p11, 'The ancient Olympic Games were open to all male inhabitants of the Greek world.',
      ARRAY['True', 'False', 'Can''t tell'],
      'False',
      'The passage states participation was restricted to ''free Greek-speaking men,'' explicitly excluding slaves — not all male inhabitants.',
      0),
    (v_p11, 'Pierre de Coubertin revived the Olympic Games because he believed sport could promote peace between nations.',
      ARRAY['True', 'False', 'Can''t tell'],
      'True',
      'The passage states de Coubertin ''believed that athletic competition could foster international understanding and peace.''',
      1),
    (v_p11, 'Theodosius I abolished the ancient Olympics because he personally disliked athletic competition.',
      ARRAY['True', 'False', 'Can''t tell'],
      'Can''t tell',
      'The passage states the abolition was ''reportedly'' on religious grounds, but gives no indication of Theodosius''s personal feelings about sport. His personal views cannot be determined from the passage.',
      2),
    (v_p11, 'According to the passage, which best describes the modern Olympic Games since their revival?',
      ARRAY['A consistently peaceful celebration of international unity free from controversy', 'An event that has been shaped by political tensions, boycotts, and commercial disputes', 'A small regional competition that gradually grew into a global event', 'An initiative that was quickly abandoned due to lack of international interest'],
      'An event that has been shaped by political tensions, boycotts, and commercial disputes',
      'The passage states the modern games ''have frequently been entangled with political tensions, boycotts, and disputes over commercialisation throughout their modern history.''',
      3);

END $$;
