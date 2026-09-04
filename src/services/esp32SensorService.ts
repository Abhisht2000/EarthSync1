import { SensorNode, HistoricalReading, SensorReading } from '../types/sensor';
import { ActionableAlert, TimelineEvent } from '../types/alert';
import { ISensorService, SimulationScenario, TelemetrySnapshot } from './ISensorService';
import { calculateFloodRisk, calculateWildfireRisk } from './riskEngine';

/**
 * ESP32SensorService
 * Live hardware connection bridge via WebSocket or REST.
 * Allows seamless drop-in replacement of MockSensorService.
 */
export class ESP32SensorService implements ISensorService {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private listeners: Array<(snapshot: TelemetrySnapshot) => void> = [];
  private snapshot: TelemetrySnapshot;

  constructor() {
    this.wsUrl = this.resolveWsUrl();

    // Initial baseline snapshot
    this.snapshot = {
      nodes: [],
      primaryFloodNode: {} as SensorNode,
      primaryWildfireNode: {} as SensorNode,
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
    // 1. Check Vite environment variable
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    // 2. Derive automatically from browser window location (wss:// on https, ws:// on http)
    if (typeof window !== 'undefined') {
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      return `${proto}${window.location.host}/ws`;
    }
    // 3. Server-side fallback
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
            this.snapshot = data.payload;
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
        // Reconnect attempt after 4s
        setTimeout(() => {
          if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
            this.connectWs();
          }
        }, 4000);
      };
    } catch (err) {
      console.warn('Backend WebSocket unavailable, fallback to mock mode recommended', err);
    }
  }

  private handleIncomingReading(reading: SensorReading) {
    // Update node with real ESP32 telemetry
    const idx = this.snapshot.nodes.findIndex((n) => n.id === reading.nodeId);
    if (idx !== -1) {
      this.snapshot.nodes[idx].lastReading = reading;
      this.snapshot.nodes[idx].lastUpdated = 'Just now';
    }
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
