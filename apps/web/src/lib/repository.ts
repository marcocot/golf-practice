import { DEFAULT_BAG } from '@/domain/clubs';
import { db as defaultDb, type GolfDb } from '@/lib/db';

function now(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return crypto.randomUUID();
}

export async function ensureBag(db: GolfDb = defaultDb): Promise<void> {
  const count = await db.clubs.count();
  if (count > 0) {
    return;
  }
  const timestamp = now();
  await db.clubs.bulkPut(
    DEFAULT_BAG.map((club, position) => ({
      id: uuid(),
      type: club.type,
      label: club.label,
      position,
      updatedAt: timestamp,
      deletedAt: null,
    }))
  );
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
