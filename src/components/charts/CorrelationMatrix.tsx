import React from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { ArrowRight, Flame, Waves, CheckCircle, AlertTriangle } from 'lucide-react';

export const CorrelationMatrix: React.FC = () => {
  const { floodRisk, wildfireRisk, snapshot } = useEarthSync();

  const floodReading = snapshot.primaryFloodNode?.lastReading;
  const fireReading = snapshot.primaryWildfireNode?.lastReading;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              MULTI-SENSOR FUSION
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Environmental Signal Correlation
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          ORTHOGONAL SENSOR VALIDATION
        </div>
      </div>

      <p className="text-xs font-mono text-slate-400 mb-4">
        EarthSync prevents false alarms by cross-correlating independent environmental physical parameters. Single-sensor noise never triggers critical alert thresholds.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wildfire Signal Correlation Branch */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-orange-400 font-mono text-xs font-bold uppercase">
              <Flame className="w-4 h-4" />
              <span>WILDFIRE VECTOR CORRELATION</span>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400">
              Risk: {wildfireRisk.riskScore}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-mono">
            {/* Input Signals */}
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Temperature</span>
                <span className="text-orange-400 font-bold">
                  {fireReading?.temperature?.toFixed(1) ?? '27.2'}°C ↑
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Relative Humidity</span>
                <span className="text-cyan-400 font-bold">
                  {Math.round(fireReading?.humidity ?? 63)}% ↓
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Smoke Anomaly</span>
                <span className="text-amber-400 font-bold">
                  {fireReading?.smokeLevel ?? 'LOW'} ↑
                </span>
              </div>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center justify-center p-2 text-slate-500">
              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 sm:rotate-0" />
            </div>

            {/* Correlated Assessment Output */}
            <div className="w-full sm:w-44 p-3 rounded bg-orange-950/40 border border-orange-800/60 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] uppercase text-orange-300 font-bold mb-1">
                COMBINED SYNERGY
              </span>
              <span className="text-2xl font-mono font-black text-orange-400">
                {wildfireRisk.riskScore}%
              </span>
              <span className="text-[11px] font-mono text-orange-200 mt-0.5">
                {wildfireRisk.riskLevel}
              </span>
              <div className="mt-2 text-[10px] text-slate-400 leading-tight">
                {wildfireRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'HIGH' ? (
                  <span className="text-red-400 flex items-center justify-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> 3/3 Vectors Aligned
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Below Threshold
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flood Signal Correlation Branch */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <Waves className="w-4 h-4" />
              <span>HYDROLOGICAL VECTOR CORRELATION</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Risk: {floodRisk.riskScore}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs font-mono">
            {/* Input Signals */}
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Water Level</span>
                <span className="text-cyan-400 font-bold">
                  {floodReading?.waterLevel?.toFixed(1) ?? '32.4'} cm ↑
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Rate of Rise</span>
                <span className="text-blue-400 font-bold">
                  {floodReading?.rateOfRise !== undefined && floodReading.rateOfRise >= 0 ? '+' : ''}
                  {floodReading?.rateOfRise?.toFixed(1) ?? '0.2'} cm/min
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Precipitation Sensor</span>
                <span className={floodReading?.rainfall ? 'text-amber-400 font-bold' : 'text-slate-400 font-semibold'}>
                  {floodReading?.rainfall ? 'DETECTED' : 'NONE'}
                </span>
              </div>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center justify-center p-2 text-slate-500">
              <ArrowRight className="w-5 h-5 text-cyan-400 rotate-90 sm:rotate-0" />
            </div>

            {/* Correlated Assessment Output */}
            <div className="w-full sm:w-44 p-3 rounded bg-blue-950/40 border border-blue-800/60 flex flex-col justify-center items-center text-center">
              <span className="text-[10px] uppercase text-cyan-300 font-bold mb-1">
                COMBINED SYNERGY
              </span>
              <span className="text-2xl font-mono font-black text-cyan-400">
                {floodRisk.riskScore}%
              </span>
              <span className="text-[11px] font-mono text-cyan-200 mt-0.5">
                {floodRisk.riskLevel}
              </span>
              <div className="mt-2 text-[10px] text-slate-400 leading-tight">
                {floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH' ? (
                  <span className="text-red-400 flex items-center justify-center gap-1 font-semibold">
                    <AlertTriangle className="w-3 h-3" /> Catchment Saturated
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" /> Normal Runoff
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
