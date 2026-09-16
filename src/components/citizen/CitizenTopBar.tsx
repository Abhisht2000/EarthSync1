import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { EarthSyncLogo } from '../brand/EarthSyncLogo';
import { DICTIONARY } from '../../services/localization';
import { AuthorityAuthModal } from '../auth/AuthorityAuthModal';
import { CitizenTab } from './CitizenBottomNav';
import {
  ShieldCheck,
  Globe,
  PhoneCall,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  LogOut,
  Download,
  Smartphone
} from 'lucide-react';

interface CitizenTopBarProps {
  onOpenAuth?: () => void;
  onNavigateTab?: (tab: CitizenTab) => void;
}

export const CitizenTopBar: React.FC<CitizenTopBarProps> = ({ onOpenAuth, onNavigateTab }) => {
  const {
    language,
    setLanguage,
    citizenSafetyStatus,
    signOut,
    voiceEnabled,
    setVoiceEnabled,
    snapshot
  } = useEarthSync();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const t = DICTIONARY[language];

  return (
    <>
      <header className="h-16 bg-[#090e1c]/95 border-b border-slate-800/80 px-2.5 sm:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 select-none">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <EarthSyncLogo size="md" showText={true} />
          <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-400 font-mono text-[10px] font-bold">
            CITIZEN SAFETY APP
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Voice alerts toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg border text-xs font-mono transition-all ${
              voiceEnabled
                ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={voiceEnabled ? 'Voice Warnings Enabled' : 'Voice Warnings Muted'}
            aria-label="Voice Warnings"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Direct APK Download / Mobile App Action */}
          <a
            href="/downloads/EarthSync.apk"
            download="EarthSync.apk"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold transition-all shadow-md active:scale-95 shrink-0"
            title="Download Android APK Package (4.4 MB)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK (4.4MB)</span>
          </a>

          {/* Quick Helpline Button */}
          <a
            href="tel:112"
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black flex items-center gap-1 shadow-lg transition-all animate-pulse shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>112</span>
          </a>

          {/* Role Switcher back to Command Center with Credential Check */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
            title="Authenticate & Switch to Authority Command Center"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Authority Deck →</span>
            <span className="sm:hidden">OPS</span>
          </button>
          <button onClick={signOut} className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 transition-colors" title="Sign out" aria-label="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Security Verification Modal */}
      <AuthorityAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
