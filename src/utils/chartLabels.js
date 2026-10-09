// Keep complete labels readable even when a category is a compact time range.
export function wrapChartLabel(value, maxCharacters = 10) {
  const text = String(value ?? '');
  const limit = Math.max(4, Math.floor(maxCharacters));
  const words = text.replace(/([\d:])([-–])(?=\d)/g, '$1$2 ').split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && line.length + word.length + 1 > limit) {
      lines.push(line);
      line = '';
    }
    let rest = word;
    while (rest.length > limit) {
      if (line) { lines.push(line); line = ''; }
      lines.push(rest.slice(0, limit));
      rest = rest.slice(limit);
    }
    line = line ? `${line} ${rest}` : rest;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
