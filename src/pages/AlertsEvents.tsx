import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { ActionableAlertCard } from '../components/cards/ActionableAlertCard';
import { EventTimeline } from '../components/common/EventTimeline';
import { Bell, Filter, CheckCheck, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types/risk';

export const AlertsEvents: React.FC = () => {
  const { snapshot, acknowledgeAlert } = useEarthSync();
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredAlerts = snapshot.alerts.filter((a) => {
    if (filterLevel === 'ALL') return true;
    if (filterLevel === 'UNACKNOWLEDGED') return !a.acknowledged;
    return a.level === filterLevel;
  });

  const handleAcknowledgeAll = () => {
    snapshot.alerts.forEach((a) => {
      if (!a.acknowledged) acknowledgeAlert(a.id);
    });
  };

  const unacknowledgedCount = snapshot.alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Alerts Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 lg:p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              EARLY WARNING DISPATCH LOG
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">
              OPERATIONS ESCALATION LOG
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            <Bell className="w-7 h-7 text-amber-400" />
            ACTIONABLE ALERTS & CHRONOLOGICAL INCIDENTS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Deterministic alarms generated with WHAT, WHY, SEVERITY, and NEXT ACTION directives.
          </p>
        </div>

        {/* Action button */}
        {unacknowledgedCount > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 transition-colors shadow-lg"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            ACKNOWLEDGE ALL ({unacknowledgedCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs">
        <span className="text-slate-400 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> FILTER:
        </span>
        {['ALL', 'UNACKNOWLEDGED', 'CRITICAL', 'HIGH', 'WATCH', 'LOW'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterLevel === lvl
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Grid: Alerts (7 cols) + Timeline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Actionable Alerts Stack */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              ACTIVE INCIDENT TICKETS ({filteredAlerts.length})
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              AUDITED DECISION SUPPORT
            </span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center font-mono text-xs text-slate-400">
              No active alerts matching filter "{filterLevel}".
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <ActionableAlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
              />
            ))
          )}
        </div>

        {/* Real-time Timeline */}
        <div className="lg:col-span-5">
          <EventTimeline events={snapshot.events} maxItems={12} />
        </div>
      </div>
    </div>
  );
};
