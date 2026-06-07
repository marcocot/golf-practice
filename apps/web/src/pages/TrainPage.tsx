import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { useClubs, useShotBlocks } from '@/hooks/useGolfData';
import { useSync } from '@/hooks/useSync';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { addBlock, ensureBag, startSession } from '@/lib/repository';

interface BlockDraft {
  ballCount: number;
  solidCount: number;
  leftCount: number;
  centerCount: number;
  rightCount: number;
  distanceMeters: number;
}

const EMPTY_DRAFT: BlockDraft = {
  ballCount: 10,
  solidCount: 5,
  leftCount: 2,
  centerCount: 6,
  rightCount: 2,
  distanceMeters: 100,
};

export function TrainPage() {
  const { t } = useI18n();
  const clubs = useClubs();
  const blocks = useShotBlocks();
  const sync = useSync();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlockDraft>(EMPTY_DRAFT);

  useEffect(() => {
    ensureBag().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!clubId && clubs.length > 0) {
      setClubId(clubs[0]?.id ?? null);
    }
  }, [clubId, clubs]);

  const sessionBlocks = sessionId ? blocks.filter((block) => block.sessionId === sessionId) : [];

  async function onStart() {
    setSessionId(await startSession());
  }

  async function onSaveBlock() {
    if (!sessionId || !clubId) {
      return;
    }
    await addBlock({ sessionId, clubId, ...draft });
    setDraft(EMPTY_DRAFT);
  }

  function onFinish() {
    setSessionId(null);
    sync.mutate();
  }

  if (!sessionId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{t('train.title')}</h1>
        <Card>
          <CardMuted>{t('train.start')}</CardMuted>
          <Button className="mt-4" size="full" onClick={onStart}>
            {t('train.start')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('train.title')}</h1>

      <Card>
        <CardTitle>{t('train.club')}</CardTitle>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {clubs.map((club) => (
            <button
              key={club.id}
              type="button"
              onClick={() => setClubId(club.id)}
              className={cn(
                'min-h-12 rounded-xl border px-2 text-sm font-medium',
                club.id === clubId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-foreground'
              )}>
              {club.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <Stepper
          label={t('train.balls')}
          value={draft.ballCount}
          min={1}
          max={50}
          onChange={(ballCount) => setDraft((prev) => ({ ...prev, ballCount }))}
        />
        <Stepper
          label={t('train.solid')}
          value={draft.solidCount}
          max={draft.ballCount}
          onChange={(solidCount) => setDraft((prev) => ({ ...prev, solidCount }))}
        />
        <Stepper
          label={t('train.left')}
          value={draft.leftCount}
          max={draft.ballCount}
          onChange={(leftCount) => setDraft((prev) => ({ ...prev, leftCount }))}
        />
        <Stepper
          label={t('train.center')}
          value={draft.centerCount}
          max={draft.ballCount}
          onChange={(centerCount) => setDraft((prev) => ({ ...prev, centerCount }))}
        />
        <Stepper
          label={t('train.right')}
          value={draft.rightCount}
          max={draft.ballCount}
          onChange={(rightCount) => setDraft((prev) => ({ ...prev, rightCount }))}
        />
        <Stepper
          label={t('train.distance')}
          value={draft.distanceMeters}
          min={0}
          max={350}
          step={5}
          onChange={(distanceMeters) => setDraft((prev) => ({ ...prev, distanceMeters }))}
        />
        <Button size="full" onClick={onSaveBlock}>
          {t('train.saveBlock')}
        </Button>
      </Card>

      <CardMuted>
        {t('train.blocksLogged')}: {sessionBlocks.length}
      </CardMuted>

      <Button variant="outline" size="full" onClick={onFinish}>
        {t('train.finish')}
      </Button>
    </div>
  );
}
