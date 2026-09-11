import React from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY } from '../../services/localization';
import {
  Shield,
  Map,
  Bell,
  BookOpen,
  User,
  AlertTriangle
} from 'lucide-react';

export type CitizenTab = 'home' | 'map' | 'alerts' | 'guides' | 'profile';

interface CitizenBottomNavProps {
  activeTab: CitizenTab;
  onSelectTab: (tab: CitizenTab) => void;
}

export const CitizenBottomNav: React.FC<CitizenBottomNavProps> = ({
  activeTab,
  onSelectTab
}) => {
  const { language, nearbyHazards, citizenSafetyStatus } = useEarthSync();
  const t = DICTIONARY[language];

  const hasCritical = citizenSafetyStatus === 'CRITICAL' || citizenSafetyStatus === 'HIGH_RISK';

  const tabs: Array<{ id: CitizenTab; label: string; icon: any; badge?: number }> = [
    { id: 'home', label: t.navHome, icon: Shield },
    { id: 'map', label: t.navMap, icon: Map },
    { id: 'alerts', label: t.navAlerts, icon: Bell, badge: nearbyHazards.length > 0 ? nearbyHazards.length : undefined },
    { id: 'guides', label: t.navGuides, icon: BookOpen },
    { id: 'profile', label: t.navProfile, icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090e1c]/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around select-none shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-black flex items-center justify-center animate-bounce">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono tracking-wide mt-1">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
