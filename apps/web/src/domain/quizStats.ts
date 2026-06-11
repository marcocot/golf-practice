import { type Section, normalizeSections } from '@/domain/quiz';

// Minimal shape the stats need — the Dexie QuizResultRecord is a superset.
export interface QuizOutcome {
  section: string;
  level: string;
  correct: boolean;
  answeredAt: string;
}

export interface Tally {
  total: number;
  correct: number;
  accuracy: number; // correct / total, 0 when no answers
}

export interface SectionTally extends Tally {
  section: Section;
}

export interface LevelTally extends Tally {
  level: string;
}

function tally(total: number, correct: number): Tally {
  return { total, correct, accuracy: total === 0 ? 0 : correct / total };
}

export function overall(results: QuizOutcome[]): Tally {
  return tally(results.length, results.filter((r) => r.correct).length);
}

// A question can belong to several sections; it counts toward each of them.
export function bySection(results: QuizOutcome[]): SectionTally[] {
  const totals = new Map<Section, { total: number; correct: number }>();
  for (const r of results) {
    for (const section of normalizeSections(r.section)) {
      const cur = totals.get(section) ?? { total: 0, correct: 0 };
      cur.total += 1;
      if (r.correct) cur.correct += 1;
      totals.set(section, cur);
    }
  }
  return [...totals.entries()]
    .map(([section, t]) => ({ section, ...tally(t.total, t.correct) }))
    .sort((a, b) => b.total - a.total);
}

export function byLevel(results: QuizOutcome[]): LevelTally[] {
  const totals = new Map<string, { total: number; correct: number }>();
  for (const r of results) {
    const cur = totals.get(r.level) ?? { total: 0, correct: 0 };
    cur.total += 1;
    if (r.correct) cur.correct += 1;
    totals.set(r.level, cur);
  }
  return [...totals.entries()].map(([level, t]) => ({ level, ...tally(t.total, t.correct) }));
}

export interface Streaks {
  current: number;
  best: number;
}

// Current = trailing run of correct answers; best = longest run ever.
export function streaks(results: QuizOutcome[]): Streaks {
  const ordered = [...results].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
  let best = 0;
  let run = 0;
  for (const r of ordered) {
    run = r.correct ? run + 1 : 0;
    if (run > best) best = run;
  }
  let current = 0;
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (!ordered[i]?.correct) break;
    current += 1;
  }
  return { current, best };
}

export interface WeakSectionsOptions {
  minAnswered?: number;
  threshold?: number; // accuracy below this counts as weak
}

// Sections the user struggles with: enough answered, accuracy under threshold,
// worst first.
export function weakSections(
  results: QuizOutcome[],
  opts: WeakSectionsOptions = {}
): SectionTally[] {
  const minAnswered = opts.minAnswered ?? 5;
  const threshold = opts.threshold ?? 0.7;
  return bySection(results)
    .filter((s) => s.total >= minAnswered && s.accuracy < threshold)
    .sort((a, b) => a.accuracy - b.accuracy);
}
