// Currency-style symbols are written before the number ("£25"); everything
// else (e.g. "m", "%", "kg") is written after ("25m", "25%").
// Compound units like "$m" or "£k" also prefix: "$142m", "£3k".
const PREFIX_SYMBOLS = new Set(['£', '$', '€', '¥']);

export function isPrefixUnit(unit) {
  return !!unit && PREFIX_SYMBOLS.has(unit[0]);
}

export function formatWithUnit(value, unit) {
  if (!unit) return `${value}`;
  if (PREFIX_SYMBOLS.has(unit[0])) return `${unit[0]}${value}${unit.slice(1)}`;
  return `${value}${unit}`;
}

export function formatNegativeWithUnit(absValue, unit) {
  if (!unit) return `-${absValue}`;
  if (PREFIX_SYMBOLS.has(unit[0])) return `-${unit[0]}${absValue}${unit.slice(1)}`;
  return `-${absValue}${unit}`;
}
