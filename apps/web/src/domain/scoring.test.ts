import { describe, expect, it } from 'vitest';
import {
  aggregateConsistency,
  bandFor,
  blockConsistency,
  type ScorableBlock,
  weeklyTrend,
} from '@/domain/scoring';

function block(partial: Partial<ScorableBlock>): ScorableBlock {
  return {
    date: '2026-01-05T10:00:00.000Z',
    ballCount: 10,
    solidCount: 5,
    centerCount: 5,
    ...partial,
  };
}

describe('blockConsistency', () => {
  it('returns 0 for an empty block', () => {
    expect(blockConsistency(block({ ballCount: 0 }))).toBe(0);
  });

  it('rewards solid contact and straight direction', () => {
    expect(blockConsistency(block({ ballCount: 10, solidCount: 10, centerCount: 10 }))).toBe(100);
    expect(blockConsistency(block({ ballCount: 10, solidCount: 0, centerCount: 0 }))).toBe(0);
    expect(blockConsistency(block({ ballCount: 10, solidCount: 10, centerCount: 0 }))).toBe(60);
  });
});

describe('aggregateConsistency', () => {
  it('returns 0 with no balls', () => {
    expect(aggregateConsistency([])).toBe(0);
  });

  it('weights blocks by ball count', () => {
    const score = aggregateConsistency([
      block({ ballCount: 10, solidCount: 10, centerCount: 10 }),
      block({ ballCount: 30, solidCount: 0, centerCount: 0 }),
    ]);
    expect(score).toBe(25);
  });
});

describe('bandFor', () => {
  it('maps scores to bands at the boundaries', () => {
    expect(bandFor(0)).toBe('beginner');
    expect(bandFor(39)).toBe('beginner');
    expect(bandFor(40)).toBe('intermediate');
    expect(bandFor(69)).toBe('intermediate');
    expect(bandFor(70)).toBe('advanced');
    expect(bandFor(100)).toBe('advanced');
  });
});

describe('weeklyTrend', () => {
  it('groups blocks by ISO week and sorts ascending', () => {
    const trend = weeklyTrend([
      block({ date: '2026-01-14T10:00:00.000Z', solidCount: 10, centerCount: 10 }),
      block({ date: '2026-01-05T10:00:00.000Z', solidCount: 0, centerCount: 0 }),
      block({ date: '2026-01-07T10:00:00.000Z', solidCount: 0, centerCount: 0 }),
    ]);
    expect(trend).toEqual([
      { weekStart: '2026-01-05', score: 0 },
      { weekStart: '2026-01-12', score: 100 },
    ]);
  });

  it('assigns a Sunday to the week starting the previous Monday', () => {
    const trend = weeklyTrend([block({ date: '2026-01-04T10:00:00.000Z' })]);
    expect(trend[0]?.weekStart).toBe('2025-12-29');
  });
});
