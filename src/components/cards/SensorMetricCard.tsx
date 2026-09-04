import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface SensorMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subLabel?: string; // e.g. "Rising quickly", "Getting hotter", "Getting drier"
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  sparklineData?: number[];
  status?: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  lastUpdate?: string;
  color?: string; // hex accent color
}

export const SensorMetricCard: React.FC<SensorMetricCardProps> = ({
  title,
  value,
  unit,
  subLabel,
  trendText,
  trendDirection = 'stable',
  icon: Icon,
  sparklineData = [20, 24, 22, 28, 32, 35, 38],
  status = 'NORMAL',
  lastUpdate = '2s ago',
  color = '#06b6d4'
}) => {
  const chartPoints = sparklineData.map((val, i) => ({ i, val }));

  const statusColor =
    status === 'CRITICAL'
      ? '#ef4444'
      : status === 'ELEVATED'
      ? '#f59e0b'
      : '#10b981';

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden transition-all hover:border-slate-700/80 hover:bg-slate-850/80 group">
      {/* Top row: Title and Icon */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${color}15`,
                color: color
              }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              {title}
            </span>
          </div>

          {/* Live Status indicator dot */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-slate-400 uppercase">{status}</span>
          </div>
        </div>

        {/* Self-explanatory human-readable sublabel */}
        {subLabel && (
          <div className="text-[11px] font-mono font-medium text-cyan-300 mb-1">
            "{subLabel}"
          </div>
        )}
      </div>

      {/* Main Metric Value and Sparkline */}
      <div className="grid grid-cols-2 items-end gap-2 my-1">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-mono font-black text-slate-100 tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-mono font-semibold text-slate-400">
                {unit}
              </span>
            )}
          </div>

          {/* Trend indicator */}
          {trendText && (
            <div className="flex items-center gap-1 text-[11px] font-mono font-semibold mt-1">
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              ) : trendDirection === 'down' ? (
                <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className={trendDirection === 'up' ? 'text-orange-300' : 'text-slate-300'}>
                {trendText}
              </span>
            </div>
          )}
        </div>

        {/* Micro Sparkline Chart */}
        <div className="h-10 w-full opacity-85 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints}>
              <Line
                type="monotone"
                dataKey="val"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer: Last update timestamp */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
        <span>POLLING: 2.5s</span>
        <span className="text-slate-400">UPDATED: {lastUpdate}</span>
      </div>
    </div>
  );
};
