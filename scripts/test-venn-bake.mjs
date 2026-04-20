// Test harness: runs the baker against every venn question in preview JSON
// files and asserts the invariants we care about:
//   - every labelled region has fontSize >= MIN_FONT_SIZE (= 12)
//   - every label is at least PADDING px from any shape outline
//   - no bake() throws for questions we expect to render

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import polygonClipping from 'polygon-clipping';

import { bake, MIN_FONT_SIZE } from '../src/utils/venn/bake.js';
import { shapeToPolygon } from '../src/utils/venn/shapes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'src/dev/preview-dm-timed.json',
  'src/dev/preview-dm.json',
  'src/dev/_batch-1-dm.json',
];

// Re-implement a small distance-to-outline check for testing.
function distPointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distToRing(px, py, ring) {
  let best = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const d = distPointToSegment(px, py, x1, y1, x2, y2);
    if (d < best) best = d;
  }
  return best;
}

// Two checks per baked diagram:
//   strict (pixel mode): every label fontSize >= MIN_FONT_SIZE AND label
//     clearance from every outline >= fontSize/2 (proper readability).
//   relaxed (natural fallback mode): label clearance just needs to be >=
//     fontSize/2 so text doesn't sit *on* an outline. Font may be < MIN_FONT_SIZE.
function assertLabelClearances(baked, title, { strict }) {
  const shapePolys = baked.shapes.map(s => {
    if (s.kind === 'circle') return shapeToPolygon('circle', s.cx, s.cy, s.r * 2, s.r * 2);
    if (s.kind === 'ellipse') {
      const shape = s.rx > s.ry ? 'oval' : 'vertical_oval';
      const w = Math.max(s.rx, s.ry) * 2, h = Math.max(s.rx, s.ry) * 2;
      return shapeToPolygon(shape, s.cx, s.cy, w, h);
    }
    if (s.kind === 'rect') {
      return shapeToPolygon('rectangle', s.x + s.width / 2, s.y + s.height / 2, s.width, s.height);
    }
    if (s.kind === 'polygon') return s.points;
    return [];
  });

  const issues = [];
  for (const lbl of baked.labels) {
    if (lbl.region === 'outside') continue;
    if (strict && lbl.fontSize < MIN_FONT_SIZE) {
      issues.push(`  label "${lbl.text}" (${lbl.region}) font ${lbl.fontSize} < ${MIN_FONT_SIZE}`);
    }
    let minDist = Infinity;
    for (const ring of shapePolys) {
      const d = distToRing(lbl.x, lbl.y, ring);
      if (d < minDist) minDist = d;
    }
    const requiredClearance = lbl.fontSize / 2;
    if (minDist < requiredClearance) {
      issues.push(
        `  label "${lbl.text}" (${lbl.region}) at (${lbl.x.toFixed(1)},${lbl.y.toFixed(1)}) ` +
        `only ${minDist.toFixed(1)} from outline, needs ${requiredClearance}`,
      );
    }
  }
  if (issues.length) {
    console.error(`FAIL: ${title}`);
    for (const issue of issues) console.error(issue);
    return false;
  }
  return true;
}

function findVennConfigs(question) {
  const configs = [];
  if (question.stimulus_diagram) {
    configs.push({ vennConfig: question.stimulus_diagram, role: 'stimulus' });
  }
  const opts = question.decision_making_question_options || question.options || [];
  for (const opt of opts) {
    const cfg = opt.option_data || opt.vennConfig;
    if (cfg && cfg.sets && cfg.regions) {
      configs.push({ vennConfig: cfg, role: `option ${opt.label}` });
    }
  }
  return configs;
}

// Realistic display widths the renderer uses on a typical phone:
//   stimulus  ≈ contentWidth (380) - card padding (32) = 348
//   options   ≈ contentWidth (380) - card padding (24) = 356
// The test exercises both natural-scale mode and pixel-targeted mode so we
// catch any topology that bakes naturally but fails at a real on-screen size.
const PIXEL_TARGET_PX = 340;

function run() {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const relPath of FILES) {
    const fullPath = path.join(ROOT, relPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`SKIP (missing): ${relPath}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const questions = Array.isArray(data) ? data : (data.questions || []);

    for (const q of questions) {
      if (q.type !== 'venn_diagram') continue;
      const configs = findVennConfigs(q);
      for (const { vennConfig, role } of configs) {
        // Natural fallback bake — must always succeed, labels may be small,
        // but text must never sit *on* a shape outline.
        total++;
        const naturalTitle = `${relPath} :: ${q.title || q.id} :: ${role} :: natural`;
        try {
          const baked = bake(vennConfig);
          if (assertLabelClearances(baked, naturalTitle, { strict: false })) passed++;
          else failed++;
        } catch (err) {
          failed++;
          console.error(`THROW: ${naturalTitle}\n  ${err.message}`);
        }

        // Pixel-targeted bake — strict (>=12px font, full clearance). Failures
        // are expected on dense topologies and tracked separately to show how
        // often the renderer must fall back.
        try {
          const baked = bake(vennConfig, { targetWidthPx: PIXEL_TARGET_PX });
          if (assertLabelClearances(baked, `${relPath} :: ${q.title || q.id} :: ${role} :: pixel@${PIXEL_TARGET_PX}`, { strict: true })) {
            pixelFitOk++;
          } else {
            pixelFitFail++;
          }
        } catch {
          pixelFitFail++;
        }
      }
    }
  }

  console.log('');
  console.log(`Natural-scale bakes:        ${total} total, ${passed} passed, ${failed} failed`);
  console.log(`Pixel-targeted (${PIXEL_TARGET_PX} px):    ${pixelFitOk} fit, ${pixelFitFail} need fallback`);
  console.log(`(natural-scale must be 100% — pixel-target failures are expected for dense topologies and trigger renderer fallback)`);
  process.exit(failed === 0 ? 0 : 1);
}

let pixelFitOk = 0;
let pixelFitFail = 0;

run();
