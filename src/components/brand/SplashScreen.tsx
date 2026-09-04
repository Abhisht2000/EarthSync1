import React, { useState, useEffect } from 'react';
import { EarthSyncLogo } from './EarthSyncLogo';
import { ShieldCheck, ChevronRight, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(15);

  const messages = [
    'INITIALIZING SENSOR NETWORK...',
    'LOADING ENVIRONMENTAL INTELLIGENCE...',
    'CONNECTING TO MONITORING NODES...',
    'RISK ENGINE READY...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
      setProgress((p) => Math.min(100, p + 28));
    }, 650);

    return () => clearInterval(interval);
  }, [messages.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070a13] flex flex-col items-center justify-center p-6 text-slate-100 select-none overflow-hidden">
      {/* Background Subtle Radar Scan Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Brand Presentation */}
      <div className="relative z-10 flex flex-col items-center max-w-xl text-center">
        {/* Animated Brand Vector */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
          <EarthSyncLogo size="xl" showText={false} />
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-wider uppercase text-white mb-2">
          EARTH<span className="text-cyan-400">SYNC</span>
        </h1>

        <p className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-cyan-400 font-bold mb-6">
          MULTI-HAZARD INTELLIGENCE
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono mb-10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>"SENSE THE EARTH. UNDERSTAND THE RISK. ACT BEFORE DISASTER."</span>
        </div>

        {/* Progress & Console Loading Status */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-3">
            <span className="flex items-center gap-2 text-cyan-400">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              {messages[step]}
            </span>
            <span className="text-slate-500">{progress}%</span>
          </div>

          {/* Progress track */}
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-4 border border-slate-800/50">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              SIH PROTOTYPE COMMAND SYSTEM
            </span>
            <button
              onClick={onComplete}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors py-0.5 px-2 rounded hover:bg-slate-800"
            >
              Skip Intro <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
