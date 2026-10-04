import { useState } from 'react';
import { RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';
import { REPORT_SECTIONS, FUSION_RATIONALE } from '@/data';
import type { Screen, CaseRecord, EvidenceSignal } from '@/types';
import {
  ChevronLeft,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  Fingerprint,
  ScanLine,
  Clock,
  Waves,
  AudioLines,
  Calendar,
  Building2,
} from 'lucide-react';

export function ReportScreen({
  onNavigate,
  onDownload,
  primaryCase,
  evidenceSignals,
  auditLogs,
}: {
  onNavigate: (s: Screen) => void;
  onDownload: () => void;
  primaryCase: CaseRecord;
  evidenceSignals: EvidenceSignal[];
  auditLogs: { timestamp: string; event: string }[];
}) {
  const CASE = primaryCase;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    onDownload();
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('case-overview')} className="text-text-secondary hover:text-text-primary transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Forensic Report</h1>
            <p className="text-sm text-text-secondary">
              <span className="font-mono text-accent-cyan">{CASE.id}</span> — Generated report preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => onNavigate('case-overview')}>Back to Case</Button>
          <Button variant="secondary" icon={<Share2 size={15} />}>Share Securely</Button>
          <Button onClick={handleDownload} icon={downloading ? <CheckCircle2 size={15} /> : <Download size={15} />}>
            {downloading ? 'Downloaded' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* Report document */}
      <div className="bg-bg-surface border border-border rounded-lg overflow-hidden max-w-4xl mx-auto">
        {/* Report header */}
        <div className="bg-bg-deep border-b border-border px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" />
            <div className="text-right">
              <div className="text-2xs uppercase tracking-wider text-text-muted">Generated</div>
              <div className="text-xs font-mono text-text-secondary">Oct 04, 2026 · 09:24 UTC</div>
            </div>
          </div>
          <div className="text-center py-4">
            <div className="text-xs uppercase tracking-[0.2em] text-text-muted mb-1">SPECTRAX</div>
            <div className="text-xl font-bold text-text-primary">FORENSIC MEDIA ANALYSIS</div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Case</span>
              <span className="font-mono text-sm text-accent-cyan">{CASE.id}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Risk</span>
              <RiskBadge risk={CASE.risk} />
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wider text-text-muted">Score</span>
              <span className="font-mono text-sm text-danger">{CASE.riskScore.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="p-8 space-y-6">
          {/* Subject */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-muted mb-1">Subject</div>
              <div className="text-sm text-text-primary">{CASE.title}</div>
            </div>
            <div>
              <div className="text-2xs uppercase tracking-wider text-text-muted mb-1">Investigation Type</div>
              <div className="text-sm text-text-primary">{CASE.type}</div>
            </div>
          </div>

          {/* Sections table of contents */}
          <div>
            <div className="text-2xs uppercase tracking-wider text-text-muted mb-3 font-medium">Report Sections</div>
            <div className="grid grid-cols-2 gap-1">
              {REPORT_SECTIONS.map((section) => (
                <div key={section} className="flex items-center gap-2 py-1.5 px-2 text-xs text-text-secondary hover:bg-bg-hover rounded transition-colors cursor-pointer">
                  <FileText size={12} className="text-text-muted" />
                  {section}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Executive Summary */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">1. Executive Summary</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Forensic analysis of <span className="font-mono text-text-primary">{CASE.filename}</span> indicates elevated manipulation risk (score: <span className="text-danger font-mono">{CASE.riskScore.toFixed(2)}</span>). Evidence indicates elevated manipulation risk based on 4 independent forensic signals. The assessment is evidence-weighted and should not be treated as proof of manipulation. Key findings include visual artifacts concentrated around the facial region and significant audio–visual timing inconsistencies.
            </p>
          </div>

          {/* Section: Media Integrity */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">2. Media Integrity</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Fingerprint size={14} className="text-success" />
                <span className="text-text-secondary">SHA-256:</span>
                <span className="font-mono text-success">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                <span className="text-text-secondary">Container:</span>
                <span className="font-mono text-text-primary">MP4 — Valid</span>
              </div>
            </div>
            <div className="mt-2 font-mono text-2xs text-text-muted bg-bg-base p-2 rounded border border-border-subtle break-all">
              {CASE.sha256}
            </div>
          </div>

          {/* Section: Visual Findings */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">3. Visual Findings</h3>
            <div className="flex items-start gap-4">
              {/* Frame thumbnail */}
              <div className="w-32 aspect-video bg-bg-base rounded border border-border overflow-hidden shrink-0 relative bg-grid-fine">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-14 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-bg-elevated to-bg-deep rounded-t-full opacity-60" />
                    <div className="absolute -inset-1 border border-accent-cyan rounded" />
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-6 heatmap-gradient rounded-full blur-sm" />
                  </div>
                </div>
                <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-bg-base/80 text-2xs font-mono text-text-primary rounded">
                  F:{CASE.frame} · {CASE.timestamp}
                </div>
              </div>
              <div className="flex-1 text-xs text-text-secondary leading-relaxed">
                <div className="flex items-center gap-2 mb-1">
                  <ScanLine size={13} className="text-accent-cyan" />
                  <span className="text-text-primary font-medium">Visual Artifact — Confidence: 84%</span>
                </div>
                <p>Model attribution is concentrated around the facial region. Suspicious frame at <span className="font-mono text-text-primary">{CASE.timestamp}</span> (Frame {CASE.frame}).</p>
                <div className="mt-2 text-2xs text-text-muted font-mono">
                  Evidence ID: EV-0427-V-001 · Model: xception-v1
                </div>
              </div>
            </div>
          </div>

          {/* Section: Temporal */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">4. Temporal Findings</h3>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={13} className="text-warning" />
              <span className="text-xs text-text-primary font-medium">Temporal Inconsistency — Confidence: 69%</span>
            </div>
            <p className="text-xs text-text-secondary">Multiple suspicious intervals identified across the media timeline indicating potential frame-level manipulation.</p>
            <div className="mt-1 text-2xs text-text-muted font-mono">Evidence ID: EV-0427-T-001</div>
          </div>

          {/* Section: Audio */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">5. Audio Findings</h3>
            <div className="flex items-center gap-2 mb-1">
              <Waves size={13} className="text-accent-cyan" />
              <span className="text-xs text-text-primary font-medium">Audio Anomaly — Confidence: 61% — Requires Review</span>
            </div>
            <p className="text-xs text-text-secondary">Audio analysis detected anomalies requiring analyst review. Findings are not independently conclusive.</p>
            <div className="mt-1 text-2xs text-text-muted font-mono">Evidence ID: EV-0427-A-001</div>
          </div>

          {/* Section: A/V Sync */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">6. Audio–Visual Synchronization</h3>
            <div className="flex items-center gap-2 mb-1">
              <AudioLines size={13} className="text-danger" />
              <span className="text-xs text-text-primary font-medium">Strong Mismatch — Confidence: 88%</span>
            </div>
            <p className="text-xs text-text-secondary">Significant audio–visual timing inconsistency detected. Lip movement does not align with audio track at multiple intervals.</p>
            <div className="mt-1 text-2xs text-text-muted font-mono">Evidence ID: EV-0427-AV-001</div>
          </div>

          {/* Section: Provenance */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">7. Provenance / C2PA</h3>
            <p className="text-xs text-text-secondary">
              No provenance credential was found. Missing provenance is not proof of manipulation. SHA-256 integrity verified.
            </p>
          </div>

          {/* Section: Evidence Fusion */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">8. Evidence Fusion</h3>
            <div className="space-y-2 mb-3">
              {evidenceSignals.map((sig) => (
                <div key={sig.type} className="flex items-center gap-3">
                  <span className="text-2xs uppercase tracking-wider text-text-secondary w-16">{sig.label}</span>
                  <div className="flex-1 h-3 bg-bg-base rounded overflow-hidden">
                    <div
                      className={`h-full ${sig.score >= 0.75 ? 'bg-danger' : sig.score >= 0.5 ? 'bg-warning' : 'bg-success'} transition-all duration-500`}
                      style={{ width: `${sig.score * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-2xs text-text-primary w-10 text-right">{(sig.score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">{FUSION_RATIONALE}</p>
          </div>

          {/* Section: Risk Assessment */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">9. Risk Assessment</h3>
            <div className="flex items-center gap-4 p-3 bg-bg-base border border-danger/30 rounded-md">
              <div className="font-mono text-2xl font-bold text-danger">{CASE.riskScore.toFixed(2)}</div>
              <div>
                <RiskBadge risk={CASE.risk} size="md" />
                <p className="text-2xs text-text-secondary mt-1">Calibrated assessment — 4 supporting signals, 0 contradicting</p>
              </div>
            </div>
          </div>

          {/* Section: Audit Trail */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">10. Audit Trail</h3>
            <div className="space-y-1.5 text-2xs font-mono text-text-secondary">
              {(auditLogs.length > 0 ? auditLogs : [
                { timestamp: '09:12:03', event: 'Case created by analyst' },
                { timestamp: '09:12:15', event: 'Media ingested — SHA-256 computed' },
                { timestamp: '09:12:48', event: 'Frame extraction completed (1260 frames)' },
                { timestamp: '09:13:22', event: 'Visual forensics — xception-v1' },
                { timestamp: '09:13:55', event: 'Temporal forensics completed' },
                { timestamp: '09:14:12', event: 'Audio forensics completed' },
                { timestamp: '09:14:33', event: 'A/V synchronization analysis completed' },
                { timestamp: '09:14:51', event: 'Provenance inspection — no C2PA found' },
                { timestamp: '09:15:08', event: 'Evidence fusion completed' },
                { timestamp: '09:15:22', event: 'Risk assessment generated: 0.78 HIGH' },
                { timestamp: '09:24:00', event: 'Report generated' },
              ]).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-0.5">
                  <span className="text-text-muted">{entry.timestamp}</span>
                  <span className="text-text-secondary">{entry.event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Analyst Notes */}
          <div className="pt-4 border-t border-border-subtle">
            <h3 className="text-sm font-semibold text-text-primary mb-2">11. Analyst Notes</h3>
            <div className="bg-bg-base border border-border-subtle rounded p-3 min-h-[60px]">
              <p className="text-xs text-text-muted italic">No analyst notes recorded. Case is under review.</p>
            </div>
          </div>
        </div>

        {/* Report footer */}
        <div className="bg-bg-deep border-t border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Building2 size={12} />
            <span>SpectraX Forensic Platform · Confidential</span>
          </div>
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <Calendar size={12} />
            <span className="font-mono">Oct 04, 2026 · Report ID: RPT-0427-001</span>
          </div>
        </div>
      </div>
    </div>
  );
}
