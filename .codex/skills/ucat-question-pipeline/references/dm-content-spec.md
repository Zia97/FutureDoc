# Decision Making content specification

Use only the six app-supported types: `syllogism`, `logic_puzzle`, `interpreting_info`, `recognising_assumptions`, `venn_diagram`, and `probabilistic`. The legacy enum name `recognising_assumptions` is retained for compatibility even though the rendered task is strongest-argument evaluation.

A full timed test is 35 questions in 37 minutes. FutureDoc's four live tests consistently use 5 syllogism, 6 logic-puzzle, 6 interpreting-information, 5 recognising-assumptions, 6 Venn, and 7 probability questions, in that order. Treat this as the app's full-test contract, not a claim that UCAT publishes that exact allocation. Practice batches use the allocation in their brief.

Syllogism and interpreting-information questions use five independently answerable Yes/No statements. Interpreting information may be passage-only or table-based; a table is not mandatory. Other types use four A-D options. Each problem must be solvable from the supplied information, with no hidden assumptions.

Venn diagrams must use renderer-supported shapes and region keys. Diagram construction must be deterministic and successfully bake/render; never approve merely because JSON parses. A blind reviewer must independently solve logic, probability, puzzle, and five-statement questions.

Official current section timing/count source: <https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/>.
