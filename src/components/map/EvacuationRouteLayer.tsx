import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EvacuationRoute } from '../../services/evacuationRouteService';

interface EvacuationRouteLayerProps {
  map: L.Map | null;
  userLat: number;
  userLng: number;
  userAccuracyMeters?: number;
  route: EvacuationRoute | null;
  isTracking: boolean;
  isCritical?: boolean;
}

export const EvacuationRouteLayer: React.FC<EvacuationRouteLayerProps> = ({
  map,
  userLat,
  userLng,
  userAccuracyMeters = 30,
  route,
  isTracking,
  isCritical = false
}) => {
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const userCircleRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const shelterMarkerRef = useRef<L.Marker | null>(null);
  const midpointMarkerRef = useRef<L.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pulsePhaseRef = useRef(0);

  // ── Initialize layer group ───────────────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    const group = L.layerGroup().addTo(map);
    layerGroupRef.current = group;
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      group.remove();
    };
  }, [map]);

  // ── User location dot + accuracy ring ────────────────────────────────────
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group || !map) return;

    // Remove old markers
    if (userCircleRef.current) { userCircleRef.current.remove(); userCircleRef.current = null; }
    if (accuracyCircleRef.current) { accuracyCircleRef.current.remove(); accuracyCircleRef.current = null; }

    // Accuracy circle (light halo)
    const accuracyCircle = L.circle([userLat, userLng], {
      radius: userAccuracyMeters,
      color: '#22d3ee',
      fillColor: '#22d3ee',
      fillOpacity: 0.08,
      weight: 1,
      opacity: 0.4,
      dashArray: '4 4'
    }).addTo(group);
    accuracyCircleRef.current = accuracyCircle;

    // User position dot
    const userDot = L.circleMarker([userLat, userLng], {
      radius: 9,
      color: '#ffffff',
      fillColor: '#06b6d4',
      fillOpacity: 1,
      weight: 3,
      className: 'earthsync-user-dot'
    }).addTo(group);
    userDot.bindPopup(
      `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0f172a;border-radius:8px;padding:8px">
        <b style="color:#22d3ee">📍 YOUR LOCATION</b><br/>
        <span style="color:#94a3b8">Accuracy: ±${userAccuracyMeters}m</span><br/>
        <span style="color:#94a3b8">${userLat.toFixed(5)}, ${userLng.toFixed(5)}</span>
      </div>`,
      { className: 'earthsync-popup' }
    );
    userCircleRef.current = userDot;

    // ── Pulsing animation via Canvas ─────────────────────────────────────
    // Leaflet doesn't animate SVG paths natively, so we use a secondary
    // larger semi-transparent circle and toggle its opacity via rAF.
    let pulseDot: L.CircleMarker | null = L.circleMarker([userLat, userLng], {
      radius: 18,
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.15,
      weight: 1.5,
      opacity: 0.4
    }).addTo(group);

    let growing = true;
    let radiusVal = 14;

    const animate = () => {
      if (!pulseDot) return;
      radiusVal += growing ? 0.5 : -0.5;
      if (radiusVal >= 22) growing = false;
      if (radiusVal <= 10) growing = true;
      try { pulseDot.setRadius(radiusVal); } catch { /* map might have unmounted */ }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      pulseDot?.remove();
      pulseDot = null;
    };
  }, [map, userLat, userLng, userAccuracyMeters]);

  // ── Evacuation route polyline + shelter marker ───────────────────────────
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group || !map) return;

    // Clear old route elements
    if (routePolylineRef.current) { routePolylineRef.current.remove(); routePolylineRef.current = null; }
    if (shelterMarkerRef.current) { shelterMarkerRef.current.remove(); shelterMarkerRef.current = null; }
    if (midpointMarkerRef.current) { midpointMarkerRef.current.remove(); midpointMarkerRef.current = null; }

    if (!route) return;

    // Route polyline — dashed emerald, thicker during CRITICAL
    const routeLine = L.polyline(route.path as [number, number][], {
      color: isCritical ? '#f59e0b' : '#10b981',
      weight: isCritical ? 5 : 4,
      opacity: 0.92,
      dashArray: isCritical ? '12 6' : '8 6',
      lineJoin: 'round'
    }).addTo(group);

    // Direction arrows (decorative dots along the path)
    for (let i = 1; i < route.path.length - 1; i++) {
      L.circleMarker(route.path[i] as [number, number], {
        radius: 3,
        color: isCritical ? '#f59e0b' : '#10b981',
        fillColor: isCritical ? '#f59e0b' : '#10b981',
        fillOpacity: 0.8,
        weight: 1
      }).addTo(group);
    }

    routePolylineRef.current = routeLine;

    // Shelter destination marker
    const shelterIcon = L.divIcon({
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      html: `<div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#10b981,#059669);
        border:2.5px solid #fff;
        transform:rotate(-45deg);
        box-shadow:0 4px 14px rgba(16,185,129,0.5);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:15px">🏠</span>
      </div>`
    });

    const shelterMarker = L.marker([route.shelterLat, route.shelterLng], { icon: shelterIcon })
      .addTo(group)
      .bindPopup(
        `<div style="font-family:monospace;font-size:11px;color:#e2e8f0;background:#0f172a;border-radius:8px;padding:10px;min-width:160px">
          <b style="color:#10b981">🏠 SAFE SHELTER</b><br/>
          <span style="color:#e2e8f0;font-size:12px">${route.shelterName}</span><br/>
          <hr style="border-color:#1e293b;margin:6px 0"/>
          <span style="color:#94a3b8">Distance: </span><b style="color:#22d3ee">${route.distanceKm} km</b><br/>
          <span style="color:#94a3b8">Walk time: </span><b style="color:#22d3ee">~${route.etaMinutes} min</b><br/>
          ${route.isHighGroundRoute ? '<br/><span style="color:#10b981;font-size:10px">✓ High-ground route (flood-safe)</span>' : ''}
        </div>`,
        { className: 'earthsync-popup' }
      );
    shelterMarkerRef.current = shelterMarker;

    // Midpoint ETA badge
    const midIdx = Math.floor(route.path.length / 2);
    const [midLat, midLng] = route.path[midIdx];
    const badgeColor = isCritical ? '#f59e0b' : '#10b981';
    const bgColor = isCritical ? '#451a03' : '#022c22';
    const etaBadgeIcon = L.divIcon({
      className: '',
      iconSize: [90, 32],
      iconAnchor: [45, 16],
      html: `<div style="
        background:${bgColor};
        border:1.5px solid ${badgeColor};
        border-radius:20px;
        padding:4px 10px;
        font-family:monospace;
        font-size:11px;
        font-weight:700;
        color:${badgeColor};
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        display:flex;align-items:center;gap:4px;
      ">
        <span>🚶</span> ${route.distanceKm}km · ${route.etaMinutes}min
      </div>`
    });

    const etaBadge = L.marker([midLat, midLng], { icon: etaBadgeIcon, interactive: false }).addTo(group);
    midpointMarkerRef.current = etaBadge as unknown as L.Marker;
  }, [map, route, isCritical]);

  // ── Auto-fit bounds when CRITICAL ────────────────────────────────────────
  useEffect(() => {
    if (!map || !route || !isCritical) return;
    const bounds = L.latLngBounds(route.path as [number, number][]);
    bounds.extend([userLat, userLng]);
    map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1 });
  }, [map, route, isCritical, userLat, userLng]);

  return null; // purely imperative Leaflet layer — no React DOM output
};
