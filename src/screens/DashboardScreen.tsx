import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { Panel } from '@/components/ui/Panel';
import { Badge, RiskBadge } from '@/components/ui/Badge';
import { ConfidenceMeter } from '@/components/ui/Gauges';
import type { Screen, CaseRecord, EvidenceSignal } from '@/types';
import {
  FolderSearch,
  AlertTriangle,
  Eye,
  FileText,
  Plus,
  ArrowRight,
  ScanLine,
  Clock,
  Waves,
  AudioLines,
  GitMerge,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';

const SIGNAL_ICONS = {
  visual: ScanLine,
  temporal: Clock,
  audio: Waves,
  'av-sync': AudioLines,
  provenance: GitMerge,
};

const SIGNAL_STATUS = {
  suspicious: { variant: 'red' as const, label: 'Suspicious' },
  review: { variant: 'amber' as const, label: 'Review' },
  clean: { variant: 'green' as const, label: 'Clean' },
  'strong-mismatch': { variant: 'red' as const, label: 'Strong mismatch' },
  unavailable: { variant: 'neutral' as const, label: 'Unavailable' },
};

export function DashboardScreen({
  onNavigate,
  cases,
  evidenceSignals,
  loading,
  connected,
}: {
  onNavigate: (s: Screen) => void;
  cases: CaseRecord[];
  evidenceSignals: EvidenceSignal[];
  loading: boolean;
  connected: boolean;
}) {
  const recent = cases.slice(0, 5);
  const activeCount = cases.filter((c) => c.status !== 'completed' && c.status !== 'draft').length;
  const highRiskCount = cases.filter((c) => c.risk === 'high').length;
  const reviewCount = cases.filter((c) => c.status === 'under-review').length;

  // Risk distribution for chart
  const riskData = [
    { day: 'Mon', low: 3, med: 2, high: 1 },
    { day: 'Tue', low: 4, med: 1, high: 2 },
    { day: 'Wed', low: 2, med: 3, high: 3 },
    { day: 'Thu', low: 5, med: 2, high: 1 },
    { day: 'Fri', low: 3, med: 3, high: 4 },
    { day: 'Sat', low: 2, med: 1, high: 2 },
    { day: 'Sun', low: 4, med: 2, high: 3 },
  ];
  const maxVal = Math.max(...riskData.map((d) => d.low + d.med + d.high));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Investigation Overview</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor synthetic-media cases and forensic evidence.</p>
        </div>
        <Button onClick={() => onNavigate('new-investigation')} icon={<Plus size={16} />}>
          New Investigation
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Active Cases" value={activeCount} icon={FolderSearch} accent="cyan" trend={connected ? 'Live from database' : 'Demo data'} />
        <MetricCard label="High Risk" value={highRiskCount} icon={AlertTriangle} accent="red" trend="Requires analyst review" />
        <MetricCard label="Under Review" value={reviewCount} icon={Eye} accent="amber" trend="Awaiting analysis" />
        <MetricCard label="Reports Generated" value={cases.filter((c) => c.status === 'completed').length} icon={FileText} accent="green" trend="Forensic reports" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Risk Overview */}
        <Panel title="Risk Overview" subtitle="Case risk distribution — last 7 days" className="col-span-2">
          <div className="p-5">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-danger" />
                <span className="text-2xs text-text-secondary uppercase tracking-wide">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-warning" />
                <span className="text-2xs text-text-secondary uppercase tracking-wide">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-success" />
                <span className="text-2xs text-text-secondary uppercase tracking-wide">Low</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3 h-44">
              {riskData.map((d) => {
                const total = d.low + d.med + d.high;
                const totalH = (total / maxVal) * 100;
                const highH = (d.high / total) * totalH;
                const medH = (d.med / total) * totalH;
                const lowH = (d.low / total) * totalH;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col-reverse" style={{ height: '160px' }}>
                      <div className="bg-danger transition-all duration-500 group-hover:bg-danger/80 rounded-b-sm" style={{ height: `${highH}%` }} />
                      <div className="bg-warning transition-all duration-500 group-hover:bg-warning/80" style={{ height: `${medH}%` }} />
                      <div className="bg-success transition-all duration-500 group-hover:bg-success/80 rounded-t-sm" style={{ height: `${lowH}%` }} />
                    </div>
                    <span className="text-2xs text-text-muted font-mono">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Recent Investigations */}
        <Panel title="Recent Investigations" subtitle="Latest case activity">
          <div className="divide-y divide-border-subtle">
            {recent.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate('case-overview')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-2xs text-accent-cyan mb-0.5">{c.id}</div>
                  <div className="text-sm text-text-primary truncate">{c.title}</div>
                  <div className="text-2xs text-text-muted mt-0.5">{c.updated}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RiskBadge risk={c.risk} />
                  <ArrowRight size={14} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* Evidence Signals */}
      <div className="grid grid-cols-4 gap-4">
        {evidenceSignals.map((sig) => {
          const Icon = SIGNAL_ICONS[sig.type];
          const status = SIGNAL_STATUS[sig.status];
          return (
            <Panel key={sig.type} className="p-4 hover:border-border-strong transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center">
                    <Icon size={15} className="text-accent-cyan" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">{sig.label}</span>
                </div>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </div>
              <div className="space-y-2">
                <ConfidenceMeter value={sig.score} label="Confidence" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xs text-text-muted uppercase tracking-wide">Findings</span>
                  <span className="font-mono text-xs text-text-primary">{sig.findings}</span>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Provenance checks */}
      <div className="grid grid-cols-3 gap-4">
        <Panel className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-success" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wide">Provenance Checks</div>
            <div className="text-2xs text-text-secondary mt-0.5">3 of 7 cases with verified provenance</div>
          </div>
          <Badge variant="green" dot>Active</Badge>
        </Panel>

        <Panel className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
            <Fingerprint size={18} className="text-warning" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wide">C2PA Credentials</div>
            <div className="text-2xs text-text-secondary mt-0.5">Content credentials not detected in 4 cases</div>
          </div>
          <Badge variant="amber" dot>Partial</Badge>
        </Panel>

        <Panel className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-accent-cyan/10 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-accent-cyan" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-text-primary uppercase tracking-wide">Integrity Verification</div>
            <div className="text-2xs text-text-secondary mt-0.5">All media SHA-256 fingerprinted</div>
          </div>
          <Badge variant="cyan" dot>Verified</Badge>
        </Panel>
      </div>
    </div>
  );
}
