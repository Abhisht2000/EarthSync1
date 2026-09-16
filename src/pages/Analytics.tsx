import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Thermometer,
  Waves
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { snapshot } = useEarthSync();
  const [timeRange, setTimeRange] = useState<'today' | '24h' | '7d' | '30d'>('24h');

  // Realistic historical distribution
  const hazardAlertsData = [
    { name: 'Flood', count: 14, color: '#0284c7' },
    { name: 'Wildfire', count: 9, color: '#ea580c' },
    { name: 'Heatwave', count: 6, color: '#eab308' },
    { name: 'Landslide', count: 3, color: '#10b981' }
  ];

  const peakWater = Math.max(...snapshot.history.map((h) => h.waterLevel));
  const peakTemp = Math.max(...snapshot.history.map((h) => h.temperature));
  const avgRisk = Math.round(
    snapshot.history.reduce((acc, h) => acc + h.riskScore, 0) / snapshot.history.length
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Analytics Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              ENVIRONMENTAL DATA WAREHOUSE
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
              HISTORICAL MULTI-SERIES ANALYTICS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
            <BarChart3 className="w-6 h-6 sm:w-7 h-7 text-cyan-400 shrink-0" />
            <span>ANALYTICS & TREND ENGINE</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Retrospective time-series evaluation and hazard correlation distributions.
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono overflow-x-auto touch-scroll shrink-0">
          {(['today', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                timeRange === range
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 6 High-Level Analytics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 font-mono">
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">TOTAL ALERTS</span>
          <span className="text-xl sm:text-2xl font-black text-white">32</span>
          <span className="text-[10px] text-slate-400 block mt-1">Resolved: 29</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">CRITICAL EVENTS</span>
          <span className="text-xl sm:text-2xl font-black text-red-400">4</span>
          <span className="text-[10px] text-red-300 block mt-1">Siren Dispatches</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">AVERAGE RISK</span>
          <span className="text-xl sm:text-2xl font-black text-cyan-400">{avgRisk}%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Baseline: Watch</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">PEAK WATER LEVEL</span>
          <span className="text-xl sm:text-2xl font-black text-blue-400">{peakWater.toFixed(1)} cm</span>
          <span className="text-[10px] text-slate-400 block mt-1">River Node 02</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">PEAK TEMPERATURE</span>
          <span className="text-xl sm:text-2xl font-black text-orange-400">{peakTemp.toFixed(1)}°C</span>
          <span className="text-[10px] text-slate-400 block mt-1">Forest Node 01</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">SENSOR UPTIME</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400">99.8%</span>
          <span className="text-[10px] text-slate-400 block mt-1">Telemetry SLA</span>
        </div>
      </div>

      {/* 24-Hour Longitudinal Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 24-Hour Water Level */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase truncate pr-2">
              24-HR HYDROGRAPH (WATER LEVEL)
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">cm vs Hour</span>
          </div>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="waterLevel" stroke="#0284c7" fill="#0284c730" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Temperature */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-orange-400 uppercase truncate pr-2">
              24-HR THERMAL PROFILE (TEMP)
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">°C vs Hour</span>
          </div>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[20, 38]} />
                <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="temperature" stroke="#ea580c" fill="#ea580c30" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Relative Humidity */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md min-w-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase truncate pr-2">
              24-HR MOISTURE (HUMIDITY %)
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">% vs Hour</span>
          </div>
          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[30, 85]} />
                <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                <Area type="monotone" dataKey="humidity" stroke="#06b6d4" fill="#06b6d430" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts by Hazard Type Distribution */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-200 uppercase truncate pr-2">
              HISTORICAL ALERTS BY HAZARD
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">Total: 32</span>
          </div>

          <div className="h-56 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hazardAlertsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={70} />
                <Tooltip contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {hazardAlertsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
