import type { ClubType } from '@/domain/clubs';
import { aggregateConsistency } from '@/domain/scoring';

export type Direction = 'left' | 'center' | 'right';

export interface ClubBlock {
  clubType: ClubType;
  date: string;
  ballCount: number;
  solidCount: number;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  distanceMeters: number | null;
}

export interface ClubInsight {
  clubType: ClubType;
  balls: number;
  consistency: number;
  tendency: Direction;
  averageDistance: number | null;
}

function tendencyOf(blocks: ClubBlock[]): Direction {
  const left = blocks.reduce((sum, b) => sum + b.leftCount, 0);
  const center = blocks.reduce((sum, b) => sum + b.centerCount, 0);
  const right = blocks.reduce((sum, b) => sum + b.rightCount, 0);
  if (center >= left && center >= right) {
    return 'center';
  }
  return left >= right ? 'left' : 'right';
}

function averageDistanceOf(blocks: ClubBlock[]): number | null {
  const measured = blocks
    .map((b) => b.distanceMeters)
    .filter((value): value is number => value !== null);
  if (measured.length === 0) {
    return null;
  }
  return Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length);
}

// One row per club the player has data for, weakest consistency first so the
// list reads as "what to work on".
export function clubInsights(blocks: ClubBlock[]): ClubInsight[] {
  const byClub = new Map<ClubType, ClubBlock[]>();
  for (const block of blocks) {
    const bucket = byClub.get(block.clubType) ?? [];
    bucket.push(block);
    byClub.set(block.clubType, bucket);
  }

  return [...byClub.entries()]
    .map(([clubType, clubBlocks]) => ({
      clubType,
      balls: clubBlocks.reduce((sum, b) => sum + b.ballCount, 0),
      consistency: aggregateConsistency(clubBlocks),
      tendency: tendencyOf(clubBlocks),
      averageDistance: averageDistanceOf(clubBlocks),
    }))
    .sort((a, b) => a.consistency - b.consistency);
}
