import { useLiveQuery } from 'dexie-react-hooks';
import { type ClubRecord, db, type ShotBlockRecord } from '@/lib/db';

export function useClubs(): ClubRecord[] {
  return useLiveQuery(
    () =>
      db.clubs
        .orderBy('position')
        .filter((club) => !club.deletedAt)
        .toArray(),
    [],
    []
  );
}

export function useShotBlocks(): ShotBlockRecord[] {
  return useLiveQuery(() => db.shotBlocks.filter((block) => !block.deletedAt).toArray(), [], []);
}
