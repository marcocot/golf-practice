import { apiFetch } from '@/lib/api';
import {
  type ClubRecord,
  db as defaultDb,
  type GolfDb,
  type QuizResultRecord,
  type ShotBlockRecord,
  type SkillTestResultRecord,
  type TrainingSessionRecord,
} from '@/lib/db';
import type { Table } from 'dexie';

const PUSH_CURSOR = 'pushCursor';
const PULL_CURSOR = 'pullCursor';
const EPOCH = new Date(0).toISOString();

export interface SyncSnapshot {
  serverTime: string;
  clubs: ClubRecord[];
  trainingSessions: TrainingSessionRecord[];
  shotBlocks: ShotBlockRecord[];
  skillTestResults: SkillTestResultRecord[];
  quizResults: QuizResultRecord[];
}

async function getCursor(db: GolfDb, key: string): Promise<string> {
  const record = await db.meta.get(key);
  return record?.value ?? EPOCH;
}

async function setCursor(db: GolfDb, key: string, value: string): Promise<void> {
  await db.meta.put({ key, value });
}

async function mergeRecord<T extends { id: string; updatedAt: string }>(
  table: Table<T, string>,
  incoming: T
): Promise<void> {
  const existing = await table.get(incoming.id);
  if (!existing || incoming.updatedAt > existing.updatedAt) {
    await table.put(incoming);
  }
}

export async function pushChanges(db: GolfDb = defaultDb): Promise<void> {
  const since = await getCursor(db, PUSH_CURSOR);
  const [clubs, trainingSessions, shotBlocks, skillTestResults, quizResults] = await Promise.all([
    db.clubs.filter((r) => r.updatedAt > since).toArray(),
    db.trainingSessions.filter((r) => r.updatedAt > since).toArray(),
    db.shotBlocks.filter((r) => r.updatedAt > since).toArray(),
    db.skillTestResults.filter((r) => r.updatedAt > since).toArray(),
    db.quizResults.filter((r) => r.updatedAt > since).toArray(),
  ]);

  if (
    clubs.length === 0 &&
    trainingSessions.length === 0 &&
    shotBlocks.length === 0 &&
    skillTestResults.length === 0 &&
    quizResults.length === 0
  ) {
    return;
  }

  const response = await apiFetch('/sync', {
    method: 'POST',
    body: JSON.stringify({ clubs, trainingSessions, shotBlocks, skillTestResults, quizResults }),
  });
  const result: { serverTime: string } = await response.json();
  await setCursor(db, PUSH_CURSOR, result.serverTime);
}

export async function pullChanges(db: GolfDb = defaultDb): Promise<void> {
  const since = await getCursor(db, PULL_CURSOR);
  const response = await apiFetch(`/sync?since=${encodeURIComponent(since)}`);
  const snapshot: SyncSnapshot = await response.json();

  await db.transaction(
    'rw',
    [db.clubs, db.trainingSessions, db.shotBlocks, db.skillTestResults, db.quizResults],
    async () => {
      for (const club of snapshot.clubs) {
        await mergeRecord(db.clubs, club);
      }
      for (const session of snapshot.trainingSessions) {
        await mergeRecord(db.trainingSessions, session);
      }
      for (const block of snapshot.shotBlocks) {
        await mergeRecord(db.shotBlocks, block);
      }
      for (const result of snapshot.skillTestResults ?? []) {
        await mergeRecord(db.skillTestResults, result);
      }
      for (const result of snapshot.quizResults ?? []) {
        await mergeRecord(db.quizResults, result);
      }
    }
  );

  await setCursor(db, PULL_CURSOR, snapshot.serverTime);
}

export async function fullSync(db: GolfDb = defaultDb): Promise<void> {
  await pushChanges(db);
  await pullChanges(db);
}
