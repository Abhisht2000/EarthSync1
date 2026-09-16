import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useEarthSync } from '../../context/EarthSyncContext';

// Valid master authority credentials (case-insensitive)
export const VALID_AUTHORITY_PASSCODES = [
  'EARTHSYNC',
  'ADMIN2026',
  'NDRF2026',
  'AUTHORITY',
  '8899',
  '1234'
];

export const checkAuthorityPasscode = (code: string): boolean => {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  return VALID_AUTHORITY_PASSCODES.includes(clean);
};

interface AuthorityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthorityAuthModal: React.FC<AuthorityAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { setAppRole, currentUser, setCurrentUser } = useEarthSync();
  const [passcode, setPasscode] = useState('');
  const [badgeId, setBadgeId] = useState(currentUser.name || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      if (checkAuthorityPasscode(passcode)) {
        setIsSuccess(true);
        if (badgeId.trim()) {
          setCurrentUser((prev) => ({
            ...prev,
            name: badgeId.trim()
          }));
        }
        setTimeout(() => {
          setAppRole('AUTHORITY');
          setIsVerifying(false);
          setIsSuccess(false);
          setPasscode('');
          onClose();
          onSuccess?.();
        }, 500);
      } else {
        setIsVerifying(false);
        setError('Invalid Authority Credentials. Access Denied.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#090e1c] border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/50 font-sans text-slate-100 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/50">
            {isSuccess ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-6 h-6 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">Authority Verification</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-[10px] font-bold">
                RESTRICTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter official security credentials to access the Command Deck.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Officer ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Officer Callsign / Badge ID
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                placeholder="e.g. Officer Sharma, NDRF Command"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Security Passcode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Authority Security Passcode <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter passcode (e.g. EARTHSYNC)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Passcode Hint Chip */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="text-slate-400">Valid Keys:</span>
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => setPasscode('EARTHSYNC')}
                className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold cursor-pointer hover:bg-cyan-900"
                title="Click to fill"
              >
                EARTHSYNC
              </span>
              <span
                onClick={() => setPasscode('ADMIN2026')}
                className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold cursor-pointer hover:bg-slate-800"
                title="Click to fill"
              >
                ADMIN2026
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !passcode.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : isSuccess ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Authorized!</span>
                </>
              ) : (
                <>
                  <span>Authenticate</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
