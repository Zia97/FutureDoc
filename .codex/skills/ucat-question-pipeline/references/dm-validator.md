# Decision Making validator

Run deterministic validation first. Reject wrong wrapper/count/timing, unsupported types, missing UUIDs, duplicate/corpus-colliding IDs, malformed options/statements/tables, incorrect ordering, and high lexical overlap.

Blind stage: without supplied answers, independently solve each item. Enumerate puzzle constraints, quantify syllogisms, calculate probabilities and table operations, and evaluate all five statements. For Venn questions, reproduce region totals and confirm every diagram option renders. Commit answers, working, ambiguity flags, and confidence before reveal.

For Venn questions, also check every visible exclusive region against its declared count or letter, including zero-count overlaps and all diagram-choice distractors. Test narrow phone widths, confirm repeated shapes have distinct set labels, and compare the batch's formats, set counts, shapes, topologies, and reasoning tasks with the brief. Reject a repetitive Venn set even if each individual diagram bakes and each answer is correct.

For v2 diagrams the deterministic checker derives every connected face and enforces complete values, readable label boxes and bounded canvas size. Verify the entire scrollable diagram and expanded view, not just the visible left portion. Repeated shapes use line patterns shared with the key. Independently recompute the question's region selection; `evaluateVennQuery()` gives a cross-check and explicit terms, but does not replace blind solving. Reject questions about people outside all sets when no outside count or equivalent narrative information is supplied. Different rotations alone do not establish semantic novelty.

Check the saved `labelStyle` minimum and every padded rectangle using `diagnostics.regionSpace`. Region area or four-corner inclusion alone is insufficient for concave regions or holes. Review batch family coverage, overlap depths, region counts and canonical `topologySignature` values; palette changes or renamed/reordered sets must not conceal repeated structures. Confirm the chosen reasoning tasks also vary.

Revealed stage: compare the independent solution with the key, inspect explanation completeness, check manifest derivations, and judge semantic novelty against the nearest practice and timed matches. Machine checks do not prove logical correctness. Report findings without editing the candidate; any revision requires a fresh full pass.
