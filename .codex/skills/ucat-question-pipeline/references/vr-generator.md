# VR generator procedure

Read `vr-content-spec.md`, `vr-json-contracts.md`, the generation brief, and the current corpus summary before writing.

## Plan before prose

Create an authoring manifest separate from app JSON. For every planned passage record:

- working topic and why it is distinct from the corpus;
- mode and format;
- intended question purposes and evidence locations;
- intended answer distribution and difficulty distribution;
- source list and fact map;
- nearest existing passage IDs/titles and the material distinction.

The compact inventory intentionally omits bodies. Before deciding that a proposed topic is novel,
load each nearest match's full passage and questions from the corpus by ID and compare the semantic
fingerprints, not only the titles.

Question count must be divisible by four. For timed mode, generate the complete 11-passage/44-question test; do not generate a partial timed wrapper.

## Generate

1. Research and write original passage prose. Do not copy source wording or existing passages.
2. Write four same-format questions per passage.
3. Solve each question directly from the passage before writing its `correct_answer`.
4. For each MC distractor, record its failure reason privately; then write a concise student-facing explanation that eliminates all options.
5. Assign `normal` or `hard` using the shared criteria.
6. Generate genuine UUID v4 values for every passage and question.
7. Emit app JSON only in the selected contract. Save planning, sources, fingerprints, and self-checks in the sidecar manifest.

## Self-check

- Reconstruct every TFC answer using entailment/contradiction/unknown.
- Confirm every MC question has one and only one defensible answer.
- Check that no answer depends on source material absent from the passage.
- Check option-position balance, repeated stem patterns, clueing, and batch-internal duplication.
- Compare the passage, tested facts, inference chains, and traps against nearest practice and timed corpus matches. Changing names or numbers does not create novelty.
- Run the deterministic checker and revise errors before handing off.

The generator must not validate its own batch for release, create a migration, or modify Supabase.
