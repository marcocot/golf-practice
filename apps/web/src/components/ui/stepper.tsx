import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, value, min = 0, max, step = 1, onChange }: StepperProps) {
  function clamp(next: number): number {
    const lower = Math.max(min, next);
    return max === undefined ? lower : Math.min(max, lower);
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-3 py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`${label} -`}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-card active:scale-95"
          onClick={() => onChange(clamp(value - step))}>
          <Minus className="h-5 w-5" />
        </button>
        <span className="w-10 text-center text-xl font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`${label} +`}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-card active:scale-95"
          onClick={() => onChange(clamp(value + step))}>
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
