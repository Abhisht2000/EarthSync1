import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { HistoricalReading } from '../../types/sensor';
import { Waves, Thermometer, Droplets, Wind, CloudRain, ShieldAlert } from 'lucide-react';

interface LiveTrendChartProps {
  data: HistoricalReading[];
}

type MetricKey =
  | 'waterLevel'
  | 'temperature'
  | 'humidity'
  | 'smokePpm'
  | 'rainfall'
  | 'riskScore';

interface MetricConfig {
  key: MetricKey;
  label: string;
  unit: string;
  color: string;
  gradientId: string;
  icon: any;
  threshold?: number;
  thresholdLabel?: string;
  domain?: [number, number];
}

export const LiveTrendChart: React.FC<LiveTrendChartProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('waterLevel');

  const configs: Record<MetricKey, MetricConfig> = {
    waterLevel: {
      key: 'waterLevel',
      label: 'Water Level',
      unit: 'cm',
      color: '#0284c7',
      gradientId: 'gradWater',
      icon: Waves,
      threshold: 60,
      thresholdLabel: 'High Alert (60cm)',
      domain: [15, 80]
    },
    temperature: {
      key: 'temperature',
      label: 'Temperature',
      unit: '°C',
      color: '#ea580c',
      gradientId: 'gradTemp',
      icon: Thermometer,
      threshold: 32,
      thresholdLabel: 'Heat Threshold (32°C)',
      domain: [20, 42]
    },
    humidity: {
      key: 'humidity',
      label: 'Humidity',
      unit: '%',
      color: '#06b6d4',
      gradientId: 'gradHum',
      icon: Droplets,
      threshold: 45,
      thresholdLabel: 'Dry Warning (<45%)',
      domain: [25, 90]
    },
    smokePpm: {
      key: 'smokePpm',
      label: 'Smoke Particulate',
      unit: 'ppm',
      color: '#eab308',
      gradientId: 'gradSmoke',
      icon: Wind,
      threshold: 150,
      thresholdLabel: 'Particulate Anomaly (150ppm)',
      domain: [0, 400]
    },
    rainfall: {
      key: 'rainfall',
      label: 'Rainfall Event',
      unit: 'active',
      color: '#3b82f6',
      gradientId: 'gradRain',
      icon: CloudRain,
      threshold: 0.5,
      thresholdLabel: 'Rain Triggered',
      domain: [0, 1.2]
    },
    riskScore: {
      key: 'riskScore',
      label: 'Composite Risk',
      unit: '%',
      color: '#ef4444',
      gradientId: 'gradRisk',
      icon: ShieldAlert,
      threshold: 75,
      thresholdLabel: 'Critical Risk (75%)',
      domain: [0, 100]
    }
  };

  const currentConfig = configs[selectedMetric];
  const lastPoint = data[data.length - 1] || {};
  const currentValue = lastPoint[selectedMetric] ?? '--';

  // Simple human-friendly plain English status
  const getHumanFriendlyStatus = () => {
    const val = Number(currentValue) || 0;
    if (selectedMetric === 'waterLevel') {
      if (val > 60) return 'Rising quickly — Water depth exceeding normal banks';
      if (val > 45) return 'Rising steadily — Upstream water flowing in';
      return 'Normal water level — Flowing safely';
    }
    if (selectedMetric === 'temperature') {
      if (val >= 32) return 'Getting hotter — Heat threshold crossed';
      if (val >= 29) return 'Warming up — Dry heat observed';
      return 'Comfortable — Seasonal normal temperature';
    }
    if (selectedMetric === 'humidity') {
      if (val < 45) return 'Getting drier — Dry vegetation increases fire risk';
      if (val < 55) return 'Mildly dry — Normal breeze';
      return 'Normal moisture — Well-balanced air';
    }
    if (selectedMetric === 'smokePpm') {
      if (val > 150) return 'Smoke level is increasing — Combustion detected';
      if (val > 80) return 'Moderate smoke particles detected';
      return 'Clean air — Normal background level';
    }
    if (selectedMetric === 'rainfall') {
      return val >= 0.5 ? 'Raining — Ground saturation increasing' : 'No rainfall detected — Dry weather';
    }
    if (selectedMetric === 'riskScore') {
      if (val >= 75) return 'CRITICAL DANGER — Immediate response required';
      if (val >= 50) return 'HIGH DANGER — Warning signs detected';
      if (val >= 25) return 'WATCH STATUS — Under close observation';
      return 'SAFE — All environmental factors are normal';
    }
    return 'Observing environmental conditions';
  };

  const prevPoint = data[data.length - 4] || data[0] || {};
  const prevValue = Number(prevPoint[selectedMetric] || 0);
  const diff = Number(currentValue) - prevValue;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
      {/* Header with Metric Switcher Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              REAL-TIME SENSOR GRAPH
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {currentConfig.label}
            </h2>
            <span className="text-2xl font-mono font-black text-cyan-300">
              {currentValue} {currentConfig.unit}
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                diff > 0
                  ? 'text-orange-400'
                  : diff < 0
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              ({diff >= 0 ? '↑' : '↓'}
              {Math.abs(diff).toFixed(1)} last 4m)
            </span>
          </div>
          {/* Plain English explanation */}
          <div className="mt-1 text-xs font-mono text-cyan-200/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>"{getHumanFriendlyStatus()}"</span>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800">
          {(Object.keys(configs) as MetricKey[]).map((key) => {
            const cfg = configs[key];
            const Icon = cfg.icon;
            const isSelected = selectedMetric === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isSelected ? cfg.color : undefined }}
                />
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={currentConfig.domain || ['auto', 'auto']}
              tickFormatter={(v) => `${v}${currentConfig.unit !== 'active' ? currentConfig.unit : ''}`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs backdrop-blur-md">
                      <div className="text-slate-400 mb-1 border-b border-slate-800 pb-1 flex justify-between">
                        <span>TIMESTAMP:</span>
                        <span className="text-slate-200 font-bold">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: currentConfig.color }}
                        />
                        <span className="text-slate-300">{currentConfig.label}:</span>
                        <span className="font-bold text-white text-sm">
                          {payload[0].value} {currentConfig.unit}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {currentConfig.threshold && (
              <ReferenceLine
                y={currentConfig.threshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: currentConfig.thresholdLabel,
                  fill: '#f87171',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={currentConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${currentConfig.gradientId})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Telemetry Metadata */}
      <div className="flex flex-wrap items-center justify-between pt-3 mt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span>SAMPLE RATE: 2500ms</span>
          <span>WINDOW: 24 SAMPLES</span>
          <span className="hidden sm:inline">SMOOTHING: SPLINE MONOTONE</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span>● HISTORICAL TELEMETRY SYNCHRONIZED</span>
        </div>
      </div>
    </div>
  );
};
