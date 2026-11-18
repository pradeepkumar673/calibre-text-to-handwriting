// Geometry types for paper templates. Plain data only, with no canvas or DOM references.

export const PAPER_RULING_KINDS = ['ruled', 'unruled', 'grid', 'margin'] as const;
export type PaperRulingKind = (typeof PAPER_RULING_KINDS)[number];

// Millimetres measured from the top-left corner of the sheet.
export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface RulingStyle {
  kind: PaperRulingKind;
  // Distance between horizontal rules, in millimetres.
  lineSpacingMm: number;
  // Any CSS colour string. The engine does not interpret it.
  color: string;
  // Stroke width in millimetres.
  strokeWidthMm: number;
  // Distance between vertical grid lines, in millimetres. Used only by 'grid'.
  gridSpacingMm?: number;
  // Position of the vertical margin line from the left edge, in millimetres. Used only by 'margin'.
  marginLineMm?: number;
}

export interface PaperTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  margins: Margins;
  ruling: RulingStyle;
}

// A line segment in pixel coordinates, measured from the top-left of the sheet.
export interface PixelLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidthPx: number;
}

// The writable area in pixels, after margins are removed.
export interface WritableArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaperLayout {
  widthPx: number;
  heightPx: number;
  dpi: number;
  writableArea: WritableArea;
  lines: PixelLine[];
}
