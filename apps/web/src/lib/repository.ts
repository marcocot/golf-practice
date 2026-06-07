import { type ClubType, DEFAULT_BAG } from '@/domain/clubs';
import { db as defaultDb, type GolfDb } from '@/lib/db';

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return crypto.randomUUID();
}

// Runs in a transaction so concurrent calls (e.g. React StrictMode's double
// effect) can't both seed the bag and create duplicates. Also self-heals any
// duplicates left by earlier versions by soft-deleting the extras per club type.
export async function ensureBag(db: GolfDb = defaultDb): Promise<void> {
  await db.transaction('rw', db.clubs, async () => {
    const timestamp = now();
    const active = (await db.clubs.toArray()).filter((club) => !club.deletedAt);

    if (active.length === 0) {
      await db.clubs.bulkAdd(
        DEFAULT_BAG.map((club, position) => ({
          id: uuid(),
          type: club.type,
          label: club.label,
          position,
          updatedAt: timestamp,
          deletedAt: null,
        }))
      );
      return;
    }

    const seen = new Set<ClubType>();
    for (const club of [...active].sort((a, b) => a.position - b.position)) {
      if (seen.has(club.type)) {
        await db.clubs.put({ ...club, deletedAt: timestamp, updatedAt: timestamp });
      } else {
        seen.add(club.type);
      }
    }
  });
}

export async function startSession(db: GolfDb = defaultDb): Promise<string> {
  const id = uuid();
  const timestamp = now();
  await db.trainingSessions.put({
    id,
    startedAt: timestamp,
    note: null,
    updatedAt: timestamp,
    deletedAt: null,
  });
  return id;
}

export interface BlockInput {
  sessionId: string;
  clubId: string;
  ballCount: number;
  solidCount: number;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  distanceMeters: number | null;
}

export async function addBlock(input: BlockInput, db: GolfDb = defaultDb): Promise<void> {
  const timestamp = now();
  await db.shotBlocks.put({ id: uuid(), ...input, updatedAt: timestamp, deletedAt: null });
}

export async function addSkillTestResult(
  input: { testKey: string; score: number },
  db: GolfDb = defaultDb
): Promise<void> {
  const timestamp = now();
  await db.skillTestResults.put({
    id: uuid(),
    testKey: input.testKey,
    score: input.score,
    takenAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });
}
