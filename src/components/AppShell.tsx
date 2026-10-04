import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderSearch,
  FileText,
  ScanLine,
  Shield,
  Bell,
  Search,
  CircleDot,
} from 'lucide-react';
import { Logo } from './Logo';
import type { Screen } from '@/types';

const NAV_ITEMS: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FolderSearch },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'evidence', label: 'Evidence', icon: ScanLine },
];

export function Sidebar({
  current,
  onNavigate,
  inCase,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
  inCase: boolean;
}) {
  const isActive = (id: Screen) => {
    if (inCase) {
      if (['case-overview', 'evidence', 'timeline', 'provenance', 'evidence-fusion', 'report', 'analysis'].includes(current)) {
        return id === 'cases';
      }
    }
    return current === id;
  };

  return (
    <aside className="w-60 shrink-0 h-screen bg-bg-deep border-r border-border flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-border-subtle">
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <div className="px-3 pb-2 text-2xs uppercase tracking-wider text-text-muted font-medium">
          Investigation
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-all relative group',
                active
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-cyan rounded-r" />
              )}
              <item.icon size={16} strokeWidth={2} className={active ? 'text-accent-cyan' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <div className="bg-bg-surface border border-border rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <CircleDot size={14} className="text-success animate-pulse-slow" />
            <span className="text-2xs uppercase tracking-wider text-text-secondary font-medium">System Status</span>
          </div>
          <div className="text-xs text-text-primary">AI Engines Operational</div>
          <div className="text-2xs text-text-muted mt-0.5 font-mono">v2.4.1 — All systems nominal</div>
        </div>
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-border-subtle">
        <button onClick={() => onNavigate('dashboard')} className="w-full">
          <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-bg-hover transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-accent-cyan" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-medium text-text-primary truncate">Analyst</div>
              <div className="text-2xs text-text-muted truncate">Security Operations</div>
            </div>
          </div>
        </button>
        <div className="px-2 mt-2">
          <div className="text-2xs text-text-muted">Settings</div>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({
  search,
  onSearch,
  caseContext,
  onSearchFocus,
}: {
  search: string;
  onSearch: (v: string) => void;
  caseContext?: string;
  onSearchFocus?: () => void;
}) {
  return (
    <header className="h-14 shrink-0 bg-bg-deep border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        {caseContext && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Case</span>
            <span className="font-mono text-accent-cyan font-medium">{caseContext}</span>
          </div>
        )}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={onSearchFocus}
            placeholder="Search cases, evidence, hashes..."
            className="w-full h-9 bg-bg-surface border border-border rounded-md pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full" />
        </button>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center">
            <Shield size={14} className="text-accent-cyan" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-text-primary">Analyst</div>
            <div className="text-2xs text-text-muted">Security Ops</div>
          </div>
        </div>
      </div>
    </header>
  );
}
