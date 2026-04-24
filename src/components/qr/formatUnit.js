// Currency-style symbols are written before the number ("£25"); everything
// else (e.g. "m", "%", "kg") is written after ("25m", "25%").
const PREFIX_UNITS = new Set(['£', '$', '€', '¥']);

export function formatWithUnit(value, unit) {
  if (!unit) return `${value}`;
  if (PREFIX_UNITS.has(unit)) return `${unit}${value}`;
  return `${value}${unit}`;
}

export function isPrefixUnit(unit) {
  return !!unit && PREFIX_UNITS.has(unit);
}
