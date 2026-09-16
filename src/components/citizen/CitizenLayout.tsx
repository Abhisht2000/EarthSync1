import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { CitizenTopBar } from './CitizenTopBar';
import { CitizenBottomNav, CitizenTab } from './CitizenBottomNav';
import { CitizenHome } from '../../pages/citizen/CitizenHome';
import { CitizenMap } from '../../pages/citizen/CitizenMap';
import { CitizenAlerts } from '../../pages/citizen/CitizenAlerts';
import { CitizenGuides } from '../../pages/citizen/CitizenGuides';
import { CitizenProfile } from '../../pages/citizen/CitizenProfile';
import { WifiOff, AlertCircle } from 'lucide-react';
import { DICTIONARY } from '../../services/localization';

export const CitizenLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CitizenTab>('home');
  const { isOffline, language } = useEarthSync();
  const t = DICTIONARY[language];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white relative">
      {/* Offline Alert Sticky Banner */}
      {isOffline && (
        <div className="bg-amber-600/90 text-white text-xs px-4 py-2 text-center font-bold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
          <WifiOff className="w-4 h-4" />
          <span>{t.offlineNotice}</span>
        </div>
      )}

      {/* Citizen Top Bar */}
      <CitizenTopBar />

      {/* Main Container View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-24 pb-safe touch-scroll">
        {activeTab === 'home' && <CitizenHome onNavigate={setActiveTab} />}
        {activeTab === 'map' && <CitizenMap />}
        {activeTab === 'alerts' && <CitizenAlerts />}
        {activeTab === 'guides' && <CitizenGuides />}
        {activeTab === 'profile' && <CitizenProfile />}
      </main>

      {/* Mobile-First Sticky Bottom Navigation */}
      <CitizenBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};
