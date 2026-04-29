// Static VR worked-example passages used by the VR Learning Pathway.
// Each entry is a single passage + one question with a step-by-step
// answeringReason that walks the student through the method.
// Indexed by lesson id so the learn screen can launch the matching
// example from each Worked Example lesson.
//
// Passages are written to UCAT VR specifications (see
// .claude/UCAT-VR-QUESTION-GENERATOR.md) but at the shorter end of the
// 200-400 word range because each passage anchors only one question.
// Not loaded from Supabase; not stored in attempts cache.

export const VR_WORKED_EXAMPLES = {
  'tfct-example-supported': {
    id: 'vr-we-tfct-supported',
    topic: 'True / False / Can\'t Tell',
    title: 'The Eddystone Lighthouse',
    isFree: true,
    resource:
      "The Eddystone rocks lie roughly 14 miles south of Plymouth in the English Channel, and have wrecked vessels for centuries. The first lighthouse built on the reef was completed in 1698 by Henry Winstanley, an Essex merchant with no formal engineering training. His timber structure stood for less than five years before a great storm in November 1703 destroyed it entirely, killing Winstanley and five workers who were inside performing repairs at the time.\n\nA second wooden tower, designed by John Rudyerd, was finished in 1709 and lasted nearly half a century before fire consumed it in 1755. The replacement was commissioned from John Smeaton, a Yorkshire-born civil engineer, who chose to build in stone. Smeaton modelled the profile of his tower on the trunk of an English oak, reasoning that a flared base would resist wave forces more effectively than a straight column. He also pioneered the use of hydraulic lime, a mortar that set under water, which proved essential for the foundation work.\n\nSmeaton's tower, lit in 1759, served the Channel for 120 years until erosion of the rock beneath forced its replacement in 1882. The upper portion was dismantled and re-erected on Plymouth Hoe, where it still stands as a public monument. The current lighthouse, designed by James Douglass and completed on an adjacent rock, was automated in 1982 and remains operational today.",
    questions: [
      {
        questionId: 'vr-we-tfct-supported-q1',
        questionText: 'Smeaton based the shape of his lighthouse on the form of an oak tree.',
        options: ['True', 'False', "Can't tell"],
        answer: 'True',
        answeringReason:
          "Classify and predict:\nThis is a TFC statement that paraphrases a single passage detail. The likely answer is True if the passage states the same idea in slightly different words.\n\nFind the anchor:\nScan for 'Smeaton' and 'oak'. Both are distinctive nouns and they sit together in paragraph 2.\n\nRead locally:\nThe passage says: 'Smeaton modelled the profile of his tower on the trunk of an English oak.' The statement says he 'based the shape of his lighthouse on the form of an oak tree.' 'Profile' = 'shape', 'modelled on' = 'based on', 'trunk of an English oak' = 'an oak tree'. No scope shift, no extra claim, no quantifier change.\n\nAudit the options:\n• True — Correct: a clean paraphrase of an explicit passage line.\n• False — Wrong: nothing in the passage contradicts this; the design link to the oak is stated directly.\n• Can't tell — Wrong: the passage does provide enough information to decide, so Can't tell does not apply.\n\nTakeaway:\nWhen a TFC statement matches a single passage sentence almost word-for-word, with synonyms swapped in but no extra scope or quantifier added, True is the safe answer. Don't second-guess clean paraphrases just because they look easy.",
      },
    ],
  },

  'tfct-example-contradiction': {
    id: 'vr-we-tfct-contradiction',
    topic: 'True / False / Can\'t Tell',
    title: 'The Antikythera Mechanism',
    isFree: true,
    resource:
      "In 1901, sponge divers working off the small Greek island of Antikythera recovered a corroded lump of bronze and wood from a Roman-era shipwreck. For decades the object lay largely ignored in the National Archaeological Museum in Athens, dismissed by some scholars as a navigational astrolabe of relatively recent date. Only in 1951 did the British physicist Derek de Solla Price begin a systematic study, and his X-ray analyses in the 1970s revealed an intricate system of at least 30 interlocking bronze gears.\n\nLater imaging campaigns, including high-resolution computed tomography in 2005, established that the mechanism was constructed in the second century BCE, almost certainly in the Greek-speaking world. It functioned as a hand-cranked analogue computer that tracked the positions of the Sun and Moon, predicted lunar and solar eclipses, and displayed the four-year cycle of the ancient Olympic Games. Inscriptions on the casing, written in Koine Greek, served as a user manual of sorts.\n\nNo comparable device is known from antiquity, and engineering of similar complexity does not reappear in the surviving record until medieval astronomical clocks built in fourteenth-century Europe. Researchers continue to debate who designed the mechanism — Archimedes, Hipparchus and the school of Posidonius on Rhodes have all been proposed — but no surviving text names its maker, and the question remains formally unresolved.",
    questions: [
      {
        questionId: 'vr-we-tfct-contradiction-q1',
        questionText: 'The identity of the person who built the Antikythera mechanism has been firmly established.',
        options: ['True', 'False', "Can't tell"],
        answer: 'False',
        answeringReason:
          "Classify and predict:\nThis is a TFC statement making a definite claim ('firmly established') about authorship. Watch for a passage that explicitly closes the question the other way — that would make this False, not Can't tell.\n\nFind the anchor:\nScan for 'designed', 'maker', or names like 'Archimedes'. These cluster in the final paragraph.\n\nRead locally:\nThe passage says researchers 'continue to debate who designed the mechanism', that 'no surviving text names its maker', and that 'the question remains formally unresolved.' This is an active statement that the identity is NOT established — a direct contradiction of the candidate statement.\n\nAudit the options:\n• True — Wrong: the passage explicitly says the maker is unknown.\n• False — Correct: the passage states the question is unresolved, which contradicts 'firmly established' head-on.\n• Can't tell — Wrong: this is the most tempting trap, but Can't tell requires absence of information. Here the passage actively addresses authorship and tells us it is undetermined, so we have enough to mark False.\n\nTrap:\nFalse vs Can't tell. Many students default to Can't tell whenever a fact 'isn't known', but the passage's explicit statement that the question is unresolved is itself information that contradicts a claim of firm establishment.\n\nTakeaway:\nFalse requires the passage to actively contradict the statement. A passage saying 'X is unknown' contradicts a statement claiming 'X has been established' — that is contradiction, not absence.",
      },
    ],
  },

  'tfct-example-cant-tell': {
    id: 'vr-we-tfct-cant-tell',
    topic: "True / False / Can't Tell",
    title: "L'Anse aux Meadows",
    isFree: true,
    resource:
      "L'Anse aux Meadows, a windswept cove on the northern tip of Newfoundland, contains the only confirmed Norse settlement in the Americas outside Greenland. The site was identified in 1960 by the Norwegian explorer Helge Ingstad and his archaeologist wife Anne Stine Ingstad, who excavated eight timber-and-sod buildings between 1961 and 1968. Radiocarbon analysis later refined by dendrochronological dating of a felled tree placed Norse occupation at around 1021 CE, roughly 470 years before Columbus reached the Caribbean.\n\nThe layout of the buildings — three large halls, a smithy, a carpentry workshop, and several smaller huts — suggests a base camp rather than a permanent colony. Excavators recovered a small number of iron nails, a soapstone spindle whorl indicating the presence of women, and slag from on-site iron smelting. Notably absent are byres or any structures associated with livestock, and no Norse cemetery has been found nearby.\n\nMost scholars now interpret L'Anse aux Meadows as a short-lived gateway from which the Norse explored further south into regions they called Vinland. Butternut shells recovered at the site grow no further north than New Brunswick, indicating that travel beyond Newfoundland definitely occurred. How many seasons the camp was occupied, and why it was ultimately abandoned, remain matters of active debate.",
    questions: [
      {
        questionId: 'vr-we-tfct-cant-tell-q1',
        questionText: 'Norse explorers reached the Caribbean before Columbus.',
        options: ['True', 'False', "Can't tell"],
        answer: "Can't tell",
        answeringReason:
          "Classify and predict:\nThis is a TFC statement that extends a claim about Norse exploration to a much broader geographic scope (the Caribbean). Predict a scope mismatch trap.\n\nFind the anchor:\nScan for 'Caribbean' and 'Columbus'. 'Columbus' appears once in paragraph 1; 'Caribbean' appears only in that same sentence.\n\nRead locally:\nThe passage says Norse occupation was 'roughly 470 years before Columbus reached the Caribbean.' That is purely a date benchmark — it tells us when the Norse were in Newfoundland relative to Columbus's Caribbean arrival. It does not say the Norse themselves went to the Caribbean. The passage says they explored 'further south into regions they called Vinland', and butternut shells suggest travel as far as New Brunswick — nowhere near the Caribbean.\n\nAudit the options:\n• True — Wrong: the mention of Columbus is a chronological comparison, not evidence that the Norse reached the Caribbean.\n• False — Wrong: the passage does not state the Norse failed to reach the Caribbean; it simply does not address that range of travel.\n• Can't tell — Correct: the passage covers Norse travel as far as New Brunswick but is silent on whether they ever went further south.\n\nTrap:\nScope mismatch. The passage covers a small subset of possible Norse travel; the statement extrapolates to a far broader scope.\n\nTakeaway:\nWhen a statement extends a claim beyond the geographic, temporal, or categorical scope the passage covers, default to Can't tell — even if the passage mentions related-sounding words like 'Columbus' or 'Caribbean' in passing.",
      },
    ],
  },

  'detail-example': {
    id: 'vr-we-detail',
    topic: 'Multiple choice: direct detail',
    title: 'The Bessemer Converter',
    isFree: true,
    resource:
      "Until the middle of the nineteenth century, steel was a luxury material, produced in small batches by the laborious crucible process and reserved for cutlery, springs, and fine tools. Wrought iron and cast iron dominated industrial use, but neither combined the strength and ductility that engineers wanted for rails, bridges, and ship plate. The breakthrough came from Henry Bessemer, an English inventor who had previously made his fortune from a gold-coloured bronze powder used in printing.\n\nBessemer's converter, patented in 1856, was a pear-shaped vessel lined with refractory clay and tilted on trunnions. Air was blown through molten pig iron from the base, and the oxygen burned off carbon and silicon impurities in a violent reaction lasting around twenty minutes. A single converter could process up to thirty tonnes of metal per blow — a scale unimaginable under earlier methods. Early trials in Sheffield in 1858 failed because the British pig iron used contained too much phosphorus, and it was only after Robert Mushet added spiegeleisen, a manganese-rich alloy, that consistent steel was produced.\n\nThe converter was made obsolete in most applications by the open-hearth furnace from the 1900s onwards, and finally by the basic oxygen process introduced in Austria in 1952. The last Bessemer converter in regular British service was retired in 1974.",
    questions: [
      {
        questionId: 'vr-we-detail-q1',
        questionText: "In what year was Bessemer's converter patented?",
        options: ['1852', '1856', '1858', '1859'],
        answer: '1856',
        answeringReason:
          "Classify and predict:\nMC fact-finding question with a specific year as the answer. Predict an 'almost-right' distractor — another year that genuinely appears in the passage but refers to a different event.\n\nFind the anchor:\nThe most distinctive word is 'patented'. Scan the passage for that word; it appears once, opening paragraph 2.\n\nRead locally:\nThe passage says: 'Bessemer's converter, patented in 1856, was a pear-shaped vessel...'. That is a direct match.\n\nAudit the options:\n• 1852 — Wrong: this year does not appear in the passage at all. Pure fabrication, designed to look plausible because it falls in the same decade.\n• 1856 — Correct: matches the passage word-for-word as the patent year.\n• 1858 — Wrong: 1858 does appear in the passage, but it is the year of the failed Sheffield trials, not the patent. Almost-right trap — right kind of fact attached to the wrong event.\n• 1859 — Wrong: not in the passage; another plausible-looking decade-mate distractor.\n\nTrap:\nAlmost-right number trap. 1858 is grabbed by students who anchor on 'Bessemer' and 'Sheffield' instead of on the specific word 'patented', and stop reading at the first year they see.\n\nTakeaway:\nAnchor on the most distinctive word in the question stem (here, 'patented'), and read the entire sentence containing it before committing. When several plausible numbers appear in a passage, the correct one will be the one tied to the exact action named in the question.",
      },
    ],
  },

  'detail-paraphrase-example': {
    id: 'vr-we-detail-paraphrase',
    topic: 'Multiple choice: detail with paraphrase',
    title: 'The Lyme Regis Belemnites',
    isFree: true,
    resource:
      "Mary Anning, the self-taught fossil hunter of Lyme Regis on England's Dorset coast, is best known today for her 1811 ichthyosaur and her 1823 plesiosaur. Less celebrated is the role she played in clarifying the nature of belemnites, the cigar-shaped fossils that crumble out of the Blue Lias cliffs in their thousands. By the late 1820s, Anning had recovered several specimens in which the calcite \"guard\" was preserved alongside a chambered phragmocone and, crucially, traces of the soft body. In an 1829 letter to the geologist William Buckland, she noted that some specimens contained a sooty residue that resembled the ink sacs she had observed in modern cuttlefish brought ashore at the Cobb harbour.\n\nBuckland tested the residue and reported in 1830 that it could be ground and used as a serviceable sepia ink. He drew a cautious inference: belemnites were probably extinct relatives of squid and cuttlefish, not, as some continental anatomists had argued, internal shells of fish. Anning herself avoided strong claims in print, writing only that the resemblance to cuttlefish was \"considerable\" and that further specimens might settle the matter.\n\nLater nineteenth-century paleontologists, working with German and Yorkshire material, confirmed the cephalopod identification. The Dorset finds, however, retained their importance because they preserved soft-tissue traces almost nowhere else available, and because Anning's careful field notes on the position of the ink sac within the guard guided generations of subsequent reconstructions.",
    questions: [
      {
        questionId: 'vr-we-detail-paraphrase-q1',
        questionText: "Which of the following statements about Mary Anning's claims regarding belemnites is best supported by the passage?",
        options: [
          'Anning suggested belemnites bore a notable resemblance to cuttlefish but stopped short of asserting the matter was settled.',
          'Anning declared belemnites to be unmistakably the ancestors of modern cuttlefish.',
          'Anning argued that belemnites were the internal shells of extinct fish.',
          'Anning was the first to grind belemnite residue into a usable sepia ink.',
        ],
        answer: 'Anning suggested belemnites bore a notable resemblance to cuttlefish but stopped short of asserting the matter was settled.',
        answeringReason:
          "Classify and predict:\nDetail/paraphrase question. The correct option must restate Anning's printed claim with both topic and strength preserved.\n\nFind the anchor:\nScan for Anning's own words about cuttlefish — keywords 'considerable', 'further specimens', 'settle the matter'.\n\nRead locally:\nParagraph 2 ends: 'Anning herself avoided strong claims in print, writing only that the resemblance to cuttlefish was \"considerable\" and that further specimens might settle the matter.' Two facts to preserve: (1) topic = resemblance to cuttlefish; (2) strength = hedged, she said it was considerable but not yet settled.\n\nAudit the options:\n• 'Anning suggested belemnites bore a notable resemblance to cuttlefish but stopped short of asserting the matter was settled.' — Correct. 'Notable resemblance' paraphrases 'considerable'; 'stopped short of asserting the matter was settled' preserves her hedge that further specimens 'might settle the matter'.\n• 'Anning declared belemnites to be unmistakably the ancestors of modern cuttlefish.' — Same topic but the strength is hardened: 'declared' and 'unmistakably' overshoot 'considerable' and 'might settle'. Paraphrase distortion trap.\n• 'Anning argued that belemnites were the internal shells of extinct fish.' — Wrong-entity attribution: this is the continental anatomists' view, not Anning's.\n• 'Anning was the first to grind belemnite residue into a usable sepia ink.' — Wrong actor: the passage attributes the grinding test to Buckland, not Anning.\n\nTrap:\nParaphrase distortion via strength shift — keeping the same topic but pushing hedged language ('considerable', 'might settle') into definitive language ('declared', 'unmistakably').\n\nTakeaway:\nA faithful paraphrase preserves both the topic AND the strength of the original claim. If you have to soften or harden the passage's language to make an option work, it is wrong, even when every keyword still looks familiar.",
      },
    ],
  },

  'inference-example': {
    id: 'vr-we-inference',
    topic: 'Multiple choice: inference',
    title: "Iceland's Turf Houses",
    isFree: true,
    resource:
      "For more than a thousand years, the dominant form of rural dwelling in Iceland was the turf house, a structure built from a timber frame packed with thick blocks of cut sod. Driftwood and imported pine were scarce on the treeless island, so settlers economised on wood by burying their homes in earth up to the eaves. The result was a building with walls sometimes two metres thick, capable of retaining heat through long sub-Arctic winters.\n\nArchaeological surveys carried out by the National Museum of Iceland between 1998 and 2012 documented more than four hundred surviving turf farmsteads, most clustered along the northern and eastern coasts. Records from the 1703 census, the earliest reliable national survey, show that nearly every farming household at that date lived in a turf-walled longhouse of some description.\n\nIn the late nineteenth century, however, imported corrugated iron and sawn lumber began to reach Icelandic ports in larger quantities, and the turf house entered a slow decline. By 1930 only a small minority of rural families still lived in them, and the last continuously inhabited turf farm was abandoned in 1966. Today most surviving examples are maintained by the National Museum as heritage sites, although a handful of private owners still carry out traditional re-turfing every few decades.",
    questions: [
      {
        questionId: 'vr-we-inference-q1',
        questionText: 'Which of the following is most likely to be true based on the passage?',
        options: [
          'The decline of the Icelandic turf house was linked to the increased availability of imported building materials from the late nineteenth century onwards.',
          'The decline of the Icelandic turf house shows that all traditional Nordic dwellings were abandoned once industrial materials became available.',
          'Most Icelanders today report that they would prefer to live in a turf house rather than a modern building.',
          "Iceland's government plans to fund the construction of new turf houses in coastal regions over the next decade.",
        ],
        answer: 'The decline of the Icelandic turf house was linked to the increased availability of imported building materials from the late nineteenth century onwards.',
        answeringReason:
          "Classify and predict:\nInference question ('most likely to be true'). Predict an extreme-language trap and an off-topic distractor introducing something the passage never addresses.\n\nFind the anchor:\nScan for the turning point in paragraph 3 — 'late nineteenth century', 'imported corrugated iron and sawn lumber', and 'slow decline'.\n\nRead locally:\nBuild a clue → connection → conclusion chain. Clue: in the late nineteenth century imported corrugated iron and sawn lumber 'began to reach Icelandic ports in larger quantities'. Connection: the passage immediately follows this with 'and the turf house entered a slow decline'. Conclusion: the decline was linked to the new availability of these imported materials.\n\nAudit the options:\n• '...linked to the increased availability of imported building materials from the late nineteenth century onwards.' — Correct: a moderate, evidence-linked inference; the chain in paragraph 3 supports it directly.\n• '...all traditional Nordic dwellings were abandoned once industrial materials became available.' — Overshoots with 'all' and extends from Iceland to all Nordic countries; the passage only discusses Iceland.\n• 'Most Icelanders today report that they would prefer to live in a turf house...' — Off-topic; the passage never addresses modern preferences or surveys.\n• \"Iceland's government plans to fund the construction of new turf houses...\" — Off-topic; the passage mentions heritage maintenance and a few private owners, not government plans for new builds.\n\nTrap:\nA mix of overreach (extreme 'all' plus scope shift to all Nordic dwellings) and topic introduction (preferences and government plans the passage never raises).\n\nTakeaway:\nModerate inferences win. If you can trace a clue → connection → conclusion chain in the passage in two or three steps, you have the right inference; if the option needs an 'all' or a topic the passage never raises, drop it.",
      },
    ],
  },

  'inference-causation-example': {
    id: 'vr-we-inference-causation',
    topic: 'Multiple choice: inference from study data',
    title: 'Vineyard Cover Crops',
    isFree: true,
    resource:
      "Cover cropping — the practice of sowing grasses, legumes, or wildflowers between rows of vines — has become increasingly common in European vineyards over the past two decades. A 2019 survey by the Institut Francais de la Vigne et du Vin examined three hundred and forty estates across Bordeaux, Burgundy, and the Loire Valley, comparing those that maintained permanent cover crops with those that kept their inter-row soil bare.\n\nThe survey reported that estates using cover crops tended to record higher earthworm counts and slightly lower levels of soil compaction than the bare-soil estates. Vines on cover-cropped plots also showed, on average, marginally lower yields but grapes with somewhat higher concentrations of certain phenolic compounds associated with colour and structure in finished wine.\n\nThe report's authors, however, urged caution. Estates choosing to adopt cover crops were not randomly selected: they tended to be smaller, organically certified, and located on gentler slopes than the bare-soil comparison group. Climate, rootstock, and pruning regime also varied considerably between the two groups. The authors concluded only that cover cropping was \"associated with\" the observed differences in soil and fruit chemistry, and recommended controlled trials before any firm recommendations could be made to growers.",
    questions: [
      {
        questionId: 'vr-we-inference-causation-q1',
        questionText: 'Which statement is best supported by the passage?',
        options: [
          'The 2019 survey found that cover cropping was associated with differences in soil and fruit chemistry, but uncontrolled factors prevented firm causal conclusions.',
          'The 2019 survey demonstrated that cover cropping causes higher concentrations of phenolic compounds in vineyard grapes.',
          'The 2019 survey showed that cover crops have no measurable effect on earthworm populations in European vineyards.',
          'The 2019 survey concluded that all Bordeaux estates should adopt cover cropping to improve wine quality.',
        ],
        answer: 'The 2019 survey found that cover cropping was associated with differences in soil and fruit chemistry, but uncontrolled factors prevented firm causal conclusions.',
        answeringReason:
          "Classify and predict:\nEvaluation question. The passage repeatedly hedges ('tended to', 'associated with') and explicitly flags confounders, so predict a causation-vs-correlation trap.\n\nFind the anchor:\nScan for the verbs that describe the relationship — 'tended to record', 'associated with' — and the authors' concluding language at the end of paragraph 3.\n\nRead locally:\nParagraph 2 uses correlation language: estates with cover crops 'tended to record higher earthworm counts' and showed 'marginally lower yields' with 'somewhat higher concentrations' of phenolics. Paragraph 3 lists confounders (estate size, organic certification, slope, climate, rootstock, pruning) and reports the authors' explicit conclusion that cover cropping was only 'associated with' the observed differences and that controlled trials were still needed.\n\nAudit the options:\n• '...associated with differences in soil and fruit chemistry, but uncontrolled factors prevented firm causal conclusions.' — Correct: preserves the correlation language and the explicit caution about confounders.\n• '...demonstrated that cover cropping causes higher concentrations of phenolic compounds...' — Causation upgrade. 'Causes' goes beyond the passage's 'associated with' and ignores the explicit confounders.\n• '...cover crops have no measurable effect on earthworm populations...' — Contradicts the passage, which reports higher earthworm counts on cover-cropped estates.\n• '...all Bordeaux estates should adopt cover cropping...' — Overreach plus prescription; the authors recommended controlled trials before any firm recommendations.\n\nTrap:\nCausation vs correlation — the passage describes a relationship with confounders, the trap distractor escalates this to 'causes'.\n\nTakeaway:\nWhen the passage uses 'tended to', 'associated with', or flags uncontrolled factors, watch options for 'causes', 'leads to', or 'produces'. A correct option will preserve both the correlation language and the uncertainty.",
      },
    ],
  },

  'author-example-stance': {
    id: 'vr-we-author-stance',
    topic: "Multiple choice: author's opinion",
    title: 'The Atlantropa Proposal',
    isFree: true,
    resource:
      "In the late 1920s the German architect Herman Soergel began promoting an enormous engineering scheme he called Atlantropa. The plan envisaged a series of vast hydroelectric dams across the Strait of Gibraltar, the Dardanelles, and between Sicily and Tunisia. By partly draining the Mediterranean Sea, Soergel argued, Europe could gain hundreds of thousands of square kilometres of new agricultural land, generate abundant electricity, and bind a war-weary continent together through shared infrastructure.\n\nSoergel's drawings circulated in technical journals throughout the 1930s and attracted attention from a small number of engineers and politicians. Detailed cost estimates, however, were never produced; the proposal assumed favourable geology at Gibraltar that had not been surveyed, and made only passing reference to the millions of inhabitants of the affected coastlines. The scheme was quietly shelved after 1945 and faded into obscurity by the 1960s.\n\nViewed from the present, Atlantropa is a deeply unsettling artefact of interwar techno-optimism. It is at once breathtakingly ambitious and astonishingly careless: indifferent to displaced populations, blind to ecological consequences, and built on geological assumptions its author never tested. That such a poorly grounded plan could be taken seriously by educated professionals for nearly two decades is, in the end, more troubling than its failure to be built.",
    questions: [
      {
        questionId: 'vr-we-author-stance-q1',
        questionText: "Which of the following best describes the author's attitude towards the Atlantropa proposal?",
        options: [
          'The author regards Atlantropa as a deeply flawed scheme whose serious reception by professionals is itself disturbing.',
          'The author regards Atlantropa as a visionary plan whose abandonment after 1945 was a significant missed opportunity for Europe.',
          'The author regards Atlantropa as a neutral case study, presenting its strengths and weaknesses without expressing any personal view.',
          "The author regards Atlantropa's hydroelectric ambitions as sound but criticises only Soergel's lack of attention to coastal populations.",
        ],
        answer: 'The author regards Atlantropa as a deeply flawed scheme whose serious reception by professionals is itself disturbing.',
        answeringReason:
          "Classify and predict:\nAuthor-opinion question. Read the final paragraph first — stacked evaluative descriptors usually signal stance directly. Predict distractors covering the opposite stance, neutrality, and a stance about a different element.\n\nFind the anchor:\nFinal paragraph: 'deeply unsettling artefact', 'breathtakingly ambitious and astonishingly careless', 'indifferent to displaced populations, blind to ecological consequences', and 'more troubling than its failure to be built'.\n\nRead locally:\nMultiple negative evaluative descriptors are stacked together. The author's closing sentence calls the plan 'poorly grounded' and judges its serious professional reception 'more troubling than its failure to be built' — a global negative stance directed not just at the plan but at the fact it was taken seriously.\n\nAudit the options:\n• '...deeply flawed scheme whose serious reception by professionals is itself disturbing.' — Correct: captures both elements of the final paragraph (the plan is flawed; its reception is troubling).\n• '...visionary plan whose abandonment after 1945 was a significant missed opportunity...' — Opposite stance. The author calls the plan 'poorly grounded' and shows no regret about its abandonment.\n• '...neutral case study, presenting its strengths and weaknesses without expressing any personal view.' — Neutrality trap. The final paragraph is openly evaluative, not neutral.\n• '...hydroelectric ambitions as sound but criticises only Soergel's lack of attention to coastal populations.' — Wrong target. The author criticises the plan on multiple fronts, not coastal populations alone, and does not endorse the hydroelectric ambitions.\n\nTrap:\nAuthor-opinion misattribution — narrowing the author's broad negative stance to a single sub-issue, plus the perennial neutrality and opposite-stance distractors.\n\nTakeaway:\nFor stance questions, read the final paragraph first. Multiple evaluative descriptors stacked in a row ('deeply unsettling', 'astonishingly careless', 'more troubling') are the author's view stated almost openly — match the option that captures the same direction and breadth.",
      },
    ],
  },

  'author-example-reported-speech': {
    id: 'vr-we-author-reported-speech',
    topic: "Multiple choice: author's opinion with quoted voices",
    title: 'Reassessing the Salt Roads',
    isFree: true,
    resource:
      "For most of the twentieth century, the medieval salt routes that linked the Lüneburg saltworks in Lower Saxony to the Hanseatic port of Lübeck were treated as a curiosity of economic history. That changed in 1992, when the Hamburg-based historian Jürgen Ellermeyer published a polemical monograph, Das weisse Gold, which argued that the salt trade was the \"single load-bearing pillar\" of Hanseatic commercial power and that without it the League's herring fisheries at Falsterbo would have collapsed within a generation. Ellermeyer's prose is forceful: he calls rival accounts \"timid\", insists that grain and cloth were \"mere ornaments\" on the salt economy, and credits Lüneburg alone with sustaining Lübeck's fourteenth-century wealth.\n\nFor all the rhetorical confidence of Das weisse Gold, the picture it offers is, in my view, considerably overdrawn. Customs registers from Lübeck for the years 1368–1399, painstakingly transcribed by Stuart Jenks in 2007, show salt accounting for roughly 28 per cent of dutiable tonnage — substantial, certainly, but well short of a load-bearing pillar. Cloth from Flanders and grain from Prussia together exceeded salt by volume in most years.\n\nEllermeyer's monograph deserves credit for shifting attention back to Lüneburg, and his archival work in the Stadtarchiv remains valuable. But the strong thesis — that salt alone underwrote the League — does not survive contact with the Lübeck pound-toll evidence.",
    questions: [
      {
        questionId: 'vr-we-author-reported-speech-q1',
        questionText: "Which of the following best describes the author's own view of the role of the Lüneburg salt trade in Hanseatic commerce?",
        options: [
          'Salt was an important component of Hanseatic trade but not the single dominant factor that Ellermeyer claimed.',
          'Salt was the single load-bearing pillar of Hanseatic commercial power.',
          "Salt was a minor commodity that played no meaningful role in sustaining Lübeck's wealth.",
          'Cloth and grain were mere ornaments on a fundamentally salt-based economy.',
        ],
        answer: 'Salt was an important component of Hanseatic trade but not the single dominant factor that Ellermeyer claimed.',
        answeringReason:
          "Classify and predict:\nAuthor-opinion question. The answer must be the narrator's view, not a view that the narrator merely quotes or summarises.\n\nFind the anchor:\nLook for first-person markers and evaluative verbs from the author — 'in my view', 'considerably overdrawn', 'deserves credit', 'does not survive'. Separate these from Ellermeyer's reported claims ('argued', 'insists', 'credits').\n\nRead locally:\nParagraph 2 opens: 'the picture it offers is, in my view, considerably overdrawn', and cites Jenks's customs registers showing salt at 'roughly 28 per cent of dutiable tonnage — substantial, certainly, but well short of a load-bearing pillar.' Paragraph 3 confirms: salt mattered and Ellermeyer deserves credit, but 'the strong thesis — that salt alone underwrote the League — does not survive contact with the Lübeck pound-toll evidence.' The author's position is therefore: salt was important but not the sole pillar.\n\nAudit the options:\n• 'Salt was an important component of Hanseatic trade but not the single dominant factor that Ellermeyer claimed.' — Correct. Tracks the author's twin claims: salt was substantial yet the strong thesis fails.\n• 'Salt was the single load-bearing pillar of Hanseatic commercial power.' — Reported-speech trap: this is Ellermeyer's quoted thesis, which the author explicitly describes as 'considerably overdrawn'.\n• \"Salt was a minor commodity that played no meaningful role in sustaining Lübeck's wealth.\" — Overcorrection in the opposite direction: 28 per cent and 'substantial, certainly' rule out 'minor' and 'no meaningful role'.\n• 'Cloth and grain were mere ornaments on a fundamentally salt-based economy.' — Another Ellermeyer quotation; the author cites Jenks to show cloth and grain together exceeded salt by volume in most years, contradicting this.\n\nTrap:\nReported-speech trap — attributing a loud, lengthily quoted critic's view (Ellermeyer) to the author, when the author's own evaluative language ('in my view... overdrawn', 'does not survive') points the other way.\n\nTakeaway:\nA passage can quote a third party at length without endorsing them. Always identify who owns each claim — track the reporting verbs and the first-person markers — and answer author-opinion questions only from the narrator's own evaluative sentences.",
      },
    ],
  },

  'negative-stem-example': {
    id: 'vr-we-negative-stem',
    topic: 'Multiple choice: EXCEPT / negative stem',
    title: 'The Reform of Coinage, 1816',
    isFree: true,
    resource:
      "The Great Recoinage of 1816 was prompted by decades of currency disorder following the Napoleonic Wars. Silver coins had been so heavily clipped and worn that many circulated at a fraction of their face value, and gold guineas had effectively vanished from daily use. Lord Liverpool's administration tasked the Master of the Mint, William Wellesley Pole, with restoring confidence in the coinage.\n\nFour substantive measures were implemented in the years following the Coinage Act. First, the gold sovereign, valued at twenty shillings, replaced the guinea as the standard gold coin from 1817. Second, silver was demonetised as a primary standard and reissued as token coinage, with its face value deliberately exceeding its bullion content. Third, a new steam-powered press, designed by Matthew Boulton's firm at Soho, was installed at the Royal Mint at Tower Hill, dramatically increasing production speed. Fourth, the milled edge — long used on gold coins — was extended to the new silver shillings and half-crowns to deter clipping.\n\nA fifth proposal, championed by Pole himself, would have introduced a decimal subdivision of the pound, replacing the awkward twenty-shillings-of-twelve-pence system. Treasury officials examined the scheme in 1818 but ultimately shelved it, judging the public disruption too great. Britain would not adopt decimal currency until 1971, more than a century and a half later. The 1816 reforms nevertheless succeeded in stabilising the currency and were widely imitated across Europe in the following decades.",
    questions: [
      {
        questionId: 'vr-we-negative-stem-q1',
        questionText: 'All of the following were measures implemented as part of the Great Recoinage EXCEPT:',
        options: [
          'The introduction of the gold sovereign as the standard gold coin.',
          'The demonetisation of silver as a primary standard.',
          'The decimalisation of the pound into one hundred subdivisions.',
          'The extension of the milled edge to silver shillings and half-crowns.',
        ],
        answer: 'The decimalisation of the pound into one hundred subdivisions.',
        answeringReason:
          "Classify and predict:\nNegative-stem MC ('EXCEPT'). The trap shape is predictable: three options will be confirmed by the passage and one will be a proposal that was floated but never enacted. Re-read the stem before locking in.\n\nFind the anchor:\nScan for the four numbered measures ('First', 'Second', 'Third', 'Fourth') and then for any signal that something else was 'proposed', 'shelved', 'rejected', or 'delayed'. Paragraph three opens with 'A fifth proposal... ultimately shelved'.\n\nRead locally:\nThe passage explicitly lists four implemented measures (sovereign, demonetised silver, steam press, milled edge) and then says decimalisation was 'examined... but ultimately shelved' in 1818. Decimal currency did not arrive until 1971.\n\nAudit the options:\n• 'The introduction of the gold sovereign as the standard gold coin.' — Confirmed in the passage as the first measure (1817). Wrong answer to an EXCEPT stem.\n• 'The demonetisation of silver as a primary standard.' — Confirmed as the second measure. Wrong answer to an EXCEPT stem.\n• 'The decimalisation of the pound into one hundred subdivisions.' — Proposed by Pole but shelved by the Treasury in 1818; it was NOT implemented. Correct answer for the EXCEPT stem.\n• 'The extension of the milled edge to silver shillings and half-crowns.' — Confirmed as the fourth measure. Wrong answer to an EXCEPT stem.\n\nTrap:\nNegative-stem misread combined with a proposed-but-dropped item planted in a list. Under time pressure, candidates skim the stem, miss the 'EXCEPT', and pick the first confirmed option they see.\n\nTakeaway:\nOn any 'EXCEPT' or 'NOT' stem, re-read the stem before answering. Tick off the options that the passage confirms; the unticked one is your answer. Watch specifically for items that were proposed, debated, or shelved — these are the planted trap.",
      },
    ],
  },

  'mixed-trap-example': {
    id: 'vr-we-mixed-trap',
    topic: 'Multiple choice: detail with multiple figures',
    title: 'Reforesting the Welsh Valleys',
    isFree: true,
    resource:
      "The Cambrian Reforestation Initiative, launched in 2009, set out to restore native broadleaf woodland across degraded upland in central Wales. Its flagship site was the Cwm Eithin valley in Powys, where decades of sheep grazing had reduced tree cover to less than three per cent of the valley floor. By 2022, project ecologists reported that tree cover within Cwm Eithin had risen to 38 per cent, an increase widely cited in conservation literature as the scheme's headline success.\n\nThe picture across the wider Powys uplands, however, was more modest. Independent surveys commissioned by Natural Resources Wales found that average tree cover across the county's upland zones had risen to only 14 per cent by 2022, reflecting the slower rollout of replanting outside the flagship valley. In the neighbouring Tywi catchment, where a separate but smaller scheme operated, tree cover reached 22 per cent over the same period.\n\nProject directors emphasised that the Cwm Eithin figure should not be read as representative of the broader landscape. They noted that fencing costs, contested land tenure, and limited nursery capacity had constrained planting elsewhere. A revised plan, published in late 2022, set a target of 25 per cent average upland cover across Powys by 2035, conditional on continued public funding and a doubling of the current sapling supply.",
    questions: [
      {
        questionId: 'vr-we-mixed-trap-q1',
        questionText: 'According to the passage, what was the average tree cover across Powys upland zones by 2022?',
        options: ['38 per cent.', '22 per cent.', '14 per cent.', '25 per cent.'],
        answer: '14 per cent.',
        answeringReason:
          "Classify and predict:\nFact-finding MC with stacked traps. The passage carries multiple numbers tied to multiple scopes and locations, so the predictable trap shapes are scope mismatch, almost-right (right number wrong place), and number swap.\n\nFind the anchor:\nScan for 'Powys' AND 'upland zones' AND '2022' together. The relevant sentence is in paragraph two: 'average tree cover across the county's upland zones had risen to only 14 per cent by 2022'.\n\nRead locally:\nThe passage gives multiple distinct figures: 3 per cent (Cwm Eithin baseline), 38 per cent (Cwm Eithin 2022), 14 per cent (Powys uplands 2022), 22 per cent (Tywi catchment 2022), and 25 per cent (Powys 2035 target). The question asks specifically about Powys uplands in 2022.\n\nAudit the options:\n• 38 per cent — SCOPE MISMATCH. This is the Cwm Eithin valley figure, not the wider Powys uplands; the question asks about the county-level scope.\n• 22 per cent — ALMOST-RIGHT (wrong location). Correct kind of figure but attached to the Tywi catchment, a different area named in the passage.\n• 14 per cent — Correct: matches value, scope (Powys uplands), and time period (2022).\n• 25 per cent — NUMBER SWAP. This is the 2035 target figure, not the 2022 actual; wrong time period and wrong status (target vs measured).\n\nTrap:\nThree different distractor shapes stacked in one question — scope mismatch, almost-right by location, and number swap by time period. Each looks defensible if you grab the first matching number you see.\n\nTakeaway:\nWhen a question stacks multiple distractor shapes, slow down on the option audit. A correct option must match scope, value, AND location/time simultaneously — confirm all three before locking in.",
      },
    ],
  },
};

export const VR_WORKED_EXAMPLE_IDS = Object.keys(VR_WORKED_EXAMPLES);
