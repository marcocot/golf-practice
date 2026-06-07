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
    expect(await db.clubs.count()).toBe(12);
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
