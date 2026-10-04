/*
# Seed SpectraX Demo Data

## Overview
Populates all tables with realistic forensic demo data for the SpectraX prototype.
This includes 8 investigation cases, media assets, evidence signals, timeline
intervals, audit logs, and generated reports.

## Data Inserted
1. **cases** — 8 cases (CASE 0420–0427) with varying risk levels and statuses
2. **media_assets** — Media file details for the primary case (CASE 0427)
3. **evidence_signals** — 4 forensic signals for CASE 0427 (visual, temporal, audio, av-sync)
4. **timeline_intervals** — 4 suspicious intervals for CASE 0427
5. **audit_logs** — 11 audit trail entries for CASE 0427
6. **reports** — 5 generated forensic reports

## Notes
1. All data is DEMO/ILLUSTRATIVE — not scientifically validated real-world performance.
2. Primary demo case is CASE 0427 with risk score 0.78 (HIGH).
3. Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe.
*/

-- Cases
INSERT INTO cases (id, title, type, risk, risk_score, status, description, signals_count, created_at, updated_at) VALUES
('CASE 0427', 'Executive Communication Verification', 'Media Verification', 'high', 0.78, 'under-review', 'Potentially manipulated executive video received by internal security team.', 4, '2026-10-04T09:12:00Z', '8 min ago'),
('CASE 0426', 'Voice Impersonation Review', 'Fraud', 'medium', 0.52, 'completed', 'Voice impersonation detected in executive phone call recording.', 3, '2026-10-03T10:00:00Z', '32 min ago'),
('CASE 0425', 'Newsroom Authenticity Check', 'Media Verification', 'low', 0.21, 'completed', 'News clip verification for editorial integrity.', 2, '2026-10-02T14:00:00Z', '1 hr ago'),
('CASE 0424', 'Financial Statement Video', 'Security Incident', 'high', 0.84, 'under-review', 'Potentially manipulated financial statement video leaked to media.', 5, '2026-10-01T08:00:00Z', '2 hr ago'),
('CASE 0423', 'Onboarding KYC Verification', 'Trust & Safety', 'medium', 0.45, 'completed', 'KYC video verification with suspected synthetic identity.', 3, '2026-09-30T11:00:00Z', '5 hr ago'),
('CASE 0422', 'Press Conference Authenticity', 'Forensic Review', 'low', 0.15, 'completed', 'Press conference video authenticity verification.', 2, '2026-09-29T16:00:00Z', '1 day ago'),
('CASE 0421', 'Social Media Evidence Review', 'Trust & Safety', 'review', 0.58, 'under-review', 'Social media video evidence requiring authenticity verification.', 4, '2026-09-28T09:00:00Z', '1 day ago'),
('CASE 0420', 'Executive Board Leak Video', 'Security Incident', 'medium', 0.49, 'completed', 'Board meeting video leaked — verifying authenticity.', 3, '2026-09-27T13:00:00Z', '2 days ago')
ON CONFLICT (id) DO NOTHING;

-- Media asset for CASE 0427
INSERT INTO media_assets (case_id, filename, duration, resolution, frame_rate, video_codec, audio_codec, sha256, frame_count) VALUES
('CASE 0427', 'executive_message.mp4', '00:42.3', '1920 × 1080', '30 FPS', 'H.264', 'AAC', '8e9f31d9b8a4c6e9f7b4d1a8c2f9e73d1b0a2e8c4f6d9a1b7c3e5f8d2a91a71c', 1260)
ON CONFLICT DO NOTHING;

-- Evidence signals for CASE 0427
INSERT INTO evidence_signals (case_id, signal_type, label, score, status, findings, confidence, model_name, model_version, explanation) VALUES
('CASE 0427', 'visual', 'VISUAL', 0.84, 'suspicious', 3, 84, 'SpectraX Xception Visual Detector', 'xception-v1', 'Model attribution is concentrated around the facial region. Heatmap intensity indicates areas of high manipulation probability.'),
('CASE 0427', 'temporal', 'TEMPORAL', 0.69, 'suspicious', 2, 69, 'SpectraX Temporal Analyzer', 'temporal-v2', 'Multiple suspicious intervals identified across the media timeline indicating potential frame-level manipulation.'),
('CASE 0427', 'audio', 'AUDIO', 0.61, 'review', 1, 61, 'SpectraX Audio Forensics', 'audio-v1', 'Audio analysis detected anomalies requiring analyst review. Findings are not independently conclusive.'),
('CASE 0427', 'av-sync', 'A/V SYNC', 0.88, 'strong-mismatch', 2, 88, 'SpectraX AV Sync Analyzer', 'avsync-v1', 'Significant audio-visual timing inconsistency detected. Lip movement does not align with audio track at multiple intervals.')
ON CONFLICT DO NOTHING;

-- Timeline intervals for CASE 0427
INSERT INTO timeline_intervals (case_id, start_time, end_time, label, signal_type, severity) VALUES
('CASE 0427', '00:05', '00:09', 'Visual anomaly', 'visual', 'high'),
('CASE 0427', '00:12', '00:16', 'A/V mismatch', 'av-sync', 'high'),
('CASE 0427', '00:24', '00:29', 'Audio anomaly', 'audio', 'medium'),
('CASE 0427', '00:31', '00:36', 'Visual + temporal inconsistency', 'temporal', 'high')
ON CONFLICT DO NOTHING;

-- Audit logs for CASE 0427
INSERT INTO audit_logs (case_id, timestamp, event) VALUES
('CASE 0427', '09:12:03', 'Case created by analyst'),
('CASE 0427', '09:12:15', 'Media ingested — SHA-256 computed'),
('CASE 0427', '09:12:48', 'Frame extraction completed (1260 frames)'),
('CASE 0427', '09:13:22', 'Visual forensics — xception-v1'),
('CASE 0427', '09:13:55', 'Temporal forensics completed'),
('CASE 0427', '09:14:12', 'Audio forensics completed'),
('CASE 0427', '09:14:33', 'A/V synchronization analysis completed'),
('CASE 0427', '09:14:51', 'Provenance inspection — no C2PA found'),
('CASE 0427', '09:15:08', 'Evidence fusion completed'),
('CASE 0427', '09:15:22', 'Risk assessment generated: 0.78 HIGH'),
('CASE 0427', '09:24:00', 'Report generated')
ON CONFLICT DO NOTHING;

-- Reports
INSERT INTO reports (case_id, title, risk, format, generated_at) VALUES
('CASE 0427', 'Forensic Media Analysis', 'high', 'PDF', '4 min ago'),
('CASE 0426', 'Voice Investigation', 'medium', 'PDF', '1 hr ago'),
('CASE 0425', 'Newsroom Verification', 'low', 'PDF', '3 hr ago'),
('CASE 0424', 'Financial Statement Video', 'high', 'PDF', '6 hr ago'),
('CASE 0423', 'KYC Verification Review', 'medium', 'PDF', '1 day ago')
ON CONFLICT DO NOTHING;
