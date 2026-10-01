# VR JSON contracts

These contracts match the current FutureDoc preview files and Supabase tables.

## Practice

Practice content is a flat JSON array. Each passage has:

```json
{
  "id": "uuid-v4",
  "title": "Short topic title",
  "body": "200-400 words with \\n\\n paragraph breaks",
  "is_free": false,
  "verbal_reasoning_questions": []
}
```

Each passage has exactly four questions:

```json
{
  "id": "uuid-v4",
  "question_text": "Question or statement",
  "options": ["True", "False", "Can't tell"],
  "correct_answer": "True",
  "answer_reason": "Evidence-based explanation",
  "order_index": 0,
  "difficulty": "normal"
}
```

`order_index` must be 0, 1, 2, and 3 exactly once. `difficulty` is `normal` or `hard`. MC options contain four unique full answer strings; TFC options match the displayed array character-for-character. Practice passage titles do not use a `Passage N` prefix.

## Timed

Timed content is an array containing one wrapper:

```json
[
  {
    "id": "timed-vr-test-005",
    "title": "VR Timed Test 5",
    "passage_count": 11,
    "question_count": 44,
    "time_minutes": 22,
    "passages": []
  }
]
```

Each timed passage has `id`, `title`, `body`, and four `verbal_reasoning_questions`; it does not contain `is_free`. Questions use the same contract as practice. Use `Passage N — <Topic>` consistently for timed titles because the current timed preview follows that convention.

Do not place authoring-only fields such as subtype, sources, fingerprints, validation status, or reviewer notes in app JSON. Store them in sidecar manifests/reports.
