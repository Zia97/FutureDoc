// Proposal grammar only. Families suggest relationships; geometry validation
// decides which overlaps actually exist. Every parameter is sampled anew.
export const VENN_LAYOUT_FAMILIES = Object.freeze([
  'orbit', 'chain', 'staircase', 'zigzag', 'wave', 'lattice', 'fan', 'hub_spokes',
  'nested_cluster', 'nested_chain', 'two_clusters', 'bridge', 'crossing_bands',
  'scatter', 'branching', 'freeform',
]);

const PALETTE = ['circle', 'ellipse', 'triangle', 'square', 'rectangle', 'diamond',
  'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'teardrop', 'rounded_rectangle',
  'trapezoid', 'parallelogram', 'right_arrow', 'left_arrow'];
const round = n => Math.round(n * 100) / 100;
const degrees = a => ((a + 540) % 360) - 180;

export function proposeVennSets(random, { setCount, shapes, labels, family }) {
  if (!VENN_LAYOUT_FAMILIES.includes(family)) throw new Error(`Unknown Venn layout family: ${family}`);
  const between = (a, b) => a + random() * (b - a);
  const picked = shapes || PALETTE.map(shape => ({ shape, rank: random() }))
    .sort((a, b) => a.rank - b.rank).slice(0, setCount).map(s => s.shape);
  const slots = [];
  const spacing = between(0.55, 0.95), amplitude = between(0.3, 0.7), phase = between(-Math.PI, Math.PI);
  for (let i = 0; i < setCount; i++) {
    const a = i * 2 * Math.PI / setCount + phase;
    let x = 0, y = 0, size = between(1.05, 1.65), aspect = between(0.7, 1.5), rotation = between(-180, 180);
    switch (family) {
      case 'orbit': x = Math.cos(a) * spacing; y = Math.sin(a) * spacing; break;
      case 'chain': x = i * spacing; y = between(-0.1, 0.1); break;
      case 'staircase': x = i * spacing * 0.7; y = i * spacing * 0.75; break;
      case 'zigzag': x = i * spacing; y = (i % 2 ? 1 : -1) * amplitude; break;
      case 'wave': x = i * spacing; y = Math.sin(i * between(0.8, 1.2) + phase) * amplitude; break;
      case 'lattice': x = (i % 3) * spacing; y = Math.floor(i / 3) * spacing; break;
      case 'fan':
        rotation = -70 + i * 140 / Math.max(1, setCount - 1);
        x = Math.sin(rotation * Math.PI / 180) * amplitude;
        y = -Math.cos(rotation * Math.PI / 180) * amplitude;
        aspect = between(0.35, 0.6); size = between(1.8, 2.5); break;
      case 'hub_spokes':
        x = i ? Math.cos(a) * between(0.9, 1.3) : 0;
        y = i ? Math.sin(a) * between(0.9, 1.3) : 0;
        size = i ? between(0.85, 1.3) : between(1.7, 2.2); break;
      case 'nested_cluster':
        x = i ? Math.cos(a) * between(0.25, 0.6) : 0;
        y = i ? Math.sin(a) * between(0.25, 0.6) : 0;
        size = i ? between(0.9, 1.4) : between(3.5, 4.5); break;
      case 'nested_chain':
        size = 1 + (setCount - i - 1) * between(0.9, 1.3);
        aspect = 1; rotation = 0; x = i * 0.03; y = i * 0.025; break;
      case 'two_clusters':
        x = (i % 2 ? 1 : -1) * between(0.95, 1.5) + Math.cos(a) * 0.3;
        y = Math.sin(a) * 0.45; break;
      case 'bridge':
        x = i === 0 ? 0 : (i % 2 ? 1 : -1) * between(0.9, 1.3);
        y = i === 0 ? 0 : Math.sin(a) * 0.5;
        if (i === 0) { aspect = between(2.8, 3.8); size = between(1.6, 2); rotation = between(-12, 12); }
        break;
      case 'crossing_bands':
        x = (i % 2) * spacing - 0.25; y = Math.floor(i / 2) * spacing * 0.55;
        size = between(1.5, 2.1); aspect = between(2, 3.5); rotation = (i % 2) * 90 + between(-12, 12); break;
      case 'scatter': x = between(-1.1, 1.1); y = between(-1.1, 1.1); break;
      case 'branching':
      case 'freeform': {
        if (!i) break;
        const parent = slots[family === 'branching' ? Math.floor((i - 1) / 2) : Math.floor(random() * i)];
        const attachment = random();
        const direction = between(-Math.PI, Math.PI);
        let distance = (parent.size + size) * between(0.22, 0.38);
        if (family === 'freeform' && attachment < 0.18) { size = parent.size * between(0.3, 0.48); distance = parent.size * 0.08; }
        else if (family === 'freeform' && attachment > 0.82) distance *= 1.7;
        x = parent.x + Math.cos(direction) * distance;
        y = parent.y + Math.sin(direction) * distance;
        break;
      }
    }
    slots.push({ x, y, size, aspect, rotation });
  }
  // Compose independent scene transformations with local shape transforms.
  // No family fixes the final orientation, scale hierarchy or aspect ratio.
  const sceneRotation = between(-180, 180), theta = sceneRotation * Math.PI / 180;
  const reflect = random() < 0.5 ? -1 : 1;
  const spreadX = between(0.8, 1.25), spreadY = between(0.8, 1.25);
  const jitter = family === 'nested_chain' ? 0.01 : between(0.025, 0.14);
  const sets = slots.map((slot, index) => {
    const x = (slot.x + between(-jitter, jitter)) * reflect * spreadX;
    const y = (slot.y + between(-jitter, jitter)) * spreadY;
    const shape = picked[index];
    let width = 200 * slot.size * Math.sqrt(slot.aspect), height = 200 * slot.size / Math.sqrt(slot.aspect);
    if (shape === 'circle' || shape === 'square') width = height = 200 * slot.size;
    return { id: `set${index + 1}`, label: labels?.[index] || `Group ${index + 1}`, shape,
      geometry: { cx: round(400 + 200 * (x * Math.cos(theta) - y * Math.sin(theta))),
        cy: round(400 + 200 * (x * Math.sin(theta) + y * Math.cos(theta))),
        width: round(width), height: round(height), rotationDeg: shape === 'circle' ? 0 : round(degrees(slot.rotation * reflect + sceneRotation)) } };
  });
  return { sets, composition: { family, sceneRotation: round(sceneRotation), reflected: reflect < 0,
    spreadX: round(spreadX), spreadY: round(spreadY), spacing: round(spacing), jitter: round(jitter) } };
}
