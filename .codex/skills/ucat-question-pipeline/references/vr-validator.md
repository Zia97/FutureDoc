# VR independent validator procedure

The validator is an auditor, not a co-author. It must not silently repair the candidate.

## Stage A: deterministic gate

Review the deterministic report. Schema errors, UUID collisions, invalid counts, mixed formats, invalid answer membership, or high lexical duplication block the batch. Warnings require judgment, not automatic rejection.

## Stage B: blind answer reconstruction

Use only the blind-review packet. For every question:

1. Choose exactly one supplied option without looking at the candidate key or explanation.
2. Cite or precisely locate the decisive passage evidence.
3. For TFC, label the relationship as entailment, contradiction, or unresolved.
4. For MC, state briefly why each alternative fails.
5. Record confidence and any ambiguity.

Commit this result before receiving the answer key. If the blind answer is uncertain or two MC options remain defensible, flag the question even if the supplied key later matches.

## Stage C: revealed audit

After blind answers are fixed, compare them with the candidate and inspect:

- supplied answer agreement;
- accuracy and teaching value of `answer_reason`;
- factual provenance for material claims in the passage;
- originality against the nearest practice, timed, and within-batch matches;
- question-purpose variety, trap variety, option clueing, and answer-position patterns;
- appropriate `normal`/`hard` assignment.

Lexical similarity is only a screen. Judge semantic duplication using `{topic, entities, time/place, thesis/process, tested evidence, inference chain, trap, answer relation}`. Reject content that merely renames entities or changes numbers while preserving the same passage/question logic.
The compact nearest-match artifact omits passage bodies; hydrate every reported match from the full
corpus by ID before making the novelty verdict.

## Verdicts

- `pass`: answer is unambiguous and correct; explanation, schema, facts, and novelty are acceptable.
- `revise`: fixable issue without evidence that the whole passage concept is unusable.
- `reject`: wrong/ambiguous logic, unreliable facts, copied or materially duplicate content, or a structurally unsuitable passage.

A question with a wrong answer, ambiguity, missing decisive evidence, or critical schema failure cannot pass. Difficulty disagreement alone is normally a warning. A passage fails release if any associated question is not `pass`. A batch is `ready` only when every passage passes and deterministic checks have no errors.

## Output and revision boundary

Write a structured report using `assets/validation-report.template.json`, plus a short human summary. Include actual validator model metadata without model-brand gates or branded filenames.

Propose fixes, but do not edit the candidate. A generator/reviser creates a versioned successor, and a fresh validator context repeats the complete blind and revealed audit. Never validate only the changed lines.
