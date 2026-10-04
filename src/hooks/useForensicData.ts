import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CASES,
  EVIDENCE_SIGNALS,
  TIMELINE_INTERVALS,
  REPORTS_LIST,
  PRIMARY_CASE,
} from '@/data';
import type { CaseRecord, EvidenceSignal, TimelineInterval } from '@/types';

interface DbCase {
  id: string;
  title: string;
  type: string;
  risk: string;
  risk_score: number;
  status: string;
  description: string | null;
  signals_count: number;
  created_at: string;
  updated_at: string | null;
}

interface DbMediaAsset {
  case_id: string;
  filename: string;
  duration: string | null;
  resolution: string | null;
  frame_rate: string | null;
  video_codec: string | null;
  audio_codec: string | null;
  sha256: string | null;
  frame_count: number | null;
}

interface DbEvidenceSignal {
  case_id: string;
  signal_type: string;
  label: string;
  score: number;
  status: string;
  findings: number;
  confidence: number;
  model_name: string | null;
  model_version: string | null;
  explanation: string | null;
}

interface DbTimelineInterval {
  case_id: string;
  start_time: string;
  end_time: string;
  label: string;
  signal_type: string;
  severity: string;
}

interface DbReport {
  case_id: string;
  title: string;
  risk: string;
  format: string;
  generated_at: string | null;
}

interface DbAuditLog {
  case_id: string;
  timestamp: string;
  event: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function mapDbCase(c: DbCase, media?: DbMediaAsset): CaseRecord {
  const base: CaseRecord = {
    id: c.id,
    title: c.title,
    type: c.type as CaseRecord['type'],
    risk: c.risk as CaseRecord['risk'],
    riskScore: Number(c.risk_score),
    status: c.status as CaseRecord['status'],
    signals: c.signals_count,
    created: formatDate(c.created_at),
    updated: c.updated_at || '',
    description: c.description || undefined,
  };
  if (media) {
    base.filename = media.filename;
    base.duration = media.duration || undefined;
    base.resolution = media.resolution || undefined;
    base.frameRate = media.frame_rate || undefined;
    base.codec = media.video_codec || undefined;
    base.audioCodec = media.audio_codec || undefined;
    base.sha256 = media.sha256 || undefined;
  }
  return base;
}

function mapDbSignal(s: DbEvidenceSignal): EvidenceSignal {
  return {
    type: s.signal_type as EvidenceSignal['type'],
    label: s.label,
    score: Number(s.score),
    status: s.status as EvidenceSignal['status'],
    findings: s.findings,
    confidence: s.confidence,
  };
}

function mapDbInterval(i: DbTimelineInterval): TimelineInterval {
  return {
    start: i.start_time,
    end: i.end_time,
    label: i.label,
    signal: i.signal_type as TimelineInterval['signal'],
    severity: i.severity as TimelineInterval['severity'],
  };
}

interface ForensicData {
  cases: CaseRecord[];
  primaryCase: CaseRecord;
  evidenceSignals: EvidenceSignal[];
  timelineIntervals: TimelineInterval[];
  reports: { caseId: string; title: string; risk: 'high' | 'medium' | 'low'; format: string; generated: string }[];
  auditLogs: { timestamp: string; event: string }[];
  loading: boolean;
  connected: boolean;
  refresh: () => void;
}

export function useForensicData(): ForensicData {
  const [cases, setCases] = useState<CaseRecord[]>(CASES);
  const [primaryCase, setPrimaryCase] = useState<CaseRecord>(PRIMARY_CASE);
  const [evidenceSignals, setEvidenceSignals] = useState<EvidenceSignal[]>(EVIDENCE_SIGNALS);
  const [timelineIntervals, setTimelineIntervals] = useState<TimelineInterval[]>(TIMELINE_INTERVALS);
  const [reports, setReports] = useState<typeof REPORTS_LIST>(REPORTS_LIST);
  const [auditLogs, setAuditLogs] = useState<{ timestamp: string; event: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [casesRes, mediaRes, signalsRes, timelineRes, reportsRes, auditRes] = await Promise.all([
          supabase.from('cases').select('*').order('created_at', { ascending: false }),
          supabase.from('media_assets').select('*'),
          supabase.from('evidence_signals').select('*').eq('case_id', 'CASE 0427'),
          supabase.from('timeline_intervals').select('*').eq('case_id', 'CASE 0427').order('start_time'),
          supabase.from('reports').select('*').order('created_at', { ascending: false }),
          supabase.from('audit_logs').select('*').eq('case_id', 'CASE 0427').order('timestamp'),
        ]);

        if (cancelled) return;

        const hasData = casesRes.data && casesRes.data.length > 0;
        if (!hasData || casesRes.error) {
          setConnected(false);
          setLoading(false);
          return;
        }

        setConnected(true);

        const mediaMap = new Map<string, DbMediaAsset>();
        (mediaRes.data as DbMediaAsset[] | null)?.forEach((m) => mediaMap.set(m.case_id, m));

        const mappedCases = (casesRes.data as DbCase[]).map((c) =>
          mapDbCase(c, mediaMap.get(c.id))
        );
        setCases(mappedCases);

        const primary = mappedCases.find((c) => c.id === 'CASE 0427') || mappedCases[0] || PRIMARY_CASE;
        setPrimaryCase(primary);

        if (signalsRes.data) {
          setEvidenceSignals((signalsRes.data as DbEvidenceSignal[]).map(mapDbSignal));
        }

        if (timelineRes.data) {
          setTimelineIntervals((timelineRes.data as DbTimelineInterval[]).map(mapDbInterval));
        }

        if (reportsRes.data) {
          setReports(
            (reportsRes.data as DbReport[]).map((r) => ({
              caseId: r.case_id,
              title: r.title,
              risk: r.risk as 'high' | 'medium' | 'low',
              format: r.format,
              generated: r.generated_at || '',
            }))
          );
        }

        if (auditRes.data) {
          setAuditLogs(
            (auditRes.data as DbAuditLog[]).map((a) => ({
              timestamp: a.timestamp,
              event: a.event,
            }))
          );
        }

        setLoading(false);
      } catch {
        if (!cancelled) {
          setConnected(false);
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return {
    cases,
    primaryCase,
    evidenceSignals,
    timelineIntervals,
    reports,
    auditLogs,
    loading,
    connected,
    refresh,
  };
}
