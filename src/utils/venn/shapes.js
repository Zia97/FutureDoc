// Shape -> polygon (array of [x,y] vertices, closed implicitly by repeating
// first point when handed to polygon-clipping). All shapes share a common
// interface: centre (cx, cy) + width/height (w, h). Circles and ovals are
// sampled to CIRCLE_SAMPLES points so boolean clipping treats them as polygons.

const CIRCLE_SAMPLES = 48;

function sampleEllipse(cx, cy, rx, ry) {
  const pts = [];
  for (let i = 0; i < CIRCLE_SAMPLES; i++) {
    const a = (i * 2 * Math.PI) / CIRCLE_SAMPLES;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

function regularPolygon(cx, cy, r, sides) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function starPoly(cx, cy, r, innerRatio = 0.4) {
  const innerR = r * innerRatio;
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : innerR;
    pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
  }
  return pts;
}

function rect(cx, cy, w, h) {
  const hw = w / 2, hh = h / 2;
  return [
    [cx - hw, cy - hh],
    [cx + hw, cy - hh],
    [cx + hw, cy + hh],
    [cx - hw, cy + hh],
  ];
}

// Returns a ring: array of [x,y] points (open — last point is NOT duplicated).
export function shapeToPolygon(shape, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  switch (shape) {
    case 'circle':
      return sampleEllipse(cx, cy, r, r);
    case 'oval':
      return sampleEllipse(cx, cy, r, r * 0.65);
    case 'vertical_oval':
      return sampleEllipse(cx, cy, r * 0.65, r);
    case 'square':
    case 'rectangle':
      return rect(cx, cy, w, h);
    case 'triangle':
      return [[cx, cy - r], [cx - r, cy + r], [cx + r, cy + r]];
    case 'isosceles_triangle':
      return [[cx, cy - r], [cx - r * 0.5, cy + r], [cx + r * 0.5, cy + r]];
    case 'diamond':
      return [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
    case 'pentagon':
      return regularPolygon(cx, cy, r, 5);
    case 'hexagon':
      return regularPolygon(cx, cy, r, 6);
    case 'octagon':
      return regularPolygon(cx, cy, r, 8);
    case 'star':
      return starPoly(cx, cy, r, 0.4);
    case 'trapezoid':
      return [
        [cx - r * 0.55, cy - r],
        [cx + r * 0.55, cy - r],
        [cx + r, cy + r],
        [cx - r, cy + r],
      ];
    case 'parallelogram': {
      const sk = r * 0.25;
      return [
        [cx - r * 0.85 + sk, cy - r * 0.6],
        [cx + r * 0.85 + sk, cy - r * 0.6],
        [cx + r * 0.85 - sk, cy + r * 0.6],
        [cx - r * 0.85 - sk, cy + r * 0.6],
      ];
    }
    default:
      return rect(cx, cy, w, h);
  }
}

// SVG rendering spec — what the renderer needs to draw this shape (not the
// clipping polygon). Circles and ovals stay as native SVG elements.
export function shapeToSvgSpec(shape, cx, cy, w, h) {
  const r = Math.min(w, h) / 2;
  if (shape === 'circle') return { kind: 'circle', cx, cy, r };
  if (shape === 'oval') return { kind: 'ellipse', cx, cy, rx: r, ry: r * 0.65 };
  if (shape === 'vertical_oval') return { kind: 'ellipse', cx, cy, rx: r * 0.65, ry: r };
  if (shape === 'square' || shape === 'rectangle') {
    return { kind: 'rect', x: cx - w / 2, y: cy - h / 2, width: w, height: h };
  }
  const pts = shapeToPolygon(shape, cx, cy, w, h);
  return { kind: 'polygon', points: pts };
}
