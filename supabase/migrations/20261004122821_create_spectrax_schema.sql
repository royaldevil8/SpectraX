/*
# SpectraX Forensics Platform — Core Schema

## Overview
Creates the complete database schema for the SpectraX multimodal AI forensics
investigation platform. This supports cases, media assets, evidence signals,
timeline intervals, audit logs, and generated forensic reports.

## New Tables

1. **cases** — Forensic investigation cases
   - id (text, primary key, e.g. "CASE 0427")
   - title (text, case title)
   - type (text, investigation type: Fraud, Security Incident, etc.)
   - risk (text, risk level: low, medium, high, review)
   - risk_score (numeric, calibrated risk 0.0–1.0)
   - status (text, case status: under-review, completed, draft, etc.)
   - description (text, case description)
   - signals_count (int, number of evidence signals)
   - created_at (timestamp)
   - updated_at (text, human-readable last update)

2. **media_assets** — Media files under investigation
   - id (uuid, primary key)
   - case_id (text, foreign key to cases)
   - filename (text, original filename)
   - duration (text, media duration)
   - resolution (text, video resolution)
   - frame_rate (text, frames per second)
   - video_codec (text, video codec)
   - audio_codec (text, audio codec)
   - sha256 (text, integrity hash)
   - frame_count (int, total frames)
   - created_at (timestamp)

3. **evidence_signals** — Individual forensic signal results
   - id (uuid, primary key)
   - case_id (text, foreign key to cases)
   - signal_type (text: visual, temporal, audio, av-sync, provenance)
   - label (text, display label)
   - score (numeric, 0.0–1.0)
   - status (text: suspicious, review, clean, strong-mismatch, unavailable)
   - findings (int, number of findings)
   - confidence (int, confidence percentage)
   - model_name (text, AI model used)
   - model_version (text, model version)
   - explanation (text, forensic explanation)
   - created_at (timestamp)

4. **timeline_intervals** — Suspicious intervals on the media timeline
   - id (uuid, primary key)
   - case_id (text, foreign key to cases)
   - start_time (text, start timestamp)
   - end_time (text, end timestamp)
   - label (text, description of the interval)
   - signal_type (text, which signal flagged it)
   - severity (text: high, medium, low)
   - created_at (timestamp)

5. **audit_logs** — Audit trail entries for each case
   - id (uuid, primary key)
   - case_id (text, foreign key to cases)
   - timestamp (text, event time)
   - event (text, description of what happened)
   - created_at (timestamp)

6. **reports** — Generated forensic reports
   - id (uuid, primary key)
   - case_id (text, foreign key to cases)
   - title (text, report title)
   - risk (text, risk level at time of report)
   - format (text, file format)
   - generated_at (text, human-readable generation time)
   - created_at (timestamp)

## Security
- RLS enabled on ALL tables.
- Policies allow anon + authenticated CRUD (single-tenant prototype, data is intentionally shared).
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

## Notes
1. All foreign keys use ON DELETE CASCADE so deleting a case removes its evidence, timeline, audit logs, and reports.
2. Indexes added on case_id for all child tables for fast lookups.
3. Demo data will be seeded in a separate migration.
*/

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id text PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Media Verification',
  risk text NOT NULL DEFAULT 'low',
  risk_score numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  description text,
  signals_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at text
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cases" ON cases;
CREATE POLICY "anon_select_cases" ON cases FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cases" ON cases;
CREATE POLICY "anon_insert_cases" ON cases FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cases" ON cases;
CREATE POLICY "anon_update_cases" ON cases FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cases" ON cases;
CREATE POLICY "anon_delete_cases" ON cases FOR DELETE
TO anon, authenticated USING (true);

-- Media assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  filename text NOT NULL,
  duration text,
  resolution text,
  frame_rate text,
  video_codec text,
  audio_codec text,
  sha256 text,
  frame_count int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_media" ON media_assets;
CREATE POLICY "anon_select_media" ON media_assets FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_media" ON media_assets;
CREATE POLICY "anon_insert_media" ON media_assets FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_media" ON media_assets;
CREATE POLICY "anon_update_media" ON media_assets FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_media" ON media_assets;
CREATE POLICY "anon_delete_media" ON media_assets FOR DELETE
TO anon, authenticated USING (true);

-- Evidence signals table
CREATE TABLE IF NOT EXISTS evidence_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  label text NOT NULL,
  score numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'clean',
  findings int NOT NULL DEFAULT 0,
  confidence int NOT NULL DEFAULT 0,
  model_name text,
  model_version text,
  explanation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evidence_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_signals" ON evidence_signals;
CREATE POLICY "anon_select_signals" ON evidence_signals FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_signals" ON evidence_signals;
CREATE POLICY "anon_insert_signals" ON evidence_signals FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_signals" ON evidence_signals;
CREATE POLICY "anon_update_signals" ON evidence_signals FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_signals" ON evidence_signals;
CREATE POLICY "anon_delete_signals" ON evidence_signals FOR DELETE
TO anon, authenticated USING (true);

-- Timeline intervals table
CREATE TABLE IF NOT EXISTS timeline_intervals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  start_time text NOT NULL,
  end_time text NOT NULL,
  label text NOT NULL,
  signal_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_intervals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_timeline" ON timeline_intervals;
CREATE POLICY "anon_select_timeline" ON timeline_intervals FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_timeline" ON timeline_intervals;
CREATE POLICY "anon_insert_timeline" ON timeline_intervals FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_timeline" ON timeline_intervals;
CREATE POLICY "anon_update_timeline" ON timeline_intervals FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_timeline" ON timeline_intervals;
CREATE POLICY "anon_delete_timeline" ON timeline_intervals FOR DELETE
TO anon, authenticated USING (true);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  timestamp text NOT NULL,
  event text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit" ON audit_logs;
CREATE POLICY "anon_select_audit" ON audit_logs FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit" ON audit_logs;
CREATE POLICY "anon_insert_audit" ON audit_logs FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit" ON audit_logs;
CREATE POLICY "anon_update_audit" ON audit_logs FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit" ON audit_logs;
CREATE POLICY "anon_delete_audit" ON audit_logs FOR DELETE
TO anon, authenticated USING (true);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title text NOT NULL,
  risk text NOT NULL DEFAULT 'low',
  format text NOT NULL DEFAULT 'PDF',
  generated_at text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_assets_case_id ON media_assets(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_signals_case_id ON evidence_signals(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_intervals_case_id ON timeline_intervals(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_id ON audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_case_id ON reports(case_id);
