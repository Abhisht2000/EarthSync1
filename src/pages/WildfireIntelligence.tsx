import React from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Flame, Thermometer, Droplets, Wind, Play, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getRiskBadgeClasses } from '../services/riskEngine';

export const WildfireIntelligence: React.FC = () => {
  const { snapshot, wildfireRisk, setScenario, resetToNormal } = useEarthSync();

  const fireReading = snapshot.primaryWildfireNode?.lastReading || {
    temperature: 27.2,
    humidity: 63.5,
    smokeLevel: 'LOW',
    smokePpm: 38,
    windSpeed: 14
  };

  const badgeClasses = getRiskBadgeClasses(wildfireRisk.riskLevel);

  const chartData = snapshot.history.filter((h) => !h.nodeId || h.nodeId === snapshot.primaryWildfireNode?.id).map((h) => ({
    time: h.timeLabel,
    temperature: h.temperature,
    humidity: h.humidity,
    smokePpm: h.smokePpm,
    fireRisk: Math.round(((h.temperature - 20) / 20) * 35 + ((70 - h.humidity) / 35) * 25 + (h.smokePpm / 250) * 40)
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Wildfire Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-red-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-orange-400 uppercase">
                THERMAL & COMBUSTION INTELLIGENCE
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                FOREST NODE 01
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 shrink-0" />
              <span>WILDFIRE INTELLIGENCE & COMBUSTION</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Multi-sensor fusion correlating ambient heat desiccation, relative moisture loss, and MQ-2 particulate anomalies.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setScenario('WILDFIRE')}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-mono font-bold shadow-lg transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>SIMULATE WILDFIRE</span>
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
            <span className="text-orange-400 font-bold uppercase shrink-0">WHAT THIS MEANS:</span>
            <span className="text-slate-200">
              {fireReading.temperature >= 32 && (fireReading.smokeLevel === 'HIGH' || fireReading.smokePpm > 150)
                ? '⚠️ Temperature is high, humidity is low, and smoke is elevated. Multiple wildfire warning signs detected.'
                : fireReading.temperature >= 30
                ? '⚡ Temperature is warming up and air is dry. Monitored for combustible hazard.'
                : '✓ Canopy temperature and humidity are normal. No active wildfire danger.'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline shrink-0">
            Prototype Risk Model
          </span>
        </div>

        {/* 5 Primary Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mt-4 pt-4 border-t border-slate-800/80">
          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              TEMPERATURE
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-orange-400">
                {fireReading.temperature.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">°C</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              DHT22 / BME280
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              RELATIVE HUMIDITY
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
                {Math.round(fireReading.humidity)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              Fuel Desiccation Index
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              SMOKE ANOMALY
            </span>
            <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
              <span className={`text-lg sm:text-xl font-mono font-black ${fireReading.smokeLevel === 'HIGH' ? 'text-red-400 animate-pulse' : fireReading.smokeLevel === 'MEDIUM' ? 'text-amber-400' : 'text-slate-300'}`}>
                {fireReading.smokeLevel}
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                ({fireReading.smokePpm} ppm)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              MQ-2 Gas / Particulate
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              FIRE RISK SCORE
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-white">
                {wildfireRisk.riskScore}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
              POTENTIAL RISK
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex flex-col justify-center col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase block mb-1">
              SEVERITY LEVEL
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border text-center ${badgeClasses}`}>
              {wildfireRisk.riskLevel}
            </span>
            <span className="text-[10px] font-mono text-slate-400 text-center mt-1">
              Wind: {fireReading.windSpeed} km/h
            </span>
          </div>
        </div>
      </div>

      {/* 4 Synchronized Live Charts */}
      <div>
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 mb-3">
          LIVE THERMAL ESCALATION SYNCHRONIZED CHARTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart 1: Temperature */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-orange-400 uppercase">
                1. CANOPY TEMPERATURE (°C)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {fireReading.temperature.toFixed(1)}°C
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wfTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[22, 40]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="temperature" stroke="#ea580c" strokeWidth={2} fill="url(#wfTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Humidity */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                2. RELATIVE HUMIDITY (%)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {Math.round(fireReading.humidity)}%
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wfHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[30, 80]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} fill="url(#wfHum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Smoke PPM */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                3. SMOKE PARTICULATE DENSITY (ppm)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {fireReading.smokePpm} ppm
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wfSmoke" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 450]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="smokePpm" stroke="#eab308" strokeWidth={2} fill="url(#wfSmoke)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Fire Risk */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 min-w-0">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase">
                4. POTENTIAL WILDFIRE RISK (%)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                {wildfireRisk.riskScore}%
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="wfRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="fireRisk" stroke="#ef4444" strokeWidth={2} fill="url(#wfRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Wildfire Risk Engine Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  WILDFIRE RISK ENGINE
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Multi-Vector Combustion Reasoning
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-orange-400 font-bold">
              POTENTIAL WILDFIRE RISK
            </span>
          </div>

          <div className="space-y-4 font-mono">
            {wildfireRisk.factors.map((factor, idx) => {
              const pct = (factor.score / factor.weight) * 100;
              return (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-200 font-bold uppercase">{factor.name}</span>
                    <span className="text-orange-300 font-bold">
                      {factor.score} / {factor.weight} pts ({Math.round(pct)}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-900 rounded overflow-hidden border border-slate-800 flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        factor.status === 'critical'
                          ? 'bg-red-500'
                          : factor.status === 'elevated'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
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
              TOTAL FIRE RISK SCORE:
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-orange-400">{wildfireRisk.riskScore}%</span>
              <span className="text-slate-400 uppercase font-bold">[{wildfireRisk.riskLevel}]</span>
              <span className="text-slate-400 ml-auto">
                Temperature ({wildfireRisk.factors[0].score}) + Humidity ({wildfireRisk.factors[1].score}) + Smoke ({wildfireRisk.factors[2].score})
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Recommendations & Scientific Honesty */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-bold text-slate-100 text-base mb-3 pb-2 border-b border-slate-800">
            Explaining Reasoning & Response
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              <span className="text-slate-400 uppercase font-bold block mb-1">
                ACTIONABLE DISPATCH:
              </span>
              <p className="text-orange-200 font-medium leading-relaxed">
                {wildfireRisk.recommendedAction}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-bold block">
                VALIDATED SYMPTOMS:
              </span>
              {wildfireRisk.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-amber-300 block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> SCIENTIFIC HONESTY:
              </strong>
              EarthSync specifically uses the terminology <em>"POTENTIAL WILDFIRE RISK"</em>. Smoke alone does not prove active wildfire, which is why temperature trend and humidity dryness are required to escalate risk.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
