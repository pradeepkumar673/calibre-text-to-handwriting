import { StorageError } from '../errors';

// Every validation failure is reported as an 'invalid' StorageError.
export function invalidRecord(message: string): StorageError {
  return new StorageError('invalid', 'validate', message);
}

// Accepts only the exact output of Date.prototype.toISOString, so string comparison sorts by time.
function isCanonicalIso(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

export function requireIsoTimestamp(value: unknown, label: string): string {
  if (!isCanonicalIso(value)) {
    throw invalidRecord(
      `${label} must be an ISO 8601 UTC timestamp such as 2026-01-01T00:00:00.000Z.`,
    );
  }
  return value;
}

export function asRecordObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidRecord(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

// Checks the fields every record shares: a non-empty id and a canonical updatedAt.
export function requireEnvelope(value: unknown, label: string): { id: string; updatedAt: string } {
  const record = asRecordObject(value, label);
  if (typeof record.id !== 'string' || record.id.length === 0) {
    throw invalidRecord(`${label} needs a non-empty id.`);
  }
  const updatedAt = requireIsoTimestamp(record.updatedAt, `${label}.updatedAt`);
  return { id: record.id, updatedAt };
}

export function requireString(record: Record<string, unknown>, key: string, label: string): string {
  const value = record[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw invalidRecord(`${label}.${key} must be a non-empty string.`);
  }
  return value;
}

export function requireNumber(
  record: Record<string, unknown>,
  key: string,
  label: string,
  min: number,
): number {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) {
    throw invalidRecord(`${label}.${key} must be a number of at least ${min}.`);
  }
  return value;
}

export function requireOneOf<T extends string>(
  record: Record<string, unknown>,
  key: string,
  label: string,
  options: readonly T[],
): T {
  const value = record[key];
  if (typeof value !== 'string' || !(options as readonly string[]).includes(value)) {
    throw invalidRecord(`${label}.${key} must be one of ${options.join(', ')}.`);
  }
  return value as T;
}
