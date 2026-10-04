import { useState } from 'react';
import { Sidebar, TopBar } from '@/components/AppShell';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { LoginScreen } from '@/screens/LoginScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { NewInvestigationScreen } from '@/screens/NewInvestigationScreen';
import { AnalysisScreen } from '@/screens/AnalysisScreen';
import { CaseOverviewScreen } from '@/screens/CaseOverviewScreen';
import { EvidenceScreen } from '@/screens/EvidenceScreen';
import { TimelineScreen } from '@/screens/TimelineScreen';
import { ProvenanceScreen } from '@/screens/ProvenanceScreen';
import { EvidenceFusionScreen } from '@/screens/EvidenceFusionScreen';
import { ReportScreen } from '@/screens/ReportScreen';
import { CasesScreen } from '@/screens/CasesScreen';
import { ReportsScreen } from '@/screens/ReportsScreen';
import { useForensicData } from '@/hooks/useForensicData';
import type { Screen } from '@/types';

function App() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [search, setSearch] = useState('');
  const { toasts, showToast, closeToast } = useToast();
  const {
    cases,
    primaryCase,
    evidenceSignals,
    timelineIntervals,
    reports,
    auditLogs,
    loading,
    connected,
  } = useForensicData();

  const navigate = (s: Screen) => {
    setScreen(s);
  };

  const handleLogin = () => {
    setAuthed(true);
    setScreen('dashboard');
    showToast(
      connected ? 'Connected to forensic database' : 'Welcome to SpectraX forensic workspace',
      'success'
    );
  };

  const handleStartInvestigation = () => {
    setScreen('analysis');
    showToast('Investigation started — forensic analysis in progress', 'info');
  };

  const handleDownload = () => {
    showToast('Report downloaded as SpectraX_Forensic_Report.pdf', 'success');
  };

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const caseScreens: Screen[] = ['case-overview', 'evidence', 'timeline', 'provenance', 'evidence-fusion', 'report', 'analysis'];
  const inCase = caseScreens.includes(screen);
  const caseContext = inCase ? primaryCase.id : undefined;

  return (
    <div className="flex h-screen bg-bg-base overflow-hidden">
      <Sidebar current={screen} onNavigate={navigate} inCase={inCase} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          search={search}
          onSearch={setSearch}
          caseContext={caseContext}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {screen === 'dashboard' && (
            <DashboardScreen onNavigate={navigate} cases={cases} evidenceSignals={evidenceSignals} loading={loading} connected={connected} />
          )}
          {screen === 'new-investigation' && (
            <NewInvestigationScreen onNavigate={navigate} onStart={handleStartInvestigation} />
          )}
          {screen === 'analysis' && <AnalysisScreen onNavigate={navigate} primaryCase={primaryCase} />}
          {screen === 'case-overview' && (
            <CaseOverviewScreen onNavigate={navigate} primaryCase={primaryCase} evidenceSignals={evidenceSignals} auditLogs={auditLogs} />
          )}
          {screen === 'evidence' && (
            <EvidenceScreen onNavigate={navigate} primaryCase={primaryCase} evidenceSignals={evidenceSignals} />
          )}
          {screen === 'timeline' && (
            <TimelineScreen onNavigate={navigate} primaryCase={primaryCase} timelineIntervals={timelineIntervals} />
          )}
          {screen === 'provenance' && (
            <ProvenanceScreen onNavigate={navigate} primaryCase={primaryCase} />
          )}
          {screen === 'evidence-fusion' && (
            <EvidenceFusionScreen onNavigate={navigate} primaryCase={primaryCase} evidenceSignals={evidenceSignals} />
          )}
          {screen === 'report' && (
            <ReportScreen onNavigate={navigate} onDownload={handleDownload} primaryCase={primaryCase} evidenceSignals={evidenceSignals} auditLogs={auditLogs} />
          )}
          {screen === 'cases' && <CasesScreen onNavigate={navigate} cases={cases} />}
          {screen === 'reports' && <ReportsScreen onNavigate={navigate} onDownload={handleDownload} reports={reports} />}
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}

export default App;
