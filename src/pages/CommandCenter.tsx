import React from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { HazardCard } from '../components/cards/HazardCard';
import { SensorMetricCard } from '../components/cards/SensorMetricCard';
import { RadialRiskGauge } from '../components/gauges/RadialRiskGauge';
import { LiveTrendChart } from '../components/charts/LiveTrendChart';
import { CorrelationMatrix } from '../components/charts/CorrelationMatrix';
import { EarthSyncIntelligencePanel } from '../components/common/EarthSyncIntelligencePanel';
import { ActionableAlertCard } from '../components/cards/ActionableAlertCard';
import { EventTimeline } from '../components/common/EventTimeline';
import { NavigationPage } from '../components/navigation/Sidebar';
import {
  Waves,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Activity,
  Radio,
  Bell,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

interface CommandCenterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const {
    snapshot,
    floodRisk,
    wildfireRisk,
    heatwaveRisk,
    landslideRisk,
    acknowledgeAlert
  } = useEarthSync();

  const floodReading = snapshot.primaryFloodNode?.lastReading || {
    waterLevel: 32.4,
    rateOfRise: 0.2,
    rainfall: false
  };

  const fireReading = snapshot.primaryWildfireNode?.lastReading || {
    temperature: 27.2,
    humidity: 63.5,
    smokeLevel: 'LOW',
    smokePpm: 38,
    windSpeed: 14
  };

  const activeAlerts = snapshot.alerts.filter((a) => !a.acknowledged);
  const compositeRiskScore = Math.max(floodRisk.riskScore, wildfireRisk.riskScore);

  const isCritical = floodRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'CRITICAL';
  const isHigh = floodRisk.riskLevel === 'HIGH' || wildfireRisk.riskLevel === 'HIGH';
  const isDanger = isCritical || isHigh;

  // Natural language summary for "WHAT'S HAPPENING?"
  const getWhatsHappeningText = () => {
    if (floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH') {
      return `Water level is rising quickly (now ${floodReading.waterLevel.toFixed(1)} cm, +${floodReading.rateOfRise?.toFixed(1) || '4.5'} cm/min) and rain has been detected. EARTHSYNC currently considers this a ${floodRisk.riskLevel} flood risk in Eastern River Drainage 02.`;
    }
    if (wildfireRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'HIGH') {
      return `Temperature is increasing (${fireReading.temperature.toFixed(1)}°C), humidity is falling (${Math.round(fireReading.humidity)}%), and smoke levels are high (${fireReading.smokePpm} ppm). EARTHSYNC currently considers this a ${wildfireRisk.riskLevel} wildfire risk in Northern Forestry Zone 01.`;
    }
    return `All environmental conditions are normal. Water level is steady at ${floodReading.waterLevel.toFixed(1)} cm, temperature is comfortable at ${fireReading.temperature.toFixed(1)}°C, and no rain or smoke anomalies have been detected across all 8 monitored areas.`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. CURRENT STATUS BANNER — Immediate 5-second clarity */}
      <div
        className={`rounded-2xl p-3.5 sm:p-4.5 border backdrop-blur-md shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isCritical
            ? 'bg-red-950/70 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
            : isHigh
            ? 'bg-orange-950/70 border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.2)]'
            : 'bg-emerald-950/40 border-emerald-600/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        }`}
      >
        <div className="flex items-start md:items-center gap-2.5 sm:gap-3">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isDanger ? (
              <AlertOctagon className="w-5 h-5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                STATUS:
              </span>
              <span
                className={`text-[11px] sm:text-xs font-mono font-black uppercase px-2 py-0.5 rounded ${
                  isCritical
                    ? 'bg-red-600 text-white'
                    : isHigh
                    ? 'bg-orange-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isDanger ? (isCritical ? '🔴 CRITICAL DANGER' : '🟠 HIGH WARNING') : '🟢 ALL AREAS SAFE'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-wide leading-snug">
              {isDanger
                ? floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH'
                  ? 'Severe Flood Danger in River Drainage Area — Water Rising Rapidly'
                  : 'Severe Wildfire Danger in Forest Area — High Heat & Smoke Particulates'
                : 'All Monitored Environmental Areas Are Normal and Safe'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs shrink-0">
          {snapshot.activeScenario !== 'NORMAL' ? (
            <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-600 text-purple-300 font-bold flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🟣 DEMO MODE</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-medium flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 LIVE MONITORING</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. "WHAT'S HAPPENING?" SECTION — Natural Language Summary */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              <Activity className="w-3.5 h-3.5" />
              <span>WHAT'S HAPPENING RIGHT NOW?</span>
            </div>
            <p className="text-xs sm:text-sm md:text-base font-sans text-slate-100 font-medium leading-relaxed max-w-4xl">
              "{getWhatsHappeningText()}"
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDanger ? (
              <button
                onClick={() => onNavigate(floodRisk.riskScore > wildfireRisk.riskScore ? 'flood' : 'wildfire')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>SEE WHAT TO DO NEXT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Continuous 2.5s Sensor Polling</span>
              </div>
            )}
          </div>
        </div>

        {/* Simple Human-Friendly "Why is the risk high?" Explanation Box if elevated */}
        {isDanger && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 bg-slate-950/60 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3.5 sm:p-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 block mb-2">
              WHY IS THE RISK HIGH? (EARTHSYNC DETECTED MULTIPLE WARNING SIGNS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5 font-mono text-xs">
              {floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH' ? (
                <>
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-cyan-200 flex items-center gap-2">
                    <span className="text-base">🌊</span>
                    <span>Water level is rising rapidly (+{floodReading.rateOfRise?.toFixed(1) || '4.5'} cm/min)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-cyan-200 flex items-center gap-2">
                    <span className="text-base">🌧️</span>
                    <span>Rain actively detected over the drainage basin</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/60 text-cyan-200 flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>River depth has reached {floodReading.waterLevel.toFixed(1)} cm</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-800/60 text-orange-200 flex items-center gap-2">
                    <span className="text-base">🌡️</span>
                    <span>Temperature is rising (+2.4°C warming rate)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-800/60 text-orange-200 flex items-center gap-2">
                    <span className="text-base">💧</span>
                    <span>Humidity is falling (air is getting very dry)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-800/60 text-orange-200 flex items-center gap-2">
                    <span className="text-base">💨</span>
                    <span>Smoke particle levels are increasing</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. SIMPLIFIED CONNECTED SENSORS QUICK STRIP */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>CONNECTED SENSORS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Flood Node (River-02)</span>
            <span className="text-slate-500 hidden sm:inline">— Online</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Fire Node (Forest-01)</span>
            <span className="text-slate-500 hidden sm:inline">— Online</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Headwaters (River-01)</span>
            <span className="text-slate-500 hidden sm:inline">— Online</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-300">West Canopy (Forest-02)</span>
            <span className="text-amber-400 hidden sm:inline">— Weak</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('sensor-network')}
          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 self-start sm:self-auto shrink-0"
        >
          <span>View All 12 Sensors</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. CURRENT POSSIBLE HAZARDS (4 Cards with Progressive Disclosure) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              CURRENT POSSIBLE HAZARDS
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            CLICK ANY CARD TO VIEW FULL TECHNICAL DETAILS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HazardCard
            hazard="flood"
            title="FLOOD RISK"
            riskScore={floodRisk.riskScore}
            riskLevel={floodRisk.riskLevel}
            trend={
              floodRisk.trend === 'increasing'
                ? '↑ Increasing'
                : floodRisk.trend === 'decreasing'
                ? '↓ Decreasing'
                : '→ Stable'
            }
            primaryMetric="Water Level"
            primaryValue={`${floodReading.waterLevel.toFixed(1)} cm`}
            secondaryMetric="Rate"
            secondaryValue={`${floodReading.rateOfRise !== undefined && floodReading.rateOfRise >= 0 ? '+' : ''}${floodReading.rateOfRise?.toFixed(1) || '0.2'} cm/m`}
            summaryReason={floodRisk.reasons[0] || 'Water level in normal drainage range'}
            plainLanguageNote={
              floodReading.waterLevel > 50
                ? 'Water level is rising quickly'
                : 'Water level is steady and safe'
            }
            onClick={() => onNavigate('flood')}
          />

          <HazardCard
            hazard="wildfire"
            title="WILDFIRE RISK"
            riskScore={wildfireRisk.riskScore}
            riskLevel={wildfireRisk.riskLevel}
            trend={
              wildfireRisk.trend === 'increasing'
                ? '↑ Increasing'
                : '→ Stable'
            }
            primaryMetric="Temperature"
            primaryValue={`${fireReading.temperature.toFixed(1)}°C`}
            secondaryMetric="Smoke"
            secondaryValue={fireReading.smokeLevel}
            summaryReason={wildfireRisk.reasons[0] || 'Atmospheric moisture and canopy nominal'}
            plainLanguageNote={
              fireReading.temperature > 30
                ? 'Temperature is rising and air is dry'
                : 'Temperature and moisture are normal'
            }
            onClick={() => onNavigate('wildfire')}
          />

          <HazardCard
            hazard="heatwave"
            title="HEATWAVE"
            riskScore={heatwaveRisk.riskScore}
            riskLevel={heatwaveRisk.riskLevel}
            trend="→ Stable"
            primaryMetric="Valley Peak"
            primaryValue="31.2°C"
            secondaryMetric="Solar UVI"
            secondaryValue="7.8"
            summaryReason={heatwaveRisk.reasons[0]}
            plainLanguageNote="Valley daytime temperature normal"
            onClick={() => onNavigate('analytics')}
          />

          <HazardCard
            hazard="landslide"
            title="LANDSLIDE"
            riskScore={landslideRisk.riskScore}
            riskLevel={landslideRisk.riskLevel}
            trend="→ Stable"
            primaryMetric="Soil Moisture"
            primaryValue="42%"
            secondaryMetric="Displacement"
            secondaryValue="0.02°"
            summaryReason={landslideRisk.reasons[0]}
            plainLanguageNote="Hillside soil is stable"
            onClick={() => onNavigate('sensor-network')}
          />
        </div>
      </div>

      {/* 5. LIVE SENSOR READINGS (6 Live Metric Cards with Plain Language Sublabels) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300">
              LIVE SENSOR READINGS (CONNECTED SENSORS)
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            CONTINUOUS STREAM • UPDATING LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5">
          <SensorMetricCard
            title="WATER LEVEL"
            value={floodReading.waterLevel.toFixed(1)}
            unit="cm"
            subLabel={floodReading.waterLevel > 60 ? 'Rising quickly' : floodReading.waterLevel > 45 ? 'Rising steadily' : 'Normal level'}
            trendText={`${floodReading.rateOfRise !== undefined && floodReading.rateOfRise >= 0 ? '+' : ''}${floodReading.rateOfRise?.toFixed(1) || '0.2'} cm/m`}
            trendDirection={floodReading.rateOfRise && floodReading.rateOfRise > 1 ? 'up' : 'stable'}
            icon={Waves}
            status={floodReading.waterLevel > 60 ? 'CRITICAL' : floodReading.waterLevel > 45 ? 'ELEVATED' : 'NORMAL'}
            color="#0284c7"
            sparklineData={snapshot.history.map((h) => h.waterLevel)}
          />

          <SensorMetricCard
            title="RAINFALL"
            value={floodReading.rainfall ? 'DETECTED' : 'NONE'}
            subLabel={floodReading.rainfall ? 'Raining in basin' : 'No rain'}
            trendText={floodReading.rainfall ? 'Precipitating' : 'Dry Basin'}
            trendDirection={floodReading.rainfall ? 'up' : 'stable'}
            icon={CloudRain}
            status={floodReading.rainfall ? 'ELEVATED' : 'NORMAL'}
            color="#3b82f6"
            sparklineData={snapshot.history.map((h) => h.rainfall * 10)}
          />

          <SensorMetricCard
            title="TEMPERATURE"
            value={fireReading.temperature.toFixed(1)}
            unit="°C"
            subLabel={fireReading.temperature >= 32 ? 'Getting hotter' : fireReading.temperature >= 29 ? 'Warming up' : 'Comfortable'}
            trendText={fireReading.temperature > 30 ? '+2.4°C/h' : 'Stable'}
            trendDirection={fireReading.temperature > 30 ? 'up' : 'stable'}
            icon={Thermometer}
            status={fireReading.temperature > 33 ? 'CRITICAL' : fireReading.temperature > 30 ? 'ELEVATED' : 'NORMAL'}
            color="#ea580c"
            sparklineData={snapshot.history.map((h) => h.temperature)}
          />

          <SensorMetricCard
            title="HUMIDITY"
            value={Math.round(fireReading.humidity)}
            unit="%"
            subLabel={fireReading.humidity < 45 ? 'Getting drier' : fireReading.humidity < 55 ? 'Mildly dry' : 'Normal moisture'}
            trendText={fireReading.humidity < 50 ? '-8% Dry' : 'Moderate'}
            trendDirection={fireReading.humidity < 50 ? 'down' : 'stable'}
            icon={Droplets}
            status={fireReading.humidity < 45 ? 'CRITICAL' : fireReading.humidity < 55 ? 'ELEVATED' : 'NORMAL'}
            color="#06b6d4"
            sparklineData={snapshot.history.map((h) => h.humidity)}
          />

          <SensorMetricCard
            title="SMOKE LEVEL"
            value={fireReading.smokeLevel}
            unit={`${fireReading.smokePpm}ppm`}
            subLabel={fireReading.smokeLevel !== 'LOW' ? 'Increasing' : 'Clean air'}
            trendText={fireReading.smokeLevel !== 'LOW' ? 'Particulate ↑' : 'Clear air'}
            trendDirection={fireReading.smokeLevel !== 'LOW' ? 'up' : 'stable'}
            icon={Wind}
            status={fireReading.smokeLevel === 'HIGH' ? 'CRITICAL' : fireReading.smokeLevel === 'MEDIUM' ? 'ELEVATED' : 'NORMAL'}
            color="#eab308"
            sparklineData={snapshot.history.map((h) => h.smokePpm)}
          />

          <SensorMetricCard
            title="WIND SPEED"
            value={fireReading.windSpeed}
            unit="km/h"
            subLabel="Moderate breeze"
            trendText="NNW Vector"
            trendDirection="stable"
            icon={Wind}
            status="NORMAL"
            color="#10b981"
            sparklineData={[12, 14, 15, 14, 16, 18, fireReading.windSpeed]}
          />
        </div>
      </div>

      {/* 6. LIVE TREND AREA & RADIAL RISK GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Recharts Live Trend Area (8 cols) */}
        <div className="lg:col-span-8 min-w-0">
          <LiveTrendChart data={snapshot.history} />
        </div>

        {/* Animated Radial Risk Gauge (4 cols) */}
        <div className="lg:col-span-4 min-w-0 bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-md flex flex-col items-center justify-between min-h-[340px] sm:min-h-[380px]">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              OVERALL RISK ASSESSMENT
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              LIVE SCORE
            </span>
          </div>

          <div className="my-auto py-2">
            <RadialRiskGauge
              score={compositeRiskScore}
              size={200}
              label="PEAK RISK SCORE"
              sublabel="HIGHEST DETECTED HAZARD"
            />
          </div>

          {/* Quick breakdown mini badges */}
          <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Flood:</span>
              <span className="text-cyan-400 font-bold">{floodRisk.riskScore}%</span>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Wildfire:</span>
              <span className="text-orange-400 font-bold">{wildfireRisk.riskScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SMART SIGNAL CORRELATION VIEW */}
      <CorrelationMatrix />

      {/* 8. INTELLIGENCE PANEL & ACTIONABLE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* EarthSync Intelligence Panel (6 cols) */}
        <div className="lg:col-span-6 min-w-0">
          <EarthSyncIntelligencePanel />
        </div>

        {/* Actionable Alerts & Live Event Timeline (6 cols) */}
        <div className="lg:col-span-6 min-w-0 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-base">
                  Actionable Alert Center
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activeAlerts.length} UNRESOLVED
              </span>
            </div>

            <div className="space-y-3">
              {snapshot.alerts.slice(0, 2).map((alert) => (
                <ActionableAlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <EventTimeline events={snapshot.events} maxItems={4} />
        </div>
      </div>
    </div>
  );
};
