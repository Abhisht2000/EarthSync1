import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Send,
  PhoneCall,
  Bell,
  CheckCircle2,
  Shield,
  Radio
} from 'lucide-react';

export const CitizenImpact: React.FC = () => {
  const { snapshot, closestSafeLocations, playVoiceAlert } = useEarthSync();
  const impact = snapshot.citizenImpact || {
    hazardId: 'HAZ-MULTI-01',
    zoneName: 'Song River Basin & Rishikesh Escarpment',
    affectedRadiusKm: 5.2,
    estimatedCitizenPopulation: 18450,
    notificationDelivery: {
      inAppDelivered: 14200,
      pushSent: 16800,
      pushDelivered: 15400,
      smsSent: 24500,
      smsDelivered: 23800,
      voiceCallsTriggered: 3200,
      totalAcknowledged: 14950
    },
    sheltersOpenInZone: 4,
    shelterCapacityTotal: 4500,
    shelterOccupancy: 1820,
    lastCalculatedAt: new Date().toISOString()
  };

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage) return;
    playVoiceAlert(`EMERGENCY BROADCAST ISSUED: ${broadcastMessage}`);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
    setBroadcastMessage('');
  };

  const totalCitizens = impact.estimatedCitizenPopulation || 18450;
  const safeCount = Math.round(totalCitizens * 0.77);
  const beAlertCount = Math.round(totalCitizens * 0.17);
  const highRiskCount = Math.round(totalCitizens * 0.045);
  const criticalCount = totalCitizens - safeCount - beAlertCount - highRiskCount;

  const safePct = Math.round((safeCount / totalCitizens) * 100);
  const alertPct = Math.round((beAlertCount / totalCitizens) * 100);
  const highRiskPct = Math.round((highRiskCount / totalCitizens) * 100);
  const criticalPct = Math.round((criticalCount / totalCitizens) * 100);
  const shelterOccPct = Math.round((impact.shelterOccupancy / (impact.shelterCapacityTotal || 1)) * 100);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>POPULATION RESILIENCE & EVACUATION</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Citizen Impact & Early Warning
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time population exposure tracking, multi-channel CAP alert broadcast funnel, and shelter occupancy
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{totalCitizens.toLocaleString()} CITIZENS</span>
          </div>
        </div>
      </div>

      {/* Population Risk Distribution Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <span>SAFE SECTORS</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {safeCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${safePct}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">{safePct}% of population</span>
        </div>

        <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span>BE ALERT ADVISORY</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {beAlertCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${alertPct}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">{alertPct}% of population</span>
        </div>

        <div className="bg-slate-900/60 border border-orange-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-orange-400 text-xs font-mono">
            <span>HIGH RISK ZONES</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {highRiskCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${highRiskPct}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">{highRiskPct}% of population</span>
        </div>

        <div className="bg-slate-900/60 border border-red-500/40 rounded-2xl p-4">
          <div className="flex items-center justify-between text-red-400 text-xs font-mono">
            <span>CRITICAL EVACUATION</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {criticalCount.toLocaleString()}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${criticalPct}%` }} />
          </div>
          <span className="text-[11px] text-red-400 mt-1.5 block font-bold">{criticalPct}% require immediate action</span>
        </div>
      </div>

      {/* Multi-Channel Notification Funnel & CAP Broadcast Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dissemination Funnel Stats */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Alert Broadcast Funnel
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>PWA & App Push Delivered</span>
              </div>
              <strong className="text-white font-mono">{impact.notificationDelivery?.pushDelivered?.toLocaleString() || '15,400'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>SMS Cell Broadcast (TRAI)</span>
              </div>
              <strong className="text-white font-mono">{impact.notificationDelivery?.smsDelivered?.toLocaleString() || '23,800'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-purple-400" />
                <span>Automated IVR Voice Calls</span>
              </div>
              <strong className="text-white font-mono">{impact.notificationDelivery?.voiceCallsTriggered?.toLocaleString() || '3,200'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-emerald-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Citizen Acknowledgments</span>
              </div>
              <strong className="text-emerald-300 font-mono font-bold">
                {impact.notificationDelivery?.totalAcknowledged?.toLocaleString() || '14,950'}
              </strong>
            </div>
          </div>
        </div>

        {/* Rapid CAP Emergency Broadcast Form */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-red-400" />
              Common Alerting Protocol (CAP) Dispatcher
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Standard ITU-T X.1303</span>
          </div>

          {broadcastSent && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CAP Alert Dispatched over SMS, PWA Push, and Local LoRa Sirens!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="text-slate-400 font-medium">Severity Tier:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setBroadcastSeverity('CRITICAL')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    broadcastSeverity === 'CRITICAL'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CRITICAL
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastSeverity('WARNING')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    broadcastSeverity === 'WARNING'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  WARNING
                </button>
                <button
                  type="button"
                  onClick={() => setBroadcastSeverity('INFO')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    broadcastSeverity === 'INFO'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  INFO
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Enter official emergency instruction to broadcast to all citizens in geofenced danger sectors..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              required
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                Targets: Song River Basin, Rishikesh Ghats, & Haridwar Zone
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH EMERGENCY BROADCAST</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Designated Evacuation Shelters & Hospitals */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Designated Relief Shelters & Medical Hubs
          </h2>
          <div className="text-xs font-mono text-slate-300">
            TOTAL OCCUPANCY:{' '}
            <strong className="text-emerald-400">
              {impact.shelterOccupancy} / {impact.shelterCapacityTotal} ({shelterOccPct}%)
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {closestSafeLocations.map((shelter) => {
            const occupied = (shelter.capacity || 100) - (shelter.availableCapacity || 50);
            const occRate = Math.round((occupied / (shelter.capacity || 100)) * 100);
            return (
              <div
                key={shelter.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{shelter.name}</h3>
                    <p className="text-[11px] text-slate-400">{shelter.address}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                    {shelter.type}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      occRate > 80 ? 'bg-red-500' : occRate > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                  <span>
                    Occupancy: <strong className="text-slate-200">{occupied}/{shelter.capacity || 100}</strong> ({occRate}%)
                  </span>
                  <span className="text-emerald-400">{shelter.isOperational ? 'OPERATIONAL' : 'STANDBY'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
