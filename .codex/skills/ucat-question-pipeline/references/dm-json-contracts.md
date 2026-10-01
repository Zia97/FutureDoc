# Decision Making JSON contracts

Practice is a flat array. Each question requires `id` (new UUID v4), `title`, `type`, `difficulty` (`normal|hard`), `stem`, `order_index`, `is_free`, and answer data. MC questions use `correct_answer`, `answer_reason`, and canonical `decision_making_question_options` entries with `label`, `option_text`, `option_data`, and 1-based `order_index`. Yes/No questions use five `decision_making_question_statements` entries with `statement_text`, `correct_answer`, `answer_reason`, and 1-based `order_index`.

Timed JSON is an array containing one wrapper:

```json
{"id":"timed-dm-test-NNN","title":"...","question_count":35,"time_minutes":37,"is_free":true,"questions":[]}
```

Timed question order is 1-based. Use the same canonical `options` and `decision_making_question_statements` shapes. The runtime reads statement answers; database converters must write SQL `NULL` for the parent `correct_answer` and `answer_reason` of statement questions rather than serialising an answer map.

Optional renderer fields are `table_data`, `stimulus_diagram`, `venn_geometry`, and `hide_labels`. Tables must be rectangular string matrices. Preserve question-level `hide_labels` and Venn geometry in migrations.

For new mixed-shape Venn diagrams prefer `schemaVersion: 2`. Each set contains `id`, `label`, `shape` and `geometry: {cx, cy, width, height, rotationDeg}`; dimensions are actual unrotated bounds and angles are clockwise degrees. `regions` is an array of `{id, value}` records produced by the geometry engine, with a separate record for every connected face. Zero counts must be explicit. An optional `outside` region includes the population outside all sets. Legacy object-based region maps remain supported for existing diagrams.

Use `createVennFromGeometry()` or `npm run questions:venn:generate` to derive valid region IDs and `evaluateVennQuery()` for answer totals. Recompute both after changing geometry. Read [the full diagram contract](../../../../docs/VENN_DIAGRAM_ENGINE.md) for supported shapes, validation limits and examples.

Preserve optional v2 `labelStyle: { minFontSize, preferredFontSize, padding }`; newly generated diagrams default to 14/18/3 px. Region-space diagnostics are authoring reports and need not be stored in question JSON. The complete saved configuration is sufficient for the renderer to recompute safe label positions and sizes.
