# VR shared content specification

This file is the shared source of truth for both practice and timed VR authoring.

## Official format facts

The current UCAT Consortium format states that VR contains 44 questions across 11 passages, allows 22 minutes, awards one mark per question, and expects answers to be based on the passage rather than prior knowledge:

- https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/
- https://www.ucat.ac.uk/prepare/question-tutorials/

Verify these links before changing exam-level metadata. Do not include volatile annual averages or unsupported claims about the exact live-test MC/TFC distribution.

## FutureDoc editorial contract

- Every passage has exactly four questions and uses one format throughout: MC or TFC.
- Passage body: 200-400 words; target 250-300; at least two paragraphs.
- Tone: concise academic or journalistic prose suitable for scanning under time pressure.
- Default topics: unfamiliar history, material culture, niche science, economics, language, environmental systems, philosophy, or literary analysis.
- Avoid medical passages by default as a FutureDoc editorial preference, not as an asserted official prohibition. Also avoid distressing, partisan, or culturally inflammatory material unless explicitly requested and justified.
- Define specialist vocabulary needed to understand the passage.
- The passage must be original prose, not a close paraphrase of a source or existing question-bank passage.
- Every answer must follow from the passage alone. External sources establish factual accuracy; they must never be required to solve the question.

## Factual provenance

For factual passages, use at least two credible sources where practical, preferring primary institutions, academic publications, museums, government bodies, or recognised reference works. Save URLs, titles, accessed date, and a short fact map in the authoring manifest. Do not put source metadata into app JSON.

Fictionalised factual detail is not allowed unless the brief explicitly requests a clearly fictional passage. Never invent a citation. A validator must be able to map each material name, date, number, and causal claim to a source or remove it.

## TFC logic

Use exactly `["True", "False", "Can't tell"]`.

- `True`: explicitly stated or necessarily entailed.
- `False`: specifically contradicted by the passage. Absence of support is not contradiction.
- `Can't tell`: neither entailed nor contradicted.

Hedging alone does not make a stronger claim false. For example, “may occur” does not contradict “always occurs” unless the passage supplies a counterexample; the stronger claim is ordinarily `Can't tell`.

Within each four-question TFC passage, use all three labels at least once; the fourth may repeat. Vary evidence locations and traps.

## MC logic

- Exactly four unique, non-empty answer strings and one defensible answer.
- Wrong options must be passage-relevant and fail for identifiable, non-overlapping reasons.
- Across a passage, vary question purpose: retrieval, direct comprehension, inference/evaluation, author position, purpose, reference, main idea, or new-information impact.
- Vary traps across the passage or batch. Do not force a real-world-knowledge distractor into every question.
- Balance option length, grammar, specificity, and tone so the correct option is not signalled stylistically.
- Avoid overlapping options, double negatives, “all/none of the above,” and answer choices distinguishable without reading the passage.

## Explanations

Student-facing `answer_reason` should identify the decisive passage evidence and explain the reasoning. For MC, briefly eliminate every wrong option. For TFC, distinguish confirmation, contradiction, and missing information. Keep internal trap labels and source notes in the authoring report unless they genuinely help the student.

## Difficulty

The app accepts only `normal` and `hard`.

- `normal`: direct retrieval, close paraphrase, or one-step comprehension.
- `hard`: combines separated evidence, handles scope/hedging/attribution, resists a strong knowledge trap, or requires a defensible multi-step inference.

Default batch allocation is about 75% `normal`, 25% `hard`; the brief may override it.

## Default batch balance

MC should outnumber TFC in generated batches. For 20 practice questions, generate exactly five passages: three MC and two TFC, with 15 normal and five hard questions. This is a FutureDoc authoring target, not a claim about an official fixed UCAT ratio.
