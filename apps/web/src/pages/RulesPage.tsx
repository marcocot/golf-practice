import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import {
  type Outcome,
  type PenaltyLevel,
  type ReliefOption,
  type RulesContent,
  RULES,
} from '@/domain/rules';
import { cn } from '@/lib/utils';

const LEVEL_STYLES: Record<PenaltyLevel, { dot: string; chip: string; head: string }> = {
  one: {
    dot: 'bg-green-400',
    chip: 'bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-500/30',
    head: 'text-green-300',
  },
  general: {
    dot: 'bg-amber-400',
    chip: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
    head: 'text-amber-300',
  },
  dq: {
    dot: 'bg-red-400',
    chip: 'bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30',
    head: 'text-red-300',
  },
};

function RuleTag({ children }: { children: string }) {
  return (
    <span className="whitespace-nowrap rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function LevelChip({ level, children }: { level: PenaltyLevel; children: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        LEVEL_STYLES[level].chip
      )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', LEVEL_STYLES[level].dot)} />
      {children}
    </span>
  );
}

function StrokeBadge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-300 ring-1 ring-inset ring-green-500/30">
      {children}
    </span>
  );
}

function OutcomeBadge({ kind, c }: { kind: Outcome; c: RulesContent }) {
  if (kind === 'dash') {
    return <span className="text-muted-foreground">—</span>;
  }
  if (kind === 'general') {
    return (
      <span className="whitespace-nowrap rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-500/30">
        {c.outcomeGeneral}
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-500/30">
      {c.outcomeNone}
    </span>
  );
}

function FlowBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2 text-center text-xs leading-snug', className)}>
      {children}
    </div>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center text-muted-foreground">
      {label ? <span className="text-[10px] uppercase tracking-wide">{label}</span> : null}
      <span className="text-base leading-none">↓</span>
    </div>
  );
}

function FlowDiagram({ c }: { c: RulesContent }) {
  const f = c.flow;
  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <FlowBox className="border-border bg-muted font-medium text-foreground">{f.trigger}</FlowBox>
      <Connector />
      <div className="grid grid-cols-3 gap-2">
        <FlowBox className="border-border bg-card text-muted-foreground">{f.relief}</FlowBox>
        <FlowBox className="border-border bg-card text-muted-foreground">{f.play}</FlowBox>
        <FlowBox className="border-border bg-card text-muted-foreground">{f.dqBranch}</FlowBox>
      </div>
      <div className="grid grid-cols-3 items-start gap-2">
        <div className="flex flex-col items-center gap-1.5">
          <Connector label={f.yes} />
          <FlowBox className="w-full border-green-500/30 bg-green-500/10 font-semibold text-green-300">
            {f.one}
          </FlowBox>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Connector label={f.yes} />
          <FlowBox className="w-full border-border bg-card text-muted-foreground">
            {f.graveQ}
          </FlowBox>
          <div className="grid w-full grid-cols-2 gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {f.no}
              </span>
              <FlowBox className="w-full border-amber-500/30 bg-amber-500/10 font-semibold text-amber-300">
                {f.general}
              </FlowBox>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {f.yes}
              </span>
              <FlowBox className="w-full border-red-500/30 bg-red-500/10 font-semibold text-red-300">
                {f.dq}
              </FlowBox>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Connector label={f.yes} />
          <FlowBox className="w-full border-red-500/30 bg-red-500/10 font-semibold text-red-300">
            {f.dq}
          </FlowBox>
        </div>
      </div>
    </div>
  );
}

function ReliefAreaDiagram({ c }: { c: RulesContent }) {
  return (
    <svg viewBox="0 0 320 220" className="w-full" role="img" aria-label={c.reliefAreaTitle}>
      {/* forbidden zone above the reference point (nearer the hole) */}
      <line
        x1="40"
        y1="70"
        x2="280"
        y2="70"
        stroke="#f87171"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <text x="160" y="60" textAnchor="middle" fill="#f87171" fontSize="11">
        {c.reliefAreaDiagramForbidden}
      </text>
      {/* hole + flag */}
      <line x1="160" y1="14" x2="160" y2="40" stroke="#a1a1aa" strokeWidth="1.5" />
      <path d="M160 14 L176 19 L160 24 Z" fill="#22c55e" />
      <ellipse cx="160" cy="41" rx="6" ry="2.5" fill="#262626" stroke="#a1a1aa" strokeWidth="1" />
      <text x="160" y="34" textAnchor="middle" fill="#a1a1aa" fontSize="10">
        {c.reliefAreaDiagramHole}
      </text>
      {/* relief area: semicircle on the far side of the reference point */}
      <path d="M70 70 A90 90 0 0 0 250 70 Z" fill="#22c55e22" stroke="#22c55e" strokeWidth="1.5" />
      <text x="160" y="120" textAnchor="middle" fill="#86efac" fontSize="11">
        {c.reliefAreaDiagramArea}
      </text>
      {/* reference point */}
      <circle cx="160" cy="70" r="4" fill="#fafafa" />
      <text x="160" y="174" textAnchor="middle" fill="#fafafa" fontSize="11">
        {c.reliefAreaDiagramRef}
      </text>
      <line
        x1="160"
        y1="74"
        x2="160"
        y2="160"
        stroke="#fafafa"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

interface ReliefArea {
  title: string;
  badge: string;
  options: ReliefOption[];
  note?: string;
  dot: string;
}

export function RulesPage() {
  const { language } = useI18n();
  const c = RULES[language];
  const reliefAreas: ReliefArea[] = [
    { ...c.yellow, dot: 'bg-amber-400' },
    { ...c.red, dot: 'bg-red-400' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{c.pageTitle}</h1>
        <CardMuted className="mt-1">{c.pageSubtitle}</CardMuted>
      </div>

      {/* The three levels */}
      <Card>
        <CardTitle>{c.levelsTitle}</CardTitle>
        <CardMuted className="mt-1">{c.unlock}</CardMuted>
        <div className="mt-3 flex flex-col gap-2">
          {c.levels.map((lvl) => (
            <div key={lvl.level} className="rounded-xl border border-border bg-muted/40 p-3">
              <LevelChip level={lvl.level}>{lvl.heading}</LevelChip>
              <p className="mt-2 text-sm text-muted-foreground">{lvl.oneLiner}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Decision flowchart */}
      <Card>
        <CardTitle>{c.flowTitle}</CardTitle>
        <div className="mt-3">
          <FlowDiagram c={c} />
        </div>
      </Card>

      {/* Cases by level */}
      <Card>
        <CardTitle>{c.casesTitle}</CardTitle>
        <div className="mt-3 flex flex-col gap-4">
          {c.levels.map((lvl) => (
            <div key={lvl.level}>
              <div
                className={cn(
                  'mb-2 flex items-center gap-2 font-semibold',
                  LEVEL_STYLES[lvl.level].head
                )}>
                <span className={cn('h-2 w-2 rounded-full', LEVEL_STYLES[lvl.level].dot)} />
                {lvl.heading}
              </div>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                {lvl.cases.map((rc) => (
                  <li
                    key={rc.rule + rc.situation}
                    className="flex items-start justify-between gap-3 p-2.5">
                    <span className="text-sm">{rc.situation}</span>
                    <RuleTag>{rc.rule}</RuleTag>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Penalty-area relief options */}
      <Card>
        <CardTitle>{c.reliefTitle}</CardTitle>
        <CardMuted className="mt-1">{c.reliefIntro}</CardMuted>
        <div className="mt-3 flex flex-col gap-3">
          {reliefAreas.map((area) => (
            <div key={area.title} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full', area.dot)} />
                <span className="font-semibold">{area.title}</span>
                <span className="ml-auto">
                  <StrokeBadge>{area.badge}</StrokeBadge>
                </span>
              </div>
              <ol className="mt-2 flex flex-col gap-2">
                {area.options.map((opt) => (
                  <li key={opt.rule + opt.name} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{opt.name}</span>
                      <RuleTag>{opt.rule}</RuleTag>
                    </div>
                    <p className="text-muted-foreground">{opt.how}</p>
                  </li>
                ))}
              </ol>
              {area.note ? (
                <p className="mt-2 text-xs italic text-muted-foreground">{area.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {/* Bunker */}
      <Card>
        <CardTitle>{c.bunkerTitle}</CardTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-sm font-semibold text-red-300">{c.bunkerForbiddenTitle}</p>
            <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
              {c.bunkerForbidden.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
            <p className="text-sm font-semibold text-green-300">{c.bunkerAllowedTitle}</p>
            <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
              {c.bunkerAllowed.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium">{c.bunkerUnplayableTitle}</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-2 text-left font-medium">{c.colOption}</th>
                <th className="p-2 text-left font-medium">{c.colDrop}</th>
                <th className="p-2 text-right font-medium">{c.colPenalty}</th>
              </tr>
            </thead>
            <tbody>
              {c.bunkerUnplayable.map((row) => (
                <tr
                  key={row.option}
                  className={cn('border-t border-border', row.extra && 'bg-amber-500/5')}>
                  <td className="p-2 text-left">{row.option}</td>
                  <td className="p-2 text-left text-muted-foreground">{row.drop}</td>
                  <td className="p-2 text-right">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                        row.extra
                          ? 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
                          : 'bg-green-500/15 text-green-300 ring-green-500/30'
                      )}>
                      {row.penalty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs italic text-muted-foreground">{c.bunkerNote}</p>
      </Card>

      {/* Green */}
      <Card>
        <CardTitle>{c.greenTitle}</CardTitle>
        <ul className="mt-3 flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
          {c.greenRows.map((row) => (
            <li key={row.topic} className="p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{row.topic}</span>
                <OutcomeBadge kind={row.outcome} c={c} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{row.what}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Loose impediments & obstructions */}
      <Card>
        <CardTitle>{c.matterTitle}</CardTitle>
        <CardMuted className="mt-1">{c.matterIntro}</CardMuted>
        <div className="mt-3 overflow-hidden rounded-xl border border-border text-xs">
          <div className="grid grid-cols-[auto_1fr_1fr]">
            <div className="bg-muted p-2" />
            <div className="bg-muted p-2 text-center font-medium text-muted-foreground">
              {c.matterMatrix.colNatural}
            </div>
            <div className="bg-muted p-2 text-center font-medium text-muted-foreground">
              {c.matterMatrix.colArtificial}
            </div>

            <div className="flex items-center border-t border-border bg-muted p-2 text-center font-medium text-muted-foreground">
              {c.matterMatrix.rowLoose}
            </div>
            <div className="border-l border-t border-border bg-green-500/10 p-2 text-green-300">
              {c.matterMatrix.naturalLoose}
            </div>
            <div className="border-l border-t border-border bg-green-500/10 p-2 text-green-300">
              {c.matterMatrix.artificialLoose}
            </div>

            <div className="flex items-center border-t border-border bg-muted p-2 text-center font-medium text-muted-foreground">
              {c.matterMatrix.rowFixed}
            </div>
            <div className="border-l border-t border-border bg-muted/40 p-2 text-muted-foreground">
              {c.matterMatrix.naturalFixed}
            </div>
            <div className="border-l border-t border-border bg-green-500/10 p-2 text-green-300">
              {c.matterMatrix.artificialFixed}
            </div>
          </div>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {c.matterTypes.map((m) => (
            <li key={m.name} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.name}</span>
                <span className="ml-auto">
                  {m.relief === 'free' ? (
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-300 ring-1 ring-inset ring-green-500/30">
                      {c.matterReliefFree}
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-border">
                      {c.matterReliefNone}
                    </span>
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{m.examples}</p>
              <p className="mt-1 text-sm">{m.action}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Relief area (Rule 14.3) */}
      <Card>
        <CardTitle>{c.reliefAreaTitle}</CardTitle>
        <CardMuted className="mt-1">{c.reliefAreaIntro}</CardMuted>
        <div className="mt-3 rounded-xl border border-border bg-muted/30 p-2">
          <ReliefAreaDiagram c={c} />
        </div>
        <ol className="mt-3 flex flex-col gap-2">
          {c.reliefAreaElements.map((el, i) => (
            <li key={el.name} className="text-sm">
              <span className="font-medium">
                {i + 1}. {el.name}
              </span>
              <p className="text-muted-foreground">{el.meaning}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs italic text-muted-foreground">{c.clubLengthNote}</p>

        <p className="mt-4 text-sm font-medium">{c.lengthsTitle}</p>
        <div className="mt-2 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-2 text-left font-medium">{c.colMeasure}</th>
                <th className="p-2 text-left font-medium">{c.colWhen}</th>
              </tr>
            </thead>
            <tbody>
              {c.lengths.map((row) => (
                <tr key={row.measure} className="border-t border-border align-top">
                  <td className="p-2 text-left font-medium whitespace-nowrap">{row.measure}</td>
                  <td className="p-2 text-left">
                    <span>{row.when}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.examples}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm font-medium">{c.dropTitle}</p>
        <ol className="mt-2 flex flex-col gap-2">
          {c.dropSteps.map((s) => (
            <li key={s.step} className="text-sm">
              <span className="font-medium">{s.step}</span>
              <p className="text-muted-foreground">{s.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs italic text-muted-foreground">{c.dropNote}</p>
      </Card>

      {/* Memory tricks */}
      <Card>
        <CardTitle>{c.tricksTitle}</CardTitle>
        <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
          {c.tricks.map((tr) => (
            <li key={tr} className="mb-1">
              {tr}
            </li>
          ))}
        </ul>
      </Card>

      <p className="px-1 text-xs text-muted-foreground">{c.disclaimer}</p>
    </div>
  );
}
