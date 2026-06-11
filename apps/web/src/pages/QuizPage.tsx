import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { useQuizPool } from '@/hooks/useQuizPool';
import { useReference } from '@/hooks/useReference';
import { useSync } from '@/hooks/useSync';
import { addQuizResult } from '@/lib/repository';
import {
  type Level,
  LEVELS,
  type QuizQuestion,
  type Section,
  SECTIONS,
  imageSrc,
  pickSession,
} from '@/domain/quiz';
import { type Lang, type ReferenceData, pick, resolveReferences } from '@/domain/reference';
import { cn } from '@/lib/utils';

const LENGTHS = [9, 18, 0]; // 0 = all matching

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition active:scale-[0.98]',
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-border bg-transparent text-muted-foreground'
      )}>
      {children}
    </button>
  );
}

interface Outcome {
  question: QuizQuestion;
  correct: boolean;
}

function RelatedContent({
  question,
  data,
  lang,
}: {
  question: QuizQuestion;
  data: ReferenceData;
  lang: Lang;
}) {
  const { rules, definitions } = resolveReferences(question.references, data);
  if (rules.length === 0 && definitions.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {rules.map((r) => (
        <div key={r.tag}>
          <p className="text-sm font-semibold">
            {r.number} {pick(r.title, lang)}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {pick(r.text, lang)}
          </p>
        </div>
      ))}
      {definitions.map((d) => (
        <div key={pick(d.slug, lang) || pick(d.title, lang)}>
          <p className="text-sm font-semibold">{pick(d.title, lang)}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
            {pick(d.text, lang)}
          </p>
        </div>
      ))}
    </div>
  );
}

function answerClass(answered: boolean, isCorrect: boolean, isPicked: boolean): string {
  if (!answered) return 'border-border bg-card';
  if (isCorrect) return 'border-green-500/50 bg-green-500/10 text-green-200';
  if (isPicked) return 'border-red-500/50 bg-red-500/10 text-red-200';
  return 'border-border bg-card opacity-60';
}

export function QuizPage() {
  const { t, language } = useI18n();
  const pool = useQuizPool();
  const reference = useReference();
  const sync = useSync();

  const [sections, setSections] = useState<Section[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [length, setLength] = useState<number>(9);

  const [session, setSession] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  function toggle<T>(value: T, list: T[], set: (next: T[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function start() {
    if (!pool.data) return;
    const picks = pickSession(pool.data, {
      sections,
      levels,
      count: length === 0 ? undefined : length,
    });
    setSession(picks);
    setIndex(0);
    setPicked(null);
    setOutcomes([]);
  }

  async function answer(question: QuizQuestion, choice: number) {
    if (picked !== null) return;
    setPicked(choice);
    const correct = choice === question.correctIndex;
    setOutcomes((prev) => [...prev, { question, correct }]);
    await addQuizResult({
      quizId: question.id,
      section: question.section,
      level: question.level,
      correct,
    });
  }

  function next() {
    if (index + 1 >= (session?.length ?? 0)) sync.mutate(); // round done — back up the results
    setPicked(null);
    setIndex((i) => i + 1);
  }

  // ---- Setup ----
  if (!session) {
    if (pool.isLoading) {
      return <p className="text-muted-foreground">{t('quiz.loading')}</p>;
    }
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('quiz.title')}</h1>
          {language === 'en' ? (
            <CardMuted className="mt-1">{t('quiz.contentItalian')}</CardMuted>
          ) : null}
        </div>

        <Card>
          <CardTitle>{t('quiz.sections')}</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <Chip
                key={s}
                active={sections.includes(s)}
                onClick={() => toggle(s, sections, setSections)}>
                {s}
              </Chip>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>{t('quiz.levels')}</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Chip
                key={l}
                active={levels.includes(l)}
                onClick={() => toggle(l, levels, setLevels)}>
                {l}
              </Chip>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>{t('quiz.length')}</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {LENGTHS.map((n) => (
              <Chip key={n} active={length === n} onClick={() => setLength(n)}>
                {n === 0 ? t('quiz.all') : n}
              </Chip>
            ))}
          </div>
        </Card>

        <Button size="full" onClick={start}>
          {t('quiz.start')}
        </Button>
      </div>
    );
  }

  // ---- Empty selection ----
  if (session.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <CardMuted>{t('quiz.empty')}</CardMuted>
        <Button variant="outline" size="full" onClick={() => setSession(null)}>
          {t('common.cancel')}
        </Button>
      </div>
    );
  }

  // ---- Summary ----
  if (index >= session.length) {
    const correct = outcomes.filter((o) => o.correct).length;
    const weak = [...new Set(outcomes.filter((o) => !o.correct).map((o) => o.question.section))];
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t('quiz.summary')}</h1>
        <Card>
          <CardTitle>{t('quiz.score')}</CardTitle>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {correct}/{session.length}
          </p>
          {weak.length > 0 ? (
            <>
              <CardMuted className="mt-3">{t('quiz.weakThisRound')}</CardMuted>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {weak.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
        <Button size="full" onClick={() => setSession(null)}>
          {t('quiz.replay')}
        </Button>
        <Button asChild variant="outline" size="full">
          <Link to="/rules/stats">{t('quiz.toStats')}</Link>
        </Button>
      </div>
    );
  }

  // ---- Question ----
  const question = session[index];
  if (!question) return null;
  const img = imageSrc(question);
  const answered = picked !== null;
  const feedbackOk = picked === question.correctIndex;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground tabular-nums">
          {index + 1}/{session.length}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setSession(null)}>
          {t('common.cancel')}
        </Button>
      </div>

      <Card>
        {img ? (
          <img src={img} alt="" className="mb-3 max-h-56 w-full rounded-xl object-contain" />
        ) : null}
        <p className="whitespace-pre-line text-lg">{question.question}</p>
      </Card>

      <div className="flex flex-col gap-2">
        {question.answers.map((a, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => answer(question, i)}
            className={cn(
              'rounded-xl border p-4 text-left transition active:scale-[0.99] disabled:active:scale-100',
              answerClass(answered, i === question.correctIndex, i === picked)
            )}>
            {a.text}
          </button>
        ))}
      </div>

      {answered && (
        <Card>
          <p className={cn('font-semibold', feedbackOk ? 'text-green-300' : 'text-red-300')}>
            {feedbackOk ? t('quiz.correct') : t('quiz.wrong')}
          </p>
          {!feedbackOk && reference.data && (
            <div className="mt-3">
              <RelatedContent question={question} data={reference.data} lang={language} />
            </div>
          )}
        </Card>
      )}

      <Button size="full" disabled={!answered} onClick={next}>
        {index + 1 >= session.length ? t('quiz.finish') : t('quiz.next')}
      </Button>
    </div>
  );
}
