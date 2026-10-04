import { cn } from '@/lib/utils';

interface ConfidenceMeterProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ value, label, showValue = true, size = 'md' }: ConfidenceMeterProps) {
  const color = value >= 0.75 ? 'bg-danger' : value >= 0.5 ? 'bg-warning' : 'bg-success';
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' };
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-2xs uppercase tracking-wider text-text-secondary">{label}</span>
          {showValue && (
            <span className="font-mono text-xs text-text-primary">{Math.round(value * 100)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-bg-base rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      {!label && showValue && (
        <div className="mt-1 text-right">
          <span className="font-mono text-xs text-text-primary">{Math.round(value * 100)}%</span>
        </div>
      )}
    </div>
  );
}

interface RiskGaugeProps {
  value: number;
  size?: number;
}

export function RiskGauge({ value, size = 160 }: RiskGaugeProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength * (1 - value);

  const color = value >= 0.6 ? '#FF5C6C' : value >= 0.3 ? '#F5B942' : '#43D19E';
  const band = value >= 0.6 ? 'HIGH' : value >= 0.3 ? 'MEDIUM' : 'LOW';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1A2A3E"
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold" style={{ color }}>
          {value.toFixed(2)}
        </span>
        <span className="text-xs font-semibold tracking-wider mt-1" style={{ color }}>
          {band}
        </span>
      </div>
    </div>
  );
}

interface EvidenceBarProps {
  signals: { label: string; value: number; color?: string }[];
}

export function EvidenceBar({ signals }: EvidenceBarProps) {
  const total = signals.reduce((s, sig) => s + sig.value, 0);
  return (
    <div className="w-full">
      <div className="flex h-3 w-full rounded overflow-hidden bg-bg-base">
        {signals.map((sig, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{
              width: `${(sig.value / total) * 100}%`,
              backgroundColor: sig.color || '#38D5FF',
            }}
          />
        ))}
      </div>
    </div>
  );
}
