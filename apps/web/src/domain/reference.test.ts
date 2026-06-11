import { describe, expect, it } from 'vitest';
import { type ReferenceData, resolveReferences, ruleTagFromRef } from '@/domain/reference';

const data: ReferenceData = {
  rules: {
    '8_1a': {
      number: '8.1a',
      title: { it: 'Azioni', en: 'Actions' },
      text: { it: 'testo regola', en: 'rule text' },
    },
  },
  definitions: {
    uuid1: {
      slug: { it: 'area_di_penalita', en: 'penalty_area' },
      title: { it: 'Area di Penalità', en: 'Penalty Area' },
      text: { it: 'definizione', en: 'definition' },
    },
  },
};

describe('ruleTagFromRef', () => {
  it('strips points, parens and slashes to the sub-tag', () => {
    expect(ruleTagFromRef('8.1a(2)')).toBe('8_1a');
    expect(ruleTagFromRef('8_1a(2)')).toBe('8_1a');
    expect(ruleTagFromRef('8.1a/5')).toBe('8_1a');
  });
});

describe('resolveReferences', () => {
  it('resolves a rule reference to its entry', () => {
    const out = resolveReferences([{ type: 'Regole', ref: '8.1a(2)' }], data);
    expect(out.rules.map((r) => r.tag)).toEqual(['8_1a']);
  });

  it('matches a definition through an HTML entity and accent', () => {
    const out = resolveReferences([{ type: 'Definizioni', ref: 'Area_di_Penalit&agrave;' }], data);
    expect(out.definitions).toHaveLength(1);
  });

  it('matches a definition despite a /N suffix', () => {
    const out = resolveReferences([{ type: 'Definizioni', ref: 'Area di Penalità/1' }], data);
    expect(out.definitions).toHaveLength(1);
  });

  it('dedupes repeated references', () => {
    const out = resolveReferences(
      [
        { type: 'Regole', ref: '8.1a(1)' },
        { type: 'Regole', ref: '8.1a(2)' },
      ],
      data
    );
    expect(out.rules).toHaveLength(1);
  });
});
