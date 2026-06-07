import { describe, expect, it } from 'vitest';
import { clubLabel, DEFAULT_BAG } from '@/domain/clubs';

describe('clubs', () => {
  it('holds the full beginner bag', () => {
    expect(DEFAULT_BAG).toHaveLength(12);
  });

  it('exposes a human label per club type', () => {
    expect(clubLabel('IRON_7')).toBe('7 iron');
    expect(clubLabel('DRIVER')).toBe('Driver');
  });
});
