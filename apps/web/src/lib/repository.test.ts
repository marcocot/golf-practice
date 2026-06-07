import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GolfDb } from '@/lib/db';
import { addBlock, ensureBag, startSession } from '@/lib/repository';

let db: GolfDb;

beforeEach(() => {
  db = new GolfDb(`test-${crypto.randomUUID()}`);
});

afterEach(async () => {
  await db.delete();
});

describe('ensureBag', () => {
  it('seeds the default bag once', async () => {
    await ensureBag(db);
    expect(await db.clubs.count()).toBe(12);

    await ensureBag(db);
    const active = (await db.clubs.toArray()).filter((club) => !club.deletedAt);
    expect(active).toHaveLength(12);
  });

  it('does not duplicate when called concurrently', async () => {
    await Promise.all([ensureBag(db), ensureBag(db)]);
    const active = (await db.clubs.toArray()).filter((club) => !club.deletedAt);
    expect(active).toHaveLength(12);
  });

  it('soft-deletes duplicate clubs of the same type, keeping one', async () => {
    const ts = '2026-01-01T00:00:00.000Z';
    await db.clubs.bulkAdd([
      { id: 'c1', type: 'IRON_7', label: '7 iron', position: 5, updatedAt: ts, deletedAt: null },
      { id: 'c2', type: 'IRON_7', label: '7 iron', position: 5, updatedAt: ts, deletedAt: null },
      { id: 'c3', type: 'DRIVER', label: 'Driver', position: 0, updatedAt: ts, deletedAt: null },
    ]);

    await ensureBag(db);

    const active = (await db.clubs.toArray()).filter((club) => !club.deletedAt);
    expect(active.filter((club) => club.type === 'IRON_7')).toHaveLength(1);
    expect(active.filter((club) => club.type === 'DRIVER')).toHaveLength(1);
    expect(await db.clubs.get('c1')).toMatchObject({ deletedAt: null });
    expect((await db.clubs.get('c2'))?.deletedAt).not.toBeNull();
  });
});

describe('startSession', () => {
  it('creates a session and returns its id', async () => {
    const id = await startSession(db);
    const session = await db.trainingSessions.get(id);
    expect(session?.id).toBe(id);
    expect(session?.deletedAt).toBeNull();
  });
});

describe('addBlock', () => {
  it('persists a shot block linked to a session and club', async () => {
    const sessionId = await startSession(db);
    await addBlock(
      {
        sessionId,
        clubId: 'club-1',
        ballCount: 10,
        solidCount: 7,
        leftCount: 2,
        centerCount: 6,
        rightCount: 2,
        distanceMeters: 120,
      },
      db
    );
    const blocks = await db.shotBlocks.where('sessionId').equals(sessionId).toArray();
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.solidCount).toBe(7);
  });
});
