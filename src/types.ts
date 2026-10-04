export type RiskLevel = 'low' | 'medium' | 'high' | 'review';
export type CaseStatus = 'under-review' | 'completed' | 'draft' | 'queued' | 'analyzing';
export type InvestigationType =
  | 'Fraud'
  | 'Security Incident'
  | 'Media Verification'
  | 'Forensic Review'
  | 'Trust & Safety';

export type SignalType = 'visual' | 'temporal' | 'audio' | 'av-sync' | 'provenance';

export interface EvidenceSignal {
  type: SignalType;
  label: string;
  score: number;
  status: 'suspicious' | 'review' | 'clean' | 'strong-mismatch' | 'unavailable';
  findings: number;
  confidence: number;
}

export interface CaseRecord {
  id: string;
  title: string;
  type: InvestigationType;
  risk: RiskLevel;
  riskScore: number;
  status: CaseStatus;
  signals: number;
  created: string;
  updated: string;
  description?: string;
  filename?: string;
  duration?: string;
  resolution?: string;
  frameRate?: string;
  codec?: string;
  audioCodec?: string;
  sha256?: string;
  frame?: number;
  timestamp?: string;
}

export interface TimelineInterval {
  start: string;
  end: string;
  label: string;
  signal: SignalType;
  severity: 'high' | 'medium' | 'low';
}

export interface PipelineStage {
  name: string;
  status: 'completed' | 'analyzing' | 'queued' | 'checking' | 'waiting';
}

export type Screen =
  | 'login'
  | 'dashboard'
  | 'new-investigation'
  | 'analysis'
  | 'case-overview'
  | 'evidence'
  | 'timeline'
  | 'provenance'
  | 'evidence-fusion'
  | 'report'
  | 'cases'
  | 'reports';

export interface NavItem {
  id: Screen;
  label: string;
  icon: string;
}
