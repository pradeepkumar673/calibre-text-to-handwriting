import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocument } from '@/engine/model/createDocument';
import type { IdFactory } from '@/engine/model/createDocument';
import { createDatabaseHandle, MIGRATIONS } from '@/lib/db/database';
import type { DatabaseHandle, DatabaseOptions, MigrationMap } from '@/lib/db/database';
import { createRepositories } from '@/lib/db/repositories';
import type { DocumentModel } from '@/types/document';

// Version 2 adds a 'meta' store. The real version 2 migration is written when the schema first changes.
const MIGRATIONS_TO_V2: MigrationMap = {
  ...MIGRATIONS,
  2: ({ db }) => {
    db.createObjectStore('meta');
  },
};

// Version 2 fails part way through, to check that a failed upgrade leaves data unchanged.
const BROKEN_V2: MigrationMap = {
  ...MIGRATIONS,
  2: () => {
    throw new Error('migration bug');
  },
};

let databaseCounter = 0;
let idCounter = 0;
const nextId: IdFactory = () => {
  idCounter += 1;
  return `m-${idCounter}`;
};

const handles: DatabaseHandle[] = [];
const databaseNames: string[] = [];

function open(name: string, options: Omit<DatabaseOptions, 'name'> = {}): DatabaseHandle {
  const handle = createDatabaseHandle({ name, ...options });
  handles.push(handle);
  return handle;
}

function uniqueName(): string {
  databaseCounter += 1;
  const name = `calligraphewrite-migration-${databaseCounter}`;
  databaseNames.push(name);
  return name;
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

afterEach(async () => {
  for (const handle of handles.splice(0)) {
    await handle.close();
  }
  for (const name of databaseNames.splice(0)) {
    await deleteDatabase(name);
  }
});

function sampleDocument(): DocumentModel {
  return createDocument(
    {
      title: 'Kept across upgrades',
      paperTemplateId: 'a4-ruled',
      styleId: 'style-01',
      now: '2026-01-01T00:00:00.000Z',
    },
    nextId,
  );
}

describe('schema upgrades', () => {
  it('keeps existing records when the schema is upgraded from v1 to v2', async () => {
    const name = uniqueName();
    const doc = sampleDocument();

    const v1 = open(name, { version: 1 });
    await createRepositories(v1).documents.put(doc);
    await v1.close();

    const v2 = open(name, { version: 2, migrations: MIGRATIONS_TO_V2 });
    const connection = await v2.getConnection();
    expect(connection.version).toBe(2);
    expect(connection.objectStoreNames.contains('meta')).toBe(true);
    expect(await createRepositories(v2).documents.get(doc.id)).toEqual(doc);
  });

  it('rejects opening a database written by a newer schema with a version error', async () => {
    const name = uniqueName();

    const v2 = open(name, { version: 2, migrations: MIGRATIONS_TO_V2 });
    await v2.getConnection();
    await v2.close();

    const older = open(name, { version: 1 });
    await expect(older.getConnection()).rejects.toMatchObject({ code: 'version' });
  });

  it('reports a failed migration as an upgrade error and leaves existing data unchanged', async () => {
    const name = uniqueName();
    const doc = sampleDocument();

    const v1 = open(name, { version: 1 });
    await createRepositories(v1).documents.put(doc);
    await v1.close();

    const broken = open(name, { version: 2, migrations: BROKEN_V2 });
    await expect(broken.getConnection()).rejects.toMatchObject({ code: 'upgrade' });
    await broken.close();

    const retry = open(name, { version: 1 });
    expect(await createRepositories(retry).documents.get(doc.id)).toEqual(doc);
  });
});
