// V2 shapes use actual bounding-box dimensions and clockwise degrees.
// Rendering and clipping consume this same polygon, including curved outlines.
import { shapeToPolygon } from './shapes.js';

export const EXPLICIT_SHAPES = Object.freeze([
  'circle', 'ellipse', 'oval', 'vertical_oval', 'square', 'rectangle',
  'rounded_rectangle', 'horizontal_strip', 'vertical_strip', 'triangle',
  'isosceles_triangle', 'diamond', 'pentagon', 'hexagon', 'octagon', 'star',
  'trapezoid', 'parallelogram', 'right_arrow', 'left_arrow', 'heart', 'teardrop',
]);
const SHAPES = new Set(EXPLICIT_SHAPES);
const SAMPLES = 128;

function unitOutline(shape) {
  if (['circle', 'ellipse', 'oval', 'vertical_oval'].includes(shape)) {
    return Array.from({ length: SAMPLES }, (_, i) => {
      const a = i * 2 * Math.PI / SAMPLES;
      return [Math.cos(a), Math.sin(a)];
    });
  }
  if (shape === 'heart') {
    return Array.from({ length: SAMPLES }, (_, i) => {
      const a = i * 2 * Math.PI / SAMPLES;
      return [16 * Math.sin(a) ** 3,
        -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))];
    });
  }
  if (shape === 'teardrop') {
    // A flat top/right corner and a rounded lower/left outline.
    return [[0, -1], [1, -1], ...Array.from({ length: 97 }, (_, i) => {
      const a = i * 1.5 * Math.PI / 96;
      return [Math.cos(a), Math.sin(a)];
    }).slice(0, -1)];
  }
  return shapeToPolygon(shape, 0, 0, 2, 2);
}

export function polygonBounds(points) {
  return {
    minX: Math.min(...points.map(p => p[0])), maxX: Math.max(...points.map(p => p[0])),
    minY: Math.min(...points.map(p => p[1])), maxY: Math.max(...points.map(p => p[1])),
  };
}

export function explicitShapePolygon(shape, geometry) {
  if (!SHAPES.has(shape)) throw new Error(`Unsupported Venn shape: ${shape}`);
  const { cx, cy, width, height, rotationDeg = 0 } = geometry;
  let points;
  if (shape === 'rounded_rectangle') {
    const r = Math.min(width, height) * 0.16;
    points = [];
    const corners = [[width / 2 - r, -height / 2 + r], [width / 2 - r, height / 2 - r],
      [-width / 2 + r, height / 2 - r], [-width / 2 + r, -height / 2 + r]];
    corners.forEach(([x, y], corner) => {
      for (let i = 0; i <= 16; i++) {
        const a = (corner - 1) * Math.PI / 2 + i * Math.PI / 32;
        points.push([x + r * Math.cos(a), y + r * Math.sin(a)]);
      }
    });
  } else {
    const unit = unitOutline(shape);
    const b = polygonBounds(unit);
    points = unit.map(([x, y]) => [
      ((x - b.minX) / (b.maxX - b.minX) - 0.5) * width,
      ((y - b.minY) / (b.maxY - b.minY) - 0.5) * height,
    ]);
  }
  const a = rotationDeg * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  return points.map(([x, y]) => [cx + x * cos - y * sin, cy + x * sin + y * cos]);
}

// Repeated shapes remain distinguishable without floating set labels crossing
// region counts. The key and diagram use the same stable dash assignment.
function outlineFamily(shape) {
  if (['circle', 'ellipse', 'oval', 'vertical_oval'].includes(shape)) return 'ellipse';
  if (['square', 'rectangle', 'diamond', 'horizontal_strip', 'vertical_strip'].includes(shape)) return 'quadrilateral';
  if (['triangle', 'isosceles_triangle'].includes(shape)) return 'triangle';
  if (['left_arrow', 'right_arrow'].includes(shape)) return 'arrow';
  return shape;
}

export function explicitSetDash(sets, index) {
  // Aliases and shapes that become alike through rotation/stretching also
  // need separate identities (for example a square and a rotated diamond).
  const family = outlineFamily(sets[index].shape);
  const peers = sets.filter(s => outlineFamily(s.shape) === family);
  if (peers.length < 2) return undefined;
  const rank = peers.findIndex(s => s.id === sets[index].id);
  return [undefined, '7 4', '2 4', '9 3 2 3', '12 4', '5 3 2 3 2 3'][rank];
}

export function explicitKeyPolygon(set, size = 26) {
  const source = set.geometry || { width: 100, height: 100 };
  // Keep a canonical upright key; rotation is a pose, not a different set.
  const scale = size / Math.max(source.width, source.height);
  return explicitShapePolygon(set.shape, {
    cx: size / 2 + 2, cy: size / 2 + 2,
    width: source.width * scale, height: source.height * scale, rotationDeg: 0,
  });
}
