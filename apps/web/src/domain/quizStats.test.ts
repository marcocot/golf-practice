import { describe, expect, it } from 'vitest';
import {
  type QuizOutcome,
  bySection,
  byLevel,
  overall,
  streaks,
  weakSections,
} from '@/domain/quizStats';

function o(section: string, level: string, correct: boolean, answeredAt: string): QuizOutcome {
  return { section, level, correct, answeredAt };
}

describe('overall', () => {
  it('counts correct over total', () => {
    const r = [o('Definizioni', 'Facile', true, '1'), o('Definizioni', 'Facile', false, '2')];
    expect(overall(r)).toEqual({ total: 2, correct: 1, accuracy: 0.5 });
  });

  it('is empty-safe', () => {
    expect(overall([])).toEqual({ total: 0, correct: 0, accuracy: 0 });
  });
});

describe('bySection', () => {
  it('credits a multi-section question to each section', () => {
    const r = [o('Definizioni/Il gioco in generale', 'Facile', true, '1')];
    const s = bySection(r);
    expect(s.find((x) => x.section === 'Definizioni')?.total).toBe(1);
    expect(s.find((x) => x.section === 'Il gioco in generale')?.total).toBe(1);
  });
});

describe('byLevel', () => {
  it('groups by level', () => {
    const r = [o('Definizioni', 'Facile', true, '1'), o('Definizioni', 'Difficile', false, '2')];
    expect(byLevel(r)).toHaveLength(2);
  });
});

describe('streaks', () => {
  it('tracks current trailing run and best run', () => {
    const r = [
      o('s', 'l', true, '1'),
      o('s', 'l', true, '2'),
      o('s', 'l', false, '3'),
      o('s', 'l', true, '4'),
    ];
    expect(streaks(r)).toEqual({ current: 1, best: 2 });
  });

  it('current equals best when all correct', () => {
    const r = [o('s', 'l', true, '1'), o('s', 'l', true, '2')];
    expect(streaks(r)).toEqual({ current: 2, best: 2 });
  });
});

describe('weakSections', () => {
  it('flags sections below threshold with enough answers', () => {
    const r = Array.from({ length: 6 }, (_, i) => o('Definizioni', 'Facile', i < 2, String(i)));
    const weak = weakSections(r, { minAnswered: 5, threshold: 0.7 });
    expect(weak.map((w) => w.section)).toEqual(['Definizioni']);
  });

  it('ignores sections without enough answers', () => {
    const r = [o('Definizioni', 'Facile', false, '1')];
    expect(weakSections(r, { minAnswered: 5 })).toEqual([]);
  });
});
