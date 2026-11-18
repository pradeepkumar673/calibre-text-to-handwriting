import { ALIGNMENTS, DOCUMENT_SCHEMA_VERSION, ELEMENT_KINDS, SHAPE_KINDS } from '@/types/document';
import type {
  Box,
  DocumentElement,
  DocumentModel,
  DocumentPage,
  DocumentSettings,
  StrokePoint,
  WordBoundary,
} from '@/types/document';

// Raised when text is not a document this app can read.
export class DocumentFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentFormatError';
  }
}

// Raised for a schemaVersion this build does not understand.
export class UnsupportedSchemaVersionError extends DocumentFormatError {
  readonly found: unknown;

  constructor(found: unknown) {
    super(
      found === undefined
        ? `Document has no schemaVersion field. This version of CalligrapheWrite reads schemaVersion ${DOCUMENT_SCHEMA_VERSION}.`
        : `Unsupported document schemaVersion ${JSON.stringify(found)}. This version of CalligrapheWrite reads schemaVersion ${DOCUMENT_SCHEMA_VERSION}.`,
    );
    this.name = 'UnsupportedSchemaVersionError';
    this.found = found;
  }
}

type Loose = Record<string, unknown>;

function errorAt(path: string, expected: string): DocumentFormatError {
  return new DocumentFormatError(`Invalid document at ${path}: expected ${expected}.`);
}

function asRecord(value: unknown, path: string): Loose {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw errorAt(path, 'an object');
  }
  return value as Loose;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw errorAt(path, 'an array');
  }
  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw errorAt(path, 'a string');
  }
  return value;
}

function asNonEmptyString(value: unknown, path: string): string {
  const text = asString(value, path);
  if (text.length === 0) {
    throw errorAt(path, 'a non-empty string');
  }
  return text;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw errorAt(path, 'a finite number');
  }
  return value;
}

function asNumberAtLeast(value: unknown, path: string, min: number): number {
  const number = asNumber(value, path);
  if (number < min) {
    throw errorAt(path, `a number of at least ${min}`);
  }
  return number;
}

function asNumberInRange(value: unknown, path: string, min: number, max: number): number {
  const number = asNumber(value, path);
  if (number < min || number > max) {
    throw errorAt(path, `a number from ${min} to ${max}`);
  }
  return number;
}

function asInteger(value: unknown, path: string, min: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min) {
    throw errorAt(path, `an integer of at least ${min}`);
  }
  return value;
}

function asEnum<T extends string>(value: unknown, options: readonly T[], path: string): T {
  if (typeof value !== 'string' || !(options as readonly string[]).includes(value)) {
    throw errorAt(path, `one of ${options.join(', ')}`);
  }
  return value as T;
}

// Reads an id and checks it has not appeared before anywhere in the document.
function asId(value: unknown, path: string, seen: Set<string>): string {
  const id = asNonEmptyString(value, path);
  if (seen.has(id)) {
    throw new DocumentFormatError(`Invalid document at ${path}: duplicate id "${id}".`);
  }
  seen.add(id);
  return id;
}

function asIsoDate(value: unknown, path: string): string {
  const text = asNonEmptyString(value, path);
  if (Number.isNaN(Date.parse(text))) {
    throw errorAt(path, 'an ISO 8601 date string');
  }
  return text;
}

function asSeed(value: unknown, path: string): number {
  const seed = asInteger(value, path, 0);
  if (seed > 0xffffffff) {
    throw errorAt(path, 'an unsigned 32-bit integer');
  }
  return seed;
}

function asBox(value: unknown, path: string): Box {
  const record = asRecord(value, path);
  return {
    x: asNumber(record.x, `${path}.x`),
    y: asNumber(record.y, `${path}.y`),
    width: asNumberAtLeast(record.width, `${path}.width`, 0),
    height: asNumberAtLeast(record.height, `${path}.height`, 0),
  };
}

function asPoint(value: unknown, path: string): StrokePoint {
  const record = asRecord(value, path);
  return {
    x: asNumber(record.x, `${path}.x`),
    y: asNumber(record.y, `${path}.y`),
    pressure: asNumberInRange(record.pressure, `${path}.pressure`, 0, 1),
  };
}

// Checks each boundary lies inside the text and boundaries are in order without overlap.
function asWordBoundaries(value: unknown, textLength: number, path: string): WordBoundary[] {
  const items = asArray(value, path);
  const boundaries: WordBoundary[] = [];
  let previousEnd = 0;
  for (let index = 0; index < items.length; index += 1) {
    const itemPath = `${path}[${index}]`;
    const record = asRecord(items[index], itemPath);
    const start = asInteger(record.start, `${itemPath}.start`, 0);
    const end = asInteger(record.end, `${itemPath}.end`, 0);
    if (end <= start || end > textLength) {
      throw errorAt(
        itemPath,
        `a word boundary with start < end within the text length (${textLength})`,
      );
    }
    if (start < previousEnd) {
      throw errorAt(itemPath, 'word boundaries in order without overlap');
    }
    previousEnd = end;
    boundaries.push({ start, end });
  }
  return boundaries;
}

// Checks the grid has exactly the stated number of rows and columns.
function asCells(value: unknown, rows: number, columns: number, path: string): string[][] {
  const rowItems = asArray(value, path);
  if (rowItems.length !== rows) {
    throw errorAt(path, `${rows} rows`);
  }
  return rowItems.map((row, rowIndex) => {
    const rowPath = `${path}[${rowIndex}]`;
    const cells = asArray(row, rowPath);
    if (cells.length !== columns) {
      throw errorAt(rowPath, `${columns} cells`);
    }
    return cells.map((cell, columnIndex) => asString(cell, `${rowPath}[${columnIndex}]`));
  });
}

function parseSettings(value: unknown, path: string): DocumentSettings {
  const record = asRecord(value, path);
  return {
    defaultInkColor: asNonEmptyString(record.defaultInkColor, `${path}.defaultInkColor`),
    defaultPenId: asNonEmptyString(record.defaultPenId, `${path}.defaultPenId`),
    handwritingSize: asNumberAtLeast(record.handwritingSize, `${path}.handwritingSize`, 0),
    lineSpacing: asNumberAtLeast(record.lineSpacing, `${path}.lineSpacing`, 0),
    wordSpacing: asNumberAtLeast(record.wordSpacing, `${path}.wordSpacing`, 0),
    alignment: asEnum(record.alignment, ALIGNMENTS, `${path}.alignment`),
    imperfectionLevel: asNumberInRange(record.imperfectionLevel, `${path}.imperfectionLevel`, 0, 1),
  };
}

function parseElement(value: unknown, path: string, seen: Set<string>): DocumentElement {
  const record = asRecord(value, path);
  const kind = asEnum(record.kind, ELEMENT_KINDS, `${path}.kind`);
  const id = asId(record.id, `${path}.id`, seen);
  const box = asBox(record.box, `${path}.box`);

  switch (kind) {
    case 'textRun': {
      const text = asString(record.text, `${path}.text`);
      return {
        kind: 'textRun',
        id,
        box,
        text,
        wordBoundaries: asWordBoundaries(
          record.wordBoundaries,
          text.length,
          `${path}.wordBoundaries`,
        ),
        styleId: asNonEmptyString(record.styleId, `${path}.styleId`),
        penId: asNonEmptyString(record.penId, `${path}.penId`),
        inkColor: asNonEmptyString(record.inkColor, `${path}.inkColor`),
        seed: asSeed(record.seed, `${path}.seed`),
      };
    }
    case 'stroke':
      return {
        kind: 'stroke',
        id,
        box,
        points: asArray(record.points, `${path}.points`).map((point, index) =>
          asPoint(point, `${path}.points[${index}]`),
        ),
        penId: asNonEmptyString(record.penId, `${path}.penId`),
        inkColor: asNonEmptyString(record.inkColor, `${path}.inkColor`),
        width: asNumberAtLeast(record.width, `${path}.width`, 0),
      };
    case 'shape':
      return {
        kind: 'shape',
        id,
        box,
        shape: asEnum(record.shape, SHAPE_KINDS, `${path}.shape`),
        strokeColor: asNonEmptyString(record.strokeColor, `${path}.strokeColor`),
        strokeWidth: asNumberAtLeast(record.strokeWidth, `${path}.strokeWidth`, 0),
      };
    case 'image':
      return {
        kind: 'image',
        id,
        box,
        assetId: asNonEmptyString(record.assetId, `${path}.assetId`),
      };
    case 'equation':
      return {
        kind: 'equation',
        id,
        box,
        latex: asString(record.latex, `${path}.latex`),
        inkColor: asNonEmptyString(record.inkColor, `${path}.inkColor`),
      };
    case 'table': {
      const rows = asInteger(record.rows, `${path}.rows`, 0);
      const columns = asInteger(record.columns, `${path}.columns`, 0);
      return {
        kind: 'table',
        id,
        box,
        rows,
        columns,
        cells: asCells(record.cells, rows, columns, `${path}.cells`),
      };
    }
    case 'annotation':
      return {
        kind: 'annotation',
        id,
        box,
        text: asString(record.text, `${path}.text`),
        targetElementId:
          record.targetElementId === null
            ? null
            : asNonEmptyString(record.targetElementId, `${path}.targetElementId`),
        color: asNonEmptyString(record.color, `${path}.color`),
      };
    default:
      throw errorAt(path, 'a known element kind');
  }
}

function parsePage(
  value: unknown,
  expectedIndex: number,
  path: string,
  seen: Set<string>,
): DocumentPage {
  const record = asRecord(value, path);
  const index = asInteger(record.index, `${path}.index`, 0);
  if (index !== expectedIndex) {
    throw errorAt(`${path}.index`, `index ${expectedIndex} to match the page's position`);
  }
  const id = asId(record.id, `${path}.id`, seen);
  const elements = asArray(record.elements, `${path}.elements`).map((element, elementIndex) =>
    parseElement(element, `${path}.elements[${elementIndex}]`, seen),
  );
  return { id, index, elements };
}

// Converts a document to JSON text. The schemaVersion field is always written.
export function serializeDocument(document: DocumentModel): string {
  return JSON.stringify({ ...document, schemaVersion: DOCUMENT_SCHEMA_VERSION }, null, 2);
}

// Reads JSON text back into a document. Rejects unknown schema versions and any structural error,
// with a message that names the failing path.
export function parseDocument(text: string): DocumentModel {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new DocumentFormatError(`Document is not valid JSON: ${reason}`);
  }

  const root = asRecord(raw, 'document');
  if (!('schemaVersion' in root)) {
    throw new UnsupportedSchemaVersionError(undefined);
  }
  if (root.schemaVersion !== DOCUMENT_SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(root.schemaVersion);
  }

  const seen = new Set<string>();
  const id = asId(root.id, 'document.id', seen);
  const pages = asArray(root.pages, 'document.pages').map((page, index) =>
    parsePage(page, index, `document.pages[${index}]`, seen),
  );

  return {
    schemaVersion: DOCUMENT_SCHEMA_VERSION,
    id,
    title: asString(root.title, 'document.title'),
    createdAt: asIsoDate(root.createdAt, 'document.createdAt'),
    updatedAt: asIsoDate(root.updatedAt, 'document.updatedAt'),
    paperTemplateId: asNonEmptyString(root.paperTemplateId, 'document.paperTemplateId'),
    styleId: asNonEmptyString(root.styleId, 'document.styleId'),
    settings: parseSettings(root.settings, 'document.settings'),
    pages,
  };
}
