import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '@/lib/api';
import { type ClubRecord, GolfDb } from '@/lib/db';
import { fullSync, pullChanges, pushChanges } from '@/lib/sync';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

function jsonResponse(body: unknown): Response {
  return { json: () => Promise.resolve(body) } as unknown as Response;
}

function club(partial: Partial<ClubRecord>): ClubRecord {
  return {
    id: 'c1',
    type: 'IRON_7',
    label: '7 iron',
    position: 0,
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...partial,
  };
}

let db: GolfDb;

beforeEach(() => {
  db = new GolfDb(`test-${crypto.randomUUID()}`);
  apiFetchMock.mockReset();
});

afterEach(async () => {
  await db.delete();
});

describe('pushChanges', () => {
  it('sends records changed since the cursor and advances it', async () => {
    await db.clubs.put(club({ updatedAt: '2026-01-10T00:00:00.000Z' }));
    apiFetchMock.mockResolvedValue(jsonResponse({ serverTime: '2026-02-01T00:00:00.000Z' }));

    await pushChanges(db);

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const init = apiFetchMock.mock.calls[0]?.[1];
    const raw = typeof init?.body === 'string' ? init.body : '{}';
    const body = JSON.parse(raw);
    expect(body.clubs).toHaveLength(1);
    expect((await db.meta.get('pushCursor'))?.value).toBe('2026-02-01T00:00:00.000Z');
  });

  it('does nothing when no local record changed since the cursor', async () => {
    await db.meta.put({ key: 'pushCursor', value: '2030-01-01T00:00:00.000Z' });
    await db.clubs.put(club({ updatedAt: '2026-01-10T00:00:00.000Z' }));

    await pushChanges(db);

    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe('pullChanges', () => {
  it('applies newer server records and keeps newer local records', async () => {
    await db.clubs.put(club({ id: 'c1', label: 'stale', updatedAt: '2026-01-01T00:00:00.000Z' }));
    await db.clubs.put(
      club({ id: 'c2', label: 'local-newer', updatedAt: '2026-09-01T00:00:00.000Z' })
    );

    apiFetchMock.mockResolvedValue(
      jsonResponse({
        serverTime: '2026-03-01T00:00:00.000Z',
        clubs: [
          club({ id: 'c1', label: 'server-newer', updatedAt: '2026-02-01T00:00:00.000Z' }),
          club({ id: 'c2', label: 'server-older', updatedAt: '2026-02-01T00:00:00.000Z' }),
        ],
        trainingSessions: [
          {
            id: 's1',
            startedAt: '2026-02-01T00:00:00.000Z',
            note: null,
            updatedAt: '2026-02-01T00:00:00.000Z',
            deletedAt: null,
          },
        ],
        shotBlocks: [
          {
            id: 'b1',
            sessionId: 's1',
            clubId: 'c1',
            ballCount: 10,
            solidCount: 7,
            leftCount: 2,
            centerCount: 6,
            rightCount: 2,
            distanceMeters: 120,
            updatedAt: '2026-02-01T00:00:00.000Z',
            deletedAt: null,
          },
        ],
      })
    );

    await pullChanges(db);

    expect((await db.clubs.get('c1'))?.label).toBe('server-newer');
    expect((await db.clubs.get('c2'))?.label).toBe('local-newer');
    expect(await db.trainingSessions.get('s1')).toBeDefined();
    expect((await db.shotBlocks.get('b1'))?.solidCount).toBe(7);
    expect((await db.meta.get('pullCursor'))?.value).toBe('2026-03-01T00:00:00.000Z');
    expect(apiFetchMock.mock.calls[0]?.[0]).toContain('/sync?since=');
  });
});

describe('fullSync', () => {
  it('pushes then pulls', async () => {
    apiFetchMock.mockResolvedValue(
      jsonResponse({
        serverTime: '2026-03-01T00:00:00.000Z',
        clubs: [],
        trainingSessions: [],
        shotBlocks: [],
      })
    );

    await fullSync(db);

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect((await db.meta.get('pullCursor'))?.value).toBe('2026-03-01T00:00:00.000Z');
  });
});
