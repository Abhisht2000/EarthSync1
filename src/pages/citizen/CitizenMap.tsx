import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { DICTIONARY } from '../../services/localization';
import { LiveGisMap } from '../../components/map/LiveGisMap';
import {
  MapPin,
  Navigation,
  Shield,
  Hospital,
  AlertTriangle,
  Compass,
  Layers,
  PhoneCall
} from 'lucide-react';

export const CitizenMap: React.FC = () => {
  const { language, closestSafeLocations, currentUser, nearbyHazards, isTrackingLocation, evacuationRoute, citizenSafetyStatus } = useEarthSync();
  const t = DICTIONARY[language];

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SHELTER' | 'HOSPITAL' | 'HAZARDS'>('ALL');
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

  const nearestShelter = closestSafeLocations[0];

  const filteredLocations = closestSafeLocations.filter((loc) => {
    if (activeCategory === 'SHELTER') return loc.type === 'shelter' || loc.type === 'relief_camp';
    if (activeCategory === 'HOSPITAL') return loc.type === 'hospital';
    return true;
  });

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto font-sans">
      {/* Top Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {t.safeMap}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {closestSafeLocations.length} {language === 'hi' ? 'सुरक्षित केंद्र' : 'Safe Zones'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'निकटतम राहत शिविर, अस्पताल एवं वास्तविक समय खतरा सीमाएं'
                  : 'Real-time relief shelters, medical centers, and geofenced hazard perimeters'}
              </p>
            </div>
          </div>

          {/* GPS tracking status strip */}
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold border ${
            isTrackingLocation
              ? 'bg-cyan-950/60 border-cyan-700/40 text-cyan-300'
              : 'bg-slate-800/60 border-slate-700/40 text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isTrackingLocation ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
            {isTrackingLocation ? (
              <><span className="text-cyan-300">📡 LIVE GPS ACTIVE</span><span className="text-slate-500 ml-1 hidden sm:inline">· {currentUser.location.latitude.toFixed(4)}, {currentUser.location.longitude.toFixed(4)} ±{currentUser.location.accuracyMeters ?? '?'}m</span></>
            ) : (
              <span>📍 Using saved location — tap Allow GPS for real-time tracking</span>
            )}
            {evacuationRoute && (
              <span className={`ml-auto shrink-0 px-2 py-0.5 rounded-full border text-[10px] ${
                citizenSafetyStatus === 'CRITICAL' ? 'bg-amber-950 border-amber-600 text-amber-300' : 'bg-emerald-950 border-emerald-600 text-emerald-300'
              }`}>
                🚶 {evacuationRoute.distanceKm}km · {evacuationRoute.etaMinutes}min
              </span>
            )}
          </div>

          {/* Quick Route to Nearest Safe Shelter */}
          {nearestShelter && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${nearestShelter.latitude},${nearestShelter.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>
                {language === 'hi' ? 'निकटतम केंद्र रूट' : 'Route to Safe Zone'} ({nearestShelter.distanceKm?.toFixed(1) || '1.2'} km)
              </span>
            </a>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'ALL'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {language === 'hi' ? 'सभी दिखाएं' : 'All Layers'}
          </button>
          <button
            onClick={() => setActiveCategory('SHELTER')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'SHELTER'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {language === 'hi' ? 'राहत शिविर' : 'Relief Shelters'}
          </button>
          <button
            onClick={() => setActiveCategory('HOSPITAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'HOSPITAL'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            {language === 'hi' ? 'अस्पताल' : 'Hospitals'}
          </button>
          <button
            onClick={() => setActiveCategory('HAZARDS')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'HAZARDS'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {language === 'hi' ? 'खतरे के क्षेत्र' : 'Hazard Zones'} ({nearbyHazards.length})
          </button>
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        <LiveGisMap isCitizenView={true} height="100%" />
      </div>

      {/* List of Closest Safe Shelters Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t.safeShelters} ({filteredLocations.length})
          </h3>
          <span className="text-xs text-slate-400">
            {language === 'hi' ? 'दूरी के अनुसार क्रमबद्ध' : 'Sorted by distance from your GPS'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLocations.map((loc) => {
            const isSelected = selectedShelterId === loc.id;
            const isHospital = loc.type === 'hospital';
            const occupied = (loc.capacity || 100) - (loc.availableCapacity || 50);

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedShelterId(loc.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isHospital
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isHospital ? <Hospital className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {language === 'hi' && loc.hindiName ? loc.hindiName : loc.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{loc.address}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    {loc.distanceKm ? `${loc.distanceKm.toFixed(1)} km` : '~'}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>
                      {language === 'hi' ? 'क्षमता:' : 'Cap:'}{' '}
                      <strong className="text-slate-200">
                        {occupied}/{loc.capacity || 100}
                      </strong>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {loc.isOperational ? 'OPERATIONAL' : 'STANDBY'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.contactPhone && (
                      <a
                        href={`tel:${loc.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title={loc.contactPhone}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{language === 'hi' ? 'मार्ग' : 'Route'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
