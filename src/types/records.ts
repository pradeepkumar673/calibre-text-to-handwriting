// Records stored in IndexedDB. Every record has a stable id and a canonical ISO 8601 updatedAt,
// which the updatedAt index uses for queries.

export interface StoredRecord {
  id: string;
  updatedAt: string;
}

export const PAPER_RULINGS = ['ruled', 'unruled', 'grid', 'margin'] as const;
export type PaperRuling = (typeof PAPER_RULINGS)[number];

export interface PaperTemplateRecord extends StoredRecord {
  name: string;
  widthMm: number;
  heightMm: number;
  ruling: PaperRuling;
  marginMm: number;
  ruleSpacingMm: number;
}

export interface HandwritingProfileRecord extends StoredRecord {
  name: string;
  // Ids of asset records holding the scanned sample sheet images.
  sampleAssetIds: string[];
}

// Binary data is stored as a Blob, never as a base64 string.
export interface AssetRecord extends StoredRecord {
  mimeType: string;
  byteLength: number;
  blob: Blob;
}
