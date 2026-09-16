import React from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  Sliders,
  Play,
  RotateCcw,
  WifiOff,
  Wifi,
  Waves,
  Flame,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';

export const ScenarioSimulator: React.FC = () => {
  const {
    snapshot,
    setScenario,
    resetToNormal,
    simulateNetworkFailure,
    restoreConnection,
    floodRisk,
    wildfireRisk
  } = useEarthSync();

  const active = snapshot.activeScenario;
  const step = snapshot.scenarioStep;

  return (
    <div className="space-y-6 pb-12">
      {/* Simulator Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-400" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-purple-400 uppercase">
                EARTHSYNC COMMAND LAB
              </span>
              <span className="text-slate-500">•</span>
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/80 text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 animate-pulse">
                ● SIMULATION MODE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
              <Sliders className="w-6 h-6 sm:w-7 h-7 text-purple-400 shrink-0" />
              <span>SCENARIO SIMULATOR & RESILIENCE</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Test dynamic multi-hazard early warning sequences, voice alert dispatch, and offline edge failover.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400">STATE:</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono font-bold">
              {active} (STAGE {step})
            </span>
          </div>
        </div>

        {/* 5 One-Click Scenario Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          {/* Normal */}
          <button
            onClick={resetToNormal}
            className={`p-3.5 rounded-xl border font-mono text-xs font-bold transition-all text-left flex flex-col justify-between ${
              active === 'NORMAL'
                ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">BENCHMARK</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm block">NORMAL CONDITIONS</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Baseline stable telemetry
              </span>
            </div>
          </button>

          {/* Start Flood */}
          <button
            onClick={() => setScenario('FLOOD')}
            className={`p-3.5 rounded-xl border font-mono text-xs font-bold transition-all text-left flex flex-col justify-between ${
              active === 'FLOOD'
                ? 'bg-blue-950/70 border-blue-500/80 text-cyan-300 ring-1 ring-blue-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-blue-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">HYDRODYNAMIC</span>
              <Waves className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm block">START FLOOD</span>
              <span className="text-[10px] text-slate-400 font-normal">
                30→70cm water surge & rain
              </span>
            </div>
          </button>

          {/* Start Wildfire */}
          <button
            onClick={() => setScenario('WILDFIRE')}
            className={`p-3.5 rounded-xl border font-mono text-xs font-bold transition-all text-left flex flex-col justify-between ${
              active === 'WILDFIRE'
                ? 'bg-orange-950/70 border-orange-500/80 text-orange-300 ring-1 ring-orange-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-orange-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">COMBUSTION</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <span className="text-sm block">START WILDFIRE</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Heat rise, dryness & smoke
              </span>
            </div>
          </button>

          {/* Network Failure */}
          <button
            onClick={simulateNetworkFailure}
            className={`p-3.5 rounded-xl border font-mono text-xs font-bold transition-all text-left flex flex-col justify-between ${
              snapshot.isEdgeMode
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-950/70 border-slate-800 hover:border-amber-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">OFFLINE RESILIENCE</span>
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <span className="text-sm block">NETWORK FAILURE</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Edge local buffer processing
              </span>
            </div>
          </button>

          {/* Restore Connection */}
          <button
            onClick={restoreConnection}
            className="p-3.5 rounded-xl border border-slate-800 hover:border-emerald-700 bg-slate-950/70 hover:bg-slate-900 text-slate-300 font-mono text-xs font-bold transition-all text-left flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400">SYNCHRONIZE</span>
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm block">RESTORE LINK</span>
              <span className="text-[10px] text-slate-400 font-normal">
                Sync buffered telemetry
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Unfolding Event Storyboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flood Scenario Progression Story */}
        <div className={`p-5 rounded-2xl border transition-all ${active === 'FLOOD' ? 'bg-blue-950/30 border-blue-600/70 shadow-[0_0_20px_rgba(2,132,199,0.2)]' : 'bg-slate-900/80 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
              <Waves className="w-4 h-4" />
              <span>FLOOD SCENARIO LIFECYCLE</span>
            </div>
            <span className="text-xs font-mono text-cyan-300">
              {active === 'FLOOD' ? `Active Step ${step}/5` : 'Standby'}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className={`p-3 rounded-lg border ${step >= 1 && active === 'FLOOD' ? 'bg-slate-900 border-cyan-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>1. PRECIPITATION INITIATION</span>
                <span>Water: ~36 cm</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Basin rain sensor activates. Inflow begins draining toward lower River Node 02.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 2 && active === 'FLOOD' ? 'bg-slate-900 border-cyan-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>2. DRAINAGE ACCUMULATION</span>
                <span>Water: ~46 cm</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Depth increases rapidly. Rate of rise increases to +2.5 cm/min. Risk: 45%.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 3 && active === 'FLOOD' ? 'bg-slate-900 border-cyan-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>3. HIGH FLOOD CROSSING</span>
                <span>Water: ~58 cm</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Surge cross-threshold alarm. Synthesized voice announces High Flood Warning.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 4 && active === 'FLOOD' ? 'bg-red-950/60 border-red-500 text-white font-bold animate-pulse' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>4. CRITICAL THRESHOLD BREACH</span>
                <span className="text-red-400">Water: ~72 cm (Risk: 88%)</span>
              </div>
              <p className="text-[11px] text-red-300 font-normal">
                Water exceeds secondary retention embankments. Critical sirens & dispatch engaged.
              </p>
            </div>
          </div>
        </div>

        {/* Wildfire Scenario Progression Story */}
        <div className={`p-5 rounded-2xl border transition-all ${active === 'WILDFIRE' ? 'bg-orange-950/30 border-orange-600/70 shadow-[0_0_20px_rgba(234,88,12,0.2)]' : 'bg-slate-900/80 border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-orange-400 font-bold font-mono text-sm">
              <Flame className="w-4 h-4" />
              <span>WILDFIRE SCENARIO LIFECYCLE</span>
            </div>
            <span className="text-xs font-mono text-orange-300">
              {active === 'WILDFIRE' ? `Active Step ${step}/5` : 'Standby'}
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className={`p-3 rounded-lg border ${step >= 1 && active === 'WILDFIRE' ? 'bg-slate-900 border-orange-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>1. THERMAL ANOMALY</span>
                <span>Temp: 29.4°C • Hum: 58%</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Canopy clearing absorbs high solar irradiance with dry ambient air.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 2 && active === 'WILDFIRE' ? 'bg-slate-900 border-orange-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>2. RELATIVE HUMIDITY LOSS</span>
                <span>Hum: 49% • Smoke: MED</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Moisture drops below 50%. MQ-2 sensor detects particulate smoke spike.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 3 && active === 'WILDFIRE' ? 'bg-slate-900 border-orange-500 text-white font-bold' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>3. SMOKE ANOMALY SURGE</span>
                <span>Temp: 33.4°C • Smoke: 230ppm</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Multi-factor risk escalates past High. Voice warns of Potential Wildfire.
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${step >= 4 && active === 'WILDFIRE' ? 'bg-red-950/60 border-red-500 text-white font-bold animate-pulse' : 'bg-slate-950/50 border-slate-800/80 text-slate-400'}`}>
              <div className="flex justify-between mb-1">
                <span>4. POTENTIAL WILDFIRE RISK</span>
                <span className="text-red-400">Risk: 89% CRITICAL</span>
              </div>
              <p className="text-[11px] text-red-300 font-normal">
                Critical combustible convergence detected. Forestry drone dispatch recommended.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Offline / Edge Resilient Mode Inspection Panel */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              EDGE CONTINUITY ARCHITECTURE
            </span>
            <h3 className="text-lg font-bold text-slate-100">
              Offline Edge Node Survivability
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {snapshot.isCloudConnected ? (
              <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> CLOUD CONNECTION ONLINE
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-red-950/80 border border-red-800 text-red-400 text-xs font-mono flex items-center gap-1.5 animate-pulse">
                <WifiOff className="w-3.5 h-3.5" /> CLOUD LINK OFFLINE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 uppercase font-bold block mb-1">
              EDGE MONITORING STATE:
            </span>
            <p className={snapshot.isEdgeMode ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
              {snapshot.isEdgeMode ? '🟢 EDGE MONITORING ACTIVE' : '● CLOUD SYNCHRONIZED'}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {snapshot.isEdgeMode
                ? 'Connectivity lost. Local monitoring continues autonomously on ESP32 node.'
                : 'Telemetry and alarms routed through central gateway in real time.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 uppercase font-bold block mb-1">
              BUFFERED EVENTS:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400">
                {snapshot.bufferedEventsCount}
              </span>
              <span className="text-slate-400">LOCAL RECORDS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Local flash circular buffer stores historical samples and alarm timestamps until connection recovery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-400 uppercase font-bold block mb-1">
              LAST SYNCHRONIZATION:
            </span>
            <div className="text-sm font-bold text-slate-200">
              {snapshot.lastSyncTime}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Automatic checksum handshake verifies buffer integrity upon link restoration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
