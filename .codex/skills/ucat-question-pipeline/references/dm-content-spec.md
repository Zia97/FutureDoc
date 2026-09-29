# Decision Making content specification

Use only the six app-supported types: `syllogism`, `logic_puzzle`, `interpreting_info`, `recognising_assumptions`, `venn_diagram`, and `probabilistic`. The legacy enum name `recognising_assumptions` is retained for compatibility even though the rendered task is strongest-argument evaluation.

A full timed test is 35 questions in 37 minutes. FutureDoc's four live tests consistently use 5 syllogism, 6 logic-puzzle, 6 interpreting-information, 5 recognising-assumptions, 6 Venn, and 7 probability questions, in that order. Treat this as the app's full-test contract, not a claim that UCAT publishes that exact allocation. Practice batches use the allocation in their brief.

Syllogism and interpreting-information questions use five independently answerable Yes/No statements. Interpreting information may be passage-only or table-based; a table is not mandatory. Other types use four A-D options. Each problem must be solvable from the supplied information, with no hidden assumptions.

Venn diagrams must use renderer-supported shapes and region keys. Diagram construction must be deterministic and successfully bake/render; never approve merely because JSON parses. A blind reviewer must independently solve logic, probability, puzzle, and five-statement questions.

Plan Venn questions as a varied set, not repeated two- or three-circle count lookups. When a batch has four or more Venn questions, include both diagram-selection and stimulus-interpretation formats, use mixed shapes in at least half, and vary set count and region topology. The 20-question practice brief sets a stronger target of three mixed-shape Venn questions out of four. Mix the reasoning task as well: for example, selecting a diagram, locating a region, combining exclusive regions, or deriving a missing count. The brief's measurable Venn constraints are release gates; an explicit user-requested mix can override their defaults.

Official current section timing/count source: <https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/>.
