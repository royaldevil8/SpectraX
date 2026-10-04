import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  accent?: 'cyan' | 'amber' | 'red' | 'green' | 'neutral';
}

export function MetricCard({ label, value, icon: Icon, trend, accent = 'neutral' }: MetricCardProps) {
  const accentColors = {
    cyan: 'text-accent-cyan',
    amber: 'text-warning',
    red: 'text-danger',
    green: 'text-success',
    neutral: 'text-text-primary',
  };

  const iconColors = {
    cyan: 'text-accent-cyan bg-accent-cyan/10',
    amber: 'text-warning bg-warning/10',
    red: 'text-danger bg-danger/10',
    green: 'text-success bg-success/10',
    neutral: 'text-text-secondary bg-bg-elevated',
  };

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-4 flex items-center gap-4 hover:border-border-strong transition-colors">
      {Icon && (
        <div className={cn('w-10 h-10 rounded-md flex items-center justify-center shrink-0', iconColors[accent])}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <div className={cn('text-2xl font-bold tabular-nums', accentColors[accent])}>{value}</div>
        <div className="text-2xs uppercase tracking-wider text-text-secondary mt-0.5">{label}</div>
        {trend && <div className="text-2xs text-text-muted mt-0.5">{trend}</div>}
      </div>
    </div>
  );
}
