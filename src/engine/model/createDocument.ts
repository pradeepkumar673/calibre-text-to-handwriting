import { DOCUMENT_SCHEMA_VERSION } from '@/types/document';
import type {
  Box,
  DocumentModel,
  DocumentSettings,
  EntityId,
  TextRunElement,
  WordBoundary,
} from '@/types/document';

// Produces unique ids. Injected so tests can supply fixed ids.
export type IdFactory = () => EntityId;

function fillWithRandomBytes(bytes: Uint8Array): void {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
    return;
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
}

// Builds an id factory from a function that fills a byte buffer.
// The default fills with cryptographic randomness, which works on plain-HTTP LAN addresses.
export function createIdFactory(
  fill: (bytes: Uint8Array) => void = fillWithRandomBytes,
): IdFactory {
  return () => {
    const bytes = new Uint8Array(12);
    fill(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };
}

export const defaultIdFactory: IdFactory = createIdFactory();

// FNV-1a hash. The same id always gives the same seed, so rendering is repeatable.
export function seedFromId(id: EntityId): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

// Word boundaries are the maximal runs of non-whitespace characters.
export function computeWordBoundaries(text: string): WordBoundary[] {
  const boundaries: WordBoundary[] = [];
  let start = -1;
  // The extra iteration at text.length closes a word that ends the text.
  for (let i = 0; i <= text.length; i += 1) {
    const character = i < text.length ? text.charAt(i) : ' ';
    const isSpace = /\s/.test(character);
    if (!isSpace && start < 0) {
      start = i;
    } else if (isSpace && start >= 0) {
      boundaries.push({ start, end: i });
      start = -1;
    }
  }
  return boundaries;
}

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  defaultInkColor: '#1b2a4a',
  defaultPenId: 'default',
  handwritingSize: 10,
  lineSpacing: 1.4,
  wordSpacing: 1,
  alignment: 'left',
  imperfectionLevel: 0.2,
};

export interface TextRunParams {
  box: Box;
  text: string;
  styleId: string;
  penId: string;
  inkColor: string;
  // Optional. When omitted, the seed is derived from the element id.
  seed?: number;
}

// Creates a text run with word boundaries computed from its text.
export function createTextRun(
  params: TextRunParams,
  nextId: IdFactory = defaultIdFactory,
): TextRunElement {
  const id = nextId();
  return {
    id,
    kind: 'textRun',
    box: params.box,
    text: params.text,
    wordBoundaries: computeWordBoundaries(params.text),
    styleId: params.styleId,
    penId: params.penId,
    inkColor: params.inkColor,
    seed: params.seed ?? seedFromId(id),
  };
}

export interface CreateDocumentParams {
  title: string;
  paperTemplateId: EntityId;
  styleId: string;
  settings?: DocumentSettings;
  // ISO 8601 timestamp. Defaults to the current time.
  now?: string;
}

// Creates an empty document with one blank first page.
export function createDocument(
  params: CreateDocumentParams,
  nextId: IdFactory = defaultIdFactory,
): DocumentModel {
  const timestamp = params.now ?? new Date().toISOString();
  return {
    schemaVersion: DOCUMENT_SCHEMA_VERSION,
    id: nextId(),
    title: params.title,
    createdAt: timestamp,
    updatedAt: timestamp,
    paperTemplateId: params.paperTemplateId,
    styleId: params.styleId,
    settings: { ...(params.settings ?? DEFAULT_DOCUMENT_SETTINGS) },
    pages: [{ id: nextId(), index: 0, elements: [] }],
  };
}
