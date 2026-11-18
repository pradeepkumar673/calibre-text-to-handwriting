import { PaperGeometryError } from './errors';
import {
  mmToPxExact,
  sheetSizePx,
  validateTemplate,
  writableAreaMm,
  writableAreaPx,
  DEFAULT_DPI,
  requireDpi,
} from './geometry';
import type { PaperLayout, PaperTemplate, PixelLine, RulingStyle } from './types';

// Pixel values are rounded to two decimal places, which keeps output stable across floating point noise.
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function requireRuling(ruling: RulingStyle): void {
  if (!Number.isFinite(ruling.lineSpacingMm) || ruling.lineSpacingMm <= 0) {
    throw new PaperGeometryError(
      `ruling.lineSpacingMm must be a positive number, got ${ruling.lineSpacingMm}.`,
    );
  }
  if (!Number.isFinite(ruling.strokeWidthMm) || ruling.strokeWidthMm <= 0) {
    throw new PaperGeometryError(
      `ruling.strokeWidthMm must be a positive number, got ${ruling.strokeWidthMm}.`,
    );
  }
  if (ruling.color.trim().length === 0) {
    throw new PaperGeometryError('ruling.color must not be empty.');
  }
  if (ruling.kind === 'grid') {
    const spacing = ruling.gridSpacingMm ?? ruling.lineSpacingMm;
    if (!Number.isFinite(spacing) || spacing <= 0) {
      throw new PaperGeometryError(
        `ruling.gridSpacingMm must be a positive number, got ${spacing}.`,
      );
    }
  }
  if (
    ruling.kind === 'margin' &&
    ruling.marginLineMm !== undefined &&
    !Number.isFinite(ruling.marginLineMm)
  ) {
    throw new PaperGeometryError('ruling.marginLineMm must be a finite number.');
  }
}

// Horizontal rules across the writable area, from the first line below the top margin
// to the last line that still fits above the bottom margin.
function horizontalLines(template: PaperTemplate, dpi: number): PixelLine[] {
  const { ruling } = template;
  const area = writableAreaMm(template);
  const strokeWidthPx = round2(mmToPxExact(ruling.strokeWidthMm, dpi));
  const x1 = Math.round(mmToPxExact(area.x, dpi));
  const x2 = Math.round(mmToPxExact(area.x + area.width, dpi));
  const lines: PixelLine[] = [];
  const bottomMm = area.y + area.height;

  // Rules sit one pitch below the top of the writable area, so the first line is not on the margin edge.
  for (let step = 1; ; step += 1) {
    const yMm = area.y + step * ruling.lineSpacingMm;
    if (yMm > bottomMm + 1e-9) {
      break;
    }
    const y = round2(mmToPxExact(yMm, dpi));
    lines.push({ x1, y1: y, x2, y2: y, color: ruling.color, strokeWidthPx });
  }
  return lines;
}

// Vertical rules every gridSpacingMm across the writable area.
function verticalGridLines(template: PaperTemplate, dpi: number): PixelLine[] {
  const { ruling } = template;
  const area = writableAreaMm(template);
  const spacingMm = ruling.gridSpacingMm ?? ruling.lineSpacingMm;
  const strokeWidthPx = round2(mmToPxExact(ruling.strokeWidthMm, dpi));
  const y1 = Math.round(mmToPxExact(area.y, dpi));
  const y2 = Math.round(mmToPxExact(area.y + area.height, dpi));
  const lines: PixelLine[] = [];
  const rightMm = area.x + area.width;

  for (let step = 0; ; step += 1) {
    const xMm = area.x + step * spacingMm;
    if (xMm > rightMm + 1e-9) {
      break;
    }
    const x = round2(mmToPxExact(xMm, dpi));
    lines.push({ x1: x, y1, x2: x, y2, color: ruling.color, strokeWidthPx });
  }
  return lines;
}

// Vertical margin line at marginLineMm from the left edge of the sheet, spanning the full sheet height.
function marginLine(template: PaperTemplate, dpi: number): PixelLine[] {
  const { ruling } = template;
  const positionMm = ruling.marginLineMm ?? template.margins.left;
  const { heightPx } = sheetSizePx(template, dpi);
  const x = round2(mmToPxExact(positionMm, dpi));
  return [
    {
      x1: x,
      y1: 0,
      x2: x,
      y2: heightPx,
      color: ruling.color,
      strokeWidthPx: round2(mmToPxExact(ruling.strokeWidthMm, dpi)),
    },
  ];
}

// Returns every ruling line for the template, in pixels, for the given DPI.
export function rulingLines(template: PaperTemplate, dpi: number = DEFAULT_DPI): PixelLine[] {
  validateTemplate(template);
  requireDpi(dpi);
  requireRuling(template.ruling);

  switch (template.ruling.kind) {
    case 'unruled':
      return [];
    case 'ruled':
      return horizontalLines(template, dpi);
    case 'grid':
      return [...horizontalLines(template, dpi), ...verticalGridLines(template, dpi)];
    case 'margin':
      return [...horizontalLines(template, dpi), ...marginLine(template, dpi)];
    default: {
      const exhaustive: never = template.ruling.kind;
      throw new PaperGeometryError(`Unknown ruling kind: ${String(exhaustive)}`);
    }
  }
}

// Full layout for the renderer: sheet size, writable area and every ruling line, in pixels.
export function buildPaperLayout(template: PaperTemplate, dpi: number = DEFAULT_DPI): PaperLayout {
  const { widthPx, heightPx } = sheetSizePx(template, dpi);
  return {
    widthPx,
    heightPx,
    dpi,
    writableArea: writableAreaPx(template, dpi),
    lines: rulingLines(template, dpi),
  };
}
