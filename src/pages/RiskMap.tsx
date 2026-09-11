import React from 'react';
import { LiveGisMap } from '../components/map/LiveGisMap';
import { useEarthSync } from '../context/EarthSyncContext';
import { Radio, ShieldAlert, Wifi, Layers } from 'lucide-react';

export const RiskMap: React.FC = () => {
  const { snapshot } = useEarthSync();

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 lg:p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              GEOSPATIAL EARLY WARNING GRID
            </span>
            <span className="text-slate-500">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
              OPEN GIS ENGINE ACTIVE
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            REAL-TIME SENSOR NETWORK & GIS TOPOLOGY
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            {snapshot.nodes.length} SENSORS
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
            {snapshot.gateways.length} GATEWAYS
          </span>
        </div>
      </div>

      {/* Live Map Box */}
      <LiveGisMap height="640px" isCitizenView={false} />
    </div>
  );
};
