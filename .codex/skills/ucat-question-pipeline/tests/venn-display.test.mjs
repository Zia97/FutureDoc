import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fitVennCanvasToWidth } from '../../../../src/utils/venn/display.js';
import { getLayoutAdaptive } from '../../../../src/utils/venn/layout.js';

test('every preview Venn canvas is contained at narrow phone widths', () => {
  for (const filename of ['src/dev/preview-dm.json', 'src/dev/preview-dm-timed.json']) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const questions = data[0]?.questions ?? data;
    const diagrams = questions.flatMap((question) => [
      question.stimulus_diagram,
      ...(question.decision_making_question_options ?? []).map((option) => option.option_data),
    ]).filter(Boolean);

    for (const config of diagrams) {
      for (const widthPx of [280, 320, 350]) {
        const canvas = getLayoutAdaptive(config, { maxWidthPx: widthPx }).canvas;
        const display = fitVennCanvasToWidth(canvas, widthPx);
        assert(display.width <= widthPx, `${filename} produced a ${display.width}px diagram in a ${widthPx}px viewport`);
        assert(display.height > 0);
      }
    }
  }
});

test('a wide diagram is scaled as one complete diagram without changing its aspect ratio', () => {
  const canvas = { width: 617, height: 300 };
  const display = fitVennCanvasToWidth(canvas, 320);

  assert.equal(display.width, 320);
  assert(Math.abs(display.width / display.height - canvas.width / canvas.height) < 1e-10);
});

test('practice Venn numeric labels remain readable at real narrow-phone content widths', () => {
  const questions = JSON.parse(fs.readFileSync('src/dev/preview-dm.json', 'utf8'));
  for (const question of questions.filter((item) => item.type === 'venn_diagram')) {
    const diagrams = question.stimulus_diagram
      ? [{ name: 'stimulus', config: question.stimulus_diagram, widthPx: 276 }]
      : question.decision_making_question_options.map((option) => ({
        name: `option ${option.label}`,
        config: option.option_data,
        widthPx: 252,
      }));

    for (const { name, config, widthPx } of diagrams) {
      const baked = getLayoutAdaptive(config, { maxWidthPx: widthPx });
      const display = fitVennCanvasToWidth(baked.canvas, widthPx);
      const scale = display.width / baked.canvas.width;
      const effectiveFonts = baked.labels
        .filter((label) => label.kind !== 'set')
        .map((label) => label.fontSize * scale);
      assert(Math.min(...effectiveFonts) >= 12,
        `Q${question.order_index} ${name} renders a numeric label below 12px`);
    }
  }
});
