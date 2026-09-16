import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY } from '../../services/localization';
import { CitizenTab } from '../../components/citizen/CitizenBottomNav';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  PhoneCall,
  Home,
  BookOpen,
  Volume2,
  Info,
  Waves,
  Flame,
  Sun,
  Mountain,
  Navigation
} from 'lucide-react';

interface CitizenHomeProps {
  onNavigate: (tab: CitizenTab) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ onNavigate }) => {
  const {
    language,
    citizenSafetyStatus,
    currentUser,
    nearbyHazards,
    closestSafeLocations,
    floodRisk,
    wildfireRisk,
    heatwaveRisk,
    landslideRisk,
    snapshot,
    evacuationRoute,
    evacuationEtaMinutes,
    isTrackingLocation
  } = useEarthSync();

  const t = DICTIONARY[language];
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [acknowledgedMap, setAcknowledgedMap] = useState<Record<string, boolean>>({});

  const primaryHazard = nearbyHazards[0];

  const handleAcknowledge = (id: string) => {
    setAcknowledgedMap((prev) => ({ ...prev, [id]: true }));
  };

  const getSafetyBadge = () => {
    switch (citizenSafetyStatus) {
      case 'CRITICAL':
        return {
          title: t.criticalRisk,
          subtitle: t.criticalRiskSubtitle,
          color: 'bg-red-950/80 border-red-600/80 text-red-200',
          badgeCol: 'bg-red-600 text-white',
          icon: AlertOctagon,
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.35)] ring-2 ring-red-500/50'
        };
      case 'HIGH_RISK':
        return {
          title: t.highRisk,
          subtitle: t.highRiskSubtitle,
          color: 'bg-orange-950/80 border-orange-600/80 text-orange-200',
          badgeCol: 'bg-orange-600 text-white',
          icon: AlertTriangle,
          glow: 'shadow-[0_0_25px_rgba(249,115,22,0.3)] ring-1 ring-orange-500/40'
        };
      case 'BE_ALERT':
        return {
          title: t.beAlert,
          subtitle: t.beAlertSubtitle,
          color: 'bg-amber-950/70 border-amber-600/70 text-amber-200',
          badgeCol: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
        };
      case 'SAFE':
      default:
        return {
          title: t.safe,
          subtitle: t.safeSubtitle,
          color: 'bg-emerald-950/60 border-emerald-600/60 text-emerald-200',
          badgeCol: 'bg-emerald-600 text-white',
          icon: ShieldCheck,
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
        };
    }
  };

  const badge = getSafetyBadge();
  const Icon = badge.icon;
  const closestShelter = closestSafeLocations[0];

  return (
    <div className="space-y-5 pb-24 max-w-3xl mx-auto font-sans">
      {/* 1. HERO: "AM I SAFE?" BADGE */}
      <div className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl ${badge.color} ${badge.glow} transition-all`}>
        <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase block">
                {t.amISafe}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {badge.title}
              </h1>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider ${badge.badgeCol}`}>
            {citizenSafetyStatus}
          </span>
        </div>

        <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed mb-4">
          {badge.subtitle}
        </p>

        {/* User Location Bar */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.yourArea}: <strong>{currentUser.location.areaName}, {currentUser.location.district}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400">
            Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 2. PRIMARY ACTIONABLE HAZARD CARD (If Any Active Warning) */}
      {primaryHazard ? (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950 text-red-400 border border-red-800">
                  {primaryHazard.riskLevel} ALERT
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {primaryHazard.distanceKm} km {t.distanceAway}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {primaryHazard.title}
              </h2>
            </div>

            <button
              onClick={() => setWhyModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Why am I receiving this alert?"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.whyThisAlert}</span>
            </button>
          </div>

          {/* WHAT IS HAPPENING? */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t.whatHappened}
            </span>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              "{primaryHazard.whatHappened}"
            </p>
          </div>

          {/* WHAT SHOULD YOU DO? */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {t.whatToDo}
            </span>
            <div className="space-y-1.5 text-xs sm:text-sm font-mono text-slate-200">
              {primaryHazard.whatToDo.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions & Acknowledge */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => onNavigate('map')}
              className="w-full sm:flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>{t.viewMap}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {acknowledgedMap[primaryHazard.id] ? (
              <div className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.acknowledged}</span>
              </div>
            ) : (
              <button
                onClick={() => handleAcknowledge(primaryHazard.id)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-700 transition-colors"
              >
                {t.iUnderstand}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">All Clear in Your Monitoring Sector</h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Connected sensor nodes report hydrological and atmospheric conditions within safe historical equilibrium margins.
          </p>
        </div>
      )}

      {/* 3. QUICK SAFETY TOOLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs">
        {/* Nearest Shelter */}
        {closestShelter && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Home className="w-4 h-4" /> NEAREST SAFE SHELTER
                </span>
                <span className="text-cyan-300 font-bold">{closestShelter.distanceKm} km away</span>
              </div>
              <h4 className="font-bold text-white text-sm truncate mb-1">
                {language === 'hi' && closestShelter.hindiName ? closestShelter.hindiName : closestShelter.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mb-2">{closestShelter.address}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Capacity: <strong className="text-emerald-400">{closestShelter.availableCapacity} beds</strong></span>
              <a href={`tel:${closestShelter.contactPhone}`} className="text-cyan-400 font-bold underline">
                Call Shelter
              </a>
            </div>
          </div>
        )}

        {/* Safe Route Quick Action */}
        {evacuationRoute && (
          <div
            onClick={() => onNavigate('map')}
            className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between group transition-all ${
              citizenSafetyStatus === 'CRITICAL' || citizenSafetyStatus === 'HIGH_RISK'
                ? 'bg-amber-950/80 border-amber-600/60 hover:border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'bg-emerald-950/60 border-emerald-700/50 hover:border-emerald-500'
            }`}
          >
            <div>
              <div className={`flex items-center gap-1.5 font-bold mb-1.5 ${
                citizenSafetyStatus === 'CRITICAL' || citizenSafetyStatus === 'HIGH_RISK'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                <Navigation className="w-4 h-4" />
                {citizenSafetyStatus === 'CRITICAL' ? 'EVACUATE NOW' : 'SAFE ROUTE READY'}
                {isTrackingLocation && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                {evacuationRoute.shelterName}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {evacuationRoute.isHighGroundRoute ? '✓ High-ground flood-safe path' : 'Optimal walking route computed'}
              </p>
            </div>
            <div className={`pt-2 border-t flex items-center justify-between font-bold ${
              citizenSafetyStatus === 'CRITICAL' || citizenSafetyStatus === 'HIGH_RISK'
                ? 'border-amber-800/60 text-amber-400'
                : 'border-emerald-800/60 text-emerald-400'
            }`}>
              <span className="font-mono text-xs">{evacuationRoute.distanceKm} km · ~{evacuationEtaMinutes} min walk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        {/* Emergency Guides Shortcut */}
        <div
          onClick={() => onNavigate('guides')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer flex flex-col justify-between group transition-all"
        >
          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5">
              <BookOpen className="w-4 h-4" /> EMERGENCY GUIDES
            </div>
            <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
              Actionable Survival DOs and DON'Ts
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Step-by-step instructions for Floods, Fires, Landslides, and Heatwaves. Cached for offline use.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-cyan-400 font-bold">
            <span>Read Guides</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. MULTI-HAZARD SECTOR READINESS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 font-mono text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
          REGIONAL HAZARD MONITORING SUMMARY
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 mb-1">
              <Waves className="w-3.5 h-3.5 text-cyan-400" /> Flood
            </span>
            <span className="text-base font-bold text-white">{floodRisk.riskScore}%</span>
            <span className="text-[10px] text-slate-400 block">{floodRisk.riskLevel}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Wildfire
            </span>
            <span className="text-base font-bold text-white">{wildfireRisk.riskScore}%</span>
            <span className="text-[10px] text-slate-400 block">{wildfireRisk.riskLevel}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 mb-1">
              <Sun className="w-3.5 h-3.5 text-yellow-400" /> Heatwave
            </span>
            <span className="text-base font-bold text-white">{heatwaveRisk.riskScore}%</span>
            <span className="text-[10px] text-slate-400 block">{heatwaveRisk.riskLevel}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="flex items-center gap-1 text-slate-400 mb-1">
              <Mountain className="w-3.5 h-3.5 text-stone-400" /> Landslide
            </span>
            <span className="text-base font-bold text-white">{landslideRisk.riskScore}%</span>
            <span className="text-[10px] text-slate-400 block">{landslideRisk.riskLevel}</span>
          </div>
        </div>
      </div>

      {/* "WHY THIS ALERT?" EXPLANATION MODAL */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-cyan-800/80 rounded-3xl p-6 max-w-lg w-full font-mono space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                {t.whyThisAlert}
              </h3>
              <button
                onClick={() => setWhyModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are receiving this localized early warning because your registered location in <strong>{currentUser.location.district}</strong> is within <strong>{primaryHazard?.distanceKm || 3.2} km</strong> of an active sensor monitoring zone.
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div><strong>Hazard Type:</strong> {primaryHazard?.hazardType.toUpperCase()}</div>
                <div><strong>Evaluated Risk:</strong> {primaryHazard?.riskScore}% ({primaryHazard?.riskLevel})</div>
                <div><strong>Detection Source:</strong> Edge Field Sensor Telemetry</div>
                <div><strong>Multi-Sensor Confirmation:</strong> {primaryHazard?.confirmedByMultiSensor ? 'Confirmed by 3 Orthogonal Vectors' : 'Sustained Threshold Crossing'}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                EarthSync uses deterministic geofencing to protect citizens without sending unnecessary alerts to unaffected districts.
              </p>
            </div>

            <button
              onClick={() => setWhyModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
