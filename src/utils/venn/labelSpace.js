// Safe axis-aligned label rectangles inside concave polygons, including holes.
// Search is bounded. Its result is a verified lower bound on available space,
// never an optimistic estimate based only on area or on the rectangle corners.
const cache = new WeakMap();

export function measureLabelText(text, fontSize) {
  const widthEm = Array.from(String(text)).reduce((sum, ch) => sum + (/^[0-9]$/.test(ch) ? 0.66 : 1.1), 0);
  return { width: widthEm * fontSize, height: 1.2 * fontSize, widthEm };
}

// Exact L-infinity distance to a line segment. The minimum of the piecewise
// linear max(|x(t)|, |y(t)|) lies at an endpoint or one of these breakpoints.
function segmentDistance(x, y, a, b) {
  const ax = a[0] - x, ay = a[1] - y;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  let distance = Math.min(Math.max(Math.abs(ax), Math.abs(ay)), Math.max(Math.abs(ax + dx), Math.abs(ay + dy)));
  for (const t of [-ax / dx, -ay / dy, (ay - ax) / (dx - dy), -(ax + ay) / (dx + dy)]) {
    if (t > 0 && t < 1) distance = Math.min(distance, Math.max(Math.abs(ax + t * dx), Math.abs(ay + t * dy)));
  }
  return distance;
}

function signedDistance(x, y, polygon) {
  let inside = false, distance = Infinity;
  for (const ring of polygon) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    distance = Math.min(distance, segmentDistance(x, y, a, b));
  }
  return (inside ? 1 : -1) * distance;
}

class MaxHeap {
  items = [];
  push(cell) {
    const a = this.items;
    let i = a.length;
    a.push(cell);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent].max >= cell.max) break;
      a[i] = a[parent]; i = parent;
    }
    a[i] = cell;
  }
  pop() {
    const a = this.items, first = a[0], last = a.pop();
    if (!a.length) return first;
    let i = 0;
    while (i * 2 + 1 < a.length) {
      let child = i * 2 + 1;
      if (child + 1 < a.length && a[child + 1].max > a[child].max) child++;
      if (a[child].max <= last.max) break;
      a[i] = a[child]; i = child;
    }
    a[i] = last;
    return first;
  }
}

export function findRegionLabelBox(cell, text, fontSize, padding = 3) {
  const metrics = measureLabelText(text, fontSize);
  const halfW = metrics.width / 2 + padding, halfH = metrics.height / 2 + padding;
  const key = `${halfW}:${halfH}`;
  let entries = cache.get(cell);
  if (entries?.has(key)) return entries.get(key);
  if (!entries) { entries = new Map(); cache.set(cell, entries); }
  const polygon = cell.polygon.map(ring => ring.map(([x, y]) => [x / halfW, y / halfH]));
  const xs = polygon[0].map(p => p[0]), ys = polygon[0].map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  function candidate(x, y, hw = 0, hh = 0) {
    const distance = signedDistance(x, y, polygon);
    return { x, y, hw, hh, distance, max: distance + Math.max(hw, hh) };
  }
  const root = candidate((minX + maxX) / 2, (minY + maxY) / 2, (maxX - minX) / 2, (maxY - minY) / 2);
  let best = candidate(cell.x / halfW, cell.y / halfH);
  if (root.distance > best.distance) best = root;
  const heap = new MaxHeap();
  heap.push(root);
  let searched = 0;
  while (heap.items.length && searched < 192) {
    const current = heap.pop(); searched++;
    if (current.distance > best.distance) best = current;
    if (current.max - best.distance <= Math.max(0.002, best.distance * 0.01)) continue;
    if (current.hw >= current.hh) {
      for (const sign of [-1, 1]) heap.push(candidate(current.x + sign * current.hw / 2, current.y, current.hw / 2, current.hh));
    } else {
      for (const sign of [-1, 1]) heap.push(candidate(current.x, current.y + sign * current.hh / 2, current.hw, current.hh / 2));
    }
  }
  // A small inward tolerance keeps the safe rectangle off numeric boundaries.
  const capacity = best.distance * (1 - 1e-7);
  const result = { x: best.x * halfW, y: best.y * halfH, capacity,
    width: 2 * halfW * capacity, height: 2 * halfH * capacity,
    requiredScale: capacity > 0 ? 1 / capacity : Infinity,
    searchConverged: heap.items.length === 0 };
  if (entries.size >= 16) entries.delete(entries.keys().next().value);
  entries.set(key, result);
  return result;
}

export function rectangleFitsPolygon(polygon, { x, y, width, height }) {
  if (!(width > 0 && height > 0)) return false;
  const normalised = polygon.map(ring => ring.map(p => [(p[0] - x) / (width / 2), (p[1] - y) / (height / 2)]));
  return signedDistance(0, 0, normalised) >= 1 - 1e-8;
}
