import { PAPER_RULINGS } from '@/types/records';
import type { PaperTemplateRecord } from '@/types/records';
import type { ConnectionProvider, RecordRepository } from './createRepository';
import { createRepository } from './createRepository';
import {
  asRecordObject,
  requireEnvelope,
  requireNumber,
  requireOneOf,
  requireString,
} from './validation';

export function validatePaperTemplate(value: unknown): PaperTemplateRecord {
  const envelope = requireEnvelope(value, 'paper template');
  const record = asRecordObject(value, 'paper template');
  return {
    id: envelope.id,
    updatedAt: envelope.updatedAt,
    name: requireString(record, 'name', 'paper template'),
    widthMm: requireNumber(record, 'widthMm', 'paper template', 1),
    heightMm: requireNumber(record, 'heightMm', 'paper template', 1),
    ruling: requireOneOf(record, 'ruling', 'paper template', PAPER_RULINGS),
    marginMm: requireNumber(record, 'marginMm', 'paper template', 0),
    ruleSpacingMm: requireNumber(record, 'ruleSpacingMm', 'paper template', 0.1),
  };
}

export function createTemplateRepository(
  getConnection: ConnectionProvider,
): RecordRepository<PaperTemplateRecord> {
  return createRepository({
    storeName: 'templates',
    getConnection,
    validate: validatePaperTemplate,
  });
}
