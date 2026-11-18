import { openDB } from 'idb';
import type { IDBPDatabase, IDBPTransaction } from 'idb';
import { StorageError, toStorageError } from './errors';

export const DB_NAME = 'calligraphewrite';
export const DB_VERSION = 1;

export const OBJECT_STORES = ['documents', 'templates', 'profiles', 'assets'] as const;
export type ObjectStoreName = (typeof OBJECT_STORES)[number];

export interface MigrationContext {
  db: IDBPDatabase;
  transaction: IDBPTransaction<unknown, string[], 'versionchange'>;
}

// A migration brings the database from version N-1 to version N. It runs inside the upgrade transaction,
// so if it throws, the whole upgrade is rolled back and existing data is left unchanged.
export type Migration = (context: MigrationContext) => void;
export type MigrationMap = Readonly<Record<number, Migration>>;

// Version 1: the four object stores. Each uses id as its key and has an updatedAt index.
function createInitialStores({ db }: MigrationContext): void {
  for (const name of OBJECT_STORES) {
    if (!db.objectStoreNames.contains(name)) {
      const store = db.createObjectStore(name, { keyPath: 'id' });
      store.createIndex('updatedAt', 'updatedAt', { unique: false });
    }
  }
}

export const MIGRATIONS: MigrationMap = {
  1: createInitialStores,
};

// Runs every migration after oldVersion, up to and including newVersion, in order.
export function runMigrations(
  context: MigrationContext,
  oldVersion: number,
  newVersion: number | null,
  migrations: MigrationMap,
): void {
  if (newVersion === null) {
    return;
  }
  for (let version = oldVersion + 1; version <= newVersion; version += 1) {
    migrations[version]?.(context);
  }
}

export interface DatabaseOptions {
  name?: string;
  version?: number;
  migrations?: MigrationMap;
}

export interface DatabaseHandle {
  getConnection(): Promise<IDBPDatabase>;
  close(): Promise<void>;
}

// Opens the database lazily and shares one connection. If opening fails, the next call tries again.
export function createDatabaseHandle(options: DatabaseOptions = {}): DatabaseHandle {
  const name = options.name ?? DB_NAME;
  const version = options.version ?? DB_VERSION;
  const migrations = options.migrations ?? MIGRATIONS;

  let pending: Promise<IDBPDatabase> | null = null;
  let current: IDBPDatabase | null = null;

  async function connect(): Promise<IDBPDatabase> {
    if (typeof indexedDB === 'undefined') {
      throw new StorageError('unavailable', 'open');
    }

    // Records a migration failure so it can be reported as 'upgrade' rather than a generic error.
    const upgradeFailure: { error?: unknown } = {};

    try {
      const db = await openDB(name, version, {
        upgrade(database, oldVersion, newVersion, transaction) {
          transaction.done.catch(() => undefined);
          try {
            runMigrations({ db: database, transaction }, oldVersion, newVersion, migrations);
          } catch (error) {
            upgradeFailure.error = error;
            throw error;
          }
        },
        // Another tab wants to upgrade. Close this connection so it can proceed.
        // The next call reconnects.
        blocking() {
          current?.close();
          current = null;
          pending = null;
        },
      });
      current = db;
      return db;
    } catch (error) {
      if (upgradeFailure.error !== undefined) {
        throw new StorageError('upgrade', 'open', undefined, upgradeFailure.error);
      }
      throw toStorageError(error, 'open');
    }
  }

  return {
    getConnection() {
      if (pending === null) {
        pending = connect().catch((error: unknown) => {
          pending = null;
          throw error;
        });
      }
      return pending;
    },

    async close() {
      pending = null;
      if (current !== null) {
        current.close();
        current = null;
      }
    },
  };
}
