import { SensorNode, HistoricalReading, SensorReading } from '../types/sensor';
import { ActionableAlert, TimelineEvent } from '../types/alert';
import { RaspberryPiGateway, CitizenImpactSummary } from '../types/gateway';
import { SafeLocation } from '../types/citizen';
import { ISensorService, SimulationScenario, TelemetrySnapshot } from './ISensorService';
import { calculateFloodRisk, calculateWildfireRisk } from './riskEngine';

/**
 * ESP32SensorService
 * Live hardware connection bridge via WebSocket or REST.
 * Provides instant fallback with seamless drop-in replacement of MockSensorService.
 */
export class ESP32SensorService implements ISensorService {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private listeners: Array<(snapshot: TelemetrySnapshot) => void> = [];
  private snapshot: TelemetrySnapshot;

  constructor() {
    this.wsUrl = this.resolveWsUrl();

    // Initialize with standard 12-node network topology to ensure instant map & dashboard readiness
    const baseNodes: SensorNode[] = [
      {
        id: 'FOREST-01',
        name: 'Forest Node 01 (Deep Ridge)',
        hazardType: 'wildfire',
        zone: 'Northern Forestry Zone 01',
        latitude: 28.642,
        longitude: 77.218,
        status: 'ONLINE',
        battery: 94,
        signalRssi: -64,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'FOREST-01',
          timestamp: new Date().toISOString(),
          temperature: 27.2,
          humidity: 63.5,
          waterLevel: 0,
          rainfall: false,
          smokePpm: 38,
          smokeLevel: 'LOW',
          windSpeed: 14,
          battery: 94,
          signalRssi: -64,
          dataQuality: 'GOOD'
        }
      },
      {
        id: 'RIVER-02',
        name: 'River Node 02 (Lower Basin)',
        hazardType: 'flood',
        zone: 'Eastern River Drainage 02',
        latitude: 28.618,
        longitude: 77.245,
        status: 'ONLINE',
        battery: 89,
        signalRssi: -71,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'RIVER-02',
          timestamp: new Date().toISOString(),
          temperature: 28.0,
          humidity: 65.0,
          waterLevel: 32.4,
          rateOfRise: 0.2,
          rainfall: false,
          smokePpm: 30,
          smokeLevel: 'LOW',
          windSpeed: 12,
          battery: 89,
          signalRssi: -71,
          dataQuality: 'GOOD'
        }
      },
      {
        id: 'RIVER-01',
        name: 'River Node 01 (Headwaters)',
        hazardType: 'flood',
        zone: 'Upper Basin Catchment 01',
        latitude: 28.665,
        longitude: 77.230,
        status: 'ONLINE',
        battery: 96,
        signalRssi: -68,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'RIVER-01',
          timestamp: new Date().toISOString(),
          temperature: 26.5,
          humidity: 68.0,
          waterLevel: 28.1,
          rateOfRise: 0.1,
          rainfall: false,
          smokePpm: 25,
          smokeLevel: 'LOW',
          windSpeed: 10,
          battery: 96,
          signalRssi: -68,
          dataQuality: 'GOOD'
        }
      },
      {
        id: 'FOREST-02',
        name: 'Forest Node 02 (Canopy Pass)',
        hazardType: 'wildfire',
        zone: 'Western Perimeter 02',
        latitude: 28.630,
        longitude: 77.195,
        status: 'WARNING',
        battery: 54,
        signalRssi: -82,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'FOREST-02',
          timestamp: new Date().toISOString(),
          temperature: 28.4,
          humidity: 59.0,
          waterLevel: 0,
          rainfall: false,
          smokePpm: 45,
          smokeLevel: 'LOW',
          windSpeed: 16,
          battery: 54,
          signalRssi: -82,
          dataQuality: 'DEGRADED'
        }
      },
      {
        id: 'HILL-01',
        name: 'Hill Node 01 (Escarpment)',
        hazardType: 'landslide',
        zone: 'Southern Terraces 04',
        latitude: 28.585,
        longitude: 77.220,
        status: 'ONLINE',
        battery: 91,
        signalRssi: -65,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'HILL-01',
          timestamp: new Date().toISOString(),
          temperature: 27.0,
          humidity: 62.0,
          waterLevel: 0,
          rainfall: false,
          smokePpm: 32,
          smokeLevel: 'LOW',
          windSpeed: 11,
          soilMoisture: 42,
          battery: 91,
          signalRssi: -65,
          dataQuality: 'GOOD'
        }
      },
      {
        id: 'VALLEY-01',
        name: 'Valley Node 01 (Central Plains)',
        hazardType: 'heatwave',
        zone: 'Central Lowlands 01',
        latitude: 28.625,
        longitude: 77.210,
        status: 'ONLINE',
        battery: 88,
        signalRssi: -69,
        firmwareVersion: 'v2.4.1-esp32',
        lastUpdated: 'Just now',
        lastReading: {
          nodeId: 'VALLEY-01',
          timestamp: new Date().toISOString(),
          temperature: 31.0,
          humidity: 51.0,
          waterLevel: 0,
          rainfall: false,
          smokePpm: 35,
          smokeLevel: 'LOW',
          windSpeed: 14,
          battery: 88,
          signalRssi: -69,
          dataQuality: 'GOOD'
        }
      }
    ];

    const safeLocations: SafeLocation[] = [
      {
        id: 'LOC-SH-01',
        name: 'Central District Community Relief Center',
        hindiName: 'केंद्रीय जिला सामुदायिक राहत केंद्र',
        type: 'shelter',
        latitude: 28.630,
        longitude: 77.235,
        address: 'Near Civil Lines, Sector 4, New Delhi',
        contactPhone: '011-23998877',
        capacity: 500,
        availableCapacity: 340,
        isOperational: true
      },
      {
        id: 'LOC-HOSP-01',
        name: 'Apex Government Emergency Hospital',
        hindiName: 'शीर्ष सरकारी आपातकालीन अस्पताल',
        type: 'hospital',
        latitude: 28.615,
        longitude: 77.215,
        address: 'Ring Road, North Block, New Delhi',
        contactPhone: '102 / 011-26588500',
        capacity: 350,
        availableCapacity: 85,
        isOperational: true
      },
      {
        id: 'LOC-EVAC-01',
        name: 'Higher Ground Evacuation Assembly Area',
        hindiName: 'सुरक्षित ऊंचाई निकासी सभा क्षेत्र',
        type: 'evacuation_point',
        latitude: 28.655,
        longitude: 77.225,
        address: 'Ridge Forest Elevated Grounds, New Delhi',
        contactPhone: '1078',
        capacity: 1200,
        availableCapacity: 1200,
        isOperational: true
      }
    ];

    const gateways: RaspberryPiGateway[] = [
      {
        id: 'GW-RPI-01',
        name: 'Raspberry Pi Gateway (Ridge Station 01)',
        zone: 'Northern Ridge Sector',
        latitude: 28.640,
        longitude: 77.220,
        status: 'ONLINE',
        loraStatus: 'ACTIVE',
        loraFrequency: '868.1 MHz (IN865 Band)',
        packetsReceivedTotal: 14820,
        packetsPerMinute: 48,
        packetLossRatePct: 0.2,
        connectedNodesCount: 6,
        cellularBackhaul: {
          carrier: 'Jio 4G LTE Edge',
          signalBars: 4,
          status: 'CONNECTED',
          ipAddress: '192.168.1.100'
        },
        localStorage: {
          dbEngine: 'SQLite 3.42 (Local Edge Buffer)',
          bufferedEvents: 0,
          syncPending: false,
          lastSyncedAt: 'Just now'
        },
        power: {
          solarActive: true,
          solarInputWatts: 42.5,
          batteryPct: 96,
          voltage: 12.8
        },
        firmwareVersion: 'v3.1.0-rpi4',
        uptimeHours: 342,
        lastHeartbeat: new Date().toISOString()
      },
      {
        id: 'GW-RPI-02',
        name: 'Raspberry Pi Gateway (River Basin 02)',
        zone: 'Eastern Drainage Sector',
        latitude: 28.620,
        longitude: 77.240,
        status: 'ONLINE',
        loraStatus: 'ACTIVE',
        loraFrequency: '868.3 MHz (IN865 Band)',
        packetsReceivedTotal: 12450,
        packetsPerMinute: 42,
        packetLossRatePct: 0.4,
        connectedNodesCount: 6,
        cellularBackhaul: {
          carrier: 'Airtel 4G LTE IoT',
          signalBars: 5,
          status: 'CONNECTED',
          ipAddress: '192.168.1.101'
        },
        localStorage: {
          dbEngine: 'SQLite 3.42 (Local Edge Buffer)',
          bufferedEvents: 0,
          syncPending: false,
          lastSyncedAt: 'Just now'
        },
        power: {
          solarActive: true,
          solarInputWatts: 38.0,
          batteryPct: 92,
          voltage: 12.6
        },
        firmwareVersion: 'v3.1.0-rpi4',
        uptimeHours: 298,
        lastHeartbeat: new Date().toISOString()
      }
    ];

    // These are layout placeholders only.  Until a backend snapshot or an ESP
    // heartbeat arrives, never represent them as connected field hardware.
    baseNodes.forEach((node) => {
      node.status = 'OFFLINE';
      node.lastUpdated = 'Awaiting device heartbeat';
    });

    this.snapshot = {
      nodes: baseNodes,
      primaryFloodNode: baseNodes[1],
      primaryWildfireNode: baseNodes[0],
      gateways,
      safeLocations,
      citizenImpact: {
        hazardId: 'flood',
        zoneName: 'Eastern River Drainage 02',
        affectedRadiusKm: 3.5,
        estimatedCitizenPopulation: 1420,
        notificationDelivery: {
          inAppDelivered: 1380,
          pushSent: 1350,
          pushDelivered: 1325,
          smsSent: 1280,
          smsDelivered: 1260,
          voiceCallsTriggered: 14,
          totalAcknowledged: 920
        },
        sheltersOpenInZone: 2,
        shelterCapacityTotal: 850,
        shelterOccupancy: 120,
        lastCalculatedAt: new Date().toISOString()
      },
      history: [],
      alerts: [],
      events: [],
      activeScenario: 'NORMAL',
      scenarioStep: 0,
      isEdgeMode: false,
      isCloudConnected: false,
      bufferedEventsCount: 0,
      lastSyncTime: new Date().toLocaleTimeString()
    };
  }

  private resolveWsUrl(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    if (typeof window !== 'undefined') {
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      return `${proto}${window.location.hostname}:5000/ws`;
    }
    return 'ws://localhost:5000/ws';
  }

  public getWsUrl(): string {
    return this.wsUrl;
  }

  public setWsUrl(url: string) {
    if (!url || url === this.wsUrl) return;
    this.wsUrl = url;
    if (this.ws) {
      this.ws.close();
      this.connectWs();
    }
  }

  public start() {
    this.connectWs();
  }

  public stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private connectWs() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.snapshot.isCloudConnected = true;
        this.notify();
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SNAPSHOT') {
            this.snapshot = {
              ...this.snapshot,
              ...data.payload,
              isCloudConnected: true
            };
            this.notify();
          } else if (data.type === 'READING') {
            this.handleIncomingReading(data.payload);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket packet', e);
        }
      };
      this.ws.onclose = () => {
        this.snapshot.isCloudConnected = false;
        this.notify();
        setTimeout(() => {
          if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.connectWs();
          }
        }, 4000);
      };
    } catch (err) {
      console.warn('Backend WebSocket unavailable', err);
    }
  }

  private handleIncomingReading(reading: SensorReading) {
    const idx = this.snapshot.nodes.findIndex((n) => n.id === reading.nodeId);
    const hardwareReading = reading as SensorReading & { alarm?: boolean; alarmType?: string };
    const status: SensorNode['status'] = hardwareReading.alarm
      ? 'CRITICAL'
      : (reading.rainfall || reading.smokeLevel === 'MEDIUM' || reading.waterLevel >= 10)
        ? 'WARNING'
        : 'ONLINE';
    if (idx !== -1) {
      this.snapshot.nodes[idx].lastReading = reading;
      this.snapshot.nodes[idx].status = status;
      this.snapshot.nodes[idx].battery = reading.battery ?? this.snapshot.nodes[idx].battery;
      this.snapshot.nodes[idx].signalRssi = reading.signalRssi ?? this.snapshot.nodes[idx].signalRssi;
      this.snapshot.nodes[idx].lastUpdated = 'Just now';
      if (reading.waterLevel !== undefined) {
        this.snapshot.primaryFloodNode = this.snapshot.nodes[idx];
      }
      if (reading.smokePpm !== undefined || reading.temperature !== undefined) {
        this.snapshot.primaryWildfireNode = this.snapshot.nodes[idx];
      }
    } else {
      const newNode: SensorNode = {
        id: reading.nodeId,
        name: `NodeMCU ESP8266 (${reading.nodeId})`,
        hazardType: reading.waterLevel !== undefined ? 'flood' : 'wildfire',
        zone: 'Field Telemetry Sector',
        latitude: 28.625,
        longitude: 77.225,
        status,
        battery: reading.battery || 90,
        signalRssi: reading.signalRssi || -70,
        firmwareVersion: 'NodeMCU ESP8266',
        lastUpdated: 'Just now',
        lastReading: reading
      };
      this.snapshot.nodes.push(newNode);
    }
    this.snapshot.history = [
      ...this.snapshot.history,
      {
        nodeId: reading.nodeId,
        timestamp: reading.timestamp || new Date().toISOString(),
        timeLabel: new Date(reading.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        waterLevel: Number(reading.waterLevel) || 0,
        temperature: Number(reading.temperature) || 0,
        humidity: Number(reading.humidity) || 0,
        smokePpm: Number(reading.smokePpm) || 0,
        rainfall: reading.rainfall ? 1 : 0,
        riskScore: 0
      }
    ].slice(-120);
    this.notify();
  }

  public subscribe(callback: (snapshot: TelemetrySnapshot) => void): () => void {
    this.listeners.push(callback);
    callback(this.snapshot);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ ...this.snapshot }));
  }

  public getSnapshot(): TelemetrySnapshot {
    return { ...this.snapshot };
  }

  public setScenario(scenario: SimulationScenario): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SET_SCENARIO', scenario }));
    }
  }

  public resetToNormal(): void {
    this.setScenario('NORMAL');
  }

  public simulateNetworkFailure(): void {
    this.snapshot.isCloudConnected = false;
    this.snapshot.isEdgeMode = true;
    this.notify();
  }

  public restoreConnection(): void {
    this.snapshot.isCloudConnected = true;
    this.snapshot.isEdgeMode = false;
    this.notify();
  }

  public acknowledgeAlert(id: string): void {
    this.snapshot.alerts = this.snapshot.alerts.map((a) => (a.id === id ? { ...a, acknowledged: true } : a));
    this.notify();
  }
}

export const esp32SensorService = new ESP32SensorService();
