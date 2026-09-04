import React, { useEffect, useRef, useState } from 'react';
import { useEarthSync } from '../context/EarthSyncContext';
import { SensorNode } from '../types/sensor';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Radio,
  Battery,
  Wifi,
  Waves,
  Flame,
  Sun,
  Mountain,
  X,
  Layers,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { getRiskBadgeClasses, getRiskColor } from '../services/riskEngine';

export const RiskMap: React.FC = () => {
  const { snapshot, floodRisk, wildfireRisk } = useEarthSync();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const [filterHazard, setFilterHazard] = useState<string>('all');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Northern India (Delhi / NCR River Basin & Ridge demo network)
    const map = L.map(mapContainerRef.current, {
      center: [28.625, 77.225],
      zoom: 12,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: true,
      attributionControl: false
    });

    // Dark Matter tile layer for command center aesthetic
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers with real-time node states
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    snapshot.nodes.forEach((node) => {
      // Filter check
      if (filterHazard !== 'all' && node.hazardType !== filterHazard) {
        if (markersRef.current[node.id]) {
          markersRef.current[node.id].remove();
          delete markersRef.current[node.id];
        }
        return;
      }

      const isCritical = node.status === 'CRITICAL';
      const isWarning = node.status === 'WARNING';
      const isOffline = node.status === 'OFFLINE';

      const color = isCritical
        ? '#ef4444'
        : isWarning
        ? '#f59e0b'
        : isOffline
        ? '#64748b'
        : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-sensor-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #0b1120; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
            </div>
            <div style="position: absolute; top: 34px; white-space: nowrap; font-family: monospace; font-size: 10px; font-weight: bold; color: #f8fafc; background: rgba(9, 14, 26, 0.9); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(51, 65, 85, 0.7);">
              ${node.id}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (markersRef.current[node.id]) {
        markersRef.current[node.id].setIcon(customIcon);
        markersRef.current[node.id].setLatLng([node.latitude, node.longitude]);
      } else {
        const marker = L.marker([node.latitude, node.longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedNode(node);
        });
        markersRef.current[node.id] = marker;
      }
    });

    // Update selectedNode if it's currently open
    if (selectedNode) {
      const updated = snapshot.nodes.find((n) => n.id === selectedNode.id);
      if (updated) setSelectedNode(updated);
    }
  }, [snapshot.nodes, filterHazard]);

  const getNodeRisk = (node: SensorNode) => {
    if (node.id === 'RIVER-02') return floodRisk.riskScore;
    if (node.id === 'FOREST-01') return wildfireRisk.riskScore;
    if (node.hazardType === 'heatwave') return 31;
    if (node.hazardType === 'landslide') return 17;
    return 14;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Map Header & Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 lg:p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              GEOSPATIAL EARLY WARNING GRID
            </span>
            <span className="text-slate-500">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-400">
              DEMO SENSOR NETWORK
            </span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            REAL-TIME SENSOR NETWORK TOPOLOGY
          </h1>
        </div>

        {/* Hazard Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilterHazard('all')}
            className={`px-3 py-1.5 rounded ${
              filterHazard === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL (12)
          </button>
          <button
            onClick={() => setFilterHazard('flood')}
            className={`px-3 py-1.5 rounded flex items-center gap-1 ${
              filterHazard === 'flood'
                ? 'bg-blue-950 text-cyan-300 font-bold border border-blue-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3 h-3 text-cyan-400" /> FLOOD
          </button>
          <button
            onClick={() => setFilterHazard('wildfire')}
            className={`px-3 py-1.5 rounded flex items-center gap-1 ${
              filterHazard === 'wildfire'
                ? 'bg-orange-950 text-orange-300 font-bold border border-orange-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-orange-400" /> WILDFIRE
          </button>
          <button
            onClick={() => setFilterHazard('heatwave')}
            className={`px-3 py-1.5 rounded flex items-center gap-1 ${
              filterHazard === 'heatwave'
                ? 'bg-yellow-950 text-yellow-300 font-bold border border-yellow-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3 h-3 text-yellow-400" /> HEAT
          </button>
          <button
            onClick={() => setFilterHazard('landslide')}
            className={`px-3 py-1.5 rounded flex items-center gap-1 ${
              filterHazard === 'landslide'
                ? 'bg-stone-900 text-stone-300 font-bold border border-stone-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="w-3 h-3 text-stone-400" /> LANDSLIDE
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090e1a]">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Legend */}
        <div className="absolute bottom-5 left-5 z-20 bg-slate-950/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-xs font-mono shadow-xl hidden sm:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">
            SENSOR STATUS INDICATORS
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">SAFE / NOMINAL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">WATCH ELEVATED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-300">HIGH THRESHOLD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold">CRITICAL BREACH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-slate-400">NODE OFFLINE</span>
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer Badge */}
        <div className="absolute top-5 right-5 z-20 bg-slate-950/85 border border-slate-800/80 px-3 py-1.5 rounded-lg backdrop-blur-md text-[11px] font-mono text-slate-400 max-w-xs shadow-lg">
          <strong className="text-slate-300 block">DEMO SENSOR NETWORK:</strong>
          Coordinates represent conceptual research deployment zones for the Smart India Hackathon prototype.
        </div>

        {/* Selected Node Telemetry Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-5 left-5 bottom-5 w-80 z-30 bg-slate-950/95 border border-cyan-800/60 p-5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between font-mono animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400">
                  <MapPin className="w-4 h-4" />
                  <span className="font-bold text-sm text-white">{selectedNode.id}</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">NODE DESIGNATION:</span>
                  <span className="text-slate-200 font-bold">{selectedNode.name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">MONITORING ZONE:</span>
                  <span className="text-slate-300">{selectedNode.zone}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">STATUS</span>
                    <span className="font-bold text-emerald-400">{selectedNode.status}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">RISK SCORE</span>
                    <span className="font-bold text-cyan-300">{getNodeRisk(selectedNode)}%</span>
                  </div>
                </div>

                {/* Specific Node Readings */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">
                    LIVE SENSOR PAYLOAD:
                  </span>
                  {selectedNode.hazardType === 'flood' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Level:</span>
                        <span className="text-slate-100 font-bold">
                          {selectedNode.lastReading.waterLevel.toFixed(1)} cm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rate of Rise:</span>
                        <span className="text-blue-400 font-bold">
                          +{selectedNode.lastReading.rateOfRise?.toFixed(1) || '0.2'} cm/min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rainfall:</span>
                        <span className={selectedNode.lastReading.rainfall ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {selectedNode.lastReading.rainfall ? 'DETECTED' : 'NONE'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="text-orange-400 font-bold">
                          {selectedNode.lastReading.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Humidity:</span>
                        <span className="text-cyan-400 font-bold">
                          {Math.round(selectedNode.lastReading.humidity)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Smoke Anomaly:</span>
                        <span className="text-amber-400 font-bold">
                          {selectedNode.lastReading.smokeLevel} ({selectedNode.lastReading.smokePpm} ppm)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Device Hardware Health */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bat: {selectedNode.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RSSI: {selectedNode.signalRssi} dBm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
              UPDATED: {selectedNode.lastUpdated} • ESP32 Node
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
