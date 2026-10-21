const SECTIONS = ['vr', 'dm', 'qr', 'sj'];

// Input is the coach's existing graded evidence; no additional reads are needed.
// Keep one end-of-day point and accumulate marks in a single pass, rather
// than rescoring the full history for every date. Repeats count only once.
export function buildOverallHistory(rows, now = Date.now()) {
  const totals = Object.fromEntries(SECTIONS.map((section) => [section, { earned: 0, possible: 0, questions: 0 }]));
  const seen = new Set(), points = [];
  for (const row of [...rows].sort((a, b) => Date.parse(a.answeredAt) - Date.parse(b.answeredAt) || String(a.id).localeCompare(String(b.id)))) {
    const time = Date.parse(row.answeredAt);
    if (!SECTIONS.includes(row.section) || !Number.isFinite(time) || time > now
      || row.excluded || !(row.possible > 0) || !Number.isFinite(row.earned)) continue;
    const key = `${row.section}:${row.questionId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const total = totals[row.section];
    total.earned += row.earned;
    total.possible += row.possible;
    total.questions++;
    // Include early practice history, even before the other sections have been
    // attempted. Only sections with recorded marks contribute to that date.
    const recordedSections = SECTIONS.filter((section) => totals[section].possible > 0);
    const accuracy = Math.round(recordedSections.reduce((sum, section) => {
      return sum + 100 * totals[section].earned / totals[section].possible;
    }, 0) / recordedSections.length);
    const point = { date: new Date(time).toISOString().slice(0, 10), accuracy };
    if (points.at(-1)?.date === point.date) points[points.length - 1] = point;
    else points.push(point);
  }
  return points;
}

export function chartGeometry(points) {
  const start = Date.parse(points[0]?.date), end = Date.parse(points.at(-1)?.date);
  const vertices = points.map((point) => ({ ...point,
    x: points.length === 1 ? 348 : 58 + 290 * (Date.parse(point.date) - start) / (end - start || 1),
    y: 156 - 1.3 * point.accuracy,
  }));
  let length = 0;
  const distances = vertices.map((point, index) => {
    if (index) length += Math.hypot(point.x - vertices[index - 1].x, point.y - vertices[index - 1].y);
    return length;
  });
  return { vertices, length, distances,
    path: vertices.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ') };
}
