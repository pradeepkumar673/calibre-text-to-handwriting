import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocument } from '@/engine/model/createDocument';
import type { IdFactory } from '@/engine/model/createDocument';
import { createDatabaseHandle } from '@/lib/db/database';
import type { DatabaseHandle } from '@/lib/db/database';
import { createRepositories } from '@/lib/db/repositories';
import type { DocumentModel } from '@/types/document';
import type { AssetRecord, HandwritingProfileRecord, PaperTemplateRecord } from '@/types/records';

const T1 = '2026-01-01T00:00:00.000Z';
const T2 = '2026-01-02T00:00:00.000Z';
const T3 = '2026-01-03T00:00:00.000Z';

let databaseCounter = 0;
let idCounter = 0;
const nextId: IdFactory = () => {
  idCounter += 1;
  return `id-${idCounter}`;
};

const handles: DatabaseHandle[] = [];
const databaseNames: string[] = [];

// Each test gets a fresh database, so tests cannot affect each other.
function openRepositories() {
  databaseCounter += 1;
  const name = `calligraphewrite-test-${databaseCounter}`;
  databaseNames.push(name);
  const handle = createDatabaseHandle({ name });
  handles.push(handle);
  return { repos: createRepositories(handle) };
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

function makeDocument(title: string, timestamp: string): DocumentModel {
  return createDocument(
    { title, paperTemplateId: 'a4-ruled', styleId: 'style-01', now: timestamp },
    nextId,
  );
}

function makeTemplate(): PaperTemplateRecord {
  return {
    id: 'template-1',
    updatedAt: T1,
    name: 'A4 ruled',
    widthMm: 210,
    heightMm: 297,
    ruling: 'ruled',
    marginMm: 20,
    ruleSpacingMm: 8,
  };
}

function makeProfile(): HandwritingProfileRecord {
  return {
    id: 'profile-1',
    updatedAt: T1,
    name: 'My hand',
    sampleAssetIds: ['asset-1'],
  };
}

function makeAsset(id: string, timestamp: string): AssetRecord {
  const blob = new Blob(['hello'], { type: 'text/plain' });
  return { id, updatedAt: timestamp, mimeType: 'text/plain', byteLength: 5, blob };
}

describe('document repository', () => {
  it('put then get returns the same record', async () => {
    const { repos } = openRepositories();
    const doc = makeDocument('Essay', T1);
    await repos.documents.put(doc);
    expect(await repos.documents.get(doc.id)).toEqual(doc);
  });

  it('get returns undefined for a missing id', async () => {
    const { repos } = openRepositories();
    expect(await repos.documents.get('does-not-exist')).toBeUndefined();
  });

  it('delete removes a record', async () => {
    const { repos } = openRepositories();
    const doc = makeDocument('Draft', T1);
    await repos.documents.put(doc);
    await repos.documents.delete(doc.id);
    expect(await repos.documents.get(doc.id)).toBeUndefined();
  });

  it('list returns every record in the store', async () => {
    const { repos } = openRepositories();
    const docs = [makeDocument('A', T1), makeDocument('B', T2)];
    for (const doc of docs) {
      await repos.documents.put(doc);
    }
    const listed = await repos.documents.list();
    expect(listed.map((doc) => doc.id).sort()).toEqual(docs.map((doc) => doc.id).sort());
  });

  it('queryByUpdatedAt filters inclusively and sorts ascending by default', async () => {
    const { repos } = openRepositories();
    const a = makeDocument('A', T1);
    const b = makeDocument('B', T2);
    const c = makeDocument('C', T3);
    for (const doc of [c, a, b]) {
      await repos.documents.put(doc);
    }

    const window = await repos.documents.queryByUpdatedAt({ since: T2, until: T3 });
    expect(window.map((doc) => doc.id)).toEqual([b.id, c.id]);

    const all = await repos.documents.queryByUpdatedAt();
    expect(all.map((doc) => doc.id)).toEqual([a.id, b.id, c.id]);
  });

  it('queryByUpdatedAt sorts descending and honours limit', async () => {
    const { repos } = openRepositories();
    const a = makeDocument('A', T1);
    const c = makeDocument('C', T3);
    await repos.documents.put(a);
    await repos.documents.put(c);

    const newest = await repos.documents.queryByUpdatedAt({ order: 'desc', limit: 1 });
    expect(newest.map((doc) => doc.id)).toEqual([c.id]);
  });

  it('queryByUpdatedAt rejects a timestamp that is not canonical ISO', async () => {
    const { repos } = openRepositories();
    await expect(repos.documents.queryByUpdatedAt({ since: 'yesterday' })).rejects.toMatchObject({
      code: 'invalid',
    });
  });

  it('rejects a document whose updatedAt is not canonical ISO', async () => {
    const { repos } = openRepositories();
    const doc = makeDocument('Draft', T1);
    const bad = { ...doc, updatedAt: '2026-01-01' };
    await expect(repos.documents.put(bad)).rejects.toMatchObject({ code: 'invalid' });
  });

  it('rejects a document with an unsupported schemaVersion', async () => {
    const { repos } = openRepositories();
    const doc = makeDocument('Draft', T1);
    const bad = { ...doc, schemaVersion: 2 } as unknown as DocumentModel;
    await expect(repos.documents.put(bad)).rejects.toMatchObject({ code: 'invalid' });
  });
});

describe('template, profile and asset repositories', () => {
  it('round-trips a paper template and a handwriting profile', async () => {
    const { repos } = openRepositories();
    const template = makeTemplate();
    const profile = makeProfile();
    await repos.templates.put(template);
    await repos.profiles.put(profile);
    expect(await repos.templates.get(template.id)).toEqual(template);
    expect(await repos.profiles.get(profile.id)).toEqual(profile);
  });

  it('round-trips an asset blob as a Blob, not a string', async () => {
    const { repos } = openRepositories();
    const asset = makeAsset('asset-1', T1);
    await repos.assets.put(asset);
    const stored = await repos.assets.get('asset-1');
    expect(stored?.byteLength).toBe(5);
    expect(stored?.blob.size).toBe(5);
    expect(stored?.blob.type).toBe('text/plain');
  });

  it('rejects an asset whose byteLength does not match its blob', async () => {
    const { repos } = openRepositories();
    const asset = { ...makeAsset('asset-2', T1), byteLength: 99 };
    await expect(repos.assets.put(asset)).rejects.toMatchObject({ code: 'invalid' });
  });
});

describe('storage boundaries', () => {
  it('writes nothing to localStorage', async () => {
    localStorage.clear();
    const { repos } = openRepositories();
    await repos.documents.put(makeDocument('Essay', T1));
    await repos.templates.put(makeTemplate());
    await repos.profiles.put(makeProfile());
    await repos.assets.put(makeAsset('asset-3', T1));
    expect(localStorage.length).toBe(0);
  });
});
