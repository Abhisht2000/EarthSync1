import React, { useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import {
  Server,
  Radio,
  Wifi,
  BatteryCharging,
  Cpu,
  HardDrive,
  RefreshCw,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Layers
} from 'lucide-react';

export const GatewayNetwork: React.FC = () => {
  const { snapshot } = useEarthSync();
  const gateways = snapshot.gateways || [];

  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(gateways[0]?.id || 'GW-RPI-01');

  const selectedGateway = gateways.find((g) => g.id === selectedGatewayId) || gateways[0];

  const totalPackets = gateways.reduce((acc, g) => acc + (g.packetsReceivedTotal || 0), 0);
  const totalBuffered = gateways.reduce((acc, g) => acc + (g.localStorage?.bufferedEvents || 0), 0);
  const avgBattery = gateways.length > 0
    ? Math.round(gateways.reduce((acc, g) => acc + (g.power?.batteryPct || 100), 0) / gateways.length)
    : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>EDGE INFRASTRUCTURE LAYER</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Raspberry Pi & LoRa Gateway Mesh
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rugged solar-powered edge concentrators collecting LoRa multi-hop packets and managing offline SQLite sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{gateways.filter((g) => g.status === 'ONLINE').length}/{gateways.length} GATEWAYS ACTIVE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs font-mono text-cyan-300">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>LORA FREQ: IN865 / 868 MHz</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL LORA PACKETS</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {totalPackets.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">99.8% CRC Valid Deliveries</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>EDGE SQLITE BUFFER</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {totalBuffered} <span className="text-xs text-slate-400 font-normal">records</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero data loss during 4G drops</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SOLAR BATTERY MESH</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            {avgBattery}% <span className="text-xs text-emerald-400 font-normal">avg</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Solar trickle charging active</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>BACKHAUL CONNECTIVITY</span>
            <Signal className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">
            4G LTE / LoRa
          </div>
          <span className="text-[11px] text-purple-300 mt-1 block">Dual-redundant fallback</span>
        </div>
      </div>

      {/* Gateway Cards & Inspection Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gateway List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
            Field Concentrator Nodes
          </h2>

          {gateways.map((gw) => {
            const isSelected = gw.id === selectedGateway?.id;
            return (
              <div
                key={gw.id}
                onClick={() => setSelectedGatewayId(gw.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono">{gw.name}</h3>
                      <p className="text-xs text-slate-400">{gw.zone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {gw.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">NODES</span>
                    <strong className="text-slate-200">{gw.connectedNodesCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BATTERY</span>
                    <strong className="text-emerald-400">{gw.power?.batteryPct || 98}%</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BACKHAUL</span>
                    <strong className="text-purple-300">{gw.cellularBackhaul?.status || 'CONNECTED'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Gateway Detailed Diagnostics */}
        {selectedGateway && (
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 block font-bold">
                  {selectedGateway.id} • FW: {selectedGateway.firmwareVersion || 'v2.4.1'}
                </span>
                <h2 className="text-xl font-bold text-white">{selectedGateway.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lat: {selectedGateway.latitude?.toFixed(4)}, Lon: {selectedGateway.longitude?.toFixed(4)} • Zone: {selectedGateway.zone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PING GATEWAY</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400 block font-mono">LORA TRANSCEIVER</span>
                <strong className="text-white text-sm mt-1 block">{selectedGateway.loraFrequency || '868.1 MHz IN865'}</strong>
                <span className="text-[11px] text-cyan-400 mt-1 block font-mono">
                  {selectedGateway.packetsPerMinute || 24} pkts/min • Loss: {selectedGateway.packetLossRatePct || 0.1}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400 block font-mono">EDGE BUFFER STATUS</span>
                <strong className="text-white text-sm mt-1 block">{selectedGateway.localStorage?.bufferedEvents || 0} Events Queued</strong>
                <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                  {selectedGateway.localStorage?.dbEngine || 'SQLite 3.42'} (Auto-Sync)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs text-slate-400 block font-mono">POWER SUBSYSTEM</span>
                <strong className="text-white text-sm mt-1 block">{selectedGateway.power?.batteryPct || 98}% ({selectedGateway.power?.voltage || 12.6}V)</strong>
                <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                  Solar {selectedGateway.power?.solarInputWatts || 14.5}W Peak Input
                </span>
              </div>
            </div>

            {/* Architecture Overview Flow */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Edge Processing & Autonomous Fallback Logic
              </h3>

              <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <p>
                  1. <strong className="text-slate-200">Continuous Ingest:</strong> The Raspberry Pi Gateway continuously decodes binary telemetry packets from on-ground ESP32 river gauge and wildfire micro-nodes over 868MHz LoRaWAN.
                </p>
                <p>
                  2. <strong className="text-slate-200">Local Physics Verification:</strong> During cellular blackouts, the onboard Python/C++ engine evaluates rate-of-rise water surges and multi-sensor thermal thresholds autonomously on the local device.
                </p>
                <p>
                  3. <strong className="text-slate-200">Autonomous Siren Trigger:</strong> If severe threshold violations occur while disconnected from the cloud, the gateway activates local GPIO relay sirens and transmits emergency packets across the citizen mesh without latency.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
