import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { useSkillTestResults } from '@/hooks/useGolfData';
import { useSync } from '@/hooks/useSync';
import { useI18n } from '@/i18n';
import type { SkillTestResultRecord } from '@/lib/db';
import { SKILL_TESTS, skillScore } from '@/domain/skillTests';
import { addSkillTestResult } from '@/lib/repository';

function latestScore(results: SkillTestResultRecord[], testKey: string): number | null {
  const forTest = results
    .filter((result) => result.testKey === testKey)
    .sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  return forTest[0]?.score ?? null;
}

export function SkillTestsPage() {
  const { t, language } = useI18n();
  const results = useSkillTestResults();
  const sync = useSync();
  const [draft, setDraft] = useState<Record<string, number>>({});

  async function onSave(testKey: string, attempts: number) {
    const successes = draft[testKey] ?? 0;
    await addSkillTestResult({ testKey, score: skillScore(successes, attempts) });
    setDraft((prev) => ({ ...prev, [testKey]: 0 }));
    sync.mutate();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{t('skill.title')}</h1>
        <CardMuted className="mt-1">{t('skill.subtitle')}</CardMuted>
      </div>

      {SKILL_TESTS.map((test) => {
        const latest = latestScore(results, test.key);
        const successes = draft[test.key] ?? 0;
        return (
          <Card key={test.key} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle>{test.title[language]}</CardTitle>
              <span className="shrink-0 text-sm text-muted-foreground">
                {t('skill.latest')}: {latest === null ? t('skill.notTaken') : latest}
              </span>
            </div>
            <CardMuted>{test.description[language]}</CardMuted>
            <Stepper
              label={t('skill.onTarget')}
              value={successes}
              min={0}
              max={test.attempts}
              onChange={(value) => setDraft((prev) => ({ ...prev, [test.key]: value }))}
            />
            <Button size="full" onClick={() => onSave(test.key, test.attempts)}>
              {t('skill.save')}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
