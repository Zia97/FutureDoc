// Geometry-first Venn format. Every connected face is a separate region;
// its membership, label position and clearance come from the drawn outlines.
import polygonClipping from 'polygon-clipping';
import polylabel from 'polylabel';
import { EXPLICIT_SHAPES, explicitShapePolygon, explicitSetDash, polygonBounds } from './explicitShapes.js';
import { stableHash } from './topologies.js';
import { findRegionLabelBox, measureLabelText } from './labelSpace.js';

const MARGIN = 14;
const NUMERICAL_AREA = 1e-7;
const arrangementCache = new Map();
const supportedShapes = new Set(EXPLICIT_SHAPES);
const finite = v => typeof v === 'number' && Number.isFinite(v);

export function validateExplicitSets(sets) {
  if (!Array.isArray(sets) || sets.length < 2 || sets.length > 6) {
    throw new Error('V2 Venn diagrams require 2 to 6 sets.');
  }
  const ids = new Set();
  for (const set of sets) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(set?.id || '') || ids.has(set.id)) {
      throw new Error('Set IDs must be unique letters/digits, starting with a letter.');
    }
    ids.add(set.id);
    if (typeof set.label !== 'string' || !set.label.trim() || set.label.length > 80) {
      throw new Error(`Set ${set.id} needs a label of 1 to 80 characters.`);
    }
    if (!supportedShapes.has(set.shape)) throw new Error(`Unsupported Venn shape: ${set.shape}`);
    const g = set.geometry;
    if (!g || !['cx', 'cy', 'width', 'height'].every(k => finite(g[k])) ||
        !finite(g.rotationDeg ?? 0) || g.width < 1 || g.height < 1 ||
        g.width > 10000 || g.height > 10000 || Math.abs(g.cx) > 10000 ||
        Math.abs(g.cy) > 10000 || Math.abs(g.rotationDeg ?? 0) > 360) {
      throw new Error(`Set ${set.id} needs finite geometry, sizes within 1..10000 and rotationDeg within -360..360.`);
    }
    if (['circle', 'square'].includes(set.shape) && Math.abs(g.width - g.height) > 1e-6) {
      throw new Error(`${set.shape} ${set.id} needs equal width and height; use ellipse or rectangle for stretching.`);
    }
  }
}

function ringArea(ring) {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    sum += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(sum) / 2;
}

function polygonArea(polygon) {
  return ringArea(polygon[0]) - polygon.slice(1).reduce((sum, hole) => sum + ringArea(hole), 0);
}

function geometryKey(sets) {
  return JSON.stringify(sets.map(s => [s.id, s.shape, s.geometry.cx, s.geometry.cy,
    s.geometry.width, s.geometry.height, s.geometry.rotationDeg ?? 0]));
}

export function deriveVennArrangement(sets) {
  validateExplicitSets(sets);
  const key = geometryKey(sets);
  if (arrangementCache.has(key)) return arrangementCache.get(key);
  const outlines = sets.map(s => explicitShapePolygon(s.shape, s.geometry));
  const polygons = outlines.map(ring => [[ [...ring, ring[0]] ]]);
  const outlineBounds = outlines.map(polygonBounds);
  for (let a = 0; a < sets.length; a++) for (let b = a + 1; b < sets.length; b++) {
    if (Object.keys(outlineBounds[a]).every(k => Math.abs(outlineBounds[a][k] - outlineBounds[b][k]) < 1e-6)) {
      const difference = polygonClipping.xor(polygons[a], polygons[b]);
      if (difference.reduce((sum, p) => sum + polygonArea(p), 0) < NUMERICAL_AREA) {
        throw new Error(`Sets ${sets[a].id} and ${sets[b].id} have indistinguishable coincident outlines.`);
      }
    }
  }
  // Split existing atoms at each new boundary. Preserve every connected
  // component, including small slivers: the readability gate must reject them.
  let atoms = [];
  polygons.forEach((polygon, index) => {
    const next = [];
    for (const atom of atoms) {
      const intersection = polygonClipping.intersection(atom.polygon, polygon);
      const difference = polygonClipping.difference(atom.polygon, polygon);
      if (intersection.length) next.push({ mask: atom.mask | (1 << index), polygon: intersection });
      if (difference.length) next.push({ mask: atom.mask, polygon: difference });
    }
    const remainder = index ? polygonClipping.difference(polygon, ...polygons.slice(0, index)) : polygon;
    if (remainder.length) next.push({ mask: 1 << index, polygon: remainder });
    atoms = next;
  });
  const cells = [];
  atoms.sort((a, b) => a.mask - b.mask).forEach(atom => {
    const inside = sets.filter((_, i) => atom.mask & (1 << i)).map(s => s.id);
    const components = atom.polygon.map(polygon => ({ polygon, area: polygonArea(polygon), bounds: polygonBounds(polygon[0]) }))
      .filter(p => p.area > NUMERICAL_AREA)
      .sort((a, b) => a.bounds.minY - b.bounds.minY || a.bounds.minX - b.bounds.minX || b.area - a.area);
    components.forEach((part, component) => {
      const center = polylabel(part.polygon, 0.05);
      cells.push({
        id: `${inside.join('_')}_only:${component}`, inside, component,
        polygon: part.polygon, area: part.area, x: center[0], y: center[1], clearance: center.distance,
      });
    });
  });
  if (!cells.length) throw new Error('Venn geometry contains no visible regions.');
  const bounds = polygonBounds(outlines.flat());
  const result = { cells, outlines, bounds };
  if (arrangementCache.size >= 64) arrangementCache.delete(arrangementCache.keys().next().value);
  arrangementCache.set(key, result);
  return result;
}

export function inspectExplicitDiagram(config) {
  if (config?.schemaVersion !== 2) throw new Error('Expected Venn schemaVersion 2.');
  vennLabelStyle(config);
  const arrangement = deriveVennArrangement(config.sets);
  if (!Array.isArray(config.regions)) throw new Error('V2 regions must be an array of { id, value } records.');
  const cellsById = new Map(arrangement.cells.map(cell => [cell.id, cell]));
  const values = new Map();
  for (const region of config.regions) {
    if (!region || (region.id !== 'outside' && !cellsById.has(region.id))) {
      throw new Error(`Unknown or geometrically impossible region: ${region?.id}`);
    }
    if (values.has(region.id)) throw new Error(`Duplicate region: ${region.id}`);
    const v = region.value;
    if (!((Number.isSafeInteger(v) && v >= 0) || (typeof v === 'string' && v.trim() && v.length <= 16 && !/[\u0000-\u001f\u007f\u2028\u2029]/.test(v)))) {
      throw new Error(`Region ${region.id} needs a non-negative integer count or a short label.`);
    }
    values.set(region.id, v);
  }
  const missing = arrangement.cells.filter(cell => !values.has(cell.id));
  if (missing.length) throw new Error(`Unlabelled visible regions: ${missing.map(c => c.id).join(', ')}. Supply zero explicitly when needed.`);
  return { ...arrangement, values };
}

export function vennLabelStyle(config) {
  const { minFontSize = 12, preferredFontSize = 16, padding = 3 } = config.labelStyle || {};
  if (![minFontSize, preferredFontSize, padding].every(finite) || minFontSize < 12 || minFontSize > 32 ||
      preferredFontSize < minFontSize || preferredFontSize > 48 || padding < 2 || padding > 12) {
    throw new Error('labelStyle requires minimum font 12..32 px, preferred font minimum..48 px, and padding 2..12 px.');
  }
  return { minFontSize, preferredFontSize, padding };
}

export function layoutExplicitDiagram(config, options = {}) {
  const { cells, outlines, bounds, values } = inspectExplicitDiagram(config);
  const targetWidthPx = options.targetWidthPx ?? options.maxWidthPx ?? 360;
  const fontScale = options.fontScale ?? 1;
  if (!finite(targetWidthPx) || targetWidthPx <= 2 * MARGIN || !finite(fontScale) || fontScale < 1 || fontScale > 3) {
    throw new Error('Venn display width must exceed 28 px; fontScale must be within 1..3.');
  }
  const style = vennLabelStyle(config);
  const minFont = style.minFontSize * fontScale;
  const padding = style.padding;
  const maxCanvasWidth = options.maxCanvasWidth ?? 1200;
  const maxCanvasHeight = options.maxCanvasHeight ?? 1800;
  if (!finite(maxCanvasWidth) || maxCanvasWidth <= 2 * MARGIN || !finite(maxCanvasHeight) || maxCanvasHeight <= 2 * MARGIN) {
    throw new Error('Venn canvas limits must be finite and exceed 28 px.');
  }
  const shapeWidth = bounds.maxX - bounds.minX;
  const shapeHeight = bounds.maxY - bounds.minY;
  const outside = values.has('outside');
  const outsideFont = 14 * fontScale;
  const outsideHeight = outside ? outsideFont + 2 * padding + 8 : 0;
  const fitScale = Math.min((Math.min(targetWidthPx, maxCanvasWidth) - 2 * MARGIN) / shapeWidth,
    (maxCanvasHeight - 2 * MARGIN - outsideHeight) / shapeHeight);
  let scale = fitScale;
  let tightestRegion = null;
  const spaces = cells.map(cell => findRegionLabelBox(cell, values.get(cell.id), minFont, padding));
  for (let i = 0; i < cells.length; i++) {
    const needed = spaces[i].requiredScale;
    if (needed > scale) { scale = needed; tightestRegion = cells[i].id; }
  }
  const width = Math.ceil(shapeWidth * scale + 2 * MARGIN - 1e-8);
  const height = Math.ceil(shapeHeight * scale + 2 * MARGIN + outsideHeight - 1e-8);
  if (!Number.isFinite(width) || width > maxCanvasWidth || height > maxCanvasHeight || (options.strictWidth && width > Math.ceil(targetWidthPx))) {
    throw new Error(`Region ${tightestRegion || cells[0].id} requires a ${width} x ${height} canvas for readable labels. Adjust the geometry to remove narrow cells.`);
  }
  const translate = ([x, y]) => [(x - bounds.minX) * scale + MARGIN, (y - bounds.minY) * scale + MARGIN];
  const shapes = outlines.map((ring, i) => ({
    id: config.sets[i].id, label: config.sets[i].label, kind: 'polygon',
    points: ring.map(translate), strokeDasharray: explicitSetDash(config.sets, i),
  }));
  const regionSpace = [];
  const labels = cells.map((cell, i) => {
    const text = String(values.get(cell.id));
    const space = spaces[i];
    const availableWidth = space.width * scale, availableHeight = space.height * scale;
    const fontCapacity = Math.min((availableWidth - 2 * padding) / measureLabelText(text, 1).width,
      (availableHeight - 2 * padding) / 1.2);
    const fontSize = Math.max(minFont, Math.min(style.preferredFontSize * fontScale, fontCapacity));
    const [x, y] = translate([space.x, space.y]);
    const textSize = measureLabelText(text, fontSize);
    const labelBox = { x: x - textSize.width / 2 - padding, y: y - textSize.height / 2 - padding,
      width: textSize.width + 2 * padding, height: textSize.height + 2 * padding };
    regionSpace.push({ region: cell.id, inside: cell.inside, area: cell.area, areaPx2: cell.area * scale * scale,
      availableBox: { x: x - availableWidth / 2, y: y - availableHeight / 2, width: availableWidth, height: availableHeight },
      labelBox, fontCapacityPx: fontCapacity, fontSize, minimumFontSize: minFont, padding,
      requiredScale: space.requiredScale, searchConverged: space.searchConverged });
    return { region: cell.id, text, x, y, fontSize, labelBox, inside: cell.inside, component: cell.component };
  });
  if (outside) {
    const text = String(values.get('outside'));
    const textWidth = measureLabelText(text, outsideFont).width;
    if (textWidth + 2 * MARGIN > width) throw new Error('Outside label does not fit the canvas.');
    shapes.unshift({ id: '__universe__', kind: 'rect', x: 2, y: 2, width: width - 4, height: height - 4 });
    labels.push({ region: 'outside', text, x: MARGIN + textWidth / 2,
      y: height - MARGIN - outsideFont / 2, fontSize: outsideFont, inside: [] });
  }
  return {
    canvas: { width, height }, shapes, labels,
    diagnostics: { schemaVersion: 2, mode: 'explicit', geometryHash: stableHash(config),
      requestedWidth: targetWidthPx, readableWidth: width, minFontSize: minFont,
      requiresHorizontalScroll: width > Math.ceil(targetWidthPx), regionCount: cells.length,
      regionSpace, scale, preferredFontSize: style.preferredFontSize * fontScale },
  };
}

// Reusable answer derivation; count a face once even when it matches several
// requested sets. Disconnected components are summed independently.
export function evaluateVennQuery(config, query = {}) {
  const { cells, values } = inspectExplicitDiagram(config);
  const known = new Set(config.sets.map(s => s.id));
  const keys = new Set(['allOf', 'anyOf', 'noneOf', 'exactly', 'atLeast', 'atMost']);
  if (Object.keys(query).some(k => !keys.has(k))) throw new Error('Unknown Venn query constraint.');
  for (const k of ['allOf', 'anyOf', 'noneOf']) {
    if (query[k] != null && (!Array.isArray(query[k]) || query[k].some(id => !known.has(id)))) {
      throw new Error(`Query ${k} references an unknown set or is not an array.`);
    }
  }
  for (const k of ['exactly', 'atLeast', 'atMost']) {
    if (query[k] != null && (!Number.isInteger(query[k]) || query[k] < 0 || query[k] > known.size)) {
      throw new Error(`Query ${k} must be an integer between 0 and the set count.`);
    }
  }
  const canSelectOutside = !query.allOf?.length && !query.anyOf?.length &&
    (query.exactly == null || query.exactly === 0) && (query.atLeast == null || query.atLeast === 0);
  if (canSelectOutside && !values.has('outside')) {
    throw new Error('This query includes people outside every set, but no outside count is supplied. Use atLeast: 1 for the shown union.');
  }
  const rows = [...cells, ...(values.has('outside') ? [{ id: 'outside', inside: [] }] : [])];
  const selected = rows.filter(cell => {
    const ids = new Set(cell.inside), n = ids.size;
    return (query.allOf || []).every(id => ids.has(id)) &&
      (!query.anyOf?.length || query.anyOf.some(id => ids.has(id))) &&
      (query.noneOf || []).every(id => !ids.has(id)) &&
      (query.exactly == null || n === query.exactly) &&
      (query.atLeast == null || n >= query.atLeast) &&
      (query.atMost == null || n <= query.atMost);
  });
  if (selected.some(cell => !Number.isSafeInteger(values.get(cell.id)))) throw new Error('Numeric queries require numeric counts in every selected region.');
  const terms = selected.map(cell => ({ region: cell.id, value: values.get(cell.id), inside: cell.inside }));
  const total = terms.reduce((sum, term) => sum + term.value, 0);
  if (!Number.isSafeInteger(total)) throw new Error('Region total exceeds the safe integer range.');
  return { total, terms, expression: terms.map(t => t.value).join(' + ') || '0' };
}

const topologyCache = new WeakMap();
function canonicalTopology(cells, sets) {
  if (topologyCache.has(cells)) return topologyCache.get(cells);
  const ids = new Map(sets.map((s, i) => [s.id, i]));
  const members = cells.map(c => c.inside.map(id => ids.get(id)));
  let canonical = null;
  function visit(order, remaining) {
    if (!remaining.length) {
      const masks = members.map(group => group.reduce((mask, i) => mask | (1 << order[i]), 0)).sort((a, b) => a - b);
      const signature = `${sets.length}:${masks.join(',')}`;
      if (canonical == null || signature < canonical) canonical = signature;
      return;
    }
    remaining.forEach((value, i) => visit([...order, value], remaining.filter((_, j) => i !== j)));
  }
  visit([], sets.map((_, i) => i));
  topologyCache.set(cells, canonical);
  return canonical;
}

export function vennFingerprints(config) {
  const { cells, bounds } = inspectExplicitDiagram(config);
  const scale = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const round = n => Math.round(n * 1000) / 1000;
  const topologySignature = canonicalTopology(cells, config.sets);
  return {
    // Set permutations, palettes, values and pose cannot disguise a repeated
    // membership structure. Keep the full signature to avoid hash collisions.
    topology: stableHash(topologySignature), topologySignature,
    palette: stableHash(config.sets.map(s => s.shape).sort()),
    geometry: stableHash(config.sets.map(s => [s.shape,
      round((s.geometry.cx - bounds.minX) / scale), round((s.geometry.cy - bounds.minY) / scale),
      round(s.geometry.width / scale), round(s.geometry.height / scale), round(s.geometry.rotationDeg ?? 0)])),
  };
}
