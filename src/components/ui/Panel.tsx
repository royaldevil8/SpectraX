import { cn } from '@/lib/utils';

export function Panel({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('bg-bg-surface border border-border rounded-lg', className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">{title}</h3>
            {subtitle && <p className="text-2xs text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-base border border-border rounded text-2xs text-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </div>
    </div>
  );
}
