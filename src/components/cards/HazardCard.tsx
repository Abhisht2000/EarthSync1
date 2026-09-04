import React from 'react';
import { HazardType } from '../../types/sensor';
import { RiskLevel } from '../../types/risk';
import { getRiskColor, getRiskBadgeClasses } from '../../services/riskEngine';
import { Waves, Flame, Sun, Mountain, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HazardCardProps {
  hazard: HazardType;
  title: string;
  riskScore: number;
  riskLevel: RiskLevel;
  trend: '↑ Increasing' | '→ Stable' | '↓ Decreasing' | string;
  primaryMetric: string;
  primaryValue: string;
  secondaryMetric?: string;
  secondaryValue?: string;
  summaryReason: string;
  plainLanguageNote?: string;
  onClick: () => void;
}

export const HazardCard: React.FC<HazardCardProps> = ({
  hazard,
  title,
  riskScore,
  riskLevel,
  trend,
  primaryMetric,
  primaryValue,
  secondaryMetric,
  secondaryValue,
  summaryReason,
  plainLanguageNote,
  onClick
}) => {
  const color = getRiskColor(riskLevel);
  const badgeClass = getRiskBadgeClasses(riskLevel);

  const getIcon = () => {
    switch (hazard) {
      case 'flood':
        return Waves;
      case 'wildfire':
        return Flame;
      case 'heatwave':
        return Sun;
      case 'landslide':
        return Mountain;
    }
  };

  const Icon = getIcon();

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';

  // Human-friendly status badge text
  const statusEmoji =
    riskLevel === 'CRITICAL' ? '🔴' :
    riskLevel === 'HIGH' ? '🟠' :
    riskLevel === 'WATCH' ? '🟡' : '🟢';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-slate-900/75 hover:bg-slate-850/90 border rounded-xl p-5 cursor-pointer transition-all duration-300 backdrop-blur-md flex flex-col justify-between overflow-hidden ${
        isCritical
          ? 'border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40'
          : isHigh
          ? 'border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/30'
          : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      {/* Subtle Top Glowing Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
        style={{ backgroundColor: color }}
      />

      <div>
        {/* Header with Hazard Title & Human-Friendly Level Badge */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-inner flex-shrink-0"
              style={{
                backgroundColor: `${color}18`,
                border: `1px solid ${color}40`,
                color: color
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                {title}
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Monitoring Area
              </span>
            </div>
          </div>

          {/* Simple Severity Badge */}
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${badgeClass}`}>
            <span>{statusEmoji}</span>
            <span>{riskLevel}</span>
          </span>
        </div>

        {/* Human-Friendly Plain Language Summary Note */}
        {plainLanguageNote && (
          <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono text-cyan-200">
            "{plainLanguageNote}"
          </div>
        )}

        {/* Main Score & Trend Display */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/60 my-1">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
              RISK SCORE
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className="text-3xl font-mono font-black tracking-tight"
                style={{ color }}
              >
                {riskScore}
              </span>
              <span className="text-sm font-mono text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
              WHAT'S CHANGING
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-semibold text-slate-200">
              {trend.includes('↑') ? (
                <TrendingUp className="w-4 h-4 text-orange-400" />
              ) : trend.includes('↓') ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : (
                <Minus className="w-4 h-4 text-slate-400" />
              )}
              <span>{trend}</span>
            </div>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="flex items-center justify-between pt-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{primaryMetric}:</span>
            <span className="text-slate-100 font-bold">{primaryValue}</span>
          </div>
          {secondaryMetric && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{secondaryMetric}:</span>
              <span className="text-slate-200 font-semibold">{secondaryValue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Human Reason & Progressive Disclosure Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 truncate max-w-[140px]" title={summaryReason}>
          {summaryReason}
        </span>
        <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-1 flex-shrink-0">
          VIEW DETAILS <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
