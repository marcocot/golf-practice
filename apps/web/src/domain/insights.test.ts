import { describe, expect, it } from 'vitest';
import { type ClubBlock, clubInsights } from '@/domain/insights';

function block(partial: Partial<ClubBlock>): ClubBlock {
  return {
    clubType: 'IRON_7',
    date: '2026-01-05T10:00:00.000Z',
    ballCount: 10,
    solidCount: 5,
    leftCount: 2,
    centerCount: 6,
    rightCount: 2,
    distanceMeters: null,
    ...partial,
  };
}

describe('clubInsights', () => {
  it('returns nothing without blocks', () => {
    expect(clubInsights([])).toEqual([]);
  });

  it('groups by club, weakest consistency first', () => {
    const result = clubInsights([
      block({ clubType: 'DRIVER', solidCount: 9, centerCount: 9 }),
      block({ clubType: 'IRON_7', solidCount: 2, centerCount: 2 }),
    ]);
    expect(result.map((r) => r.clubType)).toEqual(['IRON_7', 'DRIVER']);
    expect(result[0]?.balls).toBe(10);
  });

  it('detects the dominant direction', () => {
    const right = clubInsights([block({ leftCount: 1, centerCount: 2, rightCount: 7 })]);
    expect(right[0]?.tendency).toBe('right');
    const straight = clubInsights([block({ leftCount: 2, centerCount: 6, rightCount: 2 })]);
    expect(straight[0]?.tendency).toBe('center');
    const left = clubInsights([block({ leftCount: 6, centerCount: 1, rightCount: 3 })]);
    expect(left[0]?.tendency).toBe('left');
  });

  it('averages measured distances and ignores blocks without one', () => {
    const result = clubInsights([
      block({ distanceMeters: 100 }),
      block({ distanceMeters: 120 }),
      block({ distanceMeters: null }),
    ]);
    expect(result[0]?.averageDistance).toBe(110);

    const none = clubInsights([block({ distanceMeters: null })]);
    expect(none[0]?.averageDistance).toBeNull();
  });
});
