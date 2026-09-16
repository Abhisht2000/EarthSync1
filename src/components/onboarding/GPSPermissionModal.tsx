import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import {
  MapPin,
  ShieldCheck,
  Navigation,
  User,
  Phone,
  Wifi,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface GPSPermissionModalProps {
  onGranted: () => void;
  onSkipped: () => void;
}

export const GPSPermissionModal: React.FC<GPSPermissionModalProps> = ({
  onGranted,
  onSkipped
}) => {
  const { currentUser, setCurrentUser, setAppRole, appRole } = useEarthSync();
  const [name, setName] = useState(currentUser.name || 'Citizen User');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '+91 98765 43210');
  const [selectedRole] = useState<'CITIZEN' | 'AUTHORITY'>(
    appRole === 'AUTHORITY' ? 'AUTHORITY' : 'CITIZEN'
  );
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);

  const saveUserDetails = () => {
    setCurrentUser((prev) => ({
      ...prev,
      name: name.trim() || 'Citizen User',
      phoneNumber: phoneNumber.trim() || '+91 98765 43210',
      authenticated: true
    }));
    setAppRole(selectedRole);
    localStorage.setItem('earthsync_user_profile', JSON.stringify({
      name: name.trim() || 'Citizen User',
      phoneNumber: phoneNumber.trim() || '+91 98765 43210',
      role: selectedRole
    }));
  };

  const handleAllow = async () => {
    saveUserDetails();
    setRequesting(true);
    setDenied(false);

    if (!('geolocation' in navigator)) {
      setRequesting(false);
      setDenied(true);
      return;
    }

    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      localStorage.setItem('earthsync_gps_granted', 'true');
      onGranted();
    } catch {
      setRequesting(false);
      setDenied(true);
    }
  };

  const handleSkip = () => {
    saveUserDetails();
    localStorage.setItem('earthsync_gps_granted', 'skipped');
    onSkipped();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020710]/95 backdrop-blur-xl">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/8 blur-3xl" />
      </div>

      {/* Modal card */}
      <div className="relative w-full max-w-lg mx-4 my-auto max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Top gradient stripe */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-500 shrink-0" />

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Skip for now"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar">
          {/* Icon cluster */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Pulsing outer ring */}
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-cyan-500/10 animate-ping" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/60">
                <div className="absolute inset-0 rounded-full bg-cyan-400/5 animate-pulse" />
                <MapPin className="w-7 h-7 text-cyan-400 relative z-10" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              EARTHSYNC SAFETY SERVICES
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
              Enable GPS for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                {appRole === 'AUTHORITY' ? 'Local Operations' : 'Emergency Routing'}
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {appRole === 'AUTHORITY'
                ? 'EarthSync uses your location to centre the command view on your operational area and prioritise nearby incidents.'
                : 'EarthSync uses your real-time location to guide you to the nearest safe shelter when a hazard threatens your area.'}
            </p>
          </div>

          {/* User Details & Identity Setup */}
          <div className="space-y-3 mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>👤 User & Responder Details</span>
              <span className="text-[10px] text-cyan-400 font-mono">STEP 1 OF 2</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Full Name / Callsign</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Emergency Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-900 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-2.5 text-[11px] text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Signed in as <strong>{appRole === 'AUTHORITY' ? 'Authority' : 'Citizen'}</strong>. Your dashboard will use this location for {appRole === 'AUTHORITY' ? 'local operational context' : 'safety information'}.</span>
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="space-y-2 mb-5">
            {[
              {
                icon: Navigation,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Offline Evacuation Route',
                desc: 'Safest path to shelter — works even without internet'
              },
              {
                icon: ShieldCheck,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10 border-cyan-500/20',
                title: 'Real-Time Hazard Distance',
                desc: 'Know exactly how close a flood or fire is to you'
              },
              {
                icon: Wifi,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                title: 'CRITICAL Auto-Alert',
                desc: 'Instant voice alert + route when danger escalates'
              }
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold ${color}`}>{title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error state */}
          {denied && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300 mb-0.5">Location access denied or unavailable</p>
                <p className="text-red-400/80">
                  Check your browser settings → allow location for this site, then try again. Or skip to use a default area.
                </p>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAllow}
              disabled={requesting}
              className="relative w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-950/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
            >
              {requesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Requesting GPS access…
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Allow GPS — Guide Me to Safety
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </>
              )}
              {/* shimmer */}
              {!requesting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[200%] transition-transform duration-700" />
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 font-medium text-sm transition-all active:scale-[0.98]"
            >
              Skip for now — I'll set my location manually
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">
            🔒 Your location is stored only on this device and never shared.
          </p>
        </div>
      </div>
    </div>
  );
};
