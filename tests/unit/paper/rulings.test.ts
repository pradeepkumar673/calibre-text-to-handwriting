import { describe, expect, it } from 'vitest';
import { getPreset } from '@/engine/paper/presets';
import { buildPaperLayout, rulingLines } from '@/engine/paper/rulings';
import { PaperGeometryError } from '@/engine/paper/errors';
import { mmToPxExact, writableAreaMm } from '@/engine/paper/geometry';
import type { PaperTemplate, PixelLine } from '@/engine/paper/types';

// Horizontal rules have equal y1 and y2 and span the full writable width.
function horizontal(lines: PixelLine[]): PixelLine[] {
  return lines.filter((line) => line.y1 === line.y2);
}

function vertical(lines: PixelLine[]): PixelLine[] {
  return lines.filter((line) => line.x1 === line.x2);
}

describe('ruled template', () => {
  it('produces evenly spaced horizontal rules inside the margins', () => {
    const template = getPreset('a4');
    const lines = rulingLines(template, 150);
    const rules = horizontal(lines);
    expect(rules.length).toBeGreaterThan(0);

    const gaps = rules.slice(1).map((line, index) => line.y1 - (rules[index]?.y1 ?? 0));
    const expectedGap = mmToPxExact(8, 150);
    for (const gap of gaps) {
      expect(Math.abs(gap - expectedGap)).toBeLessThan(0.02);
    }
  });

  it('keeps every rule inside the writable area', () => {
    const template = getPreset('a4');
    const area = writableAreaMm(template);
    const topPx = mmToPxExact(area.y, 150);
    const bottomPx = mmToPxExact(area.y + area.height, 150);
    const leftPx = mmToPxExact(area.x, 150);
    const rightPx = mmToPxExact(area.x + area.width, 150);

    for (const line of horizontal(rulingLines(template, 150))) {
      expect(line.y1).toBeGreaterThan(topPx);
      expect(line.y1).toBeLessThanOrEqual(bottomPx + 0.01);
      expect(line.x1).toBeGreaterThanOrEqual(Math.round(leftPx));
      expect(line.x2).toBeLessThanOrEqual(Math.round(rightPx));
    }
  });

  it('starts the first rule one pitch below the top margin', () => {
    const template = getPreset('a4');
    const first = horizontal(rulingLines(template, 150))[0];
    const expected = mmToPxExact(20 + 8, 150);
    expect(first?.y1).toBeCloseTo(expected, 1);
  });

  it('uses the configured colour and stroke width', () => {
    const template = getPreset('a4');
    const line = rulingLines(template, 150)[0];
    expect(line?.color).toBe('#b8c4d6');
    expect(line?.strokeWidthPx).toBeGreaterThan(0);
  });
});

describe('other ruling kinds', () => {
  it('unruled produces no lines', () => {
    const template: PaperTemplate = {
      ...getPreset('a4'),
      ruling: { ...getPreset('a4').ruling, kind: 'unruled' },
    };
    expect(rulingLines(template, 150)).toEqual([]);
  });

  it('grid produces both horizontal and vertical lines', () => {
    const template: PaperTemplate = {
      ...getPreset('a4'),
      ruling: { ...getPreset('a4').ruling, kind: 'grid', gridSpacingMm: 10 },
    };
    const lines = rulingLines(template, 150);
    expect(horizontal(lines).length).toBeGreaterThan(0);
    expect(vertical(lines).length).toBeGreaterThan(0);
  });

  it('margin adds one full-height vertical line at the margin position', () => {
    const template: PaperTemplate = {
      ...getPreset('a4'),
      ruling: { ...getPreset('a4').ruling, kind: 'margin', marginLineMm: 25 },
    };
    const lines = rulingLines(template, 150);
    const margin = vertical(lines);
    expect(margin).toHaveLength(1);
    expect(margin[0]?.y1).toBe(0);
    expect(margin[0]?.y2).toBe(1754);
    expect(margin[0]?.x1).toBeCloseTo(mmToPxExact(25, 150), 1);
  });
});

describe('validation', () => {
  it('rejects a non-positive line spacing', () => {
    const template: PaperTemplate = {
      ...getPreset('a4'),
      ruling: { ...getPreset('a4').ruling, lineSpacingMm: 0 },
    };
    expect(() => rulingLines(template, 150)).toThrow(PaperGeometryError);
  });

  it('rejects an empty colour', () => {
    const template: PaperTemplate = {
      ...getPreset('a4'),
      ruling: { ...getPreset('a4').ruling, color: '  ' },
    };
    expect(() => rulingLines(template, 150)).toThrow(/color/);
  });
});

describe('buildPaperLayout', () => {
  it('returns the sheet size, writable area and lines for A4 at 150 DPI', () => {
    const layout = buildPaperLayout(getPreset('a4'), 150);
    expect(layout.widthPx).toBe(1240);
    expect(layout.heightPx).toBe(1754);
    expect(layout.dpi).toBe(150);
    expect(layout.lines.length).toBeGreaterThan(0);
  });

  it('gives all three presets valid geometry', () => {
    for (const id of ['a4', 'a5', 'us-letter'] as const) {
      const layout = buildPaperLayout(getPreset(id), 150);
      expect(layout.widthPx).toBeGreaterThan(0);
      expect(layout.heightPx).toBeGreaterThan(0);
      expect(layout.writableArea.width).toBeGreaterThan(0);
      expect(layout.writableArea.height).toBeGreaterThan(0);
      expect(layout.lines.length).toBeGreaterThan(0);
    }
  });
});
