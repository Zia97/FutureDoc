// Generates authoring diagrams + exact region-sum ledgers, not approved questions.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs, writeJson } from './vr-common.mjs';
import { generateVennBatch, createVennQuestionExample, VENN_QUERY_KINDS } from '../../../../src/utils/venn/generate.js';
import { inspectExplicitDiagram, layoutExplicitDiagram } from '../../../../src/utils/venn/arrangement.js';
import { explicitKeyPolygon, explicitSetDash } from '../../../../src/utils/venn/explicitShapes.js';

const args = parseArgs(process.argv.slice(2));
const counts = String(args.sets || '3,4,5,6').split(',').map(Number);
const count = Number(args.count || (args.sets ? counts.length : 12));
if (counts.some(n => !Number.isInteger(n) || n < 2 || n > 6) || !Number.isInteger(count) || count < 1 || count > 100) {
  throw new Error('Use --sets "3,4,5,6" (each within 2..6) and --count within 1..100.');
}
const seed = String(args.seed || 'showcase');
const output = args.output || 'content-authoring/cache/venn-generated.json';
const htmlPath = args.html || output.replace(/\.json$/i, '') + '.html';
const reportPath = output.replace(/\.json$/i, '') + '.report.json';
const diagrams = [], reports = [];
const batch = generateVennBatch({ seed, count, setCounts: counts,
  ...(args.shapes ? { shapes: String(args.shapes).split(',') } : {}),
  ...(args.families ? { families: String(args.families).split(',') } : {}),
  ...(args.attempts ? { maxAttempts: Number(args.attempts) } : {}),
  ...(args['max-width'] ? { maxCanvasWidth: Number(args['max-width']) } : {}),
  ...(args['min-font'] ? { labelStyle: { minFontSize: Number(args['min-font']), preferredFontSize: Math.max(18, Number(args['min-font'])), padding: 3 } } : {}),
});
for (const [i, result] of batch.results.entries()) {
  const { cells } = inspectExplicitDiagram(result.config);
  const display = layoutExplicitDiagram(result.config, { targetWidthPx: 360 });
  diagrams.push(result.config);
  reports.push({ ...result.diagnostics, fingerprints: result.fingerprints,
    canvas: display.canvas, regionSpace: display.diagnostics.regionSpace,
    cells: cells.map(c => ({ id: c.id, inside: c.inside, component: c.component, area: c.area, clearance: c.clearance })),
    example: createVennQuestionExample(result.config, { kind: VENN_QUERY_KINDS[i % VENN_QUERY_KINDS.length], index: i }) });
  console.log(`Diagram ${i + 1}: ${result.diagnostics.composition.family}, ${result.config.sets.length} shapes, ${cells.length} regions, labels >= ${result.diagnostics.minFontSize.toFixed(1)}px.`);
}
console.log(`Diversity: ${batch.diversity.uniqueTopologies} different overlap structures across ${Object.keys(batch.diversity.familyCounts).length} layout families.`);

function escape(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function svg(config) {
  const layout = layoutExplicitDiagram(config, { targetWidthPx: 360 });
  const shapes = layout.shapes.map(s => s.kind === 'polygon'
    ? `<polygon points="${s.points.map(p => p.join(',')).join(' ')}"${s.strokeDasharray ? ` stroke-dasharray="${s.strokeDasharray}"` : ''}/>`
    : `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}"/>`).join('');
  const text = layout.labels.map(l => `<text x="${l.x}" y="${l.y}" font-size="${l.fontSize}" text-anchor="middle" dominant-baseline="central">${escape(l.text)}</text>`).join('');
  const boxes = layout.diagnostics.regionSpace.map(r => `<rect x="${r.labelBox.x}" y="${r.labelBox.y}" width="${r.labelBox.width}" height="${r.labelBox.height}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.canvas.width}" height="${layout.canvas.height}" viewBox="0 0 ${layout.canvas.width} ${layout.canvas.height}" role="img" aria-label="Set diagram"><g fill="none" stroke="#172534" stroke-width="2" stroke-linejoin="round">${shapes}</g><g class="label-boxes" fill="#00b89b22" stroke="#008776" stroke-width="0.7">${boxes}</g><g fill="#172534" font-family="Arial, sans-serif" font-weight="600">${text}</g></svg>`;
}
const cards = diagrams.map((config, i) => {
  const key = config.sets.map((s, index) => `<span class="key-item"><svg width="30" height="30"><polygon points="${explicitKeyPolygon(s).map(p => p.join(',')).join(' ')}" fill="none" stroke="#172534" stroke-width="1.5"${explicitSetDash(config.sets, index) ? ` stroke-dasharray="${explicitSetDash(config.sets, index)}"` : ''}/></svg>${escape(s.label)}</span>`).join('');
  const r = reports[i];
  const spaces = r.regionSpace.map(s => '<tr><td>' + escape(s.region) + '</td><td>' + Math.round(s.areaPx2) + '</td><td>' + s.availableBox.width.toFixed(1) + ' &times; ' + s.availableBox.height.toFixed(1) + '</td><td>' + s.fontSize.toFixed(1) + '</td><td>' + s.fontCapacityPx.toFixed(1) + '</td></tr>').join('');
  return `<article><h2>${escape(r.composition.family.replaceAll("_", " "))} &middot; ${config.sets.length} shapes / ${r.regions} regions</h2><div class="key">${key}</div><div class="viewport">${svg(config)}</div><p>${escape(r.example.prompt)}</p><details><summary>Show calculated answer and geometry</summary><p>${escape(r.example.answer.expression)} = <strong>${r.example.answer.total}</strong></p><table><tr><th>Shape</th><th>Width</th><th>Height</th><th>Angle</th></tr>${config.sets.map(s => `<tr><td>${escape(s.shape)}</td><td>${s.geometry.width}</td><td>${s.geometry.height}</td><td>${s.geometry.rotationDeg}&deg;</td></tr>`).join('')}</table></details><details><summary>Inspect region space and font capacity</summary><div class="table-scroll"><table><tr><th>Region</th><th>Area px&sup2;</th><th>Safe box px</th><th>Font px</th><th>Capacity px</th></tr>${spaces}</table></div></details></article>`;
}).join('');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DM diagram authoring preview</title><style>
.label-boxes{display:none}.show-boxes .label-boxes{display:block}.table-scroll{overflow-x:auto}*{box-sizing:border-box}body{margin:0;padding:24px;background:#eef3f5;color:#172534;font:15px/1.5 system-ui,sans-serif}header{max-width:940px;margin:auto auto 24px}h1{font-size:26px;margin:0 0 8px}h2{font-size:19px}button{padding:8px 15px;margin:4px;border:1px solid #b9c8d3;border-radius:6px;background:white;cursor:pointer}.grid{display:flex;flex-wrap:wrap;align-items:flex-start;gap:24px;justify-content:center}article{max-width:100%;padding:20px;background:white;border:1px solid #d5e0e6;border-radius:12px;box-shadow:0 4px 20px #1232}.viewport{width:var(--viewport,390px);max-width:100%;overflow-x:auto;border:1px solid #e0e7eb;background:white}.viewport svg{display:block;max-width:none}.key{display:flex;flex-wrap:wrap;gap:12px;max-width:var(--viewport,390px);margin-bottom:16px}.key-item{display:flex;align-items:center;gap:6px}details{max-width:var(--viewport,390px)}td,th{text-align:left;padding:4px 10px}summary{cursor:pointer;color:#076d73}article>p{max-width:var(--viewport,390px)}
</style><header><h1>DM diagram authoring preview</h1><p>${batch.diversity.uniqueTopologies} different overlap structures across ${Object.keys(batch.diversity.familyCounts).length} layout families. Each family combines variable spacing, heights, proportions, rotations and shape choices. Every region is measured for readable labels.</p><div>Viewport: <button onclick="setWidth(320)">320 px</button><button onclick="setWidth(390)">390 px</button><button onclick="setWidth(768)">768 px</button><button onclick="document.documentElement.classList.toggle('show-boxes')">Show label space</button></div><p>These are authoring examples; a full question still needs its narrative, distractors, novelty screening and independent review.</p></header><main class="grid">${cards}</main><script>function setWidth(w){document.documentElement.style.setProperty('--viewport',w+'px')};const initialWidth=Number(new URLSearchParams(location.search).get('width'));if([320,390,768].includes(initialWidth))setWidth(initialWidth);const params=new URLSearchParams(location.search);if(params.has('boxes'))document.documentElement.classList.add('show-boxes');const from=Number(params.get('from'))||0;const limit=Number(params.get('limit'))||Infinity;document.querySelectorAll('article').forEach((node,i)=>{if(i<from||i>=from+limit)node.style.display='none'});</script></html>`;
writeJson(output, diagrams);
writeJson(reportPath, { seed, diversity: batch.diversity, diagrams: reports });
fs.mkdirSync(path.dirname(path.resolve(htmlPath)), { recursive: true });
fs.writeFileSync(htmlPath, html);
console.log(`Diagrams: ${output}\nRegion/answer ledger: ${reportPath}\nVisual preview: ${htmlPath}`);
