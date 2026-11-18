import type { DocumentModel } from '@/types/document';
import type { AssetRecord, HandwritingProfileRecord, PaperTemplateRecord } from '@/types/records';
import type { DatabaseHandle } from '../database';
import { createAssetRepository } from './assetRepository';
import { createDocumentRepository } from './documentRepository';
import { createProfileRepository } from './profileRepository';
import { createTemplateRepository } from './templateRepository';

export type { RecordRepository, UpdatedAtQuery } from './createRepository';

export interface AppRepositories {
  documents: ReturnType<typeof createDocumentRepository>;
  templates: ReturnType<typeof createTemplateRepository>;
  profiles: ReturnType<typeof createProfileRepository>;
  assets: ReturnType<typeof createAssetRepository>;
}

// Builds all four repositories on one shared database handle.
export function createRepositories(handle: DatabaseHandle): AppRepositories {
  const getConnection = () => handle.getConnection();
  return {
    documents: createDocumentRepository(getConnection),
    templates: createTemplateRepository(getConnection),
    profiles: createProfileRepository(getConnection),
    assets: createAssetRepository(getConnection),
  };
}

// Re-exported so callers can name the record types without importing the modules directly.
export type { DocumentModel, PaperTemplateRecord, HandwritingProfileRecord, AssetRecord };
