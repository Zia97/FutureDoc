# Situational Judgement validator

Run deterministic checks for wrapper/count/timing, UUIDs/collisions, 2-6 items per scenario, exact scale labels, zero-based ordering, difficulty, requested allocation, duplicate wording and lexical overlap. Reject Most/Least content.

Blind stage: keep the scenario, item type and fixed scale, but hide supplied answers, explanations and difficulty. The reviewer independently commits a rating, rationale, ambiguity note and confidence for every item before reveal.

Revealed stage: compare answers by exact and ordinal distance, then evaluate whether the supplied rationale fits current professional guidance, the actor's authority and context. Check for unsupported absolutes, hidden medical knowledge, multiple defensible ratings, and semantic similarity to nearest practice/timed scenarios. Do not fail merely because ratings repeat within one scenario.

Any disagreement or ambiguity is a content finding, not something the validator silently edits. A revised candidate receives a new full blind pass.
