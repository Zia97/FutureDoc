// Shape -> polygon (array of [x,y] vertices, closed implicitly by repeating
// first point when handed to polygon-clipping). All shapes share a common
// interface: centre (cx, cy) + width/height (w, h) + optional rotation (rad).
// Circles and ovals are sampled to CIRCLE_SAMPLES points so boolean clipping
// treats them as polygons.

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

// innerRatio bumped from 0.4 to 0.5 — a thinner star reads more dramatically
// but its narrow inner vertices carved deep notches out of adjacent-pair
// overlap lenses in chain / cycle / container topologies, squeezing labels
// under 12 px. 0.5 keeps the star visually distinct while giving the shape
// a chunkier body that preserves lens area with its neighbours.
function starPoly(cx, cy, r, innerRatio = 0.5) {
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

// Block arrow pointing right (or left when reflected). 7 vertices:
// rectangular body (middle band) + triangular arrowhead.
function rightArrow(cx, cy, w, h) {
  const hw = w / 2, hh = h / 2;
  const bodyEndX = cx + w * 0.15;    // where body meets arrowhead
  const bodyHalfH = h * 0.28;         // body thickness / 2
  return [
    [cx - hw,     cy - bodyHalfH],    // top-left of body
    [bodyEndX,    cy - bodyHalfH],    // top-right of body
    [bodyEndX,    cy - hh],           // top of arrowhead flare
    [cx + hw,     cy],                // arrowhead tip
    [bodyEndX,    cy + hh],           // bottom of arrowhead flare
    [bodyEndX,    cy + bodyHalfH],    // bottom-right of body
    [cx - hw,     cy + bodyHalfH],    // bottom-left of body
  ];
}

function leftArrow(cx, cy, w, h) {
  return rightArrow(cx, cy, w, h).map(([x, y]) => [2 * cx - x, y]);
}

function rotatePoints(points, cx, cy, rotation) {
  if (!rotation) return points;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return points.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
}

// Returns a ring: array of [x,y] points (open — last point is NOT duplicated).
export function shapeToPolygon(shape, cx, cy, w, h, rotation = 0) {
  const r = Math.min(w, h) / 2;
  let pts;
  switch (shape) {
    case 'circle':
      pts = sampleEllipse(cx, cy, r, r);
      break;
    case 'oval':
      pts = sampleEllipse(cx, cy, r, r * 0.65);
      break;
    case 'vertical_oval':
      pts = sampleEllipse(cx, cy, r * 0.65, r);
      break;
    case 'square':
      pts = rect(cx, cy, w, h);
      break;
    case 'rectangle':
      // Stretch horizontally so a declared `rectangle` reads as a rectangle,
      // not as a square — same visual aspect the key swatch draws. Keeping
      // width = w means adjacent overlaps in chain/hub topologies still
      // reach neighbouring shapes; squashing height to 0.63h makes the
      // rectangle identity visually obvious vs `square` and vs polygons.
      pts = rect(cx, cy, w, h * 0.75);
      break;
    case 'horizontal_strip':
      pts = rect(cx, cy, w * 1.4, h * 0.45);
      break;
    case 'vertical_strip':
      pts = rect(cx, cy, w * 0.45, h * 1.4);
      break;
    case 'triangle':
      pts = [[cx, cy - r], [cx - r, cy + r], [cx + r, cy + r]];
      break;
    case 'isosceles_triangle':
      pts = [[cx, cy - r], [cx - r * 0.5, cy + r], [cx + r * 0.5, cy + r]];
      break;
    case 'diamond':
      pts = [[cx, cy - r], [cx + r, cy], [cx, cy + r], [cx - r, cy]];
      break;
    case 'pentagon':
      pts = regularPolygon(cx, cy, r, 5);
      break;
    case 'hexagon':
      pts = regularPolygon(cx, cy, r, 6);
      break;
    case 'octagon':
      pts = regularPolygon(cx, cy, r, 8);
      break;
    case 'star':
      pts = starPoly(cx, cy, r);
      break;
    case 'trapezoid':
      pts = [
        [cx - r * 0.55, cy - r],
        [cx + r * 0.55, cy - r],
        [cx + r, cy + r],
        [cx - r, cy + r],
      ];
      break;
    case 'parallelogram': {
      const sk = r * 0.25;
      pts = [
        [cx - r * 0.85 + sk, cy - r * 0.6],
        [cx + r * 0.85 + sk, cy - r * 0.6],
        [cx + r * 0.85 - sk, cy + r * 0.6],
        [cx - r * 0.85 - sk, cy + r * 0.6],
      ];
      break;
    }
    case 'right_arrow':
      pts = rightArrow(cx, cy, w, h);
      break;
    case 'left_arrow':
      pts = leftArrow(cx, cy, w, h);
      break;
    default:
      pts = rect(cx, cy, w, h);
  }
  return rotation ? rotatePoints(pts, cx, cy, rotation) : pts;
}

// SVG rendering spec — what the renderer needs to draw this shape (not the
// clipping polygon). Circles stay as native SVG elements. Ellipses and rects
// fall back to polygon when rotated, so the renderer doesn't need transform
// logic.
export function shapeToSvgSpec(shape, cx, cy, w, h, rotation = 0) {
  const r = Math.min(w, h) / 2;
  const hasRotation = Math.abs(rotation) > 1e-6;

  if (shape === 'circle') return { kind: 'circle', cx, cy, r };

  if (!hasRotation) {
    if (shape === 'oval') return { kind: 'ellipse', cx, cy, rx: r, ry: r * 0.65 };
    if (shape === 'vertical_oval') return { kind: 'ellipse', cx, cy, rx: r * 0.65, ry: r };
    if (shape === 'square') {
      return { kind: 'rect', x: cx - w / 2, y: cy - h / 2, width: w, height: h };
    }
    if (shape === 'rectangle') {
      const rh = h * 0.75; // keep in sync with the rectangle case in shapeToPolygon above
      return { kind: 'rect', x: cx - w / 2, y: cy - rh / 2, width: w, height: rh };
    }
    if (shape === 'horizontal_strip') {
      return { kind: 'rect', x: cx - w * 0.7, y: cy - h * 0.225, width: w * 1.4, height: h * 0.45 };
    }
    if (shape === 'vertical_strip') {
      // half-height = (h * 1.4) / 2 = h * 0.7 — must match shapeToPolygon's rect() above.
      return { kind: 'rect', x: cx - w * 0.225, y: cy - h * 0.7, width: w * 0.45, height: h * 1.4 };
    }
  }

  const pts = shapeToPolygon(shape, cx, cy, w, h, rotation);
  return { kind: 'polygon', points: pts };
}
