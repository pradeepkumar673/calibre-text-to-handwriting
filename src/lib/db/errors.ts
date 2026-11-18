import { DocumentFormatError } from '@/engine/model/serialize';

export const STORAGE_ERROR_CODES = [
  'unavailable',
  'quota',
  'version',
  'upgrade',
  'aborted',
  'invalid',
  'unknown',
] as const;
export type StorageErrorCode = (typeof STORAGE_ERROR_CODES)[number];

const DEFAULT_MESSAGES: Record<StorageErrorCode, string> = {
  unavailable: 'Browser storage (IndexedDB) is not available in this browser.',
  quota: 'Browser storage is full. Delete old documents or assets to free space.',
  version:
    'The saved data was written by a newer version of CalligrapheWrite. Reload the app or update it.',
  upgrade: 'Updating the local database failed. No data was changed.',
  aborted: 'The storage operation was interrupted. Try again.',
  invalid: 'The data could not be saved or read because it is not in the expected format.',
  unknown: 'An unexpected storage error occurred.',
};

// Typed error for every failure in the persistence layer. Callers branch on `code`.
export class StorageError extends Error {
  readonly code: StorageErrorCode;
  readonly operation: string;
  readonly cause: unknown;

  constructor(code: StorageErrorCode, operation: string, message?: string, cause?: unknown) {
    super(message ?? DEFAULT_MESSAGES[code]);
    this.name = 'StorageError';
    this.code = code;
    this.operation = operation;
    this.cause = cause;
  }
}

// Converts anything thrown by IndexedDB or validation into a StorageError.
export function toStorageError(error: unknown, operation: string): StorageError {
  if (error instanceof StorageError) {
    return error;
  }
  if (error instanceof DocumentFormatError) {
    return new StorageError('invalid', operation, error.message, error);
  }
  const errorName =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name: unknown }).name)
      : error instanceof Error
        ? error.name
        : undefined;

  switch (errorName) {
    case 'QuotaExceededError':
      return new StorageError('quota', operation, undefined, error);
    case 'VersionError':
      return new StorageError('version', operation, undefined, error);
    case 'AbortError':
      return new StorageError('aborted', operation, undefined, error);
    default:
      break;
  }
  return new StorageError('unknown', operation, undefined, error);
}
