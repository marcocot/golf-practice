// One-off scraper for quizgolf.com. Pulls every quiz via the deterministic
// `quiz_singolo.php?oneshot=N` endpoint and writes a static JSON dataset (plus
// the question images) that the app can then ship and use fully offline.
//
// Run (Node >= 22):
//   node --experimental-strip-types scripts/scrape-quizgolf.ts --max 950
//   node --experimental-strip-types scripts/scrape-quizgolf.ts --ids 1,217,255   # smoke test
//
// Output goes to <repo>/data/quizgolf/quiz.json (+ images/). Images always downloaded.
//
// Flags:
//   --start N     first id to try (default 1)
//   --max N       last id to try (default 1000)
//   --ids a,b,c   scrape only these ids (overrides start/max)
//   --delay ms    pause between requests (default 400)

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.quizgolf.com';
const UA = 'Mozilla/5.0 (compatible; golf-practice-scraper/1.0)';

interface Reference {
  type: string;
  ref: string;
  label: string;
}
interface Answer {
  text: string;
  correct: boolean;
}
interface Quiz {
  id: number;
  section: string;
  level: string;
  question: string;
  image: { url: string; file: string | null } | null;
  answers: Answer[];
  correctIndex: number;
  references: Reference[];
  referenceText: string;
}

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-images') out.images = false;
    else if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i++;
      } else out[key] = true;
    }
  }
  return out;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  egrave: 'è',
  eacute: 'é',
  agrave: 'à',
  igrave: 'ì',
  ograve: 'ò',
  ugrave: 'ù',
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body: string) => {
    if (body[0] === '#') {
      const code =
        body[1] === 'x' || body[1] === 'X'
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[body] ?? m;
  });
}

function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function firstMatch(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

function parseQuiz(html: string, id: number): Quiz | null {
  if (!new RegExp(`id="quiz${id}"`).test(html)) return null;

  const section = htmlToText(firstMatch(html, /Sezione\s*<span[^>]*>([^<]+)</i) ?? '');
  const level = htmlToText(firstMatch(html, /Difficolt[àa][^<]*<span[^>]*>([^<]+)</i) ?? '');

  const questionRaw =
    firstMatch(html, /<div class="my-4" style="font-size: large;">([\s\S]*?)<\/div>/i) ?? '';
  const question = htmlToText(questionRaw);

  const imgSrc = firstMatch(html, /<img[^>]*class="img-fluid[^"]*"[^>]*src="([^"]+)"/i);
  const image = imgSrc
    ? {
        url: imgSrc.startsWith('http') ? imgSrc : `${BASE}/${imgSrc.replace(/^\//, '')}`,
        file: null,
      }
    : null;

  const answers: Answer[] = [];
  const labelRe = /<label[^>]*class="[^"]*\b(correct|wrong)\d+\b[^"]*">([\s\S]*?)<\/label>/gi;
  let lm: RegExpExecArray | null;
  while ((lm = labelRe.exec(html)) !== null) {
    answers.push({ text: htmlToText(lm[2]), correct: lm[1].toLowerCase() === 'correct' });
  }
  const correctIndex = answers.findIndex((a) => a.correct);

  const answerBlock =
    firstMatch(html, new RegExp(`<div[^>]*id="Answer${id}"[^>]*>([\\s\\S]*?)</div>`, 'i')) ?? '';
  const references: Reference[] = [];
  const btnRe =
    /<button[^>]*name="(Regole|Definizioni|Chiarimenti)"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/button>/gi;
  let bm: RegExpExecArray | null;
  while ((bm = btnRe.exec(answerBlock)) !== null) {
    references.push({ type: bm[1], ref: bm[2].trim(), label: htmlToText(bm[3]) });
  }
  // Pad button boundaries so adjacent text ("regola" + "8.1a(2)") keeps a space.
  const referenceText = htmlToText(answerBlock.replace(/<\/?button[^>]*>/gi, ' '));

  return { id, section, level, question, image, answers, correctIndex, references, referenceText };
}

async function fetchQuiz(id: number): Promise<string> {
  const url = `${BASE}/quiz_singolo.php?oneshot=${id}`;
  let backoff = 20000; // grows on 429 / 5xx — the host (aruba-proxy) throttles bursts
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.ok) return await res.text();
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoff;
        process.stdout.write(
          `\n  ${res.status} su id ${id} (rate limit) — attendo ${Math.round(wait / 1000)}s...\n`
        );
        await sleep(wait);
        backoff = Math.min(backoff * 2, 300000);
        continue;
      }
      return await res.text(); // other 4xx: let parseQuiz decide (will be "missing")
    } catch {
      await sleep(2000); // transient network error
    }
  }
  throw new Error(`failed to fetch id ${id} (still rate-limited after retries)`);
}

async function downloadImage(url: string, dir: string): Promise<string | null> {
  const decoded = decodeURIComponent(new URL(url).pathname);
  const name = basename(decoded).replace(/\s+/g, '-');
  const dest = join(dir, name);
  try {
    await access(dest);
    return name; // already downloaded
  } catch {
    // not present, fetch it
  }
  try {
    const res = await fetch(new URL(url).href, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return name;
  } catch {
    return null;
  }
}

function fmtDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m${String(r).padStart(2, '0')}s` : `${r}s`;
}

function renderProgress(
  done: number,
  total: number,
  collected: number,
  missing: number,
  startMs: number
) {
  const frac = total === 0 ? 1 : done / total;
  const width = 24;
  const filled = Math.round(frac * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  const pct = String(Math.round(frac * 100)).padStart(3);
  const elapsed = Date.now() - startMs;
  const eta = done > 0 ? (elapsed / done) * (total - done) : 0;
  const line = `\r[${bar}] ${pct}% · ${done}/${total} · ok ${collected} · vuoti ${missing} · ETA ${fmtDuration(eta)}   `;
  process.stdout.write(line);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(here, '..');
  const outDir = join(repoRoot, 'data', 'quizgolf');
  const imgDir = join(outDir, 'images');
  const delay = typeof args.delay === 'string' ? Number(args.delay) : 700;

  const ids =
    typeof args.ids === 'string'
      ? args.ids
          .split(',')
          .map((s) => Number(s.trim()))
          .filter(Number.isFinite)
      : range(
          typeof args.start === 'string' ? Number(args.start) : 1,
          typeof args.max === 'string' ? Number(args.max) : 1000
        );

  await mkdir(imgDir, { recursive: true });

  const quizzes: Quiz[] = [];
  let missing = 0;
  const startMs = Date.now();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const html = await fetchQuiz(id);
      const quiz = parseQuiz(html, id);
      if (!quiz) {
        missing++;
      } else {
        if (quiz.image) quiz.image.file = await downloadImage(quiz.image.url, imgDir);
        quizzes.push(quiz);
      }
    } catch (err) {
      process.stdout.write('\n');
      console.error((err as Error).message);
    }
    renderProgress(i + 1, ids.length, quizzes.length, missing, startMs);
    await sleep(delay);
  }

  quizzes.sort((a, b) => a.id - b.id);
  const outFile = join(outDir, 'quiz.json');
  await writeFile(outFile, JSON.stringify(quizzes, null, 2), 'utf8');

  const sections = [...new Set(quizzes.map((q) => q.section))].sort();
  const levels = [...new Set(quizzes.map((q) => q.level))].sort();
  console.log(`\n\nDone. ${quizzes.length} quiz → ${outFile}`);
  console.log(`Sections (${sections.length}): ${sections.join(' · ')}`);
  console.log(`Levels (${levels.length}): ${levels.join(' · ')}`);
  const noCorrect = quizzes.filter((q) => q.correctIndex < 0).length;
  if (noCorrect) console.log(`WARNING: ${noCorrect} quiz with no detected correct answer.`);
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

await main();
