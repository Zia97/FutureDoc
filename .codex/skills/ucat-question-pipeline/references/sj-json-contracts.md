# Situational Judgement JSON contracts

Practice is an array of scenarios with UUID-v4 `id`, `body`, Boolean `is_free`, and `situational_judgement_questions`. Questions use UUID-v4 `id`, `label_set` (1 importance, 2 appropriateness), `question_text`, exact scale-string `correct_answer`, `answer_reason`, zero-based `order_index`, and `difficulty` (`normal|hard`).

Timed JSON is an array containing one wrapper:

```json
{"id":"timed-sj-test-NNN","title":"...","question_count":69,"time_minutes":26,"is_free":true,"scenarios":[]}
```

Timed scenarios use UUID-v4 `id`, zero-based `order_index`, `stem`, and `items`. Items use UUID-v4 `id`, zero-based `order_index`, `type` (`importance|appropriateness`), `text`, exact scale-string answer, reason, and difficulty.

Importance labels: `Very important`, `Important`, `Of minor importance`, `Not important at all`. Appropriateness labels: `A very appropriate thing to do`, `Appropriate, but not ideal`, `Inappropriate, but not awful`, `A very inappropriate thing to do`.
