import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ISensorService, SimulationScenario, TelemetrySnapshot } from '../services/ISensorService';
import { mockSensorService } from '../services/mockSensorService';
import { esp32SensorService } from '../services/esp32SensorService';
import { calculateFloodRisk, calculateWildfireRisk, getRiskLevel } from '../services/riskEngine';
import { voiceAlertService } from '../services/voiceAlertService';
import { RiskAssessment } from '../types/risk';
import { CitizenSafetyStatus, CitizenUser, GeofencedHazard, SafeLocation, UserLocation } from '../types/citizen';
import { Language } from '../services/localization';

export type AppRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

// Haversine Distance Helper in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface EarthSyncContextType {
  snapshot: TelemetrySnapshot;
  appRole: AppRole;
  setAppRole: (role: AppRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: CitizenUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<CitizenUser>>;
  activeServiceType: 'MOCK' | 'ESP32';
  setActiveServiceType: (type: 'MOCK' | 'ESP32') => void;
  floodRisk: RiskAssessment;
  wildfireRisk: RiskAssessment;
  heatwaveRisk: RiskAssessment;
  landslideRisk: RiskAssessment;
  citizenSafetyStatus: CitizenSafetyStatus;
  nearbyHazards: GeofencedHazard[];
  closestSafeLocations: SafeLocation[];
  alerts: TelemetrySnapshot['alerts'];
  isOffline: boolean;
  isHardwareConnected: boolean;
  isSpeaking: boolean;
  speakingText: string;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  voiceMuted: boolean;
  setVoiceMuted: (muted: boolean) => void;
  playVoiceAlert: (text: string) => void;
  testVoice: () => void;
  setScenario: (scenario: SimulationScenario) => void;
  resetToNormal: () => void;
  simulateNetworkFailure: () => void;
  restoreConnection: () => void;
  acknowledgeAlert: (id: string) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  updateUserLocation: (loc: Partial<UserLocation>) => void;
  requestDeviceLocation: () => Promise<boolean>;
}

const EarthSyncContext = createContext<EarthSyncContextType | undefined>(undefined);

export const EarthSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appRole, setAppRole] = useState<AppRole>('AUTHORITY');
  const [language, setLanguage] = useState<Language>('en');
  const [activeServiceType, setActiveServiceType] = useState<'MOCK' | 'ESP32'>('MOCK');
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() => mockSensorService.getSnapshot());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Citizen profile state
  const [currentUser, setCurrentUser] = useState<CitizenUser>({
    id: 'usr-default',
    phoneNumber: '+91 9876543210',
    name: 'Citizen User',
    language: 'en',
    location: {
      latitude: 28.625,
      longitude: 77.225,
      district: 'Central District',
      state: 'New Delhi',
      areaName: 'Civil Lines Catchment Sector',
      timestamp: new Date().toISOString()
    },
    safetyStatus: 'SAFE',
    notificationsEnabled: true,
    voiceAlertsEnabled: true,
    smsAlertsEnabled: true,
    emergencyContacts: [
      { id: 'ec-1', name: 'National Emergency Helpline', phone: '112', relation: 'Disaster Authority' },
      { id: 'ec-2', name: 'District Disaster Control (DDMA)', phone: '1078', relation: 'Disaster Cell' }
    ],
    authenticated: true
  });

  const service: ISensorService = activeServiceType === 'MOCK' ? mockSensorService : esp32SensorService;

  useEffect(() => {
    service.start();
    const unsubscribe = service.subscribe((snap) => {
      setSnapshot(snap);
    });

    const unsubscribeVoice = voiceAlertService.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      setSpeakingText(text);
    });

    return () => {
      unsubscribe();
      unsubscribeVoice();
      service.stop();
    };
  }, [service]);

  // Voice toggle sync
  useEffect(() => {
    voiceAlertService.updateSettings({ enabled: voiceEnabled });
  }, [voiceEnabled]);

  // Risk Calculations
  const floodReading = snapshot.primaryFloodNode?.lastReading || {
    waterLevel: 32.4,
    rateOfRise: 0.2,
    rainfall: false
  };

  const floodRisk = useMemo(() => {
    return calculateFloodRisk(
      floodReading.waterLevel,
      floodReading.rateOfRise || 0,
      floodReading.rainfall
    );
  }, [floodReading.waterLevel, floodReading.rateOfRise, floodReading.rainfall]);

  const wildfireReading = snapshot.primaryWildfireNode?.lastReading || {
    temperature: 27.2,
    humidity: 63.5,
    smokeLevel: 'LOW' as const,
    smokePpm: 38,
    windSpeed: 14
  };

  const wildfireRisk = useMemo(() => {
    return calculateWildfireRisk(
      wildfireReading.temperature,
      wildfireReading.humidity,
      wildfireReading.smokeLevel,
      wildfireReading.smokePpm,
      wildfireReading.windSpeed
    );
  }, [
    wildfireReading.temperature,
    wildfireReading.humidity,
    wildfireReading.smokeLevel,
    wildfireReading.smokePpm,
    wildfireReading.windSpeed
  ]);

  const heatwaveRisk: RiskAssessment = useMemo(() => {
    const valleyNode = snapshot.nodes.find((n) => n.id === 'VALLEY-01');
    const temp = valleyNode?.lastReading?.temperature ?? 31.0;
    const score = Math.round(Math.min(100, Math.max(0, ((temp - 24) / 16) * 70)));
    return {
      hazard: 'heatwave',
      riskScore: score,
      riskLevel: getRiskLevel(score),
      trend: 'stable',
      factors: [
        { name: 'Valley Temperature', weight: 60, score: Math.round(score * 0.6), valueDisplay: `${temp.toFixed(1)}°C`, status: score > 50 ? 'elevated' : 'normal', detail: 'Daytime surface thermal convection' },
        { name: 'Solar UV Insolation', weight: 40, score: Math.round(score * 0.4), valueDisplay: '7.8 UVI', status: 'normal', detail: 'Clear atmosphere exposure' }
      ],
      reasons: ['Elevated seasonal ambient daytime temperature in low-lying valley basin'],
      recommendedAction: 'Standard heat advisory notice for outdoor workers.',
      timestamp: new Date().toISOString()
    };
  }, [snapshot.nodes]);

  const landslideRisk: RiskAssessment = useMemo(() => {
    const hillNode = snapshot.nodes.find((n) => n.id === 'HILL-01');
    const soil = hillNode?.lastReading?.soilMoisture ?? 42;
    const score = Math.round(Math.min(100, Math.max(0, (soil / 80) * 35)));
    return {
      hazard: 'landslide',
      riskScore: score,
      riskLevel: getRiskLevel(score),
      trend: 'stable',
      factors: [
        { name: 'Geotechnical Soil Moisture', weight: 60, score: Math.round(score * 0.6), valueDisplay: `${soil}%`, status: 'normal', detail: 'Pore pressure remains within slope shear threshold' },
        { name: 'Slope Inclinometer Drift', weight: 40, score: Math.round(score * 0.4), valueDisplay: '0.02°', status: 'normal', detail: 'Sub-millimeter displacement baseline' }
      ],
      reasons: ['Slope pore water pressure below critical liquefaction gradient'],
      recommendedAction: 'Continuous stability telemetry logging.',
      timestamp: new Date().toISOString()
    };
  }, [snapshot.nodes]);

  // Dynamic Geofenced Hazard Calculation based on Citizen's Location
  const nearbyHazards: GeofencedHazard[] = useMemo(() => {
    const list: GeofencedHazard[] = [];
    const userLat = currentUser.location.latitude;
    const userLng = currentUser.location.longitude;

    // Check flood node River-02
    const floodNode = snapshot.nodes.find((n) => n.id === 'RIVER-02');
    if (floodNode) {
      const dist = calculateDistanceKm(userLat, userLng, floodNode.latitude, floodNode.longitude);
      if (floodRisk.riskLevel === 'CRITICAL' || floodRisk.riskLevel === 'HIGH' || dist <= 5.0) {
        list.push({
          id: 'geo-flood',
          hazardType: 'flood',
          riskLevel: floodRisk.riskLevel,
          riskScore: floodRisk.riskScore,
          title: floodRisk.riskLevel === 'CRITICAL' ? 'Critical Flood Warning' : 'Flood Watch Advisory',
          distanceKm: dist,
          zoneName: floodNode.zone,
          whatHappened: `Water depth reached ${floodReading.waterLevel.toFixed(1)} cm with rate of rise at +${floodReading.rateOfRise?.toFixed(1) || '0.2'} cm/min.`,
          whyMatters: 'Drainage basin inflow exceeds embankment threshold, presenting localized inundation risk.',
          whatToDo: [
            'Move to higher ground or nearest shelter immediately.',
            'Avoid low-lying underpasses and river banks.',
            'Keep battery phone charged and follow official DDMA broadcasts.'
          ],
          issuedAt: new Date().toLocaleTimeString(),
          timeAgo: 'Just now',
          affectedRadiusKm: 4.5,
          confirmedByMultiSensor: floodReading.rainfall && (floodReading.rateOfRise || 0) > 1.5
        });
      }
    }

    // Check wildfire node Forest-01
    const fireNode = snapshot.nodes.find((n) => n.id === 'FOREST-01');
    if (fireNode) {
      const dist = calculateDistanceKm(userLat, userLng, fireNode.latitude, fireNode.longitude);
      if (wildfireRisk.riskLevel === 'CRITICAL' || wildfireRisk.riskLevel === 'HIGH' || dist <= 5.0) {
        list.push({
          id: 'geo-fire',
          hazardType: 'wildfire',
          riskLevel: wildfireRisk.riskLevel,
          riskScore: wildfireRisk.riskScore,
          title: wildfireRisk.riskLevel === 'CRITICAL' ? 'Potential Wildfire Alert' : 'Forest Thermal Warning',
          distanceKm: dist,
          zoneName: fireNode.zone,
          whatHappened: `Thermal rise to ${wildfireReading.temperature.toFixed(1)}°C with smoke anomaly at ${wildfireReading.smokePpm} ppm.`,
          whyMatters: 'Combustible canopy conditions moving synchronously into high-ignition profile.',
          whatToDo: [
            'Cover face with wet cloth / mask to prevent smoke inhalation.',
            'Evacuate perpendicular to wind direction away from dense forest ridge.',
            'Report open fire plumes to local forestry range officer.'
          ],
          issuedAt: new Date().toLocaleTimeString(),
          timeAgo: 'Just now',
          affectedRadiusKm: 3.8,
          confirmedByMultiSensor: wildfireReading.temperature > 32 && wildfireReading.smokeLevel === 'HIGH'
        });
      }
    }

    // Sort by proximity and severity
    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [currentUser.location, snapshot.nodes, floodRisk, wildfireRisk, floodReading, wildfireReading]);

  // Derive Citizen Safety Status (Green, Yellow, Orange, Red)
  const citizenSafetyStatus: CitizenSafetyStatus = useMemo(() => {
    if (nearbyHazards.some((h) => h.riskLevel === 'CRITICAL' && h.distanceKm <= 4.0)) {
      return 'CRITICAL';
    }
    if (nearbyHazards.some((h) => h.riskLevel === 'HIGH' && h.distanceKm <= 6.0)) {
      return 'HIGH_RISK';
    }
    if (nearbyHazards.some((h) => (h.riskLevel === 'WATCH' || h.riskLevel === 'HIGH') && h.distanceKm <= 8.0)) {
      return 'BE_ALERT';
    }
    return 'SAFE';
  }, [nearbyHazards]);

  // Safe Locations sorted with calculated distance
  const closestSafeLocations: SafeLocation[] = useMemo(() => {
    const userLat = currentUser.location.latitude;
    const userLng = currentUser.location.longitude;
    return (snapshot.safeLocations || []).map((loc) => ({
      ...loc,
      distanceKm: calculateDistanceKm(userLat, userLng, loc.latitude, loc.longitude)
    })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [currentUser.location, snapshot.safeLocations]);

  const updateUserLocation = (loc: Partial<UserLocation>) => {
    setCurrentUser((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        ...loc,
        timestamp: new Date().toISOString()
      }
    }));
  };

  const requestDeviceLocation = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateUserLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracyMeters: Math.round(pos.coords.accuracy),
              areaName: 'Current GPS Location'
            });
            resolve(true);
          },
          (err) => {
            console.warn('Geolocation access denied or unavailable', err);
            resolve(false);
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      });
    }
    return false;
  };

  const handleSetScenario = (scenario: SimulationScenario) => {
    service.setScenario(scenario);
  };

  const handleResetToNormal = () => {
    service.resetToNormal();
  };

  const handleSimulateNetworkFailure = () => {
    service.simulateNetworkFailure();
  };

  const handleRestoreConnection = () => {
    service.restoreConnection();
  };

  const handleAcknowledgeAlert = (id: string) => {
    service.acknowledgeAlert(id);
  };

  const handleTestVoice = () => {
    voiceAlertService.testAlert();
  };

  return (
    <EarthSyncContext.Provider
      value={{
        snapshot,
        appRole,
        setAppRole,
        language,
        setLanguage,
        currentUser,
        setCurrentUser,
        activeServiceType,
        setActiveServiceType,
        floodRisk,
        wildfireRisk,
        heatwaveRisk,
        landslideRisk,
        citizenSafetyStatus,
        nearbyHazards,
        closestSafeLocations,
        alerts: snapshot.alerts,
        isOffline: Boolean(snapshot.isEdgeMode || !snapshot.isCloudConnected),
        isHardwareConnected: Boolean(snapshot.isCloudConnected && activeServiceType === 'ESP32'),
        isSpeaking,
        speakingText,
        voiceEnabled,
        setVoiceEnabled,
        voiceMuted: !voiceEnabled,
        setVoiceMuted: (muted: boolean) => setVoiceEnabled(!muted),
        playVoiceAlert: (text: string) => voiceAlertService.speak(text),
        testVoice: handleTestVoice,
        setScenario: handleSetScenario,
        resetToNormal: handleResetToNormal,
        simulateNetworkFailure: handleSimulateNetworkFailure,
        restoreConnection: handleRestoreConnection,
        acknowledgeAlert: handleAcknowledgeAlert,
        demoMode,
        setDemoMode,
        updateUserLocation,
        requestDeviceLocation
      }}
    >
      {children}
    </EarthSyncContext.Provider>
  );
};

export const useEarthSync = () => {
  const context = useContext(EarthSyncContext);
  if (!context) {
    throw new Error('useEarthSync must be used within an EarthSyncProvider');
  }
  return context;
};
