import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FUSION_RATIONALE } from '@/data';
import type { Screen, SignalType, CaseRecord, EvidenceSignal } from '@/types';
import {
  ChevronLeft,
  ScanLine,
  Clock,
  Waves,
  AudioLines,
  GitMerge,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

const SIGNAL_ICONS: Record<SignalType, typeof ScanLine> = {
  visual: ScanLine,
  temporal: Clock,
  audio: Waves,
  'av-sync': AudioLines,
  provenance: GitMerge,
};

const SIGNAL_COLORS: Record<string, string> = {
  visual: '#FF5C6C',
  temporal: '#F5B942',
  audio: '#38D5FF',
  'av-sync': '#FF5C6C',
  provenance: '#8FA3B8',
};

export function EvidenceFusionScreen({
  onNavigate,
  primaryCase,
  evidenceSignals,
}: {
  onNavigate: (s: Screen) => void;
  primaryCase: CaseRecord;
  evidenceSignals: EvidenceSignal[];
}) {
  const [expanded, setExpanded] = useState(false);

  const fusionStats = [
    { label: 'Supporting Signals', value: '4', icon: CheckCircle2, color: 'text-success' },
    { label: 'Contradicting Signals', value: '0', icon: XCircle, color: 'text-danger' },
    { label: 'Evidence Coverage', value: '86%', icon: TrendingUp, color: 'text-accent-cyan' },
    { label: 'Consistency', value: '79%', icon: TrendingUp, color: 'text-accent-cyan' },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('case-overview')} className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidence Fusion</h1>
          <p className="text-sm text-text-secondary">How independent signals contribute to the assessment.</p>
        </div>
      </div>

      {/* Fusion diagram */}
      <Panel className="p-8">
        <div className="flex flex-col items-center">
          {/* Input signals */}
          <div className="grid grid-cols-5 gap-4 w-full">
            {evidenceSignals.map((sig) => {
              const Icon = SIGNAL_ICONS[sig.type];
              const color = SIGNAL_COLORS[sig.type];
              return (
                <div key={sig.type} className="flex flex-col items-center">
                  <div
                    className="w-full bg-bg-surface border rounded-lg p-3 text-center"
                    style={{ borderColor: `${color}40` }}
                  >
                    <div className="w-9 h-9 rounded-md flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="text-2xs uppercase tracking-wider text-text-secondary font-medium">{sig.label}</div>
                    <div className="font-mono text-lg font-bold text-text-primary mt-1">{Math.round(sig.score * 100)}%</div>
                  </div>
                </div>
              );
            })}
            {/* Provenance */}
            <div className="flex flex-col items-center">
              <div className="w-full bg-bg-surface border border-border rounded-lg p-3 text-center">
                <div className="w-9 h-9 rounded-md bg-bg-elevated flex items-center justify-center mx-auto mb-2">
                  <GitMerge size={16} className="text-text-secondary" />
                </div>
                <div className="text-2xs uppercase tracking-wider text-text-secondary font-medium">PROVENANCE</div>
                <div className="text-sm text-warning mt-1">N/A</div>
              </div>
            </div>
          </div>

          {/* Arrows down */}
          <div className="flex justify-center gap-8 my-3">
            {evidenceSignals.map((_, i) => (
              <ArrowDown key={i} size={16} className="text-border-strong" />
            ))}
            <ArrowDown size={16} className="text-border-strong opacity-50" />
          </div>

          {/* Normalization */}
          <div className="w-1/2 bg-bg-elevated border border-border rounded-lg py-2.5 px-4 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Normalization</div>
            <div className="text-2xs text-text-muted mt-0.5">Calibrate · Weight · Scale</div>
          </div>

          <ArrowDown size={16} className="text-border-strong my-3" />

          {/* Evidence Fusion */}
          <div className="w-1/2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg py-3 px-4 text-center glow-cyan">
            <div className="text-sm font-semibold uppercase tracking-wider text-accent-cyan">Evidence Fusion</div>
            <div className="text-2xs text-text-secondary mt-0.5">Multimodal signal integration</div>
          </div>

          <ArrowDown size={16} className="text-border-strong my-3" />

          {/* Calibrated Risk */}
          <div className="bg-bg-surface border border-danger/30 rounded-lg py-4 px-8 text-center glow-danger">
            <div className="text-2xs uppercase tracking-wider text-text-secondary mb-1">Calibrated Risk</div>
            <div className="font-mono text-3xl font-bold text-danger">{primaryCase.riskScore.toFixed(2)}</div>
            <Badge variant="red" dot className="mt-1.5">High</Badge>
          </div>
        </div>
      </Panel>

      {/* Fusion stats */}
      <div className="grid grid-cols-4 gap-4">
        {fusionStats.map((stat) => (
          <Panel key={stat.label} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-bg-elevated flex items-center justify-center">
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-2xs uppercase tracking-wider text-text-secondary">{stat.label}</div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Why this score */}
      <Panel className="overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent-cyan/10 flex items-center justify-center">
              <GitMerge size={15} className="text-accent-cyan" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-text-primary">Why this score?</div>
              <div className="text-2xs text-text-secondary mt-0.5">Evidence-weighted rationale for the calibrated risk assessment</div>
            </div>
          </div>
          {expanded ? <ChevronUp size={18} className="text-text-muted" /> : <ChevronDown size={18} className="text-text-muted" />}
        </button>
        {expanded && (
          <div className="px-5 pb-5 animate-slide-up">
            <div className="bg-bg-base border border-border-subtle rounded-md p-4">
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{FUSION_RATIONALE}</p>

              {/* Signal contributions */}
              <div className="space-y-2 mt-4">
                <div className="text-2xs uppercase tracking-wider text-text-muted font-medium mb-2">Signal Contributions</div>
                {evidenceSignals.map((sig: EvidenceSignal) => (
                  <div key={sig.type} className="flex items-center gap-3">
                    <span className="text-2xs uppercase tracking-wider text-text-secondary w-20">{sig.label}</span>
                    <div className="flex-1 h-4 bg-bg-surface rounded relative overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{
                          width: `${sig.score * 100}%`,
                          backgroundColor: SIGNAL_COLORS[sig.type],
                        }}
                      />
                    </div>
                    <span className="font-mono text-2xs text-text-primary w-10 text-right">{(sig.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-start gap-2 text-2xs text-text-muted">
                  <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                  <span>This assessment is reproducible — all signal scores, model versions, and evidence items are preserved in the case record.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Panel>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-6">
        <Button variant="secondary" onClick={() => onNavigate('case-overview')}>Back to Case</Button>
        <Button onClick={() => onNavigate('report')}>Generate Report</Button>
      </div>
    </div>
  );
}
