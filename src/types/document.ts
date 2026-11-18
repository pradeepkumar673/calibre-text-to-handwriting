// Document model: plain data describing an editable handwritten document.
// Nothing in this file depends on rendering. Every entity has a stable id.
// Elements form a discriminated union keyed by "kind".

// Version of the serialised document format. Bump it when the shape changes,
// and add a migration before accepting older files.
export const DOCUMENT_SCHEMA_VERSION = 1;
export type DocumentSchemaVersion = typeof DOCUMENT_SCHEMA_VERSION;

export type EntityId = string;

export const ALIGNMENTS = ['left', 'center', 'right', 'justify'] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

export const SHAPE_KINDS = ['rectangle', 'ellipse', 'line'] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

export const ELEMENT_KINDS = [
  'textRun',
  'stroke',
  'shape',
  'image',
  'equation',
  'table',
  'annotation',
] as const;
export type ElementKind = (typeof ELEMENT_KINDS)[number];

// Position and size in millimetres, measured from the top-left corner of the page.
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

// One sampled point of a pen stroke. Pressure runs from 0 to 1.
export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

// Half-open range [start, end) of indices into a text run's characters.
export interface WordBoundary {
  start: number;
  end: number;
}

export interface DocumentSettings {
  defaultInkColor: string;
  defaultPenId: string;
  // Nominal handwriting size in points.
  handwritingSize: number;
  // Multipliers applied to the handwriting metrics.
  lineSpacing: number;
  wordSpacing: number;
  alignment: Alignment;
  // 0 means no natural imperfections, 1 means the most.
  imperfectionLevel: number;
}

interface ElementBase {
  id: EntityId;
  box: Box;
}

// A run of handwritten characters. The seed makes rendering deterministic:
// the same text, style, pen and seed always produce the same glyph variations.
export interface TextRunElement extends ElementBase {
  kind: 'textRun';
  text: string;
  wordBoundaries: WordBoundary[];
  styleId: string;
  penId: string;
  inkColor: string;
  seed: number;
}

export interface StrokeElement extends ElementBase {
  kind: 'stroke';
  points: StrokePoint[];
  penId: string;
  inkColor: string;
  width: number;
}

export interface ShapeElement extends ElementBase {
  kind: 'shape';
  shape: ShapeKind;
  strokeColor: string;
  strokeWidth: number;
}

// Refers to image bytes stored elsewhere, so the document stays small and serialisable.
export interface ImageElement extends ElementBase {
  kind: 'image';
  assetId: EntityId;
}

export interface EquationElement extends ElementBase {
  kind: 'equation';
  latex: string;
  inkColor: string;
}

// A grid of text cells. cells[row][column] holds the cell text.
export interface TableElement extends ElementBase {
  kind: 'table';
  rows: number;
  columns: number;
  cells: string[][];
}

export interface AnnotationElement extends ElementBase {
  kind: 'annotation';
  text: string;
  targetElementId: EntityId | null;
  color: string;
}

export type DocumentElement =
  | TextRunElement
  | StrokeElement
  | ShapeElement
  | ImageElement
  | EquationElement
  | TableElement
  | AnnotationElement;

export interface DocumentPage {
  id: EntityId;
  index: number;
  elements: DocumentElement[];
}

export interface DocumentModel {
  schemaVersion: DocumentSchemaVersion;
  id: EntityId;
  title: string;
  createdAt: string;
  updatedAt: string;
  paperTemplateId: EntityId;
  styleId: string;
  settings: DocumentSettings;
  pages: DocumentPage[];
}
