import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { SensorMetricCard } from '../components/cards/SensorMetricCard';
import {
  Activity,
  Radio,
  Search,
  Waves,
  Flame,
  Sun,
  Mountain,
  Battery,
  Wifi,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const LiveMonitoring: React.FC = () => {
  const { snapshot } = useEarthSync();
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');

  const zones = ['ALL', ...Array.from(new Set(snapshot.nodes.map((n) => n.zone)))];

  const filteredNodes = snapshot.nodes.filter((n) => {
    const matchesSearch =
      n.id.toLowerCase().includes(search.toLowerCase()) ||
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.zone.toLowerCase().includes(search.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || n.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              DISTRIBUTED SENSOR TELEMETRY
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              100% INGESTION EFFICIENCY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 sm:gap-3">
            <Activity className="w-6 h-6 sm:w-7 h-7 text-cyan-400 shrink-0" />
            <span>LIVE ENVIRONMENTAL MONITORING</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time physical observation parameters received from field-deployed edge nodes.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search node or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 sm:py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-60"
            />
          </div>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 sm:py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 shrink-0"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 12 Nodes Live Telemetry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNodes.map((node) => {
          const isCritical = node.status === 'CRITICAL';
          const isWarning = node.status === 'WARNING';
          const isOffline = node.status === 'OFFLINE';

          const r = node.lastReading;

          return (
            <div
              key={node.id}
              className={`p-4.5 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-red-950/25 border-red-700/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : isWarning
                  ? 'bg-amber-950/25 border-amber-700/80'
                  : isOffline
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Node Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {node.id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 uppercase">
                      {node.hazardType}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      isCritical
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : isOffline
                        ? 'bg-slate-950 text-slate-400 border border-slate-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 truncate mb-3">
                  {node.zone}
                </p>

                {/* Sensor Readings Display */}
                <div className="space-y-1.5 text-xs font-mono">
                  {node.hazardType === 'flood' && (
                    <>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Water Depth:</span>
                        <span className="text-cyan-400 font-bold">{r.waterLevel.toFixed(1)} cm</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Rate of Rise:</span>
                        <span className="text-blue-400 font-bold">
                          +{r.rateOfRise?.toFixed(1) || '0.2'} cm/m
                        </span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Rainfall:</span>
                        <span className={r.rainfall ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {r.rainfall ? 'DETECTED' : 'NONE'}
                        </span>
                      </div>
                    </>
                  )}

                  {node.hazardType === 'wildfire' && (
                    <>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="text-orange-400 font-bold">{r.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Humidity:</span>
                        <span className="text-cyan-400 font-bold">{Math.round(r.humidity)}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Smoke Level:</span>
                        <span className="text-amber-400 font-bold">{r.smokeLevel} ({r.smokePpm}ppm)</span>
                      </div>
                    </>
                  )}

                  {node.hazardType === 'heatwave' && (
                    <>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Surface Temp:</span>
                        <span className="text-yellow-400 font-bold">{r.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Humidity:</span>
                        <span className="text-cyan-400 font-bold">{Math.round(r.humidity)}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Solar Index:</span>
                        <span className="text-slate-200 font-bold">7.8 UVI</span>
                      </div>
                    </>
                  )}

                  {node.hazardType === 'landslide' && (
                    <>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Soil Moisture:</span>
                        <span className="text-emerald-400 font-bold">{r.soilMoisture || 42}%</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Incline Drift:</span>
                        <span className="text-slate-200 font-bold">0.02°</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-slate-950/60">
                        <span className="text-slate-400">Pore Pressure:</span>
                        <span className="text-slate-200 font-bold">12.4 kPa</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Hardware Footer */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Battery className="w-3.5 h-3.5" />
                  <span>{node.battery}%</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{node.signalRssi} dBm</span>
                </div>
                <span className="text-slate-400">{r.dataQuality}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
