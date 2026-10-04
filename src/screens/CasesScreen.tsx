import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { RiskBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Screen, CaseRecord, RiskLevel, CaseStatus } from '@/types';
import {
  Plus,
  Search,
  ChevronDown,
  FolderSearch,
  Eye,
} from 'lucide-react';

export function CasesScreen({ onNavigate, cases }: { onNavigate: (s: Screen) => void; cases: CaseRecord[] }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  const filtered = cases.filter((c) => {
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (riskFilter !== 'all' && c.risk !== riskFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Cases</h1>
          <p className="text-sm text-text-secondary mt-1">All forensic investigation cases.</p>
        </div>
        <Button onClick={() => onNavigate('new-investigation')} icon={<Plus size={16} />}>New Investigation</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case ID, filename, hash..."
            className="w-full h-9 bg-bg-surface border border-border rounded-md pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors"
          />
        </div>
        <FilterDropdown label="Risk" value={riskFilter} options={['all', 'high', 'medium', 'low', 'review']} onChange={(v) => setRiskFilter(v as RiskLevel | 'all')} />
        <FilterDropdown label="Status" value={statusFilter} options={['all', 'under-review', 'completed', 'draft', 'queued', 'analyzing']} onChange={(v) => setStatusFilter(v as CaseStatus | 'all')} />
        <FilterDropdown label="Type" value="all" options={['all', 'Fraud', 'Security Incident', 'Media Verification', 'Forensic Review', 'Trust & Safety']} onChange={() => {}} />
        <FilterDropdown label="Date" value="all" options={['all', 'Today', 'This Week', 'This Month']} onChange={() => {}} />
      </div>

      {/* Table */}
      <Panel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Case</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Type</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Risk</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Status</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Signals</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Created</th>
              <th className="text-left text-2xs uppercase tracking-wider text-text-secondary font-medium px-4 py-3">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => onNavigate('case-overview')}
                className="border-b border-border-subtle last:border-0 hover:bg-bg-hover transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <div className="font-mono text-2xs text-accent-cyan mb-0.5">{c.id}</div>
                  <div className="text-sm text-text-primary">{c.title}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-text-secondary">{c.type}</span>
                </td>
                <td className="px-4 py-3"><RiskBadge risk={c.risk} /></td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs text-text-primary">{c.signals} signals</span>
                </td>
                <td className="px-4 py-3"><span className="font-mono text-xs text-text-secondary">{c.created}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-text-muted">{c.updated}</span></td>
                <td className="px-4 py-3">
                  <Eye size={14} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <FolderSearch size={32} className="text-text-muted mx-auto mb-3" />
            <div className="text-sm text-text-secondary">No cases match your filters.</div>
          </div>
        )}
      </Panel>

      <div className="text-2xs text-text-muted">
        Showing {filtered.length} of {cases.length} cases
      </div>
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-9 px-3 bg-bg-surface border border-border rounded-md text-xs text-text-secondary hover:border-border-strong transition-colors flex items-center gap-2"
      >
        <span className="uppercase tracking-wider text-2xs">{label}</span>
        <span className="text-text-primary">{value === 'all' ? 'All' : value.replace('-', ' ')}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-bg-elevated border border-border rounded-md py-1 min-w-[160px] shadow-xl">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-bg-hover transition-colors capitalize ${
                  value === opt ? 'text-accent-cyan' : 'text-text-secondary'
                }`}
              >
                {opt === 'all' ? 'All' : opt.replace('-', ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
