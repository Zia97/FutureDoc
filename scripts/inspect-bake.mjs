// Quick diagnostic: bake every question both ways, report canvas size, variant,
// and worst label clearance.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bake } from '../src/utils/venn/bake.js';
import { stableHash, seedPositions } from '../src/utils/venn/topologies.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/dev/preview-dm.json'), 'utf8'));
const TARGET = 340;

// Keep in sync with LAYOUT_COMBOS in topologies.js — the inspect script has
// to mirror them so the reported variant matches what the baker picks.
const LAYOUT_COMBOS = [
  { inner: 'row',      external: 'right'  },
  { inner: 'row',      external: 'left'   },
  { inner: 'row',      external: 'top'    },
  { inner: 'row',      external: 'bottom' },
  { inner: 'two_rows', external: 'right'  },
  { inner: 'two_rows', external: 'left'   },
];

console.log(`question                       | sets | inner    | side    | natural canvas | pixel canvas`);
console.log(`-------------------------------+------+----------+---------+----------------+-------------`);
for (const q of data) {
  if (q.type !== 'venn_diagram') continue;
  const cfg = q.stimulus_diagram || q.decision_making_question_options?.[0]?.option_data;
  if (!cfg) continue;
  const hash = stableHash({ sets: cfg.sets, regions: cfg.regions });
  const combo = LAYOUT_COMBOS[hash % LAYOUT_COMBOS.length];
  const innerVariant = combo.inner;
  const externalSide = combo.external;
  let nat = '?', pix = '?';
  try { const b = bake(cfg); nat = `${b.canvas.width}x${b.canvas.height}`; } catch (e) { nat = 'THROW'; }
  try { const b = bake(cfg, { targetWidthPx: TARGET }); pix = `${b.canvas.width}x${b.canvas.height}`; } catch (e) { pix = 'THROW'; }
  console.log(
    `${q.title.padEnd(30)} | ${String(cfg.sets.length).padStart(4)} | ${innerVariant.padEnd(8)} | ${externalSide.padEnd(7)} | ${nat.padEnd(14)} | ${pix}`,
  );
}
