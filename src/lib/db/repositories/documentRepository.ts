import { parseDocument } from '@/engine/model/serialize';
import type { DocumentModel } from '@/types/document';
import type { ConnectionProvider, RecordRepository } from './createRepository';
import { createRepository } from './createRepository';
import { requireEnvelope } from './validation';

// Full structural validation is done by the document parser from Prompt 8.
// Any problem it finds becomes an 'invalid' StorageError.
export function validateDocumentRecord(value: unknown): DocumentModel {
  requireEnvelope(value, 'document');
  return parseDocument(JSON.stringify(value));
}

export function createDocumentRepository(
  getConnection: ConnectionProvider,
): RecordRepository<DocumentModel> {
  return createRepository({
    storeName: 'documents',
    getConnection,
    validate: validateDocumentRecord,
  });
}
