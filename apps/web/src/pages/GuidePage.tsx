import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useClubs, useShotBlocks } from '@/hooks/useGolfData';
import { useI18n } from '@/i18n';
import { CHEAT_SHEET } from '@/domain/cheatsheet';
import { type ClubType, clubLabel, DEFAULT_BAG } from '@/domain/clubs';
import { carryRange } from '@/domain/distances';
import { type ClubBlock, clubInsights } from '@/domain/insights';

export function GuidePage() {
  const { t, language, formatNumber, formatMeters } = useI18n();
  const clubs = useClubs();
  const blocks = useShotBlocks();

  function range(values: [number, number]): string {
    return `${formatNumber(values[0])}–${formatNumber(values[1])}`;
  }

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
  const measured = clubInsights(insightBlocks)
    .map((insight) => ({ clubType: insight.clubType, average: insight.averageDistance }))
    .filter((row): row is { clubType: ClubType; average: number } => row.average !== null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('guide.title')}</h1>

      <Card>
        <CardTitle>{t('guide.yourDistances')}</CardTitle>
        <CardMuted className="mt-1">{t('guide.yourDistancesNote')}</CardMuted>
        {measured.length === 0 ? (
          <CardMuted className="mt-3">{t('guide.yourDistancesEmpty')}</CardMuted>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {measured.map((row) => (
              <li key={row.clubType} className="flex items-center justify-between gap-2">
                <span className="font-medium">{clubLabel(row.clubType)}</span>
                <span className="text-sm text-muted-foreground">~{formatMeters(row.average)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>{t('guide.distances')}</CardTitle>
        <CardMuted className="mt-1">{t('guide.distancesNote')}</CardMuted>
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-2 text-left font-medium">{t('train.club')}</th>
                <th className="p-2 text-right font-medium">{t('guide.beginner')}</th>
                <th className="p-2 text-right font-medium">{t('guide.advanced')}</th>
                <th className="p-2 text-right font-medium">{t('guide.pro')}</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_BAG.map((club) => {
                const carry = carryRange(club.type);
                return (
                  <tr key={club.type} className="border-t border-border tabular-nums">
                    <td className="p-2 text-left">{club.label}</td>
                    <td className="p-2 text-right">{range(carry.beginner)}</td>
                    <td className="p-2 text-right">{range(carry.advanced)}</td>
                    <td className="p-2 text-right">{range(carry.pro)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>{t('guide.tips')}</CardTitle>
        <div className="mt-3 flex flex-col gap-4">
          {CHEAT_SHEET[language].map((entry) => (
            <div key={entry.title}>
              <p className="font-semibold">{entry.title}</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                {entry.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
