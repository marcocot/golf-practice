import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { useQuizResults } from '@/hooks/useGolfData';
import { resetQuizResults } from '@/lib/repository';
import { type Tally, bySection, byLevel, overall, streaks, weakSections } from '@/domain/quizStats';
import { cn } from '@/lib/utils';

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function AccuracyRow({ label, t: tally, weak }: { label: string; t: Tally; weak?: boolean }) {
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className={cn('min-w-0 truncate', weak && 'text-amber-300')}>{label}</span>
        <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
          {pct(tally.accuracy)} · {tally.correct}/{tally.total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', weak ? 'bg-amber-400' : 'bg-primary')}
          style={{ width: pct(tally.accuracy) }}
        />
      </div>
    </li>
  );
}

export function QuizStatsPage() {
  const { t } = useI18n();
  const results = useQuizResults();
  const [confirming, setConfirming] = useState(false);

  const total = overall(results);
  const sections = bySection(results);
  const levels = byLevel(results);
  const streak = streaks(results);
  const weak = new Set(weakSections(results).map((w) => w.section));

  async function reset() {
    await resetQuizResults();
    setConfirming(false);
  }

  if (total.total === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
        <CardMuted>{t('stats.empty')}</CardMuted>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('stats.title')}</h1>
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <CardMuted>{t('stats.accuracy')}</CardMuted>
            <p className="text-3xl font-bold tabular-nums">{pct(total.accuracy)}</p>
          </div>
          <div>
            <CardMuted>{t('stats.answered')}</CardMuted>
            <p className="text-3xl font-bold tabular-nums">{total.total}</p>
          </div>
          <div>
            <CardMuted>{t('stats.current')}</CardMuted>
            <p className="text-2xl font-bold tabular-nums">{streak.current}</p>
          </div>
          <div>
            <CardMuted>{t('stats.best')}</CardMuted>
            <p className="text-2xl font-bold tabular-nums">{streak.best}</p>
          </div>
        </div>
      </Card>

      {weak.size > 0 && (
        <Card>
          <CardTitle>{t('stats.weak')}</CardTitle>
          <ul className="mt-3 flex flex-col gap-3">
            {sections
              .filter((s) => weak.has(s.section))
              .map((s) => (
                <AccuracyRow key={s.section} label={s.section} t={s} weak />
              ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardTitle>{t('stats.bySection')}</CardTitle>
        <ul className="mt-3 flex flex-col gap-3">
          {sections.map((s) => (
            <AccuracyRow key={s.section} label={s.section} t={s} weak={weak.has(s.section)} />
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>{t('stats.byLevel')}</CardTitle>
        <ul className="mt-3 flex flex-col gap-3">
          {levels.map((l) => (
            <AccuracyRow key={l.level} label={l.level} t={l} />
          ))}
        </ul>
      </Card>

      {confirming ? (
        <Card className="flex flex-col gap-3">
          <CardMuted>{t('stats.resetConfirm')}</CardMuted>
          <div className="flex gap-2">
            <Button variant="destructive" size="full" onClick={reset}>
              {t('common.confirm')}
            </Button>
            <Button variant="outline" size="full" onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" size="full" onClick={() => setConfirming(true)}>
          {t('stats.reset')}
        </Button>
      )}
    </div>
  );
}
