import type { IDBPDatabase } from 'idb';
import type { StoredRecord } from '@/types/records';
import type { ObjectStoreName } from '../database';
import { toStorageError } from '../errors';
import { invalidRecord, requireIsoTimestamp } from './validation';

export type ConnectionProvider = () => Promise<IDBPDatabase>;

export interface UpdatedAtQuery {
  // Inclusive lower bound, as a canonical ISO timestamp.
  since?: string;
  // Inclusive upper bound, as a canonical ISO timestamp.
  until?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface RecordRepository<T extends StoredRecord> {
  readonly storeName: ObjectStoreName;
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<T[]>;
  queryByUpdatedAt(query?: UpdatedAtQuery): Promise<T[]>;
}

export interface RepositoryConfig<T extends StoredRecord> {
  storeName: ObjectStoreName;
  getConnection: ConnectionProvider;
  // Checks an unknown value and returns it as a typed record. Throws a StorageError if it is invalid.
  validate: (value: unknown) => T;
}

function buildRange(since?: string, until?: string): IDBKeyRange | undefined {
  if (since !== undefined && until !== undefined) {
    return IDBKeyRange.bound(since, until);
  }
  if (since !== undefined) {
    return IDBKeyRange.lowerBound(since);
  }
  if (until !== undefined) {
    return IDBKeyRange.upperBound(until);
  }
  return undefined;
}

export function createRepository<T extends StoredRecord>(
  config: RepositoryConfig<T>,
): RecordRepository<T> {
  const { storeName, getConnection, validate } = config;

  // Runs one storage operation and converts any failure into a typed StorageError.
  async function run<R>(operation: string, action: (db: IDBPDatabase) => Promise<R>): Promise<R> {
    try {
      const db = await getConnection();
      return await action(db);
    } catch (error) {
      throw toStorageError(error, operation);
    }
  }

  return {
    storeName,

    get: (id) =>
      run('get', async (db) => {
        const value: unknown = await db.get(storeName, id);
        return value === undefined ? undefined : validate(value);
      }),

    put: (record) =>
      run('put', async (db) => {
        await db.put(storeName, validate(record));
      }),

    delete: (id) =>
      run('delete', async (db) => {
        await db.delete(storeName, id);
      }),

    list: () =>
      run('list', async (db) => {
        const values: unknown[] = await db.getAll(storeName);
        return values.map((value) => validate(value));
      }),

    queryByUpdatedAt: (query = {}) =>
      run('queryByUpdatedAt', async (db) => {
        const { since, until, order = 'asc', limit } = query;

        if (since !== undefined) {
          requireIsoTimestamp(since, 'queryByUpdatedAt.since');
        }
        if (until !== undefined) {
          requireIsoTimestamp(until, 'queryByUpdatedAt.until');
        }
        if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
          throw invalidRecord('queryByUpdatedAt.limit must be a non-negative integer.');
        }
        if (since !== undefined && until !== undefined && since > until) {
          return [];
        }

        const values: unknown[] = await db.getAllFromIndex(
          storeName,
          'updatedAt',
          buildRange(since, until),
        );
        const records = values.map((value) => validate(value));
        const ordered = order === 'desc' ? records.reverse() : records;
        return limit === undefined ? ordered : ordered.slice(0, limit);
      }),
  };
}
