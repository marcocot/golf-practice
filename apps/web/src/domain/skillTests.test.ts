import { describe, expect, it } from 'vitest';
import { SKILL_TESTS, skillScore, testedBand } from '@/domain/skillTests';

describe('skillScore', () => {
  it('scales successes over attempts to 0-100', () => {
    expect(skillScore(9, 9)).toBe(100);
    expect(skillScore(0, 9)).toBe(0);
    expect(skillScore(6, 9)).toBe(67);
  });

  it('clamps out-of-range and guards zero attempts', () => {
    expect(skillScore(20, 9)).toBe(100);
    expect(skillScore(-5, 9)).toBe(0);
    expect(skillScore(5, 0)).toBe(0);
  });
});

describe('testedBand', () => {
  it('is null with no results', () => {
    expect(testedBand([])).toBeNull();
  });

  it('maps the average of the latest scores to a band', () => {
    expect(testedBand([20, 30])).toBe('beginner');
    expect(testedBand([50, 60])).toBe('intermediate');
    expect(testedBand([80, 90])).toBe('advanced');
  });
});

describe('SKILL_TESTS', () => {
  it('ships a bilingual catalog', () => {
    expect(SKILL_TESTS.length).toBeGreaterThan(0);
    for (const test of SKILL_TESTS) {
      expect(test.title.en).toBeTruthy();
      expect(test.title.it).toBeTruthy();
      expect(test.attempts).toBeGreaterThan(0);
    }
  });
});
