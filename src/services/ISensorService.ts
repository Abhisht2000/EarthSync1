import { SensorReading, SensorNode, HistoricalReading } from '../types/sensor';
import { ActionableAlert, TimelineEvent } from '../types/alert';

export type SimulationScenario = 'NORMAL' | 'FLOOD' | 'WILDFIRE' | 'NETWORK_FAILURE';

export interface TelemetrySnapshot {
  nodes: SensorNode[];
  primaryFloodNode: SensorNode;
  primaryWildfireNode: SensorNode;
  history: HistoricalReading[];
  alerts: ActionableAlert[];
  events: TimelineEvent[];
  activeScenario: SimulationScenario;
  scenarioStep: number;
  isEdgeMode: boolean;
  isCloudConnected: boolean;
  bufferedEventsCount: number;
  lastSyncTime: string;
}

export interface ISensorService {
  start(): void;
  stop(): void;
  subscribe(callback: (snapshot: TelemetrySnapshot) => void): () => void;
  getSnapshot(): TelemetrySnapshot;
  setScenario(scenario: SimulationScenario): void;
  resetToNormal(): void;
  simulateNetworkFailure(): void;
  restoreConnection(): void;
  acknowledgeAlert(id: string): void;
}
