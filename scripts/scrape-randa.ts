// One-off scraper for the official R&A Rules of Golf (randa.org), in Italian and
// English. Produces a compact, restructured reference dataset keyed the same way
// the quiz references are (rule sub-tag like "8_1a", definitions by stable CMS id)
// so the app can show the relevant rule/definition text offline when an answer is
// wrong. Never called at runtime.
//
// Run (Node >= 22):
//   node --experimental-strip-types scripts/scrape-randa.ts
//
// Output: <repo>/data/randa/reference.json  { rules, definitions }

import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.randa.org';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
const LOCALES: [Lang, string][] = [
  ['it', 'it-IT'],
  ['en', 'en'],
];
const MAX_RULE = 25;

type Lang = 'it' | 'en';
type Localized = Partial<Record<Lang, string>>;

interface Rule {
  number: string;
  title: Localized;
  text: Localized;
}
interface Definition {
  slug: Localized;
  title: Localized;
  text: Localized;
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

async function fetchText(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch {
      // retry
    }
    await sleep(1000);
  }
  return null;
}

function nextData(html: string): unknown {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Pull every numbered rule section ({ urlTag, number, title, description }) out of
// the ruleOfGolf tree, wherever it sits.
function collectSections(node: unknown, out: Map<string, { number: string; title: string; text: string }>) {
  if (!node || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  const urlTag = obj.urlTag;
  if (typeof urlTag === 'string' && /^\d+_\d/.test(urlTag)) {
    const number = str((obj.number as Record<string, unknown> | undefined)?.value);
    const title = str((obj.title as Record<string, unknown> | undefined)?.value);
    const text = htmlToText(str((obj.description as Record<string, unknown> | undefined)?.value));
    if (!out.has(urlTag)) out.set(urlTag, { number, title, text });
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) value.forEach((v) => collectSections(v, out));
    else if (value && typeof value === 'object') collectSections(value, out);
  }
}

// Definitions live in pageProps.rulesSummary.definitions, grouped by letter.
// Each item: { key (cross-language UUID), navigationId (slug), term.value (title),
// definitionText.value (body html) }.
function parseDefinitions(data: unknown): { slug: string; uuid: string; title: string; text: string }[] {
  const groups = (
    data as { props?: { pageProps?: { rulesSummary?: { definitions?: Record<string, unknown[]> } } } }
  )?.props?.pageProps?.rulesSummary?.definitions;
  if (!groups) return [];
  const out: { slug: string; uuid: string; title: string; text: string }[] = [];
  for (const items of Object.values(groups)) {
    for (const raw of items) {
      const it = raw as Record<string, any>;
      const title = str(it.term?.value);
      if (!title) continue;
      out.push({
        slug: str(it.navigationId),
        uuid: str(it.key),
        title,
        text: htmlToText(str(it.definitionText?.value)),
      });
    }
  }
  return out;
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, '..', 'data', 'randa');
  await mkdir(outDir, { recursive: true });

  const rules: Record<string, Rule> = {};
  const definitions: Record<string, Definition> = {};

  for (const [lang, locale] of LOCALES) {
    // Rules
    for (let n = 1; n <= MAX_RULE; n++) {
      const html = await fetchText(`${BASE}/${locale}/rog/the-rules-of-golf/rule-${n}`);
      if (html) {
        const data = nextData(html) as { props?: { pageProps?: { ruleOfGolf?: unknown } } } | null;
        const rog = data?.props?.pageProps?.ruleOfGolf as { subRules?: unknown } | undefined;
        const sections = new Map<string, { number: string; title: string; text: string }>();
        collectSections(rog?.subRules, sections);
        for (const [urlTag, s] of sections) {
          const rule = (rules[urlTag] ??= { number: s.number, title: {}, text: {} });
          if (s.number) rule.number = s.number;
          if (s.title) rule.title[lang] = s.title;
          if (s.text) rule.text[lang] = s.text;
        }
      }
      process.stdout.write(`\r[${lang}] rule ${n}/${MAX_RULE} · rules ${Object.keys(rules).length}   `);
      await sleep(300);
    }

    // Definitions (keyed by the language-stable CMS id)
    const defHtml = await fetchText(`${BASE}/${locale}/rog/definitions`);
    if (defHtml) {
      for (const d of parseDefinitions(nextData(defHtml))) {
        const def = (definitions[d.uuid] ??= { slug: {}, title: {}, text: {} });
        if (d.slug) def.slug[lang] = d.slug;
        if (d.title) def.title[lang] = d.title;
        if (d.text) def.text[lang] = d.text;
      }
    }
    process.stdout.write(`\r[${lang}] done · definitions ${Object.keys(definitions).length}        \n`);
  }

  // Drop structural nodes that carry no statement of their own in either language.
  const trimmedRules: Record<string, Rule> = {};
  for (const [tag, rule] of Object.entries(rules)) {
    if ((rule.text.it || '').trim() || (rule.text.en || '').trim()) trimmedRules[tag] = rule;
  }

  const outFile = join(outDir, 'reference.json');
  await writeFile(outFile, JSON.stringify({ rules: trimmedRules, definitions }, null, 2), 'utf8');
  console.log(
    `\nDone. ${Object.keys(trimmedRules).length} rules (of ${Object.keys(rules).length}), ${Object.keys(definitions).length} definitions → ${outFile}`
  );
}

await main();
