import React, { useState, useEffect } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { EarthSyncLogo } from '../brand/EarthSyncLogo';
import {
  Radio,
  Bell,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Cpu,
  Clock,
  Sparkles,
  Users,
  Globe
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = () => {
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
    language,
    setLanguage
  } = useEarthSync();

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onlineNodesCount = snapshot.nodes.filter((n) => n.status !== 'OFFLINE').length;
  const activeAlertsCount = snapshot.alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="h-16 bg-[#090e1c]/95 border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Brand Identification */}
      <div className="flex items-center gap-6">
        <EarthSyncLogo size="md" showText={true} />

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
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)] max-w-md truncate">
          <Volume2 className="w-4 h-4 text-red-400 animate-bounce flex-shrink-0" />
          <span className="font-bold text-red-400 uppercase tracking-wider">VOICE ALERT ACTIVE:</span>
          <span className="truncate text-slate-200">{speakingText}</span>
        </div>
      )}

      {/* Right Telemetry KPIs & Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime}</span>
        </div>

        {/* Sensor Nodes Count */}
        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">SENSORS:</span>
          <span className="text-emerald-400 font-bold">{onlineNodesCount}/{snapshot.nodes.length} ONLINE</span>
        </div>

        {/* Active Alerts Count */}
        <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <Bell className={`w-3.5 h-3.5 ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">ALERTS:</span>
          <span className={`font-bold ${activeAlertsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {activeAlertsCount}
          </span>
        </div>

        {/* Prominent DEMO MODE vs LIVE SENSOR MODE Indicator */}
        {snapshot.activeScenario !== 'NORMAL' || demoMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-600/90 text-purple-200 text-xs font-mono font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>🟣 DEMO MODE</span>
            <span className="hidden xl:inline text-[10px] text-purple-300 font-normal">(SIMULATED SENSOR DATA)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/90 text-emerald-300 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🟢 LIVE SENSOR MODE</span>
            <span className="hidden xl:inline text-[10px] text-emerald-300 font-normal">(CONNECTED)</span>
          </div>
        )}

        {/* Voice Alert Toggle & Test */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              voiceEnabled
                ? 'bg-cyan-950/80 text-cyan-300 font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={voiceEnabled ? 'Voice Alerts Active (Click to mute)' : 'Voice Alerts Muted (Click to turn on)'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          <button
            onClick={testVoice}
            className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 border-l border-slate-800 transition-colors"
            title="Test Voice Warning announcement"
          >
            Test
          </button>
        </div>

        {/* Language Quick Toggle */}
        <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
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

        {/* Demo Mode Button */}
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
            demoMode
              ? 'bg-purple-900/80 border-purple-500 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
              : 'bg-slate-900 border-slate-800 text-purple-300 hover:border-purple-600'
          }`}
          title="Toggle Simulation Scenarios Control Bar"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>SIMULATOR</span>
        </button>

        {/* Switch to Citizen Mode Button */}
        <button
          onClick={() => setAppRole('CITIZEN')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all active:scale-95"
          title="Switch to Citizen Safety App Interface"
        >
          <Users className="w-3.5 h-3.5" />
          <span>CITIZEN APP</span>
        </button>
      </div>
    </header>
  );
};
