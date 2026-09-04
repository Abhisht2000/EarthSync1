import { SensorNode, HistoricalReading, SensorReading } from '../types/sensor';
import { ActionableAlert, TimelineEvent } from '../types/alert';
import { ISensorService, SimulationScenario, TelemetrySnapshot } from './ISensorService';
import { calculateFloodRisk, calculateWildfireRisk } from './riskEngine';
import { voiceAlertService } from './voiceAlertService';

export class MockSensorService implements ISensorService {
  private timer: any = null;
  private listeners: Array<(snapshot: TelemetrySnapshot) => void> = [];
  private activeScenario: SimulationScenario = 'NORMAL';
  private scenarioStep: number = 0;
  private isEdgeMode: boolean = false;
  private isCloudConnected: boolean = true;
  private bufferedEventsCount: number = 0;
  private lastSyncTime: string = new Date().toLocaleTimeString();

  // Primary telemetry values for simulation
  private waterLevel: number = 32.4;
  private prevWaterLevel: number = 32.0;
  private rainfall: boolean = false;
  private temperature: number = 27.2;
  private humidity: number = 63.5;
  private smokePpm: number = 38;
  private smokeLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  private windSpeed: number = 14;

  private nodes: SensorNode[] = [];
  private history: HistoricalReading[] = [];
  private alerts: ActionableAlert[] = [];
  private events: TimelineEvent[] = [];

  constructor() {
    this.initNodes();
    this.initHistory();
    this.initAlertsAndEvents();
  }

  private initNodes() {
    const baseNodes = [
      { id: 'FOREST-01', name: 'Forest Node 01 (Deep Ridge)', hazard: 'wildfire' as const, zone: 'Northern Forestry Zone 01', lat: 28.642, lng: 77.218, status: 'ONLINE' as const, bat: 94, rssi: -64, smoke: 'LOW' as const, smokePpm: 38, temp: 27.2, hum: 63 },
      { id: 'RIVER-02', name: 'River Node 02 (Lower Basin)', hazard: 'flood' as const, zone: 'Eastern River Drainage 02', lat: 28.618, lng: 77.245, status: 'ONLINE' as const, bat: 89, rssi: -71, water: 32.4, rain: false },
      { id: 'RIVER-01', name: 'River Node 01 (Headwaters)', hazard: 'flood' as const, zone: 'Upper Basin Catchment 01', lat: 28.665, lng: 77.230, status: 'ONLINE' as const, bat: 96, rssi: -68, water: 28.1, rain: false },
      { id: 'FOREST-02', name: 'Forest Node 02 (Canopy Pass)', hazard: 'wildfire' as const, zone: 'Western Perimeter 02', lat: 28.630, lng: 77.195, status: 'WARNING' as const, bat: 54, rssi: -82, smoke: 'LOW' as const, smokePpm: 45, temp: 28.4, hum: 59 },
      { id: 'HILL-01', name: 'Hill Node 01 (Escarpment)', hazard: 'landslide' as const, zone: 'Southern Terraces 04', lat: 28.585, lng: 77.220, status: 'ONLINE' as const, bat: 91, rssi: -65, soil: 42 },
      { id: 'HILL-02', name: 'Hill Node 02 (Upper Slope)', hazard: 'landslide' as const, zone: 'Rocky Incline 03', lat: 28.570, lng: 77.235, status: 'ONLINE' as const, bat: 83, rssi: -74, soil: 38 },
      { id: 'VALLEY-01', name: 'Valley Node 01 (Central Plains)', hazard: 'heatwave' as const, zone: 'Central Lowlands 01', lat: 28.625, lng: 77.210, status: 'ONLINE' as const, bat: 88, rssi: -69, temp: 31.0, hum: 51 },
      { id: 'VALLEY-02', name: 'Valley Node 02 (Crop Sector)', hazard: 'heatwave' as const, zone: 'Agricultural Sector 02', lat: 28.605, lng: 77.215, status: 'ONLINE' as const, bat: 76, rssi: -78, temp: 30.5, hum: 53 },
      { id: 'CANYON-01', name: 'Canyon Node 01 (Gorge Runoff)', hazard: 'flood' as const, zone: 'Canyon Funnel 01', lat: 28.650, lng: 77.260, status: 'ONLINE' as const, bat: 92, rssi: -67, water: 24.5, rain: false },
      { id: 'URBAN-01', name: 'Urban Node 01 (Outfall Culvert)', hazard: 'flood' as const, zone: 'Metropolitan Culvert 03', lat: 28.610, lng: 77.250, status: 'ONLINE' as const, bat: 85, rssi: -72, water: 29.8, rain: false },
      { id: 'FOOTHILL-01', name: 'Foothill Node 01 (Buffer Sector)', hazard: 'wildfire' as const, zone: 'Wildland Urban Interface', lat: 28.635, lng: 77.180, status: 'ONLINE' as const, bat: 95, rssi: -63, smoke: 'LOW' as const, smokePpm: 32, temp: 26.8, hum: 65 },
      { id: 'RESERVOIR-01', name: 'Reservoir Node 01 (Spillway Crest)', hazard: 'flood' as const, zone: 'Barrage Gate 02', lat: 28.675, lng: 77.252, status: 'OFFLINE' as const, bat: 12, rssi: -93, water: 44.1, rain: false },
    ];

    this.nodes = baseNodes.map((n) => ({
      id: n.id,
      name: n.name,
      hazardType: n.hazard,
      zone: n.zone,
      latitude: n.lat,
      longitude: n.lng,
      status: n.status,
      battery: n.bat,
      signalRssi: n.rssi,
      firmwareVersion: 'v2.4.1-esp32',
      lastUpdated: 'Just now',
      lastReading: {
        nodeId: n.id,
        timestamp: new Date().toISOString(),
        temperature: (n as any).temp ?? 27.0,
        humidity: (n as any).hum ?? 62.0,
        waterLevel: (n as any).water ?? 32.0,
        rainfall: (n as any).rain ?? false,
        smokePpm: (n as any).smokePpm ?? 35,
        smokeLevel: (n as any).smoke ?? 'LOW',
        windSpeed: 14,
        soilMoisture: (n as any).soil ?? 40,
        battery: n.bat,
        signalRssi: n.rssi,
        dataQuality: n.status === 'OFFLINE' ? 'OFFLINE' : n.status === 'WARNING' ? 'DEGRADED' : 'GOOD',
        rateOfRise: 0.2
      }
    }));
  }

  private initHistory() {
    const points: HistoricalReading[] = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now - i * 3600000);
      const hours = time.getHours().toString().padStart(2, '0') + ':00';
      // Mild diurnal oscillation
      const sinOffset = Math.sin((i / 24) * Math.PI * 2);
      points.push({
        timestamp: time.toISOString(),
        timeLabel: hours,
        waterLevel: Math.round((32 + sinOffset * 2.5 + Math.sin(i) * 0.8) * 10) / 10,
        temperature: Math.round((27 + sinOffset * 3.5) * 10) / 10,
        humidity: Math.round(62 - sinOffset * 6),
        smokePpm: Math.round(35 + Math.abs(Math.sin(i * 1.5)) * 8),
        rainfall: i < 3 ? 0 : 0,
        riskScore: Math.round(18 + Math.abs(sinOffset) * 8)
      });
    }
    this.history = points;
  }

  private initAlertsAndEvents() {
    this.alerts = [
      {
        id: 'alt-001',
        hazard: 'flood',
        level: 'WATCH',
        nodeId: 'RIVER-02',
        zone: 'Eastern River Drainage 02',
        riskScore: 38,
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        relativeTime: '14 min ago',
        what: 'Minor water-level elevation observed.',
        why: 'Upstream canal seasonal runoff variation detected.',
        action: 'Standard observation. Baseline remains within embankment margin.',
        acknowledged: false
      },
      {
        id: 'alt-002',
        hazard: 'wildfire',
        level: 'WATCH',
        nodeId: 'FOREST-02',
        zone: 'Western Perimeter 02',
        riskScore: 32,
        timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        relativeTime: '32 min ago',
        what: 'Subtle thermal gradient variance recorded.',
        why: 'Solar peak heating in canopy clearing with moderate dry wind.',
        action: 'Review infrared tower camera feeds across Western Ridge.',
        acknowledged: false
      },
      {
        id: 'alt-003',
        hazard: 'landslide',
        level: 'LOW',
        nodeId: 'HILL-01',
        zone: 'Southern Terraces 04',
        riskScore: 17,
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        relativeTime: '55 min ago',
        what: 'Soil moisture displacement test normal.',
        why: 'Routine geotechnical strain baseline check completed.',
        action: 'No intervention required.',
        acknowledged: true
      }
    ];

    const curTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });
    this.events = [
      { id: 'ev-1', timestamp: '12:00:15', hazard: 'flood', message: 'Sensor network routine heartbeat verified', level: 'info' },
      { id: 'ev-2', timestamp: '12:01:02', message: 'All 8 environmental telemetry zones operational', level: 'info' },
      { id: 'ev-3', timestamp: '12:02:18', hazard: 'flood', message: 'River-02 calibrated depth reading at 32.4 cm', level: 'info' },
      { id: 'ev-4', timestamp: '12:03:40', hazard: 'wildfire', message: 'Forest-01 atmospheric moisture in normal range', level: 'info' }
    ];
  }

  public start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 2500);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public subscribe(callback: (snapshot: TelemetrySnapshot) => void): () => void {
    this.listeners.push(callback);
    callback(this.getSnapshot());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    const snap = this.getSnapshot();
    this.listeners.forEach((cb) => cb(snap));
  }

  public setScenario(scenario: SimulationScenario) {
    this.activeScenario = scenario;
    this.scenarioStep = 0;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (scenario === 'FLOOD') {
      this.events.unshift({
        id: 'ev-' + Date.now(),
        timestamp: timeStr,
        hazard: 'flood',
        message: 'SIMULATION TRIGGERED: Hydrodynamic Flood Escalation Scenario started',
        level: 'watch',
        details: 'Simulating upstream precipitation and downstream river surge.'
      });
    } else if (scenario === 'WILDFIRE') {
      this.events.unshift({
        id: 'ev-' + Date.now(),
        timestamp: timeStr,
        hazard: 'wildfire',
        message: 'SIMULATION TRIGGERED: Thermal & Smoke Wildfire Escalation Scenario started',
        level: 'watch',
        details: 'Simulating ambient temperature rise, canopy drying, and smoke particulate surge.'
      });
    } else if (scenario === 'NORMAL') {
      this.resetToNormal();
    } else if (scenario === 'NETWORK_FAILURE') {
      this.simulateNetworkFailure();
    }

    this.notify();
  }

  public resetToNormal() {
    this.activeScenario = 'NORMAL';
    this.scenarioStep = 0;
    this.waterLevel = 32.4;
    this.prevWaterLevel = 32.0;
    this.rainfall = false;
    this.temperature = 27.2;
    this.humidity = 63.5;
    this.smokePpm = 38;
    this.smokeLevel = 'LOW';
    this.windSpeed = 14;
    this.isEdgeMode = false;
    this.isCloudConnected = true;
    this.bufferedEventsCount = 0;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.events.unshift({
      id: 'ev-' + Date.now(),
      timestamp: timeStr,
      message: 'System returned to NORMAL baseline equilibrium conditions',
      level: 'info'
    });

    this.initNodes();
    this.notify();
  }

  public simulateNetworkFailure() {
    this.isCloudConnected = false;
    this.isEdgeMode = true;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.events.unshift({
      id: 'ev-' + Date.now(),
      timestamp: timeStr,
      message: 'CLOUD LINK SEVERED: Switching to local Edge Resilient Monitoring Mode',
      level: 'watch',
      details: 'On-device local processing active. Telemetry and alerts stored in local buffer.'
    });
    this.bufferedEventsCount += 1;
    this.notify();
  }

  public restoreConnection() {
    this.isCloudConnected = true;
    this.isEdgeMode = false;
    const syncedCount = this.bufferedEventsCount;
    this.bufferedEventsCount = 0;
    this.lastSyncTime = new Date().toLocaleTimeString();

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.events.unshift({
      id: 'ev-' + Date.now(),
      timestamp: timeStr,
      message: `CLOUD CONNECTION RESTORED: ${syncedCount} buffered edge events synchronized with command center`,
      level: 'info'
    });
    this.notify();
  }

  public acknowledgeAlert(id: string) {
    this.alerts = this.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
    this.notify();
  }

  /**
   * Main simulation tick cycle (runs every 2.5 seconds)
   */
  private tick() {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (this.isEdgeMode) {
      this.bufferedEventsCount += 1;
    }

    if (this.activeScenario === 'FLOOD') {
      this.scenarioStep += 1;
      this.prevWaterLevel = this.waterLevel;

      // Stage 1: Rain initiates
      if (this.scenarioStep === 1) {
        this.rainfall = true;
        this.waterLevel = 36.2;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'flood',
          message: 'Rainfall sensor triggered: Active precipitation detected in drainage basin',
          level: 'info'
        });
      }
      // Stage 2: Steady rise to 46 cm
      else if (this.scenarioStep === 2) {
        this.waterLevel = 46.5;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'flood',
          message: 'Water level reached 46.5 cm. Inflow accelerating.',
          level: 'watch'
        });
      }
      // Stage 3: Rapid rise to 58 cm
      else if (this.scenarioStep === 3) {
        this.waterLevel = 58.2;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'flood',
          message: 'Rapid rise detected (+4.7 cm/min). Flood risk increased to 68%',
          level: 'high'
        });
        voiceAlertService.speakFloodWarning('HIGH');
      }
      // Stage 4: Critical threshold breach at 71 cm
      else if (this.scenarioStep === 4) {
        this.waterLevel = 71.8;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'flood',
          message: 'CRITICAL THRESHOLD BREACHED: Water level at 71.8 cm. Automated siren & voice dispatch engaged.',
          level: 'critical'
        });
        voiceAlertService.speakFloodWarning('CRITICAL');

        // Push new Critical Alert
        this.alerts.unshift({
          id: 'alt-flood-' + Date.now(),
          hazard: 'flood',
          level: 'CRITICAL',
          nodeId: 'RIVER-02',
          zone: 'Eastern River Drainage 02',
          riskScore: 88,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          what: 'Extreme surge rate of rise and critical water level.',
          why: 'Sustained rain catchment influx exceeding secondary retention banks.',
          action: 'Immediately alert downstream emergency personnel and verify drainage floodgates.',
          acknowledged: false
        });
      }
      // Stage 5+: Plateau at high level with minor natural ripples
      else {
        this.waterLevel = 72.0 + Math.sin(this.scenarioStep) * 0.9;
      }
    } else if (this.activeScenario === 'WILDFIRE') {
      this.scenarioStep += 1;

      // Stage 1: Temperature rising, humidity dropping
      if (this.scenarioStep === 1) {
        this.temperature = 29.4;
        this.humidity = 58.0;
        this.smokePpm = 52;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'wildfire',
          message: 'Thermal anomaly: Ambient temperature climbed to 29.4°C',
          level: 'info'
        });
      }
      // Stage 2: Dry air, smoke anomaly emerges
      else if (this.scenarioStep === 2) {
        this.temperature = 31.8;
        this.humidity = 49.0;
        this.smokeLevel = 'MEDIUM';
        this.smokePpm = 115;
        this.windSpeed = 19;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'wildfire',
          message: 'Relative humidity dropped below 50%. Moderate particulate smoke detected.',
          level: 'watch'
        });
      }
      // Stage 3: High risk crossing
      else if (this.scenarioStep === 3) {
        this.temperature = 33.4;
        this.humidity = 44.0;
        this.smokeLevel = 'HIGH';
        this.smokePpm = 230;
        this.windSpeed = 22;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'wildfire',
          message: 'Smoke anomaly detected alongside increasing temperature (+2.4°C/hr). High Fire Risk.',
          level: 'high'
        });
        voiceAlertService.speakWildfireWarning('HIGH');
      }
      // Stage 4: Critical fire condition
      else if (this.scenarioStep === 4) {
        this.temperature = 34.6;
        this.humidity = 39.0;
        this.smokeLevel = 'HIGH';
        this.smokePpm = 380;
        this.windSpeed = 25;
        this.events.unshift({
          id: 'ev-' + Date.now(),
          timestamp: timeStr,
          hazard: 'wildfire',
          message: 'POTENTIAL WILDFIRE RISK: Critical flame & smoke indices detected in Forest Zone 01',
          level: 'critical'
        });
        voiceAlertService.speakWildfireWarning('CRITICAL');

        this.alerts.unshift({
          id: 'alt-fire-' + Date.now(),
          hazard: 'wildfire',
          level: 'CRITICAL',
          nodeId: 'FOREST-01',
          zone: 'Northern Forestry Zone 01',
          riskScore: 89,
          timestamp: new Date().toISOString(),
          relativeTime: 'Just now',
          what: 'Critical combustible condition: high heat, extreme low humidity, and heavy particulate smoke.',
          why: 'Multiple environmental indicators are moving synchronously into wildfire ignition profile.',
          action: 'Dispatch forestry aerial drone inspection; mobilize sector fire defense unit.',
          acknowledged: false
        });
      } else {
        this.temperature = 34.8 + Math.sin(this.scenarioStep) * 0.4;
        this.smokePpm = 385 + Math.round(Math.sin(this.scenarioStep) * 15);
      }
    } else {
      // NORMAL MODE: Realistic organic micro-variations
      const time = Date.now() / 10000;
      this.waterLevel = Math.round((32.0 + Math.sin(time) * 0.4) * 10) / 10;
      this.temperature = Math.round((27.2 + Math.cos(time * 0.7) * 0.3) * 10) / 10;
      this.humidity = Math.round(63.5 + Math.sin(time * 0.5) * 1.0);
      this.smokePpm = Math.round(38 + Math.abs(Math.sin(time * 1.2)) * 4);
      this.prevWaterLevel = this.waterLevel - 0.05;
    }

    // Rate of rise calculation (cm / min)
    const rateOfRise = Math.round(((this.waterLevel - this.prevWaterLevel) / 0.0416) * 10) / 10;

    // Update primary target nodes
    this.nodes = this.nodes.map((node) => {
      if (node.id === 'RIVER-02') {
        const floodRisk = calculateFloodRisk(this.waterLevel, rateOfRise, this.rainfall);
        return {
          ...node,
          status: floodRisk.riskLevel === 'CRITICAL' ? 'CRITICAL' : floodRisk.riskLevel === 'HIGH' ? 'WARNING' : 'ONLINE',
          lastReading: {
            ...node.lastReading,
            waterLevel: this.waterLevel,
            rainfall: this.rainfall,
            rateOfRise,
            timestamp: new Date().toISOString(),
            dataQuality: this.isEdgeMode ? 'DEGRADED' : 'GOOD'
          }
        };
      }
      if (node.id === 'FOREST-01') {
        const fireRisk = calculateWildfireRisk(this.temperature, this.humidity, this.smokeLevel, this.smokePpm, this.windSpeed);
        return {
          ...node,
          status: fireRisk.riskLevel === 'CRITICAL' ? 'CRITICAL' : fireRisk.riskLevel === 'HIGH' ? 'WARNING' : 'ONLINE',
          lastReading: {
            ...node.lastReading,
            temperature: this.temperature,
            humidity: this.humidity,
            smokePpm: this.smokePpm,
            smokeLevel: this.smokeLevel,
            windSpeed: this.windSpeed,
            timestamp: new Date().toISOString(),
            dataQuality: this.isEdgeMode ? 'DEGRADED' : 'GOOD'
          }
        };
      }
      return node;
    });

    // Update rolling history point
    const currentFloodRisk = calculateFloodRisk(this.waterLevel, rateOfRise, this.rainfall);
    const currentFireRisk = calculateWildfireRisk(this.temperature, this.humidity, this.smokeLevel, this.smokePpm, this.windSpeed);
    const maxRisk = Math.max(currentFloodRisk.riskScore, currentFireRisk.riskScore);

    const newPoint: HistoricalReading = {
      timestamp: new Date().toISOString(),
      timeLabel: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      waterLevel: this.waterLevel,
      temperature: this.temperature,
      humidity: this.humidity,
      smokePpm: this.smokePpm,
      rainfall: this.rainfall ? 1 : 0,
      riskScore: maxRisk
    };

    this.history = [...this.history.slice(1), newPoint];

    this.notify();
  }

  public getSnapshot(): TelemetrySnapshot {
    const primaryFloodNode = this.nodes.find((n) => n.id === 'RIVER-02') || this.nodes[1];
    const primaryWildfireNode = this.nodes.find((n) => n.id === 'FOREST-01') || this.nodes[0];

    return {
      nodes: [...this.nodes],
      primaryFloodNode,
      primaryWildfireNode,
      history: [...this.history],
      alerts: [...this.alerts],
      events: [...this.events],
      activeScenario: this.activeScenario,
      scenarioStep: this.scenarioStep,
      isEdgeMode: this.isEdgeMode,
      isCloudConnected: this.isCloudConnected,
      bufferedEventsCount: this.bufferedEventsCount,
      lastSyncTime: this.lastSyncTime
    };
  }
}

export const mockSensorService = new MockSensorService();
