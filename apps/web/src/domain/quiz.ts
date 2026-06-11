// Rules-quiz question pool, scraped offline (see scripts/scrape-quizgolf.ts) and
// shipped as a static asset. The app reads it locally and never calls the source.

export interface QuizAnswer {
  text: string;
  correct: boolean;
}

export interface QuizReference {
  type: string;
  ref: string;
  label?: string; // human-readable form, e.g. "8.1a(2)" (newer scrapes only)
}

// Leading rule number of a reference like "8.1a(2)" / "8_1a(2)" / "8.1a/5" → 8.
export function ruleNumber(ref: string): number | null {
  const m = ref.match(/^\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

// Official R&A rule page (Italian). Sub-rules aren't linkable, the rule page is enough.
export function officialRuleUrl(ref: string): string | null {
  const n = ruleNumber(ref);
  return n === null ? null : `https://www.randa.org/it-IT/rog/the-rules-of-golf/rule-${n}`;
}

export const DEFINITIONS_URL = 'https://www.randa.org/it-IT/rog/definitions';

// Best-effort official link for a reference: definitions go to the definitions
// page, rules and clarifications to their rule page, anything else stays unlinked.
export function referenceUrl(ref: QuizReference): string | null {
  if (ref.type === 'Definizioni') return DEFINITIONS_URL;
  return officialRuleUrl(ref.ref);
}

// Shape of each record in /quiz/quiz.json — keep in sync with the scraper output.
export interface QuizQuestion {
  id: number;
  section: string;
  level: string;
  question: string;
  image: { url: string; file: string | null } | null;
  answers: QuizAnswer[];
  correctIndex: number;
  references: QuizReference[];
  referenceText: string;
}

// The five parts of the Rules of Golf, as the source tags them.
export const SECTIONS = [
  'Definizioni',
  'Il campo i bastoni e la palla',
  'Il gioco in generale',
  'Situazioni in cui ovviare e procedure',
  'Responsabilità del Comitato, altre forme di gioco',
] as const;
export type Section = (typeof SECTIONS)[number];

// Difficulty labels in increasing order of difficulty.
export const LEVELS = ['Facile', 'Medio/Facile', 'Medio', 'Medio/Difficile', 'Difficile'] as const;
export type Level = (typeof LEVELS)[number];

const SECTION_SET = new Set<string>(SECTIONS);

// The source sometimes tags a question with several sections joined by "/", and
// sometimes leaves the placeholder "Seleziona Argomento". Split into the known
// canonical sections; anything unrecognised (incl. the placeholder) drops out.
export function normalizeSections(raw: string): Section[] {
  return raw
    .split('/')
    .map((part) => part.trim())
    .filter((part): part is Section => SECTION_SET.has(part));
}

export function normalizeLevel(raw: string): Level | null {
  return LEVELS.find((level) => level === raw) ?? null;
}

// Local path of a question image (shipped under public/quiz/images/).
export function imageSrc(question: QuizQuestion): string | null {
  return question.image?.file ? `/quiz/images/${question.image.file}` : null;
}

export interface SelectOptions {
  sections?: Section[];
  levels?: Level[];
  count?: number;
  rng?: () => number;
}

// Fisher–Yates with an injectable RNG so selection is deterministic in tests.
function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

export function filterQuestions(
  pool: QuizQuestion[],
  sections?: Section[],
  levels?: Level[]
): QuizQuestion[] {
  const wantSections = sections && sections.length > 0 ? new Set<string>(sections) : null;
  const wantLevels = levels && levels.length > 0 ? new Set<string>(levels) : null;
  return pool.filter((q) => {
    if (wantLevels && !wantLevels.has(q.level)) return false;
    const sectionOk =
      !wantSections || normalizeSections(q.section).some((s) => wantSections.has(s));
    return sectionOk;
  });
}

// Pick a randomised, filtered set of questions for one quiz session.
export function pickSession(pool: QuizQuestion[], opts: SelectOptions = {}): QuizQuestion[] {
  const rng = opts.rng ?? Math.random;
  const filtered = filterQuestions(pool, opts.sections, opts.levels);
  const shuffled = shuffle(filtered, rng);
  return typeof opts.count === 'number' ? shuffled.slice(0, opts.count) : shuffled;
}
