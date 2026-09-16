import React, { useEffect, useRef, useState } from 'react';
import { useEarthSync } from '../../context/EarthSyncContext';
import { SensorNode } from '../../types/sensor';
import { SafeLocation } from '../../types/citizen';
import { RaspberryPiGateway } from '../../types/gateway';
import { HazardType, HAZARD_REGISTRY } from '../../types/hazard';
import { DICTIONARY } from '../../services/localization';
import { EvacuationRoute } from '../../services/evacuationRouteService';
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

type MapStyleConfig = {
  url: string;
  maxZoom: number;
  attribution: string;
  subdomains?: string[];
  className?: string;
};

const MAP_STYLES: Record<string, MapStyleConfig> = {
  dark: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles-dark'
  },
  smooth: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles-light'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS Community',
    className: 'map-tiles-satellite'
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
    className: 'map-tiles-terrain'
  },
  toner: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    className: 'map-tiles-dark'
  },
  outdoor: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles-outdoor'
  }
};

const addBaseLayer = (map: L.Map, styleName: string) => {
  const previousLayers: L.TileLayer[] = [];
  map.eachLayer((candidate) => {
    if (candidate instanceof L.TileLayer) previousLayers.push(candidate);
  });
  
  const selected = MAP_STYLES[styleName] || MAP_STYLES.dark;
  
  const realLayer = L.tileLayer(selected.url, {
    maxZoom: selected.maxZoom,
    subdomains: selected.subdomains || ['a', 'b', 'c'],
    attribution: selected.attribution,
    className: selected.className || ''
  });

  realLayer.once('load', () => {
    previousLayers.forEach((layer) => {
      if (layer !== realLayer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
  });

  realLayer.on('tileerror', () => {
    if (selected.url.includes('openstreetmap.org')) return;
    const fallbackLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors',
      className: styleName === 'dark' || styleName === 'toner' ? 'map-tiles-dark' : ''
    });
    fallbackLayer.addTo(map);
  });

  realLayer.addTo(map);
  requestAnimationFrame(() => map.invalidateSize());
};

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
    language,
    isTrackingLocation,
    evacuationRoute,
    citizenSafetyStatus
  } = useEarthSync();

  const t = DICTIONARY[language];

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  // Evacuation route layer refs
  const evacLayerRef = useRef<L.LayerGroup | null>(null);
  const evacAnimRef = useRef<number | null>(null);

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
  const [mapStyle, setMapStyle] = useState<'dark' | 'smooth' | 'satellite' | 'terrain' | 'toner' | 'outdoor'>('dark');
  const [boundaryInfo, setBoundaryInfo] = useState<{ name: string; district: string; state: string; country: string; lat: number; lng: number } | null>(null);
  const [boundaryLoading, setBoundaryLoading] = useState(false);

  // Popular Indian Hazard Monitoring Locations for fast search jump
  const PRESET_LOCATIONS: Record<string, [number, number, number]> = {
    delhi: [28.6139, 77.2090, 12],
    lucknow: [26.8467, 80.9462, 13],
    dehradun: [30.3165, 78.0322, 13],
    haridwar: [29.9457, 78.1642, 13],
    rishikesh: [30.0869, 78.2676, 13],
    chamoli: [30.4124, 79.3245, 12],
    mumbai: [19.0760, 72.8777, 12],
    bengaluru: [12.9716, 77.5946, 12],
    bangalore: [12.9716, 77.5946, 12],
    hyderabad: [17.3850, 78.4867, 12],
    chennai: [13.0827, 80.2707, 12],
    kolkata: [22.5726, 88.3639, 12],
    jaipur: [26.9124, 75.7873, 12],
    ahmedabad: [23.0225, 72.5714, 12],
    pune: [18.5204, 73.8567, 12],
    chandigarh: [30.7333, 76.7794, 12],
    wayanad: [11.6854, 76.1320, 12],
    shimla: [31.1048, 77.1734, 13],
    guwahati: [26.1445, 91.7362, 12],
    patna: [25.5941, 85.1376, 12],
    bhopal: [23.2599, 77.4126, 12],
    uttarakhand: [30.0668, 79.0193, 8],
    uttarpradesh: [26.8467, 80.9462, 7]
  };
  const [isSearching, setIsSearching] = useState(false);

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

    addBaseLayer(map, mapStyle);

    // Reverse geocode on map click — show boundary info
    map.on('click', async (e: L.LeafletMouseEvent) => {
      setBoundaryInfo(null);
      setBoundaryLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const addr = data.address || {};
        setBoundaryInfo({
          name: data.display_name?.split(',')[0] || 'Unknown location',
          district: addr.county || addr.district || addr.city || addr.town || addr.village || '—',
          state: addr.state || '—',
          country: addr.country || '—',
          lat: Math.round(e.latlng.lat * 10000) / 10000,
          lng: Math.round(e.latlng.lng * 10000) / 10000,
        });
      } catch {
        setBoundaryInfo(null);
      } finally {
        setBoundaryLoading(false);
      }
    });

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

    addBaseLayer(map, mapStyle);
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

  // ── Evacuation route layer (citizen view only) ────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isCitizenView) return;

    // Clear old evacuation layer
    if (evacAnimRef.current) { cancelAnimationFrame(evacAnimRef.current); evacAnimRef.current = null; }
    if (evacLayerRef.current) { evacLayerRef.current.clearLayers(); }
    else { evacLayerRef.current = L.layerGroup().addTo(map); }

    const group = evacLayerRef.current;
    const uLat = currentUser.location.latitude;
    const uLng = currentUser.location.longitude;
    const accuracy = currentUser.location.accuracyMeters ?? 40;
    const isCritical = citizenSafetyStatus === 'CRITICAL' || citizenSafetyStatus === 'HIGH_RISK';

    // Accuracy halo
    L.circle([uLat, uLng], {
      radius: accuracy,
      color: '#22d3ee', fillColor: '#22d3ee',
      fillOpacity: 0.07, weight: 1, opacity: 0.35, dashArray: '4 4'
    }).addTo(group);

    // Static user dot (always)
    const userDot = L.circleMarker([uLat, uLng], {
      radius: 9, color: '#ffffff',
      fillColor: isTrackingLocation ? '#06b6d4' : '#6366f1',
      fillOpacity: 1, weight: 3
    }).addTo(group);
    userDot.bindPopup(
      `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0f172a;border-radius:8px;padding:8px">
        <b style="color:#22d3ee">📍 ${isTrackingLocation ? 'LIVE GPS LOCATION' : 'YOUR LOCATION'}</b><br/>
        <span style="color:#94a3b8">Accuracy: ±${accuracy}m</span><br/>
        <span style="color:#94a3b8">${uLat.toFixed(5)}, ${uLng.toFixed(5)}</span>
      </div>`,
      { className: 'earthsync-popup' }
    );

    // Animated pulse ring
    const pulseDot = L.circleMarker([uLat, uLng], {
      radius: 14, color: '#06b6d4',
      fillColor: '#06b6d4', fillOpacity: 0.12,
      weight: 1.5, opacity: 0.4
    }).addTo(group);
    let growing = true;
    let rv = 14;
    const animate = () => {
      rv += growing ? 0.5 : -0.5;
      if (rv >= 22) growing = false;
      if (rv <= 10) growing = true;
      try { pulseDot.setRadius(rv); } catch { return; }
      evacAnimRef.current = requestAnimationFrame(animate);
    };
    evacAnimRef.current = requestAnimationFrame(animate);

    // Draw route if available
    const route: EvacuationRoute | null = evacuationRoute;
    if (route && route.path.length >= 2) {
      // Route polyline
      L.polyline(route.path as [number, number][], {
        color: isCritical ? '#f59e0b' : '#10b981',
        weight: isCritical ? 5 : 4,
        opacity: 0.9,
        dashArray: isCritical ? '12 6' : '8 6',
        lineJoin: 'round'
      }).addTo(group);

      // Waypoint dots along path
      route.path.slice(1, -1).forEach(([wLat, wLng]) => {
        L.circleMarker([wLat, wLng] as [number, number], {
          radius: 3,
          color: isCritical ? '#f59e0b' : '#10b981',
          fillColor: isCritical ? '#f59e0b' : '#10b981',
          fillOpacity: 0.8, weight: 1
        }).addTo(group);
      });

      // Shelter marker
      const shelterIcon = L.divIcon({
        className: '', iconSize: [36, 36], iconAnchor: [18, 36],
        html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#10b981,#059669);border:2.5px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 14px rgba(16,185,129,0.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:15px">🏠</span></div>`
      });
      L.marker([route.shelterLat, route.shelterLng] as [number, number], { icon: shelterIcon })
        .addTo(group)
        .bindPopup(
          `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0f172a;border-radius:8px;padding:10px;min-width:160px">
            <b style="color:#10b981">🏠 SAFE SHELTER</b><br/>
            <span style="font-size:12px">${route.shelterName}</span><br/>
            <hr style="border-color:#1e293b;margin:6px 0"/>
            Distance: <b style="color:#22d3ee">${route.distanceKm} km</b><br/>
            Walk time: <b style="color:#22d3ee">~${route.etaMinutes} min</b><br/>
            ${route.isHighGroundRoute ? '<span style="color:#10b981;font-size:10px">✓ High-ground flood-safe route</span>' : ''}
          </div>`,
          { className: 'earthsync-popup' }
        );

      // ETA badge at route midpoint
      const midIdx = Math.floor(route.path.length / 2);
      const [mLat, mLng] = route.path[midIdx];
      const bc = isCritical ? '#f59e0b' : '#10b981';
      const bg = isCritical ? '#451a03' : '#022c22';
      const etaIcon = L.divIcon({
        className: '', iconSize: [100, 30], iconAnchor: [50, 15],
        html: `<div style="background:${bg};border:1.5px solid ${bc};border-radius:20px;padding:4px 10px;font-family:monospace;font-size:11px;font-weight:700;color:${bc};white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚶 ${route.distanceKm}km · ${route.etaMinutes}min</div>`
      });
      L.marker([mLat, mLng] as [number, number], { icon: etaIcon, interactive: false }).addTo(group);

      // Auto-fit bounds in CRITICAL state
      if (isCritical) {
        const bounds = L.latLngBounds(route.path as [number, number][]);
        bounds.extend([uLat, uLng]);
        map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1 });
      }
    }

    return () => {
      if (evacAnimRef.current) { cancelAnimationFrame(evacAnimRef.current); evacAnimRef.current = null; }
      if (evacLayerRef.current) { evacLayerRef.current.clearLayers(); }
    };
  }, [
    isCitizenView,
    currentUser.location.latitude,
    currentUser.location.longitude,
    currentUser.location.accuracyMeters,
    evacuationRoute,
    isTrackingLocation,
    citizenSafetyStatus
  ]);

  const handleSearchJump = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query || !mapInstanceRef.current) return;

    const lowerQuery = query.toLowerCase();

    // 1. Check if coordinates (e.g. "26.8467, 80.9462" or "26.8467 80.9462")
    const coordMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
        return;
      }
    }

    // 2. Check PRESET_LOCATIONS table
    const cleanKey = lowerQuery.replace(/[\s\-_]/g, '');
    if (PRESET_LOCATIONS[cleanKey]) {
      const [lat, lng, zoom] = PRESET_LOCATIONS[cleanKey];
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
      return;
    }

    // 3. Try finding by node or zone name in snapshot
    const foundNode = snapshot.nodes.find(
      (n) =>
        n.id.toLowerCase().includes(lowerQuery) ||
        n.name.toLowerCase().includes(lowerQuery) ||
        n.zone.toLowerCase().includes(lowerQuery)
    );

    if (foundNode) {
      mapInstanceRef.current.flyTo([foundNode.latitude, foundNode.longitude], 14, { duration: 1.2 });
      setSelectedNode(foundNode);
      return;
    }

    // 4. Try finding by shelter name
    const foundShelter = (snapshot.safeLocations || []).find(
      (s) => s.name.toLowerCase().includes(lowerQuery) || s.type.toLowerCase().includes(lowerQuery)
    );
    if (foundShelter) {
      mapInstanceRef.current.flyTo([foundShelter.latitude, foundShelter.longitude], 15, { duration: 1.2 });
      setSelectedShelter(foundShelter);
      return;
    }

    // 5. Dynamic Live Geocoding via OpenStreetMap Nominatim
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.4 });
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed', err);
    } finally {
      setIsSearching(false);
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
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono shadow-lg">
        {/* Search */}
        <form onSubmit={handleSearchJump} className="flex items-center gap-2 w-full md:flex-1 md:max-w-md">
          <div className="relative w-full">
            <Search className={`w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 ${isSearching ? 'animate-spin text-cyan-400' : ''}`} />
            <input
              type="text"
              placeholder={isCitizenView ? 'Search district or shelter (e.g. Lucknow, Delhi)...' : 'Search any city, district or coordinates...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition-colors shrink-0 flex items-center gap-1"
          >
            {isSearching ? '...' : 'Go'}
          </button>
        </form>

        {/* Layer & Map Quick Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Hazard Filter */}
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="all">All Hazards (8)</option>
            <option value="flood">🌊 Flood</option>
            <option value="wildfire">🔥 Wildfire</option>
            <option value="landslide">⛰ Landslide</option>
            <option value="heatwave">☀️ Heatwave</option>
          </select>

          {/* Layer toggles */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setShowNodes(!showNodes)}
              className={`px-2 py-1 rounded text-[10px] sm:text-[11px] ${showNodes ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Sensors"
            >
              Sensors
            </button>
            <button
              onClick={() => setShowZones(!showZones)}
              className={`px-2 py-1 rounded text-[10px] sm:text-[11px] ${showZones ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Risk Warning Zones"
            >
              Zones
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2 py-1 rounded text-[10px] sm:text-[11px] ${showShelters ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-500'}`}
              title="Toggle Shelters"
            >
              Shelters
            </button>
            {!isCitizenView && (
              <button
                onClick={() => setShowGateways(!showGateways)}
                className={`px-2 py-1 rounded text-[10px] sm:text-[11px] ${showGateways ? 'bg-slate-800 text-blue-300 font-bold' : 'text-slate-500'}`}
                title="Toggle Gateways"
              >
                Gateways
              </button>
            )}
          </div>

          {/* Map Style Dropdown */}
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value as typeof mapStyle)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs shrink-0"
            title="Map style"
          >
            <option value="dark">🌑 Dark</option>
            <option value="smooth">🌫️ Smooth</option>
            <option value="satellite">🛰️ Satellite</option>
            <option value="terrain">🏔️ Terrain</option>
            <option value="toner">⬛ Toner</option>
            <option value="outdoor">🌿 Outdoor</option>
          </select>

          <button
            onClick={handleFitNetwork}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs shrink-0"
            title="Fit map to all sensor coordinates"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Fit</span>
          </button>

          <button
            onClick={handleZoomToUser}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-xs shrink-0"
            title="Locate my position"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Me</span>
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090e1a] min-h-[380px] sm:min-h-[480px] h-[58vh] md:h-[620px]"
      >
        <div ref={mapContainerRef} className={`w-full h-full z-10 map-style-${mapStyle}`} />

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

        {/* GPS + Route Status Badge (citizen view) */}
        {isCitizenView && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 items-end">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[10px] font-bold shadow-lg border ${
              isTrackingLocation
                ? 'bg-cyan-950/90 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-950/90 border-slate-700/60 text-slate-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isTrackingLocation ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              {isTrackingLocation ? '📡 LIVE GPS' : '📍 FIXED LOC'}
            </div>
            {evacuationRoute && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-mono text-[10px] font-bold shadow-lg border ${
                citizenSafetyStatus === 'CRITICAL'
                  ? 'bg-amber-950/90 border-amber-600/60 text-amber-300'
                  : 'bg-emerald-950/90 border-emerald-700/60 text-emerald-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                🚶 ROUTE ACTIVE · {evacuationRoute.etaMinutes}min
              </div>
            )}
          </div>
        )}

        {/* Boundary Info Panel — shows on map click */}
        {(boundaryInfo || boundaryLoading) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-cyan-700/60 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md max-w-xs w-[92vw] sm:w-80 font-mono">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {boundaryLoading ? (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs">
                    <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    Looking up location…
                  </div>
                ) : boundaryInfo ? (
                  <>
                    <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase mb-1">📍 Location Boundary Info</p>
                    <p className="text-sm font-bold text-white truncate">{boundaryInfo.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <span className="text-slate-400">District</span>
                      <span className="text-slate-200 font-bold truncate">{boundaryInfo.district}</span>
                      <span className="text-slate-400">State</span>
                      <span className="text-slate-200 font-bold truncate">{boundaryInfo.state}</span>
                      <span className="text-slate-400">Country</span>
                      <span className="text-slate-200 font-bold truncate">{boundaryInfo.country}</span>
                      <span className="text-slate-400">Coordinates</span>
                      <span className="text-cyan-300 font-bold">{boundaryInfo.lat}, {boundaryInfo.lng}</span>
                    </div>
                  </>
                ) : null}
              </div>
              <button
                onClick={() => setBoundaryInfo(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
          <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 w-auto sm:w-84 max-h-[75vh] overflow-y-auto touch-scroll z-30 bg-slate-950/95 border border-cyan-800/80 p-3.5 sm:p-4.5 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col justify-between font-mono animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
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
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
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
          <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 w-auto sm:w-80 max-h-[75vh] overflow-y-auto touch-scroll z-30 bg-slate-950/95 border border-emerald-700/80 p-3.5 sm:p-4.5 rounded-2xl backdrop-blur-xl shadow-2xl font-mono text-xs animate-in slide-in-from-bottom sm:slide-in-from-right">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{selectedShelter.type === 'hospital' ? '🏥' : '🏠'}</span>
                <span>{selectedShelter.name}</span>
              </span>
              <button
                onClick={() => setSelectedShelter(null)}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
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
