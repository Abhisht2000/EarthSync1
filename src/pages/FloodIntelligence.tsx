import React from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { RadialRiskGauge } from '../components/gauges/RadialRiskGauge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Waves, CloudRain, AlertTriangle, Play, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getRiskBadgeClasses } from '../services/riskEngine';

export const FloodIntelligence: React.FC = () => {
  const { snapshot, floodRisk, setScenario, resetToNormal } = useEarthSync();

  const floodReading = snapshot.primaryFloodNode?.lastReading || {
    waterLevel: 32.4,
    rateOfRise: 0.2,
    rainfall: false
  };

  const badgeClasses = getRiskBadgeClasses(floodRisk.riskLevel);

  // Prepare chart series from history
  const floodHistory = snapshot.history.filter((h) => !h.nodeId || h.nodeId === snapshot.primaryFloodNode?.id);
  const chartData = floodHistory.map((h, i) => {
    const prev = floodHistory[Math.max(0, i - 1)];
    const elapsedMinutes = i === 0 ? 0 : (new Date(h.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 60000;
    const rate = elapsedMinutes > 0 ? Math.round(((h.waterLevel - prev.waterLevel) / elapsedMinutes) * 10) / 10 : 0;
    return {
      time: h.timeLabel,
      waterLevel: h.waterLevel,
      rateOfRise: Math.max(0, rate),
      rainfall: h.rainfall,
      riskScore: Math.round((h.waterLevel / 75) * 65 + (h.rainfall ? 20 : 5))
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Flood Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                HYDRODYNAMIC INTELLIGENCE MODULE
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                RIVER NODE 02
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
              <Waves className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 shrink-0" />
              <span>FLOOD INTELLIGENCE & EARLY WARNING</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Deterministic catchment runoff modeling with dynamic rate-of-rise derivation.
            </p>
          </div>

          {/* Scenario quick trigger buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setScenario('FLOOD')}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>SIMULATE FLOOD SURGE</span>
            </button>
            <button
              onClick={resetToNormal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors active:scale-95 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Plain Language Interpretation Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold uppercase shrink-0">WHAT THIS MEANS:</span>
            <span className="text-slate-200">
              {floodReading.waterLevel > 60
                ? '⚠️ Water level is rising faster than before. Rain detected. Flood risk is high.'
                : floodReading.waterLevel > 45
                ? '⚡ Water level is rising steadily. Drainage catchment is filling up.'
                : '✓ Water level is in the safe normal range. No immediate flooding risk.'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline shrink-0">
            Prototype Risk Model
          </span>
        </div>

        {/* 5 Primary Flood Status Readouts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mt-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              WATER LEVEL
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
                {floodReading.waterLevel.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">cm</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              Ultrasonic HC-SR04
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              RATE OF RISE
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-blue-400">
                {floodReading.rateOfRise !== undefined && floodReading.rateOfRise >= 0 ? '+' : ''}
                {floodReading.rateOfRise?.toFixed(1) || '0.2'}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 font-bold">cm/min</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              Computed: ΔDepth/ΔTime
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              RAINFALL STATUS
            </span>
            <div className="flex items-center gap-2 mt-1">
              <CloudRain className={`w-5 h-5 ${floodReading.rainfall ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className={`text-lg sm:text-xl font-mono font-bold ${floodReading.rainfall ? 'text-amber-400' : 'text-slate-400'}`}>
                {floodReading.rainfall ? 'DETECTED' : 'NONE'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              Catchment Tipping Gauge
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              FLOOD RISK SCORE
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                {floodRisk.riskScore}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              Multi-Factor Weighted
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex flex-col justify-center col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              SEVERITY LEVEL
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border text-center ${badgeClasses}`}>
              {floodRisk.riskLevel}
            </span>
            <span className="text-[10px] font-mono text-slate-400 text-center mt-1">
              {floodRisk.trend === 'increasing' ? 'Trend: ↑ Rising' : 'Trend: → Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Synchronized Live Charts */}
      <div>
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          LIVE HYDRODYNAMIC SYNCHRONIZED CHARTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Water Level */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                1. WATER LEVEL DEPTH (cm)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {floodReading.waterLevel.toFixed(1)} cm
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="flWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[20, 80]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="waterLevel" stroke="#0284c7" strokeWidth={2} fill="url(#flWater)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Rate of Rise */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                2. DYNAMIC RATE OF RISE (cm/min)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                +{floodReading.rateOfRise?.toFixed(1) || '0.2'} cm/min
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="flRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 8]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="rateOfRise" stroke="#3b82f6" strokeWidth={2} fill="url(#flRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Rainfall */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                3. BASIN RAINFALL INTENSITY
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {floodReading.rainfall ? 'ACTIVE (1.0)' : 'NONE (0.0)'}
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="flRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 1.2]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="stepAfter" dataKey="rainfall" stroke="#f59e0b" strokeWidth={2} fill="url(#flRain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Flood Risk Score */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase">
                4. FLOOD RISK ASSESSMENT ESCALATION (%)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {floodRisk.riskScore}%
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="flRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2} fill="url(#flRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Prototype Risk Model Visual Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  TRANSPARENT REASONING ENGINE
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Prototype Flood Risk Assessment Weighting
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-400">
              PROTOTYPE RISK ASSESSMENT
            </span>
          </div>

          <div className="space-y-4 font-mono">
            {floodRisk.factors.map((factor, idx) => {
              const pct = (factor.score / factor.weight) * 100;
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200 font-bold uppercase">{factor.name}</span>
                    <span className="text-cyan-300 font-bold">
                      {factor.score} / {factor.weight} pts ({Math.round(pct)}%)
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-slate-900 rounded overflow-hidden border border-slate-800 flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        factor.status === 'critical'
                          ? 'bg-red-500'
                          : factor.status === 'elevated'
                          ? 'bg-amber-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                    <span>Reading: <strong className="text-slate-200">{factor.valueDisplay}</strong></span>
                    <span>{factor.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <div className="text-slate-400 uppercase font-bold mb-1">
              MATHEMATICAL TOTAL:
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400">{floodRisk.riskScore}%</span>
              <span className="text-slate-400 uppercase font-bold">[{floodRisk.riskLevel}]</span>
              <span className="text-slate-400 ml-auto">
                Water Level ({floodRisk.factors[0].score}) + Rate of Rise ({floodRisk.factors[1].score}) + Rainfall ({floodRisk.factors[2].score})
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-bold text-slate-100 text-base mb-3 pb-2 border-b border-slate-800">
            Actionable Response Directives
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              <span className="text-slate-400 uppercase font-bold block mb-1">
                DISASTER DISPATCH PROTOCOL:
              </span>
              <p className="text-amber-200 font-medium leading-relaxed">
                {floodRisk.recommendedAction}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-bold block">
                CORROBORATING REASONS:
              </span>
              {floodRisk.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-300 block mb-1">PROTOTYPE NOTICE:</strong>
              This assessment model provides demonstration telemetry for hackathon evaluation and does not constitute certified governmental meteorological forecasting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
