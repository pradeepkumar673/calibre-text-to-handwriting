import { PaperGeometryError } from './errors';
import type { PaperTemplate, WritableArea } from './types';

export const DEFAULT_DPI = 150;
export const MM_PER_INCH = 25.4;

function requirePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new PaperGeometryError(`${label} must be a positive number, got ${value}.`);
  }
}

function requireNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new PaperGeometryError(`${label} must be zero or more, got ${value}.`);
  }
}

export function requireDpi(dpi: number): void {
  requirePositive(dpi, 'dpi');
}

// Converts millimetres to whole pixels at the given DPI.
export function mmToPx(mm: number, dpi: number = DEFAULT_DPI): number {
  requireNonNegative(mm, 'mm');
  requireDpi(dpi);
  return Math.round((mm / MM_PER_INCH) * dpi);
}

// Converts a length in millimetres to pixels without rounding. Used for line positions,
// so that evenly spaced rules stay evenly spaced.
export function mmToPxExact(mm: number, dpi: number = DEFAULT_DPI): number {
  requireNonNegative(mm, 'mm');
  requireDpi(dpi);
  return (mm / MM_PER_INCH) * dpi;
}

// Checks that margins fit on the sheet and leave a non-empty writable area.
export function validateTemplate(template: PaperTemplate): void {
  requirePositive(template.widthMm, 'widthMm');
  requirePositive(template.heightMm, 'heightMm');
  const { top, right, bottom, left } = template.margins;
  requireNonNegative(top, 'margins.top');
  requireNonNegative(right, 'margins.right');
  requireNonNegative(bottom, 'margins.bottom');
  requireNonNegative(left, 'margins.left');
  if (left + right >= template.widthMm) {
    throw new PaperGeometryError('Left and right margins leave no writable width.');
  }
  if (top + bottom >= template.heightMm) {
    throw new PaperGeometryError('Top and bottom margins leave no writable height.');
  }
}

// Writable area in millimetres. Margins are removed from each side.
export function writableAreaMm(template: PaperTemplate): WritableArea {
  validateTemplate(template);
  const { top, right, bottom, left } = template.margins;
  return {
    x: left,
    y: top,
    width: template.widthMm - left - right,
    height: template.heightMm - top - bottom,
  };
}

// Writable area in pixels, rounded so that its edges land on whole pixels.
export function writableAreaPx(template: PaperTemplate, dpi: number = DEFAULT_DPI): WritableArea {
  const mm = writableAreaMm(template);
  const x = Math.round(mmToPxExact(mm.x, dpi));
  const y = Math.round(mmToPxExact(mm.y, dpi));
  const right = Math.round(mmToPxExact(mm.x + mm.width, dpi));
  const bottom = Math.round(mmToPxExact(mm.y + mm.height, dpi));
  return { x, y, width: right - x, height: bottom - y };
}

// Sheet size in pixels at the given DPI.
export function sheetSizePx(
  template: PaperTemplate,
  dpi: number = DEFAULT_DPI,
): { widthPx: number; heightPx: number } {
  validateTemplate(template);
  return {
    widthPx: mmToPx(template.widthMm, dpi),
    heightPx: mmToPx(template.heightMm, dpi),
  };
}
