import type { HandwritingProfileRecord } from '@/types/records';
import type { ConnectionProvider, RecordRepository } from './createRepository';
import { createRepository } from './createRepository';
import { asRecordObject, invalidRecord, requireEnvelope, requireString } from './validation';

export function validateHandwritingProfile(value: unknown): HandwritingProfileRecord {
  const envelope = requireEnvelope(value, 'handwriting profile');
  const record = asRecordObject(value, 'handwriting profile');
  const sampleAssetIds: unknown = record.sampleAssetIds;
  if (
    !Array.isArray(sampleAssetIds) ||
    !sampleAssetIds.every((id) => typeof id === 'string' && id.length > 0)
  ) {
    throw invalidRecord(
      'handwriting profile.sampleAssetIds must be an array of non-empty strings.',
    );
  }
  return {
    id: envelope.id,
    updatedAt: envelope.updatedAt,
    name: requireString(record, 'name', 'handwriting profile'),
    sampleAssetIds: sampleAssetIds as string[],
  };
}

export function createProfileRepository(
  getConnection: ConnectionProvider,
): RecordRepository<HandwritingProfileRecord> {
  return createRepository({
    storeName: 'profiles',
    getConnection,
    validate: validateHandwritingProfile,
  });
}
