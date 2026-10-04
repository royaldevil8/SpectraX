import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Badge, RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { RiskGauge, ConfidenceMeter } from '@/components/ui/Gauges';
import type { Screen, SignalType, CaseRecord, EvidenceSignal } from '@/types';
import {
  ScanLine,
  Clock,
  Waves,
  AudioLines,
  GitMerge,
  AlertTriangle,
  Eye,
  Calendar,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Info,
  FileSearch,
  Fingerprint,
} from 'lucide-react';

const SIGNAL_ICONS: Record<SignalType, typeof ScanLine> = {
  visual: ScanLine,
  temporal: Clock,
  audio: Waves,
  'av-sync': AudioLines,
  provenance: GitMerge,
};

const SIGNAL_STATUS_CONFIG = {
  suspicious: { variant: 'red' as const, label: 'Suspicious' },
  review: { variant: 'amber' as const, label: 'Review' },
  clean: { variant: 'green' as const, label: 'Clean' },
  'strong-mismatch': { variant: 'red' as const, label: 'Strong mismatch' },
  unavailable: { variant: 'neutral' as const, label: 'Unavailable' },
};

const WHY_FLAGGED = [
  { text: 'Visual artifacts detected around facial region.', signal: 'Visual' },
  { text: 'Audio–visual timing inconsistency detected.', signal: 'A/V Sync' },
  { text: 'Multiple suspicious intervals identified across the media timeline.', signal: 'Temporal' },
  { text: 'No verified provenance credential available.', signal: 'Provenance' },
];

export function CaseOverviewScreen({
  onNavigate,
  primaryCase,
  evidenceSignals,
  auditLogs,
}: {
  onNavigate: (s: Screen) => void;
  primaryCase: CaseRecord;
  evidenceSignals: EvidenceSignal[];
  auditLogs: { timestamp: string; event: string }[];
}) {
  const CASE = primaryCase;
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => onNavigate('dashboard')} className="text-text-secondary hover:text-text-primary transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold font-mono text-text-primary">{CASE.id}</h1>
          <StatusBadge status={CASE.status} />
        </div>
        <p className="text-sm text-text-secondary ml-8">{CASE.title}</p>
        <div className="flex items-center gap-4 ml-8 mt-2 text-2xs text-text-muted">
          <span className="font-mono">{CASE.filename}</span>
          <span>·</span>
          <span>{CASE.type}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Calendar size={10} /> {CASE.created}</span>
        </div>
      </div>

      {/* Risk panel */}
      <Panel className="p-6">
        <div className="grid grid-cols-3 gap-6 items-center">
          {/* Risk gauge */}
          <div className="flex flex-col items-center">
            <div className="text-2xs uppercase tracking-wider text-text-secondary mb-3 font-medium">Suspicion Risk</div>
            <RiskGauge value={CASE.riskScore} size={180} />
            <div className="mt-3 text-2xs text-text-muted">Calibrated assessment</div>
          </div>

          {/* Risk description */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <RiskBadge risk={CASE.risk} size="md" />
              <span className="text-sm text-text-primary font-medium">Evidence indicates elevated manipulation risk</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Assessment based on <span className="text-accent-cyan font-medium">4 independent evidence signals</span>. This score is evidence-weighted and should not be treated as proof of manipulation.
            </p>

            {/* Mini signal bars */}
            <div className="grid grid-cols-2 gap-3">
              {evidenceSignals.map((sig) => (
                <div key={sig.type} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = SIGNAL_ICONS[sig.type];
                      return <Icon size={14} className="text-accent-cyan" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-2xs uppercase tracking-wider text-text-secondary">{sig.label}</span>
                      <span className="font-mono text-xs text-text-primary">{sig.score.toFixed(2)}</span>
                    </div>
                    <ConfidenceMeter value={sig.score} showValue={false} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-5 pt-4 border-t border-border-subtle">
          <div className="flex items-start gap-2 text-2xs text-text-muted">
            <Info size={12} className="shrink-0 mt-0.5" />
            <span>
              Risk assessment is evidence-weighted and should not be treated as proof of manipulation. SpectraX does not claim that one neural network can tell the truth — this is an investigation layer around multimodal evidence.
            </span>
          </div>
        </div>
      </Panel>

      {/* Signal cards */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">Evidence Signals</h3>
        <div className="grid grid-cols-5 gap-4">
          {evidenceSignals.map((sig) => {
            const Icon = SIGNAL_ICONS[sig.type];
            const status = SIGNAL_STATUS_CONFIG[sig.status];
            return (
              <button
                key={sig.type}
                onClick={() => onNavigate('evidence')}
                className="text-left bg-bg-surface border border-border rounded-lg p-4 hover:border-accent-cyan/40 hover:bg-bg-hover transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center">
                    <Icon size={15} className="text-accent-cyan" />
                  </div>
                  <ArrowRight size={14} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-1">{sig.label}</div>
                <div className="font-mono text-xl font-bold text-text-primary mb-1">{sig.score.toFixed(2)}</div>
                <Badge variant={status.variant} dot>{status.label}</Badge>
              </button>
            );
          })}

          {/* Provenance card */}
          <button
            onClick={() => onNavigate('provenance')}
            className="text-left bg-bg-surface border border-border rounded-lg p-4 hover:border-accent-cyan/40 hover:bg-bg-hover transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-md bg-bg-elevated flex items-center justify-center">
                <ShieldCheck size={15} className="text-warning" />
              </div>
              <ArrowRight size={14} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-1">PROVENANCE</div>
            <div className="text-sm text-warning mb-1">No credentials</div>
            <Badge variant="neutral" dot>Unavailable</Badge>
          </button>
        </div>
      </div>

      {/* Why flagged */}
      <Panel title="Why Flagged" subtitle="Evidence-based findings contributing to risk assessment">
        <div className="p-5">
          <div className="space-y-3">
            {WHY_FLAGGED.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-7 h-7 rounded-md bg-danger/10 border border-danger/20 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-danger">
                  {i + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="text-sm text-text-primary">{item.text}</div>
                  <div className="text-2xs text-text-muted mt-0.5 uppercase tracking-wider">Signal: {item.signal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Case metadata */}
      <div className="grid grid-cols-2 gap-6">
        <Panel title="Media Information" className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Filename', value: CASE.filename, mono: true },
              { label: 'Duration', value: CASE.duration, mono: true },
              { label: 'Resolution', value: CASE.resolution, mono: true },
              { label: 'Frame Rate', value: CASE.frameRate, mono: true },
              { label: 'Video Codec', value: CASE.codec, mono: true },
              { label: 'Audio Codec', value: CASE.audioCodec, mono: true },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-0.5">{item.label}</div>
                <div className={`text-sm text-text-primary ${item.mono ? 'font-mono' : ''}`}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-1.5">
              <Fingerprint size={12} className="text-success" />
              <span className="text-2xs uppercase tracking-wider text-success font-medium">SHA-256 Integrity Hash</span>
            </div>
            <div className="font-mono text-2xs text-text-secondary break-all bg-bg-base p-2 rounded border border-border-subtle">
              {CASE.sha256}
            </div>
          </div>
        </Panel>

        <Panel title="Case Timeline" className="p-5">
          <div className="space-y-3">
            {(auditLogs.length > 0
              ? auditLogs.map((a) => ({ time: a.timestamp, event: a.event }))
              : [
                  { time: 'Oct 04, 09:12', event: 'Case created' },
                  { time: 'Oct 04, 09:12', event: 'Media ingested & fingerprinted' },
                  { time: 'Oct 04, 09:14', event: 'Forensic analysis completed' },
                  { time: 'Oct 04, 09:16', event: 'Risk assessment generated' },
                  { time: 'Oct 04, 09:20', event: 'Under analyst review' },
                ]
            ).map((evt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center shrink-0`}>
                    {i === 0 ? <FileSearch size={13} className="text-accent-cyan" /> :
                     i === 1 ? <Fingerprint size={13} className="text-success" /> :
                     i < 7 ? <ScanLine size={13} className="text-success" /> :
                     i < 9 ? <AlertTriangle size={13} className="text-warning" /> :
                     <Eye size={13} className="text-accent-cyan" />}
                  </div>
                  {i < (auditLogs.length > 0 ? auditLogs.length - 1 : 4) && <div className="w-px h-4 bg-border mt-1" />}
                </div>
                <div className="pt-1">
                  <div className="text-sm text-text-primary">{evt.event}</div>
                  <div className="text-2xs text-text-muted font-mono mt-0.5">{evt.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pb-6">
        <Button onClick={() => onNavigate('evidence')} icon={<Eye size={16} />}>Review Evidence</Button>
        <Button variant="secondary" onClick={() => onNavigate('timeline')} icon={<Clock size={16} />}>Open Timeline</Button>
        <Button variant="secondary" onClick={() => onNavigate('provenance')} icon={<ShieldCheck size={16} />}>View Provenance</Button>
        <Button variant="secondary" onClick={() => onNavigate('evidence-fusion')} icon={<GitMerge size={16} />}>Evidence Fusion</Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => onNavigate('report')} icon={<FileText size={16} />}>Generate Report</Button>
      </div>
    </div>
  );
}
