import { useLiveQuery } from 'dexie-react-hooks';
import { type ClubRecord, db, type ShotBlockRecord, type SkillTestResultRecord } from '@/lib/db';

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

export function useSkillTestResults(): SkillTestResultRecord[] {
  return useLiveQuery(
    () => db.skillTestResults.filter((result) => !result.deletedAt).toArray(),
    [],
    []
  );
}
