export function practiceQuestionId(item) {
  return item?.question?.questionId ?? item?.question?.id ?? item?.question?.itemId ?? item?.id;
}

// Preserve the chosen order and whole parent context on each flattened item.
// An empty selection stays empty; it must never expand into the full bank.
export function selectPracticeItems(items, questionIds) {
  if (!Array.isArray(questionIds)) return items;
  const byId = new Map(items.filter((item) => !item.isPreview).map((item) => [practiceQuestionId(item), item]));
  return [...new Set(questionIds)].map((id) => byId.get(id)).filter(Boolean);
}
