import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfidenceMeter } from '@/components/ui/Gauges';
import type { Screen, CaseRecord, EvidenceSignal } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Flag,
  Bookmark,
  Maximize2,
  Layers,
  ScanLine,
  Clock,
  Waves,
  AudioLines,
} from 'lucide-react';

export function EvidenceScreen({
  onNavigate,
  primaryCase,
  evidenceSignals,
}: {
  onNavigate: (s: Screen) => void;
  primaryCase: CaseRecord;
  evidenceSignals: EvidenceSignal[];
}) {
  const CASE = primaryCase;
  const [frame, setFrame] = useState(182);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const relatedSignals = [
    { label: 'A/V mismatch', value: 88, icon: AudioLines },
    { label: 'Temporal inconsistency', value: 69, icon: Clock },
    { label: 'Audio anomaly', value: 61, icon: Waves },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('case-overview')} className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidence</h1>
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-accent-cyan">{CASE.id}</span> — Forensic evidence workspace
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Frame viewer */}
        <div className="col-span-2 space-y-4">
          <Panel
            title="Frame Viewer"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-2.5 h-7 rounded text-2xs font-medium border transition-all flex items-center gap-1.5 ${
                    showHeatmap ? 'bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan' : 'bg-bg-base border-border text-text-secondary'
                  }`}
                >
                  <Layers size={11} /> Heatmap
                </button>
                <button className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
                  <Maximize2 size={13} />
                </button>
              </div>
            }
          >
            <div className="p-4">
              {/* Video frame mockup */}
              <div className="relative aspect-video bg-bg-base rounded-md overflow-hidden border border-border bg-grid-fine">
                {/* Simulated video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 relative">
                    {/* Simulated face silhouette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-bg-elevated via-bg-surface to-bg-deep rounded-t-full opacity-60" />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-40 bg-gradient-to-b from-bg-hover to-bg-surface rounded-t-[60%] opacity-80" />

                    {/* Bounding box */}
                    <div className="absolute -inset-3 border-2 border-accent-cyan rounded-md">
                      <div className="absolute -top-6 left-0 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-accent-cyan text-bg-base text-2xs font-mono font-bold rounded-sm">
                          FACE DETECTED
                        </span>
                      </div>
                      {/* Corner markers */}
                      {['-top-px -left-px', '-top-px -right-px', '-bottom-px -left-px', '-bottom-px -right-px'].map((pos, i) => (
                        <div key={i} className={`absolute ${pos} w-2 h-2 border-accent-cyan`}
                          style={{
                            borderTopWidth: pos.includes('top') ? 2 : 0,
                            borderBottomWidth: pos.includes('bottom') ? 2 : 0,
                            borderLeftWidth: pos.includes('left') ? 2 : 0,
                            borderRightWidth: pos.includes('right') ? 2 : 0,
                          }}
                        />
                      ))}
                    </div>

                    {/* Heatmap overlay */}
                    {showHeatmap && (
                      <>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-32 heatmap-gradient rounded-full blur-md" />
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-20 bg-danger/30 rounded-full blur-sm" />
                      </>
                    )}
                  </div>
                </div>

                {/* Scan line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent animate-scan" />

                {/* Frame info overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-danger/20 border border-danger/40 text-danger text-2xs font-mono font-bold rounded">
                    SUSPICIOUS REGION
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-bg-base/80 border border-border text-text-primary text-2xs font-mono rounded">
                      FRAME {frame}
                    </span>
                    <span className="px-2 py-0.5 bg-bg-base/80 border border-border text-text-primary text-2xs font-mono rounded">
                      {CASE.timestamp}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-bg-base/80 border border-border text-text-muted text-2xs font-mono rounded">
                    {CASE.resolution}
                  </span>
                </div>
              </div>

              {/* Frame navigation */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFrame(Math.max(0, frame - 1))}
                    className="w-8 h-8 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex-1 relative h-2 bg-bg-base rounded-full overflow-hidden">
                    {/* Timeline scrubber */}
                    <div className="absolute inset-y-0 left-0 bg-accent-cyan/30 rounded-full" style={{ width: '43%' }} />
                    {/* Suspicious intervals */}
                    <div className="absolute top-0 bottom-0 bg-danger/50" style={{ left: '12%', width: '9.5%' }} />
                    <div className="absolute top-0 bottom-0 bg-danger/50" style={{ left: '28.5%', width: '9.5%' }} />
                    <div className="absolute top-0 bottom-0 bg-warning/50" style={{ left: '57%', width: '12%' }} />
                    <div className="absolute top-0 bottom-0 bg-danger/50" style={{ left: '73.8%', width: '12%' }} />
                    {/* Current position */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-cyan rounded-full border-2 border-bg-base glow-cyan" style={{ left: '43%' }} />
                  </div>
                  <button
                    onClick={() => setFrame(frame + 1)}
                    className="w-8 h-8 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button className="w-8 h-8 rounded-md bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                    <Play size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-2xs font-mono text-text-muted">
                  <span>00:00</span>
                  <span>Frame {frame} / 1260</span>
                  <span>{CASE.duration}</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Evidence visualization */}
          <Panel title="Evidence Distribution" subtitle="Signal contribution by evidence type">
            <div className="p-5">
              {/* Stacked evidence bars */}
              <div className="space-y-4">
                {evidenceSignals.map((sig: EvidenceSignal) => (
                  <div key={sig.type} className="flex items-center gap-3">
                    <div className="w-20 text-2xs uppercase tracking-wider text-text-secondary font-medium">
                      {sig.label}
                    </div>
                    <div className="flex-1 h-6 bg-bg-base rounded relative overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-700 ${
                          sig.score >= 0.75 ? 'bg-danger/60' : sig.score >= 0.5 ? 'bg-warning/60' : 'bg-success/60'
                        }`}
                        style={{ width: `${sig.score * 100}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-2xs text-text-primary">
                        {sig.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Evidence details */}
        <div className="space-y-4">
          <Panel title="Evidence Details" className="p-5">
            <div className="space-y-4">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-1">Evidence Type</div>
                <div className="text-sm text-text-primary flex items-center gap-2">
                  <ScanLine size={14} className="text-accent-cyan" />
                  Visual Artifact
                </div>
              </div>

              <div>
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-1">Confidence</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-text-primary">84%</span>
                  <Badge variant="red" dot>Suspicious</Badge>
                </div>
                <div className="mt-2"><ConfidenceMeter value={0.84} showValue={false} /></div>
              </div>

              <div className="pt-3 border-t border-border-subtle">
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-1">Model</div>
                <div className="text-sm text-text-primary">SpectraX Xception Visual Detector</div>
                <div className="text-2xs text-text-muted font-mono mt-0.5">Model Version: xception-v1</div>
              </div>

              <div className="pt-3 border-t border-border-subtle">
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-2">Face Detected</div>
                <Badge variant="cyan" dot>Yes — Primary subject</Badge>
              </div>

              <div className="pt-3 border-t border-border-subtle">
                <div className="text-2xs uppercase tracking-wider text-text-secondary mb-1.5">Explanation</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Model attribution is concentrated around the facial region. Heatmap intensity indicates areas of high manipulation probability.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Related Signals" className="p-5">
            <div className="space-y-3">
              {relatedSignals.map((sig) => (
                <div key={sig.label} className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('evidence-fusion')}>
                  <div className="w-7 h-7 rounded-md bg-bg-elevated flex items-center justify-center shrink-0">
                    <sig.icon size={13} className="text-text-secondary group-hover:text-accent-cyan transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary">{sig.label}</div>
                    <div className="mt-1"><ConfidenceMeter value={sig.value / 100} showValue={false} size="sm" /></div>
                  </div>
                  <span className="font-mono text-xs text-text-primary">{sig.value}%</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" icon={<Flag size={14} />}>
              Add Finding
            </Button>
            <Button variant="secondary" className="w-full" icon={<Bookmark size={14} />}>
              Mark for Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
