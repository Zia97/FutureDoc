# Quantitative Reasoning JSON contracts

Practice is an array of sets. A set requires new UUID-v4 `id`, `title`, `stimulus`, Boolean `is_free`, and `quantitative_reasoning_questions`. Each question requires UUID-v4 `id`, `question_text`, five `{label,text}` options A-E, `correct_answer`, `answer_reason`, zero-based `order_index`, and `difficulty` (`normal|hard`).

Timed JSON is an array containing one wrapper:

```json
{"id":"timed-qr-test-NNN","title":"...","question_count":36,"time_minutes":26,"is_free":true,"sets":[]}
```

Timed sets use UUID-v4 `set_id`; questions use `stem` instead of `question_text`. All question indices are zero-based within their set. New candidates require `difficulty` even though one legacy preview omitted it.

Stimulus schemas follow the renderer. At minimum validate rectangular table rows, chart label/series lengths, at most one unknown pie segment, finite scatter coordinates, unique network nodes and valid edges, valid geometry coordinates, non-empty text/formula content, and recursive `multi.items`.
