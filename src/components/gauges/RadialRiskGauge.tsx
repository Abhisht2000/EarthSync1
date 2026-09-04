import React from 'react';
import { RiskLevel } from '../../types/risk';
import { getRiskColor, getRiskLevel } from '../../services/riskEngine';

interface RadialRiskGaugeProps {
  score: number; // 0 - 100
  size?: number; // width/height in px (default 200)
  label?: string;
  sublabel?: string;
  showTicks?: boolean;
}

export const RadialRiskGauge: React.FC<RadialRiskGaugeProps> = ({
  score,
  size = 200,
  label = 'COMPOSITE RISK',
  sublabel,
  showTicks = true
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const level: RiskLevel = getRiskLevel(normalizedScore);
  const color = getRiskColor(level);

  // SVG Gauge calculations (240 degree arc from 150 deg to 390 deg)
  const radius = (size / 2) - 22;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 70% of the full circle
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center select-none relative">
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
        >
          {/* Defs for Glow Filter */}
          <defs>
            <filter id={`glow-${normalizedScore}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
            opacity="0.8"
          />

          {/* Active Colored Risk Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(140 ${center} ${center})`}
            className="transition-all duration-700 ease-out"
            filter={`url(#glow-${normalizedScore})`}
          />

          {/* Segment ticks if enabled */}
          {showTicks && (
            <g opacity="0.3">
              {[0, 25, 50, 75, 100].map((tick, i) => {
                const angle = 140 + (tick / 100) * 260;
                const rad = (angle * Math.PI) / 180;
                const x1 = center + (radius - 12) * Math.cos(rad);
                const y1 = center + (radius - 12) * Math.sin(rad);
                const x2 = center + (radius - 4) * Math.cos(rad);
                const y2 = center + (radius - 4) * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Center Readout Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-0.5">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span
              className="text-4xl md:text-5xl font-mono font-black tracking-tight transition-colors duration-500"
              style={{ color }}
            >
              {normalizedScore}
            </span>
            <span className="text-xl font-mono font-bold text-slate-400">%</span>
          </div>

          {/* Risk Level Badge */}
          <div
            className="mt-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors duration-500 shadow-sm"
            style={{
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}50`
            }}
          >
            {level}
          </div>

          {sublabel && (
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              {sublabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
