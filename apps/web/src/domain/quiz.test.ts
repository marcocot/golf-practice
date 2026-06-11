import { describe, expect, it } from 'vitest';
import {
  type QuizQuestion,
  filterQuestions,
  imageSrc,
  normalizeSections,
  officialRuleUrl,
  pickSession,
} from '@/domain/quiz';

function q(id: number, section: string, level: string, file: string | null = null): QuizQuestion {
  return {
    id,
    section,
    level,
    question: `Q${id}`,
    image: file ? { url: `http://x/${file}`, file } : null,
    answers: [
      { text: 'a', correct: true },
      { text: 'b', correct: false },
    ],
    correctIndex: 0,
    references: [],
    referenceText: '',
  };
}

// A deterministic RNG so shuffles are reproducible.
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
}

describe('normalizeSections', () => {
  it('splits compound sections into canonical parts', () => {
    expect(normalizeSections('Il gioco in generale/Situazioni in cui ovviare e procedure')).toEqual(
      ['Il gioco in generale', 'Situazioni in cui ovviare e procedure']
    );
  });

  it('keeps a single canonical section', () => {
    expect(normalizeSections('Definizioni')).toEqual(['Definizioni']);
  });

  it('drops the placeholder and unknown values', () => {
    expect(normalizeSections('Seleziona Argomento')).toEqual([]);
  });
});

describe('imageSrc', () => {
  it('builds a local path when an image file is present', () => {
    expect(imageSrc(q(1, 'Definizioni', 'Facile', 'caddy.jpg'))).toBe('/quiz/images/caddy.jpg');
  });

  it('returns null without an image', () => {
    expect(imageSrc(q(1, 'Definizioni', 'Facile'))).toBeNull();
  });
});

describe('officialRuleUrl', () => {
  it('links a numbered rule to its R&A page', () => {
    expect(officialRuleUrl('8.1a(2)')).toBe(
      'https://www.randa.org/it-IT/rog/the-rules-of-golf/rule-8'
    );
    expect(officialRuleUrl('8_1a(2)')).toBe(
      'https://www.randa.org/it-IT/rog/the-rules-of-golf/rule-8'
    );
  });

  it('returns null for a non-numbered reference (e.g. a definition)', () => {
    expect(officialRuleUrl('Stance')).toBeNull();
  });
});

describe('filterQuestions', () => {
  const pool = [
    q(1, 'Definizioni', 'Facile'),
    q(2, 'Il gioco in generale', 'Difficile'),
    q(3, 'Il gioco in generale/Definizioni', 'Medio'),
  ];

  it('matches a question tagged with several sections', () => {
    expect(filterQuestions(pool, ['Definizioni']).map((x) => x.id)).toEqual([1, 3]);
  });

  it('filters by level', () => {
    expect(filterQuestions(pool, undefined, ['Difficile']).map((x) => x.id)).toEqual([2]);
  });

  it('returns everything with no filters', () => {
    expect(filterQuestions(pool)).toHaveLength(3);
  });
});

describe('pickSession', () => {
  const pool = [
    q(1, 'Definizioni', 'Facile'),
    q(2, 'Il gioco in generale', 'Facile'),
    q(3, 'Definizioni', 'Facile'),
  ];

  it('caps the session to count', () => {
    const out = pickSession(pool, { count: 2, rng: seqRng([0]) });
    expect(out).toHaveLength(2);
  });

  it('only returns questions matching the filters', () => {
    const out = pickSession(pool, { sections: ['Definizioni'], rng: seqRng([0]) });
    expect(out.every((x) => x.section.includes('Definizioni'))).toBe(true);
  });
});
