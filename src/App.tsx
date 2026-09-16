import React, { useState } from 'react';
import { EarthSyncProvider, useEarthSync } from './context/EarthSyncContext';
import { SplashScreen } from './components/brand/SplashScreen';
import { GPSPermissionModal } from './components/onboarding/GPSPermissionModal';
import { LoginScreen } from './components/onboarding/LoginScreen';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar, NavigationPage } from './components/navigation/Sidebar';
import { CitizenLayout } from './components/citizen/CitizenLayout';
import { CommandCenter } from './pages/CommandCenter';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { FloodIntelligence } from './pages/FloodIntelligence';
import { WildfireIntelligence } from './pages/WildfireIntelligence';
import { RiskMap } from './pages/RiskMap';
import { ScenarioSimulator } from './pages/ScenarioSimulator';
import { Analytics } from './pages/Analytics';
import { AlertsEvents } from './pages/AlertsEvents';
import { SensorNetwork } from './pages/SensorNetwork';
import { GatewayNetwork } from './pages/GatewayNetwork';
import { CitizenImpact } from './pages/CitizenImpact';
import { SystemSettings } from './pages/SystemSettings';
import { PublicTestingHub } from './components/public/PublicTestingHub';
import {
  Sparkles,
  Waves,
  Flame,
  WifiOff,
  CheckCircle,
  X,
  AlertOctagon,
  Volume2
} from 'lucide-react';

const AuthorityLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    snapshot,
    setScenario,
    resetToNormal,
    simulateNetworkFailure,
    demoMode,
    setDemoMode,
    floodRisk,
    wildfireRisk
  } = useEarthSync();

  const isCritical =
    floodRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'CRITICAL';

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'command-center':
        return <CommandCenter onNavigate={setCurrentPage} />;
      case 'live-monitoring':
        return <LiveMonitoring />;
      case 'flood':
        return <FloodIntelligence />;
      case 'wildfire':
        return <WildfireIntelligence />;
      case 'risk-map':
        return <RiskMap />;
      case 'simulator':
        return <ScenarioSimulator />;
      case 'analytics':
        return <Analytics />;
      case 'alerts-events':
        return <AlertsEvents />;
      case 'sensor-network':
        return <SensorNetwork />;
      case 'gateways':
        return <GatewayNetwork />;
      case 'citizen-impact':
        return <CitizenImpact />;
      case 'apk-distribution':
        return <PublicTestingHub />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <CommandCenter onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Status & Navigation Bar */}
      <TopBar
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        isMobileSidebarOpen={mobileSidebarOpen}
      />

      {/* Critical Hazard Alert Banner */}
      {isCritical && (
        <div className="bg-red-950/90 border-b border-red-600/80 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-red-200 animate-pulse z-20 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400 animate-bounce shrink-0" />
            <div>
              <strong className="text-white font-black uppercase tracking-wider mr-1.5">
                CRITICAL HAZARD DETECTED:
              </strong>
              <span>
                {floodRisk.riskLevel === 'CRITICAL'
                  ? `River Node 02 Water Surge (${floodRisk.riskScore}%)`
                  : `Forest Node 01 Wildfire Anomaly (${wildfireRisk.riskScore}%)`}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              setCurrentPage(
                floodRisk.riskLevel === 'CRITICAL' ? 'flood' : 'wildfire'
              )
            }
            className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors self-end sm:self-auto shrink-0"
          >
            INSPECT HAZARD DECK →
          </button>
        </div>
      )}

      {/* Main Viewport Body */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => {
            setCurrentPage(page);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 touch-scroll bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,116,144,0.12),rgba(255,255,255,0))]">
          <div className="max-w-7xl mx-auto">{renderCurrentPage()}</div>
        </main>
      </div>

      {/* Floating Demo Mode Quick Bar (When enabled) */}
      {demoMode && (
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-slate-950/95 border border-purple-500/70 p-2 sm:p-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 font-mono text-xs max-w-[94vw] overflow-x-auto touch-scroll animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-1.5 px-2 text-purple-300 font-bold border-r border-slate-800 pr-2.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span className="hidden sm:inline">DEMO MODE</span>
            <span className="sm:hidden">DEMO</span>
          </div>

          <button
            onClick={resetToNormal}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors ${
              snapshot.activeScenario === 'NORMAL'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-400" /> NORMAL
          </button>

          <button
            onClick={() => {
              setScenario('FLOOD');
              setCurrentPage('flood');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors ${
              snapshot.activeScenario === 'FLOOD'
                ? 'bg-blue-950 text-cyan-300 border border-blue-700'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Waves className="w-3 h-3 text-cyan-400" /> FLOOD
          </button>

          <button
            onClick={() => {
              setScenario('WILDFIRE');
              setCurrentPage('wildfire');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors ${
              snapshot.activeScenario === 'WILDFIRE'
                ? 'bg-orange-950 text-orange-300 border border-orange-700'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-orange-400" /> WILDFIRE
          </button>

          <button
            onClick={() => {
              simulateNetworkFailure();
              setCurrentPage('simulator');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors ${
              snapshot.isEdgeMode
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'bg-slate-900 text-slate-300 hover:text-white'
            }`}
          >
            <WifiOff className="w-3 h-3 text-amber-400" /> EDGE OUTAGE
          </button>

          <button
            onClick={() => setDemoMode(false)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white ml-1"
            title="Close Demo Bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { appRole, isAuthenticated, setGpsGranted, startLocationTracking } = useEarthSync();
  const [showGpsModal, setShowGpsModal] = useState(() => {
    return localStorage.getItem('earthsync_gps_granted') === null;
  });

  const handleGpsGranted = () => {
    setGpsGranted(true);
    startLocationTracking();
    setShowGpsModal(false);
  };

  const handleGpsSkipped = () => {
    setShowGpsModal(false);
  };

  return (
    <>
      {!isAuthenticated ? <LoginScreen /> : <>
      {showGpsModal && (
        <GPSPermissionModal
          onGranted={handleGpsGranted}
          onSkipped={handleGpsSkipped}
        />
      )}
      {appRole === 'CITIZEN' ? <CitizenLayout /> : <AuthorityLayout />}
      </>}
    </>
  );
};

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <EarthSyncProvider>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <AppContent />
      )}
    </EarthSyncProvider>
  );
}

export default App;
