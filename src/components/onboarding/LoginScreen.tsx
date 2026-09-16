import React, { useState } from 'react';
import {
  Building2,
  ChevronRight,
  Earth,
  Phone,
  ShieldCheck,
  UserRound,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { EarthSyncLogo } from '../brand/EarthSyncLogo';
import { checkAuthorityPasscode } from '../auth/AuthorityAuthModal';

type LoginRole = 'AUTHORITY' | 'CITIZEN';

export const LoginScreen: React.FC = () => {
  const { signIn } = useEarthSync();
  const [role, setRole] = useState<LoginRole>('CITIZEN');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (role === 'AUTHORITY') {
      if (!checkAuthorityPasscode(passcode)) {
        setError('Access Denied: Invalid Authority Security Passcode. Try "EARTHSYNC" or "ADMIN2026".');
        return;
      }
    }

    signIn({ name, phoneNumber, role });
  };

  return (
    <main className="min-h-screen bg-[#070a13] text-slate-100 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(6,182,212,0.16),transparent_38%),radial-gradient(circle_at_15%_80%,rgba(16,185,129,0.09),transparent_28%)]" />
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.05fr_.95fr] rounded-3xl overflow-hidden border border-slate-700/70 bg-slate-900/80 shadow-2xl shadow-black/60">
        <section className="p-7 sm:p-10 bg-gradient-to-br from-cyan-950/50 via-slate-950 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
          <EarthSyncLogo size="lg" showText />
          <div className="mt-10 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-cyan-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />SECURE ACCESS PORTAL</span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-white">See the right details for your role.</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Authorities receive the live command dashboard, sensor coverage, and incident intelligence. Citizens receive local alerts, safety guidance, shelters, and evacuation routes.</p>
          </div>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex gap-3 rounded-2xl border border-cyan-900/60 bg-cyan-950/25 p-4"><Building2 className="w-5 h-5 text-cyan-400 shrink-0" /><div><strong className="block text-cyan-100">Authority command access</strong><span className="text-slate-400 text-xs">Operational risk, sensor and event details. Requires valid officer key.</span></div></div>
            <div className="flex gap-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-4"><ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /><div><strong className="block text-emerald-100">Citizen safety access</strong><span className="text-slate-400 text-xs">Personalised local warnings and safe actions.</span></div></div>
          </div>
        </section>

        <section className="p-7 sm:p-10">
          <h2 className="text-2xl font-bold text-white">Sign in to EarthSync</h2>
          <p className="mt-1 text-sm text-slate-400">Choose your access type and enter your details.</p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {([{ value: 'CITIZEN', label: 'Citizen', icon: ShieldCheck, hint: 'My safety' }, { value: 'AUTHORITY', label: 'Authority', icon: Building2, hint: 'Command desk' }] as const).map(({ value, label, icon: Icon, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRole(value);
                    setError(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition-all ${role === value ? value === 'CITIZEN' ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200 shadow-lg shadow-emerald-950/30' : 'border-cyan-500 bg-cyan-950/50 text-cyan-200 shadow-lg shadow-cyan-950/30' : 'border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600'}`}
                >
                  <Icon className="w-5 h-5 mb-3" /><span className="block font-bold">{label}</span><span className="block mt-1 text-[11px] opacity-70">{hint}</span>
                </button>
              ))}
            </div>
            <label className="block text-xs font-semibold text-slate-300">{role === 'AUTHORITY' ? 'Officer name / callsign' : 'Full name'}<span className="relative mt-1.5 block"><UserRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input required value={name} onChange={(e) => setName(e.target.value)} placeholder={role === 'AUTHORITY' ? 'e.g. A. Sharma, DDMA' : 'Enter your name'} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono" /></span></label>
            <label className="block text-xs font-semibold text-slate-300">Mobile number<span className="relative mt-1.5 block"><Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input required type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 98765 43210" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono" /></span></label>
            
            {role === 'AUTHORITY' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Authority Security Key <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter Passcode (e.g. EARTHSYNC)"
                    className="w-full rounded-xl border border-cyan-800/80 bg-slate-950 pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Demo Key:</span>
                  <span onClick={() => setPasscode('EARTHSYNC')} className="text-cyan-400 hover:underline cursor-pointer font-bold">
                    EARTHSYNC
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={`w-full rounded-xl py-3 text-sm font-black text-white flex items-center justify-center gap-2 transition-transform active:scale-[.98] ${role === 'CITIZEN' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}>Continue as {role === 'CITIZEN' ? 'Citizen' : 'Authority'} <ChevronRight className="w-4 h-4" /></button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500"><Earth className="w-3.5 h-3.5" /> EarthSync multi-hazard intelligence</p>
        </section>
      </div>
    </main>
  );
};
