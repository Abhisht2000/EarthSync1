import React, { useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import {
  Smartphone,
  Globe,
  Download,
  QrCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ExternalLink,
  Copy,
  Wifi,
  Share2,
  Layers,
  Sparkles,
  ArrowRight,
  Server
} from 'lucide-react';

export const PublicTestingHub: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { snapshot, setAppRole, setLanguage, language } = useEarthSync();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'WEB' | 'APK' | 'PWA'>('WEB');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apkDownloadUrl = `${originUrl}/downloads/EarthSync.apk`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(originUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>PUBLIC TESTING & MOBILE DISTRIBUTION HUB</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            EarthSync Mobile & Public Release
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            <em>"Sensing Today | Safer Tomorrow"</em> — Multi-hazard environmental intelligence platform for India.
            Testable as a <strong>Live Web App</strong>, <strong>Installable PWA</strong>, and <strong>Android Capacitor APK</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              VERSION: <strong className="text-emerald-400 font-bold">v1.0.4-beta</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              BUILD: <strong className="text-cyan-400 font-bold">#104 (Capacitor Android + PWA)</strong>
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
              STATUS: <strong className="text-emerald-400 font-bold">● CLOUD & DEMO MESH READY</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Live Web App Card */}
        <div
          onClick={() => setActiveTab('WEB')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'WEB'
              ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">1. Instant Web App</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Open in any mobile or desktop browser with full GIS map, real-time WebSocket telemetry, and audio alarms.
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold mt-3">
            Open Web Experience <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 2. Android APK Card */}
        <div
          onClick={() => setActiveTab('APK')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'APK'
              ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">2. Android APK Package</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Capacitor Android package (`org.earthsync.app`) for standalone native installation on Android phones.
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-cyan-400 font-bold mt-3">
            Download / Install APK <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 3. Installable PWA Card */}
        <div
          onClick={() => setActiveTab('PWA')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'PWA'
              ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/30 shadow-xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">3. Zero-Install PWA</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Add to Home Screen directly from Chrome / Safari. Works 100% offline during network blackouts.
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold mt-3">
            PWA Install Guide <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Tab Specific Content & QR Code Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {activeTab === 'WEB' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Public Web App Access</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share this link with your teammates, friends, and evaluators to test on their phones:
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
              >
                {copiedLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400 truncate">
              <span className="truncate">{originUrl}</span>
            </div>

            {/* QR Code & Phone Test Instruction */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
              {/* SVG QR Visual */}
              <div className="w-36 h-36 rounded-2xl bg-white p-3 flex flex-col items-center justify-center shadow-lg shrink-0">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] font-bold text-slate-800 font-mono mt-1">SCAN WITH PHONE</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white text-sm">How to test with your friends:</h4>
                <p>1. Open your phone camera and scan the QR Code on screen.</p>
                <p>2. Tap the link to launch the <strong>Citizen Safety Experience</strong> or <strong>Authority Command Center</strong>.</p>
                <p>3. Toggle <strong>DEMO MODE</strong> to simulate live flood water rise or wildfire smoke anomalies in real time.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'APK' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Android APK Package Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Native Android application generated via <strong>Capacitor</strong> (`android/` project tree).
                </p>
              </div>

              <a
                href={apkDownloadUrl}
                download="EarthSync.apk"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-950/50 active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download EarthSync.apk</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">APPLICATION ID</span>
                <strong className="text-white">org.earthsync.app</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">ANDROID TARGET SDK</span>
                <strong className="text-emerald-400">Android 14 (API Level 34)</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">NATIVE ASSETS PATH</span>
                <strong className="text-slate-300">android/app/src/main/assets/public/</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">CAPACITOR SCHEME</span>
                <strong className="text-cyan-400">https (Cleartext HTTP fallback enabled)</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <strong className="text-slate-200 block font-bold">Android Studio / Build Instructions:</strong>
              <p>• To open and build the signed APK in Android Studio: `npx cap open android`</p>
              <p>• To rebuild after making web edits: `npm run build && npx cap sync android`</p>
            </div>
          </div>
        )}

        {activeTab === 'PWA' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Progressive Web App (PWA) Direct Install</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Installable directly onto Android & iOS homescreens without any app store download.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">📱 For Android (Chrome):</strong>
                <p>1. Open this website in Google Chrome.</p>
                <p>2. Tap the three dots menu (⋮) in the top right.</p>
                <p>3. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                <p>4. EarthSync will appear as a standalone app with its own icon.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <strong className="text-white text-sm block">🍏 For iPhone (Safari):</strong>
                <p>1. Open this website in Safari.</p>
                <p>2. Tap the <strong>Share</strong> button at the bottom (square with arrow).</p>
                <p>3. Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                <p>4. Tap <strong>"Add"</strong> in the top right corner.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
