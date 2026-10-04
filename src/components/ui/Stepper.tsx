import { cn } from '@/lib/utils';

interface StepperProps {
  steps: { num: string; label: string; desc: string }[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isComplete = i < current;
        const isActive = i === current;
        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center border font-mono text-xs font-semibold transition-all',
                  isComplete && 'bg-success/15 border-success/40 text-success',
                  isActive && 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan glow-cyan',
                  !isComplete && !isActive && 'bg-bg-surface border-border text-text-muted'
                )}
              >
                {isComplete ? '✓' : step.num}
              </div>
              <div>
                <div
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider transition-colors',
                    isActive ? 'text-accent-cyan' : isComplete ? 'text-success' : 'text-text-muted'
                  )}
                >
                  {step.label}
                </div>
                <div className="text-2xs text-text-muted">{step.desc}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('h-px flex-1 mx-4 transition-colors', isComplete ? 'bg-success/40' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
