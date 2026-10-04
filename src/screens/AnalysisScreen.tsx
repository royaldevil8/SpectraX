import { useEffect, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PIPELINE_STAGES } from '@/data';
import type { PipelineStage, CaseRecord } from '@/types';
import type { Screen } from '@/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Loader2,
  Circle,
  Activity,
  Fingerprint,
  Film,
  ArrowRight,
} from 'lucide-react';

const STAGE_ICONS: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  analyzing: Loader2,
  queued: Circle,
  checking: Loader2,
  waiting: Circle,
};

export function AnalysisScreen({ onNavigate, primaryCase }: { onNavigate: (s: Screen) => void; primaryCase: CaseRecord }) {
  const CASE = primaryCase;
  const [progress, setProgress] = useState(68);
  const [stages, setStages] = useState<PipelineStage[]>(PIPELINE_STAGES);
  const [autoComplete, setAutoComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 0.4, 100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !autoComplete) {
      setAutoComplete(true);
      setStages((prev) => prev.map((s) => ({ ...s, status: 'completed' as const })));
      setTimeout(() => onNavigate('case-overview'), 1200);
    }
  }, [progress, autoComplete, onNavigate]);

  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const currentStage = stages.find((s) => s.status === 'analyzing' || s.status === 'checking');

  const stageLabels: Record<string, string> = {
    completed: 'Completed',
    analyzing: 'Analyzing...',
    queued: 'Queued',
    checking: 'Checking...',
    waiting: 'Waiting',
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text-primary">Forensic Analysis</h1>
            <Badge variant="cyan" dot>Live</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-accent-cyan">{CASE.id}</span> — {CASE.filename}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-bold text-accent-cyan">{Math.round(progress)}%</div>
          <div className="text-2xs text-text-muted uppercase tracking-wider">Overall Progress</div>
        </div>
      </div>

      {/* Main progress bar */}
      <Panel className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Activity size={18} className="text-accent-cyan animate-pulse" />
          <div className="flex-1">
            <div className="text-sm text-text-primary font-medium">
              {currentStage ? `Processing: ${currentStage.name}` : 'Analysis complete'}
            </div>
            <div className="text-2xs text-text-secondary mt-0.5">
              {completedCount} of {stages.length} stages completed
            </div>
          </div>
          <div className="flex items-center gap-2 text-2xs text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Live analysis in progress</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-bg-base rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan-dim to-accent-cyan rounded-full transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 shimmer-bg animate-shimmer" />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-6">
        {/* Pipeline */}
        <Panel title="Forensic Processing Pipeline" subtitle="Multiple independent signal analysis" className="col-span-2">
          <div className="p-5">
            <div className="space-y-1">
              {stages.map((stage, i) => {
                const Icon = STAGE_ICONS[stage.status];
                const isComplete = stage.status === 'completed';
                const isActive = stage.status === 'analyzing' || stage.status === 'checking';
                const isLast = i === stages.length - 1;
                return (
                  <div key={stage.name}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all',
                        isActive && 'bg-accent-cyan/5 border border-accent-cyan/20',
                        !isActive && 'border border-transparent'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                        isComplete && 'bg-success/15',
                        isActive && 'bg-accent-cyan/15',
                        !isComplete && !isActive && 'bg-bg-base'
                      )}>
                        <Icon
                          size={14}
                          className={cn(
                            isComplete && 'text-success',
                            isActive && 'text-accent-cyan animate-spin-slow',
                            !isComplete && !isActive && 'text-text-muted'
                          )}
                        />
                      </div>
                      <span className={cn(
                        'text-sm font-medium flex-1',
                        isComplete ? 'text-text-primary' : isActive ? 'text-accent-cyan' : 'text-text-muted'
                      )}>
                        {stage.name}
                      </span>
                      <span className={cn(
                        'text-2xs uppercase tracking-wider font-medium',
                        isComplete ? 'text-success' : isActive ? 'text-accent-cyan' : 'text-text-muted'
                      )}>
                        {stageLabels[stage.status]}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={cn('ml-[22px] h-4 w-px', isComplete ? 'bg-success/30' : 'bg-border')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        {/* Technical metadata */}
        <div className="space-y-6">
          <Panel title="Technical Metadata" className="p-5">
            <div className="space-y-3">
              {[
                { label: 'Duration', value: CASE.duration },
                { label: 'Resolution', value: CASE.resolution },
                { label: 'Frame Rate', value: CASE.frameRate },
                { label: 'Codec', value: CASE.codec },
                { label: 'Audio', value: CASE.audioCodec },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-2xs uppercase tracking-wider text-text-secondary">{item.label}</span>
                  <span className="font-mono text-xs text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Integrity Hash" className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint size={14} className="text-success" />
              <span className="text-2xs uppercase tracking-wider text-success font-medium">SHA-256 Verified</span>
            </div>
            <div className="font-mono text-2xs text-text-secondary break-all bg-bg-base p-2 rounded border border-border-subtle">
              {CASE.sha256}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Film size={14} className="text-accent-cyan" />
              <span className="text-xs font-medium text-text-primary">Media File</span>
            </div>
            <div className="text-sm text-text-primary font-mono">{CASE.filename}</div>
            <div className="text-2xs text-text-muted mt-1">Ingested and fingerprinted</div>
          </Panel>
        </div>
      </div>

      {/* Info banner */}
      <Panel className="p-4 bg-bg-surface border-accent-cyan/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-cyan/10 flex items-center justify-center shrink-0">
            <Activity size={16} className="text-accent-cyan" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-text-primary">
              SpectraX combines multiple independent forensic signals — visual, temporal, audio, A/V sync, and provenance — into an auditable evidence case.
            </div>
            <div className="text-2xs text-text-secondary mt-0.5">
              No single neural network score. Every finding is traceable, reproducible, and auditable.
            </div>
          </div>
        </div>
      </Panel>

      {progress >= 100 && (
        <div className="flex justify-center pb-6 animate-fade-in">
          <Button onClick={() => onNavigate('case-overview')} icon={<ArrowRight size={16} />}>
            Analysis Complete — View Results
          </Button>
        </div>
      )}
    </div>
  );
}
