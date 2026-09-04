import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ISensorService, SimulationScenario, TelemetrySnapshot } from '../services/ISensorService';
import { mockSensorService } from '../services/mockSensorService';
import { esp32SensorService } from '../services/esp32SensorService';
import { calculateFloodRisk, calculateWildfireRisk, getRiskLevel } from '../services/riskEngine';
import { voiceAlertService } from '../services/voiceAlertService';
import { RiskAssessment } from '../types/risk';

interface EarthSyncContextType {
  snapshot: TelemetrySnapshot;
  activeServiceType: 'MOCK' | 'ESP32';
  setActiveServiceType: (type: 'MOCK' | 'ESP32') => void;
  floodRisk: RiskAssessment;
  wildfireRisk: RiskAssessment;
  heatwaveRisk: RiskAssessment;
  landslideRisk: RiskAssessment;
  isSpeaking: boolean;
  speakingText: string;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  testVoice: () => void;
  setScenario: (scenario: SimulationScenario) => void;
  resetToNormal: () => void;
  simulateNetworkFailure: () => void;
  restoreConnection: () => void;
  acknowledgeAlert: (id: string) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

const EarthSyncContext = createContext<EarthSyncContextType | undefined>(undefined);

export const EarthSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeServiceType, setActiveServiceType] = useState<'MOCK' | 'ESP32'>('MOCK');
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() => mockSensorService.getSnapshot());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Active service instance
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

  // Dynamic Risk calculations based on current node telemetry
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

  // Heatwave & Landslide assessments for multi-hazard overview
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
      recommendedAction: 'Standard heat advisory notice for agricultural workers.',
      timestamp: new Date().toISOString()
    };
  }, [snapshot.nodes]);

  const landslideRisk: RiskAssessment = useMemo(() => {
    const hillNode = snapshot.nodes.find((n) => n.id === 'HILL-01');
    const soil = hillNode?.lastReading?.soilMoisture ?? 42;
    // Soil saturation risk
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
        activeServiceType,
        setActiveServiceType,
        floodRisk,
        wildfireRisk,
        heatwaveRisk,
        landslideRisk,
        isSpeaking,
        speakingText,
        voiceEnabled,
        setVoiceEnabled,
        testVoice: handleTestVoice,
        setScenario: handleSetScenario,
        resetToNormal: handleResetToNormal,
        simulateNetworkFailure: handleSimulateNetworkFailure,
        restoreConnection: handleRestoreConnection,
        acknowledgeAlert: handleAcknowledgeAlert,
        demoMode,
        setDemoMode
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
