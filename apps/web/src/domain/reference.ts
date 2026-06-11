import type { QuizReference } from '@/domain/quiz';

// Official rule/definition texts scraped from randa.org (see scripts/scrape-randa.ts),
// shipped as a static asset and shown inline when a quiz answer is wrong.

export type Lang = 'it' | 'en';
export type Localized = Partial<Record<Lang, string>>;

export interface RuleEntry {
  number: string;
  title: Localized;
  text: Localized;
}
export interface DefinitionEntry {
  slug: Localized;
  title: Localized;
  text: Localized;
}
export interface ReferenceData {
  rules: Record<string, RuleEntry>;
  definitions: Record<string, DefinitionEntry>;
}

export interface ResolvedRule extends RuleEntry {
  tag: string;
}
export interface ResolvedReferences {
  rules: ResolvedRule[];
  definitions: DefinitionEntry[];
}

const ENTITIES: Record<string, string> = {
  agrave: 'à',
  egrave: 'è',
  eacute: 'é',
  igrave: 'ì',
  ograve: 'ò',
  ugrave: 'ù',
  amp: '&',
};

function decodeEntities(s: string): string {
  return s.replace(/&([a-zA-Z]+|#\d+);/g, (m, body: string) => {
    if (body.startsWith('#')) return String.fromCodePoint(Number(body.slice(1)));
    return ENTITIES[body] ?? m;
  });
}

// Lowercase, de-accented, alphanumeric-only key for fuzzy matching.
function norm(s: string): string {
  return decodeEntities(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// "8.1a(2)" / "8_1a(2)" / "8.1a/5" → "8_1a" (the rule sub-tag randa is keyed by).
export function ruleTagFromRef(ref: string): string {
  return ref
    .replace(/\(.*$/, '')
    .replace(/\/.*$/, '')
    .trim()
    .replace(/\./g, '_')
    .replace(/_+$/, '');
}

function buildDefinitionIndex(data: ReferenceData): Map<string, string> {
  const index = new Map<string, string>();
  for (const [uuid, def] of Object.entries(data.definitions)) {
    for (const value of [def.slug.it, def.slug.en, def.title.it, def.title.en]) {
      if (value) index.set(norm(value), uuid);
    }
  }
  return index;
}

export function pick(loc: Localized, lang: Lang): string {
  return loc[lang] ?? loc.it ?? loc.en ?? '';
}

// Resolve a question's references to the actual rule/definition entries, deduped.
export function resolveReferences(refs: QuizReference[], data: ReferenceData): ResolvedReferences {
  const defIndex = buildDefinitionIndex(data);
  const rules: ResolvedRule[] = [];
  const definitions: DefinitionEntry[] = [];
  const seenRules = new Set<string>();
  const seenDefs = new Set<string>();

  for (const ref of refs) {
    if (ref.type === 'Definizioni') {
      const key = norm((ref.label ?? ref.ref).replace(/\/.*$/, ''));
      const uuid = defIndex.get(key);
      const def = uuid ? data.definitions[uuid] : undefined;
      if (uuid && def && !seenDefs.has(uuid)) {
        seenDefs.add(uuid);
        definitions.push(def);
      }
    } else {
      const tag = ruleTagFromRef(ref.ref);
      const rule = data.rules[tag];
      if (rule && !seenRules.has(tag)) {
        seenRules.add(tag);
        rules.push({ tag, ...rule });
      }
    }
  }
  return { rules, definitions };
}
