import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useShotBlocks } from '@/hooks/useGolfData';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/translations';
import { aggregateConsistency, type Band, bandFor, weeklyTrend } from '@/domain/scoring';

const BAND_LABELS: Record<Band, TranslationKey> = {
  beginner: 'band.beginner',
  intermediate: 'band.intermediate',
  advanced: 'band.advanced',
};

export function ProgressPage() {
  const { t, formatDate } = useI18n();
  const blocks = useShotBlocks();

  const scorable = blocks
    .filter((block) => !block.deletedAt)
    .map((block) => ({
      date: block.updatedAt,
      ballCount: block.ballCount,
      solidCount: block.solidCount,
      centerCount: block.centerCount,
    }));

  const score = aggregateConsistency(scorable);
  const band = bandFor(score);
  const trend = weeklyTrend(scorable).map((point) => ({
    week: formatDate(point.weekStart),
    score: point.score,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('progress.title')}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardMuted>{t('progress.consistency')}</CardMuted>
          <p className="mt-1 text-4xl font-bold tabular-nums">{score}</p>
        </Card>
        <Card>
          <CardMuted>{t('progress.band')}</CardMuted>
          <p className="mt-1 text-2xl font-semibold text-primary">{t(BAND_LABELS[band])}</p>
        </Card>
      </div>

      <Card>
        <CardTitle>{t('progress.trend')}</CardTitle>
        {trend.length === 0 ? (
          <CardMuted className="mt-3">{t('progress.empty')}</CardMuted>
        ) : (
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
