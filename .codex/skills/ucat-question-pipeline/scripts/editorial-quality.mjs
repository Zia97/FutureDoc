// These checks catch recurring editorial cues; they do not establish answer correctness.
export function editorialIssues(input) {
  const issues = [];
  const walk = (value, location = 'candidate') => {
    if (Array.isArray(value)) return value.forEach((child, i) => walk(child, `${location}[${i}]`));
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (key === 'answer_reason' && typeof child === 'string' &&
          /\bHmm\b|\bFLAG\s*(?::|potential)|\bWait,?\s+re-?read|\bProceed with the keyed answer|\bthe puzzle expects a unique/i.test(child)) {
        issues.push({ severity: 'error', code: 'content.draft_explanation', message: 'Explanation contains unresolved drafting or review language.', location: `${location}.${key}` });
      } else if (child && typeof child === 'object') walk(child, `${location}.${key}`);
    }
  };
  walk(input);
  return issues;
}

export function argumentPatternIssues(questions) {
  const arguments_ = questions.filter((q) => q?.type === 'recognising_assumptions');
  if (arguments_.length < 8) return [];
  let longest = 0, shortest = 0;
  const stances = { yes: 0, no: 0 };
  for (const question of arguments_) {
    const options = question.options || question.decision_making_question_options || [];
    const correct = options.find((option) => option.label === question.correct_answer);
    if (!correct || options.length !== 4) continue;
    const text = (option) => String(option.option_text ?? option.text ?? '');
    const words = (option) => text(option).trim().split(/\s+/).filter(Boolean).length;
    const others = options.filter((option) => option !== correct).map(words);
    if (others.every((count) => words(correct) > count)) longest++;
    if (others.every((count) => words(correct) < count)) shortest++;
    const stance = text(correct).match(/^(yes|no)[;,]/i)?.[1].toLowerCase();
    if (stance) stances[stance]++;
  }
  const issues = [];
  if (Math.max(longest, shortest) / arguments_.length >= 0.75) {
    issues.push({ severity: 'error', code: 'dm.argument_length_cue', message: `Correct answers are uniquely ${longest >= shortest ? 'longest' : 'shortest'} in ${Math.max(longest, shortest)}/${arguments_.length} arguments; rebalance substantive option lengths.` });
  }
  if (Math.max(stances.yes, stances.no) / arguments_.length >= 0.85) {
    issues.push({ severity: 'warning', code: 'dm.argument_stance_cue', message: 'Correct answers heavily favour one Yes/No stance; review the batch for predictability.' });
  }
  return issues;
}
