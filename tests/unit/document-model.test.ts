import { describe, expect, it } from 'vitest';
import {
  computeWordBoundaries,
  createDocument,
  createIdFactory,
  createTextRun,
  seedFromId,
} from '@/engine/model/createDocument';
import {
  DocumentFormatError,
  parseDocument,
  serializeDocument,
  UnsupportedSchemaVersionError,
} from '@/engine/model/serialize';
import type { DocumentModel } from '@/types/document';

// Writes a counter into each id buffer, so every generated id in a test is different.
function sequentialFill(): (bytes: Uint8Array) => void {
  let counter = 0;
  return (bytes) => {
    counter += 1;
    bytes[0] = counter & 0xff;
    bytes[1] = (counter >> 8) & 0xff;
    bytes[2] = (counter >> 16) & 0xff;
  };
}

// A document with one element of every kind, so the round trip covers the whole union.
function buildSampleDocument(): DocumentModel {
  const nextId = createIdFactory(sequentialFill());
  const doc = createDocument(
    {
      title: 'Sample',
      paperTemplateId: 'a4-ruled',
      styleId: 'style-01',
      now: '2026-01-01T00:00:00.000Z',
    },
    nextId,
  );
  const page = doc.pages[0];
  if (!page) {
    throw new Error('Expected a first page');
  }

  const box = { x: 10, y: 20, width: 150, height: 10 };
  const run = createTextRun(
    {
      box,
      text: 'Hello  handwritten world',
      styleId: 'style-01',
      penId: 'pen-01',
      inkColor: '#1b2a4a',
    },
    nextId,
  );

  page.elements.push(
    run,
    {
      id: nextId(),
      kind: 'stroke',
      box,
      points: [
        { x: 0, y: 0, pressure: 0.4 },
        { x: 5, y: 1, pressure: 0.8 },
      ],
      penId: 'pen-01',
      inkColor: '#1b2a4a',
      width: 0.3,
    },
    {
      id: nextId(),
      kind: 'shape',
      box,
      shape: 'rectangle',
      strokeColor: '#888888',
      strokeWidth: 0.2,
    },
    { id: nextId(), kind: 'image', box, assetId: 'asset-1' },
    { id: nextId(), kind: 'equation', box, latex: 'E = mc^2', inkColor: '#1b2a4a' },
    {
      id: nextId(),
      kind: 'table',
      box,
      rows: 2,
      columns: 2,
      cells: [
        ['a', 'b'],
        ['c', 'd'],
      ],
    },
    {
      id: nextId(),
      kind: 'annotation',
      box,
      text: 'Check this',
      targetElementId: run.id,
      color: '#cc0000',
    },
  );
  return doc;
}

function collectIds(doc: DocumentModel): string[] {
  return [
    doc.id,
    ...doc.pages.flatMap((page) => [page.id, ...page.elements.map((element) => element.id)]),
  ];
}

// Loose view of the serialised JSON, used to damage a document on purpose.
interface RawDocument {
  pages: Array<{ elements: Array<Record<string, unknown>> }>;
}

function mutateSerialized(doc: DocumentModel, mutate: (raw: RawDocument) => void): string {
  const raw = JSON.parse(serializeDocument(doc)) as RawDocument;
  mutate(raw);
  return JSON.stringify(raw);
}

function elementAt(raw: RawDocument, index: number): Record<string, unknown> {
  const element = raw.pages[0]?.elements[index];
  if (!element) {
    throw new Error(`No element at index ${index}`);
  }
  return element;
}

describe('createDocument', () => {
  it('creates one empty first page with schemaVersion 1', () => {
    const doc = createDocument({
      title: 'Notes',
      paperTemplateId: 'a4-ruled',
      styleId: 'style-01',
      now: '2026-01-01T00:00:00.000Z',
    });
    expect(doc.schemaVersion).toBe(1);
    expect(doc.pages).toHaveLength(1);
    expect(doc.pages[0]?.index).toBe(0);
    expect(doc.pages[0]?.elements).toEqual([]);
  });

  it('gives every entity a distinct, non-empty id', () => {
    const ids = collectIds(buildSampleDocument());
    expect(ids.every((id) => id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('word boundaries and seeds', () => {
  it('splits on any whitespace run and ignores leading and trailing spaces', () => {
    expect(computeWordBoundaries('  The quick\tfox ')).toEqual([
      { start: 2, end: 5 },
      { start: 6, end: 11 },
      { start: 12, end: 15 },
    ]);
  });

  it('returns no boundaries for empty or whitespace-only text', () => {
    expect(computeWordBoundaries('')).toEqual([]);
    expect(computeWordBoundaries('   ')).toEqual([]);
  });

  it('derives a deterministic seed from the id', () => {
    expect(seedFromId('abc')).toBe(seedFromId('abc'));
    expect(seedFromId('abc')).not.toBe(seedFromId('abd'));
  });

  it('gives a text run a seed derived from its own id by default', () => {
    const run = createTextRun(
      {
        box: { x: 0, y: 0, width: 10, height: 10 },
        text: 'Hi',
        styleId: 'style-01',
        penId: 'pen-01',
        inkColor: '#000000',
      },
      createIdFactory(sequentialFill()),
    );
    expect(run.seed).toBe(seedFromId(run.id));
    expect(run.wordBoundaries).toEqual([{ start: 0, end: 2 }]);
  });
});

describe('serializeDocument and parseDocument', () => {
  it('round-trips a document to an equal object', () => {
    const doc = buildSampleDocument();
    expect(parseDocument(serializeDocument(doc))).toEqual(doc);
  });

  it('writes schemaVersion into the JSON', () => {
    const json = JSON.parse(serializeDocument(buildSampleDocument())) as { schemaVersion: unknown };
    expect(json.schemaVersion).toBe(1);
  });

  it('rejects an unknown schemaVersion with a clear error', () => {
    const raw = JSON.parse(serializeDocument(buildSampleDocument())) as Record<string, unknown>;
    raw.schemaVersion = 2;
    const json = JSON.stringify(raw);
    expect(() => parseDocument(json)).toThrow(UnsupportedSchemaVersionError);
    expect(() => parseDocument(json)).toThrow(/schemaVersion 2/);
  });

  it('rejects a document with no schemaVersion', () => {
    const raw = JSON.parse(serializeDocument(buildSampleDocument())) as Record<string, unknown>;
    delete raw.schemaVersion;
    expect(() => parseDocument(JSON.stringify(raw))).toThrow(/no schemaVersion/);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseDocument('{not json')).toThrow(DocumentFormatError);
  });

  it('rejects duplicate ids', () => {
    const json = mutateSerialized(buildSampleDocument(), (raw) => {
      elementAt(raw, 1).id = elementAt(raw, 0).id;
    });
    expect(() => parseDocument(json)).toThrow(/duplicate id/);
  });

  it('rejects word boundaries that fall outside the text', () => {
    const json = mutateSerialized(buildSampleDocument(), (raw) => {
      elementAt(raw, 0).wordBoundaries = [{ start: 0, end: 999 }];
    });
    expect(() => parseDocument(json)).toThrow(/wordBoundaries/);
  });

  it('rejects a table whose cells do not match its size', () => {
    const json = mutateSerialized(buildSampleDocument(), (raw) => {
      elementAt(raw, 5).rows = 3;
    });
    expect(() => parseDocument(json)).toThrow(/cells/);
  });

  it('rejects an unknown element kind', () => {
    const json = mutateSerialized(buildSampleDocument(), (raw) => {
      elementAt(raw, 0).kind = 'video';
    });
    expect(() => parseDocument(json)).toThrow(/kind/);
  });
});
