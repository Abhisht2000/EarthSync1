import React, { useEffect, useRef, useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { SensorNode } from '../../types/sensor';
import { SafeLocation } from '../../types/citizen';
import { RaspberryPiGateway } from '../../types/gateway';
import { HazardType, HAZARD_REGISTRY } from '../../types/hazard';
import { DICTIONARY } from '../../services/localization';
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
  AlertTriangle,
  Search,
  Crosshair,
  Home,
  Hospital,
  Server,
  Maximize2
} from 'lucide-react';

interface LiveGisMapProps {
  isCitizenView?: boolean;
  height?: string;
  className?: string;
}

export const LiveGisMap: React.FC<LiveGisMapProps> = ({
  isCitizenView = false,
  height = '620px',
  className = ''
}) => {
  const {
    snapshot,
    floodRisk,
    wildfireRisk,
    currentUser,
    language
  } = useEarthSync();

  const t = DICTIONARY[language];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<SafeLocation | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<RaspberryPiGateway | null>(null);

  const [filterHazard, setFilterHazard] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Layer Visibility
  const [showNodes, setShowNodes] = useState(true);
  const [showGateways, setShowGateways] = useState(!isCitizenView);
  const [showZones, setShowZones] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showUserLoc, setShowUserLoc] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark' | 'voyager'>('dark');

  // Popular Indian Hazard Monitoring Locations for fast search jump
  const PRESET_LOCATIONS: Record<string, [number, number, number]> = {
    delhi: [28.625, 77.225, 12],
    dehradun: [30.3165, 78.0322, 13],
    haridwar: [29.9457, 78.1642, 13],
    chamoli: [30.4124, 79.3245, 12],
    mumbai: [19.076, 72.8777, 12],
    wayanad: [11.6854, 76.132, 12],
    shimla: [31.1048, 77.1734, 13],
    guwahati: [26.1445, 91.7362, 12]
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [28.625, 77.225];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter tile layer default
    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add layers
    markersLayerRef.current = L.layerGroup().addTo(map);
    zonesLayerRef.current = L.layerGroup().addTo(map);
    sheltersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Base Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
  }, [mapStyle]);

  // Render & Update Sensor Nodes, Zones, Gateways and User Location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markersLayer = markersLayerRef.current;
    const zonesLayer = zonesLayerRef.current;
    const sheltersLayer = sheltersLayerRef.current;

    if (!markersLayer || !zonesLayer || !sheltersLayer) return;

    markersLayer.clearLayers();
    zonesLayer.clearLayers();
    sheltersLayer.clearLayers();

    // 1. Render Sensor Nodes
    if (showNodes) {
      snapshot.nodes.forEach((node) => {
        if (filterHazard !== 'all' && node.hazardType !== filterHazard) return;

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
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
              ${
                isCritical
                  ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                  : ''
              }
              <div style="width: 20px; height: 20px; border-radius: 50%; background: #090e1a; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}80;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
              </div>
              <div style="position: absolute; top: 32px; white-space: nowrap; font-family: monospace; font-size: 9px; font-weight: bold; color: #f8fafc; background: rgba(9, 14, 26, 0.92); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(51, 65, 85, 0.8);">
                ${node.id}
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([node.latitude, node.longitude], { icon: customIcon });
        marker.on('click', () => {
          setSelectedShelter(null);
          setSelectedGateway(null);
          setSelectedNode(node);
        });
        marker.addTo(markersLayer);

        // 2. Render Risk Warning Zones (Translucent circular geofences)
        if (showZones && (isCritical || isWarning)) {
          const zoneColor = isCritical ? '#ef4444' : '#f59e0b';
          const radiusMeters = isCritical ? 2400 : 1600;

          L.circle([node.latitude, node.longitude], {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: isCritical ? 0.18 : 0.1,
            weight: 1.5,
            dashArray: isCritical ? undefined : '4, 6'
          }).addTo(zonesLayer);
        }
      });
    }

    // 3. Render Gateways
    if (showGateways && !isCitizenView) {
      snapshot.gateways.forEach((gw) => {
        const gwIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #0369a1; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6); cursor: pointer;">
              <span style="font-size: 13px;">📡</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([gw.latitude, gw.longitude], { icon: gwIcon });
        marker.on('click', () => {
          setSelectedNode(null);
          setSelectedShelter(null);
          setSelectedGateway(gw);
        });
        marker.addTo(markersLayer);
      });
    }

    // 4. Render Safe Shelters & Hospitals
    if (showShelters) {
      (snapshot.safeLocations || []).forEach((loc) => {
        const isHosp = loc.type === 'hospital';
        const iconChar = isHosp ? '🏥' : '🏠';
        const borderCol = isHosp ? '#10b981' : '#06b6d4';

        const shelterIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #0b1120; border: 2px solid ${borderCol}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${borderCol}60; cursor: pointer;">
              <span style="font-size: 13px;">${iconChar}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: shelterIcon });
        marker.on('click', () => {
          setSelectedNode(null);
          setSelectedGateway(null);
          setSelectedShelter(loc);
        });
        marker.addTo(sheltersLayer);
      });
    }

    // 5. Render User Location (Citizen GPS)
    if (showUserLoc && currentUser?.location) {
      const uLat = currentUser.location.latitude;
      const uLng = currentUser.location.longitude;

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'custom-sensor-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #38bdf8; opacity: 0.35; animation: pulse 2s infinite;"></div>
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
            <div style="position: absolute; top: 32px; white-space: nowrap; font-family: monospace; font-size: 9px; font-weight: bold; color: #38bdf8; background: rgba(9, 14, 26, 0.95); padding: 1px 6px; border-radius: 4px; border: 1px solid #0284c7;">
              YOU ARE HERE
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      userMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    }
  }, [
    snapshot.nodes,
    snapshot.gateways,
    snapshot.safeLocations,
    showNodes,
    showGateways,
    showZones,
    showShelters,
    showUserLoc,
    filterHazard,
    currentUser.location
  ]);

  const handleSearchJump = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (PRESET_LOCATIONS[query] && mapInstanceRef.current) {
      const [lat, lng, zoom] = PRESET_LOCATIONS[query];
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      return;
    }

    // Try finding by node or zone name
    const foundNode = snapshot.nodes.find(
      (n) =>
        n.id.toLowerCase().includes(query) ||
        n.name.toLowerCase().includes(query) ||
        n.zone.toLowerCase().includes(query)
    );

    if (foundNode && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([foundNode.latitude, foundNode.longitude], 14, { duration: 1.2 });
      setSelectedNode(foundNode);
    }
  };

  const handleFitNetwork = () => {
    if (!mapInstanceRef.current || snapshot.nodes.length === 0) return;
    const bounds = L.latLngBounds(snapshot.nodes.map((n) => [n.latitude, n.longitude]));
    if (currentUser?.location) {
      bounds.extend([currentUser.location.latitude, currentUser.location.longitude]);
    }
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleZoomToUser = () => {
    if (!mapInstanceRef.current || !currentUser?.location) return;
    mapInstanceRef.current.flyTo([currentUser.location.latitude, currentUser.location.longitude], 14, { duration: 1.0 });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search & Layer Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-lg">
        {/* Search */}
        <form onSubmit={handleSearchJump} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={isCitizenView ? 'Search district or shelter (e.g. Delhi, Dehradun)...' : 'Search node, district or coordinates...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
          >
            Go
          </button>
        </form>

        {/* Layer & Map Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hazard Filter */}
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Hazards (8)</option>
            <option value="flood">🌊 Flood</option>
            <option value="wildfire">🔥 Wildfire</option>
            <option value="landslide">⛰ Landslide</option>
            <option value="heatwave">☀️ Heatwave</option>
          </select>

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setShowNodes(!showNodes)}
              className={`px-2 py-1 rounded text-[11px] ${showNodes ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Sensors"
            >
              Sensors
            </button>
            <button
              onClick={() => setShowZones(!showZones)}
              className={`px-2 py-1 rounded text-[11px] ${showZones ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Risk Warning Zones"
            >
              Zones
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2 py-1 rounded text-[11px] ${showShelters ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Shelters"
            >
              Shelters
            </button>
            {!isCitizenView && (
              <button
                onClick={() => setShowGateways(!showGateways)}
                className={`px-2 py-1 rounded text-[11px] ${showGateways ? 'bg-slate-800 text-blue-300 font-bold' : 'text-slate-500'}`}
                title="Toggle Gateways"
              >
                Gateways
              </button>
            )}
          </div>

          <button
            onClick={handleFitNetwork}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
            title="Fit map to all sensor coordinates"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fit</span>
          </button>

          <button
            onClick={handleZoomToUser}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
            title="Locate my position"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Me</span>
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090e1a]"
        style={{ height }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Live Stream Status Badge */}
        <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-slate-800/90 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 font-mono text-xs shadow-xl">
          {snapshot.isCloudConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">● LIVE GIS STREAM</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400 font-bold">● OFFLINE LOCAL MAP</span>
            </>
          )}
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{snapshot.nodes.length} Nodes</span>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-[11px] font-mono shadow-xl hidden md:block">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
            GIS LAYER LEGEND
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Safe Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold">Critical Breach</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🏠</span>
              <span className="text-cyan-300">Safe Shelter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🏥</span>
              <span className="text-emerald-300">Hospital</span>
            </div>
          </div>
        </div>

        {/* Node Detail Slide-out Drawer / Bottom Sheet */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 sm:top-4 sm:bottom-4 w-[calc(100%-2rem)] sm:w-84 z-30 bg-slate-950/95 border border-cyan-800/80 p-4.5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between font-mono animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm text-white">{selectedNode.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                    {selectedNode.hazardType}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">LOCATION ZONE:</span>
                  <span className="text-slate-200 font-medium">{selectedNode.zone}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">STATUS</span>
                    <span className="font-bold text-emerald-400">{selectedNode.status}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">DATA QUALITY</span>
                    <span className="font-bold text-cyan-300">{selectedNode.lastReading.dataQuality}</span>
                  </div>
                </div>

                {/* Specific Live Reading */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 mt-2">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">
                    LIVE SENSOR TELEMETRY:
                  </span>
                  {selectedNode.hazardType === 'flood' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Water Depth:</span>
                        <span className="text-slate-100 font-bold">
                          {selectedNode.lastReading.waterLevel.toFixed(1)} cm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rate of Rise:</span>
                        <span className="text-blue-400 font-bold">
                          +{selectedNode.lastReading.rateOfRise?.toFixed(1) || '0.2'} cm/m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rainfall Contact:</span>
                        <span className={selectedNode.lastReading.rainfall ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {selectedNode.lastReading.rainfall ? 'DETECTED' : 'NONE'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ambient Temp:</span>
                        <span className="text-orange-400 font-bold">
                          {selectedNode.lastReading.temperature.toFixed(1)}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Canopy Humidity:</span>
                        <span className="text-cyan-400 font-bold">
                          {Math.round(selectedNode.lastReading.humidity)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Smoke Density:</span>
                        <span className="text-amber-400 font-bold">
                          {selectedNode.lastReading.smokeLevel} ({selectedNode.lastReading.smokePpm} ppm)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Battery className="w-3.5 h-3.5" /> {selectedNode.battery}%
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Wifi className="w-3.5 h-3.5" /> {selectedNode.signalRssi} dBm
              </span>
              <span>{selectedNode.lastUpdated}</span>
            </div>
          </div>
        )}

        {/* Shelter Drawer */}
        {selectedShelter && (
          <div className="absolute bottom-4 right-4 sm:top-4 sm:bottom-4 w-[calc(100%-2rem)] sm:w-80 z-30 bg-slate-950/95 border border-emerald-700/80 p-4.5 rounded-2xl backdrop-blur-xl shadow-2xl font-mono text-xs animate-in slide-in-from-bottom sm:slide-in-from-right">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{selectedShelter.type === 'hospital' ? '🏥' : '🏠'}</span>
                <span>{selectedShelter.name}</span>
              </span>
              <button
                onClick={() => setSelectedShelter(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <p className="text-[11px] text-slate-400">{selectedShelter.address}</p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span>Capacity:</span>
                <span className="font-bold text-emerald-400">
                  {selectedShelter.availableCapacity} / {selectedShelter.capacity} Beds
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                <span>Helpline / Phone:</span>
                <a href={`tel:${selectedShelter.contactPhone}`} className="text-cyan-400 font-bold underline">
                  {selectedShelter.contactPhone}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
