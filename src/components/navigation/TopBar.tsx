import React, { useState, useEffect } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { EarthSyncLogo } from '../brand/EarthSyncLogo';
import {
  Menu,
  X,
  Radio,
  Bell,
  Volume2,
  VolumeX,
  Cpu,
  Clock,
  Sparkles,
  Users,
  Globe,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  isMobileSidebarOpen
}) => {
  const {
    snapshot,
    isSpeaking,
    speakingText,
    voiceEnabled,
    setVoiceEnabled,
    testVoice,
    demoMode,
    setDemoMode,
    setAppRole,
    signOut,
    language,
    setLanguage,
    currentUser,
    gpsGranted
  } = useEarthSync();

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false })
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onlineNodesCount = snapshot.nodes.filter((n) => n.status !== 'OFFLINE').length;
  const activeAlertsCount = snapshot.alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="h-16 bg-[#090e1c]/95 border-b border-slate-800/80 px-3 sm:px-4 lg:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Brand Identification & Mobile Hamburger */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Mobile Navigation Drawer Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          aria-label="Toggle navigation drawer"
          title="Open Menu"
        >
          {isMobileSidebarOpen ? (
            <X className="w-5 h-5 text-cyan-300" />
          ) : (
            <Menu className="w-5 h-5 text-cyan-300" />
          )}
        </button>

        <EarthSyncLogo size="md" showText={true} />

        {/* Desktop Status Indicators */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-800/80">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM OPERATIONAL</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>DATA STREAM: LIVE</span>
          </div>

          {snapshot.activeScenario !== 'NORMAL' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono font-semibold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIMULATION: {snapshot.activeScenario}</span>
            </div>
          )}
        </div>
      </div>

      {/* Center Live Voice Announcement Banner (When speaking) */}
      {isSpeaking && (
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] max-w-xs xl:max-w-md truncate">
          <Volume2 className="w-4 h-4 text-red-400 animate-bounce flex-shrink-0" />
          <span className="font-bold text-red-400 uppercase tracking-wider">VOICE ALERT:</span>
          <span className="truncate text-slate-200">{speakingText}</span>
        </div>
      )}

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Live Clock (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime}</span>
        </div>

        {/* Sensor Nodes Count (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">SENSORS:</span>
          <span className="text-emerald-400 font-bold">{onlineNodesCount}/{snapshot.nodes.length}</span>
        </div>

        {/* Active Alerts Count */}
        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/80 px-2 sm:px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Bell className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">ALERTS:</span>
          <span className={`font-bold ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {activeAlertsCount}
          </span>
        </div>

        {/* Scenario Indicator / Badge */}
        {snapshot.activeScenario !== 'NORMAL' ? (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-600/90 text-purple-200 text-[11px] sm:text-xs font-mono font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="hidden sm:inline">🟣 DEMO</span>
            <span className="sm:hidden">DEMO</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/90 text-emerald-300 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🟢 LIVE</span>
          </div>
        )}

        {/* Desktop Voice Alert Toggle & Test */}
        <div className="hidden lg:flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              voiceEnabled
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={voiceEnabled ? 'Voice Alerts Active' : 'Voice Alerts Muted'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          <button
            onClick={testVoice}
            className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 border-l border-slate-800 transition-colors"
            title="Test Voice Warning announcement"
          >
            Test
          </button>
        </div>

        {/* Desktop Language Quick Toggle */}
        <div className="hidden lg:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded transition-all ${
              language === 'en' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded transition-all ${
              language === 'hi' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Desktop Demo Mode Button */}
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
            demoMode
              ? 'bg-purple-900/80 border-purple-500 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'bg-slate-900 border-slate-800 text-purple-300 hover:border-purple-600'
          }`}
          title="Toggle Simulation Scenarios Control Bar"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>SIMULATOR</span>
        </button>

        {/* Mobile Quick Settings Popover Trigger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-xl border text-xs font-mono transition-all ${
            mobileMenuOpen || demoMode
              ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Mobile Quick Actions"
          aria-label="Mobile Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* User Identity / GPS Status Pill */}
        <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-slate-200 font-semibold truncate max-w-[110px]">
            {currentUser.name || 'User'}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${gpsGranted ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} title={gpsGranted ? 'GPS Active' : 'GPS Off'} />
        </div>

        {/* Switch to Citizen Mode Button */}
        <button
          onClick={() => setAppRole('CITIZEN')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all active:scale-95 shrink-0"
          title="Switch to Citizen Safety App Interface"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CITIZEN APP</span>
          <span className="sm:hidden">CITIZEN</span>
        </button>
        <button onClick={signOut} className="hidden sm:flex p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-600 transition-colors" title="Sign out" aria-label="Sign out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Quick Settings Dropdown Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-[#090e1c]/98 border-b border-slate-800 p-4 backdrop-blur-xl shadow-2xl lg:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Simulation / Demo Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Simulation Quick Bar:</span>
              </span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`px-3 py-1 rounded-md font-bold text-xs transition-all ${
                  demoMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {demoMode ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Voice Warning Toggle & Test */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span>Voice Audio Alerts:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`px-2.5 py-1 rounded font-bold ${
                    voiceEnabled
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {voiceEnabled ? 'ON' : 'MUTED'}
                </button>
                <button
                  onClick={testVoice}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-300"
                >
                  Test
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Language (भाषा):</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    language === 'en'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded font-bold ${
                    language === 'hi'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
