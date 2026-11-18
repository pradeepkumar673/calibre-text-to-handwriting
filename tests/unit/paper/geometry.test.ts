import { describe, expect, it } from 'vitest';
import { getPreset } from '@/engine/paper/presets';
import {
  mmToPx,
  mmToPxExact,
  sheetSizePx,
  writableAreaMm,
  writableAreaPx,
} from '@/engine/paper/geometry';
import { PaperGeometryError } from '@/engine/paper/errors';
import type { PaperTemplate } from '@/engine/paper/types';

describe('mmToPx', () => {
  it('converts millimetres to pixels at 150 DPI', () => {
    expect(mmToPx(25.4, 150)).toBe(150);
    expect(mmToPx(210, 150)).toBe(1240);
  });

  it('defaults to 150 DPI', () => {
    expect(mmToPx(25.4)).toBe(150);
  });

  it('rejects a negative length', () => {
    expect(() => mmToPx(-1, 150)).toThrow(PaperGeometryError);
  });

  it('rejects a zero or negative DPI', () => {
    expect(() => mmToPx(10, 0)).toThrow(PaperGeometryError);
    expect(() => mmToPxExact(10, -5)).toThrow(PaperGeometryError);
  });
});

describe('preset sheet sizes at 150 DPI', () => {
  it('A4 is 1240 x 1754 px', () => {
    expect(sheetSizePx(getPreset('a4'), 150)).toEqual({ widthPx: 1240, heightPx: 1754 });
  });

  it('A5 is 874 x 1240 px', () => {
    expect(sheetSizePx(getPreset('a5'), 150)).toEqual({ widthPx: 874, heightPx: 1240 });
  });

  it('US Letter is 1276 x 1648 px', () => {
    expect(sheetSizePx(getPreset('us-letter'), 150)).toEqual({ widthPx: 1276, heightPx: 1648 });
  });
});

describe('writable area', () => {
  it('removes margins from every side of A4', () => {
    expect(writableAreaMm(getPreset('a4'))).toEqual({ x: 20, y: 20, width: 170, height: 257 });
  });

  it('returns a pixel writable area inside the sheet', () => {
    const template = getPreset('a4');
    const area = writableAreaPx(template, 150);
    expect(area.x).toBeGreaterThan(0);
    expect(area.y).toBeGreaterThan(0);
    expect(area.x + area.width).toBeLessThanOrEqual(1240);
    expect(area.y + area.height).toBeLessThanOrEqual(1754);
  });

  it('rejects margins that leave no writable width', () => {
    const template: PaperTemplate = {
      ...getPreset('a5'),
      margins: { top: 10, right: 80, bottom: 10, left: 80 },
    };
    expect(() => writableAreaMm(template)).toThrow(/no writable width/);
  });

  it('rejects margins that leave no writable height', () => {
    const template: PaperTemplate = {
      ...getPreset('a5'),
      margins: { top: 120, right: 10, bottom: 100, left: 10 },
    };
    expect(() => writableAreaMm(template)).toThrow(/no writable height/);
  });
});

describe('presets', () => {
  it('each call returns a fresh object, so edits do not leak between calls', () => {
    const first = getPreset('a4');
    first.margins.top = 99;
    expect(getPreset('a4').margins.top).toBe(20);
  });
});
