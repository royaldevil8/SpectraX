import { Panel } from '@/components/ui/Panel';
import { Badge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Screen } from '@/types';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  FileCheck,
} from 'lucide-react';

export function ReportsScreen({
  onNavigate,
  onDownload,
  reports,
}: {
  onNavigate: (s: Screen) => void;
  onDownload: () => void;
  reports: { caseId: string; title: string; risk: 'high' | 'medium' | 'low'; format: string; generated: string }[];
}) {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
        <p className="text-sm text-text-secondary mt-1">Generated forensic reports for investigation cases.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Panel className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-accent-cyan/10 flex items-center justify-center">
            <FileText size={18} className="text-accent-cyan" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{reports.length}</div>
            <div className="text-2xs uppercase tracking-wider text-text-secondary">Total Reports</div>
          </div>
        </Panel>
        <Panel className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-success/10 flex items-center justify-center">
            <FileCheck size={18} className="text-success" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">12</div>
            <div className="text-2xs uppercase tracking-wider text-text-secondary">This Week</div>
          </div>
        </Panel>
        <Panel className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-danger/10 flex items-center justify-center">
            <FileText size={18} className="text-danger" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">{reports.filter((r) => r.risk === 'high').length}</div>
            <div className="text-2xs uppercase tracking-wider text-text-secondary">High Risk Reports</div>
          </div>
        </Panel>
        <Panel className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-warning/10 flex items-center justify-center">
            <Calendar size={18} className="text-warning" />
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary">4 min</div>
            <div className="text-2xs uppercase tracking-wider text-text-secondary">Last Generated</div>
          </div>
        </Panel>
      </div>

      {/* Reports table */}
      <Panel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Case</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Report Title</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Risk</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Format</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Generated</th>
              <th className="text-right text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.caseId} className="border-b border-border-subtle last:border-0 hover:bg-bg-hover transition-colors group">
                <td className="px-4 py-3">
                  <span className="font-mono text-2xs text-accent-cyan">{r.caseId}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-text-muted" />
                    <span className="text-sm text-text-primary">{r.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><RiskBadge risk={r.risk} /></td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">PDF</Badge>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-text-muted">{r.generated}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('report')} icon={<Eye size={13} />}>
                      Preview
                    </Button>
                    <Button variant="secondary" size="sm" onClick={onDownload} icon={<Download size={13} />}>
                      Download
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
