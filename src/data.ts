import type { CaseRecord, EvidenceSignal, TimelineInterval, PipelineStage } from './types';

export const PRIMARY_CASE: CaseRecord = {
  id: 'CASE 0427',
  title: 'Executive Communication Verification',
  type: 'Media Verification',
  risk: 'high',
  riskScore: 0.78,
  status: 'under-review',
  signals: 4,
  created: 'Oct 04, 2026',
  updated: '8 min ago',
  description: 'Potentially manipulated executive video received by internal security team.',
  filename: 'executive_message.mp4',
  duration: '00:42.3',
  resolution: '1920 × 1080',
  frameRate: '30 FPS',
  codec: 'H.264',
  audioCodec: 'AAC',
  sha256: '8e9f31d9b8a4c6e9f7b4d1a8c2f9e73d1b0a2e8c4f6d9a1b7c3e5f8d2a91a71c',
  frame: 182,
  timestamp: '00:06.07',
};

export const CASES: CaseRecord[] = [
  PRIMARY_CASE,
  {
    id: 'CASE 0426',
    title: 'Voice Impersonation Review',
    type: 'Fraud',
    risk: 'medium',
    riskScore: 0.52,
    status: 'completed',
    signals: 3,
    created: 'Oct 03, 2026',
    updated: '32 min ago',
  },
  {
    id: 'CASE 0425',
    title: 'Newsroom Authenticity Check',
    type: 'Media Verification',
    risk: 'low',
    riskScore: 0.21,
    status: 'completed',
    signals: 2,
    created: 'Oct 02, 2026',
    updated: '1 hr ago',
  },
  {
    id: 'CASE 0424',
    title: 'Financial Statement Video',
    type: 'Security Incident',
    risk: 'high',
    riskScore: 0.84,
    status: 'under-review',
    signals: 5,
    created: 'Oct 01, 2026',
    updated: '2 hr ago',
  },
  {
    id: 'CASE 0423',
    title: 'Onboarding KYC Verification',
    type: 'Trust & Safety',
    risk: 'medium',
    riskScore: 0.45,
    status: 'completed',
    signals: 3,
    created: 'Sep 30, 2026',
    updated: '5 hr ago',
  },
  {
    id: 'CASE 0422',
    title: 'Press Conference Authenticity',
    type: 'Forensic Review',
    risk: 'low',
    riskScore: 0.15,
    status: 'completed',
    signals: 2,
    created: 'Sep 29, 2026',
    updated: '1 day ago',
  },
  {
    id: 'CASE 0421',
    title: 'Social Media Evidence Review',
    type: 'Trust & Safety',
    risk: 'review',
    riskScore: 0.58,
    status: 'under-review',
    signals: 4,
    created: 'Sep 28, 2026',
    updated: '1 day ago',
  },
  {
    id: 'CASE 0420',
    title: 'Executive Board Leak Video',
    type: 'Security Incident',
    risk: 'medium',
    riskScore: 0.49,
    status: 'completed',
    signals: 3,
    created: 'Sep 27, 2026',
    updated: '2 days ago',
  },
];

export const EVIDENCE_SIGNALS: EvidenceSignal[] = [
  {
    type: 'visual',
    label: 'VISUAL',
    score: 0.84,
    status: 'suspicious',
    findings: 3,
    confidence: 84,
  },
  {
    type: 'temporal',
    label: 'TEMPORAL',
    score: 0.69,
    status: 'suspicious',
    findings: 2,
    confidence: 69,
  },
  {
    type: 'audio',
    label: 'AUDIO',
    score: 0.61,
    status: 'review',
    findings: 1,
    confidence: 61,
  },
  {
    type: 'av-sync',
    label: 'A/V SYNC',
    score: 0.88,
    status: 'strong-mismatch',
    findings: 2,
    confidence: 88,
  },
];

export const TIMELINE_INTERVALS: TimelineInterval[] = [
  { start: '00:05', end: '00:09', label: 'Visual anomaly', signal: 'visual', severity: 'high' },
  { start: '00:12', end: '00:16', label: 'A/V mismatch', signal: 'av-sync', severity: 'high' },
  { start: '00:24', end: '00:29', label: 'Audio anomaly', signal: 'audio', severity: 'medium' },
  { start: '00:31', end: '00:36', label: 'Visual + temporal inconsistency', signal: 'temporal', severity: 'high' },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  { name: 'MEDIA INGESTION', status: 'completed' },
  { name: 'SHA-256 INTEGRITY', status: 'completed' },
  { name: 'FRAME EXTRACTION', status: 'completed' },
  { name: 'VISUAL FORENSICS', status: 'analyzing' },
  { name: 'TEMPORAL FORENSICS', status: 'queued' },
  { name: 'AUDIO FORENSICS', status: 'analyzing' },
  { name: 'A/V SYNCHRONIZATION', status: 'queued' },
  { name: 'PROVENANCE / C2PA', status: 'checking' },
  { name: 'EVIDENCE FUSION', status: 'waiting' },
  { name: 'RISK ASSESSMENT', status: 'waiting' },
];

export const REPORT_SECTIONS = [
  '1. Executive Summary',
  '2. Media Integrity',
  '3. Visual Findings',
  '4. Temporal Findings',
  '5. Audio Findings',
  '6. Audio–Visual Synchronization',
  '7. Provenance / C2PA',
  '8. Evidence Fusion',
  '9. Risk Assessment',
  '10. Audit Trail',
  '11. Analyst Notes',
];

export const REPORTS_LIST = [
  { caseId: 'CASE 0427', title: 'Forensic Media Analysis', risk: 'high' as const, format: 'PDF', generated: '4 min ago' },
  { caseId: 'CASE 0426', title: 'Voice Investigation', risk: 'medium' as const, format: 'PDF', generated: '1 hr ago' },
  { caseId: 'CASE 0425', title: 'Newsroom Verification', risk: 'low' as const, format: 'PDF', generated: '3 hr ago' },
  { caseId: 'CASE 0424', title: 'Financial Statement Video', risk: 'high' as const, format: 'PDF', generated: '6 hr ago' },
  { caseId: 'CASE 0423', title: 'KYC Verification Review', risk: 'medium' as const, format: 'PDF', generated: '1 day ago' },
];

export const RISK_RANGES = [
  { label: 'LOW', min: 0, max: 0.3, color: 'success' },
  { label: 'MEDIUM', min: 0.3, max: 0.6, color: 'warning' },
  { label: 'HIGH', min: 0.6, max: 1.0, color: 'danger' },
];

export const PIPELINE_STEPS = [
  { num: '01', label: 'INPUT', desc: 'Upload media' },
  { num: '02', label: 'ANALYZE', desc: 'Forensic pipeline' },
  { num: '03', label: 'EVIDENCE', desc: 'Review signals' },
  { num: '04', label: 'REPORT', desc: 'Generate report' },
];

export const PROVENANCE_CHAIN = [
  { label: 'Original Asset', desc: 'Source media at time of creation', verified: false },
  { label: 'Uploaded Media', desc: 'executive_message.mp4', verified: true },
  { label: 'Analysis Snapshot', desc: 'SHA-256 fingerprinted copy', verified: true },
  { label: 'Evidence Record', desc: 'Multimodal signal extraction', verified: true },
  { label: 'Current Assessment', desc: 'Calibrated risk evaluation', verified: true },
];

export const FUSION_RATIONALE =
  'Elevated risk is driven primarily by facial-region visual artifacts (0.84) and strong audio–visual timing inconsistency (0.88). Temporal forensics show moderate inconsistency (0.69), while audio analysis shows anomalies requiring review (0.61). Provenance evidence is unavailable and therefore does not independently indicate fakery — missing provenance reduces confidence in authenticity but is not, by itself, evidence of manipulation.';
