import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cyan' | 'amber' | 'red' | 'green' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', dot = false, className }: BadgeProps) {
  const variants = {
    default: 'bg-bg-elevated text-text-secondary border-border',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30',
    amber: 'bg-warning/10 text-warning border-warning/30',
    red: 'bg-danger/10 text-danger border-danger/30',
    green: 'bg-success/10 text-success border-success/30',
    neutral: 'bg-bg-surface text-text-muted border-border',
  };

  const dotColors = {
    default: 'bg-text-secondary',
    cyan: 'bg-accent-cyan',
    amber: 'bg-warning',
    red: 'bg-danger',
    green: 'bg-success',
    neutral: 'bg-text-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}

export function RiskBadge({ risk, size = 'sm' }: { risk: RiskLevel; size?: 'sm' | 'md' }) {
  const config = {
    low: { variant: 'green' as const, label: 'LOW' },
    medium: { variant: 'amber' as const, label: 'MEDIUM' },
    review: { variant: 'amber' as const, label: 'REVIEW' },
    high: { variant: 'red' as const, label: 'HIGH' },
  };
  const c = config[risk];
  return (
    <Badge variant={c.variant} dot size={size}>
      {c.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace('-', ' ');
  const variant =
    normalized.includes('review') ? 'cyan' :
    normalized.includes('completed') ? 'green' :
    normalized.includes('analyzing') ? 'amber' :
    normalized.includes('queued') || normalized.includes('waiting') ? 'neutral' :
    normalized.includes('draft') ? 'neutral' :
    'default';
  const label = status
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
