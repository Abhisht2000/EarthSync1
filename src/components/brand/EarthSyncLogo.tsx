import React from 'react';

interface EarthSyncLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const EarthSyncLogo: React.FC<EarthSyncLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-4xl', sub: 'text-sm' }
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${dim.box} flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]">
          <defs>
            <linearGradient id="esRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="esFlameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="esWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {/* Outer Earth Radar Ring */}
          <circle cx="50" cy="50" r="46" fill="#0b1120" stroke="url(#esRingGrad)" strokeWidth="2.5" />

          {/* Radar Wave Pulse Arcs */}
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="26"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.4"
          />

          {/* Mountain Contour (Natural Hazards / Terrain) */}
          <path
            d="M20 74 L38 52 L50 64 L68 44 L80 74 Z"
            fill="#1e293b"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Curved Hydro Wave (Flood) */}
          <path
            d="M18 64 Q 35 48, 52 64 T 82 56"
            fill="none"
            stroke="url(#esWaveGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Subtle Wildfire Flame Accent */}
          <path
            d="M50 22 C 43 33, 41 42, 50 50 C 58 42, 57 33, 50 22 Z"
            fill="url(#esFlameGrad)"
            opacity="0.95"
            className="drop-shadow-[0_0_8px_rgba(234,88,12,0.8)]"
          />

          {/* Connected Sync Nodes */}
          <circle cx="50" cy="50" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="28" cy="34" r="2.5" fill="#06b6d4" />
          <circle cx="72" cy="34" r="2.5" fill="#f59e0b" />
          <circle cx="80" cy="65" r="2.5" fill="#10b981" />
          <circle cx="20" cy="65" r="2.5" fill="#38bdf8" />

          {/* Connecting Thin Radar Vectors */}
          <line x1="50" y1="50" x2="28" y2="34" stroke="#06b6d4" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
          <line x1="50" y1="50" x2="72" y2="34" stroke="#f59e0b" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-black tracking-wider text-slate-100 uppercase ${dim.text} flex items-center gap-1.5 leading-none`}>
            <span>EARTH</span>
            <span className="text-cyan-400">SYNC</span>
          </div>
          <span className={`font-mono uppercase tracking-widest text-slate-400 font-semibold mt-1 ${dim.sub}`}>
            Multi-Hazard Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
