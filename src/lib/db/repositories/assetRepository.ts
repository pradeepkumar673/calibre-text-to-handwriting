import type { AssetRecord } from '@/types/records';
import type { ConnectionProvider, RecordRepository } from './createRepository';
import { createRepository } from './createRepository';
import { asRecordObject, invalidRecord, requireEnvelope, requireNumber } from './validation';

// Duck-typed rather than instanceof Blob, so a Blob from another realm is still accepted.
function isBlobLike(value: unknown): value is Blob {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Blob).size === 'number' &&
    typeof (value as Blob).type === 'string'
  );
}

export function validateAsset(value: unknown): AssetRecord {
  const envelope = requireEnvelope(value, 'asset');
  const record = asRecordObject(value, 'asset');
  if (typeof record.mimeType !== 'string') {
    throw invalidRecord('asset.mimeType must be a string.');
  }
  const blob: unknown = record.blob;
  if (!isBlobLike(blob)) {
    throw invalidRecord('asset.blob must be a Blob.');
  }
  const byteLength = requireNumber(record, 'byteLength', 'asset', 0);
  if (!Number.isInteger(byteLength) || blob.size !== byteLength) {
    throw invalidRecord('asset.byteLength must equal the size of the blob.');
  }
  return {
    id: envelope.id,
    updatedAt: envelope.updatedAt,
    mimeType: record.mimeType,
    byteLength,
    blob,
  };
}

export function createAssetRepository(
  getConnection: ConnectionProvider,
): RecordRepository<AssetRecord> {
  return createRepository({
    storeName: 'assets',
    getConnection,
    validate: validateAsset,
  });
}
