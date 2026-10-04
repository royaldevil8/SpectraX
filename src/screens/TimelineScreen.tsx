import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Screen, SignalType, CaseRecord, TimelineInterval } from '@/types';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ScanLine,
  Clock,
  Waves,
  AudioLines,
  GitMerge,
  ZoomIn,
} from 'lucide-react';

const SIGNAL_LANES: { type: SignalType; label: string; icon: typeof ScanLine; color: string }[] = [
  { type: 'visual', label: 'VISUAL', icon: ScanLine, color: '#FF5C6C' },
  { type: 'temporal', label: 'TEMPORAL', icon: Clock, color: '#F5B942' },
  { type: 'audio', label: 'AUDIO', icon: Waves, color: '#38D5FF' },
  { type: 'av-sync', label: 'A/V SYNC', icon: AudioLines, color: '#FF5C6C' },
  { type: 'provenance', label: 'PROVENANCE', icon: GitMerge, color: '#8FA3B8' },
];

function timeToPercent(time: string): number {
  const [min, sec] = time.split(':').map(Number);
  return ((min * 60 + sec) / 42) * 100;
}

export function TimelineScreen({
  onNavigate,
  primaryCase,
  timelineIntervals,
}: {
  onNavigate: (s: Screen) => void;
  primaryCase: CaseRecord;
  timelineIntervals: TimelineInterval[];
}) {
  const CASE = primaryCase;
  const INTERVALS = timelineIntervals;
  const [selectedInterval, setSelectedInterval] = useState(0);
  const [frame, setFrame] = useState(182);

  const handleIntervalClick = (idx: number) => {
    setSelectedInterval(idx);
    const interval = INTERVALS[idx];
    const [min, sec] = interval.start.split(':').map(Number);
    setFrame(Math.floor(((min * 60 + sec) / 42) * 1260));
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('case-overview')} className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Evidence Timeline</h1>
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-accent-cyan">{CASE.id}</span> — Suspicious intervals across media duration
          </p>
        </div>
      </div>

      {/* Frame preview */}
      <Panel className="p-4">
        <div className="flex items-center gap-4">
          {/* Mini frame preview */}
          <div className="relative w-64 aspect-video bg-bg-base rounded-md overflow-hidden border border-border bg-grid-fine shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-28 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-bg-elevated to-bg-deep rounded-t-full opacity-60" />
                <div className="absolute -inset-2 border-2 border-accent-cyan rounded">
                  <span className="absolute -top-5 left-0 px-1.5 py-0.5 bg-danger/20 border border-danger/40 text-danger text-2xs font-mono font-bold rounded-sm">
                    SUSPECT
                  </span>
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-14 heatmap-gradient rounded-full blur-sm" />
              </div>
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/50 to-transparent animate-scan" />
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-bg-base/80 border border-border text-2xs font-mono text-text-primary rounded">
              FRAME {frame}
            </div>
          </div>

          {/* Selected interval info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="red" dot>
                {INTERVALS[selectedInterval].severity === 'high' ? 'High Severity' : 'Medium Severity'}
              </Badge>
              <span className="font-mono text-sm text-text-primary">
                {INTERVALS[selectedInterval].start} — {INTERVALS[selectedInterval].end}
              </span>
            </div>
            <div className="text-lg font-medium text-text-primary mb-1">
              {INTERVALS[selectedInterval].label}
            </div>
            <div className="text-sm text-text-secondary">
              Evidence type: <span className="text-accent-cyan uppercase">{INTERVALS[selectedInterval].signal}</span>
            </div>
            <div className="text-2xs text-text-muted font-mono mt-1">
              Timestamp: {CASE.timestamp} · Frame: {frame}
            </div>
          </div>

          {/* Frame controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFrame(Math.max(0, frame - 1))}
              className="w-9 h-9 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 rounded-md bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
              <Play size={14} />
            </button>
            <button
              onClick={() => setFrame(frame + 1)}
              className="w-9 h-9 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Panel>

      {/* Main timeline */}
      <Panel title="Forensic Timeline" subtitle="00:00 — 00:42 · Multi-signal evidence lanes" action={<ZoomIn size={14} className="text-text-muted" />}>
        <div className="p-5">
          {/* Time ruler */}
          <div className="relative ml-20 mb-2">
            <div className="flex justify-between text-2xs font-mono text-text-muted">
              {['00:00', '00:07', '00:14', '00:21', '00:28', '00:35', '00:42'].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="h-px bg-border mt-1" />
          </div>

          {/* Signal lanes */}
          <div className="space-y-2">
            {SIGNAL_LANES.map((lane) => {
              const intervals = INTERVALS.filter((iv) => iv.signal === lane.type);
              return (
                <div key={lane.type} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-1.5 shrink-0">
                    <lane.icon size={12} style={{ color: lane.color }} />
                    <span className="text-2xs uppercase tracking-wider text-text-secondary font-medium">{lane.label}</span>
                  </div>
                  <div className="relative flex-1 h-8 bg-bg-base rounded border border-border-subtle overflow-hidden">
                    {/* Grid lines */}
                    {[14.3, 28.6, 42.9, 57.1, 71.4, 85.7].map((p) => (
                      <div key={p} className="absolute top-0 bottom-0 w-px bg-border-subtle" style={{ left: `${p}%` }} />
                    ))}
                    {/* Intervals */}
                    {intervals.map((iv, idx) => {
                      const start = timeToPercent(iv.start);
                      const end = timeToPercent(iv.end);
                      const globalIdx = INTERVALS.indexOf(iv);
                      const isSelected = globalIdx === selectedInterval;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleIntervalClick(globalIdx)}
                          className={cn(
                            'absolute top-1 bottom-1 rounded transition-all cursor-pointer',
                            isSelected ? 'ring-2 ring-offset-1 ring-offset-bg-surface' : 'hover:opacity-80'
                          )}
                          style={{
                            left: `${start}%`,
                            width: `${end - start}%`,
                            backgroundColor: `${lane.color}40`,
                            borderColor: lane.color,
                            borderWidth: 1,
                            ...(isSelected ? { boxShadow: `0 0 0 1px ${lane.color}` } : {}),
                          }}
                        >
                          <div className="px-1 text-2xs font-mono text-text-primary truncate" style={{ color: lane.color }}>
                            {iv.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combined suspicious intervals bar */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-20 text-2xs uppercase tracking-wider text-text-muted font-medium shrink-0">Combined</div>
              <div className="relative flex-1 h-5 bg-bg-base rounded border border-border-subtle overflow-hidden">
                {INTERVALS.map((iv, idx) => {
                  const start = timeToPercent(iv.start);
                  const end = timeToPercent(iv.end);
                  const isSelected = idx === selectedInterval;
                  const color = iv.severity === 'high' ? '#FF5C6C' : '#F5B942';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleIntervalClick(idx)}
                      className={cn(
                        'absolute top-0.5 bottom-0.5 rounded transition-all',
                        isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-90'
                      )}
                      style={{ left: `${start}%`, width: `${end - start}%`, backgroundColor: `${color}80` }}
                    >
                      <div className="px-1 text-2xs font-mono text-text-primary truncate">{iv.label}</div>
                    </button>
                  );
                })}
                {/* Playhead */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-accent-cyan" style={{ left: `${(frame / 1260) * 100}%` }}>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-accent-cyan rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Evidence density */}
      <Panel title="Evidence Density" subtitle="Finding distribution across timeline">
        <div className="p-5">
          <div className="flex items-end gap-1 h-24 ml-20">
            {Array.from({ length: 42 }).map((_, i) => {
              const inInterval = INTERVALS.some((iv) => {
                const [sm, ss] = iv.start.split(':').map(Number);
                const [em, es] = iv.end.split(':').map(Number);
                const startSec = sm * 60 + ss;
                const endSec = em * 60 + es;
                return i >= startSec && i <= endSec;
              });
              const height = inInterval ? 40 + Math.random() * 60 : 5 + Math.random() * 15;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: inInterval ? '#FF5C6C80' : '#22344A',
                  }}
                />
              );
            })}
          </div>
          <div className="ml-20 mt-2 flex justify-between text-2xs font-mono text-text-muted">
            <span>00:00</span>
            <span>00:21</span>
            <span>00:42</span>
          </div>
        </div>
      </Panel>

      {/* Action */}
      <div className="flex items-center gap-3 pb-6">
        <Button variant="secondary" onClick={() => onNavigate('evidence')} icon={<ScanLine size={16} />}>View Evidence Details</Button>
        <Button variant="secondary" onClick={() => onNavigate('evidence-fusion')} icon={<GitMerge size={16} />}>Evidence Fusion</Button>
      </div>
    </div>
  );
}
