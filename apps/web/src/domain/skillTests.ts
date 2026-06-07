import type { Language } from '@/i18n/translations';
import { type Band, bandFor } from '@/domain/scoring';

export interface SkillTest {
  key: string;
  attempts: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
}

export const SKILL_TESTS: SkillTest[] = [
  {
    key: 'gate-7iron',
    attempts: 9,
    title: { en: '9-ball gate (7 iron)', it: 'Cancello 9 palle (ferro 7)' },
    description: {
      en: 'Pick a target ~120 m out. Hit 9 balls with the 7 iron and count how many land in a fairway-width zone around it.',
      it: 'Scegli un bersaglio a ~120 m. Tira 9 palle col ferro 7 e conta quante atterrano in una zona ampia quanto un fairway.',
    },
  },
  {
    key: 'ladder-wedges',
    attempts: 9,
    title: { en: 'Wedge ladder', it: 'Scala con i wedge' },
    description: {
      en: 'Three balls each with PW, 56° and lob at three distances. Count how many finish close to the chosen carry.',
      it: 'Tre palle ciascuno con PW, 56° e lob a tre distanze. Conta quante finiscono vicino alla distanza scelta.',
    },
  },
];

export function skillScore(successes: number, attempts: number): number {
  if (attempts <= 0) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(successes, attempts));
  return Math.round((clamped / attempts) * 100);
}

export function testedBand(latestScores: number[]): Band | null {
  if (latestScores.length === 0) {
    return null;
  }
  const average = Math.round(
    latestScores.reduce((sum, value) => sum + value, 0) / latestScores.length
  );
  return bandFor(average);
}
