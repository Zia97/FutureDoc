# Quantitative Reasoning validator

Run deterministic checks for root/wrapper shape, UUIDs and collisions, exact requested count, timed 36/26 metadata, 1-4 questions per set, A-E options, order indices, difficulty, stimulus schema, and lexical overlap against the full practice + timed corpus.

Blind stage: independently recalculate every answer without the supplied key or explanation. Record working, units, rounding, chosen label, ambiguity and confidence. Validate table/chart totals and question independence. Commit the response before reveal.

Revealed stage: compare independent results with the answer key and manifest ledger, inspect distractors and explanation steps, and judge semantic novelty against nearest matches. Schema validation cannot prove arithmetic hidden in prose. Report only; revisions return to the generator and trigger a complete new validation pass.
