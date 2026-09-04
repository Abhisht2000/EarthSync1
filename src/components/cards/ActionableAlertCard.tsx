import React from 'react';
import { ActionableAlert } from '../../types/alert';
import { getRiskColor, getRiskBadgeClasses } from '../../services/riskEngine';
import { AlertCircle, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface ActionableAlertCardProps {
  alert: ActionableAlert;
  onAcknowledge?: (id: string) => void;
  onClick?: () => void;
}

export const ActionableAlertCard: React.FC<ActionableAlertCardProps> = ({
  alert,
  onAcknowledge,
  onClick
}) => {
  const color = getRiskColor(alert.level);
  const badgeClass = getRiskBadgeClasses(alert.level);

  const emoji =
    alert.level === 'CRITICAL' ? '🔴' :
    alert.level === 'HIGH' ? '🟠' :
    alert.level === 'WATCH' ? '🟡' : '🟢';

  return (
    <div
      onClick={onClick}
      className={`border rounded-xl p-4.5 backdrop-blur-md transition-all relative overflow-hidden ${
        alert.acknowledged
          ? 'bg-slate-900/50 border-slate-800/60 opacity-70'
          : alert.level === 'CRITICAL'
          ? 'bg-red-950/30 border-red-800/80 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          : alert.level === 'HIGH'
          ? 'bg-orange-950/30 border-orange-800/70 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
          : 'bg-slate-900/80 border-slate-800/80'
      }`}
    >
      {/* Top Left Severity Stripe */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Header Row */}
      <div className="flex items-center justify-between pl-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border flex items-center gap-1.5 ${badgeClass}`}>
            <span>{emoji}</span>
            <span>{alert.level} ALERT</span>
          </span>
          <span className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wide">
            {alert.hazard} WARNING
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300">
            Risk: {alert.riskScore}%
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {alert.relativeTime}
          </span>
          {alert.acknowledged ? (
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACKNOWLEDGED
            </span>
          ) : (
            onAcknowledge && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAcknowledge(alert.id);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors font-semibold"
              >
                ACKNOWLEDGE
              </button>
            )
          )}
        </div>
      </div>

      {/* Target Node & Monitoring Area */}
      <div className="flex items-center gap-2 pl-2 mb-3 text-xs font-mono text-cyan-300">
        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-bold">{alert.nodeId}</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-400 truncate">{alert.zone}</span>
      </div>

      {/* The 3 Plain Language Dimensions: WHAT HAPPENED, WHY IT MATTERS, WHAT TO DO NEXT */}
      <div className="pl-2 space-y-2 text-xs font-mono">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              WHAT HAPPENED
            </span>
            <p className="text-slate-200 leading-snug">{alert.what}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              WHY IT MATTERS
            </span>
            <p className="text-slate-300 leading-snug">{alert.why}</p>
          </div>

          <div>
            <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-cyan-400" />
              WHAT TO DO NEXT
            </span>
            <p className="text-amber-200/90 font-medium leading-snug">{alert.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
