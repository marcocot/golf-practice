import { useLiveQuery } from 'dexie-react-hooks';
import { type ClubRecord, db, type ShotBlockRecord } from '@/lib/db';

export function useClubs(): ClubRecord[] {
  return useLiveQuery(() => db.clubs.orderBy('position').toArray(), [], []);
}

export function useShotBlocks(): ShotBlockRecord[] {
  return useLiveQuery(() => db.shotBlocks.toArray(), [], []);
}
