import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useClubs, useShotBlocks, useSkillTestResults } from '@/hooks/useGolfData';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/translations';
import { clubLabel } from '@/domain/clubs';
import { type ClubBlock, clubInsights, type Direction } from '@/domain/insights';
import { aggregateConsistency, type Band, bandFor, weeklyTrend } from '@/domain/scoring';
import { testedBand } from '@/domain/skillTests';

const BAND_LABELS: Record<Band, TranslationKey> = {
  beginner: 'band.beginner',
  intermediate: 'band.intermediate',
  advanced: 'band.advanced',
};

const TENDENCY_LABELS: Record<Direction, TranslationKey> = {
  left: 'insight.left',
  center: 'insight.center',
  right: 'insight.right',
};

export function ProgressPage() {
  const { t, formatDate, formatMeters } = useI18n();
  const blocks = useShotBlocks();
  const clubs = useClubs();
  const skillResults = useSkillTestResults();

  const scorable = blocks.map((block) => ({
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

  const typeById = new Map(clubs.map((club) => [club.id, club.type]));
  const insightBlocks: ClubBlock[] = blocks.flatMap((block) => {
    const clubType = typeById.get(block.clubId);
    if (!clubType) {
      return [];
    }
    return [
      {
        clubType,
        date: block.updatedAt,
        ballCount: block.ballCount,
        solidCount: block.solidCount,
        leftCount: block.leftCount,
        centerCount: block.centerCount,
        rightCount: block.rightCount,
        distanceMeters: block.distanceMeters,
      },
    ];
  });
  const insights = clubInsights(insightBlocks);

  const latestByTest = new Map<string, number>();
  for (const result of [...skillResults].sort((a, b) => a.takenAt.localeCompare(b.takenAt))) {
    latestByTest.set(result.testKey, result.score);
  }
  const tested = testedBand([...latestByTest.values()]);

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

      <Card>
        <CardMuted>{t('progress.tested')}</CardMuted>
        {tested ? (
          <p className="mt-1 text-2xl font-semibold text-primary">{t(BAND_LABELS[tested])}</p>
        ) : (
          <CardMuted className="mt-1">{t('progress.notTested')}</CardMuted>
        )}
        <Link to="/skill-tests" className="mt-3 inline-block text-sm font-medium text-primary">
          {t('progress.openSkillTests')} →
        </Link>
      </Card>

      <Card>
        <CardTitle>{t('progress.byClub')}</CardTitle>
        {insights.length === 0 ? (
          <CardMuted className="mt-2">{t('progress.byClubEmpty')}</CardMuted>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {insights.map((insight) => {
              const parts = [String(insight.consistency), t(TENDENCY_LABELS[insight.tendency])];
              if (insight.averageDistance !== null) {
                parts.push(formatMeters(insight.averageDistance));
              }
              return (
                <li key={insight.clubType} className="flex items-center justify-between gap-2">
                  <span className="font-medium">{clubLabel(insight.clubType)}</span>
                  <span className="text-sm text-muted-foreground">{parts.join(' · ')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
