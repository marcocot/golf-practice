export interface ScorableBlock {
  date: string;
  ballCount: number;
  solidCount: number;
  centerCount: number;
}

export type Band = 'beginner' | 'intermediate' | 'advanced';

const CONTACT_WEIGHT = 0.6;
const DIRECTION_WEIGHT = 0.4;

export function blockConsistency(block: ScorableBlock): number {
  if (block.ballCount <= 0) {
    return 0;
  }
  const contact = block.solidCount / block.ballCount;
  const straight = block.centerCount / block.ballCount;
  return Math.round((CONTACT_WEIGHT * contact + DIRECTION_WEIGHT * straight) * 100);
}

export function aggregateConsistency(blocks: ScorableBlock[]): number {
  const totalBalls = blocks.reduce((sum, block) => sum + block.ballCount, 0);
  if (totalBalls <= 0) {
    return 0;
  }
  const weighted = blocks.reduce(
    (sum, block) => sum + blockConsistency(block) * block.ballCount,
    0
  );
  return Math.round(weighted / totalBalls);
}

export function bandFor(score: number): Band {
  if (score < 40) {
    return 'beginner';
  }
  if (score < 70) {
    return 'intermediate';
  }
  return 'advanced';
}

export interface TrendPoint {
  weekStart: string;
  score: number;
}

function startOfIsoWeek(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() - (day - 1));
  return copy.toISOString().slice(0, 10);
}

export function weeklyTrend(blocks: ScorableBlock[]): TrendPoint[] {
  const byWeek = new Map<string, ScorableBlock[]>();
  for (const block of blocks) {
    const week = startOfIsoWeek(new Date(block.date));
    const bucket = byWeek.get(week) ?? [];
    bucket.push(block);
    byWeek.set(week, bucket);
  }
  return [...byWeek.entries()]
    .map(([weekStart, weekBlocks]) => ({ weekStart, score: aggregateConsistency(weekBlocks) }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
