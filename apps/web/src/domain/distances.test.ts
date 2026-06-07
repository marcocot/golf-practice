import { describe, expect, it } from 'vitest';
import { DEFAULT_BAG } from '@/domain/clubs';
import { carryRange } from '@/domain/distances';

describe('carryRange', () => {
  it('provides a range for every club in the default bag', () => {
    for (const club of DEFAULT_BAG) {
      expect(carryRange(club.type)).toBeDefined();
    }
  });

  it('keeps beginner distances below pro distances', () => {
    const range = carryRange('IRON_7');
    expect(range.beginner[1]).toBeLessThan(range.pro[0]);
  });
});
