import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  Radio,
  Battery,
  Wifi,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Cpu,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { NodeStatus } from '../types/sensor';

export const SensorNetwork: React.FC = () => {
  const { snapshot } = useEarthSync();
  const [statusFilter, setStatusFilter] = useState<'ALL' | NodeStatus>('ALL');

  const filteredNodes = snapshot.nodes.filter((node) => {
    if (statusFilter === 'ALL') return true;
    return node.status === statusFilter;
  });

  const onlineCount = snapshot.nodes.filter((n) => n.status === 'ONLINE').length;
  const warningCount = snapshot.nodes.filter((n) => n.status === 'WARNING').length;
  const offlineCount = snapshot.nodes.filter((n) => n.status === 'OFFLINE').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Network Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              HARDWARE FLEET INVENTORY
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">
              ESP32 FIELD MICROCONTROLLER NODES
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            <Radio className="w-7 h-7 text-cyan-400" />
            SENSOR NETWORK & HARDWARE INTEGRITY
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Continuous health monitoring of distributed wireless nodes, battery reserves, RSSI links, and sensor staleness.
          </p>
        </div>

        {/* Fleet KPI Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            ONLINE: <strong>{onlineCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400">
            WARNING: <strong>{warningCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            OFFLINE: <strong>{offlineCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs">
        <span className="text-slate-400 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> FILTER:
        </span>
        {(['ALL', 'ONLINE', 'WARNING', 'OFFLINE'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === status
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 12 Nodes Detailed Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNodes.map((node) => {
          const isOffline = node.status === 'OFFLINE';
          const isWarning = node.status === 'WARNING';
          const isCritical = node.status === 'CRITICAL';
          const isStale = isOffline || node.battery < 20;

          return (
            <div
              key={node.id}
              className={`p-4.5 rounded-xl border backdrop-blur-md transition-all flex flex-col justify-between ${
                isCritical
                  ? 'bg-red-950/30 border-red-700/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-700/80'
                  : isOffline
                  ? 'bg-slate-900/50 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Node Title & Status Badge */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-sm font-bold text-white">
                      {node.id}
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

                <span className="text-xs font-mono text-slate-300 font-medium block truncate mb-1">
                  {node.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400 block truncate mb-3">
                  {node.zone}
                </span>

                {/* Health Diagnostics */}
                <div className="space-y-2 text-xs font-mono">
                  {/* Battery Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-slate-400" /> Battery Reserve:
                      </span>
                      <span className={node.battery < 20 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {node.battery}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full ${
                          node.battery < 20
                            ? 'bg-red-500'
                            : node.battery < 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${node.battery}%` }}
                      />
                    </div>
                  </div>

                  {/* Signal Strength RSSI */}
                  <div className="flex justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Link RSSI:
                    </span>
                    <span className={node.signalRssi < -85 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                      {node.signalRssi} dBm
                    </span>
                  </div>

                  {/* Data Quality & Stale Warning */}
                  <div className="flex justify-between p-2 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400">Data Quality:</span>
                    <span
                      className={`font-bold ${
                        node.lastReading.dataQuality === 'GOOD'
                          ? 'text-emerald-400'
                          : node.lastReading.dataQuality === 'DEGRADED'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {node.lastReading.dataQuality}
                    </span>
                  </div>

                  {isStale && (
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-700/60 text-[10px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Sensor data may be stale. Polling timeout.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Node Footer */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{node.firmwareVersion}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {node.lastUpdated}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
