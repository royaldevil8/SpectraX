import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PROVENANCE_CHAIN } from '@/data';
import type { Screen, CaseRecord } from '@/types';
import {
  ChevronLeft,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  FileVideo,
  CheckCircle2,
  ArrowDown,
  Info,
} from 'lucide-react';

export function ProvenanceScreen({ onNavigate, primaryCase }: { onNavigate: (s: Screen) => void; primaryCase: CaseRecord }) {
  const CASE = primaryCase;
  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('case-overview')} className="text-text-secondary hover:text-text-primary transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Provenance & Integrity</h1>
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-accent-cyan">{CASE.id}</span> — Content credentials and chain of custody
          </p>
        </div>
      </div>

      {/* SHA-256 */}
      <Panel className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center shrink-0">
            <Fingerprint size={24} className="text-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-text-primary">SHA-256 Integrity Hash</span>
              <Badge variant="green" dot>Verified</Badge>
            </div>
            <p className="text-2xs text-text-secondary mb-2">Media integrity verified — file has not been modified since ingestion.</p>
            <div className="font-mono text-xs text-text-primary bg-bg-base p-3 rounded border border-border-subtle break-all">
              {CASE.sha256}
            </div>
          </div>
        </div>
      </Panel>

      {/* Content Credentials */}
      <Panel title="Content Credentials (C2PA)" className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-warning/10 border border-warning/30 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} className="text-warning" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-text-primary">Provenance Status</span>
              <Badge variant="amber" dot>Not Detected</Badge>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              No provenance credential was found in this media file. <span className="text-warning">Missing provenance is not proof of manipulation.</span> It reduces confidence in the ability to trace the asset's origin and edit history, but many legitimate media files lack C2PA credentials.
            </p>
            <div className="mt-3 flex items-start gap-2 text-2xs text-text-muted bg-bg-base border border-border-subtle rounded p-3">
              <Info size={12} className="shrink-0 mt-0.5 text-accent-cyan" />
              <span>C2PA (Coalition for Content Provenance and Authenticity) credentials embed cryptographically signed provenance information directly in media files. Absence of credentials is common in older content and content from non-participating platforms.</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Provenance chain */}
      <Panel title="Chain of Custody" subtitle="Asset lifecycle from upload to assessment">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {PROVENANCE_CHAIN.map((step, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center text-center max-w-[140px]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
                    step.verified
                      ? 'bg-success/10 border-success/30'
                      : 'bg-warning/10 border-warning/30'
                  }`}>
                    {step.verified ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <ShieldAlert size={18} className="text-warning" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-text-primary mt-2">{step.label}</div>
                  <div className="text-2xs text-text-muted mt-0.5">{step.desc}</div>
                  {step.verified ? (
                    <Badge variant="green" size="sm" dot className="mt-1.5">Verified</Badge>
                  ) : (
                    <Badge variant="amber" size="sm" dot className="mt-1.5">Missing</Badge>
                  )}
                </div>
                {i < PROVENANCE_CHAIN.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-2">
                    <ArrowDown size={14} className="text-border-strong rotate-[-90deg]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Technical metadata */}
      <div className="grid grid-cols-2 gap-5">
        <Panel title="Container & Codecs" className="p-5">
          <div className="space-y-3">
            {[
              { label: 'Container', value: 'MP4' },
              { label: 'Video Codec', value: CASE.codec || 'H.264' },
              { label: 'Audio Codec', value: CASE.audioCodec || 'AAC' },
              { label: 'Duration', value: CASE.duration || '00:42.3' },
              { label: 'Resolution', value: CASE.resolution || '1920 × 1080' },
              { label: 'Frame Rate', value: CASE.frameRate || '30 FPS' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1 border-b border-border-subtle last:border-0">
                <span className="text-2xs uppercase tracking-wider text-text-secondary">{item.label}</span>
                <span className="font-mono text-sm text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Integrity Verification" className="p-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-success/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-success" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-primary">SHA-256 Fingerprint</div>
                <div className="text-2xs text-text-muted">Computed at ingestion · Verified</div>
              </div>
              <Badge variant="green" dot>Match</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-success/10 flex items-center justify-center">
                <FileVideo size={16} className="text-success" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-primary">Media Container</div>
                <div className="text-2xs text-text-muted">MP4 structure valid · No corruption</div>
              </div>
              <Badge variant="green" dot>Valid</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-warning/10 flex items-center justify-center">
                <ShieldAlert size={16} className="text-warning" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-primary">C2PA Credentials</div>
                <div className="text-2xs text-text-muted">No signed manifest found</div>
              </div>
              <Badge variant="amber" dot>None</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-accent-cyan/10 flex items-center justify-center">
                <Fingerprint size={16} className="text-accent-cyan" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-primary">Analysis Snapshot</div>
                <div className="text-2xs text-text-muted">Fingerprinted copy preserved</div>
              </div>
              <Badge variant="cyan" dot>Archived</Badge>
            </div>
          </div>
        </Panel>
      </div>

      {/* Action */}
      <div className="flex items-center gap-3 pb-6">
        <Button variant="secondary" onClick={() => onNavigate('case-overview')}>Back to Case</Button>
        <Button variant="secondary" onClick={() => onNavigate('evidence-fusion')}>Evidence Fusion</Button>
      </div>
    </div>
  );
}
