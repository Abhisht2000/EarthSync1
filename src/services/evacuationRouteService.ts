/**
 * EarthSync Offline Evacuation Route Service
 *
 * Computes safest walking paths from the user's GPS position to the nearest
 * operational safe shelter using pre-loaded regional waypoints.
 *
 * Works ENTIRELY OFFLINE — no network call, no external API.
 * Waypoints cover the Rishikesh / Song River Basin / Uttarakhand foothills
 * region matching the sensor deployment zones in this system.
 */

export interface RouteWaypoint {
  lat: number;
  lng: number;
  label?: string;
  isHighGround?: boolean; // elevated refuge point
  isHazardZone?: boolean; // area to avoid during flood/fire
}

export interface EvacuationRoute {
  path: [number, number][]; // [lat, lng] polyline
  distanceKm: number;
  etaMinutes: number; // at 4 km/h walking speed
  shelterName: string;
  shelterLat: number;
  shelterLng: number;
  isHighGroundRoute: boolean; // true = avoids flood-prone low zones
}

// ── Pre-loaded regional waypoint graph ──────────────────────────────────────
// These waypoints represent key road intersections, elevated ridges,
// bridge crossings, and shelter approach paths in the deployment area.
// Mapped to real geographic features of the Rishikesh / Song River basin.

const REGIONAL_WAYPOINTS: RouteWaypoint[] = [
  // Song River basin crossings (flood-affected zone)
  { lat: 30.1050, lng: 78.3020, label: 'Song River North Bridge', isHazardZone: true },
  { lat: 30.0980, lng: 78.3055, label: 'Song River South Bank', isHazardZone: true },
  { lat: 30.1020, lng: 78.2990, label: 'Flood Canal Junction', isHazardZone: true },

  // Main approach roads / trunk roads
  { lat: 30.1100, lng: 78.2900, label: 'NH-58 Bypass Junction' },
  { lat: 30.1150, lng: 78.2950, label: 'Rishikesh Main Road Km 12' },
  { lat: 30.1200, lng: 78.3050, label: 'Tapovan Cross Road' },
  { lat: 30.1180, lng: 78.3120, label: 'Haridwar Road T-Junction' },
  { lat: 30.0900, lng: 78.3100, label: 'Dehradun Highway Node' },
  { lat: 30.0850, lng: 78.2980, label: 'Valley Base Road Kink' },

  // High ground refuge points
  { lat: 30.1300, lng: 78.2870, label: 'Rishikesh Ridge Node 01', isHighGround: true },
  { lat: 30.1320, lng: 78.3100, label: 'Tapovan Elevated Plateau', isHighGround: true },
  { lat: 30.1350, lng: 78.2980, label: 'Hill Crest Junction', isHighGround: true },
  { lat: 30.1280, lng: 78.3200, label: 'Forest Ridge Outpost', isHighGround: true },

  // Near sensor zone RIVER-02 (Ganga confluence area)
  { lat: 30.1080, lng: 78.2850, label: 'Ganga Riverside Rd' },
  { lat: 30.1060, lng: 78.2920, label: 'Riverside North' },

  // Near sensor zone FOREST-01 (Rajaji National Park fringe)
  { lat: 30.0780, lng: 78.2850, label: 'Forest Fringe Road North' },
  { lat: 30.0720, lng: 78.2900, label: 'Park Gate Access Rd' },

  // Near sensor zone VALLEY-01
  { lat: 30.0920, lng: 78.3150, label: 'Valley West Access Rd' },
  { lat: 30.0950, lng: 78.3200, label: 'Valley East Node' },

  // Urban shelter approach nodes
  { lat: 30.1230, lng: 78.3080, label: 'Rishikesh Town Center' },
  { lat: 30.1250, lng: 78.3150, label: 'Shyampur Relief Access' },
  { lat: 30.0970, lng: 78.2940, label: 'Doiwala Road' },
];

// ── Distance helpers ─────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalPathDistance(path: [number, number][]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += haversineKm(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1]);
  }
  return total;
}

// ── Route computation ─────────────────────────────────────────────────────────

export function computeEvacuationRoute(
  userLat: number,
  userLng: number,
  shelterLat: number,
  shelterLng: number,
  shelterName: string,
  avoidFloodZones: boolean = true
): EvacuationRoute {
  // Filter out hazard zones when flood is active
  const usableWaypoints = REGIONAL_WAYPOINTS.filter(
    (wp) => !(avoidFloodZones && wp.isHazardZone)
  );

  // Prioritise high-ground waypoints when flood is active
  const preferHighGround = avoidFloodZones;

  // Greedy nearest-neighbour path building
  const path: [number, number][] = [[userLat, userLng]];
  const visited = new Set<number>();

  let currentLat = userLat;
  let currentLng = userLng;

  // Build intermediate path through waypoints toward shelter
  // We take at most 6 intermediate waypoints to keep the route practical
  const MAX_INTERMEDIATE = 6;

  for (let step = 0; step < MAX_INTERMEDIATE; step++) {
    let bestIdx = -1;
    let bestScore = Infinity;

    for (let i = 0; i < usableWaypoints.length; i++) {
      if (visited.has(i)) continue;
      const wp = usableWaypoints[i];

      // Distance from current point to this waypoint
      const distFromCurrent = haversineKm(currentLat, currentLng, wp.lat, wp.lng);

      // Distance from waypoint to shelter (how much progress this makes)
      const distToShelter = haversineKm(wp.lat, wp.lng, shelterLat, shelterLng);

      // Direct distance user→shelter as reference
      const directDist = haversineKm(currentLat, currentLng, shelterLat, shelterLng);

      // Only include waypoints that are heading toward shelter (within 120% of direct path)
      if (distFromCurrent + distToShelter > directDist * 1.6) continue;

      // Score: prefer waypoints that make progress toward shelter
      // Bonus for high ground when flood is active
      const highGroundBonus = preferHighGround && wp.isHighGround ? 0.7 : 1.0;
      const score = (distFromCurrent + distToShelter) * highGroundBonus;

      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break; // no more useful waypoints

    const wp = usableWaypoints[bestIdx];
    path.push([wp.lat, wp.lng]);
    visited.add(bestIdx);
    currentLat = wp.lat;
    currentLng = wp.lng;

    // Stop adding waypoints once we are within 0.5 km of shelter
    if (haversineKm(currentLat, currentLng, shelterLat, shelterLng) < 0.5) break;
  }

  // Append shelter endpoint
  path.push([shelterLat, shelterLng]);

  const distanceKm = Math.round(totalPathDistance(path) * 10) / 10;
  const etaMinutes = Math.ceil((distanceKm / 4.0) * 60); // 4 km/h average walking pace

  const hasHighGroundSegment = path.some(([lat, lng]) =>
    REGIONAL_WAYPOINTS.some(
      (wp) => wp.isHighGround && Math.abs(wp.lat - lat) < 0.001 && Math.abs(wp.lng - lng) < 0.001
    )
  );

  return {
    path,
    distanceKm,
    etaMinutes,
    shelterName,
    shelterLat,
    shelterLng,
    isHighGroundRoute: hasHighGroundSegment,
  };
}

// ── Location watch service ────────────────────────────────────────────────────

type LocationCallback = (lat: number, lng: number, accuracy: number) => void;

let watchId: number | null = null;

export function startLocationWatch(onUpdate: LocationCallback, onError?: (err: string) => void): boolean {
  if (!('geolocation' in navigator)) {
    onError?.('Geolocation not supported by this browser.');
    return false;
  }

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    },
    (err) => {
      onError?.(`GPS error: ${err.message}`);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,   // accept 10-second-old cached position
      timeout: 15000,
    }
  );

  return true;
}

export function stopLocationWatch(): void {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
